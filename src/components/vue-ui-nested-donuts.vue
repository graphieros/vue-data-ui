<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import {
    abbreviate,
    calcMarkerOffsetX, 
    calcMarkerOffsetY, 
    convertColorToHex, 
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
    XMLNS 
} from '../lib';
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
import Title from "../atoms/Title.vue";
import { useNestedProp } from "../useNestedProp";
import UserOptions from "../atoms/UserOptions.vue";
import DataTable from "../atoms/DataTable.vue";
import Tooltip from "../atoms/Tooltip.vue";
import Legend from "../atoms/Legend.vue";
import Skeleton from "./vue-ui-skeleton.vue";

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

onMounted(() => {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiNestedDonuts',
            type: 'dataset'
        })
    }
});

const uid = ref(createUid());
const defaultConfig = ref(mainConfig.vue_ui_nested_donuts);
const isPrinting = ref(false);
const isImaging = ref(false);
const nestedDonutsChart = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref('');
const selectedSerie = ref(null);
const step = ref(0);

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const donutConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    })
});

const mutableConfig = ref({
    dataLabels: {
        show: donutConfig.value.style.chart.layout.labels.dataLabels.show,
    },
    showTable: donutConfig.value.table.show,
});

const svg = computed(() => {
    return {
        height: 512,
        width: 512
    }
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
                    color: convertColorToHex(serie.color) || palette[j] || palette[i % palette.length],
                    value: (serie.values || []).reduce((a, b) => a + b, 0),
                    absoluteValues: serie.values || []
                }
            })
        }
    })
});

const donutSize = computed(() => donutConfig.value.style.chart.layout.donut.strokeWidth)

const md = computed(() => {
    return [...immutableDataset.value].map((ds, i) => {
        const sizeRatio = i * donutSize.value / immutableDataset.value.length;

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
    })
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
const rafUp = ref(null);
const rafDown = ref(null);

function segregateDonut(item) {
    emit('selectLegend', item);
    const target = immutableDataset.value.flatMap(d => d.series).find(el => el.id === item.id);
    const source = mutableDataset.value.flatMap(d => d.series).find(el => el.id === item.id).value;
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
                donutSize.value / immutableDataset.value.length * donutConfig.value.style.chart.layout.donut.spacingRatio
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
                donutSize.value / immutableDataset.value.length * donutConfig.value.style.chart.layout.donut.spacingRatio
            )[0]
        }
    })
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
        config: donutConfig.value
    }

    const customFormat = donutConfig.value.style.chart.tooltip.customFormat;

    if(isFunction(customFormat) && functionReturnsString(() => customFormat({
        seriesIndex,
        datapoint,
        series: mutableDataset.value,
        config: donutConfig.value
    }))) {
        tooltipContent.value = customFormat({
            seriesIndex,
            datapoint,
            series: mutableDataset.value,
            config: donutConfig.value
        })
    } else {
        let html = "";

        if (donutConfig.value.style.chart.tooltip.showAllItemsAtIndex && segregated.value.length === 0 ) {
            const itemsAtIndex = mutableDataset.value.map(ds => {
                return ds.series.find((s) => s.seriesIndex === seriesIndex)
            });

            itemsAtIndex.forEach((item, i) => {
                if(!item) return ''
                html += `
                    <div style="display:flex; flex-direction: column; justify-content:flex-start; align-items:flex-start;padding:6px 0; ${i < itemsAtIndex.length -1 ? 'border-bottom:1px solid #e1e5e8' : ''}">
                        <div style="display:flex; flex-direction: row; gap: 3px; justify-content:flex-start; align-items:center;">
                            <svg viewBox="0 0 20 20" height="${donutConfig.value.style.chart.tooltip.fontSize}" width="${donutConfig.value.style.chart.tooltip.fontSize}">
                                <circle cx="10" cy="10" r="10" fill="${item.color}"/>
                            </svg>
                            <span>
                                ${item.arcOf ?? ''} - ${item.name}
                            </span>
                        </div>
                        <span>
                            ${donutConfig.value.style.chart.tooltip.showValue ? `<b>${ dataLabel({p: donutConfig.value.style.chart.layout.labels.dataLabels.prefix, v: datapoint.value, s: donutConfig.value.style.chart.layout.labels.dataLabels.suffix, r: donutConfig.value.style.chart.tooltip.roundingValue})}</b>` : ''}
                            ${donutConfig.value.style.chart.tooltip.showPercentage ? `(${dataLabel({ v: item.proportion * 100, s: '%', r: donutConfig.value.style.chart.tooltip.roundingPercentage })})` : ''}
                        </span>
                    </div>
                `;
            })
        } else {
            html += `<div data-cy="donut-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid #ccc;padding-bottom:6px;margin-bottom:3px;">${datapoint.arcOf ?? ''} - ${datapoint.name}</div>`;

            html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><circle data-cy="donut-tooltip-marker" cx="6" cy="6" r="6" stroke="none" fill="${datapoint.color}"/></svg>`;

                if(donutConfig.value.style.chart.tooltip.showValue) {
                    html += `<b data-cy="donut-tooltip-value">${ dataLabel({p: donutConfig.value.style.chart.layout.labels.dataLabels.prefix, v: datapoint.value, s: donutConfig.value.style.chart.layout.labels.dataLabels.suffix, r: donutConfig.value.style.chart.tooltip.roundingValue})}</b>`;
                }

                if(donutConfig.value.style.chart.tooltip.showPercentage) {
                    if(!donutConfig.value.style.chart.tooltip.showValue) {
                        html += `<b>${(datapoint.proportion * 100).toFixed(donutConfig.value.style.chart.tooltip.roundingPercentage)}%</b></div>`;
                    } else {
                        html += `<span>(${(datapoint.proportion * 100).toFixed(donutConfig.value.style.chart.tooltip.roundingPercentage)}%)</span></div>`;
                    }
                }
        }
        tooltipContent.value = `<div style="font-size:${donutConfig.value.style.chart.tooltip.fontSize}px">${html}</div>`;
    }
    isTooltip.value = true;
}

function isArcBigEnough(arc) {
    return arc.proportion * 100 > donutConfig.value.style.chart.layout.labels.dataLabels.hideUnderValue;
}

function getBlurFilter(arc, index) {
    if (!donutConfig.value.useBlurOnHover) {
        return '';
    }
    if (donutConfig.value.style.chart.tooltip.showAllItemsAtIndex && segregated.value.length === 0) {
        if ([null, undefined].includes(selectedDatapointIndex.value) || selectedDatapointIndex.value === index) {
            return ''
        } else {
            return `url(#blur_${uid.value})`;
        }
    }
    if (!donutConfig.value.style.chart.tooltip.showAllItemsAtIndex || segregated.value.length) {
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
    })
})

const legendConfig = computed(() => {
    return {
        cy: 'nested-donuts-legend',
        backgroundColor: donutConfig.value.style.chart.legend.backgroundColor,
        color: donutConfig.value.style.chart.legend.color,
        fontSize: donutConfig.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: donutConfig.value.style.chart.legend.bold ? 'bold' : ''
    }
})

const __to__ = ref(null);
function showSpinnerPdf() {
    isPrinting.value = true;
}
function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(`nested_donuts_${uid.value}`),
            fileName: donutConfig.value.style.chart.title.text || 'vue-ui-nested-donuts'
        }).finally(() => {
            isPrinting.value = false;
        });
    }, 100)
}

function showSpinnerImage() {
    isImaging.value = true;
}

function generateImage() {
    showSpinnerImage();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        img({
            domElement: document.getElementById(`nested_donuts_${uid.value}`),
            fileName: donutConfig.value.style.chart.title.text || 'vue-ui-nested-donuts',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

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
        const tableXls = [[donutConfig.value.style.chart.title.text],[donutConfig.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: donutConfig.value.style.chart.title.text || "vue-ui-nested-donuts" })
    });
}

const dataTable = computed(() => {
    const head = [
        donutConfig.value.table.columnNames.series,
        donutConfig.value.table.columnNames.value,
        donutConfig.value.table.columnNames.percentage,
    ];

    const body = table.value.head.map((h,i) => {
        const label = dataLabel({p: donutConfig.value.style.chart.layout.labels.dataLabels.prefix, v: table.value.body[i], s: donutConfig.value.style.chart.layout.labels.dataLabels.suffix, r: donutConfig.value.table.td.roundingValue});
        return [
            {
                color: h.color,
                name: h.name
            },
            label,
            isNaN(table.value.body[i] / h.total) ? "-" : (table.value.body[i] / h.total * 100).toFixed(donutConfig.value.table.td.roundingPercentage) + '%'
        ]
    });

    const config = {
        th: {
            backgroundColor: donutConfig.value.table.th.backgroundColor,
            color: donutConfig.value.table.th.color,
            outline: donutConfig.value.table.th.outline
        },
        td: {
            backgroundColor: donutConfig.value.table.td.backgroundColor,
            color: donutConfig.value.table.td.color,
            outline: donutConfig.value.table.td.outline
        },
        breakpoint: donutConfig.value.table.responsiveBreakpoint
    }

    const colNames = [
        donutConfig.value.table.columnNames.series,
        donutConfig.value.table.columnNames.value,
        donutConfig.value.table.columnNames.percentage
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

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage
})

</script>

<template>
    <div ref="nestedDonutsChart" :class="`vue-ui-nested-donuts ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${donutConfig.useCssAnimation ? '' : 'vue-ui-dna'}`" :style="`font-family:${donutConfig.style.fontFamily};width:100%; text-align:center;${(!donutConfig.style.chart.title.text && donutConfig.userOptions.show) ? 'padding-top:36px' : ''};background:${donutConfig.style.chart.backgroundColor}`" :id="`nested_donuts_${uid}`">
        <Title
            :config="{
                title: {
                    cy: 'donut-div-title',
                    text: donutConfig.style.chart.title.text,
                    color: donutConfig.style.chart.title.color,
                    fontSize: donutConfig.style.chart.title.fontSize,
                    bold: donutConfig.style.chart.title.bold
                },
                subtitle: {
                    cy: 'donut-div-subtitle',
                    text: donutConfig.style.chart.title.subtitle.text,
                    color: donutConfig.style.chart.title.subtitle.color,
                    fontSize: donutConfig.style.chart.title.subtitle.fontSize,
                    bold: donutConfig.style.chart.title.subtitle.bold
                }
            }"
        />

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="donutConfig.userOptions.show && isDataset"
            :backgroundColor="donutConfig.style.chart.backgroundColor"
            :color="donutConfig.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :title="donutConfig.userOptions.title"
            :uid="uid"
            hasImg
            hasTable
            hasLabel
            hasFullscreen
            :isFullscreen="isFullscreen"
            :chartElement="nestedDonutsChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="mutableConfig.showTable = !mutableConfig.showTable"
            @toggleLabels="mutableConfig.dataLabels.show = !mutableConfig.dataLabels.show"
        />

        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%; overflow: visible; background:${donutConfig.style.chart.backgroundColor};color:${donutConfig.style.chart.color}`">
            <!-- NESTED DONUTS -->
            <g v-for="(item, i) in donuts">
                <g v-for="(arc, j) in item.donut">
                    <path
                        class="vue-ui-donut-arc-path"
                        :d="arc.arcSlice" 
                        :fill="`${arc.color}CC`"
                        :stroke="donutConfig.style.chart.backgroundColor"
                        :stroke-width="donutConfig.style.chart.layout.donut.borderWidth"
                        :filter="getBlurFilter(arc, j)"
                    />
                </g>
            </g>

            <!-- GRADIENTS -->
            <defs>
                <radialGradient v-for="(gradient, i) in gradientSets" :id="`radial_${uid}_${i}`" cx="50%" cy="50%" r="50%" :fr="30 - (1 * (i+1)) + '%'">
                    <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
                    <stop :offset="70 - (20 * i) + '%'" stop-color="#FFFFFF" :stop-opacity="donutConfig.style.chart.gradientIntensity / 100"/>
                    <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
                </radialGradient>
            </defs>

            <defs>
                <filter :id="`blur_${uid}`" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" :stdDeviation="2" :id="`blur_std_${uid}`" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>
            </defs>

            <g v-if="donutConfig.style.chart.useGradient">
                <g v-for="(gradient, i) in gradientSets">
                    <path
                        :d="gradient.donut.arcSlice"
                        :fill="`url(#radial_${uid}_${i})`"
                        stroke="transparent"
                        stroke-width="0"
                    />
                </g>
            </g>

            <g v-if="donutConfig.style.chart.layout.labels.dataLabels.showDonutName">
                <g v-for="(item, i) in donuts">
                    <g v-for="(arc, j) in item.donut">    
                        <text
                            :class="{ 'animated': donutConfig.useCssAnimation }"
                            v-if="j === 0"
                            :x="svg.width / 2"
                            :y="arc.startY - donutConfig.style.chart.layout.labels.dataLabels.fontSize + donutConfig.style.chart.layout.labels.dataLabels.donutNameOffsetY"
                            text-anchor="middle"
                            :font-size="donutConfig.style.chart.layout.labels.dataLabels.fontSize"
                            :font-weight="donutConfig.style.chart.layout.labels.dataLabels.boldDonutName ? 'bold': 'normal'"
                            :fill="donutConfig.style.chart.layout.labels.dataLabels.color"
                        >
                            {{ donutConfig.style.chart.layout.labels.dataLabels.donutNameAbbreviation ? abbreviate({ source: item.name, length: donutConfig.style.chart.layout.labels.dataLabels.donutNameMaxAbbreviationSize }) : item.name }}
                        </text>
                    </g>
                </g>
            </g>

            <!-- DATALABELS -->
            <g v-if="donutConfig.style.chart.layout.labels.dataLabels.show">
                <g v-for="(item, i) in donuts">
                    <g v-for="(arc, j) in item.donut" :filter="getBlurFilter(arc, j)">
                        <text
                            :class="{ 'animated': donutConfig.useCssAnimation }"
                            v-if="isArcBigEnough(arc) && mutableConfig.dataLabels.show && donutConfig.style.chart.layout.labels.dataLabels.showPercentage"
                            :text-anchor="calcMarkerOffsetX(arc, true).anchor"
                            :x="calcMarkerOffsetX(arc, false, donutConfig.style.chart.layout.labels.dataLabels.offsetX).x"
                            :y="calcMarkerOffsetY(arc, donutConfig.style.chart.layout.labels.dataLabels.offsetY, donutConfig.style.chart.layout.labels.dataLabels.offsetY)"
                            :fill="donutConfig.style.chart.layout.labels.dataLabels.useSerieColor ? arc.color : donutConfig.style.chart.layout.labels.dataLabels.color"
                            :font-size="donutConfig.style.chart.layout.labels.dataLabels.fontSize"
                            :font-weight="donutConfig.style.chart.layout.labels.dataLabels.boldPercentage ? 'bold': 'normal'"
                        >
                            {{ dataLabel({ v: arc.proportion * 100, s: '%', r: donutConfig.style.chart.layout.labels.dataLabels.roundingPercentage }) }}
                        </text>
                        <text
                            :class="{ 'animated': donutConfig.useCssAnimation }"
                            v-if="isArcBigEnough(arc) && mutableConfig.dataLabels.show && donutConfig.style.chart.layout.labels.dataLabels.showPercentage && donutConfig.style.chart.layout.labels.dataLabels.showValue"
                            :text-anchor="calcMarkerOffsetX(arc, true).anchor"
                            :x="calcMarkerOffsetX(arc, false, donutConfig.style.chart.layout.labels.dataLabels.offsetX).x"
                            :y="calcMarkerOffsetY(arc, donutConfig.style.chart.layout.labels.dataLabels.offsetY, donutConfig.style.chart.layout.labels.dataLabels.offsetY) + donutConfig.style.chart.layout.labels.dataLabels.fontSize"
                            :fill="donutConfig.style.chart.layout.labels.dataLabels.useSerieColor ? arc.color : donutConfig.style.chart.layout.labels.dataLabels.color"
                            :font-size="donutConfig.style.chart.layout.labels.dataLabels.fontSize"
                            :font-weight="donutConfig.style.chart.layout.labels.dataLabels.boldValue ? 'bold': 'normal'"
                        >
                            ({{ dataLabel({ p: donutConfig.style.chart.layout.labels.dataLabels.prefix, v: arc.value, s: donutConfig.style.chart.layout.labels.dataLabels.suffix, r: donutConfig.style.chart.layout.labels.dataLabels.roundingValue }) }})
                        </text>
                        <text
                            :class="{ 'animated': donutConfig.useCssAnimation }"
                            v-if="isArcBigEnough(arc) && mutableConfig.dataLabels.show && !donutConfig.style.chart.layout.labels.dataLabels.showPercentage && donutConfig.style.chart.layout.labels.dataLabels.showValue"
                            :text-anchor="calcMarkerOffsetX(arc, true).anchor"
                            :x="calcMarkerOffsetX(arc, false, donutConfig.style.chart.layout.labels.dataLabels.offsetX).x"
                            :y="calcMarkerOffsetY(arc, donutConfig.style.chart.layout.labels.dataLabels.offsetY, donutConfig.style.chart.layout.labels.dataLabels.offsetY)"
                            :fill="donutConfig.style.chart.layout.labels.dataLabels.useSerieColor ? arc.color : donutConfig.style.chart.layout.labels.dataLabels.color"
                            :font-size="donutConfig.style.chart.layout.labels.dataLabels.fontSize"
                            :font-weight="donutConfig.style.chart.layout.labels.dataLabels.boldValue ? 'bold': 'normal'"
                        >
                            {{ dataLabel({ p: donutConfig.style.chart.layout.labels.dataLabels.prefix, v: arc.value, s: donutConfig.style.chart.layout.labels.dataLabels.suffix, r: donutConfig.style.chart.layout.labels.dataLabels.roundingValue }) }}
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

        <Skeleton 
            v-if="!isDataset"
            :config="{
                type: 'donut',
                style: {
                    backgroundColor: donutConfig.style.chart.backgroundColor,
                    donut: {
                        color: '#CCCCCC',
                    }
                }
            }"
        />

         <!-- TOOLTIP -->
         <Tooltip
            :show="donutConfig.style.chart.tooltip.show && isTooltip"
            :backgroundColor="donutConfig.style.chart.tooltip.backgroundColor"
            :color="donutConfig.style.chart.tooltip.color"
            :parent="nestedDonutsChart"
            :content="tooltipContent"
            :isCustom="isFunction(donutConfig.style.chart.tooltip.customFormat)"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>

        <!-- LEGENDS -->
        <div v-if="donutConfig.style.chart.legend.show" :class="{ 'vue-ui-nested-donuts-legend' : legendSets.length > 1 }">
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
                    {{ legend.name }} : {{ dataLabel({p: donutConfig.style.chart.layout.labels.dataLabels.prefix, v: legend.value, s: donutConfig.style.chart.layout.labels.dataLabels.suffix, r: donutConfig.style.chart.legend.roundingValue}) }}
                    <template v-if="!segregated.includes(legend.id)">
                        ({{ isNaN(legend.value / legend.total) ? '-' : dataLabel({ v: legend.value / legend.total * 100, s: '%', r: donutConfig.style.chart.legend.roundingPercentage }) }})
                    </template>
                    <template v-else>
                        ( - % )
                    </template>
                </div>
                </template>
            </Legend>
        </div>

        <slot name="legend" v-bind:legend="legendSets"></slot>

        <!-- DATA TABLE -->
        <DataTable
            v-if="mutableConfig.showTable && isDataset"
            :colNames="dataTable.colNames"
            :head="dataTable.head" 
            :body="dataTable.body"
            :config="dataTable.config"
            :title="`${donutConfig.style.chart.title.text}${donutConfig.style.chart.title.subtitle.text ? ` : ${donutConfig.style.chart.title.subtitle.text}` : ''}`"
        >
            <template #th="{ th }">
                <div v-html="th" style="display:flex;align-items:center"></div>
            </template>
            <template #td="{ td }">
                {{ td.name || td }}
            </template>
        </DataTable>
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