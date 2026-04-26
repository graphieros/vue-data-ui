<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiDonutEvolution>
 */
import { computed } from 'vue';
import {
    VueUiDonutEvolution,
    type VueUiDonutEvolutionConfig,
    type VueUiDonutEvolutionDatasetItem,
} from 'vue-data-ui/vue-ui-donut-evolution';
import { mergeConfigs } from 'vue-data-ui/utils';

import CommonAnnotatorActionColor from '../slots/common/annotator-action-color.vue';
import CommonAnnotatorActionDraw from '../slots/common/annotator-action-draw.vue';
import CommonAnnotatorActionUndo from '../slots/common/annotator-action-undo.vue';
import CommonAnnotatorActionRedo from '../slots/common/annotator-action-redo.vue';
import CommonAnnotatorActionDelete from '../slots/common/annotator-action-delete.vue';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';
import CommonOptionAnnotator from '../slots/common/option-annotator.vue';
import CommonResetAction from '../slots/common/reset-action.vue';

import 'vue-data-ui/style.css';

import DonutEvolutionSvg from '../slots/vue-ui-donut-evolution/donut-evolution-svg.vue';
import KeyboardNavigationHint from '../slots/common/keyboard-navigation-hint.vue';
import Watermark from '../slots/common/watermark.vue';
import DonutEvolutionLegend from '../slots/vue-ui-donut-evolution/donut-evolution-legend.vue';

const dataset = computed<VueUiDonutEvolutionDatasetItem[]>(() => {
    return [
        {
            name: 'Serie 1',
            values: [55, 34, 21, 13, 8, 5, 8, 13, 21, 34, 55],
        },
        {
            name: 'Serie 2',
            values: [1, 12, 24, 32, 5, 8, 13, 21, 34, 55, 89],
        },
        {
            name: 'Serie 3',
            values: [16, 2, 3, 5, 28, 13, 21, 34, 55, 89, 134],
        },
        {
            name: 'Serie 4',
            values: [5, null, 5, 5, 5, 5],
        },
    ];
});

const testPreconfig = computed<VueUiDonutEvolutionConfig>(() => {
    return {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false,
        loading: false,
        responsive: false,
        theme: '',
        a11y: {
            translations: {
                keyboardNavigation:
                    'Use the left and right arrow keys to move between data points.',
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
        customPalette: [],
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                zoom: {
                    show: true,
                    color: '#CCCCCC',
                    highlightColor: '#4A4A4A',
                    fontSize: 14,
                    useResetSlot: false,
                    startIndex: null,
                    endIndex: null,
                    enableRangeHandles: true,
                    enableSelectionDrag: true,
                    focusOnDrag: false,
                    focusRangeRatio: 0.2,
                    maxWidth: null,
                },
                donuts: {
                    hover: {
                        hideLabelsUnderValue: 5,
                    },
                },
                dialog: {
                    show: true,
                    backgroundColor: '#FFFFFF',
                    color: '#2D353C',
                    header: {
                        backgroundColor: '#FFFFFF',
                        color: '#2D353C',
                    },
                    donutChart: {
                        skeletonConfig: null,
                        skeletonDataset: null,
                        debug: false,
                        type: 'classic',
                        loading: false,
                        pie: false,
                        autoSize: true,
                        responsive: true,
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
                        serieToggleAnimation: {
                            show: true,
                            durationMs: 500,
                        },
                        startAnimation: {
                            show: false,
                            durationMs: 1000,
                            staggerMs: 50,
                        },
                        useBlurOnHover: true,
                        userOptions: {
                            show: true,
                            showOnChartHover: false,
                            keepStateOnChartLeave: true,
                            position: 'right',
                            buttons: {
                                tooltip: true,
                                pdf: false,
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
                        translations: {
                            total: 'Total',
                            average: 'Average',
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
                                roundingPercentage: 0,
                            },
                            columnNames: {
                                series: 'Series',
                                value: 'Value',
                                percentage: 'Percentage',
                            },
                        },
                        style: {
                            fontFamily: 'inherit',
                            chart: {
                                useGradient: true,
                                gradientIntensity: 40,
                                backgroundColor: '#FFFFFF',
                                color: '#2D353C',
                                padding: {
                                    top: 0,
                                    right: 0,
                                    bottom: 0,
                                    left: 0,
                                },
                                width: 512,
                                height: 360,
                                layout: {
                                    curvedMarkers: false,
                                    labels: {
                                        dataLabels: {
                                            showValueFirst: true,
                                            usePercentageParens: true,
                                            useValueParens: false,
                                            show: true,
                                            useLabelSlots: false,
                                            hideUnderValue: 3,
                                            smallArcClusterThreshold: 8,
                                            smallArcClusterFontSize: 12,
                                            oneLine: false,
                                            prefix: '',
                                            suffix: '',
                                        },
                                        value: {
                                            rounding: 0,
                                            show: true,
                                            formatter: null,
                                        },
                                        percentage: {
                                            show: true,
                                            color: '#2D353C',
                                            bold: true,
                                            fontSize: 16,
                                            minFontSize: 6,
                                            rounding: 0,
                                            formatter: null,
                                        },
                                        name: {
                                            show: true,
                                            color: '#2D353C',
                                            bold: false,
                                            fontSize: 12,
                                            minFontSize: 6,
                                        },
                                        hollow: {
                                            show: true,
                                            total: {
                                                show: true,
                                                bold: false,
                                                fontSize: 18,
                                                color: '#2D353C',
                                                text: 'Total',
                                                offsetY: 0,
                                                value: {
                                                    color: '#2D353C',
                                                    fontSize: 18,
                                                    bold: true,
                                                    suffix: '',
                                                    prefix: '',
                                                    offsetY: 0,
                                                    rounding: 0,
                                                    formatter: null,
                                                },
                                            },
                                            average: {
                                                show: false,
                                                bold: false,
                                                fontSize: 18,
                                                color: '#A1A1A1',
                                                text: 'Average',
                                                offsetY: 0,
                                                value: {
                                                    color: '#2D353C',
                                                    fontSize: 18,
                                                    bold: true,
                                                    suffix: '',
                                                    prefix: '',
                                                    offsetY: 0,
                                                    rounding: 0,
                                                    formatter: null,
                                                },
                                            },
                                        },
                                    },
                                    donut: {
                                        radiusRatio: 0.3,
                                        strokeWidth: 64,
                                        borderWidth: 1,
                                        useShadow: false,
                                        shadowColor: '#2D353C',
                                        emptyFill: '#e1e5e8',
                                        selectedColor: '#0000001A',
                                        borderColorAuto: true,
                                        borderColor: '#e1e5e8',
                                    },
                                },
                                comments: {
                                    show: true,
                                    showInTooltip: true,
                                    width: 100,
                                    offsetY: 0,
                                    offsetX: 0,
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
                                    showValueFirst: true,
                                    usePercentageParens: true,
                                    useValueParens: false,
                                    roundingValue: 0,
                                    roundingPercentage: 0,
                                    showPercentage: true,
                                    showValue: true,
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
                                    showValueFirst: true,
                                    usePercentageParens: true,
                                    useValueParens: false,
                                    showValue: true,
                                    showPercentage: true,
                                    roundingValue: 0,
                                    roundingPercentage: 0,
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
                    },
                },
                layout: {
                    height: 316,
                    width: 512,
                    padding: {
                        top: 5,
                        right: 10,
                        bottom: 5,
                        left: 10,
                    },
                    grid: {
                        show: true,
                        stroke: '#e1e5e8',
                        strokeWidth: 0.7,
                        showVerticalLines: true,
                        axis: {
                            yLabel: '',
                            yLabelOffsetX: 0,
                            xLabel: '',
                            xLabelOffsetY: 0,
                            fontSize: 14,
                            color: '#2D353C',
                        },
                        yAxis: {
                            scaleMin: null,
                            scaleMax: null,
                            autoScale: false,
                            dataLabels: {
                                show: true,
                                fontSize: 10,
                                color: '#2D353C',
                                roundingValue: 0,
                                offsetX: 0,
                                bold: false,
                                steps: 10,
                            },
                        },
                        xAxis: {
                            dataLabels: {
                                show: true,
                                values: [],
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
                                fontSize: 10,
                                showOnlyFirstAndLast: false,
                                color: '#2D353C',
                                rotation: 0,
                                autoRotate: {
                                    enable: true,
                                    angle: -30,
                                },
                                offsetY: 0,
                            },
                        },
                    },
                    line: {
                        show: true,
                        stroke: '#CCCCCC',
                        strokeWidth: 4,
                    },
                    highlighter: {
                        color: '#2D353C',
                        opacity: 5,
                    },
                    dataLabels: {
                        show: true,
                        fontSize: 10,
                        color: '#2D353C',
                        bold: false,
                        rounding: 0,
                        prefix: '',
                        suffix: '',
                        offsetY: 0,
                        formatter: null,
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
                    roundingPercentage: 0,
                    showValue: true,
                    showPercentage: true,
                    position: 'bottom',
                },
            },
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
                period: 'Period',
                total: 'Total',
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

const config = computed<VueUiDonutEvolutionConfig>(() => {
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
        <VueUiDonutEvolution :dataset :config>
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
                <DonutEvolutionSvg :svg />
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

            <template #reset-action="{ reset }">
                <CommonResetAction :reset />
            </template>

            <template #legend="{ legend }">
                <DonutEvolutionLegend :items="legend" />
            </template>
        </VueUiDonutEvolution>
    </div>
</template>
