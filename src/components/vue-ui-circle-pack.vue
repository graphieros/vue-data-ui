<script setup>
import { ref, computed, onMounted, watch, watchEffect, nextTick, defineAsyncComponent, shallowRef, onBeforeUnmount } from 'vue'
import { useConfig } from '../useConfig';
import {
    XMLNS,
    adaptColorToBackground,
    applyDataLabel,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createTSpans,
    createUid,
    darkenHexColor,
    dataLabel,
    downloadCsv,
    error,
    lightenHexColor,
    objectIsEmpty,
    palette,
    themePalettes
} from '../lib';
import { useNestedProp } from '../useNestedProp';
import { usePrinter } from '../usePrinter';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import { pack, bounds } from "../packCircles";
import { throttle } from '../canvas-lib';
import { useResponsive } from '../useResponsive';
import themes from "../themes.json";
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode

const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const Skeleton = defineAsyncComponent(() => import('./vue-ui-skeleton.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));

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

const emit = defineEmits(['selectDatapoint']);

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

const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

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
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-circle-pack',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
});

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

const SIZE = ref({ h: 10, w: 10 });
const titleSize = ref(0);
const boundValues = ref([0, 0, 100, 100]);
const PARENT_SIZE = ref({ h: 0, w: 0});

async function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiCirclePack',
            type: 'dataset'
        })
    }

    circles.value = await pack(formattedDataset.value)
    viewBox.value = bounds(circles.value, 1).join(' ')

    PARENT_SIZE.value = getParentDimensions(circlePackChart.value)

    const handleResize = throttle(() => {
        const { width, height, heightTitle, heightNoTitle } = useResponsive({
            chart: circlePackChart.value,
            title: chartTitle.value,
            noTitle: noTitle.value
        })

        const computedWidth = width || 10;
        const computedHeight = height && height > 10 ? height : 10;

        titleSize.value = FINAL_CONFIG.value.style.chart.title.text ? heightTitle : heightNoTitle

        requestAnimationFrame(() => {
            SIZE.value.w = computedWidth
            SIZE.value.h = computedHeight - titleSize.value
            nextTick(async () => {
                const freshDataset = formattedDataset.value.map(c => ({ ...c }));
                circles.value = await pack(freshDataset, SIZE.value.h, SIZE.value.w);
                boundValues.value = bounds(circles.value, 1)
                viewBox.value = boundValues.value.join(' ');
                PARENT_SIZE.value = getParentDimensions(circlePackChart.value)
            })
        })
    });

    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }

    resizeObserver.value = new ResizeObserver(handleResize);
    observedEl.value = circlePackChart.value.parentNode;
    resizeObserver.value.observe(observedEl.value);
}

onMounted(prepareChart);

onBeforeUnmount(() => {
    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }
});

function getParentDimensions(component) {
    if (!component || !component.parentElement) {
        console.warn("Component or parent element is missing.");
        return { w: 0, h: 0 };
    }

    const parent = component.parentElement;

    if (parent.offsetWidth > 0 && parent.offsetHeight > 0) {
        return { w: parent.offsetWidth, h: parent.offsetHeight };
    }

    const computedStyle = window.getComputedStyle(parent);
    const width = computedStyle.width;
    const height = computedStyle.height;

    if (width !== 'auto' && height !== 'auto' &&
        parseFloat(width) > 0 && parseFloat(height) > 0) {
        return { w: parseFloat(width), h: parseFloat(height) };
    }

    return { w: 0, h: 0 };
}


watch(() => props.dataset, async (_ds) => {
    await prepareChart();
}, { deep: true })

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})



const formattedDataset = computed(() => {
    return props.dataset.map((ds, i) => {
        const color = convertColorToHex(ds.color) || customPalette.value[i] || themePalettes[FINAL_CONFIG.value.theme || 'default'][i % themePalettes[FINAL_CONFIG.value.theme || 'default'].length] || palette[i] || palette[i % palette.length];
        return {
            ...ds,
            r: ds.value,
            id: createUid(),
            color,
        }
    }).filter(ds => ![null, undefined, Infinity, -Infinity].includes(ds.value))
});

const circles = ref([]);
const viewBox = ref('0 0 100 100')

const maxRadius = computed(() => {
    return Math.max(...circles.value.map(c => c.r))
})

function calcOffsetY(radius, offset) {
    return offset / maxRadius.value * radius;
}

const zoom = ref(null);
function zoomTo(circle) {
    if (!FINAL_CONFIG.value.style.chart.circles.zoom.show) return;
    zoom.value = circle;
}

const zoomRadiusStart = computed(() => {
    return zoom.value ? zoom.value.r : 0;
})

const zoomRadiusEnd = computed(() => {
    if (isAnnotator.value) return zoomRadiusStart.value;
    return zoom.value ? (zoom.value.r > (boundValues.value[3] / 6 * FINAL_CONFIG.value.style.chart.circles.zoom.zoomRatio) ? zoom.value.r : (boundValues.value[3] / 6 * FINAL_CONFIG.value.style.chart.circles.zoom.zoomRatio)) : 0;
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
        name: FINAL_CONFIG.value.style.chart.circles.zoom.label.name.fontSize * boundValues.value[3] / 300,
        value: FINAL_CONFIG.value.style.chart.circles.zoom.label.value.fontSize * boundValues.value[3] / 300
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

    const max = circle.r / (getCircleLabel(circle).length) * (getCircleLabel(circle).length === 1 ? 1 : 2);
    return Math.min(circle.r / 2.5, max);
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
    <div :id="`vue-ui-circle-pack_${uid}`"
        :class="`vue-ui-circle-pack ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" ref="circlePackChart"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}; height: ${PARENT_SIZE.h}px; width:${PARENT_SIZE.w}px`"
        @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
        <PenAndPaper v-if="FINAL_CONFIG.userOptions.buttons.annotator" :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator" :scale="maxRadius / 100" @close="toggleAnnotator" />

        <slot name="userConfig" />

        <div ref="noTitle" v-if="hasOptionsNoTitle" class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`" />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text"
            :style="`width:100%;background:transparent;padding-bottom:12px`">
            <Title :key="`title_${titleStep}`" :config="{
                title: {
                    cy: 'donut-div-title',
                    ...FINAL_CONFIG.style.chart.title,
                },
                subtitle: {
                    cy: 'donut-div-subtitle',
                    ...FINAL_CONFIG.style.chart.title.subtitle
                }
            }" />
        </div>

        <UserOptions ref="details" :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting" :isImaging="isImaging" :uid="uid" :hasTooltip="false" :hasLabel="false"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf" :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv" :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen" :isFullscreen="isFullscreen"
            :chartElement="circlePackChart" :position="FINAL_CONFIG.userOptions.position" :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator" :isAnnotation="isAnnotator"
            @toggleFullscreen="toggleFullscreen" @generatePdf="generatePdf" @generateCsv="generateCsv"
            @generateImage="generateImage" @toggleTable="toggleTable" @toggleAnnotator="toggleAnnotator" :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }">
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }" />
            </template>
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
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }" />
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <svg ref="svgRef" v-if="isDataset" :xmlns="XMLNS" :viewBox="viewBox" :height="SIZE.h" :width="SIZE.w"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }"
            :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.chart.color};background:${FINAL_CONFIG.style.chart.backgroundColor};`">
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject v-if="$slots['chart-background']" :x="viewBox.x" :y="viewBox.y" :width="viewBox.width"
                :height="viewBox.height" :style="{
                    pointerEvents: 'none'
                }">
                <slot name="chart-background" />
            </foreignObject>

            <template v-for="circle in circles">
                <defs>
                    <radialGradient :id="circle.id" fy="30%">
                        <stop offset="10%"
                            :stop-color="lightenHexColor(circle.color, FINAL_CONFIG.style.chart.circles.gradient.intensity / 100)" />
                        <stop offset="90%" :stop-color="darkenHexColor(circle.color, 0.1)" />
                        <stop offset="100%" :stop-color="circle.color" />
                    </radialGradient>
                </defs>

                <g v-if="$slots.pattern">
                    <defs>
                        <slot name="pattern" v-bind="{ ...circle, patternId: `pattern_${uid}_${circle.id}` }" />
                    </defs>
                </g>

                <!-- 'CIRCLE' (using rect as circle does not css transition properly) -->
                <rect data-cy="datapoint-circle" :x="circle.x - circle.r" :y="circle.y - circle.r" :width="circle.r * 2"
                    :height="circle.r * 2" :stroke="FINAL_CONFIG.style.chart.circles.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.circles.strokeWidth * maxRadius / 100"
                    :fill="FINAL_CONFIG.style.chart.circles.gradient.show ? `url(#${circle.id})` : circle.color"
                    :rx="circle.r" @mouseenter="() => zoomTo(circle)" @mouseout="zoom = null"
                    @click="emit('selectDatapoint', circle)" />
                <rect v-if="$slots.pattern" :x="circle.x - circle.r" :y="circle.y - circle.r" :width="circle.r * 2"
                    :height="circle.r * 2" :stroke="FINAL_CONFIG.style.chart.circles.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.circles.strokeWidth * maxRadius / 100"
                    :fill="`url(#pattern_${uid}_${circle.id})`" :rx="circle.r" :style="{
                        pointerEvents: 'none'
                    }" />

                <slot name="data-label" v-if="$slots['data-label']"
                    v-bind="{ ...circle, createTSpans, fontSize: { name: (circle.r / 3) * FINAL_CONFIG.style.chart.circles.labels.name.fontSizeRatio, value: getValueFontSize(circle) * FINAL_CONFIG.style.chart.circles.labels.value.fontSizeRatio }, color: !FINAL_CONFIG.style.chart.circles.labels.name.color ? adaptColorToBackground(circle.color) : FINAL_CONFIG.style.chart.circles.labels.name.color }" />

                <template v-else>
                    <!-- LABEL NAME -->
                    <text data-cy="label-name" v-if="FINAL_CONFIG.style.chart.circles.labels.name.show && circle.name"
                        :style="{
                            pointerEvents: 'none',
                            transition: 'opacity 0.2s ease-in-out'
                        }" :opacity="(zoom && !isAnnotator) ? 0.2 : 1" :x="circle.x"
                        :y="circle.y + calcOffsetY(circle.r, FINAL_CONFIG.style.chart.circles.labels.name.offsetY) - circle.r / 10"
                        :font-size="(circle.r / 3) * FINAL_CONFIG.style.chart.circles.labels.name.fontSizeRatio"
                        :fill="!FINAL_CONFIG.style.chart.circles.labels.name.color ? adaptColorToBackground(circle.color) : FINAL_CONFIG.style.chart.circles.labels.name.color"
                        :font-weight="FINAL_CONFIG.style.chart.circles.labels.name.bold ? 'bold' : 'normal'"
                        text-anchor="middle">
                        {{ circle.name }}
                    </text>

                    <!-- LABEL VALUE -->
                    <text data-cy="label-value" v-if="FINAL_CONFIG.style.chart.circles.labels.value.show" :style="{
                        pointerEvents: 'none',
                        transition: 'opacity 0.2s ease-in-out'
                    }" :opacity="(zoom && !isAnnotator) ? 0.2 : 1" :x="circle.x"
                        :y="circle.y + calcOffsetY(circle.r, FINAL_CONFIG.style.chart.circles.labels.value.offsetY) + circle.r / 2.5"
                        :font-size="getValueFontSize(circle) * FINAL_CONFIG.style.chart.circles.labels.value.fontSizeRatio"
                        :fill="!FINAL_CONFIG.style.chart.circles.labels.value.color ? adaptColorToBackground(circle.color) : FINAL_CONFIG.style.chart.circles.labels.value.color"
                        :font-weight="FINAL_CONFIG.style.chart.circles.labels.value.bold ? 'bold' : 'normal'"
                        text-anchor="middle">
                        {{ getCircleLabel(circle) }}
                    </text>
                </template>
            </template>

            <template v-if="zoom && FINAL_CONFIG.style.chart.circles.zoom.show && !isAnnotator">
                <circle data-cy="datapoint-zoom" :style="zoomStyle" :cx="zoom.x" :cy="zoom.y" :r="currentRadius"
                    :opacity="zoomOpacity" :stroke="FINAL_CONFIG.style.chart.circles.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.circles.strokeWidth * maxRadius / 100"
                    :fill="FINAL_CONFIG.style.chart.circles.gradient.show ? `url(#${zoom.id})` : zoom.color" />

                <g v-if="$slots['zoom-label']" :style="{ pointerEvents: 'none' }">
                    <slot name="zoom-label"
                        v-bind="{ ...zoom, zoomOpacity, currentRadius, fontSize: zoomLabelFontSizes }" />
                </g>

                <g v-else>
                    <!-- ZOOM LABEL NAME -->
                    <text data-cy="datapoint-zoom-label-name" :style="{
                        pointerEvents: 'none'
                    }" :opacity="zoomOpacity" :x="zoom.x"
                        :y="zoom.y + FINAL_CONFIG.style.chart.circles.zoom.label.name.offsetY - (zoomLabelFontSizes.name / 4)"
                        text-anchor="middle" :font-size="zoomLabelFontSizes.name"
                        :fill="!FINAL_CONFIG.style.chart.circles.zoom.label.name.color ? adaptColorToBackground(zoom.color) : FINAL_CONFIG.style.chart.circles.zoom.label.name.color"
                        :font-weight="FINAL_CONFIG.style.chart.circles.zoom.label.name.bold ? 'bold' : 'normal'">
                        {{ zoom.name }}
                    </text>

                    <!-- ZOOM LABEL VALUE -->
                    <text data-cy="datapoint-zoom-label-value" :style="{
                        pointerEvents: 'none',
                    }" :opacity="zoomOpacity" :x="zoom.x"
                        :y="zoom.y + zoomLabelFontSizes.value + FINAL_CONFIG.style.chart.circles.zoom.label.value.offsetY"
                        text-anchor="middle" :font-size="zoomLabelFontSizes.value"
                        :fill="!FINAL_CONFIG.style.chart.circles.zoom.label.value.color ? adaptColorToBackground(zoom.color) : FINAL_CONFIG.style.chart.circles.zoom.label.value.color"
                        :font-weight="FINAL_CONFIG.style.chart.circles.zoom.label.value.bold ? 'bold' : 'normal'">
                        {{ getZoomLabel() }}
                    </text>
                </g>
            </template>

            <slot name="svg" :svg="{ ...viewBox }" />
        </svg>

        <Skeleton v-if="!isDataset" :config="{
            type: 'circlePack',
            style: {
                color: '#CCCCCC',
            }
        }" />

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }" />
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <Accordion hideDetails v-if="isDataset" :config="{
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
        }">
            <template #content>
                <DataTable :key="`table_${tableStep}`" :colNames="dataTable.colNames" :head="dataTable.head"
                    :body="dataTable.body" :config="dataTable.config"
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
    width: 100%;
    height: 100%;
    min-height: 300px;
    overflow: visible;
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

rect,
text {
    transition: all 0.2s ease-in-out !important;
}
</style>
