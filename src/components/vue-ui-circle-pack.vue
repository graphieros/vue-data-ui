<script setup>
import {
    computed,
    defineAsyncComponent,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    toRefs,
    watch,
} from 'vue';
import { useConfig } from '../useConfig';
import {
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
import { usePrinter } from '../usePrinter';
import { useLoading } from '../useLoading';
import { pack, bounds } from '../packCircles';
import { useSvgExport } from '../useSvgExport';
import { useNestedProp } from '../useNestedProp';
import { useThemeCheck } from '../useThemeCheck';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import { throttle } from '../canvas-lib';
import { useResponsive } from '../useResponsive';
import img from '../img';
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import themes from '../themes/vue_ui_circle_pack.json';
import BaseScanner from '../atoms/BaseScanner.vue';
import usePanZoom from '../usePanZoom';
import A11yDataTable from '../atoms/A11yDataTable.vue';

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
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

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
const selectedDatapoint = ref(null);
const isCallbackImaging = ref(false);
const isCallbackSvg = ref(false);

const activeTooltipIndex = ref(null); // a11y
const tooltipA11yPosition = ref({ x: 0, y: 0 }); // a11y
const tooltipTriggerMode = ref('pointer'); // a11y
const isFocus = ref(false); // a11y

const FINAL_CONFIG = ref(prepareConfig());

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
    config: FINAL_CONFIG.value.style.chart.title,
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } =
    useUserOptionState({ config: FINAL_CONFIG.value });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG,
    });

    const theme = mergedConfig.theme;
    if (!theme) return mergedConfig;

    if (!isThemeValid.value(mergedConfig)) {
        warnInvalidTheme(mergedConfig);
        return mergedConfig;
    }

    const fused = useNestedProp({
        userConfig: themes[theme] || props.config,
        defaultConfig: mergedConfig,
    });

    const finalConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: fused,
    });

    return {
        ...finalConfig,
        customPalette: finalConfig.customPalette.length
            ? finalConfig.customPalette
            : themePalettes[theme] || palette,
    };
}

watch(
    () => props.config,
    (_newCfg) => {
        FINAL_CONFIG.value = prepareConfig();
        userOptionsVisible.value =
            !FINAL_CONFIG.value.userOptions.showOnChartHover;
        prepareChart();
        titleStep.value += 1;
        tableStep.value += 1;

        // Reset mutable config
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        mutableConfig.value.showTooltip =
            FINAL_CONFIG.value.style.chart.tooltip.show;
        mutableConfig.value.showZoom =
            FINAL_CONFIG.value.style.chart.zoom?.show ?? false;
    },
    { deep: true },
);

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-circle-pack_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-circle-pack',
    options: FINAL_CONFIG.value.userOptions.print,
});

const hasOptionsNoTitle = computed(() => {
    return (
        FINAL_CONFIG.value.userOptions.show &&
        !FINAL_CONFIG.value.style.chart.title.text
    );
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show,
    showZoom: FINAL_CONFIG.value.style.chart.zoom?.show ?? false,
});

// v3 - Essential to make shifting between loading config and final config work
watch(
    FINAL_CONFIG,
    () => {
        mutableConfig.value = {
            showTable: FINAL_CONFIG.value.table.show,
            showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show,
            showZoom: FINAL_CONFIG.value.style.chart.zoom?.show ?? false,
        };
    },
    { immediate: true },
);

const SIZE = ref({ h: 10, w: 10 });
const boundValues = ref([0, 0, 100, 100]);

const debug = computed(() => FINAL_CONFIG.value.debug);

const packingWidth = computed(() => {
    const style = FINAL_CONFIG.value.style?.chart || {};
    if (style.dimensions && typeof style.dimensions.width === 'number') {
        return style.dimensions.width;
    }
    if (typeof style.width === 'number') {
        return style.width;
    }
    return 300;
});

const packingHeight = computed(() => {
    const style = FINAL_CONFIG.value.style?.chart || {};
    if (style.dimensions && typeof style.dimensions.height === 'number') {
        return style.dimensions.height;
    }
    if (typeof style.height === 'number') {
        return style.height;
    }
    return 300;
});

const circles = ref([]);
const flattenedDataset = ref([]);
const resizeObserver = ref(null);
const observedEl = ref(null);

function recomputePacking(targetWidth, targetHeight) {
    SIZE.value = {
        w: targetWidth,
        h: targetHeight,
    };

    const freshDataset = formattedDataset.value.map(cloneDatapoint);

    if (!freshDataset.length) {
        const baseViewBox = {
            x: 0,
            y: 0,
            width: targetWidth,
            height: targetHeight,
        };

        circles.value = [];
        flattenedDataset.value = [];
        boundValues.value = [
            baseViewBox.x,
            baseViewBox.y,
            baseViewBox.width,
            baseViewBox.height,
        ];
        setInitialViewBox(baseViewBox);
        return;
    }

    const packedRoots = pack(freshDataset, targetHeight, targetWidth);
    const [x0, y0, bw, bh] = bounds(packedRoots, 1);

    const scale = Math.min(
        bw ? targetWidth / bw : 1,
        bh ? targetHeight / bh : 1,
    );

    const offsetX = (targetWidth - bw * scale) / 2;
    const offsetY = (targetHeight - bh * scale) / 2;

    const roots = packedRoots.map((circle) => {
        return {
            ...circle,
            x: (circle.x - x0) * scale + offsetX,
            y: (circle.y - y0) * scale + offsetY,
            r: circle.r * scale,
        };
    });

    circles.value = flattenPackedCircles(roots);
    flattenedDataset.value = circles.value;

    const baseViewBox = {
        x: 0,
        y: 0,
        width: targetWidth,
        height: targetHeight,
    };

    const initialViewBox = getViewBoxIncludingParentTooltips(baseViewBox);

    boundValues.value = [
        initialViewBox.x,
        initialViewBox.y,
        initialViewBox.width,
        initialViewBox.height,
    ];

    setInitialViewBox(initialViewBox);
}

function cloneDatapoint(datapoint) {
    return {
        ...datapoint,
        children: Array.isArray(datapoint.children)
            ? datapoint.children.map(cloneDatapoint)
            : [],
    };
}

function getDatapointValue(datapoint) {
    const ownValue = Number(datapoint?.value);
    if (Number.isFinite(ownValue) && ownValue > 0) {
        return ownValue;
    }

    if (!Array.isArray(datapoint?.children)) {
        return 0;
    }

    return datapoint.children.reduce((sum, child) => {
        return sum + getDatapointValue(child);
    }, 0);
}

function getDatapointColor(datapoint, colorIndex) {
    const themePalette =
        themePalettes[FINAL_CONFIG.value.theme || 'default'] || palette;
    const resolvedPalette = customPalette.value.length
        ? customPalette.value
        : themePalette.length
          ? themePalette
          : palette;

    return (
        convertColorToHex(datapoint.color) ||
        resolvedPalette[colorIndex % resolvedPalette.length] ||
        palette[colorIndex % palette.length]
    );
}

function getLeafCount(datapoint) {
    if (!Array.isArray(datapoint.children) || !datapoint.children.length) {
        return 1;
    }

    return datapoint.children.reduce((sum, child) => {
        return sum + getLeafCount(child);
    }, 0);
}

function normalizeDataset(source, parent = null, depth = 0, path = []) {
    if (!Array.isArray(source)) {
        return [];
    }

    return source
        .map((datapoint, index) => {
            const value = getDatapointValue(datapoint);

            if (!Number.isFinite(value) || value <= 0) {
                return null;
            }

            const id = createUid();
            const hierarchyPath = [...path, index];
            const colorIndex = hierarchyPath.reduce((sum, item, i) => {
                return sum + item + i;
            }, 0);

            const color =
                datapoint.color || parent?.color
                    ? convertColorToHex(datapoint.color || parent?.color)
                    : getDatapointColor(datapoint, colorIndex);

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
                leafCount: children.length ? getLeafCount({ children }) : 1,
                hierarchyPath,
                children,
            };
        })
        .filter(Boolean);
}

function packNestedChildren(parent) {
    if (!Array.isArray(parent.children) || !parent.children.length) {
        return [];
    }

    const innerPadding = 0.9;
    const targetSize = parent.r * 2;

    if (!targetSize) {
        return [];
    }

    const packed = pack(
        parent.children.map(cloneDatapoint),
        targetSize,
        targetSize,
    );

    const [x0, y0, width, height] = bounds(packed, 1);

    const scale =
        Math.min(
            width ? targetSize / width : 1,
            height ? targetSize / height : 1,
        ) * innerPadding;

    const fittedWidth = width * scale;
    const fittedHeight = height * scale;

    const offsetX = parent.x - fittedWidth / 2;
    const offsetY = parent.y - fittedHeight / 2;

    return packed.map((child) => ({
        ...child,
        x: (child.x - x0) * scale + offsetX,
        y: (child.y - y0) * scale + offsetY,
        r: child.r * scale,
    }));
}

function flattenPackedCircles(source) {
    const result = [];

    source.forEach((circle) => {
        const children = packNestedChildren(circle);
        result.push({
            ...circle,
            children,
        });
        result.push(...flattenPackedCircles(children));
    });

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
        return FINAL_CONFIG.value.style.chart.circles.labels.parents.show;
    }
    return FINAL_CONFIG.value.style.chart.circles.labels.children.show;
}

function setupResponsiveObserver() {
    if (!FINAL_CONFIG.value.responsive || !circlePackChart.value) return;

    const handleResize = throttle(() => {
        const { width, height } = useResponsive({
            chart: circlePackChart.value,
            title: FINAL_CONFIG.value.style.chart.title.text
                ? chartTitle.value
                : null,
            legend: null,
            source: source.value,
            noTitle: noTitle.value,
        });

        requestAnimationFrame(() => {
            if (!width || !height) return;

            if (svgRef.value) {
                svgRef.value.setAttribute('width', width);
                svgRef.value.setAttribute('height', height);
            }
            recomputePacking(width, height);
        });
    });

    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }

    resizeObserver.value = new ResizeObserver(handleResize);
    observedEl.value =
        circlePackChart.value.parentNode || circlePackChart.value;
    if (observedEl.value) {
        resizeObserver.value.observe(observedEl.value);
    }

    // Initial responsive computation
    handleResize();
}

function teardownResponsiveObserver() {
    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
        resizeObserver.value = null;
        observedEl.value = null;
    }
}

async function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiCirclePack',
            type: 'dataset',
            debug: debug.value,
        });
    }
    const baseWidth = packingWidth.value;
    const baseHeight = packingHeight.value;
    recomputePacking(baseWidth, baseHeight);

    if (FINAL_CONFIG.value.responsive) {
        setupResponsiveObserver();
    } else {
        teardownResponsiveObserver();
    }
}

onMounted(prepareChart);

onBeforeUnmount(() => {
    teardownResponsiveObserver();
});

watch(
    () => FINAL_DATASET.value,
    async (_ds) => {
        await prepareChart();
    },
    { deep: true },
);

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
    selectedDatapoint.value = null;
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

function onTrapEnter(datapoint, seriesIndex, triggerMode = 'pointer') {
    selectedDatapoint.value = datapoint;
    activeTooltipIndex.value = seriesIndex;
    tooltipTriggerMode.value = triggerMode;

    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex });
    }

    dataTooltipSlot.value = {
        datapoint,
        seriesIndex,
        config: FINAL_CONFIG.value,
        series: flattenedDataset.value,
    };
    isTooltip.value = true;
    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;
    useCustomFormat.value = false;

    if (isFunction(customFormat)) {
        try {
            const customFormatString = customFormat({
                seriesIndex,
                datapoint,
                series: flattenedDataset.value,
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
                <svg viewBox="0 0 10 10" height="${FINAL_CONFIG.value.style.chart.tooltip.fontSize}" width="${FINAL_CONFIG.value.style.chart.tooltip.fontSize}">
                    <circle
                        cx="5"
                        cy="5"
                        r="5"
                        fill="${FINAL_CONFIG.value.style.chart.circles.gradient.show ? `url(#${datapoint.id})` : datapoint.color}"
                    />
                </svg>
                <span>${datapoint.name}: <b>${getCircleLabel(datapoint)}</b></span>
            </div>
        `;

        tooltipContent.value = html;
    }
}

function getCircleLabel(circle) {
    return applyDataLabel(
        FINAL_CONFIG.value.style.chart.circles.labels.value.formatter,
        circle.value,
        dataLabel({
            p: FINAL_CONFIG.value.style.chart.circles.labels.value.prefix,
            v: circle.value,
            s: FINAL_CONFIG.value.style.chart.circles.labels.value.suffix,
            r: FINAL_CONFIG.value.style.chart.circles.labels.value.rounding,
        }),
    );
}

function getValueFontSize(circle) {
    if (!circle) {
        return 0;
    }

    const label = getCircleLabel(circle);
    const max = (circle.r / (label.length || 1)) * (label.length === 1 ? 1 : 2);
    return Math.min(circle.r / 2.5, max);
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
    FINAL_CONFIG.value.style.chart.zoom?.speed ?? 1,
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

function clampRectangleToViewBox(rectangle, sourceViewBox) {
    const margin = Math.max(
        4,
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
    if (FINAL_CONFIG.value.style.chart.circles.labels.value.show) {
        lines.push(getCircleLabel(circle));
    }
    return lines.filter(Boolean);
}

function getParentTooltipCandidateRect(
    circle,
    width,
    height,
    placement,
    distance,
) {
    const centerX = circle.x;
    const centerY = circle.y;

    const placements = {
        right: {
            x: centerX + circle.r + distance,
            y: centerY - height / 2,
            anchorX: centerX + circle.r,
            anchorY: centerY,
        },
        left: {
            x: centerX - circle.r - distance - width,
            y: centerY - height / 2,
            anchorX: centerX - circle.r,
            anchorY: centerY,
        },
        top: {
            x: centerX - width / 2,
            y: centerY - circle.r - distance - height,
            anchorX: centerX,
            anchorY: centerY - circle.r,
        },
        bottom: {
            x: centerX - width / 2,
            y: centerY + circle.r + distance,
            anchorX: centerX,
            anchorY: centerY + circle.r,
        },
        topRight: {
            x: centerX + circle.r * 0.7 + distance,
            y: centerY - circle.r * 0.7 - distance - height,
            anchorX: centerX + circle.r * 0.7,
            anchorY: centerY - circle.r * 0.7,
        },
        topLeft: {
            x: centerX - circle.r * 0.7 - distance - width,
            y: centerY - circle.r * 0.7 - distance - height,
            anchorX: centerX - circle.r * 0.7,
            anchorY: centerY - circle.r * 0.7,
        },
        bottomRight: {
            x: centerX + circle.r * 0.7 + distance,
            y: centerY + circle.r * 0.7 + distance,
            anchorX: centerX + circle.r * 0.7,
            anchorY: centerY + circle.r * 0.7,
        },
        bottomLeft: {
            x: centerX - circle.r * 0.7 - distance - width,
            y: centerY + circle.r * 0.7 + distance,
            anchorX: centerX - circle.r * 0.7,
            anchorY: centerY + circle.r * 0.7,
        },
    };

    return placements[placement];
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
    const centerX = circle.x;
    const centerY = circle.y;
    const container = containerCircle || circle;
    const diagonalOffset = distance * 0.6;

    const placements = {
        right: {
            x: container.x + container.r + distance,
            y: centerY - height / 2,
        },
        left: {
            x: container.x - container.r - distance - width,
            y: centerY - height / 2,
        },
        top: {
            x: centerX - width / 2,
            y: container.y - container.r - distance - height,
        },
        bottom: {
            x: centerX - width / 2,
            y: container.y + container.r + distance,
        },
        topRight: {
            x: container.x + container.r + distance,
            y: container.y - container.r - distance - height - diagonalOffset,
        },
        topLeft: {
            x: container.x - container.r - distance - width,
            y: container.y - container.r - distance - height - diagonalOffset,
        },
        bottomRight: {
            x: container.x + container.r + distance,
            y: container.y + container.r + distance + diagonalOffset,
        },
        bottomLeft: {
            x: container.x - container.r - distance - width,
            y: container.y + container.r + distance + diagonalOffset,
        },
    };

    const rectangle = placements[placement];
    const targetX = rectangle.x + width / 2;
    const targetY = rectangle.y + height / 2;
    const angle = Math.atan2(targetY - centerY, targetX - centerX);

    return {
        ...rectangle,
        anchorX: centerX + Math.cos(angle) * circle.r,
        anchorY: centerY + Math.sin(angle) * circle.r,
    };
}

function createParentTooltipItems(sourceViewBox, options = {}) {
    const { clamp = true } = options;

    if (
        !circles.value.length ||
        !SIZE.value.w ||
        !SIZE.value.h ||
        !FINAL_CONFIG.value.style.chart.parentTooltips.show
    ) {
        return [];
    }

    const fontSize = Math.max(
        8,
        FINAL_CONFIG.value.style.chart.parentTooltips.fontSizeRatio * 10,
    );
    const lineHeight = fontSize * 1.25;
    const paddingX = fontSize * 0.75;
    const paddingY = fontSize * 0.55;
    const distance = Math.max(
        8,
        Math.min(sourceViewBox.width, sourceViewBox.height) * 0.025,
    );
    const collisionGap = Math.max(
        2,
        Math.min(sourceViewBox.width, sourceViewBox.height) * 0.006,
    );

    const placements = [
        'right',
        'left',
        'top',
        'bottom',
        'topRight',
        'topLeft',
        'bottomRight',
        'bottomLeft',
    ];

    const tooltips = [];
    const circleById = new Map(
        circles.value.map((circle) => [circle.id, circle]),
    );

    const parentCircles = circles.value
        .filter((circle) => circle.hasChildren && circle.name)
        .sort((a, b) => b.r - a.r);

    parentCircles.forEach((circle) => {
        const ancestors = getCircleAncestors(circle, circleById);
        const outermostAncestor = ancestors.at(-1);
        const lines = getParentTooltipTextLines(circle);

        const longestLine = lines.reduce((max, line) => {
            return Math.max(max, String(line).length);
        }, 0);

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
        });
    });

    return tooltips;
}

const parentTooltipItems = computed(() => {
    return createParentTooltipItems(viewBox.value, {
        clamp: true,
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

const table = computed(() => {
    const hierarchy = buildHierarchyRows(formattedDataset.value);

    const head = flattenedDataset.value
        .map((d) => ({
            name: d.name,
            value: d.value,
            color: d.color,
        }))
        .toSorted((a, b) => b.value - a.value);

    const body = hierarchy.map((row) => row.value);

    return { head, body, hierarchy };
});

const csvTable = computed(() => {
    return buildHierarchyRows(formattedDataset.value).map((row) => ({
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
            [FINAL_CONFIG.value.style.chart.title.text],
            [FINAL_CONFIG.value.style.chart.title.subtitle.text],
            [
                [FINAL_CONFIG.value.table.columnNames.datapoint],
                ['Parent'],
                ['Depth'],
                [FINAL_CONFIG.value.table.columnNames.value],
            ],
        ].concat(labels);

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({
                csvContent,
                title:
                    FINAL_CONFIG.value.style.chart.title.text ||
                    'vue-ui-circle-pack',
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

    const body = table.value.hierarchy.map((row) => {
        const label = dataLabel({
            p: FINAL_CONFIG.value.style.chart.circles.labels.value.prefix,
            v: row.value,
            s: FINAL_CONFIG.value.style.chart.circles.labels.value.suffix,
            r: FINAL_CONFIG.value.style.chart.circles.labels.value.rounding,
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

    const colNames = [
        FINAL_CONFIG.value.table.columnNames.datapoint,
        FINAL_CONFIG.value.table.columnNames.parent,
        FINAL_CONFIG.value.table.columnNames.depth,
        FINAL_CONFIG.value.table.columnNames.value,
    ];

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

function getData() {
    return formattedDataset.value;
}

async function getImage({ scale = 2 } = {}) {
    if (!circlePackChart.value) return;
    const { width, height } = circlePackChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({
        domElement: circlePackChart.value,
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

const tableComponent = computed(() => {
    const useDialog =
        FINAL_CONFIG.value.table.useDialog && !FINAL_CONFIG.value.table.show;
    const open = mutableConfig.value.showTable;
    return {
        component: useDialog ? BaseDraggableDialog : Accordion,
        title: `${FINAL_CONFIG.value.style.chart.title.text}${FINAL_CONFIG.value.style.chart.title.subtitle.text ? `: ${FINAL_CONFIG.value.style.chart.title.subtitle.text}` : ''}`,
        props: useDialog
            ? {
                  backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
                  color: FINAL_CONFIG.value.table.th.color,
                  headerColor: FINAL_CONFIG.value.table.th.color,
                  headerBg: FINAL_CONFIG.value.table.th.backgroundColor,
                  isFullscreen: isFullscreen.value,
                  fullscreenParent: circlePackChart.value,
                  forcedWidth: Math.min(500, window.innerWidth * 0.8),
                  isCursorPointer: isCursorPointer.value,
              }
            : {
                  hideDetails: true,
                  config: {
                      open,
                      maxHeight: 10000,
                      body: {
                          backgroundColor:
                              FINAL_CONFIG.value.style.chart.backgroundColor,
                          color: FINAL_CONFIG.value.style.chart.color,
                      },
                      head: {
                          backgroundColor:
                              FINAL_CONFIG.value.style.chart.backgroundColor,
                          color: FINAL_CONFIG.value.style.chart.color,
                      },
                  },
              },
    };
});

watch(
    () => mutableConfig.value.showTable,
    (v) => {
        if (FINAL_CONFIG.value.table.show) return;
        if (v && FINAL_CONFIG.value.table.useDialog && tableUnit.value) {
            tableUnit.value.open();
        } else {
            if (tableUnit.value && 'close' in tableUnit.value) {
                tableUnit.value.close();
            }
        }
    },
);

function closeTable() {
    mutableConfig.value.showTable = false;
    if (userOptionsRef.value) {
        userOptionsRef.value.setTableIconState(false);
    }
}

const svgBg = computed(() => FINAL_CONFIG.value.style.chart.backgroundColor);
const svgTitle = computed(() => FINAL_CONFIG.value.style.chart.title);

const { exportSvg, getSvg } = useSvgExport({
    svg: svgRef,
    title: svgTitle,
    backgroundColor: svgBg,
});

async function generateSvg({ isCb }) {
    isCallbackSvg.value = true;

    await nextTick();

    try {
        if (isCb) {
            const { blob, url, text, dataUrl } = await getSvg();
            await Promise.resolve(
                FINAL_CONFIG.value.userOptions.callbacks.svg({
                    blob,
                    url,
                    text,
                    dataUrl,
                }),
            );
        } else {
            await Promise.resolve(exportSvg());
        }
    } finally {
        isCallbackSvg.value = false;
    }
}

function onGenerateImage(payload) {
    if (payload?.stage === 'start') {
        isCallbackImaging.value = true;
        return;
    }

    if (payload?.stage === 'end') {
        isCallbackImaging.value = false;
        return;
    }

    generateImage();
}

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: formattedDataset.value,
        flattenedDataset: flattenedDataset.value,
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
            flattenedDataset: flattenedDataset.value,
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

function clearKeyboardSelection() {
    if (activeTooltipIndex.value !== null) {
        const currentCircle = circles.value[activeTooltipIndex.value];
        currentCircle && onTrapLeave(currentCircle, activeTooltipIndex.value);
    }
    activeTooltipIndex.value = null;
    tooltipTriggerMode.value = 'pointer';
    isTooltip.value = false;
    selectedDatapoint.value = null;
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
        dataTable.value?.body?.map((row) => [row[0]?.name ?? '', row[1]]) ?? [];

    return { headers, rows };
});

const textColor = computed(() => FINAL_CONFIG.value.style.chart.color);

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
</script>

<template>
    <div
        :id="`vue-ui-circle-pack_${uid}`"
        :class="`vue-data-ui-component vue-ui-circle-pack ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${loading ? 'loading' : ''}`"
        ref="circlePackChart"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor};`"
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <div :id="`chart-instructions-${uid}`" class="sr-only">
            <p>{{ FINAL_CONFIG.a11y.translations.keyboardNavigation }}</p>
        </div>

        <A11yDataTable
            v-if="a11yTable?.rows?.length"
            :uid="uid"
            :head="a11yTable.headers"
            :body="a11yTable.rows"
            :notice="FINAL_CONFIG.a11y.translations.tableAvailable"
            :caption="FINAL_CONFIG.a11y.translations.tableCaption"
        />

        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            :scale="maxRadius / 100"
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

        <slot name="userConfig" />

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle"
            class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div
            ref="chartTitle"
            v-if="FINAL_CONFIG.style.chart.title.text"
            :style="`width:100%;background:transparent;padding-bottom:12px`"
        >
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'donut-div-title',
                        ...FINAL_CONFIG.style.chart.title,
                    },
                    subtitle: {
                        cy: 'donut-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle,
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
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip"
            :isTooltip="mutableConfig.showTooltip"
            :hasLabel="false"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :hasAltCopy="FINAL_CONFIG.userOptions.buttons.altCopy"
            :isFullscreen="isFullscreen"
            :chartElement="circlePackChart"
            :position="FINAL_CONFIG.userOptions.position"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :tableDialog="FINAL_CONFIG.table.useDialog"
            :isCursorPointer="isCursorPointer"
            :hasZoom="FINAL_CONFIG.userOptions.buttons.zoom"
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
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }" />
            </template>
            <template #optionTooltip v-if="$slots.optionTooltip">
                <slot name="optionTooltip" />
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
            <template #optionTable v-if="$slots.optionTable">
                <slot name="optionTable" />
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
                v-if="$slots.optionZoom"
                #optionZoom="{ toggleZoom, isZoomLocked }"
            >
                <slot name="optionZoom" v-bind="{ toggleZoom, isZoomLocked }" />
            </template>
            <template
                v-if="$slots.optionAltCopy"
                #optionAltCopy="{ altCopy: c }"
            >
                <slot name="optionAltCopy" v-bind="{ altCopy: c }" />
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
                }"
                :style="`display:block;${FINAL_CONFIG.responsive ? 'width:100%;height:auto' : 'height:100%;'};overflow:${mutableConfig.showZoom ? 'hidden' : 'visible'};background:transparent;color:${FINAL_CONFIG.style.chart.color};background:${FINAL_CONFIG.style.chart.backgroundColor};`"
                tabindex="0"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
            >
                <PackageVersion />

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
                        <radialGradient :id="circle.id" fy="30%">
                            <stop
                                offset="10%"
                                :stop-color="
                                    lightenHexColor(
                                        circle.color,
                                        FINAL_CONFIG.style.chart.circles
                                            .gradient.intensity / 100,
                                    )
                                "
                            />
                            <stop
                                offset="90%"
                                :stop-color="darkenHexColor(circle.color, 0.1)"
                            />
                            <stop offset="100%" :stop-color="circle.color" />
                        </radialGradient>
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
                        data-cy="datapoint-circle"
                        :x="circle.x - circle.r"
                        :y="circle.y - circle.r"
                        :width="circle.r * 2"
                        :height="circle.r * 2"
                        :stroke="FINAL_CONFIG.style.chart.circles.stroke"
                        :stroke-width="
                            (FINAL_CONFIG.style.chart.circles.strokeWidth *
                                (maxRadius || 1)) /
                            100
                        "
                        :fill="
                            FINAL_CONFIG.style.chart.circles.gradient.show
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
                        :x="circle.x - circle.r"
                        :y="circle.y - circle.r"
                        :width="circle.r * 2"
                        :height="circle.r * 2"
                        :stroke="FINAL_CONFIG.style.chart.circles.stroke"
                        :stroke-width="
                            (FINAL_CONFIG.style.chart.circles.strokeWidth *
                                (maxRadius || 1)) /
                            100
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
                        data-cy="datapoint-circle-overlay"
                        :x="circle.x - circle.r"
                        :y="circle.y - circle.r"
                        :width="circle.r * 2"
                        :height="circle.r * 2"
                        stroke="none"
                        :fill="
                            selectedDatapoint &&
                            selectedDatapoint.id === circle.id
                                ? FINAL_CONFIG.style.chart.circles.gradient.show
                                    ? `url(#${circle.id})`
                                    : circle.color
                                : 'transparent'
                        "
                        :rx="circle.r"
                        :style="{
                            filter:
                                selectedDatapoint &&
                                selectedDatapoint.id === circle.id
                                    ? `drop-shadow(0px 0px 6px ${FINAL_CONFIG.style.chart.circles.selectedShadowColor})`
                                    : 'none',
                            opacity: selectedDatapoint ? 1 : 0,
                            pointerEvents: 'none',
                            transition: 'opacity 0.2s ease-in-out',
                        }"
                    />
                </template>

                <!-- LABELS -->
                <template v-for="(circle, i) in circles" :key="circle.id">
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
                                    FINAL_CONFIG.style.chart.circles.labels.name
                                        .fontSizeRatio,
                                value:
                                    getValueFontSize(circle) *
                                    FINAL_CONFIG.style.chart.circles.labels
                                        .value.fontSizeRatio,
                            },
                            color: !FINAL_CONFIG.style.chart.circles.labels.name
                                .color
                                ? adaptColorToBackground(circle.color)
                                : FINAL_CONFIG.style.chart.circles.labels.name
                                      .color,
                        }"
                    />

                    <template v-else>
                        <!-- LABEL NAME -->
                        <text
                            data-cy="label-name"
                            v-if="
                                FINAL_CONFIG.style.chart.circles.labels.name
                                    .show &&
                                circle.name &&
                                canShowCircleLabel(circle)
                            "
                            :style="{
                                pointerEvents: 'none',
                                transition: 'opacity 0.2s ease-in-out',
                            }"
                            :x="circle.x"
                            :y="
                                circle.y +
                                calcOffsetY(
                                    circle.r,
                                    FINAL_CONFIG.style.chart.circles.labels.name
                                        .offsetY,
                                ) -
                                circle.r / 10
                            "
                            :font-size="
                                (circle.r / 3) *
                                FINAL_CONFIG.style.chart.circles.labels.name
                                    .fontSizeRatio
                            "
                            :fill="
                                FINAL_CONFIG.style.chart.circles.labels.name
                                    .color === 'auto'
                                    ? adaptColorToBackground(circle.color)
                                    : FINAL_CONFIG.style.chart.circles.labels
                                          .name.color
                            "
                            :font-weight="
                                FINAL_CONFIG.style.chart.circles.labels.name
                                    .bold
                                    ? 'bold'
                                    : 'normal'
                            "
                            text-anchor="middle"
                        >
                            {{ circle.name }}
                        </text>

                        <!-- LABEL VALUE -->
                        <text
                            data-cy="label-value"
                            v-if="
                                FINAL_CONFIG.style.chart.circles.labels.value
                                    .show && canShowCircleLabel(circle)
                            "
                            :style="{
                                pointerEvents: 'none',
                                transition: 'opacity 0.2s ease-in-out',
                            }"
                            :x="circle.x"
                            :y="
                                circle.y +
                                calcOffsetY(
                                    circle.r,
                                    FINAL_CONFIG.style.chart.circles.labels
                                        .value.offsetY,
                                ) +
                                circle.r / 2.5
                            "
                            :font-size="
                                getValueFontSize(circle) *
                                FINAL_CONFIG.style.chart.circles.labels.value
                                    .fontSizeRatio
                            "
                            :fill="
                                FINAL_CONFIG.style.chart.circles.labels.value
                                    .color === 'auto'
                                    ? adaptColorToBackground(circle.color)
                                    : FINAL_CONFIG.style.chart.circles.labels
                                          .value.color
                            "
                            :font-weight="
                                FINAL_CONFIG.style.chart.circles.labels.value
                                    .bold
                                    ? 'bold'
                                    : 'normal'
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
                        FINAL_CONFIG.style.chart.parentTooltips.show
                    "
                    data-cy="parent-svg-tooltips"
                    :style="{ pointerEvents: 'none' }"
                >
                    <g
                        v-for="tooltip in parentTooltipItems"
                        :key="tooltip.id"
                        data-cy="parent-svg-tooltip"
                    >
                        <line
                            :x1="tooltip.anchorX"
                            :y1="tooltip.anchorY"
                            :x2="tooltip.lineX"
                            :y2="tooltip.lineY"
                            :stroke="
                                FINAL_CONFIG.style.chart.parentTooltips.link
                                    .useSerieColor
                                    ? tooltip.color
                                    : FINAL_CONFIG.style.chart.parentTooltips
                                          .link.stroke
                            "
                            :stroke-width="
                                FINAL_CONFIG.style.chart.parentTooltips.link
                                    .strokeWidth
                            "
                            stroke-linecap="round"
                            :stroke-dasharray="
                                FINAL_CONFIG.style.chart.parentTooltips.link
                                    .strokeDasharray
                            "
                            :opacity="
                                FINAL_CONFIG.style.chart.parentTooltips.link
                                    .opacity
                            "
                        />
                        <rect
                            :x="tooltip.x"
                            :y="tooltip.y"
                            :width="tooltip.width"
                            :height="tooltip.height"
                            :rx="
                                Math.max(3, tooltip.fontSize / 2.5) *
                                FINAL_CONFIG.style.chart.parentTooltips
                                    .borderRadiusRatio
                            "
                            :fill="
                                FINAL_CONFIG.style.chart.parentTooltips
                                    .backgroundColor
                            "
                            :stroke="
                                FINAL_CONFIG.style.chart.parentTooltips
                                    .useSerieColor
                                    ? tooltip.color
                                    : FINAL_CONFIG.style.chart.parentTooltips
                                          .stroke
                            "
                            :stroke-width="
                                FINAL_CONFIG.style.chart.parentTooltips
                                    .strokeWidth
                            "
                            :filter="
                                FINAL_CONFIG.style.chart.parentTooltips.filter
                            "
                        />

                        <slot name="parent-tooltip" v-bind="{ ...tooltip }">
                            <circle
                                :cx="tooltip.x + tooltip.paddingX * 1.3"
                                :cy="
                                    tooltip.y +
                                    tooltip.paddingY +
                                    tooltip.lineHeight / 2
                                "
                                :r="tooltip.fontSize * 0.35"
                                :fill="tooltip.color"
                            />
                            <text
                                :x="
                                    tooltip.x +
                                    tooltip.paddingX +
                                    tooltip.fontSize
                                "
                                :y="
                                    tooltip.y +
                                    tooltip.paddingY +
                                    tooltip.fontSize
                                "
                                :font-size="tooltip.fontSize"
                                :fill="
                                    FINAL_CONFIG.style.chart.parentTooltips
                                        .color
                                "
                                :font-family="FINAL_CONFIG.style.fontFamily"
                                text-anchor="start"
                            >
                                <tspan
                                    v-for="(line, lineIndex) in tooltip.lines"
                                    :key="`${tooltip.id}_${lineIndex}`"
                                    :x="
                                        tooltip.x +
                                        tooltip.paddingX +
                                        tooltip.fontSize
                                    "
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
                        background: FINAL_CONFIG.style.chart.backgroundColor,
                        cursor: isCursorPointer ? 'pointer' : 'default',
                    }"
                    @click="resetZoom(true)"
                >
                    <BaseIcon
                        name="refresh"
                        :stroke="FINAL_CONFIG.style.chart.color"
                    />
                </button>
            </slot>
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- TOOLTIP -->
        <Tooltip
            :teleportTo="FINAL_CONFIG.style.chart.tooltip.teleportTo"
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.style.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.chart.tooltip.color"
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
            :backgroundOpacity="
                FINAL_CONFIG.style.chart.tooltip.backgroundOpacity
            "
            :position="FINAL_CONFIG.style.chart.tooltip.position"
            :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="circlePackChart"
            :content="tooltipContent"
            :isCustom="useCustomFormat"
            :isFullscreen="isFullscreen"
            :smooth="FINAL_CONFIG.style.chart.tooltip.smooth"
            :backdropFilter="FINAL_CONFIG.style.chart.tooltip.backdropFilter"
            :smoothForce="FINAL_CONFIG.style.chart.tooltip.smoothForce"
            :smoothSnapThreshold="
                FINAL_CONFIG.style.chart.tooltip.smoothSnapThrehsold
            "
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
                        <div
                            v-html="th"
                            style="display: flex; align-items: center"
                        ></div>
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

rect,
text {
    transition: all 0.2s ease-in-out !important;
}

.loading rect,
.loading text {
    transition: none !important;
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
</style>
