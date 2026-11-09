<script setup>
import {
    getUserOptionsProps,
    getUserOptionSlots,
    getUserOptionSlotProps,
} from '../userOptionsSlots';
import { getAnnotatorProps } from '../annotatorConfig';
import { getTableComponent, syncTableVisibility } from '../tableIntegration';
import {
    annotationSlotNames,
    getAnnotationSlotProps,
} from '../annotationSlots';

import { createChartImageGetter } from '../chartImage';
import {
    computed,
    defineAsyncComponent,
    onBeforeUnmount,
    onMounted,
    ref,
    shallowRef,
    toRefs,
    watch,
    watchEffect,
} from 'vue';
import {
    adaptColorToBackground,
    applyDataLabel,
    buildDisplayedTimeLabels,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createSmoothPath,
    createStraightPath,
    createTSpansFromLineBreaksOnX,
    createUid,
    dataLabel,
    downloadCsv,
    error,
    getMissingDatasetAttributes,
    objectIsEmpty,
    palette,
    treeShake,
    XMLNS,
} from '../lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { useSvgLabelLayout } from '../useSvgLabelLayout';
import { useLoading } from '../useLoading';
import { usePrinter } from '../usePrinter';
import { resolveChartConfigWithPalette } from '../resolveChartConfig';
import { useResponsive } from '../useResponsive';
import { useTimeLabels } from '../useTimeLabels';
import { useChartExport } from '../useChartExport';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import { useTimeLabelCollision } from '../useTimeLabelCollider';
import themes from '../themes/vue_ui_bump.json';
import Title from '../atoms/Title.vue';
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import BaseDraggableDialog from '../atoms/BaseDraggableDialog.vue';

const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(
    () => import('../atoms/PenAndPaper.vue'),
);
const UserOptions = defineAsyncComponent(
    () => import('../atoms/UserOptions.vue'),
);
const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);

const { vue_ui_bump: DEFAULT_CONFIG } = useConfig();

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

const emit = defineEmits(['copyAlt']);

const isDataset = computed(() => !!props.dataset?.length);

const bumpChart = ref(null);
const uid = ref(createUid());
const step = ref(0);
const chartTitle = ref(null);
const noTitle = ref(null);
const source = ref(null);
const isFullscreen = ref(false);
const titleStep = ref(0);
const tableStep = ref(0);
const tableUnit = ref(null);
const userOptionsRef = ref(null);
const selectedSeries = ref(null);
const labelsLeft = ref(null);
const labelsRight = ref(null);
const timeLabelsEls = ref(null);

const activeSeriesId = ref(null);
const activePointIndex = computed(() => {
    const index = keyboardNavigableSeries.value.findIndex(
        (serie) => serie.id === activeSeriesId.value,
    );
    return index < 0 ? null : index;
});
const isFocus = ref(false); // a11y

const FINAL_CONFIG = ref(prepareConfig());
const cfgPlots = computed(() => FINAL_CONFIG.value.style.chart.layout.plots);
const cfgLayout = computed(() => FINAL_CONFIG.value.style.chart.layout);
const cfgChart = computed(() => FINAL_CONFIG.value.style.chart);
const cfgUserOptions = computed(() => FINAL_CONFIG.value.userOptions);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiBump',
    rules: [
        COMMON_RULES.emptyArray,
        {
            test: (ds) => ds.length > 31,
            message: [
                '👀 The number of series > 31. Consider:',
                '',
                '▶️ Using filters to let users choose a maximum number of series to display',
                '',
                '▶️ Use several instances of the component to show related series',
            ],
        },
        {
            test: (ds) => ds.length === 1,
            message: [
                '👀 There is only 1 series in your dataset. Consider:',
                '',
                '▶️ Using a line chart, with VueUiXy.',
            ],
        },
        {
            test: (ds) => ds.some((dp) => (dp?.values?.length || 0) > 31),
            message: [
                '👀 Some series contain > 31 data points, which can make the chart hard to read. Consider:',
                '',
                '▶️ Use filters to show less data points at a time.',
                '',
                '▶️ Use larger time scales, or aggregated values.',
            ],
        },
    ],
});

const isCursorPointer = computed(
    () => FINAL_CONFIG.value.userOptions.useCursorPointer,
);

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            userOptions: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    layout: {
                        timeLabels: { show: false },
                        lines: {
                            coatingColor: '#4A4A4A',
                        },
                        plots: {
                            stroke: '#4A4A4A',
                            labels: {
                                show: false,
                                displayedValue: 'rank',
                            },
                        },
                        nameLabels: {
                            useSerieColor: true,
                        },
                    },
                },
            },
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {},
    });
});

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: props.config?.skeletonDataset ?? [
        {
            name: '————',
            values: [1, 1, 1, 2, 2, 2, 3, 3, 2, 2],
            color: '#4A4A4A',
        },
        {
            name: '————',
            values: [2, 2, 2, 1, 3, 3, 2, 2, 3, 3],
            color: '#6A6A6A',
        },
        {
            name: '————',
            values: [3, 3, 3, 3, 1, 1, 1, 1, 1, 1],
            color: '#8A8A8A',
        },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value,
    }),
});

const responsiveSizeReady = ref(false);
let resizeFrame = 0;

onMounted(prepareChart);

function prepareConfig() {
    return resolveChartConfigWithPalette(props.config, DEFAULT_CONFIG, themes);
}

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } =
    useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({
    config: cfgChart.value.title,
});

function onChartEnter() {
    setUserOptionsVisibility(true);
}

function onChartLeave() {
    setUserOptionsVisibility(false);
}

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
});

watch(
    FINAL_CONFIG,
    () => {
        mutableConfig.value = {
            showTable: FINAL_CONFIG.value.table.show,
        };
    },
    { immediate: true },
);

watch(
    () => props.config,
    (_newCg) => {
        if (!loading.value) {
            FINAL_CONFIG.value = prepareConfig();
        }
        userOptionsVisible.value =
            !FINAL_CONFIG.value.userOptions.showOnChartHover;
        validateDataset();
        titleStep.value += 1;
        tableStep.value += 1;
        // Reset mutable config
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    },
    { deep: true },
);

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `bump_${uid.value}`,
    fileName: cfgChart.value.title.text || 'vue-ui-bump',
    options: FINAL_CONFIG.value.userOptions.print,
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !cfgChart.value.title.text;
});

const defaultSizes = ref({
    width: cfgChart.value.width,
    height: cfgChart.value.height,
});
const paddingRatio = computed(() => ({
    left: cfgChart.value.width
        ? cfgChart.value.padding.left / cfgChart.value.width
        : 0,
    right: cfgChart.value.width
        ? cfgChart.value.padding.right / cfgChart.value.width
        : 0,
}));

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const resizeObserver = shallowRef(null);
let scheduleResize = null;
let disposed = false;
const debug = computed(() => FINAL_CONFIG.value.debug);

function validateDataset() {
    let invalid = false;
    if (objectIsEmpty(props.dataset))
        error({
            componentName: 'VueUiBump',
            type: 'dataset',
            debug: debug.value,
        });
    for (const [index, datasetObject] of (Array.isArray(props.dataset)
        ? props.dataset
        : []
    ).entries()) {
        if (!datasetObject || typeof datasetObject !== 'object') {
            invalid = true;
            continue;
        }
        for (const property of getMissingDatasetAttributes({
            datasetObject,
            requiredAttributes: ['name', 'values'],
        })) {
            invalid = true;
            error({
                componentName: 'VueUiBump',
                type: 'datasetSerieAttribute',
                property,
                index,
                debug: debug.value,
            });
        }
        if (!Array.isArray(datasetObject.values)) invalid = true;
    }
    manualLoading.value = invalid;
}
function stopResize() {
    scheduleResize = null;
    cancelAnimationFrame(resizeFrame);
    resizeObserver.value?.disconnect();
    resizeObserver.value = null;
}
function prepareChart() {
    stopResize();
    if (!FINAL_CONFIG.value.responsive) {
        defaultSizes.value = {
            width: cfgChart.value.width,
            height: cfgChart.value.height,
        };
        return;
    }
    const parent = bumpChart.value?.parentNode;
    if (!parent) return;
    const resize = () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
            if (disposed) return;
            const { width, height } = useResponsive({
                chart: bumpChart.value,
                noTitle: noTitle.value,
                title: cfgChart.value.title.text ? chartTitle.value : null,
                legend: null,
                slicer: null,
                source: source.value,
            });
            defaultSizes.value = { width, height: height - 12 };
            responsiveSizeReady.value = true;
        });
    };
    scheduleResize = resize;
    resizeObserver.value = new ResizeObserver(resize);
    resizeObserver.value.observe(parent);
    resize();
}
onBeforeUnmount(() => {
    disposed = true;
    timeLabelsRequestId++;
    stopResize();
});

const unmutableDataset = computed(() => {
    const seen = new Set();
    return FINAL_DATASET.value.map((source, i) => {
        const ds = source || {};
        const candidate = ds.id ?? `bump_${uid.value}_${i}`;
        const id = seen.has(candidate)
            ? `bump_duplicate_${uid.value}_${i}`
            : candidate;
        seen.add(id);
        const color =
            convertColorToHex(ds.color) ||
            customPalette.value[i] ||
            palette[i] ||
            palette[i % palette.length];
        return {
            ...ds,
            absoluteIndex: i,
            id,
            values: Array.isArray(ds.values) ? ds.values : [],
            color,
        };
    });
});

const maxLen = computed(() =>
    Math.max(
        0,
        ...FINAL_DATASET.value.map((serie) => serie?.values?.length || 0),
    ),
);
const allPositions = computed(() =>
    getPositionsForAllSeries(FINAL_DATASET.value),
);

function getPositionsForAllSeries(dataset) {
    const positions = dataset.map(() => Array(maxLen.value).fill(null));

    for (let valueIndex = 0; valueIndex < maxLen.value; valueIndex += 1) {
        const pairs = dataset
            .map((serie, seriesIndex) => ({
                seriesIndex,
                value: serie?.values?.[valueIndex],
                previousPosition:
                    valueIndex > 0 &&
                    Number.isFinite(positions[seriesIndex][valueIndex - 1])
                        ? positions[seriesIndex][valueIndex - 1]
                        : seriesIndex,
            }))
            .filter((pair) => Number.isFinite(pair.value));

        pairs.sort((first, second) => {
            if (second.value !== first.value) return second.value - first.value;
            return (
                first.previousPosition - second.previousPosition ||
                first.seriesIndex - second.seriesIndex
            ); // break tie by last rank
        });

        for (
            let sortedIndex = 0;
            sortedIndex < pairs.length;
            sortedIndex += 1
        ) {
            const pair = pairs[sortedIndex];
            positions[pair.seriesIndex][valueIndex] = sortedIndex;
        }
    }

    return positions;
}

const {
    metrics: labelLayout,
    ready: labelLayoutReady,
    settling: labelLayoutSettling,
    update: measureLabelLayout,
} = useSvgLabelLayout({
    svgRef,
    canMeasure: () =>
        (!FINAL_CONFIG.value.responsive || responsiveSizeReady.value) &&
        (!cfgLayout.value.timeLabels.show || timeLabelsAreReady.value),
    initialMetrics: { left: 0, right: 0, bottom: 0 },
    measure: (read) => {
        if (
            cfgLayout.value.timeLabels.autoRotate.enable &&
            detectTimeLabelCollisionNow()
        ) {
            return null;
        }
        return {
            left: read(labelsLeft.value).width,
            right: read(labelsRight.value).width,
            bottom: read(timeLabelsEls.value).height,
        };
    },
});

const offsetY = computed(() =>
    cfgLayout.value.timeLabels.show && displayedTimeLabels.value.length
        ? labelLayout.value.bottom +
          Math.abs(cfgLayout.value.timeLabels.offsetY) +
          cfgLayout.value.timeLabels.fontSize * 0.3
        : 0,
);

const drawingArea = computed(() => {
    const { height: H, width: W } = defaultSizes.value;
    const { right: PR, left: PL } = paddingRatio.value;

    const offsetXLeft = labelLayout.value.left;
    const offsetXRight = labelLayout.value.right;

    const top = cfgChart.value.padding.top;
    const right = W - W * PR - offsetXRight;
    const left = W * PL + offsetXLeft;
    const width = W - W * PR - W * PL - offsetXLeft - offsetXRight;
    const height = H - top - cfgChart.value.padding.bottom - offsetY.value;
    const bottom = top + height;
    const chartHeight = top + height;

    const svgHeight = Math.max(0, H);
    const chartWidth = Math.max(0, W);

    return {
        chartHeight,
        chartWidth,
        top,
        right: Math.max(0, right),
        bottom: Math.max(0, bottom),
        left: Math.max(0, left),
        width: Math.max(0, width),
        height: Math.max(0, height),
        unitH: unmutableDataset.value.length
            ? Math.max(0, height) / unmutableDataset.value.length
            : 0,
        unitW: maxLen.value ? Math.max(0, width) / maxLen.value : 0,
        svgHeight,
    };
});
const seriesValueLabels = computed(() =>
    FINAL_DATASET.value.map((serie) =>
        Array.from({ length: maxLen.value }, (_, index) =>
            applyDataLabel(
                cfgPlots.value.labels.formatter,
                serie?.values?.[index],
                dataLabel({
                    p: cfgPlots.value.labels.prefix,
                    v: serie?.values?.[index],
                    s: cfgPlots.value.labels.suffix,
                    r: cfgPlots.value.labels.rounding,
                }),
            ),
        ),
    ),
);

const formattedDataset = computed(() => {
    if (!isDataset.value && !loading.value) return [];

    return unmutableDataset.value
        .map((ds, seriesIndex) => {
            return {
                ...ds,
                positions: allPositions.value[seriesIndex],
            };
        })
        .map((ds) => {
            const coordinates = ds.positions.map((p, i) => {
                const displayValue =
                    seriesValueLabels.value[ds.absoluteIndex][i];

                return {
                    name: ds.name,
                    id: ds.id,
                    x:
                        drawingArea.value.left +
                        i * drawingArea.value.unitW +
                        drawingArea.value.unitW / 2,
                    y:
                        p == null
                            ? null
                            : drawingArea.value.top +
                              p * drawingArea.value.unitH +
                              drawingArea.value.unitH / 2,
                    value: ds.values[i],
                    displayValue,
                    rank: p == null ? null : p + 1,
                    color: ds.color,
                    labelColor:
                        cfgPlots.value.labels.color === 'auto'
                            ? adaptColorToBackground(ds.color)
                            : (convertColorToHex(cfgPlots.value.labels.color) ??
                              adaptColorToBackground(ds.color)),
                };
            });

            const validCoordinates = coordinates.filter((c) =>
                Number.isFinite(c.value),
            );

            const path = cfgLayout.value.lines.smooth
                ? createSmoothPath(validCoordinates)
                : createStraightPath(validCoordinates);

            return {
                ...ds,
                coordinates,
                path,
            };
        });
});

const seriesPoints = computed(
    () =>
        new Map(
            formattedDataset.value.map((serie) => [
                serie.id,
                serie.coordinates.filter((point) =>
                    Number.isFinite(point.value),
                ),
            ]),
        ),
);
const plottedSeries = computed(() =>
    formattedDataset.value.filter((serie) => validPoints(serie).length),
);
function validPoints(serie) {
    return seriesPoints.value.get(serie.id) || [];
}
function pointEvents(point, serie) {
    const payload = { ...point, pointIndex: serie.coordinates.indexOf(point) };
    return {
        mouseenter: () => onPointEnter(payload, serie),
        mouseleave: () => onPointLeave(payload, serie),
        click: () => onPointClick(payload, serie),
    };
}
function seriesOpacity(serie) {
    return selectedSeries.value == null || selectedSeries.value === serie.id
        ? 1
        : 0.1;
}

function spreadLabelsVertically(labels, minGap, topLimit, bottomLimit) {
    const sorted = labels.toSorted((a, b) => a.y - b.y);

    // Push down to satisfy minGap
    for (let i = 1; i < sorted.length; i += 1) {
        const previous = sorted[i - 1];
        const current = sorted[i];
        if (current.y < previous.y + minGap) {
            current.y = previous.y + minGap;
        }
    }

    // Clamp to bottom, then push up if overflow
    const lastIndex = sorted.length - 1;
    if (lastIndex >= 0 && sorted[lastIndex].y > bottomLimit) {
        sorted[lastIndex].y = bottomLimit;
        for (let i = lastIndex - 1; i >= 0; i -= 1) {
            const next = sorted[i + 1];
            const current = sorted[i];
            if (current.y > next.y - minGap) {
                current.y = next.y - minGap;
            }
        }
    }

    // Clamp top after push-up
    if (sorted.length && sorted[0].y < topLimit) {
        const delta = topLimit - sorted[0].y;
        for (let i = 0; i < sorted.length; i += 1) {
            sorted[i].y += delta;
        }
    }

    return sorted;
}

const nameLabels = computed(() => {
    const left = [];
    const right = [];

    formattedDataset.value.forEach((ds) => {
        const validCoords = validPoints(ds);
        if (!validCoords.length) return;

        left.push({ ...validCoords[0] });

        const last = validCoords[validCoords.length - 1];
        right.push({ ...last });
    });

    // Use actual y positions & spread to avoid overlaps
    const fontSize = cfgLayout.value.nameLabels.fontSize;
    const minGap = fontSize * 1.4;
    const topLimit = drawingArea.value.top + fontSize;
    const bottomLimit = drawingArea.value.bottom - fontSize;

    const rightSpread = spreadLabelsVertically(
        right,
        minGap,
        topLimit,
        bottomLimit,
    );

    const leftSpread = spreadLabelsVertically(
        left,
        minGap,
        topLimit,
        bottomLimit,
    );

    return {
        left: leftSpread,
        right: rightSpread,
    };
});

const nameLabelSides = [
    {
        key: 'left',
        anchor: 'end',
        sign: -1,
        setRef: (element) => {
            labelsLeft.value = element;
        },
    },
    {
        key: 'right',
        anchor: 'start',
        sign: 1,
        setRef: (element) => {
            labelsRight.value = element;
        },
    },
];

function getValueRect(label) {
    const padding = cfgPlots.value.labels.fontSize * 0.4;
    const text = String(label.displayValue);
    const textWidth =
        text.length *
        (cfgPlots.value.labels.fontSize * (text.length === 1 ? 1 : 0.6));
    const textHeight = cfgPlots.value.labels.fontSize;
    const width = textWidth + padding * 2;
    const height = textHeight + padding * 2;
    const x = label.x - width / 2;
    const y = label.y - height / 2;
    const strokeWidth = cfgPlots.value.strokeWidth;

    return {
        x: x - strokeWidth / 2,
        y: y - strokeWidth / 2,
        width: width + strokeWidth,
        height: height + strokeWidth,
        fill: label.color,
        stroke: cfgPlots.value.stroke,
        'stroke-width': strokeWidth,
        rx: height / 2,
    };
}

const timeLabels = ref([]);
const timeLabelsAreReady = ref(false);
let timeLabelsRequestId = 0;

watchEffect(() => {
    const requestId = ++timeLabelsRequestId;

    const cfg = cfgLayout.value.timeLabels;
    const values = cfg.values;
    const formatter = cfg.datetimeFormatter;
    const end = maxLen.value;

    // Keep the shape stable when there is no data
    if (!end) {
        timeLabels.value = [];
        timeLabelsAreReady.value = true;
        return;
    }

    (async () => {
        const labels = await useTimeLabels({
            values: Array.isArray(values) ? values : [],
            maxDatapoints: end,
            formatter,
            start: 0,
            end,
        });

        // Prevent out-of-order async updates
        if (!disposed && requestId === timeLabelsRequestId) {
            timeLabels.value = labels;
            timeLabelsAreReady.value = true;
        }
    })();
});

const displayedTimeLabels = computed(() => {
    const cfg = cfgLayout.value.timeLabels;
    if (!Array.isArray(cfg.values) || !cfg.values.length) return [];
    const texts = timeLabels.value.map((label) => label?.text ?? '');
    return buildDisplayedTimeLabels(
        !!cfg.showOnlyFirstAndLast,
        !!cfg.showOnlyAtModulo,
        Math.max(1, Number(cfg.modulo) || 1),
        texts,
        texts,
        0,
        null,
        maxLen.value,
    );
});

const WIDTH = computed(() => defaultSizes.value.width);
const HEIGHT = computed(() => defaultSizes.value.height);

const slicer = computed(() => ({
    start: 0,
    end: maxLen.value,
}));

/***************************************************************************************************
 * a11y
 **************************************************************************************************/
const keyboardNavigableSeries = computed(() => {
    return [...plottedSeries.value]
        .map((serie) => {
            const lastValidCoordinate = [...serie.coordinates]
                .filter((point) => Number.isFinite(point.value))
                .at(-1);

            return {
                ...serie,
                navigationRank:
                    lastValidCoordinate?.rank ?? Number.POSITIVE_INFINITY,
            };
        })
        .sort((a, b) => a.navigationRank - b.navigationRank);
});

function onSvgFocus() {
    activeSeriesId.value = null;
    isFocus.value = true;
}

function onSvgBlur() {
    clearKeyboardSelection();
    isFocus.value = false;
}

function getNextPointIndex(currentIndex, direction) {
    const len = keyboardNavigableSeries.value.length;
    if (!len) return null;
    if (currentIndex === null || currentIndex < 0 || currentIndex >= len)
        return 0;
    if (direction === 'previous') return (currentIndex - 1 + len) % len;
    return (currentIndex + 1) % len;
}

function clearKeyboardSelection() {
    if (activePointIndex.value !== null) {
        const currentSerie =
            keyboardNavigableSeries.value[activePointIndex.value];
        currentSerie && onPointLeave(currentSerie, currentSerie);
    }
    activeSeriesId.value = null;
    selectedSeries.value = null;
}

function onSvgKeydown(event) {
    if (!svgRef.value || isAnnotator.value) return;
    if (document.activeElement !== svgRef.value) return;
    if (!keyboardNavigableSeries.value.length) return;

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
        if (activePointIndex.value === null) return;

        const serie = keyboardNavigableSeries.value[activePointIndex.value];
        if (!serie) return;

        onPointClick(serie, serie);
        return;
    }

    let nextIndex = activePointIndex.value;

    if (nextIndex === null) {
        nextIndex = 0;
    } else if (isPreviousKey) {
        nextIndex = getNextPointIndex(nextIndex, 'previous');
    } else if (isNextKey) {
        nextIndex = getNextPointIndex(nextIndex, 'next');
    }

    const serie = keyboardNavigableSeries.value[nextIndex];
    if (!serie) return;

    activeSeriesId.value = serie.id;
    onPointEnter(serie, serie);
}

const a11yTable = computed(() => {
    return {
        head: dataTable.value.head,
        body: tableRows.value,
        caption: FINAL_CONFIG.value.a11y.translations.tableCaption,
        notice: FINAL_CONFIG.value.a11y.translations.tableAvailable,
    };
});

const { detectTimeLabelCollisionNow } = useTimeLabelCollision({
    timeLabelsEls: timeLabelsEls,
    timeLabels,
    slicer,
    configRef: FINAL_CONFIG,
    rotationPath: ['style', 'chart', 'layout', 'timeLabels', 'rotation'],
    autoRotatePath: [
        'style',
        'chart',
        'layout',
        'timeLabels',
        'autoRotate',
        'enable',
    ],
    isAutoSize: false,
    width: WIDTH,
    height: HEIGHT,
    rotation: cfgLayout.value.timeLabels.autoRotate.angle,
    resizeDebounceMs: 0,
});

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

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

/**
 * Return the current formatted dataset.
 * The result is the internal reactive value, not a defensive copy.
 *
 * @returns The current component data; treat it as read-only.
 */
function getData() {
    return formattedDataset.value;
}

function generateCsv(callback = null) {
    const title = [
        [cfgChart.value.title.text],
        [cfgChart.value.title.subtitle.text],
        [''],
    ];
    const head = tableHeaders.value;
    const bodyValue = formattedDataset.value.map((ds) => {
        return [
            ds.name,
            ...ds.coordinates.map((c) =>
                Number.isFinite(c.value) ? `${c.displayValue}` : '-',
            ),
        ];
    });

    const bodyRank = formattedDataset.value.map((ds) => {
        return [
            ds.name,
            ...ds.coordinates.map((c) => (c.rank == null ? '-' : `${c.rank}`)),
        ];
    });

    const table = title
        .concat([[FINAL_CONFIG.value.table.columnNames.values]])
        .concat([head])
        .concat(bodyValue)
        .concat([[''], [FINAL_CONFIG.value.table.columnNames.ranking], [head]])
        .concat(bodyRank);

    const csvContent = createCsvContent(table);

    if (!callback) {
        downloadCsv({
            csvContent,
            title: cfgChart.value.title.text || 'vue-ui-bump',
        });
    } else {
        callback(csvContent);
    }
}

const tableComponent = computed(() =>
    getTableComponent({
        config: FINAL_CONFIG,
        style: cfgChart,
        mutableConfig,
        dialog: BaseDraggableDialog,
        accordion: Accordion,
        isFullscreen,
        parent: bumpChart,
        maxWidth: 800,
        isCursorPointer,
    }),
);

const tableHeaders = computed(() => [
    '',
    ...Array.from(
        { length: maxLen.value },
        (_, index) => timeLabels.value[index]?.text ?? String(index),
    ),
]);
const tableRows = computed(() =>
    formattedDataset.value.map((serie) => [
        serie.name,
        ...serie.coordinates.map((point) =>
            Number.isFinite(point.value)
                ? `${point.displayValue} (${point.rank})`
                : '-',
        ),
    ]),
);

const dataTable = computed(() => {
    const head = tableHeaders.value;
    const rows = tableRows.value;

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

    const colNames = [FINAL_CONFIG.value.table.columnNames.series];

    return { head, body: rows, config, colNames };
});

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

const getImage = createChartImageGetter(
    bumpChart,
    () => cfgChart.value.title.text,
);

function onPointEnter(datapoint, serie) {
    selectedSeries.value = serie.id;
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({
            datapoint,
            seriesIndex: datapoint?.pointIndex ?? null,
        });
    }
}

function onPointLeave(datapoint, _serie) {
    selectedSeries.value = null;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({
            datapoint,
            seriesIndex: datapoint?.pointIndex ?? null,
        });
    }
}

function onPointClick(datapoint, _serie) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint,
            seriesIndex: datapoint?.pointIndex ?? null,
        });
    }
}

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: formattedDataset.value,
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
        }),
    );
}

watch(() => props.dataset, validateDataset, { deep: true, immediate: true });
watch(
    [
        () => FINAL_CONFIG.value.responsive,
        () => cfgChart.value.width,
        () => cfgChart.value.height,
    ],
    prepareChart,
    { flush: 'post' },
);
watch(cfgChart, () => scheduleResize?.(), { flush: 'post' });
watch(loading, (value) => {
    if (value) {
        selectedSeries.value = null;
        activeSeriesId.value = null;
    }
});
watch(plottedSeries, (series) => {
    if (
        selectedSeries.value != null &&
        !series.some((serie) => serie.id === selectedSeries.value)
    )
        selectedSeries.value = null;
    if (
        activeSeriesId.value != null &&
        !series.some((serie) => serie.id === activeSeriesId.value)
    )
        activeSeriesId.value = null;
});

defineExpose({
    getData,
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    generateSvg,
    toggleTable,
    toggleAnnotator,
    toggleFullscreen,
    copyAlt,
});
watch(
    () => [
        defaultSizes.value.width,
        defaultSizes.value.height,
        cfgLayout.value,
        timeLabels.value,
        timeLabelsAreReady.value,
        labelsLeft.value,
        labelsRight.value,
        timeLabelsEls.value,
        props.dataset,
        responsiveSizeReady.value,
        FINAL_CONFIG.value.style.fontFamily,
    ],
    measureLabelLayout,
    { flush: 'post', deep: true },
);
</script>

<template>
    <div
        :id="`bump_${uid}`"
        ref="bumpChart"
        :class="{
            'vue-data-ui-component': true,
            'vue-ui-bump': true,
            'vue-data-ui-wrapper-fullscreen': isFullscreen,
        }"
        :style="`background:${cfgChart.backgroundColor};color:${cfgChart.color};font-family:${FINAL_CONFIG.style.fontFamily}; position: relative; ${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`"
        @mouseenter="onChartEnter"
        @mouseleave="onChartLeave"
    >
        <p :id="`chart-instructions-${uid}`" class="sr-only">
            {{ FINAL_CONFIG.a11y.translations.keyboardNavigation }}
        </p>

        <A11yDataTable
            v-if="FINAL_CONFIG.a11y.includeTable && a11yTable.body.length"
            :uid="uid"
            :head="a11yTable.head"
            :body="a11yTable.body"
            :caption="a11yTable.caption"
            :notice="a11yTable.notice"
        />

        <PenAndPaper
            v-bind="getAnnotatorProps(cfgUserOptions.annotator)"
            v-if="cfgUserOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :active="isAnnotator"
            :isCursorPointer="isCursorPointer"
            :palette="cfgUserOptions.annotatorPalette"
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

        <!-- TITLE -->
        <div
            ref="chartTitle"
            v-if="cfgChart.title.text"
            :style="`width:100%;background:transparent;`"
        >
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'bump-title',
                        ...cfgChart.title,
                    },
                    subtitle: {
                        cy: 'bump-subtitle',
                        ...cfgChart.title.subtitle,
                    },
                }"
            />
        </div>

        <!-- USER OPTIONS -->
        <UserOptions
            ref="userOptionsRef"
            :key="`user_option_${step}`"
            v-if="
                cfgUserOptions.show &&
                isDataset &&
                (keepUserOptionState ? true : userOptionsVisible)
            "
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="false"
            :hasLabel="false"
            :isFullscreen="isFullscreen"
            :chartElement="bumpChart"
            v-bind="
                getUserOptionsProps(
                    cfgUserOptions,
                    'pdf csv img svg table fullscreen altCopy annotator',
                )
            "
            :isAnnotation="isAnnotator"
            :tableDialog="FINAL_CONFIG.table.useDialog"
            :isCursorPointer="isCursorPointer"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="onGenerateImage"
            @generateSvg="generateSvg"
            @toggleTable="toggleTable"
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
            <template
                v-for="slotName in getUserOptionSlots(
                    $slots,
                    'menuIcon optionPdf optionCsv optionImg optionSvg optionTable optionFullscreen optionAnnotator optionAltCopy custom-menu-before custom-menu-after',
                )"
                #[slotName]="slotProps"
            >
                <slot
                    :name="slotName"
                    v-bind="getUserOptionSlotProps(slotName, slotProps)"
                />
            </template>
        </UserOptions>

        <!-- CHART -->
        <div style="position: relative">
            <svg
                ref="svgRef"
                :xmlns="XMLNS"
                :aria-describedby="`chart-instructions-${uid}`"
                :viewBox="`0 0 ${drawingArea.chartWidth <= 0 ? 10 : drawingArea.chartWidth} ${drawingArea.svgHeight <= 0 ? 10 : drawingArea.svgHeight}`"
                :class="{
                    'vue-data-ui-loading': loading,
                    'no-transition': !FINAL_CONFIG.useCssAnimation,
                }"
                :style="`max-width:100%;overflow:visible;background:transparent;color:${cfgChart.color};visibility:${labelLayoutReady ? 'visible' : 'hidden'}`"
                role="img"
                aria-live="polite"
                preserveAspectRatio="xMidYMid"
                tabindex="0"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
            >
                <PackageVersion />
                <slot
                    name="svg-underlayer"
                    :svg="{
                        drawingArea,
                        data: formattedDataset,
                        isPrintingImg:
                            isPrinting || isImaging || isCallbackImaging,
                        isPrintingSvg: isCallbackSvg,
                    }"
                />

                <!-- BACKGROUND SLOT -->
                <foreignObject
                    v-if="$slots['chart-background']"
                    :x="drawingArea.left"
                    :y="drawingArea.top"
                    :width="drawingArea.width <= 0 ? 10 : drawingArea.width"
                    :height="drawingArea.height <= 0 ? 10 : drawingArea.height"
                    :style="{
                        pointerEvents: 'none',
                    }"
                >
                    <slot name="chart-background" />
                </foreignObject>

                <!-- LINES -->
                <template v-for="serie in plottedSeries">
                    <path
                        class="transition-opacity"
                        :d="`M${serie.path}`"
                        :stroke="cfgLayout.lines.coatingColor"
                        :stroke-width="cfgLayout.lines.strokeWidth + 2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        fill="none"
                        :style="{
                            opacity: seriesOpacity(serie),
                        }"
                        @mouseenter="selectedSeries = serie.id"
                        @mouseleave="selectedSeries = null"
                    />
                    <path
                        class="transition-opacity"
                        :d="`M${serie.path}`"
                        :stroke="serie.color"
                        :stroke-width="cfgLayout.lines.strokeWidth"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        fill="none"
                        :style="{
                            opacity: seriesOpacity(serie),
                        }"
                        @mouseenter="onPointEnter(serie, serie)"
                        @mouseleave="onPointLeave(serie, serie)"
                        @click="onPointClick(serie, serie)"
                    />
                </template>

                <!-- PLOTS -->
                <template v-for="serie in plottedSeries">
                    <!-- RANK LAYOUT -->
                    <template v-if="cfgPlots.labels.displayedValue === 'rank'">
                        <circle
                            class="transition-opacity"
                            v-for="point in validPoints(serie)"
                            :cx="point.x"
                            :cy="point.y"
                            :r="cfgPlots.radius"
                            :fill="serie.color"
                            :stroke="cfgPlots.stroke"
                            :stroke-width="cfgPlots.strokeWidth"
                            :style="{
                                opacity: seriesOpacity(serie),
                            }"
                            v-on="pointEvents(point, serie)"
                        />
                    </template>
                    <template
                        v-if="
                            cfgPlots.labels.show &&
                            cfgPlots.labels.displayedValue === 'rank'
                        "
                    >
                        <text
                            class="transition-opacity"
                            v-for="label in validPoints(serie)"
                            :x="label.x"
                            :y="label.y + cfgPlots.labels.fontSize / 3"
                            :fill="label.labelColor"
                            :font-size="cfgPlots.labels.fontSize"
                            text-anchor="middle"
                            :style="{
                                userSelect: 'none',
                                pointerEvents: 'none',
                                opacity: seriesOpacity(serie),
                            }"
                        >
                            {{ label.rank }}
                        </text>
                    </template>

                    <!-- VALUE LAYOUT -->
                    <template v-if="cfgPlots.labels.displayedValue === 'value'">
                        <template v-for="label in validPoints(serie)">
                            <rect
                                v-if="Number.isFinite(label.value)"
                                class="transition-opacity"
                                v-bind="getValueRect(label)"
                                :style="{
                                    opacity: seriesOpacity(serie),
                                }"
                                v-on="pointEvents(label, serie)"
                            />
                            <text
                                v-if="
                                    Number.isFinite(label.value) &&
                                    cfgPlots.labels.show
                                "
                                class="transition-opacity"
                                :x="label.x"
                                :y="label.y + cfgPlots.labels.fontSize / 3"
                                :fill="label.labelColor"
                                :font-size="cfgPlots.labels.fontSize"
                                text-anchor="middle"
                                :style="{
                                    userSelect: 'none',
                                    pointerEvents: 'none',
                                    opacity: seriesOpacity(serie),
                                }"
                            >
                                {{ label.displayValue }}
                            </text>
                        </template>
                    </template>
                </template>

                <!-- SERIES LABELS -->
                <template v-for="side in nameLabelSides" :key="side.key">
                    <g
                        v-if="cfgLayout.nameLabels[`${side.key}Labels`].show"
                        :ref="side.setRef"
                    >
                        <text
                            class="transition-opacity"
                            v-for="series in nameLabels[side.key]"
                            :key="series.id"
                            :x="drawingArea[side.key]"
                            :y="series.y + cfgLayout.nameLabels.fontSize / 3"
                            :fill="
                                cfgLayout.nameLabels.useSerieColor
                                    ? series.color
                                    : cfgLayout.nameLabels.color
                            "
                            :font-size="cfgLayout.nameLabels.fontSize"
                            :font-weight="
                                cfgLayout.nameLabels.bold ? 'bold' : 'normal'
                            "
                            :text-anchor="side.anchor"
                            v-html="
                                createTSpansFromLineBreaksOnX({
                                    content: series.name,
                                    fontSize: cfgLayout.nameLabels.fontSize,
                                    fill: cfgLayout.nameLabels.useSerieColor
                                        ? series.color
                                        : cfgLayout.nameLabels.color,
                                    x:
                                        drawingArea[side.key] +
                                        side.sign *
                                            cfgLayout.nameLabels.offsetX,
                                    y:
                                        series.y +
                                        cfgLayout.nameLabels.fontSize / 3,
                                    translateY: true,
                                })
                            "
                            :style="{ opacity: seriesOpacity(series) }"
                            @mouseenter="onPointEnter(series, series)"
                            @mouseleave="onPointLeave(series, series)"
                            @click="onPointClick(series, series)"
                        />
                    </g>
                </template>

                <!-- TIME LABELS -->
                <template v-if="cfgLayout.timeLabels.show">
                    <g ref="timeLabelsEls">
                        <g v-if="$slots['time-label']">
                            <g v-for="(timeLabel, i) in displayedTimeLabels">
                                <slot
                                    name="time-label"
                                    v-bind="{
                                        x:
                                            drawingArea.unitW * i +
                                            drawingArea.unitW / 2 +
                                            drawingArea.left,
                                        y:
                                            drawingArea.chartHeight +
                                            cfgLayout.timeLabels.offsetY,
                                        fontSize: cfgLayout.timeLabels.fontSize,
                                        fill: cfgLayout.timeLabels.color,
                                        transform: `translate(${drawingArea.unitW * i + drawingArea.unitW / 2 + drawingArea.left}, ${drawingArea.chartHeight + cfgLayout.timeLabels.offsetY}), rotate(${cfgLayout.timeLabels.rotation})`,
                                        absoluteIndex: timeLabel.absoluteIndex,
                                        content: timeLabel.text,
                                        textAnchor:
                                            cfgLayout.timeLabels.rotation > 0
                                                ? 'start'
                                                : cfgChart.layout.timeLabels
                                                        .rotation < 0
                                                  ? 'end'
                                                  : 'middle',
                                        show: true,
                                    }"
                                />
                            </g>
                        </g>

                        <g v-else>
                            <g v-for="(timeLabel, i) in displayedTimeLabels">
                                <text
                                    v-if="
                                        !String(timeLabel.text).includes('\n')
                                    "
                                    class="vue-data-ui-time-label"
                                    :key="i"
                                    data-cy="time-label"
                                    :text-anchor="
                                        cfgLayout.timeLabels.rotation > 0
                                            ? 'start'
                                            : cfgLayout.timeLabels.rotation < 0
                                              ? 'end'
                                              : 'middle'
                                    "
                                    :font-size="cfgLayout.timeLabels.fontSize"
                                    :font-weight="
                                        cfgLayout.timeLabels.bold
                                            ? 'bold'
                                            : 'normal'
                                    "
                                    :fill="cfgLayout.timeLabels.color"
                                    :stroke="cfgChart.backgroundColor"
                                    stroke-width="3"
                                    stroke-linejoin="round"
                                    stroke-linecap="round"
                                    paint-order="stroke fill"
                                    :transform="`translate(${drawingArea.unitW * i + drawingArea.unitW / 2 + drawingArea.left}, ${drawingArea.chartHeight + cfgLayout.timeLabels.offsetY}), rotate(${cfgLayout.timeLabels.rotation})`"
                                >
                                    {{ timeLabel.text }}
                                </text>

                                <text
                                    v-else
                                    :key="i + '-multi'"
                                    data-cy="time-label"
                                    :text-anchor="
                                        cfgLayout.timeLabels.rotation > 0
                                            ? 'start'
                                            : cfgLayout.timeLabels.rotation < 0
                                              ? 'end'
                                              : 'middle'
                                    "
                                    :font-size="cfgLayout.timeLabels.fontSize"
                                    :fill="cfgLayout.timeLabels.color"
                                    :transform="`
                                        translate(
                                        ${drawingArea.unitW * i + drawingArea.unitW / 2 + drawingArea.left},
                                        ${drawingArea.chartHeight + cfgLayout.timeLabels.fontSize * 1.3 + cfgLayout.timeLabels.offsetY}
                                        ),
                                        rotate(${cfgLayout.timeLabels.rotation})
                                    `"
                                    v-html="
                                        createTSpansFromLineBreaksOnX({
                                            content: String(timeLabel.text),
                                            fontSize:
                                                cfgLayout.timeLabels.fontSize,
                                            fill: cfgChart.layout.timeLabels
                                                .color,
                                            stroke: cfgChart.backgroundColor,
                                            x: 0,
                                            y: 0,
                                        })
                                    "
                                />
                            </g>
                        </g>
                    </g>
                </template>

                <slot
                    name="svg"
                    :svg="{
                        drawingArea,
                        data: formattedDataset,
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

        <!-- WATERMARK -->
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

        <!-- DATA TABLE -->
        <component
            v-if="isDataset && cfgUserOptions.buttons.table"
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
                    @click="generateCsv(cfgUserOptions.callbacks.csv)"
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
                        <div>{{ th }}</div>
                    </template>
                    <template #td="{ td }">
                        {{ td }}
                    </template>
                </DataTable>
            </template>
        </component>

        <!-- SOURCE -->
        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <slot name="skeleton">
            <BaseScanner v-if="loading" />
        </slot>
    </div>
</template>

<style scoped lang="scss">
@import '../vue-data-ui.css';

.vue-ui-bump * {
    transition: unset;
}

.vue-ui-bump {
    user-select: none;
    width: 100%;
}

.transition-opacity {
    transition: opacity 0.2s ease-in-out;
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
</style>
