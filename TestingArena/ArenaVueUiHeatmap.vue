<script setup>
import { ref, computed } from "vue";
import LocalVueUiHeatmap from '../src/components/vue-ui-heatmap.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena()

function makeDs() {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const arr = [];
    const dsLen = 26;
    const serieLen = days.length;
    for (let i = 0; i < serieLen; i += 1) {
        const values = [];
        for (let j = 0; j < dsLen; j += 1) {
        values.push((i + j * 2))
        }
        arr.push({
            name: `${days[i]}`,
            values
        })
    }
    return arr
}

const dataset = ref(makeDs())

const alternateDataset = computed(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const arr = [];
    const dsLen = 12;
    const serieLen = days.length;
    for (let i = 0; i < serieLen; i += 1) {
        const values = [];
        for (let j = 0; j < dsLen; j += 1) {
        values.push((i + j * 2))
        }
        arr.push({
            name: `${days[i]}`,
            values
        })
    }
    return arr
});

const alternateConfig = ref({
    table: {
        th: {
            backgroundColor: '#00FF00'
        }
    },
    style: {
        backgroundColor: '#FF0000',
        title: {
            text: 'Alternate'
        }
        
    }
})

const isPropsToggled = ref(false);
function toggleProps() {
    isPropsToggled.value = !isPropsToggled.value;
}

function alterDataset() {
    dataset.value.push({
        name: 'Alt',
        values: [1, 2, 3]
    })
}

const model = ref([
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.table', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox' },
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right']},
    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},
    
    { key: 'style.fontFamily', def: "inherit", type: 'text'},
    { key: 'style.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.layout.padding.top', def: 36, type: 'number', min: 0, max: 100},
    { key: 'style.layout.padding.right', def: 12, type: 'number', min: 0, max: 100},
    { key: 'style.layout.padding.bottom', def: 12, type: 'number', min: 0, max: 100},
    { key: 'style.layout.padding.left', def: 48, type: 'number', min: 0, max: 100},
    { key: 'style.layout.cells.height', def: 36, type: 'number', min: 12, max: 64},
    { key: 'style.layout.cells.value.show', def: true, type: 'checkbox'},
    { key: 'style.layout.cells.value.fontSize', def: 18, type: 'number', min: 8, max: 48},
    { key: 'style.layout.cells.value.bold', def: false, type: 'checkbox'},
    { key: 'style.layout.cells.value.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.layout.cells.value.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.layout.cells.colors.hot', def: '#dc3912', type: 'color'},
    { key: 'style.layout.cells.colors.cold', def: '#3366cc', type: 'color'},
    { key: 'style.layout.cells.colors.underlayer', def: '#FFFFFF', type: 'color'},
    { key: 'style.layout.cells.spacing', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.layout.cells.selected.border', def: 4, type: 'number', min: 0, max: 12}, //
    { key: 'style.layout.cells.selected.color', def: '#1A1A1A', type: 'color'},

    { key: 'style.layout.cells.rowTotal.value.show', def: true, type: 'checkbox'},
    { key: 'style.layout.cells.rowTotal.color.show', def: true, type: 'checkbox'},

    { key: 'style.layout.cells.columnTotal.value.show', def: true, type: 'checkbox'},
    { key: 'style.layout.cells.columnTotal.value.rotation', def: 0, type: 'range', min: -90, max: 90 },
    { key: 'style.layout.cells.columnTotal.value.offsetX', def: 0, type: 'number', min: -30, max: 30},
    { key: 'style.layout.cells.columnTotal.value.offsetY', def: 0, type: 'number', min: -30, max: 30},
    { key: 'style.layout.cells.columnTotal.color.show', def: true, type: 'checkbox'},

    { key: 'style.layout.dataLabels.prefix', def: 'P', type: 'text'},
    { key: 'style.layout.dataLabels.suffix', def: 'S', type: 'text'},
    { key: 'style.layout.dataLabels.xAXis.show', def: true, type: 'checkbox'},
    { key: 'style.layout.dataLabels.xAxis.fontSize', def: 8, type: 'number', min: 8, max: 24},
    { key: 'style.layout.dataLabels.xAxis.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.layout.dataLabels.xAxis.bold', def: false, type: 'checkbox'},
    { key: 'style.layout.dataLabels.xAxis.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.layout.dataLabels.xAxis.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.layout.dataLabels.xAxis.showOnlyAtModulo', def: null, type: 'number', min: 2, max: 24},
    { key: 'style.layout.dataLabels.xAxis.rotation', def: -45, type: 'number', min: -90, max: 0},

    { key: 'style.layout.dataLabels.yAxis.show', def: true, type: 'checkbox'},
    { key: 'style.layout.dataLabels.yAxis.fontSize', def: 8, type: 'number', min: 8, max: 24},
    { key: 'style.layout.dataLabels.yAxis.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.layout.dataLabels.yAxis.bold', def: false, type: 'checkbox'},
    { key: 'style.layout.dataLabels.yAxis.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.layout.dataLabels.yAxis.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.title.text', def: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis', type: 'text'},
    { key: 'style.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.title.fontSize', def: 20, type: 'range', min: 8, max: 48},
    { key: 'style.title.bold', def: true, type: 'checkbox'},
    { key: 'style.title.subtitle.text', def:'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis', type: 'text'},
    { key: 'style.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.title.subtitle.fontSize', def: 16, type: 'range', min: 8, max: 48},
    { key: 'style.title.subtitle.bold', def: false, type: 'checkbox'},
    { key: 'style.legend.show', def: true, type: 'checkbox'},
    { key: 'style.legend.bold', def: true, type: 'checkbox'},
    { key: 'style.legend.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.legend.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.legend.fontSize', def: 12, type: 'range', min: 8, max: 48},
    { key: 'style.legend.roundingValue', def: 2, type: 'range', min: 0, max: 12},
    { key: 'style.legend.position', def: 'right', type: 'select', options: ['right', 'bottom']},
    { key: 'style.legend.scaleBorderRadius', def: 18, type: 'number', min: 0, max: 48},

    { key: 'style.tooltip.show', def: true, type: 'checkbox'},
    { key: 'style.tooltip.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.tooltip.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.tooltip.fontSize', def: 12, type: 'range', min: 8, max: 48},
    { key: 'style.tooltip.roundingValue', def: 0, type: 'range', min: 0, max: 12},
    { key: 'style.tooltip.backgroundOpacity', def: 100, type: 'range', min: 0, max: 100},
    { key: 'style.tooltip.position', def: 'center', type: 'select', options: ['left', 'center', 'right']},
    { key: 'style.tooltip.offsetY', def: 24, type: 'number', min: 0, max: 48},

    { key: 'table.show', def: false, type: 'checkbox'},
    { key: 'table.responsiveBreakpoint', def: 400, type: 'number', min: 300, max: 800},
    { key: 'table.colNames.xAxis', def: 'X AXIS', type: 'text'},
    { key: 'table.th.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.th.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.th.outline', def: 'none', type: 'text'},
    { key: 'table.td.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.td.color', def: ' #1A1A1A', type: 'color'},
    { key: 'table.td.outline', def: 'none', type: 'text'},
    { key: 'table.td.roundingValue', def: 0, type: 'range', min: 0, max: 12},
])

const testCustomTooltip = ref(false);

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
    if(testCustomTooltip.value) {
        return {
            ...c,
            style: {
                ...c.style,
                tooltip: {
                    ...c.style.tooltip,
                    customFormat: ({ datapoint }) => {
                        let html = '';
                        return "test"
                    }
                }
            }

        }
    } else {
        return {
            ...c,
            theme: currentTheme.value,
            style: {
                ...c.style,
                layout: {
                    ...c.style.layout,
                    cells: {
                        ...c.style.layout.cells,
                        value: {
                            ...c.style.layout.cells.value,
                            // formatter: ({value, config}) => {
                            //     return `f - ${value}`
                            // }
                        }
                    },
                    dataLabels: {
                        ...c.style.layout.dataLabels,
                        xAxis: {
                            ...c.style.layout.dataLabels.xAxis,
                            values: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 24, 24, 25]
                        }
                    }
                },
            }
        }
    }
});

const step = ref(0)


</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <button @click="toggleProps">TOGGLE PROPS: {{ isPropsToggled }}</button>
    <button @click="alterDataset">ALTER DATASET</button>

    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>
    <div style="margin: 12px 0">
        <input type="checkbox" v-model="testCustomTooltip" id="custom-tooltip" />
        <label for="custom-tooltip" style="color:#CCCCCC">Test custom tooltip</label>
    </div>
    <Box comp="VueUiHeatmap" :dataset="dataset">
        <template #title>VueUiHeatmap</template>
        
        <template #local>
            <LocalVueUiHeatmap :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" ref="local">
                <!-- <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template> -->

                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template>
                <template #source>
                    <div style="width:100%;font-size:10px;text-align:left">
                        SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                    </div>
                </template>
            </LocalVueUiHeatmap>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiHeatmap" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`" ref="vduiLocal">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiHeatmap :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </VueUiHeatmap>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiHeatmap" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`" ref="vduiBuild">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template>
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </VueDataUi>
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