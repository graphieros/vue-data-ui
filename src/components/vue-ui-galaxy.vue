<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import {
    convertColorToHex,
    convertCustomPalette,
    createCsvContent,
    createSpiralPath,
    createUid,
    dataLabel,
    downloadCsv,
    error,
    functionReturnsString,
    getMissingDatasetAttributes,
    isFunction,
    objectIsEmpty, 
    palette,
    themePalettes,
    XMLNS
} from "../lib";
import mainConfig from "../default_configs.json";
import themes from "../themes.json";
import { useNestedProp } from "../useNestedProp";
import Legend from "../atoms/Legend.vue";
import Title from "../atoms/Title.vue";
import Tooltip from "../atoms/Tooltip.vue";
import DataTable from "../atoms/DataTable.vue";
import UserOptions from "../atoms/UserOptions.vue";
import pdf from "../pdf";
import img from "../img";
import Skeleton from "./vue-ui-skeleton.vue";
import Accordion from "./vue-ui-accordion.vue";

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
    return !!props.dataset && props.dataset.length;
});

onMounted(() => {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiGalaxy',
            type: 'dataset'
        })
    } else {
        props.dataset.forEach((ds, i) => {
            getMissingDatasetAttributes({
                datasetObject: ds,
                requiredAttributes: ['name', 'values']
            }).forEach(attr => {
                error({
                    componentName: 'VueUiGalaxy',
                    type: 'datasetSerieAttribute',
                    property: attr,
                    index: i
                })
            })
        })
    }
});

const uid = ref(createUid());

const defaultConfig = ref(mainConfig.vue_ui_galaxy);

const isPrinting = ref(false);
const isImaging = ref(false);
const galaxyChart = ref(null);
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const selectedSerie = ref(null);
const step = ref(0);

const galaxyConfig = computed(() => {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_galaxy[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || palette
        }
    } else {
        return mergedConfig;
    }
});

const customPalette = computed(() => {
    return convertCustomPalette(galaxyConfig.value.customPalette);
})

const mutableConfig = ref({
    dataLabels: {
        show: galaxyConfig.value.style.chart.layout.labels.dataLabels.show,
    },
    showTable: galaxyConfig.value.table.show,
});

const innerGradientIntensity = computed(() => {
    return `${galaxyConfig.value.style.chart.layout.arcs.gradient.intensity}%`;
})

const svg = ref({
    height: 180, // or 250 if non fibo
    width: 250
})

const emit = defineEmits(['selectLegend', 'selectDatapoint'])

const segregated = ref([]);

function segregate(datapoint) {
    if(segregated.value.includes(datapoint.id)) {
        segregated.value = segregated.value.filter(s => s !== datapoint.id);
    }else {
        segregated.value.push(datapoint.id);
    }
    emit('selectLegend', galaxySet.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color,
            value: ds.value
        }
    }));
}

const immutableSet = computed(() => {
    return props.dataset
        .map((serie, i) => {
            return {
                name: serie.name,
                color: convertColorToHex(serie.color) || customPalette.value[i] || palette[i] || palette[i % palette.length],
                value: serie.values ? serie.values.reduce((a,b) => a + b, 0) : 0,
                absoluteValues: serie.values || [0],
                id: createUid(),
                seriesIndex: i
            }
        })
        .sort((a,b) => b.value - a.value)
});

function getData() {
    return immutableSet.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color,
            value: ds.value
        }
    });
}

const total = computed(() => {
    return immutableSet.value.filter((ds) => !segregated.value.includes(ds.id)).map(ds => ds.value).reduce((a, b) => a + b, 0);
});

const maxPath = ref(190);

const segregatedSet = computed(() => {
    return immutableSet.value.filter(ds => !segregated.value.includes(ds.id))
})

const galaxySet = computed(() => {

    const res = [];
    let start = 0;
    for(let i = 0; i < segregatedSet.value.length; i += 1) {
        const serie = segregatedSet.value[i];
        let points = ((serie.value / total.value) * maxPath.value);
        if (i > 0 && res.length) {
            points += res[i-1].points
        }
        start += points;

        res.push({
            points,
            ...serie,
            seriesIndex: i,
            proportion: serie.value / total.value,
            path: createSpiralPath({
                points: points,
                startX: 115 + galaxyConfig.value.style.chart.layout.arcs.offsetX,
                startY: 90 + galaxyConfig.value.style.chart.layout.arcs.offsetY
            })
        })
    }

    return res        
        .filter((_, i) => !segregated.value.includes(_.id))
        .toSorted((a,b) => b.points - a.points)
});

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

const dataTooltipSlot = ref(null);

function useTooltip({ datapoint, _relativeIndex, seriesIndex, show=false }) {

    dataTooltipSlot.value = {
        datapoint,
        seriesIndex,
        series: immutableSet.value,
        config: galaxyConfig.value
    }

    isTooltip.value = show;
    selectedSerie.value = datapoint.id;
    let html = "";
    const customFormat = galaxyConfig.value.style.chart.tooltip.customFormat;

    if(isFunction(customFormat) && functionReturnsString(() => customFormat({
        seriesIndex,
        datapoint,
        series: immutableSet.value,
        config: galaxyConfig.value
    }))) {
        tooltipContent.value = customFormat({
            seriesIndex,
            datapoint,
            series: immutableSet.value,
            config: galaxyConfig.value
        })
    } else {
        html += `<div data-cy="galaxy-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid ${galaxyConfig.value.style.chart.tooltip.borderColor};padding-bottom:6px;margin-bottom:3px;">${datapoint.name}</div>`;
        html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><circle data-cy="galaxy-tooltip-marker" cx="6" cy="6" r="6" stroke="none" fill="${datapoint.color}"/></svg>`;

        if(galaxyConfig.value.style.chart.tooltip.showValue) {
            html += `<b data-cy="galaxy-tooltip-value">${ dataLabel({p: galaxyConfig.value.style.chart.layout.labels.dataLabels.prefix, v: datapoint.value, s: galaxyConfig.value.style.chart.layout.labels.dataLabels.suffix, r: galaxyConfig.value.style.chart.tooltip.roundingValue})}</b>`;
        }

        if(galaxyConfig.value.style.chart.tooltip.showPercentage) {
            if(!galaxyConfig.value.style.chart.tooltip.showValue) {
                html += `<b>${(datapoint.proportion * 100).toFixed(galaxyConfig.value.style.chart.tooltip.roundingPercentage)}%</b></div>`;
            } else {
                html += `<span>(${(datapoint.proportion * 100).toFixed(galaxyConfig.value.style.chart.tooltip.roundingPercentage)}%)</span></div>`;
            }
        }

        tooltipContent.value = `<div>${html}</div>`;
    }
}

const legendSet = computed(() => {
    return immutableSet.value
        .map((el, i) => {
            return {
                ...el,
                proportion: (el.value || 0) / props.dataset.map(m => (m.values || []).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0),
                opacity: segregated.value.includes(el.id) ? 0.5 : 1,
                shape: el.shape || 'circle',
                segregate: () => segregate(el),
                isSegregated: segregated.value.includes(el.id)
            }
        })
});

const legendConfig = computed(() => {
    return {
        cy: 'galaxy-div-legend',
        backgroundColor: galaxyConfig.value.style.chart.legend.backgroundColor,
        color: galaxyConfig.value.style.chart.legend.color,
        fontSize: galaxyConfig.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: galaxyConfig.value.style.chart.legend.bold ? 'bold' : ''
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
            domElement: document.getElementById(`galaxy_${uid.value}`),
            fileName: galaxyConfig.value.style.chart.title.text || 'vue-ui-galaxy'
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
            domElement: document.getElementById(`galaxy_${uid.value}`),
            fileName: galaxyConfig.value.style.chart.title.text || 'vue-ui-galaxy',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

const table = computed(() => {
    const head = galaxySet.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color
        }
    });
    const body = galaxySet.value.map(ds => ds.value);
    return { head, body };
});

function generateCsv() {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [isNaN(table.value.body[i] / total.value) ? '-' : table.value.body[i] / total.value * 100]]
        });
        const tableXls = [[galaxyConfig.value.style.chart.title.text],[galaxyConfig.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);

        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: galaxyConfig.value.style.chart.title.text || "vue-ui-galaxy" })
    });
}

const dataTable = computed(() => {
    const head = [
        ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`, dataLabel({p: galaxyConfig.value.style.chart.layout.labels.dataLabels.prefix, v: total.value, s: galaxyConfig.value.style.chart.layout.labels.dataLabels.suffix, r: galaxyConfig.value.table.td.roundingValue}),
        '100%'
    ];

    const body = table.value.head.map((h,i) => {
        const label = dataLabel({p: galaxyConfig.value.style.chart.layout.labels.dataLabels.prefix, v: table.value.body[i], s: galaxyConfig.value.style.chart.layout.labels.dataLabels.suffix, r: galaxyConfig.value.table.td.roundingValue});
        return [
            {
                color: h.color,
                name: h.name
            },
            label,
            isNaN(table.value.body[i] / total.value) ? "-" : (table.value.body[i] / total.value * 100).toFixed(galaxyConfig.value.table.td.roundingPercentage) + '%'
        ]
    });

    const config = {
        th: {
            backgroundColor: galaxyConfig.value.table.th.backgroundColor,
            color: galaxyConfig.value.table.th.color,
            outline: galaxyConfig.value.table.th.outline
        },
        td: {
            backgroundColor: galaxyConfig.value.table.td.backgroundColor,
            color: galaxyConfig.value.table.td.color,
            outline: galaxyConfig.value.table.td.outline
        },
        breakpoint: galaxyConfig.value.table.responsiveBreakpoint
    }

    const colNames = [
        galaxyConfig.value.table.columnNames.series,
        galaxyConfig.value.table.columnNames.value,
        galaxyConfig.value.table.columnNames.percentage
    ]

    return {
        colNames,
        head,
        body,
        config
    }
});

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable
})

</script>

<template>
    <div ref="galaxyChart" :class="`vue-ui-galaxy ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${galaxyConfig.useCssAnimation ? '' : 'vue-ui-dna'}`" :style="`font-family:${galaxyConfig.style.fontFamily};width:100%; text-align:center;${!galaxyConfig.style.chart.title.text ? 'padding-top:36px' : ''};background:${galaxyConfig.style.chart.backgroundColor}`" :id="`galaxy_${uid}`">

        <div v-if="galaxyConfig.style.chart.title.text" :style="`width:100%;background:${galaxyConfig.style.chart.backgroundColor};padding-bottom:24px`">            
            <Title
                :config="{
                    title: {
                        cy: 'galaxy-div-title',
                        text: galaxyConfig.style.chart.title.text,
                        color: galaxyConfig.style.chart.title.color,
                        fontSize: galaxyConfig.style.chart.title.fontSize,
                        bold: galaxyConfig.style.chart.title.bold
                    },
                    subtitle: {
                        cy: 'galaxy-div-subtitle',
                        text: galaxyConfig.style.chart.title.subtitle.text,
                        color: galaxyConfig.style.chart.title.subtitle.color,
                        fontSize: galaxyConfig.style.chart.title.subtitle.fontSize,
                        bold: galaxyConfig.style.chart.title.subtitle.bold
                    }
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_option_${step}`"
            v-if="galaxyConfig.userOptions.show && isDataset"
            :backgroundColor="galaxyConfig.style.chart.backgroundColor"
            :color="galaxyConfig.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            hasImg
            hasTable
            hasFullscreen
            :isFullscreen="isFullscreen"
            :chartElement="galaxyChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
        />

        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" data-cy="galaxy-svg" :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%; overflow: visible; background:${galaxyConfig.style.chart.backgroundColor};color:${galaxyConfig.style.chart.color}`">
            
            <!-- GRADIENT -->
            <defs>
                <filter :id="`blur_${uid}`" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur in="SourceGraphic" :stdDeviation="100 / galaxyConfig.style.chart.layout.arcs.gradient.intensity" />
                </filter>
            </defs>

            <!-- PATHS -->
            <g v-for="datapoint in galaxySet">
                <path 
                    v-if="datapoint.value"
                    :d="datapoint.path"
                    fill="none"
                    :stroke="galaxyConfig.style.chart.backgroundColor"
                    :stroke-width="(galaxyConfig.style.chart.layout.arcs.strokeWidth + galaxyConfig.style.chart.layout.arcs.borderWidth) * (selectedSerie === datapoint.id && galaxyConfig.style.chart.layout.arcs.hoverEffect.show ? galaxyConfig.style.chart.layout.arcs.hoverEffect.multiplicator : 1)"
                    stroke-linecap="round"                    
                />
                <path
                    v-if="datapoint.value"
                    :d="datapoint.path"
                    fill="none"
                    :stroke="datapoint.color"
                    :stroke-width="galaxyConfig.style.chart.layout.arcs.strokeWidth * (selectedSerie === datapoint.id && galaxyConfig.style.chart.layout.arcs.hoverEffect.show ? galaxyConfig.style.chart.layout.arcs.hoverEffect.multiplicator : 1)"
                    stroke-linecap="round"
                    :class="`${selectedSerie && selectedSerie !== datapoint.id && galaxyConfig.useBlurOnHover ? 'vue-ui-galaxy-blur' : ''}`"
                />
                <g :filter="`url(#blur_${uid})`" v-if="datapoint.value && galaxyConfig.style.chart.layout.arcs.gradient.show">
                    <path
                        :d="datapoint.path"
                        fill="none"
                        :stroke="galaxyConfig.style.chart.layout.arcs.gradient.color"
                        :stroke-width="(galaxyConfig.style.chart.layout.arcs.strokeWidth / 2) * (selectedSerie === datapoint.id && galaxyConfig.style.chart.layout.arcs.hoverEffect.show ? galaxyConfig.style.chart.layout.arcs.hoverEffect.multiplicator : 1)"
                        stroke-linecap="round"
                        :class="`vue-ui-galaxy-gradient ${selectedSerie && selectedSerie !== datapoint.id && galaxyConfig.useBlurOnHover ? 'vue-ui-galaxy-blur' : ''}`"
                    />
                </g>
            </g>

            <!-- TRAPS -->
            <g v-for="(datapoint, i) in galaxySet">
                <path
                    v-if="datapoint.value"
                    :d="datapoint.path"
                    fill="none"
                    stroke="transparent"
                    :stroke-width="galaxyConfig.style.chart.layout.arcs.strokeWidth + galaxyConfig.style.chart.layout.arcs.borderWidth"
                    stroke-linecap="round"
                    @mouseenter="useTooltip({
                        datapoint,
                        relativeIndex: i,
                        seriesIndex: datapoint.seriesIndex,
                        show: true
                    })"
                    @mouseleave="isTooltip = false; selectedSerie = null"
                    @click="emit('selectDatapoint', datapoint)"
                />
            </g>
            <slot name="svg" :svg="svg"/>
        </svg>

        <Skeleton
            v-if="!isDataset"
            :config="{
                type: 'galaxy',
                style: {
                    backgroundColor: galaxyConfig.style.chart.backgroundColor,
                    galaxy: {
                        color: '#CCCCCC'
                    }
                }
            }"
        />

        <!-- LEGEND AS DIV -->

        <Legend
            v-if="galaxyConfig.style.chart.legend.show"
            :legendSet="legendSet"
            :config="legendConfig"
            @clickMarker="({legend}) => segregate(legend)"
        >
            <template #item="{ legend, index }">
                <div :data-cy="`legend-item-${index}`" @click="segregate(legend)" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                    {{ legend.name }} : {{ dataLabel({p: galaxyConfig.style.chart.layout.labels.dataLabels.prefix, v: legend.value, s: galaxyConfig.style.chart.layout.labels.dataLabels.suffix, r: galaxyConfig.style.chart.legend.roundingValue}) }}
                    <span v-if="!segregated.includes(legend.id)">
                        ({{ isNaN(legend.value / total) ? '-' : (legend.value / total * 100).toFixed(galaxyConfig.style.chart.legend.roundingPercentage)}}%)
                    </span>
                    <span v-else>
                        ( - % )
                    </span>
                </div>
            </template>
        </Legend>
        
        <slot name="legend" v-bind:legend="legendSet" />

        <!-- TOOLTIP -->
        <Tooltip
            :show="galaxyConfig.style.chart.tooltip.show && isTooltip"
            :backgroundColor="galaxyConfig.style.chart.tooltip.backgroundColor"
            :color="galaxyConfig.style.chart.tooltip.color"
            :borderRadius="galaxyConfig.style.chart.tooltip.borderRadius"
            :borderColor="galaxyConfig.style.chart.tooltip.borderColor"
            :borderWidth="galaxyConfig.style.chart.tooltip.borderWidth"
            :fontSize="galaxyConfig.style.chart.tooltip.fontSize"
            :parent="galaxyChart"
            :content="tooltipContent"
            :isCustom="isFunction(galaxyConfig.style.chart.tooltip.customFormat)"
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
                backgroundColor: galaxyConfig.style.chart.backgroundColor,
                color: galaxyConfig.style.chart.color,
            },
            head: {
                backgroundColor: galaxyConfig.style.chart.backgroundColor,
                color: galaxyConfig.style.chart.color,
            }
        }">
            <template #content>
                <DataTable
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${galaxyConfig.style.chart.title.text}${galaxyConfig.style.chart.title.subtitle.text ? ` : ${galaxyConfig.style.chart.title.subtitle.text}` : ''}`"
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
.vue-ui-galaxy *{
    transition: unset;
}
.vue-ui-galaxy {
    user-select: none;
    position: relative;
}

path {
    animation: galaxy 0.5s ease-in-out;
    transform-origin: center;
    transition: stroke-width 0.1s ease-in-out !important;
}
@keyframes galaxy {
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

.vue-ui-galaxy .vue-ui-galaxy-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}

.vue-ui-dna * {
    animation: none !important;
}

.vue-ui-galaxy-blur {
    filter: blur(3px) opacity(50%) grayscale(100%);
    transition: all 0.15s ease-in-out;
}
.vue-data-ui-fullscreen--on {
    height: 80% !important;
    margin: 0 auto !important;
}
.vue-data-ui-fullscreen--off {
    max-width: 100%;
}
.vue-data-ui-wrapper-fullscreen {
    overflow: auto;
}
</style>