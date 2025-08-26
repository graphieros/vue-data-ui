<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount, watch, useSlots, defineAsyncComponent, shallowRef, toRefs } from 'vue';
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
    treeShake,
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
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import BaseIcon from '../atoms/BaseIcon.vue';
import themes from "../themes.json";
import Title from "../atoms/Title.vue";
import Legend from "../atoms/Legend.vue";
import img from '../img';
import { useLoading } from '../useLoading';
import BaseScanner from '../atoms/BaseScanner.vue';

const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));

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

const emit = defineEmits(['selectLegend', 'selectDatapoint']);
const slots = useSlots();

onMounted(() => {
    if (slots['chart-background']) {
        console.warn('VueUiTreemap does not support the #chart-background slot.')
    }
})

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
const treemapChart = shallowRef(null);
const chartTitle = shallowRef(null);
const chartLegend = shallowRef(null);
const source = shallowRef(null);
const noTitle = shallowRef(null);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);
const drillStack = ref([]); 
const breadcrumbsNav = ref(null);
const readyTeleport = ref(false);

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: [
        {
            name: '_',
            value: 53,
            color: '#CACACA90',
            children: [
                { name: '_', value: 21 },
                { name: '_', value: 13 },
                { name: '_', value: 8 },
                { name: '_', value: 5 },
                { name: '_', value: 3 },
                { name: '_', value: 2 },
                { name: '_', value: 1 },
            ]
        }
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            userOptions: { show: false },
            style: {
                chart: {
                    backgroundColor: '#999999',
                    layout: {
                        labels: {
                            showDefaultLabels: false
                        },
                        rects: {
                            stroke: '#6A6A6A'
                        },
                    },
                    legend: {
                        backgroundColor: 'transparent'
                    }
                }
            }
        }
    })
})

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

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
    if (!loading.value) {
        FINAL_CONFIG.value = prepareConfig();
    }
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    titleStep.value += 1;
    tableStep.value += 1;
    legendStep.value += 1;

    // Reset mutable config
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.chart.tooltip.show;
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `treemap_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-treemap',
    options: FINAL_CONFIG.value.userOptions.print
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

// v3 - Essential to make shifting between loading config and final config work
watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
        showTable: FINAL_CONFIG.value.table.show,
        showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
    }
}, { immediate: true });

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

const immutableDataset = ref(FINAL_DATASET.value);
const currentSet = ref(immutableDataset.value);

const rootColorMap = shallowRef(new Map());

function applyIdsAndTopLevelColors(tree) {
    if (!Array.isArray(tree)) return;

    tree.forEach((node, i) => {
        if (!node.id) node.id = createUid();

        let base = convertColorToHex(node.color) 
            || rootColorMap.value.get(node.id) 
            || customPalette.value[i] 
            || palette[i] 
            || palette[i % palette.length];

        base = convertColorToHex(base);
        rootColorMap.value.set(node.id, base);
        node.color = base;

        propagateColor(node, base);
    });
}

function propagateColor(node, base) {
    if (!Array.isArray(node.children)) return;
    node.children.forEach((child) => {
        if (!child.id) child.id = createUid();
        child.parentId = node.id;
        child.color = base;
        propagateColor(child, base);
    });
}

function syncToZoomLevel() {
    if (!drillStack.value.length) {
        currentSet.value = immutableDataset.value.slice();
    } else {
        const topId = drillStack.value[drillStack.value.length - 1];
        const n = findNodeById(topId);
        currentSet.value = n?.children?.slice() || [];
    }
}

watch(
    () => FINAL_DATASET.value,
    () => {
        immutableDataset.value = FINAL_DATASET.value;
        applyIdsAndTopLevelColors(immutableDataset.value);
        syncToZoomLevel();
        legendStep.value += 1;
        tableStep.value += 1;
    },
    { deep: true, immediate: true, flush: 'post' }
);

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

onMounted(() => {
    readyTeleport.value = true;
    prepareChart();
});

const debug = computed(() => FINAL_CONFIG.value.debug);

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiTreemap',
            type: 'dataset',
            debug: debug.value
        });
    }

    applyIdsAndTopLevelColors(immutableDataset.value);

    // v3
    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: treemapChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
                source: source.value,
                noTitle: noTitle.value
            });

            requestAnimationFrame(() => {
                chartDimensions.value.width = width;
                chartDimensions.value.height = height - 12;
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = treemapChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }
}

onBeforeUnmount(() => {
    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }
});
        
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
                id: el.id || createUid(),
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
    let offsetBreadcrumbsY = 0;
    if (breadcrumbsNav.value) {
        offsetBreadcrumbsY = breadcrumbsNav.value.getBoundingClientRect().height; 
    }
    return {
        startX: 0,
        startY: 0,
        width: svg.value.vbWidth,
        height: svg.value.vbHeight - offsetBreadcrumbsY,
    }
});

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

const isZoom = computed(() => drillStack.value.length > 0);

function zoom(rect, seriesIndex) {
    if (!rect) {
        currentSet.value = immutableDataset.value.slice()
        emit('selectDatapoint', undefined)
        drillStack.value = []
        return
    }

    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint: rect, seriesIndex });
    }

    const node = findNodeById(rect.id)

    if (node && node.children?.length) {
        drillStack.value.push(node.id)
        currentSet.value = node.children.slice()
        emit('selectDatapoint', rect)

    } else if (rect.parentId) {
        drillStack.value.push(rect.parentId)
        const parent = findNodeById(rect.parentId)
        currentSet.value = parent.children.slice()
        emit('selectDatapoint', rect)

    } else if (drillStack.value.length > 0) {
            drillStack.value.pop()
            const topId = drillStack.value[drillStack.value.length - 1]
        if (topId) {
            const upNode = findNodeById(topId)
            currentSet.value = upNode.children.slice()
        } else {
            currentSet.value = immutableDataset.value.slice()
            drillStack.value = []
            emit('selectDatapoint', undefined)
        }
    }
}

function canDrill(rect) {
    const node = findNodeById(rect.id)
    if (node?.children?.length) return true
    if (rect.parentId) return true
    return false
}

const breadcrumbs = computed(() => {
    const crumbs = [
        { id: null,  label: 'All' }
    ];

    if (drillStack.value.length > 0) {
        let node = findNodeById(drillStack.value[drillStack.value.length - 1]);
        const path = [];

        while (node) {
            path.unshift(node);
            node = node.parentId
                ? findNodeById(node.parentId)
                : null;
        }

        for (const n of path) {
            crumbs.push({
                id:    n.id,
                label: n.name,
                node: n
            });
        }
    }
    return crumbs;
});

const selectedRect = shallowRef(null);

const legendSet = computed(() => {
    return immutableDataset.value.map((ds, i) => {
        return {
            ...ds,
            color: convertColorToHex(ds.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
            shape: 'square',
        }
    })
        .sort((a,b) => b.value - a.value)
        .map((el, _i) => {
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

function onTrapLeave({ datapoint, seriesIndex }) {
    selectedRect.value = null;
    isTooltip.value = false;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex });
    }
}

const dataTooltipSlot = ref(null);

function useTooltip({ datapoint, seriesIndex }) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex });
    }

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


function generateCsv(callback=null) {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [isNaN(table.value.body[i] / total.value) ? '-' : table.value.body[i] / total.value * 100]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text],[FINAL_CONFIG.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);

        const csvContent = createCsvContent(tableXls);


        if (!callback) {
            downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-treemap" })
        } else {
            callback(csvContent);
        }
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

const activeCrumbIndex = ref(null)

function activateHomeIcon(id) {
    activeCrumbIndex.value = id
}
function deactivateHomeIcon() {
    activeCrumbIndex.value = null
}

async function getImage({ scale = 2} = {}) {
    if (!treemapChart.value) return;
    const { width, height } = treemapChart.value.getBoundingClientRect();
    const aspectRatio = width / height; 
    const { imageUri, base64 } = await img({ domElement: treemapChart.value, base64: true, img: true, scale})
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio
    }
}

defineExpose({
    getData,
    getImage,
    generateCsv,
    generateImage,
    generatePdf,
    toggleTable,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen
})

</script>

<template>
    <div ref="treemapChart"
        :class="`vue-ui-treemap ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; ${FINAL_CONFIG.responsive ? 'height: 100%;' : ''} text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`"
        :id="`treemap_${uid}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">

        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
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

        <div :id="`legend-top-${uid}`" />

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
            :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
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
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }"/>
            </template>
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

        <nav class="vue-ui-treemap-breadcrumbs" v-if="breadcrumbs.length > 1" data-dom-to-png-ignore ref="breadcrumbsNav">
            <span 
                v-for="(crumb, i) in breadcrumbs"
                role="button"
                :tabindex="i < breadcrumbs.length - 1 ? 0 : undefined"
                :key="crumb.id || 'root'" 
                @click="i === breadcrumbs.length - 1 ? () => {} : zoom(crumb.node)"
                @keydown.enter.prevent="i === breadcrumbs.length - 1 ? undefined : zoom(crumb.node)"
                @keydown.space.prevent="i === breadcrumbs.length - 1 ? undefined : zoom(crumb.node)"
                class="vue-ui-treemap-crumb"
                :data-last-crumb="i === breadcrumbs.length - 1"
                :style="{
                    color: FINAL_CONFIG.style.chart.color
                }"
                @mouseenter="activateHomeIcon(i)"
                @mouseleave="deactivateHomeIcon"
                @focus="activateHomeIcon(i)"
                @blur="deactivateHomeIcon"
            >
                <span 
                    class="vue-ui-treemap-crumb-unit"
                >
                    <span class="vue-ui-treemap-crumb-unit-label">
                        <slot name="breadcrumb-label" v-bind="{ crumb, isRoot: i === 0, isFocus: activeCrumbIndex === i }">
                            <template v-if="i === 0">
                                <div style="width: 24px; display:flex; align-items:center">
                                    <BaseIcon :name="activeCrumbIndex === 0 ? 'homeFilled' : 'home'" :stroke="FINAL_CONFIG.style.chart.color"/>
                                </div>
                            </template>
                            <template v-else>
                                {{ crumb.label }}
                            </template>
                        </slot>
                    </span>

                    <span v-if="i < breadcrumbs.length - 1" class="vue-ui-treemap-crumb-unit-arrow">
                        <slot name="breadcrumb-arrow">
                            ›
                        </slot>
                    </span>
                </span>
            </span>
        </nav>

        <!-- CHART -->
        <svg 
            ref="svgRef"
            :xmlns="XMLNS" 
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen, 'vue-data-ui-zoom-plus': !isZoom, 'vue-data-ui-zoom-minus': isZoom, 'loading': loading }"
            data-cy="treemap-svg" 
            :viewBox="`${viewBox.startX} ${viewBox.startY} ${viewBox.width <= 0 ? 10 : viewBox.width} ${viewBox.height <= 0 ? 10 : viewBox.height}`"
            :style="`max-width:100%; overflow: hidden; background:transparent;color:${FINAL_CONFIG.style.chart.color}`"
        >
            <PackageVersion />

            <g v-for="(rect, _i) in squarified" :key="`tgrad_${rect.id}`">            
                <defs v-if="FINAL_CONFIG.style.chart.layout.rects.gradient.show">
                    <radialGradient :id="`tgrad_${rect.id}`" gradientTransform="translate(-1, -1.000001) scale(2, 2)">
                        <stop offset="18%" :stop-color="rect.color"/>
                        <stop offset="100%" :stop-color="lightenHexColor(rect.color, FINAL_CONFIG.style.chart.layout.rects.gradient.intensity / 100)"/>
                    </radialGradient>
                </defs>
            </g>

            <g v-for="(rect, i) in squarified" :key="`k_${rect.id}`">
                <rect
                    data-cy="datapoint-rect"
                    :x="rect.x0" 
                    :y="rect.y0" 
                    :height="getHeight(rect)" 
                    :width="getWidth(rect)" 
                    :fill="isSafari ? rect.color : FINAL_CONFIG.style.chart.layout.rects.gradient.show ? `url(#tgrad_${rect.id})` : rect.color"
                    :rx="FINAL_CONFIG.style.chart.layout.rects.borderRadius"
                    :stroke="selectedRect && selectedRect.id === rect.id ? FINAL_CONFIG.style.chart.layout.rects.selected.stroke : FINAL_CONFIG.style.chart.layout.rects.stroke"
                    :stroke-width="selectedRect && selectedRect.id === rect.id ? FINAL_CONFIG.style.chart.layout.rects.selected.strokeWidth : FINAL_CONFIG.style.chart.layout.rects.strokeWidth"
                    @click.stop="zoom(rect, i)"
                    @mouseenter="() => useTooltip({
                        datapoint: rect,
                        seriesIndex: i,
                    })"
                    @mouseleave="onTrapLeave({ datapoint: rect, seriesIndex: i})"
                    :style="`opacity:${selectedRect ? selectedRect.id === rect.id ? 1 : FINAL_CONFIG.style.chart.layout.rects.selected.unselectedOpacity : 1}`"
                    :class="[
                        'vue-ui-treemap-rect',
                        canDrill(rect)
                        ? 'vue-data-ui-zoom-plus'
                        : (isZoom ? 'vue-data-ui-zoom-minus' : '')
                    ]"
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
                            v-if="!loading"
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

        <div :id="`legend-bottom-${uid}`" />

        <!-- LEGEND -->
        <Teleport v-if="readyTeleport" :to="FINAL_CONFIG.style.chart.legend.position === 'top' ? `#legend-top-${uid}` : `#legend-bottom-${uid}`">
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
                        <div :data-cy="`legend-item-${index}`" @click="segregate(legend)" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`" v-if="!loading">
                            {{ legend.name }}{{ FINAL_CONFIG.style.chart.legend.showPercentage || FINAL_CONFIG.style.chart.legend.showValue ? ':' : ''}} {{ !FINAL_CONFIG.style.chart.legend.showValue ? '' : applyDataLabel(
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
                            {{ 
                                !FINAL_CONFIG.style.chart.legend.showPercentage ? '' :
                                !segregated.includes(legend.id)
                                    ? `${FINAL_CONFIG.style.chart.legend.showValue ? '(' : ''}${isNaN(legend.value / total) ? '-' : (legend.value / total * 100).toFixed(FINAL_CONFIG.style.chart.legend.roundingPercentage)}%${FINAL_CONFIG.style.chart.legend.showValue ? ')' : ''}`
                                    : `${FINAL_CONFIG.style.chart.legend.showValue ? '(' : ''}- %${FINAL_CONFIG.style.chart.legend.showValue ? ')' : ''}`
                            }}
                        </div>
                    </template>
                </Legend>
                <slot v-else name="legend" v-bind:legend="legendSet" />
            </div>
        </Teleport>

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
            :smooth="FINAL_CONFIG.style.chart.tooltip.smooth"
            :backdropFilter="FINAL_CONFIG.style.chart.tooltip.backdropFilter"
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

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading" />
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

.loading .vue-ui-treemap-rect {
    transition: none;
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

.vue-ui-treemap-breadcrumbs {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding: 0.5rem 1rem;
    gap: 0.5rem;
    scrollbar-width: none;
}
.vue-ui-treemap-breadcrumbs::-webkit-scrollbar {
    display: none;
}

.vue-ui-treemap-crumb {
    flex-shrink: 1;
    min-width: 40px; 
    cursor: pointer;
}

.vue-ui-treemap-crumb-unit-label {
    flex-shrink: 1;
    min-width: 0; 
    white-space: nowrap; 
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
}

.vue-ui-treemap-crumb-unit-arrow {
    min-width: 12px;
}

.vue-ui-treemap-crumb[data-last-crumb="true"] {
    pointer-events: none;
    cursor: default;
    font-weight: bold;
}

.vue-ui-treemap-crumb:hover .vue-ui-treemap-crumb-unit-label {
    text-decoration: underline;
}

.vue-ui-treemap-crumb-unit {
    display: flex;
    flex-direction: row;
    align-items:center;
    gap: 3px;
}
</style>