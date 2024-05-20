<script setup>
import { ref, computed } from "vue";
import LocalVueUiSparkHistogram from '../src/components/vue-ui-sparkhistogram.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const dataset = ref([
    {
        value: -1.2,
        valueLabel: "20.35%",
        timeLabel: "09:00",
        intensity: 1,
    },
    {
        value: 1.3,
        valueLabel: "50%",
        timeLabel: "10:00",
        intensity: 0.5,

    },
    {
        value: 1.1,
        valueLabel: "60%",
        timeLabel: "11:00",
        intensity: 0.6,

    },
    {
        value: 0.8,
        valueLabel: "70%",
        timeLabel: "12:00",
        intensity: 0.7,

    },
    {
        value: 2,
        valueLabel: "100%",
        timeLabel: "13:00",
        intensity: 1,

    },
    {
        value: 2.1,
        valueLabel: "100%",
        timeLabel: "14:00",
        intensity: 1,

    },
    {
        value: 2.3,
        valueLabel: "80%",
        timeLabel: "15:00",
        intensity: 0.8,

    },
    {
        value: 2.1,
        valueLabel: "70%",
        timeLabel: "16:00",
        intensity: 0.7,

    },
    {
        value: 0.9,
        valueLabel: "60%",
        timeLabel: "17:00",
        intensity: 0.6,

    },
    {
        value: 0.7,
        valueLabel: "50%",
        timeLabel: "18:00",
        intensity: 0.5,

    },
    {
        value: 0.3,
        valueLabel: "30%",
        timeLabel: "19:00",
        intensity: 0.3,

    },
    {
        value: 0.2,
        valueLabel: "20%",
        timeLabel: "20:00",
        intensity: 0.2,

    },
])

const model = ref([
    { key: 'style.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.animation.show', def: true, type: 'checkbox'},
    { key: 'style.animation.speedMs', def: 500, type: 'range', min: 100, max: 1000},
    { key: 'style.layout.height', def: 96, type: 'number', min: 30, max: 300},
    { key: 'style.layout.width', def: 640, type: 'number', min: 200, max: 1000},
    { key: 'style.layout.padding.top', def: 24, type: 'number', min: 0, max: 48},
    { key: 'style.layout.padding.right', def: 0, type: 'number', min: 0, max: 48},
    { key: 'style.layout.padding.left', def: 0, type: 'number', min: 0, max: 48},
    { key: 'style.layout.padding.bottom', def: 36, type: 'number', min: 0, max: 48},
    { key: 'style.bars.shape', def: 'square', type: 'select', options: ['circle', 'triangle', 'square', 'diamond', 'pentagon', 'hexagon', 'star']},
    { key: 'style.bars.strokeWidth', def: 0, type: 'number', min: 0, max: 12},
    { key: 'style.bars.colors.positive', def: '#3366CC', type: 'color'},
    { key: 'style.bars.colors.negative', def: '#CC6633', type: 'color'},
    { key: 'style.bars.colors.gradient.show', def: true, type: 'checkbox'},
    { key: 'style.bars.borderRadius', def: 24, type: 'range', min: 0, max: 48},
    { key: 'style.bars.gap', def: 12, type: 'range', min: 0, max: 48},
    { key: 'style.labels.value.fontSize', def: 14, type: 'number', min: 8, max: 48},
    { key: 'style.labels.value.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.labels.value.bold', def: true, type: 'checkbox'},
    { key: 'style.labels.value.rounding', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.labels.value.prefix', def: 'P', type: 'text'},
    { key: 'style.labels.value.suffix', def: 'S', type: 'text'},
    { key: 'style.labels.value.offsetY', def: 0, type: 'number', min: -100, max: 100},
    { key: 'style.labels.valueLabel.fontSize', def: 14, type: 'number', min: 8, max: 48},
    { key: 'style.labels.valueLabel.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.labels.valueLabel.bold', def: false, type: 'checkbox'},
    { key: 'style.labels.valueLabel.rounding', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.labels.timeLabel.fontSize', def: 12, type: 'number', min: 8, max: 24},
    { key: 'style.labels.timeLabel.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.labels.timeLabel.bold', def: false, type: 'checkbox'},
    { key: 'style.selector.stroke', def: '#3366CC', type: 'color'},
    { key: 'style.selector.strokeWidth', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.selector.strokeDasharray', def: 2, type: 'number', min: 0, max: 12 },
    { key: 'style.selector.borderRadius', def: 2, type: 'number', min: 0, max: 12},
    { key: 'style.title.textAlign', def: 'left', type: 'select', options: ['left', 'center', 'right']},
    { key: 'style.title.text', def: 'Lorem ipsum dolor sic amet', type: 'text'},
    { key: 'style.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.title.fontSize', def: 16, type: 'number', min: 8, max: 24},
    { key: 'style.title.bold', def: false, type: 'checkbox'},
    { key: 'style.title.margin', def: '0 0 6px 0', type: 'text'},
    { key: 'style.title.subtitle.color', def: '#A1A1A1', type: 'color'},
    { key: 'style.title.subtitle.text', def: 'Lorem ipsum dolor sic amet', type: 'text'},
    { key: 'style.title.subtitle.fontSize', def: 12, type: 'number', min: 8, max: 24},
    { key: 'style.title.subtitle.bold', def: false, type: 'checkbox'}
])

const config = computed(() => convertArrayToObject(model.value))

const step = ref(0)

function selectDatapoint(datapoint) {
    console.log({ datapoint })
}

</script>

<template>
    <Box>
        <template #title>VueUiSparkHistogram</template>

        <template #local>
            <LocalVueUiSparkHistogram :dataset="dataset" :config="config" :key="`local_${step}`" @selectDatapoint="selectDatapoint">
            </LocalVueUiSparkHistogram>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiSparkHistogram" :dataset="dataset" :config="config" :key="`VDUI-lodal_${step}`" @selectDatapoint="selectDatapoint">
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiSparkHistogram :dataset="dataset" :config="config" :key="`build_${step}`" @selectDatapoint="selectDatapoint">
            </VueUiSparkHistogram>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiSparkHistogram" :dataset="dataset" :config="config" :key="`VDUI-build_${step}`" @selectDatapoint="selectDatapoint">
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