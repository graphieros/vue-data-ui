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
    watch, 
} from "vue";
import {
    applyDataLabel,
    checkNaN,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent, 
    createSmoothPath,
    createSmoothPathVertical,
    createUid,
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    getMissingDatasetAttributes,
    giftWrap,
    isFunction,
    largestTriangleThreeBuckets,
    objectIsEmpty,
    palette,
    setOpacity,
    themePalettes,
    treeShake,
    XMLNS,
} from '../lib';
import { throttle } from "../canvas-lib";
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading";
import { usePrinter } from "../usePrinter";
import { useSvgExport } from "../useSvgExport";
import { useNestedProp } from "../useNestedProp";
import { useResponsive } from "../useResponsive";
import { useThemeCheck } from "../useThemeCheck";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import themes from "../themes/vue_ui_scatter.json";
import Legend from "../atoms/Legend.vue"; // Must be ready in responsive mode
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import Shape from "../atoms/Shape.vue";
import img from "../img";
import BaseScanner from "../atoms/BaseScanner.vue";
import BaseLegendToggle from "../atoms/BaseLegendToggle.vue";

const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));

const { vue_ui_scatter: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

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

const emit = defineEmits(['copyAlt']);

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
})

const uid = ref(createUid());
const isTooltip = ref(false);
const tooltipContent = ref("");
const step = ref(0);
const scatterChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);
const segregated = ref([]);
const readyTeleport = ref(false);
const selectedMarginalX = ref(null);
const selectedMarginalY = ref(null);
const tableUnit = ref(null);
const userOptionsRef = ref(null);
const isCallbackImaging = ref(false);
const isCallbackSvg = ref(false);

const xAxisLabelLeft = ref(null);
const xAxisLabelRight = ref(null);

const yAxisLabelTop = ref(null);
const yAxisLabelBottom = ref(null);

const FINAL_CONFIG = ref(prepareConfig());

const isCursorPointer = computed(() => FINAL_CONFIG.value.userOptions.useCursorPointer);

function mockData(n = 100, r = 0.8, opts = {}) {
    const { meanX = 0, sdX = 1, meanY = 0, sdY = 1, seed } = opts;
    let s = (seed ?? Math.floor(Math.random() * 2 ** 31)) >>> 0;
    const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0), s / 2 ** 32);
    const randn = () => {
        let u = 0, v = 0;
        while (u === 0) u = rnd();
        while (v === 0) v = rnd();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    const half = n / 2;
    const x = Array.from({ length: half }, randn);
    const z = Array.from({ length: half }, randn);
    const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
    const mx = mean(x), mz = mean(z);
    for (let i = 0; i < half; i += 1) { x[i] -= mx; z[i] -= mz; }
    const dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0);
    const norm2 = a => dot(a, a);
    const alpha = dot(z, x) / norm2(x);
    const zp = z.map((v, i) => v - alpha * x[i]);
    const varX = norm2(x) / half;
    const varZp = norm2(zp) / half;
    const b = Math.sqrt((1 - r * r) * varX / varZp);
    const y = x.map((vx, i) => r * vx + b * zp[i]);
    const X = x.concat(x.map(v => -v));
    const Y = y.concat(y.map(v => -v));
    const sd = a => Math.sqrt(norm2(a) / a.length);
    const scaleTo = (a, s, m) => {
        const cur = sd(a);
        return a.map(v => m + (cur ? (v / cur) * s : 0));
    };
    const Xout = scaleTo(X, sdX, meanX);
    const Yout = scaleTo(Y, sdY, meanY);
    for (let i = Xout.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rnd() * (i + 1));
        [Xout[i], Xout[j]] = [Xout[j], Xout[i]];
        [Yout[i], Yout[j]] = [Yout[j], Yout[i]];
    }
    return Xout.map((vx, i) => ({ x: vx, y: Yout[i] }));
}

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            userOptions: { show: false, },
            table: { show: false },
            useCssAnimation: false,
            style: {
                backgroundColor: '#99999930',
                layout: {
                    axis: {
                        stroke: '#6A6A6A'
                    },
                    correlation: {
                        label: { show: false }
                    },
                    dataLabels: {
                        xAxis: { show: false },
                        yAxis: { show: false }
                    },
                    marginalBars: {
                        fill: '#99999960'
                    },
                    padding: { top: 12, right: 12, bottom: 12, left: 12 },
                    plots: {
                        stroke: '#6A6A6A'
                    }
                },
                legend: {
                    backgroundColor: 'transparent'
                }
            }
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {}
    })
});

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: props.config?.skeletonDataset ?? [
        {
            name: '',
            color: '#999999',
            values: mockData(100, 0.5, { seed: 42 })
        }
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value
    })
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.title });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });

    const theme = mergedConfig.theme;
    if (!theme) return mergedConfig;

    if (!isThemeValid.value(mergedConfig)) {
        warnInvalidTheme(mergedConfig);
        return mergedConfig;
    }

    const fused = useNestedProp({
        userConfig: themes[theme] || props.config,
        defaultConfig: mergedConfig
    });

    const finalConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: fused
    });

    return {
        ...finalConfig,
        customPalette: finalConfig.customPalette.length ? finalConfig.customPalette : themePalettes[theme] || palette
    }
}

watch(() => props.config, (_newCfg) => {
    if (!loading.value) {
        FINAL_CONFIG.value = prepareConfig();
    }
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
    legendStep.value += 1;

    // Reset mutable config
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.tooltip.show;

    if (debug.value && FINAL_CONFIG.value.usePerformanceMode) {
        console.warn('VueUiScatter : You are using performance mode\n\n- downsampling is disabled in this mode, all plots are rendered\n\n- plot significance is not active in this mode (all plots have the same opacity) \n\n- Depending on plot density, shapes might not display a border (stroke) to avoid fuzziness \n\nℹ️ To remove this warning, set config.debug to false.')
    }

}, { deep: true });

watch(() => props.dataset, (_) => {
    if (Array.isArray(_) && _.length > 0) {
        manualLoading.value = false;
    }
}, { deep: true })

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

onMounted(() => {
    readyTeleport.value = true;
    prepareChart();
});

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)){
        error({ 
            componentName: 'VueUiScatter',
            type: 'dataset',
            debug: debug.value
        });
        manualLoading.value = true;
    }

    // v3
    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: scatterChart.value,
                title: FINAL_CONFIG.value.style.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.legend.show ? chartLegend.value : null,
                source: source.value,
                noTitle: noTitle.value
            });

            requestAnimationFrame(() => {
                svg.value.width = width;
                svg.value.height = height;
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = scatterChart.value.parentNode;
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

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-scatter_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.title.text || 'vue-ui-scatter',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.tooltip.show
});

// v3 - Essential to make shifting between loading config and final config work
watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
        showTable: FINAL_CONFIG.value.table.show,
        showTooltip: FINAL_CONFIG.value.style.tooltip.show
    }
}, { immediate: true });

const svg = ref({
    height: FINAL_CONFIG.value.style.layout.height,
    width: FINAL_CONFIG.value.style.layout.width,
})

const marginalSize = computed(() => {
    if(!FINAL_CONFIG.value.style.layout.marginalBars.show) {
        return 0
    }
    return FINAL_CONFIG.value.style.layout.marginalBars.size + FINAL_CONFIG.value.style.layout.marginalBars.offset
});

const drawingArea = computed(() => {
    let offsetL = 0;
    let offsetB = 0;

    if (xAxisLabelLeft.value) {
        offsetL = xAxisLabelLeft.value.getBBox().width + 6;
    }

    if (yAxisLabelBottom.value) {
        offsetB = yAxisLabelBottom.value.getBBox().height + 6
    }

    return {
        top: FINAL_CONFIG.value.style.layout.padding.top + marginalSize.value + (FINAL_CONFIG.value.style.layout.dataLabels.yAxis.fontSize * 2),
        right: svg.value.width - FINAL_CONFIG.value.style.layout.padding.right - marginalSize.value - 6,
        bottom: svg.value.height - FINAL_CONFIG.value.style.layout.padding.bottom - offsetB,
        left: FINAL_CONFIG.value.style.layout.padding.left + offsetL,
        height: svg.value.height - FINAL_CONFIG.value.style.layout.padding.top - FINAL_CONFIG.value.style.layout.padding.bottom - marginalSize.value - offsetB - (FINAL_CONFIG.value.style.layout.dataLabels.yAxis.fontSize * 2),
        width: svg.value.width - FINAL_CONFIG.value.style.layout.padding.left - FINAL_CONFIG.value.style.layout.padding.right - marginalSize.value - offsetL - 6
    }
});

const extremes = computed(() => {
    FINAL_DATASET.value.forEach((ds, i) => {
        getMissingDatasetAttributes({
            datasetObject: ds,
            requiredAttributes: ['values']
        }).forEach(attr => {
            error({
                componentName: 'VueUiScatter',
                type: 'datasetSerieAttribute',
                property: attr,
                index: i
            });
        })
        if(ds.values) {
            ds.values.forEach((v, j) => {
                getMissingDatasetAttributes({
                    datasetObject: v,
                    requiredAttributes: ['x', 'y']
                }).forEach(attr => {
                    error({
                        componentName: 'VueUiScatter',
                        type: 'datasetSerieAttribute',
                        property: `values.${attr}`,
                        index: `${i} - ${j}`
                    });
                });
            })
        }
    });

    const xMin = Math.min(...datasetWithId.value.filter(el => !segregated.value.includes(el.id)).flatMap(ds => ds.values.map(v => v.x)));
    const xMax = Math.max(...datasetWithId.value.filter(el => !segregated.value.includes(el.id)).flatMap(ds => ds.values.map(v => v.x)));
    const yMin = Math.min(...datasetWithId.value.filter(el => !segregated.value.includes(el.id)).flatMap(ds => ds.values.map(v => v.y)));
    const yMax = Math.max(...datasetWithId.value.filter(el => !segregated.value.includes(el.id)).flatMap(ds => ds.values.map(v => v.y)));
    return { xMin: xMin >= 0 ? 0 : xMin, xMax, yMin: yMin >= 0 ? 0 : yMin, yMax };
});

const zero = computed(() => {
    return {
        x: drawingArea.value.left + (Math.abs(extremes.value.xMin) / (extremes.value.xMax + Math.abs(extremes.value.xMin))) * drawingArea.value.width,
        y: drawingArea.value.bottom - (Math.abs(extremes.value.yMin) / (extremes.value.yMax + Math.abs(extremes.value.yMin))) * drawingArea.value.height
    }
});

const datasetWithId = computed(() => {
    return FINAL_DATASET.value.map((ds, i) => {
        const id = `cluster_${uid.value}_${i}`;
        return {
            ...ds,
            values: largestTriangleThreeBuckets({
                data: ds.values,
                threshold: FINAL_CONFIG.value.usePerformanceMode ? ds.values.length + 1 : FINAL_CONFIG.value.downsample.threshold
            }),
            id,
            color: ds.color ? ds.color : (customPalette.value[i] || palette[i] || palette[i % palette.length]),
            opacity: segregated.value.includes(id) ? 0.5: 1,
            shape: ds.shape ?? 'circle',
            segregate: () => segregate(id),
            isSegregated: segregated.value.includes(id)
        }
    })
})

const legendConfig = computed(() => {
    return {
        cy: 'scatter-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.legend.color,
        fontSize: FINAL_CONFIG.value.style.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.legend.bold ? 'bold' : ''
    }
})

const mutableDataset = computed(() => {
    return datasetWithId.value.map((ds, i) => {
        return {
            ...ds,
            plots: ds.values.map(v => {
                return {
                    x: drawingArea.value.left + ((v.x + Math.abs(extremes.value.xMin)) / (extremes.value.xMax + Math.abs(extremes.value.xMin))) * drawingArea.value.width,
                    y: drawingArea.value.bottom - ((v.y + Math.abs(extremes.value.yMin)) / (extremes.value.yMax + Math.abs(extremes.value.yMin))) * drawingArea.value.height,
                    v: {
                        ...v,
                        name: v.name || ""
                    },
                    clusterName: ds.name,
                    color: ds.color ? ds.color : (customPalette.value[i] || palette[i] || palette[i % palette.length]),
                    id: `plot_${uid.value}_${Math.random()}`,
                    weight: v.weight ?? FINAL_CONFIG.value.style.layout.plots.radius,
                }
            }),
        }
    }).filter(ds => !segregated.value.includes(ds.id));
})

const drawableDataset = computed(() => {
    const EPS = 1e-9;

    const clipLineToRect = ({ m, b, rect, verticalX = null }) => {
        const { left, right, top, bottom } = rect;
        const pts = [];
        const add = (x, y) => {
            if (Number.isFinite(x) && Number.isFinite(y)) pts.push({ x, y });
        };
        const inside = ({ x, y }) =>
            x >= left - EPS && x <= right + EPS && y >= top - EPS && y <= bottom + EPS;

        if (verticalX !== null) {
            if (verticalX >= left - EPS && verticalX <= right + EPS) {
                add(verticalX, top);
                add(verticalX, bottom);
            }
        } else if (Number.isFinite(m)) {
            add(left, m * left + b);
            add(right, m * right + b);
            if (Math.abs(m) > EPS) {
                    add((top - b) / m, top);
                    add((bottom - b) / m, bottom);
            } else {
                if (b >= top - EPS && b <= bottom + EPS) {
                    add(left, b);
                    add(right, b);
                }
            }
        }

        const inRect = pts.filter(inside);
        const unique = [];
        for (const p of inRect) {
            if (!unique.some(q => Math.abs(q.x - p.x) < 1e-6 && Math.abs(q.y - p.y) < 1e-6)) {
                unique.push(p);
            }
        }
        if (unique.length < 2) return null;

        let p1 = unique[0], p2 = unique[1], maxD2 = 0;
        for (let i = 0; i < unique.length; i += 1) {
            for (let j = i + 1; j < unique.length; j += 1) {
                const dx = unique[i].x - unique[j].x;
                const dy = unique[i].y - unique[j].y;
                const d2 = dx * dx + dy * dy;
                if (d2 > maxD2) {
                    maxD2 = d2; p1 = unique[i]; p2 = unique[j];
                }
            }
        }
        return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y };
    };

    return mutableDataset.value.map(ds => {
        const n = ds.plots.length;

        const meanX = ds.plots.reduce((s, p) => s + p.x, 0) / n;
        const meanY = ds.plots.reduce((s, p) => s + p.y, 0) / n;

        let covXY_pix = 0, varX_pix = 0, varY_pix = 0;
        for (const p of ds.plots) {
            const dx = p.x - meanX;
            const dy = p.y - meanY;
            covXY_pix += dx * dy;
            varX_pix += dx * dx;
            varY_pix += dy * dy;
        }

        let slope, intercept, verticalX = null;
        if (varX_pix < EPS) {
            verticalX = meanX;
            slope = Infinity;
            intercept = null;
        } else {
            // m = cov(x,y)/var(x) in pixel space
            slope = covXY_pix / varX_pix;
            intercept = meanY - slope * meanX;
        }

        let m, b;
        if (verticalX !== null) {
            m = Infinity; 
            b = null;
        } else {
            m = slope; 
            b = intercept;
        }

        // CORRELATION COEFFICIENT (data space, y-flipped)
        // Prefer data values if present; else use pixel x and -y to flip orientation.
        const hasData = ds.plots.every(p => p.v && typeof p.v.x === "number" && typeof p.v.y === "number");

        let r = NaN;
        if (n >= 2) {
            let mx = 0, my = 0;
            if (hasData) {
                mx = ds.plots.reduce((s, p) => s + p.v.x, 0) / n;
                my = ds.plots.reduce((s, p) => s + p.v.y, 0) / n;
            } else {
                mx = meanX;
                my = -meanY; // inverted Y for correlation only
            }

            let num = 0, dx2 = 0, dy2 = 0;
            for (const p of ds.plots) {
                const xi = hasData ? p.v.x : p.x;
                const yi = hasData ? p.v.y : -p.y; // flipped
                const dx = xi - mx;
                const dy = yi - my;
                num += dx * dy;
                dx2 += dx * dx;
                dy2 += dy * dy;
            }
            if (dx2 >= EPS && dy2 >= EPS) {
                const raw = num / Math.sqrt(dx2 * dy2);
                r = Math.max(-1, Math.min(1, raw));
            }
        }

        const clipped = clipLineToRect({ m, b, rect: drawingArea.value, verticalX });
        if (!clipped) {
            return {
                ...ds,
                correlation: null,
                label: null,
                plots: ds.plots.map(plot => ({
                    ...plot,
                    deviation: 0,
                    shape: ds.shape,
                    color: convertColorToHex(ds.color)
                }))
            };
        }

        const midX = (clipped.x1 + clipped.x2) / 2;
        const midY = (clipped.y1 + clipped.y2) / 2;
        const label = { x: midX, y: midY };

        return {
            ...ds,
            color: convertColorToHex(ds.color),
            correlation: {
                ...clipped,
                coefficient: r
            },
            label,
            plots: ds.plots.map(plot => {
                let x_proj, y_proj;
                if (verticalX !== null) {
                    x_proj = verticalX; y_proj = plot.y;
                } else if (Math.abs(m) < EPS) {
                    x_proj = plot.x; y_proj = b;
                } else {
                    x_proj = (plot.x + m * plot.y - m * b) / (1 + m * m);
                    y_proj = (m * plot.x + m * m * plot.y + b) / (1 + m * m);
                }
                const dx = plot.x - x_proj;
                const dy = plot.y - y_proj;
                const deviation = Math.sqrt(dx * dx + dy * dy);
                return {
                    ...plot,
                    deviation,
                    shape: ds.shape,
                    color: convertColorToHex(ds.color)
                };
            })
        };
    });
});


const maxDeviation = computed(() => {
    return Math.max(...drawableDataset.value.flatMap(ds => ds.plots.map(p => Math.abs(p.deviation))))
});

function getData() {
    return drawableDataset.value;
}

function aggregateCoordinates(arr, scale) {
    const flattened = Array.isArray(arr) ? arr.flatMap(a => {
        return a.plots.map((p) => {
            return {
                x: p.x,
                y: p.y
            }
        })
    }) : arr.plots.map(p => {
        return {
            x: p.x,
            y: p.y
        }
    })

    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;

    flattened.forEach(({x, y}) => {
        xMin = Math.min(xMin, x);
        xMax = Math.max(xMax, x);
        yMin = Math.min(yMin, y);
        yMax = Math.max(yMax, y);
    });

    const totalX = xMax - xMin;
    const totalY = yMax - yMin;
    const chunkSizeX = totalX / scale;
    const chunkSizeY = totalY / scale;
    const xCounts = Array(scale).fill(0);
    const yCounts = Array(scale).fill(0);

    flattened.forEach(({ x, y }) => {
        const xIndex = Math.floor((x - xMin) / chunkSizeX);
        const yIndex = Math.floor((y - yMin) / chunkSizeY);
        if(!xCounts[xIndex]) {
            xCounts[xIndex] = 0;
        }
        if(!yCounts[yIndex]) {
            yCounts[yIndex] = 0;
        }
        xCounts[xIndex] += 1;
        yCounts[yIndex] += 1;
    });

    const avgX = [];
    const avgY = [];
    for (let i = 0; i < scale; i += 1) {
        avgX.push(xMin + (i + 0.5) * chunkSizeX);
        avgY.push(yMin + (i + 0.5) * chunkSizeY);
    }
    const maxX = Math.max(...xCounts);
    const maxY = Math.max(...yCounts);
    return { x: xCounts, y: yCounts, avgX, avgY, maxX, maxY };
}

const scale = computed(() => FINAL_CONFIG.value.style.layout.marginalBars.tranches)

const marginalBars = computed(() => {
    return aggregateCoordinates(mutableDataset.value, scale.value)
});

const marginalLines = computed(() => {
    const top = drawingArea.value.top - FINAL_CONFIG.value.style.layout.marginalBars.offset;
    const right = drawingArea.value.right + FINAL_CONFIG.value.style.layout.marginalBars.offset;
    return mutableDataset.value.map(ds => {
        const coords = aggregateCoordinates(ds, scale.value);

        return {
            coords,
            dX: createSmoothPath(coords.avgX.map((el,i) => {
                return { 
                    x: el, 
                    y: top - coords.x[i] / coords.maxX * FINAL_CONFIG.value.style.layout.marginalBars.size
                }
            })),
            dY: createSmoothPathVertical(coords.avgY.map((el, i) => {
                return {
                    y: el,
                    x: right + (FINAL_CONFIG.value.style.layout.marginalBars.size * coords.y[i] / coords.maxY)
                }
            })),
            color: ds.color,
            id: ds.id,
        }
    })
})

const selectedPlotId = ref(undefined);
const selectedPlot = ref(null);
const dataTooltipSlot = ref(null);

function onTrapEnter(plot, seriesIndex) {
    selectedPlotId.value = plot.id;
    selectedPlot.value = plot;
    let html = "";

    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint: plot, seriesIndex})
    }

    dataTooltipSlot.value = {
        datapoint: plot,
        seriesIndex,
        series: drawableDataset.value,
        config: FINAL_CONFIG.value
    }

    const customFormat = FINAL_CONFIG.value.style.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
            datapoint: plot,
            seriesIndex,
            series: drawableDataset.value,
            config: FINAL_CONFIG.value
        }))) {
        tooltipContent.value = customFormat({
            datapoint: plot,
            seriesIndex,
            series: drawableDataset.value,
            config: FINAL_CONFIG.value
        })
    } else {
        if (plot.clusterName) {
            html += `<div style="display:flex;gap:3px;align-items:center">${plot.clusterName}</div>`
        }
    
        if (plot.v.name) {
            html += `<div>${plot.v.name}</div>`
        }
    
        html += `<div style="text-align:left;margin-top:6px;padding-top:6px;border-top:1px solid ${FINAL_CONFIG.value.style.tooltip.borderColor}">`;

        html += `<div>${FINAL_CONFIG.value.style.layout.dataLabels.xAxis.name}: <b>${isNaN(plot.v.x) ? '-' : applyDataLabel(
            FINAL_CONFIG.value.style.layout.plots.selectors.labels.x.formatter,
            plot.v.x,
            dataLabel({
                p: FINAL_CONFIG.value.style.tooltip.prefix,
                v: plot.v.x,
                s: FINAL_CONFIG.value.style.tooltip.suffix,
                r: FINAL_CONFIG.value.style.tooltip.roundingValue
            }),
            { datapoint: plot, seriesIndex }
        )}</b></div>`;

        html += `<div>${FINAL_CONFIG.value.style.layout.dataLabels.yAxis.name}: <b>${isNaN(plot.v.y) ? '-' :  applyDataLabel(
            FINAL_CONFIG.value.style.layout.plots.selectors.labels.y.formatter,
            plot.v.y,
            dataLabel({
                p: FINAL_CONFIG.value.style.tooltip.prefix,
                v: plot.v.y,
                s: FINAL_CONFIG.value.style.tooltip.suffix,
                r: FINAL_CONFIG.value.style.tooltip.roundingValue
            }),
            { datapoint: plot, seriesIndex }
        )}</b></div>`;
        
        html += `${FINAL_CONFIG.value.style.layout.plots.deviation.translation}: <b>${dataLabel({
            v: plot.deviation,
            r: FINAL_CONFIG.value.style.layout.plots.deviation.roundingValue
        })}</b>`;

        html += `</div>`;
    
        tooltipContent.value = `<div>${html}</div>`
    }

    isTooltip.value = true;
}

function onTrapLeave(datapoint, seriesIndex) {
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex })
    }

    isTooltip.value = false;
    selectedPlotId.value = undefined;
    selectedPlot.value = null;
}

function onTrapClick(datapoint, seriesIndex) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex })
    }
}

function toggleLegend() {
    if (segregated.value.length) {
        segregated.value = [];
    } else {
        datasetWithId.value.forEach(l => {
            segregated.value.push(l.id);
        });
    }
}

function segregate(id) {
    if (segregated.value.includes(id)) {
        segregated.value = segregated.value.filter(el => el !== id);
    } else {
        if (segregated.value.length < FINAL_DATASET.value.length - 1) {
            segregated.value.push(id)
        }
    }
}

function validSeriesToToggle(name) {
    if (!datasetWithId.value.length) {
        if (FINAL_CONFIG.value.debug) {
            console.warn('VueUiScatter - There are no series to show.');
        }
        return null;
    }
    const dp = datasetWithId.value.find(d => d.name === name);
    if (!dp) {
        if (FINAL_CONFIG.value.debug) {
            console.warn(`VueUiScatter - Series name not found "${name}"`);
        }
        return null;
    }
    return dp;
}

function showSeries(name) {
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (segregated.value.includes(dp.id)) {
        segregate(dp.id);
    }
}

function hideSeries(name) {
    const dp  = validSeriesToToggle(name);
    if (dp === null) return;
    if (!segregated.value.includes(dp.id))  {
        segregate(dp.id);
    }
}

function generateCsv(callback=null) {
    nextTick(() => {
        const labels = ["", FINAL_CONFIG.value.table.translations.correlationCoefficient, FINAL_CONFIG.value.table.translations.nbrPlots, `${FINAL_CONFIG.value.style.layout.dataLabels.xAxis.name} ${FINAL_CONFIG.value.table.translations.average}`, `${FINAL_CONFIG.value.style.layout.dataLabels.yAxis.name} ${FINAL_CONFIG.value.table.translations.average}`];

        const values = drawableDataset.value.map(ds => {
            return [
                ds.name,
                ds.correlation.coefficient,
                ds.plots.length,
                ds.plots.map(plot => plot.v.x).reduce((a, b) => a + b, 0) / ds.plots.length,
                ds.plots.map(plot => plot.v.y).reduce((a, b) => a + b, 0) / ds.plots.length
            ]
        });

        const tableXls = [[FINAL_CONFIG.value.style.title.text],[FINAL_CONFIG.value.style.title.subtitle.text],[[""],[""],[""]]].concat([labels]).concat(values)
        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.title.text || "vue-ui-heatmap"})
        } else {
            callback(csvContent);
        }

    });
}

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.translations.series,
        FINAL_CONFIG.value.table.translations.correlationCoefficient,
        FINAL_CONFIG.value.table.translations.nbrPlots,
        `${FINAL_CONFIG.value.style.layout.dataLabels.xAxis.name} ${FINAL_CONFIG.value.table.translations.average}`,
        `${FINAL_CONFIG.value.style.layout.dataLabels.yAxis.name} ${FINAL_CONFIG.value.table.translations.average}`
    ];

    const body = drawableDataset.value.map(ds => {
        return [
            {
                shape: ds.shape,
                content: ds.name,
                color: ds.color
            },
            Number((ds.correlation.coefficient ?? 0).toFixed(FINAL_CONFIG.value.table.td.roundingValue)).toLocaleString(),
            ds.plots.length.toLocaleString(),
            Number((ds.plots.map(p => p.v.x ?? 0).reduce((a,b) => a + b , 0) / ds.plots.length).toFixed(FINAL_CONFIG.value.table.td.roundingAverage)).toLocaleString(),
            Number((ds.plots.map(p => p.v.y ?? 0).reduce((a,b) => a + b , 0) / ds.plots.length).toFixed(FINAL_CONFIG.value.table.td.roundingAverage)).toLocaleString(),
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

    return { head, body, config, colNames: head };
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

async function getImage({ scale = 2} = {}) {
    if (!scatterChart.value) return;
    const { width, height } = scatterChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: scatterChart.value, base64: true, img: true, scale })
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.title.text,
        width,
        height,
        aspectRatio
    }
}

function onMarginalXEnter(index) {
    selectedMarginalX.value = index;
    if (FINAL_CONFIG.value.style.layout.marginalBars.highlighter.highlightBothAxes) {
        selectedMarginalY.value = marginalBars.value.y.length - 2 - index;
    }
}

function onMarginalYEnter(index) {
    selectedMarginalY.value = index;
    if (FINAL_CONFIG.value.style.layout.marginalBars.highlighter.highlightBothAxes) {
        selectedMarginalX.value = index;
    }
}

function onMarginalLeave() {
    selectedMarginalX.value = null;
    selectedMarginalY.value = null;
}

const SHAPES_RADIUS_SCALE = {
    circle: 1,
    square: 1,
    diamond: 1,
    triangle: 1.2,
    star: 1.3,
    pentagon: 1.3,
    hexagon: 1.3
}

const f = v => v.toFixed(3);

// Performance mode: single path per series :)
function makeSinglePathPlots({ shape = 'circle', cx, cy, r }) {
    if (!FINAL_CONFIG.value.usePerformanceMode) return '';

    const radius = SHAPES_RADIUS_SCALE[shape] * r;
    switch (shape) {
        case 'circle': {
            const x1 = f(cx - radius);
            const y1 = f(cy);
            const x2 = f(cx + radius);
            const rr = f(radius);
            return `M ${x1} ${y1} A ${rr} ${rr} 0 1 0 ${x2} ${y1} A ${rr} ${rr} 0 1 0 ${x1} ${y1} Z`;
        }
        case 'square': {
            const x0 = f(cx - radius);
            const y0 = f(cy - radius);
            const x1 = f(cx + radius);
            const y1 = f(cy + radius);
            return `M ${x0} ${y0} L ${x1} ${y0} L ${x1} ${y1} L ${x0} ${y1} Z`;
        }
        case 'diamond': {
            const cxF = f(cx);
            const cyF = f(cy);
            return `M ${cxF} ${f(cy - radius)} L ${f(cx + radius)} ${cyF} L ${cxF} ${f(cy + radius)} L ${f(cx - radius)} ${cyF} Z`;
        }
        case 'triangle': { 
            const h = radius * Math.sqrt(3);
            const xA = cx, yA = cy - (2 / 3) * h;
            const xB = cx - radius, yB = cy + (1 / 3) * h;
            const xC = cx + radius, yC = yB;
            return `M ${f(xA)} ${f(yA)} L ${f(xB)} ${f(yB)} L ${f(xC)} ${f(yC)} Z`;
        }
        case 'star': {
            const outer = radius;
            const inner = radius * 0.5;
            const pts = [];
            for (let i = 0; i < 10; i += 1) {
                const ang = (-90 + i * 36) * Math.PI / 180;
                const rr = (i % 2 === 0) ? outer : inner;
                pts.push([cx + rr * Math.cos(ang), cy + rr * Math.sin(ang)]);
            }
            let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
            for (let i = 1; i < pts.length; i += 1) {
                d += ` L ${f(pts[i][0])} ${f(pts[i][1])}`;
            }
            return d + ' Z';
        }
        case 'pentagon': {
            const n = 5;
            const pts = [];
            for (let i = 0; i < n; i += 1) {
                const ang = (-90 + i * (360 / n)) * Math.PI / 180;
                pts.push([cx + radius * Math.cos(ang), cy + radius * Math.sin(ang)]);
            }
            let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
            for (let i = 1; i < n; i += 1) d += ` L ${f(pts[i][0])} ${f(pts[i][1])}`;
            return d + ' Z';
        }
        case 'hexagon': {
            const n = 6;
            const pts = [];
            for (let i = 0; i < n; i += 1) {
                const ang = (-60 + i * (360 / n)) * Math.PI / 180;
                pts.push([cx + radius * Math.cos(ang), cy + radius * Math.sin(ang)]);
            }
            let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
            for (let i = 1; i < n; i += 1) d += ` L ${f(pts[i][0])} ${f(pts[i][1])}`;
            return d + ' Z';
        }
        default: {
            const x1 = f(cx - radius);
            const y1 = f(cy);
            const x2 = f(cx + radius);
            const rr = f(radius);
            return `M ${x1} ${y1} A ${rr} ${rr} 0 1 0 ${x2} ${y1} A ${rr} ${rr} 0 1 0 ${x1} ${y1} Z`;
        }
    }
}

const seriesPaths = computed(() => {
    if (!FINAL_CONFIG.value.usePerformanceMode) return [''];

    const { left, right, top, bottom } = drawingArea.value;

    const area = Math.max(1, (right - left) * (bottom - top));
    const density = (n) => (n / area) * 10000;

    const DENSE_THRESHOLD = 2.5;
    const COUNT_THRESHOLD = 1000;

    const baseStroke = FINAL_CONFIG.value.style.layout.plots.stroke;
    const baseStrokeWidth = FINAL_CONFIG.value.style.layout.plots.strokeWidth;
    const baseOpacity = FINAL_CONFIG.value.style.layout.plots.opacity;

    return drawableDataset.value.map(ds => {
        const parts = [];

        for (const p of ds.plots) {
        const x = p.x, y = p.y;
        if (x < left || x > right || y < top || y > bottom) continue;
            const r = Math.max(FINAL_CONFIG.value.style.layout.plots.radius, p.weight);
            parts.push(makeSinglePathPlots({
                shape: ds.shape || 'circle',
                cx: x,
                cy: y,
                r
            }));
        }

        if (!parts.length) return null;

        const tooDense = density(ds.plots.length) > DENSE_THRESHOLD || ds.plots.length > COUNT_THRESHOLD;

        return {
            id: ds.id,
            d: parts.join(''),
            fill: setOpacity(ds.color, baseOpacity * 100),
            stroke: tooDense ? 'none' : baseStroke,
            strokeWidth: tooDense ? 0 : baseStrokeWidth,
            strokeOpacity: 1
        };
    }).filter(Boolean);
});

function onTrapMoveFactory() {
    if (!FINAL_CONFIG.value.usePerformanceMode) return () => null;

    return (evt) => {
        const svgEl = svgRef.value;
        if (!svgEl) return;

        const pt = svgEl.createSVGPoint();
        pt.x = evt.clientX; pt.y = evt.clientY;
        const ctm = svgEl.getScreenCTM();
        if (!ctm) return;
        const inv = ctm.inverse();
        const p = pt.matrixTransform(inv);

        const hoverRadius = 8;
        const r2 = hoverRadius * hoverRadius;

        let best = null;
        let bestD2 = Infinity;
        let sIdx = -1;

        drawableDataset.value.forEach((ds, i) => {
            ds.plots.forEach(plot => {
                const dx = plot.x - p.x;
                const dy = plot.y - p.y;
                const d2 = dx * dx + dy * dy;
                if (d2 <= r2 && d2 < bestD2) {
                    bestD2 = d2;
                    best = plot; sIdx = i;
                }
            });
        });

        if (best) {
            if (selectedPlotId.value !== best.id) {
                selectedPlotId.value = best.id;
                onTrapEnter(best, sIdx);
            }
        } else if (selectedPlotId.value) {
            const prev = selectedPlot.value;
            selectedPlotId.value = undefined;
            onTrapLeave(prev, sIdx);
        }
    };
}

const onPathMouseMove = onTrapMoveFactory();

function onPathMouseLeave() {
    if (selectedPlotId.value) {
        const prev = selectedPlot.value;
        selectedPlotId.value = undefined;
        onTrapLeave(prev, null);
    }
}
function onPathClick(_e) {
    const sp = selectedPlot.value;
    if (sp) {
        const i = drawableDataset.value.findIndex(ds => ds.id === sp.clusterId);
        onTrapClick(sp, i >= 0 ? i : 0);
    }
}

const tableComponent = computed(() => {
    const useDialog = FINAL_CONFIG.value.table.useDialog && !FINAL_CONFIG.value.table.show;
    const open = mutableConfig.value.showTable;
    return {
        component: useDialog ? BaseDraggableDialog : Accordion,
        title: `${FINAL_CONFIG.value.style.title.text}${FINAL_CONFIG.value.style.title.subtitle.text ? `: ${FINAL_CONFIG.value.style.title.subtitle.text}` : ''}`,
        props: useDialog ? {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            headerColor: FINAL_CONFIG.value.table.th.color,
            headerBg: FINAL_CONFIG.value.table.th.backgroundColor,
            isFullscreen: isFullscreen.value,
            fullscreenParent: scatterChart.value,
            forcedWidth: Math.min(800, window.innerWidth * 0.8),
            isCursorPointer: isCursorPointer.value
        } : {
            hideDetails: true,
            config: {
                open,
                maxHeight: 10000,
                body: {
                    backgroundColor: FINAL_CONFIG.value.style.backgroundColor,
                    color: FINAL_CONFIG.value.style.color
                },
                head: {
                    backgroundColor: FINAL_CONFIG.value.style.backgroundColor,
                    color: FINAL_CONFIG.value.style.color
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

const svgBg = computed(() => FINAL_CONFIG.value.style.backgroundColor);
const svgLegend = computed(() => FINAL_CONFIG.value.style.legend);
const svgTitle = computed(() => FINAL_CONFIG.value.style.title);

const { exportSvg, getSvg } = useSvgExport({
    svg: svgRef,
    title: svgTitle,
    legend: svgLegend,
    legendItems: datasetWithId,
    backgroundColor: svgBg
});

async function generateSvg({ isCb }) {
    isCallbackSvg.value = true;

    await nextTick();

    try {
        if (isCb) {
            const { blob, url, text, dataUrl } = await getSvg();
            await Promise.resolve(FINAL_CONFIG.value.userOptions.callbacks.svg({ blob, url, text, dataUrl }));
        } else {
            await Promise.resolve(exportSvg());
        }
    } finally {
        isCallbackSvg.value = false;
    }
}

function onGenerateImage(payload) {
    if (payload?.stage === "start") {
        isCallbackImaging.value = true;
        return;
    }

    if (payload?.stage === "end") {
        isCallbackImaging.value = false;
        return;
    }

    generateImage();
}

async function copyAlt(){
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: mutableDataset.value
    })
    if (!FINAL_CONFIG.value.userOptions.callbacks.altCopy) {
        console.warn('Vue Data UI - A callback must be set for `altCopy` in userOptions.');
        return
    }
    await Promise.resolve(FINAL_CONFIG.value.userOptions.callbacks.altCopy({ 
        config: FINAL_CONFIG.value, 
        dataset: mutableDataset.value
    }));
}

defineExpose({
    getData,
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    generateSvg,
    hideSeries,
    showSeries,
    toggleTable,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen,
    copyAlt
});

</script>

<template>
    <div :class="`vue-data-ui-component vue-ui-scatter ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`" ref="scatterChart" :id="`vue-ui-scatter_${uid}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.backgroundColor};${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.backgroundColor"
            :color="FINAL_CONFIG.style.color"
            :active="isAnnotator"
            :isCursorPointer="isCursorPointer"
            @close="toggleAnnotator"
        >
            <template #annotator-action-close>
                <slot name="annotator-action-close"/>
            </template>
            <template #annotator-action-color="{ color }">
                <slot name="annotator-action-color" v-bind="{ color }"/>
            </template>
            <template #annotator-action-draw="{ mode }">
                <slot name="annotator-action-draw" v-bind="{ mode }"/>
            </template>
            <template #annotator-action-undo="{ disabled }">
                <slot name="annotator-action-undo" v-bind="{ disabled }"/>
            </template>
            <template #annotator-action-redo="{ disabled }">
                <slot name="annotator-action-redo" v-bind="{ disabled }"/>
            </template>
            <template #annotator-action-delete="{ disabled }">
                <slot name="annotator-action-delete" v-bind="{ disabled }"/>
            </template>
        </PenAndPaper>

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.title.text" :style="`width:100%;background:transparent`">
            <!-- TITLE AS DIV -->
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'scatter-div-title',
                        ...FINAL_CONFIG.style.title
                    },
                    subtitle: {
                        cy: 'scatter-div-subtitle',
                        ...FINAL_CONFIG.style.title.subtitle
                    },
                }"
            />
        </div>

        <div :id="`legend-top-${uid}`" />

        <!-- OPTIONS -->
        <UserOptions
            ref="userOptionsRef"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.backgroundColor"
            :color="FINAL_CONFIG.style.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip && FINAL_CONFIG.style.tooltip.show"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :hasAltCopy="FINAL_CONFIG.userOptions.buttons.altCopy"
            :isTooltip="mutableConfig.showTooltip"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="scatterChart"
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
            <template #optionSvg v-if="$slots.optionSvg">
                <slot name="optionSvg" />
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
        <svg
            ref="svgRef"
            :xmlns="XMLNS"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen, 'animated': FINAL_CONFIG.useCssAnimation }"
            :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`"
            :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.color}`"
            @mouseleave="onMarginalLeave"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="0"
                :y="0"
                :width="svg.width <= 0 ? 10 : svg.width"
                :height="svg.height <= 0 ? 10 : svg.height"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>

            <!-- AXIS -->
            <g v-if="FINAL_CONFIG.style.layout.axis.show">
                <line
                    data-cy="scatter-y-axis"
                    :x1="zero.x"
                    :x2="zero.x"
                    :y1="drawingArea.top"
                    :y2="drawingArea.bottom"
                    :stroke="FINAL_CONFIG.style.layout.axis.stroke"
                    :stroke-width="FINAL_CONFIG.style.layout.axis.strokeWidth"
                    stroke-linecap="round"
                />
                <line
                    data-cy="scatter-x-axis"
                    :x1="drawingArea.left"
                    :x2="drawingArea.right"
                    :y1="zero.y"
                    :y2="zero.y"
                    :stroke="FINAL_CONFIG.style.layout.axis.stroke"
                    :stroke-width="FINAL_CONFIG.style.layout.axis.strokeWidth"
                    stroke-linecap="round"
                />
            </g>

            <!-- MARGINAL BARS -->
            <g v-if="FINAL_CONFIG.style.layout.marginalBars.show">
                <defs>
                    <linearGradient :id="`marginal_x_${uid}`" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" :stop-color="FINAL_CONFIG.style.layout.marginalBars.fill"/>
                        <stop offset="100%" :stop-color="FINAL_CONFIG.style.backgroundColor"/>
                    </linearGradient>
                    <linearGradient :id="`marginal_y_${uid}`" x1="0%" x2="100%" y1="0%" y2="0%">
                        <stop offset="0%" :stop-color="FINAL_CONFIG.style.backgroundColor"/>
                        <stop offset="100%" :stop-color="FINAL_CONFIG.style.layout.marginalBars.fill"/>
                    </linearGradient>
                </defs>
                <g v-for="(x, i) in marginalBars.x">
                    <rect
                        data-cy="marginal-bar-x"
                        v-if="x && marginalBars.avgX[i]"
                        :x="marginalBars.avgX[i] - (drawingArea.width / scale / 2)"
                        :y="drawingArea.top - FINAL_CONFIG.style.layout.marginalBars.offset - x / marginalBars.maxX * FINAL_CONFIG.style.layout.marginalBars.size"
                        :width="drawingArea.width / scale <= 0 ? 0.0001 : drawingArea.width / scale"
                        :height="x / marginalBars.maxX * FINAL_CONFIG.style.layout.marginalBars.size <= 0 ? 0.0001 : x / marginalBars.maxX * FINAL_CONFIG.style.layout.marginalBars.size"
                        :fill="FINAL_CONFIG.style.layout.marginalBars.useGradient ? `url(#marginal_x_${uid})` : FINAL_CONFIG.style.layout.marginalBars.fill"
                        :style="`opacity:${FINAL_CONFIG.style.layout.marginalBars.opacity}`"
                        :stroke="FINAL_CONFIG.style.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.layout.marginalBars.strokeWidth"
                        :rx="FINAL_CONFIG.style.layout.marginalBars.borderRadius"
                        style="pointer-events: none"
                    />
                    <!-- MARGINAL MOUSE TRAP (X) -->
                    <rect
                        v-if="marginalBars.avgX[i]"
                        :x="marginalBars.avgX[i] - (drawingArea.width / scale / 2)"
                        :y="drawingArea.top - FINAL_CONFIG.style.layout.marginalBars.offset - FINAL_CONFIG.style.layout.marginalBars.size"
                        :width="drawingArea.width / scale <= 0 ? 0.0001 : drawingArea.width / scale"
                        :height="Math.max(0.1, FINAL_CONFIG.style.layout.marginalBars.size)"
                        fill="transparent"
                        @mouseenter="onMarginalXEnter(i)"
                        @mouseleave="onMarginalLeave()"
                    />
                    <!-- MARGINAL HIGHLIGHTER (X) -->
                    <template  v-if="marginalBars.avgX[i] && selectedMarginalX != null && selectedMarginalX === i">
                        <g style="pointer-events: none;">
                            <rect 
                                :x="marginalBars.avgX[i] - (drawingArea.width / scale / 2)"
                                :y="drawingArea.top"
                                :width="drawingArea.width / scale <= 0 ? 0.0001 : drawingArea.width / scale"
                                :height="drawingArea.height"
                                :fill="FINAL_CONFIG.style.layout.marginalBars.highlighter.color"
                                :fill-opacity="FINAL_CONFIG.style.layout.marginalBars.highlighter.opacity"
                            />
                            <line
                                :x1="marginalBars.avgX[i] - (drawingArea.width / scale / 2)"
                                :x2="marginalBars.avgX[i] - (drawingArea.width / scale / 2)"
                                :y1="0"
                                :y2="drawingArea.top + drawingArea.height"
                                :stroke="FINAL_CONFIG.style.layout.marginalBars.highlighter.stroke"
                                :stroke-dasharray="FINAL_CONFIG.style.layout.marginalBars.highlighter.strokeDasharray"
                                :stroke-width="FINAL_CONFIG.style.layout.marginalBars.highlighter.strokeWidth"
                                :style="{ transition: 'none !important', animation: 'none !important' }"
                            />
                            <line
                                :x1="marginalBars.avgX[i] - (drawingArea.width / scale / 2) + (drawingArea.width / scale <= 0 ? 0.0001 : drawingArea.width / scale)"
                                :x2="marginalBars.avgX[i] - (drawingArea.width / scale / 2) + (drawingArea.width / scale <= 0 ? 0.0001 : drawingArea.width / scale)"
                                :y1="0"
                                :y2="drawingArea.top + drawingArea.height"
                                :stroke="FINAL_CONFIG.style.layout.marginalBars.highlighter.stroke"
                                :stroke-dasharray="FINAL_CONFIG.style.layout.marginalBars.highlighter.strokeDasharray"
                                :stroke-width="FINAL_CONFIG.style.layout.marginalBars.highlighter.strokeWidth"
                                :style="{ transition: 'none !important', animation: 'none !important' }"
                            />
                        </g>
                    </template>
                </g>
                <g v-for="(y, i) in marginalBars.y">
                    <rect
                        data-cy="marginal-bar-y"
                        v-if="y && marginalBars.avgY[i]"
                        :x="drawingArea.right + FINAL_CONFIG.style.layout.marginalBars.offset"
                        :y="marginalBars.avgY[i] - (drawingArea.height / scale / 2)"
                        :height="drawingArea.height / scale <= 0 ? 0.0001 : drawingArea.height / scale"
                        :width="y / marginalBars.maxY * FINAL_CONFIG.style.layout.marginalBars.size <= 0 ? 0.0001 : y / marginalBars.maxY * FINAL_CONFIG.style.layout.marginalBars.size"
                        :fill="FINAL_CONFIG.style.layout.marginalBars.useGradient ? `url(#marginal_y_${uid})` : FINAL_CONFIG.style.layout.marginalBars.fill"
                        :style="`opacity:${FINAL_CONFIG.style.layout.marginalBars.opacity}`"
                        :stroke="FINAL_CONFIG.style.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.layout.marginalBars.strokeWidth"
                        :rx="FINAL_CONFIG.style.layout.marginalBars.borderRadius"
                        style="pointer-events: none"
                    />
                    <!-- MARGINAL MOUSE TRAP (Y) -->
                    <rect
                        v-if="marginalBars.avgY[i]"
                        :x="drawingArea.right + FINAL_CONFIG.style.layout.marginalBars.offset"
                        :y="marginalBars.avgY[i] - (drawingArea.height / scale / 2)"
                        :width="Math.max(0.1, FINAL_CONFIG.style.layout.marginalBars.size)"
                        :height="drawingArea.height / scale <= 0 ? 0.0001 : drawingArea.height / scale"
                        fill="transparent"
                        @mouseenter="onMarginalYEnter(i)"
                        @mouseleave="onMarginalLeave()"
                    />
                    <!-- MARGINAL HIGHLIGHTER (X) -->
                    <template v-if="marginalBars.avgY[i] && selectedMarginalY != null && selectedMarginalY === i">
                        <g style="pointer-events: none;">
                            <rect 
                                :x="drawingArea.left"
                                :y="marginalBars.avgY[i] - (drawingArea.height / scale / 2)"
                                :width="drawingArea.width"
                                :height="drawingArea.height / scale <= 0 ? 0.0001 : drawingArea.height / scale"
                                :fill="FINAL_CONFIG.style.layout.marginalBars.highlighter.color"
                                :fill-opacity="FINAL_CONFIG.style.layout.marginalBars.highlighter.opacity"
                            />
                            <line
                                :x1="drawingArea.left"
                                :x2="svg.width"
                                :y1="marginalBars.avgY[i] - (drawingArea.height / scale / 2)"
                                :y2="marginalBars.avgY[i] - (drawingArea.height / scale / 2)"
                                :stroke="FINAL_CONFIG.style.layout.marginalBars.highlighter.stroke"
                                :stroke-dasharray="FINAL_CONFIG.style.layout.marginalBars.highlighter.strokeDasharray"
                                :stroke-width="FINAL_CONFIG.style.layout.marginalBars.highlighter.strokeWidth"
                                :style="{ transition: 'none !important', animation: 'none !important' }"
                            />
                            <line
                                :x1="drawingArea.left"
                                :x2="svg.width"
                                :y1="marginalBars.avgY[i] - (drawingArea.height / scale / 2) + (drawingArea.height / scale <= 0 ? 0.0001 : drawingArea.height / scale)"
                                :y2="marginalBars.avgY[i] - (drawingArea.height / scale / 2) + (drawingArea.height / scale <= 0 ? 0.0001 : drawingArea.height / scale)"
                                :stroke="FINAL_CONFIG.style.layout.marginalBars.highlighter.stroke"
                                :stroke-dasharray="FINAL_CONFIG.style.layout.marginalBars.highlighter.strokeDasharray"
                                :stroke-width="FINAL_CONFIG.style.layout.marginalBars.highlighter.strokeWidth"
                                :style="{ transition: 'none !important', animation: 'none !important' }"
                            />
                        </g>
                    </template>
                </g>
                <g v-if="FINAL_CONFIG.style.layout.marginalBars.showLines" style="pointer-events: none;">
                    <template v-for="line in marginalLines">                   
                        <path
                            data-cy="marginal-line-x-wrapper"
                            v-if="!segregated.includes(line.id)"
                            :d="`M ${line.dX}`"
                            :stroke="FINAL_CONFIG.style.backgroundColor"
                            :stroke-width="FINAL_CONFIG.style.layout.marginalBars.linesStrokeWidth + 1"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            fill="none"
                        />
                        <path
                            data-cy="marginal-line-x"
                            v-if="!segregated.includes(line.id)"
                            :d="`M ${line.dX}`"
                            :stroke="line.color"
                            :stroke-width="FINAL_CONFIG.style.layout.marginalBars.linesStrokeWidth"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            fill="none"
                        />
                        <path
                            data-cy="marginal-line-y-wrapper"
                            v-if="!segregated.includes(line.id)"
                            :d="`M ${line.dY}`"
                            :stroke="FINAL_CONFIG.style.backgroundColor"
                            :stroke-width="FINAL_CONFIG.style.layout.marginalBars.linesStrokeWidth + 1"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            fill="none"
                        />
                        <path
                            data-cy="marginal-line-y"
                            v-if="!segregated.includes(line.id)"
                            :d="`M ${line.dY}`"
                            :stroke="line.color"
                            :stroke-width="FINAL_CONFIG.style.layout.marginalBars.linesStrokeWidth"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            fill="none"
                        />
                    </template>
                </g>
            </g>

            <!-- GIFT WRAP -->
            <g v-if="FINAL_CONFIG.style.layout.plots.giftWrap.show">
                <g v-for="(ds, i) in drawableDataset">
                    <polygon 
                        v-if="ds.plots.length > 2"
                        :points="giftWrap({series: ds.plots})"
                        :fill="setOpacity(ds.color, FINAL_CONFIG.style.layout.plots.giftWrap.fillOpacity * 100)"
                        :stroke-width="FINAL_CONFIG.style.layout.plots.giftWrap.strokeWidth"
                        :stroke-dasharray="FINAL_CONFIG.style.layout.plots.giftWrap.strokeDasharray"
                        :stroke="ds.color"
                        stroke-linejoin="round"
                        stroke-linecap="round"
                    />
                </g>
            </g>

            <!-- PLOTS -->
            <template v-if="!FINAL_CONFIG.usePerformanceMode">
                <g v-for="(ds, i) in drawableDataset">
                    <g v-if="!ds.shape || ds.shape === 'circle'">
                        <circle 
                            v-for="(plot, j) in ds.plots"
                            data-cy="atom-shape"
                            :cx="plot.x"
                            :cy="plot.y"
                            :r="selectedPlotId && selectedPlotId === plot.id ? plot.weight * 2 : plot.weight"
                            :fill="setOpacity(ds.color, FINAL_CONFIG.style.layout.plots.opacity * 100)"
                            :stroke="FINAL_CONFIG.style.layout.plots.stroke"
                            :stroke-width="FINAL_CONFIG.style.layout.plots.strokeWidth"
                            :style="`opacity:${selectedPlotId && selectedPlotId === plot.id ? 1 : FINAL_CONFIG.style.layout.plots.significance.useDistanceOpacity ? (1 - (Math.abs(plot.deviation) / maxDeviation)) : FINAL_CONFIG.style.layout.plots.significance.show && Math.abs(plot.deviation) > FINAL_CONFIG.style.layout.plots.significance.deviationThreshold ? FINAL_CONFIG.style.layout.plots.significance.opacity : 1}`"
                            @mouseover="onTrapEnter(plot, i)"
                            @mouseleave="onTrapLeave(plot, i)"
                            @click="onTrapClick(plot, i)"
                        />
                    </g>
                    <g v-else>
                        <Shape
                            v-for="(plot, j) in ds.plots"
                            :plot="{x: plot.x, y: plot.y }"
                            :radius="selectedPlotId && selectedPlotId === plot.id ? plot.weight * 2 : plot.weight"
                            :shape="ds.shape"
                            :color="setOpacity(ds.color, FINAL_CONFIG.style.layout.plots.opacity * 100)"
                            :stroke="FINAL_CONFIG.style.layout.plots.stroke"
                            :strokeWidth="FINAL_CONFIG.style.layout.plots.strokeWidth"
                            :style="`opacity:${selectedPlotId && selectedPlotId === plot.id ? 1 : FINAL_CONFIG.style.layout.plots.significance.useDistanceOpacity ? (1 - (Math.abs(plot.deviation) / maxDeviation)) : FINAL_CONFIG.style.layout.plots.significance.show && Math.abs(plot.deviation) > FINAL_CONFIG.style.layout.plots.significance.deviationThreshold ? FINAL_CONFIG.style.layout.plots.significance.opacity : 1}`"
                            @mouseover="onTrapEnter(plot, i)"
                            @mouseleave="onTrapLeave(plot, i)"
                            @click="onTrapClick(plot, i)"
                        />
                    </g>
                </g>
            </template>

            <!-- PLOTS (PERFORMANCE MODE : ONE PATH PER SERIES) -->
            <template v-if="FINAL_CONFIG.usePerformanceMode">
                <g :clip-path="`url(#clip_path_${uid})`">
                    <path
                        data-cy="performance-path"
                        v-for="sp in seriesPaths"
                        :key="sp.id"
                        :d="sp.d"
                        :fill="sp.fill"
                        :stroke="sp.stroke"
                        :stroke-width="sp.strokeWidth"
                        :stroke-opacity="sp.strokeOpacity"
                        vector-effect="non-scaling-stroke"
                        paint-order="fill"
                    />
                </g>

                <!-- SINGLE SELECTED PLOT -->
                <g v-if="selectedPlot && FINAL_CONFIG.style.layout.plots.selectors.show" style="pointer-events:none">
                    <Shape
                        data-cy="performance-selected-plot"
                        :shape="selectedPlot.shape || 'circle'"
                        :color="selectedPlot.color"
                        :plot="{ x: selectedPlot.x, y: selectedPlot.y }"
                        :radius="Math.max((4 * SHAPES_RADIUS_SCALE[selectedPlot.shape || 'circle']), selectedPlot.weight * 2)"
                        :stroke="FINAL_CONFIG.style.layout.plots.stroke"
                        :strokeWidth="FINAL_CONFIG.style.layout.plots.strokeWidth"
                    />
                </g>

                <!-- MOUSE TRAP -->
                <rect
                    data-cy="performance-trap"
                    :x="drawingArea.left"
                    :y="drawingArea.top"
                    :width="Math.max(0.0001, drawingArea.width)"
                    :height="Math.max(0.0001, drawingArea.height)"
                    fill="transparent"
                    @mousemove="onPathMouseMove"
                    @mouseleave="onPathMouseLeave"
                    @click="onPathClick"
                />
            </template>

            <!-- SELECTORS -->
            <g v-if="selectedPlot && FINAL_CONFIG.style.layout.plots.selectors.show" style="pointer-events: none !important;">
                <line
                    data-cy="selector-line-x"
                    :x1="zero.x"
                    :x2="selectedPlot.x"
                    :y1="selectedPlot.y"
                    :y2="selectedPlot.y"
                    :stroke="FINAL_CONFIG.style.layout.plots.selectors.stroke"
                    :stroke-width="FINAL_CONFIG.style.layout.plots.selectors.strokeWidth"
                    :stroke-dasharray="FINAL_CONFIG.style.layout.plots.selectors.strokeDasharray"
                    stroke-linecap="round"
                    class="line-pointer"
                />
                <line
                    data-cy="selector-line-y"
                    :x1="selectedPlot.x"
                    :x2="selectedPlot.x"
                    :y1="zero.y"
                    :y2="selectedPlot.y"
                    :stroke="FINAL_CONFIG.style.layout.plots.selectors.stroke"
                    :stroke-width="FINAL_CONFIG.style.layout.plots.selectors.strokeWidth"
                    :stroke-dasharray="FINAL_CONFIG.style.layout.plots.selectors.strokeDasharray"
                    stroke-linecap="round"
                    class="line-pointer"
                />
                <text
                    data-cy="selector-label-x"
                    :x="zero.x + (selectedPlot.x > zero.x ? -6 : 6)"
                    :y="selectedPlot.y + FINAL_CONFIG.style.layout.plots.selectors.labels.fontSize / 3"
                    :font-size="FINAL_CONFIG.style.layout.plots.selectors.labels.fontSize"
                    :fill="FINAL_CONFIG.style.layout.plots.selectors.labels.color"
                    :font-weight="FINAL_CONFIG.style.layout.plots.selectors.labels.bold ? 'bold' : 'normal'"
                    :text-anchor="selectedPlot.x > zero.x ? 'end' : 'start'"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.layout.plots.selectors.labels.y.formatter,
                        checkNaN(selectedPlot.v.y),
                        dataLabel({
                            p: FINAL_CONFIG.style.layout.plots.selectors.labels.prefix,
                            v: checkNaN(selectedPlot.v.y),
                            s: FINAL_CONFIG.style.layout.plots.selectors.labels.suffix,
                            r: FINAL_CONFIG.style.layout.plots.selectors.labels.rounding
                        }),
                        { datapoint: selectedPlot }
                    ) }}
                </text>
                <text
                    data-cy="selector-label-y"
                    :x="selectedPlot.x"
                    :y="zero.y + (selectedPlot.y > zero.y ? - 6 : FINAL_CONFIG.style.layout.plots.selectors.labels.fontSize +6)"
                    :font-size="FINAL_CONFIG.style.layout.plots.selectors.labels.fontSize"
                    :fill="FINAL_CONFIG.style.layout.plots.selectors.labels.color"
                    :font-weight="FINAL_CONFIG.style.layout.plots.selectors.labels.bold ? 'bold' : 'normal'"
                    :text-anchor="'middle'"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.layout.plots.selectors.labels.y.formatter,
                        checkNaN(selectedPlot.v.x),
                        dataLabel({
                            p: FINAL_CONFIG.style.layout.plots.selectors.labels.prefix,
                            v: checkNaN(selectedPlot.v.x),
                            s: FINAL_CONFIG.style.layout.plots.selectors.labels.suffix,
                            r: FINAL_CONFIG.style.layout.plots.selectors.labels.rounding
                        }),
                        { datapoint: selectedPlot }
                    ) }}
                </text>
                <circle
                    data-cy="selector-circle-marker"
                    :cx="zero.x"
                    :cy="selectedPlot.y"
                    :r="FINAL_CONFIG.style.layout.plots.selectors.markers.radius"
                    :fill="FINAL_CONFIG.style.layout.plots.selectors.markers.fill"
                    :stroke="FINAL_CONFIG.style.layout.plots.selectors.markers.stroke"
                    :stroke-width="FINAL_CONFIG.style.layout.plots.selectors.markers.strokeWidth"
                    class="line-pointer"
                />
                <circle
                    data-cy="selector-circle-marker"
                    :cx="selectedPlot.x"
                    :cy="zero.y"
                    :r="FINAL_CONFIG.style.layout.plots.selectors.markers.radius"
                    :fill="FINAL_CONFIG.style.layout.plots.selectors.markers.fill"
                    :stroke="FINAL_CONFIG.style.layout.plots.selectors.markers.stroke"
                    :stroke-width="FINAL_CONFIG.style.layout.plots.selectors.markers.strokeWidth"
                    class="line-pointer"
                />
                <text
                    data-cy="selector-datapoint-name"
                    v-if="FINAL_CONFIG.style.layout.plots.selectors.labels.showName"
                    :x="selectedPlot.x"
                    :y="selectedPlot.y + (selectedPlot.y < zero.y ? - FINAL_CONFIG.style.layout.plots.selectors.labels.fontSize /2 : FINAL_CONFIG.style.layout.plots.selectors.labels.fontSize)"
                    :font-size="FINAL_CONFIG.style.layout.plots.selectors.labels.fontSize"
                    :fill="FINAL_CONFIG.style.layout.plots.selectors.labels.color"
                    :font-weight="FINAL_CONFIG.style.layout.plots.selectors.labels.bold ? 'bold' : 'normal'"
                    :text-anchor="selectedPlot.x < drawingArea.left + 100 ? 'start' : selectedPlot.x > drawingArea.right - 100 ? 'end' : selectedPlot.x > zero.x ? 'start' : 'end'"
                >
                    {{ selectedPlot.v.name }}
                </text>
            </g>

            <!-- AXIS LABELS -->
            <g v-if="FINAL_CONFIG.style.layout.dataLabels.xAxis.show" ref="xAxisLabelLeft">
                <!-- X NAME -->
                <text
                    data-cy="scatter-x-label-name"
                    :id="`vue-ui-scatter-xAxis-label-${uid}`"
                    :transform="`translate(${FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize}, ${drawingArea.top + drawingArea.height / 2}), rotate(-90)`" 
                    text-anchor="middle"
                    :font-size="FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize"
                    :font-weight="FINAL_CONFIG.style.layout.dataLabels.xAxis.bold ? 'bold' : 'normal'"
                    :fill="FINAL_CONFIG.style.layout.dataLabels.xAxis.color"
                >
                    {{ FINAL_CONFIG.style.layout.dataLabels.xAxis.name }}
                </text>
                <!-- X MIN -->
                <text
                    data-cy="scatter-x-min-axis-label"
                    text-anchor="middle"
                    :font-size="FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize"
                    :fill="FINAL_CONFIG.style.layout.dataLabels.xAxis.color"
                    :transform="`translate(${FINAL_CONFIG.style.layout.dataLabels.xAxis.name ? FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize * 3 : 0}, ${zero.y + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 3}), rotate(-90)`" 
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.layout.plots.selectors.labels.x.formatter,
                        checkNaN(extremes.xMin),
                        dataLabel({
                            p: FINAL_CONFIG.style.layout.plots.selectors.labels.prefix,
                            v: checkNaN(extremes.xMin),
                            s: FINAL_CONFIG.style.layout.plots.selectors.labels.suffix,
                            r: FINAL_CONFIG.style.layout.dataLabels.xAxis.rounding
                        })) 
                    }}
                </text>
            </g>
            <!-- X MAX -->
            <text
                v-if="FINAL_CONFIG.style.layout.dataLabels.xAxis.show"
                ref="xAxisLabelRight"
                data-cy="scatter-x-max-axis-label"
                text-anchor="middle"
                :transform="`translate(${drawingArea.right + FINAL_CONFIG.style.layout.padding.right + 6}, ${zero.y + FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize / 3}), rotate(-90)`" 
                :font-size="FINAL_CONFIG.style.layout.dataLabels.xAxis.fontSize"
                :fill="FINAL_CONFIG.style.layout.dataLabels.xAxis.color"
            >
                {{ applyDataLabel(
                    FINAL_CONFIG.style.layout.plots.selectors.labels.x.formatter,
                    checkNaN(extremes.xMax),
                    dataLabel({
                        p: FINAL_CONFIG.style.layout.plots.selectors.labels.prefix,
                        v: checkNaN(extremes.xMax),
                        s: FINAL_CONFIG.style.layout.plots.selectors.labels.suffix,
                        r: FINAL_CONFIG.style.layout.dataLabels.xAxis.rounding
                    })) 
                }}
            </text>

            <!-- Y AXIS LABELS -->
            <text
                v-if="FINAL_CONFIG.style.layout.dataLabels.yAxis.show"
                ref="yAxisLabelTop"
                data-cy="scatter-y-max-axis-label"
                :x="zero.x"
                :y="drawingArea.top - FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize"
                text-anchor="middle"
                :font-size="FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize"
                :fill="FINAL_CONFIG.style.layout.dataLabels.yAxis.color"
            >
                {{ applyDataLabel(
                    FINAL_CONFIG.style.layout.plots.selectors.labels.y.formatter,
                    checkNaN(extremes.yMax),
                    dataLabel({
                        p: FINAL_CONFIG.style.layout.plots.selectors.labels.prefix,
                        v: checkNaN(extremes.yMax),
                        s: FINAL_CONFIG.style.layout.plots.selectors.labels.suffix,
                        r: FINAL_CONFIG.style.layout.dataLabels.yAxis.rounding
                    })) 
                }}
            </text>

            <g v-if="FINAL_CONFIG.style.layout.dataLabels.yAxis.show" ref="yAxisLabelBottom">
                <!-- Y MIN -->
                <text
                    data-cy="scatter-y-min-axis-label"
                    :x="zero.x"
                    :y="svg.height - FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize * 2"
                    text-anchor="middle"
                    :font-size="FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize"
                    :fill="FINAL_CONFIG.style.layout.dataLabels.yAxis.color"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.layout.plots.selectors.labels.y.formatter,
                        checkNaN(extremes.yMin),
                        dataLabel({
                            p: FINAL_CONFIG.style.layout.plots.selectors.labels.prefix,
                            v: checkNaN(extremes.yMin),
                            s: FINAL_CONFIG.style.layout.plots.selectors.labels.suffix,
                            r: FINAL_CONFIG.style.layout.dataLabels.yAxis.rounding
                        })) 
                    }}
                </text>
                <!-- Y NAME -->
                <text
                    data-cy="scatter-y-label-name"
                    text-anchor="middle"
                    :font-size="FINAL_CONFIG.style.layout.dataLabels.yAxis.fontSize"
                    :font-weight="FINAL_CONFIG.style.layout.dataLabels.yAxis.bold ? 'bold' : 'normal'"
                    :fill="FINAL_CONFIG.style.layout.dataLabels.yAxis.color"
                    :x="drawingArea.left + drawingArea.width / 2"
                    :y="svg.height"
                >
                    {{ FINAL_CONFIG.style.layout.dataLabels.yAxis.name }}
                </text>
            </g>

            <clipPath :id="`clip_path_${uid}`">
                <rect
                    :x="drawingArea.left"
                    :y="drawingArea.top"
                    :width="drawingArea.width <= 0 ? 0.0001 : drawingArea.width"
                    :height="drawingArea.height <= 0 ? 0.0001 : drawingArea.height"
                />
            </clipPath>

            <!-- CORRELATION -->
            <g v-if="FINAL_CONFIG.style.layout.correlation.show" :style="{ pointerEvents: 'none' }">
                <line 
                    v-for="(ds, i) in drawableDataset"
                    data-cy="correlation-line"
                    :x1="ds.correlation.x1"
                    :x2="ds.correlation.x2"
                    :y1="ds.correlation.y1"
                    :y2="ds.correlation.y2"
                    :stroke-dasharray="FINAL_CONFIG.style.layout.correlation.strokeDasharray"
                    :stroke="ds.color"
                    :stroke-width="FINAL_CONFIG.style.layout.correlation.strokeWidth"
                    :clip-path="`url(#clip_path_${uid})`"
                />
                <g v-for="(ds, i) in drawableDataset">
                    <text
                        data-cy="correlation-label"
                        v-if="FINAL_CONFIG.style.layout.correlation.label.show"
                        :x="ds.correlation.x2"
                        :y="ds.correlation.y2"
                        :fill="FINAL_CONFIG.style.layout.correlation.label.useSerieColor ? ds.color : FINAL_CONFIG.style.layout.correlation.label.color"
                        text-anchor="end"
                        :font-size="FINAL_CONFIG.style.layout.correlation.label.fontSize"
                        :font-weight="FINAL_CONFIG.style.layout.correlation.label.bold ? 'bold' : 'normal'"
                    >
                        {{ dataLabel({
                            v: checkNaN(ds.correlation.coefficient),
                            r: FINAL_CONFIG.style.layout.correlation.label.roundingValue
                        }) }}
                    </text>
                </g>
            </g>
            <slot name="svg" :svg="{
                ...svg,
                drawingArea: {
                    ...drawingArea,
                    zero
                },
                data: mutableDataset,
                isPrintingImg: isPrinting | isImaging | isCallbackImaging,
                isPrintingSvg: isCallbackSvg,
            }"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging || isCallbackImaging || isCallbackSvg }"/>
        </div>

        <div :id="`legend-bottom-${uid}`" />

        <!-- LEGEND -->
        <Teleport v-if="readyTeleport" :to="FINAL_CONFIG.style.legend.position === 'top' ? `#legend-top-${uid}` : `#legend-bottom-${uid}`">
            <div ref="chartLegend">
                <Legend
                    v-if="FINAL_CONFIG.style.legend.show"
                    :key="`legend_${legendStep}`"
                    :legendSet="datasetWithId"
                    :config="legendConfig"
                    :isCursorPointer="isCursorPointer"
                    @clickMarker="({ legend }) => segregate(legend.id)"
                >
                    <template #item="{ legend }">
                        <div @click="legend.segregate()" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                            {{ legend.name }}
                        </div>
                    </template>

                    <template #legendToggle>
                        <BaseLegendToggle
                            v-if="datasetWithId.length > 2 && FINAL_CONFIG.style.legend.selectAllToggle.show && !loading"
                            :backgroundColor="FINAL_CONFIG.style.legend.selectAllToggle.backgroundColor"
                            :color="FINAL_CONFIG.style.legend.selectAllToggle.color"
                            :fontSize="FINAL_CONFIG.style.legend.fontSize"
                            :checked="segregated.length > 0"
                            :isCursorPointer="isCursorPointer"
                            @toggle="toggleLegend"
                        />
                    </template>
                </Legend>
                <slot v-else name="legend" v-bind:legend="datasetWithId"></slot>
            </div>
        </Teleport>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- TOOLTIP -->
        <Tooltip
            :teleportTo="FINAL_CONFIG.style.tooltip.teleportTo"
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
            :parent="scatterChart"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="FINAL_CONFIG.style.tooltip.customFormat && typeof FINAL_CONFIG.style.tooltip.customFormat === 'function'"
            :smooth="FINAL_CONFIG.style.tooltip.smooth"
            :backdropFilter="FINAL_CONFIG.style.tooltip.backdropFilter"
            :smoothForce="FINAL_CONFIG.style.tooltip.smoothForce"
            :smoothSnapThreshold="FINAL_CONFIG.style.tooltip.smoothSnapThreshold"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <div style="width: 100%; display: flex; align-items:center;justify-content:center;" v-if="FINAL_CONFIG.style.tooltip.showShape">
                <svg viewBox="0 0 20 20" height="20" width="20" style="overflow: hidden;background:transparent;">
                    <Shape 
                        :shape="selectedPlot.shape"
                        :color="selectedPlot.color"
                        :plot="{x: 10, y: 10}"
                        :radius="7"
                    />
                </svg>
            </div>
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
                <button 
                    tabindex="0" 
                    class="vue-ui-user-options-button" 
                    @click="generateCsv(FINAL_CONFIG.userOptions.callbacks.csv)"
                    :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
                >
                    <BaseIcon name="fileCsv" :stroke="tableComponent.props.color"/>
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
                    :isCursorPointer="isCursorPointer"
                    @close="closeTable"
                >
                    <template #th="{ th }">
                        {{ th }}
                    </template>
                    <template #td="{ td }">
                        <div v-if="td.shape">
                            <span>{{ td.content }}</span>
                        </div>
                        <div v-else v-html="td"/>
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
@import "../vue-data-ui.css";

.vue-ui-scatter *{
    transition: unset;
}
.vue-ui-scatter {
    user-select: none;
    position: relative;
}

.animated path,
.animated line:not(.line-pointer),
.animated circle:not(.line-pointer) {
    animation: verticalBarAnimation 0.5s ease-in-out !important;
    transform-origin: center !important;
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
.vue-ui-scatter .vue-ui-scatter-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}

/** */
.vue-ui-scatter-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    max-width: 300px;
    position: fixed;
    padding:12px;
    z-index:1;
}

.vue-ui-scatter table {
    width: 100%;
    border-collapse:collapse;
}
.vue-ui-scatter table td {
    text-align:right;
    padding-right: 6px;
    font-variant-numeric: tabular-nums;
}
.vue-ui-scatter table th {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
}
</style>