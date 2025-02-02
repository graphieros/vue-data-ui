<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiCirclePack from "../src/components/vue-ui-circle-pack.vue";
import LocalVueDataUi from "../src/components/vue-data-ui.vue";
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";
import VueUiPattern from "../src/atoms/vue-ui-pattern.vue";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena();

function makeDs({ name, qty, maxVal }) {
  let datapoints = [];
  for (let i = 0; i < qty; i += 1) {
    datapoints.push({
      name: `Datapoint ${i}`,
      value: i === 0 ? null : Math.random() * maxVal,
      // color: '#FFFFFF',
      // breakdown: [
      //     { name: 'br 1', value: Math.random() * 10 },
      //     { name: 'br 2', value: Math.random() * 20 },
      //     { name: 'br 3', value: Math.random() * 30 },
      // ]
    });
  }
  return datapoints;
}

const dataset = ref(makeDs({ name: "Pack 1", qty: 24, maxVal: 120 }));

onMounted(() => {
  setTimeout(() => {
    dataset.value = makeDs({
      name: "PPP",
      qty: 24,
      maxVal: 1000,
    });
  }, 2000);
});

const model = ref([
  { key: "userOptions.show", def: true, type: "checkbox" },
  { key: "style.chart.backgroundColor", def: "#FFFFFF", type: "color" },
  { key: "style.chart.color", def: "#1A1A1A", type: "color" },
  { key: "style.chart.title.text", def: "Title", type: "text" },
  { key: "style.chart.title.subtitle.text", def: "Subtitle", type: "text" },
  { key: "style.chart.circles.stroke", def: "#FFFFFF", type: "color" },
  {
    key: "style.chart.circles.strokeWidth",
    def: 1,
    type: "number",
    min: 0,
    max: 12,
  },
  { key: "style.chart.circles.gradient.show", def: true, type: "checkbox" },
  {
    key: "style.chart.circles.gradient.intensity",
    def: 40,
    min: 0,
    max: 100,
    type: "range",
  },

  { key: "style.chart.circles.labels.name.show", def: true, type: "checkbox" },
  { key: "style.chart.circles.labels.name.bold", def: false, type: "checkbox" },
  {
    key: "style.chart.circles.labels.name.offsetY",
    def: 0,
    type: "number",
    min: -100,
    max: 100,
  },
  { key: "style.chart.circles.labels.name.color", def: "auto", type: "text" },
  { key: "style.chart.circles.labels.value.show", def: true, type: "checkbox" },
  { key: "style.chart.circles.labels.value.color", def: "auto", type: "text" },
  {
    key: "style.chart.circles.labels.value.rounding",
    def: 0,
    type: "number",
    min: 0,
    max: 6,
  },
  { key: "style.chart.circles.labels.value.prefix", def: "P", type: "text" },
  { key: "style.chart.circles.labels.value.suffix", def: "S", type: "text" },
  {
    key: "style.chart.circles.labels.value.bold",
    def: false,
    type: "checkbox",
  },
  {
    key: "style.chart.circles.labels.value.offsetY",
    def: 0,
    type: "number",
    min: -100,
    max: 100,
  },

  { key: "style.chart.circles.zoom.show", def: true, type: "checkbox" },
  {
    key: "style.chart.circles.zoom.shadowForce",
    def: 1,
    type: "range",
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    key: "style.chart.circles.zoom.opacity",
    def: 0.8,
    type: "range",
    min: 0,
    max: 1,
    step: 0.01,
  },
  {
    key: "style.chart.circles.zoom.animationFrameMs",
    def: 200,
    type: "range",
    min: 50,
    max: 1000,
    step: 50,
  },
  {
    key: "style.chart.circles.zoom.zoomRatio",
    def: 1,
    type: "range",
    min: 0.2,
    max: 2,
    step: 0.01,
  },
  {
    key: "style.chart.circles.zoom.label.name.fontSize",
    def: 14,
    type: "number",
    min: 8,
    max: 42,
  },
  {
    key: "style.chart.circles.zoom.label.name.bold",
    def: false,
    type: "checkbox",
  },
  {
    key: "style.chart.circles.zoom.label.name.offsetY",
    def: 0,
    type: "number",
    min: -100,
    max: 100,
  },
  {
    key: "style.chart.circles.zoom.label.name.color",
    def: "auto",
    type: "text",
  },
  {
    key: "style.chart.circles.zoom.label.value.fontSize",
    def: 14,
    type: "number",
    min: 8,
    max: 42,
  },
  {
    key: "style.chart.circles.zoom.label.value.bold",
    def: false,
    type: "checkbox",
  },
  {
    key: "style.chart.circles.zoom.label.value.offsetY",
    def: 0,
    type: "number",
    min: -100,
    max: 100,
  },
  {
    key: "style.chart.circles.zoom.label.value.rounding",
    def: 0,
    type: "number",
    min: 0,
    max: 6,
  },
  {
    key: "style.chart.circles.zoom.label.value.prefix",
    def: "P",
    type: "text",
  },
  {
    key: "style.chart.circles.zoom.label.value.suffix",
    def: "S",
    type: "text",
  },
  {
    key: "style.chart.circles.zoom.label.value.color",
    def: "auto",
    type: "text",
  },
]);

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default",
    "celebration",
    "celebrationNight"
])

const currentTheme = ref(themeOptions.value[1])

const config = computed(() => {
  const c = convertArrayToObject(model.value);
  return {
    ...c,
    theme: currentTheme.value
  };
});

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
    <template #title>VueUiCirclePack</template>

    <template #local>
      <LocalVueUiCirclePack :dataset="dataset" :config="config" ref="local" :key="`local_${step}`">
        <!-- <template #zoom-label="{ x, y, name, value, color, zoomOpacity, currentRadius, fontSize }">
                <foreignObject
                    :x="x - currentRadius / 2"
                    :y="y - currentRadius / 2"
                    :width="currentRadius"
                    :height="currentRadius"
                >
                    <div :style="{color}">
                        {{ name }}
                    </div>
                </foreignObject>
            </template> -->

        <!-- <template #pattern="{ seriesIndex, patternId }">
                <VueUiPattern name="squares" :id="patternId" :scale="0.4"/>
            </template> -->
      </LocalVueUiCirclePack>
    </template>

    <template #VDUI-local>
      <LocalVueDataUi component="VueUiCirclePack" :dataset="dataset" :config="config" ref="vduiLocal" />
    </template>

    <template #build>
      <VueUiCirclePack :dataset="dataset" :config="config" ref="build" />
    </template>

    <template #VDUI-build>
      <VueDataUi component="VueUiCirclePack" :dataset="dataset" :config="config" ref="vduiBuild" />
    </template>

    <template #knobs>
      <div style="
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;
          width: 100%;
          color: #cccccc;
          gap: 24px;
        ">
        <div v-for="knob in model">
          <label style="font-size: 10px">{{ knob.key }}</label>
          <div style="
              display: flex;
              flex-direction: row;
              flex-wrap: wrap;
              align-items: center;
              gap: 6px;
              height: 40px;
            ">
            <input v-if="!['none', 'select'].includes(knob.type)" :step="knob.step" :type="knob.type"
              :min="knob.min ?? 0" :max="knob.max ?? 0" v-model="knob.def" @change="step += 1" />
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
