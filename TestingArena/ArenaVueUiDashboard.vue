<script setup>
import { ref, computed, onMounted, markRaw } from "vue";
import LocalVueUiDashboard from '../src/components/vue-ui-dashboard.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import SomeTest from "../src/SomeTest.vue";

const model= ref([
    { key: 'locked', def: false, type: 'checkbox' },

    { key: 'style.board.backgroundColor', def: '#e1e5e8', type: 'color'},
    { key: 'style.board.color', def: '#4A4A4A', type: 'color'},
    { key: 'style.board.aspectRatio', def: '1/1.4141', type: 'text'},
    { key: 'style.board.border', def: 'none', type: 'text'},

    { key: 'style.item.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.item.borderColor', def: '#FF0000', type: 'color'},

    { key: 'style.resizeHandles.backgroundColor', def: '#00F', type: 'color'},
    { key: 'style.resizeHandles.border', def: '2px solid #FF0000', type: 'text'},

    { key: 'userOptions.show', def: true, type: 'checkbox' },
    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    
])

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        formatter: ({value}) => {
            return `f | ${value}`
        } 
    }
})

const step = ref(0)

const gaugeDataset = ref({
  base: 0,
  value: 4.2,
  series: [
    {
      from: 0,
      to: 3,
    },
    {
      from: 3,
      to: 4,
    },
    {
      from: 4,
      to: 5,
    },
  ],
});

const onionDataset = ref([
  {
    name: "Serie 1",
    percentage: 90,
    prefix: "",
    suffix: "",
  },
  {
    name: "Serie 2",
    percentage: 50,
    prefix: "",
    suffix: "",
  },
  {
    name: "Serie 3",
    percentage: 75,
    prefix: "",
    suffix: "",
  },
  {
    name: "Serie 4",
    percentage: 10,
    prefix: "",
    suffix: "",
  },
]);

const dataset = ref([
    {
        id: 2,
        width: 30,
        height: 30,
        left: 10,
        top: 4,
        component: "VueUiGauge",
        props: { config: { userOptions: { show: false }, responsive: true }, dataset: gaugeDataset.value },
    },
    {
        id: 2,
        width: 40,
        height: 40,
        left: 50,
        top: 4,
        component: "VueUiOnion",
        props: { config: { userOptions: { show: false }, responsive: false }, dataset: onionDataset.value },
    },
    {
        id: 3,
        width: 20,
        height: 5,
        left: 10,
        top: 50,
        component: markRaw(SomeTest),
        props: { str: 'SOME TEST' },
    },
]);
    
</script>

<template>
    <Box>
        <template #title>VueUiDashboard</template>
        
        <template #local>
            <LocalVueUiDashboard :dataset="dataset" :config="config">
            </LocalVueUiDashboard>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiDashboard" :dataset="dataset" :config="config"/>
        </template>

        <template #knobs>
            <div
                style="display: flex; flex-direction: row; flex-wrap:wrap; align-items:center; width: 100%; color: #CCCCCC; gap:24px;">
                <div v-for="knob in model">
                    <label style="font-size: 10px">{{ knob.key }}</label>
                    <div
                        style="display:flex; flex-direction:row; flex-wrap: wrap; align-items:center; gap:6px; height: 40px">
                        <input v-if="!['none', 'select'].includes(knob.type)" :step="knob.step" :type="knob.type" :min="knob.min ?? 0"
                            :max="knob.max ?? 0" v-model="knob.def" @change="step += 1">
                        <select v-if="knob.type === 'select'" v-model="knob.def" @change="step += 1">
                            <option v-for="opt in knob.options">{{ opt }}</option>
                        </select>
                    </div>
                </div>
            </div>
        </template>

        <template #config>
            {{ config }}
        </template>

    </Box>
</template>