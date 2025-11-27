<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiFunnel from '../src/components/vue-ui-funnel.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena"

import { VueUiFunnel } from "vue-data-ui";
import { VueUiFunnel as VueUiFunnelTreeshaken } from "vue-data-ui/vue-ui-funnel";
import ConfigKnobs from "./ConfigKnobs.vue";

const { local, build, vduiLocal, vduiBuild, toggleTable } = useArena()

const dataset = ref([
    {
        name: 'Lead',
        value: 7745.8234576
    },
    {
        name: 'Opportunity',
        value: 5468
    },
    {
        name: 'Qualified',
        value: 4238
    },
    {
        name: 'Sold',
        value: 2025
    },
    {
        name: 'Retained',
        value: 1520
    },
])

const model = ref([
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'responsiveProportionalSizing', def: false, type: 'checkbox'},
    
    { key: 'useCssAnimation', def: true, type: 'checkbox' },
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.width', def: 600, type: 'range', min: 300, max: 1000 },
    { key: 'style.chart.height', def: 500, type: 'range', min: 300, max: 1000 },

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

    { key: 'style.chart.padding.top', def: 12, type: 'number', min: 0, max: 200 },
    { key: 'style.chart.padding.right', def: 128, type: 'number', min: 0, max: 200 },
    { key: 'style.chart.padding.bottom', def: 24, type: 'number', min: 0, max: 200 },
    { key: 'style.chart.padding.left', def: 24, type: 'number', min: 0, max: 200 },

    { key: 'style.chart.barCircleSpacingRatio', def: 0.05, type: 'range', min: 0, max: 0.5, step: 0.01},
    
    { key: 'style.chart.circles.stroke', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.circles.strokeWidth', def: 1, type: 'range', min: 0, max: 12 },
    { key: 'style.chart.circles.dataLabels.fontSize', def: 16, min: 8, max: 48, type: 'range'},
    { key: 'style.chart.circles.dataLabels.offsetY', def: 0, min: -100, max: 100, type: 'number'},
    { key: 'style.chart.circles.dataLabels.adaptColorToBackground', def: true, type: 'checkbox'},
    { key: 'style.chart.circles.dataLabels.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.circles.dataLabels.rounding', def: 1, type: 'number', min: 0, max: 6},
    { key: 'style.chart.circles.dataLabels.bold', def: true, type: 'checkbox'},

    { key: 'style.chart.circleLinks.show', def: true, type: 'checkbox'},
    { key: 'style.chart.circleLinks.color', def: '#E1E5E8', type: 'color'},
    { key: 'style.chart.circleLinks.widthRatio', def: 1, type: 'range', min: 0.1, max: 2, step: 0.01},

    { key: 'style.chart.area.show', def: true, type: 'checkbox' },
    { key: 'style.chart.area.color', def: '#e1e5e8', type: 'color' },

    { key: 'style.chart.bars.stroke', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.bars.defaultColor', def: '#1f77b4', type: 'color'},
    { key: 'style.chart.bars.strokeWidth', def: 1, type: 'range', min: 0, max: 12 },
    { key: 'style.chart.bars.gapRatio', def: 0.2, type: 'range', min: 0, max: 1, step: 0.01 },
    { key: 'style.chart.bars.borderRadius', def: 3, min: 0, max: 24, type: 'range'},

    { key: 'style.chart.bars.dataLabels.name.fontSize', def: 16, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.bars.dataLabels.name.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.bars.dataLabels.name.bold', def: true, type: 'checkbox' },
    { key: 'style.chart.bars.dataLabels.name.offsetX', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.bars.dataLabels.name.offsetY', def: 0, type: 'number', min: -100, max: 100},

    { key: 'style.chart.bars.dataLabels.value.fontSize', def: 16, type: 'number', min: 8, max: 42},
    { key: 'style.chart.bars.dataLabels.value.rounding', def: 0, type: 'number', min: 0, max: 6 },
    { key: 'style.chart.bars.dataLabels.value.bold', def: false, type: 'checkbox'},
    { key: 'style.chart.bars.dataLabels.value.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.bars.dataLabels.value.prefix', def: 'P', type: 'text'},
    { key: 'style.chart.bars.dataLabels.value.suffix', def: 'S', type: 'text'},
    { key: 'style.chart.bars.dataLabels.value.offsetX', def: 0, type: 'number', min: -100, max: 100 },
    { key: 'style.chart.bars.dataLabels.value.offsetY', def: 0, type: 'number', min: -100, max: 100 },

    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},

    { key: 'userOptions.print.scale', def: 2, type: 'number', min: 1, max: 5},
    { key: 'userOptions.print.allowTaint', def: true, type: 'checkbox'},
    { key: 'userOptions.print.useCORS', def: true, type: 'checkbox'},
    { key: 'userOptions.print.backgroundColor', def: '#FFFFFF' },

    { key: 'table.show', def: false, type: 'checkbox'},
    { key: 'table.useDialog', def: true, type: 'checkbox'},
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
        theme: currentTheme.value,
        ...c,
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                circles: {
                    ...c.style.chart.circles,
                    dataLabels: {
                        ...c.style.chart.circles.dataLabels,
                        // formatter: ({ value, config }) => {
                        //     console.log(config)
                        //     return `CIR ${value}`
                        // }
                    }
                },
                bars: {
                    ...c.style.chart.bars,
                    dataLabels: {
                        ...c.style.chart.bars.dataLabels,
                        value: {
                            ...c.style.chart.bars.dataLabels.value,
                            // formatter: ({ value, config }) => {
                            //     console.log(config)
                            //     return `BAR ${value}`
                            // }
                        }
                    }
                }
            }
        }
    }
})

const step = ref(0);

onMounted(async () => {
    if (local.value) {
        const img = await local.value.getImage();
        console.log(img)
    }
})

</script>

<template>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme" @change="step += 1">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <Box>
        <template #title>VueUiFunnel</template>

        <template #responsive>
            <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
                <LocalVueUiFunnel :key="`responsive_${step}`" :dataset="dataset" :config="{
                    ...config,
                    responsive: true
                }">
                <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template>
            </LocalVueUiFunnel>
            </div>
        </template>

        <template #theme>
            <LocalVueUiFunnel :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiFunnel :dataset="dataset" :config="config" ref="local">
                <template #source>
                    #source
                </template>
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template>
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <g style="pointer-events: none;">
                        <circle :cx="svg.width - 30" :cy="svg.height / 2" :r="30" fill="#42d392" />
                        <text :x="svg.width - 30" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                    </g>
                </template>
            </LocalVueUiFunnel>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiFunnel" :dataset="dataset" :config="config">
                <template #source>
                    #source
                </template>
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template>
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <g style="pointer-events: none;">
                        <circle :cx="svg.width - 30" :cy="svg.height / 2" :r="30" fill="#42d392" />
                        <text :x="svg.width - 30" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                    </g>
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiFunnel :dataset="dataset" :config="config">
                <template #source>
                    #source
                </template>
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template>
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <g style="pointer-events: none;">
                        <circle :cx="svg.width - 30" :cy="svg.height / 2" :r="30" fill="#42d392" />
                        <text :x="svg.width - 30" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                    </g>
                </template>
            </VueUiFunnel>
        </template>

        <template #build-treesh>
            <VueUiFunnelTreeshaken :dataset="dataset" :config="config">
                <template #source>
                    #source
                </template>
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template>
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <g style="pointer-events: none;">
                        <circle :cx="svg.width - 30" :cy="svg.height / 2" :r="30" fill="#42d392" />
                        <text :x="svg.width - 30" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                    </g>
                </template>
            </VueUiFunnelTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiFunnel" :dataset="dataset" :config="config">
                <template #source>
                    #source
                </template>
                <template #watermark="{ isPrinting }">
                    <div v-if="isPrinting" style="font-size: 100px; opacity: 0.1; transform: rotate(-10deg)">
                        WATERMARK
                    </div>
                </template>
                <template #optionPdf>
                    PRINT PDF
                </template>
                <template #svg="{ svg }">
                    <g style="pointer-events: none;">
                        <circle :cx="svg.width - 30" :cy="svg.height / 2" :r="30" fill="#42d392" />
                        <text :x="svg.width - 30" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                    </g>
                </template>
            </VueDataUi>
        </template>

        <template #knobs>
            <ConfigKnobs :model="model" @change="step += 1"/>
        </template>
    </Box>
</template>