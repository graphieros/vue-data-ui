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

const dataset = ref([
    {
        name: "Serie 1",
        series: [10, 20, 30],
        color: "rgba(255,0,0,0.5)"
    },
    {
        name: "Serie 2",
        series: [-10, -20, -30],
    },
    {
        name: "Serie 3",
        series: [-5, 5, -5, -10],
    },
    {
        name: "Serie 4",
        series: [-5, 5, -5],
    },
    {
        name: "Serie 4",
        series: [5, -5, 5],
    },
]);

onMounted(() => {
    setTimeout(() => {
        dataset.value.push({
            name: 'ALT',
            series: [100, 100, 100, 100, 100, 100, 100, 100, 100]
        })
    }, 3000)
})

const model = ref([
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right']},

    { key: 'orientation', def: 'vertical', type:'select', options: ['vertical', 'horizontal']},
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'theme', def: '', type: 'select', options: ['', 'zen', 'hack', 'concrete']},
    { key: 'useCssAnimation', def: true, type: 'checkbox'},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF20', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.height', def: 500, type: 'number', min: 200, max: 1000},
    { key: 'style.chart.width', def: 800, type: 'number', min: 200, max: 1000},
    { key: 'style.chart.padding.top', def: 24, type: 'number', min: 0, max: 100},
    { key: 'style.chart.padding.right', def: 24, type: 'number', min: 0, max: 100},
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

])

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
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
                            values: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG']
                        }
                    }
                }
            }
        }
    }
});

const step = ref(0);

    
</script>

<template>

<div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
    <LocalVueUiStackbar :dataset="dataset" :config="{
        ...config,
        responsive: true,
    }" :key="`local_resp_${step}`"> 
    </LocalVueUiStackbar>
</div>

<Box>
    <template #title>VueUiStackbar</template>

    <template #local>
        <LocalVueUiStackbar :dataset="dataset" :config="config" :key="`local_${step}`">
        </LocalVueUiStackbar>
    </template>

    <template #VDUI-local>
        <LocalVueDataUi component="VueUiStackbar" :dataset="dataset" :config="config" :key="`local_vdui_${step}`">
        </LocalVueDataUi>
    </template>
    
    <template #build>
        <VueUiStackbar :dataset="dataset" :config="config" :key="`build_${step}`">
        </VueUiStackbar>
    </template>

    <template #VDUI-build>
        <VueDataUi component="VueUiStackbar" :dataset="dataset" :config="config" :key="`vdui_build_${step}`">
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