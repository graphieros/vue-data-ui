<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiQuickChart from '../src/components/vue-ui-quick-chart.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

function makeDs(m, n = 100) {
    const arr = [];
    for (let i = 0; i < m; i += 1) {
        arr.push(Math.random() * n)
    }
    return arr
}

function makeTime(m, n) {
    const arr = [];
    for (let i = 0; i < m; i += 1) {
        arr.push(`period ${i}`)
    }
    return arr
}

const datasets = ref({
    shortArray: [1, 2, -3, 5, 8],
    longArray: makeDs(100),
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
            values: [12, 7, 4, 11, 13, 16, 19, 22, 15, 28, 16, 12]
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
        { name: 'Serie 1', value: 12},
        { name: 'Serie 2', value: 12},
        { name: 'Serie 3', value: 6},
        { name: 'Serie 4', value: 3},
        { name: 'Serie 5', value: 1.5}
    ]
})

const alternateDataset = ref([8, 12, 13, 25, 31, 42])

const alternateConfig = ref({
    backgroundColor: '#CCCCCC',
})

const isPropsToggled = ref(false);
function toggleProps() {
    isPropsToggled.value = !isPropsToggled.value;
}

function alterDataset() {
    datasets.value.shortArray.push(Math.random() * 50)
}


const selectedSerie = ref('longArray');

const model = ref([
    { key: 'debug', def: true, type: 'checkbox'},
    { key: 'loading', def: false, type: 'checkbox'},
    { key: 'backgroundColor', def: '#FFFFFF20', type: 'color'},
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'userOptionsButtons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptionsButtons.img', def: true, type: 'checkbox'},
    { key: 'userOptionsButtons.fullscreen', def: true, type: 'checkbox'},
    { key: 'userOptionsPosition', def: 'right', type: 'select', options: ['left', 'right']},
    { key: 'showUserOptionsOnChartHover', def: true, type: 'checkbox'},
    { key: 'keepUserOptionsStateOnChartLeave', def: true, type: 'checkbox'},

    { key: 'userOptionsPrint.scale', def: 2, type: 'number', min: 1, max: 5},
    { key: 'userOptionsPrint.allowTaint', def: true, type: 'checkbox'},
    { key: 'userOptionsPrint.useCORS', def: true, type: 'checkbox'},
    { key: 'userOptionsPrint.backgroundColor', def: '#FFFFFF' },

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
    { key: 'donutRadiusRatio', def: 0.2, type: 'range', min: 0.1, max: 1, step: 0.01},
    { key: 'donutShowTotal', def: true, type: 'checkbox'},
    { key: 'donutStrokeWidth', def: 2, type: 'number', min: 0, max: 12},
    { key: 'donutStroke', def: '#FFFFFF', type: 'color'},

    { key: 'donutThicknessRatio', def: 0.05, type: 'range', min: 0.01, max: 0.4, step: 0.01},
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

    { key: 'tooltipFontSize', def: 14, type: 'number', min: 8, max: 42},
    { key: 'tooltipBackgroundOpacity', def: 100, type: 'range', min: 0, max: 100},
    { key: 'tooltipPosition', def: 'center', type: 'select', options: ['left', 'center', 'right']},
    { key: 'tooltipOffsetY', def: 24, type: 'number', min: 0, max: 48 },
    
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
    { key: 'xyLabelsXFontSize', def: 14, type: 'number', min: 8, max: 24},
    { key: 'xyLabelsYFontSize', def: 14, type: 'number', min: 8, max: 24},
    { key: 'xyPaddingBottom', def: 48, type: 'number', min: 0, max: 100},
    { key: 'xyPaddingLeft', def: 48, type: 'number', min: 0, max: 100},
    { key: 'xyPaddingRight', def: 12, type: 'number', min: 0, max: 100},
    { key: 'xyPaddingTop', def: 12, type: 'number', min: 0, max: 100},
    { key: 'xyPeriodLabelsRotation', def: 0, type: 'number', min: -360, max: 360},
    { key: 'xyPeriodsShowOnlyAtModulo', def: true, type: 'checkbox' },
    { key: 'xyPeriodsModulo', def: 12, type: 'number', min: 0, max: 12 },

    { key: 'xyScaleSegments', def: 15, type: 'number', min: 2, max: 20},
    { key: 'xyShowAxis', def: true, type: 'checkbox'},
    { key: 'xyShowGrid', def: true, type: 'checkbox'},
    { key: 'xyShowScale', def: true, type: 'checkbox'},
    { key: 'yAxisLabel', def: 'Lorem ipsum Y axis labellum'},
    
    { key: 'zoomXy', def: true, type: 'checkbox'},
    { key: 'zoomColor', def: '#CCCCCC', type: 'color'},
    { key: 'zoomHighlightColor', def: '#1A1A1A', type: 'color'},
    { key: 'zoomFontSize', def: 14, type: 'number', min: 8, max: 48},
    { key: 'zoomUseResetSlot', def: false, type: 'checkbox'},

    { key: 'zoomMinimap.show', def: true, type: 'checkbox'},
    { key: 'zoomMinimap.smooth', def: true, type: 'checkbox'},
    { key: 'zoomMinimap.selectedColor', def: '#1F77B4', type: 'color'},
    { key: 'zoomMinimap.selectedColorOpacity', def: 0.2, type: 'range', min: 0, max: 0.5, step: 0.01},
    { key: 'zoomMinimap.lineColor', def: '#1A1A1A', type: 'color'},
    { key: 'zoomMinimap.selectionRadius', def: 2, type: 'range', min: 0, max: 24},
    { key: 'zoomMinimap.indicatorColor', def: '#1A1A1A', type: 'color'},
    { key: 'zoomMinimap.verticalHandles', def: true, type: 'checkbox'},

    { key: 'zoomStartIndex', def: null, type: 'number', min: 0, max: 100},
    { key: 'zoomEndIndex', def: null, type: 'number', min: 0, max: 100},
    { key: 'zoomEnableRangeHandles', def: true, type: 'chexkbox'},
    { key: 'zoomEnableSelectionDrag', def: true, type: 'chexkbox'},
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

const monthValues = computed(() => {
    const yearStart = 2026
    const arr = []

    for (let i = 0; i < 100; i++) {
        const d = new Date(yearStart, i, 1)
        arr.push(d.getTime())
    }

    return arr
})

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        events: {
            datapointEnter: ({ datapoint, seriesIndex }) => {
                console.log('enter event', { datapoint, seriesIndex });
            },
            datapointLeave: ({ datapoint, seriesIndex }) => {
                console.log('leave event', { datapoint, seriesIndex });
            },
            datapointClick: ({ datapoint, seriesIndex }) => {
                console.log('click event', { datapoint, seriesIndex });
            },
        },
        formatter: ({value, config}) => {
            // console.log(config)
            return `f - ${value}`
        },
        theme: currentTheme.value,
        customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
        xyPeriods: monthValues.value,
        // xyPeriods: new Array(100).fill(0).map((el,i) => {
        //     return `Some long label\nfor index ${i}`
        // }),
        datetimeFormatter: {
            enable: false
        }
    }
})

const step = ref(0)

const dataset = ref([]);

onMounted(() => {
    setTimeout(() => {
        dataset.value = datasets.value[selectedSerie.value]
    }, 2000)
})

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

<button @click="toggleProps">TOGGLE PROPS: {{ isPropsToggled }}</button>
<button @click="alterDataset">ALTER DATASET (shortArray only)</button>

<div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
        <LocalVueUiQuickChart :key="`responsive_${step}`" :dataset="dataset" :config="{
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
    </LocalVueUiQuickChart>
    </div>

<Box comp="VueUiQuickChart" :dataset="dataset">
    <template #title>VueUiQuickChart</template>

    <template #local>
        <LocalVueUiQuickChart :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint">
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
        <LocalVueDataUi component="VueUiQuickChart" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint">
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
        <VueUiQuickChart :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint">
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
        <VueDataUi component="VueUiQuickChart" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint">
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