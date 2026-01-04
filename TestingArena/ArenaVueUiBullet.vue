<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiBullet from '../src/components/vue-ui-bullet.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

import { VueUiBullet } from "vue-data-ui";
import { VueUiBullet as VueUiBulletTreeshaken } from "vue-data-ui/vue-ui-bullet";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import useThemeOptions from "./useThemeOptions";

const { local, build, vduiLocal, vduiBuild } = useArena();
const { vue_ui_bullet: DEFAULT_CONFIG } = useConfig();

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
            value: -20,
            target: -10,
            segments: [
                {
                    name: 'Low',
                    from: -100,
                    to: -30,
                    // color: '#4A4A4A'
                },
                {
                    name: 'Medium',
                    from: -30,
                    to: 0,
                    // color: '#6A6A6A'
                },
                {
                    name: 'High',
                    from: 0,
                    to: 100,
                    // color: '#8A8A8A'
                }
            ]
        }
    }, 2000)
})

function randomizeData(){
    dataset.value.value = Math.random() * 100
}

const model = createModel([
    CHECKBOX("userOptions.debug", { def: true }),
    CHECKBOX("userOptions.loading", { def: false }),
    CHECKBOX("userOptions.show", { def: true }),

    CHECKBOX("userOptions.buttons.pdf", { def: true }),
    CHECKBOX("userOptions.buttons.img", { def: true }),
    CHECKBOX("userOptions.buttons.fullscreen", { def: true }),

    TEXT("userOptions.buttonTitles.pdf", { def: "PDF" }),
    TEXT("userOptions.buttonTitles.img", { def: "IMG" }),
    TEXT("userOptions.buttonTitles.fullscreen", { def: "FSC" }),

    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" }),

    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),

    RANGE("style.chart.height", { def: 96, min: 64, max: 120 }),
    RANGE("style.chart.width", { def: 600, min: 400, max: 1000 }),

    NUMBER("style.chart.padding.top", { def: 24, min: 0, max: 64 }),
    NUMBER("style.chart.padding.right", { def: 24, min: 0, max: 64 }),
    NUMBER("style.chart.padding.bottom", { def: 24, min: 0, max: 64 }),
    NUMBER("style.chart.padding.left", { def: 12, min: 0, max: 64 }),

    CHECKBOX("style.chart.animation.show", { def: true }),
    RANGE("style.chart.animation.animationFrames", { def: 60, min: 30, max: 255 }),

    SELECT("style.chart.legend.position", ["top", "bottom"], { def: "bottom" }),

    COLOR("style.chart.segments.baseColor", { def: "#9A9A9A" }),

    CHECKBOX("style.chart.segments.dataLabels.show", { def: true }),
    COLOR("style.chart.segments.dataLabels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.segments.dataLabels.fontSize", { def: 10, min: 8, max: 42 }),
    CHECKBOX("style.chart.segments.dataLabels.bold", { def: false }),
    TEXT("style.chart.segments.dataLabels.prefix", { def: "" }),
    TEXT("style.chart.segments.dataLabels.suffix", { def: "" }),
    NUMBER("style.chart.segments.dataLabels.offsetY", { def: 0, min: -50, max: 50 }),

    CHECKBOX("style.chart.segments.ticks.show", { def: true }),
    NUMBER("style.chart.segments.ticks.divisions", { def: 10, min: 2, max: 20 }),
    COLOR("style.chart.segments.ticks.stroke", { def: "#8A8A8A" }),

    CHECKBOX("style.chart.target.onTop", { def: true }),
    COLOR("style.chart.target.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.target.rounded", { def: true }),
    RANGE("style.chart.target.heightRatio", { def: 0.8, min: 0.2, max: 1, step: 0.01 }),
    COLOR("style.chart.target.stroke", { def: "#FFFFFF" }),
    NUMBER("style.chart.target.strokeWidth", { def: 1, min: 0, max: 6 }),
    NUMBER("style.chart.target.width", { def: 6, min: 1, max: 12 }),

    COLOR("style.chart.valueBar.color", { def: "#3A3A3A" }),
    RANGE("style.chart.valueBar.heightRatio", { def: 0.33, min: 0.2, max: 1, step: 0.01 }),
    COLOR("style.chart.valueBar.stroke", { def: "#FFFFFF" }),
    NUMBER("style.chart.valueBar.strokeWidth", { def: 1, min: 0, max: 12 }),

    CHECKBOX("style.chart.valueBar.label.show", { def: true }),
    COLOR("style.chart.valueBar.label.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.valueBar.label.fontSize", { def: 14, min: 8, max: 42 }),
    CHECKBOX("style.chart.valueBar.label.bold", { def: true }),
    NUMBER("style.chart.valueBar.label.offsetY", { def: 0, min: -50, max: 50 }),

    TEXT("style.chart.title.text", { def: "This is a title" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.title.fontSize", { def: 20, min: 8, max: 42 }),
    CHECKBOX("style.chart.title.bold", { def: true }),

    TEXT("style.chart.title.subtitle.text", { def: "This is a subtitle" }),
    COLOR("style.chart.title.subtitle.color", { def: "#8A8A8A" }),
    NUMBER("style.chart.title.subtitle.fontSize", { def: 14, min: 8, max: 42 }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false })
]);

const { themeOptions, currentTheme } = useThemeOptions();

const configTheme = computed(() => ({ theme: currentTheme.value }));

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        theme: currentTheme.value,
    }
})

onMounted(async () => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img)
    }
})

</script>

<template>
    <button @click="randomizeData">RANDOM DATA</button>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <Box comp="VueUiBullet" :config="config" :dataset="dataset">
        <template #title>VueUiBullet</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiBullet :dataset="dataset" :config="{
                    ...config,
                    responsive: true
                }"/>
            </div>
        </template>

        <template #theme>
            <LocalVueUiBullet :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiBullet :dataset="dataset" :config="config" ref="local">
                <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template>
                <template #source>
                    <div style="width:100%;font-size:10px;text-align:left">
                        SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                    </div>
                </template>
            </LocalVueUiBullet>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiBullet" :dataset="dataset" :config="config" ref="localVdui"/>
        </template>

        <template #build>
            <VueUiBullet :dataset="dataset" :config="config" ref="build"/>
        </template>

        <template #build-treesh>
            <VueUiBulletTreeshaken :dataset="dataset" :config="config" ref="build"/>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiBullet" :dataset="dataset" :config="config" ref="buildVdui"/>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>