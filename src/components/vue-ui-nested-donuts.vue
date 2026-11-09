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
    ref,
    computed,
    nextTick,
    onMounted,
    watch,
    onBeforeUnmount,
    defineAsyncComponent,
    shallowRef,
    toRefs,
} from 'vue';
import {
    stringifyChartConfig as stringifyStructuralConfig,
    abbreviate,
    applyDataLabel,
    calcMarkerOffsetX,
    calcMarkerOffsetY,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createUid,
    dataLabel,
    easeOutCubic,
    error,
    downloadCsv,
    isFunction,
    makeDonut,
    objectIsEmpty,
    palette,
    parens,
    sanitizeArray,
    setOpacity,
    XMLNS,
    treeShake,
} from '../lib';
import { buildValuePercentageLabel } from '../labelUtils';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { useLoading } from '../useLoading';
import { usePrinter } from '../usePrinter';
import { resolveChartConfigWithPalette } from '../resolveChartConfig';
import { useResponsive } from '../useResponsive';
import { useChartExport } from '../useChartExport';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import themes from '../themes/vue_ui_nested_donuts.json';
import Legend from '../atoms/Legend.vue'; // Must be ready in responsive mode
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import BaseLegendToggle from '../atoms/BaseLegendToggle.vue';
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

const { vue_ui_nested_donuts: DEFAULT_CONFIG } = useConfig();

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

const isDataset = computed(() => !!props.dataset?.length);
const uid = ref(createUid());
const isTooltip = ref(false);
const tooltipContent = ref('');
const step = ref(0);
const nestedDonutsChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);
const isFirstLoad = ref(true);
const animatedValues = ref([]);
const readyTeleport = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);

const activeTooltipIndex = ref(null); // a11y
const tooltipA11yPosition = ref({ x: 0, y: 0 }); // a11y
const tooltipTriggerMode = ref('pointer'); // a11y
const isFocus = ref(false); // a11y

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const FINAL_CONFIG = ref(prepareConfig());
const cfgLabels = computed(() => FINAL_CONFIG.value.style.chart.layout.labels);
const cfgTooltip = computed(() => FINAL_CONFIG.value.style.chart.tooltip);
const cfgUserOptions = computed(() => FINAL_CONFIG.value.userOptions);
const cfgLayout = computed(() => FINAL_CONFIG.value.style.chart.layout);
const cfgChart = computed(() => FINAL_CONFIG.value.style.chart);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiNestedDonuts',
    rules: [
        COMMON_RULES.emptyArray,
        {
            test: (ds) => ds.some((dp) => dp.series.length > 6),
            message: [
                '👀 Some series have > 6 data points. Consider:',
                '',
                '▶️ Grouping small values dynamically into a single "Other" data point.',
                '',
                '▶️ Using filters to let users choose a maximum number of data points to display.',
                '',
                '▶️ Using VueUiHorizontalBar instead to make the dataset breakdown easier to read.',
            ],
        },
        {
            test: (ds) => ds.length === 1,
            message: [
                '👀 There is only one series in your dataset. Consider:',
                '',
                '▶️ Using VueUiDonut instead.',
            ],
        },
        {
            test: (ds) => ds.length > 6,
            message: [
                '👀 The number of series in your dataset > 6. Consider:',
                '',
                '▶️ Using filters to let users choose a maximum number of series to display',
                '',
                '▶️ Using VueUiHorizontalBar instead to make the dataset breakdown easier to read.',
            ],
        },
    ],
});

const isCursorPointer = computed(
    () => FINAL_CONFIG.value.userOptions.useCursorPointer,
);

const loaderDs = {
    name: '',
    series: [
        {
            name: '',
            values: [3],
            color: '#BABABA',
        },
        {
            name: '',
            values: [2],
            color: '#AAAAAA',
        },
        {
            name: '',
            values: [1],
            color: '#CACACA',
        },
    ],
};

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            useCssAnimation: false,
            table: { show: false },
            startAnimation: { show: false },
            userOptions: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    layout: {
                        labels: {
                            dataLabels: { show: false },
                        },
                    },
                    legend: {
                        backgroundColor: 'transparent',
                        showValue: false,
                        showPercentage: false,
                    },
                    title: {
                        color: '#1A1A1A',
                        subtitle: {
                            color: '#5A5A5A',
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
    skeletonDataset: props.config?.skeletonDataset ?? [loaderDs, loaderDs],
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

        mutableConfig.value.dataLabels.show = cfgLabels.value.dataLabels.show;
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        mutableConfig.value.showTooltip = cfgTooltip.value.show;
    },
    { deep: true },
);

const padding = computed(() => {
    const { top, right, bottom, left } = cfgChart.value.padding;
    return {
        css: `padding:${top}px ${right}px ${bottom}px ${left}px`,
        top,
        right,
        bottom,
        left,
    };
});

let disposed = false;
let startupFrame = null;
let startupSequence = 0;
const toggleAnimations = new Map();
const animatedOverrides = ref({});
function cancelStartup() {
    startupSequence += 1;
    if (startupFrame !== null) cancelAnimationFrame(startupFrame);
    startupFrame = null;
    isFirstLoad.value = false;
}
function cancelToggle(id) {
    const animation = toggleAnimations.get(id);
    if (animation) cancelAnimationFrame(animation.frame);
    toggleAnimations.delete(id);
}
function cancelAnimations() {
    cancelStartup();
    for (const id of toggleAnimations.keys()) cancelToggle(id);
    animatedOverrides.value = {};
}
function triggerAnim() {
    cancelAnimations();
    segregated.value = segregated.value.filter((id) =>
        seriesById.value.has(id),
    );
    if (disposed || loading.value || !FINAL_CONFIG.value.startAnimation.show)
        return;
    const targets = preparedDataset.value.flatMap((ds) =>
        ds.series.map((s) => s.value),
    );
    const { durationMs, staggerMs } = FINAL_CONFIG.value.startAnimation;
    const duration = Number(durationMs);
    if (!targets.length || !Number.isFinite(duration) || duration <= 0) return;
    const stagger = Number.isFinite(Number(staggerMs))
        ? Math.max(0, Number(staggerMs))
        : 0;
    animatedValues.value = targets.map(() => 0);
    isFirstLoad.value = true;
    const sequence = startupSequence;
    const start = performance.now();
    function animate(now) {
        if (disposed || sequence !== startupSequence) return;
        let done = true;
        animatedValues.value = targets.map((target, i) => {
            const progress = Math.max(
                0,
                Math.min(1, (now - start - i * stagger) / duration),
            );
            if (progress < 1) done = false;
            return target * easeOutCubic(progress);
        });
        if (done) {
            startupFrame = null;
            isFirstLoad.value = false;
        } else startupFrame = requestAnimationFrame(animate);
    }
    startupFrame = requestAnimationFrame(animate);
}
const ghostSlices = computed(() => {
    if (!isFirstLoad.value) return [];
    let cursor = 0;
    return preparedDataset.value
        .map((ds, i) => {
            const value =
                ds.series.reduce((sum, s) => sum + s.value, 0) -
                animatedValues.value
                    .slice(cursor, cursor + ds.series.length)
                    .reduce((a, b) => a + b, 0);
            cursor += ds.series.length;
            return {
                name: '__ghost__',
                arcOf: ds.name,
                arcOfId: ds.id,
                id: `ghost_${uid.value}_${i}`,
                seriesIndex: -1,
                datasetIndex: i,
                color: 'transparent',
                value,
                fullValue: value,
                absoluteValues: [],
                ghost: true,
            };
        })
        .filter((g) => g.value > Number.MIN_VALUE);
});
const resizeObserver = shallowRef(null);
let resizeFrame = null;
function stopResize() {
    resizeObserver.value?.disconnect();
    resizeObserver.value = null;
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = null;
}
function prepareChart() {
    stopResize();
    if (!FINAL_CONFIG.value.responsive) {
        svg.value = {
            width: cfgChart.value.width,
            height: cfgChart.value.height,
        };
        return;
    }
    const parent = nestedDonutsChart.value?.parentNode;
    if (!parent) return;
    const resize = () => {
        if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
            resizeFrame = null;
            if (disposed) return;
            const { width, height } = useResponsive({
                chart: nestedDonutsChart.value,
                title: cfgChart.value.title.text ? chartTitle.value : null,
                legend: cfgChart.value.legend.show ? chartLegend.value : null,
                source: source.value,
                noTitle: noTitle.value,
                padding: padding.value,
            });
            svg.value = { width, height };
        });
    };
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
    cancelAnimations();
    stopResize();
});
const debug = computed(() => FINAL_CONFIG.value.debug);

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `nested_donuts_${uid.value}`,
    fileName: cfgChart.value.title.text || 'vue-ui-nested-donuts',
    options: FINAL_CONFIG.value.userOptions.print,
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !cfgChart.value.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableConfig = ref({
    dataLabels: {
        show: cfgLabels.value.dataLabels.show,
    },
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: cfgTooltip.value.show,
});

// v3 - Essential to make shifting between loading config and final config work
watch(
    FINAL_CONFIG,
    () => {
        mutableConfig.value = {
            dataLabels: {
                show: cfgLabels.value.dataLabels.show,
            },
            showTable: FINAL_CONFIG.value.table.show,
            showTooltip: cfgTooltip.value.show,
        };
    },
    { immediate: true },
);

const svg = ref({
    width: cfgChart.value.width,
    height: cfgChart.value.height,
});

const emit = defineEmits(['selectLegend', 'selectDatapoint', 'copyAlt']);

function selectDatapoint({ datapoint, index, seriesIndex }) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex });
    }
    emit('selectDatapoint', { datapoint, index });
}

const segregated = ref([]);

const preparedDataset = computed(() => {
    FINAL_DATASET.value.forEach((ds, i) => {
        if ([null, undefined].includes(ds.name)) {
            error({
                componentName: 'VueUiNestedDonuts',
                type: 'datasetSerieAttribute',
                property: 'name',
                index: i,
                debug: debug.value,
            });
        }
        if ([null, undefined].includes(ds.series)) {
            error({
                componentName: 'VueUiNestedDonuts',
                type: 'datasetSerieAttribute',
                property: 'series',
                index: i,
                debug: debug.value,
            });
        } else {
            if (ds.series.length === 0) {
                error({
                    componentName: 'VueUiNestedDonuts',
                    type: 'datasetAttributeEmpty',
                    property: `series at index ${i}`,
                    debug: debug.value,
                });
            } else {
                ds.series.forEach((serie, j) => {
                    if ([null, undefined].includes(serie.name)) {
                        error({
                            componentName: 'VueUiNestedDonuts',
                            type: 'datasetSerieAttribute',
                            property: 'name',
                            index: j,
                            key: 'serie',
                            debug: debug.value,
                        });
                    }
                    if ([null, undefined].includes(serie.values)) {
                        error({
                            componentName: 'VueUiNestedDonuts',
                            type: 'datasetSerieAttribute',
                            property: 'values',
                            index: j,
                            key: 'serie',
                            debug: debug.value,
                        });
                    }
                });
            }
        }
    });

    return FINAL_DATASET.value.map((ds, i) => {
        return {
            ...ds,

            datasetIndex: i,
            id: `${uid.value}_${i}`,
            series: (ds.series || []).map((serie, j) => {
                const rawValue = sanitizeArray(serie.values).reduce(
                    (a, b) => a + b,
                    0,
                );

                return {
                    name: serie.name,
                    arcOf: ds.name,
                    arcOfId: `${uid.value}_${i}`,
                    id: `${uid.value}_${i}_${j}`,
                    seriesIndex: j,
                    datasetIndex: i,
                    color:
                        convertColorToHex(serie.color) ||
                        customPalette.value[j] ||
                        palette[j % palette.length],
                    value: rawValue,
                    absoluteValues: serie.values || [],
                };
            }),
        };
    });
});

const seriesById = computed(
    () =>
        new Map(
            preparedDataset.value.flatMap((ds) =>
                ds.series.map((s) => [s.id, s]),
            ),
        ),
);
const immutableDataset = computed(() => {
    let index = 0;
    return preparedDataset.value.map((ds) => ({
        ...ds,
        total: ds.series
            .filter((s) => !segregated.value.includes(s.id))
            .reduce((sum, s) => sum + s.value, 0),
        series: ds.series.map((s) => ({
            ...s,
            value: isFirstLoad.value
                ? (animatedValues.value[index++] ?? 0)
                : s.value,
        })),
    }));
});

const donutSize = computed(() => {
    return (
        Math.min(svg.value.height, svg.value.width) *
        (cfgLayout.value.donut.strokeWidth / 512)
    );
});

function visibleDataset(overrides = {}) {
    return immutableDataset.value.map((ds) => {
        const series = ds.series
            .filter((s) => !segregated.value.includes(s.id))
            .map((s) => ({ ...s, value: overrides[s.id] ?? s.value }));
        const total = series.reduce((sum, s) => sum + s.value, 0);
        return {
            ...ds,
            total,
            series: series.map((s) => ({
                ...s,
                proportion: total ? s.value / total : 0,
            })),
        };
    });
}
const md = computed(() => visibleDataset());
const mutableDataset = computed(() => visibleDataset(animatedOverrides.value));

function toggleLegend(legendSet) {
    cancelAnimations();
    const ids = legendSet.map((item) => item.id);
    if (legendSet.some((l) => segregated.value.includes(l.id))) {
        const removeIds = new Set(ids);
        segregated.value = segregated.value.filter((id) => !removeIds.has(id));
    } else {
        segregated.value.push(...ids);
    }
    emit('selectLegend', md.value);
}

function segregateDonut(item) {
    const target = seriesById.value.get(item.id);
    if (!target) return;
    cancelStartup();
    const pending = toggleAnimations.get(item.id);
    const show = pending ? !pending.show : segregated.value.includes(item.id);
    const group = preparedDataset.value[target.datasetIndex];
    if (
        !show &&
        group.series.filter(
            (s) =>
                !segregated.value.includes(s.id) &&
                toggleAnimations.get(s.id)?.show !== false,
        ).length <= 1
    )
        return;
    const from = animatedOverrides.value[item.id] ?? (show ? 0 : target.value);
    cancelToggle(item.id);
    if (show)
        segregated.value = segregated.value.filter((id) => id !== item.id);
    const finish = () => {
        if (!show && !segregated.value.includes(item.id))
            segregated.value.push(item.id);
        const { [item.id]: _removed, ...rest } = animatedOverrides.value;
        animatedOverrides.value = rest;
        toggleAnimations.delete(item.id);
        emit('selectLegend', md.value);
    };
    const duration = Number(FINAL_CONFIG.value.serieToggleAnimation.durationMs);
    if (
        !FINAL_CONFIG.value.serieToggleAnimation.show ||
        !Number.isFinite(duration) ||
        duration <= 0
    ) {
        finish();
        return;
    }
    const animation = { show, frame: null };
    toggleAnimations.set(item.id, animation);
    const to = show ? target.value : 0;
    animatedOverrides.value = { ...animatedOverrides.value, [item.id]: from };
    const start = performance.now();
    function step(now) {
        if (disposed || toggleAnimations.get(item.id) !== animation) return;
        const t = Math.min(1, Math.max(0, (now - start) / duration));
        animatedOverrides.value = {
            ...animatedOverrides.value,
            [item.id]: from + (to - from) * easeOutCubic(t),
        };
        if (t < 1) animation.frame = requestAnimationFrame(step);
        else finish();
    }
    animation.frame = requestAnimationFrame(step);
}

function validSeriesToToggle(name) {
    if (!immutableDataset.value.length) {
        if (debug.value) {
            console.warn('VueUiNestedDonuts - There are no series to show.');
        }
        return null;
    }

    const dp = immutableDataset.value
        .flatMap((d) => d.series)
        .filter((el) => el.name === name);

    if (!dp.length) {
        if (debug.value) {
            console.warn(`VueUiNestedDonuts - Series name not found "${name}"`);
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

    dp.forEach((el) => {
        if (
            segregated.value.includes(el.id) ||
            toggleAnimations.get(el.id)?.show === false
        )
            segregateDonut(el);
    });
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
    dp.forEach((el) => {
        if (
            !segregated.value.includes(el.id) &&
            toggleAnimations.get(el.id)?.show !== false
        )
            segregateDonut(el);
    });
}

const donutThickness = computed(() => {
    return (
        (donutSize.value / Math.max(1, preparedDataset.value.length)) *
        cfgLayout.value.donut.spacingRatio
    );
});

const radii = computed(() =>
    preparedDataset.value.map(
        (_, i) =>
            donutSize.value -
            (i * donutSize.value) / preparedDataset.value.length,
    ),
);
function makeRing(series, radius) {
    return makeDonut(
        { series },
        svg.value.width / 2,
        svg.value.height / 2,
        radius,
        radius,
        1.99999,
        2,
        1,
        360,
        105.25,
        donutThickness.value,
    );
}
const ringGeometry = computed(() =>
    radii.value.map((radius) => ({
        radius,
        skeleton: makeRing(
            [{ name: '_', color: cfgLayout.value.donut.emptyFill, value: 1 }],
            radius,
        ),
        fullCirclePath: `M ${svg.value.width / 2},${svg.value.height / 2 + radius}
            a ${radius},${radius} 0 1,1 0,${-2 * radius}
            a ${radius},${radius} 0 1,1 0,${2 * radius}`,
    })),
);
const donuts = computed(() =>
    mutableDataset.value.map((ds, i) => {
        const geometry = ringGeometry.value[i];
        const ghost = ghostSlices.value.find((g) => g.datasetIndex === i);
        const series = [...ds.series, ...(ghost ? [ghost] : [])].map((s) => ({
            ...s,
            value: s.value < 0.00000000001 ? Number.MIN_VALUE : s.value,
        }));
        const donut = makeRing(series, geometry.radius);
        return {
            ...ds,
            ...geometry,
            hasData: Math.abs(ds.total) > 0,
            donut,
            visibleArcs: donut.filter((arc) => !arc.ghost),
        };
    }),
);
const gradientSets = computed(() =>
    radii.value.map((radius) => ({
        sizeRatio: donutSize.value - radius,
        donut: makeRing([{ value: 1 }], radius)[0],
    })),
);

const selectedDatapoint = ref(null);
const selectedDatapointIndex = computed(
    () =>
        flatArcs.value.find((arc) => arc.id === selectedDatapoint.value)
            ?.seriesIndex ?? null,
);
const dataTooltipSlot = ref(null);

function clearSelection() {
    isTooltip.value = false;

    selectedDatapoint.value = null;

    activeTooltipIndex.value = null;
    tooltipTriggerMode.value = 'pointer';
}

function handleDatapointLeave({ datapoint, seriesIndex }) {
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex });
    }
    clearSelection();
}

function buildLabel({ val, percentage, showVal, showPercentage, config }) {
    return buildValuePercentageLabel({
        config,
        val,
        percentage,
        showVal,
        showPercentage,
    });
}

function useTooltip({
    datapoint,
    relativeIndex,
    notify = true,
    seriesIndex,
    triggerMode = 'pointer',
}) {
    if (notify && FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex });
    }

    tooltipTriggerMode.value = triggerMode;
    activeTooltipIndex.value =
        relativeIndex ??
        flatArcs.value.findIndex((arc) => arc.id === datapoint.id);

    selectedDatapoint.value = datapoint.id;

    dataTooltipSlot.value = {
        datapoint,
        seriesIndex,
        series: mutableDataset.value,
        config: FINAL_CONFIG.value,
    };

    const customFormat = cfgTooltip.value.customFormat;

    const customContent = isFunction(customFormat)
        ? customFormat({
              seriesIndex,
              datapoint,
              series: mutableDataset.value,
              config: FINAL_CONFIG.value,
          })
        : null;
    if (typeof customContent === 'string') {
        tooltipContent.value = customContent;
    } else {
        let html = '';

        if (
            cfgTooltip.value.showAllItemsAtIndex &&
            segregated.value.length === 0
        ) {
            const itemsAtIndex = mutableDataset.value.map((ds) => {
                return ds.series.find((s) => s.seriesIndex === seriesIndex);
            });

            itemsAtIndex.forEach((item, i) => {
                if (!item) return '';
                html += `
                    <div style="display:flex; flex-direction: column; justify-content:flex-start; align-items:flex-start;padding:6px 0; ${
                        i < itemsAtIndex.length - 1
                            ? `border-bottom:1px solid ${cfgTooltip.value.borderColor}`
                            : ''
                    }">
                        <div style="display:flex; flex-direction: row; gap: 3px; justify-content:flex-start; align-items:center;">
                            <svg viewBox="0 0 20 20" height="${
                                cfgTooltip.value.fontSize
                            }" width="${cfgTooltip.value.fontSize}">
                                <circle cx="10" cy="10" r="10" fill="${
                                    item.color
                                }"/>
                            </svg>
                            <span>
                                ${item.arcOf ?? ''} - ${item.name}
                            </span>
                        </div>
                        <span>
                            <b>
                                ${buildLabel({
                                    config: cfgChart.value.tooltip,
                                    showVal: cfgTooltip.value.showValue,
                                    showPercentage:
                                        cfgTooltip.value.showPercentage,
                                    val: applyDataLabel(
                                        cfgLayout.value.labels.dataLabels
                                            .formatter,
                                        item.value,
                                        dataLabel({
                                            p: cfgChart.value.layout.labels
                                                .dataLabels.prefix,
                                            v: item.value,
                                            s: cfgChart.value.layout.labels
                                                .dataLabels.suffix,
                                            r: cfgChart.value.tooltip
                                                .roundingValue,
                                        }),
                                        { datapoint: item, seriesIndex },
                                    ),
                                    percentage: dataLabel({
                                        v: item.proportion * 100,
                                        s: '%',
                                        r: cfgChart.value.tooltip
                                            .roundingPercentage,
                                    }),
                                })}
                            </b>
                        </span>
                    </div>
                `;
            });
        } else {
            html += `<div data-cy="donut-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid ${
                cfgTooltip.value.borderColor
            };padding-bottom:6px;margin-bottom:3px;">${datapoint.arcOf ?? ''} - ${
                datapoint.name
            }</div>`;

            html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><circle data-cy="donut-tooltip-marker" cx="6" cy="6" r="6" stroke="none" fill="${datapoint.color}"/></svg>`;

            if (cfgTooltip.value.showValue) {
                html += `<b data-cy="donut-tooltip-value">${applyDataLabel(
                    cfgLabels.value.dataLabels.formatter,
                    datapoint.value,
                    dataLabel({
                        p: cfgLabels.value.dataLabels.prefix,
                        v: datapoint.value,
                        s: cfgLabels.value.dataLabels.suffix,
                        r: cfgTooltip.value.roundingValue,
                    }),
                    { datapoint, seriesIndex },
                )}</b>`;
            }

            if (cfgTooltip.value.showPercentage) {
                if (!cfgTooltip.value.showValue) {
                    html += `<b>${dataLabel({
                        v: datapoint.proportion * 100,
                        s: '%',
                        r: cfgTooltip.value.roundingPercentage,
                    })}</b></div>`;
                } else {
                    html += `<span>(${dataLabel({
                        v: datapoint.proportion * 100,
                        s: '%',
                        r: cfgTooltip.value.roundingPercentage,
                    })})</span></div>`;
                }
            }
        }
        tooltipContent.value = `<div style="font-size:${cfgTooltip.value.fontSize}px">${html}</div>`;
    }
    isTooltip.value = true;
}

function isArcBigEnough(arc) {
    return arc.proportion * 100 > cfgLabels.value.dataLabels.hideUnderValue;
}

function getBlurFilter(arc, index) {
    if (!FINAL_CONFIG.value.useBlurOnHover) {
        return '';
    }
    if (cfgTooltip.value.showAllItemsAtIndex && segregated.value.length === 0) {
        if (
            [null, undefined].includes(selectedDatapointIndex.value) ||
            selectedDatapointIndex.value === index
        ) {
            return '';
        } else {
            return `url(#blur_${uid.value})`;
        }
    }
    if (!cfgTooltip.value.showAllItemsAtIndex || segregated.value.length) {
        if ([null, undefined].includes(selectedDatapoint.value)) {
            return '';
        }
        if (selectedDatapoint.value === arc.id) {
            return '';
        } else {
            return `url(#blur_${uid.value})`;
        }
    }
}

const legendSets = computed(() => {
    return immutableDataset.value.map((ds, i) => {
        const visibleSeries = ds.series.filter(
            (s) => !segregated.value.includes(s.id),
        );

        const total = visibleSeries.reduce(
            (sum, s) => sum + seriesById.value.get(s.id).value,
            0,
        );

        return ds.series.map((s, j) => {
            const displayValue = seriesById.value.get(s.id).value;
            const valueDisplay = applyDataLabel(
                cfgLabels.value.dataLabels.formatter,
                displayValue,
                dataLabel({
                    p: cfgLabels.value.dataLabels.prefix,
                    v: displayValue,
                    s: cfgLabels.value.dataLabels.suffix,
                    r: cfgChart.value.legend.roundingValue,
                }),
                { datapoint: s, seriesIndex: j },
            );

            const percentageDisplay = isNaN(displayValue / total)
                ? '-'
                : segregated.value.includes(s.id)
                  ? '-'
                  : dataLabel({
                        v: (displayValue / total) * 100,
                        s: '%',
                        r: cfgChart.value.legend.roundingPercentage,
                    });

            const _display = buildLabel({
                val: valueDisplay,
                percentage: percentageDisplay,
                showVal: cfgChart.value.legend.showValue,
                showPercentage: cfgChart.value.legend.showPercentage,
                config: cfgChart.value.legend,
            });

            const display = `${s.name}${cfgChart.value.legend.showPercentage || cfgChart.value.legend.showValue ? ': ' : ''}${_display}`;

            return {
                name: s.name,
                color: s.color,
                value: displayValue,
                display,
                svgDisplay: `${s.arcOf ? `${s.arcOf} - ` : ''}${display}`,
                shape: 'circle',
                arcOf: s.arcOf,
                id: s.id,
                seriesIndex: j,
                datasetIndex: i,
                total,
                opacity: segregated.value.includes(s.id) ? 0.5 : 1,
                segregate: () => segregateDonut(s),
                isSegregated: segregated.value.includes(s.id),
            };
        });
    });
});

const legendConfig = computed(() => {
    return {
        cy: 'nested-donuts-legend',
        backgroundColor: cfgChart.value.legend.backgroundColor,
        color: cfgChart.value.legend.color,
        fontSize: cfgChart.value.legend.fontSize,
        paddingBottom: 12,
        fontWeight: cfgChart.value.legend.bold ? 'bold' : '',
    };
});

const table = computed(() => {
    const head = mutableDataset.value.flatMap((ds) => {
        return ds.series.map((s) => {
            return {
                name: `${ds.name} - ${s.name}`,
                color: s.color,
                total: ds.total,
            };
        });
    });
    const body = mutableDataset.value.flatMap((ds) => {
        return ds.series.map((s) => s.value);
    });
    return { head, body };
});

function generateCsv(callback = null) {
    nextTick(() => {
        const labels = table.value.head.map((h, i) => {
            return [
                [h.name],
                [table.value.body[i]],
                [
                    isNaN(table.value.body[i] / h.total)
                        ? '-'
                        : (table.value.body[i] / h.total) * 100,
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
                title: cfgChart.value.title.text || 'vue-ui-nested-donuts',
            });
        } else {
            callback(csvContent);
        }
    });
}

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
        FINAL_CONFIG.value.table.columnNames.percentage,
    ];

    const body = table.value.head.map((h, i) => {
        const label = dataLabel({
            p: cfgLabels.value.dataLabels.prefix,
            v: table.value.body[i],
            s: cfgLabels.value.dataLabels.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue,
        });
        return [
            {
                color: h.color,
                name: h.name,
            },
            label,
            isNaN(table.value.body[i] / h.total)
                ? '-'
                : dataLabel({
                      v: (table.value.body[i] / h.total) * 100,
                      s: '%',
                      r: FINAL_CONFIG.value.table.td.roundingPercentage,
                  }),
        ];
    });

    const a11yBody = body.map((b) => {
        return b.map((c, i) => {
            if (i === 0) {
                return c.name;
            }
            return c;
        });
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
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
        FINAL_CONFIG.value.table.columnNames.percentage,
    ];

    return {
        colNames,
        head,
        body,
        a11yBody,
        config,
    };
});

/**
 * Return the current immutable dataset.
 * The result is the internal reactive value, not a defensive copy.
 *
 * @returns The current component data; treat it as read-only.
 */
function getData() {
    return immutableDataset.value;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleLabels() {
    mutableConfig.value.dataLabels.show = !mutableConfig.value.dataLabels.show;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

const getImage = createChartImageGetter(
    nestedDonutsChart,
    () => cfgChart.value.title.text,
);

const G = ref(null);

function autoSize() {
    if (!G.value) return;
    const { x, y, width, height } = G.value.getBBox();
    if (!svgRef.value) return;
    svgRef.value.setAttribute(
        'viewBox',
        `${x} ${y} ${width + Math.min(0, x)} ${height + Math.min(0, y)}`,
    );
}

const tableComponent = computed(() =>
    getTableComponent({
        config: FINAL_CONFIG,
        style: cfgChart,
        mutableConfig,
        dialog: BaseDraggableDialog,
        accordion: Accordion,
        isFullscreen,
        parent: nestedDonutsChart,
        maxWidth: 800,
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
const svgLegend = computed(() => cfgChart.value.legend);
const svgTitle = computed(() => cfgChart.value.title);
const legendSet = computed(() =>
    legendSets.value.flat().map((el) => ({
        ...el,
        name: el.svgDisplay,
    })),
);

const { isCallbackImaging, isCallbackSvg, generateSvg, onGenerateImage } =
    useChartExport({
        svg: svgRef,
        title: svgTitle,
        legend: svgLegend,
        legendItems: legendSet,
        backgroundColor: svgBg,
        getSvgCallback: () => FINAL_CONFIG.value.userOptions.callbacks.svg,
        generateImage,
    });

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: mutableDataset.value,
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
            dataset: mutableDataset.value,
        }),
    );
}

/***************************************************************************************************
 * a11y
 **************************************************************************************************/
const flatArcs = computed(() => {
    return donuts.value.flatMap((item) => {
        return item.donut.filter((arc) => !arc.ghost);
    });
});

function onSvgFocus() {
    activeTooltipIndex.value = null;
    isFocus.value = true;
}

function onSvgBlur() {
    clearSelection();
    isFocus.value = false;
}

function onSvgKeydown(event) {
    if (!svgRef.value || isAnnotator.value) return;
    if (document.activeElement !== svgRef.value) return;
    if (!flatArcs.value.length) return;

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
        const arc = flatArcs.value[activeTooltipIndex.value];
        if (!arc) return;
        selectDatapoint({
            datapoint: arc,
            index: activeTooltipIndex.value,
            seriesIndex: arc.seriesIndex,
        });
        return;
    }

    let nextIndex = activeTooltipIndex.value;
    const hoveredIndex = flatArcs.value.findIndex(
        (arc) => arc.id === selectedDatapoint.value,
    );

    const hasValidActiveIndex =
        nextIndex !== null &&
        nextIndex >= 0 &&
        nextIndex < flatArcs.value.length;

    const hasValidHoveredIndex =
        hoveredIndex !== null &&
        hoveredIndex >= 0 &&
        hoveredIndex < flatArcs.value.length;

    if (!hasValidActiveIndex) {
        if (hasValidHoveredIndex) {
            nextIndex = isNextKey ? hoveredIndex + 1 : hoveredIndex - 1;

            if (nextIndex >= flatArcs.value.length) {
                nextIndex = 0;
            }

            if (nextIndex < 0) {
                nextIndex = flatArcs.value.length - 1;
            }
        } else if (isNextKey) {
            nextIndex = 0;
        } else {
            nextIndex = flatArcs.value.length - 1;
        }
    } else if (isNextKey) {
        nextIndex += 1;
        if (nextIndex >= flatArcs.value.length) {
            nextIndex = 0;
        }
    } else if (isPreviousKey) {
        nextIndex -= 1;
        if (nextIndex < 0) {
            nextIndex = flatArcs.value.length - 1;
        }
    }

    const arc = flatArcs.value[nextIndex];
    if (!arc) return;

    activeTooltipIndex.value = nextIndex;
    setKeyboardTooltipPosition();
    useTooltip({
        datapoint: arc,
        relativeIndex: nextIndex,
        seriesIndex: arc.seriesIndex,
        show: true,
        triggerMode: 'keyboard',
    });
}

function setKeyboardTooltipPosition() {
    if (!svgRef.value) return;

    const box = svgRef.value.getBoundingClientRect();

    tooltipA11yPosition.value = {
        x: box.left + box.width / 2,
        y: box.top + box.height / 2,
    };
}

const a11yTable = computed(() => {
    const headers = dataTable.value?.colNames ?? [];
    const rows = dataTable.value?.a11yBody ?? [];
    return { headers, rows };
});

watch(
    [
        preparedDataset,
        () => FINAL_CONFIG.value.startAnimation,
        () => FINAL_CONFIG.value.serieToggleAnimation,
    ],
    triggerAnim,
    { deep: true, immediate: true, flush: 'post' },
);
watch(
    [
        () => FINAL_CONFIG.value.responsive,
        () => cfgChart.value.width,
        () => cfgChart.value.height,
    ],
    prepareChart,
    { flush: 'post' },
);
watch(flatArcs, (arcs) => {
    if (!selectedDatapoint.value) return;
    const index = arcs.findIndex((arc) => arc.id === selectedDatapoint.value);
    if (index < 0) {
        clearSelection();
        return;
    }
    useTooltip({
        datapoint: arcs[index],
        relativeIndex: index,
        seriesIndex: arcs[index].seriesIndex,
        triggerMode: tooltipTriggerMode.value,
        notify: false,
    });
});

defineExpose({
    autoSize,
    getData,
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    generateSvg,
    hideSeries,
    showSeries,
    toggleTable,
    toggleLabels,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen,
    copyAlt,
});
</script>

<template>
    <div
        ref="nestedDonutsChart"
        :class="`vue-data-ui-component vue-ui-nested-donuts ${
            isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''
        } ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${cfgChart.backgroundColor}`"
        :id="`nested_donuts_${uid}`"
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

        <div ref="chartTitle" v-if="cfgChart.title.text">
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

        <div :id="`legend-top-${uid}`" />

        <!-- OPTIONS -->
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
            :hasTooltip="cfgUserOptions.buttons.tooltip && cfgTooltip.show"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :chartElement="nestedDonutsChart"
            v-bind="
                getUserOptionsProps(
                    cfgUserOptions,
                    'pdf csv img svg labels table fullscreen altCopy annotator',
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
            @toggleLabels="toggleLabels"
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
                    'menuIcon optionTooltip optionPdf optionCsv optionImg optionSvg optionTable optionLabels optionFullscreen optionAnnotator optionAltCopy custom-menu-before custom-menu-after',
                )"
                #[slotName]="slotProps"
            >
                <slot
                    :name="slotName"
                    v-bind="getUserOptionSlotProps(slotName, slotProps)"
                />
            </template>
        </UserOptions>

        <div style="position: relative">
            <svg
                ref="svgRef"
                :xmlns="XMLNS"
                :aria-describedby="`chart-instructions-${uid}`"
                :class="{
                    'vue-data-ui-fullscreen--on': isFullscreen,
                    'vue-data-ui-fulscreen--off': !isFullscreen,
                    'vue-data-ui-svg': true,
                }"
                :viewBox="`0 0 ${svg.width <= 0 ? 0.001 : svg.width} ${svg.height < 0 ? 0.001 : svg.height}`"
                :style="`max-width:100%; overflow: visible; background:transparent;color:${cfgChart.color};${padding.css}`"
                tabindex="0"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
            >
                <g ref="G" class="vue-data-ui-g">
                    <PackageVersion />
                    <slot
                        name="svg-underlayer"
                        :svg="{
                            ...svg,
                            isPrintingImg:
                                isPrinting || isImaging || isCallbackImaging,
                            isPrintingSvg: isCallbackSvg,
                        }"
                    ></slot>

                    <!-- BACKGROUND SLOT -->
                    <foreignObject
                        v-if="$slots['chart-background']"
                        :x="0"
                        :y="0"
                        :width="svg.width <= 0 ? 0.001 : svg.width"
                        :height="svg.height < 0 ? 0.001 : svg.height"
                        :style="{
                            pointerEvents: 'none',
                        }"
                    >
                        <slot name="chart-background" />
                    </foreignObject>

                    <!-- GRADIENTS -->
                    <defs>
                        <DefGrad
                            t="radial"
                            v-for="(_, i) in gradientSets"
                            :id="`radial_${uid}_${i}`"
                            :key="`radial_${uid}_${i}`"
                            :stops="[
                                ['0%', '#FFFFFF', 0],
                                [
                                    `${(1 - donutThickness / radii[i]) * 100}%`,
                                    setOpacity('#FFFFFF', 0),
                                    0,
                                ],
                                [
                                    `${(1 - donutThickness / radii[i] / 2) * 100}%`,
                                    '#FFFFFF',
                                    cfgChart.gradientIntensity / 100,
                                ],
                                ['100%', '#FFFFFF', 0],
                            ]"
                        />
                    </defs>

                    <!-- FILTERS -->
                    <defs>
                        <filter
                            :id="`blur_${uid}`"
                            x="-50%"
                            y="-50%"
                            width="200%"
                            height="200%"
                        >
                            <feGaussianBlur
                                in="SourceGraphic"
                                :stdDeviation="2"
                                :id="`blur_std_${uid}`"
                            />
                            <feColorMatrix type="saturate" values="0" />
                        </filter>

                        <filter
                            :id="`shadow_${uid}`"
                            color-interpolation-filters="sRGB"
                        >
                            <feDropShadow
                                dx="0"
                                dy="0"
                                stdDeviation="10"
                                flood-opacity="0.5"
                                :flood-color="cfgLayout.donut.shadowColor"
                            />
                        </filter>
                    </defs>

                    <!-- CURVED PATHS -->
                    <defs>
                        <path
                            v-for="(item, i) in donuts"
                            :key="`path-full-${i}`"
                            :id="`path-full-${i}-${uid}`"
                            :d="item.fullCirclePath"
                            fill="none"
                        />
                    </defs>

                    <!-- NESTED DONUTS -->
                    <g v-for="(item, i) in donuts">
                        <template v-if="item.hasData">
                            <g v-for="(arc, j) in item.visibleArcs">
                                <path
                                    data-cy="datapoint-arc"
                                    class="vue-ui-donut-arc-path"
                                    :d="arc.arcSlice"
                                    :fill="arc.color"
                                    :stroke="
                                        cfgLayout.donut.borderColorAuto
                                            ? cfgChart.backgroundColor
                                            : cfgLayout.donut.borderColor
                                    "
                                    :stroke-width="cfgLayout.donut.borderWidth"
                                    :filter="getBlurFilter(arc, j)"
                                />
                            </g>
                        </template>
                        <template v-else>
                            <g v-for="(arc, j) in item.skeleton">
                                <path
                                    data-cy="datapoint-arc"
                                    class="vue-ui-donut-arc-path"
                                    :d="arc.arcSlice"
                                    :fill="arc.color"
                                    :stroke="
                                        cfgLayout.donut.borderColorAuto
                                            ? cfgChart.backgroundColor
                                            : cfgLayout.donut.borderColor
                                    "
                                    :stroke-width="cfgLayout.donut.borderWidth"
                                />
                            </g>
                        </template>
                    </g>

                    <g v-if="cfgChart.useGradient">
                        <g v-for="(gradient, i) in gradientSets">
                            <path
                                data-cy="donut-gradient"
                                :d="gradient.donut.arcSlice"
                                :fill="`url(#radial_${uid}_${i})`"
                                stroke="transparent"
                                stroke-width="0"
                            />
                        </g>
                    </g>

                    <g v-if="cfgLabels.dataLabels.showDonutName">
                        <template v-if="cfgLabels.dataLabels.curvedDonutName">
                            <g v-for="(item, i) in donuts">
                                <g v-for="arc in item.visibleArcs.slice(0, 1)">
                                    <text
                                        data-cy="datapoint-name"
                                        v-if="svg.width && svg.height"
                                        text-anchor="middle"
                                        :font-size="
                                            cfgLayout.labels.dataLabels.fontSize
                                        "
                                        :font-weight="
                                            cfgLayout.labels.dataLabels
                                                .boldDonutName
                                                ? 'bold'
                                                : 'normal'
                                        "
                                        :fill="
                                            cfgLayout.labels.dataLabels.color
                                        "
                                        :dy="
                                            cfgLayout.labels.dataLabels
                                                .donutNameOffsetY
                                        "
                                    >
                                        <textPath
                                            :href="`#path-full-${i}-${uid}`"
                                            startOffset="50%"
                                            text-anchor="middle"
                                            method="align"
                                            spacing="auto"
                                        >
                                            {{
                                                cfgLayout.labels.dataLabels
                                                    .donutNameAbbreviation
                                                    ? abbreviate({
                                                          source: item.name,
                                                          length: FINAL_CONFIG
                                                              .style.chart
                                                              .layout.labels
                                                              .dataLabels
                                                              .donutNameMaxAbbreviationSize,
                                                      })
                                                    : item.name
                                            }}
                                        </textPath>
                                    </text>
                                </g>
                            </g>
                        </template>
                        <template v-else>
                            <g v-for="(item, i) in donuts">
                                <g v-for="arc in item.visibleArcs.slice(0, 1)">
                                    <text
                                        data-cy="datapoint-name"
                                        v-if="svg.width && svg.height"
                                        :x="svg.width / 2"
                                        :y="
                                            arc.startY -
                                            cfgLayout.labels.dataLabels
                                                .fontSize +
                                            cfgLayout.labels.dataLabels
                                                .donutNameOffsetY
                                        "
                                        text-anchor="middle"
                                        :font-size="
                                            cfgLayout.labels.dataLabels.fontSize
                                        "
                                        :font-weight="
                                            cfgLayout.labels.dataLabels
                                                .boldDonutName
                                                ? 'bold'
                                                : 'normal'
                                        "
                                        :fill="
                                            cfgLayout.labels.dataLabels.color
                                        "
                                    >
                                        {{
                                            cfgLayout.labels.dataLabels
                                                .donutNameAbbreviation
                                                ? abbreviate({
                                                      source: item.name,
                                                      length: FINAL_CONFIG.style
                                                          .chart.layout.labels
                                                          .dataLabels
                                                          .donutNameMaxAbbreviationSize,
                                                  })
                                                : item.name
                                        }}
                                    </text>
                                </g>
                            </g>
                        </template>
                    </g>

                    <!-- DATALABELS -->
                    <g v-if="cfgLabels.dataLabels.show">
                        <g v-for="(item, i) in donuts">
                            <g
                                v-for="(arc, j) in item.visibleArcs"
                                :filter="getBlurFilter(arc, j)"
                            >
                                <text
                                    data-cy="datapoint-percentage"
                                    v-show="
                                        mutableConfig.dataLabels.show &&
                                        cfgLabels.dataLabels.showPercentage
                                    "
                                    :opacity="isArcBigEnough(arc) ? 1 : 0"
                                    :text-anchor="
                                        calcMarkerOffsetX(arc, true).anchor
                                    "
                                    :x="
                                        calcMarkerOffsetX(
                                            arc,
                                            false,
                                            cfgLayout.labels.dataLabels.offsetX,
                                        ).x || 0
                                    "
                                    :y="
                                        calcMarkerOffsetY(
                                            arc,
                                            cfgLayout.labels.dataLabels.offsetY,
                                            cfgLayout.labels.dataLabels.offsetY,
                                        ) +
                                        (cfgLabels.dataLabels.showValueFirst &&
                                        cfgLabels.dataLabels.showValue
                                            ? cfgLayout.labels.dataLabels
                                                  .fontSize
                                            : 0)
                                    "
                                    :fill="
                                        cfgLabels.dataLabels.useSerieColor
                                            ? arc.color
                                            : cfgLayout.labels.dataLabels.color
                                    "
                                    :font-size="cfgLabels.dataLabels.fontSize"
                                    :font-weight="
                                        cfgLabels.dataLabels.boldPercentage
                                            ? 'bold'
                                            : 'normal'
                                    "
                                >
                                    {{
                                        parens(
                                            dataLabel({
                                                v: arc.proportion * 100,
                                                s: '%',
                                                r: cfgChart.layout.labels
                                                    .dataLabels
                                                    .roundingPercentage,
                                            }),
                                            cfgLayout.labels.dataLabels
                                                .usePercentageParens
                                                ? '('
                                                : '',
                                            cfgLayout.labels.dataLabels
                                                .usePercentageParens
                                                ? ')'
                                                : '',
                                        )
                                    }}
                                </text>

                                <text
                                    data-cy="datapoint-value"
                                    v-show="
                                        mutableConfig.dataLabels.show &&
                                        cfgLabels.dataLabels.showValue
                                    "
                                    :opacity="isArcBigEnough(arc) ? 1 : 0"
                                    :text-anchor="
                                        calcMarkerOffsetX(arc, true).anchor
                                    "
                                    :x="
                                        calcMarkerOffsetX(
                                            arc,
                                            false,
                                            cfgLayout.labels.dataLabels.offsetX,
                                        ).x || 0
                                    "
                                    :y="
                                        calcMarkerOffsetY(
                                            arc,
                                            cfgLayout.labels.dataLabels.offsetY,
                                            cfgLayout.labels.dataLabels.offsetY,
                                        ) +
                                        (cfgLabels.dataLabels.showValueFirst ||
                                        !cfgLabels.dataLabels.showPercentage
                                            ? 0
                                            : cfgLayout.labels.dataLabels
                                                  .fontSize)
                                    "
                                    :fill="
                                        cfgLabels.dataLabels.useSerieColor
                                            ? arc.color
                                            : cfgLayout.labels.dataLabels.color
                                    "
                                    :font-size="cfgLabels.dataLabels.fontSize"
                                    :font-weight="
                                        cfgLabels.dataLabels.boldValue
                                            ? 'bold'
                                            : 'normal'
                                    "
                                >
                                    {{
                                        parens(
                                            applyDataLabel(
                                                cfgLayout.labels.dataLabels
                                                    .formatter,
                                                arc.value,
                                                dataLabel({
                                                    p: cfgChart.layout.labels
                                                        .dataLabels.prefix,
                                                    v: arc.value,
                                                    s: cfgChart.layout.labels
                                                        .dataLabels.suffix,
                                                    r: cfgChart.layout.labels
                                                        .dataLabels
                                                        .roundingValue,
                                                }),
                                                {
                                                    datapoint: arc,
                                                    seriesIndex: i,
                                                    datapointIndex: j,
                                                },
                                            ),
                                            cfgLayout.labels.dataLabels
                                                .useValueParens
                                                ? '('
                                                : '',
                                            cfgLayout.labels.dataLabels
                                                .useValueParens
                                                ? ')'
                                                : '',
                                        )
                                    }}
                                </text>
                            </g>
                        </g>
                    </g>

                    <!-- TOOLTIP TRAPS -->
                    <g v-for="(item, i) in donuts">
                        <g v-for="(arc, j) in item.visibleArcs">
                            <path
                                data-cy="tooltip-trap"
                                :d="arc.arcSlice"
                                :fill="
                                    selectedDatapoint === arc.id
                                        ? cfgLayout.donut.selectedColor
                                        : 'transparent'
                                "
                                @mouseenter="
                                    useTooltip({
                                        datapoint: arc,
                                        relativeIndex: flatArcs.findIndex(
                                            (a) => a.id === arc.id,
                                        ),
                                        seriesIndex: arc.seriesIndex,
                                    })
                                "
                                @click="
                                    selectDatapoint({
                                        datapoint: arc,
                                        index: j,
                                        seriesIndex: arc.seriesIndex,
                                    })
                                "
                                @mouseleave="
                                    handleDatapointLeave({
                                        datapoint: arc,
                                        seriesIndex: arc.seriesIndex,
                                    })
                                "
                            />
                        </g>
                    </g>
                    <slot
                        name="svg"
                        :svg="{
                            ...svg,
                            isPrintingImg:
                                isPrinting || isImaging || isCallbackImaging,
                            isPrintingSvg: isCallbackSvg,
                        }"
                    ></slot>
                </g>
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

        <!-- TOOLTIP -->
        <Tooltip
            :teleportTo="cfgTooltip.teleportTo"
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="cfgTooltip.backgroundColor"
            :color="cfgTooltip.color"
            :borderRadius="cfgTooltip.borderRadius"
            :borderColor="cfgTooltip.borderColor"
            :borderWidth="cfgTooltip.borderWidth"
            :fontSize="cfgTooltip.fontSize"
            :backgroundOpacity="cfgTooltip.backgroundOpacity"
            :position="cfgTooltip.position"
            :offsetX="cfgTooltip.offsetX"
            :offsetY="cfgTooltip.offsetY"
            :parent="nestedDonutsChart"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="isFunction(cfgTooltip.customFormat)"
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

        <div :id="`legend-bottom-${uid}`" />

        <!-- LEGEND -->
        <Teleport
            v-if="readyTeleport && (cfgChart.legend.show || $slots.legend)"
            :to="
                cfgChart.legend.position === 'top'
                    ? `#legend-top-${uid}`
                    : `#legend-bottom-${uid}`
            "
        >
            <div
                ref="chartLegend"
                v-if="cfgChart.legend.show || $slots.legend"
                :class="{
                    'vue-ui-nested-donuts-legend': legendSets.length > 1,
                }"
            >
                <slot name="legend" v-bind:legend="legendSets">
                    <Legend
                        v-for="(legendSet, i) in legendSets"
                        :key="`legend_${i}_${legendStep}`"
                        :legendSet="legendSet"
                        :config="legendConfig"
                        :isCursorPointer="isCursorPointer"
                        @clickMarker="({ legend }) => segregateDonut(legend)"
                    >
                        <template #legendTitle="{ titleSet }">
                            <div
                                class="vue-ui-nested-donuts-legend-title"
                                v-if="titleSet[0] && titleSet[0].arcOf"
                            >
                                {{ titleSet[0].arcOf }}
                            </div>
                        </template>
                        <template #item="{ legend, index }">
                            <div
                                data-cy="legend-item"
                                @click="segregateDonut(legend)"
                                :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`"
                            >
                                {{ legend.display }}
                            </div>
                        </template>

                        <template #legendToggle>
                            <BaseLegendToggle
                                :key="`toggle-${i}`"
                                v-if="
                                    legendSet.length > 2 &&
                                    cfgChart.legend.selectAllToggle.show &&
                                    !loading
                                "
                                :backgroundColor="
                                    cfgChart.legend.selectAllToggle
                                        .backgroundColor
                                "
                                :color="cfgChart.legend.selectAllToggle.color"
                                :fontSize="cfgChart.legend.fontSize"
                                :checked="
                                    legendSet.some((l) =>
                                        segregated.includes(l.id),
                                    )
                                "
                                :isCursorPointer="isCursorPointer"
                                @toggle="toggleLegend(legendSet)"
                            />
                        </template>
                    </Legend>
                </slot>
            </div>
        </Teleport>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

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

.vue-ui-nested-donuts * {
    transition: unset;
}

.vue-ui-nested-donuts {
    user-select: none;
    position: relative;
}

.vue-ui-nested-donuts-legend {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.vue-ui-nested-donuts-legend-title {
    width: 100%;
    padding: 0 0 12px 0;
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
