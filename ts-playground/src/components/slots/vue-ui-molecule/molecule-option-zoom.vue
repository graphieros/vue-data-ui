<script setup lang="ts">
import type { VueUiMoleculeOptionZoomSlotProps } from 'vue-data-ui/vue-ui-molecule';
const props = defineProps<{
    toggleZoom: VueUiMoleculeOptionZoomSlotProps['toggleZoom'];
    isZoomLocked: VueUiMoleculeOptionZoomSlotProps['isZoomLocked'];
}>();
</script>

<template>
    <div>
        <code style="color: chocolate; font-size: 10px">#optionZoom</code><br />
        <code>{{ isZoomLocked }}</code>
    </div>
</template>
