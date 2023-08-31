
<template>
    <div :id="`vue-ui-xy_${uniqueId}`" class="vue-ui-xy" ref="chart" :style="`background:${chartConfig.chart.backgroundColor}; color:${chartConfig.chart.color};width:100%`">
        <!-- TITLE AS OUTSIDE DIV -->
        <div class="vue-ui-xy-title" v-if="chartConfig.chart.title.show && (!mutableConfig.titleInside || isPrinting)" :style="`font-family:${chartConfig.chart.fontFamily}`">
            <div class="vue-ui-xy-title-main" :style="`font-size:${chartConfig.chart.title.fontSize}px; color:${chartConfig.chart.title.color}; font-weight:${chartConfig.chart.title.bold ? 'bold': '400'}`">
                {{ chartConfig.chart.title.text }}
            </div>
            <div class="vue-ui-xy-title-subtitle" v-if="chartConfig.chart.title.subtitle.text" :style="`font-size:${chartConfig.chart.title.subtitle.fontSize}px; color:${chartConfig.chart.title.subtitle.color}`">
                {{ chartConfig.chart.title.subtitle.text }}
            </div>
        </div>

        <details class="vue-ui-xy-user-options" :style="`background:${chartConfig.chart.backgroundColor};color:${chartConfig.chart.color}`" data-html2canvas-ignore v-if="chartConfig.chart.userOptions.show" ref="details">
            <summary :style="`background:${chartConfig.chart.backgroundColor};color:${chartConfig.chart.color}`">{{ chartConfig.chart.userOptions.title }}</summary>
            <div class="vue-ui-xy-user-options-items" :style="`background:${chartConfig.chart.backgroundColor};color:${chartConfig.chart.color}`">
                <div class="vue-ui-xy-user-option-item">
                    <input type="checkbox" :id="`vue-ui-xy-option-datalabels_${uniqueId}`" :name="`vue-ui-xy-option-datalabels_${uniqueId}`"
                    v-model="mutableConfig.dataLabels.show">
                    <label :for="`vue-ui-xy-option-datalabels_${uniqueId}`">{{ chartConfig.chart.userOptions.labels.dataLabels }}</label>
                </div>
                <div class="vue-ui-xy-user-option-item">
                    <input type="checkbox" :id="`vue-ui-xy-option-title_${uniqueId}`" :name="`vue-ui-xy-option-title_${uniqueId}`"
                    v-model="mutableConfig.titleInside">
                    <label :for="`vue-ui-xy-option-title_${uniqueId}`">{{ chartConfig.chart.userOptions.labels.titleInside }}</label>
                </div>
                <div class="vue-ui-xy-user-option-item">
                    <input type="checkbox" :id="`vue-ui-xy-option-legend_${uniqueId}`" :name="`vue-ui-xy-option-legend_${uniqueId}`"
                    v-model="mutableConfig.legendInside">
                    <label :for="`vue-ui-xy-option-legend_${uniqueId}`">{{ chartConfig.chart.userOptions.labels.legendInside }}</label>
                </div>
                <div class="vue-ui-xy-user-option-item">
                    <input type="checkbox" :id="`vue-ui-xy-option-table_${uniqueId}`" :name="`vue-ui-xy-option-table_${uniqueId}`"
                    v-model="mutableConfig.showTable">
                    <label :for="`vue-ui-xy-option-table_${uniqueId}`">{{ chartConfig.chart.userOptions.labels.showTable }}</label>
                </div>
                <button class="vue-ui-xy-button" @click="generatePdf" :disabled="isPrinting" :style="`margin-top: 12px; background:${chartConfig.chart.backgroundColor};color:${chartConfig.chart.color}`">
                    <svg class="vue-ui-xy-print-icon" xmlns="http://www.w3.org/2000/svg" v-if="isPrinting" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" :stroke="chartConfig.chart.color" fill="none" stroke-linecap="round" stroke-linejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                        <path d="M18 16v.01" />
                        <path d="M6 16v.01" />
                        <path d="M12 5v.01" />
                        <path d="M12 12v.01" />
                        <path d="M12 1a4 4 0 0 1 2.001 7.464l.001 .072a3.998 3.998 0 0 1 1.987 3.758l.22 .128a3.978 3.978 0 0 1 1.591 -.417l.2 -.005a4 4 0 1 1 -3.994 3.77l-.28 -.16c-.522 .25 -1.108 .39 -1.726 .39c-.619 0 -1.205 -.14 -1.728 -.391l-.279 .16l.007 .231a4 4 0 1 1 -2.212 -3.579l.222 -.129a3.998 3.998 0 0 1 1.988 -3.756l.002 -.071a4 4 0 0 1 -1.995 -3.265l-.005 -.2a4 4 0 0 1 4 -4z" />
                    </svg>
                    <span v-else>PDF</span>
                </button>
                <button class="vue-ui-xy-button" @click="generateXls" :style="`background:${chartConfig.chart.backgroundColor};color:${chartConfig.chart.color}`">
                    XLSX
                </button>
            </div>
        </details>


        <svg width="100%" :viewBox="viewBox" class="vue-ui-xy-svg" :style="`background:${chartConfig.chart.backgroundColor}; color:${chartConfig.chart.color}; font-family:${chartConfig.chart.fontFamily}`" @click="closeDetails">
            <g v-if="maxSeries > 0"> 
                <!-- GRID -->
                <g class="vue-ui-xy-grid">
                    <line 
                        :stroke="chartConfig.chart.grid.stroke" 
                        stroke-width="1" 
                        :x1="drawingArea.left" 
                        :x2="drawingArea.left" 
                        :y1="drawingArea.top" 
                        :y2="drawingArea.bottom" 
                        stroke-linecap="round"
                    />
                    <line 
                        :stroke="chartConfig.chart.grid.stroke" 
                        stroke-width="1" 
                        :x1="drawingArea.left" 
                        :x2="drawingArea.right" 
                        :y1="zero" 
                        :y2="zero" 
                        stroke-linecap="round"
                    />
                    <g v-if="chartConfig.chart.grid.showVerticalLines">
                        <line 
                            v-for="(line, i) in maxSeries + 1" 
                            :key="`grid_vertical_line_${i}`"
                            :x1="(drawingArea.width / maxSeries) * i + drawingArea.left"
                            :x2="(drawingArea.width / maxSeries) * i + drawingArea.left"
                            :y1="drawingArea.top"
                            :y2="drawingArea.bottom"
                            stroke-width="0.5"
                            :stroke="chartConfig.chart.grid.stroke"
                        />
                    </g>
                </g>

                <!-- DEFS BARS -->
                <template v-for="(serie, i) in barSet" :key="`def_rect_${i}`">
                    <defs>
                        <linearGradient :id="`rectGradient_pos_${i}_${uniqueId}`" x2="0%" y2="100%">
                            <stop offset="0%" :stop-color="serie.color"/>
                            <stop offset="62%" :stop-color="`${shiftHue(serie.color, 0.02)}DE`"/>
                            <stop offset="100%" :stop-color="`${shiftHue(serie.color, 0.05)}66`"/>
                        </linearGradient>
                        <linearGradient :id="`rectGradient_neg_${i}_${uniqueId}`" x2="0%" y2="100%">
                            <stop offset="0%" :stop-color="`${shiftHue(serie.color, 0.05)}66`"/>
                            <stop offset="38%" :stop-color="`${shiftHue(serie.color, 0.02)}DE`"/>
                            <stop offset="100%" :stop-color="serie.color"/>
                        </linearGradient>
                    </defs>
                </template>

                <!-- DEFS PLOTS -->
                <template v-for="(serie, i) in plotSet" :key="`def_plot_${i}`">
                    <defs>
                        <radialGradient :id="`plotGradient_${i}_${uniqueId}`" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" :stop-color="`${shiftHue(serie.color, 0.05)}`"/>
                            <stop offset="100%" :stop-color="serie.color" />
                        </radialGradient>
                    </defs>
                </template>

                <!-- DEFS LINES -->
                <template v-for="(serie, i) in lineSet" :key="`def_line_${i}`">
                    <defs>
                        <radialGradient :id="`lineGradient_${i}_${uniqueId}`" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" :stop-color="`${shiftHue(serie.color, 0.05)}`"/>
                            <stop offset="100%" :stop-color="serie.color" />
                        </radialGradient>
                    </defs>
                </template>

                <!-- BARS -->
                <g v-for="(serie, i) in barSet" :key="`serie_bar_${i}`" :class="`serie_bar_${i}`">
                    <g 
                        v-for="(plot, j) in serie.plots" 
                        :key="`bar_plot_${i}_${j}`">
                        <rect 
                            v-if="canShowValue(plot.value)"
                            :x="calcRectX(plot)"
                            :y="calcRectY(plot)"
                            :height="calcRectHeight(plot)"
                            :width="calcRectWidth()"
                            :fill="chartConfig.bar.useGradient ? plot.value >= 0 ? `url(#rectGradient_pos_${i}_${uniqueId})`: `url(#rectGradient_neg_${i}_${uniqueId})` : serie.color"
                        />
                    </g>
                    <g v-if="Object.hasOwn(serie, 'useProgression') && serie.useProgression === true && !isNaN(calcLinearProgression(serie.plots).trend)">
                        <defs>
                                <marker :id="`bar_arrow_${i}`" :markerWidth="7" :markerHeight="7" 
                                refX="0" :refY="7/2" orient="auto">
                                    <polygon 
                                        :points="`0 0, ${7} ${7/2}, 0 ${7}`" 
                                        :fill="serie.color"
                                    />
                                </marker>
                            </defs>
                            <line
                            :x1="calcLinearProgression(serie.plots).x1"
                            :x2="calcLinearProgression(serie.plots).x2"
                            :y1="calcLinearProgression(serie.plots).y1"
                            :y2="calcLinearProgression(serie.plots).y2"
                            :stroke-width="1"
                            :stroke="serie.color"
                            :stroke-dasharray="2"
                            :marker-end="`url(#bar_arrow_${i})`"
                        />
                        <text
                            text-anchor="middle"
                            :x="calcLinearProgression(serie.plots).x2"
                            :y="calcLinearProgression(serie.plots).y2 - 6"
                            :font-size="chartConfig.chart.labels.fontSize"
                            :fill="serie.color"
                        >
                            {{ `${(calcLinearProgression(serie.plots).trend * 100).toFixed(2)}%` }}
                        </text>
                    </g>
                </g>

                <!-- PLOTS -->
                <g v-for="(serie, i) in plotSet" :key="`serie_plot_${i}`" :class="`serie_plot_${i}`">
                    <g 
                        v-for="(plot, j) in serie.plots" 
                        :key="`circle_plot_${i}_${j}`"
                    >
                        <circle 
                            v-if="canShowValue(plot.value)"
                            :cx="plot.x"
                            :cy="plot.y"
                            :r="chartConfig.plot.radius"
                            :fill="chartConfig.plot.useGradient ? `url(#plotGradient_${i}_${uniqueId})` : serie.color"
                            :stroke="chartConfig.chart.backgroundColor"
                            stroke-width="0.5"
                        />
                    </g>
                    <g v-if="Object.hasOwn(serie, 'useProgression') && serie.useProgression === true && !isNaN(calcLinearProgression(serie.plots).trend)">
                        <defs>
                            <marker :id="`plot_arrow_${i}`" :markerWidth="7" :markerHeight="7" 
                            refX="0" :refY="7/2" orient="auto">
                                <polygon 
                                    :points="`0 0, ${7} ${7/2}, 0 ${7}`" 
                                    :fill="serie.color"
                                />
                            </marker>
                        </defs>
                        <line
                            :x1="calcLinearProgression(serie.plots).x1"
                            :x2="calcLinearProgression(serie.plots).x2"
                            :y1="calcLinearProgression(serie.plots).y1"
                            :y2="calcLinearProgression(serie.plots).y2"
                            :stroke-width="1"
                            :stroke="serie.color"
                            :stroke-dasharray="2"
                            :marker-end="`url(#plot_arrow_${i})`"
                        />
                        <text
                            text-anchor="middle"
                            :x="calcLinearProgression(serie.plots).x2"
                            :y="calcLinearProgression(serie.plots).y2 - 6"
                            :font-size="chartConfig.chart.labels.fontSize"
                            :fill="serie.color"
                        >
                            {{ `${(calcLinearProgression(serie.plots).trend * 100).toFixed(2)}%` }}
                        </text>
                    </g>
                </g>

                <!-- LINES -->
                <g v-for="(serie, i) in lineSet" :key="`serie_line_${i}`" :class="`serie_line_${i}`">   
                    <g v-for="(plot, j) in serie.plots" :key="`line_${i}_${j}`">
                        <line 
                            v-if="j < serie.plots.length - 1 && canShowValue(plot.value) && canShowValue(serie.plots[j+1].value)"
                            :x1="plot.x"
                            :x2="serie.plots[j+1].x"
                            :y1="plot.y"
                            :y2="serie.plots[j+1].y"
                            :stroke="serie.color"
                            :stroke-width="chartConfig.line.strokeWidth"
                            :stroke-dasharray="serie.dashed ? chartConfig.line.strokeWidth * 2 : 0"
                            stroke-linejoin="round"
                            stroke-linecap="round"
                        />
                    </g>
                    <g v-for="(plot, j) in serie.plots" 
                        :key="`circle_line_${i}_${j}`">
                        <circle 
                            v-if="canShowValue(plot.value)"
                            :cx="plot.x"
                            :cy="plot.y"
                            :r="chartConfig.line.radius"
                            :fill="chartConfig.line.useGradient ? `url(#lineGradient_${i}_${uniqueId})` : serie.color"
                            :stroke="chartConfig.chart.backgroundColor"
                            stroke-width="0.5"
                        />
                    </g > 
                    <g v-if="Object.hasOwn(serie, 'useProgression') && serie.useProgression === true && !isNaN(calcLinearProgression(serie.plots).trend)">
                        <defs>
                                <marker :id="`line_arrow_${i}`" :markerWidth="7" :markerHeight="7" 
                                refX="0" :refY="7/2" orient="auto">
                                    <polygon 
                                        :points="`0 0, ${7} ${7/2}, 0 ${7}`" 
                                        :fill="serie.color"
                                    />
                                </marker>
                            </defs>
                            <line
                            :x1="calcLinearProgression(serie.plots).x1"
                            :x2="calcLinearProgression(serie.plots).x2"
                            :y1="calcLinearProgression(serie.plots).y1"
                            :y2="calcLinearProgression(serie.plots).y2"
                            :stroke-width="1"
                            :stroke="serie.color"
                            :stroke-dasharray="2"
                            :marker-end="`url(#line_arrow_${i})`"
                        />
                        <text
                            text-anchor="middle"
                            :x="calcLinearProgression(serie.plots).x2"
                            :y="calcLinearProgression(serie.plots).y2 - 6"
                            :font-size="chartConfig.chart.labels.fontSize"
                            :fill="serie.color"
                        >
                            {{ `${(calcLinearProgression(serie.plots).trend * 100).toFixed(2)}%` }}
                        </text>
                    </g>
                </g>

                <!-- X LABELS BAR -->
                <g v-if="chartConfig.bar.labels.show && mutableConfig.dataLabels.show">
                    <g v-for="(serie, i) in barSet" :key="`xLabel_bar_${i}`" :class="`xLabel_bar_${i}`">
                        <g v-for="(plot, j) in serie.plots" :key="`xLabel_bar_${i}_${j}`">
                            <text
                                v-if="!Object.hasOwn(serie, 'dataLabels') || serie.dataLabels === true"
                                :x="plot.x + calcRectWidth() * 1.1"
                                :y="plot.y + chartConfig.bar.labels.offsetY"
                                text-anchor="middle"
                                :font-size="chartConfig.chart.labels.fontSize"
                                :fill="chartConfig.bar.labels.color"
                            >
                                {{ canShowValue(plot.value) ? plot.value.toFixed(chartConfig.bar.labels.rounding) : '' }}
                            </text>
                        </g>
                    </g>
                </g>

                <!-- X LABELS PLOT -->
                <g v-if="chartConfig.plot.labels.show && mutableConfig.dataLabels.show">
                    <g v-for="(serie, i) in plotSet" :key="`xLabel_plot_${i}`" :class="`xLabel_plot_${i}`">
                        <g v-for="(plot, j) in serie.plots" :key="`xLabel_plot_${i}_${j}`">
                            <text
                                v-if="!Object.hasOwn(serie, 'dataLabels') || serie.dataLabels === true"
                                :x="plot.x"
                                :y="plot.y + chartConfig.plot.labels.offsetY"
                                text-anchor="middle"
                                :font-size="chartConfig.chart.labels.fontSize"
                                :fill="chartConfig.plot.labels.color"
                            >
                                {{ canShowValue(plot.value) ? plot.value.toFixed(chartConfig.plot.labels.rounding) : '' }}
                            </text>
                            <foreignObject 
                                v-if="j === 0 && serie.useTag && serie.useTag === 'start'"
                                :x="plot.x"
                                :y="plot.y - 20"
                                :height="24"
                                width="150"
                                style="overflow: visible"
                            >
                                <div :style="`padding: 3px; background:${serie.color}${opacity[80]};color:${adaptColorToBackground(serie.color)};width:fit-content;font-size:${chartConfig.chart.labels.fontSize}px;border-radius: 2px;`">
                                    {{ serie.name }}
                                </div>
                            </foreignObject>
                            <foreignObject 
                                v-if="j === serie.plots.length - 1 && serie.useTag && serie.useTag === 'end'"
                                :x="plot.x - serie.name.length * (chartConfig.chart.labels.fontSize / 2)"
                                :y="plot.y - 20"
                                :height="24"
                                width="150"
                                style="overflow: visible"
                            >
                                <div :style="`padding: 3px; background:${serie.color}${opacity[80]};color:${adaptColorToBackground(serie.color)};width:fit-content;font-size:${chartConfig.chart.labels.fontSize}px;border-radius: 2px;`">
                                    {{ serie.name }}
                                </div>
                            </foreignObject>
                        </g>
                    </g>
                </g>

                <!-- X LABELS LINE -->
                <g v-if="chartConfig.line.labels.show && mutableConfig.dataLabels.show">
                    <g v-for="(serie, i) in lineSet" :key="`xLabel_line_${i}`" :class="`xLabel_line_${i}`">
                        <g v-for="(plot, j) in serie.plots" :key="`xLabel_line_${i}_${j}`">
                            <text
                                v-if="!Object.hasOwn(serie, 'dataLabels') || serie.dataLabels === true"
                                :x="plot.x"
                                :y="plot.y + chartConfig.line.labels.offsetY"
                                text-anchor="middle"
                                :font-size="chartConfig.chart.labels.fontSize"
                                :fill="chartConfig.line.labels.color"
                            >
                                {{ canShowValue(plot.value) ? plot.value.toFixed(chartConfig.line.labels.rounding) : '' }}
                            </text>
                            <foreignObject 
                                v-if="j === 0 && serie.useTag && serie.useTag === 'start'"
                                :x="plot.x"
                                :y="plot.y - 20"
                                :height="24"
                                width="150"
                                style="overflow: visible"
                            >
                                <div :style="`padding: 3px; background:${serie.color}${opacity[80]};color:${adaptColorToBackground(serie.color)};width:fit-content;font-size:${chartConfig.chart.labels.fontSize}px;border-radius: 2px;`">
                                    {{ serie.name }}
                                </div>
                            </foreignObject>
                            <foreignObject 
                                v-if="j === serie.plots.length - 1 && serie.useTag && serie.useTag === 'end'"
                                :x="plot.x - serie.name.length * (chartConfig.chart.labels.fontSize / 2)"
                                :y="plot.y - 20"
                                :height="24"
                                width="150"
                                style="overflow: visible"
                            >
                                <div :style="`padding: 3px; background:${serie.color}${opacity[80]};color:${adaptColorToBackground(serie.color)};width:fit-content;font-size:${chartConfig.chart.labels.fontSize}px;border-radius: 2px;`">
                                    {{ serie.name }}
                                </div>
                            </foreignObject>
                        </g>
                    </g>
                </g>

                <!-- Y LABELS -->
                <g v-if="chartConfig.chart.grid.labels.show">
                    <g v-for="(yLabel, i) in yLabels" :key="`yLabel_${i}`">
                        <line 
                            v-if="yLabel.value >= min && yLabel.value <= max"
                            :x1="drawingArea.left" 
                            :x2="drawingArea.left - 5" 
                            :y1="yLabel.y" 
                            :y2="yLabel.y" 
                            :stroke="chartConfig.chart.grid.stroke" 
                            stroke-width="1" 
                        />
                        <text 
                            v-if="yLabel.value >= min && yLabel.value <= max" 
                            :x="drawingArea.left - 5" 
                            :y="yLabel.y + chartConfig.chart.labels.fontSize / 3" 
                            :font-size="chartConfig.chart.grid.labels.fontSize" 
                            text-anchor="end"
                            :fill="chartConfig.chart.grid.labels.color"
                        >
                            {{ canShowValue(yLabel.value) ? yLabel.value.toFixed(0) : '' }}
                        </text>
                    </g>
                </g>

                <!-- AXIS LABELS -->
                <g>
                    <text v-if="chartConfig.chart.grid.labels.axis.yLabel" :font-size="chartConfig.chart.grid.labels.axis.fontSize" :fill="chartConfig.chart.grid.labels.color" id="yAxisLabel" text-anchor="middle" style="transition: none">
                        {{ chartConfig.chart.grid.labels.axis.yLabel }}
                    </text>
                    <text 
                        v-if="chartConfig.chart.grid.labels.axis.xLabel" 
                        text-anchor="middle"
                        :x="chartConfig.chart.width / 2"
                        :y="drawingArea.bottom + chartConfig.chart.grid.labels.axis.fontSize + chartConfig.chart.grid.labels.xAxisLabels.fontSize * 1.3"
                        :font-size="chartConfig.chart.grid.labels.axis.fontSize"
                        :fill="chartConfig.chart.grid.labels.color"
                    >
                        {{ chartConfig.chart.grid.labels.axis.xLabel }}
                    </text>
                </g>

                <!-- TITLE AS FOREIGNOBJECT -->
                <g v-if="chartConfig.chart.title.show && mutableConfig.titleInside && !isPrinting">
                    <foreignObject
                        x="0"
                        y="0"
                        width="100%"
                        height="40px"
                        style="overflow: visible"
                    >
                        <div class="vue-ui-xy-title" :style="`font-family:${chartConfig.chart.fontFamily}`">
                            <div class="vue-ui-xy-title-main" :style="`font-size:${chartConfig.chart.title.fontSize * 0.6}px; color:${chartConfig.chart.title.color}; font-weight:${chartConfig.chart.title.bold ? 'bold': '400'}`">
                                {{ chartConfig.chart.title.text }}
                            </div>
                            <div class="vue-ui-xy-title-subtitle" v-if="chartConfig.chart.title.subtitle.text" :style="`font-size:${chartConfig.chart.title.subtitle.fontSize * 0.6}px; color:${chartConfig.chart.title.subtitle.color}`">
                                {{ chartConfig.chart.title.subtitle.text }}
                            </div>
                        </div>
                    </foreignObject>
                </g>

                <!-- LEGEND AS FOREIGNOBJECT -->
                <g v-if="chartConfig.chart.legend.show && mutableConfig.legendInside && !isPrinting">
                    <foreignObject
                        x="0"
                        :y="drawingArea.bottom + chartConfig.chart.padding.bottom / 3 + 12"
                        :width="`100%`"
                        height="20px"
                        :style="`overflow:visible; font-size:${chartConfig.chart.legend.fontSize * 0.6}px`"
                    >
                        <div class="vue-ui-xy-legend">
                            <div v-for="(legendItem, i) in absoluteDataset" :key="`div_legend_item_${i}`" @click="segregate(legendItem)" :class="{'vue-ui-xy-legend-item': true, 'vue-ui-xy-legend-item-segregated' : segregatedSeries.includes(legendItem.id)}">
                                <span :style="`color:${legendItem.color}`" v-if="['plot'].includes(legendItem.type)">●</span>
                                <span :style="`color:${legendItem.color}`" v-if="['line'].includes(legendItem.type)">▬</span>
                                <span :style="`color:${legendItem.color}`" v-if="['bar'].includes(legendItem.type)">◼</span>
                                <span :style="`color:${chartConfig.chart.legend.color}`">{{legendItem.name}}</span>
                            </div>
                        </div>
                    </foreignObject>
                </g>

                
                <!-- TIME LABELS -->
                <g v-if="chartConfig.chart.grid.labels.xAxisLabels.show">
                    <g v-for="(label, i) in timeLabels" :key="`time_label_${i}`">
                        <text
                            v-if="(label && !chartConfig.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast) || (label && chartConfig.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && (i === 0 || i === timeLabels.length -1))"
                            text-anchor="middle"
                            :y="drawingArea.bottom + chartConfig.chart.grid.labels.xAxisLabels.fontSize * 1.3"
                            :x="drawingArea.left + (drawingArea.width / maxSeries) * i + (drawingArea.width / maxSeries / 2)"
                            :font-size="chartConfig.chart.grid.labels.xAxisLabels.fontSize"
                            :fill="chartConfig.chart.grid.labels.xAxisLabels.color"
                        >
                            {{ label || "" }}
                        </text>
                    </g>
                </g>

                <!-- TOOLTIP TRAPS -->
                <g v-if="chartConfig.chart.tooltip.show">
                    <g v-for="(trap, i) in maxSeries" :key="`tooltip_trap_${i}`">
                        <rect
                            :x="drawingArea.left + (drawingArea.width / maxSeries) * i"
                            :y="drawingArea.top"
                            :height="drawingArea.height"
                            :width="drawingArea.width / maxSeries"
                            :fill="selectedSerieIndex === i || selectedRowIndex === i ? `${chartConfig.chart.highlighter.color}${opacity[chartConfig.chart.highlighter.opacity]}` : 'transparent'"
                            @mouseenter="toggleTooltip(true, i)"
                            @mouseleave="toggleTooltip(false)"
                            @click="selectX(i)"
                        />
                    </g>
                </g>
            </g>
        </svg>
        
        <!-- SLICER -->
        <div v-if="chartConfig.chart.zoom.show" class="vue-ui-xy-range-slider-wrapper" data-html2canvas-ignore>
            <div class="vue-ui-xy-range-slider-label-left">
                {{ chartConfig.chart.grid.labels.xAxisLabels.values[slicer.start] }}
            </div>
            <div class="vue-ui-xy-range-slider">
                <div class="vue-ui-xy-slider-track" :id="`vue-ui-slider-track_${uniqueId}`"></div>
                    <input :id="`start_${uniqueId}`" type="range" :style="`border:none !important;accent-color:${chartConfig.chart.zoom.color}`" :min="0" :max="maxX" v-model="slicer.start">
                    <input :id="`end_${uniqueId}`" type="range" :style="`border:none !important;accent-color:${chartConfig.chart.zoom.color}`" :min="0" :max="maxX" v-model="slicer.end">

            </div>
            <div class="vue-ui-xy-range-slider-label-right">
                {{ chartConfig.chart.grid.labels.xAxisLabels.values[slicer.end-1] }}
            </div>
        </div>

        <!-- LEGEND AS OUTSIDE DIV -->
        <div v-if="chartConfig.chart.legend.show && (!mutableConfig.legendInside || isPrinting)" class="vue-ui-xy-legend" :style="`font-size:${chartConfig.chart.legend.fontSize}px`">
            <div v-for="(legendItem, i) in absoluteDataset" :key="`div_legend_item_${i}`" @click="segregate(legendItem)" :class="{'vue-ui-xy-legend-item': true, 'vue-ui-xy-legend-item-segregated' : segregatedSeries.includes(legendItem.id)}">
                <span :style="`color:${legendItem.color}`" v-html="icons[legendItem.type]"/>
                <span :style="`color:${chartConfig.chart.legend.color}`">{{legendItem.name}}</span>
            </div>
        </div>

        <!-- TOOLTIP -->
        <div 
            class="vue-ui-xy-tooltip"
            ref="tooltip"
            v-if="chartConfig.chart.tooltip.show && isTooltip"
            :style="`top:${tooltipPosition.top}px;left:${tooltipPosition.left}px; background-color:${chartConfig.chart.tooltip.backgroundColor};color:${chartConfig.chart.tooltip.color}`"
            v-html="tooltipContent"
        />

        <!-- DATA TABLE -->
        <div :class="{'vue-ui-xy-table-wrapper': true, 'vue-ui-xy-table-wrapper-printing': isPrinting}" v-if="mutableConfig.showTable" @click="closeDetails">
            <table class="vue-ui-xy-table">
                <thead>
                    <tr>
                        <th :style="`background:${chartConfig.table.th.backgroundColor};color:${chartConfig.table.th.color}`"></th>
                        <th v-for="(th, i) in table.head" :key="`th_${i}`" :style="`background:${chartConfig.table.th.backgroundColor};color:${chartConfig.table.th.color}`">
                            <div style="max-width: 200px; margin:0 auto;text-align:center">   
                                <span :style="`color:${th.color}; margin-right:3px`">{{ icons[th.type] }}</span>{{ th.label }}
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th align="right" :style="`background:${chartConfig.table.th.backgroundColor};color:${chartConfig.table.th.color}`">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>
                        </th>
                        <th align="right" v-for="(_, i) in table.head" :key="`th_sum_${i}`" :style="`background:${chartConfig.table.th.backgroundColor};color:${chartConfig.table.th.color};padding-right:6px`">
                            {{ dataset[i].series.slice(slicer.start,slicer.end).reduce((a,b) => a + b, 0).toFixed(chartConfig.table.rounding) }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(tr, i) in table.body" :key="`tr_${i}`" :class="{'vue-ui-xy-table-tr-selected': selectedSerieIndex === i || selectedRowIndex === i}" @mouseover="selectedRowIndex = i" @mouseleave="selectedRowIndex = null">
                        <td v-for="(td, j) in tr" :key="`td_${i}_${j}`" :style="`background:${chartConfig.table.td.backgroundColor};color:${chartConfig.table.td.color};padding-right:6px;`">
                            {{ td }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import pdf from '../pdf';
import { 
    treeShake, 
    isSafeValue, 
    checkNaN, 
    palette, 
    shiftHue, 
    opacity, 
    convertColorToHex, 
    convertConfigColors, 
    makeXls,
    adaptColorToBackground,
    calcLinearProgression
} from '../lib';
import mainConfig from "../default_configs.json";

// TOD0:
// . add emit on click (emit all data at given index, maybe choose which to emit if multiseries; so it could dynamically feed another chart)

export default {
    name: "vue-ui-xy",
    props: {
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
    },
    data(){
        const uniqueId = `vue-data-ui-xy_${Math.random()}_${Math.random()}`;
        const maxX = Math.max(...this.dataset.map(datapoint => datapoint.series.length));
        const slicer = {
            start: 0,
            end: maxX,
        }
        return {
            opacity,
            useSafeValues: true,
            palette,
            defaultConfig: mainConfig.vue_ui_xy,
            clientPosition: {
                x:0,
                y:0,
            },
            icons: {
                line: "▬",
                bar: "◼",
                plot: "●"
            },
            isPrinting: false,
            isTooltip: false,
            mutableConfig: {
                dataLabels: {
                    show: true,
                },
                titleInside: true,
                legendInside: true,
                showTable: false,
            },
            selectedSerieIndex: null,
            selectedRowIndex: null,
            segregatedSeries: [],
            uniqueId,
            slicer,
            maxX
        }
    },
    computed: {
        chartConfig() {
            if(!Object.keys(this.config || {}).length) {
                return this.defaultConfig
            }
            
            const reconcilied = this.treeShake({
                defaultConfig: this.defaultConfig,
                userConfig: this.config
            });

            return this.convertConfigColors(reconcilied);
        },
        relativeZero() {
            if(this.min >= 0) return 0;
            return Math.abs(this.min);
        },
        absoluteMax() {
            return this.max + this.relativeZero;
        },
        safeDataset(){
            if(!this.useSafeValues) return this.dataset;
            return this.dataset.map((datapoint, i) => {
                return {
                    ...datapoint,
                    series: datapoint.series.map(d => {
                        return this.isSafeValue(d) ? d : null
                    }).slice(this.slicer.start, this.slicer.end),
                    id: `uniqueId_${i}`
                }
            });
        },
        relativeDataset() {
            return this.safeDataset.map((datapoint, i) => {
                return {
                    ...datapoint,
                    series: datapoint.series.map(plot => plot + this.relativeZero),
                    absoluteValues: datapoint.series,
                    color: this.convertColorToHex(datapoint.color ? datapoint.color : this.palette[i]),
                }
            }).filter(s => !this.segregatedSeries.includes(s.id));
        },
        absoluteDataset() {
            return this.safeDataset.map((datapoint, i) => {
                return {
                    ...datapoint,
                    series: datapoint.series.map(plot => plot + this.relativeZero),
                    absoluteValues: datapoint.series,
                    color: this.convertColorToHex(datapoint.color ? datapoint.color : this.palette[i]),
                }
            })
        },
        barSet() {
            return this.absoluteDataset.filter(s => s.type === 'bar').filter(s => !this.segregatedSeries.includes(s.id)).map((datapoint, i) => {
                return {
                    ...datapoint,
                    plots: datapoint.series.map((plot, j) => {
                        return {
                            x: (this.drawingArea.left - this.slot.bar/2 + this.slot.bar * i) + (this.slot.bar * j * this.absoluteDataset.filter(ds => ds.type === 'bar').filter(s => !this.segregatedSeries.includes(s.id)).length),
                            y: this.drawingArea.bottom - (this.drawingArea.height * this.ratioToMax(plot)),
                            value: datapoint.absoluteValues[j],
                        }
                    })
                }
            })
        },
        lineSet() {
            return this.absoluteDataset.filter(s => s.type === 'line').filter(s => !this.segregatedSeries.includes(s.id)).map((datapoint) => {
                return {
                    ...datapoint,
                    plots: datapoint.series.map((plot, j) => {
                        return {
                            x: (this.drawingArea.left + (this.slot.line/2)) + (this.slot.line * j),
                            y: this.drawingArea.bottom - (this.drawingArea.height * this.ratioToMax(plot)),
                            value: datapoint.absoluteValues[j],
                        }
                    })
                }
            })
        },
        plotSet() {
            return this.absoluteDataset.filter(s => s.type === 'plot').filter(s => !this.segregatedSeries.includes(s.id)).map((datapoint) => {
                return {
                    ...datapoint,
                    plots: datapoint.series.map((plot, j) => {
                        return {
                            x: (this.drawingArea.left + (this.slot.plot / 2)) + (this.slot.plot * j),
                            y: this.drawingArea.bottom - (this.drawingArea.height * this.ratioToMax(plot)),
                            value: datapoint.absoluteValues[j],
                        }
                    })
                }
            })
        },
        drawingArea() {
            return {
                top: this.chartConfig.chart.padding.top,
                right: this.chartConfig.chart.width - this.chartConfig.chart.padding.right,
                bottom: this.chartConfig.chart.height - this.chartConfig.chart.padding.bottom,
                left: this.chartConfig.chart.padding.left,
                height: this.chartConfig.chart.height - (this.chartConfig.chart.padding.top + this.chartConfig.chart.padding.bottom),
                width: this.chartConfig.chart.width - (this.chartConfig.chart.padding.right + this.chartConfig.chart.padding.left)
            }
        },
        max(){
            return Math.max(...this.safeDataset.filter(s => !this.segregatedSeries.includes(s.id)).map(datapoint => Math.max(...datapoint.series)));
        },
        min() {
            const min = Math.min(...this.safeDataset.filter(s => !this.segregatedSeries.includes(s.id)).map(datapoint => Math.min(...datapoint.series)));
            if(min > 0) return 0;
            return min;
        },
        maxSeries(){
            return this.slicer.end - this.slicer.start;
        },
        timeLabels() {
            return this.chartConfig.chart.grid.labels.xAxisLabels.values.slice(this.slicer.start, this.slicer.end);
        },
        slot() {
            return {
                bar: this.drawingArea.width / this.maxSeries / this.safeDataset.filter(serie => serie.type === 'bar').filter(s => !this.segregatedSeries.includes(s.id)).length,
                plot: this.drawingArea.width / this.maxSeries,
                line: this.drawingArea.width / this.maxSeries,
            }
        },
        maxSlot(){
            return Math.max(...Object.values(this.slot).filter(e => e !== Infinity))
        },
        table() {
            if(this.safeDataset.length === 0) return { head: [], body: []};

            const head = this.relativeDataset.map(s => {
                return {
                    label: s.name,
                    color: s.color,
                    type: s.type
                }
            })

            const body = [];

            this.timeLabels.forEach((t, i) => {
                const row = [t];
                this.relativeDataset.forEach(s => {
                    row.push(this.canShowValue(s.absoluteValues[i]) ? Number(s.absoluteValues[i].toFixed(this.chartConfig.table.rounding)) : '')
                });
                body.push(row);
            })

            return { head, body};
        },
        tooltipContent() {
            const selectedSeries = this.relativeDataset.map(datapoint => {
                return {
                    name: datapoint.name,
                    color: datapoint.color,
                    type: datapoint.type,
                    value: datapoint.absoluteValues.find((_s,i) => i === this.selectedSerieIndex)
                }
            });

            let html = "";

            let sum = selectedSeries.map(s => s.value).filter(s => this.isSafeValue(s) && s !== null).reduce((a,b) => Math.abs(a) + Math.abs(b), 0);

            const time = this.timeLabels[this.selectedSerieIndex];
            if(time) {
                html += `<div style="padding-bottom: 6px; margin-bottom: 4px; border-bottom: 1px solid #e1e5e8; width:100%">${time}</div>`;
            }
            selectedSeries.forEach(s => {
                if(this.isSafeValue(s.value) && s.value !== null) {
                    html += `<div><span style="color:${s.color}; margin-right: 3px">${this.icons[s.type]}</span>${s.name} : <b>${this.chartConfig.chart.tooltip.showValue ? s.value.toFixed(this.chartConfig.chart.tooltip.roundingValue) : ''}</b> ${this.chartConfig.chart.tooltip.showPercentage ? `(${(this.checkNaN(Math.abs(s.value) / sum * 100)).toFixed(this.chartConfig.chart.tooltip.roundingPercentage)}%)` : ''}</div>`;
                }
            });
            return `<div style="border-radius:4px;padding:12px;font-variant-numeric: tabular-nums; background:${this.chartConfig.chart.tooltip.backgroundColor};color:${this.chartConfig.chart.tooltip.color}">${html}</div>`;
        },
        tooltipPosition() {
            const tooltip = this.$refs.tooltip;
            const chart = this.$refs.chart;
            let offsetX = 0;
            let offsetY = 48;
            if(tooltip && chart) {
                const { width, height } = tooltip.getBoundingClientRect();
                const chartBox = chart.getBoundingClientRect();

                if(this.clientPosition.x + width / 2 > chartBox.right) {
                    offsetX = -width;
                } else if(this.clientPosition.x - width / 2 < chartBox.left) {
                    offsetX = 0;
                } else {
                    offsetX = -width / 2;
                }

                if(this.clientPosition.y + height > chartBox.bottom) {
                    offsetY = -height - 48
                }
            }
            return {
                top: this.clientPosition.y + offsetY,
                left: this.clientPosition.x + offsetX,
            }
        },
        viewBox() {
            return `0 0 ${this.chartConfig.chart.width} ${this.chartConfig.chart.height}`;
        },
        yLabels() {
            const positiveStep = this.closestDecimal(this.max / 5);
            const positiveSteps = [];
            for(let i = 5; i > 0; i -= 1) {
                const value = positiveStep * i ;
                positiveSteps.push({
                    y: this.zero - (this.drawingArea.height * this.ratioToMax(positiveStep * i)),
                    value,
                });
            }
            const negativeStep = this.closestDecimal(this.min / 5);
            const negativeSteps = [];
            for(let i = 5; i >= 0; i -= 1) {
                const value = Math.abs(negativeStep) * i ;
                negativeSteps.push({
                    y: this.zero + (this.drawingArea.height * this.ratioToMax(Math.abs(negativeStep) * i)),
                    value: -value
                });
            }
            return [...positiveSteps, ...negativeSteps];
        },
        zero(){
            return this.drawingArea.bottom - (this.drawingArea.height * this.ratioToMax(this.relativeZero));
        }
    },
    mounted() {
        const that = this;
        const yLabel = document.getElementById("yAxisLabel");
        if(yLabel) {
            const bboxY = yLabel.getBBox();
            const xPosition = bboxY.height / 2 + this.chartConfig.chart.padding.left / 5;
            const yPosition =  this.chartConfig.chart.height / 2;
            yLabel.setAttributeNS(null, "transform", `rotate(-90, ${xPosition}, ${yPosition})`);
            yLabel.setAttributeNS(null, "x", xPosition);
            yLabel.setAttributeNS(null, "y", yPosition);
            yLabel.setAttributeNS(null, "font-size", this.chartConfig.chart.grid.labels.axis.fontSize);
        }

        if(this.chartConfig.showWarnings) {
            this.dataset.forEach((datapoint) => {
                datapoint.series.forEach((s, j) => {
                    if(!this.isSafeValue(s)) {
                        console.warn(`SmartXY has detected an unsafe value in your dataset:\n-----> The serie '${datapoint.name}' contains the value '${s}' at index ${j}.\n'${s}' was converted to null to allow the chart to display.`)
                    }
                });
            });
        }

        document.addEventListener("mousemove", (e) => {
            this.clientPosition = {
                x: e.clientX,
                y: e.clientY
            }
        });

        this.mutableConfig = {
            dataLabels: {
                show: true,
            },
            titleInside: !this.chartConfig.chart.title.useDiv,
            legendInside: !this.chartConfig.chart.legend.useDiv,
            showTable: this.chartConfig.showTable === true
        }

        const sliderOne = document.getElementById(`start_${this.uniqueId}`);
        const sliderTwo = document.getElementById(`end_${this.uniqueId}`);
        let minGap = 0;
        const sliderTrack = document.getElementById(`vue-ui-slider-track_${this.uniqueId}`);

        sliderOne.addEventListener("input", slideOne);
        sliderTwo.addEventListener("input", slideTwo);

        function slideOne(){
            if(parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
                sliderOne.value = parseInt(sliderTwo.value) - minGap;
            }
            fillColor();
        }
        function slideTwo(){
            if(parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
                sliderTwo.value = parseInt(sliderOne.value) + minGap;
            }
            fillColor();
        }
        const dataset = this.dataset;
        function fillColor(){
            let percent1 = (sliderOne.value / Math.max(...dataset.map(datapoint => datapoint.series.length))) * 100;
            let percent2 = (sliderTwo.value / Math.max(...dataset.map(datapoint => datapoint.series.length))) * 100;
            sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , #858585 ${percent1}% , #858585 ${percent2}%, #dadae5 ${percent2}%)`;
        }

        slideOne();
        slideTwo();

    },
    methods: {
        // lib
        checkNaN,
        isSafeValue,
        treeShake,
        shiftHue,
        pdf,
        convertColorToHex,
        convertConfigColors,
        makeXls,
        adaptColorToBackground,
        calcLinearProgression,

        calcRectHeight(plot) {
            if(plot.value >= 0) {
                return this.zero - plot.y;
            } else {
                return plot.y - this.zero;
            }
        },
        calcRectWidth() {
            return this.slot.bar * 0.9;
        },
        calcRectX(plot) {
            return plot.x + (this.slot.bar * 0.05) + (this.slot.bar / 2);
        },
        calcRectY(plot) {
            if(plot.value >= 0) return plot.y;
            return this.zero;
        },
        canShowValue(value) {
            return ![null, undefined, NaN].includes(value);
        },
        closeDetails(){
            const details = this.$refs.details;
            if(details) {
                details.removeAttribute("open")
            }
        },
        closestDecimal(number) {
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
        },
        ratioToMax(value) {
            return value / this.absoluteMax;
        },
        selectX(index) {
            this.$emit('selectX', 
                {
                    dataset: this.relativeDataset.map(s => {
                        return {
                            name: s.name,
                            value: [null, undefined, NaN].includes(s.absoluteValues[index]) ? null : s.absoluteValues[index],
                            color: s.color,
                            type: s.type
                        }
                    }),
                    index,
                    indexLabel: this.chartConfig.chart.grid.labels.xAxisLabels.values[index]
                }
            );
        },
        getData(){
            return this.absoluteDataset.map(s => {
                return {
                    values: s.absoluteValues,
                    color: s.color,
                    name: s.name,
                    type: s.type
                }
            });
        },  
        segregate(legendItem){
            if(this.segregatedSeries.includes(legendItem.id)) {
                this.segregatedSeries = this.segregatedSeries.filter(id => id !== legendItem.id);
            }else {
                if(this.segregatedSeries.length + 1 === this.safeDataset.length) return;
                this.segregatedSeries.push(legendItem.id);
            }
            this.$emit('selectLegend', this.relativeDataset.map(s => {
                return {
                    name: s.name,
                    values: s.absoluteValues,
                    color: s.color,
                    type: s.type
                }
            }));
        },
        toggleTooltip(show, selectedIndex = null) {
            this.isTooltip = show;
            if(show) {
                this.selectedSerieIndex = selectedIndex;
            }else{
                this.selectedSerieIndex = null;
            }
        },
        generatePdf(){
            this.isPrinting = true;
            this.pdf({
                domElement: document.getElementById(`vue-ui-xy_${this.uniqueId}`),
                fileName: this.chartConfig.chart.title.text || 'vue-ui-xy'
            }).finally(() => {
                this.isPrinting = false;
            });
        },
        generateXls() {
            const title = [[this.chartConfig.chart.title.text], [this.chartConfig.chart.title.subtitle.text], [""]];
            const head = ["",...this.table.head.map(h => h.label)]
            const body = this.table.body
            const table = title.concat([head]).concat(body);
            this.makeXls(table, this.chartConfig.chart.title.text || 'vue-ui-xy');
        },
    }
}
</script>

<style scoped>
.vue-ui-xy *{
    transition: unset;
}
.vue-ui-xy {
    position: relative;
    padding-top: 36px;
}
.vue-ui-xy-user-options {
    border-radius: 4px;
    padding: 6px 12px;
    position: absolute;
    right:0;
    top:0;
    user-select:none;
    max-width: 300px;
}
.vue-ui-xy-user-options[open] {
    border: 1px solid #e1e5e8;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
}
.vue-ui-xy-user-options summary {
    text-align: right;
    direction: rtl;
}
.vue-ui-xy-user-options-items {
    width: 100%;
    display: flex;
    flex-direction: column;
    margin-top: 6px;
}
.vue-ui-xy-user-options-item {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items:center;
}
.vue-ui-xy-legend {
    align-items:center;
    column-gap: 24px;
    display: flex;
    flex-wrap: wrap;
    justify-content:center;
    user-select: none;
    width: 100%;
}
.vue-ui-xy-legend-item {
    align-items:center;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 5px;
    cursor: pointer;
}
.vue-ui-xy-legend-item-segregated {
    opacity: 0.5;
}
.vue-ui-xy-title {
    align-items:center;
    display: flex;
    flex-direction: column;
    justify-content:center;
    width: 100%;
}
.vue-ui-xy svg rect {
    transition: all 0.11s ease-in-out;
}
.vue-ui-xy-tooltip {
    border: 1px solid #e1e5e8;
    border-radius: 4px;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
    max-width: 300px;
    position: fixed;
    z-index:1;
}
.vue-ui-xy-table-wrapper {
    width: 100%;
    max-height: 300px;
    overflow: auto;
    margin-top: 24px;
    position: relative;
}
.vue-ui-xy-table-wrapper-printing {
    max-height: unset;
    height: fit-content;
}
.vue-ui-xy-table {
    width: 100%;
    border-collapse:collapse;
}
.vue-ui-xy-table td {
    border: 1px solid #e1e5e8;
    text-align:right;
    padding-right: 6px;
    font-variant-numeric: tabular-nums;
}
.vue-ui-xy-table thead {
    border: 1px solid #e1e5e8;
    background: #fafafa;
    position: sticky;
    top:0;
    font-weight: 400;
    outline: 1px solid #e1e5e8;
    user-select: none;
}
.vue-ui-xy-table-tr-selected {
    background: #e1e5e8;
}
.vue-ui-xy-button {
    margin: 6px 0;
    border-radius: 3px;
    height: 30px;
    border: 1px solid #b9bfc4;
    background: inherit;
    display: flex;
    align-items:center;
    justify-content: center;
}
.vue-ui-xy-button:hover {
    background: rgba(0,0,0,0.05);
}
.vue-ui-xy-print-icon {
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

.vue-ui-xy-range-slider-wrapper {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 6px;
    align-items:center;
}
.vue-ui-xy-range-slider {
    position: relative;
    width: 100%;
    height: 12px;
}
.vue-ui-xy-range-slider-label-right,
.vue-ui-xy-range-slider-label-left {
    width: 100px;
}

.vue-ui-xy-range-slider-label-right {
    text-align: left;
}

.vue-ui-xy-range-slider-label-left {
    text-align: right;
}

input[type="range"]{
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 100%;
    outline: none;
    position: absolute;
    margin: auto;
    top: 0;
    bottom: 0;
    background-color: transparent;
    pointer-events: none;
}

.vue-ui-xy-slider-track {
    width: 100%;
    height: 5px;
    position: absolute;
    margin: auto;
    top: 0;
    bottom: 0;
    border-radius: 5px;
}
input[type="range"]::-webkit-slider-runnable-track{
    -webkit-appearance: none;
    height: 5px;
}
input[type="range"]::-moz-range-track{
    -moz-appearance: none;
    height: 5px;
}
input[type="range"]::-ms-track{
    appearance: none;
    height: 5px;
}
input[type="range"]::-webkit-slider-thumb{
    -webkit-appearance: none;
    height: 1.3em;
    width: 1.3em;
    background-color: #858585;
    cursor: pointer;
    margin-top: -6px;
    pointer-events: auto;
    border-radius: 50%;
}
input[type="range"]::-moz-range-thumb{
    -webkit-appearance: none;
    appearance: none;
    height: 1.3em;
    width: 1.3em;
    cursor: pointer;
    border-radius: 50%;
    background-color: #858585;
    pointer-events: auto;
}
input[type="range"]::-ms-thumb{
    appearance: none;
    height: 1.3em;
    width: 1.3em;
    cursor: pointer;
    border-radius: 50%;
    background-color: #858585;
    pointer-events: auto;
}
input[type="range"]:active::-webkit-slider-thumb{
    background-color: #CCCCCC;
    border: 3px solid #858585;
}
</style>