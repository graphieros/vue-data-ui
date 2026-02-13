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
    useSlots, 
    watch, 
    watchEffect, 
} from "vue";
import { 
    applyDataLabel, 
    buildDisplayedTimeLabels, 
    calculateNiceScale, 
    calculateNiceScaleWithExactExtremes, 
    checkNaN, 
    convertColorToHex, 
    convertCustomPalette, 
    createCsvContent, 
    createPolygonPath, 
    createSmoothPath, 
    createStar, 
    createStraightPath, 
    createUid, 
    dataLabel, 
    downloadCsv, 
    error, 
    forceValidValue, 
    functionReturnsString, 
    getMissingDatasetAttributes, 
    isFunction, 
    isSafeValue, 
    lightenHexColor, 
    objectIsEmpty, 
    palette, 
    setOpacity, 
    sumSeries, 
    themePalettes, 
    treeShake, 
    XMLNS 
} from "../lib";
import { throttle } from "../canvas-lib";
import { useLocale } from "../useLocale";
import { useConfig } from "../useConfig";
import { useDateTime } from "../useDateTime";
import { useLoading } from "../useLoading";
import { usePrinter } from "../usePrinter";
import { useSvgExport } from "../useSvgExport";
import { useNestedProp } from "../useNestedProp";
import { useResponsive } from "../useResponsive";
import { useTimeLabels } from "../useTimeLabels";
import { useThemeCheck } from "../useThemeCheck";
import { useStableElementSize } from "../useStableElementSize";
import { useChartAccessibility } from "../useChartAccessibility";
import { useTimeLabelCollision } from "../useTimeLabelCollider";
import { useUserOptionState } from "../useUserOptionState";
import img from "../img";
import Shape from "../atoms/Shape.vue";
import Title from "../atoms/Title.vue";
import themes from "../themes/vue_ui_stackline.json";
import Legend from "../atoms/Legend.vue";
import BaseScanner from "../atoms/BaseScanner.vue";
import SlicerPreview from "../atoms/SlicerPreview.vue";
import BaseLegendToggle from "../atoms/BaseLegendToggle.vue";

const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));

const { vue_ui_stackline: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();
const slots = useSlots();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        }
    },
    dataset: {
        type: Array,
        default() {
            return [];
        }
    },
    selectedXIndex: {
        type: Number,
        default: undefined
    }
});

const emit = defineEmits(['selectDatapoint', 'selectLegend', 'selectTimeLabel', 'selectX', 'copyAlt']);

const isDataset = computed({
    get() {
        return !!props.dataset && props.dataset.length
    },
    set(bool) {
        return bool
    }
});

function canShowValue(v) {
    return Number.isFinite(v);
}
const stacklineChart = ref(null);
const uid = ref(createUid());
const isTooltip = ref(false);
const dataTooltipSlot = ref(null);
const segregated = ref([]);
const step = ref(0);
const chartTitle = ref(null);
const chartLegend = ref(null);
const chartSlicer = ref(null);
const noTitle = ref(null);
const source = ref(null);
const isFullscreen = ref(false);
const isLoaded = ref(false);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);
const readyTeleport = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);
const userHovers = ref(false);
const isCallbackImaging = ref(false);
const isCallbackSvg = ref(false);

const xAxisLabel = ref(null);
const yAxisLabel = ref(null);
const scaleLabels = ref(null);
const timeLabelsEls = ref(null);
const sumTop = ref(null);

const parentElement = shallowRef(null);
const parentLayoutIsStable = ref(false);
const parentLayoutStableRunSequence = ref(0);
const pendingParentLayoutSequence = ref(0);

const stableParentSize = useStableElementSize({
    elementRef: parentElement,
    minimumWidth: 2,
    minimumHeight: 2,
    stableFramesRequired: 2,
    once: false,
    onSizeAccepted: () => {
        runParentStableLayoutPass();
    },
});

function setParentElementReference() {
    parentElement.value = stacklineChart.value?.parentNode ?? null;
}

function nextPaintFrame() {
    return new Promise(resolve => {
        requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        });
    });
}

async function runParentStableLayoutPass() {
    const currentSequence = ++pendingParentLayoutSequence.value;

    parentLayoutIsStable.value = false;

    await nextTick();
    await nextPaintFrame();
    await nextPaintFrame();

    if (currentSequence !== pendingParentLayoutSequence.value) return;

    parentLayoutStableRunSequence.value += 1;
    parentLayoutIsStable.value = true;
}

const selectedMinimapIndex = ref(null);

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

onMounted(() => {
    setParentElementReference();
    stableParentSize.start();

    readyTeleport.value = true;
    prepareChart();
    runParentStableLayoutPass();
});

const FINAL_CONFIG = ref(prepareConfig());

const isCursorPointer = computed(() => FINAL_CONFIG.value.userOptions.useCursorPointer);

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            userOptions: { show: false },
            useCssAnimation: false,
            table: { show: false },
            tooltip: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    lines: {
                        totalValues: { show: false },
                        dataLabels: { show: false },
                    },
                    grid: {
                        frame: {
                            stroke: '#6A6A6A'
                        },
                        scale: {
                            scaleMin: 0,
                            scaleMax: 144
                        },
                        x: { 
                            axisColor: '#6A6A6A',
                            linesColor: '#6A6A6A',
                            axisName: { show: false },
                            timeLabels: { show: false }
                        },
                        y: {
                            axisColor: '#6A6A6A',
                            linesColor: '#6A6A6A',
                            axisName: { show: false },
                            axisLabels: { show: false }
                        }
                    },
                    legend: {
                        backgroundColor: 'transparent'
                    },
                    padding: {
                        left: 24,
                        right: 24,
                        bottom: 12
                    },
                    zoom: { 
                        show: false,
                        startIndex: null,
                        endIndex: null
                    }
                }
            }
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {}
    })
});

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    callback: () => {
        Promise.resolve().then(async () => {
            await setupSlicer();
        })
    },
    skeletonDataset: props.config?.skeletonDataset ?? [
        {
            name: '',
            series: [3, 2, 1, 5, 13, 21, 8, 89, 34, 55],
            color: '#8A8A8A'
        },
        {
            name: '',
            series: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
            color: '#CACACA' 
        }
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value
    })
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

function onChartEnter() {
    userHovers.value = true;
    setUserOptionsVisibility(true);
}

function onChartLeave() {
    setUserOptionsVisibility(false);
    userHovers.value = false;
}

function prepareConfig(){
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG,
    });
    let finalConfig = {};

    const theme = mergedConfig.theme;

    if (theme) {
        if (!isThemeValid.value(mergedConfig)) {
            warnInvalidTheme(mergedConfig);
            finalConfig = mergedConfig;
        } else {
            const fused = useNestedProp({
                userConfig: themes[theme] || props.config,
                defaultConfig: mergedConfig
            });
    
            finalConfig = {
                ...useNestedProp({
                    userConfig: props.config,
                    defaultConfig: fused
                }),
                customPalette: mergedConfig.customPalette.length ? mergedConfig.customPalette : themePalettes[theme] || palette
            }
        }
    } else {
        finalConfig = mergedConfig;
    }

    return finalConfig;
}

const canHideSmallValues = computed(() => {
    return FINAL_CONFIG.value.style.chart.lines.dataLabels.hideUnderValue !== null
});

const canHideSmallPercentages = computed(() => {
    return FINAL_CONFIG.value.style.chart.lines.dataLabels.hideUnderPercentage !== null
});

watch(() => props.config, (_newCfg) => {
    if (!loading.value) {
        FINAL_CONFIG.value = prepareConfig();
    }
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
    legendStep.value += 1;
    
    // Reset mutable config
    mutableConfig.value.dataLabels.show = FINAL_CONFIG.value.style.chart.lines.dataLabels.show;
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.chart.tooltip.show;
    defaultSizes.value.width = FINAL_CONFIG.value.style.chart.width;
    defaultSizes.value.height = FINAL_CONFIG.value.style.chart.height;
    defaultSizes.value.paddingRatio = {
        top: FINAL_CONFIG.value.style.chart.padding.top / FINAL_CONFIG.value.style.chart.height,
        right: FINAL_CONFIG.value.style.chart.padding.right / FINAL_CONFIG.value.style.chart.width,
        bottom: FINAL_CONFIG.value.style.chart.padding.bottom / FINAL_CONFIG.value.style.chart.height,
        left: FINAL_CONFIG.value.style.chart.padding.left / FINAL_CONFIG.value.style.chart.width,
    }

    setParentElementReference();
    runParentStableLayoutPass();

    normalizeSlicerWindow();
}, { deep: true });

watch(() => props.dataset, (_) => {
    if (Array.isArray(_) && _.length > 0) {
        manualLoading.value = false;
    }
    refreshSlicer();
    setParentElementReference();
    runParentStableLayoutPass();
}, { deep: true })

const mutableConfig = ref({
    dataLabels: {
        show: FINAL_CONFIG.value.style.chart.lines.dataLabels.show,
    },
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
});

watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
        dataLabels: {
            show: FINAL_CONFIG.value.style.chart.lines.dataLabels.show,
        },
        showTable: FINAL_CONFIG.value.table.show,
        showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
    }
}, { immediate: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `stackline_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-stackline',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const defaultSizes = ref({
    width: FINAL_CONFIG.value.style.chart.width,
    height: FINAL_CONFIG.value.style.chart.height,
    paddingRatio: {
        top: FINAL_CONFIG.value.style.chart.padding.top / FINAL_CONFIG.value.style.chart.height,
        right: FINAL_CONFIG.value.style.chart.padding.right / FINAL_CONFIG.value.style.chart.width,
        bottom: FINAL_CONFIG.value.style.chart.padding.bottom / FINAL_CONFIG.value.style.chart.height,
        left: FINAL_CONFIG.value.style.chart.padding.left / FINAL_CONFIG.value.style.chart.width,
    }
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);
const to = ref(null)
const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiStackline',
            type: 'dataset',
            debug: debug.value
        });
        manualLoading.value = true;
    } else {
        props.dataset.forEach((datasetObject, index) => {
            getMissingDatasetAttributes({
                datasetObject,
                requiredAttributes: ['name', 'series']
            }).forEach(attr => {
                isDataset.value = false;
                error({
                    componentName: 'VueUiStackline',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index,
                    debug: debug.value
                });
                manualLoading.value = true;
            })
        })
    }

    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    setTimeout(() => {
        isLoaded.value = true;
    }, 10);

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            isLoaded.value = false;
            const { width, height } = useResponsive({
                chart: stacklineChart.value,
                noTitle: noTitle.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
                slicer: FINAL_CONFIG.value.style.chart.zoom.show && maxSeries.value > 6 ? chartSlicer.value.$el : null,
                source: source.value
            });

            requestAnimationFrame(() => {
                defaultSizes.value.width = width;
                defaultSizes.value.height = height - 12;
                clearTimeout(to.value);
                to.value = setTimeout(() => {
                    isLoaded.value = true;
                },10)
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = stacklineChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }
    setupSlicer();
}

onBeforeUnmount(() => {
    stableParentSize.stop();

    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }
});

function getOffsetX() {
    let base = 0;
    if (scaleLabels.value) {
        const texts = Array.from(scaleLabels.value.querySelectorAll('text'))
        base = texts.reduce((max, t) => {
            const w = t.getComputedTextLength()
            return w > max ? w : max
        }, 0)
    }

    const yAxisLabelW = yAxisLabel.value
        ? yAxisLabel.value.getBoundingClientRect().width
        : 0

    return base + yAxisLabelW + (yAxisLabelW ? 24 : 0);
}

const offsetRight = ref(0);
const measuredTimeLabelsHeight = ref(0);

const timeLabelsHeightAnimationFrameId = ref(0);

function measureTimeLabelsHeightNow() {
    const labelGroupElement = timeLabelsEls.value;

    if (!labelGroupElement) {
        measuredTimeLabelsHeight.value = 0;
        return;
    }

    try {
        const box = labelGroupElement.getBBox();
        measuredTimeLabelsHeight.value = Number.isFinite(box?.height) ? box.height : 0;
    } catch (_) {
        measuredTimeLabelsHeight.value = 0;
    }
}

function scheduleMeasureTimeLabelsHeight() {
    if (timeLabelsHeightAnimationFrameId.value) {
        cancelAnimationFrame(timeLabelsHeightAnimationFrameId.value);
    }

    timeLabelsHeightAnimationFrameId.value = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            measureTimeLabelsHeightNow();
        });
    });
}

onBeforeUnmount(() => {
    if (timeLabelsHeightAnimationFrameId.value) {
        cancelAnimationFrame(timeLabelsHeightAnimationFrameId.value);
    }
    measuredTimeLabelsHeight.value = 0;
    offsetRight.value = 0;
});

const offsetY = computed(() => {
    let xAxisLabelHeight = 0;

    if (xAxisLabel.value) {
        try {
            xAxisLabelHeight = xAxisLabel.value.getBBox().height;
        } catch (_) {
            xAxisLabelHeight = 0;
        }
    }

    const timeLabelsHeight = FINAL_CONFIG.value.style.chart.grid.x.timeLabels.show
        ? measuredTimeLabelsHeight.value
        : 0;

    return xAxisLabelHeight + timeLabelsHeight;
});

const drawingArea = computed(() => {
    void parentLayoutStableRunSequence.value;

    const { height: H, width: W } = defaultSizes.value;
    const { right: PR } = defaultSizes.value.paddingRatio;

    let topOffset = FINAL_CONFIG.value.style.chart.lines.totalValues.show && props.dataset && props.dataset.length > 1 ? FINAL_CONFIG.value.style.chart.lines.totalValues.fontSize * 1.3 : 0;
    let offsetX = 0;

    if (FINAL_CONFIG.value.style.chart.grid.y.axisLabels.show) {
        offsetX = getOffsetX()
    }

    const top = FINAL_CONFIG.value.style.chart.padding.top + topOffset
    const right = W - (W * PR) - offsetRight.value;
    const bottom = H - FINAL_CONFIG.value.style.chart.padding.bottom - offsetY.value - topOffset;
    const left = FINAL_CONFIG.value.style.chart.padding.left + offsetX;

    const width = W - left - (W * PR) - offsetRight.value;
    const height = H - top - FINAL_CONFIG.value.style.chart.padding.bottom - offsetY.value - topOffset;

    return {
        chartHeight: Math.max(0, H),
        chartWidth: Math.max(0, W),
        top,
        right: Math.max(0, right),
        bottom: Math.max(0, bottom),
        left: Math.max(0, left),
        width: Math.max(0, width),
        height: Math.max(0, height),
    }
});

const precogRect = computed(() => {
    const { left, top, width: totalWidth, height: totalHeight } = drawingArea.value;
    const windowStart = slicer.value.start;
    const windowEnd = slicer.value.end;
    const windowLen = Math.max(1, windowEnd - windowStart);

    const relStart = Math.max(0, Math.min(windowLen, (slicerPrecog.value.start ?? windowStart) - windowStart));
    const relEnd = Math.max(0, Math.min(windowLen, (slicerPrecog.value.end   ?? windowEnd)   - windowStart));
    const span = Math.max(0, relEnd - relStart);

    const commonCfg = {
        fill: FINAL_CONFIG.value.style.chart.zoom.preview.fill,
        stroke: FINAL_CONFIG.value.style.chart.zoom.preview.stroke,
        ['stroke-width']: FINAL_CONFIG.value.style.chart.zoom.preview.strokeWidth,
        ['stroke-dasharray']: FINAL_CONFIG.value.style.chart.zoom.preview.strokeDasharray,
        ['stroke-linecap']: 'round',
        ['stroke-linejoin']: 'round',
        style: {
            pointerEvents: 'none',
            transition: 'none !important',
            animation: 'none !important'
        }
    };

    const unit = totalWidth / windowLen;
    return {
        x: left + relStart * unit,
        y: top,
        width: span * unit,
        height: totalHeight,
        ...commonCfg
    };
});

const unmutableDataset = computed(() => {
    return FINAL_DATASET.value.map((ds, i) => {
        const color = convertColorToHex(ds.color) || customPalette.value[i] || palette[i] || palette[i % palette.length];
        return {
            ...ds,
            shape: ds.shape || 'circle',
            standalone: !!ds.standalone,
            // In distributed mode, all values are converted to positive
            series: JSON.parse(JSON.stringify(ds.series)).map(v => {
                return FINAL_CONFIG.value.style.chart.lines.distributed ? Math.abs(v) : v
            }),
            seriesSource: ds.series,
            // Store signs to manage display of neg values in distributed mode
            signedSeries: ds.series.map(v => v >= 0 ? 1 : -1),
            absoluteIndex: i,
            id: createUid(),
            color
        }
    });
});

const stackedDataset = computed(() =>
    unmutableDataset.value.filter(ds => !segregated.value.includes(ds.id) && !ds.standalone)
);

const standaloneDatasetOnly = computed(() =>
    unmutableDataset.value.filter(ds => !segregated.value.includes(ds.id) && ds.standalone)
);

const maxSeries = computed(() => {
    const v = Math.max(...unmutableDataset.value.filter(ds => !segregated.value.includes(ds.id)).map(ds => ds.series.length));
    return isFinite(v) ? v : Math.max(...unmutableDataset.value.map(ds => ds.series.length));
});

function selectMinimapIndex(i) {
    selectedMinimapIndex.value = i;
}

const slicer = ref({
    start: 0,
    end: Math.max(...FINAL_DATASET.value.map(ds => ds.series.length))
});

const slicerPrecog = ref({ start: 0, end: Math.max(...FINAL_DATASET.value.map(ds => ds.series.length)) });

function absIndex(relIndex) {
    return (slicer.value.start ?? 0) + (relIndex ?? 0);
}

function sourceValueAt(ds, relIndex) {
    const i = absIndex(relIndex);
    return Array.isArray(ds.seriesSource) ? ds.seriesSource[i] : undefined;
}

const isPrecog = computed(() => {
    return FINAL_CONFIG.value.style.chart.zoom.preview.enable && (slicerPrecog.value.start !== slicer.value.start || slicerPrecog.value.end !== slicer.value.end);
});

function setPrecog(side, val) {
    slicerPrecog.value[side] = val;
}

function normalizeSlicerWindow() {
    const maxLen = maxSeries.value;
    let s = Math.max(0, Math.min(slicer.value.start ?? 0, maxLen - 1))
    let e = Math.max(s + 1, Math.min(slicer.value.end ?? maxLen, maxLen))

    if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) { s = 0; e = maxLen }

    slicer.value.start = s;
    slicer.value.end = e;
    slicerPrecog.value.start = s
    slicerPrecog.value.end = e

    if(chartSlicer.value) {
        chartSlicer.value.setStartValue(s);
        chartSlicer.value.setEndValue(e)
    }
}

const refreshRAF = ref(null);
function nextPaint() {
    return new Promise(r => requestAnimationFrame(() =>
        requestAnimationFrame(() => r())
    ));
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

const lineSlot = computed(() => {
    return Math.max(0, drawingArea.value.width / (slicer.value.end - slicer.value.start))
});

const datasetTotals = computed(() => {
    return sumSeries(
        stackedDataset.value.map(ds => ({ ...ds, series: ds.series.map(v => v ?? 0) }))
    ).slice(slicer.value.start, slicer.value.end);
});

const allSegregated = computed(() => segregated.value.length === unmutableDataset.value.length);

const datasetTotalsMinimap = computed(() => {
    if (!FINAL_CONFIG.value.style.chart.zoom.minimap.show) return [];

    const d = unmutableDataset.value.filter(ds => allSegregated.value ? true : !segregated.value.includes(ds.id) && !ds.standalone)

    if (d.length) {
        return sumSeries(
            d.map(ds => ({
                ...ds,
                series: (ds.series || []).map(v => v ?? 0)
            }))
        );
    }

    // Fallback when only standalone series are visible:
    // single reference series so SlicerPreview always has data
    const solo = standaloneDatasetOnly.value;
    if (!solo.length) return [];

    const maxLen = Math.max(...solo.map(ds => ds.series.length || 0));
    const summedAbs = Array.from({ length: maxLen }, (_, i) =>
        solo.reduce((acc, ds) => acc + Math.abs(ds.series[i] ?? 0), 0)
    );

    return summedAbs;
});


const allMinimaps = computed(() => {
    if (!FINAL_CONFIG.value.style.chart.zoom.minimap.show) return [];

    const d = unmutableDataset.value.filter(ds => allSegregated.value ? true : !segregated.value.includes(ds.id) && !ds.standalone);

    const stacked = d;
    const standalone = standaloneDatasetOnly.value;

    const merged = stacked.length
        ? [{
            name: '',
            series: datasetTotalsMinimap.value,
            color: '#000000',
            isVisible: true
        }]
        : [];

    const standaloneSeries = standalone.map(ds => ({
        name: ds.name || '',
        series: (ds.series || []).map(v => v ?? 0),
        color: ds.color,
        isVisible: true
    }));

    return merged.concat(standaloneSeries);
});

const displayTotals = computed(() => {
    return sumSeries(
        stackedDataset.value
        .filter(ds => !segregated.value.includes(ds.id))
        .map(s => ({
            ...s,
            series: s.series.map((dp,i) => {
            const v = (dp ?? 0);
            return s.signedSeries[i] === -1 ? (v >= 0 ? -v : v) : v;
            })
        }))
    ).slice(slicer.value.start, slicer.value.end);
});

const datasetSignedTotals = computed(() => {
    const src = stackedDataset.value.filter(ds => !segregated.value.includes(ds.id))
    return { 
        positive: sumSeries(src.map(s => {
            return {
                ...s,
                series: s.series.slice(slicer.value.start, slicer.value.end).map(v => (v ?? 0) >= 0 ? (v ?? 0) : 0)
            }
        })),
        negative: sumSeries(src.map(s => {
            return {
                ...s,
                series: s.series.slice(slicer.value.start, slicer.value.end).map(v => (v ?? 0) < 0 ? (v ?? 0) : 0)
            }
        }))
    }
});

const standaloneSignedExtremes = computed(() => {
    const len = Math.max(0, slicer.value.end - slicer.value.start);
    const pos = Array(len).fill(0);
    const neg = Array(len).fill(0);

    standaloneDatasetOnly.value.forEach(ds => {
        for (let i = 0; i < len; i += 1) {
            const v = ds.series[slicer.value.start + i] ?? 0;
            if (v > 0) pos[i] = Math.max(pos[i], v);
            if (v < 0) neg[i] = Math.min(neg[i], v);
        }
    });

    return {
        positive: pos,
        negative: neg
    };
});

const totalLabels = computed(() => {
    return displayTotals.value.map((t, i) => {
        return {
            value: t,
            sign: t >= 0 ? 1 : -1
        }
    });
});

function getZeroPositions() {
    const y0 = yLabels.value?.[0]?.zero ?? drawingArea.value.bottom;
    return { y0 };
}

function placeLabelTotalY(index) {
    const { y0 } = getZeroPositions();
    const cfg = FINAL_CONFIG.value.style.chart.lines.totalValues;
    const pad = Math.max(2, (cfg.fontSize * 1.3) + cfg.offsetY);
    const clamp = (y) => Math.min(Math.max(y, drawingArea.value.top - FINAL_CONFIG.value.style.chart.lines.totalValues.fontSize * 1.3), drawingArea.value.bottom + FINAL_CONFIG.value.style.chart.lines.totalValues.fontSize * 2);
    const total = totalLabels.value?.[index]?.value ?? 0;

    if (total >= 0 || FINAL_CONFIG.value.style.chart.lines.distributed) {
        let minTop = Infinity;
        for (const ds of formattedDataset.value || []) {
            const v = ds?.series?.[index];
            const top = ds?.topY?.[index];
            if ((v ?? 0) > 0 && Number.isFinite(top)) {
                if (top < minTop) minTop = top;
            }
        }
        const base = Number.isFinite(minTop) ? minTop : y0;
        return clamp(base - pad - FINAL_CONFIG.value.style.chart.lines.totalValues.offsetY);
    } else {
        let maxTop = -Infinity;
        for (const ds of formattedDataset.value || []) {
            const v = ds?.series?.[index];
            const top = ds?.topY?.[index];
            if ((v ?? 0) < 0 && Number.isFinite(top)) {
                if (top > maxTop) maxTop = top;
            }
        }
        const base = Number.isFinite(maxTop) ? maxTop : y0;
        return clamp(base + pad + cfg.fontSize * 0.7 + FINAL_CONFIG.value.style.chart.lines.totalValues.offsetY);
    }
}

const yLabels = computed(() => {
    // Stacked extremes
    const stackedMax = Math.max(...datasetSignedTotals.value.positive, 0);
    const stackedMin = Math.min(...datasetSignedTotals.value.negative, 0);

    // Standalone extremes
    const standMax = Math.max(...standaloneSignedExtremes.value.positive, 0);
    const standMin = Math.min(...standaloneSignedExtremes.value.negative, 0);

    // Final raw extremes (include standalone)
    const RAW_MAX = Math.max(stackedMax, standMax);
    const RAW_MIN_CAND = Math.min(stackedMin, standMin);
    const RAW_MIN = [-Infinity, Infinity, NaN, undefined, null].includes(RAW_MIN_CAND) ? 0 : RAW_MIN_CAND;

    const requestedMin = FINAL_CONFIG.value.style.chart.grid.scale.scaleMin;
    const requestedMax = FINAL_CONFIG.value.style.chart.grid.scale.scaleMax;
    const useExact = (!FINAL_CONFIG.value.style.chart.lines.distributed &&
                    (requestedMin !== null || requestedMax !== null));

    const minArg = (requestedMin !== null && !FINAL_CONFIG.value.style.chart.lines.distributed)
        ? requestedMin
        : (RAW_MIN > 0 ? 0 : RAW_MIN);

    const maxArg = (requestedMax !== null && !FINAL_CONFIG.value.style.chart.lines.distributed)
        ? requestedMax
        : (RAW_MAX < 0 ? 0 : RAW_MAX);

    const scale = useExact
        ? calculateNiceScaleWithExactExtremes(minArg, maxArg, FINAL_CONFIG.value.style.chart.grid.scale.ticks)
        : calculateNiceScale(minArg, maxArg, FINAL_CONFIG.value.style.chart.grid.scale.ticks);

    const absMin = Math.abs(Number(scale.min) || 0);
    const maxVal = Number(scale.max) || 0;
    const range = maxVal + absMin;
    const safeRange = (range === 0 || !Number.isFinite(range)) ? 1 : range;

    const ticks = Array.isArray(scale.ticks) && scale.ticks.length ? scale.ticks : [0];
    const zeroY = drawingArea.value.bottom - (drawingArea.value.height * (absMin / safeRange));

    return ticks.map(t => {
        const tv = Number(t) || 0;
        const y = drawingArea.value.bottom - (drawingArea.value.height * ((tv + absMin) / safeRange));
        return {
            zero: zeroY,
            y,
            x: boundsX.value.left - 8,
            value: tv
        };
    });
});

const timeLabels = ref([]);
const allTimeLabels = ref([]);

let timeLabelsRequestId = 0;
watchEffect(() => {
    const requestId = ++timeLabelsRequestId;

    (async () => {
        const labels = await useTimeLabels({
            values: FINAL_CONFIG.value.style.chart.grid.x.timeLabels.values,
            maxDatapoints: maxSeries.value,
            formatter: FINAL_CONFIG.value.style.chart.grid.x.timeLabels.datetimeFormatter,
            start: slicer.value.start,
            end: slicer.value.end
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
            values: FINAL_CONFIG.value.style.chart.grid.x.timeLabels.values,
            maxDatapoints: maxSeries.value,
            formatter: FINAL_CONFIG.value.style.chart.grid.x.timeLabels.datetimeFormatter,
            start: 0,
            end: maxSeries.value
        });

        if (requestId === allTimeLabelsRequestId) {
            allTimeLabels.value = labels;
        }
    })();
});

const modulo = computed(() => {
    const m = FINAL_CONFIG.value.style.chart.grid.x.timeLabels.modulo;
    if (!timeLabels.value.length) return m;
    return Math.min(m, [...new Set(timeLabels.value.map(t => t.text))].length);
});

const displayedTimeLabels = computed(() => {
    const cfg = FINAL_CONFIG.value.style.chart.grid.x.timeLabels;
    const vis = timeLabels.value || [];
    const all = allTimeLabels.value || [];
    const start = slicer.value.start ?? 0;
    const sel = selectedSerieIndex.value;
    const maxS = maxSeries.value;
    const visTexts = vis.map(l => l?.text ?? '');
    const allTexts = all.map(l => l?.text ?? '');

    return buildDisplayedTimeLabels(
        !!cfg.showOnlyFirstAndLast,
        !!cfg.showOnlyAtModulo,
        Math.max(1, modulo.value || 1),
        visTexts,
        allTexts,
        start,
        sel,
        maxS
    );
});

watchEffect(() => {
    const timeLabelsAreShown = FINAL_CONFIG.value.style.chart.grid.x.timeLabels.show;
    const timeLabelsFontSize = FINAL_CONFIG.value.style.chart.grid.x.timeLabels.fontSize;
    const timeLabelsRotation = FINAL_CONFIG.value.style.chart.grid.x.timeLabels.rotation;
    const timeLabelsOffsetY = FINAL_CONFIG.value.style.chart.grid.x.timeLabels.offsetY;

    const renderedTimeLabelTexts = (displayedTimeLabels.value || [])
        .map(label => label?.text ?? '')
        .join('|');

    const chartWidth = defaultSizes.value.width;
    const chartHeight = defaultSizes.value.height;

    const timeLabelsGroupElement = timeLabelsEls.value;
    const xAxisLabelElement = xAxisLabel.value;

    void timeLabelsAreShown;
    void timeLabelsFontSize;
    void timeLabelsRotation;
    void timeLabelsOffsetY;
    void renderedTimeLabelTexts;
    void chartWidth;
    void chartHeight;
    void timeLabelsGroupElement;
    void xAxisLabelElement;

    scheduleMeasureTimeLabelsHeight();
}, { flush: 'post' });

const localeData = ref({ months: [], shortMonths: [], days: [], shortDays: [] });

let localeRequestId = 0;
watchEffect(() => {
    const requestId = ++localeRequestId;
    const xl = FINAL_CONFIG.value.style.chart.grid.x.timeLabels.datetimeFormatter;

    (async () => {
        const resolved = await useLocale(xl.locale).catch(() => useLocale("en"));
        if (requestId === localeRequestId) {
            localeData.value = resolved.data;
        }
    })();
});

const preciseTimeFormatter = computed(() => {
    const xl = FINAL_CONFIG.value.style.chart.grid.x.timeLabels.datetimeFormatter;

    const dt = useDateTime({
        useUTC: xl.useUTC,
        locale: localeData.value,
        januaryAsYear: xl.januaryAsYear
    });

    return (absIndex, fmt) => {
        const values = FINAL_CONFIG.value.style.chart.grid.x.timeLabels.values;
        const ts = values?.[absIndex];
        if (ts == null) return "";
        return dt.formatDate(new Date(ts), fmt);
    };
});

const preciseAllTimeLabels = computed(() => {
    const values = FINAL_CONFIG.value.style.chart.grid.x.timeLabels.values || []
    return values.map((_, i) => ({
        text: preciseTimeFormatter.value(i, FINAL_CONFIG.value.style.chart.zoom.timeFormat),
        absoluteIndex: i
    }));
});

const preciseAllTimeLabelsTooltip = computed(() => {
    const values = FINAL_CONFIG.value.style.chart.grid.x.timeLabels.values || []
    return values.map((_, i) => ({
        text: preciseTimeFormatter.value(i, FINAL_CONFIG.value.style.chart.tooltip.timeFormat),
        absoluteIndex: i
    }));
});

const _formattedDataset = computed(() => {
    if (!isDataset.value && !loading.value) return [];

    const totalHeight = drawingArea.value.height;
    const ZERO_POSITION = yLabels.value[0] ? yLabels.value[0].zero : drawingArea.value.bottom;
    const winStart = slicer.value.start ?? 0;
    const winEnd   = slicer.value.end   ?? 0;
    const winLen = Math.max(1, winEnd - winStart);

    const stackedMax = Math.max(...datasetSignedTotals.value.positive, 0);
    const stackedMin = Math.min(...datasetSignedTotals.value.negative, 0);
    const standMax   = Math.max(...standaloneSignedExtremes.value.positive, 0);
    const standMin   = Math.min(...standaloneSignedExtremes.value.negative, 0);
    const premax = Math.max(stackedMax, standMax);
    const premin = Math.min(stackedMin, standMin);

    const scale = (!FINAL_CONFIG.value.style.chart.lines.distributed &&
                    (FINAL_CONFIG.value.style.chart.grid.scale.scaleMax !== null ||
                        FINAL_CONFIG.value.style.chart.grid.scale.scaleMin !== null))
        ? calculateNiceScaleWithExactExtremes(
            FINAL_CONFIG.value.style.chart.grid.scale.scaleMin !== null
                ? FINAL_CONFIG.value.style.chart.grid.scale.scaleMin
                : (premin > 0 ? 0 : premin),
            FINAL_CONFIG.value.style.chart.grid.scale.scaleMax !== null
                ? FINAL_CONFIG.value.style.chart.grid.scale.scaleMax
                : (premax < 0 ? 0 : premax),
            FINAL_CONFIG.value.style.chart.grid.scale.ticks
        )
        : calculateNiceScale(
            FINAL_CONFIG.value.style.chart.grid.scale.scaleMin !== null
                ? FINAL_CONFIG.value.style.chart.grid.scale.scaleMin
                : (premin > 0 ? 0 : premin),
            FINAL_CONFIG.value.style.chart.grid.scale.scaleMax !== null
                ? FINAL_CONFIG.value.style.chart.grid.scale.scaleMax
                : (premax < 0 ? 0 : premax),
            FINAL_CONFIG.value.style.chart.grid.scale.ticks
        );

    const { min: MIN, max: MAX } = scale;
    const maxTotal = (MAX + (MIN >= 0 ? 0 : Math.abs(MIN))) || 1;

    const cumPos = Array(winLen).fill(0);
    const cumNeg = Array(winLen).fill(0);

    const computeXFromRelativeIndex = (rel) => {
        if (winLen <= 1) return drawingArea.value.left + drawingArea.value.width / 2;
        return drawingArea.value.left + (rel / (winLen - 1)) * drawingArea.value.width;
    };

    return unmutableDataset.value
        .filter(ds => !segregated.value.includes(ds.id))
        .map(ds => {
            const relIndices = [];
            const seriesVals = [];
            const signedVals = [];
            const baseY = new Array(winLen).fill(null);
            const topY  = new Array(winLen).fill(null);

            for (let rel = 0; rel < winLen; rel += 1) {
                const abs  = winStart + rel;
                const raw  = ds.series?.[abs];
                const sign = ds.signedSeries?.[abs];

                const isMissing = raw == null || Number.isNaN(raw);
                const dp = isMissing ? 0 : raw;

                const proportion = ds.standalone
                    ? (dp / maxTotal)
                    : (FINAL_CONFIG.value.style.chart.lines.distributed
                        ? (dp / (datasetTotals.value[rel] || 1))
                        : (dp / maxTotal));

                if (dp >= 0) {
                    const h = totalHeight * Math.abs(proportion);
                    if (ds.standalone) {
                        baseY[rel] = ZERO_POSITION;
                        topY[rel]  = ZERO_POSITION - h;
                    } else {
                        const prev = cumPos[rel];
                        const newCum = prev + h;
                        baseY[rel] = ZERO_POSITION - prev;
                        topY[rel]  = ZERO_POSITION - newCum;
                        cumPos[rel] = newCum;
                    }
                } else {
                    const h = totalHeight * Math.abs(proportion);
                    if (ds.standalone) {
                        baseY[rel] = ZERO_POSITION;
                        topY[rel]  = ZERO_POSITION + h;
                    } else {
                        const prev = cumNeg[rel];
                        const newCum = prev + h;
                        baseY[rel] = ZERO_POSITION + prev;
                        topY[rel]  = ZERO_POSITION + newCum;
                        cumNeg[rel] = newCum;
                    }
                }

                relIndices.push(rel);
                seriesVals.push(dp);
                signedVals.push(sign ?? (dp >= 0 ? 1 : -1));
            }

            const points = relIndices.map(rel => ({ x: computeXFromRelativeIndex(rel), y: topY[rel] }));
            const x = points.map(p => p.x);

            const absoluteTotal = seriesVals.reduce((a, b) => a + Math.abs(b || 0), 0);
            const safeTotal = absoluteTotal === 0 ? 1 : absoluteTotal;

            const proportions = seriesVals.map((dp, i) => {
                if (FINAL_CONFIG.value.style.chart.lines.distributed && !ds.standalone) {
                    const rel = relIndices[i];
                    const denom = datasetTotals.value[rel] || 1;
                    return (dp || 0) / denom;
                }
                return (dp || 0) / safeTotal;
            });

            return {
                ...ds,
                x,
                points,
                baseY: relIndices.map(rel => baseY[rel]),
                topY:  relIndices.map(rel => topY[rel]),
                series: seriesVals,
                signedSeries: signedVals,
                proportions,
                rel: relIndices,
                fullSeries: Array.isArray(ds.fullSeries) ? ds.fullSeries : ds.series
            };
        });
});

const formattedDataset = computed(() => {
    const stripMove = (d) =>
        typeof d === 'string'
        ? d
            .replace(
                /^M\s*[-+]?[\d.]+(?:e[-+]?\d+)?\s*,?\s*[-+]?[\d.]+(?:e[-+]?\d+)?\s*/i,
                ''
            )
            .trim()
        : '';

    const stackedMax = Math.max(...datasetSignedTotals.value.positive, 0);
    const stackedMin = Math.min(...datasetSignedTotals.value.negative, 0);
    const standMax   = Math.max(...standaloneSignedExtremes.value.positive, 0);
    const standMin   = Math.min(...standaloneSignedExtremes.value.negative, 0);

    const premax = Math.max(stackedMax, standMax);
    const premin = Math.min(stackedMin, standMin);

    const scale =
        !FINAL_CONFIG.value.style.chart.lines.distributed &&
        (FINAL_CONFIG.value.style.chart.grid.scale.scaleMax !== null ||
        FINAL_CONFIG.value.style.chart.grid.scale.scaleMin !== null)
        ? calculateNiceScaleWithExactExtremes(
            FINAL_CONFIG.value.style.chart.grid.scale.scaleMin !== null
                ? FINAL_CONFIG.value.style.chart.grid.scale.scaleMin
                : (premin > 0 ? 0 : premin),
            FINAL_CONFIG.value.style.chart.grid.scale.scaleMax !== null
                ? FINAL_CONFIG.value.style.chart.grid.scale.scaleMax
                : (premax < 0 ? 0 : premax),
            FINAL_CONFIG.value.style.chart.grid.scale.ticks
            )
        : calculateNiceScale(
            FINAL_CONFIG.value.style.chart.grid.scale.scaleMin !== null
                ? FINAL_CONFIG.value.style.chart.grid.scale.scaleMin
                : (premin > 0 ? 0 : premin),
            FINAL_CONFIG.value.style.chart.grid.scale.scaleMax !== null
                ? FINAL_CONFIG.value.style.chart.grid.scale.scaleMax
                : (premax < 0 ? 0 : premax),
            FINAL_CONFIG.value.style.chart.grid.scale.ticks
            );

    const SCALE_MIN = Number(scale.min) || 0;
    const SCALE_MAX = Number(scale.max) || 0;
    const ABS_MIN = Math.abs(SCALE_MIN);
    const RANGE = (SCALE_MAX + ABS_MIN) || 1;

    const valueToMiniY = (v) => {
        if (FINAL_CONFIG.value.style.chart.lines.distributed) {
            const clamped = Math.max(0, Math.min(1, v));
            return minimapH - minimapH * clamped;
        }

        return clampY(minimapH - minimapH * (((v ?? 0) + ABS_MIN) / RANGE));
    };

    return _formattedDataset.value.map((ds) => {
        const n = ds.x.length;
        const fullSeries = Array.isArray(ds.fullSeries) ? ds.fullSeries : ds.series;

        const xMinimap = ({ left = 0, unitW }) => {
            const m = fullSeries.length;
            if (!Number.isFinite(unitW) || unitW <= 0 || m <= 0) return [];
            if (m === 1) return [left + unitW * 0.5];
            return fullSeries.map((_, i) => left + i * unitW);
        };

        const yMinimap = ({ minimapH }) => {
            if (!Number.isFinite(minimapH) || minimapH <= 0) return [];
            return fullSeries.map((v) => valueToMiniY(v || 0, minimapH));
        };

        const yMinimapBase = ({ minimapH }) => {
            if (!Number.isFinite(minimapH) || minimapH <= 0) return [];
            const zeroY = valueToMiniY(0, minimapH);
            return fullSeries.map(() => zeroY);
        };

        if (n === 0) {
            return {
                ...ds,
                points: [],
                smoothPath: '',
                straightPath: '',
                smoothArea: '',
                straightArea: '',
                xMinimap,
                yMinimap,
                yMinimapBase
            };
        }

        const topPts  = ds.x.map((x, i) => ({ x, y: ds.topY[i]  }));
        const basePts = ds.x.map((x, i) => ({ x, y: ds.baseY[i] }));
        const topSmooth   = n >= 2 ? createSmoothPath(topPts)   : `M${topPts[0].x},${topPts[0].y}`;
        const topStraight = n >= 2 ? createStraightPath(topPts) : `M${topPts[0].x},${topPts[0].y}`;

        // IMPORTANT: for single-point, DO NOT strip leading M; use path as-is.
        const smoothPath   = n >= 2 ? `M${stripMove(topSmooth)}`   : topSmooth;
        const straightPath = n >= 2 ? `M${stripMove(topStraight)}` : topStraight;

        let smoothArea = '';
        let straightArea = '';

        if (FINAL_CONFIG.value.style.chart.lines.useArea && n >= 2) {
            const baseSmoothRv   = createSmoothPath([...basePts].reverse());
            const baseStraightRv = createStraightPath([...basePts].reverse());
            const baseEnd = basePts[basePts.length - 1];

            smoothArea = `M${topPts[0].x},${topPts[0].y} ${stripMove(topSmooth)} L${baseEnd.x},${baseEnd.y} ${stripMove(baseSmoothRv)} Z`;
            straightArea = `M${topPts[0].x},${topPts[0].y} ${stripMove(topStraight)} L${baseEnd.x},${baseEnd.y} ${stripMove(baseStraightRv)} Z`;
        }

        return {
            ...ds,
            points: topPts,
            smoothPath,
            straightPath,
            smoothArea,
            straightArea,
            xMinimap,
            yMinimap,
            yMinimapBase
        };
    });
});

const isSettingUp = ref(false);
const slicerReady = ref(false);

function validSlicerEnd(v) {
    const _max = maxSeries.value;

    if (v > _max) {
        return _max;
    }
    if (v < 0 || (v < slicer.value.start)) {
        if (FINAL_CONFIG.value.style.chart.zoom.startIndex !== null) {
            return slicer.value.start + 1
        } else {
            return 1
        }
    }
    return v;
}

function setupSlicer() {
    if (isSettingUp.value) return;
    isSettingUp.value = true;
    try {
        const { startIndex, endIndex } = FINAL_CONFIG.value.style.chart.zoom;
        const max = maxSeries.value;

        const start = startIndex != null ? startIndex : 0;
        const end = endIndex   != null ? Math.min(validSlicerEnd(endIndex + 1), max) : max;

        suppressChild.value = true;
        slicer.value.start = start;
        slicer.value.end   = end;
        slicerPrecog.value.start = start;
        slicerPrecog.value.end   = end;
        normalizeSlicerWindow();
        slicerReady.value = true;
    } finally {
        queueMicrotask(() => { suppressChild.value = false; });
        isSettingUp.value = false;
    }
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

const boundsX = computed(() => ({
    left: drawingArea.value.left,
    right: drawingArea.value.right,
    width: drawingArea.value.width
}))

const suppressChild = ref(false);

const WIDTH = computed(() => defaultSizes.value.width);
const HEIGHT = computed(() => defaultSizes.value.height);

useTimeLabelCollision({
    timeLabelsEls: timeLabelsEls,
    timeLabels,
    slicer,
    configRef: FINAL_CONFIG,
    rotationPath: ['style', 'chart', 'grid', 'x', 'timeLabels', 'rotation'],
    autoRotatePath: ['style', 'chart', 'grid', 'x', 'timeLabels', 'autoRotate', 'enable'],
    isAutoSize: false,
    width: WIDTH,
    height: HEIGHT,
    rotation: FINAL_CONFIG.value.style.chart.grid.x.timeLabels.autoRotate.angle
});

const hoveredIndex = ref(null);

function clientToSvgCoords(evt) {
    const svgEl = svgRef.value;
    if (!svgEl) return null;

    // Precise mapping (handles fullscreen & letterboxing)
    if (svgEl.createSVGPoint && svgEl.getScreenCTM) {
        const pt = svgEl.createSVGPoint();
        pt.x = evt.clientX;
        pt.y = evt.clientY;
        const ctm = svgEl.getScreenCTM();
        if (ctm) {
            const p = pt.matrixTransform(ctm.inverse());
            return { x: p.x, y: p.y, ok: true };
        }
    }

    // Fallback (preserveAspectRatio meet)
    const rect = svgEl.getBoundingClientRect();
    const vb = svgEl.viewBox?.baseVal || { x: 0, y: 0, width: rect.width, height: rect.height };
    const scale = Math.min(rect.width / vb.width, rect.height / vb.height);
    const drawnW = vb.width * scale;
    const drawnH = vb.height * scale;
    const offsetX = (rect.width - drawnW) / 2;
    const offsetY = (rect.height - drawnH) / 2;
    const x = (evt.clientX - rect.left - offsetX) / scale + vb.x;
    const y = (evt.clientY - rect.top  - offsetY) / scale + vb.y;
    return { x, y, ok: true };
}

let RAF_MOUSE_MOVE = 0;
const WINDOW_LEN = computed(() => Math.max(1, (slicer.value.end - slicer.value.start)));

const STEP_X = computed(() =>
    WINDOW_LEN.value > 1 ? drawingArea.value.width / (WINDOW_LEN.value - 1) : 0
);

function xAtVisibleIndex(i) {
    return WINDOW_LEN.value <= 1
        ? drawingArea.value.left + drawingArea.value.width / 2
        : drawingArea.value.left + i * STEP_X.value;
}

function highlighterRectAt(i) {
    if (WINDOW_LEN.value <= 1) {
        return { x: drawingArea.value.left, width: drawingArea.value.width };
    }
    const leftEdge =
        i === 0
        ? drawingArea.value.left
        : (xAtVisibleIndex(i - 1) + xAtVisibleIndex(i)) / 2;

    const rightEdge =
        i === WINDOW_LEN.value - 1
        ? drawingArea.value.left + drawingArea.value.width
        : (xAtVisibleIndex(i) + xAtVisibleIndex(i + 1)) / 2;

    return { x: leftEdge, width: Math.max(0, rightEdge - leftEdge) };
}

function onSvgMouseMove(e) {
    if (isAnnotator.value) return;
    if (RAF_MOUSE_MOVE) cancelAnimationFrame(RAF_MOUSE_MOVE);

    RAF_MOUSE_MOVE = requestAnimationFrame(() => {
        RAF_MOUSE_MOVE = 0;

        const svgPt = clientToSvgCoords(e);
        if (!svgPt || !svgRef.value) { onSvgMouseLeave(); return; }

        const { left, right, top, bottom } = drawingArea.value;
        if (svgPt.x < left || svgPt.x > right || svgPt.y < top || svgPt.y > bottom) {
            onSvgMouseLeave();
            return;
        }

        let idx = 0;
        if (WINDOW_LEN.value > 1) {
            const raw = (svgPt.x - left) / STEP_X.value;
            idx = Math.round(raw);
        } else {
            idx = 0;
        }

        if (idx < 0) idx = 0;
        if (idx > WINDOW_LEN.value - 1) idx = WINDOW_LEN.value - 1;

        if (hoveredIndex.value !== idx) {
            hoveredIndex.value = idx;
            toggleTooltipVisibility(true, idx);
        }
    });
}

function onSvgClick(e) {
    const svgPt = clientToSvgCoords(e);
    if (!svgPt || !svgRef.value) return;

    const { left, right, top, bottom } = drawingArea.value;
    if (svgPt.x < left || svgPt.x > right || svgPt.y < top || svgPt.y > bottom) return;

    let relIdx = 0;
    if (WINDOW_LEN.value > 1) {
        const raw = (svgPt.x - left) / STEP_X.value;
        relIdx = Math.round(raw);
    } else {
        relIdx = 0;
    }

    if (relIdx < 0) relIdx = 0;
    if (relIdx > WINDOW_LEN.value - 1) relIdx = WINDOW_LEN.value - 1;

    selectX({
        seriesIndex: relIdx,
        datapoint: getDatapoint(relIdx)
    });

    selectDatapoint(relIdx);
}


function selectDatapoint(index) {
    const datapoint = JSON.parse(JSON.stringify(formattedDataset.value)).map(fd => {
        return {
            name: fd.name,
            value: fd.series[index] === 0 ? 0 : fd.series[index] || null,
            proportion: fd.proportions[index] || null,
            color: fd.color,
            id: fd.id
        }
    });

    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex: index + slicer.value.start })
    }

    emit('selectDatapoint', { datapoint, period: timeLabels.value[index] });
}

watch(
    () => [slicer.value.start, slicer.value.end, formattedDataset.value.length],
    () => {
        const len = WINDOW_LEN.value;
        if (selectedSerieIndex.value == null) return;
        if (len <= 0) {
            selectedSerieIndex.value = null;
            return;
        }
        if (selectedSerieIndex.value < 0) selectedSerieIndex.value = 0;
        if (selectedSerieIndex.value > len - 1) selectedSerieIndex.value = len - 1;
    }
);

function onSvgMouseLeave() {
    if (RAF_MOUSE_MOVE) {
        cancelAnimationFrame(RAF_MOUSE_MOVE);
        RAF_MOUSE_MOVE = 0;
    }
    hoveredIndex.value = null;
    toggleTooltipVisibility(false, null);
}

const selectedSerieIndex = ref(null);

const selectedSeries = computed(() => {
    const rel = selectedSerieIndex.value;
    const abs = rel == null ? null : absIndex(rel);

    return formattedDataset.value.map(datapoint => {
        return {
            slotAbsoluteIndex: datapoint.absoluteIndex,
            shape: datapoint.shape || 'circle',
            name: datapoint.name,
            color: datapoint.color,
            value: rel == null ? null : datapoint.series.find((_s, i) => i === rel),
            sourceValue: abs == null ? null : datapoint.seriesSource?.[abs],
            comments: datapoint.comments || [],
            id: datapoint.id,
            standalone: !!datapoint.standalone,
        }
    });
});

const tooltipContent = computed(() => {
    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;
    const allRows = [...selectedSeries.value].reverse();
    const stackedRows = allRows.filter(s => !s.standalone);
    const standaloneRows = allRows.filter(s => s.standalone);

    const sum = stackedRows
        .map(s => s.value)
        .filter(v => isSafeValue(v) && v !== null)
        .reduce((a, b) => Math.abs(a) + Math.abs(b), 0);

    if (
        isFunction(customFormat) &&
        functionReturnsString(() =>
            customFormat({
                absoluteIndex: selectedSerieIndex.value + slicer.value.start,
                seriesIndex: selectedSerieIndex.value,
                datapoint: selectedSeries.value,
                series: unmutableDataset.value,
                config: FINAL_CONFIG.value
            })
        )
    ) {
        return customFormat({
            absoluteIndex: selectedSerieIndex.value + slicer.value.start,
            seriesIndex: selectedSerieIndex.value,
            datapoint: selectedSeries.value,
            series: unmutableDataset.value,
            config: FINAL_CONFIG.value
        });
    }

    const {
        showValue,
        showTotal,
        totalTranslation,
        showPercentage,
        borderColor,
        roundingValue,
        roundingPercentage
    } = FINAL_CONFIG.value.style.chart.tooltip;

    const shapeSvg = (ds) => {
        if (!ds.shape || !['star','triangle','square','diamond','pentagon','hexagon'].includes(ds.shape)) {
            return `<svg viewBox="0 0 12 12" height="14" width="14"><circle cx="6" cy="6" r="6" stroke="${FINAL_CONFIG.value.style.chart.tooltip.backgroundColor}" stroke-width="1" fill="${ds.color}" /></svg>`;
        }
        if (ds.shape === 'star') {
            return `<svg viewBox="0 0 12 12" height="14" width="14"><polygon stroke="${FINAL_CONFIG.value.style.chart.tooltip.backgroundColor}" stroke-width="1" fill="${ds.color}" points="${createStar({ plot: { x: 6, y: 6 }, radius: 5 })}" /></svg>`;
        }
        if (ds.shape === 'triangle') {
            return `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6 }, radius: 6, sides: 3, rotation: 0.52 }).path}" fill="${ds.color}" stroke="${FINAL_CONFIG.value.style.chart.tooltip.backgroundColor}" stroke-width="1" /></svg>`;
        }
        if (ds.shape === 'square') {
            return `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6 }, radius: 6, sides: 4, rotation: 0.8 }).path}" fill="${ds.color}" stroke="${FINAL_CONFIG.value.style.chart.tooltip.backgroundColor}" stroke-width="1" /></svg>`;
        }
        if (ds.shape === 'diamond') {
            return `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6 }, radius: 5, sides: 4, rotation: 0 }).path}" fill="${ds.color}" stroke="${FINAL_CONFIG.value.style.chart.tooltip.backgroundColor}" stroke-width="1" /></svg>`;
        }
        if (ds.shape === 'pentagon') {
            return `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6 }, radius: 5, sides: 5, rotation: 0.95 }).path}" fill="${ds.color}" stroke="${FINAL_CONFIG.value.style.chart.tooltip.backgroundColor}" stroke-width="1" /></svg>`;
        }
        // hexagon
        return `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6 }, radius: 5, sides: 6, rotation: 0 }).path}" fill="${ds.color}" stroke="${FINAL_CONFIG.value.style.chart.tooltip.backgroundColor}" stroke-width="1" /></svg>`;
    };

    const rowHtml = (ds, withPct) => {
        const pct = withPct
        ? dataLabel({
            v: isNaN((ds.value ?? 0) / (sum || 1))
                ? 0
                : (Math.abs(ds.value ?? 0) / (sum || 1)) * 100,
            s: '%',
            r: roundingPercentage
            })
        : '';

        const parenLeft = (showValue && withPct) ? '(' : '';
        const parenRight = (showValue && withPct) ? ')' : '';

        return `
        <div style="display:flex;flex-direction:row;align-items:center;gap:4px">
            <div style="width:20px;height:20px;display:flex;align-items:center;justify-content:center;">${shapeSvg(ds)}</div>
            ${ds.name}${showValue || withPct ? ':' : ''} 
            ${showValue ? applyDataLabel(
            FINAL_CONFIG.value.style.chart.lines.dataLabels.formatter,
            ds.sourceValue,
            dataLabel({
                p: FINAL_CONFIG.value.style.chart.lines.dataLabels.prefix,
                v: ds.sourceValue,
                s: FINAL_CONFIG.value.style.chart.lines.dataLabels.suffix,
                r: roundingValue
            }, { datapoint: ds })
            ) : ''} ${parenLeft}${pct}${parenRight}
        </div>
        `;
    };

    let html = '';

    if (
        (timeLabels.value[selectedSerieIndex.value] && timeLabels.value[selectedSerieIndex.value].text) ||
        (preciseAllTimeLabelsTooltip.value[selectedSerieIndex.value] && preciseAllTimeLabelsTooltip.value[selectedSerieIndex.value].text) &&
        FINAL_CONFIG.value.style.chart.tooltip.showTimeLabel
    ) {
        html += `<div style="width:100%;text-align:center;border-bottom:1px solid ${borderColor};padding-bottom:6px;margin-bottom:3px;">${
        FINAL_CONFIG.value.style.chart.tooltip.useDefaultTimeFormat
            ? timeLabels.value[selectedSerieIndex.value]?.text
            : preciseAllTimeLabelsTooltip.value[selectedSerieIndex.value]?.text ||
            allTimeLabels.value[selectedSerieIndex.value]?.text ||
            ''
        }</div>`;
    }

    if (showTotal && stackedRows.length > 1) {
        html += `<div class="vue-data-ui-tooltip-total" style="display:flex;flex-direction:row;align-items:center;gap:4px">
        <span>${totalTranslation}:</span>
        <span>${
            applyDataLabel(
            FINAL_CONFIG.value.style.chart.lines.dataLabels.formatter,
            forceValidValue(sum),
            dataLabel({
                p: FINAL_CONFIG.value.style.chart.lines.dataLabels.prefix,
                v: forceValidValue(sum),
                s: FINAL_CONFIG.value.style.chart.lines.dataLabels.suffix,
                r: roundingValue
            }),
            { datapoint: { name: totalTranslation, value: forceValidValue(sum) } }
            )
        }</span>
        </div>`;
    }

    stackedRows.forEach(ds => {
        html += rowHtml(ds, showPercentage);
    });

    if (standaloneRows.length) {
        html += `<div style="border-top:1px solid ${stackedDataset.value.length ? borderColor : 'transparent'}; margin:${stackedDataset.value.length ? '6px 0' : '0'};"></div>`;
        standaloneRows.forEach(ds => {
            html += rowHtml(ds, false);
        });
    }

    return `<div>${html}</div>`;
});

function toggleTooltipVisibility(show, selectedIndex = null) {
    if (allSegregated.value) return;
    isTooltip.value = show;

    const datapoint = formattedDataset.value.map(s => {
        return {
            name: s.name,
            value: [null, undefined, NaN].includes(s.series[selectedIndex]) ? null : s.series[selectedIndex],
            color: s.color,
        }
    })

    
    if (show) {
        selectedSerieIndex.value = selectedIndex;
        selectX({ seriesIndex: selectedIndex, datapoint });
        if (FINAL_CONFIG.value.events.datapointEnter) {
            FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex: selectedIndex + slicer.value.start })
        }
    } else {
        selectedSerieIndex.value = null;
        emit('selectX', { seriesIndex: null, dataset: null, indexLabel: null });
        if (FINAL_CONFIG.value.events.datapointLeave) {
            FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex: selectedIndex + slicer.value.start })
        }
    }
}

function selectTimeLabel(label, relativeIndex) {
    const datapoint = JSON.parse(JSON.stringify(formattedDataset.value)).map(fd => {
        return {
            name: fd.name,
            value: fd.series[relativeIndex] === 0 ? 0 : (fd.signedSeries[relativeIndex] === -1 ? (fd.series[relativeIndex] >= 0 ? -fd.series[relativeIndex] : fd.series[relativeIndex]) : fd.series[relativeIndex]) || null,
            proportion: fd.proportions[relativeIndex] || null,
            color: fd.color,
            id: fd.id
        }
    });

    emit('selectTimeLabel', {
        datapoint,
        absoluteIndex: label.absoluteIndex,
        label: label.text
    });
}

function toggleLegend() {
    if (segregated.value.length) {
        segregated.value = [];
    } else {
        legendSet.value.forEach(l => {
            segregated.value.push(l.id);
        });
    }
}

function segregate(item) {
    if (segregated.value.includes(item.id)) {
        segregated.value = segregated.value.filter(el => el !== item.id);
    } else {
        if ( segregated.value.length === unmutableDataset.value.length - 1) return; 
        segregated.value.push(item.id);
    }
    emit('selectLegend', formattedDataset.value)
}

const legendSet = computed(() => {
    return unmutableDataset.value.map((ds) => {
        return {
            ...ds,
            opacity: segregated.value.includes(ds.id) ? 0.5 : 1,
            segregate: () => segregate(ds),
            isSegregated: segregated.value.includes(ds.id)
        }
    });
});

const legendConfig = computed(() => {
    return {
        cy: 'stackline-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
});

function validSeriesToToggle(name) {
    if (!unmutableDataset.value.length) {
        if (FINAL_CONFIG.value.debug) {
            console.warn('VueUiStackline - There are no series to show.');
        }
        return null;
    }
    const dp = unmutableDataset.value.find(d => d.name === name);
    if (!dp) {
        if (FINAL_CONFIG.value.debug) {
            console.warn(`VueUiStackline - Series name not found "${name}"`);
        }
        return null;
    }
    return dp;
}

function showSeries(name) {
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (segregated.value.includes(dp.id)) {
        segregate({ id : dp.id });
    }
}

function hideSeries(name) {
    const dp  = validSeriesToToggle(name);
    if (dp === null) return;
    if (!segregated.value.includes(dp.id))  {
        segregate({ id: dp.id });
    }
}

const tableCsv = computed(() => {
    if (formattedDataset.value.length === 0) {
        return { head: [], body: [], config: {}, columnNames: [] };
    }

    const head = formattedDataset.value.map(({ name, color }) => ({ label: name, color }));
    const body = [];

    displayedTimeLabels.value.forEach((tl) => {
        const abs = tl.absoluteIndex;
        const rowLabel = FINAL_CONFIG.value.style.chart.grid.x.timeLabels.values?.[abs] ? tl.text : (abs + 1);
        const row = [rowLabel];

        unmutableDataset.value.forEach(s => {
            const raw = s.series?.[abs];
            const val = Number(((raw ?? 0)).toFixed(FINAL_CONFIG.value.table.td.roundingValue));
            row.push(val);
        });

        body.push(row);
    });

    return { head, body };
});


function generateCsv(callback=null) {
    const title = [[FINAL_CONFIG.value.style.chart.title.text], [FINAL_CONFIG.value.style.chart.title.subtitle.text], [""]];
    const head = ["",...tableCsv.value.head.map(h => h.label)];
    const body = tableCsv.value.body;
    const table = title.concat([head]).concat(body);
    const csvContent = createCsvContent(table);

    if (!callback) {
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-stackline'});
    } else {
        callback(csvContent);
    }
}

const dataTable = computed(() => {
    const head = ['']
        .concat(formattedDataset.value.map(ds => ds.name))
        .concat(` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`);

    const rows = [];
    const len = Math.max(0, (slicer.value.end - slicer.value.start));

    for (let rel = 0; rel < len; rel += 1) {
        const abs = absIndex(rel);

        // Label
        const label = FINAL_CONFIG.value.style.chart.grid.x.timeLabels.values?.[abs]
            ? (timeLabels.value?.[rel]?.text ?? (abs + 1))
            : (abs + 1);

        // Values (relative index in formattedDataset, which is already sliced)
        const values = formattedDataset.value.map(ds => {
            const v = ds.series?.[rel] ?? 0;
            return Number(v.toFixed(FINAL_CONFIG.value.table.td.roundingValue));
        });

        // TOTAL must exclude standalone series
        const stackedRowSeries = formattedDataset.value.filter(ds => !ds.standalone);
        const sum = stackedRowSeries
            .map(ds => ds.series?.[rel] ?? 0)
            .reduce((a, b) => a + b, 0);

        rows.push([label].concat(values).concat(Number(sum.toFixed(FINAL_CONFIG.value.table.td.roundingValue))));
    }

    const config = {
        th: {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            outline: FINAL_CONFIG.value.table.th.outline
        },
        td: {
            backgroundColor: FINAL_CONFIG.value.table.td.backgroundColor,
            color: FINAL_CONFIG.value.table.td.color,
            outline: FINAL_CONFIG.value.table.td.outline
        },
        breakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint
    };

    const colNames = [FINAL_CONFIG.value.table.columnNames.period]
        .concat(formattedDataset.value.map(ds => ds.name))
        .concat(FINAL_CONFIG.value.table.columnNames.total);

    return { head, body: rows, config, colNames };
});


const svgBg = computed(() => FINAL_CONFIG.value.style.chart.backgroundColor);
const svgLegend = computed(() => FINAL_CONFIG.value.style.chart.legend);
const svgTitle = computed(() => FINAL_CONFIG.value.style.chart.title);

const { exportSvg, getSvg } = useSvgExport({
    svg: svgRef,
    title: svgTitle,
    legend: svgLegend,
    legendItems: legendSet,
    backgroundColor: svgBg
});

async function generateSvg({ isCb }) {
    isCallbackSvg.value = true;

    await nextTick();

    try {
        if (isCb) {
            const { blob, url, text, dataUrl } = await getSvg();
            await Promise.resolve(FINAL_CONFIG.value.userOptions.callbacks.svg({ blob, url, text, dataUrl }));
        } else {
            await Promise.resolve(exportSvg());
        }
    } finally {
        isCallbackSvg.value = false;
    }
}

async function getImage({ scale = 2} = {}) {
    if (!stacklineChart.value) return;
    const { width, height } = stacklineChart.value.getBoundingClientRect();
    const aspectRatio = width / height; 
    const { imageUri, base64 } = await img(({ domElement: stacklineChart.value, base64: true, img: true, scale}))
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio
    }
}

const tableComponent = computed(() => {
    const useDialog = FINAL_CONFIG.value.table.useDialog && !FINAL_CONFIG.value.table.show;
    const open = mutableConfig.value.showTable;
    return {
        component: useDialog ? BaseDraggableDialog : Accordion,
        title: `${FINAL_CONFIG.value.style.chart.title.text}${FINAL_CONFIG.value.style.chart.title.subtitle.text ? `: ${FINAL_CONFIG.value.style.chart.title.subtitle.text}` : ''}`,
        props: useDialog ? {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            headerColor: FINAL_CONFIG.value.table.th.color,
            headerBg: FINAL_CONFIG.value.table.th.backgroundColor,
            isFullscreen: isFullscreen.value,
            fullscreenParent: stacklineChart.value,
            forcedWidth: Math.min(800, window.innerWidth * 0.8),
            isCursorPointer: isCursorPointer.value
        } : {
            hideDetails: true,
            config: {
                open,
                maxHeight: 10000,
                body: {
                    backgroundColor: FINAL_CONFIG.value.style.chart.backgroundColor,
                    color: FINAL_CONFIG.value.style.chart.color
                },
                head: {
                    backgroundColor: FINAL_CONFIG.value.style.chart.backgroundColor,
                    color: FINAL_CONFIG.value.style.chart.color
                }
            }
        }
    }
});

watch(() => mutableConfig.value.showTable, v => {
    if (FINAL_CONFIG.value.table.show) return;
    if (v && FINAL_CONFIG.value.table.useDialog && tableUnit.value) {
        tableUnit.value.open()
    } else {
        if ('close' in tableUnit.value) {
            tableUnit.value.close()
        }
    }
});

function closeTable() {
    mutableConfig.value.showTable = false;
    if (userOptionsRef.value) {
        userOptionsRef.value.setTableIconState(false);
    }
}

function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
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

function getData() {
    return formattedDataset.value
}

function getDatapoint(seriesIndex) {
    const rel = seriesIndex ?? 0;
    const abs = absIndex(rel);

    return JSON.parse(JSON.stringify(formattedDataset.value)).map(fd => {
        const valueRel = fd.series[rel];
        const signRel = fd.signedSeries?.[rel];
        const applied =
            valueRel === 0
                ? 0
                : (signRel === -1
                    ? (valueRel >= 0 ? -valueRel : valueRel)
                    : valueRel) || null;

        return {
            name: fd.name,
            absoluteIndex: fd.absoluteIndex,
            value: applied,
            proportion: fd.proportions?.[rel] || null,
            color: fd.color,
            id: fd.id,
            timeLabel: allTimeLabels.value?.[abs] || null
        }
    });
}

const datapointsForSlicerCustomFormat = computed(() => {
    return Array(maxSeries.value).fill(0).map((_,i) => getDatapoint(i))
});

watch(() => props.selectedXIndex, (v) => {
    if ([null, undefined].includes(props.selectedXIndex)) {
        selectedSerieIndex.value = null;
        return;
    }

    const targetIndex = v - slicer.value.start;
    if (targetIndex < 0 || v >= slicer.value.end) {
        selectedSerieIndex.value = null;
    } else {
        selectedSerieIndex.value = targetIndex ?? null;
    }
}, { immediate: true })

const minimapScale = computed(() => {
    if (FINAL_CONFIG.value.style.chart.lines.distributed) {
        return { min: -1, max: 1 };
    }

    const stacked = stackedDataset.value;
    const standalone = standaloneDatasetOnly.value;
    const maxLen = Math.max(
        1,
        ...[...stacked, ...standalone].map(ds => (ds.series?.length || 0))
    );

    const posStack = Array(maxLen).fill(0);
    const negStack = Array(maxLen).fill(0);
    stacked.forEach(ds => {
        for (let i = 0; i < maxLen; i += 1) {
        const v = ds.series[i] ?? 0;
        if (v >= 0) posStack[i] += v;
        else        negStack[i] += v;
        }
    });

    const posStandalone = Array(maxLen).fill(0);
    const negStandalone = Array(maxLen).fill(0);
    standalone.forEach(ds => {
        for (let i = 0; i < maxLen; i += 1) {
        const v = ds.series[i] ?? 0;
        if (v > 0)  posStandalone[i] = Math.max(posStandalone[i], v);
        if (v < 0)  negStandalone[i] = Math.min(negStandalone[i], v);
        }
    });

    const globalMax = Math.max(0, ...posStack, ...posStandalone);
    const globalMin = Math.min(0, ...negStack, ...negStandalone);

    const reqMin = FINAL_CONFIG.value.style.chart.grid.scale.scaleMin;
    const reqMax = FINAL_CONFIG.value.style.chart.grid.scale.scaleMax;
    const ticks  = FINAL_CONFIG.value.style.chart.grid.scale.ticks;
    const useExact = !FINAL_CONFIG.value.style.chart.lines.distributed &&
                    (reqMin !== null || reqMax !== null);

    const scale = useExact
        ? calculateNiceScaleWithExactExtremes(
            reqMin !== null ? reqMin : (globalMin > 0 ? 0 : globalMin),
            reqMax !== null ? reqMax : (globalMax < 0 ? 0 : globalMax),
            ticks
        )
        : calculateNiceScale(
            reqMin !== null ? reqMin : (globalMin > 0 ? 0 : globalMin),
            reqMax !== null ? reqMax : (globalMax < 0 ? 0 : globalMax),
            ticks
        );

    return { min: Number(scale.min) || 0, max: Number(scale.max) || 0 };
});


function makeMinimap({ minimapH, unitW }) {
    const stripMove = (d) =>
        typeof d === 'string'
        ? d.replace(/^M\s*[-+]?[\d.]+(?:e[-+]?\d+)?\s*,?\s*[-+]?[\d.]+(?:e[-+]?\d+)?\s*/i, '').trim()
        : '';

    if (!Number.isFinite(minimapH) || minimapH <= 0 || !Number.isFinite(unitW) || unitW <= 0) {
        return '';
    }

    const stacked = formattedDataset.value.filter(dp => !dp.standalone);
    const standalone = formattedDataset.value.filter(dp => dp.standalone);

    const maxLen = Math.max(0, ...formattedDataset.value.map(dp => (Array.isArray(dp.fullSeries) ? dp.fullSeries.length : dp.series.length)));
    if (maxLen <= 0) return '';

    const X = maxLen === 1 ? [unitW * 0.5] : Array.from({ length: maxLen }, (_, i) => i * unitW);

    // Distributed variant
    if (FINAL_CONFIG.value.style.chart.lines.distributed) {
        // Denominator per index: sum of ABS values of all stacked series (avoid mid "zero")
        const totalsAbs = Array.from({ length: maxLen }, (_, i) => {
            let s = 0;
            stacked.forEach(dp => {
                const full = Array.isArray(dp.fullSeries) ? dp.fullSeries : dp.series;
                const v = full?.[i];
                if (v != null && !Number.isNaN(v)) s += Math.abs(v);
            });
            return s || 1;
        });

        const yFromProp = (p) => {
            const clamped = Math.max(0, Math.min(1, p || 0));
            return minimapH - minimapH * clamped;
        };

        const parts = [];
        const cum = Array(maxLen).fill(0);

        stacked.forEach(dp => {
            const full = Array.isArray(dp.fullSeries) ? dp.fullSeries : dp.series;
            const topP = new Array(maxLen);
            const baseP = new Array(maxLen);

            for (let i = 0; i < maxLen; i += 1) {
                const v = full?.[i];
                const prop = (v == null || Number.isNaN(v)) ? 0 : Math.abs(v) / totalsAbs[i];
                baseP[i] = cum[i];
                cum[i] += prop;
                topP[i] = cum[i];
            }

            const Ytop = topP.map(yFromProp);
            const Ybase = baseP.map(yFromProp);
            const topPts = X.map((x, i) => ({ x, y: Ytop[i] }));
            const basePts = X.map((x, i) => ({ x, y: Ybase[i] }));

            const topSmooth = createSmoothPath(topPts);
            const baseSmoothRv = createSmoothPath([...basePts].reverse());
            const topStraight = createStraightPath(topPts);
            const baseStraightRv = createStraightPath([...basePts].reverse());
            const baseEnd = basePts[basePts.length - 1];

            if (FINAL_CONFIG.value.style.chart.lines.useArea) {
                const areaD = FINAL_CONFIG.value.style.chart.lines.smooth
                ? `M${topPts[0].x},${topPts[0].y} ${stripMove(topSmooth)} L${baseEnd.x},${baseEnd.y} ${stripMove(baseSmoothRv)} Z`
                : `M${topPts[0].x},${topPts[0].y} ${stripMove(topStraight)} L${baseEnd.x},${baseEnd.y} ${stripMove(baseStraightRv)} Z`;

                parts.push(
                `<path d="${areaD}"
                    fill="${slots.pattern ? `url(#pattern_${uid.value}_${dp.absoluteIndex})` : (FINAL_CONFIG.value.style.chart.lines.gradient.show ? dp.color : dp.color)}"
                    opacity="${FINAL_CONFIG.value.style.chart.lines.areaOpacity}"
                    stroke="none" />`
                );
            }

            const lineD = FINAL_CONFIG.value.style.chart.lines.smooth
                ? `M${topPts[0].x},${topPts[0].y} ${stripMove(topSmooth)}`
                : `M${topPts[0].x},${topPts[0].y} ${stripMove(topStraight)}`;

            parts.push(
                `<path d="${lineD}"
                fill="none"
                stroke="${dp.color}"
                stroke-width="${FINAL_CONFIG.value.style.chart.lines.strokeWidth}"
                stroke-linecap="round" />`
            );
        });

        // Standalone series as proportional lines (ABS value / totalsAbs)
        if (standalone.length) {
            standalone.forEach(dp => {
                const full = Array.isArray(dp.fullSeries) ? dp.fullSeries : dp.series;
                const Y = Array.from({ length: maxLen }, (_, i) => yFromProp(Math.abs(full?.[i] ?? 0) / totalsAbs[i]));
                const pts = X.map((x, i) => ({ x, y: Y[i] }));
                const smooth = createSmoothPath(pts);
                const straight = createStraightPath(pts);

                const lineD = FINAL_CONFIG.value.style.chart.lines.smooth
                ? `M${pts[0].x},${pts[0].y} ${stripMove(smooth)}`
                : `M${pts[0].x},${pts[0].y} ${stripMove(straight)}`;

                parts.push(
                `<path d="${lineD}"
                    fill="none"
                    stroke="${dp.color}"
                    stroke-width="${FINAL_CONFIG.value.style.chart.lines.strokeWidth}"
                    stroke-linecap="round" />`
                );
            });
        }

        return parts.join('');
    }

    // Non distributed variant
    const MIN = minimapScale.value.min;
    const MAX = minimapScale.value.max;
    const ABS_MIN = Math.abs(MIN);
    const RANGE = (MAX + ABS_MIN) || 1;

    const clampY = (y) => Math.max(0, Math.min(minimapH, y));
    const valueToMiniY = (v) => clampY(minimapH - minimapH * (((v ?? 0) + ABS_MIN) / RANGE));

    const parts = [];

    if (stacked.length) {
        const cumPos = Array(maxLen).fill(0);
        const cumNeg = Array(maxLen).fill(0);

        stacked.forEach(dp => {
            const full = Array.isArray(dp.fullSeries) ? dp.fullSeries : dp.series;
            const topVals = new Array(maxLen);
            const baseVals = new Array(maxLen);

            for (let i = 0; i < maxLen; i += 1) {
                const v = full?.[i] ?? 0;
                if (v >= 0) {
                    baseVals[i] = cumPos[i];
                    cumPos[i] += v;
                    topVals[i] = cumPos[i];
                } else {
                    baseVals[i] = cumNeg[i];
                    cumNeg[i] += v;
                    topVals[i] = cumNeg[i];
                }
            }

            const Ytop = topVals.map(valueToMiniY);
            const Ybase = baseVals.map(valueToMiniY);
            const topPts = X.map((x, i) => ({ x, y: Ytop[i] }));
            const basePts = X.map((x, i) => ({ x, y: Ybase[i] }));

            const topSmooth = createSmoothPath(topPts);
            const baseSmoothRv = createSmoothPath([...basePts].reverse());
            const topStraight = createStraightPath(topPts);
            const baseStraightRv = createStraightPath([...basePts].reverse());
            const baseEnd = basePts[basePts.length - 1];

            if (FINAL_CONFIG.value.style.chart.lines.useArea) {
                const areaD = FINAL_CONFIG.value.style.chart.lines.smooth
                ? `M${topPts[0].x},${topPts[0].y} ${stripMove(topSmooth)} L${baseEnd.x},${baseEnd.y} ${stripMove(baseSmoothRv)} Z`
                : `M${topPts[0].x},${topPts[0].y} ${stripMove(topStraight)} L${baseEnd.x},${baseEnd.y} ${stripMove(baseStraightRv)} Z`;

                parts.push(
                `<path d="${areaD}"
                    fill="${slots.pattern ? `url(#pattern_${uid.value}_${dp.absoluteIndex})` : (FINAL_CONFIG.value.style.chart.lines.gradient.show ? dp.color : dp.color)}"
                    opacity="${FINAL_CONFIG.value.style.chart.lines.areaOpacity}"
                    stroke="none" />`
                );
            }

            const lineD = FINAL_CONFIG.value.style.chart.lines.smooth
                ? `M${topPts[0].x},${topPts[0].y} ${stripMove(topSmooth)}`
                : `M${topPts[0].x},${topPts[0].y} ${stripMove(topStraight)}`;

            parts.push(
                `<path d="${lineD}"
                fill="none"
                stroke="${dp.color}"
                stroke-width="${FINAL_CONFIG.value.style.chart.lines.strokeWidth}"
                stroke-linecap="round" />`
            );
        });
    }

    if (standalone.length) {
        standalone.forEach(dp => {
            const full = Array.isArray(dp.fullSeries) ? dp.fullSeries : dp.series;
            const Y = full.map(valueToMiniY);
            const topPts = X.map((x, i) => ({ x, y: Y[i] }));
            const topSmooth = createSmoothPath(topPts);
            const topStraight = createStraightPath(topPts);

            const lineD = FINAL_CONFIG.value.style.chart.lines.smooth
                ? `M${topPts[0].x},${topPts[0].y} ${stripMove(topSmooth)}`
                : `M${topPts[0].x},${topPts[0].y} ${stripMove(topStraight)}`;

            parts.push(
                `<path d="${lineD}"
                fill="none"
                stroke="${dp.color}"
                stroke-width="${FINAL_CONFIG.value.style.chart.lines.strokeWidth}"
                stroke-linecap="round" />`
            );
        });
    }
    return parts.join('');
}

function isLabelDisplayed(value, proportion) {
    const cfg = FINAL_CONFIG.value.style.chart.lines;
    const dl = cfg.dataLabels;

    if (cfg.showDistributedPercentage && cfg.distributed) {
        if (!canHideSmallPercentages.value) {
            return dl.hideEmptyPercentages ? Math.abs(proportion) > 0 : true;
        }
        if (proportion === 0) {
            return !dl.hideEmptyPercentages;
        }
        return Math.abs(proportion) * 100 >= dl.hideUnderPercentage;
    } else {
        if (canHideSmallPercentages.value) {
            if (canHideSmallValues.value && debug.value) {
                console.warn('Vue Data UI - VueUiStackline - You cannot set both dataLabels.hideUnderPercentage and dataLabels.hideUnderValue. Note that dataLabels.hideUnderPercentage takes precedence in this case.');
            }
            return Math.abs(value) > (maxCurrentValue.value * dl.hideUnderPercentage) / 100;
        }
        if (!canHideSmallValues.value) {
            return dl.hideEmptyValues ? value !== 0 : true;
        }
        return Math.abs(value) >= dl.hideUnderValue;
    }
}


const maxCurrentValue = computed(() => {
    return Math.max(...formattedDataset.value.flatMap(ds => ds.series))
})

function plotDataLabel(val, datapoint, index, dpIndex, signed) {

    const appliedValue = signed === - 1 ? (val >= 0 ? -val : val) : val
    return applyDataLabel(
        FINAL_CONFIG.value.style.chart.lines.dataLabels.formatter,
        appliedValue,
        dataLabel({
            p: FINAL_CONFIG.value.style.chart.lines.dataLabels.prefix,
            v: appliedValue,
            s: FINAL_CONFIG.value.style.chart.lines.dataLabels.suffix,
            r: FINAL_CONFIG.value.style.chart.lines.dataLabels.rounding,
        }),
        { datapoint, seriesIndex: index, datapointIndex: dpIndex }
    )
}

function plotDataLabelPercentage(val, datapoint, index, dpIndex) {
    return applyDataLabel(
        FINAL_CONFIG.value.style.chart.lines.dataLabels.formatter,
        val,
        dataLabel({
            v: isNaN(val) ? 0 : val,
            s: '%',
            r: FINAL_CONFIG.value.style.chart.lines.dataLabels.rounding,
        }),
        { datapoint, seriesIndex: index, datapointIndex: dpIndex }
    )
}

function selectX({ seriesIndex, datapoint }) {
    const index = slicer.value.start + seriesIndex
    emit('selectX', {
        dataset: datapoint,
        index,
        indexLabel: FINAL_CONFIG.value.style.chart.grid.x.timeLabels.values[index]
    })
}

function onGenerateImage(payload) {
    if (payload?.stage === "start") {
        isCallbackImaging.value = true;
        return;
    }

    if (payload?.stage === "end") {
        isCallbackImaging.value = false;
        return;
    }

    generateImage();
}

async function copyAlt(){
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: formattedDataset.value
    })
    if (!FINAL_CONFIG.value.userOptions.callbacks.altCopy) {
        console.warn('Vue Data UI - A callback must be set for `altCopy` in userOptions.');
        return
    }
    await Promise.resolve(FINAL_CONFIG.value.userOptions.callbacks.altCopy({ 
        config: FINAL_CONFIG.value, 
        dataset: formattedDataset.value
    }));
}

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
    toggleLabels,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen,
    copyAlt
});

</script>

<template>
    <div 
        :id="`stackline_${uid}`"
        ref="stacklineChart"
        :class="{'vue-data-ui-component': true, 'vue-ui-stackline': true, 'vue-data-ui-wrapper-fullscreen' : isFullscreen }" 
        :style="`background:${FINAL_CONFIG.style.chart.backgroundColor};color:${FINAL_CONFIG.style.chart.color};font-family:${FINAL_CONFIG.style.fontFamily}; position: relative; ${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`"
        @mouseenter="onChartEnter" 
        @mouseleave="onChartLeave"
    >
        <!-- PEN AND PAPER -->
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            :isCursorPointer="isCursorPointer"
            @close="toggleAnnotator"
        >
            <template #annotator-action-close>
                <slot name="annotator-action-close"/>
            </template>
            <template #annotator-action-color="{ color }">
                <slot name="annotator-action-color" v-bind="{ color }"/>
            </template>
            <template #annotator-action-draw="{ mode }">
                <slot name="annotator-action-draw" v-bind="{ mode }"/>
            </template>
            <template #annotator-action-undo="{ disabled }">
                <slot name="annotator-action-undo" v-bind="{ disabled }"/>
            </template>
            <template #annotator-action-redo="{ disabled }">
                <slot name="annotator-action-redo" v-bind="{ disabled }"/>
            </template>
            <template #annotator-action-delete="{ disabled }">
                <slot name="annotator-action-delete" v-bind="{ disabled }"/>
            </template>
        </PenAndPaper>

        <slot name="userConfig"/>

        <div 
            ref="noTitle" 
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`" 
        />

        <!-- TITLE -->
        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'stackline-title',
                        ...FINAL_CONFIG.style.chart.title,
                    },
                    subtitle: {
                        cy: 'stackline-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <div :id="`legend-top-${uid}`" />

        <!-- USER OPTIONS -->
        <UserOptions
            ref="userOptionsRef"
            :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.style.chart.tooltip.show && FINAL_CONFIG.userOptions.buttons.tooltip"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasLabel="FINAL_CONFIG.userOptions.buttons.labels"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :hasAltCopy="FINAL_CONFIG.userOptions.buttons.altCopy"
            :isFullscreen="isFullscreen"
            :chartElement="stacklineChart"
            :position="FINAL_CONFIG.userOptions.position"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{...FINAL_CONFIG.userOptions.buttonTitles }"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
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
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }"
        >
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }"/>
            </template>
            <template #optionTooltip v-if="$slots.optionTooltip">
                <slot name="optionTooltip"/>
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
            <template #optionLabels v-if="$slots.optionLabels">
                <slot name="optionLabels" />
            </template>
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
            <template v-if="$slots.optionAltCopy" #optionAltCopy="{ altCopy: c }">
                <slot name="optionAltCopy" v-bind="{ altCopy: c }"/>
            </template>
        </UserOptions>

        <svg
            ref="svgRef"
            :xmlns="XMLNS"
            :viewBox="`0 0 ${drawingArea.chartWidth <= 0 ? 10 : drawingArea.chartWidth} ${drawingArea.chartHeight <= 0 ? 10 : drawingArea.chartHeight}`"
            :class="{ 'vue-data-ui-loading' : loading, 'no-transition': !FINAL_CONFIG.useCssAnimation }"
            :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.chart.color}`"
            role="img" 
            aria-live="polite" 
            preserveAspectRatio="xMidYMid"
            @mousemove="onSvgMouseMove"
            @mouseleave="onSvgMouseLeave"
            @click="onSvgClick"
        >

            <PackageVersion />

            <template v-for="dp in stackedDataset">
                <defs v-if="$slots.pattern">
                    <slot name="pattern" v-bind="{ seriesIndex: dp.absoluteIndex, patternId: `pattern_${uid}_${dp.absoluteIndex}`}"/>
                </defs>
            </template>

            <!-- BACKGROUND SLOT -->
                <foreignObject 
                    v-if="$slots['chart-background']"
                    :x="boundsX.left"
                    :y="drawingArea.top"
                    :width="boundsX.width"
                    :height="drawingArea.height"
                    :style="{
                        pointerEvents: 'none'
                    }"
                >
                    <slot name="chart-background"/>
                </foreignObject>

            <!-- GRADIENT DEFS -->
            <defs v-if="FINAL_CONFIG.style.chart.lines.gradient.show">
                <linearGradient 
                    v-for="(ds, i) in formattedDataset" 
                    :id="`gradient_${ds.id}`" 
                    x1="0%" 
                    y1="0%" 
                    x2="0%" 
                    y2="100%"
                >
                    <stop offset="0%" :stop-color="ds.color"/>
                    <stop offset="100%" :stop-color="lightenHexColor(ds.color, FINAL_CONFIG.style.chart.lines.gradient.intensity / 100)"/>
                </linearGradient>
            </defs>

            <!-- HORIZONTAL GRID -->
            <template v-if="FINAL_CONFIG.style.chart.grid.x.showHorizontalLines">
                <line
                    v-for="(yLabel, i) in yLabels"
                    :x1="boundsX.left"
                    :x2="boundsX.right"
                    :y1="yLabel.y"
                    :y2="yLabel.y"
                    :stroke="FINAL_CONFIG.style.chart.grid.x.linesColor"
                    :stroke-width="FINAL_CONFIG.style.chart.grid.x.linesThickness"
                    :stroke-dasharray="FINAL_CONFIG.style.chart.grid.x.linesStrokeDasharray"
                    stroke-linecap="round"
                />
            </template>

            <!-- VERTICAL GRID -->
            <template v-if="FINAL_CONFIG.style.chart.grid.y.showVerticalLines">
                <line
                    v-for="(_, i) in (slicer.end - slicer.start)"
                    :x1="xAtVisibleIndex(i)"
                    :x2="xAtVisibleIndex(i)"
                    :y1="drawingArea.top"
                    :y2="drawingArea.bottom"
                    :stroke="FINAL_CONFIG.style.chart.grid.y.linesColor"
                    :stroke-width="FINAL_CONFIG.style.chart.grid.y.linesThickness"
                    :stroke-dasharray="FINAL_CONFIG.style.chart.grid.y.linesStrokeDasharray"
                    stroke-linecap="round"
                />
            </template>

            <!-- X AXIS -->
            <line
                data-cy="line-axis-x"
                v-if="FINAL_CONFIG.style.chart.grid.x.showAxis"
                :x1="boundsX.left"
                :x2="boundsX.right"
                :y1="drawingArea.bottom"
                :y2="drawingArea.bottom"
                :stroke="FINAL_CONFIG.style.chart.grid.x.axisColor"
                :stroke-width="FINAL_CONFIG.style.chart.grid.x.axisThickness"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <!-- Y AXIS -->
            <line
                data-cy="line-axis-y"
                v-if="FINAL_CONFIG.style.chart.grid.y.showAxis && !FINAL_CONFIG.style.chart.lines.distributed"
                :x1="boundsX.left"
                :x2="boundsX.left"
                :y1="drawingArea.top"
                :y2="drawingArea.bottom"
                :stroke="FINAL_CONFIG.style.chart.grid.y.axisColor"
                :stroke-width="FINAL_CONFIG.style.chart.grid.y.axisThickness"
                stroke-linecap="round"
                stroke-linejoin="round"
            />

            <!-- X AXIS LABEL -->
            <text
                ref="xAxisLabel"
                data-cy="axis-label-x"
                v-if="FINAL_CONFIG.style.chart.grid.x.axisName.show && FINAL_CONFIG.style.chart.grid.x.axisName.text"
                :x="drawingArea.left + (drawingArea.width / 2)"
                :y="drawingArea.chartHeight - 3"
                :font-size="FINAL_CONFIG.style.chart.grid.x.axisName.fontSize"
                :fill="FINAL_CONFIG.style.chart.grid.x.axisName.color"
                :font-weight="FINAL_CONFIG.style.chart.grid.x.axisName.bold ? 'bold': 'normal'"
                text-anchor="middle"
            >
                {{ FINAL_CONFIG.style.chart.grid.x.axisName.text }}
            </text>

            <!-- Y AXIS LABEL -->
            <text
                ref="yAxisLabel"
                data-cy="axis-label-y"
                v-if="FINAL_CONFIG.style.chart.grid.y.axisName.show && FINAL_CONFIG.style.chart.grid.y.axisName.text"
                :transform="`translate(${FINAL_CONFIG.style.chart.grid.y.axisName.fontSize}, ${drawingArea.top + (drawingArea.height / 2)}) rotate(-90)`"
                :font-size="FINAL_CONFIG.style.chart.grid.y.axisName.fontSize"
                :fill="FINAL_CONFIG.style.chart.grid.y.axisName.color"
                :font-weight="FINAL_CONFIG.style.chart.grid.y.axisName.bold ? 'bold': 'normal'"
                text-anchor="middle"
            >
                {{ FINAL_CONFIG.style.chart.grid.y.axisName.text }}
            </text>

            <!-- FRAME -->
            <rect 
                data-cy="frame" 
                v-if="FINAL_CONFIG.style.chart.grid.frame.show"
                :style="{ pointerEvents: 'none', transition: 'none', animation: 'none !important' }"
                :x="boundsX.left" 
                :y="drawingArea.top"
                :width="boundsX.width"
                :height="drawingArea.height" 
                fill="transparent"
                :stroke="FINAL_CONFIG.style.chart.grid.frame.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.grid.frame.strokeWidth"
                :stroke-linecap="FINAL_CONFIG.style.chart.grid.frame.strokeLinecap"
                :stroke-linejoin="FINAL_CONFIG.style.chart.grid.frame.strokeLinejoin"
                :stroke-dasharray="FINAL_CONFIG.style.chart.grid.frame.strokeDasharray" 
            />

            <!-- AREAS & LINES -->
            <template v-for="ds in formattedDataset">
                <path 
                    v-if="FINAL_CONFIG.style.chart.lines.useArea && !ds.standalone"
                    :d="FINAL_CONFIG.style.chart.lines.smooth ? ds.smoothArea : ds.straightArea"
                    :fill="$slots.pattern ? `url(#pattern_${uid}_${ds.absoluteIndex})` : FINAL_CONFIG.style.chart.lines.gradient.show ? `url(#gradient_${ds.id})` : ds.color"
                    :opacity="FINAL_CONFIG.style.chart.lines.areaOpacity"
                    :style="{
                        transition: loading || !FINAL_CONFIG.useCssAnimation ? undefined: 'all 0.3s ease-in-out'
                    }"
                />
            </template>
            <template v-for="ds in formattedDataset">
                <path
                    :d="FINAL_CONFIG.style.chart.lines.smooth ? ds.smoothPath : ds.straightPath"
                    :stroke="ds.color"
                    :stroke-width="FINAL_CONFIG.style.chart.lines.strokeWidth"
                    fill="none"
                    stroke-linecap="round"
                    :style="{
                        transition: loading || !FINAL_CONFIG.useCssAnimation ? undefined: 'all 0.3s ease-in-out'
                    }"
                />
            </template>

            <!-- SCALE LABELS -->
            <template v-if="FINAL_CONFIG.style.chart.grid.y.axisLabels.show && !FINAL_CONFIG.style.chart.lines.distributed">
                <g ref="scaleLabels">
                    <line
                        data-cy="scale-line-y"
                        v-for="(yLabel, i) in yLabels"
                        :x1="boundsX.left"
                        :x2="boundsX.left - 6"
                        :y1="yLabel.y"
                        :y2="yLabel.y"
                        :stroke="FINAL_CONFIG.style.chart.grid.x.axisColor"
                        :stroke-width="1"
                    />
                    <text
                        data-cy="scale-label-y"
                        v-for="(yLabel, i) in yLabels"
                        :x="yLabel.x"
                        :y="yLabel.y + FINAL_CONFIG.style.chart.grid.y.axisLabels.fontSize / 3"
                        :font-size="FINAL_CONFIG.style.chart.grid.y.axisLabels.fontSize"
                        :font-weight="FINAL_CONFIG.style.chart.grid.y.axisLabels.bold ? 'bold' : 'normal'"
                        :fill="FINAL_CONFIG.style.chart.grid.y.axisLabels.color"
                        text-anchor="end"
                    >
                        {{ 
                            applyDataLabel(
                                FINAL_CONFIG.style.chart.grid.y.axisLabels.formatter,
                                yLabel.value,
                                dataLabel({
                                    p: FINAL_CONFIG.style.chart.lines.dataLabels.prefix,
                                    v: yLabel.value,
                                    s: FINAL_CONFIG.style.chart.lines.dataLabels.suffix,
                                    r: FINAL_CONFIG.style.chart.grid.y.axisLabels.rounding,
                                }),
                                { datapoint: yLabel }
                            )
                        }}
                    </text>
                </g>
            </template>

            <!-- TIME LABELS -->
            <template v-if="FINAL_CONFIG.style.chart.grid.x.timeLabels.show">
                <g ref="timeLabelsEls">
                    <g v-if="$slots['time-label']">
                        <g v-for="(timeLabel, i) in displayedTimeLabels">
                            <slot name="time-label" v-bind="{
                                x: drawingArea.left + (lineSlot * i) + lineSlot / 2,
                                y: drawingArea.bottom + FINAL_CONFIG.style.chart.grid.x.timeLabels.fontSize * 1.3 + FINAL_CONFIG.style.chart.grid.x.timeLabels.offsetY,
                                fontSize: FINAL_CONFIG.style.chart.grid.x.timeLabels.fontSize,
                                fill: FINAL_CONFIG.style.chart.grid.x.timeLabels.color,
                                transform: `translate(${drawingArea.left + (lineSlot * i) + lineSlot / 2}, ${drawingArea.bottom + FINAL_CONFIG.style.chart.grid.x.timeLabels.fontSize * 1.3 + FINAL_CONFIG.style.chart.grid.x.timeLabels.offsetY}), rotate(${FINAL_CONFIG.style.chart.grid.x.timeLabels.rotation})`,
                                absoluteIndex: timeLabel.absoluteIndex,
                                content: timeLabel.text,
                                textAnchor: FINAL_CONFIG.style.chart.grid.x.timeLabels.rotation > 0 ? 'start' : FINAL_CONFIG.style.chart.grid.x.timeLabels.rotation < 0 ? 'end' : 'middle',
                                show: true
                            }"/>
                        </g>
                    </g>
                    <g v-else>
                        <g v-for="(timeLabel, i) in displayedTimeLabels">
                            <text
                                v-if="!String(timeLabel.text).includes('\n')"
                                class="vue-data-ui-time-label"
                                :key="i"
                                data-cy="time-label"
                                :text-anchor="FINAL_CONFIG.style.chart.grid.x.timeLabels.rotation > 0
                                    ? 'start'
                                    : FINAL_CONFIG.style.chart.grid.x.timeLabels.rotation < 0
                                    ? 'end'
                                    : 'middle'"
                                :font-size="FINAL_CONFIG.style.chart.grid.x.timeLabels.fontSize"
                                :font-weight="FINAL_CONFIG.style.chart.grid.x.timeLabels.bold ? 'bold' : 'normal'"
                                :fill="FINAL_CONFIG.style.chart.grid.x.timeLabels.color"
                                :transform="`translate(${xAtVisibleIndex(i)}, ${drawingArea.bottom + FINAL_CONFIG.style.chart.grid.x.timeLabels.fontSize * 1.3 + FINAL_CONFIG.style.chart.grid.x.timeLabels.offsetY}), rotate(${FINAL_CONFIG.style.chart.grid.x.timeLabels.rotation})`"
                                :style="{ cursor: isCursorPointer ? 'pointer' : 'default'}"
                                @click="() => selectTimeLabel(timeLabel, i)"
                                >
                                {{ timeLabel.text }}
                            </text>

                            <text
                                v-else
                                :key="i + '-multi'"
                                data-cy="time-label"
                                :text-anchor="FINAL_CONFIG.style.chart.grid.x.timeLabels.rotation > 0
                                    ? 'start'
                                    : FINAL_CONFIG.style.chart.grid.x.timeLabels.rotation < 0
                                    ? 'end'
                                    : 'middle'"
                                :font-size="FINAL_CONFIG.style.chart.grid.x.timeLabels.fontSize"
                                :fill="FINAL_CONFIG.style.chart.grid.x.timeLabels.color"
                                :transform="`
                                    translate(
                                    ${xAtVisibleIndex(i)},
                                    ${drawingArea.bottom + FINAL_CONFIG.style.chart.grid.x.timeLabels.fontSize * 1.3 + FINAL_CONFIG.style.chart.grid.x.timeLabels.offsetY}
                                    ),
                                    rotate(${FINAL_CONFIG.style.chart.grid.x.timeLabels.rotation})
                                `"
                                :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
                                v-html="createTSpansFromLineBreaksOnX({
                                    content: String(timeLabel.text),
                                    fontSize: FINAL_CONFIG.style.chart.grid.x.timeLabels.fontSize,
                                    fill: FINAL_CONFIG.style.chart.grid.x.timeLabels.color,
                                    x: 0,
                                    y: 0
                                })"
                                @click="() => selectTimeLabel(timeLabel, i)"
                            />
                        </g>
                    </g>

                </g>
            </template>

            <!-- HIGHLIGHTER (rect) -->
            <template v-if="(userHovers || ![null, undefined].includes(selectedSerieIndex)) && !FINAL_CONFIG.style.chart.highlighter.useLine">
                <g v-for="(_, i) in (slicer.end - slicer.start)" :key="`tooltip_trap_highlighter_${i}`">
                    <rect
                        data-cy="highlighter"
                        :x="highlighterRectAt(i).x"
                        :y="drawingArea.top"
                        :height="drawingArea.height"
                        :width="highlighterRectAt(i).width"
                        :fill="[selectedMinimapIndex, selectedSerieIndex].includes(i)
                            ? setOpacity(FINAL_CONFIG.style.chart.highlighter.color, FINAL_CONFIG.style.chart.highlighter.opacity)
                            : 'transparent'"
                        :style="{ transition: 'none !important', animation: 'none !important' }"
                    />
                </g>
            </template>

            <!-- HIGHLIGHTER (line) -->
            <template v-if="(userHovers || ![null, undefined].includes(selectedSerieIndex)) && FINAL_CONFIG.style.chart.highlighter.useLine">
                <g v-if="(![null, undefined].includes(selectedSerieIndex) || ![null, undefined].includes(selectedMinimapIndex))">
                    <line
                        :x1="xAtVisibleIndex((selectedSerieIndex ?? selectedMinimapIndex) || 0)"
                        :x2="xAtVisibleIndex((selectedSerieIndex ?? selectedMinimapIndex) || 0)"
                        :y1="forceValidValue(drawingArea.top)"
                        :y2="forceValidValue(drawingArea.bottom)"
                        :stroke="FINAL_CONFIG.style.chart.highlighter.color"
                        :stroke-width="FINAL_CONFIG.style.chart.highlighter.lineWidth"
                        :stroke-dasharray="FINAL_CONFIG.style.chart.highlighter.lineDasharray"
                        stroke-linecap="round"
                        style="transition:none !important; animation: none !important; pointer-events: none;"
                    />
                </g>
            </template>

            <!-- PLOTS -->
            <template v-for="ds in formattedDataset">
                <g v-if="userHovers && (slicer.end - slicer.start) > FINAL_CONFIG.style.chart.lines.dot.hideAboveMaxSerieLength">
                    <template v-if="selectedSerieIndex != null">
                        <template
                        v-if=" ds.rel.includes(selectedSerieIndex) && ds.fullSeries?.[slicer.start + selectedSerieIndex] != null && !Number.isNaN(ds.fullSeries?.[slicer.start + selectedSerieIndex])"
                        >
                            <Shape
                                :shape="['triangle', 'square', 'diamond', 'pentagon', 'hexagon', 'star'].includes(ds.shape) ? ds.shape : 'circle'"
                                :color="FINAL_CONFIG.style.chart.lines.dot.useSerieColor ? ds.color : FINAL_CONFIG.style.chart.lines.dot.fill"
                                :plot="{
                                    x: checkNaN(ds.points[ds.rel.indexOf(selectedSerieIndex)].x),
                                    y: checkNaN(ds.points[ds.rel.indexOf(selectedSerieIndex)].y)
                                }"
                                :radius="FINAL_CONFIG.style.chart.lines.dot.radius * 1.3"
                                :stroke="FINAL_CONFIG.style.chart.lines.dot.useSerieColor ? FINAL_CONFIG.style.chart.backgroundColor : ds.color"
                                :strokeWidth="FINAL_CONFIG.style.chart.lines.dot.strokeWidth"
                                :transition="loading ? undefined : `all ${FINAL_CONFIG.style.chart.lines.transitionDurationMs}ms ease-in-out`"
                            />
                        </template>
                    </template>
                </g>
            </template>

            <template v-for="ds in formattedDataset">
                <template v-if="(slicer.end - slicer.start) < FINAL_CONFIG.style.chart.lines.dot.hideAboveMaxSerieLength">
                    <g v-for="(plot, k) in ds.points" :key="k">
                        <Shape
                            v-if="ds.fullSeries?.[slicer.start + ds.rel[k]] != null && !Number.isNaN(ds.fullSeries?.[slicer.start + ds.rel[k]])"
                            :shape="['triangle', 'square', 'diamond', 'pentagon', 'hexagon', 'star'].includes(ds.shape) ? ds.shape : 'circle'"
                            :color="FINAL_CONFIG.style.chart.lines.dot.useSerieColor ? ds.color : FINAL_CONFIG.style.chart.lines.dot.fill"
                            :plot="{ x: plot.x, y: plot.y }"
                            :radius="userHovers && selectedSerieIndex === ds.rel[k] ? FINAL_CONFIG.style.chart.lines.dot.radius * 1.3 : FINAL_CONFIG.style.chart.lines.dot.radius"
                            :stroke="FINAL_CONFIG.style.chart.lines.dot.useSerieColor ? FINAL_CONFIG.style.chart.backgroundColor : ds.color"
                            :strokeWidth="FINAL_CONFIG.style.chart.lines.dot.strokeWidth"
                            :transition="loading ? undefined : `all ${FINAL_CONFIG.style.chart.lines.transitionDurationMs}ms ease-in-out`"
                        />
                    </g>
                </template>
            </template>

            <!-- SERIES DATALABELS -->
            <template v-if="mutableConfig.dataLabels.show && FINAL_CONFIG.style.chart.lines.dataLabels.hideAboveMaxSerieLength > (slicer.end - slicer.start)">
                <g v-for="(dp, i) in formattedDataset" :key="i">
                    <template v-for="(plot, j) in dp.points" :key="j">
                        <text
                            data-cy="label-datapoint"
                            v-if="isLabelDisplayed(dp.series[j], dp.proportions[j])"
                            :x="plot.x"
                            :y="plot.y + (dp.series[j] >= 0 ? - FINAL_CONFIG.style.chart.lines.dataLabels.fontSize / 2 + FINAL_CONFIG.style.chart.lines.dataLabels.offsetY : (FINAL_CONFIG.style.chart.lines.dataLabels.fontSize * 1.2) - FINAL_CONFIG.style.chart.lines.dataLabels.offsetY)"
                            :font-size="FINAL_CONFIG.style.chart.lines.dataLabels.fontSize"
                            :fill="FINAL_CONFIG.style.chart.lines.dataLabels.color"
                            :font-weight="FINAL_CONFIG.style.chart.lines.dataLabels.bold ? 'bold' : 'normal'"
                            text-anchor="middle"
                        >
                            {{ FINAL_CONFIG.style.chart.lines.showDistributedPercentage && FINAL_CONFIG.style.chart.lines.distributed
                                ? plotDataLabelPercentage(dp.proportions[j] * 100, dp, i, dp.rel[j])
                                : plotDataLabel(dp.series[j], dp, i, dp.rel[j], dp.signedSeries[j]) }}
                        </text>
                    </template>
                </g>

                <g ref="sumTop" v-if="FINAL_CONFIG.style.chart.lines.totalValues.show && formattedDataset.length > 1">
                    <template v-for="(total, i) in totalLabels">
                        <text
                            data-cy="label-total"
                            v-if="FINAL_CONFIG.style.chart.lines.dataLabels.hideEmptyValues ? total.value !== 0 : true"
                            :x="xAtVisibleIndex(i)"
                            :y="placeLabelTotalY(i)"
                            text-anchor="middle"
                            :font-size="FINAL_CONFIG.style.chart.lines.totalValues.fontSize"
                            :font-weight="FINAL_CONFIG.style.chart.lines.totalValues.bold ? 'bold' : 'normal'"
                            :fill="FINAL_CONFIG.style.chart.lines.totalValues.color"
                        >
                        {{ plotDataLabel(total.value, total, i, i, total.sign) }}
                        </text>
                    </template>
                </g>
            </template>

            <!-- ZOOM PREVIEW -->
            <rect 
                v-if="isPrecog" 
                v-bind="precogRect" 
                :data-start="slicer.start" 
                :data-end="slicer.end"
            />

            <slot name="svg" :svg="{ 
                drawingArea,
                data: formattedDataset,
                isPrintingImg: isPrinting | isImaging | isCallbackImaging,
                isPrintingSvg: isCallbackSvg,
            }"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging || isCallbackImaging || isCallbackSvg }"/>
        </div>

        <!-- LEGEND -->
        <Teleport v-if="readyTeleport" :to="FINAL_CONFIG.style.chart.legend.position === 'top' ? `#legend-top-${uid}` : `#legend-bottom-${uid}`">
            <div ref="chartLegend">
                <Legend 
                    v-if="FINAL_CONFIG.style.chart.legend.show" 
                    :legendSet="legendSet" 
                    :config="legendConfig"
                    :isCursorPointer="isCursorPointer"
                    @clickMarker="({ legend }) => legend.segregate()"
                >
                    <template #legend-pattern="{ legend, index }" v-if="$slots.pattern">
                        <Shape
                            :shape="legend.shape"
                            :radius="30"
                            stroke="none"
                            :plot="{ x: 30, y: 30}"
                            :fill="`url(#pattern_${uid}_${index})`"
                        />
                    </template>
    
                    <template #item="{ legend }">
                        <div @click="legend.segregate()" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`" v-if="!loading">
                            {{ legend.name }}
                        </div>
                    </template>

                    <template #legendToggle>
                        <BaseLegendToggle
                            v-if="legendSet.length > 2 && FINAL_CONFIG.style.chart.legend.selectAllToggle.show && !loading"
                            :backgroundColor="FINAL_CONFIG.style.chart.legend.selectAllToggle.backgroundColor"
                            :color="FINAL_CONFIG.style.chart.legend.selectAllToggle.color"
                            :fontSize="FINAL_CONFIG.style.chart.legend.fontSize"
                            :checked="segregated.length > 0"
                            :isCursorPointer="isCursorPointer"
                            @toggle="toggleLegend"
                        />
                    </template>
                </Legend>
        
                <slot v-else name="legend" v-bind:legend="legendSet" />
            </div>
        </Teleport>

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
                    <BaseIcon name="fileCsv" :stroke="tableComponent.props.color"/>
                </button>
            </template>
            <template #content>
                <DataTable 
                    :colNames="dataTable.colNames"
                    :head="dataTable.head"
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="FINAL_CONFIG.table.useDialog ? '' : tableComponent.title"
                    :withCloseButton="!FINAL_CONFIG.table.useDialog"
                    :isCursorPointer="isCursorPointer"
                    @close="closeTable"
                >
                    <template #th="{ th }">
                        <div v-html="th"/>
                    </template>
                    <template #td="{ td }">
                        {{ !isNaN(Number(td)) ? dataLabel({
                            p: FINAL_CONFIG.style.chart.lines.dataLabels.prefix,
                            v: td,
                            s: FINAL_CONFIG.style.chart.lines.dataLabels.suffix,
                            r: FINAL_CONFIG.table.td.roundingValue,
                        }) : td }}
                    </template>
                </DataTable>
            </template>
        </component>

        <!-- SLICER PREVIEW -->
        <SlicerPreview
            ref="chartSlicer"
            v-if="FINAL_CONFIG.style.chart.zoom.show && isDataset && slicerReady && maxSeries > 6"
            :allMinimaps="allMinimaps"
            :background="FINAL_CONFIG.style.chart.zoom.color"
            :borderColor="FINAL_CONFIG.style.chart.backgroundColor"
            :customFormat="FINAL_CONFIG.style.chart.zoom.customFormat"
            :cutNullValues="false"
            :enableRangeHandles="FINAL_CONFIG.style.chart.zoom.enableRangeHandles"
            :enableSelectionDrag="FINAL_CONFIG.style.chart.zoom.enableSelectionDrag"
            :end="slicer.end"
            :focusOnDrag="FINAL_CONFIG.style.chart.zoom.focusOnDrag"
            :focusRangeRatio="FINAL_CONFIG.style.chart.zoom.focusRangeRatio"
            :fontSize="FINAL_CONFIG.style.chart.zoom.fontSize"
            :immediate="!FINAL_CONFIG.style.chart.zoom.preview.enable"
            :inputColor="FINAL_CONFIG.style.chart.zoom.color"
            :isPreview="isPrecog"
            :labelLeft="FINAL_CONFIG.style.chart.grid.x.timeLabels.values[slicer.start] ? (timeLabels?.[0]?.text ?? '') : ''"
            :labelRight="FINAL_CONFIG.style.chart.grid.x.timeLabels.values[slicer.end-1] ? (timeLabels?.at(-1)?.text ?? '') : ''"
            :max="Math.max(...dataset.map(ds => ds.series.length))"
            :min="0"
            :minimap="datasetTotalsMinimap"
            :minimapCompact="FINAL_CONFIG.style.chart.zoom.minimap.compact"
            :minimapFrameColor="FINAL_CONFIG.style.chart.zoom.minimap.frameColor"
            :minimapIndicatorColor="FINAL_CONFIG.style.chart.zoom.minimap.indicatorColor"
            :minimapMerged="false"
            :minimapSelectedColor="FINAL_CONFIG.style.chart.zoom.minimap.selectedColor"
            :minimapSelectedColorOpacity="FINAL_CONFIG.style.chart.zoom.minimap.selectedColorOpacity"
            :minimapSelectedIndex="selectedSerieIndex"
            :minimapSelectionRadius="1"
            :preciseLabels="preciseAllTimeLabels.length ? preciseAllTimeLabels : allTimeLabels"
            :refreshEndPoint="FINAL_CONFIG.style.chart.zoom.endIndex !== null ? FINAL_CONFIG.style.chart.zoom.endIndex + 1 : Math.max(...dataset.map(ds => ds.series.length))"
            :refreshStartPoint="FINAL_CONFIG.style.chart.zoom.startIndex !== null ? FINAL_CONFIG.style.chart.zoom.startIndex : 0"
            :selectColor="FINAL_CONFIG.style.chart.zoom.highlightColor"
            :selectedSeries="datapointsForSlicerCustomFormat"
            :smoothMinimap="false"
            :start="slicer.start"
            :textColor="FINAL_CONFIG.style.chart.color"
            :timeLabels="allTimeLabels"
            :usePreciseLabels="FINAL_CONFIG.style.chart.grid.x.timeLabels.datetimeFormatter.enable && !FINAL_CONFIG.style.chart.zoom.useDefaultFormat"
            :valueEnd="slicer.end"
            :valueStart="slicer.start"
            :verticalHandles="FINAL_CONFIG.style.chart.zoom.minimap.verticalHandles"
            :maxWidth="FINAL_CONFIG.style.chart.zoom.maxWidth"
            :isCursorPointer="isCursorPointer"
            :additionalMinimapHeight="FINAL_CONFIG.style.chart.zoom.minimap.additionalHeight"
            :handleType="FINAL_CONFIG.style.chart.zoom.minimap.handleType"
            :handleIconColor="FINAL_CONFIG.style.chart.zoom.minimap.handleIconColor"
            :handleBorderWidth="FINAL_CONFIG.style.chart.zoom.minimap.handleBorderWidth"
            :handleBorderColor="FINAL_CONFIG.style.chart.zoom.minimap.handleBorderColor"
            :handleFill="FINAL_CONFIG.style.chart.zoom.minimap.handleFill"
            :handleWidth="FINAL_CONFIG.style.chart.zoom.minimap.handleWidth"
            @update:end="onSlicerEnd"
            @update:start="onSlicerStart"
            @trapMouse="selectMinimapIndex"
            @reset="refreshSlicer"
            @futureEnd="v => setPrecog('end', v)"
            @futureStart="v => setPrecog('start', v)"
        >
            <template #reset-action="{ reset }">
                <slot name="reset-action" v-bind="{ reset }"/>
            </template>

            <template #slotMap="{ width: minimapW, height: minimapH, unitW }">
                <g v-html="makeMinimap({ minimapW, minimapH, unitW})"/>
            </template>
        </SlicerPreview>

        <div :id="`legend-bottom-${uid}`" />

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
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.chart.tooltip.position" 
            :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="stacklineChart" 
            :content="tooltipContent" 
            :isFullscreen="isFullscreen"
            :isCustom="FINAL_CONFIG.style.chart.tooltip.customFormat && typeof FINAL_CONFIG.style.chart.tooltip.customFormat === 'function'"
            :smooth="FINAL_CONFIG.style.chart.tooltip.smooth"
            :backdropFilter="FINAL_CONFIG.style.chart.tooltip.backdropFilter"
            :smoothForce="FINAL_CONFIG.style.chart.tooltip.smoothForce"
            :smoothSnapThreshold="FINAL_CONFIG.style.chart.tooltip.smoothSnapThreshold"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{ ...dataTooltipSlot }"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{ ...dataTooltipSlot }"></slot>
            </template>
        </Tooltip>

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
@import "../vue-data-ui.css";
.vue-ui-stackline * {
    transition: unset;
}

.vue-ui-stackline {
    user-select: none;
    width: 100%;
}
</style>