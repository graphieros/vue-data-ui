<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useConfig } from "../useConfig";
import { 
    adaptColorToBackground,
    applyDataLabel,
    convertColorToHex,
    createCsvContent,
    createUid, 
    dataLabel,
    downloadCsv,
    error, 
    getMissingDatasetAttributes, 
    lightenHexColor, 
    objectIsEmpty, 
    translateSize,
    XMLNS,
} from "../lib";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import PenAndPaper from "../atoms/PenAndPaper.vue";
import DataTable from "../atoms/DataTable.vue";
import Accordion from "./vue-ui-accordion.vue";
import { throttle } from "../canvas-lib";
import { useResponsive } from "../useResponsive";
import themes from "../themes.json";
import Skeleton from "./vue-ui-skeleton.vue";
import { useUserOptionState } from "../useUserOptionState";

const { vue_ui_funnel: DEFAULT_CONFIG } = useConfig();

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
    }
});

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

onMounted(prepareChart);

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiFunnel',
            type: 'dataset'
        })
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['name', 'value']
            }).forEach(attr => {
                isDataset.value = false;
                error({
                    componentName: 'VueUiFunnel',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i
                });
            });
        });
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: funnelChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                source: source.value,
                noTitle: noTitle.value
            });
            svg.value.height = height;
            svg.value.width = width;
            drawingArea.value = setDrawingArea();

            fontSizes.value.circles = translateSize({
                relator: Math.min(width, height),
                adjuster: 600,
                source: FINAL_CONFIG.value.style.chart.circles.dataLabels.fontSize,
                threshold: 10,
                fallback: 10
            });

            fontSizes.value.names = translateSize({
                relator: Math.min(width, height),
                adjuster: 600,
                source: FINAL_CONFIG.value.style.chart.bars.dataLabels.name.fontSize,
                threshold: 10,
                fallback: 10
            });

            fontSizes.value.values = translateSize({
                relator: Math.min(width, height),
                adjuster: 600,
                source: FINAL_CONFIG.value.style.chart.bars.dataLabels.value.fontSize,
                threshold: 10,
                fallback: 10
            });
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(funnelChart.value.parentNode);
    }
}

const funnelChart = ref(null);
const uid = ref(createUid());
const step = ref(0);
const titleStep = ref(0);
const tableStep = ref(0);
const noTitle = ref(null);
const source = ref(null);
const chartTitle = ref(null);
const resizeObserver = ref(null);
const loaded = ref(false);

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_funnel[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
        }
    } else {
        return mergedConfig;
    }
}

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });

watch(() => props.config, (_newCfg) => {
    FINAL_CONFIG.value = prepareConfig();
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
    fontSizes.value.circles = FINAL_CONFIG.value.style.chart.circles.dataLabels.fontSize;
    fontSizes.value.names = FINAL_CONFIG.value.style.chart.bars.dataLabels.name.fontSize;
    fontSizes.value.values = FINAL_CONFIG.value.style.chart.bars.dataLabels.value.fontSize;

}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `funnel_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-funnel'
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
});

const fontSizes = ref({
    circles: FINAL_CONFIG.value.style.chart.circles.dataLabels.fontSize,
    names: FINAL_CONFIG.value.style.chart.bars.dataLabels.name.fontSize,
    values: FINAL_CONFIG.value.style.chart.bars.dataLabels.value.fontSize
});

const svg = computed({
    get: () => {
        return {
            height: FINAL_CONFIG.value.style.chart.height,
            width: FINAL_CONFIG.value.style.chart.width
        }
    },
    set: (v) => {
        return v
    }
});

const formattedDataset = computed(() => {
    if(!isDataset.value) return []
    return props.dataset.map((ds, i) => {
        return {
            ...ds,
            color: ds.color ? convertColorToHex(ds.color) : lightenHexColor(FINAL_CONFIG.value.style.chart.bars.defaultColor, (i / props.dataset.length)),
        }
    })
});

setTimeout(() => {
    loaded.value = true;
}, formattedDataset.value.length * 150)

function setDrawingArea() {
    const left = FINAL_CONFIG.value.style.chart.padding.left;
    const top = FINAL_CONFIG.value.style.chart.padding.top;
    return {
        left,
        top,
        right: svg.value.width - FINAL_CONFIG.value.style.chart.padding.right,
        bottom: svg.value.height - FINAL_CONFIG.value.style.chart.padding.bottom,
        width: svg.value.width - left - FINAL_CONFIG.value.style.chart.padding.right,
        height: svg.value.height - top - FINAL_CONFIG.value.style.chart.padding.bottom
    }
}

const drawingArea = ref(setDrawingArea());

const barHeight = computed(() => {
    return (drawingArea.value.height / (props.dataset.length));
});

const gap = computed(() => {
    return barHeight.value * FINAL_CONFIG.value.style.chart.bars.gapRatio;
});

const spacingRatio = computed(() => {
    return drawingArea.value.width * FINAL_CONFIG.value.style.chart.barCircleSpacingRatio;
});

const datapoints = computed(() => {
    return formattedDataset.value.map((ds, i) => {
        const size = barHeight.value - (gap.value);
        const y = (drawingArea.value.top + (gap.value / 2 * i) + ((barHeight.value - (gap.value / 2)) * i)) + gap.value / 2;
        const proportion = ds.value / formattedDataset.value[0].value
        const width = (drawingArea.value.width - size - spacingRatio.value) * (ds.value / formattedDataset.value[0].value);
        return {
            ...ds,
            cx: drawingArea.value.left + size / 2,
            cy: y + size / 2,
            datapointIndex: i,
            fill: ds.color,
            height: Math.max(size, 0),
            proportion,
            r: Math.max(size / 2, 0),
            width: Math.max(width, 0),
            x: drawingArea.value.left + size + spacingRatio.value,
            y,
        }
    });
});

const funnelArea = computed(() => {
    const points = datapoints.value.map(dp => {
        return `${dp.x + dp.width},${dp.y + ((barHeight.value - (gap.value)) / 2)}`;
    })
    return `${datapoints.value[0].x},${datapoints.value[0].y + ((barHeight.value - gap.value) / 2)} ${points.toString()} ${datapoints.value.at(-1).x},${datapoints.value.at(-1).y + ((barHeight.value - gap.value) / 2)}`;
});

const circlesLink = computed(() => {
    return {
        x1: datapoints.value[0].cx,
        y1: datapoints.value[0].cy,
        x2: datapoints.value.at(-1).cx,
        y2: datapoints.value.at(-1).cy
    }
});

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const dashLen = computed(() => `${formattedDataset.value.length * 150}ms`);

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

const table = computed(() => {
    const head = formattedDataset.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color
        }
    });
    const body = formattedDataset.value.map(ds => ds.value);

    return { head, body };
});

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
        FINAL_CONFIG.value.table.columnNames.percentage
    ];

    const body = table.value.head.map((h,i) => {
        const labelValue = applyDataLabel(
            FINAL_CONFIG.value.style.chart.bars.dataLabels.value.formatter,
            table.value.body[i],
            dataLabel({
                p: FINAL_CONFIG.value.style.chart.bars.dataLabels.value.prefix,
                v: table.value.body[i],
                s: FINAL_CONFIG.value.style.chart.bars.dataLabels.value.suffix,
                r: FINAL_CONFIG.value.table.td.roundingValue
            }),
            { datapoint: datapoints.value[i] }
        );
        const labelPercentage = applyDataLabel(
            FINAL_CONFIG.value.style.chart.circles.dataLabels.formatter,
            datapoints.value[i].proportion * 100,
            dataLabel({
                v: datapoints.value[i].proportion * 100,
                s: '%',
                r: FINAL_CONFIG.value.table.td.roundingPercentage
            }),
            { datapoint: datapoints.value[i] }
        );

        return [
            { color: h.color, name: h.name },
            labelValue,
            labelPercentage
        ];
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
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
        FINAL_CONFIG.value.table.columnNames.percentage
    ];

    return {
        colNames,
        head,
        body,
        config
    }    
})

function generateCsv() {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [datapoints.value[i].proportion * 100]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text],[FINAL_CONFIG.value.style.chart.title.subtitle.text],[[FINAL_CONFIG.value.table.columnNames.series],[FINAL_CONFIG.value.table.columnNames.value],["%"]]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-funnel" })
    });
}

function getData() {
    return formattedDataset.value;
}

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleAnnotator
});

</script>

<template>
    <div ref="funnelChart" :class="`vue-ui-funnel ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; ${FINAL_CONFIG.responsive ? 'height:100%;' : ''} text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`" :id="`funnel_${uid}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
        <PenAndPaper 
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :parent="funnelChart"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;padding-bottom:24px`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'funnel-div-title',
                        ...FINAL_CONFIG.style.chart.title,
                    },
                    subtitle: {
                        cy: 'funnel-div-subtitle',
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
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasLabel="false"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :chartElement="funnelChart"
            :position="FINAL_CONFIG.userOptions.position"
            :titles="{...FINAL_CONFIG.userOptions.buttonTitles }"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            @toggleAnnotator="toggleAnnotator"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @generateCsv="generateCsv"
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

        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" data-cy="funnel-svg" :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`" :style="`max-width:100%; overflow: visible; background:transparent;color:${FINAL_CONFIG.style.chart.color}`">

            <defs>
                <linearGradient :id="`funnel_area_${uid}`" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" :stop-color="FINAL_CONFIG.style.chart.backgroundColor" :stop-opacity="0" />
                    <stop offset="20%" :stop-color="FINAL_CONFIG.style.chart.area.color" />
                    <stop offset="100%" :stop-color="FINAL_CONFIG.style.chart.area.color" />
                </linearGradient>
            </defs>

            <line
                v-if="FINAL_CONFIG.style.chart.circleLinks.show"
                v-bind="circlesLink"
                :stroke="FINAL_CONFIG.style.chart.circleLinks.color"
                :stroke-width="12 * FINAL_CONFIG.style.chart.circleLinks.widthRatio"
                stroke-linecap="round"
                :class="{
                    'animated': FINAL_CONFIG.useCssAnimation
                }"
                :style="{
                    strokeDasharray: FINAL_CONFIG.useCssAnimation ? drawingArea.height : 0,
                    strokeDashoffset: FINAL_CONFIG.useCssAnimation ? drawingArea.height : 0
                }"
            />

            <circle
                v-for="({cx, cy, r, fill}, i) in datapoints"
                v-bind="{ cx, cy, r, fill }"
                :stroke="FINAL_CONFIG.style.chart.circles.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.circles.strokeWidth"
                :class="{
                    'animated': FINAL_CONFIG.useCssAnimation && !loaded
                }"
                :style="{
                    animationDelay: `${150 * i}ms`
                }"
            />

            <text
                v-for="(datapoint, i) in datapoints"
                :x="datapoint.cx"
                :y="datapoint.cy + fontSizes.circles / 3 + FINAL_CONFIG.style.chart.circles.dataLabels.offsetY"
                text-anchor="middle"
                :font-size="fontSizes.circles"
                :fill="FINAL_CONFIG.style.chart.circles.dataLabels.adaptColorToBackground ? adaptColorToBackground(datapoint.color) : FINAL_CONFIG.style.chart.circles.dataLabels.color"
                :font-weight="FINAL_CONFIG.style.chart.circles.dataLabels.bold ? 'bold' : 'normal'"
                :class="{
                    'animated': FINAL_CONFIG.useCssAnimation && !loaded
                }"
                :style="{
                    animationDelay: `${150 * i}ms`
                }"
            >
                {{ 
                    applyDataLabel(
                        FINAL_CONFIG.style.chart.circles.dataLabels.formatter,
                        datapoint.proportion * 100,
                        dataLabel({
                            v: datapoint.proportion * 100,
                            s: '%',
                            r: FINAL_CONFIG.style.chart.circles.dataLabels.rounding
                        }),
                        { datapoint }
                    )
                }}
            </text>

            <polygon
                v-if="FINAL_CONFIG.style.chart.area.show"
                :points="funnelArea" 
                :fill="`url(#funnel_area_${uid})`"
                :class="{
                    'animated': FINAL_CONFIG.useCssAnimation && !loaded
                }"
                :style="{
                    transition: FINAL_CONFIG.useCssAnimation ? `all ${150 * formattedDataset.length}ms ease-in` : 'none'
                }"
            />
        
            <rect
                v-for="({x, y, height, width, fill}, i) in datapoints"
                v-bind="{x, y, height, width, fill }"
                :stroke="FINAL_CONFIG.style.chart.bars.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.bars.strokeWidth"
                :rx="FINAL_CONFIG.style.chart.bars.borderRadius"
                :class="{
                    'animated': FINAL_CONFIG.useCssAnimation && !loaded
                }"
                :style="{
                    animationDelay: `${150 * i}ms`
                }"
            />

            <g v-for="(datapoint, i) in datapoints">            
                <text
                    :x="datapoint.x + datapoint.width + FINAL_CONFIG.style.chart.bars.dataLabels.name.offsetX + 12"
                    :y="datapoint.cy - fontSizes.names / 2 + FINAL_CONFIG.style.chart.bars.dataLabels.name.offsetY"
                    text-anchor="start"
                    :font-size="fontSizes.names"
                    :fill="FINAL_CONFIG.style.chart.bars.dataLabels.name.color"
                    :font-weight="FINAL_CONFIG.style.chart.bars.dataLabels.name.bold ? 'bold' : 'normal'"
                    :class="{
                        'animated': FINAL_CONFIG.useCssAnimation && !loaded
                    }"
                    :style="{
                        animationDelay: `${150 * i}ms`
                    }"
                >
                    {{ datapoint.name }}
                </text>
                <text
                    :x="datapoint.x + datapoint.width + FINAL_CONFIG.style.chart.bars.dataLabels.value.offsetX + 12"
                    :y="datapoint.cy + fontSizes.values + FINAL_CONFIG.style.chart.bars.dataLabels.value.offsetY"
                    text-anchor="start"
                    :font-size="fontSizes.values"
                    :fill="FINAL_CONFIG.style.chart.bars.dataLabels.value.color"
                    :font-weight="FINAL_CONFIG.style.chart.bars.dataLabels.value.bold ? 'bold' : 'normal'"
                    :class="{
                        'animated': FINAL_CONFIG.useCssAnimation && !loaded
                    }"
                    :style="{
                        animationDelay: `${150 * i}ms`
                    }"
                >
                    {{ 
                        applyDataLabel(
                            FINAL_CONFIG.style.chart.bars.dataLabels.value.formatter,
                            datapoint.value,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.bars.dataLabels.value.prefix,
                                v: datapoint.value,
                                s: FINAL_CONFIG.style.chart.bars.dataLabels.value.suffix,
                                r: FINAL_CONFIG.style.chart.bars.dataLabels.value.rounding
                            }),
                            { datapoint }
                        )
                    }}
                </text>
            </g>

            <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'verticalBar',
                style: {
                    backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                    verticalBar: {
                        axis: {
                            color: '#CCCCCC'
                        },
                        color: '#CCCCCC'
                    }
                }
            }"
        />

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
                <DataTable
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false"
                >
                    <template #th="{ th }">
                        <div v-html="th" style="display:flex;align-items:center"></div>
                    </template>
                    <template #td="{ td }">
                        {{ td.name ? td.name : td }}
                    </template>
                </DataTable>
            </template>
        </Accordion>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";
.vue-ui-funnel *{
    transition: unset;
}
.vue-ui-funnel {
    user-select: none;
    position: relative;
}
circle.animated {
    opacity: 0;
    animation: reveal 150ms forwards;
    transition: all 150ms ease-in-out;
} 

@keyframes reveal {
    from {
        opacity: 0;
        r: 0;
    }
    to {
        opacity: 1;
    }
}

line.animated {
    animation: dash v-bind(dashLen) ease-in forwards;
}

@keyframes dash {
    to {
        stroke-dashoffset: 0;
    }
}

rect.animated {
    animation: rectExpand 150ms ease-in forwards;
    opacity: 0;
}

@keyframes rectExpand {
    from {
        opacity: 0;
        width: 0;
    }
    to {
        opacity: 1;
    }
}

text.animated {
    opacity: 0;
    animation: textReveal 150ms forwards;
}

@keyframes textReveal {
    to {
        opacity: 1;
    }
}
</style>