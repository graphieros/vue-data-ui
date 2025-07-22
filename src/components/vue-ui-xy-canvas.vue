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
    shallowRef
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
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useResponsive } from "../useResponsive";
import { useConfig } from "../useConfig";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import themes from "../themes.json";
import Legend from "../atoms/Legend.vue"; // Must be ready in responsive mode
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import Slicer from "../atoms/Slicer.vue"; // Must be ready in responsive mode
import { useTimeLabels } from "../useTimeLabels";

const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const NonSvgPenAndPaper = defineAsyncComponent(() => import('../atoms/NonSvgPenAndPaper.vue'));
const Skeleton = defineAsyncComponent(() => import('./vue-ui-skeleton.vue'));
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));

const { vue_ui_xy_canvas: DEFAULT_CONFIG } = useConfig();

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
const slicerStep = ref(0);
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

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

const emit = defineEmits(['selectLegend']);
const slots = useSlots();

onMounted(() => {
    if (slots['chart-background']) {
        console.warn('VueUiXyCanvas does not support the #chart-background slot.')
    }
});

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef:canvas } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    })

    let finalConfig = {};

    if (mergedConfig.theme) {
        finalConfig = {
            ...useNestedProp({
                userConfig: themes.vue_ui_xy_canvas[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        finalConfig = mergedConfig;
    }

    // ------------------------------ OVERRIDES -----------------------------------

    if (props.config && hasDeepProperty(props.config, 'style.chart.scale.min')) {
        finalConfig.style.chart.scale.min = props.config.style.chart.scale.min;
    } else {
        finalConfig.style.chart.scale.min = null;
    }

    if (props.config && hasDeepProperty(props.config, 'style.chart.scale.max')) {
        finalConfig.style.chart.scale.max = props.config.style.chart.scale.max;
    } else {
        finalConfig.style.chart.scale.max = null;
    }

    if (props.config && hasDeepProperty(props.config, 'style.chart.zoom.startIndex')) {
        finalConfig.style.chart.zoom.startIndex = props.config.style.chart.zoom.startIndex;
    } else {
        finalConfig.style.chart.zoom.startIndex = null;
    }

    if (props.config && hasDeepProperty(props.config, 'style.chart.zoom.endIndex')) {
        finalConfig.style.chart.zoom.endIndex = props.config.style.chart.zoom.endIndex;
    } else {
        finalConfig.style.chart.zoom.endIndex = null;
    }

    // ----------------------------------------------------------------------------

    return finalConfig;
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
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

watch(() => props.dataset, () => {
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
    legendStep.value += 1;
}, { deep: true })

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

const maxSeries = computed(() => {
    if(!dsCopy.value) return 0
    return Math.max(...dsCopy.value.filter((ds, i) => !segregated.value.includes(ds.absoluteIndex)).map(ds => ds.series.length))
});


const drawingArea = computed(() => {
    const width = w.value - (w.value * (FINAL_CONFIG.value.style.chart.paddingProportions.left + FINAL_CONFIG.value.style.chart.paddingProportions.right))
    return {
        canvasWidth: w.value,
        canvasHeight: h.value,
        left: w.value * FINAL_CONFIG.value.style.chart.paddingProportions.left,
        top: h.value * FINAL_CONFIG.value.style.chart.paddingProportions.top,
        right: w.value - (w.value * FINAL_CONFIG.value.style.chart.paddingProportions.right),
        bottom: h.value - (h.value * FINAL_CONFIG.value.style.chart.paddingProportions.bottom),
        width,
        height: h.value - (h.value * (FINAL_CONFIG.value.style.chart.paddingProportions.top + FINAL_CONFIG.value.style.chart.paddingProportions.bottom)),
        slot: width / (slicer.value.end - slicer.value.start)
    }
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
                    ds.series[tooltipIndex.value],
                    dataLabel({
                        p: ds.prefix || '',
                        v: ds.series[tooltipIndex.value],
                        s: ds.suffix || '',
                        r: ds.rounding || 0
                    }),
                    { datapoint: ds, seriesIndex: tooltipIndex.value }
                )}</span>
            </div>
        `
    });
});

const dsCopy = computed(() => {
    return props.dataset.map((ds, i) => {
        return {
            ...ds,
            series: largestTriangleThreeBucketsArray({
                data: sanitizeArray(ds.series),
                threshold: FINAL_CONFIG.value.downsample.threshold
            }),
            absoluteIndex: i,
            color: convertColorToHex(ds.color || customPalette.value[i] || palette[i] || palette[i % palette.length]),
        }
    });
});

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

function refreshSlicer() {
    setupSlicer();
}

const slicerComponent = ref(null);
async function setupSlicer() {
    if ((FINAL_CONFIG.value.style.chart.zoom.startIndex !== null || FINAL_CONFIG.value.style.chart.zoom.endIndex !== null) && slicerComponent.value) {
        if (FINAL_CONFIG.value.style.chart.zoom.startIndex !== null) {
            await nextTick();
            await nextTick();
            slicerComponent.value && slicerComponent.value.setStartValue(FINAL_CONFIG.value.style.chart.zoom.startIndex);
        }
        if (FINAL_CONFIG.value.style.chart.zoom.endIndex !== null) {
            await nextTick();
            await nextTick();
            slicerComponent.value && slicerComponent.value.setEndValue(validSlicerEnd(FINAL_CONFIG.value.style.chart.zoom.endIndex + 1));
        }
    } else {
        slicer.value = {
            start: 0,
            end: maxSeries.value
        };
        slicerStep.value += 1;
    }
}

function validSlicerEnd(v) {
    const max = maxSeries.value;
    if (v > max) {
        return max;
    }
    if (v < 0 || (FINAL_CONFIG.value.style.chart.zoom.startIndex !== null && v < FINAL_CONFIG.value.style.chart.zoom.startIndex)) {
        if (FINAL_CONFIG.value.style.chart.zoom.startIndex !== null) {
            return FINAL_CONFIG.value.style.chart.zoom.startIndex + 1
        } else {
            return 1
        }
    }
    return v
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
    if(!canvas.value) {
        return
    }
    const containerWidth = container.value.offsetWidth;
    const containerHeight = container.value.offsetHeight;
    canvas.value.width = containerWidth * dpr.value * 2;
    canvas.value.height = containerHeight * dpr.value * 2; 2;
    w.value = containerWidth * dpr.value * 2;
    h.value = containerHeight * dpr.value * 2;
    ctx.value.scale(dpr.value, dpr.value);

    draw();
}

function setupChart() {
    ctx.value.clearRect(0, 0, 10000, 10000)
    ctx.value.fillStyle = FINAL_CONFIG.value.style.chart.backgroundColor;
    ctx.value.fillRect(0, 0, drawingArea.value.canvasWidth, drawingArea.value.canvasHeight);

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

                if(i % Math.floor((slicer.value.end - slicer.value.start) / FINAL_CONFIG.value.style.chart.grid.y.timeLabels.modulo) === 0) {
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

                    if(k % Math.floor((slicer.value.end - slicer.value.start) / FINAL_CONFIG.value.style.chart.grid.y.timeLabels.modulo) === 0) {
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
        const radius = (tooltipIndex.value === i ? w.value / 150 : FINAL_CONFIG.value.style.chart.line.plots.show ? w.value / 200 : 0) * FINAL_CONFIG.value.style.chart.line.plots.radiusRatio;
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
                        globalAlpha: formattedDataset.value.some(ds => ds.showYMarker) && ![null, undefined].includes(tooltipIndex.value) ? 0.2 : 1
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
                            globalAlpha: ds.showYMarker && ![null, undefined].includes(tooltipIndex.value) ? 0.2 : 1
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
            }
        );
    }
}

const timeLabels = computed(() => {
    return useTimeLabels({
        values: FINAL_CONFIG.value.style.chart.grid.y.timeLabels.values,
        maxDatapoints: maxSeries.value,
        formatter: FINAL_CONFIG.value.style.chart.grid.y.timeLabels.datetimeFormatter,
        start: 0,
        end: FINAL_CONFIG.value.style.chart.grid.y.timeLabels.values.length
    });
});

function drawTimeLabels() {
    for (let i = slicer.value.start; i < slicer.value.end; i += 1) {
        if (
            (slicer.value.end - slicer.value.start) < FINAL_CONFIG.value.style.chart.grid.y.timeLabels.modulo || 
            ((slicer.value.end - slicer.value.start) >= FINAL_CONFIG.value.style.chart.grid.y.timeLabels.modulo && (i % Math.floor((slicer.value.end - slicer.value.start) / FINAL_CONFIG.value.style.chart.grid.y.timeLabels.modulo) === 0 ||
            (i === (tooltipIndex.value + slicer.value.start)) && FINAL_CONFIG.value.style.chart.grid.y.timeLabels.showMarker ))) 
        {
            text(
                ctx.value,
                timeLabels.value[i] ? timeLabels.value[i].text : i + 1,
                drawingArea.value.left + (drawingArea.value.slot * (i - slicer.value.start)) + (drawingArea.value.slot / 2),
                drawingArea.value.bottom + (w.value / FINAL_CONFIG.value.style.chart.grid.y.timeLabels.offsetY),
                {
                    align: FINAL_CONFIG.value.style.chart.grid.y.timeLabels.rotation === 0 ? 'center' : FINAL_CONFIG.value.style.chart.grid.y.timeLabels.rotation > 0 ? 'left' : 'right',
                    font: `${FINAL_CONFIG.value.style.chart.grid.y.timeLabels.bold ? 'bold ' : ''}${Math.round(w.value / 40 * FINAL_CONFIG.value.style.chart.grid.y.timeLabels.fontSizeRatio)}px ${FINAL_CONFIG.value.style.fontFamily}`,
                    color: FINAL_CONFIG.value.style.chart.grid.y.timeLabels.showMarker ? setOpacity(FINAL_CONFIG.value.style.chart.grid.y.timeLabels.color, tooltipIndex.value !== null ? (tooltipIndex.value + slicer.value.start) === i ? 100 : 20 : 100) : FINAL_CONFIG.value.style.chart.grid.y.timeLabels.color,
                    rotation: FINAL_CONFIG.value.style.chart.grid.y.timeLabels.rotation,
                }
            );
        }
    }
}

function drawVerticalSelector() {
    line(
        ctx.value,
        [
            { x: drawingArea.value.left + (drawingArea.value.slot * tooltipIndex.value) + (drawingArea.value.slot / 2), y: drawingArea.value.top },
            { x: drawingArea.value.left + (drawingArea.value.slot * tooltipIndex.value) + (drawingArea.value.slot / 2), y: drawingArea.value.bottom },
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

function drawLineOrArea(ds) {
    if (ds.useArea) {
        // AREA
        if (mutableConfig.value.stacked) {
            polygon(
                ctx.value,
                [{ x: ds.coordinatesLine[0].x, y: ds.localZero }, ...ds.coordinatesLine, { x: ds.coordinatesLine.at(-1).x, y: ds.localZero }],
                {
                    fillColor: setOpacity(ds.color, FINAL_CONFIG.value.style.chart.area.opacity),
                    strokeColor: 'transparent',
                }
            );
        } else {
            polygon(
                ctx.value,
                [{ x: ds.coordinatesLine[0].x, y: absoluteExtremes.value.zero }, ...ds.coordinatesLine, { x: ds.coordinatesLine.at(-1).x, y: absoluteExtremes.value.zero }],
                {
                    fillColor: setOpacity(ds.color, FINAL_CONFIG.value.style.chart.area.opacity),
                    strokeColor: 'transparent',
                }
            );
        }
    } else {
        line(ctx.value, ds.coordinatesLine, {
            color: ds.color,
            lineWidth: 3
        });
    }
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

function draw() {
    setupChart();
    if (datasetHasChanged.value) {

        (tooltipIndex.value !== null && FINAL_CONFIG.value.style.chart.selector.show) && drawVerticalSelector();

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

        clonedCanvas.value = cloneCanvas(canvas.value);
    } else {
        if (clonedCanvas.value) {
            ctx.value.clearRect(0, 0, 10000, 10000)
            ctx.value.drawImage(clonedCanvas.value, 0, 0)
        }

        (tooltipIndex.value !== null && FINAL_CONFIG.value.style.chart.selector.show) && drawVerticalSelector();

        // PLOT HIGHLIGHTS
        if (tooltipIndex.value !== null) {
            formattedDataset.value.forEach(ds => {
                if (((ds.type === 'line' || !ds.type)) || ds.type === 'plot') {
                    if(!ds.coordinatesLine[tooltipIndex.value]) return
                    if (ds.coordinatesLine[tooltipIndex.value].x !== undefined && ds.coordinatesLine[tooltipIndex.value].y !== undefined) {
                        circle(
                            ctx.value,
                            {
                                x: ds.coordinatesLine[tooltipIndex.value].x,
                                y: ds.coordinatesLine[tooltipIndex.value].y
                            },
                            w.value / 150 * FINAL_CONFIG.value.style.chart.line.plots.radiusRatio,
                            {
                                color: FINAL_CONFIG.value.style.chart.backgroundColor,
                                fillStyle: ds.color,
                                strokeColor: 'transparent'
                            }
                        );
                    }
                }
            });
        }
    }

    // TIME LABELS
    FINAL_CONFIG.value.style.chart.grid.y.timeLabels.show && drawTimeLabels();
    FINAL_CONFIG.value.style.chart.selector.show && FINAL_CONFIG.value.style.chart.selector.showHorizontalSelector && drawHorizontalSelector();

    drawYAxisScaleLabels();
    drawYAxisSelectedDatapoints();

    datasetHasChanged.value = false;
}

const debounceCanvasResize = debounce(() => {
    tooltipHasChanged.value = true;
    resizeCanvas()
}, maxSeries.value > 200 ? 10 : 1, !tooltipHasChanged.value);

function getYandValueAtIndex(datapoint) {
    if ([null, undefined].includes(tooltipIndex.value) || !datapoint.coordinatesLine[tooltipIndex.value]) return false;
    const { y, value } = datapoint.coordinatesLine[tooltipIndex.value];
    return { y, value };
}

function handleMousemove(e) {
    const { left, top } = canvas.value.getBoundingClientRect();
    const mouseX = e.clientX - left;
    mouseY.value = (e.clientY - top) * 2;

    if (
        mouseY.value < drawingArea.value.top || 
        mouseY.value > drawingArea.value.bottom
    ) {
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

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
        seriesIndex: tooltipIndex.value,
        datapoint: formattedDataset.value.map(ds => {
            return {
                shape: ds.shape || null,
                name: ds.name,
                color: ds.color,
                type: ds.type || 'line',
                value: ds.series.find((s, i) => i === tooltipIndex.value)
            }
        }),
        series: formattedDataset.value,
        config: FINAL_CONFIG.value
    }))) {
        tooltipContent.value = customFormat({
            seriesIndex: tooltipIndex.value,
            datapoint: formattedDataset.value.map(ds => {
                return {
                    shape: ds.shape || null,
                    name: ds.name,
                    color: ds.color,
                    type: ds.type || 'line',
                    value: ds.series.find((s, i) => i === tooltipIndex.value)
                }
            }),
            series: formattedDataset.value,
            config: FINAL_CONFIG.value
        })
    } else {
        if (FINAL_CONFIG.value.style.chart.grid.y.timeLabels.values.slice(slicer.value.start, slicer.value.end)[tooltipIndex.value]) {
            html += `<div style="padding-bottom: 6px; margin-bottom: 4px; border-bottom: 1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor}; width:100%">${timeLabels.value.slice(slicer.value.start, slicer.value.end)[tooltipIndex.value].text}</div>`;
        }
        html += tootlipDataset.value.join('')
        tooltipContent.value = html;
    }
    tooltipHasChanged.value = false;
}

watch(() => tooltipIndex.value, (_) => {
    debounceCanvasResize();
});

watch(() => slicer.value, (_) => {
    datasetHasChanged.value = true;
    draw();
}, {
    deep: true
});

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
    prepareChart();
});

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiXyCanvas',
            type: 'dataset'
        });
    } else {
        // TODO: check for missing ds attrs
        if (canvas.value) {
            ctx.value = canvas.value.getContext('2d', { willReadFrequently: true });
        }
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: xy.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
                slicer: FINAL_CONFIG.value.style.chart.zoom.show && maxSeries.value > 1 ? chartSlicer.value : null,
                source: source.value
            });

            requestAnimationFrame(() => {
                aspectRatio.value = `${width} / ${height}`;
            });
        });

        if (responsiveObserver.value) {
            if (observedEl.value) {
                responsiveObserver.value.unobserve(observedEl.value)
            }
            responsiveObserver.value.disconnect();
        }

        responsiveObserver.value = new ResizeObserver(handleResize);
        observedEl.value = xy.value.parentNode;
        responsiveObserver.value.observe(observedEl.value);
    }

    if (resizeObserver.value) {
        resizeObserver.value.disconnect();
    }

    resizeObserver.value = new ResizeObserver((entries) => {
        for (const entry of entries) {
            if (entry.contentBoxSize && container.value) {
                datasetHasChanged.value = true;
                debounceCanvasResize();
            }
        }
    });

    resizeObserver.value.observe(container.value);
    setupSlicer();
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

        body.push([FINAL_CONFIG.value.style.chart.grid.y.timeLabels.values.slice(slicer.value.start, slicer.value.end)[i] ? timeLabels.value.slice(slicer.value.start, slicer.value.end)[i].text : i+1].concat(formattedDataset.value.map(ds => (ds.series[i] ?? 0).toFixed(FINAL_CONFIG.value.table.rounding))).concat((sum ?? 0).toFixed(FINAL_CONFIG.value.table.rounding)));
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
        const row = [FINAL_CONFIG.value.style.chart.grid.y.timeLabels.values[i] ? timeLabels.value[i].text : i + 1];
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

defineExpose({
    getData,
    generateCsv,
    generatePdf,
    generateImage,
    toggleTable,
    toggleLabels,
    toggleStack,
    toggleTooltip,
    toggleAnnotator
});

</script>

<template>
    <div :style="`width:100%; position:relative; ${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`" ref="xy" :id="`xy_canvas_${uid}`" :class="`vue-ui-donut ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
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
        
        <UserOptions
            ref="details"
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
            :hasTable="(slicer.end - slicer.start < 200) && FINAL_CONFIG.userOptions.buttons.table"
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
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
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
                v-if="isDataset" 
                ref="canvas" 
                style="width:100%; height:100%;" 
                @mousemove="handleMousemove($event)"
                @mouseleave="handleMouseLeave"
            />
            
            <Skeleton 
                v-else
                :config="{
                    type: 'line',
                    style: {
                        backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                        line: {
                            axis: {
                                color: '#CCCCCC',
                            },
                            path: {
                                color: '#CCCCCC',
                                strokeWidth: 0.5
                            }
                        }
                    }
            }"
        />
    
            <!-- TOOLTIP -->
            <Tooltip :show="mutableConfig.showTooltip && isTooltip"
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
                :isCustom="isFunction(FINAL_CONFIG.style.chart.tooltip.customFormat)">
                <template #tooltip-before>
                    <slot name="tooltip-before" v-bind="{ ...dataTooltipSlot }"></slot>
                </template>
                <template #tooltip-after>
                    <slot name="tooltip-after" v-bind="{ ...dataTooltipSlot }"></slot>
                </template>
            </Tooltip>
        </div>
    
        <div ref="chartSlicer" :style="`width:100%;background:${FINAL_CONFIG.style.chart.backgroundColor}`" data-dom-to-png-ignore>    
            <Slicer 
                ref="slicerComponent"
                v-if="FINAL_CONFIG.style.chart.zoom.show && maxSeries > 1"
                :key="`slicer_${slicerStep}`"
                :background="FINAL_CONFIG.style.chart.zoom.color"
                :borderColor="FINAL_CONFIG.style.chart.backgroundColor"
                :fontSize="FINAL_CONFIG.style.chart.zoom.fontSize"
                :useResetSlot="FINAL_CONFIG.style.chart.zoom.useResetSlot"
                :labelLeft="FINAL_CONFIG.style.chart.grid.y.timeLabels.values[slicer.start] ? timeLabels[slicer.start].text : ''"
                :labelRight="FINAL_CONFIG.style.chart.grid.y.timeLabels.values[slicer.end-1] ? timeLabels[slicer.end-1].text : ''"
                :textColor="FINAL_CONFIG.style.chart.color"
                :inputColor="FINAL_CONFIG.style.chart.zoom.color"
                :selectColor="FINAL_CONFIG.style.chart.zoom.highlightColor"
                :max="maxSeries"
                :min="0"
                :valueStart="slicer.start"
                :valueEnd="slicer.end"
                v-model:start="slicer.start"
                v-model:end="slicer.end"
                :refreshStartPoint="FINAL_CONFIG.style.chart.zoom.startIndex !== null ? FINAL_CONFIG.style.chart.zoom.startIndex : 0"
                :refreshEndPoint="FINAL_CONFIG.style.chart.zoom.endIndex !== null ? FINAL_CONFIG.style.chart.zoom.endIndex + 1 : maxSeries"
                :enableRangeHandles="FINAL_CONFIG.style.chart.zoom.enableRangeHandles"
                :enableSelectionDrag="FINAL_CONFIG.style.chart.zoom.enableSelectionDrag"
                @reset="refreshSlicer"
            >
                <template #reset-action="{ reset }">
                    <slot name="reset-action" v-bind="{ reset }"/>
                </template>
            </Slicer>
        </div>
    
        <div ref="chartLegend">
            <Legend v-if="FINAL_CONFIG.style.chart.legend.show && isDataset" :legendSet="legendSet" :config="legendConfig" :key="`legend_${legendStep}`"
                @clickMarker="({ i }) => segregate(i)">
                <template #item="{ legend, index }">
                    <div data-cy="legend-item" @click="legend.segregate()" :style="`opacity:${segregated.includes(index) ? 0.5 : 1}`">
                        {{ legend.name }}
                    </div>
                </template>
            </Legend>
    
            <slot v-else name="legend" v-bind:legend="legendSet" />
        </div>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <Accordion v-if="slicer.end - slicer.start < 200" hideDetails :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color
            },
            head: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color
            }
        }">
            <template #content>
                <DataTable 
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames"
                    :head="dataTable.head"
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false"
                >
                    <template #th="{ th }">
                        <div v-html="th"/>
                    </template>
                    <template #td="{ td }">
                        {{ td }}
                    </template>
                </DataTable>
            </template>
        </Accordion>

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

.vue-ui-xy-canvas {
    width: 100%;
}

canvas {
    position: absolute;
    top: 0;
    left: 0;
}
</style>