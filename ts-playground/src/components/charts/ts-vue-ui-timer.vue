<script setup lang="ts">
/**
 * This playground showcases all the slots and their implementations for <VueUiTimer>
 */
import { computed } from 'vue';
import { VueUiTimer, type VueUiTimerConfig } from 'vue-data-ui/vue-ui-timer';
import 'vue-data-ui/style.css';

const config = computed<VueUiTimerConfig>(() => {
    return {
        type: 'stopwatch',
        responsive: false,
        responsiveProportionalSizing: true,
        useCursorPointer: false,
        style: {
            fontFamily: 'inherit',
            backgroundColor: '#FFFFFF',
            height: 300,
            width: 300,
            title: {
                text: '',
                color: '#2D353C',
                fontSize: 20,
                bold: true,
                textAlign: 'center',
                paddingLeft: 0,
                paddingRight: 0,
                subtitle: {
                    color: '#A1A1A1',
                    text: '',
                    fontSize: 16,
                    bold: false,
                },
            },
        },
        stopwatch: {
            showHours: false,
            showHundredth: true,
            cycleSeconds: 5,
            track: {
                radiusRatio: 1,
                stroke: '#e1e5e8',
                fill: '#FFFFFF',
                strokeWidth: 2,
            },
            tracker: {
                radiusRatio: 1,
                stroke: '#FFFFFF',
                strokeWidth: 1,
                fill: '#2D353C',
                gradient: {
                    show: true,
                    color: '#FFFFFF',
                },
                aura: {
                    show: true,
                    radiusRatio: 1,
                    fill: '#2D353C',
                    stroke: '#FFFFFF',
                    strokeWidth: 0,
                },
            },
            cycleTrack: {
                show: true,
                stroke: '#2D353C',
                strokeWidth: 3,
            },
            label: {
                fontSize: 24,
                color: '#2D353C',
                bold: false,
            },
            legend: {
                backgroundColor: '#FFFFFF',
                buttons: {
                    start: true,
                    pause: true,
                    reset: true,
                    restart: true,
                    lap: true,
                    iconColor: '#2D353C',
                },
                buttonTitles: {
                    start: 'Start',
                    pause: 'Pause',
                    resume: 'Resume',
                    reset: 'Reset',
                    restart: 'Restart',
                    lap: 'Lap',
                },
            },
        },
    }
});

function log(n: unknown) {
    console.log(n);
}
</script>

<template>
    <div style="max-width: 500px">
        <VueUiTimer :config>
            <template #chart-background>
                <div
                    style="
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(
                            to bottom,
                            #cccccc00,
                            #cccccc90
                        );
                    "
                >
                    <code style="color: chocolate"> #chart-background </code>
                </div>
            </template>

            <!-- <template #time="{ elapsed, timestamp, formatted }">
                <div
                    style="
                        display: flex;
                        flex-direction: column;
                        font-size: 0.7rem;
                        line-height: 0.7rem;
                        width: 100%;
                        border: 1px solid red;
                    "
                >
                    <code style="color: chocolate">#time</code>
                    <span>elapsed: {{ elapsed }}</span>
                    <span>timestamp: {{ timestamp }}</span>
                    <span>formatted: {{ formatted }}</span>
                </div>
            </template> -->

            <template #timeSvg="{ formatted, width, height }">
                <text
                    :x="width / 2"
                    :y="height / 2"
                    fill="chocolate"
                    font-size="12"
                    text-anchor="middle"
                    dominant-baseline="middle"
                >
                    #time: {{ formatted }}
                </text>
            </template>

            <template
                #controls="{
                    start,
                    pause,
                    lap,
                    restart,
                    reset,
                    laps,
                    isRunning,
                    isPaused,
                    ...currentTime
                }"
            >
                <code style="color: chocolate">#controls</code>
                <button @click="start">START</button>
                <button @click="pause">PAUSE</button>
                <button @click="lap">LAP</button>
                <button @click="restart">RESTART</button>
                <button @click="reset">RESET</button>
                <div>isRunning: {{ isRunning }}</div>
                <div>isPaused: {{ isPaused }}</div>
                <div>laps: {{ laps }}</div>
                <div>currentTime: {{ currentTime }}</div>
            </template>

            <template
                #laps="{ lap, laps, isRunning, isPaused, ...currentTime }"
            >
                <code style="color: chocolate">#laps</code>
                <button @click="lap">LAP</button>
                <div>isRunning: {{ isRunning }}</div>
                <div>isPaused: {{ isPaused }}</div>
                <div>laps: {{ laps }}</div>
                <div>currentTime: {{ currentTime }}</div>
            </template>
        </VueUiTimer>
    </div>
</template>
