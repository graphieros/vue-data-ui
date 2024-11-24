<script setup>
import { ref, computed, nextTick, onMounted, watch } from "vue";
import {
    applyDataLabel,
    checkNaN,
    createCsvContent, 
    createUid,
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    isFunction,
    objectIsEmpty,
    setOpacity,
    shiftHue,
    XMLNS
} from '../lib';
import { throttle } from "../canvas-lib";
import themes from "../themes.json";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Tooltip from "../atoms/Tooltip.vue";
import DataTable from "../atoms/DataTable.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import Accordion from "./vue-ui-accordion.vue";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useResponsive } from "../useResponsive";
import { useConfig } from "../useConfig";
import PackageVersion from "../atoms/PackageVersion.vue";
import PenAndPaper from "../atoms/PenAndPaper.vue";

const { vue_ui_age_pyramid: DEFAULT_CONFIG } = useConfig();

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

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length
});

const uid = ref(createUid());
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const selectedIndex = ref(null);
const step = ref(0);
const agePyramid = ref(null);
const chartTitle = ref(null);
const source = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);

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
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_age_pyramid[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
        }
    } else {
        return mergedConfig;
    }
}

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
}, { deep: true });

const resizeObserver = ref(null);

onMounted(() => {
    prepareChart();
});

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiAgePyramid',
            type: 'dataset'
        })
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: agePyramid.value,
                title: FINAL_CONFIG.value.style.title.text ? chartTitle.value : null,
                source: source.value
            });
            svg.value.width = width;
            svg.value.height = height;
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(agePyramid.value.parentNode);
    }
}

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-age-pyramid_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.title.text || 'vue-ui-age-pyramid'
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.tooltip.show
});

const svg = ref({
    height: FINAL_CONFIG.value.style.height,
    width: FINAL_CONFIG.value.style.width
})

const drawingArea = computed(() => {
    const width = svg.value.width - FINAL_CONFIG.value.style.layout.padding.right - FINAL_CONFIG.value.style.layout.padding.left;
    const left = FINAL_CONFIG.value.style.layout.padding.left;
    const right = svg.value.width - FINAL_CONFIG.value.style.layout.padding.right;
    return {
        top: FINAL_CONFIG.value.style.layout.padding.top,
        left,
        right,
        bottom: svg.value.height - FINAL_CONFIG.value.style.layout.padding.bottom,
        width,
        height: svg.value.height - FINAL_CONFIG.value.style.layout.padding.top - FINAL_CONFIG.value.style.layout.padding.bottom,
        centerX: FINAL_CONFIG.value.style.layout.padding.left + width / 2,
        leftChart: {
            width: (width / 2) - FINAL_CONFIG.value.style.layout.centerSlit.width,
            right: left + (width / 2) - FINAL_CONFIG.value.style.layout.centerSlit.width
        },
        rightChart: {
            width: (width / 2) - FINAL_CONFIG.value.style.layout.centerSlit.width,
            left: left + (width / 2) + FINAL_CONFIG.value.style.layout.centerSlit.width
        }
    }
});

const yLabels =  computed(() => {
    return props.dataset.map(ds => {
        if (FINAL_CONFIG.value.style.layout.dataLabels.yAxis.display === 'age') {
            return ds[1];
        } else {
            return ds[0];
        }
    });
});

const xLabels = computed(() => {
    const step = closestDecimal(max.value / 5);
    const stepsRight = [];
    const stepsLeft = [];
    for (let i = 0; i <= 5; i += 1) {
        const valueRight = step * i;
        const valueLeft = step * (i - 5);
        stepsRight.push({
            value: valueRight,
            x: drawingArea.value.left + drawingArea.value.width / 2 + FINAL_CONFIG.value.style.layout.centerSlit.width + ((valueRight / max.value * drawingArea.value.leftChart.width))
        });
        stepsLeft.push({
            value: Math.abs(valueLeft),
            x: drawingArea.value.left + drawingArea.value.width / 2 + ((valueLeft / max.value * drawingArea.value.leftChart.width)) - FINAL_CONFIG.value.style.layout.centerSlit.width
        });
    }
    return {
        right: stepsRight,
        left: stepsLeft
    }
});

function closestDecimal(number) {
    if (number === 0) return 0;

    const orderOfMagnitude = Math.floor(Math.log10(Math.abs(number)));
    const powerOf10 = 10 ** orderOfMagnitude;

    let roundedValue;
    if (number < 0) {
        roundedValue = Math.round(number / powerOf10) * powerOf10;
    } else {
        roundedValue = Math.round(number / powerOf10) * powerOf10;
    }
    return roundedValue;
}

const max = computed(() => {
    return Math.max(...props.dataset.flatMap(ds => {
        return ds.slice(-2).map(v => checkNaN(v));
    }));
});

const len = computed(() => props.dataset.length);

const mutableDataset = computed(() => {
    return props.dataset.map(ds => {
        return {
            segment: ds[0],
            age: ds[1],
            left: {
                value: ds[2],
                proportionToMax: ds[2] / max.value,
            },
            right: {
                value: ds[3],
                proportionToMax: ds[3] / max.value,
            },
        }
    })
});

const drawableDataset = computed(() => {
    return mutableDataset.value.map((ds, i) => {
        const y = drawingArea.value.top + (drawingArea.value.height / len.value) * i;
        const height = (drawingArea.value.height / len.value) - FINAL_CONFIG.value.style.layout.bars.gap;
        return {
            segment: ds.segment,
            age: ds.age,
            left: {
                ...ds.left,
                y,
                color: FINAL_CONFIG.value.style.layout.bars.left.color,
                x: (drawingArea.value.leftChart.right - (ds.left.proportionToMax * drawingArea.value.leftChart.width)),
                width: checkNaN(ds.left.proportionToMax * drawingArea.value.leftChart.width),
                height
            },
            right: {
                ...ds.right,
                y,
                color: FINAL_CONFIG.value.style.layout.bars.right.color,
                x: drawingArea.value.rightChart.left,
                width: checkNaN(ds.right.proportionToMax * drawingArea.value.rightChart.width),
                height
            }
        }
    })
});

const dataTooltipSlot = ref(null);

function useTooltip(index, datapoint) {
    selectedIndex.value = index;

    dataTooltipSlot.value = {
        datapoint,
        seriesIndex: index,
        series: drawableDataset.value,
        config: FINAL_CONFIG.value
    }

    const customFormat = FINAL_CONFIG.value.style.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
            seriesIndex: index,
            datapoint: {
                segment: datapoint[0],
                index: datapoint[1],
                left: datapoint[2],
                right: datapoint[3]
            },
            series: drawableDataset.value,
            config: FINAL_CONFIG.value
        }))) {
        tooltipContent.value = customFormat({
            seriesIndex: index,
            datapoint: {
                segment: datapoint[0],
                index: datapoint[1],
                left: datapoint[2],
                right: datapoint[3]
            },
            series: drawableDataset.value,
            config: FINAL_CONFIG.value
        })
    } else {
        let html = "";
    
        const selectedSet = drawableDataset.value[index];
        html += `<div><b>${selectedSet.segment}</b></div>`;
        html += `<div>${FINAL_CONFIG.value.translations.age}: ${applyDataLabel(
            FINAL_CONFIG.value.style.layout.dataLabels.yAxis.formatter,
            checkNaN(selectedSet.age),
            dataLabel({ v: checkNaN(selectedSet.age) }),
            { datapoint, seriesIndex: index}
        )}</div>`
        html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid ${FINAL_CONFIG.value.style.tooltip.borderColor}">`;
        html += `<div style="display:flex; flex-direction:row;gap:12px">`;
        html += `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center"><svg viewBox="0 0 12 12" height="12" width="12"><rect stroke="none" x="0" y="0" height="12" width="12" rx="2" fill="${FINAL_CONFIG.value.style.layout.bars.gradient.underlayer}"/><rect stroke="none" x="0" y="0" height="12" width="12" rx="2" fill="${FINAL_CONFIG.value.style.layout.bars.gradient.show ? `url(#age_pyramid_left_${uid.value})` : FINAL_CONFIG.value.style.layout.bars.left.color}"/></svg><div>${FINAL_CONFIG.value.translations.female}</div><div><b>${applyDataLabel(
            FINAL_CONFIG.value.style.layout.dataLabels.xAxis.formatter,
            checkNaN(selectedSet.left.value),
            dataLabel({ v: checkNaN(selectedSet.left.value) }),
            { datapoint, seriesIndex: index }
        )}</b></div></div>`;
        html += `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center"><svg viewBox="0 0 12 12" height="12" width="12"><rect stroke="none" x="0" y="0" height="12" width="12" rx="2" fill="${FINAL_CONFIG.value.style.layout.bars.gradient.underlayer}"/><rect stroke="none" x="0" y="0" height="12" width="12" rx="2" fill="${FINAL_CONFIG.value.style.layout.bars.gradient.show ? `url(#age_pyramid_right_${uid.value})` : FINAL_CONFIG.value.style.layout.bars.right.color}"/></svg><div>${FINAL_CONFIG.value.translations.male}</div><div><b>${applyDataLabel(
            FINAL_CONFIG.value.style.layout.dataLabels.xAxis.formatter,
            checkNaN(selectedSet.right.value),
            dataLabel({ v: checkNaN(selectedSet.right.value) }),
            { datapoint, seriesIndex: index }
        )}</b></div></div>`;
        html += `</div>`;
        html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid ${FINAL_CONFIG.value.style.tooltip.borderColor}"><div>${FINAL_CONFIG.value.translations.total}</div><div><b>${applyDataLabel(
            FINAL_CONFIG.value.style.layout.dataLabels.xAxis.formatter,
            checkNaN(selectedSet.right.value) + checkNaN(selectedSet.left.value),
            dataLabel({ v: checkNaN(selectedSet.right.value) + checkNaN(selectedSet.left.value) }),
            { datapoint, seriesIndex: index }
        )}</b></div></div>`
        html += `</div>`;
    
        tooltipContent.value = `<div>${html}</div>`;
    }

    isTooltip.value = true;
}

function generateCsv() {
    nextTick(() => {
        const labels = [FINAL_CONFIG.value.translations.year, FINAL_CONFIG.value.translations.age, FINAL_CONFIG.value.translations.female, FINAL_CONFIG.value.translations.male, FINAL_CONFIG.value.translations.total];

        const values = props.dataset.map(ds => {
            return [
                ds[0],
                ds[1],
                ds[2],
                ds[3],
                ds[2] + ds[3]
            ]
        });

        const tableXls = [[FINAL_CONFIG.value.style.title.text],[FINAL_CONFIG.value.style.title.subtitle.text],[[""],[""],[""]]].concat([labels]).concat(values)
        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.title.text || "vue-ui-heatmap"});
    });
}

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.translations.year,
        FINAL_CONFIG.value.translations.age,
        FINAL_CONFIG.value.translations.female,
        FINAL_CONFIG.value.translations.male,
        FINAL_CONFIG.value.translations.total
    ];
    const body = props.dataset.map(ds => {
        return [
            ds[0],
            ds[1],
            ds[2].toLocaleString(),
            ds[3].toLocaleString(),
            (ds[2] + ds[3]).toLocaleString()
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
    };
    
    return { head, body, config, colNames: head}
})

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

defineExpose({
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleTooltip,
    toggleAnnotator
});

</script>

<template>
    <div :class="`vue-ui-age-pyramid ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" ref="agePyramid" :id="`vue-ui-age-pyramid_${uid}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;${!FINAL_CONFIG.style.title.text ? 'padding-top:36px' : ''};background:${FINAL_CONFIG.style.backgroundColor};${FINAL_CONFIG.responsive ? 'height:100%' : ''}`">
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :parent="agePyramid"
            :backgroundColor="FINAL_CONFIG.style.backgroundColor"
            :color="FINAL_CONFIG.style.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.title.text" :style="`width:100%;background:transparent`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'pyramid-div-title',
                        ...FINAL_CONFIG.style.title
                    },
                    subtitle: {
                        cy: 'pyramid-div-subtitle',
                        ...FINAL_CONFIG.style.title.subtitle
                    },
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset"
            :backgroundColor="FINAL_CONFIG.style.backgroundColor"
            :color="FINAL_CONFIG.style.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip && FINAL_CONFIG.style.tooltip.show"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="agePyramid"
            :position="FINAL_CONFIG.userOptions.position"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleTooltip="toggleTooltip"
            @toggleAnnotator="toggleAnnotator"
        >
            <template #optionTooltip v-if="$slots.optionTooltip">
                <slot name="optionTooltip"/>
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
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <!-- CHART -->
        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`" :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.color}`" >
            <PackageVersion />
            
            <defs>
                <linearGradient 
                    :id="`age_pyramid_left_${uid}`"
                    x1="0%" y1="0%" x2="100%" y2="0%"
                >
                    <stop 
                        offset="0%" 
                        :stop-color="FINAL_CONFIG.style.layout.bars.left.color"
                    />
                    <stop 
                        offset="100%" 
                        :stop-color="setOpacity(shiftHue(FINAL_CONFIG.style.layout.bars.left.color, FINAL_CONFIG.style.layout.bars.gradient.shiftHue), 100 - FINAL_CONFIG.style.layout.bars.gradient.intensity)"
                    />
                </linearGradient>
                <linearGradient 
                    :id="`age_pyramid_right_${uid}`"
                    x1="0%" y1="0%" x2="100%" y2="0%"
                >
                    <stop 
                        offset="0%" 
                        :stop-color="setOpacity(shiftHue(FINAL_CONFIG.style.layout.bars.right.color, FINAL_CONFIG.style.layout.bars.gradient.shiftHue), 100 - FINAL_CONFIG.style.layout.bars.gradient.intensity)"
                    />
                    <stop 
                        offset="100%" 
                        :stop-color="FINAL_CONFIG.style.layout.bars.right.color"
                    />
                </linearGradient>
            </defs>

            <g v-for="(segment, i) in drawableDataset">
                <rect
                    :x="segment.left.x"
                    :y="segment.left.y"
                    :width="checkNaN(segment.left.width <= 0 ? 0.0001 : segment.left.width)"
                    :height="segment.left.height <= 0 ? 0.0001 : segment.left.height"
                    :fill="FINAL_CONFIG.style.layout.bars.gradient.underlayer"
                    :rx="FINAL_CONFIG.style.layout.bars.borderRadius"
                />
                <rect
                    :x="segment.left.x"
                    :y="segment.left.y"
                    :width="segment.left.width <= 0 ? 0.0001 : segment.left.width"
                    :height="segment.left.height <= 0 ? 0.0001 : segment.left.height"
                    :fill="FINAL_CONFIG.style.layout.bars.gradient.show ? `url(#age_pyramid_left_${uid})` : segment.left.color"
                    :rx="FINAL_CONFIG.style.layout.bars.borderRadius"
                />
                <rect
                    :x="segment.right.x"
                    :y="segment.right.y"
                    :width="segment.right.width <= 0 ? 0.0001 : segment.right.width"
                    :height="segment.right.height <= 0 ? 0.0001 : segment.right.height"
                    :fill="FINAL_CONFIG.style.layout.bars.gradient.underlayer"
                    :rx="FINAL_CONFIG.style.layout.bars.borderRadius"
                />
                <rect
                    :x="segment.right.x"
                    :y="segment.right.y"
                    :width="segment.right.width <= 0 ? 0.0001 : segment.right.width"
                    :height="segment.right.height <= 0 ? 0.0001 : segment.right.height"
                    :fill="FINAL_CONFIG.style.layout.bars.gradient.show ? `url(#age_pyramid_right_${uid})` : segment.right.color"
                    :rx="FINAL_CONFIG.style.layout.bars.borderRadius"
                />
            </g>

            <!-- LABELS -->
            <g>
                <g v-if="FINAL_CONFIG.style.layout.dataLabels.sideTitles.show">
                    <text
                        :x="drawingArea.left"
                        :y="drawingArea.top + FINAL_CONFIG.style.layout.dataLabels.sideTitles.offsetY"
                        :fill="FINAL_CONFIG.style.layout.dataLabels.sideTitles.useSideColor ? FINAL_CONFIG.style.layout.bars.left.color : FINAL_CONFIG.style.layout.dataLabels.sideTitles.color"
                        :font-size="FINAL_CONFIG.style.layout.dataLabels.sideTitles.fontSize"
                        text-anchor="start"
                        :font-weight="FINAL_CONFIG.style.layout.dataLabels.sideTitles.bold ? 'bold' : 'normal'"
                    >
                        {{ FINAL_CONFIG.translations.female }}
                    </text>
                    <text
                        :x="drawingArea.right"
                        :y="drawingArea.top + FINAL_CONFIG.style.layout.dataLabels.sideTitles.offsetY"
                        :fill="FINAL_CONFIG.style.layout.dataLabels.sideTitles.useSideColor ? FINAL_CONFIG.style.layout.bars.right.color : FINAL_CONFIG.style.layout.dataLabels.sideTitles.color"
                        :font-size="FINAL_CONFIG.style.layout.dataLabels.sideTitles.fontSize"
                        text-anchor="end"
                        :font-weight="FINAL_CONFIG.style.layout.dataLabels.sideTitles.bold ? 'bold' : 'normal'"
                    >
                        {{ FINAL_CONFIG.translations.male }}
                    </text>
                </g>

                <g v-if="FINAL_CONFIG.style.layout.dataLabels.yAxis.show">
                    <template v-for="(label, i) in yLabels"> 
                        <text 
                            v-if="i % FINAL_CONFIG.style.layout.dataLabels.yAxis.showEvery === 0"
                            :x="drawingArea.centerX"
                            :y="drawingArea.top + (drawingArea.height / len) * i + (FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize / 3)"
                            text-anchor="middle"
                            :font-size="FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize"
                            :fill="FINAL_CONFIG.style.layout.dataLabels.yAxis.color"
                            :font-weight="FINAL_CONFIG.style.layout.dataLabels.yAxis.bold ? 'bold': 'normal'"
                        >
                            {{ applyDataLabel(
                                FINAL_CONFIG.style.layout.dataLabels.yAxis.formatter,
                                label,
                                dataLabel({ v: label }),
                                { datapoint: label, seriesIndex: i}
                            ) }}
                        </text>
                    </template>
                </g>

                <g v-if="FINAL_CONFIG.style.layout.dataLabels.xAxis.show">
                    <g v-if="FINAL_CONFIG.style.layout.grid.show">
                        <line
                            :x1="xLabels.right[0].x"
                            :x2="xLabels.right.at(-1).x"
                            :y1="drawingArea.bottom + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 2"
                            :y2="drawingArea.bottom + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 2"
                            :stroke="FINAL_CONFIG.style.layout.grid.stroke"
                            :stroke-width="FINAL_CONFIG.style.layout.grid.strokeWidth"
                            stroke-linecap="round"
                        />
                        <line
                            :x1="xLabels.left[0].x"
                            :x2="xLabels.left.at(-1).x"
                            :y1="drawingArea.bottom + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 2"
                            :y2="drawingArea.bottom + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 2"
                            :stroke="FINAL_CONFIG.style.layout.grid.stroke"
                            :stroke-width="FINAL_CONFIG.style.layout.grid.strokeWidth"
                            stroke-linecap="round"
                        />
                    </g>
                    <g v-for="(rightLabel, i) in xLabels.right">
                        <line v-if="FINAL_CONFIG.style.layout.grid.show"
                            :x1="rightLabel.x"
                            :x2="rightLabel.x"
                            :y1="drawingArea.bottom + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 2"
                            :y2="drawingArea.bottom + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 4"
                            :stroke="FINAL_CONFIG.style.layout.grid.stroke"
                            :stroke-width="FINAL_CONFIG.style.layout.grid.strokeWidth"
                            stroke-linecap="round"
                        />
                        <text
                            :x="rightLabel.x"
                            :y="drawingArea.bottom + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize * 2"
                            :font-size="FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize"
                            :fill="FINAL_CONFIG.style.layout.dataLabels.xAxis.color"
                            text-anchor="middle"
                            :font-weight="FINAL_CONFIG.style.layout.dataLabels.xAxis.bold ? 'bold': 'normal'"
                        >
                            {{ applyDataLabel(
                                FINAL_CONFIG.style.layout.dataLabels.xAxis.formatter,
                                rightLabel.value / FINAL_CONFIG.style.layout.dataLabels.xAxis.scale,
                                dataLabel({
                                    v: rightLabel.value / FINAL_CONFIG.style.layout.dataLabels.xAxis.scale
                                }),
                                { datapoint: rightLabel, seriesIndex: i }
                            ) }}
                        </text>
                    </g>
                    <g v-for="(leftLabel, i) in xLabels.left">
                        <line v-if="FINAL_CONFIG.style.layout.grid.show"
                            :x1="leftLabel.x"
                            :x2="leftLabel.x"
                            :y1="drawingArea.bottom + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 2"
                            :y2="drawingArea.bottom + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 4"
                            :stroke="FINAL_CONFIG.style.layout.grid.stroke"
                            :stroke-width="FINAL_CONFIG.style.layout.grid.strokeWidth"
                            stroke-linecap="round"
                        />
                        <text
                            :x="leftLabel.x"
                            :y="drawingArea.bottom + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize * 2"
                            :font-size="FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize"
                            :fill="FINAL_CONFIG.style.layout.dataLabels.xAxis.color"
                            text-anchor="middle"
                            :font-weight="FINAL_CONFIG.style.layout.dataLabels.xAxis.bold ? 'bold': 'normal'"
                        >
                            {{ applyDataLabel(
                                FINAL_CONFIG.style.layout.dataLabels.xAxis.formatter,
                                leftLabel.value / FINAL_CONFIG.style.layout.dataLabels.xAxis.scale,
                                dataLabel({
                                    v: leftLabel.value / FINAL_CONFIG.style.layout.dataLabels.xAxis.scale
                                }),
                                { datapoint: leftLabel, seriesIndex: i}
                            ) }}
                        </text>
                    </g>
                    <text
                        :x="drawingArea.right"
                        :y="svg.height"
                        text-anchor="end"
                        :font-size="FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize"
                        :fill="FINAL_CONFIG.style.layout.dataLabels.xAxis.color"
                        :font-weight="FINAL_CONFIG.style.layout.dataLabels.xAxis.bold ? 'bold': 'normal'"
                    >
                        {{ FINAL_CONFIG.style.layout.dataLabels.xAxis.translation }}
                    </text>
                </g>
            </g>

            <!-- TOOLTIP TRAPS -->
            <g v-for="(datapoint, i) in dataset">
                <rect
                    :x="drawingArea.left"
                    :y="drawingArea.top + (drawingArea.height / len) * i - FINAL_CONFIG.style.layout.bars.gap / 2"
                    :width="drawingArea.width <= 0 ? 0.0001 : drawingArea.width"
                    :height="drawingArea.height / len <= 0 ? 0.0001 : drawingArea.height / len"
                    :fill="selectedIndex !== null && selectedIndex === i ? setOpacity(FINAL_CONFIG.style.highlighter.color, FINAL_CONFIG.style.highlighter.opacity) : 'transparent'"
                    @mouseover="useTooltip(i, datapoint)"
                    @mouseleave="selectedIndex = null; isTooltip = false"
                />
            </g>

            <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'pyramid',
                style: {
                    backgroundColor: FINAL_CONFIG.style.backgroundColor,
                    pyramid: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />

        <slot name="legend" v-bind:legend="drawableDataset"></slot>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- TOOLTIP -->
        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.style.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.tooltip.color"
            :borderRadius="FINAL_CONFIG.style.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.tooltip.borderWidth"
            :fontSize="FINAL_CONFIG.style.tooltip.fontSize"
            :backgroundOpacity="FINAL_CONFIG.style.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.tooltip.position"
            :offsetY="FINAL_CONFIG.style.tooltip.offsetY"
            :parent="agePyramid"
            :content="tooltipContent"
            :isCustom="FINAL_CONFIG.style.tooltip.customFormat && typeof FINAL_CONFIG.style.tooltip.customFormat === 'function'"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>

        <!-- DATA TABLE -->
        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: FINAL_CONFIG.style.backgroundColor,
                color: FINAL_CONFIG.style.color,
            },
            head: {
                backgroundColor: FINAL_CONFIG.style.backgroundColor,
                color: FINAL_CONFIG.style.color,
            }
        }">
            <template #content>
                <DataTable
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames"
                    :head="dataTable.head"
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${FINAL_CONFIG.style.title.text}${FINAL_CONFIG.style.title.subtitle.text ? ` : ${FINAL_CONFIG.style.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false"
                >
                    <template #th="{ th }">
                        {{ th }}
                    </template>
                    <template #td="{ td }">
                        {{ td }}
                    </template>
                </DataTable>
            </template>
        </Accordion>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-age-pyramid *{
    transition: unset;
}
.vue-ui-age-pyramid {
    user-select: none;
    position: relative;
}
.vue-ui-age-pyramid .vue-ui-age-pyramid-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}
.vue-ui-age-pyramid-legend {
    height: 100%;
    width:100%;
    display: flex;
    align-items:center;
    flex-wrap: wrap;
    justify-content:center;
    column-gap: 18px;
}
.vue-ui-age-pyramid-legend-item {
    display: flex;
    align-items:center;
    gap: 6px;
    cursor: pointer;
    height: 24px;
}

/** */
.vue-ui-age-pyramid-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    max-width: 300px;
    position: fixed;
    padding:12px;
    z-index:1;
    font-variant-numeric: tabular-nums;
}
</style>