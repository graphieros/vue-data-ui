<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiHorizontalBar>
 */
import { computed } from 'vue';
import {
    VueUiHorizontalBar,
    type VueUiHorizontalBarConfig,
    type VueUiHorizontalBarDatasetItem,
} from 'vue-data-ui/vue-ui-horizontal-bar';
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

import HorizontalBarSvg from '../slots/vue-ui-horizontal-bar/horizontal-bar-svg.vue';
import HorizontalBarLegend from '../slots/vue-ui-horizontal-bar/horizontal-bar-legend.vue';
import HorizontalBarTooltip from '../slots/vue-ui-horizontal-bar/horizontal-bar-tooltip.vue';

const dataset = computed<VueUiHorizontalBarDatasetItem[]>(() => {
    return [
        {
            name: 'Serie 1',
            value: 100,
            children: [
                {
                    name: 'serie 1 child 1',
                    value: 80,
                },
                {
                    name: 'serie 1 child 2',
                    value: 20,
                },
            ],
        },
        {
            name: 'Serie 2',
            value: 345,
        },
        {
            name: 'Serie 3',
            value: 210,
        },
        {
            name: 'Serie 4',
            value: 188,
        },
        {
            name: 'Serie 5',
            value: 120,
            children: [
                {
                    name: 'Serie 5 child 1',
                    value: 60,
                },
                {
                    name: 'Serie 5 child 2',
                    value: 20,
                },
                {
                    name: 'Serie 5 child 3',
                    value: 40,
                },
            ],
        },
    ];
});

const testPreconfig = computed<VueUiHorizontalBarConfig>(() => {
    return {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false,
        loading: false,
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
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                width: 512,
                height: 316,
                layout: {
                    bars: {
                        rowColor: null,
                        rowRadius: 4,
                        sort: 'desc',
                        useStroke: false,
                        strokeWidth: 2,
                        height: 32,
                        gap: 6,
                        borderRadius: 4,
                        offsetX: 12,
                        paddingRight: 0,
                        useGradient: true,
                        gradientIntensity: 20,
                        fillOpacity: 90,
                        underlayerColor: '#FFFFFF',
                        dataLabels: {
                            color: '#2D353C',
                            bold: true,
                            fontSize: 14,
                            value: {
                                show: true,
                                roundingValue: 0,
                                prefix: '',
                                suffix: '',
                                formatter: null,
                            },
                            percentage: {
                                show: true,
                                roundingPercentage: 0,
                            },
                            offsetX: 0,
                        },
                        nameLabels: {
                            show: true,
                            color: '#2D353C',
                            bold: false,
                            fontSize: 14,
                            offsetX: 0,
                        },
                        parentLabels: {
                            show: true,
                            color: '#2D353C',
                            bold: false,
                            fontSize: 14,
                            offsetX: 0,
                            paddingBottom: 0,
                        },
                    },
                    highlighter: {
                        color: '#2D353C',
                        opacity: 5,
                    },
                    separators: {
                        show: false,
                        color: '#e1e5e8',
                        strokeWidth: 1,
                        fullWidth: true,
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
                    position: 'top',
                    roundingValue: 0,
                    roundingPercentage: 0,
                    prefix: '',
                    suffix: '',
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
                    showValue: true,
                    showPercentage: true,
                    roundingValue: 0,
                    roundingPercentage: 0,
                    prefix: '',
                    suffix: '',
                },
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
                sort: true,
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
                sort: 'Toggle sort',
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
                roundingPercentage: 0,
                prefix: '',
                suffix: '',
            },
        },
        translations: {
            parentName: 'Serie',
            childName: 'Child',
            value: 'value',
            percentageToTotal: '%/total',
            percentageToSerie: '%/serie',
        },
    };
});

const config = computed<VueUiHorizontalBarConfig>(() => {
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
        <VueUiHorizontalBar :dataset :config>
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

            <template #optionSort>
                <code
                    style="
                        color: chocolate;
                        font-size: 0.7rem;
                        pointer-events: none;
                    "
                    >#optionSort</code
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

            <template #pattern="{ seriesIndex, patternId }">
                <PatternSlot :series-index :pattern-id color="#FFFFFF" />
            </template>

            <template #svg="{ svg }">
                <HorizontalBarSvg :svg />
            </template>

            <template #hint="{ hint, isVisible }">
                <KeyboardNavigationHint
                    :hint
                    :is-visible
                    style="margin-top: 0"
                />
            </template>

            <template #watermark="{ isPrinting }">
                <Watermark :is-printing />
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>

            <template #legend="{ legend }">
                <HorizontalBarLegend :items="legend" />
            </template>

            <template #tooltip-before>
                <span style="color: chocolate"> #tooltip-before </span>
                <br />
            </template>

            <template #tooltip="{ datapoint, seriesIndex }">
                <HorizontalBarTooltip :datapoint :series-index />
            </template>

            <template #tooltip-after>
                <br />
                <span style="color: chocolate"> #tooltip-after </span>
            </template>

            <template #skeleton>
                <Skeleton />
            </template>
        </VueUiHorizontalBar>
    </div>
</template>
