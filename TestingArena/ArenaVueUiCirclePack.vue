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
      value: Math.random() * maxVal,
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

const dataset = ref(makeDs({ name: "Pack 1", qty: 5, maxVal: 12000 }));

// const dataset = ref([
//   { name: 'D', value: 10 },
//   { name: 'D 1', value: 5 },
//   { name: 'D 1', value: 5 },
//   { name: 'D 1', value: 3 },
//   { name: 'D 1', value: 3 },
//   { name: 'D 1', value: 1 },
//   { name: 'D 1', value: 1 },
//   { name: 'D 1', value: 1 },
//   { name: 'D 1', value: 1 },
//   { name: 'D 1', value: 1 },
//   { name: 'D 1', value: 1 },
//   { name: 'D 1', value: 0.9 },
//   { name: 'D 1', value: 2 },
//   { name: 'D 1', value: 1 },
//   { name: 'D 1', value: 2 },
// ])

// const dataset = ref([{"name":"Add","value":477},{"name":"options","value":152},{"name":"config","value":139},{"name":"tooltip","value":128},{"name":"Fix","value":124},{"name":"option","value":114},{"name":"user","value":94},{"name":"button","value":88},{"name":"slot","value":79},{"name":"component","value":75},{"name":"table","value":61},{"name":"Implemented","value":55},{"name":"data","value":54},{"name":"Improved","value":53},{"name":"legend","value":50},{"name":"slots","value":50},{"name":"method","value":39},{"name":"animation","value":35},{"name":"titles","value":35},{"name":"contents","value":34},{"name":"optional","value":33},{"name":"configurable","value":33},{"name":"accessibility","value":33},{"name":"zoom","value":32},{"name":"watermark","value":31},{"name":"labels","value":30},{"name":"chart","value":30},{"name":"new","value":29},{"name":"responsive","value":28},{"name":"label","value":27},{"name":"dataset","value":27},{"name":"segregation","value":26},{"name":"Create","value":26},{"name":"mode","value":25},{"name":"feature","value":25},{"name":"toggleTable","value":25},{"name":"display","value":24},{"name":"Improve","value":24},{"name":"reactivity","value":24},{"name":"positioning","value":23},{"name":"border","value":23},{"name":"Exposed","value":23},{"name":"exposed","value":23},{"name":"inside","value":22},{"name":"smoother","value":22},{"name":"transition","value":22},{"name":"toggle","value":21},{"name":"accordion","value":21},{"name":"open","value":21},{"name":"close","value":21},{"name":"layout","value":20},{"name":"color","value":20},{"name":"series","value":19},{"name":"backgroundOpacity","value":19},{"name":"before","value":19},{"name":"attributes","value":18},{"name":"serie","value":18},{"name":"size","value":18},{"name":"methods","value":18},{"name":"type","value":17},{"name":"after","value":17},{"name":"bar","value":16},{"name":"Expose","value":16},{"name":"types","value":15},{"name":"time","value":15},{"name":"named","value":15},{"name":"png","value":15},{"name":"image","value":15},{"name":"download","value":15},{"name":"generateImage","value":15},{"name":"generatePdf","value":15},{"name":"values","value":14},{"name":"error","value":14},{"name":"value","value":14},{"name":"smooth","value":14},{"name":"line","value":14},{"name":"minimap","value":13},{"name":"datasets","value":13},{"name":"applied","value":13},{"name":"with","value":12},{"name":"responsiveness","value":12},{"name":"scale","value":11},{"name":"show","value":11},{"name":"scoped","value":11},{"name":"issue","value":11},{"name":"css","value":11},{"name":"Use","value":11},{"name":"datapoint","value":11},{"name":"hover","value":11},{"name":"attribute","value":11},{"name":"generateCsv","value":11},{"name":"axis","value":10},{"name":"selection","value":10},{"name":"area","value":10},{"name":"prefix","value":10},{"name":"suffix","value":10},{"name":"negative","value":10},{"name":"Minor","value":10},{"name":"all","value":9},{"name":"svg","value":9},{"name":"icon","value":9},{"name":"added","value":9},{"name":"position","value":9},{"name":"showing","value":9},{"name":"Removed","value":9},{"name":"console","value":8},{"name":"individual","value":8},{"name":"used","value":8},{"name":"pattern","value":8},{"name":"background","value":8},{"name":"add","value":8},{"name":"empty","value":8},{"name":"issues","value":8},{"name":"charts","value":8},{"name":"icons","value":8},{"name":"plot","value":8},{"name":"donut","value":8},{"name":"cell","value":8},{"name":"bundle","value":8},{"name":"harmless","value":7},{"name":"range","value":7},{"name":"offset","value":7},{"name":"bug","value":7},{"name":"components","value":7},{"name":"fix","value":7},{"name":"algorithm","value":7},{"name":"shape","value":7},{"name":"gradient","value":7},{"name":"support","value":7},{"name":"TS","value":6},{"name":"wrong","value":6},{"name":"y","value":6},{"name":"some","value":6},{"name":"vertical","value":6},{"name":"provided","value":6},{"name":"customize","value":6},{"name":"control","value":6},{"name":"segregating","value":6},{"name":"lines","value":6},{"name":"LTTB","value":6},{"name":"downsample","value":6},{"name":"big","value":6},{"name":"colors","value":6},{"name":"ts","value":6},{"name":"xAxis","value":6},{"name":"errors","value":6},{"name":"release","value":6},{"name":"name","value":6},{"name":"selectDatapoint","value":6},{"name":"datapoints","value":6},{"name":"Safari","value":6}])

// onMounted(() => {
//   setTimeout(() => {
//     dataset.value = makeDs({
//       name: "PPP",
//       qty: 24,
//       maxVal: 1000,
//     });
//   }, 2000);
// });

const model = ref([
  { key: "userOptions.show", def: true, type: "checkbox" },
  { key: "style.chart.backgroundColor", def: "#FFFFFF", type: "color" },
  { key: "style.chart.color", def: "#1A1A1A", type: "color" },
  { key: "style.chart.title.text", def: "Title", type: "text" },
  { key: "style.chart.title.subtitle.text", def: "Subtitle", type: "text" },
  { key: "style.chart.circles.stroke", def: "#000000", type: "color" },
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
  { key: "style.chart.circles.labels.value.prefix", def: "", type: "text" },
  { key: "style.chart.circles.labels.value.suffix", def: "", type: "text" },
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

const currentTheme = ref(themeOptions.value[0])

const config = computed(() => {
  const c = convertArrayToObject(model.value);
  return {
    ...c,
    theme: currentTheme.value
  };
});

const step = ref(0);

function selectDatapoint(dp) {
  console.log(dp)
}

</script>

<template>
      <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
      <LocalVueUiCirclePack :dataset="dataset" :config="config" ref="local" :key="`local_${step}`" @selectDatapoint="selectDatapoint"></LocalVueUiCirclePack>
    </div>
  <Box>
    <template #title>VueUiCirclePack</template>

    <template #local>
      <LocalVueUiCirclePack :dataset="dataset" :config="config" ref="local" :key="`local_${step}`" @selectDatapoint="selectDatapoint">
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

        <!-- <template #data-label="{ x, y, name, value, color, createTSpans, fontSize, radius }">
          <text
            :x="x"
            :y="y"
            :font-size="fontSize.name"
            :fill="color"
            text-anchor="middle" 
            v-html="createTSpans({
            content: `${name}: ${value.toFixed(0)}`,
            fontSize: fontSize.name,
            fill: color,
            x,
            y: y - fontSize.name / 3,
            maxWords: 2
          })"/>
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
