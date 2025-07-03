<script setup>
import { ref, computed } from "vue";
import LocalVueUiCandlestick from '../src/components/vue-ui-candlestick.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import VueUiCandlestick from "../src/components/vue-ui-candlestick.vue";
import { useArena } from "../src/useArena";

const dataset = ref([
    ["2024-01-01", 56, 120, 40, 110, 1250],
    ["2024-02-01", 110, 150, 80, 98, 2200],
    ["2024-03-01", 98, 155, 75, 103, 3500],
    ["2024-04-01", 103, 115, 102, 102, 999],
    ["2024-05-01", 102, 135, 72, 85, 3216],
    ["2024-06-01", 85, 162, 65, 107, 4315],
    ["2024-07-01", 107, 134, 99, 112, 2561],
    ["2024-08-01", 112, 125, 112, 120, 669],
    ["2024-09-01", 120, 113, 76, 89, 2591],
    ["2024-10-01", 89, 150, 85, 125, 2881],
    ["2024-11-01", 125, 130, 45, 92, 1972],
    ["2024-12-01", 92, 120, 35, 75, 3599],
    ["2024-13-01", 75, 80, 26, 45, 5881],
    ["2024-14-01", 45, 60, 20, 30, 2881],
    ["2024-15-01", 30, 120, 10, 105, 2881],
]);

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
    
    { key: 'useCssAnimation', def: true, type: 'checkbox'},
    { key: 'style.fontFamily', def: "inherit", type: 'text'},
    { key: 'style.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.height', def: 316, type: 'number', min: 100, max: 1000},
    { key: 'style.width', def: 512, type: 'number', min: 100, max: 1000},
    { key: 'style.layout.padding.top', def: 36, type: 'number', min: 0, max: 100},
    { key: 'style.layout.padding.right', def: 48, type: 'number', min: 0, max: 100},
    { key: 'style.layout.padding.bottom', def: 36, type: 'number', min: 0, max: 100},
    { key: 'style.layout.padding.left', def: 48, type: 'number', min: 0, max: 100},
    { key: 'style.layout.selector.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.layout.selector.opacity', def: 10, type: 'range', min: 0, max: 100},
    { key: 'style.layout.grid.show', def: true, type: 'checkbox'},
    { key: 'style.layout.grid.stroke', def: '#e1e5e8', type: 'color'},
    { key: 'style.layout.grid.strokeWidth', def: 0.5, type: 'range', min: 0, max: 12, step: 0.5},
    { key: 'style.layout.grid.xAxis.dataLabels.show', def: true, type: 'checkbox'},
    { key: 'style.layout.grid.xAxis.dataLabels.fontSize', def: 10, type: 'number', min: 4, max: 12},
    { key: 'style.layout.grid.xAxis.dataLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.layout.grid.xAxis.dataLabels.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.layout.grid.xAxis.dataLabels.bold', def: false, type: 'checkbox'},
    { key: 'style.layout.grid.xAxis.dataLabels.rotation', def: -20, type: 'number', min: -360, max: 360},
    { key: 'style.layout.grid.yAxis.dataLabels.show', def: true, type: 'checkbox'},
    { key: 'style.layout.grid.yAxis.dataLabels.fontSize', def: 10, type: 'number', min: 4, max: 12},
    { key: 'style.layout.grid.yAxis.dataLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.layout.grid.yAxis.dataLabels.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.layout.grid.yAxis.dataLabels.bold', def: false, type: 'checkbox'},
    { key: 'style.layout.grid.yAxis.dataLabels.steps', def: 10, type: 'number', min: 2, max: 20},
    { key: 'style.layout.grid.yAxis.dataLabels.prefix', def: 'P', type: 'text'},
    { key: 'style.layout.grid.yAxis.dataLabels.suffix', def: 'S', type: 'text'},
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
    { key: 'style.zoom.startIndex', def: 2, type: 'number', min: 0, max: 1000},
    { key: 'style.zoom.endIndex', def: 6, type: 'number', min: 0, max: 1000},
    { key: 'style.zoom.enableRangeHandles', def: true, type: 'chexkbox'},
    { key: 'style.zoom.enableSelectionDrag', def: true, type: 'chexkbox'},

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
    { key: 'translations.last', def: 'Last', type: 'text'},
    { key: 'translations.volume', def: 'Volume', type: 'text'},
    { key: 'table.show', def: false, type: 'checkbox', label: 'show', category: 'table' },
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
])

const testCustomTooltip = ref(false);

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default",
    "celebration",
    "celebrationNight"
])

const currentTheme = ref(themeOptions.value[6])

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
            theme: currentTheme.value
        }
    }
});

const step = ref(0)

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena()

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

    <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
        <LocalVueUiCandlestick :key="`responsive_${step}`" :dataset="dataset" :config="{
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
    </LocalVueUiCandlestick>
    </div>

    <Box comp="VueUiCandlestick" :dataset="dataset">
        <template #title>VueUiCandlestick</template>

        <template #local>
            <LocalVueUiCandlestick :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" ref="local">
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
                <template #reset-action="{ reset }">
                    <button @click="reset()">REFRESH</button>
                </template>
            </LocalVueUiCandlestick>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiCandlestick" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`" ref="vduiLocal">
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
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiCandlestick :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`" ref="build">
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
                </template>
            </VueUiCandlestick>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiCandlestick" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`" ref="vduiBuild">
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