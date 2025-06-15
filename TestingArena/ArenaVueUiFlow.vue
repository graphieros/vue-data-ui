<script setup>
import { ref, computed } from "vue";
import LocalVueUiFlow from '../src/components/vue-ui-flow.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena()

const dataset = ref([
  // root
  ['Config', 'theme', 1],
  ['Config', 'customPalette', 1],
  ['Config', 'userOptions', 1],
  ['Config', 'nodeCategories', 1],
  ['Config', 'nodeCategoryColors', 1],
  ['Config', 'style', 1],
  ['Config', 'table', 1],

  // userOptions
  ['userOptions', 'show', 1],
  ['userOptions', 'showOnChartHover', 1],
  ['userOptions', 'position', 1],
  ['userOptions', 'buttons', 1],
  ['buttons', 'pdf', 1],
  ['buttons', 'csv', 1],
  ['buttons', 'img', 1],
  ['buttons', 'table', 1],
  ['buttons', 'fullscreen', 1],
  ['buttons', 'annotator', 1],
  ['buttons', 'tooltip', 1],
  ['userOptions', 'buttonTitles', 1],

  // style
  ['style', 'fontFamily', 1],
  ['style', 'chart', 1],

  // chart
  ['chart', 'backgroundColor', 1],
  ['chart', 'color', 1],
  ['chart', 'padding', 1],
  ['chart', 'title', 1],
  ['chart', 'tooltip', 1],
  ['chart', 'legend', 1],
  ['chart', 'nodes', 1],
  ['chart', 'links', 1],

  // padding
  ['padding', 'top', 1],
  ['padding', 'right', 1],
  ['padding', 'bottom', 1],
  ['padding', 'left', 1],

  // title
  ['title', 'text', 1],
  ['title', 'subtitle', 1],
  ['subtitle', 'text', 1],
  ['title', 'cy', 1],

  // tooltip
  ['tooltip', 'show', 1],
  ['tooltip', 'fontSize', 1],
  ['tooltip', 'backgroundColor', 1],
  ['tooltip', 'color', 1],
  ['tooltip', 'borderColor', 1],
  ['tooltip', 'borderWidth', 1],
  ['tooltip', 'borderRadius', 1],
  ['tooltip', 'backgroundOpacity', 1],
  ['tooltip', 'position', 1],
  ['tooltip', 'offsetY', 1],
  ['tooltip', 'showPercentage', 1],
  ['tooltip', 'roundingPercentage', 1],
  ['tooltip', 'translations', 1],
  ['translations', 'from', 1],
  ['translations', 'to', 1],
  ['translations', 'percentOfTotal', 1],

  // legend
  ['legend', 'show', 1],
  ['legend', 'backgroundColor', 1],
  ['legend', 'color', 1],
  ['legend', 'fontSize', 1],
  ['legend', 'paddingBottom', 1],
  ['legend', 'paddingTop', 1],
  ['legend', 'bold', 1],
  ['legend', 'cy', 1],

  // nodes
  ['nodes', 'gap', 1],
  ['nodes', 'minHeight', 1],
  ['nodes', 'width', 1],
  ['nodes', 'labels', 1],
  ['nodes', 'stroke', 1],
  ['nodes', 'strokeWidth', 1],

  // labels
  ['labels', 'fontSize', 1],
  ['labels', 'abbreviation', 1],
  ['labels', 'prefix', 1],
  ['labels', 'suffix', 1],
  ['labels', 'rounding', 1],
  ['labels', 'formatter', 1],

  // abbreviation
  ['abbreviation', 'use', 1],
  ['abbreviation', 'length', 1],

  // links
  ['links', 'width', 1],
  ['links', 'opacity', 1],
  ['links', 'stroke', 1],
  ['links', 'strokeWidth', 1],

  // table
  ['table', 'show', 1],
  ['table', 'responsiveBreakpoint', 1],
  ['table', 'columnNames', 1],
  ['columnNames', 'source', 1],
  ['columnNames', 'target', 1],
  ['columnNames', 'value', 1],
  ['table', 'th', 1],
  ['table', 'td', 1],

  // th
  ['th', 'backgroundColor', 1],
  ['th', 'color', 1],
  ['th', 'outline', 1],

  // td
  ['td', 'backgroundColor', 1],
  ['td', 'color', 1],
  ['td', 'outline', 1],
]);

const model = ref([
    { key: 'userOptions.show', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.table', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox' },
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right'] },
    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox' },
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox' },

    { key: 'style.chart.padding.top', def: 12, type: 'number', min: 0, max: 100,},
    { key: 'style.chart.padding.right', def: 12, type: 'number', min: 0, max: 100,},
    { key: 'style.chart.padding.bottom', def: 12, type: 'number', min: 0, max: 100,},
    { key: 'style.chart.padding.left', def: 12, type: 'number', min: 0, max: 100,},

    { key: 'userOptions.print.scale', def: 2, type: 'number', min: 1, max: 5 },
    { key: 'userOptions.print.allowTaint', def: true, type: 'checkbox' },
    { key: 'userOptions.print.useCORS', def: true, type: 'checkbox' },
    { key: 'userOptions.print.backgroundColor', def: '#FFFFFF' },

    { key: 'style.fontFamily', def: 'inherit', type: 'text' },
    { key: 'style.chart.backgroundColor', def: '#FFFFFF20', type: 'color' },
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.padding.top', def: 12, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.padding.left', def: 12, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.padding.right', def: 12, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.padding.bottom', def: 0, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.title.text', def: 'Lorem ipsum dolor', type: 'text' },
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.title.bold', def: true, type: 'checkbox' },
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sit amet', type: 'text' },
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color' },
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox' },
    { key: 'style.chart.nodes.gap', def: 10, type: 'number', min: 0, max: 40 },
    { key: 'style.chart.nodes.minHeight', def: 20, type: 'number', min: 5, max: 100 },
    { key: 'style.chart.nodes.width', def: 40, type: 'number', min: 10, max: 100 },
    { key: 'style.chart.nodes.labels.fontSize', def: 14, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.nodes.labels.abbreviation.use', def: true, type: 'checkbox' },
    { key: 'style.chart.nodes.labels.abbreviation.length', def: 3, type: 'number', min: 1, max: 12 },
    { key: 'style.chart.nodes.stroke', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.nodes.strokeWidth', def: 1, type: 'number', min: 0, max: 12 },
    { key: 'style.chart.links.opacity', def: 0.8, type: 'number', min: 0, max: 1, step: 0.1 },
    { key: 'style.chart.links.stroke', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.links.strokeWidth', def: 1, type: 'number', min: 0, max: 12 },
    { key: 'style.chart.links.width', def: 200, type: 'number', min: 40, max: 300 }
])

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default",
    "celebration",
    "celebrationNight"
])

const currentTheme = ref(themeOptions.value[6])

const config = computed(() => {
    const c = convertArrayToObject(model.value);

    return {
        theme: currentTheme.value,
        ...c,
        nodeCategories: {
  // top‐level
  theme:                   'config',
  customPalette:           'config',
  userOptions:             'config',
  nodeCategories:          'config',
  nodeCategoryColors:      'config',
  style:                   'config',
  table:                   'config',

  // userOptions
  show:                    'userOptions',
  showOnChartHover:        'userOptions',
  position:                'userOptions',
  buttons:                 'userOptions',
  buttonTitles:            'userOptions',

  // buttons
  pdf:                     'userOptionsButtons',
  csv:                     'userOptionsButtons',
  img:                     'userOptionsButtons',
  table:                   'userOptionsButtons',
  fullscreen:              'userOptionsButtons',
  annotator:               'userOptionsButtons',
  tooltip:                 'userOptionsButtons',

  // style
  fontFamily:              'style',
  chart:                   'style',

  // chart
  backgroundColor:         'chart',
  color:                   'chart',
  padding:                 'chart',
  title:                   'chart',
  tooltip:                 'chart',
  legend:                  'chart',
  nodes:                   'chart',
  links:                   'chart',

  // padding
  top:                     'chartPadding',
  right:                   'chartPadding',
  bottom:                  'chartPadding',
  left:                    'chartPadding',

  // title
  text:                    'chartTitle',
  subtitle:                'chartTitle',
  cy:                      'chartTitle',
  // subtitle.text lives under the same category

  // tooltip
  show:                    'chartTooltip',
  fontSize:                'chartTooltip',
  backgroundColor:         'chartTooltip',
  color:                   'chartTooltip',
  borderColor:             'chartTooltip',
  borderWidth:             'chartTooltip',
  borderRadius:            'chartTooltip',
  backgroundOpacity:       'chartTooltip',
  position:                'chartTooltip',
  offsetY:                 'chartTooltip',
  showPercentage:          'chartTooltip',
  roundingPercentage:      'chartTooltip',
  translations:            'chartTooltip',
  from:                    'chartTooltipTranslations',
  to:                      'chartTooltipTranslations',
  percentOfTotal:          'chartTooltipTranslations',

  // legend
  show:                    'chartLegend',
  backgroundColor:         'chartLegend',
  color:                   'chartLegend',
  fontSize:                'chartLegend',
  paddingBottom:           'chartLegend',
  paddingTop:              'chartLegend',
  bold:                    'chartLegend',
  cy:                      'chartLegend',

  // nodes
  gap:                     'chartNodes',
  minHeight:               'chartNodes',
  width:                   'chartNodes',
  labels:                  'chartNodes',
  stroke:                  'chartNodes',
  strokeWidth:             'chartNodes',

  // labels
  fontSize:                'chartLabels',
  abbreviation:            'chartLabels',
  prefix:                  'chartLabels',
  suffix:                  'chartLabels',
  rounding:                'chartLabels',
  formatter:               'chartLabels',

  // abbreviation
  use:                     'chartLabelsAbbreviation',
  length:                  'chartLabelsAbbreviation',

  // links
  width:                   'chartLinks',
  opacity:                 'chartLinks',
  stroke:                  'chartLinks',
  strokeWidth:             'chartLinks',

  // table
  show:                    'table',
  responsiveBreakpoint:    'table',
  columnNames:             'table',
  th:                      'table',
  td:                      'table',

  // columnNames
  source:                  'tableColumnNames',
  target:                  'tableColumnNames',
  value:                   'tableColumnNames',

  // th
  backgroundColor:         'tableTh',
  color:                   'tableTh',
  outline:                 'tableTh',

  // td
  backgroundColor:         'tableTd',
  color:                   'tableTd',
  outline:                 'tableTd',
},

nodeCategoryColors: {
  // top‐level
  config:                 '#1f77b4',
  userOptions:            '#ff7f0e',
  userOptionsButtons:     '#2ca02c',
  style:                  '#d62728',

  // chart
  chart:                  '#9467bd',
  chartPadding:           '#8c564b',
  chartTitle:             '#e377c2',
  chartTooltip:           '#bcbd22',
  chartTooltipTranslations:'#17becf',
  chartLegend:            '#aec7e8',
  chartNodes:             '#98df8a',
  chartLabels:            '#ff9896',
  chartLabelsAbbreviation:'#c5b0d5',
  chartLinks:             '#c49c94',

  // table
  table:                  '#dbdb8d',
  tableColumnNames:       '#9edae5',
  tableTh:                '#393b79',
  tableTd:                '#5254a3',
},
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                nodes: {
                    ...c.style.chart.nodes,
                    labels: {
                        ...c.style.chart.nodes.labels,
                        formatter: ({ value, config }) => {
                            // console.log(config)
                            return `f | ${value}`
                        }
                    }
                }
            }
        }
    }
})

const step = ref(0);

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <Box comp="VueUiFlow" :dataset="dataset">
        <template #title>VueUiFlow</template>

        <template #local>
            <LocalVueUiFlow :dataset="dataset" :config="config" :key="`local_${step}`" ref="local">
                <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)" />
                </template>

                <template #optionPdf>
                    PRINT PDF
                </template>

                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template>
                <template #source>
                    <div style="width:100%;font-size:10px;text-align:left">
                        SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae
                        perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus
                        aspernatur labore! Sapiente aspernatur corrupti quis ad.
                    </div>
                </template>
            </LocalVueUiFlow>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiFlow" :dataset="dataset" :config="config" :key="`VDUI_local_${step}`"
                ref="vduiLocal"></LocalVueDataUi>
        </template>

        <template #build>
            <VueUiFlow :dataset="dataset" :config="config" :key="`build_${step}`" ref="build"></VueUiFlow>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiFlow" :dataset="dataset" :config="config" :key="`VDUI_build_${step}`"
                ref="vduiBuild"></VueDataUi>
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