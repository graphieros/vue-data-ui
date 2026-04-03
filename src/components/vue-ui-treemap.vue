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
    deepClone,
    downloadCsv,
    error,
    escapeHtml,
    functionReturnsString,
    isFunction,
    lightenHexColor,
    objectIsEmpty,
    palette,
    themePalettes,
    treeShake,
    XMLNS,
} from '../lib';
import { generateTreemap } from '../treemap';
import { throttle } from '../canvas-lib';
import { useConfig } from '../useConfig';
import { useLoading } from '../useLoading';
import { usePrinter } from '../usePrinter';
import { useSvgExport } from '../useSvgExport';
import { useNestedProp } from '../useNestedProp';
import { useResponsive } from '../useResponsive';
import { useThemeCheck } from '../useThemeCheck';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import img from '../img';
import Title from '../atoms/Title.vue';
import themes from '../themes/vue_ui_treemap.json';
import Legend from '../atoms/Legend.vue';
import BaseIcon from '../atoms/BaseIcon.vue';
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import BaseLegendToggle from '../atoms/BaseLegendToggle.vue';

const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(
    () => import('../atoms/PenAndPaper.vue'),
);
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const UserOptions = defineAsyncComponent(
    () => import('../atoms/UserOptions.vue'),
);
const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);
const BaseDraggableDialog = defineAsyncComponent(
    () => import('../atoms/BaseDraggableDialog.vue'),
);

const { vue_ui_treemap: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        },
    },
    dataset: {
        type: Array,
        default() {
            return [];
        },
    },
});

const emit = defineEmits(['selectLegend', 'selectDatapoint', 'copyAlt']);
const slots = useSlots();

onMounted(() => {
    if (slots['chart-background']) {
        console.warn(
            'VueUiTreemap does not support the #chart-background slot.',
        );
    }
});

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

const isSafari = computed(() => {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
});

const uid = ref(createUid());
const isTooltip = ref(false);
const tooltipContent = ref('');
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
const rootLayout = ref(null);
const rootTextCache = ref(new Map());
const isCallbackImaging = ref(false);
const isCallbackSvg = ref(false);

const activeTooltipIndex = ref(null); // a11y
const tooltipA11yPosition = ref({ x: 0, y: 0 }); // a11y
const tooltipTriggerMode = ref('pointer'); // a11y
const isFocus = ref(false); // a11y

const FINAL_CONFIG = ref(prepareConfig());

const isCursorPointer = computed(
    () => FINAL_CONFIG.value.userOptions.useCursorPointer,
);

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            userOptions: { show: false },
            style: {
                chart: {
                    backgroundColor: '#999999',
                    layout: {
                        labels: {
                            showDefaultLabels: false,
                        },
                        rects: {
                            stroke: '#6A6A6A',
                        },
                    },
                    legend: {
                        backgroundColor: 'transparent',
                    },
                },
            },
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {},
    });
});

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: props.config?.skeletonDataset ?? [
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
            ],
        },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value,
    }),
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } =
    useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({
    config: FINAL_CONFIG.value.style.chart.title,
});

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG,
    });

    const theme = mergedConfig.theme;
    if (!theme) return mergedConfig;

    if (!isThemeValid.value(mergedConfig)) {
        warnInvalidTheme(mergedConfig);
        return mergedConfig;
    }

    const fused = useNestedProp({
        userConfig: themes[theme] || props.config,
        defaultConfig: mergedConfig,
    });

    const finalConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: fused,
    });

    return {
        ...finalConfig,
        customPalette: finalConfig.customPalette.length
            ? finalConfig.customPalette
            : themePalettes[theme] || palette,
    };
}

watch(
    () => props.config,
    (_newCfg) => {
        if (!loading.value) {
            FINAL_CONFIG.value = prepareConfig();
        }
        userOptionsVisible.value =
            !FINAL_CONFIG.value.userOptions.showOnChartHover;
        titleStep.value += 1;
        tableStep.value += 1;
        legendStep.value += 1;

        // Reset mutable config
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        mutableConfig.value.showTooltip =
            FINAL_CONFIG.value.style.chart.tooltip.show;
    },
    { deep: true },
);

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `treemap_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-treemap',
    options: FINAL_CONFIG.value.userOptions.print,
});

const hasOptionsNoTitle = computed(() => {
    return (
        FINAL_CONFIG.value.userOptions.show &&
        !FINAL_CONFIG.value.style.chart.title.text
    );
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show,
});

// v3 - Essential to make shifting between loading config and final config work
watch(
    FINAL_CONFIG,
    () => {
        mutableConfig.value = {
            showTable: FINAL_CONFIG.value.table.show,
            showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show,
        };
    },
    { immediate: true },
);

const chartDimensions = ref({
    height: FINAL_CONFIG.value.style.chart.height,
    width: FINAL_CONFIG.value.style.chart.width,
});

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
    const totalWidth = chartDimensions.value.width;
    const totalHeight = chartDimensions.value.height;

    const offsetY = getBreadcrumbOffsetSvg();

    const left = padding.left;
    const right = totalWidth - padding.right;
    const top = padding.top;
    const bottom = totalHeight - padding.bottom - offsetY;

    return {
        left,
        top,
        right,
        bottom,
        width: right - left,
        height: Math.max(0, bottom - top),
        vbWidth: totalWidth,
        vbHeight: totalHeight - offsetY,

        offsetY,
    };
});

const immutableDataset = ref(deepClone(FINAL_DATASET.value));
const currentSet = ref(immutableDataset.value);
const rootColorMap = shallowRef(new Map());

watch(
    [immutableDataset, () => FINAL_CONFIG.value],
    () => {
        rootLayout.value = null;
        rootTextCache.value = new Map();
    },
    { deep: true },
);

watch(
    () => segregated.value,
    () => {
        rootLayout.value = null;
        rootTextCache.value = new Map();
        syncToZoomLevel();
        legendStep.value += 1;
        tableStep.value += 1;
    },
    { deep: true },
);

watch(
    [() => chartDimensions.value.width, () => chartDimensions.value.height],
    () => {
        rootTextCache.value = new Map();
    },
);

function applyIdsAndTopLevelColors(tree) {
    if (!Array.isArray(tree)) return;

    tree.forEach((node, index) => {
        if (!node.id) node.id = createUid();

        if (node.sourceColor === undefined) {
            node.sourceColor = convertColorToHex(node.color) || null;
        }

        let baseColor =
            node.sourceColor ||
            rootColorMap.value.get(node.id) ||
            customPalette.value[index] ||
            palette[index] ||
            palette[index % palette.length];

        baseColor = convertColorToHex(baseColor);
        rootColorMap.value.set(node.id, baseColor);
        node.color = baseColor;

        propagateColor(node, baseColor);
    });
}

function propagateColor(node, baseColor) {
    if (!Array.isArray(node.children)) return;
    node.children.forEach((child) => {
        if (!child.id) child.id = createUid();
        child.parentId = node.id;
        if (child.sourceColor === undefined) {
            child.sourceColor = convertColorToHex(child.color) || null;
        }
        const childBaseColor = child.sourceColor || baseColor;
        child.color = childBaseColor;
        propagateColor(child, childBaseColor);
    });
}

function getTopAncestorId(id) {
    let node = findNodeById(id);
    while (node?.parentId) {
        node = findNodeById(node.parentId);
    }
    return node?.id ?? null;
}

function syncToZoomLevel() {
    const visibleRoots = immutableDataset.value.filter(
        (node) => !segregated.value.includes(node.id),
    );

    if (!drillStack.value.length) {
        currentSet.value = visibleRoots;
        return;
    }

    const topId = drillStack.value[drillStack.value.length - 1];
    const node = findNodeById(topId);

    if (!node) {
        drillStack.value = [];
        currentSet.value = visibleRoots;
        return;
    }

    const rootId = getTopAncestorId(node.id);
    if (rootId && segregated.value.includes(rootId)) {
        drillStack.value = [];
        currentSet.value = visibleRoots;
        return;
    }

    currentSet.value = [node];
}

watch(
    () => FINAL_DATASET.value,
    () => {
        immutableDataset.value = deepClone(FINAL_DATASET.value);
        applyIdsAndTopLevelColors(immutableDataset.value);
        syncToZoomLevel();
        legendStep.value += 1;
        tableStep.value += 1;
    },
    { deep: true, immediate: true, flush: 'post' },
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
            debug: debug.value,
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
                title: FINAL_CONFIG.value.style.chart.title.text
                    ? chartTitle.value
                    : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show
                    ? chartLegend.value
                    : null,
                source: source.value,
                noTitle: noTitle.value,
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
    return currentSet.value
        .map((ds, i) => {
            return {
                ...ds,
                color:
                    convertColorToHex(ds.color) ||
                    customPalette.value[i] ||
                    palette[i] ||
                    palette[i % palette.length],
            };
        })
        .filter((ds) => !segregated.value.includes(ds.id));
});

const total = computed(() =>
    immutableDataset.value
        .filter((ds) => !segregated.value.includes(ds.id))
        .map((d) => d.value || 0)
        .reduce((a, b) => a + b, 0),
);

const orderedDataset = computed({
    get() {
        let ds = [...datasetCopy.value];
        if (FINAL_CONFIG.value.style.chart.layout.sorted) {
            ds = [...datasetCopy.value].sort((a, b) => b.value - a.value);
        }
        return ds.map((d) => {
            return {
                ...d,
            };
        });
    },
    set(val) {
        return val;
    },
});

function calcRectProportion(rect, totalValue) {
    return rect.value / totalValue;
}

function calcRectOpacity(color, rect, totalValue) {
    const ratio =
        FINAL_CONFIG.value.style.chart.layout.rects.colorRatio -
        calcRectProportion(rect, totalValue);
    return lightenHexColor(color, ratio < 0 ? 0 : ratio);
}

function hasChildren(node) {
    return Array.isArray(node.children) && node.children.length > 0;
}

function sortChildrenForTreemap(children) {
    return [...children].sort((a, b) => {
        const aIsParent = hasChildren(a);
        const bIsParent = hasChildren(b);

        // Parents last, to avoid showing a drillable child in the middle of its siblings
        if (aIsParent !== bIsParent) {
            return aIsParent - bIsParent; // false(0) before true(1)
        }

        const av = Number(a.value) || 0;
        const bv = Number(b.value) || 0;
        return bv - av;
    });
}

function mapChildren(
    children,
    parentBaseColor,
    parentName,
    totalValue,
    rootId,
) {
    const sortedChildren = sortChildrenForTreemap(children);

    return sortedChildren.map((item, index) => {
        const branchColor =
            item.sourceColor ||
            convertColorToHex(item.color) ||
            convertColorToHex(parentBaseColor) ||
            customPalette.value[index] ||
            palette[index] ||
            palette[index % palette.length];

        const renderedColor = item.sourceColor
            ? item.sourceColor
            : calcRectOpacity(branchColor, item, totalValue);

        const proportion = calcRectProportion(item, totalValue);
        const groupRootId = rootId ?? item.parentId ?? item.id;

        const childrenTotal =
            Array.isArray(item.children) && item.children.length
                ? item.children.reduce(
                      (accumulator, child) =>
                          accumulator + (Number(child.value) || 0),
                      0,
                  ) || 1
                : 1;

        return {
            ...item,
            color: renderedColor,
            proportion,
            parentName,
            rootId: groupRootId,
            children:
                Array.isArray(item.children) && item.children.length
                    ? mapChildren(
                          item.children,
                          branchColor,
                          item.name,
                          childrenTotal,
                          groupRootId,
                      )
                    : undefined,
        };
    });
}

function getInnerTreemapBounds(rect) {
    const fontSize = calcFontSize(rect);
    const showLabel = shouldShowNodeLabel(rect);

    const horizontalPadding = fontSize * 0.55;
    const bottomPadding = fontSize * 0.55;

    const titleLineHeight = fontSize * 1.05;
    const valueLineHeight = fontSize * 1.05;
    const headerGap = fontSize * 0.35;

    const reservedHeaderHeight = showLabel
        ? titleLineHeight + valueLineHeight + headerGap
        : fontSize * 0.45;

    const x0 = rect.x0 + horizontalPadding;
    const x1 = rect.x1 - horizontalPadding;
    const y0 = rect.y0 + reservedHeaderHeight;
    const y1 = rect.y1 - bottomPadding;

    if (x1 <= x0 || y1 <= y0) {
        return null;
    }

    return { x0, y0, x1, y1 };
}

function shouldShowNodeLabel(rect) {
    const { height, lineHeight, width } = getTreemapTextBox(rect);
    return height >= lineHeight && width > 6;
}

function buildVisibleTreemapLayout(
    nodes,
    bounds,
    depth = 0,
    visibleParentId = null,
) {
    if (!Array.isArray(nodes) || !nodes.length) return [];

    const levelNodes = nodes.map((node) => {
        const { children, ...rest } = node;
        return {
            ...rest,
        };
    });

    const childrenById = new Map(
        nodes.map((node) => [
            node.id,
            Array.isArray(node.children) ? node.children : [],
        ]),
    );

    const nodeById = new Map(nodes.map((node) => [node.id, node]));

    const levelRects = generateTreemap(levelNodes, bounds);
    const output = [];

    for (const rect of levelRects) {
        const originalChildren = childrenById.get(rect.id) || [];
        const originalNode = nodeById.get(rect.id);

        const nodeRect = {
            ...rect,
            depth,
            parentId: visibleParentId ?? rect.parentId ?? null,
            color: originalNode?.color ?? rect.color ?? null,
            children: originalChildren,
            isVisibleNode: true,
            showLabel: shouldShowNodeLabel(rect),
        };

        output.push(nodeRect);

        if (originalChildren.length) {
            const innerBounds = getInnerTreemapBounds(nodeRect);

            if (innerBounds) {
                output.push(
                    ...buildVisibleTreemapLayout(
                        originalChildren,
                        innerBounds,
                        depth + 1,
                        rect.id,
                    ),
                );
            }
        }
    }

    return output;
}

const squarifiedRaw = computed(() => {
    const source = currentSet.value.length
        ? currentSet.value
        : orderedDataset.value;

    const levelTotal =
        source.map((el) => Number(el.value) || 0).reduce((a, b) => a + b, 0) ||
        1;

    const nodes = source.map((element, index) => {
        const parentChildrenTotal = element.children
            ? element.children.reduce(
                  (accumulator, child) =>
                      accumulator + (Number(child.value) || 0),
                  0,
              )
            : element.value;

        const { children, ...extra } = element;

        const branchColor =
            element.sourceColor ||
            convertColorToHex(element.color) ||
            rootColorMap.value.get(element.id) ||
            customPalette.value[index] ||
            palette[index] ||
            palette[index % palette.length];

        const renderedColor = element.sourceColor
            ? element.sourceColor
            : calcRectOpacity(branchColor, element, levelTotal);

        return {
            ...extra,
            id: element.id || createUid(),
            parentId: element.parentId ?? null,
            name: element.name,
            value: element.value,
            color: renderedColor,
            proportion: (Number(element.value) || 0) / levelTotal,
            children:
                Array.isArray(element.children) && element.children.length
                    ? mapChildren(
                          element.children,
                          branchColor,
                          element.name,
                          parentChildrenTotal || 1,
                      )
                    : undefined,
        };
    });

    const bounds = {
        x0: svg.value.left,
        y0: svg.value.top,
        x1: svg.value.left + svg.value.width,
        y1: svg.value.top + svg.value.height,
    };

    return buildVisibleTreemapLayout(nodes, bounds);
});

const squarified = computed(() => squarifiedRaw.value);

function computeParentWrapping(rects) {
    const visibleRootId = drillStack.value.length
        ? drillStack.value[drillStack.value.length - 1]
        : null;

    const wrapperMap = new Map();
    const ancestorsByLeaf = new Map();
    const descendantsByParent = new Map();
    const depthByParent = new Map();

    for (const rect of rects) {
        let ancestors = getAncestorIds(rect.id);

        if (visibleRootId) {
            const idx = ancestors.indexOf(visibleRootId);
            if (idx >= 0) {
                ancestors = ancestors.slice(idx);
            } else {
                // this rect is outside the visible subtree
                continue;
            }
        }

        ancestors = ancestors.filter((id) => {
            const n = findNodeById(id);
            return n && Array.isArray(n.children) && n.children.length;
        });

        if (!ancestors.length) continue;

        // Build | update wrappers for each ancestor
        ancestors.forEach((ancestorId, depthIndex) => {
            const n = findNodeById(ancestorId);
            if (!n) return;

            let w = wrapperMap.get(ancestorId);
            if (!w) {
                w = {
                    id: ancestorId,
                    name: n.name,
                    value: n.value,
                    color: n.color,
                    x0: rect.x0,
                    y0: rect.y0,
                    x1: rect.x1,
                    y1: rect.y1,
                    depth: depthIndex, // depth from visible root
                };
                wrapperMap.set(ancestorId, w);
            } else {
                w.x0 = Math.min(w.x0, rect.x0);
                w.y0 = Math.min(w.y0, rect.y0);
                w.x1 = Math.max(w.x1, rect.x1);
                w.y1 = Math.max(w.y1, rect.y1);
                w.depth = Math.min(w.depth, depthIndex);
            }

            let set = descendantsByParent.get(ancestorId);
            if (!set) {
                set = new Set();
                descendantsByParent.set(ancestorId, set);
            }
            set.add(rect.id);

            const currentDepth = depthByParent.get(ancestorId);
            if (currentDepth == null || depthIndex < currentDepth) {
                depthByParent.set(ancestorId, depthIndex);
            }
        });

        ancestorsByLeaf.set(rect.id, ancestors);
    }

    const wrappers = Array.from(wrapperMap.values()).map((w) => ({
        ...w,
        depth: depthByParent.get(w.id) ?? w.depth ?? 0,
        childrenIds: Array.from(descendantsByParent.get(w.id) || []),
    }));

    return {
        wrappers,
        ancestorsByLeaf,
    };
}

function getHeight({ y0, y1 }) {
    return y1 - y0 <= 0 ? 0.0001 : y1 - y0;
}

function getWidth({ x0, x1 }) {
    return x1 - x0 <= 0 ? 0.0001 : x1 - x0;
}

function calcFontSize(rect) {
    const cfg = FINAL_CONFIG.value.style.chart.layout.labels;
    const base = cfg.fontSize;
    const minFontSize = cfg.minFontSize;
    const maxFontSize = cfg.fontSize * 2;

    const scalePower = 0.5;
    const baseScaleLow = 0.6;
    const baseScaleHigh = 1;
    const maxOfMinDim = 0.9;

    let proportion = rect.proportion;
    if (!(typeof proportion === 'number' && isFinite(proportion))) {
        const area = Math.max(1e-6, getWidth(rect) * getHeight(rect));
        const full = Math.max(1e-6, svg.value.width * svg.value.height);
        proportion = area / full;
    }

    const areaScaled = Math.pow(
        Math.min(1, Math.max(0, proportion)),
        scalePower,
    );
    const areaMultiplier =
        baseScaleLow + (baseScaleHigh - baseScaleLow) * areaScaled;

    const depth = Math.max(0, Number(rect.depth) || 0);
    const depthFactor = Math.pow(0.9, depth);
    let fontSize = base * areaMultiplier * depthFactor;

    const minDim = Math.max(0.0001, Math.min(getWidth(rect), getHeight(rect)));
    fontSize = Math.min(fontSize, minDim * maxOfMinDim);
    fontSize = Math.min(fontSize, maxFontSize);
    fontSize = Math.max(minFontSize, fontSize);

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
    };
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
}

function getAncestorIds(id) {
    const ancestors = [];
    let node = findNodeById(id);
    while (node && node.parentId) {
        const parent = findNodeById(node.parentId);
        if (!parent) break;
        ancestors.unshift(parent.id);
        node = parent;
    }
    return ancestors;
}

const isZoom = computed(() => drillStack.value.length > 0);

function resetZoom() {
    currentSet.value = immutableDataset.value.slice();
    drillStack.value = [];
    emit('selectDatapoint', undefined);
}

function getCurrentZoomId() {
    return drillStack.value[drillStack.value.length - 1] ?? null;
}

function setZoomTarget(node, rect, seriesIndex) {
    drillStack.value = [...getAncestorIds(node.id), node.id];
    currentSet.value = [node];
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint: rect ?? node,
            seriesIndex,
        });
    }
    emit('selectDatapoint', rect ?? node);
}

function zoomOutOneLevel(rect, seriesIndex) {
    const currentZoomId = getCurrentZoomId();
    if (!currentZoomId) {
        resetZoom();
        return;
    }
    const currentNode = findNodeById(currentZoomId);
    if (!currentNode?.parentId) {
        if (FINAL_CONFIG.value.events.datapointClick) {
            FINAL_CONFIG.value.events.datapointClick({
                datapoint: rect,
                seriesIndex,
            });
        }
        resetZoom();
        return;
    }
    const parentNode = findNodeById(currentNode.parentId);
    if (!parentNode) {
        resetZoom();
        return;
    }
    drillStack.value = [...getAncestorIds(parentNode.id), parentNode.id];
    currentSet.value = [parentNode];
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint: rect,
            seriesIndex,
        });
    }

    emit('selectDatapoint', rect);
}

function zoom(rect, seriesIndex) {
    if (!rect) {
        resetZoom();
        return;
    }
    const node = findNodeById(rect.id);
    if (!node) return;
    const currentZoomId = getCurrentZoomId();
    if (currentZoomId === node.id) {
        zoomOutOneLevel(rect, seriesIndex);
        return;
    }

    setZoomTarget(node, rect, seriesIndex);
}

function isCurrentZoomTarget(rect) {
    if (!rect) return false;
    return getCurrentZoomId() === rect.id;
}

const breadcrumbs = computed(() => {
    const crumbs = [{ id: null, label: 'All' }];

    if (drillStack.value.length > 0) {
        let node = findNodeById(drillStack.value[drillStack.value.length - 1]);
        const path = [];
        while (node) {
            path.unshift(node);
            node = node.parentId ? findNodeById(node.parentId) : null;
        }
        for (const n of path) {
            crumbs.push({
                id: n.id,
                label: n.name,
                node: n,
            });
        }
    }
    return crumbs;
});

const selectedRect = shallowRef(null);

const legendSet = computed(() => {
    return immutableDataset.value
        .map((ds, i) => {
            return {
                ...ds,
                color:
                    convertColorToHex(ds.color) ||
                    customPalette.value[i] ||
                    palette[i] ||
                    palette[i % palette.length],
                shape: 'square',
            };
        })
        .sort((a, b) => b.value - a.value)
        .map((el, _i) => {
            const proportion =
                el.value /
                immutableDataset.value
                    .map((m) => m.value)
                    .reduce((a, b) => a + b, 0);
            return {
                ...el,
                proportion,
                opacity: segregated.value.includes(el.id) ? 0.5 : 1,
                display: `${el.name}${FINAL_CONFIG.value.style.chart.legend.showPercentage || FINAL_CONFIG.value.style.chart.legend.showValue ? ': ' : ''}${
                    !FINAL_CONFIG.value.style.chart.legend.showValue
                        ? ''
                        : applyDataLabel(
                              FINAL_CONFIG.value.style.chart.layout.labels
                                  .formatter,
                              el.value,
                              dataLabel({
                                  p: FINAL_CONFIG.value.style.chart.layout
                                      .labels.prefix,
                                  v: el.value,
                                  s: FINAL_CONFIG.value.style.chart.layout
                                      .labels.suffix,
                                  r: FINAL_CONFIG.value.style.chart.legend
                                      .roundingValue,
                              }),
                              { datapoint: el },
                          )
                }${!FINAL_CONFIG.value.style.chart.legend.showPercentage ? '' : !segregated.value.includes(el.id) ? `${FINAL_CONFIG.value.style.chart.legend.showValue ? ' (' : ''}${isNaN(el.value / total.value) ? '-' : ((el.value / total.value) * 100).toFixed(FINAL_CONFIG.value.style.chart.legend.roundingPercentage)}%${FINAL_CONFIG.value.style.chart.legend.showValue ? ')' : ''}` : `${FINAL_CONFIG.value.style.chart.legend.showValue ? ' (' : ''}- %${FINAL_CONFIG.value.style.chart.legend.showValue ? ')' : ''}`}`,
            };
        });
});

const legendConfig = computed(() => {
    return {
        cy: 'treemap-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : '',
    };
});

const allSegregated = computed(
    () => segregated.value.length === legendSet.value.length,
);

function toggleLegend() {
    if (segregated.value.length) {
        segregated.value = [];
    } else {
        legendSet.value.forEach((l) => {
            segregated.value.push(l.id);
        });
    }
}

function segregate(rect) {
    selectedRect.value = null;
    if (segregated.value.includes(rect.id)) {
        segregated.value = segregated.value.filter((s) => s !== rect.id);
    } else {
        if (segregated.value.length < props.dataset.length - 1) {
            segregated.value.push(rect.id);
        }
    }
    emit('selectLegend', orderedDataset.value);
}

function validSeriesToToggle(name) {
    if (!immutableDataset.value.length) {
        if (FINAL_CONFIG.value.debug) {
            console.warn('VueUiTreemap - There are no series to show.');
        }
        return null;
    }
    const dp = immutableDataset.value.find((d) => d.name === name);
    if (!dp) {
        if (FINAL_CONFIG.value.debug) {
            console.warn(`VueUiTreemap - Series name not found "${name}"`);
        }
        return null;
    }
    return dp;
}

function showSeries(name) {
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (segregated.value.includes(dp.id)) {
        segregate({ id: dp.id });
    }
}

function hideSeries(name) {
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (!segregated.value.includes(dp.id)) {
        segregate({ id: dp.id });
    }
}

function onTrapLeave({ datapoint, seriesIndex }) {
    selectedRect.value = null;
    isTooltip.value = false;
    activeTooltipIndex.value = null;
    tooltipTriggerMode.value = 'pointer';
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex });
    }
}

const dataTooltipSlot = ref(null);

function useTooltip({ datapoint, seriesIndex, triggerMode = 'pointer' }) {
    if (allSegregated.value) return;

    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex });
    }

    activeTooltipIndex.value = seriesIndex;
    tooltipTriggerMode.value = triggerMode;
    selectedRect.value = datapoint;
    dataTooltipSlot.value = {
        datapoint,
        seriesIndex,
        config: FINAL_CONFIG.value,
        series: datasetCopy.value,
    };

    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

    if (
        isFunction(customFormat) &&
        functionReturnsString(() =>
            customFormat({
                seriesIndex,
                datapoint,
                series: datasetCopy.value,
                config: FINAL_CONFIG.value,
            }),
        )
    ) {
        tooltipContent.value = customFormat({
            seriesIndex,
            datapoint,
            series: datasetCopy.value,
            config: FINAL_CONFIG.value,
        });
    } else {
        let html = '';

        html += `<div data-cy="treemap-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor};padding-bottom:6px;margin-bottom:3px;">${datapoint.name}</div>`;

        html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><rect data-cy="treemap-tooltip-marker" x="0" y="0" height="12" width="12" stroke="none" fill="${datapoint.color}"/></svg>`;

        html += `<b data-cy="treemap-tooltip-value">${applyDataLabel(
            FINAL_CONFIG.value.style.chart.layout.labels.formatter,
            datapoint.value,
            dataLabel({
                p: FINAL_CONFIG.value.style.chart.layout.labels.prefix,
                v: datapoint.value,
                s: FINAL_CONFIG.value.style.chart.layout.labels.suffix,
                r: FINAL_CONFIG.value.style.chart.tooltip.roundingValue,
            }),
            { datapoint, seriesIndex },
        )}</b>`;

        tooltipContent.value = `<div>${html}</div>`;
    }
    isTooltip.value = true;
}

const table = computed(() => {
    const head = squarified.value.map((ds) => {
        return {
            name: ds.name,
            color: ds.color,
        };
    });
    const body = squarified.value.map((ds) => ds.value);
    return { head, body };
});

function generateCsv(callback = null) {
    nextTick(() => {
        const labels = table.value.head.map((h, i) => {
            return [
                [h.name],
                [table.value.body[i]],
                [
                    isNaN(table.value.body[i] / total.value)
                        ? '-'
                        : (table.value.body[i] / total.value) * 100,
                ],
            ];
        });
        const tableXls = [
            [FINAL_CONFIG.value.style.chart.title.text],
            [FINAL_CONFIG.value.style.chart.title.subtitle.text],
            [[''], ['val'], ['%']],
        ].concat(labels);

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({
                csvContent,
                title:
                    FINAL_CONFIG.value.style.chart.title.text ||
                    'vue-ui-treemap',
            });
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

    const body = table.value.head.map((h, i) => {
        const label = applyDataLabel(
            FINAL_CONFIG.value.style.chart.layout.labels.formatter,
            table.value.body[i],
            dataLabel({
                p: FINAL_CONFIG.value.style.chart.layout.labels.prefix,
                v: table.value.body[i],
                s: FINAL_CONFIG.value.style.chart.layout.labels.suffix,
                r: FINAL_CONFIG.value.table.td.roundingValue,
            }),
        );
        return [
            {
                color: h.color,
                name: h.name,
                shape: 'square',
            },
            label,
            isNaN(table.value.body[i] / total.value)
                ? '-'
                : dataLabel({
                      v: (table.value.body[i] / total.value) * 100,
                      s: '%',
                      r: FINAL_CONFIG.value.table.td.roundingPercentage,
                  }),
        ];
    });

    const config = {
        th: {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            outline: FINAL_CONFIG.value.table.th.outline,
        },
        td: {
            backgroundColor: FINAL_CONFIG.value.table.td.backgroundColor,
            color: FINAL_CONFIG.value.table.td.color,
            outline: FINAL_CONFIG.value.table.td.outline,
        },
        breakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint,
    };

    const colNames = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
    ];

    return {
        colNames,
        head,
        body,
        config,
    };
});

function getData() {
    return squarified.value;
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

const activeCrumbIndex = ref(null);

function activateHomeIcon(id) {
    activeCrumbIndex.value = id;
}
function deactivateHomeIcon() {
    activeCrumbIndex.value = null;
}

async function getImage({ scale = 2 } = {}) {
    if (!treemapChart.value) return;
    const { width, height } = treemapChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({
        domElement: treemapChart.value,
        base64: true,
        img: true,
        scale,
    });
    return {
        imageUri,
        base64,
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio,
    };
}

const tableComponent = computed(() => {
    const useDialog =
        FINAL_CONFIG.value.table.useDialog && !FINAL_CONFIG.value.table.show;
    const open = mutableConfig.value.showTable;
    return {
        component: useDialog ? BaseDraggableDialog : Accordion,
        title: `${FINAL_CONFIG.value.style.chart.title.text}${FINAL_CONFIG.value.style.chart.title.subtitle.text ? `: ${FINAL_CONFIG.value.style.chart.title.subtitle.text}` : ''}`,
        props: useDialog
            ? {
                  backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
                  color: FINAL_CONFIG.value.table.th.color,
                  headerColor: FINAL_CONFIG.value.table.th.color,
                  headerBg: FINAL_CONFIG.value.table.th.backgroundColor,
                  isFullscreen: isFullscreen.value,
                  fullscreenParent: treemapChart.value,
                  forcedWidth: Math.min(800, window.innerWidth * 0.8),
                  isCursorPointer: isCursorPointer.value,
              }
            : {
                  hideDetails: true,
                  config: {
                      open,
                      maxHeight: 10000,
                      body: {
                          backgroundColor:
                              FINAL_CONFIG.value.style.chart.backgroundColor,
                          color: FINAL_CONFIG.value.style.chart.color,
                      },
                      head: {
                          backgroundColor:
                              FINAL_CONFIG.value.style.chart.backgroundColor,
                          color: FINAL_CONFIG.value.style.chart.color,
                      },
                  },
              },
    };
});

watch(
    () => mutableConfig.value.showTable,
    (v) => {
        if (FINAL_CONFIG.value.table.show) return;
        if (v && FINAL_CONFIG.value.table.useDialog && tableUnit.value) {
            tableUnit.value.open();
        } else {
            if ('close' in tableUnit.value) {
                tableUnit.value.close();
            }
        }
    },
);

function closeTable() {
    mutableConfig.value.showTable = false;
    if (userOptionsRef.value) {
        userOptionsRef.value.setTableIconState(false);
    }
}

const svgLegendItems = computed(() => {
    return legendSet.value.map((l) => ({
        ...l,
        name: l.display,
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
    backgroundColor: svgBg,
});

async function generateSvg({ isCb }) {
    isCallbackSvg.value = true;

    await nextTick();

    try {
        if (isCb) {
            const { blob, url, text, dataUrl } = await getSvg();
            await Promise.resolve(
                FINAL_CONFIG.value.userOptions.callbacks.svg({
                    blob,
                    url,
                    text,
                    dataUrl,
                }),
            );
        } else {
            await Promise.resolve(exportSvg());
        }
    } finally {
        isCallbackSvg.value = false;
    }
}

function onGenerateImage(payload) {
    if (payload?.stage === 'start') {
        isCallbackImaging.value = true;
        return;
    }

    if (payload?.stage === 'end') {
        isCallbackImaging.value = false;
        return;
    }

    generateImage();
}

function getLabelMetrics(rect) {
    const fontSize = calcFontSize(rect);
    const paddingX = Math.max(fontSize * 0.5, 4);
    const paddingTop = Math.max(fontSize * 0.5, 4);
    const lineHeight = fontSize * 1.1;

    return {
        fontSize,
        paddingX,
        paddingTop,
        lineHeight,
    };
}

function getTreemapTextBox(rect) {
    const { paddingX, paddingTop, lineHeight } = getLabelMetrics(rect);

    const x = rect.x0 + paddingX;
    const y = rect.y0 + paddingTop;
    const width = Math.max(getWidth(rect) - paddingX * 2, 0);
    const height = Math.max(getHeight(rect) - paddingTop * 2, 0);

    return {
        x,
        y,
        width,
        height,
        lineHeight,
    };
}

function getLabelTextColor(rect) {
    return adaptColorToBackground(
        rect.color ?? FINAL_CONFIG.value.style.chart.backgroundColor,
    );
}

function getLabelLines(rect, seriesIndex) {
    const { fontSize, lineHeight } = getLabelMetrics(rect);
    const availableWidth = getTreemapLabelAvailableWidth(rect);
    const availableHeight = getTreemapLabelAvailableHeight(rect);

    if (availableWidth <= 0 || availableHeight <= 0) {
        return [];
    }

    const maxLines = Math.max(
        Math.floor(availableHeight / Math.max(lineHeight, 1)),
        1,
    );

    const formattedValue = applyDataLabel(
        FINAL_CONFIG.value.style.chart.layout.labels.formatter,
        rect.value,
        dataLabel({
            p: FINAL_CONFIG.value.style.chart.layout.labels.prefix,
            v: rect.value,
            s: FINAL_CONFIG.value.style.chart.layout.labels.suffix,
            r: FINAL_CONFIG.value.style.chart.tooltip.roundingValue,
        }),
        { datapoint: rect, seriesIndex },
    );

    const lineGapSafety = Math.ceil(fontSize * 0.2);
    const horizontalSafety = Math.ceil(fontSize * 1.4);
    const effectiveWidth = Math.max(
        availableWidth - horizontalSafety - lineGapSafety,
        0,
    );

    if (effectiveWidth <= 0) {
        return [];
    }

    if (Array.isArray(rect.children) && rect.children.length) {
        const line = ellipsizeTreemapText(
            `${rect.name} (${formattedValue})`,
            effectiveWidth,
            fontSize,
            500,
        );

        return line ? [line] : [];
    }

    const lines = [];

    const nameLine = ellipsizeTreemapText(
        `${rect.name}`,
        effectiveWidth,
        fontSize,
        500,
    );

    if (nameLine) {
        lines.push(nameLine);
    }

    if (maxLines >= 2) {
        const valueLine = ellipsizeTreemapText(
            formattedValue,
            effectiveWidth,
            fontSize,
            400,
        );

        if (valueLine) {
            lines.push(valueLine);
        }
    }

    return lines.slice(0, maxLines);
}

function buildTreemapText({ rect, seriesIndex, isTitle }) {
    if (
        !rect ||
        !FINAL_CONFIG.value.style.chart.layout.labels.showDefaultLabels ||
        !shouldShowNodeLabel(rect)
    ) {
        return '';
    }

    const { fontSize } = getLabelMetrics(rect);
    const textColor = getLabelTextColor(rect);
    const lines = getLabelLines(rect, seriesIndex);
    const textBox = getTreemapTextBox(rect);

    if (!lines.length || textBox.width <= 0 || textBox.height <= 0) {
        return '';
    }

    const clipId = `treemap_clip_${uid.value}_${rect.id}_${rect.depth}_${seriesIndex}`;

    const clipX = textBox.x;
    const clipY = textBox.y;
    const clipWidth = Math.max(textBox.width, 0);
    const clipHeight = Math.max(textBox.height, 0);

    const textNodes = lines
        .map((line, index) => {
            const y = textBox.y + textBox.lineHeight * index;

            return `
                <text
                    x="${textBox.x}"
                    y="${y}"
                    fill="${textColor}"
                    font-size="${fontSize}"
                    font-family="${FINAL_CONFIG.value.style.fontFamily}"
                    font-weight="${index === 0 ? 500 : 400}"
                    text-anchor="start"
                    dominant-baseline="text-before-edge"
                >
                    ${escapeHtml(line)}
                </text>
            `;
        })
        .join('');

    return `
        <g>
            <defs>
                <clipPath id="${clipId}" clipPathUnits="userSpaceOnUse">
                    <rect
                        x="${clipX}"
                        y="${clipY}"
                        width="${clipWidth}"
                        height="${clipHeight}"
                    />
                </clipPath>
            </defs>
            <g clip-path="url(#${clipId})">
                ${textNodes}
            </g>
        </g>
    `;
}

let treemapMeasureCanvas;

function getTreemapMeasureContext() {
    if (!treemapMeasureCanvas) {
        treemapMeasureCanvas = document.createElement('canvas');
    }

    return treemapMeasureCanvas.getContext('2d');
}

function measureTreemapTextWidth(text, fontSize, fontWeight = 400) {
    const context = getTreemapMeasureContext();

    if (!context) {
        return text.length * fontSize * 0.6;
    }

    context.font = `${fontWeight} ${fontSize}px ${FINAL_CONFIG.value.style.fontFamily}`;
    return context.measureText(String(text)).width;
}

function ellipsizeTreemapText(text, maxWidth, fontSize, fontWeight = 400) {
    const raw = String(text ?? '');

    if (!raw.length || maxWidth <= 0) {
        return '';
    }

    if (measureTreemapTextWidth(raw, fontSize, fontWeight) <= maxWidth) {
        return raw;
    }

    const ellipsis = '…';
    const ellipsisWidth = measureTreemapTextWidth(
        ellipsis,
        fontSize,
        fontWeight,
    );

    if (ellipsisWidth > maxWidth) {
        return '';
    }

    let start = 0;
    let end = raw.length;
    let best = '';

    while (start <= end) {
        const middle = Math.floor((start + end) / 2);
        const candidate = `${raw.slice(0, middle)}${ellipsis}`;
        const candidateWidth = measureTreemapTextWidth(
            candidate,
            fontSize,
            fontWeight,
        );

        if (candidateWidth <= maxWidth) {
            best = candidate;
            start = middle + 1;
        } else {
            end = middle - 1;
        }
    }

    return best || ellipsis;
}

function getTreemapLabelAvailableWidth(rect) {
    return getTreemapTextBox(rect).width;
}

function getTreemapLabelAvailableHeight(rect) {
    return getTreemapTextBox(rect).height;
}

function getSafeRadius(rect) {
    const r = FINAL_CONFIG.value.style.chart.layout.rects.borderRadius;
    const w = getWidth(rect);
    const h = getHeight(rect);
    return Math.min(r, Math.min(w, h) / 6);
}

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: squarified.value,
    });
    if (!FINAL_CONFIG.value.userOptions.callbacks.altCopy) {
        console.warn(
            'Vue Data UI - A callback must be set for `altCopy` in userOptions.',
        );
        return;
    }
    await Promise.resolve(
        FINAL_CONFIG.value.userOptions.callbacks.altCopy({
            config: FINAL_CONFIG.value,
            dataset: squarified.value,
        }),
    );
}

/***************************************************************************************************
 * a11y
 **************************************************************************************************/
function onSvgFocus() {
    activeTooltipIndex.value = null;
    isFocus.value = true;
}

function onSvgBlur() {
    activeTooltipIndex.value = null;
    tooltipTriggerMode.value = 'pointer';
    isTooltip.value = false;
    selectedRect.value = null;
    isFocus.value = false;
}

function onSvgKeydown(event) {
    if (!svgRef.value || isAnnotator.value) return;
    if (document.activeElement !== svgRef.value) return;
    if (!squarified.value.length) return;
    if (allSegregated.value) return;

    const isPreviousKey = ['ArrowLeft', 'ArrowUp'].includes(event.key);
    const isNextKey = ['ArrowRight', 'ArrowDown'].includes(event.key);
    const isActivationKey = event.key === 'Enter' || event.key === ' ';
    const isEscapeKey = event.key === 'Escape';

    if (!isPreviousKey && !isNextKey && !isActivationKey && !isEscapeKey)
        return;

    event.preventDefault();
    event.stopPropagation();

    if (isEscapeKey) {
        activeTooltipIndex.value = null;
        tooltipTriggerMode.value = 'pointer';
        isTooltip.value = false;
        selectedRect.value = null;
        return;
    }

    if (isActivationKey) {
        if (activeTooltipIndex.value === null) return;

        const rect = squarified.value[activeTooltipIndex.value];
        if (!rect) return;

        zoom(rect, activeTooltipIndex.value);
        return;
    }

    let nextIndex = activeTooltipIndex.value;

    const hoveredVisibleIndex = selectedRect.value
        ? squarified.value.findIndex(
              (rect) => rect.id === selectedRect.value.id,
          )
        : null;

    const hasValidActiveIndex =
        nextIndex !== null &&
        nextIndex >= 0 &&
        nextIndex < squarified.value.length;

    const hasValidHoveredIndex =
        hoveredVisibleIndex !== null &&
        hoveredVisibleIndex >= 0 &&
        hoveredVisibleIndex < squarified.value.length;

    if (!hasValidActiveIndex) {
        if (hasValidHoveredIndex) {
            nextIndex = isNextKey
                ? hoveredVisibleIndex + 1
                : hoveredVisibleIndex - 1;

            if (nextIndex >= squarified.value.length) {
                nextIndex = 0;
            }

            if (nextIndex < 0) {
                nextIndex = squarified.value.length - 1;
            }
        } else if (isNextKey) {
            nextIndex = 0;
        } else {
            nextIndex = squarified.value.length - 1;
        }
    } else if (isNextKey) {
        nextIndex += 1;
        if (nextIndex >= squarified.value.length) {
            nextIndex = 0;
        }
    } else if (isPreviousKey) {
        nextIndex -= 1;
        if (nextIndex < 0) {
            nextIndex = squarified.value.length - 1;
        }
    }

    const rect = squarified.value[nextIndex];
    if (!rect) return;

    setKeyboardTooltipPositionFromIndex(nextIndex);
    useTooltip({
        datapoint: rect,
        seriesIndex: nextIndex,
        triggerMode: 'keyboard',
    });
}

function setKeyboardTooltipPositionFromIndex(index) {
    if (!Number.isFinite(index)) return;
    if (!svgRef.value) return;

    const rect = squarified.value[index];
    if (!rect) return;

    const svgX = rect.x0 + getWidth(rect) / 2;
    const svgY = rect.y0 + getHeight(rect) / 2;

    const box = svgRef.value.getBoundingClientRect();

    tooltipA11yPosition.value = {
        x:
            box.left +
            ((svgX - viewBox.value.startX) / viewBox.value.width) * box.width,
        y:
            box.top +
            ((svgY - viewBox.value.startY) / viewBox.value.height) * box.height,
    };
}

const a11yTable = computed(() => {
    const headers = dataTable.value?.colNames ?? [];
    const rows = dataTable.value?.body ?? [];
    return { headers, rows };
});

defineExpose({
    getData,
    getImage,
    generateCsv,
    generateImage,
    generateSvg,
    generatePdf,
    hideSeries,
    showSeries,
    toggleTable,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen,
    copyAlt,
});
</script>

<template>
    <div
        ref="treemapChart"
        :class="`vue-data-ui-component vue-ui-treemap ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; ${FINAL_CONFIG.responsive ? 'height: 100%;' : ''} text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`"
        :id="`treemap_${uid}`"
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <!-- A11Y -->
        <div :id="`chart-instructions-${uid}`" class="sr-only">
            <p>{{ FINAL_CONFIG.a11y.translations.keyboardNavigation }}</p>
        </div>

        <A11yDataTable
            v-if="a11yTable?.rows?.length"
            :uid="uid"
            :head="a11yTable.headers"
            :body="a11yTable.rows"
            :notice="FINAL_CONFIG.a11y.translations.tableAvailable"
            :caption="FINAL_CONFIG.a11y.translations.tableCaption"
        />

        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            :isCursorPointer="isCursorPointer"
            @close="toggleAnnotator"
        >
            <template #annotator-action-close>
                <slot name="annotator-action-close" />
            </template>
            <template #annotator-action-color="{ color }">
                <slot name="annotator-action-color" v-bind="{ color }" />
            </template>
            <template #annotator-action-draw="{ mode }">
                <slot name="annotator-action-draw" v-bind="{ mode }" />
            </template>
            <template #annotator-action-undo="{ disabled }">
                <slot name="annotator-action-undo" v-bind="{ disabled }" />
            </template>
            <template #annotator-action-redo="{ disabled }">
                <slot name="annotator-action-redo" v-bind="{ disabled }" />
            </template>
            <template #annotator-action-delete="{ disabled }">
                <slot name="annotator-action-delete" v-bind="{ disabled }" />
            </template>
        </PenAndPaper>

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle"
            class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <!-- TITLE -->
        <div
            ref="chartTitle"
            v-if="FINAL_CONFIG.style.chart.title.text"
            :style="`width:100%;background:${FINAL_CONFIG.style.chart.backgroundColor};padding-bottom:6px`"
        >
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'treemap-div-title',
                        ...FINAL_CONFIG.style.chart.title,
                    },
                    subtitle: {
                        cy: 'treemap-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle,
                    },
                }"
            />
        </div>

        <div :id="`legend-top-${uid}`" />

        <!-- OPTIONS -->
        <UserOptions
            ref="userOptionsRef"
            :key="`user_option_${step}`"
            v-if="
                FINAL_CONFIG.userOptions.show &&
                isDataset &&
                (keepUserOptionState ? true : userOptionsVisible)
            "
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="
                FINAL_CONFIG.userOptions.buttons.tooltip &&
                FINAL_CONFIG.style.chart.tooltip.show
            "
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :hasAltCopy="FINAL_CONFIG.userOptions.buttons.altCopy"
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
            :isCursorPointer="isCursorPointer"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="onGenerateImage"
            @generateSvg="generateSvg"
            @toggleTable="toggleTable"
            @toggleTooltip="toggleTooltip"
            @toggleAnnotator="toggleAnnotator"
            @copyAlt="copyAlt"
            :style="{
                visibility: keepUserOptionState
                    ? userOptionsVisible
                        ? 'visible'
                        : 'hidden'
                    : 'visible',
            }"
        >
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }" />
            </template>
            <template #optionTooltip v-if="$slots.optionTooltip">
                <slot name="optionTooltip" />
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
            <template #optionSvg v-if="$slots.optionSvg">
                <slot name="optionSvg" />
            </template>
            <template #optionTable v-if="$slots.optionTable">
                <slot name="optionTable" />
            </template>
            <template
                v-if="$slots.optionFullscreen"
                template
                #optionFullscreen="{ toggleFullscreen, isFullscreen }"
            >
                <slot
                    name="optionFullscreen"
                    v-bind="{ toggleFullscreen, isFullscreen }"
                />
            </template>
            <template
                v-if="$slots.optionAnnotator"
                #optionAnnotator="{ toggleAnnotator, isAnnotator }"
            >
                <slot
                    name="optionAnnotator"
                    v-bind="{ toggleAnnotator, isAnnotator }"
                />
            </template>
            <template
                v-if="$slots.optionAltCopy"
                #optionAltCopy="{ altCopy: c }"
            >
                <slot name="optionAltCopy" v-bind="{ altCopy: c }" />
            </template>
        </UserOptions>

        <nav
            class="vue-ui-treemap-breadcrumbs"
            v-if="breadcrumbs.length > 1"
            data-dom-to-png-ignore
            ref="breadcrumbsNav"
        >
            <span
                v-for="(crumb, i) in breadcrumbs"
                role="button"
                :tabindex="i < breadcrumbs.length - 1 ? 0 : undefined"
                :key="crumb.id || 'root'"
                @click="
                    i === breadcrumbs.length - 1 ? () => {} : zoom(crumb.node)
                "
                @keydown.enter.prevent="
                    i === breadcrumbs.length - 1 ? undefined : zoom(crumb.node)
                "
                @keydown.space.prevent="
                    i === breadcrumbs.length - 1 ? undefined : zoom(crumb.node)
                "
                class="vue-ui-treemap-crumb"
                :data-last-crumb="i === breadcrumbs.length - 1"
                :style="{
                    color: FINAL_CONFIG.style.chart.color,
                    cursor: isCursorPointer ? 'pointer' : 'default',
                }"
                @mouseenter="activateHomeIcon(i)"
                @mouseleave="deactivateHomeIcon"
                @focus="activateHomeIcon(i)"
                @blur="deactivateHomeIcon"
            >
                <span class="vue-ui-treemap-crumb-unit">
                    <span class="vue-ui-treemap-crumb-unit-label">
                        <slot
                            name="breadcrumb-label"
                            v-bind="{
                                crumb,
                                isRoot: i === 0,
                                isFocus: activeCrumbIndex === i,
                            }"
                        >
                            <template v-if="i === 0">
                                <div
                                    style="
                                        width: 24px;
                                        display: flex;
                                        align-items: center;
                                    "
                                >
                                    <BaseIcon
                                        :name="
                                            activeCrumbIndex === 0
                                                ? 'homeFilled'
                                                : 'home'
                                        "
                                        :stroke="FINAL_CONFIG.style.chart.color"
                                    />
                                </div>
                            </template>
                            <template v-else>
                                {{ crumb.label }}
                            </template>
                        </slot>
                    </span>

                    <span
                        v-if="i < breadcrumbs.length - 1"
                        class="vue-ui-treemap-crumb-unit-arrow"
                    >
                        <slot name="breadcrumb-arrow"> › </slot>
                    </span>
                </span>
            </span>
        </nav>

        <!-- CHART -->
        <div style="position: relative">
            <svg
                ref="svgRef"
                :xmlns="XMLNS"
                :aria-describedby="`chart-instructions-${uid}`"
                :class="{
                    'vue-data-ui-fullscreen--on': isFullscreen,
                    'vue-data-ui-fulscreen--off': !isFullscreen,
                    'vue-data-ui-zoom-plus': !isZoom,
                    'vue-data-ui-zoom-minus': isZoom,
                    loading: loading,
                }"
                data-cy="treemap-svg"
                :viewBox="`${viewBox.startX} ${viewBox.startY} ${viewBox.width <= 0 ? 10 : viewBox.width} ${viewBox.height <= 0 ? 10 : viewBox.height}`"
                :style="`max-width:100%; overflow: hidden; background:transparent;color:${FINAL_CONFIG.style.chart.color}`"
                tabindex="0"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
            >
                <PackageVersion />

                <g v-for="(rect, _i) in squarified" :key="`tgrad_${rect.id}`">
                    <defs
                        v-if="
                            FINAL_CONFIG.style.chart.layout.rects.gradient.show
                        "
                    >
                        <radialGradient
                            :id="`tgrad_${rect.id}`"
                            gradientTransform="translate(-1, -1.000001) scale(2, 2)"
                        >
                            <stop offset="18%" :stop-color="rect.color" />
                            <stop
                                offset="100%"
                                :stop-color="
                                    lightenHexColor(
                                        rect.color,
                                        FINAL_CONFIG.style.chart.layout.rects
                                            .gradient.intensity / 100,
                                    )
                                "
                            />
                        </radialGradient>
                    </defs>
                </g>

                <!-- PARENT WRAPPERS -->
                <g>
                    <g
                        v-for="(rect, i) in squarified"
                        :key="`rect_${rect.id}_${rect.depth}`"
                    >
                        <rect
                            data-cy="datapoint-rect"
                            :x="rect.x0"
                            :y="rect.y0"
                            :height="getHeight(rect)"
                            :width="getWidth(rect)"
                            :fill="
                                isSafari
                                    ? (rect.color ??
                                      FINAL_CONFIG.style.chart.backgroundColor)
                                    : FINAL_CONFIG.style.chart.layout.rects
                                            .gradient.show
                                      ? allSegregated
                                          ? FINAL_CONFIG.style.chart
                                                .backgroundColor
                                          : `url(#tgrad_${rect.id})`
                                      : (rect.color ??
                                        FINAL_CONFIG.style.chart
                                            .backgroundColor)
                            "
                            :rx="getSafeRadius(rect)"
                            :stroke="
                                selectedRect && selectedRect.id === rect.id
                                    ? FINAL_CONFIG.style.chart.layout.rects
                                          .selected.stroke
                                    : FINAL_CONFIG.style.chart.layout.rects
                                          .stroke
                            "
                            :stroke-width="
                                selectedRect && selectedRect.id === rect.id
                                    ? FINAL_CONFIG.style.chart.layout.rects
                                          .selected.strokeWidth
                                    : FINAL_CONFIG.style.chart.layout.rects
                                          .strokeWidth
                            "
                            @click.stop="zoom(rect, i)"
                            @mouseenter="
                                () =>
                                    useTooltip({
                                        datapoint: rect,
                                        seriesIndex: i,
                                        triggerMode: 'pointer',
                                    })
                            "
                            @mouseleave="
                                onTrapLeave({ datapoint: rect, seriesIndex: i })
                            "
                            :style="`opacity:${selectedRect ? (selectedRect.id === rect.id ? 1 : FINAL_CONFIG.style.chart.layout.rects.selected.unselectedOpacity) : 1}`"
                            :class="[
                                'vue-ui-treemap-rect',
                                isCurrentZoomTarget(rect)
                                    ? 'vue-data-ui-zoom-minus'
                                    : 'vue-data-ui-zoom-plus',
                            ]"
                        />
                    </g>

                    <g
                        v-for="(rect, i) in squarified"
                        :key="`label_${rect.id}_${rect.depth}`"
                    >
                        <g
                            v-if="
                                !$slots.rect &&
                                !loading &&
                                FINAL_CONFIG.style.chart.layout.labels
                                    .showDefaultLabels &&
                                !allSegregated &&
                                rect.showLabel
                            "
                            style="pointer-events: none"
                            v-html="
                                buildTreemapText({
                                    rect,
                                    seriesIndex: i,
                                    isTitle: !!(
                                        rect.children && rect.children.length
                                    ),
                                })
                            "
                        />
                    </g>

                    <g
                        v-for="(rect, i) in squarified"
                        :key="`slot_${rect.id}_${rect.depth}`"
                    >
                        <foreignObject
                            :x="rect.x0"
                            :y="rect.y0"
                            :height="getHeight(rect)"
                            :width="getWidth(rect)"
                            class="vue-ui-treemap-cell-foreignObject"
                            style="pointer-events: none"
                        >
                            <div
                                :style="{
                                    width: '100%',
                                    height: '100%',
                                }"
                                class="vue-ui-treemap-cell"
                            >
                                <slot
                                    v-if="!loading"
                                    name="rect"
                                    v-bind="{
                                        rect: {
                                            ...rect,
                                            height: getHeight(rect),
                                            width: getWidth(rect),
                                            isSelected: !selectedRect
                                                ? true
                                                : selectedRect.id === rect.id,
                                        },
                                        shouldShow:
                                            rect.proportion >
                                                FINAL_CONFIG.style.chart.layout
                                                    .labels
                                                    .hideUnderProportion ||
                                            isZoom,
                                        fontSize: calcFontSize(rect),
                                        isZoom,
                                        textColor: adaptColorToBackground(
                                            rect.color,
                                        ),
                                    }"
                                />
                            </div>
                        </foreignObject>
                    </g>
                </g>

                <slot
                    name="svg"
                    v-bind="{
                        svg,
                        isZoom,
                        rect: selectedRect,
                        config: FINAL_CONFIG,
                        isPrintingImg:
                            isPrinting | isImaging | isCallbackImaging,
                        isPrintingSvg: isCallbackSvg,
                    }"
                />
            </svg>

            <div
                v-if="$slots.hint"
                style="position: absolute; top: 100%; left: 0; width: 100%"
                data-dom-to-png-ignore
                aria-hidden="true"
            >
                <slot
                    name="hint"
                    v-bind="{
                        hint: FINAL_CONFIG.a11y.translations.keyboardNavigation,
                        isVisible: isFocus,
                    }"
                />
            </div>
        </div>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot
                name="watermark"
                v-bind="{
                    isPrinting:
                        isPrinting ||
                        isImaging ||
                        isCallbackImaging ||
                        isCallbackSvg,
                }"
            />
        </div>

        <div :id="`legend-bottom-${uid}`" />

        <!-- LEGEND -->
        <Teleport
            v-if="readyTeleport"
            :to="
                FINAL_CONFIG.style.chart.legend.position === 'top'
                    ? `#legend-top-${uid}`
                    : `#legend-bottom-${uid}`
            "
        >
            <div ref="chartLegend">
                <Legend
                    v-if="FINAL_CONFIG.style.chart.legend.show"
                    :key="`legend_${legendStep}`"
                    :legendSet="legendSet"
                    :config="legendConfig"
                    :id="`treemap_legend_${uid}`"
                    :isCursorPointer="isCursorPointer"
                    @clickMarker="({ legend }) => segregate(legend)"
                >
                    <template #item="{ legend, index }">
                        <div
                            :data-cy="`legend-item-${index}`"
                            @click="segregate(legend)"
                            :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`"
                            v-if="!loading"
                        >
                            {{ legend.display }}
                        </div>
                    </template>

                    <template #legendToggle>
                        <BaseLegendToggle
                            v-if="
                                legendSet.length > 2 &&
                                FINAL_CONFIG.style.chart.legend.selectAllToggle
                                    .show &&
                                !loading
                            "
                            :backgroundColor="
                                FINAL_CONFIG.style.chart.legend.selectAllToggle
                                    .backgroundColor
                            "
                            :color="
                                FINAL_CONFIG.style.chart.legend.selectAllToggle
                                    .color
                            "
                            :fontSize="FINAL_CONFIG.style.chart.legend.fontSize"
                            :checked="segregated.length > 0"
                            :isCursorPointer="isCursorPointer"
                            @toggle="toggleLegend"
                        />
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
            :teleportTo="FINAL_CONFIG.style.chart.tooltip.teleportTo"
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.style.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.chart.tooltip.color"
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
            :backgroundOpacity="
                FINAL_CONFIG.style.chart.tooltip.backgroundOpacity
            "
            :position="FINAL_CONFIG.style.chart.tooltip.position"
            :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="treemapChart"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="
                isFunction(FINAL_CONFIG.style.chart.tooltip.customFormat)
            "
            :smooth="FINAL_CONFIG.style.chart.tooltip.smooth"
            :backdropFilter="FINAL_CONFIG.style.chart.tooltip.backdropFilter"
            :smoothForce="FINAL_CONFIG.style.chart.tooltip.smoothForce"
            :smoothSnapThreshold="
                FINAL_CONFIG.style.chart.tooltip.smoothSnapThreshold
            "
            :isA11yMode="tooltipTriggerMode === 'keyboard'"
            :a11yPosition="tooltipA11yPosition"
        >
            <template #tooltip-before>
                <slot
                    name="tooltip-before"
                    v-bind="{ ...dataTooltipSlot }"
                ></slot>
            </template>
            <template #tooltip>
                <slot name="tooltip" v-bind="{ ...dataTooltipSlot }" />
            </template>
            <template #tooltip-after>
                <slot
                    name="tooltip-after"
                    v-bind="{ ...dataTooltipSlot }"
                ></slot>
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
                <button
                    tabindex="0"
                    class="vue-ui-user-options-button"
                    @click="generateCsv(FINAL_CONFIG.userOptions.callbacks.csv)"
                    :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
                >
                    <BaseIcon
                        name="fileCsv"
                        :stroke="tableComponent.props.color"
                    />
                </button>
            </template>
            <template #content>
                <DataTable
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames"
                    :head="dataTable.head"
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="
                        FINAL_CONFIG.table.useDialog ? '' : tableComponent.title
                    "
                    :withCloseButton="!FINAL_CONFIG.table.useDialog"
                    :isCursorPointer="isCursorPointer"
                    @close="closeTable"
                >
                    <template #th="{ th }">
                        <div
                            v-html="th"
                            style="display: flex; align-items: center"
                        ></div>
                    </template>
                    <template #td="{ td }">
                        {{ td.name || td }}
                    </template>
                </DataTable>
            </template>
        </component>

        <!-- v3 Skeleton loader -->
        <slot name="skeleton">
            <BaseScanner v-if="loading" />
        </slot>
    </div>
</template>

<style scoped>
@import '../vue-data-ui.css';

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
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.vue-ui-treemap-cell-zoom {
    animation: zoom-cell 0.2s ease-in forwards !important;
    transform-origin: center;
}

@keyframes zoom-cell {
    0% {
        transform: scale(0.8, 0.8);
        opacity: 0;
        filter: drop-shadow(0px 12px 12px black);
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
}

.vue-ui-treemap-crumb-unit-label {
    flex-shrink: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.vue-ui-treemap-crumb-unit-arrow {
    min-width: 12px;
}

.vue-ui-treemap-crumb[data-last-crumb='true'] {
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
    align-items: center;
    gap: 3px;
}

svg:focus {
    outline: none;
}

svg:focus-visible,
.vue-ui-treemap-crumb:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 4px;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    clip: rect(0 0 0 0);
    white-space: normal;
    border: 0;
}
</style>
