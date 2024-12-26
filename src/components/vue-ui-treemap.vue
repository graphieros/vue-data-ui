<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount, watch } from 'vue';
import themes from "../themes.json";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Tooltip from "../atoms/Tooltip.vue";
import Legend from "../atoms/Legend.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import DataTable from '../atoms/DataTable.vue';
import Accordion from './vue-ui-accordion.vue';
import {
    adaptColorToBackground,
    applyDataLabel,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createUid,
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    isFunction,
    lightenHexColor,
    objectIsEmpty,
    palette,
    themePalettes,
    XMLNS
} from '../lib';
import { throttle } from '../canvas-lib';
import {
    generateTreemap,
} from '../treemap';
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from '../usePrinter';
import { useResponsive } from '../useResponsive';
import { useConfig } from '../useConfig';
import PackageVersion from '../atoms/PackageVersion.vue';
import PenAndPaper from '../atoms/PenAndPaper.vue';
import { useUserOptionState } from '../useUserOptionState';

const { vue_ui_treemap: DEFAULT_CONFIG } = useConfig()

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

const emit = defineEmits(['selectLegend', 'selectDatapoint'])

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

const isSafari = computed(() => {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
})

const uid = ref(createUid());
const isTooltip = ref(false);
const tooltipContent = ref("");
const isFullscreen = ref(false);
const step = ref(0);
const segregated = ref([]);
const treemapChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_treemap[mergedConfig.theme] || props.config,
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
    userOptionsVisible.value = !FINAL_CONFIG.value.showOnChartHover;
    titleStep.value += 1;
    tableStep.value += 1;
    legendStep.value += 1;
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `treemap_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-treemap'
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
});

const chartDimensions = ref({
    height: FINAL_CONFIG.value.style.chart.height,
    width: FINAL_CONFIG.value.style.chart.width
})

const svg = computed(() => {
    return {
        bottom: chartDimensions.value.height - FINAL_CONFIG.value.style.chart.padding.bottom,
        height: chartDimensions.value.height - FINAL_CONFIG.value.style.chart.padding.top - FINAL_CONFIG.value.style.chart.padding.bottom,
        left: FINAL_CONFIG.value.style.chart.padding.left,
        right: chartDimensions.value.width - FINAL_CONFIG.value.style.chart.padding.right,
        top: FINAL_CONFIG.value.style.chart.padding.top,
        vbHeight: chartDimensions.value.height,
        vbWidth: chartDimensions.value.width,
        width: chartDimensions.value.width - FINAL_CONFIG.value.style.chart.padding.left - FINAL_CONFIG.value.style.chart.padding.right,
    }
});

function addIdsToTree(tree) {
    tree.forEach((node, i) => {
        node.id = createUid();
        node.color = convertColorToHex(node.color) || customPalette.value[i] || palette[i] || palette[i % palette.length];
        if (node.children) {
            node.children.forEach(c => {
                c.parentId = node.id,
                c.color = node.color
            })
        addIdsToTree(node.children);
        }
    });
}

const immutableDataset = ref(props.dataset);

const resizeObserver = ref(null);

onMounted(() => {
    prepareChart();
});

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiTreemap',
            type: 'dataset'
        });
    }

    addIdsToTree(immutableDataset.value);

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: treemapChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
                source: source.value,
                noTitle: noTitle.value
            });
            chartDimensions.value.width = width;
            chartDimensions.value.height = height;
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(treemapChart.value.parentNode);
    }
}

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
});

const currentSet = ref(immutableDataset.value);
        
const datasetCopy = computed(() => {
    return currentSet.value.map((ds, i) => {
        return {
            ...ds,
            color: convertColorToHex(ds.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
        }
    }).filter((ds) => !segregated.value.includes(ds.id))
});
        
const total = computed(() => immutableDataset.value.filter((ds) => !segregated.value.includes(ds.id)).map(d => d.value || 0).reduce((a, b) => a + b, 0));
        
const orderedDataset = computed({
    get() {
        let ds = [...datasetCopy.value];
        if (FINAL_CONFIG.value.style.chart.layout.sorted) {
            ds = [...datasetCopy.value].sort((a, b) => b.value - a.value);
        }
        return ds.map(d => {
            return {
                ...d,
            }
        })
    },
    set(val) {
        return val;
    },
});

function calcRectProportion(rect, totalValue) {
    return rect.value / totalValue;
}

function calcRectOpacity(color, rect, totalValue) {
    const ratio = FINAL_CONFIG.value.style.chart.layout.rects.colorRatio - calcRectProportion(rect, totalValue);
    return lightenHexColor(color, ratio < 0 ? 0 : ratio);
}

function mapChildren(children, parentColor, parentName, totalValue) {
    return children.map((item, j) => {
        const color = calcRectOpacity(convertColorToHex(parentColor) || customPalette.value[j] || palette[j] || palette[j % palette.length], item, totalValue);
        const proportion = calcRectProportion(item, totalValue);
        return {
            ...item,
            color,
            proportion,
            parentName,
            children: item.children ? mapChildren(item.children, color, item.name, totalValue) : undefined
        };
    });
};

const squarified = computed(() => {
    return generateTreemap(
        orderedDataset.value.map((el, i) => {
            const totalValue = el.children ? el.children.reduce((acc, child) => acc + child.value, 0) : el.value;
            return {
                value: el.value,
                id: el.id,
                children: el.children
                    ? mapChildren(el.children.sort((a, b) => b.value - a.value), el.color, el.name, totalValue)
                    : undefined,
                color: el.color,
                name: el.name,
            };
        }),
        { x0: svg.value.left * 2, y0: svg.value.top, x1: svg.value.width, y1: svg.value.height }
    );
});

function getHeight({ y0, y1 }) {
    return y1 - y0 <= 0 ? 0.0001 : y1 - y0;
}

function getWidth({ x0, x1 }) {
    return x1 - x0 <= 0 ? 0.0001 : x1 - x0;
}

function calcFontSize(rect) {
    const provisional = FINAL_CONFIG.value.style.chart.layout.labels.fontSize * (rect.proportion * 2 > 1 ? 1 : rect.proportion * 2);
    const adapted = provisional < FINAL_CONFIG.value.style.chart.layout.labels.minFontSize ? FINAL_CONFIG.value.style.chart.layout.labels.minFontSize : provisional;
    return adapted;
}

function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const viewBox = computed(() => {
    return {
        startX: 0,
        startY: 0,
        width: svg.value.vbWidth,
        height: svg.value.vbHeight,
    }
})

const isZoom = ref(false);

function findNodeById(id, nodes = immutableDataset.value) {
    for (const node of nodes) {
        if (node.id === id) {
        return node;
        }
        if (node.children) {
        const foundNode = findNodeById(id, node.children);
        if (foundNode) {
            return foundNode;
        }
        }
    }
    return null;
};

function zoom(rect) {
    if(isZoom.value) {
        emit('selectDatapoint', undefined);
        currentSet.value = immutableDataset.value;
    } else {
        emit('selectDatapoint', rect);
        if(!findNodeById(rect.parentId)) {
            return
        }
        currentSet.value = [findNodeById(rect.parentId)];
    }
    isZoom.value = !isZoom.value;
}

const selectedRect = ref(null);

const legendSet = computed(() => {
    return immutableDataset.value.map((ds, i) => {
        return {
            ...ds,
            color: convertColorToHex(ds.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
            shape: 'square',
        }
    })
        .sort((a,b) => b.value - a.value)
        .map((el, i) => {
            return {
                ...el,
                proportion: el.value / immutableDataset.value.map(m => m.value).reduce((a, b) => a + b, 0),
                opacity: segregated.value.includes(el.id) ? 0.5 : 1
            }
        })
});

const legendConfig = computed(() => {
    return {
        cy: 'treemap-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
});

function segregate(rect) {
    isZoom.value = false;
    selectedRect.value = null;
    if(segregated.value.includes(rect.id)) {
        segregated.value = segregated.value.filter(s => s !== rect.id)
    } else {
        if(segregated.value.length < props.dataset.length - 1) {
            segregated.value.push(rect.id)
        }
    }
    emit('selectLegend', orderedDataset.value);
}

const dataTooltipSlot = ref(null);

function useTooltip({ datapoint, seriesIndex }) {
    selectedRect.value = datapoint;
    dataTooltipSlot.value = { datapoint, seriesIndex, config: FINAL_CONFIG.value, series: datasetCopy.value };

    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
        seriesIndex,
        datapoint,
        series: datasetCopy.value,
        config: FINAL_CONFIG.value
    }))) {
        tooltipContent.value = customFormat({
            seriesIndex,
            datapoint,
            series: datasetCopy.value,
            config: FINAL_CONFIG.value
        })
    } else {
        let html = '';

        html += `<div data-cy="treemap-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor};padding-bottom:6px;margin-bottom:3px;">${datapoint.name}</div>`;

        html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><rect data-cy="treemap-tooltip-marker" x="0" y="0" height="12" width="12" stroke="none" fill="${datapoint.color}"/></svg>`;

        html += `<b data-cy="treemap-tooltip-value">${ applyDataLabel(
            FINAL_CONFIG.value.style.chart.layout.labels.formatter,
            datapoint.value,
            dataLabel({
                p: FINAL_CONFIG.value.style.chart.layout.labels.prefix, 
                v: datapoint.value, 
                s: FINAL_CONFIG.value.style.chart.layout.labels.suffix, 
                r: FINAL_CONFIG.value.style.chart.tooltip.roundingValue
            }),
            { datapoint, seriesIndex }
            )}</b>`;

        tooltipContent.value = `<div>${html}</div>`;
    }
    isTooltip.value = true;
}

const table = computed(() => {
    const head = squarified.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color
        }
    });
    const body = squarified.value.map(ds => ds.value);
    return { head, body };
});


function generateCsv() {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [isNaN(table.value.body[i] / total.value) ? '-' : table.value.body[i] / total.value * 100]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text],[FINAL_CONFIG.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-treemap" })
    });
}

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
        FINAL_CONFIG.value.table.columnNames.percentage,
    ];

    const body = table.value.head.map((h,i) => {
        const label = applyDataLabel(
            FINAL_CONFIG.value.style.chart.layout.labels.formatter,
            table.value.body[i],
            dataLabel({
                p:FINAL_CONFIG.value.style.chart.layout.labels.prefix, 
                v: table.value.body[i], 
                s:FINAL_CONFIG.value.style.chart.layout.labels.suffix, 
                r:FINAL_CONFIG.value.table.td.roundingValue
            })
        );
        return [
            {
                color: h.color,
                name: h.name,
                shape: 'square'
            },
            label,
            isNaN(table.value.body[i] / total.value) ? "-" : dataLabel({
                v: table.value.body[i] / total.value * 100,
                s: '%',
                r: FINAL_CONFIG.value.table.td.roundingPercentage
            })
        ]
    });

    const config = {
        th: {
            backgroundColor:FINAL_CONFIG.value.table.th.backgroundColor,
            color:FINAL_CONFIG.value.table.th.color,
            outline:FINAL_CONFIG.value.table.th.outline
        },
        td: {
            backgroundColor:FINAL_CONFIG.value.table.td.backgroundColor,
            color:FINAL_CONFIG.value.table.td.color,
            outline:FINAL_CONFIG.value.table.td.outline
        },
        breakpoint:FINAL_CONFIG.value.table.responsiveBreakpoint,
    }

    const colNames = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
    ];

    return {
        colNames,
        head,
        body,
        config
    }
});

function getData() {
    return squarified.value
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
    getData,
    generateCsv,
    generateImage,
    generatePdf,
    toggleTable,
    toggleTooltip,
    toggleAnnotator
})

</script>

<template>
    <div ref="treemapChart"
        :class="`vue-ui-treemap ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; ${FINAL_CONFIG.responsive ? 'height: 100%;' : ''} text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`"
        :id="`treemap_${uid}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">

        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :parent="treemapChart"
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
        
        <!-- TITLE -->
        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:${FINAL_CONFIG.style.chart.backgroundColor};padding-bottom:6px`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'treemap-div-title',
                        ...FINAL_CONFIG.style.chart.title
                    },
                    subtitle: {
                        cy: 'treemap-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip && FINAL_CONFIG.style.chart.tooltip.show"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="treemapChart"
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
            :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }"
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
        <svg :xmlns="XMLNS" v-if="isDataset"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen, 'vue-data-ui-zoom-plus': !isZoom, 'vue-data-ui-zoom-minus': isZoom }"
            data-cy="treemap-svg" :viewBox="`${viewBox.startX} ${viewBox.startY} ${viewBox.width <= 0 ? 10 : viewBox.width} ${viewBox.height <= 0 ? 10 : viewBox.height}`"
            :style="`max-width:100%; overflow: hidden; background:transparent;color:${FINAL_CONFIG.style.chart.color}`"
        >
            <PackageVersion />

            <g v-for="(rect, _i) in squarified">            
                <defs v-if="FINAL_CONFIG.style.chart.layout.rects.gradient.show">
                    <radialGradient :id="`tgrad_${rect.id}`" gradientTransform="translate(-1, -1.000001) scale(2, 2)">
                        <stop offset="18%" :stop-color="rect.color"/>
                        <stop offset="100%" :stop-color="lightenHexColor(rect.color, FINAL_CONFIG.style.chart.layout.rects.gradient.intensity / 100)"/>
                    </radialGradient>
                </defs>
            </g>

            <g v-for="(rect, i) in squarified">
                <rect 
                    :x="rect.x0" 
                    :y="rect.y0" 
                    :height="getHeight(rect)" 
                    :width="getWidth(rect)" 
                    :fill="isSafari ? rect.color : FINAL_CONFIG.style.chart.layout.rects.gradient.show ? `url(#tgrad_${rect.id})` : rect.color"
                    :rx="FINAL_CONFIG.style.chart.layout.rects.borderRadius"
                    :stroke="selectedRect && selectedRect.id === rect.id ? FINAL_CONFIG.style.chart.layout.rects.selected.stroke : FINAL_CONFIG.style.chart.layout.rects.stroke"
                    :stroke-width="selectedRect && selectedRect.id === rect.id ? FINAL_CONFIG.style.chart.layout.rects.selected.strokeWidth : FINAL_CONFIG.style.chart.layout.rects.strokeWidth"
                    @click="zoom(rect)"
                    @mouseenter="() => useTooltip({
                        datapoint: rect,
                        seriesIndex: i,
                    })"
                    @mouseleave="selectedRect = null; isTooltip = false"
                    :style="`opacity:${selectedRect ? selectedRect.id === rect.id ? 1 : FINAL_CONFIG.style.chart.layout.rects.selected.unselectedOpacity : 1}`"
                    class="vue-ui-treemap-rect"
                />

                <foreignObject
                    :x="rect.x0" 
                    :y="rect.y0" 
                    :height="getHeight(rect)" 
                    :width="getWidth(rect)"
                    class="vue-ui-treemap-cell-foreignObject"
                >
                    <div style="width: 100%; height: 100%" class="vue-ui-treemap-cell">
                        <div
                            class="vue-ui-treemap-cell-default"
                            v-if="FINAL_CONFIG.style.chart.layout.labels.showDefaultLabels && (rect.proportion > FINAL_CONFIG.style.chart.layout.labels.hideUnderProportion || isZoom)" :style="`width:calc(100% - ${calcFontSize(rect) / 1.5}px);text-align:left;line-height:${calcFontSize(rect) < 14 ? 14 : calcFontSize(rect)}px;padding:${calcFontSize(rect) / 3}px; color:${adaptColorToBackground(rect.color)}`"
                        >
                            <span :style="`width:100%;font-size:${calcFontSize(rect)}px;`">
                                {{ rect.name }}
                            </span><br>
                            <span :style="`width:100%;font-size:${calcFontSize(rect)}px;`">
                                {{ applyDataLabel(
                                    FINAL_CONFIG.style.chart.layout.labels.formatter,
                                    rect.value,
                                    dataLabel({
                                        p: FINAL_CONFIG.style.chart.layout.labels.prefix,
                                        v: rect.value,
                                        s: FINAL_CONFIG.style.chart.layout.labels.suffix,
                                        r: FINAL_CONFIG.style.chart.layout.labels.rounding
                                    }),
                                    { datapoint: rect }
                                    )
                                }}
                            </span>
                        </div>
                        <slot 
                            name="rect" 
                            v-bind="{ 
                                rect, 
                                shouldShow: rect.proportion > FINAL_CONFIG.style.chart.layout.labels.hideUnderProportion || isZoom, 
                                fontSize: calcFontSize(rect), 
                                isZoom, 
                                textColor: adaptColorToBackground(rect.color) 
                        }"/>
                    </div>
                </foreignObject>
            </g>
            <slot name="svg" v-bind="{ svg, isZoom, rect: selectedRect, config: FINAL_CONFIG }"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <Skeleton 
            v-if="!isDataset"
            :config="{
                type: 'treemap',
                style: {
                    backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                    treemap: {
                        color: '#CCCCCC',
                    }
                }
            }"
        />

        <!-- LEGEND & LEGEND SLOT -->
        <div ref="chartLegend">
            <Legend
                v-if="FINAL_CONFIG.style.chart.legend.show"
                :key="`legend_${legendStep}`"
                :legendSet="legendSet"
                :config="legendConfig"
                :id="`treemap_legend_${uid}`"
                @clickMarker="({legend}) => segregate(legend)"
            >
                <template #item="{ legend, index }">
                    <div :data-cy="`legend-item-${index}`" @click="segregate(legend)" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                        {{ legend.name }}: {{ applyDataLabel(
                            FINAL_CONFIG.style.chart.layout.labels.formatter,
                            legend.value,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.layout.labels.prefix, 
                                v: legend.value, 
                                s: FINAL_CONFIG.style.chart.layout.labels.suffix, 
                                r: FINAL_CONFIG.style.chart.legend.roundingValue
                            }),
                            { datapoint: legend }
                            ) 
                        }}
                        <span v-if="!segregated.includes(legend.id)">
                            ({{ isNaN(legend.value / total) ? '-' : (legend.value / total * 100).toFixed(FINAL_CONFIG.style.chart.legend.roundingPercentage)}}%)
                        </span>
                        <span v-else>
                            ( - % )
                        </span>
    
                    </div>
                </template>
            </Legend>
            <slot v-else name="legend" v-bind:legend="legendSet" />
        </div>


        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>


        <!-- TOOLTIP -->
        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.style.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.chart.tooltip.color"
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.chart.tooltip.position"
            :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="treemapChart"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="isFunction(FINAL_CONFIG.style.chart.tooltip.customFormat)"
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
                        {{ td.name || td }}
                    </template>
                </DataTable>
            </template>
        </Accordion>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-treemap * {
    transition: unset;
}

.vue-ui-treemap {
    user-select: none;
    position: relative;
}

.vue-ui-treemap-cell-default {
    text-align: left;
}

.vue-ui-treemap-cell,
.vue-ui-treemap-cell-foreignObject {
    pointer-events: none;
}

.vue-ui-treemap-rect {
    transition: all 0.2s ease-in-out;
}

.vue-ui-treemap-zoom-info {
    pointer-events: none;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width:100%;
    display: flex;
    align-items:center;
    justify-content:center;
}

.vue-ui-treemap-cell-zoom {
    animation: zoom-cell 0.2s ease-in forwards !important;
    transform-origin: center;
}

@keyframes zoom-cell {
    0% {
        transform: scale(0.8,0.8);
        opacity: 0;
        filter:drop-shadow(0px 12px 12px black);
    }
    100% {
        transform: scale(1, 1);
        opacity: 1;
    }
}
</style>