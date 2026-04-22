<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiDumbbell>
 */
import { computed } from 'vue';
import {
    VueUiDumbbell,
    type VueUiDumbbellConfig,
    type VueUiDumbbellDataset,
} from 'vue-data-ui/vue-ui-dumbbell';
import { mergeConfigs } from 'vue-data-ui/utils';

import CommonAnnotatorActionColor from '../slots/common/annotator-action-color.vue';
import CommonAnnotatorActionDraw from '../slots/common/annotator-action-draw.vue';
import CommonAnnotatorActionUndo from '../slots/common/annotator-action-undo.vue';
import CommonAnnotatorActionRedo from '../slots/common/annotator-action-redo.vue';
import CommonAnnotatorActionDelete from '../slots/common/annotator-action-delete.vue';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';
import CommonOptionAnnotator from '../slots/common/option-annotator.vue';

import 'vue-data-ui/style.css';

import DumbbellSvg from '../slots/vue-ui-dumbbell/dumbbell-svg.vue';
import KeyboardNavigationHint from '../slots/common/keyboard-navigation-hint.vue';
import Watermark from '../slots/common/watermark.vue';
import DumbbellLegend from '../slots/vue-ui-dumbbell/dumbbell-legend.vue';
import Skeleton from '../slots/common/skeleton.vue';

const dataset = computed<VueUiDumbbellDataset[]>(() => {
    return [
        { name: 'Sweden', start: 5000, end: 7100 },
        { name: 'Korea, Rep.', start: 4900, end: 7050 },
        { name: 'Iceland', start: 6500, end: 8000 },
        { name: 'Finland', start: 6400, end: 7600 },
        { name: 'Norway', start: 5400, end: 6050 },
        { name: 'Ireland', start: 3000, end: 2000 },
    ];
});

const testPreconfig = computed<VueUiDumbbellConfig>(() => {
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
        useAnimation: false,
        animationSpeed: 2,
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
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                width: 600,
                rowHeight: 48,
                padding: {
                    top: 12,
                    right: 24,
                    bottom: 12,
                    left: 12,
                },
                plots: {
                    startColor: '#d62728',
                    endColor: '#1f77b4',
                    evaluationColors: {
                        enable: false,
                        positive: '#2ca02c',
                        negative: '#d62728',
                        neutral: '#c7c7c7',
                    },
                    radius: 6,
                    stroke: '#FFFFFF',
                    strokeWidth: 1,
                    link: {
                        strokeWidth: 2,
                        type: 'curved',
                    },
                    gradient: {
                        show: true,
                        intensity: 40,
                    },
                },
                grid: {
                    strokeWidth: 1,
                    scaleSteps: 10,
                    scaleMin: null,
                    scaleMax: null,
                    horizontalGrid: {
                        show: true,
                        stroke: '#CCCCCC',
                        strokeWidth: 0.5,
                        strokeDasharray: 0,
                    },
                    verticalGrid: {
                        show: true,
                        stroke: '#CCCCCC',
                        strokeWidth: 0.5,
                        strokeDasharray: 0,
                    },
                },
                comparisonLines: {
                    show: true,
                    strokeWidth: 1,
                    strokeDasharray: 4,
                    showRect: true,
                    rectColor: '#2D353C',
                    rectOpacity: 5,
                    showLabel: true,
                    labelColor: '#2D353C',
                    labelFontSize: 12,
                },
                highlighter: {
                    color: '#2D353C',
                    opacity: 5,
                },
                labels: {
                    prefix: '',
                    suffix: '',
                    formatter: null,
                    axis: {
                        yLabel: '',
                        yLabelOffsetX: 0,
                        xLabel: '',
                        xLabelOffsetY: 0,
                        fontSize: 14,
                        color: '#2D353C',
                    },
                    yAxisLabels: {
                        show: true,
                        fontSize: 14,
                        color: '#2D353C',
                        offsetX: 0,
                        bold: true,
                        showProgression: true,
                        rounding: 1,
                        formatter: null,
                    },
                    xAxisLabels: {
                        show: true,
                        fontSize: 14,
                        color: '#2D353C',
                        offsetY: 0,
                        bold: false,
                        rounding: 0,
                        rotation: 0,
                        autoRotate: {
                            enable: true,
                            angle: -30,
                        },
                    },
                    startLabels: {
                        show: true,
                        fontSize: 10,
                        color: '#2D353C',
                        offsetY: 0,
                        rounding: 0,
                        useStartColor: true,
                        useEvaluationColor: true,
                    },
                    endLabels: {
                        show: true,
                        fontSize: 10,
                        color: '#2D353C',
                        offsetY: 0,
                        rounding: 0,
                        useEndColor: true,
                        useEvaluationColor: true,
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
                    labelStart: 'start',
                    labelEnd: 'end',
                    labelPositive: 'positive',
                    labelNegative: 'negative',
                    labelNeutral: 'neutral',
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
            },
        },
        table: {
            show: false,
            responsiveBreakpoint: 400,
            useDialog: false,
            columnNames: {
                series: 'Series',
                start: 'Start value',
                end: 'End value',
                progression: 'Progression',
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
                roundingPercentage: 0,
            },
        },
    };
});

const config = computed<VueUiDumbbellConfig>(() => {
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
        <VueUiDumbbell :dataset :config>
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
                <DumbbellSvg :svg />
            </template>

            <template #hint="{ hint, isVisible }">
                <KeyboardNavigationHint
                    :hint
                    :is-visible
                    style="margin-top: -24px"
                />
            </template>

            <template #watermark="{ isPrinting }">
                <Watermark :is-printing />
            </template>

            <template #legend="{ legend }">
                <DumbbellLegend :items="legend" />
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>

            <template #skeleton>
                <Skeleton />
            </template>
        </VueUiDumbbell>
    </div>
</template>
