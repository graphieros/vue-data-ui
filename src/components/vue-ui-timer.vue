<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, defineAsyncComponent, shallowRef } from "vue";
import { useNestedProp } from "../useNestedProp";
import { XMLNS, createUid, translateSize } from "../lib";
import { throttle } from "../canvas-lib";
import { useResponsive } from "../useResponsive";
import { Timer } from "../timer";
import { useConfig } from "../useConfig";
import { useChartAccessibility } from "../useChartAccessibility";
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import BaseIcon from "../atoms/BaseIcon.vue"; // Must be ready in responsive mode

const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));

const { vue_ui_timer: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    }
});

const emit = defineEmits(['start', 'pause', 'reset', 'restart', 'lap']);

const timerChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);
const uid = ref(createUid());
const titleStep = ref(0);

onMounted(() => {
    prepareChart();
});

function prepareChart() {
    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: timerChart.value,
                title: FINAL_CONFIG.value.style.title.text ? chartTitle.value : null,
                legend: chartLegend.value
            });

            requestAnimationFrame(() => {
                svg.value.width = width;
                svg.value.height = height;

                if (FINAL_CONFIG.value.responsiveProportionalSizing) {
                    svg.value.tracker.core = translateSize({
                        relator: Math.min(width, height),
                        adjuster: FINAL_CONFIG.value.style.width,
                        source: 6 * FINAL_CONFIG.value.stopwatch.tracker.radiusRatio,
                        threshold: 1,
                        fallback: 1
                    });
        
                    svg.value.tracker.aura = translateSize({
                        relator: Math.min(width, height),
                        adjuster: FINAL_CONFIG.value.style.width,
                        source: 12 * FINAL_CONFIG.value.stopwatch.tracker.aura.radiusRatio,
                        threshold: 1,
                        fallback: 1
                    });
        
                    svg.value.label = translateSize({
                        relator: Math.min(width, height),
                        adjuster: FINAL_CONFIG.value.style.width,
                        source: FINAL_CONFIG.value.stopwatch.label.fontSize,
                        threshold: 10,
                        fallback: 10
                    });
                } else {
                    svg.value.label = FINAL_CONFIG.value.stopwatch.label.fontSize;
                }
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = timerChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }
}

onBeforeUnmount(() => {
    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }
});

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.title });

function prepareConfig() {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    prepareChart();
    titleStep.value += 1;
}, { deep: true });

const placeholder = computed(() => {
    if (FINAL_CONFIG.value.stopwatch.showHours && FINAL_CONFIG.value.stopwatch.showHundredth) {
        return `00:00:00.00`;
    }
    if (FINAL_CONFIG.value.stopwatch.showHours && !FINAL_CONFIG.value.stopwatch.showHundredth) {
        return `00:00:00`;
    }
    if (!FINAL_CONFIG.value.stopwatch.showHours && FINAL_CONFIG.value.stopwatch.showHundredth) {
        return `00:00.00`
    }
    if (!FINAL_CONFIG.value.stopwatch.showHours && !FINAL_CONFIG.value.stopwatch.showHundredth) {
        return `00:00`
    } 
});

const svg = ref({
    height: FINAL_CONFIG.value.style.height,
    width: FINAL_CONFIG.value.style.width,
    tracker: {
        core: 6 * FINAL_CONFIG.value.stopwatch.tracker.radiusRatio,
        aura: 12 * FINAL_CONFIG.value.stopwatch.tracker.aura.radiusRatio
    },
    label: FINAL_CONFIG.value.stopwatch.label.fontSize
});

const currentTime = ref(0);

const TIMER = new Timer(
    d => useTimer(d),
    10,
    '',
    FINAL_CONFIG.value.stopwatch.showHundredth,
    FINAL_CONFIG.value.stopwatch.showHours
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
    isPaused.value = false;
    emit('restart')
    laps.value = [];
    TIMER.restart();
}

const laps = ref([]);

async function lap() {
    if (!isRunning.value || isPaused.value) return;
    const lapData = await TIMER.lap();
    if (lapData) {
        laps.value.push(lapData);
        emit('lap', laps.value);
    }
}

function useTimer({ timestamp, elapsed, formatted }) {
    currentTime.value = { timestamp, elapsed, formatted};
}

const circleRadius = computed(() => {
    return (Math.min(svg.value.width, svg.value.height) / 2.5) * FINAL_CONFIG.value.stopwatch.track.radiusRatio;
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
    const elapsedAngle = calculateElapsedAngle(currentTime.value.elapsed, FINAL_CONFIG.value.stopwatch.cycleSeconds);
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
            fontFamily: FINAL_CONFIG.style.fontFamily,
            width: '100%',
            height: FINAL_CONFIG.responsive ? '100%' : 'auto',
            textAlign: 'center'
        }"
    >
        <div 
            ref="chartTitle" 
            v-if="FINAL_CONFIG.style.title.text"
            :style="{
                width: '100%',
                background: FINAL_CONFIG.style.backgroundColor,
            }" 
        >
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'title',
                        ...FINAL_CONFIG.style.title
                    },
                    subtitle: {
                        cy: 'subtitle',
                        ...FINAL_CONFIG.style.title.subtitle
                    }
                }"
            />
        </div>

        <svg
            ref="svgRef"
            :xmlns="XMLNS" 
            :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`"
            :style="{
                maxWidth: '100%',
                overflow: 'visible',
                background: FINAL_CONFIG.style.backgroundColor
            }"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="0"
                :y="0"
                :width="svg.width <= 0 ? 10 : svg.width"
                :height="svg.height <= 0 ? 10 : svg.height"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>
            
            <!-- DEFS -->
            <defs v-if="FINAL_CONFIG.stopwatch.tracker.gradient.show">
                <radialGradient :id="`tracker_gradient_${uid}`" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                    <stop offset="0%" :stop-color="FINAL_CONFIG.stopwatch.tracker.gradient.color"/>
                    <stop offset="100%" :stop-color="FINAL_CONFIG.stopwatch.tracker.fill" />
                </radialGradient>
            </defs>

            <!-- TRACK -->
            <circle 
                :cx="svg.width / 2" 
                :cy="svg.height / 2" 
                :r="circleRadius" 
                :fill="FINAL_CONFIG.stopwatch.track.fill" 
                :stroke="FINAL_CONFIG.stopwatch.track.stroke"
                :stroke-width="FINAL_CONFIG.stopwatch.track.strokeWidth"
            />

            <!-- CYCLE TRACK -->
            <path 
                v-if="FINAL_CONFIG.stopwatch.cycleTrack.show"
                :d="`M ${svg.width / 2},${svg.height / 2 - circleRadius} A ${circleRadius},${circleRadius} 0 ${tracker.largeArcFlag},${tracker.sweepFlag} ${tracker.cx},${tracker.cy}`" 
                :stroke="FINAL_CONFIG.stopwatch.cycleTrack.stroke" 
                :stroke-width="FINAL_CONFIG.stopwatch.cycleTrack.strokeWidth"
                stroke-linecap="round"
                fill="none"
            />

            <!-- TRACKER - CORE -->
            <circle 
                v-bind="tracker" 
                :r="svg.tracker.core" 
                :fill="FINAL_CONFIG.stopwatch.tracker.gradient.show ? `url(#tracker_gradient_${uid})` : FINAL_CONFIG.stopwatch.tracker.fill" 
                :stroke="FINAL_CONFIG.stopwatch.tracker.stroke"
                :stroke-width="FINAL_CONFIG.stopwatch.tracker.strokeWidth"
            />
            <!-- TRACKER - AURA -->
            <circle 
                v-if="FINAL_CONFIG.stopwatch.tracker.aura.show"
                v-bind="tracker" 
                :r="svg.tracker.aura" 
                :fill="`${FINAL_CONFIG.stopwatch.tracker.aura.fill}20`"
                :stroke="FINAL_CONFIG.stopwatch.tracker.aura.stroke"
                :stroke-width="FINAL_CONFIG.stopwatch.tracker.aura.strokeWidth"
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
                :fill="FINAL_CONFIG.stopwatch.label.color"
                :font-weight="FINAL_CONFIG.stopwatch.label.bold ? 'bold' : 'normal'"
                style="font-variant-numeric: tabular-nums !important;"
            >
                {{ currentTime.formatted || placeholder }}
            </text>
        </svg>

        <div ref="chartLegend" :style="{ width: '100%', backgroundColor: FINAL_CONFIG.stopwatch.legend.backgroundColor }">
            <div v-if="!$slots.controls" class="vue-ui-timer-controls">
                <button
                    v-if="FINAL_CONFIG.stopwatch.legend.buttons.start"
                    :title="FINAL_CONFIG.stopwatch.legend.buttonTitles.start"
                    @click="start" 
                    class="vue-ui-timer-button" 
                    :style="{ 
                        opacity: isRunning ? 0.2 : 1, 
                        cursor: isRunning ? 'default' : 'pointer' 
                    }"
                >
                    <BaseIcon name="play" :stroke="FINAL_CONFIG.stopwatch.legend.buttons.iconColor"/>
                </button>

                <button
                    v-if="FINAL_CONFIG.stopwatch.legend.buttons.pause"
                    :title="isPaused ? FINAL_CONFIG.stopwatch.legend.buttonTitles.resume : FINAL_CONFIG.stopwatch.legend.buttonTitles.pause"
                    @click="pause" 
                    class="vue-ui-timer-button" 
                    :style="{
                        opacity: isRunning ? 1 : 0.2,
                        cursor: isRunning ? 'pointer' : 'default'
                    }"
                    >
                    <BaseIcon name="pause" :stroke="FINAL_CONFIG.stopwatch.legend.buttons.iconColor"/>
                </button>
                
                <button
                    v-if="FINAL_CONFIG.stopwatch.legend.buttons.reset"
                    :title="FINAL_CONFIG.stopwatch.legend.buttonTitles.reset"
                    @click="reset" 
                    class="vue-ui-timer-button" 
                    :style="{ 
                        opacity: isRunning ? 1 : 0.2, 
                        cursor: isRunning ? 'pointer' : 'default' 
                    }"
                >
                    <BaseIcon name="stop" :stroke="FINAL_CONFIG.stopwatch.legend.buttons.iconColor"/>
                </button>

                <button
                    v-if="FINAL_CONFIG.stopwatch.legend.buttons.restart"
                    :title="FINAL_CONFIG.stopwatch.legend.buttonTitles.restart"
                    @click="restart" 
                    class="vue-ui-timer-button" 
                    :style="{ 
                        opacity: isRunning ? 1 : 0.2, 
                        cursor: isRunning ? 'pointer' : 'default' 
                    }">
                    <BaseIcon name="restart" :stroke="FINAL_CONFIG.stopwatch.legend.buttons.iconColor"/>
                </button>

                <button
                    v-if="FINAL_CONFIG.stopwatch.legend.buttons.lap"
                    :title="FINAL_CONFIG.stopwatch.legend.buttonTitles.lap"
                    @click="lap" 
                    class="vue-ui-timer-button" 
                    :style="{ 
                        opacity: isRunning && !isPaused ? 1 : 0.2, 
                        cursor: isRunning && !isPaused ? 'pointer' : 'default' 
                    }">
                    <BaseIcon name="lap" :stroke="FINAL_CONFIG.stopwatch.legend.buttons.iconColor"/>
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