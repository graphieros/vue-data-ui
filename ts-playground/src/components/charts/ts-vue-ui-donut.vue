<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiDonut>
 */
import { computed } from 'vue';
import {
    VueUiDonut,
    type VueUiDonutConfig,
    type VueUiDonutDatasetItem,
} from 'vue-data-ui/vue-ui-donut';
import { mergeConfigs } from 'vue-data-ui/utils';
import 'vue-data-ui/style.css';

import DonutLegend from '../slots/vue-ui-donut/donut-legend.vue';
import DonutTooltip from '../slots/vue-ui-donut/donut-tooltip.vue';
import DonutDataLabel from '../slots/vue-ui-donut/donut-data-label.vue';
import DonutPlotComment from '../slots/vue-ui-donut/donut-plot-comment.vue';
import DonutSvg from '../slots/vue-ui-donut/donut-svg.vue';
import DonutHollow from '../slots/vue-ui-donut/donut-hollow.vue';
import DonutOptionAltCopy from '../slots/vue-ui-donut/donut-option-alt-copy.vue';

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

const dataset = computed<VueUiDonutDatasetItem[]>(() => [
    {
        name: 'A',
        values: [1],
        comment: 'Comment',
    },
    {
        name: 'B',
        values: [2],
    },
    {
        name: 'C',
        values: [3],
    },
]);

const testPreconfig = computed<VueUiDonutConfig>(() => {
    return {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false,
        type: 'classic',
        loading: false,
        pie: false,
        autoSize: true,
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
                            fontSize: 18,
                            minFontSize: 6,
                            rounding: 0,
                            formatter: null,
                        },
                        name: {
                            show: true,
                            color: '#2D353C',
                            bold: false,
                            fontSize: 14,
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
                                show: true,
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
    } satisfies VueUiDonutConfig;
});

const config = computed<VueUiDonutConfig>(() => {
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
            style: {
                chart: {
                    layout: {
                        labels: {
                            dataLabels: {
                                useLabelSlots: true,
                            },
                        },
                    },
                },
            },
        },
    });
});
</script>

<template>
    <div>
        <VueUiDonut :dataset :config>
            <template #legend="{ legend }">
                <DonutLegend :items="legend" />
            </template>

            <template #tooltip-before>
                <span style="color: chocolate"> #tooltip-before </span>
                <br />
            </template>

            <template #tooltip="{ datapoint, seriesIndex }">
                <DonutTooltip :datapoint :series-index />
            </template>

            <template #tooltip-after>
                <br />
                <span style="color: chocolate"> #tooltip-after </span>
            </template>

            <template #dataLabel="{ datapoint }">
                <DonutDataLabel :datapoint />
            </template>

            <template #plot-comment="{ plot }">
                <DonutPlotComment :plot />
            </template>

            <template #svg="{ svg }">
                <DonutSvg :svg />
            </template>

            <template #pattern="{ seriesIndex, patternId }">
                <PatternSlot :series-index :pattern-id color="#6376DD" />
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

            <template #hollow="{ width, height, total, average, dataset }">
                <DonutHollow :width :height :total :average :dataset />
            </template>

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

            <template #optionAltCopy="{ copyAlt }">
                <DonutOptionAltCopy :copy-alt />
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
        </VueUiDonut>
    </div>
</template>
