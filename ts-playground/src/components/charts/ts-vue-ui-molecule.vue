<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiMolecule>
 */
import { computed } from 'vue';
import {
    VueUiMolecule,
    type VueUiMoleculeConfig,
    type VueUiMoleculeDatasetNode,
} from 'vue-data-ui/vue-ui-molecule';
import { mergeConfigs } from 'vue-data-ui/utils';
import 'vue-data-ui/style.css';

import Watermark from '../slots/common/watermark.vue';
import Skeleton from '../slots/common/skeleton.vue';
import CommonAnnotatorActionColor from '../slots/common/annotator-action-color.vue';
import CommonAnnotatorActionDraw from '../slots/common/annotator-action-draw.vue';
import CommonAnnotatorActionUndo from '../slots/common/annotator-action-undo.vue';
import CommonAnnotatorActionRedo from '../slots/common/annotator-action-redo.vue';
import CommonAnnotatorActionDelete from '../slots/common/annotator-action-delete.vue';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';
import CommonOptionAnnotator from '../slots/common/option-annotator.vue';
import MoleculeOptionZoom from '../slots/vue-ui-molecule/molecule-option-zoom.vue';
import MoleculeNode from '../slots/vue-ui-molecule/molecule-node.vue';
import MoleculeNodeSvg from '../slots/vue-ui-molecule/molecule-node-svg.vue';
import MoleculeSvg from '../slots/vue-ui-molecule/molecule-svg.vue';
import CommonResetAction from '../slots/common/reset-action.vue';
import MoleculeTooltip from '../slots/vue-ui-molecule/molecule-tooltip.vue';

const dataset = computed<VueUiMoleculeDatasetNode[]>(() => {
    return [
        {
            name: 'Root',
            details: 'This is the root node',
            nodes: [
                {
                    name: 'node1',
                    details: 'Lorem ipsum',
                    nodes: [
                        {
                            name: 'node1.1',
                            details: 'Lorem ipsum',
                            nodes: [
                                { name: 'node1.1' },
                                { name: 'node1.2' },
                                { name: 'node1.3' },
                            ],
                        },
                        {
                            name: 'node1.2',
                            nodes: [
                                { name: 'node1.2.1' },
                                { name: 'node1.2.2' },
                                { name: 'node1.2.3' },
                                { name: 'node1.2.4' },
                            ],
                        },
                        {
                            name: 'node1.3',
                            nodes: [
                                { name: 'node1.3.1' },
                                { name: 'node1.3.2' },
                            ],
                        },
                        {
                            name: 'node1.4',
                            nodes: [
                                { name: 'node1.4.1' },
                                { name: 'node1.4.2' },
                                { name: 'node1.4.3' },
                                { name: 'node1.4.4' },
                                { name: 'node1.4.5' },
                                { name: 'node1.4.6' },
                            ],
                        },
                        {
                            name: 'node1.5',
                            nodes: [
                                { name: 'node1.5.1' },
                                { name: 'node1.5.2' },
                                { name: 'node1.5.3' },
                                { name: 'node1.5.4' },
                                { name: 'node1.5.5' },
                                { name: 'node1.5.6' },
                            ],
                        },
                        {
                            name: 'node1.6',
                            nodes: [
                                { name: 'node1.6.1' },
                                { name: 'node1.6.2' },
                                { name: 'node1.6.3' },
                                { name: 'node1.6.4' },
                                { name: 'node1.6.5' },
                                { name: 'node1.6.6' },
                            ],
                        },
                    ],
                },
                {
                    name: 'node2',
                    nodes: [
                        {
                            name: 'node2.1',
                            nodes: [
                                { name: 'node2.1.1' },
                                { name: 'node2.1.2' },
                                { name: 'node2.1.3' },
                                { name: 'node2.1.4' },
                                { name: 'node2.1.5' },
                                {
                                    name: 'node2.1.6',
                                    nodes: [
                                        { name: 'node2.1.6.1' },
                                        { name: 'node2.1.6.2' },
                                        { name: 'node2.1.6.3' },
                                        { name: 'node2.1.6.4' },
                                        { name: 'node2.1.6.5' },
                                        {
                                            name: 'node2.1.6.6',
                                            nodes: [
                                                { name: 'node2.1.6.6.1' },
                                                { name: 'node2.1.6.6.2' },
                                                { name: 'node2.1.6.6.3' },
                                                { name: 'node2.1.6.6.4' },
                                                { name: 'node2.1.6.6.5' },
                                                {
                                                    name: 'node2.1.6.6.6',
                                                    nodes: [
                                                        {
                                                            name: 'node2.1.6.6.6.1',
                                                        },
                                                        {
                                                            name: 'node2.1.6.6.6.2',
                                                        },
                                                        {
                                                            name: 'node2.1.6.6.6.3',
                                                        },
                                                        {
                                                            name: 'node2.1.6.6.6.4',
                                                        },
                                                        {
                                                            name: 'node2.1.6.6.6.5',
                                                        },
                                                        {
                                                            name: 'node2.1.6.6.6.6',
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    name: 'node3',
                    nodes: [
                        { name: 'node3.1' },
                        { name: 'node3.2' },
                        { name: 'node3.3' },
                    ],
                },
                {
                    name: 'node4',
                    nodes: [
                        { name: 'node4.1' },
                        {
                            name: 'node4.2',
                            nodes: [
                                { name: 'node4.2.1' },
                                { name: 'node4.2.2' },
                                { name: 'node4.2.3' },
                            ],
                        },
                        { name: 'node4.3' },
                        {
                            name: 'node4.4',
                            nodes: [
                                { name: 'node4.4.1' },
                                { name: 'node4.4.2' },
                                { name: 'node4.4.3' },
                                { name: 'node4.4.4' },
                                { name: 'node4.4.5' },
                            ],
                        },
                    ],
                },
                {
                    name: 'node5',
                    nodes: [
                        { name: 'node4.1' },
                        { name: 'node4.2' },
                        { name: 'node4.3' },
                        { name: 'node4.4' },
                        { name: 'node4.5' },
                    ],
                },
                {
                    name: 'node6',
                    nodes: [
                        { name: 'node4.1' },
                        { name: 'node4.2' },
                        { name: 'node4.3' },
                        { name: 'node4.4' },
                    ],
                },
            ],
        },
    ];
});

const testPreconfig = computed<VueUiMoleculeConfig>(() => {
    return {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false,
        loading: false,
        events: {
            datapointEnter: null,
            datapointLeave: null,
            datapointClick: null,
        },
        theme: '',
        customPalette: [],
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                nodes: {
                    stroke: '#FFFFFF',
                    strokeHovered: '#2D353C',
                },
                links: {
                    stroke: '#CCCCCC',
                    strokeWidth: 2,
                    useChildColor: false,
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
                },
                zoom: {
                    show: true,
                    speed: 1,
                },
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
                labels: true,
                fullscreen: true,
                sort: false,
                stack: false,
                animation: false,
                annotator: true,
                svg: true,
                zoom: true,
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
                annotator: 'Toggle annotator',
                svg: 'Download SVG',
                zoom: 'Toggle zoom lock',
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
            translations: {
                nodeName: 'Node name',
                details: 'Details',
                ancestor: 'Parent node',
            },
        },
    };
});

const config = computed<VueUiMoleculeConfig>(() => {
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
        <VueUiMolecule :dataset :config>
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

            <template #optionLabels>
                <code style="color: chocolate; font-size: 10px"
                    >#optionLabels</code
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

            <template #optionZoom="{ toggleZoom, isZoomLocked }">
                <MoleculeOptionZoom :toggle-zoom :is-zoom-locked />
            </template>

            <template #node="{ node }">
                <MoleculeNode :node />
            </template>

            <template #node-svg="{ nodeSvg }">
                <MoleculeNodeSvg :node="nodeSvg" />
            </template>

            <template #svg="{ svg }">
                <MoleculeSvg :svg />
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

            <template #tooltip-before>
                <span style="color: chocolate"> #tooltip-before </span>
                <br />
            </template>

            <template #tooltip="{ datapoint, seriesIndex }">
                <MoleculeTooltip :datapoint :series-index />
            </template>

            <template #tooltip-after>
                <br />
                <span style="color: chocolate"> #tooltip-after </span>
            </template>

            <template #skeleton>
                <Skeleton />
            </template>
        </VueUiMolecule>
    </div>
</template>
