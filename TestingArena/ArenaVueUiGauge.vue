<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiGauge from '../src/components/vue-ui-gauge.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const source = ref({
    base: 100,
    value: 25,
    series: [
        { from: -100, to: -70, name: 'series 1', nameOffsetRatio: 1},
        { from: -70, to: -35, name: 'series 2', nameOffsetRatio: 1 },
        { from: -35, to: 0, name: 'series 3', nameOffsetRatio: 1  },
        { from: 0, to: 50, name: 'series 4', nameOffsetRatio: 1  },
        { from: 50, to: 100, name: 'series 5'  }
    ]
})

const dataset = computed(() => {
    return source.value
})

const alternateDataset = ref({
    base: 100,
    value: 12,
    series: [
        { from: -100, to: 0 },
        { from: 0, to: 100 }
    ]
})

const alternateConfig = ref({
    style: {
        chart: {
            backgroundColor: '#FF0000',
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
    source.value.value = Math.round(Math.random() * 100)
}


onMounted(() => {
    setTimeout(() => {
        source.value.value = 50
    }, 2000)
})

const model = ref([
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'userOptions.position', def: 'right', type: 'select', options: ['left', 'right']},
    
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.animation.use', def: true, type: 'checkbox'},
    { key: 'style.chart.animation.speed', def: 1, type: 'range', min: 0, max: 100},
    { key: 'style.chart.animation.acceleration', def: 1, type: 'range', min: 0, max: 10},

    { key: 'style.chart.layout.radiusRatio', def: 0.8, min: 0.5, max: 1.2, step: 0.01, type: 'range'},
    { key: 'style.chart.layout.track.size', def: 1, type: 'range', min: 0.5, max: 2, step: 0.01},
    { key: 'style.chart.layout.track.useGradient', def: true, type:  'checkbox'},
    { key: 'style.chart.layout.track.gradientIntensity', def: 20, type: 'range', min: 10, max: 30},
    { key: 'style.chart.layout.markers.color', def: '#1A1A1A', type: 'color'},
    /* DEPRECATED */ { key: 'style.chart.layout.markers.size', def: 1, type: 'range', min: 0.5, max: 2, step: 0.01},
    /* DEPRECATED */ { key: 'style.chart.layout.markers.stroke', def: '#1A1A1A', type: 'color'},
    /* DEPRECATED */ { key: 'style.chart.layout.markers.strokeWidth', def: 1, type: 'range', min: 0, max: 12, step: 0.1},
    /* DEPRECATED */ { key: 'style.chart.layout.markers.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.layout.markers.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.markers.fontSizeRatio', def: 1, type: 'range', min: 0, max: 2, step:0.01},
    { key: 'style.chart.layout.markers.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.chart.layout.markers.roundingValue', def: 0, type: 'number', min: 0, max: 12},
    { key: 'style.chart.layout.markers.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.markers.prefix', def: '', type: 'text'},
    { key: 'style.chart.layout.markers.suffix', def: '', type: 'text'},

    { key: 'style.chart.layout.pointer.type', def: 'pointy', type: 'select', options: ['rounded', 'pointy']},
    { key: 'style.chart.layout.pointer.size', def: 1, type: 'range', min: 0.2, max: 1.5, step: 0.01},
    { key: 'style.chart.layout.pointer.stroke', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.layout.pointer.strokeWidth', def: 12, type: 'range', min: 1, max: 48, step: 0.5},
    { key: 'style.chart.layout.pointer.useRatingColor', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.pointer.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.layout.pointer.circle.radius', def: 10, type: 'range', min: 0, max: 48, step: 0.5},
    { key: 'style.chart.layout.pointer.circle.stroke', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.pointer.circle.strokeWidth', def: 2, type: 'range', min: 0, max: 12, step: 0.5},
    { key: 'style.chart.layout.pointer.circle.color', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.legend.fontSize', def: 48, type: 'range', min: 8, max: 100},
    { key: 'style.chart.legend.prefix', def: '$', type: 'text'},
    { key: 'style.chart.legend.suffix', def: '€', type: 'text'},
    { key: 'style.chart.legend.roundingValue', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.legend.showPlusSymbol', def: true, type: 'checkbox'},
    { key: 'style.chart.legend.useRatingColor', def: true, type: 'checkbox'},
    { key: 'style.chart.legend.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.legend.show', def: true, type: 'checkbox'},

    { key: 'style.chart.title.text', def: 'Lorem ipsum dolor amet', type: 'text'},
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.fontSize', def: 20, type: 'range', min: 8, max: 48},
    { key: 'style.chart.title.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.title.subtitle.text', def: 'Lorem ipsum dolor sic amet', type: 'text'},
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'range', min: 8, max: 48},
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox'},
    { key: 'translations.base', def: 'Base population'},

    { key: 'style.chart.layout.segmentNames.show', def: true, type: 'checkbox' },
    { key: 'style.chart.layout.segmentNames.curved', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.segmentNames.offsetRatio', def: 1.1, type: 'range', min: 0.5, max: 1.3, step: 0.01},
    { key: 'style.chart.layout.segmentNames.fontSize', def: 16, type: 'number', min: 8, max: 42},
    { key: 'style.chart.layout.segmentNames.useSerieColor', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.segmentNames.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.layout.segmentNames.bold', def: false, type: 'checkbox'},

    { key: 'style.chart.layout.segmentNames.markers.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.segmentNames.markers.useSerieColor', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.segmentNames.markers.color', def: '#1A1A1A', type: 'color'},

    { key: 'style.chart.layout.segmentSeparators.show', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.segmentSeparators.offsetOut', def: 0, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.layout.segmentSeparators.offsetIn', def: 0, type: 'number', min: 0, max: 100 },
    { key: 'style.chart.layout.segmentSeparators.stroke', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.layout.segmentSeparators.strokeWidth', def: 2, type: 'number', min: 0, max: 12 },
])

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default"
])

const currentTheme = ref(themeOptions.value[4])

const config = computed(() => {
    const c = convertArrayToObject(model.value)
    return {
        ...c,
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                layout: {
                    ...c.style.chart.layout,
                    markers: {
                        ...c.style.chart.layout.markers,
                        // formatter: ({ value }) => {
                        //     return 'V | ' + value
                        // }
                    }
                },
                legend: {
                    ...c.style.chart.legend,
                    // formatter: ({value}) => {
                    //     return `f - ${value}`
                    // }
                }
            }
        },
        theme: currentTheme.value,
        customPalette: ['#6376DD', "#DD3322", "#66DDAA"],
    }
})

const step = ref(0);

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

    <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
        <LocalVueUiGauge :key="`responsive_${step}`" :dataset="isPropsToggled ? alternateDataset : dataset" :config="{
            ...config,
            responsive: true
        }">
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
    </LocalVueUiGauge>
    </div>

    
    <Box comp="VueUiGauge" :dataset="isPropsToggled ? alternateDataset : dataset">
        <template #title>VueUiGauge</template>

        <template #local :key="`local_${step}`">
            <LocalVueUiGauge :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config">
                <template #optionPdf>
                    PRINT PDF
                </template>
                <!-- <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template> -->
                <template #legend="{ legend }">
                    #LEGEND
                    {{ legend }}
                </template>
            </LocalVueUiGauge>
        </template>
        
        <template #VDUI-local>
            <LocalVueDataUi component="VueUiGauge" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    {{ legend }}
                </template>
            </LocalVueDataUi>
        </template>
        
        <template #build>
            <VueUiGauge :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    {{ legend }}
                </template>
            </VueUiGauge>
        </template>
        
        <template #VDUI-build>
            <VueDataUi component="VueUiGauge" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`">
                <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d392" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template>
                <template #legend="{ legend }">
                    #LEGEND
                    {{ legend }}
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