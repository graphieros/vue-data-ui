<script setup lang="ts">
import { defineAsyncComponent, shallowRef } from 'vue';
const TsVueUiXy = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-xy.vue'),
);
const TsVueUiDonut = defineAsyncComponent(
    () => import('./components/charts/ts-vue-ui-donut.vue'),
);

const components = shallowRef([{ name: 'VueUiXy' }, { name: 'VueUiDonut' }]);

const selectedComponent = shallowRef(components.value[0]);
</script>

<template>
    <select v-model="selectedComponent">
        <option v-for="opt in components" :value="opt">{{ opt.name }}</option>
    </select>

    <div class="wrapper">
        <TsVueUiXy v-if="selectedComponent?.name === 'VueUiXy'" />
        <TsVueUiDonut v-if="selectedComponent?.name === 'VueUiDonut'" />
    </div>
</template>

<style scoped>
.wrapper {
    width: 100vw;
    max-width: 800px;
    margin: 0 auto;
}
</style>
