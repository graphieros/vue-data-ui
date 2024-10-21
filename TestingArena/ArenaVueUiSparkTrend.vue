<script setup>
import { ref, computed } from "vue";
import LocalVueUiSparkTrend from '../src/components/vue-ui-spark-trend.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const datasets = ref({
    neutral: [10.33, 10.33, 10.33, 10.33, 10.33, 10.33, 10.33, 10.33],
    positive: [0, 1, 2, 3, 5, 8, 13,  21, 34, 55, 89, 144, 233.33],
    negative: [100, 95, 80, 60, 40, 20, 10, 9, 8, 7, 6, 5, 3, 1.33]
})

const model = ref([
    { key: 'style.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.fontFamily', def: 'inherit', type: 'text'},
    { key: 'style.animation.show', def: true, type: 'checkbox'},
    { key: 'style.animation.animationFrames', def: 20, type: 'number', min: 0, max: 200},
    { key: 'style.line.stroke', def: '#1A1A1A', type: 'color'},
    { key: 'style.line.strokeWidth', def: 2, type: 'number', min: 0, max: 24},
    { key: 'style.line.strokeLinecap', def: 'round', type: 'select', options: ['round', 'square', 'butt']},
    { key: 'style.line.strokeLinejoin', def: 'round', type: 'select', options: ['round', 'bevel', 'arcs', 'miter', 'miter-clip']},
    { key: 'style.line.smooth', def: true, type: 'checkbox'},
    { key: 'style.line.useColorTrend', def: true, type: 'checkbox'},
    { key: 'style.area.show', def: true, type: 'checkbox'},
    { key: 'style.area.useGradient', def: true, type: 'checkbox'},
    { key: 'style.area.opacity', def: 20, type: 'range', min: 0, max: 100},
    { key: 'style.dataLabel.show', def: true, type: 'checkbox'},
    { key: 'style.dataLabel.useColorTrend', def: true, type: 'checkbox'},
    { key: 'style.dataLabel.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.dataLabel.fontSize', def: 14, type: 'number', min: 8, max: 24},
    { key: 'style.dataLabel.bold', def: false, type: 'checkbox'},
    { key: 'style.dataLabel.prefix', def: 'P', type: 'text'},
    { key: 'style.dataLabel.suffix', def: 'S', type: 'text'},
    { key: 'style.dataLabel.rounding', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.trendLabel.trendType', def: 'n-1', type: 'select', options: ['n-1', 'global', 'lastToFirst']},
    { key: 'style.trendLabel.useColorTrend', def: true, type: 'checkbox'},
    { key: 'style.trendLabel.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.trendLabel.fontSize', def: 14, type: 'number', min: 8, max: 24},
    { key: 'style.trendLabel.bold', def: true, type: 'checkbox'},
    { key: 'style.trendLabel.rounding', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.arrow.colors.positive', def: '#2CA02C', type: 'color'},
    { key: 'style.arrow.colors.neutral', def: '#7F7F7F', type: 'color'},
    { key: 'style.arrow.colors.negative', def: '#D62728', type: 'color'},
    { key: 'style.padding.top', def: 12, type: 'number', min: 0, max: 100},
    { key: 'style.padding.left', def: 82, type: 'number', min: 0, max: 100},
    { key: 'style.padding.right', def: 12, type: 'number', min: 0, max: 100},
    { key: 'style.padding.bottom', def: 12, type: 'number', min: 0, max: 100},
])

const themeOptions = ref([
    "",
    "hack",
    "zen",
    "concrete",
    "default"
])

const currentTheme = ref(themeOptions.value[3])

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c,
        style: {
            ...c.style,
            dataLabel: {
                ...c.style.dataLabel,
                formatter: ({value, config}) => {
                    // console.log(config)
                    return `f - ${value}`
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
    <Box comp="VueUiSparkTrend" :dataset="datasets.positive">
        <template #title>VueUiSparkTrend</template>

        <template #local>
            <div style="width: 100%">
                <LocalVueUiSparkTrend :dataset="datasets.negative" :config="config" :key="`local0_${step}`"/>
                <LocalVueUiSparkTrend :dataset="datasets.neutral" :config="config" :key="`local1_${step}`"/>
                <LocalVueUiSparkTrend :dataset="datasets.positive" :config="config" :key="`local2_${step}`"/>
            </div>
        </template>

        <template #VDUI-local>
            <div style="width: 100%">
                <LocalVueDataUi component="VueUiSparkTrend" :dataset="datasets.negative" :config="config" :key="`VDUI-lodal0_${step}`"/>
                <LocalVueDataUi component="VueUiSparkTrend" :dataset="datasets.neutral" :config="config" :key="`VDUI-lodal1_${step}`"/>
                <LocalVueDataUi component="VueUiSparkTrend" :dataset="datasets.positive" :config="config" :key="`VDUI-lodal2_${step}`"/>
            </div>
        </template>

        <template #build>
            <div style="width: 100%">
                <VueUiSparkTrend :dataset="datasets.negative" :config="config" :key="`build0_${step}`"/>
                <VueUiSparkTrend :dataset="datasets.neutral" :config="config" :key="`build1_${step}`"/>
                <VueUiSparkTrend :dataset="datasets.positive" :config="config" :key="`build2_${step}`"/>
            </div>
        </template>

        <template #VDUI-build>
            <div style="width: 100%">
                <VueDataUi component="VueUiSparkTrend" :dataset="datasets.negative" :config="config" :key="`VDUI-build0_${step}`"/>
                <VueDataUi component="VueUiSparkTrend" :dataset="datasets.neutral" :config="config" :key="`VDUI-build1_${step}`"/>
                <VueDataUi component="VueUiSparkTrend" :dataset="datasets.positive" :config="config" :key="`VDUI-build2_${step}`"/>
            </div>
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