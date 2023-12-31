<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { palette, createUid, giftWrap, shiftHue, opacity, convertColorToHex, createCsvContent, downloadCsv } from "../lib";
import pdf from "../pdf.js";
import img from "../img.js";
import mainConfig from "../default_configs.json";
import { useNestedProp } from "../useNestedProp";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Tooltip from "../atoms/Tooltip.vue";
import Shape from "../atoms/Shape.vue";
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
    }
});

const uid = ref(createUid());

const emit = defineEmits(['selectPlot', 'selectSide', 'selectLegend']);

const defaultConfig = ref(mainConfig.vue_ui_quadrant);

const isImaging = ref(false);
const isPrinting = ref(false);
const quadrantChart = ref(null);
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");

onMounted(() => {
    positionAxisLabels();
});

function positionAxisLabels() {
    if (quadrantConfig.value.style.chart.layout.labels.axisLabels.show) {
        const xmlns = "http://www.w3.org/2000/svg";
        const chart = document.getElementById(`svg_${uid.value}`);

        [
            `xlabminvis_${uid.value}`,
            `xlabmaxvis_${uid.value}`,
            `xlabmaxnamevis_${uid.value}`,
        ].forEach(el => {
            const t = document.getElementById(el);
            if(t) t.remove()
        });

        nextTick(() => {
            const xLabelMinVisible = document.createElementNS(xmlns, 'text');
            xLabelMinVisible.setAttribute("id", `xlabminvis_${uid.value}`);
            
            const xLabelMaxVisible = document.createElementNS(xmlns, 'text');
            xLabelMaxVisible.setAttribute("id", `xlabmaxvis_${uid.value}`);
    
            const xLabelMaxNameVisible = document.createElementNS(xmlns, "text");
            xLabelMaxNameVisible.setAttribute("id", `xlabmaxnamevis_${uid.value}`);
    
            const xLabelMin = document.getElementById(`xLabelMin_${uid.value}`);
            const xLabelMax = document.getElementById(`xLabelMax_${uid.value}`);
            const xLabelMaxName = document.getElementById(`xLabelMaxName_${uid.value}`);

    
    
            if(xLabelMin) {
                const bboxXMin = xLabelMin.getBBox();
                const xPosition = bboxXMin.height / 2 + svg.value.padding * 0.6;
                const yPosition = svg.value.centerY;
                xLabelMinVisible.setAttributeNS(null, "transform", `rotate(-90, ${xPosition}, ${yPosition})`);
                xLabelMinVisible.setAttributeNS(null, "x", xPosition);
                xLabelMinVisible.setAttributeNS(null, "y", yPosition);
                xLabelMinVisible.innerHTML = axisValues.value.x.min;
                xLabelMinVisible.setAttribute("text-anchor", "middle");
                xLabelMinVisible.setAttribute("fontSize", quadrantConfig.value.style.chart.layout.labels.axisLabels.fontSize)
                xLabelMinVisible.setAttributeNS(null, "fill", quadrantConfig.value.style.chart.layout.labels.axisLabels.color.negative)
                chart.appendChild(xLabelMinVisible);
            }
    
            if(xLabelMax) {
                const bboxXMax = xLabelMax.getBBox();
                const xPosition = bboxXMax.height / 2 + svg.value.right;
                const yPosition = svg.value.centerY;
                xLabelMaxVisible.setAttributeNS(null, "transform", `rotate(90, ${xPosition}, ${yPosition})`);
                xLabelMaxVisible.setAttributeNS(null, "x", xPosition);
                xLabelMaxVisible.setAttributeNS(null, "y", yPosition);
                xLabelMaxVisible.innerHTML = axisValues.value.x.max;
                xLabelMaxVisible.setAttribute("text-anchor", "middle");
                xLabelMaxVisible.setAttribute("fontSize", quadrantConfig.value.style.chart.layout.labels.axisLabels.fontSize)
                xLabelMaxVisible.setAttributeNS(null, "fill", quadrantConfig.value.style.chart.layout.labels.axisLabels.color.positive)
                chart.appendChild(xLabelMaxVisible);
            }
    
            if(xLabelMaxName && quadrantConfig.value.style.chart.layout.grid.xAxis.name) {
                const bboxXMaxName = xLabelMaxName.getBBox();
                const xPosition = bboxXMaxName.height / 2 + svg.value.right + svg.value.padding * 0.3;
                const yPosition = svg.value.centerY;
                xLabelMaxNameVisible.setAttributeNS(null, "transform", `rotate(90, ${xPosition}, ${yPosition})`);
                xLabelMaxNameVisible.setAttributeNS(null, "x", xPosition);
                xLabelMaxNameVisible.setAttributeNS(null, "y", yPosition);
                xLabelMaxNameVisible.innerHTML = quadrantConfig.value.style.chart.layout.grid.xAxis.name;
                xLabelMaxNameVisible.setAttribute("text-anchor", "middle");
                xLabelMaxNameVisible.setAttribute("fontSize", quadrantConfig.value.style.chart.layout.labels.axisLabels.fontSize)
                xLabelMaxNameVisible.setAttributeNS(null, "fill", quadrantConfig.value.style.chart.layout.labels.axisLabels.color.positive)
                chart.appendChild(xLabelMaxNameVisible);
            }
        })

    }
}

const quadrantConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const mutableConfig = ref({
    plotLabels: {
        show: quadrantConfig.value.style.chart.layout.labels.plotLabels.show,
    },
    inside: !quadrantConfig.value.style.chart.layout.useDiv,
    showTable: quadrantConfig.value.table.show
});

const isInside = computed(() => mutableConfig.value.inside);

watch(isInside, (_) => {
    positionAxisLabels();
})

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
                    color: category.color,
                    uid: createUid()
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

    const itsShapes = tableData.map(td => {
        return {
            shape: td.shape,
            color: td.color
        }
    });
    console.log({itsShapes});
;
    return { head, body, itsShapes };
});

const legendSet = computed(() => {
    return datasetReference.value.map(category => {
        return {
            name: category.name,
            shape: category.shape,
            color: category.color,
            id: category.id,
            opacity: segregated.value.includes(category.id) ? 0.5 : 1
        }
    })
});

const legendConfig = computed(() => {
    return {
        cy: 'quadrant-div-legend',
        backgroundColor: quadrantConfig.value.style.chart.legend.backgroundColor,
        color: quadrantConfig.value.style.chart.legend.color,
        fontSize: quadrantConfig.value.style.chart.legend.fontSize,
        paddingBottom: 12,
        fontWeight: quadrantConfig.value.style.chart.legend.bold ? 'bold' : ''
    }
})

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

const hoveredPlotId = ref(null);
const hoveredPlot = ref(null);

function hoverPlot(category, plot) {
    hoveredPlotId.value = plot.uid;
    hoveredPlot.value = {
        color: category.color,
        shape: category.shape
    }
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
        shape: category.shape,
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

const __to__ = ref(null);

function showSpinnerPdf() {
    isPrinting.value = true;
}

function generatePdf(){
    showSpinnerPdf();
    clearTimeout(__to__.value);
    __to__.value = setTimeout(() => {
        pdf({
            domElement: document.getElementById(`vue-ui-quadrant_${uid.value}`),
            fileName: quadrantConfig.value.style.chart.title.text || 'vue-ui-quadrant'
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
            domElement: document.getElementById(`vue-ui-quadrant_${uid.value}`),
            fileName: quadrantConfig.value.style.chart.title.text || 'vue-ui-quadrant',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100)
}

function generateCsv() {
    nextTick(() => {
        const title = [[quadrantConfig.value.style.chart.title.text], [quadrantConfig.value.style.chart.title.subtitle.text], [""]];
        const head = table.value.head;
        const body = table.value.body
        const tableXls = title.concat([head]).concat(body);
        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: quadrantConfig.value.style.chart.title.text || 'vue-ui-quadrant'})
    });
}

defineExpose({
    getData,
    generatePdf,
    generateCsv,
    generateImage
});

</script>

<template>
    <div :class="`vue-ui-quadrant ${quadrantConfig.useCssAnimation ? '' : 'vue-ui-dna'}`" ref="quadrantChart" :id="`vue-ui-quadrant_${uid}`" :style="`font-family:${quadrantConfig.style.fontFamily};width:100%; text-align:center;${!quadrantConfig.style.chart.title.text ? 'padding-top: 36px' : ''};background:${quadrantConfig.style.chart.backgroundColor}`">

        <!-- TITLE AS DIV -->
        <div v-if="(!mutableConfig.inside || isPrinting) && quadrantConfig.style.chart.title.text" :style="`width:100%;background:${quadrantConfig.style.chart.backgroundColor};padding-bottom:12px`">
            <Title
                :config="{
                    title: {
                        cy: 'quadrant-title',
                        text: quadrantConfig.style.chart.title.text,
                        color: quadrantConfig.style.chart.title.color,
                        fontSize: quadrantConfig.style.chart.title.fontSize,
                        bold: quadrantConfig.style.chart.title.bold
                    },
                    subtitle: {
                        cy: 'quadrant-subtitle',
                        text: quadrantConfig.style.chart.title.subtitle.text,
                        color: quadrantConfig.style.chart.title.subtitle.color,
                        fontSize: quadrantConfig.style.chart.title.subtitle.fontSize,
                        bold: quadrantConfig.style.chart.title.subtitle.bold
                    },
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            v-if="quadrantConfig.userOptions.show"
            :backgroundColor="quadrantConfig.style.chart.backgroundColor"
            :color="quadrantConfig.style.chart.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :title="quadrantConfig.userOptions.title"
            :uid="uid"
            :hasImg="true"
            hasTable
            hasLabel
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="mutableConfig.showTable = !mutableConfig.showTable"
            @toggleLabels="mutableConfig.plotLabels.show = !mutableConfig.plotLabels.show"
        />

        <!-- CHART -->
        <svg :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%;overflow:visible;background:${quadrantConfig.style.chart.backgroundColor};color:${quadrantConfig.style.chart.color}`"  :id="`svg_${uid}`">
            
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
                    data-cy="quadrant-text-title"
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
                    data-cy="quadrant-text-subtitle"
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
                    data-cy="quadrant-label-tl"
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
                data-cy="quadrant-label-tr"
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
                data-cy="quadrant-label-br"
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
                    data-cy="quadrant-label-bl"
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
                    :id="`xLabelMin_${uid}`"
                    text-anchor="middle"
                    :font-size="quadrantConfig.style.chart.layout.labels.axisLabels.fontSize"
                    fill="transparent"
                >
                    {{ axisValues.x.min }}
                </text>

                <!-- X MAX -->
                <text
                    :id="`xLabelMax_${uid}`"
                    text-anchor="middle"
                    :font-size="quadrantConfig.style.chart.layout.labels.axisLabels.fontSize"
                    fill="transparent"
                >
                    {{ axisValues.x.max }}
                </text>       
                <text
                    :id="`xLabelMaxName_${uid}`"
                    text-anchor="middle"
                    :font-size="quadrantConfig.style.chart.layout.labels.axisLabels.fontSize"
                    fill="transparent"
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
                <Shape
                    v-for="plot in category.series"
                    :color="category.color"
                    :isSelected="hoveredPlotId && plot.uid === hoveredPlotId"
                    :plot="plot"
                    :radius="quadrantConfig.style.chart.layout.plots.radius"
                    :shape="category.shape"
                    :stroke="quadrantConfig.style.chart.layout.plots.outline ? quadrantConfig.style.chart.layout.plots.outlineColor : 'none'"
                    :strokeWidth="quadrantConfig.style.chart.layout.plots.outlineWidth"
                    @mouseover="hoverPlot(category, plot)"
                    @mouseleave="isTooltip = false; hoveredPlotId = null; hoveredPlot = null"
                    @click="selectPlot(category, plot)"
                />
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
                <Legend
                    :legendSet="legendSet"
                    :config="legendConfig"
                    @clickMarker="({legend}) => segregate(legend.id)"
                >
                    <template #item="{ legend }">
                        <div @click="segregate(legend.id)" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                            {{ legend.name }} 
                        </div>
                    </template>
                </Legend>
            </foreignObject>
            <slot name="svg" :svg="svg"/>
        </svg>

        <!-- LEGEND AS DIV -->
        <Legend
            v-if="quadrantConfig.style.chart.legend.show && (!mutableConfig.inside || isPrinting)"
            :legendSet="legendSet"
            :config="legendConfig"
            @clickMarker="({legend}) => segregate(legend.id)"
        >
            <template #item="{ legend }">
                <div @click="segregate(legend.id)" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                    {{ legend.name }} 
                </div>
            </template>
        </Legend>

        <!-- TOOLTIP -->
        <Tooltip
            :show="quadrantConfig.style.chart.tooltip.show && isTooltip"
            :backgroundColor="quadrantConfig.style.chart.tooltip.backgroundColor"
            :color="quadrantConfig.style.chart.tooltip.color"
            :parent="quadrantChart"
            :content="tooltipContent"
        >
            <svg height="14" width="14" viewBox="0 0 20 20">
                <Shape
                    :plot="{ x: 10, y: 10 }"
                    :shape="hoveredPlot.shape"
                    :color="hoveredPlot.color"
                    :radius="8"
                    :stroke="quadrantConfig.style.chart.layout.plots.outline ? quadrantConfig.style.chart.layout.plots.outlineColor : 'none'"
                    :stroke-width="quadrantConfig.style.chart.layout.plots.outlineWidth"
                />
            </svg>
        </Tooltip>

        <!-- DATA TABLE -->
        <div  class="vue-ui-quadrant-table" :style="`width:100%;margin-top:${mutableConfig.inside ? '48px' : ''}`" v-if="mutableConfig.showTable">
            <table>
                <thead data-cy="quadrant-thead">
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
                    <tr v-for="(tr, i) in table.body">
                        <td v-for="(td, j) in tr" :style="`background:${quadrantConfig.table.td.backgroundColor};color:${quadrantConfig.table.td.color};outline:${quadrantConfig.table.td.outline}`">
                            <div style="display:flex;align-items:center;gap:3px;justify-content:flex-end">
                                <svg v-if="j === 0" height="14" width="14" viewBox="0 0 20 20">
                                    <Shape
                                        :plot="{ x: 10, y: 10 }"
                                        :color="table.itsShapes[i].color"
                                        :shape="table.itsShapes[i].shape"
                                        :radius="8"
                                        :stroke="quadrantConfig.style.chart.layout.plots.outline ? quadrantConfig.style.chart.layout.plots.outlineColor : 'none'"
                                        :strokeWidth="quadrantConfig.style.chart.layout.plots.outlineWidth"
                                    />
                                </svg>
                                <span>
                                    {{ isNaN(td) ? td : td.toFixed(quadrantConfig.table.td.roundingValue) }}
                                </span>
                            </div>
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
}

path, line, rect, circle, polygon {
    animation: quadrantAnimation 0.5s ease-in-out;
    transform-origin: center;
}
@keyframes quadrantAnimation {
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
.vue-ui-quadrant .vue-ui-quadrant-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}

/** */
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

.vue-ui-dna * {
    animation: none !important;
}
</style>