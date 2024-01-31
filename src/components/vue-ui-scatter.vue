<script setup>
import { ref, computed, nextTick, onMounted } from "vue";
import { palette, opacity, createUid, createCsvContent, downloadCsv } from '../lib';
import pdf from "../pdf";
import img from "../img";
import mainConfig from "../default_configs.json";
import { useNestedProp } from "../useNestedProp";
import Title from "../atoms/Title.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Tooltip from "../atoms/Tooltip.vue";
import Legend from "../atoms/Legend.vue";
import Shape from "../atoms/Shape.vue";
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

const defaultConfig = ref(mainConfig.vue_ui_scatter);

const isImaging = ref(false);
const isPrinting = ref(false);
const scatterChart = ref(null);
const details = ref(null);
const isTooltip = ref(false);
const tooltipContent = ref("");
const step = ref(0);

onMounted(() => {
    const xLabel = document.getElementById(`vue-ui-scatter-xAxis-label-${uid.value}`);
        if(xLabel) {
            const bboxY = xLabel.getBBox();
            const xPosition = bboxY.height / 2 + drawingArea.value.left / 5;
            const yPosition =  drawingArea.value.top + (drawingArea.value.height / 2);
            xLabel.setAttributeNS(null, "transform", `rotate(-90, ${xPosition}, ${yPosition})`);
            xLabel.setAttributeNS(null, "x", xPosition);
            xLabel.setAttributeNS(null, "y", yPosition);
        }
});

const scatterConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const mutableConfig = ref({
    inside: !scatterConfig.value.style.layout.useDiv,
    showTable: scatterConfig.value.table.show,
});

const svg = computed(() => {
    return {
        height: scatterConfig.value.style.layout.height,
        width: scatterConfig.value.style.layout.width,
    }
});

const drawingArea = computed(() => {
    return {
        top: scatterConfig.value.style.layout.padding.top,
        right: svg.value.width - scatterConfig.value.style.layout.padding.right,
        bottom: svg.value.height - scatterConfig.value.style.layout.padding.bottom,
        left: scatterConfig.value.style.layout.padding.left,
        height: svg.value.height - scatterConfig.value.style.layout.padding.top - scatterConfig.value.style.layout.padding.bottom,
        width: svg.value.width - scatterConfig.value.style.layout.padding.left - scatterConfig.value.style.layout.padding.right
    }
});

const extremes = computed(() => {
    const xMin = Math.min(...datasetWithId.value.filter(el => !segregated.value.includes(el.id)).flatMap(ds => ds.values.map(v => v.x)));
    const xMax = Math.max(...datasetWithId.value.filter(el => !segregated.value.includes(el.id)).flatMap(ds => ds.values.map(v => v.x)));
    const yMin = Math.min(...datasetWithId.value.filter(el => !segregated.value.includes(el.id)).flatMap(ds => ds.values.map(v => v.y)));
    const yMax = Math.max(...datasetWithId.value.filter(el => !segregated.value.includes(el.id)).flatMap(ds => ds.values.map(v => v.y)));
    return { xMin, xMax, yMin, yMax };
});

const zero = computed(() => {
    return {
        x: drawingArea.value.left + (Math.abs(extremes.value.xMin) / (extremes.value.xMax + Math.abs(extremes.value.xMin))) * drawingArea.value.width,
        y: drawingArea.value.bottom - (Math.abs(extremes.value.yMin) / (extremes.value.yMax + Math.abs(extremes.value.yMin))) * drawingArea.value.height
    }
});

const datasetWithId = computed(() => {
    return props.dataset.map((ds, i) => {
        const id = `cluster_${uid.value}_${i}`;
        return {
            ...ds,
            id,
            color: ds.color ? ds.color : (palette[i] || palette[i % palette.length]),
            opacity: segregated.value.includes(id) ? 0.5: 1,
            shape: ds.shape ?? 'circle'
        }
    })
})

const legendConfig = computed(() => {
    return {
        cy: 'scatter-div-legend',
        backgroundColor: scatterConfig.value.style.legend.backgroundColor,
        color: scatterConfig.value.style.legend.color,
        fontSize: scatterConfig.value.style.legend.fontSize,
        paddingBottom: 12,
        fontWeight: scatterConfig.value.style.legend.bold ? 'bold' : ''
    }
})

const mutableDataset = computed(() => {
    return datasetWithId.value.map((ds, i) => {
        return {
            ...ds,
            plots: ds.values.map(v => {
                return {
                    x: drawingArea.value.left + ((v.x + Math.abs(extremes.value.xMin)) / (extremes.value.xMax + Math.abs(extremes.value.xMin))) * drawingArea.value.width,
                    y: drawingArea.value.bottom - ((v.y + Math.abs(extremes.value.yMin)) / (extremes.value.yMax + Math.abs(extremes.value.yMin))) * drawingArea.value.height,
                    v: {
                        ...v,
                        name: v.name || ""
                    },
                    clusterName: ds.name,
                    color: ds.color ? ds.color : (palette[i] || palette[i % palette.length]),
                    id: `plot_${uid.value}_${Math.random()}`
                }
            }),
        }
    }).filter(ds => !segregated.value.includes(ds.id));
})

const drawableDataset = computed(() => {
    return mutableDataset.value.map(ds => {

        const meanX = ds.plots.reduce((sum, point) => sum + point.x, 0) / ds.plots.length;
        const meanY = ds.plots.reduce((sum, point) => sum + point.y, 0) / ds.plots.length;
        let numerator = 0;
        let denominatorX = 0;
        let denominatorY = 0;

        for (const point of ds.plots) {
            numerator += (point.x - meanX) * (point.y - meanY);
            denominatorX += (point.x - meanX) ** 2;
            denominatorY += (point.y - meanY) ** 2;
        }

        const correlationCoefficient = numerator / Math.sqrt(denominatorX * denominatorY);
        const slope = correlationCoefficient * (Math.sqrt(denominatorY) / Math.sqrt(denominatorX));
        const intercept = meanY - slope * meanX;
        const correlation = {
            x1: drawingArea.value.left,
            x2: drawingArea.value.right,
            y1: slope * drawingArea.value.left + intercept,
            y2: slope * drawingArea.value.right + intercept,
            coefficient: correlationCoefficient
        }

        const m = (correlation.y2 - correlation.y1) / (correlation.x2 - correlation.x1);
        const b = correlation.y1 - m * correlation.x1;

        const labelX = Math.min(svg.value.width - scatterConfig.value.style.layout.padding.right, Math.max(scatterConfig.value.style.layout.padding.left, (drawingArea.value.top - b) / m));

        const label = {
            x: labelX,
            y: m * labelX + b <= scatterConfig.value.style.layout.padding.top ? drawingArea.value.top : m * labelX + b
        }

        return {
            ...ds,
            correlation,
            label,
            plots: ds.plots.map(plot => {
                const x_proj = (plot.x + m * plot.y - m * b) / (1 + Math.pow(m, 2));
                const y_proj = (m * plot.x + Math.pow(m, 2) * plot.y + b) / (1 + Math.pow(m, 2));
                const deviation = Math.sqrt(Math.pow(plot.x - x_proj, 2) + Math.pow(plot.y - y_proj, 2));
                return {
                    ...plot,
                    deviation,
                    shape: ds.shape,
                    color: ds.color
                }
            })
        }
    })
});

function getData() {
    return drawableDataset.value;
}

const selectedPlotId = ref(undefined);
const selectedPlot = ref(null);

function hoverPlot(plot) {
    selectedPlotId.value = plot.id;
    selectedPlot.value = plot;
    let html = "";

    if (plot.clusterName) {
        html += `<div style="display:flex;gap:3px;align-items:center">${plot.clusterName}</div>`
    }

    if (plot.v.name) {
        html += `<div>${plot.v.name}</div>`
    }

    html += `<div style="text-align:left;margin-top:6px;padding-top:6px;border-top:1px solid #e1e5e8">`;
    html += `<div>${scatterConfig.value.style.layout.dataLabels.xAxis.name} : <b>${isNaN(plot.v.x) ? '-' : Number(plot.v.x.toFixed(scatterConfig.value.style.layout.dataLabels.xAxis.roundingValue)).toLocaleString()}</b></div>`;
    html += `<div>${scatterConfig.value.style.layout.dataLabels.yAxis.name} : <b>${isNaN(plot.v.y) ? '-' : Number(plot.v.y.toFixed(scatterConfig.value.style.layout.dataLabels.yAxis.roundingValue)).toLocaleString()}</b></div>`;
    html += `${scatterConfig.value.style.layout.plots.deviation.translation} : <b>${Number(plot.deviation.toFixed(scatterConfig.value.style.layout.plots.deviation.roundingValue)).toLocaleString()}</b>`
    html += `</div>`;

    tooltipContent.value = `<div>${html}</div>`
    isTooltip.value = true;
}

function clearHover() {
    isTooltip.value = false;
    selectedPlotId.value = undefined;
    selectedPlot.value = null;
}

const segregated = ref([]);

function segregate(id) {
    if (segregated.value.includes(id)) {
        segregated.value = segregated.value.filter(el => el !== id);
    } else {
        if (segregated.value.length < props.dataset.length - 1) {
            segregated.value.push(id)
        }
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
            domElement: document.getElementById(`vue-ui-scatter_${uid.value}`),
            fileName: scatterConfig.value.style.title.text || 'vue-ui-scatter'
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
            domElement: document.getElementById(`vue-ui-scatter_${uid.value}`),
                fileName: scatterConfig.value.style.title.text || 'vue-ui-scatter',
            format: 'png'
        }).finally(() => {
            isImaging.value = false;
        })
    }, 100);

}

function generateCsv() {
    nextTick(() => {
        const labels = ["", scatterConfig.value.table.translations.correlationCoefficient, scatterConfig.value.table.translations.nbrPlots, `${scatterConfig.value.style.layout.dataLabels.xAxis.name} ${scatterConfig.value.table.translations.average}`, `${scatterConfig.value.style.layout.dataLabels.yAxis.name} ${scatterConfig.value.table.translations.average}`];

        const values = drawableDataset.value.map(ds => {
            return [
                ds.name,
                ds.correlation.coefficient,
                ds.plots.length,
                ds.plots.map(plot => plot.v.x).reduce((a, b) => a + b, 0) / ds.plots.length,
                ds.plots.map(plot => plot.v.y).reduce((a, b) => a + b, 0) / ds.plots.length
            ]
        });

        const tableXls = [[scatterConfig.value.style.title.text],[scatterConfig.value.style.title.subtitle.text],[[""],[""],[""]]].concat([labels]).concat(values)
        const csvContent = createCsvContent(tableXls);
        downloadCsv({ csvContent, title: scatterConfig.value.style.title.text || "vue-ui-heatmap"})
    });
}

const dataTable = computed(() => {
    const head = [
        scatterConfig.value.table.translations.series,
        scatterConfig.value.table.translations.correlationCoefficient,
        scatterConfig.value.table.translations.nbrPlots,
        `${scatterConfig.value.style.layout.dataLabels.xAxis.name} ${scatterConfig.value.table.translations.average}`,
        `${scatterConfig.value.style.layout.dataLabels.yAxis.name} ${scatterConfig.value.table.translations.average}`
    ];

    const body = drawableDataset.value.map(ds => {
        return [
            `<span style="color:${ds.color}">⬤</span> ${ds.name}`,
            Number((ds.correlation.coefficient ?? 0).toFixed(scatterConfig.value.table.td.roundingValue)).toLocaleString(),
            ds.plots.length.toLocaleString(),
            Number((ds.plots.map(p => p.v.x ?? 0).reduce((a,b) => a + b , 0) / ds.plots.length).toFixed(scatterConfig.value.table.td.roundingAverage)).toLocaleString(),
            Number((ds.plots.map(p => p.v.y ?? 0).reduce((a,b) => a + b , 0) / ds.plots.length).toFixed(scatterConfig.value.table.td.roundingAverage)).toLocaleString(),
        ]
    });

    const config = {
        th: {
            backgroundColor: scatterConfig.value.table.th.backgroundColor,
            color: scatterConfig.value.table.th.color,
            outline: scatterConfig.value.table.th.outline
        },
        td: {
            backgroundColor: scatterConfig.value.table.td.backgroundColor,
            color: scatterConfig.value.table.td.color,
            outline: scatterConfig.value.table.td.outline
        },
        breakpoint: scatterConfig.value.table.responsiveBreakpoint
    };

    return { head, body, config, colNames: head };
})

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
    <div :class="`vue-ui-scatter ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${scatterConfig.useCssAnimation ? '' : 'vue-ui-dna'}`" ref="scatterChart" :id="`vue-ui-scatter_${uid}`" :style="`font-family:${scatterConfig.style.fontFamily};width:100%; text-align:center;${!scatterConfig.style.title.text ? 'padding-top:36px' : ''};background:${scatterConfig.style.backgroundColor}`">
        
        <div v-if="(!mutableConfig.inside || isPrinting) && scatterConfig.style.title.text" :style="`width:100%;background:${scatterConfig.style.backgroundColor}`">
            <!-- TITLE AS DIV -->
            <Title
                :config="{
                    title: {
                        cy: 'scatter-div-title',
                        text: scatterConfig.style.title.text,
                        color: scatterConfig.style.title.color,
                        fontSize: scatterConfig.style.title.fontSize,
                        bold: scatterConfig.style.title.bold
                    },
                    subtitle: {
                        cy: 'scatter-div-subtitle',
                        text: scatterConfig.style.title.subtitle.text,
                        color: scatterConfig.style.title.subtitle.color,
                        fontSize: scatterConfig.style.title.subtitle.fontSize,
                        bold: scatterConfig.style.title.subtitle.bold
                    },
                }"
            />
        </div>

        <!-- OPTIONS -->
        <UserOptions
            ref="details"
            :key="`user_options_${step}`"
            v-if="scatterConfig.userOptions.show"
            :backgroundColor="scatterConfig.style.backgroundColor"
            :color="scatterConfig.style.color"
            :isImaging="isImaging"
            :isPrinting="isPrinting"
            :title="scatterConfig.userOptions.title"
            :uid="uid"
            :hasImg="true"
            hasTable
            hasFullscreen
            :isFullscreen="isFullscreen"
            :chartElement="scatterChart"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="mutableConfig.showTable = !mutableConfig.showTable"
        />

        <!-- CHART -->
        <svg :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" :viewBox="`0 0 ${svg.width} ${svg.height}`" :style="`max-width:100%;overflow:visible;background:${scatterConfig.style.backgroundColor};color:${scatterConfig.style.color}`">

            <!-- TITLE AS G -->
            <g v-if="scatterConfig.style.title.text && mutableConfig.inside && !isPrinting">
                <text
                    data-cy="scatter-text-title"
                    :font-size="scatterConfig.style.title.fontSize"
                    :fill="scatterConfig.style.title.color"
                    :x="svg.width / 2"
                    :y="0"
                    text-anchor="middle"
                    :style="`font-weight:${scatterConfig.style.title.bold ? 'bold' : ''}`"
                >
                    {{ scatterConfig.style.title.text }}
                </text>
                <text
                    data-cy="scatter-text-subtitle"
                    v-if="scatterConfig.style.title.subtitle.text"
                    :font-size="scatterConfig.style.title.subtitle.fontSize"
                    :fill="scatterConfig.style.title.subtitle.color"
                    :x="svg.width / 2"
                    :y="scatterConfig.style.title.fontSize"
                    text-anchor="middle"
                    :style="`font-weight:${scatterConfig.style.title.subtitle.bold ? 'bold' : ''}`"
                >
                    {{ scatterConfig.style.title.subtitle.text }}
                </text>
            </g>

            <!-- AXIS -->
            <g v-if="scatterConfig.style.layout.axis.show">
                <line
                    data-cy="scatter-y-axis"
                    :x1="zero.x"
                    :x2="zero.x"
                    :y1="drawingArea.top"
                    :y2="drawingArea.bottom"
                    :stroke="scatterConfig.style.layout.axis.stroke"
                    :stroke-width="scatterConfig.style.layout.axis.strokeWidth"
                    stroke-linecap="round"
                />
                <line
                    data-cy="scatter-x-axis"
                    :x1="drawingArea.left"
                    :x2="drawingArea.right"
                    :y1="zero.y"
                    :y2="zero.y"
                    :stroke="scatterConfig.style.layout.axis.stroke"
                    :stroke-width="scatterConfig.style.layout.axis.strokeWidth"
                    stroke-linecap="round"
                />
            </g>

            <!-- PLOTS -->
            <g v-for="(ds, i) in drawableDataset">
                <g v-if="!ds.shape || ds.shape === 'circle'">
                    <circle 
                        v-for="(plot, j) in ds.plots"
                        :data-cy="`scatter-plot-${i}-${j}`"
                        :cx="plot.x"
                        :cy="plot.y"
                        :r="selectedPlotId && selectedPlotId === plot.id ? scatterConfig.style.layout.plots.radius * 2 : scatterConfig.style.layout.plots.radius"
                        :fill="`${ds.color}${opacity[scatterConfig.style.layout.plots.opacity * 100]}`"
                        :stroke="scatterConfig.style.layout.plots.stroke"
                        :stroke-width="scatterConfig.style.layout.plots.strokeWidth"
                        @mouseover="hoverPlot(plot)"
                        @mouseleave="clearHover"
                        :style="`opacity:${scatterConfig.style.layout.plots.significance.show && Math.abs(plot.deviation) > scatterConfig.style.layout.plots.significance.deviationThreshold ? scatterConfig.style.layout.plots.significance.opacity : 1}`"
                    />
                </g>
                <g v-else>
                    <Shape
                        v-for="(plot, j) in ds.plots"
                        :data-cy="`scatter-plot-${i}-${j}`"
                        :plot="{x: plot.x, y: plot.y }"
                        :radius="selectedPlotId && selectedPlotId === plot.id ? scatterConfig.style.layout.plots.radius * 2 : scatterConfig.style.layout.plots.radius"
                        :shape="ds.shape"
                        :color="`${ds.color}${opacity[scatterConfig.style.layout.plots.opacity * 100]}`"
                        :stroke="scatterConfig.style.layout.plots.stroke"
                        :strokeWidth="scatterConfig.style.layout.plots.strokeWidth"
                        @mouseover="hoverPlot(plot)"
                        @mouseleave="clearHover"
                        :style="`opacity:${scatterConfig.style.layout.plots.significance.show && Math.abs(plot.deviation) > scatterConfig.style.layout.plots.significance.deviationThreshold ? scatterConfig.style.layout.plots.significance.opacity : 1}`"
                    />
                </g>
            </g>

            <!-- AXIS LABELS -->
            <g v-if="scatterConfig.style.layout.dataLabels.xAxis.show">
                <text
                    data-cy="scatter-x-min-axis-label"
                    :x="drawingArea.left - 5"
                    :y="zero.y + scatterConfig.style.layout.dataLabels.xAxis.fontSize / 3"
                    text-anchor="end"
                    :font-size="scatterConfig.style.layout.dataLabels.xAxis.fontSize"
                    :fill="scatterConfig.style.layout.dataLabels.xAxis.color"
                >
                    {{ Number(extremes.xMin.toFixed(scatterConfig.style.layout.dataLabels.xAxis.rounding)).toLocaleString() }}
                </text>
                <text
                    data-cy="scatter-x-max-axis-label"
                    :x="drawingArea.right + 3"
                    :y="zero.y + scatterConfig.style.layout.dataLabels.xAxis.fontSize / 3"
                    text-anchor="start"
                    :font-size="scatterConfig.style.layout.dataLabels.xAxis.fontSize"
                    :fill="scatterConfig.style.layout.dataLabels.xAxis.color"
                >
                    {{ Number(extremes.xMax.toFixed(scatterConfig.style.layout.dataLabels.xAxis.rounding)).toLocaleString() }}
                </text>
                <text
                    data-cy="scatter-x-label-name"
                    :id="`vue-ui-scatter-xAxis-label-${uid}`" 
                    text-anchor="middle"
                    :font-size="scatterConfig.style.layout.dataLabels.xAxis.fontSize"
                    :font-weight="scatterConfig.style.layout.dataLabels.xAxis.bold ? 'bold' : 'normal'"
                    :fill="scatterConfig.style.layout.dataLabels.xAxis.color"
                >
                    {{ scatterConfig.style.layout.dataLabels.xAxis.name }}
                </text>

            </g>
            <g v-if="scatterConfig.style.layout.dataLabels.yAxis.show">
                <text
                    data-cy="scatter-y-min-axis-label"
                    :x="zero.x"
                    :y="drawingArea.bottom + scatterConfig.style.layout.dataLabels.yAxis.fontSize + 3"
                    text-anchor="middle"
                    :font-size="scatterConfig.style.layout.dataLabels.yAxis.fontSize"
                    :fill="scatterConfig.style.layout.dataLabels.yAxis.color"
                >
                    {{ Number(extremes.yMin.toFixed(scatterConfig.style.layout.dataLabels.yAxis.rounding)).toLocaleString() }}
                </text>
                <text
                    data-cy="scatter-y-max-axis-label"
                    :x="zero.x"
                    :y="drawingArea.top - scatterConfig.style.layout.dataLabels.yAxis.fontSize / 2"
                    text-anchor="middle"
                    :font-size="scatterConfig.style.layout.dataLabels.yAxis.fontSize"
                    :fill="scatterConfig.style.layout.dataLabels.yAxis.color"
                >
                    {{ Number(extremes.yMax.toFixed(scatterConfig.style.layout.dataLabels.yAxis.rounding)).toLocaleString() }}
                </text>
                <text
                    data-cy="scatter-y-label-name"
                    text-anchor="middle"
                    :font-size="scatterConfig.style.layout.dataLabels.yAxis.fontSize"
                    :font-weight="scatterConfig.style.layout.dataLabels.yAxis.bold ? 'bold' : 'normal'"
                    :fill="scatterConfig.style.layout.dataLabels.yAxis.color"
                    :x="drawingArea.left + drawingArea.width / 2"
                    :y="drawingArea.top - 8 - scatterConfig.style.layout.dataLabels.yAxis.fontSize"
                >
                    {{ scatterConfig.style.layout.dataLabels.yAxis.name }}
                </text>
            </g>

            <clipPath :id="`clip_path_${uid}`">
                <rect
                    :x="scatterConfig.style.layout.padding.left"
                    :y="scatterConfig.style.layout.padding.top"
                    :width="drawingArea.width"
                    :height="drawingArea.height"
                />
            </clipPath>

            <!-- CORRELATION -->
            <g v-if="scatterConfig.style.layout.correlation.show">
                <line 
                    v-for="(ds, i) in drawableDataset"
                    :data-cy="`scatter-correlation-line-${i}`"
                    :x1="ds.correlation.x1"
                    :x2="ds.correlation.x2"
                    :y1="ds.correlation.y1"
                    :y2="ds.correlation.y2"
                    :stroke-dasharray="scatterConfig.style.layout.correlation.strokeDasharray"
                    :stroke="ds.color"
                    :stroke-width="scatterConfig.style.layout.correlation.strokeWidth"
                    :clip-path="`url(#clip_path_${uid})`"
                />
                <g v-for="(ds, i) in drawableDataset">
                    <text
                        :data-cy="`scatter-correlation-label-${i}`"
                        v-if="scatterConfig.style.layout.correlation.label.show"
                        :x="ds.label.x"
                        :y="ds.label.y"
                        :fill="scatterConfig.style.layout.correlation.label.useSerieColor ? ds.color : scatterConfig.style.layout.correlation.label.color"
                        :font-size="scatterConfig.style.layout.correlation.label.fontSize"
                        :font-weight="scatterConfig.style.layout.correlation.label.bold ? 'bold' : 'normal'"
                    >
                        {{ Number(ds.correlation.coefficient.toFixed(scatterConfig.style.layout.correlation.label.roundingValue)).toLocaleString() }}
                    </text>
                </g>
            </g>

            <!-- LEGEND AS G -->
            <foreignObject 
                v-if="scatterConfig.style.legend.show && mutableConfig.inside && !isPrinting"
                :x="0"
                :y="drawingArea.bottom"
                width="100%"
                :height="svg.height - drawingArea.bottom"
                style="overflow:visible"
            >
                <Legend
                    :legendSet="datasetWithId"
                    :config="legendConfig"
                    @clickMarker="({ legend }) => segregate(legend.id)"
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
            v-if="scatterConfig.style.legend.show && (!mutableConfig.inside || isPrinting)"
            :legendSet="datasetWithId"
            :config="legendConfig"
            @clickMarker="({ legend }) => segregate(legend.id)"
        >
            <template #item="{ legend }">
                <div @click="segregate(legend.id)" :style="`opacity:${segregated.includes(legend.id) ? 0.5 : 1}`">
                    {{ legend.name }}
                </div>
            </template>
        </Legend>

        <!-- TOOLTIP -->
        <Tooltip
            :show="scatterConfig.style.tooltip.show && isTooltip"
            :backgroundColor="scatterConfig.style.tooltip.backgroundColor"
            :color="scatterConfig.style.tooltip.color"
            :parent="scatterChart"
            :content="tooltipContent"
        >
            <div style="width: 100%; display: flex; align-items:center;justify-content:center;">
                <svg viewBox="0 0 20 20" height="20" width="20" style="overflow: hidden;background:transparent;">
                    <Shape 
                        :shape="selectedPlot.shape"
                        :color="selectedPlot.color"
                        :plot="{x: 10, y: 10}"
                        :radius="7"
                    />
                </svg>
            </div>
        </Tooltip>

        <!-- DATA TABLE -->
        <div :style="`${isPrinting ? '' : 'max-height:400px'};overflow:auto;width:100%;margin-top:${mutableConfig.inside ? '48px' : ''}`" v-if="mutableConfig.showTable">
            <DataTable
                :colNames="dataTable.colNames"
                :head="dataTable.head"
                :body="dataTable.body"
                :config="dataTable.config"
                :title="`${scatterConfig.style.title.text}${scatterConfig.style.title.subtitle.text ? ` : ${scatterConfig.style.title.subtitle.text}` : ''}`"

            >
                <template #th="{ th }">
                    {{ th }}
                </template>
                <template #td="{ td }">
                    <div v-html="td"/>
                </template>
            </DataTable>
        </div>
    </div>
</template>

<style scoped>
.vue-ui-scatter *{
    transition: unset;
}
.vue-ui-scatter {
    user-select: none;
    position: relative;
}

path, line, circle {
    animation: verticalBarAnimation 0.5s ease-in-out !important;
    transform-origin: center !important;
}
@keyframes verticalBarAnimation {
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
.vue-ui-scatter .vue-ui-scatter-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}

/** */
.vue-ui-scatter-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    max-width: 300px;
    position: fixed;
    padding:12px;
    z-index:1;
}

.vue-ui-scatter table {
    width: 100%;
    border-collapse:collapse;
}
.vue-ui-scatter table td {
    text-align:right;
    padding-right: 6px;
    font-variant-numeric: tabular-nums;
}
.vue-ui-scatter table th {
    position: sticky;
    top:0;
    font-weight: 400;
    user-select: none;
}

.vue-ui-dna * {
    animation: none !important;
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