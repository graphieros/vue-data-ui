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

// const dataset = ref(makeDataset(5));

const dataset = ref([
  { name: 'Moscow', datapoints: [{ color: '#ff3700', name: 'Average Monthly Temperature (°C)', values: [-7, -6, 0, 8, 15, 18, 20, 18, 13, 7, 1, -4] }] },       // Mean ≈ 7°C
  { name: 'Chicago', datapoints: [{ color: '#6376DD', name: 'Average Monthly Temperature (°C)', values: [-4, -2, 3, 10, 16, 22, 24, 23, 19, 12, 5, -1] }] }, // Mean ≈ 10°C
  { name: 'Toronto', datapoints: [{ name: 'Average Monthly Temperature (°C)', values: [-3, -2, 2, 9, 15, 20, 22, 21, 17, 10, 4, -1] }] }, // Mean ≈ 9°C
  { name: 'Berlin', datapoints: [{ name: 'Average Monthly Temperature (°C)', values: [0, 2, 6, 12, 16, 19, 21, 21, 17, 12, 7, 3] }] },     // Mean ≈ 12°C
  { name: 'Beijing', datapoints: [{ name: 'Average Monthly Temperature (°C)', values: [-3, 0, 6, 14, 20, 24, 26, 25, 20, 13, 5, -1] }] },  // Mean ≈ 12°C
  { name: 'London', datapoints: [{ name: 'Average Monthly Temperature (°C)', values: [5, 6, 8, 11, 15, 18, 20, 20, 17, 13, 9, 6] }] },     // Mean ≈ 13°C
  { name: 'Paris', datapoints: [{ name: 'Average Monthly Temperature (°C)', values: [5, 6, 9, 12, 16, 19, 21, 21, 18, 13, 8, 5] }] },      // Mean ≈ 13°C
  { name: 'San Francisco', datapoints: [{ name: 'Average Monthly Temperature (°C)', values: [11, 12, 13, 13, 14, 15, 15, 16, 17, 16, 14, 12] }] }, // Mean ≈ 14°C
  { name: 'New York', datapoints: [{ name: 'Average Monthly Temperature (°C)', values: [0, 2, 7, 13, 18, 24, 27, 26, 22, 15, 9, 3] }] },   // Mean ≈ 13°C
  { name: 'Milan', datapoints: [{ name: 'Average Monthly Temperature (°C)', values: [3, 5, 9, 14, 18, 22, 24, 24, 20, 15, 8, 4] }] },      // Mean ≈ 13°C
  { name: 'Madrid', datapoints: [{ name: 'Average Monthly Temperature (°C)', values: [6, 8, 11, 13, 17, 22, 26, 25, 21, 15, 10, 7] }] },   // Mean ≈ 15°C
  { name: 'Rome', datapoints: [{ name: 'Average Monthly Temperature (°C)', values: [8, 9, 11, 14, 18, 22, 25, 25, 22, 17, 12, 9] }] },     // Mean ≈ 16°C
  { name: 'Seoul', datapoints: [{ name: 'Average Monthly Temperature (°C)', values: [-2, 0, 5, 12, 17, 21, 25, 26, 21, 15, 7, 1] }] },     // Mean ≈ 13°C
  { name: 'Tokyo', datapoints: [{ name: 'Average Monthly Temperature (°C)', values: [5, 6, 9, 15, 19, 22, 26, 27, 24, 18, 13, 8] }] },     // Mean ≈ 16°C
  { name: 'Los Angeles', datapoints: [{ name: 'Average Monthly Temperature (°C)', values: [14, 15, 15, 17, 18, 20, 22, 22, 22, 19, 16, 13] }] }, // Mean ≈ 18°C
  { name: 'Istanbul', datapoints: [{ name: 'Average Monthly Temperature (°C)', values: [6, 6, 8, 12, 16, 21, 23, 23, 20, 16, 12, 8] }] },  // Mean ≈ 14°C
  { name: 'Mexico City', datapoints: [{ name: 'Average Monthly Temperature (°C)', values: [13, 14, 15, 16, 16, 16, 15, 15, 15, 14, 13, 13] }] }, // Mean ≈ 15°C
]);

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
    { key: 'style.chart.areas.useCommonColor', def: false, type: 'checkbox'},
    { key: 'style.chart.areas.useGradient', def: true, type: 'checkbox'},
    
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
            <LocalVueUiRidgeLine :dataset="dataset" :config="config">
                <!-- <template #pattern="{ seriesIndex, patternId }">
                    <pattern v-if="seriesIndex === 0" :id="patternId" width="70" height="8" patternTransform="scale(2)"
                    patternUnits="userSpaceOnUse" opacity="0.5">
                    <rect width="100%" height="100%" fill="#FFFFFF20" />
                    <path fill="none" stroke="#ecc94b"
                        d="M-.02 22c8.373 0 11.938-4.695 16.32-9.662C20.785 7.258 25.728 2 35 2s14.215 5.258 18.7 10.338C58.082 17.305 61.647 22 70.02 22M-.02 14.002C8.353 14 11.918 9.306 16.3 4.339 20.785-.742 25.728-6 35-6S49.215-.742 53.7 4.339c4.382 4.967 7.947 9.661 16.32 9.664M70 6.004c-8.373-.001-11.918-4.698-16.3-9.665C49.215-8.742 44.272-14 35-14S20.785-8.742 16.3-3.661C11.918 1.306 8.353 6-.02 6.002" />
                </pattern>
                </template> -->
            </LocalVueUiRidgeLine>
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