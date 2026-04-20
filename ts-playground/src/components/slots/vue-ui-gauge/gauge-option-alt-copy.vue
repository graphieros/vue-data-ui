<script setup lang="ts">
import type { VueUiGaugeOptionCopyAltSlotProps } from 'vue-data-ui/vue-ui-gauge';
const props = defineProps<{
    copyAlt: VueUiGaugeOptionCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#optionAltCopy</code>
</template>
