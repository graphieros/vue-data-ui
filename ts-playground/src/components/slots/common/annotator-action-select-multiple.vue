<script setup lang="ts">
import {
    VueUiIcon,
    type VueUiAnnotatorActionSelectMultipleSlotProps,
} from 'vue-data-ui';

const props = defineProps<{
    isSelecting: VueUiAnnotatorActionSelectMultipleSlotProps['isSelecting'];
}>();
</script>

<template>
    <VueUiIcon
        :name="props.isSelecting ? 'selectMultipleActive' : 'selectMultiple'"
        stroke="chocolate"
        :style="{ opacity: props.isSelecting ? 1 : 0.7 }"
    />
</template>
