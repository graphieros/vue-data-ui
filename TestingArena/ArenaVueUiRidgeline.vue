<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiRidgeLine from '../src/components/vue-ui-ridgeline.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { VueUiRidgeline } from "vue-data-ui";
import { VueUiRidgeline as VueUiRidgelineTreeshaken } from "vue-data-ui/vue-ui-ridgeline";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import useThemeOptions from "./useThemeOptions";

const { vue_ui_ridgeline: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const { themeOptions, currentTheme } = useThemeOptions();

const configTheme = computed(() => ({
    theme: currentTheme.value,
}))

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

const dataset = ref(undefined);

onMounted(() => {
    setTimeout(() => {
        dataset.value = [
            { name: 'Moscow', datapoints: [{ color: '#ff3700', name: 'Series A', values: [-7, -6, 0, 8, 15, 18, 20, 18, 13, 7, 1, -4] }] },       // Mean ≈ 7°C
            { name: 'Chicago', datapoints: [{ color: '#6376DD', name: 'Series B', values: [-4, -2, 3, 10, 16, 22, 24, 23, 19, 12, 5, -1] }] }, // Mean ≈ 10°C
            { name: 'Toronto', datapoints: [{ color: '#AADDAA', name: 'Series C', values: [-3, -2, 2, 9, 15, 20, 22, 21, 17, 10, 4, -1] }] }, // Mean ≈ 9°C
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
            ]
    }, 0)
})

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.padding.top", { def: 0 }),
    NUMBER("style.chart.padding.right", { def: 0 }),
    NUMBER("style.chart.padding.bottom", { def: 0 }),
    NUMBER("style.chart.padding.left", { def: 0 }),
    TEXT("style.chart.title.text", { def: "Lorem ipsum dolor sit amet" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.bold", { def: true }),
    COLOR("style.chart.title.subtitle.color", { def: "#CCCCCC" }),
    TEXT("style.chart.title.subtitle.text", { def: "Lorem ipsum dolor sit amet" }),
    NUMBER("style.chart.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false }),
    CHECKBOX("style.chart.dialog.show", { def: true }),
    COLOR("style.chart.dialog.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.dialog.color", { def: "#1A1A1A" }),
    COLOR("style.chart.dialog.header.backgroundColor", { def: "#E1E5E8" }),
    COLOR("style.chart.dialog.header.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.areas.height", { def: 60, min: 30, max: 100, step: 10 }),
    NUMBER("style.chart.areas.rowHeight", { def: 30, min: 10, max: 100, step: 10 }),
    NUMBER("style.chart.areas.strokeWidth", { def: 1, min: 0, max: 12 }),
    CHECKBOX("style.chart.areas.stroke.useSerieColor", { def: false }),
    COLOR("style.chart.areas.stroke.color", { def: "#FFFFFF" }),
    CHECKBOX("style.chart.areas.smooth", { def: true }),
    NUMBER("style.chart.areas.opacity", { def: 0.9, min: 0.1, max: 1, step: 0.01 }),
    CHECKBOX("style.chart.areas.useCommonColor", { def: false }),
    CHECKBOX("style.chart.areas.useGradient", { def: true }),
    CHECKBOX("style.chart.areas.maxPoint.show", { def: true }),
    CHECKBOX("style.chart.areas.maxPoint.adaptStrokeToBackground", { def: true }),
    COLOR("style.chart.areas.maxPoint.stroke", { def: "#1A1A1A" }),
    NUMBER("style.chart.areas.maxPoint.strokeWidth", { def: 1, min: 0, max: 12, step: 0.1 }),
    NUMBER("style.chart.areas.maxPoint.strokeDasharray", { def: 4, min: 0, max: 12 }),
    CHECKBOX("style.chart.selector.show", { def: true }),
    COLOR("style.chart.selector.stroke", { def: "#CCCCCC" }),
    NUMBER("style.chart.selector.strokeWidth", { def: 1, min: 0, max: 42 }),
    NUMBER("style.chart.selector.strokeDasharray", { def: 2, min: 0, max: 12 }),
    NUMBER("style.chart.selector.labels.fontSize", { def: 12, min: 6, max: 48 }),
    NUMBER("style.chart.selector.labels.rounding", { def: 0, min: 0, max: 6 }),
    COLOR("style.chart.selector.labels.color", { def: "#1A1A1A" }),
    RANGE("style.chart.selector.dot.radius", { def: 4, min: 0, max: 12 }),
    CHECKBOX("style.chart.selector.dot.useDatapointColor", { def: true }),
    COLOR("style.chart.selector.dot.fill", { def: "#CCCCCC" }),
    COLOR("style.chart.selector.dot.stroke", { def: "#FFFFFF" }),
    NUMBER("style.chart.selector.dot.strokeWidth", { def: 0.5, min: 0, max: 12, step: 0.1 }),
    CHECKBOX("style.chart.zeroLine.show", { def: true }),
    NUMBER("style.chart.zeroLine.strokeWidth", { def: 1, min: 0, max: 12 }),
    NUMBER("style.chart.zeroLine.strokeDasharray", { def: 0, min: 0, max: 12 }),
    CHECKBOX("style.chart.zeroLine.useSerieColor", { def: false }),
    COLOR("style.chart.zeroLine.stroke", { def: "#CCCCCC" }),
    TEXT("style.chart.xAxis.labels.prefix", { def: "" }),
    TEXT("style.chart.xAxis.labels.suffix", { def: "" }),
    NUMBER("style.chart.xAxis.labels.rotation", { def: 0 }),
    COLOR("style.chart.xAxis.labels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.xAxis.labels.fontSize", { def: 14, min: 8, max: 48 }),
    CHECKBOX("style.chart.xAxis.labels.bold", { def: false }),
    CHECKBOX("style.chart.xAxis.labels.showOnlyAtModulo", { def: true }),
    NUMBER("style.chart.xAxis.labels.modulo", { def: 12 }),
    NUMBER("style.chart.xAxis.labels.offsetY", { def: 0, min: -100, max: 100 }),
    NUMBER("style.chart.yAxis.labels.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.chart.yAxis.labels.bold", { def: false }),
    COLOR("style.chart.yAxis.labels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.yAxis.labels.offsetX", { def: 0, min: -100, max: 100 }),
    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true }),

    CHECKBOX('style.chart.legend.selectAllToggle.show', { def: true })
]);


const monthValues = computed(() => {
    const yearStart = 2026
    const arr = []

    for (let i = 0; i < 13; i += 1) {
        const d = new Date(yearStart, i, 1)
        arr.push(d.getTime())
    }

    return arr
})

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        // skeletonConfig: {
        //     style: {
        //         chart: {
        //             backgroundColor: '#FF0000'
        //         }
        //     }
        // },
        events: {
            // datapointEnter: ({ datapoint, seriesIndex }) => {
            //     console.log('enter event', { datapoint, seriesIndex});
            // },
            // datapointLeave: ({ datapoint, seriesIndex }) => {
            //     console.log('leave event', { datapoint, seriesIndex});
            // },
            datapointClick: ({ datapoint, seriesIndex }) => {
                console.log('click event', { datapoint, seriesIndex});
            },
        },
        theme: currentTheme.value,
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                xAxis: {
                    ...c.style.chart.xAxis,
                    labels: {
                        ...c.style.chart.xAxis.labels,
                        values: monthValues.value,
                        // values: new Array(12).fill(0).map((el,i) => {
                        //     return `Some long label\n with index ${i}`
                        // }),
                        datetimeFormatter: {
                            enable: true,
                            locale: 'zh-CN',
                            useUTC: false,
                            januaryAsYear: true,
                            options: { 
                                year: 'yyyy',
                                month: `MMMM`,
                                day: 'dd MMM',
                                hour: 'HH:mm',
                                minute: 'HH:mm:ss',
                                second: 'HH:mm:ss'
                            }
                        }
                    }
                }
            }
        }
    }
});

const local = ref(null)
// onMounted(async () => {
//     if (local.value) {
//         const img = await local.value.getImage();
//         console.log(img)
//         setTimeout(() => {
//             local.value.hideSeries('Average Monthly Temperature (°C)')
//         }, 4000)
//     }
// })

</script>

<template>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <Box comp="VueUiRidgeline" :dataset="dataset" :config="config">
        <template #title>VueUiRidgeline</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiRidgeLine
                    :dataset="dataset"
                    :config="{
                        ...config,
                        responsive: true
                    }"
                />
            </div>
        </template>

        <template #theme>
            <LocalVueUiRidgeLine :dataset="dataset" :config="configTheme"/>
        </template>

        <template #local>
            <LocalVueUiRidgeLine :dataset="dataset" :config="config" ref="local">
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

        <template #build-treesh>
            <VueUiRidgelineTreeshaken :dataset="dataset" :config="config"/>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiRidgeline" :dataset="dataset" :config="config"/>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>