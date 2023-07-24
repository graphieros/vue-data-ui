<template>
    <div class="smart-table-main" :style="`font-family: ${fontFamily}`">
        <div class="smart-table-export-hub">
            <button @click="isExportRequest = !isExportRequest" v-html="icons.export"/>
            <div class="smart-table-export-hub-dropdown" :data-is-open="isExportRequest || 'false'">
                <b class="smart-table-export-hub-title">
                    Export
                </b>
                <button class="close-dropdown" @click="isExportRequest = false">
                    ✖
                </button>
                <div class="smart-table-export-hub-options">
                    <div class="smart-table-export-hub-option-wrapper">
                        <div class="label">
                            {{ translations.exportAllLabel }} 
                            ({{ bodyCopy.length }})
                        </div>
                        <button id="exportAll" @click="createXls('all')">
                            <div v-html="icons.fileDownload"/>
                            <span>{{ translations.exportAllButton }}</span>
                        </button>
                    </div>
                    <div class="smart-table-export-hub-option-wrapper">
                        <div class="label">
                            {{ translations.exportPageLabel }}
                        </div>
                        <button id="exportPage" @click="createXls('page')">
                            <div v-html="icons.fileDownload"/>
                            <span>{{ translations.exportPageButton }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div 
            class="smart-table__wrapper" 
            :style="`max-height:${maxHeight}`" 
            ref="tableWrapper"
        >  
            <table class="smart-table">
                <!-- TABLE HEAD -->
                <thead id="tableHead">
                    <!-- HEADERS -->
                    <tr>
                        <th class="invisible-cell"></th>
                        <th 
                            v-for="(th,i) in tableHead" 
                            :key="`thead_${i}`" 
                            style="overflow: visible; position:relative"
                            :class="{'th-has-nan': hasNaN[i]}"
                        >
                            <div 
                                v-if="hasNumericTypes && ([constants.TEXT, constants.DATE].includes(th.type) || th.isPercentage)"
                                class="th-fusion"
                            >
                                <span>{{ th.name }} 
                                    <span v-if="th.isPercentage">
                                        / {{ th.percentageTo }}
                                    </span>
                                </span>
                            </div>
                            <span v-else>{{ th.name }}</span>
                        </th>
                    </tr>
                    <template v-if="hasNumericTypes">
                        <!-- SUM -->
                        <tr>
                            <th class="invisible-cell"></th>
                            <th
                                v-for="(th,i) in tableHead" 
                                :key="`thead_${i}`"
                                :class="{'th-numeric': true, 'th-has-nan': hasNaN[i]}"
                            >
                                <span 
                                    v-if="th.sum && !hasNaN[i]" 
                                    style="display: flex; align-items:center; justify-content:flex-end;"
                                >
                                    <span 
                                        v-html="icons.sum" 
                                        style="margin-bottom:-4px; margin-right: 3px"
                                    /> 
                                    {{ th.prefix }} 
                                    {{ Number(getSum(i).toFixed(th.decimals)).toLocaleString() }} 
                                    {{ th.suffix }} 
                                    <span 
                                        v-if="percentages[i] && th.percentageTo && !th.isPercentage" 
                                        style="margin-left:3px"
                                    >
                                        ({{ isNaN(getSum(i) / getSum(percentages[i].referenceIndex)) ? '-' : (getSum(i) / getSum(percentages[i].referenceIndex) * 100).toFixed(th.decimals) }}%)
                                    </span>
                                </span>
                            </th>
                        </tr>

                        <!-- AVERAGE -->
                        <tr>
                            <th class="invisible-cell"></th>
                            <th 
                                v-for="(th,i) in tableHead" 
                                :key="`thead_${i}`"
                                :class="{'th-numeric': true, 'th-has-nan': hasNaN[i]}"
                            >
                                <span v-if="th.average && !hasNaN[i]">
                                    ~ {{ th.prefix }} 
                                    {{ isNaN(getAverage(i)) ? '' : Number(getAverage(i).toFixed(th.decimals)).toLocaleString() }} 
                                    {{ th.suffix }}
                                </span>
                            </th>
                        </tr>

                        <!-- FILTERS & SORTS -->
                        <tr>
                            <th class="invisible-cell"></th>
                            <th 
                                v-for="(th,i) in tableHead" 
                                :key="`thead_${i}`"
                                :class="{'th-has-nan': hasNaN[i]}"
                            >
                                <div class="th-filter">
                                    <!-- DATE -->
                                    <template v-if="th.type === constants.DATE && dates[i]">
                                        <div class="th-date">
                                            <div class="date-wrapper--inputs">
                                                <div class="date-fieldset">
                                                    <label :for="`from_${i}`">
                                                        {{ translations.from }}
                                                    </label>
                                                    <input 
                                                        :id="`from_${i}`" 
                                                        type="date" 
                                                        v-model="dates[i].from" 
                                                        @input="filterBody(); setFilterDatesIndexes(i)"
                                                    >
                                                </div>
                                                <div class="date-fieldset">
                                                    <label :for="`to_${i}`">
                                                        {{ translations.to }}
                                                    </label>
                                                    <input 
                                                        :id="`to_${i}`" 
                                                        type="date" 
                                                        v-model="dates[i].to" 
                                                        @input="filterBody(); 
                                                        setFilterDatesIndexes(i)"
                                                    >
                                                </div>
                                            </div>
                                            <div class="date-wrapper--button">
                                                <button 
                                                    v-if="th.isSort" 
                                                    @click="sortTh(i, $event)" 
                                                    :class="{'th-button-active': [constants.DESC, constants.ASC].includes(sorts[i])}"
                                                >
                                                    <span 
                                                        v-if="sorts[i] === constants.ASC" 
                                                        v-html="[constants.DATE].includes(th.type) ? icons.sort09 : icons.sortAZ"
                                                    />
                                                    <span 
                                                        v-else-if="sorts[i] === constants.DESC" 
                                                        v-html="[constants.DATE].includes(th.type) ? icons.sort90 : icons.sortZA"
                                                    />
                                                    <span v-else v-html="icons.arrowSort"/>
                                                </button>
                                                <button 
                                                    @click="resetDates(i); resetFilter(i, th, $event)"
                                                    :disabled="!filteredDatesIndexes[i] && isResetDisabled(i, th)"
                                                    class="th-reset"
                                                >
                                                    ✖
                                                </button>
                                            </div>
                                        </div>
                                    </template>

                                    <!-- SEARCH -->
                                    <input
                                        v-if="th.isSearch"
                                        :placeholder="translations.inputPlaceholder"
                                        v-model="searches[i]"
                                        @input="debounce(filterBody, 400)"
                                        :name="`search_${i}`"
                                    >
                                    <!-- SORT -->
                                    <button 
                                        v-if="!hasNaN[i] && th.isSort && th.type !== constants.DATE"
                                        @click="sortTh(i, $event)"
                                        :class="{'th-button-active': [constants.DESC, constants.ASC].includes(sorts[i])}"
                                    >
                                        <span 
                                            v-if="sorts[i] === constants.ASC" 
                                            v-html="[constants.NUMERIC].includes(th.type) ? icons.sort09 : icons.sortZA"
                                        />
                                        <span 
                                            v-else-if="sorts[i] === constants.DESC" 
                                            v-html="[constants.NUMERIC].includes(th.type) ? icons.sort90 : icons.sortAZ"
                                        />
                                        <span v-else v-html="icons.arrowSort"/>
                                    </button>

                                    <!-- TOGGLE MULTISELECT -->
                                    <button 
                                        v-if="th.isMultiselect" 
                                        @click="toggleMultiselect(i, th, $event)" 
                                        v-html="icons.filter"
                                        :class="{'th-button-active': multiselects[i] && multiselects[i].length !== getDropdownOptions(i).length }"
                                    />

                                    <!-- SHOW CHART -->
                                    <button 
                                        v-if="currentSelectionSpan.col === i && canChart" 
                                        @click="showChart = !showChart"
                                        v-html="icons.chart"
                                        :class="{'th-button-active': showChart }"
                                    />

                                    <div v-if="th.rangeFilter && rangeFilters[i] && !hasNaN[i]" class="th-range-filter">
                                        <label :for="`rangeMin${i}`"><span style="color:grey">ᒥ</span> min <span style="color:grey">ᒣ</span></label>
                                        <input 
                                            type="number" 
                                            :id="`rangeMin${i}`" 
                                            :max="immutableRangeFilters[i].max" 
                                            :min="immutableRangeFilters[i].min" 
                                            v-model.number="rangeFilters[i].min"
                                            @input="debounce(filterBody, 400)" 
                                        >
                                        <input 
                                            type="number" 
                                            :id="`rangeMax${i}`" 
                                            :max="immutableRangeFilters[i].max" 
                                            :min="immutableRangeFilters[i].min" 
                                            v-model.number="rangeFilters[i].max"
                                            @input="debounce(filterBody, 400)" 
                                        >
                                        <label :for="`rangeMax${i}`"><span style="color:grey">ᒪ</span> max <span style="color:grey">ᒧ</span></label>
                                    </div>

                                    <!-- RESET -->
                                    <button 
                                        v-if="canResetColumn(i, th)"
                                        @click="resetFilter(i, th, $event)"
                                        :disabled="isResetDisabled(i, th)"
                                        class="th-reset"
                                    >
                                        ✖
                                    </button>

                                    <!-- MULTISELECT DROPDOWN -->
                                    <div 
                                        class="th-dropdown" 
                                        v-if="th.isMultiselect"
                                        data-is-open="false"
                                        :id="`th_dropdown_${i}`"
                                    >
                                        <button class="close-dropdown" @click="toggleMultiselect(i, th, $event)">
                                            ✖
                                        </button>
                                        <span 
                                            class="th-option" 
                                            v-for="(option, j) in getDropdownOptions(i)"
                                            :key="`th_option_${i}_${j}`"
                                            @click="selectDropdownOption(option, i)"
                                            @keyup.enter="selectDropdownOption(option, i)"
                                            @keyup.space="selectDropdownOption(option, i)"
                                            :style="`opacity:${isDropdownOptionSelected(option, i) ? 1 : 0.5}`"
                                            tabindex="0"
                                        >
                                            <span v-if="isDropdownOptionSelected(option, i)" style="color: green" class="th-icon-green">
                                                ✔
                                            </span>
                                            <span v-else style="color: red" class="th-icon-red">
                                                ✖
                                            </span>
                                            <span>
                                                {{ option }}
                                            </span>
                                        </span>
                                    </div>
                                </div>
                            </th>
                        </tr>
                    </template>

                    <!-- COLUMN SELECTOR -->
                    <tr>
                        <th class="invisible-cell"></th>
                        <th 
                            v-for="(colSelector, i) in tableHead" 
                            :key="`col_selector_${i}`"
                            :class="{'smart-table-col-selector': !hasNaN[i], 'col-selector--selected': i === selectedColumn && !hasNaN[i], 'th-has-nan': hasNaN[i] }"
                        >
                            <div
                                v-if="!hasNaN[i]"
                                v-html="tableHead[i].type === constants.NUMERIC ? icons.chevronDown : ''"
                                :class="{'col-selector' : tableHead[i].type === constants.NUMERIC }"
                                tabindex="0"
                                @click.stop="selectColumn(i)"
                                @keyup.enter="selectColumn(i)"
                            />
                        </th>
                    </tr>
                </thead>

                <!-- TABLE BODY -->
                <tbody @click="closeAllDropdowns" @keydown="navigateCell($event)">
                    <tr v-for="(tr, i) in visibleRows" :key="`tbody_${i}`">
                        <td class="smart-table-td-iteration">{{ tr.absoluteIndex + 1 }}</td>
                        <td 
                            v-for="(td, j) in tr.td" 
                            :key="`td_${i}_${j}`"
                            :style="isNumeric(td) || header[j].type === constants.DATE ? `text-align:right;font-variant-numeric: tabular-nums;` : ''"
                            @click="selectTd({
                                td,
                                rowIndex: i,
                                colIndex: j,
                                headerType: header[j].type,
                                event: $event
                            })"
                            @keyup.enter="selectTd({
                                td,
                                rowIndex: i,
                                colIndex: j,
                                headerType: header[j].type,
                                event: $event
                            })"
                            @keyup.space="selectTd({
                                td,
                                rowIndex: i,
                                colIndex: j,
                                headerType: header[j].type,
                                event: $event
                            })"
                            :class="{'td-numeric': header[j].type === constants.NUMERIC, 'td-focusable': true, 'td-has-nan': hasNaN[j]}"
                            :id="`cell_${i}_${j}`"
                            tabindex="0"
                        >
                            <!-- ICON -->
                            <span 
                                v-if="tr.meta && tr.meta.markerIndices.includes(j) && tr.meta.unicodeIcon" 
                                :style="`color:${tr.meta.color};margin-right:3px`"
                                v-html="tr.meta.unicodeIcon"
                            />

                            <!-- DATE -->
                            <span v-if="header[j].type === constants.DATE">
                                {{ header[j].prefix }} 
                                {{ new Date(td).toLocaleString().slice(0,10) }} 
                                {{ header[j].suffix }}
                            </span>

                            <!-- PERCENTAGE -->
                            <span v-else-if="header[j].isPercentage">
                                {{ Number((td * 100).toFixed(header[j].decimals)).toLocaleString() }}% 
                            </span>

                            <!-- NUMERIC VALUE WITH PERCENTAGE TO SUM OF ANOTHER COL -->
                            <span 
                                v-else-if="(percentages[j] && header[j].percentageTo && !header[j].isPercentage)" 
                                :class="{'td-nan': isNaN(Number(td))}"
                            >
                               {{ header[j].prefix }} 
                               {{ isNaN(Number(td)) ? `${td} is not ${constants.NUMERIC}` : Number(td.toFixed(header[j].decimals)).toLocaleString() }} 
                               {{ header[j].suffix }} 
                               ({{ isNaN(Number(td)) ? '' : Number((td / getSum(percentages[j].referenceIndex) * 100).toFixed(header[j].decimals)).toLocaleString() }}%)
                            </span>

                            <!-- NUMERIC -->
                            <span v-else-if="header[j].type === constants.NUMERIC" :class="{'td-nan': isNaN(Number(td))}">
                               {{ header[j].prefix }} 
                               {{ isNaN(Number(td)) ? `${td} is not ${constants.NUMERIC}` : Number(td.toFixed(header[j].decimals)).toLocaleString() }} 
                               {{ header[j].suffix }}
                            </span>

                            <!-- ALL OTHER -->
                            <span v-else>
                                {{ header[j].prefix }} 
                                {{ td }} 
                                {{ header[j].suffix }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- INFO BAR (active if numeric cells are selected) -->
         <div 
            :class="{'td-selector-info': true, 'td-selector-info--active': currentSelectionSpan.col !== undefined && currentSelectionSpan.rows.length}"
        >
            <template v-if="currentSelectionSpan.col !== undefined && currentSelectionSpan.rows.length">
                <div v-html="icons.table" class="td-selector-icon"/>
                <span>
                    <!-- NAME OF SELECTED COLUMN -->
                    <b>
                        {{ header[currentSelectionSpan.col].name }} 
                        <span v-if="header[currentSelectionSpan.col].isPercentage">
                            / {{ header[percentages[currentSelectionSpan.col].referenceIndex].name }}
                        </span>
                    </b>

                    <!-- NB OF SELECTED CELLS -->
                    <span style="margin-left:12px">
                        {{ translations.nb }} : <b class="format-num">{{ currentSelectionSpan.rows.length }}</b>
                    </span>

                    <!-- SUM OF SELECTED CELLS -->
                    <span style="margin-left: 12px">
                        {{ translations.sum }} : 
                        <b class="format-num" v-if="header[currentSelectionSpan.col].isPercentage">
                            {{selectedCellsCalculations.sumPercentage }}
                        </b>
                        <b v-else class="format-num">
                            {{ header[currentSelectionSpan.col].prefix }}
                            {{ selectedCellsCalculations.sumRegular }} 
                            {{ header[currentSelectionSpan.col].suffix }}
                        </b>
                        <b v-if="header[currentSelectionSpan.col].isPercentage">%</b>
                    </span>

                    <!-- AVERAGE OF SELECTED CELLS -->
                    <span style="margin-left: 12px">
                        {{ translations.average }} : 
                        <b v-if="header[currentSelectionSpan.col].isPercentage" class="format-num">
                            {{ selectedCellsCalculations.averagePercentage }}
                        </b>
                        <b v-else class="format-num">
                            {{ header[currentSelectionSpan.col].prefix }} 
                            {{ selectedCellsCalculations.averageRegular }} 
                            {{ header[currentSelectionSpan.col].suffix }}
                        </b>
                        <b v-if="header[currentSelectionSpan.col].isPercentage">%</b>
                    </span>
                </span>
                <button 
                    @click="resetSelection"
                    class="td-selector-info-reset"
                >
                    ✖
                </button>
            </template>
        </div>

        <!-- PAGINATOR -->
        <div class="smart-table-paginator format-num" v-if="bodyCopy.length > 10">
            {{ translations.totalRows }} : {{ body.length }} |  
            {{ translations.paginatorLabel }} :
            <select 
                id="paginatorSelector" 
                v-model.number="itemsPerPage" 
                v-if="bodyCopy.length > 10" 
                @change="resetSelection"
            >
                <template v-for="(option, i) in paginatorOptions">
                    <option 
                        :key="`paginator_option_${i}`" 
                        v-if="bodyCopy.length > option || body.length === option"
                    >
                        {{ option }}
                    </option>
                </template>
            </select>
        </div>
        <div class="smart-table-size-warning" v-if="itemsPerPage >= 250">
            <span v-html="icons.warning"/>{{ translations.sizeWarning }}
        </div>

        <!-- PAGINATION -->
        <div 
            class="smart-table-navigation-indicator" 
            v-if="pages.length > 1 && pages.length <= 10" 
            :style="`width:calc(${(currentPage / (pages.length - 1)) * 100}%)`"
        />
        <div class="smart-table-pagination format-num" v-if="pages.length > 1">
            <!-- PREVIOUS PAGE -->
            <button 
                class="smart-table-navigation" 
                @click.stop="navigate('previous')" 
                v-html="icons.chevronLeft"
                :disabled="currentPage === 0"
            />
            <template v-if="pages.length > 3">
                <!-- FIRST PAGE -->
                <button 
                    class="smart-table-navigation" 
                    @click.stop="navigate(1)" 
                    :disabled="currentPage === 0"
                >
                    1
                </button>
                <!-- PAGE SCROLLER -->
                <div v-if="pages.length > 10" class="smart-table-page-scroller-wrapper">
                    <label for="pageScroller" style="font-size: 14px">
                        {{ translations.page }} 
                        {{ currentPage + 1 }} / {{ pages.length }}
                    </label>
                    <input
                        class="smart-table-page-scroller"
                        id="pageScroller"
                        type="range" 
                        step="1" 
                        :min="0" 
                        :max="pages.length-1" 
                        @input="updateCurrentPage($event)" 
                        :value="currentPage"
                    >
                </div>
                <span v-else>
                    {{ translations.page }} 
                    {{ currentPage + 1 }} / {{ pages.length }}
                </span>
                <!-- LAST PAGE -->
                <button 
                    class="smart-table-navigation" 
                    @click.stop="navigate(pages.length)" 
                    :disabled="currentPage === pages.length - 1"
                >
                    {{ pages.length }}
                </button>
            </template>
            <template v-else>
                {{ translations.page }} 
                {{ currentPage + 1 }} / {{ pages.length }}
            </template>
            <!-- NEXT PAGE -->
            <button 
                class="smart-table-navigation" 
                @click.stop="navigate('next')" 
                v-html="icons.chevronRight"
                :disabled="currentPage === pages.length -1"
            />
        </div>

        <!-- CHART MODAL -->
        <div class="smart-table-chart-modal" 
            v-if="showChart && canChart" 
            :style="`top:${clientY}px; left:${clientX}px`"
        >
            <button class="close-chart-modal" @click="showChart = false">
                ✖
            </button>
            <div class="chart-modal-options">
                <button 
                    v-if="availableDonutCategories.length" 
                    @click="showDonutOptions = true" 
                    v-html="icons.donut" 
                    :class="{'is-active-chart' : chart.type === constants.DONUT || showDonutOptions}"
                />
                <button 
                    @click="chart.type = constants.LINE; showDonutOptions = false" 
                    v-html="icons.chart" 
                    :class="{'is-active-chart' : chart.type === constants.LINE && !showDonutOptions}"
                />
                <button 
                    @click="chart.type = constants.BAR; showDonutOptions = false" 
                    v-html="icons.bar" 
                    :class="{'is-active-chart' : chart.type === constants.BAR && !showDonutOptions}"
                />
            </div>

            <!-- CHART TITLE -->
            <div style="margin-bottom:12px">
                <b>{{ header[currentSelectionSpan.col].name }} 
                    <span v-if="header[currentSelectionSpan.col].isPercentage && header[currentSelectionSpan.col].percentageTo">
                        / {{ header[percentages[currentSelectionSpan.col].referenceIndex].name }}
                    </span>
                    <span v-if="chart.type === constants.DONUT && selectedDonutCategory && selectedDonutCategory.name">
                        {{ translations.by }}
                        {{ selectedDonutCategory.name }}
                    </span>
                </b>
            </div>

            <div 
                style="width:100%; height: fit-content; cursor:move"
                ref="chartModal"
            >
                <!-- DONUT OPTIONS -->
                <div v-if="showDonutOptions && availableDonutCategories.length">
                    <fieldset class="smart-table-fieldset">
                        <legend>
                            {{ translations.chooseCategoryColumn }}
                        </legend>
                        <div class="smart-table-fieldset-wrapper">
                            <template v-for="(option, i) in availableDonutCategories" :key="`donut_radio_${i}`">
                                <div class="smart-table-fieldset-option" >
                                    <input
                                        type="radio"
                                        :name="option.name"
                                        :id="option.name"
                                        :checked="selectedDonutCategory && option.name === selectedDonutCategory.name"
                                        @input="selectedDonutCategory = availableDonutCategories[i]"
                                    />
                                    <label 
                                        :for="option.name"
                                    >
                                        {{ option.name }}
                                    </label>
                                </div>
                            </template>
                        </div>
                        <button class="smart-table-generate-donut" :disabled="!selectedDonutCategory" @click="applyDonutOption">
                            <div style="margin-bottom: -3px" v-html="icons.donut"/>
                            {{ translations.makeDonut }}
                        </button>
                    </fieldset>
                </div>

                <!-- BAR | LINE CHARTS -->
                <template v-if="[constants.BAR, constants.LINE].includes(chart.type) && !showDonutOptions">
                    <svg :viewBox="`0 0 ${chart.width} ${chart.height}`" class="smart-table-chart-svg">
                        <defs>
                            <marker id="arrowhead" markerWidth="7" markerHeight="7" 
                            refX="0" refY="3.5" orient="auto">
                                <polygon 
                                    points="0 0, 7 3.5, 0 7" 
                                    fill="grey"
                                />
                            </marker>
                        </defs>
                        
                        <!-- X & Y AXIS -->
                        <g>
                            <line 
                                :x1="0" 
                                :x2="chart.width" 
                                :y1="chartData.zero" 
                                :y2="chartData.zero" 
                                stroke="#ccd1d4" 
                                stroke-width="2" 
                                stroke-linecap="round"
                            />
                            <line 
                                :x1="0" 
                                :x2="0" 
                                :y1="0" 
                                :y2="chart.height" 
                                stroke="#ccd1d4" 
                                stroke-width="2" 
                                stroke-linecap="round"
                            />
                        </g>
                        
                        <!-- LINE SELECTOR INDICATOR -->
                        <template v-if="chart.type === constants.LINE">
                            <g v-for="(plot,i) in chartData.plots" :key="`trap_fill_${i}`">
                                <rect 
                                    :x="i * chartData.slot" 
                                    :y="0" :width="chartData.slot" 
                                    :height="chart.height" 
                                    :fill="selectedPlot === i ? 'rgba(0,0,0,0.03)' : 'transparent'" 
                                />
                            </g>
                        </template>

                        <g v-for="(plot, i) in chartData.plots" :key="`plot_${i}`">

                            <!-- BAR VARIANT -->
                            <template v-if="chart.type === constants.BAR">
                                <linearGradient id="barGradientSelected" x2="0%" y2="100%">  
                                    <stop offset="0.2" stop-color="#6376DD"/>
                                    <stop offset="1" stop-color="#6376DD80"/>  
                                </linearGradient>
                                <linearGradient id="barGradientSelectedNeg" x2="0%" y2="100%">  
                                    <stop offset="0.2" stop-color="#6376DD80"/>
                                    <stop offset="1" stop-color="#6376DD"/>  
                                </linearGradient>
                                <linearGradient id="barGradient" x2="0%" y2="100%">  
                                    <stop offset="0.2" stop-color="#6376DDB3"/>
                                    <stop offset="1" stop-color="#6376DD66"/>  
                                </linearGradient>
                                <linearGradient id="barGradientNeg" x2="0%" y2="100%">  
                                    <stop offset="0.2" stop-color="#6376DD66"/>
                                    <stop offset="1" stop-color="#6376DDB3"/>  
                                </linearGradient>
                                <rect 
                                    :x="plot.x - chartData.slot / 2" 
                                    :y="calcRectY(plot.value, plot.y)" 
                                    :height="plot.value >= 0 ? chartData.zero - plot.y : plot.y - chartData.zero" 
                                    :width="chartData.slot" 
                                    :fill="selectedPlot === i ? plot.value >= 0 ? 'url(#barGradientSelected)' : 'url(#barGradientSelectedNeg)' : plot.value >=0 ? 'url(#barGradient)' : 'url(#barGradient)'"  
                                    stroke="white" 
                                    stroke-width="1"
                                />
                                <foreignObject 
                                    v-if="selectedPlot === i" 
                                    :x="plot.x - (chartData.slot < 100 ? 50 : chartData.slot / 2)" 
                                    :y="plot.value >= 0 ? plot.y - 32 : plot.y + 4" 
                                    height="20" 
                                    :width="chartData.slot < 100 ? 100 : chartData.slot" 
                                    style="overflow:visible"
                                >
                                    <div style="width:100%;text-align:center;font-size:20px">
                                        {{ plot.prefix }} 
                                        {{ Number(plot.value.toFixed(header[currentSelectionSpan.col].decimals)).toLocaleString() }}
                                        {{ plot.suffix }}
                                    </div>
                                </foreignObject>
                            </template>

                            <!-- LINE VARIANT -->
                            <template v-if="chart.type === constants.LINE">
                                <line 
                                    v-if="i+1 < chartData.plots.length" 
                                    :x1="plot.x" 
                                    :y1="plot.y" 
                                    :x2="chartData.plots[i+1].x" 
                                    :y2="chartData.plots[i+1].y" 
                                    stroke-width="3" 
                                    stroke="#6376DD75"
                                />
                                <line 
                                    v-if="selectedPlot === i" 
                                    :x1="plot.x" 
                                    :y1="plot.y" 
                                    :x2="plot.x" 
                                    :y2="chart.height" 
                                    stroke="grey" 
                                    stroke-width="1" 
                                    stroke-dasharray="3"
                                />
                                <circle 
                                    :cx="plot.x" 
                                    :cy="plot.y" 
                                    :r="selectedPlot === i ? 6 : 4" 
                                    fill="#22348f" 
                                    stroke="white" 
                                    stroke-width="1"
                                />
                                <foreignObject 
                                    v-if="selectedPlot === i" 
                                    :x="plot.x - (chartData.slot < 100 ? 50 : chartData.slot / 2)" 
                                    :y="placeLabelOnTopOrBottom({
                                        previousPlot: chartData.plots[i-1], 
                                        currentPlot: plot, 
                                        nextPlot: chartData.plots[i+1]
                                    })" 
                                    height="20" 
                                    :width="chartData.slot < 100 ? 100 : chartData.slot" 
                                    style="overflow:visible"
                                >
                                    <div style="width:100%;text-align:center;font-size:20px">
                                        {{ plot.prefix }} 
                                        {{ Number(plot.value.toFixed(header[currentSelectionSpan.col].decimals)).toLocaleString() }} 
                                        {{ plot.suffix }}
                                    </div>
                                </foreignObject>
                            </template>
                        </g>

                        <!-- MOUSE TRAPS -->
                        <g v-for="(plot,i) in chartData.plots" :key="`trap_${i}`">
                            <rect 
                                :x="i * chartData.slot" 
                                :y="0" :width="chartData.slot" 
                                :height="chart.height" 
                                fill="transparent" 
                                @mouseenter="selectedPlot = i" 
                                @mouseleave="selectedPlot = undefined"
                            />
                        </g>

                        <!-- PROGRESSION LINE -->
                        <line 
                            v-if="chartData.progression && chartData.plots.length > 2" 
                            :x1="chartData.progression.x1" 
                            :y1="chartData.progression.y1" 
                            :x2="chartData.progression.x2" 
                            :y2="chartData.progression.y2" 
                            stroke="grey" 
                            stroke-width="2" 
                            stroke-dasharray="4"
                            marker-end="url(#arrowhead)"
                        />
                    </svg>
                    <div v-if="chartData.plots.length >=2" class="chart-trend">
                        <span>---</span> Trend: <span>{{ chartData.progression.slope < 0 ? '+' : '-' }}</span> {{ ((Math.abs(chartData.progression.slope)) * 100).toFixed(1) }} %
                    </div>
                </template>

                <!-- DONUT CHART -->
                <template v-if="[constants.DONUT].includes(chart.type) && !showDonutOptions">
                    <svg viewBox="0 0 100 100" style="overflow: visible; padding: 0 24px" class="smart-table-donut-chart">
                        <path 
                            v-for="(arc, i) in currentDonut" 
                            :key="`arc_${i}`" 
                            :d="arc.path" 
                            :stroke="`${arc.color}CC`" 
                            :stroke-width="20" 
                            fill="none"
                        />

                        <foreignObject
                            v-for="(arc, i) in currentDonut"
                            :key="`text_marker_${i}`"
                            :x="calcDonutMarkerLabelPositionX(arc) - 15"
                            :y="arc.center.endY -15"
                            height="30"
                            width="30"
                            style="overflow:visible; display:flex;align-items:center;justify-content:center"
                        >
                            <div v-if="isArcBigEnough(arc)" class="smart-table-donut-label">
                                <b>{{ displayArcPercentage(arc, currentDonut) }}</b>
                                <span class="smart-table-donut-label-name">{{ arc.name }}</span>
                            </div>
                        </foreignObject>

                        <text :x="50" :y="42" text-anchor="middle" font-size="6">
                            {{ translations.total }}
                        </text>
                        <text :x="50" :y="48" text-anchor="middle" font-size="4">
                            {{ header[currentSelectionSpan.col].prefix }}
                            {{ donutHollowLabels.total }}
                            {{ header[currentSelectionSpan.col].isPercentage ? '%' : '' }}
                            {{ header[currentSelectionSpan.col].suffix }}
                        </text>
                        <text :x="50" :y="56" text-anchor="middle" font-size="6">
                            {{ translations.average }}
                        </text>
                        <text :x="50" :y="62" text-anchor="middle" font-size="4">
                            {{ header[currentSelectionSpan.col].prefix }}
                            {{ donutHollowLabels.average }}
                            {{ header[currentSelectionSpan.col].isPercentage ? '%' : '' }}
                            {{ header[currentSelectionSpan.col].suffix }}
                        </text>
                    </svg>

                    <!-- DONUT LEGEND  -->
                    <div class="smart-table-donut-legend">
                        <div 
                            v-for="(legendItem, i) in currentDonut.filter(c => c.value > 0)" 
                            class="smart-table-donut-legend-item" 
                            :key="`donut_legend_${i}`"
                        >
                            <span :style="`color:${legendItem.color}`">●</span>
                            <span>{{ legendItem.name }} : </span>
                            <b>
                                {{ header[currentSelectionSpan.col].prefix }}
                                {{ getDonutLegendValue(legendItem.absoluteValue) }}
                                {{ header[currentSelectionSpan.col].isPercentage ? '%' : '' }}
                                {{ header[currentSelectionSpan.col].suffix }}
                            </b>
                            <span>({{ (legendItem.proportion * 100).toFixed(1) }}%)</span>
                        </div>
                    </div>
                </template>
            </div>
        </div>
    </div>
    
</template>

<script>
// TODO: check null values and corrupted props
import * as XLSX from 'xlsx';

export default {
    name: "vue-ui-table",
    props: {
        locale: {
            type: String,
            default: "fr-fr"
        },
        header: {
            /** Defines the shape of table columns
             *  Datastructure is an array of objects with one object for each column:
             * 
             *  [
             *      {
             *          name: string; (displayed name)
             *          type: string; "text" | "numeric" | "date"
             *          average: boolean;
             *          decimals: number | undefined;
             *          sum: boolean; (if true, will display the sum in the table head)
             *          isSort: boolean; (if true, will show a sort button in the table head)
             *          isSearch: boolean; (if true, will show a search input in the table head)
             *          isMultiselect: boolean; (if true, will build a dropdown based on categories provided in the body at this column index)
             *          isPercentage: boolean; (if true, will push to the row a percentage based on the targeted column)
             *          percentageTo: string; (must be the exact name of another column). If isPercentage = false; will show quantites with percentage / target column in the same cell
             *          suffix: string; (append any string to all values related to this column, like €, $ etc)
             *          prefix: string; (prepend any string to all values related to this column, like €, $ etc)
             *          rangeFilter: boolean; (show min max inputs to filter numeric columns)
             *      },
             *      {...}
             *  ]
             * 
             * 
             */
            type: Array,
            default() {
                return []
            }
        },
        body: {
            /** Defines the rows of the table
             *  Datastructure is an array of objects, containing an optional meta attribute to manage icon insertions:
             * 
             *  [
             *      {
             *          meta: {
             *              color: string;
             *              markerIndices: number[]; (lists all column indices where an icon will be prepended)
             *              unicodeIcon: string; (for example: '★')
             *          },
             *          td: array; (Must contain all data corresponding to each column designed in the header. IMPORTANT: if a column has isPercentage: true; set this index to an empty string, as data will be calculated and pushed to this index on mounted)
             *      }
             *  ]
             */
            type: Array,
            default() {
                return []
            }
        },
        fontFamily: {
            type: String,
            default: "inherit"
        },
        maxHeight: {
            type: String,
            default: "500px"
        },
        rowsPerPage: {
            type: Number,
            default: 25,
        },
        translations: {
            type: Object,
            default() {
                return {
                    average: "Moyenne",
                    by: "by",
                    chooseCategoryColumn: "Choose category column",
                    exportAllButton: "XLSX all",
                    exportAllLabel: "Export all rows of your current filtered dataset",
                    exportPageButton: "XLSX page",
                    exportPageLabel: "Export rows of the current page",
                    from: "Du",
                    inputPlaceholder: "Search...",
                    makeDonut: "Generate",
                    nb: "Nb",
                    page: "Page",
                    paginatorLabel: "Rows per page",
                    sizeWarning: "Displaying too many rows at a time can lead to slower performance",
                    sum: "Somme",
                    to: "Au",
                    total: 'Total',
                    totalRows: "Total rows",
                }
            }
        },
        useChart: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            bodyCopy: JSON.parse(JSON.stringify(this.body)).map((el, i) => {
                return {
                    ...el,
                    absoluteIndex: i,
                }
            }),
            buttonTimeout: null,
            canMoveChart: false,
            chart: {
                height: 316,
                type: 'bar',
                width: 512
            },
            constants: {
                ASC: 1,
                BAR: 'bar',
                DATE: 'date',
                DESC: -1,
                DONUT: 'donut',
                LINE: 'line',
                NUMERIC: 'numeric',
                PERCENTAGE: 'percentage',
                TEXT: 'text',
            },
            clientX:100,
            clientY:100,
            cssClass: {
                CELL: "smart-td-selected",
                FIRST_TD: "smart-td-selected-first",
                LAST_TD: "smart-td-selected-last",
                ROW: "smart-td-selected-neighbor",
            },
            currentDonut: undefined,
            currentFilter: undefined,
            currentSearch: undefined,
            currentSelectionSpan: {
                col: undefined,
                rows: []
            },
            currentPage: 0,
            dates: {},
            filteredDatesIndexes: {},
            hasNaN: {},
            iconColor: "#2D353C",
            iconSize: 20,
            immutableRangeFilters: {},
            isExportRequest: false,
            isLoading: false,
            itemsPerPage: this.rowsPerPage,
            multiselects: {},
            paginatorOptions: [...new Set([10, 25, 50, 100, 250, 500, this.rowsPerPage, this.body.length])].sort((a,b) => a - b),
            palette: [
                '#3366cc',
                '#dc3912',
                '#ff9900',
                '#109618',
                '#990099',
                '#0099c6',
                '#dd4477',
                '#66aa00',
                '#b82e2e',
                '#316395',
                '#994499',
                '#22aa99',
                '#aaaa11',
                '#6633cc',
                '#e67300',
                '#8b0707',
                '#651067',
                '#329262',
                '#5574a6',
                '#3b3eac',
                '#b77322',
                '#16d620',
                '#b91383',
                '#f4359e',
                '#9c5935',
                '#a9c413',
                '#2a778d',
                '#668d1c',
                '#bea413',
                '#0c5922',
                '#743411',
            ],
            percentages: {},
            rafId: null,
            rangeFilters: {},
            searches: {},
            selectedColumn: undefined,
            selectedDonutCategory: undefined,
            selectedPlot: undefined,
            showChart: false,
            showDonutOptions: false,
            sorts: {},
            tableBody: JSON.parse(JSON.stringify(this.body)).map((el, i) => {
                return {
                    ...el,
                    absoluteIndex: i
                }
            }),
            tableHead: JSON.parse(JSON.stringify(this.header)).map(head => {
                return {
                    average: Object.hasOwn(head, 'average') ? head.average : false,
                    decimals: Object.hasOwn(head, 'decimals') ? head.decimals : 0,
                    isMultiselect: Object.hasOwn(head, 'isMultiselect') ? head.isMultiselect : false,
                    isPercentage: Object.hasOwn(head, 'isPercentage') ? head.isPercentage : false,
                    isSearch: Object.hasOwn(head, 'isSearch') ? head.isSearch : false,
                    isSort: Object.hasOwn(head, 'isSort') ? head.isSort : false,
                    name: head.name, // this attribute is mandatory
                    percentageTo: Object.hasOwn(head, 'percentageTo') ? head.percentageTo  : undefined,
                    prefix: Object.hasOwn(head, 'prefix') ? head.prefix : '',
                    rangeFilter: Object.hasOwn(head, 'rangeFilter') ? head.rangeFilter : false,
                    suffix: Object.hasOwn(head, 'suffix') ? head.suffix : '',
                    sum: Object.hasOwn(head, 'sum') ? head.sum : false,
                    type: head.type, // this attribute is mandatory
                }
            }),
        }
    },
    mounted(){
        if(this.header.length === 0) {
            throw new Error("SmartTable error: missing header data.\nProvide an array of objects of type:\n{\n name: string;\n type: string; ('text' | 'numeric' | 'date')\n average: boolean;\n decimals: number | undefined;\n sum: boolean;\n isSort:boolean;\n isSearch: boolean;\n isMultiselect: boolean;\n isPercentage: boolean;\n percentageTo: string; (or '')\n}");
        }
        if(this.body.length === 0) {
            throw new Error("SmartTable error: missing body data");
        }
        this.isLoading = true;

        this.promiseWithAsyncFunction(this.prepareBodyCopy, () => {
            this.$forceUpdate();
            this.isLoading = false;
        });
        document.addEventListener("keydown", (e) => {
            const focusedElement = document.activeElement;
            const isTableCellFocused = focusedElement && Array.from(focusedElement.classList).includes('td-focusable');

            if (isTableCellFocused && e.key.includes("Arrow") || e.code === 'Space') {
                e.preventDefault();
            }
        })
    },
    watch: {
        showChart: function(hasChart) {
            if(hasChart) {
                this.$nextTick(() => {
                    this.closeDragElement();
                    const chart = this.$refs.chartModal;
                    chart.onmousedown = this.dragMouseDown;
                })
            }
        }
    },
    computed: {
        availableDonutCategories() {
            return Object.keys(this.multiselects).map(index => {
                return {
                    index,
                    name: this.header[index].name,
                    options: this.multiselects[index],
                }
            })
        },
        canChart() {
            return this.useChart && this.currentSelectionSpan.rows.length > 1;
        },
        chartData() {
            if(!this.canChart) return [];

            const height  = 316;
            const width = 512;
            const items = this.currentSelectionSpan.rows.length;
            const slot = width / items;
            const max = Math.max(...this.currentSelectionSpan.rows.map(row => row.value));
            const min = Math.min(...this.currentSelectionSpan.rows.map(row => row.value));

            const relativeZero = min >= 0 ? 0 : Math.abs(min);
            const absoluteMax = max + relativeZero;

            const isPercentage = this.header[this.currentSelectionSpan.col].isPercentage;
            const plots = this.currentSelectionSpan.rows.map((row, i) => {
                return {
                    x: (slot * i) + slot / 2,
                    y: (1 - ((row.value + relativeZero) / absoluteMax)) * height,
                    value: isPercentage ? row.value * 100 : row.value,
                    suffix: isPercentage ? '%' : this.header[this.currentSelectionSpan.col].suffix ? this.header[this.currentSelectionSpan.col].suffix : '',
                    prefix: this.header[this.currentSelectionSpan.col].prefix ? this.header[this.currentSelectionSpan.col].prefix : '',
                    index: row.index,
                    absoluteValue: isPercentage ? Math.abs(row.value) * 100 : Math.abs(row.value)
                }
            });
            
            const zero = height - (height * (relativeZero / absoluteMax));

            return {zero, plots, slot, progression: plots.length >= 2 ? this.calcChartProgression(plots) : false };
        },
        donutHollowLabels() {
            return {
                total: Number((this.currentDonut.map(el => el.absoluteValue).reduce((a, b) => a + b, 0) * (this.header[this.currentSelectionSpan.col].isPercentage ? 100 : 1)).toFixed(this.header[this.currentSelectionSpan.col].decimals) ).toLocaleString(),
                average: Number((this.currentDonut.map(el => el.absoluteValue).reduce((a, b) => a + b, 0) / this.currentSelectionSpan.rows.length * (this.header[this.currentSelectionSpan.col].isPercentage ? 100 : 1)).toFixed(this.header[this.currentSelectionSpan.col].decimals)).toLocaleString()
            }
        },
        hasNumericTypes() {
            return this.header.map(h => h.type).includes(this.constants.NUMERIC);
        },
        icons() {
            return {
                arrowSort: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize}" height="${this.iconSize}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 9l4 -4l4 4m-4 -4v14" /><path d="M21 15l-4 4l-4 -4m4 4v-14" /></svg>`,
                bar: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize}" height="${this.iconSize}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M9 8m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M15 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M4 20l14 0" /></svg>`,
                chart: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize}" height="${this.iconSize}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 19l16 0" /><path d="M4 15l4 -6l4 2l4 -5l4 4" /></svg>`,
                chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize}" height="${this.iconSize}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 9l6 6l6 -6" /></svg>`,
                chevronLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize * 1.6}" height="${this.iconSize * 1.6}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 6l-6 6l6 6" /></svg>`,
                chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize * 1.6}" height="${this.iconSize * 1.6}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6l6 6l-6 6" /></svg>`,
                donut: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize * 0.8}" height="${this.iconSize * 0.8}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3v5m4 4h5" /><path d="M8.929 14.582l-3.429 2.918" /><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /></svg>`,
                export: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize}" height="${this.iconSize}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12.5 21h-7.5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v7.5" /><path d="M3 10h18" /><path d="M10 3v18" /><path d="M16 19h6" /><path d="M19 16l3 3l-3 3" /></svg>`,
                fileDownload: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize}" height="${this.iconSize}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M12 17v-6" /><path d="M9.5 14.5l2.5 2.5l2.5 -2.5" /></svg>`,
                filter: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize}" height="${this.iconSize}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z" /></svg>`,
                move: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize}" height="${this.iconSize}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 9l3 3l-3 3" /><path d="M15 12h6" /><path d="M6 9l-3 3l3 3" /><path d="M3 12h6" /><path d="M9 18l3 3l3 -3" /><path d="M12 15v6" /><path d="M15 6l-3 -3l-3 3" /><path d="M12 3v6" /></svg>`,
                sort09: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize}" height="${this.iconSize}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 15l3 3l3 -3" /><path d="M7 6v12" /><path d="M17 3a2 2 0 0 1 2 2v3a2 2 0 1 1 -4 0v-3a2 2 0 0 1 2 -2z" /><path d="M17 16m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M19 16v3a2 2 0 0 1 -2 2h-1.5" /></svg>`,
                sort90: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize}" height="${this.iconSize}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 15l3 3l3 -3" /><path d="M7 6v12" /><path d="M17 14a2 2 0 0 1 2 2v3a2 2 0 1 1 -4 0v-3a2 2 0 0 1 2 -2z" /><path d="M17 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M19 5v3a2 2 0 0 1 -2 2h-1.5" /></svg>`,
                sortAZ: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize}" height="${this.iconSize}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 10v-5c0 -1.38 .62 -2 2 -2s2 .62 2 2v5m0 -3h-4" /><path d="M19 21h-4l4 -7h-4" /><path d="M4 15l3 3l3 -3" /><path d="M7 6v12" /></svg>`,
                sortZA: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize}" height="${this.iconSize}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 21v-5c0 -1.38 .62 -2 2 -2s2 .62 2 2v5m0 -3h-4" /><path d="M19 10h-4l4 -7h-4" /><path d="M4 15l3 3l3 -3" /><path d="M7 6v12" /></svg>`,
                sum: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize}" height="${this.iconSize}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`,
                table: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize}" height="${this.iconSize}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" fill="white" d="M 10 2, 21 2, 21 21, 10 21Z"/><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" /><path d="M3 10h18" /><path d="M10 3v18" /></svg>`,
                warning: `<svg xmlns="http://www.w3.org/2000/svg" width="${this.iconSize * 0.8}" height="${this.iconSize * 0.8}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.24 3.957l-8.422 14.06a1.989 1.989 0 0 0 1.7 2.983h16.845a1.989 1.989 0 0 0 1.7 -2.983l-8.423 -14.06a1.989 1.989 0 0 0 -3.4 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>`
            }
        },
        pages() {
            const pages = [];
            if(this.bodyCopy.length) {
               for(let i = 0; i < this.bodyCopy.length; i += this.itemsPerPage) {
                    pages.push(this.bodyCopy.slice(i, i + this.itemsPerPage));
               } 
            }
            return pages;
        },
        rows() {
            return this.bodyCopy.map(row => row.td);
        },
        selectedCellsCalculations() {
            return {
                sumPercentage: Number((this.currentSelectionSpan.rows.map(r => r.value).reduce((a,b) => a + b, 0) * 100).toFixed(this.header[this.currentSelectionSpan.col].decimals)).toLocaleString(),
                sumRegular: Number(this.currentSelectionSpan.rows.map(r => r.value).reduce((a,b) => a + b, 0).toFixed(this.header[this.currentSelectionSpan.col].decimals)).toLocaleString(),
                averagePercentage: Number((this.currentSelectionSpan.rows.map(r => r.value).reduce((a,b) => a + b, 0) / this.currentSelectionSpan.rows.length * 100).toFixed(this.header[this.currentSelectionSpan.col].decimals)).toLocaleString(),
                averageRegular: Number((this.currentSelectionSpan.rows.map(r => r.value).reduce((a,b) => a + b, 0) / this.currentSelectionSpan.rows.length).toFixed(this.header[this.currentSelectionSpan.col].decimals)).toLocaleString()
            }
        },
        visibleRows() {
            return this.pages[this.currentPage];
        },
    },
    methods: {
        applyDonutOption() {
            const donutSet = this.selectedDonutCategory.options.map((option, i) => {
                return {
                    name: option,
                    color: this.palette[i] || this.palette[i % this.palette.length],
                    value: this.visibleRows
                        .filter((row, i) => row.td[this.selectedDonutCategory.index] === option && this.currentSelectionSpan.rows.map(row => row.index).includes(i))
                        .map(row => row.td[this.currentSelectionSpan.col])
                        .reduce((a, b) => Math.abs(a) + Math.abs(b) , 0),
                    absoluteValue: this.visibleRows
                        .filter((row, i) => row.td[this.selectedDonutCategory.index] === option && this.currentSelectionSpan.rows.map(row => row.index).includes(i))
                        .map(row => row.td[this.currentSelectionSpan.col])
                        .reduce((a, b) => a + b , 0)
                }
            }).sort((a,b) => b.value - a.value);

            this.currentDonut = this.makeDonut({ series : donutSet}, 50, 50, 30, 30);
            this.$nextTick(() => {
                this.chart.type = this.constants.DONUT;
                this.showDonutOptions = false;
            });
        },
        calcRectY(value, y) {
            if(value >= 0) return y;
            return this.chartData.zero;
        },
        canResetColumn(colIndex, th) {
            return !this.hasNaN[colIndex] && (th.isSort || th.isSearch || th.isMultiselect || th.rangeFilter) && ![this.constants.DATE].includes(th.type);
        },
        createXls(selection = 'all') {
            const head = this.header.map(h => h.name);
            const body = selection === 'all' ? this.bodyCopy.map(b => b.td) : this.visibleRows.map(r => r.td);
            const table = [head].concat(body);

            function s2ab(s) {
                let buf = new ArrayBuffer(s.length);
                let view = new Uint8Array(buf);
                for (let i = 0; i < s.length; i++) {
                    view[i] = s.charCodeAt(i) & 0xff;
                }
                return buf;
            }

            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.aoa_to_sheet(table);
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
            const excelFile = XLSX.write(workbook, { bookType: 'xlsx', type: 'binary' });
            const blob = new Blob([s2ab(excelFile)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'data.xlsx';
            link.click();
            window.URL.revokeObjectURL(link.href);
            this.isExportRequest = false;
        },
        calcChartProgression(plots) {
            let x1,y1,x2,y2;
            const len = plots.length;
            let sumX = 0;
            let sumY = 0;
            let sumXY = 0;
            let sumXX = 0;
            for(const { x, y } of plots) {
                sumX += x;
                sumY += y;
                sumXY += x * y;
                sumXX += x * x;
            }
            const slope = (len * sumXY - sumX * sumY) / (len * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / len;
            x1 = plots[0].x;
            x2 = plots[len - 1].x;
            y1 = slope * x1 + intercept;
            y2 = slope * x2 + intercept;

            return { x1, y1, x2, y2, slope };
        },
        closeAllDropdowns() {
            const dropdowns = document.getElementsByClassName("th-dropdown");
            if(!dropdowns.length) return;
            Array.from(dropdowns).forEach(dropdown => {
                dropdown.dataset.isOpen = false;
            });
        },
        debounce(fn, delay) {
            let timerId;
            clearTimeout(timerId);
            timerId = setTimeout(fn, delay);
        },
        filterBody() {
            this.bodyCopy = this.tableBody.filter(el => {
                for (const index in this.searches) {
                        if (!el.td[index].toUpperCase().includes(this.searches[index].toUpperCase())) {
                            return false;
                        }
                    }
                for (const index in this.multiselects) {
                    const filter = this.multiselects[index];
                    if (!filter.some(f => f === el.td[index])) {
                        return false;
                    }
                }
                for (const index in this.dates) {
                    const date = new Date(el.td[index]);
                    const fromDate = new Date(this.dates[index].from);
                    const toDate = new Date(this.dates[index].to);

                if (date < fromDate || date > toDate) {
                    return false;
                }
                }
                return true;
            });
            this.sortBody();
        },
        getAverage(index) {
            return this.rows
                .map(td => td[index])
                .map(el => isNaN(Number(el)) ? 0 : el)
                .reduce((a,b) => a + b, 0) / this.bodyCopy.length;
        },
        getDatesRange(index) {
            const dates = this.body.map(row => new Date(row.td[index]));
            const rawMin = new Date(Math.min(...dates));
            const rawMax = new Date(Math.max(...dates));
            const minYear = rawMin.getFullYear();
            const maxYear = rawMax.getFullYear();
            const minMonth = String(rawMin.getMonth() + 1).padStart(2, '0');
            const maxMonth = String(rawMax.getMonth() + 1).padStart(2, '0');
            const minDay = String(rawMin.getDate()).padStart(2, '0');
            const maxDay = String(rawMax.getDate()).padStart(2, '0');
            const min = `${minYear}-${minMonth}-${minDay}`;
            const max = `${maxYear}-${maxMonth}-${maxDay}`;
            return {
                from: min,
                to: max
            }
        },
        getDonutLegendValue(value) {
            return Number((value * (this.header[this.currentSelectionSpan.col].isPercentage ? 100 : 1)).toFixed(this.header[this.currentSelectionSpan.col].decimals)).toLocaleString();
        },
        getDropdownOptions(index) {
            return [...new Set(this.body.map(el => {
                return el.td[index];
            }))]
        },
        getSum(index) {
            return this.rows
                .map(td => td[index])
                .map(el => isNaN(Number(el)) ? 0 : el)
                .reduce((a,b) => a + b, 0);
        },
        includesNaN(arr) {
            return arr.includes(NaN)
        },
        isDropdownOptionSelected(option, index) {
            if(!this.multiselects[index]) {
                return true;
            }
            return this.multiselects[index].includes(option);
        },
        isNumeric(value) {
            return !isNaN(Number(String(value).replaceAll("%", '')));
        },
        isResetDisabled(index, th) {
            const isSort = th.isSort;
            const isSearch = th.isSearch;
            const isMultiselect = th.isMultiselect && this.multiselects[index];
            const rangeFilter = th.rangeFilter;

            const isRangeAltered = (index) => {
                if(rangeFilter && this.rangeFilters[index]) {
                    return Math.round(this.rangeFilters[index].min) === this.immutableRangeFilters[index].min && Math.round(this.rangeFilters[index].max) === this.immutableRangeFilters[index].max;
                }
            }

            if(isSort && isSearch && isMultiselect && rangeFilter) {
                return ["", undefined].includes(this.searches[index]) && [undefined].includes(this.sorts[index]) && this.multiselects[index].length === this.getDropdownOptions(index).length && isRangeAltered(index);
            }
            else if(isSort && isSearch && isMultiselect) {
                return ["", undefined].includes(this.searches[index]) && [undefined].includes(this.sorts[index]) && this.multiselects[index].length === this.getDropdownOptions(index).length;
            }
            else if(isSort && isSearch  && rangeFilter) {
                return ["", undefined].includes(this.searches[index]) && [undefined].includes(this.sorts[index]) && isRangeAltered(index);
            }
            else if(isSort && isSearch) {
                return ["", undefined].includes(this.searches[index]) && [undefined].includes(this.sorts[index]);
            }
            else if(isSort && isMultiselect && rangeFilter) {
                return [undefined].includes(this.sorts[index]) && this.multiselects[index].length === this.getDropdownOptions(index).length && isRangeAltered(index);
            }
            else if(isSort && isMultiselect) {
                return [undefined].includes(this.sorts[index]) && this.multiselects[index].length === this.getDropdownOptions(index).length;
            }
            else if(isSearch && isMultiselect && rangeFilter) {
                return ["", undefined].includes(this.searches[index]) && this.multiselects[index].length === this.getDropdownOptions(index).length && isRangeAltered(index);
            }
            else if(isSearch && isMultiselect) {
                return ["", undefined].includes(this.searches[index]) && this.multiselects[index].length === this.getDropdownOptions(index).length;
            }
            else if(isSearch && rangeFilter) {
                return ["", undefined].includes(this.searches[index]) && isRangeAltered(index);
            }
            else if(isSearch) {
                return ["", undefined].includes(this.searches[index]);
            }
            else if(isSort && rangeFilter) {
                return [undefined].includes(this.sorts[index]) && isRangeAltered(index);
            }
            else if(isSort) {
                return [undefined].includes(this.sorts[index]);
            }
            else if(isMultiselect && rangeFilter) {
                return this.multiselects[index].length === this.getDropdownOptions(index).length && isRangeAltered(index);
            }
            else if(isMultiselect) {
                return this.multiselects[index].length === this.getDropdownOptions(index).length;
            }
        },
        navigate(direction) {
            this.resetSelection();
            if(direction ===  'next' && this.currentPage < this.pages.length) {
                this.currentPage += 1;
            } else if(direction === 'previous' && this.currentPage >= 1) {
                this.currentPage -=1 ;
            }else{
                this.currentPage = direction - 1;
            }
            const table = this.$refs.tableWrapper;
            table.scrollTo({
                top: 0,
                left: 0,
                behavior: "smooth"
            });
        },
        navigateCell(event) {
            event.preventDefault();
            const keyCode = event.keyCode;
            const up = 38;
            const down = 40;
            const left = 37;
            const right = 39;
            if(![up, down, left, right].includes(keyCode)) return;

            const currentId = event.target.id;
            const regex = /cell_(\d+)_(\d+)/;
            const match = currentId.match(regex);
            const currentRow = parseInt(match[1]);
            const currentCol = parseInt(match[2]);

            const nextCellRow = document.getElementById(`cell_${currentRow}_${currentCol + 1}`);
            const previousCellRow = document.getElementById(`cell_${currentRow}_${currentCol - 1}`);
            const nextCellCol = document.getElementById(`cell_${currentRow + 1}_${currentCol}`);
            const previousCellCol = document.getElementById(`cell_${currentRow - 1}_${currentCol}`);

            let nextCell;
            switch (true) {
                case keyCode === right:
                    nextCell = nextCellRow;
                    break;

                case keyCode === left:
                    nextCell = previousCellRow;
                    break;

                case keyCode === up:
                    nextCell = previousCellCol;
                    break;

                case  keyCode === down:
                    nextCell = nextCellCol;
                    break;

                default:
                    return;
            }

            if(!nextCell) return;
            nextCell.focus();
            nextCell.scrollIntoView({ behavior:"smooth", block:"center" });
        },
        openDonutOptions() {
            this.selectedDonutCategory = this.availableDonutCategories[0]
            this.showDonutOptions = true;
        },
        placeLabelOnTopOrBottom({previousPlot, currentPlot, nextPlot}) {
            const top = currentPlot.y - 38;
            const bottom = currentPlot.y + 16;

            if(previousPlot && nextPlot) {
                if(previousPlot.value < currentPlot.value && nextPlot.value < currentPlot.value) {
                    return top;
                }
                if(previousPlot.value > currentPlot.value && nextPlot.value > currentPlot.value) {
                    return bottom
                }
                if(previousPlot.value > currentPlot.value && nextPlot.value < currentPlot.value) {
                    return top;
                }
                if(previousPlot.value < currentPlot.value && nextPlot.value > currentPlot.value) {
                    return top;
                }
                return top;
            }

            if(previousPlot && !nextPlot) {
                if(previousPlot.value > currentPlot.value) {
                    return bottom;
                }
                return top;
            }

            if(!previousPlot && nextPlot) {
                if(nextPlot.value > currentPlot.value) {
                    return bottom;
                }
                return top;
            }

            if(!previousPlot && !nextPlot) {
                return top;
            }
            return top;
        },
        async prepareBodyCopy() {
            return new Promise((resolve) => {
                const searchHelper = [];

                this.tableHead.forEach((th,i) => {
                    if(th.isSearch){
                        Object.assign(this.searches, {[i]:""});
                    }
                    if(th.isMultiselect) {
                        Object.assign(this.multiselects, {[i]: this.getDropdownOptions(i)});
                    }
                    if(th.type === this.constants.DATE) {
                        Object.assign(this.dates, {[i]: this.getDatesRange(i)});
                        Object.assign(this.filteredDatesIndexes, {[i]: false });
                    }
                    if(th.isPercentage || th.percentageTo) {
                        Object.assign(this.percentages, {[i]: {
                            reference: th.percentageTo,
                            referenceIndex: this.header.map(el => el.name).indexOf(th.percentageTo)
                        }});
                    }

                    if(th.rangeFilter) {
                        Object.assign(this.rangeFilters, {[i]: {
                            min: Math.round(Math.min(...this.body.map(el => el.td).map(el => el[i]))),
                            max: Math.round(Math.max(...this.body.map(el => el.td).map(el => el[i]))),
                        }});
                        Object.assign(this.immutableRangeFilters, {[i]: {
                            min: Math.round(Math.min(...this.body.map(el => el.td).map(el => el[i]))),
                            max: Math.round(Math.max(...this.body.map(el => el.td).map(el => el[i]))),
                        }});
                    }

                    if(th.isPercentage) {
                        const baseIndex = this.header.map(el => el.name).indexOf(th.percentageTo);
                        const sum = this.body.map(el => el.td[baseIndex]).reduce((a,b) => a + b, 0);
                        searchHelper.push([i, baseIndex, sum]);
                    }

                    if(th.type === this.constants.NUMERIC && !th.isPercentage) {
                        Object.assign(this.hasNaN, {[i]: this.includesNaN(this.body.map(el => Number(el.td[i])))})
                    }
                });
                
                this.bodyCopy.forEach((el, index) => {
                    searchHelper.map(helper => {
                        const [index, baseIndex, sum] = helper;
                        el.td[index] = el.td[baseIndex] / sum;
                    });
                    // Implements a sorting index for each column type
                    // Also applied on tableBody as it is used when reseting filters to initial state
                    el.td.forEach((td, i) => {
                        if(this.header[i].type === this.constants.TEXT && this.header[i].isSearch) {
                            el[i] = this.stringToNumber(td);
                        }
                        if(this.header[i].type === this.constants.DATE) {
                            el[i] = new Date(td).getTime();
                        }
                        if(this.header[i].type === this.constants.NUMERIC) {
                            el[i] = isNaN(Number(td)) ? i : td;
                        }
                        this.tableBody[index][i] = el[i];
                    })
                });
                resolve(true);
            });
        },
        promiseWithAsyncFunction(asyncFunction, callback) {
            return new Promise((resolve, reject) => {
                asyncFunction()
                    .then(data => {
                        try {
                            const result = callback(data);
                            resolve(result);
                        } catch (error) {
                            reject(error);
                        }
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        },
        resetDates(index) {
            this.dates[index] = {
                from: this.getDatesRange(index).from,
                to: this.getDatesRange(index).to
            }
            this.filteredDatesIndexes[index] = false;
            this.$forceUpdate();
            this.filterBody();
        },
        resetFilter(index, th, event){
            const target = event.currentTarget;
            clearTimeout(this.buttonTimeout);
            target.classList.add("clicked");
            this.buttonTimeout = setTimeout(() => {
                target.classList.remove("clicked");
            }, 200);
            this.currentFilter = undefined;

            if(th.rangeFilter) {
                this.rangeFilters[index].min = this.immutableRangeFilters[index].min;
                this.rangeFilters[index].max = this.immutableRangeFilters[index].max;
            }

            if(th.isMultiselect) {
                this.multiselects[index] = this.getDropdownOptions(index);
                if(th.type === this.constants.TEXT) {
                    this.sorts[index] = undefined;
                }
                if(th.isSearch) {
                    this.searches[index] = "";
                }
            }
            else if(th.type === this.constants.NUMERIC) {
                this.sorts[index] = undefined;
            }else if(th.type === this.constants.TEXT) {
                this.sorts[index] = undefined;
                this.searches[index] = "";
            }else if(th.type === this.constants.DATE) {
                this.sorts[index] = undefined;
            }
            this.filterBody();
        },
        resetSelection() {
            const highlightedCells = document.getElementsByClassName(this.cssClass.ROW);
            Array.from(highlightedCells).forEach(td => {
                td.classList.remove(this.cssClass.CELL);
                td.classList.remove(this.cssClass.ROW);
                td.classList.remove(this.cssClass.FIRST_TD);
                td.classList.remove(this.cssClass.LAST_TD);
            });
            if(this.currentPage > this.pages.length - 1) {
                this.currentPage = this.pages.length - 1;
            }
            this.showChart = false;
            this.currentDonut = undefined;
            this.selectedColumn = undefined;
            this.chart.type = this.constants.BAR;
            this.currentSelectionSpan = {
                col: undefined,
                rows: [],
            }
            this.clientX = 100;
            this.clientY = 100;
        },
        selectColumn(index) { 
            if (this.currentSelectionSpan.col !== index) {
                this.visibleRows.forEach((row, i) => {
                    this.selectTd({
                        td: row.td[index],
                        rowIndex: i,
                        colIndex: index,
                        headerType: this.constants.NUMERIC,
                        event: {
                            currentTarget: document.getElementById(`cell_${i}_${index}`)
                        }
                    });
                });                
                this.selectedColumn = index;
            } else {
                this.selectedColumn = undefined;
                this.resetSelection();
            }
        },
        selectDropdownOption(option, index) {
            if(this.multiselects[index].includes(option)) {
                this.multiselects[index] = this.multiselects[index].filter(el => el !== option);
            }else {
                this.multiselects[index].push(option);
            }
            this.$forceUpdate();
            this.filterBody();
        },
        selectTd({ td, rowIndex, colIndex, headerType, event }) {
            if(headerType !== this.constants.NUMERIC || isNaN(Number(td))) {
                this.resetSelection();
                return;
            }
            if(this.currentSelectionSpan.col !== colIndex) {
                this.resetSelection();
            }
            const tr = event.currentTarget.parentNode;
            this.currentSelectionSpan.col = colIndex;

            if(this.currentSelectionSpan.rows.map(row => row.index).includes(rowIndex)) {
                this.currentSelectionSpan.rows = this.currentSelectionSpan.rows.filter(row => row.index !== rowIndex);
                event.currentTarget.classList.remove(this.cssClass.CELL);
                Array.from(tr.children).forEach((td, i) => {
                    td.classList.remove(this.cssClass.ROW);
                    if(i === 0) {
                        td.classList.remove(this.cssClass.FIRST_TD);
                    }
                    if(i === tr.children.length - 1) {
                        td.classList.remove(this.cssClass.LAST_TD);
                    }
                })
            } else {
                this.currentSelectionSpan.rows.push({
                    index: rowIndex,
                    value: td
                });
                event.currentTarget.classList.add(this.cssClass.CELL);
                Array.from(tr.children).forEach((td, i) => {
                    td.classList.add(this.cssClass.ROW);
                    if(i === 0) {
                        td.classList.add(this.cssClass.FIRST_TD);
                    }
                    if(i === tr.children.length - 1) {
                        td.classList.add(this.cssClass.LAST_TD);
                    }
                });
            }
            this.currentSelectionSpan.rows = this.currentSelectionSpan.rows.sort((a,b) => a.index - b.index); // Guarantees the chart will display plots in the same order than the visible rows

            if(this.chart.type === this.constants.DONUT && this.currentSelectionSpan.rows.length > 0) {
                this.applyDonutOption();
            }

        },
        setFilterDatesIndexes(index) {
            this.filteredDatesIndexes[index] = !(this.getDatesRange(index).from === this.dates[index].from && this.getDatesRange(index).to === this.dates[index].to);
        },
        sortBody() {
            this.resetSelection();
            Object.keys(this.rangeFilters).forEach(index => {
                this.filterByRange(this.bodyCopy, index);
            });

            Object.keys(this.sorts).forEach(index => {
                this.sortByNumber(this.bodyCopy, index);
            });
            
            if(this.currentFilter !== undefined) {
                this.sortByNumber(this.bodyCopy, this.currentFilter);
            }
            // percentage calculation
            this.header.forEach((col, i) => {
                if(col.isPercentage) {
                    const referenceIndex = this.percentages[i].referenceIndex;
                    const sum = this.bodyCopy.map(el => el.td[referenceIndex]).reduce((a,b) => a + b, 0);
                    this.bodyCopy.forEach(row => {
                        row.td[i] = row.td[referenceIndex] / sum;
                    });
                }
            });
            if(this.currentPage > this.pages.length - 1) {
                this.currentPage = this.pages.length - 1;
            }
            if([-1].includes(this.currentPage)) {
                this.currentPage = 0;
            }
            this.$forceUpdate();
        },
        filterByRange(arr, index) {
            this.bodyCopy = arr.filter(el => {
                return el.td[index] >= this.rangeFilters[index].min && el[index] <= this.rangeFilters[index].max
            })
        },
        sortByNumber(arr, index) {
            if(this.sorts[index] === this.constants.ASC) {
                arr = arr.sort((a,b) => {
                    return a[index] - b[index];
                });
            }
            if(this.sorts[index] === this.constants.DESC) {
                arr = arr.sort((a,b) => {
                    return b[index] - a[index];
                })
            } else {
                return 0;
            }
        },
        sortTh(index, event) {
            this.currentFilter = index;
            const target = event.currentTarget;
            clearTimeout(this.buttonTimeout);
            target.classList.add("clicked");
            this.buttonTimeout = setTimeout(() => {
                target.classList.remove("clicked");
            }, 200);
            const record = this.sorts[index];
            if(record === 1) {
                this.sorts[index] = this.constants.DESC;
            } else {
                this.sorts[index] = this.constants.ASC;
            }
            this.sortBody();
        },
        stringToNumber(str) {
            let num = 0;
            for (let i = 0; i < str.length; i += 1) {
                num += str.charCodeAt(i);
            }
            return num;
        },
        toggleMultiselect(index, _th, event) {
            const target = event.currentTarget;
            clearTimeout(this.buttonTimeout);
            target.classList.add("clicked");
            this.buttonTimeout = setTimeout(() => {
                target.classList.remove("clicked");
            }, 200);

            const menu = document.getElementById(`th_dropdown_${index}`);
            if(menu.dataset.isOpen === 'false') {
                menu.dataset.isOpen = 'true';
            }else {
                menu.dataset.isOpen = 'false';
            }
        },
        updateCurrentPage(event) {
            this.resetSelection();
            this.currentPage = Number(event.target.value);
        },

        // DONUTS
        addVector([a1, a2], [b1, b2]) {
            return [a1 + b1, a2 + b2];
        },
        calcDonutMarkerConnectorColor(arc) {
            if(arc.proportion * 100 > 3) {
                return arc.color;
            }
            return "transparent";
        },
        calcDonutMarkerLabelPositionX(arc) {
            return arc.center.endX + this.calcMarkerOffset(arc, 50);
        },
        calcMarkerOffset(arc, centerX) {
            const isRight = arc.center.endX - centerX >= 0;
            if (isRight) {
                return 3;
            }
            return -2;
        },
        createArc([cx, cy], [rx, ry], [position, ratio], phi) {
            ratio = ratio % (2 * Math.PI);
            const rotMatrix = this.rotateMatrix(phi);
            const [sX, sY] = this.addVector(
            this.matrixTimes(rotMatrix, [
                rx * Math.cos(position),
                ry * Math.sin(position),
            ]),
            [cx, cy]
            );
            const [eX, eY] = this.addVector(
            this.matrixTimes(rotMatrix, [
                rx * Math.cos(position + ratio),
                ry * Math.sin(position + ratio),
            ]),
            [cx, cy]
            );
            const fA = ratio > Math.PI ? 1 : 0;
            const fS = ratio > 0 ? 1 : 0;
            return {
                startX: sX,
                startY: sY,
                endX: eX,
                endY: eY,
                path: `M${sX} ${sY} A ${[
                    rx,
                    ry,
                    (phi / (2 * Math.PI)) * 360,
                    fA,
                    fS,
                    eX,
                    eY,
                ].join(" ")}`,
            };
        },
        displayArcPercentage(arc, stepBreakdown) {
            return isNaN(arc.value / this.sumValues(stepBreakdown)) ? 0 : ((arc.value / this.sumValues(stepBreakdown)) * 100).toFixed(0) + "%";
        },
        isArcBigEnough(arc) {
            return arc.proportion * 100 > 3;
        },
        makeDonut(item, cx, cy, rx, ry) {
            let { series } = item;
            if (!series || item.base === 0)
                return {
                    ...series,
                    proportion: 0,
                    ratio: 0,
                    path: "",
                    startX: 0,
                    startY: 0,
                    endX: 0,
                    center: {},
                };
                const sum = [...series]
                .map((serie) => serie.value)
                .reduce((a, b) => a + b, 0);
                
                const ratios = [];
                let acc = 0;
                for (let i = 0; i < series.length; i += 1) {
                let proportion = series[i].value / sum;
                const ratio = proportion * (Math.PI * 1.9999); // (Math.PI * 2) fails to display a donut with only one value > 0 as it goes full circle again
                // midProportion & midRatio are used to find the midpoint of the arc to display markers
                const midProportion = series[i].value / 2 / sum;
                const midRatio = midProportion * (Math.PI * 2);
                const { startX, startY, endX, endY, path } = this.createArc(
                    [cx, cy],
                    [rx, ry],
                    [acc, ratio],
                    110
                );
                ratios.push({
                    ...series[i],
                    proportion,
                    ratio: ratio,
                    path,
                    startX,
                    startY,
                    endX,
                    endY,
                    center: this.createArc(
                    [cx, cy],
                    [rx * 1.45, ry * 1.45],
                    [acc, midRatio],
                    110
                    ), // center of the arc, to display the marker. rx & ry are larger to be displayed with a slight offset
                });
                acc += ratio;
                }
            return ratios;
        },
        matrixTimes([[a, b], [c, d]], [x, y]) {
            return [a * x + b * y, c * x + d * y];
        },
        rotateMatrix(x) {
            return [
            [Math.cos(x), -Math.sin(x)],
            [Math.sin(x), Math.cos(x)],
            ];
        },
        sumValues(source) {
            return [...source].map(s => s.value).reduce((a, b) => a + b, 0);
        },

        // CHART DRAGGING METHODS
        closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        },
        dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            document.onmouseup = this.closeDragElement;
            document.onmousemove = this.elementDrag;
        },
        elementDrag(e) {
            if(this.rafId) return;
            this.rafId = window.requestAnimationFrame(() => this.onElementDrag(e));
        },
        onElementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            const chartModal = this.$refs.chartModal;
            const rect = chartModal.getBoundingClientRect();
            this.clientX = e.clientX - (rect.width / 2);
            this.clientY = e.clientY - (rect.height / 2);
            this.rafId = null;
        },
    }
}
</script>

<style scoped>
.smart-table-main {
    height: fit-content;
    padding: 0 0 98px 0;
    position: relative;
}
.smart-table__wrapper {
    color: #2D353C;
    overflow-x: auto;
    padding: 0px 12px 48px 12px;
    position: relative;
    width: calc(100% - 24px);
    /* z-index: 100; */
}
thead {
    position: sticky;
    top:0;
}
.smart-table {
    width:100%;
    position: relative;
}
table {
    border-collapse:collapse;
}
th {
    background-color: #E1E5E8;
    outline:1px solid white;
    background: radial-gradient(at top left, #cdd1d4, #e1e5e8);
}
th,
td {
    padding: 3px 8px;
}
tr:nth-child(even) {
    background-color: #f3f5f7;
}
tr td {
    outline: 1px solid white;
}
.th-numeric {
    text-align:right;
    font-variant-numeric: tabular-nums;
}
.th-filter {
    align-items:center;
    display: flex;
    flex-direction: row;
    gap: 6px;
    justify-content: center;
    position: relative;
}
.th-fusion {
    align-items:center;
    background: radial-gradient(at top left, #cdd1d4, #e1e5e8);
    display: flex;
    height: 83px;
    justify-content:center;
    left:0px;
    outline: 1px solid white;
    position: absolute;
    top:0px;
    width: 100%;
    z-index:10;
}
button {
    align-items:center;
    cursor: pointer;
    display: flex;
    justify-content:center;
    width:32px;
}
input {
    padding: 0 6px;
    font-family: "Satoshi"
}
button,
input {
    border-radius: 6px;
    border: 1px solid grey;
    height: 32px;
}
button:hover,
button:focus,
input:hover,
input:focus {
    outline: 3px solid rgba(128, 128, 128, 0.432);
}
button.clicked {
    animation: clicked 0.15s ease-in-out;
}
button[disabled] {
    cursor: not-allowed;
}
button[disabled]:focus,
button[disabled]:hover {
    outline: none;
}

button.th-reset:not(:disabled){
    background: radial-gradient(at top, #f19a71, #F17171);
    border: 1px solid #F17171;
    color: white;
}
button.th-reset:not(:disabled):hover,
button.th-reset:not(:disabled):focus {
    outline: 3px solid #f171717e;
}

[data-is-open="false"]  {
    transform: scale(0,0);
}

.th-dropdown[data-is-open="true"] {
    animation: open-dropdown 0.2s ease-in;
}

.th-dropdown[data-is-open="false"] {
    animation: close-dropdown 0.2s ease-in;
}

.th-dropdown {
    align-items:center;
    background: radial-gradient(at top left, #d2d7db, #e1e5e8);
    border-radius: 8px;
    border: 1px solid white;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.5);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    left: 0;
    max-width: 300px;
    min-width: 150px;
    padding: 24px 12px 12px 12px;
    position: absolute;
    top: calc(100% + 12px);
}

.th-option {
    border-radius: 6px;
    cursor: pointer;
    padding: 2px 6px;
    text-align: left;
    user-select: none;
    width: 100%;
    font-weight: 400;
}
.th-option:hover {
    background-color: #fafafa;
    box-shadow: 0 3px 6px -3px rgba(0,0,0,0.5);
    z-index: 1;
}

.th-icon-green {
    text-shadow: 0 2px 4px rgba(0, 128, 0, 0.486);
}

.th-icon-red {
    text-shadow: 0 2px 4px rgba(255, 0, 0, 0.486);
}

button.close-dropdown,
button.close-chart-modal {
    align-items: center;
    background: transparent;
    border-radius: 50%;
    border:none;
    color:#2d353c;
    display: flex;
    height: 20px;
    padding: 2px;
    position: absolute;
    right: 6px;
    top: 6px;
    width:20px;
}

button.close-dropdown:hover,
button.close-dropdown:focus,
button.close-chart-modal:hover,
button.close-char-modal:focus {
    outline: 3px solid #2d353c71;
}

.th-button-active {
    background: radial-gradient(at top, #968bf1, #6376DD);
    color: white;
}

.th-button-active:hover,
.th-button-active:focus {
    outline: 3px solid #6375dd7a;
}

.th-date {
    align-items:center;
    display: flex;
    flex-direction: row;
    gap:6px;
    justify-content: center;
    width:100%;
}

.date-wrapper--inputs {
    align-items:center;
    display: flex;
    flex-direction: column;
    gap: 6px;
    justify-content: center;
    width: 100%;
}

.date-wrapper--button {
    display: flex;
    gap: 3px;
}

input[type="date"] {
    border-radius: 4px;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    height: 20px !important;
    width: 100px;
}

.date-fieldset {
    align-items:center;
    display: flex;
    flex-direction: row;
    gap: 6px;
    justify-content: center;
    width:100%;
}
.date-fieldset label {
    font-size: 12px;
    font-weight: 400;
}

@keyframes clicked {
    0% {
        transform: scale(0.9,0.9);
    }
    90%{
        transform: scale(1.03,1.03);
    }
    100% {
        transform: scale(1,1);
    }
}

td.td-numeric {
    cursor:pointer;
}

td.smart-td-selected-neighbor {
    background: radial-gradient(at top left, #82ecc41e, #63dd821e);
}
td.smart-td-selected {
    background: radial-gradient(at top left, #9986ec5b, #6375dd5b);
}
td.smart-td-selected-first {
    box-shadow: 3px 0 0 #6376DD inset;
}
td.smart-td-selected-last {
    box-shadow: -3px 0px 0 #6376DD inset;
}
.td-selector-info {
    align-items:center;
    background: linear-gradient(to right, transparent, #e1e5e8);
    border-radius: 0 0 6px 6px;
    bottom:76px;
    display: flex;
    font-size:14px;
    justify-content:flex-end;
    min-height: 20px;
    padding: 2px;
    padding-right: 4px;
    position: absolute;
    right:0;
    text-align:right;
    width: 100%;
    z-index: 1;
}
.td-selector-info--active {
    background: linear-gradient(to right, transparent, #6375dd4f);
}
button.td-selector-info-reset {
    background: transparent;
    border:none;
    color:#F17171;
    height: 14px;
    margin-left: 24px;
    padding:0;
    width:14px;
}
button.td-selector-info-reset:hover,
button.td-selector-info-reset:focus {
    outline: 3px solid #f171717e;
}
.format-num {
    font-variant-numeric: tabular-nums;
}
.td-selector-icon {
    margin-bottom: -5px;
    margin-right: 6px;
}

.smart-table-pagination {
    align-items:center;
    bottom:24px;
    display: flex;
    flex-direction: row;
    gap: 12px;
    height: 40px;
    justify-content: center;
    position: absolute;
    width:100%;
    z-index:1;
}

button.smart-table-navigation {
    height: 36px;
    padding: 1px;
    width: 36px;
}

.smart-table-navigation-indicator {
    background: linear-gradient(to right, #6375dd88, #6376DD);
    border-radius: 6px;
    bottom: 70px;
    height: 6px;
    position: absolute;
    transition: all 0.1s ease-in-out;
}
.smart-table-page-scroller-wrapper {
    align-items:center;
    display: flex;
    flex-direction: column;
    justify-content:center;
}
input.smart-table-page-scroller {
    cursor: pointer;
    height: 24px;
    padding: 0;
}
.smart-table-paginator {
    position: absolute;
    bottom: 0;
    z-index: 2;
    left: 12px;
    display: flex;
    flex-direction: row;
    gap: 6px;
    font-size: 14px;
    justify-content:center;
    align-items:center;
    width: calc(100% - 24px);
}
.smart-table-paginator select {
    border-radius: 3px;
}

.smart-table-size-warning {
    align-items:center;
    bottom:-24px;
    color:#F17171;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    font-size: 12px;
    gap: 6px;
    justify-content: center;
    position: absolute;
    text-align:center;
    width: 100%;
}

th.smart-table-col-selector {
    height: 12px;
    background: #e1e5e8;
}
.col-selector {
    align-items: center;
    cursor: pointer;
    display: flex;
    height: 100%;
    justify-content: center;
    width:100%;
}
th.col-selector--selected {
    background: radial-gradient(at top left, #9586eb, #6376DD);
    color:white;
}
th.col-selector--selected div {
    background: transparent;
    color: white;
}

.smart-table-chart-modal {
    align-items:center;
    background: radial-gradient(at top left, #e1e5e8, #eceef0);
    border-radius: 8px;
    border: 1px solid white;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.3);
    display: flex;
    flex-direction: column;
    justify-content:center;
    min-height: 200px;
    min-width: 300px;
    max-width: 800px;
    overflow:hidden;
    padding: 12px;
    position: fixed;
    resize: horizontal;
    user-select: none;
    z-index: 10000;
}
.smart-table-chart-svg{
    background: white;
    border-radius: 6px;
    margin-bottom: 12px;
    overflow: visible;
    padding: 12px;
    width: calc(100% - 24px);
    box-shadow: 0 2px 4px -2px rgba(128, 128, 128, 0.6);
}
.smart-table-donut-chart {
    background: white;
    border-radius: 6px;
    box-shadow: 0 2px 4px -2px rgba(128, 128, 128, 0.6);
}

th.invisible-cell {
    background: white;
    border-right:2px solid white;
}
td.smart-table-td-iteration {
    background: #E1E5E8;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    text-align:right;
    user-select:none;
}
.chart-trend {
    color: grey;
    font-size: 12px;
    padding-left:12px;
}

.chart-modal-options {
    bottom: 12px;
    display: flex;
    flex-direction: row;
    gap: 8px;
    position: absolute;
    right: 24px;
}
.chart-modal-options button {
    height: 24px;
    padding: 3px;
    width: 24px;
}
.chart-modal-options button.is-active-chart {
    background: radial-gradient(at top, #968bf1, #6376DD);
    border:1px solid #6376DD;
    color: white;
}

.th-range-filter {
    display: flex;
    align-items:center;
    justify-content:center;
    gap: 2px;
    flex-direction: column;
}

.th-range-filter input {
    height: 20px;
    width: 60px;
    font-variant-numeric: tabular-nums;
    font-size: 12px;
}
.th-range-filter label {
    font-size:12px;
    font-weight: 400;
    margin-bottom: -3px;
}

.smart-table-fieldset-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 24px;
    margin-bottom: 12px;
}

.smart-table-fieldset {
    border-radius: 6px;
    margin-bottom: 24px;
    border: 1px solid white;
}

.smart-table-fieldset legend {
    color: grey;
}

.smart-table-fieldset-option {
    display: flex;
    align-items:center;
}

.smart-table-fieldset-option input {
    height: 14px;
    width: 14px;
    border-radius: 50%;
}

button.smart-table-generate-donut {
    align-items:center;
    background: radial-gradient(at top, #968bf1, #6376DD);
    color:white;
    display: flex;
    gap: 3px;
    justify-content:center;
    margin: 0 auto;
    margin-bottom:12px;
    margin-top: 24px;
    padding-left:12px;
    padding-right:12px;
    width: fit-content;
}

input[type="radio"],
input[type="range"] {
    accent-color: #6376DD;
}

button.smart-table-generate-donut[disabled] {
    opacity: 0.5;
}

.smart-table-donut-legend {
    align-items:center;
    column-gap:12px;
    display: flex;
    flex-wrap:wrap;
    font-size: 12px;
    justify-content: center;
    margin: 0 auto;
    max-width: 400px;
    padding-bottom: 36px;
}

.smart-table-donut-legend-item {
    align-items:center;
    display: flex;
    flex-direction: row;
    gap: 3px;
    justify-content:center;
}

.smart-table-donut-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    font-size: 4px;
    height:100%;
    justify-content: center;
    text-align:center;
    width:100%;
}

.smart-table-donut-label-name {
    font-size: 3px;
    line-height: 3px;
}

td:focus {
    outline: 3px solid #202d7470;
}

.smart-table-export-hub {
    left: 5px;
    position: absolute;
    top:0;
    z-index: 1001;
}

.smart-table-export-hub-dropdown {
    position: absolute;
    top: 40px;
    left: 0px;
    padding: 24px;
    background: radial-gradient(at top left, #d2d7db, #e1e5e8);
    border-radius: 8px;
    border:1px solid white;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.5);
    transform: scale(0,0);
    opacity:0;
}

.smart-table-export-hub-dropdown[data-is-open="true"] {
    animation: open-dropdown 0.2s ease-in forwards;
}

.smart-table-export-hub-dropdown[data-is-open="false"] {
    animation: close-dropdown 0.2s ease-in;
}

.smart-table-export-hub-options {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items:center;
    justify-content:center;
}

.smart-table-export-hub-options button {
    width: fit-content;
    display: flex;
    align-items:center;
    justify-content:center;
    gap: 3px;
    min-width: 130px;
}

.smart-table-export-hub-option-wrapper {
    align-items:center;
    display: flex;
    flex-direction: row;
    gap: 12px;
    justify-content:flex-start;
}

.smart-table-export-hub-option-wrapper .label {
    font-size: 12px;
    line-height: 12px;
    margin-bottom: 6px;
    width: 100px;
}

.td-nan {
    background: #F17171;
}
.td-has-nan,
.th-has-nan {
    background: #F17171;
    min-width:100px;
    color: white;
}

@keyframes open-dropdown {
    0% {
        transform: scale(1,0.9);
        opacity: 0;
    }
    50% {
        transform: scale(1,1.05);
        opacity:1;
    }
    100% {
        transform: scale(1,1);
        opacity: 1;
    }
}

@keyframes close-dropdown {
    0% {
        transform: scale(1.05,1.05);
        opacity: 1;
    }
    100% {
        transform: scale(0, 0);
        opacity: 0;
    }
}
</style>