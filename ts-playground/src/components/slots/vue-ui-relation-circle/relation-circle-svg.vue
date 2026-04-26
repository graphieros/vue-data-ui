<script setup lang="ts">
import type { VueUiRelationCircleSvgSlotProps } from 'vue-data-ui/vue-ui-relation-circle';

const props = defineProps<{
    svg: VueUiRelationCircleSvgSlotProps['svg'];
}>();
</script>

<template>
    <circle
        :cx="svg.width / 2"
        :cy="svg.height / 2"
        :r="30"
        fill="chocolate"
        opacity="0.3"
    />
    <text
        :x="svg.width / 2"
        :y="svg.height / 2"
        fill="chocolate"
        font-size="12"
        text-anchor="middle"
        dominant-baseline="middle"
    >
        #svg
    </text>
</template>
