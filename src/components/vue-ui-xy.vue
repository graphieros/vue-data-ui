
<template>
    <div :id="`vue-ui-xy_${uniqueId}`" :class="`vue-ui-xy ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`" ref="chart" :style="`background:${FINAL_CONFIG.chart.backgroundColor}; color:${FINAL_CONFIG.chart.color};width:100%;font-family:${FINAL_CONFIG.chart.fontFamily};${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
        <PenAndPaper 
            v-if="FINAL_CONFIG.chart.userOptions.buttons.annotator && svgRef"
            :svgRef="svgRef"
            :backgroundColor="FINAL_CONFIG.chart.backgroundColor"
            :color="FINAL_CONFIG.chart.color"
            :active="isAnnotator"
            @close="toggleAnnotator"
        />

        <div
            ref="noTitle"
            v-if="hasOptionsNoTitle" 
            class="vue-data-ui-no-title-space" 
            :style="`height:36px; width: 100%; background:transparent`"
        />

        <!-- TITLE AS OUTSIDE DIV -->
        <div ref="chartTitle" class="vue-ui-xy-title" v-if="FINAL_CONFIG.chart.title.show" :style="`font-family:${FINAL_CONFIG.chart.fontFamily}`">
            <Title
                :key="`title_${titleStep}`"
                :config="{
                    title: {
                        cy: 'xy-div-title',
                        ...FINAL_CONFIG.chart.title
                    },
                    subtitle: {
                        cy: 'xy-div-subtitle',
                        ...FINAL_CONFIG.chart.title.subtitle
                    },
                }"
            />
        </div>

        <UserOptions
            ref="defails"
            :key="`user_options_${step}`"
            v-if="FINAL_CONFIG.chart.userOptions.show && (keepUserOptionState ? true : userOptionsVisible)"
            :backgroundColor="FINAL_CONFIG.chart.backgroundColor"
            :color="FINAL_CONFIG.chart.color"
            :isPrinting="isPrinting"
            :isImaging="isImaging"
            :uid="uniqueId"
            :hasTooltip="FINAL_CONFIG.chart.userOptions.buttons.tooltip && FINAL_CONFIG.chart.tooltip.show"
            :hasPdf="FINAL_CONFIG.chart.userOptions.buttons.pdf"
            :hasXls="FINAL_CONFIG.chart.userOptions.buttons.csv"
            :hasImg="FINAL_CONFIG.chart.userOptions.buttons.img"
            :hasLabel="FINAL_CONFIG.chart.userOptions.buttons.labels"
            :hasTable="FINAL_CONFIG.chart.userOptions.buttons.table"
            :hasStack="dataset.length > 1 && FINAL_CONFIG.chart.userOptions.buttons.stack"
            :hasFullscreen="FINAL_CONFIG.chart.userOptions.buttons.fullscreen"
            :isStacked="mutableConfig.isStacked"
            :isFullscreen="isFullscreen"
            :chartElement="$refs.chart"
            :position="FINAL_CONFIG.chart.userOptions.position"
            :isTooltip="mutableConfig.showTooltip"
            :titles="{ ...FINAL_CONFIG.chart.userOptions.buttonTitles }"
            :hasAnnotator="FINAL_CONFIG.chart.userOptions.buttons.annotator"
            :isAnnotation="isAnnotator"
            :callbacks="FINAL_CONFIG.chart.userOptions.callbacks"
            :printScale="FINAL_CONFIG.chart.userOptions.print.scale"
            @toggleFullscreen="toggleFullscreen"
            @generatePdf="generatePdf"
            @generateCsv="generateCsv"
            @generateImage="generateImage"
            @toggleTable="toggleTable"
            @toggleLabels="toggleLabels"
            @toggleStack="toggleStack"
            @toggleTooltip="toggleTooltip"
            @toggleAnnotator="toggleAnnotator"
            :style="{
                visibility: keepUserOptionState ? userOptionsVisible ? 'visible' : 'hidden' : 'visible'
            }"
        >
            <template #menuIcon="{ isOpen, color }" v-if="$slots.menuIcon">
                <slot name="menuIcon" v-bind="{ isOpen, color }"/>
            </template>
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
            <template v-if="$slots.optionAnnotator" #optionAnnotator="{ toggleAnnotator, isAnnotator }">
                <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
            </template>
        </UserOptions>
        
        <svg  
            ref="svgRef"
            xmlns="http://www.w3.org/2000/svg"
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" 
            data-cy="xy-svg" 
            :width="isAutoSize ? undefined : '100%'" 
            :viewBox="viewBox" 
            class="vue-ui-xy-svg vue-data-ui-svg" 
            :style="`background: transparent; color:${FINAL_CONFIG.chart.color}; font-family:${FINAL_CONFIG.chart.fontFamily}`"
            :aria-label="chartAriaLabel"
            role="img"
            aria-live="polite"
            preserveAspectRatio="xMidYMid"
        >
            <g ref="G" class="vue-data-ui-g">
                <PackageVersion />
    
                <!-- BACKGROUND SLOT -->
                <foreignObject 
                    v-if="$slots['chart-background']"
                    :x="(drawingArea.left + xPadding) < 0 ? 0 : drawingArea.left + xPadding"
                    :y="drawingArea.top"
                    :width="(drawingArea.width - (FINAL_CONFIG.chart.grid.position === 'middle' ? 0 : drawingArea.width / maxSeries)) < 0 ? 0 : drawingArea.width - (FINAL_CONFIG.chart.grid.position === 'middle' ? 0 : drawingArea.width / maxSeries)"
                    :height="drawingArea.height < 0 ? 0 : drawingArea.height"
                    :style="{
                        pointerEvents: 'none'
                    }"
                >
                    <slot name="chart-background"/>
                </foreignObject>
                
                <g v-if="maxSeries > 0"> 
                    <!-- GRID -->
                    <g class="vue-ui-xy-grid">
                        <line 
                            v-if="FINAL_CONFIG.chart.grid.labels.xAxis.showBaseline"
                            data-cy="xy-grid-line-x"
                            :stroke="FINAL_CONFIG.chart.grid.stroke" 
                            stroke-width="1" 
                            :x1="drawingArea.left + xPadding"
                            :x2="drawingArea.right - xPadding"
                            :y1="forceValidValue(drawingArea.bottom)"
                            :y2="forceValidValue(drawingArea.bottom)"
                            stroke-linecap="round"
                            :style="{ animation: 'none !important' }"
                        />
                        <template v-if="!mutableConfig.useIndividualScale">
                            <line
                                v-if="FINAL_CONFIG.chart.grid.labels.yAxis.showBaseline"
                                data-cy="xy-grid-line-y"
                                :stroke="FINAL_CONFIG.chart.grid.stroke" 
                                stroke-width="1" 
                                :x1="drawingArea.left + xPadding" 
                                :x2="drawingArea.left + xPadding" 
                                :y1="forceValidValue(drawingArea.top)" 
                                :y2="forceValidValue(drawingArea.bottom)" 
                                stroke-linecap="round"
                                :style="{ animation: 'none !important' }"
                            />
                            <g v-if="FINAL_CONFIG.chart.grid.showHorizontalLines">
                                <line
                                    data-cy="xy-grid-horizontal-line"
                                    v-for="l in yLabels"
                                    :x1="drawingArea.left + xPadding"
                                    :x2="drawingArea.right - xPadding"
                                    :y1="forceValidValue(l.y)"
                                    :y2="forceValidValue(l.y)"
                                    :stroke="FINAL_CONFIG.chart.grid.stroke"
                                    :stroke-width="0.5"
                                    stroke-linecap="round"
                                    :style="{ animation: 'none !important' }"
                                />
                            </g>
                        </template>
                        <template v-else-if="FINAL_CONFIG.chart.grid.showHorizontalLines">
                            <g v-for="grid in allScales">
                                <template v-if="grid.id === selectedScale && grid.yLabels.length">
                                    <line 
                                        v-for="l in grid.yLabels"
                                        :x1="drawingArea.left + xPadding"
                                        :x2="drawingArea.right - xPadding"
                                        :y1="forceValidValue(l.y)"
                                        :y2="forceValidValue(l.y)"
                                        :stroke="grid.color"
                                        :stroke-width="0.5"
                                        stroke-linecap="round"
                                        :style="{ animation: 'none !important' }"
                                    />
                                </template>
                                <template v-else-if="grid.yLabels.length">
                                    <line 
                                        v-for="l in grid.yLabels"
                                        :x1="drawingArea.left + xPadding"
                                        :x2="drawingArea.right - xPadding"
                                        :y1="forceValidValue(l.y)"
                                        :y2="forceValidValue(l.y)"
                                        :stroke="FINAL_CONFIG.chart.grid.stroke"
                                        :stroke-width="0.5"
                                        stroke-linecap="round"
                                        :style="{ animation: 'none !important' }"
                                    />
                                </template>
                            </g>
                        </template>
                        <g v-if="FINAL_CONFIG.chart.grid.showVerticalLines">
                            <line
                                data-cy="xy-grid-vertical-line"
                                v-for="(_, i) in maxSeries + ( FINAL_CONFIG.chart.grid.position === 'middle' ? 1 : 0)" 
                                :key="`grid_vertical_line_${i}`"
                                :x1="(drawingArea.width / maxSeries) * i + drawingArea.left + xPadding"
                                :x2="(drawingArea.width / maxSeries) * i + drawingArea.left + xPadding"
                                :y1="forceValidValue(drawingArea.top)"
                                :y2="forceValidValue(drawingArea.bottom)"
                                stroke-width="0.5"
                                :stroke="FINAL_CONFIG.chart.grid.stroke"
                                :style="{ animation: 'none !important' }"
                            />
                        </g>
    
                        <g v-if="FINAL_CONFIG.chart.grid.labels.xAxisLabels.show">
                            <g v-for="(label, i) in timeLabels" :key="`time_label_${i}`">
                                <template 
                                    v-if="(label && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo) || (label && FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && (i === 0 || i === timeLabels.length -1) && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo) || (label && FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && selectedSerieIndex === i && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo) || (label && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo && (i % Math.floor((slicer.end - slicer.start) / FINAL_CONFIG.chart.grid.labels.xAxisLabels.modulo) === 0)) || (label && FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo && maxSeries <= FINAL_CONFIG.chart.grid.labels.xAxisLabels.modulo)">
                                        <line
                                            data-cy="axis-x-tick"
                                            v-if="FINAL_CONFIG.chart.grid.labels.xAxis.showCrosshairs"
                                            :y1="FINAL_CONFIG.chart.grid.labels.xAxis.crosshairsAlwaysAtZero ? zero - (zero === drawingArea.bottom ? 0 : FINAL_CONFIG.chart.grid.labels.xAxis.crosshairSize / 2) :  drawingArea.bottom"
                                            :y2="FINAL_CONFIG.chart.grid.labels.xAxis.crosshairsAlwaysAtZero ? zero + (FINAL_CONFIG.chart.grid.labels.xAxis.crosshairSize / (zero === drawingArea.bottom ? 1 : 2)) : drawingArea.bottom + FINAL_CONFIG.chart.grid.labels.xAxis.crosshairSize"
                                            :x1="drawingArea.left + (drawingArea.width / maxSeries) * i + (drawingArea.width / maxSeries / 2)"
                                            :x2="drawingArea.left + (drawingArea.width / maxSeries) * i + (drawingArea.width / maxSeries / 2)"
                                            :stroke="FINAL_CONFIG.chart.grid.stroke"
                                            :stroke-width="1"
                                            stroke-linecap="round"
                                            :style="{ animation: 'none !important'}"
                                        />
                                </template>
                            </g>
                        </g>
                    </g>
    
                    <!-- DEFS BARS -->
                    <template v-for="(serie, i) in barSet" :key="`def_rect_${i}`">
                        <defs :data-cy="`xy-def-bar-${i}`">
                            <linearGradient :id="`rectGradient_pos_${i}_${uniqueId}`" x2="0%" y2="100%">
                                <stop offset="0%" :stop-color="serie.color"/>
                                <stop offset="62%" :stop-color="`${shiftHue(serie.color, 0.02)}`"/>
                                <stop offset="100%" :stop-color="`${shiftHue(serie.color, 0.05)}`"/>
                            </linearGradient>
                            <linearGradient :id="`rectGradient_neg_${i}_${uniqueId}`" x2="0%" y2="100%">
                                <stop offset="0%" :stop-color="`${shiftHue(serie.color, 0.05)}`"/>
                                <stop offset="38%" :stop-color="`${shiftHue(serie.color, 0.02)}`"/>
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
                                <stop offset="0%" :stop-color="`${setOpacity(shiftHue(serie.color, 0.03), FINAL_CONFIG.line.area.opacity)}`"/>
                                <stop offset="100%" :stop-color="`${setOpacity(serie.color, FINAL_CONFIG.line.area.opacity)}`"/>
                            </linearGradient>
                        </defs>
                    </template>
    
                    <!-- HIGHLIGHT AREAS -->
                    <g v-for="oneArea in highlightAreas">
                        <template v-if="oneArea.show">
                            <!-- HIGHLIGHT AREA FILLED RECT UNITS -->
                            <g v-for="(_, i) in oneArea.span">
                                <rect
                                    data-cy="highlight-area"
                                    :style="{ 
                                        transition: 'none',
                                        opacity: (oneArea.from + i >= slicer.start && (oneArea.from + i <= slicer.end -1)) ? 1 : 0
                                    }"
                                    :x="drawingArea.left + (drawingArea.width / maxSeries) * ((oneArea.from + i) - slicer.start)"
                                    :y="drawingArea.top"
                                    :height="drawingArea.height < 0 ? 10 : drawingArea.height"
                                    :width="drawingArea.width / maxSeries < 0 ? 0.00001 : drawingArea.width / maxSeries"
                                    :fill="setOpacity(oneArea.color, oneArea.opacity)"
                                />
                            </g>
                            <!-- HIGHLIGHT AREA CAPTION -->
                            <g v-for="(_, i) in oneArea.span">
                                <foreignObject v-if="oneArea.caption.text && i === 0"
                                    :x="drawingArea.left + (drawingArea.width / maxSeries) * ((oneArea.from + i) - slicer.start) - (oneArea.caption.width === 'auto' ? 0 : oneArea.caption.width / 2 - (drawingArea.width / maxSeries) * oneArea.span / 2)"
                                    :y="drawingArea.top + oneArea.caption.offsetY"
                                    :style="{
                                        overflow: 'visible',
                                        opacity: (oneArea.to >= slicer.start && oneArea.from < slicer.end) ? 1 : 0
                                    }"
                                    height="1"
                                    :width="oneArea.caption.width === 'auto' ? (drawingArea.width / maxSeries) * oneArea.span : oneArea.caption.width"
                                    
                                >
                                    <div data-cy="highlight-area-caption" :style="`padding:${oneArea.caption.padding}px;text-align:${oneArea.caption.textAlign};font-size:${oneArea.caption.fontSize}px;color:${oneArea.caption.color};font-weight:${oneArea.caption.bold ? 'bold' : 'normal'}`">
                                        {{ oneArea.caption.text }}
                                    </div>
                                </foreignObject>
                            </g>
                        </template>
                    </g>
    
                    <!-- HIGHLIGHTERS -->
                    <g>
                        <g v-for="(_, i) in maxSeries" :key="`tooltip_trap_highlighter_${i}`">
                            <rect
                                data-cy="highlighter"
                                :x="drawingArea.left + (drawingArea.width / maxSeries) * i"
                                :y="drawingArea.top"
                                :height="drawingArea.height < 0 ? 10 : drawingArea.height"
                                :width="drawingArea.width / maxSeries < 0 ? 0.00001 : drawingArea.width / maxSeries"
                                :fill="[selectedMinimapIndex, selectedSerieIndex, selectedRowIndex].includes(i) ? setOpacity(FINAL_CONFIG.chart.highlighter.color, FINAL_CONFIG.chart.highlighter.opacity) : 'transparent'"
                            />
                        </g>
                    </g>
    
                    <!-- BARS -->
                    <template v-if="barSet.length">
                        <g v-for="(serie, i) in barSet" :key="`serie_bar_${i}`" :class="`serie_bar_${i}`" :style="`opacity:${selectedScale ? selectedScale === serie.groupId ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`">
                            <g 
                                v-for="(plot, j) in serie.plots" 
                                :key="`bar_plot_${i}_${j}`"
                            >
                                <rect
                                    data-cy="datapoint-bar"
                                    v-if="canShowValue(plot.value)"
                                    :x="calcRectX(plot)"
                                    :y="mutableConfig.useIndividualScale ? calcIndividualRectY(plot) : calcRectY(plot)"
                                    :height="mutableConfig.useIndividualScale ? Math.abs(calcIndividualHeight(plot)) : Math.abs(calcRectHeight(plot))"
                                    :width="calcRectWidth() - (mutableConfig.useIndividualScale && mutableConfig.isStacked ? 0 : barPeriodGap) < 0 ? 0.00001 : calcRectWidth() - (mutableConfig.useIndividualScale && mutableConfig.isStacked ? 0 : barPeriodGap)"
                                    :rx="FINAL_CONFIG.bar.borderRadius"
                                    :fill="FINAL_CONFIG.bar.useGradient ? plot.value >= 0 ? `url(#rectGradient_pos_${i}_${uniqueId})`: `url(#rectGradient_neg_${i}_${uniqueId})` : serie.color"
                                    :stroke="FINAL_CONFIG.bar.border.useSerieColor ? serie.color : FINAL_CONFIG.bar.border.stroke"
                                    :stroke-width="FINAL_CONFIG.bar.border.strokeWidth"
                                    :style="`${loading ? 'transition:none !important' : ''}`"
                                />
                                <rect
                                    data-cy="datapoint-bar"
                                    v-if="canShowValue(plot.value) && $slots.pattern"
                                    :x="calcRectX(plot)"
                                    :y="mutableConfig.useIndividualScale ? calcIndividualRectY(plot) : calcRectY(plot)"
                                    :height="mutableConfig.useIndividualScale ? Math.abs(calcIndividualHeight(plot)) : Math.abs(calcRectHeight(plot))"
                                    :width="calcRectWidth() - (mutableConfig.useIndividualScale && mutableConfig.isStacked ? 0 : barPeriodGap) < 0 ? 0.00001 : calcRectWidth() - (mutableConfig.useIndividualScale && mutableConfig.isStacked ? 0 : barPeriodGap)"
                                    :rx="FINAL_CONFIG.bar.borderRadius"
                                    :fill="`url(#pattern_${uniqueId}_${serie.slotAbsoluteIndex})`"
                                    :stroke="FINAL_CONFIG.bar.border.useSerieColor ? serie.color : FINAL_CONFIG.bar.border.stroke"
                                    :stroke-width="FINAL_CONFIG.bar.border.strokeWidth"
                                />
    
                                <template v-if="plot.comment && FINAL_CONFIG.chart.comments.show">
                                    <foreignObject style="overflow: visible" height="12" :width="(calcRectWidth() - (mutableConfig.useIndividualScale && mutableConfig.isStacked ? 0 : barPeriodGap) < 0 ? 0.00001 : calcRectWidth() - (mutableConfig.useIndividualScale && mutableConfig.isStacked ? 0 : barPeriodGap) / 2) + FINAL_CONFIG.chart.comments.width" :x="calcRectX(plot) - (FINAL_CONFIG.chart.comments.width / 2) + FINAL_CONFIG.chart.comments.offsetX" :y="checkNaN(plot.y) + FINAL_CONFIG.chart.comments.offsetY + 6">
                                        <slot name="plot-comment" :plot="{...plot, color: serie.color, seriesIndex: i, datapointIndex: j }"/>
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
                                    :x1="calcLinearProgression(serie.plots).x1 + calcRectWidth()"
                                    :x2="calcLinearProgression(serie.plots).x2 + calcRectWidth()"
                                    :y1="forceValidValue(calcLinearProgression(serie.plots).y1)"
                                    :y2="forceValidValue(calcLinearProgression(serie.plots).y2)"
                                    :stroke-width="1"
                                    :stroke="serie.color"
                                    :stroke-dasharray="2"
                                    :marker-end="`url(#bar_arrow_${i})`"
                                />
                                <text
                                    v-if="serie.plots.length > 1"
                                    :data-cy="`xy-bar-progression-label-${i}`"
                                    text-anchor="middle"
                                    :x="calcLinearProgression(serie.plots).x2 + calcRectWidth()"
                                    :y="calcLinearProgression(serie.plots).y2 - 6"
                                    :font-size="fontSizes.plotLabels"
                                    :fill="serie.color"
                                >
                                    {{  dataLabel({
                                        v: calcLinearProgression(serie.plots).trend * 100,
                                        s: '%',
                                        r: 2,
                                    }) }}
                                </text>
                            </g>
                        </g>
                    </template>
    
                    <!-- ZERO LINE (AFTER BAR DATASETS, BEFORE LABELS) -->
                    <template v-if="!mutableConfig.useIndividualScale && FINAL_CONFIG.chart.grid.labels.zeroLine.show">
                        <line
                            data-cy="xy-grid-line-x"
                            :stroke="FINAL_CONFIG.chart.grid.stroke" 
                            stroke-width="1" 
                            :x1="drawingArea.left + xPadding" 
                            :x2="drawingArea.right - xPadding" 
                            :y1="forceValidValue(zero)" 
                            :y2="forceValidValue(zero)" 
                            stroke-linecap="round"
                            :style="{ animation: 'none !important' }"
                        />
                    </template>
    
                    <g v-if="FINAL_CONFIG.chart.highlighter.useLine && (![null, undefined].includes(selectedSerieIndex) || ![null, undefined].includes(selectedMinimapIndex))">
                        <line
                            :x1="drawingArea.left + (drawingArea.width / maxSeries) * ((selectedSerieIndex !== null ? selectedSerieIndex : 0) || (selectedMinimapIndex !== null ? selectedMinimapIndex : 0)) + (drawingArea.width / maxSeries / 2)"
                            :x2="drawingArea.left + (drawingArea.width / maxSeries) * ((selectedSerieIndex !== null ? selectedSerieIndex : 0) || (selectedMinimapIndex !== null ? selectedMinimapIndex : 0)) + (drawingArea.width / maxSeries / 2)"
                            :y1="forceValidValue(drawingArea.top)"
                            :y2="forceValidValue(drawingArea.bottom)"
                            :stroke="FINAL_CONFIG.chart.highlighter.color"
                            :stroke-width="FINAL_CONFIG.chart.highlighter.lineWidth"
                            :stroke-dasharray="FINAL_CONFIG.chart.highlighter.lineDasharray"
                            stroke-linecap="round"
                            style="transition:none !important; animation: none !important; pointer-events: none;"
                        />
                    </g>
    
                    <!-- FRAME -->
                    <rect
                        data-cy="frame"
                        v-if="FINAL_CONFIG.chart.grid.frame.show"
                        :style="{ pointerEvents: 'none', transition: 'none', animation: 'none !important' }"
                        :x="(drawingArea.left + xPadding) < 0 ? 0 : drawingArea.left + xPadding"
                        :y="drawingArea.top"
                        :width="(drawingArea.width - (FINAL_CONFIG.chart.grid.position === 'middle' ? 0 : drawingArea.width / maxSeries)) < 0 ? 0 : drawingArea.width - (FINAL_CONFIG.chart.grid.position === 'middle' ? 0 : drawingArea.width / maxSeries)"
                        :height="drawingArea.height < 0 ? 0 : drawingArea.height"
                        fill="transparent"
                        :stroke="FINAL_CONFIG.chart.grid.frame.stroke"
                        :stroke-width="FINAL_CONFIG.chart.grid.frame.strokeWidth"
                        :stroke-linecap="FINAL_CONFIG.chart.grid.frame.strokeLinecap"
                        :stroke-linejoin="FINAL_CONFIG.chart.grid.frame.strokeLinejoin"
                        :stroke-dasharray="FINAL_CONFIG.chart.grid.frame.strokeDasharray"
                    />
    
                    <!-- Y LABELS -->
                    <g v-if="FINAL_CONFIG.chart.grid.labels.show" ref="scaleLabels">
                        <template v-if="mutableConfig.useIndividualScale">
                            <g v-for="el in allScales">
                                <line 
                                    :x1="el.x + xPadding"
                                    :x2="el.x + xPadding"
                                    :y1="mutableConfig.isStacked ? forceValidValue((drawingArea.bottom - el.yOffset - el.individualHeight)) : forceValidValue(drawingArea.top)"
                                    :y2="mutableConfig.isStacked ? forceValidValue((drawingArea.bottom - el.yOffset)) : forceValidValue(drawingArea.bottom)"
                                    :stroke="el.color"
                                    :stroke-width="FINAL_CONFIG.chart.grid.stroke"
                                    stroke-linecap="round"
                                    :style="`opacity:${selectedScale ? selectedScale === el.groupId ? 1 : 0.3 : 1};transition:opacity 0.2s ease-in-out; animation: none !important`"
                                />
                            </g>
                            <g v-for="el in allScales" :style="`opacity:${selectedScale ? selectedScale === el.groupId ? 1 : 0.3 : 1};transition:opacity 0.2s ease-in-out`">
                                <text
                                    :fill="el.color"
                                    :font-size="fontSizes.dataLabels"
                                    text-anchor="middle"
                                    :transform="`translate(${el.x - FINAL_CONFIG.chart.grid.labels.yAxis.labelWidth + 5 + xPadding + FINAL_CONFIG.chart.grid.labels.yAxis.scaleLabelOffsetX}, ${mutableConfig.isStacked ? drawingArea.bottom - el.yOffset - (el.individualHeight / 2) : drawingArea.top + drawingArea.height / 2}) rotate(-90)`"
                                >
                                    {{ el.name }} {{ el.scaleLabel && el.unique && el.scaleLabel !== el.id ? `- ${el.scaleLabel}` : '' }}
                                </text>
                                <template v-for="(yLabel, j) in el.yLabels">
                                    <line
                                        v-if="FINAL_CONFIG.chart.grid.labels.yAxis.showCrosshairs"
                                        :x1="el.x + 3 + xPadding - FINAL_CONFIG.chart.grid.labels.yAxis.crosshairSize"
                                        :x2="el.x + xPadding"
                                        :y1="forceValidValue(yLabel.y)"
                                        :y2="forceValidValue(yLabel.y)"
                                        :stroke="el.color"
                                        :stroke-width="1"
                                        stroke-linecap="round"
                                        :style="{ animation: 'none !important' }"
                                    />
                                </template>
                                <text 
                                    v-for="(yLabel, j) in el.yLabels"
                                    :x="isAutoSize ? el.x - fontSizes.dataLabels / 2 + xPadding + FINAL_CONFIG.chart.grid.labels.yAxis.scaleValueOffsetX : el.x - 5 + xPadding + FINAL_CONFIG.chart.grid.labels.yAxis.scaleValueOffsetX" 
                                    :y="forceValidValue(yLabel.y) + fontSizes.dataLabels / 3" 
                                    :font-size="fontSizes.dataLabels" 
                                    text-anchor="end"
                                    :fill="el.color"
                                >
                                    {{
                                        applyDataLabel(
                                            FINAL_CONFIG.chart.grid.labels.yAxis.formatter,
                                            yLabel.value,
                                            dataLabel({
                                                p: yLabel.prefix, 
                                                v: yLabel.value, 
                                                s: yLabel.suffix, 
                                                r: 1,
                                            }),
                                            { datapoint: yLabel.datapoint, seriesIndex: j }
                                        )
                                    }}
                                </text>
                            </g>
                        </template>
                        <template v-else>
                            <g v-for="(yLabel, i) in yLabels" :key="`yLabel_${i}`">
                                <line
                                    data-cy="axis-y-tick"
                                    v-if="canShowValue(yLabel) && yLabel.value >= niceScale.min && yLabel.value <= niceScale.max && FINAL_CONFIG.chart.grid.labels.yAxis.showCrosshairs"
                                    :x1="drawingArea.left + xPadding" 
                                    :x2="drawingArea.left - FINAL_CONFIG.chart.grid.labels.yAxis.crosshairSize + xPadding" 
                                    :y1="forceValidValue(yLabel.y)" 
                                    :y2="forceValidValue(yLabel.y)" 
                                    :stroke="FINAL_CONFIG.chart.grid.stroke" 
                                    stroke-width="1" 
                                    stroke-linecap="round"
                                    :style="{ animation: 'none !important' }"
                                />
                                <text
                                    data-cy="axis-y-label"
                                    v-if="yLabel.value >= niceScale.min && yLabel.value <= niceScale.max" 
                                    :x="drawingArea.left - 7 + xPadding" 
                                    :y="checkNaN(yLabel.y + fontSizes.dataLabels / 3)" 
                                    :font-size="fontSizes.dataLabels" 
                                    text-anchor="end"
                                    :fill="FINAL_CONFIG.chart.grid.labels.color"
                                >
                                    {{ canShowValue(yLabel.value) ? applyDataLabel(
                                        FINAL_CONFIG.chart.grid.labels.yAxis.formatter,
                                        yLabel.value,
                                        dataLabel({
                                            p: yLabel.prefix, 
                                            v: yLabel.value, 
                                            s: yLabel.suffix, 
                                            r: 1,
                                        })) : '' 
                                    }}
                                </text>
                            </g>
                        </template>
                    </g>
    
                    <!-- PLOTS -->
                    <g v-for="(serie, i) in plotSet" :key="`serie_plot_${i}`" :class="`serie_plot_${i}`" :style="`opacity:${selectedScale ? selectedScale === serie.groupId ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`">
                        <g 
                            data-cy="datapoint-plot"
                            v-for="(plot, j) in serie.plots" 
                            :key="`circle_plot_${i}_${j}`"
                        >
                            <Shape
                                :data-cy="`xy-plot-${i}-${j}`"
                                v-if="plot && canShowValue(plot.value)"
                                :shape="['triangle', 'square', 'diamond', 'pentagon', 'hexagon', 'star'].includes(serie.shape) ? serie.shape : 'circle'"
                                :color="FINAL_CONFIG.plot.useGradient ? `url(#plotGradient_${i}_${uniqueId})` : FINAL_CONFIG.plot.dot.useSerieColor ? serie.color : FINAL_CONFIG.plot.dot.fill"
                                :plot="{ x: checkNaN(plot.x), y: checkNaN(plot.y) }"
                                :radius="((selectedSerieIndex !== null && selectedSerieIndex === j) || (selectedMinimapIndex !== null && selectedMinimapIndex === j)) ? (plotRadii.plot || 6) * 1.5 : plotRadii.plot || 6"
                                :stroke="FINAL_CONFIG.plot.dot.useSerieColor ? FINAL_CONFIG.chart.backgroundColor : serie.color"
                                :strokeWidth="FINAL_CONFIG.plot.dot.strokeWidth"
                            />
    
                            <template v-if="plot.comment && FINAL_CONFIG.chart.comments.show">
                                <foreignObject style="overflow: visible" height="12" :width="FINAL_CONFIG.chart.comments.width" :x="plot.x - (FINAL_CONFIG.chart.comments.width / 2) + FINAL_CONFIG.chart.comments.offsetX" :y="plot.y + FINAL_CONFIG.chart.comments.offsetY + 6">
                                    <div style="width: 100%;">
                                        <slot name="plot-comment" :plot="{...plot, color: serie.color, seriesIndex: i, datapointIndex: j }"/>
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
                                :y1="forceValidValue(calcLinearProgression(serie.plots).y1)"
                                :y2="forceValidValue(calcLinearProgression(serie.plots).y2)"
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
                                    r: 2,
                                }) }}
                            </text>
                        </g>
                    </g>
    
                    <!-- LINE COATINGS -->
                    <g v-for="(serie, i) in lineSet" :key="`serie_line_${i}`" :class="`serie_line_${i}`" :style="`opacity:${selectedScale ? selectedScale === serie.groupId ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`">
                        <path 
                            data-cy="datapoint-line-coating-smooth"
                            v-if="serie.smooth && serie.plots.length > 1 && !!serie.curve" 
                            :d="`M${serie.curve}`" 
                            :stroke="FINAL_CONFIG.chart.backgroundColor" 
                            :stroke-width="FINAL_CONFIG.line.strokeWidth + 1" 
                            :stroke-dasharray="serie.dashed ? FINAL_CONFIG.line.strokeWidth * 2 : 0" 
                            fill="none" 
                        />
    
                        <path
                            data-cy="datapoint-line-coating-straight"
                            v-else-if="serie.plots.length > 1 && !!serie.straight"
                            :d="`M${serie.straight}`"
                            :stroke="FINAL_CONFIG.chart.backgroundColor"
                            :stroke-width="FINAL_CONFIG.line.strokeWidth + 1"
                            :stroke-dasharray="serie.dashed ? FINAL_CONFIG.line.strokeWidth * 2 : 0"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                    </g>
    
                    <defs v-if="$slots.pattern">
                        <slot v-for="(serie, i) in safeDataset" :key="`serie_pattern_slot_${i}`" name="pattern" v-bind="{...serie, seriesIndex: serie.slotAbsoluteIndex, patternId: `pattern_${uniqueId}_${i}`}"/>
                    </defs>
    
                    <!-- LINES -->
                    <g v-for="(serie, i) in lineSet" :key="`serie_line_${i}`" :class="`serie_line_${i}`" :style="`opacity:${selectedScale ? selectedScale === serie.groupId ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`">    
    
                        <g v-if="serie.useArea && serie.plots.length > 1">
                            <template v-if="serie.smooth">
                                <template v-for="(d, segIndex) in serie.curveAreas" :key="segIndex">
                                    <path 
                                    :d="d"
                                    :fill="FINAL_CONFIG.line.area.useGradient ? `url(#areaGradient_${i}_${uniqueId})` : setOpacity(serie.color, FINAL_CONFIG.line.area.opacity)"
                                    />
                                    <path
                                    v-if="$slots.pattern"
                                    :d="d"
                                    :fill="`url(#pattern_${uniqueId}_${serie.slotAbsoluteIndex})`"
                                    />
                                </template>
                            </template>
                            <template v-else>
                                <template v-for="(d, segIndex) in serie.area.split(';')" :key="segIndex">
                                    <path
                                        data-cy="datapoint-line-area-straight"
                                        :d="`M${d}Z`"
                                        :fill="FINAL_CONFIG.line.area.useGradient ? `url(#areaGradient_${i}_${uniqueId})` : setOpacity(serie.color, FINAL_CONFIG.line.area.opacity)"
                                    />
                                    <path
                                        v-if="$slots.pattern"
                                        :d="`M${d}Z`"
                                        :fill="`url(#pattern_${uniqueId}_${serie.slotAbsoluteIndex})`"
                                    />
                                </template>
                            </template>
                        </g>
    
                        <path 
                            data-cy="datapoint-line-smooth"
                            v-if="serie.smooth && serie.plots.length > 1 && !!serie.curve" 
                            :d="`M${serie.curve}`" 
                            :stroke="serie.color" 
                            :stroke-width="FINAL_CONFIG.line.strokeWidth" 
                            :stroke-dasharray="serie.dashed ? FINAL_CONFIG.line.strokeWidth * 2 : 0" 
                            fill="none"
                            stroke-linecap="round"
                        />
    
                        <path
                            data-cy="datapoint-line-straight"
                            v-else-if="serie.plots.length > 1 && !!serie.straight"
                            :d="`M${serie.straight}`"
                            :stroke="serie.color"
                            :stroke-width="FINAL_CONFIG.line.strokeWidth"
                            :stroke-dasharray="serie.dashed ? FINAL_CONFIG.line.strokeWidth * 2 : 0"
                            fill="none"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
    
                        <template v-for="(plot, j) in serie.plots" 
                            :key="`circle_line_${i}_${j}`">
                            <Shape
                                data-cy="datapoint-line-plot"
                                v-if="(!optimize.linePlot && plot && canShowValue(plot.value)) || (optimize.linePlot && plot && canShowValue(plot.value) && ((selectedSerieIndex !== null && selectedSerieIndex === j) || (selectedMinimapIndex !== null && selectedMinimapIndex === j)))"
                                :shape="['triangle', 'square', 'diamond', 'pentagon', 'hexagon', 'star'].includes(serie.shape) ? serie.shape : 'circle'"
                                :color="FINAL_CONFIG.line.useGradient ? `url(#lineGradient_${i}_${uniqueId})` : FINAL_CONFIG.line.dot.useSerieColor ? serie.color : FINAL_CONFIG.line.dot.fill"
                                :plot="{ x: checkNaN(plot.x), y: checkNaN(plot.y) }"
                                :radius="((selectedSerieIndex !== null && selectedSerieIndex === j) || (selectedMinimapIndex !== null && selectedMinimapIndex === j)) ? (plotRadii.line || 6) * 1.5 : plotRadii.line || 6"
                                :stroke="FINAL_CONFIG.line.dot.useSerieColor ? FINAL_CONFIG.chart.backgroundColor : serie.color"
                                :strokeWidth="FINAL_CONFIG.line.dot.strokeWidth"
                            />
    
                            <template v-if="plot.comment && FINAL_CONFIG.chart.comments.show">
                                <foreignObject style="overflow: visible" height="12" :width="FINAL_CONFIG.chart.comments.width" :x="plot.x - (FINAL_CONFIG.chart.comments.width / 2) + FINAL_CONFIG.chart.comments.offsetX" :y="plot.y + FINAL_CONFIG.chart.comments.offsetY + 6">
                                    <div style="width: 100%;">
                                        <slot name="plot-comment" :plot="{...plot, color: serie.color, seriesIndex: i, datapointIndex: j }"/>
                                    </div>
                                </foreignObject>
                            </template>
                        </template> 
    
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
                                :y1="forceValidValue(calcLinearProgression(serie.plots).y1)"
                                :y2="forceValidValue(calcLinearProgression(serie.plots).y2)"
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
                                    r: 2,
                                }) }}
                            </text>
                        </g>
                    </g>
    
                    <!-- X LABELS BAR -->
                    <g v-if="(FINAL_CONFIG.bar.labels.show || FINAL_CONFIG.bar.serieName.show) && mutableConfig.dataLabels.show">
                        <template v-for="(serie, i) in barSet" :key="`xLabel_bar_${i}`" :class="`xLabel_bar_${i}`" >
                            <template v-for="(plot, j) in serie.plots" :key="`xLabel_bar_${i}_${j}`" >
                                <text
                                    data-cy="datapoint-bar-label"
                                    v-if="plot && (!Object.hasOwn(serie, 'dataLabels') || ((serie.dataLabels === true || (selectedSerieIndex !== null && selectedSerieIndex === j) || (selectedMinimapIndex !== null && selectedMinimapIndex === j)))) && FINAL_CONFIG.bar.labels.show"
                                    :x="mutableConfig.useIndividualScale && mutableConfig.isStacked ? plot.x + slot.line / 2 : calcRectX(plot) + calcRectWidth() / 2 - barPeriodGap / 2"
                                    :y="checkNaN(plot.y) + (plot.value >= 0 ? FINAL_CONFIG.bar.labels.offsetY : - FINAL_CONFIG.bar.labels.offsetY * 3)"
                                    text-anchor="middle"
                                    :font-size="fontSizes.plotLabels"
                                    :fill="FINAL_CONFIG.bar.labels.color"
                                    :style="`opacity:${selectedScale ? selectedScale === serie.groupId ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`"
                                >
                                    {{ canShowValue(plot.value) ? applyDataLabel(
                                        FINAL_CONFIG.bar.labels.formatter,
                                        plot.value,
                                        dataLabel({
                                            p: serie.prefix || FINAL_CONFIG.chart.labels.prefix, 
                                            v: plot.value, 
                                            s: serie.suffix || FINAL_CONFIG.chart.labels.suffix, 
                                            r: FINAL_CONFIG.bar.labels.rounding,
                                        }),
                                        { 
                                            datapoint: plot,
                                            serie,
                                        }
                                        ) : '' 
                                    }}
                                </text>
                                <text 
                                    v-if="plot && FINAL_CONFIG.bar.serieName.show"
                                    :x="mutableConfig.useIndividualScale && mutableConfig.isStacked ? plot.x + slot.line / 2 : plot.x + calcRectWidth() * 1.1"
                                    :y="plot.y + (plot.value > 0 ? FINAL_CONFIG.bar.serieName.offsetY : - FINAL_CONFIG.bar.serieName.offsetY * 3)"
                                    text-anchor="middle"
                                    :font-size="fontSizes.plotLabels"
                                    :fill="FINAL_CONFIG.bar.serieName.useSerieColor ? serie.color : FINAL_CONFIG.bar.serieName.color"
                                    :font-weight="FINAL_CONFIG.bar.serieName.bold ? 'bold' : 'normal'"
                                    :style="`opacity:${selectedScale ? selectedScale === serie.groupId ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`"
                                >
                                    {{ FINAL_CONFIG.bar.serieName.useAbbreviation ? abbreviate({ source: serie.name, length: FINAL_CONFIG.bar.serieName.abbreviationSize}) : serie.name }}
                                </text>
                            </template>
                        </template>
                    </g>
    
                    <!-- X LABELS PLOT -->
                    <g v-if="FINAL_CONFIG.plot.labels.show && mutableConfig.dataLabels.show">
                        <template v-for="(serie, i) in plotSet" :key="`xLabel_plot_${i}`" :class="`xLabel_plot_${i}`">
                            <template v-for="(plot, j) in serie.plots" :key="`xLabel_plot_${i}_${j}`">
                                <text
                                    data-cy="datapoint-plot-label"
                                    v-if="plot && !Object.hasOwn(serie, 'dataLabels') || (serie.dataLabels === true || (selectedSerieIndex !== null && selectedSerieIndex === j) || (selectedMinimapIndex !== null && selectedMinimapIndex === j))"
                                    :x="plot.x"
                                    :y="plot.y + FINAL_CONFIG.plot.labels.offsetY"
                                    text-anchor="middle"
                                    :font-size="fontSizes.plotLabels"
                                    :fill="FINAL_CONFIG.plot.labels.color"
                                    :style="`opacity:${selectedScale ? selectedScale === serie.groupId ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`"
                                >
                                    {{ canShowValue(plot.value) ? applyDataLabel(
                                        FINAL_CONFIG.plot.labels.formatter,
                                        plot.value,
                                        dataLabel({
                                            p: serie.prefix || FINAL_CONFIG.chart.labels.prefix,
                                            v: plot.value, 
                                            s: serie.suffix || FINAL_CONFIG.chart.labels.suffix, 
                                            r: FINAL_CONFIG.plot.labels.rounding,
                                        }),
                                        { 
                                            datapoint: plot,
                                            serie,
                                        }
                                        ) : '' 
                                    }}
                                </text>
                            </template>
                        </template>
                    </g>
                    <g v-else>
                        <template v-for="(serie, i) in plotSet" :key="`xLabel_plot_${i}`" :class="`xLabel_plot_${i}`">
                            <template v-for="(plot, j) in serie.plots" :key="`xLabel_plot_${i}_${j}`">
                                <!-- PLOT TAGS (fixed) -->
                                <template v-if="!FINAL_CONFIG.plot.tag.followValue">
                                    <foreignObject
                                        :data-cy="`xy-plot-tag-start-${i}`"
                                        v-if="plot && j === 0 && serie.useTag && serie.useTag === 'start'"
                                        :x="plot.x"
                                        :y="plot.y - 20"
                                        :height="24"
                                        width="150"
                                        :style="`overflow: visible; opacity:${selectedScale ? selectedScale === serie.groupId ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`"
                                    >
                                        <div :style="`padding: 3px; background:${setOpacity(serie.color, 80)};color:${adaptColorToBackground(serie.color)};width:fit-content;font-size:${fontSizes.plotLabels}px;border-radius: 2px;`" 
                                        v-html="applyDataLabel(
                                            FINAL_CONFIG.plot.tag.formatter,
                                            plot.value,
                                            serie.name,
                                            {
                                                datapoint: plot, seriesIndex: j, serieName: serie.name
                                            }
                                        )"/>
                                    </foreignObject>
                                    <foreignObject
                                        :data-cy="`xy-plot-tag-end-${i}`"
                                        v-if="plot && j === serie.plots.length - 1 && serie.useTag && serie.useTag === 'end'"
                                        :x="plot.x - serie.name.length * (fontSizes.plotLabels / 2)"
                                        :y="plot.y - 20"
                                        :height="24"
                                        width="150"
                                        :style="`overflow: visible; opacity:${selectedScale ? selectedScale === serie.groupId ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`"
                                    >
                                        <div :style="`padding: 3px; background:${setOpacity(serie.color, 80)};color:${adaptColorToBackground(serie.color)};width:fit-content;font-size:${fontSizes.plotLabels}px;border-radius: 2px;`" 
                                        v-html="applyDataLabel(
                                            FINAL_CONFIG.plot.tag.formatter,
                                            plot.value,
                                            serie.name,
                                            {
                                                datapoint: plot, seriesIndex: j, serieName: serie.name
                                            }
                                        )"/>
                                    </foreignObject>
                                </template>
                                
                                <!-- TAG LINE (follower) -->
                                <template v-else>
                                    <line
                                        class="vue-ui-xy-tag-plot"
                                        v-if="([selectedMinimapIndex, selectedSerieIndex, selectedRowIndex].includes(j)) && serie.useTag"
                                        :x1="drawingArea.left"
                                        :x2="drawingArea.right"
                                        :y1="plot.y"
                                        :y2="plot.y"
                                        :stroke-width="1"
                                        stroke-linecap="round"
                                        stroke-dasharray="2"
                                        :stroke="serie.color"
                                    />
                                </template>
                            </template>
                        </template>
                    </g>
    
                    <!-- X LABELS LINE -->
                    <g v-if="FINAL_CONFIG.line.labels.show && mutableConfig.dataLabels.show">
                        <template v-for="(serie, i) in lineSet" :key="`xLabel_line_${i}`" :class="`xLabel_line_${i}`">
                            <template v-for="(plot, j) in serie.plots" :key="`xLabel_line_${i}_${j}`">
                                <text
                                    data-cy="datapoint-line-label"
                                    v-if="plot && !Object.hasOwn(serie, 'dataLabels') || (serie.dataLabels === true || (selectedSerieIndex !== null && selectedSerieIndex === j) || (selectedMinimapIndex !== null && selectedMinimapIndex === j))"
                                    :x="plot.x"
                                    :y="plot.y + (plot.value >= 0 ? FINAL_CONFIG.line.labels.offsetY : - FINAL_CONFIG.line.labels.offsetY * 3)"
                                    text-anchor="middle"
                                    :font-size="fontSizes.plotLabels"
                                    :fill="FINAL_CONFIG.line.labels.color"
                                    :style="`opacity:${selectedScale ? selectedScale === serie.groupId ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`"
                                >
                                    {{ canShowValue(plot.value) ? applyDataLabel(
                                        FINAL_CONFIG.line.labels.formatter,
                                        plot.value,
                                        dataLabel({
                                            p: serie.prefix || FINAL_CONFIG.chart.labels.prefix, 
                                            v: plot.value, 
                                            s: serie.suffix || FINAL_CONFIG.chart.labels.suffix, 
                                            r: FINAL_CONFIG.line.labels.rounding,
                                        }),
                                        { 
                                            datapoint: plot,
                                            serie,
                                        }
                                        ) : '' 
                                    }}
                                </text>
                            </template>
                        </template>
                    </g>
    
                    <g v-else>
                        <template v-for="(serie, i) in lineSet" :key="`xLabel_line_${i}`" :class="`xLabel_line_${i}`">
                            <template v-for="(plot, j) in serie.plots" :key="`xLabel_line_${i}_${j}`">
                                <!-- LINE TAGS (fixed) -->
                                <template v-if="!FINAL_CONFIG.line.tag.followValue">
                                    <foreignObject
                                        :data-cy="`xy-line-tag-start-${i}`"
                                        v-if="plot && j === 0 && serie.useTag && serie.useTag === 'start'"
                                        :x="plot.x"
                                        :y="plot.y - 20"
                                        :height="24"
                                        width="150"
                                        :style="`overflow: visible; opacity:${selectedScale ? selectedScale === serie.groupId ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`"
                                    >
                                        <div :style="`padding: 3px; background:${setOpacity(serie.color, 80)};color:${adaptColorToBackground(serie.color)};width:fit-content;font-size:${fontSizes.plotLabels}px;border-radius: 2px;`" 
                                        v-html="applyDataLabel(
                                            FINAL_CONFIG.line.tag.formatter,
                                            plot.value,
                                            serie.name,
                                            {
                                                datapoint: plot, seriesIndex: j, serieName: serie.name
                                            }
                                        )">
                                        </div>
                                    </foreignObject>
                                    <foreignObject
                                        :data-cy="`xy-line-tag-end-${i}`"
                                        v-if="plot && j === serie.plots.length - 1 && serie.useTag && serie.useTag === 'end'"
                                        :x="plot.x"
                                        :y="plot.y - 20"
                                        :height="24"
                                        width="150"
                                        :style="`overflow: visible; opacity:${selectedScale ? selectedScale === serie.groupId ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`"
                                    >
                                        <div :style="`padding: 3px; background:${setOpacity(serie.color, 80)};color:${adaptColorToBackground(serie.color)};width:fit-content;font-size:${fontSizes.plotLabels}px;border-radius: 2px;`" 
                                        v-html="applyDataLabel(
                                                FINAL_CONFIG.line.tag.formatter,
                                                plot.value,
                                                serie.name,
                                                {
                                                    datapoint: plot, seriesIndex: j, serieName: serie.name
                                                }
                                            )"/>
                                    </foreignObject>
                                </template>
    
                                <!-- TAG LINE (follower) -->
                                <template v-else>
                                    <line
                                        class="vue-ui-xy-tag-line"
                                        v-if="([selectedMinimapIndex, selectedSerieIndex, selectedRowIndex].includes(j)) && serie.useTag"
                                        :x1="drawingArea.left"
                                        :x2="drawingArea.right"
                                        :y1="plot.y"
                                        :y2="plot.y"
                                        :stroke-width="1"
                                        stroke-linecap="round"
                                        stroke-dasharray="2"
                                        :stroke="serie.color"
                                    />
                                </template>
                            </template>
                        </template>
                    </g>
    
                    <!-- SERIE NAME TAGS : LINES -->
                    <template v-for="(serie, i) in lineSet" :key="`xLabel_line_${i}`" :class="`xLabel_line_${i}`">
                        <template v-for="(plot, j) in serie.plots" :key="`xLabel_line_${i}_${j}`">
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
                                :style="`opacity:${selectedScale ? selectedScale === serie.groupId ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`"
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
                                :style="`opacity:${selectedScale ? selectedScale === serie.groupId ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`"
                            />
                        </template>
                    </template>
    
                    <!-- SERIE NAME TAGS : PLOTS -->
                    <template v-for="(serie, i) in plotSet" :key="`xLabel_plot_${i}`" :class="`xLabel_plot_${i}`">
                        <template v-for="(plot, j) in serie.plots" :key="`xLabel_plot_${i}_${j}`">
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
                                :style="`opacity:${selectedScale ? selectedScale === serie.groupId ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`"
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
                                :style="`opacity:${selectedScale ? selectedScale === serie.groupId ? 1 : 0.2 : 1};transition:opacity 0.2s ease-in-out`"
                            />
                        </template>
                    </template>
    
                    <!-- Y LABELS MOUSE TRAPS -->
                    <template v-if="mutableConfig.useIndividualScale && !mutableConfig.isStacked">
                        <defs>
                            <linearGradient
                                v-for="(trap, i) in allScales"
                                :id="`individual_scale_gradient_${uniqueId}_${i}`"
                                x1="0%"
                                x2="100%"
                                y1="0%"
                                y2="0%"
                            >
                                <stop offset="0%" :stop-color="FINAL_CONFIG.chart.backgroundColor" stop-opacity="0"/>
                                <stop offset="100%" :stop-color="trap.color" stop-opacity="0.2"/>
                            </linearGradient>
                        </defs>
                        <rect 
                            v-for="(trap, i) in allScales"
                            :x="trap.x - FINAL_CONFIG.chart.grid.labels.yAxis.labelWidth + xPadding"
                            :y="drawingArea.top"
                            :width="FINAL_CONFIG.chart.grid.labels.yAxis.labelWidth"
                            :height="drawingArea.height < 0 ? 10 : drawingArea.height"
                            :fill="selectedScale === trap.groupId ? `url(#individual_scale_gradient_${uniqueId}_${i})` : 'transparent'"
                            @mouseenter="selectedScale = trap.groupId"
                            @mouseleave="selectedScale = null"
                        />
                    </template>
    
                    <!-- AXIS LABELS -->
                    <g>
                        <text
                            ref="yAxisLabel"
                            data-cy="xy-axis-yLabel" 
                            v-if="FINAL_CONFIG.chart.grid.labels.axis.yLabel && !mutableConfig.useIndividualScale" 
                            :font-size="fontSizes.yAxis" 
                            :fill="FINAL_CONFIG.chart.grid.labels.color"
                            :transform="isAutoSize ? undefined : `translate(${fontSizes.yAxis + FINAL_CONFIG.chart.grid.labels.axis.yLabelOffsetX}, ${drawingArea.top + drawingArea.height / 2}) rotate(-90)`"
                            text-anchor="middle" 
                            style="transition: none"
                        >
                            {{ FINAL_CONFIG.chart.grid.labels.axis.yLabel }}
                        </text>
                        <text
                            ref="xAxisLabel"
                            data-cy="xy-axis-xLabel"
                            v-if="FINAL_CONFIG.chart.grid.labels.axis.xLabel" 
                            text-anchor="middle"
                            :x="isAutoSize ? (viewBoxParts.width / 2) - Math.abs(viewBoxParts.x) : width / 2"
                            :y="isAutoSize ? undefined : drawingArea.bottom + fontSizes.yAxis + (fontSizes.xAxis * 1.3) + FINAL_CONFIG.chart.grid.labels.axis.xLabelOffsetY"
                            :font-size="fontSizes.yAxis"
                            :fill="FINAL_CONFIG.chart.grid.labels.color"
                        >
                            {{ FINAL_CONFIG.chart.grid.labels.axis.xLabel }}
                        </text>
    
                    </g>
                    
                    <!-- TIME LABELS -->
                    <g v-if="FINAL_CONFIG.chart.grid.labels.xAxisLabels.show" ref="timeLabelsEls">
                        <template v-if="$slots['time-label']">
                            <template v-for="(label, i) in timeLabels" :key="`time_label_${i}`">
                                <slot name="time-label" v-bind="{
                                    x: drawingArea.left + (drawingArea.width / maxSeries) * i + (drawingArea.width / maxSeries / 2),
                                    y: isAutoSize ? drawingArea.bottom + FINAL_CONFIG.chart.grid.labels.xAxisLabels.yOffset : drawingArea.bottom + fontSizes.xAxis * 1.3 + FINAL_CONFIG.chart.grid.labels.xAxisLabels.yOffset,
                                    fontSize: fontSizes.xAxis,
                                    fill: FINAL_CONFIG.chart.grid.labels.xAxisLabels.color,
                                    transform: isAutoSize ? `translate(${drawingArea.left + (drawingArea.width / maxSeries) * i + (drawingArea.width / maxSeries / 2)}, ${drawingArea.bottom + FINAL_CONFIG.chart.grid.labels.xAxisLabels.yOffset}), rotate(${FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation})` : `translate(${drawingArea.left + (drawingArea.width / maxSeries) * i + (drawingArea.width / maxSeries / 2)}, ${drawingArea.bottom + fontSizes.xAxis * 1.3 + FINAL_CONFIG.chart.grid.labels.xAxisLabels.yOffset}), rotate(${FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation})`,
                                    absoluteIndex: label.absoluteIndex,
                                    content: label.text,
                                    textAnchor: FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation > 0 ? 'start' : FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation < 0 ? 'end' : 'middle',
                                    show: (label && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo) || 
                                        (label && FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && (i === 0 || i === timeLabels.length -1) && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo) || 
                                        (label && FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && selectedSerieIndex === i && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo) ||
                                        (label && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo && (i % Math.floor((slicer.end - slicer.start) / FINAL_CONFIG.chart.grid.labels.xAxisLabels.modulo) === 0)) || (label && FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo && maxSeries <= FINAL_CONFIG.chart.grid.labels.xAxisLabels.modulo)
                                }" />
                            </template>
                        </template>
                        <template v-else>
                            <g v-for="(label, i) in timeLabels" :key="`time_label_${i}`">
                                <template 
                                v-if="(label && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo) || (label && FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && (i === 0 || i === timeLabels.length -1) && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo) || (label && FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && selectedSerieIndex === i && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo) || (label && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo && (i % Math.floor((slicer.end - slicer.start) / FINAL_CONFIG.chart.grid.labels.xAxisLabels.modulo) === 0)) || (label && FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo && maxSeries <= FINAL_CONFIG.chart.grid.labels.xAxisLabels.modulo)">
                                    <!-- SINGLE LINE LABEL -->
                                    <text
                                        v-if="!String(label.text).includes('\n')"
                                        data-cy="time-label"
                                        :text-anchor="FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation > 0 ? 'start' : FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation < 0 ? 'end' : 'middle'"
                                        :font-size="fontSizes.xAxis"
                                        :fill="FINAL_CONFIG.chart.grid.labels.xAxisLabels.color"
                                        :transform="isAutoSize ? `translate(${drawingArea.left + (drawingArea.width / maxSeries) * i + (drawingArea.width / maxSeries / 2)}, ${drawingArea.bottom + FINAL_CONFIG.chart.grid.labels.xAxisLabels.yOffset}), rotate(${FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation})` : `translate(${drawingArea.left + (drawingArea.width / maxSeries) * i + (drawingArea.width / maxSeries / 2)}, ${drawingArea.bottom + fontSizes.xAxis * 1.3 + FINAL_CONFIG.chart.grid.labels.xAxisLabels.yOffset}), rotate(${FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation})`"
                                        :style="{
                                            cursor: usesSelectTimeLabelEvent() ? 'pointer' : 'default'
                                        }"
                                        @click="() => selectTimeLabel(label, i)"
                                    >
                                        {{ label.text || "" }}
                                    </text>
    
                                    <!-- MULTILINE LABEL (when label includes \n) -->
                                    <text
                                        v-else
                                        data-cy="time-label"
                                        :text-anchor="FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation > 0 ? 'start' : FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation < 0 ? 'end' : 'middle'"
                                        :font-size="fontSizes.xAxis"
                                        :fill="FINAL_CONFIG.chart.grid.labels.xAxisLabels.color"
                                        :transform="isAutoSize ? `translate(${drawingArea.left + (drawingArea.width / maxSeries) * i + (drawingArea.width / maxSeries / 2)}, ${drawingArea.bottom + FINAL_CONFIG.chart.grid.labels.xAxisLabels.yOffset}), rotate(${FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation})`  : `translate(${drawingArea.left + (drawingArea.width / maxSeries) * i + (drawingArea.width / maxSeries / 2)}, ${drawingArea.bottom + fontSizes.xAxis * 1.3 + FINAL_CONFIG.chart.grid.labels.xAxisLabels.yOffset}), rotate(${FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation})`"
                                        :style="{
                                            cursor: usesSelectTimeLabelEvent() ? 'pointer' : 'default'
                                        }"
                                        v-html="createTSpansFromLineBreaksOnX({
                                            content: String(label.text),
                                            fontSize: fontSizes.xAxis,
                                            fill: FINAL_CONFIG.chart.grid.labels.xAxisLabels.color,
                                            x: 0,
                                            y: 0
                                        })"
                                        @click="() => selectTimeLabel(label, i)"
                                    />
                                </template>
                            </g>
                        </template>
                    </g>
    
                    <!-- ANNOTATIONS -->
                    <!-- YAXIS ANNOTATIONS -->
                    <g v-if="annotationsY.length && !mutableConfig.isStacked">
                        <g v-for="annotation in annotationsY" :key="annotation.uid">
                            <line 
                                v-if="annotation.yTop && annotation.show && isFinite(annotation.yTop)"
                                :x1="annotation.x1"
                                :y1="annotation.yTop"
                                :x2="annotation.x2"
                                :y2="annotation.yTop"
                                :stroke="annotation.config.line.stroke"
                                :stroke-width="annotation.config.line.strokeWidth"
                                :stroke-dasharray="annotation.config.line.strokeDasharray"
                                stroke-linecap="round"
                                :style="{ animation: 'none !important'}"
                            />
                            <line 
                                v-if="annotation.yBottom && annotation.show && isFinite(annotation.yBottom)"
                                :x1="annotation.x1"
                                :y1="annotation.yBottom"
                                :x2="annotation.x2"
                                :y2="annotation.yBottom"
                                :stroke="annotation.config.line.stroke"
                                :stroke-width="annotation.config.line.strokeWidth"
                                :stroke-dasharray="annotation.config.line.strokeDasharray"
                                stroke-linecap="round"
                                :style="{ animation: 'none !important'}"
                            />
                            <rect 
                                v-if="annotation.hasArea && annotation.show && isFinite(annotation.yTop) && isFinite(annotation.yBottom)"
                                :y="Math.min(annotation.yTop, annotation.yBottom)"
                                :x="annotation.x1"
                                :width="drawingArea.width"
                                :height="checkNaN(annotation.areaHeight, 0)"
                                :fill="setOpacity(annotation.config.area.fill, annotation.config.area.opacity)"
                                :style="{ animation: 'none !important' }"
                            />
                            <rect
                                v-if="annotation.config.label.text && annotation.show && isFinite(annotation._box.y)"
                                class="vue-ui-xy-annotation-label-box"
                                v-bind="annotation._box"
                                :style="{ animation: 'none !important', transition: 'none !important'}"
                            />
                            <text
                                v-if="annotation.config.label.text && annotation.show && isFinite(annotation._text.y)"
                                :id="annotation.id"
                                class="vue-ui-xy-annotation-label"
                                :x="annotation._text.x"
                                :y="annotation._text.y"
                                :font-size="annotation.config.label.fontSize"
                                :fill="annotation.config.label.color"
                                :text-anchor="annotation.config.label.textAnchor"
                            >
                                {{ annotation.config.label.text }}
                            </text>
                        </g>
                    </g>
    
                    <!-- TOOLTIP TRAPS -->
                    <g>
                        <rect
                            data-cy="tooltip-trap"
                            v-for="(_, i) in maxSeries" :key="`tooltip_trap_${i}`"
                            :x="drawingArea.left + (drawingArea.width / maxSeries) * i"
                            :y="drawingArea.top"
                            :height="drawingArea.height < 0 ? 10 : drawingArea.height"
                            :width="drawingArea.width / maxSeries < 0 ? 0.00001 : drawingArea.width / maxSeries"
                            fill="transparent"
                            @mouseenter="toggleTooltipVisibility(true, i)"
                            @mouseleave="toggleTooltipVisibility(false)"
                            @click="selectX(i)"
                        />
                    </g>
    
    
                    <!-- TIME TAG -->
                    <g v-if="FINAL_CONFIG.chart.timeTag.show && (![null, undefined].includes(selectedSerieIndex) || ![null, undefined].includes(selectedMinimapIndex) )" style="pointer-events:none">
                        <foreignObject
                            :x="drawingArea.left + (drawingArea.width / maxSeries) * ((selectedSerieIndex !== null ? selectedSerieIndex : 0) || (selectedMinimapIndex !== null ? selectedMinimapIndex : 0)) - 100 + (drawingArea.width / maxSeries / 2)"
                            :y="drawingArea.bottom"
                            width="200"
                            height="40"
                            style="overflow: visible !important;"
                        >
                            <div class="vue-ui-xy-time-tag" :style="`width: fit-content;margin: 0 auto;text-align:center;padding:3px 12px;background:${FINAL_CONFIG.chart.timeTag.backgroundColor};color:${FINAL_CONFIG.chart.timeTag.color};font-size:${FINAL_CONFIG.chart.timeTag.fontSize}px`">
                                {{ timeLabels[(selectedSerieIndex !== null ? selectedSerieIndex : 0) || (selectedMinimapIndex !== null ? selectedMinimapIndex : 0)].text || ((selectedSerieIndex !== null ? selectedSerieIndex : 0) || (selectedMinimapIndex !== null ? selectedMinimapIndex : 0)) }}
                            </div>
                        </foreignObject>
                        <circle
                            :cx="drawingArea.left + (drawingArea.width / maxSeries) * ((selectedSerieIndex !== null ? selectedSerieIndex : 0) || (selectedMinimapIndex !== null ? selectedMinimapIndex : 0)) + (drawingArea.width / maxSeries / 2)"
                            :cy="drawingArea.bottom"
                            :r="FINAL_CONFIG.chart.timeTag.circleMarker.radius"
                            :fill="FINAL_CONFIG.chart.timeTag.circleMarker.color"
                        />
                    </g>
                </g>
    
                <slot name="svg" :svg="svg"/>
            </g>
        </svg>

        <div v-if="$slots.watermark" class="vue-data-ui-watermark">
            <slot name="watermark" v-bind="{ isPrinting: isPrinting || isImaging }"/>
        </div>

        <!-- LINE: TAGS FOLLOWING VALUE -->
        <template v-for="(serie, i) in lineSet" :key="`tag_line_${i}`">
            <template v-for="(plot, j) in serie.plots" :key="`tag_line_${i}_${j}`">
                <div
                    :ref="el => setTagRef(i, j, el, 'right', 'line')"
                    class="vue-ui-xy-tag"
                    data-tag="right"
                    v-if="([selectedMinimapIndex, selectedSerieIndex, selectedRowIndex].includes(j)) && serie.useTag && serie.useTag === 'end' && FINAL_CONFIG.line.tag.followValue"
                    :style="{
                        position: 'fixed',
                        top: placeXYTag({
                            svgElement: svgRef,
                            x: drawingArea.right + FINAL_CONFIG.line.tag.fontSize / 1.5,
                            y: plot.y,
                            element: tagRefs[`${i}_${j}_right_line`],
                            position: 'right'
                        }).top + 'px',
                        left: placeXYTag({
                            svgElement: svgRef,
                            x: drawingArea.right + FINAL_CONFIG.line.tag.fontSize / 1.5,
                            y: plot.y,
                            element: tagRefs[`${i}_${j}_right_line`],
                            position: 'right'
                        }).left + 'px',
                        height: 'fit-content',
                        width: 'fit-content',
                        background: serie.color,
                        color: adaptColorToBackground(serie.color),
                        padding: '0 6px',
                        fontSize: FINAL_CONFIG.line.tag.fontSize + 'px',
                        opacity: 1
                    }"
                >
                    <svg class="vue-ui-xy-tag-arrow" height="20" viewBox="0 0 10 20" :style="{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)'}">
                        <path d="M 0,10 10,0 10,20 Z" :fill="serie.color" stroke="none" />
                    </svg>
                    <div class="vue-ui-xy-tag-content" v-html="
                            applyDataLabel(
                                FINAL_CONFIG.line.tag.formatter,
                                plot.value,
                                serie.name,
                                {
                                    datapoint: plot, seriesIndex: j, serieName: serie.name
                                }
                            )">
                    </div>
                </div>
                <div
                    :ref="el => setTagRef(i, j, el, 'left', 'line')"
                    class="vue-ui-xy-tag"
                    data-tag="left"
                    v-if="([selectedMinimapIndex, selectedSerieIndex, selectedRowIndex].includes(j)) && serie.useTag && serie.useTag === 'start' && FINAL_CONFIG.line.tag.followValue"
                    :style="{
                        position: 'fixed',
                        top: placeXYTag({
                            svgElement: svgRef,
                            x: drawingArea.left - FINAL_CONFIG.line.tag.fontSize / 1.5,
                            y: plot.y,
                            element: tagRefs[`${i}_${j}_left_line`],
                            position: 'left'
                        }).top + 'px',
                        left: placeXYTag({
                            svgElement: svgRef,
                            x: drawingArea.left - FINAL_CONFIG.line.tag.fontSize / 1.5,
                            y: plot.y,
                            element: tagRefs[`${i}_${j}_left_line`],
                            position: 'left'
                        }).left + 'px',
                        height: 'fit-content',
                        width: 'fit-content',
                        background: serie.color,
                        color: adaptColorToBackground(serie.color),
                        padding: '0 6px',
                        fontSize: FINAL_CONFIG.line.tag.fontSize + 'px',
                        opacity: 1
                    }"
                >
                    <svg class="vue-ui-xy-tag-arrow" height="100%" viewBox="0 0 10 20" :style="{ position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)'}">
                        <path d="M 0,0 10,10 0,20 Z" :fill="serie.color" stroke="none" />
                    </svg>
                    <div class="vue-ui-xy-tag-content" v-html="
                            applyDataLabel(
                                FINAL_CONFIG.line.tag.formatter,
                                plot.value,
                                serie.name,
                                {
                                    datapoint: plot, seriesIndex: j, serieName: serie.name
                                }
                            )">
                    </div>
                </div>
            </template>
        </template>

        <!-- PLOT: TAGS FOLLOWING VALUE -->
        <template v-for="(serie, i) in plotSet" :key="`tag_plot_${i}`">
            <template v-for="(plot, j) in serie.plots" :key="`tag_plot_${i}_${j}`">
                <div
                    :ref="el => setTagRef(i, j, el, 'right', 'plot')"
                    class="vue-ui-xy-tag"
                    data-tag="right"
                    v-if="([selectedMinimapIndex, selectedSerieIndex, selectedRowIndex].includes(j)) && serie.useTag && serie.useTag === 'end' && FINAL_CONFIG.plot.tag.followValue"
                    :style="{
                        position: 'fixed',
                        top: placeXYTag({
                            svgElement: svgRef,
                            x: drawingArea.right + FINAL_CONFIG.plot.tag.fontSize / 1.5,
                            y: plot.y,
                            element: tagRefs[`${i}_${j}_right_plot`],
                            position: 'right'
                        }).top + 'px',
                        left: placeXYTag({
                            svgElement: svgRef,
                            x: drawingArea.right + FINAL_CONFIG.plot.tag.fontSize / 1.5,
                            y: plot.y,
                            element: tagRefs[`${i}_${j}_right_plot`],
                            position: 'right'
                        }).left + 'px',
                        height: 'fit-content',
                        width: 'fit-content',
                        background: serie.color,
                        color: adaptColorToBackground(serie.color),
                        padding: '0 6px',
                        fontSize: FINAL_CONFIG.plot.tag.fontSize + 'px',
                        opacity: 1
                    }"
                >
                    <svg class="vue-ui-xy-tag-arrow" height="20" viewBox="0 0 10 20" :style="{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)'}">
                        <path d="M 0,10 10,0 10,20 Z" :fill="serie.color" stroke="none" />
                    </svg>
                    <div class="vue-ui-xy-tag-content" v-html="
                            applyDataLabel(
                                FINAL_CONFIG.plot.tag.formatter,
                                plot.value,
                                serie.name,
                                {
                                    datapoint: plot, seriesIndex: j, serieName: serie.name
                                }
                            )">
                    </div>
                </div>
                <div
                    :ref="el => setTagRef(i, j, el, 'left', 'plot')"
                    class="vue-ui-xy-tag"
                    data-tag="left"
                    v-if="([selectedMinimapIndex, selectedSerieIndex, selectedRowIndex].includes(j)) && serie.useTag && serie.useTag === 'start' && FINAL_CONFIG.plot.tag.followValue"
                    :style="{
                        position: 'fixed',
                        top: placeXYTag({
                            svgElement: svgRef,
                            x: drawingArea.left - FINAL_CONFIG.plot.tag.fontSize / 1.5,
                            y: plot.y,
                            element: tagRefs[`${i}_${j}_left_plot`],
                            position: 'left'
                        }).top + 'px',
                        left: placeXYTag({
                            svgElement: svgRef,
                            x: drawingArea.left - FINAL_CONFIG.plot.tag.fontSize / 1.5,
                            y: plot.y,
                            element: tagRefs[`${i}_${j}_left_plot`],
                            position: 'left'
                        }).left + 'px',
                        height: 'fit-content',
                        width: 'fit-content',
                        background: serie.color,
                        color: adaptColorToBackground(serie.color),
                        padding: '0 6px',
                        fontSize: FINAL_CONFIG.plot.tag.fontSize + 'px',
                        opacity: 1
                    }"
                >
                    <svg class="vue-ui-xy-tag-arrow" height="100%" viewBox="0 0 10 20" :style="{ position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)'}">
                        <path d="M 0,0 10,10 0,20 Z" :fill="serie.color" stroke="none" />
                    </svg>
                    <div class="vue-ui-xy-tag-content" v-html="
                            applyDataLabel(
                                FINAL_CONFIG.plot.tag.formatter,
                                plot.value,
                                serie.name,
                                {
                                    datapoint: plot, seriesIndex: j, serieName: serie.name
                                }
                            )">
                    </div>
                </div>
            </template>
        </template>

        <Slicer
            ref="chartSlicer"
            v-if="FINAL_CONFIG.chart.zoom.show && maxX > 6 && isDataset"
            :key="`slicer_${slicerStep}`"
            :background="FINAL_CONFIG.chart.zoom.color"
            :fontSize="FINAL_CONFIG.chart.zoom.fontSize"
            :useResetSlot="FINAL_CONFIG.chart.zoom.useResetSlot"
            :labelLeft="timeLabels[0].text"
            :labelRight="timeLabels.at(-1).text"
            :textColor="FINAL_CONFIG.chart.color"
            :inputColor="FINAL_CONFIG.chart.zoom.color"
            :selectColor="FINAL_CONFIG.chart.zoom.highlightColor"
            :borderColor="FINAL_CONFIG.chart.backgroundColor"
            :minimap="minimap"
            :smoothMinimap="FINAL_CONFIG.chart.zoom.minimap.smooth"
            :minimapSelectedColor="FINAL_CONFIG.chart.zoom.minimap.selectedColor"
            :minimapSelectionRadius="FINAL_CONFIG.chart.zoom.minimap.selectionRadius"
            :minimapLineColor="FINAL_CONFIG.chart.zoom.minimap.lineColor"
            :minimapSelectedColorOpacity="FINAL_CONFIG.chart.zoom.minimap.selectedColorOpacity"
            :minimapSelectedIndex="selectedSerieIndex"
            :minimapIndicatorColor="FINAL_CONFIG.chart.zoom.minimap.indicatorColor"
            :verticalHandles="FINAL_CONFIG.chart.zoom.minimap.verticalHandles"
            :max="maxX"
            :min="0"
            :valueStart="slicer.start"
            :valueEnd="slicer.end"
            v-model:start="slicer.start"
            v-model:end="slicer.end"
            :refreshStartPoint="FINAL_CONFIG.chart.zoom.startIndex !== null ? FINAL_CONFIG.chart.zoom.startIndex : 0"
            :refreshEndPoint="FINAL_CONFIG.chart.zoom.endIndex !== null ? FINAL_CONFIG.chart.zoom.endIndex + 1 : Math.max(...dataset.map(datapoint => largestTriangleThreeBucketsArray({data:datapoint.series, threshold: FINAL_CONFIG.downsample.threshold}).length))"
            :enableRangeHandles="FINAL_CONFIG.chart.zoom.enableRangeHandles"
            :enableSelectionDrag="FINAL_CONFIG.chart.zoom.enableSelectionDrag"
            @reset="refreshSlicer"
            @trapMouse="selectMinimapIndex"
        >
            <template #reset-action="{ reset }">
                <slot name="reset-action" v-bind="{ reset }"/>
            </template>
        </Slicer>

        <!-- LEGEND AS OUTSIDE DIV -->
        <div ref="chartLegend" data-cy="xy-div-legend" v-if="FINAL_CONFIG.chart.legend.show" class="vue-ui-xy-legend" :style="`font-size:${FINAL_CONFIG.chart.legend.fontSize}px`">
            <div v-for="(legendItem, i) in absoluteDataset" :data-cy="`xy-div-legend-item-${i}`" :key="`div_legend_item_${i}`" @click="segregate(legendItem)" :class="{'vue-ui-xy-legend-item': true, 'vue-ui-xy-legend-item-segregated' : segregatedSeries.includes(legendItem.id)}">
                <svg v-if="icons[legendItem.type] === 'line'" viewBox="0 0 20 12" height="14" width="20">
                        <rect x="0" y="7.5" rx="1.5" :stroke="FINAL_CONFIG.chart.backgroundColor" :stroke-width="0.5" height="3" width="20" :fill="legendItem.color" />
                        <Shape
                            :plot="{x: 10, y:9}"
                            :radius="4"
                            :color="legendItem.color"
                            :shape="['triangle', 'square', 'diamond', 'pentagon', 'hexagon', 'star'].includes(legendItem.shape) ? legendItem.shape : 'circle'"
                            :stroke="FINAL_CONFIG.chart.backgroundColor"
                            :strokeWidth="0.5"
                        />
                </svg>
                <svg v-else-if="icons[legendItem.type] === 'bar'" viewBox="0 0 40 40" height="14" width="14">
                    <rect v-if="icons[legendItem.type] === 'bar' && $slots.pattern" x="0" y="0" rx="1" height="40" width="40" stroke="none" :fill="legendItem.color" />
                    <rect v-if="icons[legendItem.type] === 'bar'" x="0" y="0" rx="1" height="40" width="40" stroke="none" :fill="$slots.pattern ? `url(#pattern_${uniqueId}_${legendItem.slotAbsoluteIndex})` : legendItem.color" />
                </svg>
                <svg v-else viewBox="0 0 12 12" height="14" width="14">
                    <Shape
                        :plot="{x: 6, y:6}"
                        :radius="5"
                        :color="legendItem.color"
                        :shape="['triangle', 'square', 'diamond', 'pentagon', 'hexagon', 'star'].includes(legendItem.shape) ? legendItem.shape : 'circle'"
                    />
                </svg>
                <span :style="`color:${FINAL_CONFIG.chart.legend.color}`">{{legendItem.name}}</span>
            </div>
        </div>

        <div v-else ref="chartLegend">
            <slot name="legend" v-bind:legend="absoluteDataset"/>
        </div>

        <div v-if="$slots.source" ref="source" dir="auto">
            <slot name="source" />
        </div>

        <!-- TOOLTIP -->
        <Tooltip
            :show="mutableConfig.showTooltip && isTooltip"
            :backgroundColor="FINAL_CONFIG.chart.tooltip.backgroundColor"
            :color="FINAL_CONFIG.chart.tooltip.color"
            :fontSize="FINAL_CONFIG.chart.tooltip.fontSize"
            :borderRadius="FINAL_CONFIG.chart.tooltip.borderRadius"
            :borderColor="FINAL_CONFIG.chart.tooltip.borderColor"
            :borderWidth="FINAL_CONFIG.chart.tooltip.borderWidth"
            :backgroundOpacity="FINAL_CONFIG.chart.tooltip.backgroundOpacity"
            :position="FINAL_CONFIG.chart.tooltip.position"
            :offsetY="FINAL_CONFIG.chart.tooltip.offsetY"
            :parent="$refs.chart"
            :content="tooltipContent"
            :isFullscreen="isFullscreen"
            :isCustom="FINAL_CONFIG.chart.tooltip.customFormat && typeof FINAL_CONFIG.chart.tooltip.customFormat === 'function'"
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
                backgroundColor: FINAL_CONFIG.chart.backgroundColor,
                color: FINAL_CONFIG.chart.color
            },
            head: {
                backgroundColor: FINAL_CONFIG.chart.backgroundColor,
                color: FINAL_CONFIG.chart.color
            }
        }">
            <template #content>
                <div :style="`${isPrinting ? '' : 'max-height:400px'};overflow:auto;width:100%;margin-top:48px`">
                    <div style="display: flex; flex-direction:row; gap: 6px; align-items:center; padding-left: 6px" data-dom-to-png-ignore>
                        <input type="checkbox" v-model="showSparklineTable">
                        <div @click="showSparklineTable = !showSparklineTable" style="cursor: pointer">
                            <BaseIcon name="chartLine" :size="20" :stroke="FINAL_CONFIG.chart.color"/>
                        </div>
                    </div>
                    <TableSparkline v-if="showSparklineTable" :key="`sparkline_${segregateStep}`" :dataset="tableSparklineDataset" :config="tableSparklineConfig"/>
                    <DataTable 
                        v-else
                        :key="`table_${tableStep}`"
                        :colNames="dataTable.colNames"
                        :head="dataTable.head"
                        :body="dataTable.body"
                        :config="dataTable.config"
                        :title="`${FINAL_CONFIG.chart.title.text}${FINAL_CONFIG.chart.title.subtitle.text ? ` : ${FINAL_CONFIG.chart.title.subtitle.text}` : ''}`"
                        @close="mutableConfig.showTable = false"
                    >
                        <template #th="{ th }">
                            <div v-html="th"/>
                        </template>
                        <template #td="{ td }">
                        {{ !isNaN(Number(td)) ? dataLabel({
                            p: FINAL_CONFIG.chart.labels.prefix,
                            v: td,
                            s: FINAL_CONFIG.chart.labels.suffix,
                            r: FINAL_CONFIG.table.rounding,
                        }) : td }}
                    </template>
                    </DataTable>
                </div>
            </template>
        </Accordion>

        <!-- v3 Skeleton loader -->
        <BaseScanner v-if="loading"/>
    </div>
</template>

<script setup>
import { 
    abbreviate,
    adaptColorToBackground,
    assignStackRatios,
    applyDataLabel,
    calcLinearProgression,
    calculateNiceScale,
    calculateNiceScaleWithExactExtremes,
    checkNaN, 
    convertColorToHex, 
    convertCustomPalette,
    createCsvContent,
    createPolygonPath,
    createSmoothPath,
    createStraightPath,
    createStar,
    createTSpans,
    createTSpansFromLineBreaksOnX,
    createUid,
    dataLabel,
    downloadCsv,
    forceValidValue,
    functionReturnsString,
    hasDeepProperty,
    isFunction,
    isSafeValue,
    largestTriangleThreeBucketsArray,
    palette,
    placeXYTag,
    setOpacity,
    shiftHue, 
    error,
    objectIsEmpty,
    themePalettes,
    translateSize,
    createSmoothPathWithCuts,
    createStraightPathWithCuts,
    createIndividualAreaWithCuts,
    createSmoothAreaSegments,
    createIndividualArea,
    treeShake
} from '../lib';
import themes from "../themes.json";
import { useConfig } from '../useConfig';
import { useNestedProp } from '../useNestedProp';
import { useTimeLabels } from '../useTimeLabels.js';
import { computed, defineAsyncComponent, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, toRefs, useSlots, watch } from 'vue';
import Slicer from '../atoms/Slicer.vue';
import Title from '../atoms/Title.vue';
import Shape from '../atoms/Shape.vue';
import img from '../img.js';
import { usePrinter } from '../usePrinter.js';
import { useLoading } from '../useLoading.js';
import BaseScanner from '../atoms/BaseScanner.vue';

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

const DataTable = defineAsyncComponent(() => import('../atoms/DataTable.vue'));
const Tooltip = defineAsyncComponent(() => import('../atoms/Tooltip.vue'));
const UserOptions = defineAsyncComponent(() => import('../atoms/UserOptions.vue'));
const BaseIcon = defineAsyncComponent(() => import('../atoms/BaseIcon.vue'));
const TableSparkline = defineAsyncComponent(() => import('./vue-ui-table-sparkline.vue'));
const Accordion = defineAsyncComponent(() => import('./vue-ui-accordion.vue'));
const PackageVersion = defineAsyncComponent(() => import('../atoms/PackageVersion.vue'));
const PenAndPaper = defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'));

const emit = defineEmits(['selectTimeLabel', 'selectX', 'selectLegend']);
const SLOTS = useSlots();
const instance = getCurrentInstance();
const { vue_ui_xy: DEFAULT_CONFIG } = useConfig();

const chart = ref(null);
const chartTitle = ref(null);
const chartSlicer = ref(null);
const chartLegend = ref(null);
const source = ref(null);
const noTitle = ref(null);
const G = ref(null);
const xAxisLabel = ref(null);
const yAxisLabel = ref(null);
const timeLabelsEls = ref(null);

const resizeObserver = ref(null);
const observedEl = ref(null);
const slicerStep = ref(0);
const selectedScale = ref(null);
const useSafeValues = ref(true);
const height = ref(600);
const width = ref(1000);
const viewBox = ref('0 0 1000 600');
const clientPosition = ref({ x: 0, y: 0 });
const icons = ref({ line: 'line', bar: 'bar', plot: 'plot' });
const isAnnotator = ref(false);
const isFullscreen = ref(false);
const isTooltip = ref(false);
const selectedSerieIndex = ref(null);
const selectedRowIndex = ref(null);
const segregatedSeries = ref([]);
const uniqueId = ref(createUid());
const step = ref(0);
const tableStep = ref(0);
const titleStep = ref(0);
const showSparklineTable = ref(true);
const segregateStep = ref(0);
const selectedMinimapIndex = ref(null);
const showUserOptionsOnChartHover = ref(false);
const keepUserOptionState = ref(true);
const userOptionsVisible = ref(true);
const svgRef = ref(null);
const tagRefs = ref({});
const textMeasurer = ref(null);
const remainingHeight = ref(0); // v3
const svgAspectRatio = ref(1); // v3

const svg = computed(() => {
    return {
        height: height.value,
        width: width.value
    }
});

const lttbThreshold = props.config.downsample ? props.config.downsample.threshold ? props.config.downsample.threshold : 500 : 500;

const mutableConfig = ref({
    dataLabels: { show: true },
    showTooltip: true,
    showTable: false,
    isStacked: false,
    useIndividualScale: false
});

const fontSizes = ref({
    xAxis: 18,
    yAxis: 12,
    dataLabels: 20,
    plotLabels: 10
});

const plotRadii = ref({ plot: 3, line: 3 });

onMounted(() => {
    if (props.dataset.length) {
        props.dataset.forEach((ds, i) => {
            if([null, undefined].includes(ds.series)) {
                error({
                    componentName: 'VueUiXy',
                    type: 'datasetSerieAttribute',
                    property: 'series (number[])',
                    index: i,
                    debug: debug.value
                })
            }
        })
    }
});

function prepareConfig() {
    if(!Object.keys(props.config || {}).length) {
        return DEFAULT_CONFIG
    }

    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });

    // ------------------------------ OVERRIDES -----------------------------------

    if (props.config && hasDeepProperty(props.config, 'chart.highlightArea')) {
        if (!Array.isArray(props.config.chart.highlightArea)) {
            mergedConfig.chart.highlightArea = [props.config.chart.highlightArea] // FIXME: should be sanitized using useNestedPropToo
        } else {
            mergedConfig.chart.highlightArea = props.config.chart.highlightArea;
        }
    }
    
    if (props.config && hasDeepProperty(props.config, 'chart.grid.labels.yAxis.scaleMin')) {
        mergedConfig.chart.grid.labels.yAxis.scaleMin = props.config.chart.grid.labels.yAxis.scaleMin;
    } else {
        mergedConfig.chart.grid.labels.yAxis.scaleMin = null;
    }
    
    if (props.config && hasDeepProperty(props.config, 'chart.grid.labels.yAxis.scaleMax')) {
        mergedConfig.chart.grid.labels.yAxis.scaleMax = props.config.chart.grid.labels.yAxis.scaleMax;
    } else {
        mergedConfig.chart.grid.labels.yAxis.scaleMax = null;
    }

    if (props.config && hasDeepProperty(props.config, 'chart.zoom.startIndex')) {
        mergedConfig.chart.zoom.startIndex = props.config.chart.zoom.startIndex;
    } else {
        mergedConfig.chart.zoom.startIndex = null;
    }

    if (props.config && hasDeepProperty(props.config, 'chart.zoom.endIndex')) {
        mergedConfig.chart.zoom.endIndex = props.config.chart.zoom.endIndex;
    } else {
        mergedConfig.chart.zoom.endIndex = null;
    }

    if (props.config && hasDeepProperty(props.config,  'chart.grid.labels.yAxis.groupColor')) {
        mergedConfig.chart.grid.labels.yAxis.groupColor = props.config.chart.grid.labels.yAxis.groupColor;
    } else {
        mergedConfig.chart.grid.labels.yAxis.groupColor = null;
    }

    if (props.config && props.config.chart.annotations && Array.isArray(props.config.chart.annotations) && props.config.chart.annotations.length) {
        mergedConfig.chart.annotations = props.config.chart.annotations.map(annotation => {
            return useNestedProp({
                defaultConfig: DEFAULT_CONFIG.chart.annotations[0],
                userConfig: annotation
            })
        })
    } else {
        mergedConfig.chart.annotations = [];
    }

    // v3 autoSize chart.padding override
    if (props.config && props.config.autoSize) {

        if (props.config && !!props.config.debug) {
            if (props.config.chart.padding.top) {
                console.warn('Vue Data UI - VueUiXy - autoSize mode ignores chart.padding.top, set a 0 value to remove this warning')
            }
            if (props.config.chart.padding.right) {
                console.warn('Vue Data UI - VueUiXy - autoSize mode ignores chart.padding.right, set a 0 value to remove this warning')
            }
            if (props.config.chart.padding.bottom) {
                console.warn('Vue Data UI - VueUiXy - autoSize mode ignores chart.padding.bottom, set a 0 value to remove this warning')
            }
            if (props.config.chart.padding.left) {
                console.warn('Vue Data UI - VueUiXy - autoSize mode ignores chart.padding.left, set a 0 value to remove this warning')
            }
        }

        mergedConfig.chart.padding = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
        }
    }

    // ----------------------------------------------------------------------------

    if (mergedConfig.theme) {
        return {
            ...useNestedProp({
                userConfig: themes.vue_ui_xy[mergedConfig.theme] || props.config,
                defaultConfig: mergedConfig
            }),
            customPalette: themePalettes[mergedConfig.theme] || props.palette
        }
    } else {
        return mergedConfig
    }
}

const isDataset = computed({
    get() {
        return !!props.dataset && props.dataset.length;
    },
    set(bool) {
        return bool;
    }
});

const FINAL_CONFIG = ref(prepareConfig());

// v3 - Skeleton loader management
const { loading, FINAL_DATASET, manualLoading } = useLoading({
    ...toRefs(props),
    FINAL_CONFIG,
    prepareConfig,
    callback: () => {
        Promise.resolve().then(async () => {
            await setupSlicer();
            if (FINAL_CONFIG.value.autoSize) {
                setViewBox();
                forceResizeObserver();
            }
        })
    },
    skeletonDataset: [
        {
            name: '',
            series: [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 134],
            type: 'line',
            smooth: true,
            color: '#BABABA'
        },
        {
            name: '',
            series: [0, 0.5, 1, 1.5, 2.5, 4, 6.5, 10.5, 17, 27.5, 44.5, 67],
            type: 'bar',
            color: '#CACACA'
        },
    ],
    skeletonConfig: treeShake({
        defaultConfig: FINAL_CONFIG.value,
        userConfig: {
            autoSize: false,
            useCssAnimation: false,
            showTable: false,
            chart: {
                annotations: [],
                highlightArea: [],
                backgroundColor: '#99999930',
                grid: {
                    stroke: '#6A6A6A',
                    labels: { 
                        show: false,
                            axis: {
                            yLabel: '',
                            xLabel: ''
                        },
                        xAxisLabels: { show: false },
                        yAxis: {
                            commonScaleSteps: 10,
                            useNiceScale: true,
                            stacked: false,
                            scaleMin: 0,
                            scaleMax: 134
                        },
                        zeroLine: { show: true }
                    },
                },
                legend: {show: false },
                padding: {
                    top:12,
                    bottom: 24,
                    left: 24,
                    right: 24
                },
                userOptions: { show: false },
                zoom: { show: false }
            },
            bar: {
                serieName: { show: false },
                labels: { show: false },
                border: {
                    useSerieColor: false,
                    stroke: '#999999'
                }
            },
            line: {
                dot: {
                    useSerieColor: false,
                    fill: '#8A8A8A'
                },
                labels: { show: false }
            }
        }
    })
});

const maxX = computed({
    get: () => {
        return Math.max(...FINAL_DATASET.value.map(datapoint => largestTriangleThreeBucketsArray({data: datapoint.series, threshold: lttbThreshold}).length));
    },
    set: (v) => v
});

const slicer = ref({ start: 0, end: maxX.value });

const { isPrinting, isImaging, generatePdf, generateImage } = usePrinter({
    elementId: `vue-ui-xy_${uniqueId.value}`,
    fileName: FINAL_CONFIG.value.chart.title.text || 'vue-ui-xy',
    options: FINAL_CONFIG.value.chart.userOptions.print
});

const isAutoSize = computed(() => FINAL_CONFIG.value.autoSize);
const viewBoxParts = computed(() => {
    const [x, y, w, h] = viewBox.value.split(' ').map(Number);
    return { x, y, width: w, height: h };
});

const customPalette = computed(() => {
    return convertCustomPalette(FINAL_CONFIG.value.customPalette);
});

const max = computed(() => {
    if (FINAL_CONFIG.value.chart.grid.labels.yAxis.scaleMax) {
        return FINAL_CONFIG.value.chart.grid.labels.yAxis.scaleMax
    }
    return Math.max(...safeDataset.value.filter(s => !segregatedSeries.value.includes(s.id)).map(datapoint => Math.max(...datapoint.series)));
});

const min = computed(() => {
    if (FINAL_CONFIG.value.chart.grid.labels.yAxis.scaleMin !== null) {
        return FINAL_CONFIG.value.chart.grid.labels.yAxis.scaleMin
    }
    const _min = Math.min(...safeDataset.value.filter(s => !segregatedSeries.value.includes(s.id)).map(datapoint => Math.min(...datapoint.series)));
    if(_min > 0) return 0;
    return _min;
})

const niceScale = computed(() => {
    return FINAL_CONFIG.value.chart.grid.labels.yAxis.useNiceScale ? calculateNiceScale(min.value, max.value < 0 ? 0 : max.value, FINAL_CONFIG.value.chart.grid.labels.yAxis.commonScaleSteps) : calculateNiceScaleWithExactExtremes(min.value, max.value < 0 ? 0 : max.value, FINAL_CONFIG.value.chart.grid.labels.yAxis.commonScaleSteps)
});

const relativeZero = computed(() => {
    if (![null, undefined].includes(FINAL_CONFIG.value.chart.grid.labels.yAxis.scaleMin)) {
        return -niceScale.value.min
    }

    if(niceScale.value.min >= 0) return 0;
    return Math.abs(niceScale.value.min);
});

const safeDataset = computed(() => {
    if(!useSafeValues.value) return FINAL_DATASET.value;

    return FINAL_DATASET.value.map((datapoint, i) => {
        const LTTD = largestTriangleThreeBucketsArray({
            data: datapoint.series,
            threshold: FINAL_CONFIG.value.downsample.threshold
        })
        const id = `uniqueId_${i}`;
        return {
            ...datapoint,
            slotAbsoluteIndex: i,
            series: LTTD.map(d => {
                return isSafeValue(d) ? d : null
            }).slice(slicer.value.start, slicer.value.end),
            color: convertColorToHex(datapoint.color ? datapoint.color : customPalette.value[i] ? customPalette.value[i] : palette[i]),
            id,
            scaleLabel: datapoint.scaleLabel || id

        }
    });
});

const absoluteDataset = computed(() => {
    return safeDataset.value.map((datapoint, i) => {
        return {
            absoluteIndex: i,
            ...datapoint,
            series: datapoint.series.map(plot => plot + relativeZero.value),
            absoluteValues: datapoint.series,
            segregate: () => segregate(datapoint),
            isSegregated: segregatedSeries.value.includes(datapoint.id)
        }
    })
});

const relativeDataset = computed(() => {
    return safeDataset.value.map((datapoint, i) => {
        return {
            ...datapoint,
            series: datapoint.series.map(plot => plot + relativeZero.value),
            absoluteValues: datapoint.series,
        }
    }).filter(s => !segregatedSeries.value.includes(s.id));
})

const drawingArea = computed(() => {
    function getUniqueScaleLabelsCount(dataset) {
    const uniqueLabels = new Set();
        dataset.forEach(item => {
            const label = item.scaleLabel || '__noScaleLabel__';
            uniqueLabels.add(label);
        });
        return uniqueLabels.size;
        }

    const len = getUniqueScaleLabelsCount(absoluteDataset.value.filter(s => !segregatedSeries.value.includes(s.id)));

    const individualScalesPadding = mutableConfig.value.useIndividualScale && FINAL_CONFIG.value.chart.grid.labels.show ? len * (mutableConfig.value.isStacked ? 0 : FINAL_CONFIG.value.chart.grid.labels.yAxis.labelWidth) : 0;
    return {
        top: isAutoSize.value ? 0 : FINAL_CONFIG.value.chart.padding.top,
        right: isAutoSize.value ? width.value : width.value - FINAL_CONFIG.value.chart.padding.right,
        bottom: isAutoSize.value ? height.value : height.value - FINAL_CONFIG.value.chart.padding.bottom,
        left: isAutoSize.value ? individualScalesPadding : FINAL_CONFIG.value.chart.padding.left + individualScalesPadding,
        height: isAutoSize.value ? height.value : height.value - (FINAL_CONFIG.value.chart.padding.top + FINAL_CONFIG.value.chart.padding.bottom),
        width: isAutoSize.value ? width.value - individualScalesPadding :width.value - (FINAL_CONFIG.value.chart.padding.right + FINAL_CONFIG.value.chart.padding.left + individualScalesPadding)
    }
});

function usesSelectTimeLabelEvent() {
    return !!instance?.vnode.props?.onSelectTimeLabel
}

function getTextMeasurer(fontSize, fontFamily, fontWeight) {
    if (!textMeasurer.value) {
        const canvas = document.createElement('canvas')
        textMeasurer.value = canvas.getContext('2d')
    }
    textMeasurer.value.font = 
        `${fontWeight || 'normal'} ${fontSize}px ${fontFamily || 'sans-serif'}`
    return textMeasurer.value
}

function hideTags() {
    const tags = chart.value.querySelectorAll('.vue-ui-xy-tag')
    if (tags.length) {
        Array.from(tags).forEach(tag => tag.style.opacity = '0')
    }
}

function setTagRef(i, j, el, position, type) {
    if (el) tagRefs.value[`${i}_${j}_${position}_${type}`] = el;
}

function setUserOptionsVisibility(state = false) {
    if (!showUserOptionsOnChartHover.value) return;
    userOptionsVisible.value = state
}

function toggleAnnotator() {
    isAnnotator.value = !isAnnotator.value;
}

const timeLabels = computed(() => {
    const _max = Math.max(...FINAL_DATASET.value.map(datapoint => largestTriangleThreeBucketsArray({data:datapoint.series, threshold: FINAL_CONFIG.value.downsample.threshold}).length));

    return useTimeLabels({
        values: FINAL_CONFIG.value.chart.grid.labels.xAxisLabels.values,
        maxDatapoints: _max,
        formatter: FINAL_CONFIG.value.chart.grid.labels.xAxisLabels.datetimeFormatter,
        start: slicer.value.start,
        end: slicer.value.end
    });
});

function selectTimeLabel(label, relativeIndex) {
    const datapoint = relativeDataset.value.map(datapoint => {
        return {
            shape: datapoint.shape || null,
            name: datapoint.name,
            color: datapoint.color,
            type: datapoint.type,
            value: datapoint.absoluteValues.find((_s,i) => i === relativeIndex),
            comments: datapoint.comments || [],
            prefix: datapoint.prefix || FINAL_CONFIG.value.chart.labels.prefix,
            suffix: datapoint.suffix || FINAL_CONFIG.value.chart.labels.suffix,
        }
    })
    emit('selectTimeLabel', {
        datapoint,
        absoluteIndex: label.absoluteIndex,
        label: label.text
    })
}

const maxSeries = computed(() => slicer.value.end - slicer.value.start);

async function setXAxisLabel() {
    if (!xAxisLabel.value) return;
    await nextTick();
    let y = drawingArea.value.bottom;
    if (timeLabelsEls.value) {
        y += timeLabelsEls.value.getBBox().height
    }
    xAxisLabel.value.setAttribute('y', y + (fontSizes.value.xAxis * 1.3) + FINAL_CONFIG.value.chart.grid.labels.axis.xLabelOffsetY);
}

async function setYAxisLabel() {
    if (!yAxisLabel.value) return;
    await nextTick();
    yAxisLabel.value.setAttribute('transform', `translate(${viewBoxParts.value.x + FINAL_CONFIG.value.chart.grid.labels.axis.yLabelOffsetX + fontSizes.value.yAxis}, ${drawingArea.value.top + drawingArea.value.height /  2}) rotate(-90)`)
}

async function setViewBox() {
    await nextTick();
    const g = G.value;
    if (!g) return;
    viewBox.value = `0 0 ${FINAL_CONFIG.value.chart.width} ${FINAL_CONFIG.value.chart.height}`;
    setXAxisLabel();
    await nextTick();
    setYAxisLabel();
    const newBB = g.getBBox();
    viewBox.value = `${newBB.x} ${newBB.y - fontSizes.value.plotLabels} ${newBB.width + FINAL_CONFIG.value.chart.padding.left} ${newBB.height + fontSizes.value.plotLabels + FINAL_CONFIG.value.chart.padding.top}`;
    await nextTick();
    chart.value.classList.remove('no-transition');
}

function forceResizeObserver() {
    if (!FINAL_CONFIG.value.responsive) return;
    if (chart.value) {
        const parent = chart.value.parentNode;
        if (parent) {
            const initW = parent.getBoundingClientRect().width;
            parent.style.width = initW - 0.1 + 'px';
            setTimeout(() => {
                parent.style.width = initW + 'px';
            }, 0);
        }
    }
}

function selectMinimapIndex(i) {
    selectedMinimapIndex.value = i;
}

function toggleStack() {
    mutableConfig.value.isStacked = !mutableConfig.value.isStacked
    if (!mutableConfig.value.isStacked) {
        mutableConfig.value.useIndividualScale = FINAL_CONFIG.value.chart.grid.labels.yAxis.useIndividualScale;
    } else {
        mutableConfig.value.useIndividualScale = true
    }
}

function checkAutoScaleError(datapoint) {
    if (!debug.value) return;
    if (datapoint.autoScaling) {
        if (!FINAL_CONFIG.value.chart.grid.labels.yAxis.useIndividualScale) {
            console.warn(`VueUiXy (datapoint: ${datapoint.name}) : autoScaling only works when config.chart.grid.labels.yAxis.useIndividualScale is set to true`)
        }
        if (!FINAL_CONFIG.value.chart.grid.labels.yAxis.stacked) {
            console.warn(`VueUiXy (datapoint: ${datapoint.name}) : autoScaling only works when config.chart.grid.labels.yAxis.stacked is set to true`)
        }
    }
}

function fillArray(len, src) {
    let res = Array(len).fill(0);
    for (let i = 0; i  < src.length && i < len; i += 1) {
        res[i] = src[i];
    }
    return res;
}

function validSlicerEnd(v) {
    const _max = Math.max(...FINAL_DATASET.value.map(datapoint => largestTriangleThreeBucketsArray({data:datapoint.series, threshold: FINAL_CONFIG.value.downsample.threshold}).length));
    if (v > _max) {
        return _max;
    }
    if (v < 0 || (FINAL_CONFIG.value.chart.zoom.startIndex !== null && v < FINAL_CONFIG.value.chart.zoom.startIndex)) {
        if (FINAL_CONFIG.value.chart.zoom.startIndex !== null) {
            return FINAL_CONFIG.value.chart.zoom.startIndex + 1
        } else {
            return 1
        }
    }
    return v;
}

async function setupSlicer() {
    if ((FINAL_CONFIG.value.chart.zoom.startIndex !== null || FINAL_CONFIG.value.chart.zoom.endIndex !== null) && chartSlicer.value) {
        if (FINAL_CONFIG.value.chart.zoom.startIndex !== null) {
            await nextTick();
            await nextTick();
            chartSlicer.value.setStartValue(FINAL_CONFIG.value.chart.zoom.startIndex);
        }
        if (FINAL_CONFIG.value.chart.zoom.endIndex !== null) {
            await nextTick();
            await nextTick();
            chartSlicer.value.setEndValue(validSlicerEnd(FINAL_CONFIG.value.chart.zoom.endIndex + 1));
        }
    } else {
        slicer.value = {
            start: 0,
            end: Math.max(...FINAL_DATASET.value.map(datapoint => largestTriangleThreeBucketsArray({ data:datapoint.series, threshold: FINAL_CONFIG.value.downsample.threshold}).length))
        };
        slicerStep.value += 1;
    }
}

function refreshSlicer() {
    setupSlicer();
}

function canShowValue(v) {
    return ![null, undefined, NaN, Infinity, -Infinity].includes(v);
}

const absoluteMax = computed(() => niceScale.value.max + relativeZero.value);

function ratioToMax(v) {
    return v / (canShowValue(absoluteMax.value) ? absoluteMax.value : 1);
}

const zero = computed(() => {
    if (isNaN(ratioToMax(relativeZero.value))) {
        return drawingArea.value.bottom;
    } else {
        return drawingArea.value.bottom - (drawingArea.value.height * ratioToMax(relativeZero.value));
    }
});

function calcRectHeight(plot) {
    const zeroForPositiveValuesOnly = ![null, undefined].includes(FINAL_CONFIG.value.chart.grid.labels.yAxis.scaleMin) && FINAL_CONFIG.value.chart.grid.labels.yAxis.scaleMin > 0 && min.value >= 0 ? drawingArea.value.bottom : zero.value;

    if(plot.value >= 0) {
        return checkNaN(zeroForPositiveValuesOnly - plot.y <= 0 ? 0.00001 : zeroForPositiveValuesOnly - plot.y);
    } else {
        return checkNaN(plot.y - zero.value <= 0 ? 0.00001 : plot.y - zero.value);
    }
}

function calcIndividualHeight(plot) {
    if(plot.value >= 0) {
        return checkNaN(plot.zeroPosition - plot.y <= 0 ? 0.00001 : plot.zeroPosition - plot.y)
    } else {
        return checkNaN(plot.y - plot.zeroPosition <= 0 ? 0.00001 : plot.zeroPosition - plot.y)
    }
}

const slot = computed(() => {
    return {
        bar: drawingArea.value.width / maxSeries.value / safeDataset.value.filter(serie => serie.type === 'bar').filter(s => !segregatedSeries.value.includes(s.id)).length,
        plot: drawingArea.value.width / maxSeries.value,
        line: drawingArea.value.width / maxSeries.value,
    }
})

function calcRectWidth() {
    if(mutableConfig.value.useIndividualScale && mutableConfig.value.isStacked) {
        return slot.value.line - ((drawingArea.value.width / maxSeries.value) * 0.1);
    }
    return slot.value.bar;
}

function calcRectX(plot) {
    if (mutableConfig.value.useIndividualScale && mutableConfig.value.isStacked) {
        return plot.x + ((drawingArea.value.width / maxSeries.value) * 0.05)
    }
    return plot.x + (slot.value.bar / 2);
}

function calcRectY(plot) {
    if(plot.value >= 0) return plot.y;
    return [null, undefined, NaN, Infinity, -Infinity].includes(zero.value) ? drawingArea.bottom.value : zero.value;
}

function calcIndividualRectY(plot) {
    if(plot.value >= 0) return plot.y;
    return [null, undefined, NaN, Infinity, -Infinity].includes(plot.zeroPosition) ? 0 : plot.zeroPosition;
}

function selectX(index) {
    emit('selectX', 
        {
            dataset: relativeDataset.value.map(s => {
                return {
                    name: s.name,
                    value: [null, undefined, NaN].includes(s.absoluteValues[index]) ? null : s.absoluteValues[index],
                    color: s.color,
                    type: s.type
                }
            }),
            index,
            indexLabel: FINAL_CONFIG.value.chart.grid.labels.xAxisLabels.values[index]
        }
    );
}

function getData() {
    return absoluteDataset.value.map(s => {
        return {
            values: s.absoluteValues,
            color: s.color,
            name: s.name,
            type: s.type
        }
    });
}

async function getImage({ scale = 2} = {}) {
    if (!chart.value) return
    const { width, height } = chart.value.getBoundingClientRect();
    const aspectRatio = width / height;
    const { imageUri, base64 } = await img({ domElement: chart.value, base64: true, img: true, scale})
    return { 
        imageUri, 
        base64, 
        title: FINAL_CONFIG.value.chart.title.text,
        width,
        height,
        aspectRatio
    }
}

function segregate(legendItem){
    if(segregatedSeries.value.includes(legendItem.id)) {
        segregatedSeries.value = segregatedSeries.value.filter(id => id !== legendItem.id);
    }else {
        if(segregatedSeries.value.length + 1 === safeDataset.value.length) return;
        segregatedSeries.value.push(legendItem.id);
    }
    emit('selectLegend', relativeDataset.value.map(s => {
        return {
            name: s.name,
            values: s.absoluteValues,
            color: s.color,
            type: s.type
        }
    }));
    segregateStep.value += 1;
}

const chartAriaLabel = computed(() => {
    const titleText = FINAL_CONFIG.value.chart.title.text || 'Chart visualization';
    const subtitleText = FINAL_CONFIG.value.chart.title.subtitle.text || '';
    return `${titleText}. ${subtitleText}`;
});

const optimize = computed(() => {
    return {
        linePlot: maxSeries.value > FINAL_CONFIG.value.line.dot.hideAboveMaxSerieLength
    }
});

const hasOptionsNoTitle = computed(() => {
    return FINAL_CONFIG.value.chart.userOptions.show && (!FINAL_CONFIG.value.chart.title.show || !FINAL_CONFIG.value.chart.title.text);
});

const highlightAreas = computed(() => {
    if (Array.isArray(FINAL_CONFIG.value.chart.highlightArea)) {
        return FINAL_CONFIG.value.chart.highlightArea.map(area => {
            const areaTo = Math.min(area.to, maxX.value - 1)
            return {
                ...area,
                span: area.from === areaTo ? 1 : areaTo < area.from ? 0 : areaTo - area.from + 1
            }
        })
    }
    const area = {
        ...FINAL_CONFIG.value.chart.highlightArea,
        to: Math.min(FINAL_CONFIG.value.chart.highlightArea.to, maxX.value - 1)
    };
    return [ {...area, span: area.from === area.to ? 1 : area.to < area.from ? 0 : area.to - area.from + 1} ];
});

const datasetWithIds = computed(() => {
    if(!useSafeValues.value) return FINAL_DATASET.value;
    return FINAL_DATASET.value.map((datapoint, i) => {
        return {
            ...datapoint,
            series: largestTriangleThreeBucketsArray({
                data: datapoint.series,
                threshold: FINAL_CONFIG.value.downsample.threshold
            }),
            id: `uniqueId_${i}`
        }
    });
});

const tableSparklineDataset = computed(() => {
    return relativeDataset.value.map(ds => {
        const source = ds.absoluteValues.map(s => [undefined, null].includes(s) ? 0 : s);
        return {
            id: ds.id,
            name: ds.name,
            color: ds.color,
            values: fillArray(maxSeries.value, source)
        }
    });
});

const tableSparklineConfig = computed(() => {
    return {
        responsiveBreakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint,
        roundingValues: FINAL_CONFIG.value.table.rounding,
        showAverage: false,
        showMedian: false,
        showTotal: false,
        fontFamily: FINAL_CONFIG.value.chart.fontFamily,
        prefix: FINAL_CONFIG.value.chart.labels.prefix,
        suffix: FINAL_CONFIG.value.chart.labels.suffix,
        colNames: timeLabels.value.map(tl => tl.text),
        thead: {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            outline: FINAL_CONFIG.value.table.th.outline
        },
        tbody: {
            backgroundColor: FINAL_CONFIG.value.table.td.backgroundColor,
            color: FINAL_CONFIG.value.table.td.color,
            outline: FINAL_CONFIG.value.table.td.outline
        },
        userOptions: {
            show: false
        }
    }
});

const xPadding = computed(() => {
    return FINAL_CONFIG.value.chart.grid.position === 'middle' ? 0 : drawingArea.value.width / maxSeries.value / 2;
});

const activeSeriesWithStackRatios = computed(() => {
    return assignStackRatios(absoluteDataset.value.filter(ds => !segregatedSeries.value.includes(ds.id)));
});

const scaleGroups = computed(() => {
    const grouped = Object.groupBy(activeSeriesWithStackRatios.value, item => item.scaleLabel);
    const result = {};
    for (const [group, items] of Object.entries(grouped)) {
        const allValues = items.flatMap(item => item.absoluteValues);
        result[group] = {
            min: Math.min(...allValues) || 0,
            max: Math.max(...allValues) || 1,
            groupId: `scale_group_${createUid()}`
        };
    }
    return result;
});

const barSlot = computed(() => {
    const len = safeDataset.value.filter(serie => serie.type === 'bar').filter(s => !segregatedSeries.value.includes(s.id)).length
    return (drawingArea.value.width) / maxSeries.value / len - (barPeriodGap.value * len)
});

const barPeriodGap = computed(() => slot.value.line * FINAL_CONFIG.value.bar.periodGap);

const minimap = computed(() => {
    if(!FINAL_CONFIG.value.chart.zoom.minimap.show) return [];
    const _source = datasetWithIds.value.filter(ds => !segregatedSeries.value.includes(ds.id));
    const maxIndex = Math.max(..._source.map(datapoint => datapoint.series.length));

    const sumAllSeries = [];
    for (let i = 0; i < maxIndex; i += 1) {
        sumAllSeries.push(_source.map(ds => ds.series[i] || 0).reduce((a, b) => (a || 0) + (b || 0), 0))
    }
    const _min = Math.min(...sumAllSeries);
    return sumAllSeries.map(dp => dp + (_min < 0 ? Math.abs(_min) : 0)) // positivized
});

const selectedSeries = computed(() => {
    return relativeDataset.value.map(datapoint => {
        return {
            slotAbsoluteIndex: datapoint.slotAbsoluteIndex,
            shape: datapoint.shape || null,
            name: datapoint.name,
            color: datapoint.color,
            type: datapoint.type,
            value: datapoint.absoluteValues.find((_s,i) => i === selectedSerieIndex.value),
            comments: datapoint.comments || [],
            prefix: datapoint.prefix || FINAL_CONFIG.value.chart.labels.prefix,
            suffix: datapoint.suffix || FINAL_CONFIG.value.chart.labels.suffix,
        }
    });
});

const yLabels = computed(() => {
    return niceScale.value.ticks.map(t => {
        return {
            y: t >= 0 ? zero.value - (drawingArea.value.height * ratioToMax(t)) : zero.value + (drawingArea.value.height * ratioToMax(Math.abs(t))),
            value: t,
            prefix: FINAL_CONFIG.value.chart.labels.prefix,
            suffix: FINAL_CONFIG.value.chart.labels.suffix,
        }
    });
});

const annotationsY = computed(() => {
    const ann = FINAL_CONFIG.value.chart.annotations;
    if (!ann || !Array.isArray(ann) || ann.every(a => !a.show)) return [];

    const visible = ann.filter(a =>
        a.show &&
        (a.yAxis.yTop != null || a.yAxis.yBottom != null)
    );

    if (!visible.length) return [];

    const { left, right } = drawingArea.value;
    const zeroY = zero.value;
    const _height = drawingArea.value.height;
    const _min = niceScale.value.min;
    const _max = niceScale.value.max;
    const range = _max - _min;

    const toY = v => {
        const ratio = (v - 0) / range;
        return zeroY - (ratio * _height);
    };

    return visible.map(annotation => {
        const { yAxis: { yTop: rawTop, yBottom: rawBottom, label } } = annotation;
        const hasArea = rawTop != null && rawBottom != null && rawTop !== rawBottom;

        const yTop = rawTop == null ? null : toY(rawTop);
        const yBottom = rawBottom == null ? null : toY(rawBottom);

        const ctx = getTextMeasurer(label.fontSize);
        ctx.font = `${label.fontSize}px sans-serif`;
        const textWidth  = ctx.measureText(label.text).width;
        const textHeight = label.fontSize;

        const xText = (label.position === 'start' ? left + label.padding.left : right - label.padding.right) + label.offsetX;

        const baselineY = (yTop != null && yBottom != null)
            ? Math.min(yTop, yBottom)
            : (yTop != null ? yTop : yBottom);

        const yText = baselineY - (label.fontSize / 3) + label.offsetY - label.padding.top;

        let rectX;
        if (label.textAnchor === 'middle') {
            rectX = xText - (textWidth / 2) - label.padding.left;
        } else if (label.textAnchor === 'end') {
            rectX = xText - textWidth - label.padding.right;
        } else {
            rectX = xText - label.padding.left;
        }

        const rectY = yText - (textHeight * 0.75) - label.padding.top;
        const show = ![yTop, yBottom, rectY].includes(NaN);

        return {
            show,
            id: `annotation_y_${createUid()}`,
            hasArea,
            areaHeight: hasArea ? Math.abs(yTop - yBottom) : 0,
            yTop,
            yBottom,
            config: annotation.yAxis,
            x1: left,
            x2: right,
            _text: { x: xText, y: yText },
            _box: {
                x: rectX,
                y: rectY,
                width:  textWidth + label.padding.left + label.padding.right,
                height: textHeight + label.padding.top + label.padding.bottom,
                fill:   label.backgroundColor,
                stroke: label.border.stroke,
                rx:     label.border.rx,
                ry:     label.border.ry,
                strokeWidth: label.border.strokeWidth
            }
        };
    });
});

/******************************************************************************************/
/                                 DATAPOINTS COMPUTING                                     /
/******************************************************************************************/

const barSet = computed(() => {
    const stackSeries = activeSeriesWithStackRatios.value
        .filter(s => ['bar','line','plot'].includes(s.type));
    const totalSeries = stackSeries.length;
    const gap = FINAL_CONFIG.value.chart.grid.labels.yAxis.gap;
    const stacked = mutableConfig.value.isStacked;
    const totalGap = stacked ? gap * (totalSeries - 1) : 0
    const usableHeight = drawingArea.value.height - totalGap;

    return stackSeries.filter(s => s.type === 'bar').map((datapoint, i) => {
        checkAutoScaleError(datapoint);
        const _min = scaleGroups.value[datapoint.scaleLabel].min;
        const _max = scaleGroups.value[datapoint.scaleLabel].max;
        const autoScaledRatios = datapoint.absoluteValues.filter(v => ![null, undefined].includes(v)).map(v => {
            return (v - _min) / (_max - _min)
        });

        const autoScale = {
            ratios: autoScaledRatios,
            valueMin: _min,
            valueMax: _max < 0 ? 0 : _max,
        }

        const individualExtremes = {
            max: datapoint.scaleMax || Math.max(...datapoint.absoluteValues) || 1,
            min: datapoint.scaleMin || Math.min(...datapoint.absoluteValues.filter(v => ![undefined,null].includes(v))) > 0 ? 0 : Math.min(...datapoint.absoluteValues.filter(v => ![null, undefined].includes(v)))
        };
        const scaleSteps = datapoint.scaleSteps || FINAL_CONFIG.value.chart.grid.labels.yAxis.commonScaleSteps;

        const corrector = 1.0000001;

        const individualScale = FINAL_CONFIG.value.chart.grid.labels.yAxis.useNiceScale ? calculateNiceScale(individualExtremes.min, individualExtremes.max === individualExtremes.min ? individualExtremes.max * corrector : individualExtremes.max, scaleSteps) : calculateNiceScaleWithExactExtremes(individualExtremes.min, individualExtremes.max === individualExtremes.min ? individualExtremes.max * corrector : individualExtremes.max, scaleSteps);
        
        const autoScaleSteps = FINAL_CONFIG.value.chart.grid.labels.yAxis.useNiceScale ? calculateNiceScale(autoScale.valueMin, autoScale.valueMax === autoScale.valueMin ? autoScale.valueMax * corrector : autoScale.valueMax, scaleSteps) : calculateNiceScaleWithExactExtremes(autoScale.valueMin, autoScale.valueMax === autoScale.valueMin ? autoScale.valueMax * corrector : autoScale.valueMax, scaleSteps);

        const individualZero = individualScale.min >= 0 ? 0 : Math.abs(individualScale.min);
        const autoScaleZero = 0;

        const individualMax = individualScale.max + individualZero;
        const autoScaleMax = autoScaleSteps.max + Math.abs(autoScaleZero);

        const origIdx = datapoint.stackIndex;
        const flippedIdx = totalSeries - 1 - origIdx;
        const flippedLowerRatio  = stacked ? 1 - datapoint.cumulatedStackRatio : 0;
        const yOffset = stacked ? usableHeight * flippedLowerRatio + gap * flippedIdx : 0;
        const individualHeight = stacked ? usableHeight * datapoint.stackRatio : drawingArea.value.height;

        const zeroPosition = drawingArea.value.bottom - yOffset - ((individualHeight) * individualZero / individualMax);
        const autoScaleZeroPosition = drawingArea.value.bottom - yOffset - (individualHeight * autoScaleZero / autoScaleMax);

        const barLen = absoluteDataset.value.filter(ds => ds.type === 'bar').filter(s => !segregatedSeries.value.includes(s.id)).length;

        const plots = datapoint.series.map((plot, j) => {
            const yRatio = mutableConfig.value.useIndividualScale ? ((datapoint.absoluteValues[j] + individualZero) / individualMax) : ratioToMax(plot)
            const x = mutableConfig.value.useIndividualScale && mutableConfig.value.isStacked 
                ? drawingArea.value.left + (drawingArea.value.width / maxSeries.value * j) 
                : drawingArea.value.left
                    + (slot.value.bar * i)
                    + (slot.value.bar * j * barLen)
                    - (barSlot.value / 2)
                    - (i * barPeriodGap.value)


            return {
                yOffset: checkNaN(yOffset),
                individualHeight: checkNaN(individualHeight),
                x: checkNaN(x),
                y: drawingArea.value.bottom - yOffset - (individualHeight * yRatio),
                value: datapoint.absoluteValues[j],
                zeroPosition: checkNaN(zeroPosition),
                individualMax: checkNaN(individualMax),
                comment: datapoint.comments ? datapoint.comments.slice(slicer.value.start, slicer.value.end)[j] || '' : ''
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
            const x = mutableConfig.value.useIndividualScale && mutableConfig.value.isStacked 
                ? drawingArea.value.left + (drawingArea.value.width / maxSeries.value * j) 
                : (drawingArea.value.left - slot.value.bar/2 + slot.value.bar * i) + (slot.value.bar * j * absoluteDataset.value.filter(ds => ds.type === 'bar').filter(s => !segregatedSeries.value.includes(s.id)).length);
            return {
                yOffset: checkNaN(yOffset),
                individualHeight: checkNaN(individualHeight),
                x: checkNaN(x),
                y: checkNaN(drawingArea.value.bottom - checkNaN(yOffset) - ((checkNaN(individualHeight) * autoScaleRatiosToNiceScale[j]) || 0)),
                value: datapoint.absoluteValues[j],
                zeroPosition: checkNaN(zeroPosition),
                individualMax: checkNaN(individualMax),
                comment: datapoint.comments ? datapoint.comments.slice(slicer.value.start, slicer.value.end)[j] || '' : ''
            }
        });

        const scaleYLabels = individualScale.ticks.map(t => {
            return {
                y: t >= 0 ? zeroPosition - (individualHeight * (t / individualMax)) : zeroPosition + (individualHeight * Math.abs(t) / individualMax),
                value: t,
                prefix: datapoint.prefix || FINAL_CONFIG.value.chart.labels.prefix,
                suffix: datapoint.suffix || FINAL_CONFIG.value.chart.labels.suffix,
                datapoint
            }
        });

        const autoScaleYLabels = autoScaleSteps.ticks.map(t => {
            const v = (t - autoScaleSteps.min) / (autoScaleSteps.max - autoScaleSteps.min);
            return {
                y: t >= 0 ? autoScaleZeroPosition - (individualHeight * v) : autoScaleZeroPosition + (individualHeight * v),
                value: t,
                prefix: datapoint.prefix || FINAL_CONFIG.value.chart.labels.prefix,
                suffix: datapoint.suffix || FINAL_CONFIG.value.chart.labels.suffix,
                datapoint
            }
        });

        scaleGroups.value[datapoint.scaleLabel].name = datapoint.name;
        scaleGroups.value[datapoint.scaleLabel].groupName = datapoint.scaleLabel;
        scaleGroups.value[datapoint.scaleLabel].groupColor = FINAL_CONFIG.value.chart.grid.labels.yAxis.groupColor || datapoint.color;
        scaleGroups.value[datapoint.scaleLabel].color = datapoint.color;
        scaleGroups.value[datapoint.scaleLabel].scaleYLabels = datapoint.autoScaling ? autoScaleYLabels : scaleYLabels;
        scaleGroups.value[datapoint.scaleLabel].zeroPosition = datapoint.autoScaling ? autoScaleZeroPosition : zeroPosition;
        scaleGroups.value[datapoint.scaleLabel].individualMax = datapoint.autoScaling ? autoScaleMax : individualMax;
        scaleGroups.value[datapoint.scaleLabel].scaleLabel = datapoint.scaleLabel;
        scaleGroups.value[datapoint.scaleLabel].id = datapoint.id;
        scaleGroups.value[datapoint.scaleLabel].yOffset = yOffset;
        scaleGroups.value[datapoint.scaleLabel].individualHeight = individualHeight;
        scaleGroups.value[datapoint.scaleLabel].autoScaleYLabels = autoScaleYLabels;
        scaleGroups.value[datapoint.scaleLabel].unique = activeSeriesWithStackRatios.value.filter(el => el.scaleLabel === datapoint.scaleLabel).length === 1

        return {
            ...datapoint,
            yOffset,
            autoScaleYLabels,
            individualHeight,
            scaleYLabels: datapoint.autoScaling ? autoScaleYLabels : scaleYLabels,
            individualScale: datapoint.autoScaling ? autoScaleSteps : individualScale,
            individualMax: datapoint.autoScaling ? autoScaleMax : individualMax,
            zeroPosition: datapoint.autoScaling ? autoScaleZeroPosition : zeroPosition,
            plots: datapoint.autoScaling ? autoScalePlots: plots,
            groupId: scaleGroups.value[datapoint.scaleLabel].groupId
        }
    })
});

const lineSet = computed(() => {
    const stackSeries   = activeSeriesWithStackRatios.value
        .filter(s => ['bar','line','plot'].includes(s.type));
    const totalSeries = stackSeries.length;
    const gap = FINAL_CONFIG.value.chart.grid.labels.yAxis.gap;
    const stacked = mutableConfig.value.isStacked;
    const totalGap = stacked ? gap * (totalSeries - 1) : 0
    const usableHeight = drawingArea.value.height - totalGap;

    return stackSeries.filter(s => s.type === 'line').map((datapoint, i) => {
        checkAutoScaleError(datapoint);

        const _min = scaleGroups.value[datapoint.scaleLabel].min;
        const _max = scaleGroups.value[datapoint.scaleLabel].max;
        const autoScaledRatios = datapoint.absoluteValues.filter(v => ![null, undefined].includes(v)).map(v => {
            return (v - _min) / (_max - _min)
        });
        const autoScale = {
            ratios: autoScaledRatios,
            valueMin: _min,
            valueMax: _max,
        }

        const individualExtremes = {
            max: datapoint.scaleMax || Math.max(...datapoint.absoluteValues) || 1,
            min: datapoint.scaleMin || (Math.min(...datapoint.absoluteValues) > 0 ? 0 : Math.min(...datapoint.absoluteValues))
        };

        const scaleSteps = datapoint.scaleSteps || FINAL_CONFIG.value.chart.grid.labels.yAxis.commonScaleSteps

        const corrector = 1.0000001;

        const individualScale = FINAL_CONFIG.value.chart.grid.labels.yAxis.useNiceScale ? calculateNiceScale(individualExtremes.min, individualExtremes.max === individualExtremes.min ? individualExtremes.max * corrector : individualExtremes.max, scaleSteps) : calculateNiceScaleWithExactExtremes(individualExtremes.min, individualExtremes.max === individualExtremes.min ? individualExtremes.max * corrector : individualExtremes.max, scaleSteps);
        
        const autoScaleSteps = FINAL_CONFIG.value.chart.grid.labels.yAxis.useNiceScale ? calculateNiceScale(autoScale.valueMin, autoScale.valueMax === autoScale.valueMin ? autoScale.valueMax * corrector : autoScale.valueMax, scaleSteps) : calculateNiceScaleWithExactExtremes(autoScale.valueMin, autoScale.valueMax === autoScale.valueMin ? autoScale.valueMax * corrector : autoScale.valueMax, scaleSteps);

        const individualZero = (individualScale.min >= 0 ? 0 : Math.abs(individualScale.min));
        const autoScaleZero = 0;

        const individualMax = individualScale.max + Math.abs(individualZero);
        const autoScaleMax = autoScaleSteps.max + Math.abs(autoScaleZero);

        const origIdx = datapoint.stackIndex;
        const flippedIdx = totalSeries - 1 - origIdx;
        const flippedLowerRatio  = stacked ? 1 - datapoint.cumulatedStackRatio : 0;
        const yOffset = stacked ? usableHeight * flippedLowerRatio + gap * flippedIdx : 0;
        const individualHeight = stacked ? usableHeight * datapoint.stackRatio : drawingArea.value.height;
        
        const zeroPosition = drawingArea.value.bottom - yOffset - ((individualHeight) * individualZero / individualMax);

        const autoScaleZeroPosition = drawingArea.value.bottom - yOffset - (individualHeight * autoScaleZero / autoScaleMax);

        const plots = datapoint.series.map((plot, j) => {
            const yRatio = mutableConfig.value.useIndividualScale 
                ? ((datapoint.absoluteValues[j] + Math.abs(individualZero)) / individualMax) 
                : ratioToMax(plot)

            return {
                x: checkNaN((drawingArea.value.left + (slot.value.line/2)) + (slot.value.line * j)),
                y: checkNaN(drawingArea.value.bottom - yOffset - (individualHeight * yRatio)),
                value: datapoint.absoluteValues[j],
                comment: datapoint.comments ? datapoint.comments.slice(slicer.value.start, slicer.value.end)[j] || '' : ''
            }
        });

        const autoScaleRatiosToNiceScale = datapoint.absoluteValues.map(v => {
            if(autoScaleSteps.min >= 0) {
                return (v - Math.abs(autoScaleSteps.min)) / (autoScaleSteps.max - Math.abs(autoScaleSteps.min));
            } else {
                return (v + Math.abs(autoScaleSteps.min)) / (autoScaleSteps.max + Math.abs(autoScaleSteps.min));
            }
        });

        const autoScalePlots = datapoint.series.map((_, j) => {
            if(![undefined, null].includes(datapoint.absoluteValues[j])) {
                return {
                    x: checkNaN((drawingArea.value.left + (slot.value.line/2)) + (slot.value.line * j)),
                    y: checkNaN(drawingArea.value.bottom - yOffset - ((individualHeight * autoScaleRatiosToNiceScale[j]) || 0)),
                    value: datapoint.absoluteValues[j],
                    comment: datapoint.comments ? datapoint.comments.slice(slicer.value.start, slicer.value.end)[j] || '' : ''
                }
            } else {
                return {
                    x: checkNaN((drawingArea.value.left + (slot.value.line/2)) + (slot.value.line * j)),
                    y: zeroPosition,
                    value: datapoint.absoluteValues[j],
                    comment: datapoint.comments ? datapoint.comments.slice(slicer.value.start, slicer.value.end)[j] || '' : ''
                }
            }
        });

        const curve = FINAL_CONFIG.value.line.cutNullValues 
            ? createSmoothPathWithCuts(plots) 
            : createSmoothPath(plots.filter(p => p.value !== null));

        const autoScaleCurve = FINAL_CONFIG.value.line.cutNullValues 
            ? createSmoothPathWithCuts(autoScalePlots) 
            : createSmoothPath(autoScalePlots.filter(p => p.value !== null));

        const straight = FINAL_CONFIG.value.line.cutNullValues 
            ? createStraightPathWithCuts(plots) 
            : createStraightPath(plots.filter(p => p.value !== null));

        const autoScaleStraight = FINAL_CONFIG.value.line.cutNullValues 
            ? createStraightPathWithCuts(autoScalePlots) 
            : createStraightPath(autoScalePlots.filter(p => p.value !== null));

        const scaleYLabels = individualScale.ticks.map(t => {
            return {
                y: t >= 0 ? zeroPosition - (individualHeight * (t / individualMax)) : zeroPosition + (individualHeight * Math.abs(t) / individualMax),
                value: t,
                prefix: datapoint.prefix || FINAL_CONFIG.value.chart.labels.prefix,
                suffix: datapoint.suffix || FINAL_CONFIG.value.chart.labels.suffix,
                datapoint
            }
        });

        const autoScaleYLabels = autoScaleSteps.ticks.map(t => {
            const v = (t - autoScaleSteps.min) / (autoScaleSteps.max - autoScaleSteps.min);
            return {
                y: t >= 0 ? autoScaleZeroPosition - (individualHeight * v) : autoScaleZeroPosition + (individualHeight * v),
                value: t,
                prefix: datapoint.prefix || FINAL_CONFIG.value.chart.labels.prefix,
                suffix: datapoint.suffix || FINAL_CONFIG.value.chart.labels.suffix,
                datapoint
            }
        });

        scaleGroups.value[datapoint.scaleLabel].name = datapoint.name;
        scaleGroups.value[datapoint.scaleLabel].groupName = datapoint.scaleLabel;
        scaleGroups.value[datapoint.scaleLabel].groupColor = FINAL_CONFIG.value.chart.grid.labels.yAxis.groupColor || datapoint.color;
        scaleGroups.value[datapoint.scaleLabel].color = datapoint.color;
        scaleGroups.value[datapoint.scaleLabel].scaleYLabels = datapoint.autoScaling ? autoScaleYLabels : scaleYLabels;
        scaleGroups.value[datapoint.scaleLabel].zeroPosition = datapoint.autoScaling ? autoScaleZeroPosition : zeroPosition;
        scaleGroups.value[datapoint.scaleLabel].individualMax = datapoint.autoScaling ? autoScaleMax : individualMax;
        scaleGroups.value[datapoint.scaleLabel].scaleLabel = datapoint.scaleLabel;
        scaleGroups.value[datapoint.scaleLabel].id = datapoint.id;
        scaleGroups.value[datapoint.scaleLabel].yOffset = yOffset;
        scaleGroups.value[datapoint.scaleLabel].individualHeight = individualHeight;
        scaleGroups.value[datapoint.scaleLabel].autoScaleYLabels = autoScaleYLabels;
        scaleGroups.value[datapoint.scaleLabel].unique = activeSeriesWithStackRatios.value.filter(el => el.scaleLabel === datapoint.scaleLabel).length === 1 

        const areaZeroPosition = mutableConfig.value.useIndividualScale ? datapoint.autoScaling ? autoScaleZeroPosition : zeroPosition : zero.value;
        const adustedAreaZeroPosition = Math.max(Math.max(datapoint.autoScaling ? autoScaleZeroPosition : (scaleYLabels.at(-1) ? scaleYLabels.at(-1).y : 0), drawingArea.value.top), areaZeroPosition);

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
            area: !datapoint.useArea 
                ? '' 
                : mutableConfig.value.useIndividualScale 
                    ? FINAL_CONFIG.value.line.cutNullValues 
                        ? createIndividualAreaWithCuts(datapoint.autoScaling
                                ? autoScalePlots
                                : plots,
                                adustedAreaZeroPosition,
                            )
                        : createIndividualArea(datapoint.autoScaling 
                            ? autoScalePlots.filter(p => p.value !== null)
                            : plots.filter(p => p.value !== null),
                            adustedAreaZeroPosition) 
                    :  FINAL_CONFIG.value.line.cutNullValues 
                        ? createIndividualAreaWithCuts(plots, adustedAreaZeroPosition)
                        : createIndividualArea(plots.filter(p => p.value !== null), adustedAreaZeroPosition),
            curveAreas: !datapoint.useArea
                ? [] 
                :createSmoothAreaSegments(
                    datapoint.autoScaling 
                        ? FINAL_CONFIG.value.line.cutNullValues 
                            ? autoScalePlots
                            : autoScalePlots.filter(p => p.value !== null)
                        : FINAL_CONFIG.value.line.cutNullValues 
                            ? plots
                            : plots.filter(p => p.value !== null),
                            adustedAreaZeroPosition,
                    FINAL_CONFIG.value.line.cutNullValues),
            straight: datapoint.autoScaling ? autoScaleStraight : straight,
            groupId: scaleGroups.value[datapoint.scaleLabel].groupId
        }
    });
});

const plotSet = computed(() => {
    const stackSeries = activeSeriesWithStackRatios.value.filter(s => ['bar','line','plot'].includes(s.type));
    const totalSeries = stackSeries.length;
    const gap = FINAL_CONFIG.value.chart.grid.labels.yAxis.gap;
    const stacked = mutableConfig.value.isStacked;
    const totalGap = stacked ? gap * (totalSeries - 1) : 0;
    const usableHeight = drawingArea.value.height - totalGap;

    return stackSeries.filter(s => s.type === 'plot').map((datapoint) => {
        checkAutoScaleError(datapoint);
        const _min = scaleGroups.value[datapoint.scaleLabel].min;
        const _max = scaleGroups.value[datapoint.scaleLabel].max;
        const autoScaledRatios = datapoint.absoluteValues.filter(v => ![null, undefined].includes(v)).map(v => {
            return (v - _min) / (_max - _min)
        });

        const autoScale = {
            ratios: autoScaledRatios,
            valueMin: _min,
            valueMax: _max,
        }

        const individualExtremes = {
            max: datapoint.scaleMax || Math.max(...datapoint.absoluteValues) || 1,
            min: datapoint.scaleMin || Math.min(...datapoint.absoluteValues) > 0 ? 0 : Math.min(...datapoint.absoluteValues)
        };

        const scaleSteps = datapoint.scaleSteps || FINAL_CONFIG.value.chart.grid.labels.yAxis.commonScaleSteps;

        const corrector = 1.0000001;

        const individualScale = calculateNiceScaleWithExactExtremes(individualExtremes.min, individualExtremes.max === individualExtremes.min ? individualExtremes.max * corrector : individualExtremes.max, scaleSteps);
        
        const autoScaleSteps = calculateNiceScaleWithExactExtremes(autoScale.valueMin, autoScale.valueMax === autoScale.valueMin ? autoScale.valueMax * corrector : autoScale.valueMax, scaleSteps);

        const individualZero = individualScale.min >= 0 ? 0 : Math.abs(individualScale.min);
        const autoScaleZero = 0;

        const individualMax = individualScale.max + individualZero;
        const autoScaleMax = autoScaleSteps.max + Math.abs(autoScaleZero);
        
        const origIdx = datapoint.stackIndex;
        const flippedIdx = totalSeries - 1 - origIdx;
        const flippedLowerRatio  = stacked ? 1 - datapoint.cumulatedStackRatio : 0;
        const yOffset = stacked ? usableHeight * flippedLowerRatio + gap * flippedIdx : 0;
        const individualHeight = stacked ? usableHeight * datapoint.stackRatio : drawingArea.value.height;

        const zeroPosition = drawingArea.value.bottom - yOffset - ((individualHeight) * individualZero / individualMax);
        const autoScaleZeroPosition = drawingArea.value.bottom - yOffset - (individualHeight * autoScaleZero / autoScaleMax);

        const plots = datapoint.series.map((plot, j) => {
            const yRatio = mutableConfig.value.useIndividualScale ? ((datapoint.absoluteValues[j] + Math.abs(individualZero)) / individualMax) : ratioToMax(plot)
            return {
                x: checkNaN((drawingArea.value.left + (slot.value.plot / 2)) + (slot.value.plot * j)),
                y: checkNaN(drawingArea.value.bottom - yOffset - (individualHeight * yRatio)),
                value: datapoint.absoluteValues[j],
                comment: datapoint.comments ? datapoint.comments.slice(slicer.value.start, slicer.value.end)[j] || '' : ''
            }
        });

        const autoScaleRatiosToNiceScale = datapoint.absoluteValues.map(v => {
            if(autoScaleSteps.min >= 0) {
                return (v - Math.abs(autoScaleSteps.min)) / (autoScaleSteps.max - Math.abs(autoScaleSteps.min))
            } else {
                return (v + Math.abs(autoScaleSteps.min)) / (autoScaleSteps.max + Math.abs(autoScaleSteps.min))
            }
        });

        const autoScalePlots = datapoint.series.map((_, j) => {
            return {
                x: checkNaN((drawingArea.value.left + (slot.value.plot / 2)) + (slot.value.plot * j)),
                y: checkNaN(drawingArea.value.bottom - yOffset - ((individualHeight * autoScaleRatiosToNiceScale[j]) || 0)),
                value: datapoint.absoluteValues[j],
                comment: datapoint.comments ? datapoint.comments.slice(slicer.value.start, slicer.value.end)[j] || '' : ''
            }
        });

        const scaleYLabels = individualScale.ticks.map(t => {
            return {
                y: t >= 0 ? zeroPosition - (individualHeight * (t / individualMax)) : zeroPosition + (individualHeight * Math.abs(t) / individualMax),
                value: t,
                prefix: datapoint.prefix || FINAL_CONFIG.value.chart.labels.prefix,
                suffix: datapoint.suffix || FINAL_CONFIG.value.chart.labels.suffix,
                datapoint,
            }
        });

        const autoScaleYLabels = autoScaleSteps.ticks.map(t => {
            const v = (t - autoScaleSteps.min) / (autoScaleSteps.max - autoScaleSteps.min);
            return {
                y: t >= 0 ? autoScaleZeroPosition - (individualHeight * v) : autoScaleZeroPosition + (individualHeight * v),
                value: t,
                prefix: datapoint.prefix || FINAL_CONFIG.value.chart.labels.prefix,
                suffix: datapoint.suffix || FINAL_CONFIG.value.chart.labels.suffix,
                datapoint
            }
        });

        scaleGroups.value[datapoint.scaleLabel].name = datapoint.name;
        scaleGroups.value[datapoint.scaleLabel].groupName = datapoint.scaleLabel;
        scaleGroups.value[datapoint.scaleLabel].groupColor = FINAL_CONFIG.value.chart.grid.labels.yAxis.groupColor || datapoint.color;
        scaleGroups.value[datapoint.scaleLabel].color = datapoint.color;
        scaleGroups.value[datapoint.scaleLabel].scaleYLabels = datapoint.autoScaling ? autoScaleYLabels : scaleYLabels;
        scaleGroups.value[datapoint.scaleLabel].zeroPosition = datapoint.autoScaling ? autoScaleZeroPosition : zeroPosition;
        scaleGroups.value[datapoint.scaleLabel].individualMax = datapoint.autoScaling ? autoScaleMax : individualMax;
        scaleGroups.value[datapoint.scaleLabel].scaleLabel = datapoint.scaleLabel;
        scaleGroups.value[datapoint.scaleLabel].id = datapoint.id;
        scaleGroups.value[datapoint.scaleLabel].yOffset = yOffset;
        scaleGroups.value[datapoint.scaleLabel].individualHeight = individualHeight;
        scaleGroups.value[datapoint.scaleLabel].autoScaleYLabels = autoScaleYLabels;
        scaleGroups.value[datapoint.scaleLabel].unique = activeSeriesWithStackRatios.value.filter(el => el.scaleLabel === datapoint.scaleLabel).length === 1

        return {
            ...datapoint,
            yOffset,
            autoScaleYLabels,
            individualHeight,
            scaleYLabels: datapoint.autoScaling ? autoScaleYLabels : scaleYLabels,
            individualScale: datapoint.autoScaling ? autoScaleSteps : individualScale,
            individualMax: datapoint.autoScaling ? autoScaleMax : individualMax,
            zeroPosition: datapoint.autoScaling ? autoScaleZeroPosition : zeroPosition,
            plots: datapoint.autoScaling ? autoScalePlots : plots,
            groupId: scaleGroups.value[datapoint.scaleLabel].groupId
        }
    });
});

const allScales = computed(() => {
    const lines = lineSet.value.map(l => {
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
            individualHeight: l.individualHeight || drawingArea.value.height,
            autoScaleYLabels: l.autoScaleYLabels
        }
    });
    const bars = barSet.value.map(b => {
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
            individualHeight: b.individualHeight || drawingArea.value.height
        }
    });
    const plots = plotSet.value.map(p => {
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
            individualHeight: p.individualHeight || drawingArea.value.height
        }
    });

    const _source = (mutableConfig.value.useIndividualScale && !mutableConfig.value.isStacked) ? Object.values(scaleGroups.value) : [...lines, ...bars, ...plots];

    const len = _source.flatMap(el => el).length;
    return _source.flatMap((el,i) => {

        let x = 0;
        if (isAutoSize.value) {
            x = mutableConfig.value.isStacked ? drawingArea.value.left : drawingArea.value.left - (i * (FINAL_CONFIG.value.chart.grid.labels.yAxis.labelWidth + fontSizes.value.dataLabels * 2));
        } else {
            x = mutableConfig.value.isStacked ? drawingArea.value.left : (drawingArea.value.left / len) * (i + 1);
        }

        return {
            unique: el.unique,
            id: el.id,
            groupId: el.groupId,
            scaleLabel: el.scaleLabel,
            name: (mutableConfig.value.useIndividualScale && !mutableConfig.value.isStacked) ? el.unique ? el.name : el.groupName : el.name,
            color: (mutableConfig.value.useIndividualScale && !mutableConfig.value.isStacked) ? el.unique ? el.color : el.groupColor : el.color,
            scale: el.scale,
            yOffset: el.yOffset,
            individualHeight: el.individualHeight,
            x,
            yLabels: el.scaleYLabels || el.scale.ticks.map(t => {
                return {
                    y: t >= 0 ? el.zero - (el.individualHeight * (t / el.max)) : el.zero + (el.individualHeight * Math.abs(t) / el.max),
                    value: t
                }
            })
        }
    });
});

/******************************************************************************************/

const dataTooltipSlot = computed(() => {
    return {
        datapoint: selectedSeries.value,
        seriesIndex: selectedSerieIndex.value,
        series: absoluteDataset.value,
        bars: barSet.value,
        lines: lineSet.value,
        plots: plotSet.value,
        config: FINAL_CONFIG.value 
    }
});

const tooltipContent = computed(() => {
    let html = "";
    
    let sum = selectedSeries.value.map(s => s.value).filter(s => isSafeValue(s) && s !== null).reduce((a,b) => Math.abs(a) + Math.abs(b), 0);
    
    const time = timeLabels.value[selectedSerieIndex.value];
    const customFormat = FINAL_CONFIG.value.chart.tooltip.customFormat;

    if(isFunction(customFormat) && functionReturnsString(() => customFormat({
        absoluteIndex: selectedSerieIndex.value + slicer.value.start,
        seriesIndex: selectedSerieIndex.value,
        datapoint: selectedSeries.value,
        series: absoluteDataset.value,
        bars: barSet.value,
        lines: lineSet.value,
        plots: plotSet.value,
        config: FINAL_CONFIG.value
    }))) {
        return customFormat({
            absoluteIndex: selectedSerieIndex.value + slicer.value.start,
            seriesIndex: selectedSerieIndex.value,
            datapoint: selectedSeries.value,
            series: absoluteDataset.value,
            bars: barSet.value,
            lines: lineSet.value,
            plots: plotSet.value,
            config: FINAL_CONFIG.value
        })
    } else {
        if(time && time.text && FINAL_CONFIG.value.chart.tooltip.showTimeLabel) {
            html += `<div style="padding-bottom: 6px; margin-bottom: 4px; border-bottom: 1px solid ${FINAL_CONFIG.value.chart.tooltip.borderColor}; width:100%">${time.text}</div>`;
        }
        selectedSeries.value.forEach(s => {
            if(isSafeValue(s.value)) {
                let shape = '';
                let insideShape = '';
                switch (icons.value[s.type]) {
                    case 'bar':
                        shape = `<svg viewBox="0 0 40 40" height="14" width="14">${SLOTS.pattern ? `<rect x="0" y="0" rx="1" stroke="none" height="40" width="40" fill="${s.color}" />`: ''}<rect x="0" y="0" rx="1" stroke="none" height="40" width="40" fill="${SLOTS.pattern ? `url(#pattern_${uniqueId.value}_${s.slotAbsoluteIndex}` : s.color}" /></svg>`;
                        break;
                    
                    case 'line':
                        if(!s.shape || !['star', 'triangle', 'square', 'diamond', 'pentagon', 'hexagon'].includes(s.shape)) {
                            insideShape = `<circle cx="10" cy="8" r="4" stroke="${FINAL_CONFIG.value.chart.tooltip.backgroundColor}" stroke-width="0.5" fill="${s.color}" />`
                        } else if(s.shape === 'triangle') {
                            insideShape = `<path d="${createPolygonPath({ plot: { x: 10, y: 8}, radius: 4, sides: 3, rotation: 0.52}).path}" fill="${s.color}" stroke="${FINAL_CONFIG.value.chart.tooltip.backgroundColor}" stroke-width="0.5" />`
                        } else if(s.shape === 'square') {
                            insideShape = `<path d="${createPolygonPath({ plot: { x: 10, y: 8}, radius: 4, sides: 4, rotation: 0.8}).path}" fill="${s.color}" stroke="${FINAL_CONFIG.value.chart.tooltip.backgroundColor}" stroke-width="0.5" />`
                        } else if(s.shape === 'diamond') {
                            insideShape = `<path d="${createPolygonPath({ plot: { x: 10, y: 8}, radius: 4, sides: 4, rotation: 0}).path}" fill="${s.color}" stroke="${FINAL_CONFIG.value.chart.tooltip.backgroundColor}" stroke-width="0.5" />`
                        } else if(s.shape === 'pentagon') {
                            insideShape = `<path d="${createPolygonPath({ plot: { x: 10, y: 8}, radius: 4, sides: 5, rotation: 0.95}).path}" fill="${s.color}" stroke="${FINAL_CONFIG.value.chart.tooltip.backgroundColor}" stroke-width="0.5" />`
                        } else if(s.shape === 'hexagon') {
                            insideShape = `<path d="${createPolygonPath({ plot: { x: 10, y: 8}, radius: 4, sides: 6, rotation: 0}).path}" fill="${s.color}" stroke="${FINAL_CONFIG.value.chart.tooltip.backgroundColor}" stroke-width="0.5" />`
                        } else if(s.shape === 'star') {
                            insideShape = `<polygon stroke="${FINAL_CONFIG.value.chart.tooltip.backgroundColor}" stroke-width="0.5" fill="${s.color}" points="${createStar({ plot: { x: 10, y: 8 }, radius: 4})}" />`
                        }
                        shape = `<svg viewBox="0 0 20 12" height="14" width="20"><rect rx="1.5" x="0" y="6.5" stroke="${FINAL_CONFIG.value.chart.tooltip.backgroundColor}" stroke-width="0.5" height="3" width="20" fill="${s.color}" />${insideShape}</svg>`;
                        break;

                    case 'plot':
                        if (!s.shape || !['star', 'triangle', 'square', 'diamond', 'pentagon', 'hexagon'].includes(s.shape)) {
                            shape = `<svg viewBox="0 0 12 12" height="14" width="14"><circle cx="6" cy="6" r="6" stroke="${FINAL_CONFIG.value.chart.tooltip.backgroundColor}" stroke-width="1" fill="${s.color}" /></svg>`;
                            break;
                        }
                        if(s.shape === 'star') {
                            shape = `<svg viewBox="0 0 12 12" height="14" width="14"><polygon stroke="${FINAL_CONFIG.value.chart.tooltip.backgroundColor}" stroke-width="1" fill="${s.color}" points="${createStar({ plot: { x: 6, y: 6 }, radius: 5})}" /></svg>`;
                            break;
                        }
                        if(s.shape === 'triangle') {
                            shape = `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6}, radius: 6, sides: 3, rotation: 0.52}).path}" fill="${s.color}" stroke="${FINAL_CONFIG.value.chart.tooltip.backgroundColor}" stroke-width="1" /></svg>`;
                            break;
                        }
                        if(s.shape === 'square') {
                            shape = `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6}, radius: 6, sides: 4, rotation: 0.8}).path}" fill="${s.color}" stroke="${FINAL_CONFIG.value.chart.tooltip.backgroundColor}" stroke-width="1" /></svg>`;
                            break;
                        }
                        if(s.shape === 'diamond') {
                            shape = `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6}, radius: 5, sides: 4, rotation: 0}).path}" fill="${s.color}" stroke="${FINAL_CONFIG.value.chart.tooltip.backgroundColor}" stroke-width="1" /></svg>`;
                            break;
                        }
                        if(s.shape === 'pentagon') {
                            shape = `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6}, radius: 5, sides: 5, rotation: 0.95}).path}" fill="${s.color}" stroke="${FINAL_CONFIG.value.chart.tooltip.backgroundColor}" stroke-width="1" /></svg>`;
                            break;
                        }
                        if(s.shape === 'hexagon') {
                            shape = `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6}, radius: 5, sides: 6, rotation: 0}).path}" fill="${s.color}" stroke="${FINAL_CONFIG.value.chart.tooltip.backgroundColor}" stroke-width="1" /></svg>`;
                            break;
                        }
                    default:
                        break;
                }
                html += `<div style="display:flex;flex-direction:row; align-items:center;gap:3px;"><div style="width:20px">${shape}</div> ${s.name}: <b>${FINAL_CONFIG.value.chart.tooltip.showValue ? 
                        applyDataLabel(
                            s.type === 'line' ? FINAL_CONFIG.value.line.labels.formatter :
                            s.type === 'bar' ? FINAL_CONFIG.value.bar.labels.formatter :
                            FINAL_CONFIG.value.plot.labels.formatter,
                            s.value,
                            dataLabel({
                                p: s.prefix, 
                                v: s.value, 
                                s: s.suffix, 
                                r: FINAL_CONFIG.value.chart.tooltip.roundingValue,
                            }),
                            { datapoint: s }
                        ) : ''}</b> ${FINAL_CONFIG.value.chart.tooltip.showPercentage ? `(${dataLabel({
                            v: checkNaN(Math.abs(s.value) / sum * 100),
                            s: '%',
                            r: FINAL_CONFIG.value.chart.tooltip.roundingPercentage
                        })})` : ''}</div>`;

                if (FINAL_CONFIG.value.chart.comments.showInTooltip && s.comments.length && s.comments.slice(slicer.value.start, slicer.value.end)[selectedSerieIndex.value]) {
                    html += `<div class="vue-data-ui-tooltip-comment" style="background:${s.color}20; padding: 6px; margin-bottom: 6px; border-left: 1px solid ${s.color}">${s.comments.slice(slicer.value.start, slicer.value.end)[selectedSerieIndex.value]}</div>`
                }

            }
        });
        return `<div style="border-radius:4px;padding:12px;font-variant-numeric: tabular-nums;color:${FINAL_CONFIG.value.chart.tooltip.color}">${html}</div>`;
    }      
});

const table = computed(() => {
    if(safeDataset.value.length === 0) return { head: [], body: [], config: {}, columnNames: []};
    const head = relativeDataset.value.map(s => {
        return {
            label: s.name,
            color: s.color,
            type: s.type
        }
    });
    const body = [];
    timeLabels.value.forEach((t, i) => {
        const row = [t.text];
        relativeDataset.value.forEach(s => {
            row.push(canShowValue(s.absoluteValues[i]) ? Number(s.absoluteValues[i].toFixed(FINAL_CONFIG.value.table.rounding)) : '')
        });
        body.push(row);
    });
    return { head, body};
});

const dataTable = computed(() => {
    const showSum = FINAL_CONFIG.value.table.showSum;
    let head = [''].concat(relativeDataset.value.map(ds => ds.name))

    if(showSum) {
        head = head.concat(` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`)
    }

    let body = [];
    for(let i = 0; i < maxSeries.value; i += 1) {
        const sum = relativeDataset.value.map(ds => {
            return ds.absoluteValues[i] ?? 0
        }).reduce((a, b) => a + b, 0)

        body.push([
            timeLabels.value[i].text ?? '-']
            .concat(relativeDataset.value
                .map(ds => {
                    return applyDataLabel(
                        ds.type === 'line' ? FINAL_CONFIG.value.line.labels.formatter :
                        ds.type === 'bar' ? FINAL_CONFIG.value.bar.labels.formatter :
                        FINAL_CONFIG.value.plot.labels.formatter,
                        ds.absoluteValues[i] ?? 0,
                        dataLabel({
                            p: ds.prefix || FINAL_CONFIG.value.chart.labels.prefix,
                            v: ds.absoluteValues[i] ?? 0,
                            s: ds.suffix || FINAL_CONFIG.value.chart.labels.suffix,
                            r: FINAL_CONFIG.value.table.rounding
                        })
                    )}
                ))
            .concat(showSum ? (sum ?? 0).toFixed(FINAL_CONFIG.value.table.rounding) : [])
        )
    }
    const config = {
        th: {
            backgroundColor: FINAL_CONFIG.value.table.th.backgroundColor,
            color: FINAL_CONFIG.value.table.th.color,
            outline: FINAL_CONFIG.value.table.th.outline
        },
        td: {
            backgroundColor: FINAL_CONFIG.value.table.td.backgroundColor,
            color: FINAL_CONFIG.value.table.td.color,
            outline: FINAL_CONFIG.value.table.td.outline
        },
        breakpoint: FINAL_CONFIG.value.table.responsiveBreakpoint
    }
    const colNames = [FINAL_CONFIG.value.table.columnNames.period].concat(relativeDataset.value.map(ds => ds.name)).concat(FINAL_CONFIG.value.table.columnNames.total)

    return { head, body, config, colNames };
});

function generateCsv(callback=null) {
    const title = [[FINAL_CONFIG.value.chart.title.text], [FINAL_CONFIG.value.chart.title.subtitle.text], [""]];
    const head = ["",...table.value.head.map(h => h.label)]
    const body = table.value.body
    const table = title.concat([head]).concat(body);
    const csvContent = createCsvContent(table);
    if(!callback) {
        downloadCsv({ csvContent, title: FINAL_CONFIG.value.chart.title.text || 'vue-ui-xy'});
    } else {
        callback(csvContent);
    }
}

function toggleTooltipVisibility(show, selectedIndex = null) {
    isTooltip.value = show;
    if(show) {
        selectedSerieIndex.value = selectedIndex;
    }else{
        selectedSerieIndex.value = null;
    }
}

function toggleTable() {
    mutableConfig.value.showTable = !mutableConfig.value.showTable;
}

function toggleLabels() {
    mutableConfig.value.dataLabels.show = !mutableConfig.value.dataLabels.show;
}

function toggleTooltip() {
    mutableConfig.value.showTooltip = !mutableConfig.value.showTooltip;
}

function toggleFullscreen(state) {
    isFullscreen.value = state;
    step.value += 1;
}

function convertSizes() {
    if (!FINAL_CONFIG.value.responsiveProportionalSizing) {
        fontSizes.value.dataLabels = FINAL_CONFIG.value.chart.grid.labels.fontSize;
        fontSizes.value.yAxis = FINAL_CONFIG.value.chart.grid.labels.axis.fontSize;
        fontSizes.value.xAxis =  FINAL_CONFIG.value.chart.grid.labels.xAxisLabels.fontSize;
        fontSizes.value.plotLabels = FINAL_CONFIG.value.chart.labels.fontSize;
        plotRadii.value.plot = FINAL_CONFIG.value.plot.radius;
        plotRadii.value.line = FINAL_CONFIG.value.line.radius;
        return;
    }
    // Adaptative sizes in responsive mode
    fontSizes.value.dataLabels = translateSize({
        relator: height.value,
        adjuster: 400,
        source: FINAL_CONFIG.value.chart.grid.labels.fontSize,
        threshold: 10,
        fallback: 10
    });
    fontSizes.value.yAxis = translateSize({
        relator: width.value,
        adjuster: 1000,
        source: FINAL_CONFIG.value.chart.grid.labels.axis.fontSize,
        threshold: 10,
        fallback: 10
    });
    fontSizes.value.xAxis = translateSize({
        relator: width.value,
        adjuster: 1000,
        source: FINAL_CONFIG.value.chart.grid.labels.xAxisLabels.fontSize,
        threshold: 10,
        fallback: 10
    });
    fontSizes.value.plotLabels = translateSize({
        relator: width.value,
        adjuster: 800,
        source: FINAL_CONFIG.value.chart.labels.fontSize,
        threshold: 10,
        fallback: 10
    });
    plotRadii.value.plot = translateSize({
        relator: width.value,
        adjuster: 800,
        source: FINAL_CONFIG.value.plot.radius,
        threshold: 1,
        fallback: 1
    });
    plotRadii.value.line = translateSize({
        relator: width.value,
        adjuster: 800,
        source: FINAL_CONFIG.value.line.radius,
        threshold: 1,
        fallback: 1
    })
}

const debug = computed(() => !!FINAL_CONFIG.value.debug);

function prepareChart() {
    if(objectIsEmpty(props.dataset)) {
        error({
            componentName: 'VueUiXy',
            type: 'dataset',
            debug: debug.value
        });
        manualLoading.value = true; // v3
    } else {
        props.dataset.forEach((ds, i) => {
            if([null, undefined].includes(ds.name)) {
                error({
                    componentName: 'VueUiXy',
                    type: 'datasetSerieAttribute',
                    property: 'name (string)',
                    index: i,
                    debug: debug.value
                });
                manualLoading.value = true; // v3
            }
        })
    }

    if(debug.value) {
        props.dataset.forEach((datapoint) => {
            datapoint.series.forEach((s, j) => {
                if(!isSafeValue(s)) {
                    console.warn(`VueUiXy has detected an unsafe value in your dataset:\n-----> The serie '${datapoint.name}' contains the value '${s}' at index ${j}.\n'${s}' was converted to null to allow the chart to display.`)
                }
            });
        });
    }

    // v3
    if (!objectIsEmpty(props.dataset)) {
        manualLoading.value = FINAL_CONFIG.value.loading;
    }

    showUserOptionsOnChartHover.value = FINAL_CONFIG.value.chart.userOptions.showOnChartHover;
    keepUserOptionState.value = FINAL_CONFIG.value.chart.userOptions.keepStateOnChartLeave;
    userOptionsVisible.value = !FINAL_CONFIG.value.chart.userOptions.showOnChartHover;

    mutableConfig.value = {
        dataLabels: {
            show: true,
        },
        showTooltip: FINAL_CONFIG.value.chart.tooltip.show === true,
        showTable: FINAL_CONFIG.value.showTable === true,
        isStacked: FINAL_CONFIG.value.chart.grid.labels.yAxis.stacked,
        useIndividualScale: FINAL_CONFIG.value.chart.grid.labels.yAxis.useIndividualScale
    }

    const additionalPad = isAutoSize.value ? 0 : 12;

    if (FINAL_CONFIG.value.responsive) {
        const _chart = chart.value;
        // Parent container (must have fixed height or max-height. Setting 100% will result in infinite height growth which looks aweful on top of being useless)
        const parent = _chart.parentNode;

        if (resizeObserver.value) {
            resizeObserver.value.unobserve(observedEl.value);
            resizeObserver.value.disconnect();
        }

        const { height: _height, width: _width } = parent.getBoundingClientRect();

        // Title height to substract
        let title = null;
        let titleHeight = 0;
        if (FINAL_CONFIG.value.chart.title.show && chartTitle.value) {
            title = chartTitle.value;
            titleHeight = title.getBoundingClientRect().height;
        }

        // Slicer height to substract
        let slicer = null;
        let slicerHeight = 0;
        if (FINAL_CONFIG.value.chart.zoom.show && maxX.value > 6 && isDataset.value && chartSlicer.value && chartSlicer.value.$el) {
            slicer = chartSlicer.value.$el;
            slicerHeight = slicer.getBoundingClientRect().height;
        }

        // Legend height to substract
        let legend = null;
        let legendHeight = 0
        if (FINAL_CONFIG.value.chart.legend.show && chartLegend.value) {
            legend = chartLegend.value;
            legendHeight = legend.getBoundingClientRect().height;
        }

        // Source height to substract
        let sourceHeight = 0;
        if (source.value) {
            sourceHeight = source.value.getBoundingClientRect().height;
        }

        // NoTitle height to substract
        let noTitleHeight = 0;
        if (noTitle.value) {
            noTitleHeight = noTitle.value.getBoundingClientRect().height;
        }

        height.value = _height
            - titleHeight 
            - legendHeight 
            - slicerHeight 
            - sourceHeight 
            - noTitleHeight
            - additionalPad;

        width.value = _width;
        if (isAutoSize.value) {
            setViewBox();
        } else {
            viewBox.value = `0 0 ${width.value < 0 ? 10 : width.value} ${height.value < 0 ? 10 : height.value}`;
        }
        convertSizes();

        const ro = new ResizeObserver((entries) => {
            for(const entry of entries) {
                if (FINAL_CONFIG.value.chart.title.show && chartTitle.value) {
                    titleHeight = chartTitle.value.getBoundingClientRect().height;
                } else {
                    titleHeight = 0;
                }
                if (chartSlicer.value && chartSlicer.value.$el) {
                    slicerHeight = chartSlicer.value.$el.getBoundingClientRect().height;
                } else {
                    slicerHeight = 0;
                }
                if (chartLegend.value) {
                    legendHeight = chartLegend.value.getBoundingClientRect().height;
                } else {
                    legendHeight = 0;
                }
                if (source.value) {
                    sourceHeight = source.value.getBoundingClientRect().height;
                } else {
                    sourceHeight = 0;
                }
                if (noTitle.value) {
                    noTitleHeight = noTitle.value.getBoundingClientRect().height;
                } else {
                    noTitleHeight = 0;
                }
                if (isAutoSize.value) {
                    // Transitions hinder the first viewbox measurements
                    chart.value.classList.add('no-transition');
                }
                requestAnimationFrame(() => {
                    height.value = entry.contentRect.height
                        - titleHeight 
                        - legendHeight 
                        - slicerHeight 
                        - sourceHeight 
                        - noTitleHeight
                        - (isAutoSize.value ? 48 : additionalPad); // FIXME: this magic 48 should be understood

                    if (isAutoSize.value) {
                        remainingHeight.value = entry.contentRect.height - height.value;
                        width.value = entry.contentBoxSize[0].inlineSize;
                        svgAspectRatio.value = width.value / remainingHeight.value;
                        setViewBox();
                    } else {
                        width.value = entry.contentBoxSize[0].inlineSize;
                        viewBox.value = `0 0 ${width.value < 0 ? 10 : width.value} ${height.value < 0 ? 10 : height.value}`;
                    }

                    convertSizes();
                })
            }
        })

        resizeObserver.value = ro;
        observedEl.value = parent;

        ro.observe(parent);

    } else {
        height.value = FINAL_CONFIG.value.chart.height;
        width.value = FINAL_CONFIG.value.chart.width;
        fontSizes.value.dataLabels = FINAL_CONFIG.value.chart.grid.labels.fontSize;
        fontSizes.value.yAxis = FINAL_CONFIG.value.chart.grid.labels.axis.fontSize;
        fontSizes.value.xAxis =  FINAL_CONFIG.value.chart.grid.labels.xAxisLabels.fontSize;
        fontSizes.value.plotLabels = FINAL_CONFIG.value.chart.labels.fontSize;
        plotRadii.value.plot = FINAL_CONFIG.value.plot.radius;
        plotRadii.value.line = FINAL_CONFIG.value.line.radius;
        if (isAutoSize.value) {
            setViewBox();
        } else {
            viewBox.value = `0 0 ${width.value} ${height.value}`;
        }
    }
}

onMounted(() => {
    prepareChart();
    setupSlicer();
    document.addEventListener("mousemove", (e) => {
        clientPosition.value = {
            x: e.clientX,
            y: e.clientY
        }
    });
    document.addEventListener('scroll', hideTags);
});

onBeforeUnmount(() => {
    document.removeEventListener('scroll', hideTags);
    if (resizeObserver.value) {
        resizeObserver.value.unobserve(observedEl.value);
        resizeObserver.value.disconnect();
    }
});

watch(() => mutableConfig.value.isStacked, async () => {
    if (!isAutoSize.value) return;
    await nextTick();
    setViewBox();
    forceResizeObserver();
});


// Force reflow when component is mounted in a hidden div
let ro

async function initSizing() {
    await nextTick()
    setViewBox()
    forceResizeObserver()
    ro.disconnect()
}

onMounted(() => {
    if (!chart.value) return

    ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
            initSizing()
            break
        }
        }
    });

    ro.observe(chart.value.parentElement)
});

onBeforeUnmount(() => {
    ro?.disconnect()
});


watch(() => props.dataset, (_) => {
    if (Array.isArray(_) && _.length > 0) {
        manualLoading.value = false;
    }
    maxX.value = Math.max(...FINAL_DATASET.value.map(datapoint => largestTriangleThreeBucketsArray({
            data: datapoint.series,
            threshold: FINAL_CONFIG.value.downsample.threshold
        }).length));
        slicer.value = {
            start: 0,
            end: maxX.value
        }
        slicerStep.value += 1;
        segregateStep.value += 1;
}, { deep: true });

watch(() => props.config, (_) => {
    if (!loading.value) {
        FINAL_CONFIG.value = prepareConfig();
    }
    prepareChart();
    titleStep.value += 1;
    tableStep.value += 1;

    // Reset mutable config
    mutableConfig.value = {
        dataLabels: {
            show: true,
        },
        showTooltip: FINAL_CONFIG.value.chart.tooltip.show === true,
        showTable: FINAL_CONFIG.value.showTable === true,
        isStacked: FINAL_CONFIG.value.chart.grid.labels.yAxis.stacked,
        useIndividualScale: FINAL_CONFIG.value.chart.grid.labels.yAxis.useIndividualScale
    }
}, { deep: true });

// v3 - Essential to make shifting between loading config and final config work
watch(FINAL_CONFIG, () => {
    mutableConfig.value = {
        dataLabels: {
            show: true,
        },
        showTooltip: FINAL_CONFIG.value.chart.tooltip.show === true,
        showTable: FINAL_CONFIG.value.showTable === true,
        isStacked: FINAL_CONFIG.value.chart.grid.labels.yAxis.stacked,
        useIndividualScale: FINAL_CONFIG.value.chart.grid.labels.yAxis.useIndividualScale
    }
}, { immediate: true });

defineExpose({
    getData,
    getImage,
    generatePdf,
    generateImage,
    generateCsv,
    toggleStack,
    toggleTable,
    toggleLabels,
    toggleTooltip,
    toggleAnnotator,
    toggleFullscreen
});
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

svg.vue-ui-xy-tag-arrow *,
line.vue-ui-xy-tag-line,
line.vue-ui-xy-tag-plot {
    animation: none !important;
}

.vue-ui-xy-tag {
    z-index: 2147483647;
    pointer-events: none;
}

.vue-ui-xy-tag[data-tag="right"] {
    border-radius: 0 3px 3px 0;
}
.vue-ui-xy-tag[data-tag="left"] {
    border-radius: 3px 0 0 3px;
}

.vue-ui-xy.no-transition path,
.vue-ui-xy.no-transition line,
.vue-ui-xy.no-transition rect {
    transition: none !important;
}
</style>