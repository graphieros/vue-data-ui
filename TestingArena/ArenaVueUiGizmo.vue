<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiGizmo from '../src/components/vue-ui-gizmo.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { VueUiGizmo } from "vue-data-ui";
import { VueUiGizmo as VueUiGizmoTreeshaken } from "vue-data-ui/vue-ui-gizmo";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { vue_ui_gizmo: DEFAULT_CONFIG } = useConfig();

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
        dataset.value = 50;
    }, 2000);
})

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    SELECT("type", ["battery", "gauge"], { def: "battery" }),
    RANGE("size", { def: 64, min: 10, max: 100 }),
    COLOR("stroke", { def: "#e1e5e8" }),
    COLOR("color", { def: "#5f8bee" }),
    CHECKBOX("useGradient", { def: true }),
    COLOR("gradientColor", { def: "#9db5ed" }),
    CHECKBOX("showPercentage", { def: true }),
    COLOR("textColor", { def: "#CCCCCC" })
]);

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        // skeletonConfig: {
        //     stroke: '#FF0000'
        // },
        formatter: ({value}) => {
            return `f | ${value}`
        } 
    }
})

const step = ref(0)
    
</script>

<template>
    <div style="color: white">{{ dataset }}</div>
    <Box comp="VueUiGizmo" :dataset="dataset" :config="config">
        <template #title>VueUiGizmo</template>
        
        <template #local>
            <LocalVueUiGizmo :dataset="dataset" :config="config">
                <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template>
            </LocalVueUiGizmo>
            <LocalVueUiGizmo :dataset="dataset" :config="{
                ...config,
                type: 'gauge'
            }"/>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiGizmo" :dataset="dataset" :config="config"/>
            <LocalVueDataUi component="VueUiGizmo" :dataset="dataset" :config="{
                ...config,
                type: 'gauge'
            }"/>
        </template>

        <template #build>
            <VueUiGizmo :dataset="dataset" :config="config"/>
            <VueUiGizmo :dataset="dataset" :config="{
                ...config,
                type: 'gauge'
            }"/>
        </template>

        <template #build-treesh>
            <VueUiGizmoTreeshaken :dataset="dataset" :config="config"/>
            <VueUiGizmoTreeshaken :dataset="dataset" :config="{
                ...config,
                type: 'gauge'
            }"/>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiGizmo" :dataset="dataset" :config="config"/>
            <VueDataUi component="VueUiGizmo" :dataset="dataset" :config="{
                ...config,
                type: 'gauge'
            }"/>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>