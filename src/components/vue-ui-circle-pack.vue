<script setup>
import { ref, computed, onMounted, watch, watchEffect, nextTick } from 'vue'
import { useConfig } from '../useConfig';
import { 
    XMLNS, 
    adaptColorToBackground, 
    applyDataLabel, 
    convertColorToHex, 
    convertCustomPalette, 
    createCsvContent, 
    createUid, 
    darkenHexColor, 
    dataLabel, 
    downloadCsv, 
    error, 
    lightenHexColor, 
    makeDonut, 
    objectIsEmpty, 
    palette,
    themePalettes
} from '../lib';
import themes from "../themes.json";
import { useNestedProp } from '../useNestedProp';
import { usePrinter } from '../usePrinter';
import Title from '../atoms/Title.vue';
import PenAndPaper from '../atoms/PenAndPaper.vue';
import UserOptions from '../atoms/UserOptions.vue';
import { useUserOptionState } from '../useUserOptionState';
import PackageVersion from '../atoms/PackageVersion.vue';
import Accordion from "./vue-ui-accordion.vue";
import DataTable from '../atoms/DataTable.vue';
import Skeleton from "./vue-ui-skeleton.vue";

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

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length
});

const uid = ref(createUid());
const circlePackChart = ref(null);
const chartTitle = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const step = ref(0);
const source = ref(null);

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

const { 
    userOptionsVisible, 
    setUserOptionsVisibility, 
    keepUserOptionState 
} = useUserOptionState({ config: FINAL_CONFIG.value });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });

    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_circle_pack[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        return mergedConfig;
    }
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;

    // Reset mutable config
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-circle-pack_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-circle-pack'
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
});

async function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiCirclePack',
            type: 'dataset'
        })
    }
    await packSingleSet();
}

onMounted(prepareChart);

watch(() => props.dataset, async (_ds) => {
    await prepareChart();
}, { deep: true })

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

const formattedDataset = computed(() => {
    return props.dataset.map((ds, i) => {
        const color = convertColorToHex(ds.color) || customPalette.value[i] || themePalettes[FINAL_CONFIG.value.theme || 'default'][i % themePalettes[FINAL_CONFIG.value.theme || 'default'].length] || palette[i] || palette[i % palette.length];
        return {
            ...ds,
            id: createUid(),
            color,
        }
    }).filter(ds => ![null, undefined, Infinity, -Infinity].includes(ds.value))
});

const circles = ref([]);

const maxRadius = computed(() => {
    return Math.max(...circles.value.map(c => c.radius))
})

function calcOffsetY(radius, offset) {
    return offset / maxRadius.value * radius;
}

async function packSingleSet() {
    circles.value = 
    packCircles(
        formattedDataset.value,
        // Huge plane size to place all datapoints
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
    if (!FINAL_CONFIG.value.style.chart.circles.zoom.show) return;
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

const zoomLabelFontSizes = computed(() => {
    return {
        name: FINAL_CONFIG.value.style.chart.circles.zoom.label.name.fontSize * viewBox.value.width / 300,
        value: FINAL_CONFIG.value.style.chart.circles.zoom.label.value.fontSize * viewBox.value.width / 300
    }
});

function getCircleLabel(circle) {
    return applyDataLabel(
        FINAL_CONFIG.value.style.chart.circles.labels.value.formatter,
        circle.value,
        dataLabel({
            p: FINAL_CONFIG.value.style.chart.circles.labels.value.prefix,
            v: circle.value,
            s: FINAL_CONFIG.value.style.chart.circles.labels.value.suffix,
            r: FINAL_CONFIG.value.style.chart.circles.labels.value.rounding
        })
    )
}

function getZoomLabel() {
    return applyDataLabel(
        FINAL_CONFIG.value.style.chart.circles.zoom.label.value.formatter,
        zoom.value.value,
        dataLabel({
            p: FINAL_CONFIG.value.style.chart.circles.zoom.label.value.prefix,
            v: zoom.value.value,
            s: FINAL_CONFIG.value.style.chart.circles.zoom.label.value.suffix,
            r: FINAL_CONFIG.value.style.chart.circles.zoom.label.value.rounding
        })
    )
}

function getValueFontSize(circle) {
    if (!circle) {
        return 0
    }

    const max = circle.radius / (getCircleLabel(circle).length) * (getCircleLabel(circle).length === 1 ? 1 : 2);
    return Math.min(circle.radius / 2.5, max);
}

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

const table = computed(() => {
    const head = formattedDataset.value.map(d => {
        return {
            name: d.name,
            value: d.value,
            color: d.color
        }
    }).toSorted((a, b) => b.value - a.value);

    const body = head.map(h => h.value);
    return { head, body };
});

function generateCsv() {
    nextTick(() => {
        const labels = table.value.head.map((h, i) => {
            return [[
                h.name
            ], [table.value.body[i]]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text], [FINAL_CONFIG.value.style.chart.title.subtitle.text], [[""], [FINAL_CONFIG.value.table.columnNames.value],]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-circle-pack" })
    });
}

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.columnNames.datapoint,
        FINAL_CONFIG.value.table.columnNames.value
    ];

    const body = table.value.head.map((h, i) => {
        const label = dataLabel({
            p: FINAL_CONFIG.value.style.chart.circles.labels.value.prefix,
            v: table.value.body[i],
            s: FINAL_CONFIG.value.style.chart.circles.labels.value.suffix,
            r: FINAL_CONFIG.value.style.chart.circles.labels.value.rounding
        });
        return [
            {
                color: h.color,
                name: h.name
            },
            label
        ]
    });

    const config = {
        th: {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            outline: FINAL_CONFIG.value.table.th.outline
        },
        td: {
            backgroundColor: FINAL_CONFIG.value.table.td.backgroundColor,
            color: FINAL_CONFIG.value.table.td.color,
            outline: FINAL_CONFIG.value.table.td.outline
        },
        breakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint
    }

    const colNames = [
        FINAL_CONFIG.value.table.columnNames.datapoint,
        FINAL_CONFIG.value.table.columnNames.value,
    ]

    return {
        colNames,
        head,
        body,
        config
    }
})

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function getData() {
    return formattedDataset.value;
}

defineExpose({
    getData,
    generateCsv,
    generatePdf,
    generateImage,
    toggleTable,
    toggleAnnotator
});

</script>

<template>
    <div 
        :id="`vue-ui-circle-pack_${uid}`"
        :class="`vue-ui-circle-pack ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" 
        ref="circlePackChart" 
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`"
        @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)"
    >

        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :parent="circlePackChart"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <slot name="userConfig"/>

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;padding-bottom:12px`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'donut-div-title',
                        ...FINAL_CONFIG.style.chart.title,
                    },
                    subtitle: {
                        cy: 'donut-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="false"
            :hasLabel="false"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :chartElement="circlePackChart"
            :position="FINAL_CONFIG.userOptions.position"
            :titles="{...FINAL_CONFIG.userOptions.buttonTitles }"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleAnnotator="toggleAnnotator"
            :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }"
        >
            <template #optionPdf v-if="$slots.optionPdf">
                <slot name="optionPdf" />
            </template>
            <template #optionCsv v-if="$slots.optionCsv">
                <slot name="optionCsv" />
            </template>
            <template #optionImg v-if="$slots.optionImg">
                <slot name="optionImg" />
            </template>
            <template #optionTable v-if="$slots.optionTable">
                <slot name="optionTable" />
            </template>
            <template v-if="$slots.optionFullscreen" #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <svg 
            v-if="isDataset"
            :xmlns="XMLNS"
            :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`" 
            width="100%"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }"
            :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.chart.color};`"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="viewBox.x"
                :y="viewBox.y"
                :width="viewBox.width"
                :height="viewBox.height"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>

            <template v-for="circle in circles">
                <defs>
                    <radialGradient :id="circle.id" fy="30%">
                        <stop offset="10%" :stop-color="lightenHexColor(circle.color, FINAL_CONFIG.style.chart.circles.gradient.intensity / 100)"/>
                        <stop offset="90%" :stop-color="darkenHexColor(circle.color, 0.1)"/>
                        <stop offset="100%" :stop-color="circle.color"/>
                    </radialGradient>
                </defs>

                <g v-if="$slots.pattern">
                    <defs>
                        <slot name="pattern" v-bind="{...circle, patternId: `pattern_${uid}_${circle.id}`}"/>
                    </defs>
                </g>

                <!-- 'CIRCLE' (using rect as circle does not css transition properly) -->
                <rect
                    :x="circle.x - circle.radius"
                    :y="circle.y - circle.radius"
                    :width="circle.radius * 2"
                    :height="circle.radius * 2"
                    :stroke="FINAL_CONFIG.style.chart.circles.stroke" 
                    :stroke-width="FINAL_CONFIG.style.chart.circles.strokeWidth"
                    :fill="FINAL_CONFIG.style.chart.circles.gradient.show ? `url(#${circle.id})`: circle.color" 
                    :rx="circle.radius"
                    @mouseenter="() => zoomTo(circle)"
                    @mouseout="zoom = null"
                />
                <rect
                    v-if="$slots.pattern"
                    :x="circle.x - circle.radius"
                    :y="circle.y - circle.radius"
                    :width="circle.radius * 2"
                    :height="circle.radius * 2"
                    :stroke="FINAL_CONFIG.style.chart.circles.stroke" 
                    :stroke-width="FINAL_CONFIG.style.chart.circles.strokeWidth"
                    :fill="`url(#pattern_${uid}_${circle.id})`" 
                    :rx="circle.radius"
                    :style="{
                        pointerEvents: 'none'
                    }"
                />

                <!-- LABEL NAME -->
                <text
                    v-if="FINAL_CONFIG.style.chart.circles.labels.name.show && circle.name"
                    :style="{
                        pointerEvents: 'none',
                        transition: 'opacity 0.2s ease-in-out'
                    }"
                    :opacity="zoom ? 0.2 : 1"
                    :x="circle.x"
                    :y="circle.y + calcOffsetY(circle.radius, FINAL_CONFIG.style.chart.circles.labels.name.offsetY) - circle.radius / 6"
                    :font-size="(circle.radius / 3) * FINAL_CONFIG.style.chart.circles.labels.name.fontSizeRatio"
                    :fill="!FINAL_CONFIG.style.chart.circles.labels.name.color ? adaptColorToBackground(circle.color) : FINAL_CONFIG.style.chart.circles.labels.name.color"
                    :font-weight="FINAL_CONFIG.style.chart.circles.labels.name.bold ? 'bold' : 'normal'"
                    text-anchor="middle"
                >
                    {{ circle.name }}
                </text>

                <!-- LABEL VALUE -->
                <text
                    v-if="FINAL_CONFIG.style.chart.circles.labels.value.show"
                    :style="{
                        pointerEvents: 'none',
                        transition: 'opacity 0.2s ease-in-out'
                    }"
                    :opacity="zoom ? 0.2 : 1"
                    :x="circle.x"
                    :y="circle.y + calcOffsetY(circle.radius, FINAL_CONFIG.style.chart.circles.labels.value.offsetY) + circle.radius / 3"
                    :font-size="getValueFontSize(circle) * FINAL_CONFIG.style.chart.circles.labels.value.fontSizeRatio"
                    :fill="!FINAL_CONFIG.style.chart.circles.labels.value.color ? adaptColorToBackground(circle.color) : FINAL_CONFIG.style.chart.circles.labels.value.color"
                    :font-weight="FINAL_CONFIG.style.chart.circles.labels.value.bold ? 'bold' : 'normal'"
                    text-anchor="middle"
                >
                    {{ getCircleLabel(circle) }}
                </text>

                <!-- DONUTS -->
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

            <template v-if="zoom && FINAL_CONFIG.style.chart.circles.zoom.show">
                <circle 
                    :style="zoomStyle"
                    :cx="zoom.x" 
                    :cy="zoom.y" 
                    :r="currentRadius" 
                    :opacity="zoomOpacity"
                    :stroke="FINAL_CONFIG.style.chart.circles.stroke" 
                    :fill="FINAL_CONFIG.style.chart.circles.gradient.show ? `url(#${zoom.id})`: zoom.color" 
                />

                <g v-if="$slots['zoom-label']" :style="{ pointerEvents: 'none' }">
                    <slot name="zoom-label" v-bind="{ ...zoom, zoomOpacity, currentRadius, fontSize: zoomLabelFontSizes }" />
                </g>

                <g v-else>
                    <!-- ZOOM LABEL NAME -->
                    <text
                        :style="{
                            pointerEvents: 'none'
                        }"
                        :opacity="zoomOpacity"
                        :x="zoom.x"
                        :y="zoom.y + FINAL_CONFIG.style.chart.circles.zoom.label.name.offsetY - (zoomLabelFontSizes.name / 4)"
                        text-anchor="middle"
                        :font-size="zoomLabelFontSizes.name"
                        :fill="!FINAL_CONFIG.style.chart.circles.zoom.label.name.color ? adaptColorToBackground(zoom.color) : FINAL_CONFIG.style.chart.circles.zoom.label.name.color"
                        :font-weight="FINAL_CONFIG.style.chart.circles.zoom.label.name.bold ? 'bold' : 'normal'"
                    >
                        {{ zoom.name }}
                    </text>

                    <!-- ZOOM LABEL VALUE -->
                    <text
                        :style="{
                            pointerEvents: 'none',
                        }"
                        :opacity="zoomOpacity"
                        :x="zoom.x"
                        :y="zoom.y + zoomLabelFontSizes.value + FINAL_CONFIG.style.chart.circles.zoom.label.value.offsetY"
                        text-anchor="middle"
                        :font-size="zoomLabelFontSizes.value"
                        :fill="!FINAL_CONFIG.style.chart.circles.zoom.label.value.color ? adaptColorToBackground(zoom.color) : FINAL_CONFIG.style.chart.circles.zoom.label.value.color"
                        :font-weight="FINAL_CONFIG.style.chart.circles.zoom.label.value.bold ? 'bold' : 'normal'"
                    >
                        {{ getZoomLabel() }}
                    </text>
                </g>
            </template>

            <slot name="svg" :svg="{ ...viewBox }"/>
        </svg>

        <Skeleton 
            v-if="!isDataset"
            :config="{
                type: 'circlePack',
                style: {
                    color: '#CCCCCC',
                }
            }"
        />

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <Accordion
            hideDetails
            v-if="isDataset"
            :config="{
                open: mutableConfig.showTable,
                maxHeight: 10000,
                body: {
                    backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                    color: FINAL_CONFIG.style.chart.color
                },
                head: {
                    backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                    color: FINAL_CONFIG.style.chart.color
                }
            }"
        >
            <template #content>
                <DataTable
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames" 
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false">
                    <template #th="{ th }">
                        <div v-html="th" style="display:flex;align-items:center"></div>
                    </template>
                    <template #td="{ td }">
                        {{ td.name || td }}
                    </template>
                </DataTable>
            </template>
        </Accordion>
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

rect {
    transition: all 0.2s ease-in-out !important;
}
</style>
