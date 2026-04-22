<script setup lang="ts">
import { computed } from 'vue';
import { VueUiKpi, type VueUiKpiProps } from 'vue-data-ui/vue-ui-kpi';

const dataset = computed<VueUiKpiProps['dataset']>(() => 999);

const config = computed<VueUiKpiProps['config']>(() => {
    return {
        debug: false,
        animationFrames: 60,
        animationValueStart: 0,
        backgroundColor: '#FFFFFF',
        fontFamily: 'inherit',
        layoutClass: '',
        layoutCss: '',
        prefix: '',
        suffix: '',
        title: 'Title',
        titleBold: true,
        titleColor: '#2D353C',
        titleClass: '',
        titleCss: 'font-size: 2rem; color: red',
        titleFontSize: 16,
        useAnimation: true,
        valueBold: true,
        valueColor: '#1f77b4',
        valueClass: '',
        valueCss: '',
        valueFontSize: 32,
        valueRounding: 0,
        formatter: null,
        analogDigits: {
            show: false,
            height: 40,
            color: '#2D353C',
            skeletonColor: '#e1e5e8',
        },
    };
});
</script>

<template>
    <div>
        <VueUiKpi :dataset :config>
            <template #title="{ comment }">
                {{ comment }}
            </template>
        </VueUiKpi>
    </div>
</template>
