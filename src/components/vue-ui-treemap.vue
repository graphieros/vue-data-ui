<script setup>
import { 
    computed, 
    defineAsyncComponent, 
    nextTick, 
    onBeforeUnmount, 
    onMounted, 
    ref, 
    shallowRef, 
    toRefs,
    useSlots, 
    watch, 
} from 'vue';
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
    escapeXml,
    escapeXmlAttr,
    functionReturnsString,
    isFunction,
    lightenHexColor,
    objectIsEmpty,
    palette,
    themePalettes,
    treeShake,
    XMLNS
} from '../lib';
import {
    generateTreemap,
} from '../treemap';
import { throttle } from '../canvas-lib';
import { useConfig } from '../useConfig';
import { useLoading } from '../useLoading';
import { usePrinter } from '../usePrinter';
import { useNestedProp } from "../useNestedProp";
import { useResponsive } from '../useResponsive';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import img from '../img';
import Title from "../atoms/Title.vue";
import themes from "../themes.json";
import Legend from "../atoms/Legend.vue";
import BaseIcon from '../atoms/BaseIcon.vue';
import BaseScanner from '../atoms/BaseScanner.vue';
import { useSvgExport } from '../useSvgExport';

const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));

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
const tableUnit = ref(null);
const userOptionsRef = ref(null);

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

function pxToSvgY(px) {
    const chartEl = treemapChart.value;
    const totalHeight = chartDimensions.value.height;
    if (!chartEl || !totalHeight) return px;
        const chartRect = chartEl.getBoundingClientRect();
        return px * (totalHeight / chartRect.height);
    }

function getBreadcrumbOffsetSvg() {
    if (!breadcrumbsNav.value || breadcrumbs.value.length <= 1) return 0;

    const nav = breadcrumbsNav.value;
    const cs = getComputedStyle(nav);

    const px =
        nav.offsetHeight +
        parseFloat(cs.marginTop || '0') +
        parseFloat(cs.marginBottom || '0') +
        parseFloat(cs.paddingTop || '0') +
        parseFloat(cs.paddingBottom || '0');

    return pxToSvgY(px);
}

const svg = computed(() => {
    const padding = FINAL_CONFIG.value.style.chart.padding;
    const totalWidth  = chartDimensions.value.width;
    const totalHeight = chartDimensions.value.height;

    const offsetY = getBreadcrumbOffsetSvg();

    const left   = padding.left;
    const right  = totalWidth - padding.right;
    const top    = padding.top;
    const bottom = totalHeight - padding.bottom - offsetY;

    return {
        left,
        top,
        right,
        bottom,
        width:  right - left,
        height: Math.max(0, bottom - top),
        vbWidth:  totalWidth,
        vbHeight: totalHeight - offsetY,

        offsetY,
    };
});


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
    const levelTotal = orderedDataset.value
        .map(el => Number(el.value) || 0)
        .reduce((a, b) => a + b, 0) || 1;

    return generateTreemap(
        orderedDataset.value.map(el => {
        const parentChildrenTotal = el.children
            ? el.children.reduce((acc, c) => acc + (Number(c.value) || 0), 0)
            : el.value;

        return {
            value: el.value,
            id: el.id || createUid(),
            proportion: (Number(el.value) || 0) / levelTotal,
            children: el.children
            ? mapChildren(
                el.children.sort((a, b) => (b.value || 0) - (a.value || 0)),
                el.color,
                el.name,
                parentChildrenTotal || 1
                )
            : undefined,
            color: el.color,
            name: el.name,
        };
        }),
        {
            x0: svg.value.left,
            y0: svg.value.top,
            x1: svg.value.left + svg.value.width,
            y1: svg.value.top + svg.value.height,
        }
    );
});


function getHeight({ y0, y1 }) {
    return y1 - y0 <= 0 ? 0.0001 : y1 - y0;
}

function getWidth({ x0, x1 }) {
    return x1 - x0 <= 0 ? 0.0001 : x1 - x0;
}

function calcFontSize(rect) {
    const cfg = FINAL_CONFIG.value.style.chart.layout.labels;

    console.log(cfg)

    const base = cfg.fontSize;
    const minFs = cfg.minFontSize;
    const maxFs = cfg.fontSize * 2;

    const scalePower = 0.5;
    const baseScaleLow  = 0.6 ;
    const baseScaleHigh = 1;
    const maxOfMinDim = 0.9;

    let p = rect.proportion;
    if (!(typeof p === 'number' && isFinite(p))) {
        const area = Math.max(1e-6, getWidth(rect) * getHeight(rect));
        const full = Math.max(1e-6, svg.value.width * svg.value.height);
        p = area / full;
    }

    const areaScaled = Math.pow(Math.min(1, Math.max(0, p)), scalePower);
    const mult = baseScaleLow + (baseScaleHigh - baseScaleLow) * areaScaled;
    let fontSize = base * mult;
    const minDim = Math.max(0.0001, Math.min(getWidth(rect), getHeight(rect)));
    fontSize = Math.min(fontSize, minDim * maxOfMinDim);
    fontSize = Math.max(minFs, Math.min(maxFs, fontSize));

    return fontSize;
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
            const proportion = el.value / immutableDataset.value.map(m => m.value).reduce((a, b) => a + b, 0)
            return {
                ...el,
                proportion,
                opacity: segregated.value.includes(el.id) ? 0.5 : 1,
                display: `${el.name}${FINAL_CONFIG.value.style.chart.legend.showPercentage || FINAL_CONFIG.value.style.chart.legend.showValue ? ': ' : ''}${!FINAL_CONFIG.value.style.chart.legend.showValue ? '' : applyDataLabel(
                    FINAL_CONFIG.value.style.chart.layout.labels.formatter,
                    el.value,
                    dataLabel({
                        p: FINAL_CONFIG.value.style.chart.layout.labels.prefix, 
                        v: el.value, 
                        s: FINAL_CONFIG.value.style.chart.layout.labels.suffix, 
                        r: FINAL_CONFIG.value.style.chart.legend.roundingValue
                    }),
                    { datapoint: el }
                )}${!FINAL_CONFIG.value.style.chart.legend.showPercentage ? '' : !segregated.value.includes(el.id) ? `${FINAL_CONFIG.value.style.chart.legend.showValue ? ' (' : ''}${isNaN(el.value / total.value) ? '-' : (el.value / total.value * 100).toFixed(FINAL_CONFIG.value.style.chart.legend.roundingPercentage)}%${FINAL_CONFIG.value.style.chart.legend.showValue ? ')' : ''}` : `${FINAL_CONFIG.value.style.chart.legend.showValue ? ' (' : ''}- %${FINAL_CONFIG.value.style.chart.legend.showValue ? ')' : ''}`}`
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

const tableComponent = computed(() => {
    const useDialog = FINAL_CONFIG.value.table.useDialog && !FINAL_CONFIG.value.table.show;
    const open = mutableConfig.value.showTable;
    return {
        component: useDialog ? BaseDraggableDialog : Accordion,
        title: `${FINAL_CONFIG.value.style.chart.title.text}${FINAL_CONFIG.value.style.chart.title.subtitle.text ? `: ${FINAL_CONFIG.value.style.chart.title.subtitle.text}` : ''}`,
        props: useDialog ? {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            headerColor: FINAL_CONFIG.value.table.th.color,
            headerBg: FINAL_CONFIG.value.table.th.backgroundColor,
            isFullscreen: isFullscreen.value,
            fullscreenParent: treemapChart.value,
            forcedWidth: Math.min(800, window.innerWidth * 0.8)
        } : {
            hideDetails: true,
            config: {
                open,
                maxHeight: 10000,
                body: {
                    backgroundColor: FINAL_CONFIG.value.style.chart.backgroundColor,
                    color: FINAL_CONFIG.value.style.chart.color
                },
                head: {
                    backgroundColor: FINAL_CONFIG.value.style.chart.backgroundColor,
                    color: FINAL_CONFIG.value.style.chart.color
                }
            }
        }
    }
});

watch(() => mutableConfig.value.showTable, v => {
    if (FINAL_CONFIG.value.table.show) return;
    if (v && FINAL_CONFIG.value.table.useDialog && tableUnit.value) {
        tableUnit.value.open()
    } else {
        if ('close' in tableUnit.value) {
            tableUnit.value.close()
        }
    }
});

function closeTable() {
    mutableConfig.value.showTable = false;
    if (userOptionsRef.value) {
        userOptionsRef.value.setTableIconState(false);
    }
}

const svgLegendItems = computed(() => {
    return legendSet.value.map(l => ({
        ...l,
        name: l.display
    }));
});

const svgBg = computed(() => FINAL_CONFIG.value.style.chart.backgroundColor);
const svgLegend = computed(() => FINAL_CONFIG.value.style.chart.legend);
const svgTitle = computed(() => FINAL_CONFIG.value.style.chart.title);

const { exportSvg, getSvg } = useSvgExport({
    svg: svgRef,
    title: svgTitle,
    legend: svgLegend,
    legendItems: svgLegendItems,
    backgroundColor: svgBg
});

async function generateSvg({ isCb }) {
    if (isCb) {
        const { blob, url, text, dataUrl } = await getSvg();
        FINAL_CONFIG.value.userOptions.callbacks.svg({ blob, url, text, dataUrl })

    } else {
        exportSvg();
    }
}

function buildTreemapText({ rect, seriesIndex }) {
    const showName = FINAL_CONFIG.value.style.chart.layout.labels.name.show;
    const showValue = FINAL_CONFIG.value.style.chart.layout.labels.value.show;

    if (!showName && !showValue) return '';

    const padding = Math.max(2, calcFontSize(rect) / 3);
    const fontSize = Math.max(8, calcFontSize(rect));
    const lineHeight = fontSize * 1.2;
    const rectW = Math.max(0, getWidth(rect) - padding * 2);
    const rectH = Math.max(0, getHeight(rect) - padding * 2);

    if (rectW <= 2 || rectH <= fontSize * 0.8) return '';

    const fontFamily = FINAL_CONFIG.value.style.fontFamily;
    const fontWeightTitle = FINAL_CONFIG.value.style.chart.layout.labels.name.bold ? '600' : '400';
    const fontWeightValue = FINAL_CONFIG.value.style.chart.layout.labels.value.bold ? '600' : '400';
    const fill = adaptColorToBackground(rect.color);

    const nameText = showName ? String(rect.name ?? '') : '';
    const valueText = showValue
        ? applyDataLabel(
            FINAL_CONFIG.value.style.chart.layout.labels.formatter,
            rect.value,
            dataLabel({
                p: FINAL_CONFIG.value.style.chart.layout.labels.prefix,
                v: rect.value,
                s: FINAL_CONFIG.value.style.chart.layout.labels.suffix,
                r: FINAL_CONFIG.value.style.chart.layout.labels.rounding
            }),
            { datapoint: rect, seriesIndex }
        )
        : '';

    function measure(text, size = fontSize, weight = '400') {
        const svg = document.createElementNS(XMLNS, 'svg');
        svg.setAttribute('width', '0');
        svg.setAttribute('height', '0');
        svg.style.position = 'absolute';
        svg.style.visibility = 'hidden';
        svg.style.pointerEvents = 'none';

        const t = document.createElementNS(XMLNS, 'text');
        t.setAttribute('font-size', String(size));
        t.setAttribute('font-family', fontFamily);
        t.setAttribute('font-weight', String(weight));
        t.textContent = text || '';

        svg.appendChild(t);
        document.body.appendChild(svg);
        const w = t.getComputedTextLength();
        document.body.removeChild(svg);
        return w;
    }

    function wrapLines(text, maxWidth, size, weight, maxLines, addEllipsis) {
        const words = String(text).split(/\s+/).filter(Boolean);
        const lines = [];
        let cur = '';

        function fits(s) {
            return measure(s, size, weight) <= maxWidth;
        }

        function breakLongWord(word) {
            if (fits(word)) return [word];
            const chunks = [];
            let left = 0;
            while (left < word.length) {
                let lo = 1, hi = word.length - left, best = 1;
                while (lo <= hi) {
                    const mid = (lo + hi) >> 1;
                    const slice = word.slice(left, left + mid);
                    if (fits(slice)) {
                        best = mid;
                        lo = mid + 1;
                    } else {
                        hi = mid - 1;
                    }
                }
                chunks.push(word.slice(left, left + best));
                left += best;
            }
            return chunks;
        }

        const tokens = words.flatMap(w => breakLongWord(w));
        for (const tok of tokens) {
            const test = cur ? cur + ' ' + tok : tok;
            if (fits(test)) {
                cur = test;
            } else {
                if (cur) lines.push(cur);
                cur = tok;
                if (lines.length === maxLines - 1) break;
            }
        }
        if (cur && lines.length < maxLines) lines.push(cur);

        if (addEllipsis && lines.length === maxLines) {
            const last = lines[lines.length - 1];
            if (!fits(last)) {
                let s = last;
                while (s.length && !fits(s)) s = s.slice(0, -1);
                lines[lines.length - 1] = s;
            }
            let ell = lines[lines.length - 1] + '…';
            if (!fits(ell)) {
                let base = lines[lines.length - 1];
                while (base.length && !fits(base + '…')) base = base.slice(0, -1);
                ell = base + '…';
            }
            lines[lines.length - 1] = ell;
        }

        return lines;
    }

    // Reserve a line for value ONLY if value is shown
    const reserveForValue = showValue ? 1 : 0;
    const maxTitleLines = Math.max(0, Math.floor(rectH / lineHeight) - reserveForValue);

    if (maxTitleLines <= 0) {
        // No room for title lines; optionally show only the value
        if (!showValue) return '';
        const x = rect.x0 + padding;
        const y = rect.y0 + padding + fontSize; // baseline
        const safeVal = escapeXml(valueText);
        const valueFits = measure(safeVal, fontSize, fontWeightValue) <= rectW;
        if (!valueFits) return '';
        return `
        <text 
            x="${x}" 
            y="${y}" 
            font-size="${fontSize}" 
            font-family="${escapeXmlAttr(fontFamily)}" 
            font-weight="${fontWeightValue}" 
            fill="${escapeXmlAttr(fill)}"
        >
            ${safeVal}
        </text>`;
    }

    const titleLines = showName
        ? wrapLines(nameText, rectW, fontSize, fontWeightTitle, maxTitleLines, true)
        : [];

    let valueSize = fontSize;
    let valueStr = String(valueText);

    if (showValue) {
        while (measure(valueStr, valueSize, fontWeightValue) > rectW && valueSize > Math.max(8, fontSize * 0.75)) {
            valueSize -= 1;
        }
        if (measure(valueStr, valueSize, fontWeightValue) > rectW) {
            while (valueStr.length && measure(valueStr + '…', valueSize, fontWeightValue) > rectW) {
                valueStr = valueStr.slice(0, -1);
            }
            valueStr += '…';
            if (!valueStr.length) return '';
        }
    }

    const usedH = titleLines.length * lineHeight + (showValue ? lineHeight : 0);
    if (usedH > rectH) {
        while (titleLines.length && (titleLines.length * lineHeight + (showValue ? lineHeight : 0)) > rectH) {
            titleLines.pop();
        }
        if (!titleLines.length && (!showValue || lineHeight > rectH)) return '';
    }

    const x = rect.x0 + padding;
    const y = rect.y0 + padding + fontSize;

    const tspans = [];

    if (showName) {
        titleLines.forEach((line, i) => {
            tspans.push(`
            <tspan 
                x="${x}" 
                dy="${i === 0 ? 0 : lineHeight}" 
                font-weight="${fontWeightTitle}"
            >
                ${escapeXml(line)}
            </tspan>`
            );
        });
    }

    if (showValue) {
        tspans.push(`
        <tspan 
            x="${x}" 
            dy="${titleLines.length ? lineHeight : 0}"
            font-weight="${fontWeightValue}" 
            font-size="${valueSize}"
        >
            ${escapeXml(valueStr)}
        </tspan>`
        );
    }

    return `<text 
        x="${x}" 
        y="${y}" 
        font-size="${fontSize}" 
        font-family="${escapeXmlAttr(fontFamily)}" 
        fill="${escapeXmlAttr(fill)}" 
        paint-order="stroke" 
        stroke="transparent" 
        stroke-width="0"
        style="transition: all 0.2s ease-in-out;"
    >
        ${tspans.join('')}
    </text>`;
}

function getSafeRadius(rect) {
    const r = FINAL_CONFIG.value.style.chart.layout.rects.borderRadius;
    const w = getWidth(rect);
    const h = getHeight(rect);
    return Math.min(r, Math.min(w, h) / 6);
}

defineExpose({
    getData,
    getImage,
    generateCsv,
    generateImage,
    generateSvg,
    generatePdf,
    toggleTable,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen
})

</script>

<template>
    <div ref="treemapChart"
        :class="`vue-data-ui-component vue-ui-treemap ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`"
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
            ref="userOptionsRef"
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
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
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
            :tableDialog="FINAL_CONFIG.table.useDialog"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @generateSvg="generateSvg"
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
                    :rx="getSafeRadius(rect)"
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

                <!-- DEFAULT DATALABELS-->
                <g 
                    style="pointer-events: none" 
                    v-if="!$slots.rect && !loading && FINAL_CONFIG.style.chart.layout.labels.showDefaultLabels" 
                    v-html="buildTreemapText({ rect, seriesIndex: i })" 
                />

                <!-- SLOTTED CONTENT -->
                <foreignObject
                    :x="rect.x0" 
                    :y="rect.y0" 
                    :height="getHeight(rect)" 
                    :width="getWidth(rect)"
                    class="vue-ui-treemap-cell-foreignObject"
                >
                    <div 
                        :style="{
                            width: `calc(100% - ${calcFontSize(rect) / 1.5}px)`,
                            height: `calc(100% - ${calcFontSize(rect) / 1.5}px)`,
                            padding: `${calcFontSize(rect) / 3}px`,
                        }"
                        class="vue-ui-treemap-cell"
                    >
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
                            {{ legend.display }}
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
            :smoothForce="FINAL_CONFIG.style.chart.tooltip.smoothForce"
            :smoothSnapThreshold="FINAL_CONFIG.style.chart.tooltip.smoothSnapThreshold"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>

        <component
            v-if="isDataset && FINAL_CONFIG.userOptions.buttons.table"
            :is="tableComponent.component"
            v-bind="tableComponent.props"
            ref="tableUnit"
            @close="closeTable"
        >
            <template #title v-if="FINAL_CONFIG.table.useDialog">
                {{ tableComponent.title }}
            </template>
            <template #actions v-if="FINAL_CONFIG.table.useDialog">
                <button tabindex="0" class="vue-ui-user-options-button" @click="generateCsv(FINAL_CONFIG.userOptions.callbacks.csv)">
                    <BaseIcon name="excel" :stroke="tableComponent.props.color"/>
                </button>
            </template>
            <template #content>
                <DataTable
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="FINAL_CONFIG.table.useDialog ? '' : tableComponent.title"
                    :withCloseButton="!FINAL_CONFIG.table.useDialog"
                    @close="closeTable"
                >
                    <template #th="{ th }">
                        <div v-html="th" style="display:flex;align-items:center"></div>
                    </template>
                    <template #td="{ td }">
                        {{ td.name || td }}
                    </template>
                </DataTable>
            </template>
        </component>

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
    padding: 3px;
}

.vue-ui-treemap-cell {
    height: 100%;
    width: 100%;
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