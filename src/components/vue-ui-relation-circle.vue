<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { 
    convertCustomPalette,
    createUid, 
    error, 
    getMissingDatasetAttributes,
    objectIsEmpty, 
    palette,
    themePalettes,
    XMLNS
} from "../lib.js";
import { throttle } from "../canvas-lib";
import themes from "../themes.json";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useResponsive } from "../useResponsive";
import { useConfig } from "../useConfig";
import PackageVersion from "../atoms/PackageVersion.vue";
import PenAndPaper from "../atoms/PenAndPaper.vue";

const { vue_ui_relation_circle: DEFAULT_CONFIG } = useConfig()

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

const isDataset = computed(() => {
    return !!props.dataset && Object.keys(props.dataset).length;
});

const uid = ref(createUid());
const step = ref(0);
const relationCircleChart = ref(null);
const chartTitle = ref(null);
const titleStep = ref(0);

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
                userConfig: themes.vue_ui_relation_circle[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        return mergedConfig;
    }
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    prepareChart();
    titleStep.value += 1;
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `relation_circle_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.title.text || 'vue-ui-relation-circle'
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})

const circles = ref([]);
const relations = ref([]);
const selectedPlot = ref({});
const selectedRelations = ref([]);
const selectedRotation = ref(0);
const limitedDataset = computed(() => {
    return props.dataset.slice(0, FINAL_CONFIG.value.style.limit)
});

const size = ref(FINAL_CONFIG.value.style.size);

const svg = ref({
    height: FINAL_CONFIG.value.style.size,
    width: FINAL_CONFIG.value.style.size
});

const radius = computed({
    get() {
        return size.value * FINAL_CONFIG.value.style.circle.radiusProportion;
    },
    set(v) {
        return v
    }
})

const isCurved = computed(() => {
    return FINAL_CONFIG.value.style.links.curved;
});

const animationSpeed = computed(() => {
    return `${FINAL_CONFIG.value.style.animation.speedMs}ms`;
});

const radiusDash = computed(() => {
    return radius.value * 2;
});

const radiusOffset = computed(() => {
    return radius.value * 4;
})

const resizeObserver = ref(null);

onMounted(() => {
    prepareChart();
    const chart = document.getElementById(`relation_circle_${uid.value}`);
    chart.addEventListener("click", clickOutside);
});

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiRelationCircle',
            type: 'dataset'
        })
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['id', 'label', 'relations', 'weights']
            }).forEach(attr => {
                error({
                    componentName: 'VueUiRelationCircle',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i
                })
            });
        });
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: relationCircleChart.value,
                title: FINAL_CONFIG.value.style.title.text ? chartTitle.value : null,
            });
            size.value = Math.min(width, height);
            svg.value.width = width;
            svg.value.height = height;
            radius.value = size.value * FINAL_CONFIG.value.style.circle.radiusProportion;
            circles.value = [];
            relations.value = [];
            createPlots();
            createRelations();
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(relationCircleChart.value.parentNode);
    } else {
        circles.value = [];
        relations.value = [];
        createPlots();
        createRelations();
    }
}

onBeforeUnmount(() => {
    const chart = document.getElementById(`relation_circle_${uid.value}`);
    chart.removeEventListener("click", clickOutside);
    if (resizeObserver.value) resizeObserver.value.disconnect();
})

function clickOutside(e) {
    const target = e.target;
    if (target && Array.from(target.classList).includes("vue-ui-user-options")) {
        return;
    }
    if (target && Array.from(target.classList).includes("vue-ui-user-options-summary")) {
        return;
    }
    if (target && Array.from(target.classList).includes("vue-data-ui-button")) {
        return;
    }
    if(target && Array.from(target.classList).includes("vue-ui-relation-circle-legend")) {
        return;
    } else {
        selectedPlot.value = {};
        selectedRelations.value = [];
    }
}

function createPlots() {
    const angleGap = 6.28319 / limitedDataset.value.length;
    const regAngleGap = 360 / limitedDataset.value.length;
    let angle = 0;
    let regAngle = 0;
    limitedDataset.value.forEach((plot, i) => {
        const x = radius.value * Math.cos(angle) + (svg.value.width / 2);
        const y = radius.value * Math.sin(angle) + svg.value.height / 2 + FINAL_CONFIG.value.style.circle.offsetY;
        circles.value.push({x,y, ...plot, color: plot.color ? plot.color : customPalette.value[i] ? customPalette.value[i] : palette[i], regAngle});
        angle += angleGap;
        regAngle += regAngleGap
    });
}

function createRelations() {
    circles.value.forEach((plot) => {
        let rels = circles.value.filter(c => c.relations.includes(plot.id));
        rels.forEach((relation, i) => {
            relations.value.push({
                weight: plot.weights ? plot.weights[i] ? plot.weights[i] : 1 : 1,
                relationId: `${plot.id}_${relation.id}`,
                x1: plot.x,
                y1: plot.y,
                x2: relation.x,
                y2: relation.y,
                colorSource: plot.color,
                colorTarget: relation.color,
                ...plot
            })
        })
    })
}

const maxWeight = computed(() => {
    return Math.max(...relations.value.map(r => r.weight));
});

function getCircleOpacity(plot) {
    if(Object.hasOwn(selectedPlot.value, "x")) {
        if (selectedRelations.value.includes(plot.id)){
            return 'opacity:1';
        } else {
            return 'opacity:0.1';
        }
    } else {
        return 'opacity:1';
    }
}

function getLineColor(plot) {
    if (Object.hasOwn(selectedPlot.value, 'x')) {
        return plot.colorTarget;
    } else {
        return plot.colorSource;
    }
}

function getLineOpacityAndWidth(plot) {
    if(Object.hasOwn(selectedPlot.value, 'x')) {
        if (selectedRelations.value.includes(plot.id) && plot.relationId === `${plot.id}_${selectedPlot.value.id}` || plot.relationId === `${selectedPlot.value.id}_${plot.id}`) {
            return `opacity:1;stroke-width:${calcLinkWidth(plot)}`;
        } else {
            return 'opacity: 0';
        }
    } else {
        return 'opacity: 1';
    }
}

function getTextAnchor(plot) {
    if (plot.regAngle > 90 && plot.regAngle < 270) {
        return "end";
    } else {
        return "start";
    }
}

function getTextX(plot) {
    if(plot.regAngle > 90 && plot.regAngle < 270){
        return plot.x - 5;
    }
    return plot.x + 5;
}

function getTextOpacity(plot){
    if (Object.hasOwn(selectedPlot.value, "x")){
        if(selectedPlot.value.id === plot.id || selectedRelations.value.includes(plot.id)){
            return 'opacity:1';
        }
        return "opacity:0.2";
    }
    return 'opacity:1';
}

function getTextRotation(plot) {
    if(plot.regAngle > 90 && plot.regAngle < 270){
        return `rotate(${plot.regAngle + 180},${plot.x},${plot.y})`;
    } else {
        return `rotate(${plot.regAngle},${plot.x},${plot.y})`;
    }
}

function selectPlot(plot) {
    selectedRotation.value = 360 - plot.regAngle;
    if (selectedPlot.value.id && plot.id === selectedPlot.value.id) {
        selectedPlot.value = {};
        selectedRelations.value = [];
    } else {
        selectedPlot.value = plot;
        selectedRelations.value = [...plot.relations]
    }
}

function calcLinkWidth(plot) {
    return plot.weight / maxWeight.value * FINAL_CONFIG.value.style.links.maxWidth;
}

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

defineExpose({
    generatePdf,
    generateImage,
    toggleAnnotator
})

</script>

<template>
    <div ref="relationCircleChart" class="vue-ui-relation-circle" :style="`width:100%;background:${FINAL_CONFIG.style.backgroundColor};text-align:center;${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`" :id="`relation_circle_${uid}`"> 
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :parent="relationCircleChart"
            :backgroundColor="FINAL_CONFIG.style.backgroundColor"
            :color="FINAL_CONFIG.style.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.title.text" :style="`width:100%;background:transparent`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'relation-div-title',
                        ...FINAL_CONFIG.style.title
                    },
                    subtitle: {
                        cy: 'relation-div-subtitle',
                        ...FINAL_CONFIG.style.title.subtitle
                    },
                }"
            />
        </div>

        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset"
            :backgroundColor="FINAL_CONFIG.style.backgroundColor"
            :color="FINAL_CONFIG.style.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="false"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="relationCircleChart"
            :position="FINAL_CONFIG.userOptions.position"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateImage="generateImage"
            @toggleAnnotator="toggleAnnotator"
        >
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
            :xmlns="XMLNS"
            v-if="isDataset"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }"
            :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`"
            class="relation-circle"
            width="100%"
            :style="`user-select:none; background:transparent`"
        >
            <PackageVersion />
            
            <circle
                data-cy="relation-circle" 
                :cx="(svg.width <= 0 ? 0.0001 : svg.width) / 2" 
                :cy="(svg.height <= 0 ? 0.0001 : svg.height) / 2 + FINAL_CONFIG.style.circle.offsetY" 
                :r="(radius <= 0 ? 0.0001 : radius)" 
                :stroke="FINAL_CONFIG.style.circle.stroke"
                :stroke-width="FINAL_CONFIG.style.circle.strokeWidth"
                fill="transparent"
                class="main-circle"
            />

            <g v-if="isCurved">
                <path v-for="(relation,i) in relations"
                    :key="`relation_${i}`" 
                    :style="getLineOpacityAndWidth(relation)"
                    :stroke="getLineColor(relation)" 
                    class="relation"
                    :d="`M${relation.x1},${relation.y1} C${relation.x1},${relation.y1} ${svg.width/2},${svg.height/2 + FINAL_CONFIG.style.circle.offsetY} ${relation.x2},${relation.y2}`"
                    fill="none"
                    :class="{'vue-ui-relation-circle-selected': selectedPlot.hasOwnProperty('id') && selectedRelations.includes(relation.id)}"
                    :stroke-width="calcLinkWidth(relation)"
                    stroke-linecap="round"
                />
            </g>
            <g v-else>
                <line v-for="(relation,i) in relations" 
                    :key="`relation_${i}`" 
                    :stroke="getLineColor(relation)" 
                    :style="getLineOpacityAndWidth(relation)"
                    :x1="relation.x1" 
                    :x2="relation.x2" 
                    :y1="relation.y1" 
                    :y2="relation.y2"
                    :class="{'vue-ui-relation-circle-selected': selectedPlot.hasOwnProperty('id') && selectedRelations.includes(relation.id)}"
                    stroke-linecap="round"
                />
            </g>

            <text v-for="(plot,i) in circles"
                :data-cy="`relation-text-${i}`"
                :key="`plot_text_${i}`" 
                :text-anchor="getTextAnchor(plot)"
                :transform="getTextRotation(plot)"
                :x="getTextX(plot)" 
                :y="plot.y + 5"
                @click="selectPlot(plot)" 
                class="vue-ui-relation-circle-legend" 
                transform-origin="start"
                :font-weight="selectedPlot.id === plot.id ? '900' : '400'"
                :style="`font-family:${FINAL_CONFIG.style.fontFamily};${getTextOpacity(plot)}`"
                :font-size="FINAL_CONFIG.style.labels.fontSize"
                :fill="FINAL_CONFIG.style.labels.color"
            >
                {{plot.label}}
            </text>

            <circle v-for="(plot,i) in circles"
                :data-cy="`relation-plot-${i}`"
                :cx="plot.x" 
                :cy="plot.y" 
                :key="`plot_${i}`" 
                :style="getCircleOpacity(plot)"
                class="vue-ui-relation-circle-plot" 
                :fill="FINAL_CONFIG.style.plot.color" 
                @click="selectPlot(plot)" 
                :r="FINAL_CONFIG.style.plot.radius" 
            />
            <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'relationCircle',
                style: {
                    backgroundColor: FINAL_CONFIG.style.backgroundColor,
                    relationCircle: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />

    </div>
</template>

<style lang="scss" scoped>
@import "../vue-data-ui.css";

.vue-ui-relation-circle {
    position: relative;
}
svg.relation-circle{
    background: transparent;
    overflow: visible;
}
.vue-ui-relation-circle-plot, .vue-ui-relation-circle-legend {
    cursor: pointer;
}
path.vue-ui-relation-circle-selected,
line.vue-ui-relation-circle-selected {
    stroke-dasharray: v-bind(radiusDash);
    stroke-dashoffset: v-bind(radiusDash);
    animation: vue-ui-relation-circle-dash v-bind(animationSpeed) linear forwards;
}

@keyframes vue-ui-relation-circle-dash {
    to {
        stroke-dashoffset: v-bind(radiusOffset);
    }
}
</style>
