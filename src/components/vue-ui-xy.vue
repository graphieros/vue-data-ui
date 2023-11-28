
<template>
    <div :id="`vue-ui-xy_${uniqueId}`" :class="`vue-ui-xy ${chartConfig.useCssAnimation ? '' : 'vue-ui-dna'}`" ref="chart" :style="`background:${chartConfig.chart.backgroundColor}; color:${chartConfig.chart.color};width:100%;${chartConfig.chart.userOptions.show ? 'padding-top:36px' : ''};font-family:${chartConfig.chart.fontFamily}`">
        <!-- TITLE AS OUTSIDE DIV -->
        <div class="vue-ui-xy-title" v-if="chartConfig.chart.title.show && (!mutableConfig.titleInside || isPrinting)" :style="`font-family:${chartConfig.chart.fontFamily}`">
            <Title
                :config="{
                    title: {
                        cy: 'xy-div-title',
                        text: chartConfig.chart.title.text,
                        color: chartConfig.chart.title.color,
                        fontSize: chartConfig.chart.title.fontSize,
                        bold: chartConfig.chart.title.bold
                    },
                    subtitle: {
                        cy: 'xy-div-subtitle',
                        text: chartConfig.chart.title.subtitle.text,
                        color: chartConfig.chart.title.subtitle.color,
                        fontSize: chartConfig.chart.title.subtitle.fontSize,
                        bold: chartConfig.chart.title.subtitle.bold
                    },
                }"
            />
        </div>

        <details class="vue-ui-xy-user-options" :style="`background:${chartConfig.chart.backgroundColor};color:${chartConfig.chart.color}`" data-html2canvas-ignore v-if="chartConfig.chart.userOptions.show" ref="details">
            <summary data-cy="xy-summary" :style="`background:${chartConfig.chart.backgroundColor};color:${chartConfig.chart.color}`">{{ chartConfig.chart.userOptions.title }}</summary>
            <div class="vue-ui-xy-user-options-items" :style="`background:${chartConfig.chart.backgroundColor};color:${chartConfig.chart.color}`">
                <div class="vue-ui-xy-user-option-item">
                    <input type="checkbox" :id="`vue-ui-xy-option-datalabels_${uniqueId}`" :name="`vue-ui-xy-option-datalabels_${uniqueId}`"
                    v-model="mutableConfig.dataLabels.show">
                    <label :for="`vue-ui-xy-option-datalabels_${uniqueId}`">{{ chartConfig.chart.userOptions.labels.dataLabels }}</label>
                </div>
                <div class="vue-ui-xy-user-option-item" v-if="!chartConfig.useCanvas">
                    <input type="checkbox" :id="`vue-ui-xy-option-title_${uniqueId}`" :name="`vue-ui-xy-option-title_${uniqueId}`"
                    v-model="mutableConfig.titleInside">
                    <label :for="`vue-ui-xy-option-title_${uniqueId}`">{{ chartConfig.chart.userOptions.labels.titleInside }}</label>
                </div>
                <div class="vue-ui-xy-user-option-item" v-if="!chartConfig.useCanvas">
                    <input type="checkbox" :id="`vue-ui-xy-option-legend_${uniqueId}`" :name="`vue-ui-xy-option-legend_${uniqueId}`"
                    v-model="mutableConfig.legendInside">
                    <label :for="`vue-ui-xy-option-legend_${uniqueId}`">{{ chartConfig.chart.userOptions.labels.legendInside }}</label>
                </div>
                <div class="vue-ui-xy-user-option-item">
                    <input type="checkbox" :id="`vue-ui-xy-option-table_${uniqueId}`" :name="`vue-ui-xy-option-table_${uniqueId}`"
                    v-model="mutableConfig.showTable">
                    <label :for="`vue-ui-xy-option-table_${uniqueId}`">{{ chartConfig.chart.userOptions.labels.showTable }}</label>
                </div>
                <button data-cy="xy-pdf" class="vue-ui-xy-button" @click="generatePdf" :disabled="isPrinting" :style="`margin-top: 12px; background:${chartConfig.chart.backgroundColor};color:${chartConfig.chart.color}`">
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
                <button data-cy="xy-xls" class="vue-ui-xy-button" @click="generateXls" :style="`background:${chartConfig.chart.backgroundColor};color:${chartConfig.chart.color}`">
                    XLSX
                </button>
            </div>
        </details>

        <canvas ref="vueUiXyCanvas" v-if="chartConfig.useCanvas" :height="chartConfig.chart.height" :width="chartConfig.chart.width" @mouseover="isInsideCanvas = true" @mouseleave="resetCanvas">
        </canvas>

        <svg data-cy="xy-svg" v-else width="100%" :viewBox="viewBox" class="vue-ui-xy-svg" :style="`background:${chartConfig.chart.backgroundColor}; color:${chartConfig.chart.color}; font-family:${chartConfig.chart.fontFamily}`" @click="closeDetails">
            <g v-if="maxSeries > 0"> 
                <!-- GRID -->
                <g class="vue-ui-xy-grid">
                    <line
                        data-cy="xy-grid-line-y"
                        :stroke="chartConfig.chart.grid.stroke" 
                        stroke-width="1" 
                        :x1="drawingArea.left" 
                        :x2="drawingArea.left" 
                        :y1="drawingArea.top" 
                        :y2="drawingArea.bottom" 
                        stroke-linecap="round"
                    />
                    <line
                        data-cy="xy-grid-line-x"
                        :stroke="chartConfig.chart.grid.stroke" 
                        stroke-width="1" 
                        :x1="drawingArea.left" 
                        :x2="drawingArea.right" 
                        :y1="zero" 
                        :y2="zero" 
                        stroke-linecap="round"
                    />
                    <g v-if="chartConfig.chart.grid.showVerticalLines" data-cy="xy-grid-vertical-lines">
                        <line
                            :data-cy="`xy-grid-vertical-line-${i}`"
                            v-for="(_, i) in maxSeries + 1" 
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
                    <defs :data-cy="`xy-def-bar-${i}`">
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
                    <defs :data-cy="`xy-def-plot-${i}`">
                        <radialGradient :id="`plotGradient_${i}_${uniqueId}`" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" :stop-color="`${shiftHue(serie.color, 0.05)}`"/>
                            <stop offset="100%" :stop-color="serie.color" />
                        </radialGradient>
                    </defs>
                </template>

                <!-- DEFS LINES -->
                <template v-for="(serie, i) in lineSet" :key="`def_line_${i}`">
                    <defs :data-cy="`xy-def-line-${i}`">
                        <radialGradient :id="`lineGradient_${i}_${uniqueId}`" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" :stop-color="`${shiftHue(serie.color, 0.05)}`"/>
                            <stop offset="100%" :stop-color="serie.color" />
                        </radialGradient>
                        <linearGradient :id="`areaGradient_${i}_${uniqueId}`" x1="0%" x2="100%" y1="0%" y2="0%">
                            <stop offset="0%" :stop-color="`${shiftHue(serie.color, 0.03)}${opacity[chartConfig.line.area.opacity]}`"/>
                            <stop offset="100%" :stop-color="`${serie.color}${opacity[chartConfig.line.area.opacity]}`"/>
                        </linearGradient>
                    </defs>
                </template>

                <!-- BARS -->
                <g v-for="(serie, i) in barSet" :key="`serie_bar_${i}`" :class="`serie_bar_${i}`">
                    <g 
                        v-for="(plot, j) in serie.plots" 
                        :key="`bar_plot_${i}_${j}`">
                        <rect
                            :data-cy="`xy-bar-${i}-${j}`"
                            v-if="canShowValue(plot.value)"
                            :x="calcRectX(plot)"
                            :y="calcRectY(plot)"
                            :height="calcRectHeight(plot)"
                            :width="calcRectWidth()"
                            :rx="chartConfig.bar.borderRadius"
                            :fill="chartConfig.bar.useGradient ? plot.value >= 0 ? `url(#rectGradient_pos_${i}_${uniqueId})`: `url(#rectGradient_neg_${i}_${uniqueId})` : serie.color"
                        />
                    </g>
                    <g :data-cy="`xy-bar-progression-${i}`" v-if="Object.hasOwn(serie, 'useProgression') && serie.useProgression === true && !isNaN(calcLinearProgression(serie.plots).trend)">
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
                            :data-cy="`xy-bar-progression-label-${i}`"
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
                            :data-cy="`xy-plot-${i}-${j}`"
                            v-if="canShowValue(plot.value)"
                            :cx="plot.x"
                            :cy="plot.y"
                            :r="chartConfig.plot.radius"
                            :fill="chartConfig.plot.useGradient ? `url(#plotGradient_${i}_${uniqueId})` : serie.color"
                            :stroke="chartConfig.chart.backgroundColor"
                            stroke-width="0.5"
                        />
                    </g>
                    <g :data-cy="`xy-plot-progression-${i}`" v-if="Object.hasOwn(serie, 'useProgression') && serie.useProgression === true && !isNaN(calcLinearProgression(serie.plots).trend)">
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
                            :data-cy="`xy-plot-progression-label-${i}`"
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
                    <g :data-cy="`xy-line-area-${i}`" v-if="serie.useArea">
                        <path v-if="serie.smooth" :d="`M ${serie.plots[0].x},${drawingArea.bottom} ${serie.curve} L ${serie.plots.at(-1).x},${drawingArea.bottom} Z`" :fill="chartConfig.line.area.useGradient ? `url(#areaGradient_${i}_${uniqueId})` : `${serie.color}${opacity[chartConfig.line.area.opacity]}`"/>
                        <path v-else :d="`M${serie.area}Z`" :fill="chartConfig.line.area.useGradient ? `url(#areaGradient_${i}_${uniqueId})` : `${serie.color}${opacity[chartConfig.line.area.opacity]}`"/>
                    </g>
                    <path :data-cy="`xy-line-area-path-${i}`" v-if="serie.smooth" :d="`M${serie.curve}`" :stroke="serie.color" :stroke-width="chartConfig.line.strokeWidth" :stroke-dasharray="serie.dashed ? chartConfig.line.strokeWidth * 2 : 0" fill="none" />
                    <g v-else>
                        <g v-for="(plot, j) in serie.plots" :key="`line_${i}_${j}`">
                            <line
                                :data-cy="`xy-line-segment-${i}-${j}`"
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
                    </g>
                    <g v-for="(plot, j) in serie.plots" 
                        :key="`circle_line_${i}_${j}`">
                        <circle 
                            :data-cy="`xy-line-plot-${i}-${j}`"
                            v-if="canShowValue(plot.value)"
                            :cx="plot.x"
                            :cy="plot.y"
                            :r="chartConfig.line.radius"
                            :fill="chartConfig.line.useGradient ? `url(#lineGradient_${i}_${uniqueId})` : serie.color"
                            :stroke="chartConfig.chart.backgroundColor"
                            stroke-width="0.5"
                        />
                    </g > 
                    <g :data-cy="`xy-line-progression-${i}`" v-if="Object.hasOwn(serie, 'useProgression') && serie.useProgression === true && !isNaN(calcLinearProgression(serie.plots).trend)">
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
                            :data-cy="`xy-line-progression-label-${i}`"
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
                                :data-cy="`xy-bar-label-x-${i}-${j}`"
                                v-if="!Object.hasOwn(serie, 'dataLabels') || serie.dataLabels === true"
                                :x="plot.x + calcRectWidth() * 1.1"
                                :y="plot.y + (plot.value > 0 ? chartConfig.bar.labels.offsetY : - chartConfig.bar.labels.offsetY * 3)"
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
                                :data-cy="`xy-plot-label-x-${i}-${j}`"
                                v-if="!Object.hasOwn(serie, 'dataLabels') || serie.dataLabels === true"
                                :x="plot.x"
                                :y="plot.y + chartConfig.plot.labels.offsetY"
                                text-anchor="middle"
                                :font-size="chartConfig.chart.labels.fontSize"
                                :fill="chartConfig.plot.labels.color"
                            >
                                {{ canShowValue(plot.value) ? Number(plot.value.toFixed(chartConfig.plot.labels.rounding)).toLocaleString() : '' }}
                            </text>
                            <foreignObject
                                :data-cy="`xy-plot-tag-start-${i}`"
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
                                :data-cy="`xy-plot-tag-end-${i}`"
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
                                :data-cy="`xy-line-label-x-${i}-${j}`"
                                v-if="!Object.hasOwn(serie, 'dataLabels') || serie.dataLabels === true"
                                :x="plot.x"
                                :y="plot.y + (plot.value > 0 ? chartConfig.line.labels.offsetY : - chartConfig.line.labels.offsetY * 3)"
                                text-anchor="middle"
                                :font-size="chartConfig.chart.labels.fontSize"
                                :fill="chartConfig.line.labels.color"
                            >
                                {{ canShowValue(plot.value) ? Number(plot.value.toFixed(chartConfig.line.labels.rounding)).toLocaleString() : '' }}
                            </text>
                            <foreignObject
                                :data-cy="`xy-line-tag-start-${i}`"
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
                                :data-cy="`xy-line-tag-end-${i}`"
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
                            :data-cy="`xy-label-y-${i}`"
                            v-if="yLabel.value >= min && yLabel.value <= max" 
                            :x="drawingArea.left - 7" 
                            :y="yLabel.y + chartConfig.chart.labels.fontSize / 3" 
                            :font-size="chartConfig.chart.grid.labels.fontSize" 
                            text-anchor="end"
                            :fill="chartConfig.chart.grid.labels.color"
                        >
                            {{ canShowValue(yLabel.value) ? Number(yLabel.value.toFixed(0)).toLocaleString() : '' }}
                        </text>
                    </g>
                </g>

                <!-- AXIS LABELS -->
                <g>
                    <text data-cy="xy-axis-yLabel" v-if="chartConfig.chart.grid.labels.axis.yLabel" :font-size="chartConfig.chart.grid.labels.axis.fontSize" :fill="chartConfig.chart.grid.labels.color" id="yAxisLabel" text-anchor="middle" style="transition: none">
                        {{ chartConfig.chart.grid.labels.axis.yLabel }}
                    </text>
                    <text 
                        data-cy="xy-axis-xLabel"
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
                            <div data-cy="xy-foreignObject-title" class="vue-ui-xy-title-main" :style="`font-size:${chartConfig.chart.title.fontSize * 0.6}px; color:${chartConfig.chart.title.color}; font-weight:${chartConfig.chart.title.bold ? 'bold': '400'}`">
                                {{ chartConfig.chart.title.text }}
                            </div>
                            <div data-cy="xy-foreignObject-subtitle" class="vue-ui-xy-title-subtitle" v-if="chartConfig.chart.title.subtitle.text" :style="`font-size:${chartConfig.chart.title.subtitle.fontSize * 0.6}px; color:${chartConfig.chart.title.subtitle.color}`">
                                {{ chartConfig.chart.title.subtitle.text }}
                            </div>
                        </div>
                    </foreignObject>
                </g>

                <!-- LEGEND AS FOREIGNOBJECT -->
                <g v-if="chartConfig.chart.legend.show && mutableConfig.legendInside && !isPrinting">
                    <foreignObject
                        data-cy="xy-foreignObject-legend"
                        x="0"
                        :y="drawingArea.bottom + chartConfig.chart.padding.bottom / 3 + 12"
                        :width="`100%`"
                        height="20px"
                        :style="`overflow:visible; font-size:${chartConfig.chart.legend.fontSize * 0.6}px`"
                    >
                        <div class="vue-ui-xy-legend">
                            <div v-for="(legendItem, i) in absoluteDataset" :data-cy="`xy-foreignObject-legend-item-${i}`" :key="`div_legend_item_${i}`" @click="segregate(legendItem)" :class="{'vue-ui-xy-legend-item': true, 'vue-ui-xy-legend-item-segregated' : segregatedSeries.includes(legendItem.id)}">
                                <svg viewBox="0 0 12 12" height="14" width="14">
                                    <rect v-if="icons[legendItem.type] === 'line'" x="0" y="6" stroke="none" height="4" width="12" :fill="legendItem.color" />
                                    <rect v-else-if="icons[legendItem.type] === 'bar'" x="0" y="0" height="12" width="12" stroke="none" :fill="legendItem.color" />
                                    <circle v-else cx="6" cy="6" r="6" stroke="none" :fill="legendItem.color" />
                                </svg>
                                <span :style="`color:${chartConfig.chart.legend.color}`">{{legendItem.name}}</span>
                            </div>
                        </div>
                    </foreignObject>
                </g>

                
                <!-- TIME LABELS -->
                <g v-if="chartConfig.chart.grid.labels.xAxisLabels.show">
                    <g v-for="(label, i) in timeLabels" :key="`time_label_${i}`">
                        <text
                            :data-cy="`xy-time-label-${i}`"
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

                <!-- HIGHLITGHT AREA -->
                <g v-if="hasHighlightArea">
                    <rect
                        data-cy="xy-highlight-area"
                        :x="drawingArea.left + (drawingArea.width / maxSeries) * (chartConfig.chart.highlightArea.from - (slicer.start))"
                        :y="drawingArea.top"
                        :height="drawingArea.height"
                        :width="(drawingArea.width / maxSeries) * highlightAreaSpan"
                        :fill="`${chartConfig.chart.highlightArea.color}${opacity[chartConfig.chart.highlightArea.opacity]}`"
                    />
                    <foreignObject v-if="chartConfig.chart.highlightArea.caption.text"
                        :x="(drawingArea.left + (drawingArea.width / maxSeries) * (chartConfig.chart.highlightArea.from - (slicer.start))) - (chartConfig.chart.highlightArea.caption.width === 'auto' ? 0 : chartConfig.chart.highlightArea.caption.width / 2 - (drawingArea.width / maxSeries) * highlightAreaSpan / 2)"
                        :y="drawingArea.top + chartConfig.chart.highlightArea.caption.offsetY"
                        style="overflow:visible"
                        :width="chartConfig.chart.highlightArea.caption.width === 'auto' ? (drawingArea.width / maxSeries) * highlightAreaSpan : chartConfig.chart.highlightArea.caption.width"
                        
                    >
                        <div :style="`padding:${chartConfig.chart.highlightArea.caption.padding}px;text-align:${chartConfig.chart.highlightArea.caption.textAlign};font-size:${chartConfig.chart.highlightArea.caption.fontSize}px;color:${chartConfig.chart.highlightArea.caption.color};font-weight:${chartConfig.chart.highlightArea.caption.bold ? 'bold' : 'normal'}`">
                            {{ chartConfig.chart.highlightArea.caption.text }}
                        </div>
                    </foreignObject>
                </g>

                <!-- TOOLTIP TRAPS -->
                <g v-if="chartConfig.chart.tooltip.show">
                    <g v-for="(trap, i) in maxSeries" :key="`tooltip_trap_${i}`">
                        <rect
                            :data-cy="`xy-tooltip-trap-${i}`"
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
                    <input data-cy="xy-range-start" :id="`start_${uniqueId}`" type="range" :style="`border:none !important;accent-color:${chartConfig.chart.zoom.color}`" :min="0" :max="maxX" v-model="slicer.start">
                    <input :id="`end_${uniqueId}`" type="range" :style="`border:none !important;accent-color:${chartConfig.chart.zoom.color}`" :min="0" :max="maxX" v-model="slicer.end">

            </div>
            <div class="vue-ui-xy-range-slider-label-right">
                {{ chartConfig.chart.grid.labels.xAxisLabels.values[slicer.end-1] }}
            </div>
        </div>

        <!-- LEGEND AS OUTSIDE DIV -->
        <div data-cy="xy-div-legend" v-if="chartConfig.chart.legend.show && (!mutableConfig.legendInside || isPrinting)" class="vue-ui-xy-legend" :style="`font-size:${chartConfig.chart.legend.fontSize}px`">
            <div v-for="(legendItem, i) in absoluteDataset" :data-cy="`xy-div-legend-item-${i}`" :key="`div_legend_item_${i}`" @click="segregate(legendItem)" :class="{'vue-ui-xy-legend-item': true, 'vue-ui-xy-legend-item-segregated' : segregatedSeries.includes(legendItem.id)}">
                <svg viewBox="0 0 12 12" height="14" width="14">
                    <rect v-if="icons[legendItem.type] === 'line'" x="0" y="6" stroke="none" height="4" width="12" :fill="legendItem.color" />
                    <rect v-else-if="icons[legendItem.type] === 'bar'" x="0" y="0" height="12" width="12" stroke="none" :fill="legendItem.color" />
                    <circle v-else cx="6" cy="6" r="6" stroke="none" :fill="legendItem.color" />
                </svg>
                <span :style="`color:${chartConfig.chart.legend.color}`">{{legendItem.name}}</span>
            </div>
        </div>

        <!-- TOOLTIP -->
        <div 
            data-cy="xy-tooltip"
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
                                {{ th.label }}
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
import { useMouse } from '../useMouse';
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
    calcLinearProgression,
    createSmoothPath
} from '../lib';
import mainConfig from "../default_configs.json";
import Title from '../atoms/Title.vue';

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
    components: {
        Title,
    },
    data(){
        const uniqueId = `vue-data-ui-xy_${Math.random()}_${Math.random()}`;
        const maxX = Math.max(...this.dataset.map(datapoint => datapoint.series.length));
        const slicer = {
            start: 0,
            end: maxX,
        }
        return {
            CTX: null,
            CANVAS: null,
            opacity,
            useSafeValues: true,
            palette,
            defaultConfig: mainConfig.vue_ui_xy,
            clientPosition: {
                x:0,
                y:0,
            },
            canvasClientPosition: {
                x: 0,
                y: 0,
            },
            icons: {
                line: "line",
                bar: "bar",
                plot: "plot"
            },
            isInsideCanvas: false,
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
        chartFont() {
            const wrapper = document.getElementById(`vue-ui-xy_${this.uniqueId}`);
            return window.getComputedStyle(wrapper, null).getPropertyValue("font-family");
        },
        chartConfig: {
            get: function() {
                if(!Object.keys(this.config || {}).length) {
                return this.defaultConfig
            }
                const reconcilied = this.treeShake({
                    defaultConfig: this.defaultConfig,
                    userConfig: this.config
                });

                return this.convertConfigColors(reconcilied);
            },
            set: function (val) {
                return val;
            }
        },
        hasHighlightArea() {
            return this.chartConfig.chart.highlightArea && this.chartConfig.chart.highlightArea.show;
        },
        highlightAreaSpan() {
            const { from, to } = this.chartConfig.chart.highlightArea;
            console.log({ from, to})
            if (from === to) return 1;
            if (to < from) return 0;
            return to - from + 1;
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
                const plots = datapoint.series.map((plot, j) => {
                        return {
                            x: (this.drawingArea.left + (this.slot.line/2)) + (this.slot.line * j),
                            y: this.drawingArea.bottom - (this.drawingArea.height * this.ratioToMax(plot)),
                            value: datapoint.absoluteValues[j],
                        }
                    });
                const curve = this.createSmoothPath(plots);
                return {
                    ...datapoint,
                    curve,
                    plots,
                    area: !datapoint.useArea ? '' : this.createArea(plots)
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
                    let shape = '';
                    switch (this.icons[s.type]) {
                        case 'bar':
                            shape = `<svg viewBox="0 0 12 12" height="14" width="14"><rect x="0" y="0" stroke="none" height="12" width="12" fill="${s.color}" /></svg>`;
                            break;
                        
                        case 'line':
                            shape = `<svg viewBox="0 0 12 12" height="14" width="14"><rect x="0" y="6" stroke="none" height="4" width="12" fill="${s.color}" /></svg>`;
                            break;

                        case 'plot':
                            shape = `<svg viewBox="0 0 12 12" height="14" width="14"><circle cx="6" cy="6" r="6" stroke="none" fill="${s.color}" /></svg>`;
                        default:
                            break;
                    }
                    html += `<div style="display:flex;flex-direction:row; align-items:center;gap:3px;">${shape} ${s.name} : <b>${this.chartConfig.chart.tooltip.showValue ? Number(s.value.toFixed(this.chartConfig.chart.tooltip.roundingValue)).toLocaleString() : ''}</b> ${this.chartConfig.chart.tooltip.showPercentage ? `(${(this.checkNaN(Math.abs(s.value) / sum * 100)).toFixed(this.chartConfig.chart.tooltip.roundingPercentage)}%)` : ''}</div>`;
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
    watch: {
        mutableConfig: {
            handler() {
                if (this.chartConfig.useCanvas) {
                    this.drawCanvas();
                }
            },
            deep: true
        },
        config: {
            handler() {
                if (this.chartConfig.useCanvas) {
                    this.drawCanvas();
                }
            }
        },
        dataset: {
            handler() {
                if (this.chartConfig.useCanvas) {
                    this.drawCanvas();
                }
            }
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
            titleInside: this.chartConfig.useCanvas ? false : !this.chartConfig.chart.title.useDiv,
            legendInside: this.chartConfig.useCanvas ? false : !this.chartConfig.chart.legend.useDiv,
            showTable: this.chartConfig.showTable === true
        }

        if (this.chartConfig.chart.zoom.show) {
            const vm = this;
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
                if (vm.chartConfig.useCanvas) {
                    vm.drawCanvas();
                }
            }
            function slideTwo(){
                if(parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap){
                    sliderTwo.value = parseInt(sliderOne.value) + minGap;
                }
                fillColor();
                fillColor();
                if (vm.chartConfig.useCanvas) {
                    vm.drawCanvas();
                }
            }
            const dataset = this.dataset;
            function fillColor(){
                let percent1 = (sliderOne.value / Math.max(...dataset.map(datapoint => datapoint.series.length))) * 100;
                let percent2 = (sliderTwo.value / Math.max(...dataset.map(datapoint => datapoint.series.length))) * 100;
                sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , #858585 ${percent1}% , #858585 ${percent2}%, #dadae5 ${percent2}%)`;
            }
    
            slideOne();
            slideTwo();
        }

        if (this.chartConfig.useCanvas) {
            const canvas = this.$refs.vueUiXyCanvas;
            this.drawCanvas();
            if (canvas) {
                function getMousePositionCanvas(can, e) {
                    const rect = can.getBoundingClientRect();
                    const scaleX = canvas.width / rect.width;
                    const scaleY = canvas.height / rect.height;
                    return {
                        x: (e.clientX - rect.left) * scaleX,
                        y: (e.clientY - rect.top) * scaleY
                    }
                }
                canvas.addEventListener('mousemove', (e) => {
                    const { x, y } = getMousePositionCanvas(canvas, e);
                    this.canvasClientPosition.x = x;
                    this.canvasClientPosition.y = y;
                    this.drawCanvas();
                });
            }
        }
    },
    methods: {
        checkNaN,
        createSmoothPath,
        isSafeValue,
        treeShake,
        shiftHue,
        pdf,
        convertColorToHex,
        convertConfigColors,
        makeXls,
        adaptColorToBackground,
        calcLinearProgression,
        useMouse,
        createArea(plots) {
            const start = { x: plots[0].x, y: this.zero };
            const end = { x: plots.at(-1).x, y: this.zero };
            const path = [];
            plots.forEach(plot => {
                path.push(`${plot.x},${plot.y} `);
            });
            return [ start.x, start.y, ...path, end.x, end.y].toString();
        },
        /////////////////////////////// CANVAS /////////////////////////////////
        createCanvasArea(plots) {
            const start = { x: plots[0].x, y: this.zero };
            const end = { x: plots.at(-1).x, y: this.zero };
            const path = [];
            plots.forEach(plot => {
                path.push({
                    x: plot.x,
                    y: plot.y,
                    value: plot.value
                })
            });
            return [ start, ...path, end];
        },
        drawCanvas() {
            this.CANVAS = this.$refs.vueUiXyCanvas;
            this.CTX = this.CANVAS.getContext("2d");
            this.CTX.clearRect(0, 0, this.chartConfig.chart.width, this.chartConfig.chart.height);
            this.CTX.save();
            this.CTX.fillStyle = this.chartConfig.chart.backgroundColor;
            this.CTX.fillRect(0, 0, this.chartConfig.chart.width, this.chartConfig.chart.height);
            this.CTX.restore();


            if (!this.CANVAS || !this.CTX) {
                console.error("Vue Data UI Exception: an error occurred while painting the canvas");
            }

            if (this.maxSeries > 0) {
                this.drawCanvasGrid();
            }

            if (this.barSet.length) {
                this.drawCanvasBars();
            }

            if (this.lineSet.length) {
                this.drawCanvasLines();
            }

            if (this.plotSet.length) {
                this.drawCanvasPlots();
            }

            if (this.chartConfig.chart.title.show && this.mutableConfig.titleInside) {
                this.drawCanvasTitle();
                if (this.chartConfig.chart.title.subtitle.text) {
                    this.drawCanvasSubtitle();
                }
            }
            
            if (this.isInsideCanvas) {
                this.drawCanvasTooltip();
                this.drawCanvasSelector();
            }
        },
        drawCanvasSelector() {
            this.CTX.save();
            const zoneWidth = this.maxSlot;
            const zones = [];
            for(let i = 0; i < this.maxSeries; i += 1) {
                zones.push(zoneWidth * i + this.drawingArea.left);
            }
            const hoverIndex = zones.indexOf(this.findClosestValue(this.canvasClientPosition.x, zones));
            this.CTX.rect(zones[hoverIndex], this.drawingArea.top, zoneWidth, this.drawingArea.height);
            this.CTX.fillStyle = `${this.chartConfig.chart.highlighter.color}${opacity[this.chartConfig.chart.highlighter.opacity]}`;
            this.CTX.fill();
            this.CTX.restore();
        },
        drawCanvasTooltip() {
            const zoneWidth = this.maxSlot;
            const zones = [];
            for (let i = 0; i < this.maxSeries; i += 1) {
                zones.push((zoneWidth * i + this.drawingArea.left));
            }
            const hoverIndex = zones.indexOf(this.findClosestValue(this.canvasClientPosition.x, zones));
            this.toggleTooltip(true, hoverIndex);
        },
        drawCanvasSubtitle() {
            this.CTX.save();
            this.CTX.font = `${this.chartConfig.chart.title.subtitle.bold ? 'bold ' : ''}${this.chartConfig.chart.title.subtitle.fontSize}px ${this.chartFont}`;
            this.CTX.fillStyle = this.chartConfig.chart.title.subtitle.color;
            this.CTX.textAlign = "center";
            this.CTX.fillText(
                this.chartConfig.chart.title.subtitle.text,
                this.drawingArea.width / 2 + this.drawingArea.left,
                this.chartConfig.chart.title.fontSize * 2 + this.chartConfig.chart.title.subtitle.fontSize
            )
            this.CTX.restore();
        },
        drawCanvasTitle() {
            this.CTX.save();
            this.CTX.font = `${this.chartConfig.chart.title.bold ? 'bold ' : ''}${this.chartConfig.chart.title.fontSize}px ${this.chartFont}`;
            this.CTX.fillStyle = this.chartConfig.chart.title.color;
            this.CTX.textAlign = "center";
            this.CTX.fillText(
                this.chartConfig.chart.title.text,
                this.drawingArea.width / 2 + this.drawingArea.left,
                this.chartConfig.chart.title.fontSize
            )
            this.CTX.restore();
        },
        drawBarXLabels({ x, y, value }) {
            this.CTX.save();
            this.CTX.font = `${this.chartConfig.chart.labels.fontSize}px ${this.chartFont}`;
            this.CTX.textAlign = "center";
            this.CTX.fillStyle = this.chartConfig.bar.labels.color;
            this.CTX.fillText(this.canShowValue(value) ? value.toFixed(this.chartConfig.bar.labels.rounding) : '', x + this.calcRectWidth() * 1.1, y + (value > 0 ? this.chartConfig.bar.labels.offsetY : - this.chartConfig.bar.labels.offsetY * 3));
            this.CTX.restore();
        },
        drawLineXLabels({x, y, value }) {
            this.CTX.save();
            this.CTX.font = `${this.chartConfig.chart.labels.fontSize}px ${this.chartFont}`;
            this.CTX.textAlign = "center";
            this.CTX.fillStyle = this.chartConfig.line.labels.color;
            this.CTX.fillText(this.canShowValue(value) ? value.toFixed(this.chartConfig.line.labels.rounding) : '', x, y + (value > 0 ? this.chartConfig.line.labels.offsetY : - this.chartConfig.line.labels.offsetY * 3));
            this.CTX.restore();
        },
        drawPlotXLabels({x, y, value }) {
            this.CTX.save();
            this.CTX.font = `${this.chartConfig.chart.labels.fontSize}px ${this.chartFont}`;
            this.CTX.textAlign = "center";
            this.CTX.fillStyle = this.chartConfig.plot.labels.color;
            this.CTX.fillText(this.canShowValue(value) ? value.toFixed(this.chartConfig.plot.labels.rounding) : '', x, y + (value > 0 ? this.chartConfig.plot.labels.offsetY : - this.chartConfig.plot.labels.offsetY * 3));
            this.CTX.restore();
        },
        drawCanvasPlots() {
            this.CTX.save();
            for (let i = 0; i < this.plotSet.length; i += 1) {
                const serie = this.plotSet[i];
                for (let k = 0; k < serie.plots.length; k += 1) {
                    const plot = serie.plots[k];
                    if (this.canShowValue(plot.value)) {
                        this.CTX.beginPath();
                        this.CTX.arc(plot.x, plot.y, this.chartConfig.plot.radius, 0, 2 * Math.PI, false);
                        this.CTX.fillStyle = serie.color;
                        this.CTX.fill();
                        this.CTX.closePath();
                    }
                    if (this.chartConfig.plot.labels.show && this.mutableConfig.dataLabels.show && (!Object.hasOwn(serie, 'dataLabels') || serie.dataLabels === true)) {
                        this.drawPlotXLabels(plot);
                    }
                }
                if (Object.hasOwn(serie, 'useProgression') && serie.useProgression === true && !isNaN(this.calcLinearProgression(serie.plots).trend)) {
                    const { x1, y1, x2, y2, trend } = this.calcLinearProgression(serie.plots);
                    this.drawArrow(this.CTX, x1, y1, x2, y2, 0.01, true, serie.color);
                    this.CTX.font = `${this.chartConfig.chart.labels.fontSize * 0.7}px ${this.chartFont}`;
                    this.CTX.strokeStyle = "white";
                    this.CTX.fillStyle = this.chartConfig.chart.color;
                    this.CTX.fillText(
                        `${(trend * 100).toFixed(1)}%`,
                        x2,
                        y2
                    )
                }
            }
            this.CTX.restore();
        },
        drawLineTag(plot, serie) {
            if(!plot) return;
            this.CTX.save();
            const charLen = serie.name.length * this.chartConfig.chart.labels.fontSize / 1.8;
            this.CTX.beginPath();
            this.CTX.fillStyle = `${serie.color}${this.opacity[80]}`;
            this.CTX.roundRect(serie.useTag === 'start' ? plot.x : plot.x - charLen, plot.y - this.chartConfig.chart.labels.fontSize * 1.5, charLen, this.chartConfig.chart.labels.fontSize * 1.5, [2]);
            this.CTX.fill();
            this.CTX.textAlign = serie.useTag === 'start' ? 'left' : 'right';
            this.CTX.fillStyle = this.adaptColorToBackground(serie.color);
            this.CTX.font = `${this.chartConfig.chart.labels.fontSize}px ${this.chartFont}`;
            this.CTX.fillText(
                serie.name,
                serie.useTag === 'start' ? plot.x + this.chartConfig.chart.labels.fontSize / 2 : plot.x - this.chartConfig.chart.labels.fontSize / 2,
                plot.y - this.chartConfig.chart.labels.fontSize / 2
            )
            this.CTX.closePath();
            this.CTX.restore();
        },
        drawCanvasLines() {
            this.CTX.save();
            for (let i = 0; i < this.lineSet.length; i += 1) {
                const serie = this.lineSet[i];
                if (serie.useArea) {
                    this.CTX.save();
                    const area = this.createCanvasArea(serie.plots);
                    if (area.length > 1) {
                        const areaGradient = this.CTX.createLinearGradient(area[0].x, 0, area.at(-1).x, 0);
                        areaGradient.addColorStop(0, `${this.shiftHue(serie.color, 0.03)}${this.opacity[this.chartConfig.line.area.opacity]}`);
                        areaGradient.addColorStop(1, `${serie.color}${this.opacity[this.chartConfig.line.area.opacity]}`);
                        this.CTX.beginPath();
                        this.CTX.moveTo(area[0].x, area[0].y);
                        for(let k = 1; k < area.length; k += 1) {
                            this.CTX.lineTo(area[k].x, area[k].y);
                        }
                        this.CTX.fillStyle = this.chartConfig.line.area.useGradient ? areaGradient : `${serie.color}${this.opacity[this.chartConfig.line.area.opacity]}`;
                        this.CTX.fill();
                        this.CTX.closePath();
                        this.CTX.restore();
                    }
                }

                for (let k = 0; k < serie.plots.length; k += 1) {
                    const plot = serie.plots[k];
                    if (k < serie.plots.length - 1 && this.canShowValue(plot.value) && this.canShowValue(serie.plots[k + 1].value)) {
                        this.CTX.beginPath();
                        if (serie.dashed) {
                            this.CTX.setLineDash([5, 5]);
                        } else {
                            this.CTX.setLineDash([0,0]);
                        }
                        this.CTX.moveTo(plot.x, plot.y);
                        this.CTX.lineTo(serie.plots[k + 1].x, serie.plots[k + 1].y);
                        this.CTX.strokeStyle = serie.color;
                        this.CTX.lineWidth = this.chartConfig.line.strokeWidth;
                        this.CTX.lineCap = "round";
                        this.CTX.stroke();
                        this.CTX.closePath();
                    }
                    if (this.canShowValue(plot.value)) {
                        this.CTX.setLineDash([0,0]);
                        this.CTX.beginPath();
                        this.CTX.arc(plot.x, plot.y, this.chartConfig.line.radius, 0, 2 * Math.PI, false);
                        this.CTX.fillStyle = serie.color;
                        this.CTX.fill();
                        this.CTX.closePath();
                        if (this.chartConfig.line.labels.show && this.mutableConfig.dataLabels.show && (!Object.hasOwn(serie, 'dataLabels') || serie.dataLabels === true)) {       
                            this.drawLineXLabels(plot);
                        }
                    }
                }
                if (this.chartConfig.line.labels.show && this.mutableConfig.dataLabels.show && serie.useTag) {
                    if (serie.useTag === 'start') {
                        this.drawLineTag(serie.plots[0], serie);
                    } else {
                        this.drawLineTag(serie.plots.at(-1), serie);
                    }
                }
                if (Object.hasOwn(serie, 'useProgression') && serie.useProgression === true && !isNaN(this.calcLinearProgression(serie.plots).trend)) {
                    const { x1, y1, x2, y2, trend } = this.calcLinearProgression(serie.plots);
                    this.drawArrow(this.CTX, x1, y1, x2, y2, 0.01, true, serie.color);
                    this.CTX.font = `${this.chartConfig.chart.labels.fontSize * 0.7}px ${this.chartFont}`;
                    this.CTX.strokeStyle = "white";
                    this.CTX.fillStyle = this.chartConfig.chart.color;
                    this.CTX.fillText(
                        `${(trend * 100).toFixed(1)}%`,
                        x2,
                        y2
                    )
                }
            }
            this.CTX.restore();
        },
        drawCanvasBars() {
            const borderRadius = this.chartConfig.bar.borderRadius;
            for (let i = 0; i < this.barSet.length; i += 1) {
                const serie = this.barSet[i];
                for (let k = 0; k < serie.plots.length; k += 1) {
                    const plot = serie.plots[k];
                    if (this.canShowValue(plot.value)) {
                        if (this.chartConfig.bar.useGradient) {
                            const gradient = this.CTX.createLinearGradient(
                                0,
                                this.calcRectY(plot),
                                0,
                                this.calcRectY(plot) + this.calcRectHeight(plot)
                            );
                            if (plot.value > 0) {
                                gradient.addColorStop(0, serie.color);
                                gradient.addColorStop(1, `${this.shiftHue(serie.color, 0.05)}66`);
                            } else {
                                gradient.addColorStop(0, `${this.shiftHue(serie.color, 0.05)}66`);
                                gradient.addColorStop(1, serie.color);
                            }
                            this.CTX.fillStyle = gradient;
                        } else {
                            this.CTX.fillStyle = serie.color;
                        }
                        this.CTX.beginPath();
                        if (plot.value > 0) {
                            this.CTX.roundRect(this.calcRectX(plot), this.calcRectY(plot), this.calcRectWidth(), this.calcRectHeight(plot), [borderRadius,borderRadius,0,0]);
                        } else {
                            this.CTX.roundRect(this.calcRectX(plot), this.calcRectY(plot), this.calcRectWidth(), this.calcRectHeight(plot), [0,0,borderRadius,borderRadius]);
                        }
                        this.CTX.fill();
                        if (this.chartConfig.bar.labels.show && this.mutableConfig.dataLabels.show && (!Object.hasOwn(serie, 'dataLabels') || serie.dataLabels === true)) {
                            this.drawBarXLabels(plot);
                        }
                    }
                }
                if (Object.hasOwn(serie, 'useProgression') && serie.useProgression === true && !isNaN(this.calcLinearProgression(serie.plots).trend)) {
                    const { x1, y1, x2, y2, trend } = this.calcLinearProgression(serie.plots);
                    this.drawArrow(this.CTX, x1, y1, x2, y2, 0.01, true, serie.color);
                    this.CTX.font = `${this.chartConfig.chart.labels.fontSize * 0.7}px ${this.chartFont}`;
                    this.CTX.strokeStyle = "white";
                    this.CTX.fillStyle = this.chartConfig.chart.color;
                    this.CTX.fillText(
                        `${(trend * 100).toFixed(1)}%`,
                        x2,
                        y2
                    )
                }
            }
        },
        drawLine(context, x1, y1, x2, y2, color) {
            context.save();
            context.beginPath();
            context.setLineDash([5, 5]);
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.strokeStyle = color;
            context.stroke();
            context.restore();
        },
        drawArrow(context, x1, y1, x2, y2, arrow, filled, color) {
            context.save();
            if (arrow == null) {
                arrow = 0.1;
            }
            const t = 1.0 - arrow;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const middleX = dx * t + x1;
            const middleY = dy * t + y1;
            this.drawLine(context, x1, y1, middleX, middleY, color);
            this.drawHead(context, middleX, middleY, x2, y2, filled, color);
            context.restore();
        },
        drawHead(context, x1, y1, x2, y2, filled, color) {
            const dx = x2 - x1;
            const dy = y2 - y1;
            context.beginPath();
            context.moveTo(x1 + 0.5 * dy, y1 - 0.5 * dx); 
            context.lineTo(x1 - 0.5 * dy, y1 + 0.5 * dx);
            context.lineTo(x2, y2);
            context.closePath();
            context.strokeStyle = color;
            context.fillStyle = color;
            filled ? context.fill() : context.stroke();
        },
        drawCanvasYLabels() {
            this.CTX.save();
            for (let i = 0; i < this.yLabels.length; i += 1) {
                const yLabel = this.yLabels[i];
                this.CTX.font = `${this.chartConfig.chart.grid.labels.fontSize}px ${this.chartFont}`;
                this.CTX.fillStyle = this.chartConfig.chart.grid.labels.color;
                this.CTX.textAlign = "right";
                this.CTX.fillText(
                    `${this.canShowValue(yLabel.value) ? Number(yLabel.value.toFixed(0)).toLocaleString() : ''}`,
                    this.drawingArea.left - 7,
                    yLabel.y + this.chartConfig.chart.labels.fontSize / 3
                );
                this.CTX.beginPath();
                this.CTX.moveTo(this.drawingArea.left, yLabel.y);
                this.CTX.lineTo(this.drawingArea.left - 5, yLabel.y);
                this.CTX.stroke();
                this.CTX.closePath();
            }
            this.CTX.restore();
        },
        drawCanvasTimeLabels() {
            this.CTX.save();
            for (let i = 0; i < this.timeLabels.length; i += 1) {
                const label = this.timeLabels[i];
                if ((label && !this.chartConfig.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast) || (label && this.chartConfig.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && (i === 0 || i === this.timeLabels.length -1))) {
                    this.CTX.font = `${this.chartConfig.chart.grid.labels.xAxisLabels.fontSize}px ${this.chartFont}`;
                    this.CTX.fillStyle = this.chartConfig.chart.grid.labels.xAxisLabels.color;
                    this.CTX.textAlign = "center";
                    this.CTX.fillText(
                        label,
                        this.drawingArea.left + (this.drawingArea.width / this.maxSeries) * i + (this.drawingArea.width / this.maxSeries / 2),
                        this.drawingArea.bottom + this.chartConfig.chart.grid.labels.xAxisLabels.fontSize * 1.3
                    )
                }
            }
            this.CTX.restore();
        },
        drawCanvasAxisLabels() {
            if (this.chartConfig.chart.grid.labels.axis.yLabel) {
                const x = 0;
                const y = this.drawingArea.height / 2;
                this.CTX.save();
                this.CTX.translate(x,y);
                this.CTX.font = `${this.chartConfig.chart.grid.labels.axis.fontSize}px ${this.chartFont}`;
                this.CTX.fillStyle = this.chartConfig.chart.grid.labels.color;
                this.CTX.textAlign = "center";
                this.CTX.rotate(-Math.PI / 2);
                this.CTX.fillText(
                    this.chartConfig.chart.grid.labels.axis.yLabel,
                    -this.chartConfig.chart.grid.labels.axis.yLabel.length * this.chartConfig.chart.grid.labels.axis.fontSize / 3,
                    15
                )
                this.CTX.restore();
            }
            if (this.chartConfig.chart.grid.labels.axis.xLabel) {
                this.CTX.save();
                this.CTX.font = `${this.chartConfig.chart.grid.labels.axis.fontSize}px ${this.chartFont}`;
                this.CTX.fillStyle = this.chartConfig.chart.grid.labels.color;
                this.CTX.textAlign = "center";
                this.CTX.fillText(
                    this.chartConfig.chart.grid.labels.axis.xLabel,
                    this.chartConfig.chart.width / 2,
                    this.drawingArea.bottom + this.chartConfig.chart.grid.labels.axis.fontSize + this.chartConfig.chart.grid.labels.xAxisLabels.fontSize * 1.3
                )
                this.CTX.restore();
            }
        },
        drawCanvasGrid() {
            this.CTX.save();
            this.CTX.setLineDash([0,0]);
            this.CTX.beginPath();
            this.CTX.moveTo(this.drawingArea.left, this.drawingArea.top);
            this.CTX.lineTo(this.drawingArea.left, this.drawingArea.bottom);
            this.CTX.strokeStyle = this.chartConfig.chart.grid.stroke;
            this.CTX.lineWidth = 1;
            this.CTX.lineCap = "round";
            this.CTX.stroke();
            this.CTX.closePath();

            this.CTX.beginPath();
            this.CTX.moveTo(this.drawingArea.left, this.zero);
            this.CTX.lineTo(this.drawingArea.right, this.zero);
            this.CTX.strokeStyle = this.chartConfig.chart.grid.stroke;
            this.CTX.lineWidth = 1;
            this.CTX.lineCap = "round";
            this.CTX.stroke();
            this.CTX.closePath();

            if (this.chartConfig.chart.grid.showVerticalLines) {
                for (let i = 0; i < this.maxSeries + 1; i += 1) {
                    this.CTX.beginPath();
                    this.CTX.moveTo((this.drawingArea.width / this.maxSeries) * i + this.drawingArea.left, this.drawingArea.top)
                    this.CTX.lineTo((this.drawingArea.width / this.maxSeries) * i + this.drawingArea.left, this.drawingArea.bottom);
                    this.CTX.strokeStyle = this.chartConfig.chart.grid.stroke;
                    this.CTX.lineWidth = 0.5;
                    this.CTX.lineCap = "round";
                    this.CTX.stroke();
                    this.CTX.closePath();
                }
            }

            if (this.chartConfig.chart.grid.labels.show) {
                this.drawCanvasYLabels()
            }

            if (this.chartConfig.chart.grid.labels.xAxisLabels.show) {
                this.drawCanvasTimeLabels();
            }

            if (this.chartConfig.chart.grid.labels.axis.yLabel || this.chartConfig.chart.grid.labels.axis.xLabel) {
                this.drawCanvasAxisLabels();
            }

            this.CTX.restore();
        },
        resetCanvas() {
            this.isTooltip = false;
            this.isInsideCanvas = false;
            this.canvasClientPosition = {
                x: 0,
                y: 0
            }
            this.drawCanvas();
        },
        ////////////////////////////////////////////////////////////////////////
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
        findClosestValue(val, arr) {
            let closest = arr[0];
            let minDifference = Math.abs(val - arr[0]);
            for (let i = 1; i < arr.length; i += 1) {
                const difference = Math.abs(val - arr[i]);
                if (difference < minDifference && arr[i] < val) {
                    closest = arr[i];
                    minDifference = difference;
                }
            }
            return closest;
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
            if(this.chartConfig.useCanvas) {
                this.drawCanvas();
            }
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

path, line, rect {
    animation: xyAnimation 0.5s ease-in-out;
    transform-origin: center;
}
@keyframes xyAnimation {
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
.vue-ui-xy {
    position: relative;
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
    width: fit-content;
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
canvas {
    width: 100%;
    object-fit: contain;
}

.vue-ui-dna * {
    animation: none !important;
}
</style>