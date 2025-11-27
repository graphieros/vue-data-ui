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

const model = ref([
    { key: 'type', def: 'ohlc', type: 'select', options: ['ohlc', 'candlestick']},
    { key: 'loading', def: false, type: 'checkbox'},
    { key: 'debug', def: false, type: 'checkbox'},
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'responsiveProportionalSizing', def: false, type: 'checkbox'},
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.csv', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.table', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right']},
    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},

    { key: 'userOptions.print.scale', def: 2, type: 'number', min: 1, max: 5},
    { key: 'userOptions.print.allowTaint', def: true, type: 'checkbox'},
    { key: 'userOptions.print.useCORS', def: true, type: 'checkbox'},
    { key: 'userOptions.print.backgroundColor', def: '#FFFFFF' },
    
    { key: 'useCssAnimation', def: false, type: 'checkbox'},
    { key: 'style.fontFamily', def: "inherit", type: 'text'},
    { key: 'style.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.height', def: 316, type: 'number', min: 100, max: 1000},
    { key: 'style.width', def: 512, type: 'number', min: 100, max: 1000},
    { key: 'style.layout.padding.top', def: 0, type: 'number', min: 0, max: 100},
    { key: 'style.layout.padding.right', def: 12, type: 'number', min: 0, max: 100},
    { key: 'style.layout.padding.bottom', def: 0, type: 'number', min: 0, max: 100},
    { key: 'style.layout.padding.left', def: 0, type: 'number', min: 0, max: 100},
    { key: 'style.layout.selector.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.layout.selector.opacity', def: 10, type: 'range', min: 0, max: 100},
    { key: 'style.layout.grid.show', def: true, type: 'checkbox'},
    { key: 'style.layout.grid.stroke', def: '#CCCCCC', type: 'color'},
    { key: 'style.layout.grid.strokeWidth', def: 1, type: 'range', min: 0, max: 12, step: 0.5},

    { key: 'style.layout.grid.horizontalLines.show', def: true, type: 'checkbox'},
    { key: 'style.layout.grid.horizontalLines.strokeDasharray', def: 3, type: 'number', min: 0, max: 12},
    { key: 'style.layout.grid.horizontalLines.stroke', def: '#FF0000', type: 'color'},
    { key: 'style.layout.grid.horizontalLines.strokeWidth', def: 0.5, type: 'number', min: 0, max: 12, step: 0.1},

    { key: 'style.layout.grid.verticalLines.show', def: true, type: 'checkbox'},
    { key: 'style.layout.grid.verticalLines.strokeDasharray', def: 3, type: 'number', min: 0, max: 12},
    { key: 'style.layout.grid.verticalLines.stroke', def: '#0000FF', type: 'color'},
    { key: 'style.layout.grid.verticalLines.strokeWidth', def: 0.5, type: 'number', min: 0, max: 12, step: 0.1},

    { key: 'style.layout.grid.xAxis.dataLabels.show', def: true, type: 'checkbox'},
    { key: 'style.layout.grid.xAxis.dataLabels.fontSize', def: 10, type: 'number', min: 4, max: 12},
    { key: 'style.layout.grid.xAxis.dataLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.layout.grid.xAxis.dataLabels.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.layout.grid.xAxis.dataLabels.bold', def: false, type: 'checkbox'},
    { key: 'style.layout.grid.xAxis.dataLabels.rotation', def: -20, type: 'number', min: -360, max: 360},
    { key: 'style.layout.grid.xAxis.dataLabels.autoRotate.enable', def: true, type: 'checkbox'},
    { key: 'style.layout.grid.xAxis.dataLabels.autoRotate.angle', def: -90, type: 'number', min: -90, max: 90},

    { key: 'style.layout.grid.yAxis.dataLabels.show', def: true, type: 'checkbox'},
    { key: 'style.layout.grid.yAxis.dataLabels.fontSize', def: 10, type: 'number', min: 4, max: 12},
    { key: 'style.layout.grid.yAxis.dataLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.layout.grid.yAxis.dataLabels.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.layout.grid.yAxis.dataLabels.bold', def: false, type: 'checkbox'},
    { key: 'style.layout.grid.yAxis.dataLabels.steps', def: 10, type: 'number', min: 2, max: 20},
    { key: 'style.layout.grid.yAxis.dataLabels.prefix', def: 'P', type: 'text'},
    { key: 'style.layout.grid.yAxis.dataLabels.suffix', def: 'S', type: 'text'},
    { key: 'style.layout.grid.yAxis.scale.min', def: null, type: 'number', min: 0, max: 10000},
    { key: 'style.layout.grid.yAxis.scale.max', def: null, type: 'number', min: 0, max: 10000},

    { key: 'style.layout.wick.stroke', def: '#1A1A1A', type: 'color'},
    { key: 'style.layout.wick.strokeWidth', def: 0.5, type: 'number', min: 0, max: 12, step: 0.5},
    { key: 'style.layout.wick.extremity.shape', def: 'line', type: 'select', options: ['line', 'circle']},
    { key: 'style.layout.wick.extremity.size', def: 'auto', type: 'select', options: ['auto', 5, 10, 20, 40]},
    { key: 'style.layout.wick.extremity.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.layout.candle.borderRadius', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.layout.candle.stroke', def: '#1A1A1A', type: 'color'},
    { key: 'style.layout.candle.strokeWidth', def: 0.5, type: 'number', min: 0.5, max: 12, step:0.5},
    { key: 'style.layout.candle.colors.bearish', def: '#dc3912', type: 'color'},
    { key: 'style.layout.candle.colors.bullish', def: '#109618', type: 'color'},
    { key: 'style.layout.candle.gradient.show', def: true, type: 'checkbox'},
    { key: 'style.layout.candle.gradient.intensity', def: 40, type: 'range', min: 0, max: 100}, // not applied ?
    { key: 'style.layout.candle.gradient.underlayer', def: '#FFFFFF', type: 'color'},
    { key: 'style.layout.candle.widthRatio', def: 0.5, type: 'number', min: 0.1, max: 1, step: 0.1},
    
    { key: 'style.zoom.show', def: true, type: 'checkbox'},
    { key: 'style.zoom.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.zoom.highlightColor', def: '#4A4A4A', type: 'color' },
    { key: 'style.zoom.fontSize', def: 14, type: 'number', min: 8, max: 42},
    { key: 'style.zoom.useResetSlot', def: false, type: 'checkbox'},
    { key: 'style.zoom.startIndex', def: null, type: 'number', min: 0, max: 1000},
    { key: 'style.zoom.endIndex', def: null, type: 'number', min: 0, max: 1000},
    { key: 'style.zoom.enableRangeHandles', def: true, type: 'chexkbox'},
    { key: 'style.zoom.enableSelectionDrag', def: true, type: 'chexkbox'},
    { key: 'style.zoom.focusOnDrag', def: true, type: 'checkbox'},
    { key: 'style.zoom.focusRangeRatio', def: 0.2, type: 'number', min: 0.1, max: 0.9, step: 0.1},
    { key: 'style.zoom.minimap.show', def: true, type: 'checkbox' },
    { key: 'style.zoom.preview.enable', def: true, type: 'checkbox' },
    
    { key: 'style.title.text', def: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis', type: 'text'},
    { key: 'style.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.title.fontSize', def: 20, type: 'number', min: 8, max: 48},
    { key: 'style.title.bold', def: true, type: 'checkbox'},
    { key: 'style.title.subtitle.text', def: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis', type: 'text'},
    { key: 'style.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.title.subtitle.fontSize', def: 16, type: 'range', min: 8, max: 48},
    { key: 'style.title.subtitle.bold', def: false, type: 'checkbox'},

    { key: 'style.tooltip.show', def: true, type: 'checkbox' },
    { key: 'style.tooltip.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'style.tooltip.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.tooltip.fontSize', def: 14, type: 'number', min: 6, max: 24 },
    { key: 'style.tooltip.showValue', def: true, type: 'checkbox'},
    { key: 'style.tooltip.roundingValue', def: 0, type: 'number', min: 0, max: 6},
    { key: 'style.tooltip.prefix', def: 'P', type: 'text'},
    { key: 'style.tooltip.suffix', def: 'S', type: 'text'},
    { key: 'style.tooltip.backgroundOpacity', def: 100, type: 'range', min: 0, max: 100 },
    { key: 'style.tooltip.position', def: 'center', type: 'select', options: ['left', 'center', 'right']},
    { key: 'style.tooltip.offsetY', def: 24, type: 'number', min: 0, max: 48},

    { key: 'translations.period', def: 'Period', type: 'text'},
    { key: 'translations.open', def: 'Open', type: 'text'},
    { key: 'translations.high', def: 'High', type: 'text'},
    { key: 'translations.low', def: 'Low', type: 'text'},
    { key: 'translations.last', def: 'Close', type: 'text'},
    { key: 'translations.volume', def: 'Volume', type: 'text'},

    { key: 'table.responsiveBreakpoint', def: 400, type: 'number', min: 300, max: 800 },
    { key: 'table.th.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'table.th.color', def: '#1A1A1A', type: 'color' },
    { key: 'table.th.outline', def: 'none', type: 'text' },
    { key: 'table.td.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'table.td.color', def: '#1A1A1A', type: 'color'},
    { key: 'table.td.outline', def: 'none', type: 'text' },
    { key: 'table.td.roundingValue', def: 2, type: 'number', min: 0, max: 6 },
    { key: 'table.td.prefix', def: 'P', type: 'text'},
    { key: 'table.td.suffix', def: 'S', type: 'text'},
    
    { key: 'table.show', def: false, type: 'checkbox' },
    { key: 'table.useDialog', def: true, type: 'checkbox' },
])

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

    <Box comp="VueUiCandlestick" :dataset="dataset">
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

        <template #config>
            {{ config }}
        </template>
    </Box>
</template>