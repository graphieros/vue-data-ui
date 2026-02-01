<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiSparkStackbar from '../src/components/vue-ui-sparkstackbar.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { VueUiSparkStackbar } from "vue-data-ui";
import { VueUiSparkStackbar as VueUiSparkStackbarTreeshaken } from "vue-data-ui/vue-ui-sparkstackbar";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import useThemeOptions from "./useThemeOptions";

const { vue_ui_sparkstackbar: DEFAULT_CONFIG } = useConfig();

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
                name: "Vue",
                value: 258,
            },
            {
                name: "Javascript",
                value: 36,
            },
            {
                name: "Other",
                value: 16,
            },
        ]
    }, 2000)
})

const alternateDataset = ref([
        {
            name: "ALT 1",
            value: 50,
        },
        {
            name: "ALT 2",
            value: 50,
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
        name: 'Added',
        value: Math.round(Math.random() * 30)
    })
}

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    COLOR("style.backgroundColor", { def: "#FFFFFF" }),
    TEXT("style.fontFamily", { def: "inherit" }),
    CHECKBOX("style.animation.show", { def: true }),
    NUMBER("style.animation.animationFrames", { def: 60, min: 0, max: 300 }),
    CHECKBOX("style.bar.gradient.show", { def: true }),
    RANGE("style.bar.gradient.intensity", { def: 40, min: 0, max: 100 }),
    COLOR("style.bar.gradient.underlayerColor", { def: "#FFFFFF" }),
    SELECT("style.legend.textAlign", ["left", "center", "right"], { def: "left" }),
    CHECKBOX("style.legend.show", { def: true }),
    NUMBER("style.legend.fontSize", { def: 12, min: 8, max: 48 }),
    TEXT("style.legend.margin", { def: "0 0 6px 0" }),
    COLOR("style.legend.name.color", { def: "#1A1A1A" }),
    CHECKBOX("style.legend.name.bold", { def: false }),
    CHECKBOX("style.legend.value.show", { def: true }),
    CHECKBOX("style.legend.value.bold", { def: false }),
    COLOR("style.legend.value.color", { def: "#1A1A1A" }),
    TEXT("style.legend.value.prefix", { def: "P" }),
    TEXT("style.legend.value.suffix", { def: "S" }),
    NUMBER("style.legend.value.rounding", { def: 0, min: 0, max: 12 }),
    CHECKBOX("style.legend.percentage.show", { def: true }),
    CHECKBOX("style.legend.percentage.bold", { def: true }),
    COLOR("style.legend.percentage.color", { def: "#1A1A1A" }),
    NUMBER("style.legend.percentage.rounding", { def: 2, min: 0, max: 12 }),
    CHECKBOX('style.legend.selectAllToggle.show', { def: true }),

    SELECT("style.title.textAlign", ["left", "center", "right"], { def: "left" }),
    TEXT("style.title.text", { def: "Lorem ipsum dolor sic amet" }),
    COLOR("style.title.color", { def: "#1A1A1A" }),
    NUMBER("style.title.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.title.bold", { def: true }),
    TEXT("style.title.margin", { def: "0 0 6px 0" }),
    COLOR("style.title.subtitle.color", { def: "#A1A1A1" }),
    TEXT("style.title.subtitle.text", { def: "Lorem ipsum dolor sic amet" }),
    NUMBER("style.title.subtitle.fontSize", { def: 12, min: 8, max: 24 }),
    CHECKBOX("style.title.subtitle.bold", { def: false }),
    CHECKBOX("style.tooltip.show", { def: true }),
    COLOR("style.tooltip.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.tooltip.color", { def: "#1A1A1A" }),
    NUMBER("style.tooltip.fontSize", { def: 14, min: 6, max: 24 }),
    RANGE("style.tooltip.backgroundOpacity", { def: 60, min: 0, max: 100 }),
    SELECT("style.tooltip.position", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.tooltip.offsetY", { def: 24, min: 0, max: 48 })
]);

const { themeOptions, currentTheme } = useThemeOptions();

const configTheme = computed(() => ({ theme: currentTheme.value }));

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        skeletonConfig: {
            style: {
                backgroundColor: '#FF0000'
            }
        },
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
        style: {
            ...c.style,
            legend: {
                ...c.style.legend,
                value: {
                    ...c.style.legend.value,
                    formatter: ({value, config }) => {
                        // console.log(config)
                        return `f - ${value}`
                    }
                }
            },
            tooltip: {
                ...c.style.tooltip,
                // customFormat: ({ datapoint }) => {
                //     return datapoint.name
                // }
            }
        },
        theme: currentTheme.value,
        customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
    }
});

const step = ref(0)

const local = ref(null);

// onMounted(() => {
//     if (local.value) {
//         setTimeout(() => {
//             local.value.hideSeries('Vue')
//         }, 4000)
//         setTimeout(() => {
//             local.value.hideSeries('Javascript')
//             local.value.showSeries('Vue')
//         }, 5000)
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

    <button @click="toggleProps">TOGGLE PROPS: {{ isPropsToggled }}</button>
    <button @click="alterDataset">ALTER DATASET</button>

    <Box comp="VueUiSparkStackbar" :dataset="dataset" :config="config">
        <template #title>VueUiSparkStackbar</template>

        <template #theme>
            <LocalVueUiSparkStackbar :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiSparkStackbar :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" ref="local">
                <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template>

                <template #source>
                    <div style="width:100%;font-size:10px;text-align:left">
                        SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                    </div>
                </template>
            </LocalVueUiSparkStackbar>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiSparkStackbar" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`">
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiSparkStackbar :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`">
            </VueUiSparkStackbar>
        </template>

        <template #build-treesh>
            <VueUiSparkStackbarTreeshaken :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`">
            </VueUiSparkStackbarTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiSparkStackbar" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`">
            </VueDataUi>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>