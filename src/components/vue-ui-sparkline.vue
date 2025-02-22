<script setup>
import { ref, computed, onMounted, watch } from "vue";
import {
    applyDataLabel,
    calcLinearProgression,
    calcMedian,
    createSmoothPath,
    createUid,
    dataLabel as dl,
    error,
    forceValidValue,
    getMissingDatasetAttributes,
    hasDeepProperty,
    largestTriangleThreeBucketsArrayObjects,
    objectIsEmpty,
    setOpacity,
    shiftHue,
    XMLNS
} from "../lib";
import themes from "../themes.json";
import { useNestedProp } from "../useNestedProp";
import Skeleton from "./vue-ui-skeleton.vue";
import { useConfig } from "../useConfig";
import { useResponsive } from "../useResponsive";
import { throttle } from "../canvas-lib";
import PackageVersion from "../atoms/PackageVersion.vue";

const { vue_ui_sparkline: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: Array,
        default() {
            return []
        }
    },
    showInfo : {
        type: Boolean,
        default: true,
    },
    selectedIndex: {
        type: Number,
        default: undefined
    },
    heightRatio: {
        type: Number,
        default: 1
    },
    forcedPadding: {
        type: Number,
        default: 30
    }
});

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

const uid = ref(createUid());
const sparklineChart = ref(null);
const chartTitle = ref(null);
const source = ref(null);

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    let finalConfig = {};

    if (mergedConfig.theme) {
        finalConfig = {
            ...useNestedProp({
                userConfig: themes.vue_ui_sparkline[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
        }
    } else {
        finalConfig = mergedConfig;
    }

    // ------------------------------ OVERRIDES -----------------------------------

    if (props.config && hasDeepProperty(props.config, 'style.scaleMin')) {
        finalConfig.style.scaleMin = props.config.style.scaleMin;
    } else {
        finalConfig.style.scaleMin = null;
    }

    if (props.config && hasDeepProperty(props.config, 'style.scaleMax')) {
        finalConfig.style.scaleMax = props.config.style.scaleMax;
    } else {
        finalConfig.style.scaleMax = null;
    }

    // ----------------------------------------------------------------------------

    return finalConfig;
}

const downsampled = computed(() => {
    return largestTriangleThreeBucketsArrayObjects({
        data: props.dataset,
        threshold: FINAL_CONFIG.value.downsample.threshold
    })
})

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    prepareChart();
    svg.value.chartWidth = FINAL_CONFIG.value.style.chartWidth;
}, { deep: true });

watch(() => props.dataset, (_) => {
    safeDatasetCopy.value = largestTriangleThreeBucketsArrayObjects({
        data: props.dataset.map(d => {
        return {
            ...d,
            value: ![undefined].includes(d.value) ? d.value : null
        }
    }),
        threshold: FINAL_CONFIG.value.downsample.threshold
    })
}, { deep: true })

const safeDatasetCopy = ref(prepareDsCopy());

function prepareDsCopy() {
    return largestTriangleThreeBucketsArrayObjects({
        data: props.dataset.map(d => {
            if (FINAL_CONFIG.value.style.animation.show) {
                return {
                    ...d,
                    value: null
                }
            } else {
                return {
                    ...d,
                    value: ![undefined].includes(d.value) ? d.value : null
                }
            }
        }),
        threshold: FINAL_CONFIG.value.downsample.threshold
    })
}

const resizeObserver = ref(null);

onMounted(() => {
    prepareChart();
    if (FINAL_CONFIG.value.style.animation.show && props.dataset.length > 1) {
        safeDatasetCopy.value = [];
        const chunks = FINAL_CONFIG.value.style.animation.animationFrames / props.dataset.length;
        let start = 0;

        function animate() {
            if (start < downsampled.value.length) {
                safeDatasetCopy.value.push(downsampled.value[start])
                setTimeout(() => {
                    requestAnimationFrame(animate)
                }, chunks)
            } else {
                safeDatasetCopy.value = downsampled.value
            }
            start += 1;
        }
        animate();
    }
})

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiSparkline',
            type: 'dataset'
        })
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['period', 'value']
            }).forEach(attr => {
                error({
                    componentName: 'VueUiSparkline',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i
                });
            });
        });
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: sparklineChart.value,
                title: FINAL_CONFIG.value.style.title.show && props.showInfo ? chartTitle.value : null,
                source: source.value
            });

            requestAnimationFrame(() => {
                svg.value.width = width;
                svg.value.height = height;
                svg.value.chartWidth = FINAL_CONFIG.value.style.chartWidth / 500 * width;
                svg.value.padding = props.forcedPadding / 500 * width;
            });
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(sparklineChart.value.parentNode);
    };
}

const svg = ref({
    height: 80 * props.heightRatio,
    width: 500,
    chartWidth: FINAL_CONFIG.value.style.chartWidth,
    padding: props.forcedPadding
});

const emits = defineEmits(['hoverIndex', 'selectDatapoint'])

const drawingArea = computed(() => {
    const { top: p_top, right: p_right, bottom: p_bottom, left: p_left } = FINAL_CONFIG.value.style.padding;
    return {
        top: p_top,
        left: p_left,
        right: svg.value.width - p_right,
        bottom: svg.value.height - p_bottom,
        start: props.showInfo && FINAL_CONFIG.value.style.dataLabel.show && FINAL_CONFIG.value.style.dataLabel.position === 'left' ? svg.value.width - svg.value.chartWidth + p_left : svg.value.padding + p_left,
        width: props.showInfo && FINAL_CONFIG.value.style.dataLabel.show ? svg.value.chartWidth - p_left - p_right : svg.value.width - svg.value.padding - p_left - p_right,
        height: svg.value.height - p_top - p_bottom
    }
});

const min = computed(() => {
    if (![null, undefined].includes(FINAL_CONFIG.value.style.scaleMin)) {
        return FINAL_CONFIG.value.style.scaleMin;
    } else {
        return Math.min(...safeDatasetCopy.value.map(s => isNaN(s.value) || [undefined, null, 'NaN', NaN, Infinity, -Infinity].includes(s.value) ? 0 : s.value || 0))
    }
});

const max = computed(() => {
    if (![null, undefined].includes(FINAL_CONFIG.value.style.scaleMax)) {
        return FINAL_CONFIG.value.style.scaleMax;
    } else {
        return Math.max(...safeDatasetCopy.value.map(s => isNaN(s.value) || [undefined, null, 'NaN', NaN, Infinity, -Infinity].includes(s.value) ? 0 : s.value || 0))
    }
});

const absoluteMin = computed(() => {
    const num = min.value >= 0 ? 0 : min.value
    return Math.abs(num);
});

const absoluteMax = computed(() => {
    return max.value + absoluteMin.value;
});

const absoluteZero = computed(() => {
    return drawingArea.value.bottom - (drawingArea.value.height * ratioToMax(absoluteMin.value))
})

function ratioToMax(v) {
    return v / absoluteMax.value;
}

const len = computed(() => downsampled.value.length - 1);

const mutableDataset = computed(() => {
    return safeDatasetCopy.value.map((s, i) => {
        const absoluteValue = isNaN(s.value) || [undefined, null, 'NaN', NaN, Infinity, -Infinity].includes(s.value) ? 0 : (s.value || 0);
        return {
            absoluteValue,
            period: s.period,
            plotValue: absoluteValue + absoluteMin.value,
            toMax: ratioToMax(absoluteValue + absoluteMin.value),
            x: drawingArea.value.start + (i * ((drawingArea.value.width / (len.value + 1)) > svg.padding ? svg.padding : (drawingArea.value.width / (len.value + 1)))),
            y: drawingArea.value.bottom - (drawingArea.value.height * ratioToMax(absoluteValue + absoluteMin.value)),
            id: `plot_${uid.value}_${i}`,
            color: isBar.value ? FINAL_CONFIG.value.style.bar.color : FINAL_CONFIG.value.style.area.useGradient ? shiftHue(FINAL_CONFIG.value.style.line.color, 0.05 * ( 1 - (i / len.value))) : FINAL_CONFIG.value.style.line.color,
            width: (drawingArea.value.width / (len.value + 1)) > svg.padding ? svg.padding : (drawingArea.value.width / (len.value + 1))
        }
    })
});

const area = computed(() => {
    const start = { x: mutableDataset.value[0].x || 0, y: (svg.value.height || 0) - 6 };
    const end = { x: mutableDataset.value[mutableDataset.value.length -1].x || 0, y: (svg.value.height || 0) - 6 };
    const path = [];
    mutableDataset.value.forEach(v => {
        path.push(`${v.x || 0},${v.y || 0} `)
    });
    return [ start.x,start.y, ...path, end.x, end.y ].toString();
});


const selectedPlot = ref(undefined);

function selectPlot(plot, index) {
    selectedPlot.value = plot;
    emits('hoverIndex', {index})
}

function unselectPlot() {
    selectedPlot.value = undefined
    emits('hoverIndex', {index:undefined})
}

const dataLabelValues = computed(() => {
    if (!isDataset.value) {
        return {
            latest: null,
            sum: null,
            average: null,
            median: null,
            trend: null
        }
    } else {
        const ds = mutableDataset.value.map(m => m.absoluteValue);
        const sum = ds.reduce((a, b) => a + b, 0)
        return {
            latest: mutableDataset.value[mutableDataset.value.length -1].absoluteValue,
            sum,
            average: sum / mutableDataset.value.length,
            median: calcMedian(ds),
            trend: calcLinearProgression(mutableDataset.value.map(({x, y, absoluteValue}) => {
                return {
                    x,
                    y,
                    value: absoluteValue
                }
            })).trend
        }
    }
});

const dataLabel = computed(() => {
    if(!isDataset.value) {
        return 0
    }
    if (FINAL_CONFIG.value.style.dataLabel.valueType === 'latest') {
        return dataLabelValues.value.latest
    } else if(FINAL_CONFIG.value.style.dataLabel.valueType === 'sum') {
        return dataLabelValues.value.sum;
    } else if(FINAL_CONFIG.value.style.dataLabel.valueType === "average") {
        return dataLabelValues.value.average;
    } else {
        return 0;
    }
});

const isBar = computed(() => {
    return FINAL_CONFIG.value.type && FINAL_CONFIG.value.type === 'bar';
});

function selectDatapoint(datapoint, index) {
    emits('selectDatapoint', { datapoint, index })
}
</script>

<template>
    <div ref="sparklineChart"  class="vue-ui-sparkline" :id="uid" :style="`width:100%;font-family:${FINAL_CONFIG.style.fontFamily};`">
        <!-- SLOT BEFORE -->
        <slot 
            name="before" 
            v-bind="{ 
                selected: selectedPlot, 
                latest: dataLabelValues.latest,
                sum: dataLabelValues.sum,
                average: dataLabelValues.average,
                median: dataLabelValues.median,
                trend: dataLabelValues.trend
            }"
        />

        <!-- TITLE -->
        <div data-cy="title" ref="chartTitle" v-if="FINAL_CONFIG.style.title.show && showInfo" class="vue-ui-sparkline-title" :style="`display:flex;align-items:center;width:100%;color:${FINAL_CONFIG.style.title.color};background:${FINAL_CONFIG.style.backgroundColor};justify-content:${FINAL_CONFIG.style.title.textAlign === 'left' ? 'flex-start' : FINAL_CONFIG.style.title.textAlign === 'right' ? 'flex-end' : 'center'};height:${FINAL_CONFIG.style.title.fontSize * 2}px;font-size:${FINAL_CONFIG.style.title.fontSize}px;font-weight:${FINAL_CONFIG.style.title.bold ? 'bold' : 'normal'};`">
            <span data-cy="sparkline-period-label" :style="`padding:${FINAL_CONFIG.style.title.textAlign === 'left' ? '0 0 0 12px' : FINAL_CONFIG.style.title.textAlign === 'right' ? '0 12px 0 0' : '0'}`">
                {{ selectedPlot ? selectedPlot.period : FINAL_CONFIG.style.title.text }}
            </span>
        </div>

        <!-- CHART -->
        <svg :xmlns="XMLNS" v-if="isDataset" data-cy="sparkline-svg" :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`background:${FINAL_CONFIG.style.backgroundColor};overflow:visible`">
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="0"
                :y="0"
                :width="svg.width <= 0 ? 10 : svg.width"
                :height="svg.height <= 0 ? 10 : svg.height"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>
            
            <!-- DEFS -->
            <defs>
                <linearGradient
                    x1="0%" y1="0%" x2="100%" y2="0%"
                    :id="`sparkline_gradient_${uid}`"
                >
                    <stop offset="0%" :stop-color="setOpacity(shiftHue(FINAL_CONFIG.style.area.color, 0.05), FINAL_CONFIG.style.area.opacity)"/>
                    <stop offset="100%" :stop-color="setOpacity(FINAL_CONFIG.style.area.color, FINAL_CONFIG.style.area.opacity)" />
                </linearGradient>
                <linearGradient x2="0%" y2="100%" :id="`sparkline_bar_gradient_pos_${uid}`">
                    <stop offset="0%" :stop-color="FINAL_CONFIG.style.bar.color"/>
                    <stop offset="100%" :stop-color="shiftHue(FINAL_CONFIG.style.bar.color, 0.05)"/>
                </linearGradient>
                <linearGradient x2="0%" y2="100%" :id="`sparkline_bar_gradient_neg_${uid}`">
                    <stop offset="0%" :stop-color="shiftHue(FINAL_CONFIG.style.bar.color, 0.05)"/>
                    <stop offset="100%" :stop-color="FINAL_CONFIG.style.bar.color"/>
                </linearGradient>
            </defs>

            <!-- AREA -->
            <g v-if="FINAL_CONFIG.style.area.show && !isBar && mutableDataset[0]">
                <path
                    data-cy="sparkline-smooth-area"
                    v-if="FINAL_CONFIG.style.line.smooth"
                    :d="`M ${mutableDataset[0].x},${drawingArea.bottom} ${createSmoothPath(mutableDataset)} L ${mutableDataset.at(-1).x},${drawingArea.bottom} Z`"
                    :fill="FINAL_CONFIG.style.area.useGradient ? `url(#sparkline_gradient_${uid})` : setOpacity(FINAL_CONFIG.style.area.color, FINAL_CONFIG.style.area.opacity)"
                />
                <path
                    data-cy="sparkline-angle-area"
                    v-else
                    :d="`M${area}Z`" 
                    :fill="FINAL_CONFIG.style.area.useGradient ? `url(#sparkline_gradient_${uid})` : setOpacity(FINAL_CONFIG.style.area.color, FINAL_CONFIG.style.area.opacity)"
                />
            </g>

            <path data-cy="sparkline-smooth-path" v-if="FINAL_CONFIG.style.line.smooth && !isBar" :d="`M ${createSmoothPath(mutableDataset)}`" :stroke="FINAL_CONFIG.style.line.color" fill="none" :stroke-width="FINAL_CONFIG.style.line.strokeWidth" stroke-linecap="round"/>
            
            <g v-for="(plot, i) in mutableDataset">
                <line 
                    v-if="i < mutableDataset.length - 1 && !FINAL_CONFIG.style.line.smooth && !isBar"
                    data-cy="segment-line"
                    :x1="plot.x"
                    :x2="mutableDataset[i + 1].x"
                    :y1="plot.y || 0"
                    :y2="mutableDataset[i + 1].y || 0"
                    :stroke="plot.color"
                    :stroke-width="FINAL_CONFIG.style.line.strokeWidth"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    shape-rendering="geometricPrecision"
                />
                <rect
                    data-cy="datapoint-bar"
                    v-if="isBar"
                    :x="plot.x - plot.width / 2"
                    :y="isNaN(plot.absoluteValue > 0 ? plot.y : absoluteZero) ? 0 : plot.absoluteValue > 0 ? plot.y : absoluteZero"
                    :width="plot.width"
                    :height="isNaN(Math.abs(plot.y - absoluteZero)) ? 0 : Math.abs(plot.y - absoluteZero)"
                    :fill="plot.absoluteValue > 0 ? `url(#sparkline_bar_gradient_pos_${uid})` : `url(#sparkline_bar_gradient_neg_${uid})`"
                    :rx="FINAL_CONFIG.style.bar.borderRadius"
                />
                <!-- VERTICAL INDICATORS -->
                <line
                    data-cy="selection-indicator"
                    v-if="FINAL_CONFIG.style.verticalIndicator.show && ((selectedPlot && plot.id === selectedPlot.id) || selectedIndex === i)"
                    :x1="plot.x"
                    :x2="plot.x"
                    :y1="drawingArea.top - 6"
                    :y2="drawingArea.bottom"
                    :stroke="FINAL_CONFIG.style.verticalIndicator.color || plot.color"
                    :stroke-width="FINAL_CONFIG.style.verticalIndicator.strokeWidth"
                    stroke-linecap="round"
                    :stroke-dasharray="FINAL_CONFIG.style.verticalIndicator.strokeDasharray || 0"
                />
            </g>

            <!-- ZERO BASE -->
            <line
                data-cy="sparkline-zero-axis"
                v-if="min < 0"
                :x1="drawingArea.start"
                :x2="drawingArea.start + drawingArea.width - 16"
                :y1="forceValidValue(absoluteZero, drawingArea.bottom)"
                :y2="forceValidValue(absoluteZero, drawingArea.bottom)"
                :stroke="FINAL_CONFIG.style.zeroLine.color"
                :stroke-dasharray="FINAL_CONFIG.style.zeroLine.strokeWidth * 2"
                :stroke-width="FINAL_CONFIG.style.zeroLine.strokeWidth"
                stroke-linecap="round"
            />
            
            <!-- PLOTS -->
            <g v-if="FINAL_CONFIG.style.plot.show" v-for="(plot, i) in mutableDataset">
                <circle
                    data-cy="selection-plot"
                    v-if="(selectedPlot && plot.id === selectedPlot.id) || selectedIndex === i" 
                    :cx="plot.x" 
                    :cy="plot.y" 
                    :r="FINAL_CONFIG.style.plot.radius"
                    :fill="plot.color"
                    :stroke="FINAL_CONFIG.style.plot.stroke"
                    :stroke-width="FINAL_CONFIG.style.plot.strokeWidth"
                />
            </g>

            <!-- DATALABEL -->
            <text
                v-if="showInfo && FINAL_CONFIG.style.dataLabel.show"
                data-cy="sparkline-datalabel"
                :x="FINAL_CONFIG.style.dataLabel.position === 'left' ? 12 + FINAL_CONFIG.style.dataLabel.offsetX : drawingArea.width + 12 + FINAL_CONFIG.style.dataLabel.offsetX"
                :y="svg.height / 2 + FINAL_CONFIG.style.dataLabel.fontSize / 2.5 + FINAL_CONFIG.style.dataLabel.offsetY"
                :font-size="FINAL_CONFIG.style.dataLabel.fontSize"
                :font-weight="FINAL_CONFIG.style.dataLabel.bold ? 'bold' : 'normal'"
                :fill="FINAL_CONFIG.style.dataLabel.color"
            >
            {{ selectedPlot ? applyDataLabel(
                    FINAL_CONFIG.style.dataLabel.formatter,
                    selectedPlot.absoluteValue,
                    dl({p: FINAL_CONFIG.style.dataLabel.prefix, v: selectedPlot.absoluteValue, s: FINAL_CONFIG.style.dataLabel.suffix, r: FINAL_CONFIG.style.dataLabel.roundingValue }), { datapoint: selectedPlot }
                ) : applyDataLabel(
                    FINAL_CONFIG.style.dataLabel.formatter,
                    dataLabel,
                    dl({p: FINAL_CONFIG.style.dataLabel.prefix, v: dataLabel, s: FINAL_CONFIG.style.dataLabel.suffix, r: FINAL_CONFIG.style.dataLabel.roundingValue }),
                ) 
            }}
            </text>

            <!-- MOUSE TRAP -->
            <rect
                v-for="(plot, i) in mutableDataset"
                data-cy="tooltip-trap"
                :x="plot.x - ((drawingArea.width / (len + 1) > svg.padding ? svg.padding : drawingArea.width / (len + 1)) / 2)"
                :y="drawingArea.top - 6"
                :height="drawingArea.height + 6"
                :width="(drawingArea.width / (len + 1) > svg.padding ? svg.padding: drawingArea.width / (len + 1))"
                fill="transparent"
                @mouseenter="selectPlot(plot, i)"
                @mouseleave="unselectPlot"
                @click="() => selectDatapoint(plot, i)"
            />
            <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>
        
        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'sparkline',
                style: {
                    backgroundColor: FINAL_CONFIG.style.backgroundColor,
                    sparkline: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />
    </div>
</template>

<style scoped>
.vue-ui-sparkline * {
    transition: unset;
}
</style>