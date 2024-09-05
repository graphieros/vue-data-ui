<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useNestedProp } from "../useNestedProp";
import mainConfig from "../default_configs.json";
import { XMLNS, createUid, themePalettes, translateSize } from "../lib";
import { throttle } from "../canvas-lib";
import { useResponsive } from "../useResponsive";
import { Timer } from "../timer";
import BaseIcon from "../atoms/BaseIcon.vue";
import Title from "../atoms/Title.vue";

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    }
});

const emit = defineEmits(['start', 'pause', 'reset', 'restart', 'lap']);

const defaultConfig = ref(mainConfig.vue_ui_timer);
const timerChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const resizeObserver = ref(null);
const uid = ref(createUid());

onMounted(() => {
    if (timerConfig.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: timerChart.value,
                title: timerConfig.value.style.title.text ? chartTitle.value : null,
                legend: chartLegend.value
            });
            svg.value.width = width;
            svg.value.height = height;

            svg.value.tracker.core = translateSize({
                relator: Math.min(width, height),
                adjuster: timerConfig.value.style.width,
                source: 6 * timerConfig.value.stopwatch.tracker.radiusRatio,
                threshold: 1,
                fallback: 1
            });

            svg.value.tracker.aura = translateSize({
                relator: Math.min(width, height),
                adjuster: timerConfig.value.style.width,
                source: 12 * timerConfig.value.stopwatch.tracker.aura.radiusRatio,
                threshold: 1,
                fallback: 1
            });

            svg.value.label = translateSize({
                relator: Math.min(width, height),
                adjuster: timerConfig.value.style.width,
                source: timerConfig.value.stopwatch.label.fontSize,
                threshold: 10,
                fallback: 10
            });
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(timerChart.value.parentNode);
    }
});

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
});

const timerConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const placeholder = computed(() => {
    if (timerConfig.value.stopwatch.showHours && timerConfig.value.stopwatch.showHundredth) {
        return `00:00:00.00`;
    }
    if (timerConfig.value.stopwatch.showHours && !timerConfig.value.stopwatch.showHundredth) {
        return `00:00:00`;
    }
    if (!timerConfig.value.stopwatch.showHours && timerConfig.value.stopwatch.showHundredth) {
        return `00:00.00`
    }
    if (!timerConfig.value.stopwatch.showHours && !timerConfig.value.stopwatch.showHundredth) {
        return `00:00`
    } 
});

const svg = ref({
    height: timerConfig.value.style.height,
    width: timerConfig.value.style.width,
    tracker: {
        core: 6 * timerConfig.value.stopwatch.tracker.radiusRatio,
        aura: 12 * timerConfig.value.stopwatch.tracker.aura.radiusRatio
    },
    label: timerConfig.value.stopwatch.label.fontSize
});

const currentTime = ref(0);

const TIMER = new Timer(
    d => useTimer(d),
    10,
    '',
    timerConfig.value.stopwatch.showHundredth,
    timerConfig.value.stopwatch.showHours
);

const isLoaded = ref(true);
const isRunning = ref(false);
const isPaused = ref(false);

function start() {
    emit('start')
    isLoaded.value && TIMER.start();
    isLoaded.value = false;
    isRunning.value = true;
}

function reset() {
    if(!isRunning.value) return;
    emit('reset');
    TIMER.stop();
    laps.value = [];
    isLoaded.value = true;
    isRunning.value = false;
}

function pause() {
    isPaused.value = !isPaused.value;
    emit('pause', currentTime.value);
    TIMER.pause();
}

function restart() {
    if(!isRunning.value) return;
    emit('restart')
    laps.value = [];
    TIMER.restart();
}

const laps = ref([]);

function lap() {
    if (!isRunning.value || isPaused.value) return;
    laps.value.push(TIMER.lap());
    emit('lap', laps.value);
    return TIMER.lap()
}

function useTimer({ timestamp, elapsed, formatted }) {
    currentTime.value = { timestamp, elapsed, formatted};
}

const circleRadius = computed(() => {
    return (Math.min(svg.value.width, svg.value.height) / 2.5) * timerConfig.value.stopwatch.track.radiusRatio;
})

function calculateElapsedAngle(elapsedTime, cycleDurationInSeconds) {
    const cycleDurationInMilliseconds = cycleDurationInSeconds * 1000;
    const degreesPerMillisecond = 360 / cycleDurationInMilliseconds;
    const elapsedAngle = (elapsedTime * degreesPerMillisecond) % 360;
    return elapsedAngle;
}

function getCircleCoordinates(angleInDegrees) {
    let angleInRadians = angleInDegrees * (Math.PI / 180);
    let x = svg.value.width / 2 + circleRadius.value * Math.cos(angleInRadians);
    let y = svg.value.height / 2 + circleRadius.value * Math.sin(angleInRadians);
    return { cx: x, cy: y };
}

const tracker = computed(() => {
    const elapsedAngle = calculateElapsedAngle(currentTime.value.elapsed, timerConfig.value.stopwatch.cycleSeconds);
    const { cx, cy } = getCircleCoordinates(elapsedAngle - 90);
    const largeArcFlag = elapsedAngle > 180 ? 1 : 0;
    const sweepFlag = 1;

    return {
        cx: cx || svg.value.width / 2,
        cy: cy || svg.value.height / 2 - circleRadius.value,
        largeArcFlag,
        sweepFlag,
    };
});

defineExpose({
    start,
    pause,
    reset,
    restart,
    lap
});
</script>

<template>
    <div 
        ref="timerChart" 
        class="vue-ui-timer"
        :style="{
            fontFamily: timerConfig.style.fontFamily,
            width: '100%',
            height: timerConfig.responsive ? '100%' : 'auto',
            textAlign: 'center'
        }"
    >
        <div 
            ref="chartTitle" 
            v-if="timerConfig.style.title.text"
            :style="{
                width: '100%',
                background: timerConfig.style.backgroundColor,
            }" 
        >
            <Title
                :config="{
                    title: {
                        cy: 'title',
                        text: timerConfig.style.title.text,
                        color: timerConfig.style.title.color,
                        fontSize: timerConfig.style.title.fontSize,
                        bold: timerConfig.style.title.bold
                    },
                    subtitle: {
                        cy: 'subtitle',
                        text: timerConfig.style.title.subtitle.text,
                        color: timerConfig.style.title.subtitle.color,
                        fontSize: timerConfig.style.title.subtitle.fontSize,
                        bold: timerConfig.style.title.subtitle.bold
                    }
                }"
            />
        </div>

        <svg 
            :xmlns="XMLNS" 
            :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`"
            :style="{
                maxWidth: '100%',
                overflow: 'visible',
                background: timerConfig.style.backgroundColor
            }"
        >
            <!-- DEFS -->
            <defs v-if="timerConfig.stopwatch.tracker.gradient.show">
                <radialGradient :id="`tracker_gradient_${uid}`" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" :stop-color="timerConfig.stopwatch.tracker.gradient.color"/>
                    <stop offset="100%" :stop-color="timerConfig.stopwatch.tracker.fill" />
                </radialGradient>
            </defs>

            <!-- TRACK -->
            <circle 
                :cx="svg.width / 2" 
                :cy="svg.height / 2" 
                :r="circleRadius" 
                :fill="timerConfig.stopwatch.track.fill" 
                :stroke="timerConfig.stopwatch.track.stroke"
                :stroke-width="timerConfig.stopwatch.track.strokeWidth"
            />

            <!-- CYCLE TRACK -->
            <path 
                v-if="timerConfig.stopwatch.cycleTrack.show"
                :d="`M ${svg.width / 2},${svg.height / 2 - circleRadius} A ${circleRadius},${circleRadius} 0 ${tracker.largeArcFlag},${tracker.sweepFlag} ${tracker.cx},${tracker.cy}`" 
                :stroke="timerConfig.stopwatch.cycleTrack.stroke" 
                :stroke-width="timerConfig.stopwatch.cycleTrack.strokeWidth"
                stroke-linecap="round"
                fill="none"
            />

            <!-- TRACKER - CORE -->
            <circle 
                v-bind="tracker" 
                :r="svg.tracker.core" 
                :fill="timerConfig.stopwatch.tracker.gradient.show ? `url(#tracker_gradient_${uid})` : timerConfig.stopwatch.tracker.fill" 
                :stroke="timerConfig.stopwatch.tracker.stroke"
                :stroke-width="timerConfig.stopwatch.tracker.strokeWidth"
            />
            <!-- TRACKER - AURA -->
            <circle 
                v-if="timerConfig.stopwatch.tracker.aura.show"
                v-bind="tracker" 
                :r="svg.tracker.aura" 
                :fill="`${timerConfig.stopwatch.tracker.aura.fill}20`"
                :stroke="timerConfig.stopwatch.tracker.aura.stroke"
                :stroke-width="timerConfig.stopwatch.tracker.aura.strokeWidth"
            />

            <!-- TIME LABEL - CUSTOM -->
            <foreignObject v-if="$slots.time" :x="svg.width / 2" :y="svg.height / 2" height="0.1" width="0.1" style="overflow: visible">
                <slot name="time" v-bind="{ ...currentTime }"/>
            </foreignObject>
            
            <!-- TIME LABEL - DEFAULT -->
            <text v-else
                :x="svg.width / 2"
                :y="svg.height / 2 + (svg.label / 4)"
                :font-size="svg.label"
                text-anchor="middle"
                :fill="timerConfig.stopwatch.label.color"
                :font-weight="timerConfig.stopwatch.label.bold ? 'bold' : 'normal'"
                style="font-variant-numeric: tabular-nums !important;"
            >
                {{ currentTime.formatted || placeholder }}
            </text>
        </svg>

        <div ref="chartLegend" :style="{ width: '100%', backgroundColor: timerConfig.stopwatch.legend.backgroundColor }">
            <div v-if="!$slots.controls" class="vue-ui-timer-controls">
                <button
                    v-if="timerConfig.stopwatch.legend.buttons.start"
                    :title="timerConfig.stopwatch.legend.buttonTitles.start"
                    @click="start" 
                    class="vue-ui-timer-button" 
                    :style="{ 
                        opacity: isRunning ? 0.2 : 1, 
                        cursor: isRunning ? 'default' : 'pointer' 
                    }"
                >
                    <BaseIcon name="play" :stroke="timerConfig.stopwatch.legend.buttons.iconColor"/>
                </button>

                <button
                    v-if="timerConfig.stopwatch.legend.buttons.pause"
                    :title="isPaused ? timerConfig.stopwatch.legend.buttonTitles.resume : timerConfig.stopwatch.legend.buttonTitles.pause"
                    @click="pause" 
                    class="vue-ui-timer-button" 
                    :style="{
                        opacity: isRunning ? 1 : 0.2,
                        cursor: isRunning ? 'pointer' : 'default'
                    }"
                    >
                    <BaseIcon name="pause" :stroke="timerConfig.stopwatch.legend.buttons.iconColor"/>
                </button>
                
                <button
                    v-if="timerConfig.stopwatch.legend.buttons.reset"
                    :title="timerConfig.stopwatch.legend.buttonTitles.reset"
                    @click="reset" 
                    class="vue-ui-timer-button" 
                    :style="{ 
                        opacity: isRunning ? 1 : 0.2, 
                        cursor: isRunning ? 'pointer' : 'default' 
                    }"
                >
                    <BaseIcon name="stop" :stroke="timerConfig.stopwatch.legend.buttons.iconColor"/>
                </button>

                <button
                    v-if="timerConfig.stopwatch.legend.buttons.restart"
                    :title="timerConfig.stopwatch.legend.buttonTitles.restart"
                    @click="restart" 
                    class="vue-ui-timer-button" 
                    :style="{ 
                        opacity: isRunning ? 1 : 0.2, 
                        cursor: isRunning ? 'pointer' : 'default' 
                    }">
                    <BaseIcon name="restart" :stroke="timerConfig.stopwatch.legend.buttons.iconColor"/>
                </button>

                <button
                    v-if="timerConfig.stopwatch.legend.buttons.lap"
                    :title="timerConfig.stopwatch.legend.buttonTitles.lap"
                    @click="lap" 
                    class="vue-ui-timer-button" 
                    :style="{ 
                        opacity: isRunning && !isPaused ? 1 : 0.2, 
                        cursor: isRunning && !isPaused ? 'pointer' : 'default' 
                    }">
                    <BaseIcon name="lap" :stroke="timerConfig.stopwatch.legend.buttons.iconColor"/>
                </button>
            </div>
            <slot name="controls" v-bind="{ 
                start, 
                pause, 
                reset, 
                restart, 
                lap, 
                laps, 
                isRunning, 
                isPaused, 
                ...currentTime 
            }"/>
            <slot name="laps" v-bind="{ 
                laps, 
                lap, 
                isRunning, 
                isPaused, 
                ...currentTime 
            }"/>
        </div>
    </div>
</template>

<style scoped>
.vue-ui-timer-controls {
    display: flex;
    width: 100%;
    align-items:center;
    justify-content:center;
    flex-direction: row;
    gap: 2%;
}
.vue-ui-timer-button {
    display: flex;
    align-items:center;
    justify-content:center;
    background: inherit;
    border: none;
}
</style>