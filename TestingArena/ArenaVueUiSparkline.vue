<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiSparkline from '../src/components/vue-ui-sparkline.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

import { VueUiSparkline } from "vue-data-ui";
import { VueUiSparkline as VueUiSparklineTreeshaken } from "vue-data-ui/vue-ui-sparkline";
import ConfigKnobs from "./ConfigKnobs.vue";

const dataset = ref([])
onMounted(() => {
    dataset.value = undefined;
    setTimeout(() => {
        dataset.value = [
            { "period": 1735689600000, "value": 0 },
            { "period": 1738368000000, "value": -1 },
            { "period": 1740787200000, "value": 2 },
            { "period": 1743465600000, "value": -3 },
            { "period": 1746057600000, "value": 4 },
            { "period": 1748736000000, "value": -5 },
            { "period": 1751328000000, "value": 6 },
            { "period": 1754006400000, "value": -7 },
            { "period": 1756684800000, "value": 8 },
            { "period": 1759276800000, "value": -9 },
            { "period": 1761955200000, "value": 10 },
            { "period": 1764547200000, "value": -11 },
            { "period": 1767225600000, "value": 12 },
            { "period": 1769904000000, "value": -13 },
            { "period": 1772323200000, "value": 14 },
            { "period": 1775001600000, "value": -15 },
            { "period": 1777593600000, "value": 1 }
        ]
    }, 2000)
})


// const dataset = computed(() => {
//     const arr = [];

//     for (let i = 0; i < 10000; i += 1) {
//         arr.push({
//             period: `Period ${i}`,
//             value: Math.random() * 100
//         })
//     }
//     return arr
// })

const alternateDataset = ref([
    {
        period: "period 13",
        value: 12
    },
    {
        period: "period 14",
        value: -13
    },
    {
        period: "period 15",
        value: 14
    },
    {
        period: "period 16",
        value: -15
    },
    {
        period: "period 17",
        value: 16
    },
])

const alternateConfig = ref({
    style: {
        backgroundColor: '#CCCCCC',
        title: {
            text: 'Alternate'
        }
    }
})

const isPropsToggled = ref(false);
function toggleProps() {
    isPropsToggled.value = !isPropsToggled.value;
}

function alterDataset() {
    dataset.value.push({
        period: 'Added',
        value: Math.round(Math.random() * 20)
    })
}

const model = ref([
    { key: 'debug', def: true, type: 'checkbox'},
    { key: 'loading', def: false, type: 'checkbox'},
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'type', def: 'line', type: 'select', options: ['line', 'bar']},
    { key: 'style.scaleMin', def: null, type: 'number', min: -1000, max: 1000},
    { key: 'style.scaleMax', def: null, type: 'number', min: -1000, max: 1000},

    { key: 'style.padding.top', def: 12, type: 'number', min: 0, max: 100 },
    { key: 'style.padding.right', def: 12, type: 'number', min: 0, max: 100 },
    { key: 'style.padding.bottom', def: 3, type: 'number', min: 0, max: 100 },
    { key: 'style.padding.left', def: 0, type: 'number', min: 0, max: 100 },

    { key: 'style.chartWidth', def: 400, type: 'number', min: 100, max: 500},
    { key: 'style.animation.show', def: true, type: 'checkbox'},
    { key: 'style.animation.animationFrames', def: 360, type: 'number', min: 0, max: 1000},
    { key: 'style.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.line.color', def: '#3366CC', type: 'color'},
    { key: 'style.line.strokeWidth', def: 3, type: 'number', min: 0, max: 20},
    { key: 'style.line.smooth', def: true, type: 'checkbox'},
    { key: 'style.bar.borderRadius', def: 3, type: 'number', min: 0, max: 12},
    { key: 'style.bar.color', def: '#3366CC', type: 'color'},
    { key: 'style.zeroLine.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.zeroLine.strokeWidth', def:1, type: 'number', min: 0, max: 12},
    { key: 'style.plot.show', def: true, type: 'checkbox'},
    { key: 'style.plot.radius', def: 4, type: 'number', min: 0, max: 12},
    { key: 'style.plot.stroke', def: '#FFFFFF', type: 'color'},
    { key: 'style.plot.strokeWidth', def: 1, type: 'number', min: 0, max: 6},
    { key: 'style.verticalIndicator.show', def: true, type: 'checkbox'},
    { key: 'style.verticalIndicator.strokeWidth', def: 1.5, type: 'number', min: 0, max: 6, step: 0.5},
    { key: 'style.verticalIndicator.color', def: '#3366CC', type: 'color'},
    { key: 'style.verticalIndicator.strokeDasharray', def: 3, type:'number', min: 0, max: 48},
    { key: 'style.dataLabel.show', def: false, type: 'checkbox'},
    { key: 'style.dataLabel.position', def: 'left', type: 'select', options:['left', 'right']},
    { key: 'style.dataLabel.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.dataLabel.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.dataLabel.fontSize', def: 20, type: 'number', min: 8, max: 48},
    { key: 'style.dataLabel.bold', def: true, type: 'checkbox'},
    { key: 'style.dataLabel.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.dataLabel.roundingValue',  def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.dataLabel.valueType', def: 'latest', type: 'select', options: ['latest', 'sum', 'average']},
    { key: 'style.dataLabel.prefix', def: 'P', type: 'text'},
    { key: 'style.dataLabel.suffix', def: 'S', type: 'text'},
    { key: 'style.title.show', def: false, type: 'checkbox'},
    { key: 'style.title.textAlign', def: 'left', type: 'select', options: ['left', 'center', 'right']},
    { key: 'style.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.title.fontSize', def: 16, type: 'number', min: 8, max: 48},
    { key: 'style.title.bold', def: true, type: 'checkbox'},
    { key: 'style.title.text', def: 'Lorem ipsum dolor sic amet', type: 'text'},
    { key: 'style.area.show', def: true, type: 'checkbox'},
    { key: 'style.area.useGradient', def: true, type: 'checkbox'},
    { key: 'style.area.opacity', def: 30, type: 'range', min: 0, max: 100},
    { key: 'style.area.color', def: '#CC7033', type: 'color'},

    { key: 'style.tooltip.show', def: true, type: 'checkbox' },
    { key: 'style.tooltip.fontSize', def: 12, type: 'number', min: 8, max: 42 },
    { key: 'style.tooltip.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.tooltip.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.tooltip.offsetY', def: 0, type: 'number', min: 0, max: 100},
    { key: 'style.tooltip.borderWidth', def: 1, type: 'number', min: 0, max: 12 },
    { key: 'style.tooltip.borderColor', def: '#FF0000', type: 'color'},
    { key: 'style.tooltip.backgroundOpacity', def: 50, type: 'number', min: 0, max: 100}
])

const themeOptions = ref([
    "",
    "dark",
    "hack",
    "zen",
    "concrete",
    "default",
    "celebration",
    "celebrationNight"
])

const currentTheme = ref(themeOptions.value[1]);

const configTheme = computed(() => ({ theme: currentTheme.value }));

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        events: {
            datapointEnter: ({ datapoint, seriesIndex }) => {
                console.log('enter event', { datapoint, seriesIndex })
            },
            datapointLeave: ({ datapoint, seriesIndex }) => {
                console.log('leave event', { datapoint, seriesIndex })
            },
            datapointClick: ({ datapoint, seriesIndex }) => {
                console.log('click event', { datapoint, seriesIndex })
            },
        },
        style: {
            ...c.style,
            dataLabel: {
                ...c.style.dataLabel,
                formatter: ({value, config}) => {
                    // console.log(config)
                    return `f - ${value}`
                },
                datetimeFormatter: {
                    enable: true,
                    locale: 'en',
                    useUTC: false,
                    januaryAsYear: true,
                    options: { 
                        year: 'yyyy',
                        month: `MMM`,
                        day: 'dd MMM',
                        hour: 'HH:mm',
                        minute: 'HH:mm:ss',
                        second: 'HH:mm:ss'
                    }
                }
            }
        },
        theme: currentTheme.value
    }
})

const step = ref(0)

</script>

<template>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <button @click="toggleProps">TOGGLE PROPS: {{ isPropsToggled }}</button>
    <button @click="alterDataset">ALTER DATASET</button>

    <Box comp="VueUiSparkline" :dataset="dataset">
        <template #title>VueUiSparkline</template>

        <template #responsive>
            <div style="width: 600px; height: 400px; resize: both; overflow: auto; background: white">
                <LocalVueUiSparkline :key="`responsive_${step}`" :dataset="dataset" :config="{
                    ...config,
                    responsive: true
                }">
                    <!-- <template #chart-background>
                        <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                    </template> -->

                    <template #source>
                        <div style="width:100%;font-size:10px;text-align:left">
                            SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                        </div>
                    </template> 
                </LocalVueUiSparkline>
            </div>
        </template>

        <template #theme>
            <LocalVueUiSparkline :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiSparkline :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`">

                <template #tooltip="{ absoluteValue }">
                    {{ absoluteValue }}
                </template>

                <!-- <template #before="{ selected, latest, sum, average, median, trend }">
                    <div style="color: white;height: 180px;font-size:11px">
                        #BEFORE
                        <ul>
                            <li>Latest: {{ latest }}</li>
                            <li>Sum: {{ sum }}</li>
                            <li>Average: {{ average }}</li>
                            <li>Median: {{ median }}</li>
                            <li>Trend: {{ trend }}</li>
                            <li>Selected: {{ selected }}</li>
                        </ul>
                    </div>
                </template> -->
            </LocalVueUiSparkline>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiSparkline" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`">
                <template #before="{ selected, latest, sum, average, median, trend }">
                    <div style="color: white;height: 180px;font-size:11px">
                        #BEFORE
                        <ul>
                            <li>Latest: {{ latest }}</li>
                            <li>Sum: {{ sum }}</li>
                            <li>Average: {{ average }}</li>
                            <li>Median: {{ median }}</li>
                            <li>Trend: {{ trend }}</li>
                            <li>Selected: {{ selected }}</li>
                        </ul>
                    </div>
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiSparkline :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`">
                <template #before="{ selected, latest, sum, average, median, trend }">
                    <div style="color: white;height: 180px;font-size:11px">
                        #BEFORE
                        <ul>
                            <li>Latest: {{ latest }}</li>
                            <li>Sum: {{ sum }}</li>
                            <li>Average: {{ average }}</li>
                            <li>Median: {{ median }}</li>
                            <li>Trend: {{ trend }}</li>
                            <li>Selected: {{ selected }}</li>
                        </ul>
                    </div>
                </template>
            </VueUiSparkline>
        </template>

        <template #build-treesh>
            <VueUiSparklineTreeshaken :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`">
                <template #before="{ selected, latest, sum, average, median, trend }">
                    <div style="color: white;height: 180px;font-size:11px">
                        #BEFORE
                        <ul>
                            <li>Latest: {{ latest }}</li>
                            <li>Sum: {{ sum }}</li>
                            <li>Average: {{ average }}</li>
                            <li>Median: {{ median }}</li>
                            <li>Trend: {{ trend }}</li>
                            <li>Selected: {{ selected }}</li>
                        </ul>
                    </div>
                </template>
            </VueUiSparklineTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiSparkline" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`">
                <template #before="{ selected, latest, sum, average, median, trend }">
                    <div style="color: white;height: 180px;font-size:11px">
                        #BEFORE
                        <ul>
                            <li>Latest: {{ latest }}</li>
                            <li>Sum: {{ sum }}</li>
                            <li>Average: {{ average }}</li>
                            <li>Median: {{ median }}</li>
                            <li>Trend: {{ trend }}</li>
                            <li>Selected: {{ selected }}</li>
                        </ul>
                    </div>
                </template>
            </VueDataUi>
        </template>

        <template #knobs>
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>

        <template #config>
            {{ config }}
        </template>
    </Box>
</template>