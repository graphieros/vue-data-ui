<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiHistoryPlot>
 */
import { computed } from 'vue';
import {
    VueUiHistoryPlot,
    type VueUiHistoryPlotConfig,
    type VueUiHistoryPlotDatasetItem,
} from 'vue-data-ui/vue-ui-history-plot';
import { mergeConfigs } from 'vue-data-ui/utils';

import 'vue-data-ui/style.css';

import KeyboardNavigationHint from '../slots/common/keyboard-navigation-hint.vue';
import Watermark from '../slots/common/watermark.vue';
import Skeleton from '../slots/common/skeleton.vue';
import PatternSlot from '../slots/common/pattern-slot.vue';
import CommonAnnotatorActionColor from '../slots/common/annotator-action-color.vue';
import CommonAnnotatorActionDraw from '../slots/common/annotator-action-draw.vue';
import CommonAnnotatorActionUndo from '../slots/common/annotator-action-undo.vue';
import CommonAnnotatorActionRedo from '../slots/common/annotator-action-redo.vue';
import CommonAnnotatorActionDelete from '../slots/common/annotator-action-delete.vue';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';
import CommonOptionAnnotator from '../slots/common/option-annotator.vue';

import HistoryPlotSvg from '../slots/vue-ui-history-plot/history-plot-svg.vue';
import HistoryPlotLegend from '../slots/vue-ui-history-plot/history-plot-legend.vue';
import HistoryPlotTooltip from '../slots/vue-ui-history-plot/history-plot-tooltip.vue';

const dataset = computed<VueUiHistoryPlotDatasetItem[]>(() => {
    return [
        {
            name: 'Series 1',
            values: [
                { x: 355, y: 2.3, label: 'January' },
                { x: 112, y: 1.2, label: 'February' },
                { x: 313, y: 0.4, label: 'March' },
                { x: 555, y: 1.2, label: 'April' },
            ],
        },
        {
            name: 'Series 2',
            values: [
                { x: 1000, y: 2, label: 'January' },
                { x: 655, y: 4, label: 'February' },
                { x: 350, y: 3, label: 'March' },
                { x: 815, y: 2.5, label: 'April' },
            ],
        },
    ];
});

const testPreconfig = computed<VueUiHistoryPlotConfig>(() => {
    return {
        skeletonDataset: null,
        skeletonConfig: null,
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
        responsiveProportionalSizing: true,
        theme: '',
        customPalette: [],
        useCssAnimation: false,
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
                roundingValue: 0,
            },
            columnNames: {
                series: 'Series',
                datapoint: 'Datapoint',
                x: 'x',
                y: 'y',
            },
        },
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                height: 500,
                width: 600,
                padding: {
                    top: 12,
                    right: 12,
                    bottom: 12,
                    left: 12,
                },
                grid: {
                    xAxis: {
                        show: true,
                        stroke: '#e1e5e8',
                        strokeWidth: 1,
                    },
                    horizontalLines: {
                        show: true,
                        stroke: '#e1e5e8',
                        strokeWidth: 0.6,
                    },
                    yAxis: {
                        show: true,
                        stroke: '#e1e5e8',
                        strokeWidth: 1,
                    },
                    verticalLines: {
                        show: true,
                        stroke: '#e1e5e8',
                        strokeWidth: 0.6,
                    },
                },
                axes: {
                    x: {
                        scaleMin: null,
                        scaleMax: null,
                        ticks: 10,
                        labels: {
                            show: true,
                            fontSize: 16,
                            color: '#2D353C',
                            bold: false,
                            rounding: 1,
                            offsetY: 0,
                            rotation: 0,
                            autoRotate: {
                                enable: true,
                                angle: -30,
                            },
                            formatter: null,
                            prefix: '',
                            suffix: '',
                        },
                        name: {
                            text: '',
                            fontSize: 16,
                            offsetX: 0,
                            offsetY: 0,
                            bold: false,
                            color: '#2D353C',
                        },
                    },
                    y: {
                        scaleMin: null,
                        scaleMax: null,
                        ticks: 10,
                        labels: {
                            show: true,
                            fontSize: 16,
                            color: '#2D353C',
                            bold: false,
                            rounding: 1,
                            offsetX: 0,
                            formatter: null,
                            prefix: '',
                            suffix: '',
                        },
                        name: {
                            text: '',
                            fontSize: 16,
                            offsetX: 0,
                            offsetY: 0,
                            bold: false,
                            color: '#2D353C',
                        },
                    },
                },
                plots: {
                    radius: 16,
                    stroke: '#FFFFFF',
                    strokeWidth: 1,
                    gradient: {
                        show: true,
                        intensity: 40,
                    },
                    indexLabels: {
                        show: true,
                        startAtZero: false,
                        adaptColorToBackground: true,
                        color: '#2D353C',
                        fontSize: 16,
                        bold: false,
                        offsetY: 0,
                        offsetX: 0,
                    },
                    labels: {
                        show: true,
                        fontSize: 10,
                        color: '#2D353C',
                        bold: false,
                        offsetY: 0,
                        offsetX: 0,
                    },
                },
                paths: {
                    show: true,
                    strokeWidth: 1.6,
                    useSerieColor: true,
                    stroke: '#2D353C',
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
                    position: 'bottom',
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
        },
    };
});

const config = computed<VueUiHistoryPlotConfig>(() => {
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
        <VueUiHistoryPlot :dataset :config>
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
                <HistoryPlotSvg :svg />
            </template>

            <template #hint="{ hint, isVisible }">
                <KeyboardNavigationHint
                    :hint
                    :is-visible
                    style="margin-top: -24px"
                />
            </template>

            <template #legend="{ legend }">
                <HistoryPlotLegend :items="legend" />
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>

            <template #tooltip-before>
                <span style="color: chocolate"> #tooltip-before </span>
                <br />
            </template>

            <template #tooltip="{ datapoint, seriesIndex }">
                <HistoryPlotTooltip :datapoint :series-index />
            </template>

            <template #tooltip-after>
                <br />
                <span style="color: chocolate"> #tooltip-after </span>
            </template>

            <template #watermark="{ isPrinting }">
                <Watermark :is-printing />
            </template>

            <template #skeleton>
                <Skeleton />
            </template>
        </VueUiHistoryPlot>
    </div>
</template>
