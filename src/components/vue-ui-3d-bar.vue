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
    calcMarkerOffsetX,
    calcMarkerOffsetY,
    calcNutArrowPath,
    checkNaN,
    convertColorToHex, 
    convertCustomPalette, 
    createCsvContent,
    createUid,
    darkenHexColor,
    dataLabel,
    downloadCsv,
    error,
    getMissingDatasetAttributes,
    lightenHexColor,
    makeDonut,
    objectIsEmpty, 
    palette,
    setOpacity,
    themePalettes,
    treeShake,
    XMLNS
} from '../lib';
import { throttle } from "../canvas-lib";
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading";
import { usePrinter } from "../usePrinter";
import { useNestedProp } from "../useNestedProp";
import { useResponsive } from "../useResponsive";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import img from "../img";
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import themes from "../themes.json";
import BaseScanner from "../atoms/BaseScanner.vue";

const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const BaseDraggableDialog = defineAsyncComponent(() => import('../atoms/BaseDraggableDialog.vue'));

const { vue_ui_3d_bar: DEFAULT_CONFIG } = useConfig();

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
    },
});

const emits = defineEmits(['selectDatapoint'])

const isDataset = computed(() => {
    return !!props.dataset && Object.keys(props.dataset).length;
});

const uid = ref(createUid());
const bar3dChart = ref(null);
const selectionIsFixed = ref(false);
const titleStep = ref(0);
const tableStep = ref(0);
const chartTitle = ref(null);
const resizeObserver = ref(null);
const observedEl = ref(null);
const source = ref(null);
const isFocus = ref(false);
const tableUnit = ref(null);
const userOptionsRef = ref(null);

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    callback: () => {
        Promise.resolve().then(async () => {
            await nextTick();
            animateOnLoad();
        })
    },
    skeletonDataset: {
        series: [
            { 
                name: '_', 
                value: 21, 
                breakdown: [
                    { name: '_', value: 13 },
                    { name: '_', value: 8 },
                ]
            },
            { 
                name: '_', 
                value: 13, 
                breakdown: [
                    { name: '_', value: 8 },
                    { name: '_', value: 5 },
                ]
            },
            { 
                name: '_', 
                value: 8, 
                breakdown: [
                    { name: '_', value: 5 },
                    { name: '_', value: 3 },
                ]
            },
        ]
    },
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            customPalette: ['#808080', '#ADADAD', '#DBDBDB'],
            userOptions: { show: false },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    color: '#6A6A6A',
                    bar: {
                        color: '#ADADAD',
                        stroke: '#6A6A6A'
                    },
                    box: {
                        stroke: '#6A6A6A'
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
                userConfig: themes.vue_ui_3d_bar[mergedConfig.theme] || props.config,
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

    // Reset mutable config
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `3d_bar_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-3d-bar',
    options: FINAL_CONFIG.value.userOptions.print
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show
});

// v3 - Essential to make shifting between loading config and final config work
watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
        showTable: FINAL_CONFIG.value.table.show
    }
}, { immediate: true });

const hasStack = computed(() => {
    return FINAL_DATASET.value.series && FINAL_DATASET.value.series.length;
});

const WIDTH = ref(FINAL_CONFIG.value.style.chart.box.dimensions.width * (hasStack.value ? 2 : 1 ));
const HEIGHT = ref(FINAL_CONFIG.value.style.chart.box.dimensions.height);

const svg = computed(() => {
    return {
        height: HEIGHT.value,
        width: WIDTH.value,
        absoluteWidth: WIDTH.value,
        top: FINAL_CONFIG.value.style.chart.box.dimensions.top,
        bottom: FINAL_CONFIG.value.style.chart.box.dimensions.bottom,
        left: FINAL_CONFIG.value.style.chart.box.dimensions.left,
        right: FINAL_CONFIG.value.style.chart.box.dimensions.right,
        perspective: FINAL_CONFIG.value.style.chart.box.dimensions.perspective
    }
});

const stack = computed(() => {
    if(hasStack.value) {
        const total = FINAL_DATASET.value.series.map(s => s.value || 0).reduce((a, b) => a + b, 0);
        const formatted = FINAL_DATASET.value.series.map((ds, i) => {
            return {
                ...ds,
                seriesIndex: i,
                id: createUid(),
                proportion: (ds.value || 0) / total,
                color: convertColorToHex(ds.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
                breakdown: ds.breakdown ? ds.breakdown.sort((a,b) => b.value - a.value) : null
            }
        })
        .sort((a, b) => b.value - a.value)
        const res = [];
        let start = 0;
        for(let i = 0; i < formatted.length; i += 1) {
            res.push({
                ...formatted[i],
                fill: createFill(start, formatted[i].proportion, formatted[i].breakdown, formatted[i].color)
            });
            start += formatted[i].proportion
        }
        return res
    }
    return null
})

const box = computed(() => {
    const CENTER_X = svg.value.width / 2;

    return {
        right: `M${CENTER_X},${svg.value.top} ${svg.value.width - svg.value.right}, ${svg.value.top + svg.value.perspective} ${svg.value.width - svg.value.right},${svg.value.height - svg.value.bottom - svg.value.perspective} ${CENTER_X},${svg.value.height - svg.value.bottom}`,
        left: `M${CENTER_X},${svg.value.top} ${svg.value.left},${svg.value.top + svg.value.perspective} ${svg.value.left},${svg.value.height - svg.value.bottom - svg.value.perspective} ${CENTER_X},${svg.value.height - svg.value.bottom}`,
        side: `M${CENTER_X},${svg.value.height - svg.value.bottom} ${CENTER_X},${svg.value.top + (svg.value.perspective * 2)}`,
        topSides: `M${svg.value.left},${svg.value.top + svg.value.perspective} ${CENTER_X},${svg.value.top + (svg.value.perspective * 2)} ${svg.value.width - svg.value.right},${svg.value.top + svg.value.perspective}`,
        tubeTop: `M${svg.value.left},${svg.value.top + svg.value.perspective} C ${svg.value.left},${svg.value.top - (svg.value.perspective / 3)} ${svg.value.width - svg.value.right},${svg.value.top - (svg.value.perspective / 3)} ${svg.value.width - svg.value.right},${svg.value.top + svg.value.perspective} C ${svg.value.width - svg.value.right},${svg.value.top + (svg.value.perspective * 2.3)} ${svg.value.left},${svg.value.top + (svg.value.perspective * 2.3)} ${svg.value.left},${svg.value.top + svg.value.perspective}`,
        tubeLeft: `M${svg.value.left},${svg.value.top + svg.value.perspective} ${svg.value.left},${svg.value.height - svg.value.bottom - svg.value.perspective}`,
        tubeRight: `M${svg.value.width - svg.value.right},${svg.value.top + svg.value.perspective} ${svg.value.width - svg.value.right},${svg.value.height - svg.value.bottom - svg.value.perspective}`,
        tubeBottom: `M${svg.value.width - svg.value.right},${svg.value.height - svg.value.bottom - svg.value.perspective} C ${svg.value.width - svg.value.right},${svg.value.height} ${svg.value.left},${svg.value.height} ${svg.value.left},${svg.value.height - svg.value.bottom - svg.value.perspective}`
    }
});

const activeValue = ref(FINAL_CONFIG.value.style.chart.animation.use ? 0 : FINAL_DATASET.value.percentage);

function animateOnLoad() {
    let acceleration = 0;
    let speed = FINAL_CONFIG.value.style.chart.animation.speed;
    let incr = (0.005) * FINAL_CONFIG.value.style.chart.animation.acceleration;
    function animate() {
        activeValue.value += speed + acceleration;
        acceleration += incr;
        if(activeValue.value < FINAL_DATASET.value.percentage) {
            requestAnimationFrame(animate)
        } else {
            activeValue.value = FINAL_DATASET.value.percentage
        }
    }

    if(FINAL_CONFIG.value.style.chart.animation.use) {
        activeValue.value = 0;
        animate()
    }
}

onMounted(() => {
    prepareChart();
    animateOnLoad();
})

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUi3dBar',
            type: 'dataset',
            debug: debug.value
        });
    } else {
        if(!props.dataset.series) {
            getMissingDatasetAttributes({
                datasetObject: props.dataset,
                requiredAttributes: ['percentage']
            }).forEach(attr => {
                error({
                    componentName: 'VueUi3dBar',
                    type: 'datasetAttribute',
                    property: attr,
                    debug: debug.value
                })
            })
        } else {
            props.dataset.series.forEach((serie, i) => {
                getMissingDatasetAttributes({
                    datasetObject: serie,
                    requiredAttributes: ['name', 'value']
                }).forEach(attr => {
                    error({
                        componentName: 'VueUi3dBar',
                        type: 'datasetSerieAttribute',
                        property: attr,
                        index: i,
                        debug: debug.value
                    })
                });
                if(serie.breakdown) {
                    serie.breakdown.forEach((b, j) => {
                        getMissingDatasetAttributes({
                            datasetObject: b,
                            requiredAttributes: ['name', 'value']
                        }).forEach(attr => {
                            error({
                                componentName: 'VueUi3dBar',
                                type: 'datasetSerieAttribute',
                                property: attr,
                                index: `${i} - ${j}`,
                                debug: debug.value
                            })
                        })
                    })
                }
            })
        }
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: bar3dChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                source: source.value
            });

            requestAnimationFrame(() => {
                HEIGHT.value = height - 12;
                WIDTH.value = width;
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = bar3dChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }
}

const CX = computed(() => {
    const W = svg.value.width;
    return W / 4;
});

function createFill(startProportion, proportion, breakdown, color) {

    const _height = svg.value.height - svg.value.bottom - svg.value.top - (svg.value.perspective * 2);

    const { width: W, height: H, bottom: B, right: R, left: L,  perspective: P} = svg.value;
    
    const CENTER_X = hasStack.value ? W / 4 : W / 2;
    const RIGHT = (CENTER_X * 2) + (L);

    const relativeB = B + _height * startProportion;
    const midY = H - relativeB - P - (_height * proportion / 2);
    const donutPosition = midY > svg.value.height / 2 ? 'top' : 'bottom';
    const donutOffset = H * 0.25;

    const hasBreakdown = !!breakdown;
    let donut = null;
    let miniDonut = null;
    if (hasBreakdown) {
        breakdown = breakdown
            .map((ds, i) => {
            return {
                ...ds,
                value: ds.value || 0,
                color: lightenHexColor(color, i / (breakdown.length))
            }
        });
        donut = makeDonut(
            { series: breakdown },
            W / 2 + W / 5,
            donutPosition === 'top' ? midY - donutOffset : midY + donutOffset,
            W / 10,
            W / 10,
            1.99999,
            2,
            1,
            360,
            105.25,
            W / 20
        );
        miniDonut = makeDonut(
            { series: breakdown },
            W - RIGHT + W / 14,
            H - relativeB - P - (_height * proportion /2),
            W / 40,
            W / 40,
            1.99999,
            2,
            1,
            360,
            105.25,
            W / 40
        )
    }

    const result = {
        donut,
        miniDonut,
        donutR: W / 20,
        CENTER_X,
        sidePointer: {
            x: W - RIGHT,
            x2: W - RIGHT + W / 14,
            xText: W - RIGHT + W / 9,
            y: H - relativeB - P - (_height * proportion / 2),
            topY: H - relativeB - P - _height * proportion,
            height: _height * proportion
        },
        apexBottom: {y: H - relativeB, x: CENTER_X},
        apexTop: {y: H - relativeB - _height * proportion, x: CENTER_X},
        right: `M${CENTER_X},${H - relativeB} ${CENTER_X},${H - relativeB - _height * proportion} ${W - RIGHT},${H - relativeB - P - _height * proportion} ${W - RIGHT},${H - relativeB - P}Z`,
        left: `M${CENTER_X},${H - relativeB} ${CENTER_X},${H - relativeB - _height * proportion} ${L}, ${H - relativeB - P - _height * proportion} ${L},${H - relativeB - P}Z`,
        liningTop: `M${L},${H - relativeB - P - _height * proportion} ${CENTER_X},${H - relativeB - _height * proportion} ${W - RIGHT},${H - relativeB - P - _height * proportion}`,
        liningTopShade: `M${L},${H - relativeB - P - _height * proportion -0.5} ${CENTER_X},${H - relativeB - _height * proportion - 0.5} ${W - RIGHT},${H - relativeB - P - _height * proportion - 0.5}`,
        top: `M${CENTER_X},${H - relativeB - _height * proportion} ${L},${H - relativeB - P - _height * proportion} ${CENTER_X},${H - relativeB - (P * 2) - (_height * proportion)} ${W - RIGHT},${H - relativeB - P - _height * proportion} Z`,
        tubeTop: `M${L},${H - relativeB - _height * proportion - P} C ${L},${H - relativeB - _height * proportion - (P *2.5)} ${W - RIGHT},${H - relativeB - _height * proportion - (P * 2.5)} ${W - RIGHT},${H - relativeB - _height * proportion - P} C ${W - RIGHT},${H - relativeB - _height * proportion + P /2} ${L},${H - relativeB - _height * proportion + P / 2} ${L},${H - relativeB - _height * proportion - P}`,
        bottomTubeTop: `M ${W - RIGHT - 0.5},${H - relativeB - P} C ${W - RIGHT - 0.5},${H - relativeB + P/2} ${L},${H - relativeB + P/2} ${L + 0.5},${H - relativeB - P}`,
        tubeBody: `M
        ${L},${H - relativeB - _height * proportion - P} 
        C ${L},${H - relativeB - _height * proportion + P / 2} 
        ${W - RIGHT},${H - relativeB - _height * proportion + P /2} 
        ${W - RIGHT},${H - relativeB - _height * proportion - P} 
        L${W - RIGHT},${H - relativeB - P}
        C 
        ${W - RIGHT},${H - relativeB + P/2}
        ${L},${H - relativeB + P/2}
        ${L},${H - relativeB - P}Z`
    }

    return result;
}

const fill = computed(() => {
    const proportion = checkNaN(activeValue.value / 100);
    const height = svg.value.height - svg.value.bottom - svg.value.top - (svg.value.perspective * 2);
    const { width: W, height: H, bottom: B, right: R, left: L,  perspective: P} = svg.value;

    const CENTER_X = hasStack.value ? W / 4 : W / 2;
    const RIGHT = hasStack.value ? (CENTER_X * 2) + (L) : R

    const startProportion = 0;
    const relativeB = B + height * startProportion;

    const result = {
        right: `M${CENTER_X},${H - relativeB} ${CENTER_X},${H - relativeB - height * proportion} ${W - RIGHT},${H - relativeB - P - height * proportion} ${W - RIGHT},${H - relativeB - P}Z`,
        left: `M${CENTER_X},${H - relativeB} ${CENTER_X},${H - relativeB - height * proportion} ${L}, ${H - relativeB - P - height * proportion} ${L},${H - relativeB - P}Z`,
        top: `M${CENTER_X},${H - relativeB - height * proportion} ${L},${H - relativeB - P - height * proportion} ${CENTER_X},${H - relativeB - (P * 2) - (height * proportion)} ${W - RIGHT},${H - relativeB - P - height * proportion} Z`,
        tubeTop: `M${L},${H - relativeB - height * proportion - P} C ${L},${H - relativeB - height * proportion - (P *2.5)} ${W - RIGHT},${H - relativeB - height * proportion - (P * 2.5)} ${W - RIGHT},${H - relativeB - height * proportion - P} C ${W - RIGHT},${H - relativeB - height * proportion + P /2} ${L},${H - relativeB - height * proportion + P / 2} ${L},${H - relativeB - height * proportion - P}`,
        tubeBody: `M
        ${L},${H - relativeB - height * proportion - P} 
        C ${L},${H - relativeB - height * proportion + P / 2} 
        ${W - RIGHT},${H - relativeB - height * proportion + P /2} 
        ${W - RIGHT},${H - relativeB - height * proportion - P} 
        L${W - RIGHT},${H - P * 1.5}
        C 
        ${W - RIGHT},${H}
        ${L},${H}
        ${L},${H - relativeB - P}Z`
    }

    return result
});

const selectedSerie = ref(null);

function selectSerie(bar, fix = false) {
    if (FINAL_CONFIG.value.events.datapointEnter && !fix) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint: bar, seriesIndex: bar.seriesIndex });
    }

    if (FINAL_CONFIG.value.events.datapointClick && fix) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint: bar, seriesIndex: bar.seriesIndex });
    }

    emits('selectDatapoint', bar)
    if(!fix) {
        selectedSerie.value = bar.id;
    }
    if(fix && selectionIsFixed.value) {
        selectionIsFixed.value = false;
    }
    if(fix && !selectionIsFixed.value) {
        selectionIsFixed.value = true;
    }
}

function unselectSerie(bar) {
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint: bar, seriesIndex: bar.seriesIndex });
    }

    if(selectionIsFixed.value) {
        return
    } else {
        selectedSerie.value = null
    }
}

function displayArcPercentage(arc, stepBreakdown, numOnly = false) {
    const total = FINAL_DATASET.value.series.map(s => s.value || 0).reduce((a, b) => a + b, 0);
    const absoluteP =  isNaN(arc.value / total) ? 0 : ((arc.value / total) * 100);
    const p = isNaN(arc.value / sumValues(stepBreakdown)) ? 0 : ((arc.value / sumValues(stepBreakdown)) * 100);
    if(numOnly) {
        return p
    } else {
        return absoluteP.toFixed(0) + "%";
    }
}

function sumValues(src) {
    return [...src].map(s => s.value).reduce((a, b) => a + b, 0);
}

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
}

function getData() {
    if(hasStack.value) {
        return stack.value
    } else {
        return FINAL_DATASET.value.percentage
    }
}

const table = computed(() => {
    if(!hasStack.value) {
        return null
    } else {
        const head = stack.value.flatMap(ds => {
            if(ds.breakdown && ds.breakdown.length) {
                return [{ name: ds.name, color: ds.color },...ds.breakdown.map((b, i) => {
                    return {
                        name: b.name,
                        color: lightenHexColor(ds.color, i / ds.breakdown.length)
                    }
                })]
            } else {
                return {
                    name: ds.name,
                    color: ds.color
                }
            }
        });
        const body = stack.value.flatMap(ds => {
            if(ds.breakdown && ds.breakdown.length) {
                return [ds.value, ...ds.breakdown.map(b => b.value)]
            } else {
                return ds.value
            }
        });
        return { head, body }
    }
});

function generateCsv(callback=null) {
    if(!hasStack.value) {
        console.warn('VueUi3dBar : CSV download is only available in stack mode (providing dataset.series instead of dataset.percentage)');
        return;
    }
    nextTick(() => {
        const total = stack.value.map(ds => ds.value).reduce((a, b) => a + b, 0);
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [isNaN(table.value.body[i] / total) ? '-' : table.value.body[i] / total * 100]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text],[FINAL_CONFIG.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        if (!callback) {
            downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-3d-bar" })
        } else {
            callback(csvContent);
        }
    });
}

const dataTable = computed(() => {
    const total = stack.value.map(ds => ds.value).reduce((a, b) => a + b, 0);
    const head = [
        ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`, dataLabel({p: FINAL_CONFIG.value.style.chart.legend.prefix, v: total, s: FINAL_CONFIG.value.style.chart.legend.suffix, r: FINAL_CONFIG.value.table.td.roundingValue}),
        '100%'
    ];

    const body = table.value.head.map((h,i) => {
        const label = dataLabel({p: FINAL_CONFIG.value.style.chart.legend.prefix, v: table.value.body[i], s: FINAL_CONFIG.value.style.chart.legend.suffix, r: FINAL_CONFIG.value.table.td.roundingValue});
        return [
            {
                color: h.color,
                name: h.name
            },
            label,
            isNaN(table.value.body[i] / total) ? "-" : dataLabel({
                v: table.value.body[i] / total * 100,
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
        breakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint,
        shape: FINAL_CONFIG.value.style.shape === 'tube' ? 'circle' : 'square'
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

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

async function getImage({ scale = 2} = {}) {
    if (!bar3dChart.value) return
    const { width, height } = bar3dChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: bar3dChart.value, base64: true, img: true, scale })
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
            fullscreenParent: bar3dChart.value,
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

defineExpose({
    getImage,
    generateCsv,
    generatePdf,
    generateImage,
    getData,
    toggleTable,
    toggleAnnotator,
    toggleFullscreen
});
</script>

<template>
    <div ref="bar3dChart" :class="`vue-ui-3d-bar`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`" :id="`3d_bar_${uid}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent`">
            <!-- TITLE AS DIV -->
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: '3dBar-div-title',
                        ...FINAL_CONFIG.style.chart.title
                    },
                    subtitle: {
                        cy: '3dBar-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="userOptionsRef"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasTable="!!hasStack && FINAL_CONFIG.userOptions.buttons.table"
            :hasXls="!!hasStack && FINAL_CONFIG.userOptions.buttons.csv"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="bar3dChart"
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
            @toggleTable="toggleTable"
            @toggleAnnotator="toggleAnnotator"
            :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }"
        >
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }"/>
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

        <svg
            ref="svgRef"
            :xmlns="XMLNS" 
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen, 'animated': FINAL_CONFIG.useCssAnimation }" 
            data-cy="3d-bar-svg" 
            :viewBox="`0 0 ${svg.absoluteWidth} ${svg.height}`" 
            :style="`max-width:100%; overflow: visible; background:transparent;color:${FINAL_CONFIG.style.chart.color}`"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="0"
                :y="0"
                :width="svg.absoluteWidth"
                :height="svg.height"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>

            <!-- DEFS -->
            <defs>
                <radialGradient :id="`gradient_top${uid}`">
                    <stop offset="0%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.backgroundColor, 0)" />
                    <stop offset="100%" :stop-color="FINAL_CONFIG.style.chart.bar.color" />
                </radialGradient>
                <radialGradient :id="`gradient_tube_top${uid}`">
                    <stop offset="0%" :stop-color="setOpacity(lightenHexColor(FINAL_CONFIG.style.chart.bar.color, 0.5), 80)" />
                    <stop offset="100%" :stop-color="setOpacity(darkenHexColor(FINAL_CONFIG.style.chart.bar.color, 0.1), 80)" />
                </radialGradient>
                <radialGradient :id="`gradient_left${uid}`">
                    <stop offset="0%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.backgroundColor, 0)" />
                    <stop offset="100%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.bar.color, 20)" />
                </radialGradient>
                <radialGradient :id="`gradient_right${uid}`">
                    <stop offset="0%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.backgroundColor, 0)" />
                    <stop offset="100%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.bar.color, 20)" />
                </radialGradient>
                <linearGradient :id="`gradient_tube_body${uid}`" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" :stop-color="`${FINAL_CONFIG.style.chart.bar.color}`"/>
                    <stop offset="10%" :stop-color="setOpacity(darkenHexColor(FINAL_CONFIG.style.chart.bar.color, 0.7), 100)"/>
                    <stop offset="25%" :stop-color="setOpacity(darkenHexColor(FINAL_CONFIG.style.chart.bar.color, 0.5), 100)"/>
                    <stop offset="75%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.bar.color, 80)"/>
                    <stop offset="100%" :stop-color="setOpacity(lightenHexColor(FINAL_CONFIG.style.chart.bar.color, 0.7), 100)"/>
                </linearGradient>
            </defs>

            <defs v-if="hasStack">
                <radialGradient v-for="bar in stack" :id="`grad_top_${bar.id}`">
                    <stop offset="0%" :stop-color="setOpacity(lightenHexColor(bar.color, 0.5), 80)" />
                    <stop offset="100%" :stop-color="bar.color" />
                </radialGradient>
                <linearGradient v-for="bar in stack" :id="`grad_left_${bar.id}`">
                    <stop offset="0%" :stop-color="setOpacity(bar.color, 80)" />
                    <stop offset="100%" :stop-color="setOpacity(darkenHexColor(bar.color, 0.5), 100)" />
                </linearGradient>
                <linearGradient v-for="bar in stack" :id="`grad_right_${bar.id}`">
                    <stop offset="2%" :stop-color="setOpacity(lightenHexColor(bar.color, 0.5), 100)" />
                    <stop offset="100%" :stop-color="setOpacity(bar.color, 80)" />
                </linearGradient>
                <linearGradient x1="0%" y1="0%" x2="0%" y2="100%" :id="`vertical_line_${uid}`">
                    <stop offset="0%" stop-color="#FFFFFF"/>
                    <stop offset="100%" stop-color="#FFFFFF33"/>
                </linearGradient>
            </defs>

            <text
                data-cy="vue-ui-3d-bar-simple-datalabel"
                v-if="FINAL_CONFIG.style.chart.dataLabel.show && ![null, undefined].includes(FINAL_DATASET.percentage) && [null, undefined].includes(FINAL_DATASET.series)"
                :x="svg.width / 2"
                :y="svg.top - FINAL_CONFIG.style.chart.dataLabel.fontSize / 2"
                :font-size="FINAL_CONFIG.style.chart.dataLabel.fontSize"
                :font-weight="FINAL_CONFIG.style.chart.dataLabel.bold ? 'bold': 'normal'"
                :fill="FINAL_CONFIG.style.chart.dataLabel.color"
                text-anchor="middle"
            >
                {{ dataLabel({
                    v: activeValue,
                    s: '%',
                    r: FINAL_CONFIG.style.chart.dataLabel.rounding
                })}}
            </text>
            
            <!-- FIX KILLER -->
            <g
                v-if="selectionIsFixed"
                role="button"
                tabindex="0"
                aria-label="Clear selection"
                @click="selectionIsFixed = false; selectedSerie = null"
                @keydown.enter.prevent="selectionIsFixed = false; selectedSerie = null"
                @keydown.space.prevent="selectionIsFixed = false; selectedSerie = null"
                @focus="isFocus = true"
                @blur="isFocus = false"
                @mouseenter="isFocus = true"
                @mouseleave="isFocus = false"
                class="svg-btn"
                data-dom-to-png-ignore
                style="cursor:pointer; outline: none;"
            >
                <title>Clear selection</title>

                <rect
                    :x="CX - 12" :y="svg.top - 24" :width="24" :height="24"
                    fill="transparent" pointer-events="all"
                />

                <circle
                    :cx="CX" :cy="svg.top - 12" r="10"
                    fill="none"
                    :stroke="FINAL_CONFIG.style.chart.color"
                    stroke-width="2"
                    vector-effect="non-scaling-stroke"
                    :opacity="isFocus ? 0.5 : 0"
                />

                <path
                    :d="`M${CX - 6},${svg.top - 18} ${CX + 6},${svg.top - 6}`"
                    :stroke="FINAL_CONFIG.style.chart.color"
                    stroke-linecap="round" stroke-width="2"
                    vector-effect="non-scaling-stroke"
                />
                <path
                    :d="`M${CX + 6},${svg.top - 18} ${CX - 6},${svg.top - 6}`"
                    :stroke="FINAL_CONFIG.style.chart.color"
                    stroke-linecap="round" stroke-width="2"
                    vector-effect="non-scaling-stroke"
                />
            </g>

            <g v-if="!FINAL_CONFIG.style.shape || FINAL_CONFIG.style.shape === 'bar'">            
                <!-- BOX SKELETON -->
                <g v-if="!hasStack">
                    <path :stroke-dasharray="FINAL_CONFIG.style.chart.box.strokeDasharray" :d="box.right" :stroke="FINAL_CONFIG.style.chart.box.stroke" :stroke-width="FINAL_CONFIG.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <path :stroke-dasharray="FINAL_CONFIG.style.chart.box.strokeDasharray" :d="box.left" :stroke="FINAL_CONFIG.style.chart.box.stroke" :stroke-width="FINAL_CONFIG.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <path :stroke-dasharray="FINAL_CONFIG.style.chart.box.strokeDasharray" :d="box.side" :stroke="FINAL_CONFIG.style.chart.box.stroke" :stroke-width="FINAL_CONFIG.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <path :stroke-dasharray="FINAL_CONFIG.style.chart.box.strokeDasharray" :d="box.topSides" :stroke="FINAL_CONFIG.style.chart.box.stroke" :stroke-width="FINAL_CONFIG.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                </g>

                <!-- FILL BOX -->
                <g v-if="!hasStack">
                    <path :d="fill.right" :stroke="FINAL_CONFIG.style.chart.bar.stroke" :stroke-width="FINAL_CONFIG.style.chart.bar.strokeWidth" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_right${uid})`"/>
                    <path :d="fill.left" :stroke="FINAL_CONFIG.style.chart.bar.stroke" :stroke-width="FINAL_CONFIG.style.chart.bar.strokeWidth" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_left${uid})`"/>
                    <path :d="fill.top" :stroke="FINAL_CONFIG.style.chart.bar.stroke" :stroke-width="FINAL_CONFIG.style.chart.bar.strokeWidth" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_top${uid})`"/>
                </g>
                
                <g v-if="hasStack">
                    <g v-for="(bar, i) in stack" :style="`opacity:${selectedSerie ? selectedSerie === bar.id ? 1 : 0.3 : 1}`" class="vue-ui-3d-bar-stack" :data-cy="`bar-3d-value-${bar.value}`">
                        <path :d="bar.fill.right" :fill="`url(#grad_right_${bar.id})`" @mouseenter="selectSerie(bar)" @click="selectSerie(bar, true)" @mouseout="unselectSerie(bar)"/>
                        <path :d="bar.fill.left" :fill="`url(#grad_left_${bar.id})`" @mouseenter="selectSerie(bar)" @click="selectSerie(bar, true)" @mouseout="unselectSerie(bar)"/>
                        <path :d="bar.fill.top" :fill="`url(#grad_top_${bar.id})`" @mouseenter="selectSerie(bar)" @click="selectSerie(bar, true)" @mouseout="unselectSerie(bar)"/>
                        <path :d="bar.fill.liningTop" stroke="#FFFFFF" stroke-width="0.5" stroke-linecap="round" fill="none" @mouseenter="selectSerie(bar)" @click="selectSerie(bar, true)" @mouseout="unselectSerie(bar)" />
                        
                        <path :d="`M ${bar.fill.apexTop.x},${bar.fill.apexTop.y} ${bar.fill.apexBottom.x},${bar.fill.apexBottom.y}`" :stroke="`#FFFFFF`" stroke-width="0.5" stroke-linecap="round"/> 
                    </g>
                    <g v-for="(bar, i) in stack">
                        <path v-if="i !== stack.length - 1" :d="bar.fill.liningTopShade" :stroke="FINAL_CONFIG.style.chart.bar.shadeColor" stroke-width="0.5" stroke-linecap="round" fill="none" style="pointer-events: none;" />
                    </g>
                    <!-- LEGEND (parallelogram) -->
                    <g v-for="(bar, i) in stack" :style="`opacity:${selectedSerie ? selectedSerie === bar.id ? 1 : 0 : bar.proportion * 100 > FINAL_CONFIG.style.chart.legend.hideUnderPercentage ? 1 : 0}`" @click="emits('selectDatapoint', bar)">

                        <path 
                            :stroke="FINAL_CONFIG.style.chart.color" 
                            stroke-dasharray="1" 
                            stroke-width="0.5" 
                            stroke-linecap="round" 
                            :d="`M${bar.fill.sidePointer.x},${bar.fill.sidePointer.y} ${bar.fill.sidePointer.x2},${bar.fill.sidePointer.y}`"
                        />

                        <circle 
                            v-if="!bar.fill.miniDonut || !!selectedSerie"
                            :cx="bar.fill.sidePointer.x2" 
                            :cy="bar.fill.sidePointer.y" 
                            :r="2" 
                            :fill="bar.color" 
                            :stroke="FINAL_CONFIG.style.chart.backgroundColor" 
                        />

                        <rect
                            v-if="loading"
                            :x="bar.fill.sidePointer.xText"
                            :y="bar.fill.sidePointer.y - FINAL_CONFIG.style.chart.legend.fontSize / 2"
                            :width="svg.width / 3"
                            :height="FINAL_CONFIG.style.chart.legend.fontSize"
                            fill="#6A6A6A80"
                            rx="3"
                        />

                        <foreignObject 
                            :x="bar.fill.sidePointer.xText" 
                            :y="bar.fill.sidePointer.y - FINAL_CONFIG.style.chart.legend.fontSize" 
                            :width="svg.absoluteWidth / 3" 
                            :height="FINAL_CONFIG.style.chart.legend.fontSize * 2" 
                            style="overflow: visible; position: relative"
                            v-if="!loading"
                        >
                            <div v-if="FINAL_CONFIG.style.chart.legend.showDefault" :style="`height: 100%; width: 100%; display: flex; flex-direction: row; flex-wrap: wrap; align-items:center;justify-content: flex-start; font-size:${FINAL_CONFIG.style.chart.legend.fontSize}px; text-align:left; line-height: ${FINAL_CONFIG.style.chart.legend.fontSize}px; color:${FINAL_CONFIG.style.chart.legend.color}`">
                                {{ applyDataLabel(
                                    FINAL_CONFIG.style.chart.dataLabel.formatter,
                                    bar.value,
                                    `${bar.name}: ${dataLabel({v: bar.proportion * 100, s: '%', r: FINAL_CONFIG.style.chart.legend.roundingPercentage})} (${dataLabel({ 
                                        p: FINAL_CONFIG.style.chart.legend.prefix, 
                                        v: bar.value, 
                                        s: FINAL_CONFIG.style.chart.legend.suffix, 
                                        r: FINAL_CONFIG.style.chart.legend.roundingValue
                                    })})`,
                                    { datapoint: bar, seriesIndex: i, type: 'barDatapoint' }
                                    )
                                }}
                            </div>
                            <slot name="legend" v-bind="{ datapoint: bar, config: FINAL_CONFIG, dataset: stack}"/>
                        </foreignObject>

                        <!-- BREAKDOWN DONUT -->
                        <g v-if="bar.fill.donut && selectedSerie === bar.id">  
                            <!-- DONUT LABEL CONNECTOR -->
                            <g v-for="(arc, j) in bar.fill.donut">                            
                                <path
                                    v-if="displayArcPercentage(arc, bar.fill.donut, true) > 6"
                                    :d="calcNutArrowPath(arc, {x: arc.cx, y: arc.cy}, 0, 8, false, true, 10)"
                                    :stroke="arc.color"
                                    class="vue-ui-donut-arc-path"
                                    stroke-width="0.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    fill="none"
                                />
                            </g>

                            <path 
                                v-for="(arc, j) in bar.fill.donut"
                                class="vue-ui-donut-arc-path"
                                :data-cy="`donut-arc-${j}`"
                                :d="arc.arcSlice" 
                                :fill="`${arc.color}`"
                                :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                                :stroke-width="1"
                            />

                            <!-- DONUT DATALABELS -->
                            <g v-for="(arc, i) in bar.fill.donut">
                                <g v-if="displayArcPercentage(arc, bar.fill.donut, true) > 6">                                
                                    <text
                                        :text-anchor="calcMarkerOffsetX(arc, true, 0).anchor"
                                        :x="calcMarkerOffsetX(arc, true, 2).x"
                                        :y="calcMarkerOffsetY(arc, 12, 12)"
                                        :fill="FINAL_CONFIG.style.chart.legend.color"
                                        :font-size="FINAL_CONFIG.style.chart.legend.fontSize / 1.5"
                                    >
                                        {{ applyDataLabel(
                                            FINAL_CONFIG.style.chart.dataLabel.formatter,
                                            arc.value,
                                            `${displayArcPercentage(arc, bar.fill.donut)} (${dataLabel({
                                                p: FINAL_CONFIG.style.chart.legend.prefix, 
                                                v: arc.value, 
                                                s: FINAL_CONFIG.style.chart.legend.suffix, 
                                                r: FINAL_CONFIG.style.chart.legend.roundingValue
                                            })})`,
                                            { datapoint: arc, seriesIndex: i, type: 'donutDatapoint' }
                                        )}}
                                    </text>
                                    <text
                                        :text-anchor="calcMarkerOffsetX(arc).anchor"
                                        :x="calcMarkerOffsetX(arc, true, 2).x"
                                        :y="calcMarkerOffsetY(arc, 12, 12) + FINAL_CONFIG.style.chart.legend.fontSize / 1.5"
                                        :fill="FINAL_CONFIG.style.chart.legend.color"
                                        :font-size="FINAL_CONFIG.style.chart.legend.fontSize / 1.5"
                                    >
                                        {{ arc.name }}
                                    </text>
                                </g>
                            </g>
                        </g>

                        <!-- BREAKDOWN MINI DONUT -->
                        <g v-if="bar.fill.miniDonut && !selectedSerie">  
                            <path 
                                v-for="(arc, j) in bar.fill.miniDonut"
                                class="vue-ui-donut-arc-path"
                                :data-cy="`donut-arc-${j}`"
                                :d="arc.arcSlice" 
                                :fill="`${arc.color}`"
                                :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                                :stroke-width="0.5"
                            />
                        </g>
                    </g>
                </g>
            </g>

            <g v-if="FINAL_CONFIG.style.shape === 'tube'">
                <g v-if="!hasStack">
                    <!-- TUBE SKELETON -->
                    <path :stroke-dasharray="FINAL_CONFIG.style.chart.box.strokeDasharray" :d="box.tubeTop" :stroke="FINAL_CONFIG.style.chart.box.stroke" :stroke-width="FINAL_CONFIG.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <path :stroke-dasharray="FINAL_CONFIG.style.chart.box.strokeDasharray" :d="box.tubeLeft" :stroke="FINAL_CONFIG.style.chart.box.stroke" :stroke-width="FINAL_CONFIG.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <path :stroke-dasharray="FINAL_CONFIG.style.chart.box.strokeDasharray" :d="box.tubeRight" :stroke="FINAL_CONFIG.style.chart.box.stroke" :stroke-width="FINAL_CONFIG.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <path :stroke-dasharray="FINAL_CONFIG.style.chart.box.strokeDasharray" :d="box.tubeBottom" :stroke="FINAL_CONFIG.style.chart.box.stroke" :stroke-width="FINAL_CONFIG.style.chart.box.strokeWidth" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                    <!-- FILL TUBE -->
                    <path :d="fill.tubeTop" :stroke="FINAL_CONFIG.style.chart.bar.stroke" :stroke-width="FINAL_CONFIG.style.chart.bar.strokeWidth" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_tube_top${uid})`"/>
                    <path :d="fill.tubeBody" :stroke="FINAL_CONFIG.style.chart.bar.stroke" :stroke-width="FINAL_CONFIG.style.chart.bar.strokeWidth" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_tube_body${uid})`"/>
                    <path :d="fill.tubeTop" stroke="#FFFFFF" :stroke-width="0.5" stroke-linejoin="round" stroke-linecap="round" fill="none"/>
                </g>

                <g v-if="hasStack">
                    <g v-for="(bar, i) in stack" :style="`opacity:${selectedSerie ? selectedSerie === bar.id ? 1 : 0.3 : 1}`" class="vue-ui-3d-bar-stack" @click="emits('selectDatapoint', bar)">
                        <defs>
                            <radialGradient :id="`gradient_tube_top_${bar.id}`" fx="10%" cy="55%">
                                <stop offset="0%" :stop-color="setOpacity(lightenHexColor(bar.color, 0.5), 80)" />
                                <stop offset="100%" :stop-color="setOpacity(darkenHexColor(bar.color, 0.1), 80)" />
                            </radialGradient>
                            <linearGradient :id="`gradient_tube_body_${bar.id}`" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" :stop-color="`${bar.color}`"/>
                                <stop offset="10%" :stop-color="setOpacity(darkenHexColor(bar.color, 0.7), 100)"/>
                                <stop offset="25%" :stop-color="setOpacity(darkenHexColor(bar.color, 0.5), 100)"/>
                                <stop offset="75%" :stop-color="setOpacity(bar.color, 80)"/>
                                <stop offset="100%" :stop-color="setOpacity(lightenHexColor(bar.color, 0.7), 100)"/>
                            </linearGradient>
                        </defs>
                        <path @mouseenter="selectSerie(bar)" @click="selectSerie(bar, true)" @mouseout="unselectSerie(bar)" :d="bar.fill.tubeBody" stroke="#FFFFFF" :stroke-width="0.5" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_tube_body_${bar.id})`"/>
                        <path @mouseenter="selectSerie(bar)" @click="selectSerie(bar, true)" @mouseout="unselectSerie(bar)" :d="bar.fill.bottomTubeTop" stroke="#000000" :stroke-width="0.5" stroke-linejoin="round" stroke-linecap="round" fill="none" v-if="i > 0"/>
                        <path @mouseenter="selectSerie(bar)" @click="selectSerie(bar, true)" @mouseout="unselectSerie(bar)" :d="bar.fill.tubeTop" stroke="#FFFFFF" :stroke-width="0.5" stroke-linejoin="round" stroke-linecap="round" :fill="`url(#gradient_tube_top_${bar.id})`"/>
                    </g>

                    <!-- LEGEND (tube) -->
                    <g v-for="(bar, i) in stack" :style="`opacity:${selectedSerie ? selectedSerie === bar.id ? 1 : 0 : bar.proportion * 100 > FINAL_CONFIG.style.chart.legend.hideUnderPercentage ? 1 : 0}`" @click="emits('selectDatapoint', bar)">
                        <path 
                            :stroke="FINAL_CONFIG.style.chart.color" 
                            stroke-dasharray="1" 
                            stroke-width="0.5" 
                            stroke-linecap="round" 
                            :d="`M${bar.fill.sidePointer.x},${bar.fill.sidePointer.y} ${bar.fill.sidePointer.x2},${bar.fill.sidePointer.y}`"
                        />

                        <circle 
                            v-if="!bar.fill.miniDonut || !!selectedSerie"
                            :cx="bar.fill.sidePointer.x2" 
                            :cy="bar.fill.sidePointer.y" 
                            :r="2" 
                            :fill="bar.color" 
                            :stroke="FINAL_CONFIG.style.chart.backgroundColor" 
                        />

                        <rect
                            v-if="loading"
                            :x="bar.fill.sidePointer.xText"
                            :y="bar.fill.sidePointer.y - FINAL_CONFIG.style.chart.legend.fontSize / 2"
                            :width="svg.width / 3"
                            :height="FINAL_CONFIG.style.chart.legend.fontSize"
                            fill="#6A6A6A80"
                            rx="3"
                        />

                        <foreignObject 
                            :x="bar.fill.sidePointer.xText" 
                            :y="bar.fill.sidePointer.y - FINAL_CONFIG.style.chart.legend.fontSize" 
                            :width="svg.absoluteWidth / 3" 
                            :height="FINAL_CONFIG.style.chart.legend.fontSize * 2" 
                            style="overflow: visible; position: relative"
                            v-if="!loading"
                        >
                            <div v-if="FINAL_CONFIG.style.chart.legend.showDefault" :style="`height: 100%; width: 100%; display: flex; flex-direction: row; flex-wrap: wrap; align-items:center;justify-content: flex-start; font-size:${FINAL_CONFIG.style.chart.legend.fontSize}px; text-align:left; line-height: ${FINAL_CONFIG.style.chart.legend.fontSize}px; color:${FINAL_CONFIG.style.chart.legend.color}`">
                                {{ applyDataLabel(
                                    FINAL_CONFIG.style.chart.dataLabel.formatter,
                                    bar.value,
                                    `${bar.name}: ${dataLabel({v: bar.proportion * 100, s: '%', r: FINAL_CONFIG.style.chart.legend.roundingPercentage})} (${dataLabel({ 
                                        p: FINAL_CONFIG.style.chart.legend.prefix, 
                                        v: bar.value, 
                                        s: FINAL_CONFIG.style.chart.legend.suffix, 
                                        r: FINAL_CONFIG.style.chart.legend.roundingValue
                                    })})`,
                                    { datapoint: bar, seriesIndex: i, type: 'barDatapoint' }
                                    )
                                }}
                            </div>
                            <slot name="legend" v-bind="{ datapoint: bar, config: FINAL_CONFIG, dataset: stack}"/>
                        </foreignObject>

                        <!-- BREAKDOWN DONUT -->
                        <g v-if="bar.fill.donut && selectedSerie === bar.id">  
                            <!-- DONUT LABEL CONNECTOR -->
                            <g v-for="(arc, j) in bar.fill.donut">                            
                                <path
                                    v-if="displayArcPercentage(arc, bar.fill.donut, true) > 6"
                                    :d="calcNutArrowPath(arc, {x: arc.cx, y: arc.cy}, 0, 8, false, true, 10)"
                                    :stroke="arc.color"
                                    class="vue-ui-donut-arc-path"
                                    stroke-width="0.5"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    fill="none"
                                />
                            </g>

                            <path 
                                v-for="(arc, j) in bar.fill.donut"
                                class="vue-ui-donut-arc-path"
                                :data-cy="`donut-arc-${j}`"
                                :d="arc.arcSlice" 
                                :fill="`${arc.color}`"
                                :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                                :stroke-width="1"
                            />

                            <!-- DONUT DATALABELS -->
                            <g v-for="(arc, i) in bar.fill.donut">
                                <g v-if="displayArcPercentage(arc, bar.fill.donut, true) > 6">                                
                                    <text
                                        :text-anchor="calcMarkerOffsetX(arc, true, 0).anchor"
                                        :x="calcMarkerOffsetX(arc, true, 2).x"
                                        :y="calcMarkerOffsetY(arc, 12, 12)"
                                        :fill="FINAL_CONFIG.style.chart.legend.color"
                                        :font-size="FINAL_CONFIG.style.chart.legend.fontSize / 1.5"
                                    >
                                        {{ applyDataLabel(
                                            FINAL_CONFIG.style.chart.dataLabel.formatter,
                                            arc.value,
                                            `${displayArcPercentage(arc, bar.fill.donut)} (${dataLabel({
                                                p: FINAL_CONFIG.style.chart.legend.prefix, 
                                                v: arc.value, 
                                                s: FINAL_CONFIG.style.chart.legend.suffix, 
                                                r: FINAL_CONFIG.style.chart.legend.roundingValue
                                            })})`,
                                            { datapoint: arc, seriesIndex: i, type: 'donutDatapoint' }
                                        )}}
                                    </text>
                                    <text
                                        :text-anchor="calcMarkerOffsetX(arc).anchor"
                                        :x="calcMarkerOffsetX(arc, true, 2).x"
                                        :y="calcMarkerOffsetY(arc, 12, 12) + FINAL_CONFIG.style.chart.legend.fontSize / 1.5"
                                        :fill="FINAL_CONFIG.style.chart.legend.color"
                                        :font-size="FINAL_CONFIG.style.chart.legend.fontSize / 1.5"
                                    >
                                        {{ arc.name }}
                                    </text>
                                </g>
                            </g>
                        </g>

                        <!-- BREAKDOWN MINI DONUT -->
                        <g v-if="bar.fill.miniDonut && !selectedSerie">  
                            <path 
                                v-for="(arc, j) in bar.fill.miniDonut"
                                class="vue-ui-donut-arc-path"
                                :data-cy="`donut-arc-${j}`"
                                :d="arc.arcSlice" 
                                :fill="`${arc.color}`"
                                :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                                :stroke-width="0.5"
                            />
                        </g>
                    </g>
                </g>
            </g>

            <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <component
            v-if="isDataset && hasStack && FINAL_CONFIG.userOptions.buttons.table"
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

<style scoped lang="scss">
@import "../vue-data-ui.css";

.vue-ui-3d-bar *{
    transition: unset;
}
.vue-ui-3d-bar {
    user-select: none;
    position: relative;
}
.vue-ui-3d-bar-stack {
    transition: opacity 0.2s ease-in-out;
}
.animated {
    .vue-ui-donut-arc-path {
        animation: donut 0.5s ease-in-out;
        transform-origin: center;
    }
}

@keyframes donut {
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
</style>