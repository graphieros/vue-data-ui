<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiStackline>
 */
import { computed } from 'vue';
import {
    VueUiStackline,
    type VueUiStacklineConfig,
    type VueUiStacklineDatasetItem,
} from 'vue-data-ui/vue-ui-stackline';
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
import StackbarTimeLabel from '../slots/vue-ui-stackbar/stackbar-time-label.vue';
import StacklineTimeLabel from '../slots/vue-ui-stackline/stackline-time-label.vue';
import StacklineSvg from '../slots/vue-ui-stackline/stackline-svg.vue';
import StacklineLegend from '../slots/vue-ui-stackline/stackline-legend.vue';
import CommonResetAction from '../slots/common/reset-action.vue';
import StacklineTooltip from '../slots/vue-ui-stackline/stackline-tooltip.vue';

const dataset = computed<VueUiStacklineDatasetItem[]>(() => {
    return [
        {
            name: 'Serie 1',
            series: [19, 20.07, 30, 40, 50, 60, 25, 29, 32, 12, 12, 12],
            shape: 'square',
        },
        {
            name: 'Serie 2',
            series: [13, 8, 9, 13, 25, 27, 16, null, 19],
            shape: 'hexagon',
        },
        {
            name: 'Serie 3',
            series: [13, 10, 9, 13, 25, 19, 12, 13, 21],
            shape: 'triangle',
        },
        {
            name: 'Serie 4',
            series: [25, 23, 9, 13, 25, 31, 16, 19, 18],
            shape: 'star',
        },
    ];
});

const testPreconfig = computed<VueUiStacklineConfig>(() => {
    return {
        skeletonDataset: null,
        skeletonConfig: null,
        loading: false,
        debug: false,
        theme: '',
        responsive: false,
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
        useCssAnimation: false,
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
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                height: 500,
                width: 800,
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
                        show: false,
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
                    },
                    preview: {
                        enable: true,
                        fill: '#CCCCCC50',
                        stroke: '#6A6A6A',
                        strokeWidth: 2,
                        strokeDasharray: 0,
                    },
                    useDefaultFormat: true,
                    timeFormat: 'yyyy-MM-dd HH:mm:ss',
                    customFormat: null,
                },
                highlighter: {
                    color: '#2D353C',
                    opacity: 5,
                    useLine: false,
                    lineDasharray: 2,
                    lineWidth: 1,
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
                    showTimeLabel: true,
                    showTotal: false,
                    totalTranslation: 'Total',
                    useDefaultTimeFormat: true,
                    timeFormat: 'yyyy-MM-dd HH:mm:ss',
                },
                grid: {
                    scale: {
                        ticks: 10,
                        scaleMin: null,
                        scaleMax: null,
                    },
                    frame: {
                        show: false,
                        stroke: '#e1e5e8',
                        strokeWidth: 2,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        strokeDasharray: 0,
                    },
                    x: {
                        showAxis: true,
                        showHorizontalLines: false,
                        axisColor: '#e1e5e8',
                        linesColor: '#e1e5e8',
                        linesThickness: 1,
                        linesStrokeDasharray: 0,
                        axisThickness: 2,
                        axisName: {
                            show: true,
                            text: '',
                            fontSize: 14,
                            color: '#2D353C',
                            bold: false,
                            offsetY: 0,
                        },
                        timeLabels: {
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
                    },
                    y: {
                        showAxis: true,
                        showVerticalLines: false,
                        linesColor: '#e1e5e8',
                        linesThickness: 1,
                        linesStrokeDasharray: 0,
                        axisColor: '#e1e5e8',
                        axisThickness: 2,
                        axisName: {
                            show: true,
                            text: '',
                            fontSize: 14,
                            color: '#2D353C',
                            bold: false,
                            offsetX: 0,
                        },
                        axisLabels: {
                            formatter: null,
                            show: true,
                            color: '#2D353C',
                            fontSize: 14,
                            bold: false,
                            rounding: 0,
                        },
                    },
                },
                lines: {
                    useArea: true,
                    smooth: false,
                    areaOpacity: 0.5,
                    distributed: false,
                    showDistributedPercentage: true,
                    strokeWidth: 1,
                    gradient: {
                        show: true,
                        intensity: 40,
                    },
                    path: {
                        useSerieColor: true,
                        stroke: '#FFFFFF',
                    },
                    dot: {
                        hideAboveMaxSerieLength: 62,
                        useSerieColor: true,
                        fill: '#FFFFFF',
                        stroke: '#FFFFFF',
                        strokeWidth: 0.5,
                        radius: 4,
                    },
                    totalValues: {
                        show: true,
                        offsetY: 0,
                        fontSize: 16,
                        bold: true,
                        color: '#2D353C',
                    },
                    dataLabels: {
                        hideAboveMaxSerieLength: 62,
                        offsetY: 0,
                        show: true,
                        hideEmptyValues: true,
                        hideUnderValue: null,
                        hideEmptyPercentages: true,
                        hideUnderPercentage: null,
                        color: '#2D353C',
                        fontSize: 14,
                        bold: false,
                        rounding: 0,
                        prefix: '',
                        suffix: '',
                        formatter: null,
                    },
                },
            },
        },
    };
});

const config = computed<VueUiStacklineConfig>(() => {
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
        <VueUiStackline :dataset :config>
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

            <template #pattern="{ seriesIndex, patternId }">
                <PatternSlot :series-index :pattern-id color="#6376DD" />
            </template>

            <template #time-label="label">
                <StacklineTimeLabel
                    v-bind="label"
                    :offset-y="label.fontSize * 1.5"
                />
            </template>

            <template #svg="{ svg }">
                <StacklineSvg :svg />
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
                <StacklineLegend :items="legend" />
            </template>

            <template #reset-action="{ reset }">
                <CommonResetAction :reset />
            </template>

            <template #tooltip-before>
                <span style="color: chocolate"> #tooltip-before </span>
                <br />
            </template>

            <template #tooltip="{ datapoint, seriesIndex }">
                <StacklineTooltip :datapoint :series-index />
            </template>

            <template #tooltip-after>
                <br />
                <span style="color: chocolate"> #tooltip-after </span>
            </template>
        </VueUiStackline>
    </div>
</template>
