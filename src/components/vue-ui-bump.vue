<script setup>
import {
    computed,
    defineAsyncComponent,
    onBeforeUnmount,
    onMounted,
    ref,
    shallowRef,
    toRefs,
    watch,
    watchEffect,
} from "vue";
import {
    adaptColorToBackground,
    applyDataLabel,
    buildDisplayedTimeLabels,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createSmoothPath,
    createStraightPath,
    createTSpansFromLineBreaksOnX,
    createUid,
    dataLabel,
    downloadCsv,
    error,
    getMissingDatasetAttributes,
    isValidUserValue,
    objectIsEmpty,
    palette,
    themePalettes,
    treeShake,
    XMLNS,
} from "../lib";
import { throttle } from "../canvas-lib";
import { useConfig } from "../useConfig";
import { useLoading } from "../useLoading";
import { usePrinter } from "../usePrinter";
import { useNestedProp } from "../useNestedProp";
import { useResponsive } from "../useResponsive";
import { useThemeCheck } from "../useThemeCheck";
import { useTimeLabels } from "../useTimeLabels";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import { useTimeLabelCollision } from "../useTimeLabelCollider";
import themes from "../themes/vue_ui_bump.json";
import Title from "../atoms/Title.vue";
import BaseScanner from "../atoms/BaseScanner.vue";
import BaseDraggableDialog from "../atoms/BaseDraggableDialog.vue";
import { useSvgExport } from "../useSvgExport";

const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));

const { vue_ui_bump: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        }
    },
    dataset: {
        type: Array,
        default() {
            return [];
        }
    },
});

const isDataset = computed({
    get() {
        return !!props.dataset && props.dataset.length
    },
    set(bool) {
        return bool
    }
});

const bumpChart = ref(null);
const uid = ref(createUid());
const step = ref(0);
const chartTitle = ref(null);
const noTitle = ref(null);
const source = ref(null);
const isFullscreen = ref(false);
const isLoaded = ref(false);
const titleStep = ref(0);
const tableStep = ref(0);
const tableUnit = ref(null);
const userOptionsRef = ref(null);
const userHovers = ref(false);

const labelsLeft = ref(null);
const labelsRight = ref(null);
const timeLabelsEls = ref(null);

const selectedSeries = ref(null);

const FINAL_CONFIG = ref(prepareConfig());

const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    skeletonDataset: [
        { name: '————', values: [1, 1, 1, 2, 2, 2, 3, 3, 2, 2], color: '#4A4A4A'},
        { name: '————', values: [2, 2, 2, 1, 3, 3, 2, 2, 3, 3], color: '#6A6A6A'},
        { name: '————', values: [3, 3, 3, 3, 1, 1, 1, 1, 1, 1], color: '#8A8A8A'},
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            userOptions: { show: false, },
            style: {
                chart: {
                    backgroundColor: '#99999930',
                    layout: {
                        timeLabels: { show: false },
                        lines: {
                            coatingColor: '#4A4A4A'
                        },
                        plots: {
                            stroke: '#4A4A4A',
                            labels: {
                                show: false,
                                displayedValue: 'rank'
                            }
                        },
                        nameLabels: {
                            useSerieColor: true,
                        }
                    }
                }
            }
        }
    })
});

onMounted(prepareChart);

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
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
                defaultConfig: mergedConfig
            });

            finalConfig = {
                ...useNestedProp({
                    userConfig: props.config,
                    defaultConfig: fused
                }),
                customPalette: mergedConfig.customPalette.length ? mergedConfig.customPalette : themePalettes[theme] || palette
            }
        }
    } else {
        finalConfig = mergedConfig;
    }
    return finalConfig;
}

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

function onChartEnter() {
    userHovers.value = true;
    setUserOptionsVisibility(true);
}

function onChartLeave() {
    setUserOptionsVisibility(false);
    userHovers.value = false;
}

const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
});

watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
        showTable: FINAL_CONFIG.value.table.show,
    }
}, { immediate: true });

watch(() => props.config, (_newCg) => {
    if (!loading.value) {
        FINAL_CONFIG.value = prepareConfig();
    }
    userOptionsVisible.value = !FINAL_CONFIG.value.userOptions.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
    // Reset mutable config
    mutableConfig.value.showTable = FINAL_CONFIG.value.table.show;
    defaultSizes.value.width = FINAL_CONFIG.value.style.chart.width;
    defaultSizes.value.height = FINAL_CONFIG.value.style.chart.height;
    defaultSizes.value.paddingRatio = {
        top: FINAL_CONFIG.value.style.chart.padding.top / FINAL_CONFIG.value.style.chart.height,
        right: FINAL_CONFIG.value.style.chart.padding.right / FINAL_CONFIG.value.style.chart.width,
        bottom: FINAL_CONFIG.value.style.chart.padding.bottom / FINAL_CONFIG.value.style.chart.height,
        left: FINAL_CONFIG.value.style.chart.padding.left / FINAL_CONFIG.value.style.chart.width,
    }
});

watch(() => props.dataset, (_) => {
    if (Array.isArray(_) && _.length > 0) {
        manualLoading.value = false;
    }
}, { deep: true });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `bump_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-bump',
    options: FINAL_CONFIG.value.userOptions.print
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.userOptions.show && !FINAL_CONFIG.value.style.chart.title.text;
});

const defaultSizes = ref({
    width: FINAL_CONFIG.value.style.chart.width,
    height: FINAL_CONFIG.value.style.chart.height,
    paddingRatio: {
        top: FINAL_CONFIG.value.style.chart.padding.top / FINAL_CONFIG.value.style.chart.height,
        right: FINAL_CONFIG.value.style.chart.padding.right / FINAL_CONFIG.value.style.chart.width,
        bottom: FINAL_CONFIG.value.style.chart.padding.bottom / FINAL_CONFIG.value.style.chart.height,
        left: FINAL_CONFIG.value.style.chart.padding.left / FINAL_CONFIG.value.style.chart.width,
    }
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);
const to = ref(null)
const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiBump',
            type: 'dataset',
            debug: debug.value
        });
        manualLoading.value = true;
    } else {
        props.dataset.forEach((datasetObject, index) => {
            getMissingDatasetAttributes({
                datasetObject,
                requiredAttributes: ['name', 'values']
            }).forEach(attr => {
                isDataset.value = false;
                error({
                    componentName: 'VueUiBump',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index,
                    debug: debug.value
                });
                manualLoading.value = true;
            })
        })
    }

    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    setTimeout(() => {
        isLoaded.value = true;
    }, 10);

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            isLoaded.value = false;
            const { width, height } = useResponsive({
                chart: bumpChart.value,
                noTitle: noTitle.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: null,
                slicer: null,
                source: source.value
            });

            requestAnimationFrame(() => {
                defaultSizes.value.width = width;
                defaultSizes.value.height = height - 12;
                clearTimeout(to.value);
                to.value = setTimeout(() => {
                    isLoaded.value = true;
                },10)
            });
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = bumpChart.value.parentNode;
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

const unmutableDataset = computed(() => {
    return FINAL_DATASET.value.map((ds, i) => {
        const color = convertColorToHex(ds.color) || customPalette.value[i] || palette[i] || palette[i % palette.length];
        return {
            ...ds,
            absoluteIndex: i,
            id: createUid(),
            color
        }
    })
});

const maxLen = computed(() => Math.max(...unmutableDataset.value.map(d => d.values.length)));

function getPositionsForAllSeries(dataset) {
    const positions = dataset.map(() => Array(maxLen.value).fill(null));

    for (let valueIndex = 0; valueIndex < maxLen.value; valueIndex += 1) {
        const pairs = dataset
        .map((serie, seriesIndex) => ({
            seriesIndex,
            value: serie.values?.[valueIndex],
            previousPosition: valueIndex > 0 ? positions[seriesIndex][valueIndex - 1] : seriesIndex,
        }))
        .filter(pair => Number.isFinite(pair.value));

        pairs.sort((first, second) => {
            if (second.value !== first.value) return second.value - first.value;
            return first.previousPosition - second.previousPosition; // break tie by last rank
        });

        for (let sortedIndex = 0; sortedIndex < pairs.length; sortedIndex += 1) {
            const pair = pairs[sortedIndex];
            positions[pair.seriesIndex][valueIndex] = sortedIndex;
        }
    }

    return positions;
}

function getOffsetXLeft() {
    let base = 0;
    if (labelsLeft.value) {
        const texts = Array.from(labelsLeft.value.querySelectorAll('tspan'));
        base = texts.reduce((max, t) => {
            const w = t.getComputedTextLength()
            return w > max ? w : max;
        }, 0);
    }

    return base;
}

function getOffsetXRight() {
    let base = 0;
    if (labelsRight.value) {
        const texts = Array.from(labelsRight.value.querySelectorAll('tspan'));
        base = texts.reduce((max, t) => {
            const w = t.getComputedTextLength()
            return w > max ? w : max;
        }, 0);
    }

    return base;
}


const labelsXHeight = ref(0);

const updateHeight = throttle((h) => {
    labelsXHeight.value = h;
}, 100);

watchEffect((onInvalidate) => {
    const el = timeLabelsEls.value;
    if (!el) return

    const observer = new ResizeObserver(entries => {
        updateHeight(entries[0].contentRect.height)
    })
    observer.observe(el)
    onInvalidate(() => observer.disconnect())
});

onBeforeUnmount(() => {
    labelsXHeight.value = 0;
});

const offsetY = computed(() => {
    let tlH = 0;
    if (timeLabelsEls.value) {
        tlH = labelsXHeight.value;
    }
    return tlH;
});

const drawingArea = computed(() => {
    const { height: H, width: W } = defaultSizes.value;
    const { right: PR, left: PL } = defaultSizes.value.paddingRatio;

    let offsetXLeft = getOffsetXLeft();
    let offsetXRight = getOffsetXRight();

    const top = FINAL_CONFIG.value.style.chart.padding.top;
    const right = W - (W * PR) - offsetXRight;
    const left = (W * PL) + offsetXLeft;
    const width = W - (W * PR) - (W * PL) - offsetXLeft - offsetXRight;
    const height = H - top - FINAL_CONFIG.value.style.chart.padding.bottom - offsetY.value;
    const bottom = top + height;
    const chartHeight = top + height;

    const svgHeight = Math.max(0, H);
    const chartWidth = Math.max(0, W);

    return {
        chartHeight,
        chartWidth,
        top,
        right: Math.max(0, right),
        bottom: Math.max(0, bottom),
        left: Math.max(0, left),
        width: Math.max(0, width),
        height: Math.max(0, height),
        unitH: Math.max(0, height) / unmutableDataset.value.length,
        unitW: Math.max(0, width) / maxLen.value,
        svgHeight,
    };
});
;

const formattedDataset = computed(() => {
    if (!isDataset.value && !loading.value) return [];

    const allPositions = getPositionsForAllSeries(unmutableDataset.value);

    return unmutableDataset.value.map((ds, seriesIndex) => {
        return {
            ...ds,
            positions: allPositions[seriesIndex],
        };
    }).map(ds => {
        const coordinates = ds.positions.map((p, i) => {

            const displayValue = applyDataLabel(
                FINAL_CONFIG.value.style.chart.layout.plots.labels.formatter,
                ds.values[i],
                dataLabel({
                    p: FINAL_CONFIG.value.style.chart.layout.plots.labels.prefix,
                    v: ds.values[i],
                    s: FINAL_CONFIG.value.style.chart.layout.plots.labels.suffix,
                    r: FINAL_CONFIG.value.style.chart.layout.plots.labels.rounding
                })
            )

            return {
                name: ds.name,
                id: ds.id,
                x: drawingArea.value.left + (i * drawingArea.value.unitW) + (drawingArea.value.unitW / 2),
                y: drawingArea.value.top + (p * drawingArea.value.unitH) + (drawingArea.value.unitH / 2),
                value: ds.values[i],
                displayValue,
                rank: ds.positions[i] + 1,
                color: ds.color,
                labelColor: FINAL_CONFIG.value.style.chart.layout.plots.labels.color === 'auto' ? adaptColorToBackground(ds.color) : convertColorToHex(FINAL_CONFIG.value.style.chart.layout.plots.labels.color) ?? adaptColorToBackground(ds.color)
            }
        });

        const validCoordinates = coordinates.filter(c => isValidUserValue(c.value));

        const path = FINAL_CONFIG.value.style.chart.layout.lines.smooth ? createSmoothPath(validCoordinates) : createStraightPath(validCoordinates);

        return {
            ...ds,
            coordinates,
            path
        }
    })
});

function spreadLabelsVertically(labels, minGap, topLimit, bottomLimit) {
    const sorted = labels.toSorted((a, b) => a.y - b.y);

    // Push down to satisfy minGap
    for (let i = 1; i < sorted.length; i += 1) {
        const previous = sorted[i - 1];
        const current = sorted[i];
        if (current.y < previous.y + minGap) {
        current.y = previous.y + minGap;
        }
    }

    // Clamp to bottom, then push up if overflow
    const lastIndex = sorted.length - 1;
    if (lastIndex >= 0 && sorted[lastIndex].y > bottomLimit) {
        sorted[lastIndex].y = bottomLimit;
        for (let i = lastIndex - 1; i >= 0; i -= 1) {
        const next = sorted[i + 1];
        const current = sorted[i];
        if (current.y > next.y - minGap) {
            current.y = next.y - minGap;
        }
        }
    }

    // Clamp top after push-up
    if (sorted.length && sorted[0].y < topLimit) {
        const delta = topLimit - sorted[0].y;
        for (let i = 0; i < sorted.length; i += 1) {
            sorted[i].y += delta;
        }
    }

    return sorted;
}

const nameLabels = computed(() => {
    const left = [];
    const right = [];

    formattedDataset.value.forEach(ds => {
        const validCoords = ds.coordinates.filter(c => Number.isFinite(c.rank));
        if (!validCoords.length) return;

        left.push({ ...validCoords[0] });

        const last = validCoords[validCoords.length - 1];
        right.push({ ...last });
    });

    // Use actual y positions & spread to avoid overlaps
    const fontSize = FINAL_CONFIG.value.style.chart.layout.nameLabels.fontSize;
    const minGap = fontSize * 1.4;
    const topLimit = drawingArea.value.top + fontSize;
    const bottomLimit = drawingArea.value.bottom - fontSize;

    const rightSpread = spreadLabelsVertically(
        right,
        minGap,
        topLimit,
        bottomLimit
    );

    const leftSpread = spreadLabelsVertically(
        left,
        minGap,
        topLimit,
        bottomLimit
    );

    return {
        left: leftSpread,
        right: rightSpread,
    };
});

function getValueRect(label) {
    const padding = FINAL_CONFIG.value.style.chart.layout.plots.labels.fontSize * 0.4
    const text = label.displayValue;
    const textWidth = text.length * (FINAL_CONFIG.value.style.chart.layout.plots.labels.fontSize * (text.length === 1 ? 1 : 0.6))
    const textHeight = FINAL_CONFIG.value.style.chart.layout.plots.labels.fontSize
    const width = textWidth + padding * 2
    const height = textHeight + padding * 2
    const x = label.x - width / 2
    const y = label.y - height / 2
    const strokeWidth = FINAL_CONFIG.value.style.chart.layout.plots.strokeWidth;

    return {
        x: x - (strokeWidth / 2),
        y: y - (strokeWidth / 2),
        width: width + strokeWidth ,
        height: height + strokeWidth,
        fill: label.color,
        stroke: FINAL_CONFIG.value.style.chart.layout.plots.stroke,
        'stroke-width': strokeWidth,
        rx: height / 2
    }
}

const timeLabels = computed(() => {
    return useTimeLabels({
        values: FINAL_CONFIG.value.style.chart.layout.timeLabels.values,
        maxDatapoints: maxLen.value,
        formatter: FINAL_CONFIG.value.style.chart.layout.timeLabels.datetimeFormatter,
        start: 0,
        end: maxLen.value
    })
});

const modulo = computed(() => {
    const m = FINAL_CONFIG.value.style.chart.layout.timeLabels.modulo;
    if (!timeLabels.value.length) return m;
    return Math.min(m, [...new Set(timeLabels.value.map(t => t.text))].length);
});

const displayedTimeLabels = computed(() => {
    const cfg = FINAL_CONFIG.value.style.chart.layout.timeLabels;
    const vis = timeLabels.value || [];
    const all = timeLabels.value || [];
    const start = 0;
    const sel = null;
    const maxS = maxLen.value;
    const visTexts = vis.map(l => l?.text ?? '');
    const allTexts = all.map(l => l?.text ?? '');

    return buildDisplayedTimeLabels(
        !!cfg.showOnlyFirstAndLast,
        !!cfg.showOnlyAtModulo,
        Math.max(1, modulo.value || 1),
        visTexts,
        allTexts,
        start,
        sel,
        maxS
    );
});

const WIDTH = computed(() => defaultSizes.value.width);
const HEIGHT = computed(() => defaultSizes.value.height);

const slicer = computed(() => ({
    start: 0,
    end: maxLen.value
}));

useTimeLabelCollision({
    timeLabelsEls: timeLabelsEls,
    timeLabels,
    slicer,
    configRef: FINAL_CONFIG,
    rotationPath: ['style', 'chart', 'layout', 'timeLabels', 'rotation'],
    autoRotatePath: ['style', 'chart', 'layout', 'timeLabels', 'autoRotate', 'enable'],
    isAutoSize: false,
    width: WIDTH,
    height: HEIGHT,
    rotation: FINAL_CONFIG.value.style.chart.layout.timeLabels.autoRotate.angle
});

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

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

function getData() {
    return formattedDataset.value
}

function generateCsv(callback = null) {
    const title = [[FINAL_CONFIG.value.style.chart.title.text], [FINAL_CONFIG.value.style.chart.title.subtitle.text], [""]];
    const head = ['', ...displayedTimeLabels.value.map(tl => tl?.text ?? '')];
    const bodyValue = formattedDataset.value.map(ds => {
        return [
            ds.name,
            ...ds.coordinates.map(c => `${c.displayValue}`)
        ]
    });

    const bodyRank = formattedDataset.value.map(ds => {
        return [
            ds.name,
            ...ds.coordinates.map(c => `${c.rank}`)
        ];
    });

    const table = title
        .concat([[FINAL_CONFIG.value.table.columnNames.values]])
        .concat([head])
        .concat(bodyValue)
        .concat([[''], [FINAL_CONFIG.value.table.columnNames.ranking], [head]])
        .concat(bodyRank);

    const csvContent = createCsvContent(table);

    if (!callback) {
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-bump'});
    } else {
        callback(csvContent);
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
            fullscreenParent: bumpChart.value,
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

const dataTable = computed(() => {
    const head = [''].concat(displayedTimeLabels.value.map(t => t.text));

    const rows = formattedDataset.value.map((d, i) => {
        return [
            d.name,
            ...d.coordinates.map(c => `${c.displayValue} (${c.rank})`)
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

    const colNames = [FINAL_CONFIG.value.table.columnNames.series]

    return { head, body: rows, config, colNames };
});

const svgBg = computed(() => FINAL_CONFIG.value.style.chart.backgroundColor);
const svgTitle = computed(() => FINAL_CONFIG.value.style.chart.title);

const { exportSvg, getSvg } = useSvgExport({
    svg: svgRef,
    title: svgTitle,
    legend: null,
    legendItems: null,
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

async function getImage({ scale = 2} = {}) {
    if (!bumpChart.value) return;
    const { width, height } = bumpChart.value.getBoundingClientRect();
    const aspectRatio = width / height; 
    const { imageUri, base64 } = await img(({ domElement: bumpChart.value, base64: true, img: true, scale}))
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.style.chart.title.text,
        width,
        height,
        aspectRatio
    }
}

function onPointEnter(datapoint, serie) {
    selectedSeries.value = serie.id;
    if (FINAL_CONFIG.value.events.datapointEnter) {
        FINAL_CONFIG.value.events.datapointEnter({
            datapoint,
            seriesIndex: datapoint?.pointIndex ?? null,
        })
    }
}

function onPointLeave(datapoint, _serie) {
    selectedSeries.value = null;
    if (FINAL_CONFIG.value.events.datapointLeave) {
        FINAL_CONFIG.value.events.datapointLeave({
            datapoint,
            seriesIndex: datapoint?.pointIndex ?? null
        });
    }
}

function onPointClick(datapoint, _serie) {
    if (FINAL_CONFIG.value.events.datapointClick) {
        FINAL_CONFIG.value.events.datapointClick({
            datapoint,
            seriesIndex: datapoint?.pointIndex ?? null
        })
    }
}

defineExpose({
    getData,
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    generateSvg,
    toggleTable,
    toggleAnnotator,
    toggleFullscreen
});
</script>

<template>
    <div 
        :id="`bump_${uid}`"
        ref="bumpChart"
        :class="{'vue-data-ui-component': true, 'vue-ui-bump': true, 'vue-data-ui-wrapper-fullscreen' : isFullscreen }" 
        :style="`background:${FINAL_CONFIG.style.chart.backgroundColor};color:${FINAL_CONFIG.style.chart.color};font-family:${FINAL_CONFIG.style.fontFamily}; position: relative; ${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`"
        @mouseenter="onChartEnter" 
        @mouseleave="onChartLeave"
    >
        <PenAndPaper
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
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

        <slot name="userConfig"/>

        <div 
            ref="noTitle" 
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`" 
        />

        <!-- TITLE -->
        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'bump-title',
                        ...FINAL_CONFIG.style.chart.title,
                    },
                    subtitle: {
                        cy: 'bump-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <!-- USER OPTIONS -->
        <UserOptions
            ref="userOptionsRef"
            :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="false"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasSvg="FINAL_CONFIG.userOptions.buttons.svg"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasLabel="false"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullcreen="isFullscreen"
            :chartElement="bumpChart"
            :position="FINAL_CONFIG.userOptions.position"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
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
            :viewBox="`0 0 ${drawingArea.chartWidth <= 0 ? 10 : drawingArea.chartWidth} ${drawingArea.svgHeight <= 0 ? 10 : drawingArea.svgHeight}`"
            :class="{ 'vue-data-ui-loading' : loading, 'no-transition': !FINAL_CONFIG.useCssAnimation, 'with-transition': FINAL_CONFIG.useCssAnimation }"
            :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.chart.color}`"
            role="img" 
            aria-live="polite" 
            preserveAspectRatio="xMidYMid"
        >
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject 
                v-if="$slots['chart-background']"
                :x="drawingArea.left"
                :y="drawingArea.top"
                :width="drawingArea.width <= 0 ? 10 : drawingArea.width"
                :height="drawingArea.height <= 0 ? 10 : drawingArea.height"
                :style="{
                    pointerEvents: 'none'
                }"
            >
                <slot name="chart-background"/>
            </foreignObject>

            <!-- LINES -->
            <template v-for="serie in formattedDataset">
                <path 
                    class="transition-opacity"
                    :d="`M${serie.path}`" 
                    :stroke="FINAL_CONFIG.style.chart.layout.lines.coatingColor"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.lines.strokeWidth + 2"
                    stroke-linecap="round"
                    stroke-linejoin="round" 
                    fill="none" 
                    :style="{
                        opacity: selectedSeries == null ? 1 : selectedSeries === serie.id ? 1 : 0.1
                    }"
                    @mouseenter="selectedSeries = serie.id"
                    @mouseleave="selectedSeries = null"
                />
                <path 
                    class="transition-opacity"
                    :d="`M${serie.path}`" 
                    :stroke="serie.color"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.lines.strokeWidth"
                    stroke-linecap="round"
                    stroke-linejoin="round" 
                    fill="none"
                    :style="{
                        opacity: selectedSeries == null ? 1 : selectedSeries === serie.id ? 1 : 0.1
                    }"
                    @mouseenter="onPointEnter(serie, serie)"
                    @mouseleave="onPointLeave(serie, serie)"
                    @click="onPointClick(serie, serie)"
                />
            </template>

            <!-- PLOTS -->
            <template v-for="serie in formattedDataset">
                <!-- RANK LAYOUT -->
                <template v-if="FINAL_CONFIG.style.chart.layout.plots.labels.displayedValue === 'rank'">
                    <circle
                        class="transition-opacity"
                        v-for="(point, i) in serie.coordinates"
                        :cx="point.x"
                        :cy="point.y"
                        :r="FINAL_CONFIG.style.chart.layout.plots.radius"
                        :fill="serie.color"
                        :stroke="FINAL_CONFIG.style.chart.layout.plots.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.layout.plots.strokeWidth"
                        :style="{
                            opacity: selectedSeries == null ? 1 : selectedSeries === serie.id ? 1 : 0.1
                        }"
                        @mouseenter="onPointEnter({ ...point, pointIndex: i }, serie)"
                        @mouseleave="onPointLeave({ ...point, pointIndex: i }, serie)"
                        @click="onPointEnter({ ...point, pointIndex: i }, serie)"
                    />
                </template>
                <template v-if="FINAL_CONFIG.style.chart.layout.plots.labels.show && FINAL_CONFIG.style.chart.layout.plots.labels.displayedValue === 'rank'">
                    <text
                        class="transition-opacity"
                        v-for="label in serie.coordinates"
                        :x="label.x"
                        :y="label.y + FINAL_CONFIG.style.chart.layout.plots.labels.fontSize / 3"
                        :fill="label.labelColor"
                        :font-size="FINAL_CONFIG.style.chart.layout.plots.labels.fontSize"
                        text-anchor="middle"
                        :style="{
                            userSelect: 'none',
                            pointerEvents: 'none',
                            opacity: selectedSeries == null ? 1 : selectedSeries === serie.id ? 1 : 0.1
                        }" 
                    >
                        {{ label.rank }}
                    </text>
                </template>

                <!-- VALUE LAYOUT -->
                <template v-if="FINAL_CONFIG.style.chart.layout.plots.labels.displayedValue === 'value'">
                    <template v-for="label in serie.coordinates">
                        <rect
                            v-if="isValidUserValue(label.value)"
                            class="transition-opacity"
                            v-bind="getValueRect(label)"
                            :style="{
                                opacity: selectedSeries == null ? 1 : selectedSeries === serie.id ? 1 : 0.1
                            }"
                            @mouseenter="onPointEnter({ ...point, pointIndex: i }, serie)"
                            @mouseleave="onPointLeave({ ...point, pointIndex: i }, serie)"
                            @click="onPointEnter({ ...point, pointIndex: i }, serie)"
                        />
                        <text
                            v-if="isValidUserValue(label.value) && FINAL_CONFIG.style.chart.layout.plots.labels.show"
                            class="transition-opacity"
                            :x="label.x"
                            :y="label.y + FINAL_CONFIG.style.chart.layout.plots.labels.fontSize / 3"
                            :fill="label.labelColor"
                            :font-size="FINAL_CONFIG.style.chart.layout.plots.labels.fontSize"
                            text-anchor="middle"
                            :style="{
                                userSelect: 'none',
                                pointerEvents: 'none',
                                opacity: selectedSeries == null ? 1 : selectedSeries === serie.id ? 1 : 0.1
                            }"
                        >
                            {{ label.displayValue }}
                        </text>
                    </template>
                </template>
            </template>

            <!-- SERIES LABELS -->
            <template v-if="FINAL_CONFIG.style.chart.layout.nameLabels.leftLabels.show">
                <g ref="labelsLeft">
                    <text 
                        class="transition-opacity"
                        v-for="(series, i) in nameLabels.left.filter(el => isValidUserValue(el.value))"
                        :x="drawingArea.left"
                        :y="series.y + FINAL_CONFIG.style.chart.layout.nameLabels.fontSize / 3"
                        :fill="FINAL_CONFIG.style.chart.layout.nameLabels.useSerieColor ? series.color : FINAL_CONFIG.style.chart.layout.nameLabels.color"
                        :font-size="FINAL_CONFIG.style.chart.layout.nameLabels.fontSize"
                        :font--weight="FINAL_CONFIG.style.chart.layout.nameLabels.bold ? 'bold' : 'normal'"
                        text-anchor="end"
                        v-html="createTSpansFromLineBreaksOnX({
                            content: series.name,
                            fontSize: FINAL_CONFIG.style.chart.layout.nameLabels.fontSize,
                            fill: FINAL_CONFIG.style.chart.layout.nameLabels.useSerieColor ? series.color : FINAL_CONFIG.style.chart.layout.nameLabels.color,
                            x: drawingArea.left - FINAL_CONFIG.style.chart.layout.nameLabels.offsetX,
                            y: series.y + FINAL_CONFIG.style.chart.layout.nameLabels.fontSize / 3,
                            translateY: true
                        })"
                        :style="{
                            opacity: selectedSeries == null ? 1 : selectedSeries === series.id ? 1 : 0.1
                        }"
                        @mouseenter="onPointEnter(series, series)"
                        @mouseleave="onPointLeave(series, series)"
                        @click="onPointClick(series, series)"
                    />
                </g>
            </template>

            <template v-if="FINAL_CONFIG.style.chart.layout.nameLabels.rightLabels.show">
                <g ref="labelsRight">
                    <text 
                        class="transition-opacity"
                        v-for="(series, i) in nameLabels.right.filter(el => isValidUserValue(el.value))"
                        :x="drawingArea.right"
                        :y="series.y + FINAL_CONFIG.style.chart.layout.nameLabels.fontSize / 3"
                        :fill="FINAL_CONFIG.style.chart.layout.nameLabels.useSerieColor ? series.color : FINAL_CONFIG.style.chart.layout.nameLabels.color"
                        :font-size="FINAL_CONFIG.style.chart.layout.nameLabels.fontSize"
                        :font--weight="FINAL_CONFIG.style.chart.layout.nameLabels.bold ? 'bold' : 'normal'"
                        text-anchor="start"
                        v-html="createTSpansFromLineBreaksOnX({
                            content: series.name,
                            fontSize: FINAL_CONFIG.style.chart.layout.nameLabels.fontSize,
                            fill: FINAL_CONFIG.style.chart.layout.nameLabels.useSerieColor ? series.color : FINAL_CONFIG.style.chart.layout.nameLabels.color,
                            x: drawingArea.right + FINAL_CONFIG.style.chart.layout.nameLabels.offsetX,
                            y: series.y + FINAL_CONFIG.style.chart.layout.nameLabels.fontSize / 3,
                            translateY: true
                        })"
                        :style="{
                            opacity: selectedSeries == null ? 1 : selectedSeries === series.id ? 1 : 0.1
                        }"
                        @mouseenter="onPointEnter(series, series)"
                        @mouseleave="onPointLeave(series, series)"
                        @click="onPointClick(series, series)"
                    />
                </g>
            </template>

            <!-- TIME LABELS -->
            <template v-if="FINAL_CONFIG.style.chart.layout.timeLabels.show">
                <g ref="timeLabelsEls">
                    <g v-if="$slots['time-label']">
                        <g v-for="(timeLabel, i) in displayedTimeLabels">
                            <slot name="time-label" v-bind="{
                                x: drawingArea.unitW * i + drawingArea.unitW /2 + drawingArea.left,
                                y: drawingArea.chartHeight + FINAL_CONFIG.style.chart.layout.timeLabels.offsetY,
                                fontSize: FINAL_CONFIG.style.chart.layout.timeLabels.fontSize,
                                fill: FINAL_CONFIG.style.chart.layout.timeLabels.color,
                                transform: `translate(${drawingArea.unitW * i + drawingArea.unitW /2 + drawingArea.left}, ${drawingArea.chartHeight + FINAL_CONFIG.style.chart.layout.timeLabels.offsetY}), rotate(${FINAL_CONFIG.style.chart.layout.timeLabels.rotation})`,
                                absoluteIndex: timeLabel.absoluteIndex,
                                content: timeLabel.text,
                                textAnchor: FINAL_CONFIG.style.chart.layout.timeLabels.rotation > 0 ? 'start' : FINAL_CONFIG.style.chart.layout.timeLabels.rotation < 0 ? 'end' : 'middle',
                                show: true
                            }"/>
                        </g>
                    </g>

                    <g v-else>
                        <g v-for="(timeLabel, i) in displayedTimeLabels">
                            <text
                                v-if="!String(timeLabel.text).includes('\n')"
                                class="vue-data-ui-time-label"
                                :key="i"
                                data-cy="time-label"
                                :text-anchor="FINAL_CONFIG.style.chart.layout.timeLabels.rotation > 0
                                    ? 'start'
                                    : FINAL_CONFIG.style.chart.layout.timeLabels.rotation < 0
                                    ? 'end'
                                    : 'middle'"
                                :font-size="FINAL_CONFIG.style.chart.layout.timeLabels.fontSize"
                                :font-weight="FINAL_CONFIG.style.chart.layout.timeLabels.bold ? 'bold' : 'normal'"
                                :fill="FINAL_CONFIG.style.chart.layout.timeLabels.color"
                                :transform="`translate(${drawingArea.unitW * i + drawingArea.unitW /2 + drawingArea.left}, ${drawingArea.chartHeight + FINAL_CONFIG.style.chart.layout.timeLabels.offsetY}), rotate(${FINAL_CONFIG.style.chart.layout.timeLabels.rotation})`"
                                >
                                {{ timeLabel.text }}
                            </text>

                            <text
                                v-else
                                :key="i + '-multi'"
                                data-cy="time-label"
                                :text-anchor="FINAL_CONFIG.style.chart.layout.timeLabels.rotation > 0
                                    ? 'start'
                                    : FINAL_CONFIG.style.chart.layout.timeLabels.rotation < 0
                                    ? 'end'
                                    : 'middle'"
                                :font-size="FINAL_CONFIG.style.chart.layout.timeLabels.fontSize"
                                :fill="FINAL_CONFIG.style.chart.layout.timeLabels.color"
                                :transform="`
                                    translate(
                                    ${drawingArea.unitW * i + drawingArea.unitW /2 + drawingArea.left},
                                    ${drawingArea.chartHeight + FINAL_CONFIG.style.chart.layout.timeLabels.fontSize * 1.3 + FINAL_CONFIG.style.chart.layout.timeLabels.offsetY}
                                    ),
                                    rotate(${FINAL_CONFIG.style.chart.layout.timeLabels.rotation})
                                `"
                                v-html="createTSpansFromLineBreaksOnX({
                                    content: String(timeLabel.text),
                                    fontSize: FINAL_CONFIG.style.chart.layout.timeLabels.fontSize,
                                    fill: FINAL_CONFIG.style.chart.layout.timeLabels.color,
                                    x: 0,
                                    y: 0
                                })"
                            />
                        </g>
                    </g>
                </g>
            </template>

            <slot name="svg" :svg="{ 
                drawingArea,
                data: formattedDataset
            }"/>
        </svg>

        <!-- WATERMARK -->
        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <!-- DATA TABLE -->
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
                    <BaseIcon name="fileCsv" :stroke="tableComponent.props.color"/>
                </button>
            </template>
            <template #content>
                <DataTable 
                    :colNames="dataTable.colNames"
                    :head="dataTable.head"
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="FINAL_CONFIG.table.useDialog ? '' : tableComponent.title"
                    :withCloseButton="!FINAL_CONFIG.table.useDialog"
                    @close="closeTable"
                >
                    <template #th="{ th }">
                        <div v-html="th"/>
                    </template>
                    <template #td="{ td }">
                        {{ td }}
                    </template>
                </DataTable>
            </template>
        </component>

        <!-- SOURCE -->
        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <BaseScanner v-if="loading" />
    </div>
</template>

<style scoped lang="scss">
    @import "../vue-data-ui.css";

    .vue-ui-bump * {
        transition: unset;
    }

    .vue-ui-bump {
        user-select: none;
        width: 100%;
    }

    .transition-opacity {
        transition: opacity 0.2s ease-in-out;
    }

    .with-transition {
        path,
        line,
        rect,
        circle {
            animation: start-transition 0.5s ease-in;
            transform-origin: center;
        }
    
        @keyframes start-transition {
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

        text {
            animation: start-opacity 0.5 ease-in;
        }

        @keyframes start-opacity {
            from {
                opacity: 0;
            }
            to {
                opacity: 1;
            }
        }
    }


</style>