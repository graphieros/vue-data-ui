<script setup lang="ts">
import { computed } from 'vue';
import {
    VueUiScatter,
    type VueUiScatterConfig,
    type VueUiScatterDatasetItem,
} from 'vue-data-ui/vue-ui-scatter';
import { mergeConfigs } from 'vue-data-ui/utils';
import 'vue-data-ui/style.css';

import KeyboardNavigationHint from '../slots/common/keyboard-navigation-hint.vue';
import Watermark from '../slots/common/watermark.vue';
import Skeleton from '../slots/common/skeleton.vue';
import CommonAnnotatorActionColor from '../slots/common/annotator-action-color.vue';
import CommonAnnotatorActionDraw from '../slots/common/annotator-action-draw.vue';
import CommonAnnotatorActionUndo from '../slots/common/annotator-action-undo.vue';
import CommonAnnotatorActionRedo from '../slots/common/annotator-action-redo.vue';
import CommonAnnotatorActionDelete from '../slots/common/annotator-action-delete.vue';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';
import CommonOptionAnnotator from '../slots/common/option-annotator.vue';
import ScatterSvg from '../slots/vue-ui-scatter/scatter-svg.vue';
import ScatterLegend from '../slots/vue-ui-scatter/scatter-legend.vue';
import ScatterTooltip from '../slots/vue-ui-scatter/scatter-tooltip.vue';

const dataset = computed<VueUiScatterDatasetItem[]>(() => {
    return [
        {
            name: 'Cluster 1',
            values: [
                {
                    x: 1,
                    y: 1,
                    name: 'Cluster 1 point 1',
                },
                {
                    x: 0,
                    y: -1,
                    name: 'Cluster 1 point 2',
                },
                {
                    x: 2,
                    y: 3,
                    name: 'Cluster 1 point 3',
                },
            ],
        },
        {
            name: 'Cluster 2',
            values: [
                {
                    x: -5,
                    y: -4,
                    name: 'Cluster 2 point 1',
                },
                {
                    x: 13,
                    y: 8,
                    name: 'Cluster 2 point 2',
                },
                {
                    x: -2,
                    y: -7,
                    name: 'Cluster 2 point 3',
                },
            ],
        },
    ];
});

const testPreconfig = computed<VueUiScatterConfig>(() => {
    return {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false,
        loading: false,
        responsive: false,
        a11y: {
            translations: {
                keyboardNavigation:
                    'Use the left and right, or up and down arrow keys to move between datapoints',
                tableAvailable:
                    'A data table for this chart is available below.',
                tableCaption: 'Chart data table',
            },
        },
        events: {
            datapointEnter: null,
            datapointLeave: null,
            datapointClick: null,
        },
        theme: '',
        customPalette: [],
        useCssAnimation: false,
        downsample: {
            threshold: 1095,
        },
        usePerformanceMode: false,
        style: {
            fontFamily: 'inherit',
            backgroundColor: '#FFFFFF',
            color: '#2D353C',
            layout: {
                height: 316,
                width: 512,
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
                axis: {
                    show: true,
                    stroke: '#e1e5e8',
                    strokeWidth: 1,
                    xMin: null,
                    xMax: null,
                    yMin: null,
                    yMax: null,
                },
                marginalBars: {
                    show: false,
                    size: 40,
                    tranches: 20,
                    opacity: 0.6,
                    fill: '#2D353C',
                    strokeWidth: 1,
                    offset: 20,
                    borderRadius: 2,
                    useGradient: true,
                    showLines: false,
                    linesStrokeWidth: 1,
                    highlighter: {
                        show: true,
                        opacity: 0.1,
                        color: '#2D353C',
                        stroke: '#2D353C',
                        strokeWidth: 0.5,
                        strokeDasharray: 2,
                        highlightBothAxes: false,
                    },
                },
                plots: {
                    radius: 2,
                    hoverRadiusRatio: 2,
                    stroke: '#FFFFFF',
                    strokeWidth: 0.3,
                    opacity: 0.6,
                    opacityNotSelected: 0.6,
                    name: {
                        show: false,
                        fontSize: 12,
                        offsetY: 0,
                        color: '#2D353C',
                    },
                    significance: {
                        show: true,
                        useDistanceOpacity: false,
                        deviationThreshold: 10,
                        opacity: 0.3,
                    },
                    deviation: {
                        translation: 'deviation',
                        roundingValue: 1,
                    },
                    giftWrap: {
                        show: false,
                        strokeWidth: 1,
                        strokeDasharray: 0,
                        fillOpacity: 0.2,
                    },
                    selectors: {
                        show: true,
                        stroke: '#2D353C',
                        strokeWidth: 0.7,
                        strokeDasharray: 0,
                        labels: {
                            fontSize: 12,
                            color: '#2D353C',
                            rounding: 2,
                            bold: false,
                            showName: true,
                            prefix: '',
                            suffix: '',
                            x: {
                                formatter: null,
                            },
                            y: {
                                formatter: null,
                            },
                        },
                        markers: {
                            radius: 1.5,
                            stroke: '#FFFFFF',
                            strokeWidth: 0.5,
                            fill: '#2D353C',
                        },
                    },
                },
                correlation: {
                    show: true,
                    strokeDasharray: 2,
                    strokeWidth: 1,
                    label: {
                        show: true,
                        fontSize: 12,
                        color: '#2D353C',
                        bold: true,
                        roundingValue: 2,
                        useSerieColor: true,
                    },
                },
                dataLabels: {
                    reverseAxisLabels: false,
                    xAxis: {
                        name: '',
                        show: true,
                        fontSize: 10,
                        color: '#2D353C',
                        bold: false,
                        offsetX: 0,
                        offsetY: 0,
                        roundingValue: 0,
                        showValue: true,
                        scales: {
                            show: false,
                            steps: 10,
                            useNiceScale: true,
                            labels: {
                                formatter: null,
                                color: '#2D353C',
                                fontSize: 12,
                                offsetY: 0,
                            },
                            verticalLines: {
                                show: false,
                                stroke: '#e1e5e8',
                                strokeWidth: 1,
                            },
                        },
                    },
                    yAxis: {
                        name: '',
                        show: true,
                        fontSize: 10,
                        color: '#2D353C',
                        bold: false,
                        offsetX: 0,
                        offsetY: 0,
                        roundingValue: 0,
                        showValue: true,
                        scales: {
                            show: false,
                            steps: 10,
                            useNiceScale: true,
                            labels: {
                                formatter: null,
                                color: '#2D353C',
                                fontSize: 12,
                                offsetX: 0,
                            },
                            horizontalLines: {
                                show: false,
                                stroke: '#e1e5e8',
                                strokeWidth: 1,
                            },
                        },
                    },
                },
            },
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
            legend: {
                show: true,
                bold: false,
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                fontSize: 14,
                selectAllToggle: {
                    show: false,
                    backgroundColor: '#e1e5e8',
                    color: '#2D353C',
                },
                roundingValue: 0,
                position: 'bottom',
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
                roundingValue: 2,
                showShape: true,
                prefix: '',
                suffix: '',
            },
        },
        userOptions: {
            show: true,
            showOnChartHover: false,
            keepStateOnChartLeave: true,
            position: 'right',
            buttons: {
                tooltip: true,
                pdf: true,
                csv: true,
                img: true,
                table: true,
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
                tooltip: 'Toggle tooltip',
                pdf: 'Download PDF',
                csv: 'Download CSV',
                img: 'Download PNG',
                table: 'Toggle table',
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
        table: {
            show: false,
            responsiveBreakpoint: 400,
            useDialog: false,
            th: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                outline: 'none',
            },
            td: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                outline: 'none',
                roundingValue: 2,
                roundingAverage: 1,
            },
            translations: {
                correlationCoefficient: 'Correlation Coef.',
                nbrPlots: 'Nbr plots',
                average: 'Average',
                series: 'Series',
            },
        },
    };
});

const config = computed<VueUiScatterConfig>(() => {
    return mergeConfigs({
        defaultConfig: testPreconfig.value,
        userConfig: {
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

function log(n: unknown) {
    console.log(n);
}
</script>

<template>
    <div>
        <VueUiScatter :dataset :config>
            <template #annotator-action-close>
                <span style="color: chocolate">X</span>
            </template>

            <template #annotator-action-color="{ color }">
                <!-- text color, either black or white depending on the selected palette color -->
                <CommonAnnotatorActionColor :color />
            </template>

            <template #annotator-action-draw="{ mode }">
                <CommonAnnotatorActionDraw :mode />
            </template>

            <template #annotator-action-undo="{ disabled }">
                <CommonAnnotatorActionUndo :disabled />
            </template>

            <template #annotator-action-redo="{ disabled }">
                <CommonAnnotatorActionRedo :disabled />
            </template>

            <template #annotator-action-delete="{ disabled }">
                <CommonAnnotatorActionDelete :disabled />
            </template>

            <template #menuIcon="{ isOpen, color }">
                <CommonMenuIcon :isOpen :color />
            </template>

            <template #optionTooltip>
                <code
                    style="
                        color: chocolate;
                        font-size: 0.7rem;
                        pointer-events: none;
                    "
                    >#optionTooltip</code
                >
            </template>

            <template #optionPdf>
                <code
                    style="
                        color: chocolate;
                        font-size: 0.7rem;
                        pointer-events: none;
                    "
                    >#optionPdf</code
                >
            </template>

            <template #optionCsv>
                <code
                    style="
                        color: chocolate;
                        font-size: 0.7rem;
                        pointer-events: none;
                    "
                    >#optionCsv</code
                >
            </template>

            <template #optionImg>
                <code
                    style="
                        color: chocolate;
                        font-size: 0.7rem;
                        pointer-events: none;
                    "
                    >#optionImg</code
                >
            </template>

            <template #optionSvg>
                <code
                    style="
                        color: chocolate;
                        font-size: 0.7rem;
                        pointer-events: none;
                    "
                    >#optionSvg</code
                >
            </template>

            <template #optionTable>
                <code
                    style="
                        color: chocolate;
                        font-size: 0.7rem;
                        pointer-events: none;
                    "
                    >#optionTable</code
                >
            </template>

            <template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <CommonOptionFullscreen :toggle-fullscreen :is-fullscreen />
            </template>

            <template #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <CommonOptionAnnotator :toggle-annotator :is-annotator />
            </template>

            <template #optionAltCopy>
                <code style="color: chocolate; font-size: 10px"
                    >#optionAltCopy</code
                >
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
                <ScatterSvg :svg />
            </template>

            <template #hint="{ hint, isVisible }">
                <KeyboardNavigationHint
                    :hint
                    :is-visible
                    style="margin-top: -48px"
                />
            </template>

            <template #watermark="{ isPrinting }">
                <Watermark :is-printing />
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>

            <template #skeleton>
                <Skeleton />
            </template>

            <template #legend="{ legend }">
                <ScatterLegend :items="legend" />
            </template>

            <template #tooltip-before>
                <span style="color: chocolate"> #tooltip-before </span>
                <br />
            </template>

            <template #tooltip="{ datapoint, seriesIndex }">
                <ScatterTooltip :datapoint :series-index />
            </template>

            <template #tooltip-after>
                <br />
                <span style="color: chocolate"> #tooltip-after </span>
            </template>
        </VueUiScatter>
    </div>
</template>
