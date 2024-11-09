<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiKpi from '../src/components/vue-ui-kpi.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const dataset = ref(1201);

function updateVal() {
    dataset.value = Math.round(Math.random() * 10000)
}

const config = ref({
    formatter: ({ value }) => {
        return `f | ${value}`
    },
    title: 'Lorem ipsum dolor sit amet',
    analogDigits: {
        show: true
    },
})

    
</script>

<template>
    <div>
        <button @click="updateVal">NEW VAL</button>
        <LocalVueUiKpi :dataset="dataset"/>
    </div>
    <Box>
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
        <template #VDUI-build>
            <VueDataUi component="VueUiKpi" :dataset="dataset" :config="config"/>
        </template>
    </Box>
</template>