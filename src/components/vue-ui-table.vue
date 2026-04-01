<template>
    <div
        class="vue-data-ui-component vue-ui-table-main"
        :style="`font-family: ${FINAL_CONFIG.fontFamily}`"
    >
        <div
            class="vue-ui-table-export-hub"
            :style="{ top: exportButtonTop + 'px' }"
            v-if="FINAL_CONFIG.style.exportMenu.show"
        >
            <button
                @click="isExportRequest = !isExportRequest"
                v-html="icons.export"
                :style="`background:${FINAL_CONFIG.style.exportMenu.backgroundColor};color:${FINAL_CONFIG.style.exportMenu.color};cursor:${isCursorPointer ? 'pointer' : 'default'}`"
            />
            <div
                class="vue-ui-table-export-hub-dropdown"
                :data-is-open="isExportRequest || 'false'"
                :style="`background:${FINAL_CONFIG.style.exportMenu.backgroundColor};color:${FINAL_CONFIG.style.exportMenu.color}`"
            >
                <b class="vue-ui-table-export-hub-title"> Export </b>
                <button
                    class="close-dropdown"
                    @click="isExportRequest = false"
                    :style="`background:${FINAL_CONFIG.style.closeButtons.backgroundColor};color:${FINAL_CONFIG.style.closeButtons.color};border-radius:${FINAL_CONFIG.style.closeButtons.borderRadius}`"
                >
                    ✖
                </button>
                <div class="vue-ui-table-export-hub-options">
                    <div class="vue-ui-table-export-hub-option-wrapper">
                        <div class="label">
                            {{ FINAL_CONFIG.translations.exportAllLabel }}
                            ({{ bodyCopy.length }})
                        </div>
                        <button
                            id="exportAll"
                            @click="createXls('all')"
                            :style="`background:${FINAL_CONFIG.style.exportMenu.buttons.backgroundColor};color:${FINAL_CONFIG.style.exportMenu.buttons.color};cursor:${isCursorPointer ? 'pointer' : 'default'}`"
                        >
                            <div v-html="icons.fileDownload" />
                            <span>{{
                                FINAL_CONFIG.translations.exportAllButton
                            }}</span>
                        </button>
                    </div>
                    <div class="vue-ui-table-export-hub-option-wrapper">
                        <div class="label">
                            {{ FINAL_CONFIG.translations.exportPageLabel }}
                        </div>
                        <button
                            id="exportPage"
                            @click="createXls('page')"
                            :style="`background:${FINAL_CONFIG.style.exportMenu.buttons.backgroundColor};color:${FINAL_CONFIG.style.exportMenu.buttons.color};cursor:${isCursorPointer ? 'pointer' : 'default'}`"
                        >
                            <div v-html="icons.fileDownload" />
                            <span>{{
                                FINAL_CONFIG.translations.exportPageButton
                            }}</span>
                        </button>
                    </div>
                    <div class="vue-ui-table-dialog-field">
                        <label
                            class="label vue-ui-table-dialog-input-label"
                            style="width: 100%"
                        >
                            <span style="width: fit-content">
                                {{ FINAL_CONFIG.translations.filename }}
                            </span>
                            <input
                                name="filename"
                                ref="filenameInputRef"
                                @keydown.space.stop
                                pattern=".*"
                                class="vue-ui-table-dialog-input"
                                type="text"
                                v-model="filename"
                            />
                        </label>
                        <button
                            v-if="!!filename"
                            class="vue-ui-table-dialog-field-button"
                            @click="filename = ''"
                            :style="{
                                cursor: isCursorPointer ? 'pointer' : 'default',
                            }"
                        >
                            <BaseIcon
                                name="close"
                                :stroke="FINAL_CONFIG.style.exportMenu.color"
                                :size="18"
                            />
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div
            class="vue-ui-table__wrapper"
            :style="`max-height:${FINAL_CONFIG.maxHeight}px`"
            ref="tableWrapper"
        >
            <table class="vue-ui-table">
                <caption
                    class="vue-ui-table__caption"
                    ref="tableCaption"
                    v-if="FINAL_CONFIG.style.title.text"
                    :style="{
                        textAlign: FINAL_CONFIG.style.title.textAlign,
                        paddingLeft:
                            FINAL_CONFIG.style.title.paddingLeft + 'px',
                        paddingRight:
                            FINAL_CONFIG.style.title.paddingRight + 'px',
                        backgroundColor:
                            FINAL_CONFIG.style.title.backgroundColor,
                        boxShadow: `${FINAL_CONFIG.style.title.backgroundColor} -1px 0px 0px 0px`,
                    }"
                >
                    <span
                        :style="{
                            fontSize: FINAL_CONFIG.style.title.fontSize + 'px',
                            fontWeight: FINAL_CONFIG.style.title.bold
                                ? 'bold'
                                : 'normal',
                            color: FINAL_CONFIG.style.title.color,
                        }"
                    >
                        {{ FINAL_CONFIG.style.title.text }}
                    </span>
                    <template v-if="FINAL_CONFIG.style.title.subtitle.text">
                        <br />
                        <span
                            :style="{
                                fontSize:
                                    FINAL_CONFIG.style.title.subtitle.fontSize,
                                fontWeight: FINAL_CONFIG.style.title.subtitle
                                    .bold
                                    ? 'bold'
                                    : 'normal',
                                color: FINAL_CONFIG.style.title.subtitle.color,
                            }"
                        >
                            {{ FINAL_CONFIG.style.title.subtitle.text }}
                        </span>
                    </template>
                </caption>
                <!-- TABLE HEAD -->
                <thead
                    id="tableHead"
                    class="vue-ui-table__head"
                    :style="{
                        background: FINAL_CONFIG.style.th.backgroundColor,
                        boxShadow: `-1px 0 0 ${FINAL_CONFIG.style.th.backgroundColor}`,
                        top: exportButtonTop - 3 + 'px',
                    }"
                >
                    <!-- HEADERS -->
                    <tr>
                        <th class="invisible-cell"></th>
                        <th
                            v-for="(th, i) in tableHead"
                            :key="`thead_${i}`"
                            :style="`overflow: visible;background:${FINAL_CONFIG.style.th.backgroundColor};color:${FINAL_CONFIG.style.th.color};outline:${FINAL_CONFIG.style.th.outline}`"
                            :class="{ 'th-has-nan': hasNaN[i] }"
                        >
                            <span
                                v-if="
                                    hasNumericTypes &&
                                    ([constants.TEXT, constants.DATE].includes(
                                        th.type,
                                    ) ||
                                        th.isPercentage)
                                "
                                >{{ th.name }}
                                <span v-if="th.isPercentage">
                                    / {{ th.percentageTo }}
                                </span>
                            </span>
                            <span v-else>{{ th.name }}</span>
                        </th>
                    </tr>
                    <template v-if="hasNumericTypes">
                        <!-- SUM -->
                        <tr>
                            <th class="invisible-cell"></th>
                            <th
                                v-for="(th, i) in tableHead"
                                :key="`thead_${i}`"
                                :class="{
                                    'th-numeric': true,
                                    'th-has-nan': hasNaN[i],
                                }"
                                :style="`background:${FINAL_CONFIG.style.th.backgroundColor};color:${FINAL_CONFIG.style.th.color};outline:${FINAL_CONFIG.style.th.outline}`"
                            >
                                <span
                                    v-if="th.sum && !hasNaN[i]"
                                    style="
                                        display: flex;
                                        align-items: center;
                                        justify-content: flex-end;
                                    "
                                >
                                    <span
                                        v-html="icons.sum"
                                        style="
                                            margin-bottom: -4px;
                                            margin-right: 3px;
                                        "
                                    />
                                    {{
                                        dataLabel({
                                            p: th.prefix,
                                            v: Number(getSum(i)),
                                            s: th.suffix,
                                            r: th.decimals,
                                        })
                                    }}
                                    <span
                                        v-if="
                                            percentages[i] &&
                                            th.percentageTo &&
                                            !th.isPercentage
                                        "
                                        style="margin-left: 3px"
                                    >
                                        ({{
                                            isNaN(
                                                getSum(i) /
                                                    getSum(
                                                        percentages[i]
                                                            .referenceIndex,
                                                    ),
                                            )
                                                ? '-'
                                                : dataLabel({
                                                      v:
                                                          (getSum(i) /
                                                              getSum(
                                                                  percentages[i]
                                                                      .referenceIndex,
                                                              )) *
                                                          100,
                                                      s: '%',
                                                      r: th.decimals,
                                                  })
                                        }})
                                    </span>
                                </span>
                            </th>
                        </tr>

                        <!-- AVERAGE -->
                        <tr>
                            <th class="invisible-cell"></th>
                            <th
                                v-for="(th, i) in tableHead"
                                :key="`thead_${i}`"
                                :class="{
                                    'th-numeric': true,
                                    'th-has-nan': hasNaN[i],
                                }"
                                :style="`background:${FINAL_CONFIG.style.th.backgroundColor};color:${FINAL_CONFIG.style.th.color};outline:${FINAL_CONFIG.style.th.outline}`"
                            >
                                <span v-if="th.average && !hasNaN[i]">
                                    ~
                                    {{
                                        isNaN(getAverage(i))
                                            ? ''
                                            : dataLabel({
                                                  p: th.prefix,
                                                  v: Number(getAverage(i)),
                                                  s: th.suffix,
                                                  r: th.decimals,
                                              })
                                    }}
                                </span>
                            </th>
                        </tr>

                        <!-- FILTERS & SORTS -->
                        <tr>
                            <th class="invisible-cell"></th>
                            <th
                                v-for="(th, i) in tableHead"
                                :key="`thead_${i}`"
                                :class="{ 'th-has-nan': hasNaN[i] }"
                                :style="`background:${FINAL_CONFIG.style.th.backgroundColor};color:${FINAL_CONFIG.style.th.color};outline:${FINAL_CONFIG.style.th.outline}`"
                            >
                                <div class="th-filter">
                                    <!-- DATE -->
                                    <template
                                        v-if="
                                            th.type === constants.DATE &&
                                            dates[i]
                                        "
                                    >
                                        <div class="th-date">
                                            <div class="date-wrapper--inputs">
                                                <div class="date-fieldset">
                                                    <label :for="`from_${i}`">
                                                        {{
                                                            FINAL_CONFIG
                                                                .translations
                                                                .from
                                                        }}
                                                    </label>
                                                    <input
                                                        :id="`from_${i}`"
                                                        type="date"
                                                        v-model="dates[i].from"
                                                        @input="
                                                            filterBody();
                                                            setFilterDatesIndexes(
                                                                i,
                                                            );
                                                        "
                                                        :style="`background:${FINAL_CONFIG.style.inputs.backgroundColor};color:${FINAL_CONFIG.style.inputs.color};border:${FINAL_CONFIG.style.inputs.border}`"
                                                    />
                                                </div>
                                                <div class="date-fieldset">
                                                    <label :for="`to_${i}`">
                                                        {{
                                                            FINAL_CONFIG
                                                                .translations.to
                                                        }}
                                                    </label>
                                                    <input
                                                        :id="`to_${i}`"
                                                        type="date"
                                                        v-model="dates[i].to"
                                                        @input="
                                                            filterBody();
                                                            setFilterDatesIndexes(
                                                                i,
                                                            );
                                                        "
                                                        :style="`background:${FINAL_CONFIG.style.inputs.backgroundColor};color:${FINAL_CONFIG.style.inputs.color};border:${FINAL_CONFIG.style.inputs.border}`"
                                                    />
                                                </div>
                                            </div>
                                            <div class="date-wrapper--button">
                                                <button
                                                    v-if="th.isSort"
                                                    @click="sortTh(i, $event)"
                                                    :class="{
                                                        'th-button-active': [
                                                            constants.DESC,
                                                            constants.ASC,
                                                        ].includes(sorts[i]),
                                                    }"
                                                    :style="`cursor:${isCursorPointer ? 'pointer' : 'default'}; background:${[constants.DESC, constants.ASC].includes(sorts[i]) ? '' : FINAL_CONFIG.style.th.buttons.filter.inactive.backgroundColor};color:${[constants.DESC, constants.ASC].includes(sorts[i]) ? '' : FINAL_CONFIG.style.th.buttons.filter.inactive.color}`"
                                                >
                                                    <span
                                                        v-if="
                                                            sorts[i] ===
                                                            constants.ASC
                                                        "
                                                        v-html="
                                                            [
                                                                constants.DATE,
                                                            ].includes(th.type)
                                                                ? icons.sort09
                                                                : icons.sortAZ
                                                        "
                                                    />
                                                    <span
                                                        v-else-if="
                                                            sorts[i] ===
                                                            constants.DESC
                                                        "
                                                        v-html="
                                                            [
                                                                constants.DATE,
                                                            ].includes(th.type)
                                                                ? icons.sort90
                                                                : icons.sortZA
                                                        "
                                                    />
                                                    <span
                                                        v-else
                                                        v-html="icons.arrowSort"
                                                    />
                                                </button>
                                                <button
                                                    @click="
                                                        resetDates(i);
                                                        resetFilter(
                                                            i,
                                                            th,
                                                            $event,
                                                        );
                                                    "
                                                    :disabled="
                                                        !filteredDatesIndexes[
                                                            i
                                                        ] &&
                                                        isResetDisabled(i, th)
                                                    "
                                                    class="th-reset"
                                                    :style="{
                                                        cursor: isCursorPointer
                                                            ? 'pointer'
                                                            : 'default',
                                                    }"
                                                >
                                                    ✖
                                                </button>
                                            </div>
                                        </div>
                                    </template>

                                    <!-- SEARCH -->
                                    <input
                                        v-if="th.isSearch"
                                        :placeholder="
                                            FINAL_CONFIG.translations
                                                .inputPlaceholder
                                        "
                                        v-model="searches[i]"
                                        @input="debounce(filterBody, 400)"
                                        :name="`search_${i}`"
                                        :style="`background:${FINAL_CONFIG.style.inputs.backgroundColor};color:${FINAL_CONFIG.style.inputs.color};border:${FINAL_CONFIG.style.inputs.border}`"
                                    />
                                    <!-- SORT -->
                                    <button
                                        v-if="
                                            !hasNaN[i] &&
                                            th.isSort &&
                                            th.type !== constants.DATE
                                        "
                                        @click="sortTh(i, $event)"
                                        :class="{
                                            'th-button-active': [
                                                constants.DESC,
                                                constants.ASC,
                                            ].includes(sorts[i]),
                                        }"
                                        :style="`cursor:${isCursorPointer ? 'pointer' : 'default'};background:${[constants.DESC, constants.ASC].includes(sorts[i]) ? '' : FINAL_CONFIG.style.th.buttons.filter.inactive.backgroundColor};color:${[constants.DESC, constants.ASC].includes(sorts[i]) ? '' : FINAL_CONFIG.style.th.buttons.filter.inactive.color}`"
                                    >
                                        <span
                                            v-if="sorts[i] === constants.ASC"
                                            v-html="
                                                [constants.NUMERIC].includes(
                                                    th.type,
                                                )
                                                    ? icons.sort09
                                                    : icons.sortZA
                                            "
                                        />
                                        <span
                                            v-else-if="
                                                sorts[i] === constants.DESC
                                            "
                                            v-html="
                                                [constants.NUMERIC].includes(
                                                    th.type,
                                                )
                                                    ? icons.sort90
                                                    : icons.sortAZ
                                            "
                                        />
                                        <span v-else v-html="icons.arrowSort" />
                                    </button>

                                    <!-- TOGGLE MULTISELECT -->
                                    <button
                                        v-if="th.isMultiselect"
                                        @click="
                                            toggleMultiselect(i, th, $event)
                                        "
                                        v-html="icons.filter"
                                        :class="{
                                            'th-button-active':
                                                multiselects[i] &&
                                                multiselects[i].length !==
                                                    getDropdownOptions(i)
                                                        .length,
                                        }"
                                        :style="`cursor:${isCursorPointer ? 'pointer' : 'default'};background:${multiselects[i] && multiselects[i].length !== getDropdownOptions(i).length ? '' : FINAL_CONFIG.style.th.buttons.filter.inactive.backgroundColor};color:${multiselects[i] && multiselects[i].length !== getDropdownOptions(i).length ? '' : FINAL_CONFIG.style.th.buttons.filter.inactive.color}`"
                                    />

                                    <!-- SHOW CHART -->
                                    <button
                                        v-if="
                                            currentSelectionSpan.col === i &&
                                            canChart
                                        "
                                        @click="showChart = !showChart"
                                        v-html="icons.chart"
                                        :class="{
                                            'th-button-active': showChart,
                                        }"
                                        :style="`cursor:${isCursorPointer ? 'pointer' : 'default'};background:${showChart ? '' : FINAL_CONFIG.style.th.buttons.filter.inactive.backgroundColor};color:${showChart ? '' : FINAL_CONFIG.style.th.buttons.filter.inactive.color}`"
                                    />

                                    <div
                                        v-if="
                                            th.rangeFilter &&
                                            rangeFilters[i] &&
                                            !hasNaN[i]
                                        "
                                        class="th-range-filter"
                                    >
                                        <label :for="`rangeMin${i}`"
                                            ><span style="color: grey">ᒥ</span>
                                            min
                                            <span style="color: grey"
                                                >ᒣ</span
                                            ></label
                                        >
                                        <input
                                            type="number"
                                            :id="`rangeMin${i}`"
                                            :max="immutableRangeFilters[i].max"
                                            :min="immutableRangeFilters[i].min"
                                            v-model.number="rangeFilters[i].min"
                                            @input="debounce(filterBody, 400)"
                                            :style="`background:${FINAL_CONFIG.style.inputs.backgroundColor};color:${FINAL_CONFIG.style.inputs.color};border:${FINAL_CONFIG.style.inputs.border}`"
                                        />
                                        <input
                                            type="number"
                                            :id="`rangeMax${i}`"
                                            :max="immutableRangeFilters[i].max"
                                            :min="immutableRangeFilters[i].min"
                                            v-model.number="rangeFilters[i].max"
                                            @input="debounce(filterBody, 400)"
                                            :style="`background:${FINAL_CONFIG.style.inputs.backgroundColor};color:${FINAL_CONFIG.style.inputs.color};border:${FINAL_CONFIG.style.inputs.border}`"
                                        />
                                        <label :for="`rangeMax${i}`"
                                            ><span style="color: grey">ᒪ</span>
                                            max
                                            <span style="color: grey"
                                                >ᒧ</span
                                            ></label
                                        >
                                    </div>

                                    <!-- RESET -->
                                    <button
                                        v-if="canResetColumn(i, th)"
                                        @click="resetFilter(i, th, $event)"
                                        :disabled="isResetDisabled(i, th)"
                                        class="th-reset"
                                        :style="{
                                            cursor: isCursorPointer
                                                ? 'pointer'
                                                : 'default',
                                        }"
                                    >
                                        ✖
                                    </button>

                                    <!-- MULTISELECT DROPDOWN -->
                                    <div
                                        class="th-dropdown"
                                        v-if="th.isMultiselect"
                                        data-is-open="false"
                                        :id="`th_dropdown_${i}`"
                                        :style="`background:${FINAL_CONFIG.style.dropdowns.backgroundColor};color:${FINAL_CONFIG.style.dropdowns.color}`"
                                    >
                                        <button
                                            class="close-dropdown"
                                            @click="
                                                toggleMultiselect(i, th, $event)
                                            "
                                            :style="`cursor:${isCursorPointer ? 'pointer' : 'default'};background:${FINAL_CONFIG.style.closeButtons.backgroundColor};color:${FINAL_CONFIG.style.closeButtons.color}`"
                                        >
                                            ✖
                                        </button>
                                        <span
                                            class="th-option"
                                            v-for="(
                                                option, j
                                            ) in getDropdownOptions(i)"
                                            :key="`th_option_${i}_${j}`"
                                            @click="
                                                selectDropdownOption(option, i)
                                            "
                                            @keyup.enter="
                                                selectDropdownOption(option, i)
                                            "
                                            @keyup.space="
                                                selectDropdownOption(option, i)
                                            "
                                            :style="`opacity:${isDropdownOptionSelected(option, i) ? 1 : 0.5}`"
                                            tabindex="0"
                                        >
                                            <span
                                                v-if="
                                                    isDropdownOptionSelected(
                                                        option,
                                                        i,
                                                    )
                                                "
                                                :style="`color:${FINAL_CONFIG.style.dropdowns.icons.selected.color};margin-right:5px`"
                                                class="th-icon-green"
                                            >
                                                {{
                                                    FINAL_CONFIG.style.dropdowns
                                                        .icons.selected.unicode
                                                }}
                                            </span>
                                            <span
                                                v-else
                                                :style="`color:${FINAL_CONFIG.style.dropdowns.icons.unselected.color};margin-right:5px`"
                                                class="th-icon-red"
                                            >
                                                {{
                                                    FINAL_CONFIG.style.dropdowns
                                                        .icons.unselected
                                                        .unicode
                                                }}
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
                            :class="{
                                'vue-ui-table-col-selector': !hasNaN[i],
                                'th-has-nan': hasNaN[i],
                            }"
                            :style="`background:${i === selectedColumn && !hasNaN[i] ? FINAL_CONFIG.style.th.selected.backgroundColor : FINAL_CONFIG.style.th.backgroundColor};color:${i === selectedColumn && !hasNaN[i] ? FINAL_CONFIG.style.th.selected.color : FINAL_CONFIG.style.th.color};outline:${FINAL_CONFIG.style.th.outline}`"
                        >
                            <div
                                v-if="!hasNaN[i]"
                                v-html="
                                    tableHead[i].type === constants.NUMERIC
                                        ? icons.chevronDown
                                        : ''
                                "
                                :class="{
                                    'col-selector':
                                        tableHead[i].type === constants.NUMERIC,
                                }"
                                tabindex="0"
                                :style="{
                                    cursor: isCursorPointer
                                        ? 'pointer'
                                        : 'default',
                                }"
                                @click.stop="selectColumn(i)"
                                @keyup.enter="selectColumn(i)"
                            />
                        </th>
                    </tr>
                </thead>

                <!-- TABLE BODY -->
                <tbody
                    @click="closeAllDropdowns"
                    @keydown="navigateCell($event)"
                >
                    <tr
                        v-for="(tr, i) in visibleRows"
                        :key="`tbody_${i}`"
                        :data-row="i % 2 === 0 ? 'odd' : 'even'"
                        :class="`tr_${uid}`"
                        :style="`${i % 2 === 0 ? `background:${FINAL_CONFIG.style.rows.odd.backgroundColor};color:${FINAL_CONFIG.style.rows.odd.color}` : `background:${FINAL_CONFIG.style.rows.even.backgroundColor};color:${FINAL_CONFIG.style.rows.even.color}`}`"
                    >
                        <td
                            class="vue-ui-table-td-iteration"
                            :data-row="i % 2 === 0 ? 'odd' : 'even'"
                            :style="{
                                outline: FINAL_CONFIG.style.rows.outline,
                            }"
                        >
                            {{ tr.absoluteIndex + 1 }}
                        </td>
                        <td
                            :data-row="i % 2 === 0 ? 'odd' : 'even'"
                            v-for="(td, j) in tr.td"
                            :key="`td_${i}_${j}`"
                            :style="
                                isNumeric(td) ||
                                dataset.header[j].type === constants.DATE
                                    ? `text-align:right;font-variant-numeric: tabular-nums;outline:${FINAL_CONFIG.style.rows.outline}`
                                    : `outline:${FINAL_CONFIG.style.rows.outline}`
                            "
                            @click="
                                selectTd({
                                    td,
                                    rowIndex: i,
                                    colIndex: j,
                                    headerType: dataset.header[j].type,
                                    event: $event,
                                })
                            "
                            @keyup.enter="
                                selectTd({
                                    td,
                                    rowIndex: i,
                                    colIndex: j,
                                    headerType: dataset.header[j].type,
                                    event: $event,
                                })
                            "
                            @keyup.space="
                                selectTd({
                                    td,
                                    rowIndex: i,
                                    colIndex: j,
                                    headerType: dataset.header[j].type,
                                    event: $event,
                                })
                            "
                            :class="{
                                'td-numeric':
                                    dataset.header[j].type ===
                                    constants.NUMERIC,
                                'td-focusable': true,
                                'td-has-nan': hasNaN[j],
                            }"
                            :id="`cell_${i}_${j}_${uid}`"
                            tabindex="0"
                        >
                            <!-- ICON -->
                            <span
                                v-if="
                                    tr.meta &&
                                    tr.meta.markerIndices.includes(j) &&
                                    tr.meta.unicodeIcon
                                "
                                :style="`color:${tr.meta.color};margin-right:3px`"
                                v-html="tr.meta.unicodeIcon"
                            />

                            <!-- DATE -->
                            <span
                                v-if="dataset.header[j].type === constants.DATE"
                            >
                                {{ dataset.header[j].prefix }}
                                {{ new Date(td).toLocaleString().slice(0, 10) }}
                                {{ dataset.header[j].suffix }}
                            </span>

                            <!-- PERCENTAGE -->
                            <span v-else-if="dataset.header[j].isPercentage">
                                {{
                                    dataLabel({
                                        v: Number(td * 100),
                                        s: '%',
                                        r: dataset.header[j].decimals,
                                    })
                                }}
                            </span>

                            <!-- NUMERIC VALUE WITH PERCENTAGE TO SUM OF ANOTHER COL -->
                            <span
                                v-else-if="
                                    percentages[j] &&
                                    dataset.header[j].percentageTo &&
                                    !dataset.header[j].isPercentage
                                "
                                :class="{ 'td-nan': isNaN(Number(td)) }"
                            >
                                {{
                                    isNaN(Number(td))
                                        ? `${td} is not ${constants.NUMERIC}`
                                        : dataLabel({
                                              p: dataset.header[j].prefix,
                                              v: Number(td),
                                              s: dataset.header[j].suffix,
                                              r: dataset.header[j].decimals,
                                          })
                                }}
                                ({{
                                    isNaN(Number(td))
                                        ? ''
                                        : dataLabel({
                                              v: Number(
                                                  (td /
                                                      getSum(
                                                          percentages[j]
                                                              .referenceIndex,
                                                      )) *
                                                      100,
                                              ),
                                              s: '%',
                                              r: dataset.header[j].decimals,
                                          })
                                }})
                            </span>

                            <!-- NUMERIC -->
                            <span
                                v-else-if="
                                    dataset.header[j].type === constants.NUMERIC
                                "
                                :class="{ 'td-nan': isNaN(Number(td)) }"
                            >
                                {{
                                    isNaN(Number(td))
                                        ? `${td} is not ${constants.NUMERIC}`
                                        : dataLabel({
                                              p: dataset.header[j].prefix,
                                              v: Number(
                                                  td.toFixed(
                                                      dataset.header[j]
                                                          .decimals,
                                                  ),
                                              ),
                                              s: dataset.header[j].suffix,
                                              r: dataset.header[j].decimals,
                                          })
                                }}
                            </span>

                            <!-- ALL OTHER -->
                            <span v-else>
                                {{ dataset.header[j].prefix }}
                                {{ td }}
                                {{ dataset.header[j].suffix }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- INFO BAR (active if numeric cells are selected) -->
        <div
            :class="{
                'td-selector-info': true,
                'td-selector-info--active':
                    currentSelectionSpan.col !== undefined &&
                    currentSelectionSpan.rows.length,
            }"
            :style="`background:${FINAL_CONFIG.style.infoBar.backgroundColor};color:${FINAL_CONFIG.style.infoBar.color}`"
        >
            <template
                v-if="
                    currentSelectionSpan.col !== undefined &&
                    currentSelectionSpan.rows.length
                "
            >
                <div v-html="icons.table" class="td-selector-icon" />
                <span>
                    <!-- NAME OF SELECTED COLUMN -->
                    <b>
                        {{ dataset.header[currentSelectionSpan.col].name }}
                        <span
                            v-if="
                                dataset.header[currentSelectionSpan.col]
                                    .isPercentage
                            "
                        >
                            /
                            {{
                                dataset.header[
                                    percentages[currentSelectionSpan.col]
                                        .referenceIndex
                                ].name
                            }}
                        </span>
                    </b>

                    <!-- NB OF SELECTED CELLS -->
                    <span style="margin-left: 12px">
                        {{ FINAL_CONFIG.translations.nb }} :
                        <b class="format-num">{{
                            currentSelectionSpan.rows.length
                        }}</b>
                    </span>

                    <!-- SUM OF SELECTED CELLS -->
                    <span style="margin-left: 12px">
                        {{ FINAL_CONFIG.translations.sum }} :
                        <b
                            class="format-num"
                            v-if="
                                dataset.header[currentSelectionSpan.col]
                                    .isPercentage
                            "
                        >
                            {{ selectedCellsCalculations.sumPercentage }}
                        </b>
                        <b v-else class="format-num">
                            {{
                                dataset.header[currentSelectionSpan.col].prefix
                            }}
                            {{ selectedCellsCalculations.sumRegular }}
                            {{
                                dataset.header[currentSelectionSpan.col].suffix
                            }}
                        </b>
                        <b
                            v-if="
                                dataset.header[currentSelectionSpan.col]
                                    .isPercentage
                            "
                            >%</b
                        >
                    </span>

                    <!-- AVERAGE OF SELECTED CELLS -->
                    <span style="margin-left: 12px">
                        {{ FINAL_CONFIG.translations.average }} :
                        <b
                            v-if="
                                dataset.header[currentSelectionSpan.col]
                                    .isPercentage
                            "
                            class="format-num"
                        >
                            {{ selectedCellsCalculations.averagePercentage }}
                        </b>
                        <b v-else class="format-num">
                            {{
                                dataset.header[currentSelectionSpan.col].prefix
                            }}
                            {{ selectedCellsCalculations.averageRegular }}
                            {{
                                dataset.header[currentSelectionSpan.col].suffix
                            }}
                        </b>
                        <b
                            v-if="
                                dataset.header[currentSelectionSpan.col]
                                    .isPercentage
                            "
                            >%</b
                        >
                    </span>
                </span>
                <button
                    @click="resetSelection"
                    class="td-selector-info-reset"
                    :style="`cursor:${isCursorPointer ? 'pointer' : 'default'};background:${FINAL_CONFIG.style.closeButtons.backgroundColor};color:${FINAL_CONFIG.style.closeButtons.color};border-radius:${FINAL_CONFIG.style.closeButtons.borderRadius}`"
                >
                    ✖
                </button>
            </template>
        </div>

        <!-- PAGINATOR -->
        <div
            class="vue-ui-table-paginator format-num"
            v-if="bodyCopy.length > 10"
        >
            {{ FINAL_CONFIG.translations.totalRows }} :
            {{ dataset.body.length }} |
            {{ FINAL_CONFIG.translations.paginatorLabel }} :
            <select
                id="paginatorSelector"
                v-model.number="itemsPerPage"
                v-if="bodyCopy.length > 10"
                @change="
                    resetSelection();
                    onPageChange();
                "
                :style="`background:${FINAL_CONFIG.style.inputs.backgroundColor};color:${FINAL_CONFIG.style.inputs.color};border:${FINAL_CONFIG.style.inputs.border}`"
            >
                <template v-for="(option, i) in paginatorOptions">
                    <option
                        :key="`paginator_option_${i}`"
                        v-if="
                            bodyCopy.length > option ||
                            dataset.body.length === option
                        "
                    >
                        {{ option }}
                    </option>
                </template>
            </select>
        </div>
        <div class="vue-ui-table-size-warning" v-if="itemsPerPage >= 250">
            <span v-html="icons.warning" />{{
                FINAL_CONFIG.translations.sizeWarning
            }}
        </div>

        <!-- PAGINATION -->
        <div
            class="vue-ui-table-navigation-indicator"
            v-if="pages.length > 1 && pages.length <= 10"
            :style="`background:${FINAL_CONFIG.style.pagination.navigationIndicator.backgroundColor};width:calc(${(currentPage / (pages.length - 1)) * 100}%)`"
        />
        <div class="vue-ui-table-pagination format-num" v-if="pages.length > 1">
            <!-- PREVIOUS PAGE -->
            <button
                class="vue-ui-table-navigation"
                @click.stop="navigate('previous')"
                v-html="icons.chevronLeft"
                :disabled="currentPage === 0"
                :style="`cursor:${isCursorPointer ? 'pointer' : 'default'};background:${FINAL_CONFIG.style.pagination.buttons.backgroundColor};color:${FINAL_CONFIG.style.pagination.buttons.color};opacity:${currentPage === 0 ? FINAL_CONFIG.style.pagination.buttons.opacityDisabled : 1}`"
            />
            <template v-if="pages.length > 3">
                <!-- FIRST PAGE -->
                <button
                    class="vue-ui-table-navigation"
                    @click.stop="navigate(1)"
                    :disabled="currentPage === 0"
                    :style="`cursor:${isCursorPointer ? 'pointer' : 'default'};background:${FINAL_CONFIG.style.pagination.buttons.backgroundColor};color:${FINAL_CONFIG.style.pagination.buttons.color};opacity:${currentPage === 0 ? FINAL_CONFIG.style.pagination.buttons.opacityDisabled : 1}`"
                >
                    1
                </button>
                <!-- PAGE SCROLLER -->
                <div
                    v-if="pages.length > 10"
                    class="vue-ui-table-page-scroller-wrapper"
                    :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
                >
                    <label for="pageScroller" style="font-size: 14px">
                        {{ FINAL_CONFIG.translations.page }}
                        {{ currentPage + 1 }} / {{ pages.length }}
                    </label>
                    <input
                        class="vue-ui-table-page-scroller"
                        id="pageScroller"
                        type="range"
                        step="1"
                        :min="0"
                        :max="pages.length - 1"
                        @input="updateCurrentPage($event)"
                        :value="currentPage"
                        :style="`background:${FINAL_CONFIG.style.inputs.backgroundColor};color:${FINAL_CONFIG.style.inputs.color};border:${FINAL_CONFIG.style.inputs.border};accent-color:${FINAL_CONFIG.style.inputs.accentColor}`"
                    />
                </div>
                <span v-else>
                    {{ FINAL_CONFIG.translations.page }}
                    {{ currentPage + 1 }} / {{ pages.length }}
                </span>
                <!-- LAST PAGE -->
                <button
                    class="vue-ui-table-navigation"
                    @click.stop="navigate(pages.length)"
                    :disabled="currentPage === pages.length - 1"
                    :style="`cursor:${isCursorPointer ? 'pointer' : 'default'};background:${FINAL_CONFIG.style.pagination.buttons.backgroundColor};color:${FINAL_CONFIG.style.pagination.buttons.color};opacity:${currentPage === pages.length - 1 ? FINAL_CONFIG.style.pagination.buttons.opacityDisabled : 1}`"
                >
                    {{ pages.length }}
                </button>
            </template>
            <template v-else>
                {{ FINAL_CONFIG.translations.page }}
                {{ currentPage + 1 }} / {{ pages.length }}
            </template>
            <!-- NEXT PAGE -->
            <button
                class="vue-ui-table-navigation"
                @click.stop="navigate('next')"
                v-html="icons.chevronRight"
                :disabled="currentPage === pages.length - 1"
                :style="`cursor:${isCursorPointer ? 'pointer' : 'default'};background:${FINAL_CONFIG.style.pagination.buttons.backgroundColor};color:${FINAL_CONFIG.style.pagination.buttons.color};opacity:${currentPage === pages.length - 1 ? FINAL_CONFIG.style.pagination.buttons.opacityDisabled : 1}`"
            />
        </div>

        <!-- CHART MODAL -->
        <BaseDraggableDialog
            ref="chartModal"
            :backgroundColor="FINAL_CONFIG.style.chart.modal.backgroundColor"
            :headerColor="FINAL_CONFIG.style.chart.modal.color"
            :color="FINAL_CONFIG.style.chart.modal.color"
            :forcedHeight="500"
            :isCursorPointer="isCursorPointer"
            withPadding
            withFullWidth
            noLayerUpdate
            @close="showChart = false"
            @size="setChartModalDimensions"
        >
            <template #before>
                <div class="vue-ui-table-chart-modal-options">
                    <button
                        v-if="availableDonutCategories.length"
                        @click="showDonutOptions = true"
                        v-html="icons.donut"
                        :class="{
                            'is-active-chart':
                                chart.type === constants.DONUT ||
                                showDonutOptions,
                        }"
                        :style="`cursor:${isCursorPointer ? 'pointer' : 'default'};background:${chart.type === constants.DONUT || showDonutOptions ? FINAL_CONFIG.style.chart.modal.buttons.selected.backgroundColor : FINAL_CONFIG.style.chart.modal.buttons.unselected.backgroundColor};color:${chart.type === constants.DONUT || showDonutOptions ? FINAL_CONFIG.style.chart.modal.buttons.selected.color : FINAL_CONFIG.style.chart.modal.buttons.unselected.color}`"
                    />
                    <button
                        @click="
                            chart.type = constants.LINE;
                            showDonutOptions = false;
                        "
                        v-html="icons.chart"
                        :class="{
                            'is-active-chart':
                                chart.type === constants.LINE &&
                                !showDonutOptions,
                        }"
                        :style="`cursor:${isCursorPointer ? 'pointer' : 'default'};background:${chart.type === constants.LINE && !showDonutOptions ? FINAL_CONFIG.style.chart.modal.buttons.selected.backgroundColor : FINAL_CONFIG.style.chart.modal.buttons.unselected.backgroundColor};color:${chart.type === constants.LINE && !showDonutOptions ? FINAL_CONFIG.style.chart.modal.buttons.selected.color : FINAL_CONFIG.style.chart.modal.buttons.unselected.color}`"
                    />
                    <button
                        @click="
                            chart.type = constants.BAR;
                            showDonutOptions = false;
                        "
                        v-html="icons.bar"
                        :class="{
                            'is-active-chart':
                                chart.type === constants.BAR &&
                                !showDonutOptions,
                        }"
                        :style="`cursor:${isCursorPointer ? 'pointer' : 'default'};background:${chart.type === constants.BAR && !showDonutOptions ? FINAL_CONFIG.style.chart.modal.buttons.selected.backgroundColor : FINAL_CONFIG.style.chart.modal.buttons.unselected.backgroundColor};color:${chart.type === constants.BAR && !showDonutOptions ? FINAL_CONFIG.style.chart.modal.buttons.selected.color : FINAL_CONFIG.style.chart.modal.buttons.unselected.color}`"
                    />
                </div>
            </template>

            <template #content>
                <div style="width: 100%; height: fit-content">
                    <!-- DONUT OPTIONS -->
                    <div
                        v-if="
                            showDonutOptions && availableDonutCategories.length
                        "
                        :style="`background:${FINAL_CONFIG.style.chart.modal.backgroundColor};color:${FINAL_CONFIG.style.chart.modal.color}`"
                    >
                        <fieldset class="vue-ui-table-fieldset">
                            <legend>
                                {{
                                    FINAL_CONFIG.translations
                                        .chooseCategoryColumn
                                }}
                            </legend>
                            <div class="vue-ui-table-fieldset-wrapper">
                                <template
                                    v-for="(
                                        option, i
                                    ) in availableDonutCategories"
                                    :key="`donut_radio_${i}`"
                                >
                                    <div class="vue-ui-table-fieldset-option">
                                        <input
                                            type="radio"
                                            :name="option.name"
                                            :id="option.name"
                                            :checked="
                                                selectedDonutCategory &&
                                                option.name ===
                                                    selectedDonutCategory.name
                                            "
                                            @input="
                                                selectedDonutCategory =
                                                    availableDonutCategories[i]
                                            "
                                            :style="`background:${FINAL_CONFIG.style.inputs.backgroundColor};color:${FINAL_CONFIG.style.inputs.color};border:${FINAL_CONFIG.style.inputs.border};accent-color:${FINAL_CONFIG.style.inputs.accentColor}`"
                                        />
                                        <label :for="option.name">
                                            {{ option.name }}
                                        </label>
                                    </div>
                                </template>
                            </div>
                            <button
                                class="vue-ui-table-generate-donut"
                                :disabled="!selectedDonutCategory"
                                @click="applyDonutOption"
                                :style="`cursor:${isCursorPointer ? 'pointer' : 'default'};background:${FINAL_CONFIG.style.chart.modal.buttons.selected.backgroundColor};color:${FINAL_CONFIG.style.chart.modal.buttons.selected.color}`"
                            >
                                <div
                                    style="margin-bottom: -3px"
                                    v-html="icons.donut"
                                />
                                {{ FINAL_CONFIG.translations.makeDonut }}
                            </button>
                        </fieldset>
                    </div>

                    <!-- BAR | LINE CHARTS -->
                    <template
                        v-if="
                            [constants.BAR, constants.LINE].includes(
                                chart.type,
                            ) && !showDonutOptions
                        "
                    >
                        <label
                            v-if="chartTimeLabelOptions.length > 1"
                            :style="{
                                color: FINAL_CONFIG.style.chart.modal.color,
                            }"
                        >
                            {{ FINAL_CONFIG.translations.xAxisLabels }}
                            <select v-model="chartTimeLabelSourceModel">
                                <option v-for="opt in chartTimeLabelOptions">
                                    {{ opt }}
                                </option>
                            </select>
                        </label>
                        <div style="width: 100%; margin-bottom: 12px">
                            <VueUiXy
                                :key="`chart_line_${chartStep}`"
                                :dataset="chartData.xyDatasetLine"
                                :config="chartData.xyConfig"
                                v-if="chart.type === constants.LINE"
                            />
                            <VueUiXy
                                :key="`chart_bar_${chartStep}`"
                                :dataset="chartData.xyDatasetBar"
                                :config="chartData.xyConfig"
                                v-if="chart.type === constants.BAR"
                            />
                        </div>
                        <div
                            v-if="currentSelectionSpan.rows.length >= 2"
                            class="chart-trend"
                            :style="`color:${FINAL_CONFIG.style.chart.modal.color}`"
                        >
                            <span>---</span> Trend:
                            {{
                                dataLabel({
                                    v: chartData.progression.trend * 100,
                                    s: '%',
                                    r: 1,
                                })
                            }}
                        </div>
                    </template>

                    <!-- DONUT CHART -->
                    <template
                        v-if="
                            [constants.DONUT].includes(chart.type) &&
                            !showDonutOptions
                        "
                    >
                        <div style="width: 100%; margin-bottom: 32px">
                            <VueUiDonut
                                :dataset="currentDonut"
                                :config="chartData.donutConfig"
                            />
                        </div>
                    </template>
                </div>
            </template>
        </BaseDraggableDialog>
    </div>
</template>

<script setup>
import {
    adaptColorToBackground,
    calcLinearProgression,
    convertConfigColors,
    createCsvContent,
    dataLabel,
    downloadCsv,
    lightenHexColor,
    palette,
    treeShake,
    setOpacity,
    createUid,
} from '../lib';
import { useConfig } from '../useConfig';
import VueUiXy from './vue-ui-xy.vue';
import VueUiDonut from './vue-ui-donut.vue';
import BaseIcon from '../atoms/BaseIcon.vue';
import {
    computed,
    ref,
    nextTick,
    onMounted,
    watch,
    defineAsyncComponent,
} from 'vue';

const BaseDraggableDialog = defineAsyncComponent(
    () => import('../atoms/BaseDraggableDialog.vue'),
);

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {};
        },
    },
    dataset: {
        type: Object,
        default() {
            return {};
        },
    },
});

const emit = defineEmits(['page-change']);

const { vue_ui_table: DEFAULT_CONFIG } = useConfig();

const uid = createUid();
const rafId = ref(null);
const tableCaption = ref(null);
const buttonTimeout = ref(null);
const chart = ref({
    height: 316,
    type: 'bar',
    width: 512,
});
const constants = ref({
    ASC: 1,
    BAR: 'bar',
    DATE: 'date',
    DESC: -1,
    DONUT: 'donut',
    LINE: 'line',
    NUMERIC: 'numeric',
    PERCENTAGE: 'percentage',
    TEXT: 'text',
});

const clientX = ref(100);
const clientY = ref(100);
const dragOffsetX = ref(0);
const dragOffsetY = ref(0);
const modalWidth = ref(400);
const modalHeight = ref(200);

const cssClass = ref({
    CELL: 'smart-td-selected',
    FIRST_TD: 'smart-td-selected-first',
    LAST_TD: 'smart-td-selected-last',
    ROW: 'smart-td-selected-neighbor',
});

const currentDonut = ref(undefined);
const currentFilter = ref(undefined);

const currentSelectionSpan = ref({
    col: undefined,
    rows: [],
});

const currentPage = ref(0);
const iconSize = ref(20);
const isExportRequest = ref(false);
const isLoading = ref(false);
const dates = ref({});
const hasNaN = ref({});
const filteredDatesIndexes = ref({});
const immutableRangeFilters = ref({});
const multiselects = ref({});
const percentages = ref({});
const rangeFilters = ref({});
const searches = ref({});
const sorts = ref({});
const itemsPerPage = ref(
    props.config.rowsPerPage ? props.config.rowsPerPage : 25,
);
const paginatorOptions = ref(
    [
        ...new Set([
            10,
            25,
            50,
            100,
            250,
            500,
            props.config.rowsPerPage ? props.config.rowsPerPage : 25,
            props.dataset.body.length,
        ]),
    ].sort((a, b) => a - b),
);

const selectedColumn = ref(undefined);
const selectedDonutCategory = ref(undefined);
const selectedPlot = ref(undefined);
const showChart = ref(false);
const chartStep = ref(0);
const chartTimeLabelSourceModel = ref('');
const filename = ref('');
const showDonutOptions = ref(false);

const bodyCopy = ref(
    JSON.parse(JSON.stringify(props.dataset.body)).map((el, i) => {
        return {
            ...el,
            absoluteIndex: i,
        };
    }),
);

const tableBody = ref(
    JSON.parse(JSON.stringify(props.dataset.body)).map((el, i) => {
        return {
            ...el,
            absoluteIndex: i,
        };
    }),
);

const tableHead = ref(
    JSON.parse(JSON.stringify(props.dataset.header)).map((head, i) => {
        return {
            average: Object.hasOwn(head, 'average') ? head.average : false,
            decimals: Object.hasOwn(head, 'decimals') ? head.decimals : 0,
            isMultiselect: Object.hasOwn(head, 'isMultiselect')
                ? head.isMultiselect
                : false,
            isPercentage: Object.hasOwn(head, 'isPercentage')
                ? head.isPercentage
                : false,
            isSearch: Object.hasOwn(head, 'isSearch') ? head.isSearch : false,
            isSort: Object.hasOwn(head, 'isSort') ? head.isSort : false,
            name: head.name, // this attribute is mandatory
            percentageTo: Object.hasOwn(head, 'percentageTo')
                ? head.percentageTo
                : undefined,
            prefix: Object.hasOwn(head, 'prefix') ? head.prefix : '',
            rangeFilter: Object.hasOwn(head, 'rangeFilter')
                ? head.rangeFilter
                : false,
            suffix: Object.hasOwn(head, 'suffix') ? head.suffix : '',
            sum: Object.hasOwn(head, 'sum') ? head.sum : false,
            type: head.type, // this attribute is mandatory
            index: i,
        };
    }),
);

const exportButtonTop = computed(() => {
    if (!tableCaption.value) return 3;
    return tableCaption.value.getBoundingClientRect().height + 3;
});

const FINAL_CONFIG = computed(() => {
    if (!Object.keys(props.config || {}).length) {
        return DEFAULT_CONFIG;
    }
    const reconcilied = treeShake({
        defaultConfig: DEFAULT_CONFIG,
        userConfig: props.config,
    });
    return convertConfigColors(reconcilied);
});

const isCursorPointer = computed(() => FINAL_CONFIG.value.useCursorPointer);
const colorCancelInactive = computed(
    () => FINAL_CONFIG.value.style.th.buttons.cancel.inactive.backgroundColor,
);
const textColorCancelInactive = computed(
    () => FINAL_CONFIG.value.style.th.buttons.cancel.inactive.color,
);
const colorCancelActive = computed(
    () => FINAL_CONFIG.value.style.th.buttons.cancel.active.backgroundColor,
);
const colorButtonSortActive = computed(
    () => FINAL_CONFIG.value.style.th.buttons.filter.active.backgroundColor,
);
const colorButtonSortActiveColorText = computed(
    () => FINAL_CONFIG.value.style.th.buttons.filter.active.color,
);

const colorCancelActiveLight = computed(() =>
    lightenHexColor(colorCancelActive.value, 0.33),
);
const colorCancelActiveOutline = computed(() =>
    setOpacity(colorCancelActive.value, 33),
);
const colorButtonSortActiveLight = computed(() =>
    lightenHexColor(colorButtonSortActive.value, 0.33),
);
const colorButtonSortActiveOutline = computed(() =>
    setOpacity(colorButtonSortActive, 33),
);

const dateHeaders = computed(() =>
    [...tableHead.value].filter((th) => th.type === constants.value.DATE),
);
const chartTimeLabelOptions = computed(() => [
    '',
    ...dateHeaders.value.map((th) => th.name),
]);

const chartTimeLabelSourceIndex = computed(() => {
    const src = dateHeaders.value.find(
        (th) => th.name === chartTimeLabelSourceModel.value,
    );
    return src ? src.index : null;
});

const pages = computed(() => {
    const _pages = [];
    if (bodyCopy.value.length) {
        for (let i = 0; i < bodyCopy.value.length; i += itemsPerPage.value) {
            _pages.push(bodyCopy.value.slice(i, i + itemsPerPage.value));
        }
    }
    return _pages;
});

const visibleRows = computed(() => pages.value[currentPage.value]);

const chartTimeLabels = computed(() => {
    if (chartTimeLabelSourceIndex.value == null) return [];
    return visibleRows.value.map((r) => r.td[chartTimeLabelSourceIndex.value]);
});

const availableDonutCategories = computed(() => {
    return Object.keys(multiselects.value).map((index) => {
        return {
            index,
            name: props.dataset.header[index].name,
            options: multiselects.value[index],
        };
    });
});

const canChart = computed(
    () =>
        FINAL_CONFIG.value.useChart &&
        currentSelectionSpan.value.rows.length > 1,
);

const hasNumericTypes = computed(() =>
    props.dataset.header.map((h) => h.type).includes(constants.value.NUMERIC),
);

const icons = computed(() => ({
    arrowSort: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize.value}" height="${iconSize.value}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 9l4 -4l4 4m-4 -4v14" /><path d="M21 15l-4 4l-4 -4m4 4v-14" /></svg>`,
    bar: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize.value}" height="${iconSize.value}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M9 8m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M15 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z" /><path d="M4 20l14 0" /></svg>`,
    chart: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize.value}" height="${iconSize.value}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 19l16 0" /><path d="M4 15l4 -6l4 2l4 -5l4 4" /></svg>`,
    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize.value}" height="${iconSize.value}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6 9l6 6l6 -6" /></svg>`,
    chevronLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize.value * 1.6}" height="${iconSize.value * 1.6}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 6l-6 6l6 6" /></svg>`,
    chevronRight: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize.value * 1.6}" height="${iconSize.value * 1.6}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 6l6 6l-6 6" /></svg>`,
    donut: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize.value * 0.8}" height="${iconSize.value * 0.8}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 3v5m4 4h5" /><path d="M8.929 14.582l-3.429 2.918" /><path d="M12 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" /><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /></svg>`,
    export: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize.value}" height="${iconSize.value}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12.5 21h-7.5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v7.5" /><path d="M3 10h18" /><path d="M10 3v18" /><path d="M16 19h6" /><path d="M19 16l3 3l-3 3" /></svg>`,
    fileDownload: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize.value}" height="${iconSize.value}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z" /><path d="M12 17v-6" /><path d="M9.5 14.5l2.5 2.5l2.5 -2.5" /></svg>`,
    filter: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize.value}" height="${iconSize.value}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4h16v2.172a2 2 0 0 1 -.586 1.414l-4.414 4.414v7l-6 2v-8.5l-4.48 -4.928a2 2 0 0 1 -.52 -1.345v-2.227z" /></svg>`,
    move: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize.value}" height="${iconSize.value}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 9l3 3l-3 3" /><path d="M15 12h6" /><path d="M6 9l-3 3l3 3" /><path d="M3 12h6" /><path d="M9 18l3 3l3 -3" /><path d="M12 15v6" /><path d="M15 6l-3 -3l-3 3" /><path d="M12 3v6" /></svg>`,
    sort09: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize.value}" height="${iconSize.value}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 15l3 3l3 -3" /><path d="M7 6v12" /><path d="M17 3a2 2 0 0 1 2 2v3a2 2 0 1 1 -4 0v-3a2 2 0 0 1 2 -2z" /><path d="M17 16m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M19 16v3a2 2 0 0 1 -2 2h-1.5" /></svg>`,
    sort90: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize.value}" height="${iconSize.value}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 15l3 3l3 -3" /><path d="M7 6v12" /><path d="M17 14a2 2 0 0 1 2 2v3a2 2 0 1 1 -4 0v-3a2 2 0 0 1 2 -2z" /><path d="M17 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M19 5v3a2 2 0 0 1 -2 2h-1.5" /></svg>`,
    sortAZ: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize.value}" height="${iconSize.value}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 10v-5c0 -1.38 .62 -2 2 -2s2 .62 2 2v5m0 -3h-4" /><path d="M19 21h-4l4 -7h-4" /><path d="M4 15l3 3l3 -3" /><path d="M7 6v12" /></svg>`,
    sortZA: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize.value}" height="${iconSize.value}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 21v-5c0 -1.38 .62 -2 2 -2s2 .62 2 2v5m0 -3h-4" /><path d="M19 10h-4l4 -7h-4" /><path d="M4 15l3 3l3 -3" /><path d="M7 6v12" /></svg>`,
    sum: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize.value}" height="${iconSize.value}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 16v2a1 1 0 0 1 -1 1h-11l6 -7l-6 -7h11a1 1 0 0 1 1 1v2" /></svg>`,
    table: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize.value}" height="${iconSize.value}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" fill="white" d="M 10 2, 21 2, 21 21, 10 21Z"/><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 5a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-14z" /><path d="M3 10h18" /><path d="M10 3v18" /></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize.value * 0.8}" height="${iconSize.value * 0.8}" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.24 3.957l-8.422 14.06a1.989 1.989 0 0 0 1.7 2.983h16.845a1.989 1.989 0 0 0 1.7 -2.983l-8.423 -14.06a1.989 1.989 0 0 0 -3.4 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>`,
    grip: `<svg xmlns="http://www.w3.org/2000/svg" width="${iconSize.value}" height="${iconSize.value}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M5 15m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M12 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M12 15m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M19 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M19 15m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /></svg>`,
}));

const rows = computed(() => bodyCopy.value.map((row) => row.td));

const selectedCellsCalculations = computed(() => {
    return {
        sumPercentage: Number(
            (
                currentSelectionSpan.value.rows
                    .map((r) => r.value)
                    .reduce((a, b) => a + b, 0) * 100
            ).toFixed(
                props.dataset.header[currentSelectionSpan.value.col].decimals,
            ),
        ).toLocaleString(),
        sumRegular: Number(
            currentSelectionSpan.value.rows
                .map((r) => r.value)
                .reduce((a, b) => a + b, 0)
                .toFixed(
                    props.dataset.header[currentSelectionSpan.value.col]
                        .decimals,
                ),
        ).toLocaleString(),
        averagePercentage: Number(
            (
                (currentSelectionSpan.value.rows
                    .map((r) => r.value)
                    .reduce((a, b) => a + b, 0) /
                    currentSelectionSpan.value.rows.length) *
                100
            ).toFixed(
                props.dataset.header[currentSelectionSpan.value.col].decimals,
            ),
        ).toLocaleString(),
        averageRegular: Number(
            (
                currentSelectionSpan.value.rows
                    .map((r) => r.value)
                    .reduce((a, b) => a + b, 0) /
                currentSelectionSpan.value.rows.length
            ).toFixed(
                props.dataset.header[currentSelectionSpan.value.col].decimals,
            ),
        ).toLocaleString(),
    };
});

const chartModalDimensions = ref({
    width: 1000,
    height: 500,
});

function setChartModalDimensions({ width, height }) {
    chartModalDimensions.value = { width, height };
}

const chartData = computed(() => {
    if (!canChart.value) return [];
    const height = chartModalDimensions.value.height;
    const width = chartModalDimensions.value.width;
    const items = currentSelectionSpan.value.rows.length;
    const slot = width / items;
    const max = Math.max(
        ...currentSelectionSpan.value.rows.map((row) => row.value),
    );
    const min = Math.min(
        ...currentSelectionSpan.value.rows.map((row) => row.value),
    );

    const hasPercentageTo =
        props.dataset.header[currentSelectionSpan.value.col].isPercentage &&
        props.dataset.header[currentSelectionSpan.value.col].percentageTo;
    const isDonut =
        chart.value.type === constants.value.DONUT &&
        selectedDonutCategory.value &&
        selectedDonutCategory.value.name;

    const title =
        props.dataset.header[currentSelectionSpan.value.col].name +
        (hasPercentageTo
            ? ` / ${props.dataset.header[percentages.value[currentSelectionSpan.value.col].referenceIndex].name}`
            : '') +
        (isDonut
            ? ` ${FINAL_CONFIG.value.translations.by} ${selectedDonutCategory.value.name}`
            : '');

    const prefix = props.dataset.header[currentSelectionSpan.value.col].prefix;
    const suffix = props.dataset.header[currentSelectionSpan.value.col].suffix;

    const xyDatasetLine = [
        {
            name: title,
            series: currentSelectionSpan.value.rows.map((r) => r.value),
            type: 'line',
            useProgression: true,
            smooth: FINAL_CONFIG.value.style.chart.layout.line.smooth,
            color: FINAL_CONFIG.value.style.chart.layout.line.stroke,
            useArea: FINAL_CONFIG.value.style.chart.layout.line.useArea,
        },
    ];
    const xyDatasetBar = [
        {
            name: title,
            series: currentSelectionSpan.value.rows.map((r) => r.value),
            type: 'bar',
            useProgression: true,
            color: FINAL_CONFIG.value.style.chart.layout.bar.fill,
        },
    ];

    const bg = FINAL_CONFIG.value.style.chart.modal.backgroundColor;
    const textColor = adaptColorToBackground(bg);
    const rounding =
        props.dataset.header[currentSelectionSpan.value.col].decimals;

    const xyConfig = {
        useCssAnimation: false,
        chart: {
            width,
            height: height - 250,
            backgroundColor: bg,
            color: textColor,
            labels: {
                fontSize: 18,
                prefix,
                suffix,
            },
            grid: {
                stroke: lightenHexColor(textColor, 0.5),
                labels: {
                    color: textColor,
                    xAxisLabels: {
                        color: textColor,
                        show: chartTimeLabels.value.length,
                        values: chartTimeLabels.value,
                        datetimeFormatter:
                            FINAL_CONFIG.value.style.chart.layout
                                .datetimeFormatter,
                        showOnlyAtModulo:
                            FINAL_CONFIG.value.style.chart.layout.timeLabels
                                .showOnlyAtModulo,
                        modulo: FINAL_CONFIG.value.style.chart.layout.timeLabels
                            .modulo,
                    },
                },
            },
            highlighter: {
                color: textColor,
            },
            legend: {
                color: textColor,
                show: false, // not necessary since we only show a single series and the title is displayed above
            },
            title: {
                text: title,
                color: textColor,
                textAlign: 'center',
                fontSize: 18,
            },
            tooltip: {
                showTimeLabel: chartTimeLabels.value.length,
                backgroundOpacity: 30,
                color: textColor,
                backgroundColor: bg,
                showPercentage: false,
                roundingValue: rounding,
            },
            userOptions: {
                buttons: {
                    pdf: false,
                    csv: false,
                    table: false,
                    annotator: false,
                },
            },
            zoom: {
                show: FINAL_CONFIG.value.style.chart.layout.zoom.show,
                focusOnDrag: true,
                minimap: {
                    show: true,
                },
            },
        },
        line: {
            labels: {
                show: true,
                color: textColor,
                rounding,
            },
            dot: {
                useSerieColor: false,
                fill: FINAL_CONFIG.value.style.chart.layout.line.plot.fill,
                strokeWidth:
                    FINAL_CONFIG.value.style.chart.layout.line.plot.strokeWidth,
            },
        },
        bar: {
            useGradient: false,
            border: {
                useSerieColor: false,
                stroke: FINAL_CONFIG.value.style.chart.layout.bar.stroke,
                strokeWidth:
                    FINAL_CONFIG.value.style.chart.layout.bar.strokeWidth,
            },
            labels: {
                show: true,
                color: textColor,
                rounding,
            },
        },
    };

    const relativeZero = min >= 0 ? 0 : Math.abs(min);
    const absoluteMax = max + relativeZero;

    const isPercentage =
        props.dataset.header[currentSelectionSpan.value.col].isPercentage;

    const plots = currentSelectionSpan.value.rows.map((row, i) => {
        return {
            x: slot * i + slot / 2,
            y: (1 - (row.value + relativeZero) / absoluteMax) * height,
            value: isPercentage ? row.value * 100 : row.value,
            suffix: isPercentage
                ? '%'
                : props.dataset.header[currentSelectionSpan.value.col].suffix
                  ? props.dataset.header[currentSelectionSpan.value.col].suffix
                  : '',
            prefix: props.dataset.header[currentSelectionSpan.value.col].prefix
                ? props.dataset.header[currentSelectionSpan.value.col].prefix
                : '',
            index: row.index,
            absoluteValue: isPercentage
                ? Math.abs(row.value) * 100
                : Math.abs(row.value),
        };
    });

    const donutConfig = {
        useCssAnimation: false,
        userOptions: {
            position: 'left',
            buttons: {
                pdf: false,
                csv: false,
                table: false,
                annotator: false,
            },
        },
        style: {
            chart: {
                backgroundColor: bg,
                color: textColor,
                layout: {
                    curvedMarkers: true,
                    donut: {
                        strokeWidth: 64,
                    },
                    labels: {
                        dataLabels: {
                            suffix: isPercentage ? '%' : '',
                            prefix,
                        },
                        value: {
                            rounding,
                        },
                        percentage: {
                            color: textColor,
                            rounding,
                        },
                        name: {
                            color: textColor,
                        },
                        hollow: {
                            average: {
                                color: textColor,
                                text: FINAL_CONFIG.value.translations.average,
                                value: {
                                    color: textColor,
                                },
                            },
                            total: {
                                color: textColor,
                                offsetY: -12,
                                text: FINAL_CONFIG.value.translations.total,
                                value: {
                                    color: textColor,
                                    offsetY: -12,
                                },
                            },
                        },
                    },
                },
                legend: {
                    backgroundColor: bg,
                    color: textColor,
                    roundingValue: rounding,
                    roundingPercentage: rounding,
                },
                padding: {
                    left: 12,
                    right: 12,
                },
                title: {
                    text: title,
                    color: textColor,
                    fontSize: 18,
                },
                tooltip: {
                    backgroundOpacity: 30,
                    color: textColor,
                    backgroundColor: bg,
                    roundingValue: rounding,
                    roundingValue: rounding,
                },
            },
        },
    };

    return {
        donutConfig,
        xyConfig,
        xyDatasetLine,
        xyDatasetBar,
        progression: plots.length >= 2 ? calcLinearProgression(plots) : false,
    };
});

// Stock piled methods (and yes, this was converted from options API...)

function applyDonutOption() {
    const donutSet = selectedDonutCategory.value.options
        .map((option, i) => {
            return {
                name: option,
                color: palette[i] || palette[i % palette.length],
                values: [
                    visibleRows.value
                        .filter(
                            (row, i) =>
                                row.td[selectedDonutCategory.value.index] ===
                                    option &&
                                currentSelectionSpan.value.rows
                                    .map((row) => row.index)
                                    .includes(i),
                        )
                        .map((row) => row.td[currentSelectionSpan.value.col])
                        .reduce((a, b) => Math.abs(a) + Math.abs(b), 0),
                ],
                absoluteValue: visibleRows.value
                    .filter(
                        (row, i) =>
                            row.td[selectedDonutCategory.value.index] ===
                                option &&
                            currentSelectionSpan.value.rows
                                .map((row) => row.index)
                                .includes(i),
                    )
                    .map((row) => row.td[currentSelectionSpan.value.col])
                    .reduce((a, b) => a + b, 0),
            };
        })
        .sort((a, b) => b.value - a.value);

    currentDonut.value = donutSet;
    nextTick(() => {
        chart.value.type = constants.value.DONUT;
        showDonutOptions.value = false;
    });
}

function canResetColumn(colIndex, th) {
    return (
        !hasNaN.value[colIndex] &&
        (th.isSort || th.isSearch || th.isMultiselect || th.rangeFilter) &&
        ![constants.value.DATE].includes(th.type)
    );
}

function createXls(selection = 'all') {
    const head = props.dataset.header.map((h) => h.name);
    const body =
        selection === 'all'
            ? bodyCopy.value.map((b) => b.td)
            : visibleRows.value.map((r) => r.td);
    const table = [head].concat(body);
    const csvContent = createCsvContent(table);
    downloadCsv({ csvContent, title: filename.value });
}

////////////////////////////// FIXME
function closeAllDropdowns() {
    const dropdowns = document.getElementsByClassName('th-dropdown'); // FIXME: this needs to be more instance specific
    if (!dropdowns.length) return;
    Array.from(dropdowns).forEach((dropdown) => {
        dropdown.dataset.isOpen = false;
    });
}

////////////////////////////// FIXME: available in lib
function debounce(fn, delay) {
    let timerId;
    clearTimeout(timerId);
    timerId = setTimeout(fn, delay);
}

function resetSelection() {
    const rows = document.getElementsByClassName(`tr_${uid}`);

    Array.from(rows).forEach((tr) => {
        Array.from(tr.getElementsByTagName('td')).forEach((td) => {
            if (td.dataset.row === 'even') {
                td.style.background =
                    FINAL_CONFIG.value.style.rows.even.backgroundColor;
                td.style.color = FINAL_CONFIG.value.style.rows.even.color;
            } else {
                td.style.background =
                    FINAL_CONFIG.value.style.rows.odd.backgroundColor;
                td.style.color = FINAL_CONFIG.value.style.rows.odd.color;
            }
        });
    });
    Array.from(rows).forEach((tr) => (tr.dataset.selected = 'false'));
    if (currentPage.value > pages.value.length - 1) {
        currentPage.value = pages.value.length - 1;
    }
    showChart.value = false;
    currentDonut.value = undefined;
    selectedColumn.value = undefined;
    chart.value.type = constants.value.BAR;
    currentSelectionSpan.value = {
        col: undefined,
        rows: [],
    };
    clientX.value = 100;
    clientY.value = 100;
}

function filterByRange(arr, index) {
    bodyCopy.value = arr.filter((el) => {
        return (
            el.td[index] >= rangeFilters.value[index].min &&
            el[index] <= rangeFilters.value[index].max
        );
    });
}

function sortByNumber(arr, index) {
    if (sorts.value[index] === constants.value.ASC) {
        arr = arr.sort((a, b) => {
            return a[index] - b[index];
        });
    }
    if (sorts.value[index] === constants.value.DESC) {
        arr = arr.sort((a, b) => {
            return b[index] - a[index];
        });
    } else {
        return 0;
    }
}

function sortBody() {
    resetSelection();
    Object.keys(rangeFilters.value).forEach((index) => {
        filterByRange(bodyCopy.value, index);
    });

    Object.keys(sorts.value).forEach((index) => {
        sortByNumber(bodyCopy.value, index);
    });

    if (currentFilter.value !== undefined) {
        sortByNumber(bodyCopy.value, currentFilter.value);
    }
    // percentage calculation
    props.dataset.header.forEach((col, i) => {
        if (col.isPercentage) {
            const referenceIndex = percentages.value[i].referenceIndex;
            const sum = bodyCopy.value
                .map((el) => el.td[referenceIndex])
                .reduce((a, b) => a + b, 0);
            bodyCopy.value.forEach((row) => {
                row.td[i] = row.td[referenceIndex] / sum;
            });
        }
    });
    if (currentPage.value > pages.value.length - 1) {
        currentPage.value = pages.value.length - 1;
    }
    if ([-1].includes(currentPage.value)) {
        currentPage.value = 0;
    }
}

function filterBody() {
    bodyCopy.value = tableBody.value.filter((el) => {
        for (const index in searches.value) {
            if (
                !el.td[index]
                    .toUpperCase()
                    .includes(searches.value[index].toUpperCase())
            ) {
                return false;
            }
        }
        for (const index in multiselects.value) {
            const filter = multiselects.value[index];
            if (!filter.some((f) => f === el.td[index])) {
                return false;
            }
        }
        for (const index in dates.value) {
            const date = new Date(el.td[index]);
            const fromDate = new Date(dates.value[index].from);
            const toDate = new Date(dates.value[index].to);

            if (date < fromDate || date > toDate) {
                return false;
            }
        }
        return true;
    });
    sortBody();
}

function getAverage(index) {
    return (
        rows.value
            .map((td) => td[index])
            .map((el) => (isNaN(Number(el)) ? 0 : el))
            .reduce((a, b) => a + b, 0) / bodyCopy.value.length
    );
}

function getDatesRange(index) {
    const dates = props.dataset.body.map((row) => new Date(row.td[index]));
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
        to: max,
    };
}

function getDropdownOptions(index) {
    return [
        ...new Set(
            props.dataset.body.map((el) => {
                return el.td[index];
            }),
        ),
    ];
}

function getSum(index) {
    return rows.value
        .map((td) => td[index])
        .map((el) => (isNaN(Number(el)) ? 0 : el))
        .reduce((a, b) => a + b, 0);
}

function includesNaN(arr) {
    return arr.includes(NaN);
}

function isDropdownOptionSelected(option, index) {
    if (!multiselects.value[index]) {
        return true;
    }
    return multiselects.value[index].includes(option);
}

function isNumeric(value) {
    return !isNaN(Number(String(value).replaceAll('%', '')));
}

function isResetDisabled(index, th) {
    const isSort = th.isSort;
    const isSearch = th.isSearch;
    const isMultiselect = th.isMultiselect && multiselects.value[index];
    const rangeFilter = th.rangeFilter;

    const isRangeAltered = (index) => {
        if (rangeFilter && rangeFilters.value[index]) {
            return (
                Math.round(rangeFilters.value[index].min) ===
                    immutableRangeFilters.value[index].min &&
                Math.round(rangeFilters.value[index].max) ===
                    immutableRangeFilters.value[index].max
            );
        }
    };

    if (isSort && isSearch && isMultiselect && rangeFilter) {
        return (
            ['', undefined].includes(searches.value[index]) &&
            [undefined].includes(sorts.value[index]) &&
            multiselects.value[index].length ===
                getDropdownOptions(index).length &&
            isRangeAltered(index)
        );
    } else if (isSort && isSearch && isMultiselect) {
        return (
            ['', undefined].includes(searches.value[index]) &&
            [undefined].includes(sorts.value[index]) &&
            multiselects.value[index].length ===
                getDropdownOptions(index).length
        );
    } else if (isSort && isSearch && rangeFilter) {
        return (
            ['', undefined].includes(searches.value[index]) &&
            [undefined].includes(sorts.value[index]) &&
            isRangeAltered(index)
        );
    } else if (isSort && isSearch) {
        return (
            ['', undefined].includes(searches.value[index]) &&
            [undefined].includes(sorts.value[index])
        );
    } else if (isSort && isMultiselect && rangeFilter) {
        return (
            [undefined].includes(sorts.value[index]) &&
            multiselects.value[index].length ===
                getDropdownOptions(index).length &&
            isRangeAltered(index)
        );
    } else if (isSort && isMultiselect) {
        return (
            [undefined].includes(sorts.value[index]) &&
            multiselects.value[index].length ===
                getDropdownOptions(index).length
        );
    } else if (isSearch && isMultiselect && rangeFilter) {
        return (
            ['', undefined].includes(searches.value[index]) &&
            multiselects.value[index].length ===
                getDropdownOptions(index).length &&
            isRangeAltered(index)
        );
    } else if (isSearch && isMultiselect) {
        return (
            ['', undefined].includes(searches.value[index]) &&
            multiselects.value[index].length ===
                getDropdownOptions(index).length
        );
    } else if (isSearch && rangeFilter) {
        return (
            ['', undefined].includes(searches.value[index]) &&
            isRangeAltered(index)
        );
    } else if (isSearch) {
        return ['', undefined].includes(searches.value[index]);
    } else if (isSort && rangeFilter) {
        return (
            [undefined].includes(sorts.value[index]) && isRangeAltered(index)
        );
    } else if (isSort) {
        return [undefined].includes(sorts.value[index]);
    } else if (isMultiselect && rangeFilter) {
        return (
            multiselects.value[index].length ===
                getDropdownOptions(index).length && isRangeAltered(index)
        );
    } else if (isMultiselect) {
        return (
            multiselects.value[index].length ===
            getDropdownOptions(index).length
        );
    }
}

function getCurrentPageData() {
    return {
        totalPages: pages.value.length,
        itemsPerPage: itemsPerPage.value,
        currentPage: currentPage.value,
        currentPageData: visibleRows.value.map((r) => r.td),
    };
}

defineExpose({
    getCurrentPageData,
});

function onPageChange() {
    emit('page-change', getCurrentPageData());
}

const tableWrapper = ref(null);

function navigate(direction) {
    resetSelection();
    if (direction === 'next' && currentPage.value < pages.value.length) {
        if (currentPage.value + 1 > pages.value.length - 1) {
            return;
        }
        currentPage.value += 1;
    } else if (direction === 'previous' && currentPage.value >= 1) {
        currentPage.value -= 1;
    } else {
        if (
            direction - 1 < 0 ||
            direction > pages.value.length ||
            direction === 'previous'
        ) {
            return;
        }
        currentPage.value = direction - 1;
    }

    onPageChange();

    tableWrapper.value &&
        tableWrapper.value.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
        });
}

function navigateCell(event) {
    event.preventDefault();
    const keyCode = event.keyCode;
    const up = 38;
    const down = 40;
    const left = 37;
    const right = 39;
    if (![up, down, left, right].includes(keyCode)) return;

    const currentId = event.target.id;
    const regex = /cell_(\d+)_(\d+)_([0-9a-fA-F-]{36})/;
    const match = currentId.match(regex);

    const currentRow = parseInt(match[1]);
    const currentCol = parseInt(match[2]);

    const nextCellRow = document.getElementById(
        `cell_${currentRow}_${currentCol + 1}_${uid}`,
    );
    const previousCellRow = document.getElementById(
        `cell_${currentRow}_${currentCol - 1}_${uid}`,
    );
    const nextCellCol = document.getElementById(
        `cell_${currentRow + 1}_${currentCol}_${uid}`,
    );
    const previousCellCol = document.getElementById(
        `cell_${currentRow - 1}_${currentCol}_${uid}`,
    );

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

        case keyCode === down:
            nextCell = nextCellCol;
            break;

        default:
            return;
    }

    if (!nextCell) return;
    nextCell.focus();
    nextCell.scrollIntoView({ behavior: 'smooth', block: 'center' }); // FIXME: NOT GR8
}

function stringToNumber(str) {
    let num = 0;
    for (let i = 0; i < str.length; i += 1) {
        num += str.charCodeAt(i);
    }
    return num;
}

async function prepareBodyCopy() {
    return new Promise((resolve) => {
        const searchHelper = [];

        tableHead.value.forEach((th, i) => {
            if (th.isSearch) {
                Object.assign(searches.value, { [i]: '' });
            }
            if (th.isMultiselect) {
                Object.assign(multiselects.value, {
                    [i]: getDropdownOptions(i),
                });
            }
            if (th.type === constants.value.DATE) {
                Object.assign(dates.value, { [i]: getDatesRange(i) });
                Object.assign(filteredDatesIndexes.value, { [i]: false });
            }
            if (th.isPercentage || th.percentageTo) {
                Object.assign(percentages.value, {
                    [i]: {
                        reference: th.percentageTo,
                        referenceIndex: props.dataset.header
                            .map((el) => el.name)
                            .indexOf(th.percentageTo),
                    },
                });
            }

            if (th.rangeFilter) {
                Object.assign(rangeFilters.value, {
                    [i]: {
                        min: Math.round(
                            Math.min(
                                ...props.dataset.body
                                    .map((el) => el.td)
                                    .map((el) => el[i]),
                            ),
                        ),
                        max: Math.round(
                            Math.max(
                                ...props.dataset.body
                                    .map((el) => el.td)
                                    .map((el) => el[i]),
                            ),
                        ),
                    },
                });
                Object.assign(immutableRangeFilters.value, {
                    [i]: {
                        min: Math.round(
                            Math.min(
                                ...props.dataset.body
                                    .map((el) => el.td)
                                    .map((el) => el[i]),
                            ),
                        ),
                        max: Math.round(
                            Math.max(
                                ...props.dataset.body
                                    .map((el) => el.td)
                                    .map((el) => el[i]),
                            ),
                        ),
                    },
                });
            }

            if (th.isPercentage) {
                const baseIndex = props.dataset.header
                    .map((el) => el.name)
                    .indexOf(th.percentageTo);
                const sum = props.dataset.body
                    .map((el) => el.td[baseIndex])
                    .reduce((a, b) => a + b, 0);
                searchHelper.push([i, baseIndex, sum]);
            }

            if (th.type === constants.value.NUMERIC && !th.isPercentage) {
                Object.assign(hasNaN.value, {
                    [i]: includesNaN(
                        props.dataset.body.map((el) => Number(el.td[i])),
                    ),
                });
            }
        });

        bodyCopy.value.forEach((el, index) => {
            searchHelper.map((helper) => {
                const [index, baseIndex, sum] = helper;
                el.td[index] = el.td[baseIndex] / sum;
            });
            // Implements a sorting index for each column type
            // Also applied on tableBody as it is used when reseting filters to initial state
            el.td.forEach((td, i) => {
                if (
                    props.dataset.header[i].type === constants.value.TEXT &&
                    props.dataset.header[i].isSearch
                ) {
                    el[i] = stringToNumber(td);
                }
                if (props.dataset.header[i].type === constants.value.DATE) {
                    el[i] = new Date(td).getTime();
                }
                if (props.dataset.header[i].type === constants.value.NUMERIC) {
                    el[i] = isNaN(Number(td)) ? i : td;
                }
                tableBody.value[index][i] = el[i];
            });
        });
        resolve(true);
    });
}

function promiseWithAsyncFunction(asyncFunction, callback) {
    return new Promise((resolve, reject) => {
        asyncFunction()
            .then((data) => {
                try {
                    const result = callback(data);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
}

async function resetDates(index) {
    dates.value[index] = {
        from: getDatesRange(index).from,
        to: getDatesRange(index).to,
    };
    filteredDatesIndexes.value[index] = false;
    await nextTick();
    filterBody();
}

function resetFilter(index, th, event) {
    const target = event.currentTarget;
    clearTimeout(buttonTimeout.value);
    target.classList.add('clicked');
    buttonTimeout.value = setTimeout(() => {
        target.classList.remove('clicked');
    }, 200);
    currentFilter.value = undefined;

    if (th.rangeFilter) {
        rangeFilters.value[index].min = immutableRangeFilters.value[index].min;
        rangeFilters.value[index].max = immutableRangeFilters.value[index].max;
    }

    if (th.isMultiselect) {
        multiselects.value[index] = getDropdownOptions(index);
        if (th.type === constants.value.TEXT) {
            sorts.value[index] = undefined;
        }
        if (th.isSearch) {
            searches.value[index] = '';
        }
    } else if (th.type === constants.value.NUMERIC) {
        sorts.value[index] = undefined;
    } else if (th.type === constants.value.TEXT) {
        sorts.value[index] = undefined;
        searches.value[index] = '';
    } else if (th.type === constants.value.DATE) {
        sorts.value[index] = undefined;
    }
    filterBody();
}

function selectTd({ td, rowIndex, colIndex, headerType, event }) {
    if (headerType !== constants.value.NUMERIC || isNaN(Number(td))) {
        resetSelection();
        return;
    }
    if (currentSelectionSpan.value.col !== colIndex) {
        resetSelection();
    }
    const tr = event.currentTarget.parentNode;
    currentSelectionSpan.value.col = colIndex;

    if (
        currentSelectionSpan.value.rows
            .map((row) => row.index)
            .includes(rowIndex)
    ) {
        tr.dataset.selected = 'false';
        currentSelectionSpan.value.rows =
            currentSelectionSpan.value.rows.filter(
                (row) => row.index !== rowIndex,
            );
        event.currentTarget.classList.remove(cssClass.value.CELL);
        Array.from(tr.children).forEach((td, i) => {
            if (td.dataset.row === 'even') {
                td.style.background =
                    FINAL_CONFIG.value.style.rows.even.backgroundColor;
                td.style.color = FINAL_CONFIG.value.style.rows.even.olor;
            } else {
                td.style.background =
                    FINAL_CONFIG.value.style.rows.odd.backgroundColor;
                td.style.color = FINAL_CONFIG.value.style.rows.odd.color;
            }
        });

        if (event.currentTarget.dataset.row === 'even') {
            event.currentTarget.style.background =
                FINAL_CONFIG.value.style.rows.even.backgroundColor;
            event.currentTarget.style.color =
                FINAL_CONFIG.value.style.rows.even.color;
        } else {
            event.currentTarget.style.background =
                FINAL_CONFIG.value.style.rows.odd.backgroundColor;
            event.currentTarget.style.color =
                FINAL_CONFIG.value.style.rows.odd.color;
        }
    } else {
        tr.dataset.selected = 'true';
        currentSelectionSpan.value.rows.push({
            index: rowIndex,
            value: td,
        });
        Array.from(tr.children).forEach((td, i) => {
            if (td.dataset.row === 'even') {
                td.style.background =
                    FINAL_CONFIG.value.style.rows.even.selectedNeighbors.backgroundColor;
                td.style.color =
                    FINAL_CONFIG.value.style.rows.even.selectedNeighbors.color;
            } else {
                td.style.background =
                    FINAL_CONFIG.value.style.rows.odd.selectedNeighbors.backgroundColor;
                td.style.color =
                    FINAL_CONFIG.value.style.rows.odd.selectedNeighbors.color;
            }
        });

        if (event.currentTarget.dataset.row === 'odd') {
            event.currentTarget.style.background =
                FINAL_CONFIG.value.style.rows.odd.selectedCell.backgroundColor;
            event.currentTarget.style.color =
                FINAL_CONFIG.value.style.rows.odd.selectedCell.color;
        } else {
            event.currentTarget.style.background =
                FINAL_CONFIG.value.style.rows.even.selectedCell.backgroundColor;
            event.currentTarget.style.color =
                FINAL_CONFIG.value.style.rows.even.selectedCell.color;
        }
    }
    currentSelectionSpan.value.rows = currentSelectionSpan.value.rows.sort(
        (a, b) => a.index - b.index,
    ); // Guarantees the chart will display plots in the same order than the visible rows

    if (
        chart.value.type === constants.value.DONUT &&
        currentSelectionSpan.value.rows.length > 0
    ) {
        applyDonutOption();
    }
}

function selectColumn(index) {
    if (currentSelectionSpan.value.col !== index) {
        visibleRows.value.forEach((row, i) => {
            selectTd({
                td: row.td[index],
                rowIndex: i,
                colIndex: index,
                headerType: constants.value.NUMERIC,
                event: {
                    currentTarget: document.getElementById(
                        `cell_${i}_${index}_${uid}`,
                    ),
                },
            });
        });
        selectedColumn.value = index;
    } else {
        selectedColumn.value = undefined;
        resetSelection();
    }
}

async function selectDropdownOption(option, index) {
    if (multiselects.value[index].includes(option)) {
        multiselects.value[index] = multiselects.value[index].filter(
            (el) => el !== option,
        );
    } else {
        multiselects.value[index].push(option);
    }
    await nextTick();
    filterBody();
}

function setFilterDatesIndexes(index) {
    filteredDatesIndexes.value[index] = !(
        getDatesRange(index).from === dates.value[index].from &&
        getDatesRange(index).to === dates.value[index].to
    );
}

function sortTh(index, event) {
    currentFilter.value = index;
    const target = event.currentTarget;
    clearTimeout(buttonTimeout.value);
    target.classList.add('clicked');
    buttonTimeout.value = setTimeout(() => {
        target.classList.remove('clicked');
    }, 200);
    const record = sorts.value[index];
    if (record === 1) {
        sorts.value[index] = constants.value.DESC;
    } else {
        sorts.value[index] = constants.value.ASC;
    }
    sortBody();
}

function toggleMultiselect(index, _th, event) {
    const target = event.currentTarget;
    clearTimeout(buttonTimeout.value);
    target.classList.add('clicked');
    buttonTimeout.value = setTimeout(() => {
        target.classList.remove('clicked');
    }, 200);

    const menu = document.getElementById(`th_dropdown_${index}`); // FIXME: add uid
    if (menu.dataset.isOpen === 'false') {
        menu.dataset.isOpen = 'true';
    } else {
        menu.dataset.isOpen = 'false';
    }
}

function updateCurrentPage(event) {
    resetSelection();
    if (!event || !event.target.value) {
        currentPage.value = 0;
    } else {
        currentPage.value = Number(event.target.value);
    }
    onPageChange();
}

// FIXME: use BaseDraggableDialog instead of this custom modal

function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
}

const chartModal = ref(null);

function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    if (chartModal.value) {
        const rect = chartModal.value.getBoundingClientRect();
        dragOffsetX.value = e.clientX - rect.left;
        dragOffsetY.value = e.clientY - rect.top;
        modalWidth.value = rect.width;
        modalHeight.value = rect.height;

        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
}

function elementDrag(e) {
    if (rafId.value) return;

    if (chartModal.value) {
        const rect = chartModal.value.getBoundingClientRect();
        clientX.value = e.clientX - dragOffsetX.value;
        clientY.value = e.clientY - dragOffsetY.value - 40;
        if (clientX.value < 0) clientX.value = 0;
        if (clientX.value + rect.width > window.innerWidth)
            clientX.value = window.innerWidth - rect.width - 48;
        if (clientY.value < 0) clientY.value = 0;
        if (clientY.value + rect.height > window.innerHeight)
            clientY.value = window.innerHeight - rect.height - 24;
    }
}

onMounted(() => {
    if (props.dataset.header.length === 0) {
        throw new Error(
            "vue-ui-table error: missing header data.\nProvide an array of objects of type:\n{\n name: string;\n type: string; ('text' | 'numeric' | 'date')\n average: boolean;\n decimals: number | undefined;\n sum: boolean;\n isSort:boolean;\n isSearch: boolean;\n isMultiselect: boolean;\n isPercentage: boolean;\n percentageTo: string; (or '')\n}",
        );
    }
    if (props.dataset.body.length === 0) {
        throw new Error('vue-ui-table error: missing body data');
    }
    isLoading.value = true;

    promiseWithAsyncFunction(prepareBodyCopy, async () => {
        await nextTick();
        isLoading.value = false;
    });

    document.addEventListener('keydown', (e) => {
        const focusedElement = document.activeElement;
        const isTableCellFocused =
            focusedElement &&
            Array.from(focusedElement.classList).includes('td-focusable');

        if (
            (isTableCellFocused && e.key.includes('Arrow')) ||
            e.code === 'Space'
        ) {
            e.preventDefault();
        }
    });
    filename.value = FINAL_CONFIG.value.style.exportMenu.filename;
    chartTimeLabelSourceModel.value = dateHeaders.value[0]?.name ?? '';
});

watch(
    () => props.dataset,
    (newVal) => {
        isLoading.value = true;
        bodyCopy.value = JSON.parse(JSON.stringify(newVal.body)).map(
            (el, i) => ({
                ...el,
                absoluteIndex: i,
            }),
        );
        tableBody.value = JSON.parse(JSON.stringify(newVal.body)).map(
            (el, i) => ({
                ...el,
                absoluteIndex: i,
            }),
        );
        tableHead.value = JSON.parse(JSON.stringify(newVal.header)).map(
            (head, i) => ({
                average: Object.hasOwn(head, 'average') ? head.average : false,
                decimals: Object.hasOwn(head, 'decimals') ? head.decimals : 0,
                isMultiselect: Object.hasOwn(head, 'isMultiselect')
                    ? head.isMultiselect
                    : false,
                isPercentage: Object.hasOwn(head, 'isPercentage')
                    ? head.isPercentage
                    : false,
                isSearch: Object.hasOwn(head, 'isSearch')
                    ? head.isSearch
                    : false,
                isSort: Object.hasOwn(head, 'isSort') ? head.isSort : false,
                name: head.name,
                percentageTo: Object.hasOwn(head, 'percentageTo')
                    ? head.percentageTo
                    : undefined,
                prefix: Object.hasOwn(head, 'prefix') ? head.prefix : '',
                rangeFilter: Object.hasOwn(head, 'rangeFilter')
                    ? head.rangeFilter
                    : false,
                suffix: Object.hasOwn(head, 'suffix') ? head.suffix : '',
                sum: Object.hasOwn(head, 'sum') ? head.sum : false,
                type: head.type,
                index: i,
            }),
        );

        currentSelectionSpan.value = { col: undefined, rows: [] };
        selectedColumn.value = undefined;

        // this.currentPage = 0;
        itemsPerPage.value = props.config.rowsPerPage
            ? props.config.rowsPerPage
            : 25;
        percentages.value = {};
        dates.value = {};
        filteredDatesIndexes.value = {};
        hasNaN.value = {};
        immutableRangeFilters.value = {};
        rangeFilters.value = {};
        multiselects.value = {};
        searches.value = {};
        sorts.value = {};
        showChart.value = false;
        currentDonut.value = undefined;
        selectedDonutCategory.value = undefined;
        selectedPlot.value = undefined;
        showDonutOptions.value = false;
        currentSelectionSpan.value.col = undefined;
        currentSelectionSpan.value.rows = [];

        promiseWithAsyncFunction(prepareBodyCopy, async () => {
            updateCurrentPage();
            await nextTick();
            isLoading.value = false;
        });
    },
    { immediate: true, deep: true },
);

const filenameInputRef = ref(null);
watch(isExportRequest, (bool) => {
    bool && filenameInputRef.value && filenameInputRef.value.focus();
});

watch(showChart, (bool) => {
    if (bool) {
        chartModal.value && chartModal.value.open();
    } else {
        chartModal.value && chartModal.value.close();
    }
});
</script>

<style>
.vue-ui-table-chart-modal-options {
    display: flex;
    flex-direction: row;
    gap: 8px;
    margin-bottom: 1rem;
}

.vue-ui-table-chart-modal-options button {
    height: 24px;
    padding: 3px;
    width: 24px;
    align-items: center;
    display: flex;
    justify-content: center;
    width: 32px;
    border-radius: 0.3rem;
}

.vue-ui-table-chart-modal-options button:hover {
    outline: 3px solid rgba(128, 128, 128, 0.432);
}

.vue-ui-table-fieldset-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 24px;
    margin-bottom: 12px;
}

.vue-ui-table-fieldset {
    border-radius: 6px;
    margin-bottom: 24px;
    border: 1px solid white;
}

.vue-ui-table-fieldset legend {
    color: grey;
}

.vue-ui-table-fieldset-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.vue-ui-table-fieldset-option input {
    height: 14px;
    width: 14px;
    border-radius: 50%;
}

button.vue-ui-table-generate-donut {
    align-items: center;
    display: flex;
    gap: 3px;
    justify-content: center;
    margin: 0 auto;
    margin-bottom: 12px;
    margin-top: 24px;
    padding-left: 12px;
    padding-right: 12px;
    width: fit-content;
    border-radius: 0.3rem;
}

button.vue-ui-table-generate-donut[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>

<style scoped>
.vue-ui-table-main {
    height: fit-content;
    padding: 0 0 98px 0;
    position: relative;
}

.vue-ui-table__wrapper {
    overflow-x: auto;
    padding: 0px 12px 48px 12px;
    position: relative;
    width: calc(100% - 24px);
}

.vue-ui-table-main thead {
    position: sticky;
    top: 0;
}

.vue-ui-table-main caption {
    caption-side: top;
    position: sticky;
    top: 0;
    z-index: 2;
}

.vue-ui-table {
    width: 100%;
    position: relative;
}

.vue-ui-table-main table {
    border-collapse: collapse;
}

.vue-ui-table-main th,
.vue-ui-table-main td {
    padding: 3px 8px;
}

.vue-ui-table-main .th-numeric {
    text-align: right;
    font-variant-numeric: tabular-nums;
}

.vue-ui-table-main .th-filter {
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: 6px;
    justify-content: center;
    position: relative;
}

.vue-ui-table-main button {
    align-items: center;
    display: flex;
    justify-content: center;
    width: 32px;
}

.vue-ui-table-main input {
    padding: 0 6px;
    font-family: inherit;
}

.vue-ui-table-main button,
.vue-ui-table-main input {
    border-radius: 6px;
    height: 32px;
}

.vue-ui-table-main button {
    border: 1px solid grey;
}

.vue-ui-table-main button:hover,
.vue-ui-table-main button:focus,
.vue-ui-table-main input:hover,
.vue-ui-table-main input:focus {
    outline: 3px solid rgba(128, 128, 128, 0.432);
}

.vue-ui-table-main button.clicked {
    animation: clicked 0.15s ease-in-out;
}

.vue-ui-table-main button[disabled] {
    cursor: not-allowed;
}

.vue-ui-table-main button[disabled]:focus,
.vue-ui-table-main button[disabled]:hover {
    outline: none;
}

button.th-reset:disabled {
    background: v-bind(colorCancelInactive);
    color: v-bind(textColorCancelInactive);
}

button.th-reset:not(:disabled) {
    background: radial-gradient(
        at top,
        v-bind(colorCancelActiveLight),
        v-bind(colorCancelActive)
    );
    border: 1px solid v-bind(colorCancelActive);
    color: white;
}

.vue-ui-table-main button.th-reset:not(:disabled):hover,
.vue-ui-table-main button.th-reset:not(:disabled):focus {
    outline: 3px solid v-bind(colorCancelActiveOutline);
}

.vue-ui-table-main [data-is-open='false'] {
    transform: scale(0, 0);
}

.vue-ui-table-main .th-dropdown[data-is-open='true'] {
    animation: open-dropdown 0.2s ease-in;
}

.vue-ui-table-main .th-dropdown[data-is-open='false'] {
    animation: close-dropdown 0.2s ease-in;
}

.vue-ui-table-main .th-dropdown {
    align-items: center;
    border-radius: 8px;
    border: 1px solid white;
    box-shadow: 0 6px 12px -6px rgba(0, 0, 0, 0.5);
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

.vue-ui-table-main .th-option {
    border-radius: 6px;
    padding: 2px 6px;
    text-align: left;
    user-select: none;
    width: 100%;
    font-weight: 400;
}

.vue-ui-table-main .th-option:hover {
    background-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 3px 6px -3px rgba(0, 0, 0, 0.5);
    z-index: 1;
}

.vue-ui-table-main button.close-dropdown,
.vue-ui-table-main button.close-chart-modal {
    align-items: center;
    border-radius: 50%;
    border: none;
    display: flex;
    height: 20px;
    padding: 2px;
    position: absolute;
    right: 6px;
    top: 6px;
    width: 20px;
}

.vue-ui-table-main button.close-dropdown:hover,
.vue-ui-table-main button.close-dropdown:focus,
.vue-ui-table-main button.close-chart-modal:hover,
.vue-ui-table-main button.close-char-modal:focus {
    outline: 3px solid #2d353c71;
}

.vue-ui-table-main .th-button-active {
    background: radial-gradient(
        at top,
        v-bind(colorButtonSortActiveLight),
        v-bind(colorButtonSortActive)
    );
    color: v-bind(colorButtonSortActiveColorText);
}

.vue-ui-table-main .th-button-active:hover,
.vue-ui-table-main .th-button-active:focus {
    outline: 3px solid v-bind(colorButtonSortActiveOutline);
}

.vue-ui-table-main .th-date {
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: 6px;
    justify-content: center;
    width: 100%;
}

.vue-ui-table-main .date-wrapper--inputs {
    align-items: center;
    display: flex;
    flex-direction: column;
    gap: 6px;
    justify-content: center;
    width: 100%;
}

.vue-ui-table-main .date-wrapper--button {
    display: flex;
    gap: 3px;
}

.vue-ui-table-main input[type='date'] {
    border-radius: 4px;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    height: 20px !important;
    width: 100px;
}

.vue-ui-table-main .date-fieldset {
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: 6px;
    justify-content: center;
    width: 100%;
}

.vue-ui-table-main .date-fieldset label {
    font-size: 12px;
    font-weight: 400;
}

@keyframes clicked {
    0% {
        transform: scale(0.9, 0.9);
    }

    90% {
        transform: scale(1.03, 1.03);
    }

    100% {
        transform: scale(1, 1);
    }
}

.vue-ui-table-main .td-selector-info {
    align-items: center;
    border-radius: 0 0 6px 6px;
    bottom: 76px;
    display: flex;
    font-size: 14px;
    justify-content: flex-end;
    min-height: 20px;
    padding: 2px;
    padding-right: 4px;
    position: absolute;
    right: 0;
    text-align: right;
    width: 100%;
    z-index: 1;
}

.vue-ui-table-main button.td-selector-info-reset {
    background: transparent;
    border: none;
    color: #f17171;
    height: 14px;
    margin-left: 24px;
    padding: 0;
    width: 14px;
}

.vue-ui-table-main button.td-selector-info-reset:hover,
.vue-ui-table-main button.td-selector-info-reset:focus {
    outline: 3px solid #f171717e;
}

.vue-ui-table-main .format-num {
    font-variant-numeric: tabular-nums;
}

.vue-ui-table-main .td-selector-icon {
    margin-bottom: -5px;
    margin-right: 6px;
}

.vue-ui-table-main .vue-ui-table-pagination {
    align-items: center;
    bottom: 24px;
    display: flex;
    flex-direction: row;
    gap: 12px;
    height: 40px;
    justify-content: center;
    position: absolute;
    width: 100%;
    z-index: 1;
}

.vue-ui-table-main button.vue-ui-table-navigation {
    height: 36px;
    padding: 1px;
    width: 36px;
}

.vue-ui-table-main .vue-ui-table-navigation-indicator {
    border-radius: 6px;
    bottom: 70px;
    height: 6px;
    position: absolute;
    transition: all 0.1s ease-in-out;
}

.vue-ui-table-main .vue-ui-table-page-scroller-wrapper {
    align-items: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.vue-ui-table-main input.vue-ui-table-page-scroller {
    height: 24px;
    padding: 0;
}

.vue-ui-table-main .vue-ui-table-paginator {
    position: absolute;
    bottom: 0;
    z-index: 2;
    left: 12px;
    display: flex;
    flex-direction: row;
    gap: 6px;
    font-size: 14px;
    justify-content: center;
    align-items: center;
    width: calc(100% - 24px);
}

.vue-ui-table-main .vue-ui-table-paginator select {
    border-radius: 3px;
}

.vue-ui-table-main .vue-ui-table-size-warning {
    align-items: center;
    bottom: -24px;
    color: #f17171;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    font-size: 12px;
    gap: 6px;
    justify-content: center;
    position: absolute;
    text-align: center;
    width: 100%;
}

.vue-ui-table-main th.vue-ui-table-col-selector {
    height: 12px;
}

.vue-ui-table-main .col-selector {
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;
    width: 100%;
}

.vue-ui-table-main td.vue-ui-table-td-iteration {
    min-width: 48px;
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    text-align: right;
    user-select: none;
}

.vue-ui-table-main .chart-trend {
    font-size: 12px;
    padding-left: 12px;
}

.vue-ui-table-main .th-range-filter {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;
    flex-direction: column;
}

.vue-ui-table-main .th-range-filter input {
    height: 20px;
    width: 60px;
    font-variant-numeric: tabular-nums;
    font-size: 12px;
}

.vue-ui-table-main .th-range-filter label {
    font-size: 12px;
    font-weight: 400;
    margin-bottom: -3px;
}

.vue-ui-table-main .vue-ui-table-donut-legend {
    align-items: center;
    column-gap: 12px;
    display: flex;
    flex-wrap: wrap;
    font-size: 12px;
    justify-content: center;
    margin: 0 auto;
    max-width: 400px;
    padding-bottom: 36px;
}

.vue-ui-table-main .vue-ui-table-donut-legend-item {
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: 3px;
    justify-content: center;
}

.vue-ui-table-main .vue-ui-table-donut-label {
    align-items: center;
    display: flex;
    flex-direction: column;
    font-size: 4px;
    height: 100%;
    justify-content: center;
    text-align: center;
    width: 100%;
}

.vue-ui-table-main .vue-ui-table-donut-label-name {
    font-size: 3px;
    line-height: 3px;
}

.vue-ui-table-main td:focus {
    outline: 3px solid #1f77b490 !important;
}

.vue-ui-table-main .vue-ui-table-export-hub {
    left: 20px;
    position: absolute;
    z-index: 1001;
}

.vue-ui-table-main .vue-ui-table-export-hub-dropdown {
    position: absolute;
    top: 40px;
    left: 0px;
    padding: 24px;
    border-radius: 8px;
    border: 1px solid white;
    box-shadow: 0 6px 12px -6px rgba(0, 0, 0, 0.5);
    transform: scale(0, 0);
    opacity: 0;
}

.vue-ui-table-main .vue-ui-table-export-hub-dropdown[data-is-open='true'] {
    animation: open-dropdown 0.2s ease-in forwards;
}

.vue-ui-table-main .vue-ui-table-export-hub-dropdown[data-is-open='false'] {
    animation: close-dropdown 0.2s ease-in;
}

.vue-ui-table-main .vue-ui-table-export-hub-options {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
    justify-content: center;
}

.vue-ui-table-main .vue-ui-table-export-hub-options button {
    width: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    min-width: 130px;
}

.vue-ui-table-main .vue-ui-table-export-hub-option-wrapper {
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: 12px;
    justify-content: flex-start;
}

.vue-ui-table-main .vue-ui-table-dialog-field {
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
}

.vue-ui-table-dialog-field {
    width: 100%;
}

input.vue-ui-table-dialog-input {
    width: 100% !important;
    padding-right: 44px;
}

.vue-ui-table-dialog-field-button {
    background: transparent;
    border: none !important;
    box-shadow: none;
    outline: none;
    position: absolute;
    right: 0px;
    top: 0px;
    min-width: 36px !important;
    width: 36px;
}

.vue-ui-table-main .vue-ui-table-export-hub-option-wrapper .label,
.vue-ui-table-main .vue-ui-table-dialog-field .label {
    font-size: 12px;
    line-height: 12px;
    margin-bottom: 6px;
    width: 100px;
}

.vue-ui-table-main .td-nan {
    background: #f17171;
}

.vue-ui-table-main .td-has-nan,
.vue-ui-table-main .th-has-nan {
    background: #f17171;
    min-width: 100px;
    color: white;
}

.vue-ui-table-chart-modal .vue-ui-modal-drag-handle {
    cursor: move;
    user-select: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

@keyframes open-dropdown {
    0% {
        transform: scale(1, 0.9);
        opacity: 0;
    }

    50% {
        transform: scale(1, 1.05);
        opacity: 1;
    }

    100% {
        transform: scale(1, 1);
        opacity: 1;
    }
}

@keyframes close-dropdown {
    0% {
        transform: scale(1.05, 1.05);
        opacity: 1;
    }

    100% {
        transform: scale(0, 0);
        opacity: 0;
    }
}
input {
    font-family: inherit !important;
}

label {
    display: flex;
    flex-direction: row;
    gap: 6px;
    align-items: center;
    font-size: 12px;
}
</style>
