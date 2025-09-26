<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiWheel from '../src/components/vue-ui-wheel.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

import { VueUiWheel } from "vue-data-ui";
import { VueUiWheel as VueUiWheelTreeshaken } from "vue-data-ui/vue-ui-wheel";

const dataset = ref(undefined);

onMounted(() => {
    setTimeout(() => {
        dataset.value = { percentage: 12 };
    }, 2000)
})


// onMounted(() => {
//     setTimeout(() => {
//         dataset.value.percentage = 10
//     }, 3000)
// })


const isPropsToggled = ref(false);
function toggleProps() {
    isPropsToggled.value = !isPropsToggled.value;
}

const alternateDataset = ref({ percentage: 50 });

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

function alterDataset() {
    dataset.value.percentage = Math.round(Math.random() * 100);
}

const model = ref([
    { key: 'layout', def: '3d', type: 'select', options: ['3d', 'classic']},
    { key: 'debug', def: true, type: 'checkbox'},
    { key: 'loading', def: false, type: 'checkbox'},
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'userOptions.show', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'userOptions.position', def: 'left', type: 'select', options: ['left', 'right']},
    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},

    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.animation.use', def: true, type: 'checkbox'},
    { key: 'style.chart.animation.speed', def: 0.5, type: 'number', min: 0, max: 2, step: 0.01},
    { key: 'style.chart.animation.acceleration', def: 1, type: 'number', min: 0, max: 10, step: 0.1},

    { key: 'style.chart.layout.wheel.radiusRatio', def: 0.9, type: 'number', min: 0.1, max: 1, step: 0.01 },
    { key: 'style.chart.layout.wheel.tiltAngle3d', def: 50, type: 'range', min: 10, max: 80 },

    { key: 'style.chart.layout.wheel.ticks.rounded', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.wheel.ticks.inactiveColor', def: '#e1e5e8', type: 'color'},
    { key: 'style.chart.layout.wheel.ticks.activeColor', def: '#5f8bee', type: 'color'},
    { key: 'style.chart.layout.wheel.ticks.sizeRatio', def: 0.85, type: 'range', min: 0, max: 1, step: 0.01 },
    { key: 'style.chart.layout.wheel.ticks.gradient.show', def: false, type: 'checkbox'},
    { key: 'style.chart.layout.wheel.ticks.gradient.shiftHueIntensity', def: 12, type:'range', min: 0, max: 100},
    { key: 'style.chart.layout.wheel.ticks.quantity', def: 100, type: 'range', min: 1, max: 1000},
    { key: 'style.chart.layout.wheel.ticks.strokeWidth', def: 0, type: 'range', min: 0.1, max: 12, step: 0.1},
    { key: 'style.chart.layout.wheel.ticks.stroke', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.layout.wheel.ticks.type', def: 'arc', type: 'select', options: ['classic', 'arc']},
    { key: 'style.chart.layout.wheel.ticks.spacingRatio3d', def: 0.8, type: 'number', min: 0.1, max: 1, step: 0.1},
    { key: 'style.chart.layout.wheel.ticks.shadeColorRatio3d', def: 0.15, type: 'number', min: 0.1, max: 1, step: 0.1},
    { key: 'style.chart.layout.wheel.ticks.depth3d', def: 100, type: 'range', min: 0, max: 20},

    { key: 'style.chart.layout.innerCircle.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.innerCircle.stroke', def: '#e1e5e8', type: 'color'},
    { key: 'style.chart.layout.innerCircle.strokeWidth', def: 1, type: 'range', min: 0, max: 48},
    { key: 'style.chart.layout.innerCircle.radiusRatio', def: 0.9, type: 'number', min: 0, max: 2, step: 0.1},

    { key: 'style.chart.layout.percentage.show', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.percentage.fontSize', def: 80, type: 'range', min: 8, max: 100},
    { key: 'style.chart.layout.percentage.rounding', def: 1, type: 'range', min: 0, max: 12},
    { key: 'style.chart.layout.percentage.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.layout.percentage.offsetX', def: 12, type: 'number', min: -100, max: 100 },
    { key: 'style.chart.layout.percentage.offsetY', def: -16, type: 'number', min: -100, max: 100 },
    { key: 'style.chart.layout.percentage.stroke', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.layout.percentage.strokeWidth', def: 6, type: 'number', min: 0, max: 12 },

    { key: 'style.chart.title.text', def: 'Lorem ipsum dolor sic amet', type: 'text'},
    { key: 'style.chart.title.text', def: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis', type: 'text'},
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 8, max: 48},
    { key: 'style.chart.title.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.title.subtitle.text', def: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis', type: 'text'},
    { key: 'style.chart.title.subtitle.color', def: '#CCCCCC', type: 'color'},
    { key: 'style.chart.title.subtitle.fontSize', def: 16, type: 'range', min: 8, max: 48},
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox'},

    { key: 'userOptions.print.scale', def: 2, type: 'number', min: 1, max: 5},
    { key: 'userOptions.print.allowTaint', def: true, type: 'checkbox'},
    { key: 'userOptions.print.useCORS', def: true, type: 'checkbox'},
    { key: 'userOptions.print.backgroundColor', def: '#FFFFFF' }
])

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default",
    "celebration",
    "celebrationNight"
])

const currentTheme = ref(themeOptions.value[0])

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        style: {
            ...c.style,
            chart: {
                ...c.style.chart,
                layout: {
                    ...c.style.chart.layout,
                    percentage: {
                        ...c.style.chart.layout.percentage,
                        // formatter: ({value}) => {
                        //     return `f - ${value}`
                        // }
                    }
                }
            }
        },
        theme: currentTheme.value
    }
});

const step = ref(0)

const local = ref(null)

onMounted(async () => {
    if (local.value) {
        const img = await local.value.getImage()
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

    <button @click="toggleProps">TOGGLE PROPS: {{ isPropsToggled }}</button>
    <button @click="alterDataset">ALTER DATASET</button>

    <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
        <LocalVueUiWheel :key="`responsive_${step}`" :dataset="isPropsToggled ? alternateDataset : dataset" :config="{
            ...config,
            responsive: true
        }">
            <template #chart-background>
                <div style="height: 100%; width: 100%; background: radial-gradient(at top left, red, white)"/>
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
        </LocalVueUiWheel>
    </div>

    <Box comp="VueUiWheel" :dataset="isPropsToggled ? alternateDataset : dataset">
        <template #title>VueUiWheel</template>
        
        <template #local>
            <LocalVueUiWheel :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`local_${step}`" ref="local">
                <template #optionPdf>
                    PRINT PDF
                </template>
                <!-- <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d39230" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template> -->
                
            </LocalVueUiWheel>
        </template>
        
        <template #VDUI-local>
            <LocalVueDataUi component="VueUiWheel" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-lodal_${step}`">
                <!-- <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d39230" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template> -->
            </LocalVueDataUi>
        </template>
        
        <template #build>
            <VueUiWheel :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`">
                <!-- <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d39230" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template> -->
            </VueUiWheel>
        </template>
        
        <template #build-treesh>
            <VueUiWheelTreeshaken :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`build_${step}`">
                <!-- <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d39230" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template> -->
            </VueUiWheelTreeshaken>
        </template>
        
        <template #VDUI-build>
            <VueDataUi component="VueUiWheel" :dataset="isPropsToggled ? alternateDataset : dataset" :config="isPropsToggled ? alternateConfig : config" :key="`VDUI-build_${step}`">
                <!-- <template #svg="{ svg }">
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="30" fill="#42d39230" />
                    <text :x="svg.width / 2" :y="svg.height / 2" text-anchor="middle">#SVG</text>
                </template> -->
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