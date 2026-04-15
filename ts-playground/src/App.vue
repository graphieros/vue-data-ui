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
const TsVueUiGizmo = defineAsyncComponent(() => import('./components/charts/ts-vue-ui-gizmo.vue'));

const components = shallowRef([
    { name: 'VueUiXy' },
    { name: 'VueUiDonut' },
    { name: 'VueUi3dBar' },
    { name: 'VueUiAgePyramid' },
    { name: 'VueUiGizmo' }
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
    </div>
</template>

<style scoped>
.wrapper {
    width: 100vw;
    max-width: 800px;
    margin: 0 auto;
}
</style>
