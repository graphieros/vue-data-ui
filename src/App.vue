<script setup>
import { ref } from "vue";
import TestingArena from "./TestingArena.vue";
import ArenaVueUiXy from "../TestingArena/ArenaVueUiXy.vue";
import ArenaVueUiDonut from "../TestingArena/ArenaVueUiDonut.vue";
import ArenaVueUiTreemap from "../TestingArena/ArenaVueUiTreemap.vue";
import ArenaVueUiWaffle from "../TestingArena/ArenaVueUiWaffle.vue";
import ArenaVueUiRadar from "../TestingArena/ArenaVueUiRadar.vue";
import ArenaVueUiQuadrant from "../TestingArena/ArenaVueUiQuadrant.vue";
import ArenaVueUiGauge from "../TestingArena/ArenaVueUiGauge.vue";
import ArenaVueUiWheel from "../TestingArena/ArenaVueUiWheel.vue";
import ArenaVueUiTiremarks from "../TestingArena/ArenaVueUiTiremarks.vue";
import ArenaVueUiChestnut from "../TestingArena/ArenaVueUiChestnut.vue";
import ArenaVueUiOnion from "../TestingArena/ArenaVueUiOnion.vue";
import ArenaVueUiVerticalBar from "../TestingArena/ArenaVueUiVerticalBar.vue";
import ArenaVueUiHeatmap from "../TestingArena/ArenaVueUiHeatmap.vue";
import ArenaVueUiScatter from "../TestingArena/ArenaVueUiScatter.vue";
import ArenaVueUiCandlestick from "../TestingArena/ArenaVueUiCandlestick.vue";
import ArenaVueUiSparkline from "../TestingArena/ArenaVueUiSparkline.vue";
import ArenaVueUiSparkbar from "../TestingArena/ArenaVueUiSparkbar.vue";
import ArenaVueUiSparkStackbar from "../TestingArena/ArenaVueUiSparkStackbar.vue";
import ArenaVueUiSparkHistogram from "../TestingArena/ArenaVueUiSparkHistogram.vue";
import ArenaVueUiSparkGauge from "../TestingArena/ArenaVueUiSparkGauge.vue";
import ArenaVueUiSparkTrend from "../TestingArena/ArenaVueUiSparkTrend.vue";
import ArenaVueUiQuickChart from "../TestingArena/ArenaVueUiQuickChart.vue";
import ArenaVueUiAgePyramid from "../TestingArena/ArenaVueUiAgePyramid.vue";
import ArenaVueUiRelationCircle from "../TestingArena/ArenaVueUiRelationCircle.vue";
import ArenaVueUiThermometer from "../TestingArena/ArenaVueUiThermometer.vue";
import ArenaVueUiRings from "../TestingArena/ArenaVueUiRings.vue";
import ArenaVueUiDonutEvolution from "../TestingArena/ArenaVueUiDonutEvolution.vue";
import ArenaVueUiIcon from "../TestingArena/ArenaVueUiIcon.vue";
import ArenaVueUiMoodRadar from "../TestingArena/ArenaVueUiMoodRadar.vue";
import ArenaVueUiMolecule from "../TestingArena/ArenaVueUiMolecule.vue";
import ArenaVueUiNestedDonuts from "../TestingArena/ArenaVueUiNestedDonuts.vue";
import ArenaVueUiGalaxy from "../TestingArena/ArenaVueUiGalaxy.vue";
import ArenaVueUiStripPlot from "../TestingArena/ArenaVueUiStripPlot.vue";
import ArenaVueUiDumbbell from "../TestingArena/ArenaVueUiDumbbell.vue";
import ArenaVueUi3dBar from "../TestingArena/ArenaVueUi3dBar.vue";
import ArenaVueUiTableSparkline from "../TestingArena/ArenaVueUiTableSparkline.vue";
import ArenaVueUiTableHeatmap from "../TestingArena/ArenaVueUiTableHeatmap.vue";
import ArenaVueUiWordCloud from "../TestingArena/ArenaVueUiWordCloud.vue";
import ArenaVueUiXyCanvas from "../TestingArena/ArenaVueUiXyCanvas.vue";
import ArenaVueUiFlow from "../TestingArena/ArenaVueUiFlow.vue";
import ArenaVueUiParallelCoordinatePlot from "../TestingArena/ArenaVueUiParallelCoordinatePlot.vue";
import ArenaVueUiTimer from "../TestingArena/ArenaVueUiTimer.vue";
import ArenaVueUiCarouselTable from "../TestingArena/ArenaVueUiCarouselTable.vue";
import ArenaVueUiGizmo from "../TestingArena/ArenaVueUiGizmo.vue";
import ArenaVueUiKpi from "../TestingArena/ArenaVueUiKpi.vue";
import ArenaVueUiStackbar from "../TestingArena/ArenaVueUiStackbar.vue";
import ArenaVueUiRating from "../TestingArena/ArenaVueUiRating.vue";
import ArenaVueUiSmiley from "../TestingArena/ArenaVueUiSmiley.vue";
import ArenaVueUiBullet from "../TestingArena/ArenaVueUiBullet.vue";
import ArenaVueUiFunnel from "../TestingArena/ArenaVueUiFunnel.vue";
import ArenaVueUiHistoryPlot from "../TestingArena/ArenaVueUiHistoryPlot.vue";
import ArenaVueUiCirclePack from "../TestingArena/ArenaVueUiCirclePack.vue";
import ArenaVueUiWorld from "../TestingArena/ArenaVueUiWorld.vue";
import ArenaVueUiTable from "../TestingArena/ArenaVueUiTable.vue";
import ArenaVueUiRidgeline from "../TestingArena/ArenaVueUiRidgeline.vue";

const components = ref([             //------|
  /*____________________*/"VueUiXy", //  0
  /*_________________*/"VueUiDonut", //  1
  /*_______________*/"VueUiTreemap", //  2
  /*________________*/"VueUiWaffle", //  3
  /*_________________*/"VueUiRadar", //  4
  /*______________*/"VueUiQuadrant", //  5
  /*_________________*/"VueUiGauge", //  6
  /*_________________*/"VueUiWheel", //  7
  /*_____________*/"VueUiTiremarks", //  8
  /*______________*/"VueUiChestnut", //  9
  /*_________________*/"VueUiOnion", // 10
  /*___________*/"VueUiVerticalBar", // 11
  /*_______________*/"VueUiHeatmap", // 12
  /*_______________*/"VueUiScatter", // 13
  /*___________*/"VueUiCandlestick", // 14
  /*_____________*/"VueUiSparkline", // 15
  /*______________*/"VueUiSparkbar", // 16
  /*_________*/"VueUiSparkStackbar", // 17
  /*________*/"VueUiSparkHistogram", // 18
  /*____________*/"VueUiSparkgauge", // 19
  /*____________*/"VueUiSparkTrend", // 20
  /*____________*/"VueUiQuickChart", // 21
  /*____________*/"VueUiAgePyramid", // 22
  /*________*/"VueUiRelationCircle", // 23
  /*___________*/"VueUiThermometer", // 24
  /*_________________*/"VueUiRings", // 25
  /*________*/"VueUiDonutEvolution", // 26
  /*__________________*/"VueUiIcon", // 27
  /*_____________*/"VueUiMoodRadar", // 28
  /*______________*/"VueUiMolecule", // 29
  /*__________*/"VueUiNestedDonuts", // 30
  /*________________*/"VueUiGalaxy", // 31
  /*_____________*/"VueUiStripPlot", // 32
  /*______________*/"VueUiDumbbell", // 33
  /*_________________*/"VueUi3dBar", // 34
  /*________*/"VueUiTableSparkline", // 35
  /*__________*/"VueUiTableHeatmap", // 36
  /*____________ */"VueUiWordCloud", // 37
  /*______________*/"VueUiXyCanvas", // 38
  /*__________________*/"VueUiFlow", // 39
  /**/"VueUiParallelCoordinatePlot", // 40
  /*_________________*/"VueUiTimer", // 41
  /*_________*/"VueUiCarouselTable", // 42
  /*_________________*/"VueUiGizmo", // 43
  /*___________________*/"VueUiKpi", // 44
  /*______________*/"VueUiStackbar", // 45
  /*________________*/"VueUiRating", // 46
  /*________________*/"VueUiSmiley", // 47
  /*________________*/"VueUiBullet", // 48
  /*________________*/"VueUiFunnel", // 49
  /*___________*/"VueUiHistoryPlot", // 50
  /*____________*/"VueUiCirclePack", // 51
  /*_________________*/"VueUiWorld", // 52
  /*_________________*/"VueUiTable", // 53
  /*_____________*/"VueUiRidgeline", // 54

  /**
   * TODO: migrate manual testing for the following:
   * - VueUiDashboard
   * - VueUiCursor
   */
]);

/**
 * Modify the index to display a component
 * [0] = VueUiXy 
 */
 const selectedComponent = ref(components.value[37]);

/**
 * Legacy testing arena where some non chart components can be tested
 */
const showOldArena = ref(false);

</script>

<template>
  <div>
    <select v-model="selectedComponent">
      <option v-for="c in components">
        {{ c }}
      </option>
    </select>
  </div>

  <TestingArena v-if="showOldArena"/>

  <!--  0 -->
  <ArenaVueUiXy v-if="selectedComponent === 'VueUiXy'"/>

  <!--  1 -->
  <ArenaVueUiDonut v-if="selectedComponent === 'VueUiDonut'"/>

  <!--  2 -->
  <ArenaVueUiTreemap v-if="selectedComponent === 'VueUiTreemap'" />

  <!--  3 -->
  <ArenaVueUiWaffle v-if="selectedComponent === 'VueUiWaffle'" />

  <!--  4 -->
  <ArenaVueUiRadar v-if="selectedComponent === 'VueUiRadar'" />

  <!--  5 -->
  <ArenaVueUiQuadrant v-if="selectedComponent === 'VueUiQuadrant'" />

  <!--  6 -->
  <ArenaVueUiGauge v-if="selectedComponent === 'VueUiGauge'" />

  <!--  7 -->
  <ArenaVueUiWheel v-if="selectedComponent === 'VueUiWheel'" />

  <!--  8 -->
  <ArenaVueUiTiremarks v-if="selectedComponent === 'VueUiTiremarks'" />

  <!--  9 -->
  <ArenaVueUiChestnut v-if="selectedComponent === 'VueUiChestnut'" />

  <!-- 10 -->
  <ArenaVueUiOnion v-if="selectedComponent === 'VueUiOnion'" />

  <!-- 11 -->
  <ArenaVueUiVerticalBar v-if="selectedComponent === 'VueUiVerticalBar'" />

  <!-- 12 -->
  <ArenaVueUiHeatmap v-if="selectedComponent === 'VueUiHeatmap'" />

  <!-- 13 -->
  <ArenaVueUiScatter v-if="selectedComponent === 'VueUiScatter'" />

  <!-- 14 -->
  <ArenaVueUiCandlestick v-if="selectedComponent === 'VueUiCandlestick'" />

  <!-- 15 -->
  <ArenaVueUiSparkline v-if="selectedComponent === 'VueUiSparkline'" />

  <!-- 16 -->
  <ArenaVueUiSparkbar v-if="selectedComponent === 'VueUiSparkbar'" />

  <!-- 17 -->
  <ArenaVueUiSparkStackbar v-if="selectedComponent === 'VueUiSparkStackbar'" />

  <!-- 18 -->
  <ArenaVueUiSparkHistogram v-if="selectedComponent === 'VueUiSparkHistogram'" />

  <!-- 19 -->
  <ArenaVueUiSparkGauge v-if="selectedComponent === 'VueUiSparkgauge'" />

  <!-- 20 -->
  <ArenaVueUiSparkTrend v-if="selectedComponent === 'VueUiSparkTrend'" />

  <!-- 21 -->
  <ArenaVueUiQuickChart v-if="selectedComponent === 'VueUiQuickChart'" />

  <!-- 22 -->
  <ArenaVueUiAgePyramid v-if="selectedComponent === 'VueUiAgePyramid'" />

  <!-- 23 -->
  <ArenaVueUiRelationCircle v-if="selectedComponent === 'VueUiRelationCircle'" />

  <!-- 24 -->
  <ArenaVueUiThermometer v-if="selectedComponent === 'VueUiThermometer'" />

  <!-- 25 -->
  <ArenaVueUiRings v-if="selectedComponent === 'VueUiRings'" />

  <!-- 26 -->
  <ArenaVueUiDonutEvolution v-if="selectedComponent === 'VueUiDonutEvolution'" />

  <!-- 27 -->
  <ArenaVueUiIcon v-if="selectedComponent === 'VueUiIcon'" />

  <!-- 28 -->
  <ArenaVueUiMoodRadar v-if="selectedComponent === 'VueUiMoodRadar'" />

  <!-- 29 -->
  <ArenaVueUiMolecule v-if="selectedComponent === 'VueUiMolecule'" />

  <!-- 30 -->
  <ArenaVueUiNestedDonuts v-if="selectedComponent === 'VueUiNestedDonuts'" />

  <!-- 31 -->
  <ArenaVueUiGalaxy v-if="selectedComponent === 'VueUiGalaxy'" />

  <!-- 32 -->
  <ArenaVueUiStripPlot v-if="selectedComponent === 'VueUiStripPlot'" />

  <!-- 33 -->
  <ArenaVueUiDumbbell v-if="selectedComponent === 'VueUiDumbbell'" />

  <!-- 34 -->
  <ArenaVueUi3dBar v-if="selectedComponent === 'VueUi3dBar'" />

  <!-- 35 -->
  <ArenaVueUiTableSparkline v-if="selectedComponent === 'VueUiTableSparkline'" />

  <!-- 36 -->
  <ArenaVueUiTableHeatmap v-if="selectedComponent === 'VueUiTableHeatmap'" />

  <!-- 37 -->
  <ArenaVueUiWordCloud v-if="selectedComponent === 'VueUiWordCloud'" />

  <!-- 38 -->
  <ArenaVueUiXyCanvas v-if="selectedComponent === 'VueUiXyCanvas'" />

  <!-- 39 -->
  <ArenaVueUiFlow v-if="selectedComponent === 'VueUiFlow'" />

  <!-- 40 -->
  <ArenaVueUiParallelCoordinatePlot v-if="selectedComponent === 'VueUiParallelCoordinatePlot'" />

  <!-- 41 -->
  <ArenaVueUiTimer v-if="selectedComponent === 'VueUiTimer'" />

  <!-- 42 -->
  <ArenaVueUiCarouselTable v-if="selectedComponent === 'VueUiCarouselTable'" />

  <!-- 43 -->
  <ArenaVueUiGizmo v-if="selectedComponent === 'VueUiGizmo'" />

  <!-- 44 -->
  <ArenaVueUiKpi v-if="selectedComponent === 'VueUiKpi'" />

  <!-- 45 -->
  <ArenaVueUiStackbar v-if="selectedComponent === 'VueUiStackbar'" />

  <!-- 46 -->
  <ArenaVueUiRating v-if="selectedComponent === 'VueUiRating'" />

  <!-- 47 -->
  <ArenaVueUiSmiley v-if="selectedComponent === 'VueUiSmiley'" />

  <!-- 48 -->
  <ArenaVueUiBullet v-if="selectedComponent === 'VueUiBullet'" />

  <!-- 49 -->
  <ArenaVueUiFunnel v-if="selectedComponent === 'VueUiFunnel'" />

  <!-- 50 -->
  <ArenaVueUiHistoryPlot v-if="selectedComponent === 'VueUiHistoryPlot'" />

  <!-- 51 -->
  <ArenaVueUiCirclePack v-if="selectedComponent === 'VueUiCirclePack'" />

  <!-- 52 -->
  <ArenaVueUiWorld v-if="selectedComponent === 'VueUiWorld'" />

  <!-- 53 -->
  <ArenaVueUiTable v-if="selectedComponent === 'VueUiTable'" />

  <!-- 54 -->
  <ArenaVueUiRidgeline v-if="selectedComponent === 'VueUiRidgeline'" />

  <!-- Add testing arena for new components here -->
</template>