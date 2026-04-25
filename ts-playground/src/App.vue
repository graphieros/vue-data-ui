<script setup lang="ts">
import { defineAsyncComponent, shallowRef } from 'vue';
const TsVueUiXy = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-xy.vue'),
);
const TsVueUiDonut = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-donut.vue'),
);
const TsVueUi3dBar = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-3d-bar.vue'),
);
const TsVueUiAgePyramid = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-age-pyramid.vue'),
);
const TsVueUiGizmo = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-gizmo.vue'),
);
const TsVueUiBullet = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-bullet.vue'),
);
const TsVueUiBump = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-bump.vue'),
);
const TsVueUiCandlestick = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-candlestick.vue'),
);
const TsVueUiCarouselTable = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-carousel-table.vue'),
);
const TsVueUiChestnut = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-chestnut.vue'),
);
const TsVueUiChord = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-chord.vue'),
);
const TsVueUiCirclePack = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-circle-pack.vue'),
);
const TsVueUiDag = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-dag.vue'),
);
const TsVueUiDashboard = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-dashboard.vue'),
);
const TsVueUiDonutEvolution = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-donut-evolution.vue'),
);
const TsVueUiDumbbell = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-dumbbell.vue'),
);
const TsVueUiFlow = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-flow.vue'),
);
const TsVueUiFunnel = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-funnel.vue'),
);
const TsVueUiGalaxy = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-galaxy.vue'),
);
const TsVueUiGauge = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-gauge.vue'),
);
const TsVueUiGeo = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-geo.vue'),
);
const TsVueUiHeatmap = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-heatmap.vue'),
);
const TsVueUiHistoryPlot = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-history-plot.vue'),
);
const TsVueUiHorizontalBar = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-horizontal-bar.vue'),
);
const TsVueUiKpi = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-kpi.vue'),
);
const TsVueUiMolecule = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-molecule.vue'),
);
const TsVueUiMoodRadar = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-mood-radar.vue'),
);
const TsVueUiNestedDonuts = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-nested-donuts.vue'),
);
const TsVueUiOnion = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-onion.vue'),
);
const TsVueUiParallelCoordinatePlot = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-parallel-coordinate-plot.vue'),
);
const TsVueUiQuadrant = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-quadrant.vue'),
);
const TsVueUiQuickChart = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-quick-chart.vue'),
);
const TsVueUiRadar = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-radar.vue'),
);
const TsVueUiRating = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-rating.vue'),
);
const TsVueUiRelationCircle = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-relation-circle.vue'),
);
const TsVueUiRidgeline = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-ridgeline.vue'),
);
const TsVueUiRings = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-rings.vue'),
);
const TsVueUiScatter = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-scatter.vue'),
);
const TsVueUiSparkbar = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-sparkbar.vue'),
);
const TsVueUiSparkgauge = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-sparkgauge.vue'),
);
const TsVueUiSparkHistogram = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-sparkhistogram.vue'),
);
const TsVueUiSparkline = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-sparkline.vue'),
);
const TsVueUiSparkstackbar = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-sparkstackbar.vue'),
);
const TsVueUiSparkTrend = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-spark-trend.vue'),
);

const components = shallowRef([
    { name: 'VueUiXy' },
    { name: 'VueUiDonut' },
    { name: 'VueUi3dBar' },
    { name: 'VueUiAgePyramid' },
    { name: 'VueUiGizmo' },
    { name: 'VueUiBullet' },
    { name: 'VueUiBump' },
    { name: 'VueUiCandlestick' },
    { name: 'VueUiCarouselTable' },
    { name: 'VueUiChestnut' },
    { name: 'VueUiChord' },
    { name: 'VueUiCirclePack' },
    { name: 'VueUiDag' },
    { name: 'VueUiDashboard' },
    { name: 'VueUiDonutEvolution' },
    { name: 'VueUiDumbbell' },
    { name: 'VueUiFlow' },
    { name: 'VueUiFunnel' },
    { name: 'VueUiGalaxy' },
    { name: 'VueUiGauge' },
    { name: 'VueUiGeo' },
    { name: 'VueUiHeatmap' },
    { name: 'VueUiHistoryPlot' },
    { name: 'VueUiHorizontalBar' },
    { name: 'VueUiKpi' },
    { name: 'VueUiMolecule' },
    { name: 'VueUiMoodRadar' },
    { name: 'VueUiNestedDonuts' },
    { name: 'VueUiOnion' },
    { name: 'VueUiParallelCoordinatePlot' },
    { name: 'VueUiQuadrant' },
    { name: 'VueUiQuickChart' },
    { name: 'VueUiRadar' },
    { name: 'VueUiRating' },
    { name: 'VueUiRelationCircle' },
    { name: 'VueUiRidgeline' },
    { name: 'VueUiRings' },
    { name: 'VueUiScatter' },
    { name: 'VueUiSparkbar' },
    { name: 'VueUiSparkgauge' },
    { name: 'VueUiSparkHistogram' },
    { name: 'VueUiSparkline' },
    { name: 'VueUiSparkstackbar' },
    { name: 'VueUiSparkTrend' },
]);

const selectedComponent = shallowRef(components.value[0]);
</script>

<template>
    <select v-model="selectedComponent">
        <option v-for="opt in components" :value="opt">{{ opt.name }}</option>
    </select>

    <div class="wrapper">
        <TsVueUiXy v-if="selectedComponent?.name === 'VueUiXy'" />
        <TsVueUiDonut v-if="selectedComponent?.name === 'VueUiDonut'" />
        <TsVueUi3dBar v-if="selectedComponent?.name === 'VueUi3dBar'" />
        <TsVueUiAgePyramid
            v-if="selectedComponent?.name === 'VueUiAgePyramid'"
        />
        <TsVueUiGizmo v-if="selectedComponent?.name === 'VueUiGizmo'" />
        <TsVueUiBullet v-if="selectedComponent?.name === 'VueUiBullet'" />
        <TsVueUiBump v-if="selectedComponent?.name === 'VueUiBump'" />
        <TsVueUiCandlestick
            v-if="selectedComponent?.name === 'VueUiCandlestick'"
        />
        <TsVueUiCarouselTable
            v-if="selectedComponent?.name === 'VueUiCarouselTable'"
        />
        <TsVueUiChestnut v-if="selectedComponent?.name === 'VueUiChestnut'" />
        <TsVueUiChord v-if="selectedComponent?.name === 'VueUiChord'" />
        <TsVueUiCirclePack
            v-if="selectedComponent?.name === 'VueUiCirclePack'"
        />
        <TsVueUiDag v-if="selectedComponent?.name === 'VueUiDag'" />
        <TsVueUiDashboard v-if="selectedComponent?.name === 'VueUiDashboard'" />
        <TsVueUiDonutEvolution
            v-if="selectedComponent?.name === 'VueUiDonutEvolution'"
        />
        <TsVueUiDumbbell v-if="selectedComponent?.name === 'VueUiDumbbell'" />
        <TsVueUiFlow v-if="selectedComponent?.name === 'VueUiFlow'" />
        <TsVueUiFunnel v-if="selectedComponent?.name === 'VueUiFunnel'" />
        <TsVueUiGalaxy v-if="selectedComponent?.name === 'VueUiGalaxy'" />
        <TsVueUiGauge v-if="selectedComponent?.name === 'VueUiGauge'" />
        <TsVueUiGeo v-if="selectedComponent?.name === 'VueUiGeo'" />
        <TsVueUiHeatmap v-if="selectedComponent?.name === 'VueUiHeatmap'" />
        <TsVueUiHistoryPlot
            v-if="selectedComponent?.name === 'VueUiHistoryPlot'"
        />
        <TsVueUiHorizontalBar
            v-if="selectedComponent?.name === 'VueUiHorizontalBar'"
        />
        <TsVueUiKpi v-if="selectedComponent?.name === 'VueUiKpi'" />
        <TsVueUiMolecule v-if="selectedComponent?.name === 'VueUiMolecule'" />
        <TsVueUiMoodRadar v-if="selectedComponent?.name === 'VueUiMoodRadar'" />
        <TsVueUiNestedDonuts
            v-if="selectedComponent?.name === 'VueUiNestedDonuts'"
        />
        <TsVueUiOnion v-if="selectedComponent?.name === 'VueUiOnion'" />
        <TsVueUiParallelCoordinatePlot
            v-if="selectedComponent?.name === 'VueUiParallelCoordinatePlot'"
        />
        <TsVueUiQuadrant v-if="selectedComponent?.name === 'VueUiQuadrant'" />
        <TsVueUiQuickChart
            v-if="selectedComponent?.name === 'VueUiQuickChart'"
        />
        <TsVueUiRadar v-if="selectedComponent?.name === 'VueUiRadar'" />
        <TsVueUiRating v-if="selectedComponent?.name === 'VueUiRating'" />
        <TsVueUiRelationCircle
            v-if="selectedComponent?.name === 'VueUiRelationCircle'"
        />
        <TsVueUiRidgeline v-if="selectedComponent?.name === 'VueUiRidgeline'" />
        <TsVueUiRings v-if="selectedComponent?.name === 'VueUiRings'" />
        <TsVueUiScatter v-if="selectedComponent?.name === 'VueUiScatter'" />
        <TsVueUiSparkbar v-if="selectedComponent?.name === 'VueUiSparkbar'" />
        <TsVueUiSparkgauge
            v-if="selectedComponent?.name === 'VueUiSparkgauge'"
        />
        <TsVueUiSparkHistogram
            v-if="selectedComponent?.name === 'VueUiSparkHistogram'"
        />
        <TsVueUiSparkline v-if="selectedComponent?.name === 'VueUiSparkline'" />
        <TsVueUiSparkstackbar
            v-if="selectedComponent?.name === 'VueUiSparkstackbar'"
        />
        <TsVueUiSparkTrend
            v-if="selectedComponent?.name === 'VueUiSparkTrend'"
        />
    </div>
</template>

<style scoped>
.wrapper {
    width: 100vw;
    max-width: 800px;
    margin: 0 auto;
}
</style>
