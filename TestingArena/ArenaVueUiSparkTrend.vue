<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiSparkTrend from '../src/components/vue-ui-spark-trend.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { VueUiSparkTrend } from "vue-data-ui"; 
import { VueUiSparkTrend as VueUiSparkTrendTreeshaken } from "vue-data-ui/vue-ui-spark-trend"; 
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import useThemeOptions from "./useThemeOptions";

const { vue_ui_spark_trend: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

function makeDs(n,m) {
    const arr = [];
    for(let i = 0; i < n; i += 1) {
        arr.push(Math.random()*m)
    }
    return arr
}


const datasets = ref({
    positive: undefined,
    neutral: undefined,
    negative: undefined,
})

onMounted(() => {
    setTimeout(() => {
        datasets.value.positive = [1, 2, 3, 5, 8]
        datasets.value.neutral = [1, 1, 1, 1, 1, 1]
        datasets.value.negative = [8, 5, 3, 2, 1]
    }, 2000)
})

const alternateDataset = ref({
    neutral: [1, 0, 1, 0, 1, 0],
    positive: [0, 1, 0, 1, 0, 1],
    negative: [1, 0, 1, 0, 1, 0],
})

const alternateConfig = ref({
    style: {
        backgroundColor: '#CCCCCC',
    }
})

const isPropsToggled = ref(false);
function toggleProps() {
    isPropsToggled.value = !isPropsToggled.value;
}

function alterDataset() {
    datasets.value.neutral.push(Math.random() * 10)
}

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    COLOR("style.backgroundColor", { def: "#FFFFFF" }),
    TEXT("style.fontFamily", { def: "inherit" }),
    CHECKBOX("style.animation.show", { def: true }),
    NUMBER("style.animation.animationFrames", { def: 20, min: 0, max: 200 }),
    COLOR("style.line.stroke", { def: "#1A1A1A" }),
    NUMBER("style.line.strokeWidth", { def: 2, min: 0, max: 24 }),
    SELECT("style.line.strokeLinecap", ["round", "square", "butt"], { def: "round" }),
    SELECT("style.line.strokeLinejoin", ["round", "bevel", "arcs", "miter", "miter-clip"], { def: "round" }),
    CHECKBOX("style.line.smooth", { def: true }),
    CHECKBOX("style.line.useColorTrend", { def: true }),
    CHECKBOX("style.area.show", { def: true }),
    CHECKBOX("style.area.useGradient", { def: true }),
    RANGE("style.area.opacity", { def: 20, min: 0, max: 100 }),
    CHECKBOX("style.dataLabel.show", { def: true }),
    CHECKBOX("style.dataLabel.useColorTrend", { def: true }),
    COLOR("style.dataLabel.color", { def: "#1A1A1A" }),
    NUMBER("style.dataLabel.fontSize", { def: 14, min: 8, max: 24 }),
    CHECKBOX("style.dataLabel.bold", { def: false }),
    TEXT("style.dataLabel.prefix", { def: "P" }),
    TEXT("style.dataLabel.suffix", { def: "S" }),
    NUMBER("style.dataLabel.rounding", { def: 1, min: 0, max: 12 }),
    SELECT("style.trendLabel.trendType", ["n-1", "global", "lastToFirst"], { def: "global" }),
    CHECKBOX("style.trendLabel.useColorTrend", { def: true }),
    COLOR("style.trendLabel.color", { def: "#1A1A1A" }),
    NUMBER("style.trendLabel.fontSize", { def: 14, min: 8, max: 24 }),
    CHECKBOX("style.trendLabel.bold", { def: true }),
    NUMBER("style.trendLabel.rounding", { def: 1, min: 0, max: 12 }),
    COLOR("style.arrow.colors.positive", { def: "#2CA02C" }),
    COLOR("style.arrow.colors.neutral", { def: "#7F7F7F" }),
    COLOR("style.arrow.colors.negative", { def: "#D62728" }),
    NUMBER("style.padding.top", { def: 12, min: 0, max: 100 }),
    NUMBER("style.padding.left", { def: 82, min: 0, max: 100 }),
    NUMBER("style.padding.right", { def: 12, min: 0, max: 100 }),
    NUMBER("style.padding.bottom", { def: 12, min: 0, max: 100 })
]);

const { themeOptions, currentTheme } = useThemeOptions();

const configTheme = computed(() => ({ theme: currentTheme.value }));

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        style: {
            ...c.style,
            dataLabel: {
                ...c.style.dataLabel,
                formatter: ({value, config}) => {
                    // console.log(config)
                    return `f - ${value}`
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

    <Box comp="VueUiSparkTrend" :dataset="datasets.positive" :config="config">
        <template #title>VueUiSparkTrend</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiSparkTrend :dataset="datasets.positive" :config="{ ...config, responsive: true }"/>
            </div>
        </template>

        <template #theme>
            <LocalVueUiSparkTrend :dataset="datasets.negative" :config="configTheme" />
            <LocalVueUiSparkTrend :dataset="datasets.neutral" :config="configTheme" />
            <LocalVueUiSparkTrend :dataset="datasets.positive" :config="configTheme" />
        </template>

        <template #local>
            <div style="width: 100%">
                <LocalVueUiSparkTrend :dataset="isPropsToggled ? alternateDataset.negative : datasets.negative" :config="isPropsToggled ? alternateConfig : config" :key="`local0_${step}`">
                    <!-- <template #chart-background>
                        <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                    </template> -->
                    
                    <template #source>
                        <div style="width:100%;font-size:10px;text-align:left">
                            SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                        </div>
                    </template>
                </LocalVueUiSparkTrend>
                <LocalVueUiSparkTrend :dataset="isPropsToggled ? alternateDataset.neutral : datasets.neutral" :config="isPropsToggled ? alternateConfig : config" :key="`local1_${step}`"/>
                <LocalVueUiSparkTrend :dataset="isPropsToggled ? alternateDataset.positive : datasets.positive" :config="isPropsToggled ? alternateConfig : config" :key="`local2_${step}`"/>
            </div>
        </template>

        <template #VDUI-local>
            <div style="width: 100%">
                <LocalVueDataUi component="VueUiSparkTrend" :dataset="isPropsToggled ? alternateDataset.negative : datasets.negative" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal0_${step}`"/>
                <LocalVueDataUi component="VueUiSparkTrend" :dataset="isPropsToggled ? alternateDataset.neutral : datasets.neutral" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal1_${step}`"/>
                <LocalVueDataUi component="VueUiSparkTrend" :dataset="isPropsToggled ? alternateDataset.positive : datasets.positive" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal2_${step}`"/>
            </div>
        </template>

        <template #build>
            <div style="width: 100%">
                <VueUiSparkTrend :dataset="isPropsToggled ? alternateDataset.negative : datasets.negative" :config="isPropsToggled ? alternateConfig : config" :key="`build0_${step}`"/>
                <VueUiSparkTrend :dataset="isPropsToggled ? alternateDataset.neutral : datasets.neutral" :config="isPropsToggled ? alternateConfig : config" :key="`build1_${step}`"/>
                <VueUiSparkTrend :dataset="isPropsToggled ? alternateDataset.positive : datasets.positive" :config="isPropsToggled ? alternateConfig : config" :key="`build2_${step}`"/>
            </div>
        </template>

        <template #build-treesh>
            <div style="width: 100%">
                <VueUiSparkTrendTreeshaken :dataset="isPropsToggled ? alternateDataset.negative : datasets.negative" :config="isPropsToggled ? alternateConfig : config" :key="`build0_${step}`"/>
                <VueUiSparkTrendTreeshaken :dataset="isPropsToggled ? alternateDataset.neutral : datasets.neutral" :config="isPropsToggled ? alternateConfig : config" :key="`build1_${step}`"/>
                <VueUiSparkTrendTreeshaken :dataset="isPropsToggled ? alternateDataset.positive : datasets.positive" :config="isPropsToggled ? alternateConfig : config" :key="`build2_${step}`"/>
            </div>
        </template>

        <template #VDUI-build>
            <div style="width: 100%">
                <VueDataUi component="VueUiSparkTrend" :dataset="isPropsToggled ? alternateDataset.negative : datasets.negative" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build0_${step}`"/>
                <VueDataUi component="VueUiSparkTrend" :dataset="isPropsToggled ? alternateDataset.neutral : datasets.neutral" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build1_${step}`"/>
                <VueDataUi component="VueUiSparkTrend" :dataset="isPropsToggled ? alternateDataset.positive : datasets.positive" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build2_${step}`"/>
            </div>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>