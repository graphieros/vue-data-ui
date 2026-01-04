<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiThermometer from '../src/components/vue-ui-thermometer.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { VueUiThermometer } from "vue-data-ui"; 
import { VueUiThermometer as VueUiThermometerTreeshaken } from "vue-data-ui/vue-ui-thermometer"; 
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import useThemeOptions from "./useThemeOptions";

const { vue_ui_thermometer: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const dataset = ref(undefined)

onMounted(() => {
    setTimeout(() => {
        dataset.value = {
            value: 0,
            from: -100,
            to: 100,
            steps: 20,
        }
    }, 2000)
})

const alternateDataset = ref({
    value: 1,
    from: -10,
    to: 10,
    steps: 10,
})

const alternateConfig = ref({
    style: {
        chart: {
            backgroundColor: '#CCCCCC',
            title: {
                text: 'Alternate'
            }
        }
    }
})

const isPropsToggled = ref(false);
function toggleProps() {
    isPropsToggled.value = !isPropsToggled.value;
}

function alterDataset() {
    dataset.value.value = Math.random() * 100
}

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    CHECKBOX("responsive", { def: false }),

    CHECKBOX("userOptions.show", { def: true }),
    CHECKBOX("userOptions.buttons.pdf", { def: true }),
    CHECKBOX("userOptions.buttons.img", { def: true }),
    CHECKBOX("userOptions.buttons.fullscreen", { def: true }),
    SELECT("userOptions.position", ["left", "right"], { def: "right" }),
    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    
    TEXT("style.fontFamily", { def: "inherit" }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.height", { def: 360, min: 100, max: 1000 }),
    NUMBER("style.chart.thermometer.width", { def: 48, min: 12, max: 64 }),
    NUMBER("style.chart.padding.top", { def: 12, min: 0, max: 100 }),
    NUMBER("style.chart.padding.bottom", { def: 12, min: 0, max: 100 }),

    CHECKBOX("style.chart.graduations.show", { def: true }),
    SELECT("style.chart.graduations.sides", ["both", "left", "right"], { def: "both" }),
    NUMBER("style.chart.graduations.height", { def: 2, min: 0, max: 12 }),
    COLOR("style.chart.graduations.stroke", { def: "#e1e5e8" }),
    NUMBER("style.chart.graduations.strokeWidth", { def: 1, min: 0, max: 12 }),
    CHECKBOX("style.chart.graduations.showIntermediate", { def: true }),

    CHECKBOX("style.chart.graduations.gradient.show", { def: true }),
    RANGE("style.chart.graduations.gradient.intensity", { def: 20, min: 0, max: 100 }),

    CHECKBOX("style.chart.animation.use", { def: true }),
    NUMBER("style.chart.animation.speedMs", { def: 1000, min: 100, max: 2000 }),

    NUMBER("style.chart.label.fontSize", { def: 20, min: 8, max: 48 }),
    NUMBER("style.chart.label.rounding", { def: 1, min: 0, max: 12 }),
    CHECKBOX("style.chart.label.bold", { def: true }),
    COLOR("style.chart.label.color", { def: "#1A1A1A" }),
    TEXT("style.chart.label.prefix", { def: "P" }),
    TEXT("style.chart.label.suffix", { def: "S" }),

    TEXT("style.title.text", { def: "Lorem ipsum dolor sit amet" }),
    COLOR("style.title.color", { def: "#1A1A1A" }),
    NUMBER("style.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.title.bold", { def: true }),
    COLOR("style.title.subtitle.color", { def: "#CCCCCC" }),
    TEXT("style.title.subtitle.text", { def: "Lorem ipsum dolor sit amet" }),
    NUMBER("style.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.title.subtitle.bold", { def: false })
]);

const { themeOptions, currentTheme } = useThemeOptions();

const configTheme = computed(() => ({ theme: currentTheme.value }));

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        theme: currentTheme.value,
        ...c,
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                label: {
                    ...c.style.chart.label,
                    formatter: ({value, config}) => {
                        console.log(config)
                        return `f | ${value}`
                    }
                }
            }
        },
        customPalette: ["#DD3322", "#66DDAA"],
    }
})

const step = ref(0);

const local = ref(null)

onMounted(async () => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img)
    }
})

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

    <Box comp="VueUiThermometer" :dataset="dataset" :config="config">
        <template #title>VueUiThermometer</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiThermometer :dataset="dataset" :config="{...config, responsive: true }"/>
            </div>
        </template>

        <template #theme>
            <LocalVueUiThermometer :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiThermometer :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" ref="local">
                <!-- <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template> -->
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
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
            </LocalVueUiThermometer>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiThermometer" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`vdui_local_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiThermometer :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
            </VueUiThermometer>
        </template>

        <template #build-treesh>
            <VueUiThermometerTreeshaken :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
            </VueUiThermometerTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiThermometer" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`vdui_build_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
            </VueDataUi>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>