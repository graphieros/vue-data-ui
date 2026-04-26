<script setup lang="ts">
import type { VueUiXyTimeLabelSlotProps } from 'vue-data-ui/vue-ui-xy';

const props = withDefaults(
    defineProps<{
        x: VueUiXyTimeLabelSlotProps['x'];
        y: VueUiXyTimeLabelSlotProps['y'];
        fontSize: VueUiXyTimeLabelSlotProps['fontSize'];
        fill: VueUiXyTimeLabelSlotProps['fill'];
        transform: VueUiXyTimeLabelSlotProps['transform'];
        absoluteIndex: VueUiXyTimeLabelSlotProps['absoluteIndex'];
        content: VueUiXyTimeLabelSlotProps['content'];
        textAnchor: VueUiXyTimeLabelSlotProps['textAnchor'];
        show: VueUiXyTimeLabelSlotProps['show'];

        // additional custom props
        offsetY?: number;
    }>(),
    {
        offsetY: 0,
    },
);
</script>

<template>
    <text
        v-if="show"
        :x
        :y="y + offsetY"
        :font-size="fontSize"
        :fill
        :text-anchor="textAnchor"
    >
        #time-label - {{ content }}
    </text>
</template>
