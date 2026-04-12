<script setup lang="ts">
import type { VueUiDonutHollowSlotProps } from 'vue-data-ui';

const props = defineProps<{
    total: VueUiDonutHollowSlotProps['total'];
    average: VueUiDonutHollowSlotProps['average'];
    dataset: VueUiDonutHollowSlotProps['dataset'];
    width: VueUiDonutHollowSlotProps['width'];
    height: VueUiDonutHollowSlotProps['height'];
}>();
</script>

<template>
    <div class="hollow-wrapper">
        <code style="color: chocolate">
            #hollow (avg: {{ average }}, total: {{ total }})
        </code>
    </div>
</template>

<style scoped>
.hollow-wrapper {
    border: 1px solid chocolate;
    padding: 1rem;
}
</style>
