<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiTimer from '../src/components/vue-ui-timer.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";

const model = ref([
    { key: 'responsive', def: false, type: 'checkbox'},
    { key: 'type', def: 'stopwatch', type: 'select', options: ['stopwatch']},
    { key: 'style.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'style.height', def: 300, type: 'number', min: 100, max: 1000},
    { key: 'style.width', def: 300, type: 'number', min: 100, max: 1000},
    { key: 'style.title.text', def: 'Title', type: 'text'},
    { key: 'style.title.color', def: '#1A1A1A', type: 'color'},
    { key: 'style.title.fontSize', def: 20, type: 'number', min: 8, max: 42 },
    { key: 'style.title.bold', def: true, type: 'checkbox'},
    { key: 'style.title.subtitle.text', def: 'Subtitle', type: 'text'},
    { key: 'style.title.subtitle.color', def: '#6A6A6A', type: 'color'},
    { key: 'style.title.subtitle.fontSize', def: 16, type: 'number', min: 8, max: 42},
    { key: 'style.title.subtitle.bold', def: false, type: 'checkbox'},
    { key: 'stopwatch.showHours', def: false, type: 'checkbox'},
    { key: 'stopwatch.showHundredth', def: true, type: 'checkbox'},
    { key: 'stopwatch.cycleSeconds', def: 5, type: 'number', min: 1, max: 60},
    { key: 'stopwatch.track.radiusRatio', def: 1, type: 'range', min: 0.3, max: 1, step: 0.01},
    { key: 'stopwatch.track.stroke', def: '#e1e5e8', type: "color"},
    { key: 'stopwatch.track.fill', def: '#FFFFFF20', type: "color"},
    { key: 'stopwatch.track.strokeWidth', def: 2, type: 'number', min: 0, max: 24 },
    { key: 'stopwatch.tracker.radiusRatio', def: 1, type: 'range', min: 0.1, max: 2, step: 0.01},
    { key: 'stopwatch.tracker.stroke', def: '#FFFFFF', type: 'color'},
    { key: 'stopwatch.tracker.strokeWidth', def: 1, type: 'number', min: 0, max: 12},
    { key: 'stopwatch.tracker.fill', def: '#6376DD', type: 'color'},
    { key: 'stopwatch.tracker.gradient.show', def: true, type: 'checkbox'},
    { key: 'stopwatch.tracker.gradient.color', def: '#FFFFFF', type: 'color'},
    { key: 'stopwatch.tracker.aura.show', def: true, type: 'checkbox'},
    { key: 'stopwatch.tracker.aura.radiusRatio', def: 1, type: 'range', min: 0, max: 10, step: 0.01},
    { key: 'stopwatch.tracker.aura.fill', def: '#1A1A1A', type: 'color'},
    { key: 'stopwatch.tracker.aura.stroke', def: '#FFFFFF', type: 'color'},
    { key: 'stopwatch.tracker.aura.strokeWidth', def: 0, type: 'number', min: 0, max: 12},
    { key: 'stopwatch.cycleTrack.show', def: true, type: 'checkbox'},
    { key: 'stopwatch.cycleTrack.stroke', def: '#1A1A1A', type: 'color'},
    { key: 'stopwatch.cycleTrack.strokeWidth', def: 3, type: 'number', min: 0, max: 24},
    { key: 'stopwatch.label.fontSize', def: 24, type: 'number', min: 8, max: 42},
    { key: 'stopwatch.label.color', def: '#1A1A1A', type: 'color'},
    { key: 'stopwatch.label.bold', def: false, type: 'checkbox'},
    { key: 'stopwatch.legend.backgroundColor', def: '#FFFFFF', type: 'color'},
    { key: 'stopwatch.legend.buttons.start', def: true, type: 'checkbox'},
    { key: 'stopwatch.legend.buttons.pause', def: true, type: 'checkbox'},
    { key: 'stopwatch.legend.buttons.reset', def: true, type: 'checkbox'},
    { key: 'stopwatch.legend.buttons.restart', def: true, type: 'checkbox'},
    { key: 'stopwatch.legend.buttons.lap', def: true, type: 'checkbox'},
    { key: 'stopwatch.legend.buttons.iconColor', def: '#1A1A1A', type: 'color'},
    { key: 'stopwatch.legend.buttonTitles.start', def: 'START', type: 'text'},
    { key: 'stopwatch.legend.buttonTitles.pause', def: 'PAUSE', type: 'text'},
    { key: 'stopwatch.legend.buttonTitles.resume', def: 'RESUME', type: 'text'},
    { key: 'stopwatch.legend.buttonTitles.reset', def: 'RESET', type: 'text'},
    { key: 'stopwatch.legend.buttonTitles.restart', def: 'RESTART', type: 'text'},
    { key: 'stopwatch.legend.buttonTitles.lap', def: 'LAP', type: 'text'},
])

const step = ref(0)

const config = computed(() => {
    const c = convertArrayToObject(model.value);
    return {
        ...c
    }
})

const local = ref(null)

const localActions = computed(() => {
    return {
        start: local.value.start,
        pause: local.value.pause,
        reset: local.value.reset,
        restart: local.value.restart,
        lap: local.value.lap
    }
})

</script>

<template>
    <div style="padding: 12px 0">
        <span style="color: white; margin-right: 12px">Exposed methods:</span>
        <button @click="localActions.start">START</button>
        <button @click="localActions.pause">PAUSE</button>
        <button @click="localActions.reset">RESET</button>
        <button @click="localActions.restart">RESTART</button>
        <button @click="localActions.lap">LAP</button>
    </div>
    <div style="width: 600px; height: 600px; resize: both; overflow: auto; background: white">
            <LocalVueUiTimer ref="local" :key="`responsive_${step}`" :config="{
                ...config,
                responsive: true
            }"> 
            <!-- <template #controls="{ start, pause, reset }">
                <button @click="start">START</button>
                <button @click="pause">PAUSE</button>
                <button @click="reset">RESET</button>
            </template> -->
        </LocalVueUiTimer>
    </div>

    <Box comp="VueUiTimer">
        <template #title>VueUiTimer</template>

        <template #local>
            <LocalVueUiTimer :config="config" :key="`local_${step}`">
                <template #chart-background>
                    <div style="width: 100%; height: 100%; background: radial-gradient(at top left, red, white)"/>
                </template>

                <template #laps="{ laps }">
                    <div v-for="l in laps">{{ l }}</div>
                </template>
            </LocalVueUiTimer>
        </template>

        <template #VDUI-local>
            <LocalVueDataUi component="VueUiTimer" :config="config" :key="`vdui_local_${step}`">
                <template #laps="{ laps }">
                    <div v-for="l in laps">{{ l }}</div>
                </template>
            </LocalVueDataUi>
        </template>

        <template #build>
            <VueUiTimer :config="config" :key="`build_${step}`">
                <template #laps="{ laps }">
                    <div v-for="l in laps">{{ l }}</div>
                </template>
            </VueUiTimer>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiTimer" :config="config" :key="`vdui_build_${step}`">
                <template #laps="{ laps }">
                    <div v-for="l in laps">{{ l }}</div>
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