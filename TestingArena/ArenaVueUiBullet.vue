<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiBullet from '../src/components/vue-ui-bullet.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { useArena } from "../src/useArena";

import { VueUiBullet } from "vue-data-ui";
import { VueUiBullet as VueUiBulletTreeshaken } from "vue-data-ui/vue-ui-bullet";

const { local, build, vduiLocal, vduiBuild } = useArena()

const dataset = ref(undefined);

onMounted(() => {
    setTimeout(() => {
        dataset.value = {
            value: -20,
            target: -10,
            segments: [
                {
                    name: 'Low',
                    from: -100,
                    to: -30,
                    // color: '#4A4A4A'
                },
                {
                    name: 'Medium',
                    from: -30,
                    to: 0,
                    // color: '#6A6A6A'
                },
                {
                    name: 'High',
                    from: 0,
                    to: 100,
                    // color: '#8A8A8A'
                }
            ]
        }
    }, 2000)
})

function randomizeData(){
    dataset.value.value = Math.random() * 100
}

const model = ref([
    { key: 'userOptions.debug', def: true, type: 'checkbox' },
    { key: 'userOptions.loading', def: false, type: 'checkbox' },
    { key: 'userOptions.show', def: true, type: 'checkbox' },
    { key: 'userOptions.buttons.pdf', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.img', def: true, type: 'checkbox'},
    { key: 'userOptions.buttons.fullscreen', def: true, type: 'checkbox'},
    { key: 'userOptions.buttonTitles.pdf', def: 'PDF', type: 'text'},
    { key: 'userOptions.buttonTitles.img', def: 'IMG', type: 'text'},
    { key: 'userOptions.buttonTitles.fullscreen', def: 'FSC', type: 'text'},
    { key: 'userOptions.showOnChartHover', def: true, type: 'checkbox'},
    { key: 'userOptions.keepStateOnChartLeave', def: true, type: 'checkbox'},

    { key: 'userOptions.print.scale', def: 2, type: 'number', min: 1, max: 5},
    { key: 'userOptions.print.allowTaint', def: true, type: 'checkbox'},
    { key: 'userOptions.print.useCORS', def: true, type: 'checkbox'},
    { key: 'userOptions.print.backgroundColor', def: '#FFFFFF' },

    { key: 'style.chart.backgroundColor', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.height', def: 96, type: 'range', min: 64, max: 120 },
    { key: 'style.chart.width', def: 600, type: 'range', min: 400, max: 1000 },

    { key: 'style.chart.padding.top', def: 24, type: 'number', min: 0, max: 64 },
    { key: 'style.chart.padding.right', def: 24, type: 'number', min: 0, max: 64 },
    { key: 'style.chart.padding.bottom', def: 24, type: 'number', min: 0, max: 64 },
    { key: 'style.chart.padding.left', def: 12, type: 'number', min: 0, max: 64 },

    { key: 'style.chart.animation.show', def: true, type: 'checkbox' },
    { key: 'style.chart.animation.animationFrames', def: 60, type:'range', min: 30, max: 255 },

    { key: 'style.chart.legend.position', def: 'bottom', type: 'select', options: ['top', 'bottom']},

    { key: 'style.chart.segments.baseColor', def: '#9A9A9A', type: 'color' },
    { key: 'style.chart.segments.dataLabels.show', def: true, type: 'checkbox' },
    { key: 'style.chart.segments.dataLabels.color', def: '#1A1A1A', type: 'color' },
    { key: 'style.chart.segments.dataLabels.fontSize', def: 10, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.segments.dataLabels.bold', def: false, type: 'checkbox' },
    { key: 'style.chart.segments.dataLabels.prefix', def: '', type: 'text'},
    { key: 'style.chart.segments.dataLabels.suffix', def: '', type: 'text'},
    { key: 'style.chart.segments.dataLabels.offsetY', def: 0, type: 'number', min: -50, max: 50},
    { key: 'style.chart.segments.ticks.show', def: true, type: 'checkbox'},
    { key: 'style.chart.segments.ticks.divisions', def: 10, type: 'number', min: 2, max: 20},
    { key: 'style.chart.segments.ticks.stroke', def: '#8A8A8A', type: 'color'},

    { key: 'style.chart.target.onTop', def: true, type: 'checkbox' },
    { key: 'style.chart.target.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.target.rounded', def: true, type: 'checkbox'},
    { key: 'style.chart.target.heightRatio', def: 0.8, type: 'range', min: 0.2, max: 1, step: 0.01},
    { key: 'style.chart.target.stroke', def: '#FFFFFF', type: 'color'},
    { key: 'style.chart.target.strokeWidth', def: 1, type: 'number', min: 0, max: 6},
    { key: 'style.chart.target.width', def: 6, type: 'number', min: 1, max: 12},

    { key: 'style.chart.valueBar.color', def: '#3A3A3A', type: 'color' },
    { key: 'style.chart.valueBar.heightRatio', def: 0.33, type: 'range', min: 0.2, max: 1, step: 0.01 },
    { key: 'style.chart.valueBar.stroke', def: '#FFFFFF', type: 'color' },
    { key: 'style.chart.valueBar.strokeWidth', def: 1, type: 'number', min: 0, max: 12},
    { key: 'style.chart.valueBar.label.show', def: true, type: 'checkbox'},
    { key: 'style.chart.valueBar.label.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.valueBar.label.fontSize', def: 14, type: 'number', min: 8, max: 42},
    { key: 'style.chart.valueBar.label.bold', def: true, type: 'checkbox'},
    { key: 'style.chart.valueBar.label.offsetY', def: 0, type: 'number', min: -50, max: 50},

    { key: 'style.chart.title.text', def: 'This is a title', type: 'text'},
    { key: 'style.chart.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.chart.title.fontSize', def: 20, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.title.bold', def: true, type: 'checkbox' },
    { key: 'style.chart.title.subtitle.text', def: 'This is a subtitle', type: 'text'},
    { key: 'style.chart.title.subtitle.color', def: '#8A8A8A', type: 'color'},
    { key: 'style.chart.title.subtitle.fontSize', def: 14, type: 'number', min: 8, max: 42 },
    { key: 'style.chart.title.subtitle.bold', def: false, type: 'checkbox' },
]);

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
        theme: currentTheme.value,
    }
})

onMounted(async () => {
    if (local.value) {
        const img = await local.value.getImage()
        console.log(img)
    }
})

</script>

<template>
    <button @click="randomizeData">RANDOM DATA</button>
    <div style="margin: 12px 0; color: white">
        Theme:
        <select v-model="currentTheme">
            <option v-for="opt in themeOptions">{{ opt }}</option>
        </select>
    </div>

    <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
        <LocalVueUiBullet :dataset="dataset" :config="{
            ...config,
            responsive: true
        }" ref="local"/>
    </div>

    <Box>
        <template #title>VueUiBullet</template>

        <template #theme>
            <LocalVueUiBullet :dataset="dataset" :config="configTheme" />
        </template>

        <template #local>
            <LocalVueUiBullet :dataset="dataset" :config="config" ref="local">
                <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template>
                <template #source>
                    <div style="width:100%;font-size:10px;text-align:left">
                        SOURCE: Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur, molestiae perspiciatis nam quae libero, deserunt in aperiam unde officia sint saepe laboriosam ducimus aspernatur labore! Sapiente aspernatur corrupti quis ad.
                    </div>
                </template>
            </LocalVueUiBullet>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiBullet" :dataset="dataset" :config="config" ref="localVdui"/>
        </template>

        <template #build>
            <VueUiBullet :dataset="dataset" :config="config" ref="build"/>
        </template>

        <template #build-treesh>
            <VueUiBulletTreeshaken :dataset="dataset" :config="config" ref="build"/>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiBullet" :dataset="dataset" :config="config" ref="buildVdui"/>
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