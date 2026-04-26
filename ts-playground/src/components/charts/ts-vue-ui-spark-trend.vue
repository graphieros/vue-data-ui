<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiSparkTrend>
 */
import { computed } from 'vue';
import {
    VueUiSparkTrend,
    type VueUiSparkTrendConfig,
} from 'vue-data-ui/vue-ui-spark-trend';
import 'vue-data-ui/style.css';
import Skeleton from '../slots/common/skeleton.vue';

const dataset = computed<number[]>(() => {
    return [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
});

const config = computed<VueUiSparkTrendConfig>(() => {
    return {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false,
        loading: false,
        responsive: false,
        theme: '',
        downsample: {
            threshold: 1095,
        },
        style: {
            fontFamily: 'inherit',
            backgroundColor: '#FFFFFF',
            height: 80,
            width: 300,
            animation: {
                show: true,
                animationFrames: 20,
            },
            line: {
                stroke: '#2D353C',
                strokeWidth: 2,
                strokeLinecap: 'round',
                strokeLinejoin: 'round',
                smooth: true,
                useColorTrend: true,
            },
            area: {
                show: true,
                useGradient: true,
                opacity: 20,
            },
            dataLabel: {
                show: true,
                useColorTrend: true,
                color: '#2D353C',
                fontSize: 14,
                bold: false,
                prefix: '',
                suffix: '',
                rounding: 0,
                formatter: null,
            },
            trendLabel: {
                trendType: 'global',
                useColorTrend: true,
                color: '#2D353C',
                fontSize: 14,
                bold: true,
                rounding: 0,
            },
            arrow: {
                colors: {
                    positive: '#2ca02c',
                    neutral: '#A1A1A1',
                    negative: '#d62728',
                },
            },
            padding: {
                top: 12,
                right: 12,
                bottom: 12,
                left: 82,
            },
        },
    };
});
</script>

<template>
    <div>
        <VueUiSparkTrend :dataset :config>
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
                    <code style="color: chocolate; font-size: 0.5rem">
                        #chart-background
                    </code>
                </div>
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>

            <template #skeleton>
                <Skeleton />
            </template>
        </VueUiSparkTrend>
    </div>
</template>
