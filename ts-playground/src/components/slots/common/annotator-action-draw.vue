<script setup lang="ts">
import type { VueUiAnnotatorActionDrawSlotProps } from 'vue-data-ui';

const props = defineProps<{
    mode: VueUiAnnotatorActionDrawSlotProps['mode'];
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">{{ mode }}</code>
</template>
