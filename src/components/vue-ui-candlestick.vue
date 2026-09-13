<script setup>
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
    watchEffect,
} from 'vue';
import {
    buildDisplayedTimeLabels,
    calculateNiceScale,
    checkNaN,
    createCsvContent,
    createUid,
    dataLabel,
    deepClone,
    downloadCsv,
    error,
    functionReturnsString,
    getEffectiveTimeLabelModulo,
    getImageDimensions,
    hasDeepProperty,
    isFunction,
    objectIsEmpty,
    setOpacity,
    shiftHue,
    translateSize,
    treeShake,
    XMLNS,
} from '../lib';
import { throttle } from '../canvas-lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { useLocale } from '../useLocale.js';
import { usePrinter } from '../usePrinter';
import { useLoading } from '../useLoading.js';
import { useDateTime } from '../useDateTime.js';
import { useNestedProp } from '../useNestedProp';
import { useResponsive } from '../useResponsive';
import { useTimeLabels } from '../useTimeLabels';
import { useThemeCheck } from '../useThemeCheck.js';
import { useChartExport } from '../useChartExport.js';
import { useTransitions } from '../useTransitions.js';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import { useTimeLabelCollision } from '../useTimeLabelCollider';
import img from '../img';
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import themes from '../themes/vue_ui_candlestick.json';
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import SlicerPreview from '../atoms/SlicerPreview.vue'; // Must be ready in responsive mode
import DefGrad from '../atoms/DefGrad.vue';

const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
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

const { vue_ui_candlestick: DEFAULT_CONFIG } = useConfig();
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
    selectedXIndex: {
        type: Number,
        default: undefined,
    },
});

const emit = defineEmits(['selectX', 'copyAlt']);

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

const isLoaded = ref(false);
const to = ref(null);
const uid = ref(createUid());
const isTooltip = ref(false);
const tooltipContent = ref('');
const hoveredIndex = ref(undefined);
const step = ref(0);
const candlestickChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const chartSlicer = ref(null);
const source = ref(null);
const noTitle = ref(null);
const slicerStep = ref(0);
const tableStep = ref(0);
const titleStep = ref(0);
const scaleLabels = ref(null);
const timeLabelsEls = ref(null);
const tableUnit = ref(null);
const userOptionsRef = ref(null);
const selectedMinimapIndex = ref(null);

const activeTooltipIndex = ref(null); // a11y
const tooltipA11yPosition = ref({ x: 0, y: 0 }); // a11y
const tooltipTriggerMode = ref('pointer'); // a11y
const isFocus = ref(false); // a11y

const FINAL_CONFIG = ref(prepareConfig());
const candleCfg = computed(() => FINAL_CONFIG.value.style.layout.candle);
const gridCfg = computed(() => FINAL_CONFIG.value.style.layout.grid);
const layoutCfg = computed(() => FINAL_CONFIG.value.style.layout);
const styleCfg = computed(() => FINAL_CONFIG.value.style);
const cfgUserOptions = computed(() => FINAL_CONFIG.value.userOptions);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiCandlestick',
    rules: [
        COMMON_RULES.emptyArray,
        {
            test: (dataset) => dataset.length > 200,
            message: [
                '👀 Dataset has > 200 points, which can cause performance issues. Consider:',
                '',
                '▶️ Adding date inputs to constraint the dataset into a specific timeframe',
                '',
                '▶️ Aggregate the data to larger time series to reduce the number of datapoints.',
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
            useCssAnimation: false,
            userOptions: { show: false },
            table: { show: false },
            style: {
                backgroundColor: '#99999930',
                layout: {
                    candle: {
                        colors: {
                            bearish: '#BABABA',
                            bullish: '#CACACA',
                        },
                    },
                    grid: {
                        stroke: '#6A6A6A',
                        verticalLines: {
                            stroke: '#6A6A6A',
                        },
                        horizontalLines: {
                            stroke: '#6A6A6A',
                        },
                        yAxis: {
                            dataLabels: { show: false },
                            scale: {
                                min: null,
                                max: null,
                            },
                        },
                    },
                    wick: {
                        stroke: '#6A6A6A',
                        extremity: {
                            color: '#6A6A6A',
                        },
                    },
                },
                tooltip: { show: false },
                zoom: {
                    show: false,
                    startIndex: null,
                    endIndex: null,
                },
            },
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {},
    });
});

// v3 - Skeleton loader management
const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    callback: () => {
        Promise.resolve().then(async () => {
            await setupSlicer();
        });
    },
    skeletonDataset: props.config?.skeletonDataset ?? [
        [1704067200000, 10, 20, 2, 10, 30],
        [1706745600000, 10, 30, 5, 20, 50],
        [1709251200000, 20, 50, 10, 30, 80],
        [1711929600000, 30, 80, 20, 50, 130],
        [1714521600000, 50, 130, 30, 100, 210],
        [1717200000000, 80, 210, 50, 150, 340],
        [1719792000000, 130, 340, 80, 280, 550],
        [1722470400000, 210, 550, 130, 450, 890],
        [1725148800000, 340, 890, 210, 750, 1440],
        [1727740800000, 550, 1440, 340, 1230, 2330],
        [1730419200000, 890, 2330, 550, 1950, 3770],
        [1733011200000, 1440, 3770, 890, 3200, 5100],
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value,
    }),
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } =
    useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({
    config: styleCfg.value.title,
});

function onChartEnter() {
    setUserOptionsVisibility(true);
}

function onChartLeave() {
    setUserOptionsVisibility(false);
    emit('selectX', { seriesIndex: null, datapoint: null });
    hoveredIndex.value = null;
}

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG,
    });

    let finalConfig = {};

    if (
        props.config &&
        hasDeepProperty(
            props.config,
            'style.layout.grid.xAxis.dataLabels.showFirstAndLast',
        )
    ) {
        mergedConfig.style.layout.grid.xAxis.dataLabels.showFirstAndLast =
            !!props.config.style.layout.grid.xAxis.dataLabels.showFirstAndLast;
    }

    const theme = mergedConfig.theme;

    if (theme) {
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
            };
        }
    } else {
        finalConfig = mergedConfig;
    }

    return finalConfig;
}

watch(
    () => props.config,
    (_newCfg) => {
        if (!loading.value) {
            FINAL_CONFIG.value = prepareConfig();
        }
        userOptionsVisible.value =
            !FINAL_CONFIG.value.userOptions.showOnChartHover;
        prepareChart();
        slicerStep.value += 1;
        titleStep.value += 1;
        tableStep.value += 1;

        // Reset mutable config
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        mutableConfig.value.showTooltip = styleCfg.value.tooltip.show;

        normalizeSlicerWindow();
    },
    { deep: true },
);

watch(
    () => props.dataset,
    (newDs) => {
        if (Array.isArray(newDs) && newDs.length > 0) {
            manualLoading.value = false;
        }
        refreshSlicer();
    },
    { deep: true },
);

const svg = ref({
    height: styleCfg.value.height,
    width: styleCfg.value.width,
    xAxisFontSize: gridCfg.value.xAxis.dataLabels.fontSize,
    yAxisFontSize: gridCfg.value.yAxis.dataLabels.fontSize,
});

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

onMounted(() => {
    prepareChart();
});

const debug = computed(() => FINAL_CONFIG.value.debug);

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiCandlestick',
            type: 'dataset',
            debug: debug.value,
        });
        manualLoading.value = true; // v3
    }

    // v3
    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    setTimeout(() => {
        isLoaded.value = true;
    }, 10);

    if (FINAL_CONFIG.value.responsive) {
        const additionalPad = 12;
        const handleResize = throttle(() => {
            isLoaded.value = false;
            const { width, height } = useResponsive({
                chart: candlestickChart.value,
                title: styleCfg.value.title.text ? chartTitle.value : null,
                slicer:
                    styleCfg.value.zoom.show && len.value > 6
                        ? chartSlicer.value.$el
                        : null,
                legend: chartLegend.value,
                source: source.value,
                noTitle: noTitle.value,
            });

            requestAnimationFrame(() => {
                svg.value.width = width;
                svg.value.height = height - additionalPad;
                if (FINAL_CONFIG.value.responsiveProportionalSizing) {
                    svg.value.xAxisFontSize = translateSize({
                        relator: Math.min(width, height),
                        adjuster: styleCfg.value.width,
                        source: gridCfg.value.xAxis.dataLabels.fontSize,
                        threshold: 6,
                        fallback: 6,
                    });
                    svg.value.yAxisFontSize = translateSize({
                        relator: Math.min(width, height),
                        adjuster: styleCfg.value.width,
                        source: gridCfg.value.yAxis.dataLabels.fontSize,
                        threshold: 6,
                        fallback: 6,
                    });
                } else {
                    svg.value.xAxisFontSize =
                        gridCfg.value.xAxis.dataLabels.fontSize;
                    svg.value.yAxisFontSize =
                        gridCfg.value.yAxis.dataLabels.fontSize;
                }
                if (to.value) clearTimeout(to.value);
                to.value = setTimeout(() => {
                    isLoaded.value = true;
                }, 10);
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = candlestickChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }
    setupSlicer();
}

onBeforeUnmount(() => {
    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-candlestick_${uid.value}`,
    fileName: styleCfg.value.title.text || 'vue-ui-candlestick',
    options: FINAL_CONFIG.value.userOptions.print,
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !styleCfg.value.title.text;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: styleCfg.value.tooltip.show,
});

const timeLabelsHeight = ref(0);

const updateHeight = throttle((h) => {
    timeLabelsHeight.value = h;
}, 100);

// Track time label height to update drawing area when they rotate
watchEffect((onInvalidate) => {
    const el = timeLabelsEls.value;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
        updateHeight(entries[0].contentRect.height);
    });
    observer.observe(el);
    onInvalidate(() => observer.disconnect());
});

onBeforeUnmount(() => {
    timeLabelsHeight.value = 0;
});

const timeLabelsY = computed(() => {
    let tlH = 0;
    if (timeLabelsEls.value) {
        tlH = timeLabelsHeight.value + svg.value.xAxisFontSize;
    }
    return tlH;
});

const yAxisLabelsAreRight = computed(() => {
    return gridCfg.value.yAxis.position === 'right';
});

function getScaleLabelX() {
    let scaleLabelsWidth = gridCfg.value.yAxis.dataLabels.offsetX;

    if (scaleLabels.value) {
        const texts = Array.from(scaleLabels.value.querySelectorAll('text'));

        scaleLabelsWidth = texts.reduce((max, textElement) => {
            const width = textElement.getComputedTextLength();
            return width > max ? width : max;
        }, 0);
    }

    const crosshair = 13;

    const yAxisNameWidth = gridCfg.value.yAxis.axisName?.show
        ? gridCfg.value.yAxis.axisName.fontSize +
          gridCfg.value.yAxis.axisName.offsetX
        : 0;

    const total = scaleLabelsWidth + crosshair + yAxisNameWidth;

    return {
        left: yAxisLabelsAreRight.value ? 0 : total,
        right: yAxisLabelsAreRight.value ? total : 0,
        scaleLabelsWidth,
        yAxisNameWidth,
        crosshair,
    };
}

const drawingArea = computed(() => {
    const {
        top: pt,
        right: pr,
        bottom: pb,
        left: pl,
    } = layoutCfg.value.padding;

    const scaleLabelX = getScaleLabelX();
    const topOffset = 12;

    return {
        top: pt + topOffset,
        right: svg.value.width - pr - scaleLabelX.right,
        left: pl + scaleLabelX.left,
        bottom: svg.value.height - pb - timeLabelsY.value,
        width: svg.value.width - pl - pr - scaleLabelX.left - scaleLabelX.right,
        height: svg.value.height - pt - pb - timeLabelsY.value - topOffset,
        scaleLabelsWidth: scaleLabelX.scaleLabelsWidth,
        yAxisNameWidth: scaleLabelX.yAxisNameWidth,
        crosshair: scaleLabelX.crosshair,
    };
});

const precogRect = computed(() => {
    const { left, top, width: totalWidth, height } = drawingArea.value;
    const windowStart = slicer.value.start;
    const windowEnd = slicer.value.end;
    const windowLen = windowEnd - windowStart;
    const unit = totalWidth / windowLen;

    const rawStart = slicerPrecog.value.start - windowStart;
    const rawEnd = slicerPrecog.value.end - windowStart;
    const relStart = Math.max(0, Math.min(windowLen, rawStart));
    const relEnd = Math.max(0, Math.min(windowLen, rawEnd));

    return {
        x: left + relStart * unit,
        y: top,
        width: (relEnd - relStart) * unit,
        height,
        fill: styleCfg.value.zoom.preview.fill,
        stroke: styleCfg.value.zoom.preview.stroke,
        ['stroke-width']: styleCfg.value.zoom.preview.strokeWidth,
        ['stroke-dasharray']: styleCfg.value.zoom.preview.strokeDasharray,
        ['stroke-linecap']: 'round',
        ['stroke-linejoin']: 'round',
        style: {
            pointerEvents: 'none',
            transition: 'none !important',
            animation: 'none !important',
        },
    };
});

const len = computed(() => FINAL_DATASET.value.length);

const slicer = ref({
    start: 0,
    end: len.value,
});

const slicerPrecog = ref({ start: 0, end: len.value });

const isPrecog = computed(() => {
    return (
        styleCfg.value.zoom.preview.enable &&
        (slicerPrecog.value.start !== slicer.value.start ||
            slicerPrecog.value.end !== slicer.value.end)
    );
});

function setPrecog(side, val) {
    slicerPrecog.value[side] = val;
}

function normalizeSlicerWindow() {
    let s = Math.max(0, Math.min(slicer.value.start ?? 0, len.value - 1));
    let e = Math.max(s + 1, Math.min(slicer.value.end ?? len.value, len.value));

    if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) {
        s = 0;
        e = len.value;
    }

    slicer.value.start = s;
    slicer.value.end = e;
    slicerPrecog.value.start = s;
    slicerPrecog.value.end = e;

    if (chartSlicer.value) {
        chartSlicer.value.setStartValue(s);
        chartSlicer.value.setEndValue(e);
    }
}

const absoluteDataset = computed(() => {
    return FINAL_DATASET.value.map((ds, i) => {
        return {
            ...ds,
            absoluteIndex: i,
        };
    });
});

const mutableDataset = computed(() => {
    return absoluteDataset.value.slice(slicer.value.start, slicer.value.end);
});

const datasetBreakdown = computed(() => {
    if (debug.value) {
        FINAL_DATASET.value.forEach((ds, i) => {
            if ([null, undefined].includes(ds[0])) {
                error({
                    componentName: 'VueUiCandlestick',
                    type: 'datasetAttribute',
                    property: 'period (index 0)',
                    index: i,
                });
            }
            if ([null, undefined].includes(ds[1])) {
                error({
                    componentName: 'VueUiCandlestick',
                    type: 'datasetAttribute',
                    property: 'open (index 1)',
                    index: i,
                });
            }
            if ([null, undefined].includes(ds[2])) {
                error({
                    componentName: 'VueUiCandlestick',
                    type: 'datasetAttribute',
                    property: 'high (index 2)',
                    index: i,
                });
            }
            if ([null, undefined].includes(ds[3])) {
                error({
                    componentName: 'VueUiCandlestick',
                    type: 'datasetAttribute',
                    property: 'low (index 3)',
                    index: i,
                });
            }
            if ([null, undefined].includes(ds[4])) {
                error({
                    componentName: 'VueUiCandlestick',
                    type: 'datasetAttribute',
                    property: 'close (index 4)',
                    index: i,
                });
            }
            if ([null, undefined].includes(ds[5])) {
                error({
                    componentName: 'VueUiCandlestick',
                    type: 'datasetAttribute',
                    property: 'volume (index 5)',
                    index: i,
                });
            }
        });
    }

    return mutableDataset.value.map((ds) => {
        return {
            absoluteIndex: ds.absoluteIndex,
            period: ds[0],
            open: ds[1],
            high: ds[2],
            low: ds[3],
            close: ds[4],
            volume: ds[5],
        };
    });
});

const minimapSource = computed(() => {
    return absoluteDataset.value.map((ds) => {
        return {
            absoluteIndex: ds.absoluteIndex,
            period: ds[0],
            open: ds[1],
            high: ds[2],
            low: ds[3],
            close: ds[4],
            volume: ds[5],
        };
    });
});

const slot = computed(() => {
    return drawingArea.value.width / mutableDataset.value.length;
});

const extremes = computed(() => {
    const max =
        gridCfg.value.yAxis.scale.max === null
            ? Math.max(...datasetBreakdown.value.map((ds) => ds.high))
            : gridCfg.value.yAxis.scale.max;
    const min =
        gridCfg.value.yAxis.scale.min === null
            ? 0
            : gridCfg.value.yAxis.scale.min;

    return {
        max,
        min,
    };
});

const niceScale = computed(() => {
    return calculateNiceScale(
        extremes.value.min,
        extremes.value.max,
        gridCfg.value.yAxis.dataLabels.steps,
    );
});

function convertToPlot(item, index, dpMax = null, dpMin = null) {
    return {
        ...item,
        x: checkNaN(
            drawingArea.value.left + index * slot.value + slot.value / 2,
        ),
        y: checkNaN(
            drawingArea.value.top +
                (1 -
                    (item - niceScale.value.min) /
                        (niceScale.value.max - niceScale.value.min)) *
                    drawingArea.value.height,
        ),
        value: checkNaN(item),
        isMax: item === dpMax,
        isMin: item === dpMin,
    };
}

const drawableDataset = computed(() => {
    const dpMax = {
        o: Math.max(...datasetBreakdown.value.map((d) => d.open)),
        h: Math.max(...datasetBreakdown.value.map((d) => d.high)),
        l: Math.max(...datasetBreakdown.value.map((d) => d.low)),
        c: Math.max(...datasetBreakdown.value.map((d) => d.low)),
    };
    const dpMin = {
        o: Math.min(...datasetBreakdown.value.map((d) => d.open)),
        h: Math.min(...datasetBreakdown.value.map((d) => d.high)),
        l: Math.min(...datasetBreakdown.value.map((d) => d.low)),
        c: Math.min(...datasetBreakdown.value.map((d) => d.low)),
    };
    const volumeMax = Math.max(...datasetBreakdown.value.map((d) => d.volume));
    const volumeMin = Math.min(...datasetBreakdown.value.map((d) => d.volume));

    return datasetBreakdown.value.map((ds, i) => {
        const open = convertToPlot(ds.open, i, dpMax.o, dpMin.o);
        const high = convertToPlot(ds.high, i, dpMax.h, dpMin.h);
        const low = convertToPlot(ds.low, i, dpMax.l, dpMin.l);
        const close = convertToPlot(ds.close, i, dpMax.c, dpMin.c);
        const isBullish = ds.close > ds.open;
        const isMaxVolume = ds.volume === volumeMax;
        const isMinVolume = ds.volume === volumeMin;
        return {
            period: ds.period,
            open,
            high,
            low,
            close,
            volume: ds.volume,
            isBullish,
            absoluteIndex: ds.absoluteIndex,
            isMaxVolume,
            isMinVolume,
        };
    });
});

function convertToMinimapPlot({ item, index, minimapH, unitW }) {
    const _min = gridCfg.value.yAxis.scale.min ?? 0;
    const _max =
        gridCfg.value.yAxis.scale.max ??
        Math.max(...FINAL_DATASET.value.map((d) => d[2]));
    return {
        ...item,
        x: checkNaN(index * unitW),
        y: checkNaN((1 - (item - _min) / (_max - _min)) * minimapH),
        value: checkNaN(item),
    };
}

const minimapDataset = computed(() => {
    // expose SVG dimensions from Slicer minimap to apply a convertToPlot
    return ({ minimapH, unitW }) =>
        minimapSource.value.map((ds, i) => {
            const open = convertToMinimapPlot({
                item: ds.open,
                index: i,
                minimapH,
                unitW,
            });
            const high = convertToMinimapPlot({
                item: ds.high,
                index: i,
                minimapH,
                unitW,
            });
            const low = convertToMinimapPlot({
                item: ds.low,
                index: i,
                minimapH,
                unitW,
            });
            const close = convertToMinimapPlot({
                item: ds.close,
                index: i,
                minimapH,
                unitW,
            });
            const isBullish = ds.close > ds.open;
            return {
                period: ds.period,
                open,
                high,
                low,
                close,
                volume: ds.volume,
                isBullish,
                absoluteIndex: ds.absoluteIndex,
            };
        });
});

const allMinimaps = computed(() => {
    if (!styleCfg.value.zoom.minimap.show) return [];
    return [
        {
            name: '',
            series: FINAL_DATASET.value.map((d) => d[2]),
            color: '#000000',
            isVisible: true,
        },
    ];
});

function ratioToMax(value) {
    return checkNaN(
        (value - niceScale.value.min) /
            (niceScale.value.max - niceScale.value.min),
    );
}

const yLabels = computed(() => {
    return niceScale.value.ticks.map((t) => {
        return {
            y:
                drawingArea.value.bottom -
                drawingArea.value.height * ratioToMax(t),
            value: checkNaN(t),
        };
    });
});

const xLabels = computed(() => {
    return datasetBreakdown.value.map((ds) => ds.period);
});

const timeLabels = ref([]);
const allTimeLabels = ref([]);
let timeLabelsRequestId = 0;

watchEffect(() => {
    const requestId = ++timeLabelsRequestId;

    (async () => {
        const labels = await useTimeLabels({
            values: FINAL_DATASET.value.map((ds) => ds[0]),
            maxDatapoints: FINAL_DATASET.value.length,
            formatter: gridCfg.value.xAxis.dataLabels.datetimeFormatter,
            start: slicer.value.start,
            end: slicer.value.end,
        });

        if (requestId === timeLabelsRequestId) {
            timeLabels.value = labels;
        }
    })();
});

let allTimeLabelsRequestId = 0;
watchEffect(() => {
    const requestId = ++allTimeLabelsRequestId;

    (async () => {
        const labels = await useTimeLabels({
            values: FINAL_DATASET.value.map((ds) => ds[0]),
            maxDatapoints: FINAL_DATASET.value.length,
            formatter: gridCfg.value.xAxis.dataLabels.datetimeFormatter,
            start: 0,
            end: len.value,
        });

        if (requestId === allTimeLabelsRequestId) {
            allTimeLabels.value = labels;
        }
    })();
});

const localeData = ref({
    months: [],
    shortMonths: [],
    days: [],
    shortDays: [],
});

let localeRequestId = 0;
watchEffect(() => {
    const requestId = ++localeRequestId;
    const xl = gridCfg.value.xAxis.dataLabels.datetimeFormatter;

    (async () => {
        const resolved = await useLocale(xl.locale).catch(() =>
            useLocale('en'),
        );
        if (requestId === localeRequestId) {
            localeData.value = resolved.data;
        }
    })();
});

const preciseTimeFormatter = computed(() => {
    const xl = gridCfg.value.xAxis.dataLabels.datetimeFormatter;

    const dt = useDateTime({
        useUTC: xl.useUTC,
        locale: localeData.value,
        januaryAsYear: xl.januaryAsYear,
    });

    return (absIndex, fmt) => {
        const values = FINAL_DATASET.value.map((ds) => ds[0]);
        const ts = values?.[absIndex];
        if (ts == null) return '';
        return dt.formatDate(new Date(ts), fmt);
    };
});

const preciseAllTimeLabelsTooltip = computed(() => {
    const values = FINAL_DATASET.value.map((ds) => ds[0]) || [];
    return values.map((_, i) => ({
        text: preciseTimeFormatter.value(i, styleCfg.value.tooltip.timeFormat),
        absoluteIndex: i,
    }));
});

const preciseAllTimeLabels = computed(() => {
    const values = FINAL_DATASET.value.map((ds) => ds[0]) || [];
    return values.map((_, i) => ({
        text: preciseTimeFormatter.value(i, styleCfg.value.zoom.timeFormat),
        absoluteIndex: i,
    }));
});

const effectiveModulo = computed(() => {
    const configuredModulo = Math.max(
        1,
        Math.floor(Number(gridCfg.value.xAxis.dataLabels.modulo) || 1),
    );

    const visibleTexts = (timeLabels.value || []).map(
        (label) => label?.text ?? '',
    );

    const allTexts = (allTimeLabels.value || []).map(
        (label) => label?.text ?? '',
    );

    const start = slicer.value.start ?? 0;

    const isZoomed = start > 0 || visibleTexts.length < allTexts.length;

    return getEffectiveTimeLabelModulo({
        configuredModulo,
        visibleTexts,
        allTexts,
        startAbs: start,
        isZoomed,
    });
});

const displayedTimeLabels = computed(() => {
    const cfg = gridCfg.value.xAxis.dataLabels;

    const vis = timeLabels.value || [];
    const all = allTimeLabels.value || [];
    const start = slicer.value.start ?? 0;
    const sel = hoveredIndex.value;
    const maxS = len.value;

    const visTexts = vis.map((label) => label?.text ?? '');

    const allTexts = all.map((label) => label?.text ?? '');

    const displayed = buildDisplayedTimeLabels(
        !!cfg.showOnlyFirstAndLast,
        !!cfg.showOnlyAtModulo,
        effectiveModulo.value,
        visTexts,
        allTexts,
        start,
        sel,
        maxS,
    );

    if (
        !cfg.showFirstAndLast ||
        cfg.showOnlyFirstAndLast ||
        !displayed.length
    ) {
        return displayed;
    }

    const lastIndex = displayed.length - 1;

    return displayed.map((label, i) => {
        if (i !== 0 && i !== lastIndex) {
            return label;
        }

        return {
            ...label,
            text: visTexts[i] ?? '',
        };
    });
});

const slicerLabels = computed(() => {
    if (!gridCfg.value.xAxis.dataLabels.datetimeFormatter.enable) {
        return {
            start: FINAL_DATASET.value[slicer.value.start]
                ? FINAL_DATASET.value[slicer.value.start][0]
                : FINAL_DATASET.value[0][0],
            end: FINAL_DATASET.value[slicer.value.end - 1]
                ? FINAL_DATASET.value[slicer.value.end - 1][0]
                : FINAL_DATASET.value.at(-1)[0],
        };
    } else {
        return {
            start:
                timeLabels.value.find(
                    (el) => el.absoluteIndex === slicer.value.start,
                )?.text ?? '',
            end:
                timeLabels.value.find(
                    (el) => el.absoluteIndex === slicer.value.end - 1,
                )?.text ?? '',
        };
    }
});

const dataTooltipSlot = ref(null);

function selectDatapoint(index, datapoint) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint,
            seriesIndex: index + slicer.value.start,
        });
    }
}

function onTrapLeave(index, datapoint) {
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({
            datapoint,
            seriesIndex: index + slicer.value.start,
        });
    }
    hoveredIndex.value = undefined;
    isTooltip.value = false;
    activeTooltipIndex.value = null;
    tooltipTriggerMode.value = 'pointer';
}

watch(
    () => props.selectedXIndex,
    (v) => {
        if ([null, undefined].includes(props.selectedXIndex)) {
            hoveredIndex.value = null;
            return;
        }

        const targetIndex = v - slicer.value.start;
        if (targetIndex < 0 || v >= slicer.value.end) {
            hoveredIndex.value = null;
        } else {
            hoveredIndex.value = targetIndex ?? null;
        }
    },
    { immediate: true },
);

function useTooltip(index, datapoint, triggerMode = 'pointer') {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({
            datapoint,
            seriesIndex: index + slicer.value.start,
        });
    }

    hoveredIndex.value = index;
    activeTooltipIndex.value = index;
    tooltipTriggerMode.value = triggerMode;

    dataTooltipSlot.value = {
        datapoint,
        seriesIndex: index,
        series: drawableDataset.value,
        config: FINAL_CONFIG.value,
    };

    selectX({ seriesIndex: index, datapoint });

    const customFormat = styleCfg.value.tooltip.customFormat;

    if (
        isFunction(customFormat) &&
        functionReturnsString(() =>
            customFormat({
                seriesIndex: index,
                datapoint,
                series: drawableDataset.value,
                config: FINAL_CONFIG.value,
            }),
        )
    ) {
        tooltipContent.value = customFormat({
            seriesIndex: index,
            datapoint,
            series: drawableDataset.value,
            config: FINAL_CONFIG.value,
        });
    } else {
        if (styleCfg.value.tooltip.show) {
            let html = '';
            const { period, open, high, low, close, volume, isBullish } =
                drawableDataset.value[index];
            const {
                period: tr_period,
                open: tr_open,
                high: tr_high,
                low: tr_low,
                close: tr_close,
                volume: tr_volume,
            } = FINAL_CONFIG.value.translations;

            const timeLabel = !gridCfg.value.xAxis.dataLabels.datetimeFormatter
                .enable
                ? period
                : styleCfg.value.tooltip.useDefaultTimeFormat
                  ? timeLabels.value[index].text
                  : preciseAllTimeLabelsTooltip.value[index].text;

            html += `<div data-cy="candlestick-tooltip-period"><svg style="margin-right:6px" viewBox="0 0 12 12" height="12" width="12"><rect x="0" y="0" height="12" width="12" rx="${candleCfg.value.borderRadius * 3}" stroke="${candleCfg.value.stroke}" stroke-width="${candleCfg.value.strokeWidth}" 
                fill="${
                    candleCfg.value.gradient.show
                        ? isBullish
                            ? `url(#bullish_gradient_${uid.value})`
                            : `url(#bearish_gradient_${uid.value})`
                        : isBullish
                          ? candleCfg.value.colors.bullish
                          : candleCfg.value.colors.bearish
                }"/></svg>${timeLabel}</div>`;
            html += `${tr_volume} : <b data-cy="candlestick-tooltip-volume">${isNaN(volume) ? '-' : Number(volume.toFixed(styleCfg.value.tooltip.roundingValue)).toLocaleString()}</b>`;
            html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid ${styleCfg.value.tooltip.borderColor}">`;

            const label_open = dataLabel({
                p: styleCfg.value.tooltip.prefix,
                v: open.value,
                s: styleCfg.value.tooltip.suffix,
                r: styleCfg.value.tooltip.roundingValue,
            });

            const label_high = dataLabel({
                p: styleCfg.value.tooltip.prefix,
                v: high.value,
                s: styleCfg.value.tooltip.suffix,
                r: styleCfg.value.tooltip.roundingValue,
            });

            const label_low = dataLabel({
                p: styleCfg.value.tooltip.prefix,
                v: low.value,
                s: styleCfg.value.tooltip.suffix,
                r: styleCfg.value.tooltip.roundingValue,
            });

            const label_close = dataLabel({
                p: styleCfg.value.tooltip.prefix,
                v: close.value,
                s: styleCfg.value.tooltip.suffix,
                r: styleCfg.value.tooltip.roundingValue,
            });

            if (styleCfg.value.tooltip.showChart) {
                html += `<div style="width:100%;display:flex;align-items:center;justify-content:center;">
                    <svg viewBox="0 0 100 100" width="100px" style="background: transparent; overflow: visible">
                        <g>
                            <line x1="50" x2="50" y1="20" y2="80" stroke="${datapoint.isBullish ? candleCfg.value.colors.bullish : candleCfg.value.colors.bearish}" stroke-width="2" stroke-linecap="round" />
                            ${
                                datapoint.isBullish
                                    ? `
                                <line x1="45" x2="50" y1="65" y2="65" stroke="${candleCfg.value.colors.bullish}" stroke-width="1.5" stroke-linecap="round" />
                                <line x1="50" x2="55" y1="35" y2="35" stroke="${candleCfg.value.colors.bullish}" stroke-width="1.5" stroke-linecap="round" />
                                <text x="38" y="70" text-anchor="end" fill="${styleCfg.value.tooltip.color}">${label_open}</text>
                                <text x="62" y="40" text-anchor="start" fill="${styleCfg.value.tooltip.color}">${label_close}</text>
                            `
                                    : `
                                <line x1="45" x2="50" y1="35" y2="35" stroke="${candleCfg.value.colors.bearish}" stroke-width="1.5" stroke-linecap="round" />
                                <line x1="50" x2="55" y1="65" y2="65" stroke="${candleCfg.value.colors.bearish}" stroke-width="1.5" stroke-linecap="round" />
                                <text x="40" y="40" text-anchor="end" fill="${styleCfg.value.tooltip.color}">${label_open}</text>
                                <text x="60" y="70" text-anchor="start" fill="${styleCfg.value.tooltip.color}">${label_close}</text>
                            `
                            }
                            <text x="50" y="13" text-anchor="middle" fill="${styleCfg.value.tooltip.color}">${label_high}</text>
                            <text x="50" y="97" text-anchor="middle" fill="${styleCfg.value.tooltip.color}">${label_low}</text>
                        <g>
                    </svg>
                    <div>
                `;
            } else {
                html += `<div>${tr_open}: <b>${label_open}</b></div>`;
                html += `<div>${tr_high}: <b>${label_high}</b></div>`;
                html += `<div>${tr_low}: <b>${label_low}</b></div>`;
                html += `<div>${tr_close}: <b>${label_close}</b></div>`;
            }

            html += `</div>`;

            tooltipContent.value = `<div style="text-align:right">${html}</div>`;
        }
    }
    isTooltip.value = true;
}

const refreshRAF = ref(null);
function nextPaint() {
    return new Promise((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
}

onBeforeUnmount(() => {
    if (refreshRAF.value) cancelAnimationFrame(refreshRAF.value);
});

async function refreshSlicer() {
    setupSlicer();

    // Now this is basically sweeping shit under the rug so it works:
    await nextTick();
    if (refreshRAF.value) cancelAnimationFrame(refreshRAF.value);
    refreshRAF.value = requestAnimationFrame(async () => {
        await nextPaint();
        setupSlicer();
    });
}

const isSettingUp = ref(false);
const slicerReady = ref(false);
const suppressChild = ref(false);

function setupSlicer() {
    if (isSettingUp.value) return;
    isSettingUp.value = true;
    try {
        const { startIndex, endIndex } = styleCfg.value.zoom;
        const max = len.value;

        const start = startIndex != null ? startIndex : 0;
        const end =
            endIndex != null
                ? Math.min(validSlicerEnd(endIndex + 1), max)
                : max;

        suppressChild.value = true;
        slicer.value.start = start;
        slicer.value.end = end;
        slicerPrecog.value.start = start;
        slicerPrecog.value.end = end;
        normalizeSlicerWindow();
        slicerReady.value = true;
    } finally {
        queueMicrotask(() => {
            suppressChild.value = false;
        });
        isSettingUp.value = false;
    }
}

function validSlicerEnd(v) {
    const max = len.value;
    if (v > max) {
        return max;
    }
    if (v < 0 || v < slicer.value.start) {
        if (styleCfg.value.zoom.startIndex !== null) {
            return styleCfg.value.zoom.startIndex + 1;
        } else {
            return 1;
        }
    }
    return v;
}

function generateCsv(callback = null) {
    nextTick(() => {
        const labels = [
            FINAL_CONFIG.value.translations.period,
            FINAL_CONFIG.value.translations.open,
            FINAL_CONFIG.value.translations.high,
            FINAL_CONFIG.value.translations.low,
            FINAL_CONFIG.value.translations.close,
            FINAL_CONFIG.value.translations.volume,
        ];

        const values = drawableDataset.value.map((ds, i) => {
            return [
                !gridCfg.value.xAxis.dataLabels.datetimeFormatter.enable
                    ? ds.period
                    : timeLabels.value[i].text,
                ds.open.value,
                ds.high.value,
                ds.low.value,
                ds.close.value,
                ds.volume,
            ];
        });

        const tableXls = [
            [styleCfg.value.title.text],
            [styleCfg.value.title.subtitle.text],
            [[''], [''], ['']],
        ]
            .concat([labels])
            .concat(values);
        const csvContent = createCsvContent(tableXls);
        if (!callback) {
            downloadCsv({
                csvContent,
                title: styleCfg.value.title.text || 'vue-ui-candlestick',
            });
        } else {
            callback(csvContent);
        }
    });
}

const dataTable = computed(() => {
    const body = drawableDataset.value.map((ds, i) => {
        const timeLabel = gridCfg.value.xAxis.dataLabels.datetimeFormatter
            .enable
            ? (timeLabels.value?.[i]?.text ?? '')
            : ds.period;

        const label_open = dataLabel({
            p: FINAL_CONFIG.value.table.td.prefix,
            v: ds.open.value,
            s: FINAL_CONFIG.value.table.td.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue,
        });
        const label_high = dataLabel({
            p: FINAL_CONFIG.value.table.td.prefix,
            v: ds.high.value,
            s: FINAL_CONFIG.value.table.td.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue,
        });
        const label_low = dataLabel({
            p: FINAL_CONFIG.value.table.td.prefix,
            v: ds.low.value,
            s: FINAL_CONFIG.value.table.td.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue,
        });
        const label_close = dataLabel({
            p: FINAL_CONFIG.value.table.td.prefix,
            v: ds.close.value,
            s: FINAL_CONFIG.value.table.td.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue,
        });

        return [
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" height="12" width="12" style="margin-right: 6px"><rect x="0" y="0" height="12" width="12" rx="${candleCfg.value.borderRadius * 3}" fill="${candleCfg.value.gradient.show ? (ds.isBullish ? `url(#bullish_gradient_${uid.value})` : `url(#bearish_gradient_${uid.value})`) : ds.isBullish ? candleCfg.value.colors.bullish : candleCfg.value.colors.bearish}"/></svg> ${timeLabel}`,
            label_open,
            label_high,
            label_low,
            label_close,
            `${isNaN(ds.volume) ? '-' : ds.volume.toLocaleString()}`,
        ];
    });

    const bodyA11y = drawableDataset.value.map((ds, i) => {
        const timeLabel = gridCfg.value.xAxis.dataLabels.datetimeFormatter
            .enable
            ? (timeLabels.value?.[i]?.text ?? '')
            : ds.period;

        const label_open = dataLabel({
            p: FINAL_CONFIG.value.table.td.prefix,
            v: ds.open.value,
            s: FINAL_CONFIG.value.table.td.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue,
        });
        const label_high = dataLabel({
            p: FINAL_CONFIG.value.table.td.prefix,
            v: ds.high.value,
            s: FINAL_CONFIG.value.table.td.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue,
        });
        const label_low = dataLabel({
            p: FINAL_CONFIG.value.table.td.prefix,
            v: ds.low.value,
            s: FINAL_CONFIG.value.table.td.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue,
        });
        const label_close = dataLabel({
            p: FINAL_CONFIG.value.table.td.prefix,
            v: ds.close.value,
            s: FINAL_CONFIG.value.table.td.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue,
        });

        return [
            timeLabel,
            label_open,
            label_high,
            label_low,
            label_close,
            `${isNaN(ds.volume) ? '-' : ds.volume}`,
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
        FINAL_CONFIG.value.translations.period,
        FINAL_CONFIG.value.translations.open,
        FINAL_CONFIG.value.translations.high,
        FINAL_CONFIG.value.translations.low,
        FINAL_CONFIG.value.translations.last,
        FINAL_CONFIG.value.translations.volume,
    ];

    return { head: colNames, body, bodyA11y, config, colNames };
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

async function getImage({ scale = 2 } = {}) {
    if (!candlestickChart.value) return;
    const { imageUri, base64 } = await img({
        domElement: candlestickChart.value,
        base64: true,
        img: true,
        scale,
    });
    const fallbackRect = candlestickChart.value.getBoundingClientRect();
    const fallbackDimensions = {
        width: fallbackRect.width,
        height: fallbackRect.height,
        aspectRatio: fallbackRect.height
            ? fallbackRect.width / fallbackRect.height
            : 0,
    };
    const imageDimensions =
        (await getImageDimensions(imageUri, scale)) ?? fallbackDimensions;

    return {
        imageUri,
        base64,
        title: styleCfg.value.title.text,
        ...imageDimensions,
    };
}

const WIDTH = computed(() => svg.value.width);
const HEIGHT = computed(() => svg.value.height);

useTimeLabelCollision({
    timeLabelsEls,
    timeLabels,
    slicer,
    configRef: FINAL_CONFIG,
    rotationPath: [
        'style',
        'layout',
        'grid',
        'xAxis',
        'dataLabels',
        'rotation',
    ],
    autoRotatePath: [
        'style',
        'layout',
        'grid',
        'xAxis',
        'dataLabels',
        'autoRotate',
        'enable',
    ],
    isAutoSize: false,
    rotation: gridCfg.value.xAxis.dataLabels.autoRotate.angle,
    width: WIDTH,
    height: HEIGHT,
});

// v3 - Essential to make shifting between loading config and final config work
watch(
    FINAL_CONFIG,
    () => {
        mutableConfig.value = {
            showTable: FINAL_CONFIG.value.table.show,
            showTooltip: styleCfg.value.tooltip.show,
        };
    },
    { immediate: true },
);

const tableComponent = computed(() => {
    const useDialog =
        FINAL_CONFIG.value.table.useDialog && !FINAL_CONFIG.value.table.show;
    const open = mutableConfig.value.showTable;
    return {
        component: useDialog ? BaseDraggableDialog : Accordion,
        title: `${styleCfg.value.title.text}${styleCfg.value.title.subtitle.text ? `: ${styleCfg.value.title.subtitle.text}` : ''}`,
        props: useDialog
            ? {
                  backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
                  color: FINAL_CONFIG.value.table.th.color,
                  headerColor: FINAL_CONFIG.value.table.th.color,
                  headerBg: FINAL_CONFIG.value.table.th.backgroundColor,
                  isFullscreen: isFullscreen.value,
                  fullscreenParent: candlestickChart.value,
                  forcedWidth: Math.min(800, window.innerWidth * 0.8),
                  isCursorPointer: isCursorPointer.value,
              }
            : {
                  hideDetails: true,
                  config: {
                      open,
                      maxHeight: 10000,
                      body: {
                          backgroundColor: styleCfg.value.backgroundColor,
                          color: styleCfg.value.color,
                      },
                      head: {
                          backgroundColor: styleCfg.value.backgroundColor,
                          color: styleCfg.value.color,
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
            if ('close' in tableUnit.value) {
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

const svgBg = computed(() => styleCfg.value.backgroundColor);
const svgTitle = computed(() => styleCfg.value.title);

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

function selectMinimapIndex(i) {
    selectedMinimapIndex.value = i;
}

function onSlicerStart(v) {
    if (isSettingUp.value || suppressChild.value) return;
    if (v === slicer.value.start) return;
    slicer.value.start = v;
    slicerPrecog.value.start = v;
    normalizeSlicerWindow();
}

function onSlicerEnd(v) {
    if (isSettingUp.value || suppressChild.value) return;
    const end = validSlicerEnd(v);
    if (end === slicer.value.end) return;
    slicer.value.end = end;
    slicerPrecog.value.end = end;
    normalizeSlicerWindow();
}

function selectX({ seriesIndex, datapoint }) {
    const index = slicer.value.start + seriesIndex;
    emit('selectX', {
        dataset: datapoint,
        index,
        indexLabel: '',
    });
}

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: drawableDataset.value,
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
            dataset: drawableDataset.value,
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

function onSvgBlur() {
    activeTooltipIndex.value = null;
    tooltipTriggerMode.value = 'pointer';
    isTooltip.value = false;
    hoveredIndex.value = undefined;
    isFocus.value = false;
}

function onSvgKeydown(event) {
    if (!svgRef.value || isAnnotator.value) return;
    if (document.activeElement !== svgRef.value) return;
    if (!drawableDataset.value.length) return;

    const isPreviousKey = event.key === 'ArrowLeft';
    const isNextKey = event.key === 'ArrowRight';
    const isActivationKey = event.key === 'Enter' || event.key === ' ';
    const isEscapeKey = event.key === 'Escape';

    if (!isPreviousKey && !isNextKey && !isActivationKey && !isEscapeKey)
        return;

    event.preventDefault();
    event.stopPropagation();

    if (isEscapeKey) {
        activeTooltipIndex.value = null;
        tooltipTriggerMode.value = 'pointer';
        isTooltip.value = false;
        hoveredIndex.value = undefined;
        return;
    }

    if (isActivationKey) {
        if (activeTooltipIndex.value === null) return;

        const datapoint = drawableDataset.value[activeTooltipIndex.value];
        if (!datapoint) return;

        selectDatapoint(activeTooltipIndex.value, datapoint);
        return;
    }

    let nextIndex = activeTooltipIndex.value;
    const currentHoveredIndex = hoveredIndex.value;

    const hasValidActiveIndex =
        nextIndex !== null &&
        nextIndex >= 0 &&
        nextIndex < drawableDataset.value.length;

    const hasValidHoveredIndex =
        currentHoveredIndex !== null &&
        currentHoveredIndex !== undefined &&
        currentHoveredIndex >= 0 &&
        currentHoveredIndex < drawableDataset.value.length;

    if (!hasValidActiveIndex) {
        if (hasValidHoveredIndex) {
            nextIndex = isNextKey
                ? currentHoveredIndex + 1
                : currentHoveredIndex - 1;

            if (nextIndex >= drawableDataset.value.length) {
                nextIndex = 0;
            }

            if (nextIndex < 0) {
                nextIndex = drawableDataset.value.length - 1;
            }
        } else if (isNextKey) {
            nextIndex = 0;
        } else {
            nextIndex = drawableDataset.value.length - 1;
        }
    } else if (isNextKey) {
        nextIndex += 1;
        if (nextIndex >= drawableDataset.value.length) {
            nextIndex = 0;
        }
    } else if (isPreviousKey) {
        nextIndex -= 1;
        if (nextIndex < 0) {
            nextIndex = drawableDataset.value.length - 1;
        }
    }

    const datapoint = drawableDataset.value[nextIndex];
    if (!datapoint) return;

    setKeyboardTooltipPositionFromIndex(nextIndex);
    useTooltip(nextIndex, datapoint, 'keyboard');
}

function setKeyboardTooltipPositionFromIndex(index) {
    if (!Number.isFinite(index)) return;
    if (!svgRef.value) return;

    const svgX = drawingArea.value.left + slot.value * index + slot.value / 2;
    const svgY = drawingArea.value.top + drawingArea.value.height / 2;

    const box = svgRef.value.getBoundingClientRect();

    tooltipA11yPosition.value = {
        x: box.left + (svgX / svg.value.width) * box.width,
        y: box.top + (svgY / svg.value.height) * box.height,
    };
}

const a11yTable = computed(() => {
    const headers = dataTable.value?.colNames ?? [];
    const rows = dataTable.value?.bodyA11y ?? [];
    return { headers, rows };
});

defineExpose({
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    generateSvg,
    toggleTable,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen,
    copyAlt,
});
</script>

<template>
    <div
        ref="candlestickChart"
        :class="`vue-data-ui-component vue-ui-candlestick ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`"
        :style="`position:relative;font-family:${styleCfg.fontFamily}; text-align:center;background:${styleCfg.backgroundColor}; ${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`"
        :id="`vue-ui-candlestick_${uid}`"
        @mouseenter="onChartEnter"
        @mouseleave="onChartLeave"
    >
        <!-- A11Y -->
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
            v-if="cfgUserOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="styleCfg.backgroundColor"
            :color="styleCfg.color"
            :active="isAnnotator"
            :isCursorPointer="isCursorPointer"
            :palette="cfgUserOptions.annotatorPalette"
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

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle"
            class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div
            ref="chartTitle"
            v-if="styleCfg.title.text"
            :style="`width:100%;background:transparent`"
        >
            <!-- TITLE AS DIV -->
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'candlestick-div-title',
                        ...styleCfg.title,
                    },
                    subtitle: {
                        cy: 'candlestick-div-subtitle',
                        ...styleCfg.title.subtitle,
                    },
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="userOptionsRef"
            :key="`user_options_${step}`"
            v-if="
                cfgUserOptions.show &&
                isDataset &&
                (keepUserOptionState ? true : userOptionsVisible)
            "
            :backgroundColor="styleCfg.backgroundColor"
            :color="styleCfg.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :uid="uid"
            :hasTooltip="
                cfgUserOptions.buttons.tooltip && styleCfg.tooltip.show
            "
            :hasPdf="cfgUserOptions.buttons.pdf"
            :hasImg="cfgUserOptions.buttons.img"
            :hasSvg="cfgUserOptions.buttons.svg"
            :hasXls="cfgUserOptions.buttons.csv"
            :hasTable="cfgUserOptions.buttons.table"
            :hasFullscreen="cfgUserOptions.buttons.fullscreen"
            :hasAltCopy="cfgUserOptions.buttons.altCopy"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...cfgUserOptions.buttonTitles }"
            :chartElement="candlestickChart"
            :position="cfgUserOptions.position"
            :hasAnnotator="cfgUserOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="cfgUserOptions.callbacks"
            :printScale="cfgUserOptions.print.scale"
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
                template
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
                :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`"
                :style="`max-width:100%;overflow:visible;background:transparent;color:${styleCfg.color}`"
                tabindex="0"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
            >
                <PackageVersion />

                <!-- BACKGROUND SLOT -->
                <foreignObject
                    v-if="$slots['chart-background']"
                    :x="drawingArea.left"
                    :y="drawingArea.top"
                    :width="Math.max(0.1, drawingArea.width)"
                    :height="Math.max(0.1, drawingArea.height)"
                    :style="{
                        pointerEvents: 'none',
                    }"
                >
                    <slot name="chart-background" />
                </foreignObject>

                <g v-if="drawableDataset.length > 0">
                    <!-- DEFS -->
                    <defs>
                        <!-- BEARISH GRADIENT -->
                        <DefGrad
                            t="linear"
                            :id="`bearish_gradient_${uid}`"
                            x2="0%"
                            y2="100%"
                            :stops="[
                                ['0%', candleCfg.colors.bearish, 1],
                                [
                                    '50%',
                                    shiftHue(candleCfg.colors.bearish, 0.02),
                                    0.87,
                                ],
                                [
                                    '100%',
                                    shiftHue(candleCfg.colors.bearish, 0.05),
                                    0.4,
                                ],
                            ]"
                        />
                        <!-- BULLISH GRADIENT -->
                        <DefGrad
                            t="linear"
                            :id="`bullish_gradient_${uid}`"
                            x2="0%"
                            y2="100%"
                            :stops="[
                                ['0%', candleCfg.colors.bullish, 1],
                                [
                                    '50%',
                                    shiftHue(candleCfg.colors.bullish, 0.02),
                                    0.87,
                                ],
                                [
                                    '100%',
                                    shiftHue(candleCfg.colors.bullish, 0.05),
                                    0.4,
                                ],
                            ]"
                        />
                    </defs>

                    <!-- AXIS -->
                    <g v-if="gridCfg.show">
                        <line
                            data-cy="candlestick-grid-y-axis"
                            :x1="
                                yAxisLabelsAreRight
                                    ? drawingArea.right
                                    : drawingArea.left
                            "
                            :x2="
                                yAxisLabelsAreRight
                                    ? drawingArea.right
                                    : drawingArea.left
                            "
                            :y1="drawingArea.top"
                            :y2="drawingArea.bottom"
                            :stroke="gridCfg.stroke"
                            :stroke-width="gridCfg.strokeWidth"
                            stroke-linecap="round"
                        />
                        <line
                            data-cy="candlestick-grid-x-axis"
                            :x1="drawingArea.left"
                            :x2="drawingArea.right"
                            :y1="drawingArea.bottom"
                            :y2="drawingArea.bottom"
                            :stroke="gridCfg.stroke"
                            :stroke-width="gridCfg.strokeWidth"
                            stroke-linecap="round"
                        />
                        <!-- HORIZONTAL GRID -->
                        <template v-if="gridCfg.horizontalLines.show">
                            <line
                                v-for="h in yLabels"
                                :x1="drawingArea.left"
                                :x2="drawingArea.right"
                                :y1="h.y"
                                :y2="h.y"
                                :stroke="gridCfg.horizontalLines.stroke"
                                :stroke-width="
                                    gridCfg.horizontalLines.strokeWidth
                                "
                                :stroke-dasharray="
                                    gridCfg.horizontalLines.strokeDasharray
                                "
                                stroke-linecap="round"
                            />
                        </template>

                        <!-- VERTICAL GRID -->
                        <template v-if="gridCfg.verticalLines.show">
                            <g v-for="(v, i) in displayedTimeLabels">
                                <line
                                    v-if="v.text"
                                    :x1="drawingArea.left + slot * i + slot / 2"
                                    :x2="drawingArea.left + slot * i + slot / 2"
                                    :y1="drawingArea.top"
                                    :y2="drawingArea.bottom"
                                    :stroke="gridCfg.verticalLines.stroke"
                                    :stroke-width="
                                        gridCfg.verticalLines.strokeWidth
                                    "
                                    :stroke-dasharray="
                                        gridCfg.verticalLines.strokeDasharray
                                    "
                                    stroke-linecap="round"
                                />
                            </g>
                        </template>

                        <!-- X AXIS TICKS -->
                        <template v-if="gridCfg.xAxis.ticks.show">
                            <g v-for="(v, i) in displayedTimeLabels">
                                <line
                                    v-if="v.text"
                                    :x1="drawingArea.left + slot * i + slot / 2"
                                    :x2="drawingArea.left + slot * i + slot / 2"
                                    :y1="drawingArea.bottom"
                                    :y2="drawingArea.bottom + 3"
                                    :stroke="gridCfg.stroke"
                                    :stroke-width="gridCfg.strokeWidth"
                                    stroke-linecap="round"
                                />
                            </g>
                        </template>
                    </g>

                    <!-- LABELS -->
                    <!-- Y LABELS -->
                    <g v-if="gridCfg.yAxis.dataLabels.show" ref="scaleLabels">
                        <g v-for="(yLabel, i) in yLabels" :key="`sl_${i}`">
                            <line
                                data-cy="y-scale-tick"
                                v-if="
                                    yLabel.value >= niceScale.min &&
                                    yLabel.value <= niceScale.max
                                "
                                :x1="
                                    yAxisLabelsAreRight
                                        ? drawingArea.right
                                        : drawingArea.left
                                "
                                :x2="
                                    yAxisLabelsAreRight
                                        ? drawingArea.right + 5
                                        : drawingArea.left - 5
                                "
                                :y1="yLabel.y"
                                :y2="yLabel.y"
                                :stroke="gridCfg.stroke"
                                :stroke-width="gridCfg.strokeWidth"
                                stroke-linecap="round"
                            />
                            <text
                                data-cy="y-scale-label"
                                :class="{
                                    'vue-data-ui-transition': transitionEnabled,
                                }"
                                v-if="
                                    yLabel.value >= niceScale.min &&
                                    yLabel.value <= niceScale.max
                                "
                                :transform="`translate(${yAxisLabelsAreRight ? drawingArea.right + 8 + gridCfg.yAxis.dataLabels.offsetX : drawingArea.left - 8 + gridCfg.yAxis.dataLabels.offsetX}, ${yLabel.y + svg.yAxisFontSize / 3})`"
                                :text-anchor="
                                    yAxisLabelsAreRight ? 'start' : 'end'
                                "
                                :font-size="svg.yAxisFontSize"
                                :fill="gridCfg.yAxis.dataLabels.color"
                                :font-weight="
                                    gridCfg.yAxis.dataLabels.bold
                                        ? 'bold'
                                        : 'normal'
                                "
                            >
                                {{
                                    dataLabel({
                                        p: gridCfg.yAxis.dataLabels.prefix,
                                        v: yLabel.value,
                                        s: gridCfg.yAxis.dataLabels.suffix,
                                        r: gridCfg.yAxis.dataLabels
                                            .roundingValue,
                                    })
                                }}
                            </text>
                        </g>
                    </g>
                    <!-- X LABELS -->
                    <g
                        v-if="
                            gridCfg.xAxis.dataLabels.show &&
                            !gridCfg.xAxis.dataLabels.datetimeFormatter.enable
                        "
                        ref="timeLabelsEls"
                    >
                        <g v-for="(xLabel, i) in xLabels">
                            <text
                                class="vue-data-ui-time-label"
                                data-cy="x-label"
                                :transform="`translate(${drawingArea.left + slot * i + slot / 2}, ${drawingArea.bottom + svg.xAxisFontSize * 1.5}), rotate(${gridCfg.xAxis.dataLabels.rotation})`"
                                :text-anchor="
                                    gridCfg.xAxis.dataLabels.rotation > 0
                                        ? 'start'
                                        : gridCfg.xAxis.dataLabels.rotation < 0
                                          ? 'end'
                                          : 'middle'
                                "
                                :font-size="svg.xAxisFontSize"
                                :fill="gridCfg.xAxis.dataLabels.color"
                                :font-weight="
                                    gridCfg.xAxis.dataLabels.bold
                                        ? 'bold'
                                        : 'normal'
                                "
                            >
                                {{ xLabel }}
                            </text>
                        </g>
                    </g>
                    <g
                        v-if="
                            gridCfg.xAxis.dataLabels.show &&
                            gridCfg.xAxis.dataLabels.datetimeFormatter.enable
                        "
                        ref="timeLabelsEls"
                    >
                        <g v-for="(timeLabel, i) in displayedTimeLabels">
                            <text
                                class="vue-data-ui-time-label"
                                data-cy="x-label"
                                :transform="`translate(${drawingArea.left + slot * i + slot / 2}, ${drawingArea.bottom + svg.xAxisFontSize * 1.5}), rotate(${gridCfg.xAxis.dataLabels.rotation})`"
                                :text-anchor="
                                    gridCfg.xAxis.dataLabels.rotation > 0
                                        ? 'start'
                                        : gridCfg.xAxis.dataLabels.rotation < 0
                                          ? 'end'
                                          : 'middle'
                                "
                                :font-size="svg.xAxisFontSize"
                                :fill="gridCfg.xAxis.dataLabels.color"
                                :stroke="styleCfg.backgroundColor"
                                stroke-width="3"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                paint-order="stroke fill"
                                :font-weight="
                                    gridCfg.xAxis.dataLabels.bold
                                        ? 'bold'
                                        : 'normal'
                                "
                            >
                                {{ timeLabel?.text ?? '' }}
                            </text>
                        </g>
                    </g>

                    <template v-if="FINAL_CONFIG.type === 'candlestick'">
                        <!-- CANDLE WICK -->
                        <g>
                            <g v-for="(wick, i) in drawableDataset">
                                <rect
                                    :data-cy="`candlestick-wick-vertical-${i}`"
                                    :x="
                                        wick.open.x -
                                        layoutCfg.wick.strokeWidth / 2
                                    "
                                    :y="wick.high.y"
                                    :width="layoutCfg.wick.strokeWidth"
                                    :height="Math.abs(wick.high.y - wick.low.y)"
                                    :fill="layoutCfg.wick.stroke"
                                    stroke="none"
                                    :rx="layoutCfg.wick.strokeWidth / 2"
                                    :class="{
                                        'vue-data-ui-transition':
                                            isLoaded && !loading,
                                    }"
                                />
                                <g
                                    v-if="
                                        layoutCfg.wick.extremity.shape ===
                                        'circle'
                                    "
                                >
                                    <circle
                                        :cx="wick.high.x"
                                        :cy="wick.high.y"
                                        :r="
                                            layoutCfg.wick.extremity.size ===
                                            'auto'
                                                ? slot / 20
                                                : layoutCfg.wick.extremity.size
                                        "
                                        :fill="layoutCfg.wick.extremity.color"
                                        :class="{
                                            'vue-data-ui-transition':
                                                isLoaded && !loading,
                                        }"
                                    />
                                    <circle
                                        :cx="wick.low.x"
                                        :cy="wick.low.y"
                                        :r="
                                            layoutCfg.wick.extremity.size ===
                                            'auto'
                                                ? slot / 20
                                                : layoutCfg.wick.extremity.size
                                        "
                                        :fill="layoutCfg.wick.extremity.color"
                                        :class="{
                                            'vue-data-ui-transition':
                                                isLoaded && !loading,
                                        }"
                                    />
                                </g>
                                <g
                                    v-if="
                                        layoutCfg.wick.extremity.shape ===
                                        'line'
                                    "
                                >
                                    <rect
                                        :data-cy="`candlestick-wick-high-${i}`"
                                        :x="
                                            wick.high.x -
                                            (layoutCfg.wick.extremity.size ===
                                            'auto'
                                                ? slot *
                                                  layoutCfg.candle.widthRatio
                                                : layoutCfg.wick.extremity
                                                      .size) /
                                                2
                                        "
                                        :y="
                                            wick.high.y -
                                            layoutCfg.wick.strokeWidth / 2
                                        "
                                        :width="
                                            Math.abs(
                                                wick.high.x -
                                                    (layoutCfg.wick.extremity
                                                        .size === 'auto'
                                                        ? slot *
                                                          styleCfg.layout.candle
                                                              .widthRatio
                                                        : styleCfg.layout.wick
                                                              .extremity.size) /
                                                        2 -
                                                    (wick.high.x +
                                                        (styleCfg.layout.wick
                                                            .extremity.size ===
                                                        'auto'
                                                            ? slot *
                                                              styleCfg.layout
                                                                  .candle
                                                                  .widthRatio
                                                            : styleCfg.layout
                                                                  .wick
                                                                  .extremity
                                                                  .size) /
                                                            2),
                                            )
                                        "
                                        :height="layoutCfg.wick.strokeWidth"
                                        :rx="layoutCfg.wick.strokeWidth / 2"
                                        :fill="layoutCfg.wick.extremity.color"
                                        stroke="none"
                                        :class="{
                                            'vue-data-ui-transition':
                                                isLoaded && !loading,
                                        }"
                                    />
                                    <rect
                                        :data-cy="`candlestick-wick-low-${i}`"
                                        :x="
                                            wick.low.x -
                                            (layoutCfg.wick.extremity.size ===
                                            'auto'
                                                ? slot *
                                                  layoutCfg.candle.widthRatio
                                                : layoutCfg.wick.extremity
                                                      .size) /
                                                2
                                        "
                                        :y="
                                            wick.low.y -
                                            layoutCfg.wick.strokeWidth / 2
                                        "
                                        :width="
                                            Math.abs(
                                                wick.low.x -
                                                    (layoutCfg.wick.extremity
                                                        .size === 'auto'
                                                        ? slot *
                                                          styleCfg.layout.candle
                                                              .widthRatio
                                                        : styleCfg.layout.wick
                                                              .extremity.size) /
                                                        2 -
                                                    (wick.low.x +
                                                        (styleCfg.layout.wick
                                                            .extremity.size ===
                                                        'auto'
                                                            ? slot *
                                                              styleCfg.layout
                                                                  .candle
                                                                  .widthRatio
                                                            : styleCfg.layout
                                                                  .wick
                                                                  .extremity
                                                                  .size) /
                                                            2),
                                            )
                                        "
                                        :height="layoutCfg.wick.strokeWidth"
                                        :fill="layoutCfg.wick.extremity.color"
                                        stroke="none"
                                        :rx="layoutCfg.wick.strokeWidth / 2"
                                        :class="{
                                            'vue-data-ui-transition':
                                                isLoaded && !loading,
                                        }"
                                    />
                                </g>
                            </g>
                        </g>
                        <!-- CANDLE BODY -->
                        <g>
                            <rect
                                v-for="(candle, i) in drawableDataset"
                                :data-cy="`candlestick-rect-underlayer-${i}`"
                                :x="
                                    candle.open.x -
                                    slot / 2 +
                                    (slot * (1 - candleCfg.widthRatio)) / 2
                                "
                                :y="
                                    candle.isBullish
                                        ? candle.close.y
                                        : candle.open.y
                                "
                                :height="
                                    Math.abs(candle.close.y - candle.open.y) <=
                                    0
                                        ? 0.0001
                                        : Math.abs(
                                              candle.close.y - candle.open.y,
                                          )
                                "
                                :width="
                                    slot * candleCfg.widthRatio <= 0
                                        ? 0.0001
                                        : slot * candleCfg.widthRatio
                                "
                                :fill="candleCfg.gradient.underlayer"
                                :rx="candleCfg.borderRadius"
                                stroke="none"
                                :class="{
                                    'vue-data-ui-transition':
                                        isLoaded && !loading,
                                }"
                            />
                            <rect
                                v-for="(candle, i) in drawableDataset"
                                :data-cy="`candlestick-rect-${i}`"
                                :x="
                                    candle.open.x -
                                    slot / 2 +
                                    (slot * (1 - candleCfg.widthRatio)) / 2
                                "
                                :y="
                                    candle.isBullish
                                        ? candle.close.y
                                        : candle.open.y
                                "
                                :height="
                                    Math.abs(candle.close.y - candle.open.y) <=
                                    0
                                        ? 0.0001
                                        : Math.abs(
                                              candle.close.y - candle.open.y,
                                          )
                                "
                                :width="
                                    slot * candleCfg.widthRatio <= 0
                                        ? 0.0001
                                        : slot * candleCfg.widthRatio
                                "
                                :fill="
                                    candle.isBullish
                                        ? candleCfg.gradient.show
                                            ? `url(#bullish_gradient_${uid})`
                                            : candleCfg.colors.bullish
                                        : candleCfg.gradient.show
                                          ? `url(#bearish_gradient_${uid})`
                                          : candleCfg.colors.bearish
                                "
                                :rx="candleCfg.borderRadius"
                                :stroke="candleCfg.stroke"
                                :stroke-width="candleCfg.strokeWidth"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                :class="{
                                    'vue-data-ui-transition':
                                        isLoaded && !loading,
                                }"
                            />
                        </g>
                    </template>

                    <template v-if="FINAL_CONFIG.type === 'ohlc'">
                        <g
                            v-for="(dp, i) in drawableDataset"
                            :key="`ohlc_${dp.absoluteIndex}`"
                        >
                            <path
                                :d="`M ${dp.high.x},${dp.high.y} ${dp.low.x},${dp.low.y} M${dp.open.x - Math.min(6, slot / 3)},${dp.open.y} ${dp.open.x},${dp.open.y} M${dp.close.x},${dp.close.y} ${dp.close.x + Math.min(6, slot / 3)},${dp.close.y}`"
                                :stroke="
                                    dp.isBullish
                                        ? candleCfg.colors.bullish
                                        : candleCfg.colors.bearish
                                "
                                :stroke-width="1"
                                :class="{
                                    'vue-data-ui-transition': transitionEnabled,
                                }"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </g>
                    </template>

                    <!-- TOOLTIP TRAPS -->
                    <g>
                        <rect
                            v-for="(rect, i) in drawableDataset"
                            data-cy="tooltip-trap"
                            :x="drawingArea.left + i * slot"
                            :y="drawingArea.top"
                            :height="
                                drawingArea.height <= 0
                                    ? 0.0001
                                    : drawingArea.height
                            "
                            :width="slot <= 0 ? 0.0001 : slot"
                            :fill="
                                hoveredIndex === i || selectedMinimapIndex === i
                                    ? setOpacity(
                                          layoutCfg.selector.color,
                                          layoutCfg.selector.opacity,
                                      )
                                    : 'transparent'
                            "
                            @mouseover="() => useTooltip(i, rect, 'pointer')"
                            @mouseleave="() => onTrapLeave(i, rect)"
                            @click="() => selectDatapoint(i, rect)"
                        />
                    </g>
                </g>

                <!-- ZOOM PREVIEW -->
                <rect
                    v-if="isPrecog"
                    v-bind="precogRect"
                    :data-start="slicer.start"
                    :data-end="slicer.end"
                />

                <slot
                    name="svg"
                    :svg="{
                        ...svg,
                        data: drawableDataset,
                        drawingArea,
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

        <SlicerPreview
            ref="chartSlicer"
            data-dom-to-png-ignore-layout
            v-if="styleCfg.zoom.show && len > 6 && isDataset && slicerReady"
            :allMinimaps="allMinimaps"
            :background="styleCfg.zoom.color"
            :borderColor="styleCfg.backgroundColor"
            :customFormat="styleCfg.zoom.customFormat"
            :cutNullValues="false"
            :enableRangeHandles="styleCfg.zoom.enableRangeHandles"
            :enableSelectionDrag="styleCfg.zoom.enableSelectionDrag"
            :end="slicer.end"
            :focusOnDrag="styleCfg.zoom.focusOnDrag"
            :focusRangeRatio="styleCfg.zoom.focusRangeRatio"
            :fontSize="styleCfg.zoom.fontSize"
            :immediate="!styleCfg.zoom.preview.enable"
            :inputColor="styleCfg.zoom.color"
            :isPreview="isPrecog"
            :labelLeft="slicerLabels.start || ''"
            :labelRight="slicerLabels.end || ''"
            :max="len"
            :min="0"
            :minimap="
                styleCfg.zoom.minimap.show ? FINAL_DATASET.map((d) => d[2]) : []
            "
            :minimapCompact="styleCfg.zoom.minimap.compact"
            :minimapFrameColor="styleCfg.zoom.minimap.frameColor"
            :minimapIndicatorColor="styleCfg.zoom.minimap.indicatorColor"
            :minimapMerged="false"
            :minimapSelectedColor="styleCfg.zoom.minimap.selectedColor"
            :minimapSelectedColorOpacity="
                styleCfg.zoom.minimap.selectedColorOpacity
            "
            :minimapSelectedIndex="hoveredIndex"
            :minimapSelectionRadius="1"
            :preciseLabels="preciseAllTimeLabels"
            :refreshEndPoint="
                styleCfg.zoom.endIndex !== null
                    ? styleCfg.zoom.endIndex + 1
                    : len
            "
            :refreshStartPoint="
                styleCfg.zoom.startIndex !== null ? styleCfg.zoom.startIndex : 0
            "
            :selectColor="styleCfg.zoom.highlightColor"
            :selectedSeries="FINAL_DATASET"
            :smoothMinimap="false"
            :start="slicer.start"
            :textColor="styleCfg.color"
            :timeLabels="allTimeLabels"
            :usePreciseLabels="
                gridCfg.xAxis.dataLabels.datetimeFormatter.enable &&
                !styleCfg.zoom.useDefaultFormat
            "
            :useResetSlot="styleCfg.zoom.useResetSlot"
            :valueEnd="slicer.end"
            :valueStart="slicer.start"
            :verticalHandles="styleCfg.zoom.minimap.verticalHandles"
            :minScale="gridCfg.yAxis.scale.min"
            :maxScale="gridCfg.yAxis.scale.max"
            :maxWidth="styleCfg.zoom.maxWidth"
            :minimapLeftInsetRatio="
                svg.width > 0 && styleCfg.zoom.autoFit
                    ? drawingArea.left / svg.width
                    : null
            "
            :minimapRightInsetRatio="
                svg.width > 0 && styleCfg.zoom.autoFit
                    ? (svg.width - drawingArea.right) / svg.width
                    : null
            "
            :additionalMinimapHeight="styleCfg.zoom.minimap.additionalHeight"
            :handleType="styleCfg.zoom.minimap.handleType"
            :handleIconColor="styleCfg.zoom.minimap.handleIconColor"
            :handleBorderWidth="styleCfg.zoom.minimap.handleBorderWidth"
            :handleBorderColor="styleCfg.zoom.minimap.handleBorderColor"
            :handleFill="styleCfg.zoom.minimap.handleFill"
            :handleWidth="styleCfg.zoom.minimap.handleWidth"
            @update:end="onSlicerEnd"
            @update:start="onSlicerStart"
            @trapMouse="selectMinimapIndex"
            @reset="refreshSlicer"
            @futureEnd="(v) => setPrecog('end', v)"
            @futureStart="(v) => setPrecog('start', v)"
        >
            <template #reset-action="{ reset }">
                <slot name="reset-action" v-bind="{ reset }" />
            </template>

            <template #slotMap="{ height: minimapH, unitW }">
                <g v-for="(dp, i) in minimapDataset({ minimapH, unitW })">
                    <path
                        :d="`M ${dp.high.x},${dp.high.y} ${dp.low.x},${dp.low.y}`"
                        :stroke="
                            dp.isBullish
                                ? candleCfg.colors.bullish
                                : candleCfg.colors.bearish
                        "
                        :stroke-width="1"
                        :style="{
                            opacity:
                                i >= slicerPrecog.start && i <= slicerPrecog.end
                                    ? 1
                                    : 0.6,
                        }"
                    />
                    <path
                        :d="`M ${dp.open.x},${dp.open.y} ${dp.close.x},${dp.close.y}`"
                        :stroke="
                            dp.isBullish
                                ? candleCfg.colors.bullish
                                : candleCfg.colors.bearish
                        "
                        :stroke-width="Math.min(6, unitW / 1.5)"
                        :style="{
                            opacity:
                                i >= slicerPrecog.start && i <= slicerPrecog.end
                                    ? 1
                                    : 0.6,
                        }"
                    />
                </g>
            </template>
        </SlicerPreview>

        <div ref="chartLegend">
            <slot name="legend" v-bind:legend="drawableDataset"></slot>
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- TOOLTIP -->
        <Tooltip
            :teleportTo="styleCfg.tooltip.teleportTo"
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="styleCfg.tooltip.backgroundColor"
            :color="styleCfg.tooltip.color"
            :borderRadius="styleCfg.tooltip.borderRadius"
            :borderColor="styleCfg.tooltip.borderColor"
            :borderWidth="styleCfg.tooltip.borderWidth"
            :fontSize="styleCfg.tooltip.fontSize"
            :backgroundOpacity="styleCfg.tooltip.backgroundOpacity"
            :position="styleCfg.tooltip.position"
            :offsetX="styleCfg.tooltip.offsetX"
            :offsetY="styleCfg.tooltip.offsetY"
            :parent="candlestickChart"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="
                styleCfg.tooltip.customFormat &&
                typeof styleCfg.tooltip.customFormat === 'function'
            "
            :smooth="styleCfg.tooltip.smooth"
            :backdropFilter="styleCfg.tooltip.backdropFilter"
            :smoothForce="styleCfg.tooltip.smoothForce"
            :smoothSnapThreshold="styleCfg.tooltip.smoothSnapThreshold"
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
                        {{ th }}
                    </template>
                    <template #td="{ td }">
                        <div v-html="td" />
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

.vue-ui-candlestick * {
    transition: unset;
}
.vue-ui-candlestick {
    user-select: none;
    width: 100%;
}

.vue-ui-candlestick .vue-ui-candlestick-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    text-align: center;
    width: 100%;
}

.vue-ui-candlestick-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0, 0, 0, 0.2);
    max-width: 300px;
    position: fixed;
    padding: 12px;
    z-index: 1;
}

.vue-data-ui-transition {
    transition: all 0.2s ease-in-out;
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
