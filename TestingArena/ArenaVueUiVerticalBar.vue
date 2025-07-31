<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiVerticalBar from '../src/components/vue-ui-vertical-bar.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

const { local, build, vduiLocal, vduiBuild, toggleTable, toggleSort } = useArena()

const dataset = ref([
    {
        name: "Serie 1 with",
        value: 100.987987,
        children: [
            {
                name: "serie 1 child 1",
                value: 12
            },
            {
                name: "serie 1 child 2",
                value: 20
            },
        ]
    },
    {
        name: "Serie 2 has a long name",
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

const alternateDataset = ref([
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
])

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
    dataset.value.push({
        name: 'Added',
        value: 100
    })
}

const model = ref([
    { key: 'autoSize', def: true, type: 'checkbox'},
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.table', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.sort', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right']},
    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},

    { key: 'userOptions.print.scale', def: 2, type: 'number', min: 1, max: 5},
    
    { key: 'useCssAnimation', def: false, type: 'checkbox'},
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.bars.sort', def: 'desc', type: 'select', options: ['asc', 'desc', 'none']},
    { key: 'style.chart.layout.bars.useStroke', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.bars.strokeWidth', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.bars.height', def: 56, type: 'number', min: 12, max: 64},
    { key: 'style.chart.layout.bars.gap', def: 6, type: 'number', min: 0, max: 24},
    { key: 'style.chart.layout.bars.borderRadius', def: 4, type: 'range', min: 0, max: 48}, // IDEA: max could be based on height to always be harmonious
    { key: 'style.chart.layout.bars.offsetX', def: 0, type: 'number', min: 0, max: 100},
    { key: 'style.chart.layout.bars.paddingRight', def: 0, type: 'number', min: 0, max: 100},
    { key: 'style.chart.layout.bars.useGradient', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.bars.gradientIntensity', def: 20, type: 'range', min:0, max: 100},
    { key: 'style.chart.layout.bars.fillOpacity', def: 90, type: 'range', min: 0, max: 100}, // UNUSED ?
    { key: 'style.chart.layout.bars.underlayerColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.layout.bars.dataLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.bars.dataLabels.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.bars.dataLabels.fontSize', def: 14, type: 'range', min: 8, max: 48},
    { key: 'style.chart.layout.bars.dataLabels.value.show', def: true, type: 'checkbox'}, // ISSUE: can't just show percentage as false nukes it all
    { key: 'style.chart.layout.bars.dataLabels.value.roundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.bars.dataLabels.value.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.layout.bars.dataLabels.value.suffix', def: 'S', type: 'text'},
    { key: 'style.chart.layout.bars.dataLabels.percentage.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.bars.dataLabels.percentage.roundingPercentage', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.bars.dataLabels.offsetX', def: 12, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.bars.nameLabels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.bars.nameLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.bars.nameLabels.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.bars.nameLabels.fontSize', def: 20, type: 'range', min: 8, max: 48},
    { key: 'style.chart.layout.bars.nameLabels.offsetX', def: -12, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.bars.parentLabels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.bars.parentLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.bars.parentLabels.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.bars.parentLabels.fontSize', def: 14, type: 'range', min: 8, max: 48},
    { key: 'style.chart.layout.bars.parentLabels.offsetX', def: 24, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.highlighter.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.highlighter.opacity', def: 5, type: 'range', min: 0, max: 100},
    { key: 'style.chart.layout.separators.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.separators.color', def: '#e1e5e8', type: 'color'},
    { key: 'style.chart.layout.separators.strokeWidth', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.separators.fullWidth', def: true, type: 'checkbox' },

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
    { key: 'style.chart.tooltip.backgroundOpacity', def: 100, type: 'range', min: 0, max: 100},
    { key: 'style.chart.tooltip.position', def: 'center', type: 'select', options: ['left', 'center', 'right']},
    { key: 'style.chart.tooltip.offsetY', def: 24, type: 'number', min: 0, max: 48},

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
                datapointClick: (c) => {
                    console.log({c})
                },
                datapointEnter: (e) => {
                    console.log({e})
                },
                datapointLeave: (l) => {
                    console.log({l})
                }
            },
            style: {
                ...c.style,
                chart: {
                    ...c.style.chart,
                    layout: {
                        ...c.style.chart.layout,
                        bars: {
                            ...c.style.chart.layout.bars,
                            dataLabels: {
                                ...c.style.chart.layout.bars.dataLabels,
                                value: {
                                    ...c.style.chart.layout.bars.dataLabels.value,
                                    formatter: ({value, config}) => {
                                        // console.log(config)
                                        return `f | ${value}`
                                    }
                                }
                            }
                        }
                    }
                }
            },
            theme: currentTheme.value,
        }
    }
});

const step = ref(0)

function selectLegend(legend) {
    console.log({ legend })
}

onMounted(async () => {
    if (local.value) {
        const img = await local.value.getImage();
        console.log(img)
    }
})

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <button @click="toggleSort">TOGGLE SORT</button>
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
        <LocalVueUiVerticalBar :key="`responsive_${step}`" :dataset="dataset" :config="{
            ...config,
            responsive: true
        }">

        <!-- <template #pattern="{ seriesIndex, patternId }">
            <pattern v-if="seriesIndex === 0" :id="patternId" width="70" height="8" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="none" stroke="#1A1A1A" d="M-.02 22c8.373 0 11.938-4.695 16.32-9.662C20.785 7.258 25.728 2 35 2s14.215 5.258 18.7 10.338C58.082 17.305 61.647 22 70.02 22M-.02 14.002C8.353 14 11.918 9.306 16.3 4.339 20.785-.742 25.728-6 35-6S49.215-.742 53.7 4.339c4.382 4.967 7.947 9.661 16.32 9.664M70 6.004c-8.373-.001-11.918-4.698-16.3-9.665C49.215-8.742 44.272-14 35-14S20.785-8.742 16.3-3.661C11.918 1.306 8.353 6-.02 6.002"/></pattern>

            <pattern v-if="seriesIndex === 1" :id="patternId" width="29" height="50.115" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b31"/><path fill="none" stroke="#ecc94b" stroke-linecap="square" stroke-width=".5" d="M14.5 6.628 8.886 3.372v-6.515L14.502-6.4l5.612 3.257-.001 6.514zm0 50.06-5.613-3.256v-6.515l5.614-3.258 5.612 3.257-.001 6.515zm14.497-25.117-5.612-3.257v-6.515L29 18.541l5.612 3.257-.001 6.515zm-29 0-5.612-3.257v-6.515L0 18.541l5.612 3.257v6.515zM14.5 11.82 4.36 5.967l.002-11.706 10.14-5.855L24.638-5.74l-.001 11.707zm0 50.06L4.36 56.028l.002-11.706 10.14-5.855 10.137 5.852-.001 11.707zm14.498-25.118-10.14-5.852.002-11.707L29 13.349l10.137 5.853-.001 11.706zm-29 0-10.139-5.852.002-11.707L0 13.349l10.138 5.853-.002 11.706zm14.501-19.905L0 8.488.002-8.257l14.5-8.374L29-8.26l-.002 16.745zm0 50.06L0 58.548l.002-16.745 14.5-8.373L29 41.8l-.002 16.744zM28.996 41.8l-14.498-8.37.002-16.744L29 8.312l14.498 8.37-.002 16.745zm-29 0-14.498-8.37.002-16.744L0 8.312l14.498 8.37-.002 16.745z"/></pattern>

            <pattern v-if="seriesIndex === 2" :id="patternId" width="40" height="40" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b31"/><path fill="#ecc94b" d="M20 8.52h20v2.96H20zM20 20h20v20H20z"/><path fill="#f44034" d="M21.63 0 20 1.63v1.54L23.15 0zm3.08 0L20 4.71v1.54L26.25 0zm3.08 0L20 7.79v1.53L29.32 0zm3.07 0L20 10.86v1.54L32.4 0zm3.08 0L20 13.94v1.54L35.48 0zm3.08 0L20 17.02v1.54L38.55 0zM40 .1l-20 20L.1 40h1.53L40 1.63zm0 3.07L3.17 40h1.54L40 4.71zm0 3.08L6.25 40h1.54L40 7.79zm0 3.07L9.32 40h1.54L40 10.86zm0 3.08L12.4 40h1.54L40 13.94zm0 3.08L15.48 40h1.54L40 17.02zm0 3.08L18.55 40h1.55L40 20.1V20zM1.63 20 0 21.63v1.54L3.15 20zm3.08 0L0 24.71v1.54L6.25 20zm3.08 0L0 27.79v1.53L9.32 20zm3.07 0L0 30.86v1.54L12.4 20zm3.08 0L0 33.94v1.54L15.48 20zm3.08 0L0 37.02v1.54L18.55 20zM40 21.63 21.63 40h1.54L40 23.17zm0 3.08L24.71 40h1.54L40 26.25zm0 3.08L27.79 40h1.53L40 29.33zm0 3.08L30.86 40h1.54l7.6-7.6zm0 3.07L33.94 40h1.54L40 35.48zm0 3.08L37.02 40h1.54L40 38.56zM9.32 0l-.8.8v1.54L10.86 0zm2.16.92L8.52 3.88v1.54l2.96-2.96zm0 3.08L8.52 6.96V8.5l2.96-2.96zm0 3.08-1.44 1.44-2.96 2.96h1.44v.1l.1-.1 2.86-2.87.1-.09h-.1zM.8 8.52l-.8.8v1.54l2.34-2.34zm3.08 0L.92 11.48h1.54l2.96-2.96zm3.08 0L4 11.48h1.54L8.5 8.52zm6.16 0-1.64 1.63-1.33 1.33-1.63 1.63v1.54l2.96-2.96v-.21h.21l2.96-2.96zm3.07 0-2.96 2.96h1.54l2.96-2.96zm3.08 0-2.96 2.96h1.53L20 9.32v-.8zm.73 2.34-.62.62H20zm-8.52 2.37-2.96 2.96v1.54l2.96-2.96zm0 3.07-2.96 2.97V40h2.96V20H9.32l2.16-2.16z"/></pattern>
        </template> -->

        <!-- <template #chart-background>
            <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
        </template> -->

        <template #watermark="{ isPrinting }">
            <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                WATERMARK
            </div>
        </template>

        <!-- <template #source>
            <div style="width:100%;font-size:10px;text-align:left">
                SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
            </div>
        </template> -->
    </LocalVueUiVerticalBar>
    </div>

    <Box comp="VueUiVerticalBar" :dataset="dataset">
        <template #title>VueUiVerticalBar</template>

        <template #local>
            <LocalVueUiVerticalBar :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" @selectLegend="selectLegend" ref="local">
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
                <!-- <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template> -->
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </LocalVueUiVerticalBar>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiHorizontalBar" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`" @selectLegend="selectLegend" ref="vduiLocal">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #dataLabel="{ datapoint, isBlur, isVisible, isSafari, textAlign, flexAlign, percentage }">
                    <div :style="`background:${datapoint.color}`">
                        {{ datapoint.name }} : {{ percentage }}
                    </div>
                </template>
                <!-- <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template> -->
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiHorizontalBar :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" @selectLegend="selectLegend" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #dataLabel="{ datapoint, isBlur, isVisible, isSafari, textAlign, flexAlign, percentage }">
                    <div :style="`background:${datapoint.color}`">
                        {{ datapoint.name }} : {{ percentage }}
                    </div>
                </template>
                <!-- <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template> -->
                <template #tooltip-before="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #BEFORE {{ series.name }}
                </template>
                <template #tooltip-after="{ datapoint, seriesIndex, series, config, bars, lines, plots }">
                    #AFTER {{ series.name }}
                </template>
            </VueUiHorizontalBar>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiHorizontalBar" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`" @selectLegend="selectLegend" ref="vduiBuild">
                <template #svg="{ svg }">
                    <circle :cx="30" :cy="30" :r="30" fill="#42d392" />
                    <text :x="30" :y="30" text-anchor="middle">#SVG</text>
                </template>
                <template #dataLabel="{ datapoint, isBlur, isVisible, isSafari, textAlign, flexAlign, percentage }">
                    <div :style="`background:${datapoint.color}`">
                        {{ datapoint.name }} : {{ percentage }}
                    </div>
                </template>
                <!-- <template #legend="{ legend }">
                    #LEGEND
                    <div style="font-size: 8px">
                        {{ legend }}
                    </div>
                </template> -->
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