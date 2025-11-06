<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiStackline from "../src/components/vue-ui-stackline.vue";
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

import { VueUiStackline } from "vue-data-ui";
import { VueUiStackline as VueUiStacklineTreeshaken } from "vue-data-ui/vue-ui-stackline";

const { local, build, vduiLocal, vduiBuild, toggleTable, toggleLabels, toggleStack } = useArena()

const selectedX = ref(undefined);

function generateDayTimestamps(length) {
    const result = [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    for (let i = 0; i < length; i += 1) {
        result.push(new Date(start.getTime() + i * 24 * 60 * 60 * 1000).getTime());
    }

    return result;
}

// const dataset = ref([
//     {
//         name: 'Series A',
//         series: [-5, -3, -2, -1, 0, 1, 2, 4, 5],
//     },
//     {
//         name: 'Series B',
//         series: [-5, -3, -2, -1, 0, 1, 2, 4, 5],
//     },
//     {
//         name: 'Series C',
//         series: [-5, -3, -2, -1, 0, 1, 2, 4, 5],
//     },
// ]);

// const dataset = ref([
//     {
//             name: '',
//             series: [3, 2, 1, 5, 13, 21, 8, 89, 34, 55],
//             color: '#8A8A8A'
//         },
//         {
//             name: '',
//             series: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
//             color: '#CACACA' 
//         }
// ])

// const dataset = ref([
//     {
//         name: "Series 1",
//         series: [10, 20, null, null, 20, 4, 5],
//         shape: 'square'
//     },
//     {
//         name: "Series 2",
//         series: [20, 40, 60, 20, 10],
//         shape: 'star'
//     },
//     {
//         name: "Series 3",
//         series: [20, 40, 60, 20, 10],
//     },
// ])

function makeDs(n) {
    const arr = [];
    for (let i = 0; i < n; i += 1) {
        if (i > 10 && i < 20) {
            // arr.push(null);
            arr.push(Math.random() * -20)
        } else {
            arr.push(Math.random() * 10 + i)
        }
    }
    return arr
}

const dataset = ref([
    {
        name: 'Series A',
        series: makeDs(24),
        shape: 'triangle'
    },
    {
        name: 'Series B',
        series: makeDs(24),
        shape: 'square'
    },
    {
        name: 'Series C',
        series: makeDs(24),
        shape: 'star'
    },
    {
        name: 'Series D',
        series: makeDs(24),
        shape: 'diamond',
        standalone: true
    },
    {
        name: 'Series E',
        series: makeDs(24),
        shape: 'pentagon',
        standalone: true,
    },
]);

const model = ref([
    { key: 'loading', def: false, type: 'checkbox'},
    { key: 'debug', def: false, type: 'checkbox'},
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right']},
    { key: 'orientation', def: 'vertical', type:'select', options: ['vertical', 'horizontal']},
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'theme', def: '', type: 'select', options: ['', 'zen', 'hack', 'concrete']},
    { key: 'useCssAnimation', def: true, type: 'checkbox'},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.height', def: 500, type: 'number', min: 200, max: 1000},
    { key: 'style.chart.width', def: 800, type: 'number', min: 200, max: 1000},
    { key: 'style.chart.padding.top', def: 12, type: 'number', min: 0, max: 100},
    { key: 'style.chart.padding.right', def: 24, type: 'number', min: 0, max: 100},
    { key: 'style.chart.padding.bottom', def: 12, type: 'number', min: 0, max: 100},
    { key: 'style.chart.padding.left', def: 12, type: 'number', min: 0, max: 100},

    { key: 'style.chart.title.text', def: 'Lorem ipsum', type: 'text' },
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.title.bold', def: true, type: 'checkbox' },
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sit amet', type: 'text' },
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color' },
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox' },
    { key: 'style.chart.title.textAlign', def: 'center', type: 'select', options: ['left', 'center', 'right'] },

    { key: 'style.chart.legend.show', def: true, type: 'checkbox' },
    { key: 'style.chart.legend.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.legend.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.legend.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.legend.fontSize', def: 14, type: 'number', min: 8, max: 42},
    { key: 'style.chart.legend.position', def: 'bottom', type: 'select', options: ['top', 'bottom']},

    { key: 'style.chart.zoom.show', def: true, type: 'checkbox'},
    { key: 'style.chart.zoom.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.zoom.highlightColor', def: '#5A5A5A', type: 'color'},
    { key: 'style.chart.zoom.fontSize', def: 14, type: 'number', min: 8, max: 42},
    { key: 'style.chart.zoom.startIndex', def:null, type: 'number', min: 0, max: 100},
    { key: 'style.chart.zoom.endIndex', def: null, type: 'number', min: 0, max: 100},
    { key: 'style.chart.zoom.enableRangeHandles', def: true, type: 'chexkbox'},
    { key: 'style.chart.zoom.enableSelectionDrag', def: true, type: 'chexkbox'},
    { key: 'style.chart.zoom.focusOnDrag', def: true, type: 'checkbox'},
    { key: 'style.chart.zoom.focusRangeRatio', def: 0.2, type: 'number', min: 0.1, max: 0.9, step: 0.1},

    { key: 'style.chart.zoom.preview.enable', def: true, type: 'checkbox'},
    { key: 'style.chart.zoom.preview.stroke', def: '#1f77b4', type: 'color'},
    { key: 'style.chart.zoom.preview.fill', def: '#1f77b420', type: 'color'},
    { key: 'style.chart.zoom.preview.strokeDasharray', def: 0, type: 'number', min: 0, max: 12},
    { key: 'style.chart.zoom.preview.strokeWidth', def: 2, type: 'number', min: 0, max: 12},

    { key: 'style.chart.zoom.minimap.show', def: true, type: 'checkbox' },
    { key: 'style.chart.zoom.minimap.smooth', def: true, type: 'checkbox' },
    { key: 'style.chart.zoom.minimap.selectedColor', def: '#1f77b4', type: 'color' },
    { key: 'style.chart.zoom.minimap.selectedColorOpacity', def: 0.2, type: 'range', min: 0, max: 1, step: 0.01 },
    { key: 'style.chart.zoom.minimap.lineColor', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.zoom.minimap.selectionRadius', def: 2, type: 'number', min: 0, max: 24 },
    { key: 'style.chart.zoom.minimap.indicatorColor', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.zoom.minimap.verticalHandles', def: false, type: 'checkbox' },
    { key: 'style.chart.zoom.minimap.compact', def: true, type: 'checkbox' },
    { key: 'style.chart.zoom.minimap.merged', def: false, type: 'checkbox' },


    { key: 'style.chart.tooltip.show', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.tooltip.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.tooltip.fontSize', def: 14, type: 'number', min: 8, max: 42},
    { key: 'style.chart.tooltip.borderRadius', def: 4, type: 'number', min: 0, max: 24},
    { key: 'style.chart.tooltip.borderColor', def: '#E1E5E8', type: 'color'},
    { key: 'style.chart.tooltip.borderWidth', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.tooltip.backgroundOpacity', def: 20, type: 'range', min: 0, max: 100},
    { key: 'style.chart.tooltip.position', def: 'center', type: 'select', options: ['left', 'center', 'right']},
    { key: 'style.chart.tooltip.offsetY', def: 24, type: 'number', min: 0, max: 64},
    { key: 'style.chart.tooltip.showValue', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.showPercentage', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.roundingValue', def: 2, type: 'number', min: 0, max: 6},
    { key: 'style.chart.tooltip.roundingPercentage', def: 0, type: 'number', min: 0, max: 6},
    { key: 'style.chart.tooltip.showTimeLabel', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.showTotal', def: true, type: 'checkbox'},
    { key: 'style.chart.tooltip.totalTranslation', def: 'Total', type: 'text'},

    { key: 'style.chart.highlighter.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.highlighter.opacity', def: 5, type: 'range', min: 0, max: 30},
    { key: 'style.chart.highlighter.useLine', def: false, type: 'checkbox'},
    { key: 'style.chart.highlighter.lineDasharray', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.highlighter.lineWidth', def: 1, type: 'number', min: 1, max: 6 },
    
    { key: 'style.chart.lines.useArea', def: true, type: 'checkbox'},
    { key: 'style.chart.lines.smooth', def: true, type: 'checkbox'},
    { key: 'style.chart.line.areaOpacity', def: 0.5, type: 'range', min: 0, max: 1, step: 0.01},
    { key: 'style.chart.lines.distributed', def: false, type: 'checkbox'},
    { key: 'style.chart.lines.showDistributedPercentage', def: false, type: 'checkbox'},
    { key: 'style.chart.lines.strokeWidth', def: 1, type: 'number', min: 0, max: 12},

    { key: 'style.chart.lines.gradient.show', def: true, type: 'checkbox'},
    { key: 'style.chart.lines.gradient.intensity', def: 20, type: 'range', min: 0, max: 100},

    { key: 'style.chart.lines.totalValues.show', def: true, type: 'checkbox' },
    { key: 'style.chart.lines.totalValues.offsetY', def: 6, type: 'number', min: -100, max: 100},
    { key: 'style.chart.lines.totalValues.offsetX', def: 6, type: 'number', min: -100, max: 100},

    { key: 'style.chart.lines.totalValues.fontSize', def: 16, type: 'number', min: 8, max: 42},
    { key: 'style.chart.lines.totalValues.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.lines.totalValues.color', def: '#1A1A1A', type: 'color'},

    { key: 'style.chart.lines.dataLabels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.lines.dataLabels.hideEmptyValues', def: true, type: 'checkbox'},
    { key: 'style.chart.lines.dataLabels.hideEmptyPercentages', def: true, type: 'checkbox'},
    { key: 'style.chart.lines.dataLabels.offsetY', def: 0, type: 'number', min: -100, max: 100 },

    { key: 'style.chart.lines.dataLabels.adaptColorToBackground', def: true, type: 'checkbox'},
    { key: 'style.chart.lines.dataLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.lines.dataLabels.fontSize', def: 14, type: 'number', min: 8, max: 42},
    { key: 'style.chart.lines.dataLabels.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.lines.dataLabels.rounding', def: 0, type: 'number', min: 0, max: 6},
    { key: 'style.chart.lines.dataLabels.prefix', def: '', type: 'text'},
    { key: 'style.chart.lines.dataLabels.suffix', def: '', type: 'text'},

    { key: 'style.chart.lines.dataLabels.hideUnderValue', def: null, type: 'number', min: 0, max: 100},
    { key: 'style.chart.lines.dataLabels.hideUnderPercentage', def: 0, type: 'number', min: 0, max: 100},

    { key: 'style.chart.grid.scale.ticks', def: 10, type: 'select', options: [2, 5, 10, 20]},
    { key: 'style.chart.grid.scale.scaleMin', def: null, type: 'number', min: -1000, max: 1000},
    { key: 'style.chart.grid.scale.scaleMax', def: null, type: 'number', min: -1000, max: 1000},

    { key: 'style.chart.grid.x.showAxis', def: true, type: 'checkbox'},
    { key: 'style.chart.grid.x.showHorizontalLines', def: true, type: 'checkbox'},
    { key: 'style.chart.grid.x.linesColor', def: 'red', type: 'color' },
    { key: 'style.chart.grid.x.linesThickness', def: 0.5, type: 'number', min: 0, max: 12},
    { key: 'style.chart.grid.x.linesStrokeDasharray', def: 2, type: 'number', min: 0, max: 12},

    { key: 'style.chart.grid.x.axisColor', def: '#E1E5E8', type: 'color'},
    { key: 'style.chart.grid.x.axisThickness', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.grid.x.axisName.show', def: true, type: 'checkbox'},
    { key: 'style.chart.grid.x.axisName.text', def: 'X AXIS', type: 'text'},
    { key: 'style.chart.grid.x.axisName.fontSize', def: 14, type: 'number', min: 8, max: 42},
    { key: 'style.chart.grid.x.axisName.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.grid.x.axisName.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.grid.x.axisName.offsetY', def: 0, type: 'number', min: -100, max: 100},

    { key: 'style.chart.grid.x.timeLabels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.grid.x.timeLabels.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.grid.x.timeLabels.rotation', def: 0, type: 'range', min: -90, max: 90},
    { key: 'style.chart.grid.x.timeLabels.autoRotate.enable', def: true, type: 'checkbox'},
    { key: 'style.chart.grid.x.timeLabels.autoRotate.angle', def: -90, type: 'number', min: -90, max: 90},
    { key: 'style.chart.grid.x.timeLabels.showOnlyAtModulo', def: false, type: 'checkbox'},
    { key: 'style.chart.grid.x.timeLabels.showOnlyFirstAndLast', def: false, type: 'checkbox'},
    { key: 'style.chart.grid.x.timeLabels.modulo', def: 12, type: 'number', min: 2, max: 12 },

    { key: 'style.chart.grid.x.timeLabels.fontSize', def: 14, type: 'number', min: 8, max: 42},
    { key: 'style.chart.grid.x.timeLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.grid.x.timeLabels.bold', def: false, type: 'checkbox'},

    { key: 'style.chart.grid.y.showAxis', def: true, type: 'checkbox'},
    { key: 'style.chart.grid.y.showVerticalLines', def: true, type: 'checkbox'},
    { key: 'style.chart.grid.y.linesColor', def: '#FF00FF', type: 'color' },
    { key: 'style.chart.grid.y.linesThickness', def: 0.5, type: 'number', min: 0, max: 12},
    { key: 'style.chart.grid.y.linesStrokeDasharray', def: 2, type: 'number', min: 0, max: 12},

    { key: 'style.chart.grid.y.axisColor', def: '#E1E5E8', type: 'color'},
    { key: 'style.chart.grid.y.axisThickness', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.chart.grid.y.axisName.show', def: true, type: 'checkbox'},
    { key: 'style.chart.grid.y.axisName.text', def: 'Y AXIS', type: 'text'},
    { key: 'style.chart.grid.y.axisName.fontSize', def: 14, type: 'number', min: 8, max: 42},
    { key: 'style.chart.grid.y.axisName.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.grid.y.axisName.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.grid.y.axisName.offsetX', def: 0, type: 'number', min: -100, max: 100},

    { key: 'style.chart.grid.y.axisLabels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.grid.y.axisLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.grid.y.axisLabels.fontSize', def: 14, type: 'number', min: -100, max: 100},
    { key: 'style.chart.grid.y.axisLabels.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.grid.y.axisLabels.rounding', def: 2, type: 'number', min: 0, max: 6},

    { key: 'style.chart.grid.frame.show', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.frame.stroke', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.grid.frame.strokeWidth', def: 4, type: 'number', min: 0, max: 12},
    { key: 'style.chart.grid.frame.strokeLinecap', def: 'round', type: 'text'},
    { key: 'style.chart.grid.frame.strokeLinejoin', def: 'round', type: 'text'},
    { key: 'style.chart.grid.frame.strokeDasharray', def: 0, type: 'number', min: 0, max: 24 },
    
    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},
    
    { key: 'userOptions.print.scale', def: 2, type: 'number', min: 1, max: 5},
    
    { key: 'table.td.roundingValue', def: 2, type: 'number', min: 0, max: 6},
    { key: 'table.show', def: false, type: 'checkbox'},
    { key: 'table.useDialog', def: true, type: 'checkbox'},
]);

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
    return {
        ...c,
        theme: currentTheme.value,
        events: {
            datapointEnter: ({ seriesIndex }) => {
                selectedX.value = seriesIndex;
            },
            datapointLeave: () => {
                selectedX.value = undefined;
            }
        },
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                zoom: {
                    ...c.style.chart.zoom,
                    useDefaultFormat: false,
                    customFormat: ({ absoluteIndex, seriesIndex, datapoint, timeLabel }) => {
                        // console.log({ absoluteIndex, seriesIndex, datapoint, timeLabel });
                        return `T - ${timeLabel.text}`
                    }
                },
                tooltip: {
                    ...c.style.chart.tooltip,
                    useDefaultTimeFormat: true,
                    timeFormat: 'yyyy-MM-dd',
                    //  customFormat: (data) => {
                    //     console.log(data)
                    //         return "CUSTOM TOOLTIP "
                    //     }
                },
                grid: {
                    ...c.style.chart.grid,
                    x: {
                        ...c.style.chart.grid.x,
                        timeLabels: {
                            ...c.style.chart.grid.x.timeLabels,
                            values: generateDayTimestamps(100),
                            datetimeFormatter: {
                                enable: true
                            }
                        }
                    },
                    y: {
                        ...c.style.chart.grid.y,
                        axisLabels: {
                            // formatter: ({ value }) => {
                            //     return 'BOO' + value
                            // }
                        }
                    }
                }
            }
        }
    }
});

// onMounted(() => {
//     if (local.value) {
//         local.value.hideSeries('Series A');
//         local.value.hideSeries('Series B');
//         setTimeout(() => {
//             local.value.showSeries('Series A');
//             local.value.showSeries('Series B');
//             local.value.hideSeries('Series E');
//         }, 1000)
//     }
// })

// onMounted(() => {
//     setTimeout(() => {
//         dataset.value.push({
//             name: 'Series F',
//             series: makeDs(24)
//         })
//     }, 2000)
// })

// onMounted(async () => {
//     if (local.value) {
//         const img = await local.value.getImage();
//         console.log(img)
//     }
// })

function selectX({ dataset, index, indexLabel }) {
    // console.log({ dataset, index, indexLabel });
}

</script>

<template>
<div style="margin: 12px 0; color: white">
    Theme:
    <select v-model="currentTheme" @change="step += 1">
        <option v-for="opt in themeOptions">{{ opt }}</option>
    </select>
</div>

<div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
    <LocalVueUiStackline
        ref="resp"
        :dataset="dataset"
        :config="{
            ...config,
            responsive: true
        }"
    >

    </LocalVueUiStackline>
</div>

<Box comp="VueUiStackline" :dataset="dataset">
    <template #title>VueUiStackline</template>

    <template #local>
        <LocalVueUiStackline :dataset="dataset" :config="config" ref="local" @selectX="selectX" :selectedXIndex="selectedX">
            <!-- <template #pattern="{ datapoint, patternId }">
                <pattern :id="patternId" width="70" height="8" patternTransform="scale(2)"
                    patternUnits="userSpaceOnUse" opacity="0.5">
                    <rect width="100%" height="100%" fill="#FFFFFF20" />
                    <path fill="none" stroke="#ecc94b"
                        d="M-.02 22c8.373 0 11.938-4.695 16.32-9.662C20.785 7.258 25.728 2 35 2s14.215 5.258 18.7 10.338C58.082 17.305 61.647 22 70.02 22M-.02 14.002C8.353 14 11.918 9.306 16.3 4.339 20.785-.742 25.728-6 35-6S49.215-.742 53.7 4.339c4.382 4.967 7.947 9.661 16.32 9.664M70 6.004c-8.373-.001-11.918-4.698-16.3-9.665C49.215-8.742 44.272-14 35-14S20.785-8.742 16.3-3.661C11.918 1.306 8.353 6-.02 6.002" />
                </pattern>
            </template> -->
            <!-- <template #source>
                SRC
            </template> -->
        </LocalVueUiStackline>
    </template>

    <template #VDUI-local>
        <LocalVueDataUi component="VueUiStackline" :dataset="dataset" :config="config" :selectedXIndex="selectedX"/>
    </template>

    <template #build>
        <VueUiStackline :dataset="dataset" :config="config" :selectedXIndex="selectedX">

        </VueUiStackline>
    </template>

    <template #build-treesh>
        <VueUiStacklineTreeshaken :dataset="dataset" :config="config" :selectedXIndex="selectedX">

        </VueUiStacklineTreeshaken>
    </template>

    <template #VDUI-build>
        <VueDataUi component="VueUiStackline" :dataset="dataset" :config="config" :selectedXIndex="selectedX">

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