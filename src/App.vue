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

const showOldArena = ref(false);

const components = ref([
  "VueUiXy",
  "VueUiDonut",
  "VueUiTreemap",
  "VueUiWaffle",
  "VueUiRadar",
  "VueUiQuadrant",
  "VueUiGauge",
  "VueUiWheel"
]);

const selectedComponent = ref(components.value[7]);

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
  <ArenaVueUiXy v-if="selectedComponent === 'VueUiXy'"/>
  <ArenaVueUiDonut v-if="selectedComponent === 'VueUiDonut'"/>
  <ArenaVueUiTreemap v-if="selectedComponent === 'VueUiTreemap'" />
  <ArenaVueUiWaffle v-if="selectedComponent === 'VueUiWaffle'" />
  <ArenaVueUiRadar v-if="selectedComponent === 'VueUiRadar'" />
  <ArenaVueUiQuadrant v-if="selectedComponent === 'VueUiQuadrant'" />
  <ArenaVueUiGauge v-if="selectedComponent === 'VueUiGauge'" />
  <ArenaVueUiWheel v-if="selectedComponent === 'VueUiWheel'" />
</template>