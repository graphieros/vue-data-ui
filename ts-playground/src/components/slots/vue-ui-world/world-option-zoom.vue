<script setup lang="ts">
import type { VueUiWorldOptionZoomSlotProps } from 'vue-data-ui/vue-ui-world';

defineProps<{
    toggleZoom: VueUiWorldOptionZoomSlotProps['toggleZoom'];
    isZoomLocked: VueUiWorldOptionZoomSlotProps['isZoomLocked'];
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 0.7rem; pointer-events: none">
        #optionZoom
        <br />
        <span style="color: #cccccc">{{ isZoomLocked }}</span>
    </code>
</template>
