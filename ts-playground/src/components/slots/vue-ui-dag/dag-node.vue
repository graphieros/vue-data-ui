<script setup lang="ts">
import type { VueUiDagNodeSlotProps } from 'vue-data-ui/vue-ui-dag';

const props = defineProps<{
    node: VueUiDagNodeSlotProps['node'];
    orientation: VueUiDagNodeSlotProps['orientation'];
}>();
</script>

<template>
    <div
        :style="{
            width: '100%',
            height: '100%',
            border: '1px solid red',
            backgroundColor: node.original.backgroundColor,
            fontSize: '0.6rem',
        }"
    >
        <code style="color: chocolate">#node</code><br />
        {{ node.label }}
    </div>
</template>
