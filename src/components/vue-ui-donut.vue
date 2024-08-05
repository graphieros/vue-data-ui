<script setup>
import { ref, computed, nextTick, onMounted, watch } from "vue";
import { 
    calcMarkerOffsetX, 
    calcMarkerOffsetY, 
    calcNutArrowPath, 
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
    makeDonut,
    objectIsEmpty, 
    opacity, 
    palette,
    themePalettes,
    XMLNS
} from '../lib';
import mainConfig from "../default_configs.json";
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

onMounted(() => {
    if(objectIsEmpty(props.dataset)) {
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
})

const uid = ref(createUid());

const defaultConfig = ref(mainConfig.vue_ui_donut);

const donutChart = ref(null);
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const selectedSerie = ref(null);
const step = ref(0);

const donutConfig = computed(() => {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
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
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `donut__${uid.value}`,
    fileName: donutConfig.value.style.chart.title.text || 'vue-ui-donut'
});

const customPalette = computed(() => {
    return convertCustomPalette(donutConfig.value.customPalette);
});

const mutableConfig = ref({
    dataLabels: {
        show: donutConfig.value.style.chart.layout.labels.dataLabels.show,
    },
    showTable: donutConfig.value.table.show,
});

const svg = computed(() => {
    const height = isPrinting.value ? 512: 360;
    return {
        height,
        width: 512
    }
});

const emit = defineEmits(['selectLegend', 'selectDatapoint'])


const immutableSet = computed(() => {
    return props.dataset
        .map((serie, i) => {
            return {
                name: serie.name,
                color: convertColorToHex(serie.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
                value: serie.values.reduce((a,b) => a + b, 0),
                absoluteValues: serie.values,
            }
        })
});

const mutableSet = ref(immutableSet.value)

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
const rafUp = ref(null);
const rafDown = ref(null);
const isAnimating = ref(false);

function segregate(index) {
    const target = immutableSet.value.find((_, idx) => idx === index)
    const source = mutableSet.value.find((_, idx) => idx === index)
    let initVal = source.value;
    if(segregated.value.includes(index)) {
        segregated.value = segregated.value.filter(s => s !== index);
        const targetVal = target.value;
        function animUp() {
            if(initVal > targetVal) {
                cancelAnimationFrame(rafUp.value);
                mutableSet.value = mutableSet.value.map((ds, i) => {
                    if(index === i) {
                        return {
                            ...ds,
                            value: targetVal
                        }
                    } else {
                        return ds
                    }
                });
                isAnimating.value = false;
            } else {
                isAnimating.value = true;
                initVal += (targetVal * 0.025);
                mutableSet.value = mutableSet.value.map((ds, i) => {
                    if((index === i)) {
                        return {
                            ...ds,
                            value: initVal
                        }
                    } else {
                        return ds
                    }
                })
                rafUp.value = requestAnimationFrame(animUp)
            }
        }
        animUp()
    } else if (segregated.value.length < immutableSet.value.length - 1) {
        function animDown() {
            if(initVal < 0.1) {
                cancelAnimationFrame(rafDown.value);
                segregated.value.push(index);
                mutableSet.value = mutableSet.value.map((ds, i) => {
                    if(index === i) {
                        return {
                            ...ds,
                            value: 0,
                        }
                    } else {
                        return ds
                    }
                });
                isAnimating.value = false;
            } else {
                isAnimating.value = true;
                initVal /= 1.1;
                mutableSet.value = mutableSet.value.map((ds, i) => {
                    if(index === i) {
                        return {
                            ...ds,
                            value: initVal
                        }
                    } else {
                        return ds
                    }
                })
                rafDown.value = requestAnimationFrame(animDown)
            }
        }
        animDown()
    }
    emit('selectLegend', donutSet.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color,
            value: ds.value
        }
    }));
}

const donutSet = computed(() => {
    mutableSet.value.forEach((ds, i) => {
        if([null, undefined].includes(ds.values)) {
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
});

const legendSet = computed(() => {
    return props.dataset
        .map((serie, i) => {
            return {
                name: serie.name,
                color: convertColorToHex(serie.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
                value: (serie.values || []).reduce((a,b) => a + b, 0),
                shape: 'circle',
            }
        })
        .map((el, i) => {
            return {
                ...el,
                proportion: el.value / props.dataset.map(m => (m.values || []).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0),
                opacity: segregated.value.includes(i) ? 0.5 : 1,
                segregate: () => segregate(i),
                isSegregated: segregated.value.includes(i)
            }
        })
});

const legendConfig = computed(() => {
    return {
        cy: 'donut-div-legend',
        backgroundColor: donutConfig.value.style.chart.legend.backgroundColor,
        color: donutConfig.value.style.chart.legend.color,
        fontSize: donutConfig.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: donutConfig.value.style.chart.legend.bold ? 'bold' : ''
    }
})

const currentDonut = computed(() => {
    return makeDonut({ series: donutSet.value }, svg.value.width / 2, svg.value.height / 2, 130, 130, 1.99999, 2, 1, 360, 105.25, donutConfig.value.style.chart.layout.donut.strokeWidth)
});

function isArcBigEnough(arc) {
    return arc.proportion * 100 > donutConfig.value.style.chart.layout.labels.dataLabels.hideUnderValue;
}

function displayArcPercentage(arc, stepBreakdown) {
    return isNaN(arc.value / sumValues(stepBreakdown)) ? 0 : ((arc.value / sumValues(stepBreakdown)) * 100).toFixed(0) + "%";
}

function sumValues(source) {
    return [...source].map(s => s.value).reduce((a, b) => a + b, 0);
}

const total = computed(() => {
    return donutSet.value.map(s => s.value).reduce((a,b) => a + b, 0);
});

const average = computed(() => {
    return total.value / donutSet.value.length;
});

const dataTooltipSlot = ref(null);

function useTooltip({datapoint, relativeIndex, seriesIndex, show = false}) {
    dataTooltipSlot.value = { datapoint, seriesIndex, config: donutConfig.value, series: immutableSet.value};
    isTooltip.value = show;
    selectedSerie.value = relativeIndex;
    let html = "";

    const customFormat = donutConfig.value.style.chart.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
        seriesIndex,
        datapoint,
        series: immutableSet.value,
        config: donutConfig.value
    }))) {
        tooltipContent.value = customFormat({
            seriesIndex,
            datapoint,
            series: immutableSet.value,
            config: donutConfig.value
        })
    } else {
        html += `<div data-cy="donut-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid ${donutConfig.value.style.chart.tooltip.borderColor};padding-bottom:6px;margin-bottom:3px;">${datapoint.name}</div>`;
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

        tooltipContent.value = `<div>${html}</div>`;
    }
}

function getBlurFilter(index) {
    if (donutConfig.value.useBlurOnHover && ![null, undefined].includes(selectedSerie.value) && selectedSerie.value !== index) {
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

function generateCsv() {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [isNaN(table.value.body[i] / total.value) ? '-' : table.value.body[i] / total.value * 100]]
        });
        const tableXls = [[donutConfig.value.style.chart.title.text],[donutConfig.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: donutConfig.value.style.chart.title.text || "vue-ui-donut" })
    });
}

const dataTable = computed(() => {
    const head = [
        ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`, dataLabel({p: donutConfig.value.style.chart.layout.labels.dataLabels.prefix, v: total.value, s: donutConfig.value.style.chart.layout.labels.dataLabels.suffix, r: donutConfig.value.table.td.roundingValue}),
        '100%'
    ];

    const body = table.value.head.map((h,i) => {
        const label = dataLabel({p: donutConfig.value.style.chart.layout.labels.dataLabels.prefix, v: table.value.body[i], s: donutConfig.value.style.chart.layout.labels.dataLabels.suffix, r: donutConfig.value.table.td.roundingValue});
        return [
            {
                color: h.color,
                name: h.name
            },
            label,
            isNaN(table.value.body[i] / total.value) ? "-" : (table.value.body[i] / total.value * 100).toFixed(donutConfig.value.table.td.roundingPercentage) + '%'
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

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const isSafari = computed(() => {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
})

function dashLabel(num) {
    return num.toFixed(donutConfig.value.style.chart.legend.roundingPercentage).split('').map(el => '-').join('')
}

function selectDatapoint(datapoint, index) {
    emit('selectDatapoint', { datapoint, index })
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleLabels() {
    mutableConfig.value.dataLabels.show = !mutableConfig.value.dataLabels.show;
}

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleLabels,
});

</script>

<template>
    <div ref="donutChart" :class="`vue-ui-donut ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${donutConfig.useCssAnimation ? '' : 'vue-ui-dna'}`" :style="`font-family:${donutConfig.style.fontFamily};width:100%; text-align:center;${!donutConfig.style.chart.title.text ? 'padding-top:36px' : ''};background:${donutConfig.style.chart.backgroundColor}`" :id="`donut__${uid}`">
        
        <slot name="userConfig"></slot>
        
        <div v-if="donutConfig.style.chart.title.text" :style="`width:100%;background:${donutConfig.style.chart.backgroundColor};padding-bottom:24px`">
            <!-- TITLE AS DIV -->
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
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="donutConfig.userOptions.show && isDataset"
            :backgroundColor="donutConfig.style.chart.backgroundColor"
            :color="donutConfig.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            hasImg
            hasTable
            hasLabel
            hasFullscreen
            :isFullscreen="isFullscreen"
            :chartElement="donutChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleLabels="toggleLabels"
        />



        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" data-cy="donut-svg" :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%; overflow: visible; background:${donutConfig.style.chart.backgroundColor};color:${donutConfig.style.chart.color}`">
            
            <!-- DEFS -->
            <defs>
                <radialGradient :id="`gradient_${uid}`" v-if="donutConfig.style.chart.useGradient">
                    <stop offset="0%" :stop-color="`${convertColorToHex(donutConfig.style.chart.backgroundColor)}00`" />
                    <stop offset="77%" :stop-color="'#FFFFFF' + opacity[donutConfig.style.chart.gradientIntensity]" />
                    <stop offset="100%" :stop-color="`${convertColorToHex(donutConfig.style.chart.backgroundColor)}00`" />
                </radialGradient>
            </defs>

            <!-- LABEL CONNECTOR -->
            <defs>
                <filter :id="`blur_${uid}`" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" :stdDeviation="2" :id="`blur_std_${uid}`" />
                    <feColorMatrix type="saturate" values="0" />
                </filter>

                <filter :id="`shadow_${uid}`" color-interpolation-filters="sRGB">
                    <feDropShadow dx="0" dy="0" stdDeviation="10" flood-opacity="0.5" :flood-color="donutConfig.style.chart.layout.donut.shadowColor" />
                </filter>
            </defs>

            <g v-for="(arc, i) in currentDonut">
                <path
                    v-if="isArcBigEnough(arc) && mutableConfig.dataLabels.show"
                    :d="calcNutArrowPath(arc, {x: svg.width / 2, y: svg.height / 2}, 16, 16, false, false, defaultConfig.style.chart.layout.donut.strokeWidth)"
                    :stroke="arc.color"
                    stroke-width="1"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    fill="none"
                    :filter="getBlurFilter(i)"
                />
            </g>
            
            <circle
                :cx="svg.width / 2"
                :cy="svg.height / 2"
                :r="130"
                :fill="donutConfig.style.chart.backgroundColor"
                :filter="donutConfig.style.chart.layout.donut.useShadow ? `url(#shadow_${uid})`: ''"
            />

            <path 
                v-for="(arc, i) in currentDonut"
                :stroke="donutConfig.style.chart.backgroundColor"
                :d="arc.arcSlice"
                fill="#FFFFFF"
            />
            <path 
                v-for="(arc, i) in currentDonut"
                class="vue-ui-donut-arc-path"
                :data-cy="`donut-arc-${i}`"
                :d="arc.arcSlice" 
                :fill="`${arc.color}CC`"
                :stroke="donutConfig.style.chart.backgroundColor"
                :stroke-width="donutConfig.style.chart.layout.donut.borderWidth"
                :filter="getBlurFilter(i)"
            />

            <!-- HOLLOW -->
            <circle
                data-cy="donut-gradient-hollow"
                v-if="donutConfig.style.chart.useGradient"
                :cx="svg.width / 2"
                :cy="svg.height / 2"
                :r="136"
                :fill="`url(#gradient_${uid})`"
            />

            <!-- TOOLTIP TRAPS -->
            <path 
                v-for="(arc, i) in currentDonut"
                :data-cy="`donut-trap-${i}`"
                data-cy-donut-trap
                :d="arc.arcSlice" 
                :fill="selectedSerie === i ? 'rgba(0,0,0,0.1)' : 'transparent'" 
                @mouseenter="useTooltip({
                    datapoint: arc,
                    relativeIndex: i,
                    seriesIndex: arc.seriesIndex,
                    show: true
                })"
                @mouseleave="isTooltip = false; selectedSerie = null"
                @click="selectDatapoint(arc, i)"
            />

            <circle
                v-if="donutConfig.style.chart.layout.labels.hollow.show"
                :cx="svg.width / 2" 
                :cy="svg.height / 2" 
                :r="svg.width - 400 - donutConfig.style.chart.layout.donut.strokeWidth / 2"
                :fill="donutConfig.style.chart.backgroundColor"/>

            <!-- HOLLOW LABELS -->
            <text 
                v-if="donutConfig.style.chart.layout.labels.hollow.total.show"
                text-anchor="middle"
                :x="svg.width / 2"
                :y="svg.height / 2 - (donutConfig.style.chart.layout.labels.hollow.average.show ? donutConfig.style.chart.layout.labels.hollow.total.fontSize : 0) + donutConfig.style.chart.layout.labels.hollow.total.offsetY"
                :fill="donutConfig.style.chart.layout.labels.hollow.total.color"
                :font-size="donutConfig.style.chart.layout.labels.hollow.total.fontSize"
                :style="`font-weight:${donutConfig.style.chart.layout.labels.hollow.total.bold ? 'bold': ''}`"
            >
                {{ donutConfig.style.chart.layout.labels.hollow.total.text }}
            </text>
            <text 
                v-if="donutConfig.style.chart.layout.labels.hollow.total.show"
                text-anchor="middle"
                :x="svg.width / 2"
                :y="svg.height / 2 + donutConfig.style.chart.layout.labels.hollow.total.fontSize - (donutConfig.style.chart.layout.labels.hollow.average.show ? donutConfig.style.chart.layout.labels.hollow.total.fontSize : 0) + donutConfig.style.chart.layout.labels.hollow.total.value.offsetY"
                :fill="donutConfig.style.chart.layout.labels.hollow.total.value.color"
                :font-size="donutConfig.style.chart.layout.labels.hollow.total.value.fontSize"
                :style="`font-weight:${donutConfig.style.chart.layout.labels.hollow.total.value.bold ? 'bold': ''}`"
            >
                {{ dataLabel({
                    p: donutConfig.style.chart.layout.labels.hollow.total.value.prefix, 
                    v: total, 
                    s: donutConfig.style.chart.layout.labels.hollow.total.value.suffix
                }) }}
            </text>

            <text 
                v-if="donutConfig.style.chart.layout.labels.hollow.average.show"
                text-anchor="middle"
                :x="svg.width / 2"
                :y="svg.height / 2 + (donutConfig.style.chart.layout.labels.hollow.total.show ? donutConfig.style.chart.layout.labels.hollow.average.fontSize : 0) + donutConfig.style.chart.layout.labels.hollow.average.offsetY"
                :fill="donutConfig.style.chart.layout.labels.hollow.average.color"
                :font-size="donutConfig.style.chart.layout.labels.hollow.average.fontSize"
                :style="`font-weight:${donutConfig.style.chart.layout.labels.hollow.average.bold ? 'bold': ''}`"
            >
                {{ donutConfig.style.chart.layout.labels.hollow.average.text }}
            </text>
            <text 
                v-if="donutConfig.style.chart.layout.labels.hollow.average.show"
                text-anchor="middle"
                :x="svg.width / 2"
                :y="svg.height / 2 + (donutConfig.style.chart.layout.labels.hollow.total.show ? donutConfig.style.chart.layout.labels.hollow.average.fontSize : 0) + donutConfig.style.chart.layout.labels.hollow.average.fontSize + donutConfig.style.chart.layout.labels.hollow.average.value.offsetY"
                :fill="donutConfig.style.chart.layout.labels.hollow.average.value.color"
                :font-size="donutConfig.style.chart.layout.labels.hollow.average.value.fontSize"
                :style="`font-weight:${donutConfig.style.chart.layout.labels.hollow.average.value.bold ? 'bold': ''}`"
            >
                {{ isAnimating ? '--' : dataLabel({
                    p: donutConfig.style.chart.layout.labels.hollow.average.value.prefix,
                    v: average,
                    s: donutConfig.style.chart.layout.labels.hollow.average.value.suffix,
                    r: donutConfig.style.chart.layout.labels.hollow.average.value.rounding
                }) }}
            </text>

            <!-- DATALABELS -->
            <g v-for="(arc, i) in currentDonut" :filter="getBlurFilter(i)" :class="{ 'animated': donutConfig.useCssAnimation}">
                <g v-if="donutConfig.style.chart.layout.labels.dataLabels.useLabelSlots">
                    <foreignObject
                        :x="calcMarkerOffsetX(arc, true).anchor === 'end' ? calcMarkerOffsetX(arc).x - 120 : calcMarkerOffsetX(arc, true).anchor === 'middle' ? calcMarkerOffsetX(arc).x - 60 : calcMarkerOffsetX(arc).x"
                        :y="calcMarkerOffsetY(arc) - (isSafari ? 20 : 0)"
                        width="120"
                        height="60"
                        style="overflow: visible;"
                    >
                        <div :class="{'vue-ui-donut-datalabel-slot': true, 'vue-ui-donut-datalabel-slot-not-safari' : !isSafari}">
                            <slot name="dataLabel" v-bind="{
                                datapoint: arc, 
                                isBlur: !defaultConfig.useBlurOnHover || [null, undefined].includes(selectedSerie) || selectedSerie === i,
                                isSafari: isSafari,
                                isVisible: isArcBigEnough(arc) && mutableConfig.dataLabels.show,
                                textAlign: calcMarkerOffsetX(arc, true, 16, true).anchor,
                                flexAlign: calcMarkerOffsetX(arc, true, 16).anchor,
                                percentage: displayArcPercentage(arc, currentDonut),
                            }"/>
                        </div>
                    </foreignObject>
                </g>

                <g v-else>
                    <circle
                        v-if="isArcBigEnough(arc) && mutableConfig.dataLabels.show"
                        :cx="calcMarkerOffsetX(arc).x"
                        :cy="calcMarkerOffsetY(arc) - 3.5"
                        :fill="arc.color"
                        :r="3"
                        :filter="!defaultConfig.useBlurOnHover || [null, undefined].includes(selectedSerie) || selectedSerie === i ? ``: `url(#blur_${uid})`"
                        @click="selectDatapoint(arc, i)"
                    />
                    <text
                        :data-cy="`donut-datalabel-value-${i}`"
                        v-if="isArcBigEnough(arc) && mutableConfig.dataLabels.show"
                        :text-anchor="calcMarkerOffsetX(arc, true, 12).anchor"
                        :x="calcMarkerOffsetX(arc, true, 12).x"
                        :y="calcMarkerOffsetY(arc)"
                        :fill="donutConfig.style.chart.layout.labels.percentage.color"
                        :font-size="donutConfig.style.chart.layout.labels.percentage.fontSize"
                        :style="`font-weight:${donutConfig.style.chart.layout.labels.percentage.bold ? 'bold': ''}`"
                        @click="selectDatapoint(arc, i)"
                    >
                        {{ displayArcPercentage(arc, currentDonut)  }} {{ donutConfig.style.chart.layout.labels.value.show ? `(${dataLabel({p: donutConfig.style.chart.layout.labels.dataLabels.prefix, v: arc.value, s: donutConfig.style.chart.layout.labels.dataLabels.suffix, rounding: donutConfig.style.chart.layout.labels.value.rounding})})` : '' }}
                    </text>
                    <text
                        :data-cy="`donut-datalabel-name-${i}`"
                        v-if="isArcBigEnough(arc, true, 12) && mutableConfig.dataLabels.show"
                        :text-anchor="calcMarkerOffsetX(arc).anchor"
                        :x="calcMarkerOffsetX(arc, true, 12).x"
                        :y="calcMarkerOffsetY(arc) + donutConfig.style.chart.layout.labels.percentage.fontSize"
                        :fill="donutConfig.style.chart.layout.labels.name.color"
                        :font-size="donutConfig.style.chart.layout.labels.name.fontSize"
                        :style="`font-weight:${donutConfig.style.chart.layout.labels.name.bold ? 'bold': ''}`"
                        @click="selectDatapoint(arc, i)"
                    >
                        {{ arc.name }}
                    </text>
                </g>
            </g>
            <slot name="svg" :svg="svg"/>
        </svg>

        <Skeleton 
            v-if="!isDataset"
            :config="{
                type: 'donut',
                style: {
                    backgroundColor: donutConfig.style.chart.backgroundColor,
                    donut: {
                        color: '#CCCCCC',
                        strokeWidth: donutConfig.style.chart.layout.donut.strokeWidth * 0.8
                    }
                }
            }"
        />

        <Legend
            v-if="donutConfig.style.chart.legend.show"
            :legendSet="legendSet"
            :config="legendConfig"
            @clickMarker="({i}) => segregate(i)"
        >
            <template #item="{ legend, index }">
                <div :data-cy="`legend-item-${index}`" @click="legend.segregate()" :style="`opacity:${segregated.includes(index) ? 0.5 : 1}`">
                    {{ legend.name }} : {{ dataLabel({p: donutConfig.style.chart.layout.labels.dataLabels.prefix, v: legend.value, s: donutConfig.style.chart.layout.labels.dataLabels.suffix, r: donutConfig.style.chart.legend.roundingValue}) }}
                    <span v-if="!segregated.includes(index)" style="font-variant-numeric: tabular-nums;">
                        ({{ isNaN(legend.value / total) ? '-' : dataLabel({
                            v: isAnimating ? legend.proportion * 100 : legend.value / total * 100,
                            s: '%',
                            r: donutConfig.style.chart.legend.roundingPercentage
                        })}})
                    </span>
                    <span v-else>
                        ( {{ dashLabel(legend.proportion * 100) }} % )
                    </span>
                </div>
            </template>
        </Legend>

        <slot name="legend" v-bind:legend="legendSet" />

        <!-- TOOLTIP -->
        <Tooltip
            :show="donutConfig.style.chart.tooltip.show && isTooltip"
            :backgroundColor="donutConfig.style.chart.tooltip.backgroundColor"
            :color="donutConfig.style.chart.tooltip.color"
            :fontSize="donutConfig.style.chart.tooltip.fontSize"
            :borderRadius="donutConfig.style.chart.tooltip.borderRadius"
            :borderColor="donutConfig.style.chart.tooltip.borderColor"
            :borderWidth="donutConfig.style.chart.tooltip.borderWidth"
            :parent="donutChart"
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

        <!-- DATA TABLE -->
        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: donutConfig.style.chart.backgroundColor,
                color: donutConfig.style.chart.color
            },
            head: {
                backgroundColor: donutConfig.style.chart.backgroundColor,
                color: donutConfig.style.chart.color
            }
        }">
            <template #content>            
                <DataTable
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${donutConfig.style.chart.title.text}${donutConfig.style.chart.title.subtitle.text ? ` : ${donutConfig.style.chart.title.subtitle.text}` : ''}`"
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
.vue-ui-donut *{
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
.vue-ui-donut .vue-ui-donut-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}

.vue-ui-donut-datalabel-slot {
    width: 100%;
    height: -webkit-fit-content;
    height: fit-content;
}

.vue-ui-donut-datalabel-slot-not-safari {
    position: absolute;
    top:0;
    transform: translateY(-50%);
}

</style>