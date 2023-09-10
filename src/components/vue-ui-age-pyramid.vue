<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import { treeShake, palette, opacity, convertConfigColors, makeXls, shiftHue } from '../lib';
import pdf from "../pdf";
import mainConfig from "../default_configs.json";
import { useMouse } from "../useMouse";
import { calcTooltipPosition } from "../calcTooltipPosition";

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

const uid = ref(`vue-ui-age-pyramid-${Math.random()}`);

const defaultConfig = ref(mainConfig.vue_ui_age_pyramid);

const isPrinting = ref(false);
const agePyramid = ref(null);
const tooltip = ref(null);
const details = ref(null);
const clientPosition = ref(useMouse());
const isTooltip = ref(false);
const tooltipContent = ref("");
const selectedIndex = ref(null);

const tooltipPosition = computed(() => {
    return calcTooltipPosition({
        tooltip: tooltip.value,
        chart: agePyramid.value,
        clientPosition: clientPosition.value
    });
})

const agePyramidConfig = computed(() => {
    if(!Object.keys(props.config || {}).length) {
        return defaultConfig.value;
    }
    const reconciled = treeShake({
        defaultConfig: defaultConfig.value,
        userConfig: props.config
    });
    return convertConfigColors(reconciled);
});

const mutableConfig = ref({
    inside: !agePyramidConfig.value.style.layout.useDiv,
    showTable: agePyramidConfig.value.table.show,
});

const svg = computed(() => {
    return {
        height: agePyramidConfig.value.style.height,
        width: agePyramidConfig.value.style.width
    }
});

const drawingArea = computed(() => {
    const width = svg.value.width - agePyramidConfig.value.style.layout.padding.right - agePyramidConfig.value.style.layout.padding.left;
    const left = agePyramidConfig.value.style.layout.padding.left;
    const right = svg.value.width - agePyramidConfig.value.style.layout.padding.right;
    return {
        top: agePyramidConfig.value.style.layout.padding.top,
        left,
        right,
        bottom: svg.value.height - agePyramidConfig.value.style.layout.padding.bottom,
        width,
        height: svg.value.height - agePyramidConfig.value.style.layout.padding.top - agePyramidConfig.value.style.layout.padding.bottom,
        centerX: agePyramidConfig.value.style.layout.padding.left + width / 2,
        leftChart: {
            width: (width / 2) - agePyramidConfig.value.style.layout.centerSlit.width,
            right: left + (width / 2) - agePyramidConfig.value.style.layout.centerSlit.width
        },
        rightChart: {
            width: (width / 2) - agePyramidConfig.value.style.layout.centerSlit.width,
            left: left + (width / 2) + agePyramidConfig.value.style.layout.centerSlit.width
        }
    }
});

const yLabels =  computed(() => {
    return props.dataset.map(ds => {
        if (agePyramidConfig.value.style.layout.dataLabels.yAxis.display === 'age') {
            return ds[1];
        } else {
            return ds[0];
        }
    }).reverse();
});

const xLabels = computed(() => {
    const step = closestDecimal(max.value / 5);
    const stepsRight = [];
    const stepsLeft = [];
    for (let i = 0; i <= 5; i += 1) {
        const valueRight = step * i;
        const valueLeft = step * (i - 5);
        stepsRight.push({
            value: valueRight,
            x: drawingArea.value.left + drawingArea.value.width / 2 + agePyramidConfig.value.style.layout.centerSlit.width + ((valueRight / max.value * drawingArea.value.leftChart.width))
        });
        stepsLeft.push({
            value: Math.abs(valueLeft),
            x: drawingArea.value.left + drawingArea.value.width / 2 + ((valueLeft / max.value * drawingArea.value.leftChart.width)) - agePyramidConfig.value.style.layout.centerSlit.width
        });
    }
    return {
        right: stepsRight,
        left: stepsLeft
    }
});

function closestDecimal(number) {
    if (number === 0) return 0;

    const orderOfMagnitude = Math.floor(Math.log10(Math.abs(number)));
    const powerOf10 = 10 ** orderOfMagnitude;

    let roundedValue;
    if (number < 0) {
        roundedValue = Math.round(number / powerOf10) * powerOf10;
    } else {
        roundedValue = Math.round(number / powerOf10) * powerOf10;
    }
    return roundedValue;
}

const max = computed(() => {
    return Math.max(...props.dataset.flatMap(ds => {
        return ds.slice(-2);
    }));
});

const len = computed(() => props.dataset.length);

const mutableDataset = computed(() => {
    return props.dataset.map(ds => {
        return {
            segment: ds[0],
            age: ds[1],
            left: {
                value: ds[2],
                proportionToMax: ds[2] / max.value,
            },
            right: {
                value: ds[3],
                proportionToMax: ds[3] / max.value,
            },
        }
    })
});

const drawableDataset = computed(() => {
    return mutableDataset.value.reverse().map((ds, i) => {
        const y = drawingArea.value.top + (drawingArea.value.height / len.value) * i;
        const height = (drawingArea.value.height / len.value) - agePyramidConfig.value.style.layout.bars.gap;
        return {
            segment: ds.segment,
            age: ds.age,
            left: {
                ...ds.left,
                y,
                color: agePyramidConfig.value.style.layout.bars.left.color,
                x: drawingArea.value.leftChart.right - (ds.left.proportionToMax * drawingArea.value.leftChart.width),
                width: ds.left.proportionToMax * drawingArea.value.leftChart.width,
                height
            },
            right: {
                ...ds.right,
                y,
                color: agePyramidConfig.value.style.layout.bars.right.color,
                x: drawingArea.value.rightChart.left,
                width: ds.right.proportionToMax * drawingArea.value.rightChart.width,
                height
            }
        }
    })
});

function hoverIndex(index) {
    selectedIndex.value = index;

    let html = "";

    const selectedSet = drawableDataset.value[index];
    html += `<div><b>${selectedSet.segment}</b></div>`;
    html += `<div>${agePyramidConfig.value.translations.age} : ${selectedSet.age}</div>`
    html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #e1e5e8">`;
    html += `<div style="display:flex; flex-direction:row;gap:12px">`;
    html += `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center"><svg viewBox="0 0 12 12" height="12" width="12"><rect stroke="none" x="0" y="0" height="12" width="12" rx="2" fill="${agePyramidConfig.value.style.layout.bars.gradient.show ? `url(#age_pyramid_left_${uid.value})` : agePyramidConfig.value.style.layout.bars.left.color}"/></svg><div>${agePyramidConfig.value.translations.female}</div><div><b>${selectedSet.left.value.toLocaleString()}</b></div></div>`;
    html += `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center"><svg viewBox="0 0 12 12" height="12" width="12"><rect stroke="none" x="0" y="0" height="12" width="12" rx="2" fill="${agePyramidConfig.value.style.layout.bars.gradient.show ? `url(#age_pyramid_right_${uid.value})` : agePyramidConfig.value.style.layout.bars.right.color}"/></svg><div>${agePyramidConfig.value.translations.male}</div><div><b>${selectedSet.right.value.toLocaleString()}</b></div></div>`;
    html += `</div>`;
    html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #e1e5e8"><div>${agePyramidConfig.value.translations.total}</div><div><b>${(selectedSet.left.value + selectedSet.right.value).toLocaleString()}</b></div></div>`
    html += `</div>`;

    tooltipContent.value = `<div>${html}</div>`;
    isTooltip.value = true;
}

function generatePdf(){
    isPrinting.value = true;
    nextTick(() => {
        pdf({
            domElement: document.getElementById(`vue-ui-age-pyramid_${uid.value}`),
            fileName: agePyramidConfig.value.style.title.text || 'vue-ui-age-pyramid'
        }).finally(() => {
            isPrinting.value = false;
        });
    })
}

function generateXls() {
    nextTick(() => {
        const labels = [agePyramidConfig.value.translations.year, agePyramidConfig.value.translations.age, agePyramidConfig.value.translations.female, agePyramidConfig.value.translations.male, agePyramidConfig.value.translations.total];

        const values = props.dataset.map(ds => {
            return [
                ds[0],
                ds[1],
                ds[2],
                ds[3],
                ds[2] + ds[3]
            ]
        });

        const tableXls = [[agePyramidConfig.value.style.title.text],[agePyramidConfig.value.style.title.subtitle.text],[[""],[""],[""]]].concat([labels]).concat(values)

        makeXls(tableXls, agePyramidConfig.value.style.title.text || "vue-ui-heatmap");
    });
}

function closeDetails(){
    if(details.value) {
        details.value.removeAttribute("open")
    }
}

</script>

<template>
    <div class="vue-ui-age-pyramid" ref="agePyramid" :id="`vue-ui-age-pyramid_${uid}`" :style="`font-family:${agePyramidConfig.style.fontFamily};width:100%; text-align:center`">
    
        <div v-if="(!mutableConfig.inside || isPrinting) && agePyramidConfig.style.title.text" :style="`width:100%;background:${agePyramidConfig.style.backgroundColor}`">
            <!-- TITLE AS DIV -->
            <div :style="`width:100%;text-align:center;color:${agePyramidConfig.style.title.color};font-size:${agePyramidConfig.style.title.fontSize}px;font-weight:${agePyramidConfig.style.title.bold ? 'bold': ''}`">
                {{ agePyramidConfig.style.title.text }}
            </div>
            <div v-if="agePyramidConfig.style.title.subtitle.text" :style="`width:100%;text-align:center;color:${agePyramidConfig.style.title.subtitle.color};font-size:${agePyramidConfig.style.title.subtitle.fontSize}px;font-weight:${agePyramidConfig.style.title.subtitle.bold ? 'bold': ''}`">
                {{ agePyramidConfig.style.title.subtitle.text }}
            </div>
        </div>

        <!-- OPTIONS -->
        <details class="vue-ui-age-pyramid-user-options" :style="`background:${agePyramidConfig.style.backgroundColor};color:${agePyramidConfig.style.color}`" data-html2canvas-ignore v-if="agePyramidConfig.userOptions.show" ref="details">
            <summary :style="`background:${agePyramidConfig.style.backgroundColor};color:${agePyramidConfig.style.color}`">{{ agePyramidConfig.userOptions.title }}</summary>

            <div class="vue-ui-age-pyramid-user-options-items" :style="`background:${agePyramidConfig.style.backgroundColor};color:${agePyramidConfig.style.color}`">
                <div class="vue-ui-age-pyramid-user-option-item">
                    <input type="checkbox" :id="`vue-ui-age-pyramid-option-title_${uid}`" :name="`vue-ui-age-pyramid-option-title_${uid}`"
                    v-model="mutableConfig.inside">
                    <label :for="`vue-ui-age-pyramid-option-title_${uid}`">{{ agePyramidConfig.userOptions.labels.useDiv }}</label>
                </div>
                <div class="vue-ui-age-pyramid-user-option-item">
                    <input type="checkbox" :id="`vue-ui-age-pyramid-option-table_${uid}`" :name="`vue-ui-age-pyramid-option-table_${uid}`"
                    v-model="mutableConfig.showTable">
                    <label :for="`vue-ui-age-pyramid-option-table_${uid}`">{{ agePyramidConfig.userOptions.labels.showTable }}</label>
                </div>
                <button class="vue-ui-age-pyramid-button" @click="generatePdf" :disabled="isPrinting" style="margin-top:12px" :style="`background:${agePyramidConfig.style.backgroundColor};color:${agePyramidConfig.style.color}`">
                    <svg class="vue-ui-age-pyramid-print-icon" xmlns="http://www.w3.org/2000/svg" v-if="isPrinting" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" :stroke="agePyramidConfig.style.color" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M18 16v.01" />
                        <path d="M6 16v.01" />
                        <path d="M12 5v.01" />
                        <path d="M12 12v.01" />
                        <path d="M12 1a4 4 0 0 1 2.001 7.464l.001 .072a3.998 3.998 0 0 1 1.987 3.758l.22 .128a3.978 3.978 0 0 1 1.591 -.417l.2 -.005a4 4 0 1 1 -3.994 3.77l-.28 -.16c-.522 .25 -1.108 .39 -1.726 .39c-.619 0 -1.205 -.14 -1.728 -.391l-.279 .16l.007 .231a4 4 0 1 1 -2.212 -3.579l.222 -.129a3.998 3.998 0 0 1 1.988 -3.756l.002 -.071a4 4 0 0 1 -1.995 -3.265l-.005 -.2a4 4 0 0 1 4 -4z" />
                    </svg>
                    <span v-else>PDF</span>
                </button>
                <button class="vue-ui-age-pyramid-button" @click="generateXls" :style="`background:${agePyramidConfig.style.backgroundColor};color:${agePyramidConfig.style.color}`">
                    XLSX
                </button>
            </div>
        </details>

        <!-- CHART -->
        <svg :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%;overflow:visible;background:${agePyramidConfig.style.backgroundColor};color:${agePyramidConfig.style.color}`" @click="closeDetails">

            <defs>
                <linearGradient 
                    :id="`age_pyramid_left_${uid}`"
                    x1="0%" y1="0%" x2="100%" y2="0%"
                >
                    <stop 
                        offset="0%" 
                        :stop-color="agePyramidConfig.style.layout.bars.left.color"
                    />
                    <stop 
                        offset="100%" 
                        :stop-color="`${shiftHue(agePyramidConfig.style.layout.bars.left.color, agePyramidConfig.style.layout.bars.gradient.shiftHue)}${opacity[100 - agePyramidConfig.style.layout.bars.gradient.intensity]}`"
                    />
                </linearGradient>
                <linearGradient 
                    :id="`age_pyramid_right_${uid}`"
                    x1="0%" y1="0%" x2="100%" y2="0%"
                >
                    <stop 
                        offset="0%" 
                        :stop-color="`${shiftHue(agePyramidConfig.style.layout.bars.right.color, agePyramidConfig.style.layout.bars.gradient.shiftHue)}${opacity[100 - agePyramidConfig.style.layout.bars.gradient.intensity]}`"
                    />
                    <stop 
                        offset="100%" 
                        :stop-color="agePyramidConfig.style.layout.bars.right.color"
                    />
                </linearGradient>
            </defs>

            <!-- TITLE AS G -->
            <g v-if="agePyramidConfig.style.title.text && mutableConfig.inside && !isPrinting">
                <text
                    :font-size="agePyramidConfig.style.title.fontSize"
                    :fill="agePyramidConfig.style.title.color"
                    :x="svg.width / 2"
                    :y="0"
                    text-anchor="middle"
                    :style="`font-weight:${agePyramidConfig.style.title.bold ? 'bold' : ''}`"
                >
                    {{ agePyramidConfig.style.title.text }}
                </text>
                <text
                    v-if="agePyramidConfig.style.title.subtitle.text"
                    :font-size="agePyramidConfig.style.title.subtitle.fontSize"
                    :fill="agePyramidConfig.style.title.subtitle.color"
                    :x="svg.width / 2"
                    :y="agePyramidConfig.style.title.fontSize"
                    text-anchor="middle"
                    :style="`font-weight:${agePyramidConfig.style.title.subtitle.bold ? 'bold' : ''}`"
                >
                    {{ agePyramidConfig.style.title.subtitle.text }}
                </text>
            </g>

            <g v-for="(segment, i) in drawableDataset">
                <rect
                    :x="segment.left.x"
                    :y="segment.left.y"
                    :width="segment.left.width"
                    :height="segment.left.height"
                    :fill="agePyramidConfig.style.layout.bars.gradient.underlayer"
                    :rx="agePyramidConfig.style.layout.bars.borderRadius"
                />
                <rect
                    :x="segment.left.x"
                    :y="segment.left.y"
                    :width="segment.left.width"
                    :height="segment.left.height"
                    :fill="agePyramidConfig.style.layout.bars.gradient.show ? `url(#age_pyramid_left_${uid})` : segment.left.color"
                    :rx="agePyramidConfig.style.layout.bars.borderRadius"
                />
                <rect
                    :x="segment.right.x"
                    :y="segment.right.y"
                    :width="segment.right.width"
                    :height="segment.right.height"
                    :fill="agePyramidConfig.style.layout.bars.gradient.underlayer"
                    :rx="agePyramidConfig.style.layout.bars.borderRadius"
                />
                <rect
                    :x="segment.right.x"
                    :y="segment.right.y"
                    :width="segment.right.width"
                    :height="segment.right.height"
                    :fill="agePyramidConfig.style.layout.bars.gradient.show ? `url(#age_pyramid_right_${uid})` : segment.right.color"
                    :rx="agePyramidConfig.style.layout.bars.borderRadius"
                />
            </g>

            <!-- LABELS -->
            <g>
                <g v-if="agePyramidConfig.style.layout.dataLabels.sideTitles.show">
                    <text
                        :x="drawingArea.left"
                        :y="drawingArea.top"
                        :fill="agePyramidConfig.style.layout.dataLabels.sideTitles.useSideColor ? agePyramidConfig.style.layout.bars.left.color : agePyramidConfig.style.layout.dataLabels.color"
                        :font-size="agePyramidConfig.style.layout.dataLabels.sideTitles.fontSize"
                        text-anchor="start"
                        :font-weight="agePyramidConfig.style.layout.dataLabels.sideTitles.bold ? 'bold' : 'normal'"
                    >
                        {{ agePyramidConfig.translations.female }}
                    </text>
                    <text
                        :x="drawingArea.right"
                        :y="drawingArea.top"
                        :fill="agePyramidConfig.style.layout.dataLabels.sideTitles.useSideColor ? agePyramidConfig.style.layout.bars.right.color : agePyramidConfig.style.layout.dataLabels.color"
                        :font-size="agePyramidConfig.style.layout.dataLabels.sideTitles.fontSize"
                        text-anchor="end"
                        :font-weight="agePyramidConfig.style.layout.dataLabels.sideTitles.bold ? 'bold' : 'normal'"
                    >
                        {{ agePyramidConfig.translations.male }}
                    </text>
                </g>

                <g v-if="agePyramidConfig.style.layout.dataLabels.yAxis.show">
                    <template v-for="(label, i) in yLabels"> 
                        <text 
                            v-if="i % agePyramidConfig.style.layout.dataLabels.yAxis.showEvery === 0"
                            :x="drawingArea.centerX"
                            :y="drawingArea.top + (drawingArea.height / len) * i + (agePyramidConfig.style.layout.dataLabels.yAxis.fontSize / 3)"
                            text-anchor="middle"
                            :font-size="agePyramidConfig.style.layout.dataLabels.yAxis.fontSize"
                        >
                            {{ label }}
                        </text>
                    </template>
                </g>

                <g v-if="agePyramidConfig.style.layout.dataLabels.xAxis.show">
                    <g v-if="agePyramidConfig.style.layout.grid.show">
                        <line
                            :x1="xLabels.right[0].x"
                            :x2="xLabels.right.at(-1).x"
                            :y1="drawingArea.bottom + agePyramidConfig.style.layout.dataLabels.xAxis.fontSize / 2"
                            :y2="drawingArea.bottom + agePyramidConfig.style.layout.dataLabels.xAxis.fontSize / 2"
                            :stroke="agePyramidConfig.style.layout.grid.stroke"
                            :stroke-width="agePyramidConfig.style.layout.grid.strokeWidth"
                            stroke-linecap="round"
                        />
                        <line
                            :x1="xLabels.left[0].x"
                            :x2="xLabels.left.at(-1).x"
                            :y1="drawingArea.bottom + agePyramidConfig.style.layout.dataLabels.xAxis.fontSize / 2"
                            :y2="drawingArea.bottom + agePyramidConfig.style.layout.dataLabels.xAxis.fontSize / 2"
                            :stroke="agePyramidConfig.style.layout.grid.stroke"
                            :stroke-width="agePyramidConfig.style.layout.grid.strokeWidth"
                            stroke-linecap="round"
                        />
                    </g>
                    <g v-for="rightLabel in xLabels.right">
                        <line v-if="agePyramidConfig.style.layout.grid.show"
                            :x1="rightLabel.x"
                            :x2="rightLabel.x"
                            :y1="drawingArea.bottom + agePyramidConfig.style.layout.dataLabels.xAxis.fontSize / 2"
                            :y2="drawingArea.bottom + agePyramidConfig.style.layout.dataLabels.xAxis.fontSize / 4"
                            :stroke="agePyramidConfig.style.layout.grid.stroke"
                            :stroke-width="agePyramidConfig.style.layout.grid.strokeWidth"
                            stroke-linecap="round"
                        />
                        <text
                            :x="rightLabel.x"
                            :y="drawingArea.bottom + agePyramidConfig.style.layout.dataLabels.xAxis.fontSize * 2"
                            :font-size="agePyramidConfig.style.layout.dataLabels.xAxis.fontSize"
                            :fill="agePyramidConfig.style.layout.dataLabels.xAxis.color"
                            text-anchor="middle"
                        >
                            {{ Number((rightLabel.value / agePyramidConfig.style.layout.dataLabels.xAxis.scale).toFixed(0)).toLocaleString() }}
                        </text>
                    </g>
                    <g v-for="leftLabel in xLabels.left">
                        <line v-if="agePyramidConfig.style.layout.grid.show"
                            :x1="leftLabel.x"
                            :x2="leftLabel.x"
                            :y1="drawingArea.bottom + agePyramidConfig.style.layout.dataLabels.xAxis.fontSize / 2"
                            :y2="drawingArea.bottom + agePyramidConfig.style.layout.dataLabels.xAxis.fontSize / 4"
                            :stroke="agePyramidConfig.style.layout.grid.stroke"
                            :stroke-width="agePyramidConfig.style.layout.grid.strokeWidth"
                            stroke-linecap="round"
                        />
                        <text
                            :x="leftLabel.x"
                            :y="drawingArea.bottom + agePyramidConfig.style.layout.dataLabels.xAxis.fontSize * 2"
                            :font-size="agePyramidConfig.style.layout.dataLabels.xAxis.fontSize"
                            :fill="agePyramidConfig.style.layout.dataLabels.xAxis.color"
                            text-anchor="middle"
                        >
                            {{ Number((leftLabel.value / agePyramidConfig.style.layout.dataLabels.xAxis.scale).toFixed(0)).toLocaleString() }}
                        </text>
                    </g>
                    <text
                        :x="drawingArea.right"
                        :y="svg.height"
                        text-anchor="end"
                        :font-size="agePyramidConfig.style.layout.dataLabels.yAxis.fontSize"
                    >
                        {{ agePyramidConfig.style.layout.dataLabels.xAxis.translation }}
                    </text>
                </g>
            </g>

            <!-- TOOLTIP TRAPS -->
            <g v-for="(_trap, i) in dataset">
                <rect
                    :x="drawingArea.left"
                    :y="drawingArea.top + (drawingArea.height / len) * i - agePyramidConfig.style.layout.bars.gap / 2"
                    :width="drawingArea.width"
                    :height="drawingArea.height / len"
                    :fill="selectedIndex !== null && selectedIndex === i ? `${agePyramidConfig.style.highlighter.color}${opacity[agePyramidConfig.style.highlighter.opacity]}` : 'transparent'"
                    @mouseover="hoverIndex(i)"
                    @mouseleave="selectedIndex = null; isTooltip = false"
                />
            </g>
        </svg>

        <!-- TOOLTIP -->
        <div 
            class="vue-ui-age-pyramid-tooltip"
            ref="tooltip"
            v-if="agePyramidConfig.style.tooltip.show && isTooltip"
            :style="`top:${tooltipPosition.top}px;left:${tooltipPosition.left}px;background:${agePyramidConfig.style.tooltip.backgroundColor};color:${agePyramidConfig.style.tooltip.color}`"
            v-html="tooltipContent"
        />

        <!-- DATA TABLE -->
        <div @click="closeDetails" :style="`${isPrinting ? '' : 'max-height:400px'};overflow:auto;width:100%;margin-top:${mutableConfig.inside ? '48px' : ''}`" v-if="mutableConfig.showTable">
            <table>
                <thead>
                    <tr v-if="agePyramidConfig.style.title.text">
                        <th :colspan="5" :style="`background:${agePyramidConfig.table.th.backgroundColor};color:${agePyramidConfig.table.th.color};outline:${agePyramidConfig.table.th.outline}`">
                            <span>{{ agePyramidConfig.style.title.text }}</span>
                            <span v-if="agePyramidConfig.style.title.subtitle.text">
                                : {{ agePyramidConfig.style.title.subtitle.text }}
                            </span>
                        </th>
                    </tr>
                    <tr>
                        <th :style="`background:${agePyramidConfig.table.th.backgroundColor};color:${agePyramidConfig.table.th.color};outline:${agePyramidConfig.table.th.outline};padding-right:6px`">{{ agePyramidConfig.translations.year }}</th>
                        <th :style="`background:${agePyramidConfig.table.th.backgroundColor};color:${agePyramidConfig.table.th.color};outline:${agePyramidConfig.table.th.outline};padding-right:6px`">{{ agePyramidConfig.translations.age }}</th>
                        <th :style="`background:${agePyramidConfig.table.th.backgroundColor};color:${agePyramidConfig.table.th.color};outline:${agePyramidConfig.table.th.outline};padding-right:6px`">{{ agePyramidConfig.translations.female }}</th>
                        <th :style="`background:${agePyramidConfig.table.th.backgroundColor};color:${agePyramidConfig.table.th.color};outline:${agePyramidConfig.table.th.outline};padding-right:6px`">{{ agePyramidConfig.translations.male }}</th>
                        <th :style="`background:${agePyramidConfig.table.th.backgroundColor};color:${agePyramidConfig.table.th.color};outline:${agePyramidConfig.table.th.outline};padding-right:6px`">{{ agePyramidConfig.translations.total }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="tr in dataset">
                        <td :style="`background:${agePyramidConfig.table.td.backgroundColor};color:${agePyramidConfig.table.td.color};outline:${agePyramidConfig.table.td.outline}`">
                            {{ tr[0] }}
                        </td>
                        <td :style="`background:${agePyramidConfig.table.td.backgroundColor};color:${agePyramidConfig.table.td.color};outline:${agePyramidConfig.table.td.outline}`">
                            {{ tr[1] }}
                        </td>
                        <td :style="`background:${agePyramidConfig.table.td.backgroundColor};color:${agePyramidConfig.table.td.color};outline:${agePyramidConfig.table.td.outline}`">
                            {{ tr[2].toLocaleString() }}
                        </td>
                        <td :style="`background:${agePyramidConfig.table.td.backgroundColor};color:${agePyramidConfig.table.td.color};outline:${agePyramidConfig.table.td.outline}`">
                            {{ tr[3].toLocaleString() }}
                        </td>
                        <td :style="`background:${agePyramidConfig.table.td.backgroundColor};color:${agePyramidConfig.table.td.color};outline:${agePyramidConfig.table.td.outline}`">
                            {{ (tr[2] + tr[3]).toLocaleString() }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

    </div>
</template>

<style scoped>
.vue-ui-age-pyramid *{
    transition: unset;
}
.vue-ui-age-pyramid {
    user-select: none;
    position: relative;
    padding-top: 36px;
}
.vue-ui-age-pyramid .vue-ui-age-pyramid-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}
.vue-ui-age-pyramid-legend {
    height: 100%;
    width:100%;
    display: flex;
    align-items:center;
    flex-wrap: wrap;
    justify-content:center;
    column-gap: 18px;
}
.vue-ui-age-pyramid-legend-item {
    display: flex;
    align-items:center;
    gap: 6px;
    cursor: pointer;
    height: 24px;
}

/** */
.vue-ui-age-pyramid-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    max-width: 300px;
    position: fixed;
    padding:12px;
    z-index:1;
}
.vue-ui-age-pyramid-user-options {
    border-radius: 4px;
    padding: 6px 12px;
    position: absolute;
    right:0;
    top:0px;
    max-width: 300px;
    text-align:left;
}
.vue-ui-age-pyramid-user-options[open] {
    border: 1px solid #e1e5e8;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
}
.vue-ui-age-pyramid summary {
    text-align: right;
    direction: rtl;
}
.vue-ui-age-pyramid-user-options-items {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 6px;
}
.vue-ui-age-pyramid-user-options-item {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items:center;
}

.vue-ui-age-pyramid-button {
    margin: 6px 0;
    border-radius: 3px;
    height: 30px;
    border: 1px solid #b9bfc4;
    background: inherit;
    display: flex;
    align-items:center;
    justify-content: center;
}
.vue-ui-age-pyramid-button:hover {
    background: rgba(0,0,0,0.05);
}
.vue-ui-age-pyramid-print-icon {
    animation: smartspin 0.5s infinite linear;
}
@keyframes smartspin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.vue-ui-age-pyramid table {
    width: 100%;
    border-collapse:collapse;
}
.vue-ui-age-pyramid table td {
    text-align:right;
    padding-right: 6px;
    font-variant-numeric: tabular-nums;
}
.vue-ui-age-pyramid table th {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
}
</style>