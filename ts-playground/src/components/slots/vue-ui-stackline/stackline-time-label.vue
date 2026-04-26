<script setup lang="ts">
import type { VueUiStacklineTimeLabelSlotProps } from 'vue-data-ui/vue-ui-stackline';

const props = withDefaults(
    defineProps<{
        x: VueUiStacklineTimeLabelSlotProps['x'];
        y: VueUiStacklineTimeLabelSlotProps['y'];
        fontSize: VueUiStacklineTimeLabelSlotProps['fontSize'];
        fill: VueUiStacklineTimeLabelSlotProps['fill'];
        transform: VueUiStacklineTimeLabelSlotProps['transform'];
        absoluteIndex: VueUiStacklineTimeLabelSlotProps['absoluteIndex'];
        content: VueUiStacklineTimeLabelSlotProps['content'];
        textAnchor: VueUiStacklineTimeLabelSlotProps['textAnchor'];
        show: VueUiStacklineTimeLabelSlotProps['show'];

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
