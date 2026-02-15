<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiQuickChart from '../src/components/vue-ui-quick-chart.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { VueUiQuickChart } from "vue-data-ui";
import { VueUiQuickChart as VueUiQuickChartTreeshaken } from "vue-data-ui/vue-ui-quick-chart";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"
import useThemeOptions from "./useThemeOptions";

const { vue_ui_quick_chart: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

function makeDs(m, n = 100) {
    const arr = [];
    for (let i = 0; i < m; i += 1) {
        if (i > 20 && i < 40) {
            arr.push(null);
        } else {
            arr.push(Math.random() * n)
        }
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
    longObjectMixed: [
        {
            name: 'Serie 1',
            values: [12, 7, 4, 11, 13, 16, 19, 22, 15, 28, 16, 12]
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


const selectedSerie = ref('longObject');

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX('useCursorPointer', { def: false }),
    CHECKBOX("loading", { def: false }),
    COLOR("backgroundColor", { def: "#FFFFFF" }),
    CHECKBOX("responsive", { def: false }),
    CHECKBOX("userOptionsButtons.pdf", { def: true }),
    CHECKBOX("userOptionsButtons.img", { def: true }),
    CHECKBOX("userOptionsButtons.fullscreen", { def: true }),
    SELECT("userOptionsPosition", ["left", "right"], { def: "right" }),
    CHECKBOX("showUserOptionsOnChartHover", { def: true }),
    CHECKBOX("keepUserOptionsStateOnChartLeave", { def: true }),

    NUMBER("userOptionsPrint.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptionsPrint.allowTaint", { def: true }),
    CHECKBOX("userOptionsPrint.useCORS", { def: true }),
    COLOR("userOptionsPrint.backgroundColor", { def: "#FFFFFF" }),

    NUMBER("axisLabelsFontSize", { def: 12, min: 8, max: 24 }),
    RANGE("barGap", { def: 12, min: 0, max: 48 }),
    CHECKBOX("barAnimated", { def: true }),
    NUMBER("barStrokeWidth", { def: 1, min: 0, max: 6 }),
    CHECKBOX("blurOnHover", { def: true }),
    NUMBER("chartIsBarUnderDatasetLength", { def: 6, min: 2, max: 12 }),
    COLOR("color", { def: "#1A1A1A" }),
    NUMBER("dataLabelFontSize", { def: 14, min: 8, max: 42 }),
    NUMBER("dataLabelRoundingPercentage", { def: 2, min: 0, max: 12 }),
    NUMBER("dataLabelRoundingValue", { def: 2, min: 0, max: 12 }),
    NUMBER("donutHideLabelUnderPercentage", { def: 3, min: 1, max: 20 }),
    NUMBER("donutLabelMarkerStrokeWidth", { def: 1, min: 0, max: 12, step: 0.5 }),
    RANGE("donutRadiusRatio", { def: 0.2, min: 0.1, max: 1, step: 0.01 }),
    CHECKBOX("donutShowTotal", { def: true }),
    NUMBER("donutStrokeWidth", { def: 2, min: 0, max: 12 }),
    COLOR("donutStroke", { def: "#FFFFFF" }),

    RANGE("donutThicknessRatio", { def: 0.05, min: 0.01, max: 0.4, step: 0.01 }),
    NUMBER("donutTotalLabelFontSize", { def: 24, min: 8, max: 42 }),
    TEXT("donutTotalLabelText", { def: "Total" }),
    CHECKBOX("donutUseShadow", { def: true }),
    COLOR("donutShadowColor", { def: "#1A1A1A" }),
    TEXT("fontFamily", { def: "inherit" }),
    NUMBER("height", { def: 338, min: 100, max: 1000 }),
    NUMBER("legendFontSize", { def: 12, min: 8, max: 48 }),
    TEXT("legendIcon", { def: "starFill" }),
    NUMBER("legendIconSize", { def: 12, min: 8, max: 48 }),
    SELECT("legendPosition", ["top", "bottom"], { def: "bottom" }),
    CHECKBOX('showLegendSelectAllToggle', { def: true }),

    CHECKBOX("lineSmooth", { def: true }),
    CHECKBOX("lineAnimated", { def: false }),
    NUMBER("lineStrokeWidth", { def: 2, min: 0.5, max: 12, step: 0.5 }),
    NUMBER("paletteStartIndex", { def: 0, min: 0 }),
    CHECKBOX("showDataLabels", { def: true }),
    CHECKBOX("showLegend", { def: true }),
    CHECKBOX("showTooltip", { def: true }),
    CHECKBOX("showUserOptions", { def: true }),
    TEXT("title", { def: "Monumentum Aere Perennius" }),
    CHECKBOX("titleBold", { def: true }),
    NUMBER("titleFontSize", { def: 16, min: 8, max: 48 }),
    SELECT("titleTextAlign", ["left", "center", "right"], { def: "center" }),

    NUMBER("tooltipFontSize", { def: 14, min: 8, max: 42 }),
    RANGE("tooltipBackgroundOpacity", { def: 100, min: 0, max: 100 }),
    SELECT("tooltipPosition", ["left", "center", "right"], { def: "center" }),
    NUMBER("tooltipOffsetY", { def: 24, min: 0, max: 48 }),

    CHECKBOX("useCustomLegend", { def: false }),
    TEXT("valuePrefix", { def: "P" }),
    TEXT("valueSuffix", { def: "S" }),
    NUMBER("width", { def: 512, min: 200, max: 1500 }),
    TEXT("xAxisLabel", { def: "Lorem Ipsum X axis labellum" }),
    COLOR("xyAxisStroke", { def: "#CCCCCC" }),
    NUMBER("xyAxisStrokeWidth", { def: 1, min: 0, max: 12 }),
    COLOR("xyGridStroke", { def: "#CCCCCC" }),
    NUMBER("xyGridStrokeWidth", { def: 0.5, min: 0, max: 12, step: 0.5 }),
    COLOR("xyHighlighterColor", { def: "#1A1A1A" }),
    NUMBER("xyHighlighterOpacity", { def: 0.05, min: 0.05, max: 1, step: 0.01 }),
    NUMBER("xyLabelsXFontSize", { def: 14, min: 8, max: 24 }),
    NUMBER("xyLabelsYFontSize", { def: 14, min: 8, max: 24 }),
    NUMBER("xyPaddingBottom", { def: 48, min: 0, max: 100 }),
    NUMBER("xyPaddingLeft", { def: 48, min: 0, max: 100 }),
    NUMBER("xyPaddingRight", { def: 12, min: 0, max: 100 }),
    NUMBER("xyPaddingTop", { def: 12, min: 0, max: 100 }),
    NUMBER("xyPeriodLabelsRotation", { def: 0, min: -360, max: 360 }),
    CHECKBOX("xyPeriodLabelsAutoRotate.enable", { def: true }),
    NUMBER("xyPeriodLabelsAutoRotate.angle", { def: -90, min: -90, max: 90 }),

    CHECKBOX("xyPeriodsShowOnlyAtModulo", { def: true }),
    NUMBER("xyPeriodsModulo", { def: 12, min: 0, max: 12 }),

    NUMBER("xyScaleSegments", { def: 15, min: 2, max: 20 }),
    CHECKBOX("xyShowAxis", { def: true }),
    CHECKBOX("xyShowGrid", { def: true }),
    CHECKBOX("xyShowScale", { def: true }),
    TEXT("yAxisLabel", { def: "Lorem ipsum Y axis labellum" }),

    CHECKBOX("zoomXy", { def: true }),
    RANGE('zoomMaxWidth', { def: null, min: 100, max: 1000 }),
    COLOR("zoomColor", { def: "#CCCCCC" }),
    COLOR("zoomHighlightColor", { def: "#1A1A1A" }),
    NUMBER("zoomFontSize", { def: 14, min: 8, max: 48 }),
    CHECKBOX("zoomUseResetSlot", { def: false }),

    CHECKBOX("zoomMinimap.show", { def: true }),
    CHECKBOX("zoomMinimap.smooth", { def: true }),
    COLOR("zoomMinimap.selectedColor", { def: "#1F77B4" }),
    RANGE("zoomMinimap.selectedColorOpacity", { def: 0.2, min: 0, max: 0.5, step: 0.01 }),
    COLOR("zoomMinimap.lineColor", { def: "#1A1A1A" }),
    RANGE("zoomMinimap.selectionRadius", { def: 2, min: 0, max: 24 }),
    COLOR("zoomMinimap.indicatorColor", { def: "#1A1A1A" }),
    CHECKBOX("zoomMinimap.verticalHandles", { def: false }),
    CHECKBOX('zoomMinimap.merged', { def: false }),

    NUMBER("zoomStartIndex", { def: null, min: 0, max: 100 }),
    NUMBER("zoomEndIndex", { def: null, min: 0, max: 100 }),
    CHECKBOX("zoomEnableRangeHandles", { def: true }),
    CHECKBOX("zoomEnableSelectionDrag", { def: true }),
    CHECKBOX("zoomFocusOnDrag", { def: true }),
    NUMBER("zoomFocusRangeRatio", { def: 0.2, min: 0.1, max: 0.9, step: 0.1 })
]);

const { themeOptions, currentTheme } = useThemeOptions();

const configTheme = computed(() => ({ theme: currentTheme.value }));

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
        // skeletonConfig: {
        //     backgroundColor: '#FF0000'
        // },
        userOptionsButtons: {
            altCopy: true
        },
        userOptionsCallbacks: {
            altCopy: console.log
        },
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
            enable: true,
            locale: 'zh-CN',
            useUTC: false,
            januaryAsYear: true,
            options: { 
                year: 'yyyy',
                month: `MMMM`,
                day: 'dd MMM',
                hour: 'HH:mm',
                minute: 'HH:mm:ss',
                second: 'HH:mm:ss'
            }
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

<Box comp="VueUiQuickChart" :dataset="dataset" :config="config">
    <template #title>VueUiQuickChart</template>

    <template #responsive>
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
    </template>

    <template #theme>
        <LocalVueUiQuickChart :dataset="dataset" :config="configTheme" />
    </template>

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

    <template #build-treesh>
        <VueUiQuickChartTreeshaken :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint">
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
        </VueUiQuickChartTreeshaken>
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

    <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
</Box>
</template>