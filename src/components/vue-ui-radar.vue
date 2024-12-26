<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount, watch } from "vue";
import {
    applyDataLabel,
    checkNaN,
    convertColorToHex, 
    convertCustomPalette, 
    createCsvContent, 
    createPolygonPath, 
    createUid, 
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    getMissingDatasetAttributes,
    isFunction,
    makePath,
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
import SparkBar from "./vue-ui-sparkbar.vue";
import Legend from "../atoms/Legend.vue";
import DataTable from "../atoms/DataTable.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import Accordion from "./vue-ui-accordion.vue";
import { useNestedProp } from "../useNestedProp";
import { usePrinter } from "../usePrinter";
import { useResponsive } from "../useResponsive";
import { useConfig } from "../useConfig";
import PackageVersion from "../atoms/PackageVersion.vue";
import PenAndPaper from "../atoms/PenAndPaper.vue";
import { useUserOptionState } from "../useUserOptionState";

const { vue_ui_radar: DEFAULT_CONFIG } = useConfig()

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
    }
});

const isDataset = computed(() => {
    return !!props.dataset && Object.keys(props.dataset).length
})

const uid = ref(createUid());
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const step = ref(0);
const radarChart = ref(null);
const chartTitle = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
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

const { userOptionsVisible, setUserOptionsVisibility, keepUserOptionState } = useUserOptionState({ config: FINAL_CONFIG.value });

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_radar[mergedConfig.theme] || props.config,
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
    userOptionsVisible.value = !FINAL_CONFIG.value.showOnChartHover;
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;
    legendStep.value += 1;
}, { deep: true });

const resizeObserver = ref(null);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiRadar',
            type: 'dataset'
        })
    }

    if (FINAL_CONFIG.value.responsive) {
        const handleResize = throttle(() => {
            const { width, height } = useResponsive({
                chart: radarChart.value,
                title: FINAL_CONFIG.value.style.chart.title.text ? chartTitle.value : null,
                legend: FINAL_CONFIG.value.style.chart.legend.show ? chartLegend.value : null,
                source: source.value,
                noTitle: noTitle.value
            });
            svg.value.width = width;
            svg.value.height = height;
        });

        resizeObserver.value = new ResizeObserver(handleResize);
        resizeObserver.value.observe(radarChart.value.parentNode);
    }
}

onMounted(() => {
    prepareChart();
});

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
});

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-radar_${uid.value}`,
    fileName: FINAL_CONFIG.value.style.chart.title.text || 'vue-ui-radar'
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

const sparkBarConfig = computed(() => {
    return {
        style: {
            backgroundColor: FINAL_CONFIG.value.style.chart.tooltip.backgroundColor,
            animation: {
                show: FINAL_CONFIG.value.style.chart.tooltip.animation.show,
                animationFrames: FINAL_CONFIG.value.style.chart.tooltip.animation.animationFrames
            },
            labels: {
                fontSize: FINAL_CONFIG.value.style.chart.tooltip.fontSize,
                name: {
                    color: FINAL_CONFIG.value.style.chart.tooltip.color
                },
            },
            gutter: {
                backgroundColor: '#CCCCCC',
                opacity: 30
            }
        }
    }
})

const svg = ref({
    height: 312,
    width: 512,
})

const emit = defineEmits(['selectLegend']);

const segregated = ref([]);
const inSegregation = ref(null);
const isAnimating = ref(false);

function segregate(index) {
    isAnimating.value = true;
    if(segregated.value.includes(index)) {
        inSegregation.value = index;
        segregated.value = segregated.value.filter(s => s !== index);
        setTimeout(() => {
            isAnimating.value = false;
            inSegregation.value = null;
        }, 500)
    }else {
        segregated.value.push(index);
        setTimeout(() => {
            isAnimating.value = false;
        }, 500)
    }
    emit('selectLegend', legendSet.value.filter((_, i) => !segregated.value.includes(i)).map(l => {
        return {
            name: l.name,
            color: l.color,
            proportion: l.totalProportion
        }
    }))
}

function getData() {
    return legendSet.value.map(l => {
        return {
            name: l.name,
            color: l.color,
            proportion: l.totalProportion
        }
    })
}

const datasetCopy = computed(() => {
    if ([null, undefined].includes(props.dataset.categories)) {
        error({
            componentName: 'VueUiRadar',
            type: 'datasetAttribute',
            property: 'categories ({ name: string; prefix?: string; suffix?: string}[])'
        });
        return []
    } else {
        if(props.dataset.categories.length === 0) {
            error({
                componentName: 'VueUiRadar',
                type: 'datasetAttributeEmpty',
                property: 'categories',
            })
        } else {
            props.dataset.categories.forEach((cat, i) => {
                getMissingDatasetAttributes({
                    datasetObject: cat,
                    requiredAttributes: ['name']
                }).forEach(attr => {
                    error({
                        componentName: 'VueUiRadar',
                        type: 'datasetAttribute',
                        property: `category.${attr} at index ${i}`,
                        index: i
                    })
                })
            })
        }
    }
    if([null, undefined].includes(props.dataset.series)) {
        error({
            componentName: 'VueUiRadar',
            type: 'datasetAttribute',
            property: 'series ({ name: string; values: number[]; color?: string; target: number}[])'
        })
    } else {
        props.dataset.series.forEach((serie, i) => {
            getMissingDatasetAttributes({
                datasetObject: serie,
                requiredAttributes: ['name', 'values', 'target']
            }).forEach(attr => {
                error({
                    componentName: 'VueUiRadar',
                    type: 'datasetSerieAttribute',
                    key: 'series',
                    property: attr,
                    index: i
                })
            })
        })
    }

    return props.dataset.categories.map((c, i) => {
        return {
            name: c.name,
            categoryId: `radar_category_${uid.value}_${i}`,
            color: convertColorToHex(c.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
            prefix: c.prefix ?? '',
            suffix: c.suffix ?? '',
        }
    });
});

const seriesCopy = computed(() => {
    if (!isDataset.value) {
        return []
    }
    return props.dataset.series
        .map((s, i) => {
            return {
                ...s,
                color: convertColorToHex(s.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
                serieId: `radar_serie_${uid.value}_${i}`,
                formatter: s.formatter || null
            }
        });
});

const max = computed(() => Math.max(...seriesCopy.value
        .flatMap(s => s.values)));

const apexes = computed(() => {
    return seriesCopy.value.length;
});

const polygonRadius = computed(() => {
    return Math.min(svg.value.width, svg.value.height) / 3
})

const outerPolygon = computed(() => {
    return createPolygonPath({
        plot: { x: svg.value.width / 2, y: svg.value.height / 2},
        radius: polygonRadius.value,
        sides: apexes.value,
        rotation: 0,
    })
});

const innerPolygons = computed(() => {
    const polygons = [];
    for (let i = 0; i < polygonRadius.value; i += (polygonRadius.value / FINAL_CONFIG.value.style.chart.layout.grid.graduations)) {
        polygons.push(i);
    }
    return polygons;
})

const radar = computed(() => {
    return outerPolygon.value.coordinates.map((c, i) => {
        const plots = seriesCopy.value[i].values.map(v => {
                return plot({
                    centerX: svg.value.width / 2,
                    centerY: svg.value.height / 2,
                    apexX: c.x,
                    apexY: c.y,
                    proportion: v / (seriesCopy.value[i].target || max.value)
                })
            });
        return {
            ...c,
            ...seriesCopy.value[i],
            plots,
        }
    })
});

function offset({x, y}) {
    let anchor = "middle";
    x = Math.round(x);
    y = Math.round(y);
    if(x > svg.value.width / 2) {
        x += 12;
        anchor="start";
    }
    if(x < svg.value.width / 2) {
        x -= 12;
        anchor="end"
    }
    if(y > svg.value.height / 2) {
        y += 20;
    }
    if(y < svg.value.height / 2) {
        y -= 12;
    }
    if(y === svg.value.height / 2) {
        y += 4
    }
    return {x, y, anchor}
}

function plot({ centerX, centerY, apexX, apexY, proportion }) {
    return {
        x: centerX + (apexX - centerX) * proportion,
        y: centerY + (apexY - centerY) * proportion
    }
}

const legendSet = computed(() => {
    const ratios = seriesCopy.value.map((s,i) => {
        return s.values.map(v => v / (s.target || max.value))
    });
    return datasetCopy.value.map((d,i) => {
        return {
            ...d,
            totalProportion: checkNaN(ratios.map(r => r[i]).reduce((a, b) => a + b, 0) / seriesCopy.value.length),
            shape: 'circle',
            opacity: segregated.value.includes(i) ? 0.5 : 1,
            segregate: () => segregate(i),
            isSegregated: segregated.value.includes(i)
        }
    })
});

const legendConfig = computed(() => {
    return {
        cy: 'radar-div-legend',
        backgroundColor: FINAL_CONFIG.value.style.chart.legend.backgroundColor,
        color: FINAL_CONFIG.value.style.chart.legend.color,
        fontSize: FINAL_CONFIG.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: FINAL_CONFIG.value.style.chart.legend.bold ? 'bold' : ''
    }
})

const dataTable = computed(() => {
    const head = [
        { name: FINAL_CONFIG.value.translations.datapoint, color: "" },
        { name: FINAL_CONFIG.value.translations.target, color: "" },
        ...legendSet.value
    ];
    const body = props.dataset.series.map(ds => {
        return [
            ds.name,
            applyDataLabel(
                ds.formatter,
                ds.target,
                dataLabel({
                    p: ds.prefix,
                    v: ds.target,
                    s: ds.suffix,
                    r: FINAL_CONFIG.value.table.td.roundingValue
                })
            ),
            ...ds.values.map((v, i) => {
                return `${applyDataLabel(
                    ds.formatter,
                    v,
                    dataLabel({p: datasetCopy.value[i].prefix, v, s: datasetCopy.value[i].suffix, r:FINAL_CONFIG.value.table.td.roundingValue})
                )} (${isNaN(v / ds.target) ? '' : dataLabel({
                    v: v / ds.target * 100,
                    s: '%',
                    r: FINAL_CONFIG.value.table.td.roundingPercentage
                })})`
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
        breakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint
    };

    return { head, body, config, colNames: head }
})

const selectedIndex = ref(null);
const sparkBarData = ref([]);

const dataTooltipSlot = ref(null);

function useTooltip(apex, i) {
    sparkBarData.value = [];
    selectedIndex.value = i;
    isTooltip.value = true;
    let html = "";

    dataTooltipSlot.value = {
        datapoint: apex,
        seriesIndex: i,
        series: {
            categories: datasetCopy.value,
            datapoints: seriesCopy.value,
            radar: radar.value
        },
        config: FINAL_CONFIG.value
    }

    const customFormat = FINAL_CONFIG.value.style.chart.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
            seriesIndex: i,
            datapoint: apex,
            series: { categories: datasetCopy.value, datapoints: seriesCopy.value, radar: radar.value  },
            config: FINAL_CONFIG.value
        }))) {
        tooltipContent.value = customFormat({
            seriesIndex: i,
            datapoint: apex,
            series: { categories: datasetCopy.value, datapoints: seriesCopy.value, radar: radar.value  },
            config: FINAL_CONFIG.value
        })
    } else {
        html += `<div style="width:100%;text-align:center;border-bottom:1px solid ${FINAL_CONFIG.value.style.chart.tooltip.borderColor};padding-bottom:6px;margin-bottom:3px;">${apex.name}</div>`;
        for(let k = 0; k < apex.values.length; k += 1) {
            if(!segregated.value.includes(k)) {
                sparkBarData.value.push({
                    name: datasetCopy.value[k].name,
                    value: apex.values[k] / apex.target * 100,
                    color: datasetCopy.value[k].color,
                    suffix: '%)',
                    prefix: `${dataLabel({p: datasetCopy.value[k].prefix ?? '',v:apex.values[k],s:datasetCopy.value[k].suffix ?? '', r:FINAL_CONFIG.value.style.chart.tooltip.roundingValue})} (`,
                    rounding: FINAL_CONFIG.value.style.chart.tooltip.roundingPercentage,
                    formatter: apex.formatter
                })
            }
        }
        tooltipContent.value = html;
    }
}

function generateCsv() {
    nextTick(() => {
        const title = [[FINAL_CONFIG.value.style.chart.title.text], [FINAL_CONFIG.value.style.chart.title.subtitle.text], [""]];
        const head = [[""],[FINAL_CONFIG.value.translations.target], ...legendSet.value.flatMap(l => [[l.name], ["%"]])];
        const body = props.dataset.series.map((s, i) => {
            return [ s.name, s.target, ...s.values.flatMap(v => {
                return [
                    v, isNaN(v / s.target) ? '' : v / s.target * 100
                ]
            })]
        });

        const tableXls = title.concat([head]).concat(body);
        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.style.chart.title.text || "vue-ui-radar"})
    });
}

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

const isAnnotator = ref(false);
function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable,
    toggleTooltip,
    toggleAnnotator
});

</script>

<template>
    <div 
        :class="`vue-ui-radar ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`"
        ref="radarChart"
        :id="`vue-ui-radar_${uid}`"
        :style="`font-family:${FINAL_CONFIG.style.fontFamily};width:100%; ${FINAL_CONFIG.responsive ? 'height: 100%;' : ''} text-align:center;background:${FINAL_CONFIG.style.chart.backgroundColor}`"
        @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)"
    >
        <PenAndPaper 
            v-if="FINAL_CONFIG.userOptions.buttons.annotator"
            :parent="radarChart"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%;background:transparent`"
        />

        <!-- TITLE AS DIV -->
        <div ref="chartTitle" v-if="FINAL_CONFIG.style.chart.title.text" :style="`width:100%;background:transparent;padding-bottom:12px`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'radar-div-title',
                        ...FINAL_CONFIG.style.chart.title
                    },
                    subtitle: {
                        cy: 'radar-div-subtitle',
                        ...FINAL_CONFIG.style.chart.title.subtitle
                    },
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.style.chart.backgroundColor"
            :color="FINAL_CONFIG.style.chart.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
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
            :chartElement="radarChart"
            :position="FINAL_CONFIG.userOptions.position"
            :hasAnnotator="FINAL_CONFIG.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleTooltip="toggleTooltip"
            @toggleAnnotator="toggleAnnotator"
            :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }"
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
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>

        <!-- CHART -->
        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${svg.width <= 0 ? 10 : svg.width} ${svg.height <= 0 ? 10 : svg.height}`" :style="`max-width:100%;overflow:visible;background:transparent;color:${FINAL_CONFIG.style.chart.color}`" >
            <PackageVersion />

            <!-- DEFS -->
            <defs>
                <radialGradient
                    cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
                    v-for="(d, i) in datasetCopy"
                    :id="`radar_gradient_${uid}_${i}`"
                >
                    <stop offset="0%" :stop-color="setOpacity(shiftHue(d.color, 0.05), FINAL_CONFIG.style.chart.layout.dataPolygon.opacity)"/>
                    <stop offset="100%" :stop-color="setOpacity(d.color, FINAL_CONFIG.style.chart.layout.dataPolygon.opacity)" />
                </radialGradient>
            </defs>

            <!-- GRID -->
            <g v-if="FINAL_CONFIG.style.chart.layout.grid.show">
                <!-- RADIAL LINES -->
                <line v-for="line in radar"
                    :x1="svg.width / 2"
                    :y1="svg.height / 2"
                    :x2="line.x"
                    :y2="line.y"
                    :stroke="FINAL_CONFIG.style.chart.layout.grid.stroke"
                    :stroke-width="FINAL_CONFIG.style.chart.layout.grid.strokeWidth"
                />
                <!-- INNER POLYGONS -->
                <g v-if="FINAL_CONFIG.style.chart.layout.grid.graduations > 0">
                    <path 
                        v-for="radius in innerPolygons"
                        :d="createPolygonPath({
                            plot: { x: svg.width / 2, y: svg.height / 2 },
                            radius: radius,
                            sides: apexes,
                            rotation: 0
                        }).path"
                        fill="none"
                        :stroke="FINAL_CONFIG.style.chart.layout.grid.stroke"
                        :stroke-width="FINAL_CONFIG.style.chart.layout.grid.strokeWidth"
                    />
                </g>
            </g>

            <!-- OUTER POLYGON -->
            <path :d="outerPolygon.path" fill="none" :stroke="FINAL_CONFIG.style.chart.layout.outerPolygon.stroke" :stroke-width="FINAL_CONFIG.style.chart.layout.outerPolygon.strokeWidth" stroke-linejoin="round" stroke-linecap="round"/>

            <!-- APEX LABELS -->
            <g v-if="FINAL_CONFIG.style.chart.layout.labels.dataLabels.show">
            <text v-for="(label, i) in radar"
                :data-cy="`radar-apex-label-${i}`"
                :x="offset(label).x"
                :y="offset(label).y"
                :text-anchor="offset(label).anchor"
                :font-size="FINAL_CONFIG.style.chart.layout.labels.dataLabels.fontSize"
                :fill="FINAL_CONFIG.style.chart.layout.labels.dataLabels.color"
                @mouseenter="useTooltip(label, i)"
                @mouseleave="isTooltip = false; selectedIndex = null"
            >
                {{ label.name }}
            </text>
            </g>

            <!-- PLOTS -->
            <g v-for="(d, i) in datasetCopy">
                <g>
                    <polygon
                        data-cy-radar-path
                        :points="makePath(radar.map(r => r.plots[i]), false, true)"
                        :stroke="FINAL_CONFIG.style.chart.backgroundColor"
                        :stroke-width="FINAL_CONFIG.style.chart.layout.dataPolygon.strokeWidth + 1"
                        fill="none"
                        v-if="FINAL_CONFIG.useCssAnimation || (!FINAL_CONFIG.useCssAnimation && !segregated.includes(i))"
                        :class="{ 'animated-out': segregated.includes(i) && FINAL_CONFIG.useCssAnimation, 'animated-in': isAnimating && inSegregation === i && FINAL_CONFIG.useCssAnimation }"
                    />
                    <polygon
                        data-cy-radar-path
                        :points="makePath(radar.map(r => r.plots[i]), false, true)"
                        :stroke="d.color"
                        :stroke-width="FINAL_CONFIG.style.chart.layout.dataPolygon.strokeWidth"
                        v-if="FINAL_CONFIG.useCssAnimation || (!FINAL_CONFIG.useCssAnimation && !segregated.includes(i))"
                        :fill="FINAL_CONFIG.style.chart.layout.dataPolygon.transparent ? 'transparent' : FINAL_CONFIG.style.chart.layout.dataPolygon.useGradient ? `url(#radar_gradient_${uid}_${i})` : setOpacity(d.color, FINAL_CONFIG.style.chart.layout.dataPolygon.opacity)"
                        :class="{ 'animated-out': segregated.includes(i) && FINAL_CONFIG.useCssAnimation, 'animated-in': isAnimating && inSegregation === i && FINAL_CONFIG.useCssAnimation }"
                    />
                </g>
            </g>
            
            <g v-if="FINAL_CONFIG.style.chart.layout.plots.show">
                <g v-for="(category, i) in radar">
                    <circle 
                        v-for="(p, j) in category.plots"
                        :cx="p.x"
                        :cy="p.y"
                        :fill="segregated.includes(j) ? 'transparent' : datasetCopy[j].color"
                        :r="selectedIndex !== null && selectedIndex === i ? FINAL_CONFIG.style.chart.layout.plots.radius * 1.6 : FINAL_CONFIG.style.chart.layout.plots.radius"
                        :stroke="segregated.includes(j) ? 'transparent' : FINAL_CONFIG.style.chart.backgroundColor"
                        :stroke-width="0.5"
                        :class="{ 'animated-out': segregated.includes(j) && FINAL_CONFIG.useCssAnimation, 'animated-in': isAnimating && inSegregation === j && FINAL_CONFIG.useCssAnimation }"
                    />
                </g>
            </g>
            <slot name="svg" :svg="svg"/>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'radar',
                style: {
                    backgroundColor: FINAL_CONFIG.style.chart.backgroundColor,
                    radar: {
                        grid: {
                            color: FINAL_CONFIG.style.chart.layout.outerPolygon.stroke
                        },
                        shapes: {
                            color: FINAL_CONFIG.style.chart.layout.outerPolygon.stroke
                        }
                    }
                }
            }"
        />

        <!-- LEGEND -->
        <div ref="chartLegend">
            <Legend
                v-if="FINAL_CONFIG.style.chart.legend.show"
                :key="`legend_${legendStep}`"
                :legendSet="legendSet"
                :config="legendConfig"
                @clickMarker="({i}) => segregate(i)"
            >
                <template #item="{ legend, index }">
                    <div data-cy-legend-item @click="legend.segregate()" :style="`opacity:${segregated.includes(index) ? 0.5 : 1}`">
                        {{ legend.name }}: {{ 
                            dataLabel({
                                v: legend.totalProportion * 100,
                                s: '%',
                                r: FINAL_CONFIG.style.chart.legend.roundingPercentage
                            })
                        }}
                    </div>
                </template>
            </Legend>
            <slot v-else name="legend" v-bind:legend="legendSet"></slot>
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>


        <!-- TOOLTIP -->
        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.style.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.style.chart.tooltip.color"
            :borderRadius="FINAL_CONFIG.style.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.style.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.style.chart.tooltip.borderWidth"
            :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"
            :fontSize="FINAL_CONFIG.style.chart.tooltip.fontSize"
            :position="FINAL_CONFIG.style.chart.tooltip.position"
            :offsetY="FINAL_CONFIG.style.chart.tooltip.offsetY"
            :parent="radarChart"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="FINAL_CONFIG.style.chart.tooltip.customFormat && typeof FINAL_CONFIG.style.chart.tooltip.customFormat === 'function'"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <div style="max-width: 200px;margin:0 auto" v-if="!['function'].includes(typeof FINAL_CONFIG.style.chart.tooltip.customFormat)">
                    <SparkBar :dataset="sparkBarData" :config="sparkBarConfig" :backgroundOpacity="FINAL_CONFIG.style.chart.tooltip.backgroundOpacity"/>
                </div>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
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
                <DataTable
                    :key="`table_${tableStep}`"
                    :colNames="dataTable.colNames"
                    :head="dataTable.head"
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${FINAL_CONFIG.style.chart.title.text}${FINAL_CONFIG.style.chart.title.subtitle.text ? ` : ${FINAL_CONFIG.style.chart.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false"
                >
                    <template #th="{ th }">
                        {{ th.name }}
                    </template>
                    <template #td="{ td }">
                        {{ td }}
                    </template>
                </DataTable>
            </template>
        </Accordion>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";
.vue-ui-radar *{
    transition: unset;
}

path, line, rect, circle {
    animation: xyAnimation 0.5s ease-in-out !important;
    transform-origin: center;
}
@keyframes xyAnimation {
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
.vue-ui-radar {
    user-select: none;
    position: relative;
}
.vue-ui-radar .vue-ui-radar-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}

polygon {
    transform-origin: center;
}

.animated-in {
    animation: animatedIn 0.3s cubic-bezier(0, 1.01, 1, 1) forwards;
}

@keyframes animatedIn {
    0% {
        transform: scale(0, 0);
    }
    80% {
        transform: scale(1.05, 1.05);
    }
    100% {
        transform: scale(1, 1);
    }
}

.animated-out {
    animation: animatedOut 0.3s cubic-bezier(0, 1.01, 1, 1) forwards;
}

@keyframes animatedOut {
    from {
        transform: scale(1, 1);
    }
    to {
        transform: scale(0, 0);
    }
}

</style>