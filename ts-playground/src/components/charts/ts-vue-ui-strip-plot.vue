<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiStripPlot>
 */
import { computed } from 'vue';
import {
    VueUiStripPlot,
    type VueUiStripPlotConfig,
    type VueUiStripPlotDataset,
} from 'vue-data-ui/vue-ui-strip-plot';
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
import StripPlotSvg from '../slots/vue-ui-strip-plot/strip-plot-svg.vue';
import StripPlotTooltip from '../slots/vue-ui-strip-plot/strip-plot-tooltip.vue';

const dataset = computed<VueUiStripPlotDataset[]>(() => {
    return [
        {
            name: 'Asia',
            plots: [
                { name: 'Shanghai', value: 24.9 },
                { name: 'Beijing', value: 21.9 },
                { name: 'Delhi', value: 16.8 },
                { name: 'Guangzhou', value: 16.1 },
                { name: 'Istanbul', value: 15.6 },
                { name: 'Chengdu', value: 15.4 },
                { name: 'Mumbai', value: 15.4 },
                { name: 'Karachi', value: 14.9 },
                { name: 'Shenzen', value: 14.7 },
                { name: 'Tokyo', value: 14 },
            ],
        },
        {
            name: 'Africa',
            plots: [
                { name: 'Kinshasa', value: 17.1 },
                { name: 'Lagos', value: 14.9 },
                { name: 'Cairo', value: 9.3 },
                { name: 'Johannesburg', value: 5.6 },
                { name: 'Giza', value: 5.6 },
                { name: 'Khartoum', value: 5.3 },
                { name: 'Abidjan', value: 5 },
                { name: 'Alexandria', value: 4.9 },
                { name: 'Dar es Salaam', value: 4.7 },
                { name: 'Nairobi', value: 4.4 },
            ],
        },
        {
            name: 'Europe',
            plots: [
                { name: 'Moscow', value: 13 },
                { name: 'London', value: 9 },
                { name: 'Saint Petersburg', value: 5.4 },
                { name: 'Berlin', value: 3.8 },
                { name: 'Madrid', value: 3.3 },
                { name: 'Kyiv', value: 3 },
                { name: 'Rome', value: 2.7 },
                { name: 'Paris', value: 2.1 },
                { name: 'Minsk', value: 2 },
                { name: 'Vienna', value: 1.9 },
            ],
        },
        {
            name: 'America',
            plots: [
                { name: 'Sao Paulo', value: 12.2 },
                { name: 'Lima', value: 9.7 },
                { name: 'Mexico City', value: 9.2 },
                { name: 'New York', value: 8.4 },
                { name: 'Bogota', value: 8 },
                { name: 'Rio de Janeiro', value: 6.7 },
                { name: 'Santiago', value: 6.2 },
                { name: 'Los Angeles', value: 4 },
                { name: 'Buenos Aires', value: 3 },
                { name: 'Brasilia', value: 2.9 },
            ],
        },
        {
            name: 'Australia & Oceania',
            plots: [
                { name: 'Sydney', value: 5.4 },
                { name: 'Melbourne', value: 5.1 },
                { name: 'Brisbane', value: 2.6 },
                { name: 'Perth', value: 2.1 },
                { name: 'Auckland', value: 1.7 },
                { name: 'Adelaide', value: 1.4 },
                { name: 'Honolulu', value: 1 },
                { name: 'Gold Coast', value: 0.7 },
                { name: 'Newcastle-Maitland', value: 0.5 },
                { name: 'Canberra', value: 0.46 },
            ],
        },
    ];
});

const testPreconfig = computed<VueUiStripPlotConfig>(() => {
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
        useCssAnimation: true,
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
                labels: true,
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
                labels: 'Toggle labels',
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
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                height: 600,
                width: 600,
                padding: {
                    top: 12,
                    right: 12,
                    bottom: 12,
                    left: 12,
                },
                grid: {
                    show: true,
                    stroke: '#CCCCCC',
                    strokeWidth: 1,
                    scaleSteps: 10,
                    horizontalGrid: {
                        show: true,
                        stroke: '#CCCCCC',
                        strokeWidth: 0.5,
                        strokeDasharray: 4,
                    },
                    verticalGrid: {
                        show: true,
                        stroke: '#CCCCCC',
                        strokeWidth: 0.5,
                        strokeDasharray: 4,
                    },
                },
                plots: {
                    opacity: 0.5,
                    radius: 20,
                    stroke: '#FFFFFF',
                    strokeWidth: 1,
                    shape: 'circle',
                    gradient: {
                        show: true,
                        intensity: 40,
                    },
                },
                labels: {
                    prefix: '',
                    suffix: '',
                    formatter: null,
                    bestPlotLabel: {
                        show: true,
                        showValue: true,
                        fontSize: 14,
                        color: '#2D353C',
                        rounding: 0,
                        offsetY: 0,
                    },
                    axis: {
                        xLabel: '',
                        xLabelOffsetY: 0,
                        yLabel: '',
                        yLabelOffsetX: 0,
                        fontSize: 14,
                        color: '#2D353C',
                    },
                    xAxisLabels: {
                        show: true,
                        color: '#2D353C',
                        fontSize: 14,
                        offsetY: 0,
                        rotation: 0,
                        autoRotate: {
                            enable: true,
                            angle: -30,
                        },
                    },
                    yAxisLabels: {
                        show: true,
                        color: '#2D353C',
                        fontSize: 14,
                        rounding: 0,
                        offsetX: 0,
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
                    roundingValue: 0,
                },
            },
        },
        table: {
            show: false,
            responsiveBreakpoint: 400,
            useDialog: false,
            columnNames: {
                series: 'Series',
                value: 'Value',
            },
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
        },
    };
});

const config = computed<VueUiStripPlotConfig>(() => {
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
        <VueUiStripPlot :dataset :config>
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
                <StripPlotSvg :svg />
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

            <template #tooltip-before>
                <span style="color: chocolate"> #tooltip-before </span>
                <br />
            </template>

            <template #tooltip="{ datapoint, seriesIndex }">
                <StripPlotTooltip :datapoint :series-index />
            </template>

            <template #tooltip-after>
                <br />
                <span style="color: chocolate"> #tooltip-after </span>
            </template>
        </VueUiStripPlot>
    </div>
</template>
