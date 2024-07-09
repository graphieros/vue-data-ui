<script setup>
import { ref, computed } from "vue";
import LocalVueUiXyCanvas from '../src/components/vue-ui-xy-canvas.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const crazyDs = [];
const crazyDs2 = [];
const crazyDs3 = []
for (let i = 0; i < 12; i += 1) {
    crazyDs.push(Math.random() + (Math.random() > 0.5 ? Math.random() * 100 : 0))
    crazyDs2.push(Math.random() + (Math.random() > 0.5 ? Math.random() * -10 : -10))
    crazyDs3.push(Math.random() + (Math.random() > 0.5 ? Math.random() * -5 : Math.random() * 5))
}


// const dataset = ref([
//         {
//             name: "S0",
//             series: crazyDs3,
//             type: "line",
//             useArea: false,
//             dataLabels: true,
//             scaleSteps: 2,
//             prefix: '$',
//             suffix: '£',
//             rounding: 1,
//         },
//         {
//             name: "S1",
//             series: crazyDs,
//             type: "bar",
//             useArea: false,
//             dataLabels: true,
//             scaleSteps: 2,
//             rounding: 1
//         },
//         {
//             name: "S2",
//             series: crazyDs2,
//             type: "line",
//             useArea: false,
//             dataLabels: true,
//             smooth: false,
//             rounding: 1,
//             scaleSteps: 2
//         },
//         // {
//         //     name: "S3",
//         //     series: [23.12, 23.12, 23.05, 23.07, null, 23.69, 23.72, 23.25, 23.36, 23.41, 23.65],
//         //     type: "line",
//         //     smooth: false,
//         //     useArea: true,
//         //     scaleSteps: 5,
//         //     autoScaling: false,
//         //     stackRatio: 0.5
//         // },
//     ])

const dataset = ref([
    { "name": "P-01", "series": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], "type": "line", "autoScaling": true, "scaleSteps": 2 }, { "name": "B-01", "series": [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0], "type": "line", "autoScaling": true, "scaleSteps": 2 }, { "name": "B-02", "series": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "type": "line", "autoScaling": true, "scaleSteps": 2 }, { "name": "AV-01", "series": [0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "type": "line", "autoScaling": true, "scaleSteps": 2 }, { "name": "AV-02", "series": [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "type": "line", "autoScaling": true, "scaleSteps": 2 }, { "name": "FB-AV-03", "series": [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], "type": "line", "autoScaling": true, "scaleSteps": 2 }, { "name": "+24V", "series": [23.997080078124995, 23.960610351562497, 24.006197509765624, 23.997080078124995, 24.006197509765624, 23.960610351562497, 24.024432373046874, 23.969727783203123, 24.006197509765624, 23.94237548828125, 23.987962646484377, 23.987962646484377, 24.070019531249997, 24.2523681640625, 23.94237548828125, 24.006197509765624, 23.951492919921876, 23.960610351562497, 24.142958984375, 24.060902099609372, 23.987962646484377, 24.060902099609372, 24.033549804687496, 23.969727783203123, 23.960610351562497, 23.951492919921876, 23.987962646484377, 24.01531494140625, 23.94237548828125, 23.951492919921876, 23.969727783203123, 24.070019531249997, 23.951492919921876, 23.951492919921876, 23.951492919921876, 23.94237548828125, 23.978845214843748, 23.969727783203123, 23.978845214843748, 23.969727783203123, 23.93325805664062, 24.179428710937497, 23.997080078124995, 24.006197509765624, 23.978845214843748, 23.951492919921876, 23.951492919921876, 23.987962646484377, 23.997080078124995, 23.969727783203123, 24.01531494140625, 23.94237548828125, 23.951492919921876, 23.997080078124995, 23.960610351562497, 23.94237548828125, 23.978845214843748, 24.01531494140625, 24.106489257812495, 23.987962646484377, 23.960610351562497, 24.106489257812495, 23.987962646484377, 24.006197509765624, 23.987962646484377, 23.969727783203123, 23.969727783203123, 23.969727783203123, 24.006197509765624, 24.01531494140625, 23.987962646484377, 23.978845214843748, 24.01531494140625, 23.987962646484377, 24.024432373046874, 24.006197509765624, 23.960610351562497, 24.04266723632812, 23.997080078124995, 24.01531494140625, 24.033549804687496, 23.969727783203123, 24.024432373046874, 24.033549804687496, 23.960610351562497, 23.960610351562497, 23.978845214843748, 24.006197509765624, 23.969727783203123, 24.088254394531248, 24.033549804687496, 23.978845214843748, 24.024432373046874, 23.997080078124995, 24.024432373046874, 24.097371826171873, 23.997080078124995, 24.033549804687496, 24.01531494140625, 23.987962646484377], "type": "line", "autoScaling": true, "scaleSteps": 10, "stackRatio": 0.3 }, { "name": "+5V", "series": [4.966513671875, 5.032822265625, 4.98806396484375, 4.96817138671875, 4.9698291015625005, 4.99469482421875, 5.0112719726562505, 4.993037109375, 4.9764599609375, 5.02453369140625, 4.993037109375, 4.9764599609375, 4.966513671875, 4.98640625, 4.98474853515625, 4.96817138671875, 5.02619140625, 4.98143310546875, 4.97148681640625, 5.02453369140625, 5.02619140625, 4.97480224609375, 4.98474853515625, 4.9698291015625005, 4.96817138671875, 4.97148681640625, 4.966513671875, 4.97811767578125, 4.9631982421875, 5.0029833984375, 4.97314453125, 4.9764599609375, 5.02619140625, 4.97148681640625, 4.9764599609375, 4.97811767578125, 4.9830908203125, 4.96817138671875, 4.96817138671875, 4.97811767578125, 4.9698291015625005, 4.98640625, 4.96817138671875, 4.979775390625, 4.96817138671875, 4.97148681640625, 4.98640625, 4.9698291015625005, 4.9897216796875, 4.96817138671875, 4.97314453125, 4.979775390625, 4.97314453125, 4.97314453125, 4.97148681640625, 4.97148681640625, 4.97148681640625, 4.96817138671875, 4.97314453125, 4.98474853515625, 4.9698291015625005, 4.966513671875, 4.97314453125, 4.9631982421875, 4.97480224609375, 4.97314453125, 4.96485595703125, 4.96817138671875, 4.97148681640625, 5.02453369140625, 4.966513671875, 4.97480224609375, 4.96485595703125, 4.97811767578125, 4.966513671875, 4.97148681640625, 4.9764599609375, 4.98143310546875, 4.96817138671875, 4.97811767578125, 4.98143310546875, 4.96154052734375, 4.97811767578125, 4.97314453125, 4.97148681640625, 4.9698291015625005, 4.9698291015625005, 4.966513671875, 4.97148681640625, 5.00795654296875, 4.966513671875, 4.96817138671875, 4.96817138671875, 4.966513671875, 4.966513671875, 4.97480224609375, 4.966513671875, 4.96817138671875, 4.9698291015625005, 4.966513671875], "type": "line", "autoScaling": true, "scaleSteps": 2, "stackRatio": 0.3 }])

const model = ref([
    { key: 'userOptions.show', def: true, type: 'checkbox' },
    { key: 'style.fontFamily', def: 'Arial', type: 'text' },
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.aspectRatio', def: '12 / 9', type: 'text' },
    { key: 'style.chart.stacked', def: true, type: 'checkbox' },
    { key: 'style.chart.stackGap', def: 20, type: 'number', min: 0.1, max: 1, step: 0.1 },
    { key: 'style.chart.scale.ticks', def: 10, type: 'number', min: 2, max: 20 },
    { key: 'style.chart.zoom.show', def: true, type: 'checkbox' },
    { key: 'style.chart.zoom.color', def: '#CCCCCC', type: 'color' },
    { key: 'style.chart.zoom.highlightColor', def: '#4A4A4A', type: 'color' },
    { key: 'style.chart.zoom.fontSize', def: 14, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.zoom.useResetSlot', def: false, type: 'checkbox' },
    { key: 'style.chart.selector.show', def: true, type: 'checkbox' },
    { key: 'style.chart.selector.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.selector.dashed', def: false, type: 'checkbox' },
    { key: 'style.chart.tooltip.show', def: true, type: 'checkbox' },
    { key: 'style.chart.tooltip.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.tooltip.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.tooltip.fontSize', def: 14, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.tooltip.borderRadius', def: 4, type: 'number', min: 0, max: 12 },
    { key: 'style.chart.tooltip.borderColor', def: '#e1e5e6', type: 'color' },
    { key: 'style.chart.tooltip.borderWidth', def: 1, type: 'number', min: 0, max: 12 },
    { key: 'style.chart.legend.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.legend.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.legend.show', def: true, type: 'checkbox' },
    { key: 'style.chart.legend.fontSize', def: 16, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.legend.bold', def: false, type: 'checkbox' },
    { key: 'style.chart.title.text', def: 'Lorem ipsum placer', type: 'text' },
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.title.bold', def: true, type: 'checkbox' },
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sit amet', type: 'text' },
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox' },
    { key: 'style.chart.grid.y.showAxis', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.y.axisColor', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.grid.y.axisName', def: 'Y AXIS', type: 'text' },
    { key: 'style.chart.grid.y.axisThickness', def: 2, type: 'number', min: 1, max: 6 },
    { key: 'style.chart.grid.y.axisLabels.show', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.y.axisLabels.fontSizeRatio', def: 0.7, type: 'number', min: 0.1, max: 2, step: 0.1 },
    { key: 'style.chart.grid.y.axisLabels.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.grid.y.axisLabels.offsetX', def: 0, type: 'number', min: -100, max: 100 },
    { key: 'style.chart.grid.y.verticalLines.show', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.y.verticalLines.color', def: '#CCCCCC', type: 'color' },
    { key: 'style.chart.grid.y.verticalLines.hideUnderXLength', def: 20, type: 'number', min: 5, max: 40 },
    { key: 'style.chart.grid.y.timeLabels.show', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.y.timeLabels.fontSizeRatio', def: 0.8, type: 'number', min: 0.1, max: 2, step: 0.1 },
    { key: 'style.chart.grid.y.timeLabels.rotation', def: 0, type: 'number', min: -360, max: 360 },
    { key: 'style.chart.grid.y.timeLabels.offsetY', def: 30, type: 'number', min: -100, max: 100 },
    { key: 'style.chart.grid.y.timeLabels.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.grid.x.showAxis', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.x.axisName', def: 'X AXIS', type: 'text' },
    { key: 'style.chart.grid.x.axisColor', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.grid.x.axisThickness', def: 2, type: 'number', min: 1, max: 12 },
    { key: 'style.chart.grid.x.horizontalLines.Show', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.x.horizontalLines.color', def: '#CCCCCC', type: 'color' },
    { key: 'style.chart.grid.x.horizontalLines.alternate', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.x.horizontalLines.opacity', def: 20, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.grid.zeroLine.show', def: true, type: 'checkbox' },
    { key: 'style.chart.grid.zeroLine.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.grid.zeroLine.dashed', def: true, type: 'checkbox' },
    { key: 'style.chart.line.plots.show', def: false, type: 'checkbox' },
    { key: 'style.chart.line.plots.radiusRatio', def: 1, type: 'number', min: 0.1, max: 3, step: 0.1 },
    { key: 'style.chart.area.opacity', def: 60, type: 'number', min: 10, max: 100 },
    { key: 'style.chart.dataLabels.show', def: false, type: 'checkbox' },
    { key: 'style.chart.dataLabels.fontSizeRatio', def: 1, type: 'number', min: 0.1, max: 2, step: 0.1 },
    { key: 'style.chart.dataLabels.useSerieColor', def: true, type: 'checkbox' },
    { key: 'style.chart.dataLabels.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.dataLabels.offsetY', def: -12, type: 'number', min: -100, max: 100 },
    { key: 'style.chart.paddingProportions.top', def: 0.1, type: 'number', min: 0, max: 3, step: 0.01 },
    { key: 'style.chart.paddingProportions.right', def: 0.05, type: 'number', min: 0, max: 3, step: 0.01 },
    { key: 'style.chart.paddingProportions.left', def: 0.1, type: 'number', min: 0, max: 3, step: 0.01 },
    { key: 'style.chart.paddingProportions.bottom', def: 0.1, type: 'number', min: 0, max: 3, step: 0.01 },
    { key: 'table.show', def: false, type: 'checkbox' },
    { key: 'table.rounding', def: 1, type: 'number', min: 0, max: 6 },
    { key: 'table.responsiveBreakpoint', def: 400, type: 'number', min: 300, max: 800 },
    { key: 'table.columnNames.period', def: 'Period', type: 'text' },
    { key: 'table.columnNames.total', def: 'Total', type: 'text' },
    { key: 'table.th.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'table.th.color', def: '#1A1A1A', type: 'color' },
    { key: 'table.th.outline', def: 'none', type: 'text' },
    { key: 'table.td.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'table.td.color', def: '#1A1A1A', type: 'color' },
    { key: 'table.td.outline', def: 'none', type: 'text' },

])
const step = ref(0)

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
    return {
        ...c,
        theme: currentTheme.value,
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                // tooltip: {
                //     ...c.style.chart.tooltip,
                //     customFormat: ({ datapoint }) => {
                //         return datapoint[0].name
                //     }
                // },
                grid: {
                    ...c.style.chart.grid,
                    y: {
                        ...c.style.chart.grid.y,
                        timeLabels: {
                            ...c.style.chart.grid.y.timeLabels,
                            values: [
                                "JAN",
                                "FEV",
                                "MAR",
                                "APR",
                                "MAY",
                                "JUN",
                                "JUL",
                                "AUG",
                                "SEP",
                                "OCT",
                                "NOV",
                                "DEC"
                            ]
                        }
                    }
                }
            }
        }
    }
})

// const basicCanvasConfig = ref({
//     style: {
//         chart: {
//             stacked: true,
//             stackGapRatio: 0.5,
//             dataLabels: {
//                 show: false
//             },
//             line: {
//                 plots: {
//                     show: false
//                 }
//             }
//         }
//     }
// })



</script>

<template>
    <div style="margin: 12px 0; color: white">Z
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>
    <Box>
        <template #title>VueUiXyCanvas</template>

        <template #local>
            <LocalVueUiXyCanvas :dataset="dataset" :config="config" :key="`local_${step}`">
            </LocalVueUiXyCanvas>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiXyCanvas" :dataset="dataset" :config="config" :key="`VDUI-lodal_${step}`">

            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiXyCanvas :dataset="dataset" :config="config" :key="`build_${step}`"></VueUiXyCanvas>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiXyCanvas" :dataset="dataset" :config="config" :key="`VDUI_build_${step}`">
            </VueDataUi>
        </template>

        <template #knobs>
            <div
                style="display: flex; flex-direction: row; flex-wrap:wrap; align-items:center; width: 100%; color: #CCCCCC; gap:24px;">
                <div v-for="knob in model">
                    <label style="font-size: 10px">{{ knob.key }}</label>
                    <div
                        style="display:flex; flex-direction:row; flex-wrap: wrap; align-items:center; gap:6px; height: 40px">
                        <input v-if="!['none', 'select'].includes(knob.type)" :step="knob.step" :type="knob.type"
                            :min="knob.min ?? 0" :max="knob.max ?? 0" v-model="knob.def" @change="step += 1">
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