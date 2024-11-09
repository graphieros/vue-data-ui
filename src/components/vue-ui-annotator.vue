<template>
  <div class="vue-ui-annotator">
    <div data-html2canvas-ignore>
      <details
        class="vue-ui-annotator-summary"
        @toggle="toggleSummary"
        :style="`${isSummaryOpen ? 'padding-bottom: 12px' : ''}; background: ${FINAL_CONFIG.style.backgroundColor}; color:${FINAL_CONFIG.style.color}; ${
          FINAL_CONFIG.style.fixedTools && isSummaryOpen
            ? 'position: fixed; top: 0; left: 50%; transform: translateX(-50%); z-index: 1;'
            : ''
        }`"
      >
        <summary data-cy="annotator-summary">{{ FINAL_CONFIG.translations.title }}</summary>

        <div class="tool-selection" style="margin-top:24px">
          <!-- MOVE -->
          <button
            data-cy="annotator-button-move"
            :disabled="shapes.length === 0"
            :style="{
                background: isMoveMode ? FINAL_CONFIG.style.buttons.controls.selected.backgroundColor :FINAL_CONFIG.style.buttons.controls.backgroundColor,
                border: isMoveMode ? FINAL_CONFIG.style.buttons.controls.selected.border :FINAL_CONFIG.style.buttons.controls.border,
                color: isMoveMode ? FINAL_CONFIG.style.buttons.controls.selected.color :FINAL_CONFIG.style.buttons.controls.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
            :class="{
              'button-tool': true,
              'button-tool--selected': isMoveMode,
              tooltip: true,
            }"
            @click="
              deleteEmptyTextElement();
              isMoveMode = !isMoveMode;
              activeShape = undefined;
              isDeleteMode = false;
              isDrawMode = false;
              isResizeMode = false;
              isSelectMode = false;
              isTextMode = false;
              isWriting = false;
              showCaret = false;
            "
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="80%" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round" >
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M18 9l3 3l-3 3" />
                <path d="M15 12h6" />
                <path d="M6 9l-3 3l3 3" />
                <path d="M3 12h6" />
                <path d="M9 18l3 3l3 -3" />
                <path d="M12 15v6" />
                <path d="M15 6l-3 -3l-3 3" />
                <path d="M12 3v6" />
            </svg>
            <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                color: FINAL_CONFIG.style.tooltips.color,
                border: FINAL_CONFIG.style.tooltips.border,
                borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
            }">
              {{ FINAL_CONFIG.translations.tooltipMove }}
            </span>
          </button>

          <!-- RESIZE -->
          <button
            :disabled="shapes.length === 0 || activeShape === 'line'"
            :style="{
                background: isResizeMode ? FINAL_CONFIG.style.buttons.controls.selected.backgroundColor :FINAL_CONFIG.style.buttons.controls.backgroundColor,
                border: isResizeMode ? FINAL_CONFIG.style.buttons.controls.selected.border :FINAL_CONFIG.style.buttons.controls.border,
                color: isResizeMode ? FINAL_CONFIG.style.buttons.controls.selected.color :FINAL_CONFIG.style.buttons.controls.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
            :class="{
              'button-tool': true,
              'button-tool--selected': isResizeMode,
              tooltip: true,
            }"
            @click="
              deleteEmptyTextElement();
              isResizeMode = !isResizeMode;
              isMoveMode = false;
              isDeleteMode = false;
              isDrawMode = false;
              isSelectMode = false;
              isTextMode = false;
              isWriting = false;
              activeShape = undefined;
              showCaret = false;
            "
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="80%" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M4 11v8a1 1 0 0 0 1 1h8m-9 -14v-1a1 1 0 0 1 1 -1h1m5 0h2m5 0h1a1 1 0 0 1 1 1v1m0 5v2m0 5v1a1 1 0 0 1 -1 1h-1" />
                <path d="M4 12h7a1 1 0 0 1 1 1v7" />
            </svg>
            <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                color: FINAL_CONFIG.style.tooltips.color,
                border: FINAL_CONFIG.style.tooltips.border,
                borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
            }">
              {{ FINAL_CONFIG.translations.tooltipResize }}
            </span>
          </button>

          <!-- DELETE -->
          <button
            :disabled="shapes.length === 0"
            :style="{
                background: isDeleteMode ? FINAL_CONFIG.style.buttons.controls.selected.backgroundColor :FINAL_CONFIG.style.buttons.controls.backgroundColor,
                border: isDeleteMode ? FINAL_CONFIG.style.buttons.controls.selected.border :FINAL_CONFIG.style.buttons.controls.border,
                color: isDeleteMode ? FINAL_CONFIG.style.buttons.controls.selected.color :FINAL_CONFIG.style.buttons.controls.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
            :class="{
              'button-tool': true,
              'button-tool--selected': isDeleteMode,
              tooltip: true,
            }"
            @click="
              deleteEmptyTextElement();
              isDeleteMode = !isDeleteMode;
              isMoveMode = false;
              isResizeMode = false;
              isSelectMode = false;
              isTextMode = false;
              isWriting = false;
              activeShape = undefined;
              showCaret = false;
            "
          >

          <svg width="80%" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M4 7l16 0" />
                <path d="M10 11l0 6" />
                <path d="M14 11l0 6" />
                <path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" />
                <path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" />
            </svg>
            <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                color: FINAL_CONFIG.style.tooltips.color,
                border: FINAL_CONFIG.style.tooltips.border,
                borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
            }">
              {{ FINAL_CONFIG.translations.tooltipDelete }}
            </span>
          </button>

          <!-- SELECT -->
          <button
            :disabled="!canSelect"
            :style="{
                background: isSelectMode ? FINAL_CONFIG.style.buttons.controls.selected.backgroundColor :FINAL_CONFIG.style.buttons.controls.backgroundColor,
                border: isSelectMode ? FINAL_CONFIG.style.buttons.controls.selected.border :FINAL_CONFIG.style.buttons.controls.border,
                color: isSelectMode ? FINAL_CONFIG.style.buttons.controls.selected.color :FINAL_CONFIG.style.buttons.controls.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
            :class="{
              'button-tool': true,
              'button-tool--selected': isSelectMode,
              tooltip: true,
            }"
            @click="
              deleteEmptyTextElement();
              setShapeTo('group');
              isSelectMode = !isSelectMode;
              isDeleteMode = false;
              isMoveMode = false;
              isResizeMode = false;
              isTextMode = false;
              isWriting = false;
              activeShape = 'group';
              showCaret = false;
            "
          >
            <svg style="width: 80%" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M1,1V5H2V19H1V23H5V22H19V23H23V19H22V5H23V1H19V2H5V1M5,4H19V5H20V19H19V20H5V19H4V5H5M6,6V14H9V18H18V9H14V6M8,8H12V12H8M14,11H16V16H11V14H14"
              />
            </svg>
            <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                color: FINAL_CONFIG.style.tooltips.color,
                border: FINAL_CONFIG.style.tooltips.border,
                borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
            }">
              {{ FINAL_CONFIG.translations.tooltipGroup }}
            </span>
          </button>

          <!-- SEND SHAPE TO FRONT -->
          <button
            :disabled="shapes.length === 0"
            :style="{
                background: FINAL_CONFIG.style.buttons.controls.backgroundColor,
                border: FINAL_CONFIG.style.buttons.controls.border,
                color: FINAL_CONFIG.style.buttons.controls.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
            :class="{ 'button-tool': true, tooltip: true }"
            @click="
              isResizeMode = false;
              isMoveMode = true;
              isDeleteMode = false;
              isDrawMode = false;
              isSelectMode = false;
              isTextMode = false;
              isWriting = false;
              showCaret = false;
              bringShapeTo('front');
            "
          >
            <svg style="width: 80%" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M2,2H11V6H9V4H4V9H6V11H2V2M22,13V22H13V18H15V20H20V15H18V13H22M8,8H16V16H8V8Z"
              />
            </svg>
            <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                color: FINAL_CONFIG.style.tooltips.color,
                border: FINAL_CONFIG.style.tooltips.border,
                borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
            }">
              {{ FINAL_CONFIG.translations.tooltipBringToFront }}
            </span>
          </button>

          <!-- SEND SHAPE TO BACK -->
          <button
            :disabled="shapes.length === 0"
            :style="{
                background: FINAL_CONFIG.style.buttons.controls.backgroundColor,
                border: FINAL_CONFIG.style.buttons.controls.border,
                color: FINAL_CONFIG.style.buttons.controls.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
            :class="{ 'button-tool': true, tooltip: true }"
            @click="
              isResizeMode = false;
              isMoveMode = true;
              isDeleteMode = false;
              isDrawMode = false;
              isSelectMode = false;
              isTextMode = false;
              isWriting = false;
              showCaret = false;
              bringShapeTo('back');
            "
          >
            <svg style="width: 80%" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M2,2H11V11H2V2M9,4H4V9H9V4M22,13V22H13V13H22M15,20H20V15H15V20M16,8V11H13V8H16M11,16H8V13H11V16Z"
              />
            </svg>
            <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                color: FINAL_CONFIG.style.tooltips.color,
                border: FINAL_CONFIG.style.tooltips.border,
                borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
            }">
              {{ FINAL_CONFIG.translations.tooltipBringToBack }}
            </span>
          </button>

          <!-- COPY PASTE LAST SELECTED SHAPE -->
          <button
            :disabled="shapes.length === 0 || activeShape === 'line'"
            :style="{
                background: FINAL_CONFIG.style.buttons.controls.backgroundColor,
                border: FINAL_CONFIG.style.buttons.controls.border,
                color: FINAL_CONFIG.style.buttons.controls.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
            :class="{ 'button-tool': true, tooltip: true }"
            @click="
              deleteEmptyTextElement();
              isResizeMode = false;
              isMoveMode = true;
              isDeleteMode = false;
              isDrawMode = false;
              isSelectMode = false;
              isTextMode = false;
              isWriting = false;
              showCaret = false;
              copyPaste();
            "
          >

            <svg width="80%" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M7 3m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" />
                <path d="M17 17v2a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h2" />
            </svg>
            <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                color: FINAL_CONFIG.style.tooltips.color,
                border: FINAL_CONFIG.style.tooltips.border,
                borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
            }">
              {{ FINAL_CONFIG.translations.tooltipDuplicate }}
            </span>
          </button>

          <!-- UNDO LAST SHAPE -->
          <button
            data-cy="annotator-button-undo"
            :disabled="shapes.length === 0"
            :style="{
                background: FINAL_CONFIG.style.buttons.controls.backgroundColor,
                border: FINAL_CONFIG.style.buttons.controls.border,
                color: FINAL_CONFIG.style.buttons.controls.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
            :class="{ 'button-tool': true, 'button-tool--one-shot': true, tooltip: true }"
            @click="
              isResizeMode = false;
              isMoveMode = false;
              isDeleteMode = false;
              isDrawMode = false;
              isSelectMode = false;
              isTextMode = false;
              isWriting = false;
              activeShape = undefined;
              showCaret = false;
              undoLastShape();
            "
          >
            <svg width="80%" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M9 14l-4 -4l4 -4" />
                <path d="M5 10h11a4 4 0 1 1 0 8h-1" />
            </svg>

            <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                color: FINAL_CONFIG.style.tooltips.color,
                border: FINAL_CONFIG.style.tooltips.border,
                borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
            }">
              {{ FINAL_CONFIG.translations.tooltipUndo }}
            </span>
          </button>

          <!-- PRINT -->
          <button
            v-if="FINAL_CONFIG.style.showPrint"
            :style="{
                background: FINAL_CONFIG.style.buttons.controls.backgroundColor,
                border: FINAL_CONFIG.style.buttons.controls.border,
                color: FINAL_CONFIG.style.buttons.controls.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
            :class="{ 'button-tool': true, tooltip: true }"
            @click="print"
          >
            <svg width="80%" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M17 17h2a2 2 0 0 0 2 -2v-4a2 2 0 0 0 -2 -2h-14a2 2 0 0 0 -2 2v4a2 2 0 0 0 2 2h2" />
                <path d="M17 9v-4a2 2 0 0 0 -2 -2h-6a2 2 0 0 0 -2 2v4" />
                <path d="M7 13m0 2a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2v4a2 2 0 0 1 -2 2h-6a2 2 0 0 1 -2 -2z" />
            </svg>
            <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                color: FINAL_CONFIG.style.tooltips.color,
                border: FINAL_CONFIG.style.tooltips.border,
                borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
            }">
              {{ FINAL_CONFIG.translations.tooltipPdf }}
            </span>
          </button>

          <!-- SAVE -->
          <button
            v-if="FINAL_CONFIG.style.showSave"
            :style="{
                background: FINAL_CONFIG.style.buttons.controls.backgroundColor,
                border: FINAL_CONFIG.style.buttons.controls.border,
                color: FINAL_CONFIG.style.buttons.controls.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
            :class="{ 'button-tool': true, tooltip: true }"
            @click="save"
          >
            <svg width="100%" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M6 4h10l4 4v10a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2" />
                <path d="M12 14m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M14 4l0 4l-6 0l0 -4" />
            </svg>
            <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                color: FINAL_CONFIG.style.tooltips.color,
                border: FINAL_CONFIG.style.tooltips.border,
                borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
            }">
              {{ FINAL_CONFIG.translations.tooltipSave }}
            </span>
          </button>
        </div>

        <div class="tool-selection" style="margin-top:6px">
        <!-- SET SHAPE TO CIRCLE -->
          <button
            data-cy="annotator-button-circle"
            :class="{
              'button-tool': true,
              'button-tool--selected': activeShape === 'circle',
              tooltip: true
            }"
            :style="{
                background: activeShape === 'circle' ? FINAL_CONFIG.style.buttons.shapes.selected.backgroundColor :FINAL_CONFIG.style.buttons.shapes.backgroundColor,
                border: activeShape === 'circle' ? FINAL_CONFIG.style.buttons.shapes.selected.border :FINAL_CONFIG.style.buttons.shapes.border,
                color: activeShape === 'circle' ? FINAL_CONFIG.style.buttons.shapes.selected.color :FINAL_CONFIG.style.buttons.shapes.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
            @click="
              setShapeTo('circle');
              isSelectMode = false;
            "
          >
            <svg viewBox="0 0 12 12" style="width: 100%">
              <circle
                :cx="6"
                :cy="6"
                r="4"
                :fill="
                  options.circle.filled
                    ? activeShape === 'circle'
                      ? selectedColor + colorTransparency
                      : selectedColor + colorTransparency
                    : 'none'
                "
                stroke="currentColor"
              ></circle>
            </svg>
            <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                color: FINAL_CONFIG.style.tooltips.color,
                border: FINAL_CONFIG.style.tooltips.border,
                borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
            }">
              {{ FINAL_CONFIG.translations.tooltipShapeCircle }}
            </span>
          </button>
          <div class="tool-input" v-if="activeShape === 'circle'">
            <label for="circleFill">{{ FINAL_CONFIG.translations.filled }}</label>
            <input
              type="checkbox"
              v-model="options.circle.filled"
              @change="setFillOfSelectedCircle"
              :checked="options.circle.filled"
            />
          </div>

          <!-- SET SHAPE TO RECT -->
          <button
            data-cy="annotator-button-rect"
            :class="{
              'button-tool': true,
              'button-tool--selected': activeShape === 'rect',
              tooltip: true
            }"
            :style="{
                background: activeShape === 'rect' ? FINAL_CONFIG.style.buttons.shapes.selected.backgroundColor :FINAL_CONFIG.style.buttons.shapes.backgroundColor,
                border: activeShape === 'rect' ? FINAL_CONFIG.style.buttons.shapes.selected.border :FINAL_CONFIG.style.buttons.shapes.border,
                color: activeShape === 'rect' ? FINAL_CONFIG.style.buttons.shapes.selected.color :FINAL_CONFIG.style.buttons.shapes.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
            @click="
              setShapeTo('rect');
              isSelectMode = false;
            "
          >
            <svg viewBox="0 0 12 12" style="width: 100%">
              <rect
                x="3"
                y="3"
                style="rx: 0 !important; ry: 0 !important"
                height="6"
                width="6"
                :fill="
                  options.rect.filled
                    ? activeShape === 'rect'
                      ? selectedColor + colorTransparency
                      : selectedColor + colorTransparency
                    : 'none'
                "
                stroke="currentColor"
              />
            </svg>
            <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                color: FINAL_CONFIG.style.tooltips.color,
                border: FINAL_CONFIG.style.tooltips.border,
                borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
            }">
              {{ FINAL_CONFIG.translations.tooltipShapeRect }}
            </span>
          </button>
          <div class="tool-input" v-if="activeShape === 'rect'">
            <label for="rectFill">{{ FINAL_CONFIG.translations.filled }}</label>
            <input
              id="rectFill"
              type="checkbox"
              v-model="options.rect.filled"
              @change="setFillOfSelectedRect"
              :checked="options.rect.filled"
            />
          </div>

          <!-- SET SHAPE TO ARRROW -->
          <button
            data-cy="annotator-button-arrow"
            :class="{
              'button-tool': true,
              'button-tool--selected': activeShape === 'arrow',
              tooltip: true
            }"
            :style="{
                background: activeShape === 'arrow' ? FINAL_CONFIG.style.buttons.shapes.selected.backgroundColor :FINAL_CONFIG.style.buttons.shapes.backgroundColor,
                border: activeShape === 'arrow' ? FINAL_CONFIG.style.buttons.shapes.selected.border :FINAL_CONFIG.style.buttons.shapes.border,
                color: activeShape === 'arrow' ? FINAL_CONFIG.style.buttons.shapes.selected.color :FINAL_CONFIG.style.buttons.shapes.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
            @click="
              setShapeTo('arrow');
              isSelectMode = false;
            "
          >
            <svg viewBox="0 0 24 24" style="width: 100%">
              <path
                :stroke="
                  options.arrow.filled
                    ? activeShape === 'arrow'
                      ? 'white'
                      : 'grey'
                    : 'none'
                "
                stroke-width="2"
                d="M5,19 19,5 14,5 19,10.5 19,5"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                color: FINAL_CONFIG.style.tooltips.color,
                border: FINAL_CONFIG.style.tooltips.border,
                borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
            }">
              {{ FINAL_CONFIG.translations.tooltipShapeArrow }}
            </span>
          </button>

          <!-- SET SHAPE TO FREEHAND LINE -->
          <button
            data-cy="annotator-button-freehand"
            :class="{
              'button-tool': true,
              'button-tool--selected': activeShape === 'line',
              tooltip: true
            }"
            :style="{
                background: activeShape === 'line' ? FINAL_CONFIG.style.buttons.shapes.selected.backgroundColor :FINAL_CONFIG.style.buttons.shapes.backgroundColor,
                border: activeShape === 'line' ? FINAL_CONFIG.style.buttons.shapes.selected.border :FINAL_CONFIG.style.buttons.shapes.border,
                color: activeShape === 'line' ? FINAL_CONFIG.style.buttons.shapes.selected.color :FINAL_CONFIG.style.buttons.shapes.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
            @click="
              setShapeTo('line');
              isSelectMode = false;
            "
          >
            <svg width="80%" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M3 15c2 3 4 4 7 4s7 -3 7 -7s-3 -7 -6 -7s-5 1.5 -5 4s2 5 6 5s8.408 -2.453 10 -5" />
            </svg>
            <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                color: FINAL_CONFIG.style.tooltips.color,
                border: FINAL_CONFIG.style.tooltips.border,
                borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
            }">
              {{ FINAL_CONFIG.translations.tooltipShapeFreehand }}
            </span>
          </button>

          <!-- SET STROKE WIDTH -->
          <div v-if="['arrow', 'circle', 'rect', 'line'].includes(activeShape)">
            <div
              style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
              "
            >
              <label for="textFont" style="font-size: 0.7em">{{
                FINAL_CONFIG.translations.thickness
              }}</label>
              <input
                id="textFont"
                type="number"
                v-model="strokeSize"
                @input="setStrokeWidthOfSelectedShape"
                style="
                  padding: 0 4px;
                  width: 40px;
                  border: 1px solid #dadada;
                  border-radius: 3px;
                "
              />
            </div>
          </div>

          <!-- SET BORDER DASHARRAY -->
          <div v-if="['arrow', 'circle', 'rect'].includes(activeShape)">
            <div
              style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
              "
            >
              <label for="dashStyle" style="font-size: 0.7em">{{
                FINAL_CONFIG.translations.dashedLines
              }}</label>
              <svg
                viewBox="0 0 24 24"
                height="24"
                width="24"
                style="margin-bottom: -5px; margin-top: -10px"
              >
                <line
                  x1="0"
                  x2="24"
                  y1="12"
                  y2="12"
                  stroke-width="2"
                  stroke="black"
                  stroke-dasharray="3"
                ></line>
              </svg>
              <input
                id="dashStyle"
                name="dashStyle"
                type="checkbox"
                v-model="isDash"
                @change="setSelectedShapeToDash"
                :checked="isDash"
              />
            </div>
          </div>

          <!-- SET SHAPE TO TEXT -->
          <button
            data-cy="annotator-button-text"
            :class="{
              'button-tool': true,
              'button-tool--selected': isTextMode,
              tooltip: true
            }"
            :style="{
                background: isTextMode ? FINAL_CONFIG.style.buttons.shapes.selected.backgroundColor :FINAL_CONFIG.style.buttons.shapes.backgroundColor,
                border: isTextMode ? FINAL_CONFIG.style.buttons.shapes.selected.border :FINAL_CONFIG.style.buttons.shapes.border,
                color: isTextMode ? FINAL_CONFIG.style.buttons.shapes.selected.color :FINAL_CONFIG.style.buttons.shapes.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
            @click="
              deleteEmptyTextElement();
              isTextMode = !isTextMode;
              isDeleteMode = false;
              isMoveMode = false;
              isResizeMode = false;
              isSelectMode = false;
              isDrawMode = false;
              activeShape = undefined;
            "
          >
            <svg style="width: 80%" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M18.5,4L19.66,8.35L18.7,8.61C18.25,7.74 17.79,6.87 17.26,6.43C16.73,6 16.11,6 15.5,6H13V16.5C13,17 13,17.5 13.33,17.75C13.67,18 14.33,18 15,18V19H9V18C9.67,18 10.33,18 10.67,17.75C11,17.5 11,17 11,16.5V6H8.5C7.89,6 7.27,6 6.74,6.43C6.21,6.87 5.75,7.74 5.3,8.61L4.34,8.35L5.5,4H18.5Z"
              />
            </svg>
            <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                color: FINAL_CONFIG.style.tooltips.color,
                border: FINAL_CONFIG.style.tooltips.border,
                borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
            }">
              {{ FINAL_CONFIG.translations.tooltipShapeText }}
            </span>
          </button>

          <!-- TEXT SET FONT SIZE -->
          <div v-if="isTextMode">
            <div
              style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
              "
            >
              <label for="textFont" style="font-size: 0.7em">{{
                FINAL_CONFIG.translations.fontSize
              }}</label>
              <input
                id="textFont"
                type="number"
                v-model="textFont"
                @input="setCurrentStyleOfSelectedText"
                style="
                  padding: 0 4px;
                  width: 40px;
                  border: 1px solid #dadada;
                  border-radius: 3px;
                "
              />
            </div>
          </div>

          <!-- TEXT SET ALIGN START -->
          <div v-if="isTextMode">
            <button
              :class="{
                'button-tool': true,
                'button-tool--selected': textAlign === 'start',
                tooltip: true
              }"
              :style="{
                background: textAlign === 'start' ? FINAL_CONFIG.style.buttons.shapes.selected.backgroundColor :FINAL_CONFIG.style.buttons.shapes.backgroundColor,
                border: textAlign === 'start' ? FINAL_CONFIG.style.buttons.shapes.selected.border :FINAL_CONFIG.style.buttons.shapes.border,
                color: textAlign === 'start' ? FINAL_CONFIG.style.buttons.shapes.selected.color :FINAL_CONFIG.style.buttons.shapes.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
              @click="
                isDeleteMode = false;
                isMoveMode = false;
                isResizeMode = false;
                isDrawMode = false;
                isSelectMode = false;
                activeShape = undefined;
                textAlign = 'start';
                setSelectedTextAlignTo('start');
              "
            >
                <svg width="80%" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M4 6l16 0" />
                    <path d="M4 12l10 0" />
                    <path d="M4 18l14 0" />
                </svg>
                <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                    backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                    color: FINAL_CONFIG.style.tooltips.color,
                    border: FINAL_CONFIG.style.tooltips.border,
                    borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                    boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
                }">
                    {{ FINAL_CONFIG.translations.tooltipShapeTextLeft }}
                </span>
            </button>
          </div>

          <!-- TEXT SET ALIGN MIDDLE -->
          <div v-if="isTextMode">
            <button
              :class="{
                'button-tool': true,
                'button-tool--selected': textAlign === 'middle',
                tooltip: true
              }"
              :style="{
                background: textAlign === 'middle' ? FINAL_CONFIG.style.buttons.shapes.selected.backgroundColor :FINAL_CONFIG.style.buttons.shapes.backgroundColor,
                border: textAlign === 'middle' ? FINAL_CONFIG.style.buttons.shapes.selected.border :FINAL_CONFIG.style.buttons.shapes.border,
                color: textAlign === 'middle' ? FINAL_CONFIG.style.buttons.shapes.selected.color :FINAL_CONFIG.style.buttons.shapes.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
              :disabled="isBulletTextMode"
              @click="
                isDeleteMode = false;
                isMoveMode = false;
                isResizeMode = false;
                isDrawMode = false;
                isSelectMode = false;
                activeShape = undefined;
                textAlign = 'middle';
                setSelectedTextAlignTo('middle');
              "
            >
                <svg width="80%" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M4 6l16 0" />
                    <path d="M8 12l8 0" />
                    <path d="M6 18l12 0" />
                </svg>
                <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                    backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                    color: FINAL_CONFIG.style.tooltips.color,
                    border: FINAL_CONFIG.style.tooltips.border,
                    borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                    boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
                }">
                    {{ FINAL_CONFIG.translations.tooltipShapeTextCenter }}
                </span>
            </button>
          </div>

          <!-- TEXT SET ALIGN END -->
          <div v-if="isTextMode">
            <button
              :class="{
                'button-tool': true,
                'button-tool--selected': textAlign === 'end',
                tooltip: true
              }"
              :style="{
                background: textAlign === 'end' ? FINAL_CONFIG.style.buttons.shapes.selected.backgroundColor :FINAL_CONFIG.style.buttons.shapes.backgroundColor,
                border: textAlign === 'end' ? FINAL_CONFIG.style.buttons.shapes.selected.border :FINAL_CONFIG.style.buttons.shapes.border,
                color: textAlign === 'end' ? FINAL_CONFIG.style.buttons.shapes.selected.color :FINAL_CONFIG.style.buttons.shapes.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
              :disabled="isBulletTextMode"
              @click="
                isDeleteMode = false;
                isMoveMode = false;
                isResizeMode = false;
                isDrawMode = false;
                isSelectMode = false;
                activeShape = undefined;
                textAlign = 'end';
                setSelectedTextAlignTo('end');
              "
            >
                <svg width="80%" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M4 6l16 0" />
                    <path d="M10 12l10 0" />
                    <path d="M6 18l14 0" />
                </svg>
                <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                    backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                    color: FINAL_CONFIG.style.tooltips.color,
                    border: FINAL_CONFIG.style.tooltips.border,
                    borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                    boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
                }">
                    {{ FINAL_CONFIG.translations.tooltipShapeTextRight }}
                </span>
            </button>
          </div>

          <!-- TEXT SET BULLET POINTS MODE -->
          <div v-if="isTextMode">
            <button
              :class="{
                'button-tool': true,
                'button-tool--selected': isBulletTextMode,
                tooltip: true
              }"
              :style="{
                background: isBulletTextMode ? FINAL_CONFIG.style.buttons.shapes.selected.backgroundColor :FINAL_CONFIG.style.buttons.shapes.backgroundColor,
                border: isBulletTextMode ? FINAL_CONFIG.style.buttons.shapes.selected.border :FINAL_CONFIG.style.buttons.shapes.border,
                color: isBulletTextMode ? FINAL_CONFIG.style.buttons.shapes.selected.color :FINAL_CONFIG.style.buttons.shapes.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
              @click="
                isDeleteMode = false;
                isMoveMode = false;
                isResizeMode = false;
                isDrawMode = false;
                isSelectMode = false;
                activeShape = undefined;
                isBulletTextMode = !isBulletTextMode;
                textAlign = 'start';
                setSelectedTextAlignTo('start');
                setCurrentStyleOfSelectedText();
              "
            >
                <svg width="100%" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M9 6l11 0" />
                    <path d="M9 12l11 0" />
                    <path d="M9 18l11 0" />
                    <path d="M5 6l0 .01" />
                    <path d="M5 12l0 .01" />
                    <path d="M5 18l0 .01" />
                </svg>
                <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                    backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                    color: FINAL_CONFIG.style.tooltips.color,
                    border: FINAL_CONFIG.style.tooltips.border,
                    borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                    boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
                }">
                    {{ FINAL_CONFIG.translations.tooltipShapeTextBullet }}
                </span>
            </button>
          </div>

          <!-- TEXT SET BOLD -->
          <div v-if="isTextMode">
            <button
              :class="{
                'button-tool': true,
                'button-tool--selected': isBold,
                tooltip: true
              }"
              :style="{
                background: isBold ? FINAL_CONFIG.style.buttons.shapes.selected.backgroundColor :FINAL_CONFIG.style.buttons.shapes.backgroundColor,
                border: isBold ? FINAL_CONFIG.style.buttons.shapes.selected.border :FINAL_CONFIG.style.buttons.shapes.border,
                color: isBold ? FINAL_CONFIG.style.buttons.shapes.selected.color :FINAL_CONFIG.style.buttons.shapes.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
              @click="
                isDeleteMode = false;
                isMoveMode = false;
                isResizeMode = false;
                isDrawMode = false;
                isSelectMode = false;
                activeShape = undefined;
                isBold = !isBold;
                setCurrentStyleOfSelectedText();
              "
            >
                <svg width="100%" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M7 5h6a3.5 3.5 0 0 1 0 7h-6z" />
                    <path d="M13 12h1a3.5 3.5 0 0 1 0 7h-7v-7" />
                </svg>
                <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                    backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                    color: FINAL_CONFIG.style.tooltips.color,
                    border: FINAL_CONFIG.style.tooltips.border,
                    borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                    boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
                }">
                    {{ FINAL_CONFIG.translations.tooltipShapeTextBold }}
                </span>
            </button>
          </div>

          <!-- TEXT SET ITALIC -->
          <div v-if="isTextMode">
            <button
              :class="{
                'button-tool': true,
                'button-tool--selected': isItalic,
                tooltip: true
              }"
              :style="{
                background: isItalic ? FINAL_CONFIG.style.buttons.shapes.selected.backgroundColor :FINAL_CONFIG.style.buttons.shapes.backgroundColor,
                border: isItalic ? FINAL_CONFIG.style.buttons.shapes.selected.border :FINAL_CONFIG.style.buttons.shapes.border,
                color: isItalic ? FINAL_CONFIG.style.buttons.shapes.selected.color :FINAL_CONFIG.style.buttons.shapes.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
              @click="
                isDeleteMode = false;
                isMoveMode = false;
                isResizeMode = false;
                isDrawMode = false;
                isSelectMode = false;
                activeShape = undefined;
                isItalic = !isItalic;
                setCurrentStyleOfSelectedText();
              "
            >
                <svg width="100%" height="44" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M11 5l6 0" />
                    <path d="M7 19l6 0" />
                    <path d="M14 5l-4 14" />
                </svg>
                <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                    backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                    color: FINAL_CONFIG.style.tooltips.color,
                    border: FINAL_CONFIG.style.tooltips.border,
                    borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                    boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
                }">
                    {{ FINAL_CONFIG.translations.tooltipShapeTextItalic }}
                </span>
            </button>
          </div>

          <!-- TEXT SET UNDERLINE -->
          <div v-if="isTextMode">
            <button
              :class="{
                'button-tool': true,
                'button-tool--selected': isUnderline,
                tooltip: true
              }"
              :style="{
                background: isUnderline ? FINAL_CONFIG.style.buttons.shapes.selected.backgroundColor :FINAL_CONFIG.style.buttons.shapes.backgroundColor,
                border: isUnderline ? FINAL_CONFIG.style.buttons.shapes.selected.border :FINAL_CONFIG.style.buttons.shapes.border,
                color: isUnderline ? FINAL_CONFIG.style.buttons.shapes.selected.color :FINAL_CONFIG.style.buttons.shapes.color,
                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`
            }"
              @click="
                isDeleteMode = false;
                isMoveMode = false;
                isResizeMode = false;
                isDrawMode = false;
                isSelectMode = false;
                activeShape = undefined;
                isUnderline = !isUnderline;
                setCurrentStyleOfSelectedText();
              "
            >
                <svg width="100%" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M7 5v5a5 5 0 0 0 10 0v-5" />
                    <path d="M5 19h14" />
                </svg>
                <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                    backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                    color: FINAL_CONFIG.style.tooltips.color,
                    border: FINAL_CONFIG.style.tooltips.border,
                    borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                    boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
                }">
                    {{ FINAL_CONFIG.translations.tooltipShapeTextUnderline }}
                </span>
            </button>
          </div>

          <!-- COLOR PICKER -->
          <div
            style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            "
            class="tooltip"
          >
            <input
              type="color"
              id="colorPicker"
              name="colorPicker"
              v-model="selectedColor"
              @input="setColorOfSelectedShape"
              :style="`height: 30px; width: 30px; border-radius: ${FINAL_CONFIG.style.buttons.borderRadius}px; cursor: pointer`"
            />
            <span v-if="FINAL_CONFIG.style.showTooltips" class="tooltiptext" :style="{
                    backgroundColor: FINAL_CONFIG.style.tooltips.backgroundColor,
                    color: FINAL_CONFIG.style.tooltips.color,
                    border: FINAL_CONFIG.style.tooltips.border,
                    borderRadius: `${FINAL_CONFIG.style.tooltips.borderRadius}px`,
                    boxShadow: FINAL_CONFIG.style.tooltips.boxShadow
                }">
                    {{ FINAL_CONFIG.translations.tooltipShapeColor }}
                </span>
          </div>
          <div
            style="
              display: flex;
              flex-direction: column;
              align-items: start;
              justify-content: center;
            "
          >
            <label for="colorTransparency" style="font-size: 0.7em">
              {{ FINAL_CONFIG.translations.colorAlpha }}:
              {{ transparency > 98 ? 100 : transparency }} %
            </label>
            <input
              id="colorTransparency"
              name="colorTransparency"
              type="range"
              v-model="transparency"
              @input="setTransparencyOfSelectedShape"
              :min="0"
              :max="100"
              style="width: 100px"
            />
          </div>
        </div>
      </details>
    </div>

    <div
      class="annotator annotator__wrapper"
      ref="drawSvgContainer"
      style="position: relative"
    >
      <slot data-cy="annotator-slot"></slot>
      <svg
        id="annotatorSvg"
        v-if="isSummaryOpen"
        :key="step"
        ref="mainSvg"
        :class="{ draw: true, 'draw--free': activeShape === 'line' }"
        :style="`cursor:${cursorClass}; font-family: Helvetica; z-index: 100000000;`"
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        :width="sourceWidth"
        :height="sourceHeight"
        @pointerdown="chooseAction($event)"
        @pointerup="resetDraw"
        @touchend="resetDraw"
        @touchstart="setPointer($event); clickSvg($event); "
        @pointermove="
          setPointer($event);
          chooseMove($event);
        "
        @pointerout="
          preventEdit = true;
          hoveredShapeId = undefined;
        "
        @pointerover="allowEditAndHoverShapes($event)"
        @click="clickSvg($event)"
        style="position: absolute; top: 0; left: 0"
      >
        <g
          v-for="(shape, i) in userShapes"
          :key="`shape_${i}`"
          :id="shape.id"
          v-html="shape"
          @click="
            clickShape($event);
            isMoveMode = false;
          "
        ></g>
      </svg>
      <svg
        style="position: absolute; top: 0; left: 0"
        v-if="isPrinting"
        :height="sourceHeight"
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        :width="sourceWidth"
      >
        <circle
          class="animated-circle-print"
          :cx="svgWidth / 2"
          :cy="svgHeight / 2"
          r="50"
          stroke="#6376DD"
          stroke-width="10"
          fill="none"
        />
      </svg>
    </div>
  </div>
</template>

<script>
import html2canvas from "html2canvas";
import JsPDF from "jspdf";
import { opacity, treeShake, convertConfigColors } from "../lib";
import { useConfig } from "../useConfig";

// TODO: add tooltips for all buttons

export default {
  props: {
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    dataset: {
        type: Object,
        default() {
            return {
                shapes: [],
                lastSelectedShape: undefined
            }
        }
    },
  },
  data() {
    return {
      activeShape: undefined,
      strokeSize: 1,
      currentPointer: {
        start: {
          x: 0,
          y: 0,
        },
        end: {
          x: 0,
          end: 0,
        },
      },
      currentTarget: undefined,
      hoveredShapeId: undefined,
      isBold: false,
      isBulletTextMode: false,
      isDash: false,
      isDeleteMode: false,
      isDrawing: false,
      isDrawingNewShape: true,
      isDrawMode: false,
      isItalic: false,
      isMouseDown: false,
      isMoveMode: false,
      isPrinting: false,
      isResizeMode: false,
      isSelectMode: false,
      isSummaryOpen: false,
      isTextMode: false,
      isUnderline: false,
      isWriting: false,
      lastSelectedShape: this.dataset.lastSelectedShape,
      pointerDownId: -1,
      pointerPosition: {
        x: 0,
        y: 0,
      },
      preventEdit: true,
      selectedGroup: [],
      shapes: this.dataset.shapes ? this.dataset.shapes : [],
      shapesOrder: [],
      step: Math.round(Math.random()) * 100000,
      svgHeight: 1000,
      svgWidth: 1000,
      options: {
        arrow: {
          color: "grey",
          filled: true,
        },
        circle: {
          color: "grey",
          filled: false,
          radius: 3,
          strokeWidth: 2,
        },
        rect: {
          color: "grey",
          filled: false,
          strokeWidth: 2,
          height: 12,
          width: 12,
        },
      },
      selectedColor: "#000000",
      showCaret: false,
      sizeRatio: 1,
      slottedSvg: undefined,
      sourceWidth: 1,
      sourceHeight: 1,
      textAlign: "start",
      textFont: 20,
      transparency: 100,
      transparencyCodes: opacity,
    };
  },
  watch: {
    shapes: {
      handler(newVal) {
        if (newVal.length === 0) {
          this.lastSelectedShape = undefined;
        }
      },
    },
  },
  computed: {
    FINAL_CONFIG() {
        const DEFAULT_CONFIG = useConfig().vue_ui_annotator;

        if(!Object.keys(this.config || {}).length) {
            return DEFAULT_CONFIG
        }
        
        const reconcilied = this.treeShake({
            defaultConfig: DEFAULT_CONFIG,
            userConfig: this.config
        });

        return this.convertConfigColors(reconcilied);
    },
    canSelect() {
      return (
        this.shapes.filter((shape) => !["line", "group"].includes(shape.type)).length > 1
      );
    },
    colorTransparency() {
      return this.transparencyCodes[this.transparency > 98 ? 98 : this.transparency];
    },
    cursorClass() {
      switch (true) {
        case this.isDeleteMode:
          return "default";

        case this.isMoveMode:
          return "move";

        case this.isTextMode:
          return "text";

        case this.isResizeMode:
          return "se-resize";

        default:
          return "";
      }
    },
    records() {
      return this.shapes;
    },
    userShapes() {
      return this.records.map((shape) => {
        switch (true) {
          case shape && shape.type === "arrow":
            const shapeWidthMax = shape.strokeWidth > 3 ? 5 : 10;
            const shapeWidthMin = shape.strokeWidth > 3 ? 2.5 : 5;
            return `
                        <defs>
                        <marker 
                            id="${shape.id}" 
                            markerWidth="${shapeWidthMax}" 
                            markerHeight="${shapeWidthMax}" 
                            refX="0" 
                            refY="${shapeWidthMin}" 
                            orient="auto"
                        >
                            <polygon 
                            points="0 0,${shapeWidthMax} ${shapeWidthMin}, 0 ${shapeWidthMax}" 
                            fill="${shape.color}"
                            />
                        </marker>
                        </defs>
                        ${this.includeSelectionIndicator(shape)}
                        <g id="${shape.id}">
                            <path 
                            style="stroke-linecap: round !important; ${
                              shape.isDash
                                ? `stroke-dasharray: ${shape.strokeWidth * 3}`
                                : ""
                            }" 
                            stroke="${shape.color}" 
                            id="${shape.id}" 
                            d="M${shape.x},${shape.y} ${shape.endX},${shape.endY}" 
                            stroke-width="${shape.strokeWidth}" 
                            marker-end="url(#${shape.id})"
                            />
                        </g>
                        <g id="${shape.id}">
                        <rect 
                            id="${shape.id}"
                            x="${shape.x - 10}"
                            y="${shape.y - 10}"
                            height="20"
                            width="20"
                            fill="rgba(0,0,0,0.3)"
                            style="display:${
                              this.isResizeMode || this.isMoveMode ? "initial" : "none"
                            }; rx:1 !important; ry:1 !important;"
                        />
                        </g>
                        ${this.includeDeleteButton(shape)}
                        </g>
                        `;

          case shape && shape.type === "circle":
            return `
                            <g id="${shape.id}">
                                ${this.includeSelectionIndicator(shape)}
                                <circle 
                                id="${shape.id}" 
                                cx="${shape.x}" 
                                cy="${shape.y}" 
                                r="${
                                  shape.circleRadius
                                    ? shape.circleRadius
                                    : Number.MIN_VALUE
                                }"
                                fill="${
                                  shape.isFilled
                                    ? shape.color + shape.alpha
                                    : "rgba(255,255,255,0.001)"
                                }" 
                                stroke="${shape.color + shape.alpha}" 
                                stroke-width="${shape.strokeWidth}"
                                style="${
                                  shape.isDash
                                    ? `stroke-dasharray: ${shape.strokeWidth * 3}`
                                    : ""
                                }"
                                >
                                </circle>
                            </g>
                            
                            ${this.includeDeleteButton(shape)}`;

          case shape && shape.type === "group":
            return `<g id="${shape.id}">
                            <rect
                                id="${this.isResizeMode ? "" : shape.id}"
                                x="${shape.x}"
                                y="${shape.y}"
                                fill="transparent"
                                height="${shape.rectHeight}"
                                width="${shape.rectWidth}"
                                stroke="grey"
                                stroke-width="1"
                                style="rx:1 !important; ry:1 !important; ${
                                  shape.isDash
                                    ? `stroke-dasharray: ${shape.strokeWidth * 3}`
                                    : ""
                                }; display:${
              this.isSelectMode ||
              this.isDeleteMode ||
              (this.hoveredShapeId && this.hoveredShapeId === shape.id)
                ? "initial"
                : "none"
            };"
                            />
                <g id="${shape.id}">
                ${shape.content ? shape.content : ""}
                </g>
                            ${this.includeDeleteButton(shape)}
                            </g> `;

          case shape && shape.type === "rect":
            return `<g id="${shape.id}">
                            ${this.includeSelectionIndicator(shape)}
                            <rect
                                id="${this.isResizeMode ? "" : shape.id}"
                                x="${shape.x}"
                                y="${shape.y}"
                                fill="${
                                  shape.isFilled
                                    ? shape.color + shape.alpha
                                    : "rgba(255,255,255,0.001)"
                                }"
                                height="${shape.rectHeight}"
                                width="${shape.rectWidth}"
                                stroke="${shape.color + shape.alpha}"
                                stroke-width="${shape.strokeWidth}"
                                style="rx:1 !important; ry:1 !important; ${
                                  shape.isDash
                                    ? `stroke-dasharray: ${shape.strokeWidth * 3}`
                                    : ""
                                }"
                            />
                            <rect id="${shape.id}"
                                x="${shape.x + shape.rectWidth}"
                                y="${shape.y + shape.rectHeight}"
                                height="20"
                                width="20"
                                fill="rgba(0,0,0,0.3)"
                                style="display:${
                                  this.isResizeMode ? "initial" : "none"
                                }; rx:1 !important; ry:1 !important;"
                            />
                            ${this.includeDeleteButton(shape)}
                            </g> `;

          case shape && shape.type === "line":
            return `
                    <g id="${shape.id}">
                        <path 
                        id="${shape.id}" 
                        d="M${shape.path ? shape.path : ""}" 
                        style="stroke:${
                          shape.color + shape.alpha
                        } !important; fill:none; stroke-width:${
              shape.strokeWidth
            } !important; stroke-linecap: round !important; stroke-linejoin: round !important;"        
                        />
                ${this.includeDeleteButton(shape)}
                    </g>
                    `;

          case shape && shape.type === "text":
            const parsedText = shape.textContent.split("‎");
            const parsedContent = [];
            for (let i = 0; i < parsedText.length; i += 1) {
              parsedContent.push(`
            ${
              shape.isBulletTextMode
                ? `<tspan x="${shape.x - shape.fontSize}" y="${
                    shape.y + shape.fontSize * i
                  }" id="${shape.id}" font-size="${shape.fontSize / 2}">⬤</tspan>`
                : ""
            }
                    <tspan id="${shape.id}" x="${shape.x}" y="${
                shape.y + shape.fontSize * i
              }">
                        ${parsedText[i]}
                    </tspan>`);
            }
            return `
                            ${this.includeSelectionIndicator(shape)}
                            ${this.computeTextElement(
                              shape,
                              parsedContent,
                              shape.isBulletTextMode
                            )}
                            `;
          default:
            break;
        }
      });
    },
  },
  mounted() {
    const wrapper = this.$refs.drawSvgContainer;
    let foundSvg = false;

    this.walkTheDOM(wrapper, (node) => {
      if (!foundSvg) {
        if (["DIV", "svg", "section", "canvas"].includes(node.tagName)) {
          this.slottedSvg = node;
          foundSvg = true;
          return;
        }
      }
    });

    const slottedSvgRect = this.slottedSvg.getBoundingClientRect();

    this.sizeRatio = slottedSvgRect.height / slottedSvgRect.width;

    this.svgWidth = 1000;
    this.svgHeight = this.sizeRatio * 1000;
    this.sourceWidth = slottedSvgRect.width;
    this.sourceHeight = slottedSvgRect.height;

    const myObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        this.sourceWidth = entry.contentRect.width;
        this.sourceHeight = entry.contentRect.height;
        this.sizeRatio = entry.contentRect.height / entry.contentRect.width;
        this.svgHeight = this.sizeRatio * 1000;
      });
    });

    myObserver.observe(this.slottedSvg);

    window.addEventListener("keydown", (e) => {
      this.write(e);
    });
  },
  destroyed() {
    window.removeEventListener("keydown", (e) => {
      this.write(e);
    });
  },
  methods: {
    treeShake,
    convertConfigColors,
    bringShapeTo(layer) {
      const thisShape = this.shapes.find(
        (shape) => shape.id === this.lastSelectedShape.id
      );
      switch (true) {
        case layer === "front":
          this.shapes = this.shapes.filter((shape) => shape.id !== thisShape.id);
          this.shapes.push(thisShape);
          break;

        case layer === "back":
          this.shapes = this.shapes.filter((shape) => shape.id !== thisShape.id);
          this.shapes = [thisShape, ...this.shapes];
          break;

        default:
          return;
      }
    },
    clickSvg(e) {
      if (this.isDeleteMode) {
        return;
      }

      this.deleteEmptyTextElement();

      if (this.isTextMode) {
        this.isWriting = true;
        this.showCaret = true;
      } else {
        this.isWriting = false;
        this.showCaret = false;
        this.isTextMode = false;
      }

      let id = `text_${Math.random() * 10000}_${Math.random() * 99999}`;

      if (this.isWriting) {
        this.shapes.push({
          id,
          type: "text",
          lines: 0,
          x: this.pointerPosition.x,
          y: this.pointerPosition.y,
          textContent: "",
          fontSize: this.copy(this.textFont),
          textAlign: this.copy(this.textAlign),
          isBold: this.copy(this.isBold),
          isItalic: this.copy(this.isItalic),
          isUnderline: this.copy(this.isUnderline),
          color: this.copy(this.selectedColor),
          isBulletTextMode: this.copy(this.isBulletTextMode),
        });
        this.currentTarget = this.shapes.at(-1);
        this.lastSelectedShape = this.shapes.at(-1);
        return;
      }

      const setIsDashState = () => {
        this.isDash = this.shapes.find((shape) => shape.id === e.target.id).isDash;
      };
      const setStrokeSize = () => {
        this.strokeSize = this.shapes.find(
          (shape) => shape.id === e.target.id
        ).strokeWidth;
      };

      this.isSelectMode = false;

      if (e.target.id.includes("arrow")) {
        this.activeShape = "arrow";
        setIsDashState();
        setStrokeSize();
        return;
      }
      if (e.target.id.includes("circle")) {
        this.activeShape = "circle";
        this.options.circle.filled = this.shapes.find(
          (shape) => shape.id === e.target.id
        ).isFilled;
        setIsDashState();
        setStrokeSize();
        return;
      }
      if (e.target.id.includes("rect")) {
        this.activeShape = "rect";
        this.options.rect.filled = this.shapes.find(
          (shape) => shape.id === e.target.id
        ).isFilled;
        setIsDashState();
        setStrokeSize();
        return;
      }
      if (e.target.id.includes("line")) {
        this.activeShape = "line";
        setStrokeSize();
        return;
      }

      if (e.target.id.includes("text")) {
        this.isTextMode = true;
        this.isWriting = true;
        this.showCaret = true;
        const lastShape = this.shapes.find((shape) => shape.id === e.target.id);
        if (lastShape && lastShape.textAlign) {
          this.textAlign = this.shapes.find(
            (shape) => shape.id === e.target.id
          ).textAlign;
        }
        if (lastShape) {
          this.isBulletTextMode = this.shapes.find(
            (shape) => shape.id === e.target.id
          ).isBulletTextMode;
        }
        return;
      }
    },
    copyPaste() {
      const shapeCopy = {
        ...this.lastSelectedShape,
        id: `${this.lastSelectedShape.id}_copy`,
        x: this.lastSelectedShape.x - 100 < 0 ? 1 : this.lastSelectedShape.x - 100,
        y: this.lastSelectedShape.y - 100 < 0 ? 1 : this.lastSelectedShape.y - 100,
      };
      this.shapes.push(shapeCopy);
    },
    includeDeleteButton(shape, isBulletTextMode = false) {
      switch (true) {
        case shape.type === "circle":
          return `
                    <g id="${shape.id}" style="display:${
            this.isDeleteMode ? "initial" : "none"
          };">
                        <circle id="${shape.id}" cx="${shape.x}" cy="${
            shape.y
          }" r="12" fill="red"/>
                        <line stroke="white" stroke-width="2" id="${shape.id}" x1="${
            shape.x - 4
          }" y1="${shape.y - 4}" x2="${shape.x + 4}" y2="${shape.y + 4}"/>
                        <line stroke="white" stroke-width="2" id="${shape.id}" x1="${
            shape.x + 4
          }" y1="${shape.y - 4}" x2="${shape.x - 4}" y2="${shape.y + 4}"/>
                    </g>
                `;

        case shape.type === "text":
          // determine position of delete button from textAlign property
          let offsetX;
          let offsetY = [-8, -12, -4, -12, -4];
          switch (true) {
            case shape.textAlign === "start":
              if (isBulletTextMode) {
                offsetX = [-20, -24, -16, -16, -24];
              } else {
                offsetX = [-16, -20, -12, -12, -20];
              }
              break;

            case shape.textAlign === "middle":
              offsetX = [0, -4, 4, 4, -4];
              offsetY = [-32, -36, -28, -36, -28];
              break;

            case shape.textAlign === "end":
              offsetX = [16, 20, 12, 12, 20];
              break;

            default:
              offsetX = [0, 0, 0];
              break;
          }

          return `
                    <g id="${shape.id}" style="display:${
            this.isDeleteMode ? "initial" : "none"
          };">
                        <circle id="${shape.id}" cx="${shape.x + offsetX[0]}" cy="${
            shape.y + offsetY[0]
          }" r="12" fill="red"/>
                        <line stroke="white" stroke-width="2" id="${shape.id}" x1="${
            shape.x + offsetX[1]
          }" y1="${shape.y + offsetY[1]}" x2="${shape.x + offsetX[2]}" y2="${
            shape.y + offsetY[2]
          }"/>
                        <line stroke="white" stroke-width="2" id="${shape.id}" x1="${
            shape.x + offsetX[3]
          }" y1="${shape.y + offsetY[3]}" x2="${shape.x + offsetX[4]}" y2="${
            shape.y + offsetY[4]
          }"/>
                    </g>
                `;

        default:
          return `
                    <g id="${shape.id}" style="display:${
            this.isDeleteMode ? "initial" : "none"
          };">
                        <circle id="${shape.id}" cx="${shape.x - 4}" cy="${
            shape.y - 4
          }" r="12" fill="red"/>
                        <line stroke="white" stroke-width="2" id="${shape.id}" x1="${
            shape.x - 8
          }" y1="${shape.y - 8}" x2="${shape.x}" y2="${shape.y}"/>
                        <line stroke="white" stroke-width="2" id="${shape.id}" x1="${
            shape.x
          }" y1="${shape.y - 8}" x2="${shape.x - 8}" y2="${shape.y}"/>
                    </g>
                `;
      }
    },
    includeSelectionIndicator(shape) {
      if (!shape) {
        return;
      }

      switch (true) {
        case shape.type === "rect":
          return `
                    <rect
                    id="${shape.id}" 
                    style="stroke-dasharray: 10; display:${
                      this.hoveredShapeId && this.hoveredShapeId === shape.id
                        ? "initial"
                        : "none"
                    }"
                    x="${shape.x - 20}"
                    y="${shape.y - 20}"
                    height="${shape.rectHeight + 40}"
                    width="${shape.rectWidth + 40}"
                    fill="transparent"
                    stroke="grey"
                    />
                `;

        case shape.type === "circle":
          return `
                    <rect
                    id="${shape.id}" 
                    style="stroke-dasharray: 10; display:${
                      this.hoveredShapeId && this.hoveredShapeId === shape.id
                        ? "initial"
                        : "none"
                    }"
                    x="${shape.x - shape.circleRadius - 20}"
                    y="${shape.y - shape.circleRadius - 20}"
                    height="${shape.circleRadius * 2 + 40}"
                    width="${shape.circleRadius * 2 + 40}"
                    fill="transparent"
                    stroke="grey"
                    />
                `;

        case shape.type === "arrow":
          const isPositiveX = shape.endX - shape.x > 0;
          const isPositiveY = shape.endY - shape.y > 0;
          return `
                    <rect
                    id="${shape.id}" 
                    style="stroke-dasharray: 10; display:${
                      this.hoveredShapeId && this.hoveredShapeId === shape.id
                        ? "initial"
                        : "none"
                    }"
                    x="${isPositiveX ? shape.x - 20 : shape.endX - 20}"
                    y="${isPositiveY ? shape.y - 20 : shape.endY - 20}"
                    height="${
                      isPositiveY ? shape.endY - shape.y + 40 : shape.y - shape.endY + 40
                    }"
                    width="${
                      isPositiveX ? shape.endX - shape.x + 40 : shape.x - shape.endX + 40
                    }"
                    fill="transparent"
                    stroke="grey"
                    />
                `;

        case shape.type === "text":
          const selectedText = Array.from(document.getElementsByTagName("text")).find(
            (textElement) => textElement.id === shape.id
          );
          if (!selectedText) {
            return;
          }
          const { x, y, width, height } = selectedText.getBBox();
          return `
                    <rect
                    id="${shape.id}" 
                    style="stroke-dasharray: 10; display:${
                      this.hoveredShapeId && this.hoveredShapeId === shape.id
                        ? "initial"
                        : "none"
                    }"
                    x="${x - 20}"
                    y="${y - 20}"
                    height="${height + 40}"
                    width="${width + 40}"
                    fill="transparent"
                    stroke="grey"
                    />
                `;

        default:
          return ``;
      }
    },
    allowEditAndHoverShapes(e) {
      e.preventDefault();
      this.preventEdit = false;
      if (e.target && e.target.id) {
        this.hoveredShapeId = e.target.id;
      }
    },
    setSelectedTextAlignTo(position) {
      if (!this.lastSelectedShape || this.lastSelectedShape.type !== "text") {
        return;
      }
      this.lastSelectedShape.textAlign = position;
    },
    undoLastShape() {
      this.lastSelectedShape = undefined;
      this.shapes = this.shapes.slice(0, -1);
    },
    write(e) {
      if (this.preventEdit) {
        return;
      }
      e.preventDefault();
      const keyCode = e.keyCode;

      if (!this.isWriting) {
        return;
      }
      this.showCaret = true;
      let text;
      if (this.lastSelectedShape.type === "text") {
        text = this.shapes.find((shape) => shape.id === this.lastSelectedShape.id);
      } else {
        text = this.shapes.at(-1);
      }
      this.currentTarget = text;

      if (text.type !== "text") {
        return;
      }

      this.currentTarget.isBold = this.copy(this.isBold);
      this.currentTarget.isItalic = this.copy(this.isItalic);
      this.currentTarget.isUnderline = this.copy(this.isUnderline);

      const noActionKeys = [
        16,
        17,
        18,
        20,
        27,
        33,
        34,
        35,
        36,
        37,
        38,
        39,
        40,
        45,
        91,
        112,
        113,
        114,
        115,
        116,
        117,
        118,
        119,
        120,
        121,
        122,
        123,
        221,
        255,
        "Unidentified",
      ];

      switch (true) {
        case keyCode === 8:
          text.textContent = text.textContent.slice(0, -1);
          break;
        case keyCode === 9:
          text.textContent += "&nbsp; &nbsp; &nbsp; &nbsp;";
          break;
        case keyCode === 13:
          text.lines += 1;
          text.textContent += "‎"; // used to parse lines to create tspan elements when ENTER is pressed
          return;
        case noActionKeys.includes(keyCode):
          return;

        default:
          text.textContent += e.key;
      }
    },
    groupShapes() {
      this.selectedGroup = [];

      if (this.activeShape !== "group") {
        this.isSelectMode = false;
        this.shapes = this.shapes.filter((shape) => shape.type !== "group");
        return;
      }
      const group = this.shapes.at(-1);

      this.shapes.forEach((shape) => {
        if (shape.type === "group") {
          return;
        }
        switch (true) {
          case shape.type === "arrow":
            // TLBR: top left -> bottom right
            const isArrowTLBR =
              shape.x <= shape.endX &&
              shape.y <= shape.endY &&
              group.x <= shape.x &&
              group.y <= shape.y &&
              group.x + group.rectWidth >= shape.endX &&
              group.y + group.rectHeight >= shape.endY;

            // BLTR: bottom left -> top right
            const isArrowBLTR =
              shape.endY < shape.y &&
              shape.x < shape.endX &&
              group.x <= shape.x &&
              group.y <= shape.y &&
              group.x + group.rectWidth >= shape.endX &&
              group.y + group.rectHeight >= shape.y;

            // TRBL: top right -> bottom left
            const isArrowTRBL =
              shape.x > shape.endX &&
              shape.y < shape.endY &&
              group.x <= shape.endX &&
              group.y <= shape.endY &&
              group.x + group.rectWidth >= shape.x &&
              group.y + group.rectHeight >= shape.endY;

            // BRTL: bottom right -> top left
            const isArrowBRTL =
              shape.x > shape.endX &&
              shape.y > shape.endY &&
              group.x <= shape.endX &&
              group.y <= shape.endY &&
              group.x + group.rectWidth >= shape.x &&
              group.y + group.rectHeight >= shape.y;

            if (isArrowTLBR || isArrowBLTR || isArrowTRBL || isArrowBRTL) {
              this.selectedGroup.push(shape);
            }
            break;

          case shape.type === "circle":
            if (
              group.x <= shape.x + shape.circleRadius &&
              group.y <= shape.y + shape.circleRadius &&
              shape.x + shape.circleRadius <= group.x + group.rectWidth &&
              shape.y + shape.circleRadius <= group.y + group.rectHeight
            ) {
              this.selectedGroup.push(shape);
            }
            break;

          case shape.type === "rect":
            if (
              group.x <= shape.x &&
              group.y <= shape.y &&
              shape.x <= group.x + group.rectWidth &&
              shape.y <= group.y + group.rectHeight &&
              shape.x + shape.rectWidth <= group.x + group.rectWidth &&
              shape.y + shape.rectHeight <= group.y + group.rectHeight &&
              shape.rectWidth <= group.rectWidth &&
              shape.rectHeight <= group.rectHeight
            ) {
              this.selectedGroup.push(shape);
            }
            break;

          case shape.type === "text":
            if (group.x <= shape.x && group.y <= shape.y) {
              this.selectedGroup.push(shape);
            }
            break;

          default:
            break;
        }
      });

      // add an old independant id to the selectedShape to keep track of old id
      // replace id of selected shape with the group id
      this.selectedGroup = this.selectedGroup.map((shape) => {
        return {
          ...shape,
          id: group.id,
          oldId: shape.id,
          diffX: shape.x - group.x,
          diffY: shape.y - group.y,
          diffEndX: shape.endX ? shape.endX - group.x : 0,
          diffEndY: shape.endY ? shape.endY - group.y : 0,
        };
      });

      group.source = this.selectedGroup;

      if (this.selectedGroup.length > 1) {
        const bannedIds = this.copy(this.selectedGroup).map((shape) => {
          return shape.oldId;
        });

        // remove selected shapes from the shapes array
        this.shapes = this.shapes.filter((shape) => !bannedIds.includes(shape.id));

        // redraw each shape in the context of the group
        this.selectedGroup.forEach((shape) => {
          switch (true) {
            case shape.type === "circle":
              group.content += `
                <circle
                id="${shape.id}"
                cx="${shape.x}"
                cy="${shape.y}"
                r="${shape.circleRadius ? shape.circleRadius : Number.MIN_VALUE}"
                fill="${
                  shape.isFilled ? shape.color + shape.alpha : "rgba(255,255,255,0.001)"
                }"
                stroke="${shape.color + shape.alpha}" 
                                stroke-width="${shape.strokeWidth}"
                                style="${
                                  shape.isDash
                                    ? `stroke-dasharray: ${shape.strokeWidth * 3}`
                                    : ""
                                }"
                                />
            `;
              break;

            case shape.type === "rect":
              group.content += `
                <rect
                id="${this.isResizeMode ? "" : shape.id}"
                x="${shape.x}"
                y="${shape.y}"
                fill="${
                  shape.isFilled ? shape.color + shape.alpha : "rgba(255,255,255,0.001)"
                }"
                height="${shape.rectHeight}"
                width="${shape.rectWidth}"
                stroke="${shape.color + shape.alpha}"
                stroke-width="${shape.strokeWidth}"
                style="rx:1 !important; ry:1 !important; ${
                  shape.isDash ? `stroke-dasharray: ${shape.strokeWidth * 3}` : ""
                }"
                            />
            `;
              break;

            case shape.type === "arrow":
              const shapeWidthMax = shape.strokeWidth > 3 ? 5 : 10;
              const shapeWidthMin = shape.strokeWidth > 3 ? 2.5 : 5;
              const uid = Date.now();
              group.content += `
                <g id="${shape.id}">
                <defs>
                    <marker 
                    id="${uid}" 
                    markerWidth="${shapeWidthMax}" 
                    markerHeight="${shapeWidthMax}" 
                    refX="0" 
                    refY="${shapeWidthMin}" 
                    orient="auto"
                    >
                    <polygon 
                    points="0 0,${shapeWidthMax} ${shapeWidthMin}, 0 ${shapeWidthMax}" 
                    fill="${shape.color}"
                    />
                    </marker>
                </defs>

                <path 
                    style="stroke-linecap: round !important; ${
                      shape.isDash ? `stroke-dasharray: ${shape.strokeWidth * 3}` : ""
                    }" 
                    stroke="${shape.color}" 
                    id="${shape.id}" 
                    d="M${shape.x},${shape.y} ${shape.endX},${shape.endY}" 
                    stroke-width="${shape.strokeWidth}" 
                    marker-end="url(#${uid})"
                />
                </g>
            `;
              break;

            case shape.type === "text":
              const parsedText = shape.textContent.split("‎");
              const parsedContent = [];
              for (let i = 0; i < parsedText.length; i += 1) {
                parsedContent.push(`
                ${
                  shape.isBulletTextMode
                    ? `<tspan x="${shape.x - shape.fontSize}" y="${
                        shape.y + shape.fontSize * i
                      }" id="${shape.id}" font-size="${shape.fontSize / 2}">⬤</tspan>`
                    : ""
                }
                <tspan id="${shape.id}" x="${shape.x}" y="${
                  shape.y + shape.fontSize * i
                }">
                    ${parsedText[i]}
                </tspan>`);
              }
              group.content += `
                ${this.computeTextElement(shape, parsedContent, shape.isBulletTextMode)}
                `;
              break;

            default:
              break;
          }
        });
      } else {
        // no valid selection: remove selection rect
        this.shapes = this.shapes.filter((shape) => shape.id !== group.id);
      }
    },
    moveGroup(group) {
      group.content = "";
      group.x = this.copy(this.pointerPosition.x) - group.rectWidth / 2;
      group.y = this.copy(this.pointerPosition.y) - group.rectHeight / 2;

      group.source.forEach((shape) => {
        switch (true) {
          case shape.type === "circle":
            group.content += `
                <circle
                id="${shape.id}"
                cx="${
                  this.copy(this.pointerPosition.x) + shape.diffX - group.rectWidth / 2
                }"
                cy="${
                  this.copy(this.pointerPosition.y) + shape.diffY - group.rectHeight / 2
                }"
                r="${shape.circleRadius ? shape.circleRadius : Number.MIN_VALUE}"
                fill="${
                  shape.isFilled ? shape.color + shape.alpha : "rgba(255,255,255,0.001)"
                }"
                stroke="${shape.color + shape.alpha}" 
                                stroke-width="${shape.strokeWidth}"
                                style="${
                                  shape.isDash
                                    ? `stroke-dasharray: ${shape.strokeWidth * 3}`
                                    : ""
                                }"
                                />
            `;
            break;

          case shape.type === "rect":
            group.content += `
                <rect
                id="${this.isResizeMode ? "" : shape.id}"
                x="${
                  this.copy(this.pointerPosition.x) + shape.diffX - group.rectWidth / 2
                }"
                y="${
                  this.copy(this.pointerPosition.y) + shape.diffY - group.rectHeight / 2
                }"
                fill="${
                  shape.isFilled ? shape.color + shape.alpha : "rgba(255,255,255,0.001)"
                }"
                height="${shape.rectHeight}"
                width="${shape.rectWidth}"
                stroke="${shape.color + shape.alpha}"
                stroke-width="${shape.strokeWidth}"
                style="rx:1 !important; ry:1 !important; ${
                  shape.isDash ? `stroke-dasharray: ${shape.strokeWidth * 3}` : ""
                }"
                            />
            `;
            break;

          case shape.type === "arrow":
            const shapeWidthMax = shape.strokeWidth > 3 ? 5 : 10;
            const shapeWidthMin = shape.strokeWidth > 3 ? 2.5 : 5;
            const uid = Date.now();
            group.content += `
                <g id="${shape.id}">
                <defs>
                    <marker 
                    id="${uid}" 
                    markerWidth="${shapeWidthMax}" 
                    markerHeight="${shapeWidthMax}" 
                    refX="0" 
                    refY="${shapeWidthMin}" 
                    orient="auto"
                    >
                    <polygon 
                    points="0 0,${shapeWidthMax} ${shapeWidthMin}, 0 ${shapeWidthMax}" 
                    fill="${shape.color}"
                    />
                    </marker>
                </defs>

                <path 
                    style="stroke-linecap: round !important; ${
                      shape.isDash ? `stroke-dasharray: ${shape.strokeWidth * 3}` : ""
                    }" 
                    stroke="${shape.color}" 
                    id="${shape.id}" 
                    d="M${
                      this.copy(this.pointerPosition.x) +
                      shape.diffX -
                      group.rectWidth / 2
                    },${
              this.copy(this.pointerPosition.y) + shape.diffY - group.rectHeight / 2
            } ${
              this.copy(this.pointerPosition.x) + shape.diffEndX - group.rectWidth / 2
            },${
              this.copy(this.pointerPosition.y) + shape.diffEndY - group.rectHeight / 2
            }" 
                    stroke-width="${shape.strokeWidth}" 
                    marker-end="url(#${uid})"
                />
                </g>
            `;
            break;

          case shape.type === "text":
            const parsedText = shape.textContent.split("‎");
            const parsedContent = [];
            for (let i = 0; i < parsedText.length; i += 1) {
              parsedContent.push(`
                ${
                  shape.isBulletTextMode
                    ? `<tspan x="${
                        this.copy(this.pointerPosition.x) +
                        shape.diffX -
                        shape.fontSize -
                        group.rectWidth / 2
                      }" y="${
                        this.copy(this.pointerPosition.y) +
                        shape.diffY +
                        shape.fontSize * i -
                        group.rectHeight / 2
                      }" id="${shape.id}" font-size="${shape.fontSize / 2}">⬤</tspan>`
                    : ""
                }
                <tspan id="${shape.id}" x="${
                this.copy(this.pointerPosition.x) + shape.diffX - group.rectWidth / 2
              }" y="${
                this.copy(this.pointerPosition.y) +
                shape.diffY +
                shape.fontSize * i -
                group.rectHeight / 2
              }">
                    ${parsedText[i]}
                </tspan>`);
            }
            group.content += `
                ${this.computeTextElement(shape, parsedContent, shape.isBulletTextMode)}
                `;
            break;

          default:
            break;
        }
      });
    },
    chooseAction(e) {
      e.preventDefault();
      this.isMouseDown = true;
      switch (true) {
        case this.isDrawMode:
          this.drawDown();
          break;

        default:
          break;
      }
    },
    chooseMove(e) {
      e.preventDefault();
      if (e.target.localName !== "svg") {
        this.currentTarget = e.target;
      }
      switch (true) {
        case this.isMoveMode && this.isMouseDown:
          this.moveDown();
          break;

        case this.isResizeMode && this.isMouseDown:
          this.resize();
          break;

        default:
          break;
      }
    },
    computeCaretPosition(shape) {
      switch (true) {
        case shape.textAlign === "middle":
          return `<path stroke="black" stroke-width="2" d="M${shape.x},${
            shape.y - shape.fontSize
          } ${shape.x},${
            shape.y - shape.fontSize - 15
          }" /> <path stroke="black" stroke-width="2" d="M${shape.x - 3},${
            shape.y - shape.fontSize - 5
          } ${shape.x},${shape.y - shape.fontSize} ${shape.x + 3},${
            shape.y - shape.fontSize - 5
          }"/>`;

        case shape.textAlign === "start":
          const bulletModeOffset = shape.isBulletTextMode ? shape.fontSize : 0;
          return `<path d="M${shape.x - 20 - bulletModeOffset},${
            shape.y - shape.fontSize / 6
          } ${shape.x - 5 - bulletModeOffset},${
            shape.y - shape.fontSize / 6
          }" stroke="black" stroke-width="2" />
                        <path  d="M${shape.x - 10 - bulletModeOffset},${
            shape.y - shape.fontSize / 3
          } ${shape.x - 5 - bulletModeOffset},${shape.y - shape.fontSize / 6} ${
            shape.x - 10 - bulletModeOffset
          },${shape.y}" stroke="black" stroke-width="2">`;

        case shape.textAlign === "end":
          return `<path d="M${shape.x + 20},${shape.y - shape.fontSize / 6} ${
            shape.x + 5
          },${shape.y - shape.fontSize / 6}" stroke="black" stroke-width="2" />
                        <path d="M${shape.x + 10},${shape.y - shape.fontSize / 3} ${
            shape.x + 5
          },${shape.y - shape.fontSize / 6} ${shape.x + 10},${
            shape.y
          }" stroke="black" stroke-width="2">`;

        default:
          return "";
      }
    },
    computeTextElement(shape, content, isBulletTextMode = false) {
      switch (true) {
        case shape.textAlign === "start":
          return `
                <g id="${shape.id}">
                    <rect 
                        id="${shape.id}" 
                        style="display:${
                          this.lastSelectedShape && this.lastSelectedShape.id === shape.id
                            ? "initial"
                            : "none"
                        };" 
                        x="${shape.x}" 
                        y="${shape.y - 50}" 
                        height="${
                          shape.lines === 0 || shape.lines === 1
                            ? shape.fontSize * 4
                            : shape.fontSize * 2 * shape.lines
                        }"
                        width="100" 
                        fill="rgba(0,0,0,0)"
                    />
                    <text
                    style="user-select:none; height:100px;"
                    id="${shape.id}"
                    x="${shape.x}"
                    y="${shape.y}"
                    text-anchor="${shape.textAlign}"
                    font-size="${shape.fontSize}"
                    fill="${shape.color}"
                    font-weight="${shape.isBold ? "bold" : "normal"}"
                    font-style="${shape.isItalic ? "italic" : "normal"}"
                    text-decoration="${shape.isUnderline ? "underline" : "none"}"
                    >
                        ${content.join("")}
                    </text>
                    ${
                      this.showCaret &&
                      this.lastSelectedShape &&
                      this.lastSelectedShape.id === shape.id
                        ? this.computeCaretPosition(shape)
                        : ""
                    }
                    ${this.includeDeleteButton(shape, isBulletTextMode)}
                </g> 
                `;

        case shape.textAlign === "middle":
          return `
                    <g id="${shape.id}">
                    <rect 
                        id="${shape.id}" 
                        style="display:${
                          this.lastSelectedShape && this.lastSelectedShape.id === shape.id
                            ? "initial"
                            : "none"
                        };" 
                        x="${shape.x - 50}" 
                        y="${shape.y - 50}" 
                        height="${
                          shape.lines === 0 || shape.lines === 1
                            ? shape.fontSize * 4
                            : shape.fontSize * 2 * shape.lines
                        }"
                        width="100" 
                        fill="rgba(0,0,0,0)"
                    />
                    <text
                    style="user-select:none; height:100px;"
                    id="${shape.id}"
                    x="${shape.x}"
                    y="${shape.y}"
                    text-anchor="${shape.textAlign}"
                    font-size="${shape.fontSize}"
                    fill="${shape.color}"
                    font-weight="${shape.isBold ? "bold" : "normal"}"
                    font-style="${shape.isItalic ? "italic" : "normal"}"
                    text-decoration="${shape.isUnderline ? "underline" : "none"}"
                    >
                        ${content.join("")}
                    </text>
                    ${
                      this.showCaret &&
                      this.lastSelectedShape &&
                      this.lastSelectedShape.id === shape.id
                        ? this.computeCaretPosition(shape)
                        : ""
                    }
                    ${this.includeDeleteButton(shape)}
                    </g>
                `;

        case shape.textAlign === "end":
          return `
                <g id="${shape.id}">
                    <rect 
                        id="${shape.id}" 
                        style="display:${
                          this.lastSelectedShape && this.lastSelectedShape.id === shape.id
                            ? "initial"
                            : "none"
                        };" 
                        x="${shape.x - 100}" 
                        y="${shape.y - 50}" 
                        height="${
                          shape.lines === 0 || shape.lines === 1
                            ? shape.fontSize * 4
                            : shape.fontSize * 2 * shape.lines
                        }"
                        width="100" 
                        fill="rgba(0,0,0,0)"
                    />
                    <text
                    style="user-select:none; height:100px;"
                    id="${shape.id}"
                    x="${shape.x}"
                    y="${shape.y}"
                    text-anchor="${shape.textAlign}"
                    font-size="${shape.fontSize}"
                    fill="${shape.color}"
                    font-weight="${shape.isBold ? "bold" : "normal"}"
                    font-style="${shape.isItalic ? "italic" : "normal"}"
                    text-decoration="${shape.isUnderline ? "underline" : "none"}"
                    >
                        ${content.join("")}
                    </text>
                    ${
                      this.showCaret &&
                      this.lastSelectedShape &&
                      this.lastSelectedShape.id === shape.id
                        ? this.computeCaretPosition(shape)
                        : ""
                    }
                    ${this.includeDeleteButton(shape)}
                </g> 
                `;

        default:
          return "";
      }
    },
    copy(source) {
      return JSON.parse(JSON.stringify(source));
    },
    clickShape(e) {
      const shapeId = e.target.id;
      switch (true) {
        case this.isDeleteMode:
          this.shapes = [...this.shapes].filter((shape) => shape.id !== shapeId);
          this.lastSelectedShape = undefined;
          break;

        default:
          this.lastSelectedShape = this.shapes.find((shape) => shape.id === shapeId);
          break;
      }
    },
    deleteEmptyTextElement() {
      if (!this.lastSelectedShape || !this.lastSelectedShape.id.includes("text")) {
        return;
      }

      if (this.lastSelectedShape.textContent === "") {
        this.shapes = this.shapes.filter(
          (shape) => shape.id !== this.lastSelectedShape.id
        );
        this.lastSelectedShape = this.shapes.at(-1);
      }
    },
    drawUp(useShapeReference = false) {
      if (!this.activeShape || !this.isDrawing) {
        return;
      }
      this.currentPointer.end = {
        x: this.pointerPosition.x,
        y: this.pointerPosition.y,
      };
      let currentShape;
      if (this.shapes.length > 0 && this.currentTarget) {
        currentShape = [...this.shapes].find(
          (shape) => shape.id === this.currentTarget.id
        );
      }

      let a, b, distanceToPointer;
      if (currentShape) {
        a = currentShape.x - this.currentPointer.end.x;
        b = currentShape.y - this.currentPointer.end.y;
        distanceToPointer = Math.sqrt(a * a + b * b);
      }

      let Xmax, Xmin, Ymax, Ymin;
      if (useShapeReference) {
        Xmax = Math.max(this.currentPointer.end.x, currentShape.x);
        Xmin = Math.min(this.currentPointer.end.x, currentShape.x);
        Ymax = Math.max(this.currentPointer.end.y, currentShape.y);
        Ymin = Math.min(this.currentPointer.end.y, currentShape.y);
      } else {
        Xmax = Math.max(this.currentPointer.end.x, this.currentPointer.start.x);
        Xmin = Math.min(this.currentPointer.end.x, this.currentPointer.start.x);
        Ymax = Math.max(this.currentPointer.end.y, this.currentPointer.start.y);
        Ymin = Math.min(this.currentPointer.end.y, this.currentPointer.start.y);
      }

      this.$nextTick(() => {
        switch (true) {
          case this.activeShape === "arrow":
            this.shapes.at(-1).endX = this.currentPointer.end.x;
            this.shapes.at(-1).endY = this.currentPointer.end.y;
            break;

          case this.activeShape === "circle":
            const offset = 20; // used to avoid shape shifting when resizing over another shape
            this.shapes.at(-1).circleRadius = this.isDrawingNewShape
              ? this.copy(Xmax - Xmin) + offset
              : distanceToPointer + offset;
            break;

          case this.activeShape === "line":
            this.shapes.at(
              -1
            ).path += ` ${this.pointerPosition.x} ${this.pointerPosition.y} `;
            break;

          case ["rect", "group"].includes(this.activeShape):
            const minRectSize = 20;
            this.shapes.at(-1).rectWidth =
              this.copy(this.currentPointer.end.x - this.shapes.at(-1).x) > 0
                ? this.copy(this.currentPointer.end.x - this.shapes.at(-1).x)
                : minRectSize;
            this.shapes.at(-1).rectHeight =
              this.copy(this.currentPointer.end.y - this.shapes.at(-1).y) > 0
                ? this.copy(this.currentPointer.end.y - this.shapes.at(-1).y)
                : minRectSize;

          default:
            break;
        }
      });
    },
    drawDown() {
      this.isDrawing = true;
      if (!this.activeShape && !this.isSelectMode) {
        return;
      }

      if (!this.isDrawing) {
        return;
      }

      this.isDrawingNewShape = true;

      this.currentPointer.start = {
        x: this.pointerPosition.x,
        y: this.pointerPosition.y,
      };
      let id = `${this.isSelectMode ? "group" : this.activeShape}_${
        Math.random() * 10000
      }_${Date.now()}`;

      switch (true) {
        case this.activeShape === "arrow":
          this.shapes.push({
            id,
            x: this.pointerPosition.x,
            y: this.pointerPosition.y,
            endX: this.pointerPosition.x,
            endY: this.pointerPosition.y,
            type: this.activeShape,
            color: this.copy(this.selectedColor),
            strokeWidth: this.copy(Math.abs(this.strokeSize)),
            isDash: this.copy(this.isDash),
          });
          this.lastSelectedShape = this.shapes.at(-1);
          break;

        case this.activeShape === "circle":
          this.shapes.push({
            alpha: this.options.circle.filled ? this.colorTransparency : "",
            id,
            color: this.copy(this.selectedColor),
            isFilled: this.copy(this.options.circle.filled),
            circleRadius: this.copy(this.options.circle.radius),
            circleStrokeWidth: this.copy(this.options.circle.strokeWidth),
            type: this.activeShape,
            x: this.pointerPosition.x,
            y: this.pointerPosition.y,
            strokeWidth: this.copy(Math.abs(this.strokeSize)),
            isDash: this.copy(this.isDash),
          });
          this.lastSelectedShape = this.shapes.at(-1);
          break;

        case this.activeShape === "line":
          this.shapes.push({
            alpha: this.copy(this.colorTransparency),
            id,
            x: this.pointerPosition.x,
            y: this.pointerPosition.y,
            type: this.activeShape,
            color: this.copy(this.selectedColor),
            strokeWidth: this.copy(Math.abs(this.strokeSize)),
            isDash: this.copy(this.isDash),
            path: `${this.pointerPosition.x} ${this.pointerPosition.y}`,
          });
          this.lastSelectedShape = this.shapes.at(-1);
          break;

        case this.activeShape === "rect":
          this.shapes.push({
            alpha: this.options.rect.filled ? this.colorTransparency : "",
            id,
            color: this.copy(this.selectedColor),
            isFilled: this.copy(this.options.rect.filled),
            rectStrokeWidth: this.copy(this.options.rect.strokeWidth),
            rectHeight: this.copy(this.options.rect.height),
            rectWidth: this.copy(this.options.rect.width),
            type: this.activeShape,
            x: this.pointerPosition.x,
            y: this.pointerPosition.y,
            strokeWidth: this.copy(Math.abs(this.strokeSize)),
            isDash: this.copy(this.isDash),
          });
          this.lastSelectedShape = this.shapes.at(-1);
          break;

        case this.activeShape === "group":
          this.shapes.push({
            alpha: 1,
            id: `group_${Math.random() * 10000}_${Date.now()}`,
            x: this.pointerPosition.x,
            y: this.pointerPosition.y,
            isFilled: false,
            rectHeight: this.copy(this.options.rect.height),
            rectWidth: this.copy(this.options.rect.width),
            rectStrokeWidth: 1,
            type: "group",
            color: "grey",
            strokeWidth: 1,
            isDash: true,
            content: "",
          });
          break;

        default:
          break;
      }

      if (this.pointerDownId !== -1 || !this.isDrawing) {
        clearInterval(this.pointerDownId);
        this.pointerDownId = -1;
      }

      if (this.pointerDownId === -1 && this.isDrawing) {
        this.pointerDownId = setInterval(this.drawUp, 1);
        return;
      }
    },
    move(shape) {
      if (!shape || !shape.id || shape.type === "line") {
        return;
      }
      this.lastSelectedShape = shape;
      switch (true) {
        case shape.type === "arrow":
          shape.x = this.copy(this.pointerPosition.x);
          shape.y = this.copy(this.pointerPosition.y);
          // FIX
          break;
        case shape.type === "circle":
          shape.x = this.copy(this.pointerPosition.x);
          shape.y = this.copy(this.pointerPosition.y);
          break;
        case shape.type === "group":
          this.moveGroup(shape);
          break;
        case shape.type === "rect":
          shape.x = this.copy(this.pointerPosition.x - shape.rectWidth / 2);
          shape.y = this.copy(this.pointerPosition.y - shape.rectHeight / 2);
          break;
        case shape.type === "text":
          const selectedText = Array.from(document.getElementsByTagName("text")).find(
            (textElement) => textElement.id === shape.id
          );
          if (!selectedText) {
            return;
          }
          const { x, y, width, height } = selectedText.getBBox();
          if (shape.textAlign === "start") {
            shape.x = this.copy(this.pointerPosition.x - width / 2);
          }
          if (shape.textAlign === "middle") {
            shape.x = this.copy(this.pointerPosition.x);
          }
          if (shape.textAlign === "end") {
            shape.x = this.copy(this.pointerPosition.x + width / 2);
          }
          if (shape.lines > 1) {
            shape.y = this.copy(this.pointerPosition.y - height / 3);
          } else {
            shape.y = this.copy(this.pointerPosition.y + shape.fontSize / 2);
          }
          break;

        default:
          break;
      }
    },
    moveDown() {
      if (!this.currentTarget || !this.currentTarget.id) {
        return;
      }
      const shapeId = this.currentTarget.id;
      const shape = this.shapes.find((shape) => shape.id === shapeId);
      this.shapes = this.shapes.filter((el) => el.id !== shapeId);
      this.shapes.push(shape);

      if (this.pointerDownId === -1 && shapeId) {
        this.move(shape);
      }
    },
    print() {
      this.isPrinting = true;
      this.isDeleteMode = false;
      this.isMoveMode = false;
      this.isResizeMode = false;
      this.isTextMode = false;
      this.isWriting = false;
      this.isSelectMode = false;
      this.activeShape = undefined;
      this.showCaret = false;
      this.$nextTick(() => {
        const wrapper = this.$refs.drawSvgContainer;
        const a4 = {
          height: 851.89,
          width: 595.28,
        };
        this.walkTheDOM(wrapper, (node) => {
          if (node && node.nodeType === 1) {
            node.setAttribute("font-family", "Helvetica");
            node.style.fontFamily = "Helvetica";
            node.replaceWith(node);
          }
        });

        html2canvas(wrapper)
          .then((canvas) => {
            const contentWidth = canvas.width;
            const contentHeight = canvas.height;
            const pageHeight = (contentWidth / a4.width) * a4.height;
            let leftHeight = contentHeight;
            let position = 0;
            const imgWidth = a4.width;
            const imgHeight = (582.28 / contentWidth) * contentHeight;
            const pageData = canvas.toDataURL("image/png", 1.0);
            const pdf = new JsPDF("", "pt", "a4");
            if (leftHeight < pageHeight) {
              pdf.addImage(pageData, "PNG", 0, 0, imgWidth, imgHeight, "", "FAST");
            } else {
              while (leftHeight > 0) {
                pdf.addImage(
                  pageData,
                  "PNG",
                  0,
                  position,
                  imgWidth,
                  imgHeight,
                  "",
                  "FAST"
                );
                leftHeight -= pageHeight;
                position -= a4.height - 24;
                if (leftHeight > 0) {
                  pdf.addPage();
                }
              }
            }
            pdf.save(`${new Date().toLocaleDateString()}_annotations.pdf`);
          })
          .finally(() => {
            this.isPrinting = false;
            this.walkTheDOM(wrapper, (node) => {
              if (node && node.nodeType === 1) {
                node.setAttribute("font-family", this.FINAL_CONFIG.style.fontFamily);
                node.style.fontFamily = this.FINAL_CONFIG.style.fontFamily;
                node.replaceWith(node);
              }
            });
          });
      });
    },
    resetDraw() {
      this.isDrawing = false;
      this.isMouseDown = false;
      this.pointerDownId = -1;
      if (this.isSelectMode) {
        this.groupShapes();
      }
      clearInterval(this.pointerDownId);
    },
    resize() {
      this.isDrawingNewShape = false;
      const shapeId = this.currentTarget.id;
      if (!shapeId) {
        return;
      }
      this.isDrawing = true;
      const shape = this.shapes.find((shape) => shape.id === shapeId);
      this.activeShape = shape.type;
      this.shapes = this.shapes.filter((el) => el.id !== shapeId);
      this.shapes.push(shape);
      this.drawUp(true);
    },
    setFillOfSelectedRect() {
      if (!this.lastSelectedShape || !this.lastSelectedShape.id.includes("rect")) {
        return;
      }
      this.lastSelectedShape.isFilled = !this.lastSelectedShape.isFilled;
    },
    setFillOfSelectedCircle() {
      if (!this.lastSelectedShape || !this.lastSelectedShape.id.includes("circle")) {
        return;
      }
      this.lastSelectedShape.isFilled = !this.lastSelectedShape.isFilled;
    },
    setColorOfSelectedShape() {
      if (!this.lastSelectedShape) {
        return;
      }

      this.lastSelectedShape.color = this.copy(this.selectedColor);

      if (["arrow", "text"].includes(this.lastSelectedShape.id)) {
        return;
      }

      this.lastSelectedShape.alpha = this.copy(this.colorTransparency);
    },
    setSelectedShapeToDash() {
      if (!this.lastSelectedShape || this.lastSelectedShape.type === "text") {
        return;
      }
      this.lastSelectedShape.isDash = this.copy(this.isDash);
    },
    setTransparencyOfSelectedShape() {
      if (
        !this.lastSelectedShape ||
        ["arrow", "text"].includes(this.lastSelectedShape.id)
      ) {
        return;
      }
      this.lastSelectedShape.alpha = this.copy(this.colorTransparency);
    },
    setStrokeWidthOfSelectedShape() {
      if (
        !this.lastSelectedShape ||
        !["arrow", "circle", "rect", "line"].includes(this.lastSelectedShape.type)
      ) {
        return;
      }
      this.lastSelectedShape.strokeWidth = this.copy(Math.abs(this.strokeSize));
    },
    setCurrentStyleOfSelectedText() {
      if (!this.lastSelectedShape || this.lastSelectedShape.type !== "text") {
        return;
      }
      this.lastSelectedShape.isBold = this.copy(this.isBold);
      this.lastSelectedShape.isItalic = this.copy(this.isItalic);
      this.lastSelectedShape.isUnderline = this.copy(this.isUnderline);
      this.lastSelectedShape.fontSize = this.copy(this.textFont);
      this.lastSelectedShape.isBulletTextMode = this.copy(this.isBulletTextMode);
    },
    setPointer(e) {
      e.preventDefault();
      const mainSvg = this.$refs.mainSvg;
      const rect = mainSvg.getBoundingClientRect();
      let clientX, clientY;

      if (e.touches && e.touches.length > 0) {
        // Use the first touch if available
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        // Fall back to mouse event properties
        clientX = e.clientX;
        clientY = e.clientY;
      }

      this.pointerPosition.x = ((clientX - rect.left) / rect.width) * this.svgWidth;
      this.pointerPosition.y = ((clientY - rect.top) / rect.height) * this.svgHeight;
    },
    setShapeTo(shape) {
      this.showCaret = false;
      this.deleteEmptyTextElement();
      if (shape === this.activeShape) {
        this.activeShape = undefined;
        this.isDrawMode = false;

        return;
      }
      this.isDrawMode = true;
      this.isDeleteMode = false;
      this.isMoveMode = false;
      this.isResizeMode = false;
      this.isTextMode = false;
      this.activeShape = shape;
    },
    toggleSummary() {
      this.isSummaryOpen = !this.isSummaryOpen;
      if (!this.isSummaryOpen) {
        this.isMoveMode = false;
        this.isResizeMode = false;
        this.isTextMode = false;
        this.isWriting = false;
        this.activeShape = undefined;
        this.showCaret = false;
        this.isDeleteMode = false;
        this.isWriting = false;
      }
      this.$emit("toggleOpenState", { isOpen: this.isSummaryOpen });
    },
    walkTheDOM(node, func) {
      func(node);
      node = node.firstChild;
      while (node) {
        this.walkTheDOM(node, func);
        node = node.nextSibling;
      }
    },
    save() {
        this.$emit("saveAnnotations", {
            shapes: this.shapes,
            lastSelectedShape: this.lastSelectedShape
        })
    }
  },
};
</script>

<style lang="scss" scoped>
.vue-ui-annotator summary {
  text-align: center;
}

.vue-ui-annotator button.button-tool {
  align-items: center;
  cursor: pointer !important;
  display: flex;
  height: 28px;
  justify-content: center;
  opacity: 0.9;
  padding: 2px;
  width: 28px;
  &:hover {
    opacity: 1;
  }
}
.vue-ui-annotator button.button-tool:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.vue-ui-annotator .tool-selection {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.vue-ui-annotator .tool-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  input {
    background: white;
    padding: 3px;
    border-radius: 3px;
    width: 40px;
  }
  label {
    font-size: 0.6em;
  }
}
.vue-ui-annotator text {
  user-select: none;
}
.vue-ui-annotator summary {
  user-select: none;
  cursor: pointer;
}
.vue-ui-annotator .animated-circle-print {
  stroke-linecap: round !important;
  stroke-dasharray: 400;
  stroke-dashoffset: 0;
  animation: animate-circle 1s infinite linear;
}
@keyframes animate-circle {
  from {
    opacity: 0;
    stroke-dashoffset: 400;
  }
  to {
    opacity: 1;
    stroke-dashoffset: 0;
  }
}

.vue-ui-annotator .tooltip {
  position: relative;
  display: inline-block;
  border-bottom: 1px dotted black;
}

.vue-ui-annotator .tooltip .tooltiptext {
  visibility: hidden;
  width: 120px;
  background-color: #555;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  margin-left: -60px;
  opacity: 0;
  transition: opacity 0.3s;
}

.vue-ui-annotator .tooltip .tooltiptext::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

.vue-ui-annotator .tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}

.vue-ui-annotator .draw--free {
  /* circle cursor for freehand draw mode */
  cursor: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAABg2lDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TpSIVh2YQcchQnSyIijhKFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi6OSk6CIl/i8ptIjx4Lgf7+497t4BQrPKNKtnAtB020wn4lIuvyqFXhGGiAhCiMnMMpKZxSx8x9c9Any9i/Es/3N/jgG1YDEgIBHPMcO0iTeIZzZtg/M+scjKskp8Tjxu0gWJH7muePzGueSywDNFM5ueJxaJpVIXK13MyqZGPE0cVTWd8oWcxyrnLc5atc7a9+QvDBf0lQzXaY4ggSUkkYIEBXVUUIWNGK06KRbStB/38Q+7/hS5FHJVwMixgBo0yK4f/A9+d2sVpya9pHAc6H1xnI9RILQLtBqO833sOK0TIPgMXOkdf60JzH6S3uho0SNgcBu4uO5oyh5wuQMMPRmyKbtSkKZQLALvZ/RNeSByC/Sveb2193H6AGSpq+Ub4OAQGCtR9rrPu/u6e/v3TLu/H5C7crM1WjgWAAAABmJLR0QAqwB5AHWF+8OUAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH5gwUExIUagzGcQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAABfSURBVBjTldAxDoNQDIPhL0+q1L33P1AvAhN7xfK6WAgoLfSfrNiykpQtE+7RLzx2vgF9D3o8lWDmn1QVVMP0LZQGmNtqp1/cmou0XHdG/+sYeGZwFBqPCub8rkcvvAGvsi1VYarR8wAAAABJRU5ErkJggg==') 5 5, auto;
}
</style>
