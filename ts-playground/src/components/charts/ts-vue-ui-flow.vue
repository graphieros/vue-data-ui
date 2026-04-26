<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiFlow>
 */
import { computed } from 'vue';
import {
    VueUiFlow,
    type VueUiFlowConfig,
    type VueUiFlowDatasetItem,
} from 'vue-data-ui/vue-ui-flow';
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

import FlowSvg from '../slots/vue-ui-flow/flow-svg.vue';
import KeyboardNavigationHint from '../slots/common/keyboard-navigation-hint.vue';
import Watermark from '../slots/common/watermark.vue';
import FlowLegend from '../slots/vue-ui-flow/flow-legend.vue';
import Skeleton from '../slots/common/skeleton.vue';
import FlowTooltip from '../slots/vue-ui-flow/flow-tooltip.vue';

const dataset = computed<VueUiFlowDatasetItem[]>(() => {
    return [
        // Raw materials → Components
        ['Mining', 'Copper', 40],
        ['Mining', 'Lithium', 30],
        ['Mining', 'Gold', 10],
        ['Mining', 'Rare Earths', 20],

        // Components → Manufacturing
        ['Copper', 'PCB Assembly', 40],
        ['Lithium', 'Battery Production', 30],
        ['Gold', 'Microchips', 10],
        ['Rare Earths', 'Microchips', 20],

        // Manufacturing → Assembly
        ['PCB Assembly', 'Phone Assembly', 40],
        ['Battery Production', 'Phone Assembly', 30],
        ['Microchips', 'Phone Assembly', 30],

        // Assembly → Distribution
        ['Phone Assembly', 'Retail', 100],

        // Distribution → Consumers
        ['Retail', 'Consumer Use', 100],

        // Consumers → End-of-life
        ['Consumer Use', 'Recycling', 40],
        ['Consumer Use', 'Landfill', 30],
        ['Consumer Use', 'Resale', 30],

        // End-of-life → Secondary flow
        ['Recycling', 'Recovered Materials', 25],
        ['Recycling', 'E-Waste', 15],
        ['Resale', 'Second-hand Use', 30],
    ];
});

const testPreconfig = computed<VueUiFlowConfig>(() => {
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
        nodeCategories: {},
        nodeCategoryColors: {},
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: '#FFFFFF',
                width: 1000,
                height: 600,
                color: '#2D353C',
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
                    showPercentage: true,
                    roundingPercentage: 0,
                    translations: {
                        from: 'From:',
                        to: 'To:',
                        percentOfTotal: 'Percent of total:',
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
                nodes: {
                    gap: 10,
                    width: 40,
                    labels: {
                        show: true,
                        showValue: true,
                        fontSize: 14,
                        abbreviation: {
                            use: true,
                            length: 3,
                        },
                        prefix: '',
                        suffix: '',
                        rounding: 0,
                        formatter: null,
                    },
                    stroke: '#FFFFFF',
                    strokeWidth: 1,
                    borderRadius: 0,
                },
                links: {
                    opacity: 0.8,
                    stroke: '#FFFFFF',
                    strokeWidth: 1,
                    smooth: true,
                },
            },
        },
        table: {
            show: false,
            responsiveBreakpoint: 400,
            useDialog: false,
            columnNames: {
                source: 'Source',
                target: 'Target',
                value: 'Value',
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
        },
    };
});

const config = computed<VueUiFlowConfig>(() => {
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
            nodeCategories: {
                // Raw Materials
                Mining: 'raw',

                // Components
                Copper: 'component',
                Lithium: 'component',
                Gold: 'component',
                'Rare Earths': 'component',

                // Manufacturing
                'PCB Assembly': 'manufacturing',
                'Battery Production': 'manufacturing',
                Microchips: 'manufacturing',

                // Assembly
                'Phone Assembly': 'assembly',

                // Distribution
                Retail: 'distribution',

                // Consumer Use
                'Consumer Use': 'consumer',

                // End-of-life
                Recycling: 'endOfLife',
                Landfill: 'endOfLife',
                Resale: 'endOfLife',

                // Secondary flow
                'Recovered Materials': 'secondary',
                'E-Waste': 'secondary',
                'Second-hand Use': 'secondary',
            },
            nodeCategoryColors: {
                raw: '#8B4513', // Brown - for extraction
                component: '#1E90FF', // Blue - technical materials
                manufacturing: '#FFD700', // Gold - active production
                assembly: '#FF8C00', // Dark orange
                distribution: '#A020F0', // Purple - logistics
                consumer: '#228B22', // Green - use phase
                endOfLife: '#B22222', // Firebrick red
                secondary: '#20B2AA', // Light sea green - reuse/recover
            },
            style: {
                chart: {
                    height: 350,
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
        <VueUiFlow :dataset :config>
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
                <FlowSvg :svg />
            </template>

            <template #hint="{ hint, isVisible }">
                <KeyboardNavigationHint
                    :hint
                    :is-visible
                    style="margin-top: -24px"
                />
            </template>

            <template #watermark="{ isPrinting }">
                <Watermark :is-printing />
            </template>

            <template #legend="{ legend }">
                <FlowLegend :items="legend" />
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>

            <template #skeleton>
                <Skeleton />
            </template>

            <template #tooltip-before>
                <span style="color: chocolate"> #tooltip-before </span>
                <br />
            </template>

            <template #tooltip="{ datapoint, seriesIndex }">
                <FlowTooltip :datapoint :series-index />
            </template>

            <template #tooltip-after>
                <br />
                <span style="color: chocolate"> #tooltip-after </span>
            </template>
        </VueUiFlow>
    </div>
</template>
