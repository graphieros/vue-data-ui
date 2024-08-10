<script setup>
import { ref, computed } from "vue";
import LocalVueUiQuickChart from '../src/components/vue-ui-quick-chart.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const datasets = ref({
    shortArray: [1, 2, -3, 5, 8],
    longArray: [1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
    longArrayNegative: [-1, -2, -3, -5, -8, -13, -21, -34, -55, -89],
    shortObject: [
        {
            name: 'Serie 1',
            values: [1, 2, 3, 4, 5]
        },
        {
            name: 'Serie 2',
            values: [2, 3, 4, 5, 6]
        },
        {
            name: 'Serie 3',
            values: [3, 4, 5, 6, 7]
        }
    ],
    shortObjectNegative: [
        {
            name: 'Serie 1',
            values: [-1, -2, -3, -4, -5]
        },
        {
            name: 'Serie 2',
            values: [-2, -3, -4, -5, -6]
        },
        {
            name: 'Serie 3',
            values: [-3, -4, -5, -6, -7]
        }
    ],
    shortObjectMixed: [
        {
            name: 'Serie 1',
            values: [-1, 2, -3, 4, -5]
        },
        {
            name: 'Serie 2',
            values: [-2, 3, -4, 5, -6]
        },
        {
            name: 'Serie 3',
            values: [-3, -4, -5, 6, -7]
        }
    ],
    longObject: [
        {
            name: 'Serie 1',
            values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        },
        {
            name: 'Serie 2',
            values: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
        },
        {
            name: 'Serie 3',
            values: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
        }
    ],
    longObjectNegative: [
        {
            name: 'Serie 1',
            values: [-1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12]
        },
        {
            name: 'Serie 2',
            values: [-2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12, -13]
        },
        {
            name: 'Serie 3',
            values: [-3, -4, -5, -6, -7, -8, -9, -10, -11, -12, -13, -14]
        }
    ],
    donut: [
        { name: 'Serie 1', value: 24},
        { name: 'Serie 2', value: 12},
        { name: 'Serie 3', value: 6},
        { name: 'Serie 4', value: 3},
        { name: 'Serie 5', value: 1.5}
    ]
})


const selectedSerie = ref('shortObjectMixed');

const model = ref([
    { key: 'userOptionsButtons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptionsButtons.img', def: true, type: 'checkbox'},
    { key: 'userOptionsButtons.fullscreen', def: true, type: 'checkbox'},
    { key: 'axisLabelsFontSize', def: 12, type: 'number', min: 8, max: 24},
    { key: 'barGap', def: 12, type: 'range', min: 0, max: 48},
    { key: 'barAnimated', def: true, type: 'checkbox' },
    { key: 'barStrokeWidth', def: 1, type: 'number', min: 0, max: 6},
    { key: 'blurOnHover', def: true, type: 'checkbox'},
    { key: 'chartIsBarUnderDatasetLength', def: 6, type: 'number', min: 2, max: 12},
    { key: 'color', def: '#1A1A1A', type: 'color'},
    { key: 'dataLabelFontSize', def: 14, type: 'number', min: 8, max: 42},
    { key: 'dataLabelRoundingPercentage', def: 2, type: 'number', min: 0, max: 12},
    { key: 'dataLabelRoundingValue', def: 2, type: 'number', min: 0, max: 12},
    { key: 'donutHideLabelUnderPercentage', def: 3, type: 'number', min: 1, max: 20},
    { key: 'donutLabelMarkerStrokeWidth', def: 1, type: 'number', min: 0, max: 12, step: 0.5},
    { key: 'donutRadiusRatio', def: 0.4, type: 'range', min: 0.1, max: 1, step: 0.01},
    { key: 'donutShowTotal', def: true, type: 'checkbox'},
    { key: 'donutStrokeWidth', def: 2, type: 'number', min: 0, max: 12},
    { key: 'donutThicknessRatio', def: 0.18, type: 'range', min: 0.01, max: 0.4, step: 0.01},
    { key: 'donutTotalLabelFontSize', def: 24, type: 'number', min: 8, max: 42},
    { key: 'donutTotalLabelText', def: 'Total', type: 'text'},
    { key: 'donutUseShadow', def: true, type: 'checkbox'},
    { key: 'donutShadowColor', def: '#1A1A1A', type: 'color'},
    { key: 'fontFamily', def:'inherit', type: 'text'},
    { key: 'height', def: 338, type: 'number', min: 100, max: 1000},
    { key: 'legendFontSize', def: 12, type: 'number', min: 8, max: 48},
    { key: 'legendIcon', def: 'starFill', type: 'text'},
    { key: 'legendIconSize', def: 12, type: 'number', min: 8, max: 48},
    { key: 'lineSmooth', def: true, type: 'checkbox'},
    { key: 'lineAnimated', def: false, type: 'checkbox' },
    { key: 'lineStrokeWidth', def: 2, type:'number', min: 0.5, max: 12, step: 0.5},
    { key: 'paletteStartIndex', def: 0, type: 'number', min: 0},
    { key: 'showDataLabels', def: true, type: 'checkbox'},
    { key: 'showLegend', def: true, type: 'checkbox'},
    { key: 'showTooltip', def: true, type: 'checkbox'},
    { key: 'showUserOptions', def: true, type: 'checkbox'},
    { key: 'title', def: 'Monumentum Aere Perennius', type: 'text'},
    { key: 'titleBold', def: true, type: 'checkbox'},
    { key: 'titleFontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'titleTextAlign', def: 'center', type: 'select', options: ['left', 'center', 'right']},
    { key: 'useCustomLegend', def: false, type: 'checkbox'},
    { key: 'valuePrefix', def: 'P', type: 'text'},
    { key: 'valueSuffix', def: 'S', type: 'text'},
    { key: 'width', def: 512, type: 'number', min: 200, max: 1500},
    { key: 'xAxisLabel', def: 'Lorem Ipsum X axis labellum', type: 'text'},
    { key: 'xyAxisStroke', def: '#CCCCCC', type: 'color'},
    { key: 'xyAxisStrokeWidth', def: 1, type: 'number', min: 0, max: 12},
    { key: 'xyGridStroke', def: '#CCCCCC', type: 'color'},
    { key: 'xyGridStrokeWidth', def: 0.5, type: 'number', min: 0, max: 12, step: 0.5},
    { key: 'xyHighlighterColor', def: '#1A1A1A', type: 'color'},
    { key: 'xyHighlighterOpacity', def: 0.05, type: 'number', min: 0.05, max: 1, step: 0.01},
    { key: 'xyLabelsXFontSize', def: 8, type: 'number', min: 8, max: 24},
    { key: 'xyLabelsYFontSize', def: 12, type: 'number', min: 8, max: 24},
    { key: 'xyPaddingBottom', def: 48, type: 'number', min: 0, max: 100},
    { key: 'xyPaddingLeft', def: 48, type: 'number', min: 0, max: 100},
    { key: 'xyPaddingRight', def: 12, type: 'number', min: 0, max: 100},
    { key: 'xyPaddingTop', def: 12, type: 'number', min: 0, max: 100},
    { key: 'xyPeriodLabelsRotation', def: 0, type: 'number', min: -360, max: 360},
    { key: 'xyScaleSegments', def: 15, type: 'number', min: 2, max: 20},
    { key: 'xyShowAxis', def: true, type: 'checkbox'},
    { key: 'xyShowGrid', def: true, type: 'checkbox'},
    { key: 'xyShowScale', def: true, type: 'checkbox'},
    { key: 'yAxisLabel', def: 'Lorem ipsum Y axis labellum'},
    { key: 'zoomXy', def: true, type: 'checkbox'},
    { key: 'zoomColor', def: '#CCCCCC', type: 'color'},
    { key: 'zoomHighlightColor', def: '#1A1A1A', type: 'color'},
    { key: 'zoomFontSize', def: 14, type: 'number', min: 8, max: 48},
    { key: 'zoomUseResetSlot', def: false, type: 'checkbox'}

])

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default"
])

const currentTheme = ref(themeOptions.value[3])

const config = computed(() => {
    return {
        ...convertArrayToObject(model.value),
        theme: currentTheme.value,
        customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
        xyPeriods: ['01-2025', '02-2025', '03-2025', '04-2025', '05-2025', '06-2025', '07-2025', '08-2025', '09-2025', '10-2025', '11-2025', '12-2025']
    }
})

const step = ref(0)

const dataset = computed(() => datasets.value[selectedSerie.value])

function selectLegend(legend) {
    console.log({ legend })
} 

function selectDatapoint(datapoint) {
    console.log({ datapoint })
}

</script>

<template>
<div style="margin: 12px 0; color: white">
    Theme:
    <select v-model="currentTheme" @change="step += 1">
        <option v-for="opt in themeOptions">{{ opt }}</option>
    </select>
</div>
<select v-model="selectedSerie" @change="step += 1">
    <option v-for="key in Object.keys(datasets)">{{ key }}</option>
</select>
<Box>
    <template #title>VueUiQuickChart</template>

    <template #local>
        <LocalVueUiQuickChart :dataset="dataset" :config="config" :key="`local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint">
            <template #optionPdf>
                PRINT PDF
            </template>
            <template #legend="{ legend }">
                #LEGEND
                <div style="font-size: 8px">
                    {{ legend }}
                </div>
            </template>
            <template #tooltip-before="{ seriesIndex }">
                #BEFORE {{ seriesIndex }}
            </template>
            <template #tooltip-after="{ seriesIndex }">
                #AFTER {{ seriesIndex }}
            </template>
            <template #reset-action="{ reset }">
                <button @click="reset()">REFRESH</button>
            </template>
        </LocalVueUiQuickChart>
    </template>

    <template #VDUI-local>
        <LocalVueDataUi component="VueUiQuickChart" :dataset="dataset" :config="config" :key="`VDUI-lodal_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint">
            <template #legend="{ legend }">
                #LEGEND
                <div style="font-size: 8px">
                    {{ legend }}
                </div>
            </template>
            <template #tooltip-before="{ seriesIndex }">
                #BEFORE {{ seriesIndex }}
            </template>
            <template #tooltip-after="{ seriesIndex }">
                #AFTER {{ seriesIndex }}
            </template>
            <template #reset-action="{ reset }">
                <button @click="reset()">REFRESH</button>
            </template>
        </LocalVueDataUi>
    </template>

    <template #build>
        <VueUiQuickChart :dataset="dataset" :config="config" :key="`build_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint">
            <template #legend="{ legend }">
                #LEGEND
                <div style="font-size: 8px">
                    {{ legend }}
                </div>
            </template>
            <template #tooltip-before="{ seriesIndex }">
                #BEFORE {{ seriesIndex }}
            </template>
            <template #tooltip-after="{ seriesIndex }">
                #AFTER {{ seriesIndex }}
            </template>
            <template #reset-action="{ reset }">
                <button @click="reset()">REFRESH</button>
            </template>
        </VueUiQuickChart>
    </template>

    <template #VDUI-build>
        <VueDataUi component="VueUiQuickChart" :dataset="dataset" :config="config" :key="`VDUI-build_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint">
            <template #legend="{ legend }">
                #LEGEND
                <div style="font-size: 8px">
                    {{ legend }}
                </div>
            </template>
            <template #tooltip-before="{ seriesIndex }">
                #BEFORE {{ seriesIndex }}
            </template>
            <template #tooltip-after="{ seriesIndex }">
                #AFTER {{ seriesIndex }}
            </template>
            <template #reset-action="{ reset }">
                <button @click="reset()">REFRESH</button>
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