<script setup>
import {
    computed,
    ref,
    shallowRef,
    useTemplateRef,
    watch,
    nextTick,
    onMounted,
    onBeforeUnmount,
    defineAsyncComponent,
} from 'vue';
import {
    adaptColorToBackground,
    applyDataLabel,
    applyEllipsis,
    createCsvContent,
    createUid,
    dataLabel,
    downloadCsv,
    clampNumber,
    themePalettes,
    palette as PALETTE,
} from '../lib';
import { useConfig } from '../useConfig';
import { usePrinter } from '../usePrinter.js';
import { useNestedProp } from '../useNestedProp';
import { useThemeCheck } from '../useThemeCheck';
import { useTransitions } from '../useTransitions';
import { useChartExport } from '../useChartExport.js';
import { useUserOptionState } from '../useUserOptionState.js';
import { COMMON_RULES, useHints } from '../useHints';
import img from '../img';
import Title from '../atoms/Title.vue';
import themes from '../themes/vue_ui_hill.json';

const HillActions = defineAsyncComponent(
    () => import('../atoms/HillActions.vue'),
);
const UserOptions = defineAsyncComponent(
    () => import('../atoms/UserOptions.vue'),
);
const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);
const PenAndPaper = defineAsyncComponent(
    () => import('../atoms/PenAndPaper.vue'),
);
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));

const { vue_ui_hill: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        },
    },
    dataset: {
        type: Array,
        default() {
            return [];
        },
    },
});

const id = ref(createUid());
const settledLayout = shallowRef(null);
const hillChartRef = useTemplateRef('hillChartRef');
const svgRef = useTemplateRef('svgRef');
const overflowMenuRef = useTemplateRef('overflowMenuRef');
const userOptionsRef = useTemplateRef('userOptionsRef');

const titleStep = ref(0);

const emit = defineEmits([
    'edit',
    'save',
    'cancel',
    'copyAlt',
    'change',
    'dragStart',
    'dragEnd',
    'datapointEnter',
    'datapointLeave',
    'selectDatapoint',
]);

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG,
    });

    let finalConfig = {};
    const theme = mergedConfig.theme;
    if (!theme) {
        finalConfig = mergedConfig;
    } else {
        if (!isThemeValid.value(mergedConfig)) {
            warnInvalidTheme(mergedConfig);
            finalConfig = mergedConfig;
        } else {
            const fused = useNestedProp({
                userConfig: themes[theme] || props.config,
                defaultConfig: mergedConfig,
            });
            finalConfig = {
                ...useNestedProp({
                    userConfig: props.config,
                    defaultConfig: fused,
                }),
                customPalette: mergedConfig.customPalette.length
                    ? mergedConfig.customPalette
                    : themePalettes[theme] || palette,
            };
        }
    }
    return finalConfig;
}

const FINAL_CONFIG = ref(prepareConfig());

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiHill',
    rules: [COMMON_RULES.emptyArray, COMMON_RULES.noHint],
});

const { transitionEnabled } = useTransitions({
    config: () => FINAL_CONFIG.value.transitions,
    dataset: () => props.dataset,
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } =
    useUserOptionState({ config: FINAL_CONFIG.value });

function showOptions() {
    setUserOptionsVisibility(true);
}

function hideOptions() {
    setUserOptionsVisibility(false);
    hoveredDatapointId.value = null;
    focusedDatapointId.value = null;
    lastLayerDatapointId.value = null;
}

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `hill_${id.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-hill',
    options: FINAL_CONFIG.value.userOptions.print,
});

const isCursorPointer = computed(
    () => FINAL_CONFIG.value.userOptions.useCursorPointer,
);

const step = ref(0);
const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

const hillActionsPosition = computed(() =>
    FINAL_CONFIG.value.userOptions.position === 'left' ? 'right' : 'left',
);

watch(
    () => props.config,
    () => {
        settledLayout.value = null;
        FINAL_CONFIG.value = prepareConfig();
        step.value += 1;
        if (isEditing.value !== FINAL_CONFIG.value.editing) {
            isEditing.value =
                FINAL_CONFIG.value.editing && !FINAL_CONFIG.value.readonly;
        }
    },
    { deep: true },
);

const palette = computed(() => {
    const customPalette = FINAL_CONFIG.value.customPalette;
    return Array.isArray(customPalette) && customPalette.length
        ? customPalette
        : PALETTE;
});

function clampPosition(value) {
    const min = 0;
    const max = 1;
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue)) return min;
    return Math.min(max, Math.max(min, numericValue));
}

function resolveStatus(position) {
    if (position <= 0) {
        return 'todo';
    }

    if (position >= 1) {
        return 'done';
    }

    const midpoint = 0.5;

    const peakTolerance = Math.min(
        midpoint,
        Math.max(0, Number(FINAL_CONFIG.value.interaction.peakTolerance) || 0),
    );

    const peakStart = midpoint - peakTolerance;
    const peakEnd = midpoint + peakTolerance;

    if (position >= peakStart && position <= peakEnd) {
        return 'top';
    }

    return position < midpoint ? 'left' : 'right';
}

function normalizeDatapoint(datapoint, index) {
    const source = datapoint && typeof datapoint === 'object' ? datapoint : {};
    const fallbackName = `Item ${index + 1}`;
    const name = String(source.name ?? source.label ?? fallbackName);
    const position = clampPosition(source.position ?? source.value ?? 0);

    return {
        ...source,
        id: String(source.id ?? `${name}-${index}`),
        name,
        label: String(source.label ?? name),
        position,
        color: source.color || palette.value[index % palette.value.length],
        muted: Boolean(source.muted),
        disabled: Boolean(source.disabled),
        status: resolveStatus(datapoint.position),
        labelSide: ['left', 'right', 'auto'].includes(source.labelSide)
            ? source.labelSide
            : 'auto',
        __index: index,
    };
}

const FINAL_DATASET = computed(() => {
    if (!Array.isArray(props.dataset)) return [];
    return props.dataset.map(normalizeDatapoint);
});

function cloneDataset(dataset) {
    return dataset.map((datapoint) => ({ ...datapoint }));
}

function toPublicDatapoint(datapoint) {
    const { __index, ...publicDatapoint } = datapoint;

    if (Object.prototype.hasOwnProperty.call(publicDatapoint, 'value')) {
        publicDatapoint.value = publicDatapoint.position;
    }

    return publicDatapoint;
}

function toPublicDataset(dataset = draftDataset.value) {
    return dataset.map(toPublicDatapoint);
}

const initialEditing = computed(
    () => FINAL_CONFIG.value.editing && !FINAL_CONFIG.value.readonly,
);
const isEditing = ref(initialEditing.value);

const draftDataset = ref(cloneDataset(FINAL_DATASET.value));
const dragState = ref(null);

watch(
    FINAL_DATASET,
    (dataset) => {
        if (!isEditing.value) {
            settledLayout.value = null;
            draftDataset.value = cloneDataset(dataset);
        }
    },
    { deep: true },
);

const isEditable = computed(() => !FINAL_CONFIG.value.readonly);

watch(isEditable, (editable) => {
    if (!editable) {
        dragState.value = null;
        settledLayout.value = null;
        isEditing.value = false;
        draftDataset.value = cloneDataset(FINAL_DATASET.value);
    }
});

function dispatch(name, payload) {
    emit(name, payload);
    const callback = FINAL_CONFIG.value.events?.[name];
    if (typeof callback === 'function') {
        callback(payload);
    }
}

const chart = computed(() => FINAL_CONFIG.value.style.chart);
const layout = computed(() => chart.value.layout);
const hill = computed(() => layout.value.hill);
const plots = computed(() => layout.value.plots);
const itemLabels = computed(() => layout.value.labels.item);
const phaseLabels = computed(() => layout.value.labels.phases);
const toolbar = computed(() => chart.value.toolbar);
const stackbar = computed(() => layout.value.stackbar);

const stackOverflow = computed(() => {
    const overflow = plots.value.stacking?.overflow || {};
    const radius = Math.max(0, Number(plots.value.radius) || 0);

    return {
        show: overflow.show !== false,
        marker: {
            radius: Math.max(4, Number(overflow.marker?.radius) || radius),
            fill: overflow.marker.fill,
            stroke: overflow.marker?.stroke || plots.value.stroke,
            strokeWidth: overflow.marker.strokeWidth,
            color: overflow.marker.labelColor,
            fontSize: overflow.marker.fontSize,
            bold: overflow.marker?.bold !== false,
            offsetY: overflow.marker.labelOffsetY,
        },
        hysteresis: radius * 1.5,
        transitionDuration: transitionEnabled.value
            ? overflow.transitionDuration
            : 0,
        menu: {
            width: Math.max(160, Number(overflow.menu?.width) || 220),
            maxHeight: Math.max(96, Number(overflow.menu?.maxHeight) || 220),
            backgroundColor:
                overflow.menu?.backgroundColor || chart.value.backgroundColor,
            color: overflow.menu?.color || chart.value.color,
            borderColor: overflow.menu?.borderColor || plots.value.stroke,
            borderRadius: Math.max(0, Number(overflow.menu?.borderRadius) || 6),
        },
    };
});

function clampRatio(value, fallback, max = 1) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        return fallback;
    }
    return Math.min(max, Math.max(0, numericValue));
}

const geometry = computed(() => {
    const cfg = hill.value.geometry || {};
    const width = Math.max(0, Number(chart.value.width) || 0);
    const height = Math.max(0, Number(chart.value.height) || 0);

    const horizontalPaddingRatio = clampRatio(
        cfg.horizontalPaddingRatio,
        0.02,
        0.49,
    );
    const topPaddingRatio = clampRatio(cfg.topPaddingRatio, 0.12, 0.49);
    const bottomPaddingRatio = clampRatio(cfg.bottomPaddingRatio, 0.2, 0.49);
    const curvature = clampRatio(cfg.curvature, 0.65);

    const startX = width * horizontalPaddingRatio;
    const centerX = width / 2;
    const endX = width * (1 - horizontalPaddingRatio);
    const peakY = height * topPaddingRatio;
    const baseY = height * (1 - bottomPaddingRatio);

    const leftSpan = centerX - startX;
    const rightSpan = endX - centerX;
    const leftControlX = startX + leftSpan * curvature;
    const rightControlX = centerX + rightSpan * (1 - curvature);

    return {
        startX,
        centerX,
        endX,
        baseY,
        peakY,
        width: leftSpan + rightSpan,
        left: [
            { x: startX, y: baseY },
            { x: leftControlX, y: baseY },
            { x: leftControlX, y: peakY },
            { x: centerX, y: peakY },
        ],
        right: [
            { x: centerX, y: peakY },
            { x: rightControlX, y: peakY },
            { x: rightControlX, y: baseY },
            { x: endX, y: baseY },
        ],
    };
});

const hillPath = computed(() => {
    const { left, right } = geometry.value;

    return [
        `M${left[0].x} ${left[0].y}`,
        `C${left[1].x} ${left[1].y} ${left[2].x} ${left[2].y} ${left[3].x} ${left[3].y}`,
        `C${right[1].x} ${right[1].y} ${right[2].x} ${right[2].y} ${right[3].x} ${right[3].y}`,
    ].join(' ');
});

function cubicValue(a, b, c, d, t) {
    const mt = 1 - t;
    return mt ** 3 * a + 3 * mt ** 2 * t * b + 3 * mt * t ** 2 * c + t ** 3 * d;
}

function cubicDerivative(a, b, c, d, t) {
    const mt = 1 - t;
    return 3 * mt ** 2 * (b - a) + 6 * mt * t * (c - b) + 3 * t ** 2 * (d - c);
}

function pointOnCurve(position) {
    const normalized = clampPosition(position);
    const { startX, centerX, endX, left, right } = geometry.value;
    const positionRange = 1 - 0;
    const normalizedRatio = positionRange
        ? (normalized - 0) / positionRange
        : 0;
    const targetX = startX + normalizedRatio * (endX - startX);
    const curve = targetX <= centerX ? left : right;

    let low = 0;
    let high = 1;

    for (let index = 0; index < 28; index += 1) {
        const middle = (low + high) / 2;
        const x = cubicValue(
            curve[0].x,
            curve[1].x,
            curve[2].x,
            curve[3].x,
            middle,
        );

        if (x < targetX) low = middle;
        else high = middle;
    }

    const t = (low + high) / 2;
    const y = cubicValue(curve[0].y, curve[1].y, curve[2].y, curve[3].y, t);
    const dx = cubicDerivative(
        curve[0].x,
        curve[1].x,
        curve[2].x,
        curve[3].x,
        t,
    );
    const dy = cubicDerivative(
        curve[0].y,
        curve[1].y,
        curve[2].y,
        curve[3].y,
        t,
    );
    const tangentLength = Math.hypot(dx, dy) || 1;

    return {
        x: targetX,
        y,
        normalX: dy / tangentLength,
        normalY: -dx / tangentLength,
    };
}

function getStackingDistance(radius) {
    const configuredOverlapThresholdRatio = Number(
        plots.value.stacking.overlapThresholdRatio,
    );
    const overlapThresholdRatio = Number.isFinite(
        configuredOverlapThresholdRatio,
    )
        ? Math.min(2, Math.max(0, configuredOverlapThresholdRatio))
        : 0.5;

    return radius * (2 - overlapThresholdRatio);
}

function stackLayout(dataset, radius) {
    const result = new Map();
    const cfg = plots.value.stacking;

    dataset.forEach((datapoint) => {
        result.set(datapoint.id, {
            position: datapoint.position,
            index: 0,
            size: 1,
            stackId: `stack:${datapoint.id}`,
        });
    });

    if (!cfg.show || dataset.length < 2 || radius <= 0) return result;

    const stackingDistance = getStackingDistance(radius);
    const sorted = dataset
        .map((datapoint, index) => ({
            datapoint,
            index,
            point: pointOnCurve(datapoint.position),
        }))
        .sort(
            (a, b) =>
                a.point.x - b.point.x ||
                a.datapoint.position - b.datapoint.position ||
                a.index - b.index,
        );

    let cursor = 0;

    while (cursor < sorted.length) {
        const group = [sorted[cursor]];
        let next = cursor + 1;

        while (next < sorted.length) {
            const previous = group[group.length - 1];
            const candidate = sorted[next];
            const distance = Math.hypot(
                candidate.point.x - previous.point.x,
                candidate.point.y - previous.point.y,
            );

            if (distance >= stackingDistance) break;

            group.push(candidate);
            next += 1;
        }

        if (group.length > 1) {
            const anchorPosition = group[0].datapoint.position;
            const stackId = `stack:${group
                .map(({ datapoint }) => datapoint.id)
                .sort()
                .join('|')}`;

            group.forEach(({ datapoint }, stackIndex) => {
                result.set(datapoint.id, {
                    position: anchorPosition,
                    index: stackIndex,
                    size: group.length,
                    stackId,
                });
            });
        }

        cursor = next;
    }

    return result;
}

function getStackStep(radius) {
    const dotStrokeWidth = Math.max(0, Number(plots.value.strokeWidth) || 0);
    const outerRadius = radius + dotStrokeWidth / 2;
    const configuredGap = plots.value.stacking.gap;
    const stackGap =
        configuredGap === null || configuredGap === undefined
            ? radius / 2
            : configuredGap;

    return outerRadius * 2 + stackGap;
}

const promotedDatapointId = ref(null);
const promotedSelection = ref(null);
const openOverflowStackId = ref(null);
const overflowMenuStyle = ref(null);
const restoredOverflowStackId = ref(null);
const collapsedOverflowStackIds = new Set();
let restoredOverflowTimer = null;
let overflowMenuResizeObserver = null;
let overflowMenuAnimationFrame = null;

function getStackVisualTopPadding(radius) {
    const strokeWidth = Math.max(0, Number(plots.value.strokeWidth) || 0);
    const shadowTop = plots.value.shadow.show
        ? Math.max(0, Number(plots.value.shadow.blur) || 0) +
          Math.max(0, -(Number(plots.value.shadow.offsetY) || 0))
        : 0;

    return radius + strokeWidth / 2 + shadowTop;
}

function getStackTopVisualY(anchorY, stackSize, radius) {
    if (stackSize <= 1) {
        return anchorY - getStackVisualTopPadding(radius);
    }
    const stackStep = getStackStep(radius);
    const topmostCenterY = anchorY - (stackSize - 1) * stackStep;
    return topmostCenterY - getStackVisualTopPadding(radius);
}

function shouldCollapseStack(stackId, anchorY, stackSize, radius) {
    if (stackSize <= 1) {
        collapsedOverflowStackIds.delete(stackId);
        return false;
    }

    const topmostVisualY = getStackTopVisualY(anchorY, stackSize, radius);
    const wasCollapsed = collapsedOverflowStackIds.has(stackId);
    const releaseThreshold = stackOverflow.value.hysteresis;
    const shouldCollapse = wasCollapsed
        ? topmostVisualY < releaseThreshold
        : topmostVisualY < 0;

    if (shouldCollapse) {
        collapsedOverflowStackIds.add(stackId);
    } else {
        collapsedOverflowStackIds.delete(stackId);
    }

    return shouldCollapse;
}

const stackDisplayPlan = computed(() => {
    const radius = Math.max(0, Number(plots.value.radius) || 0);
    const stackStep = getStackStep(radius);
    const layoutMap = stackLayout(draftDataset.value, radius);
    const groups = new Map();
    const displayMap = new Map();
    const markers = [];
    const overflowMemberIds = new Set();
    const activeDragId = dragState.value?.id ?? null;

    if (!stackOverflow.value.show) {
        collapsedOverflowStackIds.clear();
    }

    draftDataset.value.forEach((datapoint) => {
        const stack = layoutMap.get(datapoint.id) || {
            position: datapoint.position,
            index: 0,
            size: 1,
            stackId: `stack:${datapoint.id}`,
        };

        if (!groups.has(stack.stackId)) {
            groups.set(stack.stackId, []);
        }

        groups.get(stack.stackId).push({
            datapoint,
            stack,
        });
    });

    const currentStackIds = new Set(groups.keys());

    collapsedOverflowStackIds.forEach((stackId) => {
        if (!currentStackIds.has(stackId)) {
            collapsedOverflowStackIds.delete(stackId);
        }
    });

    groups.forEach((members, stackId) => {
        const orderedMembers = [...members].sort(
            (a, b) =>
                a.stack.index - b.stack.index ||
                a.datapoint.__index - b.datapoint.__index,
        );

        const stackAveragePosition =
            orderedMembers.reduce(
                (sum, member) => sum + (Number(member.datapoint.position) || 0),
                0,
            ) / orderedMembers.length;

        const stackAveragePoint = pointOnCurve(stackAveragePosition);

        const shouldCollapse =
            stackOverflow.value.show &&
            shouldCollapseStack(
                stackId,
                stackAveragePoint.y,
                orderedMembers.length,
                radius,
            );

        if (!shouldCollapse) {
            orderedMembers.forEach((member) => {
                displayMap.set(member.datapoint.id, {
                    hidden: false,
                    displayIndex: member.stack.index,
                    stackId,
                    stackSize: orderedMembers.length,
                    promotedFromOverflow: false,
                    renderPosition: member.stack.position,
                });
            });

            return;
        }

        orderedMembers.forEach(({ datapoint }) => {
            overflowMemberIds.add(datapoint.id);
        });

        const activeDragMember = activeDragId
            ? orderedMembers.find(
                  ({ datapoint }) => datapoint.id === activeDragId,
              )
            : null;

        const promotedMember = orderedMembers.find(
            ({ datapoint }) => datapoint.id === promotedDatapointId.value,
        );

        const visibleMember = activeDragMember || promotedMember || null;

        const markerMembers = visibleMember
            ? orderedMembers.filter(
                  ({ datapoint }) =>
                      datapoint.id !== visibleMember.datapoint.id,
              )
            : orderedMembers;

        const selection = promotedSelection.value;
        const isTemporaryPromotion = Boolean(
            promotedMember &&
            selection?.datapointId === promotedMember.datapoint.id &&
            !selection.moved,
        );

        const markerPosition = markerMembers.length
            ? isTemporaryPromotion
                ? stackAveragePosition
                : markerMembers.reduce(
                      (sum, member) =>
                          sum + (Number(member.datapoint.position) || 0),
                      0,
                  ) / markerMembers.length
            : stackAveragePosition;

        const markerPoint = pointOnCurve(markerPosition);

        orderedMembers.forEach((member) => {
            const isVisible =
                visibleMember?.datapoint.id === member.datapoint.id;

            const isPromoted =
                isVisible &&
                promotedMember?.datapoint.id === member.datapoint.id;

            displayMap.set(member.datapoint.id, {
                hidden: !isVisible,
                displayIndex: isVisible ? 1 : 0,
                stackId,
                stackSize: orderedMembers.length,
                promotedFromOverflow: isPromoted,
                renderPosition: markerPosition,
            });
        });

        if (!markerMembers.length) {
            return;
        }

        markers.push({
            stackId,
            anchorPosition: markerPosition,
            x: markerPoint.x,
            y: markerPoint.y,
            hiddenCount: markerMembers.length,
            hiddenDatapoints: markerMembers.map(({ datapoint }) => datapoint),
            memberIds: orderedMembers.map(({ datapoint }) => datapoint.id),
            collapseDatapoints: markerMembers.map(({ datapoint, stack }) => {
                const sourcePoint = pointOnCurve(stack.position);

                return {
                    id: datapoint.id,
                    color: datapoint.color,
                    relativeX: sourcePoint.x - markerPoint.x,
                    relativeY:
                        sourcePoint.y - stack.index * stackStep - markerPoint.y,
                };
            }),
        });
    });

    return {
        layoutMap,
        displayMap,
        markers,
        overflowMemberIds,
    };
});

function createStationaryLayout(activeId) {
    const currentLayout = laidOutDataset.value.filter(
        (item) => !item.isStackOverflowHidden,
    );
    const activePoint = currentLayout.find((item) => item.id === activeId);
    const stationaryLayout = new Map(
        currentLayout
            .filter((item) => item.id !== activeId)
            .map((item) => [item.id, { x: item.x, y: item.y }]),
    );

    if (!activePoint || !plots.value.stacking.show) {
        return stationaryLayout;
    }

    const sourceStack = currentLayout
        .filter((item) => Math.abs(item.x - activePoint.x) < 0.001)
        .sort((a, b) => b.y - a.y || a.datasetIndex - b.datasetIndex);

    if (sourceStack.length < 2) {
        return stationaryLayout;
    }

    const radius = Math.max(0, Number(plots.value.radius) || 0);
    const stackStep = getStackStep(radius);
    const baseY = Math.max(...sourceStack.map((item) => item.y));
    const remainingStack = sourceStack.filter((item) => item.id !== activeId);

    remainingStack.forEach((item, index) => {
        stationaryLayout.set(item.id, {
            x: activePoint.x,
            y: baseY - index * stackStep,
        });
    });

    return stationaryLayout;
}

function snapshotCurrentLayout() {
    return new Map(
        laidOutDataset.value
            .filter((item) => !item.isStackOverflowHidden)
            .map((item) => [item.id, { x: item.x, y: item.y }]),
    );
}

const laidOutDataset = computed(() => {
    const radius = Math.max(0, Number(plots.value.radius) || 0);
    const {
        layoutMap: stack,
        displayMap,
        markers: overflowMarkers,
    } = stackDisplayPlan.value;
    const stackStep = getStackStep(radius);
    const activeDrag = dragState.value;
    const stationaryLayout = activeDrag?.stationaryLayout;
    const stableLayout =
        stationaryLayout instanceof Map
            ? stationaryLayout
            : settledLayout.value instanceof Map
              ? settledLayout.value
              : null;
    let activeDragPlacement = null;

    if (
        activeDrag &&
        stationaryLayout instanceof Map &&
        plots.value.stacking.show &&
        radius > 0
    ) {
        const activeDatapoint = draftDataset.value.find(
            (datapoint) => datapoint.id === activeDrag.id,
        );

        if (activeDatapoint) {
            const activeOverflowMarker = overflowMarkers.find((marker) =>
                marker.memberIds.includes(activeDatapoint.id),
            );

            if (activeOverflowMarker) {
                activeDragPlacement = {
                    x: activeOverflowMarker.x,
                    y: activeOverflowMarker.y - stackStep,
                };
            } else {
                const activePoint = pointOnCurve(activeDatapoint.position);
                const stackingDistance = getStackingDistance(radius);

                const nearestOverlappingDatapoint = draftDataset.value
                    .filter(
                        (datapoint) =>
                            datapoint.id !== activeDrag.id &&
                            stationaryLayout.has(datapoint.id),
                    )
                    .map((datapoint) => {
                        const point = pointOnCurve(datapoint.position);

                        return {
                            datapoint,
                            distance: Math.hypot(
                                point.x - activePoint.x,
                                point.y - activePoint.y,
                            ),
                        };
                    })
                    .filter(({ distance }) => distance < stackingDistance)
                    .sort((a, b) => a.distance - b.distance)[0];

                if (nearestOverlappingDatapoint) {
                    const anchor = stationaryLayout.get(
                        nearestOverlappingDatapoint.datapoint.id,
                    );
                    const anchorGroup = [...stationaryLayout.values()].filter(
                        (point) => Math.abs(point.x - anchor.x) < 0.001,
                    );
                    const topY = Math.min(
                        anchor.y,
                        ...anchorGroup.map((point) => point.y),
                    );

                    activeDragPlacement = {
                        x: anchor.x,
                        y: topY - stackStep,
                    };
                } else {
                    activeDragPlacement = activePoint;
                }
            }
        }
    }

    return draftDataset.value.map((datapoint, index) => {
        const stackPosition = stack.get(datapoint.id) || {
            position: datapoint.position,
            index: 0,
            size: 1,
            stackId: `stack:${datapoint.id}`,
        };
        const displayPosition = displayMap.get(datapoint.id) || {
            hidden: false,
            displayIndex: stackPosition.index,
            stackId: stackPosition.stackId,
            stackSize: stackPosition.size,
            renderPosition: stackPosition.position,
        };
        const point = pointOnCurve(
            displayPosition.renderPosition ?? stackPosition.position,
        );
        const stablePoint =
            datapoint.id !== activeDrag?.id &&
            !displayPosition.promotedFromOverflow &&
            stableLayout instanceof Map
                ? stableLayout.get(datapoint.id)
                : null;
        const renderedPoint =
            datapoint.id === activeDrag?.id && activeDragPlacement
                ? activeDragPlacement
                : stablePoint || {
                      x: point.x,
                      y: point.y - displayPosition.displayIndex * stackStep,
                  };
        const explicitSide =
            datapoint.labelSide !== 'auto' ? datapoint.labelSide : null;
        const autoSideThreshold = clampNumber(
            itemLabels.value.autoSideThreshold,
            0.5,
            1,
        );
        const labelSide =
            explicitSide ||
            (datapoint.position > autoSideThreshold ? 'left' : 'right');
        const labelOffsetX =
            Math.abs(Number(itemLabels.value.offsetX) || 0) +
            plots.value.radius +
            itemLabels.value.fontSize / 2;

        return {
            ...datapoint,
            datasetIndex: index,
            x: renderedPoint.x,
            y: renderedPoint.y,
            stackId: displayPosition.stackId,
            stackSize: displayPosition.stackSize,
            stackDisplayIndex: displayPosition.displayIndex,
            isStackOverflowHidden: displayPosition.hidden,
            isPromotedFromStackOverflow: displayPosition.promotedFromOverflow,
            labelSide,
            labelX: labelSide === 'left' ? -labelOffsetX : labelOffsetX,
            textAnchor: labelSide === 'left' ? 'end' : 'start',
        };
    });
});

function currentDatapoint(id) {
    return draftDataset.value.find((datapoint) => datapoint.id === id);
}

function updatePosition(id, position) {
    const nextPosition = clampPosition(position);
    let changedDatapoint;

    draftDataset.value = draftDataset.value.map((datapoint) => {
        if (datapoint.id !== id) return datapoint;
        changedDatapoint = { ...datapoint, position: nextPosition };
        return changedDatapoint;
    });

    if (changedDatapoint) {
        markPromotedSelectionMoved(
            changedDatapoint.id,
            changedDatapoint.position,
        );

        dispatch('change', {
            datapoint: toPublicDatapoint(changedDatapoint),
            dataset: toPublicDataset(),
        });
    }
}

function clientXToPosition(clientX) {
    const svg = svgRef.value;
    if (!svg) return null;

    const matrix = svg.getScreenCTM();
    if (!matrix) return null;

    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = 0;

    const localPoint = point.matrixTransform(matrix.inverse());
    const { startX, endX } = geometry.value;
    const ratio = (localPoint.x - startX) / (endX - startX);
    const min = 0;
    const max = 1;

    return clampPosition(min + ratio * (max - min));
}

function beginEditing() {
    if (!isEditable.value) return;
    openOverflowStackId.value = null;
    promotedDatapointId.value = null;
    promotedSelection.value = null;
    restoredOverflowStackId.value = null;
    clearRestoredOverflowTimer();
    settledLayout.value = null;
    draftDataset.value = cloneDataset(FINAL_DATASET.value);
    isEditing.value = true;
    dispatch('edit', toPublicDataset());
}

function save() {
    const dataset = toPublicDataset();
    openOverflowStackId.value = null;
    promotedDatapointId.value = null;
    promotedSelection.value = null;
    restoredOverflowStackId.value = null;
    clearRestoredOverflowTimer();
    dragState.value = null;
    isEditing.value = false;
    dispatch('save', dataset);
}

function cancel() {
    openOverflowStackId.value = null;
    promotedDatapointId.value = null;
    promotedSelection.value = null;
    restoredOverflowStackId.value = null;
    clearRestoredOverflowTimer();
    dragState.value = null;
    settledLayout.value = null;
    draftDataset.value = cloneDataset(FINAL_DATASET.value);
    isEditing.value = false;
    dispatch('cancel', toPublicDataset());
}

function onPointerDown(event, datapoint) {
    if (!isEditable.value || !isEditing.value || datapoint.disabled) {
        return;
    }

    openOverflowStackId.value = null;

    const datapointElement = event.currentTarget.closest(
        '.vue-ui-hill__datapoint',
    );

    if (datapointElement && typeof datapointElement.focus === 'function') {
        datapointElement.focus();
        focusedDatapointId.value = datapoint.id;
    }

    event.preventDefault();

    const stationaryLayout = createStationaryLayout(datapoint.id);

    const deferPositionUpdate = Boolean(
        promotedSelection.value?.datapointId === datapoint.id &&
        !promotedSelection.value?.moved,
    );

    dragState.value = {
        id: datapoint.id,
        pointerId: event.pointerId,
        stationaryLayout,
        startClientX: event.clientX,
        hasMoved: false,
        deferPositionUpdate,
    };

    svgRef.value?.setPointerCapture(event.pointerId);

    if (!deferPositionUpdate) {
        const position = clientXToPosition(event.clientX);

        if (position !== null) {
            updatePosition(datapoint.id, position);
        }
    }

    const activeDatapoint = currentDatapoint(datapoint.id);

    if (activeDatapoint) {
        dispatch('dragStart', toPublicDatapoint(activeDatapoint));
    }
}

function onPointerMove(event) {
    if (!dragState.value || dragState.value.pointerId !== event.pointerId) {
        return;
    }

    event.preventDefault();

    const pointerDistance = Math.abs(
        event.clientX - dragState.value.startClientX,
    );

    if (
        dragState.value.deferPositionUpdate &&
        !dragState.value.hasMoved &&
        pointerDistance < 3
    ) {
        return;
    }

    if (!dragState.value.hasMoved) {
        dragState.value = {
            ...dragState.value,
            hasMoved: true,
        };
    }

    const position = clientXToPosition(event.clientX);
    if (position !== null) {
        updatePosition(dragState.value.id, position);
    }
}

function finishDrag(event) {
    const activeDrag = dragState.value;

    if (!activeDrag || activeDrag.pointerId !== event.pointerId) {
        return;
    }

    if (svgRef.value?.hasPointerCapture(event.pointerId)) {
        svgRef.value.releasePointerCapture(event.pointerId);
    }

    const wasPointerSelection =
        event.type === 'pointerup' && !activeDrag.hasMoved;

    const datapoint = currentDatapoint(activeDrag.id);

    settledLayout.value = snapshotCurrentLayout();

    dragState.value = null;

    if (!datapoint) {
        return;
    }

    if (wasPointerSelection) {
        dispatch('selectDatapoint', datapointPayload(datapoint));
    }

    dispatch('dragEnd', toPublicDatapoint(datapoint));
}

function onKeydown(event, datapoint) {
    if (!isEditable.value || !isEditing.value || datapoint.disabled) {
        return;
    }

    const step = Math.max(
        0,
        Number(FINAL_CONFIG.value.interaction.keyboardStep) || 0,
    );

    let nextPosition = null;

    switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
            nextPosition = datapoint.position - step;
            break;

        case 'ArrowRight':
        case 'ArrowUp':
            nextPosition = datapoint.position + step;
            break;

        case 'Home':
            nextPosition = 0;
            break;

        case 'End':
            nextPosition = 1;
            break;

        default:
            return;
    }

    event.preventDefault();
    const focusedElement = event.currentTarget;
    focusedDatapointId.value = datapoint.id;

    dragState.value = {
        id: datapoint.id,
        pointerId: null,
        stationaryLayout: createStationaryLayout(datapoint.id),
    };

    updatePosition(datapoint.id, nextPosition);
    settledLayout.value = snapshotCurrentLayout();
    dragState.value = null;

    nextTick(() => {
        if (focusedElement?.isConnected) {
            focusedElement.focus({
                preventScroll: true,
            });
        }
    });
}

function phaseText(position) {
    const min = 0;
    const max = 1;
    const middle = min + (max - min) / 2;
    const tolerance = Math.max(
        0,
        Number(FINAL_CONFIG.value.interaction.peakTolerance) || 0,
    );

    if (Math.abs(position - middle) <= tolerance) {
        return FINAL_CONFIG.value.a11y.translations.topOfHill;
    }

    return position < middle
        ? phaseLabels.value.left.text
        : phaseLabels.value.right.text;
}

function datapointPayload(datapoint) {
    return {
        datapoint: toPublicDatapoint(datapoint),
        index: datapoint.__index,
    };
}

function onDatapointEnter(datapoint) {
    focusedDatapointId.value = null;
    hoveredDatapointId.value = datapoint.id;
    if (
        ![0, 1].includes(datapoint.position) &&
        focusedDatapointId.value !== datapoint.id
    ) {
        moveToLastLayer(datapoint);
    }
    dispatch('datapointEnter', datapointPayload(datapoint));
}

function onDatapointLeave(datapoint) {
    if (hoveredDatapointId.value === datapoint.id) {
        hoveredDatapointId.value = null;
    }

    if (
        lastLayerDatapointId.value === datapoint.id &&
        focusedDatapointId.value !== datapoint.id &&
        dragState.value?.id !== datapoint.id
    ) {
        lastLayerDatapointId.value = null;
    }

    dispatch('datapointLeave', datapointPayload(datapoint));
}

function onDatapointClick(datapoint) {
    /*
     * Editable pointer interactions are handled in
     * finishDrag(). This avoids duplicate selection
     * events in browsers that still produce a click.
     */
    if (isEditing.value && isEditable.value) {
        return;
    }

    dispatch('selectDatapoint', datapointPayload(datapoint));
}

const rootStyle = computed(() => {
    const cfg = chart.value;

    return {
        width: '100%',
        maxWidth: '100%',
        color: cfg.color,
        backgroundColor: cfg.backgroundColor,
        fontFamily: FINAL_CONFIG.value.style.fontFamily,
        '--vue-ui-hill-button-hover-border':
            toolbar.value.buttons.hoverBorderColor,
        '--vue-ui-hill-button-active-offset': `${toolbar.value.buttons.activeTranslateY}px`,
    };
});

const statusStyle = computed(() => ({
    color: toolbar.value.status.color,
    fontSize: `${toolbar.value.status.fontSize}px`,
    fontWeight: toolbar.value.status.bold ? 'bold' : 'normal',
    lineHeight: toolbar.value.status.lineHeight,
}));

const titleStyle = computed(() => ({
    color: chart.value.title.color,
    fontSize: `${chart.value.title.fontSize}px`,
    fontWeight: chart.value.title.bold ? 'bold' : 'normal',
    textAlign: chart.value.title.textAlign,
}));

const subtitleStyle = computed(() => ({
    color: chart.value.title.subtitle.color,
    fontSize: `${chart.value.title.subtitle.fontSize}px`,
    fontWeight: chart.value.title.subtitle.bold ? 'bold' : 'normal',
}));

const phaseLabelY = computed(() => {
    const height = Math.max(0, Number(chart.value.height) || 0);
    return (
        Math.min(height, geometry.value.baseY + height) +
        phaseLabels.value.offsetY
    );
});

function phaseLabelText(side) {
    return phaseLabels.value[side].text;
}

function isBoundaryDatapoint(datapoint) {
    return datapoint.position === 0 || datapoint.position === 1;
}

const lastLayerDatapointId = ref(null);
const hoveredDatapointId = ref(null);
const focusedDatapointId = ref(null);

function onDatapointFocus(datapoint) {
    focusedDatapointId.value = datapoint.id;
}

function onDatapointBlur(datapoint) {
    if (focusedDatapointId.value === datapoint.id) {
        focusedDatapointId.value = null;
    }

    if (
        lastLayerDatapointId.value === datapoint.id &&
        hoveredDatapointId.value !== datapoint.id &&
        dragState.value?.id !== datapoint.id
    ) {
        lastLayerDatapointId.value = null;
    }
}

function moveToLastLayer(datapoint) {
    if (!datapoint?.id) {
        return;
    }
    lastLayerDatapointId.value = datapoint.id;
}

const orderedLaidOutDataset = computed(() => {
    const boundaryDatapoints = [];
    const activeDatapoints = [];
    let lastLayerDatapoint = null;

    laidOutDataset.value.forEach((datapoint) => {
        if (datapoint.isStackOverflowHidden) {
            return;
        }

        if (datapoint.id === lastLayerDatapointId.value) {
            lastLayerDatapoint = datapoint;
            return;
        }

        if (isBoundaryDatapoint(datapoint)) {
            boundaryDatapoints.push(datapoint);
        } else {
            activeDatapoints.push(datapoint);
        }
    });

    return [
        ...boundaryDatapoints,
        ...activeDatapoints,
        ...(lastLayerDatapoint ? [lastLayerDatapoint] : []),
    ];
});

const stackOverflowMarkers = computed(() => stackDisplayPlan.value.markers);

const activeOverflowMenu = computed(() => {
    return (
        stackOverflowMarkers.value.find(
            (item) => item.stackId === openOverflowStackId.value,
        ) || null
    );
});

const overflowMenuBaseStyle = computed(() => {
    const configuredWidth = Math.max(
        160,
        Number(stackOverflow.value.menu.width) || 220,
    );
    const configuredMaxHeight = Math.max(
        80,
        Number(stackOverflow.value.menu.maxHeight) || 220,
    );

    return {
        visibility: overflowMenuStyle.value ? 'visible' : 'hidden',
        width: 'max-content',
        minWidth: `${configuredWidth}px`,
        maxWidth: 'calc(100% - 16px)',
        maxHeight: `${configuredMaxHeight}px`,
        backgroundColor: stackOverflow.value.menu.backgroundColor,
        color: stackOverflow.value.menu.color,
        borderColor: stackOverflow.value.menu.borderColor,
        borderRadius: `${stackOverflow.value.menu.borderRadius}px`,
    };
});

function svgPointToChartCoordinates(x, y) {
    const svg = svgRef.value;
    const chartElement = hillChartRef.value;

    if (!svg || !chartElement) {
        return null;
    }

    const matrix = svg.getScreenCTM();

    if (!matrix) {
        return null;
    }

    const point = svg.createSVGPoint();
    point.x = x;
    point.y = y;

    const screenPoint = point.matrixTransform(matrix);
    const chartRect = chartElement.getBoundingClientRect();

    return {
        x: screenPoint.x - chartRect.left,
        y: screenPoint.y - chartRect.top,
    };
}

function updateOverflowMenuStyle() {
    const menu = activeOverflowMenu.value;
    const menuElement = overflowMenuRef.value;
    const chartElement = hillChartRef.value;

    if (!menu || !menuElement || !chartElement) {
        overflowMenuStyle.value = null;
        return;
    }

    const anchor = svgPointToChartCoordinates(menu.x, menu.y);
    const radiusPoint = svgPointToChartCoordinates(
        menu.x,
        menu.y + stackOverflow.value.marker.radius,
    );

    if (!anchor || !radiusPoint) {
        overflowMenuStyle.value = null;
        return;
    }

    const horizontalMargin = 8;
    const verticalMargin = 8;
    const verticalGap = 8;
    const chartRect = chartElement.getBoundingClientRect();
    const menuWidth = menuElement.offsetWidth;
    const menuHeight = menuElement.offsetHeight;
    const markerRadius = Math.abs(radiusPoint.y - anchor.y);

    const availableWidth = Math.max(0, chartRect.width - horizontalMargin * 2);
    const renderedMenuWidth = Math.min(menuWidth, availableWidth);

    let centerX = anchor.x;

    if (renderedMenuWidth >= availableWidth) {
        centerX = chartRect.width / 2;
    } else {
        const halfWidth = renderedMenuWidth / 2;
        centerX = Math.min(
            chartRect.width - horizontalMargin - halfWidth,
            Math.max(horizontalMargin + halfWidth, anchor.x),
        );
    }

    const belowTop = anchor.y + markerRadius + verticalGap;
    const aboveTop = anchor.y - markerRadius - verticalGap - menuHeight;
    const fitsBelow =
        belowTop + menuHeight <= chartRect.height - verticalMargin;
    const fitsAbove = aboveTop >= verticalMargin;

    let top = belowTop;

    if (!fitsBelow && fitsAbove) {
        top = aboveTop;
    } else if (!fitsBelow) {
        top = Math.min(
            Math.max(verticalMargin, belowTop),
            Math.max(
                verticalMargin,
                chartRect.height - menuHeight - verticalMargin,
            ),
        );
    }

    overflowMenuStyle.value = {
        left: `${centerX}px`,
        top: `${top}px`,
        transform: 'translateX(-50%)',
        visibility: 'visible',
    };
}

function scheduleOverflowMenuStyleUpdate() {
    if (typeof window === 'undefined') {
        return;
    }

    if (overflowMenuAnimationFrame !== null) {
        window.cancelAnimationFrame(overflowMenuAnimationFrame);
    }

    overflowMenuAnimationFrame = window.requestAnimationFrame(() => {
        overflowMenuAnimationFrame = null;
        updateOverflowMenuStyle();
    });
}

watch(stackOverflowMarkers, (markers) => {
    if (
        openOverflowStackId.value &&
        !markers.some((marker) => marker.stackId === openOverflowStackId.value)
    ) {
        closeOverflowMenu();
    }
});

watch(
    () => {
        const menu = activeOverflowMenu.value;

        if (!menu) {
            return null;
        }

        return [
            menu.stackId,
            menu.x,
            menu.y,
            menu.hiddenDatapoints.length,
            menu.hiddenDatapoints
                .map(
                    (datapoint) =>
                        `${datapoint.id}:${datapoint.label}:${datapoint.position}`,
                )
                .join('|'),
            stackOverflow.value.marker.radius,
            stackOverflow.value.menu.width,
            stackOverflow.value.menu.maxHeight,
            stackOverflow.value.menu.backgroundColor,
            stackOverflow.value.menu.color,
            stackOverflow.value.menu.borderColor,
            stackOverflow.value.menu.borderRadius,
            isFullscreen.value,
        ];
    },
    (menuState) => {
        if (!menuState) {
            overflowMenuStyle.value = null;
            return;
        }

        nextTick(scheduleOverflowMenuStyleUpdate);
    },
    {
        flush: 'post',
    },
);

watch(
    overflowMenuRef,
    (element, previousElement) => {
        if (previousElement && overflowMenuResizeObserver) {
            overflowMenuResizeObserver.unobserve(previousElement);
        }

        if (element && overflowMenuResizeObserver) {
            overflowMenuResizeObserver.observe(element);
            nextTick(scheduleOverflowMenuStyleUpdate);
        }
    },
    {
        flush: 'post',
    },
);

watch(
    () => {
        const promotedId = promotedDatapointId.value;

        return promotedId
            ? stackDisplayPlan.value.overflowMemberIds.has(promotedId)
            : true;
    },
    (isStillInOverflowingStack) => {
        if (!isStillInOverflowingStack) {
            promotedDatapointId.value = null;
            promotedSelection.value = null;
        }
    },
);

function openOverflowMenu(marker) {
    if (!marker) {
        return;
    }

    if (openOverflowStackId.value === marker.stackId) {
        scheduleOverflowMenuStyleUpdate();
        return;
    }

    overflowMenuStyle.value = null;
    openOverflowStackId.value = marker.stackId;
    nextTick(scheduleOverflowMenuStyleUpdate);
}

function toggleOverflowMenu(marker) {
    if (!marker) {
        return;
    }

    if (openOverflowStackId.value === marker.stackId) {
        closeOverflowMenu();
        return;
    }

    openOverflowMenu(marker);
}

function closeOverflowMenu() {
    openOverflowStackId.value = null;
    overflowMenuStyle.value = null;

    if (typeof window !== 'undefined' && overflowMenuAnimationFrame !== null) {
        window.cancelAnimationFrame(overflowMenuAnimationFrame);
        overflowMenuAnimationFrame = null;
    }
}

function clearRestoredOverflowTimer() {
    if (restoredOverflowTimer !== null) {
        clearTimeout(restoredOverflowTimer);
        restoredOverflowTimer = null;
    }
}

function restoreCollapsedStack() {
    const selection = promotedSelection.value;

    if (!selection || selection.moved) {
        return;
    }

    clearRestoredOverflowTimer();
    restoredOverflowStackId.value = selection.stackId;
    promotedDatapointId.value = null;
    promotedSelection.value = null;
    closeOverflowMenu();

    restoredOverflowTimer = setTimeout(() => {
        restoredOverflowStackId.value = null;
        restoredOverflowTimer = null;
    }, stackOverflow.value.transitionDuration + 80);
}

function getOverflowInteractionTarget(target) {
    if (!(target instanceof Element)) {
        return {
            isMenu: false,
            isMarker: false,
            isSelectedDatapoint: false,
        };
    }

    const selection = promotedSelection.value;
    const datapointElement = target.closest('[data-datapoint-id]');

    return {
        isMenu: Boolean(target.closest('[data-stack-overflow-menu]')),
        isMarker: Boolean(target.closest('[data-stack-overflow-marker]')),
        isSelectedDatapoint: Boolean(
            selection &&
            datapointElement?.getAttribute('data-datapoint-id') ===
                selection.datapointId,
        ),
    };
}

function onDocumentPointerDown(event) {
    const target = getOverflowInteractionTarget(event.target);

    if (openOverflowStackId.value && !target.isMenu && !target.isMarker) {
        closeOverflowMenu();
    }

    if (
        promotedSelection.value &&
        !promotedSelection.value.moved &&
        !target.isMenu &&
        !target.isMarker &&
        !target.isSelectedDatapoint
    ) {
        restoreCollapsedStack();
    }
}

function focusDatapointById(datapointId) {
    const datapoint = laidOutDataset.value.find(
        (item) => item.id === datapointId,
    );

    if (!datapoint || datapoint.isStackOverflowHidden) {
        return;
    }

    const element = svgRef.value?.querySelector(
        `[data-datapoint-index="${datapoint.__index}"]`,
    );

    if (element && typeof element.focus === 'function') {
        element.focus({ preventScroll: true });
    }
}

function selectOverflowDatapoint(datapoint) {
    if (!datapoint || datapoint.disabled || FINAL_CONFIG.value.readonly) return;

    const stackId = activeOverflowMenu.value?.stackId;

    if (!stackId) {
        return;
    }

    clearRestoredOverflowTimer();
    restoredOverflowStackId.value = null;
    promotedDatapointId.value = datapoint.id;
    promotedSelection.value = {
        datapointId: datapoint.id,
        stackId,
        initialPosition: datapoint.position,
        moved: false,
    };
    closeOverflowMenu();

    nextTick(() => {
        focusDatapointById(datapoint.id);

        const renderedDatapoint = laidOutDataset.value.find(
            (item) => item.id === datapoint.id,
        );

        if (renderedDatapoint) {
            const payload = datapointPayload(renderedDatapoint);
            dispatch('selectDatapoint', payload);
        }
    });
}

function getPromotedMovementTolerance() {
    const min = 0;
    const max = 1;
    const range = Math.abs(max - min);
    const width = Math.max(1, Number(geometry.value.width) || 1);

    return Math.max(1e-6, (range / width) * 2);
}

function markPromotedSelectionMoved(datapointId, nextPosition) {
    const selection = promotedSelection.value;

    if (
        !selection ||
        selection.datapointId !== datapointId ||
        selection.moved
    ) {
        return;
    }

    if (
        Math.abs(nextPosition - selection.initialPosition) >=
        getPromotedMovementTolerance()
    ) {
        promotedSelection.value = {
            ...selection,
            moved: true,
        };
    }
}

onMounted(() => {
    document.addEventListener('pointerdown', onDocumentPointerDown);

    window.addEventListener('resize', scheduleOverflowMenuStyleUpdate, {
        passive: true,
    });

    if (typeof ResizeObserver !== 'undefined') {
        overflowMenuResizeObserver = new ResizeObserver(() => {
            if (activeOverflowMenu.value) {
                scheduleOverflowMenuStyleUpdate();
            }
        });

        if (hillChartRef.value) {
            overflowMenuResizeObserver.observe(hillChartRef.value);
        }

        if (svgRef.value) {
            overflowMenuResizeObserver.observe(svgRef.value);
        }
    }
});

onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', onDocumentPointerDown);

    window.removeEventListener('resize', scheduleOverflowMenuStyleUpdate);

    overflowMenuResizeObserver?.disconnect();
    overflowMenuResizeObserver = null;

    if (overflowMenuAnimationFrame !== null) {
        window.cancelAnimationFrame(overflowMenuAnimationFrame);
        overflowMenuAnimationFrame = null;
    }

    clearRestoredOverflowTimer();
});

function isPositionIndicatorVisible(datapoint) {
    if (dragState.value) {
        return dragState.value.id === datapoint.id;
    }
    return (
        hoveredDatapointId.value === datapoint.id ||
        focusedDatapointId.value === datapoint.id
    );
}

function formatPosition(datapoint) {
    return applyDataLabel(
        FINAL_CONFIG.value.style.chart.layout.plots.dragMarker.positionIndicator
            .value.formatter,
        datapoint.position,
        dataLabel({
            p: '',
            v: datapoint.position * 100,
            s: '%',
            r: FINAL_CONFIG.value.style.chart.layout.plots.dragMarker
                .positionIndicator.value.rounding,
        }),
    );
}

const svgBg = computed(() => FINAL_CONFIG.value.style.chart.backgroundColor);
const svgLegend = computed(() => FINAL_CONFIG.value.style.chart.legend);
const svgTitle = computed(() => FINAL_CONFIG.value.style.chart.title);

const { isCallbackImaging, isCallbackSvg, generateSvg, onGenerateImage } =
    useChartExport({
        svg: svgRef,
        title: svgTitle,
        legend: svgLegend,
        legendItems: null,
        backgroundColor: svgBg,
        getSvgCallback: () => FINAL_CONFIG.value.userOptions.callbacks.svg,
        generateImage,
    });

function generateCsv(callback = null) {
    nextTick(() => {
        const rows = toPublicDataset().map((datapoint) => [
            [datapoint.name],
            [datapoint.position],
            [formatPosition(datapoint)],
            [phaseText(datapoint.position)],
        ]);

        const tableXls = [
            [FINAL_CONFIG.value.style.chart.title.text],
            [FINAL_CONFIG.value.style.chart.title.subtitle.text],
            [['Name'], ['Position'], ['Percentage'], ['Phase']],
        ].concat(rows);

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({
                csvContent,
                title:
                    FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-hill',
            });
        } else {
            callback(csvContent);
        }
    });
}

const showStackbar = computed(
    () => FINAL_CONFIG.value.style.chart.layout.stackbar.show,
);

const globalStatus = computed(() => {
    const totalScore = laidOutDataset.value.length;

    const totalCompletion = laidOutDataset.value.reduce(
        (sum, datapoint) => sum + (datapoint?.position ?? 0),
        0,
    );

    let proportionStart = 0;

    const isComplete = laidOutDataset.value.every(
        (datapoint) => datapoint.position === 1,
    );

    const source = laidOutDataset.value.toSorted((a, b) => {
        if (isComplete) {
            return a.__index - b.__index;
        }

        const positionDifference = (a?.position ?? 0) - (b?.position ?? 0);

        if (positionDifference !== 0) {
            return positionDifference;
        }

        return a.__index - b.__index;
    });

    return source.map((datapoint) => {
        const position = datapoint?.position ?? 0;

        const proportion = totalScore > 0 ? position / totalScore : 0;

        const result = {
            ...datapoint,
            proportion,
            proportionStart,
        };

        proportionStart += proportion;

        return result;
    });
});

const stackBarFilledProportion = computed(() => {
    return Math.min(
        1,
        Math.max(
            0,
            globalStatus.value.reduce(
                (sum, datapoint) => sum + datapoint.proportion,
                0,
            ),
        ),
    );
});

const stackBarProgress = computed(() => stackBarFilledProportion.value * 100);

const stackBarEndX = computed(
    () =>
        geometry.value.left[0].x +
        geometry.value.width * stackBarFilledProportion.value,
);

const stackBarY = computed(
    () => chart.value.height + 32 + stackbar.value.paddingTop,
);

function formatStackBarProgress() {
    return applyDataLabel(
        stackbar.value.label.formatter,
        stackBarProgress.value,
        dataLabel({
            p: '',
            v: stackBarProgress.value,
            s: '%',
            r: 0,
        }),
    );
}

const stackBarClipId = computed(() => `${id.value}-stackbar-clip`);

async function copyAlt() {
    const ds = toPublicDataset();
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: ds,
    });
    if (!FINAL_CONFIG.value.userOptions.callbacks.altCopy) {
        console.warn(
            'Vue Data UI - A callback must be set for `altCopy` in userOptions.',
        );
        return;
    }
    await Promise.resolve(
        FINAL_CONFIG.value.userOptions.callbacks.altCopy({
            config: FINAL_CONFIG.value,
            dataset: ds,
        }),
    );
}

async function getImage({ scale = 2 } = {}) {
    if (!hillChartRef.value) return;
    const { width, height } = hillChartRef.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({
        domElement: hillChartRef.value,
        base64: true,
        img: true,
        scale,
    });
    return {
        imageUri,
        base64,
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio,
    };
}

function getData() {
    return toPublicDataset();
}

defineExpose({
    isEditing,
    beginEditing,
    save,
    cancel,
    getData,
    copyAlt,
    toggleFullscreen,
    toggleAnnotator,
    generateImage,
    generateSvg,
    generatePdf,
    generateCsv,
    getImage,
});
</script>

<template>
    <div
        ref="hillChartRef"
        :class="`vue-data-ui-component vue-ui-hill`"
        :style="rootStyle"
        :id="`hill_${id}`"
        @mouseenter="showOptions"
        @mouseleave="hideOptions"
        :data-editing="isEditing"
    >
        <div
            ref="chartTitle"
            v-if="FINAL_CONFIG.style.chart.title.text"
            :style="`width:100%;background:transparent;padding-bottom:24px`"
        >
            <!-- TITLE AS DIV -->
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'hill-div-title',
                        ...FINAL_CONFIG.style.chart.title,
                    },
                    subtitle: {
                        cy: 'hill-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle,
                    },
                }"
            />
        </div>

        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator && svgRef"
            :color="FINAL_CONFIG.style.chart.color"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :active="isAnnotator"
            :svgRef="svgRef"
            :isCursorPointer="isCursorPointer"
            @close="toggleAnnotator"
        >
            <template #annotator-action-close>
                <slot name="annotator-action-close" />
            </template>
            <template #annotator-action-color="{ color }">
                <slot name="annotator-action-color" v-bind="{ color }" />
            </template>
            <template #annotator-action-draw="{ mode }">
                <slot name="annotator-action-draw" v-bind="{ mode }" />
            </template>
            <template #annotator-action-undo="{ disabled }">
                <slot name="annotator-action-undo" v-bind="{ disabled }" />
            </template>
            <template #annotator-action-redo="{ disabled }">
                <slot name="annotator-action-redo" v-bind="{ disabled }" />
            </template>
            <template #annotator-action-delete="{ disabled }">
                <slot name="annotator-action-delete" v-bind="{ disabled }" />
            </template>
        </PenAndPaper>

        <HillActions
            v-if="toolbar.show"
            :is-editing="isEditing"
            :is-editable="isEditable"
            :is-fullscreen="isFullscreen"
            :position="hillActionsPosition"
            :color="FINAL_CONFIG.style.chart.color"
            :background-color="FINAL_CONFIG.style.chart.backgroundColor"
            :translations="toolbar.buttons.translations"
            :is-cursor-pointer="isCursorPointer"
            @update="beginEditing"
            @cancel="cancel"
            @save="save"
        >
            <template #hill-edit>
                <slot name="hill-edit" />
            </template>
            <template #hill-cancel>
                <slot name="hill-cancel" />
            </template>
            <template #hill-save>
                <slot name="hill-save" />
            </template>
        </HillActions>

        <div
            v-if="toolbar.show"
            class="vue-ui-hill__toolbar"
            data-dom-to-png-ignore
        >
            <p
                class="vue-ui-hill__status"
                :style="statusStyle"
                aria-live="polite"
            >
                {{
                    isEditing
                        ? toolbar.status.editInstruction
                        : toolbar.status.lastUpdated
                }}
            </p>
        </div>

        <UserOptions
            ref="userOptionsRef"
            :key="`uo_${step}`"
            v-if="
                FINAL_CONFIG.userOptions.show &&
                (keepUserOptionState ? true : userOptionsVisible)
            "
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="id"
            :hasTooltip="false"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasLabel="FINAL_CONFIG.userOptions.buttons.labels"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :hasAltCopy="FINAL_CONFIG.userOptions.buttons.altCopy"
            :chartElement="hillChartRef"
            :position="FINAL_CONFIG.userOptions.position"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            :isCursorPointer="isCursorPointer"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="onGenerateImage"
            @generateSvg="generateSvg"
            @toggleAnnotator="toggleAnnotator"
            @copyAlt="copyAlt"
            :style="{
                visibility: keepUserOptionState
                    ? userOptionsVisible
                        ? 'visible'
                        : 'hidden'
                    : 'visible',
            }"
        >
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }" />
            </template>
            <template #optionPdf v-if="$slots.optionPdf">
                <slot name="optionPdf" />
            </template>
            <template #optionCsv v-if="$slots.optionCsv">
                <slot name="optionCsv" />
            </template>
            <template #optionImg v-if="$slots.optionImg">
                <slot name="optionImg" />
            </template>
            <template #optionSvg v-if="$slots.optionSvg">
                <slot name="optionSvg" />
            </template>
            <template
                v-if="$slots.optionFullscreen"
                #optionFullscreen="{ toggleFullscreen, isFullscreen }"
            >
                <slot
                    name="optionFullscreen"
                    v-bind="{ toggleFullscreen, isFullscreen }"
                />
            </template>
            <template
                v-if="$slots.optionAnnotator"
                #optionAnnotator="{ toggleAnnotator, isAnnotator }"
            >
                <slot
                    name="optionAnnotator"
                    v-bind="{ toggleAnnotator, isAnnotator }"
                />
            </template>
            <template
                v-if="$slots.optionAltCopy"
                #optionAltCopy="{ altCopy: c }"
            >
                <slot name="optionAltCopy" v-bind="{ altCopy: c }" />
            </template>
            <template #custom-menu-before v-if="$slots['custom-menu-before']">
                <slot name="custom-menu-before" />
            </template>
            <template #custom-menu-after v-if="$slots['custom-menu-after']">
                <slot name="custom-menu-after" />
            </template>
        </UserOptions>

        <svg
            ref="svgRef"
            :style="{
                background: 'transparent',
                color: FINAL_CONFIG.style.chart.color,
                fontFamily: FINAL_CONFIG.style.fontFamily,
            }"
            :class="{
                'vue-data-ui-no-transition': !transitionEnabled,
            }"
            :viewBox="`0 0 ${chart.width} ${chart.height + (showStackbar ? 32 + stackbar.paddingTop + stackbar.paddingBottom + stackbar.height : 0)}`"
            role="group"
            aria-live="polite"
            preserveAspectRatio="xMidYMid meet"
            @pointermove="onPointerMove"
            @pointerup="finishDrag"
            @pointercancel="finishDrag"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject
                v-if="$slots['chart-background']"
                :x="0"
                :y="0"
                :width="Math.max(0.1, chart.width)"
                :height="
                    Math.max(
                        0.1,
                        chart.height +
                            (showStackbar
                                ? 32 +
                                  stackbar.paddingTop +
                                  stackbar.paddingBottom +
                                  stackbar.height
                                : 0),
                    )
                "
                :style="{
                    pointerEvents: 'none',
                }"
            >
                <slot name="chart-background" />
            </foreignObject>

            <line
                v-if="hill.baseline.show"
                :x1="geometry.startX"
                :x2="geometry.endX"
                :y1="geometry.baseY"
                :y2="geometry.baseY"
                :stroke="hill.baseline.stroke"
                :stroke-width="hill.baseline.strokeWidth"
                :stroke-dasharray="hill.baseline.strokeDasharray"
                vector-effect="non-scaling-stroke"
            />

            <line
                v-if="hill.midline.show"
                :x1="geometry.centerX"
                :x2="geometry.centerX"
                :y1="geometry.peakY"
                :y2="geometry.baseY"
                :stroke="hill.midline.stroke"
                :stroke-width="hill.midline.strokeWidth"
                :stroke-dasharray="hill.midline.strokeDasharray"
                vector-effect="non-scaling-stroke"
            />

            <path
                :d="hillPath"
                fill="none"
                :stroke="hill.curve.stroke"
                :stroke-width="hill.curve.strokeWidth"
                :stroke-dasharray="hill.curve.strokeDasharray"
                stroke-linecap="round"
                stroke-linejoin="round"
                vector-effect="non-scaling-stroke"
            />

            <!-- POSITION INFO -->
            <template
                v-if="
                    FINAL_CONFIG.style.chart.layout.plots.dragMarker
                        .positionIndicator.show
                "
            >
                <g
                    v-for="datapoint in orderedLaidOutDataset"
                    :key="`position-indicator-${datapoint.id}`"
                >
                    <g
                        v-if="
                            isPositionIndicatorVisible(datapoint) &&
                            plots.dragMarker.show
                        "
                        pointer-events="none"
                    >
                        <path
                            :d="`M${datapoint.x},${datapoint.y} ${datapoint.x},${geometry.baseY}`"
                            :stroke="
                                FINAL_CONFIG.style.chart.layout.plots.dragMarker
                                    .positionIndicator.useSerieColor
                                    ? datapoint.color
                                    : FINAL_CONFIG.style.chart.layout.plots
                                          .dragMarker.positionIndicator.color
                            "
                            :stroke-width="
                                FINAL_CONFIG.style.chart.layout.plots.dragMarker
                                    .positionIndicator.strokeWidth
                            "
                            :stroke-dasharray="
                                FINAL_CONFIG.style.chart.layout.plots.dragMarker
                                    .positionIndicator.strokeDasharray
                            "
                            stroke-linecap="round"
                            vector-effect="non-scaling-stroke"
                            :class="{
                                'vue-data-ui-transition':
                                    transitionEnabled &&
                                    dragState?.id !== datapoint.id,
                            }"
                        />

                        <circle
                            v-if="
                                FINAL_CONFIG.style.chart.layout.plots.dragMarker
                                    .positionIndicator.circle.show
                            "
                            :cx="datapoint.x"
                            :cy="geometry.baseY"
                            :r="
                                FINAL_CONFIG.style.chart.layout.plots.dragMarker
                                    .positionIndicator.circle.radius
                            "
                            :fill="
                                FINAL_CONFIG.style.chart.layout.plots.dragMarker
                                    .positionIndicator.useSerieColor
                                    ? datapoint.color
                                    : FINAL_CONFIG.style.chart.layout.plots
                                          .dragMarker.positionIndicator.color
                            "
                            :stroke="
                                FINAL_CONFIG.style.chart.layout.plots.dragMarker
                                    .positionIndicator.circle.stroke
                            "
                            :stroke-width="
                                FINAL_CONFIG.style.chart.layout.plots.dragMarker
                                    .positionIndicator.circle.strokeWidth
                            "
                            vector-effect="non-scaling-stroke"
                            paint-order="stroke fill"
                            :class="{
                                'vue-data-ui-transition':
                                    transitionEnabled &&
                                    dragState?.id !== datapoint.id,
                            }"
                        />

                        <text
                            v-if="
                                FINAL_CONFIG.style.chart.layout.plots.dragMarker
                                    .positionIndicator.value.show
                            "
                            paint-order="stroke fill"
                            vector-effect="non-scaling-stroke"
                            text-anchor="middle"
                            :transform="`translate(${datapoint.x}, ${
                                geometry.baseY +
                                FINAL_CONFIG.style.chart.layout.plots.radius +
                                FINAL_CONFIG.style.chart.layout.plots.dragMarker
                                    .positionIndicator.value.offsetY +
                                FINAL_CONFIG.style.chart.layout.plots.dragMarker
                                    .positionIndicator.value.fontSize
                            })`"
                            :font-size="
                                FINAL_CONFIG.style.chart.layout.plots.dragMarker
                                    .positionIndicator.value.fontSize
                            "
                            :fill="
                                FINAL_CONFIG.style.chart.layout.plots.dragMarker
                                    .positionIndicator.value.useSerieColor
                                    ? datapoint.color
                                    : FINAL_CONFIG.style.chart.layout.plots
                                          .dragMarker.positionIndicator.value
                                          .color
                            "
                            :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                            stroke-width="1"
                            :class="{
                                'vue-data-ui-transition':
                                    transitionEnabled &&
                                    dragState?.id !== datapoint.id,
                            }"
                        >
                            {{ formatPosition(datapoint) }}
                        </text>
                    </g>
                </g>
            </template>

            <g
                v-for="datapoint in orderedLaidOutDataset"
                :key="datapoint.id"
                data-cy-datapoint
                :class="{
                    'vue-ui-hill__datapoint': true,
                    'vue-data-ui-transition':
                        transitionEnabled && dragState?.id !== datapoint.id,
                    'vue-ui-hill__datapoint--promoted':
                        transitionEnabled &&
                        datapoint.isPromotedFromStackOverflow,
                }"
                :style="{
                    opacity:
                        [0, 1].includes(datapoint.position) || datapoint?.muted
                            ? plots.mutedOpacity
                            : datapoint?.disabled
                              ? plots.disabledOpacity
                              : 1,
                }"
                :transform="`translate(${datapoint.x} ${datapoint.y})`"
                :data-datapoint-index="datapoint.__index"
                :data-datapoint-id="datapoint.id"
                role="slider"
                :tabindex="
                    isEditing && isEditable && !datapoint.disabled ? 0 : -1
                "
                aria-orientation="horizontal"
                aria-valuemin="0"
                aria-valuemax="100"
                :aria-valuenow="formatPosition(datapoint)"
                :aria-valuetext="`${datapoint.label}: ${phaseText(datapoint.position)}, ${formatPosition(datapoint)}`"
                :aria-label="datapoint.label"
                @focus="onDatapointFocus(datapoint)"
                @blur="onDatapointBlur(datapoint)"
                @keydown="onKeydown($event, datapoint)"
                @pointerenter="onDatapointEnter(datapoint)"
                @pointerleave="onDatapointLeave(datapoint)"
                @click="onDatapointClick(datapoint)"
            >
                <circle
                    :r="plots.hitRadius"
                    fill="transparent"
                    :class="{
                        'vue-ui-hill__hit-area--active':
                            isEditing && isEditable && !datapoint.disabled,
                        'vue-ui-hill__hit-area--dragging':
                            dragState?.id === datapoint.id,
                    }"
                    @pointerdown="onPointerDown($event, datapoint)"
                />

                <circle
                    class="vue-ui-hill-circle"
                    :r="plots.radius"
                    :fill="datapoint.color"
                    :stroke="plots.stroke"
                    :stroke-width="plots.strokeWidth"
                    :style="{
                        filter: plots.shadow.show
                            ? `drop-shadow(${plots.shadow.offsetX}px ${plots.shadow.offsetY}px ${plots.shadow.blur}px ${plots.shadow.color})`
                            : 'none',
                    }"
                    vector-effect="non-scaling-stroke"
                    pointer-events="none"
                />

                <g
                    v-if="
                        isEditing &&
                        ((dragState?.id === datapoint.id &&
                            plots.dragMarker.show) ||
                            isPositionIndicatorVisible(datapoint)) &&
                        !datapoint?.disabled
                    "
                    fill="none"
                    :stroke="adaptColorToBackground(datapoint.color)"
                    :stroke-width="plots.dragMarker.strokeWidth"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    pointer-events="none"
                    vector-effect="non-scaling-stroke"
                    aria-hidden="true"
                >
                    <path :d="plots.dragMarker.crossPath" />
                </g>

                <text
                    v-if="itemLabels.show"
                    :x="datapoint.labelX"
                    :y="itemLabels.offsetY"
                    :text-anchor="datapoint.textAnchor"
                    :fill="
                        itemLabels.useSerieColor
                            ? datapoint.color
                            : itemLabels.color
                    "
                    :font-size="itemLabels.fontSize"
                    :font-weight="itemLabels.bold ? 'bold' : 'normal'"
                    paint-order="stroke fill"
                    :stroke="itemLabels.stroke"
                    :stroke-width="itemLabels.strokeWidth"
                    stroke-linejoin="round"
                    stroke-linecap="round"
                    pointer-events="none"
                    style="user-select: none"
                    dominant-baseline="central"
                >
                    {{
                        applyEllipsis(
                            datapoint.label,
                            itemLabels.ellipsisThresholdChars,
                        )
                    }}
                </text>
            </g>

            <!-- STACK OVERFLOW SUMMARY MARKERS -->
            <g
                v-for="marker in stackOverflowMarkers"
                :key="`stack-overflow-${marker.stackId}`"
                class="vue-ui-hill__stack-overflow-marker"
                :class="{
                    'vue-ui-hill__stack-overflow-marker--animated':
                        transitionEnabled,
                    'vue-ui-hill__stack-overflow-marker--restored':
                        restoredOverflowStackId === marker.stackId,
                }"
                :style="{
                    '--vue-ui-hill-overflow-marker-duration': `${stackOverflow.transitionDuration * 0.7}ms`,
                    '--vue-ui-hill-overflow-marker-delay': `${stackOverflow.transitionDuration * 0.3}ms`,
                    '--vue-ui-hill-overflow-label-duration': `${stackOverflow.transitionDuration * 0.55}ms`,
                    '--vue-ui-hill-overflow-label-delay': `${stackOverflow.transitionDuration * 0.45}ms`,
                    cursor:
                        isCursorPointer && !FINAL_CONFIG.readonly
                            ? 'pointer'
                            : 'default',
                }"
                :transform="`translate(${marker.x} ${marker.y})`"
                data-stack-overflow-marker
                role="button"
                :tabindex="isEditing && isEditable ? 0 : -1"
                :aria-label="`${marker.hiddenCount} stacked datapoints. Activate to choose one.`"
                :aria-expanded="openOverflowStackId === marker.stackId"
                @pointerdown.stop
                @click.stop="openOverflowMenu(marker)"
                @focus="openOverflowMenu(marker)"
                @keydown.enter.prevent.stop="openOverflowMenu(marker)"
                @keydown.space.prevent.stop="openOverflowMenu(marker)"
                @keydown.esc.prevent.stop="closeOverflowMenu"
            >
                <g
                    v-if="
                        transitionEnabled &&
                        restoredOverflowStackId !== marker.stackId
                    "
                    class="vue-ui-hill__stack-overflow-collapse-ghosts"
                    pointer-events="none"
                    aria-hidden="true"
                >
                    <circle
                        v-for="ghost in marker.collapseDatapoints"
                        :key="`overflow-ghost-${marker.stackId}-${ghost.id}`"
                        :cx="ghost.relativeX"
                        :cy="ghost.relativeY"
                        :r="plots.radius"
                        :fill="ghost.color"
                        :stroke="plots.stroke"
                        :stroke-width="plots.strokeWidth"
                        opacity="0.8"
                        vector-effect="non-scaling-stroke"
                    >
                        <animate
                            attributeName="cx"
                            :from="ghost.relativeX"
                            to="0"
                            :dur="`${stackOverflow.transitionDuration}ms`"
                            fill="freeze"
                            calcMode="spline"
                            keyTimes="0;1"
                            keySplines="0.22 1 0.36 1"
                        />
                        <animate
                            attributeName="cy"
                            :from="ghost.relativeY"
                            to="0"
                            :dur="`${stackOverflow.transitionDuration}ms`"
                            fill="freeze"
                            calcMode="spline"
                            keyTimes="0;1"
                            keySplines="0.22 1 0.36 1"
                        />
                        <animate
                            attributeName="r"
                            :from="plots.radius"
                            :to="stackOverflow.marker.radius * 0.7"
                            :dur="`${stackOverflow.transitionDuration}ms`"
                            fill="freeze"
                        />
                        <animate
                            attributeName="opacity"
                            from="0.8"
                            to="0"
                            :dur="`${stackOverflow.transitionDuration * 0.85}ms`"
                            fill="freeze"
                        />
                    </circle>
                </g>

                <circle
                    :r="Math.max(plots.hitRadius, stackOverflow.marker.radius)"
                    fill="transparent"
                    pointer-events="all"
                />

                <rect
                    class="vue-ui-hill__stack-overflow-marker-rect"
                    :x="-stackOverflow.marker.radius"
                    :y="-stackOverflow.marker.radius"
                    :width="stackOverflow.marker.radius * 2"
                    :height="stackOverflow.marker.radius * 2"
                    :fill="stackOverflow.marker.fill"
                    :stroke="stackOverflow.marker.stroke"
                    :stroke-width="stackOverflow.marker.strokeWidth"
                    vector-effect="non-scaling-stroke"
                    pointer-events="none"
                />

                <g
                    class="vue-ui-hill__stack-overflow-focus-cross"
                    fill="none"
                    :stroke="adaptColorToBackground(hill.curve.stroke)"
                    :stroke-width="plots.dragMarker.strokeWidth"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    pointer-events="none"
                    vector-effect="non-scaling-stroke"
                    aria-hidden="true"
                >
                    <path :d="plots.dragMarker.crossPath" />
                </g>

                <text
                    v-if="!activeOverflowMenu"
                    class="vue-ui-hill__stack-overflow-marker-label"
                    text-anchor="middle"
                    :y="
                        stackOverflow.marker.radius +
                        stackOverflow.marker.offsetY +
                        stackOverflow.marker.fontSize
                    "
                    :fill="stackOverflow.marker.color"
                    :font-size="stackOverflow.marker.fontSize"
                    :font-weight="stackOverflow.marker.bold ? 'bold' : 'normal'"
                    pointer-events="none"
                    style="user-select: none"
                    paint-order="stroke fill"
                    vector-effect="non-scaling-stroke"
                    :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                    stroke-width="3"
                >
                    +{{ marker.hiddenCount }}
                </text>
            </g>

            <template v-if="phaseLabels.show">
                <text
                    :x="(geometry.startX + geometry.centerX) / 2"
                    :y="phaseLabelY"
                    text-anchor="middle"
                    :fill="phaseLabels.color"
                    :font-size="phaseLabels.fontSize"
                    :font-weight="phaseLabels.bold ? 'bold' : 'normal'"
                    :letter-spacing="phaseLabels.letterSpacing"
                >
                    {{ phaseLabelText('left') }}
                </text>

                <text
                    :x="(geometry.centerX + geometry.endX) / 2"
                    :y="phaseLabelY"
                    text-anchor="middle"
                    :fill="phaseLabels.color"
                    :font-size="phaseLabels.fontSize"
                    :font-weight="phaseLabels.bold ? 'bold' : 'normal'"
                    :letter-spacing="phaseLabels.letterSpacing"
                >
                    {{ phaseLabelText('right') }}
                </text>
            </template>

            <!-- STACKBAR-->
            <template v-if="showStackbar">
                <!-- GUTTER -->
                <rect
                    :x="geometry.left[0].x"
                    :y="stackBarY"
                    :rx="stackbar.height / 2"
                    :width="geometry.width"
                    :height="stackbar.height"
                    :fill="stackbar.gutterColor"
                />

                <defs>
                    <clipPath :id="stackBarClipId">
                        <rect
                            :x="geometry.left[0].x"
                            :y="stackBarY"
                            :width="geometry.width * stackBarFilledProportion"
                            :height="stackbar.height"
                            :rx="
                                Math.min(
                                    stackbar.height / 2,
                                    (geometry.width *
                                        stackBarFilledProportion) /
                                        2,
                                )
                            "
                            :ry="
                                Math.min(
                                    stackbar.height / 2,
                                    (geometry.width *
                                        stackBarFilledProportion) /
                                        2,
                                )
                            "
                        />
                    </clipPath>
                </defs>

                <!-- FILLS -->
                <g :clip-path="`url(#${stackBarClipId})`">
                    <rect
                        v-for="dp in globalStatus"
                        :key="`bar_fill_${dp.id}`"
                        :width="geometry.width * dp.proportion"
                        :x="
                            geometry.left[0].x +
                            geometry.width * dp.proportionStart
                        "
                        :y="chart.height + 32 + stackbar.paddingTop"
                        :fill="dp.color"
                        :height="stackbar.height"
                        @pointerenter="onDatapointEnter(dp)"
                        @pointerleave="onDatapointLeave(dp)"
                    />
                </g>

                <!-- INTERNAL SEPARATORS -->
                <line
                    v-for="dp in globalStatus.slice(1)"
                    :key="`bar_separator_${dp.id}`"
                    :x1="
                        geometry.left[0].x + geometry.width * dp.proportionStart
                    "
                    :x2="
                        geometry.left[0].x + geometry.width * dp.proportionStart
                    "
                    :y1="chart.height + 32 + stackbar.paddingTop"
                    :y2="
                        chart.height +
                        32 +
                        stackbar.paddingTop +
                        stackbar.height
                    "
                    :stroke="stackbar.stroke"
                    :stroke-width="stackbar.strokeWidth"
                    vector-effect="non-scaling-stroke"
                />

                <!-- OUTER ROUNDED STROKE -->
                <rect
                    :x="geometry.left[0].x"
                    :y="chart.height + 32 + stackbar.paddingTop"
                    :width="geometry.width * stackBarFilledProportion"
                    :height="stackbar.height"
                    :rx="
                        Math.min(
                            stackbar.height / 2,
                            (geometry.width * stackBarFilledProportion) / 2,
                        )
                    "
                    :ry="
                        Math.min(
                            stackbar.height / 2,
                            (geometry.width * stackBarFilledProportion) / 2,
                        )
                    "
                    fill="none"
                    :stroke="stackbar.stroke"
                    :stroke-width="stackbar.strokeWidth"
                    vector-effect="non-scaling-stroke"
                />

                <!-- TOTAL PROGRESS LABEL -->
                <text
                    v-if="stackbar.label.show && stackBarFilledProportion > 0"
                    :x="stackBarEndX"
                    :y="stackBarY - 6"
                    :fill="stackbar.label.color"
                    :font-size="stackbar.label.fontSize"
                    text-anchor="end"
                    dominant-baseline="auto"
                    pointer-events="none"
                    style="user-select: none"
                >
                    {{ formatStackBarProgress() }}
                </text>
            </template>

            <slot
                name="svg"
                :svg="{
                    drawingArea: geometry,
                    isEditing,
                    datapoints: orderedLaidOutDataset,
                    isPrintingImg: isPrinting || isImaging || isCallbackImaging,
                    isPrintingSvg: isCallbackSvg,
                }"
            />
        </svg>

        <!-- STACK OVERFLOW SELECTION MENU -->
        <div
            v-if="activeOverflowMenu"
            ref="overflowMenuRef"
            :key="`stack-overflow-menu-${activeOverflowMenu.stackId}`"
            class="vue-ui-hill__stack-overflow-menu"
            data-stack-overflow-menu
            data-dom-to-png-ignore
            :style="[overflowMenuBaseStyle, overflowMenuStyle]"
            role="listbox"
            :aria-label="`Choose one of ${activeOverflowMenu.hiddenCount} stacked datapoints`"
            @pointerdown.stop
            @click.stop
            @keydown.esc.prevent.stop="closeOverflowMenu"
        >
            <div
                class="vue-ui-hill__stack-overflow-menu-title"
                v-if="
                    FINAL_CONFIG.style.chart.layout.plots.stacking.overflow.menu
                        .title
                "
            >
                {{
                    FINAL_CONFIG.style.chart.layout.plots.stacking.overflow.menu
                        .title
                }}
            </div>

            <button
                v-for="datapoint in activeOverflowMenu.hiddenDatapoints"
                :key="`hidden-${datapoint.id}`"
                type="button"
                class="vue-ui-hill__stack-overflow-menu-item"
                :class="{ readonly: FINAL_CONFIG.readonly }"
                role="option"
                :disabled="datapoint.disabled"
                :aria-label="`${datapoint.label}, ${formatPosition(datapoint)}`"
                @click.stop="selectOverflowDatapoint(datapoint)"
                :style="{
                    cursor:
                        isCursorPointer && !FINAL_CONFIG.readonly
                            ? 'pointer'
                            : 'default',
                }"
            >
                <span
                    class="vue-ui-hill__stack-overflow-menu-swatch"
                    :style="{ backgroundColor: datapoint.color }"
                    aria-hidden="true"
                />
                <span class="vue-ui-hill__stack-overflow-menu-label">
                    {{
                        applyEllipsis(
                            datapoint.label,
                            itemLabels.ellipsisThresholdChars,
                        )
                    }}
                </span>
                <span class="vue-ui-hill__stack-overflow-menu-value">
                    {{ formatPosition(datapoint) }}
                </span>
            </button>
        </div>

        <slot name="analysis" :data="{ ...globalStatus }" />

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot
                name="watermark"
                v-bind="{
                    isPrinting:
                        isPrinting ||
                        isImaging ||
                        isCallbackImaging ||
                        isCallbackSvg,
                }"
            />
        </div>

        <div
            class="vue-ui-hill__loading"
            v-if="FINAL_CONFIG.loading"
            data-dom-to-png-ignore
        >
            <slot name="loading" v-if="FINAL_CONFIG.loading">
                <BaseIcon
                    name="spinner2"
                    :stroke="FINAL_CONFIG.style.chart.color"
                    :is-spin="true"
                />
            </slot>
        </div>
    </div>
</template>

<style scoped>
@import '../vue-data-ui.css';
.vue-ui-hill * {
    transition: unset;
}

.vue-ui-hill {
    position: relative;
}

.vue-ui-hill__loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

.vue-ui-hill *,
.vue-ui-hill *::before,
.vue-ui-hill *::after {
    box-sizing: border-box;
}

.vue-ui-hill__title {
    margin: 0;
}

.vue-ui-hill__subtitle {
    margin-top: 2px;
}

.vue-ui-hill__toolbar {
    align-items: center;
}

.vue-ui-hill__status {
    margin: 0;
    text-align: center;
}

.vue-ui-hill__datapoint {
    -webkit-tap-highlight-color: transparent;
}

.vue-ui-hill__datapoint:focus,
.vue-ui-hill__datapoint:focus-visible {
    outline: none !important;
    box-shadow: none !important;
}

.vue-ui-hill__hit-area--active {
    cursor: grab;
    pointer-events: all;
}

.vue-ui-hill__hit-area--dragging {
    cursor: grabbing;
}

.vue-data-ui-transition {
    transition: all 0.2s ease-in-out;
}

.vue-ui-hill__datapoint--promoted {
    animation: vueUiHillPromotedDatapointEnter 220ms
        cubic-bezier(0.22, 1, 0.36, 1) both;
}

.vue-ui-hill__datapoint--promoted .vue-ui-hill-circle {
    transform-box: fill-box;
    transform-origin: center;
    animation: vueUiHillPromotedDatapointPop 280ms
        cubic-bezier(0.22, 1, 0.36, 1) both;
}

.vue-ui-hill__stack-overflow-marker {
    outline: none;
}

.vue-ui-hill__stack-overflow-marker:focus,
.vue-ui-hill__stack-overflow-marker:focus-visible {
    outline: none;
}

.vue-ui-hill__stack-overflow-marker--animated
    .vue-ui-hill__stack-overflow-marker-circle {
    transform-box: fill-box;
    transform-origin: center;
    animation: vueUiHillOverflowMarkerEnter
        var(--vue-ui-hill-overflow-marker-duration)
        cubic-bezier(0.22, 1, 0.36, 1) var(--vue-ui-hill-overflow-marker-delay)
        both;
}

.vue-ui-hill__stack-overflow-marker--animated
    .vue-ui-hill__stack-overflow-marker-label {
    animation: vueUiHillOverflowLabelEnter
        var(--vue-ui-hill-overflow-label-duration) ease-out
        var(--vue-ui-hill-overflow-label-delay) both;
}

.vue-ui-hill__stack-overflow-marker--restored
    .vue-ui-hill__stack-overflow-marker-circle,
.vue-ui-hill__stack-overflow-marker--restored
    .vue-ui-hill__stack-overflow-marker-label {
    animation-delay: 0ms;
}

@keyframes vueUiHillOverflowMarkerEnter {
    from {
        opacity: 0;
        transform: scale(0.65);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes vueUiHillOverflowLabelEnter {
    from {
        opacity: 0;
        transform: translateY(3px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes vueUiHillPromotedDatapointEnter {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes vueUiHillPromotedDatapointPop {
    from {
        opacity: 0;
        transform: scale(0.6);
    }

    70% {
        opacity: 1;
        transform: scale(1.1);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.vue-ui-hill__stack-overflow-menu {
    position: absolute;
    z-index: 10;
    width: max-content;
    height: auto;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 6px;
    border: 1px solid;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
    font-family: inherit;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
    transform-origin: top center;
}

.vue-ui-hill__stack-overflow-menu-title {
    padding: 4px 6px 6px;
    font-size: 12px;
    font-weight: 700;
}

.vue-ui-hill__stack-overflow-menu-item {
    appearance: none;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 8px;
    width: 100%;
    min-height: 32px;
    margin: 0;
    padding: 5px 6px;
    color: inherit;
    background: transparent;
    border: 0;
    border-radius: 4px;
    font: inherit;
    text-align: left;
}

.vue-ui-hill__stack-overflow-menu-item:not(.readonly):hover,
.vue-ui-hill__stack-overflow-menu-item:not(.readonly):focus-visible {
    background: rgba(127, 127, 127, 0.14);
}

.vue-ui-hill__stack-overflow-menu-item:focus-visible {
    outline: 1px solid currentColor;
    outline-offset: -1px;
}

.vue-ui-hill__stack-overflow-menu-item:disabled {
    cursor: not-allowed;
    opacity: 0.45;
}

.vue-ui-hill__stack-overflow-menu-swatch {
    width: 10px;
    height: 10px;
    border-radius: 50%;
}

.vue-ui-hill__stack-overflow-menu-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.vue-ui-hill__stack-overflow-menu-value {
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
}

.vue-ui-hill__stack-overflow-focus-cross {
    opacity: 0;
    transition: opacity 120ms ease-in-out;
}

.vue-ui-hill__stack-overflow-marker:focus
    .vue-ui-hill__stack-overflow-focus-cross,
.vue-ui-hill__stack-overflow-marker:hover
    .vue-ui-hill__stack-overflow-focus-cross,
.vue-ui-hill__stack-overflow-marker:focus-visible
    .vue-ui-hill__stack-overflow-focus-cross {
    opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
    .vue-data-ui-component * {
        transition: none !important;
        animation: none !important;
    }
}

.vue-data-ui-no-transition * {
    transition: none !important;
    animation: none !important;
}
</style>
