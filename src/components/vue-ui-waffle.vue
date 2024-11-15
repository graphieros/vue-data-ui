<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from "vue";
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
    XMLNS
} from "../lib";
import { throttle } from "../canvas-lib";
import themes from "../themes.json";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Tooltip from "../atoms/Tooltip.vue";
import DataTable from "../atoms/DataTable.vue";
import Legend from "../atoms/Legend.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import Accordion from "./vue-ui-accordion.vue";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useResponsive } from "../useResponsive";
import { useConfig } from "../useConfig";
import PackageVersion from "../atoms/PackageVersion.vue";

const { vue_ui_waffle: DEFAULT_CONFIG } = useConfig()

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

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length
});

const uid = ref(createUid());
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const selectedSerie = ref(null);
const step = ref(0);
const waffleChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const titleStep = ref(0);
const tableStep = ref(0);
const legendStep = ref(0);

const FINAL_CONFIG = computed({
    get: () => {
        return prepareConfig();
    },
    set: (newCfg) => {
        return newCfg
    }
});

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
    FINAL_CONFIG.value = prepareConfig();
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
    legendStep.value += 1;
}, { deep: true });

const resizeObserver = ref(null);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiWaffle',
            type: 'dataset'
        })
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
                    index: i
                });
            });
        });
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: waffleChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
            });
            svg.value.width = width;
            svg.value.height = height;
            drawingArea.value.width = width;
            drawingArea.value.height = height;
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(waffleChart.value.parentNode);
    }
}

onMounted(() => {
    prepareChart();
});

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
});


const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-waffle_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-waffle'
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
})


const mutableConfig = ref({
    showTable: FINAL_CONFIG.value.table.show,
    showTooltip: FINAL_CONFIG.value.style.chart.tooltip.show
});

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
    return ((drawingArea.value.width) / FINAL_CONFIG.value.style.chart.layout.grid.size);
});

const absoluteRectDimensionY = computed(() => {
    return ((drawingArea.value.height) / FINAL_CONFIG.value.style.chart.layout.grid.size);
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

function prepareDataset() {
    return props.dataset.map((s, i) => {
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

watch(() => props.dataset, (_) => {
    datasetCopy.value = prepareDataset();
}, { deep: true })

const proportions = computed(() => {
    const numbers = datasetCopy.value
        .filter((serie,i) => !segregated.value.includes(serie.uid))
        .map((serie, i) => (serie.values || []).reduce((a,b) => a + b, 0));
    return calculateProportions(numbers);
});

const immutableProportions = computed(() => {
    const numbers = datasetCopy.value
        .map((serie, i) => (serie.values || []).reduce((a,b) => a + b));
    return calculateProportions(numbers);
});

const waffleSet = computed(() => {
    props.dataset.forEach((ds, i) => {
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
                        return ds
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
                rafUp.value = requestAnimationFrame(animUp)
            }
        }
        animUp()
    } else if(segregated.value.length < legendSet.value.length - 1 && legendSet.value.length > 1) {
        function animDown() {
            if(initVal < 0.1) {
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
                initVal /= 1.5;
                datasetCopy.value = datasetCopy.value.map((ds, i) => {
                    if (ds.uid === uid) {
                        return {
                            ...ds,
                            values: [initVal]
                        }
                    } else {
                        return ds
                    }
                })
                rafDown.value = requestAnimationFrame(animDown)
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

const legendSet = computed(() => {
    return datasetCopy.value
        .map((serie, i) => {
            return {
                name: serie.name,
                color: serie.color || customPalette[i] || palette[i] || palette[i % palette.length],
                value: (serie.values || []).reduce((a,b) => a + b, 0),
                uid: serie.uid,
                shape: 'square'
            }
        })
        .map((el, i) => {
            return {
                ...el,
                proportion: el.value / datasetCopy.value.map(ds => (ds.values || []).reduce((a,b) => a + b, 0)).reduce((a, b) => a + b, 0),
                opacity: segregated.value.includes(el.uid) ? 0.5 : 1,
                segregate: () => segregate(el.uid),
                isSegregated: segregated.value.includes(el.uid)
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

function useTooltip(index) {
    if(segregated.value.length === props.dataset.length) return;
    
    const selected = rects.value[index];

    dataTooltipSlot.value = {
        datapoint: selected,
        seriesIndex: selected.absoluteIndex,
        series: datasetCopy.value,
        config: FINAL_CONFIG.value
    }
    
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
        html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><rect data-cy="waffle-tooltip-marker" x="0" y="0" height="12" width="12" stroke="none" rx="1" fill="${selected.color}" /></svg>`;
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
                v: selected.value / total.value * 100,
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

function generateCsv() {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [isNaN(table.value.body[i] / total.value) ? '-' : table.value.body[i] / total.value * 100]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text],[FINAL_CONFIG.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-waffle"})
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

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleTooltip
});

</script>

<template>
    <div 
        :class="`vue-ui-waffle ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" 
        ref="waffleChart" 
        :id="`vue-ui-waffle_${uid}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;${!FINAL_CONFIG.style.chart.title.text ? 'padding-top:36px' : ''};background:${FINAL_CONFIG.style.chart.backgroundColor};${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`"
    >
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

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip && FINAL_CONFIG.style.chart.tooltip.show"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="waffleChart"
            :position="FINAL_CONFIG.userOptions.position"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleTooltip="toggleTooltip"
        >
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
            <template #optionTable v-if="$slots.optionTable">
                <slot name="optionTable" />
            </template>
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
        </UserOptions>

        <!-- CHART -->
        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" data-cy="waffle-svg" :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`" :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.chart.color}`" >
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
                <rect
                    v-for="(position, i) in positions"
                    :data-cy="`waffle-rect-underlayer-${i}`"
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
            </template>

            <!-- DATA LABELS -->
            <template v-for="(position, i) in positions">
                <foreignObject
                    v-if="rects.length && !isAnimating && !FINAL_CONFIG.style.chart.layout.grid.vertical && FINAL_CONFIG.style.chart.layout.labels.captions.show && ((rects[i].isFirst && position.position < FINAL_CONFIG.style.chart.layout.grid.size - 2) || (rects[i].isAbsoluteFirst && i % FINAL_CONFIG.style.chart.layout.grid.size === 0 && rects[i].absoluteStartIndex))"
                    :x="position.x + FINAL_CONFIG.style.chart.layout.labels.captions.offsetX + FINAL_CONFIG.style.chart.layout.grid.spaceBetween / 2"
                    :y="position.y + FINAL_CONFIG.style.chart.layout.labels.captions.offsetY + FINAL_CONFIG.style.chart.layout.grid.spaceBetween / 2"
                    :height="absoluteRectDimensionY <= 0 ? 0.0001 : absoluteRectDimensionY"
                    :width="absoluteRectDimension * FINAL_CONFIG.style.chart.layout.grid.size <= 0 ? 0.0001 : absoluteRectDimension * FINAL_CONFIG.style.chart.layout.grid.size"
                    :filter="getBlurFilter(rects[i].serieIndex)"
                >
                    <div class="vue-ui-waffle-caption" :style="`height: 100%; width: 100%; font-size:${FINAL_CONFIG.style.chart.layout.labels.captions.fontSize}px;display:flex;align-items:center;justify-content:flex-start;padding: 0 ${absoluteRectDimension / 12}px;color:${adaptColorToBackground(rects[i].color)};gap:2px`">
                        <span v-if="FINAL_CONFIG.style.chart.layout.labels.captions.showSerieName">
                            {{ FINAL_CONFIG.style.chart.layout.labels.captions.serieNameAbbreviation ? abbreviate({ source: rects[i].name, length: FINAL_CONFIG.style.chart.layout.labels.captions.serieNameMaxAbbreviationSize}) : rects[i].name }}:
                        </span>
                        <span v-if="FINAL_CONFIG.style.chart.layout.labels.captions.showPercentage">
                            {{ dataLabel({ v: rects[i].proportion, s: '%', r: FINAL_CONFIG.style.chart.layout.labels.captions.roundingPercentage }) }}
                        </span>
                        <span v-if="FINAL_CONFIG.style.chart.layout.labels.captions.showPercentage && FINAL_CONFIG.style.chart.layout.labels.captions.showValue">
                            ({{ applyDataLabel(
                                FINAL_CONFIG.style.chart.layout.labels.dataLabels.formatter,
                                rects[i].value,
                                dataLabel({ p: FINAL_CONFIG.style.chart.layout.labels.dataLabels.prefix, 
                                    v: rects[i].value, 
                                    s: FINAL_CONFIG.style.chart.layout.labels.dataLabels.suffix, 
                                    r: FINAL_CONFIG.style.chart.layout.labels.captions.roundingValue 
                                }),
                                { datapoint: rects[i], position }
                            )}})
                        </span>
                        <span v-if="!FINAL_CONFIG.style.chart.layout.labels.captions.showPercentage && FINAL_CONFIG.style.chart.layout.labels.captions.showValue">
                            {{ applyDataLabel(
                                FINAL_CONFIG.style.chart.layout.labels.dataLabels.formatter,
                                rects[i].value,
                                dataLabel({ p: FINAL_CONFIG.style.chart.layout.labels.dataLabels.prefix, 
                                    v: rects[i].value, 
                                    s: FINAL_CONFIG.style.chart.layout.labels.dataLabels.suffix, 
                                    r: FINAL_CONFIG.style.chart.layout.labels.captions.roundingValue 
                                }),
                                { datapoint: rects[i], position }
                            )
                            }}
                        </span>
                    </div>
                </foreignObject>
            </template>
    
            <rect
                v-for="(position, i) in positions"
                :data-cy="`waffle-rect-${i}`"
                @mouseover="useTooltip(i)"
                @mouseleave="isTooltip = false; selectedSerie = null"
                :x="position.x + FINAL_CONFIG.style.chart.layout.grid.spaceBetween / 2"
                :y="position.y + FINAL_CONFIG.style.chart.layout.grid.spaceBetween / 2"
                :height="absoluteRectDimensionY <= 0 ? 0.0001 : absoluteRectDimensionY"
                :width="absoluteRectDimension <= 0 ? 0.0001 : absoluteRectDimension"
                fill="transparent"
                stroke="none"
            />
            <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'waffle',
                style: {
                    backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                    waffle: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />

        <!-- LEGEND AS DIV -->
        <div ref="chartLegend">        
            <Legend
                v-if="FINAL_CONFIG.style.chart.legend.show"
                :key="`legend_${legendStep}`"
                :legendSet="legendSet"
                :config="legendConfig"
                @clickMarker="({legend}) => segregate(legend.uid)"
            >
                <template #item="{ legend }">
                    <div @click="legend.segregate()" :style="`opacity:${segregated.includes(legend.uid) ? 0.5 : 1}`">
                        {{ legend.name }}: {{ applyDataLabel(
                            FINAL_CONFIG.style.chart.layout.labels.dataLabels.formatter,
                            legend.value,
                            dataLabel({
                                p:FINAL_CONFIG.style.chart.layout.labels.dataLabels.prefix, 
                                v: legend.value, 
                                s: FINAL_CONFIG.style.chart.layout.labels.dataLabels.suffix, 
                                r:FINAL_CONFIG.style.chart.legend.roundingValue, isAnimating
                            }),
                            { datapoint: legend }
                            )
                        }}
                        <span v-if="!segregated.includes(legend.uid)">
                            ({{ isNaN(legend.value / total) ? '-' : dataLabel({v: legend.value /total * 100, s: '%', r: FINAL_CONFIG.style.chart.legend.roundingPercentage, isAnimating }) }})
                        </span>
                        <span v-else>
                            ( - % )
                        </span>
                    </div>
                </template>
            </Legend>
    
            <slot v-else name="legend" v-bind:legend="legendSet"></slot>
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
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>

        <!-- DATA TABLE -->
        <Accordion hideDetails v-if="isDataset"  
        :config="{
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
                <DataTable
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false"
                >
                    <template #th="{th}">
                        <div v-html="th" style="display:flex;align-items:center"></div>
                    </template>
                    <template #td="{td}">
                        {{ td.name || td }}
                    </template>
                </DataTable>
            </template>
        </Accordion>
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