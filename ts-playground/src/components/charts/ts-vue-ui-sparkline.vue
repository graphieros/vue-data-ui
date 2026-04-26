<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiSparkline>
 */
import { computed } from 'vue';
import {
    VueUiSparkline,
    type VueUiSparklineConfig,
    type VueUiSparklineDatasetItem,
} from 'vue-data-ui/vue-ui-sparkline';

import 'vue-data-ui/style.css';
import KeyboardNavigationHint from '../slots/common/keyboard-navigation-hint.vue';
import Skeleton from '../slots/common/skeleton.vue';

const dataset = computed<VueUiSparklineDatasetItem[]>(() => {
    return [
        {
            period: 'period 1',
            value: 0,
        },
        {
            period: 'period 2',
            value: -1,
        },
        {
            period: 'period 3',
            value: 2,
        },
        {
            period: 'period 4',
            value: -3,
        },
        {
            period: 'period 5',
            value: 4,
        },
        {
            period: 'period 6',
            value: -5,
        },
        {
            period: 'period 7',
            value: 6,
        },
        {
            period: 'period 8',
            value: -7,
        },
        {
            period: 'period 9',
            value: 8,
        },
        {
            period: 'period 10',
            value: -9,
        },
        {
            period: 'period 11',
            value: 10,
        },
        {
            period: 'period 12',
            value: -11,
        },
        {
            period: 'period 13',
            value: 12,
        },
        {
            period: 'period 14',
            value: -13,
        },
        {
            period: 'period 15',
            value: 14,
        },
        {
            period: 'period 16',
            value: -15,
        },
        {
            period: 'period 17',
            value: 16,
        },
    ];
});

const config = computed<VueUiSparklineConfig>(() => {
    return {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false,
        loading: false,
        theme: '',
        responsive: false,
        type: 'line',
        downsample: {
            threshold: 1095,
        },
        a11y: {
            translations: {
                keyboardNavigation:
                    'Use the left and right arrow keys to move between data points.',
                tableAvailable:
                    'A data table for this chart is available below.',
                tableCaption: 'Chart data table',
            },
        },
        translations: {
            period: 'period',
            value: 'value',
        },
        gradientPath: {
            show: false,
            segments: 256,
            colors: {
                high: '#34eb96',
                low: '#eb4034',
            },
        },
        temperatureColors: {
            show: false,
            colors: ['#34eb96', '#eb4034'],
        },
        events: {
            datapointEnter: null,
            datapointLeave: null,
            datapointClick: null,
        },
        style: {
            chartWidth: 290,
            animation: {
                show: true,
                animationFrames: 360,
            },
            padding: {
                top: 12,
                right: 12,
                bottom: 3,
                left: 0,
            },
            fontFamily: 'inherit',
            backgroundColor: '#FFFFFF',
            scaleMin: null,
            scaleMax: null,
            line: {
                color: '#1f77b4',
                strokeWidth: 3,
                smooth: false,
                dashIndices: [],
                dashArray: 4,
                pulse: {
                    show: false,
                    loop: true,
                    color: '#FFFFFF',
                    durationMs: 4000,
                    easing: 'ease-in-out',
                    radius: 2,
                    cubicBezier: [0.45, 0.45, 0.55, 0.55],
                    trail: {
                        show: false,
                        length: 6,
                        opacity: 0.75,
                    },
                },
            },
            bar: {
                borderRadius: 3,
                color: '#1f77b4',
            },
            zeroLine: {
                color: '#2D353C',
                strokeWidth: 1,
            },
            plot: {
                show: true,
                radius: 4,
                stroke: '#FFFFFF',
                strokeWidth: 1,
            },
            verticalIndicator: {
                show: true,
                strokeWidth: 1.5,
                color: '#1f77b4',
                strokeDasharray: 3,
            },
            dataLabel: {
                show: true,
                position: 'left',
                offsetX: 0,
                offsetY: 0,
                fontSize: 20,
                bold: true,
                color: '#2D353C',
                roundingValue: 0,
                valueType: 'latest',
                prefix: '',
                suffix: '',
                formatter: null,
                datetimeFormatter: {
                    enable: false,
                    locale: 'en',
                    useUTC: false,
                    januaryAsYear: false,
                    options: {
                        year: 'yyyy',
                        month: "MMM 'yy",
                        day: 'dd MMM',
                        hour: 'HH:mm',
                        minute: 'HH:mm:ss',
                        second: 'HH:mm:ss',
                    },
                },
            },
            title: {
                show: true,
                textAlign: 'left',
                color: '#2D353C',
                fontSize: 16,
                bold: true,
                text: '',
            },
            tooltip: {
                show: true,
                fontSize: 14,
                color: '#2D353C',
                backgroundColor: '#FFFFFF',
                offsetY: 0,
                borderWidth: 0,
                borderColor: '#e1e5e8',
                borderRadius: 2,
                backgroundOpacity: 100,
            },
            area: {
                show: true,
                useGradient: true,
                opacity: 30,
                color: '#1f77b4',
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
        <VueUiSparkline :dataset :config>
            <template
                #before="{ average, median, latest, selected, sum, trend }"
            >
                <code style="color: chocolate">#before</code>
                <div style="display: flex; flex-direction: column">
                    <code>average: {{ average }}</code>
                    <code>median: {{ median }}</code>
                    <code>latest: {{ latest }}</code>
                    <div style="height: 30px; line-height: 0.6rem">
                        selected:
                        <code style="font-size: 0.6rem">{{ selected }}</code>
                    </div>
                    <code>sum: {{ sum }}</code>
                    <code>trend: {{ trend }}</code>
                </div>
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

            <template #svg="{ svg }">
                <g style="pointer-events: none">
                    <rect
                        :x="svg.width / 2"
                        :y="0"
                        :width="svg.width / 2"
                        :height="svg.height"
                        fill="#FF000020"
                    />
                    <text
                        :x="svg.width / 2"
                        :y="svg.height / 3"
                        font-size="12"
                        fill="chocolate"
                    >
                        #svg
                    </text>
                </g>
            </template>

            <template #hint="{ hint, isVisible }">
                <KeyboardNavigationHint :hint :is-visible />
            </template>

            <template
                #tooltip="{
                    absoluteValue,
                    color,
                    id,
                    period,
                    plotValue,
                    toMax,
                    value,
                    width,
                    x,
                    y,
                }"
            >
                <code style="color: chocolate">#tooltip</code>
                <div
                    style="
                        display: flex;
                        flex-direction: column;
                        font-size: 0.7rem;
                        line-height: 0.7rem;
                    "
                >
                    <span>absoluteValue: {{ absoluteValue }}</span>
                    <span>color: {{ color }}</span>
                    <span>id: {{ id }}</span>
                    <span>period: {{ period }}</span>
                    <span>plotValue: {{ plotValue }}</span>
                    <span>toMax: {{ toMax }}</span>
                    <span>value: {{ value }}</span>
                    <span>width: {{ width }}</span>
                    <span>x: {{ x }}</span>
                    <span>y: {{ y }}</span>
                </div>
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>

            <template #skeleton>
                <Skeleton style="margin-left: 100px" />
            </template>
        </VueUiSparkline>
    </div>
</template>
