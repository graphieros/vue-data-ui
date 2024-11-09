<script setup>
import { ref, computed } from "vue";
import LocalVueUiGalaxy from '../src/components/vue-ui-galaxy.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena()

const dataset = ref([
    {
        name: "Series 1",
        values: [100]
    },
    {
        name: "Series 2",
        values: [200]
    },
    {
        name: "Series 1",
        values: [300, 1]
    },
])

const model = ref([
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.table', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'useCssAnimation', def: true, type: 'checkbox'},
    { key: 'useBlurOnHover', def: true, type: 'checkbox'},
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF20', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.arcs.strokeWidth', def: 24, type: 'number', min: 2, max: 48},
    { key: 'style.chart.layout.arcs.borderWidth', def: 12, type: 'number', min: 1, max: 24},
    { key: 'style.chart.layout.arcs.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.arcs.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.arcs.hoverEffect.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.arcs.hoverEffect.multiplicator', def: 1.1, type: 'number', min: 1, max: 2, step: 0.05},
    { key: 'style.chart.layout.arcs.gradient.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.arcs.gradient.intensity', def: 30, type: 'range', min: 0, max: 100},
    { key: 'style.chart.layout.arcs.gradient.color', def: '#FFFFFF20', type: 'color'},
    { key: 'style.chart.layout.labels.dataLabels.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.layout.labels.dataLabels.suffix', def: 'S', type: 'text'},
    { key: 'style.chart.legend.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.legend.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.legend.show', def: true, type: 'checkbox'},
    { key: 'style.chart.legend.fontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'style.chart.legend.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.legend.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.legend.roundingPercentage', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.title.text', def: 'Lorem ipsum dolor sit amet', type: 'text'},
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 8, max: 48},
    { key: 'style.chart.title.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type:'color'},
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sit amet', type: 'text'},
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox'},

    { key: 'style.chart.tooltip.show', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.tooltip.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.tooltip.fontSize', def: 14, type: 'number', min: 8, max: 48},
    { key: 'style.chart.tooltip.showValue', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.showPercentage', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.tooltip.roundingPercentage', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.tooltip.backgroundOpacity', def: 100, type: 'range', min: 0, max: 100},
    { key: 'style.chart.tooltip.position', def: 'center', type: 'select', options: ['left', 'center', 'right']},
    { key: 'style.chart.tooltip.offsetY', def: 24, type: 'number', min: 0, max: 48},

    { key: 'table.show', def: false, type: 'checkbox'},
    { key: 'table.responsiveBreakpoint', def: 300, type: 'number', min: 300, max: 800},
    { key: 'table.th.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.th.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.th.outline', def: 'none', type: 'text'},
    { key: 'table.td.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.td.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.td.outline', def: 'none', type: 'text'},
    { key: 'table.td.roundingValue', def: 2, type: 'number', min:0, max: 12},
    { key: 'table.td.roundingPercentage', def: 2, type: 'number', min:0, max: 12},
])

const testCustomTooltip = ref(false);

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default"
])

const currentTheme = ref(themeOptions.value[4])

const config = computed(() => {
    const c = convertArrayToObject(model.value)

    if (testCustomTooltip.value) {
        return {
            ...c,
            style: {
                ...c.style,
                chart: {
                    ...c.style.chart,
                    tooltip: {
                        ...c.style.chart.tooltip,
                        customFormat: (data) => {
                            console.log('GALAXY CUSTOM TOOLTIP', data)
                            return 'CUSTOM TOOLTIP'
                        }
                    }
                }
            }
        }
    } else {
        return {
            ...c,
            style: {
                ...c.style,
                chart: {
                    ...c.style.chart,
                    layout: {
                        ...c.style.chart.layout,
                        labels: {
                            ...c.style.chart.layout.labels,
                            dataLabels: {
                                ...c.style.chart.layout.labels.dataLabels,
                                formatter: ({value, config}) => {
                                    console.log(config)
                                    return `f | ${value}`
                                }
                            }
                        }
                    }
                }
            },
            theme: currentTheme.value,
            customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
        }
    }
})

const step = ref(0)

function selectLegend(legend) {
    console.log({ legend })
}

function selectDatapoint(datapoint) {
    console.log({ datapoint })
}

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
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
    <Box comp="VueUiGalaxy" :dataset="dataset">
        <template #title>VueUiGalaxy</template>

        <template #local>
            <LocalVueUiGalaxy :dataset="dataset" :config="config" :key="`local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="local">
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
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
            </LocalVueUiGalaxy>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiGalaxy" :dataset="dataset" :config="config" :key="`vdui_local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="vduiLocal">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
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
            <VueUiGalaxy :dataset="dataset" :config="config" :key="`build_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
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
            </VueUiGalaxy>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiGalaxy" :dataset="dataset" :config="config" :key="`vdui_build_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="vduiBuild">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
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