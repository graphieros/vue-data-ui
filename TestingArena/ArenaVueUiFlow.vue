<script setup>
import { ref, computed } from "vue";
import LocalVueUiFlow from '../src/components/vue-ui-flow.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena()

const dataset = ref([
    [ 'A1', 'B1', 10 ],
    [ 'A1', 'B2', 10 ],
    [ 'B1', 'C1', 5 ],
    [ 'B1', 'C2', 5 ],
    [ 'B1', 'C3', 5 ],
    [ 'B1', 'C4', 5 ],
    [ 'A2', 'B1', 10],
    [ 'B2', 'C5', 10],
    [ 'C3', 'D1', 2],
    [ 'C4', 'D1', 2],
    [ 'C5', 'D1', 2],
    [ 'C2', 'D2', 2],
    [ 'C3', 'D2', 1],
]);
    
const model = ref([
    { key: 'userOptions.show', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.table', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox' },
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right']},
    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},
    
    { key: 'style.fontFamily', def: 'inherit', type: 'text' },
    { key: 'style.chart.backgroundColor', def: '#FFFFFF20', type: 'color' },
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.padding.top', def: 12, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.padding.left', def: 12, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.padding.right', def: 12, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.padding.bottom', def: 0, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.title.text', def: 'Lorem ipsum dolor', type: 'text' },
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.title.bold', def: true, type: 'checkbox' },
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sit amet', type: 'text' },
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color' },
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox' },
    { key: 'style.chart.nodes.gap', def: 10, type: 'number', min: 0, max: 40 },
    { key: 'style.chart.nodes.minHeight', def: 20, type: 'number', min: 5, max: 100 },
    { key: 'style.chart.nodes.width', def: 40, type: 'number', min: 10, max: 100 },
    { key: 'style.chart.nodes.labels.fontSize', def: 14, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.nodes.labels.abbreviation.use', def: true, type: 'checkbox' },
    { key: 'style.chart.nodes.labels.abbreviation.length', def: 3, type: 'number', min: 1, max: 12 },
    { key: 'style.chart.nodes.stroke', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.nodes.strokeWidth', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.links.opacity', def: 0.8, type: 'number', min: 0, max: 1, step: 0.1 },
    { key: 'style.chart.links.stroke', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.links.strokeWidth', def: 1, type: 'number', min: 0, max: 12 },
    { key: 'style.chart.links.width', def: 200, type: 'number', min: 40, max: 300 }
])

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default"
])

const currentTheme = ref(themeOptions.value[4])

const config = computed(() => {
    const c = convertArrayToObject(model.value);

    return {
        theme: currentTheme.value,
        ...c,
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                nodes: {
                    ...c.style.chart.nodes,
                    labels: {
                        ...c.style.chart.nodes.labels,
                        formatter: ({value, config}) => {
                            // console.log(config)
                            return `f | ${value}`
                        }
                    }
                }
            }
        }
    }
})

const step = ref(0);

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <Box comp="VueUiFlow" :dataset="dataset">
        <template #title>VueUiFlow</template>

        <template #local>
            <LocalVueUiFlow :dataset="dataset" :config="config" :key="`local_${step}`" ref="local">
                <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template>

                <template #optionPdf>
                    PRINT PDF
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
            </LocalVueUiFlow>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiFlow" :dataset="dataset" :config="config" :key="`VDUI_local_${step}`" ref="vduiLocal"></LocalVueDataUi>
        </template>

        <template #build>
            <VueUiFlow :dataset="dataset" :config="config" :key="`build_${step}`" ref="build"></VueUiFlow>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiFlow" :dataset="dataset" :config="config" :key="`VDUI_build_${step}`" ref="vduiBuild"></VueDataUi>
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
    </Box>
</template>