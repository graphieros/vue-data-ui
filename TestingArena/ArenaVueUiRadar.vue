<script setup>
import { ref, computed } from "vue";
import LocalVueUiRadar from '../src/components/vue-ui-radar.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena()

const dataset = ref({
    categories: [
        { name: 'Category 1'},
        { name: 'Category 2'},
        { name: 'Category 3'},
    ],
    series: [
        {
            name: 'Serie 1',
            values: [60, 20, 30],
            target: 100,
            formatter: ({value}) => {
                return `f1 - ${value}`
            }
        },
        {
            name: 'Serie 2',
            values: [20, 80, 40],
            target: 100,
            formatter: ({value}) => {
                return `f2 - ${value}`
            }
        },
        {
            name: 'Serie 3',
            values: [50, 60, 70],
            target: 100
        }
    ]
})

const alternateDataset = ref({
    categories: [
        { name: 'Category 1'},
        { name: 'Category 2'},
        { name: 'Category 3'},
    ],
    series: [
        {
            name: 'Serie 1',
            values: [20, 20, 20],
            target: 100,
            formatter: ({value}) => {
                return `f1 - ${value}`
            }
        },
        {
            name: 'Serie 2',
            values: [30, 30, 30],
            target: 100,
            formatter: ({value}) => {
                return `f2 - ${value}`
            }
        },
        {
            name: 'Serie 3',
            values: [40, 40, 40],
            target: 100
        }
    ]
})

const alternateConfig = ref({
    table: {
        th: {
            backgroundColor: '#00FF00'
        }
    },
    style: {
        chart: {
            backgroundColor: '#FF0000',
            title: {
                text: 'Alternate'
            }
        }
    }
})

const isPropsToggled = ref(false);
function toggleProps() {
    isPropsToggled.value = !isPropsToggled.value;
}

function alterDataset() {
    dataset.value.series.push({
        name: 'Serie 4',
            values: [10, 10, 10],
            target: 100
    })
}


const model = ref([
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'userOptions.show', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.table', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox' },
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right']},
    
    { key: 'useCssAnimation', def: true, type: 'checkbox'},
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF20', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.plots.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.plots.radius', def: 2, type: 'range', min: 0, max: 24},
    { key: 'style.chart.layout.outerPolygon.stroke', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.layout.outerPolygon.strokeWidth', def: 1, type: 'range', min: 0, max: 12},
    { key: 'style.chart.layout.dataPolygon.strokeWidth', def: 1, type: 'range', min: 0, max: 12},
    { key: 'style.chart.layout.dataPolygon.transparent', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.dataPolygon.opacity', def: 20, type: 'range', min: 0, max: 100},
    { key: 'style.chart.layout.dataPolygon.useGradient', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.grid.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.grid.stroke', def: '#e1e5e8', type: 'color'},
    { key: 'style.chart.layout.grid.strokeWidth', def: 0.5, type: 'range', min: 0, max: 12, step: 0.5},
    { key: 'style.chart.layout.grid.graduations', def: 5, type: 'range', min: 2, max: 20},
    { key: 'style.chart.layout.labels.dataLabels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.dataLabels.fontSize', def: 12, type: 'range', min: 8, max: 48},
    { key: 'style.chart.layout.labels.dataLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.text', def: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis', type: 'text'},
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.fontSize', def: 20, type: 'range', min: 8, max: 48},
    { key: 'style.chart.title.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.title.subtitle.text', def:'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis', type: 'text'},
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'range', min: 8, max: 48},
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox'},

    { key: 'style.chart.tooltip.show', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.backgroundColor', def: "#FFFFFF", type: 'color'},
    { key: 'style.chart.tooltip.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.tooltip.fontSize', def: 14, type: 'range', min: 6, max: 48},
    { key: 'style.chart.tooltip.showValue', def: true, type: 'checkbox'}, // FIXME not applied
    { key: 'style.chart.tooltip.showPercentage', def: true, type: 'checkbox'}, // FIXME not applied
    { key: 'style.chart.tooltip.roundingValue', def: 2, type: 'range', min: 0, max: 12},
    { key: 'style.chart.tooltip.roundingPercentage', def: 2, type: 'range', min: 0, max: 12},
    { key: 'style.chart.tooltip.animation.show', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.animation.animationFrames', def: 60, type: 'range', min: 0, max: 1000},
    { key: 'style.chart.tooltip.backgroundOpacity', def: 100, type: 'range', min: 0, max: 100},
    { key: 'style.chart.tooltip.position', def: 'center', type: 'select', options: ['left', 'center', 'right']},
    { key: 'style.chart.tooltip.offsetY', def: 24, type: 'number', min: 0, max: 48},

    { key: 'style.chart.legend.show', def: true, type: 'checkbox'},
    { key: 'style.chart.legend.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.legend.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.legend.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.legend.fontSize', def: 14, type: 'range', min: 8, max: 48},
    { key: 'style.chart.legend.roundingPercentage', def: 2, type: 'range', min: 0, max: 12},
    { key: 'table.show', def: false, type: 'checkbox'},
    { key: 'table.responsiveBreakpoint', def: 400, type: 'range', min: 300, max: 800},
    { key: 'table.th.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.th.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.th.outline', def: 'none', type: 'text'},
    { key: 'table.td.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.td.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.td.outline', def: 'none', type: 'text'},
    { key: 'table.td.roundingValue', def: 2, type: 'range', min: 0, max: 12},
    { key: 'table.td.roundingPercentage', def: 2, type: 'range', min: 0, max: 12},
])

const testCustomTooltip = ref(false);

const themeOptions = ref([
    "hack",
    "zen",
    "concrete",
    "default"
])

const currentTheme = ref(themeOptions.value[4])

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    if(testCustomTooltip.value) {
        return {
            ...c,
            style: {
                ...c.style,
                chart: {
                    ...c.style.chart,
                    tooltip: {
                        ...c.style.chart.tooltip,
                        customFormat: ({ datapoint }) => {
                            let html = '';
                            console.log(datapoint);
                            return "test"
                        }
                    }
                }
            }

        }
    } else {
        return {
            ...c,
            theme: currentTheme.value,
            customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
        }
    }
});

const step = ref(0)

function selectLegend(legend) {
    console.log({legend})
}

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

    <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
        <LocalVueUiRadar :key="`responsive_${step}`" :dataset="dataset" :config="{
            ...config,
            responsive: true
        }">
        <template #watermark="{ isPrinting }">
            <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                WATERMARK
            </div>
        </template>     
    </LocalVueUiRadar>
    </div>

    <Box comp="VueUiRadar" :dataset="isPropsToggled ? alternateDataset : dataset">
        <template #title>VueUiRadar</template>

        <template #local>
            <LocalVueUiRadar :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" @selectLegend="selectLegend" ref="local">
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d39240" />
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
            </LocalVueUiRadar>
        </template>
        
        <template #VDUI-local>
            <LocalVueDataUi component="VueUiRadar" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`" @selectLegend="selectLegend" ref="vduiLocal">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d39240" />
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
            <VueUiRadar :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" @selectLegend="selectLegend" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d39240" />
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
            </VueUiRadar>
        </template>
        
        <template #VDUI-build>
            <VueDataUi component="VueUiRadar" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`" @selectLegend="selectLegend" ref="vduiBuild">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d39240" />
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