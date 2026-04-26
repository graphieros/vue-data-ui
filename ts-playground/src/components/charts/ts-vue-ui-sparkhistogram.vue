<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiSparkHistogram>
 */
import { computed } from 'vue';
import {
    VueUiSparkHistogram,
    type VueUiSparkHistogramConfig,
    type VueUiSparkHistogramDatasetItem,
} from 'vue-data-ui/vue-ui-sparkhistogram';

import 'vue-data-ui/style.css';
import KeyboardNavigationHint from '../slots/common/keyboard-navigation-hint.vue';
import Skeleton from '../slots/common/skeleton.vue';

const dataset = computed<VueUiSparkHistogramDatasetItem[]>(() => {
    return [
        {
            value: 1.2,
            valueLabel: '20%',
            timeLabel: '09:00',
            intensity: 0.2,
        },
        {
            value: 1.3,
            valueLabel: '50%',
            timeLabel: '10:00',
            intensity: 0.5,
        },
        {
            value: 1.1,
            valueLabel: '60%',
            timeLabel: '11:00',
            intensity: 0.6,
        },
        {
            value: 0.8,
            valueLabel: '70%',
            timeLabel: '12:00',
            intensity: 0.7,
        },
        {
            value: 2,
            valueLabel: '100%',
            timeLabel: '13:00',
            intensity: 1,
        },
        {
            value: 2.1,
            valueLabel: '100%',
            timeLabel: '14:00',
            intensity: 1,
        },
        {
            value: 2.3,
            valueLabel: '80%',
            timeLabel: '15:00',
            intensity: 0.8,
        },
        {
            value: 2.1,
            valueLabel: '70%',
            timeLabel: '16:00',
            intensity: 0.7,
        },
        {
            value: 0.9,
            valueLabel: '60%',
            timeLabel: '17:00',
            intensity: 0.6,
        },
        {
            value: 0.7,
            valueLabel: '50%',
            timeLabel: '18:00',
            intensity: 0.5,
        },
        {
            value: 0.3,
            valueLabel: '30%',
            timeLabel: '19:00',
            intensity: 0.3,
        },
        {
            value: 0.2,
            valueLabel: '20%',
            timeLabel: '20:00',
            intensity: 0.2,
        },
    ];
});

const config = computed<VueUiSparkHistogramConfig>(() => {
    return {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false,
        loading: false,
        responsive: false,
        a11y: {
            translations: {
                keyboardNavigation:
                    'Use the left and right arrow keys to move between data points.',
                tableAvailable:
                    'A data table for this chart is available below.',
                tableCaption: 'Chart data table',
                series: 'Series',
                time: 'Time',
                value: 'Value',
                label: 'Label',
            },
        },
        events: {
            datapointEnter: null,
            datapointLeave: null,
            datapointClick: null,
        },
        theme: '',
        style: {
            fontFamily: 'inherit',
            backgroundColor: '#FFFFFF',
            animation: {
                show: true,
                speedMs: 500,
            },
            layout: {
                height: 96,
                width: 640,
                padding: {
                    top: 24,
                    right: 0,
                    bottom: 36,
                    left: 0,
                },
            },
            bars: {
                shape: 'square',
                strokeWidth: 0,
                colors: {
                    positive: '#1f77b4',
                    negative: '#d62728',
                    gradient: {
                        show: true,
                    },
                },
                borderRadius: 24,
                gap: 12,
            },
            labels: {
                value: {
                    show: true,
                    fontSize: 14,
                    minFontSize: 6,
                    color: '#2D353C',
                    bold: true,
                    rounding: 1,
                    prefix: '',
                    suffix: '',
                    offsetY: 0,
                    formatter: null,
                },
                valueLabel: {
                    show: true,
                    fontSize: 14,
                    minFontSize: 6,
                    color: '#2D353C',
                    bold: false,
                    rounding: 0,
                },
                timeLabel: {
                    show: true,
                    fontSize: 12,
                    minFontSize: 6,
                    color: '#2D353C',
                    bold: false,
                },
            },
            selector: {
                stroke: '#1f77b4',
                fill: '#2D353C10',
                strokeWidth: 2,
                strokeDasharray: 0,
                borderRadius: 2,
            },
            title: {
                text: '',
                color: '#2D353C',
                fontSize: 16,
                bold: true,
                textAlign: 'left',
                subtitle: {
                    color: '#A1A1A1',
                    text: '',
                    fontSize: 12,
                    bold: false,
                },
                margin: '0 0 6px 0',
            },
        },
    };
});

function log(n: unknown) {
    console.log(n);
}
</script>

<template>
    <div>
        <VueUiSparkHistogram :dataset :config>
            <template #hint="{ hint, isVisible }">
                <KeyboardNavigationHint :hint :is-visible />
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
                    <code style="color: chocolate"> #chart-background </code>
                </div>
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>

            <template #skeleton>
                <Skeleton />
            </template>
        </VueUiSparkHistogram>
    </div>
</template>
