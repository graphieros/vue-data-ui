<script setup>
import { ref, computed } from 'vue';
import {
    createPolygonPath,
    createStar,
    setOpacity,
    XMLNS,
    createUid,
} from '../lib.js';
import { useNestedProp } from '../useNestedProp';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import PackageVersion from '../atoms/PackageVersion.vue';
import DefGrad from '../atoms/DefGrad.vue';

const { vue_ui_skeleton: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        },
    },
});

const uid = ref(`vue-ui-skeleton-${createUid()}`);

const FINAL_CONFIG = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG,
    });
});

const cfgStyle = computed(() => FINAL_CONFIG.value.style);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => [],
    component: 'VueUiSkeleton',
    rules: [COMMON_RULES.noHint],
});

const isAnimated = computed(() => {
    return FINAL_CONFIG.value.style.animated;
});

const type = computed(() => {
    return FINAL_CONFIG.value.type;
});

const bars = ref([60, 50, 55, 36, 40, 25, 26, 12]);

const radar = computed(() => {
    return createPolygonPath({
        plot: { x: 50, y: 50 },
        radius: 40,
        sides: 6,
    }).path;
});

const radarInside1 = computed(() => {
    return createPolygonPath({
        plot: { x: 50, y: 50 },
        radius: 30,
        sides: 6,
    }).path;
});

const radarInside2 = computed(() => {
    return createPolygonPath({
        plot: { x: 50, y: 50 },
        radius: 20,
        sides: 6,
    }).path;
});

const radarInside3 = computed(() => {
    return createPolygonPath({
        plot: { x: 50, y: 50 },
        radius: 10,
        sides: 6,
    }).path;
});

const chestnut = ref([
    {
        root: {
            x: 70,
            y: 77,
            r: 44,
            opacity: 100,
        },
        bars: [
            {
                x: 200,
                y: 37,
                opacity: 100,
                width: 240,
            },
            {
                x: 200,
                y: 118,
                opacity: 100,
                width: 180,
            },
            {
                x: 200,
                y: 253,
                opacity: 100,
                width: 80,
            },
        ],
    },
    {
        root: {
            x: 70,
            y: 177,
            r: 32,
            opacity: 70,
        },
        bars: [
            {
                x: 200,
                y: 145,
                opacity: 70,
                width: 160,
            },
            {
                x: 200,
                y: 172,
                opacity: 70,
                width: 140,
            },
            {
                x: 200,
                y: 199,
                opacity: 70,
                width: 120,
            },
        ],
    },
    {
        root: {
            x: 70,
            y: 257,
            r: 24,
            opacity: 40,
        },
        bars: [
            {
                x: 200,
                y: 64,
                opacity: 40,
                width: 220,
            },
            {
                x: 200,
                y: 91,
                opacity: 40,
                width: 200,
            },
            {
                x: 200,
                y: 226,
                opacity: 40,
                width: 100,
            },
        ],
    },
]);

const candlesticks = ref([
    {
        y: 200,
        height: 100,
        bar: 50,
    },
    {
        y: 180,
        height: 100,
        bar: 40,
    },
    {
        y: 150,
        height: 100,
        bar: 30,
    },
    {
        y: 120,
        height: 80,
        bar: 50,
    },
    {
        y: 110,
        height: 60,
        bar: 30,
    },
    {
        y: 80,
        height: 80,
        bar: 10,
    },
    {
        y: 50,
        height: 80,
        bar: 40,
    },
    {
        y: 24,
        height: 40,
        bar: 24,
    },
    {
        y: 44,
        height: 20,
        bar: 13,
    },
    {
        y: 32,
        height: 45,
        bar: 19,
    },
]);

const pyramid = ref([
    [3, 2.5],
    [4, 3.1],
    [8, 6],
    [9.5, 6.5],
    [12, 11],
    [16, 15],
    [18, 18.2],
    [25, 24],
    [24, 26],
    [32, 32],
    [33, 32],
    [32, 31],
    [38, 37],
    [37, 38],
    [42, 41],
    [40, 41],
    [44, 45],
    [38, 35],
    [31, 32],
]);

// 32 * 150
const sparkline = ref([
    { x: 40, y: 30 },
    { x: 45, y: 28 },
    { x: 50, y: 25 },
    { x: 55, y: 20 },
    { x: 60, y: 27 },
    { x: 65, y: 14 },
    { x: 70, y: 23 },
    { x: 75, y: 16 },
    { x: 80, y: 25 },
    { x: 85, y: 10 },
    { x: 90, y: 18 },
    { x: 95, y: 7 },
    { x: 100, y: 12 },
    { x: 105, y: 10 },
    { x: 110, y: 20 },
    { x: 115, y: 7 },
    { x: 120, y: 14 },
    { x: 125, y: 10 },
    { x: 130, y: 19 },
    { x: 135, y: 3 },
    { x: 140, y: 10 },
    { x: 145, y: 2 },
    { x: 150, y: 1 },
]);

function calcTickStart(angle, distance = 1) {
    const angleStart = 29.85;
    return {
        x:
            200 +
            160 * Math.cos(angleStart + (angle * Math.PI) / 180) * distance,
        y:
            200 +
            160 * Math.sin(angleStart + (angle * Math.PI) / 180) * distance,
    };
}

const ticks = computed(() => {
    const tickArray = [];
    const tickAmount = 100;
    for (let i = 0; i < tickAmount; i += 1) {
        tickArray.push({
            x1: calcTickStart((360 / tickAmount) * i).x,
            y1: calcTickStart((360 / tickAmount) * i).y,
            x2: calcTickStart((360 / tickAmount) * i, 0.9).x,
            y2: calcTickStart((360 / tickAmount) * i, 0.9).y,
            color: FINAL_CONFIG.value.style.wheel.color,
        });
    }
    return tickArray;
});

const chordPaths = ref([
    'M1.74 203.99A204 204 0 01-131.29-156.13l15.44 18.36A180 180 0 001.53 179.99Z',
    'M-123.33-162.5A204 204 0 01-10.2-203.75L-9-179.78a180 180 0 00-99.82 36.4Z',
    'M0-180A180 180 0 01175.19 41.33l23.36 5.51A204 204 0 000-204Z',
    'M172.91 50.03A180 180 0 0110.53 179.69l1.4 23.96A204 204 0 00195.96 56.7Z',
    'M-166.87-67.49a180 180 0 0151.02-70.28Q0 0 119.83-134.32a180 180 0 0152.13 81.13Q0 0-166.87-67.49Z',
    'M-29.99-177.48a180 180 0 0110.73-1.49Q0 0 112.89 140.2A180 180 0 0153.63 171.83Q0 0-29.99-177.48Z',
    'M179.71 10.29a180 180 0 01-4.52 31.04Q0 0-40.87-175.3a180 180 0 0110.88-2.18Q0 0 179.71 10.29Z',
    'M-19.26-178.97Q0 0-166.87-67.49a180 180 0 00-12.14 86.36Q0 0-9-179.78a180 180 0 00-10.26.81Z',
    'M-108.82-143.38Q0 0-40.87-175.3a180 180 0 00-67.95 31.92Q0 0-40.87-175.3a180 180 0 00-67.95 31.92Z',
    'M0-180a180 180 0 01119.83 45.68Q0 0 0-180a180 180 0 01119.83 45.68Q0 0 0-180Z',
    'M-148.85 101.22Q0 0-179.01 18.87a180 180 0 0030.16 82.35Q0 0-179.01 18.87a180 180 0 0030.16 82.35Z',
    'M1.53 179.99Q0 0 31.73 177.18a180 180 0 0021.9-5.35Q0 0-148.85 101.22A180 180 0 001.53 179.99Z',
    'M31.73 177.18a180 180 0 01-21.2 2.51Q0 0 171.96-53.19a180 180 0 017.75 63.48Q0 0 31.73 177.18Z',
    'M172.91 50.03Q0 0 112.89 140.2a180 180 0 0060.02-90.17Q0 0 112.89 140.2a180 180 0 0060.02-90.17Z',
]);
</script>

<template>
    <div
        :id="uid"
        :class="{
            'vue-data-ui-component': true,
            'vue-ui-skeleton': true,
            'vue-ui-skeleton-animated': isAnimated,
        }"
        :style="`background:${cfgStyle.backgroundColor};color:${cfgStyle.color};display:flex;align-items:center;justify-content:center;`"
    >
        <template v-if="type === 'chord'">
            <svg
                :xmlns="XMLNS"
                width="100%"
                viewBox="0 0 600 600"
                :style="{ background: cfgStyle.backgroundColor }"
            >
                <PackageVersion />
                <g :transform="`translate(300, 300)`">
                    <path
                        v-for="(path, i) in chordPaths"
                        :key="path"
                        :d="path"
                        :fill="cfgStyle.chord.color"
                        :stroke="cfgStyle.backgroundColor"
                        stroke-width="2"
                        :style="{
                            opacity: i > 3 ? 0.6 : 1,
                        }"
                    />
                </g>
            </svg>
        </template>

        <template v-if="type === 'ridgeline'">
            <svg
                :xmlns="XMLNS"
                width="100%"
                viewBox="20 0 512 200"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <defs>
                    <DefGrad
                        t="linear"
                        :id="`ridgeline-gradient-${uid}`"
                        x1="50%"
                        y1="0%"
                        x2="50%"
                        y2="100%"
                        :stops="[
                            ['0%', cfgStyle.ridgeline.color, 1],
                            ['30%', cfgStyle.ridgeline.color, 0.7],
                            ['70%', cfgStyle.ridgeline.color, 0.3],
                            ['100%', cfgStyle.ridgeline.color, 0.1],
                        ]"
                    />
                </defs>
                <path
                    :fill="`url(#ridgeline-gradient-${uid})`"
                    :stroke="cfgStyle.ridgeline.color"
                    stroke-width="1"
                    d="M66.7 60c6.18-.6 12.36-1.11 18.55-1.79 6.18-.68 12.37-2.38 18.55-2.4 6.19-.01 12.37 0 18.56-.01 6.18-.02 12.37-5.3 18.55-5.3 6.19 0 12.37 4.95 18.56 4.95 6.18 0 12.37-2.78 18.55-2.78 6.19 0 12.37 1.02 18.56 1.92 6.18.9 12.37 4.58 18.55 4.58s12.37-6.71 18.55-6.71c6.19 0 12.37.89 18.56.89 6.18 0 12.37-4.48 18.55-4.48 6.19 0 12.37 4.79 18.56 4.79 6.18 0 12.37-26.07 18.55-26.07 6.19 0 12.37 9.31 18.56 13.85 6.18 4.54 12.37 13.39 18.55 13.39 6.19 0 12.37-36.14 18.56-36.14 6.18 0 12.36 38.45 18.55 38.45 6.18 0 12.37-11.46 18.55-16.94 6.19-5.48 12.37-15.97 18.56-15.97 6.18 0 12.37 16.4 18.55 16.4 6.19 0 12.37-.12 18.56-.35 6.18-.22 12.37-38.08 18.55-38.08 6.19 0 12.37 24.07 18.56 36.1V60"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                ></path>

                <path
                    :fill="`url(#ridgeline-gradient-${uid})`"
                    :stroke="cfgStyle.ridgeline.color"
                    stroke-width="1"
                    d="M66.7 90c6.18-.22 12.36-.35 18.55-.67 6.18-.32 12.37-1.65 18.55-1.65 6.19 0 12.37 1.66 18.56 1.66 6.18 0 12.37-8.76 18.55-8.76 6.19 0 12.37 4.15 18.56 4.15 6.18 0 12.37-8.44 18.55-8.44 6.19 0 12.37 10.87 18.56 10.87 6.18 0 12.37-9.21 18.55-12.16 6.18-2.96 12.37-6.97 18.55-6.97 6.19 0 12.37 9.59 18.56 12.77 6.18 3.18 12.37 7.6 18.55 7.6 6.19 0 12.37-24.44 18.56-24.44 6.18 0 12.37 16.97 18.55 16.97 6.19 0 12.37-20.62 18.56-20.62 6.18 0 12.37 20.37 18.55 20.37 6.19 0 12.37-13.13 18.56-13.13 6.18 0 12.36 13.51 18.55 13.51 6.18 0 12.37-26.41 18.55-26.41 6.19 0 12.37.49 18.56 1.26 6.18.78 12.37 13.82 18.55 13.82 6.19 0 12.37-5.3 18.56-8.3 6.18-3 12.37-9.81 18.55-9.81 6.19 0 12.37 19.82 18.56 29.72V90"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                ></path>

                <path
                    :fill="`url(#ridgeline-gradient-${uid})`"
                    :stroke="cfgStyle.ridgeline.color"
                    stroke-width="1"
                    d="M66.7 120c6.18-.34 12.36-.55 18.55-1.01 6.18-.46 12.37-1.17 18.55-2.15 6.19-.99 12.37-3.7 18.56-4.69 6.18-.98 12.37-2.15 18.55-2.15 6.19 0 12.37.52 18.56 1.2 6.18.68 12.37 6.67 18.55 6.67 6.19 0 12.37-12.15 18.56-12.15 6.18 0 12.37 4.6 18.55 4.6S227.5 99.7 233.68 98.99c6.19-.71 12.37-1.18 18.56-1.18 6.18 0 12.37 17.75 18.55 18.22 6.19.48 12.37.74 18.56.74 6.18 0 12.37-17.09 18.55-17.09 6.19 0 12.37 12.68 18.56 12.68 6.18 0 12.37-.33 18.55-.67 6.19-.34 12.37-.79 18.56-2.06 6.18-1.26 12.36-25.45 18.55-25.45 6.18 0 12.37 10.35 18.55 10.35 6.19 0 12.37-21.07 18.56-21.07 6.18 0 12.37 33.27 18.55 33.27 6.19 0 12.37-26.97 18.56-26.97 6.18 0 12.37 26.97 18.55 27.36 6.19.4 12.37.41 18.56.61V120"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                ></path>

                <path
                    :fill="`url(#ridgeline-gradient-${uid})`"
                    :stroke="cfgStyle.ridgeline.color"
                    stroke-width="1"
                    d="M66.7 150c6.18-.52 12.36-1.57 18.55-1.57 6.18 0 12.37 1.36 18.55 1.36 6.19 0 12.37-1.75 18.56-3.18 6.18-1.43 12.37-6.62 18.55-6.62 6.19 0 12.37 9.98 18.56 9.98 6.18 0 12.37-4.94 18.55-5.64 6.19-.71 12.37-.52 18.56-1.31 6.18-.78 12.37-12.43 18.55-12.43s12.37 18.52 18.55 18.52c6.19 0 12.37-2.49 18.56-2.49 6.18 0 12.37 3.02 18.55 3.02 6.19 0 12.37-29.39 18.56-29.39 6.18 0 12.37 5.56 18.55 8.36 6.19 2.81 12.37 5.14 18.56 8.47 6.18 3.34 12.37 12.25 18.55 12.25 6.19 0 12.37-4.3 18.56-8.78 6.18-4.48 12.36-28.77 18.55-28.77 6.18 0 12.37 1.29 18.55 3.02 6.19 1.72 12.37 18.36 18.56 18.36 6.18 0 12.37-7.68 18.55-12.92 6.19-5.24 12.37-18.51 18.56-20.1 6.18-1.58 12.37-2.7 18.55-2.7 6.19 0 12.37 34.69 18.56 52.04V150"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                ></path>

                <path
                    :fill="`url(#ridgeline-gradient-${uid})`"
                    :stroke="cfgStyle.ridgeline.color"
                    stroke-width="1"
                    d="M66.7 180c6.18-.6 12.36-1.07 18.55-1.81 6.18-.74 12.37-2.86 18.55-2.86 6.19 0 12.37 2.14 18.56 2.14 6.18 0 12.37-7.08 18.55-7.08 6.19 0 12.37 1.08 18.56 2.03 6.18.95 12.37 4.75 18.55 4.75 6.19 0 12.37-2.45 18.56-4.62 6.18-2.17 12.37-10.99 18.55-10.99s12.37 9.58 18.55 9.58c6.19 0 12.37-.25 18.56-.69 6.18-.43 12.37-13.6 18.55-13.6 6.19 0 12.37 17.23 18.56 17.23 6.18 0 12.37-2.5 18.55-5.19 6.19-2.68 12.37-15.45 18.56-18 6.18-2.55 12.37-4.86 18.55-4.86 6.19 0 12.37 18.61 18.56 18.61 6.18 0 12.36-24.22 18.55-26.66 6.18-2.45 12.37-4.25 18.55-4.25 6.19 0 12.37 7.92 18.56 7.92 6.18 0 12.37-1.95 18.55-1.95 6.19 0 12.37 29.69 18.56 29.69 6.18 0 12.37-2.55 18.55-6.14 6.19-3.58 12.37-28.83 18.56-43.25v60"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                ></path>
            </svg>
        </template>

        <template v-if="type === 'historyPlot'">
            <svg
                :xmlns="XMLNS"
                width="100%"
                viewBox="0 0 612 512"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <line
                    x1="12"
                    x2="12"
                    y1="12"
                    y2="500"
                    :stroke="cfgStyle.historyPlot.color"
                    stroke-width="3"
                    stroke-linecap="round"
                />
                <line
                    x1="12"
                    x2="600"
                    y1="500"
                    y2="500"
                    :stroke="cfgStyle.historyPlot.color"
                    stroke-width="3"
                    stroke-linecap="round"
                />
                <path
                    d="M 80,100 300,200 400,150 560,230 360,420 230,320"
                    fill="none"
                    :stroke="cfgStyle.historyPlot.color"
                    stroke-width="3"
                />
                <circle
                    cx="80"
                    cy="100"
                    r="24"
                    :fill="cfgStyle.historyPlot.color"
                    :stroke="cfgStyle.backgroundColor"
                    stroke-width="3"
                />
                <text
                    x="80"
                    y="108"
                    :fill="cfgStyle.backgroundColor"
                    font-size="24"
                    text-anchor="middle"
                >
                    1
                </text>
                <circle
                    cx="300"
                    cy="200"
                    r="24"
                    :fill="cfgStyle.historyPlot.color"
                    :stroke="cfgStyle.backgroundColor"
                    stroke-width="3"
                />
                <text
                    x="300"
                    y="208"
                    :fill="cfgStyle.backgroundColor"
                    font-size="24"
                    text-anchor="middle"
                >
                    2
                </text>
                <circle
                    cx="400"
                    cy="150"
                    r="24"
                    :fill="cfgStyle.historyPlot.color"
                    :stroke="cfgStyle.backgroundColor"
                    stroke-width="3"
                />
                <text
                    x="400"
                    y="158"
                    :fill="cfgStyle.backgroundColor"
                    font-size="24"
                    text-anchor="middle"
                >
                    3
                </text>
                <circle
                    cx="560"
                    cy="230"
                    r="24"
                    :fill="cfgStyle.historyPlot.color"
                    :stroke="cfgStyle.backgroundColor"
                    stroke-width="3"
                />
                <text
                    x="560"
                    y="238"
                    :fill="cfgStyle.backgroundColor"
                    font-size="24"
                    text-anchor="middle"
                >
                    4
                </text>
                <circle
                    cx="360"
                    cy="420"
                    r="24"
                    :fill="cfgStyle.historyPlot.color"
                    :stroke="cfgStyle.backgroundColor"
                    stroke-width="3"
                />
                <text
                    x="360"
                    y="428"
                    :fill="cfgStyle.backgroundColor"
                    font-size="24"
                    text-anchor="middle"
                >
                    5
                </text>
                <circle
                    cx="230"
                    cy="320"
                    r="24"
                    :fill="cfgStyle.historyPlot.color"
                    :stroke="cfgStyle.backgroundColor"
                    stroke-width="3"
                />
                <text
                    x="230"
                    y="328"
                    :fill="cfgStyle.backgroundColor"
                    font-size="24"
                    text-anchor="middle"
                >
                    6
                </text>
            </svg>
        </template>

        <template v-if="type === 'circlePack'">
            <svg
                :xmlns="XMLNS"
                width="100%"
                viewBox="0 0 100 100"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <circle
                    :cx="50"
                    :cy="50"
                    :r="20"
                    :stroke="cfgStyle.circlePack.color"
                    :stroke-width="1"
                    fill="none"
                />
                <circle
                    :cx="80"
                    :cy="50"
                    :r="10"
                    :stroke="cfgStyle.circlePack.color"
                    :stroke-width="1"
                    fill="none"
                />
                <circle
                    :cx="28"
                    :cy="30"
                    :r="10"
                    :stroke="cfgStyle.circlePack.color"
                    :stroke-width="1"
                    fill="none"
                />
                <circle
                    :cx="25"
                    :cy="76"
                    :r="16"
                    :stroke="cfgStyle.circlePack.color"
                    :stroke-width="1"
                    fill="none"
                />
                <circle
                    :cx="60"
                    :cy="78.5"
                    :r="10"
                    :stroke="cfgStyle.circlePack.color"
                    :stroke-width="1"
                    fill="none"
                />
                <circle
                    :cx="64"
                    :cy="20"
                    :r="13"
                    :stroke="cfgStyle.circlePack.color"
                    :stroke-width="1"
                    fill="none"
                />
                <circle
                    :cx="72"
                    :cy="37"
                    :r="5"
                    :stroke="cfgStyle.circlePack.color"
                    :stroke-width="1"
                    fill="none"
                />
                <circle
                    :cx="25"
                    :cy="45"
                    :r="5"
                    :stroke="cfgStyle.circlePack.color"
                    :stroke-width="1"
                    fill="none"
                />
                <circle
                    :cx="70"
                    :cy="66"
                    :r="5"
                    :stroke="cfgStyle.circlePack.color"
                    :stroke-width="1"
                    fill="none"
                />
            </svg>
        </template>

        <template v-if="type === 'flow'">
            <svg
                :xmlns="XMLNS"
                width="100%"
                viewBox="0 0 80 60"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <path
                    d="M5 5V55M75 5V55M28 5V55M52 5V55M5 8l23 4L52 9 75 8v4H52L28 21 5 29ZM5 34l23 1L52 24l23-3v6L52 30 28 44l24-5 23 2v6L52 45 28 52H5Z"
                    :stroke="cfgStyle.flow.color"
                    :stroke-width="0.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    :fill="cfgStyle.flow.color"
                />
            </svg>
        </template>

        <template v-if="type === 'parallelCoordinatePlot'">
            <svg
                :xmlns="XMLNS"
                width="100%"
                viewBox="0 0 80 60"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <path
                    d="M5 5V55M75 5V55M28 5V55M52 5V55M5 10a1 1 0 000 2 1 1 0 000-2m23 5a1 1 0 000 2 1 1 0 000-2M52 8a1 1 0 000 2 1 1 0 000-2m23 3a1 1 0 000 2 1 1 0 000-2M6 11l21 5m2 0L51 9m2 0 21 3M5 50a1 1 0 000-2 1 1 0 000 2M28 39a1 1 0 000 2 1 1 0 000-2m24 6a1 1 0 000 2 1 1 0 000-2m23 0a1 1 0 000 2 1 1 0 000-2M6 49l21-9m2 0 22 6m2 0H74M5 25a1 1 0 000 2 1 1 0 000-2m23 6a1 1 0 000 2 1 1 0 000-2m24-8a1 1 0 000 2 1 1 0 000-2m23-2a1 1 0 000 2 1 1 0 000-2M6 26l21 6m2 0 22-8m2 0 21-2"
                    :stroke="cfgStyle.parallelCoordinatePlot.color"
                    :stroke-width="0.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    :fill="cfgStyle.parallelCoordinatePlot.color"
                />
            </svg>
        </template>

        <template v-if="type === 'bullet'">
            <svg
                :xmlns="XMLNS"
                width="100%"
                viewBox="0 0 600 96"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <rect
                    :fill="cfgStyle.bullet.color"
                    :x="24"
                    :y="12"
                    :width="300"
                    :height="72"
                    style="opacity: 0.8"
                />
                <rect
                    :fill="cfgStyle.bullet.color"
                    :x="324"
                    :y="12"
                    :width="150"
                    :height="72"
                    style="opacity: 0.6"
                />
                <rect
                    :fill="cfgStyle.bullet.color"
                    :x="474"
                    :y="12"
                    :width="102"
                    :height="72"
                    style="opacity: 0.3"
                />
                <rect
                    :fill="cfgStyle.bullet.color"
                    :x="24"
                    :y="36"
                    :width="490"
                    :height="24"
                    style="opacity: 1"
                />
            </svg>
        </template>

        <!-- DUMBBELL -->
        <template v-if="type === 'dumbbell'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-line"
                width="100%"
                viewBox="0 0 100 55"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <line
                    x1="3"
                    x2="3"
                    y1="3"
                    y2="67"
                    :stroke="cfgStyle.dumbbell.color"
                    :stroke-width="0.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    d="
                    M 30,11
                    C 39,10 39,10
                    45,11
                    L 45,9
                    C 39,10 39,10
                    30,9 Z
                "
                    :fill="cfgStyle.dumbbell.color"
                />
                <circle
                    cx="30"
                    cy="10"
                    r="2"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.dumbbell.color"
                />
                <circle
                    cx="46"
                    cy="10"
                    r="2"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.dumbbell.color"
                />
                <path
                    d="
                    M 10,21
                    C 23,20 23,20
                    36,21
                    L 36,19
                    C 23,20 23,20
                    10,19 Z
                "
                    :fill="cfgStyle.dumbbell.color"
                />
                <circle
                    cx="10"
                    cy="20"
                    r="2"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.dumbbell.color"
                />
                <circle
                    cx="36"
                    cy="20"
                    r="2"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.dumbbell.color"
                />
                <path
                    d="
                    M 30,31
                    C 45,30 45,30
                    60,31
                    L 60,29
                    C 45,30 45,30
                    30,29 Z
                "
                    :fill="cfgStyle.dumbbell.color"
                />
                <circle
                    cx="30"
                    cy="30"
                    r="2"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.dumbbell.color"
                />
                <circle
                    cx="60"
                    cy="30"
                    r="2"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.dumbbell.color"
                />
                <path
                    d="
                    M 50,41
                    C 65,40 65,40
                    80,41
                    L 80,39
                    C 65,40 65,40
                    50,39 Z
                "
                    :fill="cfgStyle.dumbbell.color"
                />
                <circle
                    cx="50"
                    cy="40"
                    r="2"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.dumbbell.color"
                />
                <circle
                    cx="80"
                    cy="40"
                    r="2"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.dumbbell.color"
                />
                <path
                    d="
                    M 40,51
                    C 65,50 65,50
                    90,51
                    L 90,49
                    C 65,50 65,50
                    40,49 Z
                "
                    :fill="cfgStyle.dumbbell.color"
                />
                <circle
                    cx="40"
                    cy="50"
                    r="2"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.dumbbell.color"
                />
                <circle
                    cx="90"
                    cy="50"
                    r="2"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.dumbbell.color"
                />
            </svg>
        </template>

        <!-- STRIP PLOT -->
        <template v-if="type === 'stripPlot'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-line"
                width="100%"
                viewBox="0 0 100 100"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <line
                    x1="3"
                    x2="3"
                    y1="3"
                    y2="97"
                    :stroke="cfgStyle.stripPlot.color"
                    :stroke-width="0.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <line
                    x1="3"
                    x2="97"
                    y1="97"
                    y2="97"
                    :stroke="cfgStyle.stripPlot.color"
                    :stroke-width="0.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <circle
                    cx="12"
                    cy="8"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />
                <circle
                    cx="12"
                    cy="40"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />
                <circle
                    cx="12"
                    cy="60"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />
                <circle
                    cx="12"
                    cy="70"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />

                <circle
                    cx="32"
                    cy="25"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />
                <circle
                    cx="32"
                    cy="38"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />
                <circle
                    cx="32"
                    cy="44"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />
                <circle
                    cx="32"
                    cy="55"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />

                <circle
                    cx="52"
                    cy="30"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />
                <circle
                    cx="52"
                    cy="33"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />
                <circle
                    cx="52"
                    cy="43"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />
                <circle
                    cx="52"
                    cy="63"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />
                <circle
                    cx="52"
                    cy="78"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />

                <circle
                    cx="72"
                    cy="58"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />
                <circle
                    cx="72"
                    cy="70"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />
                <circle
                    cx="72"
                    cy="78"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />
                <circle
                    cx="72"
                    cy="88"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />

                <circle
                    cx="92"
                    cy="66"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />
                <circle
                    cx="92"
                    cy="77"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />
                <circle
                    cx="92"
                    cy="85"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />
                <circle
                    cx="92"
                    cy="88"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />
                <circle
                    cx="92"
                    cy="90"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />
                <circle
                    cx="92"
                    cy="92"
                    r="4"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="0.3"
                    :fill="cfgStyle.stripPlot.color"
                    style="opacity: 0.5"
                />
            </svg>
        </template>

        <!-- TREEMAP -->
        <template v-if="type === 'treemap'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-treemap"
                width="100%"
                viewBox="0 0 30 21"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <path
                    fill="none"
                    :stroke="cfgStyle.treemap.color"
                    stroke-width="0.3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M 1 1 L 29 1 L 29 20 L 1 20 Z M 10 1 L 10 20 M 1 13 L 10 13 M 22 11 L 22 20 M 10 11 L 22 11 M 22 11 L 29 11 M 7 13 L 7 20 M 17 11 L 17 20 M 22 15 L 29 15 M 26 15 L 26 20 M 20 1 L 20 11"
                />
            </svg>
        </template>

        <!-- GALAXY -->
        <template v-if="type === 'galaxy'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-relation-circle"
                width="100%"
                viewBox="0.5 0 20 20"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <path
                    fill="none"
                    :stroke="cfgStyle.galaxy.color"
                    stroke-width="2"
                    stroke-linecap="round"
                    d="M18 11c0 2-1 4-1.6 5M3 11a1 1 0 0115 0m-4 0A1 1 0 013 11m4 0a1 1 0 017 0m-3 0A1 1 0 017 11"
                />
            </svg>
        </template>

        <!-- 3D BAR -->
        <template v-if="type === 'bar3d'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-relation-circle"
                width="100%"
                viewBox="2 0 16 20"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <path
                    fill="none"
                    :stroke="cfgStyle.bar3d.color"
                    stroke-width="0.2"
                    d="M10 19V5m4-2-4 2L6 3m4-2 4 2V17l-4 2-4-2V3l4-2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </template>

        <!-- SPARK HISTOGRAM-->
        <template v-if="type === 'sparkHistogram'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-relation-circle"
                width="100%"
                viewBox="0 0 100 20"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <rect
                    x="3"
                    y="8"
                    height="4"
                    width="6"
                    rx="1.5"
                    :fill="cfgStyle.sparkHistogram.color"
                />
                <rect
                    x="11"
                    y="6"
                    height="8"
                    width="6"
                    rx="2"
                    :fill="cfgStyle.sparkHistogram.color"
                />
                <rect
                    x="19"
                    y="7"
                    height="6"
                    width="6"
                    rx="2"
                    :fill="cfgStyle.sparkHistogram.color"
                />
                <rect
                    x="27"
                    y="6"
                    height="8"
                    width="6"
                    rx="2"
                    :fill="cfgStyle.sparkHistogram.color"
                />
                <rect
                    x="35"
                    y="8"
                    height="4"
                    width="6"
                    rx="1.5"
                    :fill="cfgStyle.sparkHistogram.color"
                />
                <rect
                    x="43"
                    y="7"
                    height="6"
                    width="6"
                    rx="2"
                    :fill="cfgStyle.sparkHistogram.color"
                />
                <rect
                    x="51"
                    y="8.5"
                    height="3"
                    width="6"
                    rx="1.5"
                    :fill="cfgStyle.sparkHistogram.color"
                />
                <rect
                    x="59"
                    y="7"
                    height="6"
                    width="6"
                    rx="2"
                    :fill="cfgStyle.sparkHistogram.color"
                />
                <rect
                    x="67"
                    y="6"
                    height="8"
                    width="6"
                    rx="2"
                    :fill="cfgStyle.sparkHistogram.color"
                />
                <rect
                    x="75"
                    y="7"
                    height="6"
                    width="6"
                    rx="2"
                    :fill="cfgStyle.sparkHistogram.color"
                />
                <rect
                    x="83"
                    y="7"
                    height="6"
                    width="6"
                    rx="2"
                    :fill="cfgStyle.sparkHistogram.color"
                />
                <rect
                    x="91"
                    y="8"
                    height="4"
                    width="6"
                    rx="1.5"
                    :fill="cfgStyle.sparkHistogram.color"
                />
            </svg>
        </template>

        <!-- SPARKBAR -->
        <template v-if="type === 'sparkbar'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-relation-circle"
                width="100%"
                viewBox="0 0 500 200"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <line
                    x1="12"
                    x2="488"
                    y1="50"
                    y2="50"
                    stroke-width="16"
                    stroke-linecap="round"
                    :stroke="cfgStyle.sparkbar.color"
                    opacity="0.5"
                />
                <line
                    x1="12"
                    x2="400"
                    y1="50"
                    y2="50"
                    stroke-width="16"
                    stroke-linecap="round"
                    :stroke="cfgStyle.sparkbar.color"
                    opacity="1"
                />

                <line
                    x1="12"
                    x2="488"
                    y1="100"
                    y2="100"
                    stroke-width="16"
                    stroke-linecap="round"
                    :stroke="cfgStyle.sparkbar.color"
                    opacity="0.5"
                />
                <line
                    x1="12"
                    x2="350"
                    y1="100"
                    y2="100"
                    stroke-width="16"
                    stroke-linecap="round"
                    :stroke="cfgStyle.sparkbar.color"
                    opacity="1"
                />

                <line
                    x1="12"
                    x2="488"
                    y1="150"
                    y2="150"
                    stroke-width="16"
                    stroke-linecap="round"
                    :stroke="cfgStyle.sparkbar.color"
                    opacity="0.5"
                />
                <line
                    x1="12"
                    x2="235"
                    y1="150"
                    y2="150"
                    stroke-width="16"
                    stroke-linecap="round"
                    :stroke="cfgStyle.sparkbar.color"
                    opacity="1"
                />
            </svg>
        </template>

        <!-- SPARK STACKBAR -->
        <template v-if="type === 'sparkStackbar'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-relation-circle"
                width="100%"
                viewBox="0 0 500 64"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <line
                    x1="12"
                    x2="488"
                    y1="32"
                    y2="32"
                    stroke-width="16"
                    stroke-linecap="round"
                    :stroke="cfgStyle.sparkStackbar.color"
                    opacity="0.5"
                />
                <line
                    x1="12"
                    x2="380"
                    y1="32"
                    y2="32"
                    stroke-width="16"
                    stroke-linecap="round"
                    :stroke="cfgStyle.sparkStackbar.color"
                    opacity="0.6"
                />
                <line
                    x1="12"
                    x2="200"
                    y1="32"
                    y2="32"
                    stroke-width="16"
                    stroke-linecap="round"
                    :stroke="cfgStyle.sparkStackbar.color"
                    opacity="0.8"
                />
                <line
                    x1="12"
                    x2="120"
                    y1="32"
                    y2="32"
                    stroke-width="16"
                    stroke-linecap="round"
                    :stroke="cfgStyle.sparkStackbar.color"
                    opacity="1"
                />
            </svg>
        </template>

        <!-- THERMOMETER -->
        <template v-if="type === 'thermometer'">
            <svg
                data-cy="skeleton-relation-circle"
                width="100%"
                viewBox="0 0 20 20"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <path
                    fill="none"
                    :stroke="cfgStyle.thermometer.color"
                    stroke-width="0.2"
                    stroke-linecap="round"
                    d="M 13 4 A 1 1 0 0 0 7 4 L 7 16 A 1 1 0 0 0 13 16 L 13 4 M 7 15 L 8 15 M 7 12 L 8 12 M 7 9 L 8 9 M 7 6 L 8 6 M 12 15 L 13 15 M 12 12 L 13 12 M 12 9 L 13 9 M 12 6 L 13 6 "
                />
                <path
                    :stroke="cfgStyle.thermometer.color"
                    stroke-width="1"
                    style="opacity: 0.6"
                    d="M 10 17 L 10 12 "
                    stroke-linecap="round"
                />
                <path
                    stroke-linecap="round"
                    :stroke="cfgStyle.thermometer.color"
                    stroke-width="1"
                    opacity="M 10 17 L 10 9"
                />
                <path
                    stroke-linecap="round"
                    :stroke="cfgStyle.thermometer.color"
                    stroke-width="1"
                    opacity="0.3"
                    d="M 10 17 L 10 6"
                />
                <path
                    stroke-linecap="round"
                    :stroke="cfgStyle.thermometer.color"
                    stroke-width="1"
                    style="opacity: 0.1"
                    d="M 10 17 L 10 3"
                />
            </svg>
        </template>

        <!-- RELATION CIRCLE -->
        <template v-if="type === 'relationCircle'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-relation-circle"
                width="100%"
                viewBox="0 0 20 20"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <path
                    fill="none"
                    :stroke="cfgStyle.relationCircle.color"
                    stroke-width="0.2"
                    stroke-linecap="round"
                    d="M1 10A1 1 0 0019 10 1 1 0 001 10M1 10C7 11 9 13 10 19M10 19C10 11 8 7 6 2M10 19C10 11 12 7 14 2M10 19C11 13 12 11 19 10"
                />
            </svg>
        </template>

        <!-- MOLECULE -->
        <template v-if="type === 'molecule'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-molecule"
                width="100%"
                viewBox="0 0 100 100"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <circle
                    cx="50"
                    cy="50"
                    r="6"
                    stroke-width="2"
                    fill="none"
                    :stroke="cfgStyle.molecule.color"
                />
                <circle
                    cx="20"
                    cy="50"
                    r="3"
                    stroke-width="1.6"
                    fill="none"
                    :stroke="cfgStyle.molecule.color"
                />
                <circle
                    cx="80"
                    cy="50"
                    r="3"
                    stroke-width="1.6"
                    fill="none"
                    :stroke="cfgStyle.molecule.color"
                />
                <circle
                    cx="50"
                    cy="20"
                    r="3"
                    stroke-width="1.6"
                    fill="none"
                    :stroke="cfgStyle.molecule.color"
                />
                <circle
                    cx="50"
                    cy="80"
                    r="3"
                    stroke-width="1.6"
                    fill="none"
                    :stroke="cfgStyle.molecule.color"
                />
                <line
                    x1="50"
                    x2="50"
                    y1="23"
                    y2="45"
                    stroke-width="1"
                    :stroke="cfgStyle.molecule.color"
                />
                <line
                    x1="50"
                    x2="50"
                    y1="77"
                    y2="55"
                    stroke-width="1"
                    :stroke="cfgStyle.molecule.color"
                />
                <line
                    x1="23"
                    x2="45"
                    y1="50"
                    y2="50"
                    stroke-width="1"
                    :stroke="cfgStyle.molecule.color"
                />
                <line
                    x1="77"
                    x2="55"
                    y1="50"
                    y2="50"
                    stroke-width="1"
                    :stroke="cfgStyle.molecule.color"
                />
            </svg>
        </template>

        <!-- TIREMARKS -->
        <template v-if="type === 'tiremarks'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-tiremarks"
                width="100%"
                viewBox="0 0 312 56"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <g v-for="n in 100">
                    <line
                        :x1="10 + n * 2.9"
                        :y1="6"
                        :x2="10 + n * 2.9"
                        :y2="50"
                        :stroke="cfgStyle.tiremarks.color"
                        :style="n > 80 ? 'opacity: 0.5' : ''"
                        stroke-linecap="round"
                    />
                </g>
            </svg>
        </template>

        <!-- TYPE PYRAMID -->
        <template v-if="type === 'pyramid'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-pyramid"
                width="100%"
                viewBox="0 0 105 80"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <g v-for="(rect, i) in pyramid">
                    <rect
                        :x="50 - rect[0]"
                        :y="i * (80 / pyramid.length)"
                        :width="rect[0]"
                        :height="(80 / pyramid.length) * 0.95"
                        :fill="cfgStyle.pyramid.color"
                    />
                    <rect
                        :x="55"
                        :y="i * (80 / pyramid.length)"
                        :width="rect[1]"
                        :height="(80 / pyramid.length) * 0.95"
                        :fill="cfgStyle.pyramid.color"
                    />
                </g>
            </svg>
        </template>

        <!-- TYPE RINGS -->
        <template v-if="type === 'rings'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-rings"
                width="100%"
                viewBox="0 0 400 400"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <circle
                    :cx="200"
                    :cy="200"
                    :r="180"
                    :fill="setOpacity(cfgStyle.rings.color, 40)"
                />
                <circle
                    :cx="200"
                    :cy="250"
                    :r="130"
                    :fill="setOpacity(cfgStyle.rings.color, 60)"
                />
                <circle
                    :cx="200"
                    :cy="290"
                    :r="90"
                    :fill="setOpacity(cfgStyle.rings.color, 100)"
                />
            </svg>
        </template>

        <!-- TYPE WHEEL -->
        <template v-if="type === 'wheel'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-wheel"
                width="100%"
                viewBox="0 0 400 400"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <line
                    v-for="(tick, i) in ticks"
                    :x1="tick.x1"
                    :x2="tick.x2"
                    :y1="tick.y1"
                    :y2="tick.y2"
                    :stroke="i < 66 ? tick.color : setOpacity(tick.color, 50)"
                    :stroke-width="5"
                    stroke-linecap="round"
                />
                <circle
                    :cx="200"
                    :cy="200"
                    :r="130"
                    :stroke-width="3"
                    :stroke="setOpacity(cfgStyle.wheel.color, 50)"
                    fill="none"
                />
                <rect
                    :fill="setOpacity(cfgStyle.wheel.color, 50)"
                    :rx="12"
                    :x="160"
                    :y="170"
                    :height="60"
                    :width="80"
                    stroke="none"
                />
            </svg>
        </template>

        <!-- TYPE SPARKLINE -->
        <template v-if="type === 'sparkline'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-sparkline"
                width="100%"
                viewBox="0 0 150 32"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <g>
                    <rect
                        x="2"
                        y="2"
                        height="6"
                        width="24"
                        :fill="cfgStyle.sparkline.color"
                        rx="3"
                    />
                    <rect
                        x="2"
                        y="12"
                        height="16"
                        width="16"
                        :fill="cfgStyle.sparkline.color"
                        rx="3"
                    />
                </g>
                <g v-for="(line, i) in sparkline">
                    <line
                        v-if="i < sparkline.length - 1"
                        :x1="line.x"
                        :y1="line.y"
                        :x2="sparkline[i + 1].x"
                        :y2="sparkline[i + 1].y"
                        :stroke-width="cfgStyle.sparkline.strokeWidth"
                        :stroke="cfgStyle.sparkline.color"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </g>
            </svg>
        </template>

        <!-- TYPE CANDLESTICK -->
        <template v-if="type === 'candlesticks'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-candlesticks"
                width="100%"
                viewBox="0 0 512 316"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <g v-if="cfgStyle.candlesticks.axis.show">
                    <line
                        :x1="2"
                        :x2="2"
                        :y1="2"
                        :y2="314"
                        :stroke="cfgStyle.candlesticks.axis.color"
                        :stroke-width="cfgStyle.candlesticks.axis.strokeWidth"
                        stroke-linecap="round"
                    />
                    <line
                        :x1="2"
                        :x2="510"
                        :y1="314"
                        :y2="314"
                        :stroke="cfgStyle.candlesticks.axis.color"
                        :stroke-width="cfgStyle.candlesticks.axis.strokeWidth"
                        stroke-linecap="round"
                    />
                </g>
                <g v-for="(candle, i) in candlesticks">
                    <line
                        :x1="
                            24 +
                            (464 * i) / (candlesticks.length - 1) -
                            464 / (candlesticks.length - 1) / 8
                        "
                        :x2="
                            24 +
                            (464 * i) / (candlesticks.length - 1) +
                            464 / (candlesticks.length - 1) / 8
                        "
                        :y1="candle.y"
                        :y2="candle.y"
                        :stroke="cfgStyle.candlesticks.candle.color"
                        :stroke-width="cfgStyle.candlesticks.candle.strokeWidth"
                        stroke-linecap="round"
                    />
                    <line
                        :x1="
                            24 +
                            (464 * i) / (candlesticks.length - 1) -
                            464 / (candlesticks.length - 1) / 8
                        "
                        :x2="
                            24 +
                            (464 * i) / (candlesticks.length - 1) +
                            464 / (candlesticks.length - 1) / 8
                        "
                        :y1="candle.y + candle.height"
                        :y2="candle.y + candle.height"
                        :stroke="cfgStyle.candlesticks.candle.color"
                        :stroke-width="cfgStyle.candlesticks.candle.strokeWidth"
                        stroke-linecap="round"
                    />
                    <line
                        :x1="24 + (464 * i) / (candlesticks.length - 1)"
                        :x2="24 + (464 * i) / (candlesticks.length - 1)"
                        :y1="candle.y"
                        :y2="candle.y + candle.height"
                        :stroke="cfgStyle.candlesticks.candle.color"
                        :stroke-width="cfgStyle.candlesticks.candle.strokeWidth"
                        stroke-linecap="round"
                    />
                    <rect
                        :x="
                            24 +
                            (464 * i) / (candlesticks.length - 1) -
                            464 / (candlesticks.length - 1) / 8
                        "
                        :y="candle.y + (candle.height - candle.bar * 1.5)"
                        :height="candle.bar"
                        :width="464 / (candlesticks.length - 1) / 4"
                        :fill="cfgStyle.candlesticks.candle.color"
                        rx="1"
                    />
                </g>
            </svg>
        </template>

        <!-- TYPE HEATMAP -->
        <template v-if="type === 'heatmap'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-heatmap"
                width="100%"
                :viewBox="`0 0 ${10 * cfgStyle.heatmap.cellsX} ${10 * cfgStyle.heatmap.cellsY}`"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <g v-for="(_, i) in cfgStyle.heatmap.cellsY">
                    <g v-for="(__, j) in cfgStyle.heatmap.cellsX">
                        <rect
                            :x="j * 10"
                            :y="i * 10"
                            :height="10"
                            :width="10"
                            :stroke="cfgStyle.backgroundColor"
                            :stroke-width="1"
                            :fill="
                                setOpacity(
                                    cfgStyle.heatmap.color,
                                    Math.round(Math.random() * 100),
                                )
                            "
                        />
                    </g>
                </g>
            </svg>
        </template>

        <!-- TYPE CHESTNUT -->
        <template v-if="type === 'chestnut'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-chestnut"
                width="100%"
                viewBox="0 0 512 316"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <g v-for="item in chestnut">
                    <g v-for="bar in item.bars">
                        <path
                            v-for="(p, i) in 22"
                            :d="`M
                            ${bar.x},${bar.y + i}
                            C${bar.x - 20},${bar.y + i} 
                            ${bar.x - 80},${bar.y + i} 
                            ${item.root.x + item.root.r / 2}, ${item.root.y}
                        `"
                            :stroke="
                                setOpacity(
                                    cfgStyle.chestnut.color,
                                    bar.opacity * 0.2,
                                )
                            "
                            fill="none"
                            stroke-width="2"
                            shape-rendering="cirspEdges"
                        />
                    </g>
                </g>
                <circle
                    v-for="item in chestnut"
                    :cx="item.root.x"
                    :cy="item.root.y"
                    :r="item.root.r"
                    :fill="`${cfgStyle.backgroundColor}`"
                    :stroke="FINAL_CONFIG.backgroundColor"
                    :stroke-width="3"
                />
                <circle
                    v-for="item in chestnut"
                    :cx="item.root.x"
                    :cy="item.root.y"
                    :r="item.root.r"
                    :fill="
                        setOpacity(cfgStyle.chestnut.color, item.root.opacity)
                    "
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="3"
                />
                <g v-for="item in chestnut">
                    <rect
                        v-for="bar in item.bars"
                        rx="2"
                        :x="bar.x"
                        :y="bar.y"
                        :width="bar.width"
                        :height="22"
                        :fill="setOpacity(cfgStyle.chestnut.color, bar.opacity)"
                    />
                    <circle
                        v-for="bar in item.bars"
                        :cx="bar.x + bar.width + 32"
                        :cy="bar.y + 11"
                        :r="11"
                        :fill="setOpacity(cfgStyle.chestnut.color, bar.opacity)"
                    />
                    <circle
                        v-for="bar in item.bars"
                        :cx="bar.x + bar.width + 32"
                        :cy="bar.y + 11"
                        :r="5"
                        :fill="cfgStyle.backgroundColor"
                    />
                </g>
                <line
                    :x1="200"
                    :x2="200"
                    :y1="10"
                    :y2="300"
                    :stroke="cfgStyle.backgroundColor"
                    :stroke-width="3"
                />
            </svg>
        </template>

        <!-- TYPE DONUT EVOLUTION -->
        <template v-if="type === 'donutEvolution'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-donut-evolution"
                width="100%"
                viewBox="0 0 108 70"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <path
                    v-if="cfgStyle.line.axis.show"
                    d="M3 3 3 67 105 67"
                    :stroke="cfgStyle.donutEvolution.axis.color"
                    :stroke-width="cfgStyle.donutEvolution.axis.strokeWidth"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                />

                <path
                    fill="none"
                    d="M10 55a1 1 0 0010 0A1 1 0 0010 55m2 0a1 1 0 006 0 1 1 0 00-6 0m-2 0h2m3-3V50m12-5a1 1 0 0010 0A1 1 0 0027 45m2 0a1 1 0 006 0 1 1 0 00-6 0m3 3v2m3-5h2m7 5a1 1 0 0010 0A1 1 0 0044 50m2 0a1 1 0 006 0 1 1 0 00-6 0m3-5v2m0 6v2M61 35a1 1 0 0010 0A1 1 0 0061 35m2 0a1 1 0 006 0 1 1 0 00-6 0m3-5v2m-5 3h2m15 6a1 1 0 0010 0A1 1 0 0078 41m2 0a1 1 0 006 0 1 1 0 00-6 0m-2 0h2m6 0h2m7-27a1 1 0 0010 0A1 1 0 0095 14m2 0a1 1 0 006 0 1 1 0 00-6 0m-2 0h2m3 3v2"
                    :stroke="cfgStyle.donutEvolution.donuts.color"
                    :stroke-width="cfgStyle.donutEvolution.donuts.strokeWidth"
                />

                <path
                    fill="none"
                    d="M19 52l8-7m10 0 7 4m8-3 10-8m9-2 7 4m8-3L97 18"
                    :stroke="cfgStyle.donutEvolution.axis.color"
                    :stroke-width="cfgStyle.donutEvolution.axis.strokeWidth"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />

                <path
                    d="M10 55h2c0-2 2-3 3-3V50c-2 0-5 2-5 5"
                    :fill="cfgStyle.donutEvolution.donuts.color"
                    stroke="none"
                    style="opacity: 0.3"
                />
                <path
                    d="M32 48v2c3 0 5-3 5-5H35c0 2-2 3-3 3"
                    :fill="cfgStyle.donutEvolution.donuts.color"
                    stroke="none"
                    style="opacity: 0.3"
                />
                <path
                    d="M49 53v2a1 1 0 000-10v2c4 0 4 6 0 6"
                    :fill="cfgStyle.donutEvolution.donuts.color"
                    stroke="none"
                    style="opacity: 0.3"
                />
                <path
                    d="M63 35c0-2 2-3 3-3V30c-3 0-5 3-5 5h2"
                    :fill="cfgStyle.donutEvolution.donuts.color"
                    stroke="none"
                    style="opacity: 0.3"
                />
                <path
                    d="M78 41h2c0 4 6 4 6 0h2A1 1 0 0178 41"
                    :fill="cfgStyle.donutEvolution.donuts.color"
                    stroke="none"
                    style="opacity: 0.3"
                />
                <path
                    d="M95 14h2c0 2 2 3 3 3v2c-2 0-5-2-5-5"
                    :fill="cfgStyle.donutEvolution.donuts.color"
                    stroke="none"
                    style="opacity: 0.3"
                />
            </svg>
        </template>

        <!-- TYPE LINE -->
        <template v-if="type === 'line'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-line"
                width="100%"
                viewBox="0 0 100 70"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <g v-if="cfgStyle.line.axis.show">
                    <line
                        x1="3"
                        x2="3"
                        y1="3"
                        y2="67"
                        :stroke="cfgStyle.line.axis.color"
                        :stroke-width="cfgStyle.line.axis.strokeWidth"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                    <line
                        x1="3"
                        x2="97"
                        y1="67"
                        y2="67"
                        :stroke="cfgStyle.line.axis.color"
                        :stroke-width="cfgStyle.line.axis.strokeWidth"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </g>
                <path
                    d="M 9,60 22,50 35,55 48,36 61,40 74,25 87,26 90,12"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    :stroke="cfgStyle.line.path.color"
                    :stroke-width="cfgStyle.line.path.strokeWidth"
                />
                <g v-if="cfgStyle.line.path.showPlots">
                    <circle
                        cx="9"
                        cy="60"
                        :r="cfgStyle.line.path.strokeWidth"
                        :fill="cfgStyle.line.path.color"
                    />
                    <circle
                        cx="90"
                        cy="12"
                        :r="cfgStyle.line.path.strokeWidth"
                        :fill="cfgStyle.line.path.color"
                    />
                </g>
            </svg>
        </template>

        <!-- TYPE BAR -->
        <template v-if="type === 'bar'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-bar"
                width="100%"
                viewBox="0 0 100 70"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <g v-if="cfgStyle.bar.axis.show">
                    <line
                        x1="3"
                        x2="3"
                        y1="3"
                        y2="67"
                        :stroke="cfgStyle.bar.axis.color"
                        :stroke-width="cfgStyle.bar.axis.strokeWidth"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                    <line
                        x1="3"
                        x2="97"
                        y1="67"
                        y2="67"
                        :stroke="cfgStyle.bar.axis.color"
                        :stroke-width="cfgStyle.bar.axis.strokeWidth"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </g>
                <rect
                    v-for="(bar, i) in bars"
                    :fill="cfgStyle.bar.color"
                    :rx="cfgStyle.bar.borderRadius"
                    :x="6 + 11.2 * i"
                    :y="bar"
                    :width="cfgStyle.bar.barWidth"
                    :height="67 - bar"
                />
            </svg>
        </template>

        <!-- TYPE DONUT -->
        <template v-if="type === 'donut'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-donut"
                width="100%"
                viewBox="0 0 400 400"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <path
                    d=" M 300 200 A 100 100 0 0 1 113 250"
                    fill="none"
                    :stroke-width="cfgStyle.donut.strokeWidth"
                    :stroke="cfgStyle.donut.color"
                />
                <path
                    d=" M 113 250 A 100 100 0 0 1 250 113"
                    fill="none"
                    :stroke-width="cfgStyle.donut.strokeWidth"
                    :stroke="setOpacity(cfgStyle.donut.color, 60)"
                />
                <path
                    d=" M 250 113 A 100 100 0 0 1 300 200"
                    fill="none"
                    :stroke-width="cfgStyle.donut.strokeWidth"
                    :stroke="setOpacity(cfgStyle.donut.color, 30)"
                />
            </svg>
        </template>

        <!-- TYPE ONION -->
        <template v-if="type === 'onion'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-onion"
                width="100%"
                viewBox="0 0 400 400"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <path
                    d=" M 200 60 A 140 140 0 1 1 60 200"
                    :stroke="cfgStyle.onion.color"
                    stroke-linecap="round"
                    stroke-width="20"
                    fill="none"
                />
                <path
                    d=" M 200 100 A 100 100 0 1 1 100 200"
                    :stroke="setOpacity(cfgStyle.onion.color, 60)"
                    stroke-linecap="round"
                    stroke-width="20"
                    fill="none"
                />
                <path
                    d=" M 200 140 A 60 60 0 1 1 140 200"
                    fill="none"
                    :stroke="setOpacity(cfgStyle.onion.color, 40)"
                    stroke-linecap="round"
                    stroke-width="20"
                />
            </svg>
        </template>

        <!-- TYPE GAUGE -->
        <template v-if="type === 'gauge'">
            <svg
                data-cy="skeleton-gauge"
                width="100%"
                viewBox="0 0 400 400"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <path
                    d=" M 82 255 A 120 120 0 1 1 318 255"
                    fill="none"
                    :stroke="cfgStyle.gauge.color"
                    stroke-linecap="round"
                    stroke-width="20"
                />
                <circle cx="200" cy="256" r="12" :fill="cfgStyle.gauge.color" />
                <line
                    x1="200"
                    y1="256"
                    x2="250"
                    y2="160"
                    stroke-width="8"
                    :stroke="cfgStyle.gauge.color"
                    stroke-linecap="round"
                />
            </svg>
        </template>

        <!-- TYPE QUADRANT -->
        <template v-if="type === 'quadrant'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-quadrant"
                viewBox="0 0 100 100"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <line
                    x1="50"
                    x2="50"
                    y1="3"
                    y2="97"
                    :stroke="cfgStyle.quadrant.grid.color"
                    :stroke-width="cfgStyle.quadrant.grid.strokeWidth"
                />
                <line
                    x1="3"
                    x2="97"
                    y1="50"
                    y2="50"
                    :stroke="cfgStyle.quadrant.grid.color"
                    :stroke-width="cfgStyle.quadrant.grid.strokeWidth"
                />
                <circle
                    :fill="cfgStyle.quadrant.plots.color"
                    :r="cfgStyle.quadrant.plots.radius"
                    cx="20"
                    cy="20"
                />
                <circle
                    :fill="cfgStyle.quadrant.plots.color"
                    :r="cfgStyle.quadrant.plots.radius"
                    cx="80"
                    cy="60"
                />
                <circle
                    :fill="cfgStyle.quadrant.plots.color"
                    :r="cfgStyle.quadrant.plots.radius"
                    cx="65"
                    cy="55"
                />
                <circle
                    :fill="cfgStyle.quadrant.plots.color"
                    :r="cfgStyle.quadrant.plots.radius"
                    cx="36"
                    cy="67"
                />
                <circle
                    :fill="cfgStyle.quadrant.plots.color"
                    :r="cfgStyle.quadrant.plots.radius"
                    cx="15"
                    cy="75"
                />
                <circle
                    :fill="cfgStyle.quadrant.plots.color"
                    :r="cfgStyle.quadrant.plots.radius"
                    cx="40"
                    cy="55"
                />
                <circle
                    :fill="cfgStyle.quadrant.plots.color"
                    :r="cfgStyle.quadrant.plots.radius"
                    cx="76"
                    cy="32"
                />
                <circle
                    :fill="cfgStyle.quadrant.plots.color"
                    :r="cfgStyle.quadrant.plots.radius"
                    cx="85"
                    cy="26"
                />
                <circle
                    :fill="cfgStyle.quadrant.plots.color"
                    :r="cfgStyle.quadrant.plots.radius"
                    cx="55"
                    cy="46"
                />
            </svg>
        </template>

        <!-- TYPE RADAR -->
        <template v-if="type === 'radar'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-radar"
                viewBox="0 0 100 100"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <path
                    :d="radar"
                    fill="none"
                    :stroke="cfgStyle.radar.grid.color"
                    :stroke-width="cfgStyle.radar.grid.strokeWidth"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />

                <path
                    :d="radarInside1"
                    fill="none"
                    :stroke="setOpacity(cfgStyle.radar.grid.color, 70)"
                    :stroke-width="cfgStyle.radar.grid.strokeWidth / 2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    :d="radarInside2"
                    fill="none"
                    :stroke="setOpacity(cfgStyle.radar.grid.color, 70)"
                    :stroke-width="cfgStyle.radar.grid.strokeWidth / 2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
                <path
                    :d="radarInside3"
                    fill="none"
                    :stroke="setOpacity(cfgStyle.radar.grid.color, 70)"
                    :stroke-width="cfgStyle.radar.grid.strokeWidth / 2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />

                <path
                    d="M 9,50 91,50"
                    :stroke="setOpacity(cfgStyle.radar.grid.color, 50)"
                    :stroke-width="cfgStyle.radar.grid.strokeWidth / 2"
                />
                <path
                    d="M 29.5,14.5 70.5 85.5"
                    :stroke="setOpacity(cfgStyle.radar.grid.color, 50)"
                    :stroke-width="cfgStyle.radar.grid.strokeWidth / 2"
                />
                <path
                    d="M 29.5,85.5 70.5 14.5"
                    :stroke="setOpacity(cfgStyle.radar.grid.color, 50)"
                    :stroke-width="cfgStyle.radar.grid.strokeWidth / 2"
                />

                <path
                    d="M 34,23 68.5,18, 70,50 61.5,70 35,75.5 10,50  Z"
                    stroke="none"
                    stroke-linejoin="round"
                    :fill="setOpacity(cfgStyle.radar.shapes.color, 30)"
                />
                <path
                    d="M 43.5,40 64.5,25, 84,50 55.5,60 29.5,85.5 25,50  Z"
                    stroke="none"
                    stroke-linejoin="round"
                    :fill="setOpacity(cfgStyle.radar.shapes.color, 50)"
                />
            </svg>
        </template>

        <!-- TYPE WAFFLE -->
        <template v-if="type === 'waffle'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-waffle"
                viewBox="0 0 100 100"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <g v-for="(_, i) in 10">
                    <g v-for="(__, j) in 10">
                        <rect
                            :x="3 + j * 9.5"
                            :y="3 + i * 9.5"
                            :height="9"
                            :width="9"
                            :fill="setOpacity(cfgStyle.waffle.color, 20)"
                            rx="1"
                        />
                    </g>
                </g>
                <g v-for="(_, i) in 10">
                    <g v-for="(__, j) in 10">
                        <rect
                            v-if="i > 2"
                            :x="3 + j * 9.5"
                            :y="3 + i * 9.5"
                            :height="9"
                            :width="9"
                            :fill="setOpacity(cfgStyle.waffle.color, 30)"
                            rx="1"
                        />
                    </g>
                </g>
                <g v-for="(_, i) in 10">
                    <g v-for="(__, j) in 10">
                        <rect
                            v-if="i > 6"
                            :x="3 + j * 9.5"
                            :y="3 + i * 9.5"
                            :height="9"
                            :width="9"
                            :fill="setOpacity(cfgStyle.waffle.color, 50)"
                            rx="1"
                        />
                    </g>
                </g>
            </svg>
        </template>

        <!-- TYPE TABLE -->
        <template v-if="type === 'table'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-table"
                width="100%"
                viewBox="0 0 100 70"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <rect
                    :fill="setOpacity(cfgStyle.table.th.color, 50)"
                    :x="3.5"
                    :y="5"
                    height="10"
                    width="93"
                />
                <rect
                    :fill="setOpacity(cfgStyle.table.th.color, 50)"
                    :x="3.5"
                    :y="15"
                    height="50"
                    width="23.25"
                />
                <line
                    v-for="(_, i) in 7"
                    x1="3.7"
                    x2="96.3"
                    :y1="5 + i * 10"
                    :y2="5 + i * 10"
                    :stroke="cfgStyle.table.td.color"
                    :stroke-width="cfgStyle.table.td.strokeWidth"
                    stroke-linecap="round"
                />
                <line
                    v-for="(_, i) in 5"
                    :x1="3.5 + i * 23.25"
                    :x2="3.5 + i * 23.25"
                    y1="5"
                    y2="65"
                    :stroke="cfgStyle.table.td.color"
                    :stroke-width="cfgStyle.table.td.strokeWidth"
                    stroke-linecap="round"
                />
            </svg>
        </template>

        <!-- TYPE RATING -->
        <template v-if="type === 'rating'">
            <div
                data-cy="skeleton-smiley"
                v-if="cfgStyle.rating.useSmiley"
                :style="`display:flex;flex-direction:row;align-items:center;justify-content:center;width:${cfgStyle.rating.maxWidth}px`"
            >
                <!-- 0 -->
                <svg
                    :xmlns="XMLNS"
                    v-if="cfgStyle.rating.filled"
                    :style="`width:${cfgStyle.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    :stroke="cfgStyle.rating.color"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                >
                    <PackageVersion />
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path
                        d="M17 3.34A10 10 0 112.005 12.324L2 12l.005-.324A10 10 0 0117 3.34zm-5 9.86a4.5 4.5 0 00-3.214 1.35 1 1 0 101.428 1.4 2.5 2.5 0 013.572 0 1 1 0 001.428-1.4A4.5 4.5 0 0012 13.2zM9.01 9l-.127.007a1 1 0 000 1.986L9 11l.127-.007a1 1 0 000-1.986L9.01 9zm6 0-.127.007a1 1 0 000 1.986L15 11l.127-.007a1 1 0 000-1.986L15.01 9z"
                        stroke-width="0"
                        :fill="cfgStyle.rating.color"
                    />
                </svg>

                <svg
                    :xmlns="XMLNS"
                    v-else
                    :style="`width:${cfgStyle.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    :stroke="cfgStyle.rating.color"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 12a9 9 0 1018 0A9 9 0 103 12" />
                    <path d="M9 10l.01 0" />
                    <path d="M15 10l.01 0" />
                    <path d="M9.5 15.25a3.5 3.5 0 015 0" />
                </svg>

                <!-- 1 -->
                <svg
                    :xmlns="XMLNS"
                    v-if="cfgStyle.rating.filled"
                    :style="`width:${cfgStyle.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    :stroke="cfgStyle.rating.color"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path
                        d="M17 3.34A10 10 0 112.005 12.324L2 12l.005-.324A10 10 0 0117 3.34zM15 14H9l-.117.007a1 1 0 000 1.986L9 16h6l.117-.007a1 1 0 000-1.986L15 14zm-5.99-5-.127.007a1 1 0 000 1.986L9 11l.127-.007a1 1 0 000-1.986L9.01 9zm6 0-.127.007a1 1 0 000 1.986L15 11l.127-.007a1 1 0 000-1.986L15.01 9z"
                        stroke-width="0"
                        :fill="cfgStyle.rating.color"
                    />
                </svg>

                <svg
                    :xmlns="XMLNS"
                    v-else
                    :style="`width:${cfgStyle.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    :stroke="cfgStyle.rating.color"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 12a9 9 0 1018 0A9 9 0 103 12" />
                    <path d="M9 10l.01 0" />
                    <path d="M15 10l.01 0" />
                    <path d="M9 15l6 0" />
                </svg>

                <!-- 2 -->
                <svg
                    :xmlns="XMLNS"
                    v-if="cfgStyle.rating.filled"
                    :style="`width:${cfgStyle.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    :stroke="cfgStyle.rating.color"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path
                        d="M17 3.34A10 10 0 112.005 12.324L2 12l.005-.324A10 10 0 0117 3.34zM9.01 9l-.127.007a1 1 0 000 1.986L9 11l.127-.007a1 1 0 000-1.986L9.01 9zm6 0-.127.007a1 1 0 000 1.986L15 11l.127-.007a1 1 0 000-1.986L15.01 9z"
                        stroke-width="0"
                        :fill="cfgStyle.rating.color"
                    />
                </svg>

                <svg
                    :xmlns="XMLNS"
                    v-else
                    :style="`width:${cfgStyle.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    :stroke="cfgStyle.rating.color"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 12a9 9 0 1018 0A9 9 0 103 12" />
                    <path d="M9 10l.01 0" />
                    <path d="M15 10l.01 0" />
                </svg>

                <!-- 3 -->
                <svg
                    :xmlns="XMLNS"
                    v-if="cfgStyle.rating.filled"
                    :style="`width:${cfgStyle.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    :stroke="cfgStyle.rating.color"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path
                        d="M17 3.34A10 10 0 112.005 12.324L2 12l.005-.324A10 10 0 0117 3.34zm-1.8 10.946a1 1 0 00-1.414.014 2.5 2.5 0 01-3.572 0 1 1 0 00-1.428 1.4 4.5 4.5 0 006.428 0 1 1 0 00-.014-1.414zM9.01 9l-.127.007A1 1 0 009 11l.127-.007A1 1 0 009.01 9zm6 0-.127.007A1 1 0 0015 11l.127-.007A1 1 0 0015.01 9z"
                        stroke-width="0"
                        :fill="cfgStyle.rating.color"
                    />
                </svg>

                <svg
                    :xmlns="XMLNS"
                    v-else
                    :style="`width:${cfgStyle.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    :stroke="cfgStyle.rating.color"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 12a9 9 0 1018 0A9 9 0 103 12" />
                    <path d="M9 10l.01 0" />
                    <path d="M15 10l.01 0" />
                    <path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
                </svg>

                <!-- 4 -->
                <svg
                    :xmlns="XMLNS"
                    v-if="cfgStyle.rating.filled"
                    :style="`width:${cfgStyle.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    :stroke="cfgStyle.rating.color"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path
                        d="M17 3.34A10 10 0 112.005 12.324L2 12l.005-.324A10 10 0 0117 3.34zM15 13H9a1 1 0 00-1 1v.05a3.975 3.975 0 003.777 3.97l.227.005a4.026 4.026 0 003.99-3.79l.006-.206A1 1 0 0015 13zm-5.99-5-.127.007A1 1 0 009 10l.127-.007A1 1 0 009.01 8zm6 0-.127.007A1 1 0 0015 10l.127-.007A1 1 0 0015.01 8z"
                        stroke-width="0"
                        :fill="cfgStyle.rating.color"
                    />
                </svg>

                <svg
                    :xmlns="XMLNS"
                    v-else
                    :style="`width:${cfgStyle.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    :stroke="cfgStyle.rating.color"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M3 12a9 9 0 1018 0A9 9 0 103 12" />
                    <path d="M9 9l.01 0" />
                    <path d="M15 9l.01 0" />
                    <path d="M8 13a4 4 0 1 0 8 0h-8" />
                </svg>
            </div>

            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-rating"
                v-else
                width="100%"
                viewBox="0 0 100 30"
                :style="`background:${cfgStyle.backgroundColor};max-width:${cfgStyle.rating.maxWidth}px`"
            >
                <PackageVersion />
                <polygon
                    v-for="(_, i) in 5"
                    :points="
                        createStar({
                            plot: { x: 10 + i * 20, y: 15 },
                            radius: 6,
                        })
                    "
                    :fill="
                        cfgStyle.rating.filled ? cfgStyle.rating.color : 'none'
                    "
                    :stroke="cfgStyle.rating.color"
                    :stroke-width="cfgStyle.rating.strokeWidth"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </template>

        <!-- TYPE VERTICAL BAR -->
        <template v-if="type === 'verticalBar'">
            <svg
                :xmlns="XMLNS"
                data-cy="skeleton-verticalBar"
                width="100%"
                viewBox="0 0 100 100"
                :style="`background:${cfgStyle.backgroundColor}`"
            >
                <PackageVersion />
                <g v-if="cfgStyle.verticalBar.axis.show">
                    <line
                        :x1="3"
                        :x2="3"
                        :y1="3"
                        :y2="97"
                        :stroke="cfgStyle.verticalBar.axis.color"
                        :stroke-width="cfgStyle.verticalBar.axis.strokeWidth"
                    />
                </g>
                <rect
                    v-for="(_, i) in 6"
                    :x="3"
                    :y="5 + i * 15.6"
                    height="12"
                    :width="94 - (94 * i) / 6"
                    :fill="cfgStyle.verticalBar.color"
                    :rx="cfgStyle.verticalBar.borderRadius"
                />
            </svg>
        </template>
    </div>
</template>

<style scoped>
.vue-ui-skeleton-animated {
    animation: skeleton-animate 1.62s infinite linear;
}
@keyframes skeleton-animate {
    0% {
        opacity: 0.3;
    }
    50% {
        opacity: 1;
    }
    100% {
        opacity: 0.3;
    }
}
</style>
