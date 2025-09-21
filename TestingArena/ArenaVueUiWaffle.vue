<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiWaffle from '../src/components/vue-ui-waffle.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

import { VueUiWaffle } from "vue-data-ui";
import { VueUiWaffle as VueUiWaffleTreeshaken } from "vue-data-ui/vue-ui-waffle";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena()

const dataset = ref([])
onMounted(() => {
    dataset.value = undefined;
    setTimeout(() => {
        dataset.value = [
            {
                name: 'A with a long name',
                values: [3]
            },
            {
                name: 'A',
                values: [2]
            },
            {
                name: 'A',
                values: [1]
            },
        ]
    }, 2000)
})

const alternateDataset = ref([
    { name: 'Alt 1', values: [20]},
    { name: 'Alt 2', values: [20]},
    { name: 'Alt 3', values: [20]},
])

const alternateConfig = ref({
    table: {
        th: {
            backgroundColor: '#00FF0020'
        }
    },
    style: {
        chart: {
            backgroundColor: '#FF000020',
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
    dataset.value.push({
        name: 'Added',
        values: [Math.round(Math.random() * 30)]
    })
}

const model = ref([
    { key: 'debug', def: true, type: 'checkbox'},
    { key: 'loading', def: false, type: 'checkbox'},
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.table', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right']},
    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},

    { key: 'useBlurOnHover', def: true, type: 'checkbox'},
    { key: 'useCustomCells', def: false, type: 'checkbox'},
    { key: 'useAnimation', def: true, type: 'checkbox'},
    { key: 'style.fontFamily', def: "inherit", type: 'text'},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF20', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.labels.dataLabels.prefix', def: '$', type: 'text'},
    { key: 'style.chart.layout.labels.dataLabels.suffix', def: '€', type: 'text'},
    { key: 'style.chart.layout.labels.captions.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.captions.showSerieName', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.captions.serieNameAbbreviation', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.captions.serieNameMaxAbbreviationSize', def: 3, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.labels.captions.fontSize', def: 12, type: 'range', min: 8, max: 48},
    { key: 'style.chart.layout.labels.captions.showValue', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.captions.showPercentage', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.labels.captions.roundingValue', def: 2, type: 'range', min: 0, max: 12},
    { key: 'style.chart.layout.labels.captions.roundingPercentage', def: 2, type: 'range', min: 0, max: 12},
    { key: 'style.chart.layout.labels.captions.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.labels.captions.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.grid.size', def: 10, type: 'range', min: 2, max: 20},
    { key: 'style.chart.layout.grid.spaceBetween', def: 0, type: 'number', min: 0, max: 20},
    { key: 'style.chart.layout.grid.vertical', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.rect.rounded', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.rect.rounding', def: 2, type: 'number', min: 0, max: 100},
    { key: 'style.chart.layout.rect.stroke', def: '#1A1A1A', type: 'text'},
    { key: 'style.chart.layout.rect.strokeWidth', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.rect.useGradient', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.rect.gradientIntensity', def: 40, type: 'range', min: 0, max: 100},
    { key: 'style.chart.title.text', def: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis', type: 'text'},
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 8, max: 48},
    { key: 'style.chart.title.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.title.subtitle.text', def: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis', type: 'text'},
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'range', min: 8, max: 48},
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox'},

    { key: 'style.chart.tooltip.show', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.tooltip.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.tooltip.fontSize', def: 12, type: 'range', min: 8, max: 48},
    { key: 'style.chart.tooltip.showValue', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.showPercentage', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.roundingValue', def: 0, type: 'range', min: 0, max: 12},
    { key: 'style.chart.tooltip.roundingPercentage', def: 0, type: 'range', min: 0, max: 12},
    { key: 'style.chart.tooltip.backgroundOpacity', def: 20, type: 'range', min: 0, max: 100 },
    { key: 'style.chart.tooltip.position', def: 'center', type: 'select', options: ['left', 'center', 'right']},
    { key: 'style.chart.tooltip.offsetY', def: 24, type: 'number', min: 0, max: 48},

    { key: 'table.show', def: false, type: 'checkbox'},
    { key: 'table.useDialog', def: true, type: 'checkbox'},
    { key: 'table.responsiveBreakpoint', def: 400, type: 'number', min: 300, max: 800},
    { key: 'table.columnNames.series', def: 'Series', type: 'text' },
    { key: 'table.columnNames.value', def: 'Value', type: 'text' },
    { key: 'table.columnNames.percentage', def: 'Percentage', type: 'text' },
    { key: 'table.th.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.th.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.th.outline', def: 'none', type: 'text'},
    { key: 'table.td.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'table.td.color', def: ' #1A1A1A', type: 'color'},
    { key: 'table.td.outline', def: 'none', type: 'text'},
    { key: 'table.td.roundingValue', def: 0, type: 'range', min: 0, max: 12},
    { key: 'table.td.roundingPercentage', def: 0, type: 'range', min: 0, max: 12},

    { key: 'userOptions.print.scale', def: 2, type: 'number', min: 1, max: 5},
    { key: 'userOptions.print.allowTaint', def: true, type: 'checkbox'},
    { key: 'userOptions.print.useCORS', def: true, type: 'checkbox'},
    { key: 'userOptions.print.backgroundColor', def: '#FFFFFF' },

    { key: 'style.chart.legend.showValue', def: true, type: 'checkbox'},
    { key: 'style.chart.legend.showPercentage', def: false, type: 'checkbox'},
    { key: 'style.chart.legend.position', def: 'bottom', type: 'select', options: ['top', 'bottom']},
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
            events: {
                datapointEnter: ({ datapoint, seriesIndex }) => {
                    console.log('enter event', { datapoint, seriesIndex});
                },
                datapointLeave: ({ datapoint, seriesIndex }) => {
                    console.log('leave event', { datapoint, seriesIndex});
                },
                datapointClick: ({ datapoint, seriesIndex }) => {
                    console.log('click event', { datapoint, seriesIndex});
                },
            },
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
                                formatter: ({value, config }) => {
                                    // console.log(config)
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

const step = ref(0)

function selectLegend(legend) {
    console.log({legend})
}

onMounted(async() => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img)
    }
})

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
        <LocalVueUiWaffle :key="`responsive_${step}`" :dataset="dataset" :config="{
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
        <!-- <template #cell="{ cell, isSelected }">
                    <div :style="`opacity:${isSelected ? 1 : 0.3}`">
                        <VueUiIcon
                            v-if="cell.name === 'Lorem Ipsum'"
                            name="lambda"
                            size="40"
                            :stroke="cell.color"
                        />
                        <VueUiIcon
                            v-if="cell.name === 'Dolor Amet'"
                            name="func"
                            size="40"
                            :stroke="cell.color"
                        />
                        <VueUiIcon
                            v-if="cell.name === 'Dignissimos Ducimus'"
                            name="mu"
                            size="40"
                            :stroke="cell.color"
                        />
                    </div>
                </template>      -->
    </LocalVueUiWaffle>
    </div>

    <Box comp="VueUiWaffle" :dataset="isPropsToggled ? alternateDataset : dataset">
        <template #title>VueUiWaffle</template>

        <template #local>
            <LocalVueUiWaffle :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" @selectLegend="selectLegend" ref="local">
                <template #pattern="{ seriesIndex, patternId }">
                    <VueUiPattern v-if="seriesIndex === 0" :id="patternId" name="squares" stroke="#FFFFFF50" :scale="0.64"/>
                    <VueUiPattern v-if="seriesIndex === 1" :id="patternId" name="squares" stroke="#0000FF40" :scale="0.64"/>
                    <VueUiPattern v-if="seriesIndex === 2" :id="patternId" name="squares" stroke="#FF000060" :scale="0.64"/>
                </template>
                <template #optionPdf>
                    PRINT PDF
                </template>
                <!-- <template #cell="{ cell, isSelected }">
                    <div :style="`opacity:${isSelected ? 1 : 0.3}`">
                        <VueUiIcon
                            v-if="cell.name === 'Lorem Ipsum'"
                            name="lambda"
                            size="40"
                            :stroke="cell.color"
                        />
                        <VueUiIcon
                            v-if="cell.name === 'Dolor Amet'"
                            name="func"
                            size="40"
                            :stroke="cell.color"
                        />
                        <VueUiIcon
                            v-if="cell.name === 'Dignissimos Ducimus'"
                            name="mu"
                            size="40"
                            :stroke="cell.color"
                        />
                    </div>
                </template> -->
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
            </LocalVueUiWaffle>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiWaffle" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`" @selectLegend="selectLegend" ref="vduiLocal">
                <template #pattern="{ seriesIndex, patternId }">
                    <VueUiPattern v-if="seriesIndex === 0" :id="patternId" name="squares" stroke="#FFFFFF50" :scale="0.64"/>
                    <VueUiPattern v-if="seriesIndex === 1" :id="patternId" name="squares" stroke="#0000FF40" :scale="0.64"/>
                    <VueUiPattern v-if="seriesIndex === 2" :id="patternId" name="squares" stroke="#FF000060" :scale="0.64"/>
                </template>
                <!-- <template #cell="{ cell, isSelected }">
                    <div :style="`opacity:${isSelected ? 1 : 0.3}`">
                        <VueUiIcon
                            v-if="cell.name === 'Lorem Ipsum'"
                            name="lambda"
                            :size="40"
                            :stroke="cell.color"
                        />
                        <VueUiIcon
                            v-if="cell.name === 'Dolor Amet'"
                            name="func"
                            :size="40"
                            :stroke="cell.color"
                        />
                        <VueUiIcon
                            v-if="cell.name === 'Dignissimos Ducimus'"
                            name="mu"
                            :size="40"
                            :stroke="cell.color"
                        />
                    </div>
                </template> -->
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
            <VueUiWaffle :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" @selectLegend="selectLegend" ref="build">
                <template #pattern="{ seriesIndex, patternId }">
                    <VueUiPattern v-if="seriesIndex === 0" :id="patternId" name="squares" stroke="#FFFFFF50" :scale="0.64"/>
                    <VueUiPattern v-if="seriesIndex === 1" :id="patternId" name="squares" stroke="#0000FF40" :scale="0.64"/>
                    <VueUiPattern v-if="seriesIndex === 2" :id="patternId" name="squares" stroke="#FF000060" :scale="0.64"/>
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
            </VueUiWaffle>
        </template>

        <template #build-treesh>
            <VueUiWaffleTreeshaken :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" @selectLegend="selectLegend" ref="build">
<template #pattern="{ seriesIndex, patternId }">
                    <VueUiPattern v-if="seriesIndex === 0" :id="patternId" name="squares" stroke="#FFFFFF50" :scale="0.64"/>
                    <VueUiPattern v-if="seriesIndex === 1" :id="patternId" name="squares" stroke="#0000FF40" :scale="0.64"/>
                    <VueUiPattern v-if="seriesIndex === 2" :id="patternId" name="squares" stroke="#FF000060" :scale="0.64"/>
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
            </VueUiWaffleTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiWaffle" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`" @selectLegend="selectLegend" ref="vduiBuild">
                <template #pattern="{ seriesIndex, patternId }">
                    <VueUiPattern v-if="seriesIndex === 0" :id="patternId" name="squares" stroke="#FFFFFF50" :scale="0.64"/>
                    <VueUiPattern v-if="seriesIndex === 1" :id="patternId" name="squares" stroke="#0000FF40" :scale="0.64"/>
                    <VueUiPattern v-if="seriesIndex === 2" :id="patternId" name="squares" stroke="#FF000060" :scale="0.64"/>
                </template>
                <!-- <template #cell="{ cell, isSelected }">
                    <div :style="`opacity:${isSelected ? 1 : 0.3}`">
                        <VueUiIcon
                            v-if="cell.name === 'Lorem Ipsum'"
                            name="lambda"
                            size="40"
                            :stroke="cell.color"
                        />
                        <VueUiIcon
                            v-if="cell.name === 'Dolor Amet'"
                            name="func"
                            size="40"
                            :stroke="cell.color"
                        />
                        <VueUiIcon
                            v-if="cell.name === 'Dignissimos Ducimus'"
                            name="mu"
                            size="40"
                            :stroke="cell.color"
                        />
                    </div>
                </template> -->
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