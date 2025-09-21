<script setup>
import { 
    computed, 
    defineAsyncComponent, 
    nextTick, 
    onMounted, 
    ref, 
    toRefs,
    watch, 
} from "vue";
import {
    applyDataLabel,
    calcTrend,
    checkNaN,
    createSmoothPath,
    createUid,
    dataLabel,
    error,
    largestTriangleThreeBucketsArray,
    objectIsEmpty,
    setOpacity,
    treeShake,
    XMLNS,
} from "../lib"
import { throttle } from "../canvas-lib";
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading";
import { useFitSvgText } from "../useFitSvgText";
import { useNestedProp } from "../useNestedProp";
import { useResponsive } from "../useResponsive";
import themes from "../themes.json";
import BaseScanner from "../atoms/BaseScanner.vue";

const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));

const { vue_ui_spark_trend: DEFAULT_CONFIG } = useConfig();

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
    }
});

const sparkTrendChart = ref(null);
const svgRef = ref(null);
const source = ref(null);
const resizeObserver = ref(null);
const observedEl = ref(null);
const isAnimating = ref(false);
const raf = ref(null);

const uid = ref(createUid());

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            style: {
                animation: { show: false },
                backgroundColor: '#99999930',
                line: {
                    stroke: '#6A6A6A',
                    useColorTrend: false
                },
                dataLabel: { show: false, useColorTrend: false, color: '#6A6A6A' },
            }
        }
    })
});

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_spark_trend[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            })
        }
    } else {
        return mergedConfig;
    }
}

const downsampled = computed(() => largestTriangleThreeBucketsArray({
    data: FINAL_DATASET.value,
    threshold: FINAL_CONFIG.value.downsample.threshold
}))

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    WIDTH.value = FINAL_CONFIG.value.style.width;
    HEIGHT.value = FINAL_CONFIG.value.style.height;
    prepareChart();
}, { deep: true });

function sanitize(arr) {
    return arr.map(v => checkNaN(v))
}

const safeDatasetCopy = ref(largestTriangleThreeBucketsArray({
    data: FINAL_DATASET.value,
    threshold: FINAL_CONFIG.value.downsample.threshold
}).map(v => {
    if(FINAL_CONFIG.value.style.animation.show) {
        return null
    } else {
        return ![undefined, Infinity, -Infinity, null, NaN].includes(v) ? v : null
    }
}));

watch(downsampled, (ds) => {
    if (raf.value) {
        cancelAnimationFrame(raf.value);
        raf.value = null;
    }

    if (FINAL_CONFIG.value.style.animation.show) {
        safeDatasetCopy.value = Array(ds.length).fill(null);
    } else {
        safeDatasetCopy.value = ds.map(v =>
        ![undefined, Infinity, -Infinity, null].includes(v) && !Number.isNaN(v) ? v : null
        );
    }

    animateChart();
    nextTick(() => fitText('.vue-ui-sparktrend-progress-label', 6));
}, { deep: true, immediate: true });

watch(
    () => JSON.stringify(props.dataset),
    () => {
        if (raf.value) {
        cancelAnimationFrame(raf.value);
        raf.value = null;
        }
        manualLoading.value = objectIsEmpty(props.dataset);

        const ds = downsampled.value;
        safeDatasetCopy.value = FINAL_CONFIG.value.style.animation.show
        ? Array(ds.length).fill(null)
        : ds.map(v => (Number.isFinite(v) ? v : null));

        animateChart();
        nextTick(() => fitText('.vue-ui-sparktrend-progress-label', 6));
    },
    { deep: false, immediate: true }
);

function animateChart() {
    let fps = FINAL_CONFIG.value.style.animation.animationFrames;
    let interval = 1000 / fps;
    let then = performance.now();

    if (!loading.value && FINAL_CONFIG.value.style.animation.show && FINAL_CONFIG.value.style.animation.animationFrames && FINAL_DATASET.value.length > 1) {
        safeDatasetCopy.value = [];
        let start = 0;

        function animate() {
            isAnimating.value = true;
            let now = performance.now();
            let elapsed = now - then;
            if (elapsed > interval) {
                then = now - (elapsed % interval);
                if (start < downsampled.value.length) {
                    safeDatasetCopy.value.push(downsampled.value[start]);
                    start += 1;
                    raf.value = requestAnimationFrame(animate);
                } else {
                    cancelAnimationFrame(raf.value)
                    safeDatasetCopy.value = sanitize(downsampled.value);
                    isAnimating.value = false;
                    fitText('.vue-ui-sparktrend-progress-label', 6);
                }
            } else {
                raf.value = requestAnimationFrame(animate);
            }
        }
        animate()
    }
}

onMounted(() => {
    prepareChart();
});

const debug = computed(() => FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiSparkTrend',
            type: 'dataset',
            debug: debug.value
        });
        manualLoading.value = true;
    }

    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = false;
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width: W, height: H } = useResponsive({
                chart: sparkTrendChart.value,
                source: source.value
            });

            requestAnimationFrame(() => {
                WIDTH.value = W;
                HEIGHT.value = H;
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = sparkTrendChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }

    animateChart();
    fitText('.vue-ui-sparktrend-progress-label', 6);
}

const WIDTH = ref(FINAL_CONFIG.value.style.width);
const HEIGHT = ref(FINAL_CONFIG.value.style.height)

const svg = computed(() => ({
    height: HEIGHT.value,
    width: WIDTH.value
}))

const drawingArea = computed(() => {
    return {
        top: FINAL_CONFIG.value.style.padding.top,
        left: FINAL_CONFIG.value.style.padding.left,
        right: svg.value.width - FINAL_CONFIG.value.style.padding.right,
        bottom: svg.value.height - FINAL_CONFIG.value.style.padding.bottom,
        height: svg.value.height - (FINAL_CONFIG.value.style.padding.top + FINAL_CONFIG.value.style.padding.bottom) - (FINAL_CONFIG.value.style.dataLabel.show ? FINAL_CONFIG.value.style.dataLabel.fontSize : 0),
        width: svg.value.width - (FINAL_CONFIG.value.style.padding.left + FINAL_CONFIG.value.style.padding.right)
    }
});

const extremes = computed(() => {
    const ds = sanitize(downsampled.value).filter(Number.isFinite);
    if (!ds.length) return { max: 0, min: 0 };
    let max = ds[0], min = ds[0];
    for (let i = 1; i < ds.length; i++) {
        const v = ds[i];
        if (v > max) max = v;
        if (v < min) min = v;
    }
    return { max, min };
});

const datasetKey = computed(() => {
    const ds = downsampled.value;
    const last = ds.length ? ds[ds.length - 1] : 'x';
    return [
        uid.value,
        ds.length,
        Number.isFinite(last) ? last : 'x',
        FINAL_CONFIG.value.downsample.threshold,
        FINAL_CONFIG.value.style.line.smooth ? 's' : 'l'
    ].join('-');
});

const absoluteMin = computed(() => {
    const num = extremes.value.min >= 0 ? 0 : extremes.value.min;
    return Math.abs(num);
});

const absoluteMax = computed(() => {
    return extremes.value.max + absoluteMin.value
})

function ratioToMax(v) {
    return v / absoluteMax.value;
}

const len = computed(() => downsampled.value.length);

const mutableDataset = computed(() => {
    return safeDatasetCopy.value.map((v, i) => {
        const absoluteValue = isNaN(v) || [undefined, null, "NaN", NaN, Infinity, -Infinity].includes(v) ? 0 : v || 0; // Pantalon et bretelles...
        return {
            value: checkNaN(v),
            absoluteValue: checkNaN(absoluteValue),
            plotValue: checkNaN(absoluteValue + absoluteMin.value),
            toMax: ratioToMax(absoluteValue + absoluteMin.value),
            x: drawingArea.value.left + checkNaN(i * ((drawingArea.value.width / (len.value - 1)))) - FINAL_CONFIG.value.style.padding.right,
            y: drawingArea.value.bottom - checkNaN(drawingArea.value.height * ratioToMax(absoluteValue + absoluteMin.value))
        }
    })
});

const trendValue = computed(() => {
    const ds = sanitize(downsampled.value);
    if (FINAL_CONFIG.value.style.trendLabel.trendType === 'global') {
        return calcTrend(ds)
    } 
    
    if (FINAL_CONFIG.value.style.trendLabel.trendType === 'n-1' && ds.length > 1) {
        return (((ds.at(-1) / ds.at(-2)) - 1) * 100);
    }

    if (FINAL_CONFIG.value.style.trendLabel.trendType === 'lastToFirst') {
        return (((ds.at(-1) / ds[0]) - 1) * 100);
    }
    return 0
})

const trend = computed(() => {
    if(isAnimating.value) {
        return "neutral"
    }
    if(trendValue.value === 0) {
        return "neutral";
    }
    if(trendValue.value > 0) {
        return "positive";
    } else {
        return "negative";
    }
});

const trendColor = computed(() => {
    return FINAL_CONFIG.value.style.arrow.colors[trend.value];
})


const area = computed(() => {
    const start = { x: mutableDataset.value[0].x, y: svg.value.height - 6 };
    const end = { x: mutableDataset.value[mutableDataset.value.length -1].x, y: svg.value.height - 6 };
    const path = [];
    mutableDataset.value.forEach(v => {
        path.push(`${v.x},${v.y} `)
    });
    return [ start.x,start.y, ...path, end.x, end.y ].toString();
})

const straightLine = computed(() => {
    let path = [];
    mutableDataset.value.forEach(d => {
        path.push(`${d.x},${d.y} `);
    })
    return `M ${path.toString()}`;
});

const arrowBase = computed(() => {
    return HEIGHT.value / 2 - FINAL_CONFIG.value.style.trendLabel.fontSize;
})

const unitWidth = computed(() => drawingArea.value.left * 0.8);

const { fitText } = useFitSvgText({
    svgRef,
    unitWidth,
    fontSize: FINAL_CONFIG.value.style.trendLabel.fontSize,
});

</script>

<template>
    <div ref="sparkTrendChart" class="vue-ui-spark-trend" :id="uid" :style="`width:100%;font-family:${FINAL_CONFIG.style.fontFamily};background:${FINAL_CONFIG.style.backgroundColor}`">
        <svg :key="datasetKey" ref="svgRef" :xmlns="XMLNS" :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`width:100%;background:transparent;overflow:visible`">
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
                    x1="0%" y1="0%" x2="0%" y2="100%"
                    :id="`pill_gradient_${uid}`"
                >
                    <stop offset="0%" :stop-color="setOpacity(FINAL_CONFIG.style.line.useColorTrend ? trendColor : FINAL_CONFIG.style.line.stroke, FINAL_CONFIG.style.area.opacity)"/>
                    <stop offset="100%" :stop-color="FINAL_CONFIG.style.backgroundColor" />
                </linearGradient>
            </defs>

            <!-- AREA -->
            <g v-if="FINAL_CONFIG.style.area.show && mutableDataset[0]">
                <path
                    v-if="FINAL_CONFIG.style.line.smooth"
                    :d="`M ${mutableDataset[0].x},${drawingArea.bottom} ${createSmoothPath(mutableDataset)} L ${mutableDataset.at(-1).x},${drawingArea.bottom} Z`"
                    :fill="FINAL_CONFIG.style.area.useGradient ? `url(#pill_gradient_${uid})` : setOpacity(FINAL_CONFIG.style.line.useColorTrend ? trendColor : FINAL_CONFIG.style.line.stroke, FINAL_CONFIG.style.area.opacity)"
                    stroke="none"
                />
                <path
                    v-else
                    :d="`M${area}Z`" 
                    :fill="FINAL_CONFIG.style.area.useGradient ? `url(#pill_gradient_${uid})` : setOpacity(FINAL_CONFIG.style.line.useColorTrend ? trendColor : FINAL_CONFIG.style.line.stroke, FINAL_CONFIG.style.area.opacity)"
                    stroke="none"
                />
            </g>

            <!-- LINE -->
            <path data-cy="sparkline-smooth-path" v-if="FINAL_CONFIG.style.line.smooth && mutableDataset.length" :d="`M ${createSmoothPath(mutableDataset)}`" :stroke="FINAL_CONFIG.style.line.useColorTrend ? trendColor : FINAL_CONFIG.style.line.stroke" fill="none" :stroke-width="FINAL_CONFIG.style.line.strokeWidth" :stroke-linecap="FINAL_CONFIG.style.line.strokeLinecap" :stroke-linejoin="FINAL_CONFIG.style.line.strokeLinejoin"/>

            <path data-cy="sparkline-smooth-path" v-if="!FINAL_CONFIG.style.line.smooth && mutableDataset.length" :d="straightLine" :stroke="FINAL_CONFIG.style.line.useColorTrend ? trendColor : FINAL_CONFIG.style.line.stroke" fill="none" :stroke-width="FINAL_CONFIG.style.line.strokeWidth" :stroke-linecap="FINAL_CONFIG.style.line.strokeLinecap" :stroke-linejoin="FINAL_CONFIG.style.line.strokeLinejoin"/>


            <!-- ARROW -->

            <path 
                v-if="loading"
                fill="#6A6A6A"
                :d="`M ${drawingArea.left / 2 + 6}, ${arrowBase + 7} ${drawingArea.left / 2 - 7}, ${arrowBase} ${drawingArea.left / 2 - 7}, ${arrowBase + 14} Z`"
            />
            <path 
                v-else
                :fill="trendColor"
                :d="trend === 'positive' ? `M ${drawingArea.left / 2}, ${arrowBase} ${drawingArea.left / 2 - 7}, ${arrowBase + 12} ${drawingArea.left / 2 + 7}, ${arrowBase + 12} Z` : trend === 'negative' ? `M ${drawingArea.left / 2}, ${arrowBase + 12} ${drawingArea.left / 2 - 7}, ${arrowBase} ${drawingArea.left / 2 + 7}, ${arrowBase} Z` : `M ${drawingArea.left / 2 + 6}, ${arrowBase + 7} ${drawingArea.left / 2 - 7}, ${arrowBase} ${drawingArea.left / 2 - 7}, ${arrowBase + 14} Z`"
            />

            <rect 
                v-if="loading"
                :x="drawingArea.left / 2 - FINAL_CONFIG.style.trendLabel.fontSize - 2"
                :y="HEIGHT / 2 + FINAL_CONFIG.style.trendLabel.fontSize - 2"
                :width="FINAL_CONFIG.style.trendLabel.fontSize * 2"
                :height="FINAL_CONFIG.style.trendLabel.fontSize"
                fill="#6A6A6A80"
                rx="3"
            />

            <text
                class="vue-ui-sparktrend-progress-label"
                v-if="!isAnimating && !loading"
                :x="drawingArea.left / 2"
                :y="HEIGHT / 2 + FINAL_CONFIG.style.trendLabel.fontSize * 2"
                text-anchor="middle"
                :fill="FINAL_CONFIG.style.trendLabel.useColorTrend ? trendColor : FINAL_CONFIG.style.trendLabel.color"
                :font-size="FINAL_CONFIG.style.trendLabel.fontSize"
                :font-weight="FINAL_CONFIG.style.trendLabel.bold ? 'bold' : 'normal'"
            >
                {{ dataLabel({
                    p: trendValue > 0 ? '+' : '',
                    v: trendValue,
                    s: '%',
                    r: FINAL_CONFIG.style.trendLabel.rounding
                }) }}
            </text>

            <circle
                v-if="mutableDataset.length && mutableDataset.at(-1).x !== undefined"
                :stroke="FINAL_CONFIG.style.backgroundColor"
                :stroke-width="2"
                :cx="mutableDataset.at(-1).x"
                :cy="mutableDataset.at(-1).y"
                :r="4"
                :fill="loading ? '#6A6A6A' : trendColor"
            />
            <text
                v-if="mutableDataset.length && mutableDataset.at(-1).x !== undefined && FINAL_CONFIG.style.dataLabel.show"
                text-anchor="middle"
                :x="mutableDataset.at(-1).x"
                :y="mutableDataset.at(-1).y - (FINAL_CONFIG.style.dataLabel.fontSize / 1.5)"
                :font-size="FINAL_CONFIG.style.dataLabel.fontSize"
                :fill="FINAL_CONFIG.style.dataLabel.useColorTrend ? trendColor : FINAL_CONFIG.style.dataLabel.color"
                :font-weight="FINAL_CONFIG.style.dataLabel.bold ? 'bold': 'normal'"
            >
                {{ applyDataLabel(
                    FINAL_CONFIG.style.dataLabel.formatter,
                    mutableDataset.at(-1).value,
                    dataLabel({
                        p: FINAL_CONFIG.style.dataLabel.prefix,
                        v: mutableDataset.at(-1).value,
                        s: FINAL_CONFIG.style.dataLabel.suffix,
                        r: FINAL_CONFIG.style.dataLabel.rounding
                    }),
                    { datapoint: mutableDataset.at(-1)}
                    ) 
                }}
            </text>
        </svg>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading" />
    </div>
</template>

<style scoped>
.vue-ui-spark-trend {
    position: relative;
}

.vue-ui-spark-trend * {
    transition: unset;
}
</style>