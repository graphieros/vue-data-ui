<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import { 
    convertColorToHex, 
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
    opacity, 
    palette, 
    shiftHue, 
} from "../lib";
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
import { useNestedProp } from "../useNestedProp";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Tooltip from "../atoms/Tooltip.vue";
import SparkBar from "./vue-ui-sparkbar.vue";
import Legend from "../atoms/Legend.vue";
import DataTable from "../atoms/DataTable.vue";
import Skeleton from "./vue-ui-skeleton.vue";

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

onMounted(() => {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiRadar',
            type: 'dataset'
        })
    }
})

const uid = ref(createUid());

const defaultConfig = ref(mainConfig.vue_ui_radar);

const isImaging = ref(false);
const isPrinting = ref(false);
const radarChart = ref(null);
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const step = ref(0);

const radarConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const mutableConfig = ref({
    dataLabels: {
        show: radarConfig.value.style.chart.layout.labels.dataLabels.show,
    },
    inside: !radarConfig.value.style.chart.layout.useDiv,
    showTable: radarConfig.value.table.show
});

const sparkBarConfig = computed(() => {
    return {
        style: {
            backgroundColor: radarConfig.value.style.chart.tooltip.backgroundColor,
            animation: {
                show: radarConfig.value.style.chart.tooltip.animation.show,
                animationFrames: radarConfig.value.style.chart.tooltip.animation.animationFrames
            },
            labels: {
                fontSize: radarConfig.value.style.chart.tooltip.fontSize,
                name: {
                    color: radarConfig.value.style.chart.tooltip.color
                },
            },
            gutter: {
                backgroundColor: '#CCCCCC',
                opacity: 30
            }
        }
    }
})

const svg = computed(() => {
    const height = mutableConfig.value.inside ? 412 : 312;
    return {
        height,
        width: 512,
    }
});

const emit = defineEmits(['selectLegend']);

const segregated = ref([]);

function segregate(index) {
    if(segregated.value.includes(index)) {
        segregated.value = segregated.value.filter(s => s !== index);
    }else {
        segregated.value.push(index);
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
            color: convertColorToHex(c.color) || palette[i] || palette[i % palette.length],
            prefix: c.prefix ?? '',
            suffix: c.suffix ?? ''
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
                color: convertColorToHex(s.color) || palette[i] || palette[i % palette.length],
                serieId: `radar_serie_${uid.value}_${i}`
            }
        });
});

const max = computed(() => Math.max(...seriesCopy.value
        .flatMap(s => s.values)));

const apexes = computed(() => {
    return seriesCopy.value.length;
});

const outerPolygon = computed(() => {
    return createPolygonPath({
        plot: { x: 256, y: svg.value.height / 2},
        radius: 128,
        sides: apexes.value,
        rotation: 0,
    })
});

const innerPolygons = computed(() => {
    const polygons = [];
    for (let i = 0; i < 128; i += (128 / radarConfig.value.style.chart.layout.grid.graduations)) {
         polygons.push(i)
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
            totalProportion: ratios.map(r => r[i]).reduce((a, b) => a + b, 0) / seriesCopy.value.length,
            shape: 'circle',
            opacity: segregated.value.includes(i) ? 0.5 : 1

        }
    })
});

const legendConfig = computed(() => {
    return {
        cy: 'radar-div-legend',
        backgroundColor: radarConfig.value.style.chart.legend.backgroundColor,
        color: radarConfig.value.style.chart.legend.color,
        fontSize: radarConfig.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: radarConfig.value.style.chart.legend.bold ? 'bold' : ''
    }
})

const table = computed(() => {
    const head = [{ name:"", color:""}, {name:radarConfig.value.translations.target, color:""}, ...legendSet.value];
    const body = props.dataset.series.map((s, i) => {
        return [ s.name, s.target, ...s.values.flatMap(v => {
            return [
                v ? v.toFixed(radarConfig.value.table.td.roundingValue) : '-', isNaN(v / s.target) ? '' : (v / s.target * 100).toFixed(radarConfig.value.table.td.roundingPercentage) + '%'
            ]
        })]
    });
    return { head, body };
});

const dataTable = computed(() => {
    const head = [
        { name: radarConfig.value.translations.datapoint, color: "" },
        { name: radarConfig.value.translations.target, color: "" },
        ...legendSet.value
    ];
    const body = props.dataset.series.map(ds => {
        return [
            ds.name,
            ds.target,
            ...ds.values.map((v, i) => {
                return `${dataLabel({p: datasetCopy.value[i].prefix, v, s: datasetCopy.value[i].suffix, r:radarConfig.value.table.td.roundingValue})} (${isNaN(v / ds.target) ? '' : (v / ds.target * 100).toFixed(radarConfig.value.table.td.roundingPercentage)}%)`
            })
        ]
    });
    const config = {
        th: {
            backgroundColor: radarConfig.value.table.th.backgroundColor,
            color: radarConfig.value.table.th.color,
            outline: radarConfig.value.table.th.outline
        },
        td: {
            backgroundColor: radarConfig.value.table.td.backgroundColor,
            color: radarConfig.value.table.td.color,
            outline: radarConfig.value.table.td.outline
        },
        breakpoint: radarConfig.value.table.responsiveBreakpoint
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
        config: radarConfig.value
    }

    const customFormat = radarConfig.value.style.chart.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
            seriesIndex: i,
            datapoint: apex,
            series: { categories: datasetCopy.value, datapoints: seriesCopy.value, radar: radar.value  },
            config: radarConfig.value
        }))) {
        tooltipContent.value = customFormat({
            seriesIndex: i,
            datapoint: apex,
            series: { categories: datasetCopy.value, datapoints: seriesCopy.value, radar: radar.value  },
            config: radarConfig.value
        })
    } else {
        html += `<div style="width:100%;text-align:center;border-bottom:1px solid #ccc;padding-bottom:6px;margin-bottom:3px;">${apex.name}</div>`;
        for(let k = 0; k < apex.values.length; k += 1) {
            if(!segregated.value.includes(k)) {
                sparkBarData.value.push({
                    name: datasetCopy.value[k].name,
                    value: apex.values[k] / apex.target * 100,
                    color: datasetCopy.value[k].color,
                    suffix: '%)',
                    prefix: `${dataLabel({p: datasetCopy.value[k].prefix ?? '',v:apex.values[k],s:datasetCopy.value[k].suffix ?? '', r:radarConfig.value.style.chart.tooltip.roundingValue})} (`,
                    rounding: radarConfig.value.style.chart.tooltip.roundingPercentage
                })
            }
        }
        tooltipContent.value = html;
    }

}

const __to__ = ref(null);

function showSpinnerPdf() {
    isPrinting.value = true;
}

function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(`vue-ui-radar_${uid.value}`),
            fileName: radarConfig.value.style.chart.title.text || 'vue-ui-radar'
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
            domElement: document.getElementById(`vue-ui-radar_${uid.value}`),
            fileName: radarConfig.value.style.chart.title.text || 'vue-ui-radar',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

function generateCsv() {
    nextTick(() => {
        const title = [[radarConfig.value.style.chart.title.text], [radarConfig.value.style.chart.title.subtitle.text], [""]];
        const head = [[""],[radarConfig.value.translations.target], ...legendSet.value.flatMap(l => [[l.name], ["%"]])];
        const body = props.dataset.series.map((s, i) => {
            return [ s.name, s.target, ...s.values.flatMap(v => {
                return [
                    v, isNaN(v / s.target) ? '' : v / s.target * 100
                ]
            })]
        });

        const tableXls = title.concat([head]).concat(body);
        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: radarConfig.value.style.chart.title.text || "vue-ui-radar"})
    });
}

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage
});

</script>

<template>
    <div 
        :class="`vue-ui-radar ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${radarConfig.useCssAnimation ? '' : 'vue-ui-dna'}`"
        ref="radarChart"
        :id="`vue-ui-radar_${uid}`"
        :style="`font-family:${radarConfig.style.fontFamily};width:100%; text-align:center;${!radarConfig.style.chart.title.text ? 'padding-top:36px' : ''};background:${radarConfig.style.chart.backgroundColor}`"
    >
        <!-- TITLE AS DIV -->
        <div v-if="(!mutableConfig.inside || isPrinting) && radarConfig.style.chart.title.text" :style="`width:100%;background:${radarConfig.style.chart.backgroundColor};padding-bottom:12px`">
            <Title
                :config="{
                    title: {
                        cy: 'radar-div-title',
                        text: radarConfig.style.chart.title.text,
                        color: radarConfig.style.chart.title.color,
                        fontSize: radarConfig.style.chart.title.fontSize,
                        bold: radarConfig.style.chart.title.bold
                    },
                    subtitle: {
                        cy: 'radar-div-subtitle',
                        text: radarConfig.style.chart.title.subtitle.text,
                        color: radarConfig.style.chart.title.subtitle.color,
                        fontSize: radarConfig.style.chart.title.subtitle.fontSize,
                        bold: radarConfig.style.chart.title.subtitle.bold
                    },
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="radarConfig.userOptions.show && isDataset"
            :backgroundColor="radarConfig.style.chart.backgroundColor"
            :color="radarConfig.style.chart.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :title="radarConfig.userOptions.title"
            :uid="uid"
            :hasImg="true"
            hasTable
            hasFullscreen
            :isFullscreen="isFullscreen"
            :chartElement="radarChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="mutableConfig.showTable = !mutableConfig.showTable"
        />

        <!-- CHART -->
        <svg v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%;overflow:visible;background:${radarConfig.style.chart.backgroundColor};color:${radarConfig.style.chart.color}`" >

            <!-- DEFS -->
            <defs>
                <radialGradient
                    cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
                    v-for="(d, i) in datasetCopy"
                    :id="`radar_gradient_${uid}_${i}`"
                >
                    <stop offset="0%" :stop-color="`${shiftHue(d.color, 0.05)}${opacity[radarConfig.style.chart.layout.dataPolygon.opacity]}`"/>
                    <stop offset="100%" :stop-color="d.color + opacity[radarConfig.style.chart.layout.dataPolygon.opacity]" />
                </radialGradient>
            </defs>

            <!-- TITLE AS G -->
            <g v-if="radarConfig.style.chart.title.text && mutableConfig.inside && !isPrinting">
                <text
                    data-cy="radar-text-title"
                    :font-size="radarConfig.style.chart.title.fontSize"
                    :fill="radarConfig.style.chart.title.color"
                    :x="svg.width / 2"
                    :y="radarConfig.style.chart.title.fontSize"
                    text-anchor="middle"
                    :style="`font-weight:${radarConfig.style.chart.title.bold ? 'bold' : ''}`"
                >
                    {{ radarConfig.style.chart.title.text }}
                </text>
                <text
                    data-cy="radar-text-subtitle"
                    v-if="radarConfig.style.chart.title.subtitle.text"
                    :font-size="radarConfig.style.chart.title.subtitle.fontSize"
                    :fill="radarConfig.style.chart.title.subtitle.color"
                    :x="svg.width / 2"
                    :y="radarConfig.style.chart.title.fontSize * 2"
                    text-anchor="middle"
                    :style="`font-weight:${radarConfig.style.chart.title.subtitle.bold ? 'bold' : ''}`"
                >
                    {{ radarConfig.style.chart.title.subtitle.text }}
                </text>
            </g>

            <!-- GRID -->
            <g v-if="radarConfig.style.chart.layout.grid.show">
                <!-- RADIAL LINES -->
                <line v-for="line in radar"
                    :x1="svg.width / 2"
                    :y1="svg.height / 2"
                    :x2="line.x"
                    :y2="line.y"
                    :stroke="radarConfig.style.chart.layout.grid.stroke"
                    :stroke-width="radarConfig.style.chart.layout.grid.strokeWidth"
                />
                <!-- INNER POLYGONS -->
                <g v-if="radarConfig.style.chart.layout.grid.graduations > 0">
                    <path 
                        v-for="radius in innerPolygons"
                        :d="createPolygonPath({
                            plot: { x: 256, y: svg.height / 2 },
                            radius: radius,
                            sides: apexes,
                            rotation: 0
                        }).path"
                        fill="none"
                        :stroke="radarConfig.style.chart.layout.grid.stroke"
                        :stroke-width="radarConfig.style.chart.layout.grid.strokeWidth"
                    />
                </g>
            </g>

            <!-- OUTER POLYGON -->
            <path :d="outerPolygon.path" fill="none" :stroke="radarConfig.style.chart.layout.outerPolygon.stroke" :stroke-width="radarConfig.style.chart.layout.outerPolygon.strokeWidth" stroke-linejoin="round" stroke-linecap="round"/>

            <!-- APEX LABELS -->
            <g v-if="radarConfig.style.chart.layout.labels.dataLabels.show">
            <text v-for="(label, i) in radar"
                :data-cy="`radar-apex-label-${i}`"
                :x="offset(label).x"
                :y="offset(label).y"
                :text-anchor="offset(label).anchor"
                :font-size="radarConfig.style.chart.layout.labels.dataLabels.fontSize"
                :fill="radarConfig.style.chart.layout.labels.dataLabels.color"
                @mouseenter="useTooltip(label, i)"
                @mouseleave="isTooltip = false; selectedIndex = null"
            >
                {{ label.name }}
            </text>
            </g>

            <!-- PLOTS -->
            <g v-for="(d, i) in datasetCopy">
                <g v-if="!segregated.includes(i)">
                    <path
                        data-cy-radar-path
                        :d="makePath(radar.map(r => r.plots[i]))"
                        :stroke="d.color"
                        :stroke-width="radarConfig.style.chart.layout.dataPolygon.strokeWidth"
                        :fill="radarConfig.style.chart.layout.dataPolygon.transparent ? 'transparent' : radarConfig.style.chart.layout.dataPolygon.useGradient ? `url(#radar_gradient_${uid}_${i})` : d.color + opacity[radarConfig.style.chart.layout.dataPolygon.opacity]"
                    />
                </g>
            </g>
            
            <g v-if="radarConfig.style.chart.layout.plots.show">
                <g v-for="(category, i) in radar">
                    <circle 
                        v-for="(p, j) in category.plots"
                        :cx="p.x"
                        :cy="p.y"
                        :fill="segregated.includes(j) ? 'transparent' : datasetCopy[j].color"
                        :r="selectedIndex !== null && selectedIndex === i ? radarConfig.style.chart.layout.plots.radius * 1.6 : radarConfig.style.chart.layout.plots.radius"
                    />
                </g>
            </g>

            <!-- LEGEND AS G -->
            <foreignObject
                v-if="radarConfig.style.chart.legend.show && mutableConfig.inside && !isPrinting"
                :x="0"
                :y="340"
                width="100%"
                height="60"
                style="overflow: visible;"
            >
                <Legend
                    :legendSet="legendSet"
                    :config="legendConfig"
                    @clickMarker="({i}) => segregate(i)"
                >
                    <template #item="{ legend, index }">
                        <div @click="segregate(index)" :style="`opacity:${segregated.includes(index) ? 0.5 : 1}`">
                            {{ legend.name }} : {{ (legend.totalProportion * 100).toFixed(radarConfig.style.chart.legend.roundingPercentage) }}%
                        </div>
                    </template>
                </Legend>
            </foreignObject>
            <slot name="svg" :svg="svg"/>
        </svg>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'radar',
                style: {
                    backgroundColor: radarConfig.style.chart.backgroundColor,
                    radar: {
                        grid: {
                            color: radarConfig.style.chart.layout.outerPolygon.stroke
                        },
                        shapes: {
                            color: radarConfig.style.chart.layout.outerPolygon.stroke
                        }
                    }
                }
            }"
        />

        <!-- LEGEND AS DIV -->
        <Legend
            v-if="radarConfig.style.chart.legend.show && (!mutableConfig.inside || isPrinting)"
            :legendSet="legendSet"
            :config="legendConfig"
            @clickMarker="({i}) => segregate(i)"
        >
            <template #item="{ legend, index }">
                <div data-cy-legend-item @click="segregate(index)" :style="`opacity:${segregated.includes(index) ? 0.5 : 1}`">
                    {{ legend.name }} : {{ (legend.totalProportion * 100).toFixed(radarConfig.style.chart.legend.roundingPercentage) }}%
                </div>
            </template>
        </Legend>

        <slot name="legend" v-bind:legend="legendSet"></slot>

        <!-- TOOLTIP -->
        <Tooltip
            :show="radarConfig.style.chart.tooltip.show && isTooltip"
            :backgroundColor="radarConfig.style.chart.tooltip.backgroundColor"
            :color="radarConfig.style.chart.tooltip.color"
            :parent="radarChart"
            :content="tooltipContent"
            :isCustom="radarConfig.style.chart.tooltip.customFormat && typeof radarConfig.style.chart.tooltip.customFormat === 'function'"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <template #tooltip-after>
                <div style="max-width: 200px;margin:0 auto">
                    <SparkBar :dataset="sparkBarData" :config="sparkBarConfig"/>
                </div>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>

        <!-- DATA TABLE -->
        <div  class="vue-ui-radar-table" :style="`width:100%;margin-top:${mutableConfig.inside ? '48px' : ''}`" v-if="mutableConfig.showTable && isDataset">
            <DataTable
                :colNames="dataTable.colNames"
                :head="dataTable.head"
                :body="dataTable.body"
                :config="dataTable.config"
                :title="`${radarConfig.style.chart.title.text}${radarConfig.style.chart.title.subtitle.text ? ` : ${radarConfig.style.chart.title.subtitle.text}` : ''}`"
            >
                <template #th="{ th }">
                    {{ th.name }}
                </template>
                <template #td="{ td }">
                    {{ td }}
                </template>
            </DataTable>
        </div>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";
.vue-ui-radar *{
    transition: unset;
}

path, line, rect, circle {
    animation: xyAnimation 0.5s ease-in-out;
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
</style>