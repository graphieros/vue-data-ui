<script setup>
import { ref, computed } from "vue";
import LocalVueUiVerticalBar from '../src/components/vue-ui-vertical-bar.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild, toggleTable, toggleSort } = useArena()

const dataset = ref([
    {
        name: "Serie 1",
        value: 100.987987,
        children: [
            {
                name: "serie 1 child 1",
                value: 80
            },
            {
                name: "serie 1 child 2",
                value: 20
            },
        ]
    },
    {
        name: "Serie 2",
        value: 345,
    },
    {
        name: "Serie 3",
        value: 210,
    },
    {
        name: "Serie 4",
        value: 188,
    },
    {
        name: "Serie 5",
        value: 120,
        children: [
            {
                name: "Serie 5 child 1",
                value: 60.1234,
            },
            {
                name: "Serie 5 child 2",
                value: 20,
            },
            {
                name: "Serie 5 child 3",
                value: 40,
            },
        ]
    }
]);

const model = ref([
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.table', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.sort', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'useCssAnimation', def: true, type: 'checkbox'},
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.bars.sort', def: 'desc', type: 'select', options: ['asc', 'desc']},
    { key: 'style.chart.layout.bars.useStroke', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.bars.strokeWidth', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.bars.height', def: 32, type: 'number', min: 12, max: 64},
    { key: 'style.chart.layout.bars.gap', def: 6, type: 'number', min: 0, max: 24},
    { key: 'style.chart.layout.bars.borderRadius', def: 4, type: 'range', min: 0, max: 48}, // IDEA: max could be based on height to always be harmonious
    { key: 'style.chart.layout.bars.offsetX', def: 64, type: 'number', min: 0, max: 100},
    { key: 'style.chart.layout.bars.paddingRight', def: 0, type: 'number', min: 0, max: 100},
    { key: 'style.chart.layout.bars.useGradient', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.bars.gradientIntensity', def: 20, type: 'range', min:0, max: 100},
    { key: 'style.chart.layout.bars.fillOpacity', def: 90, type: 'range', min: 0, max: 100}, // UNUSED ?
    { key: 'style.chart.layout.bars.underlayerColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.layout.bars.dataLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.bars.dataLabels.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.bars.dataLabels.fontSize', def: 12, type: 'range', min: 8, max: 48},
    { key: 'style.chart.layout.bars.dataLabels.value.show', def: true, type: 'checkbox'}, // ISSUE: can't just show percentage as false nukes it all
    { key: 'style.chart.layout.bars.dataLabels.value.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.bars.dataLabels.value.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.layout.bars.dataLabels.value.suffix', def: 'S', type: 'text'},
    { key: 'style.chart.layout.bars.dataLabels.percentage.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.bars.dataLabels.percentage.roundingPercentage', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.bars.dataLabels.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.bars.nameLabels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.bars.nameLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.bars.nameLabels.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.bars.nameLabels.fontSize', def: 10, type: 'range', min: 8, max: 48},
    { key: 'style.chart.layout.bars.nameLabels.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.bars.parentLabels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.bars.parentLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.bars.parentLabels.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.bars.parentLabels.fontSize', def: 10, type: 'range', min: 8, max: 48},
    { key: 'style.chart.layout.bars.parentLabels.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.highlighter.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.highlighter.opacity', def: 5, type: 'range', min: 0, max: 100},
    { key: 'style.chart.layout.separators.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.separators.color', def: '#e1e5e8', type: 'color'},
    { key: 'style.chart.layout.separators.strokeWidth', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 8, max: 48},
    { key: 'style.chart.title.text', def: 'Lorem ipsum dolor sic amet', type: 'text'},
    { key: 'style.chart.title.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sic amet', type: 'text'},
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'style.chart.legend.position', def: 'top', type: 'select', options: ['top', 'bottom']},
    { key: 'style.chart.legend.show', def: true, type: 'checkbox' },
    { key: 'style.chart.legend.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.legend.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.legend.fontSize', def: 16, type: 'number', min: 6, max: 42 },
    { key: 'style.chart.legend.bold', def: false, type: 'checkbox' },
    { key: 'style.chart.legend.roundingValue', def: 0, type: 'number', min: 0, max: 6 },
    { key: 'style.chart.legend.roundingPercentage', def: 0, type: 'number', min: 0, max: 6 },
    { key: 'style.chart.legend.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.legend.suffix', def: 'S', type: 'text'},
    { key: 'style.chart.tooltip.show', def: true, type: 'checkbox' },
    { key: 'style.chart.tooltip.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.tooltip.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.tooltip.fontSize', def: 14, type: 'number', min: 6, max: 24 },
    { key: 'style.chart.tooltip.showValue', def: true, type: 'checkbox' },
    { key: 'style.chart.tooltip.showPercentage', def: true, type: 'checkbox' },
    { key: 'style.chart.tooltip.roundingValue', def: 0, type: 'number', min: 0, max: 6},
    { key: 'style.chart.tooltip.showPercentage', def: true, type: 'checkbox' },
    { key: 'style.chart.tooltip.roundingPercentage', def: 0, type: 'number', min: 0, max: 6 },
    { key: 'style.chart.tooltip.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.tooltip.suffix', def: 'S', type: 'text'},
    { key: 'table.show', def: false, type: 'checkbox'},
    { key: 'table.responsiveBreakpoint', def: 400, type: 'number', min: 300, max: 800},
    { key: 'table.th.backgroundColor', def: '#FFFFFF', type: 'color', label: 'backgroundColorHeader', category: 'table' },
    { key: 'table.th.color', def: '#1A1A1A', type: 'color', label: 'textColorHeader', category: 'table' },
    { key: 'table.th.outline', def: 'none', type: 'text', label: 'outlineHeader', category: 'table' },
    { key: 'table.td.backgroundColor', def: '#FFFFFF', type: 'color', label: 'backgroundColorRow', category: 'table' },
    { key: 'table.td.color', def: '#1A1A1A', type: 'color', label: 'textColorRow', category: 'table' },
    { key: 'table.td.outline', def: 'none', type: 'text', label: 'outlineRow', category: 'table' },
    { key: 'table.td.roundingValue', def: 0, type: 'number', min: 0, max: 6, label: ['rounding', 'is', 'value'], category: 'table' },
    { key: 'table.td.roundingPercentage', def: 0, type: 'number', min: 0, max: 6, label: ['rounding', 'is', 'percentage'], category: 'table' },
    { key: 'table.td.prefix', def: 'P', type: 'text'},
    { key: 'table.td.suffix', def: 'S', type: 'text'},
])

const testCustomTooltip = ref(false);

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default"
])

const currentTheme = ref(themeOptions.value[3])

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
    console.log({ legend })
}

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <button @click="toggleSort">TOGGLE SORT</button>
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
        <template #title>VueUiVerticalBar</template>

        <template #local>
            <LocalVueUiVerticalBar :dataset="dataset" :config="config" :key="`local_${step}`" @selectLegend="selectLegend" ref="local">
                <template #optionSort>
                    SORT
                </template>
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #dataLabel="{ datapoint, isBlur, isVisible, isSafari, textAlign, flexAlign, percentage }">
                    <div :style="`background:${datapoint.color}`">
                        {{ datapoint.name }} : {{ percentage }}
                    </div>
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
            </LocalVueUiVerticalBar>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiVerticalBar" :dataset="dataset" :config="config" :key="`VDUI-lodal_${step}`" @selectLegend="selectLegend" ref="vduiLocal">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #dataLabel="{ datapoint, isBlur, isVisible, isSafari, textAlign, flexAlign, percentage }">
                    <div :style="`background:${datapoint.color}`">
                        {{ datapoint.name }} : {{ percentage }}
                    </div>
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
            <VueUiVerticalBar :dataset="dataset" :config="config" :key="`build_${step}`" @selectLegend="selectLegend" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #dataLabel="{ datapoint, isBlur, isVisible, isSafari, textAlign, flexAlign, percentage }">
                    <div :style="`background:${datapoint.color}`">
                        {{ datapoint.name }} : {{ percentage }}
                    </div>
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
            </VueUiVerticalBar>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiVerticalBar" :dataset="dataset" :config="config" :key="`VDUI-build_${step}`" @selectLegend="selectLegend" ref="vduiBuild">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #dataLabel="{ datapoint, isBlur, isVisible, isSafari, textAlign, flexAlign, percentage }">
                    <div :style="`background:${datapoint.color}`">
                        {{ datapoint.name }} : {{ percentage }}
                    </div>
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