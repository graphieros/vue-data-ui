<script setup>
import { ref, computed } from "vue";
import LocalVueUiOnion from '../src/components/vue-ui-onion.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena()

const dataset = ref([
    {
        name: "Serie 1",
        percentage: 50,
        value: 1200,
    },
    {
        name: "Serie 2",
        percentage: 50,
        value: 1000,
    },
    {
        name: "Serie 3",
        percentage: 50,
        value: 500
    },
    {
        name: "Serie 4",
        percentage: 50,
        value: 1280
    }
])

function mutate() {
    dataset.value[0].percentage = Math.random() * 100
    dataset.value[1].percentage = Math.random() * 100
    dataset.value[2].percentage = Math.random() * 100
    dataset.value[3].percentage = Math.random() * 100
}

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

const model = ref([
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.table', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right']},
    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},
    
    { key: 'useCssAnimation', def: true, type: 'checkbox' },
    { key: 'useStartAnimation', def: true, type: 'checkbox'},
    { key: 'useBlurOnHover', def: true, type: 'checkbox'},
    { key: 'style.fontFamily', def: 'inherit', type: 'text', label: "fontFamily", category: 'general' },
    { key: 'style.chart.backgroundColor', def: '#FFFFFF20', type: 'color', label: 'backgroundColor', category: 'general' },
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'general' },
    { key: 'style.chart.useGradient', def: true, type: 'checkbox', label: 'useGradient', category: 'general' },
    { key: 'style.chart.gradientIntensity', def: 20, min: 10, max: 40, type: 'range', label: 'gradientIntensity', category: 'general' },
    { key: 'style.chart.layout.gutter.color', def: '#e1e5e820', type: 'color'},
    { key: 'style.chart.layout.gutter.width', def: 0.62, type: 'range', min: 0.1, max: 1, step: 0.01},
    { key: 'style.chart.layout.track.width', def: 0.62, type: 'range', min: 0.1, max: 1, step: 0.01},
    { key: 'style.chart.layout.labels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.fontSize', def: 14, type: 'number', min: 8, max: 48},
    { key: 'style.chart.layout.labels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.labels.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.labels.roundingPercentage', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.labels.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.labels.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.labels.value.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.percentage.show', def: true, type: 'checkbox'},
    { key: 'style.chart.title.text', def: 'Lorem ipsum dolor sic amet', type: 'text', label: 'textContent', category: 'title' },
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'title' },
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 6, max: 48, label: 'fontSize', category: 'title' },
    { key: 'style.chart.title.bold', def: true, type: 'checkbox', label: 'bold', category: 'title' },
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sic amet', type: 'text', label: 'textContent', category: 'subtitle' },
    { key: 'style.chart.title.subtitle.color', def: '#A1A1A1', type: 'color', label: 'textColor', category: 'subtitle' },
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'number', min: 6, max: 42, label: 'fontSize', category: 'subtitle' },
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox', label: 'bold', category: 'subtitle' },
    { key: 'style.chart.legend.show', def: true, type: 'checkbox', label: 'show', category: 'legend' },
    { key: 'style.chart.legend.backgroundColor', def: '#FFFFFF', type: 'color', label: 'backgroundColor', category: 'legend' },
    { key: 'style.chart.legend.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'legend' },
    { key: 'style.chart.legend.fontSize', def: 16, type: 'number', min: 6, max: 42, label: 'fontSize', category: 'legend' },
    { key: 'style.chart.legend.bold', def: false, type: 'checkbox', label: 'bold', category: 'legend' },
    { key: 'style.chart.legend.roundingValue', def: 0, type: 'number', min: 0, max: 6, label: ['rounding', 'is', 'value'], category: 'legend' },
    { key: 'style.chart.legend.roundingPercentage', def: 0, type: 'number', min: 0, max: 6, label: 'percentageRounding', category: 'legend' },
    { key: 'style.chart.legend.offsetY', def: 0, type: 'number', min: -100, max: 100}, // DEPRECATED (used with useDiv set to false)

    { key: 'style.chart.tooltip.show', def: true, type: 'checkbox' },
    { key: 'style.chart.tooltip.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.tooltip.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.tooltip.fontSize', def: 14, type: 'number', min: 6, max: 24 },
    { key: 'style.chart.tooltip.showValue', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.roundingValue', def: 0, type: 'number', min: 0, max: 6},
    { key: 'style.chart.tooltip.roundingPercentage', def: 0, type: 'number', min: 0, max: 6 },
    { key: 'style.chart.tooltip.showPercentage', def: true, type: 'checkbox' },
    { key: 'style.chart.tooltip.roundingPercentage', def: 0, type: 'number', min: 0, max: 6},
    { key: 'style.chart.tooltip.backgroundOpacity', def: 100, type: 'range', min: 0, max: 100},
    { key: 'style.chart.tooltip.position', def: 'center', type: 'select', options: ['left', 'center', 'right']},
    { key: 'style.chart.tooltip.offsetY', def: 24, type: 'number', min: 0, max: 48},

    { key: 'table.show', def: false, type: 'checkbox', label: 'show', category: 'table' },
    { key: 'table.responsiveBreakpoint', def: 400, type: 'number', min: 300, max: 800 },
    { key: 'table.th.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'table.th.color', def: '#1A1A1A', type: 'color' },
    { key: 'table.th.outline', def: 'none', type: 'text' },
    { key: 'table.td.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'table.td.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.td.outline', def: 'none', type: 'text' },
    { key: 'table.td.roundingValue', def: 0, type: 'number', min: 0, max: 6 },
    { key: 'table.td.roundingPercentage', def: 0, type: 'number', min: 0, max: 6 },
    { key: 'table.translations.value', def: 'Value', type: 'text'},
    { key: 'table.translations.percentage', def: 'Percentage', type: 'text'},
    { key: 'table.translations.serie', def: 'Serie', type: 'text'}
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

const currentTheme = ref(themeOptions.value[6])

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
            style: {
                ...c.style,
                chart: {
                    ...c.style.chart,
                    layout: {
                        ...c.style.chart.layout,
                        labels: {
                            ...c.style.chart.layout.labels,
                            value: {
                                ...c.style.chart.layout.labels.value,
                                formatter: ({value}) => {
                                    return `f - ${value}`
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
});

function selectLegend(legend) {
    console.log({ legend })
}

const step = ref(0)

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <button @click="mutate">MUTATE</button>
    <button @click="toggleProps">TOGGLE PROPS: {{ isPropsToggled }}</button>

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
        <LocalVueUiOnion :key="`responsive_${step}`" :dataset="dataset" :config="{
            ...config,
            responsive: true
        }">
        <template #chart-background>
            <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
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
    </LocalVueUiOnion>
    </div>

    <Box comp="VueUiOnion" :dataset="dataset">
        <template #title>VueUiOnion</template>

        <template #local>
            <LocalVueUiOnion :dataset="dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" @selectLegend="selectLegend" ref="local">
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
            </LocalVueUiOnion>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiOnion" :dataset="dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`" @selectLegend="selectLegend" ref="vduiLocal">
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
            <VueUiOnion :dataset="dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" @selectLegend="selectLegend" ref="build">
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
            </VueUiOnion>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiOnion" :dataset="dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`" @selectLegend="selectLegend" ref="vduiBuild">
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