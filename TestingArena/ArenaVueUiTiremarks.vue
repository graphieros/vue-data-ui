<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiTiremarks from '../src/components/vue-ui-tiremarks.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { VueUiTiremarks } from "vue-data-ui";
import { VueUiTiremarks as VueUiTiremarksTreeshaken } from "vue-data-ui/vue-ui-tiremarks";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { vue_ui_tiremarks: DEFAULT_CONFIG } = useConfig();

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
        dataset.value = { percentage : 90 }
    }, 2000)
})

const isPropsToggled = ref(false);
function toggleProps() {
    isPropsToggled.value = !isPropsToggled.value;
}

const alternateDataset = ref({ percentage: 50 });

const alternateConfig = ref({
    style: {
        chart: {
            backgroundColor: '#FF0000',
            title: {
                text: 'Alternate'
            }
        }
    }
})

function alterDataset() {
    dataset.value.percentage = Math.round(Math.random() * 100);
}

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),

    CHECKBOX("userOptions.show", { def: true }),
    CHECKBOX("userOptions.buttons.pdf", { def: true }),
    CHECKBOX("userOptions.buttons.img", { def: true }),
    CHECKBOX("userOptions.buttons.fullscreen", { def: true }),
    SELECT("userOptions.position", ["left", "right"], { def: "right" }),
    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),

    TEXT("style.fontFamily", { def: "inherit" }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF20" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),

    CHECKBOX("style.chart.animation.use", { def: true }),
    NUMBER("style.chart.animation.speed", { def: 0.5, min: 0, max: 2, step: 0.01 }),
    NUMBER("style.chart.animation.acceleration", { def: 1, min: 0, max: 10, step: 0.1 }),

    SELECT("style.chart.layout.display", ["horizontal", "vertical"], { def: "horizontal" }),
    CHECKBOX("style.chart.layout.crescendo", { def: false }),
    CHECKBOX("style.chart.layout.curved", { def: false }),
    NUMBER("style.chart.layout.curveAngleX", { def: 10, min: -360, max: 360 }),
    NUMBER("style.chart.layout.curveAngleY", { def: 10, min: -360, max: 360 }),
    COLOR("style.chart.layout.activeColor", { def: "#5f8bee" }),
    COLOR("style.chart.layout.inactiveColor", { def: "#e1e5e8" }),

    CHECKBOX("style.chart.layout.ticks.gradient.show", { def: true }),
    RANGE("style.chart.layout.ticks.gradient.shiftHueIntensity", { def: 100, min: 0, max: 100 }),

    CHECKBOX("style.chart.percentage.show", { def: true }),
    RANGE("style.chart.percentage.fontSize", { def: 16, min: 8, max: 100 }),
    RANGE("style.chart.percentage.rounding", { def: 1, min: 0, max: 12 }),
    CHECKBOX("style.chart.percentage.bold", { def: true }),
    CHECKBOX("style.chart.percentage.useGradientColor", { def: true }),
    COLOR("style.chart.percentage.color", { def: "#1A1A1A" }),
    SELECT("style.chart.percentage.verticalPosition", ["top", "bottom"], { def: "bottom" }),
    SELECT("style.chart.percentage.horizontalPosition", ["left", "right", "top"], { def: "left" }),

    TEXT("style.chart.title.text", { def: "Lorem ipsum dolor sic amet" }),
    TEXT("style.chart.title.text", { def: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.bold", { def: true }),

    TEXT("style.chart.title.subtitle.text", { def: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis" }),
    COLOR("style.chart.title.subtitle.color", { def: "#CCCCCC" }),
    RANGE("style.chart.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" })
]);


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
    return {
        ...c,
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                percentage: {
                    ...c.style.chart.percentage,
                    // formatter: ({value}) => {
                    //     return `f - ${value}`
                    // }
                }
            }
        },
        theme: currentTheme.value
    }
});

const step = ref(0)

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

    <Box comp="VueUiTiremarks" :dataset="dataset" :config="config">
        <template #title>VueUiTiremarks</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiTiremarks :dataset="dataset" :config="{
                    ...config,
                    responsive: true
                }"/>
            </div>
        </template>

        <template #theme>
            <LocalVueUiTiremarks :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiTiremarks :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" ref="local">
                <!-- <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template> -->

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
            </LocalVueUiTiremarks>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiTiremarks" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : {
                ...config,
                style: {
                    ...config.style,
                    chart: {
                        ...config.style.chart,
                        layout: {
                            ...config.style.chart.layout,
                            display: 'horizontal'
                        }
                    }
                }
            }" :key="`VDUI-lodal_${step}`">
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiTiremarks :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`">
            </VueUiTiremarks>
        </template>

        <template #build-treesh>
            <VueUiTiremarksTreeshaken :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`">
            </VueUiTiremarksTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiTiremarks" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`">
            </VueDataUi>
        </template>
        
        <template #knobs>
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>
    </Box>
</template>