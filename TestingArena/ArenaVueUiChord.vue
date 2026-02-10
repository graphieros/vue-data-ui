<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiChord from '../src/components/vue-ui-chord.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

import { VueUiChord } from "vue-data-ui";
import { VueUiChord as VueUiChordTreeshaken } from "vue-data-ui/vue-ui-chord"
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import useThemeOptions from "./useThemeOptions";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena();
const { vue_ui_chord: DEFAULT_CONFIG } = useConfig();

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
            matrix: [
                [ 12000, 2000, 9000, 3000],
                [ 1000, 10000, 2000, 6001], 
                [ 2000, 1600, 8000, 8001], 
                [ 1000, 1000, 1000, 7001]  
            ],
            labels: ['Group A', 'Group B with a long name', 'Group C', 'Group D'],
            colors: []
        }
    }, 0)

    // Test dataset reactivity and skeleton loader behavior
    // setTimeout(() => {
    //     dataset.value = {
    //         matrix: [
    //             [ 12000, 2000, 9000],
    //             [ 1000, 10000, 2000], 
    //             [ 2000, 1600], 
    //         ],
    //         labels: ['Group A', 'Group B with a long name', 'Group C'],
    //         colors: []
    //     }
    // }, 4000)

    // setTimeout(() => {
    //     dataset.value = {
    //         matrix: [
    //             [ 12000, 2000, 9000, 3000],
    //             [ 1000, 10000, 2000, 6001], 
    //             [ 2000, 1600, 8000, 8001], 
    //             [ 1000, 1000, 1000, 7001]  
    //         ],
    //         labels: ['Group A', 'Group B with a long name', 'Group C', 'Group D'],
    //         colors: []
    //     }
    // }, 6000)
});

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    CHECKBOX("responsive", { def: false }),
    CHECKBOX("enableRotation", { def: true }),
    NUMBER("initialRotation", { def: 0, min: 0, max: 360 }),
    CHECKBOX("useCssAnimation", { def: true }),
    CHECKBOX('userOptions.useCursorPointer', { def: false }),

    TEXT("style.chart.title.text", { def: "Title", label: "textContent", category: "title" }),
    COLOR("style.chart.title.color", { def: "#1A1A1A", label: "textColor", category: "title" }),
    NUMBER("style.chart.title.fontSize", { def: 20, min: 6, max: 48, label: "fontSize", category: "title" }),
    CHECKBOX("style.chart.title.bold", { def: true, label: "bold", category: "title" }),
    SELECT("style.chart.title.textAlign", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.chart.title.paddingLeft", { def: 0, min: 0, max: 24 }),
    NUMBER("style.chart.title.paddingRight", { def: 0, min: 0, max: 24 }),
    TEXT("style.chart.title.subtitle.text", { def: "Lorem ipsum dolor sit amet", label: "textContent", category: "subtitle" }),
    COLOR("style.chart.title.subtitle.color", { def: "#A1A1A1", label: "textColor", category: "subtitle" }),
    NUMBER("style.chart.title.subtitle.fontSize", { def: 16, min: 6, max: 42, label: "fontSize", category: "subtitle" }),
    CHECKBOX("style.chart.title.subtitle.bold", { def: false, label: "bold", category: "subtitle" }),
    COLOR("style.chart.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.color", { def: "#1A1A1A" }),
    CHECKBOX("style.chart.legend.show", { def: true }),
    COLOR("style.chart.legend.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.chart.legend.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.legend.fontSize", { def: 14, min: 8, max: 42 }),
    CHECKBOX("style.chart.legend.bold", { def: false }),
    SELECT("style.chart.legend.position", ["top", "bottom"], { def: "bottom" }),
    NUMBER("style.chart.arcs.innerRadiusRatio", { def: 1, min: 0.1, max: 1.5, step: 0.1 }),
    NUMBER("style.chart.arcs.outerRadiusRatio", { def: 1, min: 0.1, max: 1.5, step: 0.1 }),
    NUMBER("style.chart.arcs.padAngle", { def: 5, min: 0, max: 48 }),
    COLOR("style.chart.arcs.stroke", { def: "#FFFFFF" }),
    NUMBER("style.chart.arcs.strokeWidth", { def: 1, min: 1, max: 12 }),
    CHECKBOX("style.chart.arcs.labels.show", { def: true }),
    NUMBER("style.chart.arcs.labels.fontSize", { def: 14, min: 8, max: 42 }),
    CHECKBOX("style.chart.arcs.labels.bold", { def: false }),
    CHECKBOX("style.chart.arcs.labels.curved", { def: false }),
    CHECKBOX("style.chart.arcs.labels.adaptColorToBackground", { def: true }),
    COLOR("style.chart.arcs.labels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.arcs.labels.offset", { def: 0, min: -100, max: 100 }),
    COLOR("style.chart.ribbons.stroke", { def: "#FFFFFF" }),
    NUMBER("style.chart.ribbons.strokeWidth", { def: 1, min: 0, max: 12 }),
    RANGE("style.chart.ribbons.underlayerOpacity", { def: 1, min: 0, max: 1, step: 0.01 }),
    CHECKBOX("style.chart.ribbons.labels.show", { def: true }),
    TEXT("style.chart.ribbons.labels.prefix", { def: "P" }),
    TEXT("style.chart.ribbons.labels.suffix", { def: "S" }),
    NUMBER("style.chart.ribbons.labels.rounding", { def: 0, min: 0, max: 6 }),
    NUMBER("style.chart.ribbons.labels.fontSize", { def: 14, min: 8, max: 42 }),
    CHECKBOX("style.chart.ribbons.labels.bold", { def: false }),
    CHECKBOX("style.chart.ribbons.labels.useSerieColor", { def: false }),
    COLOR("style.chart.ribbons.labels.color", { def: "#1A1A1A" }),
    NUMBER("style.chart.ribbons.labels.offset", { def: 0, min: -100, max: 100 }),
    NUMBER("style.chart.ribbons.labels.minSeparationDeg", { def: 3, min: 0, max: 24 }),
    COLOR("style.chart.ribbons.labels.connector.stroke", { def: "#1A1A1A" }),
    NUMBER("style.chart.ribbons.labels.connector.strokeWidth", { def: 1, min: 0, max: 12 }),
    CHECKBOX("style.chart.ribbons.labels.marker.show", { def: true }),
    NUMBER("style.chart.ribbons.labels.marker.radius", { def: 3, min: 0, max: 12 }),
    COLOR("style.chart.ribbons.labels.marker.stroke", { def: "#FFFFFF" }),
    NUMBER("style.chart.ribbons.labels.marker.strokeWidth", { def: 1, min: 0, max: 12 }),
    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true })
]);

const { themeOptions, currentTheme } = useThemeOptions();

const configTheme = computed(() => ({
    theme: currentTheme.value,
}))

const config = computed(()=> {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        skeletonConfig: {
            style: {
                chart: {
                    backgroundColor: '#FF0000'
                }
            }
        },
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
        theme: currentTheme.value
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
<div style="margin: 12px 0; color: white">
    Theme:
    <select v-model="currentTheme" @change="step += 1">
        <option v-for="opt in themeOptions">{{ opt }}</option>
    </select>
</div>

    <Box comp="VueUiChord" :dataset="dataset" :config="config">
        <template #title>VueUiChord</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiChord 
                    :dataset="dataset" 
                    :config="{
                        ...config,
                        responsive: true
                    }"/>
            </div>
        </template>

        <template #theme>
            <LocalVueUiChord
                :dataset="dataset"
                :config="configTheme"
            />
            <!-- <LocalVueDataUi
                component="VueUiChord"
                :dataset="dataset"
                :config="configTheme"
            /> -->
        </template>

        <template #local>
            <LocalVueUiChord :dataset="dataset" :config="config" ref="local">
                <!-- <template #pattern="{ seriesIndex, patternId }">
                    <pattern v-if="seriesIndex === 0" :id="patternId" width="70" height="8" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="none" stroke="#1A1A1A" d="M-.02 22c8.373 0 11.938-4.695 16.32-9.662C20.785 7.258 25.728 2 35 2s14.215 5.258 18.7 10.338C58.082 17.305 61.647 22 70.02 22M-.02 14.002C8.353 14 11.918 9.306 16.3 4.339 20.785-.742 25.728-6 35-6S49.215-.742 53.7 4.339c4.382 4.967 7.947 9.661 16.32 9.664M70 6.004c-8.373-.001-11.918-4.698-16.3-9.665C49.215-8.742 44.272-14 35-14S20.785-8.742 16.3-3.661C11.918 1.306 8.353 6-.02 6.002"/></pattern>

                    <pattern v-if="seriesIndex === 1" :id="patternId" width="29" height="50.115" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b31"/><path fill="none" stroke="#ecc94b" stroke-linecap="square" stroke-width=".5" d="M14.5 6.628 8.886 3.372v-6.515L14.502-6.4l5.612 3.257-.001 6.514zm0 50.06-5.613-3.256v-6.515l5.614-3.258 5.612 3.257-.001 6.515zm14.497-25.117-5.612-3.257v-6.515L29 18.541l5.612 3.257-.001 6.515zm-29 0-5.612-3.257v-6.515L0 18.541l5.612 3.257v6.515zM14.5 11.82 4.36 5.967l.002-11.706 10.14-5.855L24.638-5.74l-.001 11.707zm0 50.06L4.36 56.028l.002-11.706 10.14-5.855 10.137 5.852-.001 11.707zm14.498-25.118-10.14-5.852.002-11.707L29 13.349l10.137 5.853-.001 11.706zm-29 0-10.139-5.852.002-11.707L0 13.349l10.138 5.853-.002 11.706zm14.501-19.905L0 8.488.002-8.257l14.5-8.374L29-8.26l-.002 16.745zm0 50.06L0 58.548l.002-16.745 14.5-8.373L29 41.8l-.002 16.744zM28.996 41.8l-14.498-8.37.002-16.744L29 8.312l14.498 8.37-.002 16.745zm-29 0-14.498-8.37.002-16.744L0 8.312l14.498 8.37-.002 16.745z"/></pattern>
                </template> -->
            </LocalVueUiChord>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiChord" :dataset="dataset" :config="config" ref="vduiLocal"/>
        </template>

        <template #build>
            <VueUiChord :dataset="dataset" :config="config" ref="build"/>
        </template>

        <template #build-treesh>
            <VueUiChordTreeshaken :dataset="dataset" :config="config" ref="build"/>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiChord" :dataset="dataset" :config="config" ref="vduiBuild"/>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>