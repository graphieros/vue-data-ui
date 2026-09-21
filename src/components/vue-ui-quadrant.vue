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
} from 'vue';
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
    deepClone,
} from '../lib';
import { throttle } from '../canvas-lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { useLoading } from '../useLoading';
import { usePrinter } from '../usePrinter';
import { useResponsive } from '../useResponsive';
import { useThemeCheck } from '../useThemeCheck';
import { useNestedProp } from '../useNestedProp';
import { useChartExport } from '../useChartExport';
import { useUserOptionState } from '../useUserOptionState';
import { useChartAccessibility } from '../useChartAccessibility';
import img from '../img';
import Title from '../atoms/Title.vue'; // Must be ready in responsive mode
import Shape from '../atoms/Shape.vue';
import themes from '../themes/vue_ui_quadrant.json';
import Legend from '../atoms/Legend.vue'; // Must be ready in responsive mode
import BaseScanner from '../atoms/BaseScanner.vue';
import A11yDataTable from '../atoms/A11yDataTable.vue';
import BaseLegendToggle from '../atoms/BaseLegendToggle.vue';
import DefGrad from '../atoms/DefGrad.vue';

const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(
    () => import('../atoms/PenAndPaper.vue'),
);
const UserOptions = defineAsyncComponent(
    () => import('../atoms/UserOptions.vue'),
);
const PackageVersion = defineAsyncComponent(
    () => import('../atoms/PackageVersion.vue'),
);
const BaseDraggableDialog = defineAsyncComponent(
    () => import('../atoms/BaseDraggableDialog.vue'),
);

const { vue_ui_quadrant: DEFAULT_CONFIG } = useConfig();
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

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
});

const uid = ref(createUid());
const emit = defineEmits([
    'selectPlot',
    'selectSide',
    'selectLegend',
    'copyAlt',
]);
const isTooltip = ref(false);
const tooltipContent = ref('');
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

const activeTooltipIndex = ref(null); // a11y
const activeTooltipPlotId = ref(null); // a11y
const tooltipA11yPosition = ref({ x: 0, y: 0 }); // a11y
const tooltipTriggerMode = ref('pointer'); // a11y
const isFocus = ref(false); // a11y

const FINAL_CONFIG = ref(prepareConfig());
const cfgUserOptions = computed(() => FINAL_CONFIG.value.userOptions);
const cfgGrid = computed(() => FINAL_CONFIG.value.style.chart.layout.grid);
const cfgLabels = computed(() => FINAL_CONFIG.value.style.chart.layout.labels);
const cfgTooltip = computed(() => FINAL_CONFIG.value.style.chart.tooltip);
const cfgChart = computed(() => FINAL_CONFIG.value.style.chart);

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => props.dataset,
    component: 'VueUiQuadrant',
    rules: [COMMON_RULES.emptyArray, COMMON_RULES.noHint],
});

const isCursorPointer = computed(
    () => FINAL_CONFIG.value.userOptions.useCursorPointer,
);

const skeletonConfig = computed(() => {
    return {
        defaultConfig: {
            userOptions: { show: false },
            table: { show: false },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    layout: {
                        grid: {
                            stroke: '#6A6A6A',
                            graduations: {
                                stroke: '#6A6A6A',
                                color: '#6A6A6A90',
                            },
                            xAxis: {
                                auto: true,
                            },
                            yAxis: {
                                auto: true,
                            },
                        },
                        labels: {
                            quadrantLabels: { show: false },
                            plotLabels: { show: false },
                            axisLabels: { show: false },
                        },
                        plots: {
                            outlineColor: '#6A6A6A',
                        },
                    },
                    legend: {
                        backgroundColor: 'transparent',
                    },
                },
            },
        },
        userConfig: FINAL_CONFIG.value.skeletonConfig ?? {},
    };
});

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
        {
            name: '_',
            shape: 'circle',
            color: '#CACACA',
            series: [
                { name: '_', x: -6, y: -4 },
                { name: '_', x: -5, y: -2 },
                { name: '_', x: -4, y: -1 },
                { name: '_', x: -3, y: -0.5 },
                { name: '_', x: -2, y: -0.25 },
                { name: '_', x: -1, y: -0.135 },
                { name: '_', x: 0, y: 0 },
                { name: '_', x: 1, y: 0.135 },
                { name: '_', x: 2, y: 0.25 },
                { name: '_', x: 3, y: 0.5 },
                { name: '_', x: 4, y: 1 },
                { name: '_', x: 5, y: 2 },
                { name: '_', x: 6, y: 4 },
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
    config: cfgChart.value.title,
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

function stringifyStructuralConfig(cfg) {
    const clonedConfig = deepClone(cfg);
    if (clonedConfig?.style?.chart) {
        delete clonedConfig.style.chart.tooltip;
        // Add more properties here if they should not recompute the svg
    }
    return JSON.stringify(clonedConfig);
}

let previousStructuralConfig = stringifyStructuralConfig(props.config);

watch(
    () => props.config,
    (newConfig, oldConfig) => {
        const nextStructuralConfig = stringifyStructuralConfig(newConfig);

        const requiresChartPreparation =
            nextStructuralConfig !== previousStructuralConfig;

        previousStructuralConfig = nextStructuralConfig;

        const preparedConfig = prepareConfig();

        if (!requiresChartPreparation) {
            FINAL_CONFIG.value.style.chart.tooltip =
                preparedConfig.style.chart.tooltip;

            mutableConfig.value.showTooltip =
                FINAL_CONFIG.value.style.chart.tooltip.show;

            return;
        }

        FINAL_CONFIG.value = preparedConfig;
        userOptionsVisible.value =
            !FINAL_CONFIG.value.userOptions.showOnChartHover;
        prepareChart();
        titleStep.value += 1;
        tableStep.value += 1;
        legendStep.value += 1;

        // Reset mutable config
        mutableConfig.value.plotLabels.show = cfgLabels.value.plotLabels.show;
        mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
        mutableConfig.value.showTooltip = cfgTooltip.value.show;
    },
    { deep: true },
);

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);

const debug = computed(() => FINAL_CONFIG.value.debug);

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiQuadrant',
            type: 'dataset',
            debug: debug.value,
        });
    } else {
        if (debug.value) {
            props.dataset.forEach((ds, i) => {
                if ([null, undefined].includes(ds.name)) {
                    error({
                        componentName: 'VueUiQuadrant',
                        type: 'datasetSerieAttribute',
                        property: 'name',
                        index: i,
                    });
                }
                if ([null, undefined].includes(ds.series)) {
                    error({
                        componentName: 'VueUiQuadrant',
                        type: 'datasetSerieAttribute',
                        property: 'series',
                        index: i,
                    });
                } else {
                    ds.series.forEach((serie, j) => {
                        if ([null, undefined].includes(serie.name)) {
                            error({
                                componentName: 'VueUiQuadrant',
                                type: 'datasetSerieAttribute',
                                property: 'name',
                                key: 'series',
                                index: j,
                            });
                        }
                    });
                }
            });
        }
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: quadrantChart.value,
                title: cfgChart.value.title.text ? chartTitle.value : null,
                legend: cfgChart.value.legend.show ? chartLegend.value : null,
                source: source.value,
                noTitle: noTitle.value,
            });

            basePadding.value = 48;

            requestAnimationFrame(() => {
                svg.value.height = height;
                svg.value.usableHeight = height - basePadding.value * 2;
                svg.value.width = width;
                svg.value.usableWidth = width - basePadding.value * 2;
                svg.value.top = basePadding.value;
                svg.value.left = basePadding.value;
                svg.value.right = width - basePadding.value;
                svg.value.bottom = height - basePadding.value;
                svg.value.centerX = width / 2;
                svg.value.centerY = height - height / 2;
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
    elementId: `vue-ui-quadrant_${uid.value}`,
    fileName: cfgChart.value.title.text || 'vue-ui-quadrant',
    options: FINAL_CONFIG.value.userOptions.print,
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !cfgChart.value.title.text;
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const mutableConfig = ref({
    plotLabels: {
        show: cfgLabels.value.plotLabels.show,
    },
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: cfgTooltip.value.show,
});

const basePadding = ref(48);

const svg = ref({
    height: cfgChart.value.height,
    usableHeight: cfgChart.value.height - basePadding.value * 2,
    width: cfgChart.value.width,
    usableWidth: cfgChart.value.width - basePadding.value * 2,
    top: basePadding.value,
    left: basePadding.value,
    right: cfgChart.value.width - basePadding.value,
    bottom: cfgChart.value.height - basePadding.value,
    centerX: cfgChart.value.width / 2,
    centerY: cfgChart.value.height - cfgChart.value.height / 2,
    padding: basePadding.value,
});

const mutableSvg = ref({
    ...JSON.parse(JSON.stringify(svg.value)),
    startX: 0,
    startY: 0,
});

watch(
    () => svg.value,
    (val) => {
        if (val) {
            mutableSvg.value = {
                ...JSON.parse(JSON.stringify(svg.value)),
                startX: 0,
                startY: 0,
            };
        }
    },
    { deep: true },
);

const selectedSide = ref(null);

const selectedSideLabelCoordinates = computed(() => {
    switch (selectedSide.value) {
        case 'TL':
            return {
                x: mutableSvg.value.startX + mutableSvg.value.width / 2,
                y: mutableSvg.value.height,
                text: cfgLabels.value.quadrantLabels.tl.text || 'Top Left',
                fontSize: cfgLabels.value.quadrantLabels.tl.fontSize,
                fill: cfgLabels.value.quadrantLabels.tl.color,
                bold: cfgLabels.value.quadrantLabels.tl.bold,
            };
        case 'TR':
            return {
                x: mutableSvg.value.startX + mutableSvg.value.width / 2,
                y: mutableSvg.value.height,
                text: cfgLabels.value.quadrantLabels.tr.text || 'Top Right',
                fontSize: cfgLabels.value.quadrantLabels.tr.fontSize,
                fill: cfgLabels.value.quadrantLabels.tr.color,
                bold: cfgLabels.value.quadrantLabels.tr.bold,
            };
        case 'BR':
            return {
                x: mutableSvg.value.startX + mutableSvg.value.width / 2,
                y: mutableSvg.value.height * 1.678,
                text: cfgLabels.value.quadrantLabels.br.text || 'Bottom Right',
                fontSize: cfgLabels.value.quadrantLabels.br.fontSize,
                fill: cfgLabels.value.quadrantLabels.br.color,
                bold: cfgLabels.value.quadrantLabels.br.bold,
            };
        case 'BL':
            return {
                x: mutableSvg.value.startX + mutableSvg.value.width / 2,
                y: mutableSvg.value.height * 1.678,
                text: cfgLabels.value.quadrantLabels.bl.text || 'Bottom Left',
                fontSize: cfgLabels.value.quadrantLabels.bl.fontSize,
                fill: cfgLabels.value.quadrantLabels.bl.color,
                bold: cfgLabels.value.quadrantLabels.bl.bold,
            };

        default:
            return {
                x: 0,
                y: 0,
                text: '',
                fontSize: 0,
                fill: 'none',
                bold: false,
            };
    }
});

const currentAnimationFrame = ref(null);
const isAnimating = ref(false);

function zoomOnSide({ targetX, targetY, targetW, targetH, side }) {
    if (selectedSide.value) {
        selectSide(side);
    }
    const differentials = {
        x: targetX - mutableSvg.value.startX,
        y: targetY - mutableSvg.value.startY,
        w: targetW - mutableSvg.value.width,
        h: targetH - mutableSvg.value.height,
    };

    const steps = FINAL_CONFIG.value.zoomAnimationFrames;
    let init = 0;
    function anim() {
        isAnimating.value = true;
        mutableSvg.value.startX += differentials.x / steps;
        mutableSvg.value.startY += differentials.y / steps;
        mutableSvg.value.width += differentials.w / steps;
        mutableSvg.value.height += differentials.h / steps;
        init += 1;
        if (init < steps) {
            currentAnimationFrame.value = requestAnimationFrame(anim);
        } else {
            isAnimating.value = false;
        }
    }
    anim();
}

const zoomEnabled = computed(() => FINAL_CONFIG.value.zoomEnabled);

function selectQuadrantSide(side) {
    if (!zoomEnabled.value) return;
    if (isAnimating.value) return;
    if (isZoom.value && selectedSide.value === side) {
        zoomOnSide({
            targetX: 0,
            targetY: 0,
            targetW: svg.value.width,
            targetH: svg.value.height,
        });
        selectedSide.value = null;
        isZoom.value = false;
    } else {
        selectedSide.value = side;
        switch (side) {
            case 'TL':
                zoomOnSide({
                    targetX: 0,
                    targetY: 0,
                    targetW: svg.value.width / 2 + svg.value.left,
                    targetH: svg.value.height / 2 + svg.value.top,
                    side: 'tl',
                });
                break;

            case 'TR':
                zoomOnSide({
                    targetX: svg.value.width / 2 - svg.value.left,
                    targetY: 0,
                    targetW: svg.value.width / 2 + svg.value.left,
                    targetH: svg.value.height / 2 + svg.value.top,
                    side: 'tr',
                });
                break;

            case 'BR':
                zoomOnSide({
                    targetX: svg.value.width / 2 - svg.value.left,
                    targetY: svg.value.height / 2 - svg.value.top,
                    targetW: svg.value.width / 2 + svg.value.left,
                    targetH: svg.value.height / 2 + svg.value.top,
                    side: 'br',
                });
                break;

            case 'BL':
                zoomOnSide({
                    targetX: 0,
                    targetY: svg.value.height / 2 - svg.value.top,
                    targetW: svg.value.width / 2 + svg.value.left,
                    targetH: svg.value.height / 2 + svg.value.top,
                    side: 'bl',
                });
                break;

            default:
                mutableSvg.value.startX = 0;
                mutableSvg.value.startY = 0;
                mutableSvg.value.width = svg.value.width;
                mutableSvg.value.height = svg.value.height;
                break;
        }
        isZoom.value = true;
    }
}

const graduations = computed(() => {
    const grads = cfgGrid.value.graduations.steps;
    const stepX = svg.value.usableWidth / (grads * 2);
    const stepY = svg.value.top;

    const gradArray = [];
    for (let i = 0; i < grads; i += 1) {
        gradArray.push({
            x: svg.value.padding + stepX * i,
            y: stepY + svg.value.usableHeight * (i / grads / 2),
            height: svg.value.usableHeight * (1 - i / grads),
            width: svg.value.usableWidth * (1 - i / grads),
            opacity: Math.round(((i + 1) / grads) * 20),
        });
    }

    return gradArray;
});

const axisValues = computed(() => {
    let xMax = cfgGrid.value.xAxis.max;
    let xMin = cfgGrid.value.xAxis.min;
    let yMax = cfgGrid.value.yAxis.max;
    let yMin = cfgGrid.value.yAxis.min;

    if (cfgGrid.value.xAxis.auto) {
        xMax = Math.max(
            ...immutableDataset.value.flatMap((category) => {
                return category.series.map((s) => s.x);
            }),
        );
        xMin = Math.min(
            ...immutableDataset.value.flatMap((category) => {
                return category.series.map((s) => s.x);
            }),
        );
    }
    if (cfgGrid.value.yAxis.auto) {
        yMax = Math.max(
            ...immutableDataset.value.flatMap((category) => {
                return category.series.map((s) => s.y);
            }),
        );
        yMin = Math.min(
            ...immutableDataset.value.flatMap((category) => {
                return category.series.map((s) => s.y);
            }),
        );
    }

    return {
        x: {
            max: xMax,
            min: xMin,
        },
        y: {
            max: yMax,
            min: yMin,
        },
    };
});

const segregated = ref([]);

const immutableDataset = computed(() =>
    FINAL_DATASET.value.map((category, i) => {
        return {
            ...category,
            series: largestTriangleThreeBuckets({
                data: category.series,
                threshold: FINAL_CONFIG.value.downsample.threshold,
            }),
            id: `cat_${i}_${uid.value}`,
            color:
                convertColorToHex(category.color) ||
                customPalette.value[i] ||
                palette[i],
        };
    }),
);

const mutableDataset = computed(() => {
    return immutableDataset.value.filter((category) => {
        return !segregated.value.includes(category.id);
    });
});

const datasetReference = computed(() => {
    return immutableDataset.value.map((category, i) => {
        return {
            ...category,
            shape: category.shape || 'circle',
            series: category.series.map((s) => {
                return {
                    ...s,

                    x: calcX(s.x),
                    y: calcY(s.y),
                    xValue: s.x,
                    yValue: s.y,
                    quadrantSide: getQuadrantSide({ x: s.x, y: s.y }),
                    categoryName: category.name,
                    category,
                    shape: category.shape,
                    color: category.color,
                };
            }),
        };
    });
});

const drawableDataset = computed(() => {
    if (debug.value) {
        FINAL_DATASET.value.forEach((ds, i) => {
            ds.series.forEach((serie, j) => {
                if ([null, undefined].includes(serie.x)) {
                    error({
                        componentName: 'VueUiQuadrant',
                        type: 'datasetSerieAttribute',
                        property: 'x',
                        key: 'series',
                        index: j,
                    });
                }
                if ([null, undefined].includes(serie.y)) {
                    error({
                        componentName: 'VueUiQuadrant',
                        type: 'datasetSerieAttribute',
                        property: 'y',
                        key: 'series',
                        index: j,
                    });
                }
            });
        });
    }
    return mutableDataset.value.map((category, i) => {
        return {
            ...category,
            shape: category.shape || 'circle',
            color: category.color || customPalette.value[i] || palette[i],
            series: category.series.map((s) => {
                return {
                    ...s,
                    category,
                    x: calcX(s.x),
                    y: calcY(s.y),
                    xValue: s.x,
                    yValue: s.y,
                    quadrantSide: getQuadrantSide({ x: s.x, y: s.y }),
                    categoryName: category.name,
                    shape: category.shape,
                    color: category.color,
                    uid: createUid(),
                };
            }),
        };
    });
});

function calcX(x) {
    if (x >= 0) {
        const ratio = x / axisValues.value.x.max;
        return svg.value.centerX + (svg.value.usableWidth / 2) * ratio;
    } else {
        const ratio = Math.abs(x) / Math.abs(axisValues.value.x.min);
        return svg.value.centerX - (svg.value.usableWidth / 2) * ratio;
    }
}

function calcY(y) {
    if (y >= 0) {
        const ratio = y / axisValues.value.y.max;
        return svg.value.centerY + (1 - (svg.value.usableHeight / 2) * ratio);
    } else {
        const ratio = Math.abs(y) / Math.abs(axisValues.value.y.min);
        return svg.value.centerY - (1 - (svg.value.usableHeight / 2) * ratio);
    }
}

const table = computed(() => {
    const tableData = drawableDataset.value.flatMap((category) => {
        return category.series.map((s) => {
            return {
                x: s.xValue,
                y: s.yValue,
                name: s.name,
                category: s.categoryName,
                quadrantSide: s.quadrantSide,
                sideName: cfgLabels.value.quadrantLabels[s.quadrantSide].text,
                color: category.color,
                shape: category.shape,
            };
        });
    });
    const xAxisName = cfgGrid.value.xAxis.name || 'x';
    const yAxisName = cfgGrid.value.yAxis.name || 'y';
    const head = [
        FINAL_CONFIG.value.translations.category,
        FINAL_CONFIG.value.translations.item,
        xAxisName,
        yAxisName,
        FINAL_CONFIG.value.translations.side,
    ];

    const body = tableData.map((td) => {
        return [
            td.category,
            td.name,
            td.x,
            td.y,
            td.sideName || td.quadrantSide,
        ];
    });

    const itsShapes = tableData.map((td) => {
        return {
            shape: td.shape,
            color: td.color,
        };
    });

    return { head, body, itsShapes, tableData };
});

const dataTable = computed(() => {
    const head = table.value.head;
    const body = table.value.tableData.map((ds) => {
        return [
            {
                shape: ds.shape,
                color: ds.color,
                name: ds.category,
            },
            ds.name,
            applyDataLabel(
                cfgLabels.value.plotLabels.x.formatter,
                ds.x,
                dataLabel({
                    v: ds.x,
                    r: cfgLabels.value.plotLabels.rounding,
                }),
            ),
            applyDataLabel(
                cfgLabels.value.plotLabels.y.formatter,
                ds.y,
                dataLabel({
                    v: ds.y,
                    r: cfgLabels.value.plotLabels.rounding,
                }),
            ),
            ds.sideName || ds.quadrantSide,
        ];
    });

    const a11yBody = body.map((b) => {
        return b.map((c, i) => {
            if (i === 0) return c.name ?? '';
            return c;
        });
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

    return { head, body, a11yBody, config, colNames: head };
});

function toggleLegend() {
    if (segregated.value.length) {
        segregated.value = [];
    } else {
        legendSet.value.forEach((l) => {
            segregated.value.push(l.id);
        });
    }
    emit('selectLegend', getData());
}

function segregate(id) {
    if (segregated.value.includes(id)) {
        segregated.value = segregated.value.filter((s) => s !== id);
    } else {
        segregated.value.push(id);
    }
    emit('selectLegend', getData());
}

const legendSet = computed(() => {
    return datasetReference.value.map((category) => {
        return {
            name: category.name,
            shape: category.shape,
            color: category.color,
            id: category.id,
            opacity: segregated.value.includes(category.id) ? 0.5 : 1,
            segregate: () => segregate(category.id),
            isSegregated: segregated.value.includes(category.id),
        };
    });
});

function validSeriesToToggle(name) {
    if (!legendSet.value.length) {
        if (debug.value) {
            console.warn('VueUiQuadrant - There are no series to show.');
        }
        return null;
    }
    const dp = legendSet.value.find((d) => d.name === name);
    if (!dp) {
        if (debug.value) {
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
    const dp = validSeriesToToggle(name);
    if (dp === null) return;
    if (!segregated.value.includes(dp.id)) {
        segregate(dp.id);
    }
}

const legendConfig = computed(() => {
    return {
        cy: 'quadrant-div-legend',
        backgroundColor: cfgChart.value.legend.backgroundColor,
        color: cfgChart.value.legend.color,
        fontSize: cfgChart.value.legend.fontSize,
        paddingBottom: 12,
        fontWeight: cfgChart.value.legend.bold ? 'bold' : '',
    };
});

function getQuadrantSide(plot) {
    switch (true) {
        case plot.x >= 0 && plot.y >= 0:
            return 'tr';

        case plot.x >= 0 && plot.y < 0:
            return 'br';

        case plot.x < 0 && plot.y < 0:
            return 'bl';

        case plot.x < 0 && plot.y >= 0:
            return 'tl';
        default:
            return '';
    }
}

const hoveredPlotId = ref(null);
const hoveredPlot = ref(null);
const dataTooltipSlot = ref(null);

function clearPlotSelection() {
    hoveredPlotId.value = null;
    hoveredPlot.value = null;
    activeTooltipIndex.value = null;
    activeTooltipPlotId.value = null;
    isTooltip.value = false;
}

function updateTooltipA11yPosition(plotId) {
    if (!svgRef.value || !plotId) return;

    const selector = `[data-a11y-plot-id="${plotId}"]`;
    const trap = svgRef.value.querySelector(selector);

    if (!trap) return;

    const box = trap.getBoundingClientRect();

    tooltipA11yPosition.value = {
        x: box.left + box.width / 2,
        y: box.top + box.height / 2,
    };
}

function useTooltip(
    category,
    plot,
    categoryIndex,
    triggerMode = 'pointer',
    flatIndex = null,
) {
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({
            datapoint: plot,
            seriesIndex: categoryIndex,
        });
    }

    hoveredPlotId.value = plot.uid;
    hoveredPlot.value = {
        color: category.color,
        shape: category.shape,
    };

    tooltipTriggerMode.value = triggerMode;
    activeTooltipIndex.value = flatIndex;
    activeTooltipPlotId.value = plot.uid;

    dataTooltipSlot.value = {
        datapoint: plot,
        seriesIndex: categoryIndex,
        series: drawableDataset.value,
        config: FINAL_CONFIG.value,
    };

    const customFormat = cfgTooltip.value.customFormat;

    if (
        isFunction(customFormat) &&
        functionReturnsString(() =>
            customFormat({
                seriesIndex: categoryIndex,
                datapoint: plot,
                series: drawableDataset.value,
                config: FINAL_CONFIG.value,
            }),
        )
    ) {
        tooltipContent.value = customFormat({
            seriesIndex: categoryIndex,
            datapoint: plot,
            series: drawableDataset.value,
            config: FINAL_CONFIG.value,
        });
    } else {
        let html = '';

        if (plot.quadrantSide) {
            html += `<div style="color:${cfgLabels.value.quadrantLabels[plot.quadrantSide].color};font-weight:${cfgLabels.value.quadrantLabels[plot.quadrantSide].bold ? 'bold' : '400'}">${cfgLabels.value.quadrantLabels[plot.quadrantSide].text}</div>`;
        }
        html += `<div>${category.name}</div>`;
        html += `<div style="padding-bottom:6px;border-bottom:1px solid ${cfgTooltip.value.borderColor};margin-bottom:3px">${plot.name}</div>`;
        html += `<div>${cfgGrid.value.xAxis.name ? cfgGrid.value.xAxis.name : 'x'}: <b>${applyDataLabel(
            cfgLabels.value.plotLabels.x.formatter,
            plot.xValue,
            dataLabel({
                v: plot.xValue,
                r: cfgTooltip.value.roundingValue,
            }),
            { datapoint: plot, category, categoryIndex },
        )}</b></div>`;
        html += `<div>${cfgGrid.value.yAxis.name ? cfgGrid.value.yAxis.name : 'y'}: <b>${applyDataLabel(
            cfgLabels.value.plotLabels.y.formatter,
            plot.yValue,
            dataLabel({
                v: plot.yValue,
                r: cfgTooltip.value.roundingValue,
            }),
            { datapoint: plot, category, categoryIndex },
        )}</b></div>`;

        tooltipContent.value = `<div style="text-align:left;font-size:${cfgTooltip.value.fontSize}px">${html}</div>`;
    }

    if (triggerMode === 'keyboard') {
        nextTick(() => {
            updateTooltipA11yPosition(plot.uid);
        });
    }

    isTooltip.value = true;
}

function onTrapLeave(plot, index) {
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({
            datapoint: plot,
            seriesIndex: index,
        });
    }
    if (
        activeTooltipPlotId.value === plot.uid &&
        tooltipTriggerMode.value === 'keyboard'
    )
        return;
    isTooltip.value = false;
    hoveredPlotId.value = null;
    hoveredPlot.value = null;
}

function selectPlot(category, plot, index) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint: plot,
            seriesIndex: index,
        });
    }

    const plotEmit = {
        category: category.name,
        shape: category.shape,
        itemName: plot.name,
        x: plot.xValue,
        y: plot.yValue,
        quadrantSide: plot.quadrantSide,
        sideName: cfgLabels.value.quadrantLabels[plot.quadrantSide].text,
    };
    emit('selectPlot', plotEmit);
}

function selectSide(side) {
    if (!side) return;
    const sidePlots = drawableDataset.value.flatMap((category) =>
        category.series
            .filter((s) => s.quadrantSide === side)
            .map((s) => {
                return {
                    category: s.categoryName,
                    itemName: s.name,
                    x: s.xValue,
                    y: s.yValue,
                };
            }),
    );
    const sideEmit = {
        quadrantSide: side,
        sideName: cfgLabels.value.quadrantLabels[side].text,
        items: [...sidePlots],
    };
    emit('selectSide', sideEmit);
}

const miniMap = computed(() => {
    return {
        TL: {
            tl: {
                x: svg.value.left + svg.value.usableWidth / 4 - 20,
                y: 0,
                fill: cfgLabels.value.quadrantLabels.tl.color,
            },
            tr: {
                x: svg.value.left + svg.value.usableWidth / 4,
                y: 0,
                fill: cfgLabels.value.quadrantLabels.tr.color,
            },
            br: {
                x: svg.value.left + svg.value.usableWidth / 4,
                y: 20,
                fill: cfgLabels.value.quadrantLabels.br.color,
            },
            bl: {
                x: svg.value.left + svg.value.usableWidth / 4 - 20,
                y: 20,
                fill: cfgLabels.value.quadrantLabels.bl.color,
            },
            crosshairs: {
                horizontal: `M ${svg.value.left + svg.value.usableWidth / 4 - 20},${20} ${svg.value.left + svg.value.usableWidth / 4 + 20},${20}`,
                vertical: `M ${svg.value.left + svg.value.usableWidth / 4},${0} ${svg.value.left + svg.value.usableWidth / 4},${40}`,
            },
        },
        TR: {
            tl: {
                x: svg.value.centerX + svg.value.usableWidth / 4 - 20,
                y: 0,
                fill: cfgLabels.value.quadrantLabels.tl.color,
            },
            tr: {
                x: svg.value.centerX + svg.value.usableWidth / 4,
                y: 0,
                fill: cfgLabels.value.quadrantLabels.tr.color,
            },
            br: {
                x: svg.value.centerX + svg.value.usableWidth / 4,
                y: 20,
                fill: cfgLabels.value.quadrantLabels.br.color,
            },
            bl: {
                x: svg.value.centerX + svg.value.usableWidth / 4 - 20,
                y: 20,
                fill: cfgLabels.value.quadrantLabels.bl.color,
            },
            crosshairs: {
                horizontal: `M ${svg.value.centerX + svg.value.usableWidth / 4 - 20},${20} ${svg.value.centerX + svg.value.usableWidth / 4 + 20},${20}`,
                vertical: `M ${svg.value.centerX + svg.value.usableWidth / 4},${0} ${svg.value.centerX + svg.value.usableWidth / 4},${40}`,
            },
        },
        BR: {
            tl: {
                x: svg.value.centerX + svg.value.usableWidth / 4 - 20,
                y: svg.value.centerY - 48,
                fill: cfgLabels.value.quadrantLabels.tl.color,
            },
            tr: {
                x: svg.value.centerX + svg.value.usableWidth / 4,
                y: svg.value.centerY - 48,
                fill: cfgLabels.value.quadrantLabels.tr.color,
            },
            br: {
                x: svg.value.centerX + svg.value.usableWidth / 4,
                y: svg.value.centerY - 28,
                fill: cfgLabels.value.quadrantLabels.br.color,
            },
            bl: {
                x: svg.value.centerX + svg.value.usableWidth / 4 - 20,
                y: svg.value.centerY - 28,
                fill: cfgLabels.value.quadrantLabels.bl.color,
            },
            crosshairs: {
                horizontal: `M ${svg.value.centerX + svg.value.usableWidth / 4 - 20},${svg.value.centerY - 28} ${svg.value.centerX + svg.value.usableWidth / 4 + 20},${svg.value.centerY - 28}`,
                vertical: `M ${svg.value.centerX + svg.value.usableWidth / 4},${svg.value.centerY - 48} ${svg.value.centerX + svg.value.usableWidth / 4},${svg.value.centerY - 8}`,
            },
        },
        BL: {
            tl: {
                x: svg.value.left + svg.value.usableWidth / 4 - 20,
                y: svg.value.centerY - 48,
                fill: cfgLabels.value.quadrantLabels.tl.color,
            },
            tr: {
                x: svg.value.left + svg.value.usableWidth / 4,
                y: svg.value.centerY - 48,
                fill: cfgLabels.value.quadrantLabels.tr.color,
            },
            br: {
                x: svg.value.left + svg.value.usableWidth / 4,
                y: svg.value.centerY - 28,
                fill: cfgLabels.value.quadrantLabels.br.color,
            },
            bl: {
                x: svg.value.left + svg.value.usableWidth / 4 - 20,
                y: svg.value.centerY - 28,
                fill: cfgLabels.value.quadrantLabels.bl.color,
            },
            crosshairs: {
                horizontal: `M ${svg.value.left + svg.value.usableWidth / 4 - 20},${svg.value.centerY - 28} ${svg.value.left + svg.value.usableWidth / 4 + 20},${svg.value.centerY - 28}`,
                vertical: `M ${svg.value.left + svg.value.usableWidth / 4},${svg.value.centerY - 48} ${svg.value.left + svg.value.usableWidth / 4},${svg.value.centerY - 8}`,
            },
        },
    };
});

function getData() {
    return drawableDataset.value.map((ds) => {
        return {
            color: ds.color,
            name: ds.name,
            shape: ds.shape,
            series: ds.series.map((s) => {
                return {
                    name: s.name,
                    x: s.xValue,
                    y: s.yValue,
                    quadrantSide: s.quadrantSide,
                    sideName:
                        cfgLabels.value.quadrantLabels[s.quadrantSide].text,
                };
            }),
        };
    });
}

function generateCsv(callback = null) {
    nextTick(() => {
        const title = [
            [cfgChart.value.title.text],
            [cfgChart.value.title.subtitle.text],
            [''],
        ];
        const head = table.value.head;
        const body = table.value.body;
        const tableXls = title.concat([head]).concat(body);
        const csvContent = createCsvContent(tableXls);

        if (!callback) {
            downloadCsv({
                csvContent,
                title: cfgChart.value.title.text || 'vue-ui-quadrant',
            });
        } else {
            callback(csvContent);
        }
    });
}

const isFullscreen = ref(false);
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

async function getImage({ scale = 2 } = {}) {
    if (!quadrantChart.value) return;
    const { width, height } = quadrantChart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({
        domElement: quadrantChart.value,
        base64: true,
        img: true,
        scale,
    });
    return {
        imageUri,
        base64,
        title: cfgChart.value.title.text,
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
        title: `${cfgChart.value.title.text}${cfgChart.value.title.subtitle.text ? `: ${cfgChart.value.title.subtitle.text}` : ''}`,
        props: useDialog
            ? {
                  backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
                  color: FINAL_CONFIG.value.table.th.color,
                  headerColor: FINAL_CONFIG.value.table.th.color,
                  headerBg: FINAL_CONFIG.value.table.th.backgroundColor,
                  isFullscreen: isFullscreen.value,
                  fullscreenParent: quadrantChart.value,
                  forcedWidth: Math.min(800, window.innerWidth * 0.8),
                  isCursorPointer: isCursorPointer.value,
              }
            : {
                  hideDetails: true,
                  config: {
                      open,
                      maxHeight: 10000,
                      body: {
                          backgroundColor: cfgChart.value.backgroundColor,
                          color: cfgChart.value.color,
                      },
                      head: {
                          backgroundColor: cfgChart.value.backgroundColor,
                          color: cfgChart.value.color,
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

const svgBg = computed(() => cfgChart.value.backgroundColor);
const svgLegend = computed(() => cfgChart.value.legend);
const svgTitle = computed(() => cfgChart.value.title);

const { isCallbackImaging, isCallbackSvg, generateSvg, onGenerateImage } =
    useChartExport({
        svg: svgRef,
        title: svgTitle,
        legend: svgLegend,
        legendItems: legendSet,
        backgroundColor: svgBg,
        getSvgCallback: () => FINAL_CONFIG.value.userOptions.callbacks.svg,
        generateImage,
    });

async function copyAlt() {
    emit('copyAlt', {
        config: FINAL_CONFIG.value,
        dataset: mutableDataset.value,
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
            dataset: mutableDataset.value,
        }),
    );
}

/***************************************************************************************************
 * a11y
 ***************************************************************************************************/

function onSvgFocus() {
    activeTooltipIndex.value = null;
    activeTooltipPlotId.value = null;
    isFocus.value = true;
}

function onSvgBlur() {
    clearPlotSelection();
    isFocus.value = false;
}

function onSvgKeydown(event) {
    if (!svgRef.value || isAnnotator.value) return;
    if (document.activeElement !== svgRef.value) return;
    if (!a11yPlots.value.length) return;

    const isPreviousKey = event.key === 'ArrowLeft' || event.key === 'ArrowUp';
    const isNextKey = event.key === 'ArrowRight' || event.key === 'ArrowDown';
    const isActivationKey = event.key === 'Enter' || event.key === ' ';
    const isEscapeKey = event.key === 'Escape';

    if (!isPreviousKey && !isNextKey && !isActivationKey && !isEscapeKey)
        return;

    event.preventDefault();
    event.stopPropagation();

    if (isEscapeKey) {
        clearPlotSelection();
        return;
    }

    if (isActivationKey) {
        if (activeTooltipIndex.value === null) return;

        const entry = a11yPlots.value[activeTooltipIndex.value];
        if (!entry) return;

        selectPlot(entry.category, entry.plot, entry.categoryIndex);
        return;
    }

    let nextIndex = activeTooltipIndex.value;

    const hoveredVisibleIndex = hoveredPlotId.value
        ? a11yPlots.value.findIndex(
              (entry) => entry.plot.uid === hoveredPlotId.value,
          )
        : null;

    const hasValidActiveIndex =
        nextIndex !== null &&
        nextIndex >= 0 &&
        nextIndex < a11yPlots.value.length;

    const hasValidHoveredIndex =
        hoveredVisibleIndex !== null &&
        hoveredVisibleIndex >= 0 &&
        hoveredVisibleIndex < a11yPlots.value.length;

    if (!hasValidActiveIndex) {
        if (hasValidHoveredIndex) {
            nextIndex = isNextKey
                ? hoveredVisibleIndex + 1
                : hoveredVisibleIndex - 1;

            if (nextIndex >= a11yPlots.value.length) {
                nextIndex = 0;
            }

            if (nextIndex < 0) {
                nextIndex = a11yPlots.value.length - 1;
            }
        } else if (isNextKey) {
            nextIndex = 0;
        } else {
            nextIndex = a11yPlots.value.length - 1;
        }
    } else {
        nextIndex += isNextKey ? 1 : -1;

        if (nextIndex < 0) {
            nextIndex = a11yPlots.value.length - 1;
        }

        if (nextIndex >= a11yPlots.value.length) {
            nextIndex = 0;
        }
    }

    const entry = a11yPlots.value[nextIndex];
    if (!entry) return;

    useTooltip(
        entry.category,
        entry.plot,
        entry.categoryIndex,
        'keyboard',
        nextIndex,
    );
}

const a11yTable = computed(() => {
    const headers = dataTable.value?.colNames ?? [];
    const rows = dataTable.value?.a11yBody ?? [];
    return { headers, rows };
});

const a11yPlots = computed(() => {
    return drawableDataset.value.flatMap((category, categoryIndex) => {
        return category.series.map((plot) => {
            return {
                category,
                plot,
                categoryIndex,
            };
        });
    });
});

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
    copyAlt,
});
</script>

<template>
    <div
        :class="`vue-data-ui-component vue-ui-quadrant ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`"
        ref="quadrantChart"
        :id="`vue-ui-quadrant_${uid}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;background:${cfgChart.backgroundColor};${FINAL_CONFIG.responsive ? `height: 100%` : ''}`"
        @mouseenter="() => setUserOptionsVisibility(true)"
        @mouseleave="
            () => {
                setUserOptionsVisibility(false);
                if (!isFocus) {
                    clearPlotSelection();
                }
            }
        "
    >
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
            v-if="cfgUserOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :active="isAnnotator"
            :isCursorPointer="isCursorPointer"
            :palette="cfgUserOptions.annotatorPalette"
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

        <!-- TITLE AS DIV -->
        <div
            ref="chartTitle"
            v-if="cfgChart.title.text"
            :style="`width:100%;background:transparent;padding-bottom:12px`"
        >
            <Title
                :key="`table_${titleStep}`"
                :config="{
                    title: {
                        cy: 'quadrant-title',
                        ...cfgChart.title,
                    },
                    subtitle: {
                        cy: 'quadrant-subtitle',
                        ...cfgChart.title.subtitle,
                    },
                }"
            />
        </div>

        <div :id="`legend-top-${uid}`" />

        <!-- OPTIONS -->
        <UserOptions
            ref="userOptionsRef"
            :key="`user_options_${step}`"
            v-if="
                cfgUserOptions.show &&
                isDataset &&
                (keepUserOptionState ? true : userOptionsVisible)
            "
            :backgroundColor="cfgChart.backgroundColor"
            :color="cfgChart.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :uid="uid"
            :hasTooltip="cfgUserOptions.buttons.tooltip && cfgTooltip.show"
            :hasPdf="cfgUserOptions.buttons.pdf"
            :hasImg="cfgUserOptions.buttons.img"
            :hasSvg="cfgUserOptions.buttons.svg"
            :hasXls="cfgUserOptions.buttons.csv"
            :hasTable="cfgUserOptions.buttons.table"
            :hasLabel="cfgUserOptions.buttons.labels"
            :hasFullscreen="cfgUserOptions.buttons.fullscreen"
            :hasAltCopy="cfgUserOptions.buttons.altCopy"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...cfgUserOptions.buttonTitles }"
            :chartElement="quadrantChart"
            :position="cfgUserOptions.position"
            :hasAnnotator="cfgUserOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="cfgUserOptions.callbacks"
            :printScale="cfgUserOptions.print.scale"
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
            <template #optionLabels v-if="$slots.optionLabels">
                <slot name="optionLabels" />
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
            <template #custom-menu-before v-if="$slots['custom-menu-before']">
                <slot name="custom-menu-before" />
            </template>
            <template #custom-menu-after v-if="$slots['custom-menu-after']">
                <slot name="custom-menu-after" />
            </template>
        </UserOptions>

        <!-- CHART -->
        <div style="position: relative">
            <svg
                ref="svgRef"
                data-cy="quadrant-svg"
                :xmlns="XMLNS"
                :aria-describedby="`chart-instructions-${uid}`"
                :class="{
                    'vue-data-ui-fullscreen--on': isFullscreen,
                    'vue-data-ui-fulscreen--off': !isFullscreen,
                }"
                :viewBox="`${mutableSvg.startX} ${mutableSvg.startY} ${mutableSvg.width} ${mutableSvg.height}`"
                :style="`max-width:100%;overflow:hidden;background:transparent;color:${cfgChart.color}`"
                :id="`svg_${uid}`"
                tabindex="0"
                @focus="onSvgFocus"
                @blur="onSvgBlur"
                @keydown="onSvgKeydown"
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
                        pointerEvents: 'none',
                    }"
                >
                    <slot name="chart-background" />
                </foreignObject>

                <!-- DEFS -->
                <defs>
                    <DefGrad
                        t="radial"
                        cx="50%"
                        cy="50%"
                        r="50%"
                        fx="50%"
                        fy="50%"
                        v-for="(d, i) in drawableDataset"
                        :id="`quadrant_gradient_${uid}_${i}`"
                        :key="`quadrant_gradient_${uid}_${i}`"
                        :stops="[
                            [
                                '0%',
                                setOpacity(
                                    shiftHue(d.color, 0.05),
                                    cfgChart.layout.areas.opacity,
                                ),
                                1,
                            ],
                            [
                                '100%',
                                setOpacity(
                                    d.color,
                                    cfgChart.layout.areas.opacity,
                                ),
                                1,
                            ],
                        ]"
                    />
                </defs>

                <!-- GRID -->
                <!-- GRADUATIONS-->
                <g v-if="cfgGrid.graduations.show">
                    <rect
                        v-for="graduation in graduations"
                        data-cy="grid-rect"
                        :fill="
                            cfgGrid.graduations.fill
                                ? setOpacity(
                                      cfgGrid.graduations.color,
                                      graduation.opacity,
                                  )
                                : 'none'
                        "
                        :x="graduation.x"
                        :y="graduation.y"
                        :height="
                            graduation.height <= 0 ? 0.001 : graduation.height
                        "
                        :width="
                            graduation.width <= 0 ? 0.001 : graduation.width
                        "
                        :stroke-width="cfgGrid.graduations.strokeWidth"
                        :stroke="cfgGrid.graduations.stroke"
                        :rx="cfgGrid.graduations.roundingForce"
                    />
                </g>

                <!-- AXIS -->
                <line
                    data-cy="axis-x"
                    :x1="svg.left"
                    :y1="svg.centerY"
                    :x2="svg.right"
                    :y2="svg.centerY"
                    :stroke="cfgGrid.stroke"
                    :stroke-width="cfgGrid.strokeWidth"
                />
                <line
                    data-cy="axis-y"
                    :x1="svg.centerX"
                    :y1="svg.top"
                    :x2="svg.centerX"
                    :y2="svg.bottom"
                    :stroke="cfgGrid.stroke"
                    :stroke-width="cfgGrid.strokeWidth"
                />
                <!-- ARROWS -->
                <g v-if="cfgGrid.showArrows">
                    <polygon
                        data-cy="axis-arrow"
                        :points="`${svg.right - 8},${svg.centerY - 6} ${svg.right},${svg.centerY} ${svg.right - 8},${svg.centerY + 6}`"
                        :fill="cfgGrid.stroke"
                        stroke="none"
                    />
                    <polygon
                        data-cy="axis-arrow"
                        :points="`${svg.left + 8},${svg.centerY - 6} ${svg.left},${svg.centerY} ${svg.left + 8},${svg.centerY + 6}`"
                        :fill="cfgGrid.stroke"
                        stroke="none"
                    />
                    <polygon
                        data-cy="axis-arrow"
                        :points="`${svg.centerX - 6},${svg.top + 8} ${svg.centerX},${svg.top} ${svg.centerX + 6},${svg.top + 8}`"
                        :fill="cfgGrid.stroke"
                        stroke="none"
                    />
                    <polygon
                        data-cy="axis-arrow"
                        :points="`${svg.centerX - 6},${svg.bottom - 8} ${svg.centerX},${svg.bottom} ${svg.centerX + 6},${svg.bottom - 8}`"
                        :fill="cfgGrid.stroke"
                        stroke="none"
                    />
                </g>

                <!-- QUADRANT LABELS -->
                <g v-if="cfgLabels.quadrantLabels.show && !isZoom">
                    <!-- TL -->
                    <text
                        data-cy="quadrant-label-tl"
                        v-if="cfgLabels.quadrantLabels.tl.text"
                        :x="0"
                        :y="svg.top - svg.padding / 2"
                        text-anchor="start"
                        :fill="cfgLabels.quadrantLabels.tl.color"
                        :font-size="cfgLabels.quadrantLabels.tl.fontSize"
                        :style="`font-weight:${cfgLabels.quadrantLabels.tl.bold ? 'bold' : ''}`"
                        @click="selectSide('tl')"
                    >
                        {{ cfgLabels.quadrantLabels.tl.text }}
                    </text>

                    <!-- TR -->
                    <text
                        data-cy="quadrant-label-tr"
                        v-if="cfgLabels.quadrantLabels.tr.text"
                        :x="svg.width"
                        :y="svg.top - svg.padding / 2"
                        text-anchor="end"
                        :fill="cfgLabels.quadrantLabels.tr.color"
                        :font-size="cfgLabels.quadrantLabels.tr.fontSize"
                        :style="`font-weight:${cfgLabels.quadrantLabels.tr.bold ? 'bold' : ''}`"
                        @click="selectSide('tr')"
                    >
                        {{ cfgLabels.quadrantLabels.tr.text }}
                    </text>

                    <!-- BR -->
                    <text
                        data-cy="quadrant-label-br"
                        v-if="cfgLabels.quadrantLabels.br.text"
                        :x="svg.width"
                        :y="svg.bottom + svg.padding * 0.7"
                        text-anchor="end"
                        :fill="cfgLabels.quadrantLabels.br.color"
                        :font-size="cfgLabels.quadrantLabels.br.fontSize"
                        :style="`font-weight:${cfgLabels.quadrantLabels.br.bold ? 'bold' : ''}`"
                        @click="selectSide('br')"
                    >
                        {{ cfgLabels.quadrantLabels.br.text }}
                    </text>

                    <!-- BL -->
                    <text
                        data-cy="quadrant-label-bl"
                        v-if="cfgLabels.quadrantLabels.bl.text"
                        :x="0"
                        :y="svg.bottom + svg.padding * 0.7"
                        text-anchor="start"
                        :fill="cfgLabels.quadrantLabels.bl.color"
                        :font-size="cfgLabels.quadrantLabels.bl.fontSize"
                        :style="`font-weight:${cfgLabels.quadrantLabels.bl.bold ? 'bold' : ''}`"
                        @click="selectSide('bl')"
                    >
                        {{ cfgLabels.quadrantLabels.bl.text }}
                    </text>
                </g>

                <!-- AXIS VALUES -->
                <g v-if="cfgLabels.axisLabels.show">
                    <!-- Y MAX -->
                    <text
                        v-if="cfgGrid.yAxis.show"
                        data-cy="label-y-max"
                        :x="svg.centerX"
                        :y="svg.top - svg.padding / 6"
                        text-anchor="middle"
                        :font-size="cfgLabels.axisLabels.fontSize"
                        :fill="cfgLabels.axisLabels.color.positive"
                    >
                        {{
                            applyDataLabel(
                                cfgLabels.plotLabels.y.formatter,
                                axisValues.y.max,
                                dataLabel({
                                    v: axisValues.y.max,
                                    r: cfgLabels.plotLabels.rounding,
                                }),
                            )
                        }}
                    </text>
                    <text
                        data-cy="axis-y-name"
                        :x="svg.centerX"
                        :y="svg.top - svg.padding / 2"
                        text-anchor="middle"
                        :font-size="cfgLabels.axisLabels.fontSize"
                        :fill="cfgLabels.axisLabels.color.positive"
                    >
                        {{ cfgGrid.yAxis.name }}
                    </text>

                    <!-- Y MIN -->
                    <text
                        v-if="cfgGrid.yAxis.show"
                        data-cy="label-y-min"
                        :x="svg.centerX"
                        :y="svg.bottom + svg.padding * 0.35"
                        text-anchor="middle"
                        :font-size="cfgLabels.axisLabels.fontSize"
                        :fill="cfgLabels.axisLabels.color.negative"
                    >
                        {{
                            applyDataLabel(
                                cfgLabels.plotLabels.y.formatter,
                                axisValues.y.min,
                                dataLabel({
                                    v: axisValues.y.min,
                                    r: cfgLabels.plotLabels.rounding,
                                }),
                            )
                        }}
                    </text>

                    <!-- X MIN -->
                    <text
                        v-if="cfgGrid.xAxis.show"
                        data-cy="label-x-min"
                        :id="`xLabelMin_${uid}`"
                        text-anchor="middle"
                        :font-size="cfgLabels.axisLabels.fontSize"
                        :transform="`translate(${svg.padding - cfgLabels.axisLabels.fontSize}, ${svg.height / 2}), rotate(-90)`"
                        :fill="cfgLabels.axisLabels.color.negative"
                    >
                        {{
                            applyDataLabel(
                                cfgLabels.plotLabels.x.formatter,
                                axisValues.x.min,
                                dataLabel({
                                    v: axisValues.x.min,
                                    r: cfgLabels.plotLabels.rounding,
                                }),
                            )
                        }}
                    </text>

                    <!-- X MAX -->
                    <text
                        v-if="cfgGrid.xAxis.show"
                        data-cy="label-x-max"
                        :id="`xLabelMax_${uid}`"
                        text-anchor="middle"
                        :font-size="cfgLabels.axisLabels.fontSize"
                        :transform="`translate(${svg.width - svg.padding + cfgLabels.axisLabels.fontSize}, ${svg.height / 2}), rotate(90)`"
                        :fill="cfgLabels.axisLabels.color.positive"
                    >
                        {{
                            applyDataLabel(
                                cfgLabels.plotLabels.x.formatter,
                                axisValues.x.max,
                                dataLabel({
                                    v: axisValues.x.max,
                                    r: cfgLabels.plotLabels.rounding,
                                }),
                            )
                        }}
                    </text>
                    <text
                        data-cy="axis-x-name"
                        :id="`xLabelMaxName_${uid}`"
                        text-anchor="middle"
                        :font-size="cfgLabels.axisLabels.fontSize"
                        :transform="`translate(${svg.width - cfgLabels.axisLabels.fontSize}, ${svg.height / 2}), rotate(90)`"
                        :fill="cfgLabels.axisLabels.color.positive"
                    >
                        {{ cfgGrid.xAxis.name }}
                    </text>
                </g>

                <!-- AREAS GIFT WRAPPING -->
                <g v-if="cfgChart.layout.areas.show">
                    <g v-for="(category, i) in drawableDataset">
                        <polygon
                            data-cy="gift-wrap"
                            v-if="category.series.length > 2"
                            data-cy-quadrant-area
                            :fill="
                                cfgChart.layout.areas.useGradient
                                    ? `url(#quadrant_gradient_${uid}_${i})`
                                    : setOpacity(
                                          category.color,
                                          cfgChart.layout.areas.opacity,
                                      )
                            "
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
                        :width="
                            svg.usableWidth / 2 <= 0
                                ? 0.001
                                : svg.usableWidth / 2
                        "
                        :height="
                            svg.usableHeight / 2 <= 0
                                ? 0.001
                                : svg.usableHeight / 2
                        "
                        fill="transparent"
                        :class="{
                            'vue-data-ui-zoom-plus': !isZoom && zoomEnabled,
                            'vue-data-ui-zoom-minus': isZoom && zoomEnabled,
                        }"
                    />
                    <rect
                        data-cy="side-trap-tr"
                        @click="selectQuadrantSide('TR')"
                        :x="svg.centerX"
                        :y="svg.top"
                        :width="
                            svg.usableWidth / 2 <= 0
                                ? 0.001
                                : svg.usableWidth / 2
                        "
                        :height="
                            svg.usableHeight / 2 <= 0
                                ? 0.001
                                : svg.usableHeight / 2
                        "
                        fill="transparent"
                        :class="{
                            'vue-data-ui-zoom-plus': !isZoom && zoomEnabled,
                            'vue-data-ui-zoom-minus': isZoom && zoomEnabled,
                        }"
                    />
                    <rect
                        data-cy="side-trap-br"
                        @click="selectQuadrantSide('BR')"
                        :x="svg.centerX"
                        :y="svg.centerY"
                        :width="
                            svg.usableWidth / 2 <= 0
                                ? 0.001
                                : svg.usableWidth / 2
                        "
                        :height="
                            svg.usableHeight / 2 <= 0
                                ? 0.001
                                : svg.usableHeight / 2
                        "
                        fill="transparent"
                        :class="{
                            'vue-data-ui-zoom-plus': !isZoom && zoomEnabled,
                            'vue-data-ui-zoom-minus': isZoom && zoomEnabled,
                        }"
                    />
                    <rect
                        data-cy="side-trap-bl"
                        @click="selectQuadrantSide('BL')"
                        :x="svg.left"
                        :y="svg.centerY"
                        :width="
                            svg.usableWidth / 2 <= 0
                                ? 0.001
                                : svg.usableWidth / 2
                        "
                        :height="
                            svg.usableHeight / 2 <= 0
                                ? 0.001
                                : svg.usableHeight / 2
                        "
                        fill="transparent"
                        :class="{
                            'vue-data-ui-zoom-plus': !isZoom && zoomEnabled,
                            'vue-data-ui-zoom-minus': isZoom && zoomEnabled,
                        }"
                    />
                </g>

                <!-- PLOTS -->
                <template v-if="!cfgLabels.plotLabels.showAsTag">
                    <g v-for="(category, i) in drawableDataset">
                        <template v-if="$slots.datapoint && !loading">
                            <g v-for="plot in category.series" :key="plot.uid">
                                <foreignObject
                                    :x="plot.x - 1"
                                    :y="plot.y - 1"
                                    width="2"
                                    height="2"
                                    style="
                                        overflow: visible;
                                        pointer-events: none;
                                    "
                                    @mouseenter="useTooltip(category, plot, i)"
                                    @mouseleave="onTrapLeave(plot, i)"
                                    @click="selectPlot(category, plot, i)"
                                >
                                    <slot
                                        name="datapoint"
                                        v-bind="{
                                            datapoint: {
                                                ...plot,
                                                onEnter: () =>
                                                    useTooltip(
                                                        category,
                                                        plot,
                                                        i,
                                                    ),
                                                onLeave: () =>
                                                    onTrapLeave(plot, i),
                                                onClick: () =>
                                                    selectPlot(
                                                        category,
                                                        plot,
                                                        i,
                                                    ),
                                                isSelected:
                                                    hoveredPlotId &&
                                                    plot.uid === hoveredPlotId,
                                            },
                                        }"
                                    />
                                </foreignObject>

                                <circle
                                    :data-a11y-plot-id="plot.uid"
                                    :cx="plot.x"
                                    :cy="plot.y"
                                    :r="
                                        Math.max(
                                            cfgChart.layout.plots.radius /
                                                (isZoom ? 1.5 : 1),
                                            10,
                                        )
                                    "
                                    fill="transparent"
                                    style="pointer-events: none"
                                />
                            </g>
                        </template>

                        <template v-else-if="$slots.datapointSvg && !loading">
                            <g v-for="plot in category.series" :key="plot.uid">
                                <slot
                                    name="datapointSvg"
                                    v-bind="{
                                        datapoint: {
                                            ...plot,
                                            onEnter: () =>
                                                useTooltip(category, plot, i),
                                            onLeave: () => onTrapLeave(plot, i),
                                            onClick: () =>
                                                selectPlot(category, plot, i),
                                            isSelected:
                                                hoveredPlotId &&
                                                plot.uid === hoveredPlotId,
                                        },
                                    }"
                                />
                            </g>
                        </template>

                        <template v-else>
                            <g
                                v-for="(plot, plotIndex) in category.series"
                                :key="plot.uid"
                            >
                                <Shape
                                    :color="category.color"
                                    :isSelected="
                                        hoveredPlotId &&
                                        plot.uid === hoveredPlotId
                                    "
                                    :plot="plot"
                                    :radius="
                                        cfgChart.layout.plots.radius /
                                        (isZoom ? 1.5 : 1)
                                    "
                                    :shape="category.shape"
                                    :stroke="
                                        cfgChart.layout.plots.outline
                                            ? cfgChart.layout.plots.outlineColor
                                            : 'none'
                                    "
                                    :strokeWidth="
                                        cfgChart.layout.plots.outlineWidth
                                    "
                                    @mouseenter="
                                        useTooltip(category, plot, i, 'pointer')
                                    "
                                    @mouseleave="onTrapLeave(plot, i)"
                                    @click="selectPlot(category, plot, i)"
                                />
                                <circle
                                    data-dom-to-png-ignore
                                    :data-a11y-plot-id="plot.uid"
                                    :cx="plot.x"
                                    :cy="plot.y"
                                    :r="
                                        Math.max(
                                            cfgChart.layout.plots.radius /
                                                (isZoom ? 1.5 : 1),
                                            10,
                                        )
                                    "
                                    fill="transparent"
                                    style="pointer-events: none"
                                />
                            </g>
                        </template>
                    </g>

                    <g
                        v-if="mutableConfig.plotLabels.show"
                        style="pointer-events: none"
                    >
                        <g v-for="category in drawableDataset">
                            <g v-for="plot in category.series">
                                <!-- SINGLE LINE -->
                                <text
                                    v-if="!String(plot.name).includes('\n')"
                                    data-cy="plot-label"
                                    :x="plot.x"
                                    :y="
                                        plot.y +
                                        cfgLabels.plotLabels.offsetY +
                                        cfgChart.layout.plots.radius
                                    "
                                    text-anchor="middle"
                                    :font-size="
                                        cfgLabels.plotLabels.fontSize /
                                        (isZoom ? 1.5 : 1)
                                    "
                                    :fill="cfgLabels.plotLabels.color"
                                >
                                    {{ plot.name }}
                                </text>
                                <text
                                    v-else
                                    data-cy="plot-label"
                                    :x="plot.x"
                                    :y="
                                        plot.y +
                                        cfgLabels.plotLabels.offsetY +
                                        cfgChart.layout.plots.radius
                                    "
                                    text-anchor="middle"
                                    :font-size="
                                        cfgLabels.plotLabels.fontSize /
                                        (isZoom ? 1.5 : 1)
                                    "
                                    :fill="cfgLabels.plotLabels.color"
                                    v-html="
                                        createTSpansFromLineBreaksOnX({
                                            content: String(plot.name),
                                            fontSize:
                                                cfgChart.layout.labels
                                                    .plotLabels.fontSize /
                                                (isZoom ? 1.5 : 1),
                                            fill: cfgChart.layout.labels
                                                .plotLabels.color,
                                            x: plot.x,
                                            y:
                                                plot.y +
                                                cfgChart.layout.labels
                                                    .plotLabels.offsetY +
                                                cfgChart.layout.plots.radius,
                                        })
                                    "
                                />
                            </g>
                        </g>
                    </g>
                </template>

                <template v-else>
                    <g v-if="mutableConfig.plotLabels.show">
                        <template v-for="(category, i) in drawableDataset">
                            <foreignObject
                                v-for="plot in category.series"
                                style="overflow: visible"
                                height="10"
                                width="100"
                                :x="plot.x - 50"
                                :y="plot.y - cfgLabels.plotLabels.fontSize"
                                @mouseover="useTooltip(category, plot, i)"
                                @mouseleave="onTrapLeave(plot, i)"
                                @click="selectPlot(category, plot, i)"
                            >
                                <div
                                    :style="`color:${adaptColorToBackground(category.color)};margin: 0 auto; font-size:${cfgLabels.plotLabels.fontSize}px; text-align:center;background:${category.color}; padding: 2px 4px; border-radius: 12px; height: fit-content;`"
                                >
                                    {{ plot.name }}
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
                        :fill="cfgChart.backgroundColor"
                        style="opacity: 1"
                    />
                    <polygon
                        v-if="selectedSide === 'TR'"
                        :points="`${svg.left},${svg.top - 1} ${svg.centerX},${svg.top - 1} ${svg.centerX},${svg.centerY} ${svg.right + 1},${svg.centerY} ${svg.right + 1},${svg.bottom} ${svg.left},${svg.bottom} ${svg.left},${svg.top - 1}`"
                        :fill="cfgChart.backgroundColor"
                        style="opacity: 1"
                    />
                    <polygon
                        v-if="selectedSide === 'BR'"
                        :points="`${svg.left},${svg.top} ${svg.right + 1},${svg.top} ${svg.right + 1},${svg.centerY} ${svg.centerX},${svg.centerY} ${svg.centerX},${svg.bottom + 1} ${svg.left},${svg.bottom + 1} ${svg.left},${svg.top}`"
                        :fill="cfgChart.backgroundColor"
                        style="opacity: 1"
                    />
                    <polygon
                        v-if="selectedSide === 'BL'"
                        :points="`${svg.left - 1},${svg.top} ${svg.right},${svg.top} ${svg.right},${svg.bottom + 1} ${svg.centerX},${svg.bottom + 1} ${svg.centerX},${svg.centerY} ${svg.left - 1},${svg.centerY} ${svg.left - 1},${svg.top}`"
                        :fill="cfgChart.backgroundColor"
                        style="opacity: 1"
                    />
                </g>

                <g v-if="selectedSide && !isAnimating">
                    <text
                        :x="selectedSideLabelCoordinates.x"
                        :y="
                            selectedSideLabelCoordinates.y -
                            selectedSideLabelCoordinates.fontSize / 1.5
                        "
                        :font-size="selectedSideLabelCoordinates.fontSize / 1.5"
                        :fill="selectedSideLabelCoordinates.fill"
                        text-anchor="middle"
                        :font-weight="
                            selectedSideLabelCoordinates.bold
                                ? 'bold'
                                : 'normal'
                        "
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
                        :style="`cursor: ${isCursorPointer ? 'pointer' : 'default'}; opacity: ${selectedSide === 'TL' ? 1 : 0.2}`"
                        @click="selectQuadrantSide('TL')"
                        :class="{
                            'vue-ui-quadrant-mini-map-cell': true,
                            'vue-ui-quadrant-mini-map-cell-selectable':
                                selectedSide !== 'TL',
                        }"
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
                        :class="{
                            'vue-ui-quadrant-mini-map-cell': true,
                            'vue-ui-quadrant-mini-map-cell-selectable':
                                selectedSide !== 'TR',
                        }"
                    />
                    <rect
                        data-cy="minimap-br"
                        :x="miniMap[selectedSide].br.x"
                        :y="miniMap[selectedSide].br.y"
                        height="20"
                        width="20"
                        :fill="miniMap[selectedSide].br.fill"
                        :style="`cursor: ${isCursorPointer ? 'pointer' : 'default'}; opacity: ${selectedSide === 'BR' ? 1 : 0.2}`"
                        @click="selectQuadrantSide('BR')"
                        :class="{
                            'vue-ui-quadrant-mini-map-cell': true,
                            'vue-ui-quadrant-mini-map-cell-selectable':
                                selectedSide !== 'BR',
                        }"
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
                        :class="{
                            'vue-ui-quadrant-mini-map-cell': true,
                            'vue-ui-quadrant-mini-map-cell-selectable':
                                selectedSide !== 'BL',
                        }"
                    />
                    <path
                        class="vue-ui-quadrant-minimap-crosshairs"
                        :stroke="cfgChart.backgroundColor"
                        :stroke-width="1"
                        :d="miniMap[selectedSide].crosshairs.horizontal"
                    />
                    <path
                        class="vue-ui-quadrant-minimap-crosshairs"
                        :stroke="cfgChart.backgroundColor"
                        :stroke-width="1"
                        :d="miniMap[selectedSide].crosshairs.vertical"
                    />
                </g>
                <slot
                    name="svg"
                    :svg="{
                        ...svg,
                        isPrintingImg:
                            isPrinting || isImaging || isCallbackImaging,
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
            v-if="readyTeleport && (cfgChart.legend.show || $slots.legend)"
            :to="
                cfgChart.legend.position === 'top'
                    ? `#legend-top-${uid}`
                    : `#legend-bottom-${uid}`
            "
        >
            <div ref="chartLegend">
                <slot name="legend" v-bind:legend="legendSet">
                    <Legend
                        v-if="cfgChart.legend.show"
                        :key="`legend_${legendStep}`"
                        :legendSet="legendSet"
                        :config="legendConfig"
                        :isCursorPointer="isCursorPointer"
                        @clickMarker="({ legend }) => segregate(legend.id)"
                    >
                        <template #item="{ legend }">
                            <div
                                data-cy="legend-item"
                                @click="segregate(legend.id)"
                                :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`"
                                v-if="!loading"
                            >
                                {{ legend.name }}
                            </div>
                        </template>

                        <template #legendToggle>
                            <BaseLegendToggle
                                v-if="
                                    legendSet.length > 2 &&
                                    cfgChart.legend.selectAllToggle.show &&
                                    !loading
                                "
                                :backgroundColor="
                                    cfgChart.legend.selectAllToggle
                                        .backgroundColor
                                "
                                :color="cfgChart.legend.selectAllToggle.color"
                                :fontSize="cfgChart.legend.fontSize"
                                :checked="segregated.length > 0"
                                :isCursorPointer="isCursorPointer"
                                @toggle="toggleLegend"
                            />
                        </template>
                    </Legend>
                </slot>
            </div>
        </Teleport>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- TOOLTIP -->
        <Tooltip
            :teleportTo="cfgTooltip.teleportTo"
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="cfgTooltip.backgroundColor"
            :color="cfgTooltip.color"
            :borderRadius="cfgTooltip.borderRadius"
            :borderColor="cfgTooltip.borderColor"
            :borderWidth="cfgTooltip.borderWidth"
            :fontSize="cfgTooltip.fontSize"
            :backgroundOpacity="cfgTooltip.backgroundOpacity"
            :position="cfgTooltip.position"
            :offsetX="cfgTooltip.offsetX"
            :offsetY="cfgTooltip.offsetY"
            :parent="quadrantChart"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="
                cfgTooltip.customFormat &&
                typeof cfgTooltip.customFormat === 'function'
            "
            :smooth="cfgTooltip.smooth"
            :backdropFilter="cfgTooltip.backdropFilter"
            :smoothForce="cfgTooltip.smoothForce"
            :smoothSnapThreshold="cfgTooltip.smoothSnapThreshold"
            :isA11yMode="tooltipTriggerMode === 'keyboard'"
            :a11yPosition="tooltipA11yPosition"
        >
            <template #tooltip-before>
                <slot
                    name="tooltip-before"
                    v-bind="{ ...dataTooltipSlot }"
                ></slot>
            </template>
            <svg
                height="14"
                width="14"
                viewBox="0 0 20 20"
                v-if="cfgTooltip.showShape"
            >
                <Shape
                    :plot="{ x: 10, y: 10 }"
                    :shape="hoveredPlot.shape"
                    :color="hoveredPlot.color"
                    :radius="8"
                    :stroke="
                        cfgChart.layout.plots.outline
                            ? cfgChart.layout.plots.outlineColor
                            : 'none'
                    "
                    :stroke-width="cfgChart.layout.plots.outlineWidth"
                />
            </svg>
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
            v-if="isDataset && cfgUserOptions.buttons.table"
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
                    @click="generateCsv(cfgUserOptions.callbacks.csv)"
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
                        {{ th }}
                    </template>
                    <template #td="{ td }">
                        <div v-html="td.name || td" />
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
.vue-ui-quadrant * {
    transition: unset;
}
.vue-ui-quadrant {
    user-select: none;
    position: relative;
}

.vue-ui-quadrant .vue-ui-quadrant-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    text-align: center;
    width: 100%;
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

svg:focus {
    outline: none;
}

svg:focus-visible {
    outline: 2px solid currentColor;
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
