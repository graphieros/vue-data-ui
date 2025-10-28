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
} from "vue";
import { 
    abbreviate,
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
    getMissingDatasetAttributes,
    isFunction,
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
import { useSvgExport } from "../useSvgExport";
import { useNestedProp } from "../useNestedProp";
import { useResponsive } from "../useResponsive";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import img from "../img";
import Shape from "../atoms/Shape.vue";
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import themes from "../themes.json";
import Legend from "../atoms/Legend.vue"; // Must be ready in responsive mode
import BaseScanner from "../atoms/BaseScanner.vue";

const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));

const { vue_ui_waffle: DEFAULT_CONFIG } = useConfig();

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

const slots = useSlots();

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length
});

const uid = ref(createUid());
const isTooltip = ref(false);
const tooltipContent = ref("");
const selectedSerie = ref(null);
const step = ref(0);
const waffleChart = ref(null);
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

const FINAL_CONFIG = ref(prepareConfig());

// v3 - Skeleton loader management
const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    callback: () => {
        Promise.resolve().then(async () => {
            datasetCopy.value = prepareDataset();
        })
    },
    skeletonDataset: [
        {
            name: '',
            values: [1],
            color: '#AAAAAA',
        },
        {
            name: '',
            values: [1],
            color: '#BABABA',
        },
        {
            name: '',
            values: [1],
            color: '#CACACA',
        },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            useCustomCells: false,
            userOptions: { show: false },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    layout: {
                        labels: {
                            captions: { show: false }
                        },
                        rect: {
                            stroke: '#999999'
                        }
                    },
                    legend: {
                        backgroundColor: 'transparent',
                        showValue: false,
                        showPercentage: false
                    }
                }
            }
        }
    })
});

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
                userConfig: themes.vue_ui_waffle[mergedConfig.theme] || props.config,
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
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
    legendStep.value += 1;

    // Reset mutable config
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.chart.tooltip.show;
}, { deep: true });

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiWaffle',
            type: 'dataset',
            debug: debug.value
        })
        isDataset.value = false;
        manualLoading.value = true; // v3
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['name', 'values']
            }).forEach(attr => {
                error({
                    componentName: 'VueUiWaffle',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i,
                    debug: debug.value
                });
            });
        });
    }

    // v3
    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: waffleChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
                source: source.value,
                noTitle: noTitle.value
            });

            requestAnimationFrame(() => {
                svg.value.width = width;
                svg.value.height = height;
                drawingArea.value.width = width;
                drawingArea.value.height = height;
            })
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = waffleChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }
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
    elementId: `vue-ui-waffle_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-waffle',
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
    };
}, { immediate: true });

const svg = ref({
    height: 512,
    width: 512
});

const drawingArea = ref({
    top: 0,
    left: 0,
    height: 512,
    width: 512
});

const rectDimension = computed(() => {
    return ((drawingArea.value.width - (FINAL_CONFIG.value.style.chart.layout.grid.size * FINAL_CONFIG.value.style.chart.layout.grid.spaceBetween )) / FINAL_CONFIG.value.style.chart.layout.grid.size);
});

const rectDimensionY = computed(() => {
    return ((drawingArea.value.height - (FINAL_CONFIG.value.style.chart.layout.grid.size * FINAL_CONFIG.value.style.chart.layout.grid.spaceBetween )) / FINAL_CONFIG.value.style.chart.layout.grid.size);
})

const absoluteRectDimension = computed(() => {
    return Math.max(0.0001, ((drawingArea.value.width) / FINAL_CONFIG.value.style.chart.layout.grid.size));
});

const absoluteRectDimensionY = computed(() => {
    return Math.max(0.0001, ((drawingArea.value.height) / FINAL_CONFIG.value.style.chart.layout.grid.size));
})

function calculateProportions(numbers) {
    const totalSquares = FINAL_CONFIG.value.style.chart.layout.grid.size * FINAL_CONFIG.value.style.chart.layout.grid.size;
    const totalSum = numbers.reduce((a, b) => a + b, 0);
    const proportions = numbers.map(num => (num / totalSum) * totalSquares);

    const intParts = proportions.map(Math.floor);
    const fractionalParts = proportions.map(num => num % 1);

    let remainingSquares = totalSquares - intParts.reduce((a, b) => a + b, 0);

    while (remainingSquares > 0) {
        let maxIndex = fractionalParts.indexOf(Math.max(...fractionalParts));
        intParts[maxIndex] += 1;
        fractionalParts[maxIndex] = 0;
        remainingSquares -= 1;
    }

    return intParts;
}

const allDatapointsAreEmpty = ref(false);

function prepareDataset() {
    allDatapointsAreEmpty.value = FINAL_DATASET.value.flatMap(ds => ds.values.reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0) === 0;

    return FINAL_DATASET.value.map((s, i) => {
        return {
            ...s,
            color: convertColorToHex(s.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
            uid: `serie_${i}`,
            absoluteIndex: i
        }
    });
}

const datasetCopyReference = computed(() => {
    return prepareDataset();
});

const datasetCopy = ref(datasetCopyReference.value)

// v3 - Stop skeleton loader when props.dataset becomes valid
watch(() => props.dataset, (newVal) => {
    if (Array.isArray(newVal) && newVal.length > 0) {
        manualLoading.value = false;
    }
}, { immediate: true });

watch(() => props.dataset, (_) => {
    datasetCopy.value = prepareDataset();
}, { deep: true })

const proportions = computed(() => {
    const numbers = datasetCopy.value
        .filter((serie,i) => !segregated.value.includes(serie.uid))
        .map((serie, i) => {
            if (allDatapointsAreEmpty.value) {
                return 1;
            } else {
                return (serie.values || []).reduce((a,b) => a + b, 0)
            }
        });
    return calculateProportions(numbers);
});

const immutableProportions = computed(() => {
    const numbers = datasetCopy.value
        .map((serie, i) => {
            if (allDatapointsAreEmpty.value) {
                return 1;
            } else {
                return (serie.values || []).reduce((a,b) => a + b);
            }
        });
    return calculateProportions(numbers);
});

const waffleSet = computed(() => {
    FINAL_DATASET.value.forEach((ds, i) => {
        if([null, undefined].includes(ds.values)) {
            error({
                componentName: 'VueUiWaffle',
                type: 'datasetSerieAttribute',
                property: 'values (number[])',
                index: i
            });
        }
    })
    return datasetCopy.value
        .filter((serie, i) => !segregated.value.includes(serie.uid))
        .map((serie, i) => {
            return {
                absoluteIndex: serie.absoluteIndex,
                uid: serie.uid,
                name: serie.name,
                color: serie.color,
                value: (serie.values || []).reduce((a,b) => a + b, 0),
                absoluteValues: serie.values || [],
                proportion: proportions.value[i]
            }
        })
});

const immutableSet = computed(() => {
    return datasetCopy.value
        .map((serie, i) => {
            return {
                absoluteIndex: serie.absoluteIndex,
                uid: serie.uid,
                name: serie.name,
                color: serie.color,
                value: (serie.values || []).reduce((a,b) => a + b, 0),
                absoluteValues: serie.values || [],
                proportion: immutableProportions.value[i]
            }
        })
});

function getData() {
    return immutableSet.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color,
            value: ds.value,
            proportion: ds.proportion
        }
    });
}

const cumulatedSet = computed(() => {
    let cumulativeProportion = 0; 

    return waffleSet.value.map((serie, i) => {
        const start = cumulativeProportion;
        const end = start + serie.proportion; 

        const rects = [];
        for (let j = Math.floor(start); j < Math.floor(end); j += 1) {
            rects.push(j);
        }

        cumulativeProportion = end;

        return {
            ...serie,
            start, 
            rects,
        };
    });
});

const rects = computed(() => {
    return cumulatedSet.value.flatMap((serie, s) => {
        return serie.rects.map((rect, i) => {
            return {
                isFirst: i === 0,
                isLongEnough: rect.length > 2,
                name: serie.name,
                color: serie.color,
                value: serie.value,
                serieIndex: s,
                absoluteStartIndex: i < 3,
                serieId: serie.uid,
                ...serie
            }
        })
    }).map((s, i) => {
        return {
            ...s,
            isAbsoluteFirst: i % FINAL_CONFIG.value.style.chart.layout.grid.size === 0,
        }
    })
});

const positions = computed(() => {
    const grid = [];
    for(let i = 0; i < FINAL_CONFIG.value.style.chart.layout.grid.size; i += 1) {
        for(let j = 0; j < FINAL_CONFIG.value.style.chart.layout.grid.size; j += 1) {
            grid.push({
                isStartOfLine: j === 0,
                position: FINAL_CONFIG.value.style.chart.layout.grid.vertical ? i : j,
                x: (FINAL_CONFIG.value.style.chart.layout.grid.vertical ? i : j) * (rectDimension.value + FINAL_CONFIG.value.style.chart.layout.grid.spaceBetween),
                y: (FINAL_CONFIG.value.style.chart.layout.grid.vertical ? j : i) * (rectDimensionY.value + FINAL_CONFIG.value.style.chart.layout.grid.spaceBetween) + drawingArea.value.top,
            })
        }
    }
    return grid;
});

const segregated = ref([]);
const isAnimating = ref(false);
const rafUp = ref(null);
const rafDown = ref(null);

function segregate(uid) {
    if (allDatapointsAreEmpty.value) return; // No point in segregating anything in this case
    if (!FINAL_CONFIG.value.useAnimation) {
        if(segregated.value.includes(uid)) {
            segregated.value = segregated.value.filter(s => s !== uid);
        } else if(segregated.value.length < legendSet.value.length - 1 && legendSet.value.length > 1) {
            segregated.value.push(uid);
        }
        return
    }

    const target = datasetCopyReference.value.find(el => el.uid === uid).values.reduce((a, b) => a + b, 0);
    const source = datasetCopy.value.find(el => el.uid === uid).values.reduce((a, b) => a + b, 0);
    let initVal = source;

    if (source === 0 && target === 0) return; // Nothing to segregate

    if(segregated.value.includes(uid)) {
        segregated.value = segregated.value.filter(s => s !== uid);
        const targetVal = target;
        function animUp() {
            if(initVal > targetVal) {
                cancelAnimationFrame(rafUp.value);
                datasetCopy.value = datasetCopy.value.map((ds, i) => {
                    if (ds.uid === uid) {
                        return {
                            ...ds,
                            values: [targetVal]
                        }
                    } else {
                        return ds;
                    }
                });
                isAnimating.value = false;
            } else {
                isAnimating.value = true;
                initVal += (targetVal * 0.025)
                datasetCopy.value = datasetCopy.value.map((ds, i) => {
                    if (ds.uid === uid) {
                        return {
                            ...ds,
                            values: [initVal]
                        }
                    } else {
                        return ds;
                    }
                })
                rafUp.value = requestAnimationFrame(animUp);
            }
        }
        animUp()
    } else if(segregated.value.length < legendSet.value.length - 1 && legendSet.value.length > 1) {
        function animDown() {
            if(initVal < source / 100) {
                cancelAnimationFrame(rafDown.value)
                segregated.value.push(uid);
                datasetCopy.value = datasetCopy.value.map((ds, i) => {
                    if (ds.uid === uid) {
                        return {
                            ...ds,
                            values: [0]
                        }
                    } else {
                        return ds;
                    }
                });
                isAnimating.value = false;
            } else {
                isAnimating.value = true;
                initVal /= 1.15;
                datasetCopy.value = datasetCopy.value.map(ds => {
                    if (ds.uid === uid) {
                        return {
                            ...ds,
                            values: [initVal]
                        }
                    } else {
                        return ds;
                    }
                })
                rafDown.value = requestAnimationFrame(animDown);
            }
        }
        animDown();
    }
    emit('selectLegend', waffleSet.value.map(w => {
        return {
            name: w.name,
            color: w.color,
            value: w.value,
            proportion: (w.proportion / (Math.pow(FINAL_CONFIG.value.style.chart.layout.grid.size, 2)))
        }
    }));
}

function validSeriesToToggle(name) {
    if (!immutableSet.value.length) {
        if (FINAL_CONFIG.value.debug) {
            console.warn('VueUiWaffle - There are no series to show.');
        }
        return null;
    }
    const dp = immutableSet.value.find(d => d.name === name);
    if (!dp) {
        if (FINAL_CONFIG.value.debug) {
            console.warn(`VueUiWaffle - Series name not found "${name}"`);
        }
        return null;
    }
    return dp;
}

function showSeries(name) {
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (segregated.value.includes(dp.uid)) {
        segregate(dp.uid);
    }
}

function hideSeries(name) {
    const dp  = validSeriesToToggle(name);
    if (dp === null) return;
    if (!segregated.value.includes(dp.uid))  {
        segregate(dp.uid);
    }
}

const legendSet = computed(() => {
    return datasetCopy.value
        .map((serie, i) => {
            const value = (serie.values || []).reduce((a,b) => a + b, 0);
            const proportion = value / datasetCopy.value.map(ds => (ds.values || []).reduce((a,b) => a + b, 0)).reduce((a, b) => a + b, 0);
            return {
                name: serie.name,
                color: serie.color || customPalette[i] || palette[i] || palette[i % palette.length],
                value,
                proportion,
                uid: serie.uid,
                shape: 'square'
            }
        })
        .map((el, i) => {
            return {
                ...el,
                opacity: segregated.value.includes(el.uid) ? 0.5 : 1,
                segregate: () => segregate(el.uid),
                isSegregated: segregated.value.includes(el.uid),
                display: `${el.name}${FINAL_CONFIG.value.style.chart.legend.showPercentage || FINAL_CONFIG.value.style.chart.legend.showValue ? ': ' : ''}${!FINAL_CONFIG.value.style.chart.legend.showValue ? '' : applyDataLabel(FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.formatter, el.value, dataLabel({
                    p: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix,
                    v: el.value,
                    s: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix,
                    r: FINAL_CONFIG.value.style.chart.legend.roundingValue
                }), { datapoint: el, index: i })}${!FINAL_CONFIG.value.style.chart.legend.showPercentage ? '' :
                !segregated.value.includes(el.uid) ? `${FINAL_CONFIG.value.style.chart.legend.showValue ? ' (' : ''}${isNaN(el.value / total.value) ? '-' : dataLabel({v: el.value /total.value * 100, s: '%', r: FINAL_CONFIG.value.style.chart.legend.roundingPercentage })}${FINAL_CONFIG.value.style.chart.legend.showValue ? ')' : ''}` : `${FINAL_CONFIG.value.style.chart.legend.showValue ? ' (' : ''}- %${FINAL_CONFIG.value.style.chart.legend.showValue ? ')' : ''}` }`
            }
        })
});

const legendConfig = computed(() => {
    return {
        cy: 'waffle-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
});

const total = computed(() => {
    return waffleSet.value.map(s => s.value).reduce((a,b) => a + b, 0);
});

const dataTooltipSlot = ref(null);

const selectedSeriesIndex = ref(null);

function selectDatapoint(index) {
    const selected = rects.value[index];
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint: selected, seriesIndex: selected.serieIndex });
    }
}

function onTrapLeave(index) {
    const selected = rects.value[index];

    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint: selected, seriesIndex: selected.serieIndex});
    }

    selectedSeriesIndex.value = null;
    isTooltip.value = false;
    selectedSerie.value = null;
}

function useTooltip(index) {
    if(segregated.value.length === props.dataset.length) return;
    
    const selected = rects.value[index];

    dataTooltipSlot.value = {
        datapoint: selected,
        seriesIndex: selected.absoluteIndex,
        series: datasetCopy.value,
        config: FINAL_CONFIG.value
    }
    
    if (FINAL_CONFIG.value.events.datapointEnter && selectedSeriesIndex.value !== selected.serieIndex) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint: selected,  seriesIndex: selected.serieIndex })
    }

    selectedSeriesIndex.value = selected.serieIndex;
    isTooltip.value = true;
    selectedSerie.value = rects.value[index].serieIndex;

    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

    if(isFunction(customFormat) && functionReturnsString(() => customFormat({ 
        seriesIndex: rects.value[index].absoluteIndex, 
        datapoint: selected, 
        series: datasetCopy.value, 
        config: FINAL_CONFIG.value}))) {
        tooltipContent.value = customFormat({ 
            seriesIndex: rects.value[index].absoluteIndex, 
            datapoint: selected, 
            series: datasetCopy.value, 
            config: FINAL_CONFIG.value})
    } else {
        let html = "";
    
        html += `<div data-cy="waffle-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor};padding-bottom:6px;margin-bottom:3px;">${selected.name}</div>`; 
        html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 60 60" height="14" width="14"><rect data-cy="waffle-tooltip-marker" x="0" y="0" height="60" width="60" stroke="none" rx="1" fill="${selected.color}" />${slots.pattern ? `<rect x="0" y="0" height="60" width="60" stroke="none" rx="1" stroke="none" fill="url(#pattern_${uid.value}_${selected.absoluteIndex})"/>`: ''}</svg>`;
        if(FINAL_CONFIG.value.style.chart.tooltip.showValue) {
            html += `<b data-cy="waffle-tooltip-value">${applyDataLabel(
                FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.formatter,
                selected.value,
                dataLabel({
                    p:FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix, 
                    v: selected.value, 
                    s: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix, 
                    r: FINAL_CONFIG.value.style.chart.tooltip.roundingValue
                }),
                { 
                    datapoint: selected,
                    seriesIndex: rects.value[index].absoluteIndex,
                    series: datasetCopy.value
                }
            )}</b>`;
        }
        if(FINAL_CONFIG.value.style.chart.tooltip.showPercentage) {
            const dp = dataLabel({
                v: allDatapointsAreEmpty.value ? 1 / FINAL_DATASET.value.length * 100 : selected.value / total.value * 100,
                s: '%',
                r: FINAL_CONFIG.value.style.chart.tooltip.roundingPercentage
            });
            if(!FINAL_CONFIG.value.style.chart.tooltip.showValue) {
                html += `<b>${dp}%</b></div>`;
            } else {
                html += `<span data-cy="waffle-tooltip-percentage">(${dp})</span></div>`;
            }
        }
        tooltipContent.value = html;
    }
}

const emit = defineEmits(['selectLegend']);

const table = computed(() => {
    const head = waffleSet.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color
        }
    });
    const body = waffleSet.value.map(ds => ds.value);
    return { head, body };
});

function getBlurFilter(index) {
    if (FINAL_CONFIG.value.useBlurOnHover && ![null, undefined].includes(selectedSerie.value) && selectedSerie.value !== index) {
        return `url(#blur_${uid.value})`;
    } else {
        return '';
    }
}

function showDataLabel(i, position) {
    if (!FINAL_CONFIG.value.style.chart.layout.labels.captions.show) return false;

    return rects.value.length 
        && !isAnimating.value 
        && !FINAL_CONFIG.value.style.chart.layout.grid.vertical 
        && ((rects.value[i].isFirst 
        && position.position < FINAL_CONFIG.value.style.chart.layout.grid.size - 2) 
        || (rects.value[i].isAbsoluteFirst && i % FINAL_CONFIG.value.style.chart.layout.grid.size === 0 && rects.value[i].absoluteStartIndex))
}

function getCaption(i, position = null) {
    const valueLabel = applyDataLabel(
        FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.formatter,
        rects.value[i].value,
        dataLabel({ p: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix, 
            v: rects.value[i].value, 
            s: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix, 
            r: FINAL_CONFIG.value.style.chart.layout.labels.captions.roundingValue 
        }),
        { datapoint: rects.value[i], position }
    );
    const percentageLabel = dataLabel({ v: rects.value[i].proportion, s: '%', r: FINAL_CONFIG.value.style.chart.layout.labels.captions.roundingPercentage });
    const nameLabel = (FINAL_CONFIG.value.style.chart.layout.labels.captions.serieNameAbbreviation ? abbreviate({ source: rects.value[i].name, length: FINAL_CONFIG.value.style.chart.layout.labels.captions.serieNameMaxAbbreviationSize}) : rects.value[i].name) + (FINAL_CONFIG.value.style.chart.layout.labels.captions.showPercentage || FINAL_CONFIG.value.style.chart.layout.labels.captions.showValue ? ':' : '');

    const name = FINAL_CONFIG.value.style.chart.layout.labels.captions.showSerieName ? nameLabel : '';
    let val = '';

    if (FINAL_CONFIG.value.style.chart.layout.labels.captions.showPercentage && FINAL_CONFIG.value.style.chart.layout.labels.captions.showValue) {
        val = `${percentageLabel} (${valueLabel})`;
    } else if (FINAL_CONFIG.value.style.chart.layout.labels.captions.showPercentage && !FINAL_CONFIG.value.style.chart.layout.labels.captions.showValue) {
        val = percentageLabel;
    } else if (!FINAL_CONFIG.value.style.chart.layout.labels.captions.showPercentage && FINAL_CONFIG.value.style.chart.layout.labels.captions.showValue) {
        val = valueLabel;
    }

    return `${name}${val}`;
}

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
            downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-waffle"})
        } else {
            callback(csvContent);
        }
    });
}

const dataTable = computed(() => {
    const head = [
        ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`,
        applyDataLabel(
            FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.formatter,
            total.value,
            dataLabel({
                p:FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix, 
                v:total.value, 
                s: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix, 
                r: FINAL_CONFIG.value.table.td.roundingValue
            })
        ),
        '100%'
    ];

    const body = table.value.head.map((h,i) => {
        return [
            {
                color: h.color,
                name: h.name
            },
            applyDataLabel(
                FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.formatter,
                table.value.body[i],
                dataLabel({
                    p:FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix, 
                    v: table.value.body[i], 
                    s:FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix, 
                    r:FINAL_CONFIG.value.table.td.roundingValue 
                })
            ),
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
        shape: 'square',
        breakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint
    }

    const colNames = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
        FINAL_CONFIG.value.table.columnNames.percentage
    ]

    return {
        head,
        body,
        config,
        colNames
    }
});

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
    if (!waffleChart.value) return;
    const { width, height } = waffleChart.value.getBoundingClientRect();
    const aspectRatio = width / height; 
    const { imageUri, base64 } = await img({ domElement: waffleChart.value, base64: true, img: true, scale})
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
            fullscreenParent: waffleChart.value,
            forcedWidth: Math.min(500, window.innerWidth * 0.8)
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
})

async function generateSvg({ isCb }) {
    if (isCb) {
        const { blob, url, text, dataUrl } = await getSvg();
        FINAL_CONFIG.value.userOptions.callbacks.svg({ blob, url, text, dataUrl })

    } else {
        exportSvg();
    }
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
        :class="`vue-data-ui-component vue-ui-waffle ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" 
        ref="waffleChart" 
        :id="`vue-ui-waffle_${uid}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor};${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`"
        @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)"
    >
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

        <!-- TITLE AS DIV -->
        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;padding-bottom:12px`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'waffle-title',
                        ...FINAL_CONFIG.style.chart.title
                    },
                    subtitle: {
                        cy: 'waffle-subtitle',
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
            :isPrinting="isPrinting"
            :isImaging="isImaging"
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
            :chartElement="waffleChart"
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
            data-cy="waffle-svg" 
            :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`" 
            :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.chart.color}`" 
        >
            <PackageVersion />

            <!-- DEFS -->
            <defs>
                <radialGradient cx="50%" cy="50%" r="50%" fx="50%" fy="50%" v-for="(rect,i) in rects" :id="`gradient_${uid}_${i}`">
                    <stop offset="0%" :stop-color="setOpacity(shiftHue(rect.color, 0.05), 100 - FINAL_CONFIG.style.chart.layout.rect.gradientIntensity)"/>
                    <stop offset="100%" :stop-color="rect.color" />
                </radialGradient>
            </defs>

            <!-- RECTS -->
            <defs>
                <filter :id="`blur_${uid}`" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" :stdDeviation="2" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
            </defs>

            <!-- CUSTOM CELLS SLOTS -->
            <template v-if="FINAL_CONFIG.useCustomCells && rects.length">
                <foreignObject 
                    v-for="(position, i) in positions"
                    :x="position.x"
                    :y="position.y"
                    :height="rectDimensionY <= 0 ? 0.0001 : rectDimensionY"
                    :width="rectDimension <= 0 ? 0.0001 : rectDimension"
                    class="vue-ui-waffle-custom-cell-foreignObject"
                >
                    <slot name="cell" v-bind="{ cell: {...position, color: rects[i].color, ...rects[i]}, isSelected: [null, undefined].includes(selectedSerie) ? true : rects[i].serieIndex === selectedSerie }"/>
                </foreignObject>
            </template> 

            <rect v-if="!rects.length && !FINAL_CONFIG.useCustomCells"
                :x="12"
                :y="12"
                :height="drawingArea.height - 24"
                :width="drawingArea.width - 24"
                :rx="3"
                fill="none"
                stroke="black"
            />

            <template v-else-if="rects.length && !FINAL_CONFIG.useCustomCells">

                <g v-if="$slots.pattern">
                    <defs v-for="ds in datasetCopyReference">
                        <slot name="pattern" v-bind="{seriesIndex: ds.absoluteIndex, patternId: `pattern_${uid}_${ds.absoluteIndex}`}"/>
                    </defs>
                </g>

                <rect
                    data-cy="datapoint-underlayer"
                    v-for="(position, i) in positions"
                    :rx="FINAL_CONFIG.style.chart.layout.rect.rounded ? FINAL_CONFIG.style.chart.layout.rect.rounding : 0"
                    :x="position.x + FINAL_CONFIG.style.chart.layout.grid.spaceBetween / 2"
                    :y="position.y + FINAL_CONFIG.style.chart.layout.grid.spaceBetween / 2"
                    :height="rectDimensionY <= 0 ? 0.0001 : rectDimensionY"
                    :width="rectDimension <= 0 ? 0.0001 : rectDimension"
                    fill="white"
                    :stroke="FINAL_CONFIG.style.chart.layout.rect.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.rect.strokeWidth"
                    :filter="getBlurFilter(rects[i].serieIndex)"
                />
                <rect
                    data-cy="datapoint-rect"
                    v-for="(position, i) in positions"
                    :rx="FINAL_CONFIG.style.chart.layout.rect.rounded ? FINAL_CONFIG.style.chart.layout.rect.rounding : 0"
                    :x="position.x + FINAL_CONFIG.style.chart.layout.grid.spaceBetween / 2"
                    :y="position.y + FINAL_CONFIG.style.chart.layout.grid.spaceBetween / 2"
                    :height="rectDimensionY <= 0 ? 0.0001 : rectDimensionY"
                    :width="rectDimension <= 0 ? 0.0001 : rectDimension"
                    :fill="FINAL_CONFIG.style.chart.layout.rect.useGradient && FINAL_CONFIG.style.chart.layout.rect.gradientIntensity > 0 ? `url(#gradient_${uid}_${i})` : rects[i].color"
                    :stroke="FINAL_CONFIG.style.chart.layout.rect.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.rect.strokeWidth"
                    :filter="getBlurFilter(rects[i].serieIndex)"
                />
                <g v-if="$slots.pattern">
                    <rect
                        v-for="(position, i) in positions"
                        :rx="FINAL_CONFIG.style.chart.layout.rect.rounded ? FINAL_CONFIG.style.chart.layout.rect.rounding : 0"
                        :x="position.x + FINAL_CONFIG.style.chart.layout.grid.spaceBetween / 2"
                        :y="position.y + FINAL_CONFIG.style.chart.layout.grid.spaceBetween / 2"
                        :height="rectDimensionY <= 0 ? 0.0001 : rectDimensionY"
                        :width="rectDimension <= 0 ? 0.0001 : rectDimension"
                        :fill="`url(#pattern_${uid}_${rects[i].absoluteIndex})`"
                        stroke="none"
                        :filter="getBlurFilter(rects[i].serieIndex)"
                    />
                
                </g>
            </template>

            <!-- DATA LABELS -->
            <template v-for="(position, i) in positions">
                <text
                    :key="`datalabel_${i}`"
                    data-cy="datapoint-caption"
                    v-if="showDataLabel(i, position)"
                    v-text="getCaption(i, position)"
                    :x="(position.x + FINAL_CONFIG.style.chart.layout.labels.captions.offsetX + FINAL_CONFIG.style.chart.layout.grid.spaceBetween / 2) + 6"
                    :y="position.y + FINAL_CONFIG.style.chart.layout.labels.captions.offsetY + FINAL_CONFIG.style.chart.layout.grid.spaceBetween / 2 + absoluteRectDimensionY / 2 + FINAL_CONFIG.style.chart.layout.labels.captions.fontSize / 3"
                    :font-size="FINAL_CONFIG.style.chart.layout.labels.captions.fontSize"
                    :fill="adaptColorToBackground(rects[i].color)"
                    :filter="getBlurFilter(rects[i].serieIndex)"
                />
            </template>
    
            <rect
                data-cy="tooltip-trap"
                v-for="(position, i) in positions"
                :x="position.x + FINAL_CONFIG.style.chart.layout.grid.spaceBetween / 2"
                :y="position.y + FINAL_CONFIG.style.chart.layout.grid.spaceBetween / 2"
                :height="absoluteRectDimensionY"
                :width="absoluteRectDimension"
                fill="transparent"
                stroke="none"
                @mouseover="useTooltip(i)"
                @mouseleave="onTrapLeave(i)"
                @click="selectDatapoint(i)"
            />
            <slot name="svg" :svg="svg"/>
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
                    @clickMarker="({legend}) => segregate(legend.uid)"
                >
                    <template #legend-pattern="{ legend, index }" v-if="$slots.pattern">
                        <Shape
                            :shape="legend.shape"
                            :radius="30"
                            stroke="none"
                            :plot="{ x: 30, y: 30}"
                            :fill="`url(#pattern_${uid}_${index})`"
                        />
                    </template>
    
                    <template #item="{ legend }">
                        <div data-cy="legend-item" @click="legend.segregate()" :style="`opacity:${segregated.includes(legend.uid) ? 0.5 : 1}`">
                            {{ legend.display }}
                        </div>
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
            :show="mutableConfig.showTooltip && isTooltip && segregated.length < props.dataset.length"
            :backgroundColor="FINAL_CONFIG.style.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.chart.tooltip.color"
            :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.chart.tooltip.position"
            :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="waffleChart"
            :content="tooltipContent"
            :isCustom="FINAL_CONFIG.style.chart.tooltip.customFormat && typeof FINAL_CONFIG.style.chart.tooltip.customFormat === 'function'"
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :isFullscreen="isFullscreen"
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
                    <template #th="{th}">
                        <div v-html="th" style="display:flex;align-items:center"></div>
                    </template>
                    <template #td="{td}">
                        {{ td.name || td }}
                    </template>
                </DataTable>
            </template>
        </component>

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading"/>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-waffle *{
    transition: unset;
}
.vue-ui-waffle {
    user-select: none;
    position: relative;
}
.vue-ui-waffle .vue-ui-waffle-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}
</style>