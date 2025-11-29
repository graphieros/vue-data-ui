<script setup>
import { ref, computed, onMounted, markRaw } from "vue";
import LocalVueUiDashboard from '../src/components/vue-ui-dashboard.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import SomeTest from "../src/SomeTest.vue";

import { VueUiDashboard } from "vue-data-ui";
import { VueUiDashboard as VueUiDashboardTreeshaken } from "vue-data-ui/vue-ui-dashboard";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { vue_ui_dashboard: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);


const model = createModel([
    CHECKBOX("locked", { def: false }),
    COLOR("style.board.backgroundColor", { def: "#e1e5e8" }),
    COLOR("style.board.color", { def: "#4A4A4A" }),
    TEXT("style.board.aspectRatio", { def: "1/1.4141" }),
    TEXT("style.board.border", { def: "none" }),
    COLOR("style.item.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.item.borderColor", { def: "#FF0000" }),
    COLOR("style.resizeHandles.backgroundColor", { def: "#00F" }),
    TEXT("style.resizeHandles.border", { def: "2px solid #FF0000" }),
    CHECKBOX("userOptions.show", { def: true }),
    CHECKBOX("userOptions.showOnChartHover", { def: true })
]);

// TODO: add xy with zoom and fix bubbling fuckup

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

const xyDataset = ref([
  {
    name: 'Series A',
    type: 'line',
    series: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 134, 233, 377, 610]
  }
])

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
        props: { 
          config: { 
            userOptions: { show: false }, 
            responsive: false,
            style: {
              chart: {
                title: {
                  text: 'Title',
                  subtitle: {
                    text: 'Subtitle'
                  }
                }
              }
            } 
          },
          dataset: onionDataset.value },
    },
    {
      id: 4,
      width: 40,
      height: 20,
      left: 10,
      top: 30,
      component: "VueUiXy",
      props: {
        dataset: xyDataset.value,
        config: {
          responsive: false,
        }
      }
    },
    {
        id: 3,
        width: 20,
        height: 5,
        left: 10,
        top: 70,
        component: markRaw(SomeTest),
        props: { str: 'SOME TEST' },
    },
]);
    
</script>

<template>
    <Box :config="config">
        <template #title>VueUiDashboard</template>

        <template #responsive>
            <div style="width: 800px; height: 800px; resize: both; overflow: auto; background: white">    
              <LocalVueUiDashboard :dataset="dataset" :config="config">
              </LocalVueUiDashboard>
            </div>
        </template>
        
        <template #local>
            <LocalVueUiDashboard :dataset="dataset" :config="config">
            </LocalVueUiDashboard>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiDashboard" :dataset="dataset" :config="config"/>
        </template>

        <template #build-treesh>
            <VueUiDashboardTreeshaken :dataset="dataset" :config="config"/>
        </template>

        <template #knobs>
          <ConfigKnobs :model="model" @change="step += 1"/>
        </template>
    </Box>
</template>