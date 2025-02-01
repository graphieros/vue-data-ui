<script setup>
import { ref, computed, onMounted, useSlots, watch, watchEffect } from 'vue'
import { useConfig } from '../useConfig';
import { XMLNS, adaptColorToBackground, applyDataLabel, convertColorToHex, convertCustomPalette, createUid, darkenHexColor, dataLabel, error, lightenHexColor, makeDonut, objectIsEmpty, palette } from '../lib';
import { useNestedProp } from '../useNestedProp';

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: Array,
        default() {
            return []
        }
    },
    debug: {
        type: Boolean,
        default: false
    }
});

const { vue_ui_circle_pack: DEFAULT_CONFIG } = useConfig();
const slots = useSlots();

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length
});

const uid = ref(createUid());
const circlePackChart = ref(null);

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });

    // if (mergedConfig.theme) {
    //     return {
    //         ...useNestedProp({
    //             userConfig: themes.vue_ui_waffle[mergedConfig.theme] || props.config,
    //             defaultConfig: mergedConfig
    //         }),
    //         customPalette: themePalettes[mergedConfig.theme] || palette
    //     }
    // } else {
    //     return mergedConfig;
    // }

    return mergedConfig;
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    // userOptionsVisible.value = !FINAL_CONFIG.value.showOnChartHover;
    prepareChart();
    // titleStep.value += 1;
    // tableStep.value += 1;
    // legendStep.value += 1;

    // Reset mutable config
    // mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    // mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.chart.tooltip.show;
}, { deep: true });


function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiCirclePack',
            type: 'dataset'
        })
    }
}

onMounted(prepareChart);

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})

function distance(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y)
}

function isOverlapping(circle, others) {
    return others.some((other) => distance(circle, other) < circle.radius + other.radius)
}

function findInitialPosition(placedCircles, radius, width, height) {
    const spacing = radius * 2;

    for (let circle of placedCircles) {
        for (let angle = 0; angle < 360; angle += 30) {
            let rad = (angle * Math.PI) / 180;
            let x = circle.x + spacing * Math.cos(rad);
            let y = circle.y + spacing * Math.sin(rad);

            let candidate = { x, y, radius };

            if (
                x - radius >= 0 &&
                x + radius <= width &&
                y - radius >= 0 &&
                y + radius <= height &&
                !isOverlapping(candidate, placedCircles)
            ) {
                return { x, y };
            }
        }
    }

    return null;
}

function packCircles(dp, width, height, maxRadius, offsetX = 0, offsetY = 0) {
    const maxDataPoint = Math.max(...dp.map(d => d.value));

    const radii = dp.map((d, index) => ({
        ...d,
        radius: (d.value / maxDataPoint) * maxRadius,
        index
    }));

    const sortedCircles = radii
        .map((r, index) => ({ ...r, index }))
        .toSorted((a, b) => b.radius - a.radius);

    let placedCircles = [];

    placedCircles.push({ 
        ...sortedCircles[0],
        x: width / 2 + offsetX, 
        y: height / 2 + offsetY, 
    });

    for (let circleData of sortedCircles.slice(1)) {
        let { radius, ...el } = circleData;
        let position = findInitialPosition(placedCircles, radius, width, height);
        
        if (position) {
            placedCircles.push({ ...el, x: position.x, y: position.y, radius });
        } else {
            let bestFit = null;
            let minOverlap = Infinity;

            for (let circle of placedCircles) {
                for (let angle = 0; angle < 360; angle += 15) {
                    let rad = (angle * Math.PI) / 180;
                    let x = circle.x + (radius + circle.radius) * Math.cos(rad);
                    let y = circle.y + (radius + circle.radius) * Math.sin(rad);

                    let candidate = { ...el, x, y, radius };

                    if (
                        x - radius >= 0 &&
                        x + radius <= width &&
                        y - radius >= 0 &&
                        y + radius <= height &&
                        !isOverlapping(candidate, placedCircles)
                    ) {
                        let overlap = placedCircles.reduce(
                            (sum, other) => sum + (distance(candidate, other) < candidate.radius + other.radius ? 1 : 0),
                            0
                        );
                        if (overlap < minOverlap) {
                            minOverlap = overlap;
                            bestFit = candidate;
                        }
                    }
                }
            }

            if (bestFit) {
                placedCircles.push(bestFit);
            }
        }
    }

    return placedCircles;
}
function findPolygonCentroid(circles) {
    if (circles.length < 3) {
        if (circles.length === 2) {
            return [
                (circles[0][0] + circles[1][0]) / 2,
                (circles[0][1] + circles[1][1]) / 2
            ];
        }
        return [
            svg.value.width / 2,
            svg.value.height / 2 
        ];
    }
    

    let area = 0;
    let centroidX = 0;
    let centroidY = 0;

    for (let i = 0; i < circles.length; i++) {
        const [x1, y1] = circles[i];
        const [x2, y2] = circles[(i + 1) % circles.length];

        const crossProduct = x1 * y2 - x2 * y1;
        area += crossProduct;
        centroidX += (x1 + x2) * crossProduct;
        centroidY += (y1 + y2) * crossProduct;
    }

    area = Math.abs(area) * 0.5; // always positive
    centroidX = Math.abs(centroidX / (6 * area));
    centroidY = Math.abs(centroidY / (6 * area));

    return [centroidX, centroidY];
}

const formattedDataset = computed(() => {
    return props.dataset.map((ds, i) => {
        const color = convertColorToHex(ds.color) || customPalette.value[i] || palette[i] || palette[i % palette.length];
        return {
            ...ds,
            id: createUid(),
            color,
        }
    });
});

const parentCircles = ref([]);
const circles = ref([]);

async function packSingleSet() {
    circles.value = 
    packCircles(
        formattedDataset.value,
        10000,
        10000,
        32
    );
}

const svg = computed(() => {
    return {
        width: 100,
        height: 100,
    }
});

onMounted(async () => {
    circles.value = [];
    parentCircles.value = [];
    await packSingleSet();
});

const viewBox = computed(() => {
    const min_c_x = circles.value.reduce((o, _o) => (_o.x - _o.radius < o.x - o.radius ? _o : o), circles.value[0]);
    const min_c_y = circles.value.reduce((o, _o) => (_o.y - _o.radius < o.y - o.radius ? _o : o), circles.value[0]);
    const max_c_x = circles.value.reduce((o, _o) => (_o.x + _o.radius > o.x + o.radius ? _o : o), circles.value[0]);
    const max_c_y = circles.value.reduce((o, _o) => (_o.y + _o.radius > o.y + o.radius ? _o : o), circles.value[0]);

    const minX = min_c_x?.x || 0;
    const maxX = max_c_x?.x || svg.value.width;
    const minY = min_c_y?.y || 0;
    const maxY = max_c_y?.y || svg.value.height;

    return {
        maxX,
        minX,
        width: Math.abs(maxX - minX) + (min_c_x ? min_c_x.radius : 0) + (max_c_x ? max_c_x.radius : 0) + (FINAL_CONFIG.value.style.chart.circles.strokeWidth * 4),
        height: Math.abs(maxY - minY) + (min_c_y ? min_c_y.radius : 0) + (max_c_y ? max_c_y.radius : 0) + (FINAL_CONFIG.value.style.chart.circles.strokeWidth * 4),
        x: min_c_x ? (min_c_x?.x - min_c_x?.radius) - (FINAL_CONFIG.value.style.chart.circles.strokeWidth * 2) : 0,
        y: min_c_y ? (min_c_y?.y - min_c_y?.radius) - (FINAL_CONFIG.value.style.chart.circles.strokeWidth * 2) : 0
    };
})

const donuts = computed(() => {
    return circles.value.map(c => {

        if (!c.breakdown) return;

        return makeDonut(
            { series: c.breakdown.map((b, i) => {
                return {
                    ...b,
                    color: convertColorToHex(b.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
                }
            }) },
            c.x,
            c.y,
            c.radius,
            c.radius,
            1.99999,
            2,
            1,
            360,
            105.25,
            c.radius / 2
        )
    })
})

const zoom = ref(null);
function zoomTo(circle) {
    zoom.value = circle;
}

const zoomRadiusStart = computed(() => {
    return zoom.value ? zoom.value.radius : 0;
})

const zoomRadiusEnd = computed(() => {
    return zoom.value ? (zoom.value.radius > (viewBox.value.width / 6 * FINAL_CONFIG.value.style.chart.circles.zoom.zoomRatio) ? zoom.value.radius : (viewBox.value.width / 6 * FINAL_CONFIG.value.style.chart.circles.zoom.zoomRatio)) : 0;
})

const zoomOpacity = ref(0);

const zoomStyle = computed(() => ({
    pointerEvents: 'none',
    opacity: zoomOpacity.value,
    filter: `drop-shadow(0px 0px 6px ${darkenHexColor(zoom.value.color, FINAL_CONFIG.value.style.chart.circles.zoom.shadowForce)})`
}));

const currentRadius = ref(zoomRadiusStart.value);

watchEffect(() => {
    currentRadius.value = zoomRadiusStart.value;
    zoomOpacity.value = 0; 
    let start = null;
    function animate(timestamp) {
        if (!start) {
            start = timestamp;
        }
        const progress = (timestamp - start) / FINAL_CONFIG.value.style.chart.circles.zoom.animationFrameMs;
        if (progress < 1) {
            currentRadius.value = zoomRadiusStart.value + (zoomRadiusEnd.value - zoomRadiusStart.value) * progress;
            zoomOpacity.value = 0 + (FINAL_CONFIG.value.style.chart.circles.zoom.opacity * progress);
            requestAnimationFrame(animate);
        } else {
            currentRadius.value = zoomRadiusEnd.value;
            zoomOpacity.value = FINAL_CONFIG.value.style.chart.circles.zoom.opacity;
        }
    }
    requestAnimationFrame(animate);
});

const labels = computed(() => {
    return {
        name: FINAL_CONFIG.value.style.chart.circles.zoom.labels.name.fontSize * viewBox.value.width / 300,
        value: FINAL_CONFIG.value.style.chart.circles.zoom.labels.value.fontSize * viewBox.value.width / 300
    }
})

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

</script>

<template>
    <div 
        :class="`vue-ui-circle-pack ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" 
        ref="circlePackChart" 
        :id="`vue-ui-circle-pack_${uid}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`"
    >
        <svg 
            :xmlns="XMLNS"
            :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`" 
            width="100%"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }"
            :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.chart.color};`"
        >
        
            
            <template v-for="circle in circles">
                
                <defs>
                    <radialGradient :id="circle.id" fy="30%">
                        <stop offset="10%" :stop-color="lightenHexColor(circle.color, FINAL_CONFIG.style.chart.circles.gradient.intensity / 100)"/>
                        <stop offset="90%" :stop-color="darkenHexColor(circle.color, 0.1)"/>
                        <stop offset="100%" :stop-color="circle.color"/>
                    </radialGradient>
                </defs>

                <circle 
                    :cx="circle.x" 
                    :cy="circle.y" 
                    :r="circle.radius"
                    :stroke="FINAL_CONFIG.style.chart.circles.stroke" 
                    :stroke-width="FINAL_CONFIG.style.chart.circles.strokeWidth"
                    :fill="FINAL_CONFIG.style.chart.circles.gradient.show ? `url(#${circle.id})`: circle.color" 
                    @mouseenter="() => zoomTo(circle)"
                    @mouseout="zoom = null"
                />
                <text
                    v-if="FINAL_CONFIG.style.chart.circles.labels.show"
                    :style="{
                        pointerEvents: 'none',
                        transition: 'opacity 0.2s ease-in-out'
                    }"
                    :opacity="zoom ? 0.2 : 1"
                    :x="circle.x"
                    :y="circle.y + ((circle.radius / circle.value.toFixed(FINAL_CONFIG.style.chart.circles.labels.rounding).length * 2) / 3)"
                    :font-size="circle.radius / circle.value.toFixed(FINAL_CONFIG.style.chart.circles.labels.rounding).length * 2"
                    :fill="FINAL_CONFIG.style.chart.circles.labels.color === 'auto' ? adaptColorToBackground(circle.color) : FINAL_CONFIG.style.chart.circles.labels.color"
                    :font-weight="FINAL_CONFIG.style.chart.circles.labels.bold ? 'bold' : 'normal'"
                    text-anchor="middle"
                >
                    {{ 
                        applyDataLabel(
                            FINAL_CONFIG.style.chart.circles.labels.formatter,
                            circle.value,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.circles.labels.prefix,
                                v: circle.value,
                                s: FINAL_CONFIG.style.chart.circles.labels.suffix,
                                r: FINAL_CONFIG.style.chart.circles.labels.rounding
                            })
                        )
                    }}
                </text>
                <template v-for="donut in donuts">
                    <template v-for="arc in donut">
                        <path
                            :d="arc.arcSlice"
                            :fill="arc.color"
                            stroke="black"
                        />
                    </template>
                </template>
            </template>

            <template v-if="zoom">
                <circle 
                    :style="zoomStyle"
                    :cx="zoom.x" 
                    :cy="zoom.y" 
                    :r="currentRadius" 
                    :opacity="zoomOpacity"
                    stroke="white" 
                    :fill="FINAL_CONFIG.style.chart.circles.gradient.show ? `url(#${zoom.id})`: zoom.color" 
                />
                <g v-if="$slots['zoom-label']" :style="{ pointerEvents: 'none' }">
                    <slot name="zoom-label" v-bind="{ ...zoom, zoomOpacity, currentRadius, fontSize: labelFontSize }" />
                </g>
                <g v-else>
                    <text
                        :style="{
                            pointerEvents: 'none'
                        }"
                        :opacity="zoomOpacity"
                        :x="zoom.x"
                        :y="zoom.y + FINAL_CONFIG.style.chart.circles.zoom.labels.name.offsetY - (labels.name / 4)"
                        text-anchor="middle"
                        :font-size="labels.name"
                        :fill="FINAL_CONFIG.style.chart.circles.zoom.labels.name.color === 'auto' ? adaptColorToBackground(zoom.color) : FINAL_CONFIG.style.chart.circles.zoom.labels.name.color"
                        :font-weight="FINAL_CONFIG.style.chart.circles.zoom.labels.name.bold ? 'bold' : 'auto'"
                    >
                        {{ zoom.name }}
                    </text>
                    <text
                        :style="{
                            pointerEvents: 'none',
                        }"
                        :opacity="zoomOpacity"
                        :x="zoom.x"
                        :y="zoom.y + labels.value + FINAL_CONFIG.style.chart.circles.zoom.labels.value.offsetY"
                        text-anchor="middle"
                        :font-size="labels.value"
                        :fill="FINAL_CONFIG.style.chart.circles.zoom.labels.value.color === 'auto' ? adaptColorToBackground(zoom.color) : FINAL_CONFIG.style.chart.circles.zoom.labels.value.color"
                        :font-weight="FINAL_CONFIG.style.chart.circles.zoom.labels.value.bold ? 'bold' : 'normal'"
                    >
                        {{ 
                            applyDataLabel(
                                FINAL_CONFIG.style.chart.circles.zoom.labels.value.formatter,
                                zoom.value,
                                dataLabel({
                                    p: FINAL_CONFIG.style.chart.circles.zoom.labels.value.prefix,
                                    v: zoom.value,
                                    s: FINAL_CONFIG.style.chart.circles.zoom.labels.value.suffix,
                                    r: FINAL_CONFIG.style.chart.circles.zoom.labels.value.rounding
                                })
                            )
                        }}
                    </text>
                </g>
            </template>
        </svg>
    </div>

</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-circle-pack * {
    transition: unset;
}

.vue-ui-circle-pack {
    position: relative;
    user-select: none;
}

.vue-ui-circle-pack-zoom {
    opacity: 0;
    animation: zoomCircle 0.2s ease-in-out forwards;
    -webkit-animation: zoomCircle 0.2s ease-in-out forwards;
    -moz-animation: zoomCircle 0.2s ease-in-out forwards;
    -o-animation: zoomCircle 0.2s ease-in-out forwards;
}

@keyframes zoomCircle {
    from {
        r: v-bind(zoomRadiusStart);
        opacity: 0;
    }
    to {
        r: v-bind(zoomRadiusEnd);
        opacity: 1;
    }
}
</style>
