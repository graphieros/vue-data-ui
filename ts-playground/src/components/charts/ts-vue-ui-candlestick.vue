<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiCandlestick>
 */
import { computed } from 'vue';
import { mergeConfigs } from 'vue-data-ui/utils';
import {
    VueUiCandlestick,
    type OHLC,
    type VueUiCandlestickConfig,
} from 'vue-data-ui/vue-ui-candlestick';

import CommonAnnotatorActionColor from '../slots/common/annotator-action-color.vue';
import CommonAnnotatorActionDraw from '../slots/common/annotator-action-draw.vue';
import CommonAnnotatorActionUndo from '../slots/common/annotator-action-undo.vue';
import CommonAnnotatorActionRedo from '../slots/common/annotator-action-redo.vue';
import CommonAnnotatorActionDelete from '../slots/common/annotator-action-delete.vue';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';
import CommonOptionAnnotator from '../slots/common/option-annotator.vue';
import CommonResetAction from '../slots/common/reset-action.vue';

import CandlestickSvg from '../slots/vue-ui-candlestick/candlestick-svg.vue';
import KeyboardNavigationHint from '../slots/common/keyboard-navigation-hint.vue';
import Watermark from '../slots/common/watermark.vue';

import 'vue-data-ui/style.css';
import CandlestickLegend from '../slots/vue-ui-candlestick/candlestick-legend.vue';
import CandlestickTooltip from '../slots/vue-ui-candlestick/candlestick-tooltip.vue';
import Skeleton from '../slots/common/skeleton.vue';

function generateRandomCandlestickData({
    count = 12,
    startDate = Date.UTC(2026, 0, 1), // starting date
    interval = 30 * 24 * 60 * 60 * 1000, // 1 month in ms
    startPrice = 100,
    volatility = 0.2, // 20% volatility
} = {}): OHLC[] {
    const data: OHLC[] = [];
    let lastClose = startPrice;

    for (let i = 0; i < count; i += 1) {
        const timestamp = startDate + i * interval;
        const changePercent = (Math.random() - 0.5) * volatility;
        const open = lastClose;
        const close = open * (1 + changePercent);
        const high = Math.max(open, close) * (1 + Math.random() * volatility);
        const low = Math.min(open, close) * (1 - Math.random() * volatility);
        const volume = Math.round(1000 + Math.random() * 9000);

        data.push([
            timestamp,
            Math.round(open),
            Math.round(high),
            Math.round(low),
            Math.round(close),
            volume,
        ]);

        lastClose = close;
    }
    return data;
}

const dataset = computed<OHLC[]>(() =>
    generateRandomCandlestickData({ count: 100 }),
);

const testPreconfig = computed<VueUiCandlestickConfig>(() => {
    return {
        skeletonDataset: null,
        skeletonConfig: null,
        type: 'candlestick',
        debug: false,
        loading: false,
        responsive: false,
        responsiveProportionalSizing: true,
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
        theme: '',
        useCssAnimation: false,
        style: {
            fontFamily: 'inherit',
            backgroundColor: '#FFFFFF',
            color: '#2D353C',
            height: 316,
            width: 512,
            layout: {
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
                selector: {
                    color: '#e1e5e8',
                    opacity: 10,
                },
                grid: {
                    show: true,
                    stroke: '#e1e5e8',
                    strokeWidth: 0.5,
                    verticalLines: {
                        show: false,
                        strokeDasharray: 0,
                        strokeWidth: 0.5,
                        stroke: '#e1e5e8',
                    },
                    horizontalLines: {
                        show: false,
                        strokeDasharray: 0,
                        strokeWidth: 0.5,
                        stroke: '#e1e5e8',
                    },
                    xAxis: {
                        ticks: {
                            show: true,
                        },
                        dataLabels: {
                            show: true,
                            fontSize: 10,
                            color: '#2D353C',
                            offsetY: 0,
                            bold: false,
                            rotation: 0,
                            autoRotate: {
                                enable: true,
                                angle: -30,
                            },
                            datetimeFormatter: {
                                enable: true,
                                locale: 'en',
                                useUTC: false,
                                januaryAsYear: false,
                                options: {
                                    year: 'MMM yy',
                                    month: "MMM 'yy",
                                    day: 'dd MMM',
                                    hour: 'HH:mm',
                                    minute: 'HH:mm:ss',
                                    second: 'HH:mm:ss',
                                },
                            },
                            showOnlyFirstAndLast: false,
                            showOnlyAtModulo: true,
                            modulo: 12,
                        },
                    },
                    yAxis: {
                        scale: {
                            min: null,
                            max: null,
                        },
                        dataLabels: {
                            show: true,
                            fontSize: 12,
                            color: '#2D353C',
                            roundingValue: 0,
                            offsetX: 0,
                            bold: false,
                            steps: 10,
                            prefix: '',
                            suffix: '',
                        },
                    },
                },
                wick: {
                    stroke: '#2D353C',
                    strokeWidth: 0.5,
                    extremity: {
                        shape: 'line',
                        size: 'auto',
                        color: '#2D353C',
                    },
                },
                candle: {
                    borderRadius: 1,
                    stroke: '#2D353C',
                    strokeWidth: 0.5,
                    colors: {
                        bearish: '#d62728',
                        bullish: '#2ca02c',
                    },
                    gradient: {
                        show: true,
                        underlayer: '#FFFFFF',
                    },
                    widthRatio: 0.5,
                },
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
                prefix: '',
                suffix: '',
                showChart: true,
                useDefaultTimeFormat: true,
                timeFormat: 'yyyy-MM-dd HH:mm:ss',
            },
        },
        translations: {
            period: 'Period',
            open: 'Open',
            high: 'High',
            low: 'Low',
            last: 'Close',
            volume: 'Volume',
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
            th: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                outline: 'none',
            },
            useDialog: false,
            td: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                outline: 'none',
                roundingValue: 2,
                prefix: '',
                suffix: '',
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
        <VueUiCandlestick :dataset :config>
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

            <template #svg="{ svg }">
                <CandlestickSvg :svg />
            </template>

            <template #hint="{ hint, isVisible }">
                <KeyboardNavigationHint :hint :is-visible />
            </template>

            <template #watermark="{ isPrinting }">
                <Watermark :is-printing />
            </template>

            <template #reset-action="{ reset }">
                <CommonResetAction :reset />
            </template>

            <template #legend="{ legend }">
                <CandlestickLegend :legend />
            </template>

            <template
                #tooltip-before="{ datapoint, seriesIndex, series, config }"
            >
                <code style="color: chocolate">#tooltip-before</code>
                <br />
            </template>

            <template #tooltip="{ datapoint, seriesIndex, series, config }">
                <CandlestickTooltip :datapoint :seriesIndex :series :config />
            </template>

            <template
                #tooltip-after="{ datapoint, seriesIndex, series, config }"
            >
                <code style="color: chocolate">#tooltip-after</code>
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>

            <template #skeleton>
                <Skeleton />
            </template>
        </VueUiCandlestick>
    </div>
</template>
