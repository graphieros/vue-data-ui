<script setup>
import { ref, computed, onMounted, watch, defineAsyncComponent, shallowRef, onBeforeUnmount, toRefs, nextTick } from "vue";
import {
    applyDataLabel,
    calcLinearProgression,
    calcMedian,
    createSmoothPath,
    createStraightPath,
    createUid,
    dataLabel as dl,
    error,
    fib,
    forceValidValue,
    getMissingDatasetAttributes,
    hasDeepProperty,
    largestTriangleThreeBucketsArrayObjects,
    objectIsEmpty,
    setOpacity,
    shiftHue,
    treeShake,
    XMLNS
} from "../lib";
import { throttle } from "../canvas-lib";
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading";
import { useNestedProp } from "../useNestedProp";
import { useResponsive } from "../useResponsive";
import { useThemeCheck } from "../useThemeCheck";
import { useTimeLabels } from "../useTimeLabels";
import { useChartAccessibility } from "../useChartAccessibility";
import themes from "../themes/vue_ui_sparkline.json";
import BaseScanner from "../atoms/BaseScanner.vue";

const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const SparkTooltip = defineAsyncComponent(() => import('../atoms/SparkTooltip.vue'));

const { vue_ui_sparkline: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

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
    return Array.isArray(props.dataset) && props.dataset.length > 0;
});

const uid = ref(createUid());
const sparklineChart = ref(null);
const chartTitle = ref(null);
const source = ref(null);

const FINAL_CONFIG = ref(prepareConfig());

function makeSkeletonDs(n) {
    return fib(n).map(value => ({ period: '-', value }));
}

// v3 - Skeleton loader management
const { loading, FINAL_DATASET, manualLoading } = useLoading(({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    callback: () => {
        Promise.resolve().then(async() => {
            await nextTick();
            animateSL();
        })
    },
    skeletonDataset: makeSkeletonDs(12),
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            style: {
                backgroundColor: '#99999930',
                scaleMin: 0,
                scaleMax: null,
                animation: { show: false },
                line: { color: '#AAAAAA' },
                bar: { color: '#AAAAAA' },
                area: { color: '#CACACA' },
                zeroLine: { color: '#6A6A6A' },
                dataLabel: { show: false },
                tooltip: { show: false },
            }
        }
    })
}))

const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.title });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
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
            }
        }
    } else {
        finalConfig = mergedConfig;
    }

    return finalConfig;
}

const downsampled = computed(() => {
    return largestTriangleThreeBucketsArrayObjects({
        data: FINAL_DATASET.value,
        threshold: FINAL_CONFIG.value.downsample.threshold
    })
})

watch(() => props.config, (_newCfg) => {
    if (!loading.value) {
        FINAL_CONFIG.value = prepareConfig();
    }
    prepareChart();
    svg.value.chartWidth = FINAL_CONFIG.value.style.chartWidth;
}, { deep: true });

watch(() => props.dataset, (_) => {
    if (Array.isArray(_) && _.length > 0) {
        manualLoading.value = false;
    }
    safeDatasetCopy.value = largestTriangleThreeBucketsArrayObjects({
        data: FINAL_DATASET.value.map(d => {
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
        data: FINAL_DATASET.value.map(d => {
            if (FINAL_CONFIG.value.style.animation.show && FINAL_DATASET.value.length > 1) {
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

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

const isAnimating = ref(false);
const rafId = ref(0);
const timeoutIds = ref([]);
const lastAnimationKey = ref('');

const animationKey = computed(() => {
    const ds = downsampled.value || [];
    const sig = ds.map(d => `${d.period}::${Number.isFinite(d.value) ? d.value : 0}`).join("|");
    const cfg = FINAL_CONFIG.value?.style?.animation || {};
    return `${sig}#${!!cfg.show}#${cfg.animationFrames || 0}`;
});

function stopAnimation() {
    if (rafId.value) {
        cancelAnimationFrame(rafId.value);
        rafId.value = 0;
    }
    timeoutIds.value.forEach(id => clearTimeout(id));
    timeoutIds.value = [];
    isAnimating.value = false;
}

function animateSL() {
    const cfg = FINAL_CONFIG.value?.style?.animation || {};
    const ds = downsampled.value || [];
    const key = animationKey.value;

    if (key && key === lastAnimationKey.value && (isAnimating.value || safeDatasetCopy.value.length === ds.length)) {
        return;
    }

    stopAnimation();

    if (!cfg.show || loading.value || ds.length <= 1) {
        safeDatasetCopy.value = ds;
        lastAnimationKey.value = key;
        return;
    }

    isAnimating.value = true;
    lastAnimationKey.value = key;
    safeDatasetCopy.value = [];

    const frames = Math.max(1, Number(cfg.animationFrames) || 1);
    const delay = Math.max(1, Math.floor(frames / ds.length));
    let i = 0;

    const tick = () => {
        if (key !== animationKey.value) {

        stopAnimation();
        return;
        }
        if (i < ds.length) {
        safeDatasetCopy.value.push(ds[i]);
        const t = setTimeout(() => {
            rafId.value = requestAnimationFrame(tick);
        }, delay);
        timeoutIds.value.push(t);
        i += 1;
        } else {
        safeDatasetCopy.value = ds;
        stopAnimation();
        }
    };

    rafId.value = requestAnimationFrame(tick);
}

watch(animationKey, () => {
    animateSL();
});

onMounted(() => {
    prepareChart();
    animateSL();
});

onBeforeUnmount(() => {
    stopAnimation();
});

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiSparkline',
            type: 'dataset',
            debug: debug.value,
        });
        manualLoading.value = true; // v3
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
                    index: i,
                    debug: debug.value
                });
            });
        });
    }

    // v3
    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
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

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = sparklineChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    };
}

onBeforeUnmount(() => {
    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }
});

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
    return isNaN(v / absoluteMax.value) ? 0 : v / absoluteMax.value;
}

const len = computed(() => (downsampled.value.length - 1) || 1);

const timeLabels = computed(() => {
    return useTimeLabels({
        values: downsampled.value.map(d => d.period),
        maxDatapoints: downsampled.value.length,
        formatter: FINAL_CONFIG.value.style.dataLabel.datetimeFormatter,
        start: 0,
        end: downsampled.value.length
    })
});

const mutableDataset = computed(() => {
    return safeDatasetCopy.value.map((s, i) => {
        const absoluteValue = isNaN(s.value) || [undefined, null, 'NaN', NaN, Infinity, -Infinity].includes(s.value) ? 0 : (s.value || 0);
        const width = drawingArea.value.width / len.value
        return {
            absoluteValue,
            period: timeLabels.value && timeLabels.value[i] && timeLabels.value[i].text ? timeLabels.value[i].text : s.period,
            plotValue: absoluteValue + absoluteMin.value,
            toMax: ratioToMax(absoluteValue + absoluteMin.value),
            x: drawingArea.value.start + (i * width),
            y: drawingArea.value.bottom - (drawingArea.value.height * ratioToMax(absoluteValue + absoluteMin.value)),
            id: `plot_${uid.value}_${i}`,
            color: isBar.value ? FINAL_CONFIG.value.style.bar.color : FINAL_CONFIG.value.style.area.useGradient ? shiftHue(FINAL_CONFIG.value.style.line.color, 0.05 * ( 1 - (i / len.value))) : FINAL_CONFIG.value.style.line.color,
            width
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
const previousSelectedPlot = ref(undefined);

function selectPlot(plot, index) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint: plot, seriesIndex: index });
    }

    selectedPlot.value = plot;
    if (!previousSelectedPlot.value) {
        previousSelectedPlot.value = plot;
    }
    emits('hoverIndex', {index})
}

function unselectPlot(plot, index) {
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint: plot, seriesIndex: index });
    }

    previousSelectedPlot.value = selectedPlot.value;
    selectedPlot.value = undefined;
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
            latest: mutableDataset.value[mutableDataset.value.length -1] ? mutableDataset.value[mutableDataset.value.length -1].absoluteValue : 0,
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
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex: index })
    }
    emits('selectDatapoint', { datapoint, index })
}
</script>

<template>
    <div ref="sparklineChart"  class="vue-data-ui-component vue-ui-sparkline" :id="uid" :style="`width:100%;font-family:${FINAL_CONFIG.style.fontFamily};`">
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
        <svg
            ref="svgRef"
            :xmlns="XMLNS"
            data-cy="sparkline-svg"
            :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`background:${FINAL_CONFIG.style.backgroundColor};overflow:visible`"
            @mouseleave="previousSelectedPlot = undefined"
        >
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
            <g v-if="FINAL_CONFIG.style.area.show && !isBar && mutableDataset[0] && mutableDataset.length > 1">
                <path
                    data-cy="sparkline-smooth-area"
                    v-if="FINAL_CONFIG.style.line.smooth"
                    :d="`M ${mutableDataset[0].x},${drawingArea.bottom} ${createSmoothPath(mutableDataset)} L ${mutableDataset.at(-1).x},${drawingArea.bottom} Z`"
                    :fill="FINAL_CONFIG.style.area.useGradient ? `url(#sparkline_gradient_${uid})` : setOpacity(FINAL_CONFIG.style.area.color, FINAL_CONFIG.style.area.opacity)"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    data-cy="sparkline-angle-area"
                    v-else
                    :d="`M${area}Z`" 
                    :fill="FINAL_CONFIG.style.area.useGradient ? `url(#sparkline_gradient_${uid})` : setOpacity(FINAL_CONFIG.style.area.color, FINAL_CONFIG.style.area.opacity)"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </g>

            <path data-cy="sparkline-smooth-path" v-if="FINAL_CONFIG.style.line.smooth && !isBar" :d="`M ${createSmoothPath(mutableDataset) || '0,0'}`" :stroke="FINAL_CONFIG.style.line.color" fill="none" :stroke-width="FINAL_CONFIG.style.line.strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>

            <path data-cy="sparkline-straight-line" v-if="!FINAL_CONFIG.style.line.smooth && !isBar" :d="`M ${createStraightPath(mutableDataset) || '0,0'}`" :stroke="FINAL_CONFIG.style.line.color" fill="none" :stroke-width="FINAL_CONFIG.style.line.strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>
            
            <g v-for="(plot, i) in mutableDataset">
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
                :x2="drawingArea.start + drawingArea.width"
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
                    v-if="(selectedPlot && plot.id === selectedPlot.id) || selectedIndex === i || FINAL_DATASET.length === 1" 
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
                @mouseenter="() => selectPlot(plot, i)"
                @mouseleave="() => unselectPlot(plot, i)"
                @click="() => selectDatapoint(plot, i)"
            />
            <slot name="svg" :svg="svg"/>
        </svg>

        <SparkTooltip
            v-if="selectedPlot && FINAL_CONFIG.style.tooltip.show"
            :x="selectedPlot.x"
            :y="selectedPlot.y"
            :prevX="previousSelectedPlot.x"
            :prevY="previousSelectedPlot.y"
            :offsetY="FINAL_CONFIG.style.plot.radius * 3 + FINAL_CONFIG.style.tooltip.offsetY"
            :svgRef="svgRef"
            :background="FINAL_CONFIG.style.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.tooltip.color"
            :fontSize="FINAL_CONFIG.style.tooltip.fontSize"
            :borderWidth="FINAL_CONFIG.style.tooltip.borderWidth"
            :borderColor="FINAL_CONFIG.style.tooltip.borderColor"
            :borderRadius="FINAL_CONFIG.style.tooltip.borderRadius"
            :backgroundOpacity="FINAL_CONFIG.style.tooltip.backgroundOpacity"
        >
            <slot name="tooltip" v-bind="{ ...selectedPlot }">
                {{ selectedPlot.period }}: {{ 
                    applyDataLabel(
                        FINAL_CONFIG.style.dataLabel.formatter,
                        selectedPlot.absoluteValue,
                        dl({
                            p: FINAL_CONFIG.style.dataLabel.prefix, 
                            v: selectedPlot.absoluteValue, 
                            s: FINAL_CONFIG.style.dataLabel.suffix, 
                            r: FINAL_CONFIG.style.dataLabel.roundingValue 
                        }), 
                        { datapoint: selectedPlot }
                ) 
            }}
            </slot>
        </SparkTooltip>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>
        
        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading"/>
    </div>
</template>

<style scoped>
.vue-ui-sparkline {
    position: relative;
}
.vue-ui-sparkline * {
    transition: unset;
}
</style>