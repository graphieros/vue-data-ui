<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiTreemap>
 */
import { computed } from 'vue';
import {
    VueUiTreemap,
    type VueUiTreemapConfig,
    type VueUiTreemapDatasetItem,
} from 'vue-data-ui/vue-ui-treemap';
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
import TreemapSvg from '../slots/vue-ui-treemap/treemap-svg.vue';
import TreemapLegend from '../slots/vue-ui-treemap/treemap-legend.vue';
import TreemapTooltip from '../slots/vue-ui-treemap/treemap-tooltip.vue';

const dataset = computed<VueUiTreemapDatasetItem[]>(() => {
    return [
        {
            name: 'Parent 1',
            value: 100,
            children: [
                {
                    name: 'P1 C1',
                    value: 70,
                },
                {
                    name: 'P1 C2',
                    value: 20,
                },
                {
                    name: 'P1 C3',
                    value: 10,
                },
            ],
        },
        {
            name: 'Parent 2',
            value: 110,
            children: [
                {
                    name: 'P2 C1',
                    value: 80,
                },
                {
                    name: 'P2 C2',
                    value: 20,
                },
                {
                    name: 'P2 C3',
                    value: 10,
                    children: [
                        {
                            name: 'P2 C3 A',
                            value: 4,
                        },
                        {
                            name: 'P2 C3 B',
                            value: 3,
                        },
                        {
                            name: 'P2 C3 C',
                            value: 3,
                        },
                    ],
                },
            ],
        },
    ];
});

const testPreconfig = computed<VueUiTreemapConfig>(() => {
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
                height: 500,
                width: 800,
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
                layout: {
                    sorted: true,
                    rects: {
                        stroke: '#e1e5e8',
                        strokeWidth: 1,
                        borderRadius: 0,
                        colorRatio: 0.3,
                        gradient: {
                            show: true,
                            intensity: 30,
                        },
                        group: {
                            stroke: '#e1e5e8',
                            strokeWidth: 1,
                            useSeriesBackgroundColor: false,
                            backgroundLighterRatio: 0.4,
                            label: {
                                adaptColorToBackground: false,
                                color: '#2D353C',
                            },
                        },
                        selected: {
                            stroke: '#e1e5e8',
                            strokeWidth: 1,
                            unselectedOpacity: 0.6,
                        },
                    },
                    labels: {
                        showDefaultLabels: true,
                        fontSize: 24,
                        minFontSize: 10,
                        hideUnderProportion: 0.03,
                        prefix: 'Value: ',
                        suffix: '',
                        rounding: 0,
                        formatter: null,
                        name: {
                            show: true,
                            bold: true,
                        },
                        value: {
                            show: true,
                            bold: false,
                        },
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
                    roundingValue: 0,
                    roundingPercentage: 0,
                    showValue: true,
                    showPercentage: true,
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
                    roundingValue: 1,
                },
            },
        },
        table: {
            show: false,
            responsiveBreakpoint: 400,
            useDialog: false,
            columnNames: {
                series: 'Series',
                value: 'Value',
                percentage: 'Percentage',
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
                roundingPercentage: 0,
            },
        },
    };
});

const config = computed<VueUiTreemapConfig>(() => {
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
        <VueUiTreemap :dataset :config>
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

            <template #breadcrumb-label="{ crumb, isFocus, isRoot }">
                <code style="color: chocolate; font-size: 0.6rem"
                    >#breadcrumb-label</code
                >
                {{ crumb.label }}
            </template>

            <template #breadcrumb-arrow>
                <code style="color: chocolate; font-size: 0.5rem"
                    >#breadcrumb-arrow</code
                >
            </template>

            <template
                #rect="{
                    rect,
                    fontSize,
                    isZoom,
                    shouldShow,
                    textColor,
                    ...rest
                }"
            >
                #rect
                <div :style="{ fontSize: Math.round(fontSize) + 'px' }">
                    fontSize: {{ Math.round(fontSize) }}
                </div>
                <div style="font-size: 0.3rem">{{ rect }}</div>
            </template>

            <template #svg="{ svg }">
                <TreemapSvg :svg />
            </template>

            <template #hint="{ hint, isVisible }">
                <KeyboardNavigationHint
                    :hint
                    :is-visible
                    style="margin-top: 100px"
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
                <TreemapLegend :items="legend" />
            </template>

            <template #tooltip-before>
                <span style="color: chocolate"> #tooltip-before </span>
                <br />
            </template>

            <template #tooltip="{ datapoint, seriesIndex }">
                <TreemapTooltip :datapoint :series-index />
            </template>

            <template #tooltip-after>
                <br />
                <span style="color: chocolate"> #tooltip-after </span>
            </template>
        </VueUiTreemap>
    </div>
</template>
