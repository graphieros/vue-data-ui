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
        values: [12.5]
    },
    {
        name: 'Serie 5',
        values: [6.125]
    },
    {
        name: 'Serie 6',
        values: [25],
        comment: 'Some other comment'
    },
]);

const alternateDataset = ref([
    { name: 'Alt 1', values: [20]},
    { name: 'Alt 2', values: [20]},
    { name: 'Alt 3', values: [20]},
])

const alternateConfig = ref({
    style: {
        chart: {
            backgroundColor: '#CCCCCC',
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
    { key: 'type', def: 'classic', type: 'select', options: ['classic', 'polar']},
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'userOptions.show', def: true, type: 'checkbox', label: 'showUserOptions', category: 'general' },
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.labels', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.table', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.annotator', def: true, type: 'checkbox' },
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right']},
    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},

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
    { key: 'style.chart.legend.backgroundColor', def: '#FFFFFF20', type: 'color', label: 'backgroundColor', category: 'legend' },
    { key: 'style.chart.legend.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'legend' },
    { key: 'style.chart.legend.fontSize', def: 16, type: 'number', min: 6, max: 42, label: 'fontSize', category: 'legend' },
    { key: 'style.chart.legend.bold', def: false, type: 'checkbox', label: 'bold', category: 'legend' },
    { key: 'style.chart.legend.roundingValue', def: 0, type: 'number', min: 0, max: 6, label: ['rounding', 'is', 'value'], category: 'legend' },
    { key: 'style.chart.legend.roundingPercentage', def: 0, type: 'number', min: 0, max: 6, label: 'percentageRounding', category: 'legend' },
    { key: 'style.chart.title.text', def: 'Title', type: 'text', label: 'textContent', category: 'title' },
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color', label: 'textColor', category: 'title' },
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 6, max: 48, label: 'fontSize', category: 'title' },
    { key: 'style.chart.title.bold', def: true, type: 'checkbox', label: 'bold', category: 'title' },
    { key: 'style.chart.title.textAlign', def: 'center', type: 'select', options: ['left', 'center', 'right']},
    { key: 'style.chart.title.paddingLeft', def: 0, type: 'number', min: 0, max: 24 },
    { key: 'style.chart.title.paddingRight', def: 0, type: 'number', min: 0, max: 24 },

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
    { key: 'style.chart.tooltip.backgroundOpacity', def: 100, type: 'range', min: 0, max: 100},
    { key: 'style.chart.tooltip.position', def: 'center', type: 'select', options: ['left', 'center', 'right']},
    { key: 'style.chart.tooltip.offsetY', def: 24, type: 'number', min: 0, max: 48},

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
    { key: 'userOptions.buttonTitles.annotator', def: 'TOGGLE ANNOTATOR', type: 'text'},
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
                        // customFormat: (data) => {
                        //     return "CUSTOM TOOLTIP " + data
                        // }
                    }
                }
            },
        }
    } else {
        return {
            ...c,
            style: {
                ...c.style,
                chart: {
                    ...c.style.chart,
                    layout: {
                        ...c.style.chart.layout,
                        labels: {
                            ...c.style.chart.layout.labels,
                            hollow: {
                                ...c.style.chart.layout.labels.hollow,
                                total: {
                                    ...c.style.chart.layout.labels.hollow.total,
                                    value: {
                                        ...c.style.chart.layout.labels.hollow.total.value,
                                        // formatter: ({value}) => {
                                        //     return `f  - ${value}`
                                        // }
                                    }
                                },
                                average: {
                                    ...c.style.chart.layout.labels.hollow.average,
                                    value: {
                                        ...c.style.chart.layout.labels.hollow.average.value,
                                        // formatter: ({value}) => {
                                        //     return `f  - ${value}`
                                        // }
                                    }
                                },
                            },
                            value: {
                                ...c.style.chart.layout.labels.value,
                                // formatter: ({value, config}) => {

                                //     return `f  - ${value}`
                                // }
                            },
                            percentage: {
                                // formatter: ({value}) => {
                                //     return `f - ${value}`
                                // }
                            },
                            dataLabels: {
                                ...c.style.chart.layout.labels.dataLabels,
                                // formatter: ({value}) => {
                                //     return `f - ${value}`
                                // }
                            }
                        }
                    },
                }
            },
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
    <button @click="toggleProps">TOGGLE PROPS: {{ isPropsToggled }}</button>
    <button @click="alterDataset">ALTER DATASET</button>
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

        <template #chart-background>
            <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
        </template>

        <template #plot-comment="{ plot }">
            <div :style="`text-align:${plot.textAlign};font-size: 10px; padding: 6px;`">
                {{ plot.comment }}
            </div>
        </template>

        <template #watermark="{ isPrinting }">
            <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                WATERMARK
            </div>
        </template>
        <template #source>
            <div style="width:100%;font-size:10px;text-align:left">
                Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
            </div>
        </template>
    </LocalVueUiDonut>
    </div>

    <Box comp="VueUiDonut" :dataset="dataset">
        <template #title>VueUiDonut</template>

        <template #local>
            <LocalVueUiDonut :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="localDonut">
                <template #pattern="{ seriesIndex, patternId }">
                    <pattern v-if="seriesIndex === 0" :id="patternId" width="70" height="8" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="none" stroke="#1A1A1A" d="M-.02 22c8.373 0 11.938-4.695 16.32-9.662C20.785 7.258 25.728 2 35 2s14.215 5.258 18.7 10.338C58.082 17.305 61.647 22 70.02 22M-.02 14.002C8.353 14 11.918 9.306 16.3 4.339 20.785-.742 25.728-6 35-6S49.215-.742 53.7 4.339c4.382 4.967 7.947 9.661 16.32 9.664M70 6.004c-8.373-.001-11.918-4.698-16.3-9.665C49.215-8.742 44.272-14 35-14S20.785-8.742 16.3-3.661C11.918 1.306 8.353 6-.02 6.002"/></pattern>

                    <pattern v-if="seriesIndex === 1" :id="patternId" width="29" height="50.115" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b31"/><path fill="none" stroke="#ecc94b" stroke-linecap="square" stroke-width=".5" d="M14.5 6.628 8.886 3.372v-6.515L14.502-6.4l5.612 3.257-.001 6.514zm0 50.06-5.613-3.256v-6.515l5.614-3.258 5.612 3.257-.001 6.515zm14.497-25.117-5.612-3.257v-6.515L29 18.541l5.612 3.257-.001 6.515zm-29 0-5.612-3.257v-6.515L0 18.541l5.612 3.257v6.515zM14.5 11.82 4.36 5.967l.002-11.706 10.14-5.855L24.638-5.74l-.001 11.707zm0 50.06L4.36 56.028l.002-11.706 10.14-5.855 10.137 5.852-.001 11.707zm14.498-25.118-10.14-5.852.002-11.707L29 13.349l10.137 5.853-.001 11.706zm-29 0-10.139-5.852.002-11.707L0 13.349l10.138 5.853-.002 11.706zm14.501-19.905L0 8.488.002-8.257l14.5-8.374L29-8.26l-.002 16.745zm0 50.06L0 58.548l.002-16.745 14.5-8.373L29 41.8l-.002 16.744zM28.996 41.8l-14.498-8.37.002-16.744L29 8.312l14.498 8.37-.002 16.745zm-29 0-14.498-8.37.002-16.744L0 8.312l14.498 8.37-.002 16.745z"/></pattern>

                    <pattern v-if="seriesIndex === 2" :id="patternId" width="40" height="40" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b31"/><path fill="#ecc94b" d="M20 8.52h20v2.96H20zM20 20h20v20H20z"/><path fill="#f44034" d="M21.63 0 20 1.63v1.54L23.15 0zm3.08 0L20 4.71v1.54L26.25 0zm3.08 0L20 7.79v1.53L29.32 0zm3.07 0L20 10.86v1.54L32.4 0zm3.08 0L20 13.94v1.54L35.48 0zm3.08 0L20 17.02v1.54L38.55 0zM40 .1l-20 20L.1 40h1.53L40 1.63zm0 3.07L3.17 40h1.54L40 4.71zm0 3.08L6.25 40h1.54L40 7.79zm0 3.07L9.32 40h1.54L40 10.86zm0 3.08L12.4 40h1.54L40 13.94zm0 3.08L15.48 40h1.54L40 17.02zm0 3.08L18.55 40h1.55L40 20.1V20zM1.63 20 0 21.63v1.54L3.15 20zm3.08 0L0 24.71v1.54L6.25 20zm3.08 0L0 27.79v1.53L9.32 20zm3.07 0L0 30.86v1.54L12.4 20zm3.08 0L0 33.94v1.54L15.48 20zm3.08 0L0 37.02v1.54L18.55 20zM40 21.63 21.63 40h1.54L40 23.17zm0 3.08L24.71 40h1.54L40 26.25zm0 3.08L27.79 40h1.53L40 29.33zm0 3.08L30.86 40h1.54l7.6-7.6zm0 3.07L33.94 40h1.54L40 35.48zm0 3.08L37.02 40h1.54L40 38.56zM9.32 0l-.8.8v1.54L10.86 0zm2.16.92L8.52 3.88v1.54l2.96-2.96zm0 3.08L8.52 6.96V8.5l2.96-2.96zm0 3.08-1.44 1.44-2.96 2.96h1.44v.1l.1-.1 2.86-2.87.1-.09h-.1zM.8 8.52l-.8.8v1.54l2.34-2.34zm3.08 0L.92 11.48h1.54l2.96-2.96zm3.08 0L4 11.48h1.54L8.5 8.52zm6.16 0-1.64 1.63-1.33 1.33-1.63 1.63v1.54l2.96-2.96v-.21h.21l2.96-2.96zm3.07 0-2.96 2.96h1.54l2.96-2.96zm3.08 0-2.96 2.96h1.53L20 9.32v-.8zm.73 2.34-.62.62H20zm-8.52 2.37-2.96 2.96v1.54l2.96-2.96zm0 3.07-2.96 2.97V40h2.96V20H9.32l2.16-2.16z"/></pattern>
                </template>

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
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template> 
            </LocalVueUiDonut>
        </template>
        
        <template #VDUI-local>
            <LocalVueDataUi component="VueUiDonut" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint" ref="localVdui">
                <template #pattern="{ seriesIndex, patternId }">
                    <pattern v-if="seriesIndex === 0" :id="patternId" width="70" height="8" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="none" stroke="#1A1A1A" d="M-.02 22c8.373 0 11.938-4.695 16.32-9.662C20.785 7.258 25.728 2 35 2s14.215 5.258 18.7 10.338C58.082 17.305 61.647 22 70.02 22M-.02 14.002C8.353 14 11.918 9.306 16.3 4.339 20.785-.742 25.728-6 35-6S49.215-.742 53.7 4.339c4.382 4.967 7.947 9.661 16.32 9.664M70 6.004c-8.373-.001-11.918-4.698-16.3-9.665C49.215-8.742 44.272-14 35-14S20.785-8.742 16.3-3.661C11.918 1.306 8.353 6-.02 6.002"/></pattern>

                    <pattern v-if="seriesIndex === 1" :id="patternId" width="29" height="50.115" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b31"/><path fill="none" stroke="#ecc94b" stroke-linecap="square" stroke-width=".5" d="M14.5 6.628 8.886 3.372v-6.515L14.502-6.4l5.612 3.257-.001 6.514zm0 50.06-5.613-3.256v-6.515l5.614-3.258 5.612 3.257-.001 6.515zm14.497-25.117-5.612-3.257v-6.515L29 18.541l5.612 3.257-.001 6.515zm-29 0-5.612-3.257v-6.515L0 18.541l5.612 3.257v6.515zM14.5 11.82 4.36 5.967l.002-11.706 10.14-5.855L24.638-5.74l-.001 11.707zm0 50.06L4.36 56.028l.002-11.706 10.14-5.855 10.137 5.852-.001 11.707zm14.498-25.118-10.14-5.852.002-11.707L29 13.349l10.137 5.853-.001 11.706zm-29 0-10.139-5.852.002-11.707L0 13.349l10.138 5.853-.002 11.706zm14.501-19.905L0 8.488.002-8.257l14.5-8.374L29-8.26l-.002 16.745zm0 50.06L0 58.548l.002-16.745 14.5-8.373L29 41.8l-.002 16.744zM28.996 41.8l-14.498-8.37.002-16.744L29 8.312l14.498 8.37-.002 16.745zm-29 0-14.498-8.37.002-16.744L0 8.312l14.498 8.37-.002 16.745z"/></pattern>

                    <pattern v-if="seriesIndex === 2" :id="patternId" width="40" height="40" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b31"/><path fill="#ecc94b" d="M20 8.52h20v2.96H20zM20 20h20v20H20z"/><path fill="#f44034" d="M21.63 0 20 1.63v1.54L23.15 0zm3.08 0L20 4.71v1.54L26.25 0zm3.08 0L20 7.79v1.53L29.32 0zm3.07 0L20 10.86v1.54L32.4 0zm3.08 0L20 13.94v1.54L35.48 0zm3.08 0L20 17.02v1.54L38.55 0zM40 .1l-20 20L.1 40h1.53L40 1.63zm0 3.07L3.17 40h1.54L40 4.71zm0 3.08L6.25 40h1.54L40 7.79zm0 3.07L9.32 40h1.54L40 10.86zm0 3.08L12.4 40h1.54L40 13.94zm0 3.08L15.48 40h1.54L40 17.02zm0 3.08L18.55 40h1.55L40 20.1V20zM1.63 20 0 21.63v1.54L3.15 20zm3.08 0L0 24.71v1.54L6.25 20zm3.08 0L0 27.79v1.53L9.32 20zm3.07 0L0 30.86v1.54L12.4 20zm3.08 0L0 33.94v1.54L15.48 20zm3.08 0L0 37.02v1.54L18.55 20zM40 21.63 21.63 40h1.54L40 23.17zm0 3.08L24.71 40h1.54L40 26.25zm0 3.08L27.79 40h1.53L40 29.33zm0 3.08L30.86 40h1.54l7.6-7.6zm0 3.07L33.94 40h1.54L40 35.48zm0 3.08L37.02 40h1.54L40 38.56zM9.32 0l-.8.8v1.54L10.86 0zm2.16.92L8.52 3.88v1.54l2.96-2.96zm0 3.08L8.52 6.96V8.5l2.96-2.96zm0 3.08-1.44 1.44-2.96 2.96h1.44v.1l.1-.1 2.86-2.87.1-.09h-.1zM.8 8.52l-.8.8v1.54l2.34-2.34zm3.08 0L.92 11.48h1.54l2.96-2.96zm3.08 0L4 11.48h1.54L8.5 8.52zm6.16 0-1.64 1.63-1.33 1.33-1.63 1.63v1.54l2.96-2.96v-.21h.21l2.96-2.96zm3.07 0-2.96 2.96h1.54l2.96-2.96zm3.08 0-2.96 2.96h1.53L20 9.32v-.8zm.73 2.34-.62.62H20zm-8.52 2.37-2.96 2.96v1.54l2.96-2.96zm0 3.07-2.96 2.97V40h2.96V20H9.32l2.16-2.16z"/></pattern>
                </template>

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
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template>
                <template #source>
                    <div style="width:100%;font-size:10px;text-align:left">
                        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                    </div>
                </template>
            </LocalVueDataUi>
        </template>
        
        <template #build>
            <VueUiDonut :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint">
                <template #pattern="{ seriesIndex, patternId }">
                    <pattern v-if="seriesIndex === 0" :id="patternId" width="70" height="8" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="none" stroke="#1A1A1A" d="M-.02 22c8.373 0 11.938-4.695 16.32-9.662C20.785 7.258 25.728 2 35 2s14.215 5.258 18.7 10.338C58.082 17.305 61.647 22 70.02 22M-.02 14.002C8.353 14 11.918 9.306 16.3 4.339 20.785-.742 25.728-6 35-6S49.215-.742 53.7 4.339c4.382 4.967 7.947 9.661 16.32 9.664M70 6.004c-8.373-.001-11.918-4.698-16.3-9.665C49.215-8.742 44.272-14 35-14S20.785-8.742 16.3-3.661C11.918 1.306 8.353 6-.02 6.002"/></pattern>

                    <pattern v-if="seriesIndex === 1" :id="patternId" width="29" height="50.115" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b31"/><path fill="none" stroke="#ecc94b" stroke-linecap="square" stroke-width=".5" d="M14.5 6.628 8.886 3.372v-6.515L14.502-6.4l5.612 3.257-.001 6.514zm0 50.06-5.613-3.256v-6.515l5.614-3.258 5.612 3.257-.001 6.515zm14.497-25.117-5.612-3.257v-6.515L29 18.541l5.612 3.257-.001 6.515zm-29 0-5.612-3.257v-6.515L0 18.541l5.612 3.257v6.515zM14.5 11.82 4.36 5.967l.002-11.706 10.14-5.855L24.638-5.74l-.001 11.707zm0 50.06L4.36 56.028l.002-11.706 10.14-5.855 10.137 5.852-.001 11.707zm14.498-25.118-10.14-5.852.002-11.707L29 13.349l10.137 5.853-.001 11.706zm-29 0-10.139-5.852.002-11.707L0 13.349l10.138 5.853-.002 11.706zm14.501-19.905L0 8.488.002-8.257l14.5-8.374L29-8.26l-.002 16.745zm0 50.06L0 58.548l.002-16.745 14.5-8.373L29 41.8l-.002 16.744zM28.996 41.8l-14.498-8.37.002-16.744L29 8.312l14.498 8.37-.002 16.745zm-29 0-14.498-8.37.002-16.744L0 8.312l14.498 8.37-.002 16.745z"/></pattern>

                    <pattern v-if="seriesIndex === 2" :id="patternId" width="40" height="40" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b31"/><path fill="#ecc94b" d="M20 8.52h20v2.96H20zM20 20h20v20H20z"/><path fill="#f44034" d="M21.63 0 20 1.63v1.54L23.15 0zm3.08 0L20 4.71v1.54L26.25 0zm3.08 0L20 7.79v1.53L29.32 0zm3.07 0L20 10.86v1.54L32.4 0zm3.08 0L20 13.94v1.54L35.48 0zm3.08 0L20 17.02v1.54L38.55 0zM40 .1l-20 20L.1 40h1.53L40 1.63zm0 3.07L3.17 40h1.54L40 4.71zm0 3.08L6.25 40h1.54L40 7.79zm0 3.07L9.32 40h1.54L40 10.86zm0 3.08L12.4 40h1.54L40 13.94zm0 3.08L15.48 40h1.54L40 17.02zm0 3.08L18.55 40h1.55L40 20.1V20zM1.63 20 0 21.63v1.54L3.15 20zm3.08 0L0 24.71v1.54L6.25 20zm3.08 0L0 27.79v1.53L9.32 20zm3.07 0L0 30.86v1.54L12.4 20zm3.08 0L0 33.94v1.54L15.48 20zm3.08 0L0 37.02v1.54L18.55 20zM40 21.63 21.63 40h1.54L40 23.17zm0 3.08L24.71 40h1.54L40 26.25zm0 3.08L27.79 40h1.53L40 29.33zm0 3.08L30.86 40h1.54l7.6-7.6zm0 3.07L33.94 40h1.54L40 35.48zm0 3.08L37.02 40h1.54L40 38.56zM9.32 0l-.8.8v1.54L10.86 0zm2.16.92L8.52 3.88v1.54l2.96-2.96zm0 3.08L8.52 6.96V8.5l2.96-2.96zm0 3.08-1.44 1.44-2.96 2.96h1.44v.1l.1-.1 2.86-2.87.1-.09h-.1zM.8 8.52l-.8.8v1.54l2.34-2.34zm3.08 0L.92 11.48h1.54l2.96-2.96zm3.08 0L4 11.48h1.54L8.5 8.52zm6.16 0-1.64 1.63-1.33 1.33-1.63 1.63v1.54l2.96-2.96v-.21h.21l2.96-2.96zm3.07 0-2.96 2.96h1.54l2.96-2.96zm3.08 0-2.96 2.96h1.53L20 9.32v-.8zm.73 2.34-.62.62H20zm-8.52 2.37-2.96 2.96v1.54l2.96-2.96zm0 3.07-2.96 2.97V40h2.96V20H9.32l2.16-2.16z"/></pattern>
                </template>

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
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template> 
            </VueUiDonut>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiDonut" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" @selectLegend="selectLegend" @selectDatapoint="selectDatapoint">
                <template #pattern="{ seriesIndex, patternId }">
                    <pattern v-if="seriesIndex === 0" :id="patternId" width="70" height="8" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b3100"/><path fill="none" stroke="#1A1A1A" d="M-.02 22c8.373 0 11.938-4.695 16.32-9.662C20.785 7.258 25.728 2 35 2s14.215 5.258 18.7 10.338C58.082 17.305 61.647 22 70.02 22M-.02 14.002C8.353 14 11.918 9.306 16.3 4.339 20.785-.742 25.728-6 35-6S49.215-.742 53.7 4.339c4.382 4.967 7.947 9.661 16.32 9.664M70 6.004c-8.373-.001-11.918-4.698-16.3-9.665C49.215-8.742 44.272-14 35-14S20.785-8.742 16.3-3.661C11.918 1.306 8.353 6-.02 6.002"/></pattern>

                    <pattern v-if="seriesIndex === 1" :id="patternId" width="29" height="50.115" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b31"/><path fill="none" stroke="#ecc94b" stroke-linecap="square" stroke-width=".5" d="M14.5 6.628 8.886 3.372v-6.515L14.502-6.4l5.612 3.257-.001 6.514zm0 50.06-5.613-3.256v-6.515l5.614-3.258 5.612 3.257-.001 6.515zm14.497-25.117-5.612-3.257v-6.515L29 18.541l5.612 3.257-.001 6.515zm-29 0-5.612-3.257v-6.515L0 18.541l5.612 3.257v6.515zM14.5 11.82 4.36 5.967l.002-11.706 10.14-5.855L24.638-5.74l-.001 11.707zm0 50.06L4.36 56.028l.002-11.706 10.14-5.855 10.137 5.852-.001 11.707zm14.498-25.118-10.14-5.852.002-11.707L29 13.349l10.137 5.853-.001 11.706zm-29 0-10.139-5.852.002-11.707L0 13.349l10.138 5.853-.002 11.706zm14.501-19.905L0 8.488.002-8.257l14.5-8.374L29-8.26l-.002 16.745zm0 50.06L0 58.548l.002-16.745 14.5-8.373L29 41.8l-.002 16.744zM28.996 41.8l-14.498-8.37.002-16.744L29 8.312l14.498 8.37-.002 16.745zm-29 0-14.498-8.37.002-16.744L0 8.312l14.498 8.37-.002 16.745z"/></pattern>

                    <pattern v-if="seriesIndex === 2" :id="patternId" width="40" height="40" patternTransform="scale(2)" patternUnits="userSpaceOnUse"><rect width="100%" height="100%" fill="#2b2b31"/><path fill="#ecc94b" d="M20 8.52h20v2.96H20zM20 20h20v20H20z"/><path fill="#f44034" d="M21.63 0 20 1.63v1.54L23.15 0zm3.08 0L20 4.71v1.54L26.25 0zm3.08 0L20 7.79v1.53L29.32 0zm3.07 0L20 10.86v1.54L32.4 0zm3.08 0L20 13.94v1.54L35.48 0zm3.08 0L20 17.02v1.54L38.55 0zM40 .1l-20 20L.1 40h1.53L40 1.63zm0 3.07L3.17 40h1.54L40 4.71zm0 3.08L6.25 40h1.54L40 7.79zm0 3.07L9.32 40h1.54L40 10.86zm0 3.08L12.4 40h1.54L40 13.94zm0 3.08L15.48 40h1.54L40 17.02zm0 3.08L18.55 40h1.55L40 20.1V20zM1.63 20 0 21.63v1.54L3.15 20zm3.08 0L0 24.71v1.54L6.25 20zm3.08 0L0 27.79v1.53L9.32 20zm3.07 0L0 30.86v1.54L12.4 20zm3.08 0L0 33.94v1.54L15.48 20zm3.08 0L0 37.02v1.54L18.55 20zM40 21.63 21.63 40h1.54L40 23.17zm0 3.08L24.71 40h1.54L40 26.25zm0 3.08L27.79 40h1.53L40 29.33zm0 3.08L30.86 40h1.54l7.6-7.6zm0 3.07L33.94 40h1.54L40 35.48zm0 3.08L37.02 40h1.54L40 38.56zM9.32 0l-.8.8v1.54L10.86 0zm2.16.92L8.52 3.88v1.54l2.96-2.96zm0 3.08L8.52 6.96V8.5l2.96-2.96zm0 3.08-1.44 1.44-2.96 2.96h1.44v.1l.1-.1 2.86-2.87.1-.09h-.1zM.8 8.52l-.8.8v1.54l2.34-2.34zm3.08 0L.92 11.48h1.54l2.96-2.96zm3.08 0L4 11.48h1.54L8.5 8.52zm6.16 0-1.64 1.63-1.33 1.33-1.63 1.63v1.54l2.96-2.96v-.21h.21l2.96-2.96zm3.07 0-2.96 2.96h1.54l2.96-2.96zm3.08 0-2.96 2.96h1.53L20 9.32v-.8zm.73 2.34-.62.62H20zm-8.52 2.37-2.96 2.96v1.54l2.96-2.96zm0 3.07-2.96 2.97V40h2.96V20H9.32l2.16-2.16z"/></pattern>
                </template>
                
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
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
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