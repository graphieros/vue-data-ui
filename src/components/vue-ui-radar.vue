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
    createPolygonPath, 
    createUid, 
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    getMissingDatasetAttributes,
    isFunction,
    makePath,
    objectIsEmpty, 
    palette,
    setOpacity,
    shiftHue,
    themePalettes,
    treeShake,
    XMLNS
} from "../lib";
import { throttle } from "../canvas-lib";
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading";
import { usePrinter } from "../usePrinter";
import { useSvgExport } from "../useSvgExport.js";
import { useResponsive } from "../useResponsive";
import { useNestedProp } from "../useNestedProp";
import { useThemeCheck } from "../useThemeCheck.js";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import { useAutoSizeLabelsInsideViewbox } from "../useAutoSizeLabelsInsideViewbox.js";
import img from "../img";
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import Legend from "../atoms/Legend.vue"; // Must be ready in responsive mode
import themes from "../themes/vue_ui_radar.json";
import BaseScanner from "../atoms/BaseScanner.vue";
import BaseLegendToggle from "../atoms/BaseLegendToggle.vue";

const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const SparkBar = defineAsyncComponent(() => import('./vue-ui-sparkbar.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));

const { vue_ui_radar: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: Object,
        default() {
            return {}
        }
    }
});

const isDataset = computed(() => {
    return !!props.dataset && Object.keys(props.dataset).length
})

const uid = ref(createUid());
const isTooltip = ref(false);
const tooltipContent = ref("");
const step = ref(0);
const radarChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);
const readyTeleport = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);
const isCallbackImaging = ref(false);
const isCallbackSvg = ref(false);

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
                    layout: {
                        grid: {
                            stroke: '#6A6A6A90'
                        },
                        labels: {
                            dataLabels: { show: false }
                        },
                        outerPolygon: {
                            stroke: '#6A6A6A'
                        }
                    },
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
        })
    },
    skeletonDataset: props.config?.skeletonDataset ?? {
        categories: [{ name: '_', color: '#6A6A6A'}, ],
        series: [
            { name: '_', values: [0.6], target: 1 },
            { name: '_', values: [0.6], target: 1 },
            { name: '_', values: [0.6], target: 1 },
            { name: '_', values: [0.6], target: 1 },
            { name: '_', values: [0.6], target: 1 },
            { name: '_', values: [0.6], target: 1 },
        ]
    },
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: skeletonConfig.value
    })
})

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
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.chart.tooltip? FINAL_CONFIG.value.style.chart.tooltip.show : false;
}, { deep: true });

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

const debug = computed(() => FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiRadar',
            type: 'dataset',
            debug: debug.value
        })
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: radarChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
                source: source.value,
                noTitle: noTitle.value
            });

            requestAnimationFrame(() => {
                svg.value.width = width;
                svg.value.height = height;
                autoSizeLabels();
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = radarChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }
    autoSizeLabels();
}

onMounted(() => {
    readyTeleport.value = true;
    prepareChart();
});

onBeforeUnmount(() => {
    if (resizeObserver.value) {
        if (observedEl.value) {
            resizeObserver.value.unobserve(observedEl.value);
        }
        resizeObserver.value.disconnect();
    }
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-radar_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-radar',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableConfig = ref({
    dataLabels: {
        show: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.show,
    },
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
});

const sparkBarConfig = computed(() => {
    return {
        style: {
            backgroundColor: '#FFFFFF00',
            animation: {
                show: FINAL_CONFIG.value.style.chart.tooltip.animation.show,
                animationFrames: FINAL_CONFIG.value.style.chart.tooltip.animation.animationFrames
            },
            labels: {
                fontSize: FINAL_CONFIG.value.style.chart.tooltip.fontSize,
                name: {
                    color: FINAL_CONFIG.value.style.chart.tooltip.color
                },
            },
            gutter: {
                backgroundColor: '#CCCCCC',
                opacity: 30
            }
        }
    }
})

const svg = ref({
    height: 312,
    width: 512,
})

const emit = defineEmits(['selectLegend']);

const segregated = ref([]);
const inSegregation = ref(null);
const isAnimating = ref(false);

function toggleLegend() {
    if (segregated.value.length) {
        segregated.value = [];
    } else {
        legendSet.value.forEach((_,i) => {
            segregated.value.push(i);
        });
    }
}

function segregate(index) {
    isAnimating.value = true;
    if(segregated.value.includes(index)) {
        inSegregation.value = index;
        segregated.value = segregated.value.filter(s => s !== index);
        setTimeout(() => {
            isAnimating.value = false;
            inSegregation.value = null;
        }, 500)
    }else {
        segregated.value.push(index);
        setTimeout(() => {
            isAnimating.value = false;
        }, 500)
    }
    emit('selectLegend', legendSet.value.filter((_, i) => !segregated.value.includes(i)).map(l => {
        return {
            name: l.name,
            color: l.color,
            proportion: l.totalProportion
        }
    }))
}

function getData() {
    return legendSet.value.map(l => {
        return {
            name: l.name,
            color: l.color,
            proportion: l.totalProportion
        }
    })
}

function validateRadarDataset() {
    const ds = FINAL_DATASET.value;

    if ([null, undefined].includes(ds?.categories)) {
        error({
            componentName: 'VueUiRadar',
            type: 'dataset',
            debug: debug.value
        });
        error({
            componentName: 'VueUiRadar',
            type: 'datasetAttribute',
            property: 'categories ({ name: string; prefix?: string; suffix?: string}[])',
            debug: debug.value
        });
        return;
    }

    if (ds.categories.length === 0) {
        error({
            componentName: 'VueUiRadar',
            type: 'datasetAttributeEmpty',
            property: 'categories',
            debug: debug.value
        });
    } else {
        ds.categories.forEach((cat, i) => {
        getMissingDatasetAttributes({
            datasetObject: cat,
            requiredAttributes: ['name']
        }).forEach(attr => {
            error({
                componentName: 'VueUiRadar',
                type: 'datasetAttribute',
                property: `category.${attr} at index ${i}`,
                index: i,
                debug: debug.value
            });
        });
        });
    }

    if ([null, undefined].includes(ds?.series)) {
        error({
            componentName: 'VueUiRadar',
            type: 'datasetAttribute',
            property: 'series ({ name: string; values: number[]; color?: string; target: number}[])',
            debug: debug.value
        });
    } else {
        ds.series.forEach((serie, i) => {
        getMissingDatasetAttributes({
            datasetObject: serie,
            requiredAttributes: ['name', 'values', 'target']
        }).forEach(attr => {
            error({
                componentName: 'VueUiRadar',
                type: 'datasetSerieAttribute',
                key: 'series',
                property: attr,
                index: i,
                debug: debug.value
            });
        });
        });
    }
}

watch(
    () => FINAL_DATASET.value,
    () => validateRadarDataset(),
    { deep: true, immediate: true }
);

const datasetCopy = computed(() => {
    const cats = Array.isArray(FINAL_DATASET.value?.categories)
        ? FINAL_DATASET.value.categories
        : [];

    const colors = customPalette.value ?? palette;

    return cats.map((c, i) => ({
        name: c?.name ?? '',
        categoryId: `radar_category_${uid.value}_${i}`,
        color: convertColorToHex(c?.color) || colors[i] || palette[i % palette.length],
        prefix: c?.prefix ?? '',
        suffix: c?.suffix ?? '',
    }));
});

const seriesCopy = computed(() => {
    return FINAL_DATASET.value.series
        .map((s, i) => {
            return {
                ...s,
                color: convertColorToHex(s.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
                serieId: `radar_serie_${uid.value}_${i}`,
                formatter: s.formatter || null,
                absoluteIndex: i
            }
        });
});

function validSeriesToToggle(name) {
    if (!seriesCopy.value.length) {
        if (FINAL_CONFIG.value.debug) {
            console.warn('VueUiRadar - There are no series to show.');
        }
        return null;
    }
    const dp = legendSet.value.find(d => d.name === name);
    if (!dp) {
        if (FINAL_CONFIG.value.debug) {
            console.warn(`VueUiRadar - Series name not found "${name}"`);
        }
        return null;
    }
    return dp;
}

function showSeries(name) {
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (segregated.value.includes(dp.absoluteIndex)) {
        segregate(dp.absoluteIndex);
    }
}

function hideSeries(name) {
    const dp  = validSeriesToToggle(name);
    if (dp === null) return;
    if (!segregated.value.includes(dp.absoluteIndex))  {
        segregate(dp.absoluteIndex);
    }
}

const max = computed(() => Math.max(...seriesCopy.value
        .flatMap(s => s.values)));

const apexes = computed(() => {
    return seriesCopy.value.length;
});

const polygonRadius = computed(() => {
    return Math.min(svg.value.width, svg.value.height) / 3
})

const outerPolygon = computed(() => {
    return createPolygonPath({
        plot: { x: svg.value.width / 2, y: svg.value.height / 2},
        radius: polygonRadius.value,
        sides: apexes.value,
        rotation: 0,
    })
});

const innerPolygons = computed(() => {
    const polygons = [];
    for (let i = 0; i < polygonRadius.value; i += (polygonRadius.value / FINAL_CONFIG.value.style.chart.layout.grid.graduations)) {
        polygons.push(i);
    }
    return polygons;
})

const radar = computed(() => {
    return outerPolygon.value.coordinates.map((c, i) => {
        const plots = seriesCopy.value[i].values.map(v => {
                return plot({
                    centerX: svg.value.width / 2,
                    centerY: svg.value.height / 2,
                    apexX: c.x,
                    apexY: c.y,
                    proportion: v / (seriesCopy.value[i].target || max.value)
                })
            });
        return {
            ...c,
            ...seriesCopy.value[i],
            plots,
        }
    }).map(r => {
        return {
            ...r,
            labelX: offset(r).x,
            labelY: offset(r).y,
            labelAnchor: offset(r).anchor
        }
    })
});

function offset({x, y}) {
    let anchor = "middle";
    x = Math.round(x);
    y = Math.round(y);
    if(x > svg.value.width / 2) {
        x += 12;
        anchor="start";
    }
    if(x < svg.value.width / 2) {
        x -= 12;
        anchor="end"
    }
    if(y > svg.value.height / 2 + 1) {
        y += 20;
    }
    if(y < svg.value.height / 2 - 1) {
        y -= 12;
    }
    if(y === svg.value.height / 2) {
        y += 4
    }
    return {x, y, anchor}
}

const labelFontSize = computed({
    get: () => FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.fontSize,
    set: v => v
})

const { autoSizeLabels } = useAutoSizeLabelsInsideViewbox({
    svgRef,
    fontSize: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.fontSize,
    minFontSize: 6,
    sizeRef: labelFontSize,
    labelClass: '.vue-ui-radar-apex-label'
});

function plot({ centerX, centerY, apexX, apexY, proportion }) {
    return {
        x: centerX + (apexX - centerX) * proportion,
        y: centerY + (apexY - centerY) * proportion
    }
}

const legendSet = computed(() => {
    const ratios = seriesCopy.value.map((s,i) => {
        return s.values.map(v => v / (s.target || max.value))
    });
    return datasetCopy.value.map((d,i) => {
        const totalProportion = checkNaN(ratios.map(r => r[i]).reduce((a, b) => a + b, 0) / seriesCopy.value.length);
        return {
            ...d,
            absoluteIndex: i,
            totalProportion,
            shape: 'circle',
            opacity: segregated.value.includes(i) ? 0.5 : 1,
            segregate: () => segregate(i),
            isSegregated: segregated.value.includes(i),
            display: `${d.name}: ${dataLabel({
                v: (totalProportion ?? 0) * 100,
                s: '%',
                r: FINAL_CONFIG.value.style.chart.legend.roundingPercentage
            })}`
        }
    })
});

const legendConfig = computed(() => {
    return {
        cy: 'radar-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
})

const dataTable = computed(() => {
    const head = [
        { name: FINAL_CONFIG.value.translations.datapoint, color: "" },
        { name: FINAL_CONFIG.value.translations.target, color: "" },
        ...legendSet.value
    ];

    const body = FINAL_DATASET.value.series.map(ds => {
        return [
            ds.name,
            applyDataLabel(
                ds.formatter,
                ds.target,
                dataLabel({
                    p: ds.prefix,
                    v: ds.target,
                    s: ds.suffix,
                    r: FINAL_CONFIG.value.table.td.roundingValue
                })
            ),
            ...ds.values.map((v, i) => {
                return `${applyDataLabel(
                    ds.formatter,
                    v,
                    dataLabel({p: datasetCopy.value[i]?.prefix ?? '', v, s: datasetCopy.value[i]?.suffix ?? '', r:FINAL_CONFIG.value.table.td.roundingValue})
                )} (${isNaN(v / ds.target) ? '' : dataLabel({
                    v: v / ds.target * 100,
                    s: '%',
                    r: FINAL_CONFIG.value.table.td.roundingPercentage
                })})`
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
    };

    return { head, body, config, colNames: head }
})

const selectedIndex = ref(null);
const sparkBarData = ref([]);

const dataTooltipSlot = ref(null);

function onTrapLeave(apex, i) {
    isTooltip.value = false;
    selectedIndex.value = null;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint: apex, seriesIndex: i });
    }
}

function onTrapClick(apex, i) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint: apex, seriesIndex: i});
    }
}

function useTooltip(apex, i) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint: apex, seriesIndex: i });
    }

    const cats = datasetCopy.value.slice();

    sparkBarData.value = [];
    selectedIndex.value = i;
    isTooltip.value = true;
    dataTooltipSlot.value = {
        datapoint: apex,
        seriesIndex: i,
        series: {
            categories: cats,
            datapoints: seriesCopy.value,
            radar: radar.value
        },
        config: FINAL_CONFIG.value
    };

    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
        seriesIndex: i,
        datapoint: apex,
        series: { categories: cats, datapoints: seriesCopy.value, radar: radar.value },
        config: FINAL_CONFIG.value
    }))) {
        tooltipContent.value = customFormat({
            seriesIndex: i,
            datapoint: apex,
            series: { categories: cats, datapoints: seriesCopy.value, radar: radar.value },
            config: FINAL_CONFIG.value
        });
        return;
    }

    tooltipContent.value = `<div style="width:100%;text-align:center;border-bottom:1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor};padding-bottom:6px;margin-bottom:3px;">${apex.name}</div>`;

    for (let k = 0; k < apex.values.length; k += 1) {
        if (!segregated.value.includes(k)) {
            const cat = cats[k];
            const rawVal = apex.values[k];
            const pct = isNaN(rawVal / apex.target) ? 0 : (rawVal / apex.target) * 100;

            const valueLabel = applyDataLabel(
                apex.formatter,
                rawVal,
                dataLabel({
                    p: datasetCopy.value[k].prefix,
                    v: rawVal,
                    s: datasetCopy.value[k].suffix,
                    r: FINAL_CONFIG.value.style.chart.tooltip.roundingValue
                }),
                { datapoint: apex }
            );

            const percentageLabel = dataLabel({
                v: pct,
                s: '%',
                r: FINAL_CONFIG.value.style.chart.tooltip.roundingPercentage
            });

            const display = FINAL_CONFIG.value.style.chart.tooltip.showValue && FINAL_CONFIG.value.style.chart.tooltip.showPercentage ? `${valueLabel} (${percentageLabel})` : FINAL_CONFIG.value.style.chart.tooltip.showValue && !FINAL_CONFIG.value.style.chart.tooltip.showPercentage ? valueLabel : !FINAL_CONFIG.value.style.chart.tooltip.showValue && FINAL_CONFIG.value.style.chart.tooltip.showPercentage ? `${percentageLabel}` :  '';

            sparkBarData.value.push({
                name: cat?.name ?? `#${k + 1}`,
                value: apex.values[k] / apex.target * 100,
                color: cat?.color,
                suffix: display,
                prefix: '',
                rounding: FINAL_CONFIG.value.style.chart.tooltip.roundingPercentage,
                formatter: apex.formatter
            });
        }
    }
}

function generateCsv(callback=null) {
    nextTick(() => {
        const title = [[FINAL_CONFIG.value.style.chart.title.text], [FINAL_CONFIG.value.style.chart.title.subtitle.text], [""]];
        const head = [[""],[FINAL_CONFIG.value.translations.target], ...legendSet.value.flatMap(l => [[l.name], ["%"]])];
        const body = FINAL_DATASET.value.series.map((s, i) => {
            return [ s.name, s.target, ...s.values.flatMap(v => {
                return [
                    v, isNaN(v / s.target) ? '' : v / s.target * 100
                ]
            })]
        });

        const tableXls = title.concat([head]).concat(body);
        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-radar"})
        } else {
            callback(csvContent);
        }
    });
}

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
    if (!radarChart.value) return;
    const { width, height } = radarChart.value.getBoundingClientRect();
    const aspectRatio = width / height; 
    const { imageUri, base64 } = await img({ domElement: radarChart.value, base64: true, img: true, scale })
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
            fullscreenParent: radarChart.value,
            forcedWidth: Math.min(800, window.innerWidth * 0.8),
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
    toggleFullscreen
});

</script>

<template>
    <div 
        :class="`vue-data-ui-component vue-ui-radar ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`"
        ref="radarChart"
        :id="`vue-ui-radar_${uid}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; ${FINAL_CONFIG.responsive ? 'height: 100%;' : ''} text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`"
        @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)"
    >
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

        <!-- TITLE AS DIV -->
        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;padding-bottom:12px`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'radar-div-title',
                        ...FINAL_CONFIG.style.chart.title
                    },
                    subtitle: {
                        cy: 'radar-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
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
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip && FINAL_CONFIG.style.chart.tooltip.show"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="radarChart"
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
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" 
            :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`" :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.chart.color}`" 
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

            <!-- DEFS -->
            <defs>
                <radialGradient
                    cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
                    v-for="(d, i) in datasetCopy"
                    :id="`radar_gradient_${uid}_${i}`"
                >
                    <stop offset="0%" :stop-color="setOpacity(shiftHue(d.color, 0.05), FINAL_CONFIG.style.chart.layout.dataPolygon.opacity)"/>
                    <stop offset="100%" :stop-color="setOpacity(d.color, FINAL_CONFIG.style.chart.layout.dataPolygon.opacity)" />
                </radialGradient>
            </defs>

            <!-- GRID -->
            <g v-if="FINAL_CONFIG.style.chart.layout.grid.show">
                <!-- RADIAL LINES -->
                <line
                    data-cy="radial-line"
                    v-for="line in radar"
                    :x1="svg.width / 2"
                    :y1="svg.height / 2"
                    :x2="line.x"
                    :y2="line.y"
                    :stroke="FINAL_CONFIG.style.chart.layout.grid.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.grid.strokeWidth"
                />
                <!-- INNER POLYGONS -->
                <g v-if="FINAL_CONFIG.style.chart.layout.grid.graduations > 0">
                    <path
                        data-cy="polygon-inner"
                        v-for="radius in innerPolygons"
                        :d="createPolygonPath({
                            plot: { x: svg.width / 2, y: svg.height / 2 },
                            radius: radius,
                            sides: apexes,
                            rotation: 0
                        }).path"
                        fill="none"
                        :stroke="FINAL_CONFIG.style.chart.layout.grid.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.layout.grid.strokeWidth"
                    />
                </g>
            </g>

            <!-- OUTER POLYGON -->
            <path
                data-cy="polygon-outer"
                :d="outerPolygon.path" 
                fill="none" 
                :stroke="FINAL_CONFIG.style.chart.layout.outerPolygon.stroke" 
                :stroke-width="FINAL_CONFIG.style.chart.layout.outerPolygon.strokeWidth" 
                stroke-linejoin="round" 
                stroke-linecap="round"
            />

            <!-- APEX LABELS -->
            <g v-if="FINAL_CONFIG.style.chart.layout.labels.dataLabels.show">
            <text v-for="(label, i) in radar"
                data-cy="label-apex"
                class="vue-ui-radar-apex-label"
                :x="label.labelX"
                :y="label.labelY"
                :text-anchor="label.labelAnchor"
                :font-size="FINAL_CONFIG.style.chart.layout.labels.dataLabels.fontSize"
                :fill="FINAL_CONFIG.style.chart.layout.labels.dataLabels.color"
                @mouseenter="useTooltip(label, i)"
                @mouseleave="onTrapLeave(label, i)"
                @click="onTrapClick(label, i)"
            >
                {{ label.name }}
            </text>
            </g>

            <!-- PLOTS -->
            <g v-for="(d, i) in datasetCopy">
                <g>
                    <polygon
                        data-cy="polygon-datapoint-wrapper"
                        :points="makePath(radar.map(r => r.plots[i]), false, true)"
                        :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.chart.layout.dataPolygon.strokeWidth + 1"
                        fill="none"
                        v-if="FINAL_CONFIG.useCssAnimation || (!FINAL_CONFIG.useCssAnimation && !segregated.includes(i))"
                        :class="{ 'animated-out': segregated.includes(i) && FINAL_CONFIG.useCssAnimation, 'animated-in': isAnimating && inSegregation === i && FINAL_CONFIG.useCssAnimation }"
                    />
                    <polygon
                        data-cy="polygon-datapoint"
                        :points="makePath(radar.map(r => r.plots[i]), false, true)"
                        :stroke="d.color"
                        :stroke-width="FINAL_CONFIG.style.chart.layout.dataPolygon.strokeWidth"
                        v-if="FINAL_CONFIG.useCssAnimation || (!FINAL_CONFIG.useCssAnimation && !segregated.includes(i))"
                        :fill="FINAL_CONFIG.style.chart.layout.dataPolygon.transparent ? 'transparent' : FINAL_CONFIG.style.chart.layout.dataPolygon.useGradient ? `url(#radar_gradient_${uid}_${i})` : setOpacity(d.color, FINAL_CONFIG.style.chart.layout.dataPolygon.opacity)"
                        :class="{ 'animated-out': segregated.includes(i) && FINAL_CONFIG.useCssAnimation, 'animated-in': isAnimating && inSegregation === i && FINAL_CONFIG.useCssAnimation }"
                    />
                </g>
            </g>
            
            <g v-if="FINAL_CONFIG.style.chart.layout.plots.show">
                <g v-for="(category, i) in radar">
                    <circle
                        data-cy="datapoint-circle"
                        v-for="(p, j) in category.plots"
                        :cx="p.x"
                        :cy="p.y"
                        :fill="segregated.includes(j) ? 'transparent' : datasetCopy[j] ? datasetCopy[j].color : 'transparent'"
                        :r="selectedIndex !== null && selectedIndex === i ? FINAL_CONFIG.style.chart.layout.plots.radius * 1.6 : FINAL_CONFIG.style.chart.layout.plots.radius"
                        :stroke="segregated.includes(j) ? 'transparent' : FINAL_CONFIG.style.chart.backgroundColor"
                        :stroke-width="0.5"
                        :class="{ 'animated-out': segregated.includes(j) && FINAL_CONFIG.useCssAnimation, 'animated-in': isAnimating && inSegregation === j && FINAL_CONFIG.useCssAnimation }"
                    />
                </g>
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
                    :isCursorPointer="isCursorPointer"
                    @clickMarker="({i}) => segregate(i)"
                >
                    <template #item="{ legend, index }">
                        <div data-cy="legend-item" @click="legend.segregate()" :style="`opacity:${segregated.includes(index) ? 0.5 : 1}`" v-if="!loading">
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
                            :isCursorPointer="isCursorPointer"
                            @toggle="toggleLegend"
                        />
                    </template>
                </Legend>
                <slot v-else name="legend" v-bind:legend="legendSet"></slot>
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
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :position="FINAL_CONFIG.style.chart.tooltip.position"
            :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="radarChart"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="FINAL_CONFIG.style.chart.tooltip.customFormat && typeof FINAL_CONFIG.style.chart.tooltip.customFormat === 'function'"
            :smooth="FINAL_CONFIG.style.chart.tooltip.smooth"
            :backdropFilter="FINAL_CONFIG.style.chart.tooltip.backdropFilter"
            :smoothForce="FINAL_CONFIG.style.chart.tooltip.smoothForce"
            :smoothSnapThreshold="FINAL_CONFIG.style.chart.tooltip.smoothSnapThreshold"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <div style="max-width: 200px;margin:0 auto" v-if="!['function'].includes(typeof FINAL_CONFIG.style.chart.tooltip.customFormat)">
                    <SparkBar :dataset="sparkBarData" :config="sparkBarConfig" :backgroundOpacity="0">
                        <template #data-label="{ bar }">
                            <div class="vue-ui-radar-tooltip-datalabel" style="width: 100%">
                                <span class="vue-ui-radar-tooltip-datalabel-name">
                                    {{ bar.name + (FINAL_CONFIG.style.chart.tooltip.showValue || FINAL_CONFIG.style.chart.tooltip.showPercentage ? ':' : '') }}
                                </span>
                                <span v-if="FINAL_CONFIG.style.chart.tooltip.showValue || FINAL_CONFIG.style.chart.tooltip.showPercentage">
                                    {{ bar.suffix }}
                                </span>
                            </div>
                        </template>
                    </SparkBar>
                </div>
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
                    :style="{ cursor: isCursorPointer ? 'pointer' : 'default'}"
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
                        {{ th.name }}
                    </template>
                    <template #td="{ td }">
                        {{ td }}
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
.vue-ui-radar *{
    transition: unset;
}

path, line, rect, circle {
    animation: xyAnimation 0.5s ease-in-out !important;
    transform-origin: center;
}
@keyframes xyAnimation {
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
.vue-ui-radar {
    user-select: none;
    position: relative;
}
.vue-ui-radar .vue-ui-radar-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}

polygon {
    transform-origin: center;
}

.vue-ui-radar-tooltip-datalabel {
    display: flex;
    flex-wrap: wrap;
    align-items:center;
    gap: 4px;
}

.animated-in {
    animation: animatedIn 0.3s cubic-bezier(0, 1.01, 1, 1) forwards;
}

@keyframes animatedIn {
    0% {
        transform: scale(0, 0);
    }
    80% {
        transform: scale(1.05, 1.05);
    }
    100% {
        transform: scale(1, 1);
    }
}

.animated-out {
    animation: animatedOut 0.3s cubic-bezier(0, 1.01, 1, 1) forwards;
}

@keyframes animatedOut {
    from {
        transform: scale(1, 1);
    }
    to {
        transform: scale(0, 0);
    }
}

</style>