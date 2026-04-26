<script setup lang="ts">
import type { VueUiAnnotatorActionDeleteSlotProps } from 'vue-data-ui';

const props = defineProps<{
    disabled: VueUiAnnotatorActionDeleteSlotProps['disabled'];
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">{{ disabled }}</code>
</template>
