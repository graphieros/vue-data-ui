<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { treeShake, palette, createPolygonPath, createStar, giftWrap, shiftHue, opacity, convertColorToHex, convertConfigColors, makeXls } from "../lib";
import pdf from "../pdf.js";
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
    }
});

const uid = ref(`vue-ui-quadrant-${Math.random()}`);

const emit = defineEmits(['selectPlot', 'selectSide', 'selectLegend']);

const defaultConfig = ref(mainConfig.vue_ui_quadrant);

const isPrinting = ref(false);
const quadrantChart = ref(null);
const tooltip = ref(null);
const details = ref(null);
const clientPosition = ref(useMouse());
const isTooltip = ref(false);
const tooltipContent = ref("");

onMounted(() => {
    const xLabelMin = document.getElementById("xLabelMin");
    if(xLabelMin) {
        const bboxXMin = xLabelMin.getBBox();
        const xPosition = bboxXMin.height / 2 + svg.value.padding * 0.6;
        const yPosition = svg.value.centerY;
        xLabelMin.setAttributeNS(null, "transform", `rotate(-90, ${xPosition}, ${yPosition})`);
        xLabelMin.setAttributeNS(null, "x", xPosition);
        xLabelMin.setAttributeNS(null, "y", yPosition);
    }
    
    const xLabelMax = document.getElementById("xLabelMax");
    if(xLabelMax) {
        const bboxXMax = xLabelMax.getBBox();
        const xPosition = bboxXMax.height / 2 + svg.value.right;
        const yPosition = svg.value.centerY;
        xLabelMax.setAttributeNS(null, "transform", `rotate(90, ${xPosition}, ${yPosition})`);
        xLabelMax.setAttributeNS(null, "x", xPosition);
        xLabelMax.setAttributeNS(null, "y", yPosition);
    }

    const xLabelMaxName = document.getElementById("xLabelMaxName");
    if(xLabelMaxName) {
        const bboxXMaxName = xLabelMaxName.getBBox();
        const xPosition = bboxXMaxName.height / 2 + svg.value.right + svg.value.padding * 0.3;
        const yPosition = svg.value.centerY;
        xLabelMaxName.setAttributeNS(null, "transform", `rotate(90, ${xPosition}, ${yPosition})`);
        xLabelMaxName.setAttributeNS(null, "x", xPosition);
        xLabelMaxName.setAttributeNS(null, "y", yPosition);
    }

});

const tooltipPosition = computed(() => {
    return calcTooltipPosition({
        tooltip: tooltip.value,
        chart: quadrantChart.value,
        clientPosition: clientPosition.value
    });
});

const quadrantConfig = computed(() => {
    if(!Object.keys(props.config || {}).length) {
        return defaultConfig.value;
    }

    const reconcilied = treeShake({
        defaultConfig: defaultConfig.value,
        userConfig: props.config
    });
    return convertConfigColors(reconcilied);
});

const mutableConfig = ref({
    plotLabels: {
        show: quadrantConfig.value.style.chart.layout.labels.plotLabels.show,
    },
    inside: !quadrantConfig.value.style.chart.layout.useDiv,
    showTable: quadrantConfig.value.table.show
});

const svg = computed(() => {
    const offsetTop = mutableConfig.value.inside ? 100 : 0;
    const offsetBottom = mutableConfig.value.inside ? 100 : 0;
    const padding = 48;
    return {
        height: quadrantConfig.value.style.chart.height + offsetTop + offsetBottom,
        usableHeight: quadrantConfig.value.style.chart.height - padding * 2,
        width: quadrantConfig.value.style.chart.width,
        usableWidth: quadrantConfig.value.style.chart.width - padding * 2,
        top: offsetTop + padding,
        left: padding,
        right: quadrantConfig.value.style.chart.width - padding,
        bottom: quadrantConfig.value.style.chart.height + offsetTop - padding,
        centerX: quadrantConfig.value.style.chart.width / 2,
        centerY: quadrantConfig.value.style.chart.height + offsetTop - (quadrantConfig.value.style.chart.height / 2),
        padding
    }
});

const graduations = computed(() => {
    const grads = quadrantConfig.value.style.chart.layout.grid.graduations.steps;
    const stepX = svg.value.usableWidth / (grads * 2);
    const stepY = svg.value.top

    const gradArray = [];
    for(let i = 0; i < grads; i += 1) {
        gradArray.push({
            x: svg.value.padding + stepX * i,
            y: stepY + (svg.value.usableHeight * (i / grads / 2)),
            height: svg.value.usableHeight * (1 - (i / (grads))),
            width: svg.value.usableWidth * (1 - (i / grads)),
            opacity: opacity[Math.round((i+1) / grads * 20)]
        })
    }

    return gradArray;
});

const axisValues = computed(() => {
    let xMax = quadrantConfig.value.style.chart.layout.grid.xAxis.max;
    let xMin = quadrantConfig.value.style.chart.layout.grid.xAxis.min;
    let yMax = quadrantConfig.value.style.chart.layout.grid.yAxis.max;
    let yMin = quadrantConfig.value.style.chart.layout.grid.yAxis.min;

    if(quadrantConfig.value.style.chart.layout.grid.xAxis.auto) {
        xMax = Math.max(...immutableDataset.value.flatMap(category => {
            return category.series.map(s => s.x)
        }));
        xMin = Math.min(...immutableDataset.value.flatMap(category => {
            return category.series.map(s => s.x)
        }));
    }
    if(quadrantConfig.value.style.chart.layout.grid.yAxis.auto) {
        yMax = Math.max(...immutableDataset.value.flatMap(category => {
            return category.series.map(s => s.y)
        }));
        yMin = Math.min(...immutableDataset.value.flatMap(category => {
            return category.series.map(s => s.y)
        }));
    }

    return {
        x: {
            max: xMax,
            min: xMin
        },
        y: {
            max: yMax,
            min: yMin
        }
    }
});

const segregated = ref([]);

const immutableDataset = computed(() => props.dataset.map((category, i) => {
    return {
        ...category,
        id: `cat_${i}_${uid.value}`,
        color: convertColorToHex(category.color) || palette[i],
    }
}));

const mutableDataset = computed(() => {
    return immutableDataset.value.filter(category => {
        return !segregated.value.includes(category.id);
    });
});

const datasetReference = computed(() => {
    return immutableDataset.value.map((category, i) => {
        return {
            ...category,
            shape: category.shape || "circle",
            series: category.series.map(s => {
                return {
                    ...s,
                    x: calcX(s.x),
                    y: calcY(s.y),
                    xValue: s.x,
                    yValue: s.y,
                    quadrantSide: getQuadrantSide({x: s.x, y: s.y}),
                    categoryName: category.name,
                    shape: category.shape,
                    color: category.color
                }
            })
        }
    })
});

const drawableDataset = computed(() => {
    return mutableDataset.value.map((category, i) => {
        return {
            ...category,
            shape: category.shape || "circle",
            color: category.color || palette[i],
            series: category.series.map(s => {
                return {
                    ...s,
                    x: calcX(s.x),
                    y: calcY(s.y),
                    xValue: s.x,
                    yValue: s.y,
                    quadrantSide: getQuadrantSide({x: s.x, y: s.y}),
                    categoryName: category.name,
                    shape: category.shape,
                    color: category.color
                }
            })
        }
    })
});

function calcX(x) {
    const ratio = x / axisValues.value.x.max;
    return svg.value.centerX + ((svg.value.usableWidth / 2) * ratio);
}

function calcY(y) {
    const ratio = y / axisValues.value.y.max;
    return svg.value.centerY + (1-(svg.value.usableHeight / 2) * ratio);
}

const table = computed(() => {
    const tableData = drawableDataset.value.flatMap(category => {
        return category.series.map(s => {
            return {
                x: s.xValue,
                y: s.yValue,
                name: s.name,
                category: s.categoryName,
                quadrantSide: s.quadrantSide,
                sideName: quadrantConfig.value.style.chart.layout.labels.quadrantLabels[s.quadrantSide].text,
                color: category.color,
                shape: category.shape
            }
        })
    });
    const xAxisName = quadrantConfig.value.style.chart.layout.grid.xAxis.name || "x";
    const yAxisName = quadrantConfig.value.style.chart.layout.grid.yAxis.name || "y";
    const head = [quadrantConfig.value.translations.category, quadrantConfig.value.translations.item, xAxisName, yAxisName, quadrantConfig.value.translations.side];

    const body = tableData.map(td => {
        return [td.category, td.name, td.x, td.y, td.sideName || td.quadrantSide]
    });

    return { head, body };
});

function makeLegendShape(shape, color) {
    let result = "";
    switch (shape) {
        case 'circle':
            result = `<span style="color:${color}">●</span>`;
            break;
        
        case 'triangle':
            result = `<span style="color:${color}">▲</span>`;
            break;
        
        case 'square':
            result = `<span style="color:${color}">◼</span>`;
            break;

        case 'diamond':
            result = `<span style="color:${color}">◆</span>`;
            break;

        case 'pentagon':
            result = `<span style="color:${color}">⬟</span>`;
            break;

        case 'hexagon':
            result = `<span style="color:${color}">⬣</span>`;
            break;

        case 'star':
            result = `<span style="color:${color}">🟊</span>`;
            break;
    
        default:
            break;
    }
    return result;
}

const legend = computed(() => {
    return datasetReference.value.map(category => {
        return {
            name: category.name,
            shapePath: makeLegendShape(category.shape, category.color),
            id: category.id
        }
    })
});


function segregate(id) {
    if(segregated.value.includes(id)) {
        segregated.value = segregated.value.filter(s => s !== id);
    } else {
        segregated.value.push(id)
    }
    const currentData = getData();
    emit('selectLegend', currentData);
}

function getQuadrantSide(plot) {
    switch (true) {
        case plot.x >= 0 && plot.y >= 0:
            return "tr";
        
        case plot.x >= 0 && plot.y < 0:
            return "br";

        case plot.x < 0 && plot.y < 0:
            return "bl";

        case plot.x < 0 && plot.y >= 0:
            return "tl";    
        default:
            return "";
    }
}

function hoverPlot(category, plot) {
    isTooltip.value = true;
    let html = "";

    if(plot.quadrantSide) {
        html += `<div style="color:${quadrantConfig.value.style.chart.layout.labels.quadrantLabels[plot.quadrantSide].color};font-weight:${quadrantConfig.value.style.chart.layout.labels.quadrantLabels[plot.quadrantSide].bold ? 'bold' : '400'}">${quadrantConfig.value.style.chart.layout.labels.quadrantLabels[plot.quadrantSide].text}</div>`;
    }
    html += `<div>${category.name}</div>`;
    html += `<div style="padding-bottom:6px;border-bottom:1px solid #e1e5e8;margin-bottom:3px">${plot.name}</div>`;
    html += `<div>${quadrantConfig.value.style.chart.layout.grid.xAxis.name ? quadrantConfig.value.style.chart.layout.grid.xAxis.name : 'x'} : <b>${plot.xValue.toFixed(quadrantConfig.value.style.chart.tooltip.roundingValue)}</b></div>`;  
    html += `<div>${quadrantConfig.value.style.chart.layout.grid.yAxis.name ? quadrantConfig.value.style.chart.layout.grid.yAxis.name : 'y'} : <b>${plot.yValue.toFixed(quadrantConfig.value.style.chart.tooltip.roundingValue)}</b></div>`;  

    tooltipContent.value = `<div style="text-align:left;font-size:${quadrantConfig.value.style.chart.tooltip.fontSize}px">${html}</div>`;
}

function selectPlot(category, plot) {
    const plotEmit = {
        category: category.name,
        itemName: plot.name,
        x: plot.xValue,
        y: plot.yValue,
        quadrantSide: plot.quadrantSide,
        sideName: quadrantConfig.value.style.chart.layout.labels.quadrantLabels[plot.quadrantSide].text
    }
    emit("selectPlot", plotEmit);
}

function selectSide(side) {
    const sidePlots = drawableDataset.value.flatMap(category => category.series.filter(s => s.quadrantSide === side).map(s => {
        return {
            category: s.categoryName,
            itemName: s.name,
            x: s.xValue,
            y: s.yValue
        }
    }));
    const sideEmit = {
        quadrantSide: side,
        sideName: quadrantConfig.value.style.chart.layout.labels.quadrantLabels[side].text,
        items: [...sidePlots]
    }
    emit("selectSide", sideEmit);
}

function getData() {
    return drawableDataset.value.map(ds => {
        return {
            color: ds.color,
            name: ds.name,
            shape: ds.shape,
            series: ds.series.map(s => {
                return {
                    name: s.name,
                    x: s.xValue,
                    y: s.yValue,
                    quadrantSide: s.quadrantSide,
                    sideName: quadrantConfig.value.style.chart.layout.labels.quadrantLabels[s.quadrantSide].text
                }
            }),
        }
    });
}

defineExpose({
    getData
});

function closeDetails(){
    if(details.value) {
        details.value.removeAttribute("open")
    }
}

function generatePdf(){
    isPrinting.value = true;
    nextTick(() => {
        pdf({
            domElement: document.getElementById(`vue-ui-quadrant_${uid.value}`),
            fileName: quadrantConfig.value.style.chart.title.text || 'vue-ui-quadrant'
        }).finally(() => {
            isPrinting.value = false;
        });
    })
}

function generateXls() {
    nextTick(() => {
        const title = [[quadrantConfig.value.style.chart.title.text], [quadrantConfig.value.style.chart.title.subtitle.text], [""]];
        const head = table.value.head;
        const body = table.value.body
        const tableXls = title.concat([head]).concat(body);
        makeXls(tableXls, quadrantConfig.value.style.chart.title.text || 'vue-ui-quadrant');
    });
}

</script>

<template>
    <div class="vue-ui-quadrant" ref="quadrantChart" :id="`vue-ui-quadrant_${uid}`" :style="`font-family:${quadrantConfig.style.fontFamily};width:100%; text-align:center`">

        <!-- TITLE AS DIV -->
        <div v-if="(!mutableConfig.inside || isPrinting) && quadrantConfig.style.chart.title.text" :style="`width:100%;background:${quadrantConfig.style.chart.backgroundColor};padding-bottom:12px`">
            <div :style="`width:100%;text-align:center;color:${quadrantConfig.style.chart.title.color};font-size:${quadrantConfig.style.chart.title.fontSize}px;font-weight:${quadrantConfig.style.chart.title.bold ? 'bold': ''}`">
                {{ quadrantConfig.style.chart.title.text }}
            </div>
            <div v-if="quadrantConfig.style.chart.title.subtitle.text" :style="`width:100%;text-align:center;color:${quadrantConfig.style.chart.title.subtitle.color};font-size:${quadrantConfig.style.chart.title.subtitle.fontSize}px;font-weight:${quadrantConfig.style.chart.title.subtitle.bold ? 'bold': ''}`">
                {{ quadrantConfig.style.chart.title.subtitle.text }}
            </div>
        </div>

        <!-- OPTIONS -->
        <details class="vue-ui-quadrant-user-options" :style="`background:${quadrantConfig.style.chart.backgroundColor};color:${quadrantConfig.style.chart.color}`" data-html2canvas-ignore v-if="quadrantConfig.userOptions.show" ref="details">
            <summary :style="`background:${quadrantConfig.style.chart.backgroundColor};color:${quadrantConfig.style.chart.color}`">{{ quadrantConfig.userOptions.title }}</summary>
            <div class="vue-ui-quadrant-user-options-items" :style="`background:${quadrantConfig.style.chart.backgroundColor};color:${quadrantConfig.style.chart.color}`">
                <div class="vue-ui-quadrant-user-option-item">
                    <input type="checkbox" :id="`vue-ui-quadrant-option-plotLabels_${uid}`" :name="`vue-ui-quadrant-option-plotLabels_${uid}`"
                    v-model="mutableConfig.plotLabels.show">
                    <label :for="`vue-ui-quadrant-option-plotLabels_${uid}`">{{ quadrantConfig.userOptions.labels.showPlotLabels }}</label>
                </div>
                <div class="vue-ui-quadrant-user-option-item">
                    <input type="checkbox" :id="`vue-ui-quadrant-option-title_${uid}`" :name="`vue-ui-quadrant-option-title_${uid}`"
                    v-model="mutableConfig.inside">
                    <label :for="`vue-ui-quadrant-option-title_${uid}`">{{ quadrantConfig.userOptions.labels.useDiv }}</label>
                </div>
                <div class="vue-ui-quadrant-user-option-item">
                    <input type="checkbox" :id="`vue-ui-quadrant-option-table_${uid}`" :name="`vue-ui-quadrant-option-table_${uid}`"
                    v-model="mutableConfig.showTable">
                    <label :for="`vue-ui-quadrant-option-table_${uid}`">{{ quadrantConfig.userOptions.labels.showTable }}</label>
                </div>
                <button class="vue-ui-quadrant-button" @click="generatePdf" :disabled="isPrinting" style="margin-top:12px" :style="`color:${quadrantConfig.style.chart.color}`">
                    <svg class="vue-ui-quadrant-print-icon" xmlns="http://www.w3.org/2000/svg" v-if="isPrinting" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" :stroke="quadrantConfig.style.chart.color" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M18 16v.01" />
                        <path d="M6 16v.01" />
                        <path d="M12 5v.01" />
                        <path d="M12 12v.01" />
                        <path d="M12 1a4 4 0 0 1 2.001 7.464l.001 .072a3.998 3.998 0 0 1 1.987 3.758l.22 .128a3.978 3.978 0 0 1 1.591 -.417l.2 -.005a4 4 0 1 1 -3.994 3.77l-.28 -.16c-.522 .25 -1.108 .39 -1.726 .39c-.619 0 -1.205 -.14 -1.728 -.391l-.279 .16l.007 .231a4 4 0 1 1 -2.212 -3.579l.222 -.129a3.998 3.998 0 0 1 1.988 -3.756l.002 -.071a4 4 0 0 1 -1.995 -3.265l-.005 -.2a4 4 0 0 1 4 -4z" />
                    </svg>
                    <span v-else>PDF</span>
                </button>
                <button class="vue-ui-quadrant-button" @click="generateXls" :style="`color:${quadrantConfig.style.chart.color}`">
                    XLSX
                </button>
            </div>
        </details>

        <!-- CHART -->
        <svg :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%;overflow:visible;background:${quadrantConfig.style.chart.backgroundColor};color:${quadrantConfig.style.chart.color}`" @click="closeDetails">
            
            <!-- DEFS -->
            <defs>
                <radialGradient
                    cx="50%" cy="50%" r="50%" fx="50%" fy="50%"
                    v-for="(d, i) in drawableDataset"
                    :id="`quadrant_gradient_${uid}_${i}`"
                >
                    <stop offset="0%" :stop-color="`${shiftHue(d.color, 0.05)}${opacity[quadrantConfig.style.chart.layout.areas.opacity]}`"/>
                    <stop offset="100%" :stop-color="d.color + opacity[quadrantConfig.style.chart.layout.areas.opacity]" />
                </radialGradient>
            </defs>

            <!-- TITLE AS G -->
            <g v-if="quadrantConfig.style.chart.title.text && mutableConfig.inside && !isPrinting">
                <text
                    :font-size="quadrantConfig.style.chart.title.fontSize"
                    :fill="quadrantConfig.style.chart.title.color"
                    :x="svg.width / 2"
                    :y="quadrantConfig.style.chart.title.fontSize + 6"
                    text-anchor="middle"
                    :style="`font-weight:${quadrantConfig.style.chart.title.bold ? 'bold' : ''}`"
                >
                    {{ quadrantConfig.style.chart.title.text }}
                </text>
                <text
                    v-if="quadrantConfig.style.chart.title.subtitle.text"
                    :font-size="quadrantConfig.style.chart.title.subtitle.fontSize"
                    :fill="quadrantConfig.style.chart.title.subtitle.color"
                    :x="svg.width / 2"
                    :y="quadrantConfig.style.chart.title.fontSize * 2 + 6"
                    text-anchor="middle"
                    :style="`font-weight:${quadrantConfig.style.chart.title.subtitle.bold ? 'bold' : ''}`"
                >
                    {{ quadrantConfig.style.chart.title.subtitle.text }}
                </text>
            </g>

            <!-- GRID -->            
            <!-- GRADUATIONS-->
            <g v-if="quadrantConfig.style.chart.layout.grid.graduations.show">
                <rect v-for="graduation in graduations"
                    :fill="quadrantConfig.style.chart.layout.grid.graduations.fill ? `${quadrantConfig.style.chart.layout.grid.graduations.color}${graduation.opacity}` : 'none'"
                    :x="graduation.x"
                    :y="graduation.y"
                    :height="graduation.height"
                    :width="graduation.width"
                    :stroke-width="quadrantConfig.style.chart.layout.grid.graduations.strokeWidth"
                    :stroke="quadrantConfig.style.chart.layout.grid.graduations.stroke"
                    :rx="quadrantConfig.style.chart.layout.grid.graduations.roundingForce"
                />
            </g>

            <!-- AXIS -->
            <line
                :x1="svg.left"
                :y1="svg.centerY"
                :x2="svg.right"
                :y2="svg.centerY"
                :stroke="quadrantConfig.style.chart.layout.grid.stroke"
                :stroke-width="quadrantConfig.style.chart.layout.grid.strokeWidth"
            />
            <line
                :x1="svg.centerX"
                :y1="svg.top"
                :x2="svg.centerX"
                :y2="svg.bottom"
                :stroke="quadrantConfig.style.chart.layout.grid.stroke"
                :stroke-width="quadrantConfig.style.chart.layout.grid.strokeWidth"
            />
            <!-- ARROWS -->
            <g v-if="quadrantConfig.style.chart.layout.grid.showArrows">
                <polygon :points="`${svg.right - svg.width * 0.02},${svg.centerY - svg.height * 0.009} ${svg.right},${svg.centerY} ${svg.right - svg.width * 0.02},${svg.centerY + svg.height * 0.009}`" :fill="quadrantConfig.style.chart.layout.grid.stroke" stroke="none" />
                <polygon :points="`${svg.left + svg.width * 0.02},${svg.centerY - svg.height * 0.009} ${svg.left},${svg.centerY} ${svg.left + svg.width * 0.02},${svg.centerY + svg.height * 0.009}`" :fill="quadrantConfig.style.chart.layout.grid.stroke" stroke="none" />
                <polygon :points="`${svg.centerX - svg.width * 0.013},${svg.top + svg.height * 0.015} ${svg.centerX},${svg.top} ${svg.centerX + svg.width * 0.013},${svg.top + svg.height * 0.015}`" :fill="quadrantConfig.style.chart.layout.grid.stroke" stroke="none"/>
                <polygon :points="`${svg.centerX - svg.width * 0.013},${svg.bottom - svg.height * 0.015} ${svg.centerX},${svg.bottom} ${svg.centerX + svg.width * 0.013},${svg.bottom - svg.height * 0.015}`" :fill="quadrantConfig.style.chart.layout.grid.stroke" stroke="none"/>
            </g>

            <!-- QUADRANT LABELS -->
            <g v-if="quadrantConfig.style.chart.layout.labels.quadrantLabels.show">            
                <!-- TL -->
                <text
                    v-if="quadrantConfig.style.chart.layout.labels.quadrantLabels.tl.text"
                    :x="0"
                    :y="svg.top - svg.padding / 2"
                    text-anchor="start"
                    :fill="quadrantConfig.style.chart.layout.labels.quadrantLabels.tl.color"
                    :font-size="quadrantConfig.style.chart.layout.labels.quadrantLabels.tl.fontSize"
                    :style="`font-weight:${quadrantConfig.style.chart.layout.labels.quadrantLabels.tl.bold ? 'bold' : ''}`"
                    @click="selectSide('tl')"
                >
                    {{ quadrantConfig.style.chart.layout.labels.quadrantLabels.tl.text }}
                </text>

                <!-- TR -->
                <text
                    v-if="quadrantConfig.style.chart.layout.labels.quadrantLabels.tr.text"
                    :x="svg.width"
                    :y="svg.top - svg.padding / 2"
                    text-anchor="end"
                    :fill="quadrantConfig.style.chart.layout.labels.quadrantLabels.tr.color"
                    :font-size="quadrantConfig.style.chart.layout.labels.quadrantLabels.tr.fontSize"
                    :style="`font-weight:${quadrantConfig.style.chart.layout.labels.quadrantLabels.tr.bold ? 'bold' : ''}`"
                    @click="selectSide('tr')"
                >
                    {{ quadrantConfig.style.chart.layout.labels.quadrantLabels.tr.text }}
                </text>

                <!-- BR -->
                <text
                    v-if="quadrantConfig.style.chart.layout.labels.quadrantLabels.br.text"
                    :x="svg.width"
                    :y="svg.bottom + svg.padding *0.7"
                    text-anchor="end"
                    :fill="quadrantConfig.style.chart.layout.labels.quadrantLabels.br.color"
                    :font-size="quadrantConfig.style.chart.layout.labels.quadrantLabels.br.fontSize"
                    :style="`font-weight:${quadrantConfig.style.chart.layout.labels.quadrantLabels.br.bold ? 'bold' : ''}`"
                    @click="selectSide('br')"
                >
                    {{ quadrantConfig.style.chart.layout.labels.quadrantLabels.br.text }}
                </text>

                <!-- BL -->
                <text
                    v-if="quadrantConfig.style.chart.layout.labels.quadrantLabels.bl.text"
                    :x="0"
                    :y="svg.bottom + svg.padding * 0.7"
                    text-anchor="start"
                    :fill="quadrantConfig.style.chart.layout.labels.quadrantLabels.bl.color"
                    :font-size="quadrantConfig.style.chart.layout.labels.quadrantLabels.bl.fontSize"
                    :style="`font-weight:${quadrantConfig.style.chart.layout.labels.quadrantLabels.bl.bold ? 'bold' : ''}`"
                    @click="selectSide('bl')"
                >
                    {{ quadrantConfig.style.chart.layout.labels.quadrantLabels.bl.text }}
                </text>
            </g>

            <!-- AXIS VALUES -->
            <g v-if="quadrantConfig.style.chart.layout.labels.axisLabels.show">
                <!-- Y MAX -->
                <text
                    :x="svg.centerX"
                    :y="svg.top - svg.padding / 6"
                    text-anchor="middle"
                    :font-size="quadrantConfig.style.chart.layout.labels.axisLabels.fontSize"
                    :fill="quadrantConfig.style.chart.layout.labels.axisLabels.color.positive"
                >
                    {{ axisValues.y.max }}
                </text>
                <text
                    :x="svg.centerX"
                    :y="svg.top - svg.padding / 2"
                    text-anchor="middle"
                    :font-size="quadrantConfig.style.chart.layout.labels.axisLabels.fontSize"
                    :fill="quadrantConfig.style.chart.layout.labels.axisLabels.color.positive"
                >
                    {{ quadrantConfig.style.chart.layout.grid.yAxis.name }}
                </text>

                <!-- Y MIN -->
                <text
                    :x="svg.centerX"
                    :y="svg.bottom + svg.padding * 0.35"
                    text-anchor="middle"
                    :font-size="quadrantConfig.style.chart.layout.labels.axisLabels.fontSize"
                    :fill="quadrantConfig.style.chart.layout.labels.axisLabels.color.negative"
                >
                    {{ axisValues.y.min }}
                </text>

                <!-- X MIN -->
                <text
                    id="xLabelMin"
                    text-anchor="middle"
                    :font-size="quadrantConfig.style.chart.layout.labels.axisLabels.fontSize"
                    :fill="quadrantConfig.style.chart.layout.labels.axisLabels.color.negative"
                >
                    {{ axisValues.x.min }}
                </text>

                <!-- X MAX -->
                <text
                    id="xLabelMax"
                    text-anchor="middle"
                    :font-size="quadrantConfig.style.chart.layout.labels.axisLabels.fontSize"
                    :fill="quadrantConfig.style.chart.layout.labels.axisLabels.color.positive"
                >
                    {{ axisValues.x.max }}
                </text>       
                <text
                    id="xLabelMaxName"
                    text-anchor="middle"
                    :font-size="quadrantConfig.style.chart.layout.labels.axisLabels.fontSize"
                    :fill="quadrantConfig.style.chart.layout.labels.axisLabels.color.positive"
                >
                    {{ quadrantConfig.style.chart.layout.grid.xAxis.name }}
                </text>       
            </g>

            <!-- AREAS GIFT WRAPPING -->
            <g v-if="quadrantConfig.style.chart.layout.areas.show">
                <g v-for="(category, i) in drawableDataset">
                    <polygon 
                        v-if="category.series.length > 2"
                        :fill="quadrantConfig.style.chart.layout.areas.useGradient ? `url(#quadrant_gradient_${uid}_${i})` : `${category.color}${opacity[quadrantConfig.style.chart.layout.areas.opacity]}`"
                        :points="giftWrap(category)"
                    />
                </g>
            </g>

            <!-- PLOTS -->
            <g v-for="category in drawableDataset">
                <g v-if="category.shape === 'circle'">
                    <circle
                        v-for="plot in category.series"
                        :cx="plot.x"
                        :cy="plot.y"
                        :r="quadrantConfig.style.chart.layout.plots.radius * 0.8"
                        :fill="category.color"
                        :stroke="quadrantConfig.style.chart.layout.plots.outline ? quadrantConfig.style.chart.layout.plots.outlineColor : 'none'"
                        :stroke-width="quadrantConfig.style.chart.layout.plots.outlineWidth"
                        @mouseover="hoverPlot(category, plot)"
                        @mouseout="isTooltip = false"
                        @click="selectPlot(category, plot)"
                    />
                </g>
                <g v-if="category.shape === 'triangle'">
                    <path 
                        v-for="plot in category.series"
                        :d="createPolygonPath({
                            plot: { x: plot.x, y: plot.y },
                            radius: quadrantConfig.style.chart.layout.plots.radius,
                            sides: 3,
                            rotation: 0.52
                        }).path"
                        :fill="category.color"
                        :stroke="quadrantConfig.style.chart.layout.plots.outline ? quadrantConfig.style.chart.layout.plots.outlineColor : 'none'"
                        :stroke-width="quadrantConfig.style.chart.layout.plots.outlineWidth"
                        @mouseover="hoverPlot(category, plot)"
                        @mouseout="isTooltip = false"
                        @click="selectPlot(category, plot)"
                    />
                </g>
                <g v-if="category.shape === 'square'">
                    <path 
                        v-for="plot in category.series"
                        :d="createPolygonPath({
                            plot: { x: plot.x, y: plot.y },
                            radius: quadrantConfig.style.chart.layout.plots.radius,
                            sides: 4,
                            rotation: 0.8
                        }).path"
                        :fill="category.color"
                        :stroke="quadrantConfig.style.chart.layout.plots.outline ? quadrantConfig.style.chart.layout.plots.outlineColor : 'none'"
                        :stroke-width="quadrantConfig.style.chart.layout.plots.outlineWidth"
                        @mouseover="hoverPlot(category, plot)"
                        @mouseout="isTooltip = false"
                        @click="selectPlot(category, plot)"
                    />
                </g>
                <g v-if="category.shape === 'diamond'">
                    <path 
                        v-for="plot in category.series"
                        :d="createPolygonPath({
                            plot: { x: plot.x, y: plot.y },
                            radius: quadrantConfig.style.chart.layout.plots.radius,
                            sides: 4,
                            rotation: 0
                        }).path"
                        :fill="category.color"
                        :stroke="quadrantConfig.style.chart.layout.plots.outline ? quadrantConfig.style.chart.layout.plots.outlineColor : 'none'"
                        :stroke-width="quadrantConfig.style.chart.layout.plots.outlineWidth"
                        @mouseover="hoverPlot(category, plot)"
                        @mouseout="isTooltip = false"
                        @click="selectPlot(category, plot)"
                    />
                </g>
                <g v-if="category.shape === 'pentagon'">
                    <path 
                        v-for="plot in category.series"
                        :d="createPolygonPath({
                            plot: { x: plot.x, y: plot.y },
                            radius: quadrantConfig.style.chart.layout.plots.radius,
                            sides: 5,
                            rotation: 0.95
                        }).path"
                        :fill="category.color"
                        :stroke="quadrantConfig.style.chart.layout.plots.outline ? quadrantConfig.style.chart.layout.plots.outlineColor : 'none'"
                        :stroke-width="quadrantConfig.style.chart.layout.plots.outlineWidth"
                        @mouseover="hoverPlot(category, plot)"
                        @mouseout="isTooltip = false"
                        @click="selectPlot(category, plot)"
                    />
                </g>
                <g v-if="category.shape === 'hexagon'">
                    <path 
                        v-for="plot in category.series"
                        :d="createPolygonPath({
                            plot: { x: plot.x, y: plot.y },
                            radius: quadrantConfig.style.chart.layout.plots.radius,
                            sides: 6,
                            rotation: 0
                        }).path"
                        :fill="category.color"
                        :stroke="quadrantConfig.style.chart.layout.plots.outline ? quadrantConfig.style.chart.layout.plots.outlineColor : 'none'"
                        :stroke-width="quadrantConfig.style.chart.layout.plots.outlineWidth"
                        @mouseover="hoverPlot(category, plot)"
                        @mouseout="isTooltip = false"
                        @click="selectPlot(category, plot)"
                    />
                </g>
                <g v-if="category.shape === 'star'">
                    <polygon
                        v-for="plot in category.series"
                        :points="createStar({
                            plot: { x: plot.x, y: plot.y },
                            radius: quadrantConfig.style.chart.layout.plots.radius
                        })" 
                        :fill="category.color"
                        :stroke="quadrantConfig.style.chart.layout.plots.outline ? quadrantConfig.style.chart.layout.plots.outlineColor : 'none'"
                        :stroke-width="quadrantConfig.style.chart.layout.plots.outlineWidth"
                        @mouseover="hoverPlot(category, plot)"
                        @mouseout="isTooltip = false"
                        @click="selectPlot(category, plot)"
                    />
                </g>
            </g>

            <g v-if="mutableConfig.plotLabels.show">
                <g v-for="category in drawableDataset">
                    <text 
                        v-for="plot in category.series" 
                        :x="plot.x" 
                        :y="plot.y + quadrantConfig.style.chart.layout.labels.plotLabels.offsetY + quadrantConfig.style.chart.layout.plots.radius" 
                        text-anchor="middle" 
                        :font-size="quadrantConfig.style.chart.layout.labels.plotLabels.fontSize"
                        :fill="quadrantConfig.style.chart.layout.labels.plotLabels.color"
                    >
                        {{ plot.name }}
                    </text>
                </g>
            </g>

            <!-- LEGEND AS G -->
            <foreignObject
                v-if="quadrantConfig.style.chart.legend.show && mutableConfig.inside && !isPrinting"
                :x="0"
                :y="svg.bottom + 36"
                width="100%"
                height="90"
                style="overflow: visible;"
            >
                <div class="vue-ui-quadrant-legend" :style="`font-weight:${quadrantConfig.style.chart.legend.bold ? 'bold' : ''};color:${quadrantConfig.style.chart.legend.color};font-size:${quadrantConfig.style.chart.legend.fontSize}px;padding-bottom:12px;font-weight:${quadrantConfig.style.chart.legend.bold ? 'bold' : ''}`" @click="closeDetails">
                    <div v-for="(legendItem, i) in legend" class="vue-ui-quadrant-legend-item" @click="segregate(legendItem.id)" :style="`opacity:${segregated.includes(legendItem.id) ? 0.5 : 1}`">
                        <div v-html="legendItem.shapePath" style="display:flex;align-items:center;justify-content:center"/>
                        <span>{{ legendItem.name }}</span>
                    </div>
                </div>
            </foreignObject>

        </svg>

        <!-- LEGEND AS DIV -->
        <div v-if="quadrantConfig.style.chart.legend.show && (!mutableConfig.inside || isPrinting)" class="vue-ui-quadrant-legend" :style="`font-weight:${quadrantConfig.style.chart.legend.bold ? 'bold' : ''};background:${quadrantConfig.style.chart.legend.backgroundColor};color:${quadrantConfig.style.chart.legend.color};font-size:${quadrantConfig.style.chart.legend.fontSize}px;padding-bottom:12px;font-weight:${quadrantConfig.style.chart.legend.bold ? 'bold' : ''}`" @click="closeDetails">
            <div v-for="(legendItem, i) in legend" class="vue-ui-quadrant-legend-item" @click="segregate(legendItem.id)" :style="`opacity:${segregated.includes(legendItem.id) ? 0.5 : 1}`">
                <div v-html="legendItem.shapePath" style="display:flex;align-items:center;justify-content:center"/>
                <span>{{ legendItem.name }}</span>
            </div>
        </div>

        <!-- TOOLTIP -->
        <div 
            class="vue-ui-quadrant-tooltip"
            ref="tooltip"
            v-if="quadrantConfig.style.chart.tooltip.show && isTooltip"
            :style="`top:${tooltipPosition.top}px;left:${tooltipPosition.left}px;background:${quadrantConfig.style.chart.tooltip.backgroundColor};color:${quadrantConfig.style.chart.tooltip.color}`"
            v-html="tooltipContent"
        />

        <!-- DATA TABLE -->
        <div @click="closeDetails" class="vue-ui-quadrant-table" :style="`width:100%;margin-top:${mutableConfig.inside ? '48px' : ''}`" v-if="mutableConfig.showTable">
            <table>
                <thead>
                    <tr v-if="quadrantConfig.style.chart.title.text">
                        <th :colspan="5" :style="`background:${quadrantConfig.table.th.backgroundColor};color:${quadrantConfig.table.th.color};outline:${quadrantConfig.table.th.outline}`">
                            <span>{{ quadrantConfig.style.chart.title.text }}</span>
                            <span v-if="quadrantConfig.style.chart.title.subtitle.text">
                                : {{ quadrantConfig.style.chart.title.subtitle.text }}
                            </span>
                        </th>
                    </tr>
                    <tr>
                        <th v-for="th in table.head" :style="`background:${quadrantConfig.table.th.backgroundColor};color:${quadrantConfig.table.th.color};outline:${quadrantConfig.table.th.outline}`">
                            <div style="width:100%">
                                {{ th }}
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="tr in table.body">
                        <td v-for="td in tr" :style="`background:${quadrantConfig.table.td.backgroundColor};color:${quadrantConfig.table.td.color};outline:${quadrantConfig.table.td.outline}`">
                            {{ isNaN(td) ? td : td.toFixed(quadrantConfig.table.td.roundingValue) }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.vue-ui-quadrant *{
    transition: unset;
}
.vue-ui-quadrant {
    user-select: none;
    position: relative;
    padding-top: 36px;
}
.vue-ui-quadrant .vue-ui-quadrant-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}
.vue-ui-quadrant-legend {
    height: 100%;
    width:100%;
    display: flex;
    align-items:center;
    flex-wrap: wrap;
    justify-content:center;
    column-gap: 18px;
}
.vue-ui-quadrant-legend-item {
    display: flex;
    align-items:center;
    justify-content: center;
    gap: 6px;
    cursor: pointer;
    height: 24px;
}
.vue-ui-quadrant-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    max-width: 300px;
    position: fixed;
    padding:12px;
    z-index:1;
}

/** */
.vue-ui-quadrant-user-options {
    border-radius: 4px;
    padding: 6px 12px;
    position: absolute;
    right:0;
    top:0px;
    max-width: 300px;
    text-align:left;
}
.vue-ui-quadrant-user-options[open] {
    border: 1px solid #e1e5e8;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
}
.vue-ui-quadrant summary {
    text-align: right;
    direction: rtl;
}
.vue-ui-quadrant-user-options-items {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 6px;
}
.vue-ui-quadrant-user-options-item {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items:center;
}

.vue-ui-quadrant-button {
    margin: 6px 0;
    border-radius: 3px;
    height: 30px;
    border: 1px solid #b9bfc4;
    background: inherit;
    display: flex;
    align-items:center;
    justify-content: center;
}
.vue-ui-quadrant-button:hover {
    background: rgba(0,0,0,0.05);
}
.vue-ui-quadrant-print-icon {
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

.vue-ui-quadrant table {
    width: 100%;
    border-collapse:collapse;
}
.vue-ui-quadrant table td {
    text-align:right;
    padding-right: 6px;
    font-variant-numeric: tabular-nums;
}
.vue-ui-quadrant table th {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
}
</style>