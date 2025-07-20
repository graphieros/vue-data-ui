import { defineAsyncComponent } from "vue";
import getVueDataUiConfig from "./getVueDataUiConfig";
import getThemeConfig from "./getThemeConfig";
import { getPalette, createWordCloudDatasetFromPlainText, abbreviate, createTSpans, createStraightPath, createSmoothPath, getCumulativeAverage, getCumulativeMedian } from "./lib";
import { lightenColor, darkenColor, shiftColorHue, mergeConfigs } from "./exposedLib";
import { useObjectBindings } from "./useObjectBindings";

export const Arrow = defineAsyncComponent(() => import("./atoms/Arrow.vue"))
export const VueDataUi = defineAsyncComponent(() => import("./components/vue-data-ui.vue"))
export const VueUi3dBar = defineAsyncComponent(() => import("./components/vue-ui-3d-bar.vue"))
export const VueUiAccordion = defineAsyncComponent(() => import("./components/vue-ui-accordion.vue"))
export const VueUiAgePyramid = defineAsyncComponent(() => import("./components/vue-ui-age-pyramid.vue"))
export const VueUiAnnotator = defineAsyncComponent(() => import("./components/vue-ui-annotator.vue"))
export const VueUiCandlestick = defineAsyncComponent(() => import("./components/vue-ui-candlestick.vue"))
export const VueUiChestnut = defineAsyncComponent(() => import("./components/vue-ui-chestnut.vue"))
export const VueUiCursor = defineAsyncComponent(() => import("./components/vue-ui-cursor.vue"))
export const VueUiDashboard = defineAsyncComponent(() => import("./components/vue-ui-dashboard.vue"))
export const VueUiDigits = defineAsyncComponent(() => import("./components/vue-ui-digits.vue"))
export const VueUiDonut = defineAsyncComponent(() => import("./components/vue-ui-donut.vue"))
export const VueUiDonutEvolution = defineAsyncComponent(() => import("./components/vue-ui-donut-evolution.vue"))
export const VueUiDumbbell = defineAsyncComponent(() => import("./components/vue-ui-dumbbell.vue"))
export const VueUiFlow = defineAsyncComponent(() => import("./components/vue-ui-flow.vue"))
export const VueUiGalaxy = defineAsyncComponent(() => import("./components/vue-ui-galaxy.vue"))
export const VueUiGauge = defineAsyncComponent(() => import("./components/vue-ui-gauge.vue"))
export const VueUiHeatmap = defineAsyncComponent(() => import("./components/vue-ui-heatmap.vue"))
export const VueUiIcon = defineAsyncComponent(() => import("./atoms/BaseIcon.vue"))
export const VueUiKpi = defineAsyncComponent(() => import("./components/vue-ui-kpi.vue"))
export const VueUiMiniLoader = defineAsyncComponent(() => import("./components/vue-ui-mini-loader.vue"))
export const VueUiMolecule = defineAsyncComponent(() => import("./components/vue-ui-molecule.vue"))
export const VueUiMoodRadar = defineAsyncComponent(() => import("./components/vue-ui-mood-radar.vue"))
export const VueUiNestedDonuts = defineAsyncComponent(() => import("./components/vue-ui-nested-donuts.vue"))
export const VueUiOnion = defineAsyncComponent(() => import("./components/vue-ui-onion.vue"))
export const VueUiParallelCoordinatePlot = defineAsyncComponent(() => import("./components/vue-ui-parallel-coordinate-plot.vue"))
export const VueUiQuadrant = defineAsyncComponent(() => import("./components/vue-ui-quadrant.vue"))
export const VueUiQuickChart = defineAsyncComponent(() => import("./components/vue-ui-quick-chart.vue"))
export const VueUiRadar = defineAsyncComponent(() => import("./components/vue-ui-radar.vue"))
export const VueUiRating = defineAsyncComponent(() => import("./components/vue-ui-rating.vue"))
export const VueUiRelationCircle = defineAsyncComponent(() => import("./components/vue-ui-relation-circle.vue"))
export const VueUiRings = defineAsyncComponent(() => import("./components/vue-ui-rings.vue"))
export const VueUiScatter = defineAsyncComponent(() => import("./components/vue-ui-scatter.vue"))
export const VueUiSkeleton = defineAsyncComponent(() => import("./components/vue-ui-skeleton.vue"))
export const VueUiSmiley = defineAsyncComponent(() => import("./components/vue-ui-smiley.vue"))
export const VueUiSparkHistogram = defineAsyncComponent(() => import("./components/vue-ui-sparkhistogram.vue"))
export const VueUiSparkStackbar = defineAsyncComponent(() => import("./components/vue-ui-sparkstackbar.vue"))
export const VueUiSparkTrend = defineAsyncComponent(() => import("./components/vue-ui-spark-trend.vue"))
export const VueUiSparkbar = defineAsyncComponent(() => import("./components/vue-ui-sparkbar.vue"))
export const VueUiSparkgauge = defineAsyncComponent(() => import('./components/vue-ui-sparkgauge.vue'))
export const VueUiSparkline = defineAsyncComponent(() => import("./components/vue-ui-sparkline.vue"))
export const VueUiStripPlot = defineAsyncComponent(() => import("./components/vue-ui-strip-plot.vue"))
export const VueUiTable = defineAsyncComponent(() => import("./components/vue-ui-table.vue"))
export const VueUiTableHeatmap = defineAsyncComponent(() => import("./components/vue-ui-table-heatmap.vue"))
export const VueUiTableSparkline = defineAsyncComponent(() => import("./components/vue-ui-table-sparkline.vue"))
export const VueUiThermometer = defineAsyncComponent(() => import("./components/vue-ui-thermometer.vue"))
export const VueUiTimer = defineAsyncComponent(() => import("./components/vue-ui-timer.vue"))
export const VueUiTiremarks = defineAsyncComponent(() => import("./components/vue-ui-tiremarks.vue"))
export const VueUiTreemap = defineAsyncComponent(() => import("./components/vue-ui-treemap.vue"))
export const VueUiVerticalBar = defineAsyncComponent(() => import("./components/vue-ui-vertical-bar.vue"))
export const VueUiWaffle = defineAsyncComponent(() => import("./components/vue-ui-waffle.vue"))
export const VueUiWheel = defineAsyncComponent(() => import("./components/vue-ui-wheel.vue"))
export const VueUiWordCloud = defineAsyncComponent(() => import("./components/vue-ui-word-cloud.vue"))
export const VueUiXy = defineAsyncComponent(() => import("./components/vue-ui-xy.vue"))
export const VueUiXyCanvas = defineAsyncComponent(() => import("./components/vue-ui-xy-canvas.vue"))
export const VueUiCarouselTable = defineAsyncComponent(() => import('./components/vue-ui-carousel-table.vue'))
export const VueUiGizmo = defineAsyncComponent(() => import('./components/vue-ui-gizmo.vue'))
export const VueUiStackbar = defineAsyncComponent(() => import('./components/vue-ui-stackbar.vue'))
export const VueUiBullet = defineAsyncComponent(() => import('./components/vue-ui-bullet.vue'))
export const VueUiFunnel = defineAsyncComponent(() => import('./components/vue-ui-funnel.vue'))
export const VueUiHistoryPlot = defineAsyncComponent(() => import('./components/vue-ui-history-plot.vue'))
export const VueUiPattern = defineAsyncComponent(() => import('./atoms/vue-ui-pattern.vue'))
export const VueUiCirclePack = defineAsyncComponent(() => import('./components/vue-ui-circle-pack.vue'))
export const VueUiWorld = defineAsyncComponent(() => import('./components/vue-ui-world.vue'))
export const VueUiRidgeline = defineAsyncComponent(() => import('./components/vue-ui-ridgeline.vue'))
export const VueUiChord = defineAsyncComponent(() => import('./components/vue-ui-chord.vue'))
export {
    abbreviate,
    createSmoothPath,
    createStraightPath,
    createTSpans,
    createWordCloudDatasetFromPlainText,
    darkenColor,
    getCumulativeAverage,
    getCumulativeMedian,
    getPalette,
    getThemeConfig,
    getVueDataUiConfig,
    lightenColor,
    mergeConfigs,
    shiftColorHue,
    useObjectBindings
}