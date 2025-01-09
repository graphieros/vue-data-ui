<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiStackbar from '../src/components/vue-ui-stackbar.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

// const dataset = ref([
//     {
//         name: "Serie 1",
//         series: [100, 200],
//     },
//     {
//         name: "Serie 2",
//         series: [50, 100],
//     },
// ]);

const dataset = computed(() => {
  return [
    {
      name: "Series 1",
      series: [
        10, 20, 30, 10, 20, 4, 4, 5, 99, 34, 8, 43, 2, 8, 0, 52, 5, 3, 6, 23, 9,
        18, 3, 5, 87, 5, 3, 5, 25, 12,
      ],
    },
    {
      name: "Series 2",
      series: [20, 40, -60, 20, 10],
    },
    {
      name: "Series 3",
      series: [20, 40, 60, 20, 10],
    },
  ];
});

// const dataset = ref([
//     {
//         name: "Serie 1",
//         series: [0, 0, 30],
//         color: "rgba(255,0,0,0.5)"
//     },
//     {
//         name: "Serie 2",
//         series: [0, -20, -30],
//     },
//     {
//         name: "Serie 3",
//         series: [0, 5, -5, -10],
//     },
//     {
//         name: "Serie 4",
//         series: [0, 5, -5],
//     },
//     {
//         name: "Serie 4",
//         series: [0, -5, 5],
//     },
// ]);

// onMounted(() => {
//     setTimeout(() => {
//         dataset.value.push({
//             name: 'ALT',
//             series: [100, 100, 100, 100, 100, 100, 100, 100, 100]
//         })
//     }, 3000)
// })

const model = ref([
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right']},

    { key: 'orientation', def: 'vertical', type:'select', options: ['vertical', 'horizontal']},
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'theme', def: '', type: 'select', options: ['', 'zen', 'hack', 'concrete']},
    { key: 'useCssAnimation', def: true, type: 'checkbox'},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.height', def: 500, type: 'number', min: 200, max: 1000},
    { key: 'style.chart.width', def: 800, type: 'number', min: 200, max: 1000},
    { key: 'style.chart.padding.top', def: 24, type: 'number', min: 0, max: 100},
    { key: 'style.chart.padding.right', def: 64, type: 'number', min: 0, max: 100},
    { key: 'style.chart.padding.bottom', def: 36, type: 'number', min: 0, max: 100},
    { key: 'style.chart.padding.left', def: 48, type: 'number', min: 0, max: 100},

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

    { key: 'style.chart.zoom.show', def: true, type: 'checkbox'},
    { key: 'style.chart.zoom.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.zoom.highlightColor', def: '#5A5A5A', type: 'color'},
    { key: 'style.chart.zoom.fontSize', def: 14, type: 'number', min: 8, max: 42},
    { key: 'style.chart.zoom.startIndex', def:1, type: 'number', min: 0, max: 100},
    { key: 'style.chart.zoom.endIndex', def: 2, type: 'number', min: 0, max: 100},
    { key: 'style.chart.zoom.enableRangeHandles', def: true, type: 'chexkbox'},
    { key: 'style.chart.zoom.enableSelectionDrag', def: true, type: 'chexkbox'},

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
    { key: 'style.chart.tooltip.roundingValue', def: 0, type: 'number', min: 0, max: 6},
    { key: 'style.chart.tooltip.roundingPercentage', def: 0, type: 'number', min: 0, max: 6},
    { key: 'style.chart.tooltip.showTimeLabel', def: true, type: 'checkbox'},

    { key: 'style.chart.highlighter.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.highlighter.opacity', def: 5, type: 'range', min: 0, max: 30},
    
    { key: 'style.chart.bars.gapRatio', def: 0.5, type: 'range', min: 0, max: 1, step: 0.01 },
    { key: 'style.chart.bars.distributed', def: false, type: 'checkbox'},
    { key: 'style.chart.bars.showDistributedPercentage', def: true, type: 'checkbox'},
    { key: 'style.chart.bars.borderRadius', def: 6, type: 'number', min: 0, max: 12},
    { key: 'style.chart.bars.strokeWidth', def: 1, type: 'number', min: 0, max: 12},

    { key: 'style.chart.bars.gradient.show', def: true, type: 'checkbox'},
    { key: 'style.chart.bars.gradient.intensity', def: 20, type: 'range', min: 0, max: 100},

    { key: 'style.chart.bars.totalValues.show', def: true, type: 'checkbox' },
    { key: 'style.chart.bars.totalValues.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.bars.totalValues.fontSize', def: 16, type: 'number', min: 8, max: 42},
    { key: 'style.chart.bars.totalValues.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.bars.totalValues.color', def: '#1A1A1A', type: 'color'},

    { key: 'style.chart.bars.dataLabels.show', def: true, type: 'checkbox'},
    { key: 'style.chart.bars.dataLabels.hideEmptyValues', def: false, type: 'checkbox'},
    { key: 'style.chart.bars.dataLabels.hideEmptyPercentages', def: true, type: 'checkbox'},

    { key: 'style.chart.bars.dataLabels.adaptColorToBackground', def: true, type: 'checkbox'},
    { key: 'style.chart.bars.dataLabels.color', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.bars.dataLabels.fontSize', def: 14, type: 'number', min: 8, max: 42},
    { key: 'style.chart.bars.dataLabels.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.bars.dataLabels.rounding', def: 2, type: 'number', min: 0, max: 6},
    { key: 'style.chart.bars.dataLabels.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.bars.dataLabels.suffix', def: 'S', type: 'text'},

    { key: 'style.chart.grid.scale.ticks', def: 10, type: 'select', options: [2, 5, 10, 20]},
    { key: 'style.chart.grid.scale.scaleMin', def: null, type: 'number', min: -1000, max: 1000},
    { key: 'style.chart.grid.scale.scaleMax', def: null, type: 'number', min: -1000, max: 1000},

    { key: 'style.chart.grid.x.showAxis', def: true, type: 'checkbox'},
    { key: 'style.chart.grid.x.showHorizontalLines', def: true, type: 'checkbox'},
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
    { key: 'style.chart.grid.x.timeLabels.fontSize', def: 14, type: 'number', min: 8, max: 42},
    { key: 'style.chart.grid.x.timeLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.grid.x.timeLabels.bold', def: false, type: 'checkbox'},

    { key: 'style.chart.grid.y.showAxis', def: true, type: 'checkbox'},
    { key: 'style.chart.grid.y.showVerticalLines', def: false, type: 'checkbox'},
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

    { key: 'table.td.roundingValue', def: 2, type: 'number', min: 0, max: 6},

    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},

])

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
    return {
        ...c,
        theme: currentTheme.value,
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                bars: {
                    ...c.style.chart.bars,
                    dataLabels: {
                        ...c.style.chart.bars.dataLabels,
                        // formatter: ({value, config}) => {
                        //     return `f | ${value}`
                        // }
                    }
                },
                grid: {
                    ...c.style.chart.grid,
                    x: {
                        ...c.style.chart.grid.x,
                        timeLabels: {
                            ...c.style.chart.grid.x.timeLabels,
                            // values: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG']
                        }
                    }
                }
            }
        }
    }
});

const step = ref(0);

function selectTimeLabel(data) {
    console.log(data)
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
    <LocalVueUiStackbar :dataset="dataset" :config="{...config,
        responsive: true,
    }" :key="`local_resp_${step}`" @selectTimeLabel="selectTimeLabel"> 
            <template #chart-background>
                <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
            </template>

            <template #source>
                <div style="width:100%;font-size:10px;text-align:left">
                    SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                </div>
            </template>
            <template #time-label="{x, y, fontSize, fill, transform, absoluteIndex, content, textAnchor }">
                <g @click="() => selectTimeLabel({x, y, fontSize, absoluteIndex })">                
                    <text
                        :x="x"
                        :y="y"
                        :font-size="fontSize"
                        :text-anchor="textAnchor"
                        :fill="fill"
                    >
                        {{ content }}
                    </text>
                    <text
                        :x="x"
                        :y="y + fontSize"
                        :font-size="fontSize * 0.8"
                        :text-anchor="textAnchor"
                        fill="grey"
                    >
                        {{ content }}
                    </text>
                </g>
            </template>

            <template #pattern="{ seriesIndex, patternId }">
                <pattern v-if="seriesIndex === 0" :id="patternId" width="70" height="8" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="none" stroke="#1A1A1A" d="M-.02 22c8.373 0 11.938-4.695 16.32-9.662C20.785 7.258 25.728 2 35 2s14.215 5.258 18.7 10.338C58.082 17.305 61.647 22 70.02 22M-.02 14.002C8.353 14 11.918 9.306 16.3 4.339 20.785-.742 25.728-6 35-6S49.215-.742 53.7 4.339c4.382 4.967 7.947 9.661 16.32 9.664M70 6.004c-8.373-.001-11.918-4.698-16.3-9.665C49.215-8.742 44.272-14 35-14S20.785-8.742 16.3-3.661C11.918 1.306 8.353 6-.02 6.002"/></pattern>

                <pattern v-if="seriesIndex === 1" :id="patternId" width="29" height="50.115" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="none" stroke="#ecc94b" stroke-linecap="square" stroke-width=".5" d="M14.5 6.628 8.886 3.372v-6.515L14.502-6.4l5.612 3.257-.001 6.514zm0 50.06-5.613-3.256v-6.515l5.614-3.258 5.612 3.257-.001 6.515zm14.497-25.117-5.612-3.257v-6.515L29 18.541l5.612 3.257-.001 6.515zm-29 0-5.612-3.257v-6.515L0 18.541l5.612 3.257v6.515zM14.5 11.82 4.36 5.967l.002-11.706 10.14-5.855L24.638-5.74l-.001 11.707zm0 50.06L4.36 56.028l.002-11.706 10.14-5.855 10.137 5.852-.001 11.707zm14.498-25.118-10.14-5.852.002-11.707L29 13.349l10.137 5.853-.001 11.706zm-29 0-10.139-5.852.002-11.707L0 13.349l10.138 5.853-.002 11.706zm14.501-19.905L0 8.488.002-8.257l14.5-8.374L29-8.26l-.002 16.745zm0 50.06L0 58.548l.002-16.745 14.5-8.373L29 41.8l-.002 16.744zM28.996 41.8l-14.498-8.37.002-16.744L29 8.312l14.498 8.37-.002 16.745zm-29 0-14.498-8.37.002-16.744L0 8.312l14.498 8.37-.002 16.745z"/></pattern>

                <pattern v-if="seriesIndex === 2" :id="patternId" width="40" height="40" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="#ecc94b" d="M20 8.52h20v2.96H20zM20 20h20v20H20z"/><path fill="#f44034" d="M21.63 0 20 1.63v1.54L23.15 0zm3.08 0L20 4.71v1.54L26.25 0zm3.08 0L20 7.79v1.53L29.32 0zm3.07 0L20 10.86v1.54L32.4 0zm3.08 0L20 13.94v1.54L35.48 0zm3.08 0L20 17.02v1.54L38.55 0zM40 .1l-20 20L.1 40h1.53L40 1.63zm0 3.07L3.17 40h1.54L40 4.71zm0 3.08L6.25 40h1.54L40 7.79zm0 3.07L9.32 40h1.54L40 10.86zm0 3.08L12.4 40h1.54L40 13.94zm0 3.08L15.48 40h1.54L40 17.02zm0 3.08L18.55 40h1.55L40 20.1V20zM1.63 20 0 21.63v1.54L3.15 20zm3.08 0L0 24.71v1.54L6.25 20zm3.08 0L0 27.79v1.53L9.32 20zm3.07 0L0 30.86v1.54L12.4 20zm3.08 0L0 33.94v1.54L15.48 20zm3.08 0L0 37.02v1.54L18.55 20zM40 21.63 21.63 40h1.54L40 23.17zm0 3.08L24.71 40h1.54L40 26.25zm0 3.08L27.79 40h1.53L40 29.33zm0 3.08L30.86 40h1.54l7.6-7.6zm0 3.07L33.94 40h1.54L40 35.48zm0 3.08L37.02 40h1.54L40 38.56zM9.32 0l-.8.8v1.54L10.86 0zm2.16.92L8.52 3.88v1.54l2.96-2.96zm0 3.08L8.52 6.96V8.5l2.96-2.96zm0 3.08-1.44 1.44-2.96 2.96h1.44v.1l.1-.1 2.86-2.87.1-.09h-.1zM.8 8.52l-.8.8v1.54l2.34-2.34zm3.08 0L.92 11.48h1.54l2.96-2.96zm3.08 0L4 11.48h1.54L8.5 8.52zm6.16 0-1.64 1.63-1.33 1.33-1.63 1.63v1.54l2.96-2.96v-.21h.21l2.96-2.96zm3.07 0-2.96 2.96h1.54l2.96-2.96zm3.08 0-2.96 2.96h1.53L20 9.32v-.8zm.73 2.34-.62.62H20zm-8.52 2.37-2.96 2.96v1.54l2.96-2.96zm0 3.07-2.96 2.97V40h2.96V20H9.32l2.16-2.16z"/></pattern>
            </template>
    </LocalVueUiStackbar>
</div>

<!-- <div style="width: 200px; position: fixed; top: 64px; left: 400px; transform-origin: right top; transform: translateY(0px)">
    <LocalVueUiStackbar :dataset="dataset" :config="config" :key="`local_${step}`">
    </LocalVueUiStackbar>
</div> -->

<Box>
    <template #title>VueUiStackbar</template>

    <template #local>
        <LocalVueUiStackbar :dataset="dataset" :config="config" :key="`local_${step}`">
            <template #time-label="{x, y, fontSize, fill, transform, absoluteIndex, content, textAnchor }">
                <g @click="() => selectTimeLabel({x, y, fontSize, absoluteIndex })">                
                    <text
                        :x="x"
                        :y="y"
                        :font-size="fontSize"
                        :text-anchor="textAnchor"
                        :fill="fill"
                    >
                        {{ content }}
                    </text>
                    <text
                        :x="x"
                        :y="y + fontSize"
                        :font-size="fontSize * 0.8"
                        :text-anchor="textAnchor"
                        fill="grey"
                    >
                        {{ content }}
                    </text>
                </g>
            </template>
        </LocalVueUiStackbar>
    </template>

    <template #VDUI-local>
        <LocalVueDataUi component="VueUiStackbar" :dataset="dataset" :config="config" :key="`local_vdui_${step}`">
            <template #time-label="{x, y, fontSize, fill, transform, absoluteIndex, content, textAnchor }">
                <g @click="() => selectTimeLabel({x, y, fontSize, absoluteIndex })">                
                    <text
                        :x="x"
                        :y="y"
                        :font-size="fontSize"
                        :text-anchor="textAnchor"
                        :fill="fill"
                    >
                        {{ content }}
                    </text>
                    <text
                        :x="x"
                        :y="y + fontSize"
                        :font-size="fontSize * 0.8"
                        :text-anchor="textAnchor"
                        fill="grey"
                    >
                        {{ content }}
                    </text>
                </g>
            </template>
        </LocalVueDataUi>
    </template>
    
    <template #build>
        <VueUiStackbar :dataset="dataset" :config="config" :key="`build_${step}`">
            <template #time-label="{x, y, fontSize, fill, transform, absoluteIndex, content, textAnchor }">
                <g @click="() => selectTimeLabel({x, y, fontSize, absoluteIndex })">                
                    <text
                        :x="x"
                        :y="y"
                        :font-size="fontSize"
                        :text-anchor="textAnchor"
                        :fill="fill"
                    >
                        {{ content }}
                    </text>
                    <text
                        :x="x"
                        :y="y + fontSize"
                        :font-size="fontSize * 0.8"
                        :text-anchor="textAnchor"
                        fill="grey"
                    >
                        {{ content }}
                    </text>
                </g>
            </template>
        </VueUiStackbar>
    </template>

    <template #VDUI-build>
        <VueDataUi component="VueUiStackbar" :dataset="dataset" :config="config" :key="`vdui_build_${step}`">
            <template #time-label="{x, y, fontSize, fill, transform, absoluteIndex, content, textAnchor }">
                <g @click="() => selectTimeLabel({x, y, fontSize, absoluteIndex })">                
                    <text
                        :x="x"
                        :y="y"
                        :font-size="fontSize"
                        :text-anchor="textAnchor"
                        :fill="fill"
                    >
                        {{ content }}
                    </text>
                    <text
                        :x="x"
                        :y="y + fontSize"
                        :font-size="fontSize * 0.8"
                        :text-anchor="textAnchor"
                        fill="grey"
                    >
                        {{ content }}
                    </text>
                </g>
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