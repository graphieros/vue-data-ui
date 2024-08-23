<script setup>
import { ref, computed } from "vue";
import LocalVueUiQuadrant from '../src/components/vue-ui-quadrant.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild, toggleTable, toggleLabels } = useArena()

const dataset = ref([
    {
        name: 'Serie 1',
        shape: 'star',
        series: [
            {
                name: "Star 1",
                x: 50,
                y: 50
            },
            {
                name: "Star 2",
                x: -10,
                y: -10
            },
            {
                name: "Star 3",
                x: -15,
                y: 20
            },
            {
                name: "Star 4",
                x: 15,
                y: -20
            },
        ]
    },
    {
        name: 'Serie 2',
        shape: 'diamond',
        series: [
            {
                name: "Triangle 1",
                x: -50,
                y: -50
            },
            {
                name: "Triangle 2",
                x: 25,
                y: -25
            },
            {
                name: "Triangle 3",
                x: -25,
                y: 25
            },
            {
                name: "Triangle 4",
                x: 10,
                y: 10
            }
        ]
    },
    {
        name: 'Serie 3',
        shape: 'hexagon',
        series: [
        {
            name: "Hexagon 1",
            x: -39,
            y: 39
        },
        {
            name: "Hexagon 2",
            x: -2,
            y: 45
        },
        {
            name: "Hexagon 3",
            x: -15,
            y: 30
        },
    ]
    }
]);

const model = ref([
    { key: 'style.chart.tooltip.show', def: true, type: 'checkbox'},
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.labels', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.table', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'useCssAnimation', def: true, type: 'checkbox'},
    { key: 'zoomAnimationFrames', def: 20, type: 'range', min: 0, max: 100},
    { key: 'style.fontFamily', def: 'inherit', type: "text"},
    { key: 'style.chart.height', def: 512, type: 'number', min: 100, max: 1000},
    { key: 'style.chart.width', def: 512, type: 'number', min: 100, max: 1000},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.labels.quadrantLabels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.quadrantLabels.tl.text', def: 'Top left label', type: 'text'},
    { key: 'style.chart.layout.labels.quadrantLabels.tl.color', def: '#FFAA00', type: 'color'},
    { key: 'style.chart.layout.labels.quadrantLabels.tl.fontSize', def: 16, type: 'range', min: 8, max: 42},
    { key: 'style.chart.layout.labels.quadrantLabels.tl.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.quadrantLabels.tr.text', def: 'Top right label', type: 'text'},
    { key: 'style.chart.layout.labels.quadrantLabels.tr.color', def: '#00BB63', type: 'color'},
    { key: 'style.chart.layout.labels.quadrantLabels.tr.fontSize', def: 16, type: 'range', min: 8, max: 42},
    { key: 'style.chart.layout.labels.quadrantLabels.tr.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.quadrantLabels.br.text', def: 'Bottom right label', type: 'text'},
    { key: 'style.chart.layout.labels.quadrantLabels.br.color', def: '#0063BB', type: 'color'},
    { key: 'style.chart.layout.labels.quadrantLabels.br.fontSize', def: 16, type: 'range', min: 8, max: 42},
    { key: 'style.chart.layout.labels.quadrantLabels.br.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.quadrantLabels.bl.text', def: 'Bottom right label', type: 'text'},
    { key: 'style.chart.layout.labels.quadrantLabels.bl.color', def: '#BB0063', type: 'color'},
    { key: 'style.chart.layout.labels.quadrantLabels.bl.fontSize', def: 16, type: 'range', min: 8, max: 42},
    { key: 'style.chart.layout.labels.quadrantLabels.bl.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.plotLabels.showAsTag', def: false, type:'checkbox'},
    { key: 'style.chart.layout.labels.plotLabels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.plotLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.labels.plotLabels.offsetY', def: 12, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.labels.plotLabels.fontSize', def: 10, type: 'range', min: 8, max: 48},
    { key: 'style.chart.layout.labels.axisLabels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.axisLabels.fontSize', def: 14, type: 'range', min: 8, max: 48},
    { key: 'style.chart.layout.labels.axisLabels.color.positive', def: '#0000FF', type: 'color'},
    { key: 'style.chart.layout.labels.axisLabels.color.negative', def: '#FF0000', type: 'color'},
    { key: 'style.chart.layout.grid.stroke', def: '#e1e5e8', type: 'color'},
    { key: 'style.chart.layout.grid.strokeWidth', def: 1.5, type: 'range', min: 0, max: 12, step: 0.5},
    { key: 'style.chart.layout.grid.showArrows', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.grid.graduations.stroke', def: '#e1e5e8', type: 'color'},
    { key: 'style.chart.layout.grid.graduations.strokeWidth', def: 0.5, type: 'range', min: 0, max: 64, step: 0.5},
    { key: 'style.chart.layout.grid.graduations.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.grid.graduations.steps', def: 5, type: 'number', min: 2, max: 20},
    { key: 'style.chart.layout.grid.graduations.fill', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.grid.graduations.color', def: '#40AD38', type: 'color'},
    { key: 'style.chart.layout.grid.graduations.roundingForce', def: 10, type:'range', min: 0, max: 300},
    { key: 'style.chart.layout.grid.xAxis.min', def: -100, type: 'number', min: -1000, max: 1000},
    { key: 'style.chart.layout.grid.xAxis.max', def: 100, type: 'number', min: -1000, max: 1000},
    { key: 'style.chart.layout.grid.xAxis.auto', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.grid.xAxis.name', def: "X axis lorem ipsum dolor sic amet", type: 'checkbox'},
    { key: 'style.chart.layout.grid.yAxis.min', def: -100, type: 'number', min: -1000, max: 1000},
    { key: 'style.chart.layout.grid.yAxis.max', def: 100, type: 'number', min: -1000, max: 1000},
    { key: 'style.chart.layout.grid.yAxis.auto', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.grid.yAxis.name', def: "Y axis lorem ipsum dolor sic amet", type: 'checkbox'},
    { key: 'style.chart.layout.plots.radius', def: 6, type: 'range', min: 0, max: 48},
    { key: 'style.chart.layout.plots.outline', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.plots.outlineColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.layout.plots.outlineWidth', def: 1, type: 'range', min: 0, max: 12, step: 0.5},
    { key: 'style.chart.layout.areas.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.areas.opacity', def: 40, type: 'range', min: 0, max: 100},
    { key: 'style.chart.layout.areas.useGradient', def: true, type: 'checkbox'},
    { key: 'style.chart.title.text', def: 'Lorem ipsum dolor sic amet'},
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.fontSize', def: 20, type: 'range', min: 8, max: 48},
    { key: 'style.chart.title.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sic amet', type: 'text'},
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'range', min: 8, max: 48},
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.legend.show', def: true, type: 'checkbox'},
    { key: 'style.chart.legend.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.legend.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: "style.chart.legend.color", def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.legend.fontSize', def: 14, type: 'range', min: 8, max: 48},
    { key: 'table.show', def: false, type: 'checkbox'},
    { key: 'table.responsiveBreakdpoint', def: 400, type: 'number', min: 300, max: 800},
    { key: 'table.th.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.th.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.th.outline', def: 'none', type: 'text'},
    { key: 'table.td.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.td.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.td.outline', def: 'none', type: 'text'},
    { key: 'table.td.roundingValue', def: 2, type: 'range', min: 0, max: 12},
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

function selectPlot(plot) {
    console.log({ plot })
}

function selectSide(side) {
    console.log({ side })
}

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <button @click="toggleLabels">TOGGLE LABELS</button>
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
        <LocalVueUiQuadrant :key="`responsive_${step}`" :dataset="dataset" :config="{
            ...config,
            responsive: true
        }"/>
    </div>

    <Box>
        <template #title>VueUiQuadrant</template>

        <template #local>
            <LocalVueUiQuadrant :dataset="dataset" :config="config" :key="`local_${step}`" @selectLegend="selectLegend" @selectPlot="selectPlot" @selectSide="selectSide" ref="local">
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
            </LocalVueUiQuadrant>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiQuadrant" :dataset="dataset" :config="config" :key="`VDUI-lodal_${step}`" @selectLegend="selectLegend" @selectPlot="selectPlot" @selectSide="selectSide" ref="vduiLocal">
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
            <VueUiQuadrant :dataset="dataset" :config="config" :key="`build_${step}`" @selectLegend="selectLegend" @selectPlot="selectPlot" @selectSide="selectSide" ref="build">
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
            </VueUiQuadrant>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiQuadrant" :dataset="dataset" :config="config" :key="`VDUI-build_${step}`" @selectLegend="selectLegend" @selectPlot="selectPlot" @selectSide="selectSide" ref="vduiBuild">
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