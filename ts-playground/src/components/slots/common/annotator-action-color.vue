<script setup lang="ts">
import type { VueUiAnnotatorActionColorSlotProps } from 'vue-data-ui';

const props = defineProps<{
    color: VueUiAnnotatorActionColorSlotProps['color'];
}>();
</script>

<template>
    <div :style="{ color, height: '100%', width: '100%' }">C</div>
</template>
