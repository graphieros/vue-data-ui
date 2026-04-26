<script setup lang="ts">
import type { VueUiBulletSvgSlotProps } from 'vue-data-ui/vue-ui-bullet';

const props = defineProps<{
    svg: VueUiBulletSvgSlotProps['svg'];
}>();
</script>

<template>
    <circle
        :cx="svg.width / 2"
        :cy="svg.height / 2"
        :r="56"
        fill="chocolate"
        opacity="0.3"
    />
    <text
        :x="svg.width / 2"
        :y="svg.height / 2 - 40"
        fill="chocolate"
        font-size="12"
        text-anchor="middle"
    >
        #svg
    </text>
</template>
