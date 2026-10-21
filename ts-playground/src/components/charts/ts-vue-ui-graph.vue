<script setup lang="ts">
/** Interactive TypeScript coverage for every VueUiGraph slot. */
import { computed, ref, useTemplateRef } from 'vue';
import {
    VueUiGraph,
    type VueUiGraphConfig,
    type VueUiGraphDataset,
    type VueUiGraphNode,
    type VueUiGraphViewport,
} from 'vue-data-ui/vue-ui-graph';
import type { AltCopyArgs } from 'vue-data-ui';
import CommonAnnotatorActionColor from '../slots/common/annotator-action-color.vue';
import CommonAnnotatorActionDraw from '../slots/common/annotator-action-draw.vue';
import CommonAnnotatorActionUndo from '../slots/common/annotator-action-undo.vue';
import CommonAnnotatorActionRedo from '../slots/common/annotator-action-redo.vue';
import CommonAnnotatorActionDelete from '../slots/common/annotator-action-delete.vue';
import CommonMenuIcon from '../slots/common/menu-icon.vue';
import CommonOptionFullscreen from '../slots/common/option-fullscreen.vue';
import CommonOptionAnnotator from '../slots/common/option-annotator.vue';
import KeyboardNavigationHint from '../slots/common/keyboard-navigation-hint.vue';
import DagOptionZoom from '../slots/vue-ui-dag/dag-option-zoom.vue';
import 'vue-data-ui/style.css';

const graph = useTemplateRef<InstanceType<typeof VueUiGraph>>('graph');
const customNodes = ref(true);
const customTooltip = ref(true);
const lastAction = ref(
    'Hover or focus a node. Open the menu to test its slots.',
);
const dataset = ref<VueUiGraphDataset>({
    nodes: [
        {
            id: 'alice',
            label: 'Alice\nDesign lead',
            group: 'Design',
            value: 12,
            color: '#FF708D',
            metadata: { role: 'Lead' },
        },
        { id: 'bob', label: 'Bob', group: 'Design', value: 6 },
        {
            id: 'charlie',
            label: 'Charlie\nEngineering lead',
            group: 'Engineering',
            value: 10,
            color: '#FFB74D',
        },
        { id: 'diana', label: 'Diana', group: 'Engineering', value: 5 },
        { id: 'elliot', label: 'Elliot', group: 'Research', value: 8 },
        { id: 'fatima', label: 'Fatima', group: 'Research', value: 4 },
    ],
    links: [
        { source: 'alice', target: 'bob', directed: true },
        { source: 'alice', target: 'charlie', directed: true },
        { source: 'charlie', target: 'diana', directed: true },
        { source: 'charlie', target: 'elliot' },
        { source: 'elliot', target: 'fatima', directed: true },
        { source: 'fatima', target: 'alice' },
        { source: 'bob', target: 'elliot' },
    ],
});
function copyAlt({
    dataset,
    config,
}: AltCopyArgs<VueUiGraphDataset, VueUiGraphConfig>) {
    lastAction.value = `copyAlt: ${config.style?.chart?.title?.text} — ${dataset.nodes.length} nodes, ${dataset.links.length} links`;
}
const config = computed<VueUiGraphConfig>(() => ({
    responsive: false,
    style: {
        chart: {
            title: {
                text: 'VueUiGraph slots',
                subtitle: {
                    text: 'Hover, use the keyboard, and try the menu and annotator',
                },
            },
            nodes: { radius: 16, minRadius: 12, maxRadius: 24 },
            links: { pulses: { showOnHover: true, colorBySource: true } },
        },
    },
    userOptions: {
        show: true,
        showOnChartHover: false,
        keepStateOnChartLeave: true,
        buttons: {
            pdf: true,
            img: true,
            svg: true,
            csv: true,
            table: true,
            fullscreen: true,
            zoom: true,
            tooltip: true,
            annotator: true,
            altCopy: true,
        },
        callbacks: { altCopy: copyAlt },
    },
    tooltip: { showMetadata: true },
    table: { show: true, useDialog: true },
}));
function selectNode(node: VueUiGraphNode | null) {
    lastAction.value = node
        ? `Selected ${node.label ?? node.id}`
        : 'Selection cleared';
}
function zoom(viewport: VueUiGraphViewport) {
    lastAction.value = `Viewport: ${viewport.x.toFixed(1)}, ${viewport.y.toFixed(1)}, scale ${viewport.k.toFixed(3)}`;
}
</script>

<template>
    <section class="graph-slot-playground">
        <div class="graph-slot-controls">
            <label
                ><input v-model="customNodes" type="checkbox" /> Custom node
                slot</label
            >
            <label
                ><input v-model="customTooltip" type="checkbox" /> Custom
                tooltip slot</label
            >
            <button @click="graph?.toggleAnnotator()">
                Test annotator slots
            </button>
            <button @click="graph?.toggleTable()">Test data table</button>
            <button @click="graph?.resetZoom()">Reset zoom</button>
        </div>
        <p aria-live="polite">{{ lastAction }}</p>
        <VueUiGraph
            ref="graph"
            :dataset="dataset"
            :config="config"
            @select-node="selectNode"
            @zoom="zoom"
            @zoom-reset="zoom"
            @copy-alt="copyAlt"
        >
            <template #annotator-action-close><code>Close</code></template>
            <template #annotator-action-color="{ color }"
                ><CommonAnnotatorActionColor :color
            /></template>
            <template #annotator-action-draw="{ mode }"
                ><CommonAnnotatorActionDraw :mode
            /></template>
            <template #annotator-action-undo="{ disabled }"
                ><CommonAnnotatorActionUndo :disabled
            /></template>
            <template #annotator-action-redo="{ disabled }"
                ><CommonAnnotatorActionRedo :disabled
            /></template>
            <template #annotator-action-delete="{ disabled }"
                ><CommonAnnotatorActionDelete :disabled
            /></template>
            <template #menuIcon="{ isOpen, color }"
                ><CommonMenuIcon :is-open="isOpen" :color
            /></template>
            <template #optionPdf><code>#optionPdf</code></template>
            <template #optionImg><code>#optionImg</code></template>
            <template #optionSvg><code>#optionSvg</code></template>
            <template #optionCsv><code>#optionCsv</code></template>
            <template #optionTable><code>#optionTable</code></template>
            <template #optionTooltip><code>#optionTooltip</code></template>
            <template #optionAltCopy><code>#optionAltCopy</code></template>
            <template #optionFullscreen="{ toggleFullscreen, isFullscreen }"
                ><CommonOptionFullscreen
                    :toggle-fullscreen="toggleFullscreen"
                    :is-fullscreen="isFullscreen"
            /></template>
            <template #optionAnnotator="{ toggleAnnotator, isAnnotator }"
                ><CommonOptionAnnotator
                    :toggle-annotator="toggleAnnotator"
                    :is-annotator="isAnnotator"
            /></template>
            <template #optionZoom="{ toggleZoom, isZoomLocked }"
                ><DagOptionZoom
                    :toggle-zoom="toggleZoom"
                    :is-zoom-locked="isZoomLocked"
            /></template>
            <template #custom-menu-before><code>BEFORE</code></template>
            <template #custom-menu-after><code>AFTER</code></template>
            <template #source>
                <div style="text-align: center; padding: 8px">
                    Source: sample graph data
                </div>
            </template>
            <template #hint="{ hint, isVisible }"
                ><KeyboardNavigationHint :hint :is-visible="isVisible"
            /></template>
            <template
                #chart-background="{ width, height, config: chartConfig }"
            >
                <rect
                    x="8"
                    y="8"
                    :width="Math.max(0, width - 16)"
                    :height="Math.max(0, height - 16)"
                    fill="none"
                    :stroke="chartConfig.style?.chart?.color ?? '#CCCCCC'"
                    stroke-dasharray="4 4"
                    pointer-events="none"
                />
                <text
                    x="16"
                    y="28"
                    font-size="11"
                    fill="chocolate"
                    pointer-events="none"
                    >#chart-background</text
                >
            </template>
            <template
                v-if="customNodes"
                #node="{ node, radius, color, selected, hovered }"
            >
                <circle
                    :r="radius"
                    :fill="color"
                    :stroke="
                        selected ? '#FFB74D' : hovered ? '#2D353C' : '#FFFFFF'
                    "
                    :stroke-width="selected || hovered ? 3 : 1"
                />
                <text
                    text-anchor="middle"
                    :x="node.x"
                    :y="(node.y ?? 0) + 2"
                    dominant-baseline="middle"
                    fill="#FFFFFF"
                    :font-size="radius"
                    pointer-events="none"
                    >{{ String(node.label ?? node.id).slice(0, 1) }}</text
                >
            </template>
            <template #svg-underlayer="{ nodes, viewport }">
                <text
                    :x="-viewport.x / viewport.k + 12"
                    :y="-viewport.y / viewport.k + 24"
                    fill="chocolate"
                    font-size="16"
                    opacity="0.5"
                    pointer-events="none"
                >
                    #svg-underlayer: {{ nodes.length }} nodes
                </text>
            </template>

            <template #svg="{ nodes, links, config: chartConfig, viewport }">
                <g
                    pointer-events="none"
                    :opacity="chartConfig.style?.chart?.nodes?.opacity ?? 1"
                >
                    <text
                        v-for="node in nodes"
                        :key="node.id"
                        :x="node.x ?? 0"
                        :y="(node.y ?? 0) + 36"
                        font-size="8"
                        fill="chocolate"
                        >#svg · {{ links.length }} links ·
                        {{ viewport.k.toFixed(2) }}</text
                    >
                </g>
            </template>
            <template #watermark="{ width, height }"
                ><text
                    :x="width - 12"
                    :y="height - 12"
                    text-anchor="end"
                    font-size="11"
                    fill="chocolate"
                    pointer-events="none"
                    >#watermark</text
                ></template
            >
            <template
                #tooltip-before="{
                    datapoint,
                    node,
                    connections,
                    config: tooltipConfig,
                }"
            >
                <small :style="{ color: tooltipConfig.tooltip?.color }"
                    >#tooltip-before · {{ node?.id ?? datapoint?.id }} ·
                    {{ connections }} connections</small
                >
            </template>
            <template
                v-if="customTooltip"
                #tooltip="{
                    datapoint,
                    node,
                    connections,
                    config: tooltipConfig,
                }"
            >
                <div :style="{ color: tooltipConfig.tooltip?.color }">
                    <strong
                        >#tooltip ·
                        {{
                            node?.label ?? datapoint.label ?? datapoint.id
                        }}</strong
                    >
                    <div>Group: {{ node?.group ?? 'None' }}</div>
                    <div>Connections: {{ connections }}</div>
                    <pre v-if="node?.metadata">{{
                        JSON.stringify(node.metadata, null, 2)
                    }}</pre>
                </div>
            </template>
            <template
                #tooltip-after="{
                    datapoint,
                    node,
                    connections,
                    config: tooltipConfig,
                }"
            >
                <small :style="{ color: tooltipConfig.tooltip?.color }"
                    >#tooltip-after · {{ node?.id ?? datapoint?.id }} ·
                    {{ connections }} connections</small
                >
            </template>
        </VueUiGraph>
    </section>
</template>

<style scoped>
.graph-slot-playground {
    width: 100%;
    padding-bottom: 4rem;
}
.graph-slot-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 12px;
}
code {
    color: chocolate;
    font-size: 10px;
    pointer-events: none;
}
</style>
