<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiCandlestick from '../src/components/vue-ui-candlestick.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

import { VueUiCandlestick } from "vue-data-ui";
import { VueUiCandlestick as VueUiCandlestickTreshaken } from "vue-data-ui/vue-ui-candlestick";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { vue_ui_candlestick: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);

const dataset = ref([]);

function generateRandomCandlestickData({
    count = 12,
    startDate = Date.UTC(2024, 0, 1), // starting date (Jan 1, 2024)
    interval = 30 * 24 * 60 * 60 * 1000, // 1 month in ms
    startPrice = 100,
    volatility = 0.2 // 20% volatility
    } = {}) {
    const data = [];
    let lastClose = startPrice;

    for (let i = 0; i < count; i++) {
        const timestamp = startDate + i * interval;

        // simulate price movement
        const changePercent = (Math.random() - 0.5) * volatility;
        const open = lastClose;
        const close = open * (1 + changePercent);
        const high = Math.max(open, close) * (1 + Math.random() * volatility);
        const low = Math.min(open, close) * (1 - Math.random() * volatility);
        const volume = Math.round(1000 + Math.random() * 9000);

        data.push([
            timestamp,
            Math.round(open),
            Math.round(high),
            Math.round(low),
            Math.round(close),
            volume
        ]);

        lastClose = close;
    }
    return data;
}

onMounted(() => {
    dataset.value = undefined;
    setTimeout(() => {
        dataset.value = generateRandomCandlestickData({ count: 100 })
    }, 100)
})

const alternateDataset = ref([
    ["2024-11-01", 125, 130, 45, 92, 1972],
    ["2024-12-01", 92, 120, 35, 75, 3599],
    ["2024-13-01", 75, 80, 26, 45, 5881],
    ["2024-14-01", 45, 60, 20, 30, 2881],
    ["2024-15-01", 30, 120, 10, 105, 2881],
])

const alternateConfig = ref({
    table: {
        th: {
            backgroundColor: '#00FF00'
        }
    },
    style: {
        backgroundColor: '#FF0000',
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
    dataset.value.push(
        ['ALT', Math.random()*80, Math.random() * 100 + 80, Math.random() * 40, Math.random()* 40 + 20, Math.random() * 3000]
    )
}

const model = createModel([
    SELECT("type", ["ohlc", "candlestick"], { def: "ohlc" }),
    CHECKBOX("loading", { def: false }),
    CHECKBOX("debug", { def: false }),
    CHECKBOX("responsive", { def: false }),
    CHECKBOX("responsiveProportionalSizing", { def: false }),

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

    CHECKBOX("useCssAnimation", { def: false }),

    TEXT("style.fontFamily", { def: "inherit" }),
    COLOR("style.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.color", { def: "#1A1A1A" }),

    NUMBER("style.height", { def: 316, min: 100, max: 1000 }),
    NUMBER("style.width", { def: 512, min: 100, max: 1000 }),

    NUMBER("style.layout.padding.top", { def: 0, min: 0, max: 100 }),
    NUMBER("style.layout.padding.right", { def: 12, min: 0, max: 100 }),
    NUMBER("style.layout.padding.bottom", { def: 0, min: 0, max: 100 }),
    NUMBER("style.layout.padding.left", { def: 0, min: 0, max: 100 }),

    COLOR("style.layout.selector.color", { def: "#1A1A1A" }),
    RANGE("style.layout.selector.opacity", { def: 10, min: 0, max: 100 }),

    CHECKBOX("style.layout.grid.show", { def: true }),
    COLOR("style.layout.grid.stroke", { def: "#CCCCCC" }),
    RANGE("style.layout.grid.strokeWidth", { def: 1, min: 0, max: 12, step: 0.5 }),

    CHECKBOX("style.layout.grid.horizontalLines.show", { def: true }),
    NUMBER("style.layout.grid.horizontalLines.strokeDasharray", { def: 3, min: 0, max: 12 }),
    COLOR("style.layout.grid.horizontalLines.stroke", { def: "#FF0000" }),
    NUMBER("style.layout.grid.horizontalLines.strokeWidth", { def: 0.5, min: 0, max: 12, step: 0.1 }),

    CHECKBOX("style.layout.grid.verticalLines.show", { def: true }),
    NUMBER("style.layout.grid.verticalLines.strokeDasharray", { def: 3, min: 0, max: 12 }),
    COLOR("style.layout.grid.verticalLines.stroke", { def: "#0000FF" }),
    NUMBER("style.layout.grid.verticalLines.strokeWidth", { def: 0.5, min: 0, max: 12, step: 0.1 }),

    CHECKBOX("style.layout.grid.xAxis.dataLabels.show", { def: true }),
    NUMBER("style.layout.grid.xAxis.dataLabels.fontSize", { def: 10, min: 4, max: 12 }),
    COLOR("style.layout.grid.xAxis.dataLabels.color", { def: "#1A1A1A" }),
    NUMBER("style.layout.grid.xAxis.dataLabels.offsetY", { def: 0, min: -100, max: 100 }),
    CHECKBOX("style.layout.grid.xAxis.dataLabels.bold", { def: false }),
    NUMBER("style.layout.grid.xAxis.dataLabels.rotation", { def: -20, min: -360, max: 360 }),

    CHECKBOX("style.layout.grid.xAxis.dataLabels.autoRotate.enable", { def: true }),
    NUMBER("style.layout.grid.xAxis.dataLabels.autoRotate.angle", { def: -90, min: -90, max: 90 }),

    CHECKBOX("style.layout.grid.yAxis.dataLabels.show", { def: true }),
    NUMBER("style.layout.grid.yAxis.dataLabels.fontSize", { def: 10, min: 4, max: 12 }),
    COLOR("style.layout.grid.yAxis.dataLabels.color", { def: "#1A1A1A" }),
    NUMBER("style.layout.grid.yAxis.dataLabels.offsetX", { def: 0, min: -100, max: 100 }),
    CHECKBOX("style.layout.grid.yAxis.dataLabels.bold", { def: false }),
    NUMBER("style.layout.grid.yAxis.dataLabels.steps", { def: 10, min: 2, max: 20 }),
    TEXT("style.layout.grid.yAxis.dataLabels.prefix", { def: "P" }),
    TEXT("style.layout.grid.yAxis.dataLabels.suffix", { def: "S" }),

    NUMBER("style.layout.grid.yAxis.scale.min", { def: null, min: 0, max: 10000 }),
    NUMBER("style.layout.grid.yAxis.scale.max", { def: null, min: 0, max: 10000 }),

    COLOR("style.layout.wick.stroke", { def: "#1A1A1A" }),
    NUMBER("style.layout.wick.strokeWidth", { def: 0.5, min: 0, max: 12, step: 0.5 }),

    SELECT("style.layout.wick.extremity.shape", ["line", "circle"], { def: "line" }),
    SELECT("style.layout.wick.extremity.size", ["auto", 5, 10, 20, 40], { def: "auto" }),
    COLOR("style.layout.wick.extremity.color", { def: "#1A1A1A" }),

    NUMBER("style.layout.candle.borderRadius", { def: 1, min: 0, max: 12 }),
    COLOR("style.layout.candle.stroke", { def: "#1A1A1A" }),
    NUMBER("style.layout.candle.strokeWidth", { def: 0.5, min: 0.5, max: 12, step: 0.5 }),

    COLOR("style.layout.candle.colors.bearish", { def: "#dc3912" }),
    COLOR("style.layout.candle.colors.bullish", { def: "#109618" }),

    CHECKBOX("style.layout.candle.gradient.show", { def: true }),
    RANGE("style.layout.candle.gradient.intensity", { def: 40, min: 0, max: 100 }),
    COLOR("style.layout.candle.gradient.underlayer", { def: "#FFFFFF" }),

    NUMBER("style.layout.candle.widthRatio", { def: 0.5, min: 0.1, max: 1, step: 0.1 }),

    CHECKBOX("style.zoom.show", { def: true }),
    COLOR("style.zoom.color", { def: "#CCCCCC" }),
    COLOR("style.zoom.highlightColor", { def: "#4A4A4A" }),
    NUMBER("style.zoom.fontSize", { def: 14, min: 8, max: 42 }),
    CHECKBOX("style.zoom.useResetSlot", { def: false }),
    NUMBER("style.zoom.startIndex", { def: null, min: 0, max: 1000 }),
    NUMBER("style.zoom.endIndex", { def: null, min: 0, max: 1000 }),

    CHECKBOX("style.zoom.enableRangeHandles", { def: true }),
    CHECKBOX("style.zoom.enableSelectionDrag", { def: true }),
    CHECKBOX("style.zoom.focusOnDrag", { def: true }),

    NUMBER("style.zoom.focusRangeRatio", { def: 0.2, min: 0.1, max: 0.9, step: 0.1 }),
    CHECKBOX("style.zoom.minimap.show", { def: true }),
    CHECKBOX("style.zoom.preview.enable", { def: true }),

    TEXT("style.title.text", { def: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis" }),
    COLOR("style.title.color", { def: "#1A1A1A" }),
    NUMBER("style.title.fontSize", { def: 20, min: 8, max: 48 }),
    CHECKBOX("style.title.bold", { def: true }),

    TEXT("style.title.subtitle.text", { def: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis" }),
    COLOR("style.title.subtitle.color", { def: "#CCCCCC" }),
    RANGE("style.title.subtitle.fontSize", { def: 16, min: 8, max: 48 }),
    CHECKBOX("style.title.subtitle.bold", { def: false }),

    CHECKBOX("style.tooltip.show", { def: true }),
    COLOR("style.tooltip.backgroundColor", { def: "#FFFFFF" }),
    COLOR("style.tooltip.color", { def: "#1A1A1A" }),
    NUMBER("style.tooltip.fontSize", { def: 14, min: 6, max: 24 }),
    CHECKBOX("style.tooltip.showValue", { def: true }),
    NUMBER("style.tooltip.roundingValue", { def: 0, min: 0, max: 6 }),
    TEXT("style.tooltip.prefix", { def: "P" }),
    TEXT("style.tooltip.suffix", { def: "S" }),
    RANGE("style.tooltip.backgroundOpacity", { def: 100, min: 0, max: 100 }),
    SELECT("style.tooltip.position", ["left", "center", "right"], { def: "center" }),
    NUMBER("style.tooltip.offsetY", { def: 24, min: 0, max: 48 }),

    TEXT("translations.period", { def: "Period" }),
    TEXT("translations.open", { def: "Open" }),
    TEXT("translations.high", { def: "High" }),
    TEXT("translations.low", { def: "Low" }),
    TEXT("translations.last", { def: "Close" }),
    TEXT("translations.volume", { def: "Volume" }),

    NUMBER("table.responsiveBreakpoint", { def: 400, min: 300, max: 800 }),
    COLOR("table.th.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.th.color", { def: "#1A1A1A" }),
    TEXT("table.th.outline", { def: "none" }),

    COLOR("table.td.backgroundColor", { def: "#FFFFFF" }),
    COLOR("table.td.color", { def: "#1A1A1A" }),
    TEXT("table.td.outline", { def: "none" }),
    NUMBER("table.td.roundingValue", { def: 2, min: 0, max: 6 }),
    TEXT("table.td.prefix", { def: "P" }),
    TEXT("table.td.suffix", { def: "S" }),

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
    const c = convertArrayToObject(model.value);
    if(testCustomTooltip.value) {
        return {
            ...c,
            style: {
                ...c.style,
                tooltip: {
                    ...c.style.tooltip,
                    customFormat: ({ datapoint }) => {
                        let html = '';
                        console.log(datapoint);
                        return "test"
                    }
                }
            }

        }
    } else {
        return {
            ...c,
            // events: {
            //     datapointEnter: ({ datapoint, seriesIndex }) => {
            //         console.log('enter event', { datapoint, seriesIndex })
            //     },
            //     datapointLeave: ({ datapoint, seriesIndex }) => {
            //         console.log('leave event', { datapoint, seriesIndex });
            //     },
            //     datapointClick: ({ datapoint, seriesIndex }) => {
            //         console.log('click event', { datapoint, seriesIndex });
            //     }
            // },
            theme: currentTheme.value,
            style: {
                ...c.style,
                zoom: {
                    ...c.style.zoom,
                    useDefaultFormat: true,
                    timeFormat: 'yyyy-MM-dd',
                    customFormat: ({ datapoint, timeLabel }) => {
                        return timeLabel
                    }
                },
                tooltip: {
                    ...c.style.tooltip,
                    useDefaultTimeFormat: false,
                    timeFormat: 'yyyy-MM-dd'
                },
                layout: {
                    ...c.style.layout,
                    grid: {
                        ...c.style.layout.grid,
                        xAxis: {
                            ...c.style.layout.grid.xAxis,
                            dataLabels: {
                                showOnlyFirstAndLast: false,
                                showOnlyAtModulo: true,
                                modulo: 12,
                                datetimeFormatter: {
                                    enable: true
                                }
                            }
                        },
                    }
                }
            }
        }
    }
});

const step = ref(0)

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena()

onMounted(async () => {
    if (local.value) {
        const img = await local.value.getImage();
        console.log(img)
    }
});

const selectedX = ref(undefined);

function selectX({ datapoint, index, indexLabel}) {
    selectedX.value = index;
}

function freestyle({ drawingArea, data }) {
    const maxVol = data.filter(d => !!d.isMaxVolume);
    const minVol = data.filter(d => !!d.isMinVolume);
    return `
        <path
            d="M${minVol[0]?.high?.x},${minVol[0]?.high?.y} ${maxVol[0]?.high?.x},${maxVol[0]?.high?.y}"
            stroke="black"
        />
        <path
            d="M${minVol[0]?.low?.x},${minVol[0]?.low?.y} ${maxVol[0]?.low?.x},${maxVol[0]?.low?.y}"
            stroke="black"
        />
        <polygon 
            points="
                ${minVol[0]?.high.x},${minVol[0]?.high?.y} 
                ${maxVol[0]?.high?.x},${maxVol[0]?.high?.y} 
                ${maxVol[0]?.low?.x},${maxVol[0]?.low?.y}
                ${minVol[0]?.low?.x},${minVol[0]?.low?.y} 
            "
            fill="#00000020"
        />
    `
}

</script>

<template>
    <button @click="toggleTable">TOGGLE TABLE</button>
    <button @click="toggleProps">TOGGLE PROPS: {{ isPropsToggled }}</button>
    <button @click="alterDataset">ALTER DATASET</button>

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

    <Box comp="VueUiCandlestick" :dataset="dataset" :config="config">
        <template #title>VueUiCandlestick</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiCandlestick :key="`responsive_${step}`" :dataset="dataset" :config="{
                    ...config,
                    responsive: true
                }">
                    <template #svg="{ svg }">
                        <g v-html="freestyle(svg)"/>
                    </template>

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
                </LocalVueUiCandlestick>
            </div>
        </template>

        <template #theme>
            <LocalVueUiCandlestick :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiCandlestick :selectedXIndex="selectedX" @selectX="selectX" :dataset="dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" ref="local">
                <!-- <template #optionPdf>
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
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template> -->
            </LocalVueUiCandlestick>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi :selectedXIndex="selectedX" @selectX="selectX" component="VueUiCandlestick" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`" ref="vduiLocal">
                <!-- <template #svg="{ svg }">
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
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template> -->
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiCandlestick :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" ref="build">
                <!-- <template #svg="{ svg }">
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
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template> -->
            </VueUiCandlestick>
        </template>

        <template #build-treesh>
            <VueUiCandlestickTreshaken :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" ref="build">
                <!-- <template #svg="{ svg }">
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
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template> -->
            </VueUiCandlestickTreshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiCandlestick" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`" ref="vduiBuild">
                <!-- <template #svg="{ svg }">
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
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template> -->
            </VueDataUi>
        </template>

        <template #knobs>
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>
    </Box>
</template>