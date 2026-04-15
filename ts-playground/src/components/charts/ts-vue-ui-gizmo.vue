<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiGizmo>
 */
import { computed, ref } from 'vue';
import {
    VueUiGizmo,
    type VueUiGizmoConfig,
    type VueUiGizmoDataset,
} from 'vue-data-ui/vue-ui-gizmo';

const dataset = ref<VueUiGizmoDataset>(69);

const config = computed<VueUiGizmoConfig>(() => {
    return {
        a11y: {
            translations: {
                label: 'Progress',
            },
        },
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false,
        loading: false,
        type: 'battery',
        size: 120,
        stroke: '#CCCCCC',
        color: '#1f77b4',
        useGradient: true,
        gradientColor: '#9db5ed',
        showPercentage: true,
        textColor: '#CCCCCC',
        fontFamily: 'inherit',
        formatter: null,
    };
});
</script>

<template>
    <div style="display: flex; justify-content: center;">
        <VueUiGizmo :dataset :config />
    </div>
</template>
