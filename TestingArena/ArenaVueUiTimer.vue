<script setup>
import { ref, computed, onMounted } from "vue";
import LocalVueUiTimer from '../src/components/vue-ui-timer.vue';
import LocalVueDataUi from '../src/components/vue-data-ui.vue';
import Box from "./Box.vue";
import convertArrayToObject from "./convertModel";
import { VueUiTimer } from "vue-data-ui";
import { VueUiTimer as VueUiTimerTreeshaken } from "vue-data-ui";
import ConfigKnobs from "./ConfigKnobs.vue";
import { useConfigurationControls } from "./createConfigModel";
import { useConfig } from "../src/useConfig"

const { vue_ui_timer: DEFAULT_CONFIG } = useConfig();

const {
    CHECKBOX,
    NUMBER,
    RANGE,
    TEXT,
    COLOR,
    SELECT,
    createModel
} = useConfigurationControls(DEFAULT_CONFIG);


const model = createModel([
    CHECKBOX("responsive", { def: false }),
    CHECKBOX("responsiveProportionalSizing", { def: false }),

    SELECT("type", ["stopwatch"], { def: "stopwatch" }),

    COLOR("style.backgroundColor", { def: "#FFFFFF" }),
    NUMBER("style.height", { def: 300, min: 100, max: 1000 }),
    NUMBER("style.width", { def: 300, min: 100, max: 1000 }),

    TEXT("style.title.text", { def: "Title" }),
    COLOR("style.title.color", { def: "#1A1A1A" }),
    NUMBER("style.title.fontSize", { def: 20, min: 8, max: 42 }),
    CHECKBOX("style.title.bold", { def: true }),

    TEXT("style.title.subtitle.text", { def: "Subtitle" }),
    COLOR("style.title.subtitle.color", { def: "#6A6A6A" }),
    NUMBER("style.title.subtitle.fontSize", { def: 16, min: 8, max: 42 }),
    CHECKBOX("style.title.subtitle.bold", { def: false }),

    CHECKBOX("stopwatch.showHours", { def: false }),
    CHECKBOX("stopwatch.showHundredth", { def: true }),
    NUMBER("stopwatch.cycleSeconds", { def: 5, min: 1, max: 60 }),

    RANGE("stopwatch.track.radiusRatio", { def: 1, min: 0.3, max: 1, step: 0.01 }),
    COLOR("stopwatch.track.stroke", { def: "#e1e5e8" }),
    COLOR("stopwatch.track.fill", { def: "#FFFFFF20" }),
    NUMBER("stopwatch.track.strokeWidth", { def: 2, min: 0, max: 24 }),

    RANGE("stopwatch.tracker.radiusRatio", { def: 1, min: 0.1, max: 2, step: 0.01 }),
    COLOR("stopwatch.tracker.stroke", { def: "#FFFFFF" }),
    NUMBER("stopwatch.tracker.strokeWidth", { def: 1, min: 0, max: 12 }),
    COLOR("stopwatch.tracker.fill", { def: "#6376DD" }),

    CHECKBOX("stopwatch.tracker.gradient.show", { def: true }),
    COLOR("stopwatch.tracker.gradient.color", { def: "#FFFFFF" }),

    CHECKBOX("stopwatch.tracker.aura.show", { def: true }),
    RANGE("stopwatch.tracker.aura.radiusRatio", { def: 1, min: 0, max: 10, step: 0.01 }),
    COLOR("stopwatch.tracker.aura.fill", { def: "#1A1A1A" }),
    COLOR("stopwatch.tracker.aura.stroke", { def: "#FFFFFF" }),
    NUMBER("stopwatch.tracker.aura.strokeWidth", { def: 0, min: 0, max: 12 }),

    CHECKBOX("stopwatch.cycleTrack.show", { def: true }),
    COLOR("stopwatch.cycleTrack.stroke", { def: "#1A1A1A" }),
    NUMBER("stopwatch.cycleTrack.strokeWidth", { def: 3, min: 0, max: 24 }),

    NUMBER("stopwatch.label.fontSize", { def: 24, min: 8, max: 42 }),
    COLOR("stopwatch.label.color", { def: "#1A1A1A" }),
    CHECKBOX("stopwatch.label.bold", { def: false }),

    COLOR("stopwatch.legend.backgroundColor", { def: "#FFFFFF" }),

    CHECKBOX("stopwatch.legend.buttons.start", { def: true }),
    CHECKBOX("stopwatch.legend.buttons.pause", { def: true }),
    CHECKBOX("stopwatch.legend.buttons.reset", { def: true }),
    CHECKBOX("stopwatch.legend.buttons.restart", { def: true }),
    CHECKBOX("stopwatch.legend.buttons.lap", { def: true }),

    COLOR("stopwatch.legend.buttons.iconColor", { def: "#1A1A1A" }),

    TEXT("stopwatch.legend.buttonTitles.start", { def: "START" }),
    TEXT("stopwatch.legend.buttonTitles.pause", { def: "PAUSE" }),
    TEXT("stopwatch.legend.buttonTitles.resume", { def: "RESUME" }),
    TEXT("stopwatch.legend.buttonTitles.reset", { def: "RESET" }),
    TEXT("stopwatch.legend.buttonTitles.restart", { def: "RESTART" }),
    TEXT("stopwatch.legend.buttonTitles.lap", { def: "LAP" })
]);


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

    <Box comp="VueUiTimer" :config="config">
        <template #title>VueUiTimer</template>

        <template #responsive>
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
        </template>

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

        <template #build-treesh>
            <VueUiTimerTreeshaken :config="config" :key="`build_${step}`">
                <template #laps="{ laps }">
                    <div v-for="l in laps">{{ l }}</div>
                </template>
            </VueUiTimerTreeshaken>
        </template>

        <template #VDUI-build>
            <VueDataUi component="VueUiTimer" :config="config" :key="`vdui_build_${step}`">
                <template #laps="{ laps }">
                    <div v-for="l in laps">{{ l }}</div>
                </template>
            </VueDataUi>
        </template>

        <template #knobs="{ summaryOpen }">
            <ConfigKnobs :model="model" @change="step += 1" :open="summaryOpen"/>
        </template>
    </Box>
</template>