<script setup>
import { ref, computed, nextTick } from "vue";
import { opacity, shiftHue, createUid, createCsvContent, downloadCsv } from '../lib';
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
import { useNestedProp } from "../useNestedProp";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Tooltip from "../atoms/Tooltip.vue";
import DataTable from "../atoms/DataTable.vue";

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

const uid = ref(createUid());

const defaultConfig = ref(mainConfig.vue_ui_age_pyramid);

const isImaging = ref(false);
const isPrinting = ref(false);
const agePyramid = ref(null);
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const selectedIndex = ref(null);
const step = ref(0);

const agePyramidConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
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
    });
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
    return mutableDataset.value.map((ds, i) => {
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

function useTooltip(index, datapoint) {
    selectedIndex.value = index;

    const customFormat = agePyramidConfig.value.style.tooltip.customFormat;

    if (customFormat && typeof customFormat === 'function' && typeof customFormat({
            seriesIndex: index,
            datapoint: {
                segment: datapoint[0],
                index: datapoint[1],
                left: datapoint[2],
                right: datapoint[3]
            },
            series: drawableDataset.value,
            config: agePyramidConfig.value
        }) === 'string') {
        tooltipContent.value = customFormat({
            seriesIndex: index,
            datapoint: {
                segment: datapoint[0],
                index: datapoint[1],
                left: datapoint[2],
                right: datapoint[3]
            },
            series: drawableDataset.value,
            config: agePyramidConfig.value
        })
    } else {
        let html = "";
    
        const selectedSet = drawableDataset.value[index];
        html += `<div><b>${selectedSet.segment}</b></div>`;
        html += `<div>${agePyramidConfig.value.translations.age} : ${selectedSet.age}</div>`
        html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #e1e5e8">`;
        html += `<div style="display:flex; flex-direction:row;gap:12px">`;
        html += `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center"><svg viewBox="0 0 12 12" height="12" width="12"><rect stroke="none" x="0" y="0" height="12" width="12" rx="2" fill="${agePyramidConfig.value.style.layout.bars.gradient.underlayer}"/><rect stroke="none" x="0" y="0" height="12" width="12" rx="2" fill="${agePyramidConfig.value.style.layout.bars.gradient.show ? `url(#age_pyramid_left_${uid.value})` : agePyramidConfig.value.style.layout.bars.left.color}"/></svg><div>${agePyramidConfig.value.translations.female}</div><div><b>${selectedSet.left.value.toLocaleString()}</b></div></div>`;
        html += `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center"><svg viewBox="0 0 12 12" height="12" width="12"><rect stroke="none" x="0" y="0" height="12" width="12" rx="2" fill="${agePyramidConfig.value.style.layout.bars.gradient.underlayer}"/><rect stroke="none" x="0" y="0" height="12" width="12" rx="2" fill="${agePyramidConfig.value.style.layout.bars.gradient.show ? `url(#age_pyramid_right_${uid.value})` : agePyramidConfig.value.style.layout.bars.right.color}"/></svg><div>${agePyramidConfig.value.translations.male}</div><div><b>${selectedSet.right.value.toLocaleString()}</b></div></div>`;
        html += `</div>`;
        html += `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #e1e5e8"><div>${agePyramidConfig.value.translations.total}</div><div><b>${(selectedSet.left.value + selectedSet.right.value).toLocaleString()}</b></div></div>`
        html += `</div>`;
    
        tooltipContent.value = `<div>${html}</div>`;
    }

    isTooltip.value = true;
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
            domElement: document.getElementById(`vue-ui-age-pyramid_${uid.value}`),
            fileName: agePyramidConfig.value.style.title.text || 'vue-ui-age-pyramid'
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
            domElement: document.getElementById(`vue-ui-age-pyramid_${uid.value}`),
            fileName: agePyramidConfig.value.style.title.text || 'vue-ui-age-pyramid',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

function generateCsv() {
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
        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: agePyramidConfig.value.style.title.text || "vue-ui-heatmap"});
    });
}

const dataTable = computed(() => {
    const head = [
        agePyramidConfig.value.translations.year,
        agePyramidConfig.value.translations.age,
        agePyramidConfig.value.translations.female,
        agePyramidConfig.value.translations.male,
        agePyramidConfig.value.translations.total
    ];
    const body = props.dataset.map(ds => {
        return [
            ds[0],
            ds[1],
            ds[2].toLocaleString(),
            ds[3].toLocaleString(),
            (ds[2] + ds[3]).toLocaleString()
        ]
    });
    const config = {
        th: {
            backgroundColor: agePyramidConfig.value.table.th.backgroundColor,
            color: agePyramidConfig.value.table.th.color,
            outline: agePyramidConfig.value.table.th.outline
        },
        td: {
            backgroundColor: agePyramidConfig.value.table.td.backgroundColor,
            color: agePyramidConfig.value.table.td.color,
            outline: agePyramidConfig.value.table.td.outline
        },
        breakpoint: agePyramidConfig.value.table.responsiveBreakpoint
    };
    
    return { head, body, config, colNames: head}
})

const isFullscreen = ref(false)
function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

defineExpose({
    generatePdf,
    generateCsv,
    generateImage
});

</script>

<template>
    <div :class="`vue-ui-age-pyramid ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''}`" ref="agePyramid" :id="`vue-ui-age-pyramid_${uid}`" :style="`font-family:${agePyramidConfig.style.fontFamily};width:100%; text-align:center;${!agePyramidConfig.style.title.text ? 'padding-top:36px' : ''};background:${agePyramidConfig.style.backgroundColor}`">
    
        <div v-if="(!mutableConfig.inside || isPrinting) && agePyramidConfig.style.title.text" :style="`width:100%;background:${agePyramidConfig.style.backgroundColor}`">
            <Title
                :config="{
                    title: {
                        cy: 'pyramid-div-title',
                        text: agePyramidConfig.style.title.text,
                        color: agePyramidConfig.style.title.color,
                        fontSize: agePyramidConfig.style.title.fontSize,
                        bold: agePyramidConfig.style.title.bold
                    },
                    subtitle: {
                        cy: 'pyramid-div-subtitle',
                        text: agePyramidConfig.style.title.subtitle.text,
                        color: agePyramidConfig.style.title.subtitle.color,
                        fontSize: agePyramidConfig.style.title.subtitle.fontSize,
                        bold: agePyramidConfig.style.title.subtitle.bold
                    },
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="agePyramidConfig.userOptions.show"
            :backgroundColor="agePyramidConfig.style.backgroundColor"
            :color="agePyramidConfig.style.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :title="agePyramidConfig.userOptions.title"
            :uid="uid"
            :hasImg="true"
            hasTable
            hasFullscreen
            :isFullscreen="isFullscreen"
            :chartElement="agePyramid"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="mutableConfig.showTable = !mutableConfig.showTable"
        />

        <!-- CHART -->
        <svg :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%;overflow:visible;background:${agePyramidConfig.style.backgroundColor};color:${agePyramidConfig.style.color}`" >

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
                        :fill="agePyramidConfig.style.layout.dataLabels.sideTitles.useSideColor ? agePyramidConfig.style.layout.bars.left.color : agePyramidConfig.style.layout.dataLabels.sideTitles.color"
                        :font-size="agePyramidConfig.style.layout.dataLabels.sideTitles.fontSize"
                        text-anchor="start"
                        :font-weight="agePyramidConfig.style.layout.dataLabels.sideTitles.bold ? 'bold' : 'normal'"
                    >
                        {{ agePyramidConfig.translations.female }}
                    </text>
                    <text
                        :x="drawingArea.right"
                        :y="drawingArea.top"
                        :fill="agePyramidConfig.style.layout.dataLabels.sideTitles.useSideColor ? agePyramidConfig.style.layout.bars.right.color : agePyramidConfig.style.layout.dataLabels.sideTitles.color"
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
                            :fill="agePyramidConfig.style.layout.dataLabels.yAxis.color"
                            :font-weight="agePyramidConfig.style.layout.dataLabels.yAxis.bold ? 'bold': 'normal'"
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
                            :font-weight="agePyramidConfig.style.layout.dataLabels.xAxis.bold ? 'bold': 'normal'"
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
                            :font-weight="agePyramidConfig.style.layout.dataLabels.xAxis.bold ? 'bold': 'normal'"
                        >
                            {{ Number((leftLabel.value / agePyramidConfig.style.layout.dataLabels.xAxis.scale).toFixed(0)).toLocaleString() }}
                        </text>
                    </g>
                    <text
                        :x="drawingArea.right"
                        :y="svg.height"
                        text-anchor="end"
                        :font-size="agePyramidConfig.style.layout.dataLabels.xAxis.fontSize"
                        :fill="agePyramidConfig.style.layout.dataLabels.xAxis.color"
                        :font-weight="agePyramidConfig.style.layout.dataLabels.xAxis.bold ? 'bold': 'normal'"
                    >
                        {{ agePyramidConfig.style.layout.dataLabels.xAxis.translation }}
                    </text>
                </g>
            </g>

            <!-- TOOLTIP TRAPS -->
            <g v-for="(datapoint, i) in dataset">
                <rect
                    :x="drawingArea.left"
                    :y="drawingArea.top + (drawingArea.height / len) * i - agePyramidConfig.style.layout.bars.gap / 2"
                    :width="drawingArea.width"
                    :height="drawingArea.height / len"
                    :fill="selectedIndex !== null && selectedIndex === i ? `${agePyramidConfig.style.highlighter.color}${opacity[agePyramidConfig.style.highlighter.opacity]}` : 'transparent'"
                    @mouseover="useTooltip(i, datapoint)"
                    @mouseleave="selectedIndex = null; isTooltip = false"
                />
            </g>

            <slot name="svg" :svg="svg"/>
        </svg>

        <!-- TOOLTIP -->
        <Tooltip
            :show="agePyramidConfig.style.tooltip.show && isTooltip"
            :backgroundColor="agePyramidConfig.style.tooltip.backgroundColor"
            :color="agePyramidConfig.style.tooltip.color"
            :parent="agePyramid"
            :content="tooltipContent"
        />

        <!-- DATA TABLE -->
        <div  :style="`${isPrinting ? '' : 'max-height:400px'};overflow:auto;width:100%;margin-top:${mutableConfig.inside ? '48px' : ''}`" v-if="mutableConfig.showTable">
            <DataTable
                :colNames="dataTable.colNames"
                :head="dataTable.head"
                :body="dataTable.body"
                :config="dataTable.config"
                :title="`${agePyramidConfig.style.title.text}${agePyramidConfig.style.title.subtitle.text ? ` : ${agePyramidConfig.style.title.subtitle.text}` : ''}`"
            >
                <template #th="{ th }">
                    {{ th }}
                </template>
                <template #td="{ td }">
                    {{ td }}
                </template>
            </DataTable>
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
    font-variant-numeric: tabular-nums;
}

.vue-data-ui-fullscreen--on {
    height: 90% !important;
    margin: 0 auto !important;
}
.vue-data-ui-fullscreen--off {
    max-width: 100%;
}
.vue-data-ui-wrapper-fullscreen {
    overflow: auto;
}
</style>