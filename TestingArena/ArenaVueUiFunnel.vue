<script setup>
import { ref, computed } from "vue";
import LocalVueUiFunnel from '../src/components/vue-ui-funnel.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena"

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena()

const dataset = ref([
    {
        name: 'Lead',
        value: 7745
    },
    {
        name: 'Opportunity',
        value: 5468
    },
    {
        name: 'Qualified',
        value: 4238
    },
    {
        name: 'Sold',
        value: 2025
    },
    {
        name: 'Retained',
        value: 1520
    },
])

const model = ref([
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'useCssAnimation', def: true, type: 'checkbox' },
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color' }
])

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default"
])

const currentTheme = ref(themeOptions.value[4])

const config = computed(() => {
    const c = convertArrayToObject(model.value);

    return {
        // theme: currentTheme.value,
        ...c,
    }
})

const step = ref(0);

</script>

<template>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <Box>
        <template #title>VueUiFunnel</template>

        <template #local>
            <LocalVueUiFunnel :dataset="dataset" :config="config"/>
        </template>

        <template #knobs>
            <div
                style="display: flex; flex-direction: row; flex-wrap:wrap; align-items:center; width: 100%; color: #CCCCCC; gap:24px;">
                <div v-for="knob in model">
                    <label style="font-size: 10px">{{ knob.key }}</label>
                    <div
                        style="display:flex; flex-direction:row; flex-wrap: wrap; align-items:center; gap:6px; height: 40px">
                        <input v-if="!['none', 'select'].includes(knob.type)" :step="knob.step" :type="knob.type"
                            :min="knob.min ?? 0" :max="knob.max ?? 0" v-model="knob.def" @change="step += 1">
                        <select v-if="knob.type === 'select'" v-model="knob.def" @change="step += 1">
                            <option v-for="opt in knob.options">{{ opt }}</option>
                        </select>
                    </div>
                </div>
            </div>
        </template>
    </Box>
</template>