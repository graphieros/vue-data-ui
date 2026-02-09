<script setup>
import {
    ref,
    computed,
    onMounted,
    watch,
    onBeforeUnmount,
    nextTick,
    useSlots,
    defineAsyncComponent,
    shallowRef,
    toRefs,
    watchEffect
} from "vue";
import {
    applyDataLabel,
    assignStackRatios,
    calculateNiceScale,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createUid,
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    hasDeepProperty,
    isFunction,
    lightenHexColor,
    largestTriangleThreeBucketsArray,
    objectIsEmpty,
    palette,
    sanitizeArray,
    setOpacity,
    themePalettes,
    treeShake,
} from "../lib";
import { throttle } from "../canvas-lib";
import {
    circle,
    cloneCanvas,
    debounce,
    line,
    polygon,
    rect,
    text,
} from "../canvas-lib";
import { useLocale } from "../useLocale";
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading";
import { usePrinter } from "../usePrinter";
import { useDateTime } from "../useDateTime";
import { useNestedProp } from "../useNestedProp";
import { useResponsive } from "../useResponsive";
import { useTimeLabels } from "../useTimeLabels";
import { useThemeCheck } from "../useThemeCheck";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import img from "../img";
import themes from "../themes/vue_ui_xy_canvas.json";
import Legend from "../atoms/Legend.vue"; // Must be ready in responsive mode
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import BaseIcon from "../atoms/BaseIcon.vue";
import Accordion from "./vue-ui-accordion.vue"; // Must be ready in responsive mode
import SlicerPreview from "../atoms/SlicerPreview.vue"; // Must be ready in responsive mode
import BaseScanner from "../atoms/BaseScanner.vue";
import BaseLegendToggle from "../atoms/BaseLegendToggle.vue";

const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const NonSvgPenAndPaper = defineAsyncComponent(() => import('../atoms/NonSvgPenAndPaper.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));

const { vue_ui_xy_canvas: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

const props = defineProps({
    dataset: {
        type: Array,
        default() {
            return []
        }
    },
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    selectedXIndex: {
        type: Number,
        default: undefined
    }
});

const uid = ref(createUid())
const xy = ref(null);
const container = ref(null);
const ctx = ref(null);
const w = ref(1);
const h = ref(1);
const isTooltip = ref(false);
const tooltipIndex = ref(null);
const tooltipContent = ref('');
const dataTooltipSlot = ref(null);
const segregated = ref([]);
const dpr = ref(1);
const datasetHasChanged = ref(true);
const tooltipHasChanged = ref(true);
const clonedCanvas = ref(null);
const step = ref(0);
const isFullscreen = ref(false);
const chartTitle = ref(null);
const chartLegend = ref(null);
const chartSlicer = ref(null);
const source = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);
const mouseY = ref(null);
const readyTeleport = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);
const isSettingUp = ref(false);
const slicerReady = ref(false);
const suppressChild = ref(false);
const selectedMinimapIndex = ref(null);
const isCallbackImaging = ref(false);

const isDataset = computed(() => Array.isArray(FINAL_DATASET.value) && FINAL_DATASET.value.length > 0);

const emit = defineEmits(['selectLegend', 'selectX']);
const slots = useSlots();

onMounted(() => {
    if (slots['chart-background']) {
        console.warn('VueUiXyCanvas does not support the #chart-background slot.')
    }
});

const FINAL_CONFIG = ref(prepareConfig());

const debug = computed(() => !!FINAL_CONFIG.value.debug);

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            userOptions: { show: false },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    grid: {
                        x: {
                            axisColor: '#6A6A6A',
                            timeLabels: { show: false },
                            axisName: '',
                            horizontalLines: {
                                color: '#6A6A6A'
                            }
                        },
                        y: {
                            axisColor: '#6A6A6A',
                            axisLabels: { show: false },
                            axisName: '',
                            verticalLines: {
                                color: '#6A6A6A'
                            }
                        },
                        zeroLine: {
                            color: '#6A6A6A'
                        }
                    },
                    legend: {
                        backgroundColor: '#99999930',
                    },
                    paddingProportions: {
                        left: 0.05
                    },
                    scale: {
                        max: null,
                        min: null,
                    },
                    zoom: {
                        endIndex: null,
                        startIndex: null,
                    }
                }
            }
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {}
    })
})

const { loading, FINAL_DATASET } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: props.config?.skeletonDataset ?? [
        {
            name: '',
            series: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 134],
            type: 'line',
            smooth: true,
            color: '#BABABA'
        },
        {
            name: '',
            series: [0, 0.5, 1, 1.5, 2.5, 4, 6.5, 10.5, 17, 27.5, 44.5, 67],
            type: 'bar',
            color: '#AAAAAA'
        },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value
    })
})

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef:canvas } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

function onChartEnter() {
    setUserOptionsVisibility(true);
}

function onChartLeave() {
    setUserOptionsVisibility(false);
    emit('selectX', { seriesIndex: null, datapoint: null });
    tooltipIndex.value = null;
}

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    })

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

    // -------------------------- TIME LABELS CONFIG FIX --------------------------
    // Time labels were wrongly placed under the Y axis. This fix ensures back compatibility by
    // merging existing time labels placed under Y into X.
    
    if (props.config && hasDeepProperty(props.config, 'style.chart.grid.y.timeLabels')) {
        console.warn('VueUiXyCanvas: you are using the deprecated config.style.chart.grid.y.timeLabels. It is recommended to move this configuration to config.style.chart.grid.x.timeLabels.');

        finalConfig.style.chart.grid.x.timeLabels = useNestedProp({
            defaultConfig: finalConfig.style.chart.grid.x.timeLabels,
            userConfig: props.config.style.chart.grid.y.timeLabels
        });
    }

    return finalConfig;
}

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
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    mutableConfig.value.showDataLabels = FINAL_CONFIG.value.style.chart.dataLabels.show;
    mutableConfig.value.stacked = FINAL_CONFIG.value.style.chart.stacked;
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.chart.tooltip.show;
}, { deep: true });

watch(() => props.dataset, async (d) => {
    if (!Array.isArray(d) || d.length === 0) return;
    await nextTick();

    if (canvas.value && !ctx.value) {
        ctx.value = canvas.value.getContext('2d', { willReadFrequently: true });
    }

    datasetHasChanged.value = true;
    tooltipHasChanged.value = true;
    await refreshSlicer();
    resizeCanvas();
    titleStep.value += 1;
    tableStep.value += 1;
    legendStep.value += 1;
}, { deep: true });

const aspectRatio = ref(FINAL_CONFIG.value.style.chart.aspectRatio);

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `xy_canvas_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-xy-canvas',
    options: FINAL_CONFIG.value.userOptions.print
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showDataLabels: FINAL_CONFIG.value.style.chart.dataLabels.show,
    stacked: FINAL_CONFIG.value.style.chart.stacked,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
});

function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette)
});

const allSegregated = computed(() => segregated.value.length === dsCopy.value.length);

const maxSeries = computed(() => {
    if(!dsCopy.value) return 0
    return Math.max(...dsCopy.value.filter((ds, i) => allSegregated.value ? true : !segregated.value.includes(ds.absoluteIndex)).map(ds => ds.series.length))
});

function selectMinimapIndex(i) {
    selectedMinimapIndex.value = i;
    draw()
}

const measuredBottomExtraPixels = ref(0);
const bottomMeasureAnimationFrameId = ref(0);

function computeTimeLabelsBottomExtraPixels() {
    if (!ctx.value) return 0;
    if (!FINAL_CONFIG.value.style.chart.grid.x.timeLabels.show) return 0;

    const values = timeLabels.value || [];
    const start = slicer.value.start ?? 0;
    const end = slicer.value.end ?? 0;

    const windowLen = Math.max(0, end - start);
    if (!windowLen) return 0;

    const fontSize = Math.round(
        (w.value / 40) * FINAL_CONFIG.value.style.chart.grid.x.timeLabels.fontSizeRatio
    );

    const font = `${FINAL_CONFIG.value.style.chart.grid.x.timeLabels.bold ? 'bold ' : ''}${fontSize}px ${FINAL_CONFIG.value.style.fontFamily}`;
    ctx.value.save();
    ctx.value.font = font;

    let maxTextWidth = 0;
    for (let i = start; i < end; i += 1) {
        const label = values[i]?.text ?? `${i + 1}`;
        const metrics = ctx.value.measureText(String(label));
        if (metrics.width > maxTextWidth) maxTextWidth = metrics.width;
    }

    ctx.value.restore();

    const rotationDeg = FINAL_CONFIG.value.style.chart.grid.x.timeLabels.rotation || 0;
    const rotationRad = (rotationDeg * Math.PI) / 180;

    // Approximate unrotated text height (canvas does not give reliable height)
    const baseTextHeight = fontSize;

    // Rotated bounding-box height approximation:
    // height' = |sin| * width + |cos| * height
    const rotatedTextHeight =
        Math.abs(Math.sin(rotationRad)) * maxTextWidth +
        Math.abs(Math.cos(rotationRad)) * baseTextHeight;

    // In drawTimeLabels(), labels are drawn at:
    // y = drawingArea.bottom + (w / offsetY)
    const offsetY = FINAL_CONFIG.value.style.chart.grid.x.timeLabels.offsetY || 1;
    const baselineShift = w.value / offsetY;

    // Small safety padding to avoid clipping
    return Math.max(0, baselineShift + rotatedTextHeight + 4);
}

function measureBottomExtraNow() {
    measuredBottomExtraPixels.value = computeTimeLabelsBottomExtraPixels();
}

function scheduleMeasureBottomExtra() {
    if (bottomMeasureAnimationFrameId.value) {
        cancelAnimationFrame(bottomMeasureAnimationFrameId.value);
    }

    // Two RAFs ensures canvas size + fonts + state are stable before measuring
    bottomMeasureAnimationFrameId.value = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            measureBottomExtraNow();
        });
    });
}

onBeforeUnmount(() => {
    if (bottomMeasureAnimationFrameId.value) {
        cancelAnimationFrame(bottomMeasureAnimationFrameId.value);
    }
});

const drawingArea = computed(() => {
    const width =
        w.value -
        (w.value *
            (FINAL_CONFIG.value.style.chart.paddingProportions.left +
                FINAL_CONFIG.value.style.chart.paddingProportions.right));

    const baseTop = h.value * FINAL_CONFIG.value.style.chart.paddingProportions.top;
    const baseBottom = h.value * FINAL_CONFIG.value.style.chart.paddingProportions.bottom;

    const extraBottom = measuredBottomExtraPixels.value;

    const bottom = h.value - baseBottom - extraBottom;
    const height = h.value - (baseTop + baseBottom) - extraBottom;

    return {
        canvasWidth: w.value,
        canvasHeight: h.value,
        left: w.value * FINAL_CONFIG.value.style.chart.paddingProportions.left,
        top: baseTop,
        right: w.value - (w.value * FINAL_CONFIG.value.style.chart.paddingProportions.right),
        bottom,
        width,
        height,
        slot: width / (slicer.value.end - slicer.value.start)
    };
});

function proportionToMax(p, m) {
    return p / m;
}

function createDatapointCoordinates({ hasAutoScale, series, min, max, scale, yOffset, individualHeight, stackIndex = null }) {
    return series.map((s, i) => {
        const absMin = scale.min < 0 ? Math.abs(scale.min) : 0;
        const pToMax = proportionToMax(s + absMin, absMin + scale.max)
    
        let autoScaleMin;
        let autoScalePtoMax;

        if (hasAutoScale) {
            autoScaleMin = scale.min;
            autoScalePtoMax = proportionToMax(s - autoScaleMin, scale.max - autoScaleMin)
        }

        let y = 0;

        if (stackIndex === null) {
            y = drawingArea.value.bottom - (drawingArea.value.height * (hasAutoScale ? autoScalePtoMax : pToMax));
        } else {
            y = drawingArea.value.bottom - yOffset - ((individualHeight) * (hasAutoScale ? autoScalePtoMax : pToMax))
        }

        return {
            x: drawingArea.value.left + drawingArea.value.slot * i + (drawingArea.value.slot / 2),
            y,
            value: s
        }
    });
}

const absoluteExtremes = computed(() => {
    const min = FINAL_CONFIG.value.style.chart.scale.min !== null ? FINAL_CONFIG.value.style.chart.scale.min : Math.min(...dsCopy.value.filter((ds, i) => !segregated.value.includes(ds.absoluteIndex)).flatMap(ds => ds.series.slice(slicer.value.start, slicer.value.end)));
    const max = FINAL_CONFIG.value.style.chart.scale.max !== null ? FINAL_CONFIG.value.style.chart.scale.max : Math.max(...dsCopy.value.filter((ds, i) => !segregated.value.includes(ds.absoluteIndex)).flatMap(ds => ds.series.slice(slicer.value.start, slicer.value.end)));
    const scale = calculateNiceScale(min < 0 ? min : 0, max === min ? min + 1 < 0 ? 0 : min + 1 : max < 0 ? 0 : max, FINAL_CONFIG.value.style.chart.scale.ticks);

    const absoluteMin = scale.min < 0 ? Math.abs(scale.min) : 0;
    const zero = drawingArea.value.bottom - (drawingArea.value.height * (absoluteMin / ((scale.max) + absoluteMin)));

    const yLabels = scale.ticks.map(t => {
        return {
            y: drawingArea.value.bottom - (drawingArea.value.height * ((t + absoluteMin) / ((scale.max) + absoluteMin))),
            x: drawingArea.value.left - 8,
            value: t
        }
    });

    return {
        absoluteMin,
        max,
        min,
        scale,
        yLabels,
        zero,
    }
});

const tootlipDataset = computed(() => {
    return formattedDataset.value.map(ds => {
        return `
            <div style="display:flex;flex-direction:row;gap:6px;align-items:center;">
                <svg viewBox="0 0 10 10" height="12" width="12">
                    <circle cx="5" cy="5" r="5" fill="${ds.color}"/>
                </svg>
                <span>${ds.name ? ds.name + ': ' : ''}</span>
                <span>${ applyDataLabel(
                    FINAL_CONFIG.value.style.chart.dataLabels.formatter,
                    ds.series[tooltipIndex.value] ?? '-',
                    dataLabel({
                        p: ds.prefix || '',
                        v: ds.series[tooltipIndex.value] ?? '-',
                        s: ds.suffix || '',
                        r: ds.rounding || 0
                    }),
                    { datapoint: ds, seriesIndex: tooltipIndex.value }
                )}</span>
            </div>
        `
    });
});

const cutNullValues = computed(() => {
    return FINAL_CONFIG.value.style.chart.line.cutNullValues
})

const dsCopy = computed(() => {
    return FINAL_DATASET.value.map((ds, i) => {
        return {
            ...ds,
            series: largestTriangleThreeBucketsArray({
                data: sanitizeArray(ds.series, [], cutNullValues.value),
                threshold: FINAL_CONFIG.value.downsample.threshold
            }),
            absoluteIndex: i,
            color: convertColorToHex(ds.color || customPalette.value[i] || palette[i] || palette[i % palette.length]),
        }
    });
});

const minimap = computed(() => {
    if (!FINAL_CONFIG.value.style.chart.zoom.minimap.show) return [];
    const _source = dsCopy.value.filter(ds => !segregated.value.includes(ds.absoluteIndex));
    const maxIndex = Math.max(..._source.map(datapoint => datapoint.series.length));

    const sumAllSeries = [];
    for (let i = 0; i < maxIndex; i += 1) {
        sumAllSeries.push(_source.map(ds => ds.series[i] || 0).reduce((a, b) => (a || 0) + (b || 0), 0))
    }
    const _min = Math.min(...sumAllSeries);
    return sumAllSeries.map(dp => dp + (_min < 0 ? Math.abs(_min) : 0)) // positivized
});

const allMinimaps = computed(() => {
    if (!FINAL_CONFIG.value.style.chart.zoom.minimap.show) return [];
    const _source = dsCopy.value.map(ds => {
        return {
            ...ds,
            isVisible: !segregated.value.includes(ds.absoluteIndex),
        }
    })

    return _source
})

watch(maxSeries, (v) => {
    if(v) {
        refreshSlicer()
    }
})

const formattedDataset = computed(() => {
    return assignStackRatios(dsCopy.value.filter((ds, i) => !segregated.value.includes(ds.absoluteIndex)))
        .map((ds, i) => {
            return {
                ...ds,
                series: ds.series.slice(slicer.value.start, slicer.value.end),
            }
        })
        .map((ds, i) => {
            let min = [null, undefined].includes(ds.scaleMin) ? (Math.min(...ds.series) || 0) : ds.scaleMin;
            let max = [null, undefined].includes(ds.scaleMax) ? (Math.max(...ds.series) || 1) : ds.scaleMax;

            if (min === max) {
                min = min >= 0 ? max - 1 : min;
                max = max >= 0 ? max : min + 1;
            }

            const autoScaledRatios = ds.series.filter(v => ![null, undefined].includes(v)).map(v => (v - min) / (max - min));
            
            const autoScale = {
                ratios: autoScaledRatios,
                valueMin: min,
                valueMax: max
            }

            const scaleSteps = ds.scaleSteps || FINAL_CONFIG.value.style.chart.scale.ticks;

            let localScale;

            if (ds.autoScaling) {
                localScale = calculateNiceScale(autoScale.valueMin, autoScale.valueMax, scaleSteps)
            } else {
                localScale = calculateNiceScale(autoScale.valueMin < 0 ? autoScale.valueMin : 0, autoScale.valueMax <= 0 ? 0 : autoScale.valueMax, scaleSteps);
            }

            const yOffset = mutableConfig.value.stacked ? drawingArea.value.height * (1 - ds.cumulatedStackRatio) : 0;

            const gap = mutableConfig.value.stacked ? drawingArea.value.height / FINAL_CONFIG.value.style.chart.stackGap : 0;

            const individualHeight = mutableConfig.value.stacked ? (drawingArea.value.height * ds.stackRatio) - gap : drawingArea.value.height;

            const localMin = localScale.min < 0 ? Math.abs(localScale.min) : 0;

            let localZero;

            if (ds.autoScaling && mutableConfig.value.stacked) {
                if (max <= 0) {
                    localZero = drawingArea.value.bottom - yOffset - individualHeight;
                } else {
                    localZero = drawingArea.value.bottom - yOffset - ((individualHeight) * (localMin / ((localScale.max) + localMin)));
                }
            } else {
                localZero = drawingArea.value.bottom - yOffset - ((individualHeight) * (localMin / ((localScale.max) + localMin)));
            }


            const localYLabels = localScale.ticks.map((t, k) => {
                return {
                    y: drawingArea.value.bottom - yOffset - (individualHeight * (k / (localScale.ticks.length - 1))),
                    x: drawingArea.value.left - 8,
                    value: t
                }
            });

            const coordinatesLine = createDatapointCoordinates({
                hasAutoScale: mutableConfig.value.stacked && ds.autoScaling,
                series: ds.series,
                min: mutableConfig.value.stacked ? min : absoluteExtremes.value.min,
                max: mutableConfig.value.stacked ? max : absoluteExtremes.value.max,
                scale: mutableConfig.value.stacked ? localScale : absoluteExtremes.value.scale,
                yOffset,
                individualHeight,
                stackIndex: mutableConfig.value.stacked ? i : null
            });

            return {
                ...ds,
                coordinatesLine,
                min,
                max,
                localScale,
                localZero,
                localMin,
                localYLabels,
                yOffset,
                individualHeight
            }
        });
});

const slicer = ref({
    start: 0,
    end: maxSeries.value
});

const slicerPrecog = ref({ start: 0, end: maxSeries.value });

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

const isPrecog = computed(() => {
    return FINAL_CONFIG.value.style.chart.zoom.preview.enable && (slicerPrecog.value.start !== slicer.value.start || slicerPrecog.value.end !== slicer.value.end);
});

function setPrecog(side, val) {
    slicerPrecog.value[side] = val;
}

async function setupSlicer() {
    if (isSettingUp.value) return;
    isSettingUp.value = true;
    try {
        const { startIndex, endIndex } = FINAL_CONFIG.value.style.chart.zoom;
        const max = Math.max(...dsCopy.value.map(dp => dp.series.length));

        const start = startIndex != null ? startIndex : 0;
        const end   = endIndex   != null ? Math.min(validSlicerEnd(endIndex + 1), max) : max;

        suppressChild.value = true;
        slicer.value.start = start;
        slicer.value.end   = end;
        slicerPrecog.value.start = start;
        slicerPrecog.value.end   = end;

        normalizeSlicerWindow();

        slicerReady.value = true;
        await nextTick();
        if (chartSlicer.value) {
            chartSlicer.value.setStartValue(slicer.value.start);
            chartSlicer.value.setEndValue(slicer.value.end);
        }
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

function validSlicerEnd(v) {
    const max = maxSeries.value;
    if (v > max) {
        return max;
    }
    if (v < 0 || (v < slicer.value.start)) {
        if (FINAL_CONFIG.value.style.chart.zoom.startIndex !== null) {
            return FINAL_CONFIG.value.style.chart.zoom.startIndex + 1
        } else {
            return 1
        }
    }
    return v;
}

function normalizeSlicerWindow() {
    const maxLen = Math.max(
        1,
        Math.max(...dsCopy.value.map(dp => dp.series.length))
    )

    let s = Math.max(0, Math.min(slicer.value.start ?? 0, maxLen - 1))
    let e = Math.max(s + 1, Math.min(slicer.value.end ?? maxLen, maxLen))

    if (!Number.isFinite(s) || !Number.isFinite(e) || e <= s) { s = 0; e = maxLen }

    slicer.value = { start: s, end: e }
    slicerPrecog.value.start = s
    slicerPrecog.value.end = e

    if(chartSlicer.value) {
        chartSlicer.value.setStartValue(s);
        chartSlicer.value.setEndValue(e)
    }
}

const lineAndPlotTypes = computed(() => {
    return formattedDataset.value.filter(ds => {
        return ['line', 'plot', undefined].includes(ds.type)
    });
});

const barTypes = computed(() => {
    return formattedDataset.value.filter(ds => {
        return ds.type === 'bar'
    });
});

function resizeCanvas() {
    if (!canvas.value || !container.value) return;
    const containerWidth = container.value.offsetWidth;
    const containerHeight = container.value.offsetHeight;
    canvas.value.width = containerWidth * dpr.value * 2;
    canvas.value.height = containerHeight * dpr.value * 2;
    w.value = containerWidth * dpr.value * 2;
    h.value = containerHeight * dpr.value * 2;
    ctx.value?.scale(dpr.value, dpr.value);
    draw();
}

watch(isDataset, async (hasData) => {
    if (!hasData) {
        clonedCanvas.value = null;
        isTooltip.value = false;
        tooltipIndex.value = null;
        mouseY.value = null;
        return;
    }
    await nextTick();
    if (canvas.value && !ctx.value) {
        ctx.value = canvas.value.getContext('2d', { willReadFrequently: true });
    }
    datasetHasChanged.value = true;
    tooltipHasChanged.value = true;
    await refreshSlicer();
    resizeCanvas();
    draw();
});

function setupChart() {
    if (!ctx.value) return;

    ctx.value.clearRect(0, 0, 10000, 10000);
    ctx.value.fillStyle = FINAL_CONFIG.value.style.chart.backgroundColor;
    ctx.value.fillRect(0, 0, drawingArea.value.canvasWidth, drawingArea.value.canvasHeight);

    if (!isDataset.value) return;

if (!mutableConfig.value.stacked) {
        // VERTICAL LINES
        if (FINAL_CONFIG.value.style.chart.grid.y.verticalLines.show && (slicer.value.end - slicer.value.start) < FINAL_CONFIG.value.style.chart.grid.y.verticalLines.hideUnderXLength) {
            for (let i = 0; i < (slicer.value.end - slicer.value.start) + 1; i += 1) {
                line(
                    ctx.value,
                    [
                        { x: drawingArea.value.left + drawingArea.value.slot * i, y: drawingArea.value.top },
                        { x: drawingArea.value.left + drawingArea.value.slot * i, y: drawingArea.value.bottom }
                    ],
                    {
                        color: FINAL_CONFIG.value.style.chart.grid.y.verticalLines.color
                    }
                );
            }
        } else if(FINAL_CONFIG.value.style.chart.grid.y.verticalLines.show && (slicer.value.end - slicer.value.start) >= FINAL_CONFIG.value.style.chart.grid.y.verticalLines.hideUnderXLength) {
            for (let i = slicer.value.start; i < slicer.value.end; i += 1) {

                if(i % Math.floor((slicer.value.end - slicer.value.start) / FINAL_CONFIG.value.style.chart.grid.x.timeLabels.modulo) === 0) {
                    line(
                        ctx.value,
                        [
                            { x: drawingArea.value.left + (drawingArea.value.slot * (i - slicer.value.start)) + (drawingArea.value.slot / 2), y: drawingArea.value.top },
                            { x: drawingArea.value.left + (drawingArea.value.slot * (i - slicer.value.start)) + (drawingArea.value.slot / 2), y: drawingArea.value.bottom }
                        ],
                        {
                            color: FINAL_CONFIG.value.style.chart.grid.y.verticalLines.color
                        }
                    );
                }
            }
        }
        // UNSTACKED

        // HORIZONTAL LINES
        if (FINAL_CONFIG.value.style.chart.grid.x.horizontalLines.show) {
            if (FINAL_CONFIG.value.style.chart.grid.x.horizontalLines.alternate) {
                absoluteExtremes.value.yLabels.forEach((entry, i) => {
                    if (i < absoluteExtremes.value.yLabels.length - 1) {
                        rect(
                            ctx.value,
                            [
                                { x: drawingArea.value.left, y: entry.y },
                                { x: drawingArea.value.right, y: entry.y },
                                { x: drawingArea.value.right, y: absoluteExtremes.value.yLabels[i + 1].y },
                                { x: drawingArea.value.left, y: absoluteExtremes.value.yLabels[i + 1].y },
                            ],
                            {
                                fillColor: i % 2 === 0 ? 'transparent' : setOpacity(FINAL_CONFIG.value.style.chart.grid.x.horizontalLines.color, FINAL_CONFIG.value.style.chart.grid.x.horizontalLines.opacity),
                                strokeColor: 'transparent'
                            }
                        );
                    }
                });
            } else {
                absoluteExtremes.value.yLabels.forEach(entry => {
                    line(
                        ctx.value,
                        [
                            { x: drawingArea.value.left, y: entry.y },
                            { x: drawingArea.value.right, y: entry.y },
                        ],
                        {
                            color: FINAL_CONFIG.value.style.chart.grid.x.horizontalLines.color
                        }
                    );
                });
            }
        }

        // AXES LINES
        if (FINAL_CONFIG.value.style.chart.grid.y.showAxis) {
            line(
                ctx.value,
                [
                    { x: drawingArea.value.left, y: drawingArea.value.top },
                    { x: drawingArea.value.left, y: drawingArea.value.bottom },
                ],
                {
                    color: FINAL_CONFIG.value.style.chart.grid.y.axisColor,
                    lineWidth: FINAL_CONFIG.value.style.chart.grid.y.axisThickness,
                }
            );
        }
        if (FINAL_CONFIG.value.style.chart.grid.x.showAxis) {
            line(
                ctx.value,
                [
                    { x: drawingArea.value.left, y: drawingArea.value.bottom },
                    { x: drawingArea.value.right, y: drawingArea.value.bottom },
                ],
                {
                    color: FINAL_CONFIG.value.style.chart.grid.x.axisColor,
                    lineWidth: FINAL_CONFIG.value.style.chart.grid.x.axisThickness,
                }
            );
        }

        // ZERO LINE
        if (FINAL_CONFIG.value.style.chart.grid.zeroLine.show) {
            line(
                ctx.value,
                [
                    { x: drawingArea.value.left, y: absoluteExtremes.value.zero },
                    { x: drawingArea.value.right, y: absoluteExtremes.value.zero },
                ],
                {
                    color: FINAL_CONFIG.value.style.chart.grid.zeroLine.color,
                    lineDash: FINAL_CONFIG.value.style.chart.grid.zeroLine.dashed ? [10, 10] : [0, 0]
                }
            );
        }
    } else {
        // STACKED
        // VERTICAL LINES

        if (FINAL_CONFIG.value.style.chart.grid.y.verticalLines.show && (slicer.value.end - slicer.value.start) < FINAL_CONFIG.value.style.chart.grid.y.verticalLines.hideUnderXLength) {
            formattedDataset.value.forEach((ds) => {
                
                for (let k = 0; k < (slicer.value.end - slicer.value.start) + 1; k += 1) {
                    line(
                        ctx.value,
                        [
                            { 
                                x: drawingArea.value.left + drawingArea.value.slot * k,
                                y: drawingArea.value.bottom - ds.yOffset - ds.individualHeight
                            },
                            {
                                x: drawingArea.value.left + drawingArea.value.slot * k,
                                y: drawingArea.value.bottom - ds.yOffset
                            }
                        ],
                        {
                            color: FINAL_CONFIG.value.style.chart.grid.y.verticalLines.color
                        }
                    );
                }
            });
        } else if (FINAL_CONFIG.value.style.chart.grid.y.verticalLines.show && (slicer.value.end - slicer.value.start) >= FINAL_CONFIG.value.style.chart.grid.y.verticalLines.hideUnderXLength) {
            formattedDataset.value.forEach((ds) => {
                
                for (let k = slicer.value.start; k < slicer.value.end; k += 1) {

                    if(k % Math.floor((slicer.value.end - slicer.value.start) / FINAL_CONFIG.value.style.chart.grid.x.timeLabels.modulo) === 0) {
                        line(
                            ctx.value,
                            [
                                { 
                                    x: drawingArea.value.left + (drawingArea.value.slot * (k - slicer.value.start)) + (drawingArea.value.slot / 2),
                                    y: drawingArea.value.bottom - ds.yOffset - ds.individualHeight
                                },
                                {
                                    x: drawingArea.value.left + (drawingArea.value.slot * (k - slicer.value.start)) + (drawingArea.value.slot / 2),
                                    y: drawingArea.value.bottom - ds.yOffset
                                }
                            ],
                            {
                                color: FINAL_CONFIG.value.style.chart.grid.y.verticalLines.color
                            }
                        );
                    }
                }
            });
        }

        // HORIZONTAL LINES
        if (FINAL_CONFIG.value.style.chart.grid.x.horizontalLines.show) {
            if (FINAL_CONFIG.value.style.chart.grid.x.horizontalLines.alternate) {
                formattedDataset.value.forEach((ds) => {
                    ds.localYLabels.forEach((entry, k) => {
                        if (k < ds.localYLabels.length - 1) {
                            rect(
                                ctx.value,
                                [
                                    { x: drawingArea.value.left, y: entry.y },
                                    { x: drawingArea.value.right, y: entry.y },
                                    { x: drawingArea.value.right, y: ds.localYLabels[k + 1].y },
                                    { x: drawingArea.value.left, y: ds.localYLabels[k + 1].y }
                                ],
                                {
                                    fillColor: k % 2 === 0 ? 'transparent' : setOpacity(FINAL_CONFIG.value.style.chart.grid.x.horizontalLines.color, FINAL_CONFIG.value.style.chart.grid.x.horizontalLines.opacity),
                                    strokeColor: 'transparent'
                                }
                            );
                        }
                    });
                });
            } else {
                formattedDataset.value.forEach((ds) => {
                    ds.localYLabels.slice(slicer.value.start, slicer.value.end).forEach((entry) => {
                        line(
                            ctx.value,
                            [
                                { x: drawingArea.value.left, y: entry.y },
                                { x: drawingArea.value.right, y: entry.y }
                            ],
                            {
                                color: FINAL_CONFIG.value.style.chart.grid.x.horizontalLines.color
                            }
                        );
                    });
                });
            }
        }

        // ZERO LINE
        if (FINAL_CONFIG.value.style.chart.grid.zeroLine.show) {
            formattedDataset.value.forEach(ds => {
                line(
                    ctx.value,
                    [
                        { x: drawingArea.value.left, y: ds.localZero },
                        { x: drawingArea.value.right, y: ds.localZero }
                    ],
                    {
                        color: FINAL_CONFIG.value.style.chart.grid.zeroLine.color,
                        lineDash: FINAL_CONFIG.value.style.chart.grid.zeroLine.dashed ? [10, 10] : [0, 0]
                    }
                );
            });
        }

        // AXES LABELS
        if (FINAL_CONFIG.value.style.chart.grid.y.axisLabels.show) {
            formattedDataset.value.forEach((ds) => {
                // INDIVIDUAL Y AXES
                line(
                    ctx.value,
                    [
                        { x: drawingArea.value.left, y: drawingArea.value.bottom - ds.yOffset },
                        { x: drawingArea.value.left, y: drawingArea.value.bottom - ds.yOffset - ds.individualHeight }
                    ],
                    {
                        color: ds.color
                    }
                );
                line(
                    ctx.value,
                    [
                        { x: drawingArea.value.right, y: drawingArea.value.bottom - ds.yOffset },
                        { x: drawingArea.value.right, y: drawingArea.value.bottom - ds.yOffset - ds.individualHeight }
                    ],
                    {
                        color: ds.color
                    }
                );
            });
        }

        // DS NAME
        formattedDataset.value.forEach((ds) => {
            text(
                ctx.value,
                ds.name,
                w.value / 35,
                drawingArea.value.bottom - ds.yOffset - (ds.individualHeight / 2),
                {
                    align: 'center',
                    rotation: -90,
                    color: ds.color,
                    font: `${Math.round(w.value / 40 * FINAL_CONFIG.value.style.chart.grid.y.axisLabels.fontSizeRatio)}px ${FINAL_CONFIG.value.style.fontFamily}`
                }
            );
        });
    }

    // AXES NAMES
    if (FINAL_CONFIG.value.style.chart.grid.y.axisName) {
        text(
            ctx.value,
            FINAL_CONFIG.value.style.chart.grid.y.axisName,
            w.value - w.value / 40 * FINAL_CONFIG.value.style.chart.grid.y.axisLabels.fontSizeRatio * 1.2,
            drawingArea.value.bottom - drawingArea.value.height / 2,
            {
                font: `${FINAL_CONFIG.value.style.chart.grid.y.axisLabels.bold ? 'bold ' : ''}${Math.round(w.value / 40 * FINAL_CONFIG.value.style.chart.grid.y.axisLabels.fontSizeRatio)}px ${FINAL_CONFIG.value.style.fontFamily}`,
                color: FINAL_CONFIG.value.style.chart.color,
                align: 'center',
                rotation: 90
            }
        );
    }

    if (FINAL_CONFIG.value.style.chart.grid.x.axisName) {
        text(
            ctx.value,
            FINAL_CONFIG.value.style.chart.grid.x.axisName,
            w.value / 2,
            h.value,
            {
                font: `${FINAL_CONFIG.value.style.chart.grid.y.axisLabels.bold ? 'bold ' : ''}${Math.round(w.value / 40 * FINAL_CONFIG.value.style.chart.grid.y.axisLabels.fontSizeRatio)}px ${FINAL_CONFIG.value.style.fontFamily}`,
                color: FINAL_CONFIG.value.style.chart.color,
                align: 'center'
            }
        );
    }
}

function drawPlots(ds) {
    for (let i = 0; i < ds.coordinatesLine.length; i += 1) {
        const radius = (tooltipIndex.value === i || selectedMinimapIndex.value === i ? w.value / 150 : (FINAL_CONFIG.value.style.chart.line.plots.show || ds.type === 'plot') ? w.value / 200 : 0) * FINAL_CONFIG.value.style.chart.line.plots.radiusRatio;
        circle(
            ctx.value,
            { x: ds.coordinatesLine[i].x, y: ds.coordinatesLine[i].y },
            radius,
            {
                color: FINAL_CONFIG.value.style.chart.backgroundColor,
                fillStyle: ds.color,
                strokeColor: 'transparent'
            }
        );
    }
}

/**
 * Draw data labels on Y Axis corresponding to the current tooltip data selection.
 */
function drawYAxisSelectedDatapoints() {
    formattedDataset.value.forEach(ds => {
        if (ds.showYMarker && getYandValueAtIndex(ds)) {
            text(
                ctx.value,
                applyDataLabel(
                    FINAL_CONFIG.value.style.chart.dataLabels.formatter,
                    getYandValueAtIndex(ds).value,
                    dataLabel({
                        p: ds.prefix || FINAL_CONFIG.value.style.chart.grid.y.axisLabels.prefix || '',
                        v: getYandValueAtIndex(ds).value,
                        s: ds.suffix || FINAL_CONFIG.value.style.chart.grid.y.axisLabels.suffix || '',
                        r: ds.rounding || FINAL_CONFIG.value.style.chart.grid.y.axisLabels.rounding || 0
                    }),
                    { datapoint: getYandValueAtIndex(ds), seriesIndex: null}
                    ),
                drawingArea.value.left - 8 + FINAL_CONFIG.value.style.chart.grid.y.axisLabels.offsetX,
                getYandValueAtIndex(ds).y,
                {
                    align: 'right',
                    font: `${FINAL_CONFIG.value.style.chart.grid.y.axisLabels.bold ? 'bold ' : ''}${Math.round(w.value / 40 * FINAL_CONFIG.value.style.chart.grid.y.axisLabels.fontSizeRatio)}px ${FINAL_CONFIG.value.style.fontFamily}`,
                    color: ds.color
                }
            )
        }
    })
}

function drawYAxisScaleLabels() {
    if (FINAL_CONFIG.value.style.chart.grid.y.axisLabels.show) {
        if(!mutableConfig.value.stacked) {
            absoluteExtremes.value.yLabels.forEach((label, i) => {
                text(
                    ctx.value,
                    applyDataLabel(
                        FINAL_CONFIG.value.style.chart.dataLabels.formatter,
                        label.value,
                        dataLabel({
                            p: FINAL_CONFIG.value.style.chart.grid.y.axisLabels.prefix || '',
                            v: label.value,
                            s: FINAL_CONFIG.value.style.chart.grid.y.axisLabels.suffix || '',
                            r: FINAL_CONFIG.value.style.chart.grid.y.axisLabels.rounding || 0
                        }),
                        { datapoint: label, seriesIndex: i }
                    ),
                    label.x + FINAL_CONFIG.value.style.chart.grid.y.axisLabels.offsetX,
                    label.y,
                    {
                        align: 'right',
                        font: `${FINAL_CONFIG.value.style.chart.grid.y.axisLabels.bold ? 'bold ' : ''}${Math.round(w.value / 40 * FINAL_CONFIG.value.style.chart.grid.y.axisLabels.fontSizeRatio)}px ${FINAL_CONFIG.value.style.fontFamily}`,
                        color: FINAL_CONFIG.value.style.chart.grid.y.axisLabels.color,
                        globalAlpha: formattedDataset.value.some(ds => ds.showYMarker) && ![null, undefined].includes(tooltipIndex.value ?? selectedMinimapIndex.value) ? 0.2 : 1
                    }
                );
            });
        } else {
            formattedDataset.value.forEach(ds => {
                ds.localYLabels.forEach((entry, i) => {
                    text(
                        ctx.value,
                        applyDataLabel(
                            FINAL_CONFIG.value.style.chart.dataLabels.formatter,
                            entry.value,
                            dataLabel({
                                p: ds.prefix || FINAL_CONFIG.value.style.chart.grid.y.axisLabels.prefix || '',
                                v: entry.value,
                                s: ds.suffix || FINAL_CONFIG.value.style.chart.grid.y.axisLabels.suffix || '',
                                r: ds.rounding || FINAL_CONFIG.value.style.chart.grid.y.axisLabels.rounding || 0
                            }),
                            { datapoint: entry, seriesIndex: i}
                            ),
                        entry.x + FINAL_CONFIG.value.style.chart.grid.y.axisLabels.offsetX,
                        entry.y,
                        {
                            align: 'right',
                            font: `${FINAL_CONFIG.value.style.chart.grid.y.axisLabels.bold ? 'bold ' : ''}${Math.round(w.value / 40 * FINAL_CONFIG.value.style.chart.grid.y.axisLabels.fontSizeRatio)}px ${FINAL_CONFIG.value.style.fontFamily}`,
                            color: ds.color,
                            globalAlpha: ds.showYMarker && ![null, undefined].includes(tooltipIndex.value ?? selectedMinimapIndex.value) ? 0.2 : 1
                        }
                    );
                });
            });
        }
    }
}

function drawDataLabels(ds) {
    for (let i = 0; i < ds.coordinatesLine.length; i += 1) {
        text(
            ctx.value,
            applyDataLabel(
                FINAL_CONFIG.value.style.chart.dataLabels.formatter,
                ds.coordinatesLine[i].value,
                dataLabel({
                    p: ds.prefix || '',
                    v: ds.coordinatesLine[i].value,
                    s: ds.suffix || '',
                    r: ds.rounding || 0
                }),
                { datapoint: ds.coordinatesLine[i], seriesIndex: i }
            ),
            ds.coordinatesLine[i].x,
            ds.coordinatesLine[i].y + FINAL_CONFIG.value.style.chart.dataLabels.offsetY,
            {
                align: 'center',
                font: `${FINAL_CONFIG.value.style.chart.dataLabels.bold ? 'bold ' : ''}${Math.round(w.value / 40 * FINAL_CONFIG.value.style.chart.dataLabels.fontSizeRatio)}px ${FINAL_CONFIG.value.style.fontFamily}`,
                color: FINAL_CONFIG.value.style.chart.dataLabels.useSerieColor ? ds.color : FINAL_CONFIG.value.style.chart.dataLabels.color,
                strokeColor: FINAL_CONFIG.value.style.chart.backgroundColor,
                lineWidth: 0.5
            }
        );
    }
}

const timeLabels = ref([]);

let timeLabelsRequestId = 0;
watchEffect(() => {
    const requestId = ++timeLabelsRequestId;

    (async () => {
        const labels = await useTimeLabels({
            values: FINAL_CONFIG.value.style.chart.grid.x.timeLabels.values,
            maxDatapoints: maxSeries.value,
            formatter: FINAL_CONFIG.value.style.chart.grid.x.timeLabels.datetimeFormatter,
            start: 0,
            end: maxSeries.value
        });

        if (requestId === timeLabelsRequestId) {
            timeLabels.value = labels;
        }
    })();
});

watchEffect(() => {
    // Track all reactive inputs that influence time label geometry
    const show = FINAL_CONFIG.value.style.chart.grid.x.timeLabels.show;
    const rotation = FINAL_CONFIG.value.style.chart.grid.x.timeLabels.rotation;
    const offsetY = FINAL_CONFIG.value.style.chart.grid.x.timeLabels.offsetY;
    const fontSizeRatio = FINAL_CONFIG.value.style.chart.grid.x.timeLabels.fontSizeRatio;
    const bold = FINAL_CONFIG.value.style.chart.grid.x.timeLabels.bold;

    const start = slicer.value.start;
    const end = slicer.value.end;

    const width = w.value;
    const height = h.value;

    // Trigger when async labels resolve / locale formatting changes
    const labelTexts = (timeLabels.value || []).map(l => l?.text ?? '').join('|');

    void show;
    void rotation;
    void offsetY;
    void fontSizeRatio;
    void bold;
    void start;
    void end;
    void width;
    void height;
    void labelTexts;

    scheduleMeasureBottomExtra();
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

function drawTimeLabels() {
    for (let i = slicer.value.start; i < slicer.value.end; i += 1) {
        if (
            (slicer.value.end - slicer.value.start) < FINAL_CONFIG.value.style.chart.grid.x.timeLabels.modulo || 
            ((slicer.value.end - slicer.value.start) >= FINAL_CONFIG.value.style.chart.grid.x.timeLabels.modulo && (i % Math.floor((slicer.value.end - slicer.value.start) / FINAL_CONFIG.value.style.chart.grid.x.timeLabels.modulo) === 0 ||
            (i === (tooltipIndex.value + slicer.value.start) || i === selectedMinimapIndex.value) && FINAL_CONFIG.value.style.chart.grid.x.timeLabels.showMarker ))) 
        {
            text(
                ctx.value,
                timeLabels.value[i] ? timeLabels.value[i].text : i + 1,
                drawingArea.value.left + (drawingArea.value.slot * (i - slicer.value.start)) + (drawingArea.value.slot / 2),
                drawingArea.value.bottom + (w.value / FINAL_CONFIG.value.style.chart.grid.x.timeLabels.offsetY),
                {
                    align: FINAL_CONFIG.value.style.chart.grid.x.timeLabels.rotation === 0 ? 'center' : FINAL_CONFIG.value.style.chart.grid.x.timeLabels.rotation > 0 ? 'left' : 'right',
                    font: `${FINAL_CONFIG.value.style.chart.grid.x.timeLabels.bold ? 'bold ' : ''}${Math.round(w.value / 40 * FINAL_CONFIG.value.style.chart.grid.x.timeLabels.fontSizeRatio)}px ${FINAL_CONFIG.value.style.fontFamily}`,
                    color: FINAL_CONFIG.value.style.chart.grid.x.timeLabels.showMarker ? setOpacity(FINAL_CONFIG.value.style.chart.grid.x.timeLabels.color, (tooltipIndex.value !== null || selectedMinimapIndex.value !== null) ? (tooltipIndex.value + slicer.value.start) === i || selectedMinimapIndex.value === i ? 100 : 20 : 100) : FINAL_CONFIG.value.style.chart.grid.x.timeLabels.color,
                    rotation: FINAL_CONFIG.value.style.chart.grid.x.timeLabels.rotation,
                }
            );
        }
    }
}

function drawVerticalSelector() {
    line(
        ctx.value,
        [
            { x: drawingArea.value.left + (drawingArea.value.slot * (tooltipIndex.value ?? selectedMinimapIndex.value)) + (drawingArea.value.slot / 2), y: drawingArea.value.top },
            { x: drawingArea.value.left + (drawingArea.value.slot * (tooltipIndex.value ?? selectedMinimapIndex.value)) + (drawingArea.value.slot / 2), y: drawingArea.value.bottom },
        ],
        {
            color: FINAL_CONFIG.value.style.chart.selector.color,
            lineDash: FINAL_CONFIG.value.style.chart.selector.dashed ? [8, 8] : [0, 0],
            lineWidth: 2,
            linceCap: 'round'
        }
    );
}

function drawHorizontalSelector() {
    if (!mouseY.value) return;
    line(
            ctx.value,
            [
                { x: drawingArea.value.left, y: mouseY.value },
                { x: drawingArea.value.right, y: mouseY.value },
            ],
            {
                color: FINAL_CONFIG.value.style.chart.selector.color,
                lineDash: FINAL_CONFIG.value.style.chart.selector.dashed ? [8, 8] : [0, 0],
                lineWidth: 2,
                linceCap: 'round'
            }
        )
}

function drawBars() {
    barTypes.value.forEach((ds, i) => {
        for (let k = 0; k < ds.coordinatesLine.length; k += 1) {
            rect(
                ctx.value,
                [
                    {
                        x: drawingArea.value.left +
                            (drawingArea.value.slot * k) +
                            (drawingArea.value.slot / 10) +
                            (mutableConfig.value.stacked ? 0 : ((drawingArea.value.slot) / barTypes.value.length * i) -
                            (i === 0 ? 0 : (drawingArea.value.slot / (5 * barTypes.value.length) * i))),
                        y: mutableConfig.value.stacked ? ds.localZero : absoluteExtremes.value.zero
                    },
                    {
                        x: drawingArea.value.left +
                            (drawingArea.value.slot * k) +
                            (drawingArea.value.slot / 10) +
                            (mutableConfig.value.stacked ? 0 : (drawingArea.value.slot / barTypes.value.length * i) -
                            (i === 0 ? 0 : (drawingArea.value.slot / (5 * barTypes.value.length) * i))) +
                            (drawingArea.value.slot * 0.8 / (mutableConfig.value.stacked ? 1 : barTypes.value.length)),
                        y: mutableConfig.value.stacked ? ds.localZero : absoluteExtremes.value.zero
                    },
                    {
                        x: drawingArea.value.left +
                            (drawingArea.value.slot * k) +
                            (drawingArea.value.slot / 10) +
                            (mutableConfig.value.stacked ? 0 : (drawingArea.value.slot / barTypes.value.length * i) -
                            (i === 0 ? 0 : (drawingArea.value.slot / (5 * barTypes.value.length) * i))) +
                            (drawingArea.value.slot * 0.8 / (mutableConfig.value.stacked ? 1 : barTypes.value.length)),
                        y: ds.coordinatesLine[k].y
                    },
                    {
                        x: drawingArea.value.left +
                            (drawingArea.value.slot * k) +
                            (drawingArea.value.slot / 10) +
                            (mutableConfig.value.stacked ? 0 :  (drawingArea.value.slot / barTypes.value.length * i) -
                            (i === 0 ? 0 : (drawingArea.value.slot / (5 * barTypes.value.length) * i))),
                        y: ds.coordinatesLine[k].y
                    }
                ],
                {
                    strokeColor: FINAL_CONFIG.value.style.chart.backgroundColor,
                    gradient: {
                        type: 'linear',
                        start: {
                            x: ds.coordinatesLine[k].x,
                            y: ds.coordinatesLine[k].y
                        },
                        end: {
                            x: ds.coordinatesLine[k].x,
                            y: mutableConfig.value.stacked ? ds.localZero : absoluteExtremes.value.zero
                        },
                        stops: [
                            { offset: 0, color: ds.color },
                            { offset: 1, color: FINAL_CONFIG.value.style.chart.bar.gradient.show ? lightenHexColor(ds.color, 0.5) : ds.color },
                        ]
                    }
                }
            );
            
            if (mutableConfig.value.showDataLabels) {
                if ([true, undefined].includes(ds.dataLabels)) {
                    text(
                        ctx.value,
                        applyDataLabel(
                            FINAL_CONFIG.value.style.chart.dataLabels.formatter,
                            ds.coordinatesLine[k].value,
                            dataLabel({
                                p: ds.prefix || '',
                                v: ds.coordinatesLine[k].value,
                                s: ds.suffix || '',
                                r: ds.rounding || 0
                            }),
                            { datapoint: ds.coordinatesLine[k], seriesIndex: k }
                        ),
                        drawingArea.value.left +
                                (drawingArea.value.slot * k) +
                                (drawingArea.value.slot / 10) +
                                (mutableConfig.value.stacked ? 0 : ((drawingArea.value.slot) / barTypes.value.length * i) -
                                (i === 0 ? 0 : (drawingArea.value.slot / (5 * barTypes.value.length) * i))) +
                                (drawingArea.value.slot * 0.4 / (mutableConfig.value.stacked ? 1 : barTypes.value.length)),
                        (ds.coordinatesLine[k].value < 0 ? (mutableConfig.value.stacked ? ds.localZero : absoluteExtremes.value.zero) : ds.coordinatesLine[k].y) + FINAL_CONFIG.value.style.chart.dataLabels.offsetY ,
                        {
                            align: 'center',
                            font: `${Math.round(w.value / 40 * FINAL_CONFIG.value.style.chart.dataLabels.fontSizeRatio)}px ${FINAL_CONFIG.value.style.fontFamily}`,
                            color: FINAL_CONFIG.value.style.chart.dataLabels.useSerieColor ? ds.color : FINAL_CONFIG.value.style.chart.dataLabels.color,
                            strokeColor: FINAL_CONFIG.value.style.chart.backgroundColor,
                            lineWidth: 0.8
                        }
                    );
                }
            }
        }
    });
}

function getNonNullAreaParts(ds, baselineY) {
    const pts = ds.coordinatesLine.map((pt, idx) => {
        const v = ds.series[idx];
        const valid = v !== null && v !== undefined && Number.isFinite(pt?.y);
        return valid ? pt : null;
    });

    const polygons = [];
    const singles  = [];

    let current = [];
    for (let i = 0; i < pts.length; i += 1) {
        const p = pts[i];
        if (p) {
            current.push(p);
        } else {
            if (current.length >= 2) {
                const first = current[0];
                const last  = current[current.length - 1];
                polygons.push([
                    { x: first.x, y: baselineY },
                    ...current,
                    { x: last.x,  y: baselineY }
                ]);
            } else if (current.length === 1) {
                singles.push(current[0]);
            }
            current = [];
        }
    }

    if (current.length >= 2) {
        const first = current[0];
        const last  = current[current.length - 1];
        polygons.push([
            { x: first.x, y: baselineY },
            ...current,
            { x: last.x,  y: baselineY }
        ]);
    } else if (current.length === 1) {
        singles.push(current[0]);
    }

    return { polygons, singles };
}



function getNonNullLineChunks(ds) {
    const pts = ds.coordinatesLine.map((pt, idx) => {
        const v = ds.series[idx];
        const valid = v !== null && v !== undefined && Number.isFinite(pt?.y);
        return valid ? pt : null;
    });

    const chunks = [];
    let current = [];
    for (let i = 0; i < pts.length; i += 1) {
        const p = pts[i];
        if (p) {
            current.push(p);
        } else {
            if (current.length >= 2) chunks.push(current);
            current = [];
        }
    }
    if (current.length >= 2) chunks.push(current);
    return chunks;
}

function drawJustLine(ds) {
    if (cutNullValues.value) {
        const chunks = getNonNullLineChunks(ds);
        for (const segment of chunks) {
            line(ctx.value, segment, {
                color: ds.color,
                lineWidth: 3
            });
        }
    } else {
        line(ctx.value, ds.coordinatesLine, {
            color: ds.color,
            lineWidth: 3
        });
    }
}

function drawLineOrArea(ds) {
    const cutGaps = !!cutNullValues.value;

    if (ds.useArea) {
        const baselineY = mutableConfig.value.stacked
            ? ds.localZero
            : absoluteExtremes.value.zero;

        if (cutGaps) {
            const { polygons, singles } = getNonNullAreaParts(ds, baselineY);

            for (const poly of polygons) {
                polygon(ctx.value, poly, {
                    fillColor: setOpacity(ds.color, FINAL_CONFIG.value.style.chart.area.opacity),
                    strokeColor: 'transparent',
                });
            }

            // Dots for plots surrounded by null values
            const baseRadius = (w.value / 200) * FINAL_CONFIG.value.style.chart.line.plots.radiusRatio;
            for (const pt of singles) {
                circle(
                    ctx.value,
                    { x: pt.x, y: pt.y },
                    baseRadius,
                    {
                        color: FINAL_CONFIG.value.style.chart.backgroundColor,
                        fillStyle: ds.color,
                        strokeColor: 'transparent'
                    }
                );
            }
        } else {
            const start = { x: ds.coordinatesLine[0].x, y: baselineY };
            const end   = { x: ds.coordinatesLine.at(-1).x, y: baselineY };
            polygon(
                ctx.value,
                [start, ...ds.coordinatesLine, end],
                {
                    fillColor: setOpacity(ds.color, FINAL_CONFIG.value.style.chart.area.opacity),
                    strokeColor: 'transparent',
                }
            );
        }
        drawJustLine(ds);
        return;
    }
    drawJustLine(ds);
}



function drawXBaseLineStacked() {
    formattedDataset.value.forEach((ds, i) => {
        line(
            ctx.value,
            [
                { x: drawingArea.value.left, y: drawingArea.value.bottom - ds.yOffset },
                { x: drawingArea.value.right, y: drawingArea.value.bottom - ds.yOffset },
            ],
            {
                color: FINAL_CONFIG.value.style.chart.grid.x.horizontalLines.color,
                lineWidth: 1,
            }
        );
    });
}

function drawPrecogRect() {
    const { left, top, width: totalWidth, height } = drawingArea.value
    const windowStart = slicer.value.start
    const windowEnd = slicer.value.end
    const windowLen = windowEnd - windowStart
    const unit = totalWidth / windowLen
    const rawStart = slicerPrecog.value.start - windowStart;
    const rawEnd   = slicerPrecog.value.end   - windowStart;
    const relStart = Math.max(0, Math.min(windowLen, rawStart));
    const relEnd   = Math.max(0, Math.min(windowLen, rawEnd));

    rect(
        ctx.value,
        [
            { x: left + relStart * unit, y: top },
            { x: left + relStart * unit + ((relEnd - relStart) * unit), y: top },
            { x: left + relStart * unit + ((relEnd - relStart) * unit), y: top + height },
            { x: left + relStart * unit, y: top + height },
        ],
        {
            fillColor: FINAL_CONFIG.value.style.chart.zoom.preview.fill,
            strokeColor: FINAL_CONFIG.value.style.chart.zoom.preview.stroke,
            lineDash: Array(4).fill(FINAL_CONFIG.value.style.chart.zoom.preview.strokeDasharray),
            lineWidth: FINAL_CONFIG.value.style.chart.zoom.preview.strokeWidth
        }
    );
}

function draw() {
    if (!isDataset.value || !canvas.value || !ctx.value) return;

    setupChart();

    if (datasetHasChanged.value) {
        ((tooltipIndex.value !== null || selectedMinimapIndex.value !== null) && FINAL_CONFIG.value.style.chart.selector.show) && drawVerticalSelector();

        drawBars();

        mutableConfig.value.stacked && FINAL_CONFIG.value.style.chart.grid.x.showAxis && drawXBaseLineStacked();

        lineAndPlotTypes.value.forEach(ds => {
            (ds.type === 'line' || !ds.type) && drawLineOrArea(ds);

            if (tooltipHasChanged.value) {
                // PLOTS
                drawPlots(ds);
                // DATALABELS
                if (mutableConfig.value.showDataLabels) {
                    ([true, undefined].includes(ds.dataLabels)) && drawDataLabels(ds);
                }
            }
        });

        if (canvas.value) {
            clonedCanvas.value = cloneCanvas(canvas.value);
        }
    } else {
        if (clonedCanvas.value) {
            ctx.value.clearRect(0, 0, 10000, 10000);
            ctx.value.drawImage(clonedCanvas.value, 0, 0);
        }

        ((tooltipIndex.value !== null || selectedMinimapIndex.value !== null) && FINAL_CONFIG.value.style.chart.selector.show) && drawVerticalSelector();

        // PLOT HIGHLIGHTS
        if ((tooltipIndex.value !== null || selectedMinimapIndex.value !== null)) {
            formattedDataset.value.forEach(ds => {
                const idx = tooltipIndex.value ?? selectedMinimapIndex.value;
                const point = ds.coordinatesLine[idx];
                if (((ds.type === 'line' || !ds.type) || ds.type === 'plot') && point && Number.isFinite(point.x) && Number.isFinite(point.y)) {
                    circle(
                        ctx.value,
                        { x: point.x, y: point.y },
                        (w.value / 150) * FINAL_CONFIG.value.style.chart.line.plots.radiusRatio,
                        {
                            color: FINAL_CONFIG.value.style.chart.backgroundColor,
                            fillStyle: ds.color,
                            strokeColor: 'transparent'
                        }
                    );
                }
            });
        }
    }

    // TIME LABELS & SELECTORS
    FINAL_CONFIG.value.style.chart.grid.x.timeLabels.show && drawTimeLabels();
    FINAL_CONFIG.value.style.chart.selector.show && FINAL_CONFIG.value.style.chart.selector.showHorizontalSelector && drawHorizontalSelector();

    drawYAxisScaleLabels();
    drawYAxisSelectedDatapoints();

    if (FINAL_CONFIG.value.style.chart.zoom.preview.enable && (slicer.value.start !== slicerPrecog.value.start || slicer.value.end !== slicerPrecog.value.end)) {
        drawPrecogRect();
    }

    datasetHasChanged.value = false;
}

const debounceCanvasResize = debounce(() => {
    tooltipHasChanged.value = true;
    resizeCanvas()
}, maxSeries.value > 200 ? 10 : 1, !tooltipHasChanged.value);

function getYandValueAtIndex(datapoint) {
    if ([null, undefined].includes(tooltipIndex.value ?? selectedMinimapIndex.value) || !datapoint.coordinatesLine[tooltipIndex.value ?? selectedMinimapIndex.value]) return false;
    const { y, value } = datapoint.coordinatesLine[tooltipIndex.value ?? selectedMinimapIndex.value];
    return { y, value };
}

function handleMousemove(e) {
    if (!isDataset.value || !canvas.value || allSegregated.value) return;

    const { left, top } = canvas.value.getBoundingClientRect();
    const mouseX = e.clientX - left;
    mouseY.value = (e.clientY - top) * 2;

    if (mouseY.value < drawingArea.value.top || mouseY.value > drawingArea.value.bottom) {
        mouseY.value = null;
    }

    if ((mouseX * 2) < drawingArea.value.left || (mouseX * 2) > drawingArea.value.right) {
        isTooltip.value = false;
        tooltipIndex.value = null;
        return;
    }

    const effectiveMouseX = (mouseX * 2) - (drawingArea.value.left);
    tooltipIndex.value = Math.floor(effectiveMouseX / (drawingArea.value.slot));
    isTooltip.value = true;

    if (!tooltipHasChanged.value) return;

    let html = "";
    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

    const datapoint = formattedDataset.value.map(ds => ({
        shape: ds.shape || null,
        name: ds.name,
        color: ds.color,
        type: ds.type || 'line',
        value: ds.series.find((s, i) => i === tooltipIndex.value)
    }));

    selectX({ seriesIndex: tooltipIndex.value, datapoint });

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
        seriesIndex: tooltipIndex.value,
        datapoint,
        series: formattedDataset.value,
        config: FINAL_CONFIG.value
    }))) {
        tooltipContent.value = customFormat({
            seriesIndex: tooltipIndex.value,
            datapoint,
            series: formattedDataset.value,
            config: FINAL_CONFIG.value
        });
    } else {
        if (FINAL_CONFIG.value.style.chart.grid.x.timeLabels.values.slice(slicer.value.start, slicer.value.end)[tooltipIndex.value]) {
            html += `<div style="padding-bottom: 6px; margin-bottom: 4px; border-bottom: 1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor}; width:100%">${FINAL_CONFIG.value.style.chart.tooltip.useDefaultTimeFormat ? timeLabels.value.slice(slicer.value.start, slicer.value.end)[tooltipIndex.value]?.text : preciseAllTimeLabelsTooltip.value[tooltipIndex.value]?.text}</div>`;
        } else {
            html += `<div style="padding-bottom: 6px; margin-bottom: 4px; border-bottom: 1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor}; width:100%">${timeLabels.value[tooltipIndex.value + slicer.value.start]?.text ?? ''}</div>`;
        }
        html += tootlipDataset.value.join('');
        tooltipContent.value = html;
    }
    tooltipHasChanged.value = false;
}

function selectX({ seriesIndex, datapoint }) {
    const index = slicer.value.start + seriesIndex
    emit('selectX', {
        dataset: datapoint,
        index,
        indexLabel: ''
    })
}

watch(() => props.selectedXIndex, (v) => {
    if ([null, undefined].includes(props.selectedXIndex)) {
        tooltipIndex.value = null;
        return;
    }

    const targetIndex = v - slicer.value.start;
    if (targetIndex < 0 || v >= slicer.value.end) {
        tooltipIndex.value = null;
    } else {
        tooltipIndex.value = targetIndex ?? null;
    }
}, { immediate: true })

watch(() => tooltipIndex.value, (_) => {
    debounceCanvasResize();
});

watch(() => slicer.value, (_) => {
    datasetHasChanged.value = true;
    draw();
}, {
    deep: true
});

watch(() => slicerPrecog.value, (_) => {
    draw();
}, { deep: true })

watch(() => mutableConfig.value.showDataLabels, (_) => {
    datasetHasChanged.value = true;
    draw()
});

watch(() => mouseY.value, (newVal) => {
    if (newVal) {
        draw();
    }
})

watch(() => mutableConfig.value.stacked, (_) => {
    datasetHasChanged.value = true;
    tooltipHasChanged.value = true;
    debounceCanvasResize()
});

function handleMouseLeave() {
    isTooltip.value = false;
    tooltipIndex.value = null;
    tooltipContent.value = '';
    mouseY.value = null;
    draw();
}

const responsiveObserver = shallowRef(null);
const observedEl = shallowRef(null);
const resizeObserver = shallowRef(null);

onMounted(() => {
    readyTeleport.value = true;
    prepareChart();
});

function prepareChart() {
    if (objectIsEmpty(props.dataset) && debug.value) {
        error({ componentName: 'VueUiXyCanvas', type: 'dataset' });
    }

    nextTick(() => {
        if (canvas.value && !ctx.value) {
            ctx.value = canvas.value.getContext('2d', { willReadFrequently: true });
        }
        if (ctx.value && isDataset.value) {
            datasetHasChanged.value = true;
            tooltipHasChanged.value = true;
            resizeCanvas();
        }
    });

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: xy.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
                slicer: FINAL_CONFIG.value.style.chart.zoom.show && maxSeries.value > 6 ? chartSlicer.value?.$el : null,
                source: source.value
            });
            requestAnimationFrame(() => {
                aspectRatio.value = `${width} / ${height}`;
            });
        });

        if (responsiveObserver.value) {
            if (observedEl.value) responsiveObserver.value.unobserve(observedEl.value);
            responsiveObserver.value.disconnect();
        }
        responsiveObserver.value = new ResizeObserver(handleResize);
        observedEl.value = xy.value.parentNode;
        responsiveObserver.value.observe(observedEl.value);
    }

    if (resizeObserver.value) resizeObserver.value.disconnect();

    resizeObserver.value = new ResizeObserver(async (entries) => {
        for (const entry of entries) {
            if (entry.contentBoxSize && container.value) {
                datasetHasChanged.value = true;
                debounceCanvasResize();
            }
        }
    });
    resizeObserver.value.observe(container.value);
    refreshSlicer();
}


onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
    if (responsiveObserver.value) {
        if (observedEl.value) {
            responsiveObserver.value.unobserve(observedEl.value);
        }
        responsiveObserver.value.disconnect();
    }
});

function toggleLegend() {
    if (segregated.value.length) {
        segregated.value = [];
    } else {
        legendSet.value.forEach((_, i) => {
            segregated.value.push(i);
        });
    }
    datasetHasChanged.value = true;
    debounceCanvasResize();
}

function segregate(index) {
    emit('selectLegend', formattedDataset.value.find(el => el.absoluteIndex === index));
    if (segregated.value.includes(index)) {
        segregated.value = segregated.value.filter(i => i !== index);
    } else {
        segregated.value.push(index);
    }
    datasetHasChanged.value = true;
    debounceCanvasResize();
}

function validSeriesToToggle(name) {
    if (!dsCopy.value.length) {
        if (FINAL_CONFIG.value.debug) {
            console.warn('VueUiXyCanvas - There are no series to show.');
        }
        return null;
    }
    const dp = dsCopy.value.find(d => d.name === name);
    if (!dp) {
        if (FINAL_CONFIG.value.debug) {
            console.warn(`VueUiXyCanvas - Series name not found "${name}"`);
        }
        return null;
    }
    return dp;
}

function showSeries(name) {
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (segregated.value.includes(dp.absoluteIndex)) {
        segregate(dp.absoluteIndex);
    }
}

function hideSeries(name) {
    const dp  = validSeriesToToggle(name);
    if (dp === null) return;
    if (!segregated.value.includes(dp.absoluteIndex))  {
        segregate(dp.absoluteIndex);
    }
}

const legendSet = computed(() => {
    return dsCopy.value.map((ds, i) => {
        return {
            ...ds,
            name: ds.name,
            color: convertColorToHex(ds.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
            shape: ds.shape || 'circle',
            prefix: ds.prefix || '',
            suffix: ds.suffix || '',
            rounding: ds.rounding || 0
        }
    }).map((ds) => {
        return {
            ...ds,
            opacity: segregated.value.includes(ds.absoluteIndex) ? 0.5 : 1,
            segregate: () => segregate(ds.absoluteIndex),
            isSegregated: segregated.value.includes(ds.absoluteIndex)
        }
    });
});

const legendConfig = computed(() => {
    return {
        cy: 'donut-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
});

const dataTable = computed(() => {
    const head = [''].concat(formattedDataset.value.map(ds => ds.name)).concat(` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`);

    let body = [];

    for (let i = 0; i < maxSeries.value; i += 1) {
        const sum = formattedDataset.value.map(ds => {
            return ds.series[i] ?? 0
        }).reduce((a,b ) => a + b, 0);

        body.push(
            [
                FINAL_CONFIG.value.style.chart.grid.x.timeLabels.values
                .slice(slicer.value.start, slicer.value.end)[i]
                ? (timeLabels?.value?.slice(slicer.value.start, slicer.value.end)?.[i]?.text ?? i + 1)
                : i + 1
            ]
                .concat(
                formattedDataset.value.map(ds =>
                    (ds.series[i] ?? 0).toFixed(FINAL_CONFIG.value.table.rounding)
                )
                )
                .concat((sum ?? 0).toFixed(FINAL_CONFIG.value.table.rounding))
        );
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
    }

    const colNames = [FINAL_CONFIG.value.table.columnNames.period].concat(formattedDataset.value.map(ds => ds.name)).concat(FINAL_CONFIG.value.table.columnNames.total);

    return { head, body: body.slice(0, slicer.value.end - slicer.value.start), config, colNames }
});

const tableCsv = computed(() => {
    if(formattedDataset.value.length === 0) return { head: [], body: [], config: {}, columnNames: []};

    const head = formattedDataset.value.map(s => {
        return {
            label: s.name,
            color: s.color,
            type: s.type
        }
    });

    const body = [];

    for (let i = slicer.value.start; i < slicer.value.end; i += 1) {
        const row = [FINAL_CONFIG.value.style.chart.grid.x.timeLabels.values[i] ? timeLabels.value[i].text : i + 1];
        formattedDataset.value.forEach(s => {
            row.push(Number((s.series[i] || 0).toFixed(FINAL_CONFIG.value.table.rounding)));
        });
        body.push(row);
    }

    return { head, body};
});

function generateCsv(callback=null) {
    const title = [[FINAL_CONFIG.value.style.chart.title.text], [FINAL_CONFIG.value.style.chart.title.subtitle.text], [""]];
    const head = ["",...tableCsv.value.head.map(h => h.label)];
    const body = tableCsv.value.body;
    const table = title.concat([head]).concat(body);
    const csvContent = createCsvContent(table);

    if (!callback) {
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-xy-canvas'});
    } else {
        callback(csvContent);
    }
}

function getData() {
    return formattedDataset.value;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleLabels() {
    mutableConfig.value.showDataLabels = !mutableConfig.value.showDataLabels;
}

function toggleStack() {
    mutableConfig.value.stacked = !mutableConfig.value.stacked;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

async function getImage({ scale = 2} = {}) {
    if (!xy.value) return;
    const { width, height } = xy.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: xy.value, base64: true, img: true, scale })
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
            fullscreenParent: xy.value,
            forcedWidth: Math.min(800, window.innerWidth * 0.8)
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

defineExpose({
    getData,
    getImage,
    generateCsv,
    generatePdf,
    generateImage,
    hideSeries,
    showSeries,
    toggleTable,
    toggleLabels,
    toggleStack,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen
});

</script>

<template>
    <div :style="`width:100%; position:relative; ${FINAL_CONFIG.responsive ? 'height: 100%' : ''}; background:${FINAL_CONFIG.style.chart.backgroundColor};`" ref="xy" :id="`xy_canvas_${uid}`" :class="`vue-data-ui-component vue-ui-xy-canvas ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" @mouseenter="onChartEnter" @mouseleave="onChartLeave">
        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text"
            :style="`width:100%;background:${FINAL_CONFIG.style.chart.backgroundColor};`">
            <Title 
            :key="`title_${titleStep}`"
            :config="{
            title: {
                cy: 'xy-canvas-title',
                ...FINAL_CONFIG.style.chart.title
            },
            subtitle: {
                cy: 'xy-canvas-subtitle',
                ...FINAL_CONFIG.style.chart.title.subtitle
            }
        }" />
        </div>

        <div :id="`legend-top-${uid}`" />
        
        <UserOptions
            ref="userOptionsRef"
            :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip && FINAL_CONFIG.style.chart.tooltip.show"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasLabel="FINAL_CONFIG.userOptions.buttons.labels"
            :hasStack="dataset.length > 1 && FINAL_CONFIG.userOptions.buttons.stack"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :hasTable="(slicer.end - slicer.start <= 730) && FINAL_CONFIG.userOptions.buttons.table"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :isStacked="mutableConfig.stacked"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="xy"
            :position="FINAL_CONFIG.userOptions.position"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            :tableDialog="FINAL_CONFIG.table.useDialog"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="onGenerateImage"
            @toggleTable="toggleTable"
            @toggleLabels="toggleLabels"
            @toggleStack="toggleStack"
            @toggleTooltip="toggleTooltip"
            @toggleAnnotator="toggleAnnotator"
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
            <template #optionTable v-if="$slots.optionTable">
                <slot name="optionTable" />
            </template>
            <template #optionLabels v-if="$slots.optionLabels">
                <slot name="optionLabels" />
            </template>
            <template #optionStack v-if="$slots.optionStack">
                <slot name="optionStack"/>
            </template>
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <div class="vue-ui-xy-canvas" :style="`position: relative; aspect-ratio: ${aspectRatio}`"
        ref="container">
            <canvas
                data-cy="canvas"
                ref="canvas" 
                style="width:100%; height:100%;" 
                @mousemove="handleMousemove($event)"
                @mouseleave="handleMouseLeave"
            />

            <!-- v3 Skeleton loader -->
            <slot name="skeleton">
                <BaseScanner v-if="loading" />
            </slot>
            
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
                :position="FINAL_CONFIG.style.chart.tooltip.position"
                :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
                :parent="canvas" 
                :content="tooltipContent"
                :isFullscreen="isFullscreen"
                :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
                :isCustom="isFunction(FINAL_CONFIG.style.chart.tooltip.customFormat)"
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
        </div>
    

            <SlicerPreview
                ref="chartSlicer"
                v-if="FINAL_CONFIG.style.chart.zoom.show && maxSeries > 6 && isDataset && slicerReady && !loading"
                :allMinimaps="allMinimaps"
                :background="FINAL_CONFIG.style.chart.zoom.color"
                :borderColor="FINAL_CONFIG.style.chart.backgroundColor"
                :customFormat="FINAL_CONFIG.style.chart.zoom.customFormat"
                :cutNullValues="cutNullValues"
                :enableRangeHandles="FINAL_CONFIG.style.chart.zoom.enableRangeHandles"
                :enableSelectionDrag="FINAL_CONFIG.style.chart.zoom.enableSelectionDrag"
                :end="slicer.end"
                :focusOnDrag="FINAL_CONFIG.style.chart.zoom.focusOnDrag"
                :focusRangeRatio="FINAL_CONFIG.style.chart.zoom.focusRangeRatio"
                :fontSize="FINAL_CONFIG.style.chart.zoom.fontSize"
                :immediate="!FINAL_CONFIG.style.chart.zoom.preview.enable"
                :inputColor="FINAL_CONFIG.style.chart.zoom.color"
                :isPreview="isPrecog"
                :labelLeft="FINAL_CONFIG.style.chart.grid.x.timeLabels.values[slicer.start] ? timeLabels[slicer.start]?.text : ''"
                :labelRight="FINAL_CONFIG.style.chart.grid.x.timeLabels.values[slicer.end-1] ? timeLabels[slicer.end-1]?.text : ''"
                :max="maxSeries"
                :min="0"
                :minimap="minimap"
                :minimapCompact="FINAL_CONFIG.style.chart.zoom.minimap.compact"
                :minimapFrameColor="FINAL_CONFIG.style.chart.zoom.minimap.frameColor"
                :minimapIndicatorColor="FINAL_CONFIG.style.chart.zoom.minimap.indicatorColor"
                :minimapLineColor="FINAL_CONFIG.style.chart.zoom.minimap.lineColor"
                :minimapMerged="FINAL_CONFIG.style.chart.zoom.minimap.merged"
                :minimapSelectedColor="FINAL_CONFIG.style.chart.zoom.minimap.selectedColor"
                :minimapSelectedColorOpacity="FINAL_CONFIG.style.chart.zoom.minimap.selectedColorOpacity"
                :minimapSelectedIndex="tooltipIndex"
                :minimapSelectionRadius="FINAL_CONFIG.style.chart.zoom.minimap.selectionRadius"
                :preciseLabels="preciseAllTimeLabels?.length ? preciseAllTimeLabels : timeLabels"
                :refreshEndPoint="FINAL_CONFIG.style.chart.zoom.endIndex !== null ? FINAL_CONFIG.style.chart.zoom.endIndex + 1 : maxSeries"
                :refreshStartPoint="FINAL_CONFIG.style.chart.zoom.startIndex !== null ? FINAL_CONFIG.style.chart.zoom.startIndex : 0"
                :selectColor="FINAL_CONFIG.style.chart.zoom.highlightColor"
                :selectedSeries="dsCopy"
                :smoothMinimap="FINAL_CONFIG.style.chart.zoom.minimap.smooth"
                :start="slicer.start"
                :timeLabels="timeLabels"
                :usePreciseLabels="FINAL_CONFIG.style.chart.grid.x.timeLabels.datetimeFormatter.enable && !FINAL_CONFIG.style.chart.zoom.useDefaultFormat"
                :textColor="FINAL_CONFIG.style.chart.color"
                :useResetSlot="FINAL_CONFIG.style.chart.zoom.useResetSlot"
                :valueEnd="slicer.end"
                :valueStart="slicer.start"
                :verticalHandles="FINAL_CONFIG.style.chart.zoom.minimap.verticalHandles" 
                :maxWidth="FINAL_CONFIG.style.chart.zoom.maxWidth"
                @futureEnd="v => setPrecog('end', v)"
                @futureStart="v => setPrecog('start', v)"
                @reset="refreshSlicer"
                @trapMouse="selectMinimapIndex"
                @update:end="onSlicerEnd"
                @update:start="onSlicerStart"
            >
                <template #reset-action="{ reset }">
                    <slot name="reset-action" v-bind="{ reset }"/>
                </template>
            </SlicerPreview>


        <div :id="`legend-bottom-${uid}`" />

        <!-- LEGEND -->
        <Teleport v-if="readyTeleport" :to="FINAL_CONFIG.style.chart.legend.position === 'top' ? `#legend-top-${uid}` : `#legend-bottom-${uid}`">        
            <div ref="chartLegend">
                <Legend v-if="FINAL_CONFIG.style.chart.legend.show && isDataset" :legendSet="legendSet" :config="legendConfig" :key="`legend_${legendStep}`"
                    @clickMarker="({ i }) => segregate(i)">
                    <template #item="{ legend, index }">
                        <div data-cy="legend-item" @click="legend.segregate()" :style="`opacity:${segregated.includes(index) ? 0.5 : 1}`">
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
                            @toggle="toggleLegend"
                        />
                    </template>
                </Legend>
        
                <slot v-else name="legend" v-bind:legend="legendSet" />
            </div>
        </Teleport>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging || isCallbackImaging }"/>
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

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
                <button tabindex="0" class="vue-ui-user-options-button" @click="generateCsv(FINAL_CONFIG.userOptions.callbacks.csv)">
                    <BaseIcon name="fileCsv" :stroke="tableComponent.props.color"/>
                </button>
            </template>
            <template #content>
                <DataTable 
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames"
                    :head="dataTable.head"
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="FINAL_CONFIG.table.useDialog ? '' : tableComponent.title"
                    :withCloseButton="!FINAL_CONFIG.table.useDialog"
                    @close="closeTable"
                >
                    <template #th="{ th }">
                        <div v-html="th"/>
                    </template>
                    <template #td="{ td }">
                        {{ td }}
                    </template>
                </DataTable>
            </template>
        </component>

        <NonSvgPenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator && formattedDataset.length"
            :parent="xy"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />
    </div>
    
</template>

<style scoped>
@import "../vue-data-ui.css";

canvas {
    position: absolute;
    top: 0;
    left: 0;
}
</style>