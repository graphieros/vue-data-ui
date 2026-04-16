<script setup lang="ts">
import type { VueUiBulletCopyAltSlotProps } from 'vue-data-ui/vue-ui-bullet';
const props = defineProps<{
    copyAlt: VueUiBulletCopyAltSlotProps;
}>();
</script>

<template>
    <code style="color: chocolate; font-size: 10px">#copyAlt</code>
</template>
