<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiQuadrant>
 */
import { computed } from 'vue';
import {
    VueUiQuadrant,
    type VueUiQuadrantConfig,
    type VueUiQuadrantDatasetItem,
} from 'vue-data-ui/vue-ui-quadrant';
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
import QuadrantDatapointSvg from '../slots/vue-ui-quadrant/quadrant-datapoint-svg.vue';
import QuadrantSvg from '../slots/vue-ui-quadrant/quadrant-svg.vue';
import QuadrantLegend from '../slots/vue-ui-quadrant/quadrant-legend.vue';
import QuadrantTooltip from '../slots/vue-ui-quadrant/quadrant-tooltip.vue';

const dataset = computed<VueUiQuadrantDatasetItem[]>(() => {
    return [
        {
            name: 'Stars',
            shape: 'star',
            color: '#5f8bee',
            series: [
                {
                    name: 'Star 1',
                    x: 50,
                    y: 50,
                },
                {
                    name: 'Star 2',
                    x: -10,
                    y: -10,
                },
                {
                    name: 'Star 3',
                    x: -15,
                    y: 20,
                },
                {
                    name: 'Star 4',
                    x: 15,
                    y: -20,
                },
            ],
        },
        {
            name: 'Triangles',
            shape: 'triangle',
            color: '#42d392',
            series: [
                {
                    name: 'Triangle 1',
                    x: -50,
                    y: -50,
                },
                {
                    name: 'Triangle 2',
                    x: 25,
                    y: -25,
                },
                {
                    name: 'Triangle 3',
                    x: -25,
                    y: 25,
                },
                {
                    name: 'Triangle 4',
                    x: 10,
                    y: 10,
                },
            ],
        },
        {
            name: 'Hexagons',
            shape: 'hexagon',
            color: '#ff6400',
            series: [
                {
                    name: 'Hexagon 1',
                    x: -39,
                    y: 39,
                },
                {
                    name: 'Hexagon 2',
                    x: -2,
                    y: 45,
                },
                {
                    name: 'Hexagon 3',
                    x: -15,
                    y: 30,
                },
            ],
        },
    ];
});

const testPreconfig = computed<VueUiQuadrantConfig>(() => {
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
        theme: '',
        customPalette: [],
        useCssAnimation: false,
        zoomAnimationFrames: 20,
        zoomEnabled: true,
        downsample: {
            threshold: 1095,
        },
        style: {
            fontFamily: 'inherit',
            chart: {
                height: 512,
                width: 512,
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                layout: {
                    labels: {
                        quadrantLabels: {
                            show: true,
                            tl: {
                                text: '',
                                color: '#2D353C',
                                fontSize: 16,
                                bold: true,
                            },
                            tr: {
                                text: '',
                                color: '#2D353C',
                                fontSize: 16,
                                bold: true,
                            },
                            br: {
                                text: '',
                                color: '#2D353C',
                                fontSize: 16,
                                bold: true,
                            },
                            bl: {
                                text: '',
                                color: '#2D353C',
                                fontSize: 16,
                                bold: true,
                            },
                        },
                        plotLabels: {
                            showAsTag: false,
                            show: true,
                            fontSize: 10,
                            color: '#2D353C',
                            offsetY: 8,
                            rounding: 0,
                            x: {
                                formatter: null,
                            },
                            y: {
                                formatter: null,
                            },
                        },
                        axisLabels: {
                            show: true,
                            fontSize: 14,
                            color: {
                                positive: '#2D353C',
                                negative: '#2D353C',
                            },
                        },
                    },
                    grid: {
                        stroke: '#e1e5e8',
                        strokeWidth: 1.5,
                        showArrows: true,
                        graduations: {
                            stroke: '#e1e5e8',
                            strokeWidth: 0.5,
                            show: true,
                            steps: 5,
                            fill: true,
                            color: '#e1e5e8',
                            roundingForce: 10,
                        },
                        xAxis: {
                            min: -100,
                            max: 100,
                            auto: true,
                            name: '',
                            show: true,
                        },
                        yAxis: {
                            min: -100,
                            max: 100,
                            auto: true,
                            name: '',
                            show: true,
                        },
                    },
                    plots: {
                        radius: 6,
                        outline: true,
                        outlineColor: '#FFFFFF',
                        outlineWidth: 1,
                    },
                    areas: {
                        show: true,
                        opacity: 40,
                        useGradient: true,
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
                    showShape: true,
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
            },
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
            category: 'Category',
            item: 'Item',
            side: 'Side',
        },
    };
});

const config = computed<VueUiQuadrantConfig>(() => {
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
        <VueUiQuadrant :dataset :config>
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

            <template #datapointSvg="{ datapoint }">
                <QuadrantDatapointSvg :datapoint />
            </template>

            <template #svg="{ svg }">
                <QuadrantSvg :svg />
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
                <QuadrantLegend :items="legend" />
            </template>

            <template #tooltip-before>
                <span style="color: chocolate"> #tooltip-before </span>
                <br />
            </template>

            <template #tooltip="{ datapoint, seriesIndex }">
                <QuadrantTooltip :datapoint :series-index />
            </template>

            <template #tooltip-after>
                <br />
                <span style="color: chocolate"> #tooltip-after </span>
            </template>
        </VueUiQuadrant>
    </div>
</template>
