<script setup lang="ts">
import type { VueUiBumpTimeLabelSlotProps } from 'vue-data-ui/vue-ui-bump';

const props = defineProps<{
    absoluteIndex: VueUiBumpTimeLabelSlotProps['absoluteIndex'];
    content: VueUiBumpTimeLabelSlotProps['content'];
    fill: VueUiBumpTimeLabelSlotProps['fill'];
    fontSize: VueUiBumpTimeLabelSlotProps['fontSize'];
    show: VueUiBumpTimeLabelSlotProps['show'];
    textAnchor: VueUiBumpTimeLabelSlotProps['textAnchor'];
    transform: VueUiBumpTimeLabelSlotProps['transform'];
    x: VueUiBumpTimeLabelSlotProps['x'];
    y: VueUiBumpTimeLabelSlotProps['y'];
}>();
</script>

<template>
    <text
        :x="x"
        :y="y"
        :fill="fill"
        :text-anchor="textAnchor"
        :font-size="fontSize"
    >
        {{ content }}
    </text>
    <text
        :x="x"
        :y="y + fontSize"
        fill="chocolate"
        :text-anchor="textAnchor"
        :font-size="fontSize * 0.6"
    >
        #time-label
    </text>
</template>
