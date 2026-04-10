<script setup lang="ts">
import type { VueUiXyAreaGradientSlotProps } from 'vue-data-ui';

const props = defineProps<{
    series: VueUiXyAreaGradientSlotProps['series'];
    id: VueUiXyAreaGradientSlotProps['id'];
}>();
</script>

<template>
    <linearGradient :id="id" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" :stop-color="series.color" />
        <stop offset="100%" stop-color="transparent" stop-opacity="0" />
    </linearGradient>
</template>
