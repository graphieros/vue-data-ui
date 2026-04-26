<script setup lang="ts">
import type { VueUiDagOptionZoomSlotProps } from 'vue-data-ui/vue-ui-dag';
const props = defineProps<{
    toggleZoom: VueUiDagOptionZoomSlotProps['toggleZoom'];
    isZoomLocked: VueUiDagOptionZoomSlotProps['isZoomLocked'];
}>();
</script>

<template>
    <div>
        <code style="color: chocolate; font-size: 10px">#optionZoom</code><br />
        <code>{{ isZoomLocked }}</code>
    </div>
</template>
