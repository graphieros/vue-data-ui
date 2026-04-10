<script setup lang="ts">
import type { VueUiResetActionSlotProps } from 'vue-data-ui';

const props = defineProps<{
    reset: VueUiResetActionSlotProps;
}>();
</script>

<template>
    <button @click="reset()">#reset</button>
</template>
