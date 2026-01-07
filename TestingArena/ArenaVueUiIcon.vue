<script setup>
import { ref } from "vue";
import BaseIcon from "./../src/atoms/BaseIcon.vue";

import { VueUiIcon } from "vue-data-ui";
import { VueUiIcon as VueUiIconTreeshaken } from "vue-data-ui/vue-ui-icon";

const icons = ref([
    "annotator", "chart3dBar", "chartAgePyramid", "chartBar", "chartCandlestick", "chartChestnut", "chartDonut", "chartDonutEvolution", "chartGauge", "chartHeatmap", "chartLine", "chartMoodRadar", "chartOnion", "chartQuadrant", "chartRadar", "chartRelationCircle", "chartRings", "chartScatter", "chartSparkHistogram", "chartSparkStackbar", "chartTable", "chartThermometer", "chartTiremarks", "chartVerticalBar", "chartWaffle", "chartWheel", "close", "dashboard", "digit0", "digit1", "digit2", "digit3", "digit4", "digit5", "digit6", "digit7", "digit8", "digit9", "excel", "image", "labelClose", "labelOpen", "menu", "moodFlat", "moodHappy", "moodNeutral", "moodSad", "pdf", "screenshot", "skeleton", "smiley", "sort", "spin", "star", "tableClose", "tableOpen", "chartNestedDonuts", "chartSparkbar", "refresh", "circleQuestion", "circleExclamation", "circleCheck", "circleCancel", "moodLaughing", "moodWink", "moodEmbarrassed", "moodSurprised", "exitFullscreen", "fullscreen", "arrowRight", "arrowTop", "arrowBottom", "arrowLeft", "chartCluster", "chartSparkline", "legend", "csv", "chartGalaxy", "kpi", "kpiBox", "tooltip", "vueDataUi", "ratio", "func", "settings", "trendUp", "trendDown", "clipBoard", "zoomPlus", "zoomMinus", "clipboardLine", "clipboardDonut", "clipboardBar", "clipboardVariable", "triangle", "triangleFill", "square", "squareFill", "diamond", "diamondFill", "pentagon", "pentagonFill", "hexagon", "hexagonFill", "circle", "circleFill", "star", "starFace", "starFill", "numbers", "sigma", "mu", "lambda", "people", "copy", "accordion", "cursor", "trend", "chartStripPlot", "chartDumbbell", "copyLeft", "chartWordCloud", "stack", "unstack", "window", "chartFlow", "chartParallelCoordinatePlot", "tooltipDisabled", "pause", "play", "stop", "restart", "lap", "carouselTable", "battery", "chartStackbar", "chartBullet", "trash", "annotatorDisabled", "palette", "boxes", "chartFunnel", "chartHistoryPlot", "chartTableSparkline", "chartCirclePack", "icons", "robot", "hourglass", "computer", "htmlTag", "curlyBrackets", "curlySpread", "world", "eye", "chartRidgeline", "chartChord", "tableDialogOpen", "tableDialogClose", "minimap", "svg", "chartStackline", "zoomLock", "zoomUnlock", "lock", "unlock", "triangleInformation", "triangleExclamation", "direction", "chartDag", "chartGeo", "revert", "lineUp", "histogram", "histogramUp", "histogramDown", "document", "database", "pie", "percentage", "percentageUp", "percentageDown", "aToZ", "zToA", "zeroToNine", "nineToZero", "network", "chip", "chipAi", "chipBinary", "wifi", "key", "binary", "shield", "shieldExclam", "cloud", "cloudRain", "sun", "croissant", "plus", "minus", "person", "people", "blur", "download", "upload", "target", "sqlQuery", "sqlSearch", "gisLayerQuery", "gisLayerSearch", "scada", "apiStream", "wrench", "branches", "fork", "resizeX", "resizeY", "resizeTLBR", "resizeTRBL", "focus", "sql", "monitor", "workstation", "laptop", "folder", "folderFill", "clip", "addColumn", "addRow", "bell", "bellOff", "bellRing", "pin", "unpin", "building", "twig", "check", "doubleCheck", "plug", "unplug", "spinner1", "spinner2", "spinner3", "spinner4", "magnify", "frameLine", "pointer", "monument", "spark", "doubleSpark", "chartBump", "folderOpen", "folderOpenFill", "tag", "lightBulbOn", "lightBulbOff", "knobs", "hierarchy", "hierarchyList", "bucketFill", "bucketEmpty", "bucket", "bucketRecycle", "listType"
])

</script>

<template>
    <div style="display: flex; flex-wrap: wrap; gap: 12px; width: 100%; margin: 0 auto; margin-top: 64px; max-width: 600px; align-items:center;">
        Exp
        <BaseIcon name="square" :isSpin="true" spin-duration="5s">
            <template #exp>
                <BaseIcon name="hourglass" stroke="#42d392" :is-spin="true">
                </BaseIcon>
            </template>
        </BaseIcon>

        <BaseIcon name="image">
            <template #exp>
                <BaseIcon name="download" stroke="#42d392"/>
            </template>
        </BaseIcon>

        <BaseIcon name="database">
            <template #exp>
                <BaseIcon name="spinner2" :is-spin="true" stroke="#42d392"/>
            </template>
        </BaseIcon>
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: 12px; width: 100%; margin: 0 auto; margin-top: 64px; max-width: 600px; align-items:center;">
        Spinners

        <BaseIcon name="spinner1" :is-spin="true"/>
        <BaseIcon name="spinner2" :is-spin="true"/>
        <BaseIcon name="spinner3" :is-spin="true"/>
        <BaseIcon name="spinner4" :is-spin="true"/>
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: 12px; width: 100%; margin: 0 auto; margin-top: 64px; max-width: 600px; align-items:center;">
        Sub
        <BaseIcon name="square">
            <template #sub>
                <BaseIcon name="square" stroke="#42d392" :is-spin="true">
                </BaseIcon>
            </template>
        </BaseIcon>

        <BaseIcon name="image">
            <template #sub>
                <BaseIcon name="download" stroke="#42d392"/>
            </template>
        </BaseIcon>

        <BaseIcon name="database">
            <template #sub>
                <BaseIcon name="sql" :size="20" stroke="#42d392"/>
            </template>
        </BaseIcon>
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: 12px; width: 100%; margin: 0 auto; margin-top: 64px; max-width: 600px; align-items:center;">
        Exp & Sub
        <BaseIcon name="square">
            <template #exp>
                <BaseIcon name="square" stroke="#42d392" :is-spin="true">
                </BaseIcon>
            </template>
            <template #sub>
                <BaseIcon name="square" stroke="#42d392" :is-spin="true">
                </BaseIcon>
            </template>
        </BaseIcon>

        <BaseIcon name="person">
            <template #exp>
                <BaseIcon name="circleQuestion" stroke="#42d392"/>
            </template>
            <template #sub>
                <BaseIcon name="hourglass" stroke="#42d392"/>
            </template>
        </BaseIcon>

                <BaseIcon name="database">
            <template #exp>
                <BaseIcon name="spinner2" :is-spin="true" stroke="#42d392"/>
            </template>
            <template #sub>
                <BaseIcon name="sql" :size="20" stroke="#42d392"/>
            </template>
        </BaseIcon>
    </div>

    <div style="display: flex; flex-wrap: wrap; gap: 12px; width: 100%; margin: 0 auto; margin-top: 64px; max-width: 600px">
        <BaseIcon v-for="icon in icons" :name="icon" stroke="#42d392"/>
        <!-- <VueUiIcon v-for="icon in icons" :name="icon" stroke="#42d392"/>
        <VueUiIconTreeshaken v-for="icon in icons" :name="icon" stroke="#42d392"/> -->
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: 12px; width: 100%; margin: 0 auto; margin-top: 64px; margin-bottom: 64px; max-width: 1200px">
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;width:100px" v-for="icon in icons">
            <BaseIcon :name="icon" stroke="#CCCCCC" :size="48"/>
            <small>{{ icon }}</small>
        </div>
    </div>
    <div style="display: flex; flex-wrap: wrap; gap: 12px; width: 100%; margin: 0 auto; margin-top: 64px; margin-bottom: 64px; max-width: 1200px">
        <BaseIcon v-for="icon in icons" :name="icon" stroke="#6376DD" :size="96"/>
    </div>
</template>