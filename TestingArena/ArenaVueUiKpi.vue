<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiKpi from '../src/components/vue-ui-kpi.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import { VueUiKpi } from "vue-data-ui";
import { VueUiKpi as VueUiKpiTreeshaken } from "vue-data-ui/vue-ui-kpi";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { vue_ui_kpi: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const dataset = ref(1201);

function updateVal() {
    dataset.value = Math.round(Math.random() * 10000);
}

const model = createModel([
    CHECKBOX("debug", { def: true }),
    RANGE("animationFrames", { def: 60, min: 0, max: 1000 }),
    COLOR("backgroundColor", { def: "#FFFFFF"}),
    TEXT("fontFamily", { def: "inherit"}),
    TEXT("layoutClass", { def: ""}),
    TEXT("layoutCss", { def: ""}),
    TEXT("prefix", { def: ""}),
    TEXT("suffix", { def: ""}),
    TEXT("title", { def: "Title"}),
    CHECKBOX("titleBold", { def: true}),
    COLOR("titleColor", { def: "#1A1A1A"}),
    TEXT("titleClass", { def: ""}),
    TEXT("titleCss", { def: ""}),
    RANGE("titleFontSize", { def: 16, min: 8, max: 42}),
    CHECKBOX("useAnimation", { def: true }),
    CHECKBOX("valueBold", { def: true }),
    TEXT("valueClass", { def: ""}),
    TEXT("valueCss", { def: ""}),
    RANGE("valueFontSize", { def: 32, min: 12, max: 120 }),
    NUMBER("valueRounding", { def: 0, min: 0, max: 6 }),
    CHECKBOX("analogDigits.show", { def: false }),
    RANGE("analogDigits.height", { def: 40, min: 12, max: 120 }),
    COLOR("analogDigits.color", { def: "#1A1A1A" }),
    COLOR("analogDigits.skeletonColor", { def: "#E1E5E8"})
]);

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        formatter: ({ value }) => {
            return `f | ${value}`
        },
    }
})
    
</script>

<template>
    <div>
        <button @click="updateVal">NEW VAL</button>
        <LocalVueUiKpi :dataset="dataset">
            <template #chart-background>
                <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
            </template>
        </LocalVueUiKpi>
    </div>
    <Box comp="VueUiKpi" :dataset="dataset" :config="config">
        <template #title>VueUiKpi</template>
        
        <template #local>
            <LocalVueUiKpi :dataset="dataset" :config="config"/>
        </template>
        <template #VDUI-local>
            <LocalVueDataUi component="VueUiKpi" :dataset="dataset" :config="config"/>
        </template>
        <template #build>
            <VueUiKpi :dataset="dataset" :config="config"/>
        </template>
        <template #build-treesh>
            <VueUiKpiTreeshaken :dataset="dataset" :config="config"/>
        </template>
        <template #VDUI-build>
            <VueDataUi component="VueUiKpi" :dataset="dataset" :config="config"/>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" :open="summaryOpen"/>
        </template>
    </Box>
</template>