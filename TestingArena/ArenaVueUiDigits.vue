<script setup>
import { ref, computed } from "vue";
import LocalVueUiDigits from "../src/components/vue-ui-digits.vue";
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { VueUiDigits } from "vue-data-ui";
import { VueUiDigits as VueUiDigitsTreeshaken } from "vue-data-ui/vue-ui-digits";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { vue_ui_digits: DEFAULT_CONFIG } = useConfig();

const {
    RANGE,
    TEXT,
    COLOR,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const dataset = ref(0.123456789);

const model = createModel([
    TEXT('height', { def: '100%' }),
    TEXT('width', { def: null }),
    COLOR('backgroundColor', { def: '#FFFFFF '}),
    COLOR('digits.color', { def: '#1A1A1A' }),
    COLOR('digits.skeletonColor', { def: '#E1E5E8' }),
    RANGE('digits.thickness', { def: 1, step: 0.1, min: 0.1, max: 3 })
]);

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c
    }
})

</script>

<template>
    <Box comp="VueUiDigits" :dataset="dataset" :config="config">
        <template #title>VueUiDigits</template>

        <template #responsive>
            <div style="width: 300px; height: 80px; resize: both; overflow: auto; background: white">
                <LocalVueUiDigits :dataset="dataset" :config="{
                    width: '100%',
                    height: '100%'
                }"/>
            </div>
        </template>
        
        <template #local>
            <LocalVueUiDigits :dataset="dataset" :config="config"/>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiDigits" :dataset="dataset" :config="config"/>
        </template>

        <template #build>
            <VueUiDigits :dataset="dataset" :config="config"/>
        </template>

        <template #build-treesh>
            <VueUiDigitsTreeshaken :dataset="dataset" :config="config"/>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiDigits" :dataset="dataset" :config="config"/>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>