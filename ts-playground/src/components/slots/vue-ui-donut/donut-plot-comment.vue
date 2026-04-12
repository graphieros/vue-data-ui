<script setup lang="ts">
import type { VueUiDonutPlotCommentSlotProps } from 'vue-data-ui';
const props = defineProps<{
    plot: VueUiDonutPlotCommentSlotProps;
}>();
</script>

<template>
    <div style="font-size: 0.6rem">
        <code style="color: chocolate"> #plot-comment </code>
        {{ plot.comment }}
    </div>
</template>
