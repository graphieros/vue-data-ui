<script setup>
import { 
    computed, 
    defineAsyncComponent, 
    nextTick, 
    onMounted, 
    ref, 
    toRefs,
    watch, 
} from "vue";
import {
    applyDataLabel,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createSpiralPath,
    createUid,
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    getMissingDatasetAttributes,
    isFunction,
    objectIsEmpty, 
    palette,
    sanitizeArray,
    themePalettes,
    treeShake,
    XMLNS
} from "../lib";
import{
    buildValuePercentageLabel,
} from "../labelUtils";
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
import img from "../img";
import Title from "../atoms/Title.vue";
import Legend from "../atoms/Legend.vue";
import themes from "../themes/vue_ui_galaxy.json";
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

const { vue_ui_galaxy: DEFAULT_CONFIG } = useConfig();
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

const uid = ref(createUid());
const galaxyChart = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const selectedSerie = ref(null);
const step = ref(0);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);
const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const resizeObserver = ref(null);
const observedEl = ref(null);
const readyTeleport = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);
const isCallbackImaging = ref(false);
const isCallbackSvg = ref(false);

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

const FINAL_CONFIG = ref(prepareConfig());

const isCursorPointer = computed(() => FINAL_CONFIG.value.userOptions.useCursorPointer);

const skeletonConfig = computed(() => {
    return treeShake({
        defaultConfig: {
            userOptions: { show: false },
            table: { show: false },
            useCssAnimation: false,
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    legend: {
                        backgroundColor: 'transparent'
                    }
                }
            }
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {}
    })
})

const { loading, FINAL_DATASET } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    callback: () => {
        Promise.resolve().then(async () => {
            await nextTick();
            mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        });
    },
    skeletonDataset: props.config?.skeletonDataset ?? [
        { name: '_', values: [21], color: '#DBDBDB'},
        { name: '_', values: [13], color: '#C4C4C4'},
        { name: '_', values: [8], color: '#ADADAD'},
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value
    })
})

onMounted(() => {
    readyTeleport.value = true;
    prepareChart();
});

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiGalaxy',
            type: 'dataset',
            debug: debug.value
        })
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['name', 'values']
            }).forEach(attr => {
                error({
                    componentName: 'VueUiGalaxy',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i,
                    debug: debug.value
                })
            })
        })
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: galaxyChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
                noTitle: noTitle.value,
                source: source.value
            });

            requestAnimationFrame(() => {
                WIDTH.value = Math.max(0.1, width);
                HEIGHT.value = Math.max(0.1, height - 12);
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = galaxyChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }
}

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

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
    FINAL_CONFIG.value = prepareConfig();
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
    legendStep.value += 1;

    // Reset mutable config
    mutableConfig.value.dataLabels.show = FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.show;
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.chart.tooltip.show;
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `galaxy_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-galaxy',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})

const mutableConfig = ref({
    dataLabels: {
        show: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.show,
    },
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
});

const WIDTH = ref(250);
const HEIGHT = ref(180);
const X = ref(0);
const Y = ref(0);

const svg = computed(() => ({
    width: WIDTH.value,
    height: HEIGHT.value,
    viewBox: `${X.value} ${Y.value} ${WIDTH.value} ${HEIGHT.value}`
}));


const emit = defineEmits(['selectLegend', 'selectDatapoint', 'copyAlt']);

const segregated = ref([]);

function toggleLegend() {
    if (segregated.value.length) {
        segregated.value = [];
    } else {
        legendSet.value.forEach(l => {
            segregated.value.push(l.id);
        });
    }
}

function segregate(datapoint) {
    if(segregated.value.includes(datapoint.id)) {
        segregated.value = segregated.value.filter(s => s !== datapoint.id);
    }else {
        segregated.value.push(datapoint.id);
    }
    emit('selectLegend', galaxySet.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color,
            value: ds.value
        }
    }));
}

function validSeriesToToggle(name) {
    if (!immutableSet.value.length) {
        if (FINAL_CONFIG.value.debug) {
            console.warn('VueUiGalaxy - There are no series to show.');
        }
        return null;
    }
    const dp = immutableSet.value.find(d => d.name === name);
    if (!dp) {
        if (FINAL_CONFIG.value.debug) {
            console.warn(`VueUiGalaxy - Series name not found "${name}"`);
        }
        return null;
    }
    return dp;
}

function showSeries(name) {
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (segregated.value.includes(dp.id)) {
        segregate({ id : dp.id });
    }
}

function hideSeries(name) {
    const dp  = validSeriesToToggle(name);
    if (dp === null) return;
    if (!segregated.value.includes(dp.id))  {
        segregate({ id: dp.id });
    }
}

const immutableSet = computed(() => {
    return FINAL_DATASET.value
        .map((serie, i) => {
            return {
                name: serie.name,
                color: convertColorToHex(serie.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
                value: serie.values ? sanitizeArray(serie.values).reduce((a,b) => a + b, 0) : 0,
                absoluteValues: sanitizeArray(serie.values),
                id: createUid(),
            }
        })
        .sort((a,b) => b.value - a.value).map((d, i) => {
            return {
                ...d,
                absoluteIndex: i
            }
        })
});

function getData() {
    return immutableSet.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color,
            value: ds.value
        }
    });
}

const total = computed(() => {
    return immutableSet.value.filter((ds) => !segregated.value.includes(ds.id)).map(ds => ds.value).reduce((a, b) => a + b, 0);
});

const maxPath = ref(190);

const segregatedSet = computed(() => {
    return immutableSet.value.filter(ds => !segregated.value.includes(ds.id))
});

const effectivePadding = computed(() =>
    (FINAL_CONFIG.value.style.chart.layout.arcs.strokeWidth +
    FINAL_CONFIG.value.style.chart.layout.arcs.borderWidth) / 2 +
    (FINAL_CONFIG.value.style.chart.layout.padding ?? 12)
);

const toSpiralPath = computed(() => {
    return createSpiralPath({
        maxPoints: maxPath.value,
        a: FINAL_CONFIG.value.style.chart.layout.arcs.a ?? 6,
        b: FINAL_CONFIG.value.style.chart.layout.arcs.b ?? 6,
        angleStep: FINAL_CONFIG.value.style.chart.layout.arcs.angleStep ?? 0.07,
        startX: svg.value.width / 2 + FINAL_CONFIG.value.style.chart.layout.arcs.offsetX,
        startY: svg.value.height / 2 + FINAL_CONFIG.value.style.chart.layout.arcs.offsetY,
        boxWidth: svg.value.width,
        boxHeight: svg.value.height,
        padding: effectivePadding.value
    })
});

const galaxySet = computed(() => {
    const res = [];
    for (let i = 0; i < segregatedSet.value.length; i += 1) {
        const serie = segregatedSet.value[i];
        const endPoints =
        ((serie.value / total.value) * maxPath.value) +
        (i > 0 && res.length ? res[i - 1].points : 0);

        res.push({
            points: endPoints,
            ...serie,
            seriesIndex: i,
            proportion: serie.value / total.value,
            path: toSpiralPath.value(endPoints)
        });
    }
    return res
        .filter(dp => !segregated.value.includes(dp.id))
        .toSorted((a, b) => b.points - a.points);
});

function getStrokeWidth(datapoint) {
    const size = Math.min(WIDTH.value, HEIGHT.value);
    
    const mult = selectedSerie.value === datapoint.id && FINAL_CONFIG.value.style.chart.layout.arcs.hoverEffect.show ? FINAL_CONFIG.value.style.chart.layout.arcs.hoverEffect.multiplicator : 1;

    const border = (FINAL_CONFIG.value.style.chart.layout.arcs.strokeWidth + FINAL_CONFIG.value.style.chart.layout.arcs.borderWidth) * mult;
    const path = FINAL_CONFIG.value.style.chart.layout.arcs.strokeWidth * mult;
    const blur =  (FINAL_CONFIG.value.style.chart.layout.arcs.strokeWidth / 2) * mult;

    return {
        border: border / 180 * size,
        path: path / 180 * size,
        blur: blur / 180 * size
    }
}

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const dataTooltipSlot = ref(null);

function onTrapLeave(datapoint) {
    isTooltip.value = false;
    selectedSerie.value = null;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex: datapoint.absoluteIndex });
    }
}

function onTrapClick(datapoint) {
    emit('selectDatapoint', datapoint);
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex: datapoint.absoluteIndex });
    }
}

function buildLabel({
    val,
    percentage,
    showVal,
    showPercentage,
}) {
    const cfg = FINAL_CONFIG.value.style.chart.layout.labels.dataLabels;
    return buildValuePercentageLabel({
        config: cfg,
        val,
        percentage,
        showVal,
        showPercentage
    })
} 

function useTooltip({ datapoint, _relativeIndex, seriesIndex, show=false }) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex: datapoint.absoluteIndex });
    }

    dataTooltipSlot.value = {
        datapoint,
        seriesIndex,
        series: immutableSet.value,
        config: FINAL_CONFIG.value
    }

    isTooltip.value = show;
    selectedSerie.value = datapoint.id;
    let html = "";
    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

    if(isFunction(customFormat) && functionReturnsString(() => customFormat({
        seriesIndex,
        datapoint,
        series: immutableSet.value,
        config: FINAL_CONFIG.value
    }))) {
        tooltipContent.value = customFormat({
            seriesIndex,
            datapoint,
            series: immutableSet.value,
            config: FINAL_CONFIG.value
        })
    } else {
        html += `<div data-cy="galaxy-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor};padding-bottom:6px;margin-bottom:3px;">${datapoint.name}</div>`;
        html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><circle data-cy="galaxy-tooltip-marker" cx="6" cy="6" r="6" stroke="none" fill="${datapoint.color}"/></svg>`;

        html += `<b>${buildLabel({
            showVal: FINAL_CONFIG.value.style.chart.tooltip.showValue,
            showPercentage: FINAL_CONFIG.value.style.chart.tooltip.showPercentage,
            val: applyDataLabel(
                FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.formatter,
                datapoint.value,
                dataLabel({
                    p: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix, 
                    v: datapoint.value, 
                    s: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix, 
                    r: FINAL_CONFIG.value.style.chart.tooltip.roundingValue
                }),
                { datapoint, seriesIndex }
            ),
            percentage: dataLabel({
                    v: datapoint.proportion * 100,
                    s: '%',
                    r: FINAL_CONFIG.value.style.chart.tooltip.roundingPercentage
                })
        })}</b></div>`;

        tooltipContent.value = `<div>${html}</div>`;
    }
}

const legendSet = computed(() => {
    return immutableSet.value
        .map((el, i) => {
            const valueDisplay = applyDataLabel(FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.formatter, el.value, dataLabel({
                    p: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix,
                    v: el.value,
                    s: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix,
                    r: FINAL_CONFIG.value.style.chart.legend.roundingValue
                }), { datapoint: el, index: i });

            const percentageDisplay = isNaN(el.value / total.value) || segregated.value.includes(el.id) ? '-' : dataLabel({v: el.value / total.value * 100, s: '%', r: FINAL_CONFIG.value.style.chart.legend.roundingPercentage });

            const display = buildLabel({
                showVal: FINAL_CONFIG.value.style.chart.legend.showValue,
                showPercentage: FINAL_CONFIG.value.style.chart.legend.showPercentage,
                val: valueDisplay,
                percentage: percentageDisplay
            });

            return {
                ...el,
                proportion: (el.value || 0) / FINAL_DATASET.value.map(m => (m.values || []).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0),
                opacity: segregated.value.includes(el.id) ? 0.5 : 1,
                shape: el.shape || 'circle',
                segregate: () => segregate(el),
                isSegregated: segregated.value.includes(el.id),
                display: `${el.name}${FINAL_CONFIG.value.style.chart.legend.showPercentage || FINAL_CONFIG.value.style.chart.legend.showValue ? ': ' : ''}${display}`
            }
        });
});

const legendConfig = computed(() => {
    return {
        cy: 'galaxy-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
});

const table = computed(() => {
    const head = galaxySet.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color
        }
    });
    const body = galaxySet.value.map(ds => ds.value);
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

        if(!callback) {
            downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-galaxy" })
        } else {
            callback(csvContent);
        }
    });
}

const dataTable = computed(() => {
    const head = [
        ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`, dataLabel({p: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix, v: total.value, s: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix, r: FINAL_CONFIG.value.table.td.roundingValue}),
        '100%'
    ];

    const body = table.value.head.map((h,i) => {
        const label = dataLabel({p: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix, v: table.value.body[i], s: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix, r: FINAL_CONFIG.value.table.td.roundingValue});
        return [
            {
                color: h.color,
                name: h.name
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
    ]

    return {
        colNames,
        head,
        body,
        config
    }
});

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
    if (!galaxyChart.value) return;
    const { width, height } = galaxyChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: galaxyChart.value, base64: true, img: true, scale})
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
            fullscreenParent: galaxyChart.value,
            forcedWidth: Math.min(500, window.innerWidth * 0.8),
            isCursorPointer: isCursorPointer.value
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
        dataset: immutableSet.value
    })
    if (!FINAL_CONFIG.value.userOptions.callbacks.altCopy) {
        console.warn('Vue Data UI - A callback must be set for `altCopy` in userOptions.');
        return
    }
    await Promise.resolve(FINAL_CONFIG.value.userOptions.callbacks.altCopy({ 
        config: FINAL_CONFIG.value, 
        dataset: immutableSet.value
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
    <div ref="galaxyChart" :class="`vue-data-ui-component vue-ui-galaxy ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'} ${loading ? 'loading' : ''}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;${!FINAL_CONFIG.style.chart.title.text ? 'padding-top:36px' : ''};background:${FINAL_CONFIG.style.chart.backgroundColor}`" :id="`galaxy_${uid}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
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

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;padding-bottom:24px`">            
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'galaxy-div-title',
                        ...FINAL_CONFIG.style.chart.title
                    },
                    subtitle: {
                        cy: 'galaxy-div-subtitle',
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
            :hasAltCopy="FINAL_CONFIG.userOptions.buttons.altCopy"
            :isTooltip="mutableConfig.showTooltip"
            :isFullscreen="isFullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="galaxyChart"
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
            <template v-if="$slots.optionAltCopy" #optionAltCopy="{ altCopy: c }">
                <slot name="optionAltCopy" v-bind="{ altCopy: c }"/>
            </template>
        </UserOptions>

        <svg
            ref="svgRef"
            :xmlns="XMLNS" 
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" 
            data-cy="galaxy-svg" 
            :viewBox="svg.viewBox" :style="`max-width:100%; overflow: visible; background:transparent;color:${FINAL_CONFIG.style.chart.color}`"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="0"
                :y="0"
                :width="svg.width"
                :height="svg.height"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>
            
            <!-- GRADIENT -->
            <defs>
                <filter :id="`blur_${uid}`" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" :stdDeviation="100 / FINAL_CONFIG.style.chart.layout.arcs.gradient.intensity" />
                </filter>
            </defs>

            <!-- PATHS -->
            <g v-for="datapoint in galaxySet">
                <path
                    data-cy="datapoint-border"
                    v-if="datapoint.value"
                    :d="datapoint.path"
                    fill="none"
                    :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                    :stroke-width="getStrokeWidth(datapoint).border"
                    stroke-linecap="round"                    
                />
                <path
                    data-cy="datapoint-path"
                    v-if="datapoint.value"
                    :d="datapoint.path"
                    fill="none"
                    :stroke="datapoint.color"
                    :stroke-width="getStrokeWidth(datapoint).path"
                    stroke-linecap="round"
                    :class="`${selectedSerie && selectedSerie !== datapoint.id && FINAL_CONFIG.useBlurOnHover ? 'vue-ui-galaxy-blur' : ''}`"
                />
                <g :filter="`url(#blur_${uid})`" v-if="datapoint.value && FINAL_CONFIG.style.chart.layout.arcs.gradient.show">
                    <path
                        :d="datapoint.path"
                        fill="none"
                        :stroke="FINAL_CONFIG.style.chart.layout.arcs.gradient.color"
                        :stroke-width="getStrokeWidth(datapoint).blur"
                        stroke-linecap="round"
                        :class="`vue-ui-galaxy-gradient ${selectedSerie && selectedSerie !== datapoint.id && FINAL_CONFIG.useBlurOnHover ? 'vue-ui-galaxy-blur' : ''}`"
                    />
                </g>
            </g>

            <!-- TRAPS -->
            <g v-for="(datapoint, i) in galaxySet">
                <path
                    data-cy="tooltip-trap"
                    v-if="datapoint.value"
                    :d="datapoint.path"
                    fill="none"
                    stroke="transparent"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.arcs.strokeWidth + FINAL_CONFIG.style.chart.layout.arcs.borderWidth"
                    stroke-linecap="round"
                    @mouseenter="useTooltip({
                        datapoint,
                        relativeIndex: i,
                        seriesIndex: datapoint.seriesIndex,
                        show: true
                    })"
                    @mouseleave="onTrapLeave(datapoint)"
                    @click="onTrapClick(datapoint)"
                />
            </g>
            <slot name="svg" :svg="{
                ...svg,
                isPrintingImg: isPrinting | isImaging | isCallbackImaging,
                isPrintingSvg: isCallbackSvg,
            }"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging || isCallbackImaging || isCallbackSvg }"/>
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
                    @clickMarker="({legend}) => segregate(legend)"
                >
                    <template #item="{ legend, index }">
                        <div :data-cy="`legend-item-${index}`" @click="segregate(legend)" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`" v-if="!loading">
                            {{ legend.display }}
                        </div>
                    </template>

                    <template #legendToggle>
                        <BaseLegendToggle
                            v-if="legendSet.length > 2 && FINAL_CONFIG.style.chart.legend.selectAllToggle.show && !loading"
                            :backgroundColor="FINAL_CONFIG.style.chart.legend.selectAllToggle.backgroundColor"
                            :color="FINAL_CONFIG.style.chart.legend.selectAllToggle.color"
                            :fontSize="FINAL_CONFIG.style.chart.legend.fontSize"
                            :checked="segregated.length > 0"
                            @toggle="toggleLegend"
                        />
                    </template>
                </Legend>
                
                <slot name="legend" v-bind:legend="legendSet" />
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
            :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.chart.tooltip.position"
            :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="galaxyChart"
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
                        <div v-html="th" style="display:flex;align-items:center"></div>
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
.vue-ui-galaxy *{
    transition: unset;
}
.vue-ui-galaxy {
    user-select: none;
    position: relative;
}

path {
    animation: galaxy 0.5s ease-in-out;
    transform-origin: center;
    transition: stroke-width 0.1s ease-in-out !important;
}

.loading path {
    transition: none !important;
}

@keyframes galaxy {
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

.vue-ui-galaxy .vue-ui-galaxy-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}

.vue-ui-dna * {
    animation: none !important;
}

.vue-ui-galaxy-blur {
    filter: blur(3px) opacity(50%) grayscale(100%);
    transition: all 0.15s ease-in-out;
}

.loading .vue-ui-galaxy-blur {
    transition: none !important;
}

.vue-data-ui-fullscreen--on {
    height: 80% !important;
    margin: 0 auto !important;
}
.vue-data-ui-fullscreen--off {
    max-width: 100%;
}
.vue-data-ui-wrapper-fullscreen {
    overflow: auto;
}
</style>