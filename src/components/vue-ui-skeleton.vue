<script setup>
import { ref, computed } from "vue";
import { treeShake, convertConfigColors, opacity, createPolygonPath, createStar } from "../lib.js";
import mainConfig from "../default_configs.json";

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    }
});

const uid = ref(`vue-ui-skeleton-${Math.random()}`);

const defaultConfig = ref(mainConfig.vue_ui_skeleton);

const skeletonConfig = computed(() => {
    if(!Object.keys(props.config || {}).length) {
        return defaultConfig.value;
    }
    const reconcilied = treeShake({
        defaultConfig: defaultConfig.value,
        userConfig: props.config
    });
    return convertConfigColors(reconcilied);
});

const isAnimated = computed(() => {
    return skeletonConfig.value.style.animated;
});

const type = computed(() => {
    return skeletonConfig.value.type;
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

</script>

<template>
    <div :id="uid" :class="{ 'vue-ui-skeleton': true, 'vue-ui-skeleton-animated': isAnimated }" :style="`background:${skeletonConfig.style.backgroundColor};color:${skeletonConfig.style.color};display:flex;align-items:center;justify-content:center;`">
        <!-- TYPE PYRAMID -->
        <template v-if="type === 'pyramid'">
            <svg width="100%" viewBox="0 0 105 80" :style="`background:${skeletonConfig.style.backgroundColor}`">
                <g v-for="(rect, i) in pyramid">
                    <rect :x="50 - rect[0]" :y="i * (80 / pyramid.length)" :width="rect[0]" :height="(80 / pyramid.length) * 0.95" :fill="skeletonConfig.style.pyramid.color"/>
                    <rect :x="55" :y="i * (80 / pyramid.length)" :width="rect[1]" :height="(80 / pyramid.length) * 0.95" :fill="skeletonConfig.style.pyramid.color"/>
                </g>
            </svg>
        </template>
        <!-- TYPE SPARKLINE -->
        <template v-if="type === 'sparkline'">
            <svg width="100%" viewBox="0 0 150 32" :style="`background:${skeletonConfig.style.backgroundColor}`">
                <g>
                    <rect x="2" y="2" height="6" width="24" :fill="skeletonConfig.style.sparkline.color" rx="3"/>
                    <rect x="2" y="12" height="16" width="16" :fill="skeletonConfig.style.sparkline.color" rx="3"/>
                </g>
                <g v-for="(line, i) in sparkline">
                    <line 
                        v-if="i < sparkline.length - 1"
                        :x1="line.x"
                        :y1="line.y"
                        :x2="sparkline[i + 1].x"
                        :y2="sparkline[i + 1].y"
                        :stroke-width="skeletonConfig.style.sparkline.strokeWidth"
                        :stroke="skeletonConfig.style.sparkline.color"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    />
                </g>
            </svg>
        </template>

        <!-- TYPE CANDLESTICK -->
        <template v-if="type === 'candlesticks'">
            <svg width="100%" viewBox="0 0 512 316" :style="`background:${skeletonConfig.style.backgroundColor}`">
                <g v-if="skeletonConfig.style.candlesticks.axis.show">
                    <line
                        :x1="2"
                        :x2="2"
                        :y1="2"
                        :y2="314"
                        :stroke="skeletonConfig.style.candlesticks.axis.color"
                        :stroke-width="skeletonConfig.style.candlesticks.axis.strokeWidth"
                        stroke-linecap="round"
                    />
                    <line
                        :x1="2"
                        :x2="510"
                        :y1="314"
                        :y2="314"
                        :stroke="skeletonConfig.style.candlesticks.axis.color"
                        :stroke-width="skeletonConfig.style.candlesticks.axis.strokeWidth"
                        stroke-linecap="round"
                    />
                </g>
                <g v-for="(candle, i) in candlesticks">
                    <line 
                        :x1="24 + (464 * i / (candlesticks.length - 1)) - (464 / (candlesticks.length - 1) / 8)"
                        :x2="24 + (464 * i / (candlesticks.length - 1)) + (464 / (candlesticks.length - 1) / 8)"
                        :y1="candle.y"
                        :y2="candle.y"
                        :stroke="skeletonConfig.style.candlesticks.candle.color"
                        :stroke-width="skeletonConfig.style.candlesticks.candle.strokeWidth"
                        stroke-linecap="round"
                    />
                    <line 
                        :x1="24 + (464 * i / (candlesticks.length - 1)) - (464 / (candlesticks.length - 1) / 8)"
                        :x2="24 + (464 * i / (candlesticks.length - 1)) + (464 / (candlesticks.length - 1) / 8)"
                        :y1="candle.y + candle.height"
                        :y2="candle.y + candle.height"
                        :stroke="skeletonConfig.style.candlesticks.candle.color"
                        :stroke-width="skeletonConfig.style.candlesticks.candle.strokeWidth"
                        stroke-linecap="round"
                    />
                    <line
                        :x1="24 + (464 * i / (candlesticks.length - 1))"
                        :x2="24 + (464 * i / (candlesticks.length - 1))"
                        :y1="candle.y"
                        :y2="candle.y + candle.height"
                        :stroke="skeletonConfig.style.candlesticks.candle.color"
                        :stroke-width="skeletonConfig.style.candlesticks.candle.strokeWidth"
                        stroke-linecap="round"
                    />
                    <rect
                        :x="24 + (464 * i / (candlesticks.length - 1)) - (464 / (candlesticks.length - 1) / 8)"
                        :y="candle.y + (candle.height - candle.bar * 1.5)"
                        :height="candle.bar"
                        :width="(464 / (candlesticks.length - 1) / 4)"
                        :fill="skeletonConfig.style.candlesticks.candle.color"
                        rx="1"
                    />
                </g>
            </svg>
        </template>

        <!-- TYPE HEATMAP -->
        <template v-if="type === 'heatmap'">
            <svg width="100%" :viewBox="`0 0 ${10 * skeletonConfig.style.heatmap.cellsX} ${10 * skeletonConfig.style.heatmap.cellsY}`" :style="`background:${skeletonConfig.style.backgroundColor}`">
                <g v-for="(_, i) in skeletonConfig.style.heatmap.cellsY">
                    <g v-for="(__, j) in skeletonConfig.style.heatmap.cellsX">
                        <rect
                            :x="j * 10"
                            :y="i * 10"
                            :height="10"
                            :width="10"
                            :stroke="skeletonConfig.style.backgroundColor"
                            :stroke-width="1"
                            :fill="`${skeletonConfig.style.heatmap.color}${opacity[Math.round(Math.random()*100)]}`"
                        />
                    </g>
                </g>
            </svg>
        </template>

        <!-- TYPE CHESTNUT -->
        <template v-if="type === 'chestnut'">
            <svg width="100%" viewBox="0 0 512 316" :style="`background:${skeletonConfig.style.backgroundColor}`">
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
                            :stroke="`${skeletonConfig.style.chestnut.color}${opacity[bar.opacity * 0.2]}`"
                            fill="none"
                            stroke-width="2"
                            shape-rendering="cirspEdges"
                        />
                    </g>
                </g>
                <circle v-for="item in chestnut" :cx="item.root.x" :cy="item.root.y" :r="item.root.r" :fill="`${skeletonConfig.style.backgroundColor}`" :stroke="skeletonConfig.backgroundColor" :stroke-width="3"/>
                <circle v-for="item in chestnut" :cx="item.root.x" :cy="item.root.y" :r="item.root.r" :fill="`${skeletonConfig.style.chestnut.color}${opacity[item.root.opacity]}`" :stroke="skeletonConfig.style.backgroundColor" :stroke-width="3"/>
                <g v-for="item in chestnut">
                    <rect v-for="bar in item.bars" rx="2" :x="bar.x" :y="bar.y" :width="bar.width" :height="22" :fill="`${skeletonConfig.style.chestnut.color}${opacity[bar.opacity]}`"/>
                    <circle v-for="bar in item.bars" :cx="bar.x + bar.width + 32" :cy="bar.y + 11" :r="11" :fill="`${skeletonConfig.style.chestnut.color}${opacity[bar.opacity]}`"/>
                    <circle v-for="bar in item.bars" :cx="bar.x + bar.width + 32" :cy="bar.y + 11" :r="5" :fill="`${skeletonConfig.style.backgroundColor}`"/>
                </g>
                <line :x1="200" :x2="200" :y1="10" :y2="300" :stroke="skeletonConfig.style.backgroundColor" :stroke-width="3"/>
            </svg>
        </template>
        
        <!-- TYPE LINE -->
        <template v-if="type === 'line'">
            <svg width="100%" viewBox="0 0 100 70" :style="`background:${skeletonConfig.style.backgroundColor}`">

                <g v-if="skeletonConfig.style.line.axis.show">
                    <line x1="3" x2="3" y1="3" y2="67" :stroke="skeletonConfig.style.line.axis.color" :stroke-width="skeletonConfig.style.line.axis.strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="3" x2="97" y1="67" y2="67" :stroke="skeletonConfig.style.line.axis.color" :stroke-width="skeletonConfig.style.line.axis.strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
                <path d="M 9,60 22,50 35,55 48,36 61,40 74,25 87,26 90,12" fill="none" stroke-linecap="round" stroke-linejoin="round" :stroke="skeletonConfig.style.line.path.color" :stroke-width="skeletonConfig.style.line.path.strokeWidth" />
                <g v-if="skeletonConfig.style.line.path.showPlots">
                    <circle cx="9" cy="60" :r="skeletonConfig.style.line.path.strokeWidth" :fill="skeletonConfig.style.line.path.color"/>
                    <circle cx="90" cy="12" :r="skeletonConfig.style.line.path.strokeWidth" :fill="skeletonConfig.style.line.path.color"/>
                </g>
            </svg>
        </template>

        <template v-if="type === 'bar'">
            <svg width="100%" viewBox="0 0 100 70" :style="`background:${skeletonConfig.style.backgroundColor}`">
                <g v-if="skeletonConfig.style.bar.axis.show">
                    <line x1="3" x2="3" y1="3" y2="67" :stroke="skeletonConfig.style.bar.axis.color" :stroke-width="skeletonConfig.style.bar.axis.strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>
                    <line x1="3" x2="97" y1="67" y2="67" :stroke="skeletonConfig.style.bar.axis.color" :stroke-width="skeletonConfig.style.bar.axis.strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
                <rect v-for="(bar,i) in bars"
                    :fill="skeletonConfig.style.bar.color"
                    :rx="skeletonConfig.style.bar.borderRadius"
                    :x="6 + (11.2 * i)"
                    :y="bar"
                    :width="skeletonConfig.style.bar.barWidth"
                    :height="67 - bar"
                />
            </svg>
        </template>

        <template v-if="type === 'donut'">
            <svg width="100%" viewBox="0 0 400 400" :style="`background:${skeletonConfig.style.backgroundColor}`">
                <path d=" M 300 200 A 100 100 0 0 1 113 250" fill="none" :stroke-width="skeletonConfig.style.donut.strokeWidth" :stroke="skeletonConfig.style.donut.color" />
                <path d=" M 113 250 A 100 100 0 0 1 250 113" fill="none" :stroke-width="skeletonConfig.style.donut.strokeWidth" :stroke="`${skeletonConfig.style.donut.color}${opacity[60]}`" />
                <path d=" M 250 113 A 100 100 0 0 1 300 200" fill="none" :stroke-width="skeletonConfig.style.donut.strokeWidth" :stroke="`${skeletonConfig.style.donut.color}${opacity[30]}`" />
            </svg>
        </template>
        
        <template v-if="type === 'onion'">
            <svg width="100%" viewBox="0 0 400 400" :style="`background:${skeletonConfig.style.backgroundColor}`">
                <path d=" M 200 60 A 140 140 0 1 1 60 200"   :stroke="skeletonConfig.style.onion.color" stroke-linecap="round" stroke-width="20" fill="none" />
                <path d=" M 200 100 A 100 100 0 1 1 100 200" :stroke="`${skeletonConfig.style.onion.color}${opacity[60]}`" stroke-linecap="round" stroke-width="20" fill="none" />
                <path d=" M 200 140 A 60 60 0 1 1 140 200" fill="none" :stroke="`${skeletonConfig.style.onion.color}${opacity[40]}`" stroke-linecap="round" stroke-width="20" />
            </svg>
        </template>

        <template v-if="type === 'gauge'">
            <svg width="100%" viewBox="0 0 400 400" :style="`background:${skeletonConfig.style.backgroundColor}`">
                <path d=" M 82 255 A 120 120 0 1 1 318 255" fill="none" :stroke="skeletonConfig.style.gauge.color" stroke-linecap="round" stroke-width="20" />
                <circle cx="200" cy="256" r="12" :fill="skeletonConfig.style.gauge.color"/>
                <line x1="200" y1="256" x2="250" y2="160" stroke-width="8" :stroke="skeletonConfig.style.gauge.color" stroke-linecap="round"/>
            </svg>
        </template>

        <template v-if="type === 'quadrant'">
            <svg viewBox="0 0 100 100" :style="`background:${skeletonConfig.style.backgroundColor}`">
                <line x1="50" x2="50" y1="3" y2="97" :stroke="skeletonConfig.style.quadrant.grid.color" :stroke-width="skeletonConfig.style.quadrant.grid.strokeWidth"/>
                <line x1="3" x2="97" y1="50" y2="50" :stroke="skeletonConfig.style.quadrant.grid.color" :stroke-width="skeletonConfig.style.quadrant.grid.strokeWidth"/>
                <circle :fill="skeletonConfig.style.quadrant.plots.color" :r="skeletonConfig.style.quadrant.plots.radius" cx="20" cy="20"/>
                <circle :fill="skeletonConfig.style.quadrant.plots.color" :r="skeletonConfig.style.quadrant.plots.radius" cx="80" cy="60"/>
                <circle :fill="skeletonConfig.style.quadrant.plots.color" :r="skeletonConfig.style.quadrant.plots.radius" cx="65" cy="55"/>
                <circle :fill="skeletonConfig.style.quadrant.plots.color" :r="skeletonConfig.style.quadrant.plots.radius" cx="36" cy="67"/>
                <circle :fill="skeletonConfig.style.quadrant.plots.color" :r="skeletonConfig.style.quadrant.plots.radius" cx="15" cy="75"/>
                <circle :fill="skeletonConfig.style.quadrant.plots.color" :r="skeletonConfig.style.quadrant.plots.radius" cx="40" cy="55" />
                <circle :fill="skeletonConfig.style.quadrant.plots.color" :r="skeletonConfig.style.quadrant.plots.radius" cx="76" cy="32"/>
                <circle :fill="skeletonConfig.style.quadrant.plots.color" :r="skeletonConfig.style.quadrant.plots.radius" cx="85" cy="26"/>
                <circle :fill="skeletonConfig.style.quadrant.plots.color" :r="skeletonConfig.style.quadrant.plots.radius" cx="55" cy="46"/>
            </svg>
        </template>

        <template v-if="type === 'radar'">
            <svg viewBox="0 0 100 100" :style="`background:${skeletonConfig.style.backgroundColor}`">
                <path :d="radar" fill="none" :stroke="skeletonConfig.style.radar.grid.color" :stroke-width="skeletonConfig.style.radar.grid.strokeWidth" stroke-linecap="round" stroke-linejoin="round"/>

                <path :d="radarInside1" fill="none" :stroke="`${skeletonConfig.style.radar.grid.color}${opacity[70]}`" :stroke-width="skeletonConfig.style.radar.grid.strokeWidth / 2" stroke-linecap="round" stroke-linejoin="round"/>
                <path :d="radarInside2" fill="none" :stroke="`${skeletonConfig.style.radar.grid.color}${opacity[70]}`" :stroke-width="skeletonConfig.style.radar.grid.strokeWidth / 2" stroke-linecap="round" stroke-linejoin="round"/>
                <path :d="radarInside3" fill="none" :stroke="`${skeletonConfig.style.radar.grid.color}${opacity[70]}`" :stroke-width="skeletonConfig.style.radar.grid.strokeWidth / 2.5" stroke-linecap="round" stroke-linejoin="round"/>

                <path d="M 9,50 91,50" :stroke="`${skeletonConfig.style.radar.grid.color}${opacity[50]}`" :stroke-width="skeletonConfig.style.radar.grid.strokeWidth / 2" />
                <path d="M 29.5,14.5 70.5 85.5" :stroke="`${skeletonConfig.style.radar.grid.color}${opacity[50]}`" :stroke-width="skeletonConfig.style.radar.grid.strokeWidth / 2" />
                <path d="M 29.5,85.5 70.5 14.5" :stroke="`${skeletonConfig.style.radar.grid.color}${opacity[50]}`" :stroke-width="skeletonConfig.style.radar.grid.strokeWidth / 2" />

                <path d="M 34,23 68.5,18, 70,50 61.5,70 35,75.5 10,50  Z" stroke="none" stroke-linejoin="round" :fill="`${skeletonConfig.style.radar.shapes.color}${opacity[30]}`" />
                <path d="M 43.5,40 64.5,25, 84,50 55.5,60 29.5,85.5 25,50  Z" stroke="none" stroke-linejoin="round" :fill="`${skeletonConfig.style.radar.shapes.color}${opacity[50]}`" />
            </svg>
        </template>

        <template v-if="type === 'waffle'">
            <svg viewBox="0 0 100 100" :style="`background:${skeletonConfig.style.backgroundColor}`">
                <g v-for="(_,i) in 10">
                    <g v-for="(__,j) in 10">
                        <rect
                            :x="3 + (j * 9.5)"
                            :y="3 + (i * 9.5)"
                            :height="9"
                            :width="9"
                            :fill="`${skeletonConfig.style.waffle.color}${opacity[20]}`"
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
                            :fill="`${skeletonConfig.style.waffle.color}${opacity[30]}`"
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
                            :fill="`${skeletonConfig.style.waffle.color}${opacity[50]}`"
                            rx="1"
                        />
                    </g>
                </g>
            </svg>
        </template>

        <template v-if="type === 'table'">
            <svg width="100%" viewBox="0 0 100 70" :style="`background:${skeletonConfig.style.backgroundColor}`">
                <rect :fill="`${skeletonConfig.style.table.th.color}${opacity[50]}`" :x="3.5" :y="5" height="10" width="93"/>
                <rect :fill="`${skeletonConfig.style.table.th.color}${opacity[50]}`" :x="3.5" :y="15" height="50" width="23.25"/>
                <line v-for="(_,i) in 7" x1="3.7" x2="96.3" :y1="5 + (i * 10)" :y2="5 + (i * 10)" :stroke="skeletonConfig.style.table.td.color" :stroke-width="skeletonConfig.style.table.td.strokeWidth" stroke-linecap="round" />
                <line v-for="(_,i) in 5" :x1="3.5 + (i * 23.25)" :x2="3.5 + (i * 23.25)" y1="5" y2="65" :stroke="skeletonConfig.style.table.td.color" :stroke-width="skeletonConfig.style.table.td.strokeWidth" stroke-linecap="round" />
            </svg>
        </template>

        <template v-if="type === 'rating'">
            <div v-if="skeletonConfig.style.rating.useSmiley" :style="`display:flex;flex-direction:row;align-items:center;justify-content:center;width:${skeletonConfig.style.rating.maxWidth}px`">
                <!-- 0 -->
                <svg v-if="skeletonConfig.style.rating.filled" :style="`width:${skeletonConfig.style.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`" viewBox="0 0 24 24" stroke-width="1.5" :stroke="skeletonConfig.style.rating.color" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-5 9.86a4.5 4.5 0 0 0 -3.214 1.35a1 1 0 1 0 1.428 1.4a2.5 2.5 0 0 1 3.572 0a1 1 0 0 0 1.428 -1.4a4.5 4.5 0 0 0 -3.214 -1.35zm-2.99 -4.2l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm6 0l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" stroke-width="0" :fill="skeletonConfig.style.rating.color" />
                </svg>
                
                <svg v-else :style="`width:${skeletonConfig.style.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`" viewBox="0 0 24 24" stroke-width="1.5" :stroke="skeletonConfig.style.rating.color" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /><path d="M9.5 15.25a3.5 3.5 0 0 1 5 0" />
                </svg>

                <!-- 1 -->
                <svg v-if="skeletonConfig.style.rating.filled" :style="`width:${skeletonConfig.style.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`" viewBox="0 0 24 24" stroke-width="1.5" :stroke="skeletonConfig.style.rating.color" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-2 10.66h-6l-.117 .007a1 1 0 0 0 0 1.986l.117 .007h6l.117 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm-5.99 -5l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm6 0l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" stroke-width="0" :fill="skeletonConfig.style.rating.color" />
                </svg>

                <svg v-else :style="`width:${skeletonConfig.style.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`" viewBox="0 0 24 24" stroke-width="1.5" :stroke="skeletonConfig.style.rating.color" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /><path d="M9 15l6 0" />
                </svg>

                <!-- 2 -->
                <svg v-if="skeletonConfig.style.rating.filled" :style="`width:${skeletonConfig.style.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`" viewBox="0 0 24 24" stroke-width="1.5" :stroke="skeletonConfig.style.rating.color" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-7.99 5.66l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007zm6 0l-.127 .007a1 1 0 0 0 0 1.986l.117 .007l.127 -.007a1 1 0 0 0 0 -1.986l-.117 -.007z" stroke-width="0" :fill="skeletonConfig.style.rating.color" />
                </svg>

                <svg v-else :style="`width:${skeletonConfig.style.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`" viewBox="0 0 24 24" stroke-width="1.5" :stroke="skeletonConfig.style.rating.color" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" />
                </svg>

                <!-- 3 -->
                <svg v-if="skeletonConfig.style.rating.filled" :style="`width:${skeletonConfig.style.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`" viewBox="0 0 24 24" stroke-width="1.5" :stroke="skeletonConfig.style.rating.color" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-1.8 10.946a1 1 0 0 0 -1.414 .014a2.5 2.5 0 0 1 -3.572 0a1 1 0 0 0 -1.428 1.4a4.5 4.5 0 0 0 6.428 0a1 1 0 0 0 -.014 -1.414zm-6.19 -5.286l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993zm6 0l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993z" stroke-width="0" :fill="skeletonConfig.style.rating.color" />
                </svg>

                <svg v-else :style="`width:${skeletonConfig.style.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`" viewBox="0 0 24 24" stroke-width="1.5" :stroke="skeletonConfig.style.rating.color" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 10l.01 0" /><path d="M15 10l.01 0" /><path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
                </svg>

                <!-- 4 -->
                <svg v-if="skeletonConfig.style.rating.filled" :style="`width:${skeletonConfig.style.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`" viewBox="0 0 24 24" stroke-width="1.5" :stroke="skeletonConfig.style.rating.color" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-2 9.66h-6a1 1 0 0 0 -1 1v.05a3.975 3.975 0 0 0 3.777 3.97l.227 .005a4.026 4.026 0 0 0 3.99 -3.79l.006 -.206a1 1 0 0 0 -1 -1.029zm-5.99 -5l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993zm6 0l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993z" stroke-width="0" :fill="skeletonConfig.style.rating.color" />
                </svg>

                <svg v-else :style="`width:${skeletonConfig.style.rating.maxWidth / 5}px;aspect-ratio: 1 / 1`" viewBox="0 0 24 24" stroke-width="1.5" :stroke="skeletonConfig.style.rating.color" stroke-linecap="round" stroke-linejoin="round" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M9 9l.01 0" /><path d="M15 9l.01 0" /><path d="M8 13a4 4 0 1 0 8 0h-8" />
                </svg>
            </div>

            <svg v-else width="100%" viewBox="0 0 100 30" :style="`background:${skeletonConfig.style.backgroundColor};max-width:${skeletonConfig.style.rating.maxWidth}px`">
                <polygon 
                    v-for="(_,i) in 5"
                    :points="createStar({
                        plot: { x: 10 + (i * 20), y: 15 },
                        radius: 6
                    })"
                    :fill="skeletonConfig.style.rating.filled ? skeletonConfig.style.rating.color : 'none'"
                    :stroke="skeletonConfig.style.rating.color"
                    :stroke-width="skeletonConfig.style.rating.strokeWidth"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </template>

        <template v-if="type === 'verticalBar'">
            <svg width="100%" viewBox="0 0 100 100" :style="`background:${skeletonConfig.style.backgroundColor}`">
                <g v-if="skeletonConfig.style.verticalBar.axis.show">
                    <line :x1="3" :x2="3" :y1="3" :y2="97" :stroke="skeletonConfig.style.verticalBar.axis.color" :stroke-width="skeletonConfig.style.verticalBar.axis.strokeWidth"/>
                </g>
                <rect 
                    v-for="(_,i) in 6"
                    :x="3"
                    :y="5 + (i * 15.6)"
                    height="12"
                    :width="94 - (94 * i /6)"
                    :fill="skeletonConfig.style.verticalBar.color"
                    :rx="skeletonConfig.style.verticalBar.borderRadius"
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