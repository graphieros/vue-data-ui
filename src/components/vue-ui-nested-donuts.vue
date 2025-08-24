<script setup>
import {
    ref,
    computed,
    nextTick,
    onMounted,
    watch,
    onBeforeUnmount,
    defineAsyncComponent,
    shallowRef,
    toRefs,
} from "vue";
import {
    abbreviate,
    applyDataLabel,
    calcMarkerOffsetX,
    calcMarkerOffsetY,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createUid,
    dataLabel,
    easeOutCubic,
    error,
    downloadCsv,
    functionReturnsString,
    isFunction,
    makeDonut,
    objectIsEmpty,
    palette,
    sanitizeArray,
    setOpacity,
    themePalettes,
    XMLNS,
    checkNaN,
    treeShake,
    hasDeepProperty,
} from "../lib";
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
import Legend from "../atoms/Legend.vue"; // Must be ready in responsive mode
import BaseScanner from "../atoms/BaseScanner.vue";

const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));

const { vue_ui_nested_donuts: DEFAULT_CONFIG } = useConfig();

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

const isDataset = computed({
    get() {
        return !!props.dataset && props.dataset.length;
    },
    set(bool) {
        return bool;
    }
});

const uid = ref(createUid());
const isTooltip = ref(false);
const tooltipContent = ref("");
const selectedSerie = ref(null);
const step = ref(0);
const nestedDonutsChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);
const isFirstLoad = ref(true);
const animatedValues = ref([]);
const ghostSlices = ref([]);

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const FINAL_CONFIG = ref(prepareConfig());

const loaderDs = {
    name: '',
    series: [
        {
            name: '',
            values: [3],
            color: '#BABABA',
        },
        {
            name: '',
            values: [2],
            color: '#AAAAAA',
        },
        {
            name: '',
            values: [1],
            color: '#CACACA',
        },
    ]
}

const { loading, FINAL_DATASET, manualLoading, skeletonDataset } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    callback: () => {
        Promise.resolve().then(async() => {
            await triggerAnim();
        });
    },
    skeletonDataset: [loaderDs, loaderDs],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            useCssAnimation: false,
            table: { show: false },
            startAnimation: { show: false },
            userOptions: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    layout: {
                        labels: {
                            dataLabels: { show: false },
                        }
                    },
                    legend: { backgroundColor: 'transparent', showValue: false, showPercentage: false },
                    title: {
                        color: '#1A1A1A',
                        subtitle: {
                            color: '#5A5A5A'
                        }
                    }
                }
            }
        }
    })
})

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

    let finalConfig = {};

    if (mergedConfig.theme) {
        finalConfig = {
            ...useNestedProp({
                userConfig:
                    themes.vue_ui_nested_donuts[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig,
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette,
        };
    } else {
        finalConfig = mergedConfig;
    }

    // ------------------------------ OVERRIDES -----------------------------------

    if (props.config && hasDeepProperty(props.config, 'events.datapointEnter')) {
        finalConfig.events.datapointEnter = props.config.events.datapointEnter;
    } else {
        finalConfig.events.datapointEnter = null;
    }

    if (props.config && hasDeepProperty(props.config, 'events.datapointLeave')) {
        finalConfig.events.datapointLeave = props.config.events.datapointLeave;
    } else {
        finalConfig.events.datapointLeave = null;
    }

    if (props.config && hasDeepProperty(props.config, 'events.datapointClick')) {
        finalConfig.events.datapointClick = props.config.events.datapointClick;
    } else {
        finalConfig.events.datapointClick = null;
    }

    // ----------------------------------------------------------------------------

    return finalConfig;
}

watch(
    () => props.config,
    (_newCfg) => {
        if (!loading.value) {
            FINAL_CONFIG.value = prepareConfig();
        }
        userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
        prepareChart();
        titleStep.value += 1;
        tableStep.value += 1;
        legendStep.value += 1;

        mutableConfig.value.dataLabels.show = FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.show;
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        mutableConfig.value.showTooltip = FINAL_CONFIG.value.style.chart.tooltip.show;

        // Other ref resets
        svg.value.width = FINAL_CONFIG.value.style.chart.width;
        svg.value.height = FINAL_CONFIG.value.style.chart.height;
    },
    { deep: true }
);

const padding = computed(() => {
    const { top, right, bottom, left } = FINAL_CONFIG.value.style.chart.padding;
    return {
        css: `padding:${top}px ${right}px ${bottom}px ${left}px`,
        top,
        right,
        bottom,
        left,
    };
});

function animateWithGhost(finalValues, duration = 1000, stagger = 50) {
    return new Promise((resolve) => {
        const N = finalValues.length;
        animatedValues.value = Array(N).fill(0);
        ghostSlices.value = [];

        let completed = 0;

        finalValues.forEach((target, i) => {
            setTimeout(() => {
                const start = performance.now();

                function animate(now) {
                    const p = Math.min((now - start) / duration, 1);
                    const eased = easeOutCubic(p);
                    const value = target * eased;
                    animatedValues.value[i] = value;
                    animatedValues.value = [...animatedValues.value];

                    const ghostByGroup = [];
                    let cursor = 0;
                    props.dataset.forEach((ds, groupIndex) => {
                        const realTotal = checkNaN(ds.series.reduce(
                            (sum, s) =>
                                sum + checkNaN(sanitizeArray(s.values).reduce((a, b) => a + b, 0)),
                            0
                        ));

                        const animatedTotal = checkNaN(animatedValues.value
                            .slice(cursor, cursor + ds.series.length)
                            .reduce((a, b) => a + b, 0));

                        const ghostValue = realTotal - animatedTotal;

                        if (ghostValue > Number.MIN_VALUE) {
                            ghostByGroup.push({
                                name: "__ghost__",
                                arcOf: ds.name,
                                arcOfId: `${uid.value}_${groupIndex}`,
                                id: `ghost_${uid.value}_${groupIndex}`,
                                seriesIndex: -1,
                                datasetIndex: groupIndex,
                                color: "transparent",
                                value: ghostValue,
                                fullValue: ghostValue,
                                absoluteValues: [],
                                ghost: true,
                            });
                        }

                        cursor += ds.series.length;
                    });

                    ghostSlices.value = ghostByGroup;

                    if (p < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        completed += 1;
                        if (completed === N) resolve();
                    }
                }

                requestAnimationFrame(animate);
            }, i * stagger);
        });
    });
}

async function triggerAnim() {
    if (FINAL_CONFIG.value.startAnimation?.show) {
        const seriesList = FINAL_DATASET.value.flatMap((d) => d.series);
        const finalValues = seriesList.map((s) =>
            sanitizeArray(s.values).reduce((a, b) => a + b, 0)
        );

        animatedValues.value = finalValues.map(() => 0);
        isFirstLoad.value = true;

        ghostSlices.value = FINAL_DATASET.value.map((ds, i) => {
            const total = ds.series.reduce(
                (sum, s) => sum + sanitizeArray(s.values).reduce((a, b) => a + b, 0),
                0
            );
            return {
                name: "__ghost__",
                arcOf: ds.name,
                arcOfId: `${uid.value}_${i}`,
                id: `ghost_${uid.value}_${i}`,
                seriesIndex: -1,
                datasetIndex: i,
                color: "transparent",
                value: total,
                fullValue: total,
                absoluteValues: [],
                ghost: true,
            };
        });

        await nextTick();

        animateWithGhost(
            finalValues,
            FINAL_CONFIG.value.startAnimation.durationMs,
            FINAL_CONFIG.value.startAnimation.staggerMs
        ).then(() => {
            isFirstLoad.value = false;
            ghostSlices.value = [];
        });
    } else {
        isFirstLoad.value = false;
    }
}

onMounted(async () => {
    prepareChart();
    await triggerAnim();
});

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: "VueUiNestedDonuts",
            type: "dataset",
            debug: debug.value
        });
        isDataset.value = false;
        manualLoading.value = true; // v3
    } else {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: nestedDonutsChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text
                    ? chartTitle.value
                    : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show
                    ? chartLegend.value
                    : null,
                source: source.value,
                noTitle: noTitle.value,
                padding: padding.value,
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
        observedEl.value = nestedDonutsChart.value.parentNode;
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
    elementId: `nested_donuts_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-nested-donuts",
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
    dataLabels: {
        show: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.show,
    },
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show,
});

// v3 - Essential to make shifting between loading config and final config work
watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
        dataLabels: {
            show: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.show,
        },
            showTable: FINAL_CONFIG.value.table.show,
            showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show,
    };
}, { immediate: true });

const svg = ref({
    width: FINAL_CONFIG.value.style.chart.width,
    height: FINAL_CONFIG.value.style.chart.height,
});

const emit = defineEmits(["selectLegend", "selectDatapoint"]);

function selectDatapoint({ datapoint, index, seriesIndex }) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex });
    }
    emit("selectDatapoint", { datapoint, index });
}

function animateValue({
    from,
    to,
    duration,
    onUpdate,
    onDone,
    easing = easeOutCubic,
}) {
    const start = performance.now();
    function step(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = easing(t);
        const current = from + (to - from) * eased;
        onUpdate(current, t);
        if (t < 1) {
            requestAnimationFrame(step);
        } else {
            onUpdate(to, 1);
            if (onDone) onDone();
        }
    }
    requestAnimationFrame(step);
}

const segregated = ref([]);

const immutableDataset = computed(() => {
    const l = loading.value;
    FINAL_DATASET.value.forEach((ds, i) => {
        if ([null, undefined].includes(ds.name)) {
            error({
                componentName: "VueUiNestedDonuts",
                type: "datasetSerieAttribute",
                property: "name",
                index: i,
                debug: debug.value
            });
        }
        if ([null, undefined].includes(ds.series)) {
            error({
                componentName: "VueUiNestedDonuts",
                type: "datasetSerieAttribute",
                property: "series",
                index: i,
                debug: debug.value
            });
        } else {
            if (ds.series.length === 0) {
                error({
                    componentName: "VueUiNestedDonuts",
                    type: "datasetAttributeEmpty",
                    property: `series at index ${i}`,
                    debug: debug.value
                });
            } else {
                ds.series.forEach((serie, j) => {
                    if ([null, undefined].includes(serie.name)) {
                        error({
                            componentName: "VueUiNestedDonuts",
                            type: "datasetSerieAttribute",
                            property: "name",
                            index: j,
                            key: "serie",
                            debug: debug.value
                        });
                    }
                    if ([null, undefined].includes(serie.values)) {
                        error({
                            componentName: "VueUiNestedDonuts",
                            type: "datasetSerieAttribute",
                            property: "values",
                            index: j,
                            key: "serie",
                            debug: debug.value
                        });
                    }
                });
            }
        }
    });

    let animatedCounter = 0;

    return FINAL_DATASET.value.map((ds, i) => {
        return {
            ...ds,
            total: ds.series
                .filter((s) => !segregated.value.includes(s.id))
                .map((s) => sanitizeArray(s.values).reduce((a, b) => a + b, 0))
                .reduce((a, b) => a + b, 0),
            datasetIndex: i,
            id: `${uid.value}_${i}`,
            series: ds.series.map((serie, j) => {
                const rawValue = sanitizeArray(serie.values).reduce((a, b) => a + b, 0);

                return {
                    name: serie.name,
                    arcOf: ds.name,
                    arcOfId: `${uid.value}_${i}`,
                    id: `${uid.value}_${i}_${j}`,
                    seriesIndex: j,
                    datasetIndex: i,
                    color:
                        convertColorToHex(serie.color) ||
                        customPalette.value[j] ||
                        palette[j % palette.length],
                    value: isFirstLoad.value
                        ? animatedValues.value[animatedCounter++] ?? 0
                        : rawValue,
                    absoluteValues: serie.values || [],
                };
            }),
        };
    });
});

// v3 - Stop skeleton loader when props.dataset becomes valid
watch(() => props.dataset, (newVal) => {
    if (Array.isArray(newVal) && newVal.length > 0) {
        manualLoading.value = false;
    }
}, { immediate: true });

const donutSize = computed(() => {
    return (
        Math.min(svg.value.height, svg.value.width) *
        (FINAL_CONFIG.value.style.chart.layout.donut.strokeWidth / 512)
    );
});

const md = computed(() => {
    return [...immutableDataset.value].map((ds, i) => {
        const total = ds.series
            .filter((serie) => !segregated.value.includes(serie.id))
            .map((s) => {
                return s.value;
            })
            .reduce((a, b) => a + b, 0);

        return {
            ...ds,
            total,
            series: ds.series
                .filter((serie) => !segregated.value.includes(serie.id))
                .map((s) => {
                    return {
                        ...s,
                        proportion: s.value / total,
                    };
                }),
        };
    });
});

function checkSegregation(sourceArray, n, targetArray) {
    let count = 0;
    for (let i = 0; i < sourceArray.length; i += 1) {
        if (targetArray.includes(sourceArray[i])) {
            count += 1;
        }
    }
    return count < n;
}

const mutableDataset = ref(md.value);

watch(
    () => md.value,
    (val) => (mutableDataset.value = val)
);

function segregateDonut(item) {
    emit("selectLegend", item);
    const target = props.dataset
        .flatMap((d, i) =>
            d.series.map((s, j) => ({
                value: sanitizeArray(s.values).reduce((a, b) => a + b, 0),
                id: `${uid.value}_${i}_${j}`,
                arcOfId: `${uid.value}_${i}`,
            }))
        )
        .find((el) => el.id === item.id);

    if (!target) return;

    const targetValue = immutableDataset.value
        .flatMap(ds => ds.series)
        .find(s => s.id === item.id)?.value ?? 0;

    const sourceEl = mutableDataset.value
        .flatMap((d) => d.series)
        .find((el) => el.id === item.id);

    const source = sourceEl ? sourceEl.value : 0;

    let initVal = source;

    const allParentDonut = immutableDataset.value.find(
        (el) => el.id === target.arcOfId
    );
    if (!allParentDonut) return;

    const allParentDonutIds = allParentDonut.series.map((s) => s.id);
    const canSegregate = checkSegregation(
        allParentDonutIds,
        allParentDonutIds.length - 1,
        segregated.value
    );

    if (segregated.value.includes(item.id)) {
        segregated.value = segregated.value.filter(s => s !== item.id);

        if (FINAL_CONFIG.value.serieToggleAnimation.show) {
            animateValue({
                from: initVal,
                to: targetValue,
                duration: FINAL_CONFIG.value.serieToggleAnimation.durationMs,
                onUpdate: val => {
                    mutableDataset.value = mutableDataset.value.map(ds => ({
                        ...ds,
                        series: ds.series.map(s => s.id === item.id ? { ...s, value: val } : s)
                    }));
                }
            });
        } else {
            mutableDataset.value = mutableDataset.value.map(ds => ({
                ...ds,
                series: ds.series.map(s => s.id === item.id ? { ...s, value: targetValue } : s)
            }));
        }
    } else if (canSegregate) {
        if (FINAL_CONFIG.value.serieToggleAnimation.show) {
            animateValue({
                from: initVal,
                to: 0,
                duration: FINAL_CONFIG.value.serieToggleAnimation.durationMs,
                onUpdate: val => {
                    mutableDataset.value = mutableDataset.value.map(ds => ({
                        ...ds,
                        series: ds.series.map(s => s.id === item.id ? { ...s, value: val } : s)
                    }));
                },
                onDone: () => {
                    segregated.value.push(item.id);
                }
            });
        } else {
            mutableDataset.value = mutableDataset.value.map(ds => ({
                ...ds,
                series: ds.series.map(s => s.id === item.id ? { ...s, value: 0 } : s)
            }));
            segregated.value.push(item.id);
        }
    }
}

const donutThickness = computed(() => {
    return (
        (donutSize.value / immutableDataset.value.length) *
        FINAL_CONFIG.value.style.chart.layout.donut.spacingRatio
    );
});

const radii = computed(() => {
    return mutableDataset.value.map((ds, i) => {
        return (
            donutSize.value - (i * donutSize.value) / immutableDataset.value.length
        );
    });
});

const donuts = computed(() => {
    return mutableDataset.value.map((ds, i) => {
        const hasData = Math.abs(ds.series.map(s => s.value).reduce((a, b) => a + b, 0)) > 0;
        const radius = donutSize.value - (i * donutSize.value) / mutableDataset.value.length;
        const ghost = isFirstLoad.value
            ? ghostSlices.value.find((g) => g.datasetIndex === i)
            : null;
            const series = [...ds.series, ...(ghost ? [ghost] : [])].map((s) => ({
                ...s,
                value: s.value < 0.00000000001 ? Number.MIN_VALUE : s.value,
            }));

            const skeleton = makeDonut(
                { series: [
                    { name: '_', color: FINAL_CONFIG.value.style.chart.layout.donut.emptyFill, value: 1 }
                ]},
                svg.value.width / 2,
                svg.value.height / 2,
                radius,
                radius,
                1.99999,
                2,
                1,
                360,
                105.25,
                donutThickness.value
            )

            const fullCirclePath = `M ${svg.value.width/2},${(svg.value.height/2) + radius}
            a ${radius},${radius} 0 1,1 0,${-2 * radius}
            a ${radius},${radius} 0 1,1 0,${2 * radius}`;

    
        return {
            ...ds,
            hasData,
            radius,
            skeleton,
            fullCirclePath,
            donut: makeDonut(
                { series },
                svg.value.width / 2,
                svg.value.height / 2,
                radius,
                radius,
                1.99999,
                2,
                1,
                360,
                105.25,
                donutThickness.value
            ),
        };
    });
});

const gradientSets = computed(() => {
    return [...immutableDataset.value].map((ds, i) => {
        const sizeRatio = (i * donutSize.value) / immutableDataset.value.length;

        return {
            sizeRatio,
            donut: makeDonut(
                { series: [{ value: 1 }] },
                svg.value.width / 2,
                svg.value.height / 2,
                donutSize.value - sizeRatio,
                donutSize.value - sizeRatio,
                1.99999,
                2,
                1,
                360,
                105.25,
                (donutSize.value / immutableDataset.value.length) *
                FINAL_CONFIG.value.style.chart.layout.donut.spacingRatio
            )[0],
        };
    });
});

const selectedDonut = ref(null);
const selectedDatapoint = ref(null);
const selectedDatapointIndex = ref(null);
const dataTooltipSlot = ref(null);

function handleDatapointLeave({ datapoint, seriesIndex }) {
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex })
    }
    isTooltip.value = false;
    selectedDonut.value = null;
    selectedSerie.value = null;
    selectedDatapoint.value = null;
    selectedDatapointIndex.value = null;
}

function useTooltip({ datapoint, _relativeIndex, seriesIndex }) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datapoint, seriesIndex })
    }

    selectedDonut.value = datapoint.arcOfId;
    selectedDatapoint.value = datapoint.id;
    selectedDatapointIndex.value = seriesIndex;
    selectedSerie.value = datapoint.id

    dataTooltipSlot.value = {
        datapoint,
        seriesIndex,
        series: mutableDataset.value,
        config: FINAL_CONFIG.value,
    };

    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

    if (
        isFunction(customFormat) &&
        functionReturnsString(() =>
            customFormat({
                seriesIndex,
                datapoint,
                series: mutableDataset.value,
                config: FINAL_CONFIG.value,
            })
        )
    ) {
        tooltipContent.value = customFormat({
            seriesIndex,
            datapoint,
            series: mutableDataset.value,
            config: FINAL_CONFIG.value,
        });
    } else {
        let html = "";

        if (
            FINAL_CONFIG.value.style.chart.tooltip.showAllItemsAtIndex &&
            segregated.value.length === 0
        ) {
            const itemsAtIndex = mutableDataset.value.map((ds) => {
                return ds.series.find((s) => s.seriesIndex === seriesIndex);
            });

            itemsAtIndex.forEach((item, i) => {
                if (!item) return "";
                html += `
                    <div style="display:flex; flex-direction: column; justify-content:flex-start; align-items:flex-start;padding:6px 0; ${i < itemsAtIndex.length - 1
                        ? `border-bottom:1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor}`
                        : ""
                    }">
                        <div style="display:flex; flex-direction: row; gap: 3px; justify-content:flex-start; align-items:center;">
                            <svg viewBox="0 0 20 20" height="${FINAL_CONFIG.value.style.chart.tooltip.fontSize
                    }" width="${FINAL_CONFIG.value.style.chart.tooltip.fontSize
                    }">
                                <circle cx="10" cy="10" r="10" fill="${item.color
                    }"/>
                            </svg>
                            <span>
                                ${item.arcOf ?? ""} - ${item.name}
                            </span>
                        </div>
                        <span>
                            ${FINAL_CONFIG.value.style.chart.tooltip.showValue
                        ? `<b>${applyDataLabel(
                            FINAL_CONFIG.value.style.chart.layout.labels
                                .dataLabels.formatter,
                            datapoint.value,
                            dataLabel({
                                p: FINAL_CONFIG.value.style.chart.layout
                                    .labels.dataLabels.prefix,
                                v: datapoint.value,
                                s: FINAL_CONFIG.value.style.chart.layout
                                    .labels.dataLabels.suffix,
                                r: FINAL_CONFIG.value.style.chart.tooltip
                                    .roundingValue,
                            }),
                            { datapoint, seriesIndex }
                        )}
                        </b>`
                        : ""
                    }
                            ${FINAL_CONFIG.value.style.chart.tooltip
                        .showPercentage
                        ? `(${dataLabel({
                            v: item.proportion * 100,
                            s: "%",
                            r: FINAL_CONFIG.value.style.chart.tooltip
                                .roundingPercentage,
                        })})`
                        : ""
                    }
                        </span>
                    </div>
                `;
            });
        } else {
            html += `<div data-cy="donut-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor
                };padding-bottom:6px;margin-bottom:3px;">${datapoint.arcOf ?? ""} - ${datapoint.name
                }</div>`;

            html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><circle data-cy="donut-tooltip-marker" cx="6" cy="6" r="6" stroke="none" fill="${datapoint.color}"/></svg>`;

            if (FINAL_CONFIG.value.style.chart.tooltip.showValue) {
                html += `<b data-cy="donut-tooltip-value">${applyDataLabel(
                    FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.formatter,
                    datapoint.value,
                    dataLabel({
                        p: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix,
                        v: datapoint.value,
                        s: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix,
                        r: FINAL_CONFIG.value.style.chart.tooltip.roundingValue,
                    }),
                    { datapoint, seriesIndex }
                )}</b>`;
            }

            if (FINAL_CONFIG.value.style.chart.tooltip.showPercentage) {
                if (!FINAL_CONFIG.value.style.chart.tooltip.showValue) {
                    html += `<b>${dataLabel({
                        v: datapoint.proportion * 100,
                        s: "%",
                        r: FINAL_CONFIG.value.style.chart.tooltip.roundingPercentage,
                    })}</b></div>`;
                } else {
                    html += `<span>(${dataLabel({
                        v: datapoint.proportion * 100,
                        s: "%",
                        r: FINAL_CONFIG.value.style.chart.tooltip.roundingPercentage,
                    })})</span></div>`;
                }
            }
        }
        tooltipContent.value = `<div style="font-size:${FINAL_CONFIG.value.style.chart.tooltip.fontSize}px">${html}</div>`;
    }
    isTooltip.value = true;
}

function isArcBigEnough(arc) {
    return (
        arc.proportion * 100 >
        FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.hideUnderValue
    );
}

function getBlurFilter(arc, index) {
    if (!FINAL_CONFIG.value.useBlurOnHover) {
        return "";
    }
    if (
        FINAL_CONFIG.value.style.chart.tooltip.showAllItemsAtIndex &&
        segregated.value.length === 0
    ) {
        if (
            [null, undefined].includes(selectedDatapointIndex.value) ||
            selectedDatapointIndex.value === index
        ) {
            return "";
        } else {
            return `url(#blur_${uid.value})`;
        }
    }
    if (
        !FINAL_CONFIG.value.style.chart.tooltip.showAllItemsAtIndex ||
        segregated.value.length
    ) {
        if ([null, undefined].includes(selectedDatapoint.value)) {
            return "";
        }
        if (selectedDatapoint.value === arc.id) {
            return "";
        } else {
            return `url(#blur_${uid.value})`;
        }
    }
}

const legendSets = computed(() => {
    return immutableDataset.value.map((ds, i) => {
        const visibleSeries = ds.series.filter(
            (s) => !segregated.value.includes(s.id)
        );

        const total = isFirstLoad.value
            ? visibleSeries
                .map((s) => {
                    const indexInOriginal = FINAL_DATASET.value[i].series.findIndex(
                        (orig) => orig.name === s.name
                    );
                    return sanitizeArray(
                        FINAL_DATASET.value[i].series[indexInOriginal].values
                    ).reduce((a, b) => a + b, 0);
                })
                .reduce((a, b) => a + b, 0)
            : visibleSeries.map((s) => s.value).reduce((a, b) => a + b, 0);

        return ds.series.map((s, j) => {
            const rawValue = sanitizeArray(FINAL_DATASET.value[i].series[j].values).reduce(
                (a, b) => a + b,
                0
            );
            const displayValue = isFirstLoad.value ? rawValue : s.value;

            return {
                name: s.name,
                color: s.color,
                value: displayValue,
                shape: "circle",
                arcOf: s.arcOf,
                id: s.id,
                seriesIndex: j,
                datasetIndex: i,
                total,
                opacity: segregated.value.includes(s.id) ? 0.5 : 1,
                segregate: () => segregateDonut(s),
                isSegregated: segregated.value.includes(s.id),
            };
        });
    });
});

const legendConfig = computed(() => {
    return {
        cy: "nested-donuts-legend",
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? "bold" : "",
    };
});

const table = computed(() => {
    const head = mutableDataset.value.flatMap((ds) => {
        return ds.series.map((s) => {
            return {
                name: `${ds.name} - ${s.name}`,
                color: s.color,
                total: ds.total,
            };
        });
    });
    const body = mutableDataset.value.flatMap((ds) => {
        return ds.series.map((s) => s.value);
    });
    return { head, body };
});

function generateCsv(callback=null) {
    nextTick(() => {
        const labels = table.value.head.map((h, i) => {
            return [
                [h.name],
                [table.value.body[i]],
                [
                    isNaN(table.value.body[i] / h.total)
                        ? "-"
                        : (table.value.body[i] / h.total) * 100,
                ],
            ];
        });
        const tableXls = [
            [FINAL_CONFIG.value.style.chart.title.text],
            [FINAL_CONFIG.value.style.chart.title.subtitle.text],
            [[""], ["val"], ["%"]],
        ].concat(labels);

        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({
                csvContent,
                title:
                    FINAL_CONFIG.value.style.chart.title.text || "vue-ui-nested-donuts",
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
        const label = dataLabel({
            p: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix,
            v: table.value.body[i],
            s: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix,
            r: FINAL_CONFIG.value.table.td.roundingValue,
        });
        return [
            {
                color: h.color,
                name: h.name,
            },
            label,
            isNaN(table.value.body[i] / h.total)
                ? "-"
                : dataLabel({
                    v: (table.value.body[i] / h.total) * 100,
                    s: "%",
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
        FINAL_CONFIG.value.table.columnNames.percentage,
    ];

    return {
        colNames,
        head,
        body,
        config,
    };
});

function getData() {
    return immutableDataset.value;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleLabels() {
    mutableConfig.value.dataLabels.show = !mutableConfig.value.dataLabels.show;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

async function getImage({ scale = 2} = {}) {
    if (!nestedDonutsChart.value) return;
    const { width, height } = nestedDonutsChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: nestedDonutsChart.value, base64: true, img: true, scale})
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio
    }
}

const G = ref(null);

function autoSize() {
    if (!G.value) return;
    const { x, y, width, height } = G.value.getBBox();
    if (!svgRef.value) return;
    svgRef.value.setAttribute('viewBox', `${x} ${y} ${width + Math.min(0, x)} ${height + Math.min(0, y)}`);
}

defineExpose({
    autoSize,
    getData,
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleLabels,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen
});
</script>

<template>
    <div ref="nestedDonutsChart" :class="`vue-ui-nested-donuts ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''
        } ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`"
        :id="`nested_donuts_${uid}`" @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="() => setUserOptionsVisibility(false)">
        <PenAndPaper v-if="FINAL_CONFIG.userOptions.buttons.annotator" :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator" @close="toggleAnnotator" />

        <div ref="noTitle" v-if="hasOptionsNoTitle" class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`" />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text">
            <Title :key="`title_${titleStep}`" :config="{
                title: {
                    cy: 'donut-div-title',
                    ...FINAL_CONFIG.style.chart.title,
                },
                subtitle: {
                    cy: 'donut-div-subtitle',
                    ...FINAL_CONFIG.style.chart.title.subtitle,
                },
            }" />
        </div>

        <!-- OPTIONS -->
        <UserOptions ref="details" :key="`user_option_${step}`" v-if="
            FINAL_CONFIG.userOptions.show &&
            isDataset &&
            (keepUserOptionState ? true : userOptionsVisible)
        " :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting" :isImaging="isImaging" :uid="uid" :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip &&
                FINAL_CONFIG.style.chart.tooltip.show
                " :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf" :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img" :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasLabel="FINAL_CONFIG.userOptions.buttons.labels"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen" :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip" :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="nestedDonutsChart" :position="FINAL_CONFIG.userOptions.position"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator" :isAnnotation="isAnnotator" :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            @toggleFullscreen="toggleFullscreen" @generatePdf="generatePdf" @generateCsv="generateCsv"
            @generateImage="generateImage" @toggleTable="toggleTable" @toggleLabels="toggleLabels"
            @toggleTooltip="toggleTooltip" @toggleAnnotator="toggleAnnotator" :style="{
                visibility: keepUserOptionState
                    ? userOptionsVisible
                        ? 'visible'
                        : 'hidden'
                    : 'visible',
            }">
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
            <template #optionTable v-if="$slots.optionTable">
                <slot name="optionTable" />
            </template>
            <template #optionLabels v-if="$slots.optionLabels">
                <slot name="optionLabels" />
            </template>
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }" />
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <svg ref="svgRef" :xmlns="XMLNS" :class="{
            'vue-data-ui-fullscreen--on': isFullscreen,
            'vue-data-ui-fulscreen--off': !isFullscreen,
            'vue-data-ui-svg': true
        }" :viewBox="`0 0 ${svg.width <= 0 ? 0.001 : svg.width} ${svg.height < 0 ? 0.001 : svg.height
            }`"
            :style="`max-width:100%; overflow: visible; background:transparent;color:${FINAL_CONFIG.style.chart.color};${padding.css}`">

            <g ref="G" class="vue-data-ui-g">
                <PackageVersion />
    
                <!-- BACKGROUND SLOT -->
                <foreignObject v-if="$slots['chart-background']" :x="0" :y="0" :width="svg.width <= 0 ? 0.001 : svg.width"
                    :height="svg.height < 0 ? 0.001 : svg.height" :style="{
                        pointerEvents: 'none',
                    }">
                    <slot name="chart-background" />
                </foreignObject>
    
                <!-- GRADIENTS -->
                <defs>
                    <radialGradient v-for="(_, i) in gradientSets" :id="`radial_${uid}_${i}`">
                        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0" />
                        <stop :offset="`${(1 - donutThickness / radii[i]) * 100}%`" :stop-color="setOpacity('#FFFFFF', 0)"
                            stop-opacity="0" />
                        <stop :offset="`${(1 - donutThickness / radii[i] / 2) * 100}%`" stop-color="#FFFFFF"
                            :stop-opacity="FINAL_CONFIG.style.chart.gradientIntensity / 100" />
                        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
                    </radialGradient>
                </defs>
    
                <!-- FILTERS -->
                <defs>
                    <filter :id="`blur_${uid}`" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" :stdDeviation="2" :id="`blur_std_${uid}`" />
                        <feColorMatrix type="saturate" values="0" />
                    </filter>
    
                    <filter :id="`shadow_${uid}`" color-interpolation-filters="sRGB">
                        <feDropShadow dx="0" dy="0" stdDeviation="10" flood-opacity="0.5"
                            :flood-color="FINAL_CONFIG.style.chart.layout.donut.shadowColor" />
                    </filter>
                </defs>

                <!-- CURVED PATHS -->
                <defs>
                    <path
                        v-for="(item, i) in donuts"
                        :key="`path-full-${i}`"
                        :id="`path-full-${i}-${uid}`"
                        :d="item.fullCirclePath"
                        fill="none"
                    />
                </defs>

                <!-- NESTED DONUTS -->
                <g v-for="(item, i) in donuts">
                    <template v-if="item.hasData">
                        <g v-for="(arc, j) in item.donut.filter((el) => !el.ghost)">
                            <path data-cy="datapoint-arc" class="vue-ui-donut-arc-path" :d="arc.arcSlice"
                                :fill="arc.color" 
                                :stroke="FINAL_CONFIG.style.chart.layout.donut.borderColorAuto ? FINAL_CONFIG.style.chart.backgroundColor : FINAL_CONFIG.style.chart.layout.donut.borderColor"
                                :stroke-width="FINAL_CONFIG.style.chart.layout.donut.borderWidth"
                                :filter="getBlurFilter(arc, j)" />
                        </g>
                    </template>
                    <template v-else>
                        <g v-for="(arc, j) in item.skeleton">
                            <path data-cy="datapoint-arc" class="vue-ui-donut-arc-path" :d="arc.arcSlice"
                                :fill="arc.color" :stroke="FINAL_CONFIG.style.chart.layout.donut.borderColorAuto ? FINAL_CONFIG.style.chart.backgroundColor : FINAL_CONFIG.style.chart.layout.donut.borderColor"
                                :stroke-width="FINAL_CONFIG.style.chart.layout.donut.borderWidth" />
                        </g>
                    </template>
                </g>
    
                <g v-if="FINAL_CONFIG.style.chart.useGradient">
                    <g v-for="(gradient, i) in gradientSets">
                        <path data-cy="donut-gradient" :d="gradient.donut.arcSlice" :fill="`url(#radial_${uid}_${i})`"
                            stroke="transparent" stroke-width="0" />
                    </g>
                </g>
    
                <g v-if="FINAL_CONFIG.style.chart.layout.labels.dataLabels.showDonutName">
                    <template v-if="FINAL_CONFIG.style.chart.layout.labels.dataLabels.curvedDonutName">
                        <g v-for="(item, i) in donuts">
                            <g v-for="(arc, j) in item.donut">
                                <text 
                                    data-cy="datapoint-name" 
                                    :class="{ animated: FINAL_CONFIG.useCssAnimation }"
                                    v-if="j === 0 && svg.width && svg.height" 
                                    text-anchor="middle" 
                                    :font-size="FINAL_CONFIG.style.chart.layout.labels.dataLabels.fontSize" :font-weight="FINAL_CONFIG.style.chart.layout.labels.dataLabels.boldDonutName ? 'bold' : 'normal'" 
                                    :fill="FINAL_CONFIG.style.chart.layout.labels.dataLabels.color"
                                    :dy="FINAL_CONFIG.style.chart.layout.labels.dataLabels.donutNameOffsetY"
                                >
                                    <textPath
                                        :href="`#path-full-${i}-${uid}`"
                                        startOffset="50%"
                                        text-anchor="middle"
                                        method="align"
                                        spacing="auto"
                                        side="right"
                                    >
                                        {{
                                        FINAL_CONFIG.style.chart.layout.labels.dataLabels.donutNameAbbreviation
                                            ? abbreviate({
                                                source: item.name,
                                                length:
                                                FINAL_CONFIG.style.chart.layout.labels.dataLabels
                                                    .donutNameMaxAbbreviationSize,
                                            })
                                            : item.name
                                        }}
                                    </textPath>
                                </text>
                            </g>
                        </g>
                    </template>
                    <template v-else>
                        <g v-for="(item, i) in donuts">
                            <g v-for="(arc, j) in item.donut">
                                <text 
                                    data-cy="datapoint-name" 
                                    :class="{ animated: FINAL_CONFIG.useCssAnimation }"
                                    v-if="j === 0 && svg.width && svg.height" 
                                    :x="svg.width / 2" :y="arc.startY - FINAL_CONFIG.style.chart.layout.labels.dataLabels.fontSize + FINAL_CONFIG.style.chart.layout.labels.dataLabels.donutNameOffsetY" 
                                    text-anchor="middle" 
                                    :font-size="FINAL_CONFIG.style.chart.layout.labels.dataLabels.fontSize" 
                                    :font-weight="FINAL_CONFIG.style.chart.layout.labels.dataLabels.boldDonutName
                            ? 'bold'
                            : 'normal'
                            " :fill="FINAL_CONFIG.style.chart.layout.labels.dataLabels.color">
                                    {{
                                        FINAL_CONFIG.style.chart.layout.labels.dataLabels
                                            .donutNameAbbreviation
                                            ? abbreviate({
                                                source: item.name,
                                                length:
                                                    FINAL_CONFIG.style.chart.layout.labels.dataLabels
                                                        .donutNameMaxAbbreviationSize,
                                            })
                                            : item.name
                                    }}
                                </text>
                            </g>
                        </g>
                    </template>
                </g>
    
                <!-- DATALABELS -->
                <g v-if="FINAL_CONFIG.style.chart.layout.labels.dataLabels.show">
                    <g v-for="(item, i) in donuts">
                        <g v-for="(arc, j) in item.donut.filter((el) => !el.ghost)" :filter="getBlurFilter(arc, j)">
                            <text data-cy="datapoint-percentage" :class="{ animated: FINAL_CONFIG.useCssAnimation }" v-show="mutableConfig.dataLabels.show &&
                                FINAL_CONFIG.style.chart.layout.labels.dataLabels.showPercentage
                                " :opacity="isArcBigEnough(arc) ? 1 : 0" :text-anchor="calcMarkerOffsetX(arc, true).anchor"
                                :x="calcMarkerOffsetX(
                                    arc,
                                    false,
                                    FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetX
                                ).x || 0
                                    " :y="calcMarkerOffsetY(
                        arc,
                        FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetY,
                        FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetY
                    )
                        " :fill="FINAL_CONFIG.style.chart.layout.labels.dataLabels.useSerieColor
                        ? arc.color
                        : FINAL_CONFIG.style.chart.layout.labels.dataLabels.color
                        " :font-size="FINAL_CONFIG.style.chart.layout.labels.dataLabels.fontSize
                        " :font-weight="FINAL_CONFIG.style.chart.layout.labels.dataLabels.boldPercentage
                        ? 'bold'
                        : 'normal'
                        ">
                                {{
                                    dataLabel({
                                        v: arc.proportion * 100,
                                        s: "%",
                                        r: FINAL_CONFIG.style.chart.layout.labels.dataLabels
                                            .roundingPercentage,
                                    })
                                }}
                            </text>
                            <text data-cy="datapoint-value" :class="{ animated: FINAL_CONFIG.useCssAnimation }" v-show="mutableConfig.dataLabels.show &&
                                FINAL_CONFIG.style.chart.layout.labels.dataLabels
                                    .showPercentage &&
                                FINAL_CONFIG.style.chart.layout.labels.dataLabels.showValue
                                " :opacity="isArcBigEnough(arc) ? 1 : 0" :text-anchor="calcMarkerOffsetX(arc, true).anchor"
                                :x="calcMarkerOffsetX(
                                    arc,
                                    false,
                                    FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetX
                                ).x || 0
                                    " :y="calcMarkerOffsetY(
                        arc,
                        FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetY,
                        FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetY
                    ) + FINAL_CONFIG.style.chart.layout.labels.dataLabels.fontSize
                        " :fill="FINAL_CONFIG.style.chart.layout.labels.dataLabels.useSerieColor
                        ? arc.color
                        : FINAL_CONFIG.style.chart.layout.labels.dataLabels.color
                        " :font-size="FINAL_CONFIG.style.chart.layout.labels.dataLabels.fontSize
                        " :font-weight="FINAL_CONFIG.style.chart.layout.labels.dataLabels.boldValue
                        ? 'bold'
                        : 'normal'
                        ">
                                ({{
                                    applyDataLabel(
                                        FINAL_CONFIG.style.chart.layout.labels.dataLabels.formatter,
                                        arc.value,
                                        dataLabel({
                                            p: FINAL_CONFIG.style.chart.layout.labels.dataLabels.prefix,
                                            v: arc.value,
                                            s: FINAL_CONFIG.style.chart.layout.labels.dataLabels.suffix,
                                            r: FINAL_CONFIG.style.chart.layout.labels.dataLabels
                                                .roundingValue,
                                        }),
                                        { datapoint: arc, seriesIndex: i, datapointIndex: j }
                                    )
                                }})
                            </text>
                            <text :class="{ animated: FINAL_CONFIG.useCssAnimation }" v-if="
                                isArcBigEnough(arc) &&
                                mutableConfig.dataLabels.show &&
                                !FINAL_CONFIG.style.chart.layout.labels.dataLabels
                                    .showPercentage &&
                                FINAL_CONFIG.style.chart.layout.labels.dataLabels.showValue
                            " :text-anchor="calcMarkerOffsetX(arc, true).anchor" :x="calcMarkerOffsetX(
                                arc,
                                false,
                                FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetX
                            ).x || 0
                                " :y="calcMarkerOffsetY(
                        arc,
                        FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetY,
                        FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetY
                    )
                        " :fill="FINAL_CONFIG.style.chart.layout.labels.dataLabels.useSerieColor
                        ? arc.color
                        : FINAL_CONFIG.style.chart.layout.labels.dataLabels.color
                        " :font-size="FINAL_CONFIG.style.chart.layout.labels.dataLabels.fontSize
                        " :font-weight="FINAL_CONFIG.style.chart.layout.labels.dataLabels.boldValue
                        ? 'bold'
                        : 'normal'
                        ">
                                {{
                                    applyDataLabel(
                                        FINAL_CONFIG.style.chart.layout.labels.dataLabels.formatter,
                                        arc.value,
                                        dataLabel({
                                            p: FINAL_CONFIG.style.chart.layout.labels.dataLabels.prefix,
                                            v: arc.value,
                                            s: FINAL_CONFIG.style.chart.layout.labels.dataLabels.suffix,
                                            r: FINAL_CONFIG.style.chart.layout.labels.dataLabels
                                                .roundingValue,
                                        }),
                                        { datapoint: arc, seriesIndex: i, datapointIndex: j }
                                    )
                                }}
                            </text>
                        </g>
                    </g>
                </g>
    
                <!-- TOOLTIP TRAPS -->
                <g v-for="(item, i) in donuts">
                    <g v-for="(arc, j) in item.donut">
                        <path 
                            data-cy="tooltip-trap" 
                            :d="arc.arcSlice"
                            :fill="selectedSerie === arc.id ? FINAL_CONFIG.style.chart.layout.donut.selectedColor : 'transparent'" 
                            @mouseenter="useTooltip({
                                datapoint: arc,
                                relativeIndex: i,
                                seriesIndex: arc.seriesIndex,
                            })" 
                            @click="selectDatapoint({ datapoint: arc, index: j, seriesIndex: arc.seriesIndex })" 
                            @mouseleave="handleDatapointLeave({ datapoint: arc, seriesIndex: arc.seriesIndex })" 
                        />
                    </g>
                </g>
                <slot name="svg" :svg="svg"></slot>
            </g>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }" />
        </div>

        <!-- TOOLTIP -->
        <Tooltip :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.style.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.chart.tooltip.color"
            :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.chart.tooltip.position" :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="nestedDonutsChart" :content="tooltipContent" :isFullscreen="isFullscreen"
            :isCustom="isFunction(FINAL_CONFIG.style.chart.tooltip.customFormat)"
            :smooth="FINAL_CONFIG.style.chart.tooltip.smooth"
            :backdropFilter="FINAL_CONFIG.style.chart.tooltip.backdropFilter"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{ ...dataTooltipSlot }"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{ ...dataTooltipSlot }"></slot>
            </template>
        </Tooltip>

        <!-- LEGENDS -->
        <div ref="chartLegend" v-if="FINAL_CONFIG.style.chart.legend.show"
            :class="{ 'vue-ui-nested-donuts-legend': legendSets.length > 1 }">
            <Legend v-for="(legendSet, i) in legendSets" :key="`legend_${i}_${legendStep}`" :legendSet="legendSet"
                :config="legendConfig" @clickMarker="({ legend }) => segregateDonut(legend)">
                <template #legendTitle="{ titleSet }">
                    <div class="vue-ui-nested-donuts-legend-title" v-if="titleSet[0] && titleSet[0].arcOf">
                        {{ titleSet[0].arcOf }}
                    </div>
                </template>
                <template #item="{ legend, index }">
                    <div data-cy="legend-item" @click="segregateDonut(legend)"
                        :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                        {{ legend.name }}{{ FINAL_CONFIG.style.chart.legend.showPercentage || FINAL_CONFIG.style.chart.legend.showValue ? ':' : ''}}
                        {{
                            !FINAL_CONFIG.style.chart.legend.showValue ? '' : 
                            applyDataLabel(
                                FINAL_CONFIG.style.chart.layout.labels.dataLabels.formatter,
                                legend.value,
                                dataLabel({
                                    p: FINAL_CONFIG.style.chart.layout.labels.dataLabels.prefix,
                                    v: legend.value,
                                    s: FINAL_CONFIG.style.chart.layout.labels.dataLabels.suffix,
                                    r: FINAL_CONFIG.style.chart.legend.roundingValue,
                                }),
                                { datapoint: legend, seriesIndex: index }
                            )
                        }}
                        {{ 
                            !FINAL_CONFIG.style.chart.legend.showPercentage ? '' :
                            !segregated.includes(legend.id) 
                                ? `${FINAL_CONFIG.style.chart.legend.showValue ? '(' : ''}${isNaN(legend.value / legend.total)
                                    ? "-"
                                    : dataLabel({
                                        v: (legend.value / legend.total) * 100,
                                        s: "%",
                                        r: FINAL_CONFIG.style.chart.legend.roundingPercentage,
                                    })}${FINAL_CONFIG.style.chart.legend.showValue ? ')' : ''}`
                                : `${FINAL_CONFIG.style.chart.legend.showValue ? '(' : ''}- %${FINAL_CONFIG.style.chart.legend.showValue ? ')' : ''}`
                        }}
                    </div>
                </template>
            </Legend>
        </div>

        <div ref="chartLegend" v-if="!FINAL_CONFIG.style.chart.legend.show">
            <slot name="legend" v-bind:legend="legendSets"></slot>
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- DATA TABLE -->
        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color,
            },
            head: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color,
            },
        }">
            <template #content>
                <DataTable :key="`table_${tableStep}`" :colNames="dataTable.colNames" :head="dataTable.head"
                    :body="dataTable.body" :config="dataTable.config" :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text
                        ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}`
                        : ''
                        }`" @close="mutableConfig.showTable = false">
                    <template #th="{ th }">
                        <div v-html="th" style="display: flex; align-items: center"></div>
                    </template>
                    <template #td="{ td }">
                        {{ td.name || td }}
                    </template>
                </DataTable>
            </template>
        </Accordion>

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading"/>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-nested-donuts * {
    transition: unset;
}

.vue-ui-nested-donuts {
    user-select: none;
    position: relative;
}

.animated {
    animation: donut 0.5s ease-in-out;
    transform-origin: center;
}

@keyframes donut {
    0% {
        transform: scale(0.9, 0.9);
        opacity: 0;
    }

    80% {
        transform: scale(1.02, 1.02);
        opacity: 1;
    }

    to {
        transform: scale(1, 1);
        opacity: 1;
    }
}

.vue-ui-nested-donuts-legend {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.vue-ui-nested-donuts-legend-title {
    width: 100%;
    padding: 0 0 12px 0;
}
</style>
