<script setup>
import { ref, computed } from "vue";
import LocalVueUiTreemap from '../src/components/vue-ui-treemap.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena()

const dataset = ref([
    {
        name: 'S1',
        value: 100,
        children: [
            {
                name: 'S1 - C1',
                value: 50
            },
            {
                name: 'S1 -C2',
                value: 25
            },
            {
                name: 'S1 - C3',
                value: 12.5,
                children: [
                    {
                        name: 'S1 - C3 - CC1',
                        value: 6
                    },
                    {
                        name: 'S1 - C3 - CC2',
                        value: 6.5
                    },
                ]
            }
        ]
    },
    {
        name: 'S2',
        value: 200,
        children: [
            {
                name: 'S2 - C1',
                value: 100
            },
            {
                name: 'S2 - C2',
                value: 50
            },
            {
                name: 'S2 - C3',
                value: 25
            }
        ]
    },
    {
        name: 'S3',
        value: 100,
        children: [
            {
                name: 'S3 - C1',
                value: 50
            },
            {
                name: 'S3 - C2',
                value: 25
            },
            {
                name: 'S3 - C3',
                value: 12.5
            }
        ]
    },
    {
        name: 'S4',
        value: 20,
        children: [
            {
                name: 'S3 - C1',
                value: 10
            },
            {
                name: 'S3 - C2',
                value: 5
            },
            {
                name: 'S3 - C3',
                value: 2.5
            }
        ]
    },
    {
        name: 'S5',
        value: 10,
        children: [
            {
                name: 'S3 - C1',
                value: 5
            },
            {
                name: 'S3 - C2',
                value: 2.5
            },
            {
                name: 'S3 - C3',
                value: 1.125
            }
        ]
    },
]);

const model = ref([
    { key: 'responsive', def: false, type:'checkbox'},
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.table', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox' },
    { key: 'style.fontFamily', def: 'inherit', type: 'text' },
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.height', def: 500, type: 'number', min: 100, max: 1000},
    { key: 'style.chart.width', def: 800, type: 'number', min: 100, max: 1500},
    { key: 'style.chart.padding.top', def: 0, type: 'number', min: 0, max: 100},
    { key: 'style.chart.padding.right', def: 0, type: 'number', min: 0, max: 100},
    { key: 'style.chart.padding.bottom', def: 0, type: 'number', min: 0, max: 100},
    { key: 'style.chart.padding.left', def: 0, type: 'number', min: 0, max: 100},
    { key: 'style.chart.layout.sorted', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.rects.stroke', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.layout.rects.strokeWidth', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.rects.borderRadius', def: 0, type: 'number', min: 0, max: 24},
    { key: 'style.chart.layout.rects.colorRatio', def: 0.3, type: 'number', min: 0, max: 1, step: 0.01},
    { key: 'style.chart.layout.rects.gradient.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.rects.gradient.intensity', def: 30, type: 'range', min:0, max: 100},
    { key: 'style.chart.layout.rects.selected.stroke', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.layout.rects.selected.strokeWidth', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.rects.selected.unselectedOpacity', def: 0.6, type: 'range', min: 0, max: 1, step: 0.01},
    { key: 'style.chart.layout.labels.showDefaultLabels', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.fontSize', def: 14, type: 'range', min: 8, max: 48, step: 1},
    { key: 'style.chart.layout.labels.minFontSize', def: 10, type: 'range', min: 6, max: 48, step: 1},
    { key: 'style.chart.layout.labels.hideUnderProportion', def: 0.03, type: 'number', min: 0, max: 1, step: 0.01},
    { key: 'style.chart.layout.labels.prefix', def: 'Value: ', type: 'text'},
    { key: 'style.chart.layout.labels.suffix', def: '€', type: 'text'},
    { key: 'style.chart.layout.labels.rounding', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.legend.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.legend.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.legend.show', def: true, type: 'checkbox'},
    { key: 'style.chart.legend.fontSize', def: 14, type: 'number', min: 8, max: 48},
    { key: 'style.chart.legend.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.legend.roundingValue', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.legend.roundingPercentage', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.title.text', def: "Lorem ipsum dolor sic amet", type: "text"},
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 8, max: 48},
    { key: 'style.chart.title.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sic amet titulum subtitulum'},
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox'},

    { key: 'style.chart.tooltip.show', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.tooltip.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.tooltip.fontSize', def: 14, type: 'number', min: 8, max: 48},
    { key: 'style.chart.tooltip.roundingValue', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.tooltip.backgroundOpacity', def: 100, type: 'range', min: 0, max: 100},

    { key: 'table.show', def: false, type: 'checkbox'},
    { key: 'table.responsiveBreakpoint', def: 300, type: 'number', min: 300, max: 800},
    { key: 'table.columnNames.series', def: 'Series', type: 'text'},
    { key: 'table.columnNames.value', def: 'Value', type: 'text'},
    { key: 'table.columnNames.percentage', def: 'Percentage', type: 'text'},
    { key: 'table.th.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.th.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.th.outline', def: 'none'},
    { key: 'table.td.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.td.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.td.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'table.td.roundingPercentage', def: 2, type: 'number', min: 0, max: 12},
]);

const testCustomTooltip = ref(false);

const themeOptions = ref([
    "hack",
    "zen",
    "concrete",
    "default"
])

const currentTheme = ref(themeOptions.value[2])

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
            // customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
        }
    }
});

const step = ref(0)

function selectLegend(legend) {
    console.log({legend})
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

    <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
        <LocalVueUiTreemap :key="`responsive_${step}`" :dataset="dataset" :config="{
            ...config,
            responsive: true
        }">
        <template #watermark="{ isPrinting }">
            <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                WATERMARK
            </div>
        </template>     
    </LocalVueUiTreemap>
    </div>

    <Box comp="VueUiTreemap" :dataset="dataset">
        <template #title>VueUiTreemap</template>

        <template #local>
            <LocalVueUiTreemap :dataset="dataset" :config="config" :key="`local_${step}`" @selectDatapoint="selectDatapoint" @selectLegend="selectLegend" ref="local">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #rect="{ rect, shouldShow, fontSize, isZoom, textColor }">
                    #RECT
                    <div style="font-size: 12px">
                        {{ rect, shouldShow, fontSize, isZoom, textColor }}
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
            </LocalVueUiTreemap>
        </template>
        
        <template #VDUI-local>
            <LocalVueDataUi component="VueUiTreemap" :dataset="dataset" :config="config" :key="`VDUI-lodal_${step}`" @selectDatapoint="selectDatapoint" @selectLegend="selectLegend" ref="vduiLocal">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #rect="{ rect, shouldShow, fontSize, isZoom, textColor }">
                    #RECT
                    <div style="font-size: 12px">
                        {{ rect, shouldShow, fontSize, isZoom, textColor }}
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
            <VueUiTreemap :dataset="dataset" :config="config" :key="`build_${step}`" @selectDatapoint="selectDatapoint" @selectLegend="selectLegend" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #rect="{ rect, shouldShow, fontSize, isZoom, textColor }">
                    #RECT
                    <div style="font-size: 12px">
                        {{ rect, shouldShow, fontSize, isZoom, textColor }}
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
            </VueUiTreemap>
        </template>
        
        <template #VDUI-build>
            <VueDataUi component="VueUiTreemap" :dataset="dataset" :config="config" :key="`VDUI-build_${step}`" @selectDatapoint="selectDatapoint" @selectLegend="selectLegend" ref="vduiBuild">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #rect="{ rect, shouldShow, fontSize, isZoom, textColor }">
                    #RECT
                    <div style="font-size: 12px">
                        {{ rect, shouldShow, fontSize, isZoom, textColor }}
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