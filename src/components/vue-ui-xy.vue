
<template>
    <div :id="`vue-ui-xy_${uniqueId}`" :class="`vue-ui-xy ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${chartConfig.useCssAnimation ? '' : 'vue-ui-dna'}`" ref="chart" :style="`background:${chartConfig.chart.backgroundColor}; color:${chartConfig.chart.color};width:100%;${!chartConfig.chart.title.text ? 'padding-top:36px' : ''};font-family:${chartConfig.chart.fontFamily};${chartConfig.responsive ? 'height: 100%' : ''}`">
        <!-- TITLE AS OUTSIDE DIV -->
        <div ref="chartTitle" class="vue-ui-xy-title" v-if="chartConfig.chart.title.show" :style="`font-family:${chartConfig.chart.fontFamily}`">
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

        <UserOptions
            ref="defails"
            :key="`user_options_${step}`"
            v-if="chartConfig.chart.userOptions.show && isDataset"
            :backgroundColor="chartConfig.chart.backgroundColor"
            :color="chartConfig.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uniqueId"
            :hasTooltip="chartConfig.chart.userOptions.buttons.tooltip && chartConfig.chart.tooltip.show"
            :hasPdf="chartConfig.chart.userOptions.buttons.pdf"
            :hasXls="chartConfig.chart.userOptions.buttons.csv"
            :hasImg="chartConfig.chart.userOptions.buttons.img"
            :hasLabel="chartConfig.chart.userOptions.buttons.labels"
            :hasTable="chartConfig.chart.userOptions.buttons.table"
            :hasStack="dataset.length > 1 && chartConfig.chart.userOptions.buttons.stack"
            :hasFullscreen="chartConfig.chart.userOptions.buttons.fullscreen"
            :isStacked="mutableConfig.isStacked"
            :isFullscreen="isFullscreen"
            :chartElement="$refs.chart"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...chartConfig.chart.userOptions.buttonTitles }"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleLabels="toggleLabels"
            @toggleStack="toggleStack"
            @toggleTooltip="toggleTooltip"
        >
            <template #optionTooltip v-if="$slots.optionTooltip">
                <slot name="optionTooltip"/>
            </template>
            <template #optionPdf v-if="$slots.optionPdf">
                <slot name="optionPdf" />
            </template>
            <template #optionCsv v-if="$slots.optionCsv">
                <slot name="optionCsv" />
            </template>
            <template #optionImg v-if="$slots.optionImg">
                <slot name="optionImg" />
            </template>
            <template #optionTable v-if="$slots.optionTable">
                <slot name="optionTable" />
            </template>
            <template #optionLabels v-if="$slots.optionLabels">
                <slot name="optionLabels" />
            </template>
            <template #optionStack v-if="$slots.optionStack">
                <slot name="optionStack"/>
            </template>
            <template v-if="$slots.optionFullscreen" template #optionFullscreen="{ toggleFullscreen, isFullscreen }">
                <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
            </template>
        </UserOptions>
        
        <svg xmlns="http://www.w3.org/2000/svg" v-if="isDataset" :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" data-cy="xy-svg" width="100%" :viewBox="viewBox" class="vue-ui-xy-svg" :style="`background:${chartConfig.chart.backgroundColor}; color:${chartConfig.chart.color}; font-family:${chartConfig.chart.fontFamily}`">
            <g v-if="maxSeries > 0"> 
                <!-- GRID -->
                <g class="vue-ui-xy-grid">
                    <line 
                        v-if="chartConfig.chart.grid.labels.xAxis.showBaseline"
                        :stroke="chartConfig.chart.grid.stroke" 
                        stroke-width="1" 
                        :x1="drawingArea.left"
                        :x2="drawingArea.right"
                        :y1="drawingArea.bottom"
                        :y2="drawingArea.bottom"
                        stroke-linecap="round"
                    />
                    <template v-if="!mutableConfig.useIndividualScale">
                        <line
                            v-if="chartConfig.chart.grid.labels.yAxis.showBaseline"
                            data-cy="xy-grid-line-y"
                            :stroke="chartConfig.chart.grid.stroke" 
                            stroke-width="1" 
                            :x1="drawingArea.left" 
                            :x2="drawingArea.left" 
                            :y1="drawingArea.top" 
                            :y2="drawingArea.bottom" 
                            stroke-linecap="round"
                        />
                        <g v-if="chartConfig.chart.grid.showHorizontalLines">
                            <line 
                                v-for="l in yLabels"
                                :x1="drawingArea.left"
                                :x2="drawingArea.right"
                                :y1="l.y"
                                :y2="l.y"
                                :stroke="chartConfig.chart.grid.stroke"
                                :stroke-width="0.5"
                                stroke-linecap="round"
                            />
                        </g>
                    </template>
                    <template v-else-if="chartConfig.chart.grid.showHorizontalLines">
                        <g v-for="grid in allScales">
                            <template v-if="grid.id === selectedScale && grid.yLabels.length">
                                <line 
                                    v-for="l in grid.yLabels"
                                    :x1="drawingArea.left"
                                    :x2="drawingArea.right"
                                    :y1="l.y"
                                    :y2="l.y"
                                    :stroke="grid.color"
                                    :stroke-width="0.5"
                                    stroke-linecap="round"
                                />
                            </template>
                            <template v-else-if="grid.yLabels.length">
                                <line 
                                    v-for="l in grid.yLabels"
                                    :x1="drawingArea.left"
                                    :x2="drawingArea.right"
                                    :y1="l.y"
                                    :y2="l.y"
                                    :stroke="chartConfig.chart.grid.stroke"
                                    :stroke-width="0.5"
                                    stroke-linecap="round"
                                />
                            </template>
                        </g>
                    </template>
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
                <template v-if="barSet.length">
                    <g v-for="(serie, i) in barSet" :key="`serie_bar_${i}`" :class="`serie_bar_${i}`" :style="`opacity:${selectedScale ? selectedScale === serie.id ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`">
                        <g 
                            v-for="(plot, j) in serie.plots" 
                            :key="`bar_plot_${i}_${j}`"
                        >
                            <rect
                                :data-cy="`xy-bar-${i}-${j}`"
                                v-if="canShowValue(plot.value)"
                                :x="calcRectX(plot)"
                                :y="mutableConfig.useIndividualScale ? calcIndividualRectY(plot) : calcRectY(plot)"
                                :height="mutableConfig.useIndividualScale ? Math.abs(calcIndividualHeight(plot)) : Math.abs(calcRectHeight(plot))"
                                :width="calcRectWidth() - (mutableConfig.useIndividualScale && mutableConfig.isStacked ? 0 : barPeriodGap) < 0 ? 0.00001 : calcRectWidth() - (mutableConfig.useIndividualScale && mutableConfig.isStacked ? 0 : barPeriodGap)"
                                :rx="chartConfig.bar.borderRadius"
                                :fill="chartConfig.bar.useGradient ? plot.value >= 0 ? `url(#rectGradient_pos_${i}_${uniqueId})`: `url(#rectGradient_neg_${i}_${uniqueId})` : serie.color"
                                :stroke="chartConfig.bar.border.useSerieColor ? serie.color : chartConfig.bar.border.stroke"
                                :stroke-width="chartConfig.bar.border.strokeWidth"
                            />

                            <template v-if="plot.comment && chartConfig.chart.comments.show">
                                <foreignObject style="overflow: visible" height="12" :width="(calcRectWidth() - (mutableConfig.useIndividualScale && mutableConfig.isStacked ? 0 : barPeriodGap) < 0 ? 0.00001 : calcRectWidth() - (mutableConfig.useIndividualScale && mutableConfig.isStacked ? 0 : barPeriodGap) / 2) + chartConfig.chart.comments.width" :x="calcRectX(plot) - (chartConfig.chart.comments.width / 2) + chartConfig.chart.comments.offsetX" :y="plot.y + chartConfig.chart.comments.offsetY + 6">
                                    <slot name="plot-comment" :plot="{...plot, color: serie.color}"/>
                                </foreignObject>
                            </template>
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
                                v-if="serie.plots.length > 1"
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
                                v-if="serie.plots.length > 1"
                                :data-cy="`xy-bar-progression-label-${i}`"
                                text-anchor="middle"
                                :x="calcLinearProgression(serie.plots).x2"
                                :y="calcLinearProgression(serie.plots).y2 - 6"
                                :font-size="fontSizes.plotLabels"
                                :fill="serie.color"
                            >
                                {{  dataLabel({
                                    v: calcLinearProgression(serie.plots).trend * 100,
                                    s: '%',
                                    r: 2
                                }) }}
                            </text>
                        </g>
                    </g>
                </template>

                <!-- ZERO LINE (AFTER BAR DATASETS, BEFORE LABELS) -->
                <template v-if="!mutableConfig.useIndividualScale && chartConfig.chart.grid.labels.zeroLine.show">
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
                </template>

                <!-- PLOTS -->
                <g v-for="(serie, i) in plotSet" :key="`serie_plot_${i}`" :class="`serie_plot_${i}`" :style="`opacity:${selectedScale ? selectedScale === serie.id ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`">
                    <g 
                        v-for="(plot, j) in serie.plots" 
                        :key="`circle_plot_${i}_${j}`"
                    >
                        <Shape
                            :data-cy="`xy-plot-${i}-${j}`"
                            v-if="canShowValue(plot.value)"
                            :shape="['triangle', 'square', 'diamond', 'pentagon', 'hexagon', 'star'].includes(serie.shape) ? serie.shape : 'circle'"
                            :color="chartConfig.plot.useGradient ? `url(#plotGradient_${i}_${uniqueId})` : serie.color"
                            :plot="{ x: plot.x, y: plot.y }"
                            :radius="selectedSerieIndex !== null ? selectedSerieIndex === j ? (plotRadii.plot || 6) * 1.5 : plotRadii.plot || 6 : plotRadii.plot || 6"
                            :stroke="chartConfig.chart.backgroundColor"
                            :strokeWidth="0.5"
                        />

                        <template v-if="plot.comment && chartConfig.chart.comments.show">
                            <foreignObject style="overflow: visible" height="12" :width="chartConfig.chart.comments.width" :x="plot.x - (chartConfig.chart.comments.width / 2) + chartConfig.chart.comments.offsetX" :y="plot.y + chartConfig.chart.comments.offsetY + 6">
                                <div style="width: 100%;">
                                    <slot name="plot-comment" :plot="{...plot, color: serie.color}"/>
                                </div>
                            </foreignObject>
                        </template>
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
                            v-if="serie.plots.length > 1"
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
                            v-if="serie.plots.length > 1"
                            :data-cy="`xy-plot-progression-label-${i}`"
                            text-anchor="middle"
                            :x="calcLinearProgression(serie.plots).x2"
                            :y="calcLinearProgression(serie.plots).y2 - 6"
                            :font-size="fontSizes.plotLabels"
                            :fill="serie.color"
                        >
                            {{  dataLabel({
                                v: calcLinearProgression(serie.plots).trend * 100,
                                s: '%',
                                r: 2
                            }) }}
                        </text>
                    </g>
                </g>

                <!-- LINE COATINGS -->
                <g v-for="(serie, i) in lineSet" :key="`serie_line_${i}`" :class="`serie_line_${i}`" :style="`opacity:${selectedScale ? selectedScale === serie.id ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`">
                    <path 
                        :data-cy="`xy-line-area-path-${i}`" 
                        v-if="serie.smooth && serie.plots.length > 1" 
                        :d="`M${serie.curve}`" 
                        :stroke="chartConfig.chart.backgroundColor" 
                        :stroke-width="chartConfig.line.strokeWidth + 1" 
                        :stroke-dasharray="serie.dashed ? chartConfig.line.strokeWidth * 2 : 0" 
                        fill="none" 
                    />
                    <g v-else-if="serie.plots.length > 1">
                        <g v-for="(plot, j) in serie.plots" :key="`line_${i}_${j}`">
                            <line
                                :data-cy="`xy-line-segment-${i}-${j}`"
                                v-if="plot && j < serie.plots.length - 1 && serie.plots[j+1] && canShowValue(plot.value) && canShowValue(serie.plots[j+1].value)"
                                :x1="plot.x"
                                :x2="serie.plots[j+1].x"
                                :y1="plot.y"
                                :y2="serie.plots[j+1].y"
                                :stroke="chartConfig.chart.backgroundColor"
                                :stroke-width="chartConfig.line.strokeWidth + 1"
                                :stroke-dasharray="serie.dashed ? chartConfig.line.strokeWidth * 2 : 0"
                                stroke-linejoin="round"
                                stroke-linecap="round"
                            />
                        </g>
                    </g>
                </g>
                
                <!-- LINES -->
                <g v-for="(serie, i) in lineSet" :key="`serie_line_${i}`" :class="`serie_line_${i}`" :style="`opacity:${selectedScale ? selectedScale === serie.id ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`">    
                    <g :data-cy="`xy-line-area-${i}`" v-if="serie.useArea && serie.plots.length > 1">
                        <path 
                            v-if="serie.smooth" 
                            :d="`M ${serie.plots[0] ? serie.plots[0].x : Math.min(...serie.plots.filter(p => !!p).map(p => p.x))},${mutableConfig.isStacked ? drawingArea.bottom - serie.yOffset : drawingArea.bottom} ${serie.curve} L ${serie.plots.at(-1) ? serie.plots.at(-1).x : (drawingArea.left + (slot.line * i) + slot.line / 2)},${mutableConfig.isStacked ? drawingArea.bottom - serie.yOffset : drawingArea.bottom} Z`" :fill="chartConfig.line.area.useGradient ? `url(#areaGradient_${i}_${uniqueId})` : `${serie.color}${opacity[chartConfig.line.area.opacity]}`"
                        />
                        <path v-else :d="`M${serie.area}Z`" :fill="chartConfig.line.area.useGradient ? `url(#areaGradient_${i}_${uniqueId})` : `${serie.color}${opacity[chartConfig.line.area.opacity]}`"/>
                    </g>

                    <path 
                        :data-cy="`xy-line-area-path-${i}`" 
                        v-if="serie.smooth && serie.plots.length > 1" 
                        :d="`M${serie.curve}`" 
                        :stroke="serie.color" 
                        :stroke-width="chartConfig.line.strokeWidth" 
                        :stroke-dasharray="serie.dashed ? chartConfig.line.strokeWidth * 2 : 0" 
                        fill="none" 
                    />
                    <g v-else-if="serie.plots.length > 1">
                        <g v-for="(plot, j) in serie.plots" :key="`line_${i}_${j}`">
                            <line
                                :data-cy="`xy-line-segment-${i}-${j}`"
                                v-if="plot && j < serie.plots.length - 1 && serie.plots[j+1] && canShowValue(plot.value) && canShowValue(serie.plots[j+1].value)"
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

                        <Shape
                            :data-cy="`xy-plot-${i}-${j}`"
                            v-if="plot && canShowValue(plot.value)"
                            :shape="['triangle', 'square', 'diamond', 'pentagon', 'hexagon', 'star'].includes(serie.shape) ? serie.shape : 'circle'"
                            :color="chartConfig.line.useGradient ? `url(#lineGradient_${i}_${uniqueId})` : serie.color"
                            :plot="{ x: plot.x, y: plot.y }"
                            :radius="selectedSerieIndex !== null ? selectedSerieIndex === j ? (plotRadii.line || 6) * 1.5 : plotRadii.line : plotRadii.line"
                            :stroke="chartConfig.chart.backgroundColor"
                            :strokeWidth="0.5"
                        />

                        <template v-if="plot.comment && chartConfig.chart.comments.show">
                            <foreignObject style="overflow: visible" height="12" :width="chartConfig.chart.comments.width" :x="plot.x - (chartConfig.chart.comments.width / 2) + chartConfig.chart.comments.offsetX" :y="plot.y + chartConfig.chart.comments.offsetY + 6">
                                <div style="width: 100%;">
                                    <slot name="plot-comment" :plot="{...plot, color: serie.color}"/>
                                </div>
                            </foreignObject>
                        </template>

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
                            v-if="serie.plots.length > 1"
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
                            v-if="serie.plots.length > 1"
                            :data-cy="`xy-line-progression-label-${i}`"
                            text-anchor="middle"
                            :x="calcLinearProgression(serie.plots).x2"
                            :y="calcLinearProgression(serie.plots).y2 - 6"
                            :font-size="fontSizes.plotLabels"
                            :fill="serie.color"
                        >
                            {{  dataLabel({
                                v: calcLinearProgression(serie.plots).trend * 100,
                                s: '%',
                                r: 2
                            }) }}
                        </text>
                    </g>
                </g>

                <!-- X LABELS BAR -->
                <g v-if="(chartConfig.bar.labels.show || chartConfig.bar.serieName.show) && mutableConfig.dataLabels.show">
                    <g v-for="(serie, i) in barSet" :key="`xLabel_bar_${i}`" :class="`xLabel_bar_${i}`" :style="`opacity:${selectedScale ? selectedScale === serie.id ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`">
                        <g v-for="(plot, j) in serie.plots" :key="`xLabel_bar_${i}_${j}`">
                            <text
                                :data-cy="`xy-bar-label-x-${i}-${j}`"
                                v-if="plot && (!Object.hasOwn(serie, 'dataLabels') || serie.dataLabels === true) && chartConfig.bar.labels.show"
                                :x="mutableConfig.useIndividualScale && mutableConfig.isStacked ? plot.x + slot.line / 2 : calcRectX(plot) + calcRectWidth() / 2 - barPeriodGap / 2"
                                :y="plot.y + (plot.value > 0 ? chartConfig.bar.labels.offsetY : - chartConfig.bar.labels.offsetY * 3)"
                                text-anchor="middle"
                                :font-size="fontSizes.plotLabels"
                                :fill="chartConfig.bar.labels.color"
                            >
                                {{ canShowValue(plot.value) ? dataLabel({p:chartConfig.chart.labels.prefix, v: plot.value, s: chartConfig.chart.labels.suffix, r: chartConfig.bar.labels.rounding}) : '' }}
                            </text>
                            <text 
                                v-if="plot && chartConfig.bar.serieName.show"
                                :x="mutableConfig.useIndividualScale && mutableConfig.isStacked ? plot.x + slot.line / 2 : plot.x + calcRectWidth() * 1.1"
                                :y="plot.y + (plot.value > 0 ? chartConfig.bar.serieName.offsetY : - chartConfig.bar.serieName.offsetY * 3)"
                                text-anchor="middle"
                                :font-size="fontSizes.plotLabels"
                                :fill="chartConfig.bar.serieName.useSerieColor ? serie.color : chartConfig.bar.serieName.color"
                                :font-weight="chartConfig.bar.serieName.bold ? 'bold' : 'normal'"
                            >
                                {{ chartConfig.bar.serieName.useAbbreviation ? abbreviate({ source: serie.name, length: chartConfig.bar.serieName.abbreviationSize}) : serie.name }}
                            </text>
                        </g>
                    </g>
                </g>

                <!-- X LABELS PLOT -->
                <g v-if="chartConfig.plot.labels.show && mutableConfig.dataLabels.show">
                    <g v-for="(serie, i) in plotSet" :key="`xLabel_plot_${i}`" :class="`xLabel_plot_${i}`" :style="`opacity:${selectedScale ? selectedScale === serie.id ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`">
                        <g v-for="(plot, j) in serie.plots" :key="`xLabel_plot_${i}_${j}`">
                            <text
                                :data-cy="`xy-plot-label-x-${i}-${j}`"
                                v-if="plot && !Object.hasOwn(serie, 'dataLabels') || serie.dataLabels === true"
                                :x="plot.x"
                                :y="plot.y + chartConfig.plot.labels.offsetY"
                                text-anchor="middle"
                                :font-size="fontSizes.plotLabels"
                                :fill="chartConfig.plot.labels.color"
                            >
                                {{ canShowValue(plot.value) ? dataLabel({p:chartConfig.chart.labels.prefix, v: plot.value, s: chartConfig.chart.labels.suffix, r: chartConfig.plot.labels.rounding}) : '' }}
                            </text>
                            <foreignObject
                                :data-cy="`xy-plot-tag-start-${i}`"
                                v-if="plot && j === 0 && serie.useTag && serie.useTag === 'start'"
                                :x="plot.x"
                                :y="plot.y - 20"
                                :height="24"
                                width="150"
                                style="overflow: visible"
                            >
                                <div :style="`padding: 3px; background:${serie.color}${opacity[80]};color:${adaptColorToBackground(serie.color)};width:fit-content;font-size:${fontSizes.plotLabels}px;border-radius: 2px;`">
                                    {{ serie.name }}
                                </div>
                            </foreignObject>
                            <foreignObject
                                :data-cy="`xy-plot-tag-end-${i}`"
                                v-if="plot && j === serie.plots.length - 1 && serie.useTag && serie.useTag === 'end'"
                                :x="plot.x - serie.name.length * (fontSizes.plotLabels / 2)"
                                :y="plot.y - 20"
                                :height="24"
                                width="150"
                                style="overflow: visible"
                            >
                                <div :style="`padding: 3px; background:${serie.color}${opacity[80]};color:${adaptColorToBackground(serie.color)};width:fit-content;font-size:${fontSizes.plotLabels}px;border-radius: 2px;`">
                                    {{ serie.name }}
                                </div>
                            </foreignObject>
                        </g>
                    </g>
                </g>

                <!-- X LABELS LINE -->
                <g v-if="chartConfig.line.labels.show && mutableConfig.dataLabels.show">
                    <g v-for="(serie, i) in lineSet" :key="`xLabel_line_${i}`" :class="`xLabel_line_${i}`" :style="`opacity:${selectedScale ? selectedScale === serie.id ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`">
                        <g v-for="(plot, j) in serie.plots" :key="`xLabel_line_${i}_${j}`">
                            <text
                                :data-cy="`xy-line-label-x-${i}-${j}`"
                                v-if="plot && !Object.hasOwn(serie, 'dataLabels') || serie.dataLabels === true"
                                :x="plot.x"
                                :y="plot.y + (plot.value > 0 ? chartConfig.line.labels.offsetY : - chartConfig.line.labels.offsetY * 3)"
                                text-anchor="middle"
                                :font-size="fontSizes.plotLabels"
                                :fill="chartConfig.line.labels.color"
                            >
                                {{ canShowValue(plot.value) ? dataLabel({p:chartConfig.chart.labels.prefix, v: plot.value, s: chartConfig.chart.labels.suffix, r: chartConfig.line.labels.rounding}) : '' }}
                            </text>
                            <foreignObject
                                :data-cy="`xy-line-tag-start-${i}`"
                                v-if="plot && j === 0 && serie.useTag && serie.useTag === 'start'"
                                :x="plot.x"
                                :y="plot.y - 20"
                                :height="24"
                                width="150"
                                style="overflow: visible"
                            >
                                <div :style="`padding: 3px; background:${serie.color}${opacity[80]};color:${adaptColorToBackground(serie.color)};width:fit-content;font-size:${fontSizes.plotLabels}px;border-radius: 2px;`">
                                    {{ serie.name }}
                                </div>
                            </foreignObject>
                            <foreignObject
                                :data-cy="`xy-line-tag-end-${i}`"
                                v-if="plot && j === serie.plots.length - 1 && serie.useTag && serie.useTag === 'end'"
                                :x="plot.x - serie.name.length * (fontSizes.plotLabels / 2)"
                                :y="plot.y - 20"
                                :height="24"
                                width="150"
                                style="overflow: visible"
                            >
                                <div :style="`padding: 3px; background:${serie.color}${opacity[80]};color:${adaptColorToBackground(serie.color)};width:fit-content;font-size:${fontSizes.plotLabels}px;border-radius: 2px;`">
                                    {{ serie.name }}
                                </div>
                            </foreignObject>
                        </g>
                    </g>
                </g>

                <!-- HIGHLIGHT AREA -->
                <g v-if="hasHighlightArea">
                    <rect
                        data-cy="xy-highlight-area"
                        :x="drawingArea.left + (drawingArea.width / maxSeries) * (chartConfig.chart.highlightArea.from - (slicer.start))"
                        :y="drawingArea.top"
                        :height="drawingArea.height < 0 ? 10 : drawingArea.height"
                        :width="(drawingArea.width / maxSeries) * highlightAreaSpan < 0 ? 0.00001 : (drawingArea.width / maxSeries) * highlightAreaSpan"
                        :fill="`${chartConfig.chart.highlightArea.color}${opacity[chartConfig.chart.highlightArea.opacity]}`"
                    />
                    <foreignObject v-if="chartConfig.chart.highlightArea.caption.text"
                        :x="(drawingArea.left + (drawingArea.width / maxSeries) * (chartConfig.chart.highlightArea.from - (slicer.start))) - (chartConfig.chart.highlightArea.caption.width === 'auto' ? 0 : chartConfig.chart.highlightArea.caption.width / 2 - (drawingArea.width / maxSeries) * highlightAreaSpan / 2)"
                        :y="drawingArea.top + chartConfig.chart.highlightArea.caption.offsetY"
                        style="overflow:visible"
                        height="1"
                        :width="chartConfig.chart.highlightArea.caption.width === 'auto' ? (drawingArea.width / maxSeries) * highlightAreaSpan : chartConfig.chart.highlightArea.caption.width"
                        
                    >
                        <div :style="`padding:${chartConfig.chart.highlightArea.caption.padding}px;text-align:${chartConfig.chart.highlightArea.caption.textAlign};font-size:${chartConfig.chart.highlightArea.caption.fontSize}px;color:${chartConfig.chart.highlightArea.caption.color};font-weight:${chartConfig.chart.highlightArea.caption.bold ? 'bold' : 'normal'}`">
                            {{ chartConfig.chart.highlightArea.caption.text }}
                        </div>
                    </foreignObject>
                </g>

                <!-- LEFT & RIGHT PADDING COVERS -->
                <g>
                    <rect
                        :x="0"
                        :y="drawingArea.top"
                        :width="chartConfig.chart.padding.left - 1"
                        :height="drawingArea.height < 0 ? 10 : drawingArea.height"
                        :fill="chartConfig.chart.backgroundColor"
                    />
                    <rect
                        :x="drawingArea.right + 1"
                        :y="drawingArea.top"
                        :width="chartConfig.chart.padding.right"
                        :height="drawingArea.height < 0 ? 10 : drawingArea.height"
                        :fill="chartConfig.chart.backgroundColor"
                    />
                </g>

                <!-- SERIE NAME TAGS : LINES -->
                <g v-for="(serie, i) in lineSet" :key="`xLabel_line_${i}`" :class="`xLabel_line_${i}`" :style="`opacity:${selectedScale ? selectedScale === serie.id ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`">
                    <g v-for="(plot, j) in serie.plots" :key="`xLabel_line_${i}_${j}`">
                        <text 
                            v-if="plot && j === 0 && serie.showSerieName && serie.showSerieName === 'start'"
                            :x="plot.x - fontSizes.plotLabels"
                            :y="plot.y"
                            :font-size="fontSizes.plotLabels"
                            text-anchor="end"
                            :fill="serie.color"
                            v-html="createTSpans({
                                content: serie.name,
                                fontSize: fontSizes.plotLabels,
                                fill: serie.color,
                                x: plot.x - fontSizes.plotLabels,
                                y: plot.y,
                                maxWords: 2
                            })"
                        />
                        <text 
                            v-if="plot && j === serie.plots.length - 1 && serie.showSerieName && serie.showSerieName === 'end'"
                            :x="plot.x + fontSizes.plotLabels"
                            :y="plot.y"
                            :font-size="fontSizes.plotLabels"
                            text-anchor="start"
                            :fill="serie.color"
                            v-html="createTSpans({
                                content: serie.name,
                                fontSize: fontSizes.plotLabels,
                                fill: serie.color,
                                x: plot.x + fontSizes.plotLabels,
                                y: plot.y,
                                maxWords: 2
                            })"
                        />
                    </g>
                </g>

                <!-- SERIE NAME TAGS : PLOTS -->
                <g v-for="(serie, i) in plotSet" :key="`xLabel_plot_${i}`" :class="`xLabel_plot_${i}`" :style="`opacity:${selectedScale ? selectedScale === serie.id ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`">
                    <g v-for="(plot, j) in serie.plots" :key="`xLabel_plot_${i}_${j}`">
                        <text 
                            v-if="plot && j === 0 && serie.showSerieName && serie.showSerieName === 'start'"
                            :x="plot.x - fontSizes.plotLabels"
                            :y="plot.y"
                            :font-size="fontSizes.plotLabels"
                            text-anchor="end"
                            :fill="serie.color"
                            v-html="createTSpans({
                                content: serie.name,
                                fontSize: fontSizes.plotLabels,
                                fill: serie.color,
                                x: plot.x - fontSizes.plotLabels,
                                y: plot.y,
                                maxWords: 2
                            })"
                        />
                        <text
                            v-if="plot && j === serie.plots.length - 1 && serie.showSerieName && serie.showSerieName === 'end'"
                            :x="plot.x + fontSizes.plotLabels"
                            :y="plot.y"
                            :font-size="fontSizes.plotLabels"
                            text-anchor="start"
                            :fill="serie.color"
                            v-html="createTSpans({
                                content: serie.name,
                                fontSize: fontSizes.plotLabels,
                                fill: serie.color,
                                x: plot.x + fontSizes.plotLabels,
                                y: plot.y,
                                maxWords: 2
                            })"
                        />
                    </g>
                </g>

                <!-- Y LABELS -->
                <g v-if="chartConfig.chart.grid.labels.show">
                    <template v-if="mutableConfig.useIndividualScale">
                        <g v-for="el in allScales">
                            <line 
                                :x1="el.x"
                                :x2="el.x"
                                :y1="mutableConfig.isStacked ? (drawingArea.bottom - el.yOffset - el.individualHeight) : drawingArea.top"
                                :y2="mutableConfig.isStacked ? (drawingArea.bottom - el.yOffset) : drawingArea.bottom"
                                :stroke="el.color"
                                :stroke-width="chartConfig.chart.grid.stroke"
                                stroke-linecap="round"
                                :style="`opacity:${selectedScale ? selectedScale === el.id ? 1 : 0.3 : 1};transition:opacity 0.2s ease-in-out`"
                            />
                        </g>
                        <g v-for="el in allScales" :style="`opacity:${selectedScale ? selectedScale === el.id ? 1 : 0.3 : 1};transition:opacity 0.2s ease-in-out`">
                            <text
                                :fill="el.color"
                                :font-size="fontSizes.dataLabels"
                                text-anchor="middle"
                                :transform="`translate(${el.x - chartConfig.chart.grid.labels.yAxis.labelWidth + 5}, ${mutableConfig.isStacked ? drawingArea.bottom - el.yOffset - (el.individualHeight / 2) : drawingArea.top + drawingArea.height / 2}) rotate(-90)`"
                            >
                                {{ el.name }} {{ el.scaleLabel ? `- ${el.scaleLabel}` : '' }}
                            </text>
                            <line
                                v-for="(yLabel, j) in el.yLabels"
                                :x1="el.x - 3"
                                :x2="el.x"
                                :y1="yLabel.y"
                                :y2="yLabel.y"
                                :stroke="el.color"
                                :stroke-width="1"
                                stroke-linecap="round"
                            />
                            <text 
                                v-for="(yLabel, j) in el.yLabels"
                                :x="el.x - 5" 
                                :y="yLabel.y" 
                                :font-size="fontSizes.dataLabels" 
                                text-anchor="end"
                                :fill="el.color"
                            >
                                {{
                                    dataLabel({p:chartConfig.chart.labels.prefix, v: yLabel.value, s: chartConfig.chart.labels.suffix, r: 1})
                                }}
                            </text>
                        </g>
                    </template>
                    <template v-else>
                        <g v-for="(yLabel, i) in yLabels" :key="`yLabel_${i}`">
                            <line 
                                v-if="canShowValue(yLabel) && yLabel.value >= niceScale.min && yLabel.value <= niceScale.max"
                                :x1="drawingArea.left" 
                                :x2="drawingArea.left - 5" 
                                :y1="yLabel.y" 
                                :y2="yLabel.y" 
                                :stroke="chartConfig.chart.grid.stroke" 
                                stroke-width="1" 
                                stroke-linecap="round"
                            />
                            <text
                                :data-cy="`xy-label-y-${i}`"
                                v-if="yLabel.value >= niceScale.min && yLabel.value <= niceScale.max" 
                                :x="drawingArea.left - 7" 
                                :y="yLabel.y + fontSizes.dataLabels / 3" 
                                :font-size="fontSizes.dataLabels" 
                                text-anchor="end"
                                :fill="chartConfig.chart.grid.labels.color"
                            >
                                {{ canShowValue(yLabel.value) ? dataLabel({p:chartConfig.chart.labels.prefix, v: yLabel.value, s: chartConfig.chart.labels.suffix, r: 1}) : '' }}
                            </text>
                        </g>
                    </template>
                </g>

                <!-- Y LABELS MOUSE TRAPS -->
                <template v-if="mutableConfig.useIndividualScale && !mutableConfig.isStacked">
                    <rect 
                        v-for="trap in allScales"
                        :x="trap.x - chartConfig.chart.grid.labels.yAxis.labelWidth"
                        :y="drawingArea.top"
                        :width="chartConfig.chart.grid.labels.yAxis.labelWidth"
                        :height="drawingArea.height < 0 ? 10 : drawingArea.height"
                        :fill="selectedScale === trap.id ? `${trap.color}20` : 'transparent'"
                        @mouseenter="selectedScale = trap.id"
                        @mouseleave="selectedScale = null"
                    />
                </template>

                <!-- AXIS LABELS -->
                <g>
                    <text 
                        data-cy="xy-axis-yLabel" 
                        v-if="chartConfig.chart.grid.labels.axis.yLabel && ! mutableConfig.useIndividualScale" 
                        :font-size="fontSizes.yAxis" 
                        :fill="chartConfig.chart.grid.labels.color"
                        :transform="`translate(${fontSizes.yAxis + chartConfig.chart.grid.labels.axis.yLabelOffsetX}, ${drawingArea.top + drawingArea.height / 2}) rotate(-90)`"
                        text-anchor="middle" 
                        style="transition: none"
                    >
                        {{ chartConfig.chart.grid.labels.axis.yLabel }}
                    </text>
                    <text 
                        data-cy="xy-axis-xLabel"
                        v-if="chartConfig.chart.grid.labels.axis.xLabel" 
                        text-anchor="middle"
                        :x="width / 2"
                        :y="drawingArea.bottom + fontSizes.yAxis + (fontSizes.xAxis * 1.3) + chartConfig.chart.grid.labels.axis.xLabelOffsetY"
                        :font-size="fontSizes.yAxis"
                        :fill="chartConfig.chart.grid.labels.color"
                    >
                        {{ chartConfig.chart.grid.labels.axis.xLabel }}
                    </text>
                </g>
                
                <!-- TIME LABELS -->
                <g v-if="chartConfig.chart.grid.labels.xAxisLabels.show">
                    <g v-for="(label, i) in timeLabels" :key="`time_label_${i}`">
                        
                        <text
                            :data-cy="`xy-time-label-${i}`"
                            v-if="
                                (label && !chartConfig.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && !chartConfig.chart.grid.labels.xAxisLabels.showOnlyAtModulo) || 
                                (label && chartConfig.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && (i === 0 || i === timeLabels.length -1) && !chartConfig.chart.grid.labels.xAxisLabels.showOnlyAtModulo) || 
                                (label && chartConfig.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && selectedSerieIndex === i && !chartConfig.chart.grid.labels.xAxisLabels.showOnlyAtModulo) ||
                                (label && !chartConfig.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && chartConfig.chart.grid.labels.xAxisLabels.showOnlyAtModulo && (i % Math.floor((this.slicer.end - this.slicer.start) / chartConfig.chart.grid.labels.xAxisLabels.modulo) === 0))
                            "
                            :text-anchor="chartConfig.chart.grid.labels.xAxisLabels.rotation > 0 ? 'start' : chartConfig.chart.grid.labels.xAxisLabels.rotation < 0 ? 'end' : 'middle'"
                            :font-size="fontSizes.xAxis"
                            :fill="chartConfig.chart.grid.labels.xAxisLabels.color"
                            :transform="`translate(${drawingArea.left + (drawingArea.width / maxSeries) * i + (drawingArea.width / maxSeries / 2)}, ${drawingArea.bottom + fontSizes.xAxis * 1.3 + chartConfig.chart.grid.labels.xAxisLabels.yOffset}), rotate(${chartConfig.chart.grid.labels.xAxisLabels.rotation})`"
                        >
                            {{ label || "" }}
                        </text>
                    </g>
                </g>

                <!-- TOOLTIP TRAPS -->
                <g>
                    <g v-for="(_, i) in maxSeries" :key="`tooltip_trap_${i}`">
                        <rect
                            :data-cy="`xy-tooltip-trap-${i}`"
                            data-cy-trap
                            :x="drawingArea.left + (drawingArea.width / maxSeries) * i"
                            :y="drawingArea.top"
                            :height="drawingArea.height < 0 ? 10 : drawingArea.height"
                            :width="drawingArea.width / maxSeries < 0 ? 0.00001 : drawingArea.width / maxSeries"
                            :fill="selectedSerieIndex === i || selectedRowIndex === i ? `${chartConfig.chart.highlighter.color}${opacity[chartConfig.chart.highlighter.opacity]}` : 'transparent'"
                            @mouseenter="toggleTooltipVisibility(true, i)"
                            @mouseleave="toggleTooltipVisibility(false)"
                            @click="selectX(i)"
                        />
                    </g>
                </g>

                <g v-if="chartConfig.chart.highlighter.useLine && ![null, undefined].includes(selectedSerieIndex)">
                    <line
                        :x1="drawingArea.left + (drawingArea.width / maxSeries) * selectedSerieIndex + (drawingArea.width / maxSeries / 2)"
                        :x2="drawingArea.left + (drawingArea.width / maxSeries) * selectedSerieIndex + (drawingArea.width / maxSeries / 2)"
                        :y1="drawingArea.top"
                        :y2="drawingArea.bottom"
                        :stroke="chartConfig.chart.highlighter.color"
                        :stroke-width="chartConfig.chart.highlighter.lineWidth"
                        :stroke-dasharray="chartConfig.chart.highlighter.lineDasharray"
                        stroke-linecap="round"
                        style="transition:none !important; animation: none !important; pointer-events: none;"
                    />
                </g>

                <!-- TIME TAG -->
                <g v-if="chartConfig.chart.timeTag.show && ![null, undefined].includes(selectedSerieIndex)">
                    <foreignObject
                        :x="drawingArea.left + (drawingArea.width / maxSeries) * selectedSerieIndex - 100 + (drawingArea.width / maxSeries / 2)"
                        :y="drawingArea.bottom"
                        width="200"
                        height="40"
                        style="overflow: visible !important;"
                    >
                        <div class="vue-ui-xy-time-tag" :style="`width: fit-content;margin: 0 auto;text-align:center;padding:3px 12px;background:${chartConfig.chart.timeTag.backgroundColor};color:${chartConfig.chart.timeTag.color};font-size:${chartConfig.chart.timeTag.fontSize}px`">
                            {{ timeLabels[selectedSerieIndex] || selectedSerieIndex }}
                        </div>
                    </foreignObject>
                    <circle
                        :cx="drawingArea.left + (drawingArea.width / maxSeries) * selectedSerieIndex + (drawingArea.width / maxSeries / 2)"
                        :cy="drawingArea.bottom"
                        :r="chartConfig.chart.timeTag.circleMarker.radius"
                        :fill="chartConfig.chart.timeTag.circleMarker.color"
                    />
                </g>
            </g>

            <slot name="svg" :svg="svg"/>
        </svg>

        <Skeleton 
            v-if="!isDataset"
            :config="{
                type: 'line',
                style: {
                    backgroundColor: chartConfig.chart.backgroundColor,
                    line: {
                        axis: {
                            color: chartConfig.chart.grid.stroke,
                        },
                        path: {
                            color: chartConfig.chart.grid.stroke,
                            strokeWidth: 0.5
                        }
                    }
                }
            }"
        />

        <Slicer
            ref="chartSlicer"
            v-if="chartConfig.chart.zoom.show && maxX > 6 && isDataset"
            :key="`slicer_${slicerStep}`"
            :background="chartConfig.chart.zoom.color"
            :fontSize="chartConfig.chart.zoom.fontSize"
            :useResetSlot="chartConfig.chart.zoom.useResetSlot"
            :labelLeft="chartConfig.chart.grid.labels.xAxisLabels.values[slicer.start]"
            :labelRight="chartConfig.chart.grid.labels.xAxisLabels.values[slicer.end-1]"
            :textColor="chartConfig.chart.color"
            :inputColor="chartConfig.chart.zoom.color"
            :selectColor="chartConfig.chart.zoom.highlightColor"
            :borderColor="chartConfig.chart.backgroundColor"
            :max="maxX"
            :min="0"
            :valueStart="slicer.start"
            :valueEnd="slicer.end"
            v-model:start="slicer.start"
            v-model:end="slicer.end"
            @reset="refreshSlicer"
        >
            <template #reset-action="{ reset }">
                <slot name="reset-action" v-bind="{ reset }"/>
            </template>
        </Slicer>

        <!-- LEGEND AS OUTSIDE DIV -->
        <div ref="chartLegend" data-cy="xy-div-legend" v-if="chartConfig.chart.legend.show" class="vue-ui-xy-legend" :style="`font-size:${chartConfig.chart.legend.fontSize}px`">
            <div v-for="(legendItem, i) in absoluteDataset" :data-cy="`xy-div-legend-item-${i}`" :key="`div_legend_item_${i}`" @click="segregate(legendItem)" :class="{'vue-ui-xy-legend-item': true, 'vue-ui-xy-legend-item-segregated' : segregatedSeries.includes(legendItem.id)}">
                <svg v-if="icons[legendItem.type] === 'line'" viewBox="0 0 20 12" height="14" width="20">
                        <rect x="0" y="7" rx="3" stroke="none" height="4" width="20" :fill="legendItem.color" />
                        <Shape
                            :plot="{x: 10, y:9}"
                            :radius="4"
                            :color="legendItem.color"
                            :shape="['triangle', 'square', 'diamond', 'pentagon', 'hexagon', 'star'].includes(legendItem.shape) ? legendItem.shape : 'circle'"
                            :stroke="chartConfig.chart.backgroundColor"
                            :strokeWidth="1"
                        />
                </svg>
                <svg v-else viewBox="0 0 12 12" height="14" width="14">
                    <rect v-if="icons[legendItem.type] === 'bar'" x="0" y="0" rx="1" height="12" width="12" stroke="none" :fill="legendItem.color" />
                    <Shape v-else
                        :plot="{x: 6, y:6}"
                        :radius="5"
                        :color="legendItem.color"
                        :shape="['triangle', 'square', 'diamond', 'pentagon', 'hexagon', 'star'].includes(legendItem.shape) ? legendItem.shape : 'circle'"
                    />
                </svg>
                <span :style="`color:${chartConfig.chart.legend.color}`">{{legendItem.name}}</span>
            </div>
        </div>

        <div v-else ref="chartLegend">
            <slot name="legend" v-bind:legend="absoluteDataset"/>
        </div>


        <!-- TOOLTIP -->
        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="chartConfig.chart.tooltip.backgroundColor"
            :color="chartConfig.chart.tooltip.color"
            :fontSize="chartConfig.chart.tooltip.fontSize"
            :borderRadius="chartConfig.chart.tooltip.borderRadius"
            :borderColor="chartConfig.chart.tooltip.borderColor"
            :borderWidth="chartConfig.chart.tooltip.borderWidth"
            :parent="$refs.chart"
            :content="tooltipContent"
            :isCustom="chartConfig.chart.tooltip.customFormat && typeof chartConfig.chart.tooltip.customFormat === 'function'"
            >
                <template #tooltip-before>
                    <slot name="tooltip-before" v-bind="{...dataTooltipSlot}"></slot>
                </template>
                <template #tooltip-after>
                    <slot name="tooltip-after" v-bind="{...dataTooltipSlot}"></slot>
                </template>
            </Tooltip>

        <!-- DATA TABLE -->
        <Accordion hideDetails v-if="isDataset" :config="{
            open: mutableConfig.showTable,
            maxHeight: 10000,
            body: {
                backgroundColor: chartConfig.chart.backgroundColor,
                color: chartConfig.chart.color
            },
            head: {
                backgroundColor: chartConfig.chart.backgroundColor,
                color: chartConfig.chart.color
            }
        }">
            <template #content>
                <div :style="`${isPrinting ? '' : 'max-height:400px'};overflow:auto;width:100%;margin-top:48px`">
                    <div style="display: flex; flex-direction:row; gap: 6px; align-items:center; padding-left: 6px" data-html2canvas-ignore>
                        <input type="checkbox" v-model="showSparklineTable">
                        <div @click="showSparklineTable = !showSparklineTable" style="cursor: pointer">
                            <BaseIcon name="chartLine" :size="20" :stroke="chartConfig.chart.color"/>
                        </div>
                    </div>
                    <TableSparkline v-if="showSparklineTable" :key="`sparkline_${segregateStep}`" :dataset="tableSparklineDataset" :config="tableSparklineConfig"/>
                    <DataTable 
                        v-else
                        :colNames="dataTable.colNames"
                        :head="dataTable.head"
                        :body="dataTable.body"
                        :config="dataTable.config"
                        :title="`${chartConfig.chart.title.text}${chartConfig.chart.title.subtitle.text ? ` : ${chartConfig.chart.title.subtitle.text}` : ''}`"
                        @close="mutableConfig.showTable = false"
                    >
                        <template #th="{ th }">
                            <div v-html="th"/>
                        </template>
                        <template #td="{ td }">
                            {{ td }}
                        </template>
                    </DataTable>
                </div>
            </template>
        </Accordion>
    </div>
</template>

<script>
import pdf from '../pdf';
import img from "../img";
import { useMouse } from '../useMouse';
import { 
    abbreviate,
    adaptColorToBackground,
    assignStackRatios,
    calcLinearProgression,
    calculateNiceScale,
    checkNaN, 
    closestDecimal,
    convertColorToHex, 
    convertConfigColors,
    convertCustomPalette,
    createCsvContent,
    createPolygonPath,
    createSmoothPath,
    createStar,
    createTSpans,
    createUid,
    dataLabel,
    downloadCsv,
    functionReturnsString,
    isFunction,
    isSafeValue, 
    opacity, 
    palette, 
    shiftHue, 
    treeShake,
    error,
    objectIsEmpty,
    themePalettes,
    translateSize
} from '../lib';
import { useNestedProp } from '../useNestedProp';
import mainConfig from "../default_configs.json";
import themes from "../themes.json";
import DataTable from "../atoms/DataTable.vue";
import Title from '../atoms/Title.vue';
import Tooltip from "../atoms/Tooltip.vue";
import UserOptions from "../atoms/UserOptions.vue";
import Shape from "../atoms/Shape.vue";
import BaseIcon from '../atoms/BaseIcon.vue';
import TableSparkline from "./vue-ui-table-sparkline.vue";
import Skeleton from "./vue-ui-skeleton.vue";
import Slicer from '../atoms/Slicer.vue';
import Accordion from "./vue-ui-accordion.vue";

const sliderId = createUid();

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
    DataTable,
    Shape,
    Title,
    Tooltip,
    UserOptions,
    BaseIcon,
    TableSparkline,
    Skeleton,
    Slicer,
    Accordion
},
    data(){
        this.dataset.forEach((ds, i) => {
            if([null, undefined].includes(ds.series)) {
                this.error({
                    componentName: 'VueUiXy',
                    type: 'datasetSerieAttribute',
                    property: 'series (number[])',
                    index: i
                })
            }
        })
        const maxX = Math.max(...this.dataset.map(datapoint => datapoint.series.length));
        const slicer = {
            start: 0,
            end: maxX,
        }

        return {
            themePalettes,
            themes,
            slicerStep: 0,
            selectedScale: null,
            CTX: null,
            CANVAS: null,
            opacity,
            useSafeValues: true,
            palette,
            defaultConfig: mainConfig.vue_ui_xy,
            height: 600,
            width: 1000,
            viewBox: `0 0 1000 600`,
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
            isFullscreen: false,
            isPrinting: false,
            isImaging: false,
            isTooltip: false,
            mutableConfig: {
                dataLabels: {
                    show: true,
                },
                showTooltip: true,
                showTable: false,
                isStacked: false,
                useIndividualScale: false
            },
            selectedSerieIndex: null,
            selectedRowIndex: null,
            segregatedSeries: [],
            uniqueId: createUid(),
            step: 0,
            slicer,
            __to__: null,
            maxX,
            showSparklineTable: true,
            segregateStep: 0,
            sliderId,
            fontSizes: {
                xAxis: 18,
                yAxis: 12,
                dataLabels: 20,
                plotLabels: 10
            },
            plotRadii: {
                plot: 3,
                line: 3
            }
        }
    },
    computed: {
        customPalette() {
            return this.convertCustomPalette(this.chartConfig.customPalette);
        },
        backgroundColor() {
            return this.chartConfig.chart.backgroundColor;
        },  
        slicerColor() {
            return this.chartConfig.chart.zoom.color;
        },
        allScales() {
            const lines = this.lineSet.map(l => {
                return {
                    name: l.name,
                    color: l.color,
                    scale: l.individualScale,
                    scaleYLabels: l.scaleYLabels,
                    zero: l.zeroPosition,
                    max: l.individualMax,
                    scaleLabel: l.scaleLabel || "",
                    id: l.id,
                    yOffset: l.yOffset || 0,
                    individualHeight: l.individualHeight || this.drawingArea.height,
                    autoScaleYLabels: l.autoScaleYLabels
                }
            });
            const bars = this.barSet.map(b => {
                return {
                    name: b.name,
                    color: b.color,
                    scale: b.individualScale,
                    scaleYLabels: b.scaleYLabels,
                    zero: b.zeroPosition,
                    max: b.individualMax,
                    scaleLabel: b.scaleLabel || "",
                    id: b.id,
                    yOffset: b.yOffset || 0,
                    individualHeight: b.individualHeight || this.drawingArea.height
                }
            });
            const plots = this.plotSet.map(p => {
                return {
                    name: p.name,
                    color: p.color,
                    scale: p.individualScale,
                    scaleYLabels: p.scaleYLabels, // FIX
                    zero: p.zeroPosition,
                    max: p.individualMax,
                    scaleLabel: p.scaleLabel || "",
                    id: p.id,
                    yOffset: p.yOffset || 0,
                    individualHeight: p.individualHeight || this.drawingArea.height
                }
            });
            const len = [...lines, ...bars, ...plots].flatMap(el => el).length;
            return [...lines, ...bars, ...plots].flatMap((el,i) => {
                return {
                    id: el.id,
                    scaleLabel: el.scaleLabel,
                    name: el.name,
                    color: el.color,
                    scale: el.scale,
                    yOffset: el.yOffset,
                    individualHeight: el.individualHeight,
                    x: this.mutableConfig.isStacked ? this.drawingArea.left : (this.drawingArea.left / len) * (i+1),
                    yLabels: el.scaleYLabels || el.scale.ticks.map(t => {
                        return {
                            y: t >= 0 ? el.zero - (el.individualHeight * (t / el.max)) : el.zero + (el.individualHeight * Math.abs(t) / el.max),
                            value: t
                        }
                    })
                }
            })
        },
        isDataset() {
            return !!this.dataset && this.dataset.length;
        },
        chartFont() {
            const wrapper = document.getElementById(`vue-ui-xy_${this.uniqueId}`);
            return window.getComputedStyle(wrapper, null).getPropertyValue("font-family");
        },
        chartConfig: {
            get: function() {
                if(!Object.keys(this.config || {}).length) {
                    return this.defaultConfig
                }

                const mergedConfig = this.useNestedProp({
                    userConfig: this.config,
                    defaultConfig: this.defaultConfig
                });

                if (mergedConfig.theme) {
                    return {
                        ...useNestedProp({
                            userConfig: this.themes.vue_ui_xy[mergedConfig.theme] || this.config,
                            defaultConfig: mergedConfig
                        }),
                        customPalette: this.themePalettes[mergedConfig.theme] || this.palette
                    }
                } else {
                    return mergedConfig
                }
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
            if (from === to) return 1;
            if (to < from) return 0;
            return to - from + 1;
        },
        relativeZero() {
            if(this.niceScale.min >= 0) return 0;
            return Math.abs(this.niceScale.min);
        },
        absoluteMax() {
            return this.niceScale.max + this.relativeZero;
        },
        safeDataset(){
            if(!this.useSafeValues) return this.dataset;
            return this.dataset.map((datapoint, i) => {
                return {
                    ...datapoint,
                    series: datapoint.series.map(d => {
                        return this.isSafeValue(d) ? d : null
                    }).slice(this.slicer.start, this.slicer.end),
                    color: this.convertColorToHex(datapoint.color ? datapoint.color : this.customPalette[i] ? this.customPalette[i] : this.palette[i]),
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
                }
            }).filter(s => !this.segregatedSeries.includes(s.id));
        },
        tableSparklineDataset() {
            return this.relativeDataset.map(ds => {
                const source = ds.absoluteValues.map(s => [undefined, null].includes(s) ? 0 : s);
                return {
                    id: ds.id,
                    name: ds.name,
                    color: ds.color,
                    values: this.fillArray(this.maxSeries, source)
                }
            })
        },
        tableSparklineConfig() {
            return {
                responsiveBreakpoint: this.chartConfig.table.responsiveBreakpoint,
                roundingValues: this.chartConfig.table.rounding,
                showAverage: false,
                showMedian: false,
                showTotal: false,
                fontFamily: this.chartConfig.chart.fontFamily,
                colNames: this.chartConfig.chart.grid.labels.xAxisLabels.values,
                thead: {
                    backgroundColor: this.chartConfig.table.th.backgroundColor,
                    color: this.chartConfig.table.th.color,
                    outline: this.chartConfig.table.th.outline
                },
                tbody: {
                    backgroundColor: this.chartConfig.table.td.backgroundColor,
                    color: this.chartConfig.table.td.color,
                    outline: this.chartConfig.table.td.outline
                },
                userOptions: {
                    show: false
                }
            }
        },
        absoluteDataset() {
            return this.safeDataset.map((datapoint, i) => {
                return {
                    absoluteIndex: i,
                    ...datapoint,
                    series: datapoint.series.map(plot => plot + this.relativeZero),
                    absoluteValues: datapoint.series,
                    segregate: () => this.segregate(datapoint),
                    isSegregated: this.segregatedSeries.includes(datapoint.id)
                }
            })
        },
        barSet() {
            return this.activeSeriesWithStackRatios.filter(s => s.type === 'bar').map((datapoint, i) => {
                this.checkAutoScaleError(datapoint);
                const min = Math.min(...datapoint.absoluteValues.filter(v => ![null, undefined].includes(v)));
                const max = Math.max(...datapoint.absoluteValues.filter(v => ![null, undefined].includes(v)));
                const autoScaledRatios = datapoint.absoluteValues.filter(v => ![null, undefined].includes(v)).map(v => {
                    return (v - min) / (max - min)
                });

                const autoScale = {
                    ratios: autoScaledRatios,
                    valueMin: min,
                    valueMax: max < 0 ? 0 : max,
                }

                const individualExtremes = {
                    max: datapoint.scaleMax || Math.max(...datapoint.absoluteValues) || 1,
                    min: datapoint.scaleMin || Math.min(...datapoint.absoluteValues.filter(v => ![undefined,null].includes(v))) > 0 ? 0 : Math.min(...datapoint.absoluteValues.filter(v => ![null, undefined].includes(v)))
                };
                const scaleSteps = datapoint.scaleSteps || this.chartConfig.chart.grid.labels.yAxis.commonScaleSteps;
                
                const individualScale = this.calculateNiceScale(individualExtremes.min, individualExtremes.max, scaleSteps);
                const autoScaleSteps = this.calculateNiceScale(autoScale.valueMin, autoScale.valueMax, scaleSteps);

                const individualZero = individualScale.min >= 0 ? 0 : Math.abs(individualScale.min);
                const autoScaleZero = 0;

                const individualMax = individualScale.max + individualZero;
                const autoScaleMax = autoScaleSteps.max + Math.abs(autoScaleZero);

                const yOffset = this.mutableConfig.isStacked ? (this.drawingArea.height * (1 - datapoint.cumulatedStackRatio)) : 0;

                const individualHeight = this.mutableConfig.isStacked ? (this.drawingArea.height * datapoint.stackRatio) - this.chartConfig.chart.grid.labels.yAxis.gap : this.drawingArea.height;

                const zeroPosition = this.drawingArea.bottom - yOffset - ((individualHeight) * individualZero / individualMax);
                const autoScaleZeroPosition = this.drawingArea.bottom - yOffset - (individualHeight * autoScaleZero / autoScaleMax);

                const barLen = this.absoluteDataset.filter(ds => ds.type === 'bar').filter(s => !this.segregatedSeries.includes(s.id)).length;

                const plots = datapoint.series.map((plot, j) => {
                    const yRatio = this.mutableConfig.useIndividualScale ? ((datapoint.absoluteValues[j] + individualZero) / individualMax) : this.ratioToMax(plot)
                    const x = this.mutableConfig.useIndividualScale && this.mutableConfig.isStacked 
                        ? this.drawingArea.left + (this.drawingArea.width / this.maxSeries * j) 
                        // : (this.drawingArea.left - this.slot.bar / 2 + (this.slot.bar) * i) + ((this.slot.bar) * j * this.absoluteDataset.filter(ds => ds.type === 'bar').filter(s => !this.segregatedSeries.includes(s.id)).length);
                        : this.drawingArea.left
                            + (this.slot.bar * i)
                            + (this.slot.bar * j * barLen)
                            - (this.barSlot / 2)
                            - (i * this.barPeriodGap)


                    return {
                        yOffset,
                        individualHeight,
                        x,
                        y: this.drawingArea.bottom - yOffset - (individualHeight * yRatio),
                        value: datapoint.absoluteValues[j],
                        zeroPosition,
                        individualMax,
                        comment: datapoint.comments ? datapoint.comments.slice(this.slicer.start, this.slicer.end)[j] || '' : ''
                    }
                });

                const autoScaleRatiosToNiceScale = datapoint.absoluteValues.map(v => {
                    if(autoScaleSteps.min >= 0) {
                        return (v - Math.abs(autoScaleSteps.min)) / (autoScaleSteps.max - Math.abs(autoScaleSteps.min))
                    } else {
                        return (v + Math.abs(autoScaleSteps.min)) / (autoScaleSteps.max + Math.abs(autoScaleSteps.min))
                    }
                })

                const autoScalePlots = datapoint.series.map((_, j) => {
                    const x = this.mutableConfig.useIndividualScale && this.mutableConfig.isStacked 
                        ? this.drawingArea.left + (this.drawingArea.width / this.maxSeries * j) 
                        : (this.drawingArea.left - this.slot.bar/2 + this.slot.bar * i) + (this.slot.bar * j * this.absoluteDataset.filter(ds => ds.type === 'bar').filter(s => !this.segregatedSeries.includes(s.id)).length);
                    return {
                        yOffset,
                        individualHeight,
                        x,
                        y: this.drawingArea.bottom - yOffset - ((individualHeight * autoScaleRatiosToNiceScale[j]) || 0),
                        value: datapoint.absoluteValues[j],
                        zeroPosition,
                        individualMax,
                        comment: datapoint.comments ? datapoint.comments.slice(this.slicer.start, this.slicer.end)[j] || '' : ''
                    }
                });

                const scaleYLabels = individualScale.ticks.map(t => {
                    return {
                        y: t >= 0 ? zeroPosition - (individualHeight * (t / individualMax)) : zeroPosition + (individualHeight * Math.abs(t) / individualMax),
                        value: t
                    }
                })

                const autoScaleYLabels = autoScaleSteps.ticks.map(t => {
                    const v = (t - autoScaleSteps.min) / (autoScaleSteps.max - autoScaleSteps.min);
                    return {
                        y: t >= 0 ? autoScaleZeroPosition - (individualHeight * v) : autoScaleZeroPosition + (individualHeight * v),
                        value: t
                    }
                });

                return {
                    ...datapoint,
                    yOffset,
                    autoScaleYLabels,
                    individualHeight,
                    scaleYLabels: datapoint.autoScaling ? autoScaleYLabels : scaleYLabels,
                    individualScale: datapoint.autoScaling ? autoScaleSteps : individualScale,
                    individualMax: datapoint.autoScaling ? autoScaleMax : individualMax,
                    zeroPosition: datapoint.autoScaling ? autoScaleZeroPosition : zeroPosition,
                    plots: datapoint.autoScaling ? autoScalePlots: plots
                }
            })
        },
        activeSeriesLength() {
            return this.absoluteDataset.length
        },
        activeSeriesWithStackRatios() {
            return this.assignStackRatios(this.absoluteDataset.filter(ds => !this.segregatedSeries.includes(ds.id)))
        },
        lineSet() {
            return this.activeSeriesWithStackRatios.filter(s => s.type === 'line').map((datapoint) => {
                this.checkAutoScaleError(datapoint);

                const min = Math.min(...datapoint.absoluteValues.filter(v => ![undefined, null].includes(v)));
                const max = Math.max(...datapoint.absoluteValues.filter(v => ![undefined, null].includes(v))) || 1;
                const autoScaledRatios = datapoint.absoluteValues.filter(v => ![null, undefined].includes(v)).map(v => {
                    return (v - min) / (max - min)
                });
                const autoScale = {
                    ratios: autoScaledRatios,
                    valueMin: min,
                    valueMax: max,
                }

                const individualExtremes = {
                    max: datapoint.scaleMax || Math.max(...datapoint.absoluteValues) || 1,
                    min: datapoint.scaleMin || (Math.min(...datapoint.absoluteValues) > 0 ? 0 : Math.min(...datapoint.absoluteValues))
                };

                const scaleSteps = datapoint.scaleSteps || this.chartConfig.chart.grid.labels.yAxis.commonScaleSteps

                const individualScale = this.calculateNiceScale(individualExtremes.min, individualExtremes.max, scaleSteps);
                
                const autoScaleSteps = this.calculateNiceScale(autoScale.valueMin, autoScale.valueMax, scaleSteps);

                const individualZero = (individualScale.min >= 0 ? 0 : Math.abs(individualScale.min));
                const autoScaleZero = 0;

                const individualMax = individualScale.max + Math.abs(individualZero);
                const autoScaleMax = autoScaleSteps.max + Math.abs(autoScaleZero);

                const yOffset = this.mutableConfig.isStacked ? (this.drawingArea.height * (1 - datapoint.cumulatedStackRatio)) : 0;

                const individualHeight = this.mutableConfig.isStacked ? (this.drawingArea.height * datapoint.stackRatio) - this.chartConfig.chart.grid.labels.yAxis.gap : this.drawingArea.height;
                
                const zeroPosition = this.drawingArea.bottom - yOffset - ((individualHeight) * individualZero / individualMax);

                const autoScaleZeroPosition = this.drawingArea.bottom - yOffset - (individualHeight * autoScaleZero / autoScaleMax);

                const plots = datapoint.series.map((plot, j) => {
                    const yRatio = this.mutableConfig.useIndividualScale 
                        ? ((datapoint.absoluteValues[j] + Math.abs(individualZero)) / individualMax) 
                        : this.ratioToMax(plot)

                    return {
                        x: (this.drawingArea.left + (this.slot.line/2)) + (this.slot.line * j),
                        y: this.drawingArea.bottom - yOffset - (individualHeight * yRatio),
                        value: datapoint.absoluteValues[j],
                        comment: datapoint.comments ? datapoint.comments.slice(this.slicer.start, this.slicer.end)[j] || '' : ''
                    }
                });

                const autoScaleRatiosToNiceScale = datapoint.absoluteValues.map(v => {
                    if(autoScaleSteps.min >= 0) {
                        return (v - Math.abs(autoScaleSteps.min)) / (autoScaleSteps.max - Math.abs(autoScaleSteps.min))
                    } else {
                        return (v + Math.abs(autoScaleSteps.min)) / (autoScaleSteps.max + Math.abs(autoScaleSteps.min))
                    }
                })

                const autoScalePlots = datapoint.series.map((plot, j) => {
                    if(![undefined, null].includes(datapoint.absoluteValues[j])) {
                        return {
                            x: (this.drawingArea.left + (this.slot.line/2)) + (this.slot.line * j),
                            y: this.drawingArea.bottom - yOffset - ((individualHeight * autoScaleRatiosToNiceScale[j]) || 0),
                            value: datapoint.absoluteValues[j],
                            comment: datapoint.comments ? datapoint.comments.slice(this.slicer.start, this.slicer.end)[j] || '' : ''
                        }
                    }
                })
                const curve = this.createSmoothPath(plots);
                const autoScaleCurve = this.createSmoothPath(autoScalePlots);

                const scaleYLabels = individualScale.ticks.map(t => {
                    return {
                        y: t >= 0 ? zeroPosition - (individualHeight * (t / individualMax)) : zeroPosition + (individualHeight * Math.abs(t) / individualMax),
                        value: t
                    }
                })

                const autoScaleYLabels = autoScaleSteps.ticks.map(t => {
                    const v = (t - autoScaleSteps.min) / (autoScaleSteps.max - autoScaleSteps.min);
                    return {
                        y: t >= 0 ? autoScaleZeroPosition - (individualHeight * v) : autoScaleZeroPosition + (individualHeight * v),
                        value: t
                    }
                });

                return {
                    ...datapoint,
                    yOffset,
                    autoScaleYLabels,
                    individualHeight,
                    scaleYLabels: datapoint.autoScaling ? autoScaleYLabels : scaleYLabels,
                    individualScale: datapoint.autoScaling ? autoScaleSteps : individualScale,
                    individualMax: datapoint.autoScaling ? autoScaleMax : individualMax,
                    zeroPosition: datapoint.autoScaling ? autoScaleZeroPosition : zeroPosition,
                    curve: datapoint.autoScaling ? autoScaleCurve : curve,
                    plots: datapoint.autoScaling ? autoScalePlots : plots,
                    area: !datapoint.useArea ? '' : this.mutableConfig.useIndividualScale ? this.createIndividualArea(datapoint.autoScaling ? autoScalePlots: plots, datapoint.autoScaling ? autoScaleZeroPosition : zeroPosition) :  this.createArea(plots)
                }
            })
        },
        plotSet() {
            return this.activeSeriesWithStackRatios.filter(s => s.type === 'plot').map((datapoint) => {
                this.checkAutoScaleError(datapoint);
                const min = Math.min(...datapoint.absoluteValues.filter(v => ![null, undefined].includes(v)));
                const max = Math.max(...datapoint.absoluteValues.filter(v => ![null, undefined].includes(v))) || 1;
                const autoScaledRatios = datapoint.absoluteValues.filter(v => ![null, undefined].includes(v)).map(v => {
                    return (v - min) / (max - min)
                });

                const autoScale = {
                    ratios: autoScaledRatios,
                    valueMin: min,
                    valueMax: max,
                }

                const individualExtremes = {
                    max: datapoint.scaleMax || Math.max(...datapoint.absoluteValues) || 1,
                    min: datapoint.scaleMin || Math.min(...datapoint.absoluteValues) > 0 ? 0 : Math.min(...datapoint.absoluteValues)
                };

                const scaleSteps = datapoint.scaleSteps || this.chartConfig.chart.grid.labels.yAxis.commonScaleSteps
                const individualScale = this.calculateNiceScale(individualExtremes.min, individualExtremes.max, scaleSteps)
                const autoScaleSteps = this.calculateNiceScale(autoScale.valueMin, autoScale.valueMax, scaleSteps);

                const individualZero = individualScale.min >= 0 ? 0 : Math.abs(individualScale.min);
                const autoScaleZero = 0;

                const individualMax = individualScale.max + individualZero;
                const autoScaleMax = autoScaleSteps.max + Math.abs(autoScaleZero);
                
                const yOffset = this.mutableConfig.isStacked ? (this.drawingArea.height * (1 - datapoint.cumulatedStackRatio)) : 0;

                const individualHeight = this.mutableConfig.isStacked ? (this.drawingArea.height * datapoint.stackRatio) - this.chartConfig.chart.grid.labels.yAxis.gap : this.drawingArea.height;

                const zeroPosition = this.drawingArea.bottom - yOffset - ((individualHeight) * individualZero / individualMax);
                const autoScaleZeroPosition = this.drawingArea.bottom - yOffset - (individualHeight * autoScaleZero / autoScaleMax);

                const plots = datapoint.series.map((plot, j) => {
                    const yRatio = this.mutableConfig.useIndividualScale ? ((datapoint.absoluteValues[j] + Math.abs(individualZero)) / individualMax) : this.ratioToMax(plot)
                    return {
                        x: (this.drawingArea.left + (this.slot.plot / 2)) + (this.slot.plot * j),
                        y: this.drawingArea.bottom - yOffset - (individualHeight * yRatio),
                        value: datapoint.absoluteValues[j],
                        comment: datapoint.comments ? datapoint.comments.slice(this.slicer.start, this.slicer.end)[j] || '' : ''
                    }
                })

                const autoScaleRatiosToNiceScale = datapoint.absoluteValues.map(v => {
                    if(autoScaleSteps.min >= 0) {
                        return (v - Math.abs(autoScaleSteps.min)) / (autoScaleSteps.max - Math.abs(autoScaleSteps.min))
                    } else {
                        return (v + Math.abs(autoScaleSteps.min)) / (autoScaleSteps.max + Math.abs(autoScaleSteps.min))
                    }
                })

                const autoScalePlots = datapoint.series.map((plot, j) => {
                    return {
                        x: (this.drawingArea.left + (this.slot.plot / 2)) + (this.slot.plot * j),
                        y: this.drawingArea.bottom - yOffset - ((individualHeight * autoScaleRatiosToNiceScale[j]) || 0),
                        value: datapoint.absoluteValues[j],
                        comment: datapoint.comments ? datapoint.comments.slice(this.slicer.start, this.slicer.end)[j] || '' : ''
                    }
                })

                const scaleYLabels = individualScale.ticks.map(t => {
                    return {
                        y: t >= 0 ? zeroPosition - (individualHeight * (t / individualMax)) : zeroPosition + (individualHeight * Math.abs(t) / individualMax),
                        value: t
                    }
                })

                const autoScaleYLabels = autoScaleSteps.ticks.map(t => {
                    const v = (t - autoScaleSteps.min) / (autoScaleSteps.max - autoScaleSteps.min);
                    return {
                        y: t >= 0 ? autoScaleZeroPosition - (individualHeight * v) : autoScaleZeroPosition + (individualHeight * v),
                        value: t
                    }
                });

                return {
                    ...datapoint,
                    yOffset,
                    autoScaleYLabels,
                    individualHeight,
                    scaleYLabels: datapoint.autoScaling ? autoScaleYLabels : scaleYLabels,
                    individualScale: datapoint.autoScaling ? autoScaleSteps : individualScale,
                    individualMax: datapoint.autoScaling ? autoScaleMax : individualMax,
                    zeroPosition: datapoint.autoScaling ? autoScaleZeroPosition : zeroPosition,
                    plots: datapoint.autoScaling ? autoScalePlots : plots
                }
            })
        },
        drawingArea() {
            const individualScalesPadding = this.mutableConfig.useIndividualScale && this.chartConfig.chart.grid.labels.show ? this.absoluteDataset.filter(s => !this.segregatedSeries.includes(s.id)).length * (this.mutableConfig.isStacked ? 0 : this.chartConfig.chart.grid.labels.yAxis.labelWidth) : 0;
            return {
                top: this.chartConfig.chart.padding.top,
                right: this.width - this.chartConfig.chart.padding.right,
                bottom: this.height - this.chartConfig.chart.padding.bottom,
                left: this.chartConfig.chart.padding.left + individualScalesPadding,
                height: this.height - (this.chartConfig.chart.padding.top + this.chartConfig.chart.padding.bottom),
                width: this.width - (this.chartConfig.chart.padding.right + this.chartConfig.chart.padding.left + individualScalesPadding)
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
        niceScale() {
            return this.calculateNiceScale(this.min, this.max < 0 ? 0 : this.max, this.chartConfig.chart.grid.labels.yAxis.commonScaleSteps)
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
        barSlot() {
            const len = this.safeDataset.filter(serie => serie.type === 'bar').filter(s => !this.segregatedSeries.includes(s.id)).length
            return (this.drawingArea.width) / this.maxSeries / len - (this.barPeriodGap * len)
        },
        barPeriodGap() {
            return this.slot.line * this.chartConfig.bar.periodGap;
        },
        maxSlot(){
            return Math.max(...Object.values(this.slot).filter(e => e !== Infinity))
        },
        table() {
            if(this.safeDataset.length === 0) return { head: [], body: [], config: {}, columnNames: []};

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
        dataTable() {
            const head = [''].concat(this.relativeDataset.map(ds => ds.name)).concat(` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`)

            let body = [];
            for(let i = 0; i < this.maxSeries; i += 1) {
                const sum = this.relativeDataset.map(ds => {
                    return ds.absoluteValues[i] ?? 0
                }).reduce((a, b) => a + b, 0)

                body.push([this.timeLabels[i] ?? '-'].concat(this.relativeDataset.map(ds => (ds.absoluteValues[i] ?? 0).toFixed(this.chartConfig.table.rounding))).concat((sum ?? 0).toFixed(this.chartConfig.table.rounding)))
            }

            const config = {
                th: {
                    backgroundColor: this.chartConfig.table.th.backgroundColor,
                    color: this.chartConfig.table.th.color,
                    outline: this.chartConfig.table.th.outline
                },
                td: {
                    backgroundColor: this.chartConfig.table.td.backgroundColor,
                    color: this.chartConfig.table.td.color,
                    outline: this.chartConfig.table.td.outline
                },
                breakpoint: this.chartConfig.table.responsiveBreakpoint
            }
            const colNames = [this.chartConfig.table.columnNames.period].concat(this.relativeDataset.map(ds => ds.name)).concat(this.chartConfig.table.columnNames.total)

            return { head, body, config, colNames}
        },
        dataTooltipSlot() {
            return {
                datapoint: this.selectedSeries,
                seriesIndex: this.selectedSerieIndex,
                series: this.absoluteDataset,
                bars: this.barSet,
                lines: this.lineSet,
                plots: this.plotSet,
                config: this.chartConfig 
            }
        },
        selectedSeries() {
            return this.relativeDataset.map(datapoint => {
                return {
                    shape: datapoint.shape || null,
                    name: datapoint.name,
                    color: datapoint.color,
                    type: datapoint.type,
                    value: datapoint.absoluteValues.find((_s,i) => i === this.selectedSerieIndex),
                    comments: datapoint.comments || []
                }
            });
        },  
        tooltipContent() {            
            let html = "";
            
            let sum = this.selectedSeries.map(s => s.value).filter(s => this.isSafeValue(s) && s !== null).reduce((a,b) => Math.abs(a) + Math.abs(b), 0);
            
            const time = this.timeLabels[this.selectedSerieIndex];
            const customFormat = this.chartConfig.chart.tooltip.customFormat;

            if(this.isFunction(customFormat) && this.functionReturnsString(() => customFormat({
                seriesIndex: this.selectedSerieIndex,
                datapoint: this.selectedSeries,
                series: this.absoluteDataset,
                bars: this.barSet,
                lines: this.lineSet,
                plots: this.plotSet,
                config: this.chartConfig
            }))) {
                return customFormat({
                    seriesIndex: this.selectedSerieIndex,
                    datapoint: this.selectedSeries,
                    series: this.absoluteDataset,
                    bars: this.barSet,
                    lines: this.lineSet,
                    plots: this.plotSet,
                    config: this.chartConfig
                })
            } else {
                if(time) {
                    html += `<div style="padding-bottom: 6px; margin-bottom: 4px; border-bottom: 1px solid ${this.chartConfig.chart.tooltip.borderColor}; width:100%">${time}</div>`;
                }
                this.selectedSeries.forEach(s => {
                    if(this.isSafeValue(s.value)) {
                        let shape = '';
                        let insideShape = '';
                        switch (this.icons[s.type]) {
                            case 'bar':
                                shape = `<svg viewBox="0 0 12 12" height="14" width="14"><rect x="0" y="0" rx="1" stroke="none" height="12" width="12" fill="${s.color}" /></svg>`;
                                break;
                            
                            case 'line':
                                if(!s.shape || !['star', 'triangle', 'square', 'diamond', 'pentagon', 'hexagon'].includes(s.shape)) {
                                    insideShape = `<circle cx="10" cy="8" r="4" stroke="${this.chartConfig.chart.tooltip.backgroundColor}" stroke-width="1" fill="${s.color}" />`
                                } else if(s.shape === 'triangle') {
                                    insideShape = `<path d="${createPolygonPath({ plot: { x: 10, y: 8}, radius: 4, sides: 3, rotation: 0.52}).path}" fill="${s.color}" stroke="${this.chartConfig.chart.tooltip.backgroundColor}" stroke-width="1" />`
                                } else if(s.shape === 'square') {
                                    insideShape = `<path d="${createPolygonPath({ plot: { x: 10, y: 8}, radius: 4, sides: 4, rotation: 0.8}).path}" fill="${s.color}" stroke="${this.chartConfig.chart.tooltip.backgroundColor}" stroke-width="1" />`
                                } else if(s.shape === 'diamond') {
                                    insideShape = `<path d="${createPolygonPath({ plot: { x: 10, y: 8}, radius: 4, sides: 4, rotation: 0}).path}" fill="${s.color}" stroke="${this.chartConfig.chart.tooltip.backgroundColor}" stroke-width="1" />`
                                } else if(s.shape === 'pentagon') {
                                    insideShape = `<path d="${createPolygonPath({ plot: { x: 10, y: 8}, radius: 4, sides: 5, rotation: 0.95}).path}" fill="${s.color}" stroke="${this.chartConfig.chart.tooltip.backgroundColor}" stroke-width="1" />`
                                } else if(s.shape === 'hexagon') {
                                    insideShape = `<path d="${createPolygonPath({ plot: { x: 10, y: 8}, radius: 4, sides: 6, rotation: 0}).path}" fill="${s.color}" stroke="${this.chartConfig.chart.tooltip.backgroundColor}" stroke-width="1" />`
                                } else if(s.shape === 'star') {
                                    insideShape = `<polygon stroke="${this.chartConfig.chart.tooltip.backgroundColor}" stroke-width="1" fill="${s.color}" points="${createStar({ plot: { x: 10, y: 8 }, radius: 4})}" />`
                                }
                                shape = `<svg viewBox="0 0 20 12" height="14" width="20"><rect rx="3" x="0" y="6" stroke="none" height="4" width="20" fill="${s.color}" />${insideShape}</svg>`;
                                break;
    
                            case 'plot':
                                if (!s.shape || !['star', 'triangle', 'square', 'diamond', 'pentagon', 'hexagon'].includes(s.shape)) {
                                    shape = `<svg viewBox="0 0 12 12" height="14" width="14"><circle cx="6" cy="6" r="6" stroke="${this.chartConfig.chart.tooltip.backgroundColor}" stroke-width="1" fill="${s.color}" /></svg>`;
                                    break;
                                }
                                if(s.shape === 'star') {
                                    shape = `<svg viewBox="0 0 12 12" height="14" width="14"><polygon stroke="${this.chartConfig.chart.tooltip.backgroundColor}" stroke-width="1" fill="${s.color}" points="${createStar({ plot: { x: 6, y: 6 }, radius: 5})}" /></svg>`;
                                    break;
                                }
                                if(s.shape === 'triangle') {
                                    shape = `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6}, radius: 6, sides: 3, rotation: 0.52}).path}" fill="${s.color}" stroke="${this.chartConfig.chart.tooltip.backgroundColor}" stroke-width="1" /></svg>`;
                                    break;
                                }
                                if(s.shape === 'square') {
                                    shape = `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6}, radius: 6, sides: 4, rotation: 0.8}).path}" fill="${s.color}" stroke="${this.chartConfig.chart.tooltip.backgroundColor}" stroke-width="1" /></svg>`;
                                    break;
                                }
                                if(s.shape === 'diamond') {
                                    shape = `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6}, radius: 5, sides: 4, rotation: 0}).path}" fill="${s.color}" stroke="${this.chartConfig.chart.tooltip.backgroundColor}" stroke-width="1" /></svg>`;
                                    break;
                                }
                                if(s.shape === 'pentagon') {
                                    shape = `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6}, radius: 5, sides: 5, rotation: 0.95}).path}" fill="${s.color}" stroke="${this.chartConfig.chart.tooltip.backgroundColor}" stroke-width="1" /></svg>`;
                                    break;
                                }
                                if(s.shape === 'hexagon') {
                                    shape = `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6}, radius: 5, sides: 6, rotation: 0}).path}" fill="${s.color}" stroke="${this.chartConfig.chart.tooltip.backgroundColor}" stroke-width="1" /></svg>`;
                                    break;
                                }
                            default:
                                break;
                        }
                        html += `<div style="display:flex;flex-direction:row; align-items:center;gap:3px;"><div style="width:20px">${shape}</div> ${s.name}: <b>${this.chartConfig.chart.tooltip.showValue ? this.dataLabel({p:this.chartConfig.chart.labels.prefix, v: s.value, s: this.chartConfig.chart.labels.suffix, r:this.chartConfig.chart.tooltip.roundingValue}) : ''}</b> ${this.chartConfig.chart.tooltip.showPercentage ? `(${(this.checkNaN(Math.abs(s.value) / sum * 100)).toFixed(this.chartConfig.chart.tooltip.roundingPercentage)}%)` : ''}</div>`;

                        if (this.chartConfig.chart.comments.showInTooltip && s.comments.length && s.comments.slice(this.slicer.start, this.slicer.end)[this.selectedSerieIndex]) {
                            html += `<div class="vue-data-ui-tooltip-comment" style="background:${s.color}20; padding: 6px; margin-bottom: 6px; border-left: 1px solid ${s.color}">${s.comments.slice(this.slicer.start, this.slicer.end)[this.selectedSerieIndex]}</div>`
                        }

                    }
                });
                return `<div style="border-radius:4px;padding:12px;font-variant-numeric: tabular-nums; background:${this.chartConfig.chart.tooltip.backgroundColor};color:${this.chartConfig.chart.tooltip.color}">${html}</div>`;
            }            
        },
        svg() {
            return {
                height: this.height,
                width: this.width
            }
        },
        yLabels() {
            return this.niceScale.ticks.map(t => {
                return {
                    y: t >= 0 ? this.zero - (this.drawingArea.height * this.ratioToMax(t)) : this.zero + (this.drawingArea.height * this.ratioToMax(Math.abs(t))),
                    value: t
                }
            })
        },
        zero(){
            return this.drawingArea.bottom - (this.drawingArea.height * this.ratioToMax(this.relativeZero));
        }
    },
    mounted() {
        if(this.objectIsEmpty(this.dataset)) {
            this.error({
                componentName: 'VueUiXy',
                type: 'dataset'
            })
        } else {
            this.dataset.forEach((ds, i) => {
                if([null, undefined].includes(ds.name)) {
                    this.error({
                        componentName: 'VueUiXy',
                        type: 'datasetSerieAttribute',
                        property: 'name (string)',
                        index: i
                    })
                }
            })
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
            showTooltip: this.chartConfig.chart.tooltip.show === true,
            showTable: this.chartConfig.showTable === true,
            isStacked: this.chartConfig.chart.grid.labels.yAxis.stacked,
            useIndividualScale: this.chartConfig.chart.grid.labels.yAxis.useIndividualScale
        }


        if (this.chartConfig.responsive) {
            const chart = this.$refs.chart;
            // Parent container (must have fixed height or max-height. Setting 100% will result in infinite height growth which looks aweful on top of being useless)
            const parent = chart.parentNode;
            const { height, width } = parent.getBoundingClientRect();

            // Title height to substract
            let title = null;
            let titleHeight = 0;
            if (this.chartConfig.chart.title.show) {
                title = this.$refs.chartTitle;
                titleHeight = title.getBoundingClientRect().height;
            }

            // Slicer height to substract
            let slicer = null;
            let slicerHeight = 0;
            if (this.chartConfig.chart.zoom.show && this.maxX > 6 && this.isDataset) {
                slicer = this.$refs.chartSlicer.$el;
                slicerHeight = slicer.getBoundingClientRect().height;
            }

            // Legend height to substract
            let legend = null;
            let legendHeight = 0
            if (this.chartConfig.chart.legend.show) {
                legend = this.$refs.chartLegend;
                legendHeight = legend.getBoundingClientRect().height;
            }

            this.height = height - titleHeight - legendHeight - slicerHeight;
            this.width = width;
            this.viewBox = `0 0 ${this.width < 0 ? 10 : this.width} ${this.height < 0 ? 10 : this.height}`;
            this.convertSizes();

            const resizeObserver = new ResizeObserver((entries) => {
                for(const entry of entries) {
                    if (title) {
                        titleHeight = title.getBoundingClientRect().height;
                    }
                    if (slicer) {
                        slicerHeight = slicer.getBoundingClientRect().height;
                    }
                    if (legend) {
                        legendHeight = legend.getBoundingClientRect().height;
                    }
                    this.height = entry.contentBoxSize[0].blockSize - titleHeight - legendHeight - slicerHeight - 24;
                    this.width = entry.contentBoxSize[0].inlineSize;
                    this.viewBox = `0 0 ${this.width < 0 ? 10 : this.width} ${this.height < 0 ? 10 : this.height}`;
                    this.convertSizes();
                }
            })

            resizeObserver.observe(parent);

        } else {
            this.height = this.chartConfig.chart.height;
            this.width = this.chartConfig.chart.width;
            this.viewBox = `0 0 ${this.width} ${this.height}`;
            this.fontSizes.dataLabels = this.chartConfig.chart.grid.labels.fontSize;
            this.fontSizes.yAxis = this.chartConfig.chart.grid.labels.axis.fontSize;
            this.fontSizes.xAxis =  this.chartConfig.chart.grid.labels.xAxisLabels.fontSize;
            this.fontSizes.plotLabels = this.chartConfig.chart.labels.fontSize;
            this.plotRadii.plot = this.chartConfig.plot.radius;
            this.plotRadii.line = this.chartConfig.line.radius;
        }
    },
    methods: {
        abbreviate,
        assignStackRatios,
        calculateNiceScale,
        checkNaN,
        createSmoothPath,
        isSafeValue,
        treeShake,
        shiftHue,
        pdf,
        img,
        convertColorToHex,
        convertConfigColors,
        convertCustomPalette,
        downloadCsv,
        createCsvContent,
        adaptColorToBackground,
        calcLinearProgression,
        useMouse,
        closestDecimal,
        dataLabel,
        isFunction,
        functionReturnsString,
        error,
        objectIsEmpty,
        createTSpans,
        useNestedProp,
        translateSize,
        convertSizes() {
            // Adaptative sizes in responsive mode
            this.fontSizes.dataLabels = this.translateSize({
                relator: this.height,
                adjuster: 400,
                source: this.chartConfig.chart.grid.labels.fontSize,
                threshold: 10,
                fallback: 10
            });
            this.fontSizes.yAxis = this.translateSize({
                relator: this.width,
                adjuster: 1000,
                source: this.chartConfig.chart.grid.labels.axis.fontSize,
                threshold: 10,
                fallback: 10
            });
            this.fontSizes.xAxis = this.translateSize({
                relator: this.width,
                adjuster: 1000,
                source: this.chartConfig.chart.grid.labels.xAxisLabels.fontSize,
                threshold: 10,
                fallback: 10
            });
            this.fontSizes.plotLabels = this.translateSize({
                relator: this.width,
                adjuster: 800,
                source: this.chartConfig.chart.labels.fontSize,
                threshold: 10,
                fallback: 10
            });
            this.plotRadii.plot = this.translateSize({
                relator: this.width,
                adjuster: 800,
                source: this.chartConfig.plot.radius,
                threshold: 1,
                fallback: 1
            });
            this.plotRadii.line = this.translateSize({
                relator: this.width,
                adjuster: 800,
                source: this.chartConfig.line.radius,
                threshold: 1,
                fallback: 1
            })
        },
        toggleStack() {
            this.mutableConfig.isStacked = !this.mutableConfig.isStacked
            if (!this.mutableConfig.isStacked) {
                this.mutableConfig.useIndividualScale = this.chartConfig.chart.grid.labels.yAxis.useIndividualScale;
            } else {
                this.mutableConfig.useIndividualScale = true
            }
        },
        toggleTable() {
            this.mutableConfig.showTable = !this.mutableConfig.showTable;
        },
        toggleLabels() {
            this.mutableConfig.dataLabels.show = !this.mutableConfig.dataLabels.show;
        },
        toggleTooltip() {
            this.mutableConfig.showTooltip = !this.mutableConfig.showTooltip;
        },
        checkAutoScaleError(datapoint) {
            if (datapoint.autoScaling) {
                if (!this.chartConfig.chart.grid.labels.yAxis.useIndividualScale) {
                    console.warn(`VueUiXy (datapoint: ${datapoint.name}) : autoScaling only works when config.chart.grid.labels.yAxis.useIndividualScale is set to true`)
                }
                if (!this.chartConfig.chart.grid.labels.yAxis.stacked) {
                    console.warn(`VueUiXy (datapoint: ${datapoint.name}) : autoScaling only works when config.chart.grid.labels.yAxis.stacked is set to true`)
                }
            }
        },
        createArea(plots) {
            if(!plots[0]) return [-10,-10, '', -10, -10];
            const start = { x: plots[0].x, y: this.zero };
            const end = { x: plots.at(-1).x, y: this.zero };
            const path = [];
            plots.forEach(plot => {
                path.push(`${plot.x},${plot.y} `);
            });
            return [ start.x, start.y, ...path, end.x, end.y].toString();
        },
        createIndividualArea(plots, zero) {
            if(!plots[0]) return [-10,-10, '', -10, -10];
            const start = { x: plots[0] ? plots[0].x : Math.min(...plots.filter(p => !!p).map(p => p.x)), y: zero };
            const end = { x: plots.at(-1) ? plots.at(-1).x : Math.min(...plots.filter(p => !!p).map(p => p.x)), y: zero };
            const path = [];
            plots.filter(p => !!p).forEach(plot => {
                path.push(`${plot.x},${plot.y} `);
            });
            return [ start.x, start.y, ...path, end.x, end.y].toString();
        },
        createStar,
        createPolygonPath,
        /////////////////////////////// CANVAS /////////////////////////////////
        fillArray(len, source) {
            let res = Array(len).fill(0);
            for (let i = 0; i  < source.length && i < len; i += 1) {
                res[i] = source[i];
            }
            return res;
        },
        refreshSlicer() {
            this.slicer = {
                start: 0,
                end: Math.max(...this.dataset.map(datapoint => datapoint.series.length))
            }
            this.slicerStep += 1;
        },
        calcRectHeight(plot) {
            if(plot.value >= 0) {
                return this.zero - plot.y <= 0 ? 0.00001 : this.zero - plot.y;
            } else {
                return plot.y - this.zero <= 0 ? 0.00001 : plot.y - this.zero;
            }
        },
        calcIndividualHeight(plot) {
            if(plot.value >= 0) {
                return plot.zeroPosition - plot.y <= 0 ? 0.00001 : plot.zeroPosition - plot.y
            } else {
                return plot.y - plot.zeroPosition <= 0 ? 0.00001 : plot.zeroPosition - plot.y
            }
        },
        calcRectWidth() {
            if(this.mutableConfig.useIndividualScale && this.mutableConfig.isStacked) {
                return this.slot.line - ((this.drawingArea.width / this.maxSeries) * 0.1);
            }
            return this.slot.bar;
        },
        calcRectX(plot) {
            if (this.mutableConfig.useIndividualScale && this.mutableConfig.isStacked) {
                return plot.x + ((this.drawingArea.width / this.maxSeries) * 0.05)
            }
            return plot.x + (this.slot.bar / 2);
        },
        calcRectY(plot) {
            if(plot.value >= 0) return plot.y;
            return this.zero;
        },
        calcIndividualRectY(plot) {
            if(plot.value >= 0) return plot.y;
            return plot.zeroPosition;
        },  
        canShowValue(value) {
            return ![null, undefined, NaN].includes(value);
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
            this.segregateStep += 1;
        },
        toggleTooltipVisibility(show, selectedIndex = null) {
            this.isTooltip = show;
            if(show) {
                this.selectedSerieIndex = selectedIndex;
            }else{
                this.selectedSerieIndex = null;
            }
        },
        toggleFullscreen(state) {
            this.isFullscreen = state;
            this.step += 1;
        },
        showSpinnerPdf() {
            this.isPrinting = true;
        },
        generatePdf(){
            this.showSpinnerPdf();
            clearTimeout(this.__to__);
            this.__to__ = setTimeout(() => {
                this.pdf({
                    domElement: document.getElementById(`vue-ui-xy_${this.uniqueId}`),
                    fileName: this.chartConfig.chart.title.text || 'vue-ui-xy'
                }).finally(() => {
                    this.isPrinting = false;
                });
            }, 100)
        },
        generateCsv() {
            const title = [[this.chartConfig.chart.title.text], [this.chartConfig.chart.title.subtitle.text], [""]];
            const head = ["",...this.table.head.map(h => h.label)]
            const body = this.table.body
            const table = title.concat([head]).concat(body);
            const csvContent = this.createCsvContent(table);
            this.downloadCsv({ csvContent, title: this.chartConfig.chart.title.text || 'vue-ui-xy'})
        },
        showSpinnerImage() {
            this.isImaging = true;
        },
        generateImage() {
            this.showSpinnerImage();
            clearTimeout(this.__to__);
            this.__to__ = setTimeout(() => {
                this.img({
                    domElement: document.getElementById(`vue-ui-xy_${this.uniqueId}`),
                    fileName: this.chartConfig.chart.title.text || 'vue-ui-xy',
                    format: 'png'
                }).finally(() => {
                    this.isImaging = false;
                });
            }, 100)
        }
    }
}
</script>

<style scoped lang="scss">
@import "../vue-data-ui.css";
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

canvas {
    width: 100%;
    object-fit: contain;
}
</style>