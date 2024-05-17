<script setup>
import { ref } from "vue";
import TestingArena from "./TestingArena.vue";
import ArenaVueUiXy from "../TestingArena/ArenaVueUiXy.vue";
import ArenaVueUiDonut from "../TestingArena/ArenaVueUiDonut.vue";

const showOldArena = ref(false);

const components = ref([
  "VueUiXy",
  "VueUiDonut"
]);

const selectedComponent = ref(components.value[0]);

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
</template>