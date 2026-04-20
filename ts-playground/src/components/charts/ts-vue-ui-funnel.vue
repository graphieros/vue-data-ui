<script setup lang="ts">
import { computed } from 'vue';
import {
    VueUiFunnel,
    type VueUiFunnelConfig,
    type VueUiFunnelDatasetItem,
} from 'vue-data-ui/vue-ui-funnel';
import { mergeConfigs } from 'vue-data-ui/utils';

import CommonAnnotatorActionColor from '../slots/common/annotator-action-color.vue';
import CommonAnnotatorActionDraw from '../slots/common/annotator-action-draw.vue';
import CommonAnnotatorActionUndo from '../slots/common/annotator-action-undo.vue';
import CommonAnnotatorActionRedo from '../slots/common/annotator-action-redo.vue';
import CommonAnnotatorActionDelete from '../slots/common/annotator-action-delete.vue';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';
import CommonOptionAnnotator from '../slots/common/option-annotator.vue';

import 'vue-data-ui/style.css';
import FunnelOptionAltCopy from '../slots/vue-ui-funnel/funnel-option-alt-copy.vue';
import FunnelSvg from '../slots/vue-ui-funnel/funnel-svg.vue';
import Watermark from '../slots/common/watermark.vue';

const dataset = computed<VueUiFunnelDatasetItem[]>(() => {
    return [
        {
            name: 'Lead',
            value: 8249,
        },
        {
            name: 'Opportunity',
            value: 6322,
        },
        {
            name: 'Qualified',
            value: 4562,
        },
        {
            name: 'Sold',
            value: 3021,
        },
        {
            name: 'Retained',
            value: 1412,
        },
    ];
});

const testPreconfig = computed<VueUiFunnelConfig>(() => {
    return {
        theme: '',
        responsive: false,
        responsiveProportionalSizing: true,
        useCssAnimation: true,
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
                series: 'Step',
                value: 'Value',
                percentage: 'Percentage',
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
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                width: 600,
                height: 500,
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
                padding: {
                    top: 12,
                    right: 128,
                    bottom: 24,
                    left: 24,
                },
                barCircleSpacingRatio: 0.05,
                circles: {
                    stroke: '#FFFFFF',
                    strokeWidth: 1,
                    dataLabels: {
                        formatter: null,
                        fontSize: 16,
                        offsetY: 0,
                        adaptColorToBackground: true,
                        color: '#2D353C',
                        rounding: 1,
                        bold: true,
                    },
                },
                circleLinks: {
                    show: true,
                    color: '#e1e5e8',
                    widthRatio: 1,
                },
                area: {
                    show: true,
                    color: '#e1e5e8',
                },
                bars: {
                    stroke: '#FFFFFF',
                    defaultColor: '#1f77b4',
                    strokeWidth: 1,
                    gapRatio: 0.2,
                    borderRadius: 3,
                    dataLabels: {
                        name: {
                            fontSize: 16,
                            color: '#2D353C',
                            bold: true,
                            offsetX: 0,
                            offsetY: 0,
                        },
                        value: {
                            formatter: null,
                            fontSize: 16,
                            rounding: 0,
                            bold: false,
                            color: '#2D353C',
                            prefix: '',
                            suffix: '',
                            offsetX: 0,
                            offsetY: 0,
                        },
                    },
                },
            },
        },
    };
});

const config = computed<VueUiFunnelConfig>(() => {
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
        <VueUiFunnel :dataset :config>
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

            <template #optionAltCopy="{ copyAlt }">
                <FunnelOptionAltCopy :copy-alt />
            </template>

            <template #chart-background>
                <div
                    style="
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(
                            to bottom,
                            #cccccc00,
                            #cccccc
                        );
                    "
                >
                    <code style="color: chocolate"> #chart-background </code>
                </div>
            </template>

            <template #svg="{ svg }">
                <FunnelSvg :svg />
            </template>

            <template #watermark="{ isPrinting }">
                <Watermark :is-printing />
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>
        </VueUiFunnel>
    </div>
</template>
