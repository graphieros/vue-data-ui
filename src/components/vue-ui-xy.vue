
<template>
    <div :id="`vue-ui-xy_${uniqueId}`" :class="`vue-ui-xy ${isFullscreen ? 'vue-data-ui-wrapper-fullscreen' : ''} ${FINAL_CONFIG.useCssAnimation ? '' : 'vue-ui-dna'}`" ref="chart" :style="`background:${FINAL_CONFIG.chart.backgroundColor}; color:${FINAL_CONFIG.chart.color};width:100%;font-family:${FINAL_CONFIG.chart.fontFamily};${FINAL_CONFIG.responsive ? 'height: 100%' : ''}`" @mouseenter="() => setUserOptionsVisibility(true)" @mouseleave="() => setUserOptionsVisibility(false)">
        <PenAndPaper 
            v-if="FINAL_CONFIG.chart.userOptions.buttons.annotator"
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
            v-if="FINAL_CONFIG.chart.userOptions.show && isDataset && (keepUserOptionState ? true : userOptionsVisible)"
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
            v-if="isDataset" 
            :class="{ 'vue-data-ui-fullscreen--on': isFullscreen, 'vue-data-ui-fulscreen--off': !isFullscreen }" 
            data-cy="xy-svg" 
            width="100%" 
            :viewBox="viewBox" 
            class="vue-ui-xy-svg" 
            :style="`background: transparent; color:${FINAL_CONFIG.chart.color}; font-family:${FINAL_CONFIG.chart.fontFamily}`"
            :aria-label="chartAriaLabel"
            role="img"
            aria-live="polite"
        >
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
                        />
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
                        <g v-for="(_, i) in oneArea.span">
                            <!-- HIGHLIGHT AREA FILLED RECT UNITS -->
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

                            <!-- HIGHLIGHT AREA CAPTION -->
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
                    :style="{ pointerEvents: 'none', transition: 'none' }"
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
                <g v-if="FINAL_CONFIG.chart.grid.labels.show">
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
                                :style="`opacity:${selectedScale ? selectedScale === el.groupId ? 1 : 0.3 : 1};transition:opacity 0.2s ease-in-out`"
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
                            <line
                                v-for="(yLabel, j) in el.yLabels"
                                :x1="el.x - 3 + xPadding"
                                :x2="el.x + xPadding"
                                :y1="forceValidValue(yLabel.y)"
                                :y2="forceValidValue(yLabel.y)"
                                :stroke="el.color"
                                :stroke-width="1"
                                stroke-linecap="round"
                            />
                            <text 
                                v-for="(yLabel, j) in el.yLabels"
                                :x="el.x - 5 + xPadding + FINAL_CONFIG.chart.grid.labels.yAxis.scaleValueOffsetX" 
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
                                v-if="canShowValue(yLabel) && yLabel.value >= niceScale.min && yLabel.value <= niceScale.max"
                                :x1="drawingArea.left + xPadding" 
                                :x2="drawingArea.left - 5 + xPadding" 
                                :y1="forceValidValue(yLabel.y)" 
                                :y2="forceValidValue(yLabel.y)" 
                                :stroke="FINAL_CONFIG.chart.grid.stroke" 
                                stroke-width="1" 
                                stroke-linecap="round"
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
                        v-if="serie.smooth && serie.plots.length > 1" 
                        :d="`M${serie.curve}`" 
                        :stroke="FINAL_CONFIG.chart.backgroundColor" 
                        :stroke-width="FINAL_CONFIG.line.strokeWidth + 1" 
                        :stroke-dasharray="serie.dashed ? FINAL_CONFIG.line.strokeWidth * 2 : 0" 
                        fill="none" 
                    />

                    <path
                        data-cy="datapoint-line-coating-straight"
                        v-else-if="serie.plots.length > 1"
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
                        v-if="serie.smooth && serie.plots.length > 1" 
                        :d="`M${serie.curve}`" 
                        :stroke="serie.color" 
                        :stroke-width="FINAL_CONFIG.line.strokeWidth" 
                        :stroke-dasharray="serie.dashed ? FINAL_CONFIG.line.strokeWidth * 2 : 0" 
                        fill="none"
                        stroke-linecap="round"
                    />

                    <path
                        data-cy="datapoint-line-straight"
                        v-else-if="serie.plots.length > 1"
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
                        data-cy="xy-axis-yLabel" 
                        v-if="FINAL_CONFIG.chart.grid.labels.axis.yLabel && !mutableConfig.useIndividualScale" 
                        :font-size="fontSizes.yAxis" 
                        :fill="FINAL_CONFIG.chart.grid.labels.color"
                        :transform="`translate(${fontSizes.yAxis + FINAL_CONFIG.chart.grid.labels.axis.yLabelOffsetX}, ${drawingArea.top + drawingArea.height / 2}) rotate(-90)`"
                        text-anchor="middle" 
                        style="transition: none"
                    >
                        {{ FINAL_CONFIG.chart.grid.labels.axis.yLabel }}
                    </text>
                    <text 
                        data-cy="xy-axis-xLabel"
                        v-if="FINAL_CONFIG.chart.grid.labels.axis.xLabel" 
                        text-anchor="middle"
                        :x="width / 2"
                        :y="drawingArea.bottom + fontSizes.yAxis + (fontSizes.xAxis * 1.3) + FINAL_CONFIG.chart.grid.labels.axis.xLabelOffsetY"
                        :font-size="fontSizes.yAxis"
                        :fill="FINAL_CONFIG.chart.grid.labels.color"
                    >
                        {{ FINAL_CONFIG.chart.grid.labels.axis.xLabel }}
                    </text>
                </g>v-for="(label, i) in timeLabels" :key="`time_label_${i}`"
                
                <!-- TIME LABELS -->
                <g v-if="FINAL_CONFIG.chart.grid.labels.xAxisLabels.show">
                    <template v-if="$slots['time-label']">
                        <template v-for="(label, i) in timeLabels" :key="`time_label_${i}`">
                            <slot name="time-label" v-bind="{
                                x: drawingArea.left + (drawingArea.width / maxSeries) * i + (drawingArea.width / maxSeries / 2),
                                y: drawingArea.bottom + fontSizes.xAxis * 1.3 + FINAL_CONFIG.chart.grid.labels.xAxisLabels.yOffset,
                                fontSize: fontSizes.xAxis,
                                fill: FINAL_CONFIG.chart.grid.labels.xAxisLabels.color,
                                transform: `translate(${drawingArea.left + (drawingArea.width / maxSeries) * i + (drawingArea.width / maxSeries / 2)}, ${drawingArea.bottom + fontSizes.xAxis * 1.3 + FINAL_CONFIG.chart.grid.labels.xAxisLabels.yOffset}), rotate(${FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation})`,
                                absoluteIndex: label.absoluteIndex,
                                content: label.text,
                                textAnchor: FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation > 0 ? 'start' : FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation < 0 ? 'end' : 'middle',
                                show: (label && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo) || 
                                    (label && FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && (i === 0 || i === timeLabels.length -1) && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo) || 
                                    (label && FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && selectedSerieIndex === i && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo) ||
                                    (label && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo && (i % Math.floor((this.slicer.end - this.slicer.start) / FINAL_CONFIG.chart.grid.labels.xAxisLabels.modulo) === 0))
                            }" />
                        </template>
                    </template>
                    <template v-else>
                        <g v-for="(label, i) in timeLabels" :key="`time_label_${i}`">
                            <text
                                data-cy="time-label"
                                v-if="
                                    (label && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo) || 
                                    (label && FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && (i === 0 || i === timeLabels.length -1) && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo) || 
                                    (label && FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && selectedSerieIndex === i && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo) ||
                                    (label && !FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyFirstAndLast && FINAL_CONFIG.chart.grid.labels.xAxisLabels.showOnlyAtModulo && (i % Math.floor((this.slicer.end - this.slicer.start) / FINAL_CONFIG.chart.grid.labels.xAxisLabels.modulo) === 0))
                                "
                                :text-anchor="FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation > 0 ? 'start' : FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation < 0 ? 'end' : 'middle'"
                                :font-size="fontSizes.xAxis"
                                :fill="FINAL_CONFIG.chart.grid.labels.xAxisLabels.color"
                                :transform="`translate(${drawingArea.left + (drawingArea.width / maxSeries) * i + (drawingArea.width / maxSeries / 2)}, ${drawingArea.bottom + fontSizes.xAxis * 1.3 + FINAL_CONFIG.chart.grid.labels.xAxisLabels.yOffset}), rotate(${FINAL_CONFIG.chart.grid.labels.xAxisLabels.rotation})`"
                                :style="{
                                    cursor: 'pointer'
                                }"
                                @click="() => selectTimeLabel(label, i)"
                            >
                                {{ label.text || "" }}
                            </text>
                        </g>
                    </template>
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

        <Skeleton 
            v-if="!isDataset"
            :config="{
                type: 'line',
                style: {
                    backgroundColor: FINAL_CONFIG.chart.backgroundColor,
                    line: {
                        axis: {
                            color: FINAL_CONFIG.chart.grid.stroke,
                        },
                        path: {
                            color: FINAL_CONFIG.chart.grid.stroke,
                            strokeWidth: 0.5
                        }
                    }
                }
            }"
        />

        <Slicer
            ref="chartSlicer"
            v-if="FINAL_CONFIG.chart.zoom.show && maxX > 6 && isDataset"
            :key="`slicer_${slicerStep}`"
            :background="FINAL_CONFIG.chart.zoom.color"
            :fontSize="FINAL_CONFIG.chart.zoom.fontSize"
            :useResetSlot="FINAL_CONFIG.chart.zoom.useResetSlot"
            :labelLeft="FINAL_CONFIG.chart.grid.labels.xAxisLabels.values[slicer.start]"
            :labelRight="FINAL_CONFIG.chart.grid.labels.xAxisLabels.values[slicer.end-1]"
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
    </div>
</template>

<script>
import { 
    abbreviate,
    adaptColorToBackground,
    assignStackRatios,
    applyDataLabel,
    calcLinearProgression,
    calculateNiceScaleWithExactExtremes,
    checkNaN, 
    closestDecimal,
    convertColorToHex, 
    convertConfigColors,
    convertCustomPalette,
    createCsvContent,
    createPolygonPath,
    createSmoothPath,
    createStraightPath,
    createStar,
    createTSpans,
    createUid,
    dataLabel,
    downloadCsv,
    forceValidValue,
    functionReturnsString,
    hasDeepProperty,
    isFunction,
    isSafeValue,
    largestTriangleThreeBucketsArray,
    opacity, 
    palette,
    placeXYTag,
    setOpacity,
    shiftHue, 
    treeShake,
    error,
    objectIsEmpty,
    themePalettes,
    translateSize,
    createSmoothPathWithCuts,
    createStraightPathWithCuts,
    createAreaWithCuts,
    createIndividualAreaWithCuts,
    createSmoothAreaSegments,
    createIndividualArea
} from '../lib';
import themes from "../themes.json";
import { useConfig } from '../useConfig';
import { useMouse } from '../useMouse';
import { useNestedProp } from '../useNestedProp';
import { defineAsyncComponent } from 'vue';
import Slicer from '../atoms/Slicer.vue';
import Title from '../atoms/Title.vue';
import Shape from '../atoms/Shape.vue';

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
        Slicer, // Must be ready in responsive mode
        Title, // Must be ready in responsive mode
        Shape,
        DataTable: defineAsyncComponent(() => import('../atoms/DataTable.vue')),
        Tooltip: defineAsyncComponent(() => import('../atoms/Tooltip.vue')),
        UserOptions: defineAsyncComponent(() => import('../atoms/UserOptions.vue')),
        BaseIcon: defineAsyncComponent(() => import('../atoms/BaseIcon.vue')),
        TableSparkline: defineAsyncComponent(() => import('./vue-ui-table-sparkline.vue')),
        Skeleton: defineAsyncComponent(() => import('./vue-ui-skeleton.vue')),
        Accordion: defineAsyncComponent(() => import('./vue-ui-accordion.vue')),
        PackageVersion: defineAsyncComponent(() => import('../atoms/PackageVersion.vue')),
        PenAndPaper: defineAsyncComponent(() => import('../atoms/PenAndPaper.vue'))
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

        const lttbThreshold = this.config.downsample ? this.config.downsample.threshold ? this.config.downsample.threshold : 500 : 500

        const maxX = Math.max(...this.dataset.map(datapoint => this.largestTriangleThreeBucketsArray({data: datapoint.series, threshold: lttbThreshold}).length));
        const slicer = {
            start: 0,
            end: maxX,
        }

        return {
            resizeObserver: null,
            observedEl: null,
            themePalettes,
            themes,
            slicerStep: 0,
            selectedScale: null,
            CTX: null,
            CANVAS: null,
            opacity,
            useSafeValues: true,
            palette,
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
            isAnnotator: false,
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
            tableStep: 0,
            titleStep: 0,
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
            },
            selectedMinimapIndex: null,
            showUserOptionsOnChartHover: false,
            keepUserOptionState: true,
            userOptionsVisible: true,
            svgRef: null,
            tagRefs: {}
        }
    },
    watch: {
        dataset: {
            handler(_newDs, _oldDs) {
                this.maxX = Math.max(...this.dataset.map(datapoint => this.largestTriangleThreeBucketsArray({
                    data: datapoint.series,
                    threshold: this.FINAL_CONFIG.downsample.threshold
                }).length));
                this.slicer = {
                    start: 0,
                    end: this.maxX
                }
                this.slicerStep += 1;
                this.segregateStep += 1;
            },
            deep: true
        },
        config: {
            handler(_newCfg, _oldCfg) {
                this.FINAL_CONFIG = this.prepareConfig();
                this.prepareChart();
                this.titleStep += 1;
                this.tableStep += 1;

                // Reset mutable config
                this.mutableConfig = {
                    dataLabels: {
                        show: true,
                    },
                    showTooltip: this.FINAL_CONFIG.chart.tooltip.show === true,
                    showTable: this.FINAL_CONFIG.showTable === true,
                    isStacked: this.FINAL_CONFIG.chart.grid.labels.yAxis.stacked,
                    useIndividualScale: this.FINAL_CONFIG.chart.grid.labels.yAxis.useIndividualScale
                }
            },
            deep: true
        }
    },
    computed: {
        chartAriaLabel() {
            const titleText = this.FINAL_CONFIG.chart.title.text || 'Chart visualization';
            const subtitleText = this.FINAL_CONFIG.chart.title.subtitle.text || '';
            return `${titleText}. ${subtitleText}`;
        },
        optimize() {
            return {
                linePlot: this.maxSeries > this.FINAL_CONFIG.line.dot.hideAboveMaxSerieLength
            };
        },
        hasOptionsNoTitle() {
            return this.FINAL_CONFIG.chart.userOptions.show && (!this.FINAL_CONFIG.chart.title.show || !this.FINAL_CONFIG.chart.title.text);
        },
        minimap() {
            if(!this.FINAL_CONFIG.chart.zoom.minimap.show) return [];
            const source = this.datasetWithIds.filter(ds => !this.segregatedSeries.includes(ds.id));
            const maxIndex = Math.max(...source.map(datapoint => datapoint.series.length));

            const sumAllSeries = [];
            for (let i = 0; i < maxIndex; i += 1) {
                sumAllSeries.push(source.map(ds => ds.series[i] || 0).reduce((a, b) => (a || 0) + (b || 0), 0))
            }
            const min = Math.min(...sumAllSeries);
            return sumAllSeries.map(dp => dp + (min < 0 ? Math.abs(min) : 0)) // positivized
        },
        customPalette() {
            return this.convertCustomPalette(this.FINAL_CONFIG.customPalette);
        },
        backgroundColor() {
            return this.FINAL_CONFIG.chart.backgroundColor;
        },  
        slicerColor() {
            return this.FINAL_CONFIG.chart.zoom.color;
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

            const source = (this.mutableConfig.useIndividualScale && !this.mutableConfig.isStacked) ? Object.values(this.scaleGroups) : [...lines, ...bars, ...plots];

            const len = source.flatMap(el => el).length;
            return source.flatMap((el,i) => {
                return {
                    unique: el.unique,
                    id: el.id,
                    groupId: el.groupId,
                    scaleLabel: el.scaleLabel,
                    name: (this.mutableConfig.useIndividualScale && !this.mutableConfig.isStacked) ? el.unique ? el.name : el.groupName : el.name,
                    color: (this.mutableConfig.useIndividualScale && !this.mutableConfig.isStacked) ? el.unique ? el.color : el.groupColor : el.color,
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
        FINAL_CONFIG: {
            get: function() {
                return this.prepareConfig();
            },
            set: function (newCfg) {
                return newCfg;
            }
        },
        hasHighlightArea() {
            if (Array.isArray(this.FINAL_CONFIG.chart.highlightArea)) {
                return this.FINAL_CONFIG.chart.highlightArea.some(area => area.show)
            }
            return this.FINAL_CONFIG.chart.highlightArea && this.FINAL_CONFIG.chart.highlightArea.show;
        },
        highlightAreas() {
            if (Array.isArray(this.FINAL_CONFIG.chart.highlightArea)) {
                return this.FINAL_CONFIG.chart.highlightArea.map(area => {
                    return {
                        ...area,
                        span: area.from === area.to ? 1 : area.to < area.from ? 0 : area.to - area.from + 1
                    }
                })
            }
            const area = this.FINAL_CONFIG.chart.highlightArea;
            return [ {...area, span: area.from === area.to ? 1 : area.to < area.from ? 0 : area.to - area.from + 1} ];
        },
        xPadding() {
            return this.FINAL_CONFIG.chart.grid.position === 'middle' ? 0 : this.drawingArea.width / this.maxSeries / 2
        },
        relativeZero() {
            if (![null, undefined].includes(this.FINAL_CONFIG.chart.grid.labels.yAxis.scaleMin)) {
                return -this.niceScale.min
            }

            if(this.niceScale.min >= 0) return 0;
            return Math.abs(this.niceScale.min);
        },
        absoluteMax() {
            return this.niceScale.max + this.relativeZero;
        },
        datasetWithIds() {
            if(!this.useSafeValues) return this.dataset;
            return this.dataset.map((datapoint, i) => {
                return {
                    ...datapoint,
                    series: this.largestTriangleThreeBucketsArray({
                        data: datapoint.series,
                        threshold: this.FINAL_CONFIG.downsample.threshold
                    }),
                    id: `uniqueId_${i}`
                }
            });
        },
        safeDataset(){
            if(!this.useSafeValues) return this.dataset;

            return this.dataset.map((datapoint, i) => {
                const LTTD = this.largestTriangleThreeBucketsArray({
                    data: datapoint.series,
                    threshold: this.FINAL_CONFIG.downsample.threshold
                })
                const id = `uniqueId_${i}`;
                return {
                    ...datapoint,
                    slotAbsoluteIndex: i,
                    series: LTTD.map(d => {
                        return this.isSafeValue(d) ? d : null
                    }).slice(this.slicer.start, this.slicer.end),
                    color: this.convertColorToHex(datapoint.color ? datapoint.color : this.customPalette[i] ? this.customPalette[i] : this.palette[i]),
                    id,
                    scaleLabel: datapoint.scaleLabel || id

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
                responsiveBreakpoint: this.FINAL_CONFIG.table.responsiveBreakpoint,
                roundingValues: this.FINAL_CONFIG.table.rounding,
                showAverage: false,
                showMedian: false,
                showTotal: false,
                fontFamily: this.FINAL_CONFIG.chart.fontFamily,
                prefix: this.FINAL_CONFIG.chart.labels.prefix,
                suffix: this.FINAL_CONFIG.chart.labels.suffix,
                colNames: JSON.parse(JSON.stringify(this.FINAL_CONFIG.chart.grid.labels.xAxisLabels.values)),
                thead: {
                    backgroundColor: this.FINAL_CONFIG.table.th.backgroundColor,
                    color: this.FINAL_CONFIG.table.th.color,
                    outline: this.FINAL_CONFIG.table.th.outline
                },
                tbody: {
                    backgroundColor: this.FINAL_CONFIG.table.td.backgroundColor,
                    color: this.FINAL_CONFIG.table.td.color,
                    outline: this.FINAL_CONFIG.table.td.outline
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
        activeSeriesLength() {
            return this.absoluteDataset.length
        },
        activeSeriesWithStackRatios() {
            return this.assignStackRatios(this.absoluteDataset.filter(ds => !this.segregatedSeries.includes(ds.id)))
        },
        scaleGroups() {
            const grouped = Object.groupBy(this.activeSeriesWithStackRatios, item => item.scaleLabel);
            const result = {};
            for (const [group, items] of Object.entries(grouped)) {
                const allValues = items.flatMap(item => item.absoluteValues);
                result[group] = {
                    min: Math.min(...allValues) || 0,
                    max: Math.max(...allValues) || 1,
                    groupId: `scale_group_${this.createUid()}`
                };
            }
            return result;
        },
        barSet() {
            return this.activeSeriesWithStackRatios.filter(s => s.type === 'bar').map((datapoint, i) => {
                this.checkAutoScaleError(datapoint);
                const min = this.scaleGroups[datapoint.scaleLabel].min;
                const max = this.scaleGroups[datapoint.scaleLabel].max;
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
                const scaleSteps = datapoint.scaleSteps || this.FINAL_CONFIG.chart.grid.labels.yAxis.commonScaleSteps;

                const corrector = 1.0000001;

                const individualScale = this.calculateNiceScaleWithExactExtremes(individualExtremes.min, individualExtremes.max === individualExtremes.min ? individualExtremes.max * corrector : individualExtremes.max, scaleSteps);
                
                const autoScaleSteps = this.calculateNiceScaleWithExactExtremes(autoScale.valueMin, autoScale.valueMax === autoScale.valueMin ? autoScale.valueMax * corrector : autoScale.valueMax, scaleSteps);

                const individualZero = individualScale.min >= 0 ? 0 : Math.abs(individualScale.min);
                const autoScaleZero = 0;

                const individualMax = individualScale.max + individualZero;
                const autoScaleMax = autoScaleSteps.max + Math.abs(autoScaleZero);

                const yOffset = this.mutableConfig.isStacked ? (this.drawingArea.height * (1 - datapoint.cumulatedStackRatio)) : 0;

                const individualHeight = this.mutableConfig.isStacked ? (this.drawingArea.height * datapoint.stackRatio) - this.FINAL_CONFIG.chart.grid.labels.yAxis.gap : this.drawingArea.height;

                const zeroPosition = this.drawingArea.bottom - yOffset - ((individualHeight) * individualZero / individualMax);
                const autoScaleZeroPosition = this.drawingArea.bottom - yOffset - (individualHeight * autoScaleZero / autoScaleMax);

                const barLen = this.absoluteDataset.filter(ds => ds.type === 'bar').filter(s => !this.segregatedSeries.includes(s.id)).length;

                const plots = datapoint.series.map((plot, j) => {
                    const yRatio = this.mutableConfig.useIndividualScale ? ((datapoint.absoluteValues[j] + individualZero) / individualMax) : this.ratioToMax(plot)
                    const x = this.mutableConfig.useIndividualScale && this.mutableConfig.isStacked 
                        ? this.drawingArea.left + (this.drawingArea.width / this.maxSeries * j) 
                        : this.drawingArea.left
                            + (this.slot.bar * i)
                            + (this.slot.bar * j * barLen)
                            - (this.barSlot / 2)
                            - (i * this.barPeriodGap)


                    return {
                        yOffset: this.checkNaN(yOffset),
                        individualHeight: this.checkNaN(individualHeight),
                        x: this.checkNaN(x),
                        y: this.drawingArea.bottom - yOffset - (individualHeight * yRatio),
                        value: datapoint.absoluteValues[j],
                        zeroPosition: this.checkNaN(zeroPosition),
                        individualMax: this.checkNaN(individualMax),
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
                        yOffset: this.checkNaN(yOffset),
                        individualHeight: this.checkNaN(individualHeight),
                        x: this.checkNaN(x),
                        y: this.checkNaN(this.drawingArea.bottom - this.checkNaN(yOffset) - ((this.checkNaN(individualHeight) * autoScaleRatiosToNiceScale[j]) || 0)),
                        value: datapoint.absoluteValues[j],
                        zeroPosition: this.checkNaN(zeroPosition),
                        individualMax: this.checkNaN(individualMax),
                        comment: datapoint.comments ? datapoint.comments.slice(this.slicer.start, this.slicer.end)[j] || '' : ''
                    }
                });

                const scaleYLabels = individualScale.ticks.map(t => {
                    return {
                        y: t >= 0 ? zeroPosition - (individualHeight * (t / individualMax)) : zeroPosition + (individualHeight * Math.abs(t) / individualMax),
                        value: t,
                        prefix: datapoint.prefix || this.FINAL_CONFIG.chart.labels.prefix,
                        suffix: datapoint.suffix || this.FINAL_CONFIG.chart.labels.suffix,
                        datapoint
                    }
                })

                const autoScaleYLabels = autoScaleSteps.ticks.map(t => {
                    const v = (t - autoScaleSteps.min) / (autoScaleSteps.max - autoScaleSteps.min);
                    return {
                        y: t >= 0 ? autoScaleZeroPosition - (individualHeight * v) : autoScaleZeroPosition + (individualHeight * v),
                        value: t,
                        prefix: datapoint.prefix || this.FINAL_CONFIG.chart.labels.prefix,
                        suffix: datapoint.suffix || this.FINAL_CONFIG.chart.labels.suffix,
                        datapoint
                    }
                });

                this.scaleGroups[datapoint.scaleLabel].name = datapoint.name;
                this.scaleGroups[datapoint.scaleLabel].groupName = datapoint.scaleLabel;
                this.scaleGroups[datapoint.scaleLabel].groupColor = this.FINAL_CONFIG.chart.grid.labels.yAxis.groupColor || datapoint.color;
                this.scaleGroups[datapoint.scaleLabel].color = datapoint.color;
                this.scaleGroups[datapoint.scaleLabel].scaleYLabels = datapoint.autoScaling ? autoScaleYLabels : scaleYLabels;
                this.scaleGroups[datapoint.scaleLabel].zeroPosition = datapoint.autoScaling ? autoScaleZeroPosition : zeroPosition;
                this.scaleGroups[datapoint.scaleLabel].individualMax = datapoint.autoScaling ? autoScaleMax : individualMax;
                this.scaleGroups[datapoint.scaleLabel].scaleLabel = datapoint.scaleLabel;
                this.scaleGroups[datapoint.scaleLabel].id = datapoint.id;
                this.scaleGroups[datapoint.scaleLabel].yOffset = yOffset;
                this.scaleGroups[datapoint.scaleLabel].individualHeight = individualHeight;
                this.scaleGroups[datapoint.scaleLabel].autoScaleYLabels = autoScaleYLabels;
                this.scaleGroups[datapoint.scaleLabel].unique = this.activeSeriesWithStackRatios.filter(el => el.scaleLabel === datapoint.scaleLabel).length === 1

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
                    groupId: this.scaleGroups[datapoint.scaleLabel].groupId
                }
            })
        },
        lineSet() {
            return this.activeSeriesWithStackRatios.filter(s => s.type === 'line').map((datapoint) => {
                this.checkAutoScaleError(datapoint);

                const min = this.scaleGroups[datapoint.scaleLabel].min;
                const max = this.scaleGroups[datapoint.scaleLabel].max;
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

                const scaleSteps = datapoint.scaleSteps || this.FINAL_CONFIG.chart.grid.labels.yAxis.commonScaleSteps

                const corrector = 1.0000001;

                const individualScale = this.calculateNiceScaleWithExactExtremes(individualExtremes.min, individualExtremes.max === individualExtremes.min ? individualExtremes.max * corrector : individualExtremes.max, scaleSteps);
                
                const autoScaleSteps = this.calculateNiceScaleWithExactExtremes(autoScale.valueMin, autoScale.valueMax === autoScale.valueMin ? autoScale.valueMax * corrector : autoScale.valueMax, scaleSteps);

                const individualZero = (individualScale.min >= 0 ? 0 : Math.abs(individualScale.min));
                const autoScaleZero = 0;

                const individualMax = individualScale.max + Math.abs(individualZero);
                const autoScaleMax = autoScaleSteps.max + Math.abs(autoScaleZero);

                const yOffset = this.mutableConfig.isStacked ? (this.drawingArea.height * (1 - datapoint.cumulatedStackRatio)) : 0;

                const individualHeight = this.mutableConfig.isStacked ? (this.drawingArea.height * datapoint.stackRatio) - this.FINAL_CONFIG.chart.grid.labels.yAxis.gap : this.drawingArea.height;
                
                const zeroPosition = this.drawingArea.bottom - yOffset - ((individualHeight) * individualZero / individualMax);

                const autoScaleZeroPosition = this.drawingArea.bottom - yOffset - (individualHeight * autoScaleZero / autoScaleMax);

                const plots = datapoint.series.map((plot, j) => {
                    const yRatio = this.mutableConfig.useIndividualScale 
                        ? ((datapoint.absoluteValues[j] + Math.abs(individualZero)) / individualMax) 
                        : this.ratioToMax(plot)

                    return {
                        x: this.checkNaN((this.drawingArea.left + (this.slot.line/2)) + (this.slot.line * j)),
                        y: this.checkNaN(this.drawingArea.bottom - yOffset - (individualHeight * yRatio)),
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
                            x: this.checkNaN((this.drawingArea.left + (this.slot.line/2)) + (this.slot.line * j)),
                            y: this.checkNaN(this.drawingArea.bottom - yOffset - ((individualHeight * autoScaleRatiosToNiceScale[j]) || 0)),
                            value: datapoint.absoluteValues[j],
                            comment: datapoint.comments ? datapoint.comments.slice(this.slicer.start, this.slicer.end)[j] || '' : ''
                        }
                    } else {
                        return {
                            x: this.checkNaN((this.drawingArea.left + (this.slot.line/2)) + (this.slot.line * j)),
                            y: zeroPosition,
                            value: datapoint.absoluteValues[j],
                            comment: datapoint.comments ? datapoint.comments.slice(this.slicer.start, this.slicer.end)[j] || '' : ''
                        }
                    }
                })

                const curve = this.FINAL_CONFIG.line.cutNullValues 
                    ? this.createSmoothPathWithCuts(plots) 
                    : this.createSmoothPath(plots.filter(p => p.value !== null));

                const autoScaleCurve = this.FINAL_CONFIG.line.cutNullValues 
                    ? this.createSmoothPathWithCuts(autoScalePlots) 
                    : this.createSmoothPath(autoScalePlots.filter(p => p.value !== null));

                const straight = this.FINAL_CONFIG.line.cutNullValues 
                    ? this.createStraightPathWithCuts(plots) 
                    : this.createStraightPath(plots.filter(p => p.value !== null));

                const autoScaleStraight = this.FINAL_CONFIG.line.cutNullValues 
                    ? this.createStraightPathWithCuts(autoScalePlots) 
                    : this.createStraightPath(autoScalePlots.filter(p => p.value !== null));

                const scaleYLabels = individualScale.ticks.map(t => {
                    return {
                        y: t >= 0 ? zeroPosition - (individualHeight * (t / individualMax)) : zeroPosition + (individualHeight * Math.abs(t) / individualMax),
                        value: t,
                        prefix: datapoint.prefix || this.FINAL_CONFIG.chart.labels.prefix,
                        suffix: datapoint.suffix || this.FINAL_CONFIG.chart.labels.suffix,
                        datapoint
                    }
                })

                const autoScaleYLabels = autoScaleSteps.ticks.map(t => {
                    const v = (t - autoScaleSteps.min) / (autoScaleSteps.max - autoScaleSteps.min);
                    return {
                        y: t >= 0 ? autoScaleZeroPosition - (individualHeight * v) : autoScaleZeroPosition + (individualHeight * v),
                        value: t,
                        prefix: datapoint.prefix || this.FINAL_CONFIG.chart.labels.prefix,
                        suffix: datapoint.suffix || this.FINAL_CONFIG.chart.labels.suffix,
                        datapoint
                    }
                });

                this.scaleGroups[datapoint.scaleLabel].name = datapoint.name;
                this.scaleGroups[datapoint.scaleLabel].groupName = datapoint.scaleLabel;
                this.scaleGroups[datapoint.scaleLabel].groupColor = this.FINAL_CONFIG.chart.grid.labels.yAxis.groupColor || datapoint.color;
                this.scaleGroups[datapoint.scaleLabel].color = datapoint.color;
                this.scaleGroups[datapoint.scaleLabel].scaleYLabels = datapoint.autoScaling ? autoScaleYLabels : scaleYLabels;
                this.scaleGroups[datapoint.scaleLabel].zeroPosition = datapoint.autoScaling ? autoScaleZeroPosition : zeroPosition;
                this.scaleGroups[datapoint.scaleLabel].individualMax = datapoint.autoScaling ? autoScaleMax : individualMax;
                this.scaleGroups[datapoint.scaleLabel].scaleLabel = datapoint.scaleLabel;
                this.scaleGroups[datapoint.scaleLabel].id = datapoint.id;
                this.scaleGroups[datapoint.scaleLabel].yOffset = yOffset;
                this.scaleGroups[datapoint.scaleLabel].individualHeight = individualHeight;
                this.scaleGroups[datapoint.scaleLabel].autoScaleYLabels = autoScaleYLabels;
                this.scaleGroups[datapoint.scaleLabel].unique = this.activeSeriesWithStackRatios.filter(el => el.scaleLabel === datapoint.scaleLabel).length === 1 

                const areaZeroPosition = this.mutableConfig.useIndividualScale ? datapoint.autoScaling ? autoScaleZeroPosition : zeroPosition : this.zero;
                const adustedAreaZeroPosition = Math.max(Math.max(datapoint.autoScaling ? autoScaleZeroPosition : scaleYLabels.at(-1).y, this.drawingArea.top), areaZeroPosition);

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
                        : this.mutableConfig.useIndividualScale 
                            ? this.FINAL_CONFIG.line.cutNullValues 
                                ? this.createIndividualAreaWithCuts(datapoint.autoScaling
                                        ? autoScalePlots
                                        : plots,
                                        adustedAreaZeroPosition,
                                    )
                                : this.createIndividualArea(datapoint.autoScaling 
                                    ? autoScalePlots.filter(p => p.value !== null)
                                    : plots.filter(p => p.value !== null),
                                    adustedAreaZeroPosition) 
                            :  this.createIndividualArea(plots.filter(p => p.value !== null), adustedAreaZeroPosition),
                    curveAreas: !datapoint.useArea
                        ? [] 
                        :createSmoothAreaSegments(
                            datapoint.autoScaling 
                                ? this.FINAL_CONFIG.line.cutNullValues 
                                    ? autoScalePlots
                                    : autoScalePlots.filter(p => p.value !== null)
                                : this.FINAL_CONFIG.line.cutNullValues 
                                    ? plots
                                    : plots.filter(p => p.value !== null),
                                    adustedAreaZeroPosition,
                            this.FINAL_CONFIG.line.cutNullValues),
                    straight: datapoint.autoScaling ? autoScaleStraight : straight,
                    groupId: this.scaleGroups[datapoint.scaleLabel].groupId
                }
            });
        },
        plotSet() {
            return this.activeSeriesWithStackRatios.filter(s => s.type === 'plot').map((datapoint) => {
                this.checkAutoScaleError(datapoint);
                const min = this.scaleGroups[datapoint.scaleLabel].min;
                const max = this.scaleGroups[datapoint.scaleLabel].max;
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

                const scaleSteps = datapoint.scaleSteps || this.FINAL_CONFIG.chart.grid.labels.yAxis.commonScaleSteps;

                const corrector = 1.0000001;

                const individualScale = this.calculateNiceScaleWithExactExtremes(individualExtremes.min, individualExtremes.max === individualExtremes.min ? individualExtremes.max * corrector : individualExtremes.max, scaleSteps);
                
                const autoScaleSteps = this.calculateNiceScaleWithExactExtremes(autoScale.valueMin, autoScale.valueMax === autoScale.valueMin ? autoScale.valueMax * corrector : autoScale.valueMax, scaleSteps);

                const individualZero = individualScale.min >= 0 ? 0 : Math.abs(individualScale.min);
                const autoScaleZero = 0;

                const individualMax = individualScale.max + individualZero;
                const autoScaleMax = autoScaleSteps.max + Math.abs(autoScaleZero);
                
                const yOffset = this.mutableConfig.isStacked ? (this.drawingArea.height * (1 - datapoint.cumulatedStackRatio)) : 0;

                const individualHeight = this.mutableConfig.isStacked ? (this.drawingArea.height * datapoint.stackRatio) - this.FINAL_CONFIG.chart.grid.labels.yAxis.gap : this.drawingArea.height;

                const zeroPosition = this.drawingArea.bottom - yOffset - ((individualHeight) * individualZero / individualMax);
                const autoScaleZeroPosition = this.drawingArea.bottom - yOffset - (individualHeight * autoScaleZero / autoScaleMax);

                const plots = datapoint.series.map((plot, j) => {
                    const yRatio = this.mutableConfig.useIndividualScale ? ((datapoint.absoluteValues[j] + Math.abs(individualZero)) / individualMax) : this.ratioToMax(plot)
                    return {
                        x: this.checkNaN((this.drawingArea.left + (this.slot.plot / 2)) + (this.slot.plot * j)),
                        y: this.checkNaN(this.drawingArea.bottom - yOffset - (individualHeight * yRatio)),
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
                        x: this.checkNaN((this.drawingArea.left + (this.slot.plot / 2)) + (this.slot.plot * j)),
                        y: this.checkNaN(this.drawingArea.bottom - yOffset - ((individualHeight * autoScaleRatiosToNiceScale[j]) || 0)),
                        value: datapoint.absoluteValues[j],
                        comment: datapoint.comments ? datapoint.comments.slice(this.slicer.start, this.slicer.end)[j] || '' : ''
                    }
                })

                const scaleYLabels = individualScale.ticks.map(t => {
                    return {
                        y: t >= 0 ? zeroPosition - (individualHeight * (t / individualMax)) : zeroPosition + (individualHeight * Math.abs(t) / individualMax),
                        value: t,
                        prefix: datapoint.prefix || this.FINAL_CONFIG.chart.labels.prefix,
                        suffix: datapoint.suffix || this.FINAL_CONFIG.chart.labels.suffix,
                        datapoint,
                    }
                })

                const autoScaleYLabels = autoScaleSteps.ticks.map(t => {
                    const v = (t - autoScaleSteps.min) / (autoScaleSteps.max - autoScaleSteps.min);
                    return {
                        y: t >= 0 ? autoScaleZeroPosition - (individualHeight * v) : autoScaleZeroPosition + (individualHeight * v),
                        value: t,
                        prefix: datapoint.prefix || this.FINAL_CONFIG.chart.labels.prefix,
                        suffix: datapoint.suffix || this.FINAL_CONFIG.chart.labels.suffix,
                        datapoint
                    }
                });

                this.scaleGroups[datapoint.scaleLabel].name = datapoint.name;
                this.scaleGroups[datapoint.scaleLabel].groupName = datapoint.scaleLabel;
                this.scaleGroups[datapoint.scaleLabel].groupColor = this.FINAL_CONFIG.chart.grid.labels.yAxis.groupColor || datapoint.color;
                this.scaleGroups[datapoint.scaleLabel].color = datapoint.color;
                this.scaleGroups[datapoint.scaleLabel].scaleYLabels = datapoint.autoScaling ? autoScaleYLabels : scaleYLabels;
                this.scaleGroups[datapoint.scaleLabel].zeroPosition = datapoint.autoScaling ? autoScaleZeroPosition : zeroPosition;
                this.scaleGroups[datapoint.scaleLabel].individualMax = datapoint.autoScaling ? autoScaleMax : individualMax;
                this.scaleGroups[datapoint.scaleLabel].scaleLabel = datapoint.scaleLabel;
                this.scaleGroups[datapoint.scaleLabel].id = datapoint.id;
                this.scaleGroups[datapoint.scaleLabel].yOffset = yOffset;
                this.scaleGroups[datapoint.scaleLabel].individualHeight = individualHeight;
                this.scaleGroups[datapoint.scaleLabel].autoScaleYLabels = autoScaleYLabels;
                this.scaleGroups[datapoint.scaleLabel].unique = this.activeSeriesWithStackRatios.filter(el => el.scaleLabel === datapoint.scaleLabel).length === 1

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
                    groupId: this.scaleGroups[datapoint.scaleLabel].groupId
                }
            })
        },
        drawingArea() {
            function getUniqueScaleLabelsCount(dataset) {
            const uniqueLabels = new Set();
                dataset.forEach(item => {
                    const label = item.scaleLabel || '__noScaleLabel__';
                    uniqueLabels.add(label);
                });
                return uniqueLabels.size;
                }

            const len = getUniqueScaleLabelsCount(this.absoluteDataset.filter(s => !this.segregatedSeries.includes(s.id)));

            const individualScalesPadding = this.mutableConfig.useIndividualScale && this.FINAL_CONFIG.chart.grid.labels.show ? len * (this.mutableConfig.isStacked ? 0 : this.FINAL_CONFIG.chart.grid.labels.yAxis.labelWidth) : 0;
            return {
                top: this.FINAL_CONFIG.chart.padding.top,
                right: this.width - this.FINAL_CONFIG.chart.padding.right,
                bottom: this.height - this.FINAL_CONFIG.chart.padding.bottom,
                left: this.FINAL_CONFIG.chart.padding.left + individualScalesPadding,
                height: this.height - (this.FINAL_CONFIG.chart.padding.top + this.FINAL_CONFIG.chart.padding.bottom),
                width: this.width - (this.FINAL_CONFIG.chart.padding.right + this.FINAL_CONFIG.chart.padding.left + individualScalesPadding)
            }
        },
        max(){
            if (this.FINAL_CONFIG.chart.grid.labels.yAxis.scaleMax) {
                return this.FINAL_CONFIG.chart.grid.labels.yAxis.scaleMax
            }
            return Math.max(...this.safeDataset.filter(s => !this.segregatedSeries.includes(s.id)).map(datapoint => Math.max(...datapoint.series)));
        },
        min() {
            if (this.FINAL_CONFIG.chart.grid.labels.yAxis.scaleMin !== null) {
                return this.FINAL_CONFIG.chart.grid.labels.yAxis.scaleMin
            }
            const min = Math.min(...this.safeDataset.filter(s => !this.segregatedSeries.includes(s.id)).map(datapoint => Math.min(...datapoint.series)));
            if(min > 0) return 0;
            return min;
        },
        niceScale() {
            return this.calculateNiceScaleWithExactExtremes(this.min, this.max < 0 ? 0 : this.max, this.FINAL_CONFIG.chart.grid.labels.yAxis.commonScaleSteps)
        },
        maxSeries(){
            return this.slicer.end - this.slicer.start;
        },
        timeLabels() {
            const max = Math.max(...this.dataset.map(datapoint => this.largestTriangleThreeBucketsArray({data:datapoint.series, threshold: this.FINAL_CONFIG.downsample.threshold}).length));
            const labels = [];

            for (let i = 0; i < max; i += 1) {
                labels.push({
                    text: this.FINAL_CONFIG.chart.grid.labels.xAxisLabels.values[i] || String(i),
                    absoluteIndex: i
                })
            }

            return labels.slice(this.slicer.start, this.slicer.end);
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
            return this.slot.line * this.FINAL_CONFIG.bar.periodGap;
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
                const row = [t.text];
                this.relativeDataset.forEach(s => {
                    row.push(this.canShowValue(s.absoluteValues[i]) ? Number(s.absoluteValues[i].toFixed(this.FINAL_CONFIG.table.rounding)) : '')
                });
                body.push(row);
            })

            return { head, body};
        },
        dataTable() {
            const showSum = this.FINAL_CONFIG.table.showSum;
            let head = [''].concat(this.relativeDataset.map(ds => ds.name))

            if(showSum) {
                head = head.concat(` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`)
            }

            let body = [];
            for(let i = 0; i < this.maxSeries; i += 1) {
                const sum = this.relativeDataset.map(ds => {
                    return ds.absoluteValues[i] ?? 0
                }).reduce((a, b) => a + b, 0)

                body.push([
                    this.timeLabels[i].text ?? '-']
                    .concat(this.relativeDataset
                        .map(ds => {
                            return this.applyDataLabel(
                                ds.type === 'line' ? this.FINAL_CONFIG.line.labels.formatter :
                                ds.type === 'bar' ? this.FINAL_CONFIG.bar.labels.formatter :
                                this.FINAL_CONFIG.plot.labels.formatter,
                                ds.absoluteValues[i] ?? 0,
                                this.dataLabel({
                                    p: ds.prefix || this.FINAL_CONFIG.chart.labels.prefix,
                                    v: ds.absoluteValues[i] ?? 0,
                                    s: ds.suffix || this.FINAL_CONFIG.chart.labels.suffix,
                                    r: this.FINAL_CONFIG.table.rounding
                                })
                            )}
                        ))
                    .concat(showSum ? (sum ?? 0).toFixed(this.FINAL_CONFIG.table.rounding) : [])
                )
            }

            const config = {
                th: {
                    backgroundColor: this.FINAL_CONFIG.table.th.backgroundColor,
                    color: this.FINAL_CONFIG.table.th.color,
                    outline: this.FINAL_CONFIG.table.th.outline
                },
                td: {
                    backgroundColor: this.FINAL_CONFIG.table.td.backgroundColor,
                    color: this.FINAL_CONFIG.table.td.color,
                    outline: this.FINAL_CONFIG.table.td.outline
                },
                breakpoint: this.FINAL_CONFIG.table.responsiveBreakpoint
            }
            const colNames = [this.FINAL_CONFIG.table.columnNames.period].concat(this.relativeDataset.map(ds => ds.name)).concat(this.FINAL_CONFIG.table.columnNames.total)

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
                config: this.FINAL_CONFIG 
            }
        },
        selectedSeries() {
            return this.relativeDataset.map(datapoint => {
                return {
                    slotAbsoluteIndex: datapoint.slotAbsoluteIndex,
                    shape: datapoint.shape || null,
                    name: datapoint.name,
                    color: datapoint.color,
                    type: datapoint.type,
                    value: datapoint.absoluteValues.find((_s,i) => i === this.selectedSerieIndex),
                    comments: datapoint.comments || [],
                    prefix: datapoint.prefix || this.FINAL_CONFIG.chart.labels.prefix,
                    suffix: datapoint.suffix || this.FINAL_CONFIG.chart.labels.suffix,
                }
            });
        },  
        tooltipContent() {            
            let html = "";
            
            let sum = this.selectedSeries.map(s => s.value).filter(s => this.isSafeValue(s) && s !== null).reduce((a,b) => Math.abs(a) + Math.abs(b), 0);
            
            const time = this.timeLabels[this.selectedSerieIndex];
            const customFormat = this.FINAL_CONFIG.chart.tooltip.customFormat;

            if(this.isFunction(customFormat) && this.functionReturnsString(() => customFormat({
                seriesIndex: this.selectedSerieIndex,
                datapoint: this.selectedSeries,
                series: this.absoluteDataset,
                bars: this.barSet,
                lines: this.lineSet,
                plots: this.plotSet,
                config: this.FINAL_CONFIG
            }))) {
                return customFormat({
                    seriesIndex: this.selectedSerieIndex,
                    datapoint: this.selectedSeries,
                    series: this.absoluteDataset,
                    bars: this.barSet,
                    lines: this.lineSet,
                    plots: this.plotSet,
                    config: this.FINAL_CONFIG
                })
            } else {
                if(time && time.text && this.FINAL_CONFIG.chart.tooltip.showTimeLabel) {
                    html += `<div style="padding-bottom: 6px; margin-bottom: 4px; border-bottom: 1px solid ${this.FINAL_CONFIG.chart.tooltip.borderColor}; width:100%">${time.text}</div>`;
                }
                this.selectedSeries.forEach(s => {
                    if(this.isSafeValue(s.value)) {
                        let shape = '';
                        let insideShape = '';
                        switch (this.icons[s.type]) {
                            case 'bar':
                                shape = `<svg viewBox="0 0 40 40" height="14" width="14">${this.$slots.pattern ? `<rect x="0" y="0" rx="1" stroke="none" height="40" width="40" fill="${s.color}" />`: ''}<rect x="0" y="0" rx="1" stroke="none" height="40" width="40" fill="${this.$slots.pattern ? `url(#pattern_${this.uniqueId}_${s.slotAbsoluteIndex}` : s.color}" /></svg>`;
                                break;
                            
                            case 'line':
                                if(!s.shape || !['star', 'triangle', 'square', 'diamond', 'pentagon', 'hexagon'].includes(s.shape)) {
                                    insideShape = `<circle cx="10" cy="8" r="4" stroke="${this.FINAL_CONFIG.chart.tooltip.backgroundColor}" stroke-width="0.5" fill="${s.color}" />`
                                } else if(s.shape === 'triangle') {
                                    insideShape = `<path d="${createPolygonPath({ plot: { x: 10, y: 8}, radius: 4, sides: 3, rotation: 0.52}).path}" fill="${s.color}" stroke="${this.FINAL_CONFIG.chart.tooltip.backgroundColor}" stroke-width="0.5" />`
                                } else if(s.shape === 'square') {
                                    insideShape = `<path d="${createPolygonPath({ plot: { x: 10, y: 8}, radius: 4, sides: 4, rotation: 0.8}).path}" fill="${s.color}" stroke="${this.FINAL_CONFIG.chart.tooltip.backgroundColor}" stroke-width="0.5" />`
                                } else if(s.shape === 'diamond') {
                                    insideShape = `<path d="${createPolygonPath({ plot: { x: 10, y: 8}, radius: 4, sides: 4, rotation: 0}).path}" fill="${s.color}" stroke="${this.FINAL_CONFIG.chart.tooltip.backgroundColor}" stroke-width="0.5" />`
                                } else if(s.shape === 'pentagon') {
                                    insideShape = `<path d="${createPolygonPath({ plot: { x: 10, y: 8}, radius: 4, sides: 5, rotation: 0.95}).path}" fill="${s.color}" stroke="${this.FINAL_CONFIG.chart.tooltip.backgroundColor}" stroke-width="0.5" />`
                                } else if(s.shape === 'hexagon') {
                                    insideShape = `<path d="${createPolygonPath({ plot: { x: 10, y: 8}, radius: 4, sides: 6, rotation: 0}).path}" fill="${s.color}" stroke="${this.FINAL_CONFIG.chart.tooltip.backgroundColor}" stroke-width="0.5" />`
                                } else if(s.shape === 'star') {
                                    insideShape = `<polygon stroke="${this.FINAL_CONFIG.chart.tooltip.backgroundColor}" stroke-width="0.5" fill="${s.color}" points="${createStar({ plot: { x: 10, y: 8 }, radius: 4})}" />`
                                }
                                shape = `<svg viewBox="0 0 20 12" height="14" width="20"><rect rx="1.5" x="0" y="6.5" stroke="${this.FINAL_CONFIG.chart.tooltip.backgroundColor}" stroke-width="0.5" height="3" width="20" fill="${s.color}" />${insideShape}</svg>`;
                                break;
    
                            case 'plot':
                                if (!s.shape || !['star', 'triangle', 'square', 'diamond', 'pentagon', 'hexagon'].includes(s.shape)) {
                                    shape = `<svg viewBox="0 0 12 12" height="14" width="14"><circle cx="6" cy="6" r="6" stroke="${this.FINAL_CONFIG.chart.tooltip.backgroundColor}" stroke-width="1" fill="${s.color}" /></svg>`;
                                    break;
                                }
                                if(s.shape === 'star') {
                                    shape = `<svg viewBox="0 0 12 12" height="14" width="14"><polygon stroke="${this.FINAL_CONFIG.chart.tooltip.backgroundColor}" stroke-width="1" fill="${s.color}" points="${createStar({ plot: { x: 6, y: 6 }, radius: 5})}" /></svg>`;
                                    break;
                                }
                                if(s.shape === 'triangle') {
                                    shape = `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6}, radius: 6, sides: 3, rotation: 0.52}).path}" fill="${s.color}" stroke="${this.FINAL_CONFIG.chart.tooltip.backgroundColor}" stroke-width="1" /></svg>`;
                                    break;
                                }
                                if(s.shape === 'square') {
                                    shape = `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6}, radius: 6, sides: 4, rotation: 0.8}).path}" fill="${s.color}" stroke="${this.FINAL_CONFIG.chart.tooltip.backgroundColor}" stroke-width="1" /></svg>`;
                                    break;
                                }
                                if(s.shape === 'diamond') {
                                    shape = `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6}, radius: 5, sides: 4, rotation: 0}).path}" fill="${s.color}" stroke="${this.FINAL_CONFIG.chart.tooltip.backgroundColor}" stroke-width="1" /></svg>`;
                                    break;
                                }
                                if(s.shape === 'pentagon') {
                                    shape = `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6}, radius: 5, sides: 5, rotation: 0.95}).path}" fill="${s.color}" stroke="${this.FINAL_CONFIG.chart.tooltip.backgroundColor}" stroke-width="1" /></svg>`;
                                    break;
                                }
                                if(s.shape === 'hexagon') {
                                    shape = `<svg viewBox="0 0 12 12" height="14" width="14"><path d="${createPolygonPath({ plot: { x: 6, y: 6}, radius: 5, sides: 6, rotation: 0}).path}" fill="${s.color}" stroke="${this.FINAL_CONFIG.chart.tooltip.backgroundColor}" stroke-width="1" /></svg>`;
                                    break;
                                }
                            default:
                                break;
                        }
                        html += `<div style="display:flex;flex-direction:row; align-items:center;gap:3px;"><div style="width:20px">${shape}</div> ${s.name}: <b>${this.FINAL_CONFIG.chart.tooltip.showValue ? 
                                this.applyDataLabel(
                                    s.type === 'line' ? this.FINAL_CONFIG.line.labels.formatter :
                                    s.type === 'bar' ? this.FINAL_CONFIG.bar.labels.formatter :
                                    this.FINAL_CONFIG.plot.labels.formatter,
                                    s.value,
                                    this.dataLabel({
                                        p: s.prefix, 
                                        v: s.value, 
                                        s: s.suffix, 
                                        r: this.FINAL_CONFIG.chart.tooltip.roundingValue,
                                    }),
                                    { datapoint: s }
                                ) : ''}</b> ${this.FINAL_CONFIG.chart.tooltip.showPercentage ? `(${dataLabel({
                                    v: this.checkNaN(Math.abs(s.value) / sum * 100),
                                    s: '%',
                                    r: this.FINAL_CONFIG.chart.tooltip.roundingPercentage
                                })})` : ''}</div>`;

                        if (this.FINAL_CONFIG.chart.comments.showInTooltip && s.comments.length && s.comments.slice(this.slicer.start, this.slicer.end)[this.selectedSerieIndex]) {
                            html += `<div class="vue-data-ui-tooltip-comment" style="background:${s.color}20; padding: 6px; margin-bottom: 6px; border-left: 1px solid ${s.color}">${s.comments.slice(this.slicer.start, this.slicer.end)[this.selectedSerieIndex]}</div>`
                        }

                    }
                });
                return `<div style="border-radius:4px;padding:12px;font-variant-numeric: tabular-nums;color:${this.FINAL_CONFIG.chart.tooltip.color}">${html}</div>`;
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
                    value: t,
                    prefix: this.FINAL_CONFIG.chart.labels.prefix,
                    suffix: this.FINAL_CONFIG.chart.labels.suffix,
                }
            })
        },
        zero(){
            return this.drawingArea.bottom - (this.drawingArea.height * this.ratioToMax(this.relativeZero));
        },
    },
    mounted() {
        this.svgRef = this.$refs.svgRef;
        this.prepareChart();
        this.setupSlicer();

        document.addEventListener("mousemove", (e) => {
            this.clientPosition = {
                x: e.clientX,
                y: e.clientY
            }
        });
        
        document.addEventListener('scroll', this.hideTags);
    },
    beforeUnmount() {
        document.removeEventListener('scroll', this.hideTags);
        if (this.resizeObserver) {
            this.resizeObserver.unobserve(this.observedEl);
            this.resizeObserver.disconnect();
        }
    },
    methods: {
        abbreviate,
        adaptColorToBackground,
        applyDataLabel,
        assignStackRatios,
        calcLinearProgression,
        calculateNiceScaleWithExactExtremes,
        checkNaN,
        closestDecimal,
        convertColorToHex,
        convertConfigColors,
        convertCustomPalette,
        createCsvContent,
        createSmoothPath,
        createStraightPath,
        createTSpans,
        dataLabel,
        downloadCsv,
        error,
        forceValidValue,
        functionReturnsString,
        hasDeepProperty,
        isFunction,
        isSafeValue,
        largestTriangleThreeBucketsArray,
        objectIsEmpty,
        setOpacity,
        shiftHue,
        translateSize,
        treeShake,
        useMouse,
        useNestedProp,
        createUid,
        placeXYTag,
        createSmoothPathWithCuts,
        createStraightPathWithCuts,
        createAreaWithCuts,
        createIndividualAreaWithCuts,
        createSmoothAreaSegments,
        createIndividualArea,
        hideTags() {
            const tags = document.querySelectorAll('.vue-ui-xy-tag')
            if (tags.length) {
                Array.from(tags).forEach(tag => tag.style.opacity = '0')
            }
        },
        setTagRef(i, j, el, position, type) {
            if (el) this.tagRefs[`${i}_${j}_${position}_${type}`] = el;
        },
        setUserOptionsVisibility(state = false) {
            if (!this.showUserOptionsOnChartHover) return;
            this.userOptionsVisible = state
        },
        toggleAnnotator() {
            this.isAnnotator = !this.isAnnotator;
        },
        selectTimeLabel(label, relativeIndex) {
            const datapoint = this.relativeDataset.map(datapoint => {
                return {
                    shape: datapoint.shape || null,
                    name: datapoint.name,
                    color: datapoint.color,
                    type: datapoint.type,
                    value: datapoint.absoluteValues.find((_s,i) => i === relativeIndex),
                    comments: datapoint.comments || [],
                    prefix: datapoint.prefix || this.FINAL_CONFIG.chart.labels.prefix,
                    suffix: datapoint.suffix || this.FINAL_CONFIG.chart.labels.suffix,
                }
            })
            this.$emit('selectTimeLabel', {
                datapoint,
                absoluteIndex: label.absoluteIndex,
                label: label.text
            })
        },
        getHighlightAreaPosition(area) {
            const x = this.drawingArea.left + (this.drawingArea.width / this.maxSeries) * (area.from - this.slicer.start);

            const width = (this.drawingArea.width / (this.slicer.end - this.slicer.start)) * area.span < 0 ? 0.00001 : (this.drawingArea.width / (this.slicer.end - this.slicer.start)) * area.span


            return {
                x: x < this.drawingArea.left ? this.drawingArea.left : x,
                width: width
            }
        },
        prepareConfig() {
            const DEFAULT_CONFIG = useConfig().vue_ui_xy;

                if(!Object.keys(this.config || {}).length) {
                    return DEFAULT_CONFIG
                }

                const mergedConfig = this.useNestedProp({
                    userConfig: this.config,
                    defaultConfig: DEFAULT_CONFIG
                });

                // ------------------------------ OVERRIDES -----------------------------------

                if (this.config && this.hasDeepProperty(this.config, 'chart.highlightArea')) {
                    if (!Array.isArray(this.config.chart.highlightArea)) {
                        mergedConfig.chart.highlightArea = [this.config.chart.highlightArea] // FIXME: should be sanitized using useNestedPropToo
                    } else {
                        mergedConfig.chart.highlightArea = this.config.chart.highlightArea;
                    }
                }
                
                if (this.config && this.hasDeepProperty(this.config, 'chart.grid.labels.yAxis.scaleMin')) {
                    mergedConfig.chart.grid.labels.yAxis.scaleMin = this.config.chart.grid.labels.yAxis.scaleMin;
                } else {
                    mergedConfig.chart.grid.labels.yAxis.scaleMin = null;
                }
                
                if (this.config && this.hasDeepProperty(this.config, 'chart.grid.labels.yAxis.scaleMax')) {
                    mergedConfig.chart.grid.labels.yAxis.scaleMax = this.config.chart.grid.labels.yAxis.scaleMax;
                } else {
                    mergedConfig.chart.grid.labels.yAxis.scaleMax = null;
                }

                if (this.config && this.hasDeepProperty(this.config, 'chart.zoom.startIndex')) {
                    mergedConfig.chart.zoom.startIndex = this.config.chart.zoom.startIndex;
                } else {
                    mergedConfig.chart.zoom.startIndex = null;
                }

                if (this.config && this.hasDeepProperty(this.config, 'chart.zoom.endIndex')) {
                    mergedConfig.chart.zoom.endIndex = this.config.chart.zoom.endIndex;
                } else {
                    mergedConfig.chart.zoom.endIndex = null;
                }

                if (this.config && this.hasDeepProperty(this.config,  'chart.grid.labels.yAxis.groupColor')) {
                    mergedConfig.chart.grid.labels.yAxis.groupColor = this.config.chart.grid.labels.yAxis.groupColor;
                } else {
                    mergedConfig.chart.grid.labels.yAxis.groupColor = null;
                }

                // ----------------------------------------------------------------------------

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
        prepareChart() {
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

            if(this.FINAL_CONFIG.showWarnings) {
                this.dataset.forEach((datapoint) => {
                    datapoint.series.forEach((s, j) => {
                        if(!this.isSafeValue(s)) {
                            console.warn(`VueUiXy has detected an unsafe value in your dataset:\n-----> The serie '${datapoint.name}' contains the value '${s}' at index ${j}.\n'${s}' was converted to null to allow the chart to display.`)
                        }
                    });
                });
            }

            this.showUserOptionsOnChartHover = this.FINAL_CONFIG.chart.userOptions.showOnChartHover;
            this.keepUserOptionState = this.FINAL_CONFIG.chart.userOptions.keepStateOnChartLeave;
            this.userOptionsVisible = !this.FINAL_CONFIG.chart.userOptions.showOnChartHover;

            this.mutableConfig = {
                dataLabels: {
                    show: true,
                },
                showTooltip: this.FINAL_CONFIG.chart.tooltip.show === true,
                showTable: this.FINAL_CONFIG.showTable === true,
                isStacked: this.FINAL_CONFIG.chart.grid.labels.yAxis.stacked,
                useIndividualScale: this.FINAL_CONFIG.chart.grid.labels.yAxis.useIndividualScale
            }

            if (this.FINAL_CONFIG.responsive) {
                const chart = this.$refs.chart;
                // Parent container (must have fixed height or max-height. Setting 100% will result in infinite height growth which looks aweful on top of being useless)
                const parent = chart.parentNode;

                if (this.resizeObserver) {
                    this.resizeObserver.unobserve(this.observedEl);
                    this.resizeObserver.disconnect();
                }

                const { height, width } = parent.getBoundingClientRect();

                // Title height to substract
                let title = null;
                let titleHeight = 0;
                if (this.FINAL_CONFIG.chart.title.show) {
                    title = this.$refs.chartTitle;
                    titleHeight = title.getBoundingClientRect().height;
                }

                // Slicer height to substract
                let slicer = null;
                let slicerHeight = 0;
                if (this.FINAL_CONFIG.chart.zoom.show && this.maxX > 6 && this.isDataset) {
                    slicer = this.$refs.chartSlicer.$el;
                    slicerHeight = slicer.getBoundingClientRect().height;
                }

                // Legend height to substract
                let legend = null;
                let legendHeight = 0
                if (this.FINAL_CONFIG.chart.legend.show) {
                    legend = this.$refs.chartLegend;
                    legendHeight = legend.getBoundingClientRect().height;
                }

                // Source height to substract
                let sourceHeight = 0;
                if (this.$refs.source) {
                    sourceHeight = this.$refs.source.getBoundingClientRect().height;
                }

                // NoTitle height to substract
                let noTitleHeight = 0;
                if (this.$refs.noTitle) {
                    noTitleHeight = this.$refs.noTitle.getBoundingClientRect().height;
                }

                this.height = height - titleHeight - legendHeight - slicerHeight - sourceHeight - noTitleHeight;
                this.width = width;
                this.viewBox = `0 0 ${this.width < 0 ? 10 : this.width} ${this.height < 0 ? 10 : this.height}`;
                this.convertSizes();

                const ro = new ResizeObserver((entries) => {
                    for(const entry of entries) {
                        if (this.$refs.chartTitle) {
                            titleHeight = this.$refs.chartTitle.getBoundingClientRect().height;
                        }
                        if (this.$refs.chartSlicer && this.$refs.chartSlicer.$el) {
                            slicerHeight = this.$refs.chartSlicer.$el.getBoundingClientRect().height;
                        }
                        if (this.$refs.chartLegend) {
                            legendHeight = this.$refs.chartLegend.getBoundingClientRect().height;
                        }
                        if (this.$refs.source) {
                            sourceHeight = this.$refs.source.getBoundingClientRect().height;
                        }
                        requestAnimationFrame(() => {
                            this.height = entry.contentBoxSize[0].blockSize - titleHeight - legendHeight - slicerHeight - sourceHeight - 24;
                            this.width = entry.contentBoxSize[0].inlineSize;
                            this.viewBox = `0 0 ${this.width < 0 ? 10 : this.width} ${this.height < 0 ? 10 : this.height}`;
                            this.convertSizes();
                        })
                    }
                })

                this.resizeObserver = ro;
                this.observedEl = parent;

                ro.observe(parent);

            } else {
                this.height = this.FINAL_CONFIG.chart.height;
                this.width = this.FINAL_CONFIG.chart.width;
                this.viewBox = `0 0 ${this.width} ${this.height}`;
                this.fontSizes.dataLabels = this.FINAL_CONFIG.chart.grid.labels.fontSize;
                this.fontSizes.yAxis = this.FINAL_CONFIG.chart.grid.labels.axis.fontSize;
                this.fontSizes.xAxis =  this.FINAL_CONFIG.chart.grid.labels.xAxisLabels.fontSize;
                this.fontSizes.plotLabels = this.FINAL_CONFIG.chart.labels.fontSize;
                this.plotRadii.plot = this.FINAL_CONFIG.plot.radius;
                this.plotRadii.line = this.FINAL_CONFIG.line.radius;
            }
        },
        selectMinimapIndex(minimapIndex) {
            this.selectedMinimapIndex = minimapIndex;
        },
        convertSizes() {
            if (!this.FINAL_CONFIG.responsiveProportionalSizing) return;
            // Adaptative sizes in responsive mode
            this.fontSizes.dataLabels = this.translateSize({
                relator: this.height,
                adjuster: 400,
                source: this.FINAL_CONFIG.chart.grid.labels.fontSize,
                threshold: 10,
                fallback: 10
            });
            this.fontSizes.yAxis = this.translateSize({
                relator: this.width,
                adjuster: 1000,
                source: this.FINAL_CONFIG.chart.grid.labels.axis.fontSize,
                threshold: 10,
                fallback: 10
            });
            this.fontSizes.xAxis = this.translateSize({
                relator: this.width,
                adjuster: 1000,
                source: this.FINAL_CONFIG.chart.grid.labels.xAxisLabels.fontSize,
                threshold: 10,
                fallback: 10
            });
            this.fontSizes.plotLabels = this.translateSize({
                relator: this.width,
                adjuster: 800,
                source: this.FINAL_CONFIG.chart.labels.fontSize,
                threshold: 10,
                fallback: 10
            });
            this.plotRadii.plot = this.translateSize({
                relator: this.width,
                adjuster: 800,
                source: this.FINAL_CONFIG.plot.radius,
                threshold: 1,
                fallback: 1
            });
            this.plotRadii.line = this.translateSize({
                relator: this.width,
                adjuster: 800,
                source: this.FINAL_CONFIG.line.radius,
                threshold: 1,
                fallback: 1
            })
        },
        toggleStack() {
            this.mutableConfig.isStacked = !this.mutableConfig.isStacked
            if (!this.mutableConfig.isStacked) {
                this.mutableConfig.useIndividualScale = this.FINAL_CONFIG.chart.grid.labels.yAxis.useIndividualScale;
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
                if (!this.FINAL_CONFIG.chart.grid.labels.yAxis.useIndividualScale) {
                    console.warn(`VueUiXy (datapoint: ${datapoint.name}) : autoScaling only works when config.chart.grid.labels.yAxis.useIndividualScale is set to true`)
                }
                if (!this.FINAL_CONFIG.chart.grid.labels.yAxis.stacked) {
                    console.warn(`VueUiXy (datapoint: ${datapoint.name}) : autoScaling only works when config.chart.grid.labels.yAxis.stacked is set to true`)
                }
            }
        },
        createArea(plots, zero) {
            if(!plots[0]) return [-10,-10, '', -10, -10];
            const start = { x: plots[0].x, y: zero };
            const end = { x: plots.at(-1).x, y: zero };
            const path = [];
            plots.forEach(plot => {
                path.push(`${plot.x},${plot.y} `);
            });
            return [ start.x, start.y, ...path, end.x, end.y].toString();
        },
        createStar,
        createPolygonPath,
        fillArray(len, source) {
            let res = Array(len).fill(0);
            for (let i = 0; i  < source.length && i < len; i += 1) {
                res[i] = source[i];
            }
            return res;
        },
        async setupSlicer() {
            if ((this.FINAL_CONFIG.chart.zoom.startIndex !== null || this.FINAL_CONFIG.chart.zoom.endIndex !== null) && this.$refs.chartSlicer) {
                if (this.FINAL_CONFIG.chart.zoom.startIndex !== null) {
                    await this.$nextTick();
                    await this.$nextTick();
                    this.$refs.chartSlicer.setStartValue(this.FINAL_CONFIG.chart.zoom.startIndex);
                }
                if (this.FINAL_CONFIG.chart.zoom.endIndex !== null) {
                    await this.$nextTick();
                    await this.$nextTick();
                    this.$refs.chartSlicer.setEndValue(this.validSlicerEnd(this.FINAL_CONFIG.chart.zoom.endIndex + 1));
                }
            } else {
                this.slicer = {
                    start: 0,
                    end: Math.max(...this.dataset.map(datapoint => this.largestTriangleThreeBucketsArray({data:datapoint.series, threshold: this.FINAL_CONFIG.downsample.threshold}).length))
                };
                this.slicerStep += 1;
            }
        },
        refreshSlicer() {
            this.setupSlicer();
        },
        validSlicerEnd(v) {
            const max = Math.max(...this.dataset.map(datapoint => this.largestTriangleThreeBucketsArray({data:datapoint.series, threshold: this.FINAL_CONFIG.downsample.threshold}).length));
            if (v > max) {
                return max;
            }
            if (v < 0 || (this.FINAL_CONFIG.chart.zoom.startIndex !== null && v < this.FINAL_CONFIG.chart.zoom.startIndex)) {
                if (this.FINAL_CONFIG.chart.zoom.startIndex !== null) {
                    return this.FINAL_CONFIG.chart.zoom.startIndex + 1
                } else {
                    return 1
                }
            }
            return v
        },
        calcRectHeight(plot) {
            const zeroForPositiveValuesOnly = ![null, undefined].includes(this.FINAL_CONFIG.chart.grid.labels.yAxis.scaleMin) && this.FINAL_CONFIG.chart.grid.labels.yAxis.scaleMin > 0 && this.min >= 0 ? this.drawingArea.bottom : this.zero;

            if(plot.value >= 0) {
                return this.checkNaN(zeroForPositiveValuesOnly - plot.y <= 0 ? 0.00001 : zeroForPositiveValuesOnly - plot.y);
            } else {
                return this.checkNaN(plot.y - this.zero <= 0 ? 0.00001 : plot.y - this.zero);
            }
        },
        calcIndividualHeight(plot) {
            if(plot.value >= 0) {
                return this.checkNaN(plot.zeroPosition - plot.y <= 0 ? 0.00001 : plot.zeroPosition - plot.y)
            } else {
                return this.checkNaN(plot.y - plot.zeroPosition <= 0 ? 0.00001 : plot.zeroPosition - plot.y)
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
            return [null, undefined, NaN, Infinity, -Infinity].includes(plot.zeroPosition) ? 0 : plot.zeroPosition;
        },  
        canShowValue(value) {
            return ![null, undefined, NaN, Infinity, -Infinity].includes(value);
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
            return value / (this.canShowValue(this.absoluteMax) ? this.absoluteMax : 1);
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
                    indexLabel: this.FINAL_CONFIG.chart.grid.labels.xAxisLabels.values[index]
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
        async generatePdf() {
            this.showSpinnerPdf();
            clearTimeout(this.__to__);
            this.isPrinting = true; // Set isPrinting to true before starting

            this.__to__ = setTimeout(async () => {
            try {
                const { default: pdf } = await import('../pdf.js');
                await pdf({
                    domElement: document.getElementById(`vue-ui-xy_${this.uniqueId}`),
                    fileName: this.FINAL_CONFIG.chart.title.text || 'vue-ui-xy',
                    options: this.FINAL_CONFIG.chart.userOptions.print
                });
                } catch (error) {
                    console.error('Error generating PDF:', error);
                } finally {
                    this.isPrinting = false;
                }
            }, 100);
        },
        generateCsv() {
            const title = [[this.FINAL_CONFIG.chart.title.text], [this.FINAL_CONFIG.chart.title.subtitle.text], [""]];
            const head = ["",...this.table.head.map(h => h.label)]
            const body = this.table.body
            const table = title.concat([head]).concat(body);
            const csvContent = this.createCsvContent(table);
            this.downloadCsv({ csvContent, title: this.FINAL_CONFIG.chart.title.text || 'vue-ui-xy'})
        },
        showSpinnerImage() {
            this.isImaging = true;
        },
        async generateImage() {
            this.showSpinnerImage();
            clearTimeout(this.__to__);
            this.isImaging = true;
            this.__to__ = setTimeout(async () => {
            try {
                    const { default: img } = await import('../img.js');
                    await img({
                        domElement: document.getElementById(`vue-ui-xy_${this.uniqueId}`),
                        fileName: this.FINAL_CONFIG.chart.title.text || 'vue-ui-xy',
                        format: 'png',
                        options: this.FINAL_CONFIG.chart.userOptions.print
                    });
                } catch (error) {
                    console.error('Error generating image:', error);
                } finally {
                    this.isImaging = false;
                }
            }, 100);
        },
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
</style>