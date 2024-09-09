<script setup>
import { ref, computed, onMounted } from "vue";
import {
    createSmoothPath,
    createUid,
    opacity,
    dataLabel,
    error,
    calcTrend,
    objectIsEmpty,
    XMLNS
} from "../lib"
import themes from "../themes.json";
import { useNestedProp } from "../useNestedProp";
import BaseIcon from "../atoms/BaseIcon.vue";
import Skeleton from './vue-ui-skeleton.vue';
import { useConfig } from "../useConfig";

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

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

const uid = ref(createUid());

const FINAL_CONFIG = computed(() => {
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
});

function sanitize(arr) {
    return arr.map(v => {
        return [undefined].includes(v) ? null : v
    })
}

const safeDatasetCopy = ref(props.dataset.map(v => {
    if(FINAL_CONFIG.value.style.animation.show) {
        return null
    } else {
        return ![undefined].includes(v) ? v : null
    }
}))

const isAnimating = ref(false);

const raf = ref(null)
onMounted(() => {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiTrendPill',
            type: 'dataset'
        })
    }

    let fps = FINAL_CONFIG.value.style.animation.animationFrames;
    let interval = 1000 / fps;
    let then = performance.now();

    if (FINAL_CONFIG.value.style.animation.show && FINAL_CONFIG.value.style.animation.animationFrames && props.dataset.length > 1) {
        safeDatasetCopy.value = [];
        let start = 0;

        function animate() {
            isAnimating.value = true;
            let now = performance.now();
            let elapsed = now - then;
            if (elapsed > interval) {
                then = now - (elapsed % interval);
                if (start < props.dataset.length) {
                    safeDatasetCopy.value.push(props.dataset[start]);
                    start += 1;
                    raf.value = requestAnimationFrame(animate);
                } else {
                    cancelAnimationFrame(raf.value)
                    safeDatasetCopy.value = sanitize(props.dataset);
                    isAnimating.value = false;
                }
            } else {
                raf.value = requestAnimationFrame(animate);
            }
        }
        animate()
    }
});

const svg = ref({
    height: 80,
    width: 300
})

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
    const ds = sanitize(props.dataset);
    return {
        max: Math.max(...ds),
        min: Math.min(...ds)
    }
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

const len = computed(() => props.dataset.length);

const mutableDataset = computed(() => {
    return safeDatasetCopy.value.map((v, i) => {
        const absoluteValue = isNaN(v) || [undefined, null, "NaN", NaN, Infinity, -Infinity].includes(v) ? 0 : v || 0; // Pantalon et bretelles...
        return {
            value: v,
            absoluteValue,
            plotValue: absoluteValue + absoluteMin.value,
            toMax: ratioToMax(absoluteValue + absoluteMin.value),
            x: drawingArea.value.left + (i * ((drawingArea.value.width / (len.value - 1)))) - FINAL_CONFIG.value.style.padding.right,
            y: drawingArea.value.bottom - (drawingArea.value.height * ratioToMax(absoluteValue + absoluteMin.value))
        }
    })
});

const trendValue = computed(() => {
    const ds = sanitize(props.dataset);
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
})

</script>

<template>
    <div class="vue-ui-spark-trend" :id="uid" :style="`width:100%;font-family:${FINAL_CONFIG.style.fontFamily};backgroundColor:${FINAL_CONFIG.style.backgroundColor}`">
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
        <svg v-else :xmlns="XMLNS" :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`width:100%;background:${FINAL_CONFIG.style.backgroundColor};overflow:visible`">

            <!-- DEFS -->
            <defs>
                <linearGradient
                    x1="0%" y1="0%" x2="0%" y2="100%"
                    :id="`pill_gradient_${uid}`"
                >
                    <stop offset="0%" :stop-color="(FINAL_CONFIG.style.line.useColorTrend ? trendColor : FINAL_CONFIG.style.line.stroke) + opacity[FINAL_CONFIG.style.area.opacity]"/>
                    <stop offset="100%" :stop-color="FINAL_CONFIG.style.backgroundColor" />
                </linearGradient>
            </defs>

            <!-- AREA -->
            <g v-if="FINAL_CONFIG.style.area.show && mutableDataset[0]">
                <path
                    v-if="FINAL_CONFIG.style.line.smooth"
                    :d="`M ${mutableDataset[0].x},${drawingArea.bottom} ${createSmoothPath(mutableDataset)} L ${mutableDataset.at(-1).x},${drawingArea.bottom} Z`"
                    :fill="FINAL_CONFIG.style.area.useGradient ? `url(#pill_gradient_${uid})` : `${FINAL_CONFIG.style.line.useColorTrend ? trendColor : FINAL_CONFIG.style.line.stroke}${opacity[FINAL_CONFIG.style.area.opacity]}`"
                    stroke="none"
                />
                <path
                    v-else
                    :d="`M${area}Z`" 
                    :fill="FINAL_CONFIG.style.area.useGradient ? `url(#pill_gradient_${uid})` : `${FINAL_CONFIG.style.line.useColorTrend ? trendColor : FINAL_CONFIG.style.line.stroke}${opacity[FINAL_CONFIG.style.area.opacity]}`"
                    stroke="none"
                />
            </g>

            <!-- LINE -->
            <path data-cy="sparkline-smooth-path" v-if="FINAL_CONFIG.style.line.smooth && mutableDataset.length" :d="`M ${createSmoothPath(mutableDataset)}`" :stroke="FINAL_CONFIG.style.line.useColorTrend ? trendColor : FINAL_CONFIG.style.line.stroke" fill="none" :stroke-width="FINAL_CONFIG.style.line.strokeWidth" :stroke-linecap="FINAL_CONFIG.style.line.strokeLinecap" :stroke-linejoin="FINAL_CONFIG.style.line.strokeLinejoin"/>

            <path data-cy="sparkline-smooth-path" v-if="!FINAL_CONFIG.style.line.smooth && mutableDataset.length" :d="straightLine" :stroke="FINAL_CONFIG.style.line.useColorTrend ? trendColor : FINAL_CONFIG.style.line.stroke" fill="none" :stroke-width="FINAL_CONFIG.style.line.strokeWidth" :stroke-linecap="FINAL_CONFIG.style.line.strokeLinecap" :stroke-linejoin="FINAL_CONFIG.style.line.strokeLinejoin"/>


            <!-- ARROW -->
            <foreignObject 
                v-if="!isAnimating"
                :height="svg.height / 2"
                :width="svg.height / 2"
                :x="svg.height / 5"
                :y="8"
            >
                <div style="width:100%">
                    <BaseIcon v-if="trend === 'positive'" :stroke="trendColor" name="arrowTop" :size="svg.height / 2"/>
                    <BaseIcon v-if="trend === 'negative'" :stroke="trendColor" name="arrowBottom" :size="svg.height / 2"/>
                    <BaseIcon v-if="trend === 'neutral'" :stroke="trendColor" name="arrowRight" :size="svg.height / 2"/>
                </div>
            </foreignObject>

            <text 
                v-if="!isAnimating"
                :x="(svg.height / 2) - (svg.height / 20)"
                :y="drawingArea.bottom"
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
                :fill="trendColor"
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
                {{ dataLabel({
                    p: FINAL_CONFIG.style.dataLabel.prefix,
                    v: mutableDataset.at(-1).value,
                    s: FINAL_CONFIG.style.dataLabel.suffix,
                    r: FINAL_CONFIG.style.dataLabel.rounding
                }) }}
            </text>
        </svg>
    
    </div>
</template>

<style scoped>
.vue-ui-spark-trend * {
    transition: unset;
}
</style>