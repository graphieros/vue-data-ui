<script setup>
import { ref, computed, onMounted, useSlots, watch, nextTick } from 'vue'
import { useConfig } from '../useConfig';
import { convertColorToHex, convertCustomPalette, createUid, error, objectIsEmpty, palette } from '../lib';
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

function resolveOverlaps(circles) {
    let moved = false;
    for (let i = 0; i < circles.length; i += 1) {
        for (let j = i + 1; j < circles.length; j += 1) {
            let c1 = circles[i],
                c2 = circles[j]
            let d = distance(c1, c2);
            let minDist = c1.radius + c2.radius;

            if (d < minDist) {
                let overlap = minDist - d;
                let angle = Math.atan2(c2.y - c1.y, c2.x - c1.x);

                let moveX = Math.cos(angle) * (overlap / 2);
                let moveY = Math.sin(angle) * (overlap / 2);

                c1.x -= moveX;
                c1.y -= moveY;
                c2.x += moveX;
                c2.y += moveY;

                moved = true;
            }
        }
    }
    return moved;
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

    const radii = dp.map((d, index) => {
        return {
            ...d,
            radius: (d.value / maxDataPoint) * maxRadius,
            index
        }
    });

    const sortedCircles = radii.map((r, index) => {
        return ({ 
            ...r,
            radius: r.radius,
            index
        })
    }).toSorted((a, b) => b.radius - a.radius);

    let placedCircles = [];

    placedCircles.push({ 
        ...sortedCircles[0],
        x: width / 2 + offsetX, 
        y: height / 2 + offsetY, 
        radius: sortedCircles[0].radius,
    });

    for (let { radius, ...el } of sortedCircles.slice(1)) {
        let position = findInitialPosition(placedCircles, radius, width, height);
        if (position) {
            placedCircles.push({ x: position.x, y: position.y, radius, ...el });
        } else {
            let bestFit = null;
            let minOverlap = Infinity;

            for (let circle of placedCircles) {

                for (let angle = 0; angle < 360; angle += 15) {
                    let rad = (angle * Math.PI) / 180;
                    let x = circle.x + (radius + circle.radius) * Math.cos(rad);
                    let y = circle.y + (radius + circle.radius) * Math.sin(rad);

                    let candidate = { ...circle, x, y, radius };

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

    let iterations = 1000;
    while (iterations-- > 0 && resolveOverlaps(placedCircles));

    return placedCircles;
}

const formattedDataset = computed(() => {
    return props.dataset.map((ds, i) => {
        const parentId = createUid()
        const color = convertColorToHex(ds.color) || customPalette.value[i] || palette[i] || palette[i % palette.length];
        return {
            ...ds,
            id: parentId,
            color,
            value: ds.children.map(c => c.value).reduce((a, b) => a + b, 0),
            children: ds.children.map(c => {
                return {
                    ...c,
                    parentId,
                    parentName: ds.name,
                    color: convertColorToHex(c.color) || color,
                    id: createUid()
                }
            })
        }
    })
})

const flatDataset = computed(() => {
    return formattedDataset.value.flatMap(ds => [ds, ...ds.children]);
});

function getColor(id) {
    return flatDataset.value.find(el => el.id === id).color
}

const parentCircles = ref([]);
const circles = ref([]);

async function packParents() {
    parentCircles.value.push(
        packCircles(
            formattedDataset.value.map(d => {
                return {
                    value: d.value,
                    id: d.id,
                    color: d.color,
                    name: d.name
                }
            }),
            FINAL_CONFIG.value.style.chart.width,
            FINAL_CONFIG.value.style.chart.height,
            svg.value.width / FINAL_CONFIG.value.style.chart.circles.maxRadiusRatio
        )
    )
}

onMounted(async () => {
    circles.value = [];
    parentCircles.value = [];
    
    await packParents().then(() => {
        if (parentCircles.value.length) {
            parentCircles.value.flat().forEach((p, i) => {
                circles.value.push(
                    packCircles(
                        formattedDataset.value[i].children,
                        FINAL_CONFIG.value.style.chart.width,
                        FINAL_CONFIG.value.style.chart.height,
                        p.radius / 8,
                        p.x - (FINAL_CONFIG.value.style.chart.width / 2),
                        p.y - (FINAL_CONFIG.value.style.chart.height / 2)
                    )
                )
            })
        }
    })

})

const svg = computed(() => {
    return {
        width: FINAL_CONFIG.value.style.chart.width,
        height: FINAL_CONFIG.value.style.chart.height,
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
        :class="`vue-ui-waffle ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" 
        ref="circlePackChart" 
        :id="`vue-ui-circle-pack_${uid}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`"
    >

        <svg :viewBox="`0 0 ${svg.width} ${svg.height}`" width="100%">
            <template v-for="pack in parentCircles">            
                <circle v-for="(circle, index) in pack" :key="index" :cx="circle.x" :cy="circle.y" :r="circle.radius"
                    stroke="white" :fill="getColor(circle.id)" />
            </template>
            <template v-for="pack in circles">            
                <circle v-for="(circle, index) in pack" :key="index" :cx="circle.x" :cy="circle.y" :r="circle.radius"
                    stroke="white" :fill="getColor(circle.id)" />
            </template>
        </svg>
    </div>

</template>
