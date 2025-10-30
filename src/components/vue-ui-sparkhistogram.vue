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
    createUid,
    dataLabel,
    error,
    getMissingDatasetAttributes,
    objectIsEmpty,
    setOpacity,
    shiftHue,
    treeShake,
    XMLNS 
} from "../lib";
import { throttle } from "../canvas-lib";
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading";
import { useFitSvgText } from "../useFitSvgText";
import { useNestedProp } from "../useNestedProp";
import { useResponsive } from "../useResponsive";
import { useChartAccessibility } from "../useChartAccessibility";
import Shape from "../atoms/Shape.vue";
import themes from "../themes.json";
import BaseScanner from "../atoms/BaseScanner.vue";

const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));

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

const uid = ref(createUid());
const source = ref(null);
const chartTitle = ref(null);
const histogramChart = ref(null);
const resizeObserver = ref(null);
const observedEl = ref(null);

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: [
        { value: 1, intensity: 0.2, color: '#CACACA' },
        { value: 2, intensity: 0.3, color: '#CACACA' },
        { value: 3, intensity: 0.5, color: '#CACACA' },
        { value: 5, intensity: 0.7, color: '#CACACA' },
        { value: 8, intensity: 0.9, color: '#CACACA' },
        { value: 13, intensity: 0.95, color: '#CACACA' },
        { value: 21, intensity: 1, color: '#CACACA' },
        { value: 13, intensity: 0.95, color: '#CACACA' },
        { value: 8, intensity: 0.9, color: '#CACACA' },
        { value: 5, intensity: 0.7, color: '#CACACA' },
        { value: 3, intensity: 0.5, color: '#CACACA' },
        { value: 2, intensity: 0.3, color: '#CACACA' },
        { value: 1, intensity: 0.2, color: '#CACACA' },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            style: {
                animation: { show: false },
                backgroundColor: '#99999930',
            }
        }
    })
})

const WIDTH = ref(FINAL_CONFIG.value.style.layout.width);
const HEIGHT = ref(FINAL_CONFIG.value.style.layout.height);

const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.title });

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

onMounted(() => {
    prepareChart();
});

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiSparkHistogram',
            type: 'dataset',
            debug: debug.value
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
                    index: i,
                    debug: debug.value
                });
            });
        });
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: histogramChart.value,
                title: FINAL_CONFIG.value.style.title.text ? chartTitle.value : null,
                source: source.value
            });

            const _timeLabelHeight = FINAL_CONFIG.value.style.labels.timeLabel.show ? FINAL_CONFIG.value.style.labels.timeLabel.fontSize * 2 : 0;
            const _valueLabelHeight = FINAL_CONFIG.value.style.labels.valueLabel.show ? FINAL_CONFIG.value.style.labels.valueLabel.fontSize * 2 : 0;

            requestAnimationFrame(() => {
                WIDTH.value = Math.max(10, width);
                HEIGHT.value = Math.max(10, height - 12 - _timeLabelHeight - _valueLabelHeight);
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }
        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = histogramChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    prepareChart();
}, { deep: true });

const drawingArea = computed(() => {
    const _timeLabelHeight = FINAL_CONFIG.value.style.labels.timeLabel.show ? FINAL_CONFIG.value.style.labels.timeLabel.fontSize * 2 : 0;
    const _valueLabelHeight = FINAL_CONFIG.value.style.labels.valueLabel.show ? FINAL_CONFIG.value.style.labels.valueLabel.fontSize * 2 : 0;

    const height = HEIGHT.value + _timeLabelHeight + _valueLabelHeight;
    const width = WIDTH.value;
    const top = FINAL_CONFIG.value.style.layout.padding.top;
    const bottom = height - FINAL_CONFIG.value.style.layout.padding.bottom;
    const left = FINAL_CONFIG.value.style.layout.padding.left;
    const right = width - FINAL_CONFIG.value.style.layout.padding.right;
    const centerY = top + ((height - top - FINAL_CONFIG.value.style.layout.padding.bottom) / 2);
    const drawingHeight = height - FINAL_CONFIG.value.style.layout.padding.top - FINAL_CONFIG.value.style.layout.padding.bottom - _timeLabelHeight - _valueLabelHeight;
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
    return Math.max(...FINAL_DATASET.value.map(ds => Math.abs(ds.value || 0)))
});

function toMax(val) {
    return Math.abs(val) / maxVal.value;
}

const computedDataset = computed(() => {
    return FINAL_DATASET.value.map((dp,i) => {
        const proportion = toMax(dp.value || 0);
        const height = drawingArea.value.drawingHeight * proportion;
        const unitWidth = drawingArea.value.drawingWidth / FINAL_DATASET.value.length;
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

function getTopLabel(datapoint, index) {
    return applyDataLabel(
        FINAL_CONFIG.value.style.labels.value.formatter,
        datapoint.value,
        dataLabel({
            p: FINAL_CONFIG.value.style.labels.value.prefix,
            v: datapoint.value,
            s: FINAL_CONFIG.value.style.labels.value.suffix,
            r: FINAL_CONFIG.value.style.labels.value.rounding
        }),
        { datapoint, seriesIndex: index }
    )
}

const selectedIndex = ref(null);

const emits = defineEmits(['selectDatapoint'])

function selectDatapoint(datapoint, index) {
    emits('selectDatapoint', { datapoint, index });
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex: index })
    }
}

function onTrapEnter(datapoint, index) {
    selectedIndex.value = index;
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex: index });
    }
}

function onTrapLeave(datapoint, index) {
    selectedIndex.value = null;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex: index });
    }
}

const animation = computed(() => {
    return `${FINAL_CONFIG.value.style.animation.speedMs}ms`
})

const unitWidth = computed(() => (drawingArea.value.drawingWidth / FINAL_DATASET.value.length) * 0.9);

const { fitText } = useFitSvgText({
    svgRef,
    unitWidth,
});

onMounted(async () => {
    await nextTick();
    fitText('.vue-ui-sparkhistogram-top-label', FINAL_CONFIG.value.style.labels.value.minFontSize);
    fitText('.vue-ui-sparkhistogram-bottom-label', FINAL_CONFIG.value.style.labels.valueLabel.minFontSize);
    fitText('.vue-ui-sparkhistogram-time-label', FINAL_CONFIG.value.style.labels.timeLabel.minFontSize);
});

watch([WIDTH, HEIGHT, () => FINAL_DATASET.value], async() => {
    await nextTick();
    fitText('.vue-ui-sparkhistogram-top-label', FINAL_CONFIG.value.style.labels.value.minFontSize);
    fitText('.vue-ui-sparkhistogram-bottom-label', FINAL_CONFIG.value.style.labels.valueLabel.minFontSize);
    fitText('.vue-ui-sparkhistogram-time-label', FINAL_CONFIG.value.style.labels.timeLabel.minFontSize);
})

</script>

<template>
    <div 
        class="vue-data-ui-component vue-ui-spark-histogram"
        ref="histogramChart"
        :style="`width:100%;background:${FINAL_CONFIG.style.backgroundColor};font-family:${FINAL_CONFIG.style.fontFamily}`" @mouseleave="selectedIndex = null"
    >
        <!-- TITLE -->
        <div ref="chartTitle" v-if="FINAL_CONFIG.style.title.text" :style="`width:calc(100% - 12px);background:transparent;margin:0 auto;margin:${FINAL_CONFIG.style.title.margin};padding: 0 6px;text-align:${FINAL_CONFIG.style.title.textAlign}`">
            <div data-cy="title" :style="`font-size:${FINAL_CONFIG.style.title.fontSize}px;color:${FINAL_CONFIG.style.title.color};font-weight:${FINAL_CONFIG.style.title.bold ? 'bold' : 'normal'}`">
                {{ FINAL_CONFIG.style.title.text }} 
                <span data-cy="title-selection" v-if="selectedIndex !== null">- 
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
                <span data-cy="title-selection-value-label" v-if="![undefined, null].includes(selectedIndex) && ![null, undefined].includes(computedDataset[selectedIndex].valueLabel)">{{ ` (${computedDataset[selectedIndex].valueLabel || 0})`}}</span>
            </div>
            <div data-cy="subtitle" v-if="FINAL_CONFIG.style.title.subtitle.text" :style="`font-size:${FINAL_CONFIG.style.title.subtitle.fontSize}px;color:${FINAL_CONFIG.style.title.subtitle.color};font-weight:${FINAL_CONFIG.style.title.subtitle.bold ? 'bold' : 'normal'}`">
                {{ FINAL_CONFIG.style.title.subtitle.text }}
            </div>    
        </div>

        <svg
            ref="svgRef"
            :xmlns="XMLNS" 
            data-cy="sparkhistogram-svg" 
            :viewBox="`0 0 ${drawingArea.width} ${drawingArea.height}`" 
            style="overflow: visible"
        >
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

            <g v-for="(rect, i) in computedDataset">
                <rect
                    v-if="selectedIndex !== null && selectedIndex === i"
                    data-cy="tooltip-trap"
                    :height="drawingArea.height" 
                    :width="rect.unitWidth" 
                    :fill="FINAL_CONFIG.style.selector.fill" 
                    :x="rect.trapX" 
                    :y="0" 
                    :stroke="FINAL_CONFIG.style.selector.stroke"
                    :stroke-width="FINAL_CONFIG.style.selector.strokeWidth"
                    :rx="FINAL_CONFIG.style.selector.borderRadius"
                    :stroke-dasharray="FINAL_CONFIG.style.selector.strokeDasharray"
                />
            </g>
            
            <g v-if="!FINAL_CONFIG.style.bars.shape || FINAL_CONFIG.style.bars.shape === 'square'">
                <rect v-for="(rect, i) in computedDataset"
                    data-cy="datapoint-rect"
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
                    v-for="(rect, _i) in computedDataset"
                    :plot="{ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }"
                    :color="FINAL_CONFIG.style.bars.colors.gradient.show ? rect.gradient : rect.color"
                    :shape="FINAL_CONFIG.style.bars.shape"
                    :radius="Math.min(rect.height * 0.4, rect.width * 0.4)"
                    :class="{'vue-ui-sparkhistogram-shape' : FINAL_CONFIG.style.animation.show }"
                />
            </g>

            <template v-if="!loading">
                <g v-for="(val, i) in computedDataset">
                    <text
                        v-if="FINAL_CONFIG.style.labels.value.show"
                        class="vue-ui-sparkhistogram-top-label"
                        data-cy="datapoint-label-value"
                        text-anchor="middle"
                        :x="val.textAnchor"
                        :y="val.y - (FINAL_CONFIG.style.labels.value.fontSize / 3) + FINAL_CONFIG.style.labels.value.offsetY"
                        :font-size="FINAL_CONFIG.style.labels.value.fontSize"
                        :font-weight="FINAL_CONFIG.style.labels.value.bold ? 'bold' : 'normal'"
                        :fill="FINAL_CONFIG.style.labels.value.color"
                    >
                        {{ getTopLabel(val, i) }}
                    </text>
                </g>
    
                <g v-for="(label, _i) in computedDataset">
                    <text 
                        class="vue-ui-sparkhistogram-bottom-label"
                        data-cy="datapoint-label-valueLabel"
                        v-if="label.valueLabel && FINAL_CONFIG.style.labels.valueLabel.show"
                        :x="label.textAnchor"
                        :y="label.y + label.height + FINAL_CONFIG.style.labels.valueLabel.fontSize"
                        :font-size="FINAL_CONFIG.style.labels.valueLabel.fontSize"
                        text-anchor="middle"
                        :fill="FINAL_CONFIG.style.labels.valueLabel.color"
                    >
                        {{ label.valueLabel }}
                    </text>
                </g>
    
                <g v-for="(time, _i) in computedDataset">
                    <text
                        class="vue-ui-sparkhistogram-time-label"
                        data-cy="datapoint-label-time"
                        v-if="time.timeLabel && FINAL_CONFIG.style.labels.timeLabel.show"
                        :x="time.textAnchor"
                        :y="drawingArea.height"
                        :font-size="FINAL_CONFIG.style.labels.timeLabel.fontSize"
                        :fill="FINAL_CONFIG.style.labels.timeLabel.color"
                        text-anchor="middle"
                    >
                        {{ time.timeLabel }}
                    </text>
                </g>
            </template>

            <!-- TOOLTIP TRAPS -->
            <g v-for="(rect, i) in computedDataset">
                <rect
                    data-cy="tooltip-trap"
                    :height="drawingArea.height" 
                    :width="rect.unitWidth" 
                    fill="transparent" 
                    :x="rect.trapX" 
                    :y="0" 
                    @mouseover="onTrapEnter(rect, i)" 
                    @mouseleave="onTrapLeave(rect, i)" 
                    @click="() => selectDatapoint(rect, i)"
                />
            </g>
        </svg>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading" />
    </div>
</template>

<style scoped>
.vue-ui-spark-histogram {
    position: relative;
}

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