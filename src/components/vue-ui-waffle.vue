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
    useSlots,
    watch,
} from 'vue';
import {
    stringifyChartConfig as stringifyStructuralConfig,
    abbreviate,
    adaptColorToBackground,
    applyDataLabel,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createUid,
    dataLabel,
    downloadCsv,
    error,
    getMissingDatasetAttributes,
    isFunction,
    palette,
    setOpacity,
    shiftHue,
    treeShake,
    XMLNS,
} from '../lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { useLoading } from '../useLoading';
import { usePrinter } from '../usePrinter';

import { useResponsive } from '../useResponsive';
import { useChartExport } from '../useChartExport';
import { useTransitions } from '../useTransitions.js';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import { usePrefersReducedMotion } from '../usePrefersMotion';
import { buildValuePercentageLabel as buildLabel } from '../labelUtils';
import Shape from '../atoms/Shape.vue';
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import themes from '../themes/vue_ui_waffle.json';
import Legend from '../atoms/Legend.vue'; // Must be ready in responsive mode
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import BaseLegendToggle from '../atoms/BaseLegendToggle.vue';
import DefGrad from '../atoms/DefGrad.vue';

const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
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

const { vue_ui_waffle: DEFAULT_CONFIG } = useConfig();
const prefersReducedMotion = usePrefersReducedMotion();

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

const slots = useSlots();

const isDataset = computed(() => !!props.dataset?.length);
const uid = ref(createUid());
const isTooltip = ref(false);
const tooltipContent = ref('');
const selectedId = ref(null);
const selectedSerie = computed(() =>
    waffleSet.value.findIndex((serie) => serie.uid === selectedId.value) < 0
        ? null
        : waffleSet.value.findIndex((serie) => serie.uid === selectedId.value),
);
const step = ref(0);
const waffleChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);
const readyTeleport = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);

const activeTooltipIndex = ref(null); // a11y
const tooltipA11yPosition = ref({ x: 0, y: 0 }); // a11y
const tooltipTriggerMode = ref('pointer'); // a11y
const isFocus = ref(false); // a11y

const FINAL_CONFIG = ref(prepareConfig());
const cfgUserOptions = computed(() => FINAL_CONFIG.value.userOptions);
const cfgTooltip = computed(() => FINAL_CONFIG.value.style.chart.tooltip);
const cfgLegend = computed(() => FINAL_CONFIG.value.style.chart.legend);
const cfgRect = computed(() => FINAL_CONFIG.value.style.chart.layout.rect);
const cfgGrid = computed(() => FINAL_CONFIG.value.style.chart.layout.grid);
const cfgLayout = computed(() => FINAL_CONFIG.value.style.chart.layout);
const cfgChart = computed(() => FINAL_CONFIG.value.style.chart);

const { transitionEnabled } = useTransitions({
    config: () => FINAL_CONFIG.value.transitions,
    dataset: () => props.dataset,
});

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiWaffle',
    rules: [
        COMMON_RULES.singleSeries,
        COMMON_RULES.emptyArray,
        {
            test: (ds) => ds.length > 6,
            message: [
                '👀 The number of series is > 6. Consider:',
                '',
                '▶️ Grouping small values dynamically into a single "Other" series.',
                '',
                '▶️ Using filters to let users choose a maximum number of series to display.',
                '',
                '▶️ Using VueUiHorizontalBar instead to make the dataset breakdown easier to read.',
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
            useCustomCells: false,
            userOptions: { show: false },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    layout: {
                        labels: {
                            captions: { show: false },
                        },
                        rect: {
                            stroke: '#999999',
                        },
                    },
                    legend: {
                        backgroundColor: 'transparent',
                        showValue: false,
                        showPercentage: false,
                    },
                },
            },
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {},
    });
});

// v3 - Skeleton loader management
const { loading, FINAL_DATASET } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: props.config?.skeletonDataset ?? [
        {
            name: '',
            values: [1],
            color: '#AAAAAA',
        },
        {
            name: '',
            values: [1],
            color: '#BABABA',
        },
        {
            name: '',
            values: [1],
            color: '#CACACA',
        },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value,
    }),
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } =
    useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({
    config: cfgChart.value.title,
});

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

        if (!loading.value) {
            FINAL_CONFIG.value = preparedConfig;
        }
        userOptionsVisible.value =
            !FINAL_CONFIG.value.userOptions.showOnChartHover;
        titleStep.value += 1;
        tableStep.value += 1;
        legendStep.value += 1;

        // Reset mutable config
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        mutableConfig.value.showTooltip = cfgTooltip.value.show;
    },
    { deep: true },
);

const resizeObserver = shallowRef(null);
let resizeFrame = null;
let scheduleResize = null;
let disposed = false;
const debug = computed(() => FINAL_CONFIG.value.debug);
function stopResize() {
    scheduleResize = null;
    resizeObserver.value?.disconnect();
    resizeObserver.value = null;
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = null;
}
function prepareChart() {
    stopResize();
    if (!FINAL_CONFIG.value.responsive) {
        svg.value = { width: 512, height: 512 };
        return;
    }
    const parent = waffleChart.value?.parentNode;
    if (!parent) return;
    const resize = () => {
        if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
            resizeFrame = null;
            if (disposed) return;
            const { width, height } = useResponsive({
                chart: waffleChart.value,
                title: cfgChart.value.title.text ? chartTitle.value : null,
                legend: cfgLegend.value.show ? chartLegend.value : null,
                source: source.value,
                noTitle: noTitle.value,
            });
            svg.value = { width, height };
        });
    };
    scheduleResize = resize;
    resizeObserver.value = new ResizeObserver(resize);
    resizeObserver.value.observe(parent);
    resize();
}
onMounted(() => {
    readyTeleport.value = true;
    prepareChart();
});
onBeforeUnmount(() => {
    disposed = true;
    stopResize();
    cancelAnimations();
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-waffle_${uid.value}`,
    fileName: cfgChart.value.title.text || 'vue-ui-waffle',
    options: FINAL_CONFIG.value.userOptions.print,
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !cfgChart.value.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: cfgTooltip.value.show,
});

// v3 - Essential to make shifting between loading config and final config work
watch(
    FINAL_CONFIG,
    () => {
        mutableConfig.value = {
            showTable: FINAL_CONFIG.value.table.show,
            showTooltip: cfgTooltip.value.show,
        };
    },
    { immediate: true },
);

const svg = ref({
    height: 512,
    width: 512,
});

const drawingArea = computed(() => ({ top: 0, left: 0, ...svg.value }));
const gridSize = computed(() => {
    const size = Number(cfgGrid.value.size);
    return Number.isInteger(size) && size > 0 ? size : 10;
});

const rectDimension = computed(() => {
    return (
        (drawingArea.value.width -
            gridSize.value * cfgGrid.value.spaceBetween) /
        gridSize.value
    );
});

const rectDimensionY = computed(() => {
    return (
        (drawingArea.value.height -
            gridSize.value * cfgGrid.value.spaceBetween) /
        gridSize.value
    );
});

const absoluteRectDimension = computed(() => {
    return Math.max(0.0001, drawingArea.value.width / gridSize.value);
});

const absoluteRectDimensionY = computed(() => {
    return Math.max(0.0001, drawingArea.value.height / gridSize.value);
});

function sumValues(values) {
    return (values || []).reduce(
        (sum, value) =>
            sum +
            (typeof value === 'number' && Number.isFinite(value) ? value : 0),
        0,
    );
}
function calculateSquareCounts(numbers) {
    if (!numbers.length) return [];
    const weights = numbers.map((value) => Math.max(0, value));
    const sum = weights.reduce((a, b) => a + b, 0);
    // Distribute an all-zero visible set evenly, using the same remainder rule.
    const exact = weights.map(
        (value) =>
            (sum ? value / sum : 1 / weights.length) * totalGridSquares.value,
    );
    const counts = exact.map(Math.floor);
    const order = exact
        .map((value, index) => ({ index, remainder: value - counts[index] }))
        .sort((a, b) => b.remainder - a.remainder);
    const remaining =
        totalGridSquares.value - counts.reduce((a, b) => a + b, 0);
    for (let i = 0; i < remaining; i++) counts[order[i % order.length].index]++;
    return counts;
}
const datasetCopyReference = computed(() =>
    FINAL_DATASET.value.map((serie, i) => {
        if (debug.value)
            getMissingDatasetAttributes({
                datasetObject: serie,
                requiredAttributes: ['name', 'values'],
            }).forEach((property) =>
                error({
                    componentName: 'VueUiWaffle',
                    type: 'datasetSerieAttribute',
                    property,
                    index: i,
                }),
            );
        return {
            ...serie,
            color:
                convertColorToHex(serie.color) ||
                customPalette.value[i] ||
                palette[i % palette.length],
            uid: `serie_${i}`,
            absoluteIndex: i,
        };
    }),
);
const animationValues = ref({});
const datasetCopy = computed(() =>
    datasetCopyReference.value.map((serie) =>
        animationValues.value[serie.uid] === undefined
            ? serie
            : { ...serie, values: [animationValues.value[serie.uid]] },
    ),
);
const sourceTotals = computed(
    () =>
        new Map(
            datasetCopyReference.value.map((serie) => [
                serie.uid,
                sumValues(serie.values),
            ]),
        ),
);
const currentTotals = computed(
    () =>
        new Map(
            datasetCopy.value.map((serie) => [
                serie.uid,
                sumValues(serie.values),
            ]),
        ),
);
const currentTotal = computed(() =>
    [...currentTotals.value.values()].reduce((a, b) => a + b, 0),
);
const allDatapointsAreEmpty = computed(() =>
    [...sourceTotals.value.values()].every((value) => value === 0),
);
const visibleSeries = computed(() =>
    datasetCopy.value.filter((serie) => !segregated.value.includes(serie.uid)),
);
const squareCounts = computed(() =>
    calculateSquareCounts(
        visibleSeries.value.map((serie) => currentTotals.value.get(serie.uid)),
    ),
);
const immutableSquareCounts = computed(() =>
    calculateSquareCounts(
        datasetCopy.value.map((serie) => currentTotals.value.get(serie.uid)),
    ),
);

const totalGridSquares = computed(() => Math.pow(gridSize.value, 2));

const waffleSet = computed(() => {
    if (debug.value) {
        FINAL_DATASET.value.forEach((ds, i) => {
            if ([null, undefined].includes(ds.values)) {
                error({
                    componentName: 'VueUiWaffle',
                    type: 'datasetSerieAttribute',
                    property: 'values (number[])',
                    index: i,
                });
            }
        });
    }
    return visibleSeries.value.map((serie, i) => {
        const squareCount = squareCounts.value[i];

        return {
            absoluteIndex: serie.absoluteIndex,
            uid: serie.uid,
            name: serie.name,
            color: serie.color,
            value: currentTotals.value.get(serie.uid),
            absoluteValues: serie.values || [],
            squareCount,
            proportion: squareCount / totalGridSquares.value,
        };
    });
});

const immutableSet = computed(() => {
    return datasetCopy.value.map((serie, i) => {
        const squareCount = immutableSquareCounts.value[i];

        return {
            absoluteIndex: serie.absoluteIndex,
            uid: serie.uid,
            name: serie.name,
            color: serie.color,
            value: currentTotals.value.get(serie.uid),
            absoluteValues: serie.values || [],
            squareCount,
            proportion: squareCount / totalGridSquares.value,
        };
    });
});

/**
 * Return series values with their computed square counts and proportions.
 */
function getData() {
    return immutableSet.value.map((ds) => {
        return {
            name: ds.name,
            color: ds.color,
            value: ds.value,
            squareCount: ds.squareCount,
            proportion: ds.proportion,
        };
    });
}

const cumulatedSet = computed(() => {
    let cumulativeSquareCount = 0;

    return waffleSet.value.map((serie, i) => {
        const start = cumulativeSquareCount;
        const end = start + serie.squareCount;

        const rects = [];
        for (let j = Math.floor(start); j < Math.floor(end); j += 1) {
            rects.push(j);
        }

        cumulativeSquareCount = end;

        return {
            ...serie,
            start,
            rects,
        };
    });
});

const rects = computed(() => {
    return cumulatedSet.value
        .flatMap((serie, s) => {
            return serie.rects.map((rect, i) => {
                return {
                    isFirst: i === 0,
                    isLongEnough: false,
                    name: serie.name,
                    color: serie.color,
                    value: serie.value,
                    serieIndex: s,
                    absoluteStartIndex: i < 3,
                    serieId: serie.uid,
                    ...serie,
                };
            });
        })
        .map((s, i) => {
            return {
                ...s,
                isAbsoluteFirst: i % gridSize.value === 0,
            };
        });
});

const positions = computed(() => {
    const grid = [];
    for (let i = 0; i < gridSize.value; i += 1) {
        for (let j = 0; j < gridSize.value; j += 1) {
            grid.push({
                isStartOfLine: j === 0,
                position: cfgGrid.value.vertical ? i : j,
                x:
                    (cfgGrid.value.vertical ? i : j) *
                    (rectDimension.value + cfgGrid.value.spaceBetween),
                y:
                    (cfgGrid.value.vertical ? j : i) *
                        (rectDimensionY.value + cfgGrid.value.spaceBetween) +
                    drawingArea.value.top,
            });
        }
    }
    return grid;
});

const cellPositions = computed(() =>
    positions.value.slice(0, rects.value.length),
);
function getCellAttrs(position, trap = false) {
    return {
        x: position.x + cfgGrid.value.spaceBetween / 2,
        y: position.y + cfgGrid.value.spaceBetween / 2,
        width: trap
            ? absoluteRectDimension.value
            : rectDimension.value <= 0
              ? 0.0001
              : rectDimension.value,
        height: trap
            ? absoluteRectDimensionY.value
            : rectDimensionY.value <= 0
              ? 0.0001
              : rectDimensionY.value,
    };
}
function getCellSlotProps(position, index) {
    const rect = rects.value[index];
    return {
        cell: {
            ...position,
            color: rect.color,
            height: Math.max(0, rectDimensionY.value),
            width: Math.max(0, rectDimension.value),
            ...rect,
        },
        isSelected:
            selectedSerie.value === null ||
            rect.serieIndex === selectedSerie.value,
    };
}

const segregated = ref([]);
const isAnimating = ref(false);

const animations = new Map();
function cancelAnimationBySeriesId(seriesId) {
    const animation = animations.get(seriesId);
    if (animation) cancelAnimationFrame(animation.frame);
    animations.delete(seriesId);
    isAnimating.value = animations.size > 0;
}
function cancelAnimations() {
    for (const id of animations.keys()) cancelAnimationBySeriesId(id);
    animationValues.value = {};
}
function emitLegendSelection() {
    emit(
        'selectLegend',
        waffleSet.value.map(({ name, color, value, proportion }) => ({
            name,
            color,
            value,
            proportion,
        })),
    );
}
function toggleLegend() {
    const restore =
        segregated.value.length > 0 ||
        [...animations.values()].some((animation) => !animation.show);
    cancelAnimations();
    if (
        !FINAL_CONFIG.value.useAnimation ||
        prefersReducedMotion.value ||
        allDatapointsAreEmpty.value
    ) {
        segregated.value = restore
            ? []
            : datasetCopyReference.value.map((serie) => serie.uid);
        emitLegendSelection();
        return;
    }
    for (const serie of datasetCopyReference.value) {
        if (restore === segregated.value.includes(serie.uid))
            segregate(serie.uid, true);
    }
}
function segregate(seriesId, allowHideAll = false) {
    if (
        !sourceTotals.value.has(seriesId) ||
        (allDatapointsAreEmpty.value && !allowHideAll)
    )
        return;
    const pending = animations.get(seriesId);
    const show = pending ? !pending.show : segregated.value.includes(seriesId);
    const visibleCount = datasetCopyReference.value.filter(
        (serie) =>
            !segregated.value.includes(serie.uid) &&
            animations.get(serie.uid)?.show !== false,
    ).length;
    if (!show && !allowHideAll && visibleCount <= 1) return;
    const target = sourceTotals.value.get(seriesId);
    const from =
        animationValues.value[seriesId] ??
        (segregated.value.includes(seriesId) ? 0 : target);
    cancelAnimationBySeriesId(seriesId);
    if (show)
        segregated.value = segregated.value.filter((id) => id !== seriesId);
    const finish = () => {
        if (!show && !segregated.value.includes(seriesId))
            segregated.value.push(seriesId);
        if (FINAL_CONFIG.value.useAnimation) {
            animationValues.value = {
                ...animationValues.value,
                [seriesId]: show ? target : 0,
            };
        }
        animations.delete(seriesId);
        isAnimating.value = animations.size > 0;
        emitLegendSelection();
    };
    if (
        !FINAL_CONFIG.value.useAnimation ||
        prefersReducedMotion.value ||
        target <= 0
    ) {
        finish();
        return;
    }
    const animation = { show, frame: null, value: from };
    animations.set(seriesId, animation);
    isAnimating.value = true;
    function step() {
        if (disposed || animations.get(seriesId) !== animation) return;
        if (show)
            animation.value = Math.min(
                target,
                animation.value + target * 0.025,
            );
        else animation.value /= 1.15;
        if (
            (show && animation.value >= target) ||
            (!show && animation.value <= Math.abs(from) / 100)
        ) {
            finish();
            return;
        }
        animationValues.value = {
            ...animationValues.value,
            [seriesId]: animation.value,
        };
        animation.frame = requestAnimationFrame(step);
    }
    animationValues.value = { ...animationValues.value, [seriesId]: from };
    step();
}

function validSeriesToToggle(name) {
    if (!immutableSet.value.length) {
        if (debug.value) {
            console.warn('VueUiWaffle - There are no series to show.');
        }
        return null;
    }
    const dp = immutableSet.value.find((d) => d.name === name);
    if (!dp) {
        if (debug.value) {
            console.warn(`VueUiWaffle - Series name not found "${name}"`);
        }
        return null;
    }
    return dp;
}

/**
 * Show the named series only if its visibility needs to change.
 * Unknown names leave visibility unchanged.
 *
 * @param {string} name - Series name matched by the component.
 * @returns {void}
 */
function showSeries(name) {
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (
        segregated.value.includes(dp.uid) ||
        animations.get(dp.uid)?.show === false
    ) {
        segregate(dp.uid);
    }
}

/**
 * Hide the named series only if its visibility needs to change.
 * Unknown names leave visibility unchanged.
 *
 * @param {string} name - Series name matched by the component.
 * @returns {void}
 */
function hideSeries(name) {
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (
        !segregated.value.includes(dp.uid) &&
        animations.get(dp.uid)?.show !== false
    ) {
        segregate(dp.uid);
    }
}

const legendSet = computed(() => {
    return datasetCopy.value
        .map((serie, i) => {
            const value = currentTotals.value.get(serie.uid);
            const proportion = currentTotal.value
                ? value / currentTotal.value
                : 0;
            return {
                name: serie.name,
                color:
                    serie.color ||
                    customPalette.value[i] ||
                    palette[i] ||
                    palette[i % palette.length],
                value,
                proportion,
                uid: serie.uid,
                shape: 'square',
            };
        })
        .map((el, i) => {
            const valueDisplay = applyDataLabel(
                cfgLayout.value.labels.dataLabels.formatter,
                el.value,
                dataLabel({
                    p: cfgLayout.value.labels.dataLabels.prefix,
                    v: el.value,
                    s: cfgLayout.value.labels.dataLabels.suffix,
                    r: cfgLegend.value.roundingValue,
                }),
                { datapoint: el, index: i },
            );

            const percentageDisplay = isNaN(el.value / total.value)
                ? '-'
                : dataLabel({
                      v: (el.value / total.value) * 100,
                      s: '%',
                      r: cfgLegend.value.roundingPercentage,
                  });

            const display = buildLabel({
                val: valueDisplay,
                percentage: percentageDisplay,
                showVal: cfgLegend.value.showValue,
                showPercentage: cfgLegend.value.showPercentage,
                config: cfgLegend.value,
            });

            return {
                ...el,
                opacity: segregated.value.includes(el.uid) ? 0.5 : 1,
                segregate: () => segregate(el.uid),
                isSegregated: segregated.value.includes(el.uid),
                display: `${el.name}${cfgLegend.value.showPercentage || cfgLegend.value.showValue ? ': ' : ''}${display}`,
            };
        });
});

const legendConfig = computed(() => {
    return {
        cy: 'waffle-div-legend',
        backgroundColor: cfgLegend.value.backgroundColor,
        color: cfgLegend.value.color,
        fontSize: cfgLegend.value.fontSize,
        paddingBottom: 12,
        fontWeight: cfgLegend.value.bold ? 'bold' : '',
    };
});

const total = computed(() => {
    return waffleSet.value.map((s) => s.value).reduce((a, b) => a + b, 0);
});

const dataTooltipSlot = ref(null);

const navigableSeries = computed(() => {
    const grouped = new Map();

    rects.value.forEach((rect, rectIndex) => {
        if (!grouped.has(rect.serieIndex)) {
            grouped.set(rect.serieIndex, {
                serieIndex: rect.serieIndex,
                absoluteIndex: rect.absoluteIndex,
                serieId: rect.serieId,
                name: rect.name,
                color: rect.color,
                value: rect.value,
                proportion: rect.proportion,
                rectIndexes: [rectIndex],
            });
        } else {
            grouped.get(rect.serieIndex).rectIndexes.push(rectIndex);
        }
    });

    return Array.from(grouped.values()).sort(
        (a, b) => a.serieIndex - b.serieIndex,
    );
});

function getSeriesNavigationEntry(seriesIndex) {
    return (
        navigableSeries.value.find(
            (series) => series.serieIndex === seriesIndex,
        ) || null
    );
}

function getRepresentativeRectIndexForSeries(seriesIndex) {
    const entry = getSeriesNavigationEntry(seriesIndex);
    if (!entry || !entry.rectIndexes.length) return null;
    return entry.rectIndexes[0];
}

function selectDatapoint(index) {
    const selected = rects.value[index];
    if (!selected) return;
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint: selected,
            seriesIndex: selected.serieIndex,
        });
    }
}

function onTrapLeave(index) {
    const selected = rects.value[index];
    if (!selected) return;

    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({
            datapoint: selected,
            seriesIndex: selected.serieIndex,
        });
    }

    clearSelection();
}

function useTooltip(index, triggerMode = 'pointer', notify = true) {
    if (!rects.value.length) return;

    const selected = rects.value[index];
    if (!selected) return;

    tooltipTriggerMode.value = triggerMode;
    activeTooltipIndex.value = selected.serieIndex;

    dataTooltipSlot.value = {
        datapoint: selected,
        seriesIndex: selected.absoluteIndex,
        series: datasetCopy.value,
        config: FINAL_CONFIG.value,
    };

    if (
        notify &&
        FINAL_CONFIG.value.events.datapointEnter &&
        selectedSerie.value !== selected.serieIndex
    ) {
        FINAL_CONFIG.value.events.datapointEnter({
            datapoint: selected,
            seriesIndex: selected.serieIndex,
        });
    }

    selectedId.value = selected.serieId;
    isTooltip.value = true;

    const customFormat = cfgTooltip.value.customFormat;

    const customContent = isFunction(customFormat)
        ? customFormat({
              seriesIndex: selected.absoluteIndex,
              datapoint: selected,
              series: datasetCopy.value,
              config: FINAL_CONFIG.value,
          })
        : null;
    if (typeof customContent === 'string') {
        tooltipContent.value = customContent;
    } else {
        let html = '';

        html += `<div data-cy="waffle-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid ${cfgTooltip.value.borderColor};padding-bottom:6px;margin-bottom:3px;">${selected.name}</div>`;
        html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 60 60" height="14" width="14"><rect data-cy="waffle-tooltip-marker" x="0" y="0" height="60" width="60" stroke="none" rx="1" fill="${selected.color}" />${slots.pattern ? `<rect x="0" y="0" height="60" width="60" stroke="none" rx="1" stroke="none" fill="url(#pattern_${uid.value}_${selected.absoluteIndex})"/>` : ''}</svg>`;

        html += `<b>${buildLabel({
            config: cfgTooltip.value,
            showVal: cfgTooltip.value.showValue,
            showPercentage: cfgTooltip.value.showPercentage,
            val: `<span data-cy="waffle-tooltip-value">${applyDataLabel(
                cfgLayout.value.labels.dataLabels.formatter,
                selected.value,
                dataLabel({
                    p: cfgLayout.value.labels.dataLabels.prefix,
                    v: selected.value,
                    s: cfgLayout.value.labels.dataLabels.suffix,
                    r: cfgTooltip.value.roundingValue,
                }),
                {
                    datapoint: selected,
                    seriesIndex: selected.absoluteIndex,
                    series: datasetCopy.value,
                },
            )}</span>`,
            percentage: `<span data-cy="waffle-tooltip-percentage">${dataLabel({
                v: total.value
                    ? (selected.value / total.value) * 100
                    : selected.proportion * 100,
                s: '%',
                r: cfgTooltip.value.roundingPercentage,
            })}</span>`,
        })}</b></div>`;

        tooltipContent.value = html;
    }
}
const emit = defineEmits(['selectLegend', 'copyAlt']);

const table = computed(() => {
    const head = waffleSet.value.map((ds) => {
        return {
            name: ds.name,
            color: ds.color,
        };
    });
    const body = waffleSet.value.map((ds) => ds.value);
    return { head, body };
});

function getBlurFilter(index) {
    if (
        FINAL_CONFIG.value.useBlurOnHover &&
        ![null, undefined].includes(selectedSerie.value) &&
        selectedSerie.value !== index
    ) {
        return `url(#blur_${uid.value})`;
    } else {
        return '';
    }
}

function getRectStyle(index) {
    if ([null, undefined].includes(selectedSerie.value)) {
        return { opacity: 1 };
    } else if (selectedSerie.value === index) {
        return { opacity: 1 };
    } else {
        return {
            opacity: cfgRect.value.selection.unselectedOpacity,
        };
    }
}

function simplifyPolygon(points) {
    if (points.length <= 3) return points;
    return points.filter((point, index) => {
        const previous = points[(index - 1 + points.length) % points.length];
        const next = points[(index + 1) % points.length];
        const isVertical = previous.x === point.x && point.x === next.x;
        const isHorizontal = previous.y === point.y && point.y === next.y;
        return !isVertical && !isHorizontal;
    });
}

function getBoundaryPolygons(cells) {
    if (!cells.length) return [];

    const cellKeys = new Set(cells.map(({ row, col }) => `${row}:${col}`));
    const components = [];
    const visited = new Set();
    const neighbors = [
        [-1, 0],
        [0, 1],
        [1, 0],
        [0, -1],
    ];

    cells.forEach((cell) => {
        const startKey = `${cell.row}:${cell.col}`;
        if (visited.has(startKey)) return;

        const component = [];
        const queue = [cell];
        visited.add(startKey);

        for (let cursor = 0; cursor < queue.length; cursor++) {
            const current = queue[cursor];
            component.push(current);
            neighbors.forEach(([rowOffset, colOffset]) => {
                const row = current.row + rowOffset;
                const col = current.col + colOffset;
                const key = `${row}:${col}`;
                if (!cellKeys.has(key) || visited.has(key)) return;
                visited.add(key);
                queue.push({ row, col });
            });
        }
        components.push(component);
    });

    const polygons = [];

    components.forEach((component) => {
        const occupied = new Set(
            component.map(({ row, col }) => `${row}:${col}`),
        );
        const edges = [];

        component.forEach(({ row, col }) => {
            if (!occupied.has(`${row - 1}:${col}`)) {
                edges.push({
                    start: { x: col, y: row },
                    end: { x: col + 1, y: row },
                });
            }
            if (!occupied.has(`${row}:${col + 1}`)) {
                edges.push({
                    start: { x: col + 1, y: row },
                    end: { x: col + 1, y: row + 1 },
                });
            }
            if (!occupied.has(`${row + 1}:${col}`)) {
                edges.push({
                    start: { x: col + 1, y: row + 1 },
                    end: { x: col, y: row + 1 },
                });
            }
            if (!occupied.has(`${row}:${col - 1}`)) {
                edges.push({
                    start: { x: col, y: row + 1 },
                    end: { x: col, y: row },
                });
            }
        });

        const outgoing = new Map();
        const edgeKey = (edge) =>
            `${edge.start.x}:${edge.start.y}>${edge.end.x}:${edge.end.y}`;
        const pointKey = (point) => `${point.x}:${point.y}`;
        const unused = new Set(edges.map(edgeKey));

        edges.forEach((edge) => {
            const key = pointKey(edge.start);
            if (!outgoing.has(key)) outgoing.set(key, []);
            outgoing.get(key).push(edge);
        });

        while (unused.size) {
            const firstKey = unused.values().next().value;
            const firstEdge = edges.find((edge) => edgeKey(edge) === firstKey);
            const start = firstEdge.start;
            const polygon = [start];
            let currentEdge = firstEdge;
            while (currentEdge) {
                unused.delete(edgeKey(currentEdge));
                const current = currentEdge.end;
                if (pointKey(current) === pointKey(start)) {
                    break;
                }
                polygon.push(current);
                currentEdge = (outgoing.get(pointKey(current)) || []).find(
                    (edge) => unused.has(edgeKey(edge)),
                );
            }
            if (polygon.length >= 4) {
                polygons.push(simplifyPolygon(polygon));
            }
        }
    });

    return polygons;
}

const serieBoundaryPolygons = computed(
    () =>
        new Map(
            navigableSeries.value.map((serie) => {
                const cells = serie.rectIndexes.map((index) => {
                    const primary = Math.floor(index / gridSize.value),
                        secondary = index % gridSize.value;
                    return {
                        row: cfgGrid.value.vertical ? secondary : primary,
                        col: cfgGrid.value.vertical ? primary : secondary,
                    };
                });
                const polygons = getBoundaryPolygons(cells).map((polygon) =>
                    polygon.map(({ x, y }) => ({
                        x: x * absoluteRectDimension.value,
                        y:
                            drawingArea.value.top +
                            y * absoluteRectDimensionY.value,
                    })),
                );
                return [serie.serieIndex, polygons];
            }),
        ),
);
function getSerieBoundaryPolygons(serieIndex) {
    return serieBoundaryPolygons.value.get(serieIndex) || [];
}

function polygonToPoints(polygon) {
    return polygon.map(({ x, y }) => `${x},${y}`).join(' ');
}

function polygonsToPath(polygons) {
    return polygons
        .map((polygon) => {
            if (!polygon.length) return '';
            const [first, ...rest] = polygon;
            const segments = rest.map(({ x, y }) => `L ${x} ${y}`).join(' ');
            return `M ${first.x} ${first.y} ${segments} Z`;
        })
        .filter(Boolean)
        .join(' ');
}

const selectionWrapPolygons = computed(() => {
    const selection = cfgRect.value.selection;
    if (
        !selection?.wrap?.show ||
        [null, undefined].includes(selectedSerie.value)
    ) {
        return [];
    }
    return getSerieBoundaryPolygons(selectedSerie.value).map(polygonToPoints);
});

const mergedSeriePaths = computed(() => {
    if (!cfgRect.value.merged) {
        return [];
    }
    return navigableSeries.value
        .map((serie) => ({
            serieIndex: serie.serieIndex,
            absoluteIndex: serie.absoluteIndex,
            color: serie.color,
            gradientIndex: serie.rectIndexes[0],
            rectIndex: serie.rectIndexes[0],
            d: polygonsToPath(getSerieBoundaryPolygons(serie.serieIndex)),
        }))
        .filter((serie) => serie.d);
});

function showDataLabel(i, position) {
    if (!cfgLayout.value.labels.captions.show) {
        return false;
    }
    return (
        rects.value.length &&
        !isAnimating.value &&
        !cfgGrid.value.vertical &&
        ((rects.value[i].isFirst && position.position < gridSize.value - 2) ||
            (rects.value[i].isAbsoluteFirst &&
                i % gridSize.value === 0 &&
                rects.value[i].absoluteStartIndex))
    );
}

function getCaption(i, position = null) {
    const valueLabel = applyDataLabel(
        cfgLayout.value.labels.dataLabels.formatter,
        rects.value[i].value,
        dataLabel({
            p: cfgLayout.value.labels.dataLabels.prefix,
            v: rects.value[i].value,
            s: cfgLayout.value.labels.dataLabels.suffix,
            r: cfgLayout.value.labels.captions.roundingValue,
        }),
        { datapoint: rects.value[i], position },
    );
    const percentageLabel = dataLabel({
        v: rects.value[i].proportion * 100,
        s: '%',
        r: cfgLayout.value.labels.captions.roundingPercentage,
    });
    const nameLabel =
        (cfgLayout.value.labels.captions.serieNameAbbreviation
            ? abbreviate({
                  source: rects.value[i].name,
                  length: cfgLayout.value.labels.captions
                      .serieNameMaxAbbreviationSize,
              })
            : rects.value[i].name) +
        (cfgLayout.value.labels.captions.showPercentage ||
        cfgLayout.value.labels.captions.showValue
            ? ':'
            : '');

    const name = cfgLayout.value.labels.captions.showSerieName ? nameLabel : '';

    const display = buildLabel({
        val: valueLabel,
        percentage: percentageLabel,
        showVal: cfgLayout.value.labels.captions.showValue,
        showPercentage: cfgLayout.value.labels.captions.showPercentage,
        config: cfgLayout.value.labels.dataLabels,
    });

    return `${name} ${display}`;
}

function generateCsv(callback = null) {
    nextTick(() => {
        const labels = table.value.head.map((h, i) => {
            return [
                [h.name],
                [table.value.body[i]],
                [
                    isNaN(table.value.body[i] / total.value)
                        ? '-'
                        : (table.value.body[i] / total.value) * 100,
                ],
            ];
        });
        const tableXls = [
            [cfgChart.value.title.text],
            [cfgChart.value.title.subtitle.text],
            [[''], ['val'], ['%']],
        ].concat(labels);

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({
                csvContent,
                title: cfgChart.value.title.text || 'vue-ui-waffle',
            });
        } else {
            callback(csvContent);
        }
    });
}

const dataTable = computed(() => {
    const head = [
        `__SUM__`,
        applyDataLabel(
            cfgLayout.value.labels.dataLabels.formatter,
            total.value,
            dataLabel({
                p: cfgLayout.value.labels.dataLabels.prefix,
                v: total.value,
                s: cfgLayout.value.labels.dataLabels.suffix,
                r: FINAL_CONFIG.value.table.td.roundingValue,
            }),
        ),
        '100%',
    ];

    const body = table.value.head.map((h, i) => {
        return [
            {
                color: h.color,
                name: h.name,
            },
            applyDataLabel(
                cfgLayout.value.labels.dataLabels.formatter,
                table.value.body[i],
                dataLabel({
                    p: cfgLayout.value.labels.dataLabels.prefix,
                    v: table.value.body[i],
                    s: cfgLayout.value.labels.dataLabels.suffix,
                    r: FINAL_CONFIG.value.table.td.roundingValue,
                }),
            ),
            isNaN(table.value.body[i] / total.value)
                ? '-'
                : dataLabel({
                      v: (table.value.body[i] / total.value) * 100,
                      s: '%',
                      r: FINAL_CONFIG.value.table.td.roundingPercentage,
                  }),
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
        shape: 'square',
        breakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint,
    };

    const colNames = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
        FINAL_CONFIG.value.table.columnNames.percentage,
    ];

    return {
        head,
        body,
        config,
        colNames,
    };
});

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

const getImage = createChartImageGetter(
    waffleChart,
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
        parent: waffleChart,
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

const svgLegendItems = computed(() => {
    return legendSet.value.map((l) => ({
        ...l,
        name: l.display,
    }));
});

const svgBg = computed(() => cfgChart.value.backgroundColor);
const svgTitle = computed(() => cfgChart.value.title);

const { isCallbackImaging, isCallbackSvg, generateSvg, onGenerateImage } =
    useChartExport({
        svg: svgRef,
        title: svgTitle,
        legend: cfgLegend,
        legendItems: svgLegendItems,
        backgroundColor: svgBg,
        getSvgCallback: () => FINAL_CONFIG.value.userOptions.callbacks.svg,
        generateImage,
    });

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: immutableSet.value,
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
            dataset: immutableSet.value,
        }),
    );
}

/***************************************************************************************************
 * a11y
 **************************************************************************************************/
function onSvgFocus() {
    activeTooltipIndex.value = null;
    isFocus.value = true;
}

function clearSelection() {
    selectedId.value = null;
    activeTooltipIndex.value = null;
    tooltipTriggerMode.value = 'pointer';
    isTooltip.value = false;
}
function onSvgBlur() {
    clearSelection();
    isFocus.value = false;
}

function onSvgKeydown(event) {
    if (!svgRef.value || isAnnotator.value) return;
    if (document.activeElement !== svgRef.value) return;
    if (!navigableSeries.value.length) return;
    if (!rects.value.length) return;

    const isPreviousKey = ['ArrowLeft', 'ArrowUp'].includes(event.key);
    const isNextKey = ['ArrowRight', 'ArrowDown'].includes(event.key);
    const isActivationKey = event.key === 'Enter' || event.key === ' ';
    const isEscapeKey = event.key === 'Escape';

    if (!isPreviousKey && !isNextKey && !isActivationKey && !isEscapeKey)
        return;

    event.preventDefault();
    event.stopPropagation();

    if (isEscapeKey) {
        clearSelection();
        return;
    }

    if (isActivationKey) {
        if (activeTooltipIndex.value === null) return;

        const rectIndex = getRepresentativeRectIndexForSeries(
            activeTooltipIndex.value,
        );
        if (rectIndex === null) return;

        selectDatapoint(rectIndex);
        return;
    }

    const currentNavigationIndex = navigableSeries.value.findIndex(
        (series) => series.serieIndex === activeTooltipIndex.value,
    );

    let nextSeries = null;

    if (currentNavigationIndex === -1) {
        nextSeries = isNextKey
            ? navigableSeries.value[0]
            : navigableSeries.value[navigableSeries.value.length - 1];
    } else if (isNextKey) {
        nextSeries =
            navigableSeries.value[
                (currentNavigationIndex + 1) % navigableSeries.value.length
            ];
    } else {
        nextSeries =
            navigableSeries.value[
                (currentNavigationIndex - 1 + navigableSeries.value.length) %
                    navigableSeries.value.length
            ];
    }

    if (!nextSeries) return;

    const rectIndex = getRepresentativeRectIndexForSeries(
        nextSeries.serieIndex,
    );
    if (rectIndex === null) return;

    setKeyboardTooltipPositionFromSeriesIndex(nextSeries.serieIndex);
    useTooltip(rectIndex, 'keyboard');
}

function setKeyboardTooltipPositionFromSeriesIndex(seriesIndex) {
    if (!Number.isFinite(seriesIndex)) return;
    if (!svgRef.value) return;

    const entry = getSeriesNavigationEntry(seriesIndex);
    if (!entry || !entry.rectIndexes.length) return;

    const centers = entry.rectIndexes
        .map((rectIndex) => {
            const position = positions.value[rectIndex];
            if (!position) return null;

            return {
                x:
                    position.x +
                    cfgGrid.value.spaceBetween / 2 +
                    absoluteRectDimension.value / 2,
                y:
                    position.y +
                    cfgGrid.value.spaceBetween / 2 +
                    absoluteRectDimensionY.value / 2,
            };
        })
        .filter(Boolean);

    if (!centers.length) return;

    const minX = Math.min(...centers.map((point) => point.x));
    const maxX = Math.max(...centers.map((point) => point.x));
    const minY = Math.min(...centers.map((point) => point.y));
    const maxY = Math.max(...centers.map((point) => point.y));

    const svgX = (minX + maxX) / 2;
    const svgY = (minY + maxY) / 2;

    const box = svgRef.value.getBoundingClientRect();

    tooltipA11yPosition.value = {
        x: box.left + (svgX / svg.value.width) * box.width,
        y: box.top + (svgY / svg.value.height) * box.height,
    };
}

const a11yTable = computed(() => {
    const headers = dataTable.value?.colNames ?? [];
    const rows =
        dataTable.value?.body.map((row) => [row[0].name, ...row.slice(1)]) ??
        [];
    return { headers, rows };
});

watch(
    [
        datasetCopyReference,
        () => FINAL_CONFIG.value.useAnimation,
        prefersReducedMotion,
    ],
    () => {
        cancelAnimations();
        const ids = new Set(
            datasetCopyReference.value.map((serie) => serie.uid),
        );
        segregated.value = segregated.value.filter((id) => ids.has(id));
    },
    { deep: true },
);
watch(() => FINAL_CONFIG.value.responsive, prepareChart, { flush: 'post' });
watch(cfgChart, () => scheduleResize?.(), { flush: 'post' });
watch(rects, () => {
    if (!selectedId.value) return;
    const index = rects.value.findIndex(
        (rect) => rect.serieId === selectedId.value,
    );
    if (index < 0) {
        clearSelection();
        return;
    }
    if (tooltipTriggerMode.value === 'keyboard')
        setKeyboardTooltipPositionFromSeriesIndex(
            rects.value[index].serieIndex,
        );
    useTooltip(index, tooltipTriggerMode.value, false);
});

defineExpose({
    getData,
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    generateSvg,
    hideSeries,
    showSeries,
    toggleTable,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen,
    copyAlt,
});
</script>

<template>
    <div
        :class="`vue-data-ui-component vue-ui-waffle ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`"
        ref="waffleChart"
        :id="`vue-ui-waffle_${uid}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${cfgChart.backgroundColor};${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`"
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <!-- A11Y -->
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

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle"
            class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <!-- TITLE AS DIV -->
        <div
            ref="chartTitle"
            v-if="cfgChart.title.text"
            :style="`width:100%;background:transparent;padding-bottom:12px`"
        >
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'waffle-title',
                        ...cfgChart.title,
                    },
                    subtitle: {
                        cy: 'waffle-subtitle',
                        ...cfgChart.title.subtitle,
                    },
                }"
            />
        </div>

        <div :id="`legend-top-${uid}`" />

        <!-- OPTIONS -->
        <UserOptions
            ref="userOptionsRef"
            :key="`user_options_${step}`"
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
            :hasTooltip="cfgUserOptions.buttons.tooltip && cfgTooltip.show"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :chartElement="waffleChart"
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
            @toggleTooltip="toggleTooltip"
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
                    'menuIcon optionTooltip optionPdf optionCsv optionImg optionSvg optionTable optionFullscreen optionAnnotator optionAltCopy custom-menu-before custom-menu-after',
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
                :class="{
                    'vue-data-ui-fullscreen--on': isFullscreen,
                    'vue-data-ui-fulscreen--off': !isFullscreen,
                    'vue-data-ui-no-transition': !transitionEnabled,
                }"
                data-cy="waffle-svg"
                tabindex="0"
                :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`"
                :style="`max-width:100%;overflow:visible;background:transparent;color:${cfgChart.color}`"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
            >
                <PackageVersion />
                <slot
                    name="svg-underlayer"
                    :svg="{
                        ...svg,
                        isPrintingImg:
                            isPrinting || isImaging || isCallbackImaging,
                        isPrintingSvg: isCallbackSvg,
                    }"
                />

                <!-- DEFS -->
                <defs>
                    <DefGrad
                        t="radial"
                        cx="50%"
                        cy="50%"
                        r="50%"
                        fx="50%"
                        fy="50%"
                        v-for="rect in waffleSet"
                        :id="`gradient_${uid}_${rect.absoluteIndex}`"
                        :key="`gradient_${uid}_${rect.absoluteIndex}`"
                        :stops="[
                            [
                                '0%',
                                setOpacity(
                                    shiftHue(rect.color, 0.05),
                                    100 - cfgRect.gradientIntensity,
                                ),
                                1,
                            ],
                            ['100%', rect.color, 1],
                        ]"
                    />
                </defs>

                <!-- RECTS -->
                <defs>
                    <filter
                        :id="`blur_${uid}`"
                        x="-50%"
                        y="-50%"
                        width="200%"
                        height="200%"
                    >
                        <feGaussianBlur in="SourceGraphic" :stdDeviation="2" />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>
                </defs>

                <!-- CUSTOM CELLS SLOTS -->
                <template
                    v-if="
                        FINAL_CONFIG.useCustomCells &&
                        rects.length &&
                        $slots.cell
                    "
                >
                    <foreignObject
                        v-for="(position, i) in cellPositions"
                        :x="position.x"
                        :y="position.y"
                        :height="rectDimensionY <= 0 ? 0.0001 : rectDimensionY"
                        :width="rectDimension <= 0 ? 0.0001 : rectDimension"
                        class="vue-ui-waffle-custom-cell-foreignObject"
                    >
                        <slot
                            name="cell"
                            v-bind="getCellSlotProps(position, i)"
                        />
                    </foreignObject>
                </template>

                <rect
                    v-if="!rects.length && !FINAL_CONFIG.useCustomCells"
                    :x="12"
                    :y="12"
                    :height="drawingArea.height - 24"
                    :width="drawingArea.width - 24"
                    :rx="3"
                    fill="none"
                    stroke="black"
                />

                <template
                    v-else-if="rects.length && !FINAL_CONFIG.useCustomCells"
                >
                    <g v-if="$slots.pattern">
                        <defs v-for="ds in datasetCopyReference">
                            <slot
                                name="pattern"
                                v-bind="{
                                    seriesIndex: ds.absoluteIndex,
                                    patternId: `pattern_${uid}_${ds.absoluteIndex}`,
                                }"
                            />
                        </defs>
                    </g>

                    <template v-if="cfgRect.merged">
                        <path
                            v-for="serie in mergedSeriePaths"
                            :key="`merged-underlayer-${serie.serieIndex}`"
                            data-cy="datapoint-underlayer"
                            :d="serie.d"
                            fill="white"
                            fill-rule="evenodd"
                            :stroke="cfgRect.stroke"
                            :stroke-width="cfgRect.strokeWidth"
                            stroke-linejoin="round"
                            :filter="getBlurFilter(serie.serieIndex)"
                            :style="getRectStyle(serie.serieIndex)"
                            :class="{
                                'vue-data-ui-transition': transitionEnabled,
                            }"
                        />
                        <path
                            v-for="serie in mergedSeriePaths"
                            :key="`merged-serie-${serie.serieIndex}`"
                            data-cy="datapoint-rect"
                            :d="serie.d"
                            :fill="
                                cfgRect.useGradient &&
                                cfgRect.gradientIntensity > 0
                                    ? `url(#gradient_${uid}_${serie.absoluteIndex})`
                                    : serie.color
                            "
                            fill-rule="evenodd"
                            :stroke="cfgRect.stroke"
                            :stroke-width="cfgRect.strokeWidth"
                            stroke-linejoin="round"
                            :filter="getBlurFilter(serie.serieIndex)"
                            :style="getRectStyle(serie.serieIndex)"
                            :class="{
                                'vue-data-ui-transition': transitionEnabled,
                            }"
                        />
                        <g v-if="$slots.pattern">
                            <path
                                v-for="serie in mergedSeriePaths"
                                :key="`merged-pattern-${serie.serieIndex}`"
                                :d="serie.d"
                                :fill="`url(#pattern_${uid}_${serie.absoluteIndex})`"
                                fill-rule="evenodd"
                                stroke="none"
                                :filter="getBlurFilter(serie.serieIndex)"
                                :style="getRectStyle(serie.serieIndex)"
                                :class="{
                                    'vue-data-ui-transition': transitionEnabled,
                                }"
                            />
                        </g>
                    </template>
                    <template v-else>
                        <rect
                            data-cy="datapoint-underlayer"
                            v-for="(position, i) in cellPositions"
                            :rx="cfgRect.rounded ? cfgRect.rounding : 0"
                            v-bind="getCellAttrs(position)"
                            fill="white"
                            :stroke="cfgRect.stroke"
                            :stroke-width="cfgRect.strokeWidth"
                            :filter="getBlurFilter(rects[i].serieIndex)"
                            :style="getRectStyle(rects[i].serieIndex)"
                            :class="{
                                'vue-data-ui-transition': transitionEnabled,
                            }"
                        />
                        <rect
                            data-cy="datapoint-rect"
                            v-for="(position, i) in cellPositions"
                            :rx="cfgRect.rounded ? cfgRect.rounding : 0"
                            v-bind="getCellAttrs(position)"
                            :fill="
                                cfgRect.useGradient &&
                                cfgRect.gradientIntensity > 0
                                    ? `url(#gradient_${uid}_${rects[i].absoluteIndex})`
                                    : rects[i].color
                            "
                            :stroke="cfgRect.stroke"
                            :stroke-width="cfgRect.strokeWidth"
                            :filter="getBlurFilter(rects[i].serieIndex)"
                            :style="getRectStyle(rects[i].serieIndex)"
                            :class="{
                                'vue-data-ui-transition': transitionEnabled,
                            }"
                        />
                        <g v-if="$slots.pattern">
                            <rect
                                v-for="(position, i) in cellPositions"
                                :rx="cfgRect.rounded ? cfgRect.rounding : 0"
                                v-bind="getCellAttrs(position)"
                                :fill="`url(#pattern_${uid}_${rects[i].absoluteIndex})`"
                                stroke="none"
                                :filter="getBlurFilter(rects[i].serieIndex)"
                                :style="getRectStyle(rects[i].serieIndex)"
                                :class="{
                                    'vue-data-ui-transition': transitionEnabled,
                                }"
                            />
                        </g>
                    </template>
                </template>

                <template v-if="$slots.cellSvg && rects.length">
                    <g v-for="(position, i) in cellPositions">
                        <slot
                            name="cellSvg"
                            v-bind="getCellSlotProps(position, i)"
                        />
                    </g>
                </template>

                <polygon
                    v-for="(points, polygonIndex) in selectionWrapPolygons"
                    :key="`selected-series-wrap-${polygonIndex}`"
                    data-cy="selected-series-wrap"
                    :points="points"
                    fill="none"
                    :stroke="cfgRect.selection.wrap.stroke"
                    :stroke-width="cfgRect.selection.wrap.strokeWidth"
                    :stroke-linejoin="cfgRect.selection.wrap.strokeLinejoin"
                    pointer-events="none"
                />

                <!-- DATA LABELS -->
                <template v-for="(position, i) in cellPositions">
                    <text
                        :key="`datalabel_${i}`"
                        data-cy="datapoint-caption"
                        v-if="showDataLabel(i, position)"
                        v-text="getCaption(i, position)"
                        :x="
                            position.x +
                            cfgLayout.labels.captions.offsetX +
                            cfgGrid.spaceBetween / 2 +
                            6
                        "
                        :y="
                            position.y +
                            cfgLayout.labels.captions.offsetY +
                            cfgGrid.spaceBetween / 2 +
                            absoluteRectDimensionY / 2 +
                            cfgLayout.labels.captions.fontSize / 3
                        "
                        :font-size="cfgLayout.labels.captions.fontSize"
                        :fill="adaptColorToBackground(rects[i].color)"
                        :filter="getBlurFilter(rects[i].serieIndex)"
                        :class="{ 'vue-data-ui-transition': transitionEnabled }"
                    />
                </template>

                <template v-if="cfgRect.merged && !FINAL_CONFIG.useCustomCells">
                    <path
                        v-for="serie in mergedSeriePaths"
                        :key="`tooltip-trap-${serie.serieIndex}`"
                        data-cy="tooltip-trap"
                        :d="serie.d"
                        fill="transparent"
                        fill-rule="evenodd"
                        stroke="none"
                        pointer-events="fill"
                        @mouseover="useTooltip(serie.rectIndex)"
                        @mouseleave="onTrapLeave(serie.rectIndex)"
                        @click="selectDatapoint(serie.rectIndex)"
                    />
                </template>
                <template v-else>
                    <rect
                        data-cy="tooltip-trap"
                        v-for="(position, i) in cellPositions"
                        :key="`tooltip-trap-${i}`"
                        v-bind="getCellAttrs(position, true)"
                        fill="transparent"
                        stroke="none"
                        @mouseover="useTooltip(i)"
                        @mouseleave="onTrapLeave(i)"
                        @click="selectDatapoint(i)"
                    />
                </template>
                <slot
                    name="svg"
                    :svg="{
                        ...svg,
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

        <div :id="`legend-bottom-${uid}`" />

        <!-- LEGEND -->
        <Teleport
            v-if="readyTeleport && (cfgLegend.show || $slots.legend)"
            :to="
                cfgLegend.position === 'top'
                    ? `#legend-top-${uid}`
                    : `#legend-bottom-${uid}`
            "
        >
            <div ref="chartLegend">
                <slot name="legend" v-bind:legend="legendSet">
                    <Legend
                        v-if="cfgLegend.show"
                        :key="`legend_${legendStep}`"
                        :legendSet="legendSet"
                        :config="legendConfig"
                        :isCursorPointer="isCursorPointer"
                        @clickMarker="({ legend }) => segregate(legend.uid)"
                    >
                        <template
                            #legend-pattern="{ legend, index }"
                            v-if="$slots.pattern"
                        >
                            <Shape
                                :shape="legend.shape"
                                :radius="30"
                                stroke="none"
                                :plot="{ x: 30, y: 30 }"
                                :fill="`url(#pattern_${uid}_${index})`"
                            />
                        </template>

                        <template #item="{ legend }">
                            <div
                                data-cy="legend-item"
                                @click="legend.segregate()"
                                :style="`opacity:${segregated.includes(legend.uid) ? 0.5 : 1}`"
                            >
                                {{ legend.display }}
                            </div>
                        </template>

                        <template #legendToggle>
                            <BaseLegendToggle
                                v-if="
                                    legendSet.length > 2 &&
                                    cfgLegend.selectAllToggle.show &&
                                    !loading
                                "
                                :backgroundColor="
                                    cfgLegend.selectAllToggle.backgroundColor
                                "
                                :color="cfgLegend.selectAllToggle.color"
                                :fontSize="cfgLegend.fontSize"
                                :checked="segregated.length > 0"
                                :isCursorPointer="isCursorPointer"
                                @toggle="toggleLegend"
                            />
                        </template>
                    </Legend>
                </slot>
            </div>
        </Teleport>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- TOOLTIP -->
        <Tooltip
            :teleportTo="cfgTooltip.teleportTo"
            :show="
                mutableConfig.showTooltip &&
                isTooltip &&
                segregated.length < props.dataset.length
            "
            :backgroundColor="cfgTooltip.backgroundColor"
            :color="cfgTooltip.color"
            :borderRadius="cfgTooltip.borderRadius"
            :borderColor="cfgTooltip.borderColor"
            :borderWidth="cfgTooltip.borderWidth"
            :backgroundOpacity="cfgTooltip.backgroundOpacity"
            :position="cfgTooltip.position"
            :offsetX="cfgTooltip.offsetX"
            :offsetY="cfgTooltip.offsetY"
            :parent="waffleChart"
            :content="tooltipContent"
            :isCustom="
                cfgTooltip.customFormat &&
                typeof cfgTooltip.customFormat === 'function'
            "
            :fontSize="cfgTooltip.fontSize"
            :isFullscreen="isFullscreen"
            :smooth="cfgTooltip.smooth"
            :backdropFilter="cfgTooltip.backdropFilter"
            :smoothForce="cfgTooltip.smoothForce"
            :smoothSnapThreshold="cfgTooltip.smoothSnapThreshold"
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
                        <div v-if="th === '__SUM__'">
                            <BaseIcon
                                name="sigma"
                                :stroke="dataTable.config.th.color"
                                :size="16"
                            />
                        </div>
                        <div v-else>{{ th }}</div>
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

.vue-ui-waffle * {
    transition: unset;
}
.vue-ui-waffle {
    user-select: none;
    position: relative;
}
.vue-ui-waffle .vue-ui-waffle-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    text-align: center;
    width: 100%;
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

.vue-data-ui-transition {
    transition: opacity 0.2s ease-in-out;
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
