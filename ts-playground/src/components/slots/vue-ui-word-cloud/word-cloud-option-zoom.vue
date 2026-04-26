<script setup lang="ts">
import type { VueUiWordCloudOptionZoomSlotProps } from 'vue-data-ui/vue-ui-word-cloud';
const props = defineProps<{
    toggleZoom: VueUiWordCloudOptionZoomSlotProps['toggleZoom'];
    isZoomLocked: VueUiWordCloudOptionZoomSlotProps['isZoomLocked'];
}>();
</script>

<template>
    <div>
        <code style="color: chocolate; font-size: 10px">#optionZoom</code><br />
        <code>{{ isZoomLocked }}</code>
    </div>
</template>
