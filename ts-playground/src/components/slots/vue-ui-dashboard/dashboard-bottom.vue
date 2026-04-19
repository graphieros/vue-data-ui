<script setup lang="ts">
import type { VueUiDashboardBottomSlotProps } from 'vue-data-ui/vue-ui-dashboard';

const props = defineProps<{
    index: VueUiDashboardBottomSlotProps['index'];
    item: VueUiDashboardBottomSlotProps['item'];
}>();
</script>

<template>
    <div>
        <code style="color: chocolate">#bottom</code><br />
        index: {{ index }}
    </div>
</template>
