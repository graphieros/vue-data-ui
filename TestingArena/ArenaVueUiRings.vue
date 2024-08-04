<script setup>
import { ref, computed } from "vue";
import LocalVueUiRings from '../src/components/vue-ui-rings.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena()

const dataset = ref([
    {
        name: "Serie 1",
        values: [100]
    },
    {
        name: "Serie 2",
        values: [200]
    },
    {
        name: "Serie 3",
        values: [300, 1]
    },
    {
        name: "Serie 4",
        values: [50, 1]
    },
    {
        name: "Serie 5",
        values: [25, 1]
    }
])

const model = ref([
    { key: 'useCssAnimation', def: true, type: 'checkbox'},
    { key: 'useBlurOnHover', def: true, type: 'checkbox'},
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.labels.dataLabels.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.layout.labels.dataLabels.suffix', def: '2', type: 'text'},
    { key: 'style.chart.layout.rings.strokeWidth', def: 3, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.rings.stroke', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.layout.rings.gradient.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.rings.gradient.intensity', def: 40, type: 'range', min: 0, max: 100},
    { key: 'style.chart.layout.rings.gradient.underlayerColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.layout.rings.useShadow', def: true, type: 'checkbox'},
    { key: 'style.chart.legend.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.legend.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.legend.show', def: true, type: 'checkbox'},
    { key: 'style.chart.legend.fontSize', def: 14, type: 'number', min: 8, max: 48},
    { key: 'style.chart.legend.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.legend.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.legend.roundingPercentage', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.title.text', def: 'Lorem ipsum dolor sit amet', type: 'text'},
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 8, max: 48 },
    { key: 'style.chart.title.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sit amet'},
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
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'table.show', def: false, type: 'checkbox'},
    { key: 'table.responsiveBreakpoint', def: 400, type: 'number', min: 300, max: 800},
    { key: 'table.columnNames.series', def: 'Series', type: 'text'},
    { key: 'table.columnNames.value', def: 'Value', type: 'text'},
    { key: 'table.columnNames.percentage', def: 'Percentage', type: 'text'},
    { key: 'table.th.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.th.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.th.outline', def: 'none', type: 'text'},
    { key: 'table.td.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.td.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.td.outline', def: 'none', type: 'text'},
    { key: 'table.td.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'table.td.roundingPercentage', def: 2, type: 'number', min: 0, max: 12}
])

const testCustomTooltip = ref(false);

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default"
])

const currentTheme = ref(themeOptions.value[2])

const config = computed(() => {
    const c = convertArrayToObject(model.value);

    if (testCustomTooltip.value) {
        return {
            ...c,
            style: {
                ...c.style,
                chart: {
                    ...c.style.chart,
                    tooltip: {
                        ...c.style.chart.tooltip,
                        customFormat: ({ datapoint }) => {
                            console.log({datapoint})
                            return 'test'
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
})

function selectLegend(legend) {
    console.log({legend})
}

const step = ref(0)

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
    <Box>
        <template #title>VueUiRings</template>

        <template #local>
            <LocalVueUiRings :dataset="dataset" :config="config" :key="`local_${step}`" @selectLegend="selectLegend" ref="local">
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
            </LocalVueUiRings>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiRings" :dataset="dataset" :config="config" :key="`vdui_local_${step}`" @selectLegend="selectLegend" ref="vduiLocal">
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
            <VueUiRings :dataset="dataset" :config="config" :key="`build_${step}`" @selectLegend="selectLegend" ref="build">
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
            </VueUiRings>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiRings" :dataset="dataset" :config="config" :key="`vdui_build_${step}`" @selectLegend="selectLegend" ref="vduiBuild">
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