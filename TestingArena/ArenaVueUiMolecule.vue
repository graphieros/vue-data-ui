<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiMolecule from '../src/components/vue-ui-molecule.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import BaseIcon from "../src/atoms/BaseIcon.vue";
import { VueUiMolecule } from "vue-data-ui";
import { VueUiMolecule as VueUiMoleculeTreeshaken } from "vue-data-ui/vue-ui-molecule";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { local, build, vduiLocal, vduiBuild, toggleTable, toggleLabels } = useArena();
const { vue_ui_molecule: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const dataset = ref(undefined);

onMounted(() => {
    setTimeout(() => {
        dataset.value = [
    {
        name: "Root",
        details: "This is the root node",
        color: 'red',
        nodes: [
            {
                name: 'node1',
                details: 'Lorem ipsum',
                color: 'blue',
                nodes: [
                    {
                        name: 'node1.1', details: 'Lorem ipsum', color: 'green', nodes: [
                            { name: 'node1.1' },
                            { name: 'node1.2' },
                            { name: 'node1.3' },
                        ]
                    },
                    {
                        name: 'node1.2', nodes: [
                            { name: 'node1.2.1' },
                            { name: 'node1.2.2' },
                            { name: 'node1.2.3' },
                            { name: 'node1.2.4' },
                        ]
                    },
                    {
                        name: 'node1.3', nodes: [
                            { name: 'node1.3.1' },
                            { name: 'node1.3.2' },
                        ]
                    },
                    {
                        name: 'node1.4', nodes: [
                            { name: 'node1.4.1' },
                            { name: 'node1.4.2' },
                            { name: 'node1.4.3' },
                            { name: 'node1.4.4' },
                            { name: 'node1.4.5' },
                            { name: 'node1.4.6' },
                        ]
                    },
                    {
                        name: 'node1.5', nodes: [
                            { name: 'node1.5.1' },
                            { name: 'node1.5.2' },
                            { name: 'node1.5.3' },
                            { name: 'node1.5.4' },
                            { name: 'node1.5.5' },
                            { name: 'node1.5.6' },
                        ]
                    },
                    {
                        name: 'node1.6', nodes: [
                            { name: 'node1.6.1' },
                            { name: 'node1.6.2' },
                            { name: 'node1.6.3' },
                            { name: 'node1.6.4' },
                            { name: 'node1.6.5' },
                            { name: 'node1.6.6' },
                        ]
                    },
                ]
            },
            {
                name: 'node2',
                nodes: [
                    {
                        name: 'node2.1', nodes: [
                            { name: 'node2.1.1' },
                            { name: 'node2.1.2' },
                            { name: 'node2.1.3' },
                            { name: 'node2.1.4' },
                            { name: 'node2.1.5' },
                            {
                                name: 'node2.1.6', nodes: [
                                    { name: 'node2.1.6.1' },
                                    { name: 'node2.1.6.2' },
                                    { name: 'node2.1.6.3' },
                                    { name: 'node2.1.6.4' },
                                    { name: 'node2.1.6.5' },
                                ]
                            },
                        ]
                    },
                ]
            },
            {
                name: 'node3',
                nodes: [
                    { name: 'node3.1' },
                    { name: 'node3.2' },
                    { name: 'node3.3' },
                ]
            },
            {
                name: 'node4',
                nodes: [
                    { name: 'node4.1' },
                    { name: 'node4.2', nodes: [
                        { name: 'node4.2.1'},
                        { name: 'node4.2.2'},
                        { name: 'node4.2.3'},
                    ] },
                    { name: 'node4.3' },
                    { name: 'node4.4', nodes: [
                        { name: 'node4.4.1'},
                        { name: 'node4.4.2'},
                        { name: 'node4.4.3'},
                        { name: 'node4.4.4'},
                        { name: 'node4.4.5'},
                    ] },
                ]
            },
            {
                name: 'node5',
                nodes: [
                    { name: 'node4.1' },
                    { name: 'node4.2' },
                    { name: 'node4.3' },
                    { name: 'node4.4' },
                    { name: 'node4.5' },
                ]
            },
            {
                name: 'node6',
                nodes: [
                    { name: 'node4.1' },
                    { name: 'node4.2' },
                    { name: 'node4.3' },
                    { name: 'node4.4' },
                ]
            },
        ]
    }
]
    }, 2000)
})

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    CHECKBOX("userOptions.show", { def: true }),
    CHECKBOX("userOptions.buttons.pdf", { def: true }),
    CHECKBOX("userOptions.buttons.img", { def: true }),
    CHECKBOX("userOptions.buttons.csv", { def: true }),
    CHECKBOX("userOptions.buttons.table", { def: true }),
    CHECKBOX("userOptions.buttons.labels", { def: true }),
    CHECKBOX("userOptions.buttons.fullscreen", { def: true }),
    SELECT("userOptions.position", ["left", "right"], { def: "right" }),
    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" }),

    TEXT("style.fontFamily", { def: "inherit" }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),
    COLOR("style.chart.nodes.stroke", { def: "#FFFFFF" }),
    COLOR("style.chart.nodes.strokeHovered", { def: "#1A1A1A" }),
    COLOR("style.chart.links.stroke", { def: "#DDDDDD" }),
    TEXT("style.chart.title.text", { def: "Lorem ipsum dolor sit amet" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.bold", { def: true }),
    COLOR("style.chart.title.subtitle.color", { def: "#CCCCCC" }),
    TEXT("style.chart.title.subtitle.text", { def: "Lorem ipsum dolor sot amet" }),
    NUMBER("style.chart.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false }),

    CHECKBOX("style.chart.tooltip.show", { def: true }),
    COLOR("style.chart.tooltip.color", { def: "#1A1A1A" }),
    COLOR("style.chart.tooltip.backgroundColor", { def: "#FFFFFF" }),
    NUMBER("style.chart.tooltip.fontSize", { def: 14, min: 8, max: 24 }),
    RANGE("style.chart.tooltip.backgroundOpacity", { def: 100, min: 0, max: 100 }),
    SELECT("style.chart.tooltip.position", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.chart.tooltip.offsetY", { def: 24, min: 0, max: 48 }),

    CHECKBOX("style.chart.zoom.show", { def: false }),
    NUMBER("style.chart.zoom.speed", { def: 1, min: 0, max: 2, step: 0.01 }),

    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true }),

    NUMBER("table.responsiveBreakpoint", { def: 400, min: 300, max: 800 }),
    COLOR("table.th.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.th.color", { def: "#1A1A1A" }),
    TEXT("table.th.outline", { def: "none" }),
    COLOR("table.td.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.td.color", { def: "#1A1A1A" }),
    TEXT("table.td.outline", { def: "none" }),
    TEXT("table.translations.nodeName", { def: "Node name" }),
    TEXT("table.translations.details", { def: "Details" }),
    TEXT("table.translations.ancestor", { def: "Parent node" })
]);


const testCustomTooltip = ref(false);

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

const currentTheme = ref(themeOptions.value[1]);

const configTheme = computed(() => ({ theme: currentTheme.value }));

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    if(testCustomTooltip.value) {
        return {
            ...c,
            style: {
                ...c.style,
                chart: {
                    ...c.style.chart,
                    tooltip: {
                        ...c.style.chart.tooltip,
                        customFormat: (data) => {
                            console.log('MOLECULE CUSTOM TOOLTIP', data);
                            return 'CUSTOM TOOLTIP'
                        }
                    }
                }
            }
        }
    } else {
        return {
            ...c,
            events: {
                datapointEnter: ({ datapoint, seriesIndex }) => {
                    console.log('enter event', { datapoint, seriesIndex });
                },
                datapointLeave: ({ datapoint, seriesIndex }) => {
                    console.log('leave event', { datapoint, seriesIndex });
                },
                datapointClick: ({ datapoint, seriesIndex }) => {
                    console.log('click event', { datapoint, seriesIndex });
                },
            },
            theme: currentTheme.value,
            customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
        }
    }
})

const step = ref(0);

function selectNode(node) {
    console.log(node)
}

onMounted(async () => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img)
    }
})

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <button @click="toggleLabels">TOGGLE LABELS</button>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>
    <div style="margin: 12px 0">
        <input type="checkbox" v-model="testCustomTooltip" id="custom-tooltip"/>
        <label for="custom-tooltip" style="color:#CCCCCC">Test custom tooltip</label>
    </div>
    <Box :dataset="dataset" comp="VueUiMolecule" :config="config">
        <template #title>VueUiMolecule</template>

        <template #theme>
            <LocalVueUiMolecule :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiMolecule @selectNode="selectNode" :dataset="dataset" :config="config" :key="`local_${step}`" ref="local">
                <!-- <template #node="{ node }">
                    <div style="width: 100%; height: 100%; background: white; position:relative">
                        <BaseIcon name="copyLeft" size="100%" style="position:absolute"/>
                    </div>
                </template> -->
                <!-- <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template> -->
                <!-- <template #optionZoom="{ isZoomLocked }">
                    LOCKED: {{ isZoomLocked }}
                </template> -->
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template>
                <template #source>
                    <div style="width:100%;font-size:10px;text-align:left">
                        SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                    </div>
                </template> 
            </LocalVueUiMolecule>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi @selectNode="selectNode" component="VueUiMolecule" :dataset="dataset" :config="config" :key="`vdui_local_${step}`" ref="vduiLocal">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiMolecule :dataset="dataset" :config="config" :key="`build_${step}`" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </VueUiMolecule>
        </template>

        <template #build-treesh>
            <VueUiMoleculeTreeshaken :dataset="dataset" :config="config" :key="`build_${step}`" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </VueUiMoleculeTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiMolecule" :dataset="dataset" :config="config" :key="`vdui_build_${step}`" ref="vduiBuild">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </VueDataUi>
        </template>

        <template #knobs>
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>
    </Box>
</template>