<script setup>
import XyRenderLayer from './XyRenderLayer.vue';

// Share the template without sharing reactive dependencies between label types.
const types = ['bar', 'plot', 'line'];
</script>

<template>
    <XyRenderLayer v-for="type in types" :key="type">
        <slot :type />
    </XyRenderLayer>
</template>
