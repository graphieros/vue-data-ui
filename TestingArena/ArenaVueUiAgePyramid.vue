<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiAgePyramid from '../src/components/vue-ui-age-pyramid.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

import { VueUiAgePyramid } from "vue-data-ui";
import { VueUiAgePyramid as VueUiAgePyramidTreeshaken } from "vue-data-ui/vue-ui-age-pyramid";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfig } from "../src/useConfig"
import { useConfigurationControls } from "./createConfigModel";

const { vue_ui_age_pyramid: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const dataset = ref(undefined);

onMounted(() => {
    setTimeout(() => {
        dataset.value = [
            ['2017', 5, 366538, 382762],
            ['2018', 4, 356873, 376705],
            ['2019', 3, 351707, 368670],
            ['2020', 2, 341042, 356678],
            ['2021', 1, 343026, 357351],
            ['2022', 0, 330929, 345538] 
        ];
    }, 2000)
})

const alternateDataset = ref([
    ['2017', 5, 10, 9],
    ['2018', 4, 11, 10],
    ['2019', 3, 12, 11],
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
    dataset.value.push([
        'ALT',
        1,
        Math.round(Math.random() * 300000) + 100000,
        Math.round(Math.random() * 300000) + 100000
    ])
}

const model = createModel([
    CHECKBOX("debug", { def: true }),
    CHECKBOX("loading", { def: false }),
    CHECKBOX("responsive", { def: false }),

    CHECKBOX("userOptions.show", { def: true }),
    CHECKBOX("userOptions.buttons.pdf", { def: true }),
    CHECKBOX("userOptions.buttons.csv", { def: true }),
    CHECKBOX("userOptions.buttons.img", { def: true }),
    CHECKBOX("userOptions.buttons.table", { def: true }),
    CHECKBOX("userOptions.buttons.fullscreen", { def: true }),
    SELECT("userOptions.position", ["left", "right"], { def: "right" }),
    CHECKBOX("userOptions.showOnChartHover", { def: true }),
    CHECKBOX("userOptions.keepStateOnChartLeave", { def: true }),

    NUMBER("userOptions.print.scale", { def: 2, min: 1, max: 5 }),
    CHECKBOX("userOptions.print.allowTaint", { def: true }),
    CHECKBOX("userOptions.print.useCORS", { def: true }),
    COLOR("userOptions.print.backgroundColor", { def: "#FFFFFF" }),

    COLOR("style.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.color", { def: "#1A1A1A" }),
    TEXT("style.fontFamily", { def: "inherit" }),
    NUMBER("style.height", { def: 200, min: 200, max: 1000 }),
    NUMBER("style.width", { def: 500, min: 200, max: 1000 }),

    NUMBER("style.layout.padding.top", { def: 0, min: 0, max: 100 }),
    NUMBER("style.layout.padding.right", { def: 24, min: 0, max: 100 }),
    NUMBER("style.layout.padding.bottom", { def: 24, min: 0, max: 100 }),
    NUMBER("style.layout.padding.left", { def: 24, min: 0, max: 100 }),

    CHECKBOX("style.layout.grid.show", { def: true }),
    COLOR("style.layout.grid.stroke", { def: "#e1e5e8" }),
    NUMBER("style.layout.grid.strokeWidth", { def: 1, min: 0, max: 12 }),

    CHECKBOX("style.layout.dataLabels.sideTitles.show", { def: true }),
    NUMBER("style.layout.dataLabels.sideTitles.fontSize", { def: 18, min: 8, max: 48 }),
    COLOR("style.layout.dataLabels.sideTitles.color", { def: "#1A1A1A" }),
    CHECKBOX("style.layout.dataLabels.sideTitles.useSideColor", { def: true }),
    CHECKBOX("style.layout.dataLabels.sideTitles.bold", { def: true }),
    NUMBER("style.layout.dataLabels.sideTitles.offsetY", { def: 0, min: -100, max: 100 }),

    CHECKBOX("style.layout.dataLabels.xAxis.show", { def: true }),
    NUMBER("style.layout.dataLabels.xAxis.fontSize", { def: 12, min: 8, max: 48 }),
    COLOR("style.layout.dataLabels.xAxis.color", { def: "#1A1A1A" }),
    CHECKBOX("style.layout.dataLabels.xAxis.bold", { def: false }),
    RANGE("style.layout.dataLabels.xAxis.scale", { def: 1000, min: 100, max: 10000 }),
    TEXT("style.layout.dataLabels.xAxis.translation", { def: "in thousands" }),
    NUMBER("style.layout.dataLabels.xAxis.autoRotate.angle", { def: -90, min: -90, max: 90 }),

    CHECKBOX("style.layout.dataLabels.yAxis.show", { def: true }),
    SELECT("style.layout.dataLabels.yAxis.display", ["age", "year"], { def: "age" }),
    NUMBER("style.layout.dataLabels.yAxis.fontSize", { def: 12, min: 8, max: 48 }),
    COLOR("style.layout.dataLabels.yAxis.color", { def: "#1A1A1A" }),
    CHECKBOX("style.layout.dataLabels.yAxis.bold", { def: false }),
    RANGE("style.layout.dataLabels.yAxis.showEvery", { def: 5, min: 1, max: 100 }),

    NUMBER("style.layout.centerSlit.width", { def: 20, min: 0, max: 100 }),
    NUMBER("style.layout.bars.gap", { def: 2, min: 0, max: 24 }),
    NUMBER("style.layout.bars.borderRadius", { def: 2, min: 0, max: 24 }),
    COLOR("style.layout.bars.left.color", { def: "#DC3912" }),
    COLOR("style.layout.bars.right.color", { def: "#3366CC" }),

    CHECKBOX("style.layout.bars.gradient.show", { def: true }),
    COLOR("style.layout.bars.gradient.underlayer", { def: "#FFFFFF" }),
    RANGE("style.layout.bars.gradient.intensity", { def: 60, min: 0, max: 100 }),
    NUMBER("style.layout.bars.gradient.shiftHue", { def: 0.05, min: 0, max: 1, step: 0.01 }),

    COLOR("style.highlighter.color", { def: "#1A1A1A" }),
    RANGE("style.highlighter.opacity", { def: 5, min: 0, max: 100 }),

    TEXT("style.title.text", { def: "Lorem ipsum dolor sit amet" }),
    COLOR("style.title.color", { def: "#1A1A1A" }),
    NUMBER("style.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.title.bold", { def: true }),

    COLOR("style.title.subtitle.color", { def: "#CCCCCC" }),
    TEXT("style.title.subtitle.text", { def: "Lorem ipsum sit amet" }),
    NUMBER("style.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.title.subtitle.bold", { def: false }),

    CHECKBOX("style.tooltip.show", { def: true }),
    COLOR("style.tooltip.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.tooltip.color", { def: "#1A1A1A" }),
    NUMBER("style.tooltip.fontSize", { def: 14, min: 8, max: 48 }),
    NUMBER("style.tooltip.roundingValue", { def: 2, min: 0, max: 12 }),
    RANGE("style.tooltip.backgroundOpacity", { def: 100, min: 0, max: 100 }),
    SELECT("style.tooltip.position", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.tooltip.offsetY", { def: 24, min: 0, max: 48 }),

    TEXT("translations.age", { def: "age" }),
    TEXT("translations.male", { def: "male" }),
    TEXT("translations.female", { def: "female" }),
    TEXT("translations.total", { def: "total" }),
    TEXT("translations.year", { def: "year" }),

    NUMBER("table.responsiveBreakpoint", { def: 400, min: 300, max: 800 }),
    COLOR("table.th.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.th.color", { def: "#1A1A1A" }),
    TEXT("table.th.outline", { def: "none" }),
    COLOR("table.td.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.td.color", { def: "#1A1A1A" }),
    TEXT("table.td.outline", { def: "none" }),
    CHECKBOX("table.show", { def: false }),
    CHECKBOX("table.useDialog", { def: true })
]);

const testCustomTooltip = ref(false);

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
    const c = convertArrayToObject(model.value)
    if(testCustomTooltip.value) {
        return {
            ...c,
            style: {
                ...c.style,
                tooltip: {
                    ...c.style.tooltip,
                    customFormat: ({ datapoint }) => {
                        // console.log({datapoint})
                        return 'test'
                    }
                }
            }
        }
    } else {
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
            style: {
                ...c.style,
                layout: {
                    ...c.style.layout,
                    dataLabels: {
                        ...c.style.layout.dataLabels,
                        xAxis: {
                            ...c.style.layout.dataLabels.xAxis,
                            formatter: ({value, config}) => {
                                // console.log(config)
                                return `X | ${value}`
                            }
                        },
                        yAxis: {
                            ...c.style.layout.dataLabels.yAxis,
                            formatter: ({value}) => {
                                return `Y | ${value}`
                            }
                        },
                    }
                }
            },
            theme: currentTheme.value
        }
    }
});

const step = ref(0);

const local= ref(null);
const build = ref(null);

function toggleTable() {
    local.value.toggleTable();
    build.value.toggleTable();
}

onMounted(async () => {
    if (build.value) {
        const img = await build.value.getImage();
        console.log(img)
    }
})

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>
    <div style="margin: 12px 0">
        <input type="checkbox" v-model="testCustomTooltip" id="custom-tooltip" />
        <label for="custom-tooltip" style="color:#CCCCCC">Test custom tooltip</label>
    </div>
    <button @click="toggleProps">TOGGLE PROPS: {{ isPropsToggled }}</button>
    <button @click="alterDataset">ALTER DATASET</button>

    <Box comp="VueUiAgePyramid" :dataset="dataset">
        <template #title>VueUiAgePyramid</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiAgePyramid :key="`responsive_${step}`" :dataset="dataset" :config="{
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
            </LocalVueUiAgePyramid>
            </div>
        </template>

        <template #theme>
            <LocalVueUiAgePyramid :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiAgePyramid :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" ref="local">
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
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
            </LocalVueUiAgePyramid>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiAgePyramid" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`" ref="build">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
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
            <VueUiAgePyramid :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
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
            </VueUiAgePyramid>
        </template>

        <template #build-treesh>
            <VueUiAgePyramidTreeshaken :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
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
            </VueUiAgePyramidTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiAgePyramid" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
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
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>

        <template #config>
            {{ config }}
        </template>
    </Box>
</template>