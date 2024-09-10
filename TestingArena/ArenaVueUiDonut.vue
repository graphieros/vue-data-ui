<script setup>
import { ref, computed } from "vue";
import LocalVueUiDonut from '../src/components/vue-ui-donut.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const dataset = ref([
    {
        name: 'Serie 1',
        values: [100],
        comment: 'This is a comment'
    },
    {
        name: 'Serie 2',
        values: [50]
    },
    {
        name: 'Serie 3',
        values: [25],
        comment: "This is another comment that is quite long to see how it fits on the chart and to see if it's nit overflowing."
    },
    {
        name: 'Serie 4',
        values: [25]
    },
    {
        name: 'Serie 5',
        values: [25]
    },
    {
        name: 'Serie 6',
        values: [25],
        comment: 'Some other comment'
    },
]);

const model = ref([
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'userOptions.show', def: true, type: 'checkbox', label: 'showUserOptions', category: 'general' },
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.labels', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.table', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox' },
    { key: 'useCssAnimation', def: true, type: 'checkbox', label: 'useCssAnimation', category: 'general' },
    { key: 'useBlurOnHover', def: true, type: 'checkbox', label: "useBlurOnHover", category: 'general' },
    { key: 'style.fontFamily', def: 'inherit', type: 'text', label: "fontFamily", category: 'general' },
    { key: 'style.chart.useGradient', def: true, type: 'checkbox', label: 'useGradient', category: 'general' },
    { key: 'style.chart.gradientIntensity', def: 40, min: 0, max: 100, type: 'range', label: 'gradientIntensity', category: 'general' },
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color', label: 'backgroundColor', category: 'general' },
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'general' },
    { key: 'style.chart.layout.labels.dataLabels.show', def: true, type: 'checkbox', label: 'show', category: 'labels' },
    { key: 'style.chart.layout.labels.dataLabels.hideUnderValue', def: 3, type: 'number', min: 0, max: 100, label: 'hideUnderValue', category: 'labels' },
    { key: 'style.chart.layout.labels.dataLabels.useLabelSlots', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.labels.dataLabels.prefix', def: '', type: 'text', label: 'prefix', category: 'labels' },
    { key: 'style.chart.layout.labels.dataLabels.suffix', def: '', type: 'text', label: 'suffix', category: 'labels' },
    { key: 'style.chart.layout.labels.value.show', def: true, type: 'checkbox', label: 'showValue', category: 'labels' },
    { key: 'style.chart.layout.labels.value.rounding', def: 0, type: 'number', min: 0, max: 6, label: 'valueRounding', category: 'labels' },
    { key: 'style.chart.layout.labels.percentage.color', def: '#1A1A1A', type: 'color', label: 'colorPercentage', category: 'labels' },
    { key: 'style.chart.layout.labels.percentage.bold', def: true, type: 'checkbox', label: 'bold', category: 'labels' },
    { key: 'style.chart.layout.labels.percentage.fontSize', def: 18, min: 6, max: 48, type: 'number', label: 'fontSize', category: 'labels' },
    { key: 'style.chart.layout.labels.name.color', def: '#1A1A1A', type: 'color', label: 'colorName', category: 'labels' },
    { key: 'style.chart.layout.labels.name.bold', def: false, type: 'checkbox', label: 'bold', category: 'labels' },
    { key: 'style.chart.layout.labels.name.fontSize', def: 14, type: 'number', min: 6, max: 36, label: 'fontSize', category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.show', def: true, type: 'checkbox', label: ['hollow', 'is', 'show'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.total.show', def: true, type: 'checkbox', label: ['hollow', 'total', 'is', 'show'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.total.bold', def: false, type: 'checkbox', label: ['hollow', 'total', 'is', 'bold'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.total.fontSize', def: 18, type: 'number', min: 6, max: 48, label: ['hollow', 'total', 'is', 'fontSize'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.total.color', def: '#AAAAAA', type: 'color', label: ['hollow', 'total', 'is', 'color'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.total.text', def: 'Total', type: 'text', label: ['hollow', 'total', 'is', 'textContent'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.total.offsetY', def: 0, type: 'number', min: -100, max: 100, label: ['hollow', 'total', 'is', 'offsetY'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.total.value.color', def: '#1A1A1A', type: 'color', label: ['hollow', 'total', 'value', 'is', 'color'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.total.value.fontSize', def: 18, type: 'number', min: 6, max: 48, label: ['hollow', 'total', 'value', 'is', 'fontSize'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.total.value.bold', def: true, type: 'checkbox', label: ['hollow', 'total', 'value', 'is', 'bold'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.total.value.prefix', def: '', type: 'text', label: ['hollow', 'total', 'value', 'is', 'prefix'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.total.value.suffix', def: '', type: 'text', label: ['hollow', 'total', 'value', 'is', 'suffix'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.total.value.offsetY', def: 0, type: 'number', min: -100, max: 100, label: ['hollow', 'total', 'value', 'is', 'offsetY'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.total.value.rounding', def: 0, type: 'number', min: 0, max: 6, label: ['hollow', 'total', 'value', 'is', 'rounding'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.average.show', def: true, type: 'checkbox', label: ['hollow', 'average', 'is', 'show'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.average.bold', def: false, type: 'checkbox', label: ['hollow', 'average', 'is', 'bold'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.average.color', def: "#AAAAAA", type: "color", label: ['hollow', 'average', 'is', 'color'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.average.fontSize', def: 18, type: 'number', min: 6, max: 48, label: ['hollow', 'average', 'is', 'fontSize'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.average.text', def: 'Average', type: 'text', label: ['hollow', 'average', 'is', 'textContent'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.average.offsetY', def: 0, type: 'number', min: -100, max: 100, label: ['hollow', 'average', 'is', 'offsetY'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.average.value.color', def: "#1A1A1A", type: 'color', label: ['hollow', 'average', 'value', 'is', 'color'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.average.value.fontSize', def: 18, type: 'number', min: 6, max: 48, label: ['hollow', 'average', 'value', 'is', 'fontSize'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.average.value.bold', def: true, type: 'checkbox', label: ['hollow', 'average', 'value', 'is', 'bold'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.average.value.prefix', def: '', type: 'text', label: ['hollow', 'average', 'value', 'is', 'prefix'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.average.value.suffix', def: '', type: 'text', label: ['hollow', 'average', 'value', 'is', 'suffix'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.average.value.offsetY', def: 0, type: 'number', min: -100, max: 100, label: ['hollow', 'average', 'value', 'is', 'offsetY'], category: 'labels' },
    { key: 'style.chart.layout.labels.hollow.average.value.rounding', def: 0, type: 'number', min: 0, max: 6, label: ['hollow', 'average', 'value', 'is', 'rounding'], category: 'labels' },
    { key: 'style.chart.layout.donut.strokeWidth', def: 55, type: 'range', min: 3, max: 130, label: 'thickness', category: 'donut' },
    { key: 'style.chart.layout.donut.borderWidth', def: 1, type: 'range', min: 0, max: 36, label: ['border', 'is', 'thickness'], category: 'donut' },
    { key: 'style.chart.layout.donut.useShadow', def: true,  type: 'checkbox' },
    { key: 'style.chart.layout.donut.shadowColor', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.legend.show', def: true, type: 'checkbox', label: 'show', category: 'legend' },
    { key: 'style.chart.legend.backgroundColor', def: '#FFFFFF', type: 'color', label: 'backgroundColor', category: 'legend' },
    { key: 'style.chart.legend.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'legend' },
    { key: 'style.chart.legend.fontSize', def: 16, type: 'number', min: 6, max: 42, label: 'fontSize', category: 'legend' },
    { key: 'style.chart.legend.bold', def: false, type: 'checkbox', label: 'bold', category: 'legend' },
    { key: 'style.chart.legend.roundingValue', def: 0, type: 'number', min: 0, max: 6, label: ['rounding', 'is', 'value'], category: 'legend' },
    { key: 'style.chart.legend.roundingPercentage', def: 0, type: 'number', min: 0, max: 6, label: 'percentageRounding', category: 'legend' },
    { key: 'style.chart.title.text', def: 'Title', type: 'text', label: 'textContent', category: 'title' },
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'title' },
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 6, max: 48, label: 'fontSize', category: 'title' },
    { key: 'style.chart.title.bold', def: true, type: 'checkbox', label: 'bold', category: 'title' },
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sit amet', type: 'text', label: 'textContent', category: 'subtitle' },
    { key: 'style.chart.title.subtitle.color', def: '#A1A1A1', type: 'color', label: 'textColor', category: 'subtitle' },
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'number', min: 6, max: 42, label: 'fontSize', category: 'subtitle' },
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox', label: 'bold', category: 'subtitle' },
    { key: 'table.show', def: false, type: 'checkbox', label: 'show', category: 'table' },
    { key: 'table.responsiveBreakpoint', def: 400, type: 'number', min: 300, max: 800, label: 'responsiveBreakpoint', category: 'table' },
    { key: 'table.columnNames.series', def: 'Series', type: 'text', label: ['columnName', 'is', 'series'], category: 'table' },
    { key: 'table.columnNames.value', def: 'Value', type: 'text', label: ['columnName', 'is', 'value'], category: 'table' },
    { key: 'table.columnNames.percentage', def: 'Percentage', type: 'text', label: ['columnName', 'is', 'percentage'], category: 'table' },
    { key: 'table.th.backgroundColor', def: '#FFFFFF', type: 'color', label: 'backgroundColorHeader', category: 'table' },
    { key: 'table.th.color', def: '#1A1A1A', type: 'color', label: 'textColorHeader', category: 'table' },
    { key: 'table.th.outline', def: 'none', type: 'text', label: 'outlineHeader', category: 'table' },
    { key: 'table.td.backgroundColor', def: '#FFFFFF', type: 'color', label: 'backgroundColorRow', category: 'table' },
    { key: 'table.td.color', def: '#1A1A1A', type: 'color', label: 'textColorRow', category: 'table' },
    { key: 'table.td.outline', def: 'none', type: 'text', label: 'outlineRow', category: 'table' },
    { key: 'table.td.roundingValue', def: 0, type: 'number', min: 0, max: 6, label: ['rounding', 'is', 'value'], category: 'table' },
    { key: 'table.td.roundingPercentage', def: 0, type: 'number', min: 0, max: 6, label: ['rounding', 'is', 'percentage'], category: 'table' },
    { key: 'style.chart.tooltip.show', def: true, type: 'checkbox', label: 'show', category: 'tooltip' },
    { key: 'style.chart.tooltip.backgroundColor', def: '#FFFFFF', type: 'color', label: 'backgroundColor', category: 'tooltip' },
    { key: 'style.chart.tooltip.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'tooltip' },
    { key: 'style.chart.tooltip.fontSize', def: 14, type: 'number', min: 6, max: 24, label: 'fontSize', category: 'tooltip' },
    { key: 'style.chart.tooltip.showValue', def: true, type: 'checkbox', label: 'showValue', category: 'tooltip' },
    { key: 'style.chart.tooltip.roundingValue', def: 0, type: 'number', min: 0, max: 6, label: ['rounding', 'is', 'value'], category: 'tooltip' },
    { key: 'style.chart.tooltip.showPercentage', def: true, type: 'checkbox', label: 'showPercentage', category: 'tooltip' },
    { key: 'style.chart.tooltip.roundingPercentage', def: 0, type: 'number', min: 0, max: 6, label: 'percentageRounding', category: 'tooltip' },
    { key: 'style.chart.comments.show', def: true, type: 'checkbox'},
    { key: 'style.chart.comments.showInTooltip', def: true, type: 'checkbox'},
    { key: 'style.chart.comments.width', def: 100, type: 'number', min: 50, max: 400},
    { key: 'style.chart.comments.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.comments.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'userOptions.buttonTitles.tooltip', def: 'TOGGLE TOOLTIP', type: 'text'},
    { key: 'userOptions.buttonTitles.pdf', def: 'DOWNLOAD PDF', type: 'text'},
    { key: 'userOptions.buttonTitles.csv', def: 'DOWNLOAD CSV', type: 'text'},
    { key: 'userOptions.buttonTitles.img', def: 'DOWNLOAD PNG', type: 'text'},
    { key: 'userOptions.buttonTitles.table', def: 'TOGGLE TABLE', type: 'text'},
    { key: 'userOptions.buttonTitles.labels', def: 'TOGGLE LABELS', type: 'text'},
    { key: 'userOptions.buttonTitles.fullscreen', def: 'TOGGLE FULLSCREEN', type: 'text'},
    { key: 'userOptions.buttonTitles.open', def: 'OPEN OPTIONS', type: 'text'},
    { key: 'userOptions.buttonTitles.close', def: 'CLOSE OPTIONS', type: 'text'},
])

const testCustomTooltip = ref(false);
const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default"
])

const currentTheme = ref(themeOptions.value[4])

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
                        customFormat: (data) => {
                            console.log('XY CUSTOM TOOLTIP', data);
                            return "CUSTOM TOOLTIP"
                        }
                    }
                }
            },
        }
    } else {
        return {
            ...c,
            theme: currentTheme.value,
            // customPalette: ['#6376DD', "#DD3322", "#66DDAA"]
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

function addDatapoint() {
    dataset.value.push({
        name: 'Serie N',
        values: [10]
    })
}

const localDonut = ref(null)
const localVdui = ref(null)

function toggleTable() {
    localDonut.value.toggleTable();
    localVdui.value.toggleTable();
}

function toggleLabels() {
    localDonut.value.toggleLabels();
    localVdui.value.toggleLabels();
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
        <input type="checkbox" v-model="testCustomTooltip" id="custom-tooltip"/>
        <label for="custom-tooltip" style="color:#CCCCCC">Test custom tooltip</label>
    </div>
    <button @click="addDatapoint">ADD DATAPOINT</button>

    <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
        <LocalVueUiDonut :key="`responsive_${step}`" :dataset="dataset" :config="{
            ...config,
            responsive: true
        }">
        <template #plot-comment="{ plot }">
            <div :style="`text-align:${plot.textAlign};font-size: 10px; padding: 6px;`">
                {{ plot.comment }}
            </div>
        </template>    
    </LocalVueUiDonut>
    </div>

    <Box comp="VueUiDonut" :dataset="dataset">
        <template #title>VueUiDonut</template>

        <template #local>
            <LocalVueUiDonut :dataset="dataset" :config="config" :key="`local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="localDonut">
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #optionCsv>
                    DOWNLOAD CSV
                </template>
                <template #optionImg>
                    DOWNLOAD IMAGE
                </template>
                <template #optionTable>
                    TOGGLE TABLE
                </template>
                <template #optionLabels>
                    TOGGLE LABELS
                </template>
                <template template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                    <button @click="toggleFullscreen(isFullscreen ? 'out' : 'in')">FULLSCREEN</button>
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
            </LocalVueUiDonut>
        </template>
        
        <template #VDUI-local>
            <LocalVueDataUi component="VueUiDonut" :dataset="dataset" :config="config" :key="`local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="localVdui">
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #optionCsv>
                    DOWNLOAD CSV
                </template>
                <template #optionImg>
                    DOWNLOAD IMAGE
                </template>
                <template #optionTable>
                    TOGGLE TABLE
                </template>
                <template #optionLabels>
                    TOGGLE LABELS
                </template>
                <template template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                    <button @click="toggleFullscreen(isFullscreen ? 'out' : 'in')">FULLSCREEN</button>
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
            <VueUiDonut :dataset="dataset" :config="config" :key="`local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint">
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #optionCsv>
                    DOWNLOAD CSV
                </template>
                <template #optionImg>
                    DOWNLOAD IMAGE
                </template>
                <template #optionTable>
                    TOGGLE TABLE
                </template>
                <template #optionLabels>
                    TOGGLE LABELS
                </template>
                <template template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                    <button @click="toggleFullscreen(isFullscreen ? 'out' : 'in')">FULLSCREEN</button>
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
            </VueUiDonut>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiDonut" :dataset="dataset" :config="config" :key="`local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint">
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #optionCsv>
                    DOWNLOAD CSV
                </template>
                <template #optionImg>
                    DOWNLOAD IMAGE
                </template>
                <template #optionTable>
                    TOGGLE TABLE
                </template>
                <template #optionLabels>
                    TOGGLE LABELS
                </template>
                <template template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                    <button @click="toggleFullscreen(isFullscreen ? 'out' : 'in')">FULLSCREEN</button>
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