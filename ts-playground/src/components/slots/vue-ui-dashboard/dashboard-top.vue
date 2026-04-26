<script setup lang="ts">
import type { VueUiDashboardTopSlotProps } from 'vue-data-ui/vue-ui-dashboard';

const props = defineProps<{
    index: VueUiDashboardTopSlotProps['index'];
    item: VueUiDashboardTopSlotProps['item'];
}>();
</script>

<template>
    <div>
        <code style="color: chocolate">#top</code><br />
        index: {{ index }}
    </div>
</template>
