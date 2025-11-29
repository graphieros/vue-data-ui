<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiWheel from '../src/components/vue-ui-wheel.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { VueUiWheel } from "vue-data-ui";
import { VueUiWheel as VueUiWheelTreeshaken } from "vue-data-ui/vue-ui-wheel";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { vue_ui_wheel: DEFAULT_CONFIG } = useConfig();

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
        dataset.value = { percentage: 12 };
    }, 2000)
})


// onMounted(() => {
//     setTimeout(() => {
//         dataset.value.percentage = 10
//     }, 3000)
// })


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
    SELECT("layout", ["3d", "classic"], { def: "3d" }),
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    CHECKBOX("responsive", { def: false }),

    CHECKBOX("userOptions.show", { def: true }),
    CHECKBOX("userOptions.buttons.pdf", { def: true }),
    CHECKBOX("userOptions.buttons.img", { def: true }),
    CHECKBOX("userOptions.buttons.fullscreen", { def: true }),
    SELECT("userOptions.position", ["left", "right"], { def: "left" }),
    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),

    TEXT("style.fontFamily", { def: "inherit" }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.animation.use", { def: true }),
    NUMBER("style.chart.animation.speed", { def: 0.5, min: 0, max: 2, step: 0.01 }),
    NUMBER("style.chart.animation.acceleration", { def: 1, min: 0, max: 10, step: 0.1 }),

    NUMBER("style.chart.layout.wheel.radiusRatio", { def: 0.9, min: 0.1, max: 1, step: 0.01 }),
    RANGE("style.chart.layout.wheel.tiltAngle3d", { def: 50, min: 10, max: 80 }),

    CHECKBOX("style.chart.layout.wheel.ticks.rounded", { def: true }),
    COLOR("style.chart.layout.wheel.ticks.inactiveColor", { def: "#e1e5e8" }),
    COLOR("style.chart.layout.wheel.ticks.activeColor", { def: "#5f8bee" }),
    RANGE("style.chart.layout.wheel.ticks.sizeRatio", { def: 0.85, min: 0, max: 1, step: 0.01 }),
    CHECKBOX("style.chart.layout.wheel.ticks.gradient.show", { def: false }),
    RANGE("style.chart.layout.wheel.ticks.gradient.shiftHueIntensity", { def: 12, min: 0, max: 100 }),
    RANGE("style.chart.layout.wheel.ticks.quantity", { def: 100, min: 1, max: 1000 }),
    RANGE("style.chart.layout.wheel.ticks.strokeWidth", { def: 0, min: 0.1, max: 12, step: 0.1 }),
    COLOR("style.chart.layout.wheel.ticks.stroke", { def: "#FFFFFF" }),
    SELECT("style.chart.layout.wheel.ticks.type", ["classic", "arc"], { def: "arc" }),
    NUMBER("style.chart.layout.wheel.ticks.spacingRatio3d", { def: 0.8, min: 0.1, max: 1, step: 0.1 }),
    NUMBER("style.chart.layout.wheel.ticks.shadeColorRatio3d", { def: 0.15, min: 0.1, max: 1, step: 0.1 }),
    RANGE("style.chart.layout.wheel.ticks.depth3d", { def: 100, min: 0, max: 20 }),

    CHECKBOX("style.chart.layout.innerCircle.show", { def: true }),
    COLOR("style.chart.layout.innerCircle.stroke", { def: "#e1e5e8" }),
    RANGE("style.chart.layout.innerCircle.strokeWidth", { def: 1, min: 0, max: 48 }),
    NUMBER("style.chart.layout.innerCircle.radiusRatio", { def: 0.9, min: 0, max: 2, step: 0.1 }),

    CHECKBOX("style.chart.layout.percentage.show", { def: true }),
    RANGE("style.chart.layout.percentage.fontSize", { def: 80, min: 8, max: 100 }),
    RANGE("style.chart.layout.percentage.rounding", { def: 1, min: 0, max: 12 }),
    CHECKBOX("style.chart.layout.percentage.bold", { def: true }),
    NUMBER("style.chart.layout.percentage.offsetX", { def: 12, min: -100, max: 100 }),
    NUMBER("style.chart.layout.percentage.offsetY", { def: -16, min: -100, max: 100 }),
    COLOR("style.chart.layout.percentage.stroke", { def: "#FFFFFF" }),
    NUMBER("style.chart.layout.percentage.strokeWidth", { def: 6, min: 0, max: 12 }),

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
                layout: {
                    ...c.style.chart.layout,
                    percentage: {
                        ...c.style.chart.layout.percentage,
                        // formatter: ({value}) => {
                        //     return `f - ${value}`
                        // }
                    }
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

    <Box comp="VueUiWheel" :dataset="isPropsToggled ? alternateDataset : dataset" :config="config">
        <template #title>VueUiWheel</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiWheel :key="`responsive_${step}`" :dataset="isPropsToggled ? alternateDataset : dataset" :config="{
                    ...config,
                    responsive: true
                }">
                    <template #chart-background>
                        <div style="height: 100%; width: 100%; background: radial-gradient(at top left, red, white)"/>
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
                </LocalVueUiWheel>
            </div>
        </template>

        <template #theme>
            <LocalVueUiWheel :dataset="dataset" :config="configTheme" />
        </template>
        
        <template #local>
            <LocalVueUiWheel :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" ref="local">
                <template #optionPdf>
                    PRINT PDF
                </template>
                <!-- <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d39230" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template> -->
                
            </LocalVueUiWheel>
        </template>
        
        <template #VDUI-local>
            <LocalVueDataUi component="VueUiWheel" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`">
                <!-- <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d39230" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template> -->
            </LocalVueDataUi>
        </template>
        
        <template #build>
            <VueUiWheel :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`">
                <!-- <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d39230" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template> -->
            </VueUiWheel>
        </template>
        
        <template #build-treesh>
            <VueUiWheelTreeshaken :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`">
                <!-- <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d39230" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template> -->
            </VueUiWheelTreeshaken>
        </template>
        
        <template #VDUI-build>
            <VueDataUi component="VueUiWheel" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`">
                <!-- <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d39230" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template> -->
            </VueDataUi>
        </template>

        <template #knobs>
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>
    </Box>
</template>