<script setup>
import { ref, computed, onMounted } from "vue";
import { calcMarkerOffsetX, calcMarkerOffsetY, calcNutArrowPath, makeDonut, palette, convertColorToHex, opacity, makeXls, createUid } from '../lib';
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
import Title from "../atoms/Title.vue";
import { useNestedProp } from "../useNestedProp";
import UserOptions from "../atoms/UserOptions.vue";
import DataTable from "../atoms/DataTable.vue";
import Tooltip from "../atoms/Tooltip.vue";
import Legend from "../atoms/Legend.vue";

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

const uid = ref(createUid());

const defaultConfig = ref(mainConfig.vue_ui_3d_bar);

const isPrinting = ref(false);
const isImaging = ref(false);
const bar3dChart = ref(null);
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const selectedSerie = ref(null);

const barConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const svg = computed(() => {
    return {
        height: barConfig.value.style.chart.box.dimensions.height,
        width: barConfig.value.style.chart.box.dimensions.width,
        top: barConfig.value.style.chart.box.dimensions.top,
        bottom: barConfig.value.style.chart.box.dimensions.bottom,
        left: barConfig.value.style.chart.box.dimensions.left,
        right: barConfig.value.style.chart.box.dimensions.right,
        perspective: barConfig.value.style.chart.box.dimensions.perspective
    }
});

const box = computed(() => {
    return {
        right: `M${svg.value.width / 2},${svg.value.top} ${svg.value.width - svg.value.right}, ${svg.value.top + svg.value.perspective} ${svg.value.width - svg.value.right},${svg.value.height - svg.value.bottom - svg.value.perspective} ${svg.value.width / 2},${svg.value.height - svg.value.bottom}`,
        left: `M${svg.value.width / 2},${svg.value.top} ${svg.value.left},${svg.value.top + svg.value.perspective} ${svg.value.left},${svg.value.height - svg.value.bottom - svg.value.perspective} ${svg.value.width / 2},${svg.value.height - svg.value.bottom}`,
        side: `M${svg.value.width / 2},${svg.value.height - svg.value.bottom} ${svg.value.width / 2},${svg.value.top + (svg.value.perspective * 2)}`,
        topSides: `M${svg.value.left},${svg.value.top + svg.value.perspective} ${svg.value.width / 2},${svg.value.top + (svg.value.perspective * 2)} ${svg.value.width - svg.value.right},${svg.value.top + svg.value.perspective}`
    }
});

const activeValue = ref(barConfig.value.style.chart.animation.use ? 0 : props.dataset.percentage);

onMounted(() => {
    let acceleration = 0;
    let speed = barConfig.value.style.chart.animation.speed;
    let incr = (0.005) * barConfig.value.style.chart.animation.acceleration;
    function animate() {
        activeValue.value += speed + acceleration;
        acceleration += incr;
        if(activeValue.value < props.dataset.percentage) {
            requestAnimationFrame(animate)
        } else {
            activeValue.value = props.dataset.percentage
        }
    }

    if(barConfig.value.style.chart.animation.use) {
        activeValue.value = 0;
        animate()
    }
})

const fill = computed(() => {
    const proportion = activeValue.value / 100;
    const height = svg.value.height - svg.value.bottom - svg.value.top - (svg.value.perspective * 2);
    return {
        right: `M${svg.value.width / 2},${svg.value.height - svg.value.bottom} ${svg.value.width / 2},${svg.value.height - svg.value.bottom - height * proportion} ${svg.value.width - svg.value.right},${svg.value.height - svg.value.bottom - svg.value.perspective - height * proportion} ${svg.value.width - svg.value.right},${svg.value.height - svg.value.bottom - svg.value.perspective}Z`,
        left: `M${svg.value.width / 2},${svg.value.height - svg.value.bottom} ${svg.value.width / 2},${svg.value.height - svg.value.bottom - height * proportion} ${svg.value.left}, ${svg.value.height - svg.value.bottom - svg.value.perspective - height * proportion} ${svg.value.left},${svg.value.height - svg.value.bottom - svg.value.perspective}Z`,
        top: `M${svg.value.width / 2},${svg.value.height - svg.value.bottom - height * proportion} ${svg.value.left},${svg.value.height - svg.value.bottom - svg.value.perspective - height * proportion} ${svg.value.width / 2},${svg.value.height - svg.value.bottom - (svg.value.perspective * 2) - (height * proportion)} ${svg.value.width - svg.value.right},${svg.value.height - svg.value.bottom - svg.value.perspective - height * proportion} Z`
    }
})

const __to__ = ref(null);

function showSpinnerPdf() {
    isPrinting.value = true;
}

function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(`3d_bar_${uid.value}`),
            fileName: barConfig.value.style.chart.title.text || 'vue-ui-3d-bar'
        }).finally(() => {
            isPrinting.value = false;
        });
    }, 100)
    
}

function showSpinnerImage() {
    isImaging.value = true;
}

function generateImage() {
    showSpinnerImage();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        img({
            domElement: document.getElementById(`3d_bar_${uid.value}`),
            fileName: barConfig.value.style.chart.title.text || 'vue-ui-3d-bar',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

defineExpose({
    generatePdf,
    generateImage
});


</script>

<template>
    <div :ref="`bar3dChart`" :class="`vue-ui-3d-bar`" :style="`font-family:${barConfig.style.fontFamily};width:100%; text-align:center;background:${barConfig.style.chart.backgroundColor}`" :id="`3d_bar_${uid}`">

        <div v-if="barConfig.style.chart.title.text" :style="`width:100%;background:${barConfig.style.chart.backgroundColor}`">
            <!-- TITLE AS DIV -->
            <Title
                :config="{
                    title: {
                        cy: '3dBar-div-title',
                        text: barConfig.style.chart.title.text,
                        color: barConfig.style.chart.title.color,
                        fontSize: barConfig.style.chart.title.fontSize,
                        bold: barConfig.style.chart.title.bold
                    },
                    subtitle: {
                        cy: '3dBar-div-subtitle',
                        text: barConfig.style.chart.title.subtitle.text,
                        color: barConfig.style.chart.title.subtitle.color,
                        fontSize: barConfig.style.chart.title.subtitle.fontSize,
                        bold: barConfig.style.chart.title.subtitle.bold
                    }
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            v-if="barConfig.userOptions.show"
            :backgroundColor="barConfig.style.chart.backgroundColor"
            :color="barConfig.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :title="barConfig.userOptions.title"
            :uid="uid"
            hasImg
            :hasXls="false"
            @generatePdf="generatePdf"
            @generateImage="generateImage"
        />

        <svg data-cy="3d-bar-svg" :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%; overflow: visible; background:${barConfig.style.chart.backgroundColor};color:${barConfig.style.chart.color}`">

            <!-- DEFS -->
            <defs>
                <radialGradient :id="`gradient_top${uid}`">
                    <stop offset="0%" :stop-color="`${convertColorToHex(barConfig.style.chart.backgroundColor)}00`" />
                    <stop offset="100%" :stop-color="`${barConfig.style.chart.bar.color}`" />
                </radialGradient>
                <radialGradient :id="`gradient_left${uid}`">
                    <stop offset="0%" :stop-color="`${convertColorToHex(barConfig.style.chart.backgroundColor)}00`" />
                    <stop offset="100%" :stop-color="`${barConfig.style.chart.bar.color}33`" />
                </radialGradient>
                <radialGradient :id="`gradient_right${uid}`">
                    <stop offset="0%" :stop-color="`${convertColorToHex(barConfig.style.chart.backgroundColor)}00`" />
                    <stop offset="100%" :stop-color="`${barConfig.style.chart.bar.color}33`" />
                </radialGradient>
            </defs>

            <text
                :x="svg.width / 2"
                :y="svg.top - barConfig.style.chart.dataLabel.fontSize / 2"
                :font-size="barConfig.style.chart.dataLabel.fontSize"
                :font-weight="barConfig.style.chart.dataLabel.bold ? 'bold': 'normal'"
                :fill="barConfig.style.chart.dataLabel.color"
                text-anchor="middle"
            >
                {{Number((isNaN(activeValue) ? 0 : activeValue).toFixed(barConfig.style.chart.dataLabel.rounding)).toLocaleString() }} %
            </text>
        
            <!-- BOX SKELETON -->
            <path :stroke-dasharray="barConfig.style.chart.box.strokeDasharray" :d="box.right" :stroke="barConfig.style.chart.box.stroke" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
            <path :stroke-dasharray="barConfig.style.chart.box.strokeDasharray" :d="box.left" :stroke="barConfig.style.chart.box.stroke" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
            <path :stroke-dasharray="barConfig.style.chart.box.strokeDasharray" :d="box.side" :stroke="barConfig.style.chart.box.stroke" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
            <path :stroke-dasharray="barConfig.style.chart.box.strokeDasharray" :d="box.topSides" :stroke="barConfig.style.chart.box.stroke" stroke-linejoin="round" stroke-linecap="round" fill="none"/>

            <!-- FILL BOX -->
            <path :d="fill.right" :stroke="barConfig.style.chart.bar.stroke" :stroke-width="barConfig.style.chart.bar.strokeWidth" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_right${uid})`"/>
            <path :d="fill.left" :stroke="barConfig.style.chart.bar.stroke" :stroke-width="barConfig.style.chart.bar.strokeWidth" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_left${uid})`"/>
            <path :d="fill.top" :stroke="barConfig.style.chart.bar.stroke" :stroke-width="barConfig.style.chart.bar.strokeWidth" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_top${uid})`"/>

            <slot name="svg" :svg="svg"/>
        </svg>
    </div>
</template>

<style scoped>
.vue-ui-3d-bar *{
    transition: unset;
}
.vue-ui-3d-bar {
    user-select: none;
    position: relative;
}
</style>