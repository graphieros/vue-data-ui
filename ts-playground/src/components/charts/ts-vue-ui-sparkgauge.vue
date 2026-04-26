<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiSparkgauge>
 */
import { computed } from 'vue';

import {
    VueUiSparkgauge,
    type VueUiSparkgaugeConfig,
    type VueUiSparkgaugeDataset,
} from 'vue-data-ui/vue-ui-sparkgauge';

import 'vue-data-ui/style.css';
import Skeleton from '../slots/common/skeleton.vue';

const dataset = computed<VueUiSparkgaugeDataset>(() => {
    return {
        value: -8,
        min: -10,
        max: 10,
        title: 'KPI 1',
    };
});

const config = computed<VueUiSparkgaugeConfig>(() => {
    return {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false,
        loading: false,
        theme: '',
        style: {
            fontFamily: 'inherit',
            background: '#FFFFFF',
            height: 84,
            basePosition: 72,
            animation: {
                show: true,
                speedMs: 150,
            },
            title: {
                show: true,
                fontSize: 12,
                position: 'top',
                textAlign: 'center',
                bold: false,
                color: '#2D353C',
            },
            dataLabel: {
                fontSize: 20,
                autoColor: true,
                color: '#2D353C',
                offsetY: 0,
                bold: true,
                rounding: 0,
                prefix: '',
                suffix: '',
                formatter: null,
            },
            colors: {
                min: '#d62728',
                max: '#2ca02c',
                showGradient: true,
            },
            track: {
                autoColor: true,
                color: '#1f77b4',
                strokeLinecap: 'round',
            },
            gutter: {
                color: '#e1e5e8',
                strokeLinecap: 'round',
            },
        },
    };
});
</script>

<template>
    <div>
        <VueUiSparkgauge :dataset :config>
            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>

            <template #skeleton>
                <Skeleton />
            </template>

            <template #chart-background>
                <div
                    style="
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(
                            to bottom,
                            #cccccc00,
                            #cccccc90
                        );
                    "
                >
                    <code style="color: chocolate; font-size: 0.2rem">
                        #chart-background
                    </code>
                </div>
            </template>
        </VueUiSparkgauge>
    </div>
</template>
