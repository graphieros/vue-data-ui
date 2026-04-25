<script setup lang="ts">
import { computed } from 'vue';
import { getVueDataUiConfig } from 'vue-data-ui';
import { VueUiSparkbar, type VueUiSparkbarConfig, type VueUiSparkbarDatasetItem } from 'vue-data-ui/vue-ui-sparkbar';

const dataset = computed<VueUiSparkbarDatasetItem[]>(() => {
    return [
        {
            name: 'quality',
            value: 61.953,
            rounding: 2,
            suffix: '%',
        },
        {
            name: 'popularity',
            value: 2.0412,
            rounding: 2,
            suffix: '%',
        },
        {
            name: 'maintenance',
            value: 33.3291,
            rounding: 2,
            suffix: '%',
        },
    ];
});

const config = computed<VueUiSparkbarConfig>(() => {
    return {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false,
        loading: false,
        events: {
            datapointEnter: null,
            datapointLeave: null,
            datapointClick: null,
        },
        theme: '',
        customPalette: [],
        style: {
            fontFamily: 'inherit',
            backgroundColor: '#FFFFFF',
            animation: {
                show: true,
                animationFrames: 60,
            },
            layout: {
                independant: true,
                percentage: true,
                target: 0,
                showTargetValue: false,
                targetValueText: '',
            },
            gutter: {
                backgroundColor: '#e1e5e8',
                opacity: 100,
            },
            bar: {
                gradient: {
                    show: true,
                    intensity: 40,
                    underlayerColor: '#FFFFFF',
                },
            },
            labels: {
                fontSize: 16,
                name: {
                    position: 'top-left',
                    width: '100%',
                    color: '#2D353C',
                    bold: false,
                },
                value: {
                    show: true,
                    bold: true,
                },
            },
            title: {
                text: 'Title',
                color: '#2D353C',
                fontSize: 16,
                bold: true,
                textAlign: 'left',
                margin: '0 0 6px 0',
                subtitle: {
                    color: '#A1A1A1',
                    text: 'Subtitle',
                    fontSize: 12,
                    bold: false,
                },
            },
            gap: 4,
        },
    };
});

function log(n: unknown) {
    console.log(n);
}
</script>

<template>
    <div>
        <VueUiSparkbar :dataset :config>
            <template #title="{ title: t }">
                <code style="color: chocolate">#title</code>
                <h2>{{ t.title }}</h2>
                <h3>{{ t.subtitle }}</h3>
            </template>

            <template #data-label="{ bar }">
                <div style="color: #1a1a1a">
                    <code style="color: chocolate">#data-label</code>
                    <div>{{ bar }}</div>
                </div>
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>
        </VueUiSparkbar>
    </div>
</template>
