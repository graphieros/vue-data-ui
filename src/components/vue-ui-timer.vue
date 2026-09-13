<script setup>
import {
    ref,
    computed,
    onMounted,
    onBeforeUnmount,
    watch,
    defineAsyncComponent,
    shallowRef,
} from 'vue';
import { useNestedProp } from '../useNestedProp';
import { XMLNS, createUid, translateSize } from '../lib';
import { throttle } from '../canvas-lib';
import { useResponsive } from '../useResponsive';
import { Timer } from '../timer';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { useChartAccessibility } from '../useChartAccessibility';
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import BaseIcon from '../atoms/BaseIcon.vue'; // Must be ready in responsive mode
import DefGrad from '../atoms/DefGrad.vue';

const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);

const { vue_ui_timer: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        },
    },
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
                title: FINAL_CONFIG.value.style.title.text
                    ? chartTitle.value
                    : null,
                legend: chartLegend.value,
            });

            requestAnimationFrame(() => {
                svg.value.width = width;
                svg.value.height = height;

                if (FINAL_CONFIG.value.responsiveProportionalSizing) {
                    svg.value.tracker.core = translateSize({
                        relator: Math.min(width, height),
                        adjuster: FINAL_CONFIG.value.style.width,
                        source: 6 * cfgTracker.value.radiusRatio,
                        threshold: 1,
                        fallback: 1,
                    });

                    svg.value.tracker.aura = translateSize({
                        relator: Math.min(width, height),
                        adjuster: FINAL_CONFIG.value.style.width,
                        source: 12 * cfgTracker.value.aura.radiusRatio,
                        threshold: 1,
                        fallback: 1,
                    });

                    svg.value.label = translateSize({
                        relator: Math.min(width, height),
                        adjuster: FINAL_CONFIG.value.style.width,
                        source: cfgSW.value.label.fontSize,
                        threshold: 10,
                        fallback: 10,
                    });
                } else {
                    svg.value.label = cfgSW.value.label.fontSize;
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
        return newCfg;
    },
});

const cfgSW = computed(() => FINAL_CONFIG.value.stopwatch);
const cfgTracker = computed(() => FINAL_CONFIG.value.stopwatch.tracker);
const cfgLegend = computed(() => FINAL_CONFIG.value.stopwatch.legend);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => [], // no dataset for this component
    component: 'VueUiTimer',
    rules: [COMMON_RULES.noHint],
});

const isCursorPointer = computed(() => FINAL_CONFIG.value.useCursorPointer);

const { svgRef } = useChartAccessibility({
    config: FINAL_CONFIG.value.style.title,
});

function prepareConfig() {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG,
    });
}

watch(
    () => props.config,
    (_newCfg) => {
        FINAL_CONFIG.value = prepareConfig();
        prepareChart();
        titleStep.value += 1;
    },
    { deep: true },
);

const placeholder = computed(() => {
    if (cfgSW.value.showHours && cfgSW.value.showHundredth) {
        return `00:00:00.00`;
    }
    if (cfgSW.value.showHours && !cfgSW.value.showHundredth) {
        return `00:00:00`;
    }
    if (!cfgSW.value.showHours && cfgSW.value.showHundredth) {
        return `00:00.00`;
    }
    if (!cfgSW.value.showHours && !cfgSW.value.showHundredth) {
        return `00:00`;
    }
});

const svg = ref({
    height: FINAL_CONFIG.value.style.height,
    width: FINAL_CONFIG.value.style.width,
    tracker: {
        core: 6 * cfgTracker.value.radiusRatio,
        aura: 12 * cfgTracker.value.aura.radiusRatio,
    },
    label: cfgSW.value.label.fontSize,
});

const currentTime = ref(0);

const TIMER = new Timer(
    (d) => useTimer(d),
    10,
    '',
    cfgSW.value.showHundredth,
    cfgSW.value.showHours,
);

const isLoaded = ref(true);
const isRunning = ref(false);
const isPaused = ref(false);

function start() {
    emit('start');
    isLoaded.value && TIMER.start();
    isLoaded.value = false;
    isRunning.value = true;
}

function reset() {
    if (!isRunning.value) return;
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
    if (!isRunning.value) return;
    isPaused.value = false;
    emit('restart');
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
    currentTime.value = { timestamp, elapsed, formatted };
}

const circleRadius = computed(() => {
    return (
        (Math.min(svg.value.width, svg.value.height) / 2.5) *
        cfgSW.value.track.radiusRatio
    );
});

function calculateElapsedAngle(elapsedTime, cycleDurationInSeconds) {
    const cycleDurationInMilliseconds = cycleDurationInSeconds * 1000;
    const degreesPerMillisecond = 360 / cycleDurationInMilliseconds;
    const elapsedAngle = (elapsedTime * degreesPerMillisecond) % 360;
    return elapsedAngle;
}

function getCircleCoordinates(angleInDegrees) {
    let angleInRadians = angleInDegrees * (Math.PI / 180);
    let x = svg.value.width / 2 + circleRadius.value * Math.cos(angleInRadians);
    let y =
        svg.value.height / 2 + circleRadius.value * Math.sin(angleInRadians);
    return { cx: x, cy: y };
}

const tracker = computed(() => {
    const elapsedAngle = calculateElapsedAngle(
        currentTime.value.elapsed,
        cfgSW.value.cycleSeconds,
    );
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
    lap,
});
</script>

<template>
    <div
        ref="timerChart"
        class="vue-data-ui-component vue-ui-timer"
        :style="{
            fontFamily: FINAL_CONFIG.style.fontFamily,
            width: '100%',
            height: FINAL_CONFIG.responsive ? '100%' : 'auto',
            textAlign: 'center',
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
                        ...FINAL_CONFIG.style.title,
                    },
                    subtitle: {
                        cy: 'subtitle',
                        ...FINAL_CONFIG.style.title.subtitle,
                    },
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
                background: FINAL_CONFIG.style.backgroundColor,
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
                    pointerEvents: 'none',
                }"
            >
                <slot name="chart-background" />
            </foreignObject>

            <!-- DEFS -->
            <defs v-if="cfgTracker.gradient.show">
                <DefGrad
                    t="radial"
                    :id="`tracker_gradient_${uid}`"
                    cx="50%"
                    cy="50%"
                    r="50%"
                    fx="50%"
                    fy="50%"
                    :stops="[
                        ['0%', cfgTracker.gradient.color, 1],
                        ['100%', cfgTracker.fill, 1],
                    ]"
                />
            </defs>

            <!-- TRACK -->
            <circle
                :cx="svg.width / 2"
                :cy="svg.height / 2"
                :r="circleRadius"
                :fill="cfgSW.track.fill"
                :stroke="cfgSW.track.stroke"
                :stroke-width="cfgSW.track.strokeWidth"
            />

            <!-- CYCLE TRACK -->
            <path
                v-if="cfgSW.cycleTrack.show"
                :d="`M ${svg.width / 2},${svg.height / 2 - circleRadius} A ${circleRadius},${circleRadius} 0 ${tracker.largeArcFlag},${tracker.sweepFlag} ${tracker.cx},${tracker.cy}`"
                :stroke="cfgSW.cycleTrack.stroke"
                :stroke-width="cfgSW.cycleTrack.strokeWidth"
                stroke-linecap="round"
                fill="none"
            />

            <!-- TRACKER - CORE -->
            <circle
                v-bind="tracker"
                :r="svg.tracker.core"
                :fill="
                    cfgTracker.gradient.show
                        ? `url(#tracker_gradient_${uid})`
                        : cfgTracker.fill
                "
                :stroke="cfgTracker.stroke"
                :stroke-width="cfgTracker.strokeWidth"
            />
            <!-- TRACKER - AURA -->
            <circle
                v-if="cfgTracker.aura.show"
                v-bind="tracker"
                :r="svg.tracker.aura"
                :fill="`${cfgTracker.aura.fill}20`"
                :stroke="cfgTracker.aura.stroke"
                :stroke-width="cfgTracker.aura.strokeWidth"
            />

            <!-- TIME LABEL - CUSTOM -->
            <foreignObject
                v-if="$slots.time"
                :x="svg.width / 2"
                :y="svg.height / 2"
                height="0.1"
                width="0.1"
                style="overflow: visible"
            >
                <slot name="time" v-bind="{ ...currentTime, ...svg }" />
            </foreignObject>

            <g v-else-if="$slots.timeSvg">
                <slot name="timeSvg" v-bind="{ ...currentTime, ...svg }" />
            </g>

            <!-- TIME LABEL - DEFAULT -->
            <text
                v-else
                :x="svg.width / 2"
                :y="svg.height / 2 + svg.label / 4"
                :font-size="svg.label"
                text-anchor="middle"
                :fill="cfgSW.label.color"
                :font-weight="cfgSW.label.bold ? 'bold' : 'normal'"
                style="font-variant-numeric: tabular-nums !important"
            >
                {{ currentTime.formatted || placeholder }}
            </text>
        </svg>

        <div
            ref="chartLegend"
            :style="{
                width: '100%',
                backgroundColor: cfgLegend.backgroundColor,
            }"
        >
            <div v-if="!$slots.controls" class="vue-ui-timer-controls">
                <button
                    v-if="cfgLegend.buttons.start"
                    :title="cfgLegend.buttonTitles.start"
                    @click="start"
                    class="vue-ui-timer-button"
                    :style="{
                        opacity: isRunning ? 0.2 : 1,
                        cursor: isRunning
                            ? 'default'
                            : isCursorPointer
                              ? 'pointer'
                              : 'default',
                    }"
                >
                    <BaseIcon
                        name="play"
                        :stroke="cfgLegend.buttons.iconColor"
                    />
                </button>

                <button
                    v-if="cfgLegend.buttons.pause"
                    :title="
                        isPaused
                            ? cfgLegend.buttonTitles.resume
                            : cfgLegend.buttonTitles.pause
                    "
                    @click="pause"
                    class="vue-ui-timer-button"
                    :style="{
                        opacity: isRunning ? 1 : 0.2,
                        cursor: isRunning
                            ? isCursorPointer
                                ? 'pointer'
                                : 'default'
                            : 'default',
                    }"
                >
                    <BaseIcon
                        name="pause"
                        :stroke="cfgLegend.buttons.iconColor"
                    />
                </button>

                <button
                    v-if="cfgLegend.buttons.reset"
                    :title="cfgLegend.buttonTitles.reset"
                    @click="reset"
                    class="vue-ui-timer-button"
                    :style="{
                        opacity: isRunning ? 1 : 0.2,
                        cursor: isRunning
                            ? isCursorPointer
                                ? 'pointer'
                                : 'default'
                            : 'default',
                    }"
                >
                    <BaseIcon
                        name="stop"
                        :stroke="cfgLegend.buttons.iconColor"
                    />
                </button>

                <button
                    v-if="cfgLegend.buttons.restart"
                    :title="cfgLegend.buttonTitles.restart"
                    @click="restart"
                    class="vue-ui-timer-button"
                    :style="{
                        opacity: isRunning ? 1 : 0.2,
                        cursor: isRunning
                            ? isCursorPointer
                                ? 'pointer'
                                : 'default'
                            : 'default',
                    }"
                >
                    <BaseIcon
                        name="restart"
                        :stroke="cfgLegend.buttons.iconColor"
                    />
                </button>

                <button
                    v-if="cfgLegend.buttons.lap"
                    :title="cfgLegend.buttonTitles.lap"
                    @click="lap"
                    class="vue-ui-timer-button"
                    :style="{
                        opacity: isRunning && !isPaused ? 1 : 0.2,
                        cursor:
                            isRunning && !isPaused
                                ? isCursorPointer
                                    ? 'pointer'
                                    : 'default'
                                : 'default',
                    }"
                >
                    <BaseIcon
                        name="lap"
                        :stroke="cfgLegend.buttons.iconColor"
                    />
                </button>
            </div>
            <slot
                name="controls"
                v-bind="{
                    start,
                    pause,
                    reset,
                    restart,
                    lap,
                    laps,
                    isRunning,
                    isPaused,
                    ...currentTime,
                }"
            />
            <slot
                name="laps"
                v-bind="{
                    laps,
                    lap,
                    isRunning,
                    isPaused,
                    ...currentTime,
                }"
            />
        </div>
    </div>
</template>

<style scoped>
.vue-ui-timer-controls {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    gap: 2%;
}
.vue-ui-timer-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: inherit;
    border: none;
}
</style>
