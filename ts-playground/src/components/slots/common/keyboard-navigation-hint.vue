<script setup lang="ts">
import type { VueUiKeyboardNavigationHintSlotProps } from 'vue-data-ui';

const props = defineProps<{
    hint: VueUiKeyboardNavigationHintSlotProps['hint'];
    isVisible: VueUiKeyboardNavigationHintSlotProps['isVisible'];
}>();
</script>

<template>
    <div
        v-if="isVisible"
        style="width: 100%; text-align: center; line-height: 1rem"
    >
        <code style="color: chocolate">#hint</code><br />
        {{ hint }}
    </div>
</template>
