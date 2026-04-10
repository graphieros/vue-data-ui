<script setup lang="ts">
import type { VueUiMenuIconSlotProps } from 'vue-data-ui';

const props = defineProps<{
    isOpen: VueUiMenuIconSlotProps['isOpen'];
    color: VueUiMenuIconSlotProps['color'];
}>();
</script>

<template>
    <code :style="{ color }">
        <span style="color: chocolate; font-size: 0.7rem">#menuIcon</span>
        {{ isOpen ? 'CLOSE' : 'OPEN' }}
    </code>
</template>
