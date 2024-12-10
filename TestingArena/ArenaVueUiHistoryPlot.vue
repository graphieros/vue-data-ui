<script setup>
import { ref, computed } from "vue";
import LocalVueUiHistoryPlot from '../src/components/vue-ui-history-plot.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild } = useArena()

const dataset = ref([
    {
        name: 'Series 1',
        values: [
            { x: 12, y: 0, label: 'T1'},
            { x: 18, y: 0.2, label: 'T2'},
            { x: 21, y: 0.8, label: 'T3'},
            { x: 19, y: 1.2, label: 'T4'},
        ]
    },
    {
        name: 'Series 2',
        values: [
            { x: 22, y: 2, label: 'T1'},
            { x: 44, y: 4, label: 'T2'},
            { x: 65, y: 3, label: 'T3'},
            { x: 12, y: 2.5, label: 'T4'},
        ]
    },
]);

const model = ref([
    { key: 'responsive', def: false, type: 'checkbox' },
    { key: 'style.fontFamily', def: 'inherit', type: 'text' },
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color' },
]);

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default"
])

const currentTheme = ref(themeOptions.value[4]);

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c
    }
});

const step = ref(0);

</script>

<template>
    <Box>
        <template #title>VueUiHistoryPlot</template>

        <template #local>
            <LocalVueUiHistoryPlot :dataset="dataset" :config="config"/>
        </template>
    </Box>
</template>