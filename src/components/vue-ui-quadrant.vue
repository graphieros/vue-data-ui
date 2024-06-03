<script setup>
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { 
    adaptColorToBackground,
    convertColorToHex, 
    createCsvContent, 
    createUid, 
    downloadCsv,
    error,
    functionReturnsString,
    isFunction,
    giftWrap,
    objectIsEmpty,
    opacity, 
    palette, 
    shiftHue,
    XMLNS
} from "../lib";
import pdf from "../pdf.js";
import img from "../img.js";
import mainConfig from "../default_configs.json";
import { useNestedProp } from "../useNestedProp";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Tooltip from "../atoms/Tooltip.vue";
import Shape from "../atoms/Shape.vue";
import Legend from "../atoms/Legend.vue";
import DataTable from "../atoms/DataTable.vue";
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
    }
});

const isDataset = computed(() => {
    return !!props.dataset && props.dataset.length;
})

const uid = ref(createUid());
const emit = defineEmits(['selectPlot', 'selectSide', 'selectLegend']);
const defaultConfig = ref(mainConfig.vue_ui_quadrant);

const isImaging = ref(false);
const isPrinting = ref(false);
const quadrantChart = ref(null);
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const step = ref(0);
const isZoom = ref(false);

onMounted(() => {
    if (objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiQuadrant',
            type: 'dataset'
        })
    } else {
        props.dataset.forEach((ds, i) => {
            if ([null, undefined].includes(ds.name)){
                error({
                    componentName: 'VueUiQuadrant',
                    type: 'datasetSerieAttribute',
                    property: 'name',
                    index: i
                })
            }
            if([null, undefined].includes(ds.series)) {
                error({
                    componentName: 'VueUiQuadrant',
                    type: 'datasetSerieAttribute',
                    property: 'series',
                    index: i
                })
            } else {
                ds.series.forEach((serie, j) => {
                    if ([null, undefined].includes(serie.name)) {
                        error({
                            componentName: 'VueUiQuadrant',
                            type: 'datasetSerieAttribute',
                            property: 'name',
                            key: 'series',
                            index: j
                        })
                    }
                })
            }
        })
    }
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

const mutableSvg = ref({
    ...JSON.parse(JSON.stringify(svg.value)),
    startX: 0,
    startY: 0
});

const selectedSide = ref(null);

const selectedSideLabelCoordinates = computed(() => {
    switch (selectedSide.value) {
        case 'TL':
            return {
                x: mutableSvg.value.startX + mutableSvg.value.width / 2,
                y: mutableSvg.value.height,
                text: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.tl.text || 'Top Left',
                fontSize: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.tl.fontSize,
                fill: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.tl.color,
                bold: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.tl.bold
            }
        case 'TR': 
            return {
                x: mutableSvg.value.startX + mutableSvg.value.width / 2,
                y: mutableSvg.value.height,
                text: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.tr.text || 'Top Right',
                fontSize: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.tr.fontSize,
                fill: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.tr.color,
                bold: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.tr.bold
            }
        case 'BR': 
            return {
                x: mutableSvg.value.startX + mutableSvg.value.width / 2,
                y: mutableSvg.value.height * 1.678,
                text: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.br.text || 'Bottom Right',
                fontSize: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.br.fontSize,
                fill: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.br.color,
                bold: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.br.bold
            }
        case 'BL': 
            return {
                x: mutableSvg.value.startX + mutableSvg.value.width / 2,
                y: mutableSvg.value.height * 1.678,
                text: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.bl.text || 'Bottom Left',
                fontSize: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.bl.fontSize,
                fill: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.bl.color,
                bold: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.bl.bold
            }
    
        default:
            return {x: 0, y: 0, text: '', fontSize: 0, fill: 'none', bold: false}
    }
})

const currentAnimationFrame = ref(null);
const isAnimating = ref(false);

function zoomOnSide({ targetX, targetY, targetW, targetH, side}) {
    if(selectedSide.value) {
        selectSide(side);
    }
    const differentials = {
        x: targetX - mutableSvg.value.startX,
        y: targetY - mutableSvg.value.startY,
        w: targetW - mutableSvg.value.width,
        h: targetH - mutableSvg.value.height
    }

    const steps = quadrantConfig.value.zoomAnimationFrames;
    let init = 0;
    function anim() {
        isAnimating.value = true;
        mutableSvg.value.startX += (differentials.x / steps);
        mutableSvg.value.startY += (differentials.y / steps);
        mutableSvg.value.width += (differentials.w / steps);
        mutableSvg.value.height += (differentials.h / steps);
        init += 1;
        if(init < steps) {
            currentAnimationFrame.value = requestAnimationFrame(anim)
        } else {
            isAnimating.value = false;
        }
    }
    anim()
}

function selectQuadrantSide(side) {
    if(isAnimating.value) {
        return;
    }
    if(isZoom.value && selectedSide.value === side) {
        zoomOnSide({
            targetX: 0,
            targetY: 0,
            targetW: svg.value.width,
            targetH: svg.value.height
        })
        selectedSide.value = null;
        isZoom.value = false;
    } else  {
        selectedSide.value = side;
        switch (side) {
            case 'TL':
                zoomOnSide({
                    targetX: 0,
                    targetY: 0,
                    targetW: svg.value.width / 2 + svg.value.left,
                    targetH: svg.value.height / 2 + svg.value.top,
                    side: 'tl'
                })
            break;
            
            case 'TR':
                zoomOnSide({
                    targetX: svg.value.width / 2 - svg.value.left,
                    targetY: 0,
                    targetW: svg.value.width / 2 + svg.value.left,
                    targetH: svg.value.height / 2 + svg.value.top,
                    side: 'tr'
                })
            break;

            case 'BR':
                zoomOnSide({
                    targetX: svg.value.width / 2 - svg.value.left,
                    targetY: svg.value.height / 2 - svg.value.top,
                    targetW: svg.value.width / 2 + svg.value.left,
                    targetH: svg.value.height / 2 + svg.value.top,
                    side: 'br'
                })
            break;

            case 'BL':
                zoomOnSide({
                    targetX: 0,
                    targetY: svg.value.height / 2 - svg.value.top,
                    targetW: svg.value.width / 2 + svg.value.left,
                    targetH: svg.value.height / 2 + svg.value.top,
                    side: 'bl'
                })
            break;
        
            default:
                mutableSvg.value.startX = 0;
                mutableSvg.value.startY = 0;
                mutableSvg.value.width = svg.value.width;
                mutableSvg.value.height = svg.value.height;
            break;
        }
        isZoom.value = true
    }
}

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
    props.dataset.forEach((ds,i) => {
        ds.series.forEach((serie,j) => {
            if ([null, undefined].includes(serie.x)) {
                error({
                    componentName: 'VueUiQuadrant',
                    type: 'datasetSerieAttribute',
                    property: 'x',
                    key: 'series',
                    index: j
                })
            }
            if ([null, undefined].includes(serie.y)) {
                error({
                    componentName: 'VueUiQuadrant',
                    type: 'datasetSerieAttribute',
                    property: 'y',
                    key: 'series',
                    index: j
                })
            }
        })
    })
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
    if(x >= 0) {
        const ratio = x / axisValues.value.x.max;
        return svg.value.centerX + ((svg.value.usableWidth / 2) * ratio);
    } else {
        const ratio = Math.abs(x) / Math.abs(axisValues.value.x.min)
        return svg.value.centerX - ((svg.value.usableWidth / 2) * ratio);
    }
}

function calcY(y) {
    if(y >= 0) {
        const ratio = y / axisValues.value.y.max;
        return svg.value.centerY + (1-(svg.value.usableHeight / 2) * ratio);
    } else {
        const ratio = Math.abs(y) / Math.abs(axisValues.value.y.min);
        return svg.value.centerY - (1 - (svg.value.usableHeight / 2) * ratio);
    }
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

    return { head, body, itsShapes, tableData };
});

const dataTable = computed(() => {
    const head = table.value.head;
    const body = table.value.tableData.map(ds => {
        return [
            {
                shape: ds.shape,
                color: ds.color,
                name: ds.category
            },
            ds.name,
            ds.x,
            ds.y,
            ds.sideName || ds.quadrantSide
        ]
    })
    const config = {
        th: {
            backgroundColor: quadrantConfig.value.table.th.backgroundColor,
            color: quadrantConfig.value.table.th.color,
            outline: quadrantConfig.value.table.th.outline
        },
        td: {
            backgroundColor: quadrantConfig.value.table.td.backgroundColor,
            color: quadrantConfig.value.table.td.color,
            outline: quadrantConfig.value.table.td.outline
        },
        breakpoint: quadrantConfig.value.table.responsiveBreakpoint
    }

    return { head, body, config, colNames: head }
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


const legendSet = computed(() => {
    return datasetReference.value.map(category => {
        return {
            name: category.name,
            shape: category.shape,
            color: category.color,
            id: category.id,
            opacity: segregated.value.includes(category.id) ? 0.5 : 1,
            segregate: () => segregate(category.id),
            isSegregated: segregated.value.includes(category.id)
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
const dataTooltipSlot = ref(null);

function useTooltip(category, plot, categoryIndex) {
    hoveredPlotId.value = plot.uid;
    hoveredPlot.value = {
        color: category.color,
        shape: category.shape
    }

    dataTooltipSlot.value = {
        datapoint: plot,
        seriesIndex: categoryIndex,
        series: drawableDataset.value,
        config: quadrantConfig.value
    }

    isTooltip.value = true;

    const customFormat = quadrantConfig.value.style.chart.tooltip.customFormat;

    if (isFunction(customFormat) && functionReturnsString(() => customFormat({
            seriesIndex: categoryIndex,
            datapoint: plot,
            series: drawableDataset.value,
            config: quadrantConfig.value
        }))) {
        tooltipContent.value = customFormat({
            seriesIndex: categoryIndex,
            datapoint: plot,
            series: drawableDataset.value,
            config: quadrantConfig.value
        })
    } else {
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
    if(!side) return;
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

const miniMap = computed(() => {
    return {
        TL: {
            tl: {
                x: svg.value.left + svg.value.usableWidth / 4 - 20,
                y: 0,
                fill: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.tl.color
            },
            tr: {
                x: svg.value.left + svg.value.usableWidth / 4 ,
                y: 0,
                fill: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.tr.color
            },
            br: {
                x: svg.value.left + svg.value.usableWidth / 4 ,
                y: 20,
                fill: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.br.color
            },
            bl: {
                x: svg.value.left + svg.value.usableWidth / 4 - 20,
                y: 20,
                fill: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.bl.color
            },
            crosshairs: {
                horizontal: `M ${svg.value.left + svg.value.usableWidth / 4 - 20},${20} ${svg.value.left + svg.value.usableWidth / 4 + 20},${20}`,
                vertical: `M ${svg.value.left + svg.value.usableWidth / 4},${0} ${svg.value.left + svg.value.usableWidth / 4},${40}`
            }
        },
        TR: {
            tl: {
                x: svg.value.centerX + svg.value.usableWidth / 4 - 20,
                y: 0,
                fill: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.tl.color
            },
            tr: {
                x:  svg.value.centerX + svg.value.usableWidth / 4,
                y: 0,
                fill: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.tr.color
            },
            br: {
                x: svg.value.centerX + svg.value.usableWidth / 4,
                y: 20,
                fill: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.br.color
            },
            bl: {
                x: svg.value.centerX + svg.value.usableWidth / 4 - 20,
                y: 20,
                fill: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.bl.color
            },
            crosshairs: {
                horizontal: `M ${svg.value.centerX + svg.value.usableWidth / 4 - 20},${20} ${svg.value.centerX+ svg.value.usableWidth / 4 + 20},${20}`,
                vertical: `M ${svg.value.centerX + svg.value.usableWidth / 4},${0} ${svg.value.centerX + svg.value.usableWidth / 4},${40}`
            }
        },
        BR: {
            tl: {
                x: svg.value.centerX + svg.value.usableWidth / 4 - 20,
                y: svg.value.centerY - 48,
                fill: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.tl.color
            },
            tr: {
                x: svg.value.centerX + svg.value.usableWidth / 4,
                y: svg.value.centerY - 48,
                fill: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.tr.color
            },
            br: {
                x: svg.value.centerX + svg.value.usableWidth / 4,
                y: svg.value.centerY - 28,
                fill: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.br.color
            },
            bl: {
                x: svg.value.centerX + svg.value.usableWidth / 4 - 20,
                y: svg.value.centerY - 28,
                fill: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.bl.color
            },
            crosshairs: {
                horizontal: `M ${svg.value.centerX + svg.value.usableWidth / 4 - 20},${svg.value.centerY - 28} ${svg.value.centerX + svg.value.usableWidth / 4 + 20},${svg.value.centerY - 28}`,
                vertical: `M ${svg.value.centerX + svg.value.usableWidth / 4},${svg.value.centerY - 48} ${svg.value.centerX + svg.value.usableWidth / 4},${svg.value.centerY - 8}`
            }
        },
        BL: {
            tl: {
                x: svg.value.left + svg.value.usableWidth / 4 - 20,
                y: svg.value.centerY - 48,
                fill: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.tl.color
            },
            tr: {
                x: svg.value.left + svg.value.usableWidth / 4,
                y: svg.value.centerY - 48,
                fill: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.tr.color
            },
            br: {
                x: svg.value.left + svg.value.usableWidth / 4,
                y: svg.value.centerY - 28,
                fill: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.br.color
            },
            bl: {
                x: svg.value.left + svg.value.usableWidth / 4 - 20,
                y: svg.value.centerY - 28,
                fill: quadrantConfig.value.style.chart.layout.labels.quadrantLabels.bl.color
            },
            crosshairs: {
                horizontal: `M ${svg.value.left + svg.value.usableWidth / 4 - 20},${svg.value.centerY - 28} ${svg.value.left + svg.value.usableWidth / 4 + 20},${svg.value.centerY - 28}`,
                vertical: `M ${svg.value.left + svg.value.usableWidth / 4},${svg.value.centerY - 48} ${svg.value.left + svg.value.usableWidth / 4},${svg.value.centerY - 8}`
            }
        },
    }
})

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
    <div :class="`vue-ui-quadrant ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${quadrantConfig.useCssAnimation ? '' : 'vue-ui-dna'}`" ref="quadrantChart" :id="`vue-ui-quadrant_${uid}`" :style="`font-family:${quadrantConfig.style.fontFamily};width:100%; text-align:center;${!quadrantConfig.style.chart.title.text ? 'padding-top: 36px' : ''};background:${quadrantConfig.style.chart.backgroundColor}`">

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
            :key="`user_options_${step}`"
            v-if="quadrantConfig.userOptions.show && isDataset"
            :backgroundColor="quadrantConfig.style.chart.backgroundColor"
            :color="quadrantConfig.style.chart.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :title="quadrantConfig.userOptions.title"
            :uid="uid"
            :hasImg="true"
            hasTable
            hasLabel
            hasFullscreen
            :isFullscreen="isFullscreen"
            :chartElement="quadrantChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="mutableConfig.showTable = !mutableConfig.showTable"
            @toggleLabels="mutableConfig.plotLabels.show = !mutableConfig.plotLabels.show"
        />

        <!-- CHART -->
        <svg :xmlns="XMLNS" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`${mutableSvg.startX} ${mutableSvg.startY} ${mutableSvg.width} ${mutableSvg.height}`" :style="`max-width:100%;overflow:${isZoom ? 'hidden' : 'visible'};background:${quadrantConfig.style.chart.backgroundColor};color:${quadrantConfig.style.chart.color}`"  :id="`svg_${uid}`">
            
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
            <g v-if="quadrantConfig.style.chart.layout.labels.quadrantLabels.show && !isZoom">            
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
                        data-cy-quadrant-area
                        :fill="quadrantConfig.style.chart.layout.areas.useGradient ? `url(#quadrant_gradient_${uid}_${i})` : `${category.color}${opacity[quadrantConfig.style.chart.layout.areas.opacity]}`"
                        :points="giftWrap(category)"
                    />
                </g>
            </g>

            <!-- SIDE TRAPS -->
            <g>
                <rect
                    @click="selectQuadrantSide('TL')"
                    :x="svg.left"
                    :y="svg.top"
                    :width="svg.usableWidth / 2"
                    :height="svg.usableHeight / 2"
                    fill="transparent"
                    :class="{ 'vue-data-ui-zoom-plus': !isZoom, 'vue-data-ui-zoom-minus': isZoom }"
                />
                <rect
                    @click="selectQuadrantSide('TR')"
                    :x="svg.centerX"
                    :y="svg.top"
                    :width="svg.usableWidth / 2"
                    :height="svg.usableHeight / 2"
                    fill="transparent"
                    :class="{ 'vue-data-ui-zoom-plus': !isZoom, 'vue-data-ui-zoom-minus': isZoom }"
                />
                <rect
                    @click="selectQuadrantSide('BR')"
                    :x="svg.centerX"
                    :y="svg.centerY"
                    :width="svg.usableWidth / 2"
                    :height="svg.usableHeight / 2"
                    fill="transparent"
                    :class="{ 'vue-data-ui-zoom-plus': !isZoom, 'vue-data-ui-zoom-minus': isZoom }"
                />
                <rect
                    @click="selectQuadrantSide('BL')"
                    :x="svg.left"
                    :y="svg.centerY"
                    :width="svg.usableWidth / 2"
                    :height="svg.usableHeight / 2"
                    fill="transparent"
                    :class="{ 'vue-data-ui-zoom-plus': !isZoom, 'vue-data-ui-zoom-minus': isZoom }"
                />
            </g>

            <!-- PLOTS -->
            <template v-if="!quadrantConfig.style.chart.layout.labels.plotLabels.showAsTag">
                <g v-for="(category, i) in drawableDataset">
                    <Shape
                        v-for="plot in category.series"
                        :color="category.color"
                        :isSelected="hoveredPlotId && plot.uid === hoveredPlotId"
                        :plot="plot"
                        :radius="quadrantConfig.style.chart.layout.plots.radius / (isZoom ? 1.5 : 1)"
                        :shape="category.shape"
                        :stroke="quadrantConfig.style.chart.layout.plots.outline ? quadrantConfig.style.chart.layout.plots.outlineColor : 'none'"
                        :strokeWidth="quadrantConfig.style.chart.layout.plots.outlineWidth"
                        @mouseover="useTooltip(category, plot, i)"
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
                            :font-size="quadrantConfig.style.chart.layout.labels.plotLabels.fontSize / (isZoom ? 1.5 : 1)"
                            :fill="quadrantConfig.style.chart.layout.labels.plotLabels.color"
                        >
                            {{ plot.name }}
                        </text>
                    </g>
                </g>
            </template>

            <template v-else>
                <g v-if="mutableConfig.plotLabels.show">
                    <template v-for="(category, i) in drawableDataset">
                        <foreignObject v-for="plot in category.series" style="overflow: visible;" height="10" width="100" :x="plot.x - 50" :y="plot.y - (quadrantConfig.style.chart.layout.labels.plotLabels.fontSize)" @mouseover="useTooltip(category, plot, i)"
                            @mouseleave="isTooltip = false; hoveredPlotId = null; hoveredPlot = null"
                            @click="selectPlot(category, plot)">
                            <div :style="`color:${adaptColorToBackground(category.color)};margin: 0 auto; font-size:${quadrantConfig.style.chart.layout.labels.plotLabels.fontSize}px; text-align:center;background:${category.color}; padding: 2px 4px; border-radius: 12px; height: ${quadrantConfig.style.chart.layout.labels.plotLabels.fontSize*1.5}px`">
                                {{  plot.name }}
                            </div>
                        </foreignObject>
                    </template>
                </g>
            </template>

            <!-- HIDDEN AREAS ON ZOOM -->
            <g v-if="isZoom" class="vue-ui-dna">
                <polygon 
                    v-if="selectedSide === 'TL'"
                    :points="`${svg.left},${svg.centerY} ${svg.centerX},${svg.centerY} ${svg.centerX},${svg.top} ${svg.right},${svg.top} ${svg.right},${svg.bottom} ${svg.left},${svg.bottom} ${svg.left},${svg.centerY}`"
                    :fill="quadrantConfig.style.chart.backgroundColor"
                    style="opacity:1"
                />
                <polygon 
                    v-if="selectedSide === 'TR'"
                    :points="`${svg.left},${svg.top} ${svg.centerX},${svg.top} ${svg.centerX},${svg.centerY} ${svg.right},${svg.centerY} ${svg.right},${svg.bottom} ${svg.left},${svg.bottom} ${svg.left},${svg.top}`"
                    :fill="quadrantConfig.style.chart.backgroundColor"
                    style="opacity:1"
                />
                <polygon 
                    v-if="selectedSide === 'BR'"
                    :points="`${svg.left},${svg.top} ${svg.right},${svg.top} ${svg.right},${svg.centerY} ${svg.centerX},${svg.centerY} ${svg.centerX},${svg.bottom} ${svg.left},${svg.bottom} ${svg.left},${svg.top}`"
                    :fill="quadrantConfig.style.chart.backgroundColor"
                    style="opacity:1"
                />
                <polygon 
                    v-if="selectedSide === 'BL'"
                    :points="`${svg.left},${svg.top} ${svg.right},${svg.top} ${svg.right},${svg.bottom} ${svg.centerX},${svg.bottom} ${svg.centerX},${svg.centerY} ${svg.left},${svg.centerY} ${svg.left},${svg.top}`"
                    :fill="quadrantConfig.style.chart.backgroundColor"
                    style="opacity:1"
                />
            </g>

            <g v-if="selectedSide && !isAnimating">
                <text
                    :x="selectedSideLabelCoordinates.x"
                    :y="selectedSideLabelCoordinates.y - (selectedSideLabelCoordinates.fontSize / 1.5)"
                    :font-size="selectedSideLabelCoordinates.fontSize / 1.5"
                    :fill="selectedSideLabelCoordinates.fill"
                    text-anchor="middle"
                    :font-weight="selectedSideLabelCoordinates.bold ? 'bold' : 'normal'"
                >
                    {{ selectedSideLabelCoordinates.text }}
                </text>
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

            <!-- MINI MAP -->
            <g v-if="isZoom && selectedSide">
                <rect
                    :x="miniMap[selectedSide].tl.x"
                    :y="miniMap[selectedSide].tl.y"
                    height="20"
                    width="20"
                    :fill="miniMap[selectedSide].tl.fill"
                    :style="`cursor: pointer; opacity: ${selectedSide === 'TL' ? 1 : 0.2}`"
                    @click="selectQuadrantSide('TL')"
                    :class="{'vue-ui-quadrant-mini-map-cell': true, 'vue-ui-quadrant-mini-map-cell-selectable': selectedSide !== 'TL'}"
                />
                <rect
                    :x="miniMap[selectedSide].tr.x"
                    :y="miniMap[selectedSide].tr.y"
                    height="20"
                    width="20"
                    :fill="miniMap[selectedSide].tr.fill"
                    :style="`cursor: pointer; opacity: ${selectedSide === 'TR' ? 1 : 0.2}`"
                    @click="selectQuadrantSide('TR')"
                    :class="{'vue-ui-quadrant-mini-map-cell': true, 'vue-ui-quadrant-mini-map-cell-selectable': selectedSide !== 'TR'}"
                />
                <rect
                    :x="miniMap[selectedSide].br.x"
                    :y="miniMap[selectedSide].br.y"
                    height="20"
                    width="20"
                    :fill="miniMap[selectedSide].br.fill"
                    :style="`cursor: pointer; opacity: ${selectedSide === 'BR' ? 1 : 0.2}`"
                    @click="selectQuadrantSide('BR')"
                    :class="{'vue-ui-quadrant-mini-map-cell': true, 'vue-ui-quadrant-mini-map-cell-selectable': selectedSide !== 'BR'}"
                />
                <rect
                    :x="miniMap[selectedSide].bl.x"
                    :y="miniMap[selectedSide].bl.y"
                    height="20"
                    width="20"
                    :fill="miniMap[selectedSide].bl.fill"
                    :style="`cursor: pointer; opacity: ${selectedSide === 'BL' ? 1 : 0.2}`"
                    @click="selectQuadrantSide('BL')"
                    :class="{'vue-ui-quadrant-mini-map-cell': true, 'vue-ui-quadrant-mini-map-cell-selectable': selectedSide !== 'BL'}"
                />
                <path
                    class="vue-ui-quadrant-minimap-crosshairs"
                    :stroke="quadrantConfig.style.chart.backgroundColor" 
                    :stroke-width="1"
                    :d="miniMap[selectedSide].crosshairs.horizontal"
                />
                <path
                    class="vue-ui-quadrant-minimap-crosshairs"
                    :stroke="quadrantConfig.style.chart.backgroundColor" 
                    :stroke-width="1"
                    :d="miniMap[selectedSide].crosshairs.vertical"
                />
            </g>
            <slot name="svg" :svg="svg"/>
        </svg>

        <Skeleton 
            v-if="!isDataset"
            :config="{
                type: 'quadrant',
                style: {
                    backgroundColor: quadrantConfig.style.chart.backgroundColor,
                    quadrant: {
                        grid: {
                            color: quadrantConfig.style.chart.layout.grid.stroke
                        },
                        plots: {
                            color: quadrantConfig.style.chart.layout.grid.stroke,
                            radius: 1
                        }
                    }
                }
            }"
        />

        <!-- LEGEND AS DIV -->
        <Legend
            v-if="quadrantConfig.style.chart.legend.show && (!mutableConfig.inside || isPrinting)"
            :legendSet="legendSet"
            :config="legendConfig"
            @clickMarker="({legend}) => segregate(legend.id)"
        >
            <template #item="{ legend }">
                <div data-cy-legend-item @click="segregate(legend.id)" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                    {{ legend.name }} 
                </div>
            </template>
        </Legend>

        <slot name="legend" v-bind:legend="legendSet"></slot>

        <!-- TOOLTIP -->
        <Tooltip
            :show="quadrantConfig.style.chart.tooltip.show && isTooltip"
            :backgroundColor="quadrantConfig.style.chart.tooltip.backgroundColor"
            :color="quadrantConfig.style.chart.tooltip.color"
            :fontSize="quadrantConfig.style.chart.tooltip.fontSize"
            :parent="quadrantChart"
            :content="tooltipContent"
            :isCustom="quadrantConfig.style.chart.tooltip.customFormat && typeof quadrantConfig.style.chart.tooltip.customFormat === 'function'"
        >
            <template #tooltip-before>
                <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
            </template>
            <svg height="14" width="14" viewBox="0 0 20 20" v-if="quadrantConfig.style.chart.tooltip.showShape">
                <Shape
                    :plot="{ x: 10, y: 10 }"
                    :shape="hoveredPlot.shape"
                    :color="hoveredPlot.color"
                    :radius="8"
                    :stroke="quadrantConfig.style.chart.layout.plots.outline ? quadrantConfig.style.chart.layout.plots.outlineColor : 'none'"
                    :stroke-width="quadrantConfig.style.chart.layout.plots.outlineWidth"
                />
            </svg>
            <template #tooltip-after>
                <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
            </template>
        </Tooltip>

        <!-- DATA TABLE -->
        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000
        }">
            <template #content>
                <DataTable
                    :colNames="dataTable.colNames"
                    :head="dataTable.head"
                    :body="dataTable.body"
                    :config="dataTable.config"
                    :title="`${quadrantConfig.style.chart.title.text}${quadrantConfig.style.chart.title.subtitle.text ? ` : ${quadrantConfig.style.chart.title.subtitle.text}` : ''}`"
                    @close="mutableConfig.showTable = false"
                >
                    <template #th="{ th }">
                        {{ th }}
                    </template>
                    <template #td="{ td }">
                        <div v-html="td.name || td"/>
                    </template>
                </DataTable>
            </template>
        </Accordion>
    </div>
</template>

<style scoped>
@import "../vue-data-ui.css";
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

.vue-ui-quadrant-mini-map-cell,
.vue-ui-quadrant-mini-map-cell-selectable,
.vue-ui-quadrant-minimap-crosshairs {
    animation: none !important;
    transition: opacity 0.15s ease-in-out;
}

.vue-ui-quadrant-mini-map-cell:hover {
    stroke: white;
    stroke-width: 1px;
}
.vue-ui-quadrant-mini-map-cell-selectable:hover {
    opacity: 0.5 !important;
}
</style>