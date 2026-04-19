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
    </div>
</template>

<style scoped>
.wrapper {
    width: 100vw;
    max-width: 800px;
    margin: 0 auto;
}
</style>
