<script setup lang="ts">
import { computed } from 'vue';
import type { VueUiGeoDatapointSlotProps } from 'vue-data-ui/vue-ui-geo';

const props = defineProps<{
    highlighted: VueUiGeoDatapointSlotProps['highlighted'];
    onPointClick: VueUiGeoDatapointSlotProps['onPointClick'];
    onPointEnter: VueUiGeoDatapointSlotProps['onPointEnter'];
    onPointLeave: VueUiGeoDatapointSlotProps['onPointLeave'];
    point: VueUiGeoDatapointSlotProps['point'];
}>();

const radius = computed(() =>
    props.highlighted ? props.point.radius * 1.2 : props.point.radius,
);
</script>

<template>
    <rect
        :x="point.x - radius"
        :y="point.y - radius"
        :width="radius * 2"
        :height="radius * 2"
        :fill="point.fill"
        :rx="radius / 6"
        @mouseenter="() => onPointEnter(point)"
        @click="() => onPointClick(point)"
        @mouseleave="onPointLeave"
        :style="{
            transition: 'all 0.2s',
        }"
    />
    <rect
        :x="point.x - radius * 0.8"
        :y="point.y - radius * 0.8"
        :width="radius * 0.8 * 2"
        :height="radius * 0.8 * 2"
        fill="none"
        stroke="#FFFFFF"
        stroke-width="0.05"
        :rx="(radius * 0.8) / 10"
        :style="{
            transition: 'all 0.2s',
            pointerEvents: 'none',
        }"
    />
</template>
