<script setup>
import { ref, computed, nextTick } from "vue";
import { palette, shiftHue, opacity, convertColorToHex, makeXls } from "../lib";
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
import { useNestedProp } from "../useNestedProp";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Tooltip from "../atoms/Tooltip.vue";
import Legend from "../atoms/Legend.vue";

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

const uid = ref(`vue-ui-waffle-${Math.random()}`);
const defaultConfig = ref(mainConfig.vue_ui_waffle);

const isImaging = ref(false);
const isPrinting = ref(false);
const waffleChart = ref(null);
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const selectedSerie = ref(null);

const waffleConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const mutableConfig = ref({
    inside: !waffleConfig.value.style.chart.layout.useDiv,
    showTable: waffleConfig.value.table.show
})

const svg = computed(() => {
    const height = mutableConfig.value.inside ? 704 : 512;
    return {
        height,
        width: 512,
    }
});

const drawingArea = computed(() => {
    return {
        top: !mutableConfig.value.inside ? 0 : 64,
        left: 0,
        height: 512,
        width: 512,
    }
});

const rectDimension = computed(() => {
    return ((drawingArea.value.width - (waffleConfig.value.style.chart.layout.grid.size * waffleConfig.value.style.chart.layout.grid.spaceBetween )) / waffleConfig.value.style.chart.layout.grid.size);
});

const absoluteRectDimension = computed(() => {
    return ((drawingArea.value.width ) / waffleConfig.value.style.chart.layout.grid.size);
})

function calculateProportions(numbers) {
  const totalSum = numbers.reduce((a, b) => a + b, 0);
  const proportions = numbers.map(num => Math.round((num / totalSum) * 100) / 100);
  const roundedSum = proportions.reduce((a, b) => a + b, 0);

  if (roundedSum !== 1) {
    const lastIndex = proportions.length - 1;
    proportions[lastIndex] += (1 - roundedSum);
    proportions[lastIndex] = Math.round(proportions[lastIndex] * 100) / 100;
  }
  return proportions;
}

const datasetCopy = computed(() => {
    return props.dataset.map((s, i) => {
        return {
            ...s,
            color: convertColorToHex(s.color) || palette[i] || palette[i % palette.length],
            uid: `serie_${i}`
        }
    });
});

const proportions = computed(() => {
    const numbers = datasetCopy.value
        .filter((serie,i) => !segregated.value.includes(serie.uid))
        .map((serie, i) => serie.values.reduce((a,b) => a + b, 0));
    return calculateProportions(numbers);
});

const immutableProportions = computed(() => {
    const numbers = datasetCopy.value
        .map((serie, i) => serie.values.reduce((a,b) => a + b));
    return calculateProportions(numbers);
});

const waffleSet = computed(() => {
    return datasetCopy.value
        .filter((serie, i) => !segregated.value.includes(serie.uid))
        .map((serie, i) => {
            return {
                uid: serie.uid,
                name: serie.name,
                color: serie.color,
                value: serie.values.reduce((a,b) => a + b, 0),
                absoluteValues: serie.values,
                proportion: proportions.value[i] * Math.pow(waffleConfig.value.style.chart.layout.grid.size, 2)
            }
        })
        .sort((a,b) => b.value - a.value)
});

const immutableSet = computed(() => {
    return datasetCopy.value
        .map((serie, i) => {
            return {
                uid: serie.uid,
                name: serie.name,
                color: serie.color,
                value: serie.values.reduce((a,b) => a + b, 0),
                absoluteValues: serie.values,
                proportion: immutableProportions.value[i] * Math.pow(waffleConfig.value.style.chart.layout.grid.size, 2)
            }
        })
        .sort((a,b) => b.value - a.value)
});

function getData() {
    return immutableSet.value.map(ds => {
        return {
            name: ds.name,
            color: ds.color,
            value: ds.value,
            proportion: ds.proportion  / (Math.pow(waffleConfig.value.style.chart.layout.grid.size, 2))
        }
    });
}

const cumulatedSet = computed(() => {
    return waffleSet.value.map((serie, i) => {
        const start = i > 0 ? waffleSet.value.filter((_,j) => j < i).map(el => el.proportion).reduce((a,b) => a + b) + serie.proportion - waffleSet.value[i - 1].proportion: serie.proportion - serie.proportion;
        const end = start + serie.proportion;
        const rects = [];
        for(let j = start; j <= end; j += 1) {
            rects.push(j)
        }
        return {
            ...serie,
            start: i > 0 ? waffleSet.value.filter((_,j) => j < i).map(el => el.proportion).reduce((a,b) => a + b) + serie.proportion - waffleSet.value[i - 1].proportion: serie.proportion - serie.proportion,
            rects
        }
    });
});

const rects = computed(() => {
    return cumulatedSet.value.flatMap((serie, s) => {
        return serie.rects.map((rect, i) => {
            return {
                name: serie.name,
                color: serie.color,
                value: serie.value,
                serieIndex: s,
                ...serie
            }
        })
    })
});

const positions = computed(() => {
    const grid = [];
    for(let i = 0; i < waffleConfig.value.style.chart.layout.grid.size; i += 1) {
        for(let j = 0; j < waffleConfig.value.style.chart.layout.grid.size; j += 1) {
            grid.push({
                x: (waffleConfig.value.style.chart.layout.grid.vertical ? i : j) * (rectDimension.value + waffleConfig.value.style.chart.layout.grid.spaceBetween),
                y: (waffleConfig.value.style.chart.layout.grid.vertical ? j : i) * (rectDimension.value + waffleConfig.value.style.chart.layout.grid.spaceBetween) + drawingArea.value.top,
            })
        }
    }
    return grid;
});

const legendSet = computed(() => {
    return datasetCopy.value
        .map((serie, i) => {
            return {
                name: serie.name,
                color: serie.color || palette[i] || palette[i % palette.length],
                value: serie.values.reduce((a,b) => a + b, 0),
                uid: serie.uid,
                shape: 'square'
            }
        })
        .sort((a,b) => b.value - a.value)
        .map((el, i) => {
            return {
                ...el,
                opacity: segregated.value.includes(el.uid) ? 0.5 : 1
            }
        })
});

const legendConfig = computed(() => {
    return {
        cy: 'waffle-div-legend',
        backgroundColor: waffleConfig.value.style.chart.legend.backgroundColor,
        color: waffleConfig.value.style.chart.legend.color,
        fontSize: waffleConfig.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: waffleConfig.value.style.chart.legend.bold ? 'bold' : ''
    }
})

const total = computed(() => {
    return waffleSet.value.map(s => s.value).reduce((a,b) => a + b, 0);
});

function useTooltip(index) {
    if(segregated.value.length === props.dataset.length) return;
    const selected = rects.value[index];
    isTooltip.value = true;
    selectedSerie.value = rects.value[index].serieIndex;

    let html = "";

    html += `<div data-cy="waffle-tooltip-name" style="width:100%;text-align:center;border-bottom:1px solid #ccc;padding-bottom:6px;margin-bottom:3px;">${selected.name}</div>`; 
    html += `<div style="display:flex;flex-direction:row;gap:6px;align-items:center;"><svg viewBox="0 0 12 12" height="14" width="14"><rect data-cy="waffle-tooltip-marker" x="0" y="0" height="12" width="12" stroke="none" rx="1" fill="${selected.color}" /></svg>`;
    if(waffleConfig.value.style.chart.tooltip.showValue) {
        html += `<b data-cy="waffle-tooltip-value">${selected.value.toFixed(waffleConfig.value.style.chart.tooltip.roundingValue)}</b>`;
    }
    if(waffleConfig.value.style.chart.tooltip.showPercentage) {
        if(!waffleConfig.value.style.chart.tooltip.showValue) {
            html += `<b>${(selected.value / total.value * 100).toFixed(waffleConfig.value.style.chart.tooltip.roundingPercentage)}%</b></div>`;
        } else {
            html += `<span data-cy="waffle-tooltip-percentage">(${(selected.value / total.value * 100).toFixed(waffleConfig.value.style.chart.tooltip.roundingPercentage)}%)</span></div>`;
        }
    }
    tooltipContent.value = html;
}

const emit = defineEmits(['selectLegend']);

const segregated = ref([]);

function segregate(uid) {
    if(segregated.value.includes(uid)) {
        segregated.value = segregated.value.filter(s => s !== uid);
    }else {
        segregated.value.push(uid);
    }
    emit('selectLegend', waffleSet.value.map(w => {
        return {
            name: w.name,
            color: w.color,
            value: w.value,
            proportion: (w.proportion / (Math.pow(waffleConfig.value.style.chart.layout.grid.size, 2)))
        }
    }));
}

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

const __to__ = ref(null);

function showSpinnerPdf() {
    isPrinting.value = true;
}

function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(`vue-ui-waffle_${uid.value}`),
            fileName: waffleConfig.value.style.chart.title.text || 'vue-ui-waffle'
        }).finally(() => {
            isPrinting.value = false;
        })
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
            domElement: document.getElementById(`vue-ui-waffle_${uid.value}`),
            fileName: waffleConfig.value.style.chart.title.text || 'vue-ui-waffle',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

function generateXls() {
    nextTick(() => {
        const labels = table.value.head.map((h,i) => {
            return [[
                h.name
            ],[table.value.body[i]], [isNaN(table.value.body[i] / total.value) ? '-' : table.value.body[i] / total.value * 100]]
        });
        const tableXls = [[waffleConfig.value.style.chart.title.text],[waffleConfig.value.style.chart.title.subtitle.text],[[""],["val"],["%"]]].concat(labels);

        makeXls(tableXls, waffleConfig.value.style.chart.title.text || "vue-ui-waffle");
    });
}

defineExpose({
    getData,
    generatePdf,
    generateXls,
    generateImage
});

</script>

<template>
    <div 
        class="vue-ui-waffle" 
        ref="waffleChart" 
        :id="`vue-ui-waffle_${uid}`"
        :style="`font-family:${waffleConfig.style.fontFamily};width:100%; text-align:center;${waffleConfig.userOptions.show ? 'padding-top:36px' : ''}`"
    >
        <!-- TITLE AS DIV -->
        <div v-if="(!mutableConfig.inside || isPrinting) && waffleConfig.style.chart.title.text" :style="`width:100%;background:${waffleConfig.style.chart.backgroundColor};padding-bottom:12px`">
            <Title
                :config="{
                    title: {
                        cy: 'waffle-title',
                        text: waffleConfig.style.chart.title.text,
                        color: waffleConfig.style.chart.title.color,
                        fontSize: waffleConfig.style.chart.title.fontSize,
                        bold: waffleConfig.style.chart.title.bold
                    },
                    subtitle: {
                        cy: 'waffle-subtitle',
                        text: waffleConfig.style.chart.title.subtitle.text,
                        color: waffleConfig.style.chart.title.subtitle.color,
                        fontSize: waffleConfig.style.chart.title.subtitle.fontSize,
                        bold: waffleConfig.style.chart.title.subtitle.bold
                    },
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            v-if="waffleConfig.userOptions.show"
            :backgroundColor="waffleConfig.style.chart.backgroundColor"
            :color="waffleConfig.style.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :title="waffleConfig.userOptions.title"
            :uid="uid"
            :hasImg="true"
            @generatePdf="generatePdf"
            @generateXls="generateXls"
            @generateImage="generateImage"
        >
            <template #checkboxes>
                <div class="vue-ui-options-item">
                    <input data-cy="waffle-checkbox-title" type="checkbox" :id="`vue-ui-waffle-option-title_${uid}`" :name="`vue-ui-waffle-option-title_${uid}`"
                    v-model="mutableConfig.inside">
                    <label :for="`vue-ui-waffle-option-title_${uid}`">{{ waffleConfig.userOptions.labels.useDiv }}</label>
                </div>
                <div class="vue-ui-options-item">
                    <input data-cy="waffle-checkbox-table" type="checkbox" :id="`vue-ui-waffle-option-table_${uid}`" :name="`vue-ui-waffle-option-table_${uid}`"
                    v-model="mutableConfig.showTable">
                    <label :for="`vue-ui-waffle-option-table_${uid}`">{{ waffleConfig.userOptions.labels.showTable }}</label>
                </div>
            </template>
        </UserOptions>

        <!-- CHART -->
        <svg data-cy="waffle-svg" :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%;overflow:visible;background:${waffleConfig.style.chart.backgroundColor};color:${waffleConfig.style.chart.color}`" >

            <!-- DEFS -->
            <defs>
                <radialGradient cx="50%" cy="50%" r="50%" fx="50%" fy="50%" v-for="(rect,i) in rects" :id="`gradient_${uid}_${i}`">
                    <stop offset="0%" :stop-color="`${shiftHue(rect.color, 0.05)}${opacity[100 - waffleConfig.style.chart.layout.rect.gradientIntensity]}`"/>
                    <stop offset="100%" :stop-color="rect.color" />
                </radialGradient>
            </defs>

            <!-- TITLE AS G -->
            <g v-if="waffleConfig.style.chart.title.text && mutableConfig.inside && !isPrinting">
                <text
                    data-cy="waffle-text-title"
                    :font-size="waffleConfig.style.chart.title.fontSize"
                    :fill="waffleConfig.style.chart.title.color"
                    :x="svg.width / 2"
                    :y="waffleConfig.style.chart.title.fontSize"
                    text-anchor="middle"
                    :style="`font-weight:${waffleConfig.style.chart.title.bold ? 'bold' : ''}`"
                >
                    {{ waffleConfig.style.chart.title.text }}
                </text>
                <text
                    data-cy="waffle-text-subtitle"
                    v-if="waffleConfig.style.chart.title.subtitle.text"
                    :font-size="waffleConfig.style.chart.title.subtitle.fontSize"
                    :fill="waffleConfig.style.chart.title.subtitle.color"
                    :x="svg.width / 2"
                    :y="waffleConfig.style.chart.title.fontSize * 2"
                    text-anchor="middle"
                    :style="`font-weight:${waffleConfig.style.chart.title.subtitle.bold ? 'bold' : ''}`"
                >
                    {{ waffleConfig.style.chart.title.subtitle.text }}
                </text>
            </g>

            <!-- RECTS -->
            <rect
                v-for="(position, i) in positions"
                :data-cy="`waffle-rect-underlayer-${i}`"
                :rx="waffleConfig.style.chart.layout.rect.rounded ? waffleConfig.style.chart.layout.rect.rounding : 0"
                :x="position.x"
                :y="position.y"
                :height="rectDimension"
                :width="rectDimension"
                fill="white"
                :stroke="waffleConfig.style.chart.layout.rect.stroke"
                :stroke-width="waffleConfig.style.chart.layout.rect.strokeWidth"
            />
            <rect
                v-for="(position, i) in positions"
                :class="{'vue-ui-waffle-blur': waffleConfig.useBlurOnHover && ![null, undefined].includes(selectedSerie) && rects[i].serieIndex !== selectedSerie}"
                :rx="waffleConfig.style.chart.layout.rect.rounded ? waffleConfig.style.chart.layout.rect.rounding : 0"
                :x="position.x"
                :y="position.y"
                :height="rectDimension"
                :width="rectDimension"
                :fill="waffleConfig.style.chart.layout.rect.useGradient && waffleConfig.style.chart.layout.rect.gradientIntensity > 0 ? `url(#gradient_${uid}_${i})` : rects[i].color"
                :stroke="waffleConfig.style.chart.layout.rect.stroke"
                :stroke-width="waffleConfig.style.chart.layout.rect.strokeWidth"
            />
            <rect
                v-for="(position, i) in positions"
                :data-cy="`waffle-rect-${i}`"
                @mouseover="useTooltip(i)"
                @mouseleave="isTooltip = false; selectedSerie = null"
                :x="position.x"
                :y="position.y"
                :height="absoluteRectDimension"
                :width="absoluteRectDimension"
                fill="transparent"
                stroke="none"
            />

            <!-- LEGEND AS G -->
            <foreignObject
                v-if="waffleConfig.style.chart.legend.show && mutableConfig.inside && !isPrinting"
                :x="0"
                :y="512 + 64"
                width="100%"
                height="100"
                style="overflow: visible;"
            >
                <Legend
                    :legendSet="legendSet"
                    :config="legendConfig"
                    @clickMarker="({legend}) => segregate(legend.uid)"
                >
                    <template #item="{ legend }">
                        <div @click="segregate(legend.uid)" :style="`opacity:${segregated.includes(legend.uid) ? 0.5 : 1}`">
                            {{ legend.name }} : {{ Number(legend.value.toFixed(waffleConfig.style.chart.legend.roundingValue)).toLocaleString() }}
                            <span v-if="!segregated.includes(legend.uid)">
                                ({{ isNaN(legend.value / total) ? '-' : (legend.value / total * 100).toFixed(waffleConfig.style.chart.legend.roundingPercentage)}}%)
                            </span>
                            <span v-else>
                                ( - % )
                            </span>
                        </div>
                    </template>
                </Legend>
            </foreignObject>
            
        </svg>

        <!-- LEGEND AS DIV -->
        <Legend
            v-if="waffleConfig.style.chart.legend.show && (!mutableConfig.inside || isPrinting)"
            :legendSet="legendSet"
            :config="legendConfig"
            @clickMarker="({legend}) => segregate(legend.uid)"
        >
            <template #item="{ legend }">
                <div @click="segregate(legend.uid)" :style="`opacity:${segregated.includes(legend.uid) ? 0.5 : 1}`">
                    {{ legend.name }} : {{ Number(legend.value.toFixed(waffleConfig.style.chart.legend.roundingValue)).toLocaleString() }}
                    <span v-if="!segregated.includes(legend.uid)">
                        ({{ isNaN(legend.value / total) ? '-' : (legend.value / total * 100).toFixed(waffleConfig.style.chart.legend.roundingPercentage)}}%)
                    </span>
                    <span v-else>
                        ( - % )
                    </span>
                </div>
            </template>
        </Legend>

        <!-- TOOLTIP -->
        <Tooltip
            :show="waffleConfig.style.chart.tooltip.show && isTooltip && segregated.length < props.dataset.length"
            :backgroundColor="waffleConfig.style.chart.tooltip.backgroundColor"
            :color="waffleConfig.style.chart.tooltip.color"
            :parent="waffleChart"
            :content="tooltipContent"
        />

        <!-- DATA TABLE -->
        <div  class="vue-ui-waffle-table" :style="`width:100%;margin-top:${mutableConfig.inside ? '48px' : ''}`" v-if="mutableConfig.showTable">
            <table>
                <thead>
                    <tr data-cy="waffle-table-title" v-if="waffleConfig.style.chart.title.text">
                        <th colspan="3" :style="`background:${waffleConfig.table.th.backgroundColor};color:${waffleConfig.table.th.color};outline:${waffleConfig.table.th.outline}`">
                            <span>{{ waffleConfig.style.chart.title.text }}</span>
                            <span v-if="waffleConfig.style.chart.title.subtitle.text">
                                : {{ waffleConfig.style.chart.title.subtitle.text }}
                            </span>
                        </th>
                    </tr>
                    <tr>
                        <th align="right" :style="`background:${waffleConfig.table.th.backgroundColor};color:${waffleConfig.table.th.color};outline:${waffleConfig.table.th.outline};padding-right:6px`">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>
                        </th>
                        <th :style="`background:${waffleConfig.table.th.backgroundColor};color:${waffleConfig.table.th.color};outline:${waffleConfig.table.th.outline};text-align:right;padding-right:6px`">
                            {{ total.toFixed(waffleConfig.table.td.roundingValue) }}
                        </th>
                        <th :style="`background:${waffleConfig.table.th.backgroundColor};color:${waffleConfig.table.th.color};outline:${waffleConfig.table.th.outline};text-align:right;padding-right:6px`">
                            100%
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(th, i) in table.head" :data-cy="`waffle-table-tr-${i}`">
                        <td :style="`background:${waffleConfig.table.td.backgroundColor};color:${waffleConfig.table.td.color};outline:${waffleConfig.table.td.outline}`">
                            <div style="max-width: 200px margin:0 auto">
                                <span :style="`color:${th.color};margin-right:6px;`">◼</span>
                                <span>{{ th.name }}</span>
                            </div>
                        </td>
                        <td :style="`background:${waffleConfig.table.td.backgroundColor};color:${waffleConfig.table.td.color};outline:${waffleConfig.table.td.outline}`">
                            {{ table.body[i].toFixed(waffleConfig.table.td.roundingValue) }}
                        </td>
                        <td :style="`background:${waffleConfig.table.td.backgroundColor};color:${waffleConfig.table.td.color};outline:${waffleConfig.table.td.outline}`">
                            {{ isNaN(table.body[i] / total) ? "-" : (table.body[i] / total * 100).toFixed(waffleConfig.table.td.roundingPercentage) }}%
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
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


/** */

.vue-ui-waffle table {
    width: 100%;
    border-collapse:collapse;
}
.vue-ui-waffle table td {
    text-align:right;
    padding-right: 6px;
    font-variant-numeric: tabular-nums;
}
.vue-ui-waffle table th {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
}

.vue-ui-waffle-blur {
    filter: blur(3px) opacity(50%) grayscale(100%);
    transition: all 0.15s ease-in-out;
}
</style>