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
    adaptColorToBackground,
    applyDataLabel,
    convertColorToHex, 
    convertCustomPalette,
    createCsvContent, 
    createUid,
    createTSpansFromLineBreaksOnX,
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    giftWrap,
    isFunction,
    largestTriangleThreeBuckets,
    objectIsEmpty,
    palette,
    setOpacity,
    shiftHue,
    themePalettes,
    XMLNS,
    treeShake,
} from "../lib";
import { throttle } from "../canvas-lib";
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading";
import { usePrinter } from "../usePrinter";
import { useSvgExport } from "../useSvgExport";
import { useResponsive } from "../useResponsive";
import { useThemeCheck } from "../useThemeCheck";
import { useNestedProp } from "../useNestedProp";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import img from "../img";
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import Shape from "../atoms/Shape.vue";
import themes from "../themes/vue_ui_quadrant.json";
import Legend from "../atoms/Legend.vue"; // Must be ready in responsive mode
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

const { vue_ui_quadrant: DEFAULT_CONFIG } = useConfig();
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
    }
});

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

const uid = ref(createUid());
const emit = defineEmits(['selectPlot', 'selectSide', 'selectLegend', 'copyAlt']);
const isTooltip = ref(false);
const tooltipContent = ref("");
const step = ref(0);
const isZoom = ref(false);
const quadrantChart = ref(null);
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
    return {
        defaultConfig: {
            userOptions: { show: false, },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    layout: {
                        grid: {
                            stroke: '#6A6A6A',
                            graduations: {
                                stroke: '#6A6A6A',
                                color: '#6A6A6A90'
                            },
                            xAxis: {
                                auto: true
                            },
                            yAxis: {
                                auto: true
                            }
                        },
                        labels: {
                            quadrantLabels: { show: false },
                            plotLabels: { show: false },
                            axisLabels: { show: false }
                        },
                        plots: {
                            outlineColor: '#6A6A6A'
                        }
                    },
                    legend: {
                        backgroundColor: 'transparent'
                    },
                }
            }
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {}
    }
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
    skeletonDataset: props.config?.skeletonDataset ?? [
        {
            name: '_',
            shape: 'circle',
            color: '#CACACA',
            series: [
                { name: "_", x: -6, y: -4 },
                { name: "_", x: -5,  y: -2 },
                { name: "_", x: -4,  y: -1 },
                { name: "_", x: -3,  y: -0.5 },
                { name: "_", x: -2,  y: -0.25 },
                { name: "_", x: -1,  y: -0.135 },
                { name: "_", x: 0,   y: 0 },
                { name: "_", x: 1,   y: 0.135 },
                { name: "_", x: 2,   y: 0.25 },
                { name: "_", x: 3,   y: 0.5 },
                { name: "_", x: 4,   y: 1 },
                { name: "_", x: 5,   y: 2 },
                { name: "_", x: 6,  y: 4 },
            ]
        }
    ],
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
    mutableConfig.value.plotLabels.show = FINAL_CONFIG.value.style.chart.layout.labels.plotLabels.show;
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.chart.tooltip.show;
}, { deep: true });

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

const debug = computed(() => FINAL_CONFIG.value.debug);

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiQuadrant',
            type: 'dataset',
            debug: debug.value
        })
    } else {
        props.dataset.forEach((ds, i) => {
            if ([null, undefined].includes(ds.name)){
                error({
                    componentName: 'VueUiQuadrant',
                    type: 'datasetSerieAttribute',
                    property: 'name',
                    index: i,
                    debug: debug.value
                })
            }
            if([null, undefined].includes(ds.series)) {
                error({
                    componentName: 'VueUiQuadrant',
                    type: 'datasetSerieAttribute',
                    property: 'series',
                    index: i,
                    debug: debug.value
                })
            } else {
                ds.series.forEach((serie, j) => {
                    if ([null, undefined].includes(serie.name)) {
                        error({
                            componentName: 'VueUiQuadrant',
                            type: 'datasetSerieAttribute',
                            property: 'name',
                            key: 'series',
                            index: j,
                            debug: debug.value
                        })
                    }
                })
            }
        })
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: quadrantChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
                source: source.value,
                noTitle: noTitle.value
            });
            
            basePadding.value = 48;

            requestAnimationFrame(() => {
                svg.value.height = height;
                svg.value.usableHeight = height - (basePadding.value * 2);
                svg.value.width = width;
                svg.value.usableWidth = width - (basePadding.value * 2);
                svg.value.top = basePadding.value;
                svg.value.left = basePadding.value;
                svg.value.right = width - basePadding.value;
                svg.value.bottom = height - basePadding.value;
                svg.value.centerX = width / 2;
                svg.value.centerY = height - (height / 2)
                svg.value.padding = basePadding.value;
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = quadrantChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }
}

onMounted(() => {
    readyTeleport.value = true;
    prepareChart()
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
    elementId: `vue-ui-quadrant_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-quadrant',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})

const mutableConfig = ref({
    plotLabels: {
        show: FINAL_CONFIG.value.style.chart.layout.labels.plotLabels.show,
    },
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
});

const basePadding = ref(48);

const svg = ref({
    height: FINAL_CONFIG.value.style.chart.height,
    usableHeight: FINAL_CONFIG.value.style.chart.height - (basePadding.value * 2),
    width: FINAL_CONFIG.value.style.chart.width,
    usableWidth: FINAL_CONFIG.value.style.chart.width - (basePadding.value * 2),
    top: basePadding.value,
    left: basePadding.value,
    right: FINAL_CONFIG.value.style.chart.width - basePadding.value,
    bottom: FINAL_CONFIG.value.style.chart.height - basePadding.value,
    centerX: FINAL_CONFIG.value.style.chart.width / 2,
    centerY: FINAL_CONFIG.value.style.chart.height - (FINAL_CONFIG.value.style.chart.height / 2),
    padding: basePadding.value
})

const mutableSvg = ref({
    ...JSON.parse(JSON.stringify(svg.value)),
    startX: 0,
    startY: 0
});

watch(() => svg.value, (val) => {
    if (val) {
        mutableSvg.value = {
            ...JSON.parse(JSON.stringify(svg.value)),
            startX: 0,
            startY: 0
        }
    }
}, { deep: true})

const selectedSide = ref(null);

const selectedSideLabelCoordinates = computed(() => {
    switch (selectedSide.value) {
        case 'TL':
            return {
                x: mutableSvg.value.startX + mutableSvg.value.width / 2,
                y: mutableSvg.value.height,
                text: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.tl.text || 'Top Left',
                fontSize: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.tl.fontSize,
                fill: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.tl.color,
                bold: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.tl.bold
            }
        case 'TR': 
            return {
                x: mutableSvg.value.startX + mutableSvg.value.width / 2,
                y: mutableSvg.value.height,
                text: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.tr.text || 'Top Right',
                fontSize: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.tr.fontSize,
                fill: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.tr.color,
                bold: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.tr.bold
            }
        case 'BR': 
            return {
                x: mutableSvg.value.startX + mutableSvg.value.width / 2,
                y: mutableSvg.value.height * 1.678,
                text: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.br.text || 'Bottom Right',
                fontSize: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.br.fontSize,
                fill: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.br.color,
                bold: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.br.bold
            }
        case 'BL': 
            return {
                x: mutableSvg.value.startX + mutableSvg.value.width / 2,
                y: mutableSvg.value.height * 1.678,
                text: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.bl.text || 'Bottom Left',
                fontSize: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.bl.fontSize,
                fill: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.bl.color,
                bold: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.bl.bold
            }
    
        default:
            return {x: 0, y: 0, text: '', fontSize: 0, fill: 'none', bold: false}
    }
})

const currentAnimationFrame = ref(null);
const isAnimating = ref(false);

function zoomOnSide({ targetX, targetY, targetW, targetH, side}) {
    if(selectedSide.value) {
        selectSide(side);
    }
    const differentials = {
        x: targetX - mutableSvg.value.startX,
        y: targetY - mutableSvg.value.startY,
        w: targetW - mutableSvg.value.width,
        h: targetH - mutableSvg.value.height
    }

    const steps = FINAL_CONFIG.value.zoomAnimationFrames;
    let init = 0;
    function anim() {
        isAnimating.value = true;
        mutableSvg.value.startX += (differentials.x / steps);
        mutableSvg.value.startY += (differentials.y / steps);
        mutableSvg.value.width += (differentials.w / steps);
        mutableSvg.value.height += (differentials.h / steps);
        init += 1;
        if(init < steps) {
            currentAnimationFrame.value = requestAnimationFrame(anim)
        } else {
            isAnimating.value = false;
        }
    }
    anim()
}

function selectQuadrantSide(side) {
    if(isAnimating.value) {
        return;
    }
    if(isZoom.value && selectedSide.value === side) {
        zoomOnSide({
            targetX: 0,
            targetY: 0,
            targetW: svg.value.width,
            targetH: svg.value.height
        })
        selectedSide.value = null;
        isZoom.value = false;
    } else  {
        selectedSide.value = side;
        switch (side) {
            case 'TL':
                zoomOnSide({
                    targetX: 0,
                    targetY: 0,
                    targetW: svg.value.width / 2 + svg.value.left,
                    targetH: svg.value.height / 2 + svg.value.top,
                    side: 'tl'
                })
            break;
            
            case 'TR':
                zoomOnSide({
                    targetX: svg.value.width / 2 - svg.value.left,
                    targetY: 0,
                    targetW: svg.value.width / 2 + svg.value.left,
                    targetH: svg.value.height / 2 + svg.value.top,
                    side: 'tr'
                })
            break;

            case 'BR':
                zoomOnSide({
                    targetX: svg.value.width / 2 - svg.value.left,
                    targetY: svg.value.height / 2 - svg.value.top,
                    targetW: svg.value.width / 2 + svg.value.left,
                    targetH: svg.value.height / 2 + svg.value.top,
                    side: 'br'
                })
            break;

            case 'BL':
                zoomOnSide({
                    targetX: 0,
                    targetY: svg.value.height / 2 - svg.value.top,
                    targetW: svg.value.width / 2 + svg.value.left,
                    targetH: svg.value.height / 2 + svg.value.top,
                    side: 'bl'
                })
            break;
        
            default:
                mutableSvg.value.startX = 0;
                mutableSvg.value.startY = 0;
                mutableSvg.value.width = svg.value.width;
                mutableSvg.value.height = svg.value.height;
            break;
        }
        isZoom.value = true
    }
}

const graduations = computed(() => {
    const grads = FINAL_CONFIG.value.style.chart.layout.grid.graduations.steps;
    const stepX = svg.value.usableWidth / (grads * 2);
    const stepY = svg.value.top

    const gradArray = [];
    for(let i = 0; i < grads; i += 1) {
        gradArray.push({
            x: svg.value.padding + stepX * i,
            y: stepY + (svg.value.usableHeight * (i / grads / 2)),
            height: svg.value.usableHeight * (1 - (i / (grads))),
            width: svg.value.usableWidth * (1 - (i / grads)),
            opacity: Math.round((i+1) / grads * 20)
        })
    }

    return gradArray;
});

const axisValues = computed(() => {
    let xMax = FINAL_CONFIG.value.style.chart.layout.grid.xAxis.max;
    let xMin = FINAL_CONFIG.value.style.chart.layout.grid.xAxis.min;
    let yMax = FINAL_CONFIG.value.style.chart.layout.grid.yAxis.max;
    let yMin = FINAL_CONFIG.value.style.chart.layout.grid.yAxis.min;

    if(FINAL_CONFIG.value.style.chart.layout.grid.xAxis.auto) {
        xMax = Math.max(...immutableDataset.value.flatMap(category => {
            return category.series.map(s => s.x)
        }));
        xMin = Math.min(...immutableDataset.value.flatMap(category => {
            return category.series.map(s => s.x)
        }));
    }
    if(FINAL_CONFIG.value.style.chart.layout.grid.yAxis.auto) {
        yMax = Math.max(...immutableDataset.value.flatMap(category => {
            return category.series.map(s => s.y)
        }));
        yMin = Math.min(...immutableDataset.value.flatMap(category => {
            return category.series.map(s => s.y)
        }));
    }

    return {
        x: {
            max: xMax,
            min: xMin
        },
        y: {
            max: yMax,
            min: yMin
        }
    }
});

const segregated = ref([]);

const immutableDataset = computed(() => FINAL_DATASET.value.map((category, i) => {
    return {
        ...category,
        series: largestTriangleThreeBuckets({
            data: category.series,
            threshold: FINAL_CONFIG.value.downsample.threshold
        }),
        id: `cat_${i}_${uid.value}`,
        color: convertColorToHex(category.color) || customPalette.value[i] || palette[i],
    }
}));

const mutableDataset = computed(() => {
    return immutableDataset.value.filter(category => {
        return !segregated.value.includes(category.id);
    });
});

const datasetReference = computed(() => {
    return immutableDataset.value.map((category, i) => {
        return {
            ...category,
            shape: category.shape || "circle",
            series: category.series.map(s => {
                return {
                    ...s,
                    x: calcX(s.x),
                    y: calcY(s.y),
                    xValue: s.x,
                    yValue: s.y,
                    quadrantSide: getQuadrantSide({x: s.x, y: s.y}),
                    categoryName: category.name,
                    shape: category.shape,
                    color: category.color
                }
            })
        }
    })
});

const drawableDataset = computed(() => {
    FINAL_DATASET.value.forEach((ds,i) => {
        ds.series.forEach((serie,j) => {
            if ([null, undefined].includes(serie.x)) {
                error({
                    componentName: 'VueUiQuadrant',
                    type: 'datasetSerieAttribute',
                    property: 'x',
                    key: 'series',
                    index: j,
                    debug: debug.value
                })
            }
            if ([null, undefined].includes(serie.y)) {
                error({
                    componentName: 'VueUiQuadrant',
                    type: 'datasetSerieAttribute',
                    property: 'y',
                    key: 'series',
                    index: j,
                    debug: debug.value
                })
            }
        })
    })
    return mutableDataset.value.map((category, i) => {
        return {
            ...category,
            shape: category.shape || "circle",
            color: category.color || customPalette.value[i] || palette[i],
            series: category.series.map(s => {
                return {
                    ...s,
                    x: calcX(s.x),
                    y: calcY(s.y),
                    xValue: s.x,
                    yValue: s.y,
                    quadrantSide: getQuadrantSide({x: s.x, y: s.y}),
                    categoryName: category.name,
                    shape: category.shape,
                    color: category.color,
                    uid: createUid()
                }
            })
        }
    })
});

function calcX(x) {
    if(x >= 0) {
        const ratio = x / axisValues.value.x.max;
        return svg.value.centerX + ((svg.value.usableWidth / 2) * ratio);
    } else {
        const ratio = Math.abs(x) / Math.abs(axisValues.value.x.min)
        return svg.value.centerX - ((svg.value.usableWidth / 2) * ratio);
    }
}

function calcY(y) {
    if(y >= 0) {
        const ratio = y / axisValues.value.y.max;
        return svg.value.centerY + (1-(svg.value.usableHeight / 2) * ratio);
    } else {
        const ratio = Math.abs(y) / Math.abs(axisValues.value.y.min);
        return svg.value.centerY - (1 - (svg.value.usableHeight / 2) * ratio);
    }
}

const table = computed(() => {
    const tableData = drawableDataset.value.flatMap(category => {
        return category.series.map(s => {
            return {
                x: s.xValue,
                y: s.yValue,
                name: s.name,
                category: s.categoryName,
                quadrantSide: s.quadrantSide,
                sideName: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels[s.quadrantSide].text,
                color: category.color,
                shape: category.shape
            }
        })
    });
    const xAxisName = FINAL_CONFIG.value.style.chart.layout.grid.xAxis.name || "x";
    const yAxisName = FINAL_CONFIG.value.style.chart.layout.grid.yAxis.name || "y";
    const head = [FINAL_CONFIG.value.translations.category, FINAL_CONFIG.value.translations.item, xAxisName, yAxisName, FINAL_CONFIG.value.translations.side];

    const body = tableData.map(td => {
        return [td.category, td.name, td.x, td.y, td.sideName || td.quadrantSide]
    }); 

    const itsShapes = tableData.map(td => {
        return {
            shape: td.shape,
            color: td.color
        }
    });

    return { head, body, itsShapes, tableData };
});

const dataTable = computed(() => {
    const head = table.value.head;
    const body = table.value.tableData.map(ds => {
        return [
            {
                shape: ds.shape,
                color: ds.color,
                name: ds.category
            },
            ds.name,
            applyDataLabel(
                FINAL_CONFIG.value.style.chart.layout.labels.plotLabels.x.formatter,
                ds.x,
                dataLabel({
                    v: ds.x,
                    r: FINAL_CONFIG.value.style.chart.layout.labels.plotLabels.rounding
                })
            ),
            applyDataLabel(
                FINAL_CONFIG.value.style.chart.layout.labels.plotLabels.y.formatter,
                ds.y,
                dataLabel({
                    v: ds.y,
                    r: FINAL_CONFIG.value.style.chart.layout.labels.plotLabels.rounding
                })
            ),
            ds.sideName || ds.quadrantSide
        ]
    })
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

    return { head, body, config, colNames: head }
});

function toggleLegend() {
    if (segregated.value.length) {
        segregated.value = [];
    } else {
        legendSet.value.forEach(l => {
            segregated.value.push(l.id);
        });
    }
}

function segregate(id) {
    if(segregated.value.includes(id)) {
        segregated.value = segregated.value.filter(s => s !== id);
    } else {
        segregated.value.push(id)
    }
    const currentData = getData();
    emit('selectLegend', currentData);
}

const legendSet = computed(() => {
    return datasetReference.value.map(category => {
        return {
            name: category.name,
            shape: category.shape,
            color: category.color,
            id: category.id,
            opacity: segregated.value.includes(category.id) ? 0.5 : 1,
            segregate: () => segregate(category.id),
            isSegregated: segregated.value.includes(category.id)
        }
    })
});

function validSeriesToToggle(name) {
    if (!legendSet.value.length) {
        if (FINAL_CONFIG.value.debug) {
            console.warn('VueUiQuadrant - There are no series to show.');
        }
        return null;
    }
    const dp = legendSet.value.find(d => d.name === name);
    if (!dp) {
        if (FINAL_CONFIG.value.debug) {
            console.warn(`VueUiQuadrant - Series name not found "${name}"`);
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

const legendConfig = computed(() => {
    return {
        cy: 'quadrant-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
})

function getQuadrantSide(plot) {
    switch (true) {
        case plot.x >= 0 && plot.y >= 0:
            return "tr";
        
        case plot.x >= 0 && plot.y < 0:
            return "br";

        case plot.x < 0 && plot.y < 0:
            return "bl";

        case plot.x < 0 && plot.y >= 0:
            return "tl";    
        default:
            return "";
    }
}

const hoveredPlotId = ref(null);
const hoveredPlot = ref(null);
const dataTooltipSlot = ref(null);

function useTooltip(category, plot, categoryIndex) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint: plot, seriesIndex: categoryIndex });
    }

    hoveredPlotId.value = plot.uid;
    hoveredPlot.value = {
        color: category.color,
        shape: category.shape
    }

    dataTooltipSlot.value = {
        datapoint: plot,
        seriesIndex: categoryIndex,
        series: drawableDataset.value,
        config: FINAL_CONFIG.value
    }

    isTooltip.value = true;

    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
            seriesIndex: categoryIndex,
            datapoint: plot,
            series: drawableDataset.value,
            config: FINAL_CONFIG.value
        }))) {
        tooltipContent.value = customFormat({
            seriesIndex: categoryIndex,
            datapoint: plot,
            series: drawableDataset.value,
            config: FINAL_CONFIG.value
        })
    } else {
        let html = "";
    
        if(plot.quadrantSide) {
            html += `<div style="color:${FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels[plot.quadrantSide].color};font-weight:${FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels[plot.quadrantSide].bold ? 'bold' : '400'}">${FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels[plot.quadrantSide].text}</div>`;
        }
        html += `<div>${category.name}</div>`;
        html += `<div style="padding-bottom:6px;border-bottom:1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor};margin-bottom:3px">${plot.name}</div>`;
        html += `<div>${FINAL_CONFIG.value.style.chart.layout.grid.xAxis.name ? FINAL_CONFIG.value.style.chart.layout.grid.xAxis.name : 'x'}: <b>${applyDataLabel(
            FINAL_CONFIG.value.style.chart.layout.labels.plotLabels.x.formatter,
            plot.xValue,
            dataLabel({
                v: plot.xValue,
                r: FINAL_CONFIG.value.style.chart.tooltip.roundingValue
            }),
            { datapoint: plot, category, categoryIndex }
        )}</b></div>`;  
        html += `<div>${FINAL_CONFIG.value.style.chart.layout.grid.yAxis.name ? FINAL_CONFIG.value.style.chart.layout.grid.yAxis.name : 'y'}: <b>${applyDataLabel(
            FINAL_CONFIG.value.style.chart.layout.labels.plotLabels.y.formatter,
            plot.yValue,
            dataLabel({
                v: plot.yValue,
                r: FINAL_CONFIG.value.style.chart.tooltip.roundingValue
            }),
            { datapoint: plot, category, categoryIndex }
        )}</b></div>`;  
    
        tooltipContent.value = `<div style="text-align:left;font-size:${FINAL_CONFIG.value.style.chart.tooltip.fontSize}px">${html}</div>`;
    }

}

function onTrapLeave(plot, index) {
    isTooltip.value = false;
    hoveredPlotId.value = null;
    hoveredPlot.value = null;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint: plot, seriesIndex: index });
    }
}

function selectPlot(category, plot, index) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint: plot, seriesIndex: index })
    }

    const plotEmit = {
        category: category.name,
        shape: category.shape,
        itemName: plot.name,
        x: plot.xValue,
        y: plot.yValue,
        quadrantSide: plot.quadrantSide,
        sideName: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels[plot.quadrantSide].text
    }
    emit("selectPlot", plotEmit);
}

function selectSide(side) {
    if(!side) return;
    const sidePlots = drawableDataset.value.flatMap(category => category.series.filter(s => s.quadrantSide === side).map(s => {
        return {
            category: s.categoryName,
            itemName: s.name,
            x: s.xValue,
            y: s.yValue
        }
    }));
    const sideEmit = {
        quadrantSide: side,
        sideName: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels[side].text,
        items: [...sidePlots]
    }
    emit("selectSide", sideEmit);
}

const miniMap = computed(() => {
    return {
        TL: {
            tl: {
                x: svg.value.left + svg.value.usableWidth / 4 - 20,
                y: 0,
                fill: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.tl.color
            },
            tr: {
                x: svg.value.left + svg.value.usableWidth / 4 ,
                y: 0,
                fill: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.tr.color
            },
            br: {
                x: svg.value.left + svg.value.usableWidth / 4 ,
                y: 20,
                fill: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.br.color
            },
            bl: {
                x: svg.value.left + svg.value.usableWidth / 4 - 20,
                y: 20,
                fill: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.bl.color
            },
            crosshairs: {
                horizontal: `M ${svg.value.left + svg.value.usableWidth / 4 - 20},${20} ${svg.value.left + svg.value.usableWidth / 4 + 20},${20}`,
                vertical: `M ${svg.value.left + svg.value.usableWidth / 4},${0} ${svg.value.left + svg.value.usableWidth / 4},${40}`
            }
        },
        TR: {
            tl: {
                x: svg.value.centerX + svg.value.usableWidth / 4 - 20,
                y: 0,
                fill: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.tl.color
            },
            tr: {
                x:  svg.value.centerX + svg.value.usableWidth / 4,
                y: 0,
                fill: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.tr.color
            },
            br: {
                x: svg.value.centerX + svg.value.usableWidth / 4,
                y: 20,
                fill: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.br.color
            },
            bl: {
                x: svg.value.centerX + svg.value.usableWidth / 4 - 20,
                y: 20,
                fill: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.bl.color
            },
            crosshairs: {
                horizontal: `M ${svg.value.centerX + svg.value.usableWidth / 4 - 20},${20} ${svg.value.centerX+ svg.value.usableWidth / 4 + 20},${20}`,
                vertical: `M ${svg.value.centerX + svg.value.usableWidth / 4},${0} ${svg.value.centerX + svg.value.usableWidth / 4},${40}`
            }
        },
        BR: {
            tl: {
                x: svg.value.centerX + svg.value.usableWidth / 4 - 20,
                y: svg.value.centerY - 48,
                fill: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.tl.color
            },
            tr: {
                x: svg.value.centerX + svg.value.usableWidth / 4,
                y: svg.value.centerY - 48,
                fill: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.tr.color
            },
            br: {
                x: svg.value.centerX + svg.value.usableWidth / 4,
                y: svg.value.centerY - 28,
                fill: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.br.color
            },
            bl: {
                x: svg.value.centerX + svg.value.usableWidth / 4 - 20,
                y: svg.value.centerY - 28,
                fill: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.bl.color
            },
            crosshairs: {
                horizontal: `M ${svg.value.centerX + svg.value.usableWidth / 4 - 20},${svg.value.centerY - 28} ${svg.value.centerX + svg.value.usableWidth / 4 + 20},${svg.value.centerY - 28}`,
                vertical: `M ${svg.value.centerX + svg.value.usableWidth / 4},${svg.value.centerY - 48} ${svg.value.centerX + svg.value.usableWidth / 4},${svg.value.centerY - 8}`
            }
        },
        BL: {
            tl: {
                x: svg.value.left + svg.value.usableWidth / 4 - 20,
                y: svg.value.centerY - 48,
                fill: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.tl.color
            },
            tr: {
                x: svg.value.left + svg.value.usableWidth / 4,
                y: svg.value.centerY - 48,
                fill: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.tr.color
            },
            br: {
                x: svg.value.left + svg.value.usableWidth / 4,
                y: svg.value.centerY - 28,
                fill: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.br.color
            },
            bl: {
                x: svg.value.left + svg.value.usableWidth / 4 - 20,
                y: svg.value.centerY - 28,
                fill: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels.bl.color
            },
            crosshairs: {
                horizontal: `M ${svg.value.left + svg.value.usableWidth / 4 - 20},${svg.value.centerY - 28} ${svg.value.left + svg.value.usableWidth / 4 + 20},${svg.value.centerY - 28}`,
                vertical: `M ${svg.value.left + svg.value.usableWidth / 4},${svg.value.centerY - 48} ${svg.value.left + svg.value.usableWidth / 4},${svg.value.centerY - 8}`
            }
        },
    }
});

function getData() {
    return drawableDataset.value.map(ds => {
        return {
            color: ds.color,
            name: ds.name,
            shape: ds.shape,
            series: ds.series.map(s => {
                return {
                    name: s.name,
                    x: s.xValue,
                    y: s.yValue,
                    quadrantSide: s.quadrantSide,
                    sideName: FINAL_CONFIG.value.style.chart.layout.labels.quadrantLabels[s.quadrantSide].text
                }
            }),
        }
    });
}

function generateCsv(callback=null) {
    nextTick(() => {
        const title = [[FINAL_CONFIG.value.style.chart.title.text], [FINAL_CONFIG.value.style.chart.title.subtitle.text], [""]];
        const head = table.value.head;
        const body = table.value.body
        const tableXls = title.concat([head]).concat(body);
        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-quadrant'})
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

function toggleLabels() {
    mutableConfig.value.plotLabels.show = !mutableConfig.value.plotLabels.show;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

async function getImage({ scale = 2} = {}) {
    if (!quadrantChart.value) return;
    const { width, height } = quadrantChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: quadrantChart.value, base64: true, img: true, scale })
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
            fullscreenParent: quadrantChart.value,
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

const svgBg = computed(() => FINAL_CONFIG.value.style.chart.backgroundColor);
const svgLegend = computed(() => FINAL_CONFIG.value.style.chart.legend);
const svgTitle = computed(() => FINAL_CONFIG.value.style.chart.title);

const { exportSvg, getSvg } = useSvgExport({
    svg: svgRef,
    title: svgTitle,
    legend: svgLegend,
    legendItems: legendSet,
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
    toggleLabels,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen,
    copyAlt
});

</script>

<template>
    <div :class="`vue-data-ui-component vue-ui-quadrant ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`" ref="quadrantChart" :id="`vue-ui-quadrant_${uid}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor};${FINAL_CONFIG.responsive ? `height: 100%` : ''}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
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
                :key="`table_${titleStep}`"
                :config="{
                    title: {
                        cy: 'quadrant-title',
                        ...FINAL_CONFIG.style.chart.title
                    },
                    subtitle: {
                        cy: 'quadrant-subtitle',
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
            :hasLabel="FINAL_CONFIG.userOptions.buttons.labels"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :hasAltCopy="FINAL_CONFIG.userOptions.buttons.altCopy"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="quadrantChart"
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
            @toggleLabels="toggleLabels"
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
            <template #optionLabels v-if="$slots.optionLabels">
                <slot name="optionLabels" />
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
            data-cy="quadrant-svg"
            :xmlns="XMLNS"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }"
            :viewBox="`${mutableSvg.startX} ${mutableSvg.startY} ${mutableSvg.width} ${mutableSvg.height}`"
            :style="`max-width:100%;overflow:hidden;background:transparent;color:${FINAL_CONFIG.style.chart.color}`"  :id="`svg_${uid}`"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="mutableSvg.startX"
                :y="mutableSvg.startY"
                :width="mutableSvg.width"
                :height="mutableSvg.height"
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
                    v-for="(d, i) in drawableDataset"
                    :id="`quadrant_gradient_${uid}_${i}`"
                >
                    <stop offset="0%" :stop-color="setOpacity(shiftHue(d.color, 0.05), FINAL_CONFIG.style.chart.layout.areas.opacity)"/>
                    <stop offset="100%" :stop-color="setOpacity(d.color, FINAL_CONFIG.style.chart.layout.areas.opacity)" />
                </radialGradient>
            </defs>

            <!-- GRID -->            
            <!-- GRADUATIONS-->
            <g v-if="FINAL_CONFIG.style.chart.layout.grid.graduations.show">
                <rect v-for="graduation in graduations"
                    data-cy="grid-rect"
                    :fill="FINAL_CONFIG.style.chart.layout.grid.graduations.fill ? setOpacity(FINAL_CONFIG.style.chart.layout.grid.graduations.color, graduation.opacity) : 'none'"
                    :x="graduation.x"
                    :y="graduation.y"
                    :height="graduation.height <= 0 ? 0.001 : graduation.height"
                    :width="graduation.width <= 0 ? 0.001 : graduation.width"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.grid.graduations.strokeWidth"
                    :stroke="FINAL_CONFIG.style.chart.layout.grid.graduations.stroke"
                    :rx="FINAL_CONFIG.style.chart.layout.grid.graduations.roundingForce"
                />
            </g>

            <!-- AXIS -->
            <line
                data-cy="axis-x"
                :x1="svg.left"
                :y1="svg.centerY"
                :x2="svg.right"
                :y2="svg.centerY"
                :stroke="FINAL_CONFIG.style.chart.layout.grid.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.layout.grid.strokeWidth"
            />
            <line
                data-cy="axis-y"
                :x1="svg.centerX"
                :y1="svg.top"
                :x2="svg.centerX"
                :y2="svg.bottom"
                :stroke="FINAL_CONFIG.style.chart.layout.grid.stroke"
                :stroke-width="FINAL_CONFIG.style.chart.layout.grid.strokeWidth"
            />
            <!-- ARROWS -->
            <g v-if="FINAL_CONFIG.style.chart.layout.grid.showArrows">
                <polygon data-cy="axis-arrow" :points="`${svg.right - 8},${svg.centerY - 6} ${svg.right},${svg.centerY} ${svg.right - 8},${svg.centerY + 6}`" :fill="FINAL_CONFIG.style.chart.layout.grid.stroke" stroke="none" />
                <polygon data-cy="axis-arrow" :points="`${svg.left + 8},${svg.centerY - 6} ${svg.left},${svg.centerY} ${svg.left + 8},${svg.centerY + 6}`" :fill="FINAL_CONFIG.style.chart.layout.grid.stroke" stroke="none" />
                <polygon data-cy="axis-arrow" :points="`${svg.centerX - 6},${svg.top + 8} ${svg.centerX},${svg.top} ${svg.centerX + 6},${svg.top + 8}`" :fill="FINAL_CONFIG.style.chart.layout.grid.stroke" stroke="none"/>
                <polygon data-cy="axis-arrow" :points="`${svg.centerX - 6},${svg.bottom - 8} ${svg.centerX},${svg.bottom} ${svg.centerX + 6},${svg.bottom - 8}`" :fill="FINAL_CONFIG.style.chart.layout.grid.stroke" stroke="none"/>
            </g>

            <!-- QUADRANT LABELS -->
            <g v-if="FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.show && !isZoom">            
                <!-- TL -->
                <text
                    data-cy="quadrant-label-tl"
                    v-if="FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.tl.text"
                    :x="0"
                    :y="svg.top - svg.padding / 2"
                    text-anchor="start"
                    :fill="FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.tl.color"
                    :font-size="FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.tl.fontSize"
                    :style="`font-weight:${FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.tl.bold ? 'bold' : ''}`"
                    @click="selectSide('tl')"
                >
                    {{ FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.tl.text }}
                </text>

                <!-- TR -->
                <text
                data-cy="quadrant-label-tr"
                    v-if="FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.tr.text"
                    :x="svg.width"
                    :y="svg.top - svg.padding / 2"
                    text-anchor="end"
                    :fill="FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.tr.color"
                    :font-size="FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.tr.fontSize"
                    :style="`font-weight:${FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.tr.bold ? 'bold' : ''}`"
                    @click="selectSide('tr')"
                >
                    {{ FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.tr.text }}
                </text>

                <!-- BR -->
                <text
                data-cy="quadrant-label-br"
                    v-if="FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.br.text"
                    :x="svg.width"
                    :y="svg.bottom + svg.padding *0.7"
                    text-anchor="end"
                    :fill="FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.br.color"
                    :font-size="FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.br.fontSize"
                    :style="`font-weight:${FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.br.bold ? 'bold' : ''}`"
                    @click="selectSide('br')"
                >
                    {{ FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.br.text }}
                </text>

                <!-- BL -->
                <text
                    data-cy="quadrant-label-bl"
                    v-if="FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.bl.text"
                    :x="0"
                    :y="svg.bottom + svg.padding * 0.7"
                    text-anchor="start"
                    :fill="FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.bl.color"
                    :font-size="FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.bl.fontSize"
                    :style="`font-weight:${FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.bl.bold ? 'bold' : ''}`"
                    @click="selectSide('bl')"
                >
                    {{ FINAL_CONFIG.style.chart.layout.labels.quadrantLabels.bl.text }}
                </text>
            </g>

            <!-- AXIS VALUES -->
            <g v-if="FINAL_CONFIG.style.chart.layout.labels.axisLabels.show">
                <!-- Y MAX -->
                <text
                    data-cy="label-y-max"
                    :x="svg.centerX"
                    :y="svg.top - svg.padding / 6"
                    text-anchor="middle"
                    :font-size="FINAL_CONFIG.style.chart.layout.labels.axisLabels.fontSize"
                    :fill="FINAL_CONFIG.style.chart.layout.labels.axisLabels.color.positive"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.chart.layout.labels.plotLabels.y.formatter,
                        axisValues.y.max,
                        dataLabel({
                            v: axisValues.y.max,
                            r: FINAL_CONFIG.style.chart.layout.labels.plotLabels.rounding
                        })) 
                    }}
                </text>
                <text
                    data-cy="axis-y-name"
                    :x="svg.centerX"
                    :y="svg.top - svg.padding / 2"
                    text-anchor="middle"
                    :font-size="FINAL_CONFIG.style.chart.layout.labels.axisLabels.fontSize"
                    :fill="FINAL_CONFIG.style.chart.layout.labels.axisLabels.color.positive"
                >
                    {{ FINAL_CONFIG.style.chart.layout.grid.yAxis.name }}
                </text>

                <!-- Y MIN -->
                <text
                    data-cy="label-y-min"
                    :x="svg.centerX"
                    :y="svg.bottom + svg.padding * 0.35"
                    text-anchor="middle"
                    :font-size="FINAL_CONFIG.style.chart.layout.labels.axisLabels.fontSize"
                    :fill="FINAL_CONFIG.style.chart.layout.labels.axisLabels.color.negative"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.chart.layout.labels.plotLabels.y.formatter,
                        axisValues.y.min,
                        dataLabel({
                            v: axisValues.y.min,
                            r: FINAL_CONFIG.style.chart.layout.labels.plotLabels.rounding
                        })) 
                    }}
                </text>

                <!-- X MIN -->
                <text
                    data-cy="label-x-min"
                    :id="`xLabelMin_${uid}`"
                    text-anchor="middle"
                    :font-size="FINAL_CONFIG.style.chart.layout.labels.axisLabels.fontSize"
                    :transform="`translate(${svg.padding - FINAL_CONFIG.style.chart.layout.labels.axisLabels.fontSize}, ${svg.height / 2}), rotate(-90)`"
                    :fill="FINAL_CONFIG.style.chart.layout.labels.axisLabels.color.negative"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.chart.layout.labels.plotLabels.x.formatter,
                        axisValues.x.min,
                        dataLabel({
                            v: axisValues.x.min,
                            r: FINAL_CONFIG.style.chart.layout.labels.plotLabels.rounding
                        })) 
                    }}
                </text>

                <!-- X MAX -->
                <text
                    data-cy="label-x-max"
                    :id="`xLabelMax_${uid}`"
                    text-anchor="middle"
                    :font-size="FINAL_CONFIG.style.chart.layout.labels.axisLabels.fontSize"
                    :transform="`translate(${svg.width - svg.padding + FINAL_CONFIG.style.chart.layout.labels.axisLabels.fontSize}, ${svg.height / 2}), rotate(90)`"
                    :fill="FINAL_CONFIG.style.chart.layout.labels.axisLabels.color.positive"
                >
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.chart.layout.labels.plotLabels.x.formatter,
                        axisValues.x.max,
                        dataLabel({
                            v: axisValues.x.max,
                            r: FINAL_CONFIG.style.chart.layout.labels.plotLabels.rounding
                        })) 
                    }}
                </text>       
                <text
                    data-cy="axis-x-name"
                    :id="`xLabelMaxName_${uid}`"
                    text-anchor="middle"
                    :font-size="FINAL_CONFIG.style.chart.layout.labels.axisLabels.fontSize"
                    :transform="`translate(${svg.width - FINAL_CONFIG.style.chart.layout.labels.axisLabels.fontSize}, ${svg.height / 2}), rotate(90)`"
                    :fill="FINAL_CONFIG.style.chart.layout.labels.axisLabels.color.positive"
                >
                    {{ FINAL_CONFIG.style.chart.layout.grid.xAxis.name }}
                </text>       
            </g>

            <!-- AREAS GIFT WRAPPING -->
            <g v-if="FINAL_CONFIG.style.chart.layout.areas.show">
                <g v-for="(category, i) in drawableDataset">
                    <polygon
                        data-cy="gift-wrap"
                        v-if="category.series.length > 2"
                        data-cy-quadrant-area
                        :fill="FINAL_CONFIG.style.chart.layout.areas.useGradient ? `url(#quadrant_gradient_${uid}_${i})` : setOpacity(category.color, FINAL_CONFIG.style.chart.layout.areas.opacity)"
                        :points="giftWrap(category)"
                    />
                </g>
            </g>

            <!-- SIDE TRAPS -->
            <g>
                <rect
                    data-cy="side-trap-tl"
                    @click="selectQuadrantSide('TL')"
                    :x="svg.left"
                    :y="svg.top"
                    :width="(svg.usableWidth / 2) <= 0 ? 0.001 : (svg.usableWidth / 2)"
                    :height="(svg.usableHeight / 2) <= 0 ? 0.001 : (svg.usableHeight / 2)"
                    fill="transparent"
                    :class="{ 'vue-data-ui-zoom-plus': !isZoom, 'vue-data-ui-zoom-minus': isZoom }"
                />
                <rect
                    data-cy="side-trap-tr"
                    @click="selectQuadrantSide('TR')"
                    :x="svg.centerX"
                    :y="svg.top"
                    :width="(svg.usableWidth / 2) <= 0 ? 0.001 : (svg.usableWidth / 2)"
                    :height="(svg.usableHeight / 2) <= 0 ? 0.001 : (svg.usableHeight / 2)"
                    fill="transparent"
                    :class="{ 'vue-data-ui-zoom-plus': !isZoom, 'vue-data-ui-zoom-minus': isZoom }"
                />
                <rect
                    data-cy="side-trap-br"
                    @click="selectQuadrantSide('BR')"
                    :x="svg.centerX"
                    :y="svg.centerY"
                    :width="(svg.usableWidth / 2) <= 0 ? 0.001 : (svg.usableWidth / 2)"
                    :height="(svg.usableHeight / 2) <= 0 ? 0.001 : (svg.usableHeight / 2)"
                    fill="transparent"
                    :class="{ 'vue-data-ui-zoom-plus': !isZoom, 'vue-data-ui-zoom-minus': isZoom }"
                />
                <rect
                    data-cy="side-trap-bl"
                    @click="selectQuadrantSide('BL')"
                    :x="svg.left"
                    :y="svg.centerY"
                    :width="(svg.usableWidth / 2) <= 0 ? 0.001 : (svg.usableWidth / 2)"
                    :height="(svg.usableHeight / 2) <= 0 ? 0.001 : (svg.usableHeight / 2)"
                    fill="transparent"
                    :class="{ 'vue-data-ui-zoom-plus': !isZoom, 'vue-data-ui-zoom-minus': isZoom }"
                />
            </g>

            <!-- PLOTS -->
            <template v-if="!FINAL_CONFIG.style.chart.layout.labels.plotLabels.showAsTag">
                <g v-for="(category, i) in drawableDataset">
                    <template v-if="$slots.datapoint && !loading">
                        <foreignObject
                            v-for="plot in category.series"
                            :x="plot.x - 1"
                            :y="plot.y - 1"
                            width="2"
                            height="2"
                            style="overflow: visible"
                            @mouseenter="useTooltip(category, plot, i)"
                            @mouseleave="onTrapLeave(plot, i)"
                            @click="selectPlot(category, plot, i)"
                        >
                            <slot name="datapoint" v-bind="{ datapoint: plot }" />
                        </foreignObject>
                    </template>

                    <template v-else>
                        <Shape
                            v-for="plot in category.series"
                            :color="category.color"
                            :isSelected="hoveredPlotId && plot.uid === hoveredPlotId"
                            :plot="plot"
                            :radius="FINAL_CONFIG.style.chart.layout.plots.radius / (isZoom ? 1.5 : 1)"
                            :shape="category.shape"
                            :stroke="FINAL_CONFIG.style.chart.layout.plots.outline ? FINAL_CONFIG.style.chart.layout.plots.outlineColor : 'none'"
                            :strokeWidth="FINAL_CONFIG.style.chart.layout.plots.outlineWidth"
                            @mouseenter="useTooltip(category, plot, i)"
                            @mouseleave="onTrapLeave(plot, i)"
                            @click="selectPlot(category, plot, i)"
                        />
                    </template>
                </g>

                <g v-if="mutableConfig.plotLabels.show" style="pointer-events: none;">
                    <g v-for="category in drawableDataset">
                        <g v-for="plot in category.series">
                            <!-- SINGLE LINE -->
                            <text
                                v-if="!String(plot.name).includes('\n')"
                                data-cy="plot-label"
                                :x="plot.x" 
                                :y="plot.y + FINAL_CONFIG.style.chart.layout.labels.plotLabels.offsetY + FINAL_CONFIG.style.chart.layout.plots.radius" 
                                text-anchor="middle" 
                                :font-size="FINAL_CONFIG.style.chart.layout.labels.plotLabels.fontSize / (isZoom ? 1.5 : 1)"
                                :fill="FINAL_CONFIG.style.chart.layout.labels.plotLabels.color"
                            >
                                {{ plot.name }}
                            </text>
                            <text
                                v-else
                                data-cy="plot-label"
                                :x="plot.x" 
                                :y="plot.y + FINAL_CONFIG.style.chart.layout.labels.plotLabels.offsetY + FINAL_CONFIG.style.chart.layout.plots.radius" 
                                text-anchor="middle" 
                                :font-size="FINAL_CONFIG.style.chart.layout.labels.plotLabels.fontSize / (isZoom ? 1.5 : 1)"
                                :fill="FINAL_CONFIG.style.chart.layout.labels.plotLabels.color"
                                v-html="createTSpansFromLineBreaksOnX({
                                    content: String(plot.name),
                                    fontSize: FINAL_CONFIG.style.chart.layout.labels.plotLabels.fontSize / (isZoom ? 1.5 : 1),
                                    fill: FINAL_CONFIG.style.chart.layout.labels.plotLabels.color,
                                    x: plot.x,
                                    y: plot.y + FINAL_CONFIG.style.chart.layout.labels.plotLabels.offsetY + FINAL_CONFIG.style.chart.layout.plots.radius
                                })"
                            />
                        </g>
                    </g>
                </g>
            </template>

            <template v-else>
                <g v-if="mutableConfig.plotLabels.show">
                    <template v-for="(category, i) in drawableDataset">
                        <foreignObject 
                            v-for="plot in category.series" style="overflow: visible;" height="10" width="100" :x="plot.x - 50" :y="plot.y - (FINAL_CONFIG.style.chart.layout.labels.plotLabels.fontSize)" 
                            @mouseover="useTooltip(category, plot, i)"
                            @mouseleave="onTrapLeave(plot, i)"
                            @click="selectPlot(category, plot, i)">
                            <div :style="`color:${adaptColorToBackground(category.color)};margin: 0 auto; font-size:${FINAL_CONFIG.style.chart.layout.labels.plotLabels.fontSize}px; text-align:center;background:${category.color}; padding: 2px 4px; border-radius: 12px; height: fit-content;`">
                                {{  plot.name }}
                            </div>
                        </foreignObject>
                    </template>
                </g>
            </template>

            <!-- HIDDEN AREAS ON ZOOM -->
            <g v-if="isZoom" class="vue-ui-dna">
                <polygon 
                    v-if="selectedSide === 'TL'"
                    :points="`${svg.left - 1},${svg.centerY} ${svg.centerX},${svg.centerY} ${svg.centerX},${svg.top - 1} ${svg.right},${svg.top - 1} ${svg.right},${svg.bottom} ${svg.left - 1},${svg.bottom} ${svg.left - 1},${svg.centerY}`"
                    :fill="FINAL_CONFIG.style.chart.backgroundColor"
                    style="opacity:1"
                />
                <polygon 
                    v-if="selectedSide === 'TR'"
                    :points="`${svg.left},${svg.top - 1} ${svg.centerX},${svg.top - 1} ${svg.centerX},${svg.centerY} ${svg.right + 1},${svg.centerY} ${svg.right + 1},${svg.bottom} ${svg.left},${svg.bottom} ${svg.left},${svg.top - 1}`"
                    :fill="FINAL_CONFIG.style.chart.backgroundColor"
                    style="opacity:1"
                />
                <polygon 
                    v-if="selectedSide === 'BR'"
                    :points="`${svg.left},${svg.top} ${svg.right + 1},${svg.top} ${svg.right + 1},${svg.centerY} ${svg.centerX},${svg.centerY} ${svg.centerX},${svg.bottom + 1} ${svg.left},${svg.bottom + 1} ${svg.left},${svg.top}`"
                    :fill="FINAL_CONFIG.style.chart.backgroundColor"
                    style="opacity:1"
                />
                <polygon 
                    v-if="selectedSide === 'BL'"
                    :points="`${svg.left - 1},${svg.top} ${svg.right},${svg.top} ${svg.right},${svg.bottom + 1} ${svg.centerX},${svg.bottom + 1} ${svg.centerX},${svg.centerY} ${svg.left - 1},${svg.centerY} ${svg.left - 1},${svg.top}`"
                    :fill="FINAL_CONFIG.style.chart.backgroundColor"
                    style="opacity:1"
                />
            </g>

            <g v-if="selectedSide && !isAnimating">
                <text
                    :x="selectedSideLabelCoordinates.x"
                    :y="selectedSideLabelCoordinates.y - (selectedSideLabelCoordinates.fontSize / 1.5)"
                    :font-size="selectedSideLabelCoordinates.fontSize / 1.5"
                    :fill="selectedSideLabelCoordinates.fill"
                    text-anchor="middle"
                    :font-weight="selectedSideLabelCoordinates.bold ? 'bold' : 'normal'"
                >
                    {{ selectedSideLabelCoordinates.text }}
                </text>
            </g>

            <!-- MINI MAP -->
            <g v-if="isZoom && selectedSide">
                <rect
                    data-cy="minimap-tl"
                    :x="miniMap[selectedSide].tl.x"
                    :y="miniMap[selectedSide].tl.y"
                    height="20"
                    width="20"
                    :fill="miniMap[selectedSide].tl.fill"
                    :style="`cursor: ${isCursorPointer ? 'pointer': 'default'}; opacity: ${selectedSide === 'TL' ? 1 : 0.2}`"
                    @click="selectQuadrantSide('TL')"
                    :class="{'vue-ui-quadrant-mini-map-cell': true, 'vue-ui-quadrant-mini-map-cell-selectable': selectedSide !== 'TL'}"
                />
                <rect
                    data-cy="minimap-tr"
                    :x="miniMap[selectedSide].tr.x"
                    :y="miniMap[selectedSide].tr.y"
                    height="20"
                    width="20"
                    :fill="miniMap[selectedSide].tr.fill"
                    :style="`cursor: ${isCursorPointer ? 'pointer' : 'default'}; opacity: ${selectedSide === 'TR' ? 1 : 0.2}`"
                    @click="selectQuadrantSide('TR')"
                    :class="{'vue-ui-quadrant-mini-map-cell': true, 'vue-ui-quadrant-mini-map-cell-selectable': selectedSide !== 'TR'}"
                />
                <rect
                    data-cy="minimap-br"
                    :x="miniMap[selectedSide].br.x"
                    :y="miniMap[selectedSide].br.y"
                    height="20"
                    width="20"
                    :fill="miniMap[selectedSide].br.fill"
                    :style="`cursor: ${isCursorPointer ? 'pointer': 'default'}; opacity: ${selectedSide === 'BR' ? 1 : 0.2}`"
                    @click="selectQuadrantSide('BR')"
                    :class="{'vue-ui-quadrant-mini-map-cell': true, 'vue-ui-quadrant-mini-map-cell-selectable': selectedSide !== 'BR'}"
                />
                <rect
                    data-cy="minimap-bl"
                    :x="miniMap[selectedSide].bl.x"
                    :y="miniMap[selectedSide].bl.y"
                    height="20"
                    width="20"
                    :fill="miniMap[selectedSide].bl.fill"
                    :style="`cursor: ${isCursorPointer ? 'pointer' : 'default'}; opacity: ${selectedSide === 'BL' ? 1 : 0.2}`"
                    @click="selectQuadrantSide('BL')"
                    :class="{'vue-ui-quadrant-mini-map-cell': true, 'vue-ui-quadrant-mini-map-cell-selectable': selectedSide !== 'BL'}"
                />
                <path
                    class="vue-ui-quadrant-minimap-crosshairs"
                    :stroke="FINAL_CONFIG.style.chart.backgroundColor" 
                    :stroke-width="1"
                    :d="miniMap[selectedSide].crosshairs.horizontal"
                />
                <path
                    class="vue-ui-quadrant-minimap-crosshairs"
                    :stroke="FINAL_CONFIG.style.chart.backgroundColor" 
                    :stroke-width="1"
                    :d="miniMap[selectedSide].crosshairs.vertical"
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
                    :isCursorPointer="isCursorPointer"
                    @clickMarker="({legend}) => segregate(legend.id)"
                >
                    <template #item="{ legend }">
                        <div data-cy="legend-item" @click="segregate(legend.id)" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`" v-if="!loading">
                            {{ legend.name }} 
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
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.chart.tooltip.position"
            :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="quadrantChart"
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
            <svg height="14" width="14" viewBox="0 0 20 20" v-if="FINAL_CONFIG.style.chart.tooltip.showShape">
                <Shape
                    :plot="{ x: 10, y: 10 }"
                    :shape="hoveredPlot.shape"
                    :color="hoveredPlot.color"
                    :radius="8"
                    :stroke="FINAL_CONFIG.style.chart.layout.plots.outline ? FINAL_CONFIG.style.chart.layout.plots.outlineColor : 'none'"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.plots.outlineWidth"
                />
            </svg>
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
                        <div v-html="td.name || td"/>
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
.vue-ui-quadrant *{
    transition: unset;
}
.vue-ui-quadrant {
    user-select: none;
    position: relative;
}

path, line, rect, circle, polygon {
    animation: quadrantAnimation 0.5s ease-in-out;
    transform-origin: center;
}
@keyframes quadrantAnimation {
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
.vue-ui-quadrant .vue-ui-quadrant-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}

.vue-ui-quadrant-mini-map-cell,
.vue-ui-quadrant-mini-map-cell-selectable,
.vue-ui-quadrant-minimap-crosshairs {
    animation: none !important;
    transition: opacity 0.15s ease-in-out;
}

.vue-ui-quadrant-mini-map-cell:hover {
    stroke: white;
    stroke-width: 1px;
}
.vue-ui-quadrant-mini-map-cell-selectable:hover {
    opacity: 0.5 !important;
}
</style>