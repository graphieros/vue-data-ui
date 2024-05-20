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
]);

const selectedComponent = ref(components.value[15]);

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
</template>