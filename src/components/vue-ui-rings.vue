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
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    shallowRef,
    useSlots,
    watch,
} from 'vue';
import {
    applyDataLabel,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createTSpansFromLineBreaksOnX,
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
import { buildValuePercentageLabel } from '../labelUtils';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { resolveChartConfigWithPalette } from '../resolveChartConfig';
import { usePrinter } from '../usePrinter';
import { useResponsive } from '../useResponsive';
import { useChartExport } from '../useChartExport';
import { useTransitions } from '../useTransitions.js';
import { useChartAccessibility } from '../useChartAccessibility';
import Shape from '../atoms/Shape.vue';
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import themes from '../themes/vue_ui_rings.json';
import Legend from '../atoms/Legend.vue'; // Must be ready in responsive mode
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import BaseLegendToggle from '../atoms/BaseLegendToggle.vue';
import DefGrad from '../atoms/DefGrad.vue';

const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
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
const BaseDraggableDialog = defineAsyncComponent(
    () => import('../atoms/BaseDraggableDialog.vue'),
);

const { vue_ui_rings: DEFAULT_CONFIG } = useConfig();
const slots = useSlots();

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

function isValidDataset(dataset) {
    return (
        Array.isArray(dataset) &&
        dataset.length > 0 &&
        Array.from(
            dataset,
            (serie) =>
                serie &&
                Object.keys(serie).includes('name') &&
                Array.isArray(serie.values) &&
                serie.values.length > 0,
        ).every(Boolean)
    );
}
const isDataset = computed(() => isValidDataset(props.dataset));

const uid = ref(createUid());
const isTooltip = ref(false);
const tooltipContent = ref('');
const selectedSerie = ref(null);
const step = ref(0);
const ringsChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const resizing = ref(false);
const readyTeleport = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);

const activeTooltipIndex = ref(null); // a11y
const tooltipA11yPosition = ref({ x: 0, y: 0 }); // a11y
const tooltipTriggerMode = ref('pointer'); // a11y
const isFocus = ref(false); // a11y

const preparedConfig = ref(prepareConfig());

watch(
    () => props.config,
    () => {
        preparedConfig.value = prepareConfig();
    },
    { deep: true },
);

const loading = computed(() => !!props.config.loading || !isDataset.value);

const FINAL_CONFIG = computed(() =>
    loading.value
        ? treeShake({
              defaultConfig: preparedConfig.value,
              userConfig: skeletonConfig.value,
          })
        : preparedConfig.value,
);

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            userOptions: { show: false },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    layout: {
                        rings: {
                            stroke: '#6A6A6A',
                            gradient: {
                                underlayerColor: '#FFFFFF',
                            },
                        },
                        labels: {
                            dataLabels: {
                                show: false,
                            },
                        },
                    },
                    legend: {
                        backgroundColor: 'transparent',
                    },
                },
            },
        },
        userConfig: preparedConfig.value.skeletonConfig ?? {},
    });
});

const cfgUserOptions = computed(() => FINAL_CONFIG.value.userOptions);
const cfgRings = computed(() => FINAL_CONFIG.value.style.chart.layout.rings);
const cfgLabels = computed(() => FINAL_CONFIG.value.style.chart.layout.labels);
const cfgTooltip = computed(() => FINAL_CONFIG.value.style.chart.tooltip);
const cfgChart = computed(() => FINAL_CONFIG.value.style.chart);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiRings',
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

const { transitionEnabled } = useTransitions({
    config: () => FINAL_CONFIG.value.transitions,
    dataset: () => props.dataset,
});

const isCursorPointer = computed(
    () => FINAL_CONFIG.value.userOptions.useCursorPointer,
);

const FINAL_DATASET = computed(() =>
    loading.value
        ? isValidDataset(props.config.skeletonDataset)
            ? props.config.skeletonDataset
            : [
                  { name: '_', values: [13], color: '#808080' },
                  { name: '_', values: [8], color: '#969696' },
                  { name: '_', values: [5], color: '#ADADAD' },
                  { name: '_', values: [3], color: '#C4C4C4' },
                  { name: '_', values: [2], color: '#DBDBDB' },
              ]
        : props.dataset,
);

const userOptionsVisible = ref(
    !FINAL_CONFIG.value.userOptions.showOnChartHover,
);

const keepUserOptionState = computed(
    () => FINAL_CONFIG.value.userOptions.keepStateOnChartLeave,
);

function setUserOptionsVisibility(value = false) {
    if (FINAL_CONFIG.value.userOptions.showOnChartHover)
        userOptionsVisible.value = value;
}

watch(
    () => FINAL_CONFIG.value.userOptions.showOnChartHover,
    (value) => {
        userOptionsVisible.value = !value;
    },
);

const { svgRef } = useChartAccessibility({ config: cfgChart.value.title });

function prepareConfig() {
    return resolveChartConfigWithPalette(props.config, DEFAULT_CONFIG, themes);
}

const computedOffset = computed(() => {
    const { markers } = cfgLabels.value.dataLabels;
    const r = maxHeight.value / 2;

    const x = !showLabels.value ? 0 : markers.position === 'left' ? r : -r;

    const _xResp = !showLabels.value ? 0 : svg.value.width / 2 - r;
    const xResp = markers.position === 'left' ? _xResp : -_xResp;
    const y = 0;

    return {
        x: FINAL_CONFIG.value.responsive
            ? xResp
            : (x / cfgChart.value.size) * svg.value.width,
        y: (y / cfgChart.value.size) * svg.value.height,
    };
});

const CENTER = computed(() => {
    return {
        x: svg.value.width / 2 + computedOffset.value.x,
        y: svg.value.height / 2 + computedOffset.value.y,
    };
});

const resizeObserver = shallowRef(null);
const responsiveSize = shallowRef(null);
let resizeFrame = null;
let disposed = false;

const debug = computed(() => preparedConfig.value.debug);

function validateDataset() {
    if (!Array.isArray(props.dataset) || !props.dataset.length) {
        error({
            componentName: 'VueUiRings',
            type: 'dataset',
            debug: debug.value,
        });
        return;
    }
    Array.from(props.dataset).forEach((serie, index) => {
        getMissingDatasetAttributes({
            datasetObject: serie ?? {},
            requiredAttributes: ['name', 'values'],
        }).forEach((property) => {
            error({
                componentName: 'VueUiRings',
                type: 'datasetSerieAttribute',
                property,
                index,
                debug: debug.value,
            });
        });
        if (!debug.value) return;
        if (Array.isArray(serie?.values)) {
            if (!serie.values.length)
                error({
                    componentName: 'VueUiRings',
                    type: 'dataset',
                    debug: true,
                });
        } else if (serie && Object.keys(serie).includes('values')) {
            console.warn(
                `VueUiRings: dataset[${index}].values must be an array.`,
            );
        }
    });
}

watch([() => props.dataset, debug], validateDataset, {
    immediate: true,
    deep: true,
});

function teardownResponsive() {
    resizeObserver.value?.disconnect();
    resizeObserver.value = null;
    if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
    resizeFrame = null;
    resizing.value = false;
}

function prepareChart() {
    teardownResponsive();
    responsiveSize.value = null;
    if (!FINAL_CONFIG.value.responsive || !ringsChart.value?.parentNode) return;
    const observer = new ResizeObserver(measure);
    function measure() {
        if (disposed || resizeObserver.value !== observer) return;
        if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
        resizing.value = true;
        resizeFrame = requestAnimationFrame(() => {
            if (disposed || resizeObserver.value !== observer) return;
            resizeFrame = null;
            const { width, height } = useResponsive({
                chart: ringsChart.value,
                title: cfgChart.value.title.text ? chartTitle.value : null,
                legend: cfgChart.value.legend.show ? chartLegend.value : null,
                source: source.value,
                noTitle: noTitle.value,
            });
            responsiveSize.value = {
                width: Math.max(0.1, width),
                height: Math.max(0.1, height - 12),
            };
            resizing.value = false;
        });
    }
    resizeObserver.value = observer;
    for (const el of [
        ringsChart.value.parentNode,
        chartTitle.value,
        chartLegend.value,
        source.value,
        noTitle.value,
    ])
        if (el) observer.observe(el);
    measure();
}

watch(
    [
        () => FINAL_CONFIG.value.responsive,
        chartTitle,
        chartLegend,
        source,
        noTitle,
        () => cfgChart.value.title.text,
        () => cfgChart.value.legend.show,
        () => cfgChart.value.legend.position,
    ],
    prepareChart,
    { flush: 'post' },
);

onMounted(() => {
    readyTeleport.value = true;
    prepareChart();
});

onBeforeUnmount(() => {
    disposed = true;
    teardownResponsive();
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `rings_${uid.value}`,
    fileName: cfgChart.value.title.text || 'vue-ui-rings',
    options: FINAL_CONFIG.value.userOptions.print,
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !cfgChart.value.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableConfig = ref({
    showTable: preparedConfig.value.table.show,
    showTooltip: preparedConfig.value.style.chart.tooltip.show,
    showLabels: preparedConfig.value.style.chart.layout.labels.dataLabels.show,
});

watch(
    () => preparedConfig.value.table.show,
    (value) => {
        mutableConfig.value.showTable = value;
    },
);

watch(
    () => preparedConfig.value.style.chart.tooltip.show,
    (value) => {
        mutableConfig.value.showTooltip = value;
    },
);

watch(
    () => preparedConfig.value.style.chart.layout.labels.dataLabels.show,
    (value) => {
        mutableConfig.value.showLabels = value;
    },
);

const showLabels = computed(() =>
    loading.value
        ? cfgLabels.value.dataLabels.show
        : mutableConfig.value.showLabels,
);

const svg = computed(
    () =>
        responsiveSize.value ?? {
            height: cfgChart.value.size,
            width: cfgChart.value.size,
        },
);

const chartRadius = computed(() => {
    return Math.min(svg.value.height, svg.value.width);
});

const emit = defineEmits(['selectLegend', 'copyAlt']);

const finishedEntryAnimations = ref(new Set());
function finishEntryAnimation(id) {
    finishedEntryAnimations.value.add(id);
}

function finishEntryAnimations() {
    datasetCopy.value.forEach((ring) => finishEntryAnimation(ring.uid));
}

const segregated = ref([]);

function toggleLegend() {
    if (loading.value) return;
    finishEntryAnimations();
    if (segregated.value.length) {
        segregated.value = [];
    } else {
        legendSet.value.forEach((l) => {
            segregated.value.push(l.uid);
        });
    }
    emitSelectLegend();
}

function emitSelectLegend() {
    emit(
        'selectLegend',
        convertedDataset.value.map((ds) => {
            return {
                name: ds.name,
                color: ds.color,
                value: ds.value,
            };
        }),
    );
}

function segregate(uid) {
    if (loading.value) return;
    finishEntryAnimations();
    if (segregated.value.includes(uid)) {
        segregated.value = segregated.value.filter((s) => s !== uid);
    } else {
        if (segregated.value.length === datasetCopy.value.length - 1) return;
        segregated.value.push(uid);
    }
    emitSelectLegend();
}

function validSeriesToToggle(name) {
    if (!datasetCopy.value.length) {
        if (debug.value) {
            console.warn('VueUiRings - There are no series to show.');
        }
        return null;
    }
    const dp = datasetCopy.value.find((d) => d.name === name);

    if (!dp) {
        if (debug.value) {
            console.warn(`VueUiRings - Series name not found "${name}"`);
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
    if (segregated.value.includes(dp.uid)) {
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
    if (!segregated.value.includes(dp.uid)) {
        segregate(dp.uid);
    }
}

// Allocate identities independently of palette and geometry computations.
const seriesIds = new Map();
const preparedDataset = computed(() => {
    const occurrences = new Map();
    const keys = new Set();
    const rows = FINAL_DATASET.value.map((serie, absoluteIndex) => {
        const occurrence = occurrences.get(serie.name) ?? 0;
        occurrences.set(serie.name, occurrence + 1);
        const key = JSON.stringify([loading.value, serie.name, occurrence]);
        keys.add(key);
        if (!seriesIds.has(key)) seriesIds.set(key, createUid());
        return {
            name: serie.name,
            color: serie.color,
            absoluteValues: serie.values,
            value: serie.values.reduce(
                (sum, value) => sum + (Number.isFinite(value) ? value : 0),
                0,
            ),
            uid: seriesIds.get(key),
            absoluteIndex,
        };
    });
    for (const key of seriesIds.keys()) {
        if (key.startsWith(`[${loading.value},`) && !keys.has(key))
            seriesIds.delete(key);
    }
    const total = rows.reduce((sum, row) => sum + row.value, 0);
    return rows.map((row) => ({
        ...row,
        proportion: safeRatio(row.value, total),
    }));
});
function safeRatio(value, total) {
    const ratio = value / total;
    return Number.isFinite(ratio) ? ratio : 0;
}
const datasetCopy = computed(() =>
    preparedDataset.value.map((row, i) => ({
        ...row,
        color:
            row.color ||
            convertColorToHex(row.color) ||
            customPalette.value[i] ||
            palette[i % palette.length],
    })),
);
const visibleDataset = computed(() =>
    datasetCopy.value.filter((el) => !segregated.value.includes(el.uid)),
);
const max = computed(() =>
    visibleDataset.value.reduce(
        (maximum, row) => Math.max(maximum, row.value),
        -Infinity,
    ),
);
function proportionToMax(value) {
    return safeRatio(value, max.value);
}

const legendSet = computed(() => {
    return datasetCopy.value
        .map((el, i) => {
            const valueDisplay = applyDataLabel(
                cfgLabels.value.dataLabels.formatter,
                el.value,
                dataLabel({
                    p: cfgLabels.value.dataLabels.prefix,
                    v: el.value,
                    s: cfgLabels.value.dataLabels.suffix,
                    r: cfgChart.value.legend.roundingValue,
                }),
                { datapoint: el, index: i },
            );

            const percentageDisplay = !Number.isFinite(
                el.value / grandTotal.value,
            )
                ? '-'
                : dataLabel({
                      v: (el.value / grandTotal.value) * 100,
                      s: '%',
                      r: cfgChart.value.legend.roundingPercentage,
                  });

            const display = buildLabel({
                showVal: cfgChart.value.legend.showValue,
                showPercentage: cfgChart.value.legend.showPercentage,
                val: valueDisplay,
                percentage: segregated.value.includes(el.uid)
                    ? '-%'
                    : percentageDisplay,
            });

            return {
                ...el,
                shape: 'circle',
                opacity: segregated.value.includes(el.uid) ? 0.5 : 1,
                segregate: () => segregate(el.uid),
                isSegregated: segregated.value.includes(el.uid),
                display: `${el.name}${cfgChart.value.legend.showPercentage || cfgChart.value.legend.showValue ? ': ' : ''}${display}`,
            };
        })
        .toSorted((a, b) => b.value - a.value);
});

const legendConfig = computed(() => {
    return {
        cy: 'rings-div-legend',
        backgroundColor: cfgChart.value.legend.backgroundColor,
        color: cfgChart.value.legend.color,
        fontSize: cfgChart.value.legend.fontSize,
        paddingBottom: 12,
        fontWeight: cfgChart.value.legend.bold ? 'bold' : '',
    };
});

const grandTotal = computed(() =>
    visibleDataset.value.reduce((sum, row) => sum + row.value, 0),
);
const convertedDataset = computed(() =>
    visibleDataset.value
        .map((row) => ({
            ...row,
            proportion: proportionToMax(row.value),
            percentage: safeRatio(row.value, grandTotal.value) * 100,
            strokeWidth:
                cfgRings.value.strokeWidth * proportionToMax(row.value),
        }))
        .toSorted((a, b) => b.value - a.value),
);

watch(
    () => preparedDataset.value.map((row) => row.uid),
    (ids) => {
        if (!loading.value)
            segregated.value = segregated.value.filter((id) =>
                ids.includes(id),
            );
    },
);

/**
 * Return series values, absolute values, colors, and percentages.
 * The outer records are new; nested absolute values remain shared.
 */
function getData() {
    return convertedDataset.value.map(
        ({ name, color, value, absoluteValues, percentage }) => {
            return {
                name,
                color,
                value,
                absoluteValues,
                percentage,
            };
        },
    );
}

const maxHeight = computed(() => {
    return chartRadius.value - cfgRings.value.strokeWidth * 2;
});

function onTrapClick(datapoint, seriesIndex) {
    if (loading.value) return;
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex });
    }
}

function clearTooltip() {
    selectedUid.value = null;
    selectedSerie.value = null;
    isTooltip.value = false;
    activeTooltipIndex.value = null;
    tooltipTriggerMode.value = 'pointer';
    dataTooltipSlot.value = null;
    tooltipContent.value = '';
}
function onTrapLeave(datapoint, seriesIndex) {
    if (loading.value) return;
    clearTooltip();
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex });
    }
}

function buildLabel({ val, percentage, showVal, showPercentage }) {
    const cfg = cfgLabels.value.dataLabels;
    return buildValuePercentageLabel({
        config: cfg,
        val,
        percentage,
        showVal,
        showPercentage,
    });
}

function getRingLabel(ring) {
    const cfg = cfgLabels.value.dataLabels;
    const valueDisplay = applyDataLabel(
        cfg.formatter,
        ring.value,
        dataLabel({
            p: cfg.prefix,
            v: ring.value,
            s: cfg.suffix,
            r: cfg.roundingValue,
        }),
    );
    const percentageDisplay = dataLabel({
        v: ring.percentage,
        s: '%',
        r: cfg.roundingPercentage,
    });

    return `${ring.name}\n${buildLabel({
        val: valueDisplay,
        percentage: percentageDisplay,
        showVal: cfg.showValue,
        showPercentage: cfg.showPercentage,
    })}`;
}

function getRadius(ring) {
    return Math.max(0.0001, ((maxHeight.value * ring.proportion) / 2) * 0.9);
}

const baseline = computed(
    () =>
        CENTER.value.y +
        (convertedDataset.value.length
            ? getRadius(convertedDataset.value[0])
            : 0),
);
function getY(ring) {
    return baseline.value - getRadius(ring);
}

function getMarkerCoordinates(ring, i) {
    const side = cfgLabels.value.dataLabels.markers.position;
    const x = side === 'left' ? -(maxHeight.value / 2) : maxHeight.value / 2;
    return {
        x: CENTER.value.x + x,
        y: getY(ring, i) - getRadius(ring),
    };
}

const dataTooltipSlot = ref(null);
const selectedUid = ref(null);

function useTooltip(datapoint, index, triggerMode = 'pointer', notify = true) {
    if (loading.value || !datapoint) return;
    if (notify && FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({
            datapoint,
            seriesIndex: index,
        });
    }

    if (segregated.value.length === props.dataset.length) return;

    dataTooltipSlot.value = {
        datapoint,
        seriesIndex: index,
        series: convertedDataset.value,
        config: FINAL_CONFIG.value,
    };

    selectedUid.value = datapoint.uid;
    selectedSerie.value = index;
    activeTooltipIndex.value = index;
    tooltipTriggerMode.value = triggerMode;

    const selected = convertedDataset.value[index];
    const customFormat = cfgTooltip.value.customFormat;

    const formatted = isFunction(customFormat)
        ? customFormat(dataTooltipSlot.value)
        : null;
    if (typeof formatted === 'string') {
        tooltipContent.value = formatted;
    } else {
        let html = '';

        html += `<div data-cy="waffle-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid ${cfgTooltip.value.borderColor};padding-bottom:6px;margin-bottom:3px;">${selected.name}</div>`;

        html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 60 60" height="14" width="14"><circle data-cy="waffle-tooltip-marker" cx="30" cy="30" r="30" stroke="none" fill="${selected.color}" />${slots.pattern ? `<circle data-cy="waffle-tooltip-marker" cx="30" cy="30" r="30" stroke="none" fill="url(#pattern_${uid.value}_${datapoint.absoluteIndex})" />` : ''}</svg>`;

        html += `<b>${buildLabel({
            showVal: cfgTooltip.value.showValue,
            showPercentage: cfgTooltip.value.showPercentage,
            val: `<span data-cy="donut-tooltip-value">${applyDataLabel(
                cfgLabels.value.dataLabels.formatter,
                selected.value,
                dataLabel({
                    p: cfgLabels.value.dataLabels.prefix,
                    v: selected.value,
                    s: cfgLabels.value.dataLabels.suffix,
                    r: cfgTooltip.value.roundingValue,
                }),
                { datapoint, seriesIndex: index },
            )}</span>`,
            percentage: dataLabel({
                v: selected.percentage,
                s: '%',
                r: cfgTooltip.value.roundingPercentage,
            }),
        })}</b></div>`;

        tooltipContent.value = html;
    }
    isTooltip.value = true;
}

const table = computed(() => {
    const head = convertedDataset.value.map((ds) => {
        return {
            name: ds.name,
            color: ds.color,
        };
    });
    const body = convertedDataset.value.map((ds) => ds.value);

    return { head, body };
});

const dataTable = computed(() => {
    const head = [
        `__SUM__`,
        dataLabel({
            p: cfgLabels.value.dataLabels.prefix,
            v: grandTotal.value,
            s: cfgLabels.value.dataLabels.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue,
        }),
        '100%',
    ];

    const body = table.value.head.map((h, i) => {
        return [
            {
                color: h.color,
                name: h.name,
            },
            dataLabel({
                p: cfgLabels.value.dataLabels.prefix,
                v: table.value.body[i],
                s: cfgLabels.value.dataLabels.suffix,
                r: FINAL_CONFIG.value.table.td.roundingValue,
            }),
            !Number.isFinite(table.value.body[i] / grandTotal.value)
                ? '-'
                : ((table.value.body[i] / grandTotal.value) * 100).toFixed(
                      FINAL_CONFIG.value.table.td.roundingPercentage,
                  ) + '%',
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
        head,
        body,
        a11yBody,
        config,
        colNames,
    };
});

function generateCsv(callback = null) {
    nextTick(() => {
        const labels = table.value.head.map((h, i) => {
            return [
                [h.name],
                [table.value.body[i]],
                [
                    !Number.isFinite(table.value.body[i] / grandTotal.value)
                        ? '-'
                        : (table.value.body[i] / grandTotal.value) * 100,
                ],
            ];
        });
        const tableXls = [
            [cfgChart.value.title.text],
            [cfgChart.value.title.subtitle.text],
            [
                [FINAL_CONFIG.value.table.columnNames.series],
                [FINAL_CONFIG.value.table.columnNames.value],
                [FINAL_CONFIG.value.table.columnNames.percentage],
            ],
        ].concat(labels);
        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({
                csvContent,
                title: cfgChart.value.title.text || 'vue-ui-rings',
            });
        } else {
            callback(csvContent);
        }
    });
}

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

function toggleLabels() {
    mutableConfig.value.showLabels = !showLabels.value;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

const getImage = createChartImageGetter(
    ringsChart,
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
        parent: ringsChart,
        maxWidth: 800,
        isCursorPointer,
    }),
);

watch(
    [
        () => mutableConfig.value.showTable,
        tableUnit,
        () => FINAL_CONFIG.value.table.useDialog,
    ],
    ([visible]) => {
        if (tableUnit.value)
            syncTableVisibility(visible, FINAL_CONFIG, tableUnit);
    },
    { flush: 'post' },
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
const svgLegend = computed(() => cfgChart.value.legend);
const svgTitle = computed(() => cfgChart.value.title);

const { isCallbackImaging, isCallbackSvg, generateSvg, onGenerateImage } =
    useChartExport({
        svg: svgRef,
        title: svgTitle,
        legend: svgLegend,
        legendItems: svgLegendItems,
        backgroundColor: svgBg,
        getSvgCallback: () => FINAL_CONFIG.value.userOptions.callbacks.svg,
        generateImage,
    });

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: convertedDataset.value,
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
            dataset: convertedDataset.value,
        }),
    );
}

/***************************************************************************************************
 * a11y
 **************************************************************************************************/
function onSvgFocus() {
    clearTooltip();
    isFocus.value = true;
}

function onSvgBlur() {
    clearTooltip();
    isFocus.value = false;
}

function onSvgKeydown(event) {
    if (!svgRef.value || isAnnotator.value || loading.value) return;
    if (document.activeElement !== svgRef.value) return;
    if (!convertedDataset.value.length) return;
    if (segregated.value.length === props.dataset.length) return;

    const isPreviousKey = ['ArrowLeft', 'ArrowUp'].includes(event.key);
    const isNextKey = ['ArrowRight', 'ArrowDown'].includes(event.key);
    const isActivationKey = event.key === 'Enter' || event.key === ' ';
    const isEscapeKey = event.key === 'Escape';

    if (!isPreviousKey && !isNextKey && !isActivationKey && !isEscapeKey)
        return;

    event.preventDefault();
    event.stopPropagation();

    if (isEscapeKey) {
        clearTooltip();
        return;
    }

    if (isActivationKey) {
        if (activeTooltipIndex.value === null) return;

        const datapoint = convertedDataset.value[activeTooltipIndex.value];
        if (!datapoint) return;

        onTrapClick(datapoint, activeTooltipIndex.value);
        return;
    }

    let nextIndex = activeTooltipIndex.value;

    if (
        nextIndex === null ||
        nextIndex < 0 ||
        nextIndex >= convertedDataset.value.length
    ) {
        nextIndex = isNextKey ? 0 : convertedDataset.value.length - 1;
    } else if (isNextKey) {
        nextIndex += 1;
        if (nextIndex >= convertedDataset.value.length) {
            nextIndex = 0;
        }
    } else if (isPreviousKey) {
        nextIndex -= 1;
        if (nextIndex < 0) {
            nextIndex = convertedDataset.value.length - 1;
        }
    }

    const datapoint = convertedDataset.value[nextIndex];
    if (!datapoint) return;

    setKeyboardTooltipPositionFromIndex(nextIndex);
    useTooltip(datapoint, nextIndex, 'keyboard');
}

function setKeyboardTooltipPositionFromIndex(index) {
    if (!Number.isFinite(index)) return;
    if (!svgRef.value) return;

    const ring = convertedDataset.value[index];
    if (!ring) return;

    const marker = getMarkerCoordinates(ring, index);

    const box = svgRef.value.getBoundingClientRect();

    tooltipA11yPosition.value = {
        x: box.left + (marker.x / svg.value.width) * box.width,
        y: box.top + (marker.y / svg.value.height) * box.height,
    };
}

watch(
    [convertedDataset, svg, CENTER, cfgTooltip, () => FINAL_CONFIG.value],
    () => {
        if (selectedUid.value === null) return;
        const index = convertedDataset.value.findIndex(
            (ring) => ring.uid === selectedUid.value,
        );
        if (loading.value || index < 0) {
            clearTooltip();
            return;
        }
        if (tooltipTriggerMode.value === 'keyboard')
            setKeyboardTooltipPositionFromIndex(index);
        useTooltip(
            convertedDataset.value[index],
            index,
            tooltipTriggerMode.value,
            false,
        );
    },
    { flush: 'post' },
);

// Formatting and geometry stay cached during hover; public datapoint payloads remain unchanged.
const ringLabels = computed(() => convertedDataset.value.map(getRingLabel));
const ringGeometry = computed(() =>
    convertedDataset.value.map((ring, i) => ({
        radius: getRadius(ring),
        y: getY(ring, i),
        marker: getMarkerCoordinates(ring, i),
    })),
);

const a11yTable = computed(() => {
    const headers = dataTable.value?.colNames ?? [];
    const rows = dataTable.value?.a11yBody ?? [];
    return { headers, rows };
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
    toggleLabels,
    copyAlt,
});
</script>

<template>
    <div
        ref="ringsChart"
        :class="`vue-data-ui-component vue-ui-rings ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};text-align:center;width:100%;background:${cfgChart.backgroundColor};${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`"
        :id="`rings_${uid}`"
        @mouseleave="
            clearTooltip();
            setUserOptionsVisibility(false);
        "
        @mouseenter="() => setUserOptionsVisibility(true)"
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

        <div
            ref="chartTitle"
            v-if="cfgChart.title.text"
            :style="`width:100%;background:transparent`"
        >
            <Title
                :config="{
                    title: {
                        cy: 'rings-div-title',
                        ...cfgChart.title,
                    },
                    subtitle: {
                        cy: 'rings-div-subtitle',
                        ...cfgChart.title.subtitle,
                    },
                }"
            />
        </div>

        <div :id="`legend-top-${uid}`" />

        <!-- USER OPTIONS -->
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
            :isTooltip="mutableConfig.showTooltip"
            :isFullscreen="isFullscreen"
            :chartElement="ringsChart"
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
            @toggleTooltip="toggleTooltip"
            @toggleAnnotator="toggleAnnotator"
            @toggleLabels="toggleLabels"
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

        <!-- CHART -->
        <div style="position: relative">
            <svg
                ref="svgRef"
                :xmlns="XMLNS"
                :class="{
                    'vue-data-ui-fullscreen--on': isFullscreen,
                    'vue-data-ui-fulscreen--off': !isFullscreen,
                    resizing: resizing || loading,
                    'vue-data-ui-no-transition': !transitionEnabled,
                }"
                data-cy="rings-svg"
                :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`"
                :style="`max-width:100%;overflow:hidden;background:transparent;color:${cfgChart.color}`"
                :aria-describedby="`chart-instructions-${uid}`"
                tabindex="0"
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

                <!-- BACKGROUND SLOT -->
                <foreignObject
                    v-if="$slots['chart-background']"
                    :x="0"
                    :y="0"
                    :width="svg.width <= 0 ? 10 : svg.width"
                    :height="svg.height <= 0 ? 10 : svg.height"
                    :style="{
                        pointerEvents: 'none',
                    }"
                >
                    <slot name="chart-background" />
                </foreignObject>

                <!-- DEFS  -->
                <defs>
                    <DefGrad
                        t="radial"
                        cx="50%"
                        cy="30%"
                        r="50%"
                        fx="50%"
                        fy="50%"
                        v-for="(d, i) in convertedDataset"
                        :id="`gradient_${uid}_${i}`"
                        :key="`gradient_${uid}_${i}`"
                        :stops="[
                            [
                                '0%',
                                setOpacity(
                                    shiftHue(d.color, 0.05),
                                    100 - cfgRings.gradient.intensity,
                                ),
                                1,
                            ],
                            ['100%', d.color, 1],
                        ]"
                    />
                </defs>

                <g v-if="$slots.pattern">
                    <defs v-for="ring in datasetCopy">
                        <slot
                            name="pattern"
                            v-bind="{
                                seriesIndex: ring.absoluteIndex,
                                patternId: `pattern_${uid}_${ring.absoluteIndex}`,
                            }"
                        />
                    </defs>
                </g>

                <!-- RINGS -->
                <g
                    v-for="(ring, i) in convertedDataset"
                    :key="`r_${ring.uid}`"
                    data-cy="ring-group"
                    @animationend.self="finishEntryAnimation(ring.uid)"
                    :class="{
                        'vue-rings-item-onload':
                            FINAL_CONFIG.useCssAnimation &&
                            FINAL_CONFIG.transitions.enable &&
                            !loading &&
                            !finishedEntryAnimations.has(ring.uid),
                    }"
                    :style="{
                        transformOrigin: `${CENTER.x}px ${baseline}px`,
                        animationDelay: `${(convertedDataset.length - 1 - i) * 100}ms`,
                    }"
                >
                    <circle
                        data-cy="ring-underlayer"
                        :class="{
                            'vue-data-ui-transition': transitionEnabled,
                            'vue-ui-rings-opacity':
                                FINAL_CONFIG.useBlurOnHover &&
                                selectedSerie !== null &&
                                selectedSerie !== i,
                        }"
                        :stroke="cfgRings.stroke"
                        :cx="CENTER.x"
                        :cy="ringGeometry[i].y"
                        :r="ringGeometry[i].radius"
                        :fill="cfgRings.gradient.underlayerColor"
                    />

                    <circle
                        data-cy="ring"
                        :class="{
                            'vue-data-ui-transition': transitionEnabled,
                            'vue-ui-rings-shadow': cfgRings.useShadow,
                            'vue-ui-rings-blur':
                                FINAL_CONFIG.useBlurOnHover &&
                                selectedSerie !== null &&
                                selectedSerie !== i,
                        }"
                        :stroke="cfgRings.stroke"
                        :stroke-width="
                            ring.strokeWidth < 0.5 ? 0.5 : ring.strokeWidth
                        "
                        :cx="CENTER.x"
                        :cy="ringGeometry[i].y"
                        :r="ringGeometry[i].radius"
                        :fill="
                            cfgRings.gradient.show
                                ? `url(#gradient_${uid}_${i})`
                                : ring.color
                        "
                    />

                    <circle
                        v-if="$slots.pattern"
                        :data-cy="`ring-pattern-${i}`"
                        :class="{
                            'vue-data-ui-transition': transitionEnabled,
                            'vue-ui-rings-shadow': cfgRings.useShadow,
                            'vue-ui-rings-blur':
                                FINAL_CONFIG.useBlurOnHover &&
                                selectedSerie !== null &&
                                selectedSerie !== i,
                        }"
                        :stroke="cfgRings.stroke"
                        :stroke-width="
                            ring.strokeWidth < 0.5 ? 0.5 : ring.strokeWidth
                        "
                        :cx="CENTER.x"
                        :cy="ringGeometry[i].y"
                        :r="ringGeometry[i].radius"
                        :fill="`url(#pattern_${uid}_${ring.absoluteIndex})`"
                    />

                    <circle
                        data-cy="tooltip-trap"
                        stroke="none"
                        :cx="CENTER.x"
                        :cy="ringGeometry[i].y"
                        :r="ringGeometry[i].radius"
                        fill="transparent"
                        @mouseenter="useTooltip(ring, i, 'pointer')"
                        @mouseleave="onTrapLeave(ring, i)"
                        @click="onTrapClick(ring, i)"
                    />

                    <!-- DATA LABELS -->
                    <template v-if="showLabels">
                        <rect
                            :x="
                                cfgLabels.dataLabels.markers.position === 'left'
                                    ? ringGeometry[i].marker.x
                                    : CENTER.x
                            "
                            :y="
                                ringGeometry[i].marker.y -
                                cfgLabels.dataLabels.markers.strokeWidth / 2
                            "
                            :width="
                                Math.abs(CENTER.x - ringGeometry[i].marker.x)
                            "
                            :height="cfgLabels.dataLabels.markers.strokeWidth"
                            :fill="cfgLabels.dataLabels.markers.stroke"
                            :rx="cfgLabels.dataLabels.markers.strokeWidth"
                            :class="{
                                'vue-data-ui-transition': transitionEnabled,
                                'vue-ui-rings-shadow': cfgRings.useShadow,
                                'vue-ui-rings-blur':
                                    FINAL_CONFIG.useBlurOnHover &&
                                    selectedSerie !== null &&
                                    selectedSerie !== i,
                            }"
                        />

                        <circle
                            :cx="ringGeometry[i].marker.x"
                            :cy="ringGeometry[i].marker.y"
                            :r="cfgLabels.dataLabels.markers.radius"
                            :fill="ring.color"
                            :stroke="cfgChart.backgroundColor"
                            :class="{
                                'vue-data-ui-transition': transitionEnabled,
                                'vue-ui-rings-shadow': cfgRings.useShadow,
                                'vue-ui-rings-blur':
                                    FINAL_CONFIG.useBlurOnHover &&
                                    selectedSerie !== null &&
                                    selectedSerie !== i,
                            }"
                        />

                        <text
                            :text-anchor="
                                cfgLabels.dataLabels.markers.position === 'left'
                                    ? 'end'
                                    : 'start'
                            "
                            :font-size="cfgLabels.dataLabels.fontSize"
                            :fill="cfgLabels.dataLabels.color"
                            :font-weight="
                                cfgLabels.dataLabels.bold ? 'bold' : 'normal'
                            "
                            :class="{
                                'vue-data-ui-transition': transitionEnabled,
                                'vue-ui-rings-shadow': cfgRings.useShadow,
                                'vue-ui-rings-blur':
                                    FINAL_CONFIG.useBlurOnHover &&
                                    selectedSerie !== null &&
                                    selectedSerie !== i,
                            }"
                            :transform="`translate(${
                                ringGeometry[i].marker.x +
                                (cfgLabels.dataLabels.markers.position ===
                                'left'
                                    ? -cfgLabels.dataLabels.offsetX - 14
                                    : cfgLabels.dataLabels.offsetX) +
                                6
                            }, ${
                                ringGeometry[i].marker.y +
                                cfgLabels.dataLabels.fontSize / 3
                            })`"
                            @mouseenter="useTooltip(ring, i, 'pointer')"
                            @mouseleave="onTrapLeave(ring, i)"
                            @click="onTrapClick(ring, i)"
                            v-html="
                                createTSpansFromLineBreaksOnX({
                                    content: ringLabels[i],
                                    fontSize: cfgLabels.dataLabels.fontSize,
                                    fill: cfgLabels.dataLabels.color,
                                    x: 0,
                                    y: 0,
                                    translateY: true,
                                })
                            "
                        />
                    </template>
                </g>
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
            v-if="readyTeleport && (cfgChart.legend.show || $slots.legend)"
            :to="
                cfgChart.legend.position === 'top'
                    ? `#legend-top-${uid}`
                    : `#legend-bottom-${uid}`
            "
        >
            <div ref="chartLegend">
                <slot name="legend" v-bind:legend="legendSet">
                    <Legend
                        v-if="cfgChart.legend.show"
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
                                :fill="`url(#pattern_${uid}_${legend.absoluteIndex})`"
                            />
                        </template>

                        <template #item="{ legend, index }">
                            <div
                                data-cy="legend-item"
                                @click="segregate(legend.uid)"
                                :style="`opacity:${segregated.includes(legend.uid) ? 0.5 : 1}`"
                                v-if="!loading"
                            >
                                {{ legend.display }}
                            </div>
                        </template>

                        <template #legendToggle>
                            <BaseLegendToggle
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
            :fontSize="cfgTooltip.fontSize"
            :backgroundOpacity="cfgTooltip.backgroundOpacity"
            :position="cfgTooltip.position"
            :offsetX="cfgTooltip.offsetX"
            :offsetY="cfgTooltip.offsetY"
            :parent="ringsChart"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="
                cfgTooltip.customFormat &&
                typeof cfgTooltip.customFormat === 'function'
            "
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
            v-if="!loading && isDataset && cfgUserOptions.buttons.table"
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

.vue-ui-rings * {
    transition: unset;
}
.vue-ui-rings {
    user-select: none;
    position: relative;
}

.vue-ui-rings-shadow {
    filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.15));
}
.vue-ui-rings-blur {
    filter: blur(3px) opacity(50%) grayscale(100%);
    transition: all 0.15s ease-in-out;
}

.vue-ui-rings-opacity {
    opacity: 0.3;
    transition: opacity 0.15s ease-in-out;
}

.vue-rings-item-onload {
    transform-box: view-box;
    animation: ring-appear 0.5s ease-out both;
    will-change: transform;
}

.vue-rings-item-onload * {
    transition: none !important;
}

@keyframes ring-appear {
    from {
        transform: scale(0);
    }
    to {
        transform: scale(1);
    }
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
    transition:
        cx 0.12s ease-out,
        cy 0.12s ease-out,
        r 0.12s ease-out,
        stroke-width 0.12s ease-out,
        fill 0.12s ease-out,
        filter 0.2s ease-in-out,
        opacity 0.2s ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
    .vue-data-ui-component * {
        transition: none !important;
        animation: none !important;
    }
}

.vue-data-ui-no-transition * {
    transition: none !important;
}
</style>
