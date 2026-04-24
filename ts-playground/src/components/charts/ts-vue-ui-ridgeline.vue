<script setup lang="ts">
import { computed } from 'vue';
import {
    VueUiRidgeline,
    type VueUiRidgelineConfig,
    type VueUiRidgelineDatasetItem,
} from 'vue-data-ui/vue-ui-ridgeline';
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
import RidgelineSvg from '../slots/vue-ui-ridgeline/ridgeline-svg.vue';
import RidgelineLegend from '../slots/vue-ui-ridgeline/ridgeline-legend.vue';

const dataset = computed<VueUiRidgelineDatasetItem[]>(() => {
    return [
        {
            name: 'Toronto',
            datapoints: [
                {
                    name: 'Average Temperature (°C)',
                    values: [-3, -2, 2, 9, 15, 20, 22, 21, 17, 10, 4, -1],
                },
            ],
        },
        {
            name: 'Berlin',
            datapoints: [
                {
                    name: 'Average Temperature (°C)',
                    values: [0, 2, 6, 12, 16, 19, 21, 21, 17, 12, 7, 3],
                },
            ],
        },
        {
            name: 'Beijing',
            datapoints: [
                {
                    name: 'Average Temperature (°C)',
                    values: [-3, 0, 6, 14, 20, 24, 26, 25, 20, 13, 5, -1],
                },
            ],
        },
    ];
});

const testPreconfig = computed<VueUiRidgelineConfig>(() => {
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
            columnNames: {
                series: 'Series',
            },
        },
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                padding: {
                    top: 12,
                    right: 0,
                    bottom: 0,
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
                },
                dialog: {
                    show: true,
                    backgroundColor: '#FFFFFF',
                    color: '#2D353C',
                    header: {
                        backgroundColor: '#e1e5e8',
                        color: '#2D353C',
                    },
                    xyChart: {
                        skeletonConfig: null,
                        skeletonDataset: null,
                        debug: false,
                        theme: '',
                        responsive: true,
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
                        responsiveProportionalSizing: true,
                        customPalette: [],
                        useCssAnimation: false,
                        downsample: {
                            threshold: 1095,
                        },
                        chart: {
                            fontFamily: 'inherit',
                            backgroundColor: '#FFFFFF',
                            color: '#2D353C',
                            height: 600,
                            width: 1000,
                            annotations: [
                                {
                                    show: false,
                                    yAxis: {
                                        yTop: null,
                                        yBottom: null,
                                        label: {
                                            text: '',
                                            textAnchor: 'start',
                                            position: 'start',
                                            offsetX: 0,
                                            offsetY: 0,
                                            padding: {
                                                top: 12,
                                                right: 12,
                                                bottom: 12,
                                                left: 12,
                                            },
                                            border: {
                                                stroke: '#FFFFFF',
                                                strokeWidth: 1,
                                                rx: 0,
                                                ry: 0,
                                            },
                                            fontSize: 14,
                                            color: '#2D353C',
                                            backgroundColor: '#e1e5e8',
                                        },
                                        line: {
                                            stroke: '#2D353C',
                                            strokeWidth: 1,
                                            strokeDasharray: 0,
                                        },
                                        area: {
                                            fill: '#e1e5e8',
                                            opacity: 30,
                                        },
                                    },
                                },
                            ],
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
                            padding: {
                                top: 12,
                                right: 12,
                                bottom: 6,
                                left: 6,
                            },
                            highlighter: {
                                color: '#2D353C',
                                opacity: 5,
                                useLine: false,
                                lineDasharray: 2,
                                lineWidth: 1,
                            },
                            highlightArea: {
                                show: false,
                                from: 0,
                                to: 0,
                                color: '#2D353C',
                                opacity: 20,
                                caption: {
                                    text: '',
                                    fontSize: 10,
                                    color: '#2D353C',
                                    bold: false,
                                    offsetY: 0,
                                    width: 'auto',
                                    padding: 3,
                                    textAlign: 'center',
                                },
                            },
                            timeTag: {
                                show: false,
                                backgroundColor: '#e1e5e8',
                                color: '#2D353C',
                                fontSize: 12,
                                circleMarker: {
                                    radius: 3,
                                    color: '#2D353C',
                                },
                                useDefaultFormat: true,
                                timeFormat: 'yyyy-MM-dd HH:mm:ss',
                                customFormat: null,
                            },
                            grid: {
                                stroke: '#e1e5e8',
                                showVerticalLines: false,
                                showHorizontalLines: false,
                                position: 'middle',
                                frame: {
                                    show: false,
                                    stroke: '#e1e5e8',
                                    strokeWidth: 2,
                                    strokeLinecap: 'round',
                                    strokeLinejoin: 'round',
                                    strokeDasharray: 0,
                                },
                                labels: {
                                    show: true,
                                    color: '#2D353C',
                                    fontSize: 16,
                                    axis: {
                                        yLabel: '',
                                        yLabelOffsetX: 0,
                                        xLabel: '',
                                        xLabelOffsetY: 0,
                                        fontSize: 14,
                                    },
                                    zeroLine: {
                                        show: true,
                                    },
                                    xAxis: {
                                        showBaseline: false,
                                        showCrosshairs: true,
                                        crosshairsAlwaysAtZero: false,
                                        crosshairSize: 6,
                                    },
                                    yAxis: {
                                        showBaseline: true,
                                        showCrosshairs: true,
                                        crosshairSize: 6,
                                        commonScaleSteps: 10,
                                        useIndividualScale: false,
                                        useNiceScale: false,
                                        stacked: false,
                                        gap: 12,
                                        labelWidth: 64,
                                        formatter: null,
                                        scaleMin: null,
                                        scaleMax: null,
                                        groupColor: null,
                                        scaleLabelOffsetX: 0,
                                        scaleValueOffsetX: 0,
                                        rounding: 1,
                                        serieNameFormatter: null,
                                    },
                                    xAxisLabels: {
                                        color: '#2D353C',
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
                                        fontSize: 14,
                                        showOnlyFirstAndLast: false,
                                        showOnlyAtModulo: false,
                                        modulo: 12,
                                        yOffset: 24,
                                        rotation: 0,
                                        autoRotate: {
                                            enable: true,
                                            angle: -30,
                                        },
                                    },
                                },
                            },
                            comments: {
                                show: true,
                                showInTooltip: true,
                                width: 200,
                                offsetX: 0,
                                offsetY: 0,
                            },
                            labels: {
                                fontSize: 10,
                                prefix: '',
                                suffix: '',
                            },
                            legend: {
                                color: '#2D353C',
                                show: true,
                                fontSize: 14,
                                position: 'bottom',
                                selectAllToggle: {
                                    show: false,
                                    backgroundColor: '#e1e5e8',
                                    color: '#2D353C',
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
                                show: true,
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
                                showValue: true,
                                showPercentage: false,
                                roundingValue: 0,
                                roundingPercentage: 0,
                                useDefaultTimeFormat: true,
                                timeFormat: 'yyyy-MM-dd HH:mm:ss',
                            },
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
                                    fullscreen: false,
                                    sort: false,
                                    stack: true,
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
                                    stack: 'Toggle stack mode',
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
                        },
                        bar: {
                            showTransition: true,
                            transitionDurationMs: 300,
                            borderRadius: 2,
                            useGradient: true,
                            periodGap: 0.1,
                            innerGap: 0,
                            border: {
                                useSerieColor: false,
                                strokeWidth: 0,
                                stroke: '#FFFFFF',
                            },
                            labels: {
                                show: false,
                                offsetY: -6,
                                rounding: 0,
                                color: '#2D353C',
                                formatter: null,
                            },
                            serieName: {
                                show: false,
                                offsetY: -6,
                                useAbbreviation: true,
                                abbreviationSize: 3,
                                useSerieColor: true,
                                color: '#2D353C',
                                bold: false,
                            },
                        },
                        line: {
                            showTransition: false,
                            transitionDurationMs: 300,
                            radius: 3,
                            useGradient: true,
                            strokeWidth: 3,
                            cutNullValues: false,
                            interLine: {
                                pairs: [],
                                colors: [],
                                fillOpacity: 0.25,
                            },
                            dot: {
                                hideAboveMaxSerieLength: 62,
                                useSerieColor: true,
                                fill: '#FFFFFF',
                                strokeWidth: 0.5,
                            },
                            labels: {
                                show: true,
                                offsetY: -6,
                                rounding: 0,
                                color: '#2D353C',
                                formatter: null,
                            },
                            area: {
                                useGradient: true,
                                opacity: 30,
                            },
                            tag: {
                                followValue: true,
                                formatter: null,
                                fontSize: 14,
                            },
                        },
                        plot: {
                            showTransition: true,
                            transitionDurationMs: 300,
                            radius: 3,
                            useGradient: true,
                            dot: {
                                useSerieColor: true,
                                fill: '#FFFFFF',
                                strokeWidth: 0.5,
                            },
                            labels: {
                                show: false,
                                offsetY: -6,
                                rounding: 0,
                                color: '#2D353C',
                                formatter: null,
                            },
                            tag: {
                                followValue: true,
                                formatter: null,
                                fontSize: 14,
                            },
                        },
                        table: {
                            useDialog: false,
                            responsiveBreakpoint: 400,
                            rounding: 0,
                            sparkline: true,
                            showSum: true,
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
                            useDefaultTimeFormat: true,
                            timeFormat: 'yyyy-MM-dd HH:mm:ss',
                        },
                        showTable: false,
                    },
                },
                areas: {
                    height: 60,
                    rowHeight: 30,
                    strokeWidth: 1,
                    stroke: {
                        useSerieColor: false,
                        color: '#FFFFFF',
                    },
                    smooth: true,
                    opacity: 0.9,
                    useCommonColor: false,
                    useGradient: true,
                    maxPoint: {
                        show: true,
                        adaptStrokeToBackground: true,
                        stroke: '#2D353C',
                        strokeWidth: 1,
                        strokeDasharray: 4,
                    },
                },
                selector: {
                    show: true,
                    stroke: '#CCCCCC',
                    strokeWidth: 1,
                    strokeDasharray: 2,
                    labels: {
                        fontSize: 12,
                        formatter: null,
                        rounding: 0,
                        color: '#2D353C',
                    },
                    dot: {
                        radius: 4,
                        useDatapointColor: true,
                        fill: '#CCCCCC',
                        stroke: '#FFFFFF',
                        strokeWidth: 0.5,
                    },
                },
                zeroLine: {
                    show: true,
                    strokeWidth: 1,
                    strokeDasharray: 0,
                    useSerieColor: false,
                    stroke: '#CCCCCC',
                },
                xAxis: {
                    labels: {
                        prefix: '',
                        suffix: '',
                        rotation: -45,
                        autoRotate: {
                            enable: true,
                            angle: -30,
                        },
                        values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
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
                        color: '#2D353C',
                        fontSize: 14,
                        bold: false,
                        showOnlyAtModulo: false,
                        modulo: 12,
                        showOnlyFirstAndLast: false,
                        offsetY: 0,
                    },
                },
                yAxis: {
                    labels: {
                        fontSize: 16,
                        bold: false,
                        color: '#2D353C',
                        offsetX: 0,
                    },
                },
            },
        },
    };
});

const config = computed<VueUiRidgelineConfig>(() => {
    return mergeConfigs({
        defaultConfig: testPreconfig.value,
        userConfig: {},
    });
});

function log(n: unknown) {
    console.log(n);
}
</script>

<template>
    <div>
        <VueUiRidgeline :dataset :config>
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

            <template #pattern="{ seriesIndex, patternId, datapointIndex }">
                <PatternSlot :series-index :pattern-id color="#6376DD" />
            </template>

            <template
                #time-label="{
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
                <text
                    :x
                    :y
                    :font-size="fontSize / 3"
                    text-anchor="middle"
                    :fill
                >
                    #time-label {{ content }}
                </text>
            </template>

            <template #svg="{ svg }">
                <RidgelineSvg :svg />
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
                <RidgelineLegend :items="legend" />
            </template>
        </VueUiRidgeline>
    </div>
</template>
