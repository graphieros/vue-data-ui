<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount, defineAsyncComponent } from "vue";
import { useConfig } from "../useConfig";
import { XMLNS, createUid, error, getMissingDatasetAttributes, objectIsEmpty } from "../lib";
import { useNestedProp } from "../useNestedProp";
import { convertColorToHex } from "../lib";
import { lightenHexColor } from "../lib";
import { calculateNiceScale } from "../lib";
import { applyDataLabel } from "../lib";
import { dataLabel } from "../lib";
import { usePrinter } from "../usePrinter";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import themes from "../themes.json";
import Legend from "../atoms/Legend.vue"; // Must be ready in responsive mode
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import img from "../img";

const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const Skeleton = defineAsyncComponent(() => import('./vue-ui-skeleton.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));

const { vue_ui_bullet: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: Object,
        default() {
            return {}
        }
    },
});

const bulletChart = ref(null);
const chartTitle = ref(null);
const titleStep = ref(0);
const chartLegend = ref(null);
const step = ref(0);

const isDataset = computed({
    get: () => {
        return props.dataset.hasOwnProperty('value')
    },
    set: (bool) => {
        return bool
    }
})

const hasSegments = computed(() => {
    if(!props.dataset.segments) {
        console.warn(`VueUiBullet: dataset segments is empty. Provide segments with this datastructure:\n
segments: [
    {
        name: string;
        from: number;
        to: number;
        color?: string;
    },
    {...}
]
        `)
        isDataset.value = false;
        return false;
    }
    if(!Array.isArray(props.dataset.segments)) {
        console.warn(`VueUiBullet: dataset segments must be an array of objects with this datastructure:\n
segments: [
    {
        name: string;
        from: number;
        to: number;
        color?: string;
    },
    {...}
] 
        `);
        isDataset.value = false;
        return false;
    }
    if (!props.dataset.segments.length) {
        console.warn(`VueUiBullet: dataset segments is empty. Provide segments with this datastructure:\n
segments: [
    {
        name: string;
        from: number;
        to: number;
        color?: string;
    },
    {...}
]
        `);
        isDataset.value = false;
        return false
    };
    return true;
})

onMounted(prepareChart);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiBullet',
            type: 'dataset'
        })
    } else {
        if (hasSegments.value) {
            props.dataset.segments.forEach((segment, i) => {
                getMissingDatasetAttributes({
                    datasetObject: segment,
                    requiredAttributes: ['name', 'from', 'to']
                }).forEach(attr => {
                    isDataset.value = false;
                    error({
                        componentName: 'VueUiBullet segment',
                        type: 'datasetSerieAttribute',
                        property: attr,
                        index: i
                    })
                })
            })
        } else {
            isDataset.value = false;
        }
    }

    if (FINAL_CONFIG.value.style.chart.animation.show) {
        useAnimation(props.dataset.value || 0);
    }
}

const uid = ref(createUid());

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_bullet[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
        }
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

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
}, { deep: true });

const svg = computed(() => {
    const height = FINAL_CONFIG.value.style.chart.height;
    const width = FINAL_CONFIG.value.style.chart.width;
    const left = FINAL_CONFIG.value.style.chart.padding.left;
    const right = width - FINAL_CONFIG.value.style.chart.padding.right;
    const top = FINAL_CONFIG.value.style.chart.padding.top;
    const bottom = height - FINAL_CONFIG.value.style.chart.padding.bottom;
    return {
        height,
        width,
        left,
        right,
        top,
        bottom,
        chartWidth: right - left,
        chartHeight: bottom - top
    }
})

const segmentColors = computed(() => {
    if(!hasSegments.value) return [];
    const arr = [];
    for(let i = 0; i < props.dataset.segments.length; i += 1) {
        arr.push(lightenHexColor(FINAL_CONFIG.value.style.chart.segments.baseColor, i / (props.dataset.segments.length)))
    }
    return arr;
})

const minMax = computed(() => {
    if (!hasSegments.value) return {min: 0, max: 1};
    return {
        min: Math.min(...props.dataset.segments.map(s => s.from)),
        max: Math.max(...props.dataset.segments.map(s => s.to)),
    }
})

const activeValue = ref(getActiveValue());

watch(() => props.dataset, (v) => {
    if (FINAL_CONFIG.value.style.chart.animation.show) {
        useAnimation(v.value || 0);
    } else {
        activeValue.value = v.value || 0
    }
}, { deep: true })

function getActiveValue() {
    if (FINAL_CONFIG.value.style.chart.animation.show) {
        return minMax.value.min;
    } else {
        return props.dataset.value || 0;
    }
}

const raf = ref(null);

function useAnimation(targetValue) {
    const chunk = Math.abs(targetValue - activeValue.value) / FINAL_CONFIG.value.style.chart.animation.animationFrames;
    function animate() {
        if(activeValue.value < targetValue) {
            activeValue.value = Math.min(activeValue.value + chunk, targetValue);
        } else if (activeValue.value > targetValue) {
            activeValue.value = Math.max(activeValue.value - chunk, targetValue);
        }
        if (activeValue.value !== targetValue) {
            raf.value = requestAnimationFrame(animate)
        }
    }
    animate();
}

onBeforeUnmount(() => {
    cancelAnimationFrame(raf.value);
})

const segments = computed(() => {
    if(!hasSegments.value) {
        return [];
    };
    const scale = calculateNiceScale(minMax.value.min, minMax.value.max, FINAL_CONFIG.value.style.chart.segments.ticks.divisions);
    const absMin = scale.min >= 0 ? 0 : Math.abs(scale.min);

    const target = {
        x: svg.value.left + (((props.dataset.target + absMin) / (scale.max + absMin)) * svg.value.chartWidth) - FINAL_CONFIG.value.style.chart.target.width / 2
    }
    const value = {
        width: ((activeValue.value + absMin) / (scale.max + absMin)) * svg.value.chartWidth
    }
    const ticks = scale.ticks.map(t => {
        return {
            value: t,
            y: svg.value.bottom + FINAL_CONFIG.value.style.chart.segments.dataLabels.fontSize + 3 + FINAL_CONFIG.value.style.chart.segments.dataLabels.offsetY,
            x: svg.value.left + (((t + absMin) / (scale.max + absMin)) * svg.value.chartWidth)
        }
    })
    return {
        scale,
        target,
        value,
        ticks,
        chunks: props.dataset.segments.map((segment, i) => {
            return {
                ...segment,
                color: segment.color ? convertColorToHex(segment.color) : segmentColors.value[i],
                x: svg.value.left + (svg.value.chartWidth * ((segment.from + absMin) / (scale.max + absMin))),
                y: svg.value.top,
                height: svg.value.chartHeight,
                width: svg.value.chartWidth * (Math.abs(segment.to - segment.from) / (scale.max + absMin)),
            }
        })
    }
})

const legendSet = computed(() => {
    if (!segments.value || !segments.value.chunks || !segments.value.chunks.length) {
        return []
    }
    return segments.value.chunks.map(segment => {
        const formattedFrom = applyDataLabel(
            FINAL_CONFIG.value.style.chart.segments.dataLabels.formatter,
            segment.from,
            dataLabel({
                p: FINAL_CONFIG.value.style.chart.segments.dataLabels.prefix,
                v: segment.from,
                s: FINAL_CONFIG.value.style.chart.segments.dataLabels.suffix,
                r: FINAL_CONFIG.value.style.chart.segments.dataLabels.rounding
            })
        )
        const formattedTo = applyDataLabel(
            FINAL_CONFIG.value.style.chart.segments.dataLabels.formatter,
            segment.to,
            dataLabel({
                p: FINAL_CONFIG.value.style.chart.segments.dataLabels.prefix,
                v: segment.to,
                s: FINAL_CONFIG.value.style.chart.segments.dataLabels.suffix,
                r: FINAL_CONFIG.value.style.chart.segments.dataLabels.rounding
            })
        )

        return {
            ...segment,
            shape: 'square',
            value: `${formattedFrom} - ${formattedTo}`
        }
    })
})

const legendConfig = computed(() => {
    return {
        cy: 'bullet-div-legend',
        backgroundColor: 'transparent',
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 6,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : '',
    }
})

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `bullet_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-bullet',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function getData() {
    return segments.value;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

async function getImage({ scale = 2} = {}) {
    if (!bulletChart.value) return
    const { width, height } = bulletChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: bulletChart.value, base64: true, img: true, scale})
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio
    }
}

defineExpose({
    getData,
    getImage,
    generatePdf,
    generateImage,
    toggleAnnotator,
    toggleFullscreen
})

</script>

<template>
    <div
        ref="bulletChart"
        :class="`vue-ui-bullet ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%;background:${FINAL_CONFIG.style.chart.backgroundColor}`"
        :id="`bullet_${uid}`"
        @mouseenter="() => setUserOptionsVisibility(true)" 
        @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;`">
            <Title
                lineHeight="1.3rem"
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'bullet-div-title',
                        ...FINAL_CONFIG.style.chart.title,
                    },
                    subtitle: {
                        cy: 'bullet-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <UserOptions
            ref="details"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="false"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="false"
            :hasTable="false"
            :hasLabel="false"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :chartElement="bulletChart"
            :position="FINAL_CONFIG.userOptions.position"
            :titles="{...FINAL_CONFIG.userOptions.buttonTitles }"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateImage="generateImage"
            @toggleAnnotator="toggleAnnotator"
            :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }"
        >
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }"/>
            </template>
            <template #optionPdf v-if="$slots.optionPdf">
                <slot name="optionPdf" />
            </template>
            <template #optionImg v-if="$slots.optionImg">
                <slot name="optionImg" />
            </template>
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <svg
            ref="svgRef"
            :xmlns="XMLNS"
            v-if="isDataset"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen, 'vue-ui-bullet-svg': true }"
            :viewBox="`0 0 ${svg.width} ${svg.height}`"
            :style="`width: 100%; overflow: visible; background:transparent;color:${FINAL_CONFIG.style.chart.color}`"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="0"
                :y="0"
                :width="svg.width"
                :height="svg.height"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>

            <g v-if="hasSegments">
                <!-- SEGMENTS -->
                <rect
                    data-cy="vue-ui-bullet-segment"
                    v-for="segment in segments.chunks"
                    :x="segment.x"
                    :y="segment.y"
                    :height="segment.height"
                    :width="segment.width"
                    :fill="segment.color"
                    :stroke-width="1"
                    :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                />
                <!-- TARGET BELOW-->
                <rect
                    data-cy="vue-ui-bullet-target-below"
                    v-if="!FINAL_CONFIG.style.chart.target.onTop"
                    :x="segments.target.x"
                    :y="svg.top + (svg.chartHeight - ((svg.chartHeight * FINAL_CONFIG.style.chart.target.heightRatio))) / 2"
                    :height="svg.chartHeight * FINAL_CONFIG.style.chart.target.heightRatio"
                    :width="FINAL_CONFIG.style.chart.target.width"
                    :rx="FINAL_CONFIG.style.chart.target.rounded ? FINAL_CONFIG.style.chart.target.width / 2 : 0"
                    :fill="FINAL_CONFIG.style.chart.target.color"
                    :stroke="FINAL_CONFIG.style.chart.target.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.target.strokeWidth"
                />
                <!-- VALUE BAR -->
                <rect
                    data-cy="vue-ui-bullet-value-bar"
                    :x="svg.left"
                    :y="svg.top + (svg.chartHeight - ((svg.chartHeight * FINAL_CONFIG.style.chart.valueBar.heightRatio))) / 2"
                    :height="svg.chartHeight * FINAL_CONFIG.style.chart.valueBar.heightRatio"
                    :width="segments.value.width"
                    :fill="FINAL_CONFIG.style.chart.valueBar.color"
                    :stroke="FINAL_CONFIG.style.chart.valueBar.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.valueBar.strokeWidth"
                />
                <!-- VALUE LABEL -->
                <text
                    data-cy="vue-ui-bullet-value-label"
                    v-if="FINAL_CONFIG.style.chart.valueBar.label.show"
                    :x="svg.left + segments.value.width"
                    :y="svg.top - 6 + FINAL_CONFIG.style.chart.valueBar.label.offsetY"
                    :font-size="FINAL_CONFIG.style.chart.valueBar.label.fontSize"
                    :font-weight="FINAL_CONFIG.style.chart.valueBar.label.bold ? 'bold' : 'normal'"
                    :fill="FINAL_CONFIG.style.chart.valueBar.label.color"
                    text-anchor="middle"
                >
                    {{ 
                        applyDataLabel(
                            FINAL_CONFIG.style.chart.segments.dataLabels.formatter,
                            activeValue,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.segments.dataLabels.prefix,
                                v: activeValue,
                                s: FINAL_CONFIG.style.chart.segments.dataLabels.suffix,
                                r: FINAL_CONFIG.style.chart.segments.dataLabels.rounding
                            })
                        )
                    }}
                </text>
                <!-- TARGET ON TOP-->
                <rect
                    data-cy="vue-ui-bullet-target-top"
                    v-if="FINAL_CONFIG.style.chart.target.onTop"
                    :x="segments.target.x"
                    :y="svg.top + (svg.chartHeight - ((svg.chartHeight * FINAL_CONFIG.style.chart.target.heightRatio))) / 2"
                    :height="svg.chartHeight * FINAL_CONFIG.style.chart.target.heightRatio"
                    :width="FINAL_CONFIG.style.chart.target.width"
                    :rx="FINAL_CONFIG.style.chart.target.rounded ? FINAL_CONFIG.style.chart.target.width / 2 : 0"
                    :fill="FINAL_CONFIG.style.chart.target.color"
                    :stroke="FINAL_CONFIG.style.chart.target.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.target.strokeWidth"
                />
                <!-- TICK LABELS -->
                <g v-if="FINAL_CONFIG.style.chart.segments.dataLabels.show">
                    <text
                        data-cy="vue-ui-bullet-tick-label"
                        v-for="tick in segments.ticks"
                        :x="tick.x"
                        :y="tick.y"
                        text-anchor="middle"
                        :fill="FINAL_CONFIG.style.chart.segments.dataLabels.color"
                        :font-size="FINAL_CONFIG.style.chart.segments.dataLabels.fontSize + 'px'"
                        :font-weight="FINAL_CONFIG.style.chart.segments.dataLabels.bold ? 'bold' : 'normal'"
                    >
                        {{ 
                            applyDataLabel(
                                FINAL_CONFIG.style.chart.segments.dataLabels.formatter,
                                tick.value,
                                dataLabel({
                                    p: FINAL_CONFIG.style.chart.segments.dataLabels.prefix,
                                    v: tick.value,
                                    s: FINAL_CONFIG.style.chart.segments.dataLabels.suffix,
                                    r: FINAL_CONFIG.style.chart.segments.dataLabels.rounding
                                })
                            )
                        }}
                    </text>
                </g>
                <!-- TICK MARKERS -->
                <g v-if="FINAL_CONFIG.style.chart.segments.dataLabels.show && FINAL_CONFIG.style.chart.segments.ticks.show">
                    <line
                        data-cy="vue-ui-bullet-tick-marker"
                        v-for="marker in segments.ticks"
                        :x1="marker.x"
                        :x2="marker.x"
                        :y1="svg.bottom"
                        :y2="svg.bottom + 3"
                        :stroke="FINAL_CONFIG.style.chart.segments.ticks.stroke"
                        :stroke-width="1"
                        stroke-linecap="round"
                    />
                </g>
            </g>
            <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <Skeleton 
            v-if="!isDataset"
            :config="{
                type: 'bullet',
                style: {
                    backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                    bullet: {
                        color: '#CCCCCC',
                    }
                }
            }"
        />

        <div ref="chartLegend">
            <Legend 
                v-if="FINAL_CONFIG.style.chart.legend.show"
                :clickable="false"
                :legendSet="legendSet"
                :config="legendConfig"
            >
                <template #item="{ legend }">
                    <div class="vue-ui-bullet-legend-item" dir="auto">
                        <span style="margin-right:2px">{{ legend.name }}:</span>
                        <span>{{ legend.value }}</span>
                    </div>
                </template>
            </Legend>
            <slot name="legend" v-bind:legend="legendSet" />
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";
.vue-ui-bullet *{
    transition: unset;
}
.vue-ui-bullet {
    user-select: none;
    position: relative;
}
</style>