<script setup>
import {
    getUserOptionsProps,
    getUserOptionSlots,
    getUserOptionSlotProps,
} from '../userOptionsSlots';
import { getAnnotatorProps } from '../annotatorConfig';
import { createPanZoomAnnotationViewport } from '../utils/annotationViewport';
import { getTableComponent, syncTableVisibility } from '../tableIntegration';
import {
    annotationSlotNames,
    getAnnotationSlotProps,
} from '../annotationSlots';

import { createChartImageGetter } from '../chartImage';
import { resolveChartConfigWithPalette } from '../resolveChartConfig';
import {
    computed,
    defineAsyncComponent,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    shallowRef,
    toRefs,
    watch,
} from 'vue';
import {
    stringifyChartConfig as stringifyStructuralConfig,
    XMLNS,
    adaptColorToBackground,
    applyDataLabel,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createTSpans,
    createUid,
    darkenHexColor,
    dataLabel,
    downloadCsv,
    error,
    isFunction,
    lightenHexColor,
    objectIsEmpty,
    palette,
    svgToClientCoords,
    themePalettes,
    treeShake,
} from '../lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { usePrinter } from '../usePrinter';
import { useLoading } from '../useLoading';
import { pack, bounds } from '../packCircles';

import { useResponsive } from '../useResponsive';
import { useChartExport } from '../useChartExport';
import { useTransitions } from '../useTransitions.js';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import themes from '../themes/vue_ui_circle_pack.json';
import BaseScanner from '../atoms/BaseScanner.vue';
import usePanZoom from '../usePanZoom';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import DefGrad from '../atoms/DefGrad.vue';

const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const UserOptions = defineAsyncComponent(
    () => import('../atoms/UserOptions.vue'),
);
const PenAndPaper = defineAsyncComponent(
    () => import('../atoms/PenAndPaper.vue'),
);
const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);
const BaseDraggableDialog = defineAsyncComponent(
    () => import('../atoms/BaseDraggableDialog.vue'),
);

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

const emit = defineEmits(['selectDatapoint', 'copyAlt']);

const { vue_ui_circle_pack: DEFAULT_CONFIG } = useConfig();

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

const uid = ref(createUid());
const circlePackChart = ref(null);
const chartTitle = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const step = ref(0);
const source = ref(null);
const tableUnit = ref(null);
const userOptionsRef = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref('');
const selectedId = ref(null);
const selectedDatapoint = computed(
    () => circleById.value.get(selectedId.value) ?? null,
);

const activeTooltipIndex = ref(null); // a11y
const tooltipA11yPosition = ref({ x: 0, y: 0 }); // a11y
const tooltipTriggerMode = ref('pointer'); // a11y
const isFocus = ref(false); // a11y

const FINAL_CONFIG = ref(prepareConfig());
const cfgLabels = computed(() => FINAL_CONFIG.value.style.chart.circles.labels);
const cfgCircles = computed(() => FINAL_CONFIG.value.style.chart.circles);
const cfgChart = computed(() => FINAL_CONFIG.value.style.chart);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiCirclePack',
    rules: [
        COMMON_RULES.emptyArray,
        {
            test: (ds) =>
                ds.length === 1 &&
                (!ds[0].children || ds[0]?.children.length === 0),
            message: [
                '👀 The dataset only has a single series. Consider:',
                '',
                '▶️ Using a value display instead of a chart component, or using VueUiKpi.',
            ],
        },
        {
            test: (ds) =>
                ds.length === 1 &&
                ds[0]?.children &&
                ds[0]?.children.length < 6,
            message: [
                '👀 The number of datapoints is probably too low for this type of chart. Consider:',
                '',
                '▶️ Using VueUiDonut or VueUiWaffle instead.',
            ],
        },
    ],
});

const { transitionEnabled } = useTransitions({
    config: () => FINAL_CONFIG.value.transitions,
    dataset: () => props.dataset,
});

const isCursorPointer = computed(
    () => FINAL_CONFIG.value.userOptions.useCursorPointer,
);

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            userOptions: { show: false },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    circles: {
                        stroke: '#6A6A6A',
                        labels: {
                            name: { show: false },
                            value: { show: false },
                        },
                    },
                },
            },
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {},
    });
});

const { loading, FINAL_DATASET } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: props.config?.skeletonDataset ?? [
        { name: '_', value: 13, color: '#F2F2F2' },
        { name: '_', value: 8, color: '#DBDBDB' },
        { name: '_', value: 5, color: '#ADADAD' },
        { name: '_', value: 3, color: '#969696' },
        { name: '_', value: 2, color: '#808080' },
        { name: '_', value: 1, color: '#696969' },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value,
    }),
});

const { svgRef } = useChartAccessibility({
    config: cfgChart.value.title,
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } =
    useUserOptionState({ config: FINAL_CONFIG.value });

function prepareConfig() {
    return resolveChartConfigWithPalette(props.config, DEFAULT_CONFIG, themes);
}

let previousStructuralConfig = stringifyStructuralConfig(props.config);

watch(
    () => props.config,
    (newConfig, oldConfig) => {
        const nextStructuralConfig = stringifyStructuralConfig(newConfig);

        const requiresChartPreparation =
            nextStructuralConfig !== previousStructuralConfig;

        previousStructuralConfig = nextStructuralConfig;

        const preparedConfig = prepareConfig();

        if (!requiresChartPreparation) {
            FINAL_CONFIG.value.style.chart.tooltip =
                preparedConfig.style.chart.tooltip;

            mutableConfig.value.showTooltip =
                FINAL_CONFIG.value.style.chart.tooltip.show;

            return;
        }

        if (!loading.value) FINAL_CONFIG.value = preparedConfig;
        userOptionsVisible.value =
            !FINAL_CONFIG.value.userOptions.showOnChartHover;
        titleStep.value += 1;
        tableStep.value += 1;

        // Reset mutable config
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        mutableConfig.value.showTooltip = cfgChart.value.tooltip.show;
        mutableConfig.value.showZoom = cfgChart.value.zoom?.show ?? false;
    },
    { deep: true },
);

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-circle-pack_${uid.value}`,
    fileName: cfgChart.value.title.text || 'vue-ui-circle-pack',
    options: FINAL_CONFIG.value.userOptions.print,
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !cfgChart.value.title.text;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: cfgChart.value.tooltip.show,
    showZoom: cfgChart.value.zoom?.show ?? false,
});

// v3 - Essential to make shifting between loading config and final config work
watch(
    FINAL_CONFIG,
    () => {
        mutableConfig.value = {
            showTable: FINAL_CONFIG.value.table.show,
            showTooltip: cfgChart.value.tooltip.show,
            showZoom: cfgChart.value.zoom?.show ?? false,
        };
    },
    { immediate: true },
);

const SIZE = ref({ h: 10, w: 10 });
const initialParentTooltipViewBox = ref({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
});

const debug = computed(() => FINAL_CONFIG.value.debug);

const packingWidth = computed(() => {
    const style = FINAL_CONFIG.value.style?.chart || {};
    if (
        style.dimensions &&
        Number.isFinite(style.dimensions.width) &&
        style.dimensions.width > 0
    ) {
        return style.dimensions.width;
    }
    if (Number.isFinite(style.width) && style.width > 0) {
        return style.width;
    }
    return 300;
});

const packingHeight = computed(() => {
    const style = FINAL_CONFIG.value.style?.chart || {};
    if (
        style.dimensions &&
        Number.isFinite(style.dimensions.height) &&
        style.dimensions.height > 0
    ) {
        return style.dimensions.height;
    }
    if (Number.isFinite(style.height) && style.height > 0) {
        return style.height;
    }
    return 300;
});

const packedCircles = ref([]);
let packedSignature = null;
const formattedById = computed(() => {
    const map = new Map();
    function walk(items) {
        for (const item of items) {
            map.set(item.id, item);
            walk(item.children);
        }
    }
    walk(formattedDataset.value);
    return map;
});
function decoratePackedCircle(circle) {
    const current = formattedById.value.get(circle.id) || circle;
    return {
        ...circle,
        ...current,
        ...(Object.hasOwn(circle, 'x') ? { x: circle.x, y: circle.y } : {}),
        r: circle.r,
        children: (circle.children || []).map(decoratePackedCircle),
    };
}
const circles = computed(() => packedCircles.value.map(decoratePackedCircle));
const circleById = computed(
    () => new Map(circles.value.map((circle) => [circle.id, circle])),
);
const resizeObserver = shallowRef(null);
let resizeFrame = null;
let scheduleResize = null;
let disposed = false;
function fitPacking(
    source,
    width,
    height,
    centerX = width / 2,
    centerY = height / 2,
    padding = 1,
) {
    const packed = pack(
        source.map((circle) => ({ ...circle })),
        height,
        width,
    );
    if (!packed.length) return [];
    const [x, y, bw, bh] = bounds(packed, 1);
    const scale = Math.min(bw ? width / bw : 1, bh ? height / bh : 1) * padding;
    return packed.map((circle) => ({
        ...circle,
        x: (circle.x - x) * scale + centerX - (bw * scale) / 2,
        y: (circle.y - y) * scale + centerY - (bh * scale) / 2,
        r: circle.r * scale,
    }));
}
function refreshInitialViewBox() {
    const base = { x: 0, y: 0, width: SIZE.value.w, height: SIZE.value.h };
    const initial = circles.value.length
        ? getViewBoxIncludingParentTooltips(base)
        : base;
    initialParentTooltipViewBox.value = { ...initial };
    setInitialViewBox(initial);
}
function recomputePacking(width, height) {
    packedSignature = packingSignature.value;
    SIZE.value = { w: width, h: height };
    packedCircles.value = flattenPackedCircles(
        fitPacking(formattedDataset.value, width, height),
    );
    refreshInitialViewBox();
}
const resolvedPalette = computed(() => {
    const theme =
        themePalettes[FINAL_CONFIG.value.theme || 'default'] || palette;
    return customPalette.value.length
        ? customPalette.value
        : theme.length
          ? theme
          : palette;
});
function normalizeDataset(source, parent = null, depth = 0, path = []) {
    if (!Array.isArray(source)) return [];
    const seenIds = new Map();
    return source
        .map((datapoint, index) => {
            if (!datapoint || typeof datapoint !== 'object') return null;
            const hierarchyPath = [...path, index];
            const baseId =
                datapoint.id == null
                    ? `circle_pack_${uid.value}_${hierarchyPath.join('_')}`
                    : `${parent?.id ?? `circle_pack_${uid.value}`}_id_${Array.from(String(datapoint.id), (character) => character.codePointAt(0).toString(16)).join('_')}`;
            const occurrence = seenIds.get(baseId) || 0;
            seenIds.set(baseId, occurrence + 1);
            const id = occurrence
                ? `${baseId}_duplicate_${occurrence}`
                : baseId;
            const colorIndex = hierarchyPath.reduce(
                (sum, item, i) => sum + item + i,
                0,
            );
            const color =
                convertColorToHex(datapoint.color || parent?.color) ||
                resolvedPalette.value[
                    colorIndex % resolvedPalette.value.length
                ];
            const children = normalizeDataset(
                datapoint.children,
                {
                    id,
                    name: datapoint.name,
                    color,
                    rootId: parent?.rootId ?? id,
                },
                depth + 1,
                hierarchyPath,
            );
            const own = Number(datapoint.value);
            const value =
                Number.isFinite(own) && own > 0
                    ? own
                    : children.reduce((sum, child) => sum + child.value, 0);
            if (!Number.isFinite(value) || value <= 0) return null;
            return {
                ...datapoint,
                value,
                r: value,
                id,
                color,
                depth,
                parentId: parent?.id ?? null,
                parentName: parent?.name ?? null,
                rootId: parent?.rootId ?? id,
                hasChildren: children.length > 0,
                childCount: children.length,
                leafCount: children.length
                    ? children.reduce((sum, child) => sum + child.leafCount, 0)
                    : 1,
                hierarchyPath,
                children,
            };
        })
        .filter(Boolean);
}
function flattenPackedCircles(source) {
    const result = [];
    for (const circle of source) {
        const size = circle.r * 2;
        const children =
            circle.children?.length && size
                ? fitPacking(
                      circle.children,
                      size,
                      size,
                      circle.x,
                      circle.y,
                      0.9,
                  )
                : [];
        result.push({ ...circle, children }, ...flattenPackedCircles(children));
    }
    return result;
}

function isDescendantOf(circle, possibleParent) {
    if (!circle || !possibleParent) return false;
    if (!Array.isArray(circle.hierarchyPath)) return false;
    if (!Array.isArray(possibleParent.hierarchyPath)) return false;
    if (circle.hierarchyPath.length <= possibleParent.hierarchyPath.length)
        return false;

    return possibleParent.hierarchyPath.every((pathItem, index) => {
        return circle.hierarchyPath[index] === pathItem;
    });
}

function canShowCircleLabel(circle) {
    if (circle.hasChildren) {
        return cfgLabels.value.parents.show;
    }
    return cfgLabels.value.children.show;
}

function teardownResponsiveObserver() {
    scheduleResize = null;
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = null;
    resizeObserver.value?.disconnect();
    resizeObserver.value = null;
    svgRef.value?.removeAttribute('width');
    svgRef.value?.removeAttribute('height');
}
function setupResponsiveObserver() {
    teardownResponsiveObserver();
    const parent = circlePackChart.value?.parentNode || circlePackChart.value;
    if (!FINAL_CONFIG.value.responsive || !parent) return;
    const resize = () => {
        if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
            resizeFrame = null;
            if (disposed) return;
            const { width, height } = useResponsive({
                chart: circlePackChart.value,
                title: cfgChart.value.title.text ? chartTitle.value : null,
                legend: null,
                source: source.value,
                noTitle: noTitle.value,
            });
            if (
                !Number.isFinite(width) ||
                !Number.isFinite(height) ||
                width <= 0 ||
                height <= 0
            )
                return;
            svgRef.value?.setAttribute('width', width);
            svgRef.value?.setAttribute('height', height);
            if (
                width !== SIZE.value.w ||
                height !== SIZE.value.h ||
                packedSignature !== packingSignature.value
            )
                recomputePacking(width, height);
        });
    };
    scheduleResize = resize;
    resizeObserver.value = new ResizeObserver(resize);
    resizeObserver.value.observe(parent);
    resize();
}
function prepareChart() {
    if (objectIsEmpty(props.dataset))
        error({
            componentName: 'VueUiCirclePack',
            type: 'dataset',
            debug: debug.value,
        });
    if (FINAL_CONFIG.value.responsive) setupResponsiveObserver();
    else {
        teardownResponsiveObserver();
        recomputePacking(packingWidth.value, packingHeight.value);
    }
}
onMounted(prepareChart);
onBeforeUnmount(() => {
    disposed = true;
    teardownResponsiveObserver();
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const formattedDataset = computed(() => normalizeDataset(FINAL_DATASET.value));

const maxRadius = computed(() => {
    return circles.value.length
        ? Math.max(...circles.value.map((c) => c.r))
        : 0;
});

function calcOffsetY(radius, offset) {
    if (!maxRadius.value) return 0;
    return (offset / maxRadius.value) * radius;
}

function onTrapLeave(datapoint, seriesIndex) {
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex });
    }
    if (
        tooltipTriggerMode.value === 'keyboard' &&
        selectedDatapoint.value?.id === datapoint?.id
    )
        return;
    isTooltip.value = false;
    selectedId.value = null;
    activeTooltipIndex.value = null;
    tooltipTriggerMode.value = 'pointer';
}

function onTrapClick(datapoint, seriesIndex) {
    emit('selectDatapoint', datapoint);
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex });
    }
}

const dataTooltipSlot = ref(null);
const useCustomFormat = ref(false);

function onTrapEnter(
    datapoint,
    seriesIndex,
    triggerMode = 'pointer',
    notify = true,
) {
    selectedId.value = datapoint.id;
    activeTooltipIndex.value = seriesIndex;
    tooltipTriggerMode.value = triggerMode;

    if (notify && FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex });
    }

    dataTooltipSlot.value = {
        datapoint,
        seriesIndex,
        config: FINAL_CONFIG.value,
        series: circles.value,
    };
    isTooltip.value = true;
    const customFormat = cfgChart.value.tooltip.customFormat;
    useCustomFormat.value = false;

    if (isFunction(customFormat)) {
        try {
            const customFormatString = customFormat({
                seriesIndex,
                datapoint,
                series: circles.value,
                config: FINAL_CONFIG.value,
            });
            if (typeof customFormatString === 'string') {
                tooltipContent.value = customFormatString;
                useCustomFormat.value = true;
            }
        } catch (err) {
            console.warn('Custom format cannot be applied.');
            useCustomFormat.value = false;
        }
    }

    if (!useCustomFormat.value) {
        let html = '';

        html += `
            <div style="display:flex;align-items:center;gap:4px;">
                <svg viewBox="0 0 10 10" height="${cfgChart.value.tooltip.fontSize}" width="${cfgChart.value.tooltip.fontSize}">
                    <circle
                        cx="5"
                        cy="5"
                        r="5"
                        fill="${cfgCircles.value.gradient.show ? `url(#${datapoint.id})` : datapoint.color}"
                    />
                </svg>
                <span>${datapoint.name}: <b>${getCircleLabel(datapoint)}</b></span>
            </div>
        `;

        tooltipContent.value = html;
    }
}

function formatCircleLabel(circle) {
    return applyDataLabel(
        cfgLabels.value.value.formatter,
        circle.value,
        dataLabel({
            p: cfgLabels.value.value.prefix,
            v: circle.value,
            s: cfgLabels.value.value.suffix,
            r: cfgLabels.value.value.rounding,
        }),
    );
}

const circleLabels = computed(
    () =>
        new Map(
            circles.value.map((circle) => {
                const label = formatCircleLabel(circle);
                const length = String(label).length || 1;
                return [
                    circle.id,
                    {
                        label,
                        fontSize: Math.min(
                            circle.r / 2.5,
                            (circle.r / length) * (length === 1 ? 1 : 2),
                        ),
                    },
                ];
            }),
        ),
);
function getCircleLabel(circle) {
    return (
        circleLabels.value.get(circle.id)?.label ?? formatCircleLabel(circle)
    );
}
function getValueFontSize(circle) {
    return circleLabels.value.get(circle?.id)?.fontSize ?? 0;
}
function getCircleNameColor(circle) {
    const color = cfgLabels.value.name.color;
    return !color || color === 'auto'
        ? adaptColorToBackground(circle.color)
        : color;
}
function circleBounds(circle) {
    return {
        x: circle.x - circle.r,
        y: circle.y - circle.r,
        width: circle.r * 2,
        height: circle.r * 2,
    };
}

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

const active = computed(
    () => !isAnnotator.value && mutableConfig.value.showZoom,
);

const { viewBox, resetZoom, isZoom, setInitialViewBox } = usePanZoom(
    svgRef,
    {
        x: 0,
        y: 0,
        width: Math.max(10, SIZE.value.w),
        height: Math.max(10, SIZE.value.h),
    },
    () => cfgChart.value.zoom?.speed ?? 1,
    active,
);

function rectanglesCollide(a, b, gap = 0) {
    return !(
        a.x + a.width + gap < b.x ||
        b.x + b.width + gap < a.x ||
        a.y + a.height + gap < b.y ||
        b.y + b.height + gap < a.y
    );
}

function rectangleCollidesWithCircle(rectangle, circle, gap = 0) {
    const closestX = Math.min(
        Math.max(circle.x, rectangle.x - gap),
        rectangle.x + rectangle.width + gap,
    );
    const closestY = Math.min(
        Math.max(circle.y, rectangle.y - gap),
        rectangle.y + rectangle.height + gap,
    );
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    return distanceX * distanceX + distanceY * distanceY <= circle.r * circle.r;
}

function clampRectangleToViewBox(rectangle, sourceViewBox, scale = 1) {
    const margin = Math.max(
        4 * scale,
        Math.min(sourceViewBox.width, sourceViewBox.height) * 0.01,
    );

    return {
        ...rectangle,
        x: Math.min(
            Math.max(rectangle.x, sourceViewBox.x + margin),
            sourceViewBox.x + sourceViewBox.width - rectangle.width - margin,
        ),
        y: Math.min(
            Math.max(rectangle.y, sourceViewBox.y + margin),
            sourceViewBox.y + sourceViewBox.height - rectangle.height - margin,
        ),
    };
}

function getParentTooltipTextLines(circle) {
    const lines = [circle.name];
    if (cfgLabels.value.value.show) {
        lines.push(getCircleLabel(circle));
    }
    return lines.filter(Boolean);
}

const tooltipDirections = {
    right: [1, 0],
    left: [-1, 0],
    top: [0, -1],
    bottom: [0, 1],
    topRight: [1, -1],
    topLeft: [-1, -1],
    bottomRight: [1, 1],
    bottomLeft: [-1, 1],
};
function getParentTooltipCandidateRect(
    circle,
    width,
    height,
    placement,
    distance,
) {
    const [dx, dy] = tooltipDirections[placement];
    const radius = circle.r * (dx && dy ? 0.7 : 1);
    const anchorX = circle.x + dx * radius,
        anchorY = circle.y + dy * radius;
    return {
        x:
            anchorX +
            dx * distance -
            (dx < 0 ? width : dx === 0 ? width / 2 : 0),
        y:
            anchorY +
            dy * distance -
            (dy < 0 ? height : dy === 0 ? height / 2 : 0),
        anchorX,
        anchorY,
    };
}

function getCircleAncestors(circle, circleById) {
    const ancestors = [];
    let parent = circleById.get(circle.parentId);
    while (parent) {
        ancestors.push(parent);
        parent = circleById.get(parent.parentId);
    }
    return ancestors;
}

function getParentTooltipExternalCandidateRect(
    circle,
    containerCircle,
    width,
    height,
    placement,
    distance,
) {
    const container = containerCircle || circle;
    const [dx, dy] = tooltipDirections[placement];
    const diagonalOffset = dx && dy ? distance * 0.6 : 0;
    const x = dx
        ? container.x + dx * container.r + dx * distance - (dx < 0 ? width : 0)
        : circle.x - width / 2;
    const y = dy
        ? container.y +
          dy * container.r +
          dy * distance -
          (dy < 0 ? height : 0) +
          dy * diagonalOffset
        : circle.y - height / 2;
    const angle = Math.atan2(
        y + height / 2 - circle.y,
        x + width / 2 - circle.x,
    );
    return {
        x,
        y,
        anchorX: circle.x + Math.cos(angle) * circle.r,
        anchorY: circle.y + Math.sin(angle) * circle.r,
    };
}

const parentTooltipInputs = computed(() =>
    circles.value
        .filter((circle) => circle.hasChildren && circle.name)
        .toSorted((a, b) => b.r - a.r)
        .map((circle) => {
            const ancestors = getCircleAncestors(circle, circleById.value);
            const lines = getParentTooltipTextLines(circle);
            return {
                circle,
                outermostAncestor: ancestors.at(-1),
                lines,
                longestLine: lines.reduce(
                    (max, line) => Math.max(max, String(line).length),
                    0,
                ),
            };
        }),
);

function createParentTooltipItems(sourceViewBox, options = {}) {
    const { clamp = true, scale = 1 } = options;

    if (
        !circles.value.length ||
        !SIZE.value.w ||
        !SIZE.value.h ||
        !cfgChart.value.parentTooltips.show
    ) {
        return [];
    }

    const fontSize =
        Math.max(8, cfgChart.value.parentTooltips.fontSizeRatio * 10) * scale;
    const lineHeight = fontSize * 1.25;
    const paddingX = fontSize * 0.75;
    const paddingY = fontSize * 0.55;
    const distance = Math.max(
        8 * scale,
        Math.min(sourceViewBox.width, sourceViewBox.height) * 0.025,
    );
    const collisionGap = Math.max(
        2 * scale,
        Math.min(sourceViewBox.width, sourceViewBox.height) * 0.006,
    );

    const placements = Object.keys(tooltipDirections);

    const tooltips = [];
    parentTooltipInputs.value.forEach(
        ({ circle, outermostAncestor, lines, longestLine }) => {
            const width = Math.max(
                fontSize * 5,
                longestLine * fontSize * 0.62 + paddingX * 2,
            );
            const height = lines.length * lineHeight + paddingY * 2;

            const externalCandidates = outermostAncestor
                ? placements.map((placement) =>
                      getParentTooltipExternalCandidateRect(
                          circle,
                          outermostAncestor,
                          width,
                          height,
                          placement,
                          distance,
                      ),
                  )
                : [];

            const localCandidates = placements.map((placement) =>
                getParentTooltipCandidateRect(
                    circle,
                    width,
                    height,
                    placement,
                    distance,
                ),
            );

            const candidates = [...externalCandidates, ...localCandidates].map(
                (raw) => {
                    const rectangle = clamp
                        ? clampRectangleToViewBox(
                              {
                                  x: raw.x,
                                  y: raw.y,
                                  width,
                                  height,
                              },
                              sourceViewBox,
                              scale,
                          )
                        : {
                              x: raw.x,
                              y: raw.y,
                              width,
                              height,
                          };

                    return {
                        ...rectangle,
                        anchorX: raw.anchorX,
                        anchorY: raw.anchorY,
                        lineX: rectangle.x + rectangle.width / 2,
                        lineY: rectangle.y + rectangle.height / 2,
                    };
                },
            );

            const validCandidate = candidates.find((candidate) => {
                const collidesWithPreviousTooltip = tooltips.some((tooltip) =>
                    rectanglesCollide(candidate, tooltip, collisionGap),
                );

                if (collidesWithPreviousTooltip) return false;

                return !circles.value.some((otherCircle) =>
                    rectangleCollidesWithCircle(
                        candidate,
                        otherCircle,
                        collisionGap,
                    ),
                );
            });

            if (!validCandidate) return;

            tooltips.push({
                ...validCandidate,
                datapoint: circle,
                id: `parent_tooltip_${circle.id}`,
                color: circle.color,
                lines,
                fontSize,
                lineHeight,
                paddingX,
                paddingY,
                scale,
            });
        },
    );

    return tooltips;
}

function getParentTooltipScale(sourceViewBox) {
    const initialViewBox = initialParentTooltipViewBox.value;

    if (
        !initialViewBox.width ||
        !initialViewBox.height ||
        !sourceViewBox.width ||
        !sourceViewBox.height
    ) {
        return 1;
    }

    const scale = Math.min(
        sourceViewBox.width / initialViewBox.width,
        sourceViewBox.height / initialViewBox.height,
    );

    return Number.isFinite(scale) && scale > 0 ? scale : 1;
}

const parentTooltipItems = computed(() => {
    return createParentTooltipItems(viewBox.value, {
        clamp: true,
        scale: getParentTooltipScale(viewBox.value),
    });
});

function getViewBoxIncludingParentTooltips(baseViewBox) {
    const tooltips = createParentTooltipItems(baseViewBox, {
        clamp: false,
    });

    if (!tooltips.length) {
        return baseViewBox;
    }

    const minX = Math.min(
        baseViewBox.x,
        ...tooltips.map((tooltip) => tooltip.x),
    );
    const minY = Math.min(
        baseViewBox.y,
        ...tooltips.map((tooltip) => tooltip.y),
    );
    const maxX = Math.max(
        baseViewBox.x + baseViewBox.width,
        ...tooltips.map((tooltip) => tooltip.x + tooltip.width),
    );
    const maxY = Math.max(
        baseViewBox.y + baseViewBox.height,
        ...tooltips.map((tooltip) => tooltip.y + tooltip.height),
    );

    const margin = Math.max(
        8,
        Math.min(baseViewBox.width, baseViewBox.height) * 0.025,
    );

    return {
        x: minX - margin,
        y: minY - margin,
        width: maxX - minX + margin * 2,
        height: maxY - minY + margin * 2,
    };
}

function buildHierarchyRows(datapoints) {
    const rows = [];

    function walk(items, depth = 0, parentName = '') {
        items.forEach((datapoint) => {
            rows.push({
                name: datapoint.name,
                value: datapoint.value,
                color: datapoint.color,
                parentName,
                depth,
            });

            if (
                Array.isArray(datapoint.children) &&
                datapoint.children.length
            ) {
                walk(datapoint.children, depth + 1, datapoint.name);
            }
        });
    }

    walk(datapoints);
    return rows;
}

const hierarchyRows = computed(() =>
    buildHierarchyRows(formattedDataset.value),
);
const csvTable = computed(() => {
    return hierarchyRows.value.map((row) => ({
        ...row,
        name: `${'- '.repeat(row.depth)}${row.name}`,
    }));
});

function generateCsv(callback = null) {
    nextTick(() => {
        const labels = csvTable.value.map((row) => {
            return [
                [row.name],
                [row.parentName || ''],
                [row.depth],
                [row.value],
            ];
        });

        const tableXls = [
            [cfgChart.value.title.text],
            [cfgChart.value.title.subtitle.text],
            [
                [FINAL_CONFIG.value.table.columnNames.datapoint],
                [FINAL_CONFIG.value.table.columnNames.parent],
                [FINAL_CONFIG.value.table.columnNames.depth],
                [FINAL_CONFIG.value.table.columnNames.value],
            ],
        ].concat(labels);

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({
                csvContent,
                title: cfgChart.value.title.text || 'vue-ui-circle-pack',
            });
        } else {
            callback(csvContent);
        }
    });
}

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.columnNames.datapoint,
        FINAL_CONFIG.value.table.columnNames.parent,
        FINAL_CONFIG.value.table.columnNames.depth,
        FINAL_CONFIG.value.table.columnNames.value,
    ];

    const body = hierarchyRows.value.map((row) => {
        const label = dataLabel({
            p: cfgLabels.value.value.prefix,
            v: row.value,
            s: cfgLabels.value.value.suffix,
            r: cfgLabels.value.value.rounding,
        });

        return [
            {
                color: row.color,
                name: `${'  '.repeat(row.depth)}${row.name}`,
            },
            row.parentName ?? '',
            row.depth ?? 0,
            label,
        ];
    });

    const config = {
        th: {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            outline: FINAL_CONFIG.value.table.th.outline,
        },
        td: {
            backgroundColor: FINAL_CONFIG.value.table.td.backgroundColor,
            color: FINAL_CONFIG.value.table.td.color,
            outline: FINAL_CONFIG.value.table.td.outline,
        },
        breakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint,
    };

    const colNames = head;

    return {
        colNames,
        head,
        body,
        config,
    };
});

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

function toggleZoom() {
    mutableConfig.value.showZoom = !mutableConfig.value.showZoom;
}

/**
 * Return the current formatted dataset.
 * The result is the internal reactive value, not a defensive copy.
 *
 * @returns The current component data; treat it as read-only.
 */
function getData() {
    return formattedDataset.value;
}

const getImage = createChartImageGetter(
    circlePackChart,
    () => cfgChart.value.title.text,
);

const tableComponent = computed(() =>
    getTableComponent({
        config: FINAL_CONFIG,
        style: cfgChart,
        mutableConfig,
        dialog: BaseDraggableDialog,
        accordion: Accordion,
        isFullscreen,
        parent: circlePackChart,
        maxWidth: 500,
        isCursorPointer,
    }),
);

watch(
    () => mutableConfig.value.showTable,
    (v) => syncTableVisibility(v, FINAL_CONFIG, tableUnit),
);

function closeTable() {
    mutableConfig.value.showTable = false;
    if (userOptionsRef.value) {
        userOptionsRef.value.setTableIconState(false);
    }
}

const svgBg = computed(() => cfgChart.value.backgroundColor);
const svgTitle = computed(() => cfgChart.value.title);

const { isCallbackImaging, isCallbackSvg, generateSvg, onGenerateImage } =
    useChartExport({
        svg: svgRef,
        title: svgTitle,
        legend: null,
        legendItems: null,
        backgroundColor: svgBg,
        getSvgCallback: () => FINAL_CONFIG.value.userOptions.callbacks.svg,
        generateImage,
    });

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: formattedDataset.value,
        flattenedDataset: circles.value,
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
            dataset: formattedDataset.value,
            flattenedDataset: circles.value,
        }),
    );
}

/***************************************************************************************************
 * a11y
 **************************************************************************************************/
function setKeyboardTooltipPositionFromIndex(index) {
    if (!Number.isFinite(index)) return;
    if (!svgRef.value) return;
    const circle = circles.value[index];
    if (!circle) return;
    const coords = svgToClientCoords(circle.x, circle.y, svgRef.value);
    if (!coords) return;
    tooltipA11yPosition.value = coords;
}

function clearSelection() {
    selectedId.value = null;
    activeTooltipIndex.value = null;
    tooltipTriggerMode.value = 'pointer';
    isTooltip.value = false;
}

function clearKeyboardSelection() {
    if (activeTooltipIndex.value !== null) {
        const currentCircle = circles.value[activeTooltipIndex.value];
        currentCircle && onTrapLeave(currentCircle, activeTooltipIndex.value);
    }
    activeTooltipIndex.value = null;
    tooltipTriggerMode.value = 'pointer';
    isTooltip.value = false;
    selectedId.value = null;
}

function onSvgFocus() {
    activeTooltipIndex.value = null;
    isFocus.value = true;
}

function onSvgBlur() {
    clearKeyboardSelection();
    isFocus.value = false;
}

function getNextCircleIndex(currentIndex, direction) {
    const len = circles.value.length;
    if (!len) return null;
    if (currentIndex === null || currentIndex < 0 || currentIndex >= len) {
        return direction === 'next' ? 0 : len - 1;
    }
    if (direction === 'previous') {
        return (currentIndex - 1 + len) % len;
    }
    return (currentIndex + 1) % len;
}

function onSvgKeydown(event) {
    if (!svgRef.value || isAnnotator.value) return;
    if (document.activeElement !== svgRef.value) return;
    if (!circles.value.length) return;

    const isPreviousKey = ['ArrowLeft', 'ArrowUp'].includes(event.key);
    const isNextKey = ['ArrowRight', 'ArrowDown'].includes(event.key);
    const isActivationKey = event.key === 'Enter' || event.key === ' ';
    const isEscapeKey = event.key === 'Escape';

    if (!isPreviousKey && !isNextKey && !isActivationKey && !isEscapeKey)
        return;

    event.preventDefault();
    event.stopPropagation();

    if (isEscapeKey) {
        clearKeyboardSelection();
        return;
    }

    if (isActivationKey) {
        if (activeTooltipIndex.value === null) return;
        const circle = circles.value[activeTooltipIndex.value];
        if (!circle) return;
        onTrapClick(circle, activeTooltipIndex.value);
        return;
    }

    let nextIndex = activeTooltipIndex.value;

    if (
        nextIndex === null ||
        nextIndex < 0 ||
        nextIndex >= circles.value.length
    ) {
        nextIndex = isNextKey ? 0 : circles.value.length - 1;
    } else if (isNextKey) {
        nextIndex = getNextCircleIndex(nextIndex, 'next');
    } else if (isPreviousKey) {
        nextIndex = getNextCircleIndex(nextIndex, 'previous');
    }

    const circle = circles.value[nextIndex];
    if (!circle) return;
    activeTooltipIndex.value = nextIndex;
    setKeyboardTooltipPositionFromIndex(nextIndex);
    onTrapEnter(circle, nextIndex, 'keyboard');
}

const a11yTable = computed(() => {
    const headers = dataTable.value?.colNames ?? [];
    const rows =
        dataTable.value?.body?.map((row) => [
            row[0]?.name ?? '',
            ...row.slice(1),
        ]) ?? [];

    return { headers, rows };
});

const textColor = computed(() => cfgChart.value.color);

function packingInput(items) {
    return items.map(({ id, r, children }) => ({
        id,
        r,
        children: packingInput(children),
    }));
}
const packingSignature = computed(() =>
    JSON.stringify(packingInput(formattedDataset.value)),
);
watch(
    [packingSignature, packingWidth, packingHeight],
    () => {
        if (FINAL_CONFIG.value.responsive) scheduleResize?.();
        else recomputePacking(packingWidth.value, packingHeight.value);
    },
    { flush: 'post' },
);
watch(() => FINAL_CONFIG.value.responsive, prepareChart, { flush: 'post' });
watch(
    [cfgChart, () => FINAL_CONFIG.value.style.fontFamily],
    () => scheduleResize?.(),
    { flush: 'post' },
);
watch(
    [circles, () => cfgChart.value.parentTooltips, cfgLabels],
    refreshInitialViewBox,
    { deep: true, flush: 'post' },
);
watch(loading, (value) => {
    if (value) clearSelection();
});
watch(circles, (items) => {
    if (!selectedId.value) return;
    const index = items.findIndex((circle) => circle.id === selectedId.value);
    if (index < 0) {
        selectedId.value = null;
        activeTooltipIndex.value = null;
        isTooltip.value = false;
        return;
    }
    if (tooltipTriggerMode.value === 'keyboard')
        setKeyboardTooltipPositionFromIndex(index);
    onTrapEnter(items[index], index, tooltipTriggerMode.value, false);
});

defineExpose({
    getData,
    getImage,
    generateCsv,
    generatePdf,
    generateImage,
    generateSvg,
    toggleTable,
    toggleAnnotator,
    toggleFullscreen,
    copyAlt,
    toggleZoom,
    resetZoom,
});
const annotationViewport = computed(() =>
    createPanZoomAnnotationViewport(
        FINAL_CONFIG.value.userOptions?.annotator?.followZoom,
        viewBox.value,
    ),
);
</script>

<template>
    <div
        :id="`vue-ui-circle-pack_${uid}`"
        :class="`vue-data-ui-component vue-ui-circle-pack ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${loading ? 'loading' : ''}`"
        ref="circlePackChart"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};text-align:center;background:${cfgChart.backgroundColor};`"
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <div :id="`chart-instructions-${uid}`" class="sr-only">
            <p>{{ FINAL_CONFIG.a11y.translations.keyboardNavigation }}</p>
        </div>

        <A11yDataTable
            v-if="FINAL_CONFIG.a11y.includeTable && a11yTable?.rows?.length"
            :uid="uid"
            :head="a11yTable.headers"
            :body="a11yTable.rows"
            :notice="FINAL_CONFIG.a11y.translations.tableAvailable"
            :caption="FINAL_CONFIG.a11y.translations.tableCaption"
        />

        <PenAndPaper
            v-bind="getAnnotatorProps(FINAL_CONFIG.userOptions.annotator)"
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :followZoom="FINAL_CONFIG.userOptions?.annotator?.followZoom"
            :annotationViewport="annotationViewport"
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :active="isAnnotator"
            :isCursorPointer="isCursorPointer"
            :palette="FINAL_CONFIG.userOptions.annotatorPalette"
            @close="toggleAnnotator"
        >
            <template
                v-for="slotName in annotationSlotNames"
                #[slotName]="slotProps"
            >
                <slot
                    :name="slotName"
                    v-bind="getAnnotationSlotProps(slotName, slotProps)"
                />
            </template>
        </PenAndPaper>

        <slot name="userConfig" />

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle"
            class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div
            ref="chartTitle"
            v-if="cfgChart.title.text"
            :style="`width:100%;background:transparent;padding-bottom:12px`"
        >
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'donut-div-title',
                        ...cfgChart.title,
                    },
                    subtitle: {
                        cy: 'donut-div-subtitle',
                        ...cfgChart.title.subtitle,
                    },
                }"
            />
        </div>

        <UserOptions
            ref="userOptionsRef"
            :key="`user_option_${step}`"
            v-if="
                FINAL_CONFIG.userOptions.show &&
                isDataset &&
                (keepUserOptionState ? true : userOptionsVisible)
            "
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip"
            :isTooltip="mutableConfig.showTooltip"
            :hasLabel="false"
            :isFullscreen="isFullscreen"
            :chartElement="circlePackChart"
            v-bind="
                getUserOptionsProps(
                    FINAL_CONFIG.userOptions,
                    'pdf csv img svg table fullscreen altCopy annotator zoom',
                )
            "
            :isAnnotation="isAnnotator"
            :tableDialog="FINAL_CONFIG.table.useDialog"
            :isCursorPointer="isCursorPointer"
            :isZoom="mutableConfig.showZoom"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="onGenerateImage"
            @generateSvg="generateSvg"
            @toggleTable="toggleTable"
            @toggleTooltip="toggleTooltip"
            @toggleAnnotator="toggleAnnotator"
            @toggleZoom="toggleZoom"
            @copyAlt="copyAlt"
            :style="{
                visibility: keepUserOptionState
                    ? userOptionsVisible
                        ? 'visible'
                        : 'hidden'
                    : 'visible',
            }"
        >
            <template
                v-for="slotName in getUserOptionSlots(
                    $slots,
                    'menuIcon optionTooltip optionPdf optionCsv optionImg optionSvg optionTable optionFullscreen optionAnnotator optionZoom optionAltCopy custom-menu-before custom-menu-after',
                )"
                #[slotName]="slotProps"
            >
                <slot
                    :name="slotName"
                    v-bind="getUserOptionSlotProps(slotName, slotProps)"
                />
            </template>
        </UserOptions>

        <div
            :class="{
                'vue-ui-circle-pack-svg-container': true,
                'not-responsive': !FINAL_CONFIG.responsive,
            }"
        >
            <svg
                ref="svgRef"
                :xmlns="XMLNS"
                :aria-describedby="`chart-instructions-${uid}`"
                :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`"
                preserveAspectRatio="xMidYMid meet"
                :class="{
                    'vue-data-ui-fullscreen--on': isFullscreen,
                    'vue-data-ui-fulscreen--off': !isFullscreen,
                    'not-responsive': !FINAL_CONFIG.responsive,
                    'vue-data-ui-no-transition': !transitionEnabled,
                }"
                :style="`display:block;${FINAL_CONFIG.responsive ? 'width:100%;height:auto' : 'height:100%;'};overflow:${mutableConfig.showZoom ? 'hidden' : 'visible'};background:transparent;color:${cfgChart.color};background:${cfgChart.backgroundColor};`"
                tabindex="0"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
            >
                <PackageVersion />
                <slot
                    name="svg-underlayer"
                    :svg="{
                        drawingArea: {
                            ...viewBox,
                        },
                        width: SIZE.w,
                        height: SIZE.h,
                        isPrintingImg:
                            isPrinting || isImaging || isCallbackImaging,
                        isPrintingSvg: isCallbackSvg,
                    }"
                />

                <!-- BACKGROUND SLOT -->
                <foreignObject
                    v-if="$slots['chart-background']"
                    :x="viewBox.x"
                    :y="viewBox.y"
                    :width="SIZE.w"
                    :height="SIZE.h"
                    :style="{ pointerEvents: 'none' }"
                >
                    <slot name="chart-background" />
                </foreignObject>

                <template v-for="(circle, i) in circles" :key="circle.id">
                    <defs>
                        <DefGrad
                            t="radial"
                            :id="circle.id"
                            fy="30%"
                            :stops="[
                                [
                                    '10%',
                                    lightenHexColor(
                                        circle.color,
                                        cfgCircles.gradient.intensity / 100,
                                    ),
                                    1,
                                ],
                                ['90%', darkenHexColor(circle.color, 0.1), 1],
                                ['100%', circle.color, 1],
                            ]"
                        />
                    </defs>

                    <g v-if="$slots.pattern">
                        <defs>
                            <slot
                                name="pattern"
                                v-bind="{
                                    ...circle,
                                    patternId: `pattern_${uid}_${circle.id}`,
                                }"
                            />
                        </defs>
                    </g>

                    <!-- 'CIRCLE' (using rect as circle does not css transition properly) -->
                    <rect
                        :class="{ 'vue-data-ui-transition': transitionEnabled }"
                        data-cy="datapoint-circle"
                        v-bind="circleBounds(circle)"
                        :stroke="cfgCircles.stroke"
                        vector-effect="non-scaling-stroke"
                        :stroke-width="
                            (cfgCircles.strokeWidth * (maxRadius || 1)) / 100
                        "
                        :fill="
                            cfgCircles.gradient.show
                                ? `url(#${circle.id})`
                                : circle.color
                        "
                        :rx="circle.r"
                        @mouseenter="onTrapEnter(circle, i, 'pointer')"
                        @mouseout="onTrapLeave(circle, i)"
                        @click="onTrapClick(circle, i)"
                    />

                    <rect
                        v-if="$slots.pattern"
                        :class="{ 'vue-data-ui-transition': transitionEnabled }"
                        v-bind="circleBounds(circle)"
                        :stroke="cfgCircles.stroke"
                        vector-effect="non-scaling-stroke"
                        :stroke-width="
                            (cfgCircles.strokeWidth * (maxRadius || 1)) / 100
                        "
                        :fill="`url(#pattern_${uid}_${circle.id})`"
                        :rx="circle.r"
                        :style="{ pointerEvents: 'none' }"
                    />
                </template>

                <!-- OVERLAYS -->
                <template v-for="(circle, i) in circles" :key="circle.id">
                    <rect
                        v-if="!circle.hasChildren"
                        :class="{ 'vue-data-ui-transition': transitionEnabled }"
                        data-cy="datapoint-circle-overlay"
                        v-bind="circleBounds(circle)"
                        stroke="none"
                        :fill="
                            selectedDatapoint &&
                            selectedDatapoint.id === circle.id
                                ? cfgCircles.gradient.show
                                    ? `url(#${circle.id})`
                                    : circle.color
                                : 'transparent'
                        "
                        :rx="circle.r"
                        :style="{
                            filter:
                                selectedDatapoint &&
                                selectedDatapoint.id === circle.id
                                    ? `drop-shadow(0px 0px 6px ${cfgCircles.selectedShadowColor})`
                                    : 'none',
                            opacity: selectedDatapoint ? 1 : 0,
                            pointerEvents: 'none',
                        }"
                    />
                </template>

                <!-- LABELS -->
                <template
                    v-for="(circle, i) in circles"
                    :key="`cl_${circle.id}`"
                >
                    <slot
                        name="data-label"
                        v-if="
                            $slots['data-label'] && canShowCircleLabel(circle)
                        "
                        v-bind="{
                            ...circle,
                            createTSpans,
                            fontSize: {
                                name:
                                    (circle.r / 3) *
                                    cfgLabels.name.fontSizeRatio,
                                value:
                                    getValueFontSize(circle) *
                                    cfgLabels.value.fontSizeRatio,
                            },
                            color: getCircleNameColor(circle),
                        }"
                    />

                    <template v-else>
                        <!-- LABEL NAME -->
                        <text
                            data-cy="label-name"
                            v-if="
                                cfgLabels.name.show &&
                                circle.name &&
                                canShowCircleLabel(circle)
                            "
                            :style="{
                                pointerEvents: 'none',
                            }"
                            :class="{
                                'vue-data-ui-transition': transitionEnabled,
                            }"
                            :transform="`translate(${circle.x}, ${
                                circle.y +
                                calcOffsetY(circle.r, cfgLabels.name.offsetY) -
                                circle.r / 10
                            })`"
                            :font-size="
                                (circle.r / 3) * cfgLabels.name.fontSizeRatio
                            "
                            :fill="getCircleNameColor(circle)"
                            :font-weight="
                                cfgLabels.name.bold ? 'bold' : 'normal'
                            "
                            text-anchor="middle"
                        >
                            {{ circle.name }}
                        </text>

                        <!-- LABEL VALUE -->
                        <text
                            data-cy="label-value"
                            :class="{
                                'vue-data-ui-transition': transitionEnabled,
                            }"
                            v-if="
                                cfgLabels.value.show &&
                                canShowCircleLabel(circle)
                            "
                            :style="{
                                pointerEvents: 'none',
                                transition: 'opacity 0.2s ease-in-out',
                            }"
                            :transform="`translate(${circle.x}, ${
                                circle.y +
                                calcOffsetY(circle.r, cfgLabels.value.offsetY) +
                                circle.r / 2.5
                            })`"
                            :font-size="
                                getValueFontSize(circle) *
                                cfgLabels.value.fontSizeRatio
                            "
                            :fill="
                                cfgLabels.value.color === 'auto'
                                    ? adaptColorToBackground(circle.color)
                                    : cfgLabels.value.color
                            "
                            :font-weight="
                                cfgLabels.value.bold ? 'bold' : 'normal'
                            "
                            text-anchor="middle"
                        >
                            {{ getCircleLabel(circle) }}
                        </text>
                    </template>

                    <slot
                        name="circle"
                        v-bind="{
                            ...circle,
                            showLabel: canShowCircleLabel(circle),
                            isSelected: selectedDatapoint?.id === circle.id,
                            isDescendantOfSelected: isDescendantOf(
                                circle,
                                selectedDatapoint,
                            ),
                            uid: `${i}_${uid}`,
                        }"
                    />
                </template>

                <!-- PARENT SVG TOOLTIPS -->
                <g
                    v-if="
                        parentTooltipItems.length &&
                        cfgChart.parentTooltips.show
                    "
                    data-cy="parent-svg-tooltips"
                    :style="{ pointerEvents: 'none' }"
                >
                    <g
                        v-for="tooltip in parentTooltipItems"
                        :key="`tltp_${tooltip.id}`"
                        data-cy="parent-svg-tooltip"
                    >
                        <path
                            :class="{
                                'vue-data-ui-transition': transitionEnabled,
                            }"
                            :stroke="
                                cfgChart.parentTooltips.link.useSerieColor
                                    ? tooltip.color
                                    : cfgChart.parentTooltips.link.stroke
                            "
                            vector-effect="non-scaling-stroke"
                            :stroke-width="
                                cfgChart.parentTooltips.link.strokeWidth
                            "
                            stroke-linecap="round"
                            :stroke-dasharray="
                                cfgChart.parentTooltips.link.strokeDasharray
                            "
                            :opacity="cfgChart.parentTooltips.link.opacity"
                            :d="`M${tooltip.anchorX}, ${tooltip.anchorY} ${tooltip.lineX}, ${tooltip.lineY}`"
                        />
                        <rect
                            :class="{
                                'vue-data-ui-transition': transitionEnabled,
                            }"
                            :x="tooltip.x"
                            :y="tooltip.y"
                            :width="tooltip.width"
                            :height="tooltip.height"
                            :rx="
                                Math.max(
                                    3 * tooltip.scale,
                                    tooltip.fontSize / 2.5,
                                ) * cfgChart.parentTooltips.borderRadiusRatio
                            "
                            :ry="
                                Math.max(
                                    3 * tooltip.scale,
                                    tooltip.fontSize / 2.5,
                                ) * cfgChart.parentTooltips.borderRadiusRatio
                            "
                            :fill="cfgChart.parentTooltips.backgroundColor"
                            :stroke="
                                cfgChart.parentTooltips.useSerieColor
                                    ? tooltip.color
                                    : cfgChart.parentTooltips.stroke
                            "
                            vector-effect="non-scaling-stroke"
                            :stroke-width="cfgChart.parentTooltips.strokeWidth"
                            :filter="cfgChart.parentTooltips.filter"
                        />

                        <slot name="parent-tooltip" v-bind="{ ...tooltip }">
                            <rect
                                :class="{
                                    'vue-data-ui-transition': transitionEnabled,
                                }"
                                :fill="tooltip.color"
                                :x="
                                    tooltip.x +
                                    tooltip.paddingX * 1.3 -
                                    tooltip.fontSize * 0.35
                                "
                                :y="
                                    tooltip.y +
                                    tooltip.paddingY +
                                    tooltip.lineHeight / 2 -
                                    tooltip.fontSize * 0.35
                                "
                                :rx="tooltip.fontSize * 0.35"
                                :width="tooltip.fontSize * 0.7"
                                :height="tooltip.fontSize * 0.7"
                            />
                            <text
                                :class="{
                                    'vue-data-ui-transition': transitionEnabled,
                                }"
                                :transform="`translate(${tooltip.x + tooltip.paddingX + tooltip.fontSize}, ${tooltip.y + tooltip.paddingY + tooltip.fontSize})`"
                                :font-size="tooltip.fontSize"
                                :fill="cfgChart.parentTooltips.color"
                                :font-family="FINAL_CONFIG.style.fontFamily"
                                text-anchor="start"
                            >
                                <tspan
                                    v-for="(line, lineIndex) in tooltip.lines"
                                    :key="`${tooltip.id}_${lineIndex}`"
                                    :x="0"
                                    :dy="
                                        lineIndex === 0 ? 0 : tooltip.lineHeight
                                    "
                                >
                                    {{ line }}
                                </tspan>
                            </text>
                        </slot>
                    </g>
                </g>

                <slot
                    name="svg"
                    :svg="{
                        drawingArea: {
                            ...viewBox,
                        },
                        width: SIZE.w,
                        height: SIZE.h,
                        isPrintingImg:
                            isPrinting || isImaging || isCallbackImaging,
                        isPrintingSvg: isCallbackSvg,
                    }"
                />
            </svg>
            <div
                v-if="$slots.hint"
                style="position: absolute; top: 100%; left: 0; width: 100%"
                data-dom-to-png-ignore
                aria-hidden="true"
            >
                <slot
                    name="hint"
                    v-bind="{
                        hint: FINAL_CONFIG.a11y.translations.keyboardNavigation,
                        isVisible: isFocus,
                    }"
                />
            </div>
        </div>

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

        <div v-if="isZoom" data-dom-to-png-ignore class="reset-wrapper">
            <slot name="reset-action" :reset="resetZoom">
                <button
                    data-cy-reset
                    tabindex="0"
                    role="button"
                    class="vue-data-ui-refresh-button"
                    :style="{
                        background: cfgChart.backgroundColor,
                        cursor: isCursorPointer ? 'pointer' : 'default',
                    }"
                    @click="resetZoom(true)"
                >
                    <BaseIcon name="refresh" :stroke="cfgChart.color" />
                </button>
            </slot>
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- TOOLTIP -->
        <Tooltip
            :teleportTo="cfgChart.tooltip.teleportTo"
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="cfgChart.tooltip.backgroundColor"
            :color="cfgChart.tooltip.color"
            :fontSize="cfgChart.tooltip.fontSize"
            :borderRadius="cfgChart.tooltip.borderRadius"
            :borderColor="cfgChart.tooltip.borderColor"
            :borderWidth="cfgChart.tooltip.borderWidth"
            :backgroundOpacity="cfgChart.tooltip.backgroundOpacity"
            :position="cfgChart.tooltip.position"
            :offsetX="cfgChart.tooltip.offsetX"
            :offsetY="cfgChart.tooltip.offsetY"
            :parent="circlePackChart"
            :content="tooltipContent"
            :isCustom="useCustomFormat"
            :isFullscreen="isFullscreen"
            :smooth="cfgChart.tooltip.smooth"
            :backdropFilter="cfgChart.tooltip.backdropFilter"
            :smoothForce="cfgChart.tooltip.smoothForce"
            :smoothSnapThreshold="cfgChart.tooltip.smoothSnapThreshold"
            :isA11yMode="tooltipTriggerMode === 'keyboard'"
            :a11yPosition="tooltipA11yPosition"
        >
            <template #tooltip-before>
                <slot
                    name="tooltip-before"
                    v-bind="{ ...dataTooltipSlot }"
                ></slot>
            </template>
            <template #tooltip>
                <slot name="tooltip" v-bind="{ ...dataTooltipSlot }" />
            </template>
            <template #tooltip-after>
                <slot
                    name="tooltip-after"
                    v-bind="{ ...dataTooltipSlot }"
                ></slot>
            </template>
        </Tooltip>

        <component
            v-if="isDataset && FINAL_CONFIG.userOptions.buttons.table"
            :is="tableComponent.component"
            v-bind="tableComponent.props"
            ref="tableUnit"
            @close="closeTable"
        >
            <template #title v-if="FINAL_CONFIG.table.useDialog">
                {{ tableComponent.title }}
            </template>
            <template #actions v-if="FINAL_CONFIG.table.useDialog">
                <button
                    tabindex="0"
                    class="vue-ui-user-options-button"
                    @click="generateCsv(FINAL_CONFIG.userOptions.callbacks.csv)"
                    :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
                >
                    <BaseIcon
                        name="fileCsv"
                        :stroke="tableComponent.props.color"
                    />
                </button>
            </template>
            <template #content>
                <DataTable
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames"
                    :head="dataTable.head"
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="
                        FINAL_CONFIG.table.useDialog ? '' : tableComponent.title
                    "
                    :withCloseButton="!FINAL_CONFIG.table.useDialog"
                    :isCursorPointer="isCursorPointer"
                    @close="closeTable"
                >
                    <template #th="{ th }">
                        <div style="display: flex; align-items: center">
                            {{ th }}
                        </div>
                    </template>
                    <template #td="{ td }">
                        {{ td.name || td }}
                    </template>
                </DataTable>
            </template>
        </component>

        <!-- v3 Skeleton loader -->
        <slot name="skeleton">
            <BaseScanner v-if="loading" />
        </slot>
    </div>
</template>

<style scoped>
@import '../vue-data-ui.css';

.vue-ui-circle-pack * {
    transition: unset;
}

.vue-ui-circle-pack {
    position: relative;
    user-select: none;
    width: 100%;
    height: 100%;
    overflow: visible;
}

.vue-ui-circle-pack-svg-container {
    position: relative;
}

svg:focus {
    outline: none;
}

svg:focus-visible {
    outline: 2px solid currentColor;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    clip: rect(0 0 0 0);
    white-space: normal;
    border: 0;
}

.reset-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    padding: 0 24px;
    height: 40px;
    position: absolute;
    bottom: 12px;
    right: 0;
}

.vue-data-ui-refresh-button {
    outline: none;
    border: none;
    background: transparent;
    height: 36px;
    width: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: transform 0.2s ease-in-out;
    transform-origin: center;
    &:focus {
        outline: 1px solid v-bind(textColor);
    }
    &:hover {
        transform: rotate(-90deg);
    }
}

.vue-data-ui-transition {
    transition: all 0.2s ease-in-out;
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
