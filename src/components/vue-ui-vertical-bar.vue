<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import {
    applyDataLabel,
    checkNaN,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createUid,
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    isFunction,
    objectIsEmpty,
    palette,
    setOpacity,
    shiftHue,
    themePalettes,
    XMLNS,
} from "../lib.js";
import { throttle } from "../canvas-lib";
import themes from "../themes.json";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Tooltip from "../atoms/Tooltip.vue";
import Legend from "../atoms/Legend.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import BaseIcon from "../atoms/BaseIcon.vue";
import Accordion from "./vue-ui-accordion.vue";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useResponsive } from "../useResponsive";
import { useConfig } from "../useConfig";

const { vue_ui_vertical_bar: DEFAULT_CONFIG } = useConfig()

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
})

const uid = ref(createUid());
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const barCount = ref(0);
const hoveredBar = ref(null);
const step = ref(0);
const verticalBarChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const titleStep = ref(0);
const legendStep = ref(0)

const emit = defineEmits(['selectLegend']);

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
                userConfig: themes.vue_ui_vertical_bar[mergedConfig.theme] || props.config,
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
    prepareChart();
    titleStep.value += 1;
    legendStep.value += 1;
    barHeight.value = FINAL_CONFIG.value.style.chart.layout.bars.height;
    barGap.value = FINAL_CONFIG.value.style.chart.layout.bars.gap;
}, { deep: true });

watch(() => props.dataset, recalculateHeight, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-vertical-bar_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-vertical-bar'
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})

const tableContainer = ref(null)
const isResponsive = ref(false)
const breakpoint = computed(() => {
    return FINAL_CONFIG.value.table.responsiveBreakpoint
});

const resizeObserver = ref(null);

onMounted(() => {
    prepareChart();
});

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiVerticalBar',
            type: 'dataset'
        });
    }

    barCount.value = props.dataset.flatMap(serie => {
        if(serie.children && serie.children.length > 0) {
            return serie.children.length;
        } else {
            return 1;
        }
    }).reduce((a, b) => a + b, 0);
    observeTable();

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: verticalBarChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
            });

            baseWidth.value = width;
            barHeight.value = height / barCount.value - (barGap.value * 2)
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(verticalBarChart.value.parentNode);
    }
}

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
});

function observeTable() {
    const observer = new ResizeObserver((entries) => {
        entries.forEach(entry => {
            isResponsive.value = entry.contentRect.width < breakpoint.value;
        })
    })
    observer.observe(tableContainer.value)
}

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    sortDesc: FINAL_CONFIG.value.style.chart.layout.bars.sort === "desc",
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
});


const isSortDown = computed(() => {
    return mutableConfig.value.sortDesc;
})

const immutableDataset = computed(() => {

    props.dataset.forEach((ds, i) => {
        if (!ds.value && !ds.children) {
            error({
                componentName: 'VueUiVerticalBar',
                type: 'datasetAttributeEmpty',
                property: `value (index ${i})`
            })
        }
        if (ds.children) {
            if (objectIsEmpty(ds.children)){
                error({
                    componentName: 'VueUiVerticalBar',
                    type: 'datasetAttributeEmpty',
                    property: `children (index ${i})`
                })
            } else {
                ds.children.forEach((child, j) => {
                    if ([null, undefined].includes(child.name)) {
                        error({
                            componentName: 'VueUiVerticalBar',
                            type: 'datasetSerieAttribute',
                            property: `name`,
                            key: 'children',
                            index: j
                        })
                    }
                })
            }
        }
    })

    return props.dataset
        .map((serie, i) => {
            const id = `vertical_parent_${i}_${uid.value}`;
            const hasChildren = serie.children && serie.children.length > 0;

            const parentValue = checkNaN(serie.value ? serie.value : hasChildren ? serie.children.map(c => c.value || 0).reduce((a, b) => a + b, 0) : 0);
            const parentSign = parentValue >= 0 ? 1 : -1;
            return {
                ...serie,
                id,
                shape: 'square',
                opacity: segregated.value.includes(id) ? 0.5 : 1,
                value: Math.abs(parentValue),
                sign: parentSign,
                hasChildren,
                isChild: false,
                segregate: () => segregate(id),
                isSegregated: segregated.value.includes(id),
                color: convertColorToHex(serie.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
                children: !serie.children || !serie.children.length ? [] : serie.children
                    .toSorted((a, b) => isSortDown.value ? b.value - a.value : a.value - b.value)
                    .map((c, j) => {
                        return {
                            ...c,
                            value: checkNaN(Math.abs(c.value)),
                            sign: c.value >= 0 ? 1 : -1,
                            isChild: true,
                            parentId: id,
                            parentName: serie.name,
                            parentValue,
                            parentSign,
                            id: `vertical_child_${i}_${j}_${uid.value}`,
                            childIndex: j,
                            color: convertColorToHex(c.color) || convertColorToHex(serie.color) || customPalette.value[i] || palette[i] || palette[i % palette.length]
                        }
                    })
                    .map((c,j) => {
                        return {
                            ...c,
                            isFirstChild: j === 0,
                            isLastChild: j === serie.children.length - 1,
                        }
                    })
            }
        })
        .toSorted((a, b) => isSortDown.value ? b.value - a.value : a.value - b.value)
});

const legendConfig = computed(() => {
    return {
        cy: 'vertical-bar-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
});

const barHeight = ref(FINAL_CONFIG.value.style.chart.layout.bars.height);
const barGap = ref(FINAL_CONFIG.value.style.chart.layout.bars.gap);

const baseHeight = computed(() => {
    return (barHeight.value + barGap.value) * barCount.value
});
const baseWidth = ref(512);

const svg = computed(() => {
    return {
        width: baseWidth.value,
        height: baseHeight.value,
        padding: {
            top: 12,
            left: 128 + FINAL_CONFIG.value.style.chart.layout.bars.offsetX,
            right: 64 + FINAL_CONFIG.value.style.chart.layout.bars.paddingRight,
            bottom: 12,
        }
    }
});

const drawableArea = computed(() => {
    return {
        fullHeight: svg.value.padding.top + svg.value.padding.bottom + svg.value.height,
        top: svg.value.padding.top,
        left: svg.value.padding.left,
        right: svg.value.width - svg.value.padding.right,
        bottom: svg.value.padding.top + svg.value.height,
        width: svg.value.width - (svg.value.padding.left + svg.value.padding.right)
    }
});

function recalculateHeight() {
    barCount.value = mutableDataset.value.flatMap(serie => {
        if(serie.children && serie.children.length > 0) {
            return serie.children.length;
        } else {
            return 1;
        }
    }).reduce((a, b) => a + b, 0);
}

const segregated = ref([]);

function segregate(id) {
    if(segregated.value.includes(id)) {
        segregated.value = segregated.value.filter(el => el !== id);
    }else {
        segregated.value.push(id)
    }
    recalculateHeight();
    emit('selectLegend', mutableDataset.value);
}

const mutableDataset = computed(() => {
    return immutableDataset.value.filter(serie => !segregated.value.includes(serie.id));
});

const total = computed(() => {
    return mutableDataset.value.map(serie => Math.abs(serie.value)).reduce((a,b) => a + b, 0);
});

function calcProportionToTotal(val, formatted = false, rounding = 0) {
    if(formatted) {
        return dataLabel({
            v: checkNaN(Math.abs(val) / total.value * 100),
            s: '%',
            r: rounding
        });
    }
    return Math.abs(val) / total.value;
}

const bars = computed(() => {
    return mutableDataset.value.flatMap(serie => {
        if(!serie.hasChildren) {
            return serie;
        }else {
            return serie.children;
        }
    })
})

const hasNegative = computed(() => {
    return bars.value.map(b => b.sign).includes(-1)
});

const max = computed(() => {
    return Math.max(...mutableDataset.value.flatMap(serie => {
        if(serie.children && serie.children.length) {
            return Math.max(...serie.children.map(c => c.value))
        } else {
            return serie.value
        }
    }))
});

function calcBarWidth(val) {
    const ratio = val / max.value;
    return (drawableArea.value.width / (hasNegative.value ? 2 : 1)) * ratio;
}

function calcDataLabelX(val) {
    return calcBarWidth(val) + drawableArea.value.left;
}

function getParentData(serie, index) {
    const parent = mutableDataset.value.find(el => el.id === serie.parentId);
    const start = drawableArea.value.top + ((barGap.value + barHeight.value) * (index));
    const height = parent.children.length * (barGap.value + barHeight.value);

    return {
        y: start + (height / 2) - (FINAL_CONFIG.value.style.chart.layout.bars.parentLabels.fontSize),
        name: parent.name,
        value: [undefined, NaN, null].includes(parent.value) ? '' : parent.sign === 1 ? parent.value : -parent.value,
        percentageToTotal: isNaN(parent.value / total.value) ? '' : calcProportionToTotal(parent.value, true, FINAL_CONFIG.value.style.chart.layout.bars.dataLabels.percentage.roundingPercentage),
        sign: parent.sign
    }
}

function getData() {
    return mutableDataset.value;
}

const selectedBarId = ref(null);

const dataTooltipSlot = ref(null);

function useTooltip(bar, seriesIndex) {
    dataTooltipSlot.value = {
        datapoint: bar,
        seriesIndex,
        series: immutableDataset.value,
        config: FINAL_CONFIG.value
    }

    isTooltip.value = true;
    selectedBarId.value = bar.id;
    let html = "";
    const serieName = bar.isChild ? bar.parentName : bar.name;
    const childName = bar.isChild ? bar.name : "";

    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
            datapoint: bar,
            series: immutableDataset.value,
            config: FINAL_CONFIG.value,
            seriesIndex
        }))) {
        tooltipContent.value = customFormat({
            datapoint: bar,
            series: immutableDataset.value,
            config: FINAL_CONFIG.value,
            seriesIndex
        })
    } else {
        html += `<div style="width:100%;text-align:center;border-bottom:1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor};padding-bottom:6px;margin-bottom:3px;text-align:left;">
                <div style="display:flex;align-items:center;gap:4px;"><svg viewBox="0 0 12 12" height="14" width="14"><rect x="0" y="0" height="12" width="12" rx="2" stroke="none" fill="${bar.color}"/></svg> ${ serieName }</div>
                ${childName ? `<div>${childName}</div>` : ''}
            </div>`;
        
        if (FINAL_CONFIG.value.style.chart.tooltip.showValue) {
            html += `<div>${FINAL_CONFIG.value.translations.value}: <b>${applyDataLabel(
                FINAL_CONFIG.value.style.chart.layout.bars.dataLabels.value.formatter,
                bar.sign === 1 ? bar.value : -bar.value,
                dataLabel({
                    p: FINAL_CONFIG.value.style.chart.tooltip.prefix,
                    v: bar.sign === 1 ? bar.value : -bar.value,
                    s: FINAL_CONFIG.value.style.chart.tooltip.suffix,
                    r: FINAL_CONFIG.value.style.chart.tooltip.roundingValue
                }),
                { datapoint: bar, seriesIndex }
            )}</b></div>`;
        }    
    
        if(FINAL_CONFIG.value.style.chart.tooltip.showPercentage) {
            html += `<div>${FINAL_CONFIG.value.translations.percentageToTotal} : <b>${dataLabel({
                v: Math.abs(bar.value) / total.value * 100,
                s: '%',
                r: FINAL_CONFIG.value.style.chart.tooltip.roundingPercentage
            })}</b></div>`;
            if(bar.isChild) {
                html += `<div>${FINAL_CONFIG.value.translations.percentageToSerie}: <b>${dataLabel({
                    v: Math.abs(bar.value) / Math.abs(bar.parentValue) * 100,
                    s: '%',
                    r: FINAL_CONFIG.value.style.chart.tooltip.roundingPercentage
                })}</b></div>`;
            }
        }
        tooltipContent.value = `<div style="text-align:left">${html}</div>`;
    }
}

function makeDataLabel(value, datapoint, seriesIndex, sign) {
    if (!FINAL_CONFIG.value.style.chart.layout.bars.dataLabels.value.show) {
        return '';
    }
    const label = applyDataLabel(
        FINAL_CONFIG.value.style.chart.layout.bars.dataLabels.value.formatter,
        checkNaN(sign === -1 ? (value >= 0 ? -value : value) : value),
        dataLabel({
            p: FINAL_CONFIG.value.style.chart.layout.bars.dataLabels.value.prefix,
            v: checkNaN(sign === -1 ? (value >= 0 ? -value : value) : value),
            s: FINAL_CONFIG.value.style.chart.layout.bars.dataLabels.value.suffix,
            r: FINAL_CONFIG.value.style.chart.layout.bars.dataLabels.value.roundingValue
        }),
        { datapoint, seriesIndex }
    );

    const percentage = `(${calcProportionToTotal(value, true, FINAL_CONFIG.value.style.chart.layout.bars.dataLabels.percentage.roundingPercentage)})`;

    return `${label}${FINAL_CONFIG.value.style.chart.layout.bars.dataLabels.percentage.show ? ` ${percentage}` : ''}`;
}

const table = computed(() => {
    const head = [
        FINAL_CONFIG.value.translations.parentName,
        FINAL_CONFIG.value.translations.value,
        FINAL_CONFIG.value.translations.percentageToTotal,
        FINAL_CONFIG.value.translations.childName,
        FINAL_CONFIG.value.translations.value,
        FINAL_CONFIG.value.translations.percentageToSerie,
        FINAL_CONFIG.value.translations.percentageToTotal,
    ];

    const body = bars.value.map(bar => {
        if(!bar.isChild) {
            return {
                color: bar.color,
                parentName: bar.name,
                parentValue: bar.sign === 1 ? bar.value : -bar.value,
                percentageToTotal: Math.abs(bar.value) / total.value,
                childName: "",
                childValue: "",
                childPercentageToParent: "",
                childPercentageToTotal: ""
            };
        } else {
            if(bar.isFirstChild) {
                return {
                    color: bar.color,
                    parentName: bar.parentName,
                    parentValue: bar.parentValue,
                    percentageToTotal: bar.parentValue / total.value,
                    childName: bar.name,
                    childValue: bar.sign === 1 ? bar.value : -bar.value,
                    childPercentageToParent: Math.abs(bar.value) / Math.abs(bar.parentValue),
                    childPercentageToTotal: Math.abs(bar.value) / total.value
                }
            }else{
                return {
                    color: "",
                    parentName: "",
                    parentValue: "",
                    percentageToTotal: "",
                    childName: bar.name,
                    childValue: bar.sign === 1 ? bar.value : -bar.value,
                    childPercentageToParent: Math.abs(bar.value) / Math.abs(bar.parentValue),
                    childPercentageToTotal: Math.abs(bar.value) / total.value
                }
            }
        }
    });

    return { head, body };
});

function generateCsv() {
    const title = [[FINAL_CONFIG.value.style.chart.title.text], [FINAL_CONFIG.value.style.chart.title.subtitle.text], [""]];
    const head = table.value.head;
    const body = table.value.body.map(tr => {
        return [
            tr.parentName,
            tr.parentValue,
            tr.percentageToTotal,
            tr.childName,
            tr.childValue,
            tr.childPercentageToParent,
            tr.childPercentageToTotal
        ]
    });
    
    const tableXls = title.concat([head]).concat(body);
    const csvContent = createCsvContent(tableXls);
    downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-vertical-bar"})
}

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleSort() {
    mutableConfig.value.sortDesc = !mutableConfig.value.sortDesc;
    recalculateHeight()
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

defineExpose({
    getData,
    recalculateHeight,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleSort,
    toggleTooltip
});

</script>

<template>
    <div :class="`vue-ui-vertical-bar ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`" ref="verticalBarChart" :id="`vue-ui-vertical-bar_${uid}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;${!FINAL_CONFIG.style.chart.title.text ? 'padding-top:36px' : ''};background:${FINAL_CONFIG.style.chart.backgroundColor};${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`">
    
        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;padding-bottom:12px`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'vertical-bar-div-title',
                        ...FINAL_CONFIG.style.chart.title
                    },
                    subtitle: {
                        cy: 'vertical-bar-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip && FINAL_CONFIG.style.chart.tooltip.show"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasSort="FINAL_CONFIG.userOptions.buttons.sort"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="verticalBarChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleSort="toggleSort"
            @toggleTooltip="toggleTooltip"
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
            <template #optionLabels v-if="$slots.optionLabels">
                <slot name="optionLabels" />
            </template>
            <template #optionSort v-if="$slots.optionSort">
                <slot name="optionSort"/>
            </template>
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
        </UserOptions>

        <!-- LEGEND AS DIV : TOP -->
        <div ref="chartLegend"  v-if="FINAL_CONFIG.style.chart.legend.show && FINAL_CONFIG.style.chart.legend.position === 'top'">
            <Legend
                :key="`legend_top_${legendStep}`"
                :legendSet="immutableDataset"
                :config="legendConfig"
                @clickMarker="({ legend }) => segregate(legend.id)"
            >
                <template #item="{ legend, index }">
                    <div data-cy-legend-item @click="segregate(legend.id)" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                        {{ legend.name }}: 
                        {{ applyDataLabel(
                            FINAL_CONFIG.style.chart.layout.bars.dataLabels.value.formatter,
                            legend.value,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.legend.prefix,
                                v: legend.value,
                                s: FINAL_CONFIG.style.chart.legend.suffix,
                                r: FINAL_CONFIG.style.chart.legend.roundingValue
                            }),
                            { datapoint: legend, seriesIndex: index }
                        ) }}
                    </div>
                </template>
            </Legend>
        </div>

        <!-- CHART -->
        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${drawableArea.fullHeight <= 0 ? 10 : drawableArea.fullHeight}`" :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.chart.color}`" >

            <!-- defs -->
            <linearGradient
                    x1="0%" y1="0%" x2="100%" y2="0%"
                    v-for="(bar, i) in bars"
                    :id="`vertical_bar_gradient_${uid}_${i}`"
                >
                    <stop offset="0%" :stop-color="bar.color" />
                    <stop offset="100%" :stop-color="setOpacity(shiftHue(bar.color, 0.03), 100 - FINAL_CONFIG.style.chart.layout.bars.gradientIntensity)"/>
            </linearGradient>

            <g v-for="(serie, i) in bars">
                <!-- UNDERLAYER -->
                <rect
                    :data-cy="`vertical-bar-rect-underlayer-${i}`"
                    :x="checkNaN(hasNegative ? drawableArea.left + (drawableArea.width / 2) - (serie.sign === 1 ? 0 : calcBarWidth(serie.value) <= 0 ? 0.0001 : calcBarWidth(serie.value)) : drawableArea.left)"
                    :y="drawableArea.top + ((barGap + barHeight) * i)"
                    :width="checkNaN(calcBarWidth(serie.value) <= 0 ? 0.0001 : calcBarWidth(serie.value))"
                    :height="barHeight <= 0 ? 0.0001 : barHeight"
                    :fill="FINAL_CONFIG.style.chart.layout.bars.underlayerColor"
                    :rx="FINAL_CONFIG.style.chart.layout.bars.borderRadius"
                    :class="{ 'animated': FINAL_CONFIG.useCssAnimation }"
                />
            </g>
            <g v-for="(serie, i) in bars"> 
                <!-- BARS -->
                <rect 
                    :x="checkNaN(hasNegative ? drawableArea.left + (drawableArea.width / 2) - (serie.sign === 1 ? 0 : calcBarWidth(serie.value) <= 0 ? 0.0001 : calcBarWidth(serie.value)) : drawableArea.left)"
                    :y="drawableArea.top + ((barGap + barHeight) * i)"
                    :width="checkNaN(calcBarWidth(serie.value) <= 0 ? 0.0001 : calcBarWidth(serie.value))"
                    :height="barHeight <= 0 ? 0.0001 : barHeight"
                    :fill="FINAL_CONFIG.style.chart.layout.bars.useGradient ? `url(#vertical_bar_gradient_${uid}_${i})` : setOpacity(serie.color, FINAL_CONFIG.style.chart.layout.bars.fillOpacity)"
                    :rx="FINAL_CONFIG.style.chart.layout.bars.borderRadius"
                    :stroke="FINAL_CONFIG.style.chart.layout.bars.useStroke ? serie.color : 'none'"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.bars.useStroke ? FINAL_CONFIG.style.chart.layout.bars.strokeWidth : 0"
                    :class="{ 'animated': FINAL_CONFIG.useCssAnimation }"
                />

                <!-- SEPARATORS -->
                <line
                    v-if="(!serie.isChild || serie.isLastChild) && FINAL_CONFIG.style.chart.layout.separators.show && i !== bars.length -1"
                    :x1="0"
                    :x2="drawableArea.left"
                    :y1="barHeight + (barGap / 2) + drawableArea.top + ((barGap + barHeight) * i)"
                    :y2="barHeight + (barGap / 2) + drawableArea.top + ((barGap + barHeight) * i)"
                    :stroke="FINAL_CONFIG.style.chart.layout.separators.color"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.separators.strokeWidth"
                    stroke-linecap="round"
                    />
                    
                <line
                    v-if="hasNegative && FINAL_CONFIG.style.chart.layout.separators.show"
                    :x1="drawableArea.left + drawableArea.width / 2"
                    :x2="drawableArea.left + drawableArea.width / 2"
                    :y1="drawableArea.top"
                    :y2="drawableArea.bottom"
                    :stroke="FINAL_CONFIG.style.chart.layout.separators.color"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.separators.strokeWidth"
                    stroke-linecap="round"
                />

                <!-- DATALABELS -->
                <text
                    :data-cy="`vertical-bar-datalabel-${i}`"
                    :x="!hasNegative ? calcDataLabelX(serie.value) + 3 + FINAL_CONFIG.style.chart.layout.bars.dataLabels.offsetX : (drawableArea.left + (drawableArea.width / 2) + (serie.sign === 1 ? -12: 12) + (serie.sign === 1 ? -FINAL_CONFIG.style.chart.layout.bars.dataLabels.offsetX : FINAL_CONFIG.style.chart.layout.bars.dataLabels.offsetX))"
                    :y="drawableArea.top + ((barGap + barHeight) * i) + (barHeight / 2) + FINAL_CONFIG.style.chart.layout.bars.dataLabels.fontSize / 2"
                    :text-anchor="!hasNegative || serie.sign === - 1 ? 'start' : 'end'"
                    :font-size="FINAL_CONFIG.style.chart.layout.bars.dataLabels.fontSize"
                    :fill="FINAL_CONFIG.style.chart.layout.bars.dataLabels.color"
                    :font-weight="FINAL_CONFIG.style.chart.layout.bars.dataLabels.bold ? 'bold' : 'normal'"
                >
                    {{ makeDataLabel(serie.value, serie, i, serie.sign) }}
                </text>

                <!-- CHILDREN | LONELY PARENTS NAMES -->
                <text
                    v-if="(serie.isChild || !serie.hasChildren) && FINAL_CONFIG.style.chart.layout.bars.nameLabels.show"
                    text-anchor="end"
                    :x="drawableArea.left - 3 + FINAL_CONFIG.style.chart.layout.bars.nameLabels.offsetX"
                    :y="drawableArea.top + ((barGap + barHeight) * i) + (barHeight / 2) + FINAL_CONFIG.style.chart.layout.bars.nameLabels.fontSize / 2"
                    :font-size="FINAL_CONFIG.style.chart.layout.bars.nameLabels.fontSize"
                    :fill="FINAL_CONFIG.style.chart.layout.bars.nameLabels.color"
                    :font-weight="FINAL_CONFIG.style.chart.layout.bars.nameLabels.bold ? 'bold' : 'normal'"
                >
                    {{ serie.name }}
                </text>

                <!-- PARENT NAMES -->
                <text
                    v-if="serie.isChild && serie.childIndex === 0 && FINAL_CONFIG.style.chart.layout.bars.parentLabels.show"
                    :x="3 + FINAL_CONFIG.style.chart.layout.bars.parentLabels.offsetX"
                    :y="getParentData(serie, i).y"
                    :font-size="FINAL_CONFIG.style.chart.layout.bars.parentLabels.fontSize"
                    :fill="FINAL_CONFIG.style.chart.layout.bars.parentLabels.color"
                    :font-weight="FINAL_CONFIG.style.chart.layout.bars.parentLabels.bold ? 'bold' : 'normal'"
                    text-anchor="start"
                >
                    {{ getParentData(serie, i).name }}
                </text>
                <text 
                    v-if="serie.isChild && serie.childIndex === 0 && FINAL_CONFIG.style.chart.layout.bars.parentLabels.show"
                    :x="3 + FINAL_CONFIG.style.chart.layout.bars.parentLabels.offsetX"
                    :y="getParentData(serie, i).y + FINAL_CONFIG.style.chart.layout.bars.parentLabels.fontSize + 6"
                    :font-size="FINAL_CONFIG.style.chart.layout.bars.parentLabels.fontSize"
                    :fill="FINAL_CONFIG.style.chart.layout.bars.parentLabels.color"
                    :font-weight="FINAL_CONFIG.style.chart.layout.bars.dataLabels.bold ? 'bold' : 'normal'"
                    text-anchor="start"
                >
                    {{ makeDataLabel(getParentData(serie, i).value), getParentData(serie, i), i, serie.parentSign || serie.sign }}
                </text>

                <!-- TOOLTIP TRAPS -->
                <rect 
                    :data-cy="`vertical-bar-trap-${i}`"
                    data-cy-trap
                    :x="0"
                    :y="drawableArea.top + ((barGap + barHeight) * i) - (barGap/2)"
                    :width="svg.width <= 0 ? 0.0001 : svg.width"
                    :height="barHeight + barGap <= 0 ? 0.0001 : barHeight + barGap"
                    :fill="selectedBarId === serie.id ? setOpacity(FINAL_CONFIG.style.chart.layout.highlighter.color, FINAL_CONFIG.style.chart.layout.highlighter.opacity) : 'transparent'"
                    @mouseenter="useTooltip(serie, i)"
                    @mouseleave="hoveredBar = null; isTooltip = false; selectedBarId = null"
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

        <!-- LEGEND AS DIV : BOTTOM -->
        <div ref="chartLegend" v-if="FINAL_CONFIG.style.chart.legend.show && FINAL_CONFIG.style.chart.legend.position === 'bottom'">
            <Legend
                :key="`legend_bottom_${legendStep}`"
                :legendSet="immutableDataset"
                :config="legendConfig"
                @clickMarker="({ legend }) => segregate(legend.id)"
            >
                <template #item="{ legend, index }">
                    <div @click="segregate(legend.id)" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                        {{ legend.name }}: 
                        {{ applyDataLabel(
                            FINAL_CONFIG.style.chart.layout.bars.dataLabels.value.formatter,
                            legend.value,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.legend.prefix,
                                v: legend.value,
                                s: FINAL_CONFIG.style.chart.legend.suffix,
                                r: FINAL_CONFIG.style.chart.legend.roundingValue
                            }),
                            { datapoint: legend, seriesIndex: index }
                        ) }}
                    </div>
                </template>
            </Legend>
        </div>

        <slot name="legend" v-bind:legend="immutableDataset"></slot>

        <!-- TOOLTIP -->
        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip && segregated.length < props.dataset.length"
            :backgroundColor="FINAL_CONFIG.style.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.chart.tooltip.color"
            :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.chart.tooltip.position"
            :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="verticalBarChart"
            :content="tooltipContent"
            :isCustom="FINAL_CONFIG.style.chart.tooltip.customFormat && typeof FINAL_CONFIG.style.chart.tooltip.customFormat === 'function'"
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
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color,
            },
            head: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color,
            }
        }">
            <template #content>
                <div ref="tableContainer" class="vue-ui-vertical-bar-table">        
                    <div :style="`width:100%;padding-top: 36px;position:relative`">
                        <div role="button" tabindex="0" :style="`width:32px; position: absolute; top: 0; right:4px; padding: 0 0px; display: flex; align-items:center;justify-content:center;height: 36px; width: 32px; cursor:pointer; background:${FINAL_CONFIG.table.th.backgroundColor};`" @click="mutableConfig.showTable = false" @keypress.enter="mutableConfig.showTable = false">
                            <BaseIcon name="close" :stroke="FINAL_CONFIG.table.th.color" :stroke-width="2" />
                        </div> 
                        <div style="width: 100%; container-type: inline-size;" :class="{'vue-ui-responsive': isResponsive}">
                            <table class="vue-ui-data-table">
                                <caption :style="{backgroundColor: FINAL_CONFIG.table.th.backgroundColor, color: FINAL_CONFIG.table.th.color, outline: FINAL_CONFIG.table.th.outline }" class="vue-ui-data-table__caption">
                                    {{ FINAL_CONFIG.style.chart.title.text }} <span v-if="FINAL_CONFIG.style.chart.title.subtitle.text">{{  FINAL_CONFIG.style.chart.title.subtitle.text }}</span>
                                </caption>
                                <thead data-cy="vertical-bar-thead">
                                    <tr role="row" data-cy="vertical-bar-thead-tr" :style="`background:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color}`">
                                        <th v-for="th in table.head" :style="`outline:${FINAL_CONFIG.table.th.outline}`">
                                            <div style="width:100%">
                                                {{ th }}
                                            </div>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th :style="`background:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color};outline:${FINAL_CONFIG.table.th.outline}`"></th>
                                        <th :style="`background:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color};outline:${FINAL_CONFIG.table.th.outline};text-align:right;padding-right:5px;font-weight:bold`">∑ {{FINAL_CONFIG.table.td.prefix}}{{ isNaN(total) ? '' : total.toFixed(FINAL_CONFIG.table.td.roundingValue) }}{{FINAL_CONFIG.table.td.suffix}}</th>
                                        <th :style="`background:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color};outline:${FINAL_CONFIG.table.th.outline};text-align:right;padding-right:5px;font-weight:bold`">100%</th>
                                        <th :style="`background:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color};outline:${FINAL_CONFIG.table.th.outline}`"></th>
                                        <th :style="`background:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color};outline:${FINAL_CONFIG.table.th.outline}`"></th>
                                        <th :style="`background:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color};outline:${FINAL_CONFIG.table.th.outline}`"></th>
                                        <th :style="`background:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color};outline:${FINAL_CONFIG.table.th.outline}`"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(tr, i) in table.body" :class="{'vue-ui-data-table__tbody__row' : true, 'vue-ui-data-table__tbody__row-even': i % 2 === 0, 'vue-ui-data-table__tbody__row-odd': i % 2 !== 0}" :style="`background:${FINAL_CONFIG.table.td.backgroundColor};color:${FINAL_CONFIG.table.td.color}`">
                                        <td class="vue-ui-data-table__tbody__td" :style="`outline:${FINAL_CONFIG.table.td.outline};font-variant-numeric: tabular-nums;`" :data-cell="(table.head[0] ?? '')">
                                            <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                                <span v-if="tr.color" :style="`color:${tr.color};margin-right:3px`">⬤</span><span>{{ tr.parentName }}</span>
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td" :style="`outline:${FINAL_CONFIG.table.td.outline}`" :data-cell="(table.head[1] ?? '')">
                                            <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">                                
                                                {{FINAL_CONFIG.table.td.prefix}}{{ ["", NaN, undefined].includes(tr.parentValue) ? '' : tr.parentValue.toFixed(FINAL_CONFIG.table.td.roundingValue) }}{{FINAL_CONFIG.table.td.suffix}}
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td" :style="`outline:${FINAL_CONFIG.table.td.outline}`" :data-cell="(table.head[2] ?? '')">
                                            <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">                                
                                                {{  ["", NaN, undefined].includes(tr.percentageToTotal) ? '' : `${(tr.percentageToTotal * 100).toFixed(FINAL_CONFIG.table.td.roundingPercentage)}%` }}
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td" :style="`outline:${FINAL_CONFIG.table.td.outline}`" :data-cell="(table.head[3] ?? '')">
                                            <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                                {{ tr.childName }}
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td" :style="`outline:${FINAL_CONFIG.table.td.outline}`" :data-cell="(table.head[4] ?? '')">
                                            <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                                {{FINAL_CONFIG.table.td.prefix}}{{ ["", NaN, undefined].includes(tr.childValue) ? '' : tr.childValue.toFixed(FINAL_CONFIG.table.td.roundingValue) }}{{FINAL_CONFIG.table.td.suffix}}
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td" :style="`outline:${FINAL_CONFIG.table.td.outline}`" :data-cell="(table.head[5] ?? '')">
                                            <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                                {{ ["", NaN, undefined].includes(tr.childPercentageToParent) ? '' : `${(tr.childPercentageToParent * 100).toFixed(FINAL_CONFIG.table.td.roundingPercentage)}%` }}
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td" :style="`outline:${FINAL_CONFIG.table.td.outline}`" :data-cell="(table.head[6] ?? '')">
                                            <div style="display: flex; align-items:center; gap: 5px; justify-content:flex-end; width:100%; padding-right:3px;">
                                                {{ ["", NaN, undefined].includes(tr.childPercentageToTotal) ? '' : `${(tr.childPercentageToTotal * 100).toFixed(FINAL_CONFIG.table.td.roundingPercentage)}%` }}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                </div>
                </div>
            </template>
        </Accordion>
    </div>
</template>

<style scoped lang="scss">
@import "../vue-data-ui.css";

.vue-ui-vertical-bar *{
    transition: unset;
}

path, line, rect, circle, polygon {
    animation: verticalBarAnimation 0.5s ease-in-out;
    transform-origin: center;
}

@keyframes verticalBarAnimation {
    0% {
        transform: scale(0.9,0.9);
        opacity: 0;
    }
    80% {
        transform: scale(1.02,1.02);
        opacity: 1;
    }
    to {
        transform: scale(1,1);
        opacity: 1;
    }
}
.vue-ui-vertical-bar {
    user-select: none;
    position: relative;
}
.vue-ui-vertical-bar .vue-ui-vertical-bar-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}

.vue-ui-vertical-bar-table {
    width: 100%;
    max-height: 300px;
    overflow: auto;
    margin-top: 24px;
    position: relative;
}

.vue-ui-data-table thead {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
}

table {
    width: 100%;
    padding: 1rem;
    border-collapse:collapse;
}

caption,
th,
td {
    padding: 0.5rem;
    font-variant-numeric: tabular-nums;
}

caption {
    font-size: 1.3rem;
    font-weight: 700;
}

.vue-ui-responsive {
    th {
        display: none;
    }
    td {
        display: grid;
        gap: 0.5rem;
        grid-template-columns: repeat(2, 1fr);
        padding: 0.5rem 1rem;
        outline: none !important;
        text-align: left;
    }
    tr {
        outline: v-bind(tdo);
    }

    td:first-child {
        padding-top: 1rem;
    }

    td:last-child {
        padding-bottom: 1rem;
    }

    td::before {
        content: attr(data-cell) ": ";
        font-weight: 700;
        text-transform: capitalize;
    }
}

.animated {
    transition: all 0.3s ease-in-out !important;
}
</style>