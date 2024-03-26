<script setup>
import { computed, ref, onMounted } from "vue";

import VueUi3dBar from "./vue-ui-3d-bar.vue";
import VueUiAgePyramid from "./vue-ui-age-pyramid.vue";
import VueUiAnnotator from "./vue-ui-annotator.vue";
import VueUiCandlestick from "./vue-ui-candlestick.vue";
import VueUiChestnut from "./vue-ui-chestnut.vue";
import VueUiDashboard from "./vue-ui-dashboard.vue";
import VueUiDigits from "./vue-ui-digits.vue";
import VueUiDonutEvolution from "./vue-ui-donut-evolution.vue";
import VueUiDonut from "./vue-ui-donut.vue";
import VueUiGauge from "./vue-ui-gauge.vue";
import VueUiHeatmap from "./vue-ui-heatmap.vue";
import VueUiMiniLoader from "./vue-ui-mini-loader.vue";
import VueUiMolecule from "./vue-ui-molecule.vue";
import VueUiMoodRadar from "./vue-ui-mood-radar.vue";
import VueUiNestedDonuts from "./vue-ui-nested-donuts.vue";
import VueUiOnion from "./vue-ui-onion.vue";
import VueUiQuadrant from "./vue-ui-quadrant.vue";
import VueUiRadar from "./vue-ui-radar.vue";
import VueUiRating from "./vue-ui-rating.vue";
import VueUiRelationCircle from "./vue-ui-relation-circle.vue";
import VueUiRings from "./vue-ui-rings.vue";
import VueUiScatter from "./vue-ui-scatter.vue";
import VueUiScreenshot from "./vue-ui-screenshot.vue";
import VueUiSkeleton from "./vue-ui-skeleton.vue";
import VueUiSmiley from "./vue-ui-smiley.vue";
import VueUiSparkbar from "./vue-ui-sparkbar.vue";
import VueUiSparkgauge from "./vue-ui-sparkgauge.vue";
import VueUiSparkHistogram from "./vue-ui-sparkhistogram.vue";
import VueUiSparkline from "./vue-ui-sparkline.vue";
import VueUiSparkStackbar from "./vue-ui-sparkstackbar.vue";
import VueUiTableSparkline from "./vue-ui-table-sparkline.vue";
import VueUiTable from "./vue-ui-table.vue";
import VueUiThermometer from "./vue-ui-thermometer.vue";
import VueUiTiremarks from "./vue-ui-tiremarks.vue";
import VueUiVerticalBar from "./vue-ui-vertical-bar.vue";
import VueUiWaffle from "./vue-ui-waffle.vue";
import VueUiWheel from "./vue-ui-wheel.vue";
import VueUiXy from "./vue-ui-xy.vue";
import BaseIcon from "../atoms/BaseIcon.vue";

const props = defineProps({
    component: { type: String },
    dataset: { type: [Object, Array, Number] },
    config: { type: Object }
})

const isError = computed(() => {
    return !["VueUi3dBar", "VueUiAgePyramid", "VueUiAnnotator", "VueUiCandlestick", "VueUiChestnut", "VueUiDashboard", "VueUiDigits", "VueUiDonutEvolution", "VueUiDonut", "VueUiGauge", "VueUiHeatmap", "VueUiMiniLoader", "VueUiMolecule", "VueUiMoodRadar", "VueUiNestedDonuts", "VueUiOnion", "VueUiQuadrant", "VueUiRadar", "VueUiRating", "VueUiRelationCircle", "VueUiRings", "VueUiScatter", "VueUiScreenshot", "VueUiSkeleton", "VueUiSmiley", "VueUiSparkbar", "VueUiSparkgauge", "VueUiSparkHistogram", "VueUiSparkline", "VueUiSparkStackbar", "VueUiTableSparkline", "VueUiTable", "VueUiThermometer", "VueUiTiremarks", "VueUiVerticalBar", "VueUiWaffle", "VueUiWheel", "VueUiXy"].includes(props.component)
});

const vue_ui_3d_bar = ref(null);
const vue_ui_age_pyramid = ref(null);
const vue_ui_annotator = ref(null);
const vue_ui_candlestick = ref(null);
const vue_ui_chestnut = ref(null);
const vue_ui_dashboard = ref(null);
const vue_ui_digits = ref(null);
const vue_ui_donut_evolution = ref(null);
const vue_ui_donut = ref(null);
const vue_ui_gauge = ref(null);
const vue_ui_heatmap = ref(null);
const vue_ui_mini_loader = ref(null);
const vue_ui_molecule = ref(null);
const vue_ui_mood_radar = ref(null);
const vue_ui_nested_donuts = ref(null);
const vue_ui_onion = ref(null);
const vue_ui_quadrant = ref(null);
const vue_ui_radar = ref(null);
const vue_ui_rating = ref(null);
const vue_ui_relation_circle = ref(null);
const vue_ui_rings = ref(null);
const vue_ui_scatter = ref(null);
const vue_ui_screenshot = ref(null);
const vue_ui_skeleton = ref(null);
const vue_ui_smiley = ref(null);
const vue_ui_sparkbar = ref(null);
const vue_ui_sparkgauge = ref(null);
const vue_ui_sparkhistogram = ref(null);
const vue_ui_sparkline = ref(null);
const vue_ui_sparkstackbar = ref(null);
const vue_ui_table_sparkline = ref(null);
const vue_ui_table = ref(null);
const vue_ui_thermometer = ref(null);
const vue_ui_tiremarks = ref(null);
const vue_ui_vertical_bar = ref(null);
const vue_ui_waffle = ref(null);
const vue_ui_wheel = ref(null);
const vue_ui_xy = ref(null);

const emit = defineEmits([
    'selectLegend',
    'selectDatapoint',
    'toggleOpenState',
    'saveAnnotations',
    'selectRoot',
    'selectBranch',
    'selectNut',
    'change',
    'selectPlot',
    'selectSide',
    'rate',
    'postImage',
    'hoverIndex',
    'selectX',
]);

const getData = ref(() => null);
const generatePdf = ref(() => null);
const generateCsv = ref(() => null);
const generateImage = ref(() => null);
const getItemsPositions = ref(() => null);
const toggleReadonly = ref(() => null);
const shoot = ref(() => null);
const close = ref(() => null);
const restoreOrder = ref(() => null);
const recalculateHeight = ref(() => null);

onMounted(() => {
    if (isError.value) {
        throw new Error(`\n\nVue Data UI exception:\nThe provided component "${props.component}" does not exist. Check the spelling.\n\nAvailable components:\n\n. VueUi3dBar\n. VueUiAgePyramid\n. VueUiAnnotator\n. VueUiCandlestick\n. VueUiChestnut\n. VueUiDashboard\n. VueUiDigits\n. VueUiDonutEvolution\n. VueUiDonut\n. VueUiGauge\n. VueUiHeatmap\n. VueUiMiniLoadar\n. VueUiMolecule\n. VueUiMoodRadar\n. VueUiNestedDonuts\n. VueUiOnion\n. VueUiQuadrant\n. VueUiRadar\n. VueUiRating\n. VueUiRelationCircle\n. VueUiRings\n. VueUiScatter\n. VueUiScreenshot\n. VueUiSkeleton\n. VueUiSmiley\n. VueUiSparkbar\n. VueUiSparkgauge\n. VueUiSparkHistogram\n. VueUiSparkline\n. VueUiSparkStackbar\n. VueUiTableSparkline\n. VueUiTable\n. VueUiThermometer\n. VueUiTiremarks\n. VueUiVerticalBar\n. VueUiWaffle\n. VueUiWheel\n. VueUiXy\n\n`)
    }

    if(vue_ui_3d_bar.value) {
        generatePdf.value = vue_ui_3d_bar.value.generatePdf;
        generateImage.value = vue_ui_3d_bar.generateImage;
    }

    if(vue_ui_age_pyramid.value) {
        generatePdf.value = vue_ui_age_pyramid.value.generatePdf;
        generateCsv.value = vue_ui_age_pyramid.value.generateCsv;
        generateImage.value = vue_ui_age_pyramid.value.generateImage;
    }

    if(vue_ui_candlestick.value) {
        generatePdf.value = vue_ui_candlestick.value.generatePdf;
        generateCsv.value = vue_ui_candlestick.value.generateCsv;
        generateImage.value = vue_ui_candlestick.value.generateImage;
    }

    if(vue_ui_chestnut.value) {
        getData.value = vue_ui_chestnut.value.getData;
        generatePdf.value = vue_ui_chestnut.value.generatePdf;
        generateCsv.value = vue_ui_chestnut.value.generateCsv;
        generateImage.value = vue_ui_chestnut.value.generateImage;
    }

    if(vue_ui_dashboard.value) {
        getItemsPositions.value = vue_ui_dashboard.value.getItemsPositions;
        generatePdf.value = vue_ui_dashboard.value.generatePdf;
    }

    if(vue_ui_donut_evolution.value) {
        getData.value = vue_ui_donut_evolution.value.getData;
        generatePdf.value = vue_ui_donut_evolution.value.generatePdf;
        generateCsv.value = vue_ui_donut_evolution.value.generateCsv;
        generateImage.value = vue_ui_donut_evolution.value.generateImage;
    }

    if (vue_ui_donut.value) {
        getData.value = vue_ui_donut.value.getData;
        generatePdf.value = vue_ui_donut.value.generatePdf;
        generateCsv.value = vue_ui_donut.value.generateCsv;
        generateImage.value = vue_ui_donut.value.generateImage;
    }

    if(vue_ui_gauge.value) {
        generatePdf.value = vue_ui_gauge.value.generatePdf;
        generateImage.value = vue_ui_gauge.value.generateImage;
    }

    if(vue_ui_heatmap.value) {
        generatePdf.value = vue_ui_heatmap.value.generatePdf;
        generateCsv.value = vue_ui_heatmap.value.generateCsv;
        generateImage.value = vue_ui_heatmap.value.generateImage;
    }

    if(vue_ui_molecule.value) {
        getData.value = vue_ui_molecule.value.getData;
        generatePdf.value = vue_ui_molecule.value.generatePdf;
        generateCsv.value = vue_ui_molecule.value.generateCsv;
        generateImage.value = vue_ui_molecule.value.generateImage;
    }

    if(vue_ui_mood_radar.value) {
        getData.value = vue_ui_mood_radar.value.getData;
        generatePdf.value = vue_ui_mood_radar.value.generatePdf;
        generateCsv.value = vue_ui_mood_radar.value.generateCsv;
        generateImage.value = vue_ui_mood_radar.value.generateImage;
    }

    if(vue_ui_nested_donuts.value) {
        getData.value = vue_ui_nested_donuts.value.getData;
        generatePdf.value = vue_ui_nested_donuts.value.generatePdf;
        generateCsv.value = vue_ui_nested_donuts.value.generateCsv;
        generateImage.value = vue_ui_nested_donuts.value.generateImage;
    }

    if(vue_ui_onion.value) {
        getData.value = vue_ui_onion.value.getData;
        generatePdf.value = vue_ui_onion.value.generatePdf;
        generateCsv.value = vue_ui_onion.value.generateCsv;
        generateImage.value = vue_ui_onion.value.generateImage;
    }

    if(vue_ui_quadrant.value) {
        getData.value = vue_ui_quadrant.value.getData;
        generatePdf.value = vue_ui_quadrant.value.generatePdf;
        generateCsv.value = vue_ui_quadrant.value.generateCsv;
        generateImage.value = vue_ui_quadrant.value.generateImage;
    }

    if(vue_ui_radar.value) {
        getData.value = vue_ui_radar.value.getData;
        generatePdf.value = vue_ui_radar.value.generatePdf;
        generateCsv.value = vue_ui_radar.value.generateCsv;
        generateImage.value = vue_ui_radar.value.generateImage;
    }

    if(vue_ui_rating.value) {
        getData.value = vue_ui_rating.value.getData;
        toggleReadonly.value = vue_ui_rating.value.toggleReadonly;
    }
    
    if(vue_ui_relation_circle.value) {
        generatePdf.value = vue_ui_relation_circle.value.generatePdf;
        generateImage.value = vue_ui_relation_circle.value.generateImage;
    }
    
    if(vue_ui_rings.value) {
        getData.value = vue_ui_rings.value.getData;
        generatePdf.value = vue_ui_rings.value.generatePdf;
        generateCsv.value = vue_ui_rings.value.generateCsv;
        generateImage.value = vue_ui_rings.generateImage;
    }
    
    if(vue_ui_scatter.value) {
        getData.value = vue_ui_scatter.value.getData;
        generatePdf.value = vue_ui_scatter.value.generatePdf;
        generateCsv.value = vue_ui_scatter.value.generateCsv;
        generateImage.value = vue_ui_scatter.value.generateImage;
    }
    
    if(vue_ui_screenshot.value) {
        shoot.value = vue_ui_screenshot.value.shoot;
        close.value = vue_ui_screenshot.value.close;
    }

    if(vue_ui_smiley.value) {
        getData.value = vue_ui_smiley.value.getData;
        toggleReadonly.value = vue_ui_smiley.value.toggleReadonly;
    }

    if(vue_ui_table_sparkline.value) {
        generatePdf.value = vue_ui_table_sparkline.value.generatePdf;
        generateCsv.value = vue_ui_table_sparkline.value.generateCsv;
        generateImage.value = vue_ui_table_sparkline.value.generateImage;
        restoreOrder.value = vue_ui_table_sparkline.value.restoreOrder;
    }

    if(vue_ui_thermometer.value) {
        generatePdf.value = vue_ui_thermometer.value.generatePdf;
        generateImage.value = vue_ui_thermometer.value.generateImage;
    }

    if(vue_ui_tiremarks.value) {
        generatePdf.value = vue_ui_tiremarks.value.generatePdf;
        generateImage.value = vue_ui_tiremarks.value.generateImage;
    }

    if(vue_ui_vertical_bar.value) {
        getData.value = vue_ui_vertical_bar.value.getData;
        recalculateHeight.value = vue_ui_vertical_bar.value.recalculateHeight;
        generatePdf.value = vue_ui_vertical_bar.value.generatePdf;
        generateCsv.value = vue_ui_vertical_bar.value.generateCsv;
        generateImage.value = vue_ui_vertical_bar.value.generateImage;
    }

    if(vue_ui_waffle.value) {
        getData.value = vue_ui_waffle.value.getData;
        generatePdf.value = vue_ui_waffle.value.generatePdf;
        generateCsv.value = vue_ui_waffle.value.generateCsv;
        generateImage.value = vue_ui_waffle.value.generateImage;
    }

    if(vue_ui_wheel.value) {
        generatePdf.value = vue_ui_wheel.value.generatePdf;
        generateImage.value = vue_ui_wheel.value.generateImage;
    }

    if(vue_ui_xy.value) {
        getData.value = vue_ui_xy.value.getData;
        generatePdf.value = vue_ui_xy.value.generatePdf;
        generateCsv.value = vue_ui_xy.generateCsv;
        generateImage.value = vue_ui_xy.generateImage;
    }
})

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage,
    getItemsPositions,
    toggleReadonly,
    shoot,
    close,
    restoreOrder,
    recalculateHeight
})

</script>

<template>
    <div v-if="isError" style="width:100%; display: flex; gap:6px; align-items:center; color:#FF0000">
        <div style="width:36px">
            <BaseIcon name="moodFlat" stroke="#FF0000" />
        </div>
        The provided component "{{ component }}" does not exist
    </div>

    <VueUi3dBar
        v-if="component === 'VueUi3dBar'" 
        :config="config" 
        :dataset="dataset" ref="vue_ui_3d_bar" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
    </VueUi3dBar>

    <VueUiAgePyramid 
        v-if="component === 'VueUiAgePyramid'" 
        :config="config" 
        :dataset="dataset" 
        ref="vue_ui_age_pyramid" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend"></slot>
        </template>
    </VueUiAgePyramid>

    <VueUiAnnotator 
        v-if="component === 'VueUiAnnotator'" 
        :config="config" 
        :dataset="dataset" 
        @saveAnnotations="([ shapes, lastSelectedShape ]) => emit('saveAnnotations', { shapes, lastSelectedShape })" 
        @toggleOpenState="({ isOpen }) => emit('toggleOpenState', { isOpen })" 
        ref="vue_ui_annotator">
        <slot></slot>
    </VueUiAnnotator>

    <VueUiCandlestick 
        v-if="component === 'VueUiCandlestick'" 
        :config="config" 
        :dataset="dataset" 
        ref="vue_ui_candlestick" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend"></slot>
        </template>
    </VueUiCandlestick>

    <VueUiChestnut 
        v-if="component === 'VueUiChestnut'" 
        :config="config" 
        :dataset="dataset" 
        @selectRoot="(root) => emit('selectRoot', root)" 
        @selectBranch="(branch) => emit('selectBranch', branch)" 
        @selectNut="(nut) => emit('selectNut', nut)" 
        ref="vue_ui_chestnut" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend"></slot>
        </template>
    </VueUiChestnut>

    <VueUiDashboard 
        v-if="component === 'VueUiDashboard'" 
        :config="config" 
        :dataset="dataset" 
        @change="(items) => emit('change', items)" 
        ref="vue_ui_dashboard"
    >
        <template v-slot:content="{ item, index }">
            <slot name="content" :item="item" :index="index" :left="item.left" :top="item.top" :height="item.height" :width="item.width"></slot>
        </template>
    </VueUiDashboard>

    <VueUiDigits 
        v-if="component === 'VueUiDigits'" 
        :config="config" 
        :dataset="dataset" 
        ref="vue_ui_digits" 
    />

    <VueUiDonutEvolution 
        v-if="component === 'VueUiDonutEvolution'" 
        :config="config" 
        :dataset="dataset" 
        @selectLegend="(d) => emit('selectLegend', d)" 
        ref="vue_ui_donut_evolution" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend"></slot>
        </template>
    </VueUiDonutEvolution>

    <VueUiDonut 
        v-if="component === 'VueUiDonut'" 
        :config="config" 
        :dataset="dataset" 
        @selectLegend="(d) => emit('selectLegend', d)" 
        @selectDatapoint="({datapoint, index}) => emit('selectDatapoint', { datapoint, index })" 
        ref="vue_ui_donut" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend" />
        </template>
    </VueUiDonut>

    <VueUiGauge 
        v-if="component === 'VueUiGauge'" 
        :config="config" 
        :dataset="dataset" 
        ref="vue_ui_gauge" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend"></slot>
        </template>
    </VueUiGauge>

    <VueUiHeatmap 
        v-if="component === 'VueUiHeatmap'" 
        :config="config" 
        :dataset="dataset" 
        ref="vue_ui_heatmap" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
    </VueUiHeatmap>
    
    <VueUiMiniLoader 
        v-if="component === 'VueUiMiniLoader'" 
        :config="config" 
        :dataset="dataset" 
        ref="vue_ui_mini_loader" 
    />

    <VueUiMolecule 
        v-if="component === 'VueUiMolecule'" 
        :config="config" 
        :dataset="dataset" 
        ref="vue_ui_molecule" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
    </VueUiMolecule>

    <VueUiMoodRadar 
        v-if="component === 'VueUiMoodRadar'" 
        :config="config" 
        :dataset="dataset" 
        ref="vue_ui_mood_radar" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend"></slot>
        </template>
    </VueUiMoodRadar>

    <VueUiNestedDonuts 
        v-if="component === 'VueUiNestedDonuts'" 
        :config="config" 
        :dataset="dataset" 
        @selectLegend="(d) => emit('selectLegend', d)" 
        @selectDatapoint="({ datapoint, index}) => emit('selectDapoint', { datapoint, index })" 
        ref="vue_ui_nested_donuts" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend"></slot>
        </template>
    </VueUiNestedDonuts>

    <VueUiOnion 
        v-if="component === 'VueUiOnion'" 
        :config="config" 
        :dataset="dataset" 
        @selectLegend="(d) => emit('selectLegend', d)" 
        ref="vue_ui_onion" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend"></slot>
        </template>
    </VueUiOnion>

    <VueUiQuadrant 
        v-if="component === 'VueUiQuadrant'" 
        :config="config" 
        :dataset="dataset" 
        @selectPlot="(d) => emit('selectPlot', d)" 
        @selectSide="(d) => emit('selectSide', d)" 
        @selectLegend="(d) => emit('selectLegend', d)" 
        ref="vue_ui_quadrant" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend"></slot>
        </template>
    </VueUiQuadrant>

    <VueUiRadar 
        v-if="component === 'VueUiRadar'" 
        :config="config" 
        :dataset="dataset" 
        @selectLegend="(d) => emit('selectLegend', d)" 
        ref="vue_ui_radar" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend"></slot>
        </template>
    </VueUiRadar>

    <VueUiRating 
        v-if="component === 'VueUiRating'" 
        :config="config" 
        :dataset="dataset" 
        @rate="(d) => emit('rate', d)" 
        ref="vue_ui_rating" 
    />

    <VueUiRelationCircle 
        v-if="component === 'VueUiRelationCircle'" 
        :config="config" 
        :dataset="dataset" 
        ref="vue_ui_relation_circle"
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
    </VueUiRelationCircle>

    <VueUiRings 
        v-if="component === 'VueUiRings'" 
        :config="config" 
        :dataset="dataset" 
        @selectLegend="(d) => emit('selectLegend', d)" 
        ref="vue_ui_rings" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend"></slot>
        </template>
    </VueUiRings>

    <VueUiScatter 
        v-if="component === 'VueUiScatter'" 
        :config="config" 
        :dataset="dataset" 
        ref="vue_ui_scatter" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend"></slot>
        </template>
    </VueUiScatter>

    <VueUiScreenshot 
        v-if="component === 'VueUiScreenshot'" 
        @postImage="(image) => emit('postImage', image)" 
        ref="vue_ui_screenshot" 
    />

    <VueUiSkeleton 
        v-if="component === 'VueUiSkeleton'" 
        :config="config" 
        ref="vue_ui_skeleton" 
    />

    <VueUiSmiley 
        v-if="component === 'VueUiSmiley'" 
        :config="config" 
        :dataset="dataset"
        @rate="(d) => emit('rate', d)" 
        ref="vue_ui_smiley" 
    />

    <VueUiSparkbar 
        v-if="component === 'VueUiSparkbar'" 
        :config="config" 
        :dataset="dataset" 
        @selectDatapoint="({ datapoint, index }) => emit('selectDatapoint', { datapoint, index })" 
        ref="vue_ui_sparkbar" 
    />

    <VueUiSparkgauge 
        v-if="component === 'VueUiSparkgauge'" 
        :config="config" 
        :dataset="dataset" 
        ref="vue_ui_sparkgauge" 
    />

    <VueUiSparkHistogram 
        v-if="component === 'VueUiSparkHistogram'" 
        :config="config" 
        :dataset="dataset" 
        @selectDatapoint="({ datapoint, index }) => emit('selectDatapoint', { datapoint, index })" 
        ref="vue_ui_sparkhistogram" 
    />

    <VueUiSparkline 
        v-if="component === 'VueUiSparkline'" 
        :config="config" 
        :dataset="dataset" 
        @hoverIndex="({index}) => emit('hoverIndex', { index })" 
        @selectDatapoint="({ datapoint, index }) => emit('selectDatapoint', { datapoint, index })" 
        ref="vue_ui_sparkline" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
    </VueUiSparkline>

    <VueUiSparkStackbar 
        v-if="component === 'VueUiSparkStackbar'" 
        :config="config" 
        :dataset="dataset" 
        @selectDatapoint="({ datapoint, index }) => emit('selectDatapoint', { datapoint, index })" 
        ref="vue_ui_sparkstackbar" 
    />

    <VueUiTableSparkline 
        v-if="component === 'VueUiTableSparkline'" 
        :config="config" 
        :dataset="dataset" 
        ref="vue_ui_table_sparkline" 
    />

    <VueUiTable 
        v-if="component === 'VueUiTable'" 
        :config="config" 
        :dataset="dataset"
        ref="vue_ui_table" 
    />

    <VueUiThermometer 
        v-if="component === 'VueUiThermometer'" 
        :config="config" 
        :dataset="dataset" 
        ref="vue_ui_thermometer" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
    </VueUiThermometer>

    <VueUiTiremarks 
        v-if="component === 'VueUiTiremarks'" 
        :config="config" 
        :dataset="dataset" 
        ref="vue_ui_tiremarks" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
    </VueUiTiremarks>

    <VueUiVerticalBar 
        v-if="component === 'VueUiVerticalBar'" 
        :config="config" 
        :dataset="dataset" 
        @selectLegend="(d) => emit('selectLegend', d)" 
        ref="vue_ui_vertical_bar" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend"></slot>
        </template>
    </VueUiVerticalBar>

    <VueUiWaffle 
        v-if="component === 'VueUiWaffle'" 
        :config="config" 
        :dataset="dataset" 
        @selectLegend="(d) => emit('selectLegend', d)" 
        ref="vue_ui_waffle" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend"></slot>
        </template>
    </VueUiWaffle>

    <VueUiWheel 
        v-if="component === 'VueUiWheel'" 
        :config="config" 
        :dataset="dataset" 
        ref="vue_ui_wheel" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
    </VueUiWheel>

    <VueUiXy 
        v-if="component === 'VueUiXy'" 
        :config="config" 
        :dataset="dataset" 
        @selectX="(d) => emit('selectX', d)" 
        @selectLegend="(d) => emit('selectLegend', d)" 
        ref="vue_ui_xy" 
    >
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend"></slot>
        </template>
    </VueUiXy>
</template>