<script setup lang="ts">
import type { VueUiAnnotatorActionRedoSlotProps } from 'vue-data-ui';

const props = defineProps<{
    disabled: VueUiAnnotatorActionRedoSlotProps['disabled'];
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">{{ disabled }}</code>
</template>
