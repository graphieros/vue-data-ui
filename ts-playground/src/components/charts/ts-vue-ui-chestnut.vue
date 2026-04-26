<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiChestnut>
 */
import { computed } from 'vue';
import {
    VueUiChestnut,
    type VueUiChestnutConfig,
    type VueUiChestnutDatasetRoot,
} from 'vue-data-ui/vue-ui-chestnut';
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
import ChestnutSvg from '../slots/vue-ui-chestnut/chestnut-svg.vue';
import Watermark from '../slots/common/watermark.vue';
import ChestnutLegend from '../slots/vue-ui-chestnut/chestnut-legend.vue';
import Skeleton from '../slots/common/skeleton.vue';

const dataset = computed<VueUiChestnutDatasetRoot[]>(() => {
    return [
        {
            name: 'Root1',
            color: '#ff6400',
            branches: [
                {
                    name: 'branch 1.1',
                    value: 200,
                    breakdown: [
                        {
                            name: 'break 1.1.1',
                            value: 50,
                            color: '#F17171',
                        },
                        {
                            name: 'break 1.1.2',
                            value: 25,
                            color: '#ffc800',
                        },
                        {
                            name: 'break 1.1.3',
                            value: 25,
                            color: '#42d392',
                        },
                    ],
                },
                {
                    name: 'branch 1.2',
                    value: 100,
                    breakdown: [
                        {
                            name: 'break 1.2.1',
                            value: 10,
                            color: '#F17171',
                        },
                        {
                            name: 'break 1.2.2',
                            value: 20,
                            color: '#ffc800',
                        },
                        {
                            name: 'break 1.2.3',
                            value: 70,
                            color: '#42d392',
                        },
                    ],
                },
                {
                    name: 'branch 1.3',
                    value: 175,
                    breakdown: [
                        {
                            name: 'break 1.3.1',
                            value: 90,
                            color: '#F17171',
                        },
                        {
                            name: 'break 1.3.2',
                            value: 10,
                            color: '#ffc800',
                        },
                        {
                            name: 'break 1.3.3',
                            value: 75,
                            color: '#42d392',
                        },
                    ],
                },
            ],
        },
    ];
});

const testPreconfig = computed<VueUiChestnutConfig>(() => {
    return {
        debug: false,
        loading: false,
        theme: '',
        customPalette: [],
        a11y: {
            translations: {
                keyboardNavigation:
                    'Use the left and right, or up and down arrow keys to move between datapoints',
                tableAvailable:
                    'A data table for this chart is available below.',
                tableCaption: 'Chart data table',
            },
        },
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                layout: {
                    grandTotal: {
                        show: true,
                        fontSize: 20,
                        bold: true,
                        prefix: '',
                        suffix: '',
                        roundingValue: 0,
                        color: '#2D353C',
                        text: 'Grand total',
                        offsetY: 0,
                        formatter: null,
                    },
                    roots: {
                        stroke: '#FFFFFF',
                        strokeWidth: 5,
                        useGradient: true,
                        gradientIntensity: 20,
                        underlayerColor: '#FFFFFF',
                        labels: {
                            show: true,
                            fontSize: 16,
                            adaptColorToBackground: true,
                            color: '#FFFFFF',
                            bold: true,
                            roundingValue: 0,
                            prefix: '',
                            suffix: '',
                            formatter: null,
                            name: {
                                color: '#2D353C',
                                fontSize: 16,
                                bold: true,
                            },
                        },
                    },
                    verticalSeparator: {
                        stroke: '#FFFFFF',
                        strokeWidth: 5,
                    },
                    links: {
                        opacity: 10,
                    },
                    branches: {
                        stroke: '#FFFFFF',
                        strokeWidth: 0,
                        borderRadius: 6,
                        useGradient: true,
                        gradientIntensity: 20,
                        underlayerColor: '#FFFFFF',
                        widthRatio: 1.5,
                        labels: {
                            show: true,
                            fontSize: 14,
                            color: '#2D353C',
                            bold: true,
                            dataLabels: {
                                show: true,
                                hideUnderValue: 5,
                                fontSize: 14,
                                roundingValue: 0,
                                roundingPercentage: 0,
                                prefix: '',
                                suffix: '',
                                formatter: null,
                            },
                        },
                    },
                    nuts: {
                        offsetX: 20,
                        useGradient: true,
                        gradientIntensity: 30,
                        selected: {
                            useMotion: true,
                            useGradient: true,
                            gradientIntensity: 40,
                            roundingValue: 0,
                            roundingPercentage: 0,
                            labels: {
                                dataLabels: {
                                    hideUnderValue: 5,
                                    color: '#2D353C',
                                    fontSize: 12,
                                    bold: true,
                                    prefix: '',
                                    suffix: '',
                                    formatter: null,
                                },
                                core: {
                                    total: {
                                        color: '#2D353C',
                                        fontSize: 24,
                                        bold: false,
                                    },
                                    value: {
                                        color: '#2D353C',
                                        fontSize: 24,
                                        bold: true,
                                        prefix: '',
                                        suffix: '',
                                    },
                                },
                            },
                        },
                    },
                    legend: {
                        fontSize: 16,
                        color: '#2D353C',
                        roundingValue: 0,
                        roundingPercentage: 0,
                        prefix: '',
                        suffix: '',
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
                            offsetY: 0,
                        },
                        offsetY: 0,
                    },
                },
            },
        },
        table: {
            show: false,
            responsiveBreakpoint: 400,
            useDialog: false,
            th: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                outline: 'none',
                translations: {
                    rootName: 'root name',
                    rootValue: 'root value',
                    rootToTotal: '%/total',
                    branchName: 'branch name',
                    branchValue: 'branch value',
                    branchToRoot: '%/root',
                    branchToTotal: '%/total',
                    nutName: 'nut name',
                    nutValue: 'nut value',
                    nutToBranch: '%/branch',
                    nutToRoot: '%/root',
                    nutToTotal: '%/total',
                },
            },
            td: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                outline: 'none',
                roundingValue: 0,
                roundingPercentage: 0,
            },
        },
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
        translations: {
            total: 'Total',
            proportionToTree: 'of grand total',
            of: 'of',
        },
    };
});

const config = computed<VueUiChestnutConfig>(() => {
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
        <VueUiChestnut :dataset :config>
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
                <ChestnutSvg :svg />
            </template>

            <template #watermark="{ isPrinting }">
                <Watermark :is-printing />
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>

            <template #legend="{ legend }">
                <ChestnutLegend :items="legend" />
            </template>

            <template #skeleton>
                <Skeleton />
            </template>
        </VueUiChestnut>
    </div>
</template>
