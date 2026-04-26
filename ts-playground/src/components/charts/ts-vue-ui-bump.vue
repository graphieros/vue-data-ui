<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiBump>
 */
import { computed } from 'vue';
import {
    VueUiBump,
    type VueUiBumpConfig,
    type VueUiBumpDatasetItem,
} from 'vue-data-ui/vue-ui-bump';
import { mergeConfigs } from 'vue-data-ui/utils';

import CommonAnnotatorActionColor from '../slots/common/annotator-action-color.vue';
import CommonAnnotatorActionDraw from '../slots/common/annotator-action-draw.vue';
import CommonAnnotatorActionUndo from '../slots/common/annotator-action-undo.vue';
import CommonAnnotatorActionRedo from '../slots/common/annotator-action-redo.vue';
import CommonAnnotatorActionDelete from '../slots/common/annotator-action-delete.vue';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';
import CommonOptionAnnotator from '../slots/common/option-annotator.vue';

import BumpTimeLabel from '../slots/vue-ui-bump/bump-time-label.vue';
import BumpSvg from '../slots/vue-ui-bump/bump-svg.vue';
import KeyboardNavigationHint from '../slots/common/keyboard-navigation-hint.vue';
import Watermark from '../slots/common/watermark.vue';

import 'vue-data-ui/style.css';

const dataset = computed<VueUiBumpDatasetItem[]>(() => {
    return [
        {
            name: 'JavaScript',
            values: [1.2, 1.35, 1.55, 1.75, 2.1, 2.45, 2.75, 3.05, 3.3, 3.5],
        },
        {
            name: 'Python',
            values: [0.65, 0.74, 0.86, 1.02, 1.25, 1.5, 1.75, 2.05, 2.35, 2.6],
        },
        {
            name: 'Java',
            values: [0.9, 0.92, 0.94, 0.96, 0.98, 1.0, 1.02, 1.04, 1.06, 1.08],
        },
        {
            name: 'TypeScript',
            values: [0.06, 0.09, 0.14, 0.23, 0.38, 0.56, 0.76, 0.98, 1.2, 1.45],
        },
        {
            name: 'C#',
            values: [0.52, 0.545, 0.57, 0.6, 0.64, 0.69, 0.74, 0.8, 0.86, 0.92],
        },
        {
            name: 'C++',
            values: [
                0.48, 0.49, 0.5, 0.51, 0.525, 0.54, 0.56, 0.585, 0.61, 0.635,
            ],
        },
        {
            name: 'Go',
            values: [
                0.045, 0.07, 0.11, 0.17, 0.26, 0.36, 0.47, 0.59, 0.72, 0.86,
            ],
        },
        {
            name: 'Rust',
            values: [
                0.005, 0.009, 0.018, 0.035, 0.07, 0.12, 0.19, 0.28, 0.38, 0.5,
            ],
        },
        {
            name: 'PHP',
            values: [0.7, 0.69, 0.68, 0.67, 0.66, 0.65, 0.64, 0.63, 0.62, 0.61],
        },
        {
            name: 'Ruby',
            values: [
                0.23, 0.225, 0.22, 0.215, 0.21, 0.205, 0.2, 0.195, 0.19, 0.185,
            ],
        },
    ];
});

const testPreconfig = computed<VueUiBumpConfig>(() => {
    return {
        skeletonConfig: null,
        skeletonDataset: null,
        loading: false,
        debug: false,
        responsive: false,
        theme: '',
        customPalette: [],
        useCssAnimation: false,
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
        table: {
            show: false,
            responsiveBreakpoint: 400,
            useDialog: false,
            columnNames: {
                series: 'Series',
                period: 'Period',
                values: 'Values',
                ranking: 'Ranking',
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
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                height: 500,
                width: 800,
                layout: {
                    timeLabels: {
                        show: true,
                        values: [
                            1767225600000, 1769904000000, 1772323200000,
                            1775001600000, 1777593600000, 1780272000000,
                            1782864000000, 1785542400000, 1788220800000,
                            1790812800000,
                        ],
                        datetimeFormatter: {
                            enable: true,
                            locale: 'en',
                            useUTC: false,
                            januaryAsYear: false,
                            options: {
                                year: 'yyyy',
                                month: 'MMM yy',
                                day: 'dd MMM',
                                hour: 'HH:mm',
                                minute: 'HH:mm:ss',
                                second: 'HH:mm:ss',
                            },
                        },
                        offsetY: 0,
                        rotation: 0,
                        autoRotate: {
                            enable: true,
                            angle: -30,
                        },
                        fontSize: 14,
                        color: '#2D353C',
                        bold: false,
                        showOnlyFirstAndLast: false,
                        showOnlyAtModulo: false,
                        modulo: 12,
                    },
                    lines: {
                        smooth: true,
                        strokeWidth: 4,
                        coatingColor: '#FFFFFF',
                    },
                    plots: {
                        stroke: '#FFFFFF',
                        strokeWidth: 1,
                        radius: 12,
                        labels: {
                            color: 'auto',
                            show: true,
                            bold: true,
                            displayedValue: 'value',
                            fontSize: 12,
                            prefix: '',
                            suffix: '',
                            rounding: 0,
                            formatter: null,
                        },
                    },
                    nameLabels: {
                        fontSize: 14,
                        color: '#2D353C',
                        useSerieColor: false,
                        bold: false,
                        offsetX: 0,
                        leftLabels: {
                            show: true,
                        },
                        rightLabels: {
                            show: true,
                        },
                    },
                },
                padding: {
                    top: 12,
                    right: 12,
                    bottom: 12,
                    left: 12,
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
    };
});

const config = computed(() => {
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
        <VueUiBump :dataset :config>
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

            <template
                #time-label="{
                    absoluteIndex,
                    content,
                    fill,
                    fontSize,
                    show,
                    textAnchor,
                    transform,
                    x,
                    y,
                }"
            >
                <BumpTimeLabel
                    :absolute-index
                    :content
                    :fill
                    :font-size
                    :show
                    :text-anchor
                    :transform
                    :x
                    :y
                />
            </template>

            <template #svg="{ svg }">
                <BumpSvg :svg />
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
        </VueUiBump>
    </div>
</template>
