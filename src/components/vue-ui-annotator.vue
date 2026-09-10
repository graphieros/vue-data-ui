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
                        padding: '6px',
                    },
                    body: {
                        backgroundColor: FINAL_CONFIG.style.backgroundColor,
                        color: FINAL_CONFIG.style.color,
                    },
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
                                background: isMoveMode
                                    ? FINAL_CONFIG.style.buttons.controls
                                          .selected.backgroundColor
                                    : FINAL_CONFIG.style.buttons.controls
                                          .backgroundColor,
                                border: isMoveMode
                                    ? FINAL_CONFIG.style.buttons.controls
                                          .selected.border
                                    : FINAL_CONFIG.style.buttons.controls
                                          .border,
                                color: isMoveMode
                                    ? FINAL_CONFIG.style.buttons.controls
                                          .selected.color
                                    : FINAL_CONFIG.style.buttons.controls.color,
                                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                cursor: isCursorPointer ? 'pointer' : 'default',
                            }"
                            :class="{
                                'button-tool': true,
                                'button-tool--selected': isMoveMode,
                                tooltip: true,
                            }"
                            @click="
                                deleteEmptyTextElement();
                                isMoveMode = !isMoveMode;
                                isDeleteMode = false;
                                isDrawMode = false;
                                isResizeMode = false;
                                isSelectMode = false;
                                isTextMode = false;
                                isWriting = false;
                                showCaret = false;
                            "
                            @mouseenter="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('move', $event, 'top')
                            "
                            @mouseleave="hideTooltip"
                            @focus="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('move', $event, 'top')
                            "
                            @blur="hideTooltip"
                        >
                            <BaseIcon
                                name="move"
                                :stroke="
                                    isMoveMode
                                        ? FINAL_CONFIG.style.buttons.controls
                                              .selected.color
                                        : FINAL_CONFIG.style.buttons.controls
                                              .color
                                "
                            />

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
                            :disabled="shapes.length === 0"
                            :style="{
                                background: isResizeMode
                                    ? FINAL_CONFIG.style.buttons.controls
                                          .selected.backgroundColor
                                    : FINAL_CONFIG.style.buttons.controls
                                          .backgroundColor,
                                border: isResizeMode
                                    ? FINAL_CONFIG.style.buttons.controls
                                          .selected.border
                                    : FINAL_CONFIG.style.buttons.controls
                                          .border,
                                color: isResizeMode
                                    ? FINAL_CONFIG.style.buttons.controls
                                          .selected.color
                                    : FINAL_CONFIG.style.buttons.controls.color,
                                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                cursor: isCursorPointer ? 'pointer' : 'default',
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
                            @mouseenter="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('resize', $event, 'top')
                            "
                            @mouseleave="hideTooltip"
                            @focus="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('resize', $event, 'top')
                            "
                            @blur="hideTooltip"
                        >
                            <BaseIcon
                                name="resize"
                                :stroke="
                                    isResizeMode
                                        ? FINAL_CONFIG.style.buttons.controls
                                              .selected.color
                                        : FINAL_CONFIG.style.buttons.controls
                                              .color
                                "
                            />

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
                                background: isDeleteMode
                                    ? FINAL_CONFIG.style.buttons.controls
                                          .selected.backgroundColor
                                    : FINAL_CONFIG.style.buttons.controls
                                          .backgroundColor,
                                border: isDeleteMode
                                    ? FINAL_CONFIG.style.buttons.controls
                                          .selected.border
                                    : FINAL_CONFIG.style.buttons.controls
                                          .border,
                                color: isDeleteMode
                                    ? FINAL_CONFIG.style.buttons.controls
                                          .selected.color
                                    : FINAL_CONFIG.style.buttons.controls.color,
                                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                cursor: isCursorPointer ? 'pointer' : 'default',
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
                            @mouseenter="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('delete', $event, 'top')
                            "
                            @mouseleave="hideTooltip"
                            @focus="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('delete', $event, 'top')
                            "
                            @blur="hideTooltip"
                        >
                            <BaseIcon
                                name="trash"
                                :stroke="
                                    isDeleteMode
                                        ? FINAL_CONFIG.style.buttons.controls
                                              .selected.color
                                        : FINAL_CONFIG.style.buttons.controls
                                              .color
                                "
                            />

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
                                background: isSelectMode
                                    ? FINAL_CONFIG.style.buttons.controls
                                          .selected.backgroundColor
                                    : FINAL_CONFIG.style.buttons.controls
                                          .backgroundColor,
                                border: isSelectMode
                                    ? FINAL_CONFIG.style.buttons.controls
                                          .selected.border
                                    : FINAL_CONFIG.style.buttons.controls
                                          .border,
                                color: isSelectMode
                                    ? FINAL_CONFIG.style.buttons.controls
                                          .selected.color
                                    : FINAL_CONFIG.style.buttons.controls.color,
                                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                cursor: isCursorPointer ? 'pointer' : 'default',
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
                            @mouseenter="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('selectAndGroup', $event, 'top')
                            "
                            @mouseleave="hideTooltip"
                            @focus="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('selectAndGroup', $event, 'top')
                            "
                            @blur="hideTooltip"
                        >
                            <BaseIcon
                                name="selectAndGroup"
                                :stroke="
                                    isSelectMode
                                        ? FINAL_CONFIG.style.buttons.controls
                                              .selected.color
                                        : FINAL_CONFIG.style.buttons.controls
                                              .color
                                "
                            />

                            <TeleportedTooltip
                                v-if="FINAL_CONFIG.style.showTooltips"
                                :show="
                                    showTooltip &&
                                    tooltipKey === 'selectAndGroup'
                                "
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
                                background:
                                    FINAL_CONFIG.style.buttons.controls
                                        .backgroundColor,
                                border: FINAL_CONFIG.style.buttons.controls
                                    .border,
                                color: FINAL_CONFIG.style.buttons.controls
                                    .color,
                                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                cursor: isCursorPointer ? 'pointer' : 'default',
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
                            @mouseenter="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('bringToFront', $event, 'top')
                            "
                            @mouseleave="hideTooltip"
                            @focus="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('bringToFront', $event, 'top')
                            "
                            @blur="hideTooltip"
                        >
                            <BaseIcon
                                name="bringToFront"
                                :stroke="
                                    FINAL_CONFIG.style.buttons.controls.color
                                "
                            />

                            <TeleportedTooltip
                                v-if="FINAL_CONFIG.style.showTooltips"
                                :show="
                                    showTooltip && tooltipKey === 'bringToFront'
                                "
                                :x="tooltipPos.x"
                                :y="tooltipPos.y - 6"
                                :placement="'top'"
                                :styleObject="tooltipStyleObject"
                            >
                                {{
                                    FINAL_CONFIG.translations
                                        .tooltipBringToFront
                                }}
                            </TeleportedTooltip>
                        </button>

                        <!-- SEND SHAPE TO BACK -->
                        <button
                            :disabled="shapes.length === 0"
                            :style="{
                                background:
                                    FINAL_CONFIG.style.buttons.controls
                                        .backgroundColor,
                                border: FINAL_CONFIG.style.buttons.controls
                                    .border,
                                color: FINAL_CONFIG.style.buttons.controls
                                    .color,
                                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                cursor: isCursorPointer ? 'pointer' : 'default',
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
                            @mouseenter="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('bringToBack', $event, 'top')
                            "
                            @mouseleave="hideTooltip"
                            @focus="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('bringToBack', $event, 'top')
                            "
                            @blur="hideTooltip"
                        >
                            <BaseIcon
                                name="bringToBack"
                                :stroke="
                                    FINAL_CONFIG.style.buttons.controls.color
                                "
                            />

                            <TeleportedTooltip
                                v-if="FINAL_CONFIG.style.showTooltips"
                                :show="
                                    showTooltip && tooltipKey === 'bringToBack'
                                "
                                :x="tooltipPos.x"
                                :y="tooltipPos.y - 6"
                                :placement="'top'"
                                :styleObject="tooltipStyleObject"
                            >
                                {{
                                    FINAL_CONFIG.translations.tooltipBringToBack
                                }}
                            </TeleportedTooltip>
                        </button>

                        <!-- COPY PASTE LAST SELECTED SHAPE -->
                        <button
                            :disabled="
                                shapes.length === 0 || activeShape === 'line'
                            "
                            :style="{
                                background:
                                    FINAL_CONFIG.style.buttons.controls
                                        .backgroundColor,
                                border: FINAL_CONFIG.style.buttons.controls
                                    .border,
                                color: FINAL_CONFIG.style.buttons.controls
                                    .color,
                                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                cursor: isCursorPointer ? 'pointer' : 'default',
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
                            @mouseenter="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('duplicate', $event, 'top')
                            "
                            @mouseleave="hideTooltip"
                            @focus="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('duplicate', $event, 'top')
                            "
                            @blur="hideTooltip"
                        >
                            <BaseIcon
                                name="copy"
                                :stroke="
                                    FINAL_CONFIG.style.buttons.controls.color
                                "
                                :size="18"
                            />

                            <TeleportedTooltip
                                v-if="FINAL_CONFIG.style.showTooltips"
                                :show="
                                    showTooltip && tooltipKey === 'duplicate'
                                "
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
                                background:
                                    FINAL_CONFIG.style.buttons.controls
                                        .backgroundColor,
                                border: FINAL_CONFIG.style.buttons.controls
                                    .border,
                                color: FINAL_CONFIG.style.buttons.controls
                                    .color,
                                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                cursor: isCursorPointer ? 'pointer' : 'default',
                            }"
                            :class="{
                                'button-tool': true,
                                'button-tool--one-shot': true,
                                tooltip: true,
                            }"
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
                            @mouseenter="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('undoLast', $event, 'top')
                            "
                            @mouseleave="hideTooltip"
                            @focus="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('undoLast', $event, 'top')
                            "
                            @blur="hideTooltip"
                        >
                            <BaseIcon
                                name="refresh"
                                :stroke="
                                    FINAL_CONFIG.style.buttons.controls.color
                                "
                                :size="20"
                            />

                            <TeleportedTooltip
                                v-if="FINAL_CONFIG.style.showTooltips"
                                :show="showTooltip && tooltipKey === 'undoLast'"
                                :x="tooltipPos.x"
                                :y="tooltipPos.y - 6"
                                :placement="'top'"
                                :styleObject="tooltipStyleObject"
                            >
                                {{ FINAL_CONFIG.translations.tooltipUndo }}
                                <kbd>{{ isMacLike ? '⌘' : 'Ctrl' }}</kbd
                                ><kbd>Z</kbd>
                            </TeleportedTooltip>
                        </button>

                        <!-- REDO LAST SHAPE -->
                        <button
                            data-cy="annotator-button-redo"
                            :disabled="HISTORY_SIZE.redo === 0"
                            :style="{
                                background:
                                    FINAL_CONFIG.style.buttons.controls
                                        .backgroundColor,
                                border: FINAL_CONFIG.style.buttons.controls
                                    .border,
                                color: FINAL_CONFIG.style.buttons.controls
                                    .color,
                                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                cursor: isCursorPointer ? 'pointer' : 'default',
                            }"
                            :class="{
                                'button-tool': true,
                                'button-tool--one-shot': true,
                                tooltip: true,
                            }"
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
                            @mouseenter="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('redoLast', $event, 'top')
                            "
                            @mouseleave="hideTooltip"
                            @focus="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('redoLast', $event, 'top')
                            "
                            @blur="hideTooltip"
                        >
                            <BaseIcon
                                name="refresh"
                                :stroke="
                                    FINAL_CONFIG.style.buttons.controls.color
                                "
                                :size="20"
                                :style="{
                                    transform: 'rotateX(0deg) rotateY(180deg)',
                                }"
                            />

                            <TeleportedTooltip
                                v-if="FINAL_CONFIG.style.showTooltips"
                                :show="showTooltip && tooltipKey === 'redoLast'"
                                :x="tooltipPos.x"
                                :y="tooltipPos.y - 6"
                                :placement="'top'"
                                :styleObject="tooltipStyleObject"
                            >
                                {{ FINAL_CONFIG.translations.tooltipRedo }}
                                <kbd>{{ isMacLike ? '⌘' : 'Ctrl' }}</kbd
                                ><kbd>Y</kbd>
                            </TeleportedTooltip>
                        </button>

                        <!-- PRINT -->
                        <button
                            v-if="FINAL_CONFIG.style.showPrint"
                            :style="{
                                background:
                                    FINAL_CONFIG.style.buttons.controls
                                        .backgroundColor,
                                border: FINAL_CONFIG.style.buttons.controls
                                    .border,
                                color: FINAL_CONFIG.style.buttons.controls
                                    .color,
                                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                cursor: isCursorPointer ? 'pointer' : 'default',
                            }"
                            :class="{ 'button-tool': true, tooltip: true }"
                            @click="print"
                            @mouseenter="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('printPdf', $event, 'top')
                            "
                            @mouseleave="hideTooltip"
                            @focus="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('printPdf', $event, 'top')
                            "
                            @blur="hideTooltip"
                        >
                            <BaseIcon
                                name="printer"
                                :stroke="
                                    FINAL_CONFIG.style.buttons.controls.color
                                "
                            />

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
                                background:
                                    FINAL_CONFIG.style.buttons.controls
                                        .backgroundColor,
                                border: FINAL_CONFIG.style.buttons.controls
                                    .border,
                                color: FINAL_CONFIG.style.buttons.controls
                                    .color,
                                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                cursor: isCursorPointer ? 'pointer' : 'default',
                            }"
                            :class="{ 'button-tool': true, tooltip: true }"
                            @click="generateImage"
                            @mouseenter="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('printImage', $event, 'top')
                            "
                            @mouseleave="hideTooltip"
                            @focus="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('printImage', $event, 'top')
                            "
                            @blur="hideTooltip"
                        >
                            <BaseIcon
                                name="image"
                                :stroke="
                                    FINAL_CONFIG.style.buttons.controls.color
                                "
                                :size="20"
                            />

                            <TeleportedTooltip
                                v-if="FINAL_CONFIG.style.showTooltips"
                                :show="
                                    showTooltip && tooltipKey === 'printImage'
                                "
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
                            v-if="FINAL_CONFIG.style.showSave"
                            :style="{
                                background:
                                    FINAL_CONFIG.style.buttons.controls
                                        .backgroundColor,
                                border: FINAL_CONFIG.style.buttons.controls
                                    .border,
                                color: FINAL_CONFIG.style.buttons.controls
                                    .color,
                                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                cursor: isCursorPointer ? 'pointer' : 'default',
                            }"
                            :class="{ 'button-tool': true, tooltip: true }"
                            @click="save"
                            @mouseenter="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('saveAction', $event, 'top')
                            "
                            @mouseleave="hideTooltip"
                            @focus="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('saveAction', $event, 'top')
                            "
                            @blur="hideTooltip"
                        >
                            <BaseIcon
                                name="save"
                                :stroke="
                                    FINAL_CONFIG.style.buttons.controls.color
                                "
                            />

                            <TeleportedTooltip
                                v-if="FINAL_CONFIG.style.showTooltips"
                                :show="
                                    showTooltip && tooltipKey === 'saveAction'
                                "
                                :x="tooltipPos.x"
                                :y="tooltipPos.y - 6"
                                :placement="'top'"
                                :styleObject="tooltipStyleObject"
                            >
                                {{ FINAL_CONFIG.translations.tooltipSave }}
                            </TeleportedTooltip>
                        </button>
                    </div>

                    <div class="tool-selection" style="margin-top: 6px">
                        <!-- SET SHAPE TO CIRCLE -->
                        <button
                            data-cy="annotator-button-circle"
                            :class="{
                                'button-tool': true,
                                'button-tool--selected':
                                    activeShape === 'circle',
                                tooltip: true,
                            }"
                            :style="{
                                background:
                                    activeShape === 'circle'
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.backgroundColor
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .backgroundColor,
                                border:
                                    activeShape === 'circle'
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.border
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .border,
                                color:
                                    activeShape === 'circle'
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.color
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .color,
                                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                cursor: isCursorPointer ? 'pointer' : 'default',
                            }"
                            @click="
                                setShapeTo('circle');
                                isSelectMode = false;
                            "
                            @mouseenter="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('setCircle', $event, 'top')
                            "
                            @mouseleave="hideTooltip"
                            @focus="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('setCircle', $event, 'top')
                            "
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
                                                ? selectedColor +
                                                  colorTransparency
                                                : selectedColor +
                                                  colorTransparency
                                            : 'none'
                                    "
                                    stroke="currentColor"
                                ></circle>
                            </svg>

                            <TeleportedTooltip
                                v-if="FINAL_CONFIG.style.showTooltips"
                                :show="
                                    showTooltip && tooltipKey === 'setCircle'
                                "
                                :x="tooltipPos.x"
                                :y="tooltipPos.y - 6"
                                :placement="'top'"
                                :styleObject="tooltipStyleObject"
                            >
                                {{
                                    FINAL_CONFIG.translations.tooltipShapeCircle
                                }}
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
                                        accentColor:
                                            FINAL_CONFIG.style.color +
                                            ' !important',
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
                                tooltip: true,
                            }"
                            :style="{
                                background:
                                    activeShape === 'rect'
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.backgroundColor
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .backgroundColor,
                                border:
                                    activeShape === 'rect'
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.border
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .border,
                                color:
                                    activeShape === 'rect'
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.color
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .color,
                                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                cursor: isCursorPointer ? 'pointer' : 'default',
                            }"
                            @click="
                                setShapeTo('rect');
                                isSelectMode = false;
                            "
                            @mouseenter="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('setRect', $event, 'top')
                            "
                            @mouseleave="hideTooltip"
                            @focus="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('setRect', $event, 'top')
                            "
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
                                                ? selectedColor +
                                                  colorTransparency
                                                : selectedColor +
                                                  colorTransparency
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
                                        accentColor:
                                            FINAL_CONFIG.style.color +
                                            ' !important',
                                    }"
                                />
                            </label>
                        </div>

                        <!-- SET SHAPE TO ARROW -->
                        <button
                            data-cy="annotator-button-arrow"
                            :class="{
                                'button-tool': true,
                                'button-tool--selected':
                                    activeShape === 'arrow',
                                tooltip: true,
                            }"
                            :style="{
                                background:
                                    activeShape === 'arrow'
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.backgroundColor
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .backgroundColor,
                                border:
                                    activeShape === 'arrow'
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.border
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .border,
                                color:
                                    activeShape === 'arrow'
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.color
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .color,
                                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                cursor: isCursorPointer ? 'pointer' : 'default',
                            }"
                            @click="
                                setShapeTo('arrow');
                                isSelectMode = false;
                            "
                            @mouseenter="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('setArrow', $event, 'top')
                            "
                            @mouseleave="hideTooltip"
                            @focus="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('setArrow', $event, 'top')
                            "
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
                                {{
                                    FINAL_CONFIG.translations.tooltipShapeArrow
                                }}
                                <kbd>A</kbd>
                            </TeleportedTooltip>
                        </button>

                        <!-- SET SHAPE TO FREEHAND LINE -->
                        <button
                            data-cy="annotator-button-freehand"
                            :class="{
                                'button-tool': true,
                                'button-tool--selected': activeShape === 'line',
                                tooltip: true,
                            }"
                            :style="{
                                background:
                                    activeShape === 'line'
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.backgroundColor
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .backgroundColor,
                                border:
                                    activeShape === 'line'
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.border
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .border,
                                color:
                                    activeShape === 'line'
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.color
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .color,
                                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                cursor: isCursorPointer ? 'pointer' : 'default',
                            }"
                            @click="
                                setShapeTo('line');
                                isSelectMode = false;
                            "
                            @mouseenter="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('setFreehand', $event, 'top')
                            "
                            @mouseleave="hideTooltip"
                            @focus="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('setFreehand', $event, 'top')
                            "
                            @blur="hideTooltip"
                        >
                            <svg
                                width="80%"
                                viewBox="0 0 24 24"
                                stroke-width="2"
                                stroke="currentColor"
                                fill="none"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            >
                                <path
                                    stroke="none"
                                    d="M0 0h24v24H0z"
                                    fill="none"
                                />
                                <path
                                    d="M3 15c2 3 4 4 7 4s7 -3 7 -7s-3 -7 -6 -7s-5 1.5 -5 4s2 5 6 5s8.408 -2.453 10 -5"
                                />
                            </svg>

                            <TeleportedTooltip
                                v-if="FINAL_CONFIG.style.showTooltips"
                                :show="
                                    showTooltip && tooltipKey === 'setFreehand'
                                "
                                :x="tooltipPos.x"
                                :y="tooltipPos.y - 6"
                                :placement="'top'"
                                :styleObject="tooltipStyleObject"
                            >
                                {{
                                    FINAL_CONFIG.translations
                                        .tooltipShapeFreehand
                                }}
                                <kbd>L</kbd>
                            </TeleportedTooltip>
                        </button>

                        <!-- SET STROKE WIDTH -->
                        <div
                            v-if="
                                ['arrow', 'circle', 'rect', 'line'].includes(
                                    activeShape,
                                )
                            "
                        >
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
                                    />
                                </label>
                            </div>
                        </div>

                        <!-- SET BORDER DASHARRAY -->
                        <div
                            v-if="
                                ['arrow', 'circle', 'rect'].includes(
                                    activeShape,
                                )
                            "
                        >
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
                                            accentColor:
                                                FINAL_CONFIG.style.color +
                                                ' !important',
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
                                tooltip: true,
                            }"
                            :style="{
                                background: isTextMode
                                    ? FINAL_CONFIG.style.buttons.shapes.selected
                                          .backgroundColor
                                    : FINAL_CONFIG.style.buttons.shapes
                                          .backgroundColor,
                                border: isTextMode
                                    ? FINAL_CONFIG.style.buttons.shapes.selected
                                          .border
                                    : FINAL_CONFIG.style.buttons.shapes.border,
                                color: isTextMode
                                    ? FINAL_CONFIG.style.buttons.shapes.selected
                                          .color
                                    : FINAL_CONFIG.style.buttons.shapes.color,
                                borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                cursor: isCursorPointer ? 'pointer' : 'default',
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
                            @mouseenter="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('setText', $event, 'top')
                            "
                            @mouseleave="hideTooltip"
                            @focus="
                                FINAL_CONFIG.style.showTooltips &&
                                showToolTipFor('setText', $event, 'top')
                            "
                            @blur="hideTooltip"
                        >
                            <BaseIcon
                                name="text"
                                :stroke="
                                    isTextMode
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.color
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .color
                                "
                            />

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
                                    'button-tool--selected':
                                        textAlign === 'start',
                                    tooltip: true,
                                }"
                                :style="{
                                    background:
                                        textAlign === 'start'
                                            ? FINAL_CONFIG.style.buttons.shapes
                                                  .selected.backgroundColor
                                            : FINAL_CONFIG.style.buttons.shapes
                                                  .backgroundColor,
                                    border:
                                        textAlign === 'start'
                                            ? FINAL_CONFIG.style.buttons.shapes
                                                  .selected.border
                                            : FINAL_CONFIG.style.buttons.shapes
                                                  .border,
                                    color:
                                        textAlign === 'start'
                                            ? FINAL_CONFIG.style.buttons.shapes
                                                  .selected.color
                                            : FINAL_CONFIG.style.buttons.shapes
                                                  .color,
                                    borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                    cursor: isCursorPointer
                                        ? 'pointer'
                                        : 'default',
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
                                @mouseenter="
                                    FINAL_CONFIG.style.showTooltips &&
                                    showToolTipFor(
                                        'setAlignStart',
                                        $event,
                                        'top',
                                    )
                                "
                                @mouseleave="hideTooltip"
                                @focus="
                                    FINAL_CONFIG.style.showTooltips &&
                                    showToolTipFor(
                                        'setAlignStart',
                                        $event,
                                        'top',
                                    )
                                "
                                @blur="hideTooltip"
                            >
                                <svg
                                    width="80%"
                                    viewBox="0 0 24 24"
                                    stroke-width="2"
                                    stroke="currentColor"
                                    fill="none"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path
                                        stroke="none"
                                        d="M0 0h24v24H0z"
                                        fill="none"
                                    />
                                    <path d="M4 6l16 0" />
                                    <path d="M4 12l10 0" />
                                    <path d="M4 18l14 0" />
                                </svg>

                                <TeleportedTooltip
                                    v-if="FINAL_CONFIG.style.showTooltips"
                                    :show="
                                        showTooltip &&
                                        tooltipKey === 'setAlignStart'
                                    "
                                    :x="tooltipPos.x"
                                    :y="tooltipPos.y - 6"
                                    :placement="'top'"
                                    :styleObject="tooltipStyleObject"
                                >
                                    {{
                                        FINAL_CONFIG.translations
                                            .tooltipShapeTextLeft
                                    }}
                                </TeleportedTooltip>
                            </button>
                        </div>

                        <!-- TEXT SET ALIGN MIDDLE -->
                        <div v-if="isTextMode">
                            <button
                                :class="{
                                    'button-tool': true,
                                    'button-tool--selected':
                                        textAlign === 'middle',
                                    tooltip: true,
                                }"
                                :style="{
                                    background:
                                        textAlign === 'middle'
                                            ? FINAL_CONFIG.style.buttons.shapes
                                                  .selected.backgroundColor
                                            : FINAL_CONFIG.style.buttons.shapes
                                                  .backgroundColor,
                                    border:
                                        textAlign === 'middle'
                                            ? FINAL_CONFIG.style.buttons.shapes
                                                  .selected.border
                                            : FINAL_CONFIG.style.buttons.shapes
                                                  .border,
                                    color:
                                        textAlign === 'middle'
                                            ? FINAL_CONFIG.style.buttons.shapes
                                                  .selected.color
                                            : FINAL_CONFIG.style.buttons.shapes
                                                  .color,
                                    borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                    cursor: isCursorPointer
                                        ? 'pointer'
                                        : 'default',
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
                                @mouseenter="
                                    FINAL_CONFIG.style.showTooltips &&
                                    showToolTipFor(
                                        'setAlignMiddle',
                                        $event,
                                        'top',
                                    )
                                "
                                @mouseleave="hideTooltip"
                                @focus="
                                    FINAL_CONFIG.style.showTooltips &&
                                    showToolTipFor(
                                        'setAlignMiddle',
                                        $event,
                                        'top',
                                    )
                                "
                                @blur="hideTooltip"
                            >
                                <svg
                                    width="80%"
                                    viewBox="0 0 24 24"
                                    stroke-width="2"
                                    stroke="currentColor"
                                    fill="none"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path
                                        stroke="none"
                                        d="M0 0h24v24H0z"
                                        fill="none"
                                    />
                                    <path d="M4 6l16 0" />
                                    <path d="M8 12l8 0" />
                                    <path d="M6 18l12 0" />
                                </svg>

                                <TeleportedTooltip
                                    v-if="FINAL_CONFIG.style.showTooltips"
                                    :show="
                                        showTooltip &&
                                        tooltipKey === 'setAlignMiddle'
                                    "
                                    :x="tooltipPos.x"
                                    :y="tooltipPos.y - 6"
                                    :placement="'top'"
                                    :styleObject="tooltipStyleObject"
                                >
                                    {{
                                        FINAL_CONFIG.translations
                                            .tooltipShapeTextCenter
                                    }}
                                </TeleportedTooltip>
                            </button>
                        </div>

                        <!-- TEXT SET ALIGN END -->
                        <div v-if="isTextMode">
                            <button
                                :class="{
                                    'button-tool': true,
                                    'button-tool--selected':
                                        textAlign === 'end',
                                    tooltip: true,
                                }"
                                :style="{
                                    background:
                                        textAlign === 'end'
                                            ? FINAL_CONFIG.style.buttons.shapes
                                                  .selected.backgroundColor
                                            : FINAL_CONFIG.style.buttons.shapes
                                                  .backgroundColor,
                                    border:
                                        textAlign === 'end'
                                            ? FINAL_CONFIG.style.buttons.shapes
                                                  .selected.border
                                            : FINAL_CONFIG.style.buttons.shapes
                                                  .border,
                                    color:
                                        textAlign === 'end'
                                            ? FINAL_CONFIG.style.buttons.shapes
                                                  .selected.color
                                            : FINAL_CONFIG.style.buttons.shapes
                                                  .color,
                                    borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                    cursor: isCursorPointer
                                        ? 'pointer'
                                        : 'default',
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
                                @mouseenter="
                                    FINAL_CONFIG.style.showTooltips &&
                                    showToolTipFor('setAlignEnd', $event, 'top')
                                "
                                @mouseleave="hideTooltip"
                                @focus="
                                    FINAL_CONFIG.style.showTooltips &&
                                    showToolTipFor('setAlignEnd', $event, 'top')
                                "
                                @blur="hideTooltip"
                            >
                                <svg
                                    width="80%"
                                    viewBox="0 0 24 24"
                                    stroke-width="2"
                                    stroke="currentColor"
                                    fill="none"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path
                                        stroke="none"
                                        d="M0 0h24v24H0z"
                                        fill="none"
                                    />
                                    <path d="M4 6l16 0" />
                                    <path d="M10 12l10 0" />
                                    <path d="M6 18l14 0" />
                                </svg>

                                <TeleportedTooltip
                                    v-if="FINAL_CONFIG.style.showTooltips"
                                    :show="
                                        showTooltip &&
                                        tooltipKey === 'setAlignEnd'
                                    "
                                    :x="tooltipPos.x"
                                    :y="tooltipPos.y - 6"
                                    :placement="'top'"
                                    :styleObject="tooltipStyleObject"
                                >
                                    {{
                                        FINAL_CONFIG.translations
                                            .tooltipShapeTextRight
                                    }}
                                </TeleportedTooltip>
                            </button>
                        </div>

                        <!-- TEXT SET BULLET POINTS MODE -->
                        <div v-if="isTextMode">
                            <button
                                :class="{
                                    'button-tool': true,
                                    'button-tool--selected': isBulletTextMode,
                                    tooltip: true,
                                }"
                                :style="{
                                    background: isBulletTextMode
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.backgroundColor
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .backgroundColor,
                                    border: isBulletTextMode
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.border
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .border,
                                    color: isBulletTextMode
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.color
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .color,
                                    borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                    cursor: isCursorPointer
                                        ? 'pointer'
                                        : 'default',
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
                                @mouseenter="
                                    FINAL_CONFIG.style.showTooltips &&
                                    showToolTipFor(
                                        'setBulletMode',
                                        $event,
                                        'top',
                                    )
                                "
                                @mouseleave="hideTooltip"
                                @focus="
                                    FINAL_CONFIG.style.showTooltips &&
                                    showToolTipFor(
                                        'setBulletMode',
                                        $event,
                                        'top',
                                    )
                                "
                                @blur="hideTooltip"
                            >
                                <svg
                                    width="100%"
                                    viewBox="0 0 24 24"
                                    stroke-width="2"
                                    stroke="currentColor"
                                    fill="none"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path
                                        stroke="none"
                                        d="M0 0h24v24H0z"
                                        fill="none"
                                    />
                                    <path d="M9 6l11 0" />
                                    <path d="M9 12l11 0" />
                                    <path d="M9 18l11 0" />
                                    <path d="M5 6l0 .01" />
                                    <path d="M5 12l0 .01" />
                                    <path d="M5 18l0 .01" />
                                </svg>

                                <TeleportedTooltip
                                    v-if="FINAL_CONFIG.style.showTooltips"
                                    :show="
                                        showTooltip &&
                                        tooltipKey === 'setBulletMode'
                                    "
                                    :x="tooltipPos.x"
                                    :y="tooltipPos.y - 6"
                                    :placement="'top'"
                                    :styleObject="tooltipStyleObject"
                                >
                                    {{
                                        FINAL_CONFIG.translations
                                            .tooltipShapeTextBullet
                                    }}
                                </TeleportedTooltip>
                            </button>
                        </div>

                        <!-- TEXT SET BOLD -->
                        <div v-if="isTextMode">
                            <button
                                :class="{
                                    'button-tool': true,
                                    'button-tool--selected': isBold,
                                    tooltip: true,
                                }"
                                :style="{
                                    background: isBold
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.backgroundColor
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .backgroundColor,
                                    border: isBold
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.border
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .border,
                                    color: isBold
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.color
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .color,
                                    borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                    cursor: isCursorPointer
                                        ? 'pointer'
                                        : 'default',
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
                                @mouseenter="
                                    FINAL_CONFIG.style.showTooltips &&
                                    showToolTipFor('setBold', $event, 'top')
                                "
                                @mouseleave="hideTooltip"
                                @focus="
                                    FINAL_CONFIG.style.showTooltips &&
                                    showToolTipFor('setBold', $event, 'top')
                                "
                                @blur="hideTooltip"
                            >
                                <svg
                                    width="100%"
                                    viewBox="0 0 24 24"
                                    stroke-width="3"
                                    stroke="currentColor"
                                    fill="none"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path
                                        stroke="none"
                                        d="M0 0h24v24H0z"
                                        fill="none"
                                    />
                                    <path d="M7 5h6a3.5 3.5 0 0 1 0 7h-6z" />
                                    <path
                                        d="M13 12h1a3.5 3.5 0 0 1 0 7h-7v-7"
                                    />
                                </svg>

                                <TeleportedTooltip
                                    v-if="FINAL_CONFIG.style.showTooltips"
                                    :show="
                                        showTooltip && tooltipKey === 'setBold'
                                    "
                                    :x="tooltipPos.x"
                                    :y="tooltipPos.y - 6"
                                    :placement="'top'"
                                    :styleObject="tooltipStyleObject"
                                >
                                    {{
                                        FINAL_CONFIG.translations
                                            .tooltipShapeTextBold
                                    }}
                                </TeleportedTooltip>
                            </button>
                        </div>

                        <!-- TEXT SET ITALIC -->
                        <div v-if="isTextMode">
                            <button
                                :class="{
                                    'button-tool': true,
                                    'button-tool--selected': isItalic,
                                    tooltip: true,
                                }"
                                :style="{
                                    background: isItalic
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.backgroundColor
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .backgroundColor,
                                    border: isItalic
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.border
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .border,
                                    color: isItalic
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.color
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .color,
                                    borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                    cursor: isCursorPointer
                                        ? 'pointer'
                                        : 'default',
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
                                @mouseenter="
                                    FINAL_CONFIG.style.showTooltips &&
                                    showToolTipFor('setItalic', $event, 'top')
                                "
                                @mouseleave="hideTooltip"
                                @focus="
                                    FINAL_CONFIG.style.showTooltips &&
                                    showToolTipFor('setItalic', $event, 'top')
                                "
                                @blur="hideTooltip"
                            >
                                <svg
                                    width="100%"
                                    height="44"
                                    viewBox="0 0 24 24"
                                    stroke-width="2"
                                    stroke="currentColor"
                                    fill="none"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path
                                        stroke="none"
                                        d="M0 0h24v24H0z"
                                        fill="none"
                                    />
                                    <path d="M11 5l6 0" />
                                    <path d="M7 19l6 0" />
                                    <path d="M14 5l-4 14" />
                                </svg>

                                <TeleportedTooltip
                                    v-if="FINAL_CONFIG.style.showTooltips"
                                    :show="
                                        showTooltip &&
                                        tooltipKey === 'setItalic'
                                    "
                                    :x="tooltipPos.x"
                                    :y="tooltipPos.y - 6"
                                    :placement="'top'"
                                    :styleObject="tooltipStyleObject"
                                >
                                    {{
                                        FINAL_CONFIG.translations
                                            .tooltipShapeTextItalic
                                    }}
                                </TeleportedTooltip>
                            </button>
                        </div>

                        <!-- TEXT SET UNDERLINE -->
                        <div v-if="isTextMode">
                            <button
                                :class="{
                                    'button-tool': true,
                                    'button-tool--selected': isUnderline,
                                    tooltip: true,
                                }"
                                :style="{
                                    background: isUnderline
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.backgroundColor
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .backgroundColor,
                                    border: isUnderline
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.border
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .border,
                                    color: isUnderline
                                        ? FINAL_CONFIG.style.buttons.shapes
                                              .selected.color
                                        : FINAL_CONFIG.style.buttons.shapes
                                              .color,
                                    borderRadius: `${FINAL_CONFIG.style.buttons.borderRadius}px`,
                                    cursor: isCursorPointer
                                        ? 'pointer'
                                        : 'default',
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
                                @mouseenter="
                                    FINAL_CONFIG.style.showTooltips &&
                                    showToolTipFor(
                                        'setUnderline',
                                        $event,
                                        'top',
                                    )
                                "
                                @mouseleave="hideTooltip"
                                @focus="
                                    FINAL_CONFIG.style.showTooltips &&
                                    showToolTipFor(
                                        'setUnderline',
                                        $event,
                                        'top',
                                    )
                                "
                                @blur="hideTooltip"
                            >
                                <svg
                                    width="100%"
                                    viewBox="0 0 24 24"
                                    stroke-width="2"
                                    stroke="currentColor"
                                    fill="none"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                >
                                    <path
                                        stroke="none"
                                        d="M0 0h24v24H0z"
                                        fill="none"
                                    />
                                    <path d="M7 5v5a5 5 0 0 0 10 0v-5" />
                                    <path d="M5 19h14" />
                                </svg>

                                <TeleportedTooltip
                                    v-if="FINAL_CONFIG.style.showTooltips"
                                    :show="
                                        showTooltip &&
                                        tooltipKey === 'setUnderline'
                                    "
                                    :x="tooltipPos.x"
                                    :y="tooltipPos.y - 6"
                                    :placement="'top'"
                                    :styleObject="tooltipStyleObject"
                                >
                                    {{
                                        FINAL_CONFIG.translations
                                            .tooltipShapeTextUnderline
                                    }}
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
                                    tooltip: true,
                                }"
                                :style="{
                                    borderRadius: '6px',
                                }"
                                @mouseenter="
                                    FINAL_CONFIG.style.showTooltips &&
                                    showToolTipFor('setColor', $event, 'top')
                                "
                                @mouseleave="hideTooltip"
                                @focus="
                                    FINAL_CONFIG.style.showTooltips &&
                                    showToolTipFor('setColor', $event, 'top')
                                "
                                @blur="hideTooltip"
                            >
                                <ColorPicker
                                    v-model:value="selectedColor"
                                    :backgroundColor="
                                        FINAL_CONFIG.style.backgroundColor
                                    "
                                    :buttonBorderColor="
                                        FINAL_CONFIG.style.color
                                    "
                                    :isCursorPointer="isCursorPointer"
                                    teleported
                                    @update:value="
                                        setColorOfSelectedShape($event)
                                    "
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
                                {{
                                    FINAL_CONFIG.translations.tooltipShapeColor
                                }}
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
                            <label
                                class="tool-input"
                                style="font-variant-numeric: tabular-nums"
                            >
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
                                        accentColor:
                                            FINAL_CONFIG.style.color +
                                            ' !important',
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
            <div
                class="annotator__content-layer"
                :style="`${isSummaryOpen ? 'pointer-events: none;' : ''}`"
            >
                <slot data-cy="annotator-slot"></slot>
            </div>
            <svg
                id="annotatorSvg"
                v-if="isSummaryOpen || FINAL_CONFIG.alwaysVisible"
                :key="step"
                ref="mainSvg"
                :class="{
                    annotator__overlay: true,
                    'annotator__overlay--inactive': !isSummaryOpen,
                    draw: true,
                    'draw--free': activeShape === 'line',
                }"
                :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
                :width="sourceWidth"
                :height="sourceHeight"
                @pointerdown="chooseAction($event)"
                @pointerup="resetDraw($event)"
                @touchend="resetDraw($event)"
                @touchstart="setPointer($event)"
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
                    x="0"
                    y="0"
                    :width="svgWidth"
                    :height="svgHeight"
                    fill="transparent"
                    :pointer-events="isSummaryOpen ? 'all' : 'none'"
                    :style="{ cursor: 'inherit' }"
                    @pointerdown.stop.prevent="chooseAction($event)"
                    @pointermove.stop.prevent="
                        setPointer($event);
                        chooseMove($event);
                    "
                    @pointerup.stop.prevent="resetDraw"
                    @click.stop.prevent="clickSvg($event)"
                />

                <g
                    v-for="shape in userShapes"
                    :key="shape.id"
                    v-html="shape.html"
                    :style="{ pointerEvents: isSummaryOpen ? null : 'none' }"
                    @click="clickShape($event, shape.id)"
                    @dblclick.stop.prevent="doubleClickShape($event, shape.id)"
                ></g>

                <line
                    v-if="textCaret && isWriting"
                    class="vue-ui-annotator-caret"
                    :x1="textCaret.x"
                    :x2="textCaret.x"
                    :y1="textCaret.y1"
                    :y2="textCaret.y2"
                    :stroke="textCaret.color"
                    stroke-width="2"
                    pointer-events="none"
                    vector-effect="non-scaling-stroke"
                />
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
import {
    ref,
    computed,
    onMounted,
    onBeforeUnmount,
    watch,
    nextTick,
} from 'vue';
import { opacity, treeShake, convertConfigColors, createUid } from '../lib';
import { COMMON_RULES, useHints } from '../useHints';
import { useConfig } from '../useConfig';
import { domToPng } from '../dom-to-png';
import { registerAnnotatorShortcuts } from '../registerAnnotatorShortcuts';
import { usePrinter } from '../usePrinter';
import BaseIcon from '../atoms/BaseIcon.vue';
import Accordion from './vue-ui-accordion.vue';
import TeleportedTooltip from '../atoms/TeleportedTooltip.vue';
import ColorPicker from '../atoms/ColorPicker.vue';

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
            return {
                shapes: [],
                lastSelectedShape: undefined,
            };
        },
    },
});

const emit = defineEmits(['toggleOpenState', 'saveAnnotations']);

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
    end: { x: 0, y: 0 },
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
        color: 'grey',
        filled: true,
    },
    circle: {
        color: 'grey',
        filled: false,
        radius: 3,
        strokeWidth: 2,
    },
    rect: {
        color: 'grey',
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
const resizeHandle = ref(null);
const resizeState = ref(null);
const editingTextId = ref(null);
const editingTextOriginal = ref(null);
const editingTextWasNew = ref(false);
const editingCaret = ref({ row: 0, col: 0 });
const textCaret = ref(null);
const TEXT_LINE_BREAK = '\u200E';
const SHAPE_HIT_PADDING = 12;
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

    if (!Object.keys(props.config || {}).length) {
        return DEFAULT_CONFIG;
    }

    const reconcilied = treeShake({
        defaultConfig: DEFAULT_CONFIG,
        userConfig: props.config,
    });

    return convertConfigColors(reconcilied);
});

useHints({
    config: () => FINAL_CONFIG.value,
    dataset: () => [],
    component: 'VueUiAnnotator',
    rules: [COMMON_RULES.noHint],
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

const canSelect = computed(
    () =>
        shapes.value.filter((shape) => !['line', 'group'].includes(shape.type))
            .length > 1,
);

const colorTransparency = computed(
    () => transparencyCodes[transparency.value > 98 ? 98 : transparency.value],
);

const cursorClass = computed(() => {
    switch (true) {
        case isDeleteMode.value:
            return 'default';

        case isMoveMode.value:
            return 'move';

        case isTextMode.value:
            return 'text';

        case isResizeMode.value:
            return 'move';

        default:
            return '';
    }
});

const records = computed(() => shapes.value);
const mainSvg = ref(null);

function isShapeHighlighted(shape) {
    if (!shape) return false;

    return Boolean(
        lastSelectedShape.value && lastSelectedShape.value.id === shape.id,
    );
}

function parseLinePoints(path = '') {
    const values = String(path)
        .trim()
        .split(/\s+/)
        .map(Number)
        .filter(Number.isFinite);

    const points = [];
    for (let i = 0; i + 1 < values.length; i += 2) {
        points.push({ x: values[i], y: values[i + 1] });
    }
    return points;
}

function serializeLinePoints(points = []) {
    return points.map(({ x, y }) => `${x} ${y}`).join(' ');
}

function getLineBounds(path = '') {
    const points = parseLinePoints(path);
    if (!points.length) return null;

    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
        minX,
        minY,
        maxX,
        maxY,
        width: Math.max(1, maxX - minX),
        height: Math.max(1, maxY - minY),
    };
}

function includeResizeHandles(shape) {
    if (
        !shape ||
        !isSummaryOpen.value ||
        !isResizeMode.value ||
        !lastSelectedShape.value ||
        lastSelectedShape.value.id !== shape.id
    ) {
        return '';
    }

    const handleRadius = 7;
    const stroke = FINAL_CONFIG.value.style.color || 'grey';
    const background =
        FINAL_CONFIG.value.style.backgroundColor || 'rgba(255,255,255,0.95)';

    const circleHandle = ({ handle, x, y, cursor = 'nwse-resize' }) => `
        <circle
            data-dom-to-png-ignore
            id="${shape.id}"
            data-resize-handle="${handle}"
            cx="${x}"
            cy="${y}"
            r="${handleRadius}"
            fill="${background}"
            stroke="${stroke}"
            stroke-width="2"
            pointer-events="all"
            style="cursor:${cursor}"
        />
    `;

    if (shape.type === 'arrow') {
        return `
            ${circleHandle({
                handle: 'arrow-start',
                x: shape.x,
                y: shape.y,
                cursor: 'move',
            })}
            ${circleHandle({
                handle: 'arrow-end',
                x: shape.endX,
                y: shape.endY,
                cursor: 'move',
            })}
        `;
    }

    if (shape.type === 'line') {
        const bounds = getLineBounds(shape.path);
        if (!bounds) return '';
        return circleHandle({
            handle: 'line-scale',
            x: bounds.maxX,
            y: bounds.maxY,
        });
    }

    if (shape.type === 'circle') {
        const radius = Math.max(1, Number(shape.circleRadius) || 1);
        const liveHandle =
            resizeHandle.value === 'circle-radius' &&
            resizeState.value?.shapeId === shape.id &&
            resizeState.value?.handlePoint
                ? resizeState.value.handlePoint
                : null;

        return circleHandle({
            handle: 'circle-radius',
            x: liveHandle?.x ?? shape.x + radius,
            y: liveHandle?.y ?? shape.y,
            cursor: 'move',
        });
    }

    if (shape.type === 'rect') {
        const left = Number(shape.x) || 0;
        const top = Number(shape.y) || 0;
        const right = left + Math.max(0, Number(shape.rectWidth) || 0);
        const bottom = top + Math.max(0, Number(shape.rectHeight) || 0);

        return `
            ${circleHandle({
                handle: 'rect-nw',
                x: left,
                y: top,
                cursor: 'nwse-resize',
            })}
            ${circleHandle({
                handle: 'rect-ne',
                x: right,
                y: top,
                cursor: 'nesw-resize',
            })}
            ${circleHandle({
                handle: 'rect-se',
                x: right,
                y: bottom,
                cursor: 'nwse-resize',
            })}
            ${circleHandle({
                handle: 'rect-sw',
                x: left,
                y: bottom,
                cursor: 'nesw-resize',
            })}
        `;
    }

    if (shape.type === 'group') {
        return circleHandle({
            handle: 'group-scale',
            x: shape.x + shape.rectWidth,
            y: shape.y + shape.rectHeight,
        });
    }

    return '';
}

function includeSelectionIndicator(shape) {
    if (!shape) return '';
    if (
        shape.type === 'text' &&
        isWriting.value &&
        editingTextId.value === shape.id
    ) {
        return '';
    }

    const display = isShapeHighlighted(shape) ? 'initial' : 'none';
    const padding = 20;

    switch (shape.type) {
        case 'rect':
            return `
                <rect
                    data-dom-to-png-ignore
                    style="stroke-dasharray: 10; display:${display}"
                    x="${shape.x - padding}"
                    y="${shape.y - padding}"
                    height="${shape.rectHeight + padding * 2}"
                    width="${shape.rectWidth + padding * 2}"
                    fill="transparent"
                    stroke="grey"
                    pointer-events="none"
                />
            `;

        case 'circle':
            return `
                <rect
                    data-dom-to-png-ignore
                    style="stroke-dasharray: 10; display:${display}"
                    x="${shape.x - shape.circleRadius - padding}"
                    y="${shape.y - shape.circleRadius - padding}"
                    height="${shape.circleRadius * 2 + padding * 2}"
                    width="${shape.circleRadius * 2 + padding * 2}"
                    fill="transparent"
                    stroke="grey"
                    pointer-events="none"
                />
            `;

        case 'arrow': {
            const minX = Math.min(shape.x, shape.endX);
            const minY = Math.min(shape.y, shape.endY);
            const width = Math.max(1, Math.abs(shape.endX - shape.x));
            const height = Math.max(1, Math.abs(shape.endY - shape.y));
            return `
                <rect
                    style="stroke-dasharray: 10; display:${display}"
                    x="${minX - padding}"
                    y="${minY - padding}"
                    height="${height + padding * 2}"
                    width="${width + padding * 2}"
                    fill="transparent"
                    stroke="grey"
                    pointer-events="none"
                />
            `;
        }

        case 'line': {
            const bounds = getLineBounds(shape.path);
            if (!bounds) return '';
            return `
                <rect
                    style="stroke-dasharray: 10; display:${display}"
                    x="${bounds.minX - padding}"
                    y="${bounds.minY - padding}"
                    height="${bounds.height + padding * 2}"
                    width="${bounds.width + padding * 2}"
                    fill="transparent"
                    stroke="grey"
                    pointer-events="none"
                />
            `;
        }

        case 'text': {
            const selectedText = mainSvg.value
                ? Array.from(mainSvg.value.getElementsByTagName('text')).find(
                      (textElement) =>
                          textElement.getAttribute('data-shape-id') ===
                          shape.id,
                  )
                : null;
            if (!selectedText) return '';
            const { x, y, width, height } = selectedText.getBBox();
            return `
                <rect
                    style="stroke-dasharray: 10; display:${display}"
                    x="${x - padding}"
                    y="${y - padding}"
                    height="${height + padding * 2}"
                    width="${width + padding * 2}"
                    fill="transparent"
                    stroke="grey"
                    pointer-events="none"
                />
            `;
        }

        default:
            return '';
    }
}

function includeDeleteButton(shape, isBulletTextMode = false) {
    switch (true) {
        case shape.type === 'circle':
            return `
                <g id="${shape.id}" style="display:${
                    isDeleteMode.value ? 'initial' : 'none'
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

        case shape.type === 'text':
            // determine position of delete button from textAlign property
            let offsetX;
            let offsetY = [-8, -12, -4, -12, -4];
            switch (true) {
                case shape.textAlign === 'start':
                    if (isBulletTextMode) {
                        offsetX = [-20, -24, -16, -16, -24];
                    } else {
                        offsetX = [-16, -20, -12, -12, -20];
                    }
                    break;

                case shape.textAlign === 'middle':
                    offsetX = [0, -4, 4, 4, -4];
                    offsetY = [-32, -36, -28, -36, -28];
                    break;

                case shape.textAlign === 'end':
                    offsetX = [16, 20, 12, 12, 20];
                    break;

                default:
                    offsetX = [0, 0, 0];
                    break;
            }

            return `
                <g id="${shape.id}" style="display:${
                    isDeleteMode.value ? 'initial' : 'none'
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
                    isDeleteMode.value ? 'initial' : 'none'
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
        case shape.textAlign === 'middle':
            return `<path class="vue-ui-annotator-caret" stroke="black" stroke-width="2" d="M${shape.x},${
                shape.y - shape.fontSize
            } ${shape.x},${
                shape.y - shape.fontSize - 15
            }" /> <path class="vue-ui-annotator-caret" stroke="black" stroke-width="2" d="M${shape.x - 3},${
                shape.y - shape.fontSize - 5
            } ${shape.x},${shape.y - shape.fontSize} ${shape.x + 3},${
                shape.y - shape.fontSize - 5
            }"/>`;

        case shape.textAlign === 'start':
            const bulletModeOffset = shape.isBulletTextMode
                ? shape.fontSize
                : 0;
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

        case shape.textAlign === 'end':
            return `<path class="vue-ui-annotator-caret" d="M${shape.x + 20},${shape.y - shape.fontSize / 6} ${
                shape.x + 5
            },${shape.y - shape.fontSize / 6}" stroke="black" stroke-width="2" />
                    <path class="vue-ui-annotator-caret" d="M${shape.x + 10},${shape.y - shape.fontSize / 3} ${
                        shape.x + 5
                    },${shape.y - shape.fontSize / 6} ${shape.x + 10},${
                        shape.y
                    }" stroke="black" stroke-width="2">`;

        default:
            return '';
    }
}

function normalizeLegacyText(value = '') {
    return String(value).replace(/&nbsp;/g, '\u00A0');
}

function getTextLines(shape) {
    const raw = String(shape?.textContent ?? '');
    return raw.split(TEXT_LINE_BREAK).map(normalizeLegacyText);
}

function setTextLines(shape, lines) {
    if (!shape) return;
    const safeLines = lines.length ? lines : [''];
    shape.textContent = safeLines.join(TEXT_LINE_BREAK);
    shape.lines = Math.max(0, safeLines.length - 1);
}

function escapeSvgText(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function renderTextLine(value = '') {
    const text = escapeSvgText(normalizeLegacyText(value));
    return text || '&#8203;';
}

function computeTextElement(shape, content, isBulletTextMode = false) {
    const lines = getTextLines(shape);
    const lineCount = Math.max(1, lines.length);
    const longestLine = lines.reduce(
        (max, line) => Math.max(max, line.length),
        0,
    );
    const hitWidth = Math.max(24, longestLine * shape.fontSize * 0.7 + 16);
    const hitX =
        shape.textAlign === 'middle'
            ? shape.x - hitWidth / 2
            : shape.textAlign === 'end'
              ? shape.x - hitWidth
              : shape.x;
    const hitHeight = Math.max(
        shape.fontSize * 1.2,
        shape.fontSize * lineCount,
    );

    return `
        <g id="${shape.id}">
            <rect
                id="${shape.id}"
                data-shape-hit-area="true"
                x="${hitX - 8}"
                y="${shape.y - shape.fontSize}"
                height="${hitHeight + 8}"
                width="${hitWidth + 16}"
                fill="transparent"
                pointer-events="all"
            />
            <text
                data-shape-id="${shape.id}"
                style="user-select:none;"
                id="${shape.id}"
                x="${shape.x}"
                y="${shape.y}"
                text-anchor="${shape.textAlign}"
                font-size="${shape.fontSize}"
                fill="${shape.color}"
                font-weight="${shape.isBold ? 'bold' : 'normal'}"
                font-style="${shape.isItalic ? 'italic' : 'normal'}"
                text-decoration="${shape.isUnderline ? 'underline' : 'none'}"
                pointer-events="bounding-box"
            >
                ${content.join('')}
            </text>
            ${includeDeleteButton(shape, isBulletTextMode)}
        </g>
    `;
}

const userShapes = computed(() => {
    return records.value.map((shape) => {
        switch (true) {
            case shape && shape.type === 'arrow': {
                const shapeWidthMax = shape.strokeWidth > 3 ? 5 : 10;
                const shapeWidthMin = shape.strokeWidth > 3 ? 2.5 : 5;
                const markerId = `marker_${shape.id}`;
                const hitStrokeWidth = Math.max(
                    SHAPE_HIT_PADDING * 2,
                    Number(shape.strokeWidth || 1) + SHAPE_HIT_PADDING * 2,
                );
                return {
                    html: `
          <defs>
          <marker
              id="${markerId}"
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
          <g id="${shape.id}">
              ${includeSelectionIndicator(shape)}
              <path
                  id="${shape.id}"
                  data-shape-hit-area="true"
                  d="M${shape.x},${shape.y} ${shape.endX},${shape.endY}"
                  fill="none"
                  stroke="transparent"
                  stroke-width="${hitStrokeWidth}"
                  pointer-events="stroke"
              />
              <path
                  id="${shape.id}"
                  data-shape-visible="true"
                  style="stroke-linecap: round !important; ${
                      shape.isDash
                          ? `stroke-dasharray: ${shape.strokeWidth * 3}`
                          : ''
                  }"
                  stroke="${shape.color}"
                  d="M${shape.x},${shape.y} ${shape.endX},${shape.endY}"
                  stroke-width="${shape.strokeWidth}"
                  fill="none"
                  pointer-events="stroke"
                  marker-end="url(#${markerId})"
              />
              ${includeResizeHandles(shape)}
              ${includeDeleteButton(shape)}
          </g>
          `,
                    id: shape.id,
                };
            }

            case shape && shape.type === 'circle':
                return {
                    html: `
          <g id="${shape.id}">
              ${includeSelectionIndicator(shape)}
              <circle 
              id="${shape.id}" 
              cx="${shape.x}" 
              cy="${shape.y}" 
              r="${shape.circleRadius ? shape.circleRadius : Number.MIN_VALUE}"
              fill="${
                  shape.isFilled
                      ? shape.color + shape.alpha
                      : 'rgba(255,255,255,0.001)'
              }" 
              stroke="${shape.color + shape.alpha}" 
              stroke-width="${shape.strokeWidth}"
              style="${
                  shape.isDash
                      ? `stroke-dasharray: ${shape.strokeWidth * 3}`
                      : ''
              }"
              >
              </circle>
              ${includeResizeHandles(shape)}
          </g>
          
          ${includeDeleteButton(shape)}`,
                    id: shape.id,
                };

            case shape && shape.type === 'group':
                return {
                    html: `<g id="${shape.id}">
            <rect
                data-dom-to-png-ignore
                id="${isResizeMode.value ? '' : shape.id}"
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
                        : ''
                }; display:${
                    isSelectMode.value ||
                    isDeleteMode.value ||
                    isShapeHighlighted(shape)
                        ? 'initial'
                        : 'none'
                };"
                        />
            <g id="${shape.id}">
            ${shape.content ? shape.content : ''}
            </g>
            ${includeResizeHandles(shape)}
            ${includeDeleteButton(shape)}
            </g> `,
                    id: shape.id,
                };

            case shape && shape.type === 'rect':
                return {
                    html: `<g id="${shape.id}">
            ${includeSelectionIndicator(shape)}
            <rect
                id="${isResizeMode.value ? '' : shape.id}"
                x="${shape.x}"
                y="${shape.y}"
                fill="${
                    shape.isFilled
                        ? shape.color + shape.alpha
                        : 'rgba(255,255,255,0.001)'
                }"
                height="${shape.rectHeight}"
                width="${shape.rectWidth}"
                stroke="${shape.color + shape.alpha}"
                stroke-width="${shape.strokeWidth}"
                style="rx:1 !important; ry:1 !important; ${
                    shape.isDash
                        ? `stroke-dasharray: ${shape.strokeWidth * 3}`
                        : ''
                }"
            />
            ${includeResizeHandles(shape)}
            ${includeDeleteButton(shape)}
            </g> `,
                    id: shape.id,
                };

            case shape && shape.type === 'line': {
                const hitStrokeWidth = Math.max(
                    SHAPE_HIT_PADDING * 2,
                    Number(shape.strokeWidth || 1) + SHAPE_HIT_PADDING * 2,
                );
                return {
                    html: `
                <g id="${shape.id}">
                    ${includeSelectionIndicator(shape)}
                    <path
                        id="${shape.id}"
                        data-shape-hit-area="true"
                        d="M${shape.path ? shape.path : ''}"
                        fill="none"
                        stroke="transparent"
                        stroke-width="${hitStrokeWidth}"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        pointer-events="stroke"
                    />
                    <path
                        id="${shape.id}"
                        data-shape-visible="true"
                        d="M${shape.path ? shape.path : ''}"
                        style="stroke:${
                            shape.color + shape.alpha
                        } !important; fill:none; stroke-width:${
                            shape.strokeWidth
                        } !important; stroke-linecap: round !important; stroke-linejoin: round !important; ${
                            shape.isDash
                                ? `stroke-dasharray: ${shape.strokeWidth * 3}`
                                : ''
                        }"
                        pointer-events="stroke"
                    />
                    ${includeResizeHandles(shape)}
                    ${includeDeleteButton(shape)}
                </g>
                `,
                    id: shape.id,
                };
            }

            case shape && shape.type === 'text': {
                const parsedText = getTextLines(shape);
                const parsedContent = [];
                for (let i = 0; i < parsedText.length; i += 1) {
                    parsedContent.push(`
        ${
            shape.isBulletTextMode
                ? `<tspan
                        data-bullet-line="${i}"
                        x="${shape.x - shape.fontSize}"
                        y="${shape.y + shape.fontSize * i}"
                        id="${shape.id}"
                        font-size="${shape.fontSize / 2}"
                    >⬤</tspan>`
                : ''
        }
                <tspan
                    data-text-line="${i}"
                    id="${shape.id}"
                    x="${shape.x}"
                    y="${shape.y + shape.fontSize * i}"
                >${renderTextLine(parsedText[i])}</tspan>`);
                }
                return {
                    html: `
            ${includeSelectionIndicator(shape)}
            ${computeTextElement(shape, parsedContent, shape.isBulletTextMode)}
            `,
                    id: shape.id,
                };
            }

            default:
                break;
        }
    });
});

function copy(source) {
    if (source === undefined || source === null) return source;
    try {
        if (typeof structuredClone === 'function')
            return structuredClone(source);
        return JSON.parse(JSON.stringify(source));
    } catch {
        if (Array.isArray(source)) return source.map((v) => copy(v));
        if (typeof source === 'object')
            return Object.fromEntries(
                Object.entries(source).map(([k, v]) => [k, copy(v)]),
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
            (shape) => shape.id === currentTarget.value.id,
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
        Xmax = Math.max(
            currentPointer.value.end.x,
            currentPointer.value.start.x,
        );
        Xmin = Math.min(
            currentPointer.value.end.x,
            currentPointer.value.start.x,
        );
        Ymax = Math.max(
            currentPointer.value.end.y,
            currentPointer.value.start.y,
        );
        Ymin = Math.min(
            currentPointer.value.end.y,
            currentPointer.value.start.y,
        );
    }

    switch (true) {
        case activeShape.value === 'arrow':
            shapes.value.at(-1).endX = currentPointer.value.end.x;
            shapes.value.at(-1).endY = currentPointer.value.end.y;
            break;

        case activeShape.value === 'circle':
            const offset = 20; // used to avoid shape shifting when resizing over another shape
            shapes.value.at(-1).circleRadius = isDrawingNewShape.value
                ? copy(Xmax - Xmin) + offset
                : distanceToPointer + offset;
            break;

        case activeShape.value === 'line':
            shapes.value.at(-1).path +=
                ` ${pointerPosition.value.x} ${pointerPosition.value.y} `;
            break;

        case ['rect', 'group'].includes(activeShape.value):
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
    const i = shapes.value.findIndex((s) => s.id === id);
    if (i > -1 && i !== shapes.value.length - 1) {
        const [s] = shapes.value.splice(i, 1);
        shapes.value.push(s);
    }
}

function shapeIdFromElement(element) {
    let current = element;
    while (current && current !== mainSvg.value) {
        const id = current.id;
        if (id && shapes.value.some((shape) => shape.id === id)) return id;
        current = current.parentElement;
    }
    return null;
}

function shapeIdUnderPointer(e) {
    if (!isSummaryOpen.value) return null;

    const directId = shapeIdFromElement(e?.target);
    if (directId) return directId;

    const glass = mainSvg.value?.querySelector('.annotator__glass');
    if (!glass) return null;

    const touch = e?.touches?.[0] || e?.changedTouches?.[0];
    const clientX = touch ? touch.clientX : e?.clientX;
    const clientY = touch ? touch.clientY : e?.clientY;
    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return null;

    const prev = glass.style.pointerEvents;
    glass.style.pointerEvents = 'none';
    const el = document.elementFromPoint(clientX, clientY);
    glass.style.pointerEvents = prev || 'all';

    return shapeIdFromElement(el);
}

function makeHistory(opts = {}) {
    const { maxEntries = 200, maxBytes = 2000000 } = opts;

    const state = { open: false, before: null, undo: [], redo: [] };
    const bytes = { undo: 0, redo: 0 };
    const sz = (s) => (typeof s === 'string' ? s.length * 2 : 0); // UTF-16-ish

    const snapshot = () =>
        JSON.stringify({
            shapes: copy(shapes.value),
            lastSelectedShape: copy(lastSelectedShape.value),
        });

    const apply = (snap) => {
        const s = JSON.parse(snap);
        shapes.value = s.shapes;
        lastSelectedShape.value = s.lastSelectedShape?.id
            ? shapes.value.find((shape) => shape.id === s.lastSelectedShape.id)
            : undefined;
        currentTarget.value = lastSelectedShape.value
            ? { id: lastSelectedShape.value.id }
            : undefined;
        editingTextId.value = null;
        editingTextOriginal.value = null;
        editingTextWasNew.value = false;
        isWriting.value = false;
        showCaret.value = false;
        textCaret.value = null;
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
                approxBytes: { undo: bytes.undo, redo: bytes.redo },
            };
        },
    };
}

function updateTooltipPosition() {
    if (!tooltipAnchor.value) return;
    const r = tooltipAnchor.value.getBoundingClientRect();
    tooltipPos.value = { x: r.left + r.width / 2, y: r.top };
}

// FIXME: remove placement arg
function showToolTipFor(key, ev, _placement = 'top') {
    tooltipKey.value = key;
    tooltipAnchor.value = ev.currentTarget || ev.target;
    updateTooltipPosition();
    showTooltip.value = true;
    window.addEventListener('scroll', updateTooltipPosition, true);
    window.addEventListener('resize', updateTooltipPosition, { passive: true });
}

function hideTooltip() {
    showTooltip.value = false;
    tooltipKey.value = null;
    tooltipAnchor.value = null;
    window.removeEventListener('scroll', updateTooltipPosition, true);
    window.removeEventListener('resize', updateTooltipPosition);
}

function initDragOffset(e) {
    const shapeId =
        shapeIdFromElement(e?.target) ||
        currentTarget.value?.id ||
        hoveredShapeId.value;
    const shape = shapes.value.find((item) => item.id === shapeId);
    if (!shape) {
        dragOffset.value = null;
        return;
    }

    lastSelectedShape.value = shape;
    currentTarget.value = { id: shape.id };

    const px = pointerPosition.value.x;
    const py = pointerPosition.value.y;

    switch (shape.type) {
        case 'rect':
        case 'circle':
        case 'text':
            dragOffset.value = { dx: px - shape.x, dy: py - shape.y };
            break;

        case 'arrow':
            dragOffset.value = {
                dx: px - shape.x,
                dy: py - shape.y,
                endDx: px - shape.endX,
                endDy: py - shape.endY,
            };
            break;

        case 'line':
            dragOffset.value = {
                startX: px,
                startY: py,
                path: shape.path,
            };
            break;

        case 'group':
            dragOffset.value = {
                dx: px - (shape.x || 0),
                dy: py - (shape.y || 0),
            };
            break;

        default:
            dragOffset.value = { dx: 0, dy: 0 };
            break;
    }
}

function initResizeState(shape, handle) {
    resizeHandle.value = handle || null;
    resizeState.value = null;

    if (!shape) return;

    if (shape.type === 'line' && handle === 'line-scale') {
        const points = parseLinePoints(shape.path);
        const bounds = getLineBounds(shape.path);
        if (!points.length || !bounds) return;
        resizeState.value = { shapeId: shape.id, points, bounds };
        return;
    }

    if (shape.type === 'rect' && handle?.startsWith('rect-')) {
        const left = Number(shape.x) || 0;
        const top = Number(shape.y) || 0;
        const right = left + Math.max(0, Number(shape.rectWidth) || 0);
        const bottom = top + Math.max(0, Number(shape.rectHeight) || 0);

        resizeState.value = {
            shapeId: shape.id,
            bounds: { left, top, right, bottom },
        };
        return;
    }

    if (shape.type === 'circle' && handle === 'circle-radius') {
        const radius = Math.max(1, Number(shape.circleRadius) || 1);
        resizeState.value = {
            shapeId: shape.id,
            anchor: {
                x: (Number(shape.x) || 0) - radius,
                y: Number(shape.y) || 0,
            },
            handlePoint: {
                x: (Number(shape.x) || 0) + radius,
                y: Number(shape.y) || 0,
            },
        };
    }
}

function bringShapeTo(layer) {
    const thisShape = shapes.value.find(
        (shape) => shape.id === lastSelectedShape.value.id,
    );
    switch (true) {
        case layer === 'front':
            shapes.value = shapes.value.filter(
                (shape) => shape.id !== thisShape.id,
            );
            shapes.value.push(thisShape);
            break;

        case layer === 'back':
            shapes.value = shapes.value.filter(
                (shape) => shape.id !== thisShape.id,
            );
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
        x:
            lastSelectedShape.value.x - 100 < 0
                ? 1
                : lastSelectedShape.value.x - 100,
        y:
            lastSelectedShape.value.y - 100 < 0
                ? 1
                : lastSelectedShape.value.y - 100,
    };
    shapes.value.push(shapeCopy);
}

function syncControlsFromShape(shape) {
    if (!shape) return;

    if (shape.color) selectedColor.value = shape.color;
    if (Number.isFinite(Number(shape.strokeWidth))) {
        strokeSize.value = Number(shape.strokeWidth);
    }
    if ('isDash' in shape) isDash.value = Boolean(shape.isDash);

    if (shape.type === 'circle') {
        options.value.circle.filled = Boolean(shape.isFilled);
        activeShape.value = 'circle';
    } else if (shape.type === 'rect') {
        options.value.rect.filled = Boolean(shape.isFilled);
        activeShape.value = 'rect';
    } else if (shape.type === 'arrow') {
        activeShape.value = 'arrow';
    } else if (shape.type === 'line') {
        activeShape.value = 'line';
    } else if (shape.type === 'text') {
        textAlign.value = shape.textAlign || 'start';
        textFont.value = Number(shape.fontSize) || textFont.value;
        isBold.value = Boolean(shape.isBold);
        isItalic.value = Boolean(shape.isItalic);
        isUnderline.value = Boolean(shape.isUnderline);
        isBulletTextMode.value = Boolean(shape.isBulletTextMode);
    }
}

function allowEditAndHoverShapes(e) {
    if (!isSummaryOpen.value) {
        hoveredShapeId.value = undefined;
        return;
    }

    e.preventDefault();
    preventEdit.value = false;
    hoveredShapeId.value = shapeIdFromElement(e.target) || undefined;
}

function updateTextCaretOverlay() {
    const editingId = editingTextId.value;
    if (!editingId || !mainSvg.value || !isWriting.value) {
        textCaret.value = null;
        return;
    }

    nextTick(() => {
        if (
            !mainSvg.value ||
            !isWriting.value ||
            editingTextId.value !== editingId
        ) {
            textCaret.value = null;
            return;
        }

        const shape = shapes.value.find((item) => item.id === editingId);
        if (!shape || shape.type !== 'text') {
            textCaret.value = null;
            return;
        }

        const textElement = Array.from(
            mainSvg.value.getElementsByTagName('text'),
        ).find(
            (element) => element.getAttribute('data-shape-id') === editingId,
        );
        if (!textElement) {
            textCaret.value = null;
            return;
        }

        const lines = getTextLines(shape);
        const row = Math.max(
            0,
            Math.min(editingCaret.value.row, lines.length - 1),
        );
        const line = lines[row] || '';
        const col = Math.max(0, Math.min(editingCaret.value.col, line.length));
        const prefix = line.slice(0, col);

        const measure = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text',
        );
        measure.setAttribute('font-size', String(shape.fontSize));
        measure.setAttribute(
            'font-family',
            textElement.getAttribute('font-family') || 'Helvetica',
        );
        measure.setAttribute('font-weight', shape.isBold ? 'bold' : 'normal');
        measure.setAttribute(
            'font-style',
            shape.isItalic ? 'italic' : 'normal',
        );
        measure.setAttribute('visibility', 'hidden');
        measure.setAttribute('pointer-events', 'none');
        mainSvg.value.appendChild(measure);

        const measureWidth = (value) => {
            measure.textContent = value || '\u200B';
            if (typeof measure.getComputedTextLength === 'function') {
                return measure.getComputedTextLength();
            }
            return measure.getBBox().width;
        };

        const prefixWidth = measureWidth(prefix);
        const lineWidth = measureWidth(line);
        measure.remove();

        let lineStartX = shape.x;
        if (shape.textAlign === 'middle') {
            lineStartX -= lineWidth / 2;
        } else if (shape.textAlign === 'end') {
            lineStartX -= lineWidth;
        }

        const baselineY = shape.y + shape.fontSize * row;
        textCaret.value = {
            x: lineStartX + prefixWidth,
            y1: baselineY - shape.fontSize * 0.85,
            y2: baselineY + shape.fontSize * 0.15,
            color: shape.color || FINAL_CONFIG.value.style.color,
        };
    });
}

function startTextEditing(shape, { isNew = false } = {}) {
    if (!shape || shape.type !== 'text') return;

    if (isWriting.value && editingTextId.value === shape.id) {
        const lines = getTextLines(shape);
        const row = Math.max(0, lines.length - 1);
        editingCaret.value = {
            row,
            col: (lines[row] || '').length,
        };
        showCaret.value = true;
        updateTextCaretOverlay();
        return;
    }

    if (isWriting.value) finishTextEditing();

    if (!isNew) history.value?.begin?.();

    lastSelectedShape.value = shape;
    currentTarget.value = { id: shape.id };
    editingTextId.value = shape.id;
    editingTextOriginal.value = isNew ? null : copy(shape);
    editingTextWasNew.value = isNew;

    const lines = getTextLines(shape);
    const row = Math.max(0, lines.length - 1);
    editingCaret.value = {
        row,
        col: (lines[row] || '').length,
    };

    syncControlsFromShape(shape);
    isTextMode.value = true;
    isWriting.value = true;
    showCaret.value = true;
    isDrawMode.value = false;
    activeShape.value = undefined;
    textCaret.value = null;
    updateTextCaretOverlay();
}

function finishTextEditing({ cancel = false } = {}) {
    const editingId = editingTextId.value;
    if (!editingId) {
        isWriting.value = false;
        showCaret.value = false;
        textCaret.value = null;
        return;
    }

    let shape = shapes.value.find((item) => item.id === editingId);

    if (cancel) {
        if (editingTextWasNew.value) {
            shapes.value = shapes.value.filter((item) => item.id !== editingId);
            shape = null;
        } else if (editingTextOriginal.value) {
            const index = shapes.value.findIndex(
                (item) => item.id === editingId,
            );
            if (index !== -1) {
                shapes.value[index] = copy(editingTextOriginal.value);
                shape = shapes.value[index];
            }
        }
    } else if (
        shape &&
        getTextLines(shape).every((line) => line.length === 0)
    ) {
        shapes.value = shapes.value.filter((item) => item.id !== editingId);
        shape = null;
    }

    editingTextId.value = null;
    editingTextOriginal.value = null;
    editingTextWasNew.value = false;
    editingCaret.value = { row: 0, col: 0 };
    isWriting.value = false;
    showCaret.value = false;
    textCaret.value = null;

    history.value?.end?.();

    if (shape) {
        lastSelectedShape.value = shape;
        currentTarget.value = { id: shape.id };
    } else if (lastSelectedShape.value?.id === editingId) {
        lastSelectedShape.value = undefined;
        currentTarget.value = undefined;
    }
}

function deleteEmptyTextElement() {
    if (isWriting.value) {
        finishTextEditing();
        return;
    }

    const shape = lastSelectedShape.value;
    if (!shape || shape.type !== 'text') return;

    if (getTextLines(shape).every((line) => line.length === 0)) {
        shapes.value = shapes.value.filter((item) => item.id !== shape.id);
        lastSelectedShape.value = shapes.value.at(-1);
    }
}

function createTextAtPointer() {
    history.value?.begin?.();

    const shape = {
        id: `text_${createUid()}`,
        type: 'text',
        lines: 0,
        x: pointerPosition.value.x,
        y: pointerPosition.value.y,
        textContent: '',
        fontSize: copy(textFont.value),
        textAlign: copy(textAlign.value),
        isBold: copy(isBold.value),
        isItalic: copy(isItalic.value),
        isUnderline: copy(isUnderline.value),
        color: copy(selectedColor.value),
        isBulletTextMode: copy(isBulletTextMode.value),
    };

    shapes.value.push(shape);
    lastSelectedShape.value = shape;
    currentTarget.value = { id: shape.id };
    startTextEditing(shape, { isNew: true });
}

let preserveNewShapeSelectionUntil = 0;

function clickSvg(e) {
    if (!isSummaryOpen.value || isDeleteMode.value) return;

    e.preventDefault();
    e.stopPropagation();
    setPointer(e);

    const shapeId = shapeIdFromElement(e.target);
    if (shapeId) return;

    if (Date.now() < preserveNewShapeSelectionUntil) {
        return;
    }

    if (isWriting.value) finishTextEditing();

    if (isTextMode.value && !isResizeMode.value) {
        createTextAtPointer();
        return;
    }

    if (!isDrawMode.value && !isSelectMode.value) {
        lastSelectedShape.value = undefined;
        currentTarget.value = undefined;
        hoveredShapeId.value = undefined;
        if (!isMoveMode.value) activeShape.value = undefined;
    }

    showCaret.value = false;
    textCaret.value = null;
}

function setSelectedTextAlignTo(position) {
    if (!lastSelectedShape.value || lastSelectedShape.value.type !== 'text') {
        return;
    }
    lastSelectedShape.value.textAlign = position;
    textAlign.value = position;
    updateTextCaretOverlay();
}

function undoLastShape() {
    if (isWriting.value) finishTextEditing();
    history.value?.undo?.();
}

function redoLastShape() {
    if (isWriting.value) finishTextEditing();
    history.value?.redo?.();
}

function write(e) {
    if (!isWriting.value || !editingTextId.value) return;

    const text = shapes.value.find((shape) => shape.id === editingTextId.value);
    if (!text || text.type !== 'text') {
        finishTextEditing();
        return;
    }

    let lines = getTextLines(text);
    if (!lines.length) lines = [''];

    let row = Math.max(0, Math.min(editingCaret.value.row, lines.length - 1));
    let col = Math.max(0, Math.min(editingCaret.value.col, lines[row].length));
    let changed = false;
    let caretChanged = false;

    if (e.key === 'Escape') {
        e.preventDefault();
        finishTextEditing({ cancel: true });
        return;
    }

    if (e.key === 'Enter') {
        e.preventDefault();
        const line = lines[row];
        lines.splice(row, 1, line.slice(0, col), line.slice(col));
        row += 1;
        col = 0;
        changed = true;
    } else if (e.key === 'Backspace') {
        e.preventDefault();
        if (col > 0) {
            lines[row] = lines[row].slice(0, col - 1) + lines[row].slice(col);
            col -= 1;
            changed = true;
        } else if (row > 0) {
            const previousLength = lines[row - 1].length;
            lines[row - 1] += lines[row];
            lines.splice(row, 1);
            row -= 1;
            col = previousLength;
            changed = true;
        }
    } else if (e.key === 'Delete') {
        e.preventDefault();
        if (col < lines[row].length) {
            lines[row] = lines[row].slice(0, col) + lines[row].slice(col + 1);
            changed = true;
        } else if (row < lines.length - 1) {
            lines[row] += lines[row + 1];
            lines.splice(row + 1, 1);
            changed = true;
        }
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (col > 0) {
            col -= 1;
        } else if (row > 0) {
            row -= 1;
            col = lines[row].length;
        }
        caretChanged = true;
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (col < lines[row].length) {
            col += 1;
        } else if (row < lines.length - 1) {
            row += 1;
            col = 0;
        }
        caretChanged = true;
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (row > 0) {
            row -= 1;
            col = Math.min(col, lines[row].length);
        }
        caretChanged = true;
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (row < lines.length - 1) {
            row += 1;
            col = Math.min(col, lines[row].length);
        }
        caretChanged = true;
    } else if (e.key === 'Home') {
        e.preventDefault();
        col = 0;
        caretChanged = true;
    } else if (e.key === 'End') {
        e.preventDefault();
        col = lines[row].length;
        caretChanged = true;
    } else if (e.key === 'Tab') {
        e.preventDefault();
        const spaces = '    ';
        lines[row] = lines[row].slice(0, col) + spaces + lines[row].slice(col);
        col += spaces.length;
        changed = true;
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        lines[row] = lines[row].slice(0, col) + e.key + lines[row].slice(col);
        col += e.key.length;
        changed = true;
    } else {
        return;
    }

    if (changed) {
        text.isBold = copy(isBold.value);
        text.isItalic = copy(isItalic.value);
        text.isUnderline = copy(isUnderline.value);
        setTextLines(text, lines);
    }

    if (changed || caretChanged) {
        editingCaret.value = { row, col };
        showCaret.value = true;
        updateTextCaretOverlay();
    }
}

function groupShapes() {
    selectedGroup.value = [];

    if (activeShape.value !== 'group') {
        isSelectMode.value = false;
        shapes.value = shapes.value.filter((shape) => shape.type !== 'group');
        return;
    }
    const group = shapes.value.at(-1);

    shapes.value.forEach((shape) => {
        if (shape.type === 'group') {
            return;
        }
        switch (true) {
            case shape.type === 'arrow':
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

            case shape.type === 'circle':
                if (
                    group.x <= shape.x + shape.circleRadius &&
                    group.y <= shape.y + shape.circleRadius &&
                    shape.x + shape.circleRadius <= group.x + group.rectWidth &&
                    shape.y + shape.circleRadius <= group.y + group.rectHeight
                ) {
                    selectedGroup.value.push(shape);
                }
                break;

            case shape.type === 'rect':
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

            case shape.type === 'text':
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
        shapes.value = shapes.value.filter(
            (shape) => !bannedIds.includes(shape.id),
        );

        // redraw each shape in the context of the group
        selectedGroup.value.forEach((shape) => {
            switch (true) {
                case shape.type === 'circle':
                    group.content += `
            <circle
            id="${shape.id}"
            cx="${shape.x}"
            cy="${shape.y}"
            r="${shape.circleRadius ? shape.circleRadius : Number.MIN_VALUE}"
            fill="${
                shape.isFilled
                    ? shape.color + shape.alpha
                    : 'rgba(255,255,255,0.001)'
            }"
            stroke="${shape.color + shape.alpha}" 
            stroke-width="${shape.strokeWidth}"
            style="${
                shape.isDash ? `stroke-dasharray: ${shape.strokeWidth * 3}` : ''
            }"
            />
        `;
                    break;

                case shape.type === 'rect':
                    group.content += `
            <rect
            id="${isResizeMode.value ? '' : shape.id}"
            x="${shape.x}"
            y="${shape.y}"
            fill="${
                shape.isFilled
                    ? shape.color + shape.alpha
                    : 'rgba(255,255,255,0.001)'
            }"
            height="${shape.rectHeight}"
            width="${shape.rectWidth}"
            stroke="${shape.color + shape.alpha}"
            stroke-width="${shape.strokeWidth}"
            style="rx:1 !important; ry:1 !important; ${
                shape.isDash ? `stroke-dasharray: ${shape.strokeWidth * 3}` : ''
            }"
                        />
        `;
                    break;

                case shape.type === 'arrow':
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
                    shape.isDash
                        ? `stroke-dasharray: ${shape.strokeWidth * 3}`
                        : ''
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

                case shape.type === 'text':
                    const parsedText = shape.textContent.split('‎');
                    const parsedContent = [];
                    for (let i = 0; i < parsedText.length; i += 1) {
                        parsedContent.push(`
            ${
                shape.isBulletTextMode
                    ? `<tspan x="${shape.x - shape.fontSize}" y="${
                          shape.y + shape.fontSize * i
                      }" id="${shape.id}" font-size="${shape.fontSize / 2}">⬤</tspan>`
                    : ''
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
    group.content = '';

    const baseX = group.x || 0;
    const baseY = group.y || 0;

    (group.source || []).forEach((shape) => {
        switch (shape.type) {
            case 'circle': {
                const cx = baseX + shape.diffX;
                const cy = baseY + shape.diffY;
                group.content += `
          <circle
            id="${shape.id}"
            cx="${cx}"
            cy="${cy}"
            r="${shape.circleRadius ? shape.circleRadius : Number.MIN_VALUE}"
            fill="${shape.isFilled ? shape.color + shape.alpha : 'rgba(255,255,255,0.001)'}"
            stroke="${shape.color + shape.alpha}"
            stroke-width="${shape.strokeWidth}"
            style="${shape.isDash ? `stroke-dasharray: ${shape.strokeWidth * 3}` : ''}"
          />
        `;
                break;
            }

            case 'rect': {
                const x = baseX + shape.diffX;
                const y = baseY + shape.diffY;
                group.content += `
          <rect
            id="${isResizeMode.value ? '' : shape.id}"
            x="${x}"
            y="${y}"
            fill="${shape.isFilled ? shape.color + shape.alpha : 'rgba(255,255,255,0.001)'}"
            height="${shape.rectHeight}"
            width="${shape.rectWidth}"
            stroke="${shape.color + shape.alpha}"
            stroke-width="${shape.strokeWidth}"
            style="rx:1 !important; ry:1 !important; ${shape.isDash ? `stroke-dasharray: ${shape.strokeWidth * 3}` : ''}"
          />
        `;
                break;
            }

            case 'arrow': {
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
              style="stroke-linecap: round !important; ${shape.isDash ? `stroke-dasharray: ${shape.strokeWidth * 3}` : ''}"
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

            case 'text': {
                const parsedText = (shape.textContent || '').split('‎');
                const content = parsedText
                    .map(
                        (line, i) => `
          ${
              shape.isBulletTextMode
                  ? `<tspan x="${baseX + shape.diffX - shape.fontSize}" y="${baseY + shape.diffY + shape.fontSize * i}" id="${shape.id}" font-size="${shape.fontSize / 2}">⬤</tspan>`
                  : ''
          }
          <tspan id="${shape.id}" x="${baseX + shape.diffX}" y="${baseY + shape.diffY + shape.fontSize * i}">
            ${line}
          </tspan>
        `,
                    )
                    .join('');

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
              font-weight="${shape.isBold ? 'bold' : 'normal'}"
              font-style="${shape.isItalic ? 'italic' : 'normal'}"
              text-decoration="${shape.isUnderline ? 'underline' : 'none'}">
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
    if (
        e.relatedTarget &&
        mainSvg.value &&
        mainSvg.value.contains(e.relatedTarget)
    )
        return; // still inside
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
    let id = `${isSelectMode.value ? 'group' : activeShape.value}_${createUid()}`;

    switch (true) {
        case activeShape.value === 'arrow':
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

        case activeShape.value === 'circle':
            shapes.value.push({
                alpha: options.value.circle.filled
                    ? colorTransparency.value
                    : '',
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

        case activeShape.value === 'line':
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

        case activeShape.value === 'rect':
            shapes.value.push({
                alpha: options.value.rect.filled ? colorTransparency.value : '',
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

        case activeShape.value === 'group':
            shapes.value.push({
                alpha: 1,
                id: `group_${createUid()}`,
                x: pointerPosition.value.x,
                y: pointerPosition.value.y,
                isFilled: false,
                rectHeight: copy(options.value.rect.height),
                rectWidth: copy(options.value.rect.width),
                rectStrokeWidth: 1,
                type: 'group',
                color: 'grey',
                strokeWidth: 1,
                isDash: true,
                content: '',
            });
            break;

        default:
            break;
    }

    if (!RAF_ID.value) RAF_ID.value = requestAnimationFrame(TICK_DRAW);
}

function chooseAction(e) {
    if (!isSummaryOpen.value) return;

    setPointer(e);

    const pointedId = shapeIdUnderPointer(e);
    const pointedShape = pointedId
        ? shapes.value.find((shape) => shape.id === pointedId)
        : null;

    if (
        isWriting.value &&
        editingTextId.value &&
        pointedId !== editingTextId.value
    ) {
        finishTextEditing();
    }

    if (isDeleteMode.value) {
        isMouseDown.value = false;
        return;
    }

    if (pointedShape) {
        const pointerAt = Number.isFinite(e?.timeStamp)
            ? e.timeStamp
            : Date.now();
        const isDoublePointerDown =
            lastShapePointerDown.id === pointedShape.id &&
            pointerAt - lastShapePointerDown.at >= 0 &&
            pointerAt - lastShapePointerDown.at <= DOUBLE_CLICK_DELAY;

        lastShapePointerDown = isDoublePointerDown
            ? { id: null, at: 0 }
            : { id: pointedShape.id, at: pointerAt };

        if (isDoublePointerDown) {
            e.preventDefault();
            e.stopPropagation();
            isMouseDown.value = false;
            dragOffset.value = null;
            resizeHandle.value = null;
            resizeState.value = null;
            enterShapeResizeMode(pointedShape);
            return;
        }
    } else {
        lastShapePointerDown = { id: null, at: 0 };
    }

    e.preventDefault();
    e.stopPropagation();

    isMouseDown.value = true;

    if (e.pointerId != null) {
        try {
            mainSvg.value?.setPointerCapture?.(e.pointerId);
        } catch {}
        lastPointerId.value = e.pointerId;
    } else {
        lastPointerId.value = null;
    }

    if (isDrawMode.value) {
        if (pointedShape) {
            isMouseDown.value = false;
            isDrawMode.value = false;
            lastSelectedShape.value = pointedShape;
            currentTarget.value = { id: pointedShape.id };
            syncControlsFromShape(pointedShape);
            return;
        }
        history.value?.begin?.();
        drawDown();
        return;
    }

    if (isSelectMode.value) {
        history.value?.begin?.();
        drawDown();
        return;
    }

    if (isMoveMode.value) {
        if (!pointedShape) {
            isMouseDown.value = false;
            currentTarget.value = undefined;
            return;
        }

        history.value?.begin?.();
        bringToFrontById(pointedShape.id);
        const shape = shapes.value.find((item) => item.id === pointedShape.id);
        lastSelectedShape.value = shape;
        currentTarget.value = { id: shape.id };
        initDragOffset({ target: e.target });
        return;
    }

    if (isResizeMode.value) {
        if (!pointedShape) {
            isMouseDown.value = false;
            currentTarget.value = undefined;
            dragOffset.value = null;
            resizeHandle.value = null;
            resizeState.value = null;
            return;
        }

        const handle = e.target?.getAttribute?.('data-resize-handle') || null;
        lastSelectedShape.value = pointedShape;
        currentTarget.value = { id: pointedShape.id };
        syncControlsFromShape(pointedShape);

        if (handle) {
            dragOffset.value = null;
            initResizeState(pointedShape, handle);
        } else {
            resizeHandle.value = null;
            resizeState.value = null;
            initDragOffset(e);
        }

        history.value?.begin?.();
    }
}

function move(shape) {
    if (!shape || !shape.id) return;

    if (!dragOffset.value) {
        initDragOffset({ target: { id: shape.id } });
        if (!dragOffset.value) return;
    }

    const px = pointerPosition.value.x;
    const py = pointerPosition.value.y;

    lastSelectedShape.value = shape;

    switch (shape.type) {
        case 'arrow': {
            const { dx, dy, endDx, endDy } = dragOffset.value;
            shape.x = px - dx;
            shape.y = py - dy;
            shape.endX = px - (endDx ?? dx);
            shape.endY = py - (endDy ?? dy);
            break;
        }

        case 'circle':
        case 'rect':
        case 'text': {
            const { dx, dy } = dragOffset.value;
            shape.x = px - dx;
            shape.y = py - dy;
            break;
        }

        case 'line': {
            const { startX, startY, path } = dragOffset.value;
            const dx = px - startX;
            const dy = py - startY;
            const points = parseLinePoints(path).map((point) => ({
                x: point.x + dx,
                y: point.y + dy,
            }));
            shape.path = serializeLinePoints(points);
            const bounds = getLineBounds(shape.path);
            if (bounds) {
                shape.x = bounds.minX;
                shape.y = bounds.minY;
            }
            break;
        }

        case 'group': {
            const { dx, dy } = dragOffset.value;
            shape.x = px - dx;
            shape.y = py - dy;
            moveGroup(shape);
            break;
        }

        default:
            break;
    }
}

function moveDown() {
    const id = currentTarget.value?.id || hoveredShapeId.value;
    if (!id) return;
    const shape = shapes.value.find((item) => item.id === id);
    if (!shape) return;
    move(shape);
}

function resize() {
    const shapeId = currentTarget.value?.id;
    if (!shapeId) return;

    const shape = shapes.value.find((item) => item.id === shapeId);
    if (!shape) return;

    const px = pointerPosition.value.x;
    const py = pointerPosition.value.y;
    activeShape.value = shape.type;
    lastSelectedShape.value = shape;

    switch (shape.type) {
        case 'arrow':
            if (resizeHandle.value === 'arrow-start') {
                shape.x = px;
                shape.y = py;
            } else if (resizeHandle.value === 'arrow-end') {
                shape.endX = px;
                shape.endY = py;
            }
            break;

        case 'line': {
            if (
                resizeHandle.value !== 'line-scale' ||
                !resizeState.value?.bounds ||
                !resizeState.value?.points
            ) {
                return;
            }

            const { bounds, points } = resizeState.value;
            const newWidth = Math.max(1, px - bounds.minX);
            const newHeight = Math.max(1, py - bounds.minY);
            const scaleX = newWidth / Math.max(1, bounds.width);
            const scaleY = newHeight / Math.max(1, bounds.height);

            const scaled = points.map((point) => ({
                x: bounds.minX + (point.x - bounds.minX) * scaleX,
                y: bounds.minY + (point.y - bounds.minY) * scaleY,
            }));

            shape.path = serializeLinePoints(scaled);
            shape.x = bounds.minX;
            shape.y = bounds.minY;
            break;
        }

        case 'circle': {
            if (
                resizeHandle.value !== 'circle-radius' ||
                resizeState.value?.shapeId !== shape.id ||
                !resizeState.value?.anchor
            ) {
                return;
            }

            const anchor = resizeState.value.anchor;
            let handleX = px;
            let handleY = py;
            let dx = handleX - anchor.x;
            let dy = handleY - anchor.y;
            let diameter = Math.hypot(dx, dy);

            if (diameter < 2) {
                if (diameter > 0) {
                    const scale = 2 / diameter;
                    dx *= scale;
                    dy *= scale;
                } else {
                    dx = 2;
                    dy = 0;
                }
                handleX = anchor.x + dx;
                handleY = anchor.y + dy;
                diameter = 2;
            }

            shape.x = anchor.x + dx / 2;
            shape.y = anchor.y + dy / 2;
            shape.circleRadius = diameter / 2;
            resizeState.value.handlePoint = {
                x: handleX,
                y: handleY,
            };
            break;
        }

        case 'rect': {
            const handle = resizeHandle.value;
            const bounds = resizeState.value?.bounds;
            if (
                !handle?.startsWith('rect-') ||
                resizeState.value?.shapeId !== shape.id ||
                !bounds
            ) {
                return;
            }

            const minSize = 20;
            let left = bounds.left;
            let top = bounds.top;
            let right = bounds.right;
            let bottom = bounds.bottom;

            switch (handle) {
                case 'rect-nw':
                    left = Math.min(px, bounds.right - minSize);
                    top = Math.min(py, bounds.bottom - minSize);
                    break;
                case 'rect-ne':
                    right = Math.max(px, bounds.left + minSize);
                    top = Math.min(py, bounds.bottom - minSize);
                    break;
                case 'rect-se':
                    right = Math.max(px, bounds.left + minSize);
                    bottom = Math.max(py, bounds.top + minSize);
                    break;
                case 'rect-sw':
                    left = Math.min(px, bounds.right - minSize);
                    bottom = Math.max(py, bounds.top + minSize);
                    break;
                default:
                    return;
            }

            shape.x = left;
            shape.y = top;
            shape.rectWidth = right - left;
            shape.rectHeight = bottom - top;
            break;
        }

        case 'group':
            if (resizeHandle.value !== 'group-scale') return;
            shape.rectWidth = Math.max(20, px - shape.x);
            shape.rectHeight = Math.max(20, py - shape.y);
            break;

        default:
            break;
    }
}

function chooseMove(e) {
    if (!isSummaryOpen.value || isDeleteMode.value) return;

    e.preventDefault();
    e.stopPropagation();
    setPointer(e);

    const hoveredId = shapeIdUnderPointer(e);
    if (hoveredId) hoveredShapeId.value = hoveredId;

    if (isMoveMode.value && isMouseDown.value) {
        moveDown();
    } else if (isResizeMode.value && isMouseDown.value) {
        if (resizeHandle.value) {
            resize();
        } else {
            moveDown();
        }
    }
}

function enterShapeResizeMode(shape) {
    if (!shape) return;

    if (isWriting.value && editingTextId.value !== shape.id) {
        finishTextEditing();
    }

    lastSelectedShape.value = shape;
    currentTarget.value = { id: shape.id };

    isMoveMode.value = false;
    isDeleteMode.value = false;
    isResizeMode.value = true;
    isSelectMode.value = false;
    isDrawMode.value = false;

    if (shape.type === 'text') {
        activeShape.value = undefined;
        syncControlsFromShape(shape);
        startTextEditing(shape);
        return;
    }

    isTextMode.value = false;
    isWriting.value = false;
    showCaret.value = false;
    textCaret.value = null;
    syncControlsFromShape(shape);
}

const DOUBLE_CLICK_DELAY = 450;
let lastShapePointerDown = {
    id: null,
    at: 0,
};
let lastShapeClick = {
    id: null,
    at: 0,
};

function doubleClickShape(e, explicitShapeId) {
    if (!isSummaryOpen.value) return;

    const shapeId = explicitShapeId || shapeIdFromElement(e.target);
    if (!shapeId) return;

    lastShapeClick = { id: null, at: 0 };

    const shape = shapes.value.find((item) => item.id === shapeId);
    if (!shape) return;

    enterShapeResizeMode(shape);
}

function clickShape(e, explicitShapeId) {
    if (!isSummaryOpen.value) return;

    const shapeId = explicitShapeId || shapeIdFromElement(e.target);
    if (!shapeId) return;

    const shape = shapes.value.find((item) => item.id === shapeId);
    if (!shape) return;

    const clickAt = Number.isFinite(e?.timeStamp) ? e.timeStamp : Date.now();
    const isDoubleClick =
        lastShapeClick.id === shapeId &&
        clickAt - lastShapeClick.at >= 0 &&
        clickAt - lastShapeClick.at <= DOUBLE_CLICK_DELAY;

    lastShapeClick = isDoubleClick
        ? { id: null, at: 0 }
        : { id: shapeId, at: clickAt };

    if (isDoubleClick && !isDeleteMode.value) {
        enterShapeResizeMode(shape);
        return;
    }

    const wasSelected = lastSelectedShape.value?.id === shapeId;
    const textToolWasActive = isTextMode.value;

    if (isDeleteMode.value) {
        if (isWriting.value) finishTextEditing();
        history.value?.begin?.();
        shapes.value = shapes.value.filter((item) => item.id !== shapeId);
        if (lastSelectedShape.value?.id === shapeId) {
            lastSelectedShape.value = undefined;
        }
        currentTarget.value = undefined;
        history.value?.end?.();
        return;
    }

    if (
        isWriting.value &&
        editingTextId.value &&
        editingTextId.value !== shapeId
    ) {
        finishTextEditing();
    }

    lastSelectedShape.value = shape;
    currentTarget.value = { id: shape.id };

    if (isMoveMode.value) {
        showCaret.value = false;
        textCaret.value = null;
        return;
    }

    syncControlsFromShape(shape);

    if (shape.type === 'text') {
        const canEditText =
            !isMoveMode.value &&
            !isResizeMode.value &&
            !isDrawMode.value &&
            !isSelectMode.value;
        isTextMode.value = canEditText;

        if (canEditText && (textToolWasActive || wasSelected)) {
            startTextEditing(shape);
        }
        return;
    }

    isTextMode.value = false;
    showCaret.value = false;
    textCaret.value = null;
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
    if (isWriting.value) finishTextEditing();
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
                node.setAttribute('font-family', 'Helvetica');
                node.style.fontFamily = 'Helvetica';
            }
        });

        try {
            let JsPDF;
            try {
                JsPDF = (await import('jspdf')).default;
            } catch (e) {
                throw new Error(
                    'jspdf is not installed. Run npm install jspdf',
                );
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

                const pdf = new JsPDF('', 'pt', 'a4');
                let position = 0;
                let leftHeight = contentHeight;

                if (leftHeight < pageHeight) {
                    pdf.addImage(
                        pngDataUrl,
                        'PNG',
                        0,
                        0,
                        imgWidth,
                        imgHeight,
                        '',
                        'FAST',
                    );
                } else {
                    while (leftHeight > 0) {
                        pdf.addImage(
                            pngDataUrl,
                            'PNG',
                            0,
                            position,
                            imgWidth,
                            imgHeight,
                            '',
                            'FAST',
                        );
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
            console.error('Error generating image:', err);
        } finally {
            isPrinting.value = false;

            walkTheDOM(wrapper, (node) => {
                if (node && node.nodeType === 1) {
                    node.setAttribute(
                        'font-family',
                        FINAL_CONFIG.value.style.fontFamily,
                    );
                    node.style.fontFamily = FINAL_CONFIG.value.style.fontFamily;
                }
            });
        }
    });
}

function resetDraw(e) {
    const completedShape =
        isDrawMode.value &&
        isDrawing.value &&
        lastSelectedShape.value &&
        ['arrow', 'circle', 'line', 'rect'].includes(
            lastSelectedShape.value.type,
        )
            ? shapes.value.find(
                  (shape) => shape.id === lastSelectedShape.value.id,
              )
            : null;

    if (!isDeleteMode.value && e) {
        e.preventDefault();
        e.stopPropagation();
    }
    isDrawing.value = false;
    isMouseDown.value = false;
    dragOffset.value = null;
    resizeHandle.value = null;
    resizeState.value = null;

    if (lastPointerId.value != null) {
        try {
            mainSvg.value?.releasePointerCapture?.(lastPointerId.value);
        } catch {}
        lastPointerId.value = null;
    }

    if (RAF_ID.value) {
        cancelAnimationFrame(RAF_ID.value);
        RAF_ID.value = null;
    }

    if (isSelectMode.value) groupShapes();
    history.value?.end();

    if (completedShape) {
        // Pointer-up after drawing is followed by a synthetic click on the
        // background/glass. Keep that click from immediately clearing the
        // freshly-created selection so its resize handles stay visible.
        preserveNewShapeSelectionUntil = Date.now() + 250;
        enterShapeResizeMode(completedShape);
    }
}

function setFillOfSelectedRect() {
    if (
        !lastSelectedShape.value ||
        !lastSelectedShape.value.id.includes('rect')
    ) {
        return;
    }
    lastSelectedShape.value.isFilled = !lastSelectedShape.value.isFilled;
}

function setFillOfSelectedCircle() {
    if (
        !lastSelectedShape.value ||
        !lastSelectedShape.value.id.includes('circle')
    ) {
        return;
    }
    lastSelectedShape.value.isFilled = !lastSelectedShape.value.isFilled;
}

function setColorOfSelectedShape(color = selectedColor.value) {
    const nextColor =
        typeof color === 'string' && color.length ? color : selectedColor.value;

    selectedColor.value = nextColor;

    if (!lastSelectedShape.value || isMoveMode.value) {
        return;
    }

    const selectedShape = shapes.value.find(
        (shape) => shape.id === lastSelectedShape.value.id,
    );
    if (!selectedShape) {
        return;
    }

    selectedShape.color = copy(nextColor);
    lastSelectedShape.value = selectedShape;

    if (['arrow', 'text'].includes(selectedShape.type)) {
        updateTextCaretOverlay();
        return;
    }

    selectedShape.alpha = copy(colorTransparency.value);
}

function setSelectedShapeToDash() {
    if (!lastSelectedShape.value || lastSelectedShape.value.type === 'text') {
        return;
    }
    lastSelectedShape.value.isDash = copy(isDash.value);
}

function setTransparencyOfSelectedShape() {
    if (
        !lastSelectedShape.value ||
        ['arrow', 'text'].includes(lastSelectedShape.value.type)
    ) {
        return;
    }
    lastSelectedShape.value.alpha = copy(colorTransparency.value);
}

function setStrokeWidthOfSelectedShape() {
    if (
        !lastSelectedShape.value ||
        !['arrow', 'circle', 'rect', 'line'].includes(
            lastSelectedShape.value.type,
        )
    ) {
        return;
    }
    lastSelectedShape.value.strokeWidth = copy(Math.abs(strokeSize.value));
}

function setCurrentStyleOfSelectedText() {
    if (!lastSelectedShape.value || lastSelectedShape.value.type !== 'text') {
        return;
    }
    lastSelectedShape.value.isBold = copy(isBold.value);
    lastSelectedShape.value.isItalic = copy(isItalic.value);
    lastSelectedShape.value.isUnderline = copy(isUnderline.value);
    lastSelectedShape.value.fontSize = copy(textFont.value);
    lastSelectedShape.value.isBulletTextMode = copy(isBulletTextMode.value);
    updateTextCaretOverlay();
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

    pointerPosition.value.x =
        ((clientX - rect.left) / rect.width) * svgWidth.value;
    pointerPosition.value.y =
        ((clientY - rect.top) / rect.height) * svgHeight.value;
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
    if (isWriting.value) finishTextEditing();
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
    emit('toggleOpenState', { isOpen: isSummaryOpen.value });
}

function save() {
    if (isWriting.value) finishTextEditing();
    emit('saveAnnotations', {
        shapes: shapes.value,
        lastSelectedShape: lastSelectedShape.value,
    });
}

let UNREGISTER_SHORTCUTS = null;

onMounted(() => {
    if (drawSvgContainer.value) {
        let foundSvg = false;

        walkTheDOM(drawSvgContainer.value, (node) => {
            if (!foundSvg) {
                if (
                    ['DIV', 'svg', 'section', 'canvas'].includes(node.tagName)
                ) {
                    slottedSvg.value = node;
                    foundSvg = true;
                    return;
                }
            }
        });
    }

    isMacLike.value = (() => {
        if (typeof navigator === 'undefined') return false;
        const uaDataPlatform = navigator.userAgentData?.platform ?? '';
        if (uaDataPlatform) return /mac|ios/i.test(uaDataPlatform);
        const ua = navigator.userAgent ?? '';
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
            sizeRatio.value =
                entry.contentRect.height / entry.contentRect.width;
            svgHeight.value = sizeRatio.value * 1000;
        });
    });

    myObserver.observe(slottedSvg.value);

    ONKEYDOWN.value = (e) => write(e);
    window.addEventListener('keydown', ONKEYDOWN.value);
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
    if (ONKEYDOWN.value) window.removeEventListener('keydown', ONKEYDOWN.value);
    UNREGISTER_SHORTCUTS && UNREGISTER_SHORTCUTS();
    window.removeEventListener('keydown', write);
});

watch(shapes, (newVal) => {
    if (newVal.length === 0) {
        lastSelectedShape.value = undefined;
    }
});

watch(isTextMode, (bool) => {
    if (!bool && isWriting.value) {
        finishTextEditing();
        return;
    }
    showCaret.value = Boolean(bool && isWriting.value);
    if (showCaret.value) updateTextCaretOverlay();
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
    content: '';
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
    cursor:
        url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAABg2lDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TpSIVh2YQcchQnSyIijhKFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi6OSk6CIl/i8ptIjx4Lgf7+497t4BQrPKNKtnAtB020wn4lIuvyqFXhGGiAhCiMnMMpKZxSx8x9c9Any9i/Es/3N/jgG1YDEgIBHPMcO0iTeIZzZtg/M+scjKskp8Tjxu0gWJH7muePzGueSywDNFM5ueJxaJpVIXK13MyqZGPE0cVTWd8oWcxyrnLc5atc7a9+QvDBf0lQzXaY4ggSUkkYIEBXVUUIWNGK06KRbStB/38Q+7/hS5FHJVwMixgBo0yK4f/A9+d2sVpya9pHAc6H1xnI9RILQLtBqO833sOK0TIPgMXOkdf60JzH6S3uho0SNgcBu4uO5oyh5wuQMMPRmyKbtSkKZQLALvZ/RNeSByC/Sveb2193H6AGSpq+Ub4OAQGCtR9rrPu/u6e/v3TLu/H5C7crM1WjgWAAAABmJLR0QAqwB5AHWF+8OUAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH5gwUExIUagzGcQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAABfSURBVBjTldAxDoNQDIPhL0+q1L33P1AvAhN7xfK6WAgoLfSfrNiykpQtE+7RLzx2vgF9D3o8lWDmn1QVVMP0LZQGmNtqp1/cmou0XHdG/+sYeGZwFBqPCub8rkcvvAGvsi1VYarR8wAAAABJRU5ErkJggg==')
            5 5,
        auto;
}

kbd {
    background: radial-gradient(at top left, #aaaaaa, #dddddd);
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
.annotator__overlay--inactive,
.annotator__overlay--inactive * {
    pointer-events: none !important;
}

.vue-ui-annotator-caret {
    animation: caret 1s step-end infinite;
}

@keyframes caret {
    0%,
    50% {
        opacity: 1;
    }
    50.01%,
    100% {
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
