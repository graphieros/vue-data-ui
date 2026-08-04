<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiHill>
 */
import { ref, computed, onMounted, useTemplateRef } from 'vue';
import { mergeConfigs } from 'vue-data-ui/utils';
import {
    type VueUiHillConfig,
    type VueUiHillDatasetItem,
    VueUiHill,
} from 'vue-data-ui/vue-ui-hill';

import 'vue-data-ui/style.css';

const testPreconfig = computed<VueUiHillConfig>(() => ({
    devHints: {
        enable: false,
    },
    loading: false,
    readonly: false,
    editing: false,
    theme: '',
    customPalette: [],
    transitions: {
        enable: true,
        pauseOnLoad: true,
        pauseOnDatasetChange: false,
        activationDelayMs: 300,
    },
    userOptions: {
        show: true,
        showOnChartHover: false,
        keepStateOnChartLeave: true,
        position: 'right',
        buttons: {
            tooltip: false,
            pdf: true,
            csv: true,
            img: true,
            table: false,
            labels: false,
            fullscreen: true,
            sort: false,
            stack: false,
            animation: false,
            annotator: true,
            svg: true,
            zoom: false,
            altCopy: false,
        },
        callbacks: {
            animation: null,
            annotator: null,
            csv: null,
            fullscreen: null,
            img: null,
            labels: null,
            pdf: null,
            sort: null,
            stack: null,
            table: null,
            tooltip: null,
            svg: null,
            zoom: null,
            altCopy: null,
        },
        buttonTitles: {
            open: 'Open options',
            close: 'Close options',
            pdf: 'Download PDF',
            csv: 'Download CSV',
            img: 'Download PNG',
            fullscreen: 'Toggle fullscreen',
            annotator: 'Toggle annotator',
            svg: 'Download SVG',
            altCopy: 'Copy alt text',
        },
        print: {
            scale: 2,
            orientation: 'auto',
            overflowTolerance: 0.2,
        },
        useCursorPointer: false,
    },
    a11y: {
        translations: {
            keyboardNavigation:
                'Use the left and right arrow keys to adjust the selected datapoint.',
            tableAvailable: 'A data table for this chart is available below.',
            tableCaption: 'Chart data table',
            topOfHill: 'Top of the hill',
        },
    },
    events: {
        edit: null,
        save: null,
        cancel: null,
        change: null,
        dragStart: null,
        dragEnd: null,
        datapointEnter: null,
        datapointLeave: null,
        selectDatapoint: null,
    },
    interaction: {
        keyboardStep: 0.01,
        peakTolerance: 0.005,
    },
    style: {
        fontFamily: 'inherit',
        chart: {
            backgroundColor: '#FFFFFF',
            color: '#2D353C',
            width: 800,
            height: 300,
            title: {
                text: '',
                color: '#2D353C',
                fontSize: 20,
                bold: true,
                textAlign: 'center',
                paddingLeft: 0,
                paddingRight: 0,
                subtitle: {
                    color: '#A1A1A1',
                    text: '',
                    fontSize: 16,
                    bold: false,
                },
            },
            toolbar: {
                show: true,
                status: {
                    lastUpdated: 'Last updated just now',
                    editInstruction:
                        'Drag each dot to adjust its position on the chart',
                    color: '#2D353C',
                    fontSize: 14,
                    bold: false,
                    lineHeight: 1.3,
                },
                buttons: {
                    translations: {
                        edit: 'Edit',
                        cancel: 'Cancel',
                        save: 'Save',
                    },
                },
            },
            layout: {
                hill: {
                    geometry: {
                        horizontalPaddingRatio: 0.05,
                        topPaddingRatio: 0.15,
                        bottomPaddingRatio: 0.15,
                        curvature: 0.7,
                    },
                    baseline: {
                        show: true,
                        stroke: '#CCCCCC',
                        strokeWidth: 1,
                        strokeDasharray: 0,
                    },
                    midline: {
                        show: true,
                        stroke: '#CCCCCC',
                        strokeWidth: 1,
                        strokeDasharray: '2.5 3.5',
                    },
                    curve: {
                        stroke: '#A1A1A1',
                        strokeWidth: 1.5,
                        strokeDasharray: 0,
                    },
                },
                plots: {
                    radius: 10,
                    hitRadius: 10,
                    stroke: '#FFFFFF',
                    strokeWidth: 2,
                    mutedOpacity: 0.4,
                    disabledOpacity: 0.4,
                    shadow: {
                        show: true,
                        color: '#2D353C',
                        offsetX: 0,
                        offsetY: 0.5,
                        blur: 0.4,
                    },
                    stacking: {
                        show: true,
                        overlapThresholdRatio: 0.8,
                        gap: 5,
                        overflow: {
                            show: true,
                            transitionDuration: 300,
                            marker: {
                                radius: 10,
                                stroke: '#FFFFFF',
                                strokeWidth: 1,
                                labelColor: '#2D353C',
                                labelOffsetY: 0,
                                fontSize: 14,
                                bold: true,
                                fill: '#CCCCCC',
                            },
                            menu: {
                                width: 220,
                                maxHeight: 220,
                                backgroundColor: '#FFFFFF',
                                color: '#2D353C',
                                borderColor: 'transparent',
                                borderRadius: 3,
                                title: '',
                            },
                        },
                    },
                    dragMarker: {
                        show: true,
                        strokeWidth: 1.5,
                        crossPath: 'M-5 0H5M0-5V5',
                        positionIndicator: {
                            show: true,
                            useSerieColor: true,
                            color: '#e1e5e8',
                            strokeWidth: 1,
                            strokeDasharray: '0',
                            circle: {
                                show: true,
                                radius: 3,
                                stroke: '#FFFFFF',
                                strokeWidth: 1,
                            },
                            value: {
                                show: true,
                                offsetY: 0,
                                fontSize: 12,
                                useSerieColor: false,
                                color: '#2D353C',
                                formatter: null,
                                rounding: 0,
                            },
                        },
                    },
                },
                labels: {
                    item: {
                        ellipsisThresholdChars: 24,
                        show: true,
                        color: '#2D353C',
                        useSerieColor: false,
                        fontSize: 14,
                        bold: false,
                        offsetX: 0,
                        offsetY: 0,
                        autoSideThreshold: 0.75,
                        stroke: '#FFFFFF',
                        strokeWidth: 5,
                    },
                    phases: {
                        show: true,
                        color: '#A1A1A1',
                        fontSize: 14,
                        bold: true,
                        letterSpacing: '0.02em',
                        offsetY: 0,
                        left: {
                            text: 'FIGURING THINGS OUT',
                        },
                        right: {
                            text: 'MAKING IT HAPPEN',
                        },
                    },
                },
                stackbar: {
                    show: true,
                    paddingTop: 0,
                    paddingBottom: 0,
                    height: 14,
                    stroke: '#FFFFFF',
                    strokeWidth: 1,
                    gutterColor: '#e1e5e8',
                    label: {
                        show: true,
                        color: '#2D353C',
                        fontSize: 12,
                        formatter: null,
                    },
                },
            },
        },
    },
}));

const dataset = ref<VueUiHillDatasetItem[]>([
    {
        label: 'A',
        position: 0,
    },
    {
        label: 'B',
        position: 0,
    },
    {
        label: 'C',
        position: 0,
    },
    {
        label: 'D',
        position: 0,
    },
    {
        label: 'E',
        position: 0,
    },
]);

const config = computed<VueUiHillConfig>(() => {
    return mergeConfigs({
        defaultConfig: testPreconfig.value,
        userConfig: {
            events: {
                save: (data) => (dataset.value = data),
            },
            userOptions: {
                buttons: {
                    altCopy: true,
                },
                callbacks: {
                    altCopy: (args) => {
                        console.log(args);
                    },
                },
            },
        },
    });
});

const chartRef = useTemplateRef('chartRef');

onMounted(() => {
    chartRef.value?.getData();
});

function log(n: any) {
    console.log(n);
}
</script>

<template>
    <div>
        <VueUiHill ref="chartRef" :dataset :config>
            <template #hill-edit> EDIT </template>
            <template #hill-cancel> CANCEL </template>
            <template #hill-save> SAVE </template>
            <template #chart-background>
                <div
                    style="
                        width: 100%;
                        height: 100%;
                        text-align: center;
                        background: linear-gradient(
                            to bottom,
                            #cccccc00,
                            #cccccc
                        );
                    "
                >
                    <code style="color: chocolate"> #chart-background </code>
                </div>
            </template>
            <template #svg="{ svg }">
                <circle
                    :cx="svg.drawingArea.centerX"
                    :cy="svg.drawingArea.baseY"
                    r="42"
                    fill="#FF000030"
                />
                <text
                    :x="svg.drawingArea.centerX"
                    :y="svg.drawingArea.baseY"
                    fill="white"
                    fontSize="16"
                    text-anchor="middle"
                >
                    #svg
                </text>
            </template>
            <template #analysis="{ data }">
                <div>
                    #data
                    <div>
                        {{ data }}
                    </div>
                </div>
            </template>

            <template #loading>
                <!-- set config.loading: true to view -->
                LOADING...
            </template>
        </VueUiHill>
    </div>
</template>
