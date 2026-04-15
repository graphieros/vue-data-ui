<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiAgePyramid>
 */
import { computed } from 'vue';
import {
    VueUiAgePyramid,
    type VueUiAgePyramidConfig,
    type VueUiAgePyramidDataset,
    type VueUiAgePyramidDatasetRow,
} from 'vue-data-ui/vue-ui-age-pyramid';
import { mergeConfigs } from 'vue-data-ui/utils';
import CommonAnnotatorActionColor from '../slots/common/annotator-action-color.vue';
import CommonAnnotatorActionDraw from '../slots/common/annotator-action-draw.vue';
import CommonAnnotatorActionUndo from '../slots/common/annotator-action-undo.vue';
import CommonAnnotatorActionRedo from '../slots/common/annotator-action-redo.vue';
import CommonAnnotatorActionDelete from '../slots/common/annotator-action-delete.vue';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';
import CommonOptionAnnotator from '../slots/common/option-annotator.vue';
import KeyboardNavigationHint from '../slots/common/keyboard-navigation-hint.vue';
import Watermark from '../slots/common/watermark.vue';

import PyramidOptionAltCopy from '../slots/vue-ui-age-pyramid/pyramid-option-alt-copy.vue';
import PyramidSvg from '../slots/vue-ui-age-pyramid/pyramid-svg.vue';

import 'vue-data-ui/style.css';
import PyramidLegend from '../slots/vue-ui-age-pyramid/pyramid-legend.vue';
import PyramidTooltip from '../slots/vue-ui-age-pyramid/pyramid-tooltip.vue';
import Skeleton from '../slots/common/skeleton.vue';

function makeDs(n: number, exp: number): VueUiAgePyramidDataset {
    const arr: VueUiAgePyramidDatasetRow[] = [];
    for (let i = 0; i < n; i += 1) {
        arr.push([
            `T${i}`,
            i,
            i + Math.random() * exp,
            i + Math.random() * exp,
        ]);
    }
    return arr.reverse();
}

const dataset = computed<VueUiAgePyramidDataset>(() => makeDs(51, 10));

const testPreconfig = computed<VueUiAgePyramidConfig>(() => {
    return {
        skeletonConfig: null,
        skeletonDataset: null,
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
            height: 500,
            width: 500,
            layout: {
                padding: {
                    top: 12,
                    right: 12,
                    bottom: 36,
                    left: 12,
                },
                grid: {
                    show: true,
                    stroke: '#e1e5e8',
                    strokeWidth: 1,
                },
                dataLabels: {
                    sideTitles: {
                        show: true,
                        fontSize: 18,
                        color: '#2D353C',
                        useSideColor: true,
                        bold: false,
                        offsetY: 0,
                    },
                    xAxis: {
                        show: true,
                        fontSize: 12,
                        color: '#2D353C',
                        bold: false,
                        scale: 1,
                        translation: 'Something about the data',
                        formatter: null,
                        rotation: 0,
                        autoRotate: {
                            enable: true,
                            angle: -30,
                        },
                    },
                    yAxis: {
                        show: true,
                        display: 'age',
                        fontSize: 12,
                        color: '#2D353C',
                        bold: false,
                        showEvery: 5,
                        formatter: null,
                    },
                },
                centerSlit: {
                    width: 20,
                },
                bars: {
                    gap: 2,
                    borderRadius: 2,
                    left: {
                        color: '#d62728',
                    },
                    right: {
                        color: '#1f77b4',
                    },
                    gradient: {
                        show: true,
                        underlayer: '#FFFFFF',
                        intensity: 60,
                        shiftHue: 0.05,
                    },
                },
            },
            highlighter: {
                color: '#2D353C',
                opacity: 5,
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
            },
        },
        translations: {
            age: 'age',
            male: 'male',
            female: 'female',
            total: 'total',
            year: 'year',
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

const config = computed<VueUiAgePyramidConfig>(() =>
    mergeConfigs({
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
    }),
);

function log(t: unknown) {
    console.log(t);
}
</script>

<template>
    <div>
        <VueUiAgePyramid :dataset :config>
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

            <template #optionAltCopy="{ copyAlt }">
                <PyramidOptionAltCopy :copyAlt />
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
                <PyramidSvg :svg />
            </template>

            <template #hint="{ hint, isVisible }">
                <KeyboardNavigationHint :hint :is-visible />
            </template>

            <template #watermark="{ isPrinting }">
                <Watermark :is-printing />
            </template>

            <template #legend="{ legend }">
                <PyramidLegend :legend />
            </template>

            <template
                #tooltip-before="{
                    datapoint,
                    series,
                    config: cfg,
                    seriesIndex,
                }"
            >
                <code style="color: chocolate">#tooltip-before</code>
            </template>

            <template
                #tooltip="{ datapoint, series, config: cfg, seriesIndex }"
            >
                <PyramidTooltip :datapoint :series :config="cfg" :seriesIndex />
            </template>

            <template
                #tooltip-after="{ datapoint, series, config: cfg, seriesIndex }"
            >
                <code style="color: chocolate">#tooltip-after</code>
            </template>

            <template #skeleton>
                <Skeleton />
            </template>
        </VueUiAgePyramid>
    </div>
</template>
