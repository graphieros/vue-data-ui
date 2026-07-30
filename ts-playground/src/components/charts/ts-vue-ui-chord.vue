<script setup lang="ts">
import { computed } from 'vue';
import {
    VueUiChord,
    type VueUiChordConfig,
    type VueUiChordDataset,
    type VueUiChordEmitCopyAlt,
    type VueUiChordEmitSelectGroup,
    type VueUiChordEmitSelectLegend,
    type VueUiChordEmitSelectRibbon,
} from 'vue-data-ui/vue-ui-chord';
import { mergeConfigs } from 'vue-data-ui/utils';

import CommonAnnotatorActionColor from '../slots/common/annotator-action-color.vue';
import CommonAnnotatorActionDraw from '../slots/common/annotator-action-draw.vue';
import CommonAnnotatorActionUndo from '../slots/common/annotator-action-undo.vue';
import CommonAnnotatorActionRedo from '../slots/common/annotator-action-redo.vue';
import CommonAnnotatorActionDelete from '../slots/common/annotator-action-delete.vue';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';
import CommonOptionAnnotator from '../slots/common/option-annotator.vue';
import CommonResetAction from '../slots/common/reset-action.vue';
import KeyboardNavigationHint from '../slots/common/keyboard-navigation-hint.vue';

import ChordSvg from '../slots/vue-ui-chord/chord-svg.vue';
import Watermark from '../slots/common/watermark.vue';
import ChordLegend from '../slots/vue-ui-chord/chord-legend.vue';
import PatternSlot from '../slots/common/pattern-slot.vue';

import 'vue-data-ui/style.css';
import Skeleton from '../slots/common/skeleton.vue';
import { getVueDataUiConfig } from 'vue-data-ui';

const dataset = computed<VueUiChordDataset>(() => {
    return {
        matrix: [
            [12000, 6000, 9000, 3000],
            [2000, 10000, 2000, 6001],
            [8000, 1600, 8000, 8001],
            [1000, 1000, 1000, 7001],
        ],
        labels: ['Group A', 'Group B', 'Group C', 'Group D'],
        colors: ['#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78'],
    };
});

const testPreconfig = computed<VueUiChordConfig>(() => {
    return {
        devHints: { enable: false },
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
        enableRotation: true,
        initialRotation: 0,
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
            },
        },
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
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
                arcs: {
                    innerRadiusRatio: 1,
                    outerRadiusRatio: 1,
                    padAngle: 5,
                    stroke: '#FFFFFF',
                    strokeWidth: 1,
                    labels: {
                        show: true,
                        fontSize: 14,
                        bold: false,
                        curved: false,
                        adaptColorToBackground: true,
                        color: '#2D353C',
                        offset: 0,
                        showPercentage: true,
                        roundingPercentage: 0,
                    },
                },
                ribbons: {
                    stroke: '#FFFFFF',
                    strokeWidth: 1,
                    underlayerOpacity: 1,
                    labels: {
                        show: true,
                        formatter: null,
                        prefix: '',
                        suffix: '',
                        rounding: 0,
                        fontSize: 14,
                        bold: false,
                        useSerieColor: false,
                        color: '#2D353C',
                        offset: 0,
                        minSeparationDeg: 3,
                        connector: {
                            stroke: '#2D353C',
                            strokeWidth: 1,
                        },
                        marker: {
                            show: true,
                            radius: 3,
                            stroke: '#FFFFFF',
                            strokeWidth: 1,
                        },
                    },
                },
            },
        },
    };
});

const config = computed<VueUiChordConfig>(() => {
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

function selectLegend(payload: VueUiChordEmitSelectLegend) {
    console.log('@selectLegend', payload);
}

function selectGroup(payload: VueUiChordEmitSelectGroup) {
    console.log('@selectGroup', payload);
}

function selectRibbon(payload: VueUiChordEmitSelectRibbon) {
    console.log('@selectRibbon', payload);
}

function copyAlt(payload: VueUiChordEmitCopyAlt) {
    console.log('@copyAlt', payload);
}
</script>

<template>
    <div>
        <VueUiChord
            :dataset
            :config
            @selectLegend="selectLegend"
            @selectGroup="selectGroup"
            @selectRibbon="selectRibbon"
            @copyAlt="copyAlt"
        >
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
                <ChordSvg :svg />
            </template>

            <template #watermark="{ isPrinting }">
                <Watermark :is-printing />
            </template>

            <template #legend="{ legend }">
                <ChordLegend :items="legend" />
            </template>

            <template #pattern="{ seriesIndex, patternId }">
                <PatternSlot :series-index :pattern-id />
            </template>

            <template #hint="{ hint, isVisible }">
                <KeyboardNavigationHint
                    :hint
                    :is-visible
                    style="margin-top: -90px"
                />
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>

            <template #reset-action="{ reset }">
                <CommonResetAction :reset />
            </template>

            <template #skeleton>
                <Skeleton />
            </template>
            <template #custom-menu-before> BEFORE </template>
            <template #custom-menu-after> AFTER </template>
        </VueUiChord>
    </div>
</template>
