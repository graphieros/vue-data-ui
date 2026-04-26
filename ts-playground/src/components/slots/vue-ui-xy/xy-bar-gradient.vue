<script setup lang="ts">
import type { VueUiXyBarGradientSlotProps } from 'vue-data-ui/vue-ui-xy';

const props = defineProps<{
    series: VueUiXyBarGradientSlotProps['series'];
    positiveId: VueUiXyBarGradientSlotProps['positiveId'];
    negativeId: VueUiXyBarGradientSlotProps['negativeId'];
}>();
</script>

<template>
    <linearGradient :id="positiveId" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" :stop-color="series.color" />
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
    </linearGradient>
    <linearGradient :id="negativeId" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0" />
        <stop offset="100%" :stop-color="series.color" />
    </linearGradient>
</template>
