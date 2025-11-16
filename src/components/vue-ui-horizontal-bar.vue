<script setup>
import {
    ref,
    computed,
    onMounted,
    onBeforeUnmount,
    watch,
    useSlots,
    defineAsyncComponent,
    shallowRef,
    nextTick,
    toRefs,
} from "vue";
import {
    applyDataLabel,
    checkNaN,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createUid,
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    hasDeepProperty,
    isFunction,
    objectIsEmpty,
    palette,
    setOpacity,
    shiftHue,
    themePalettes,
    treeShake,
    XMLNS,
} from "../lib.js";
import { throttle } from "../canvas-lib";
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading.js";
import { usePrinter } from "../usePrinter";
import { useSvgExport } from "../useSvgExport.js";
import { useResponsive } from "../useResponsive";
import { useNestedProp } from "../useNestedProp";
import { useThemeCheck } from "../useThemeCheck.js";
import { useTableResponsive } from "../useTableResponsive";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility.js";
import themes from "../themes/vue_ui_horizontal_bar.json";
import Legend from "../atoms/Legend.vue";
import Accordion from "./vue-ui-accordion.vue";
import Title from "../atoms/Title.vue";
import Shape from "../atoms/Shape.vue";
import img from "../img.js";
import BaseScanner from "../atoms/BaseScanner.vue";

const Tooltip = defineAsyncComponent(() => import("../atoms/Tooltip.vue"));
const BaseIcon = defineAsyncComponent(() => import("../atoms/BaseIcon.vue"));
const PenAndPaper = defineAsyncComponent(() =>
    import("../atoms/PenAndPaper.vue")
);
const UserOptions = defineAsyncComponent(() =>
    import("../atoms/UserOptions.vue")
);
const PackageVersion = defineAsyncComponent(() =>
    import("../atoms/PackageVersion.vue")
);
const BaseDraggableDialog = defineAsyncComponent(() =>
    import("../atoms/BaseDraggableDialog.vue")
);

const { vue_ui_vertical_bar: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();
const slots = useSlots();
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
    },
});

const uid = ref(createUid());
const isTooltip = ref(false);
const tooltipContent = ref("");
const hoveredBar = ref(null);
const step = ref(0);
const verticalBarChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const titleStep = ref(0);
const legendStep = ref(0);
const G = ref(null);
const tableUnit = ref(null);
const userOptionsRef = ref(null);
const parentLabels = ref(null);
const childLabels = ref(null);
const segregated = ref([]);
const sorts = ref({ none: 0, asc: 1, desc: 2 });
const sortIndex = ref(0);
const isSortNeutral = ref(false);
const dataLabelOverflow = ref(0);
const dataLabelOverflowLeft = ref(0);
const dataLabels = ref(null);

const emit = defineEmits(["selectLegend"]);

const FINAL_CONFIG = ref(prepareConfig());

const skeletonSet = computed(() => {
    const base = [
        { name: "", value: 6, color: "#d9d9d9" },
        { name: "", value: 5, color: "#d9d9d9" },
        { name: "", value: 4, color: "#d9d9d9" },
        { name: "", value: 3, color: "#d9d9d9" },
        { name: "", value: 2, color: "#d9d9d9" },
        { name: "", value: 1, color: "#d9d9d9" },
    ];
    return base;
});

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    callback: () => {
        Promise.resolve().then(async () => {
            mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
            prepareChart();
        });
    },
    skeletonDataset: skeletonSet.value,
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            useCssAnimation: false,
            userOptions: { show: false },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: "#99999930",
                    layout: {
                        bars: {
                            offsetX: 110,
                            dataLabels: {
                                color: "transparent",
                                value: { prefix: "", suffix: "", formatter: null },
                            },
                            nameLabels: { color: "transparent" },
                        },
                        separators: { color: "#7A7A7A" },
                    },
                    legend: {
                        show: true,
                        backgroundColor: "transparent",
                        color: "transparent",
                        prefix: "",
                        suffix: "",
                        formatter: null,
                    },
                    title: { color: "#1A1A1A", subtitle: { color: "#5A5A5A" } },
                },
            },
        },
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
    let finalConfig = {};
    const theme = mergedConfig.theme;
    if (theme) {
        if (!isThemeValid.value(mergedConfig)) {
            warnInvalidTheme(mergedConfig);
            finalConfig = mergedConfig;
        } else {
            const fused = useNestedProp({
                userConfig: themes[theme] || props.config,
                defaultConfig: mergedConfig,
            });
            finalConfig = {
                ...useNestedProp({ userConfig: props.config, defaultConfig: fused }),
                customPalette: mergedConfig.customPalette.length
                    ? mergedConfig.customPalette
                    : themePalettes[theme] || palette,
            };
        }
    } else {
        finalConfig = mergedConfig;
    }
    if (props.config && hasDeepProperty(props.config, "events.datapointEnter")) {
        finalConfig.events.datapointEnter = props.config.events.datapointEnter;
    } else {
        finalConfig.events.datapointEnter = null;
    }
    if (props.config && hasDeepProperty(props.config, "events.datapointLeave")) {
        finalConfig.events.datapointLeave = props.config.events.datapointLeave;
    } else {
        finalConfig.events.datapointLeave = null;
    }
    if (props.config && hasDeepProperty(props.config, "events.datapointClick")) {
        finalConfig.events.datapointClick = props.config.events.datapointClick;
    } else {
        finalConfig.events.datapointClick = null;
    }
    return finalConfig;
}

const WIDTH = ref(FINAL_CONFIG.value.style.chart.width);
const HEIGHT = ref(FINAL_CONFIG.value.style.chart.height);
const BAR_GAP = ref(FINAL_CONFIG.value.style.chart.layout.bars.gap);

watch(
    () => props.config,
    (_newCfg) => {
        if (!loading.value) {
            FINAL_CONFIG.value = prepareConfig();
        }
        userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
        // prepareChart();
        titleStep.value += 1;
        legendStep.value += 1;
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        mutableConfig.value.sortDesc =
            FINAL_CONFIG.value.style.chart.layout.bars.sort === "desc";
        mutableConfig.value.showTooltip =
            FINAL_CONFIG.value.style.chart.tooltip.show;
        WIDTH.value = FINAL_CONFIG.value.style.chart.width;
        HEIGHT.value = FINAL_CONFIG.value.style.chart.height;
        BAR_GAP.value = FINAL_CONFIG.value.style.chart.layout.bars.gap;
    },
    { deep: true }
);

watch(
    () => props.dataset,
    (newVal) => {
        if (Array.isArray(newVal) && newVal.length > 0) {
            manualLoading.value = false;
        }
    },
    { deep: true }
);

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-vertical-bar_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-vertical-bar",
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

const tableContainer = ref(null);
const breakpoint = computed(() => {
    return FINAL_CONFIG.value.table.responsiveBreakpoint;
});

const debug = computed(() => !!FINAL_CONFIG.value.debug);
const remainingHeight = ref(0);
const resizeObserver = ref(null);
const observedEl = ref(null);

function prepareChart() {
    if (!verticalBarChart.value) return;
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: "VueUiVerticalBar",
            type: "dataset",
            debug: debug.value,
        });
        isDataset.value = false;
        manualLoading.value = true;
    }

    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }
    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: verticalBarChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text
                    ? chartTitle.value
                    : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show
                    ? chartLegend.value
                    : null,
                source: source.value,
                noTitle: noTitle.value,
            });
            remainingHeight.value = height / 3;
            requestAnimationFrame(async () => {
                HEIGHT.value = height;
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

        nextTick(() => {
            observedEl.value = verticalBarChart.value?.parentNode;
            if (observedEl.value) {
                resizeObserver.value.observe(observedEl.value);
            }
        });
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

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    sortDesc: FINAL_CONFIG.value.style.chart.layout.bars.sort === "desc",
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show,
});

const isSortDown = computed(() => {
    return mutableConfig.value.sortDesc;
});

const immutableDataset = computed(() => {
    FINAL_DATASET.value.forEach((ds, i) => {
        if (!ds.value && !ds.children) {
            error({
                componentName: "VueUiVerticalBar",
                type: "datasetAttributeEmpty",
                property: `value (index ${i})`,
                debug: debug.value,
            });
        }
        if (ds.children) {
            if (objectIsEmpty(ds.children)) {
                error({
                    componentName: "VueUiVerticalBar",
                    type: "datasetAttributeEmpty",
                    property: `children (index ${i})`,
                    debug: debug.value,
                });
            } else {
                ds.children.forEach((child, j) => {
                    if ([null, undefined].includes(child.name)) {
                        error({
                            componentName: "VueUiVerticalBar",
                            type: "datasetSerieAttribute",
                            property: `name`,
                            key: "children",
                            index: j,
                            debug: debug.value,
                        });
                    }
                });
            }
        }
    });

    return FINAL_DATASET.value
        .map((serie, i) => {
            const id = `vertical_parent_${i}_${uid.value}`;
            const hasChildren = serie.children && serie.children.length > 0;

            const parentValue = checkNaN(
                serie.value
                    ? serie.value
                    : hasChildren
                        ? serie.children.map((c) => c.value || 0).reduce((a, b) => a + b, 0)
                        : 0
            );
            const parentSign = parentValue >= 0 ? 1 : -1;
            return {
                ...serie,
                id,
                absoluteIndex: i,
                shape: "square",
                opacity: segregated.value.includes(id) ? 0.5 : 1,
                value: Math.abs(parentValue),
                sign: parentSign,
                hasChildren,
                isChild: false,
                segregate: () => segregate(id),
                isSegregated: segregated.value.includes(id),
                color:
                    convertColorToHex(serie.color) ||
                    customPalette.value[i] ||
                    palette[i] ||
                    palette[i % palette.length],
                children:
                    !serie.children || !serie.children.length
                        ? []
                        : serie.children
                            .toSorted(
                                isSortNeutral.value
                                    ? () => 0
                                    : (a, b) =>
                                        isSortDown.value ? b.value - a.value : a.value - b.value
                            )
                            .map((c, j) => {
                                return {
                                    ...c,
                                    value: checkNaN(Math.abs(c.value)),
                                    absoluteIndex: i,
                                    sign: c.value >= 0 ? 1 : -1,
                                    isChild: true,
                                    parentId: id,
                                    parentName: serie.name,
                                    parentValue,
                                    parentSign,
                                    id: `vertical_child_${i}_${j}_${uid.value}`,
                                    childIndex: j,
                                    color:
                                        convertColorToHex(c.color) ||
                                        convertColorToHex(serie.color) ||
                                        customPalette.value[i] ||
                                        palette[i] ||
                                        palette[i % palette.length],
                                };
                            })
                            .map((c, j) => {
                                return {
                                    ...c,
                                    isFirstChild: j === 0,
                                    isLastChild: j === serie.children.length - 1,
                                };
                            }),
            };
        })
        .toSorted(
            isSortNeutral.value
                ? () => 0
                : (a, b) => (isSortDown.value ? b.value - a.value : a.value - b.value)
        );
});

const mutableDataset = computed(() => {
    return immutableDataset.value.filter(
        (serie) => !segregated.value.includes(serie.id)
    );
});

const bars = computed(() => {
    return mutableDataset.value.flatMap((serie) => {
        if (!serie.hasChildren) {
            return serie;
        } else {
            return serie.children;
        }
    });
});

// Used on childLabels to keep consistent spacing that is not touched by serie segregation
const immutableBars = computed(() => {
    return immutableDataset.value.flatMap((serie) => {
        if (!serie.hasChildren) {
            return serie;
        } else {
            return serie.children;
        }
    });
})

const barCount = computed(() => {
    return mutableDataset.value
        .flatMap((serie) => {
            if (serie.children && serie.children.length > 0) {
                return serie.children.length;
            } else {
                return 1;
            }
        })
        .reduce((a, b) => a + b, 0);
});

const legendConfig = computed(() => {
    return {
        cy: "vertical-bar-div-legend",
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? "bold" : "",
    };
});

const parentLabelBlockHeight = computed(() => {
    return FINAL_CONFIG.value.style.chart.layout.bars.parentLabels.show
        ? FINAL_CONFIG.value.style.chart.layout.bars.parentLabels.fontSize * 2 + 10
        : 0;
});

const parentLabelOffsets = computed(() => {
    const offsets = [];
    let count = 0;

    bars.value.forEach((b, i) => {
        if (
            b.isChild &&
            b.childIndex === 0 &&
            FINAL_CONFIG.value.style.chart.layout.bars.parentLabels.show
        ) {
            count += 1;
        }
        offsets[i] = count;
    });

    return offsets;
});

const barHeight = computed(() => {
    const p = Math.max(0, ...parentLabelOffsets.value);
    const parentOffsets = p * parentLabelBlockHeight.value;
    const innerHeight = HEIGHT.value - 24;
    return (
        (innerHeight - (barCount.value - 1) * BAR_GAP.value - parentOffsets) /
        barCount.value
    );
});

const svg = computed(() => {
    return {
        width: WIDTH.value,
        height: HEIGHT.value,
        padding: {
            top: 12,
            left: 128 + FINAL_CONFIG.value.style.chart.layout.bars.offsetX,
            right: 64 + FINAL_CONFIG.value.style.chart.layout.bars.paddingRight,
            bottom: 12,
        },
    };
});

const childColumnWidth = ref(0);

function updateChildColumnWidth() {
    nextTick(() => {
        if (!childLabels.value) {
            childColumnWidth.value = 0;
            return;
        }
        const texts = Array.from(childLabels.value.querySelectorAll('text'));
        const maxWidth = texts.reduce((max, t) => {
            const w = t.getBBox?.().width ?? t.getComputedTextLength();
            return w > max ? w : max;
        }, 0);
        childColumnWidth.value = maxWidth + 12;
    });
}

watch(
    () => [
        bars.value,
        WIDTH.value,
        HEIGHT.value,
        FINAL_CONFIG.value.style.chart.layout.bars.nameLabels,
        FINAL_CONFIG.value.style.chart.layout.bars.offsetX,
    ],
    () => updateChildColumnWidth(),
    { deep: true }
);

onMounted(() => {
    updateChildColumnWidth();
});

function updateDataLabelOverflow() {
    nextTick(() => {
        dataLabelOverflow.value = 0;
        dataLabelOverflowLeft.value = 0;

        requestAnimationFrame(() => {
            if (!dataLabels.value) {
                dataLabelOverflow.value = 0;
                dataLabelOverflowLeft.value = 0;
                return;
            }

            const texts = Array.from(
                dataLabels.value.querySelectorAll("text")
            );

            if (!texts.length) {
                dataLabelOverflow.value = 0;
                dataLabelOverflowLeft.value = 0;
                return;
            }

            let minLeft = Infinity;
            let maxRight = 0;

            texts.forEach((t) => {
                const bbox = t.getBBox();

                const leftEdge  = bbox.x;
                const rightEdge = bbox.x + bbox.width;

                if (leftEdge < minLeft)  minLeft  = leftEdge;
                if (rightEdge > maxRight) maxRight = rightEdge;
            });

            const svgLeftLimit = 0;
            const svgRightLimit = WIDTH.value;
            const safety = 24;
            const leftOverflow = Math.max(0, svgLeftLimit - minLeft + safety);
            const rightOverflow = Math.max(0, maxRight - svgRightLimit + safety);
            dataLabelOverflowLeft.value = leftOverflow;
            dataLabelOverflow.value = rightOverflow;
        });
    });
}

watch(segregated, () => updateDataLabelOverflow(), { deep: true });

watch(
    () => [bars.value, WIDTH.value, HEIGHT.value],
    () => updateDataLabelOverflow(),
    { deep: true }
);

onMounted(() => updateDataLabelOverflow());

const drawingArea = computed(() => {
    const left = childColumnWidth.value + Math.abs(FINAL_CONFIG.value.style.chart.layout.bars.nameLabels.offsetX) + dataLabelOverflowLeft.value + FINAL_CONFIG.value.style.chart.layout.bars.offsetX;

    const right = svg.value.width - svg.value.padding.right;
    const availableWidth = Math.max(0,right - left - dataLabelOverflow.value - dataLabelOverflowLeft.value - FINAL_CONFIG.value.style.chart.layout.bars.offsetX);

    return {
        top: svg.value.padding.top,
        bottom: svg.value.padding.top + svg.value.height,
        left,
        right,
        width: availableWidth,
        fullHeight: svg.value.padding.top + svg.value.padding.bottom + svg.value.height,
    };
});

async function segregate(id) {
    if (segregated.value.includes(id)) {
        segregated.value = segregated.value.filter((el) => el !== id);
    } else {
        if (segregated.value.length === immutableDataset.value.length - 1) return;
        segregated.value.push(id);
    }

    emit("selectLegend", mutableDataset.value);
    updateDataLabelOverflow()
}

function validSeriesToToggle(name) {
    if (!immutableDataset.value.length) {
        if (FINAL_CONFIG.value.debug) {
            console.warn("VueUiHorizontalBar - There are no series to show.");
        }
        return null;
    }
    const dp = immutableDataset.value.find((d) => d.name === name);
    if (!dp) {
        if (FINAL_CONFIG.value.debug) {
            console.warn(`VueUiHorizontalBar - Series name not found "${name}"`);
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
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (!segregated.value.includes(dp.id)) {
        segregate(dp.id);
    }
}

const total = computed(() => {
    return mutableDataset.value
        .map((serie) => Math.abs(serie.value))
        .reduce((a, b) => a + b, 0);
});

function calcProportionToTotal(val, formatted = false, rounding = 0) {
    if (formatted) {
        return dataLabel({
            v: checkNaN((Math.abs(val) / total.value) * 100),
            s: "%",
            r: rounding,
        });
    }
    return Math.abs(val) / total.value;
}

const hasNegative = computed(() => {
    return bars.value.map((b) => b.sign).includes(-1);
});

const max = computed(() => {
    return Math.max(
        ...mutableDataset.value.flatMap((serie) => {
            if (serie.children && serie.children.length) {
                return Math.max(...serie.children.map((c) => c.value));
            } else {
                return serie.value;
            }
        })
    );
});

function calcBarWidth(val) {
    const ratio = val / max.value;
    return (drawingArea.value.width / (hasNegative.value ? 2 : 1)) * ratio;
}

function calcDataLabelX(val) {
    return calcBarWidth(val) + drawingArea.value.left;
}

function getParentData(serie, index) {
    const parent = mutableDataset.value.find((el) => el.id === serie.parentId);

    const barStart =
        drawingArea.value.top +
        (BAR_GAP.value + barHeight.value) * index +
        parentLabelOffsets.value[index] * parentLabelBlockHeight.value;

    const parentLabelStart =
        barStart - parentLabelBlockHeight.value;

    const textY =
        parentLabelStart +
        FINAL_CONFIG.value.style.chart.layout.bars.parentLabels.fontSize;

    return {
        y: textY,
        name: parent.name,
        value: [undefined, NaN, null].includes(parent.value)
            ? ""
            : parent.sign === 1
                ? parent.value
                : -parent.value,
        percentageToTotal: isNaN(parent.value / total.value)
            ? ""
            : calcProportionToTotal(
                parent.value,
                true,
                FINAL_CONFIG.value.style.chart.layout.bars.dataLabels.percentage.roundingPercentage
            ),
        sign: parent.sign,
    };
}


function getData() {
    return mutableDataset.value;
}

function getParentName(serie, i) {
    return getParentData(serie, i).name;
}
function getParentDataLabel(serie, i) {
    const s = getParentData(serie, i);
    return makeDataLabel(s.value, s, i, serie.parentSign || serie.sign);
}

const selectedBarId = ref(null);

const dataTooltipSlot = ref(null);

function selectDatapoint({ datapoint, seriesIndex }) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({ datapoint, seriesIndex });
    }
}

function handleDatapointLeave({ datapoint, seriesIndex }) {
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({ datapoint, seriesIndex });
    }
    hoveredBar.value = null;
    isTooltip.value = false;
    selectedBarId.value = null;
}

function useTooltip(bar, seriesIndex) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({ datpoint: bar, seriesIndex });
    }

    dataTooltipSlot.value = {
        datapoint: bar,
        seriesIndex,
        series: immutableDataset.value,
        config: FINAL_CONFIG.value,
    };

    isTooltip.value = true;
    selectedBarId.value = bar.id;
    let html = "";
    const serieName = bar.isChild ? bar.parentName : bar.name;
    const childName = bar.isChild ? bar.name : "";

    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

    if (
        isFunction(customFormat) &&
        functionReturnsString(() =>
            customFormat({
                datapoint: bar,
                series: immutableDataset.value,
                config: FINAL_CONFIG.value,
                seriesIndex,
            })
        )
    ) {
        tooltipContent.value = customFormat({
            datapoint: bar,
            series: immutableDataset.value,
            config: FINAL_CONFIG.value,
            seriesIndex,
        });
    } else {
        html += `<div style="width:100%;text-align:center;border-bottom:1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor
            };padding-bottom:6px;margin-bottom:3px;text-align:left;">
                <div style="display:flex;align-items:center;gap:4px;"><svg viewBox="0 0 60 60" height="14" width="14"><rect x="0" y="0" height="60" width="60" rx="5" stroke="none" fill="${bar.color
            }"/>${slots.pattern
                ? `<rect x="0" y="0" height="60" width="60" rx="5" stroke="none" fill="url(#pattern_${uid.value}_${bar.absoluteIndex})"/>`
                : ""
            }</svg> ${serieName}</div>
                ${childName ? `<div>${childName}</div>` : ""}
            </div>`;

        if (FINAL_CONFIG.value.style.chart.tooltip.showValue) {
            html += `<div>${FINAL_CONFIG.value.translations.value
                }: <b>${applyDataLabel(
                    FINAL_CONFIG.value.style.chart.layout.bars.dataLabels.value.formatter,
                    bar.sign === 1 ? bar.value : -bar.value,
                    dataLabel({
                        p: FINAL_CONFIG.value.style.chart.tooltip.prefix,
                        v: bar.sign === 1 ? bar.value : -bar.value,
                        s: FINAL_CONFIG.value.style.chart.tooltip.suffix,
                        r: FINAL_CONFIG.value.style.chart.tooltip.roundingValue,
                    }),
                    { datapoint: bar, seriesIndex }
                )}</b></div>`;
        }

        if (FINAL_CONFIG.value.style.chart.tooltip.showPercentage) {
            html += `<div>${FINAL_CONFIG.value.translations.percentageToTotal
                } : <b>${dataLabel({
                    v: (Math.abs(bar.value) / total.value) * 100,
                    s: "%",
                    r: FINAL_CONFIG.value.style.chart.tooltip.roundingPercentage,
                })}</b></div>`;
            if (bar.isChild) {
                html += `<div>${FINAL_CONFIG.value.translations.percentageToSerie
                    }: <b>${dataLabel({
                        v: (Math.abs(bar.value) / Math.abs(bar.parentValue)) * 100,
                        s: "%",
                        r: FINAL_CONFIG.value.style.chart.tooltip.roundingPercentage,
                    })}</b></div>`;
            }
        }
        tooltipContent.value = `<div style="text-align:left">${html}</div>`;
    }
}

function makeDataLabel(value, datapoint, seriesIndex, sign) {
    if (!FINAL_CONFIG.value.style.chart.layout.bars.dataLabels.value.show) {
        return "";
    }
    const label = applyDataLabel(
        FINAL_CONFIG.value.style.chart.layout.bars.dataLabels.value.formatter,
        checkNaN(sign === -1 ? (value >= 0 ? -value : value) : value),
        dataLabel({
            p: FINAL_CONFIG.value.style.chart.layout.bars.dataLabels.value.prefix,
            v: checkNaN(sign === -1 ? (value >= 0 ? -value : value) : value),
            s: FINAL_CONFIG.value.style.chart.layout.bars.dataLabels.value.suffix,
            r: FINAL_CONFIG.value.style.chart.layout.bars.dataLabels.value
                .roundingValue,
        }),
        { datapoint, seriesIndex }
    );

    const percentage = `(${calcProportionToTotal(
        value,
        true,
        FINAL_CONFIG.value.style.chart.layout.bars.dataLabels.percentage
            .roundingPercentage
    )})`;

    return `${label}${FINAL_CONFIG.value.style.chart.layout.bars.dataLabels.percentage.show
            ? ` ${percentage}`
            : ""
        }`;
}

const table = computed(() => {
    const head = [
        FINAL_CONFIG.value.translations.parentName,
        FINAL_CONFIG.value.translations.value,
        FINAL_CONFIG.value.translations.percentageToTotal,
        FINAL_CONFIG.value.translations.childName,
        FINAL_CONFIG.value.translations.value,
        FINAL_CONFIG.value.translations.percentageToSerie,
        FINAL_CONFIG.value.translations.percentageToTotal,
    ];

    const body = bars.value.map((bar) => {
        if (!bar.isChild) {
            return {
                color: bar.color,
                parentName: bar.name,
                parentValue: bar.sign === 1 ? bar.value : -bar.value,
                percentageToTotal: Math.abs(bar.value) / total.value,
                childName: "",
                childValue: "",
                childPercentageToParent: "",
                childPercentageToTotal: "",
            };
        } else {
            if (bar.isFirstChild) {
                return {
                    color: bar.color,
                    parentName: bar.parentName,
                    parentValue: bar.parentValue,
                    percentageToTotal: bar.parentValue / total.value,
                    childName: bar.name,
                    childValue: bar.sign === 1 ? bar.value : -bar.value,
                    childPercentageToParent:
                        Math.abs(bar.value) / Math.abs(bar.parentValue),
                    childPercentageToTotal: Math.abs(bar.value) / total.value,
                };
            } else {
                return {
                    color: "",
                    parentName: "",
                    parentValue: "",
                    percentageToTotal: "",
                    childName: bar.name,
                    childValue: bar.sign === 1 ? bar.value : -bar.value,
                    childPercentageToParent:
                        Math.abs(bar.value) / Math.abs(bar.parentValue),
                    childPercentageToTotal: Math.abs(bar.value) / total.value,
                };
            }
        }
    });

    return { head, body };
});

function generateCsv(callback = null) {
    const title = [
        [FINAL_CONFIG.value.style.chart.title.text],
        [FINAL_CONFIG.value.style.chart.title.subtitle.text],
        [""],
    ];
    const head = table.value.head;
    const body = table.value.body.map((tr) => {
        return [
            tr.parentName,
            tr.parentValue,
            tr.percentageToTotal,
            tr.childName,
            tr.childValue,
            tr.childPercentageToParent,
            tr.childPercentageToTotal,
        ];
    });

    const tableXls = title.concat([head]).concat(body);
    const csvContent = createCsvContent(tableXls);

    if (!callback) {
        downloadCsv({
            csvContent,
            title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-vertical-bar",
        });
    } else {
        callback(csvContent);
    }
}

const isFullscreen = ref(false);
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

onMounted(() => {
    if (
        !["none", "asc", "desc"].includes(
            FINAL_CONFIG.value.style.chart.layout.bars.sort
        )
    ) {
        error({
            componentName: "VueUiVerticalBar",
            type: "attributeWrongValue",
            property: "style.chart.layout.bars.sort",
            key: FINAL_CONFIG.value.style.chart.layout.bars.sort,
        });
    }

    sortIndex.value =
        sorts.value[FINAL_CONFIG.value.style.chart.layout.bars.sort];
    mutableConfig.value.sortDesc = sortIndex.value === 2;
    isSortNeutral.value = sortIndex.value === 0;
});

function incrementSort() {
    sortIndex.value += 1;
    if (sortIndex.value > 2) {
        sortIndex.value = 0;
    }
}

function toggleSort() {
    incrementSort();
    mutableConfig.value.sortDesc = sortIndex.value === 2;
    isSortNeutral.value = sortIndex.value === 0;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

async function getImage({ scale = 2 } = {}) {
    if (!verticalBarChart.value) return;
    const { width, height } = verticalBarChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({
        domElement: verticalBarChart.value,
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
        title: `${FINAL_CONFIG.value.style.chart.title.text}${FINAL_CONFIG.value.style.chart.title.subtitle.text
                ? `: ${FINAL_CONFIG.value.style.chart.title.subtitle.text}`
                : ""
            }`,
        props: useDialog
            ? {
                backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
                color: FINAL_CONFIG.value.table.th.color,
                headerColor: FINAL_CONFIG.value.table.th.color,
                headerBg: FINAL_CONFIG.value.table.th.backgroundColor,
                isFullscreen: isFullscreen.value,
                fullscreenParent: verticalBarChart.value,
                forcedWidth: Math.min(800, window.innerWidth * 0.8),
            }
            : {
                hideDetails: true,
                config: {
                    open,
                    maxHeight: 10000,
                    body: {
                        backgroundColor: FINAL_CONFIG.value.style.chart.backgroundColor,
                        color: FINAL_CONFIG.value.style.chart.color,
                    },
                    head: {
                        backgroundColor: FINAL_CONFIG.value.style.chart.backgroundColor,
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
            if ("close" in tableUnit.value) {
                tableUnit.value.close();
            }
        }
    }
);

const { isResponsive } = useTableResponsive(tableContainer, breakpoint);

function closeTable() {
    mutableConfig.value.showTable = false;
    if (userOptionsRef.value) {
        userOptionsRef.value.setTableIconState(false);
    }
}

const legendSet = computed(() => {
    return immutableDataset.value.map((ds, i) => ({
        ...ds,
        shape: "square",
        display: `${ds.name}: ${applyDataLabel(
            FINAL_CONFIG.value.style.chart.layout.bars.dataLabels.value.formatter,
            ds.value,
            dataLabel({
                p: FINAL_CONFIG.value.style.chart.legend.prefix,
                v: ds.value,
                s: FINAL_CONFIG.value.style.chart.legend.suffix,
                r: FINAL_CONFIG.value.style.chart.legend.roundingValue,
            }),
            { datapoint: ds, seriesIndex: i }
        )}`,
    }));
});

const svgBg = computed(() => FINAL_CONFIG.value.style.chart.backgroundColor);
const svgLegend = computed(() => FINAL_CONFIG.value.style.chart.legend);
const svgTitle = computed(() => FINAL_CONFIG.value.style.chart.title);
const svgLegendItems = computed(() => {
    return legendSet.value.map((l) => ({
        ...l,
        name: l.display,
    }));
});

const { exportSvg, getSvg } = useSvgExport({
    svg: svgRef,
    title: svgTitle,
    legend: svgLegend,
    legendItems: svgLegendItems,
    backgroundColor: svgBg,
});

async function generateSvg({ isCb }) {
    if (isCb) {
        const { blob, url, text, dataUrl } = await getSvg();
        FINAL_CONFIG.value.userOptions.callbacks.svg({ blob, url, text, dataUrl });
    } else {
        exportSvg();
    }
}

function autoSize() {
    console.warn('[autoSize]: this legacy method can be safely removed as it ha no impact.')
}

defineExpose({
    autoSize,
    getData,
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    generateSvg,
    hideSeries,
    showSeries,
    toggleTable,
    toggleSort,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen,
});
</script>

<template>
    <div :class="`vue-data-ui-component vue-ui-vertical-bar ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''
        } ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'} ${FINAL_CONFIG.responsive
            ? 'vue-ui-vertical-bar-autosize'
            : ''
        }`" ref="verticalBarChart" :id="`vue-ui-vertical-bar_${uid}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor};height:100%`"
        @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
        <PenAndPaper v-if="FINAL_CONFIG.userOptions.buttons.annotator" :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator" @close="toggleAnnotator">
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

        <div ref="noTitle" v-if="hasOptionsNoTitle" class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`" />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text"
            :style="`width:100%;background:transparent;padding-bottom:12px`">
            <Title :key="`title_${titleStep}`" :config="{
                title: {
                    cy: 'vertical-bar-div-title',
                    ...FINAL_CONFIG.style.chart.title,
                },
                subtitle: {
                    cy: 'vertical-bar-div-subtitle',
                    ...FINAL_CONFIG.style.chart.title.subtitle,
                },
            }" />
        </div>

        <!-- OPTIONS -->
        <UserOptions ref="userOptionsRef" :key="`user_options_${step}`" v-if="
            FINAL_CONFIG.userOptions.show &&
            isDataset &&
            (keepUserOptionState ? true : userOptionsVisible)
        " :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" :color="FINAL_CONFIG.style.chart.color"
            :isImaging="isImaging" :isPrinting="isPrinting" :uid="uid" :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip &&
                FINAL_CONFIG.style.chart.tooltip.show
                " :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf" :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg" :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table" :hasSort="FINAL_CONFIG.userOptions.buttons.sort"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen" :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip" :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="verticalBarChart" :position="FINAL_CONFIG.userOptions.position"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator" :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.userOptions.callbacks" :printScale="FINAL_CONFIG.userOptions.print.scale"
            :tableDialog="FINAL_CONFIG.table.useDialog" @toggleFullscreen="toggleFullscreen" @generatePdf="generatePdf"
            @generateCsv="generateCsv" @generateImage="generateImage" @generateSvg="generateSvg"
            @toggleTable="toggleTable" @toggleSort="toggleSort" @toggleTooltip="toggleTooltip"
            @toggleAnnotator="toggleAnnotator" :style="{
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
            <template #optionSvg v-if="$slots.optionSvg">
                <slot name="optionSvg" />
            </template>
            <template #optionTable v-if="$slots.optionTable">
                <slot name="optionTable" />
            </template>
            <template #optionLabels v-if="$slots.optionLabels">
                <slot name="optionLabels" />
            </template>
            <template #optionSort v-if="$slots.optionSort">
                <slot name="optionSort" />
            </template>
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }" />
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <!-- LEGEND AS DIV : TOP -->
        <div ref="chartLegend" v-if="
            FINAL_CONFIG.style.chart.legend.show &&
            FINAL_CONFIG.style.chart.legend.position === 'top'
        ">
            <Legend :key="`legend_top_${legendStep}`" :legendSet="immutableDataset" :config="legendConfig"
                @clickMarker="({ legend }) => segregate(legend.id)">
                <template #legend-pattern="{ legend, index }" v-if="$slots.pattern">
                    <Shape :shape="legend.shape" :radius="30" stroke="none" :plot="{ x: 30, y: 30 }"
                        :fill="`url(#pattern_${uid}_${index})`" />
                </template>

                <template #item="{ legend, index }">
                    <div data-cy="legend-item" @click="segregate(legend.id)"
                        :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                        {{ legend.name }}:
                        {{
                            applyDataLabel(
                                FINAL_CONFIG.style.chart.layout.bars.dataLabels.value.formatter,
                                legend.value,
                                dataLabel({
                                    p: FINAL_CONFIG.style.chart.legend.prefix,
                                    v: legend.value,
                                    s: FINAL_CONFIG.style.chart.legend.suffix,
                                    r: FINAL_CONFIG.style.chart.legend.roundingValue,
                                }),
                        { datapoint: legend, seriesIndex: index }
                        )
                        }}
                    </div>
                </template>
            </Legend>
        </div>

        <!-- CHART -->
        <svg ref="svgRef" :xmlns="XMLNS" :class="{
            'vue-data-ui-fullscreen--on': isFullscreen,
            'vue-data-ui-fulscreen--off': !isFullscreen,
        }" :viewBox="`0 0 ${WIDTH} ${HEIGHT}`"
            :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.chart.color}`">
            <g ref="G" class="vue-data-ui-g">
                <PackageVersion />

                <!-- BACKGROUND SLOT -->
                <foreignObject v-if="$slots['chart-background']" :x="0" :y="0" :width="WIDTH"
                    :height="HEIGHT" :style="{
                        pointerEvents: 'none',
                    }">
                    <slot name="chart-background" />
                </foreignObject>

                <!-- defs -->
                <linearGradient x1="0%" y1="0%" x2="100%" y2="0%" v-for="(bar, i) in bars"
                    :id="`vertical_bar_gradient_${uid}_${i}`">
                    <stop offset="0%" :stop-color="bar.color" />
                    <stop offset="100%" :stop-color="setOpacity(
                        shiftHue(bar.color, 0.03),
                        100 - FINAL_CONFIG.style.chart.layout.bars.gradientIntensity
                    )
                        " />
                </linearGradient>

                <g v-if="$slots.pattern">
                    <defs v-for="bar in bars">
                        <slot name="pattern" v-bind="{
                            seriesIndex: bar.absoluteIndex,
                            patternId: `pattern_${uid}_${bar.absoluteIndex}`,
                        }" />
                    </defs>
                </g>

                <g v-for="(serie, i) in bars">
                    <!-- UNDERLAYER -->
                    <rect data-cy="datapoint-underlayer" :x="checkNaN(
                        hasNegative
                            ? drawingArea.left +
                            drawingArea.width / 2 -
                            (serie.sign === 1
                                ? 0
                                : calcBarWidth(serie.value) <= 0
                                    ? 0.0001
                                    : calcBarWidth(serie.value))
                            : drawingArea.left
                    )
                        " :y="drawingArea.top + (BAR_GAP + barHeight) * i + parentLabelOffsets[i] * parentLabelBlockHeight" :width="checkNaN(
                calcBarWidth(serie.value) <= 0
                    ? 0.0001
                    : calcBarWidth(serie.value)
            )
                " :height="barHeight <= 0 ? 0.0001 : barHeight"
                        :fill="FINAL_CONFIG.style.chart.layout.bars.underlayerColor"
                        :rx="FINAL_CONFIG.style.chart.layout.bars.borderRadius"
                        :class="{ animated: FINAL_CONFIG.useCssAnimation }" />
                </g>

                <g v-for="(serie, i) in bars">
                    <!-- BARS -->
                    <rect data-cy="datapoint-bar" :x="checkNaN(
                        hasNegative
                            ? drawingArea.left +
                            drawingArea.width / 2 -
                            (serie.sign === 1
                                ? 0
                                : calcBarWidth(serie.value) <= 0
                                    ? 0.0001
                                    : calcBarWidth(serie.value))
                            : drawingArea.left
                    )
                        " :y="drawingArea.top + (BAR_GAP + barHeight) * i + parentLabelOffsets[i] * parentLabelBlockHeight" :width="checkNaN(
                calcBarWidth(serie.value) <= 0
                    ? 0.0001
                    : calcBarWidth(serie.value)
            )
                " :height="barHeight <= 0 ? 0.0001 : barHeight" :fill="FINAL_CONFIG.style.chart.layout.bars.useGradient
                    ? `url(#vertical_bar_gradient_${uid}_${i})`
                    : setOpacity(
                        serie.color,
                        FINAL_CONFIG.style.chart.layout.bars.fillOpacity
                    )
                " :rx="FINAL_CONFIG.style.chart.layout.bars.borderRadius" :stroke="FINAL_CONFIG.style.chart.layout.bars.useStroke
                    ? serie.color
                    : 'none'
                " :stroke-width="FINAL_CONFIG.style.chart.layout.bars.useStroke
                    ? FINAL_CONFIG.style.chart.layout.bars.strokeWidth
                    : 0
                " :class="{ animated: FINAL_CONFIG.useCssAnimation }" />
                    <rect v-if="$slots.pattern" :x="checkNaN(
                        hasNegative
                            ? drawingArea.left +
                            drawingArea.width / 2 -
                            (serie.sign === 1
                                ? 0
                                : calcBarWidth(serie.value) <= 0
                                    ? 0.0001
                                    : calcBarWidth(serie.value))
                            : drawingArea.left
                    )
                        " :y="drawingArea.top + (BAR_GAP + barHeight) * i + parentLabelOffsets[i] * parentLabelBlockHeight" :width="checkNaN(
                calcBarWidth(serie.value) <= 0
                    ? 0.0001
                    : calcBarWidth(serie.value)
            )
                " :height="barHeight <= 0 ? 0.0001 : barHeight" :fill="`url(#pattern_${uid}_${serie.absoluteIndex})`"
                        :rx="FINAL_CONFIG.style.chart.layout.bars.borderRadius" :stroke="FINAL_CONFIG.style.chart.layout.bars.useStroke
                                ? serie.color
                                : 'none'
                            " :stroke-width="FINAL_CONFIG.style.chart.layout.bars.useStroke
                    ? FINAL_CONFIG.style.chart.layout.bars.strokeWidth
                    : 0
                " :class="{ animated: FINAL_CONFIG.useCssAnimation }" />

                    <!-- SEPARATORS -->
                    <line 
                        data-cy="datapoint-separator" 
                        v-if="(!serie.isChild || serie.isLastChild) && FINAL_CONFIG.style.chart.layout.separators.show && i !== bars.length - 1" 
                        :x1="WIDTH" 
                        :x2="FINAL_CONFIG.style.chart.layout.separators.fullWidth ? 0 : drawingArea.left" 
                        :y1="barHeight + BAR_GAP / 2 + drawingArea.top + (BAR_GAP + barHeight) * i + parentLabelOffsets[i] * parentLabelBlockHeight" 
                        :y2="barHeight + BAR_GAP / 2 + drawingArea.top + (BAR_GAP + barHeight) * i + parentLabelOffsets[i] * parentLabelBlockHeight" 
                        :stroke="FINAL_CONFIG.style.chart.layout.separators.color" 
                        :stroke-width="FINAL_CONFIG.style.chart.layout.separators.strokeWidth" 
                        stroke-linecap="round" 
                        :style="{
                            transition: 'none !important',
                            animation: 'none !important',
                        }" 
                    />

                    <line v-if="
                        hasNegative && FINAL_CONFIG.style.chart.layout.separators.show
                    " :x1="drawingArea.left + drawingArea.width / 2" :x2="drawingArea.left + drawingArea.width / 2"
                        :y1="drawingArea.top" :y2="drawingArea.bottom"
                        :stroke="FINAL_CONFIG.style.chart.layout.separators.color" :stroke-width="FINAL_CONFIG.style.chart.layout.separators.strokeWidth
                            " stroke-linecap="round" />
                </g>

                <!-- PARENT NAMES -->
                <g ref="parentLabels">
                    <g v-for="(serie, i) in bars" class="vue-ui-horizontal-bar-parent-label">
                        <rect
                            class="vue-ui-horizontal-bar-parent-marker"
                            v-if="serie.isChild && serie.childIndex === 0 && FINAL_CONFIG.style.chart.layout.bars.parentLabels.show"  
                            :x="2"
                            :y="getParentData(serie, i).y - (FINAL_CONFIG.style.chart.layout.bars.parentLabels.fontSize / 1.5)"
                            :height="FINAL_CONFIG.style.chart.layout.bars.parentLabels.fontSize / 1.5"
                            :width="FINAL_CONFIG.style.chart.layout.bars.parentLabels.fontSize / 1.5"
                            :rx="1"
                            :fill="serie.color"
                            style="animation: none !important; transition: none !important;"
                        />
                        <text 
                            data-cy="datapoint-parent-name"  
                            v-if="serie.isChild && serie.childIndex === 0 && FINAL_CONFIG.style.chart.layout.bars.parentLabels.show"  
                            :y="getParentData(serie, i).y" 
                            :font-size="FINAL_CONFIG.style.chart.layout.bars.parentLabels.fontSize" 
                            :fill="FINAL_CONFIG.style.chart.layout.bars.parentLabels.color" 
                            :x="FINAL_CONFIG.style.chart.layout.bars.parentLabels.offsetX + FINAL_CONFIG.style.chart.layout.bars.parentLabels.fontSize"
                            :font-weight="FINAL_CONFIG.style.chart.layout.bars.parentLabels.bold ? 'bold' : 'normal'"
                            text-anchor="start"
                        >
                            {{ getParentName(serie, i) }}
                        </text>
                        <text 
                            data-cy="datapoint-parent-value"  
                            v-if="serie.isChild && serie.childIndex === 0 && FINAL_CONFIG.style.chart.layout.bars.parentLabels.show"  
                            :y="getParentData(serie, i).y + FINAL_CONFIG.style.chart.layout.bars.parentLabels.fontSize * 1.2" 
                            :font-size="FINAL_CONFIG.style.chart.layout.bars.parentLabels.fontSize" 
                            :fill="FINAL_CONFIG.style.chart.layout.bars.parentLabels.color" 
                            :x="FINAL_CONFIG.style.chart.layout.bars.parentLabels.offsetX + FINAL_CONFIG.style.chart.layout.bars.parentLabels.fontSize"
                            :font-weight="FINAL_CONFIG.style.chart.layout.bars.dataLabels.bold ? 'bold' : 'normal'"
                            text-anchor="start"
                        >

                            {{ getParentDataLabel(serie, i) }}
                        </text>
                    </g>
                </g>

                <!-- CHILDREN | LONELY PARENTS NAMES FOR WIDTH CALCULATION -->
                <g ref="childLabels">
                    <g v-for="(serie, i) in immutableBars" class="vue-ui-horizontal-bar-child-label">
                        <text 
                            v-if="(serie.isChild || !serie.hasChildren) && FINAL_CONFIG.style.chart.layout.bars.nameLabels.show" 
                            text-anchor="start" 
                            :x="Math.abs(FINAL_CONFIG.style.chart.layout.bars.nameLabels.offsetX)" 
                            :y="checkNaN(drawingArea.top + (BAR_GAP + barHeight) * i + barHeight / 2 + FINAL_CONFIG.style.chart.layout.bars.nameLabels.fontSize / 2 + parentLabelOffsets[i] * parentLabelBlockHeight)" 
                            :font-size="FINAL_CONFIG.style.chart.layout.bars.nameLabels.fontSize" 
                            fill="transparent"
                            :font-weight="FINAL_CONFIG.style.chart.layout.bars.nameLabels.bold
                                ? 'bold'
                                : 'normal'
                            "
                            style="user-select: none;"
                            >
                            {{ serie.name }}
                        </text>
                    </g>
                </g>

                <g>
                    <g v-for="(serie, i) in bars" class="vue-ui-horizontal-bar-child-label">
                        <!-- CHILDREN | LONELY PARENTS NAMES -->
                        <text 
                            data-cy="datapoint-name" 
                            v-if="(serie.isChild || !serie.hasChildren) && FINAL_CONFIG.style.chart.layout.bars.nameLabels.show" 
                            text-anchor="end" 
                            :x="drawingArea.left + FINAL_CONFIG.style.chart.layout.bars.nameLabels.offsetX - 6" 
                            :y="drawingArea.top + (BAR_GAP + barHeight) * i + barHeight / 2 + FINAL_CONFIG.style.chart.layout.bars.nameLabels.fontSize / 3 + parentLabelOffsets[i] * parentLabelBlockHeight" :font-size="FINAL_CONFIG.style.chart.layout.bars.nameLabels.fontSize" 
                            :fill="FINAL_CONFIG.style.chart.layout.bars.nameLabels.color" 
                            :font-weight="FINAL_CONFIG.style.chart.layout.bars.nameLabels.bold
                                ? 'bold'
                                : 'normal'
                            ">
                            {{ serie.name }}
                        </text>
                    </g>
                </g>

                <!-- DATA LABELS -->
                <g ref="dataLabels">
                    <g v-for="(serie, i) in bars" class="vue-ui-horizontal-bar-child-label">
                        <text 
                            data-cy="datapoint-label" 
                            :x="!hasNegative
                                ? Math.min(
                                    calcDataLabelX(serie.value) +
                                    3 +
                                    FINAL_CONFIG.style.chart.layout.bars.dataLabels.offsetX,
                                    drawingArea.right - 2
                                )
                                : drawingArea.left +
                                drawingArea.width / 2 +
                                (serie.sign === 1 ? -12 : 12) +
                                (serie.sign === 1
                                    ? -FINAL_CONFIG.style.chart.layout.bars.dataLabels.offsetX
                                    : FINAL_CONFIG.style.chart.layout.bars.dataLabels.offsetX)
                            " 
                            :y="drawingArea.top +
                                (BAR_GAP + barHeight) * i +
                                barHeight / 2 + parentLabelOffsets[i] * parentLabelBlockHeight +
                                FINAL_CONFIG.style.chart.layout.bars.dataLabels.fontSize / 3
                                " :text-anchor="!hasNegative || serie.sign === -1 ? 'start' : 'end'" :font-size="FINAL_CONFIG.style.chart.layout.bars.dataLabels.fontSize
                                " :fill="FINAL_CONFIG.style.chart.layout.bars.dataLabels.color" :font-weight="FINAL_CONFIG.style.chart.layout.bars.dataLabels.bold
                                    ? 'bold'
                                    : 'normal'
                            "
                        >
                            {{ makeDataLabel(serie.value, serie, i, serie.sign) }}
                        </text>
                    </g>
                </g>

                <g v-for="(serie, i) in bars">
                    <!-- TOOLTIP TRAPS -->
                    <rect data-cy="tooltip-trap" :x="0" :y="drawingArea.top + (BAR_GAP + barHeight) * i - BAR_GAP / 2 + parentLabelOffsets[i] * parentLabelBlockHeight"
                        :width="WIDTH" :height="barHeight + BAR_GAP <= 0 ? 0.0001 : barHeight + BAR_GAP"
                        :fill="selectedBarId === serie.id
                                ? setOpacity(
                                    FINAL_CONFIG.style.chart.layout.highlighter.color,
                                    FINAL_CONFIG.style.chart.layout.highlighter.opacity
                                )
                                : 'transparent'
                            " @mouseenter="useTooltip(serie, i)" @mouseleave="
                handleDatapointLeave({ datapoint: serie, seriesIndex: i })
                " @click="selectDatapoint({ datapoint: serie, seriesIndex: i })" />
                </g>

                <slot name="svg" :svg="svg" />
            </g>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }" />
        </div>

        <!-- LEGEND AS DIV : BOTTOM -->
        <div ref="chartLegend" v-if="
            FINAL_CONFIG.style.chart.legend.show &&
            FINAL_CONFIG.style.chart.legend.position === 'bottom'
        ">
            <Legend :key="`legend_bottom_${legendStep}`" :legendSet="immutableDataset" :config="legendConfig"
                @clickMarker="({ legend }) => segregate(legend.id)">
                <template #legend-pattern="{ legend, index }" v-if="$slots.pattern">
                    <Shape :shape="legend.shape" :radius="30" stroke="none" :plot="{ x: 30, y: 30 }"
                        :fill="`url(#pattern_${uid}_${index})`" />
                </template>

                <template #item="{ legend, index }">
                    <div @click="segregate(legend.id)" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                        {{ legend.name }}:
                        {{
                            applyDataLabel(
                                FINAL_CONFIG.style.chart.layout.bars.dataLabels.value.formatter,
                                legend.value,
                                dataLabel({
                                    p: FINAL_CONFIG.style.chart.legend.prefix,
                                    v: legend.value,
                                    s: FINAL_CONFIG.style.chart.legend.suffix,
                                    r: FINAL_CONFIG.style.chart.legend.roundingValue,
                                }),
                        { datapoint: legend, seriesIndex: index }
                        )
                        }}
                    </div>
                </template>
            </Legend>
        </div>

        <slot name="legend" v-bind:legend="immutableDataset"></slot>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- TOOLTIP -->
        <Tooltip :show="mutableConfig.showTooltip &&
            isTooltip &&
            segregated.length < props.dataset.length
            " :backgroundColor="FINAL_CONFIG.style.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.chart.tooltip.color"
            :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.chart.tooltip.position" :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="verticalBarChart" :content="tooltipContent" :isFullscreen="isFullscreen" :isCustom="FINAL_CONFIG.style.chart.tooltip.customFormat &&
                typeof FINAL_CONFIG.style.chart.tooltip.customFormat === 'function'
                " :smooth="FINAL_CONFIG.style.chart.tooltip.smooth"
            :backdropFilter="FINAL_CONFIG.style.chart.tooltip.backdropFilter"
            :smoothForce="FINAL_CONFIG.style.chart.tooltip.smoothForce" :smoothSnapThreshold="FINAL_CONFIG.style.chart.tooltip.smoothSnapThreshold
                ">
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{ ...dataTooltipSlot }"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{ ...dataTooltipSlot }"></slot>
            </template>
        </Tooltip>

        <component v-if="isDataset && FINAL_CONFIG.userOptions.buttons.table" :is="tableComponent.component"
            v-bind="tableComponent.props" ref="tableUnit" @close="closeTable">
            <template #title v-if="FINAL_CONFIG.table.useDialog">
                {{ tableComponent.title }}
            </template>
            <template #actions v-if="FINAL_CONFIG.table.useDialog">
                <button tabindex="0" class="vue-ui-user-options-button"
                    @click="generateCsv(FINAL_CONFIG.userOptions.callbacks.csv)">
                    <BaseIcon name="excel" :stroke="tableComponent.props.color" />
                </button>
            </template>
            <template #content>
                <div ref="tableContainer" class="vue-ui-vertical-bar-table atom-data-table" :style="`${FINAL_CONFIG.table.useDialog
                        ? ''
                        : 'max-height: 300px; margin-top: 24px'
                    }`">
                    <div :style="`width:100%;padding-top: 36px;position:relative`">
                        <div v-if="!FINAL_CONFIG.table.useDialog" data-cy="data-table-close" role="button" tabindex="0"
                            :style="`width:32px; position: absolute; top: 0; right:4px; padding: 0 0px; display: flex; align-items:center;justify-content:center;height: 36px; width: 32px; cursor:pointer; background:${FINAL_CONFIG.table.th.backgroundColor};`"
                            @click="closeTable" @keypress.enter="closeTable">
                            <BaseIcon name="close" :stroke="FINAL_CONFIG.table.th.color" :stroke-width="2" />
                        </div>
                        <div style="width: 100%; container-type: inline-size"
                            :class="{ 'vue-ui-responsive': isResponsive }">
                            <table class="vue-ui-data-table">
                                <caption v-if="!FINAL_CONFIG.table.useDialog" :style="{
                                    backgroundColor: FINAL_CONFIG.table.th.backgroundColor,
                                    color: FINAL_CONFIG.table.th.color,
                                    outline: FINAL_CONFIG.table.th.outline,
                                }" class="vue-ui-data-table__caption">
                                    {{
                                        FINAL_CONFIG.style.chart.title.text
                                    }}
                                    <span v-if="FINAL_CONFIG.style.chart.title.subtitle.text">{{
                                        FINAL_CONFIG.style.chart.title.subtitle.text
                                        }}</span>
                                </caption>
                                <thead data-cy="vertical-bar-thead">
                                    <tr role="row" data-cy="vertical-bar-thead-tr"
                                        :style="`background:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color}`">
                                        <th v-for="th in table.head"
                                            :style="`outline:${FINAL_CONFIG.table.th.outline}`">
                                            <div style="width: 100%">
                                                {{ th }}
                                            </div>
                                        </th>
                                    </tr>
                                    <tr>
                                        <th
                                            :style="`background:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color};outline:${FINAL_CONFIG.table.th.outline}`">
                                        </th>
                                        <th
                                            :style="`background:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color};outline:${FINAL_CONFIG.table.th.outline};text-align:right;padding-right:5px;font-weight:bold`">
                                            ∑ {{ FINAL_CONFIG.table.td.prefix
                                            }}{{
                                                isNaN(total)
                                                    ? ""
                                                    : total.toFixed(FINAL_CONFIG.table.td.roundingValue)
                                            }}{{ FINAL_CONFIG.table.td.suffix }}
                                        </th>
                                        <th
                                            :style="`background:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color};outline:${FINAL_CONFIG.table.th.outline};text-align:right;padding-right:5px;font-weight:bold`">
                                            100%
                                        </th>
                                        <th
                                            :style="`background:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color};outline:${FINAL_CONFIG.table.th.outline}`">
                                        </th>
                                        <th
                                            :style="`background:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color};outline:${FINAL_CONFIG.table.th.outline}`">
                                        </th>
                                        <th
                                            :style="`background:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color};outline:${FINAL_CONFIG.table.th.outline}`">
                                        </th>
                                        <th
                                            :style="`background:${FINAL_CONFIG.table.th.backgroundColor};color:${FINAL_CONFIG.table.th.color};outline:${FINAL_CONFIG.table.th.outline}`">
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(tr, i) in table.body" :class="{
                                        'vue-ui-data-table__tbody__row': true,
                                        'vue-ui-data-table__tbody__row-even': i % 2 === 0,
                                        'vue-ui-data-table__tbody__row-odd': i % 2 !== 0,
                                    }" :style="`background:${FINAL_CONFIG.table.td.backgroundColor};color:${FINAL_CONFIG.table.td.color}`">
                                        <td class="vue-ui-data-table__tbody__td"
                                            :style="`outline:${FINAL_CONFIG.table.td.outline};font-variant-numeric: tabular-nums;`"
                                            :data-cell="table.head[0] ?? ''">
                                            <div style="
                          display: flex;
                          align-items: center;
                          gap: 5px;
                          justify-content: flex-end;
                          width: 100%;
                          padding-right: 3px;
                        ">
                                                <span v-if="tr.color"
                                                    :style="`color:${tr.color};margin-right:3px`">⬤</span><span>{{
                                                    tr.parentName }}</span>
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td"
                                            :style="`outline:${FINAL_CONFIG.table.td.outline}`"
                                            :data-cell="table.head[1] ?? ''">
                                            <div style="
                          display: flex;
                          align-items: center;
                          gap: 5px;
                          justify-content: flex-end;
                          width: 100%;
                          padding-right: 3px;
                        ">
                                                {{ FINAL_CONFIG.table.td.prefix
                                                }}{{
                                                    ["", NaN, undefined].includes(tr.parentValue)
                                                        ? ""
                                                        : tr.parentValue.toFixed(
                                                            FINAL_CONFIG.table.td.roundingValue
                                                )
                                                }}{{ FINAL_CONFIG.table.td.suffix }}
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td"
                                            :style="`outline:${FINAL_CONFIG.table.td.outline}`"
                                            :data-cell="table.head[2] ?? ''">
                                            <div style="
                          display: flex;
                          align-items: center;
                          gap: 5px;
                          justify-content: flex-end;
                          width: 100%;
                          padding-right: 3px;
                        ">
                                                {{
                                                    ["", NaN, undefined].includes(tr.percentageToTotal)
                                                        ? ""
                                                        : `${(tr.percentageToTotal * 100).toFixed(
                                                            FINAL_CONFIG.table.td.roundingPercentage
                                                )}%`
                                                }}
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td"
                                            :style="`outline:${FINAL_CONFIG.table.td.outline}`"
                                            :data-cell="table.head[3] ?? ''">
                                            <div style="
                          display: flex;
                          align-items: center;
                          gap: 5px;
                          justify-content: flex-end;
                          width: 100%;
                          padding-right: 3px;
                        ">
                                                {{ tr.childName }}
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td"
                                            :style="`outline:${FINAL_CONFIG.table.td.outline}`"
                                            :data-cell="table.head[4] ?? ''">
                                            <div style="
                          display: flex;
                          align-items: center;
                          gap: 5px;
                          justify-content: flex-end;
                          width: 100%;
                          padding-right: 3px;
                        ">
                                                {{ FINAL_CONFIG.table.td.prefix
                                                }}{{
                                                    ["", NaN, undefined].includes(tr.childValue)
                                                        ? ""
                                                        : tr.childValue.toFixed(
                                                            FINAL_CONFIG.table.td.roundingValue
                                                )
                                                }}{{ FINAL_CONFIG.table.td.suffix }}
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td"
                                            :style="`outline:${FINAL_CONFIG.table.td.outline}`"
                                            :data-cell="table.head[5] ?? ''">
                                            <div style="
                          display: flex;
                          align-items: center;
                          gap: 5px;
                          justify-content: flex-end;
                          width: 100%;
                          padding-right: 3px;
                        ">
                                                {{
                                                    ["", NaN, undefined].includes(
                                                        tr.childPercentageToParent
                                                    )
                                                        ? ""
                                                        : `${(tr.childPercentageToParent * 100).toFixed(
                                                FINAL_CONFIG.table.td.roundingPercentage
                                                )}%`
                                                }}
                                            </div>
                                        </td>
                                        <td class="vue-ui-data-table__tbody__td"
                                            :style="`outline:${FINAL_CONFIG.table.td.outline}`"
                                            :data-cell="table.head[6] ?? ''">
                                            <div style="
                          display: flex;
                          align-items: center;
                          gap: 5px;
                          justify-content: flex-end;
                          width: 100%;
                          padding-right: 3px;
                        ">
                                                {{
                                                    ["", NaN, undefined].includes(
                                                        tr.childPercentageToTotal
                                                    )
                                                        ? ""
                                                        : `${(tr.childPercentageToTotal * 100).toFixed(
                                                FINAL_CONFIG.table.td.roundingPercentage
                                                )}%`
                                                }}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </template>
        </component>

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading" />
    </div>
</template>

<style scoped lang="scss">
@import "../vue-data-ui.css";

.vue-ui-vertical-bar * {
    transition: unset;
}

path,
line,
rect,
circle,
polygon {
    animation: verticalBarAnimation 0.5s ease-in-out;
    transform-origin: center;
}

@keyframes verticalBarAnimation {
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

.vue-ui-vertical-bar {
    user-select: none;
    position: relative;
}

.vue-ui-vertical-bar .vue-ui-vertical-bar-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    text-align: center;
    width: 100%;
}

.vue-ui-vertical-bar-table {
    width: 100%;
    overflow: auto;
    position: relative;
}

.vue-ui-data-table thead {
    position: sticky;
    top: 0;
    font-weight: 400;
    user-select: none;
}

table {
    width: 100%;
    padding: 1rem;
    border-collapse: collapse;
}

caption,
th,
td {
    padding: 0.5rem;
    font-variant-numeric: tabular-nums;
}

caption {
    font-size: 1.3rem;
    font-weight: 700;
}

.vue-ui-responsive {
    th {
        display: none;
    }

    td {
        display: grid;
        gap: 0.5rem;
        grid-template-columns: repeat(2, 1fr);
        padding: 0.5rem 1rem;
        outline: none !important;
        text-align: left;
    }

    tr {
        outline: v-bind(tdo);
    }

    td:first-child {
        padding-top: 1rem;
    }

    td:last-child {
        padding-bottom: 1rem;
    }

    td::before {
        content: attr(data-cell) ": ";
        font-weight: 700;
        text-transform: capitalize;
    }
}

.animated {
    transition: all 0.3s ease-in-out !important;
}
</style>
