<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { convertConfigColors, treeShake, palette } from "../lib.js";
import pdf from "../pdf";
import mainConfig from "../default_configs.json";
import Title from "../atoms/Title.vue";
import { useNestedProp } from "../useNestedProp";

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

const uid = ref(`vue-ui-relation-circle-${Math.random()}`);
const defaultConfig = ref(mainConfig.vue_ui_relation_circle);
const isPrinting = ref(false);

const relationConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const circles = ref([]);
const radius = computed(() => {
    return relationConfig.value.style.size * relationConfig.value.style.circle.radiusProportion;
});
const relations = ref([]);
const selectedPlot = ref({});
const selectedRelations = ref([]);
const selectedRotation = ref(0);
const limitedDataset = computed(() => {
    return props.dataset.slice(0, relationConfig.value.style.limit)
});

const size = computed(() => {
    return relationConfig.value.style.size;
});

const isCurved = computed(() => {
    return relationConfig.value.style.links.curved;
});

const animationSpeed = computed(() => {
    return `${relationConfig.value.style.animation.speedMs}ms`;
});

const radiusDash = computed(() => {
    return radius.value * 2;
});

const radiusOffset = computed(() => {
    return radius.value * 4;
})

onMounted(() => {
    createPlots();
    createRelations();
    const chart = document.getElementById(`relation_circle_${uid.value}`);
    chart.addEventListener("click", clickOutside);
});

onBeforeUnmount(() => {
    const chart = document.getElementById(`relation_circle_${uid.value}`);
    chart.removeEventListener("click", clickOutside);
})

function clickOutside(e) {
    const target = e.target;
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
        const x = radius.value * Math.cos(angle) + relationConfig.value.style.size / 2;
        const y = radius.value * Math.sin(angle) + relationConfig.value.style.size / 2 + relationConfig.value.style.circle.offsetY;
        circles.value.push({x,y, ...plot, color: plot.color ? plot.color : palette[i], regAngle});
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
    return plot.weight / maxWeight.value * relationConfig.value.style.links.maxWidth;
}

function generatePdf(){
    isPrinting.value = true;
    pdf({
        domElement: document.getElementById(`relation_circle_${uid.value}`),
        fileName: relationConfig.value.style.title.text || 'vue-ui-relation-circle'
    }).finally(() => {
        isPrinting.value = false;
    });
}

defineExpose({
    generatePdf
})



</script>

<template>
    <div class="vue-ui-relation-circle" :style="`width:100%;background:${relationConfig.style.backgroundColor}`" :id="`relation_circle_${uid}`"> 
     <!-- TITLE AS DIV -->
        <div v-if="relationConfig.style.title.useDiv && relationConfig.style.title.text" :style="`width:100%;background:${relationConfig.style.backgroundColor}`">
            <Title
                :config="{
                    title: {
                        cy: 'relation-div-title',
                        text: relationConfig.style.title.text,
                        color: relationConfig.style.title.color ,
                        fontSize: relationConfig.style.title.fontSize,
                        bold: relationConfig.style.title.bold
                    },
                    subtitle: {
                        cy: 'relation-div-subtitle',
                        text: relationConfig.style.title.subtitle.text,
                        color: relationConfig.style.title.subtitle.color ,
                        fontSize: relationConfig.style.title.subtitle.fontSize,
                        bold: relationConfig.style.title.subtitle.bold
                    },
                }"
            />
        </div>  
        <svg 
            :viewBox="`0 0 ${size} ${size}`"
            class="relation-circle"
            width="100%"
            style="user-select:none"
        >
            <!-- TITLE AS G -->
            <g v-if="relationConfig.style.title.text && !relationConfig.style.title.useDiv">
                <text
                    :font-size="relationConfig.style.title.fontSize"
                    :fill="relationConfig.style.title.color"
                    :x="size / 2"
                    :y="relationConfig.style.title.fontSize"
                    text-anchor="middle"
                    :style="`font-weight:${relationConfig.style.title.bold ? 'bold' : ''}`"
                >
                    {{ relationConfig.style.title.text }}
                </text>
                <text
                    v-if="relationConfig.style.title.subtitle.text"
                    :font-size="relationConfig.style.title.subtitle.fontSize"
                    :fill="relationConfig.style.title.subtitle.color"
                    :x="size / 2"
                    :y="relationConfig.style.title.fontSize * 2"
                    text-anchor="middle"
                    :style="`font-weight:${relationConfig.style.title.subtitle.bold ? 'bold' : ''}`"
                >
                    {{ relationConfig.style.title.subtitle.text }}
                </text>
            </g>

            <circle
                data-cy="relation-circle" 
                :cx="size/2" 
                :cy="size/2 + relationConfig.style.circle.offsetY" 
                :r="radius" 
                :stroke="relationConfig.style.circle.stroke"
                :stroke-width="relationConfig.style.circle.strokeWidth"
                fill="transparent"
                class="main-circle"
            />

            <g v-if="isCurved">
                <path v-for="(relation,i) in relations"
                    :key="`relation_${i}`" 
                    :style="getLineOpacityAndWidth(relation)"
                    :stroke="getLineColor(relation)" 
                    class="relation"
                    :d="`M${relation.x1},${relation.y1} C${relation.x1},${relation.y1} ${size/2},${size/2 + relationConfig.style.circle.offsetY} ${relation.x2},${relation.y2}`"
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
                :style="`font-family:${relationConfig.style.fontFamily};${getTextOpacity(plot)}`"
                :font-size="relationConfig.style.labels.fontSize"
                :fill="relationConfig.style.labels.color"
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
                :fill="relationConfig.style.plot.color" 
                @click="selectPlot(plot)" 
                :r="relationConfig.style.plot.radius" 
            />
        </svg>
    </div>
</template>

<style lang="scss" scoped>
svg.relation-circle{
    background: transparent;
    overflow: visible;
    padding: 12px;
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
