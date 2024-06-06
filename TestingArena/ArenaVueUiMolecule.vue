<script setup>
import { ref, computed } from "vue";
import LocalVueUiMolecule from '../src/components/vue-ui-molecule.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const dataset = ref([
    {
        name: "Root",
        details: "This is the root node",
        nodes: [
            {
                name: 'node1',
                details: 'Lorem ipsum',
                nodes: [
                    {
                        name: 'node1.1', details: 'Lorem ipsum', nodes: [
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
])

const model = ref([
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.nodes.stroke', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.nodes.strokeHovered', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.links.stroke', def: '#DDDDDD', type: 'color'},
    { key: 'style.chart.title.text', def: 'Lorem ipsum dolor sit amet', type: 'text'},
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 8, max: 48},
    { key: 'style.chart.title.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sot amet', type: 'text'},
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type:'number', min: 8, max: 48},
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.tooltip.show', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.tooltip.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.tooltip.fontSize', def: 14, type: 'number', min: 8, max: 24},
    { key: 'style.chart.zoom.speed', def: 1, type: 'number', min: 0, max: 2, step: 0.01},
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'table.show', def: false, type: 'checkbox'},
    { key: 'table.responsiveBreakpoint', def: 400, type:'number', min: 300, max: 800},
    { key: 'table.th.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.th.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.th.outline', def: 'none', type: 'text'},
    { key: 'table.td.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.td.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.td.outline', def: 'none', type: 'text'},
    { key: 'table.translations.nodeName', def: 'Node name', type: 'text'},
    { key: 'table.translations.details', def: 'Details', type: 'text'},
    { key: 'table.translations.parentNode', def: 'Parent node', type: 'text'},
])

const testCustomTooltip = ref(false);

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default"
])

const currentTheme = ref(themeOptions.value[3])

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
            theme: currentTheme.value,
            customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
        }
    }
})

const step = ref(0);

</script>

<template>
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
    <Box>
        <template #title>VueUiMolecule</template>

        <template #local>
            <LocalVueUiMolecule :dataset="dataset" :config="config" :key="`local_${step}`">
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
            </LocalVueUiMolecule>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiMolecule" :dataset="dataset" :config="config" :key="`vdui_local_${step}`">
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
            <VueUiMolecule :dataset="dataset" :config="config" :key="`build_${step}`">
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

        <template #VDUI-build>
            <VueDataUi component="VueUiMolecule" :dataset="dataset" :config="config" :key="`vdui_build_${step}`">
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
            <div
                style="display: flex; flex-direction: row; flex-wrap:wrap; align-items:center; width: 100%; color: #CCCCCC; gap:24px;">
                <div v-for="knob in model">
                    <label style="font-size: 10px">{{ knob.key }}</label>
                    <div
                        style="display:flex; flex-direction:row; flex-wrap: wrap; align-items:center; gap:6px; height: 40px">
                        <input v-if="!['none', 'select'].includes(knob.type)" :step="knob.step" :type="knob.type"
                            :min="knob.min ?? 0" :max="knob.max ?? 0" v-model="knob.def" @change="step += 1">
                        <select v-if="knob.type === 'select'" v-model="knob.def" @change="step += 1">
                            <option v-for="opt in knob.options">{{ opt }}</option>
                        </select>
                    </div>
                </div>
            </div>
        </template>

        <template #config>
            {{ config }}
        </template>
    </Box>
</template>