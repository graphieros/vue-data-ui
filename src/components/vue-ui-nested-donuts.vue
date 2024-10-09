<script setup>
import { ref, computed, nextTick, onMounted, watch, onBeforeUnmount } from "vue";
import {
    abbreviate,
    calcMarkerOffsetX, 
    calcMarkerOffsetY, 
    convertColorToHex, 
    convertCustomPalette,
    createCsvContent, 
    createUid, 
    dataLabel,
    error,
    downloadCsv,
    functionReturnsString,
    isFunction, 
    makeDonut, 
    objectIsEmpty,
    palette,
    themePalettes,
    XMLNS, 
} from '../lib';
import { throttle } from "../canvas-lib";
import themes from "../themes.json";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import DataTable from "../atoms/DataTable.vue";
import Tooltip from "../atoms/Tooltip.vue";
import Legend from "../atoms/Legend.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import Accordion from "./vue-ui-accordion.vue";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useResponsive } from "../useResponsive";
import { useConfig } from "../useConfig";

const { vue_ui_nested_donuts: DEFAULT_CONFIG } = useConfig();

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
const isTooltip = ref(false);
const tooltipContent = ref('');
const selectedSerie = ref(null);
const step = ref(0);
const nestedDonutsChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const FINAL_CONFIG = computed(() => {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_nested_donuts[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        return mergedConfig;
    }
});

const resizeObserver = ref(null);

onMounted(() => {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiNestedDonuts',
            type: 'dataset'
        })
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: nestedDonutsChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
            });
            svg.value.width = width;
            svg.value.height = height;
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(nestedDonutsChart.value.parentNode);
    }
});

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `nested_donuts_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-nested-donuts'
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
    height: 512,
    width: 512
});

const emit = defineEmits(['selectLegend', 'selectDatapoint']);

function selectDatapoint({ datapoint, index }) {
    emit('selectDatapoint', { datapoint, index })
}

const segregated = ref([]);

const immutableDataset = computed(() => {
    props.dataset.forEach((ds,i) => {
        if([null, undefined].includes(ds.name)) {
            error({
                componentName: 'VueUiNestedDonuts',
                type: 'datasetSerieAttribute',
                property: 'name',
                index: i
            })
        }
        if([null, undefined].includes(ds.series)) {
            error({
                componentName: 'VueUiNestedDonuts',
                type: 'datasetSerieAttribute',
                property: 'series',
                index: i
            })
        } else {
            if(ds.series.length === 0) {
                error({
                    componentName: 'VueUiNestedDonuts',
                    type: 'datasetAttributeEmpty',
                    property: `series at index ${i}`
                })
            } else {
                ds.series.forEach((serie, j) => {
                    if([null, undefined].includes(serie.name)) {
                        error({
                            componentName: 'VueUiNestedDonuts',
                            type: 'datasetSerieAttribute',
                            property: 'name',
                            index: j,
                            key: 'serie'
                        })
                    }
                    if([null, undefined].includes(serie.values)) {
                        error({
                            componentName: 'VueUiNestedDonuts',
                            type: 'datasetSerieAttribute',
                            property: 'values',
                            index: j,
                            key: 'serie'
                        })
                    }
                })
            }
        }
    })

    return props.dataset.map((ds, i) => {
        return {
            ...ds,
            total: ds.series.filter(s => !segregated.value.includes(s.id)).map(s => (s.values || []).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0),
            datasetIndex: i,
            id: `${uid.value}_${i}`,
            series: ds.series.map((serie, j) => {
                return {
                    name: serie.name,
                    arcOf: ds.name,
                    arcOfId: `${uid.value}_${i}`,
                    id: `${uid.value}_${i}_${j}`,
                    seriesIndex: j,
                    datasetIndex: i,
                    color: convertColorToHex(serie.color) || customPalette.value[j] || palette[j] || palette[j % palette.length],
                    value: (serie.values || []).reduce((a, b) => a + b, 0),
                    absoluteValues: serie.values || []
                }
            })
        }
    });
});

const baseDonutSize = ref(FINAL_CONFIG.value.style.chart.layout.donut.strokeWidth);

const donutSize = computed(() => {
    return Math.min(svg.value.height, svg.value.width) * (FINAL_CONFIG.value.style.chart.layout.donut.strokeWidth / 512);
});

const md = computed(() => {
    return [...immutableDataset.value].map((ds, i) => {
        const total = ds.series.filter(serie => !segregated.value.includes(serie.id)).map(s => {
            return s.value
        }).reduce((a, b) => a +b, 0)

        return {
            ...ds,
            total,
            series: ds.series.filter(serie => !segregated.value.includes(serie.id)).map(s => {
                return {
                    ...s,
                    proportion: s.value / total
                }
            }),
        }
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

watch(() => md.value, (val) => mutableDataset.value = val);

const rafUp = ref(null);
const rafDown = ref(null);

function segregateDonut(item) {
    emit('selectLegend', item);
    const target = immutableDataset.value.flatMap(d => d.series).find(el => el.id === item.id);
    const sourceEl = mutableDataset.value.flatMap(d => d.series).find(el => el.id === item.id);
    const source = sourceEl ? sourceEl.value : 0;
    let initVal = source;

    const allParentDonutIds = immutableDataset.value.find(el => el.id === target.arcOfId).series.map(s => s.id);
    const canSegregate = checkSegregation(allParentDonutIds, allParentDonutIds.length - 1, segregated.value);

    if(segregated.value.includes(item.id)) {
        segregated.value = segregated.value.filter(s => s !== item.id);
        function animUp() {
            if(initVal > target.value) {
                cancelAnimationFrame(rafUp.value);
                mutableDataset.value = mutableDataset.value.map(ds => {
                    return {
                        ...ds,
                        series: ds.series.map(s => {
                            if(s.id == item.id) {
                                return {
                                    ...s,
                                    value: target.value
                                }
                            } else {
                                return s;
                            }
                        })
                    }
                });
            } else {
                initVal += (target.value * 0.025);
                mutableDataset.value = mutableDataset.value.map(ds => {
                    return {
                        ...ds,
                        series: ds.series.map(s => {
                            if(s.id === item.id) {
                                return {
                                    ...s,
                                    value: initVal
                                }
                            } else {
                                return s;
                            }
                        })
                    }
                });
                rafUp.value = requestAnimationFrame(animUp);
            }
        }
        animUp();
    } else if(canSegregate) {
        function animDown() {
            if(initVal < 0.1) {
                cancelAnimationFrame(rafDown.value);
                segregated.value.push(item.id);
                mutableDataset.value = mutableDataset.value.map((ds, i) => {
                    return {
                        ...ds,
                        series: ds.series.map(s => {
                            if(s.id === item.id) {
                                return {
                                    ...s,
                                    value: 0
                                }
                            } else {
                                return s
                            }
                        })
                    }
                });
            } else {
                initVal /= 1.1;
                mutableDataset.value = mutableDataset.value.map((ds, i) => {
                    return {
                        ...ds,
                        series: ds.series.map(s => {
                            if(s.id === item.id) {
                                return {
                                    ...s,
                                    value: initVal
                                }
                            } else {
                                return s
                            }
                        })
                    }
                });
                rafDown.value = requestAnimationFrame(animDown);
            }
        }
        animDown();
    }
}

const donuts = computed(() => {
    return mutableDataset.value.map((ds, i) => {
        const sizeRatio = i * donutSize.value / immutableDataset.value.length;
        return {
            ...ds,
            radius: donutSize.value - sizeRatio,
            donut: makeDonut(
                { series: ds.series },
                svg.value.width / 2,
                svg.value.height / 2,
                donutSize.value - sizeRatio,
                donutSize.value - sizeRatio,
                1.99999,
                2,
                1,
                360,
                105.25,
                donutSize.value / immutableDataset.value.length * FINAL_CONFIG.value.style.chart.layout.donut.spacingRatio
            )
        }
    })
});

const gradientSets = computed(() => {
    return [...immutableDataset.value].map((ds, i)  => {
        const sizeRatio = i * donutSize.value / immutableDataset.value.length;

        return {
            sizeRatio,
            donut: makeDonut(
                { series: [{ value: 1}] },
                svg.value.width / 2,
                svg.value.height / 2,
                donutSize.value - sizeRatio,
                donutSize.value - sizeRatio,
                1.99999,
                2,
                1,
                360,
                105.25,
                donutSize.value / immutableDataset.value.length * FINAL_CONFIG.value.style.chart.layout.donut.spacingRatio
            )[0]
        }
    });
});

const selectedDonut = ref(null);
const selectedDatapoint = ref(null);
const selectedDatapointIndex = ref(null);
const dataTooltipSlot = ref(null);

function useTooltip({ datapoint, _relativeIndex, seriesIndex }){
    selectedDonut.value = datapoint.arcOfId;
    selectedDatapoint.value = datapoint.id;
    selectedDatapointIndex.value = seriesIndex;

    dataTooltipSlot.value = {
        datapoint,
        seriesIndex,
        series: mutableDataset.value,
        config: FINAL_CONFIG.value
    }

    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

    if(isFunction(customFormat) && functionReturnsString(() => customFormat({
        seriesIndex,
        datapoint,
        series: mutableDataset.value,
        config: FINAL_CONFIG.value
    }))) {
        tooltipContent.value = customFormat({
            seriesIndex,
            datapoint,
            series: mutableDataset.value,
            config: FINAL_CONFIG.value
        })
    } else {
        let html = "";

        if (FINAL_CONFIG.value.style.chart.tooltip.showAllItemsAtIndex && segregated.value.length === 0 ) {
            const itemsAtIndex = mutableDataset.value.map(ds => {
                return ds.series.find((s) => s.seriesIndex === seriesIndex)
            });

            itemsAtIndex.forEach((item, i) => {
                if(!item) return ''
                html += `
                    <div style="display:flex; flex-direction: column; justify-content:flex-start; align-items:flex-start;padding:6px 0; ${i < itemsAtIndex.length -1 ? `border-bottom:1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor}` : ''}">
                        <div style="display:flex; flex-direction: row; gap: 3px; justify-content:flex-start; align-items:center;">
                            <svg viewBox="0 0 20 20" height="${FINAL_CONFIG.value.style.chart.tooltip.fontSize}" width="${FINAL_CONFIG.value.style.chart.tooltip.fontSize}">
                                <circle cx="10" cy="10" r="10" fill="${item.color}"/>
                            </svg>
                            <span>
                                ${item.arcOf ?? ''} - ${item.name}
                            </span>
                        </div>
                        <span>
                            ${FINAL_CONFIG.value.style.chart.tooltip.showValue ? `<b>${ dataLabel({p: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix, v: datapoint.value, s: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix, r: FINAL_CONFIG.value.style.chart.tooltip.roundingValue})}</b>` : ''}
                            ${FINAL_CONFIG.value.style.chart.tooltip.showPercentage ? `(${dataLabel({ v: item.proportion * 100, s: '%', r: FINAL_CONFIG.value.style.chart.tooltip.roundingPercentage })})` : ''}
                        </span>
                    </div>
                `;
            })
        } else {
            html += `<div data-cy="donut-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor};padding-bottom:6px;margin-bottom:3px;">${datapoint.arcOf ?? ''} - ${datapoint.name}</div>`;

            html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><circle data-cy="donut-tooltip-marker" cx="6" cy="6" r="6" stroke="none" fill="${datapoint.color}"/></svg>`;

                if(FINAL_CONFIG.value.style.chart.tooltip.showValue) {
                    html += `<b data-cy="donut-tooltip-value">${ dataLabel({p: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix, v: datapoint.value, s: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix, r: FINAL_CONFIG.value.style.chart.tooltip.roundingValue})}</b>`;
                }

                if(FINAL_CONFIG.value.style.chart.tooltip.showPercentage) {
                    if(!FINAL_CONFIG.value.style.chart.tooltip.showValue) {
                        html += `<b>${(datapoint.proportion * 100).toFixed(FINAL_CONFIG.value.style.chart.tooltip.roundingPercentage)}%</b></div>`;
                    } else {
                        html += `<span>(${(datapoint.proportion * 100).toFixed(FINAL_CONFIG.value.style.chart.tooltip.roundingPercentage)}%)</span></div>`;
                    }
                }
        }
        tooltipContent.value = `<div style="font-size:${FINAL_CONFIG.value.style.chart.tooltip.fontSize}px">${html}</div>`;
    }
    isTooltip.value = true;
}

function isArcBigEnough(arc) {
    return arc.proportion * 100 > FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.hideUnderValue;
}

function getBlurFilter(arc, index) {
    if (!FINAL_CONFIG.value.useBlurOnHover) {
        return '';
    }
    if (FINAL_CONFIG.value.style.chart.tooltip.showAllItemsAtIndex && segregated.value.length === 0) {
        if ([null, undefined].includes(selectedDatapointIndex.value) || selectedDatapointIndex.value === index) {
            return ''
        } else {
            return `url(#blur_${uid.value})`;
        }
    }
    if (!FINAL_CONFIG.value.style.chart.tooltip.showAllItemsAtIndex || segregated.value.length) {
        if([null, undefined].includes(selectedDatapoint.value)) {
            return ''
        }
        if(selectedDatapoint.value === arc.id) {
            return ''
        } else {
            return `url(#blur_${uid.value})`;
        }
    }
}

const legendSets = computed(() => {
    return immutableDataset.value.map((ds, i) => {
        return ds.series.map((s, j) => {
            return {
                name: s.name,
                color: s.color,
                value: s.value,
                shape: 'circle',
                arcOf: s.arcOf,
                id: s.id,
                seriesIndex: j,
                datasetIndex: i,
                total: ds.series.filter(s => !segregated.value.includes(s.id)).map(s => s.value).reduce((a, b) => a + b, 0),
            }
        }).map((s) => {
            return {
                ...s,
                opacity: segregated.value.includes(s.id) ? 0.5 : 1,
                segregate: () => segregateDonut(s),
                isSegregated: segregated.value.includes(s.id)
            }
        })
    });
});

const legendConfig = computed(() => {
    return {
        cy: 'nested-donuts-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
});

const table = computed(() => {
    const head = mutableDataset.value.flatMap(ds => {
        return ds.series.map(s => {
            return {
                name: `${ds.name} - ${s.name}`,
                color: s.color,
                total: ds.total
            }
        })
    });
    const body = mutableDataset.value.flatMap(ds => {
        return ds.series.map(s => s.value)
    });
    return { head, body };
});

function generateCsv() {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [isNaN(table.value.body[i] / h.total) ? '-' : table.value.body[i] / h.total * 100]]
        });
        const tableXls = [[FINAL_CONFIG.value.style.chart.title.text],[FINAL_CONFIG.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-nested-donuts" })
    });
}

const dataTable = computed(() => {
    const head = [
        FINAL_CONFIG.value.table.columnNames.series,
        FINAL_CONFIG.value.table.columnNames.value,
        FINAL_CONFIG.value.table.columnNames.percentage,
    ];

    const body = table.value.head.map((h,i) => {
        const label = dataLabel({p: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.prefix, v: table.value.body[i], s: FINAL_CONFIG.value.style.chart.layout.labels.dataLabels.suffix, r: FINAL_CONFIG.value.table.td.roundingValue});
        return [
            {
                color: h.color,
                name: h.name
            },
            label,
            isNaN(table.value.body[i] / h.total) ? "-" : (table.value.body[i] / h.total * 100).toFixed(FINAL_CONFIG.value.table.td.roundingPercentage) + '%'
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

function getData() {
    return immutableDataset.value
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

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleLabels,
    toggleTooltip
})

</script>

<template>
    <div ref="nestedDonutsChart" :class="`vue-ui-nested-donuts ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`" :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; text-align:center;${(!FINAL_CONFIG.style.chart.title.text && FINAL_CONFIG.userOptions.show) ? 'padding-top:36px' : ''};background:${FINAL_CONFIG.style.chart.backgroundColor}`" :id="`nested_donuts_${uid}`">
        
        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text">        
            <Title
                :config="{
                    title: {
                        cy: 'donut-div-title',
                        ...FINAL_CONFIG.style.chart.title
                    },
                    subtitle: {
                        cy: 'donut-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    }
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            :hasTooltip="FINAL_CONFIG.userOptions.buttons.tooltip && FINAL_CONFIG.style.chart.tooltip.show"
            :hasPdf="FINAL_CONFIG.userOptions.buttons.pdf"
            :hasXls="FINAL_CONFIG.userOptions.buttons.csv"
            :hasImg="FINAL_CONFIG.userOptions.buttons.img"
            :hasTable="FINAL_CONFIG.userOptions.buttons.table"
            :hasLabel="FINAL_CONFIG.userOptions.buttons.labels"
            :hasFullscreen="FINAL_CONFIG.userOptions.buttons.fullscreen"
            :isFullscreen="isFullscreen"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...FINAL_CONFIG.userOptions.buttonTitles }"
            :chartElement="nestedDonutsChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleLabels="toggleLabels"
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
            <template #optionLabels v-if="$slots.optionLabels">
                <slot name="optionLabels" />
            </template>
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
        </UserOptions>

        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${svg.width <= 0 ? 0.001 : svg.width} ${svg.height < 0 ? 0.001 : svg.height}`" :style="`max-width:100%; overflow: visible; background:${FINAL_CONFIG.style.chart.backgroundColor};color:${FINAL_CONFIG.style.chart.color}`">
            <!-- GRADIENTS -->
            <defs>
                <radialGradient v-for="(_, i) in gradientSets" :id="`radial_${uid}_${i}`" cx="50%" cy="50%" r="50%" :fr="30 - (1 * (i+1)) + '%'">
                    <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
                    <stop :offset="70 - (20 * i) + '%'" stop-color="#FFFFFF" :stop-opacity="FINAL_CONFIG.style.chart.gradientIntensity / 100"/>
                    <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
                </radialGradient>
            </defs>

            <!-- FILTERS -->
            <defs>
                <filter :id="`blur_${uid}`" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" :stdDeviation="2" :id="`blur_std_${uid}`" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>

                <filter :id="`shadow_${uid}`" color-interpolation-filters="sRGB">
                    <feDropShadow dx="0" dy="0" stdDeviation="10" flood-opacity="0.5" :flood-color="FINAL_CONFIG.style.chart.layout.donut.shadowColor" />
                </filter>
            </defs>
            
            <!-- UNDERLAYER CIRCLES -->
            <circle
                v-for="c in donuts"
                :cx="svg.width / 2"
                :cy="svg.height / 2"
                :r="c.radius < 0 ? 0.00001 : c.radius "
                :fill="FINAL_CONFIG.style.chart.backgroundColor"
                :filter="FINAL_CONFIG.style.chart.layout.donut.useShadow ? `url(#shadow_${uid})`: ''"
            />
           
            <!-- NESTED DONUTS -->
            <g v-for="(item, i) in donuts">
                <g v-for="(arc, j) in item.donut">
                    <path
                        class="vue-ui-donut-arc-path"
                        :d="arc.arcSlice" 
                        :fill="`${arc.color}CC`"
                        :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.chart.layout.donut.borderWidth"
                        :filter="getBlurFilter(arc, j)"
                    />
                </g>
            </g>

            <g v-if="FINAL_CONFIG.style.chart.useGradient">
                <g v-for="(gradient, i) in gradientSets">
                    <path
                        :d="gradient.donut.arcSlice"
                        :fill="`url(#radial_${uid}_${i})`"
                        stroke="transparent"
                        stroke-width="0"
                    />
                </g>
            </g>

            <g v-if="FINAL_CONFIG.style.chart.layout.labels.dataLabels.showDonutName">
                <g v-for="(item, i) in donuts">
                    <g v-for="(arc, j) in item.donut">    
                        <text
                            :class="{ 'animated': FINAL_CONFIG.useCssAnimation }"
                            v-if="j === 0 && svg.width && svg.height"
                            :x="svg.width / 2"
                            :y="arc.startY - FINAL_CONFIG.style.chart.layout.labels.dataLabels.fontSize + FINAL_CONFIG.style.chart.layout.labels.dataLabels.donutNameOffsetY"
                            text-anchor="middle"
                            :font-size="FINAL_CONFIG.style.chart.layout.labels.dataLabels.fontSize"
                            :font-weight="FINAL_CONFIG.style.chart.layout.labels.dataLabels.boldDonutName ? 'bold': 'normal'"
                            :fill="FINAL_CONFIG.style.chart.layout.labels.dataLabels.color"
                        >
                            {{ FINAL_CONFIG.style.chart.layout.labels.dataLabels.donutNameAbbreviation ? abbreviate({ source: item.name, length: FINAL_CONFIG.style.chart.layout.labels.dataLabels.donutNameMaxAbbreviationSize }) : item.name }}
                        </text>
                    </g>
                </g>
            </g>

            <!-- DATALABELS -->
            <g v-if="FINAL_CONFIG.style.chart.layout.labels.dataLabels.show">
                <g v-for="(item, i) in donuts">
                    <g v-for="(arc, j) in item.donut" :filter="getBlurFilter(arc, j)">
                        <text
                            :class="{ 'animated': FINAL_CONFIG.useCssAnimation }"
                            v-if="isArcBigEnough(arc) && mutableConfig.dataLabels.show && FINAL_CONFIG.style.chart.layout.labels.dataLabels.showPercentage"
                            :text-anchor="calcMarkerOffsetX(arc, true).anchor"
                            :x="calcMarkerOffsetX(arc, false, FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetX).x || 0"
                            :y="calcMarkerOffsetY(arc, FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetY, FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetY)"
                            :fill="FINAL_CONFIG.style.chart.layout.labels.dataLabels.useSerieColor ? arc.color : FINAL_CONFIG.style.chart.layout.labels.dataLabels.color"
                            :font-size="FINAL_CONFIG.style.chart.layout.labels.dataLabels.fontSize"
                            :font-weight="FINAL_CONFIG.style.chart.layout.labels.dataLabels.boldPercentage ? 'bold': 'normal'"
                        >
                            {{ dataLabel({ v: arc.proportion * 100, s: '%', r: FINAL_CONFIG.style.chart.layout.labels.dataLabels.roundingPercentage }) }}
                        </text>
                        <text
                            :class="{ 'animated': FINAL_CONFIG.useCssAnimation }"
                            v-if="isArcBigEnough(arc) && mutableConfig.dataLabels.show && FINAL_CONFIG.style.chart.layout.labels.dataLabels.showPercentage && FINAL_CONFIG.style.chart.layout.labels.dataLabels.showValue"
                            :text-anchor="calcMarkerOffsetX(arc, true).anchor"
                            :x="calcMarkerOffsetX(arc, false, FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetX).x || 0"
                            :y="calcMarkerOffsetY(arc, FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetY, FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetY) + FINAL_CONFIG.style.chart.layout.labels.dataLabels.fontSize"
                            :fill="FINAL_CONFIG.style.chart.layout.labels.dataLabels.useSerieColor ? arc.color : FINAL_CONFIG.style.chart.layout.labels.dataLabels.color"
                            :font-size="FINAL_CONFIG.style.chart.layout.labels.dataLabels.fontSize"
                            :font-weight="FINAL_CONFIG.style.chart.layout.labels.dataLabels.boldValue ? 'bold': 'normal'"
                        >
                            ({{ dataLabel({ p: FINAL_CONFIG.style.chart.layout.labels.dataLabels.prefix, v: arc.value, s: FINAL_CONFIG.style.chart.layout.labels.dataLabels.suffix, r: FINAL_CONFIG.style.chart.layout.labels.dataLabels.roundingValue }) }})
                        </text>
                        <text
                            :class="{ 'animated': FINAL_CONFIG.useCssAnimation }"
                            v-if="isArcBigEnough(arc) && mutableConfig.dataLabels.show && !FINAL_CONFIG.style.chart.layout.labels.dataLabels.showPercentage && FINAL_CONFIG.style.chart.layout.labels.dataLabels.showValue"
                            :text-anchor="calcMarkerOffsetX(arc, true).anchor"
                            :x="calcMarkerOffsetX(arc, false, FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetX).x || 0"
                            :y="calcMarkerOffsetY(arc, FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetY, FINAL_CONFIG.style.chart.layout.labels.dataLabels.offsetY)"
                            :fill="FINAL_CONFIG.style.chart.layout.labels.dataLabels.useSerieColor ? arc.color : FINAL_CONFIG.style.chart.layout.labels.dataLabels.color"
                            :font-size="FINAL_CONFIG.style.chart.layout.labels.dataLabels.fontSize"
                            :font-weight="FINAL_CONFIG.style.chart.layout.labels.dataLabels.boldValue ? 'bold': 'normal'"
                        >
                            {{ dataLabel({ p: FINAL_CONFIG.style.chart.layout.labels.dataLabels.prefix, v: arc.value, s: FINAL_CONFIG.style.chart.layout.labels.dataLabels.suffix, r: FINAL_CONFIG.style.chart.layout.labels.dataLabels.roundingValue }) }}
                        </text>
                    </g>
                </g>
            </g>

            <!-- TOOLTIP TRAPS -->
            <g v-for="(item, i) in donuts">
                <g v-for="(arc, j) in item.donut">
                    <path 
                        data-cy-donut-trap
                        :d="arc.arcSlice" 
                        :fill="selectedSerie === i ? 'rgba(0,0,0,0.1)' : 'transparent'" 
                        @mouseenter="useTooltip({
                            datapoint: arc,
                            relativeIndex: i,
                            seriesIndex: arc.seriesIndex,
                        })"
                        @click="selectDatapoint({ datapoint: arc, index: j})"
                        @mouseleave="isTooltip = false; selectedDonut = null; selectedDatapoint = null; selectedDatapointIndex = null"
                    />
                </g>
            </g>
            <slot name="svg" :svg="svg"></slot>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <Skeleton 
            v-if="!isDataset"
            :config="{
                type: 'donut',
                style: {
                    backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                    donut: {
                        color: '#CCCCCC',
                    }
                }
            }"
        />

         <!-- TOOLTIP -->
         <Tooltip
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
            :parent="nestedDonutsChart"
            :content="tooltipContent"
            :isCustom="isFunction(FINAL_CONFIG.style.chart.tooltip.customFormat)"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>

        <!-- LEGENDS -->
        <div ref="chartLegend" v-if="FINAL_CONFIG.style.chart.legend.show" :class="{ 'vue-ui-nested-donuts-legend' : legendSets.length > 1 }">
            <Legend 
                v-for="legendSet in legendSets"
                :legendSet="legendSet"
                :config="legendConfig"
                @clickMarker="({ legend }) => segregateDonut(legend)"
            >
                <template #legendTitle="{ titleSet }">
                    <div class="vue-ui-nested-donuts-legend-title" v-if="titleSet[0].arcOf">
                        {{ titleSet[0].arcOf }}
                    </div>
                </template>
                <template #item="{ legend, index }">
                    <div :data-cy="`legend-item-${index}`" @click="segregateDonut(legend)" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                    {{ legend.name }}: {{ dataLabel({p: FINAL_CONFIG.style.chart.layout.labels.dataLabels.prefix, v: legend.value, s: FINAL_CONFIG.style.chart.layout.labels.dataLabels.suffix, r: FINAL_CONFIG.style.chart.legend.roundingValue}) }}
                    <template v-if="!segregated.includes(legend.id)">
                        ({{ isNaN(legend.value / legend.total) ? '-' : dataLabel({ v: legend.value / legend.total * 100, s: '%', r: FINAL_CONFIG.style.chart.legend.roundingPercentage }) }})
                    </template>
                    <template v-else>
                        ( - % )
                    </template>
                </div>
                </template>
            </Legend>
        </div>

        <div ref="chartLegend" v-if="!FINAL_CONFIG.style.chart.legend.show">
            <slot name="legend" v-bind:legend="legendSets"></slot>
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
            }
        }">
            <template #content>
                <DataTable
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false"
                >
                    <template #th="{ th }">
                        <div v-html="th" style="display:flex;align-items:center"></div>
                    </template>
                    <template #td="{ td }">
                        {{ td.name || td }}
                    </template>
                </DataTable>
            </template>
        </Accordion>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";

.vue-ui-nested-donuts *{
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