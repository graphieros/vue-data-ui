<script setup lang="ts">
import type { VueUiResetActionSlotProps } from 'vue-data-ui';

const props = defineProps<{
    reset: VueUiResetActionSlotProps['reset'];
}>();
</script>

<template>
    <button @click="reset()">#reset</button>
</template>
