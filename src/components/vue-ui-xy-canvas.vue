<script setup>
import {
    ref,
    computed,
    onMounted,
    watch
} from "vue";
import {
    calculateNiceScale,
    convertColorToHex,
    convertCustomPalette,
    createUid,
    dataLabel,
    error,
    functionReturnsString,
    isFunction,
    lightenHexColor,
    objectIsEmpty,
    opacity,
    palette,
    themePalettes,
    downloadCsv,
    createCsvContent
} from "../lib";
import {
    circle,
    cloneCanvas,
    debounce,
    line,
    polygon,
    rect,
    text,
} from "../canvas-lib";
import img from "../img";
import pdf from "../pdf";
import { useNestedProp } from "../useNestedProp";
import mainConfig from "../default_configs.json"
import themes from "../themes.json";
import Tooltip from "../atoms/Tooltip.vue";
import Legend from "../atoms/Legend.vue";
import Title from "../atoms/Title.vue";
import Slicer from "../atoms/Slicer.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Accordion from "./vue-ui-accordion.vue";
import DataTable from "../atoms/DataTable.vue";

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
const canvas = ref(null);
const container = ref(null);
const ctx = ref(null);
const w = ref(0);
const h = ref(0);
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
const isPrinting = ref(false);
const isImaging = ref(false);
const isFullscreen = ref(false);

const emit = defineEmits(['selectLegend'])

const xyConfig = computed(() => {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: mainConfig.vue_ui_xy_canvas
    })
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_xy_canvas[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        return mergedConfig;
    }
});

const mutableConfig = ref({
    showTable: xyConfig.value.table.show,
    showDataLabels: xyConfig.value.style.chart.dataLabels.show,
    stacked: xyConfig.value.style.chart.stacked
});

function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const customPalette = computed(() => {
    return convertCustomPalette(xyConfig.value.customPalette)
});

const maxSeries = computed(() => {
    return Math.max(...props.dataset.filter((_, i) => !segregated.value.includes(i)).map(ds => ds.series.length))
});

const drawingArea = computed(() => {
    const width = w.value - (w.value * (xyConfig.value.style.chart.paddingProportions.left + xyConfig.value.style.chart.paddingProportions.right))
    return {
        canvasWidth: w.value,
        canvasHeight: h.value,
        left: w.value * xyConfig.value.style.chart.paddingProportions.left,
        top: h.value * xyConfig.value.style.chart.paddingProportions.top,
        right: w.value - (w.value * xyConfig.value.style.chart.paddingProportions.right),
        bottom: h.value - (h.value * xyConfig.value.style.chart.paddingProportions.bottom),
        width,
        height: h.value - (h.value * (xyConfig.value.style.chart.paddingProportions.top + xyConfig.value.style.chart.paddingProportions.bottom)),
        slot: width / (slicer.value.end - slicer.value.start)
    }
});

function proportionToMax(p, m) {
    return p / m;
}

function createDatapointCoordinates({ series, min, max, scale, stackIndex = null }) {
    return series.map((s, i) => {
        const absMin = scale.min < 0 ? Math.abs(scale.min) : 0;
        const pToMax = proportionToMax(s + absMin, absMin + scale.max)
        
        let y = 0;

        if (stackIndex === null) {
            y = drawingArea.value.bottom - (drawingArea.value.height * pToMax);
        } else {
            const hUnit = (drawingArea.value.height / props.dataset.filter((_,i) => !segregated.value.includes(i)).length);
            y = drawingArea.value.bottom - (hUnit * stackIndex) - ((hUnit * stackGapRatio.value /* TODO: config, should be 1 when all but 1 are segregated */) * pToMax)
        }

        return {
            x: drawingArea.value.left + drawingArea.value.slot * i + (drawingArea.value.slot / 2),
            y,
            value: s
        }
    });
}

const absoluteExtremes = computed(() => {
    const min = Math.min(...props.dataset.filter((_, i) => !segregated.value.includes(i)).flatMap(ds => ds.series));
    const max = Math.max(...props.dataset.filter((_, i) => !segregated.value.includes(i)).flatMap(ds => ds.series));
    const scale = calculateNiceScale(min, max === min ? min + 1 : max, xyConfig.value.style.chart.scale.ticks);

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
            <div>
                <svg viewBox="0 0 10 10" height="12" width="12">
                    <circle cx="5" cy="5" r="5" fill="${ds.color}"/>
                </svg>
                <span>${ds.name ? ds.name + ' : ' : ''}</span>
                <span>${dataLabel({
            p: ds.prefix || '',
            v: ds.series[tooltipIndex.value],
            s: ds.suffix || '',
            r: ds.rounding || 0
        })}</span>
            </div>
        `
    });
});

const formattedDataset = computed(() => {
    const hUnit = (drawingArea.value.height / props.dataset.filter((_,i) => !segregated.value.includes(i)).length);

    return props.dataset
        .map((ds, i) => {
            return {
                ...ds,
                series: ds.series.slice(slicer.value.start, slicer.value.end),
                absoluteIndex: i
            }
        })
        .filter((_, i) => !segregated.value.includes(i))
        .map((ds, i) => {
            const min = Math.min(...ds.series);
            const max = Math.max(...ds.series);
            const localScale = calculateNiceScale(min < 0 ? min : 0, max === min ? min + 1 : max, ds.scaleSteps || xyConfig.value.style.chart.scale.ticks);
            const localMin = localScale.min < 0 ? Math.abs(localScale.min) : 0;
            const localZero = drawingArea.value.bottom - (hUnit * i) - ((hUnit * stackGapRatio.value) * (localMin / ((localScale.max) + localMin)));
            const localYLabels = localScale.ticks.map(t => {
                return {
                    y: drawingArea.value.bottom - (hUnit * i) - ((hUnit * stackGapRatio.value) * ((t + localMin) / ((localScale.max) + localMin))),
                    x: drawingArea.value.left - 8,
                    value: t
                }
            });

            const coordinatesLine = createDatapointCoordinates({
                series: ds.series,
                min: mutableConfig.value.stacked ? min : absoluteExtremes.value.min,
                max: mutableConfig.value.stacked ? max : absoluteExtremes.value.max,
                scale: mutableConfig.value.stacked ? localScale : absoluteExtremes.value.scale,
                stackIndex: mutableConfig.value.stacked ? i : null
            });

            return {
                ...ds,
                color: convertColorToHex(ds.color || customPalette.value[ds.absoluteIndex] || palette[ds.absoluteIndex] || palette[ds.absoluteIndex % palette.length]),
                coordinatesLine,
                min,
                max,
                localScale,
                localZero,
                localMin,
                localYLabels
            }
        });
});

const slicer = ref({
    start: 0,
    end: maxSeries.value
});

function refreshSlicer() {
    slicer.value = {
        start: 0,
        end: maxSeries.value
    };
    slicerStep.value += 1;
}

const isSingleSerie = computed(() => {
    return props.dataset.length - segregated.value.length === 1
})

const stackGapRatio = computed(() => {
    if (isSingleSerie.value) return 1;
    return xyConfig.value.style.chart.stackGapRatio;
})

const lineAndPlotTypes = computed(() => {
    return formattedDataset.value.filter(ds => {
        return ['line', 'plot', undefined].includes(ds.type)
    })
});

const barTypes = computed(() => {
    return formattedDataset.value.filter(ds => {
        return ds.type === 'bar'
    })
})

function resizeCanvas() {
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
    ctx.value.fillStyle = xyConfig.value.style.chart.backgroundColor;
    ctx.value.fillRect(0, 0, drawingArea.value.canvasWidth, drawingArea.value.canvasHeight);

    if (!mutableConfig.value.stacked) {
        // VERTICAL LINES
        if (xyConfig.value.style.chart.grid.y.verticalLines.show && (slicer.value.end - slicer.value.start) < xyConfig.value.style.chart.grid.y.verticalLines.hideUnderXLength) {
            for (let i = 0; i < (slicer.value.end - slicer.value.start) + 1; i += 1) {
                line(
                    ctx.value,
                    [
                        { x: drawingArea.value.left + drawingArea.value.slot * i, y: drawingArea.value.top },
                        { x: drawingArea.value.left + drawingArea.value.slot * i, y: drawingArea.value.bottom }
                    ],
                    {
                        color: xyConfig.value.style.chart.grid.y.verticalLines.color
                    }
                );
            }
        }
        // UNSTACKED

        // HORIZONTAL LINES
        if (xyConfig.value.style.chart.grid.x.horizontalLines.show) {
            if (xyConfig.value.style.chart.grid.x.horizontalLines.alternate) {
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
                                fillColor: i % 2 === 0 ? 'transparent' : xyConfig.value.style.chart.grid.x.horizontalLines.color + opacity[xyConfig.value.style.chart.grid.x.horizontalLines.opacity],
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
                            color: xyConfig.value.style.chart.grid.x.horizontalLines.color
                        }
                    )
                });
            }
        }

        // AXES LINES
        if (xyConfig.value.style.chart.grid.y.showAxis) {
            line(
                ctx.value,
                [
                    { x: drawingArea.value.left, y: drawingArea.value.top },
                    { x: drawingArea.value.left, y: drawingArea.value.bottom },
                ],
                {
                    color: xyConfig.value.style.chart.grid.y.axisColor,
                    lineWidth: xyConfig.value.style.chart.grid.y.axisThickness,
                }
            );
        }
        if (xyConfig.value.style.chart.grid.x.showAxis) {
            line(
                ctx.value,
                [
                    { x: drawingArea.value.left, y: drawingArea.value.bottom },
                    { x: drawingArea.value.right, y: drawingArea.value.bottom },
                ],
                {
                    color: xyConfig.value.style.chart.grid.x.axisColor,
                    lineWidth: xyConfig.value.style.chart.grid.x.axisThickness,
                }
            );
        }

        // ZERO LINE
        if (xyConfig.value.style.chart.grid.zeroLine.show) {
            line(
                ctx.value,
                [
                    { x: drawingArea.value.left, y: absoluteExtremes.value.zero },
                    { x: drawingArea.value.right, y: absoluteExtremes.value.zero },
                ],
                {
                    color: xyConfig.value.style.chart.grid.zeroLine.color,
                    lineDash: xyConfig.value.style.chart.grid.zeroLine.dashed ? [10, 10] : [0, 0]
                }
            )
        }

        // AXES LABELS
        if (xyConfig.value.style.chart.grid.y.axisLabels.show) {
            absoluteExtremes.value.yLabels.forEach(label => {
                text(
                    ctx.value,
                    dataLabel({
                        p: xyConfig.value.style.chart.grid.y.axisLabels.prefix || '',
                        v: label.value,
                        s: xyConfig.value.style.chart.grid.y.axisLabels.suffix || '',
                        r: xyConfig.value.style.chart.grid.y.axisLabels.rounding || 0
                    }),
                    label.x + xyConfig.value.style.chart.grid.y.axisLabels.offsetX,
                    label.y,
                    {
                        align: 'right',
                        font: `${w.value / 40 * xyConfig.value.style.chart.grid.y.axisLabels.fontSizeRatio}px ${xyConfig.value.style.fontFamily}`,
                        color: xyConfig.value.style.chart.grid.y.axisLabels.color
                    }
                );
            });
        }
    } else {
        // STACKED
        // VERTICAL LINES
        const hUnit = (drawingArea.value.height / props.dataset.filter((_,i) => !segregated.value.includes(i)).length);

        if (xyConfig.value.style.chart.grid.y.verticalLines.show && (slicer.value.end - slicer.value.start) < xyConfig.value.style.chart.grid.y.verticalLines.hideUnderXLength) {
            formattedDataset.value.forEach((ds, i) => {
                for (let k = 0; k < (slicer.value.end - slicer.value.start) + 1; k += 1) {
                    line(
                        ctx.value,
                        [
                            { 
                                x: drawingArea.value.left + drawingArea.value.slot * k,
                                y: drawingArea.value.bottom - (hUnit * i) - (hUnit * stackGapRatio.value)
                            },
                            {
                                x: drawingArea.value.left + drawingArea.value.slot * k,
                                y: drawingArea.value.bottom - (hUnit * i)
                            }
                        ],
                        {
                            color: xyConfig.value.style.chart.grid.y.verticalLines.color
                        }
                    );
                }
            });
        }

        // HORIZONTAL LINES
        if (xyConfig.value.style.chart.grid.x.horizontalLines.show) {
            if (xyConfig.value.style.chart.grid.x.horizontalLines.alternate) {
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
                                    fillColor: k % 2 === 0 ? 'transparent' : xyConfig.value.style.chart.grid.x.horizontalLines.color + opacity[xyConfig.value.style.chart.grid.x.horizontalLines.opacity],
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
                                color: xyConfig.value.style.chart.grid.x.horizontalLines.color
                            }
                        );
                    });
                });
            }
        }

        // ZERO LINE
        if (xyConfig.value.style.chart.grid.zeroLine.show) {
            formattedDataset.value.forEach(ds => {
                line(
                    ctx.value,
                    [
                        { x: drawingArea.value.left, y: ds.localZero },
                        { x: drawingArea.value.right, y: ds.localZero }
                    ],
                    {
                        color: xyConfig.value.style.chart.grid.zeroLine.color,
                        lineDash: xyConfig.value.style.chart.grid.zeroLine.dashed ? [10, 10] : [0, 0]
                    }
                )
            })
        }

        // AXES LABELS
        if (xyConfig.value.style.chart.grid.y.axisLabels.show) {
            formattedDataset.value.forEach((ds, i) => {

                line(
                    ctx.value,
                    [
                        { x: drawingArea.value.left, y: drawingArea.value.bottom - (hUnit * i) },
                        { x: drawingArea.value.left, y: drawingArea.value.bottom - (hUnit * i) - (hUnit * stackGapRatio.value)}
                    ],
                    {
                        color: ds.color
                    }
                );

                ds.localYLabels.forEach(entry => {
                    text(
                        ctx.value,
                        dataLabel({
                            p: ds.prefix || xyConfig.value.style.chart.grid.y.axisLabels.prefix || '',
                            v: entry.value,
                            s: ds.suffix || xyConfig.value.style.chart.grid.y.axisLabels.suffix || '',
                            r: ds.rounding || xyConfig.value.style.chart.grid.y.axisLabels.rounding || 0
                        }),
                        entry.x + xyConfig.value.style.chart.grid.y.axisLabels.offsetX,
                        entry.y,
                        {
                            align: 'right',
                            font: `${w.value / 40 * xyConfig.value.style.chart.grid.y.axisLabels.fontSizeRatio}px ${xyConfig.value.style.fontFamily}`,
                            color: ds.color
                        }
                    );
                });
            });
        }

        // DS NAME
        formattedDataset.value.forEach((ds, i) => {
            text(
                ctx.value,
                ds.name,
                w.value / 35,
                drawingArea.value.bottom - (hUnit * i) - ((hUnit * stackGapRatio.value) / 2),
                {
                    align: 'center',
                    rotation: -90,
                    color: ds.color,
                    font: `${w.value / 40 * xyConfig.value.style.chart.grid.y.axisLabels.fontSizeRatio}px ${xyConfig.value.style.fontFamily}`
                }
            );
        });
    }

    // AXES NAMES
    if (xyConfig.value.style.chart.grid.y.axisName) {
        text(
            ctx.value,
            xyConfig.value.style.chart.grid.y.axisName,
            w.value - w.value / 40 * xyConfig.value.style.chart.grid.y.axisLabels.fontSizeRatio * 1.2,
            drawingArea.value.bottom - drawingArea.value.height / 2,
            {
                font: `${w.value / 40 * xyConfig.value.style.chart.grid.y.axisLabels.fontSizeRatio}px ${xyConfig.value.style.fontFamily}`,
                color: xyConfig.value.style.chart.color,
                align: 'center',
                rotation: 90
            }
        )
    }

    if (xyConfig.value.style.chart.grid.x.axisName) {
        text(
            ctx.value,
            xyConfig.value.style.chart.grid.x.axisName,
            w.value / 2,
            h.value,
            {
                font: `${w.value / 40 * xyConfig.value.style.chart.grid.y.axisLabels.fontSizeRatio}px ${xyConfig.value.style.fontFamily}`,
                color: xyConfig.value.style.chart.color,
                align: 'center'
            }
        )
    }
}

function drawPlots(ds) {
    for (let i = 0; i < ds.coordinatesLine.length; i += 1) {
        circle(
            ctx.value,
            { x: ds.coordinatesLine[i].x, y: ds.coordinatesLine[i].y },
            (tooltipIndex.value === i ? w.value / 100 : w.value / 200) * xyConfig.value.style.chart.line.plots.radiusRatio,
            {
                color: xyConfig.value.style.chart.backgroundColor,
                fillStyle: ds.color,
                strokeColor: 'transparent'
            }
        );
    }
}

function drawDataLabels(ds) {
    for (let i = 0; i < ds.coordinatesLine.length; i += 1) {
        text(
            ctx.value,
            dataLabel({
                p: ds.prefix || '',
                v: ds.coordinatesLine[i].value,
                s: ds.suffix || '',
                r: ds.rounding || 0
            }),
            ds.coordinatesLine[i].x,
            ds.coordinatesLine[i].y + xyConfig.value.style.chart.dataLabels.offsetY,
            {
                align: 'center',
                font: `${w.value / 40 * xyConfig.value.style.chart.dataLabels.fontSizeRatio}px ${xyConfig.value.style.fontFamily}`,
                color: xyConfig.value.style.chart.dataLabels.useSerieColor ? ds.color : xyConfig.value.style.chart.dataLabels.color,
                strokeColor: xyConfig.value.style.chart.backgroundColor,
                lineWidth: 0.8
            }
        );
    }
}

function drawTimeLabels() {
    for (let i = slicer.value.start; i < slicer.value.end; i += 1) {
        if ((slicer.value.end - slicer.value.start) < 12 || ((slicer.value.end - slicer.value.start) >= 12 && (i % Math.floor((slicer.value.end - slicer.value.start) / 12) === 0 || i === (tooltipIndex.value + slicer.value.start)))) {
            text(
                ctx.value,
                xyConfig.value.style.chart.grid.y.timeLabels.values[i] || i + 1,
                drawingArea.value.left + (drawingArea.value.slot * (i - slicer.value.start)) + (drawingArea.value.slot / 2),
                drawingArea.value.bottom + (w.value / xyConfig.value.style.chart.grid.y.timeLabels.offsetY),
                {
                    align: xyConfig.value.style.chart.grid.y.timeLabels.rotation === 0 ? 'center' : xyConfig.value.style.chart.grid.y.timeLabels.rotation > 0 ? 'left' : 'right',
                    font: `${w.value / 40 * xyConfig.value.style.chart.grid.y.timeLabels.fontSizeRatio}px ${xyConfig.value.style.fontFamily}`,
                    color: xyConfig.value.style.chart.grid.y.timeLabels.color + opacity[tooltipIndex.value !== null ? (tooltipIndex.value + slicer.value.start) === i ? 100 : 20 : 100],
                    rotation: xyConfig.value.style.chart.grid.y.timeLabels.rotation,
                }
            );
        }
    }
}

function drawSelector() {
    const hUnit = (drawingArea.value.height / props.dataset.filter((_,i) => !segregated.value.includes(i)).length);

    if (mutableConfig.value.stacked) {
        formattedDataset.value.forEach((_, i) => {
            line(
                ctx.value,
                [
                    { x: drawingArea.value.left + (drawingArea.value.slot * tooltipIndex.value) + (drawingArea.value.slot / 2), y: drawingArea.value.bottom - (hUnit * i) },
                    { x: drawingArea.value.left + (drawingArea.value.slot * tooltipIndex.value) + (drawingArea.value.slot / 2), y: drawingArea.value.bottom - (hUnit * i) - (hUnit * stackGapRatio.value)}
                ],
                {
                    color: xyConfig.value.style.chart.selector.color,
                    lineDash: xyConfig.value.style.chart.selector.dashed ? [8, 8] : [0, 0],
                    lineWidth: 2
                }
            )
        })
    } else {
        line(
            ctx.value,
            [
                { x: drawingArea.value.left + (drawingArea.value.slot * tooltipIndex.value) + (drawingArea.value.slot / 2), y: drawingArea.value.top },
                { x: drawingArea.value.left + (drawingArea.value.slot * tooltipIndex.value) + (drawingArea.value.slot / 2), y: drawingArea.value.bottom },
            ],
            {
                color: xyConfig.value.style.chart.selector.color,
                lineDash: xyConfig.value.style.chart.selector.dashed ? [8, 8] : [0, 0],
                lineWidth: 2
            }
        );
    }
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
                    strokeColor: xyConfig.value.style.chart.backgroundColor,
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
                            { offset: 1, color: lightenHexColor(ds.color, 0.5) },
                        ]
                    }
                }
            );
            
            if (mutableConfig.value.showDataLabels) {
                if ([true, undefined].includes(ds.dataLabels)) {
                    text(
                        ctx.value,
                        dataLabel({
                            p: ds.prefix || '',
                            v: ds.coordinatesLine[k].value,
                            s: ds.suffix || '',
                            r: ds.rounding || 0
                        }),
                        drawingArea.value.left +
                                (drawingArea.value.slot * k) +
                                (drawingArea.value.slot / 10) +
                                (mutableConfig.value.stacked ? 0 : ((drawingArea.value.slot) / barTypes.value.length * i) -
                                (i === 0 ? 0 : (drawingArea.value.slot / (5 * barTypes.value.length) * i))) +
                                (drawingArea.value.slot * 0.4 / (mutableConfig.value.stacked ? 1 : barTypes.value.length)),
                        (ds.coordinatesLine[k].value < 0 ? (mutableConfig.value.stacked ? ds.localZero : absoluteExtremes.value.zero) : ds.coordinatesLine[k].y) + xyConfig.value.style.chart.dataLabels.offsetY ,
                        {
                            align: 'center',
                            font: `${w.value / 40 * xyConfig.value.style.chart.dataLabels.fontSizeRatio}px ${xyConfig.value.style.fontFamily}`,
                            color: xyConfig.value.style.chart.dataLabels.useSerieColor ? ds.color : xyConfig.value.style.chart.dataLabels.color,
                            strokeColor: xyConfig.value.style.chart.backgroundColor,
                            lineWidth: 0.8
                        }
                    )
                }
            }
        }
    });
}

function drawLineOrArea(ds) {
    if (ds.useArea) {
        // AREA
        polygon(
            ctx.value,
            [{ x: ds.coordinatesLine[0].x, y: absoluteExtremes.value.zero }, ...ds.coordinatesLine, { x: ds.coordinatesLine.at(-1).x, y: absoluteExtremes.value.zero }],
            {
                fillColor: ds.color + opacity[xyConfig.value.style.chart.area.opacity],
                strokeColor: 'transparent'
            }
        );
    } else {
        line(ctx.value, ds.coordinatesLine, {
            color: ds.color,
            lineWidth: 3
        });
    }
}

function drawXBaseLineStacked() {
    const hUnit = (drawingArea.value.height / props.dataset.filter((_,i) => !segregated.value.includes(i)).length);
    formattedDataset.value.forEach((ds, i) => {
        line(
            ctx.value,
            [
                { x: drawingArea.value.left, y: drawingArea.value.bottom - (hUnit * i) },
                { x: drawingArea.value.right, y: drawingArea.value.bottom - (hUnit * i) },
            ],
            {
                color: ds.color,
                lineWidth: 1,
            }
        );
    });
}

function draw() {
    setupChart();
    if (datasetHasChanged.value) {

        if (tooltipHasChanged.value) {
            (tooltipIndex.value !== null && xyConfig.value.style.chart.selector.show) && drawSelector();
        }

        drawBars();

        mutableConfig.value.stacked && xyConfig.value.style.chart.grid.x.showAxis && drawXBaseLineStacked();

        lineAndPlotTypes.value.forEach(ds => {
            (ds.type === 'line' || !ds.type) && drawLineOrArea(ds);

            if (tooltipHasChanged.value) {
                // PLOTS
                (xyConfig.value.style.chart.line.plots.show || ds.type === 'plot') && drawPlots(ds);
                // DATALABELS
                if (mutableConfig.value.showDataLabels) {
                    ([true, undefined].includes(ds.dataLabels)) && drawDataLabels(ds);
                }
            }
        });

        clonedCanvas.value = cloneCanvas(canvas.value)
    } else {
        ctx.value.drawImage(clonedCanvas.value, 0, 0)

        if (tooltipHasChanged.value) {
            (tooltipIndex.value !== null && xyConfig.value.style.chart.selector.show) && drawSelector();
        }

        // PLOT HIGHLIGHTS
        if (tooltipHasChanged.value && tooltipIndex.value !== null) {
            formattedDataset.value.forEach(ds => {
                if (((ds.type === 'line' || !ds.type) && xyConfig.value.style.chart.line.plots.show) || ds.type === 'plot') {
                    if (ds.coordinatesLine[tooltipIndex.value].x !== undefined && ds.coordinatesLine[tooltipIndex.value].y !== undefined) {
                        circle(
                            ctx.value,
                            {
                                x: ds.coordinatesLine[tooltipIndex.value].x,
                                y: ds.coordinatesLine[tooltipIndex.value].y
                            },
                            w.value / 100 * xyConfig.value.style.chart.line.plots.radiusRatio,
                            {
                                color: xyConfig.value.style.chart.backgroundColor,
                                fillStyle: ds.color,
                                strokeColor: 'transparent'
                            }
                        )
                    }
                }
            });
        }
    }

    // TIME LABELS
    xyConfig.value.style.chart.grid.y.timeLabels.show && drawTimeLabels();

    datasetHasChanged.value = false;
}

const debounceCanvasResize = debounce(() => {
    tooltipHasChanged.value = true;
    resizeCanvas()
}, maxSeries.value > 200 ? 10 : 1, !tooltipHasChanged.value)

function handleMousemove(e) {

    const { left } = canvas.value.getBoundingClientRect()
    const mouseX = e.clientX - left;

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

    const customFormat = xyConfig.value.style.chart.tooltip.customFormat;

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
        config: xyConfig.value
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
            config: xyConfig.value
        })
    } else {
        if (xyConfig.value.style.chart.grid.y.timeLabels.values[tooltipIndex.value]) {
            html += `<div style="padding-bottom: 6px; margin-bottom: 4px; border-bottom: 1px solid ${xyConfig.value.style.chart.tooltip.borderColor}; width:100%">${xyConfig.value.style.chart.grid.y.timeLabels.values.slice(slicer.value.start, slicer.value.end)[tooltipIndex.value]}</div>`;
        }
        html += tootlipDataset.value.join('')
        tooltipContent.value = html;
    }
    tooltipHasChanged.value = false;
}

watch(() => tooltipIndex.value, () => {
    debounceCanvasResize()
});

watch(() => slicer.value, () => {
    datasetHasChanged.value = true
    draw()
}, {
    deep: true
});

watch(() => mutableConfig.value.showDataLabels, () => {
    datasetHasChanged.value = true;
    draw()
});

watch(() => mutableConfig.value.stacked, (v) => {
    datasetHasChanged.value = true;
    tooltipHasChanged.value = true;
    debounceCanvasResize()
});

function handleMouseLeave() {
    isTooltip.value = false;
    tooltipIndex.value = null;
    tooltipContent.value = '';
}

onMounted(() => {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiXyCanvas',
            type: 'dataset'
        });
    } else {
        // TODO: check for missing ds attrs
        if (canvas.value) {
            ctx.value = canvas.value.getContext('2d');
        }
    }

    const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            if (entry.contentBoxSize && container.value) {
                datasetHasChanged.value = true;
                debounceCanvasResize()
            }
        }
    });

    resizeObserver.observe(container.value);
});

function segregate(index) {
    emit('selectLegend', formattedDataset.value[index])
    if (segregated.value.includes(index)) {
        segregated.value = segregated.value.filter(i => i !== index);
    } else {
        segregated.value.push(index);
    }
    datasetHasChanged.value = true;
    debounceCanvasResize();
}

const legendSet = computed(() => {
    return props.dataset.map((ds, i) => {
        return {
            name: ds.name,
            color: convertColorToHex(ds.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
            shape: ds.shape || 'circle',
            prefix: ds.prefix || '',
            suffix: ds.suffix || '',
            rounding: ds.rounding || 0
        }
    }).map((ds, i) => {
        return {
            ...ds,
            opacity: segregated.value.includes(i) ? 0.5 : 1,
            segregate: () => segregate(i),
            isSegregated: segregated.value.includes(i)
        }
    });
});

const legendConfig = computed(() => {
    return {
        cy: 'donut-div-legend',
        backgroundColor: xyConfig.value.style.chart.legend.backgroundColor,
        color: xyConfig.value.style.chart.legend.color,
        fontSize: xyConfig.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: xyConfig.value.style.chart.legend.bold ? 'bold' : ''
    }
});

const __to__ = ref(null);

function showSpinnerPdf() {
    isPrinting.value = true;
}

function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(`xy_canvas_${uid.value}`),
            fileName: xyConfig.value.style.chart.title.text || 'vue-ui-xy-canvas'
        }).finally(() => {
            isPrinting.value = false;
        });
    }, 100)
}

function showSpinnerImage() {
    isImaging.value = true;
}

function generateImage() {
    showSpinnerImage();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        img({
            domElement: document.getElementById(`xy_canvas_${uid.value}`),
            fileName: xyConfig.value.style.chart.title.text || 'vue-ui-xy-canvas',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

const dataTable = computed(() => {
    const head = [''].concat(formattedDataset.value.map(ds => ds.name)).concat(` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`)

    let body = [];

    for (let i = 0; i < maxSeries.value; i += 1) {
        const sum = formattedDataset.value.map(ds => {
            return ds.series[i] ?? 0
        }).reduce((a,b ) => a + b, 0)

        body.push([xyConfig.value.style.chart.grid.y.timeLabels.values.slice(slicer.value.start, slicer.value.end)[i] ?? '-'].concat(formattedDataset.value.map(ds => (ds.series[i] ?? 0).toFixed(xyConfig.value.table.rounding))).concat((sum ?? 0).toFixed(xyConfig.value.table.rounding)))
    }

    const config = {
        th: {
            backgroundColor: xyConfig.value.table.th.backgroundColor,
            color: xyConfig.value.table.th.color,
            outline: xyConfig.value.table.th.outline
        },
        td: {
            backgroundColor: xyConfig.value.table.td.backgroundColor,
            color: xyConfig.value.table.td.color,
            outline: xyConfig.value.table.td.outline
        },
        breakpoint: xyConfig.value.table.responsiveBreakpoint
    }

    const colNames = [xyConfig.value.table.columnNames.period].concat(formattedDataset.value.map(ds => ds.name)).concat(xyConfig.value.table.columnNames.total)

    return { head, body: body.slice(0, slicer.value.end - slicer.value.start), config, colNames}
})

const tableCsv = computed(() => {
    if(formattedDataset.value.length === 0) return { head: [], body: [], config: {}, columnNames: []};

    const head = formattedDataset.value.map(s => {
        return {
            label: s.name,
            color: s.color,
            type: s.type
        }
    })

    const body = [];

    xyConfig.value.style.chart.grid.y.timeLabels.values.forEach((t, i) => {
        const row = [t];
        formattedDataset.value.forEach(s => {
            row.push(Number((s.series[i] || 0).toFixed(xyConfig.value.table.rounding)))
        });
        body.push(row);
    })

    return { head, body};
})

function generateCsv() {
    const title = [[xyConfig.value.style.chart.title.text], [xyConfig.value.style.chart.title.subtitle.text], [""]];
    const head = ["",...tableCsv.value.head.map(h => h.label)]
    const body = tableCsv.value.body
    const table = title.concat([head]).concat(body);
    const csvContent = createCsvContent(table);
    downloadCsv({ csvContent, title: xyConfig.value.style.chart.title.text || 'vue-ui-xy-canvas'})
}

function getData() {
    return formattedDataset.value;
}

defineExpose({
    getData,
    generateCsv,
    generatePdf,
    generateImage
})

</script>

<template>
    <div style="width:100%; position: relative" ref="xy" :id="`xy_canvas_${uid}`">    
        <div v-if="xyConfig.style.chart.title.text"
            :style="`width:100%;background:${xyConfig.style.chart.backgroundColor};`">
            <Title :config="{
            title: {
                cy: 'xy-canvas-title',
                text: xyConfig.style.chart.title.text,
                color: xyConfig.style.chart.title.color,
                fontSize: xyConfig.style.chart.title.fontSize,
                bold: xyConfig.style.chart.title.bold
            },
            subtitle: {
                cy: 'xy-canvas-subtitle',
                text: xyConfig.style.chart.title.subtitle.text,
                color: xyConfig.style.chart.title.subtitle.color,
                fontSize: xyConfig.style.chart.title.subtitle.fontSize,
                bold: xyConfig.style.chart.title.subtitle.bold
            }
        }" />
        </div>
        
        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="xyConfig.userOptions.show"
            :backgroundColor="xyConfig.style.chart.backgroundColor"
            :color="xyConfig.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            hasImg
            :hasTable="(slicer.end - slicer.start < 200)"
            hasLabel
            :hasStack="dataset.length > 1"
            hasFullscreen
            :isFullscreen="isFullscreen"
            :chartElement="xy"
            :isStacked="mutableConfig.stacked"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="mutableConfig.showTable = !mutableConfig.showTable"
            @toggleLabels="mutableConfig.showDataLabels = !mutableConfig.showDataLabels"
            @toggleStack="mutableConfig.stacked = !mutableConfig.stacked"
        />

        <div class="vue-ui-xy-canvas" :style="`position: relative; aspect-ratio: ${xyConfig.style.chart.aspectRatio}`"
        ref="container">
    
            <canvas ref="canvas" style="width:100%; height:100%" @mousemove="handleMousemove($event)"
                @mouseleave="handleMouseLeave"></canvas>
    
            <!-- TOOLTIP -->
            <Tooltip :show="xyConfig.style.chart.tooltip.show && isTooltip"
                :backgroundColor="xyConfig.style.chart.tooltip.backgroundColor" 
                :color="xyConfig.style.chart.tooltip.color"
                :fontSize="xyConfig.style.chart.tooltip.fontSize" 
                :borderRadius="xyConfig.style.chart.tooltip.borderRadius"
                :borderColor="xyConfig.style.chart.tooltip.borderColor"
                :borderWidth="xyConfig.style.chart.tooltip.borderWidth" :parent="canvas" :content="tooltipContent"
                :isCustom="isFunction(xyConfig.style.chart.tooltip.customFormat)">
                <template #tooltip-before>
                    <slot name="tooltip-before" v-bind="{ ...dataTooltipSlot }"></slot>
                </template>
                <template #tooltip-after>
                    <slot name="tooltip-after" v-bind="{ ...dataTooltipSlot }"></slot>
                </template>
            </Tooltip>
        </div>
    
        <div :style="`width:100%;background:${xyConfig.style.chart.backgroundColor}`" data-html2canvas-ignore>    
            <Slicer 
                v-if="xyConfig.style.chart.zoom.show && maxSeries > 1"
                :key="`slicer_${slicerStep}`"
                :background="xyConfig.style.chart.zoom.color"
                :borderColor="xyConfig.style.chart.backgroundColor"
                :fontSize="xyConfig.style.chart.zoom.fontSize"
                :useResetSlot="xyConfig.style.chart.zoom.useResetSlot"
                :labelLeft="xyConfig.style.chart.grid.y.timeLabels.values[slicer.start] ? xyConfig.style.chart.grid.y.timeLabels.values[slicer.start] : ''"
                :labelRight="xyConfig.style.chart.grid.y.timeLabels.values[slicer.end-1] ? xyConfig.style.chart.grid.y.timeLabels.values[slicer.end-1] : ''"
                :textColor="xyConfig.style.chart.color"
                :inputColor="xyConfig.style.chart.zoom.color"
                :selectColor="xyConfig.style.chart.zoom.highlightColor"
                :max="maxSeries"
                :min="0"
                :valueStart="slicer.start"
                :valueEnd="slicer.end"
                v-model:start="slicer.start"
                v-model:end="slicer.end"
                @reset="refreshSlicer"
            >
                <template #reset-action="{ reset }">
                    <slot name="reset-action" v-bind="{ reset }"/>
                </template>
            </Slicer>
        </div>
    
    
        <Legend v-if="xyConfig.style.chart.legend.show" :legendSet="legendSet" :config="legendConfig"
            @clickMarker="({ i }) => segregate(i)">
            <template #item="{ legend, index }">
                <div @click="legend.segregate()" :style="`opacity:${segregated.includes(index) ? 0.5 : 1}`">
                    {{ legend.name }}
                </div>
            </template>
        </Legend>

        <slot name="legend" v-bind:legend="legendSet" />

        <Accordion v-if="slicer.end - slicer.start < 200" hideDetails :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: xyConfig.style.chart.backgroundColor,
                color: xyConfig.style.chart.color
            },
            head: {
                backgroundColor: xyConfig.style.chart.backgroundColor,
                color: xyConfig.style.chart.color
            }
        }">
            <template #content>
                <DataTable 
                    :colNames="dataTable.colNames"
                    :head="dataTable.head"
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${xyConfig.style.chart.title.text}${xyConfig.style.chart.title.subtitle.text ? ` : ${xyConfig.style.chart.title.subtitle.text}` : ''}`"
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