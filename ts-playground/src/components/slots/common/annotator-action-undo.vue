<script setup lang="ts">
import type { VueUiAnnotatorActionUndoSlotProps } from 'vue-data-ui';

const props = defineProps<{
    disabled: VueUiAnnotatorActionUndoSlotProps['disabled'];
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">{{ disabled }}</code>
</template>
