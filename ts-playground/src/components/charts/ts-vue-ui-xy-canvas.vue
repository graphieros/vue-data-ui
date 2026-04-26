<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiXyCanvas>
 */
import { computed } from 'vue';
import {
    VueUiXyCanvas,
    type VueUiXyCanvasConfig,
    type VueUiXyCanvasDatasetItem,
} from 'vue-data-ui/vue-ui-xy-canvas';
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
import CommonOptionsStack from '../slots/common/options-stack.vue';
import XyCanvasTooltip from '../slots/vue-ui-xy-canvas/xy-canvas-tooltip.vue';
import CommonResetAction from '../slots/common/reset-action.vue';
import XyCanvasLegend from '../slots/vue-ui-xy-canvas/xy-canvas-legend.vue';

function makeDs(n: number) {
    const arr = [];
    for (let i = 0; i < n; i += 1) {
        arr.push(Math.random() * 100);
    }
    return arr;
}

const dataset = computed<VueUiXyCanvasDatasetItem[]>(() => {
    return [
        {
            name: 'Series 1',
            series: makeDs(100),
            type: 'line',
            scaleSteps: 5,
            dataLabels: false,
        },
        {
            name: 'Series 1',
            series: makeDs(100),
            type: 'bar',
            dataLabels: false,
        },
    ];
});

const testPreconfig = computed<VueUiXyCanvasConfig>(() => {
    return {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false,
        loading: false,
        responsive: false,
        theme: '',
        customPalette: [],
        a11y: {
            translations: {
                keyboardNavigation:
                    'Use the left and right arrow keys to move between data points.',
                tableAvailable:
                    'A data table for this chart is available below.',
                tableCaption: 'Chart data table',
            },
        },
        downsample: {
            threshold: 10000,
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
                stack: true,
                animation: false,
                annotator: true,
                svg: false,
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
                stack: 'Toggle stack mode',
                annotator: 'Toggle annotator',
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
            fontFamily: 'Arial',
            chart: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                aspectRatio: '12 / 9',
                stacked: false,
                stackGap: 20,
                scale: {
                    ticks: 10,
                    min: null,
                    max: null,
                },
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
                    minimap: {
                        show: true,
                        selectedColor: '#1f77b4',
                        selectedColorOpacity: 0.2,
                        indicatorColor: '#2D353C',
                        verticalHandles: false,
                        compact: true,
                        frameColor: '#A1A1A1',
                        additionalHeight: 0,
                        handleIconColor: null,
                        handleBorderWidth: 1,
                        handleBorderColor: null,
                        handleFill: null,
                        handleWidth: 20,
                        handleType: 'grab',
                        smooth: false,
                        lineColor: '#2D353C',
                        selectionRadius: 2,
                        merged: false,
                    },
                    preview: {
                        enable: false,
                        fill: '#CCCCCC50',
                        stroke: '#6A6A6A',
                        strokeWidth: 2,
                        strokeDasharray: 0,
                    },
                    useDefaultFormat: true,
                    timeFormat: 'yyyy-MM-dd HH:mm:ss',
                    customFormat: null,
                },
                selector: {
                    show: true,
                    color: '#2D353C',
                    dashed: true,
                    showHorizontalSelector: false,
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
                    showTimeLabel: true,
                    useDefaultTimeFormat: true,
                    timeFormat: 'yyyy-MM-dd HH:mm:ss',
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
                grid: {
                    y: {
                        showAxis: true,
                        axisColor: '#2D353C',
                        axisThickness: 2,
                        axisName: '',
                        axisLabels: {
                            show: true,
                            fontSizeRatio: 1,
                            color: '#2D353C',
                            offsetX: 0,
                            rounding: 1,
                            prefix: '',
                            suffix: '',
                            bold: false,
                        },
                        verticalLines: {
                            show: true,
                            color: '#CCCCCC',
                            hideUnderXLength: 20,
                            position: 'middle',
                        },
                    },
                    x: {
                        showAxis: true,
                        axisColor: '#2D353C',
                        axisThickness: 2,
                        axisName: '',
                        horizontalLines: {
                            show: true,
                            color: '#CCCCCC',
                            alternate: true,
                            opacity: 20,
                        },
                        timeLabels: {
                            show: true,
                            showMarker: true,
                            fontSizeRatio: 0.8,
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
                            rotation: 0,
                            offsetY: 30,
                            color: '#2D353C',
                            modulo: 12,
                            bold: false,
                        },
                    },
                    zeroLine: {
                        show: true,
                        color: '#2D353C',
                        dashed: true,
                    },
                },
                line: {
                    cutNullValues: true,
                    plots: {
                        show: true,
                        radiusRatio: 1,
                    },
                },
                bar: {
                    gradient: {
                        show: true,
                    },
                },
                area: {
                    opacity: 60,
                },
                dataLabels: {
                    show: true,
                    fontSizeRatio: 1,
                    useSerieColor: true,
                    color: '#2D353C',
                    offsetY: -12,
                    formatter: null,
                    bold: true,
                },
                paddingProportions: {
                    top: 0.1,
                    right: 0.05,
                    bottom: 0.1,
                    left: 0.1,
                },
            },
        },
        table: {
            show: false,
            responsiveBreakpoint: 400,
            useDialog: false,
            rounding: 1,
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
            },
        },
    };
});

const config = computed<VueUiXyCanvasConfig>(() => {
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
        <VueUiXyCanvas :dataset :config>
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

            <template #optionLabels>
                <code
                    style="
                        color: chocolate;
                        font-size: 0.7rem;
                        pointer-events: none;
                    "
                    >#optionLabels</code
                >
            </template>

            <template #optionStack="{ isStack }">
                <CommonOptionsStack :is-stack />
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
                <XyCanvasTooltip :datapoint :series-index />
            </template>

            <template #tooltip-after>
                <br />
                <span style="color: chocolate"> #tooltip-after </span>
            </template>

            <template #reset-action="{ reset }">
                <CommonResetAction :reset />
            </template>

            <template #legend="{ legend }">
                <XyCanvasLegend :items="legend" />
            </template>
        </VueUiXyCanvas>
    </div>
</template>
