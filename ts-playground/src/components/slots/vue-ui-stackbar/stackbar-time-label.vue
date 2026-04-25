<script setup lang="ts">
import type { VueUiStackbarTimeLabelSlotProps } from 'vue-data-ui/vue-ui-stackbar';

const props = withDefaults(
    defineProps<{
        x: VueUiStackbarTimeLabelSlotProps['x'];
        y: VueUiStackbarTimeLabelSlotProps['y'];
        fontSize: VueUiStackbarTimeLabelSlotProps['fontSize'];
        fill: VueUiStackbarTimeLabelSlotProps['fill'];
        transform: VueUiStackbarTimeLabelSlotProps['transform'];
        absoluteIndex: VueUiStackbarTimeLabelSlotProps['absoluteIndex'];
        content: VueUiStackbarTimeLabelSlotProps['content'];
        textAnchor: VueUiStackbarTimeLabelSlotProps['textAnchor'];
        show: VueUiStackbarTimeLabelSlotProps['show'];

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
