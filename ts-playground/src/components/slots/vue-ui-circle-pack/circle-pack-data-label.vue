<script setup lang="ts">
import type { VueUiCirclePackDataLabelSlotProps } from 'vue-data-ui/vue-ui-circle-pack';

const props = defineProps<{
    label: VueUiCirclePackDataLabelSlotProps;
}>();
</script>

<template>
    <text
        :x="label.x"
        :y="label.y"
        fill="#1A1A1A"
        :font-size="label.fontSize.name"
        text-anchor="middle"
        dominant-baseline="middle"
    >
        {{ label.name }}
    </text>
</template>
