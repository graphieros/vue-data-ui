<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiXyCanvas from '../src/components/vue-ui-xy-canvas.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

import { VueUiXyCanvas } from "vue-data-ui";
import { VueUiXyCanvas as VueUiXyCanvasTreeshaken } from "vue-data-ui/vue-ui-xy-canvas";

const { local, build, vduiLocal, vduiBuild, toggleTable, toggleLabels, toggleStack } = useArena()

const crazyDs = [];
const crazyDs2 = [];
const crazyDs3 = []
for (let i = 0; i < 50; i += 1) {
    if ((i > 10 && i <= 20) || (i > 21 && i < 30)) {
        crazyDs3.push(null)
    } else {
        crazyDs3.push(Math.random() + (Math.random() > 0.5 ? Math.random() * -5 : Math.random() * 5))
    }
    crazyDs.push(Math.random() + (Math.random() > 0.5 ? Math.random() * 10 : -10))
    crazyDs2.push(Math.random() + (Math.random() > 0.5 ? Math.random() * -10 : -10))
}

function makeDs(n,m) {
    const arr = [];
    for (let i = 0; i < n; i += 1) {
        arr.push(Math.random() * m)
    }
    return arr
}

const dataset = ref(undefined);

onMounted(() => {
    setTimeout(() => {
        dataset.value = [
        {
            name: "S0",
            series: crazyDs3,
            type: "line",
            useArea: true,
            dataLabels: true,
            scaleSteps: 2,
            prefix: '$',
            suffix: '£',
            rounding: 1,
        },
        {
            name: "S1",
            series: crazyDs2,
            type: "bar",
            useArea: false,
            dataLabels: true,
            scaleSteps: 2,
            prefix: '$',
            suffix: '£',
            rounding: 1,
        },
        {
            name: "S2",
            series: crazyDs,
            type: "plot",
            useArea: false,
            dataLabels: true,
            scaleSteps: 2,
            prefix: '$',
            suffix: '£',
            rounding: 1,
        },
    ]
    }, 2000)
})

    async function getData() {
        return makeDs(800, 100)
    }

async function longpolling ()
{
  try {
    const response = await getData();
    dataset.value[0].series = response;
    console.log(response)
  }
    catch (error) {
    console.error('error fetching wsjtx data', error);
  }
  finally {
    setTimeout(longpolling, 1);
  }
}

// onMounted(async () => {
//   longpolling();
// });



//     onMounted(() => {
//     setTimeout(() => {
//         dataset.value[0].series.push(10)
//     }, 3000)
// })


const model = ref([
    { key: 'loading', def: false, type: 'checkbox'},
    { key: 'debug', def: true, type: 'checkbox'},
    { key: 'downsample.threshold', def: 120000, type: 'number', min: 0,max: 10000000},
    { key: 'responsive', def: false, type: "checkbox" },
    { key: 'userOptions.show', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.table', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.labels', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.stack', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right']},
    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},

    { key: 'userOptions.print.scale', def: 2, type: 'number', min: 1, max: 5},
    { key: 'userOptions.print.allowTaint', def: true, type: 'checkbox'},
    { key: 'userOptions.print.useCORS', def: true, type: 'checkbox'},
    { key: 'userOptions.print.backgroundColor', def: '#FFFFFF' },
    
    { key: 'style.fontFamily', def: 'Arial', type: 'text' },
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.aspectRatio', def: '12 / 9', type: 'text' },
    { key: 'style.chart.stacked', def: false, type: 'checkbox' },
    { key: 'style.chart.stackGap', def: 20, type: 'number', min: 0.1, max: 1, step: 0.1 },
    { key: 'style.chart.scale.ticks', def: 10, type: 'number', min: 2, max: 20 },
    { key: 'style.chart.scale.min', def: null, type: 'number', min: -1000, max: 1000 },
    { key: 'style.chart.scale.max', def: null, type: 'number', min: -1000, max: 1000 },

    { key: 'style.chart.zoom.show', def: true, type: 'checkbox' },
    { key: 'style.chart.zoom.color', def: '#CCCCCC', type: 'color' },
    { key: 'style.chart.zoom.highlightColor', def: '#4A4A4A', type: 'color' },
    { key: 'style.chart.zoom.fontSize', def: 14, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.zoom.useResetSlot', def: false, type: 'checkbox' },
    { key: 'style.chart.zoom.startIndex', def: null, type: 'number', min: 0, max: 1000},
    { key: 'style.chart.zoom.endIndex', def: null, type: 'number', min: 0, max: 1000},
    { key: 'style.chart.zoom.enableRangeHandles', def: true, type: 'checkbox'},
    { key: 'style.chart.zoom.enableSelectionDrag', def: true, type: 'checkbox'},
    { key: 'style.chart.zoom.focusOnDrag', def: true, type: 'checkbox'},
    { key: 'style.chart.zoom.focusRangeRatio', def: 0.2, type: 'number', min: 0.1, max: 0.9, step: 0.1},

    { key: 'style.chart.zoom.minimap.show', def: true, type: 'checkbox'},
    { key: 'style.chart.zoom.preview.enable', def: true, type: 'checkbox'},

    { key: 'style.chart.selector.show', def: true, type: 'checkbox' },
    { key: 'style.chart.selector.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.selector.dashed', def: false, type: 'checkbox' },

    { key: 'style.chart.tooltip.show', def: true, type: 'checkbox' },
    { key: 'style.chart.tooltip.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.tooltip.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.tooltip.fontSize', def: 14, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.tooltip.borderRadius', def: 4, type: 'number', min: 0, max: 12 },
    { key: 'style.chart.tooltip.borderColor', def: '#e1e5e6', type: 'color' },
    { key: 'style.chart.tooltip.borderWidth', def: 1, type: 'number', min: 0, max: 12 },
    { key: 'style.chart.tooltip.backgroundOpacity', def: 100, type: 'range', min: 0, max: 100},
    { key: 'style.chart.tooltip.position', def: 'center', type: 'select', options: ['left', 'center', 'right']},
    { key: 'style.chart.tooltip.offsetY', def: 24, type: 'number', min: 0, max: 48 },

    { key: 'style.chart.legend.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.legend.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.legend.show', def: true, type: 'checkbox' },
    { key: 'style.chart.legend.fontSize', def: 16, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.legend.bold', def: false, type: 'checkbox' },
    { key: 'style.chart.legend.position', def: 'bottom', type: 'select', options: ['top', 'bottom']},

    { key: 'style.chart.title.text', def: 'Lorem ipsum placer', type: 'text' },
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.title.bold', def: true, type: 'checkbox' },
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sit amet', type: 'text' },
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox' },
    { key: 'style.chart.grid.y.showAxis', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.y.axisColor', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.grid.y.axisName', def: 'Y AXIS', type: 'text' },
    { key: 'style.chart.grid.y.axisThickness', def: 2, type: 'number', min: 1, max: 6 },
    { key: 'style.chart.grid.y.axisLabels.show', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.y.axisLabels.bold', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.y.axisLabels.fontSizeRatio', def: 0.7, type: 'number', min: 0.1, max: 2, step: 0.1 },
    { key: 'style.chart.grid.y.axisLabels.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.grid.y.axisLabels.offsetX', def: 0, type: 'number', min: -100, max: 100 },
    { key: 'style.chart.grid.y.verticalLines.show', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.y.verticalLines.color', def: '#CCCCCC', type: 'color' },
    { key: 'style.chart.grid.y.verticalLines.hideUnderXLength', def: 0, type: 'number', min: 5, max: 40 },
    { key: 'style.chart.grid.y.verticalLines.position', def: 'middle', type: 'select', options: ['start', 'middle']},

    // { key: 'style.chart.grid.y.timeLabels.show', def: true, type: 'checkbox' },
    // { key: 'style.chart.grid.y.timeLabels.fontSizeRatio', def: 0.8, type: 'number', min: 0.1, max: 2, step: 0.1 },
    // { key: 'style.chart.grid.y.timeLabels.rotation', def: 0, type: 'number', min: -360, max: 360 },
    // { key: 'style.chart.grid.y.timeLabels.offsetY', def: 30, type: 'number', min: -100, max: 100 },
    // { key: 'style.chart.grid.y.timeLabels.color', def: '#1A1A1A', type: 'color' },
    // { key: 'style.chart.grid.y.timeLabels.modulo', def: 8, type: 'number', min: 1, max: 100},
    // { key: 'style.chart.grid.y.timeLabels.bold', def: true, type: 'checkbox'},

    { key: 'style.chart.grid.x.timeLabels.show', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.x.timeLabels.fontSizeRatio', def: 0.8, type: 'number', min: 0.1, max: 2, step: 0.1 },
    { key: 'style.chart.grid.x.timeLabels.rotation', def: 0, type: 'number', min: -360, max: 360 },
    { key: 'style.chart.grid.x.timeLabels.offsetY', def: 30, type: 'number', min: -100, max: 100 },
    { key: 'style.chart.grid.x.timeLabels.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.grid.x.timeLabels.modulo', def: 8, type: 'number', min: 1, max: 100},
    { key: 'style.chart.grid.x.timeLabels.bold', def: true, type: 'checkbox'},




    { key: 'style.chart.grid.x.showAxis', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.x.axisName', def: 'X AXIS', type: 'text' },
    { key: 'style.chart.grid.x.axisColor', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.grid.x.axisThickness', def: 2, type: 'number', min: 1, max: 12 },
    { key: 'style.chart.grid.x.horizontalLines.Show', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.x.horizontalLines.color', def: '#CCCCCC', type: 'color' },
    { key: 'style.chart.grid.x.horizontalLines.alternate', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.x.horizontalLines.opacity', def: 20, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.grid.zeroLine.show', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.zeroLine.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.grid.zeroLine.dashed', def: true, type: 'checkbox' },
    { key: 'style.chart.line.plots.show', def: false, type: 'checkbox' },
    { key: 'style.chart.line.plots.radiusRatio', def: 1, type: 'number', min: 0.1, max: 3, step: 0.1 },

    { key: 'style.chart.bar.gradient.show', def: false, type: 'checkbox'},

    { key: 'style.chart.area.opacity', def: 30, type: 'number', min: 10, max: 100 },
    { key: 'style.chart.dataLabels.show', def: false, type: 'checkbox' },
    { key: 'style.chart.dataLabels.bold', def: true, type: 'checkbox' },
    { key: 'style.chart.dataLabels.fontSizeRatio', def: 1, type: 'number', min: 0.1, max: 2, step: 0.1 },
    { key: 'style.chart.dataLabels.useSerieColor', def: true, type: 'checkbox' },
    { key: 'style.chart.dataLabels.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.dataLabels.offsetY', def: -12, type: 'number', min: -100, max: 100 },
    { key: 'style.chart.paddingProportions.top', def: 0.1, type: 'number', min: 0, max: 3, step: 0.01 },
    { key: 'style.chart.paddingProportions.right', def: 0.05, type: 'number', min: 0, max: 3, step: 0.01 },
    { key: 'style.chart.paddingProportions.left', def: 0.1, type: 'number', min: 0, max: 3, step: 0.01 },
    { key: 'style.chart.paddingProportions.bottom', def: 0.1, type: 'number', min: 0, max: 3, step: 0.01 },
    { key: 'table.rounding', def: 1, type: 'number', min: 0, max: 6 },
    { key: 'table.responsiveBreakpoint', def: 400, type: 'number', min: 300, max: 800 },
    { key: 'table.columnNames.period', def: 'Period', type: 'text' },
    { key: 'table.columnNames.total', def: 'Total', type: 'text' },
    { key: 'table.th.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'table.th.color', def: '#1A1A1A', type: 'color' },
    { key: 'table.th.outline', def: 'none', type: 'text' },
    { key: 'table.td.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'table.td.color', def: '#1A1A1A', type: 'color' },
    { key: 'table.td.outline', def: 'none', type: 'text' },
    { key: 'table.show', def: false, type: 'checkbox' },
    { key: 'table.useDialog', def: true, type: 'checkbox' },

])
const step = ref(0)

const themeOptions = ref([
    "",
    "dark",
    "hack",
    "zen",
    "concrete",
    "default",
    "celebration",
    "celebrationNight"
])

const currentTheme = ref(themeOptions.value[1]);

const configTheme = computed(() => ({ theme: currentTheme.value }));

const monthValues = computed(() => {
    const yearStart = 2026
    const arr = []

    for (let i = 0; i < 200; i += 1) {
        const d = new Date(yearStart, i, 1)
        arr.push(d.getTime())
    }

    return arr
})

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        theme: currentTheme.value,
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                dataLabels: {
                    ...c.style.chart.dataLabels,
                    formatter: ({value, config}) => {
                        // console.log(config)
                        return `f | ${value}`
                    }
                },
                tooltip: {
                    ...c.style.chart.tooltip,
                    useDefaultTimeFormat: false,
                    timeFormat: 'yyyy-MM-dd'
                    // customFormat: ({ datapoint }) => {
                    //     return datapoint[0].name
                    // }
                },
                zoom: {
                    ...c.style.chart.zoom,
                    useDefaultFormat: false,
                    timeFormat: 'yyyy-MM',
                    // customFormat: (d) => {
                    //     console.log(d);
                    //     return 'T'
                    // }
                },
                grid: {
                    ...c.style.chart.grid,
                    x: {
                        ...c.style.chart.grid.x,
                        timeLabels: {
                            ...c.style.chart.grid.x.timeLabels,
                            values: [],
                            datetimeFormatter: {
                                enable: true,
                            }
                        }
                    },
                    y: {
                        ...c.style.chart.grid.y,
                        // Testing deprecated timeLabels on Y which was a mishap and was moved to x.
                        // Using them on Y still works, as it gets applied on X anyway; so to be backwards compatible.
                        // Any timeLabel config content placed in Y overrides the default config in X 
                        timeLabels: {
                            color: '#FF0000' 
                        }
                    }
                }
            }
        }
    }
})

// const basicCanvasConfig = ref({
//     style: {
//         chart: {
//             stacked: true,
//             stackGapRatio: 0.5,
//             dataLabels: {
//                 show: false
//             },
//             line: {
//                 plots: {
//                     show: false
//                 }
//             }
//         }
//     }
// })

const selectedX = ref(undefined);

function selectX({ datapoint, index, indexLabel}) {
    selectedX.value = index;
}

// onMounted(() => {
//     setTimeout(() => {
//         if (local.value) {
//             local.value.hideSeries('S0')
//             local.value.hideSeries('S1')
//         }
//     }, 3000)
//     setTimeout(() => {
//         if (local.value) {
//             local.value.showSeries('S0')
//             local.value.hideSeries('S2')
//         }
//     }, 4000)
// })

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <button @click="toggleLabels">TOGGLE LABELS</button>
    <button @click="toggleStack">TOGGLE STACK</button>
    <div style="margin: 12px 0; color: white">Z
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
        <LocalVueUiXyCanvas :key="`responsive_${step}`" :dataset="dataset" :config="{
            ...config,
            responsive: true,
        }">
            <template #chart-background>
                <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
            </template>
            <template #watermark="{ isPrinting }">
                <div v-if="isPrinting" style="font-size: 100px; opacity: 0.2; transform: rotate(-10deg)">
                    WATERMARK
                </div>
            </template>
            <template #source>
                <div style="width:100%;font-size:10px;text-align:left">
                    SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                </div>
            </template>  
        </LocalVueUiXyCanvas>
    </div>


    <Box comp="VueUiXyCanvas" :dataset="dataset">
        <template #title>VueUiXyCanvas</template>

        <template #theme>
            <LocalVueUiXyCanvas :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiXyCanvas @selectX="selectX" :selectedXIndex="selectedX" :dataset="dataset" :config="config" :key="`local_${step}`" ref="local">
                <template #optionPdf>
                    PRINT PDF
                </template>
            </LocalVueUiXyCanvas>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi @selectX="selectX" :selectedXIndex="selectedX" component="VueUiXyCanvas" :dataset="dataset" :config="config" :key="`VDUI-lodal_${step}`" ref="vduiLocal">

            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiXyCanvas :dataset="dataset" :config="config" :key="`build_${step}`" ref="build"></VueUiXyCanvas>
        </template>

        <template #build-treesh>
            <VueUiXyCanvasTreeshaken :dataset="dataset" :config="config" :key="`build_${step}`" ref="build"></VueUiXyCanvasTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiXyCanvas" :dataset="dataset" :config="config" :key="`VDUI_build_${step}`" ref="vduiBuild">
            </VueDataUi>
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

        <template #config>
            {{ config }}
        </template>
    </Box>
</template>