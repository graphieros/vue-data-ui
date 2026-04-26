<script setup lang="ts">
import type { VueUiOptionAnnotatorSlotProps } from 'vue-data-ui';

const props = defineProps<{
    toggleAnnotator: VueUiOptionAnnotatorSlotProps['toggleAnnotator'];
    isAnnotator: VueUiOptionAnnotatorSlotProps['isAnnotator'];
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 0.7rem; pointer-events: none">
        #optionAnnotator
        <br />
        <span style="color: #cccccc">{{ isAnnotator }}</span>
    </code>
</template>
