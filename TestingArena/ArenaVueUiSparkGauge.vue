<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiSparkgauge from '../src/components/vue-ui-sparkgauge.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { VueUiSparkgauge } from "vue-data-ui";
import { VueUiSparkgauge as VueUiSparkgaugeTreeshaken } from "vue-data-ui/vue-ui-sparkgauge";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import useThemeOptions from "./useThemeOptions";

const { vue_ui_sparkgauge: DEFAULT_CONFIG } = useConfig();

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
        dataset.value = {
            value: 8,
            min: -10,
            max: 10,
            title: 'KPI 1'
        }
    }, 2000)

    setTimeout(() => {
        dataset.value.value = 3
    }, 4000)
})

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    TEXT("style.fontFamily", { def: "inherit" }),
    COLOR("style.background", { def: "#FFFFFF" }),
    NUMBER("style.height", { def: 100, min: 10, max: 200 }),
    NUMBER("style.basePosition", { def: 72, min: 0, max: 100 }),
    CHECKBOX("style.animation.show", { def: true }),
    NUMBER("style.animation.speedMs", { def: 150, min: 0, max: 1000 }),
    CHECKBOX("style.title.show", { def: true }),
    NUMBER("style.title.fontSize", { def: 12, min: 8, max: 24 }),
    SELECT("style.title.position", ["top", "bottom"] , { def: "top"}),
    SELECT("style.title.textAlign", ["left", "center", "right"], { def: "center" }),
    CHECKBOX("style.title.bold", { def: false }),
    COLOR("style.title.color", { def: "#1A1A1A" }),
    NUMBER("style.dataLabel.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.dataLabel.autoColor", { def: true }),
    COLOR("style.dataLabel.color", { def: "#1A1A1A" }),
    NUMBER("style.dataLabel.offsetY", { def: 0, min: -100, max: 100 }),
    CHECKBOX("style.dataLabel.bold", { def: true }),
    NUMBER("style.dataLabel.rounding", { def: 2, min: 0, max: 12 }),
    TEXT("style.dataLabel.prefix", { def: "P" }),
    TEXT("style.dataLabel.suffix", { def: "S" }),
    COLOR("style.colors.min", { def: "#DD6633" }),
    COLOR("style.colors.max", { def: "#33DD66" }),
    CHECKBOX("style.colors.showGradient", { def: true }),
    CHECKBOX("style.track.autoColor", { def: true }),
    COLOR("style.track.color", { def: "#5f8bee" }),
    SELECT("style.track.strokeLinecap", ["round", "butt"], { def: "round" }),
    COLOR("style.gutter.color", { def: "#e1e5e8" }),
    SELECT("style.gutter.strokeLinecap", ["round", "butt"], { def: "round" })
]);

const { themeOptions, currentTheme } = useThemeOptions();

const configTheme = computed(() => ({ theme: currentTheme.value }));

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        skeletonConfig: {
            style: {
                background: '#FF0000'
            }
        },
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
});

const step = ref(0);

</script>

<template>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>
    <Box comp="VueUiSparkgauge" :dataset="dataset" :config="config">
        <template #title>VueUiSparkgauge</template>

        <template #theme>
            <LocalVueUiSparkgauge :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiSparkgauge :dataset="dataset" :config="config" :key="`local_${step}`">
                <!-- <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template> -->
                
                <template #source>
                    <div style="width:100%;font-size:10px;text-align:left">
                        SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                    </div>
                </template>
            </LocalVueUiSparkgauge>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiSparkgauge" :dataset="dataset" :config="config" :key="`VDUI-lodal_${step}`">
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiSparkgauge :dataset="dataset" :config="config" :key="`build_${step}`">
            </VueUiSparkgauge>
        </template>

        <template #build-treesh>
            <VueUiSparkgaugeTreeshaken :dataset="dataset" :config="config" :key="`build_${step}`">
            </VueUiSparkgaugeTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiSparkgauge" :dataset="dataset" :config="config" :key="`VDUI-build_${step}`">
            </VueDataUi>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>