<script setup>
import { ref, computed, nextTick, onMounted, watch, onBeforeUnmount, useSlots, defineAsyncComponent, shallowRef } from "vue";
import {
    applyDataLabel,
    calcMarkerOffsetX,
    calcMarkerOffsetY,
    calcNutArrowPath,
    checkNaN,
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createPolarAreas,
    createUid,
    dataLabel,
    downloadCsv,
    easeOutCubic,
    error,
    getMissingDatasetAttributes,
    isFunction,
    makeDonut,
    objectIsEmpty,
    offsetFromCenterPoint,
    palette,
    setOpacity,
    shiftHue,
    themePalettes,
    XMLNS
} from '../lib';
import { throttle } from "../canvas-lib";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useResponsive } from "../useResponsive";
import { useConfig } from "../useConfig";
import { useUserOptionState } from "../useUserOptionState";
import { useChartAccessibility } from "../useChartAccessibility";
import themes from "../themes.json";
import Legend from "../atoms/Legend.vue"; // Must be ready in responsive mode
import Title from "../atoms/Title.vue"; // Must be ready in responsive mode
import Shape from "../atoms/Shape.vue";
import img from "../img";

const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));
const Skeleton = defineAsyncComponent(() => import('./vue-ui-skeleton.vue'));
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));

const { vue_ui_donut: DEFAULT_CONFIG } = useConfig();
const slots = useSlots();

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

const isDataset = computed({
    get() {
        return !!props.dataset && props.dataset.length
    },
    set(bool) {
        return bool
    }
})

const donutChart = shallowRef(null);
const chartTitle = shallowRef(null);
const chartLegend = shallowRef(null);
const resizeObserver = shallowRef(null);
const observedEl = shallowRef(null);
const source = shallowRef(null);
const noTitle = shallowRef(null);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);

onMounted(() => {
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

function prepareChart() {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiDonut',
            type: 'dataset'
        })
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['name', 'values']
            }).forEach(attr => {
                isDataset.value = false;
                error({
                    componentName: 'VueUiDonut',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i
                })
            })
        })
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: donutChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
                source: source.value,
                noTitle: noTitle.value,
                padding: padding.value
            });

            requestAnimationFrame(() => {
                svg.value.width = width;
                svg.value.height = height;
            })
        });

        if (resizeObserver.value) {
            if (observedEl.value) {
                resizeObserver.value.unobserve(observedEl.value);
            }
            resizeObserver.value.disconnect();
        }

        resizeObserver.value = new ResizeObserver(handleResize);
        observedEl.value = donutChart.value.parentNode;
        resizeObserver.value.observe(observedEl.value);
    }
}

const uid = ref(createUid());

const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const selectedSerie = ref(null);
const step = ref(0);

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_donut[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        return mergedConfig;
    }
}

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

const isFirstLoad = ref(true);
const animatedValues = shallowRef([]);

function animateWithGhost(finalValues, duration = 1000, stagger = 50) {
    return new Promise(resolve => {
        const N = finalValues.length;
        animatedValues.value = Array(N).fill(0);
        let completed = 0;

        finalValues.forEach((target, i) => {
            setTimeout(() => {
                const start = performance.now();
                function animate(now) {
                    const p = Math.min((now - start) / duration, 1);
                    const eased = easeOutCubic(p);
                    animatedValues.value[i] = target * eased;
                    animatedValues.value = [...animatedValues.value];
                    if (p < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        animatedValues.value[i] = target;
                        animatedValues.value = [...animatedValues.value];
                        completed += 1;
                        if (completed === N) resolve();
                    }
                }
                requestAnimationFrame(animate);
            }, i * stagger);
        });
    });
}

onMounted(async () => {
    const finalValues = props.dataset.map(ds => ds.values.reduce((a, b) => a + b, 0));
    if (FINAL_CONFIG.value.startAnimation.show) {
        await animateWithGhost(
            finalValues,
            FINAL_CONFIG.value.startAnimation.durationMs,
            FINAL_CONFIG.value.startAnimation.staggerMs
        );
    }
    isFirstLoad.value = false;
});

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });
const { svgRef } = useChartAccessibility({ config: FINAL_CONFIG.value.style.chart.title });

function showOptions() {
    setUserOptionsVisibility(true);
}

function hideOptions() {
    setUserOptionsVisibility(false);
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

    // Other ref resets
    svg.value.height = FINAL_CONFIG.value.style.chart.height;
    svg.value.width = FINAL_CONFIG.value.style.chart.width;
}, { deep: true });

const padding = computed(() => {
    const { top, right, bottom, left } = FINAL_CONFIG.value.style.chart.padding;
    return {
        css: `padding:${top}px ${right}px ${bottom}px ${left}px`,
        top,
        right,
        bottom,
        left
    }
})

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `donut__${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-donut',
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

const svg = ref({
    height: FINAL_CONFIG.value.style.chart.height,
    width: FINAL_CONFIG.value.style.chart.width
});

const donutThickness = computed(() => {
    const baseRatio = FINAL_CONFIG.value.style.chart.layout.donut.strokeWidth / 512;
    const resultSize = Math.min(svg.value.width, svg.value.height) * baseRatio;
    const adjusted = resultSize > minSize.value ? minSize.value : resultSize;
    return Math.max(adjusted, 3);
});

const emit = defineEmits(['selectLegend', 'selectDatapoint'])

const immutableSet = computed(() => {
    return props.dataset
        .map((serie, i) => {
            return {
                name: serie.name,
                color: convertColorToHex(serie.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
                value: checkNaN(serie.values.reduce((a, b) => a + b, 0)),
                absoluteValues: serie.values,
                comment: serie.comment || '',
                patternIndex: i,
                seriesIndex: i,
                ghost: false,
                pattern: `pattern_${uid.value}_${i}`
            }
        })
});

const mutableSet = shallowRef(immutableSet.value)

watch(() => immutableSet.value, (val) => mutableSet.value = val)

function getData() {
    return immutableSet.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color,
            value: ds.value
        }
    });
}

const segregated = ref([]);
const isAnimating = ref(false);

function animateValue({ from, to, duration, onUpdate, onDone, easing = easeOutCubic }) {
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

function segregate(index) {
    const target = immutableSet.value.find((_, idx) => idx === index);
    const source = mutableSet.value.find((_, idx) => idx === index);
    let initVal = source.value;

    if (segregated.value.includes(index)) {
        segregated.value = segregated.value.filter(s => s !== index);
        const targetVal = target.value;

        function setFinalUpState() {
            mutableSet.value = mutableSet.value.map((ds, i) =>
                index === i ? { ...ds, value: targetVal } : ds
            );
        }

        function doAnimUp() {
            isAnimating.value = true;
            animateValue({
                from: initVal,
                to: targetVal,
                duration: FINAL_CONFIG.value.serieToggleAnimation.durationMs,
                onUpdate: (val, t) => {
                    mutableSet.value = mutableSet.value.map((ds, i) =>
                        index === i ? { ...ds, value: val } : ds
                    );
                },
                onDone: () => {
                    setFinalUpState();
                    isAnimating.value = false;
                }
            });
        }

        if (FINAL_CONFIG.value.serieToggleAnimation.show && FINAL_CONFIG.value.type === 'classic') {
            doAnimUp();
        } else {
            setFinalUpState();
        }
    } else if (segregated.value.length < immutableSet.value.length - 1) {
        function setFinalDownState() {
            segregated.value.push(index);
            mutableSet.value = mutableSet.value.map((ds, i) =>
                index === i ? { ...ds, value: 0 } : ds
            );
        }

        function doAnimDown() {
            isAnimating.value = true;
            animateValue({
                from: initVal,
                to: 0,
                duration: FINAL_CONFIG.value.serieToggleAnimation.durationMs,
                onUpdate: (val, t) => {
                    mutableSet.value = mutableSet.value.map((ds, i) =>
                        index === i ? { ...ds, value: val } : ds
                    );
                },
                onDone: () => {
                    setFinalDownState();
                    isAnimating.value = false;
                }
            });
        }

        if (FINAL_CONFIG.value.serieToggleAnimation.show && FINAL_CONFIG.value.type === 'classic') {
            doAnimDown();
        } else {
            setFinalDownState();
        }
    }

    emit('selectLegend', donutSet.value.map(ds => ({
        name: ds.name,
        color: ds.color,
        value: ds.value
    })));
}


const _total = computed(() => props.dataset.reduce((sum, ds) => sum + ds.values.reduce((a, b) => a + b, 0), 0));

const donutSet = computed(() => {
    if (isFirstLoad.value) {
        const arcs = animatedValues.value.map((v, i) => ({
            ...immutableSet.value[i],
            value: v,
            color: immutableSet.value[i].color,
            ghost: false,
        }));
        const ghost = _total.value - animatedValues.value.reduce((a, b) => a + b, 0);
        if (ghost > 0) {
            arcs.push({
                name: '__ghost__',
                value: ghost,
                color: 'transparent',
                ghost: true,
            });
        }
        return arcs;
    } else {
        mutableSet.value.forEach((ds, i) => {
            if ([null, undefined].includes(ds.values)) {
                return {
                    ...ds,
                    values: []
                }
            }
        })
        return mutableSet.value
            .map((serie, i) => {
                return {
                    ...serie,
                    seriesIndex: i
                }
            })
            .filter((_, i) => !segregated.value.includes(i))
    }
});

const legendSet = computed(() => {
    return props.dataset
        .map((serie, i) => {
            return {
                name: serie.name,
                color: convertColorToHex(serie.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
                value: (serie.values || []).reduce((a, b) => a + b, 0),
                shape: 'circle',
                patternIndex: i
            }
        })
        .map((el, i) => {
            return {
                ...el,
                proportion: el.value / props.dataset.map(m => (m.values || []).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0),
                opacity: segregated.value.includes(i) ? 0.5 : 1,
                segregate: () => !isAnimating.value && segregate(i),
                isSegregated: segregated.value.includes(i)
            }
        })
});

const legendConfig = computed(() => {
    return {
        cy: 'donut-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
})

const minSize = computed(() => {
    const val = Math.min(svg.value.width / 3, svg.value.height / 3);
    return val < 55 ? 55 : val;
})

const currentDonut = computed(() => {
    const d = makeDonut({ series: donutSet.value }, svg.value.width / 2, svg.value.height / 2, minSize.value, minSize.value, 1.99999, 2, 1, 360, 105.25, donutThickness.value);
    return d
});

const hasData = computed(() => {
    return Math.abs(donutSet.value.map(d => d.value).reduce((a, b) => a + b, 0)) > 0;
})

const emptySkeleton = computed(() => {
    return makeDonut({
        series: [
            { 
                value: 1, 
                color: FINAL_CONFIG.value.style.chart.layout.donut.emptyFill, 
                name: '_', 
                seriesIndex: 0, 
                patternIndex: -1, 
                ghost: false, 
                absoluteValues: [1] 
            },
        ],
    }, svg.value.width / 2, svg.value.height / 2, minSize.value, minSize.value, 1.99999, 2, 1, 360, 105.25, donutThickness.value)
});

const noGhostDonut = computed(() => currentDonut.value.filter(el => !el.ghost))

const polarAreas = computed(() => {
    const max = Math.max(...donutSet.value.map(s => s.value));
    const series = donutSet.value.map(s => s.value / max);
    return createPolarAreas({
        series,
        center: {
            x: svg.value.width / 2,
            y: svg.value.height / 2,
        },
        maxRadius: Math.min(svg.value.width, svg.value.height) / 3,
        hasGhost: isFirstLoad.value
    })
})

function getPolarAnchor(middlePoint) {
    if (middlePoint.x > svg.value.width / 2 + 6) {
        return 'start'
    } else if (middlePoint.x < svg.value.width / 2 - 6) {
        return 'end'
    } else {
        return 'middle'
    }
}

function getPolarCommentY(polarArea) {
    if (polarArea.middlePoint.y > svg.value.height / 2) {
        return offsetFromCenterPoint({ initX: polarArea.middlePoint.x, initY: polarArea.middlePoint.y, offset: 100, centerX: svg.value.width / 2, centerY: svg.value.height / 2 }).y
    } else {
        return offsetFromCenterPoint({ initX: polarArea.middlePoint.x, initY: polarArea.middlePoint.y, offset: 0, centerX: svg.value.width / 2, centerY: svg.value.height / 2 }).y - 100
    }
}

function isArcBigEnough(arc) {
    return arc.proportion * 100 > FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.hideUnderValue;
}

function displayArcPercentage(arc, stepBreakdown) {
    const p = arc.value / sumValues(stepBreakdown);
    return isNaN(p) ? 0 : applyDataLabel(
        FINAL_CONFIG.value.style.chart.layout.labels.percentage.formatter,
        p * 100,
        dataLabel({
            v: p * 100,
            s: '%',
            r: FINAL_CONFIG.value.style.chart.layout.labels.percentage.rounding
        }),
        { datapoint: arc }
    )
}

function sumValues(source) {
    return [...source].map(s => s.value).reduce((a, b) => a + b, 0);
}

const total = computed(() => {
    return donutSet.value.map(s => s.value).reduce((a, b) => a + b, 0);
});

const average = computed(() => {
    return total.value / donutSet.value.length;
});

const legendPercentage = computed(() => {
    return legend => isAnimating.value ? legend.proportion * 100 : legend.value / total.value * 100
})

const dataTooltipSlot = ref(null);

const useCustomFormat = ref(false);

function useTooltip({ datapoint, relativeIndex, seriesIndex, show = false }) {
    dataTooltipSlot.value = { datapoint, seriesIndex, config: FINAL_CONFIG.value, series: immutableSet.value };
    isTooltip.value = show;
    selectedSerie.value = relativeIndex;
    let html = "";

    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

    useCustomFormat.value = false;

    if (isFunction(customFormat)) {
        try {
            const customFormatString = customFormat({
                seriesIndex,
                datapoint,
                series: immutableSet.value,
                config: FINAL_CONFIG.value
            });
            if (typeof customFormatString === 'string') {
                tooltipContent.value = customFormatString;
                useCustomFormat.value = true;
            }
        } catch (err) {
            console.warn('Custom format cannot be applied.');
            useCustomFormat.value = false;
        }
    }

    if (!useCustomFormat.value) {
        html += `<div data-cy="donut-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor};padding-bottom:6px;margin-bottom:3px;">${datapoint.name}</div>`;
        html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 60 60" height="14" width="14"><circle data-cy="donut-tooltip-marker" cx="30" cy="30" r="30" stroke="none" fill="${datapoint.color}"/>${slots.pattern ? `<circle data-cy="donut-tooltip-marker" cx="30" cy="30" r="30" stroke="none" fill="url(#pattern_${uid.value}_${seriesIndex})"/>` : ''}</svg>`;

        if (FINAL_CONFIG.value.style.chart.tooltip.showValue) {
            html += `<b data-cy="donut-tooltip-value">${applyDataLabel(
                FINAL_CONFIG.value.style.chart.layout.labels.value.formatter,
                datapoint.value,
                dataLabel({
                    p: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix,
                    v: datapoint.value,
                    s: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix,
                    r: FINAL_CONFIG.value.style.chart.tooltip.roundingValue
                }),
                {
                    datapoint,
                    relativeIndex,
                    seriesIndex,
                }
            )}</b>`;
        }

        if (FINAL_CONFIG.value.style.chart.tooltip.showPercentage) {
            const percentageLabel = applyDataLabel(
                FINAL_CONFIG.value.style.chart.layout.labels.percentage.formatter,
                datapoint.proportion * 100,
                dataLabel({
                    v: datapoint.proportion * 100,
                    s: '%',
                    r: FINAL_CONFIG.value.style.chart.tooltip.roundingPercentage
                }),
                {
                    datapoint,
                    relativeIndex,
                    seriesIndex,
                }
            );

            if (!FINAL_CONFIG.value.style.chart.tooltip.showValue) {
                html += `<b>${percentageLabel}</b></div>`;
            } else {
                html += `<span>(${percentageLabel})</span></div>`;
            }
        }

        if (FINAL_CONFIG.value.style.chart.comments.showInTooltip && datapoint.comment) {
            html += `<div class="vue-data-ui-tooltip-comment" style="background:${datapoint.color}20; padding: 6px; margin-bottom: 6px; margin-top:6px; border-left: 1px solid ${datapoint.color}">${datapoint.comment}</div>`
        }
        tooltipContent.value = `<div>${html}</div>`;
    }
}

function getBlurFilter(index) {
    if (FINAL_CONFIG.value.useBlurOnHover && ![null, undefined].includes(selectedSerie.value) && selectedSerie.value !== index) {
        return `url(#blur_${uid.value})`;
    } else {
        return '';
    }
}

const table = computed(() => {
    const head = donutSet.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color
        }
    });
    const body = donutSet.value.map(ds => ds.value);
    return { head, body };
});

function generateCsv(callback=null) {
    nextTick(() => {
        const labels = table.value.head.map((h, i) => {
            return [[
                h.name
            ], [table.value.body[i]], [isNaN(table.value.body[i] / total.value) ? '-' : table.value.body[i] / total.value * 100]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text], [FINAL_CONFIG.value.style.chart.title.subtitle.text], [[""], ["val"], ["%"]]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        if (!callback) {
            downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-donut" })
        } else {
            callback(csvContent);
        }
    });
}

const dataTable = computed(() => {
    const head = [
        ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`, dataLabel({ p: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix, v: total.value, s: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix, r: FINAL_CONFIG.value.table.td.roundingValue }),
        '100%'
    ];

    const body = table.value.head.map((h, i) => {
        return [
            {
                color: h.color,
                name: h.name
            },
            table.value.body[i],
            isNaN(table.value.body[i] / total.value) ? "-" : (table.value.body[i] / total.value * 100).toFixed(FINAL_CONFIG.value.table.td.roundingPercentage) + '%'
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

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const isSafari = computed(() => {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
})

function dashLabel(num) {
    return num.toFixed(FINAL_CONFIG.value.style.chart.legend.roundingPercentage).split('').map(_ => '-').join('');
}

function selectDatapoint(datapoint, index) {
    emit('selectDatapoint', { datapoint, index });
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
    if (!donutChart.value) return
    const { imageUri, base64 } = await img(({ domElement: donutChart.value, base64: true, img: true, scale}))
    return { imageUri, base64 }
}

defineExpose({
    getData,
    getImage,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleLabels,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen,
});

</script>

<template>
    <div ref="donutChart"
        :class="`vue-ui-donut ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; ${FINAL_CONFIG.responsive ? 'height:100%;' : ''} text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`"
        :id="`donut__${uid}`" @mouseenter="showOptions"
        @mouseleave="hideOptions">
        <PenAndPaper v-if="FINAL_CONFIG.userOptions.buttons.annotator && svgRef" :color="FINAL_CONFIG.style.chart.color"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" :active="isAnnotator" :svgRef="svgRef"
            @close="toggleAnnotator" />
        <slot name="userConfig"></slot>

        <div ref="noTitle" v-if="hasOptionsNoTitle" class="vue-data-ui-no-title-space"
            :style="`height:36px; width: 100%;background:transparent`" />

        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text"
            :style="`width:100%;background:transparent;padding-bottom:24px`">
            <!-- TITLE AS DIV -->
            <Title :key="`title_${titleStep}`" :config="{
                title: {
                    cy: 'donut-div-title',
                    ...FINAL_CONFIG.style.chart.title,
                },
                subtitle: {
                    cy: 'donut-div-subtitle',
                    ...FINAL_CONFIG.style.chart.title.subtitle
                }
            }" />
        </div>

        <!-- OPTIONS -->
        <UserOptions ref="details" :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor" :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting" :isImaging="isImaging" :uid="uid"
            :hasTooltip="FINAL_CONFIG.style.chart.tooltip.show && FINAL_CONFIG.userOptions.buttons.tooltip"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf" :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv" :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasLabel="FINAL_CONFIG.userOptions.buttons.labels"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen" :isFullscreen="isFullscreen"
            :chartElement="donutChart" :position="FINAL_CONFIG.userOptions.position" :callbacks="FINAL_CONFIG.userOptions.callbacks"
            :isTooltip="mutableConfig.showTooltip" :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator" :isAnnotation="isAnnotator"
            :printScale="FINAL_CONFIG.userOptions.print.scale"
            @toggleFullscreen="toggleFullscreen" @generatePdf="generatePdf" @generateCsv="generateCsv"
            @generateImage="generateImage" @toggleTable="toggleTable" @toggleLabels="toggleLabels"
            @toggleTooltip="toggleTooltip" @toggleAnnotator="toggleAnnotator" :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
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
            <template v-if="$slots.optionFullscreen" #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }" />
            </template>
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <svg ref="svgRef" :xmlns="XMLNS" v-if="isDataset"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }"
            data-cy="donut-svg" :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`"
            :style="`max-width:100%; overflow: visible; background:transparent;color:${FINAL_CONFIG.style.chart.color};${padding.css}`">
            <PackageVersion />

            <!-- BACKGROUND SLOT -->
            <foreignObject v-if="$slots['chart-background']" :x="0" :y="0" :width="svg.width <= 0 ? 10 : svg.width"
                :height="svg.height <= 0 ? 10 : svg.height" :style="{
                    pointerEvents: 'none'
                }">
                <slot name="chart-background" />
            </foreignObject>

            <!-- DEFS -->
            <defs v-if="FINAL_CONFIG.type === 'classic' && !isNaN(donutThickness / minSize)">
                <radialGradient :id="`gradient_${uid}`" v-if="FINAL_CONFIG.style.chart.useGradient">
                    <stop offset="0%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.backgroundColor, 0)"
                        stop-opacity="0" />
                    <stop :offset="`${(1 - (donutThickness / minSize)) * 100}%`" :stop-color="setOpacity('#FFFFFF', 0)"
                        stop-opacity="0" />
                    <stop :offset="`${(1 - (donutThickness / minSize / 2)) * 100}%`"
                        :stop-color="setOpacity('#FFFFFF', FINAL_CONFIG.style.chart.gradientIntensity)" />
                    <stop offset="100%" :stop-color="setOpacity(FINAL_CONFIG.style.chart.backgroundColor, 0)"
                        stop-opacity="0" />
                </radialGradient>
            </defs>

            <defs v-if="FINAL_CONFIG.type === 'polar'">
                <radialGradient v-for="(area, i) in polarAreas" :id="`polar_gradient_${i}_${uid}`"
                    :cx="(isNaN(area.middlePoint.x / svg.width * 100) ? 0  : area.middlePoint.x / svg.width * 100) + '%'"
                    :cy="(isNaN(area.middlePoint.y / svg.height * 100) ? 0 : area.middlePoint.y / svg.height * 100) + '%'" r="62%">
                    <stop offset="0%" :stop-color="shiftHue(currentDonut[i].color, 0.05)"
                        :stop-opacity="FINAL_CONFIG.style.chart.gradientIntensity / 100" />
                    <stop offset="100%" :stop-color="currentDonut[i].color" />
                </radialGradient>
            </defs>

            <!-- LABEL CONNECTOR -->
            <defs>
                <filter :id="`blur_${uid}`" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" :stdDeviation="2" :id="`blur_std_${uid}`" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>

                <filter :id="`shadow_${uid}`" color-interpolation-filters="sRGB">
                    <feDropShadow dx="0" dy="0" stdDeviation="10" flood-opacity="0.5"
                        :flood-color="FINAL_CONFIG.style.chart.layout.donut.shadowColor" />
                </filter>
                <filter :id="`drop_shadow_${uid}`" color-interpolation-filters="sRGB" x="-50%" y="-50%" width="200%"
                    height="200%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" flood-opacity="1"
                        :flood-color="FINAL_CONFIG.style.chart.layout.donut.shadowColor" />
                </filter>
            </defs>

            <template v-if="FINAL_CONFIG.type === 'classic'">
                <g v-for="(arc, i) in currentDonut.filter(el => !el.ghost)">
                    <path data-cy="donut-arc" v-if="isArcBigEnough(arc) && mutableConfig.dataLabels.show"
                        :d="calcNutArrowPath(arc, { x: svg.width / 2, y: svg.height / 2 }, 16, 16, false, false, donutThickness, 12, FINAL_CONFIG.style.chart.layout.curvedMarkers)"
                        :stroke="arc.color" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" fill="none"
                        :filter="getBlurFilter(i)" />
                </g>
            </template>
            <template v-if="FINAL_CONFIG.type === 'polar'">
                <g v-for="(arc, i) in currentDonut.filter(el => !el.ghost)">
                    <path 
                        data-cy="polar-datapoint" 
                        v-if="isArcBigEnough(arc) && mutableConfig.dataLabels.show"
                        :d="`M ${offsetFromCenterPoint({ initX: polarAreas[i].middlePoint.x, initY: polarAreas[i].middlePoint.y, offset: 24, centerX: svg.width / 2, centerY: svg.height / 2 }).x},${offsetFromCenterPoint({ initX: polarAreas[i].middlePoint.x, initY: polarAreas[i].middlePoint.y, offset: 24, centerX: svg.width / 2, centerY: svg.height / 2 }).y} ${polarAreas[i].middlePoint.x},${polarAreas[i].middlePoint.y}`" 
                        :stroke="arc.color"
                        stroke-width="1" 
                        stroke-linecap="round" 
                        stroke-linejoin="round" 
                        fill="none"
                        :filter="getBlurFilter(i)"
                        :style="{
                            transition: isFirstLoad || !FINAL_CONFIG.serieToggleAnimation.show ? 'none' : `all ${FINAL_CONFIG.serieToggleAnimation.durationMs}ms ease-in-out`,
                        }"
                    />
                </g>
            </template>

            <circle data-cy="donut-shadow"
                v-if="FINAL_CONFIG.type === 'classic' && FINAL_CONFIG.style.chart.layout.donut.useShadow"
                :cx="svg.width / 2" :cy="svg.height / 2" :r="minSize <= 0 ? 10 : minSize"
                :fill="FINAL_CONFIG.style.chart.backgroundColor" :filter="`url(#shadow_${uid})`" />

            <g v-if="$slots.pattern">
                <defs v-for="(arc, i) in dataset" :key="`pattern-${arc.patternIndex}`">
                    <slot name="pattern" v-bind="{ seriesIndex: i, patternId: `pattern_${uid}_${i}`}" />
                </defs>
            </g>
            
            <template v-if="total && FINAL_CONFIG.type === 'classic'">
                <path v-for="(arc, i) in noGhostDonut" :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                    :d="arc.arcSlice" fill="#FFFFFF" />

                    <path 
                        v-for="(arc, i) in noGhostDonut" 
                        class="vue-ui-donut-arc-path" 
                        :data-cy="`donut-arc-${i}`"
                        :d="arc.arcSlice" 
                        :fill="arc.color"
                        :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.chart.layout.donut.borderWidth" 
                        :filter="getBlurFilter(i)" 
                    />

                <g v-if="$slots.pattern">
                    <path v-for="(arc, i) in noGhostDonut" class="vue-ui-donut-arc-path"
                        :data-cy="`donut-arc-pattern-${arc.patternIndex}`" :d="arc.arcSlice"
                        :fill="`url(#${arc.pattern})`"
                        :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.chart.layout.donut.borderWidth" :filter="getBlurFilter(i)" />
                </g>
            </template>

            <template v-if="total && FINAL_CONFIG.type === 'polar'">
                <g v-if="currentDonut.length > 1">
                    <path v-for="(arc, i) in noGhostDonut" :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                        :d="polarAreas[i].path" fill="#FFFFFF" 
                        :style="{
                            transition: isFirstLoad || !FINAL_CONFIG.serieToggleAnimation.show ? 'none' : `all ${FINAL_CONFIG.serieToggleAnimation.durationMs}ms ease-in-out`
                        }"
                    />
                    <g v-if="FINAL_CONFIG.style.chart.layout.donut.useShadow">
                        <path data-cy="polar-shadow" v-for="(_arc, i) in noGhostDonut" class="vue-ui-donut-arc-path"
                            :d="polarAreas[i].path" :fill="'transparent'"
                            :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                            :stroke-width="FINAL_CONFIG.style.chart.layout.donut.borderWidth"
                            :filter="`url(#drop_shadow_${uid})`" 
                            :style="{
                                transition: isFirstLoad || !FINAL_CONFIG.serieToggleAnimation.show ? 'none' : `all ${FINAL_CONFIG.serieToggleAnimation.durationMs}ms ease-in-out`
                            }"
                        />
                    </g>

                    <g v-if="$slots.pattern">
                        <path v-for="(arc, i) in noGhostDonut" class="vue-ui-donut-arc-path"
                            :data-cy="`polar-arc-${arc.patternIndex}`" :d="polarAreas[i].path"
                            :fill="`url(#${arc.pattern})`"
                            :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                            :stroke-width="FINAL_CONFIG.style.chart.layout.donut.borderWidth"
                            :filter="getBlurFilter(i)"
                            :style="{
                                transition: isFirstLoad || !FINAL_CONFIG.serieToggleAnimation.show ? 'none' : `all ${FINAL_CONFIG.serieToggleAnimation.durationMs}ms ease-in-out`
                            }"
                        />
                    </g>
                    <path v-for="(arc, i) in noGhostDonut" class="vue-ui-donut-arc-path" :data-cy="`donut-arc-${i}`"
                        :d="polarAreas[i].path"
                        :fill="FINAL_CONFIG.style.chart.useGradient ? `url(#polar_gradient_${i}_${uid})` : arc.color"
                        :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.chart.layout.donut.borderWidth" :filter="getBlurFilter(i)"
                        :style="{
                            transition: isFirstLoad || !FINAL_CONFIG.serieToggleAnimation.show ? 'none' : `all ${FINAL_CONFIG.serieToggleAnimation.durationMs}ms ease-in-out`
                        }"
                    />
                </g>
                <g v-else>
                    <circle v-if="$slots.pattern" :cx="svg.width / 2" :cy="svg.height / 2" :r="minSize"
                        :fill="`url(#pattern_${uid}_${currentDonut[0].patternIndex})`"
                        :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.chart.layout.donut.borderWidth" />
                    <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="minSize"
                        :fill="FINAL_CONFIG.style.chart.useGradient ? `url(#polar_gradient_${0}_${uid})` : currentDonut[0].color"
                        :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.chart.layout.donut.borderWidth" />
                </g>
            </template>

            <template v-else>
                <!-- EMPTY SKELETON -->
                <g v-if="FINAL_CONFIG.type === 'classic' && !hasData">
                    <path 
                        v-for="(arc, i) in emptySkeleton" 
                        class="vue-ui-donut-arc-path" 
                        :data-cy="`empty-skeleton-${i}`"
                        :d="arc.arcSlice" 
                        :fill="arc.color"
                        :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.chart.layout.donut.borderWidth" 
                    />
                </g>
                <circle :cx="svg.width / 2" :cy="svg.height / 2" :r="minSize <= 0 ? 10 : minSize" fill="transparent"
                    :stroke="FINAL_CONFIG.style.chart.backgroundColor" />
            </template>

            <!-- HOLLOW -->
            <circle data-cy="donut-gradient-hollow"
                v-if="FINAL_CONFIG.style.chart.useGradient && FINAL_CONFIG.type === 'classic'" :cx="svg.width / 2"
                :cy="svg.height / 2" :r="/* This might require adjustments */minSize <= 0 ? 10 : minSize"
                :fill="`url(#gradient_${uid})`"
            />

            <!-- TOOLTIP TRAPS -->
            <template v-if="total">
                <g v-if="currentDonut.length > 1 || FINAL_CONFIG.type === 'classic'">
                    <path data-cy="tooltip-trap" v-for="(arc, i) in currentDonut.filter(el => !el.ghost)"
                        :d="FINAL_CONFIG.type === 'classic' ? arc.arcSlice : polarAreas[i].path"
                        :fill="selectedSerie === i ? 'rgba(0,0,0,0.1)' : 'transparent'" @mouseenter="useTooltip({
                            datapoint: arc,
                            relativeIndex: i,
                            seriesIndex: arc.seriesIndex,
                            show: true
                        })" @mouseleave="isTooltip = false; selectedSerie = null" @click="selectDatapoint(arc, i)" />
                </g>
                <g v-else>
                    <circle data-cy="tooltip-trap" :cx="svg.width / 2" :cy="svg.height / 2" :r="minSize"
                        :fill="'transparent'" @mouseenter="useTooltip({
                            datapoint: currentDonut[0],
                            relativeIndex: 0,
                            seriesIndex: currentDonut[0].seriesIndex,
                            show: true
                        })" @mouseleave="isTooltip = false; selectedSerie = null"
                        @click="selectDatapoint(currentDonut[0], i)" />
                </g>
            </template>

            <!-- HOLLOW LABELS (Classic donut only )-->
            <template v-if="FINAL_CONFIG.type === 'classic'">
                <text data-cy="hollow-total-name" v-if="FINAL_CONFIG.style.chart.layout.labels.hollow.total.show"
                    text-anchor="middle" :x="svg.width / 2"
                    :y="svg.height / 2 - (FINAL_CONFIG.style.chart.layout.labels.hollow.average.show ? FINAL_CONFIG.style.chart.layout.labels.hollow.total.fontSize : 0) + FINAL_CONFIG.style.chart.layout.labels.hollow.total.offsetY"
                    :fill="FINAL_CONFIG.style.chart.layout.labels.hollow.total.color"
                    :font-size="FINAL_CONFIG.style.chart.layout.labels.hollow.total.fontSize"
                    :style="`font-weight:${FINAL_CONFIG.style.chart.layout.labels.hollow.total.bold ? 'bold' : ''}`">
                    {{ FINAL_CONFIG.style.chart.layout.labels.hollow.total.text }}
                </text>
                <text data-cy="hollow-total-value" v-if="FINAL_CONFIG.style.chart.layout.labels.hollow.total.show"
                    text-anchor="middle" :x="svg.width / 2"
                    :y="svg.height / 2 + FINAL_CONFIG.style.chart.layout.labels.hollow.total.fontSize - (FINAL_CONFIG.style.chart.layout.labels.hollow.average.show ? FINAL_CONFIG.style.chart.layout.labels.hollow.total.fontSize : 0) + FINAL_CONFIG.style.chart.layout.labels.hollow.total.value.offsetY"
                    :fill="FINAL_CONFIG.style.chart.layout.labels.hollow.total.value.color"
                    :font-size="FINAL_CONFIG.style.chart.layout.labels.hollow.total.value.fontSize"
                    :style="`font-weight:${FINAL_CONFIG.style.chart.layout.labels.hollow.total.value.bold ? 'bold' : ''}`">
                    {{ applyDataLabel(
                        FINAL_CONFIG.style.chart.layout.labels.hollow.total.value.formatter,
                        total,
                        dataLabel({
                            p: FINAL_CONFIG.style.chart.layout.labels.hollow.total.value.prefix,
                            v: total,
                            s: FINAL_CONFIG.style.chart.layout.labels.hollow.total.value.suffix
                        }))
                    }}
                </text>

                <text data-cy="hollow-average-name" v-if="FINAL_CONFIG.style.chart.layout.labels.hollow.average.show"
                    text-anchor="middle" :x="svg.width / 2"
                    :y="svg.height / 2 + (FINAL_CONFIG.style.chart.layout.labels.hollow.total.show ? FINAL_CONFIG.style.chart.layout.labels.hollow.average.fontSize : 0) + FINAL_CONFIG.style.chart.layout.labels.hollow.average.offsetY"
                    :fill="FINAL_CONFIG.style.chart.layout.labels.hollow.average.color"
                    :font-size="FINAL_CONFIG.style.chart.layout.labels.hollow.average.fontSize"
                    :style="`font-weight:${FINAL_CONFIG.style.chart.layout.labels.hollow.average.bold ? 'bold' : ''}`">
                    {{ FINAL_CONFIG.style.chart.layout.labels.hollow.average.text }}
                </text>
                <text data-cy="hollow-average-value" v-if="FINAL_CONFIG.style.chart.layout.labels.hollow.average.show"
                    text-anchor="middle" :x="svg.width / 2"
                    :y="svg.height / 2 + (FINAL_CONFIG.style.chart.layout.labels.hollow.total.show ? FINAL_CONFIG.style.chart.layout.labels.hollow.average.fontSize : 0) + FINAL_CONFIG.style.chart.layout.labels.hollow.average.fontSize + FINAL_CONFIG.style.chart.layout.labels.hollow.average.value.offsetY"
                    :fill="FINAL_CONFIG.style.chart.layout.labels.hollow.average.value.color"
                    :font-size="FINAL_CONFIG.style.chart.layout.labels.hollow.average.value.fontSize"
                    :style="`font-weight:${FINAL_CONFIG.style.chart.layout.labels.hollow.average.value.bold ? 'bold' : ''}`">
                    {{ isAnimating || isFirstLoad ? '--' : applyDataLabel(
                        FINAL_CONFIG.style.chart.layout.labels.hollow.average.value.formatter,
                        average,
                        dataLabel({
                            p: FINAL_CONFIG.style.chart.layout.labels.hollow.average.value.prefix,
                            v: average,
                            s: FINAL_CONFIG.style.chart.layout.labels.hollow.average.value.suffix,
                            r: FINAL_CONFIG.style.chart.layout.labels.hollow.average.value.rounding
                        }))
                    }}
                </text>
            </template>

            <!-- DATALABELS -->
            <g v-for="(arc, i) in noGhostDonut.filter(el => !el.ghost)" :filter="getBlurFilter(i)"
                :class="{ 'animated': FINAL_CONFIG.useCssAnimation }">
                <g v-if="FINAL_CONFIG.style.chart.layout.labels.dataLabels.useLabelSlots">
                    <foreignObject
                        :x="calcMarkerOffsetX(arc, true).anchor === 'end' ? calcMarkerOffsetX(arc).x - 120 : calcMarkerOffsetX(arc, true).anchor === 'middle' ? calcMarkerOffsetX(arc).x - 60 : calcMarkerOffsetX(arc).x"
                        :y="calcMarkerOffsetY(arc) - (isSafari ? 20 : 0)" width="120" height="60"
                        style="overflow: visible;">
                        <div>
                            <slot name="dataLabel" v-bind="{
                                datapoint: arc,
                                isBlur: !FINAL_CONFIG.useBlurOnHover || [null, undefined].includes(selectedSerie) || selectedSerie === i,
                                isSafari: isSafari,
                                isVisible: isArcBigEnough(arc) && mutableConfig.dataLabels.show,
                                textAlign: calcMarkerOffsetX(arc, true, 16, true).anchor,
                                flexAlign: calcMarkerOffsetX(arc, true, 16).anchor,
                                percentage: displayArcPercentage(arc, noGhostDonut),
                            }" />
                        </div>
                    </foreignObject>
                </g>

                <g v-else>
                    <template v-if="FINAL_CONFIG.type === 'classic'">
                        <circle data-cy="donut-label-marker" v-if="isArcBigEnough(arc) && mutableConfig.dataLabels.show"
                            :cx="calcMarkerOffsetX(arc).x" :cy="calcMarkerOffsetY(arc) - 3.5" :fill="arc.color"
                            :stroke="FINAL_CONFIG.style.chart.backgroundColor" :stroke-width="1" :r="3"
                            :filter="!FINAL_CONFIG.useBlurOnHover || [null, undefined].includes(selectedSerie) || selectedSerie === i ? `` : `url(#blur_${uid})`"
                            @click="selectDatapoint(arc, i)" />
                    </template>
                    <template v-if="FINAL_CONFIG.type === 'polar'">
                        <circle data-cy="polar-label-marker" v-if="isArcBigEnough(arc) && mutableConfig.dataLabels.show"
                            :cx="offsetFromCenterPoint({ initX: polarAreas[i].middlePoint.x, initY: polarAreas[i].middlePoint.y, offset: 24, centerX: svg.width / 2, centerY: svg.height / 2 }).x"
                            :cy="offsetFromCenterPoint({ initX: polarAreas[i].middlePoint.x, initY: polarAreas[i].middlePoint.y, offset: 24, centerX: svg.width / 2, centerY: svg.height / 2 }).y"
                            :fill="arc.color" :stroke="FINAL_CONFIG.style.chart.backgroundColor" :stroke-width="1"
                            :r="3"
                            :filter="!FINAL_CONFIG.useBlurOnHover || [null, undefined].includes(selectedSerie) || selectedSerie === i ? `` : `url(#blur_${uid})`"
                            @click="selectDatapoint(arc, i)" 
                            :style="{
                                transition: isFirstLoad || !FINAL_CONFIG.serieToggleAnimation.show ? 'none' : `all ${FINAL_CONFIG.serieToggleAnimation.durationMs}ms ease-in-out`
                            }"
                        />
                    </template>
                    <template v-if="FINAL_CONFIG.type === 'classic'">
                        <text data-cy="donut-label-value" v-if="isArcBigEnough(arc) && mutableConfig.dataLabels.show"
                            :text-anchor="calcMarkerOffsetX(arc, true, 12).anchor"
                            :x="calcMarkerOffsetX(arc, true, 12).x" :y="calcMarkerOffsetY(arc)"
                            :fill="FINAL_CONFIG.style.chart.layout.labels.percentage.color"
                            :font-size="FINAL_CONFIG.style.chart.layout.labels.percentage.fontSize"
                            :style="`font-weight:${FINAL_CONFIG.style.chart.layout.labels.percentage.bold ? 'bold' : ''}`"
                            @click="selectDatapoint(arc, i)">
                            {{ displayArcPercentage(arc, noGhostDonut) }} {{
                                FINAL_CONFIG.style.chart.layout.labels.value.show ? `(${applyDataLabel(
                                    FINAL_CONFIG.style.chart.layout.labels.value.formatter,
                                    arc.value,
                                    dataLabel({
                                        p: FINAL_CONFIG.style.chart.layout.labels.dataLabels.prefix,
                                        v: arc.value, s: FINAL_CONFIG.style.chart.layout.labels.dataLabels.suffix,
                                        r: FINAL_CONFIG.style.chart.layout.labels.value.rounding
                                    }),
                                    { datapoint: arc }
                                )})` : '' }}
                        </text>
                        <text data-cy="donut-label-name"
                            v-if="isArcBigEnough(arc, true, 12) && mutableConfig.dataLabels.show"
                            :text-anchor="calcMarkerOffsetX(arc).anchor" :x="calcMarkerOffsetX(arc, true, 12).x"
                            :y="calcMarkerOffsetY(arc) + FINAL_CONFIG.style.chart.layout.labels.percentage.fontSize"
                            :fill="FINAL_CONFIG.style.chart.layout.labels.name.color"
                            :font-size="FINAL_CONFIG.style.chart.layout.labels.name.fontSize"
                            :style="`font-weight:${FINAL_CONFIG.style.chart.layout.labels.name.bold ? 'bold' : ''}`"
                            @click="selectDatapoint(arc, i)">
                            {{ arc.name }}
                        </text>
                    </template>
                    <template v-if="FINAL_CONFIG.type === 'polar'">
                        <text data-cy="polar-label-value" v-if="isArcBigEnough(arc) && mutableConfig.dataLabels.show"
                            :text-anchor="getPolarAnchor(polarAreas[i].middlePoint)"
                            :x="offsetFromCenterPoint({ initX: polarAreas[i].middlePoint.x, initY: polarAreas[i].middlePoint.y, offset: 42, centerX: svg.width / 2, centerY: svg.height / 2 }).x"
                            :y="offsetFromCenterPoint({ initX: polarAreas[i].middlePoint.x, initY: polarAreas[i].middlePoint.y, offset: 42, centerX: svg.width / 2, centerY: svg.height / 2 }).y"
                            :fill="FINAL_CONFIG.style.chart.layout.labels.percentage.color"
                            :font-size="FINAL_CONFIG.style.chart.layout.labels.percentage.fontSize"
                            :style="{
                                transition: isFirstLoad || !FINAL_CONFIG.serieToggleAnimation.show ? 'none' : `all ${FINAL_CONFIG.serieToggleAnimation.durationMs}ms ease-in-out`,
                                fontWeight: FINAL_CONFIG.style.chart.layout.labels.percentage.bold ? 'bold': 'normal'
                            }"
                            @click="selectDatapoint(arc, i)">
                            {{ displayArcPercentage(arc, noGhostDonut) }} {{
                                FINAL_CONFIG.style.chart.layout.labels.value.show ? `(${applyDataLabel(
                                    FINAL_CONFIG.style.chart.layout.labels.value.formatter,
                                    arc.value,
                                    dataLabel({
                                        p: FINAL_CONFIG.style.chart.layout.labels.dataLabels.prefix,
                                        v: arc.value, s: FINAL_CONFIG.style.chart.layout.labels.dataLabels.suffix,
                                        r: FINAL_CONFIG.style.chart.layout.labels.value.rounding
                                    }),
                                    { datapoint: arc }
                                )})` : '' }}
                        </text>
                        <text data-cy="polar-label-name"
                            v-if="isArcBigEnough(arc, true, 12) && mutableConfig.dataLabels.show"
                            :text-anchor="getPolarAnchor(polarAreas[i].middlePoint)"
                            :x="offsetFromCenterPoint({ initX: polarAreas[i].middlePoint.x, initY: polarAreas[i].middlePoint.y, offset: 42, centerX: svg.width / 2, centerY: svg.height / 2 }).x"
                            :y="offsetFromCenterPoint({ initX: polarAreas[i].middlePoint.x, initY: polarAreas[i].middlePoint.y, offset: 42, centerX: svg.width / 2, centerY: svg.height / 2 }).y + FINAL_CONFIG.style.chart.layout.labels.percentage.fontSize"
                            :fill="FINAL_CONFIG.style.chart.layout.labels.name.color"
                            :font-size="FINAL_CONFIG.style.chart.layout.labels.name.fontSize"
                            :style="{
                                transition: isFirstLoad || !FINAL_CONFIG.serieToggleAnimation.show ? 'none' : `all ${FINAL_CONFIG.serieToggleAnimation.durationMs}ms ease-in-out`,
                                fontWeight: FINAL_CONFIG.style.chart.layout.labels.name.bold ? 'bold': 'normal'
                            }"
                            @click="selectDatapoint(arc, i)">
                            {{ arc.name }}
                        </text>
                    </template>
                </g>

                <g v-if="mutableConfig.dataLabels.show && FINAL_CONFIG.style.chart.comments.show && arc.comment">
                    <foreignObject v-if="isArcBigEnough(arc) && FINAL_CONFIG.type === 'classic'"
                        :x="FINAL_CONFIG.style.chart.comments.offsetX + (calcMarkerOffsetX(arc, true).anchor === 'end' ? calcMarkerOffsetX(arc).x - FINAL_CONFIG.style.chart.comments.width : calcMarkerOffsetX(arc, true).anchor === 'middle' ? calcMarkerOffsetX(arc).x - (FINAL_CONFIG.style.chart.comments.width / 2) : calcMarkerOffsetX(arc).x)"
                        :y="calcMarkerOffsetY(arc) + 24 + FINAL_CONFIG.style.chart.comments.offsetY"
                        :width="FINAL_CONFIG.style.chart.comments.width" height="200"
                        style="overflow: visible; pointer-events: none">
                        <div>
                            <slot name="plot-comment"
                                :plot="{ ...arc, textAlign: calcMarkerOffsetX(arc, true, 16, true).anchor, flexAlign: calcMarkerOffsetX(arc, true, 16).anchor, isFirstLoad }" />
                        </div>
                    </foreignObject>
                    <foreignObject v-if="isArcBigEnough(arc) && FINAL_CONFIG.type === 'polar'"
                        :x="FINAL_CONFIG.style.chart.comments.offsetX + (getPolarAnchor(polarAreas[i].middlePoint) === 'end' ? offsetFromCenterPoint({ initX: polarAreas[i].middlePoint.x, initY: polarAreas[i].middlePoint.y, offset: 42, centerX: svg.width / 2, centerY: svg.height / 2 }).x - FINAL_CONFIG.style.chart.comments.width : getPolarAnchor(polarAreas[i].middlePoint) === 'middle' ? offsetFromCenterPoint({ initX: polarAreas[i].middlePoint.x, initY: polarAreas[i].middlePoint.y, offset: 42, centerX: svg.width / 2, centerY: svg.height / 2 }).x - (FINAL_CONFIG.style.chart.comments.width / 2) : offsetFromCenterPoint({ initX: polarAreas[i].middlePoint.x, initY: polarAreas[i].middlePoint.y, offset: 42, centerX: svg.width / 2, centerY: svg.height / 2 }).x)"
                        :y="getPolarCommentY(polarAreas[i]) + FINAL_CONFIG.style.chart.comments.offsetY"
                        :width="FINAL_CONFIG.style.chart.comments.width" height="200"
                        :style="{
                                transition: isFirstLoad || !FINAL_CONFIG.serieToggleAnimation.show ? 'none' : `all ${FINAL_CONFIG.serieToggleAnimation.durationMs}ms ease-in-out`,
                                overflow: 'visible',
                                pointerEvents: 'none'
                            }"
                        >
                        <div>
                            <slot name="plot-comment"
                                :plot="{ ...arc, textAlign: getPolarAnchor(polarAreas[i].middlePoint), flexAlign: getPolarAnchor(polarAreas[i].middlePoint), isFirstLoad }" />
                        </div>
                    </foreignObject>

                </g>

            </g>
            <slot name="svg" :svg="svg" />
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }" />
        </div>

        <Skeleton v-if="!isDataset" :config="{
            type: 'donut',
            style: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                donut: {
                    color: '#CCCCCC',
                    strokeWidth: donutThickness * 0.8
                }
            }
        }" />

        <div ref="chartLegend">
            <Legend v-if="FINAL_CONFIG.style.chart.legend.show" :key="`legend_${legendStep}`" :legendSet="legendSet"
                :config="legendConfig" @clickMarker="({ i }) => segregate(i)">
                <template #legend-pattern="{ legend, index }" v-if="$slots.pattern">
                    <Shape :shape="legend.shape" :radius="30" stroke="none" :plot="{ x: 30, y: 30 }"
                        :fill="`url(#pattern_${uid}_${index})`" />
                </template>

                <template #item="{ legend, index }">
                    <div data-cy="legend-item" :style="`opacity:${segregated.includes(index) ? 0.5 : 1}`"
                        @click="legend.segregate()">
                        {{ legend.name }}: {{ applyDataLabel(
                            FINAL_CONFIG.style.chart.layout.labels.value.formatter,
                            legend.value,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.layout.labels.dataLabels.prefix,
                                v: legend.value,
                                s: FINAL_CONFIG.style.chart.layout.labels.dataLabels.suffix,
                                r: FINAL_CONFIG.style.chart.legend.roundingValue
                            }),
                            {
                                datapoint: legend,
                                index
                            }
                        )
                        }}
                        <span v-if="!segregated.includes(index)" style="font-variant-numeric: tabular-nums;">
                            ({{ isNaN(legend.value / total) ? '-' : applyDataLabel(
                                FINAL_CONFIG.style.chart.layout.labels.percentage.formatter,
                                legendPercentage(legend),
                                dataLabel({
                                    v: legendPercentage(legend),
                                    s: '%',
                                    r: FINAL_CONFIG.style.chart.legend.roundingPercentage
                                }))
                            }})
                        </span>
                        <span v-else>
                            ( {{ dashLabel(legend.proportion * 100) }} % )
                        </span>
                    </div>
                </template>
            </Legend>
            <slot name="legend" v-bind:legend="legendSet" />
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- TOOLTIP -->
        <Tooltip :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.style.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.chart.tooltip.color" :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.style.chart.tooltip.position" :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="donutChart" :content="tooltipContent" :isCustom="useCustomFormat" :isFullscreen="isFullscreen">
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{ ...dataTooltipSlot }"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{ ...dataTooltipSlot }"></slot>
            </template>
        </Tooltip>

        <!-- DATA TABLE -->
        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color
            },
            head: {
                backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                color: FINAL_CONFIG.style.chart.color
            }
        }">
            <template #content>
                <DataTable :key="`table_${tableStep}`" :colNames="dataTable.colNames" :head="dataTable.head"
                    :body="dataTable.body" :config="dataTable.config"
                    :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false">
                    <template #th="{ th }">
                        <div v-html="th" style="display:flex;align-items:center"></div>
                    </template>
                    <template #td="{ td }">
                        {{ td.name ? td.name : isNaN(Number(td)) ? td.includes('%') ? td : applyDataLabel(
                            FINAL_CONFIG.style.chart.layout.labels.percentage.formatter,
                            td,
                            dataLabel({
                                v: td,
                                s: '%',
                                r: FINAL_CONFIG.style.chart.layout.labels.percentage.rounding
                            })
                        ) : applyDataLabel(
                            FINAL_CONFIG.style.chart.layout.labels.value.formatter,
                            td,
                            dataLabel({
                                p: FINAL_CONFIG.style.chart.layout.labels.dataLabels.prefix,
                                v: td,
                                s: FINAL_CONFIG.style.chart.layout.labels.dataLabels.suffix,
                                r: FINAL_CONFIG.style.chart.layout.labels.value.rounding
                            })
                        ) }}
                    </template>
                </DataTable>
            </template>
        </Accordion>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-donut * {
    transition: unset;
}

.vue-ui-donut {
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

.vue-ui-donut .vue-ui-donut-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height: 100%;
    justify-content: center;
    text-align: center;
    width: 100%;
}

.vue-ui-donut-datalabel-slot {
    width: 100%;
    height: -webkit-fit-content;
    height: fit-content;
}

.vue-ui-donut-datalabel-slot-not-safari {
    position: absolute;
    top: 0;
    transform: translateY(-50%);
}
</style>