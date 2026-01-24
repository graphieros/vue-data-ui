<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiSparkline from '../src/components/vue-ui-sparkline.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { VueUiSparkline } from "vue-data-ui";
import { VueUiSparkline as VueUiSparklineTreeshaken } from "vue-data-ui/vue-ui-sparkline";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import useThemeOptions from "./useThemeOptions";

const { vue_ui_sparkline: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const dataset = ref([])
onMounted(() => {
    dataset.value = undefined;
    setTimeout(() => {
        dataset.value = [
            { "period": 1735689600000, "value": 0 },
            { "period": 1738368000000, "value": -1 },
            { "period": 1740787200000, "value": 2 },
            { "period": 1743465600000, "value": -3 },
            { "period": 1746057600000, "value": 4 },
            { "period": 1748736000000, "value": -5 },
            { "period": 1751328000000, "value": 6 },
            { "period": 1754006400000, "value": -7 },
            { "period": 1756684800000, "value": 8 },
            { "period": 1759276800000, "value": -9 },
            { "period": 1761955200000, "value": 10 },
            { "period": 1764547200000, "value": -11 },
            { "period": 1767225600000, "value": 12 },
            { "period": 1769904000000, "value": -13 },
            { "period": 1772323200000, "value": 14 },
            { "period": 1775001600000, "value": -15 },
            { "period": 1777593600000, "value": 1 }
        ]
    }, 2000)
})


// const dataset = computed(() => {
//     const arr = [];

//     for (let i = 0; i < 10000; i += 1) {
//         arr.push({
//             period: `Period ${i}`,
//             value: Math.random() * 100
//         })
//     }
//     return arr
// })

const alternateDataset = ref([
    {
        period: "period 13",
        value: 12
    },
    {
        period: "period 14",
        value: -13
    },
    {
        period: "period 15",
        value: 14
    },
    {
        period: "period 16",
        value: -15
    },
    {
        period: "period 17",
        value: 16
    },
])

const alternateConfig = ref({
    style: {
        backgroundColor: '#CCCCCC',
        title: {
            text: 'Alternate'
        }
    }
})

const isPropsToggled = ref(false);
function toggleProps() {
    isPropsToggled.value = !isPropsToggled.value;
}

function alterDataset() {
    dataset.value.push({
        period: 'Added',
        value: Math.round(Math.random() * 20)
    })
}

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    CHECKBOX("responsive", { def: false }),
    SELECT("type", ["line", "bar"], { def: "line" }),
    NUMBER("style.scaleMin", { def: null, min: -1000, max: 1000 }),
    NUMBER("style.scaleMax", { def: null, min: -1000, max: 1000 }),

    CHECKBOX('style.line.pulse.show', { def: true }),
    COLOR('style.line.pulse.color', { def: '#FF0000'}),
    NUMBER('style.line.pulse.trail.length', { def: 12 }),
    NUMBER('style.line.pulse.durationMs', { def: 10000 }),
    CHECKBOX('style.line.pulse.loop', { def: false }),

    NUMBER("style.padding.top", { def: 12, min: 0, max: 100 }),
    NUMBER("style.padding.right", { def: 12, min: 0, max: 100 }),
    NUMBER("style.padding.bottom", { def: 3, min: 0, max: 100 }),
    NUMBER("style.padding.left", { def: 0, min: 0, max: 100 }),

    NUMBER("style.chartWidth", { def: 400, min: 100, max: 500 }),
    CHECKBOX("style.animation.show", { def: true }),
    NUMBER("style.animation.animationFrames", { def: 360, min: 0, max: 1000 }),
    COLOR("style.backgroundColor", { def: "#FFFFFF" }),
    TEXT("style.fontFamily", { def: "inherit" }),

    COLOR("style.line.color", { def: "#3366CC" }),
    NUMBER("style.line.strokeWidth", { def: 3, min: 0, max: 20 }),
    CHECKBOX("style.line.smooth", { def: true }),

    NUMBER("style.bar.borderRadius", { def: 3, min: 0, max: 12 }),
    COLOR("style.bar.color", { def: "#3366CC" }),

    COLOR("style.zeroLine.color", { def: "#1A1A1A" }),
    NUMBER("style.zeroLine.strokeWidth", { def: 1, min: 0, max: 12 }),

    CHECKBOX("style.plot.show", { def: true }),
    NUMBER("style.plot.radius", { def: 4, min: 0, max: 12 }),
    COLOR("style.plot.stroke", { def: "#FFFFFF" }),
    NUMBER("style.plot.strokeWidth", { def: 1, min: 0, max: 6 }),

    CHECKBOX("style.verticalIndicator.show", { def: true }),
    NUMBER("style.verticalIndicator.strokeWidth", { def: 1.5, min: 0, max: 6, step: 0.5 }),
    COLOR("style.verticalIndicator.color", { def: "#3366CC" }),
    NUMBER("style.verticalIndicator.strokeDasharray", { def: 3, min: 0, max: 48 }),

    CHECKBOX("style.dataLabel.show", { def: false }),
    SELECT("style.dataLabel.position", ["left", "right"], { def: "left" }),
    NUMBER("style.dataLabel.offsetX", { def: 0, min: -100, max: 100 }),
    NUMBER("style.dataLabel.offsetY", { def: 0, min: -100, max: 100 }),
    NUMBER("style.dataLabel.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.dataLabel.bold", { def: true }),
    COLOR("style.dataLabel.color", { def: "#1A1A1A" }),
    NUMBER("style.dataLabel.roundingValue", { def: 2, min: 0, max: 12 }),
    SELECT("style.dataLabel.valueType", ["latest", "sum", "average"], { def: "latest" }),
    TEXT("style.dataLabel.prefix", { def: "P" }),
    TEXT("style.dataLabel.suffix", { def: "S" }),

    CHECKBOX("style.title.show", { def: false }),
    SELECT("style.title.textAlign", ["left", "center", "right"], { def: "left" }),
    COLOR("style.title.color", { def: "#1A1A1A" }),
    NUMBER("style.title.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.title.bold", { def: true }),
    TEXT("style.title.text", { def: "Lorem ipsum dolor sic amet" }),

    CHECKBOX("style.area.show", { def: true }),
    CHECKBOX("style.area.useGradient", { def: true }),
    RANGE("style.area.opacity", { def: 30, min: 0, max: 100 }),
    COLOR("style.area.color", { def: "#CC7033" }),

    CHECKBOX("style.tooltip.show", { def: true }),
    NUMBER("style.tooltip.fontSize", { def: 12, min: 8, max: 42 }),
    COLOR("style.tooltip.color", { def: "#1A1A1A" }),
    COLOR("style.tooltip.backgroundColor", { def: "#FFFFFF" }),
    NUMBER("style.tooltip.offsetY", { def: 0, min: 0, max: 100 }),
    NUMBER("style.tooltip.borderWidth", { def: 1, min: 0, max: 12 }),
    COLOR("style.tooltip.borderColor", { def: "#FF0000" }),
    NUMBER("style.tooltip.backgroundOpacity", { def: 50, min: 0, max: 100 })
]);

const { themeOptions, currentTheme } = useThemeOptions();

const configTheme = computed(() => ({ theme: currentTheme.value }));

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        events: {
            datapointEnter: ({ datapoint, seriesIndex }) => {
                console.log('enter event', { datapoint, seriesIndex })
            },
            datapointLeave: ({ datapoint, seriesIndex }) => {
                console.log('leave event', { datapoint, seriesIndex })
            },
            datapointClick: ({ datapoint, seriesIndex }) => {
                console.log('click event', { datapoint, seriesIndex })
            },
        },
        style: {
            ...c.style,
            dataLabel: {
                ...c.style.dataLabel,
                formatter: ({value, config}) => {
                    // console.log(config)
                    return `f - ${value}`
                },
                datetimeFormatter: {
                    enable: true,
                    locale: 'en',
                    useUTC: false,
                    januaryAsYear: true,
                    options: { 
                        year: 'yyyy',
                        month: `MMM`,
                        day: 'dd MMM',
                        hour: 'HH:mm',
                        minute: 'HH:mm:ss',
                        second: 'HH:mm:ss'
                    }
                }
            }
        },
        theme: currentTheme.value
    }
})

const step = ref(0)

</script>

<template>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <button @click="toggleProps">TOGGLE PROPS: {{ isPropsToggled }}</button>
    <button @click="alterDataset">ALTER DATASET</button>

    <Box comp="VueUiSparkline" :dataset="dataset" :config="config">
        <template #title>VueUiSparkline</template>

        <template #responsive>
            <div style="width: 600px; height: 400px; resize: both; overflow: auto; background: white">
                <LocalVueUiSparkline :key="`responsive_${step}`" :dataset="dataset" :config="{
                    ...config,
                    responsive: true
                }">
                    <!-- <template #chart-background>
                        <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                    </template> -->

                    <template #source>
                        <div style="width:100%;font-size:10px;text-align:left">
                            SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                        </div>
                    </template> 
                </LocalVueUiSparkline>
            </div>
        </template>

        <template #theme>
            <LocalVueUiSparkline :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiSparkline :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`">

                <template #tooltip="{ absoluteValue }">
                    {{ absoluteValue }}
                </template>

                <!-- <template #before="{ selected, latest, sum, average, median, trend }">
                    <div style="color: white;height: 180px;font-size:11px">
                        #BEFORE
                        <ul>
                            <li>Latest: {{ latest }}</li>
                            <li>Sum: {{ sum }}</li>
                            <li>Average: {{ average }}</li>
                            <li>Median: {{ median }}</li>
                            <li>Trend: {{ trend }}</li>
                            <li>Selected: {{ selected }}</li>
                        </ul>
                    </div>
                </template> -->
            </LocalVueUiSparkline>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiSparkline" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`">
                <template #before="{ selected, latest, sum, average, median, trend }">
                    <div style="color: white;height: 180px;font-size:11px">
                        #BEFORE
                        <ul>
                            <li>Latest: {{ latest }}</li>
                            <li>Sum: {{ sum }}</li>
                            <li>Average: {{ average }}</li>
                            <li>Median: {{ median }}</li>
                            <li>Trend: {{ trend }}</li>
                            <li>Selected: {{ selected }}</li>
                        </ul>
                    </div>
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiSparkline :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`">
                <template #before="{ selected, latest, sum, average, median, trend }">
                    <div style="color: white;height: 180px;font-size:11px">
                        #BEFORE
                        <ul>
                            <li>Latest: {{ latest }}</li>
                            <li>Sum: {{ sum }}</li>
                            <li>Average: {{ average }}</li>
                            <li>Median: {{ median }}</li>
                            <li>Trend: {{ trend }}</li>
                            <li>Selected: {{ selected }}</li>
                        </ul>
                    </div>
                </template>
            </VueUiSparkline>
        </template>

        <template #build-treesh>
            <VueUiSparklineTreeshaken :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`">
                <template #before="{ selected, latest, sum, average, median, trend }">
                    <div style="color: white;height: 180px;font-size:11px">
                        #BEFORE
                        <ul>
                            <li>Latest: {{ latest }}</li>
                            <li>Sum: {{ sum }}</li>
                            <li>Average: {{ average }}</li>
                            <li>Median: {{ median }}</li>
                            <li>Trend: {{ trend }}</li>
                            <li>Selected: {{ selected }}</li>
                        </ul>
                    </div>
                </template>
            </VueUiSparklineTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiSparkline" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`">
                <template #before="{ selected, latest, sum, average, median, trend }">
                    <div style="color: white;height: 180px;font-size:11px">
                        #BEFORE
                        <ul>
                            <li>Latest: {{ latest }}</li>
                            <li>Sum: {{ sum }}</li>
                            <li>Average: {{ average }}</li>
                            <li>Median: {{ median }}</li>
                            <li>Trend: {{ trend }}</li>
                            <li>Selected: {{ selected }}</li>
                        </ul>
                    </div>
                </template>
            </VueDataUi>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>