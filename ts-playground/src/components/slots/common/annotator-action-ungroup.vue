<script setup lang="ts">
import type { VueUiAnnotatorActionUngroupSlotProps } from 'vue-data-ui';

const props = defineProps<{
    disabled: VueUiAnnotatorActionUngroupSlotProps['disabled'];
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
        <rect x="3" y="3" width="9" height="9" stroke-width="0.9" />
        <path
            d="M1.75 1.75h2.5v2.5h-2.5zM10.75 1.75h2.5v2.5h-2.5zM1.75 10.75h2.5v2.5h-2.5zM10.75 10.75h2.5v2.5h-2.5z"
            fill="currentColor"
            stroke="none"
        />
        <rect
            x="9"
            y="9"
            width="8"
            height="8"
            fill="white"
            stroke-width="0.9"
        />
        <path
            d="M7.75 7.75h2.5v2.5h-2.5zM15.75 7.75h2.5v2.5h-2.5zM7.75 15.75h2.5v2.5h-2.5zM15.75 15.75h2.5v2.5h-2.5z"
            fill="currentColor"
            stroke="none"
        />
    </svg>
</template>
