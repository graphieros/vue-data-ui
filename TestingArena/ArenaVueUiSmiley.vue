<script setup>
import { ref, computed } from "vue";
import LocalVueUiSmiley from '../src/components/vue-ui-smiley.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import { VueUiSmiley } from "vue-data-ui";
import { VueUiSmiley as VueUiSmileyTreeshaken } from "vue-data-ui/vue-ui-smiley";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { local, build, vduiLocal, vduiBuild } = useArena();
const { vue_ui_smiley: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const dataset = ref({ rating: {
    '1': 12.12356,
    '2': 43.12356,
    '3': 27.12356,
    '4': 19.12356,
    '5': 29.12356
} });
    
const model = createModel([
    CHECKBOX("readonly", { def: true }),
    NUMBER("style.itemSize", { def: 32, min: 12, max: 96 }),
    COLOR("style.backgroundColor", { def: "#FFFFFF" }),
    CHECKBOX("style.icons.filled", { def: false }),
    CHECKBOX("style.icons.useGradient", { def: true }),

    SELECT("style.title.textAlign", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.title.fontSize", { def: 20, min: 8, max: 42 }),
    COLOR("style.title.color", { def: "#1A1A1A" }),
    CHECKBOX("style.title.bold", { def: true }),
    TEXT("style.title.text", { def: "TItle" }),
    NUMBER("style.title.offsetY", { def: 6, min: -50, max: 50 }),
    NUMBER("style.title.subtitle.fontSize", { def: 14, min: 8, max: 42 }),
    COLOR("style.title.subtitle.color", { def: "#1A1A1A" }),
    CHECKBOX("style.title.subtitle.bold", { def: false }),
    TEXT("style.title.subtitle.text", { def: "Subtitle" }),
    NUMBER("style.title.subtitle.offsetY", { def: 12, min: -50, max: 50 }),

    CHECKBOX("style.rating.show", { def: true }),
    NUMBER("style.rating.fontSize", { def: 28, min: 8, max: 96 }),
    CHECKBOX("style.rating.bold", { def: true }),
    NUMBER("style.rating.roundingValue", { def: 1, min: 0, max: 6 }),
    SELECT("style.rating.position", ["top", "right", "bottom", "left"], { def: "bottom" }),
    NUMBER("style.rating.offsetY", { def: 12, min: -50, max: 50 }),
    NUMBER("style.rating.offsetX", { def: 0, min: -50, max: 50 }),

    CHECKBOX("style.tooltip.show", { def: true }),
    NUMBER("style.tooltip.fontSize", { def: 14, min: 8, max: 42 }),
    NUMBER("style.tooltip.offsetY", { def: 0, min: -50, max: 50 }),
    COLOR("style.tooltip.color", { def: "#1A1A1A" }),
    CHECKBOX("style.tooltip.bold", { def: true }),
    COLOR("style.tooltip.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.tooltip.borderColor", { def: "#E1E5E8" }),
    NUMBER("style.tooltip.borderRadius", { def: 4, min: 0, max: 12 }),
    TEXT("style.tooltip.boxShadow", { def: "0 6px 12px -6px rgba(0,0,0,0.2)" }),
    NUMBER("style.tooltip.roundingValue", { def: 1, min: 0, max: 6 })
]);


const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        style: {
            ...c.style,
            rating: {
                ...c.style.rating,
                // formatter: ({ value }) => {
                //     return `${value}!`
                // }
            },
            tooltip: {
                ...c.style.tooltip,
                // formatter: ({ value }) => {
                //     return `${value}!`
                // }
            }
        }
    }
})

</script>

<template>
    <Box comp="VueUiSmiley" :dataset="dataset" :config="config">
        <template #title>VueUiSmiley</template>

        <template #local>
            <LocalVueUiSmiley :dataset="dataset" :config="config" ref="local">
                <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template>
            </LocalVueUiSmiley>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiSmiley" :dataset="dataset" :config="config" ref="vduiLocal"/>
        </template>

        <template #build>
            <VueUiSmiley :dataset="dataset" :config="config" ref="build"/>
        </template>

        <template #build-treesh>
            <VueUiSmileyTreeshaken :dataset="dataset" :config="config" ref="build"/>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiSmiley" :dataset="dataset" :config="config" ref="vduiBuild"/>
        </template>

        <template #knobs>
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>
    </Box>
</template>