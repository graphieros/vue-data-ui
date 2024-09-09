<script setup>
import { ref, computed } from "vue";
import { 
    opacity, 
    createPolygonPath, 
    createStar,
    XMLNS
} from "../lib.js";
import { useNestedProp } from "../useNestedProp";
import { useConfig } from "../useConfig";

const { vue_ui_skeleton: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    }
});

const uid = ref(`vue-ui-skeleton-${Math.random()}`);

const FINAL_CONFIG = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
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
        plot: {x: 50, y: 50},
        radius: 40,
        sides: 6
    }).path
});

const radarInside1 = computed(() => {
    return createPolygonPath({
        plot: {x: 50, y: 50},
        radius: 30,
        sides: 6
    }).path
});

const radarInside2 = computed(() => {
    return createPolygonPath({
        plot: {x: 50, y: 50},
        radius: 20,
        sides: 6
    }).path
});

const radarInside3 = computed(() => {
    return createPolygonPath({
        plot: {x: 50, y: 50},
        radius: 10,
        sides: 6
    }).path
});


const chestnut = ref([
    {
        root: {
            x: 70,
            y:77,
            r: 44,
            opacity: 100
        },
        bars: [
            {
                x: 200,
                y: 37,
                opacity: 100,
                width: 240
            },
            {
                x: 200,
                y: 118,
                opacity: 100,
                width: 180
            },
            {
                x: 200,
                y: 253,
                opacity: 100,
                width: 80
            },
        ],
    },
    {
        root: {
            x: 70,
            y:177,
            r: 32,
            opacity: 70
        },
        bars: [
            {
                x: 200,
                y: 145,
                opacity: 70,
                width: 160
            },
            {
                x: 200,
                y: 172,
                opacity: 70,
                width: 140
            },
            {
                x: 200,
                y: 199,
                opacity: 70,
                width: 120
            },
        ]
    },
    {
        root: {
            x: 70,
            y:257,
            r: 24,
            opacity: 40
        },
        bars: [
            {
                x: 200,
                y: 64,
                opacity: 40,
                width: 220
            },
            {
                x: 200,
                y: 91,
                opacity: 40,
                width: 200
            },
            {
                x: 200,
                y: 226,
                opacity: 40,
                width: 100
            },
        ]
    },
]);

const candlesticks = ref([
    {
        y: 200,
        height: 100,
        bar: 50
    },
    {
        y: 180,
        height: 100,
        bar: 40
    },
    {
        y: 150,
        height: 100,
        bar: 30
    },
    {
        y: 120,
        height: 80,
        bar: 50
    },
    {
        y: 110,
        height: 60,
        bar: 30
    },
    {
        y: 80,
        height: 80,
        bar: 10
    },
    {
        y: 50,
        height: 80,
        bar: 40
    },
    {
        y: 24,
        height: 40,
        bar: 24
    },
    {
        y: 44,
        height: 20,
        bar: 13
    },
    {
        y: 32,
        height: 45,
        bar: 19
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
    [31, 32]
]);

// 32 * 150
const sparkline = ref(
    [
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
    ]
)

function calcTickStart(angle, distance = 1) {
    const angleStart = 29.85;
    return {
        x: 200 + 160 * Math.cos(angleStart + angle * Math.PI / 180) * distance,
        y: 200 + 160 * Math.sin(angleStart + angle * Math.PI / 180) * distance
    }
}

const ticks = computed(() => {
    const tickArray = [];
    const tickAmount = 100;
    for(let i = 0; i < tickAmount; i += 1) {
        tickArray.push({
            x1: calcTickStart((360 / tickAmount) * i).x,
            y1: calcTickStart((360 / tickAmount) * i).y,
            x2: calcTickStart((360 / tickAmount) * i, 0.9).x,
            y2: calcTickStart((360 / tickAmount) * i, 0.9).y,
            color: FINAL_CONFIG.value.style.wheel.color
        })
    }
    return tickArray;
})

</script>

<template>
    <div :id="uid" :class="{ 'vue-ui-skeleton': true, 'vue-ui-skeleton-animated': isAnimated }" :style="`background:${FINAL_CONFIG.style.backgroundColor};color:${FINAL_CONFIG.style.color};display:flex;align-items:center;justify-content:center;`">
        <template v-if="type === 'flow'">
            <svg :xmlns="XMLNS" width="100%" viewBox="0 0 80 60" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <path 
                    d="M 5 5 L 5 55 M 75 5 L 75 55 M 28 5 L 28 55 M 52 5 L 52 55 M 5 8 L 28 12 L 52 9 L 75 8 L 75 12 L 52 12 L 28 21 L 5 29 Z M 5 34 L 28 35 L 52 24 L 75 21 L 75 27 L 52 30 L 28 44 L 52 39 L 75 41 L 75 47 L 52 45 L 28 52 L 5 52 Z"
                    :stroke="FINAL_CONFIG.style.flow.color" :stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" :fill="FINAL_CONFIG.style.flow.color"
                />
            </svg>
        </template>

        <template v-if="type === 'parallelCoordinatePlot'">
            <svg :xmlns="XMLNS" width="100%" viewBox="0 0 80 60" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <path 
                    d="M 5 5 L 5 55 M 75 5 L 75 55 M 28 5 L 28 55 M 52 5 L 52 55 M 5 10 A 1 1 0 0 0 5 12 A 1 1 0 0 0 5 10 M 28 15 A 1 1 0 0 0 28 17 A 1 1 0 0 0 28 15 M 52 8 A 1 1 0 0 0 52 10 A 1 1 0 0 0 52 8 M 75 11 A 1 1 0 0 0 75 13 A 1 1 0 0 0 75 11 M 6 11 L 27 16 M 29 16 L 51 9 M 53 9 L 74 12 M 5 50 A 1 1 0 0 0 5 48 A 1 1 0 0 0 5 50 M 28 39 A 1 1 0 0 0 28 41 A 1 1 0 0 0 28 39 M 52 45 A 1 1 0 0 0 52 47 A 1 1 0 0 0 52 45 M 75 45 A 1 1 0 0 0 75 47 A 1 1 0 0 0 75 45 M 6 49 L 27 40 M 29 40 L 51 46 M 53 46 L 74 46 M 5 25 A 1 1 0 0 0 5 27 A 1 1 0 0 0 5 25 M 28 31 A 1 1 0 0 0 28 33 A 1 1 0 0 0 28 31 M 52 23 A 1 1 0 0 0 52 25 A 1 1 0 0 0 52 23 M 75 21 A 1 1 0 0 0 75 23 A 1 1 0 0 0 75 21 M 6 26 L 27 32 M 29 32 L 51 24 M 53 24 L 74 22"
                    :stroke="FINAL_CONFIG.style.parallelCoordinatePlot.color" :stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round" :fill="FINAL_CONFIG.style.parallelCoordinatePlot.color"
                />
            </svg>
        </template>
        
        <!-- DUMBBELL -->
        <template v-if="type === 'dumbbell'">
            <svg :xmlns="XMLNS" data-cy="skeleton-line" width="100%" viewBox="0 0 100 55" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <line x1="3" x2="3" y1="3" y2="67" :stroke="FINAL_CONFIG.style.dumbbell.color" :stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="
                    M 30,11
                    C 39,10 39,10
                    45,11
                    L 45,9
                    C 39,10 39,10
                    30,9 Z
                " :fill="FINAL_CONFIG.style.dumbbell.color"/>
                <circle cx="30" cy="10" r="2" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.dumbbell.color"/>
                <circle cx="46" cy="10" r="2" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.dumbbell.color"/>
                <path d="
                    M 10,21
                    C 23,20 23,20
                    36,21
                    L 36,19
                    C 23,20 23,20
                    10,19 Z
                " :fill="FINAL_CONFIG.style.dumbbell.color"/>
                <circle cx="10" cy="20" r="2" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.dumbbell.color"/>
                <circle cx="36" cy="20" r="2" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.dumbbell.color"/>
                <path d="
                    M 30,31
                    C 45,30 45,30
                    60,31
                    L 60,29
                    C 45,30 45,30
                    30,29 Z
                " :fill="FINAL_CONFIG.style.dumbbell.color"/>
                <circle cx="30" cy="30" r="2" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.dumbbell.color"/>
                <circle cx="60" cy="30" r="2" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.dumbbell.color"/>
                <path d="
                    M 50,41
                    C 65,40 65,40
                    80,41
                    L 80,39
                    C 65,40 65,40
                    50,39 Z
                " :fill="FINAL_CONFIG.style.dumbbell.color"/>
                <circle cx="50" cy="40" r="2" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.dumbbell.color"/>
                <circle cx="80" cy="40" r="2" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.dumbbell.color"/>
                <path d="
                    M 40,51
                    C 65,50 65,50
                    90,51
                    L 90,49
                    C 65,50 65,50
                    40,49 Z
                " :fill="FINAL_CONFIG.style.dumbbell.color"/>
                <circle cx="40" cy="50" r="2" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.dumbbell.color"/>
                <circle cx="90" cy="50" r="2" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.dumbbell.color"/>
            </svg>
        </template>

        <!-- STRIP PLOT -->
        <template v-if="type === 'stripPlot'">
            <svg :xmlns="XMLNS" data-cy="skeleton-line" width="100%" viewBox="0 0 100 100" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <line x1="3" x2="3" y1="3" y2="97" :stroke="FINAL_CONFIG.style.stripPlot.color" :stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="3" x2="97" y1="97" y2="97" :stroke="FINAL_CONFIG.style.stripPlot.color" :stroke-width="0.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="8" r="4"  :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
                <circle cx="12" cy="40" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
                <circle cx="12" cy="60" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
                <circle cx="12" cy="70" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
                
                <circle cx="32" cy="25" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
                <circle cx="32" cy="38" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
                <circle cx="32" cy="44" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
                <circle cx="32" cy="55" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
                
                <circle cx="52" cy="30" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
                <circle cx="52" cy="33" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
                <circle cx="52" cy="43" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
                <circle cx="52" cy="63" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
                <circle cx="52" cy="78" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>

                <circle cx="72" cy="58" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
                <circle cx="72" cy="70" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
                <circle cx="72" cy="78" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
                <circle cx="72" cy="88" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>

                <circle cx="92" cy="66" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
                <circle cx="92" cy="77" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
                <circle cx="92" cy="85" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
                <circle cx="92" cy="88" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
                <circle cx="92" cy="90" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
                <circle cx="92" cy="92" r="4" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="0.3" :fill="FINAL_CONFIG.style.stripPlot.color" style="opacity:0.5"/>
            </svg>
        </template>
        
        <!-- TREEMAP -->
        <template v-if="type === 'treemap'">
            <svg :xmlns="XMLNS" data-cy="skeleton-treemap" width="100%" viewBox="0 0 30 21" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <path fill="none" :stroke="FINAL_CONFIG.style.treemap.color" stroke-width="0.3" stroke-linecap="round" stroke-linejoin="round" d="M 1 1 L 29 1 L 29 20 L 1 20 Z M 10 1 L 10 20 M 1 13 L 10 13 M 22 11 L 22 20 M 10 11 L 22 11 M 22 11 L 29 11 M 7 13 L 7 20 M 17 11 L 17 20 M 22 15 L 29 15 M 26 15 L 26 20 M 20 1 L 20 11" />
            </svg>
        </template>

        <!-- GALAXY -->
        <template v-if="type === 'galaxy'">
            <svg :xmlns="XMLNS" data-cy="skeleton-relation-circle" width="100%" viewBox="0.5 0 20 20" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <path fill="none" :stroke="FINAL_CONFIG.style.galaxy.color" stroke-width="2" stroke-linecap="round" d="M 7 11 A 1 1 0 0 0 11 11 M 14 11 A 1 1 0 0 0 7 11 M 3 11 A 1 1 0 0 0 14 11 M 18 11 A 1 1 0 0 0 3 11 M 16.4 16 C 17 15 18 13 18 11" />
            </svg>
        </template>

        <!-- 3D BAR -->
        <template v-if="type === 'bar3d'">
            <svg :xmlns="XMLNS" data-cy="skeleton-relation-circle" width="100%" viewBox="2 0 16 20" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <path fill="none" :stroke="FINAL_CONFIG.style.bar3d.color" stroke-width="0.2" d="M10 1 6 3 6 17 10 19 14 17 14 3 10 1M6 3 10 5 14 3M10 5 10 19" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </template>

        <!-- SPARK HISTOGRAM-->
        <template v-if="type === 'sparkHistogram'">
            <svg :xmlns="XMLNS" data-cy="skeleton-relation-circle" width="100%" viewBox="0 0 100 20" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <rect x="3" y="8" height="4" width="6" rx="1.5" :fill="FINAL_CONFIG.style.sparkHistogram.color"/>
                <rect x="11" y="6" height="8" width="6" rx="2" :fill="FINAL_CONFIG.style.sparkHistogram.color"/>
                <rect x="19" y="7" height="6" width="6" rx="2" :fill="FINAL_CONFIG.style.sparkHistogram.color"/>
                <rect x="27" y="6" height="8" width="6" rx="2" :fill="FINAL_CONFIG.style.sparkHistogram.color"/>
                <rect x="35" y="8" height="4" width="6" rx="1.5" :fill="FINAL_CONFIG.style.sparkHistogram.color"/>
                <rect x="43" y="7" height="6" width="6" rx="2" :fill="FINAL_CONFIG.style.sparkHistogram.color"/>
                <rect x="51" y="8.5" height="3" width="6" rx="1.5" :fill="FINAL_CONFIG.style.sparkHistogram.color"/>
                <rect x="59" y="7" height="6" width="6" rx="2" :fill="FINAL_CONFIG.style.sparkHistogram.color"/>
                <rect x="67" y="6" height="8" width="6" rx="2" :fill="FINAL_CONFIG.style.sparkHistogram.color"/>
                <rect x="75" y="7" height="6" width="6" rx="2" :fill="FINAL_CONFIG.style.sparkHistogram.color"/>
                <rect x="83" y="7" height="6" width="6" rx="2" :fill="FINAL_CONFIG.style.sparkHistogram.color"/>
                <rect x="91" y="8" height="4" width="6" rx="1.5" :fill="FINAL_CONFIG.style.sparkHistogram.color"/>
            </svg>
        </template>

        <!-- SPARKBAR -->
        <template v-if="type === 'sparkbar'">
            <svg :xmlns="XMLNS" data-cy="skeleton-relation-circle" width="100%" viewBox="0 0 500 200" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <line x1="12" x2="488" y1="50" y2="50" stroke-width="16" stroke-linecap="round" :stroke="FINAL_CONFIG.style.sparkbar.color" opacity="0.5"/> 
                <line x1="12" x2="400" y1="50" y2="50" stroke-width="16" stroke-linecap="round" :stroke="FINAL_CONFIG.style.sparkbar.color" opacity="1"/>

                <line x1="12" x2="488" y1="100" y2="100" stroke-width="16" stroke-linecap="round" :stroke="FINAL_CONFIG.style.sparkbar.color" opacity="0.5"/> 
                <line x1="12" x2="350" y1="100" y2="100" stroke-width="16" stroke-linecap="round" :stroke="FINAL_CONFIG.style.sparkbar.color" opacity="1"/>

                <line x1="12" x2="488" y1="150" y2="150" stroke-width="16" stroke-linecap="round" :stroke="FINAL_CONFIG.style.sparkbar.color" opacity="0.5"/> 
                <line x1="12" x2="235" y1="150" y2="150" stroke-width="16" stroke-linecap="round" :stroke="FINAL_CONFIG.style.sparkbar.color" opacity="1"/>
            </svg>
        </template>

        <!-- SPARK STACKBAR -->
        <template v-if="type === 'sparkStackbar'">
            <svg :xmlns="XMLNS" data-cy="skeleton-relation-circle" width="100%" viewBox="0 0 500 64" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <line x1="12" x2="488" y1="32" y2="32" stroke-width="16" stroke-linecap="round" :stroke="FINAL_CONFIG.style.sparkStackbar.color" opacity="0.5"/> 
                <line x1="12" x2="380" y1="32" y2="32" stroke-width="16" stroke-linecap="round" :stroke="FINAL_CONFIG.style.sparkStackbar.color" opacity="0.6"/> 
                <line x1="12" x2="200" y1="32" y2="32" stroke-width="16" stroke-linecap="round" :stroke="FINAL_CONFIG.style.sparkStackbar.color" opacity="0.8"/> 
                <line x1="12" x2="120" y1="32" y2="32" stroke-width="16" stroke-linecap="round" :stroke="FINAL_CONFIG.style.sparkStackbar.color" opacity="1"/> 
            </svg>
        </template>

        <!-- THERMOMETER -->
        <template v-if="type === 'thermometer'">
            <svg data-cy="skeleton-relation-circle" width="100%" viewBox="0 0 20 20" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <path fill="none" :stroke="FINAL_CONFIG.style.thermometer.color" stroke-width="0.2" stroke-linecap="round" d="M 13 4 A 1 1 0 0 0 7 4 L 7 16 A 1 1 0 0 0 13 16 L 13 4 M 7 15 L 8 15 M 7 12 L 8 12 M 7 9 L 8 9 M 7 6 L 8 6 M 12 15 L 13 15 M 12 12 L 13 12 M 12 9 L 13 9 M 12 6 L 13 6 " /><path :stroke="FINAL_CONFIG.style.thermometer.color" stroke-width="1" style="opacity: 0.6" d="M 10 17 L 10 12 " stroke-linecap="round" /><path stroke-linecap="round" :stroke="FINAL_CONFIG.style.thermometer.color" stroke-width="1" opacity="M 10 17 L 10 9" /><path stroke-linecap="round" :stroke="FINAL_CONFIG.style.thermometer.color" stroke-width="1" opacity="0.3" d="M 10 17 L 10 6" /><path stroke-linecap="round" :stroke="FINAL_CONFIG.style.thermometer.color" stroke-width="1" style="opacity: 0.1" d="M 10 17 L 10 3" />
            </svg>
        </template>

        <!-- RELATION CIRCLE -->
        <template v-if="type === 'relationCircle'">
            <svg :xmlns="XMLNS" data-cy="skeleton-relation-circle" width="100%" viewBox="0 0 20 20" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <path fill="none" :stroke="FINAL_CONFIG.style.relationCircle.color" stroke-width="0.2" stroke-linecap="round" d="M1 10A1 1 0 0019 10 1 1 0 001 10M1 10C7 11 9 13 10 19M10 19C10 11 8 7 6 2M10 19C10 11 12 7 14 2M10 19C11 13 12 11 19 10" />
            </svg>
        </template>

        <!-- MOLECULE -->
        <template v-if="type === 'molecule'">
            <svg :xmlns="XMLNS" data-cy="skeleton-molecule" width="100%" viewBox="0 0 100 100" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <circle cx="50" cy="50" r="6" stroke-width="2" fill="none" :stroke="FINAL_CONFIG.style.molecule.color" />
                <circle cx="20" cy="50" r="3" stroke-width="1.6" fill="none" :stroke="FINAL_CONFIG.style.molecule.color" />
                <circle cx="80" cy="50" r="3" stroke-width="1.6" fill="none" :stroke="FINAL_CONFIG.style.molecule.color" />
                <circle cx="50" cy="20" r="3" stroke-width="1.6" fill="none" :stroke="FINAL_CONFIG.style.molecule.color" />
                <circle cx="50" cy="80" r="3" stroke-width="1.6" fill="none" :stroke="FINAL_CONFIG.style.molecule.color" />
                <line x1="50" x2="50" y1="23" y2="45" stroke-width="1" :stroke="FINAL_CONFIG.style.molecule.color"/>
                <line x1="50" x2="50" y1="77" y2="55" stroke-width="1" :stroke="FINAL_CONFIG.style.molecule.color"/>
                <line x1="23" x2="45" y1="50" y2="50" stroke-width="1" :stroke="FINAL_CONFIG.style.molecule.color"/>
                <line x1="77" x2="55" y1="50" y2="50" stroke-width="1" :stroke="FINAL_CONFIG.style.molecule.color"/>
            </svg>
        </template>

        <!-- TIREMARKS -->
        <template v-if="type === 'tiremarks'">
            <svg :xmlns="XMLNS" data-cy="skeleton-tiremarks" width="100%" viewBox="0 0 312 56" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <g v-for="n in 100">
                    <line :x1="10 + (n * 2.9)" :y1="6" :x2="10 + (n * 2.9)" :y2="50" :stroke="FINAL_CONFIG.style.tiremarks.color" :style="n > 80 ? 'opacity: 0.5' : ''" stroke-linecap="round"/>
                </g>
            </svg>
        </template>

        <!-- TYPE PYRAMID -->
        <template v-if="type === 'pyramid'">
            <svg :xmlns="XMLNS" data-cy="skeleton-pyramid" width="100%" viewBox="0 0 105 80" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <g v-for="(rect, i) in pyramid">
                    <rect :x="50 - rect[0]" :y="i * (80 / pyramid.length)" :width="rect[0]" :height="(80 / pyramid.length) * 0.95" :fill="FINAL_CONFIG.style.pyramid.color"/>
                    <rect :x="55" :y="i * (80 / pyramid.length)" :width="rect[1]" :height="(80 / pyramid.length) * 0.95" :fill="FINAL_CONFIG.style.pyramid.color"/>
                </g>
            </svg>
        </template>

        <!-- TYPE RINGS -->
        <template v-if="type === 'rings'">
            <svg :xmlns="XMLNS" data-cy="skeleton-rings" width="100%" viewBox="0 0 400 400" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <circle
                    :cx="200"
                    :cy="200"
                    :r="180"
                    :fill="`${FINAL_CONFIG.style.rings.color}${opacity[40]}`"
                />
                <circle
                    :cx="200"
                    :cy="250"
                    :r="130"
                    :fill="`${FINAL_CONFIG.style.rings.color}${opacity[60]}`"
                />
                <circle
                    :cx="200"
                    :cy="290"
                    :r="90"
                    :fill="`${FINAL_CONFIG.style.rings.color}${opacity[100]}`"
                />
            </svg>
        </template>

        <!-- TYPE WHEEL -->
        <template v-if="type === 'wheel'">
            <svg :xmlns="XMLNS" data-cy="skeleton-wheel" width="100%" viewBox="0 0 400 400" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <line 
                v-for="(tick, i) in ticks"
                :x1="tick.x1"
                :x2="tick.x2"
                :y1="tick.y1"
                :y2="tick.y2"
                :stroke="i < 66 ? tick.color : `${tick.color}${opacity[50]}`"
                :stroke-width="5"
                stroke-linecap="round"
            />
            <circle
                :cx="200"
                :cy="200"
                :r="130"
                :stroke-width="3"
                :stroke="`${FINAL_CONFIG.style.wheel.color}${opacity[50]}`"
                fill="none"
            />
            <rect 
                :fill="`${FINAL_CONFIG.style.wheel.color}${opacity[50]}`"
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
            <svg :xmlns="XMLNS" data-cy="skeleton-sparkline" width="100%" viewBox="0 0 150 32" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <g>
                    <rect x="2" y="2" height="6" width="24" :fill="FINAL_CONFIG.style.sparkline.color" rx="3"/>
                    <rect x="2" y="12" height="16" width="16" :fill="FINAL_CONFIG.style.sparkline.color" rx="3"/>
                </g>
                <g v-for="(line, i) in sparkline">
                    <line 
                        v-if="i < sparkline.length - 1"
                        :x1="line.x"
                        :y1="line.y"
                        :x2="sparkline[i + 1].x"
                        :y2="sparkline[i + 1].y"
                        :stroke-width="FINAL_CONFIG.style.sparkline.strokeWidth"
                        :stroke="FINAL_CONFIG.style.sparkline.color"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </g>
            </svg>
        </template>

        <!-- TYPE CANDLESTICK -->
        <template v-if="type === 'candlesticks'">
            <svg :xmlns="XMLNS" data-cy="skeleton-candlesticks" width="100%" viewBox="0 0 512 316" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <g v-if="FINAL_CONFIG.style.candlesticks.axis.show">
                    <line
                        :x1="2"
                        :x2="2"
                        :y1="2"
                        :y2="314"
                        :stroke="FINAL_CONFIG.style.candlesticks.axis.color"
                        :stroke-width="FINAL_CONFIG.style.candlesticks.axis.strokeWidth"
                        stroke-linecap="round"
                    />
                    <line
                        :x1="2"
                        :x2="510"
                        :y1="314"
                        :y2="314"
                        :stroke="FINAL_CONFIG.style.candlesticks.axis.color"
                        :stroke-width="FINAL_CONFIG.style.candlesticks.axis.strokeWidth"
                        stroke-linecap="round"
                    />
                </g>
                <g v-for="(candle, i) in candlesticks">
                    <line 
                        :x1="24 + (464 * i / (candlesticks.length - 1)) - (464 / (candlesticks.length - 1) / 8)"
                        :x2="24 + (464 * i / (candlesticks.length - 1)) + (464 / (candlesticks.length - 1) / 8)"
                        :y1="candle.y"
                        :y2="candle.y"
                        :stroke="FINAL_CONFIG.style.candlesticks.candle.color"
                        :stroke-width="FINAL_CONFIG.style.candlesticks.candle.strokeWidth"
                        stroke-linecap="round"
                    />
                    <line 
                        :x1="24 + (464 * i / (candlesticks.length - 1)) - (464 / (candlesticks.length - 1) / 8)"
                        :x2="24 + (464 * i / (candlesticks.length - 1)) + (464 / (candlesticks.length - 1) / 8)"
                        :y1="candle.y + candle.height"
                        :y2="candle.y + candle.height"
                        :stroke="FINAL_CONFIG.style.candlesticks.candle.color"
                        :stroke-width="FINAL_CONFIG.style.candlesticks.candle.strokeWidth"
                        stroke-linecap="round"
                    />
                    <line
                        :x1="24 + (464 * i / (candlesticks.length - 1))"
                        :x2="24 + (464 * i / (candlesticks.length - 1))"
                        :y1="candle.y"
                        :y2="candle.y + candle.height"
                        :stroke="FINAL_CONFIG.style.candlesticks.candle.color"
                        :stroke-width="FINAL_CONFIG.style.candlesticks.candle.strokeWidth"
                        stroke-linecap="round"
                    />
                    <rect
                        :x="24 + (464 * i / (candlesticks.length - 1)) - (464 / (candlesticks.length - 1) / 8)"
                        :y="candle.y + (candle.height - candle.bar * 1.5)"
                        :height="candle.bar"
                        :width="(464 / (candlesticks.length - 1) / 4)"
                        :fill="FINAL_CONFIG.style.candlesticks.candle.color"
                        rx="1"
                    />
                </g>
            </svg>
        </template>

        <!-- TYPE HEATMAP -->
        <template v-if="type === 'heatmap'">
            <svg :xmlns="XMLNS" data-cy="skeleton-heatmap" width="100%" :viewBox="`0 0 ${10 * FINAL_CONFIG.style.heatmap.cellsX} ${10 * FINAL_CONFIG.style.heatmap.cellsY}`" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <g v-for="(_, i) in FINAL_CONFIG.style.heatmap.cellsY">
                    <g v-for="(__, j) in FINAL_CONFIG.style.heatmap.cellsX">
                        <rect
                            :x="j * 10"
                            :y="i * 10"
                            :height="10"
                            :width="10"
                            :stroke="FINAL_CONFIG.style.backgroundColor"
                            :stroke-width="1"
                            :fill="`${FINAL_CONFIG.style.heatmap.color}${opacity[Math.round(Math.random()*100)]}`"
                        />
                    </g>
                </g>
            </svg>
        </template>

        <!-- TYPE CHESTNUT -->
        <template v-if="type === 'chestnut'">
            <svg :xmlns="XMLNS" data-cy="skeleton-chestnut" width="100%" viewBox="0 0 512 316" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
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
                            :stroke="`${FINAL_CONFIG.style.chestnut.color}${opacity[bar.opacity * 0.2]}`"
                            fill="none"
                            stroke-width="2"
                            shape-rendering="cirspEdges"
                        />
                    </g>
                </g>
                <circle v-for="item in chestnut" :cx="item.root.x" :cy="item.root.y" :r="item.root.r" :fill="`${FINAL_CONFIG.style.backgroundColor}`" :stroke="FINAL_CONFIG.backgroundColor" :stroke-width="3"/>
                <circle v-for="item in chestnut" :cx="item.root.x" :cy="item.root.y" :r="item.root.r" :fill="`${FINAL_CONFIG.style.chestnut.color}${opacity[item.root.opacity]}`" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="3"/>
                <g v-for="item in chestnut">
                    <rect v-for="bar in item.bars" rx="2" :x="bar.x" :y="bar.y" :width="bar.width" :height="22" :fill="`${FINAL_CONFIG.style.chestnut.color}${opacity[bar.opacity]}`"/>
                    <circle v-for="bar in item.bars" :cx="bar.x + bar.width + 32" :cy="bar.y + 11" :r="11" :fill="`${FINAL_CONFIG.style.chestnut.color}${opacity[bar.opacity]}`"/>
                    <circle v-for="bar in item.bars" :cx="bar.x + bar.width + 32" :cy="bar.y + 11" :r="5" :fill="`${FINAL_CONFIG.style.backgroundColor}`"/>
                </g>
                <line :x1="200" :x2="200" :y1="10" :y2="300" :stroke="FINAL_CONFIG.style.backgroundColor" :stroke-width="3"/>
            </svg>
        </template>

        <!-- TYPE DONUT EVOLUTION -->
        <template v-if="type === 'donutEvolution'">
            <svg :xmlns="XMLNS" data-cy="skeleton-donut-evolution" width="100%" viewBox="0 0 108 70" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <path v-if="FINAL_CONFIG.style.line.axis.show" d="M3 3 3 67 105 67" :stroke="FINAL_CONFIG.style.donutEvolution.axis.color" :stroke-width="FINAL_CONFIG.style.donutEvolution.axis.strokeWidth" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

                <path fill="none" d="M10 55A1 1 0 0020 55 1 1 0 0010 55M12 55A1 1 0 0018 55 1 1 0 0012 55M10 55 12 55M15 52 15 50M27 45A1 1 0 0037 45 1 1 0 0027 45M29 45A1 1 0 0035 45 1 1 0 0029 45M32 48 32 50M35 45 37 45M44 50A1 1 0 0054 50 1 1 0 0044 50M46 50A1 1 0 0052 50 1 1 0 0046 50M49 45 49 47M49 53 49 55M61 35A1 1 0 0071 35 1 1 0 0061 35M63 35A1 1 0 0069 35 1 1 0 0063 35M66 30 66 32M61 35 63 35M78 41A1 1 0 0088 41 1 1 0 0078 41M80 41A1 1 0 0086 41 1 1 0 0080 41M78 41 80 41M86 41 88 41M95 14A1 1 0 00105 14 1 1 0 0095 14M97 14A1 1 0 00103 14 1 1 0 0097 14M95 14 97 14M100 17 100 19" :stroke="FINAL_CONFIG.style.donutEvolution.donuts.color" :stroke-width="FINAL_CONFIG.style.donutEvolution.donuts.strokeWidth"/>

                <path fill="none" d="M19 52 27 45M37 45 44 49M52 46 62 38M71 36 78 40M86 37 97 18" :stroke="FINAL_CONFIG.style.donutEvolution.axis.color" :stroke-width="FINAL_CONFIG.style.donutEvolution.axis.strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>

                <path d="M10 55 12 55C12 53 14 52 15 52L15 50C13 50 10 52 10 55" :fill="FINAL_CONFIG.style.donutEvolution.donuts.color" stroke="none" style="opacity:0.3" />
                <path d="M32 48 32 50C35 50 37 47 37 45L35 45C35 47 33 48 32 48" :fill="FINAL_CONFIG.style.donutEvolution.donuts.color" stroke="none" style="opacity:0.3" />
                <path d="M49 53 49 55A1 1 0 0049 45L49 47C53 47 53 53 49 53" :fill="FINAL_CONFIG.style.donutEvolution.donuts.color" stroke="none" style="opacity:0.3" />
                <path d="M63 35C63 33 65 32 66 32L66 30C63 30 61 33 61 35L63 35" :fill="FINAL_CONFIG.style.donutEvolution.donuts.color" stroke="none" style="opacity:0.3" />
                <path d="M78 41A1 1 0 0088 41L86 41C86 45 80 45 80 41L78 41" :fill="FINAL_CONFIG.style.donutEvolution.donuts.color" stroke="none" style="opacity:0.3" />
                <path d="M95 14C95 17 98 19 100 19L100 17C99 17 97 16 97 14L95 14" :fill="FINAL_CONFIG.style.donutEvolution.donuts.color" stroke="none" style="opacity:0.3" />

            </svg>
        </template>
        
        <!-- TYPE LINE -->
        <template v-if="type === 'line'">
            <svg :xmlns="XMLNS" data-cy="skeleton-line" width="100%" viewBox="0 0 100 70" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">

                <g v-if="FINAL_CONFIG.style.line.axis.show">
                    <line x1="3" x2="3" y1="3" y2="67" :stroke="FINAL_CONFIG.style.line.axis.color" :stroke-width="FINAL_CONFIG.style.line.axis.strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="3" x2="97" y1="67" y2="67" :stroke="FINAL_CONFIG.style.line.axis.color" :stroke-width="FINAL_CONFIG.style.line.axis.strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
                <path d="M 9,60 22,50 35,55 48,36 61,40 74,25 87,26 90,12" fill="none" stroke-linecap="round" stroke-linejoin="round" :stroke="FINAL_CONFIG.style.line.path.color" :stroke-width="FINAL_CONFIG.style.line.path.strokeWidth" />
                <g v-if="FINAL_CONFIG.style.line.path.showPlots">
                    <circle cx="9" cy="60" :r="FINAL_CONFIG.style.line.path.strokeWidth" :fill="FINAL_CONFIG.style.line.path.color"/>
                    <circle cx="90" cy="12" :r="FINAL_CONFIG.style.line.path.strokeWidth" :fill="FINAL_CONFIG.style.line.path.color"/>
                </g>
            </svg>
        </template>

        <!-- TYPE BAR -->
        <template v-if="type === 'bar'">
            <svg :xmlns="XMLNS" data-cy="skeleton-bar" width="100%" viewBox="0 0 100 70" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <g v-if="FINAL_CONFIG.style.bar.axis.show">
                    <line x1="3" x2="3" y1="3" y2="67" :stroke="FINAL_CONFIG.style.bar.axis.color" :stroke-width="FINAL_CONFIG.style.bar.axis.strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="3" x2="97" y1="67" y2="67" :stroke="FINAL_CONFIG.style.bar.axis.color" :stroke-width="FINAL_CONFIG.style.bar.axis.strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
                <rect v-for="(bar,i) in bars"
                    :fill="FINAL_CONFIG.style.bar.color"
                    :rx="FINAL_CONFIG.style.bar.borderRadius"
                    :x="6 + (11.2 * i)"
                    :y="bar"
                    :width="FINAL_CONFIG.style.bar.barWidth"
                    :height="67 - bar"
                />
            </svg>
        </template>

        <!-- TYPE DONUT -->
        <template v-if="type === 'donut'">
            <svg :xmlns="XMLNS" data-cy="skeleton-donut" width="100%" viewBox="0 0 400 400" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <path d=" M 300 200 A 100 100 0 0 1 113 250" fill="none" :stroke-width="FINAL_CONFIG.style.donut.strokeWidth" :stroke="FINAL_CONFIG.style.donut.color" />
                <path d=" M 113 250 A 100 100 0 0 1 250 113" fill="none" :stroke-width="FINAL_CONFIG.style.donut.strokeWidth" :stroke="`${FINAL_CONFIG.style.donut.color}${opacity[60]}`" />
                <path d=" M 250 113 A 100 100 0 0 1 300 200" fill="none" :stroke-width="FINAL_CONFIG.style.donut.strokeWidth" :stroke="`${FINAL_CONFIG.style.donut.color}${opacity[30]}`" />
            </svg>
        </template>
        
        <!-- TYPE ONION -->
        <template v-if="type === 'onion'">
            <svg :xmlns="XMLNS" data-cy="skeleton-onion" width="100%" viewBox="0 0 400 400" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <path d=" M 200 60 A 140 140 0 1 1 60 200"   :stroke="FINAL_CONFIG.style.onion.color" stroke-linecap="round" stroke-width="20" fill="none" />
                <path d=" M 200 100 A 100 100 0 1 1 100 200" :stroke="`${FINAL_CONFIG.style.onion.color}${opacity[60]}`" stroke-linecap="round" stroke-width="20" fill="none" />
                <path d=" M 200 140 A 60 60 0 1 1 140 200" fill="none" :stroke="`${FINAL_CONFIG.style.onion.color}${opacity[40]}`" stroke-linecap="round" stroke-width="20" />
            </svg>
        </template>

        <!-- TYPE GAUGE -->
        <template v-if="type === 'gauge'">
            <svg data-cy="skeleton-gauge" width="100%" viewBox="0 0 400 400" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <path d=" M 82 255 A 120 120 0 1 1 318 255" fill="none" :stroke="FINAL_CONFIG.style.gauge.color" stroke-linecap="round" stroke-width="20" />
                <circle cx="200" cy="256" r="12" :fill="FINAL_CONFIG.style.gauge.color"/>
                <line x1="200" y1="256" x2="250" y2="160" stroke-width="8" :stroke="FINAL_CONFIG.style.gauge.color" stroke-linecap="round"/>
            </svg>
        </template>

        <!-- TYPE QUADRANT -->
        <template v-if="type === 'quadrant'">
            <svg :xmlns="XMLNS" data-cy="skeleton-quadrant" viewBox="0 0 100 100" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <line x1="50" x2="50" y1="3" y2="97" :stroke="FINAL_CONFIG.style.quadrant.grid.color" :stroke-width="FINAL_CONFIG.style.quadrant.grid.strokeWidth"/>
                <line x1="3" x2="97" y1="50" y2="50" :stroke="FINAL_CONFIG.style.quadrant.grid.color" :stroke-width="FINAL_CONFIG.style.quadrant.grid.strokeWidth"/>
                <circle :fill="FINAL_CONFIG.style.quadrant.plots.color" :r="FINAL_CONFIG.style.quadrant.plots.radius" cx="20" cy="20"/>
                <circle :fill="FINAL_CONFIG.style.quadrant.plots.color" :r="FINAL_CONFIG.style.quadrant.plots.radius" cx="80" cy="60"/>
                <circle :fill="FINAL_CONFIG.style.quadrant.plots.color" :r="FINAL_CONFIG.style.quadrant.plots.radius" cx="65" cy="55"/>
                <circle :fill="FINAL_CONFIG.style.quadrant.plots.color" :r="FINAL_CONFIG.style.quadrant.plots.radius" cx="36" cy="67"/>
                <circle :fill="FINAL_CONFIG.style.quadrant.plots.color" :r="FINAL_CONFIG.style.quadrant.plots.radius" cx="15" cy="75"/>
                <circle :fill="FINAL_CONFIG.style.quadrant.plots.color" :r="FINAL_CONFIG.style.quadrant.plots.radius" cx="40" cy="55" />
                <circle :fill="FINAL_CONFIG.style.quadrant.plots.color" :r="FINAL_CONFIG.style.quadrant.plots.radius" cx="76" cy="32"/>
                <circle :fill="FINAL_CONFIG.style.quadrant.plots.color" :r="FINAL_CONFIG.style.quadrant.plots.radius" cx="85" cy="26"/>
                <circle :fill="FINAL_CONFIG.style.quadrant.plots.color" :r="FINAL_CONFIG.style.quadrant.plots.radius" cx="55" cy="46"/>
            </svg>
        </template>

        <!-- TYPE RADAR -->
        <template v-if="type === 'radar'">
            <svg :xmlns="XMLNS" data-cy="skeleton-radar" viewBox="0 0 100 100" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <path :d="radar" fill="none" :stroke="FINAL_CONFIG.style.radar.grid.color" :stroke-width="FINAL_CONFIG.style.radar.grid.strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>

                <path :d="radarInside1" fill="none" :stroke="`${FINAL_CONFIG.style.radar.grid.color}${opacity[70]}`" :stroke-width="FINAL_CONFIG.style.radar.grid.strokeWidth / 2" stroke-linecap="round" stroke-linejoin="round"/>
                <path :d="radarInside2" fill="none" :stroke="`${FINAL_CONFIG.style.radar.grid.color}${opacity[70]}`" :stroke-width="FINAL_CONFIG.style.radar.grid.strokeWidth / 2" stroke-linecap="round" stroke-linejoin="round"/>
                <path :d="radarInside3" fill="none" :stroke="`${FINAL_CONFIG.style.radar.grid.color}${opacity[70]}`" :stroke-width="FINAL_CONFIG.style.radar.grid.strokeWidth / 2.5" stroke-linecap="round" stroke-linejoin="round"/>

                <path d="M 9,50 91,50" :stroke="`${FINAL_CONFIG.style.radar.grid.color}${opacity[50]}`" :stroke-width="FINAL_CONFIG.style.radar.grid.strokeWidth / 2" />
                <path d="M 29.5,14.5 70.5 85.5" :stroke="`${FINAL_CONFIG.style.radar.grid.color}${opacity[50]}`" :stroke-width="FINAL_CONFIG.style.radar.grid.strokeWidth / 2" />
                <path d="M 29.5,85.5 70.5 14.5" :stroke="`${FINAL_CONFIG.style.radar.grid.color}${opacity[50]}`" :stroke-width="FINAL_CONFIG.style.radar.grid.strokeWidth / 2" />

                <path d="M 34,23 68.5,18, 70,50 61.5,70 35,75.5 10,50  Z" stroke="none" stroke-linejoin="round" :fill="`${FINAL_CONFIG.style.radar.shapes.color}${opacity[30]}`" />
                <path d="M 43.5,40 64.5,25, 84,50 55.5,60 29.5,85.5 25,50  Z" stroke="none" stroke-linejoin="round" :fill="`${FINAL_CONFIG.style.radar.shapes.color}${opacity[50]}`" />
            </svg>
        </template>

        <!-- TYPE WAFFLE -->
        <template v-if="type === 'waffle'">
            <svg :xmlns="XMLNS" data-cy="skeleton-waffle" viewBox="0 0 100 100" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <g v-for="(_,i) in 10">
                    <g v-for="(__,j) in 10">
                        <rect
                            :x="3 + (j * 9.5)"
                            :y="3 + (i * 9.5)"
                            :height="9"
                            :width="9"
                            :fill="`${FINAL_CONFIG.style.waffle.color}${opacity[20]}`"
                            rx="1"
                        />
                    </g>
                </g>
                <g v-for="(_,i) in 10">
                    <g v-for="(__,j) in 10">
                        <rect
                            v-if="i > 2"
                            :x="3 + (j * 9.5)"
                            :y="3 + (i * 9.5)"
                            :height="9"
                            :width="9"
                            :fill="`${FINAL_CONFIG.style.waffle.color}${opacity[30]}`"
                            rx="1"
                        />
                    </g>
                </g>
                <g v-for="(_,i) in 10">
                    <g v-for="(__,j) in 10">
                        <rect
                            v-if="i > 6"
                            :x="3 + (j * 9.5)"
                            :y="3 + (i * 9.5)"
                            :height="9"
                            :width="9"
                            :fill="`${FINAL_CONFIG.style.waffle.color}${opacity[50]}`"
                            rx="1"
                        />
                    </g>
                </g>
            </svg>
        </template>

        <!-- TYPE TABLE -->
        <template v-if="type === 'table'">
            <svg :xmlns="XMLNS" data-cy="skeleton-table" width="100%" viewBox="0 0 100 70" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <rect :fill="`${FINAL_CONFIG.style.table.th.color}${opacity[50]}`" :x="3.5" :y="5" height="10" width="93"/>
                <rect :fill="`${FINAL_CONFIG.style.table.th.color}${opacity[50]}`" :x="3.5" :y="15" height="50" width="23.25"/>
                <line v-for="(_,i) in 7" x1="3.7" x2="96.3" :y1="5 + (i * 10)" :y2="5 + (i * 10)" :stroke="FINAL_CONFIG.style.table.td.color" :stroke-width="FINAL_CONFIG.style.table.td.strokeWidth" stroke-linecap="round" />
                <line v-for="(_,i) in 5" :x1="3.5 + (i * 23.25)" :x2="3.5 + (i * 23.25)" y1="5" y2="65" :stroke="FINAL_CONFIG.style.table.td.color" :stroke-width="FINAL_CONFIG.style.table.td.strokeWidth" stroke-linecap="round" />
            </svg>
        </template>

        <!-- TYPE RATING -->
        <template v-if="type === 'rating'">
            <div data-cy="skeleton-smiley" v-if="FINAL_CONFIG.style.rating.useSmiley" :style="`display:flex;flex-direction:row;align-items:center;justify-content:center;width:${FINAL_CONFIG.style.rating.maxWidth}px`">
                <!-- 0 -->
                <svg :xmlns="XMLNS" v-if="FINAL_CONFIG.style.rating.filled" :style="`width:${FINAL_CONFIG.style.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`" viewBox="0 0 24 24" stroke-width="1.5" :stroke="FINAL_CONFIG.style.rating.color" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-5 9.86a4.5 4.5 0 0 0 -3.214 1.35a1 1 0 1 0 1.428 1.4a2.5 2.5 0 0 1 3.572 0a1 1 0 0 0 1.428 -1.4a4.5 4.5 0 0 0 -3.214 -1.35zm-2.99 -4.2l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm6 0l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" stroke-width="0" :fill="FINAL_CONFIG.style.rating.color" />
                </svg>
                
                <svg :xmlns="XMLNS" v-else :style="`width:${FINAL_CONFIG.style.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`" viewBox="0 0 24 24" stroke-width="1.5" :stroke="FINAL_CONFIG.style.rating.color" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /><path d="M9.5 15.25a3.5 3.5 0 0 1 5 0" />
                </svg>

                <!-- 1 -->
                <svg :xmlns="XMLNS" v-if="FINAL_CONFIG.style.rating.filled" :style="`width:${FINAL_CONFIG.style.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`" viewBox="0 0 24 24" stroke-width="1.5" :stroke="FINAL_CONFIG.style.rating.color" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-2 10.66h-6l-.117 .007a1 1 0 0 0 0 1.986l.117 .007h6l.117 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-5.99 -5l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm6 0l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" stroke-width="0" :fill="FINAL_CONFIG.style.rating.color" />
                </svg>

                <svg :xmlns="XMLNS" v-else :style="`width:${FINAL_CONFIG.style.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`" viewBox="0 0 24 24" stroke-width="1.5" :stroke="FINAL_CONFIG.style.rating.color" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /><path d="M9 15l6 0" />
                </svg>

                <!-- 2 -->
                <svg :xmlns="XMLNS" v-if="FINAL_CONFIG.style.rating.filled" :style="`width:${FINAL_CONFIG.style.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`" viewBox="0 0 24 24" stroke-width="1.5" :stroke="FINAL_CONFIG.style.rating.color" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-7.99 5.66l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm6 0l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" stroke-width="0" :fill="FINAL_CONFIG.style.rating.color" />
                </svg>

                <svg :xmlns="XMLNS" v-else :style="`width:${FINAL_CONFIG.style.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`" viewBox="0 0 24 24" stroke-width="1.5" :stroke="FINAL_CONFIG.style.rating.color" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" />
                </svg>

                <!-- 3 -->
                <svg :xmlns="XMLNS" v-if="FINAL_CONFIG.style.rating.filled" :style="`width:${FINAL_CONFIG.style.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`" viewBox="0 0 24 24" stroke-width="1.5" :stroke="FINAL_CONFIG.style.rating.color" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.8 10.946a1 1 0 0 0 -1.414 .014a2.5 2.5 0 0 1 -3.572 0a1 1 0 0 0 -1.428 1.4a4.5 4.5 0 0 0 6.428 0a1 1 0 0 0 -.014 -1.414zm-6.19 -5.286l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993zm6 0l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993z" stroke-width="0" :fill="FINAL_CONFIG.style.rating.color" />
                </svg>

                <svg :xmlns="XMLNS" v-else :style="`width:${FINAL_CONFIG.style.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`" viewBox="0 0 24 24" stroke-width="1.5" :stroke="FINAL_CONFIG.style.rating.color" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /><path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
                </svg>

                <!-- 4 -->
                <svg :xmlns="XMLNS" v-if="FINAL_CONFIG.style.rating.filled" :style="`width:${FINAL_CONFIG.style.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`" viewBox="0 0 24 24" stroke-width="1.5" :stroke="FINAL_CONFIG.style.rating.color" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-2 9.66h-6a1 1 0 0 0 -1 1v.05a3.975 3.975 0 0 0 3.777 3.97l.227 .005a4.026 4.026 0 0 0 3.99 -3.79l.006 -.206a1 1 0 0 0 -1 -1.029zm-5.99 -5l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993zm6 0l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993z" stroke-width="0" :fill="FINAL_CONFIG.style.rating.color" />
                </svg>

                <svg :xmlns="XMLNS" v-else :style="`width:${FINAL_CONFIG.style.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`" viewBox="0 0 24 24" stroke-width="1.5" :stroke="FINAL_CONFIG.style.rating.color" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 9l.01 0" /><path d="M15 9l.01 0" /><path d="M8 13a4 4 0 1 0 8 0h-8" />
                </svg>
            </div>

            <svg :xmlns="XMLNS" data-cy="skeleton-rating" v-else width="100%" viewBox="0 0 100 30" :style="`background:${FINAL_CONFIG.style.backgroundColor};max-width:${FINAL_CONFIG.style.rating.maxWidth}px`">
                <polygon 
                    v-for="(_,i) in 5"
                    :points="createStar({
                        plot: { x: 10 + (i * 20), y: 15 },
                        radius: 6
                    })"
                    :fill="FINAL_CONFIG.style.rating.filled ? FINAL_CONFIG.style.rating.color : 'none'"
                    :stroke="FINAL_CONFIG.style.rating.color"
                    :stroke-width="FINAL_CONFIG.style.rating.strokeWidth"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </template>

        <!-- TYPE VERTICAL BAR -->
        <template v-if="type === 'verticalBar'">
            <svg :xmlns="XMLNS" data-cy="skeleton-verticalBar" width="100%" viewBox="0 0 100 100" :style="`background:${FINAL_CONFIG.style.backgroundColor}`">
                <g v-if="FINAL_CONFIG.style.verticalBar.axis.show">
                    <line :x1="3" :x2="3" :y1="3" :y2="97" :stroke="FINAL_CONFIG.style.verticalBar.axis.color" :stroke-width="FINAL_CONFIG.style.verticalBar.axis.strokeWidth"/>
                </g>
                <rect 
                    v-for="(_,i) in 6"
                    :x="3"
                    :y="5 + (i * 15.6)"
                    height="12"
                    :width="94 - (94 * i /6)"
                    :fill="FINAL_CONFIG.style.verticalBar.color"
                    :rx="FINAL_CONFIG.style.verticalBar.borderRadius"
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