<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiHeatmap>
 */
import { ref, computed } from 'vue';
import {
    VueUiHeatmap,
    type VueUiHeatmapDatasetItem,
    type VueUiHeatmapConfig,
} from 'vue-data-ui/vue-ui-heatmap';
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

import HeatmapSvg from '../slots/vue-ui-heatmap/heatmap-svg.vue';
import HeatmapTooltip from '../slots/vue-ui-heatmap/heatmap-tooltip.vue';

function initDataset(): VueUiHeatmapDatasetItem[] {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const arr = [];
    const dsLen = 26;
    const serieLen = days.length;
    for (let i = 0; i < serieLen; i += 1) {
        const values = [];
        for (let j = 0; j < dsLen; j += 1) {
            values.push(i + j * 2);
        }
        arr.push({
            name: `${days[i]}`,
            values,
        });
    }
    return arr;
}

const dataset = computed(() => initDataset());

const testPreconfig = computed<VueUiHeatmapConfig>(() => {
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
        style: {
            fontFamily: 'inherit',
            backgroundColor: '#FFFFFF',
            color: '#2D353C',
            layout: {
                height: 300,
                width: 1000,
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
                crosshairs: {
                    show: false,
                    stroke: '#2D353C',
                    strokeWidth: 1,
                    strokeDasharray: 0,
                },
                cells: {
                    rowTotal: {
                        value: {
                            show: false,
                        },
                        color: {
                            show: false,
                        },
                    },
                    columnTotal: {
                        value: {
                            show: false,
                            rotation: 0,
                            autoRotate: {
                                enable: true,
                                angle: -30,
                            },
                            offsetX: 0,
                            offsetY: 0,
                        },
                        color: {
                            show: false,
                        },
                    },
                    value: {
                        show: false,
                        fontSize: 18,
                        bold: false,
                        roundingValue: 0,
                        color: '#2D353C',
                        formatter: null,
                    },
                    colors: {
                        hot: '#d62728',
                        cold: '#1f77b4',
                        underlayer: '#FFFFFF',
                    },
                    spacing: 4,
                    selected: {
                        border: 4,
                        color: '#2D353C',
                    },
                },
                dataLabels: {
                    prefix: '',
                    suffix: '',
                    xAxis: {
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
                        showOnlyAtModulo: null,
                        rotation: 0,
                        autoRotate: {
                            enable: true,
                            angle: -30,
                        },
                        fontSize: 10,
                        color: '#2D353C',
                        bold: false,
                        offsetX: 0,
                        offsetY: 0,
                    },
                    yAxis: {
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
                        color: '#2D353C',
                        bold: false,
                        offsetX: 0,
                        offsetY: 0,
                    },
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
                fontSize: 12,
                selectAllToggle: {
                    show: false,
                    backgroundColor: '#e1e5e8',
                    color: '#2D353C',
                },
                roundingValue: 0,
                width: 24,
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
            colNames: {
                xAxis: 'X',
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

const config = computed<VueUiHeatmapConfig>(() => {
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
        <VueUiHeatmap :dataset :config>
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
                            #00ff00
                        );
                    "
                >
                    <code style="color: chocolate"> #chart-background </code>
                </div>
            </template>

            <template #svg="{ svg }">
                <HeatmapSvg :svg />
            </template>

            <template #tooltip-before>
                <span style="color: chocolate"> #tooltip-before </span>
                <br />
            </template>

            <template #tooltip="{ datapoint, seriesIndex }">
                <HeatmapTooltip :datapoint :seriesIndex />
            </template>

            <template #tooltip-after>
                <br />
                <span style="color: chocolate"> #tooltip-after </span>
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>

            <template #skeleton>
                <Skeleton />
            </template>
        </VueUiHeatmap>
    </div>
</template>
