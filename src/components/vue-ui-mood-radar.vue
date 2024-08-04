<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import { 
    createCsvContent, 
    createPolygonPath, 
    createUid, 
    downloadCsv,
    error,
    makePath,
    objectIsEmpty, 
    opacity, 
    shiftHue,
    XMLNS
} from "../lib";
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
import themes from "../themes.json";
import { useNestedProp } from "../useNestedProp";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Legend from "../atoms/Legend.vue";
import BaseIcon from "../atoms/BaseIcon.vue";
import DataTable from "../atoms/DataTable.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import Accordion from "./vue-ui-accordion.vue";

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        },
    },
    dataset: {
        type: Object,
        default() {
            return {};
        },
    },
});

const isDataset = computed(() => {
    return !!props.dataset && Object.keys(props.dataset).length;
})

onMounted(() => {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiMoodRadar',
            type: 'dataset'
        })
    }
})

const uid = ref(createUid());
const defaultConfig = ref(mainConfig.vue_ui_mood_radar);

const isImaging = ref(false);
const isPrinting = ref(false);
const moodRadarChart = ref(null);
const details = ref(null);
const selectedKey = ref(null)

const radarConfig = computed(() => {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_mood_radar[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
        }
    } else {
        return mergedConfig;
    }
});

const mutableConfig = ref({
    showTable: radarConfig.value.table.show,
});

const svg = computed(() => {
    return {
        height: 256,
        width: 256,
    };
});

const outerPolygon = computed(() => {
    return createPolygonPath({
        plot: { x: 128, y: svg.value.height / 2 },
        radius: 90,
        sides: 5,
        rotation: 11,
    });
});

function plot({ centerX, centerY, apexX, apexY, proportion, key, value }) {
    return {
        x: centerX + (apexX - centerX) * proportion,
        y: centerY + (apexY - centerY) * proportion,
        key,
        value
    };
}

const maxValue = computed(() => {
    return Math.max(...Object.values(props.dataset).map(v => isNaN(v) ? 0 : v));
});

const grandTotal = computed(() => {
    return Object.values(props.dataset).reduce((a, b) => (isNaN(a) ? 0 : a) + (isNaN(b) ? 0 : b), 0);
});

const convertedDataset = computed(() => {
    return Object.keys(props.dataset)
        .map((key, i) => {
            const value = typeof props.dataset[key] !== 'number' || isNaN(props.dataset[key]) ? 0 : props.dataset[key];
            return {
                index: i,
                key,
                value,
                proportion: value / grandTotal.value,
                color: radarConfig.value.style.chart.layout.smileys.colors[key]
            };
        })
        .sort((a, b) => b.key - a.key);
});

const radar = computed(() => {
    if(!isDataset.value) {
        return []
    }

    ['1', '2', '3', '4', '5'].forEach(rating => {
        if([null, undefined].includes(props.dataset[rating])){
            error({
                componentName: 'VueUiMoodRadar',
                type: 'datasetAttribute',
                property: rating
            })
        }
    })

    return outerPolygon.value.coordinates.map((c, i) => {
        const plots = plot({
            centerX: svg.value.width / 2,
            centerY: svg.value.height / 2,
            apexX: c.x,
            apexY: c.y,
            proportion: convertedDataset.value[i].value / maxValue.value,
            key: convertedDataset.value[i].key,
            value: convertedDataset.value[i].value
        });
        return {
            ...c,
            plots,
            key: convertedDataset.value[i].key,
        };
    });
});

const legendConfig = computed(() => {
    return {
        cy: "mood-radar-legend",
        backgroundColor: radarConfig.value.style.chart.legend.backgroundColor,
        color: radarConfig.value.style.chart.legend.color,
        fontSize: radarConfig.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: radarConfig.value.style.chart.legend.bold ? "bold" : "",
    };
});

function selectKey(key) {
    if(key === selectedKey.value) {
        selectedKey.value = null
    } else {
        selectedKey.value = key
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
            domElement: document.getElementById(`${uid.value}`),
            fileName: radarConfig.value.style.chart.title.text || 'vue-ui-mood-radar'
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
            domElement: document.getElementById(`${uid.value}`),
            fileName: radarConfig.value.style.chart.title.text || 'vue-ui-mood-radar',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

const table = computed(() => {
    const head = convertedDataset.value.map(ds => {
        return {
            name: ds.key,
            color: ds.color
        }
    });
    const body = convertedDataset.value.map(ds => isNaN(ds.value) ? 0 : ds.value);
    return { head, body };
});

function generateCsv() {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [isNaN(table.value.body[i] / grandTotal.value) ? '-' : table.value.body[i] / grandTotal.value * 100]]
        });
        const tableXls = [[radarConfig.value.style.chart.title.text],[radarConfig.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);
        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: radarConfig.value.style.chart.title.text || "vue-ui-mood-radar"});
    });
}

const dataTable = computed(() => {
    const head = [
        ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`,
        Number(grandTotal.value.toFixed(radarConfig.value.table.td.roundingValue)).toLocaleString(),
        '100%'
    ];

    const body = table.value.head.map((h,i) => {
        return [
            {
                color: h.color,
                name: h.name
            },
            table.value.body[i].toFixed(radarConfig.value.table.td.roundingValue),
            isNaN(table.value.body[i] / grandTotal.value) ? "-" : (table.value.body[i] / grandTotal.value * 100).toFixed(radarConfig.value.table.td.roundingPercentage) + '%'
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
    }

    const colNames = [
        radarConfig.value.table.columnNames.series,
        radarConfig.value.table.columnNames.value,
        radarConfig.value.table.columnNames.percentage
    ]

    return {
        head,
        body,
        config,
        colNames
    }
});

function getData() {
    return convertedDataset.value;
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
}

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage,
    toggleTable
});

</script>

<template>
    <div :class="`vue-ui-mood-radar ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${radarConfig.useCssAnimation ? '' : 'vue-ui-dna'}`" ref="moodRadarChart"
        :id="`${uid}`" :style="`font-family:${radarConfig.style.fontFamily};width:100%; text-align:center;${!radarConfig.style.chart.title.text ? 'padding-top:36px' : ''
            };background:${radarConfig.style.chart.backgroundColor}`">
        <div v-if="radarConfig.style.chart.title.text"
            :style="`width:100%;background:${radarConfig.style.chart.backgroundColor}`">
            <Title :config="{
                title: {
                    cy: 'mood-radar-title',
                    text: radarConfig.style.chart.title.text,
                    color: radarConfig.style.chart.title.color,
                    fontSize: radarConfig.style.chart.title.fontSize,
                    bold: radarConfig.style.chart.title.bold,
                },
                subtitle: {
                    cy: 'mood-radar-subtitle',
                    text: radarConfig.style.chart.title.subtitle.text,
                    color: radarConfig.style.chart.title.subtitle.color,
                    fontSize: radarConfig.style.chart.title.subtitle.fontSize,
                    bold: radarConfig.style.chart.title.subtitle.bold,
                },
            }" />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            v-if="radarConfig.userOptions.show && isDataset"
            :backgroundColor="radarConfig.style.chart.backgroundColor"
            :color="radarConfig.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uid"
            hasImg
            hasTable
            hasFullscreen
            :chartElement="moodRadarChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
        />

        <svg :xmlns="XMLNS" v-if="isDataset" :viewBox="`0 0 ${svg.width} ${svg.height}`"
        :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }"
            :style="`overflow:visible;background:${radarConfig.style.chart.backgroundColor};color:${radarConfig.style.chart.color}`">
            <!-- DEFS -->
            <defs>
                <radialGradient cx="50%" cy="50%" r="50%" fx="50%" fy="50%" :id="`mood_radar_gradient_${uid}`">
                    <stop offset="0%" :stop-color="radarConfig.style.chart.layout.dataPolygon.color +
                        opacity[radarConfig.style.chart.layout.dataPolygon.opacity]
                        " />
                    <stop offset="100%" :stop-color="`${shiftHue(
                        radarConfig.style.chart.layout.dataPolygon.color,
                        radarConfig.style.chart.layout.dataPolygon.gradient.intensity / 100
                    )}${opacity[radarConfig.style.chart.layout.dataPolygon.opacity]}`" />
                </radialGradient>
            </defs>

            <!-- GRID -->
            <!-- RADIAL LINES -->
            <line v-for="line in outerPolygon.coordinates" :x1="svg.width / 2" :y1="svg.height / 2" :x2="line.x"
                :y2="line.y" :stroke="radarConfig.style.chart.layout.grid.stroke"
                :stroke-width="radarConfig.style.chart.layout.grid.strokeWidth" />
            <!-- OUTER POLYGON -->
            <path :d="outerPolygon.path" fill="none" :stroke="radarConfig.style.chart.layout.outerPolygon.stroke"
                :stroke-width="radarConfig.style.chart.layout.outerPolygon.strokeWidth" stroke-linejoin="round"
                stroke-linecap="round" />


            <!-- ICON 5 -->
            <path fill="none" :stroke="radarConfig.style.chart.layout.smileys.colors['5']" stroke-width="1"
                stroke-linecap="round"
                d="M119 25A1 1 0 00137 25 1 1 0 00119 25M123 26C124 33 132 33 133 26L123 26M123 22A1 1 0 00126 22 1 1 0 00123 22M130 22A1 1 0 00133 22 1 1 0 00130 22" />
                <!-- TRAP -->
                <circle class="vue-ui-mood-radar-trap" @mouseenter="selectedKey = 5" @mouseleave="selectedKey = null" cx="128" cy="25" r="20" :fill="selectedKey === 5 ? radarConfig.style.chart.layout.smileys.colors['5']+'33' : 'transparent'"/>

            <!-- ICON 4 -->
            <path fill="none" :stroke="radarConfig.style.chart.layout.smileys.colors['4']" stroke-width="1"
                stroke-linecap="round"
                d="M218 95A1 1 0 00236 95 1 1 0 00218 95M222 97C225 99 229 99 232 97M222 92A1 1 0 00225 92 1 1 0 00222 92M229 92A1 1 0 00232 92 1 1 0 00229 92" />
                <!-- TRAP -->
                <circle class="vue-ui-mood-radar-trap" @mouseenter="selectedKey = 4" @mouseleave="selectedKey = null"  cx="227" cy="95.5" r="20" :fill="selectedKey === 4 ? radarConfig.style.chart.layout.smileys.colors['4']+'33' : 'transparent'"/>

            <!-- ICON 3 -->
            <path fill="none" :stroke="radarConfig.style.chart.layout.smileys.colors['3']" stroke-width="1"
                stroke-linecap="round"
                d="M181 213A1 1 0 00199 213 1 1 0 00181 213M185 210A1 1 0 00188 210 1 1 0 00185 210M192 210A1 1 0 00195 210 1 1 0 00192 210M185 215 195 215" />
                <!-- TRAP -->
                <circle class="vue-ui-mood-radar-trap" @mouseenter="selectedKey = 3" @mouseleave="selectedKey = null"  cx="190" cy="213.5" r="20" :fill="selectedKey === 3 ? radarConfig.style.chart.layout.smileys.colors['3']+'33' : 'transparent'"/>


            <!-- ICON 2 -->
            <path fill="none" :stroke="radarConfig.style.chart.layout.smileys.colors['2']" stroke-width="1"
                stroke-linecap="round"
                d="M56 213A1 1 0 0074 213 1 1 0 0056 213M60 216C63 214 67 214 70 216M60 210A1 1 0 0063 210 1 1 0 0060 210M67 210A1 1 0 0070 210 1 1 0 0067 210" />
                <!-- TRAP -->
                <circle class="vue-ui-mood-radar-trap" @mouseenter="selectedKey = 2" @mouseleave="selectedKey = null"  cx="65" cy="213.5" r="20" :fill="selectedKey === 2 ? radarConfig.style.chart.layout.smileys.colors['2']+'33' :  'transparent'"/>

            <!-- ICON 1 -->
            <path fill="none" :stroke="radarConfig.style.chart.layout.smileys.colors['1']" stroke-width="1"
                stroke-linecap="round"
                d="M20 96A1 1 0 0038 96 1 1 0 0020 96M24 100C25 95 33 95 34 100L24 100M24 93A1 1 0 0027 93 1 1 0 0024 93M31 93A1 1 0 0034 93 1 1 0 0031 93" />
                <!-- TRAP -->
                <circle class="vue-ui-mood-radar-trap" @mouseenter="selectedKey = 1" @mouseleave="selectedKey = null"  cx="29" cy="95.5" r="20" :fill="selectedKey === 1 ? radarConfig.style.chart.layout.smileys.colors['1']+'33' : 'transparent'"/>

            <path :d="makePath(radar.map((r) => r.plots))" :stroke="radarConfig.style.chart.layout.dataPolygon.stroke"
                :stroke-width="radarConfig.style.chart.layout.dataPolygon.strokeWidth" stroke-linecap="round"
                stroke-linejoin="round" :fill="radarConfig.style.chart.layout.dataPolygon.gradient.show
                        ? `url(#mood_radar_gradient_${uid})`
                        : radarConfig.style.chart.layout.dataPolygon.color +
                        opacity[radarConfig.style.chart.layout.dataPolygon.opacity]
            " />

                <g v-for="(plot, i) in radar.map(r => r.plots)" class="vue-ui-mood-radar-trap" :style="`opacity:${selectedKey == plot.key ? '1' : '0'}`">
                    <line 

                        :x1="plot.x"
                        :y1="plot.y"
                        :x2="128"
                        :y2="128"
                        :stroke="radarConfig.style.chart.layout.smileys.colors[plot.key]"
                    />
                    <circle  :cx="plot.x" :cy="plot.y" :fill="radarConfig.style.chart.layout.smileys.colors[plot.key]" r="3" :stroke="radarConfig.style.chart.backgroundColor" :stroke-width="0.5" />
                    <circle  :cx="128" :cy="128" :fill="radarConfig.style.chart.layout.smileys.colors[plot.key]" r="3" :stroke="radarConfig.style.chart.backgroundColor" :stroke-width="0.5" />
                    <text 

                        :x="128"
                        :y="['5', 5].includes(plot.key) ? 145 : 120"
                        :fill="radarConfig.style.chart.layout.dataLabel.color"
                        font-size="12"
                        text-anchor="middle"
                        :font-weight="radarConfig.style.chart.layout.dataLabel.bold ? 'bold' : 'normal'"
                    >
                        {{ Number(plot.value.toFixed(radarConfig.style.chart.layout.dataLabel.roundingValue)).toLocaleString() }}
                    </text>
                    <text 

                        :x="128"
                        :y="['5', 5].includes(plot.key) ? 163 : 102"
                        :fill="radarConfig.style.chart.layout.dataLabel.color"
                        font-size="12"
                        text-anchor="middle"
                    >
                        ({{ Number((plot.value / grandTotal * 100).toFixed(radarConfig.style.chart.layout.dataLabel.roundingPercentage)).toLocaleString() }}%)
                    </text>
                </g>
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
                            color: '#CCCCCC'
                        },
                        shapes: {
                            color: '#CCCCCC'
                        }
                    }
                }
            }"
        />

        <!-- LEGEND AS DIV -->
        <Legend v-if="radarConfig.style.chart.legend.show" :legendSet="convertedDataset" :config="legendConfig"
            style="display: flex; row-gap: 6px">
            <template #item="{ legend, index }">
                <div @click="() => selectKey(legend.key)" style="
            display: flex;
            flex-direction: row;
            gap: 3px;
            align-items: center;
            margin: 3px 0;
          ">
                    <BaseIcon :strokeWidth="1" v-if="legend.key == 1" name="moodSad"
                        :stroke="radarConfig.style.chart.layout.smileys.colors[legend.key]" />
                    <BaseIcon :strokeWidth="1" v-if="legend.key == 2" name="moodFlat"
                        :stroke="radarConfig.style.chart.layout.smileys.colors[legend.key]" />
                    <BaseIcon :strokeWidth="1" v-if="legend.key == 3" name="moodNeutral"
                        :stroke="radarConfig.style.chart.layout.smileys.colors[legend.key]" />
                    <BaseIcon :strokeWidth="1" v-if="legend.key == 4" name="smiley"
                        :stroke="radarConfig.style.chart.layout.smileys.colors[legend.key]" />
                    <BaseIcon :strokeWidth="1" v-if="legend.key == 5" name="moodHappy"
                        :stroke="radarConfig.style.chart.layout.smileys.colors[legend.key]" />
                    <span style="font-weight: bold">{{ legend.value }}</span> ({{
                        (isNaN(legend.proportion) ? 0 : legend.proportion * 100).toFixed(
                            radarConfig.style.chart.legend.roundingPercentage
                        )
                    }}%)
                </div>
            </template>
        </Legend>

        <slot name="legend" v-bind:legend="convertedDataset"></slot>

        <!-- DATA TABLE -->
        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: radarConfig.style.chart.backgroundColor,
                color: radarConfig.style.chart.color,
            },
            head: {
                backgroundColor: radarConfig.style.chart.backgroundColor,
                color: radarConfig.style.chart.color,
            }
        }">
            <template #content>
                <DataTable
                    :colNames="dataTable.colNames"
                    :head="dataTable.head" 
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${radarConfig.style.chart.title.text}${radarConfig.style.chart.title.subtitle.text ? ` : ${radarConfig.style.chart.title.subtitle.text}` : ''}`"
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

.vue-ui-mood-radar *{
    transition: unset;
}
.vue-ui-mood-radar {
    user-select: none;
    position: relative;
}
.vue-ui-mood-radar-trap {
    transition: all 0.2s ease-in-out;
}
</style>
