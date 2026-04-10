<script setup lang="ts">
import type { VueUiOptionStackSlotProps } from 'vue-data-ui';

const props = defineProps<{
    isStack: VueUiOptionStackSlotProps['isStack'];
}>();
</script>

<template>
    <div style="font-size: 0.7rem; color: #cccccc">
        <code style="color: chocolate">#optionStack</code>
        <br />
        <code>{{ isStack }}</code>
    </div>
</template>
