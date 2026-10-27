<script setup lang="ts">
import type { VueUiAnnotatorActionGroupSlotProps } from 'vue-data-ui';

const props = defineProps<{
    disabled: VueUiAnnotatorActionGroupSlotProps['disabled'];
}>();
</script>

<template>
    <svg
        viewBox="0 0 20 20"
        width="24"
        height="24"
        aria-hidden="true"
        fill="none"
        stroke="currentColor"
        stroke-linecap="butt"
        stroke-linejoin="miter"
        :style="{ color: 'chocolate', opacity: props.disabled ? 0.4 : 1 }"
    >
        <path
            d="M5 3h2m2 0h2m2 0h2M3 5v2m0 2v2m0 2v2M17 5v2m0 2v2m0 2v2M5 17h2m2 0h2m2 0h2"
            stroke-width="0.8"
        />
        <rect x="6" y="6" width="6" height="6" stroke-width="0.9" />
        <rect
            x="9"
            y="9"
            width="6"
            height="6"
            fill="white"
            stroke-width="0.9"
        />
        <path
            d="M1.75 1.75h2.5v2.5h-2.5zM15.75 1.75h2.5v2.5h-2.5zM1.75 15.75h2.5v2.5h-2.5zM15.75 15.75h2.5v2.5h-2.5z"
            fill="currentColor"
            stroke="none"
        />
    </svg>
</template>
