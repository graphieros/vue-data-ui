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

const showOldArena = ref(false);

const components = ref([
  "VueUiXy",
  "VueUiDonut",
  "VueUiTreemap",
  "VueUiWaffle",
  "VueUiRadar",
  "VueUiQuadrant",
  "VueUiGauge",
  "VueUiWheel",
  "VueUiTiremarks",
  "VueUiChestnut",
  "VueUiOnion",
  "VueUiVerticalBar",
  "VueUiHeatmap",
  "VueUiScatter",
  "VueUiCandlestick",
  "VueUiSparkline",
  "VueUiSparkbar",
  "VueUiSparkStackbar",
  "VueUiSparkHistogram",
  "VueUiSparkgauge",
  "VueUiSparkTrend",
  "VueUiQuickChart",
  "VueUiAgePyramid",
  "VueUiRelationCircle",
  "VueUiThermometer",
  "VueUiRings",
  "VueUiDonutEvolution",
  "VueUiIcon",
  "VueUiMoodRadar",
  "VueUiMolecule",
  "VueUiNestedDonuts",
  "VueUiGalaxy",
  "VueUiStripPlot"
]);

const selectedComponent = ref(components.value[32]);

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
</template>