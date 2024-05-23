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

const showOldArena = ref(false);

const components = ref([
  /*____________*/"VueUiXy", //  0
  /*_________*/"VueUiDonut", //  1
  /*_______*/"VueUiTreemap", //  2
  /*________*/"VueUiWaffle", //  3
  /*_________*/"VueUiRadar", //  4
  /*______*/"VueUiQuadrant", //  5
  /*_________*/"VueUiGauge", //  6
  /*_________*/"VueUiWheel", //  7
  /*_____*/"VueUiTiremarks", //  8
  /*______*/"VueUiChestnut", //  9
  /*_________*/"VueUiOnion", // 10
  /*___*/"VueUiVerticalBar", // 11
  /*_______*/"VueUiHeatmap", // 12
  /*_______*/"VueUiScatter", // 13
  /*___*/"VueUiCandlestick", // 14
  /*_____*/"VueUiSparkline", // 15
  /*______*/"VueUiSparkbar", // 16
  /*_*/"VueUiSparkStackbar", // 17
  /**/"VueUiSparkHistogram", // 18
  /*____*/"VueUiSparkgauge", // 19
  /*____*/"VueUiSparkTrend", // 20
  /*____*/"VueUiQuickChart", // 21
  /*____*/"VueUiAgePyramid", // 22
  /**/"VueUiRelationCircle", // 23
  /*___*/"VueUiThermometer", // 24
  /*_________*/"VueUiRings", // 25
  /**/"VueUiDonutEvolution", // 26
  /*__________*/"VueUiIcon", // 27
  /*_____*/"VueUiMoodRadar", // 28
  /*______*/"VueUiMolecule", // 29
  /*__*/"VueUiNestedDonuts", // 30
  /*________*/"VueUiGalaxy", // 31
  /*_____*/"VueUiStripPlot", // 32
  /*______*/"VueUiDumbbell", // 33
  /*_________*/"VueUi3dBar", // 34
  /**/"VueUiTableSparkline", // 35
  /*__*/"VueUiTableHeatmap"  // 36
]);

const selectedComponent = ref(components.value[26]);

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
</template>