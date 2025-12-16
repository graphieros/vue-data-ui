<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiDag from "../src/components/vue-ui-dag.vue";
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import { useArena } from "../src/useArena";
import { VueUiDag } from "vue-data-ui";
import {VueUiDag as VueUiDagTreeshaken } from "vue-data-ui/vue-ui-dag";

const { local, build, vduiLocal, vduiBuild } = useArena();
const { vue_ui_dag: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const dataset = ref({
    nodes: [
        { id: "A", label: "AAA\naaa", backgroundColor: '#FF0000', color: 'white'},
        { id: "B", label: "BBB",},
        { id: "C", label: "CCC", color: '#FF0000'},
        { id: "D", label: "DDD" },
    ],
    edges: [
        { 
            from: "A", 
            to: "B", 
            color: '#FF0000',
            animated: true,
            dasharray: '2 6',
            animationDurationMs: 1000,
            animationDirection: -1 // force direction
        },
        { from: "B", to: "A" },
        { from: "B", to: "A" },
        { from: "C", to: "A" },
        { from: "B", to: "D" },
        { from: "C", to: "D" },
        { from: "D", to: "A", animated: true },
    ]
});

// onMounted(() => {
//     setTimeout(() => {
//         dataset.value.edges.at(-1).animated = false
//     }, 2000)
// })

// const dataset = ref(undefined);

// onMounted(() => {
//     setTimeout(() => {
//         dataset.value = {
//             nodes: [
//                 { id: "A", label: "AAA", backgroundColor: '#FF0000', color: 'white'},
//                 { id: "B", label: "BBB",},
//                 { id: "C", label: "CCC", color: '#FF0000'},
//                 { id: "D", label: "DDD" },
//             ],
//             edges: [
//                 { from: "A", to: "B" },
//                 { from: "B", to: "A" },
//                 { from: "B", to: "A" },
//                 { from: "C", to: "A" },
//                 { from: "B", to: "D" },
//                 { from: "C", to: "D" },
//                 { from: "D", to: "A" },
//             ]
//         }
//     }, 2000)
// })

const model = createModel([
    CHECKBOX('loading', { def: false }),
    CHECKBOX('debug', { def: true }),
    CHECKBOX('responsive', { def: false }),
    CHECKBOX('userOptions.buttons.pdf', { def: true }),
    CHECKBOX('userOptions.buttons.img', { def: true }),
    CHECKBOX('userOptions.buttons.svg', { def: true }),
    CHECKBOX('userOptions.buttons.fullscreen', { def: true }),
    CHECKBOX('userOptions.buttons.zoom', { def: true }),

    TEXT('style.fontFamily', { def: 'inherit' }),

    COLOR('style.chart.backgroundColor', { def: '#FFFFFF' }),
    COLOR('style.chart.color', { def: '#1A1A1A' }),

    CHECKBOX('style.chart.backgroundPattern.show', { def: true }),
    RANGE('style.chart.backgroundPattern.spacingRatio', { def: 3, min: 1, max: 5, step: 0.1}),
    RANGE('style.chart.backgroundPattern.dotRadiusRatio', { def: 5, min: 1, max: 12, step: 1}),
    COLOR('style.chart.backgroundPattern.dotColor', { def: '#E1E5E8' }),
    RANGE('style.chart.backgroundPattern.opacity', { def: 1, min: 0, max: 1, step: 0.1 }),

    SELECT('style.chart.layout.rankDirection', ['TB', 'RL', 'BT', 'LR'],  { def: 'TB'}),
    SELECT('style.chart.layout.rankSeparation', [100, 80, 60, 40, 20, 0], { def: 60} ),
    SELECT('style.chart.layout.nodeSeparation', [100, 75, 50, 25, 0], { def: 50}),
    SELECT('style.chart.layout.edgeSeparation', [60, 50, 40, 30, 20, 10, 0], { def: 30}),
    RANGE('style.chart.layout.nodeWidth', {def: 100, min: 40, max: 200 }),
    RANGE('style.chart.layout.nodeHeight', {def: 40, min: 20, max: 200 }),
    CHECKBOX('style.chart.layout.curvedEdges', { def: true }),
    SELECT('style.chart.layout.align', ['UL', 'UR', 'DL', 'DR', ''], { def: undefined }),
    SELECT('style.chart.layout.arrowShape', ['undirected', 'normal', 'vee'], { def: 'vee'}),

    COLOR('style.chart.nodes.stroke', { def: '#E1E5E8'}),
    RANGE('style.chart.nodes.strokeWidth', { def: 1, min: 0, max: 12 }),
    RANGE('style.chart.nodes.borderRadius', { def: 3, min: 0, max: 24 }),
    COLOR('style.chart.nodes.backgroundColor', { def: '#FFFFFF'}),
    COLOR('style.chart.nodes.labels.color', { def: '#1A1A1A' }),
    RANGE('style.chart.nodes.labels.fontSize', { def: 12, min: 8, max: 42}),
    CHECKBOX('style.chart.nodes.labels.bold', { def: false }),
    CHECKBOX('style.chart.nodes.tooltip.showOnClick', { def: true }),
    COLOR('style.chart.nodes.tooltip.backgroundColor', { def: '#E1E5E8'}),
    COLOR('style.chart.nodes.tooltip.color', { def: '#1A1A1A' }),
    TEXT('style.chart.nodes.tooltip.maxWidth', { def: '300px'}),

    COLOR('style.chart.edges.stroke', { def: '#CCCCCC' }),
    RANGE('style.chart.edges.strokeWidth', { def: 1, min: 0.5, max: 6, step: 0.1 }),
    
    CHECKBOX('style.chart.midpoints.show', { def: true }),
    RANGE('style.chart.midpoints.radius', { def: 4, min: 2, max: 8, step: 0.5 }),
    COLOR('style.chart.midpoints.stroke', { def: '#CCCCCC'}),
    COLOR('style.chart.midpoints.fill', { def: '#FFFFFF'}),
    RANGE('style.chart.midpoints.strokeWidth', { def: 1, min: 0.5, max: 6, step: 0.1 }),
    TEXT('style.chart.midpoints.tooltip.maxWidth', { def: '300px'}),
    COLOR('style.chart.midpoints.tooltip.backgroundColor', { def: '#E1E5E8'}),
    COLOR('style.chart.midpoints.tooltip.color', { def: '#1A1A1A'}),

    CHECKBOX('style.chart.controls.show', { def: true }),
    SELECT('style.chart.controls.position', ['top', 'bottom'], { def: 'bottom' }),
    COLOR('style.chart.controls.backgroundColor', { def: '#E1E5E8'}),
    COLOR('style.chart.controls.buttonColor', { def: '#E1E5E8'}),
    COLOR('style.chart.controls.color', { def: '#1A1A1A'}),
    NUMBER('style.chart.controls.fontSize', { def: 14, min: 8, max: 36 }),
    TEXT('style.chart.controls.border', { def: '1px solid #CCCCCC'}),
    TEXT('style.chart.controls.padding', { def: '0.5rem'}),
    TEXT('style.chart.controls.borderRadius', { def: '0.25rem'}),

    CHECKBOX('style.chart.zoom.active', { def: true }),

    TEXT('style.chart.title.text', { def: 'Title'}),
    COLOR('style.chart.title.color', { def: '#1A1A1A'}),
    NUMBER('style.chart.title.fontSize', { def: 20, min: 12, max: 36}),
    CHECKBOX('style.chart.title.bold', { def: true }),
    SELECT('style.chart.title.textAlign', ['left', 'center', 'right'], { def: 'center'}),
    NUMBER('style.chart.title.paddingLeft', { def: 0, min: -100, max: 100 }),
    NUMBER('style.chart.title.paddingRight', { def: 0, min: -100, max: 100 }),
    COLOR('style.chart.title.subtitle.color', { def: '#A1A1A1' }),
    TEXT('style.chart.title.subtitle.text', { def: 'Subtitle'}),
    NUMBER('style.chart.title.subtitle.fontSize', { def: 16, min: 8, max: 36 }),
    CHECKBOX('style.chart.title.subtitle.bold', { def: false })
]);

const config = computed(() => {
    const c = convertArrayToObject(model.value);

    return {
        ...c,
        // loading: true
    }
});

// onMounted(() => {
//     if (local.value) {
//         console.log(local.value.getData())
//     }
// })

const themeOptions = ref([
    "",
    "dark",
    "hack",
    "zen",
    "concrete",
    "default",
    "celebration",
    "celebrationNight"
])

const currentTheme = ref(themeOptions.value[4]);

const configTheme = computed(() => ({
    theme: currentTheme.value,
    style: {
        chart: {
            nodes: {
                tooltip: { showOnClick: true }
            },
            midpoints: { show: true },
            title: {
                text: 'Title',
                subtitle: {
                    text: 'Subtitle'
                }
            }
        }
    }
}));

</script>

<template>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <Box comp="VueUiDag" :dataset="dataset" :config="config">
        <template #title>VueUiDag</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiDag :dataset="dataset" :config="{
                    ...config,
                    responsive: true
                }">
                <!-- <template #background-pattern="{ x, y, color }">
                    <line :x1="x - 2" :x2="x + 2" :y1="y" :y2="y" :stroke="color" stroke-width="0.5"/>
                    <line :x1="x" :x2="x" :y1="y - 2" :y2="y + 2" :stroke="color" stroke-width="0.5"/>
                </template>     -->
            </LocalVueUiDag>
            </div>
        </template>

        <template #local>
                    <LocalVueUiDag :dataset="dataset" :config="config" ref="local">
            <!-- <template #node-label="{ node }">
                {{ node.label }}
            </template>  -->
            <!-- <template #node="{ node }">
                <div style="width: 100%; height: 100%; border: 1px solid red; color: black;">
                    {{ node.label }}
                </div>
            </template> -->
            <!-- <template #tooltip-midpoint="{ edge }">
                {{ edge }}
            </template>
            <template #tooltip-node="{ node }">
                {{ node }}
            </template> -->
            <!-- <template #free-node-label="{ node, orientation }">
                <text :x="node.x" text-anchor="middle" :y="node.y + node.height" fill="red">
                    {{ orientation }}
                </text>
            </template> -->
        </LocalVueUiDag>
        </template>

        <template #theme>
            <LocalVueUiDag :dataset="dataset" :config="configTheme"/>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiDag" :dataset="dataset" :config="config"/>
        </template>

        <template #build>
            <VueUiDag :dataset="dataset" :config="config"/>
        </template>

        <template #build-treesh>
            <VueUiDagTreeshaken :dataset="dataset" :config="config"/>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiDag" :dataset="dataset" :config="config"/>
        </template>

        <template #knobs>
            <ConfigKnobs :model="model" />
        </template>
    </Box>
</template>