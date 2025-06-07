<script setup>
import { ref } from "vue";
import BaseIcon from "./../src/atoms/BaseIcon.vue";

const icons = ref([
    "annotator", "chart3dBar", "chartAgePyramid", "chartBar", "chartCandlestick", "chartChestnut", "chartDonut", "chartDonutEvolution", "chartGauge", "chartHeatmap", "chartLine", "chartMoodRadar", "chartOnion", "chartQuadrant", "chartRadar", "chartRelationCircle", "chartRings", "chartScatter", "chartSparkHistogram", "chartSparkStackbar", "chartTable", "chartThermometer", "chartTiremarks", "chartVerticalBar", "chartWaffle", "chartWheel", "close", "dashboard", "digit0", "digit1", "digit2", "digit3", "digit4", "digit5", "digit6", "digit7", "digit8", "digit9", "excel", "image", "labelClose", "labelOpen", "menu", "moodFlat", "moodHappy", "moodNeutral", "moodSad", "pdf", "screenshot", "skeleton", "smiley", "sort", "spin", "star", "tableClose", "tableOpen", "chartNestedDonuts", "chartSparkbar", "refresh", "circleQuestion", "circleExclamation", "circleCheck", "circleCancel", "moodLaughing", "moodWink", "moodEmbarrassed", "moodSurprised", "exitFullscreen", "fullscreen", "arrowRight", "arrowTop", "arrowBottom", "arrowLeft", "chartCluster", "chartSparkline", "legend", "csv", "chartGalaxy", "kpi", "kpiBox", "tooltip", "vueDataUi", "ratio", "func", "settings", "trendUp", "trendDown", "clipBoard", "zoomPlus", "zoomMinus", "clipboardLine", "clipboardDonut", "clipboardBar", "clipboardVariable", "triangle", "triangleFill", "square", "squareFill", "diamond", "diamondFill", "pentagon", "pentagonFill", "hexagon", "hexagonFill", "circle", "circleFill", "star", "starFace", "starFill", "numbers", "sigma", "mu", "lambda", "people", "copy", "accordion", "cursor", "trend", "chartStripPlot", "chartDumbbell", "copyLeft", "chartWordCloud", "stack", "unstack", "window", "chartFlow", "chartParallelCoordinatePlot", "tooltipDisabled", "pause", "play", "stop", "restart", "lap", "carouselTable", "battery", "chartStackbar", "chartBullet", "trash", "annotatorDisabled", "palette", "boxes", "chartFunnel", "chartHistoryPlot", "chartTableSparkline", "chartCirclePack", "icons", "robot", "hourglass", "computer", "htmlTag", "curlyBrackets", "curlySpread", "world", "eye", "chartRidgeline"
])

</script>

<template>
    <div style="display: flex; flex-wrap: wrap; gap: 12px; width: 100%; margin: 0 auto; margin-top: 64px; max-width: 600px">
        <BaseIcon v-for="icon in icons" :name="icon" stroke="#42d392"/>
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: 12px; width: 100%; margin: 0 auto; margin-top: 64px; margin-bottom: 64px; max-width: 1200px">
        <BaseIcon v-for="icon in icons" :name="icon" stroke="#CCCCCC" :size="48"/>
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: 12px; width: 100%; margin: 0 auto; margin-top: 64px; margin-bottom: 64px; max-width: 1200px">
        <BaseIcon v-for="icon in icons" :name="icon" stroke="#6376DD" :size="96"/>
    </div>
</template>