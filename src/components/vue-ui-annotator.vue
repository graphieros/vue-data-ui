<template>
  <div class="vue-data-ui-component vue-ui-annotator">
    <div data-dom-to-png-ignore>
      <Accordion
        :config="{
          maxHeight: 1000,
          useCursorPointer: isCursorPointer,
          head: {
            backgroundColor: FINAL_CONFIG.style.backgroundColor,
            color: FINAL_CONFIG.style.color,
            iconColor: FINAL_CONFIG.style.color,
            iconSize: 20,
            icon: isSummaryOpen ? 'close' : 'annotator',
            padding: '6px'
          },
          body: {
            backgroundColor: FINAL_CONFIG.style.backgroundColor,
            color: FINAL_CONFIG.style.color
          }
        }"
        @toggle="toggleSummary"
      >
        <template #title="{ color }">
          <div :style="{ color }">
            {{ FINAL_CONFIG.translations.title }}
          </div>
        </template>

        <template #content="{ backgroundColor }">
          <div 
            class="tool-selection" 
            :style="{
              backgroundColor,
            }"
            >
            <!-- MOVE -->
            <button
              data-cy="annotator-button-move"
              :disabled="shapes.length === 0"
              :style="{
                  background: isMoveMode ? FINAL_CONFIG.style.buttons.controls.selected.backgroundColor :FINAL_CONFIG.style.buttons.controls.backgroundColor,
                  border: isMoveMode ? FINAL_CONFIG.style.buttons.controls.selected.border :FINAL_CONFIG.style.buttons.controls.border,
                  color: isMoveMode ? FINAL_CONFIG.style.buttons.controls.selected.color :FINAL_CONFIG.style.buttons.controls.color,
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
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
              @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('move', $event, 'top')"
              @mouseleave="hideTooltip"
              @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('move', $event, 'top')"
              @blur="hideTooltip"
            >
              <BaseIcon name="move" :stroke="isMoveMode ? FINAL_CONFIG.style.buttons.controls.selected.color :FINAL_CONFIG.style.buttons.controls.color"/>

              <TeleportedTooltip
                v-if="FINAL_CONFIG.style.showTooltips"
                :show="showTooltip && tooltipKey === 'move'"
                :x="tooltipPos.x"
                :y="tooltipPos.y - 6"
                :placement="'top'"
                :styleObject="tooltipStyleObject"
              >
                {{ FINAL_CONFIG.translations.tooltipMove }}
                <kbd>M</kbd>
              </TeleportedTooltip>
            </button>

            <!-- RESIZE -->
            <button
              :disabled="shapes.length === 0 || activeShape === 'line'"
              :style="{
                  background: isResizeMode ? FINAL_CONFIG.style.buttons.controls.selected.backgroundColor :FINAL_CONFIG.style.buttons.controls.backgroundColor,
                  border: isResizeMode ? FINAL_CONFIG.style.buttons.controls.selected.border :FINAL_CONFIG.style.buttons.controls.border,
                  color: isResizeMode ? FINAL_CONFIG.style.buttons.controls.selected.color :FINAL_CONFIG.style.buttons.controls.color,
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
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
              @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('resize', $event, 'top')"
              @mouseleave="hideTooltip"
              @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('resize', $event, 'top')"
              @blur="hideTooltip"
            >
              <BaseIcon name="resize" :stroke="isResizeMode ? FINAL_CONFIG.style.buttons.controls.selected.color :FINAL_CONFIG.style.buttons.controls.color"/>

              <TeleportedTooltip
                v-if="FINAL_CONFIG.style.showTooltips"
                :show="showTooltip && tooltipKey === 'resize'"
                :x="tooltipPos.x"
                :y="tooltipPos.y - 6"
                :placement="'top'"
                :styleObject="tooltipStyleObject"
              >
                {{ FINAL_CONFIG.translations.tooltipResize }}
                <kbd>R</kbd>
              </TeleportedTooltip>
            </button>

            <!-- DELETE -->
            <button
              :disabled="shapes.length === 0"
              :style="{
                  background: isDeleteMode ? FINAL_CONFIG.style.buttons.controls.selected.backgroundColor :FINAL_CONFIG.style.buttons.controls.backgroundColor,
                  border: isDeleteMode ? FINAL_CONFIG.style.buttons.controls.selected.border :FINAL_CONFIG.style.buttons.controls.border,
                  color: isDeleteMode ? FINAL_CONFIG.style.buttons.controls.selected.color :FINAL_CONFIG.style.buttons.controls.color,
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
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
              @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('delete', $event, 'top')"
              @mouseleave="hideTooltip"
              @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('delete', $event, 'top')"
              @blur="hideTooltip"
            >
              <BaseIcon name="trash" :stroke="isDeleteMode ? FINAL_CONFIG.style.buttons.controls.selected.color :FINAL_CONFIG.style.buttons.controls.color"/>

              <TeleportedTooltip
                v-if="FINAL_CONFIG.style.showTooltips"
                :show="showTooltip && tooltipKey === 'delete'"
                :x="tooltipPos.x"
                :y="tooltipPos.y - 6"
                :placement="'top'"
                :styleObject="tooltipStyleObject"
              >
                {{ FINAL_CONFIG.translations.tooltipDelete }}
                <kbd>D</kbd>
              </TeleportedTooltip>
            </button>

            <!-- SELECT -->
            <button
              :disabled="!canSelect"
              :style="{
                  background: isSelectMode ? FINAL_CONFIG.style.buttons.controls.selected.backgroundColor :FINAL_CONFIG.style.buttons.controls.backgroundColor,
                  border: isSelectMode ? FINAL_CONFIG.style.buttons.controls.selected.border :FINAL_CONFIG.style.buttons.controls.border,
                  color: isSelectMode ? FINAL_CONFIG.style.buttons.controls.selected.color :FINAL_CONFIG.style.buttons.controls.color,
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
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
              @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('selectAndGroup', $event, 'top')"
              @mouseleave="hideTooltip"
              @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('selectAndGroup', $event, 'top')"
              @blur="hideTooltip"
            >
              <BaseIcon name="selectAndGroup" :stroke="isSelectMode ? FINAL_CONFIG.style.buttons.controls.selected.color :FINAL_CONFIG.style.buttons.controls.color"/>

              <TeleportedTooltip
                v-if="FINAL_CONFIG.style.showTooltips"
                :show="showTooltip && tooltipKey === 'selectAndGroup'"
                :x="tooltipPos.x"
                :y="tooltipPos.y - 6"
                :placement="'top'"
                :styleObject="tooltipStyleObject"
              >
                {{ FINAL_CONFIG.translations.tooltipGroup }}
                <kbd>G</kbd>
              </TeleportedTooltip>
            </button>

            <!-- SEND SHAPE TO FRONT -->
            <button
              :disabled="shapes.length === 0"
              :style="{
                  background: FINAL_CONFIG.style.buttons.controls.backgroundColor,
                  border: FINAL_CONFIG.style.buttons.controls.border,
                  color: FINAL_CONFIG.style.buttons.controls.color,
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
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
              @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('bringToFront', $event, 'top')"
              @mouseleave="hideTooltip"
              @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('bringToFront', $event, 'top')"
              @blur="hideTooltip"
            >
              <BaseIcon name="bringToFront" :stroke="FINAL_CONFIG.style.buttons.controls.color"/>

              <TeleportedTooltip
                v-if="FINAL_CONFIG.style.showTooltips"
                :show="showTooltip && tooltipKey === 'bringToFront'"
                :x="tooltipPos.x"
                :y="tooltipPos.y - 6"
                :placement="'top'"
                :styleObject="tooltipStyleObject"
              >
                {{ FINAL_CONFIG.translations.tooltipBringToFront }}
              </TeleportedTooltip>
            </button>

            <!-- SEND SHAPE TO BACK -->
            <button
              :disabled="shapes.length === 0"
              :style="{
                  background: FINAL_CONFIG.style.buttons.controls.backgroundColor,
                  border: FINAL_CONFIG.style.buttons.controls.border,
                  color: FINAL_CONFIG.style.buttons.controls.color,
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
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
              @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('bringToBack', $event, 'top')"
              @mouseleave="hideTooltip"
              @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('bringToBack', $event, 'top')"
              @blur="hideTooltip"
            >
              <BaseIcon name="bringToBack" :stroke="FINAL_CONFIG.style.buttons.controls.color"/>

              <TeleportedTooltip
                v-if="FINAL_CONFIG.style.showTooltips"
                :show="showTooltip && tooltipKey === 'bringToBack'"
                :x="tooltipPos.x"
                :y="tooltipPos.y - 6"
                :placement="'top'"
                :styleObject="tooltipStyleObject"
              >
                {{ FINAL_CONFIG.translations.tooltipBringToBack }}
              </TeleportedTooltip>
            </button>

            <!-- COPY PASTE LAST SELECTED SHAPE -->
            <button
              :disabled="shapes.length === 0 || activeShape === 'line'"
              :style="{
                  background: FINAL_CONFIG.style.buttons.controls.backgroundColor,
                  border: FINAL_CONFIG.style.buttons.controls.border,
                  color: FINAL_CONFIG.style.buttons.controls.color,
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
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
              @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('duplicate', $event, 'top')"
              @mouseleave="hideTooltip"
              @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('duplicate', $event, 'top')"
              @blur="hideTooltip"
            >
              <BaseIcon name="copy" :stroke="FINAL_CONFIG.style.buttons.controls.color" :size="18"/>

              <TeleportedTooltip
                v-if="FINAL_CONFIG.style.showTooltips"
                :show="showTooltip && tooltipKey === 'duplicate'"
                :x="tooltipPos.x"
                :y="tooltipPos.y - 6"
                :placement="'top'"
                :styleObject="tooltipStyleObject"
              >
                {{ FINAL_CONFIG.translations.tooltipDuplicate }}
              </TeleportedTooltip>
            </button>

            <!-- UNDO LAST SHAPE -->
            <button
              data-cy="annotator-button-undo"
              :disabled="HISTORY_SIZE.undo === 0"
              :style="{
                  background: FINAL_CONFIG.style.buttons.controls.backgroundColor,
                  border: FINAL_CONFIG.style.buttons.controls.border,
                  color: FINAL_CONFIG.style.buttons.controls.color,
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
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
              @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('undoLast', $event, 'top')"
              @mouseleave="hideTooltip"
              @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('undoLast', $event, 'top')"
              @blur="hideTooltip"
            >

              <BaseIcon name="refresh" :stroke="FINAL_CONFIG.style.buttons.controls.color" :size="20"/>

              <TeleportedTooltip
                v-if="FINAL_CONFIG.style.showTooltips"
                :show="showTooltip && tooltipKey === 'undoLast'"
                :x="tooltipPos.x"
                :y="tooltipPos.y - 6"
                :placement="'top'"
                :styleObject="tooltipStyleObject"
              >
                {{ FINAL_CONFIG.translations.tooltipUndo }}
                <kbd>{{ isMacLike ? '⌘' : 'Ctrl' }}</kbd><kbd>Z</kbd>
              </TeleportedTooltip>
            </button>

            <!-- REDO LAST SHAPE -->
            <button
              data-cy="annotator-button-redo"
              :disabled="HISTORY_SIZE.redo === 0"
              :style="{
                  background: FINAL_CONFIG.style.buttons.controls.backgroundColor,
                  border: FINAL_CONFIG.style.buttons.controls.border,
                  color: FINAL_CONFIG.style.buttons.controls.color,
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
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
                redoLastShape();
              "
              @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('redoLast', $event, 'top')"
              @mouseleave="hideTooltip"
              @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('redoLast', $event, 'top')"
              @blur="hideTooltip"
            >

              <BaseIcon name="refresh" :stroke="FINAL_CONFIG.style.buttons.controls.color" :size="20" :style="{
                transform: 'rotateX(0deg) rotateY(180deg)'
              }"/>

              <TeleportedTooltip
                v-if="FINAL_CONFIG.style.showTooltips"
                :show="showTooltip && tooltipKey === 'redoLast'"
                :x="tooltipPos.x"
                :y="tooltipPos.y - 6"
                :placement="'top'"
                :styleObject="tooltipStyleObject"
              >
                {{ FINAL_CONFIG.translations.tooltipRedo }}
                <kbd>{{ isMacLike ? '⌘' : 'Ctrl' }}</kbd><kbd>Y</kbd>
              </TeleportedTooltip>
            </button>

            <!-- PRINT -->
            <button
              v-if="FINAL_CONFIG.style.showPrint"
              :style="{
                  background: FINAL_CONFIG.style.buttons.controls.backgroundColor,
                  border: FINAL_CONFIG.style.buttons.controls.border,
                  color: FINAL_CONFIG.style.buttons.controls.color,
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
              }"
              :class="{ 'button-tool': true, tooltip: true }"
              @click="print"
              @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('printPdf', $event, 'top')"
              @mouseleave="hideTooltip"
              @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('printPdf', $event, 'top')"
              @blur="hideTooltip"
            >
              <BaseIcon name="printer" :stroke="FINAL_CONFIG.style.buttons.controls.color"/>

              <TeleportedTooltip
                v-if="FINAL_CONFIG.style.showTooltips"
                :show="showTooltip && tooltipKey === 'printPdf'"
                :x="tooltipPos.x"
                :y="tooltipPos.y - 6"
                :placement="'top'"
                :styleObject="tooltipStyleObject"
              >
                {{ FINAL_CONFIG.translations.tooltipPdf }}
              </TeleportedTooltip>
            </button>

            <!-- IMAGE -->
            <button
              v-if="FINAL_CONFIG.style.showImage"
              :style="{
                  background: FINAL_CONFIG.style.buttons.controls.backgroundColor,
                  border: FINAL_CONFIG.style.buttons.controls.border,
                  color: FINAL_CONFIG.style.buttons.controls.color,
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
              }"
              :class="{ 'button-tool': true, tooltip: true }"
              @click="generateImage"
              @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('printImage', $event, 'top')"
              @mouseleave="hideTooltip"
              @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('printImage', $event, 'top')"
              @blur="hideTooltip"
            >
              <BaseIcon name="image" :stroke="FINAL_CONFIG.style.buttons.controls.color" :size="20"/>

              <TeleportedTooltip
                v-if="FINAL_CONFIG.style.showTooltips"
                :show="showTooltip && tooltipKey === 'printImage'"
                :x="tooltipPos.x"
                :y="tooltipPos.y - 6"
                :placement="'top'"
                :styleObject="tooltipStyleObject"
              >
                {{ FINAL_CONFIG.translations.tooltipImage }}
              </TeleportedTooltip>
            </button>

            <!-- SAVE -->
            <button
              v-if="FINAL_CONFIG.style.showSave && $attrs.onSaveAnnotations"
              :style="{
                  background: FINAL_CONFIG.style.buttons.controls.backgroundColor,
                  border: FINAL_CONFIG.style.buttons.controls.border,
                  color: FINAL_CONFIG.style.buttons.controls.color,
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
              }"
              :class="{ 'button-tool': true, tooltip: true }"
              @click="save"
              @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('saveAction', $event, 'top')"
              @mouseleave="hideTooltip"
              @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('saveAction', $event, 'top')"
              @blur="hideTooltip"
            >
              <BaseIcon name="save" :stroke="FINAL_CONFIG.style.buttons.controls.color"/>

              <TeleportedTooltip
                v-if="FINAL_CONFIG.style.showTooltips"
                :show="showTooltip && tooltipKey === 'saveAction'"
                :x="tooltipPos.x"
                :y="tooltipPos.y - 6"
                :placement="'top'"
                :styleObject="tooltipStyleObject"
              >
                {{ FINAL_CONFIG.translations.tooltipSave }}
              </TeleportedTooltip>
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
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
              }"
              @click="
                setShapeTo('circle');
                isSelectMode = false;
              "
              @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('setCircle', $event, 'top')"
              @mouseleave="hideTooltip"
              @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('setCircle', $event, 'top')"
              @blur="hideTooltip"
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

              <TeleportedTooltip
                v-if="FINAL_CONFIG.style.showTooltips"
                :show="showTooltip && tooltipKey === 'setCircle'"
                :x="tooltipPos.x"
                :y="tooltipPos.y - 6"
                :placement="'top'"
                :styleObject="tooltipStyleObject"
              >
                {{ FINAL_CONFIG.translations.tooltipShapeCircle }}
                <kbd>C</kbd>
              </TeleportedTooltip>
            </button>
            <div v-if="activeShape === 'circle'">
              <label class="tool-input">
                {{ FINAL_CONFIG.translations.filled }}
                <input
                  type="checkbox"
                  v-model="options.circle.filled"
                  @change="setFillOfSelectedCircle"
                  :checked="options.circle.filled"
                  :style="{
                    all: 'revert',
                    appearance: 'auto',
                    '-webkit-appearance': 'auto',
                    accentColor: FINAL_CONFIG.style.color + ' !important'
                  }"
                />
              </label>
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
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
              }"
              @click="
                setShapeTo('rect');
                isSelectMode = false;
              "
              @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('setRect', $event, 'top')"
              @mouseleave="hideTooltip"
              @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('setRect', $event, 'top')"
              @blur="hideTooltip"
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

              <TeleportedTooltip
                v-if="FINAL_CONFIG.style.showTooltips"
                :show="showTooltip && tooltipKey === 'setRect'"
                :x="tooltipPos.x"
                :y="tooltipPos.y - 6"
                :placement="'top'"
                :styleObject="tooltipStyleObject"
              >
                {{ FINAL_CONFIG.translations.tooltipShapeRect }}
                <kbd>S</kbd>
              </TeleportedTooltip>
            </button>
            <div v-if="activeShape === 'rect'">
              <label class="tool-input">
                {{ FINAL_CONFIG.translations.filled }}
                <input
                  type="checkbox"
                  v-model="options.rect.filled"
                  @change="setFillOfSelectedRect"
                  :checked="options.rect.filled"
                  :style="{
                    all: 'revert',
                    appearance: 'auto',
                    '-webkit-appearance': 'auto',
                    accentColor: FINAL_CONFIG.style.color + ' !important'
                  }"
                />
              </label>
            </div>

            <!-- SET SHAPE TO ARROW -->
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
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
              }"
              @click="
                setShapeTo('arrow');
                isSelectMode = false;
              "
              @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('setArrow', $event, 'top')"
              @mouseleave="hideTooltip"
              @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('setArrow', $event, 'top')"
              @blur="hideTooltip"
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

              <TeleportedTooltip
                v-if="FINAL_CONFIG.style.showTooltips"
                :show="showTooltip && tooltipKey === 'setArrow'"
                :x="tooltipPos.x"
                :y="tooltipPos.y - 6"
                :placement="'top'"
                :styleObject="tooltipStyleObject"
              >
                {{ FINAL_CONFIG.translations.tooltipShapeArrow }}
                <kbd>A</kbd>
              </TeleportedTooltip>
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
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
              }"
              @click="
                setShapeTo('line');
                isSelectMode = false;
              "
              @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('setFreehand', $event, 'top')"
              @mouseleave="hideTooltip"
              @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('setFreehand', $event, 'top')"
              @blur="hideTooltip"
            >
              <svg width="80%" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                  <path d="M3 15c2 3 4 4 7 4s7 -3 7 -7s-3 -7 -6 -7s-5 1.5 -5 4s2 5 6 5s8.408 -2.453 10 -5" />
              </svg>

              <TeleportedTooltip
                v-if="FINAL_CONFIG.style.showTooltips"
                :show="showTooltip && tooltipKey === 'setFreehand'"
                :x="tooltipPos.x"
                :y="tooltipPos.y - 6"
                :placement="'top'"
                :styleObject="tooltipStyleObject"
              >
                {{ FINAL_CONFIG.translations.tooltipShapeFreehand }}
                <kbd>L</kbd>
              </TeleportedTooltip>
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
                <label class="tool-input">
                  {{ FINAL_CONFIG.translations.thickness }}
                  <input
                    type="number"
                    v-model="strokeSize"
                    @input="setStrokeWidthOfSelectedShape"
                    :min="1"
                    style="
                      padding: 0 4px;
                      width: 40px;
                      border: 1px solid #dadada;
                      border-radius: 3px;
                    "
                  >
                </label>
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
                <label class="tool-input">
                  {{ FINAL_CONFIG.translations.dashedLines }}
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
                    name="dashStyle"
                    type="checkbox"
                    v-model="isDash"
                    @change="setSelectedShapeToDash"
                    :checked="isDash"
                    :style="{
                      all: 'revert',
                      appearance: 'auto',
                      '-webkit-appearance': 'auto',
                      accentColor: FINAL_CONFIG.style.color + ' !important'
                    }"
                  />
                </label>
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
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
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
              @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('setText', $event, 'top')"
              @mouseleave="hideTooltip"
              @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('setText', $event, 'top')"
              @blur="hideTooltip"
            >
              <BaseIcon name="text" :stroke="isTextMode ? FINAL_CONFIG.style.buttons.shapes.selected.color :FINAL_CONFIG.style.buttons.shapes.color"/>

              <TeleportedTooltip
                v-if="FINAL_CONFIG.style.showTooltips"
                :show="showTooltip && tooltipKey === 'setText'"
                :x="tooltipPos.x"
                :y="tooltipPos.y - 6"
                :placement="'top'"
                :styleObject="tooltipStyleObject"
              >
                {{ FINAL_CONFIG.translations.tooltipShapeText }}
                <kbd>T</kbd>
              </TeleportedTooltip>
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
                <label class="tool-input">
                  {{ FINAL_CONFIG.translations.fontSize }}
                  <input
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
                </label>
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
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
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
                @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('setAlignStart', $event, 'top')"
                @mouseleave="hideTooltip"
                @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('setAlignStart', $event, 'top')"
                @blur="hideTooltip"
              >
                  <svg width="80%" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <path d="M4 6l16 0" />
                      <path d="M4 12l10 0" />
                      <path d="M4 18l14 0" />
                  </svg>

                  <TeleportedTooltip
                    v-if="FINAL_CONFIG.style.showTooltips"
                    :show="showTooltip && tooltipKey === 'setAlignStart'"
                    :x="tooltipPos.x"
                    :y="tooltipPos.y - 6"
                    :placement="'top'"
                    :styleObject="tooltipStyleObject"
                  >
                    {{ FINAL_CONFIG.translations.tooltipShapeTextLeft }}
                  </TeleportedTooltip>
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
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
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
                @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('setAlignMiddle', $event, 'top')"
                @mouseleave="hideTooltip"
                @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('setAlignMiddle', $event, 'top')"
                @blur="hideTooltip"
              >
                  <svg width="80%" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <path d="M4 6l16 0" />
                      <path d="M8 12l8 0" />
                      <path d="M6 18l12 0" />
                  </svg>

                  <TeleportedTooltip
                    v-if="FINAL_CONFIG.style.showTooltips"
                    :show="showTooltip && tooltipKey === 'setAlignMiddle'"
                    :x="tooltipPos.x"
                    :y="tooltipPos.y - 6"
                    :placement="'top'"
                    :styleObject="tooltipStyleObject"
                  >
                    {{ FINAL_CONFIG.translations.tooltipShapeTextCenter }}
                  </TeleportedTooltip>
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
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
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
                @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('setAlignEnd', $event, 'top')"
                @mouseleave="hideTooltip"
                @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('setAlignEnd', $event, 'top')"
                @blur="hideTooltip"
              >
                  <svg width="80%" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <path d="M4 6l16 0" />
                      <path d="M10 12l10 0" />
                      <path d="M6 18l14 0" />
                  </svg>

                  <TeleportedTooltip
                    v-if="FINAL_CONFIG.style.showTooltips"
                    :show="showTooltip && tooltipKey === 'setAlignEnd'"
                    :x="tooltipPos.x"
                    :y="tooltipPos.y - 6"
                    :placement="'top'"
                    :styleObject="tooltipStyleObject"
                  >
                    {{ FINAL_CONFIG.translations.tooltipShapeTextRight }}
                  </TeleportedTooltip>
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
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
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
                @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('setBulletMode', $event, 'top')"
                @mouseleave="hideTooltip"
                @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('setBulletMode', $event, 'top')"
                @blur="hideTooltip"
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

                  <TeleportedTooltip
                    v-if="FINAL_CONFIG.style.showTooltips"
                    :show="showTooltip && tooltipKey === 'setBulletMode'"
                    :x="tooltipPos.x"
                    :y="tooltipPos.y - 6"
                    :placement="'top'"
                    :styleObject="tooltipStyleObject"
                  >
                    {{ FINAL_CONFIG.translations.tooltipShapeTextBullet }}
                  </TeleportedTooltip>
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
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
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
                @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('setBold', $event, 'top')"
                @mouseleave="hideTooltip"
                @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('setBold', $event, 'top')"
                @blur="hideTooltip"
              >
                  <svg width="100%" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <path d="M7 5h6a3.5 3.5 0 0 1 0 7h-6z" />
                      <path d="M13 12h1a3.5 3.5 0 0 1 0 7h-7v-7" />
                  </svg>

                  <TeleportedTooltip
                    v-if="FINAL_CONFIG.style.showTooltips"
                    :show="showTooltip && tooltipKey === 'setBold'"
                    :x="tooltipPos.x"
                    :y="tooltipPos.y - 6"
                    :placement="'top'"
                    :styleObject="tooltipStyleObject"
                  >
                    {{ FINAL_CONFIG.translations.tooltipShapeTextBold }}
                  </TeleportedTooltip>
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
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
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
                @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('setItalic', $event, 'top')"
                @mouseleave="hideTooltip"
                @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('setItalic', $event, 'top')"
                @blur="hideTooltip"
              >
                  <svg width="100%" height="44" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <path d="M11 5l6 0" />
                      <path d="M7 19l6 0" />
                      <path d="M14 5l-4 14" />
                  </svg>

                  <TeleportedTooltip
                    v-if="FINAL_CONFIG.style.showTooltips"
                    :show="showTooltip && tooltipKey === 'setItalic'"
                    :x="tooltipPos.x"
                    :y="tooltipPos.y - 6"
                    :placement="'top'"
                    :styleObject="tooltipStyleObject"
                  >
                    {{ FINAL_CONFIG.translations.tooltipShapeTextItalic }}
                  </TeleportedTooltip>
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
                  borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                  cursor: isCursorPointer ? 'pointer' : 'default'
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
                @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('setUnderline', $event, 'top')"
                @mouseleave="hideTooltip"
                @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('setUnderline', $event, 'top')"
                @blur="hideTooltip"
              >
                  <svg width="100%" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                      <path d="M7 5v5a5 5 0 0 0 10 0v-5" />
                      <path d="M5 19h14" />
                  </svg>

                  <TeleportedTooltip
                    v-if="FINAL_CONFIG.style.showTooltips"
                    :show="showTooltip && tooltipKey === 'setUnderline'"
                    :x="tooltipPos.x"
                    :y="tooltipPos.y - 6"
                    :placement="'top'"
                    :styleObject="tooltipStyleObject"
                  >
                    {{ FINAL_CONFIG.translations.tooltipShapeTextUnderline }}
                  </TeleportedTooltip>
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

            <button
              :class="{
                'button-tool': true,
                tooltip: true
              }"
              :style="{
                borderRadius: '6px'
              }"
              @mouseenter="FINAL_CONFIG.style.showTooltips && showToolTipFor('setColor', $event, 'top')"
              @mouseleave="hideTooltip"
              @focus="FINAL_CONFIG.style.showTooltips && showToolTipFor('setColor', $event, 'top')"
              @blur="hideTooltip"
            >
              <ColorPicker
                v-model:value="selectedColor"
                :backgroundColor="FINAL_CONFIG.style.backgroundColor"
                :buttonBorderColor="FINAL_CONFIG.style.color"
                :isCursorPointer="isCursorPointer"
                teleported
              />  
            </button>
                <TeleportedTooltip
                  v-if="FINAL_CONFIG.style.showTooltips"
                  :show="showTooltip && tooltipKey === 'setColor'"
                  :x="tooltipPos.x"
                  :y="tooltipPos.y - 6"
                  :placement="'top'"
                  :styleObject="tooltipStyleObject"
                >
                  {{ FINAL_CONFIG.translations.tooltipShapeColor }}
                </TeleportedTooltip>
            </div>
            <div
              style="
                display: flex;
                flex-direction: column;
                align-items: start;
                justify-content: center;
              "
            >
              <label class="tool-input" style="font-variant-numeric: tabular-nums;">
                {{ FINAL_CONFIG.translations.colorAlpha }}:
                {{ transparency > 98 ? 100 : transparency }} %
                <input
                  name="colorTransparency"
                  type="range"
                  v-model="transparency"
                  @input="setTransparencyOfSelectedShape"
                  :min="0"
                  :max="100"
                  :style="{
                    width: '100%',
                    accentColor: FINAL_CONFIG.style.color + ' !important'
                  }"
                />
              </label>
            </div>
          </div>
        </template>
      </Accordion>
    </div>

    <div
      class="annotator annotator__wrapper"
      ref="drawSvgContainer"
      style="position: relative"
      :id="uid"
      data-annotator-content
    >
      <div class="annotator__content-layer" :style="`${isSummaryOpen ? 'pointer-events: none;' : ''}`">
        <slot data-cy="annotator-slot"></slot>
      </div>
      <svg
        id="annotatorSvg"
        v-if="isSummaryOpen || FINAL_CONFIG.alwaysVisible"
        :key="step"
        ref="mainSvg"
        :class="{ 'annotator__overlay': true, draw: true, 'draw--free': activeShape === 'line' }"
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        :width="sourceWidth"
        :height="sourceHeight"
        @pointerdown="chooseAction($event)"
        @pointerup="resetDraw($event)"
        @touchend="resetDraw($event)"
        @touchstart="setPointer($event); clickSvg($event); "
        @pointermove="
          setPointer($event);
          chooseMove($event);
        "
        @pointerout="onPointerOut($event)"
        @pointerover="allowEditAndHoverShapes($event)"
        @click="clickSvg($event)"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          cursor: cursorClass,
          fontFamily: 'Helvetica',
          zIndex: 100000000,
          pointerEvents: isSummaryOpen ? 'all' : 'none',
        }"
      >

      <rect
        class="annotator__glass"
        x="0" y="0"
        :width="svgWidth" :height="svgHeight"
        fill="transparent"
        :pointer-events="isSummaryOpen ? 'all' : 'none'"
        :style="{ cursor: 'inherit' }"
        @pointerdown.stop.prevent="chooseAction($event)"
        @pointermove.stop.prevent="setPointer($event); chooseMove($event)"
        @pointerup.stop.prevent="resetDraw"
        @click.stop.prevent
      />

        <g
          v-for="shape in userShapes"
          :key="shape.id"
          v-html="shape.html"
          @click="
            clickShape($event);
            isMoveMode = false;
          "
        ></g>
      </svg>
      <svg
        style="position: absolute; top: 0; left: 0"
        v-if="isPrinting || isImaging"
        :height="sourceHeight"
        :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
        :width="sourceWidth"
        data-dom-to-png-ignore
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

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { opacity, treeShake, convertConfigColors, createUid } from "../lib";
import { useConfig } from "../useConfig";
import { domToPng } from "../dom-to-png";
import { registerAnnotatorShortcuts } from "../registerAnnotatorShortcuts";
import { usePrinter } from "../usePrinter";
import BaseIcon from "../atoms/BaseIcon.vue";
import Accordion from "./vue-ui-accordion.vue";
import TeleportedTooltip from "../atoms/TeleportedTooltip.vue";
import ColorPicker from "../atoms/ColorPicker.vue";

const props = defineProps({
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
  }
});

const emit = defineEmits(['toggleOpenState', 'saveAnnotations'])

const fileName = 'annotations';
const uid = ref(createUid());

const { isImaging, generateImage } = usePrinter({
  elementId: uid.value,
  fileName,
});

const activeShape = ref(undefined);
const strokeSize = ref(1);
const currentPointer = ref({
  start: { x: 0, y: 0 },
  end: { x: 0, y: 0 }
});
const currentTarget = ref(undefined);
const hoveredShapeId = ref(undefined);
const isBold = ref(false);
const isBulletTextMode = ref(false);
const isDash = ref(false);
const isDeleteMode = ref(false);
const isDrawing = ref(false);
const isDrawingNewShape = ref(true);
const isDrawMode = ref(false);
const isItalic = ref(false);
const isMouseDown = ref(false);
const isMoveMode = ref(false);
const isPrinting = ref(false);
const isResizeMode = ref(false);
const isSelectMode = ref(false);
const isSummaryOpen = ref(false);
const isTextMode = ref(false);
const isUnderline = ref(false);
const isWriting = ref(false);
const lastSelectedShape = ref(props.dataset?.lastSelectedShape ?? undefined);
const pointerPosition = ref({ x: 0, y: 0 });
const preventEdit = ref(true);
const selectedGroup = ref([]);
const shapes = ref(props.dataset?.shapes || []);
const shapesOrder = ref([]);
const step = ref(Math.round(Math.random()) * 100000);
const svgHeight = ref(1000);
const svgWidth = ref(1000);
const options = ref({
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
});
const selectedColor = ref('#1A1A1A');
const showCaret = ref(false);
const sizeRatio = ref(1);
const slottedSvg = ref(undefined);
const sourceWidth = ref(1);
const sourceHeight = ref(1);
const textAlign = ref('start');
const textFont = ref(20);
const transparency = ref(100);
const transparencyCodes = opacity;
const dragOffset = ref(null);
const showTooltip = ref(false);
const tooltipKey = ref(null);
const tooltipPos = ref({ x: 0, y: 0 });
const tooltipAnchor = ref(null);
const history = ref([]);
const isMacLike = ref(false);
const ONKEYDOWN = ref(null);
const HISTORY_SIZE = ref({ undo: 0, redo: 0 });
const RAF_ID = ref(null);
const LAST_POINTER_ID = ref(null);
const CAPTURE_EL = ref(null);
const lastPointerId = ref(null);

const FINAL_CONFIG = computed(() => {
  const DEFAULT_CONFIG = useConfig().vue_ui_annotator;

    if(!Object.keys(props.config || {}).length) {
        return DEFAULT_CONFIG
    }
    
    const reconcilied = treeShake({
        defaultConfig: DEFAULT_CONFIG,
        userConfig: props.config
    });

    return convertConfigColors(reconcilied);
});

const isCursorPointer = computed(() => FINAL_CONFIG.value.useCursorPointer);

const tooltipStyleObject = computed(() => {
  const s = FINAL_CONFIG.value.style.tooltips;
  return {
    backgroundColor: s.backgroundColor,
    color: s.color,
    border: s.border,
    borderRadius: `${s.borderRadius}px`,
    boxShadow: s.boxShadow,
  };
});

const canSelect = computed(() => shapes.value.filter((shape) => !["line", "group"].includes(shape.type)).length > 1);

const colorTransparency = computed(() => transparencyCodes[transparency.value > 98 ? 98 : transparency.value]);

const cursorClass = computed(() => {
  switch (true) {
    case isDeleteMode.value:
      return "default";

    case isMoveMode.value:
      return "move";

    case isTextMode.value:
      return "text";

    case isResizeMode.value:
      return "se-resize";

    default:
      return "";
  }
});

const records = computed(() => shapes.value);
const mainSvg = ref(null);

function includeSelectionIndicator(shape) {
  if (!shape) {
    return;
  }

  switch (true) {
    case shape.type === "rect":
      return `
                <rect
                id="${shape.id}" 
                style="stroke-dasharray: 10; display:${
                  hoveredShapeId.value && hoveredShapeId.value === shape.id
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
                  hoveredShapeId.value && hoveredShapeId.value === shape.id
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
                  hoveredShapeId.value && hoveredShapeId.value === shape.id
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
      const selectedText = mainSvg.value ? Array.from(mainSvg.value.getElementsByTagName("text")).find(
        (textElement) => textElement.id === shape.id
      ) : null;
      if (!selectedText) {
        return;
      }
      const { x, y, width, height } = selectedText.getBBox();
      return `
                <rect
                id="${shape.id}" 
                style="stroke-dasharray: 10; display:${
                  hoveredShapeId.value && hoveredShapeId.value === shape.id
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
}

function includeDeleteButton(shape, isBulletTextMode = false) {
  switch (true) {
    case shape.type === "circle":
      return `
                <g id="${shape.id}" style="display:${
        isDeleteMode.value ? "initial" : "none"
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
        isDeleteMode.value ? "initial" : "none"
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
        isDeleteMode.value ? "initial" : "none"
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
}

function computeCaretPosition(shape) {
  switch (true) {
    case shape.textAlign === "middle":
      return `<path class="vue-ui-annotator-caret" stroke="black" stroke-width="2" d="M${shape.x},${
        shape.y - shape.fontSize
      } ${shape.x},${
        shape.y - shape.fontSize - 15
      }" /> <path class="vue-ui-annotator-caret" stroke="black" stroke-width="2" d="M${shape.x - 3},${
        shape.y - shape.fontSize - 5
      } ${shape.x},${shape.y - shape.fontSize} ${shape.x + 3},${
        shape.y - shape.fontSize - 5
      }"/>`;

    case shape.textAlign === "start":
      const bulletModeOffset = shape.isBulletTextMode ? shape.fontSize : 0;
      return `<path class="vue-ui-annotator-caret" d="M${shape.x - 20 - bulletModeOffset},${
        shape.y - shape.fontSize / 6
      } ${shape.x - 5 - bulletModeOffset},${
        shape.y - shape.fontSize / 6
      }" stroke="black" stroke-width="2" />
                    <path class="vue-ui-annotator-caret" d="M${shape.x - 10 - bulletModeOffset},${
        shape.y - shape.fontSize / 3
      } ${shape.x - 5 - bulletModeOffset},${shape.y - shape.fontSize / 6} ${
        shape.x - 10 - bulletModeOffset
      },${shape.y}" stroke="black" stroke-width="2">`;

    case shape.textAlign === "end":
      return `<path class="vue-ui-annotator-caret" d="M${shape.x + 20},${shape.y - shape.fontSize / 6} ${
        shape.x + 5
      },${shape.y - shape.fontSize / 6}" stroke="black" stroke-width="2" />
                    <path class="vue-ui-annotator-caret" d="M${shape.x + 10},${shape.y - shape.fontSize / 3} ${
        shape.x + 5
      },${shape.y - shape.fontSize / 6} ${shape.x + 10},${
        shape.y
      }" stroke="black" stroke-width="2">`;

    default:
      return "";
  }
}

function computeTextElement(shape, content, isBulletTextMode = false) {
  switch (true) {
    case shape.textAlign === "start":
      return `
            <g id="${shape.id}">
                <rect 
                    id="${shape.id}" 
                    style="display:${
                      lastSelectedShape.value && lastSelectedShape.value.id === shape.id
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
                  showCaret.value &&
                  lastSelectedShape.value &&
                  lastSelectedShape.value.id === shape.id
                    ? computeCaretPosition(shape)
                    : ""
                }
                ${includeDeleteButton(shape, isBulletTextMode)}
            </g> 
            `;

    case shape.textAlign === "middle":
      return `
                <g id="${shape.id}">
                <rect 
                    id="${shape.id}" 
                    style="display:${
                      lastSelectedShape.value && lastSelectedShape.value.id === shape.id
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
                  showCaret.value &&
                  lastSelectedShape.value &&
                  lastSelectedShape.value.id === shape.id
                    ? computeCaretPosition(shape)
                    : ""
                }
                ${includeDeleteButton(shape)}
                </g>
            `;

    case shape.textAlign === "end":
      return `
            <g id="${shape.id}">
                <rect 
                    id="${shape.id}" 
                    style="display:${
                      lastSelectedShape.value && lastSelectedShape.value.id === shape.id
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
                  showCaret.value &&
                  lastSelectedShape.value &&
                  lastSelectedShape.value.id === shape.id
                    ? computeCaretPosition(shape)
                    : ""
                }
                ${includeDeleteButton(shape)}
            </g> 
            `;

    default:
      return "";
  }
}

const userShapes = computed(() => {
  return records.value.map((shape) => {
    switch (true) {
      case shape && shape.type === "arrow":
        const shapeWidthMax = shape.strokeWidth > 3 ? 5 : 10;
        const shapeWidthMin = shape.strokeWidth > 3 ? 2.5 : 5;
        return {
          html: `
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
          ${includeSelectionIndicator(shape)}
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
                isResizeMode.value || isMoveMode.value ? "initial" : "none"
              }; rx:1 !important; ry:1 !important;"
          />
          </g>
          ${includeDeleteButton(shape)}
          </g>
          `,
          id: shape.id
        };

      case shape && shape.type === "circle":
        return {
          html: `
          <g id="${shape.id}">
              ${includeSelectionIndicator(shape)}
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
          
          ${includeDeleteButton(shape)}`,
          id: shape.id
        };

      case shape && shape.type === "group":
        return {
          html: `<g id="${shape.id}">
            <rect
                id="${isResizeMode.value ? "" : shape.id}"
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
          isSelectMode.value ||
          isDeleteMode.value ||
          (hoveredShapeId.value && hoveredShapeId.value === shape.id)
            ? "initial"
            : "none"
        };"
                        />
            <g id="${shape.id}">
            ${shape.content ? shape.content : ""}
            </g>
            ${includeDeleteButton(shape)}
            </g> `,
            id: shape.id
        }

      case shape && shape.type === "rect":
        return {
          html: `<g id="${shape.id}">
            ${includeSelectionIndicator(shape)}
            <rect
                id="${isResizeMode.value ? "" : shape.id}"
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
                  isResizeMode.value ? "initial" : "none"
                }; rx:1 !important; ry:1 !important;"
            />
            ${includeDeleteButton(shape)}
            </g> `,
            id: shape.id
        }

      case shape && shape.type === "line":
        return {
          html: `
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
            ${includeDeleteButton(shape)}
                </g>
                `,
                id: shape.id
        }

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
        return {
          html: `
            ${includeSelectionIndicator(shape)}
            ${computeTextElement(
              shape,
              parsedContent,
              shape.isBulletTextMode
            )}
            `,
            id: shape.id
        };
      default:
        break;
    }
  })
});

function copy(source) {
  if (source === undefined || source === null) return source;
  try {
    if (typeof structuredClone === 'function') return structuredClone(source);
    return JSON.parse(JSON.stringify(source));
  } catch {
    if (Array.isArray(source)) return source.map(v => copy(v));
    if (typeof source === 'object') return Object.fromEntries(
      Object.entries(source).map(([k, v]) => [k, copy(v)])
    );
    return source;
  }
}

function drawUp(useShapeReference = false) {
  if (!activeShape.value || !isDrawing.value) {
    return;
  }
  currentPointer.value.end = {
    x: pointerPosition.value.x,
    y: pointerPosition.value.y,
  };
  let currentShape;
  if (shapes.value.length > 0 && currentTarget.value) {
    currentShape = [...shapes.value].find(
      (shape) => shape.id === currentTarget.value.id
    );
  }

  let a, b, distanceToPointer;
  if (currentShape) {
    a = currentShape.x - currentPointer.value.end.x;
    b = currentShape.y - currentPointer.value.end.y;
    distanceToPointer = Math.sqrt(a * a + b * b);
  }

  let Xmax, Xmin, Ymax, Ymin;
  if (useShapeReference) {
    Xmax = Math.max(currentPointer.value.end.x, currentShape.x);
    Xmin = Math.min(currentPointer.value.end.x, currentShape.x);
    Ymax = Math.max(currentPointer.value.end.y, currentShape.y);
    Ymin = Math.min(currentPointer.value.end.y, currentShape.y);
  } else {
    Xmax = Math.max(currentPointer.value.end.x, currentPointer.value.start.x);
    Xmin = Math.min(currentPointer.value.end.x, currentPointer.value.start.x);
    Ymax = Math.max(currentPointer.value.end.y, currentPointer.value.start.y);
    Ymin = Math.min(currentPointer.value.end.y, currentPointer.value.start.y);
  }

  switch (true) {
      case activeShape.value === "arrow":
        shapes.value.at(-1).endX = currentPointer.value.end.x;
        shapes.value.at(-1).endY = currentPointer.value.end.y;
        break;

      case activeShape.value === "circle":
        const offset = 20; // used to avoid shape shifting when resizing over another shape
        shapes.value.at(-1).circleRadius = isDrawingNewShape.value
          ? copy(Xmax - Xmin) + offset
          : distanceToPointer + offset;
        break;

      case activeShape.value === "line":
        shapes.value.at(-1).path += ` ${pointerPosition.value.x} ${pointerPosition.value.y} `;
        break;

      case ["rect", "group"].includes(activeShape.value):
        const minRectSize = 20;
        shapes.value.at(-1).rectWidth =
          copy(currentPointer.value.end.x - shapes.value.at(-1).x) > 0
            ? copy(currentPointer.value.end.x - shapes.value.at(-1).x)
            : minRectSize;
        shapes.value.at(-1).rectHeight =
          copy(currentPointer.value.end.y - shapes.value.at(-1).y) > 0
            ? copy(currentPointer.value.end.y - shapes.value.at(-1).y)
            : minRectSize;

      default:
        break;
    }
}

function TICK_DRAW() {
  if (!isDrawing.value) { 
    RAF_ID.value = null; 
    return; 
  }
  drawUp();
  RAF_ID.value = requestAnimationFrame(TICK_DRAW);
}

function bringToFrontById(id) {
  const i = shapes.value.findIndex(s => s.id === id);
  if (i > -1 && i !== shapes.value.length - 1) {
    const [s] = shapes.value.splice(i, 1);
    shapes.value.push(s);
  }
}

function shapeIdUnderPointer(e) {
  const idIsShape = (id) => !!id && shapes.value.some(s => s.id === id);

  // if event already targets a shape, use it
  if (idIsShape(e?.target?.id)) return e.target.id;

  // temporarily disable the glass to probe the element below
  const glass = mainSvg.value?.querySelector('.annotator__glass');
  if (!glass) return null;

  const prev = glass.style.pointerEvents;
  glass.style.pointerEvents = 'none';
  const el = document.elementFromPoint(e.clientX, e.clientY);
  glass.style.pointerEvents = prev || 'all';

  return idIsShape(el?.id) ? el.id : null;
}

function makeHistory(opts = {}) {
  const {
    maxEntries = 200,
    maxBytes   = 2000000,
  } = opts;

  const state = { open: false, before: null, undo: [], redo: [] };
  const bytes = { undo: 0, redo: 0 };
  const sz = (s) => (typeof s === 'string' ? s.length * 2 : 0); // UTF-16-ish

  const snapshot = () => JSON.stringify({
    shapes: copy(shapes.value),
    lastSelectedShape: copy(lastSelectedShape.value),
  });

  const apply = (snap) => {
    const s = JSON.parse(snap);
    shapes.value = s.shapes;
    lastSelectedShape.value = s.lastSelectedShape;
  };

  const refreshSizes = () => {
    HISTORY_SIZE.value.undo = state.undo.length;
    HISTORY_SIZE.value.redo = state.redo.length;
  };

  const pushCapped = (stackName, snap) => {
    const stack = state[stackName];
    stack.push(snap);
    bytes[stackName] += sz(snap);
    while (stack.length > maxEntries || bytes[stackName] > maxBytes) {
      const removed = stack.shift();
      bytes[stackName] -= sz(removed);
    }
  };

  return {
    begin() {
      if (state.open) return;
      state.open = true;
      state.before = snapshot();
    },
    end() {
      if (!state.open) return;
      state.open = false;
      const after = snapshot();
      if (after !== state.before) {
        pushCapped('undo', state.before);
        state.redo.length = 0;
        bytes.redo = 0;
      }
      state.before = null;
      refreshSizes();
    },
    undo() {
      const prev = state.undo.pop();
      if (!prev) return;
      bytes.undo -= sz(prev);
      const curr = snapshot();
      pushCapped('redo', curr);
      apply(prev);
      refreshSizes();
    },
    redo() {
      const next = state.redo.pop();
      if (!next) return;
      bytes.redo -= sz(next);
      const curr = snapshot();
      pushCapped('undo', curr);
      apply(next);
      refreshSizes();
    },
    size() {
      return {
        undo: state.undo.length,
        redo: state.redo.length,
        approxBytes: { undo: bytes.undo, redo: bytes.redo }
      };
    }
  };
}

function updateTooltipPosition() {
  if (!tooltipAnchor.value) return;
  const r = tooltipAnchor.value.getBoundingClientRect();
  tooltipPos.value = { x: r.left + r.width / 2, y: r.top };
}

// FIXME: remove placement arg
function showToolTipFor(key, ev, _placement = "top") {
  tooltipKey.value = key;
  tooltipAnchor.value = ev.currentTarget || ev.target;
  updateTooltipPosition();
  showTooltip.value = true;
  window.addEventListener("scroll", updateTooltipPosition, true);
  window.addEventListener("resize", updateTooltipPosition, { passive: true });
}

function hideTooltip() {
  showTooltip.value = false;
  tooltipKey.value = null;
  tooltipAnchor.value = null;
  window.removeEventListener("scroll", updateTooltipPosition, true);
  window.removeEventListener("resize", updateTooltipPosition);
}

function initDragOffset(e) {
  const shapeId = (e?.target && e.target.id) || (currentTarget.value && currentTarget.value.id);
  const shape = shapes.value.find((s) => s.id === shapeId);
  if (!shape) { 
    dragOffset.value = null; 
    return; 
  }

  lastSelectedShape.value = shape;

  const px = pointerPosition.value.x;
  const py = pointerPosition.value.y;

  switch (shape.type) {
    case "rect":
    case "circle":
    case "text":
      dragOffset.value = { dx: px - shape.x, dy: py - shape.y };
      break;

    case "arrow":
      dragOffset.value = {
        dx: px - shape.x,
        dy: py - shape.y,
        endDx: px - shape.endX,
        endDy: py - shape.endY,
      };
      break;

    case "group":
      // Use group origin as anchor (no centering)
      dragOffset.value = { dx: px - (shape.x || 0), dy: py - (shape.y || 0) };
      break;

    default:
      dragOffset.value = { dx: 0, dy: 0 };
      break;
  }
}

function bringShapeTo(layer) {
  const thisShape = shapes.value.find(
    (shape) => shape.id === lastSelectedShape.value.id
  );
  switch (true) {
    case layer === "front":
      shapes.value = shapes.value.filter((shape) => shape.id !== thisShape.id);
      shapes.value.push(thisShape);
      break;

    case layer === "back":
      shapes.value = shapes.value.filter((shape) => shape.id !== thisShape.id);
      shapes.value = [thisShape, ...shapes.value];
      break;

    default:
      return;
  }
}

function copyPaste() {
  if (!lastSelectedShape.value?.id) return;
  const shapeCopy = {
    ...lastSelectedShape.value,
    id: `${lastSelectedShape.value.id}_copy_${createUid()}`,
    x: lastSelectedShape.value.x - 100 < 0 ? 1 : lastSelectedShape.value.x - 100,
    y: lastSelectedShape.value.y - 100 < 0 ? 1 : lastSelectedShape.value.y - 100,
  };
  shapes.value.push(shapeCopy);
}

function allowEditAndHoverShapes(e) {
  e.preventDefault();
  preventEdit.value = false;
  if (e.target && e.target.id) {
    hoveredShapeId.value = e.target.id;
  }
}

function deleteEmptyTextElement() {
  if (!lastSelectedShape.value || !lastSelectedShape.value.id.includes("text")) {
    return;
  }

  if (lastSelectedShape.value.textContent === "") {
    shapes.value = shapes.value.filter(
      (shape) => shape.id !== lastSelectedShape.value.id
    );
    lastSelectedShape.value = shapes.value.at(-1);
  }
}

function clickSvg(e) {
  if (isDeleteMode.value) {
    return;
  }
  e.preventDefault(); 
  e.stopPropagation();

  deleteEmptyTextElement();

  if (isTextMode.value) {
    isWriting.value = true;
    showCaret.value = true;
  } else {
    isWriting.value = false;
    showCaret.value = false;
    isTextMode.value = false;
  }

  let id = `text_${createUid()}`;

  if (isWriting.value) {
    history.value?.begin();
    shapes.value.push({
      id,
      type: "text",
      lines: 0,
      x: pointerPosition.value.x,
      y: pointerPosition.value.y,
      textContent: "",
      fontSize: copy(textFont.value),
      textAlign: copy(textAlign.value),
      isBold: copy(isBold.value),
      isItalic: copy(isItalic.value),
      isUnderline: copy(isUnderline.value),
      color: copy(selectedColor.value),
      isBulletTextMode: copy(isBulletTextMode.value),
    });
    currentTarget.value = shapes.value.at(-1);
    lastSelectedShape.value = shapes.value.at(-1);
    history.value?.end();
    return;
  }

  const setIsDashState = () => {
    isDash.value = shapes.value.find((shape) => shape.id === e.target.id).isDash;
  };
  const setStrokeSize = () => {
    strokeSize.value = shapes.value.find(
      (shape) => shape.id === e.target.id
    ).strokeWidth;
  };

  isSelectMode.value = false;

  if (e.target.id.includes("arrow")) {
    activeShape.value = "arrow";
    setIsDashState();
    setStrokeSize();
    return;
  }
  if (e.target.id.includes("circle")) {
    activeShape.value = "circle";
    options.value.circle.filled = shapes.value.find(
      (shape) => shape.id === e.target.id
    ).isFilled;
    setIsDashState();
    setStrokeSize();
    return;
  }
  if (e.target.id.includes("rect")) {
    activeShape.value = "rect";
    options.value.rect.filled = shapes.value.find(
      (shape) => shape.id === e.target.id
    ).isFilled;
    setIsDashState();
    setStrokeSize();
    return;
  }
  if (e.target.id.includes("line")) {
    activeShape.value = "line";
    setStrokeSize();
    return;
  }

  if (e.target.id.includes("text")) {
    isTextMode.value = true;
    isWriting.value = true;
    showCaret.value = true;
    const lastShape = shapes.value.find((shape) => shape.id === e.target.id);
    if (lastShape && lastShape.textAlign) {
      textAlign.value = shapes.value.find(
        (shape) => shape.id === e.target.id
      ).textAlign;
    }
    if (lastShape) {
      isBulletTextMode.value = shapes.value.find(
        (shape) => shape.id === e.target.id
      ).isBulletTextMode;
    }
    return;
  }
}

function setSelectedTextAlignTo(position) {
  if (!lastSelectedShape.value || lastSelectedShape.value.type !== "text") {
    return;
  }
  lastSelectedShape.value.textAlign = position;
}

function undoLastShape() {
  history.value?.undo?.();
}

function redoLastShape() {
  history.value?.redo?.();
}

const NO_ACTION_KEYS = [
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

function write(e) {
  if (preventEdit.value) {
    return;
  }
  e.preventDefault();
  const keyCode = e.keyCode;

  if (!isWriting.value) {
    return;
  }
  showCaret.value = true;
  let text;
  if (lastSelectedShape.value.type === "text") {
    text = shapes.value.find((shape) => shape.id === lastSelectedShape.value.id);
  } else {
    text = shapes.value.at(-1);
  }
  currentTarget.value = text;

  if (text.type !== "text") {
    return;
  }

  currentTarget.value.isBold = copy(isBold.value);
  currentTarget.value.isItalic = copy(isItalic.value);
  currentTarget.value.isUnderline = copy(isUnderline.value);

  switch (true) {
    case [8, 46].includes(keyCode) :
      text.textContent = text.textContent.slice(0, -1);
      break;
    case keyCode === 9:
      text.textContent += "&nbsp; &nbsp; &nbsp; &nbsp;";
      break;
    case keyCode === 13:
      text.lines += 1;
      text.textContent += "‎"; // used to parse lines to create tspan elements when ENTER is pressed
      return;
    case NO_ACTION_KEYS.includes(keyCode):
      return;

    default:
      text.textContent += e.key;
  }
}

function groupShapes() {
  selectedGroup.value = [];

  if (activeShape.value !== "group") {
    isSelectMode.value = false;
    shapes.value = shapes.value.filter((shape) => shape.type !== "group");
    return;
  }
  const group = shapes.value.at(-1);

  shapes.value.forEach((shape) => {
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
          selectedGroup.value.push(shape);
        }
        break;

      case shape.type === "circle":
        if (
          group.x <= shape.x + shape.circleRadius &&
          group.y <= shape.y + shape.circleRadius &&
          shape.x + shape.circleRadius <= group.x + group.rectWidth &&
          shape.y + shape.circleRadius <= group.y + group.rectHeight
        ) {
          selectedGroup.value.push(shape);
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
          selectedGroup.value.push(shape);
        }
        break;

      case shape.type === "text":
        if (group.x <= shape.x && group.y <= shape.y) {
          selectedGroup.value.push(shape);
        }
        break;

      default:
        break;
    }
  });

  // add an old independant id to the selectedShape to keep track of old id
  // replace id of selected shape with the group id
  selectedGroup.value = selectedGroup.value.map((shape) => {
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

  group.source = selectedGroup.value;

  if (selectedGroup.value.length > 1) {
    const bannedIds = copy(selectedGroup.value).map((shape) => {
      return shape.oldId;
    });

    // remove selected shapes from the shapes array
    shapes.value = shapes.value.filter((shape) => !bannedIds.includes(shape.id));

    // redraw each shape in the context of the group
    selectedGroup.value.forEach((shape) => {
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
            id="${isResizeMode.value ? "" : shape.id}"
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
          const uid = createUid();
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
            ${computeTextElement(shape, parsedContent, shape.isBulletTextMode)}
            `;
          break;

        default:
          break;
      }
    });
  } else {
    // no valid selection: remove selection rect
    shapes.value = shapes.value.filter((shape) => shape.id !== group.id);
  }
}

function moveGroup(group) {
  group.content = "";

  const baseX = group.x || 0;
  const baseY = group.y || 0;

  (group.source || []).forEach((shape) => {
    switch (shape.type) {
      case "circle": {
        const cx = baseX + shape.diffX;
        const cy = baseY + shape.diffY;
        group.content += `
          <circle
            id="${shape.id}"
            cx="${cx}"
            cy="${cy}"
            r="${shape.circleRadius ? shape.circleRadius : Number.MIN_VALUE}"
            fill="${shape.isFilled ? shape.color + shape.alpha : "rgba(255,255,255,0.001)"}"
            stroke="${shape.color + shape.alpha}"
            stroke-width="${shape.strokeWidth}"
            style="${shape.isDash ? `stroke-dasharray: ${shape.strokeWidth * 3}` : ""}"
          />
        `;
        break;
      }

      case "rect": {
        const x = baseX + shape.diffX;
        const y = baseY + shape.diffY;
        group.content += `
          <rect
            id="${isResizeMode.value ? "" : shape.id}"
            x="${x}"
            y="${y}"
            fill="${shape.isFilled ? shape.color + shape.alpha : "rgba(255,255,255,0.001)"}"
            height="${shape.rectHeight}"
            width="${shape.rectWidth}"
            stroke="${shape.color + shape.alpha}"
            stroke-width="${shape.strokeWidth}"
            style="rx:1 !important; ry:1 !important; ${shape.isDash ? `stroke-dasharray: ${shape.strokeWidth * 3}` : ""}"
          />
        `;
        break;
      }

      case "arrow": {
        const sx = baseX + shape.diffX;
        const sy = baseY + shape.diffY;
        const ex = baseX + shape.diffEndX;
        const ey = baseY + shape.diffEndY;
        const shapeWidthMax = shape.strokeWidth > 3 ? 5 : 10;
        const shapeWidthMin = shape.strokeWidth > 3 ? 2.5 : 5;
        const uid = `m_${shape.id}_${createUid()}`;
        group.content += `
          <g id="${shape.id}">
            <defs>
              <marker 
                id="${uid}" 
                markerWidth="${shapeWidthMax}" 
                markerHeight="${shapeWidthMax}" 
                refX="0" 
                refY="${shapeWidthMin}" 
                orient="auto">
                <polygon points="0 0,${shapeWidthMax} ${shapeWidthMin}, 0 ${shapeWidthMax}" fill="${shape.color}" />
              </marker>
            </defs>
            <path
              style="stroke-linecap: round !important; ${shape.isDash ? `stroke-dasharray: ${shape.strokeWidth * 3}` : ""}"
              stroke="${shape.color}"
              id="${shape.id}"
              d="M${sx},${sy} ${ex},${ey}"
              stroke-width="${shape.strokeWidth}"
              marker-end="url(#${uid})"
            />
          </g>
        `;
        break;
      }

      case "text": {
        const parsedText = (shape.textContent || "").split("‎");
        const content = parsedText.map((line, i) => `
          ${shape.isBulletTextMode
            ? `<tspan x="${baseX + shape.diffX - shape.fontSize}" y="${baseY + shape.diffY + shape.fontSize * i}" id="${shape.id}" font-size="${shape.fontSize / 2}">⬤</tspan>`
            : ""
          }
          <tspan id="${shape.id}" x="${baseX + shape.diffX}" y="${baseY + shape.diffY + shape.fontSize * i}">
            ${line}
          </tspan>
        `).join("");

        group.content += `
          <g id="${shape.id}">
            <text
              style="user-select:none; height:100px;"
              id="${shape.id}"
              x="${baseX + shape.diffX}"
              y="${baseY + shape.diffY}"
              text-anchor="${shape.textAlign}"
              font-size="${shape.fontSize}"
              fill="${shape.color}"
              font-weight="${shape.isBold ? "bold" : "normal"}"
              font-style="${shape.isItalic ? "italic" : "normal"}"
              text-decoration="${shape.isUnderline ? "underline" : "none"}">
              ${content}
            </text>
          </g>
        `;
        break;
      }

      default:
        break;
    }
  });
}

function onPointerOut(e) {
  if (e.relatedTarget && mainSvg.value && mainSvg.value.contains(e.relatedTarget)) return; // still inside
  preventEdit.value = true;
  hoveredShapeId.value = undefined;
}

function drawDown() {
  isDrawing.value = true;
  if (!activeShape.value && !isSelectMode.value) {
    return;
  }

  if (!isDrawing.value) {
    return;
  }

  isDrawingNewShape.value = true;

  currentPointer.value.start = {
    x: pointerPosition.value.x,
    y: pointerPosition.value.y,
  };
  let id = `${isSelectMode.value ? "group" : activeShape.value}_${createUid()}`;

  switch (true) {
    case activeShape.value === "arrow":
      shapes.value.push({
        id,
        x: pointerPosition.value.x,
        y: pointerPosition.value.y,
        endX: pointerPosition.value.x,
        endY: pointerPosition.value.y,
        type: activeShape.value,
        color: copy(selectedColor.value),
        strokeWidth: copy(Math.abs(strokeSize.value)),
        isDash: copy(isDash.value),
      });
      lastSelectedShape.value = shapes.value.at(-1);
      break;

    case activeShape.value === "circle":
      shapes.value.push({
        alpha: options.value.circle.filled ? colorTransparency.value : "",
        id,
        color: copy(selectedColor.value),
        isFilled: copy(options.value.circle.filled),
        circleRadius: copy(options.value.circle.radius),
        circleStrokeWidth: copy(options.value.circle.strokeWidth),
        type: activeShape.value,
        x: pointerPosition.value.x,
        y: pointerPosition.value.y,
        strokeWidth: copy(Math.abs(strokeSize.value)),
        isDash: copy(isDash.value),
      });
      lastSelectedShape.value = shapes.value.at(-1);
      break;

    case activeShape.value === "line":
      shapes.value.push({
        alpha: copy(colorTransparency.value),
        id,
        x: pointerPosition.value.x,
        y: pointerPosition.value.y,
        type: activeShape.value,
        color: copy(selectedColor.value),
        strokeWidth: copy(Math.abs(strokeSize.value)),
        isDash: copy(isDash.value),
        path: `${pointerPosition.value.x} ${pointerPosition.value.y}`,
      });
      lastSelectedShape.value = shapes.value.at(-1);
      break;

    case activeShape.value === "rect":
      shapes.value.push({
        alpha: options.value.rect.filled ? colorTransparency.value : "",
        id,
        color: copy(selectedColor.value),
        isFilled: copy(options.value.rect.filled),
        rectStrokeWidth: copy(options.value.rect.strokeWidth),
        rectHeight: copy(options.value.rect.height),
        rectWidth: copy(options.value.rect.width),
        type: activeShape.value,
        x: pointerPosition.value.x,
        y: pointerPosition.value.y,
        strokeWidth: copy(Math.abs(strokeSize.value)),
        isDash: copy(isDash.value),
      });
      lastSelectedShape.value = shapes.value.at(-1);
      break;

    case activeShape.value === "group":
      shapes.value.push({
        alpha: 1,
        id: `group_${createUid()}`,
        x: pointerPosition.value.x,
        y: pointerPosition.value.y,
        isFilled: false,
        rectHeight: copy(options.value.rect.height),
        rectWidth: copy(options.value.rect.width),
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

  if (!RAF_ID.value) RAF_ID.value = requestAnimationFrame(TICK_DRAW);
}

function chooseAction(e) {
  if (isDeleteMode.value) {
    isMouseDown.value = false;
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  isMouseDown.value = true;

  // Only capture when we have a real pointer id
  if (e.pointerId != null) {
    try { mainSvg.value?.setPointerCapture?.(e.pointerId); } catch {}
    lastPointerId.value = e.pointerId;
  } else {
    lastPointerId.value = null;
  }

  if (isDrawMode.value || isMoveMode.value || isResizeMode.value || isSelectMode.value) {
    history.value?.begin?.();
  }

  if (isDrawMode.value) {
    drawDown();
    return;
  }

  if (isMoveMode.value) {
    const id = shapeIdUnderPointer(e) || hoveredShapeId.value || lastSelectedShape.value?.id;
    if (id) {
      bringToFrontById(id);
      currentTarget.value = { id };
    }
    initDragOffset(e);
  }
}

function move(shape) {
  if (!shape || !shape.id || shape.type === "line") return;

  if (!dragOffset.value) {
    initDragOffset({ target: { id: shape.id } });
    if (!dragOffset.value) return;
  }

  const { dx, dy, endDx, endDy } = dragOffset.value;
  const px = pointerPosition.value.x;
  const py = pointerPosition.value.y;

  lastSelectedShape.value = shape;

  switch (shape.type) {
    case "arrow":
      shape.x = px - dx;
      shape.y = py - dy;
      shape.endX = px - (endDx ?? dx);
      shape.endY = py - (endDy ?? dy);
      break;

    case "circle":
      shape.x = px - dx;
      shape.y = py - dy;
      break;

    case "rect":
      shape.x = px - dx;
      shape.y = py - dy;
      break;

    case "text":
      shape.x = px - dx;
      shape.y = py - dy;
      break;

    case "group":
      shape.x = px - dx;
      shape.y = py - dy;
      moveGroup(shape);
      break;

    default:
      break;
  }
}

function moveDown() {
  const id = currentTarget.value?.id || hoveredShapeId.value;
  if (!id) return;
  const shape = shapes.value.find(s => s.id === id);
  if (!shape) return;
  move(shape);
}

function resize() {
  isDrawingNewShape.value = false;
  const shapeId = currentTarget.value.id;
  if (!shapeId) {
    return;
  }
  isDrawing.value = true;
  const shape = shapes.value.find((shape) => shape.id === shapeId);
  activeShape.value = shape.type;
  shapes.value = shapes.value.filter((el) => el.id !== shapeId);
  shapes.value.push(shape);
  drawUp(true);
}

function chooseMove(e) {
  if (isDeleteMode.value) return;
  e.preventDefault();
  e.stopPropagation();

  if (e.target.localName !== "svg") currentTarget.value = e.target;

  if (isMoveMode.value && isMouseDown.value) moveDown();
  else if (isResizeMode.value && isMouseDown.value) resize();
}

function clickShape(e) {
  const shapeId = e.target.id;
  switch (true) {
    case isDeleteMode.value:
      history.value?.begin();
      shapes.value = [...shapes.value].filter((shape) => shape.id !== shapeId);
      lastSelectedShape.value = undefined;
      history.value?.end();
      return;

    default:
      lastSelectedShape.value = shapes.value.find((shape) => shape.id === shapeId);
      break;
  }
}

const drawSvgContainer = ref(null);

function walkTheDOM(node, func) {
  func(node);
  node = node.firstChild;
  while (node) {
    walkTheDOM(node, func);
    node = node.nextSibling;
  }
}

function print() {
  isPrinting.value = true;
  isDeleteMode.value = false;
  isMoveMode.value = false;
  isResizeMode.value = false;
  isTextMode.value = false;
  isWriting.value = false;
  isSelectMode.value = false;
  activeShape.value = undefined;
  showCaret.value = false;

  nextTick(async () => {
    const wrapper = drawSvgContainer.value;
    if (!wrapper) return;

    walkTheDOM(wrapper, (node) => {
      if (node && node.nodeType === 1) {
        node.setAttribute("font-family", "Helvetica");
        node.style.fontFamily = "Helvetica";
      }
    });

    try {
      let JsPDF;
      try {
        JsPDF = (await import("jspdf")).default;
      } catch (e) {
        throw new Error("jspdf is not installed. Run npm install jspdf");
      }

      const pngDataUrl = await domToPng({
        container: wrapper,
        scale: 2,
      });

      const image = new Image();
      image.src = pngDataUrl;

      image.onload = () => {
        const a4 = {
          width: 595.28,
          height: 841.89,
        };

        const contentWidth = image.width;
        const contentHeight = image.height;
        const pageHeight = (contentWidth / a4.width) * a4.height;

        const imgWidth = a4.width;
        const imgHeight = (imgWidth / contentWidth) * contentHeight;

        const pdf = new JsPDF("", "pt", "a4");
        let position = 0;
        let leftHeight = contentHeight;

        if (leftHeight < pageHeight) {
          pdf.addImage(pngDataUrl, "PNG", 0, 0, imgWidth, imgHeight, "", "FAST");
        } else {
          while (leftHeight > 0) {
            pdf.addImage(pngDataUrl, "PNG", 0, position, imgWidth, imgHeight, "", "FAST");
            leftHeight -= pageHeight;
            position -= a4.height;
            if (leftHeight > 0) {
              pdf.addPage();
            }
          }
        }

        pdf.save(`${new Date().toLocaleDateString()}_annotations.pdf`);
      };
    } catch (err) {
      console.error("Error generating image:", err);
    } finally {
      isPrinting.value = false;

      walkTheDOM(wrapper, (node) => {
        if (node && node.nodeType === 1) {
          node.setAttribute("font-family", FINAL_CONFIG.value.style.fontFamily);
          node.style.fontFamily = FINAL_CONFIG.value.style.fontFamily;
        }
      });
    }
  });
}

function resetDraw(e) {
  if (!isDeleteMode.value && e) {
    e.preventDefault();
    e.stopPropagation();
  }
  isDrawing.value = false;
  isMouseDown.value = false;
  dragOffset.value = null;

  if (lastPointerId.value != null) {
    try { mainSvg.value?.releasePointerCapture?.(lastPointerId.value); } catch {}
    lastPointerId.value = null;
  }

  if (RAF_ID.value) { 
    cancelAnimationFrame(RAF_ID.value); 
    RAF_ID.value = null; 
  }

  if (isSelectMode.value) groupShapes();
  history.value?.end();
}

function setFillOfSelectedRect() {
  if (!lastSelectedShape.value || !lastSelectedShape.value.id.includes("rect")) {
    return;
  }
  lastSelectedShape.value.isFilled = !lastSelectedShape.value.isFilled;
}

function setFillOfSelectedCircle() {
  if (!lastSelectedShape.value || !lastSelectedShape.value.id.includes("circle")) {
    return;
  }
  lastSelectedShape.value.isFilled = !lastSelectedShape.value.isFilled;
}

function setColorOfSelectedShape() {
  if (!lastSelectedShape.value) {
    return;
  }

  lastSelectedShape.value.color = copy(selectedColor.value);

  if (["arrow", "text"].includes(lastSelectedShape.value.id)) {
    return;
  }

  lastSelectedShape.value.alpha = copy(colorTransparency.value);
}

function setSelectedShapeToDash() {
  if (!lastSelectedShape.value || lastSelectedShape.value.type === "text") {
    return;
  }
  lastSelectedShape.value.isDash = copy(isDash.value);
}

function setTransparencyOfSelectedShape() {
  if (
    !lastSelectedShape.value ||
    ["arrow", "text"].includes(lastSelectedShape.value.id)
  ) {
    return;
  }
  lastSelectedShape.value.alpha = copy(colorTransparency.value);
}

function setStrokeWidthOfSelectedShape() {
  if (
    !lastSelectedShape.value ||
    !["arrow", "circle", "rect", "line"].includes(lastSelectedShape.value.type)
  ) {
    return;
  }
  lastSelectedShape.value.strokeWidth = copy(Math.abs(strokeSize.value));
}

function setCurrentStyleOfSelectedText() {
  if (!lastSelectedShape.value || lastSelectedShape.value.type !== "text") {
    return;
  }
  lastSelectedShape.value.isBold = copy(isBold.value);
  lastSelectedShape.value.isItalic = copy(isItalic.value);
  lastSelectedShape.value.isUnderline = copy(isUnderline.value);
  lastSelectedShape.value.fontSize = copy(textFont.value);
  lastSelectedShape.value.isBulletTextMode = copy(isBulletTextMode.value);
}

function setPointer(e) {
  e.preventDefault();
  if (!mainSvg.value) return;
  const rect = mainSvg.value.getBoundingClientRect();
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

  pointerPosition.value.x = ((clientX - rect.left) / rect.width) * svgWidth.value;
  pointerPosition.value.y = ((clientY - rect.top) / rect.height) * svgHeight.value;
}

function setShapeTo(shape) {
  showCaret.value = false;
  deleteEmptyTextElement();
  if (shape === activeShape.value) {
    activeShape.value = undefined;
    isDrawMode.value = false;

    return;
  }
  isDrawMode.value = true;
  isDeleteMode.value = false;
  isMoveMode.value = false;
  isResizeMode.value = false;
  isTextMode.value = false;
  activeShape.value = shape;
}

function toggleSummary() {
  isSummaryOpen.value = !isSummaryOpen.value;
  if (!isSummaryOpen.value) {
    isMoveMode.value = false;
    isResizeMode.value = false;
    isTextMode.value = false;
    isWriting.value = false;
    activeShape.value = undefined;
    showCaret.value = false;
    isDeleteMode.value = false;
    isWriting.value = false;
  }
  emit("toggleOpenState", { isOpen: isSummaryOpen.value });
}

function save() {
    emit("saveAnnotations", {
        shapes: shapes.value,
        lastSelectedShape: lastSelectedShape.value
    })
}

let UNREGISTER_SHORTCUTS = null;

onMounted(() => {
  if (drawSvgContainer.value) {
    let foundSvg = false;

    walkTheDOM(drawSvgContainer.value, (node) => {
      if (!foundSvg) {
        if (["DIV", "svg", "section", "canvas"].includes(node.tagName)) {
          slottedSvg.value = node;
          foundSvg = true;
          return;
        }
      }
    });
  }

  isMacLike.value = (() => {
      if (typeof navigator === "undefined") return false;
      const uaDataPlatform = navigator.userAgentData?.platform ?? "";
      if (uaDataPlatform) return /mac|ios/i.test(uaDataPlatform);
      const ua = navigator.userAgent ?? "";
      return /(Mac|iPhone|iPad|iPod)/i.test(ua);
  })();

  const slottedSvgRect = slottedSvg?.value.getBoundingClientRect();

  sizeRatio.value = slottedSvgRect.height / slottedSvgRect.width;

  svgWidth.value = 1000;
  svgHeight.value = sizeRatio.value * 1000;
  sourceWidth.value = slottedSvgRect.width;
  sourceHeight.value = slottedSvgRect.height;

  const myObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      sourceWidth.value = entry.contentRect.width;
      sourceHeight.value = entry.contentRect.height;
      sizeRatio.value = entry.contentRect.height / entry.contentRect.width;
      svgHeight.value = sizeRatio.value * 1000;
    });
  });

  myObserver.observe(slottedSvg.value);

  ONKEYDOWN.value = (e) => write(e);
  window.addEventListener("keydown", ONKEYDOWN.value);
  history.value = makeHistory();

  if (history.value.size) {
    const s = history.value.size();
    HISTORY_SIZE.value.undo = s.undo;
    HISTORY_SIZE.value.redo = s.redo;
  }

  UNREGISTER_SHORTCUTS = registerAnnotatorShortcuts({
    isMacLike,
    isSummaryOpen,
    isWriting,
    isDeleteMode,
    isMoveMode,
    isResizeMode,
    isSelectMode,
    isDrawMode,
    isTextMode,
    activeShape,
    showCaret,
    lastSelectedShape,
    shapes,
    history,
    setShapeTo,
    undoLastShape,
    redoLastShape,
  });
});

onBeforeUnmount(() => {
  hideTooltip();
  if (RAF_ID.value) cancelAnimationFrame(RAF_ID.value);
  if (ONKEYDOWN.value) window.removeEventListener("keydown", ONKEYDOWN.value);
  UNREGISTER_SHORTCUTS && UNREGISTER_SHORTCUTS();
  window.removeEventListener("keydown", write);
})

watch(shapes, (newVal) => {
  if (newVal.length === 0) {
    lastSelectedShape.value = undefined;
  }
});

watch(isTextMode, (bool) => {
  showCaret.value = bool;
});
</script>

<style lang="scss" scoped>
.vue-ui-annotator summary {
  text-align: center;
}

.annotator__wrapper {
  position: relative;
  isolation: isolate;
}

.vue-ui-annotator button.button-tool {
  align-items: center;
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
  font-size: 12px;
}
.vue-ui-annotator text {
  user-select: none;
}
.vue-ui-annotator summary {
  user-select: none;
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

kbd {
    background: radial-gradient(at top left, #AAAAAA, #DDDDDD);
    border: 1px solid #808080;
    border-right: 4px solid #606060;
    border-bottom: 4px solid #606060;
    border-radius: 7px;
    color: #000000;
    font-size: 13px;
    font-weight: bold;
    margin: 0;
    margin-left: 3px;
    padding: 1px 3px;
    min-width: 1.5em;
    text-align: center;
    display: inline-block;
    box-shadow: 0 6px 12px -6px black;
}
</style>

<style>
path.vue-ui-annotator-caret {
  animation: caret 1s step-end infinite;
}

@keyframes caret {
  0%, 50% {
    opacity: 1;
  }
  50.01%, 100% {
    opacity: 0;
  }
}

[data-annotator-content] {
  transform: translateZ(0);
  will-change: transform;
  contain: paint;
}

.annotator__content-layer {
  position: relative;
  z-index: 0;
  contain: paint;
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: transform;
}

/* Overlay above, also on its own layer */
.annotator__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  transform: translateZ(0);
  backface-visibility: hidden;
  contain: paint;
}
</style>