<script setup lang="ts">
import type { VueUiWaffleSvgSlotProps } from 'vue-data-ui/vue-ui-waffle';

const props = defineProps<{
    svg: VueUiWaffleSvgSlotProps['svg'];
}>();
</script>

<template>
    <g style="pointer-events: none">
        <circle
            :cx="svg.width / 2"
            :cy="svg.height / 2"
            :r="30"
            fill="chocolate"
            opacity="0.7"
        />
        <text
            :x="svg.width / 2"
            :y="svg.height / 2"
            fill="white"
            font-size="12"
            text-anchor="middle"
            dominant-baseline="middle"
        >
            #svg
        </text>
    </g>
</template>
