<script setup lang="ts">
import type { VueUiWatermarkSlotProps } from 'vue-data-ui';

const props = defineProps<{
    isPrinting: VueUiWatermarkSlotProps['isPrinting'];
}>();
</script>

<template>
    <code>
        <span style="color: chocolate">#watermark</span>
        <br />
        isPrinting: {{ isPrinting }}
    </code>
</template>
