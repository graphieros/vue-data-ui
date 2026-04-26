<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiSparkstackbar>
 */
import { computed } from 'vue';
import {
    VueUiSparkStackbar,
    type VueUiSparkStackbarConfig,
    type VueUiSparkStackbarDatasetItem,
} from 'vue-data-ui/vue-ui-sparkstackbar';
import 'vue-data-ui/style.css';
import KeyboardNavigationHint from '../slots/common/keyboard-navigation-hint.vue';
import SparkstackbarTooltip from '../slots/vue-ui-sparkstackbar/sparkstackbar-tooltip.vue';
import Skeleton from '../slots/common/skeleton.vue';

const dataset = computed<VueUiSparkStackbarDatasetItem[]>(() => {
    return [
        {
            name: 'Vue',
            value: 258,
            color: '#42d392',
        },
        {
            name: 'Javascript',
            value: 36,
            color: '#ff9900',
        },
        {
            name: 'Other',
            value: 16,
            color: '#5f8bee',
        },
    ];
});

const config = computed<VueUiSparkStackbarConfig>(() => {
    return {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false,
        loading: false,
        useCursorPointer: false,
        a11y: {
            translations: {
                keyboardNavigation:
                    'Use the left and right arrow keys to move between data points.',
                tableAvailable:
                    'A data table for this chart is available below.',
                tableCaption: 'Chart data table',
                series: 'Series',
                percentage: 'Percentage',
                value: 'Value',
            },
        },
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
            bar: {
                gradient: {
                    show: true,
                    intensity: 40,
                    underlayerColor: '#FFFFFF',
                },
            },
            legend: {
                show: true,
                textAlign: 'left',
                fontSize: 12,
                margin: '6px 0 0 0',
                name: {
                    color: '#2D353C',
                    bold: false,
                },
                value: {
                    show: true,
                    bold: false,
                    color: '#2D353C',
                    prefix: '',
                    suffix: '',
                    rounding: 0,
                    formatter: null,
                },
                percentage: {
                    show: true,
                    bold: true,
                    color: '#2D353C',
                    rounding: 1,
                },
                selectAllToggle: {
                    show: false,
                    backgroundColor: '#e1e5e8',
                    color: '#2D353C',
                },
            },
            title: {
                text: '',
                color: '#2D353C',
                fontSize: 20,
                bold: true,
                textAlign: 'left',
                paddingLeft: 0,
                paddingRight: 0,
                subtitle: {
                    color: '#A1A1A1',
                    text: '',
                    fontSize: 16,
                    bold: false,
                },
                margin: '0 0 6px 0',
            },
            tooltip: {
                show: true,
                color: '#2D353C',
                backgroundColor: '#FFFFFF',
                fontSize: 14,
                customFormat: null,
                borderRadius: 4,
                borderColor: '#e1e5e8',
                borderWidth: 1,
                backgroundOpacity: 100,
                position: 'center',
                offsetY: 24,
                smooth: true,
                backdropFilter: true,
                smoothForce: 0.18,
                smoothSnapThreshold: 0.25,
                teleportTo: 'body',
            },
        },
    };
});

function log(n: unknown) {
    console.log(n);
}
</script>

<template>
    <div style="margin-top: 200px">
        <VueUiSparkStackbar :dataset :config>
            <template #hint="{ hint, isVisible }">
                <KeyboardNavigationHint
                    :hint
                    :is-visible
                    style="margin-top: 48px"
                />
            </template>

            <template #tooltip-before>
                <span style="color: chocolate"> #tooltip-before </span>
                <br />
            </template>

            <template #tooltip="{ datapoint, seriesIndex }">
                <SparkstackbarTooltip :datapoint :series-index />
            </template>

            <template #tooltip-after>
                <br />
                <span style="color: chocolate"> #tooltip-after </span>
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>

            <template #skeleton>
                <Skeleton />
            </template>
        </VueUiSparkStackbar>
    </div>
</template>
