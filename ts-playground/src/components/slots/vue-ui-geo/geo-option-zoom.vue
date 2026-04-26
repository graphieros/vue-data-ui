<script setup lang="ts">
import type { VueUiGeoOptionZoomSlotProps } from 'vue-data-ui/vue-ui-geo';

const props = defineProps<{
    toggleZoom: VueUiGeoOptionZoomSlotProps['toggleZoom'];
    isZoomLocked: VueUiGeoOptionZoomSlotProps['isZoomLocked'];
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 0.7rem; pointer-events: none">
        #optionZoom
        <br />
        <span style="color: #cccccc">{{ isZoomLocked }}</span>
    </code>
</template>
