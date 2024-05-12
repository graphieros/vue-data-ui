<script setup>
import { computed, ref, onMounted } from "vue";

import BaseIcon from "../atoms/BaseIcon.vue";
import VueUi3dBar from "./vue-ui-3d-bar.vue";
import VueUiAgePyramid from "./vue-ui-age-pyramid.vue";
import VueUiAnnotator from "./vue-ui-annotator.vue";
import VueUiCandlestick from "./vue-ui-candlestick.vue";
import VueUiChestnut from "./vue-ui-chestnut.vue";
import VueUiDashboard from "./vue-ui-dashboard.vue";
import VueUiDigits from "./vue-ui-digits.vue";
import VueUiDonut from "./vue-ui-donut.vue";
import VueUiDonutEvolution from "./vue-ui-donut-evolution.vue";
import VueUiGalaxy from './vue-ui-galaxy.vue';
import VueUiGauge from "./vue-ui-gauge.vue";
import VueUiHeatmap from "./vue-ui-heatmap.vue";
import VueUiKpi from "./vue-ui-kpi.vue";
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
import VueUiSparkHistogram from "./vue-ui-sparkhistogram.vue";
import VueUiSparkStackbar from "./vue-ui-sparkstackbar.vue";
import VueUiSparkbar from "./vue-ui-sparkbar.vue";
import VueUiSparkgauge from "./vue-ui-sparkgauge.vue";
import VueUiSparkline from "./vue-ui-sparkline.vue";
import VueUiTable from "./vue-ui-table.vue";
import VueUiTableSparkline from "./vue-ui-table-sparkline.vue";
import VueUiThermometer from "./vue-ui-thermometer.vue";
import VueUiTiremarks from "./vue-ui-tiremarks.vue";
import VueUiTreemap from "./vue-ui-treemap.vue";
import VueUiVerticalBar from "./vue-ui-vertical-bar.vue";
import VueUiWaffle from "./vue-ui-waffle.vue";
import VueUiWheel from "./vue-ui-wheel.vue";
import VueUiXy from "./vue-ui-xy.vue";
import VueUiTableHeatmap from "./vue-ui-table-heatmap.vue";
import VueUiAccordion from "./vue-ui-accordion.vue";
import VueUiQuickChart from "./vue-ui-quick-chart.vue";
import VueUiCursor from "./vue-ui-cursor.vue";
import VueUiSparkTrend from "./vue-ui-spark-trend.vue";
import VueUiStripPlot from "./vue-ui-strip-plot.vue";
import VueUiDumbbell from "./vue-ui-dumbbell.vue";

const props = defineProps({
    component: { type: String },
    dataset: { type: [Object, Array, Number] },
    config: { type: Object }
})

const isError = computed(() => {
    return !["VueUi3dBar", "VueUiAgePyramid", "VueUiAnnotator", "VueUiCandlestick", "VueUiChestnut", "VueUiDashboard", "VueUiDigits", "VueUiDonutEvolution", "VueUiDonut", "VueUiGauge", "VueUiGalaxy", "VueUiHeatmap", "VueUiKpi", "VueUiMiniLoader", "VueUiMolecule", "VueUiMoodRadar", "VueUiNestedDonuts", "VueUiOnion", "VueUiQuadrant", "VueUiRadar", "VueUiRating", "VueUiRelationCircle", "VueUiRings", "VueUiScatter", "VueUiScreenshot", "VueUiSkeleton", "VueUiSmiley", "VueUiSparkbar", "VueUiSparkgauge", "VueUiSparkHistogram", "VueUiSparkline", "VueUiSparkStackbar", "VueUiStripPlot", "VueUiTableSparkline", "VueUiTable", "VueUiThermometer", "VueUiTiremarks", "VueUiVerticalBar", "VueUiWaffle", "VueUiWheel", "VueUiXy", "VueUiTreemap", "VueUiTableHeatmap", "VueUiAccordion", "VueUiQuickChart", "VueUiCursor", "VueUiSparkTrend", "VueUiDumbbell"].includes(props.component)
});

const vue_ui_3d_bar = ref(null);
const vue_ui_age_pyramid = ref(null);
const vue_ui_annotator = ref(null);
const vue_ui_candlestick = ref(null);
const vue_ui_chestnut = ref(null);
const vue_ui_dashboard = ref(null);
const vue_ui_digits = ref(null);
const vue_ui_donut = ref(null);
const vue_ui_donut_evolution = ref(null);
const vue_ui_galaxy = ref(null);
const vue_ui_gauge = ref(null);
const vue_ui_heatmap = ref(null);
const vue_ui_kpi = ref(null);
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
const vue_ui_table = ref(null);
const vue_ui_table_sparkline = ref(null);
const vue_ui_thermometer = ref(null);
const vue_ui_tiremarks = ref(null);
const vue_ui_treemap = ref(null);
const vue_ui_vertical_bar = ref(null);
const vue_ui_waffle = ref(null);
const vue_ui_wheel = ref(null);
const vue_ui_xy = ref(null);
const vue_ui_table_heatmap = ref(null);
const vue_ui_quick_chart = ref(null);
const vue_ui_cursor = ref(null);
const vue_ui_spark_trend = ref(null);
const vue_ui_strip_plot = ref(null);
const vue_ui_dumbbell = ref(null);

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
        throw new Error(`\n\nVue Data UI exception:\nThe provided component "${props.component}" does not exist. Check the spelling.\n\nAvailable components:\n\n. VueUi3dBar\n. VueUiAccordion\n. VueUiAgePyramid\n. VueUiAnnotator\n. VueUiCandlestick\n. VueUiChestnut\n. VueUiCursor\n. VueUiDashboard\n. VueUiDigits\n. VueUiDonutEvolution\n. VueUiDonut\n. VueUiDumbbell\n. VueUiGauge\n. VueUiHeatmap\n. VueUiMiniLoadar\n. VueUiKpi\n. VueUiMolecule\n. VueUiMoodRadar\n. VueUiNestedDonuts\n. VueUiOnion\n. VueUiQuadrant\n. VueUiQuickChart\n. VueUiRadar\n. VueUiRating\n. VueUiRelationCircle\n. VueUiRings\n. VueUiScatter\n. VueUiScreenshot\n. VueUiSkeleton\n. VueUiSmiley\n. VueUiSparkbar\n. VueUiSparkgauge\n. VueUiSparkHistogram\n. VueUiSparkline\n. VueUiSparkStackbar\n. VueUiSparkTrend\n. VueUiStripPlot\n. VueUiTableHeatmap\n. VueUiTableSparkline\n. VueUiTable\n. VueUiThermometer\n. VueUiTiremarks\n. VueUiVerticalBar\n. VueUiWaffle\n. VueUiWheel\n. VueUiXy\n\n`)
    }

    if(vue_ui_dumbbell.value) {
        generatePdf.value = vue_ui_dumbbell.value.generatePdf;
        generateImage.value = vue_ui_dumbbell.value.generateImage;
        generateCsv.value = vue_ui_dumbbell.value.generateCsv;
        getData.value = vue_ui_dumbbell.value.getData;
    }

    if(vue_ui_strip_plot.value) {
        generatePdf.value = vue_ui_strip_plot.value.generatePdf;
        generateImage.value = vue_ui_strip_plot.value.generateImage;
        generateCsv.value = vue_ui_strip_plot.value.generateCsv;
        getData.value = vue_ui_strip_plot.value.getData;
    }

    if(vue_ui_quick_chart.value) {
        generatePdf.value = vue_ui_quick_chart.value.generatePdf;
        generateImage.value = vue_ui_quick_chart.value.generateImage;
    }

    if(vue_ui_table_heatmap.value) {
        generatePdf.value = vue_ui_table_heatmap.value.generatePdf;
        generateCsv.value = vue_ui_table_heatmap.value.generateCsv;
        generateImage.value = vue_ui_table_heatmap.value.generateImage;
    }

    if(vue_ui_3d_bar.value) {
        generatePdf.value = vue_ui_3d_bar.value.generatePdf;
        generateImage.value = vue_ui_3d_bar.value.generateImage;
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
    
    if(vue_ui_galaxy.value) {
        getData.value = vue_ui_galaxy.value.getData;
        generatePdf.value = vue_ui_galaxy.value.generatePdf;
        generateCsv.value = vue_ui_galaxy.value.generateCsv;
        generateImage.value = vue_ui_galaxy.value.generateImage;
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

    if(vue_ui_treemap.value) {
        getData.value = vue_ui_treemap.value.getData;
        generatePdf.value = vue_ui_treemap.value.generatePdf;
        generateCsv.value = vue_ui_treemap.value.generateCsv;
        generateImage.value = vue_ui_treemap.value.generateImage;
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

    <VueUiDumbbell
        v-if="component === 'VueUiDumbbell'"
        :config="config"
        :dataset="dataset"
        ref="vue_ui_dumbbell"
    >
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend"/>
        </template>
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
    </VueUiDumbbell>

    <VueUiStripPlot
        v-if="component === 'VueUiStripPlot'"
        :config="config"
        :dataset="dataset"
        ref="vue_ui_strip_plot"
        @selectDatapoint="(d) => emit('selectDatapoint', d)"
    >
        <template #tooltip-before="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-before" v-bind="{datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #tooltip-after="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-after" v-bind="{ datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
    </VueUiStripPlot>

    <VueUiSparkTrend
        v-if="component === 'VueUiSparkTrend'"
        :config="config"
        :dataset="dataset"
        ref="vue_ui_spark_trend"
    />

    <VueUiCursor
        v-if="component === 'VueUiCursor'"
        :config="config"
        ref="vue_ui_cursor"
    />

    <VueUiQuickChart 
        v-if="component === 'VueUiQuickChart'" 
        :config="config" 
        :dataset="dataset" 
        ref="vue_ui_quick_chart"
        @selectLegend="(d) => emit('selectLegend', d)"
        @selectDatapoint="(d) => emit('selectDatapoint', d)"
    >
        <template #tooltip-before="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-before" v-bind="{datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #tooltip-after="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-after" v-bind="{ datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend" />
        </template>
    </VueUiQuickChart>

    <VueUiAccordion v-if="component === 'VueUiAccordion'" :config="config">
        <template #arrow="{ backgroundColor, color, iconColor, isOpen }">
            <slot name="arrow" v-bind="{ backgroundColor, color, iconColor, isOpen }"/>
        </template>
        <template #title="{ color, isOpen }">
            <slot name="title" v-bind="{ color, isOpen }"/>
        </template>
        <template #content="{ backgroundColor, color, isOpen }">
            <slot name="content" v-bind="{ backgroundColor, color, isOpen }"/>
        </template>
    </VueUiAccordion>

    <VueUiTableHeatmap 
        v-if="component === 'VueUiTableHeatmap'"
        ref="vue_ui_table_heatmap"
        :config="config"
        :dataset="dataset"
    >
        <template #caption>
            <slot name="caption"/>
        </template>
        <template #head="{ value, rowIndex, type }">
            <slot name="head" v-bind="{ value, rowIndex, type }"/>
        </template>
        <template #rowTitle="{ value, rowIndex, colIndex, type, isResponsive }">
            <slot name="rowTitle" v-bind="{ value, rowIndex, colIndex, type, isResponsive }"/>
        </template>
        <template #cell="{ value, rowIndex, colIndex, type, color, textColor, isResponsive }">
            <slot name="cell" v-bind="{ value, rowIndex, colIndex, type, color, textColor, isResponsive }"/>
        </template>
        <template #sum="{ value, rowIndex, isResponsive }">
            <slot name="sum" v-bind="{ value, rowIndex, isResponsive }"/>
        </template>
        <template #average="{ value, rowIndex, isResponsive }">
            <slot name="average" v-bind="{ value, rowIndex, isResponsive }"/>
        </template>
        <template #median="{ value, rowIndex, isResponsive }">
            <slot name="median" v-bind="{ value, rowIndex, isResponsive }"/>
        </template>
    </VueUiTableHeatmap>

    <VueUi3dBar
        v-if="component === 'VueUi3dBar'" 
        :config="config" 
        :dataset="dataset" ref="vue_ui_3d_bar" 
        @selectDatapoint="(datapoint) => emit('selectDatapoint', datapoint)"
    >
        <template #legend="{ datapoint, config, dataset }">
            <slot name="legend" v-bind:legend="{ datapoint, config, dataset }" />
        </template>
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
        <template #tooltip-before="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-before" v-bind="{datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #tooltip-after="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-after" v-bind="{ datapoint, seriesIndex, dataset, config }"></slot>
        </template>
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
        <template #tooltip-before="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-before" v-bind="{datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #tooltip-after="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-after" v-bind="{ datapoint, seriesIndex, dataset, config }"></slot>
        </template>
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
        <template #tooltip-before="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-before" v-bind="{datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #tooltip-after="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-after" v-bind="{ datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
        <template #dataLabel="{ datapoint, isBlur, isSafari, isVisible, flexAlign, textAlign, percentage }">
            <slot name="dataLabel" v-bind="{ datapoint, isBlur, isSafari, isVisible, flexAlign, textAlign, percentage }"/>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend" />
        </template>
    </VueUiDonut>

    <VueUiGalaxy
        v-if="component === 'VueUiGalaxy'"
        :config="config"
        :dataset="dataset"
        @selectLegend="(d) => emit('selectLegend', d)" 
        @selectDatapoint="({datapoint, index}) => emit('selectDatapoint', { datapoint, index })" 
        ref="vue_ui_galaxy" 
    >
        <template #tooltip-before="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-before" v-bind="{datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #tooltip-after="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-after" v-bind="{ datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend" />
        </template>
    </VueUiGalaxy>

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
        <template #tooltip-before="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-before" v-bind="{datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #tooltip-after="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-after" v-bind="{ datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
    </VueUiHeatmap>

    <VueUiKpi
        v-if="component === 'VueUiKpi'"
        :config="config"
        :dataset="dataset"
        ref="vue_ui_kpi"
    >
        <template #title="{ comment }">
            <slot name="title" :comment="comment"></slot>
        </template>
        <template #value="{ comment }">
            <slot name="value" :comment="comment"></slot>
        </template>
        <template #comment-before="{ comment }">
            <slot name="comment-before" :comment="comment"></slot>
        </template>
        <template #comment-after="{ comment }">
            <slot name="comment-after" :comment="comment"></slot>
        </template>

    </VueUiKpi>
    
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
        <template #tooltip-before="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-before" v-bind="{datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #tooltip-after="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-after" v-bind="{ datapoint, seriesIndex, dataset, config }"></slot>
        </template>
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
        <template #tooltip-before="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-before" v-bind="{datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #tooltip-after="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-after" v-bind="{ datapoint, seriesIndex, dataset, config }"></slot>
        </template>
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
        <template #tooltip-before="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-before" v-bind="{datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #tooltip-after="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-after" v-bind="{ datapoint, seriesIndex, dataset, config }"></slot>
        </template>
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
        <template #tooltip-before="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-before" v-bind="{datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #tooltip-after="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-after" v-bind="{ datapoint, seriesIndex, dataset, config }"></slot>
        </template>
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
        <template #tooltip-before="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-before" v-bind="{datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #tooltip-after="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-after" v-bind="{ datapoint, seriesIndex, dataset, config }"></slot>
        </template>
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
        <template #tooltip-before="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-before" v-bind="{datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #tooltip-after="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-after" v-bind="{ datapoint, seriesIndex, dataset, config }"></slot>
        </template>
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
        <template #tooltip-before="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-before" v-bind="{datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #tooltip-after="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-after" v-bind="{ datapoint, seriesIndex, dataset, config }"></slot>
        </template>
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

    <VueUiTreemap
        v-if="component === 'VueUiTreemap'"
        :config="config"
        :dataset="dataset"
        ref="vue_ui_treemap"
    >
        <template #rect="{ rect, shouldShow, fontSize, isZoom, textColor }">
            <slot name="rect" v-bind="{ rect, shouldShow, fontSize, isZoom, textColor}"/>
        </template>
        <template #tooltip-before="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-before" v-bind="{datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #tooltip-after="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-after" v-bind="{ datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #svg="{ svg, isZoom, rect, config }">
            <slot name="svg" v-bind="{ svg, isZoom, rect, config }"></slot>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend"></slot>
        </template>
    </VueUiTreemap>

    <VueUiVerticalBar 
        v-if="component === 'VueUiVerticalBar'" 
        :config="config" 
        :dataset="dataset" 
        @selectLegend="(d) => emit('selectLegend', d)" 
        ref="vue_ui_vertical_bar" 
    >
        <template #tooltip-before="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-before" v-bind="{datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #tooltip-after="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-after" v-bind="{ datapoint, seriesIndex, dataset, config }"></slot>
        </template>
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
        <template #cell="{ cell, isSelected }">
            <slot name="cell" v-bind="{ cell, isSelected }"/>
        </template>
        <template #tooltip-before="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-before" v-bind="{datapoint, seriesIndex, dataset, config }"></slot>
        </template>
        <template #tooltip-after="{ datapoint, seriesIndex, dataset, config }">
            <slot name="tooltip-after" v-bind="{ datapoint, seriesIndex, dataset, config }"></slot>
        </template>
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
        <template #tooltip-before="{ datapoint, seriesIndex, dataset, config, bars, lines, plots }">
            <slot name="tooltip-before" v-bind="{datapoint, seriesIndex, dataset, config, bars, lines, plots }"></slot>
        </template>
        <template #tooltip-after="{ datapoint, seriesIndex, dataset, config, bars, lines, plots }">
            <slot name="tooltip-after" v-bind="{ datapoint, seriesIndex, dataset, config, bars, lines, plots }"></slot>
        </template>
        <template #svg="{ svg }">
            <slot name="svg" :svg="svg"></slot>
        </template>
        <template #legend="{ legend }">
            <slot name="legend" v-bind:legend="legend"></slot>
        </template>
    </VueUiXy>
</template>