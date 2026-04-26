<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiQuickChart>
 */
import { computed } from 'vue';
import {
    VueUiQuickChart,
    type VueUiQuickChartConfig,
    type VueUiQuickChartDataset,
} from 'vue-data-ui/vue-ui-quick-chart';
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
import CommonResetAction from '../slots/common/reset-action.vue';
import QuickChartLegend from '../slots/vue-ui-quick-chart/quick-chart-legend.vue';
import QuickChartTooltip from '../slots/vue-ui-quick-chart/quick-chart-tooltip.vue';

const dataset = computed<VueUiQuickChartDataset>(() => {
    return [
        {
            name: 'Serie1',
            values: [1, 2, 3, 2, 3, 4, 3, 4, 5],
        },
        {
            name: 'Serie2',
            values: [5, 6, 7, 6, 7, 8, 7, 8, 9],
        },
        {
            name: 'Serie3',
            values: [1, 2, 3, 5, 8, 13, 21, 13, 8],
        },
    ];
});

const testPreconfig = computed<VueUiQuickChartConfig>(() => {
    return {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false,
        loading: false,
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
        responsive: false,
        theme: '',
        axisLabelsFontSize: 12,
        backgroundColor: '#FFFFFF',
        barGap: 12,
        barAnimated: true,
        barStrokeWidth: 1,
        blurOnHover: true,
        chartIsBarUnderDatasetLength: 6,
        color: '#2D353C',
        customPalette: [],
        dataLabelFontSize: 14,
        dataLabelRoundingPercentage: 1,
        dataLabelRoundingValue: 0,
        donutHideLabelUnderPercentage: 3,
        donutCurvedMarkers: true,
        donutLabelMarkerStrokeWidth: 1,
        donutRadiusRatio: 0.4,
        donutShowTotal: true,
        donutStrokeWidth: 2,
        donutStroke: '#FFFFFF',
        donutThicknessRatio: 0.18,
        donutTotalLabelFontSize: 24,
        donutTotalLabelOffsetY: 0,
        donutTotalLabelText: 'Total',
        donutUseShadow: false,
        donutShadowColor: '#2D353C',
        fontFamily: 'inherit',
        formatter: null,
        height: 338,
        legendFontSize: 12,
        legendIcon: 'circleFill',
        legendIconSize: 12,
        legendPosition: 'bottom',
        showLegendSelectAllToggle: false,
        legendSelectAllToggleBackgroundColor: '#e1e5e8',
        legendSelectAllToggleColor: '#2D353C',
        lineAnimated: true,
        lineSmooth: true,
        lineStrokeWidth: 2,
        paletteStartIndex: 0,
        showDataLabels: true,
        showLegend: true,
        showTooltip: true,
        showUserOptions: true,
        userOptionsPosition: 'right',
        showUserOptionsOnChartHover: false,
        keepUserOptionsStateOnChartLeave: true,
        useCursorPointer: false,
        userOptionsButtons: {
            tooltip: true,
            pdf: true,
            img: true,
            fullscreen: true,
            annotator: true,
            svg: true,
            altCopy: false,
        },
        userOptionsButtonTitles: {
            open: 'Open options',
            close: 'Close options',
            tooltip: 'Toggle tooltip',
            pdf: 'Download PDF',
            img: 'Download PNG',
            fullscreen: 'Toggle fullscreen',
            annotator: 'Toggle annotator',
            svg: 'Download SVG',
            altCopy: 'Copy alt text',
        },
        userOptionsPrint: {
            overflowTolerance: 0.2,
            orientation: 'auto',
            scale: 2,
        },
        userOptionsCallbacks: {
            tooltip: null,
            pdf: null,
            img: null,
            fullscreen: null,
            annotator: null,
            svg: null,
            altCopy: null,
        },
        title: '',
        titleBold: true,
        titleFontSize: 16,
        titleTextAlign: 'center',
        tooltipTeleportTo: 'body',
        tooltipCustomFormat: null,
        tooltipBackgroundOpacity: 100,
        tooltipBorderRadius: 4,
        tooltipBorderColor: '#e1e5e8',
        tooltipBorderWidth: 1,
        tooltipFontSize: 14,
        tooltipPosition: 'center',
        tooltipOffsetY: 24,
        tooltipSmooth: true,
        tooltipSmoothForce: 0.18,
        tooltipSmoothSnapThreshold: 0.25,
        tooltipBackdropFilter: true,
        useCustomLegend: true,
        valuePrefix: '',
        valueSuffix: '',
        width: 512,
        xAxisLabel: '',
        xyAxisStroke: '#e1e5e8',
        xyAxisStrokeWidth: 1,
        xyGridStroke: '#e1e5e8',
        xyGridStrokeWidth: 0.5,
        xyHighlighterColor: '#2D353C',
        xyHighlighterOpacity: 0.05,
        xyLabelsXFontSize: 10,
        xyLabelsYFontSize: 12,
        xyPaddingBottom: 12,
        xyPaddingLeft: 12,
        xyPaddingRight: 12,
        xyPaddingTop: 12,
        xyPeriodLabelsRotation: 0,
        xyPeriodLabelsAutoRotate: {
            enable: true,
            angle: -30,
        },
        xyPeriods: [],
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
        xyPeriodsShowOnlyAtModulo: false,
        xyPeriodsModulo: 12,
        xyScaleSegments: 15,
        xyShowAxis: true,
        xyShowGrid: true,
        xyShowScale: true,
        yAxisLabel: '',
        zoomXy: true,
        zoomColor: '#CCCCCC',
        zoomHighlightColor: '#4A4A4A',
        zoomFontSize: 14,
        zoomUseResetSlot: false,
        zoomMinimap: {
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
            smooth: false,
            lineColor: '#2D353C',
            selectionRadius: 2,
            merged: false,
        },
        zoomStartIndex: null,
        zoomEndIndex: null,
        zoomEnableRangeHandles: true,
        zoomEnableSelectionDrag: true,
        zoomFocusOnDrag: false,
        zoomFocusRangeRatio: 0.2,
        zoomMaxWidth: null,
    };
});

const config = computed<VueUiQuickChartConfig>(() => {
    return mergeConfigs({
        defaultConfig: testPreconfig.value,
        userConfig: {
            userOptionsButtons: {
                altCopy: true,
            },
            userOptionsCallbacks: {
                altCopy: (args) => {
                    log(args.dataset.line);
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
        <VueUiQuickChart :dataset :config>
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

            <template #reset-action="{ reset }">
                <CommonResetAction :reset />
            </template>

            <template #legend="{ legend }">
                <QuickChartLegend :legend />
            </template>

            <template #tooltip-before>
                <span style="color: chocolate"> #tooltip-before </span>
                <br />
            </template>

            <template #tooltip="{ datapoint, seriesIndex }">
                <QuickChartTooltip :datapoint :series-index />
            </template>

            <template #tooltip-after>
                <br />
                <span style="color: chocolate"> #tooltip-after </span>
            </template>

            <template #skeleton>
                <Skeleton />
            </template>
        </VueUiQuickChart>
    </div>
</template>
