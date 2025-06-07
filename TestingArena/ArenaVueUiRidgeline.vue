<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiRidgeLine from '../src/components/vue-ui-ridgeline.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default",
    "celebration",
    "celebrationNight"
])

const currentTheme = ref(themeOptions.value[0])

function makeDs(n) {
    let arr = [];
    for (let i = 0; i < n; i += 1) {
        arr.push(Math.random() * (Math.random() > 0 ? 100 : -100) * i)
    }
    return arr;
}

function makeDataset(n) {
    let arr = []
    for (let i = 0; i < n; i += 1) {
        arr.push({
            name: `Serie ${i}`,
            datapoints: [
                {
                    name: 'Variable 1',
                    values: makeDs(24),
                    color: 'red'
                },
                {
                    name: 'Variable 2',
                    values: makeDs(24),
                    color: 'blue'
                }
            ]
        })
    }
    return arr;
}

const dataset = ref(makeDataset(5));

const model = ref([
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},

    { key: 'style.chart.padding.top', def: 0, type: 'number'},
    { key: "style.chart.padding.right", def: 0, type: 'number'},
    { key: 'style.chart.padding.bottom', def: 64, type: 'number'},
    { key: 'style.chart.padding.left', def: 0, type: 'number'},

    { key: 'style.chart.title.text', def: 'Lorem ipsum dolor sit amet', type: 'text'},
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 8, max: 48 },
    { key: 'style.chart.title.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sit amet'},
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox'},

    { key: 'style.chart.dialog.show', def: true, type: 'checkbox'},
    { key: 'style.chart.dialog.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.dialog.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.dialog.header.backgroundColor', def: '#E1E5E8', type: 'color'},
    { key: 'style.chart.dialog.header.color', def: '#1A1A1A', type: 'color'},

    { key: 'style.chart.areas.height', def: 60, type: 'number', min: 30, max: 100, step: 10},
    { key: 'style.chart.areas.rowHeight', def: 30, type: 'number', min: 10, max: 100, step: 10},
    { key: 'style.chart.areas.strokeWidth', def: 1, type: 'number', min: 0, max: 12 },
    { key: 'style.chart.areas.stroke.useSerieColor', def: false, type: 'checkbox'},
    { key: 'style.chart.areas.stroke.color', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.areas.smooth', def: true, type: 'checkbox'},
    { key: 'style.chart.areas.opacity', def: 0.9, min: 0.1, max: 1, step: 0.01, type: 'number'},
    
    { key: 'style.chart.areas.maxPoint.show', def: true, type: 'checkbox'},
    { key: 'style.chart.areas.maxPoint.adaptStrokeToBackground', def: true, type: 'checkbox'},
    { key: 'style.chart.areas.maxPoint.stroke', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.areas.maxPoint.strokeWidth', def: 1, type: 'number', min: 0, max: 12, step: 0.1},
    { key: 'style.chart.areas.maxPoint.strokeDasharray', def: 4, type: 'number', min: 0, max: 12 },

    { key: 'style.chart.selector.show', def: true, type: 'checkbox'},
    { key: 'style.chart.selector.stroke', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.selector.strokeWidth', def: 1, type: 'number', min: 0, max: 42},
    { key: 'style.chart.selector.strokeDasharray', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.selector.labels.fontSize', def: 12, type: 'number', min: 6, max: 48},
    { key: 'style.chart.selector.labels.rounding', def: 0, type: 'number', min: 0, max: 6},
    { key: 'style.chart.selector.labels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.selector.dot.radius', def: 4, type: 'range', min: 0, max: 12},
    { key: 'style.chart.selector.dot.useDatapointColor', def: true, type: 'checkbox'},
    { key: 'style.chart.selector.dot.fill', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.selector.dot.stroke', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.selector.dot.strokeWidth', def: 0.5, step: 0.1, type:'number', min: 0, max: 12},

    { key: 'style.chart.zeroLine.show', def: true, type: 'checkbox'},
    { key: 'style.chart.zeroLine.strokeWidth', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.zeroLine.strokeDasharray', def: 0, type: 'number', min: 0, max: 12},
    { key: 'style.chart.zeroLine.useSerieColor', def: false, type: 'checkbox'},
    { key: 'style.chart.zeroLine.stroke', def: '#CCCCCC', type: 'color'},

    { key: 'style.chart.xAxis.labels.prefix', def: '', type: 'text'},
    { key: 'style.chart.xAxis.labels.suffix', def: '', type: 'text'},
    { key: 'style.chart.xAxis.labels.rotation', def: -30, type: 'number'},
    { key: 'style.chart.xAxis.labels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.xAxis.labels.fontSize', def: 14, type: 'number', min: 8, max: 48},
    { key: 'style.chart.xAxis.labels.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.xAxis.labels.showOnlyAtModulo', def: true, type: 'checkbox'},
    { key: 'style.chart.xAxis.labels.modulo', def: 12, type: 'number'},
    { key: 'style.chart.xAxis.labels.offsetY', def: 0, type: 'number', min: -100, max: 100},

    { key: 'style.chart.yAxis.labels.fontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'style.chart.yAxis.labels.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.yAxis.labels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.yAxis.labels.offsetX', def: 0, type: 'number', min: -100, max: 100}
])

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        theme: currentTheme.value,
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                xAxis: {
                    ...c.style.chart.xAxis,
                    labels: {
                        ...c.style.chart.xAxis.labels,
                        values: dataset.value[0].datapoints[0].values.map((dp, i) => {
                            return `YYYY-MM-DD ${i}`
                        })
                    }
                }
            }
        }
    }
});

</script>

<template>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
        <LocalVueUiRidgeLine
            :dataset="dataset"
            :config="{
                ...config,
                responsive: true
            }"
        />
    </div>
    <Box>
        <template #title>VueUiRidgeline</template>

        <template #local>
            <LocalVueUiRidgeLine :dataset="dataset" :config="config"/>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiRidgeline" :dataset="dataset" :config="config"/>
        </template>

        <template #build>
            <VueUiRidgeline :dataset="dataset" :config="config"/>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiRidgeline" :dataset="dataset" :config="config"/>
        </template>

        <template #knobs>
            <div
                style="display: flex; flex-direction: row; flex-wrap:wrap; align-items:center; width: 100%; color: #CCCCCC; gap:24px;">
                <div v-for="knob in model">
                    <label style="font-size: 10px">{{ knob.key }}</label>
                    <div
                        style="display:flex; flex-direction:row; flex-wrap: wrap; align-items:center; gap:6px; height: 40px">
                        <input v-if="!['none', 'select'].includes(knob.type)" :step="knob.step" :type="knob.type" :min="knob.min ?? 0"
                            :max="knob.max ?? 0" v-model="knob.def" @change="step += 1">
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