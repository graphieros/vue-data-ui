<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useConfig } from "../useConfig";
import { 
    adaptColorToBackground,
    applyDataLabel,
    convertColorToHex,
    createUid, 
    dataLabel,
    error, 
    getMissingDatasetAttributes, 
    lightenHexColor, 
    objectIsEmpty, 
    palette,
    XMLNS,
} from "../lib";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import Title from "../atoms/Title.vue";

const { vue_ui_funnel: DEFAULT_CONFIG } = useConfig();

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

onMounted(prepareChart)

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiFunnel',
            type: 'dataset'
        })
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['name', 'value']
            }).forEach(attr => {
                isDataset.value = false;
                error({
                    componentName: 'VueUiFunnel',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i
                });
            });
        });
    }

    // TODO: responsive
}

const funnelChart = ref(null);
const uid = ref(createUid());
const step = ref(0);

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        // TODO: theme
    } else {
        return mergedConfig;
    }
}

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    prepareChart();
    // TODO:
    // titleStep.value += 1;
    // tableStep.value += 1;
    // legendStep.value += 1;
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `funnel_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-funnel'
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
});

const svg = ref({
    height: FINAL_CONFIG.value.style.chart.height,
    width: FINAL_CONFIG.value.style.chart.width
})

const formattedDataset = computed(() => {
    if(!isDataset.value) return []
    return props.dataset.map((ds, i) => {
        return {
            ...ds,
            color: ds.color ? convertColorToHex(ds.color) : lightenHexColor(FINAL_CONFIG.value.style.chart.bars.defaultColor, (i / props.dataset.length)),
        }
    })
})

const drawingArea = computed(() => {
    const left = FINAL_CONFIG.value.style.chart.padding.left;
    const top = FINAL_CONFIG.value.style.chart.padding.top;
    return {
        left,
        top,
        right: svg.value.width - FINAL_CONFIG.value.style.chart.padding.right,
        bottom: svg.value.height - FINAL_CONFIG.value.style.chart.padding.bottom,
        width: svg.value.width - left - FINAL_CONFIG.value.style.chart.padding.right,
        height: svg.value.height - top - FINAL_CONFIG.value.style.chart.padding.bottom
    }
});


const barHeight = computed(() => {
    return (drawingArea.value.height / (props.dataset.length))
})

const gap = computed(() => {
    return barHeight.value * FINAL_CONFIG.value.style.chart.bars.gapRatio
})

const spacingRatio = computed(() => {
    return drawingArea.value.width * FINAL_CONFIG.value.style.chart.barCircleSpacingRatio;
})

const datapoints = computed(() => {
    return formattedDataset.value.map((ds, i) => {
        const size = barHeight.value - (gap.value);
        const y = (drawingArea.value.top + (gap.value / 2 * i) + ((barHeight.value - (gap.value / 2)) * i)) + gap.value / 2;
        const proportion = ds.value / formattedDataset.value[0].value
        const width = (drawingArea.value.width - size - spacingRatio.value) * (ds.value / formattedDataset.value[0].value);
        return {
            ...ds,
            datapointIndex: i,
            x: drawingArea.value.left + size + spacingRatio.value, // TODO: right align option
            y,
            height: size,
            width,
            fill: ds.color,
            r: size / 2,
            cx: drawingArea.value.left + size / 2,
            cy: y + size / 2,
            proportion
        }
    })
})

const funnelArea = computed(() => {
    const points = datapoints.value.map(dp => {
        return `${dp.x + dp.width},${dp.y + ((barHeight.value - (gap.value)) / 2)}`
    })
    return `${datapoints.value[0].x},${datapoints.value[0].y + ((barHeight.value - gap.value) / 2)} ${points.toString()} ${datapoints.value.at(-1).x},${datapoints.value.at(-1).y + ((barHeight.value - gap.value) / 2)}`;
})

const circlesLink = computed(() => {
    return {
        x1: datapoints.value[0].cx,
        y1: datapoints.value[0].cy,
        x2: datapoints.value.at(-1).cx,
        y2: datapoints.value.at(-1).cy
    }
})

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const dashLen = computed(() => `${formattedDataset.value.length * 150}ms`)

</script>

<template>
    <div ref="funnelChart" :class="`vue-ui-funnel ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; ${FINAL_CONFIG.responsive ? 'height:100%;' : ''} text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`" :id="`funnel_${uid}`">

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;padding-bottom:24px`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'funnel-div-title',
                        ...FINAL_CONFIG.style.chart.title,
                    },
                    subtitle: {
                        cy: 'funnel-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" data-cy="funnel-svg" :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`" :style="`max-width:100%; overflow: visible; background:transparent;color:${FINAL_CONFIG.style.chart.color}`">

            <defs>
                <linearGradient :id="`funnel_area_${uid}`" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" :stop-color="FINAL_CONFIG.style.chart.backgroundColor" :stop-opacity="0" />
                    <stop offset="20%" :stop-color="FINAL_CONFIG.style.chart.area.color" />
                    <stop offset="100%" :stop-color="FINAL_CONFIG.style.chart.area.color" />
                </linearGradient>
            </defs>

            <line
                v-if="FINAL_CONFIG.style.chart.circleLinks.show"
                v-bind="circlesLink"
                :stroke="FINAL_CONFIG.style.chart.circleLinks.color"
                :stroke-width="12 * FINAL_CONFIG.style.chart.circleLinks.widthRatio"
                stroke-linecap="round"
                :class="{
                    'animated': FINAL_CONFIG.useCssAnimation
                }"
                :style="{
                    strokeDasharray: FINAL_CONFIG.useCssAnimation ? drawingArea.height : 0,
                    strokeDashoffset: FINAL_CONFIG.useCssAnimation ? drawingArea.height : 0
                }"
            />

            <circle
                v-for="({cx, cy, r, fill}, i) in datapoints"
                v-bind="{ cx, cy, r, fill }"
                :stroke="FINAL_CONFIG.style.chart.circles.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.circles.strokeWidth"
                :class="{
                    'animated': FINAL_CONFIG.useCssAnimation
                }"
                :style="{
                    animationDelay: `${150 * i}ms`
                }"
            />

            <text
                v-for="(datapoint, i) in datapoints"
                :x="datapoint.cx"
                :y="datapoint.cy + FINAL_CONFIG.style.chart.circles.dataLabels.fontSize / 3"
                text-anchor="middle"
                :font-size="FINAL_CONFIG.style.chart.circles.dataLabels.fontSize"
                :fill="FINAL_CONFIG.style.chart.circles.dataLabels.adaptColorToBackground ? adaptColorToBackground(datapoint.color) : FINAL_CONFIG.style.chart.circles.dataLabels.color"
                :font-weight="FINAL_CONFIG.style.chart.circles.dataLabels.bold ? 'bold' : 'normal'"
                :class="{
                    'animated': FINAL_CONFIG.useCssAnimation
                }"
                :style="{
                    animationDelay: `${150 * i}ms`
                }"
            >
                {{ 
                    applyDataLabel(
                        FINAL_CONFIG.style.chart.circles.dataLabels.formatter,
                        datapoint.proportion * 100,
                        dataLabel({
                            v: datapoint.proportion * 100,
                            s: '%',
                            r: FINAL_CONFIG.style.chart.circles.dataLabels.rounding
                        }),
                        { datapoint }
                    )
                }}
            </text>

            <polygon
                v-if="FINAL_CONFIG.style.chart.area.show"
                :points="funnelArea" 
                :fill="`url(#funnel_area_${uid})`"
                :class="{
                    'animated': FINAL_CONFIG.useCssAnimation
                }"
                :style="{
                    transition: FINAL_CONFIG.useCssAnimation ? `all ${150 * formattedDataset.length}ms ease-in` : 'none'
                }"
            />
        
            <rect
                v-for="({x, y, height, width, fill}, i) in datapoints"
                v-bind="{x, y, height, width, fill }"
                :stroke="FINAL_CONFIG.style.chart.bars.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.bars.strokeWidth"
                :rx="FINAL_CONFIG.style.chart.bars.borderRadius"
                :class="{
                    'animated': FINAL_CONFIG.useCssAnimation
                }"
                :style="{
                    animationDelay: `${150 * i}ms`
                }"
            />

            <g v-for="(datapoint, i) in datapoints">            
                <text
                    :x="datapoint.x + datapoint.width + FINAL_CONFIG.style.chart.bars.dataLabels.name.offsetX + 12"
                    :y="datapoint.cy - FINAL_CONFIG.style.chart.bars.dataLabels.name.fontSize / 2"
                    text-anchor="start"
                    :font-size="FINAL_CONFIG.style.chart.bars.dataLabels.name.fontSize"
                    :fill="FINAL_CONFIG.style.chart.bars.dataLabels.name.color"
                    :font-weight="FINAL_CONFIG.style.chart.bars.dataLabels.name.bold ? 'bold' : 'normal'"
                    :class="{
                        'animated': FINAL_CONFIG.useCssAnimation
                    }"
                    :style="{
                        animationDelay: `${150 * i}ms`
                    }"
                >
                    {{ datapoint.name }}
                </text>
                <text
                    :x="datapoint.x + datapoint.width + FINAL_CONFIG.style.chart.bars.dataLabels.value.offsetX + 12"
                    :y="datapoint.cy + FINAL_CONFIG.style.chart.bars.dataLabels.value.fontSize"
                    text-anchor="start"
                    :font-size="FINAL_CONFIG.style.chart.bars.dataLabels.value.fontSize"
                    :fill="FINAL_CONFIG.style.chart.bars.dataLabels.value.color"
                    :font-weight="FINAL_CONFIG.style.chart.bars.dataLabels.value.bold ? 'bold' : 'normal'"
                    :class="{
                        'animated': FINAL_CONFIG.useCssAnimation
                    }"
                    :style="{
                        animationDelay: `${150 * i}ms`
                    }"
                >
                    {{ 
                        applyDataLabel(
                            FINAL_CONFIG.style.chart.bars.dataLabels.value.formatter,
                            datapoint.value,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.bars.dataLabels.value.prefix,
                                v: datapoint.value,
                                s: FINAL_CONFIG.style.chart.bars.dataLabels.value.suffix,
                                r: FINAL_CONFIG.style.chart.bars.dataLabels.value.rounding
                            }),
                            { datapoint }
                        )
                    }}
                </text>
            </g>
        </svg>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";
.vue-ui-funnel *{
    transition: unset;
}
.vue-ui-funnel {
    user-select: none;
    position: relative;
}
circle.animated {
    opacity: 0;
    animation: reveal 150ms forwards;
    transition: all 150ms ease-in-out;
} 

@keyframes reveal {
    from {
        opacity: 0;
        r: 0;
    }
    to {
        opacity: 1;
    }
}

line.animated {
    animation: dash v-bind(dashLen) ease-in forwards;
}

@keyframes dash {
    to {
        stroke-dashoffset: 0;
    }
}

rect.animated {
    animation: rectExpand 150ms ease-in forwards;
    opacity: 0;
}

@keyframes rectExpand {
    from {
        opacity: 0;
        width: 0;
    }
    to {
        opacity: 1;
    }
}

text.animated {
    opacity: 0;
    animation: textReveal 150ms forwards;
}

@keyframes textReveal {
    to {
        opacity: 1;
    }
}
</style>