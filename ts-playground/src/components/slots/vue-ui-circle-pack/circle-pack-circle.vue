<script setup lang="ts">
import type { VueUiCirclePackCircleSlotProps } from 'vue-data-ui/vue-ui-circle-pack';

const props = defineProps<{
    circle: VueUiCirclePackCircleSlotProps;
}>();
</script>

<template>
    <rect
        :x="circle.x"
        :y="circle.y"
        :width="circle.r"
        :height="circle.r"
        :fill="circle.color"
    />
    <text
        :x="circle.x + circle.r / 2"
        :y="circle.y + circle.r / 2"
        fill="chocolate"
        :font-size="12"
        text-anchor="middle"
        dominant-baseline="middle"
    >
        #circle
    </text>
</template>
