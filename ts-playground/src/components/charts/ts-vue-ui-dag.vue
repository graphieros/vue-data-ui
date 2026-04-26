<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiDag>
 */
import { computed } from 'vue';
import { mergeConfigs } from 'vue-data-ui/utils';
import {
    VueUiDag,
    type VueUiDagConfig,
    type VueUiDagDataset,
} from 'vue-data-ui/vue-ui-dag';

import CommonAnnotatorActionColor from '../slots/common/annotator-action-color.vue';
import CommonAnnotatorActionDraw from '../slots/common/annotator-action-draw.vue';
import CommonAnnotatorActionUndo from '../slots/common/annotator-action-undo.vue';
import CommonAnnotatorActionRedo from '../slots/common/annotator-action-redo.vue';
import CommonAnnotatorActionDelete from '../slots/common/annotator-action-delete.vue';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';
import CommonOptionAnnotator from '../slots/common/option-annotator.vue';

import 'vue-data-ui/style.css';
import DagOptionZoom from '../slots/vue-ui-dag/dag-option-zoom.vue';
import DagBackgroundPattern from '../slots/vue-ui-dag/dag-background-pattern.vue';
import DagNode from '../slots/vue-ui-dag/dag-node.vue';
import DagNodeLabel from '../slots/vue-ui-dag/dag-node-label.vue';
import DagFreeNodeLabel from '../slots/vue-ui-dag/dag-free-node-label.vue';
import DagSvg from '../slots/vue-ui-dag/dag-svg.vue';
import KeyboardNavigationHint from '../slots/common/keyboard-navigation-hint.vue';
import Watermark from '../slots/common/watermark.vue';
import DagTooltipMidpoint from '../slots/vue-ui-dag/dag-tooltip-midpoint.vue';
import DagTooltipNode from '../slots/vue-ui-dag/dag-tooltip-node.vue';
import Skeleton from '../slots/common/skeleton.vue';

const dataset = computed<VueUiDagDataset>(() => {
    return {
        nodes: [
            { id: 'A', label: 'A' },
            { id: 'B', label: 'B' },
            { id: 'C', label: 'C' },
            { id: 'D', label: 'D' },
        ],
        edges: [
            { from: 'A', to: 'B' },
            { from: 'B', to: 'A' },
            { from: 'B', to: 'A' },
            { from: 'C', to: 'A' },
            { from: 'B', to: 'D' },
            { from: 'C', to: 'D' },
            { from: 'D', to: 'A' },
        ],
    };
});

const testPreconfig = computed<VueUiDagConfig>(() => {
    return {
        skeletonConfig: null,
        skeletonDataset: null,
        loading: false,
        debug: false,
        responsive: false,
        theme: '',
        a11y: {
            translations: {
                keyboardNavigation:
                    'Use the left and right, or up and down arrow keys to move between datapoints',
                tableAvailable:
                    'A data table for this chart is available below.',
                tableCaption: 'Chart data table',
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
                csv: false,
                img: true,
                table: false,
                labels: false,
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
                pdf: 'Download PDF',
                img: 'Download PNG',
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
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                width: null,
                height: null,
                backgroundPattern: {
                    show: true,
                    spacingRatio: 3,
                    dotRadiusRatio: 5,
                    dotColor: '#e1e5e8',
                    opacity: 1,
                },
                layout: {
                    rankDirection: 'TB',
                    rankSeparation: 60,
                    nodeSeparation: 50,
                    edgeSeparation: 30,
                    nodeWidth: 100,
                    nodeHeight: 40,
                    curvedEdges: true,
                    padding: 48,
                    arrowShape: 'vee',
                    arrowSize: 8,
                },
                nodes: {
                    stroke: '#CCCCCC',
                    strokeWidth: 1,
                    borderRadius: 3,
                    backgroundColor: '#FFFFFF',
                    labels: {
                        color: '#2D353C',
                        fontSize: 12,
                        bold: false,
                    },
                    tooltip: {
                        showOnClick: true,
                        backgroundColor: '#e1e5e8',
                        color: '#2D353C',
                        maxWidth: '300px',
                    },
                    selected: {
                        stroke: null,
                        strokeWidth: null,
                        backgroundColor: null,
                        labelColor: null,
                        downstreamEdges: {
                            stroke: null,
                            animated: true,
                        },
                        upstreamEdges: {
                            stroke: null,
                            animated: true,
                        },
                    },
                },
                edges: {
                    stroke: '#CCCCCC',
                    strokeWidth: 1,
                    animations: {
                        dasharray: '2 6',
                        animationDurationMs: 1000,
                    },
                },
                midpoints: {
                    show: true,
                    radius: 4,
                    stroke: '#CCCCCC',
                    fill: '#FFFFFF',
                    strokeWidth: 1,
                    tooltip: {
                        maxWidth: '300px',
                        backgroundColor: '#e1e5e8',
                        color: '#2D353C',
                    },
                    selectedEdge: {
                        stroke: null,
                        animated: true,
                    },
                },
                controls: {
                    position: 'bottom',
                    show: true,
                    backgroundColor: '#e1e5e8',
                    buttonColor: '#e1e5e8',
                    color: '#2D353C',
                    fontSize: 14,
                    border: '1px solid #e1e5e8',
                    padding: '0.5rem',
                    borderRadius: '0.25rem',
                },
                zoom: {
                    active: true,
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
            },
        },
    };
});

const config = computed<VueUiDagConfig>(() => {
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
    <div style="max-width: 400px">
        <VueUiDag :dataset :config>
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

            <template #optionZoom="{ toggleZoom, isZoomLocked }">
                <DagOptionZoom :toggle-zoom :is-zoom-locked />
            </template>

            <template #optionAltCopy>
                <code style="color: chocolate; font-size: 10px"
                    >#optionAltCopy</code
                >
            </template>

            <template #background-pattern="{ x, y, color }">
                <DagBackgroundPattern :x :y :color />
            </template>

            <template #node="{ node, orientation }">
                <DagNode :node :orientation />
            </template>

            <template #node-label="{ node, orientation }">
                <DagNodeLabel :node :orientation />
            </template>

            <!-- Overrides #node-label -->
            <template #free-node-label="{ node, orientation, layoutData }">
                <DagFreeNodeLabel :node :orientation :layout-data />
            </template>

            <template #svg="{ svg }">
                <DagSvg :svg />
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

            <template #tooltip-midpoint="{ edge, layoutData }">
                <DagTooltipMidpoint :edge :layout-data />
            </template>

            <template #tooltip-node="{ node, layoutData }">
                <DagTooltipNode :node :layout-data />
            </template>

            <template #source>
                <code style="color: chocolate"> #source </code>
            </template>

            <template #skeleton>
                <Skeleton />
            </template>
        </VueUiDag>
    </div>
</template>
