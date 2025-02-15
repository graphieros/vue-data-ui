<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { 
    applyDataLabel,
    createUid,
    dataLabel,
    error,
    getMissingDatasetAttributes,
    objectIsEmpty,
    setOpacity,
    shiftHue,
    XMLNS 
} from "../lib";
import themes from "../themes.json";
import { useNestedProp } from "../useNestedProp";
import Shape from "../atoms/Shape.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import { useConfig } from "../useConfig";
import PackageVersion from "../atoms/PackageVersion.vue";

const { vue_ui_sparkhistogram: DEFAULT_CONFIG } = useConfig()

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
            return [];
        }
    }
});

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

onMounted(() => {
    prepareChart();
});

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiSparkHistogram',
            type: 'dataset'
        })
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['value']
            }).forEach(attr => {
                error({
                    componentName: 'VueUiSparkHistogram',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i
                });
            });
        });
    }
}

const uid = ref(createUid());

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
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_sparkhistogram[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
        }
    } else {
        return mergedConfig;
    }
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    prepareChart();
}, { deep: true });

const drawingArea = computed(() => {
    const height = FINAL_CONFIG.value.style.layout.height;
    const width = FINAL_CONFIG.value.style.layout.width;
    const top = FINAL_CONFIG.value.style.layout.padding.top;
    const bottom = height - FINAL_CONFIG.value.style.layout.padding.bottom;
    const left = FINAL_CONFIG.value.style.layout.padding.left;
    const right = width - FINAL_CONFIG.value.style.layout.padding.right;
    const centerY = top + ((height - top - FINAL_CONFIG.value.style.layout.padding.bottom) / 2);
    const drawingHeight = height - FINAL_CONFIG.value.style.layout.padding.top - FINAL_CONFIG.value.style.layout.padding.bottom;
    const drawingWidth = width - FINAL_CONFIG.value.style.layout.padding.left - FINAL_CONFIG.value.style.layout.padding.right;
    return {
        bottom,
        centerY,
        drawingHeight,
        drawingWidth,
        height,
        left,
        right,
        top,
        width,
    }
});

const maxVal = computed(() => {
    return Math.max(...props.dataset.map(ds => Math.abs(ds.value || 0)))
});

function toMax(val) {
    return Math.abs(val) / maxVal.value;
}

const computedDataset = computed(() => {
    return props.dataset.map((dp,i) => {
        const proportion = toMax(dp.value || 0);
        const height = drawingArea.value.drawingHeight * proportion;
        const unitWidth = drawingArea.value.drawingWidth / props.dataset.length;
        const gap = unitWidth * (FINAL_CONFIG.value.style.bars.gap / 100)
        const width = unitWidth - gap;
        const y = drawingArea.value.centerY - height / 2;
        const x = drawingArea.value.left + (gap / 2  + (i * unitWidth));
        const trapX = drawingArea.value.left + (i * unitWidth);
        const intensity = typeof dp.intensity === 'undefined' ? 100 : Math.round(dp.intensity * 100);
        const color = dp.color ? dp.color : dp.value >= 0 ? setOpacity(FINAL_CONFIG.value.style.bars.colors.positive, intensity) : setOpacity(FINAL_CONFIG.value.style.bars.colors.negative, intensity);
        const stroke = dp.color ? dp.color : dp.value >= 0 ? FINAL_CONFIG.value.style.bars.colors.positive : FINAL_CONFIG.value.style.bars.colors.negative;
        const gradient = dp.color ? `url(#gradient_datapoint_${i}_${uid.value})` :  dp.value >=  0 ? `url(#gradient_positive_${i}_${uid.value})` : `url(#gradient_negative_${i}_${uid.value})`;
        const textAnchor = x + width / 2;
        return {
            ...dp,
            color,
            gradient,
            height,
            intensity,
            proportion,
            stroke,
            textAnchor,
            trapX,
            unitWidth,
            width,
            x,
            y
        }
    });
});

const selectedIndex = ref(null);

const emits = defineEmits(['selectDatapoint'])

function selectDatapoint(datapoint, index) {
    emits('selectDatapoint', { datapoint, index })
}

const animation = computed(() => {
    return `${FINAL_CONFIG.value.style.animation.speedMs}ms`
})

</script>

<template>
    <div class="vue-ui-spark-histogram" :style="`width:100%;background:${FINAL_CONFIG.style.backgroundColor};font-family:${FINAL_CONFIG.style.fontFamily}`" @mouseleave="selectedIndex = null">
        <!-- TITLE -->
        <div v-if="FINAL_CONFIG.style.title.text" :style="`width:calc(100% - 12px);background:transparent;margin:0 auto;margin:${FINAL_CONFIG.style.title.margin};padding: 0 6px;text-align:${FINAL_CONFIG.style.title.textAlign}`">
            <div :style="`font-size:${FINAL_CONFIG.style.title.fontSize}px;color:${FINAL_CONFIG.style.title.color};font-weight:${FINAL_CONFIG.style.title.bold ? 'bold' : 'normal'}`">
                {{ FINAL_CONFIG.style.title.text }} 
                <span v-if="selectedIndex !== null">- 
                    {{ computedDataset[selectedIndex].timeLabel || '' }} 
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.labels.value.formatter,
                        computedDataset[selectedIndex].value,
                        dataLabel({
                            p: FINAL_CONFIG.style.labels.value.prefix,
                            v: computedDataset[selectedIndex].value,
                            s: FINAL_CONFIG.style.labels.value.suffix,
                            r: FINAL_CONFIG.style.labels.value.rounding
                        }),
                        { datapoint: computedDataset[selectedIndex], seriesIndex: selectedIndex }
                        ) 
                    }}
                </span>
                <span v-if="![undefined, null].includes(selectedIndex) && ![null, undefined].includes(computedDataset[selectedIndex].valueLabel)">({{ computedDataset[selectedIndex].valueLabel || 0 }})</span>
            </div>
            <div v-if="FINAL_CONFIG.style.title.subtitle.text" :style="`font-size:${FINAL_CONFIG.style.title.subtitle.fontSize}px;color:${FINAL_CONFIG.style.title.subtitle.color};font-weight:${FINAL_CONFIG.style.title.subtitle.bold ? 'bold' : 'normal'}`">
                {{ FINAL_CONFIG.style.title.subtitle.text }}
            </div>    
        </div>

        <svg :xmlns="XMLNS" v-if="isDataset" data-cy="sparkhistogram-svg" :viewBox="`0 0 ${drawingArea.width} ${drawingArea.height}`" style="overflow: visible">
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="0"
                :y="0"
                :width="drawingArea.width"
                :height="drawingArea.height"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>
            
            <defs>
                <radialGradient v-for="(posGrad, i) in computedDataset" :id="`gradient_positive_${i}_${uid}`"  cy="50%" cx="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" :stop-color="setOpacity(shiftHue(FINAL_CONFIG.style.bars.colors.positive, 0.05), posGrad.intensity)"/>
                    <stop offset="100%" :stop-color="setOpacity(FINAL_CONFIG.style.bars.colors.positive, posGrad.intensity)"/>
                </radialGradient>

                <radialGradient v-for="(negGrad, i) in computedDataset" :id="`gradient_negative_${i}_${uid}`"  cy="50%" cx="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" :stop-color="setOpacity(shiftHue(FINAL_CONFIG.style.bars.colors.negative, 0.05), negGrad.intensity)"/>
                    <stop offset="100%" :stop-color="setOpacity(FINAL_CONFIG.style.bars.colors.negative, negGrad.intensity)"/>
                </radialGradient>

                <radialGradient v-for="(dp, i) in computedDataset" :id="`gradient_datapoint_${i}_${uid}`"  cy="50%" cx="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" :stop-color="setOpacity(shiftHue(dp.color, 0.05), dp.intensity)"/>
                    <stop offset="100%" :stop-color="setOpacity(dp.color, dp.intensity)"/>
                </radialGradient>
            </defs>
            
            <g v-if="!FINAL_CONFIG.style.bars.shape || FINAL_CONFIG.style.bars.shape === 'square'">
                <rect v-for="(rect, i) in computedDataset"
                    :data-cy="`sparkhistogram-rect-${i}`"
                    :x="rect.x"
                    :y="rect.y"
                    :height="rect.height"
                    :width="rect.width"
                    :fill="FINAL_CONFIG.style.bars.colors.gradient.show ? rect.gradient : rect.color"
                    :stroke="rect.stroke"
                    :stroke-width="FINAL_CONFIG.style.bars.strokeWidth"
                    :rx="`${FINAL_CONFIG.style.bars.borderRadius * rect.proportion / 12}%`"
                    :class="{'vue-ui-sparkhistogram-shape' : FINAL_CONFIG.style.animation.show }"
                />
            </g>
            <g v-else>                
                <Shape 
                    v-for="(rect, i) in computedDataset"
                    :plot="{ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }"
                    :color="FINAL_CONFIG.style.bars.colors.gradient.show ? rect.gradient : rect.color"
                    :shape="FINAL_CONFIG.style.bars.shape"
                    :radius="rect.height * 0.4"
                    :class="{'vue-ui-sparkhistogram-shape' : FINAL_CONFIG.style.animation.show }"
                />
            </g>

            <text v-for="(val, i) in computedDataset"
                :data-cy="`sparkhistogram-value-label-${i}`"
                text-anchor="middle"
                :x="val.textAnchor"
                :y="val.y - (FINAL_CONFIG.style.labels.value.fontSize / 3) + FINAL_CONFIG.style.labels.value.offsetY"
                :font-size="FINAL_CONFIG.style.labels.value.fontSize"
                :font-weight="FINAL_CONFIG.style.labels.value.bold ? 'bold' : 'normal'"
                :fill="FINAL_CONFIG.style.labels.value.color"
            >
                {{ 
                    applyDataLabel(
                        FINAL_CONFIG.style.labels.value.formatter,
                        val.value,
                        dataLabel({
                            p: FINAL_CONFIG.style.labels.value.prefix,
                            v: val.value,
                            s: FINAL_CONFIG.style.labels.value.suffix,
                            r: FINAL_CONFIG.style.labels.value.rounding
                        }),
                        { datapoint: computedDataset[selectedIndex], seriesIndex: selectedIndex }
                        ) 
                }}
            </text>

            <g v-for="(label, i) in computedDataset">
                <text 
                    :data-cy="`sparkhistogram-label-${i}`"
                    v-if="label.valueLabel"
                    :x="label.textAnchor"
                    :y="label.y + label.height + FINAL_CONFIG.style.labels.valueLabel.fontSize"
                    :font-size="FINAL_CONFIG.style.labels.valueLabel.fontSize"
                    text-anchor="middle"
                    :fill="FINAL_CONFIG.style.labels.valueLabel.color"
                >
                    {{ label.valueLabel }}
                </text>
            </g>

            <g v-for="(time, i) in computedDataset">
                <text
                    :data-cy="`sparkhistogram-time-label-${i}`"
                    v-if="time.timeLabel"
                    :x="time.textAnchor"
                    :y="drawingArea.height - FINAL_CONFIG.style.labels.timeLabel.fontSize / 2"
                    :font-size="FINAL_CONFIG.style.labels.timeLabel.fontSize"
                    :fill="FINAL_CONFIG.style.labels.timeLabel.color"
                    text-anchor="middle"
                >
                    {{ time.timeLabel }}
                </text>
            </g>

            <!-- TOOLTIP TRAPS -->
            <g v-for="(rect, i) in computedDataset">
                <rect 
                    :height="drawingArea.height" 
                    :width="rect.unitWidth" 
                    fill="transparent" 
                    :x="rect.trapX" 
                    :y="0" @mouseover="selectedIndex = i" 
                    @mouseleave="selectedIndex = null" 
                    :stroke="selectedIndex !== null && selectedIndex === i ? FINAL_CONFIG.style.selector.stroke : ''"
                    :stroke-width="selectedIndex !== null && selectedIndex === i ? FINAL_CONFIG.style.selector.strokeWidth : 0"
                    :rx="FINAL_CONFIG.style.selector.borderRadius"
                    :stroke-dasharray="FINAL_CONFIG.style.selector.strokeDasharray"
                    @click="() => selectDatapoint(rect, i)"
                />
            </g>
        </svg>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'sparkHistogram',
                style: {
                    backgroundColor: FINAL_CONFIG.style.backgroundColor,
                    sparkHistogram: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />
    </div>
</template>

<style scoped>
.vue-ui-sparkhistogram-shape {
    animation: expand v-bind(animation) ease-in forwards;
    transform-origin: center;
    transform: scale(1, 0);
}

@keyframes expand {
    80% {
        transform: scale(1, 1.1);
    }
    90% {
        transform: scale(1, 0.95);
    }
    95% {
        transform: scale(1, 1.03);
    }
    100% {
        transform: scale(1, 1);
    }
}
</style>