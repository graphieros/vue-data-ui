<script setup lang="ts">
import type { VueUiOptionFullscreenSlotProps } from 'vue-data-ui';

const props = defineProps<{
    toggleFullscreen: VueUiOptionFullscreenSlotProps['toggleFullscreen'];
    isFullscreen: VueUiOptionFullscreenSlotProps['isFullscreen'];
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 0.7rem; pointer-events: none">
        #optionFullscreen
        <br />
        <span style="color: #cccccc">{{ isFullscreen }}</span>
    </code>
</template>
