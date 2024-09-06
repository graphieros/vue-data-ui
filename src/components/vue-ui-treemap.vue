<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue';
import mainConfig from "../default_configs.json";
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
const defaultConfig = ref(mainConfig.vue_ui_treemap);
const isTooltip = ref(false);
const tooltipContent = ref("");
const isFullscreen = ref(false);
const step = ref(0);
const segregated = ref([]);
const treemapChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);

const treemapConfig = computed(() => {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
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
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `treemap_${uid.value}`,
    fileName: treemapConfig.value.style.chart.title.text || 'vue-ui-treemap'
});

const customPalette = computed(() => {
    return convertCustomPalette(treemapConfig.value.customPalette);
})

const mutableConfig = ref({
    showTable: treemapConfig.value.table.show,
    showTooltip: treemapConfig.value.style.chart.tooltip.show
});

const chartDimensions = ref({
    height: treemapConfig.value.style.chart.height,
    width: treemapConfig.value.style.chart.width
})

const svg = computed(() => {
    return {
        bottom: chartDimensions.value.height - treemapConfig.value.style.chart.padding.bottom,
        height: chartDimensions.value.height - treemapConfig.value.style.chart.padding.top - treemapConfig.value.style.chart.padding.bottom,
        left: treemapConfig.value.style.chart.padding.left,
        right: chartDimensions.value.width - treemapConfig.value.style.chart.padding.right,
        top: treemapConfig.value.style.chart.padding.top,
        vbHeight: chartDimensions.value.height,
        vbWidth: chartDimensions.value.width,
        width: chartDimensions.value.width - treemapConfig.value.style.chart.padding.left - treemapConfig.value.style.chart.padding.right,
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
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiTreemap',
            type: 'dataset'
        });
    }

    addIdsToTree(immutableDataset.value);

    if (treemapConfig.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: treemapChart.value,
                title: treemapConfig.value.style.chart.title.text ? chartTitle.value : null,
                legend: treemapConfig.value.style.chart.legend.show ? chartLegend.value : null,
            });
            chartDimensions.value.width = width;
            chartDimensions.value.height = height;
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(treemapChart.value.parentNode);
    }
});

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
        if (treemapConfig.value.style.chart.layout.sorted) {
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
    const ratio = treemapConfig.value.style.chart.layout.rects.colorRatio - calcRectProportion(rect, totalValue);
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
    const provisional = treemapConfig.value.style.chart.layout.labels.fontSize * (rect.proportion * 2 > 1 ? 1 : rect.proportion * 2);
    const adapted = provisional < treemapConfig.value.style.chart.layout.labels.minFontSize ? treemapConfig.value.style.chart.layout.labels.minFontSize : provisional;
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
        backgroundColor: treemapConfig.value.style.chart.legend.backgroundColor,
        color: treemapConfig.value.style.chart.legend.color,
        fontSize: treemapConfig.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: treemapConfig.value.style.chart.legend.bold ? 'bold' : ''
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
    dataTooltipSlot.value = { datapoint, seriesIndex, config: treemapConfig.value, series: datasetCopy.value };

    const customFormat = treemapConfig.value.style.chart.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
        seriesIndex,
        datapoint,
        series: datasetCopy.value,
        config: treemapConfig.value
    }))) {
        tooltipContent.value = customFormat({
            seriesIndex,
            datapoint,
            series: datasetCopy.value,
            config: treemapConfig.value
        })
    } else {
        let html = '';

        html += `<div data-cy="treemap-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid ${treemapConfig.value.style.chart.tooltip.borderColor};padding-bottom:6px;margin-bottom:3px;">${datapoint.name}</div>`;

        html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><rect data-cy="treemap-tooltip-marker" x="0" y="0" height="12" width="12" stroke="none" fill="${datapoint.color}"/></svg>`;

        html += `<b data-cy="treemap-tooltip-value">${ dataLabel({p: treemapConfig.value.style.chart.layout.labels.prefix, v: datapoint.value, s: treemapConfig.value.style.chart.layout.labels.suffix, r: treemapConfig.value.style.chart.tooltip.roundingValue})}</b>`;

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
        const tableXls = [[treemapConfig.value.style.chart.title.text],[treemapConfig.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: treemapConfig.value.style.chart.title.text || "vue-ui-treemap" })
    });
}

const dataTable = computed(() => {
    const head = [
        treemapConfig.value.table.columnNames.series,
        treemapConfig.value.table.columnNames.value,
        treemapConfig.value.table.columnNames.percentage,
    ];

    const body = table.value.head.map((h,i) => {
        const label = dataLabel({p:treemapConfig.value.style.chart.layout.labels.prefix, v: table.value.body[i], s:treemapConfig.value.style.chart.layout.labels.suffix, r:treemapConfig.value.table.td.roundingValue});
        return [
            {
                color: h.color,
                name: h.name,
                shape: 'square'
            },
            label,
            isNaN(table.value.body[i] / total.value) ? "-" : (table.value.body[i] / total.value * 100).toFixed(treemapConfig.value.table.td.roundingPercentage) + '%'
        ]
    });

    const config = {
        th: {
            backgroundColor:treemapConfig.value.table.th.backgroundColor,
            color:treemapConfig.value.table.th.color,
            outline:treemapConfig.value.table.th.outline
        },
        td: {
            backgroundColor:treemapConfig.value.table.td.backgroundColor,
            color:treemapConfig.value.table.td.color,
            outline:treemapConfig.value.table.td.outline
        },
        breakpoint:treemapConfig.value.table.responsiveBreakpoint,
    }

    const colNames = [
       treemapConfig.value.table.columnNames.series,
       treemapConfig.value.table.columnNames.value,
    ]

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

defineExpose({
    getData,
    generateCsv,
    generateImage,
    generatePdf,
    toggleTable,
    toggleTooltip
})

</script>

<template>
    <div ref="treemapChart"
        :class="`vue-ui-treemap ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${treemapConfig.useCssAnimation ? '' : 'vue-ui-dna'}`"
        :style="`font-family:${treemapConfig.style.fontFamily};width:100%; ${treemapConfig.responsive ? 'height: 100%;' : ''} text-align:center;${!treemapConfig.style.chart.title.text ? 'padding-top:36px' : ''};background:${treemapConfig.style.chart.backgroundColor}`"
        :id="`treemap_${uid}`">
        
        <!-- TITLE -->
        <div ref="chartTitle" v-if="treemapConfig.style.chart.title.text" :style="`width:100%;background:${treemapConfig.style.chart.backgroundColor};padding-bottom:6px`">
            <Title
                :config="{
                    title: {
                        cy: 'treemap-div-title',
                        ...treemapConfig.style.chart.title
                    },
                    subtitle: {
                        cy: 'treemap-div-subtitle',
                        ...treemapConfig.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="treemapConfig.userOptions.show && isDataset"
            :backgroundColor="treemapConfig.style.chart.backgroundColor"
            :color="treemapConfig.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="treemapConfig.userOptions.buttons.tooltip && treemapConfig.style.chart.tooltip.show"
            :hasPdf="treemapConfig.userOptions.buttons.pdf"
            :hasXls="treemapConfig.userOptions.buttons.csv"
            :hasImg="treemapConfig.userOptions.buttons.img"
            :hasTable="treemapConfig.userOptions.buttons.table"
            :hasFullscreen="treemapConfig.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...treemapConfig.userOptions.buttonTitles }"
            :chartElement="treemapChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
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
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
        </UserOptions>

        <!-- CHART -->
        <svg :xmlns="XMLNS" v-if="isDataset"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen, 'vue-data-ui-zoom-plus': !isZoom, 'vue-data-ui-zoom-minus': isZoom }"
            data-cy="treemap-svg" :viewBox="`${viewBox.startX} ${viewBox.startY} ${viewBox.width <= 0 ? 10 : viewBox.width} ${viewBox.height <= 0 ? 10 : viewBox.height}`"
            :style="`max-width:100%; overflow: hidden; background:${treemapConfig.style.chart.backgroundColor};color:${treemapConfig.style.chart.color}`">

            <g v-for="(rect, i) in squarified">            
                <defs v-if="treemapConfig.style.chart.layout.rects.gradient.show">
                    <radialGradient :id="`tgrad_${rect.id}`" gradientTransform="translate(-1, -1.000001) scale(2, 2)">
                        <stop offset="18%" :stop-color="rect.color"/>
                        <stop offset="100%" :stop-color="lightenHexColor(rect.color, treemapConfig.style.chart.layout.rects.gradient.intensity / 100)"/>
                    </radialGradient>
                </defs>
            </g>

            <g v-for="(rect, i) in squarified">
                <rect 
                    :x="rect.x0" 
                    :y="rect.y0" 
                    :height="getHeight(rect)" 
                    :width="getWidth(rect)" 
                    :fill="isSafari ? rect.color : treemapConfig.style.chart.layout.rects.gradient.show ? `url(#tgrad_${rect.id})` : rect.color"
                    :rx="treemapConfig.style.chart.layout.rects.borderRadius"
                    :stroke="selectedRect && selectedRect.id === rect.id ? treemapConfig.style.chart.layout.rects.selected.stroke : treemapConfig.style.chart.layout.rects.stroke"
                    :stroke-width="selectedRect && selectedRect.id === rect.id ? treemapConfig.style.chart.layout.rects.selected.strokeWidth : treemapConfig.style.chart.layout.rects.strokeWidth"
                    @click="zoom(rect)"
                    @mouseenter="() => useTooltip({
                        datapoint: rect,
                        seriesIndex: i,
                    })"
                    @mouseleave="selectedRect = null; isTooltip = false"
                    :style="`opacity:${selectedRect ? selectedRect.id === rect.id ? 1 : treemapConfig.style.chart.layout.rects.selected.unselectedOpacity : 1}`"
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
                            v-if="treemapConfig.style.chart.layout.labels.showDefaultLabels && (rect.proportion > treemapConfig.style.chart.layout.labels.hideUnderProportion || isZoom)" :style="`width:calc(100% - ${calcFontSize(rect) / 1.5}px);text-align:left;line-height:${calcFontSize(rect) < 14 ? 14 : calcFontSize(rect)}px;padding:${calcFontSize(rect) / 3}px; color:${adaptColorToBackground(rect.color)}`"
                        >
                            <span :style="`width:100%;font-size:${calcFontSize(rect)}px;`">
                                {{ rect.name }}
                            </span><br>
                            <span :style="`width:100%;font-size:${calcFontSize(rect)}px;`">
                                {{  dataLabel({
                                    p: treemapConfig.style.chart.layout.labels.prefix,
                                    v: rect.value,
                                    s: treemapConfig.style.chart.layout.labels.suffix,
                                    r: treemapConfig.style.chart.layout.labels.rounding
                                }) }}
                            </span>
                        </div>
                        <slot 
                            name="rect" 
                            v-bind="{ 
                                rect, 
                                shouldShow: rect.proportion > treemapConfig.style.chart.layout.labels.hideUnderProportion || isZoom, 
                                fontSize: calcFontSize(rect), 
                                isZoom, 
                                textColor: adaptColorToBackground(rect.color) 
                        }"/>
                    </div>
                </foreignObject>
            </g>
            <slot name="svg" v-bind="{ svg, isZoom, rect: selectedRect, config: treemapConfig }"/>
        </svg>

        <Skeleton 
            v-if="!isDataset"
            :config="{
                type: 'treemap',
                style: {
                    backgroundColor: treemapConfig.style.chart.backgroundColor,
                    treemap: {
                        color: '#CCCCCC',
                    }
                }
            }"
        />

        <!-- LEGEND & LEGEND SLOT -->
        <div ref="chartLegend">
            <Legend
                v-if="treemapConfig.style.chart.legend.show"
                :legendSet="legendSet"
                :config="legendConfig"
                :id="`treemap_legend_${uid}`"
                @clickMarker="({legend}) => segregate(legend)"
            >
                <template #item="{ legend, index }">
                    <div :data-cy="`legend-item-${index}`" @click="segregate(legend)" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                        {{ legend.name }}: {{ dataLabel({p: treemapConfig.style.chart.layout.labels.prefix, v: legend.value, s: treemapConfig.style.chart.layout.labels.suffix, r: treemapConfig.style.chart.legend.roundingValue}) }}
                        <span v-if="!segregated.includes(legend.id)">
                            ({{ isNaN(legend.value / total) ? '-' : (legend.value / total * 100).toFixed(treemapConfig.style.chart.legend.roundingPercentage)}}%)
                        </span>
                        <span v-else>
                            ( - % )
                        </span>
    
                    </div>
                </template>
            </Legend>
            <slot v-else name="legend" v-bind:legend="legendSet" />
        </div>


        <!-- TOOLTIP -->
        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="treemapConfig.style.chart.tooltip.backgroundColor"
            :color="treemapConfig.style.chart.tooltip.color"
            :fontSize="treemapConfig.style.chart.tooltip.fontSize"
            :borderRadius="treemapConfig.style.chart.tooltip.borderRadius"
            :borderColor="treemapConfig.style.chart.tooltip.borderColor"
            :borderWidth="treemapConfig.style.chart.tooltip.borderWidth"
            :parent="treemapChart"
            :content="tooltipContent"
            :isCustom="isFunction(treemapConfig.style.chart.tooltip.customFormat)"
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
                backgroundColor: treemapConfig.style.chart.backgroundColor,
                color: treemapConfig.style.chart.color
            },
            head: {
                backgroundColor: treemapConfig.style.chart.backgroundColor,
                color: treemapConfig.style.chart.color
            }
        }">
            <template #content>
                <DataTable
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${treemapConfig.style.chart.title.text}${treemapConfig.style.chart.title.subtitle.text ? ` : ${treemapConfig.style.chart.title.subtitle.text}` : ''}`"
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