<script setup lang="ts">
import type { VueUiXyPlotCommentSlotProps } from 'vue-data-ui/vue-ui-xy';

const props = defineProps<{
    plot: VueUiXyPlotCommentSlotProps['plot'];
    color: VueUiXyPlotCommentSlotProps['color'];
    seriesIndex: VueUiXyPlotCommentSlotProps['seriesIndex'];
    datapointIndex: VueUiXyPlotCommentSlotProps['datapointIndex'];
}>();
</script>

<template>
    <div style="width: 100%; text-align: center; border: 1px solid chocolate">
        <code style="color: chocolate">#plot-comment</code>
        <br />
        {{ plot.comment }}
    </div>
</template>
