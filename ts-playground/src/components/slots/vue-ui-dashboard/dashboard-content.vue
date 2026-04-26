<script setup lang="ts">
import type { VueUiDashboardContentSlotProps } from 'vue-data-ui/vue-ui-dashboard';

const props = defineProps<{
    content: VueUiDashboardContentSlotProps;
}>();
</script>

<template>
    <div
        style="
            border: 1px solid chocolate;
            color: chocolate;
            line-height: 0.8rem;
            padding: 1rem;
        "
    >
        #content
        <div>
            <code style="font-size: 0.7rem">
                {{ content }}
            </code>
        </div>
    </div>
</template>
