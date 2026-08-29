<script setup>
import {
    computed,
    getCurrentInstance,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    useTemplateRef,
    watch,
} from 'vue';
import Shape from '../atoms/Shape.vue';
import themes from '../themes/vue_ui_label.json';
import { useConfig } from '../useConfig';
import { useNestedProp } from '../useNestedProp';
import { useThemeCheck } from '../useThemeCheck';
import { clampNumber, createUid, isValidNumber } from '../lib';

const props = defineProps({
    dataset: {
        type: Object,
        default() {
            return {
                x: null,
                y: null,
                position: {
                    x: null,
                    y: null,
                },
            };
        },
    },
    config: {
        type: Object,
        default() {
            return {};
        },
    },
});

const emit = defineEmits([
    'dragStart',
    'drag',
    'dragEnd',
    'click',
    'mouseenter',
    'mouseleave',
    'focus',
    'blur',
]);

const { vue_ui_label: DEFAULT_CONFIG } = useConfig();
const { isThemeValid, warnInvalidTheme } = useThemeCheck();

function prepareConfig() {
    const mergedConfig = useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG,
    });
    let finalConfig = {};
    const theme = mergedConfig.theme;
    if (!theme) {
        finalConfig = mergedConfig;
    } else {
        if (!isThemeValid.value(mergedConfig)) {
            warnInvalidTheme(mergedConfig);
            finalConfig = mergedConfig;
        } else {
            finalConfig = useNestedProp({
                userConfig: themes[theme] || props.config,
                defaultConfig: mergedConfig,
            });
        }
    }

    return finalConfig;
}

const FINAL_CONFIG = computed(() => prepareConfig());

const instance = getCurrentInstance();
const uid = createUid();

const wrapperRef = useTemplateRef('wrapperRef');
const labelRef = useTemplateRef('labelRef');
const contentRef = useTemplateRef('contentRef');
const boxRef = useTemplateRef('boxRef');
const titleTextRef = useTemplateRef('titleTextRef');
const contentTextRef = useTemplateRef('contentTextRef');

const parentSvg = ref(null);
const layoutRect = ref(null);
const boxRect = ref(null);
const currentOffset = ref({ x: 0, y: 0 });
const ignoreDatasetPosition = ref(false);
const isDragging = ref(false);
const inputModality = ref('pointer');

const TITLE_FONT_SIZE = computed(() => FINAL_CONFIG.value.title.fontSize);
const TITLE_LINE_HEIGHT = computed(() => FINAL_CONFIG.value.title.lineHeight);
const CONTENT_FONT_SIZE = computed(() => FINAL_CONFIG.value.content.fontSize);
const CONTENT_LINE_HEIGHT = computed(
    () => FINAL_CONFIG.value.content.lineHeight,
);

const TITLE_CONTENT_GAP = computed(() => FINAL_CONFIG.value.title.gap);
const DRAG_HANDLE_WIDTH = computed(() => FINAL_CONFIG.value.drag.handleWidth);
const COLLISION_GAP = computed(() => FINAL_CONFIG.value.collisionGap);
const TARGET_GAP = 8;
const BOUNDARY_PADDING = 4;
const MAX_SEARCH_RINGS = 12;
const MIN_INTERACTIVE_TARGET_SIZE = 24;
const KEYBOARD_MOVE_STEP = 1;
const KEYBOARD_MOVE_STEP_LARGE = 10;

const LAYOUT_ORDER_KEY = '__vueUiLabelLayoutOrder';
const NEXT_ORDER_KEY = '__vueUiLabelNextLayoutOrder';
const RAF_KEY = '__vueUiLabelLayoutRaf';
const SET_LAYOUT_RECT_KEY = '__vueUiLabelSetLayoutRect';
const MEASURE_ELEMENT_KEY = '__vueUiLabelMeasureElement';
const EMIT_DRAG_END_KEY = '__vueUiLabelEmitDragEnd';
const PERSISTED_OFFSET_KEY = '__vueUiLabelPersistedOffset';
const DRAG_REQUESTED_OFFSET_KEY = '__vueUiLabelDragRequestedOffset';
const DRAGGING_KEY = '__vueUiLabelDragging';
const DRAG_PRIORITY_KEY = '__vueUiLabelDragPriority';
const NEXT_DRAG_PRIORITY_KEY = '__vueUiLabelNextDragPriority';
const LAST_LAYOUT_RECT_KEY = '__vueUiLabelLastLayoutRect';
const LAST_LAYOUT_OFFSET_KEY = '__vueUiLabelLastLayoutOffset';
const DISPLACED_LABELS_KEY = '__vueUiLabelDisplacedLabels';

let mutationObserver = null;
let resizeObserver = null;
let liveRegion = null;

const dragState = {
    inputType: null,
    touchId: null,
    startPointer: null,
    startOffset: null,
    lastRequestedOffset: null,
};

const baseCoordinates = computed(() => ({
    x: props.dataset?.x ?? null,
    y: props.dataset?.y ?? null,
}));

const validCoordinates = computed(
    () =>
        isValidNumber(baseCoordinates.value.x) &&
        isValidNumber(baseCoordinates.value.y),
);

const x = computed(() => Number(baseCoordinates.value.x));
const y = computed(() => Number(baseCoordinates.value.y));
const linkConfig = computed(() => FINAL_CONFIG.value.link);
const boxConfig = computed(() => FINAL_CONFIG.value.box);
const dragConfig = computed(() => FINAL_CONFIG.value.drag);
const markerConfig = computed(() => FINAL_CONFIG.value.title.marker);
const overlap = computed(() => FINAL_CONFIG.value.overlap === true);
const dragEnabled = computed(() => dragConfig.value?.enable === true);

const hasClickListener = computed(() => {
    const vnodeProps = instance?.vnode?.props ?? {};
    return Boolean(vnodeProps.onClick);
});

const labelInteractive = computed(() => hasClickListener.value);

const accessibleLabel = computed(() => {
    const title = String(FINAL_CONFIG.value.title?.text ?? '').trim();
    const content = String(FINAL_CONFIG.value.content?.text ?? '').trim();
    return [title, content].filter(Boolean).join(', ') || 'Label';
});

const dragHandleAriaLabel = computed(() => `Move ${accessibleLabel.value}`);

const dragInstructionsId = `label_${uid}_drag_instructions`;
const dragInstructions = computed(
    () => FINAL_CONFIG.value.a11y.translations.keyboardNavigation,
);

const dragIconSize = computed(() =>
    isValidNumber(dragConfig.value?.iconSize)
        ? Math.max(0, Number(dragConfig.value.iconSize))
        : 0,
);

const dragIconDotSize = computed(() => dragIconSize.value * 0.15);

const dragHandlePosition = computed(() => {
    const position = dragConfig.value?.handlePosition;
    return ['left', 'right', 'top', 'bottom'].includes(position)
        ? position
        : 'left';
});

const datasetPosition = computed(() => {
    const position = props.dataset?.position;

    if (!position || !isValidNumber(position.x) || !isValidNumber(position.y)) {
        return null;
    }
    return {
        x: Number(position.x),
        y: Number(position.y),
    };
});

const effectiveDatasetPosition = computed(() =>
    ignoreDatasetPosition.value ? null : datasetPosition.value,
);

const linkLength = computed(() =>
    isValidNumber(linkConfig.value.length)
        ? Math.max(0, Number(linkConfig.value.length))
        : TARGET_GAP,
);

const titleTextAlign = computed(() =>
    normalizeTextAlign(FINAL_CONFIG.value.title.textAlign),
);

const contentTextAlign = computed(() =>
    normalizeTextAlign(FINAL_CONFIG.value.content.textAlign),
);

const titleTextAnchor = computed(() =>
    textAnchorFromAlign(titleTextAlign.value),
);
const contentTextAnchor = computed(() =>
    textAnchorFromAlign(contentTextAlign.value),
);

const markerVisible = computed(
    () =>
        markerConfig.value?.color !== null &&
        markerConfig.value?.color !== undefined &&
        String(FINAL_CONFIG.value.title.text ?? '') !== '',
);

const markerSize = computed(() =>
    markerVisible.value && isValidNumber(markerConfig.value?.size)
        ? Math.max(0, Number(markerConfig.value.size))
        : 0,
);

const markerRadius = computed(() => markerSize.value / 2);

const markerBeforeText = computed(
    () => markerConfig.value?.beforeText !== false,
);

const markerTitleGap = computed(() =>
    markerVisible.value && markerSize.value > 0 ? 6 : 0,
);
const markerReservedWidth = computed(() =>
    markerSize.value > 0 ? markerSize.value + markerTitleGap.value : 0,
);

const boxPadding = computed(() => {
    const padding = boxConfig.value.padding ?? {};

    return {
        top: isValidNumber(padding.top) ? Math.max(0, Number(padding.top)) : 0,
        right: isValidNumber(padding.right)
            ? Math.max(0, Number(padding.right))
            : 0,
        bottom: isValidNumber(padding.bottom)
            ? Math.max(0, Number(padding.bottom))
            : 0,
        left: isValidNumber(padding.left)
            ? Math.max(0, Number(padding.left))
            : 0,
    };
});

const boxBorderWidth = computed(() =>
    isValidNumber(boxConfig.value.borderWidth)
        ? Math.max(0, Number(boxConfig.value.borderWidth))
        : 0,
);

const boxBorderRadius = computed(() =>
    isValidNumber(boxConfig.value.borderRadius)
        ? Math.max(0, Number(boxConfig.value.borderRadius))
        : 0,
);

const boxMaxWidth = computed(() =>
    isValidNumber(boxConfig.value.maxWidth)
        ? Math.max(0, Number(boxConfig.value.maxWidth))
        : null,
);

const dragHandleSize = computed(() =>
    dragEnabled.value && boxConfig.value.show ? DRAG_HANDLE_WIDTH.value : 0,
);

const dragHandleIsHorizontal = computed(() =>
    ['left', 'right'].includes(dragHandlePosition.value),
);

/*
 * maxWidth is the maximum outer width of the box.
 * Left/right padding and the drag handle are removed from the available
 * text width so the complete box still respects maxWidth.
 */
const boxTextWidthLimit = computed(() => {
    if (
        !boxConfig.value.show ||
        !isValidNumber(boxMaxWidth.value) ||
        boxMaxWidth.value <= 0
    ) {
        return null;
    }
    const reservedWidth = dragHandleIsHorizontal.value
        ? dragHandleSize.value
        : 0;
    return Math.max(
        1,
        boxMaxWidth.value -
            boxPadding.value.left -
            boxPadding.value.right -
            reservedWidth,
    );
});

const titleTextWidthLimit = computed(() => {
    if (!boxTextWidthLimit.value) {
        return null;
    }
    return Math.max(1, boxTextWidthLimit.value - markerReservedWidth.value);
});

const boxShape = computed(() => {
    if (!boxConfig.value.show || !boxRect.value) {
        return null;
    }
    /*
     * Keep the stroke inside boxRect so collision and overflow calculations
     * represent the complete visible box, including its border.
     */
    const inset = boxBorderWidth.value / 2;
    const width = Math.max(0, boxRect.value.width - boxBorderWidth.value);
    const height = Math.max(0, boxRect.value.height - boxBorderWidth.value);
    return {
        x: boxRect.value.x + inset,
        y: boxRect.value.y + inset,
        width,
        height,
        rx: Math.min(boxBorderRadius.value, width / 2, height / 2),
    };
});

const dragHandleShape = computed(() => {
    if (!dragEnabled.value || !boxShape.value) {
        return null;
    }
    const position = dragHandlePosition.value;
    const isHorizontalSide = ['left', 'right'].includes(position);
    const thickness = Math.min(
        DRAG_HANDLE_WIDTH.value,
        Math.max(
            0,
            isHorizontalSide ? boxShape.value.width : boxShape.value.height,
        ),
    );
    if (
        thickness <= 0 ||
        boxShape.value.width <= 0 ||
        boxShape.value.height <= 0
    ) {
        return null;
    }
    let x = boxShape.value.x;
    let y = boxShape.value.y;
    let width = boxShape.value.width;
    let height = boxShape.value.height;
    let separatorPath = '';
    let gripPath = '';
    if (position === 'left' || position === 'right') {
        width = thickness;
        x =
            position === 'left'
                ? boxShape.value.x
                : boxShape.value.x + boxShape.value.width - thickness;

        const separatorX = position === 'left' ? x + thickness : x;
        const centerX = x + thickness / 2;
        const centerY = y + height / 2;
        separatorPath = `
            M ${separatorX} ${y}
            V ${y + height}
        `;
        const iconSize = dragIconSize.value;
        const dotRadius = dragIconDotSize.value / 2;
        const longExtent = Math.max(0, iconSize / 2 - dotRadius);
        const shortOffset = iconSize * 0.14;

        gripPath = [-0.7, 0, 0.7]
            .flatMap((ratio) => {
                const dotY = centerY + longExtent * ratio;
                return [
                    `M ${centerX - shortOffset} ${dotY} h 0`,
                    `M ${centerX + shortOffset} ${dotY} h 0`,
                ];
            })
            .join(' ');
    } else {
        height = thickness;
        y =
            position === 'top'
                ? boxShape.value.y
                : boxShape.value.y + boxShape.value.height - thickness;
        const separatorY = position === 'top' ? y + thickness : y;
        const centerX = x + width / 2;
        const centerY = y + thickness / 2;
        separatorPath = `
            M ${x} ${separatorY}
            H ${x + width}
        `;
        const iconSize = dragIconSize.value;
        const dotRadius = dragIconDotSize.value / 2;
        const longExtent = Math.max(0, iconSize / 2 - dotRadius);
        const shortOffset = iconSize * 0.14;

        gripPath = [-0.7, 0, 0.7]
            .flatMap((ratio) => {
                const dotX = centerX + longExtent * ratio;

                return [
                    `M ${dotX} ${centerY - shortOffset} h 0`,
                    `M ${dotX} ${centerY + shortOffset} h 0`,
                ];
            })
            .join(' ');
    }
    return {
        x,
        y,
        width,
        height,
        separatorPath,
        gripPath,
        position,
    };
});

const dragHitAreaShape = computed(() => {
    const shape = dragHandleShape.value;
    if (!shape) {
        return null;
    }
    const width = Math.max(MIN_INTERACTIVE_TARGET_SIZE, shape.width);
    const height = Math.max(MIN_INTERACTIVE_TARGET_SIZE, shape.height);
    let hitX = shape.x;
    let hitY = shape.y;
    /*
     * Grow the pointer target primarily away from the label body so a narrow
     * visible grip can still meet WCAG 2.2 target-size guidance without
     * stealing pointer events from the label's text/content area.
     */
    if (shape.position === 'left') {
        hitX = shape.x + shape.width - width;
    } else if (shape.position === 'top') {
        hitY = shape.y + shape.height - height;
    }

    if (shape.position === 'left' || shape.position === 'right') {
        hitY = shape.y + shape.height / 2 - height / 2;
    } else {
        hitX = shape.x + shape.width / 2 - width / 2;
    }

    return {
        x: hitX,
        y: hitY,
        width,
        height,
    };
});

const labelActionShape = computed(() => {
    if (!labelInteractive.value) {
        return null;
    }

    /*
     * Keep keyboard semantics on a dedicated, pointer-inert SVG element instead
     * of the complete label group. This prevents pointer clicks from focusing
     * the visual label while still leaving the action in the tab order.
     */
    let shape = null;

    if (boxShape.value) {
        shape = { ...boxShape.value };
    } else if (layoutRect.value) {
        shape = {
            x: layoutRect.value.x - currentOffset.value.x,
            y: layoutRect.value.y - currentOffset.value.y,
            width: layoutRect.value.width,
            height: layoutRect.value.height,
            rx: 0,
        };
    }

    if (!shape) {
        return null;
    }

    const handle = dragHandleShape.value;

    if (handle) {
        if (handle.position === 'left') {
            shape.x += handle.width;
            shape.width -= handle.width;
        } else if (handle.position === 'right') {
            shape.width -= handle.width;
        } else if (handle.position === 'top') {
            shape.y += handle.height;
            shape.height -= handle.height;
        } else {
            shape.height -= handle.height;
        }
    }

    if (shape.width <= 0 || shape.height <= 0) {
        return null;
    }
    return shape;
});

const titleLines = ref(splitExplicitLines(FINAL_CONFIG.value.title.text));
const contentLines = ref(splitExplicitLines(FINAL_CONFIG.value.content.text));
const titleMeasuredWidth = ref(0);
const contentMeasuredWidth = ref(0);
const textBlockWidth = ref(0);

const titleGroupWidth = computed(
    () => titleMeasuredWidth.value + markerReservedWidth.value,
);

const textBlockLeftX = computed(() => x.value - textBlockWidth.value / 2);
const textBlockRightX = computed(() => x.value + textBlockWidth.value / 2);

const titleGroupLeftX = computed(() => {
    if (titleTextAlign.value === 'left') {
        return textBlockLeftX.value;
    }
    if (titleTextAlign.value === 'right') {
        return textBlockRightX.value - titleGroupWidth.value;
    }
    return x.value - titleGroupWidth.value / 2;
});

const titleTextX = computed(() => {
    const textLeft =
        titleGroupLeftX.value +
        (markerBeforeText.value ? markerReservedWidth.value : 0);
    if (titleTextAlign.value === 'left') {
        return textLeft;
    }
    if (titleTextAlign.value === 'right') {
        return textLeft + titleMeasuredWidth.value;
    }
    return textLeft + titleMeasuredWidth.value / 2;
});

const markerPlot = computed(() => {
    if (!markerVisible.value || markerRadius.value <= 0) {
        return null;
    }
    const markerX = markerBeforeText.value
        ? titleGroupLeftX.value + markerRadius.value
        : titleGroupLeftX.value +
          titleMeasuredWidth.value +
          markerTitleGap.value +
          markerRadius.value;
    return {
        x: markerX,
        y: y.value - TITLE_FONT_SIZE.value * 0.35 + markerConfig.value.offsetY,
    };
});

const contentTextX = computed(() => alignedTextX(contentTextAlign.value));

const contentY = computed(() => {
    if (!titleLines.value.length) {
        return y.value;
    }
    return (
        y.value +
        titleLines.value.length * TITLE_LINE_HEIGHT.value +
        TITLE_CONTENT_GAP.value
    );
});

const computedLink = computed(() => {
    if (
        !linkConfig.value.show ||
        !validCoordinates.value ||
        !layoutRect.value
    ) {
        return null;
    }

    const rect = layoutRect.value;
    const targetX = x.value;
    const targetY = y.value;
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const deltaX = centerX - targetX;
    const deltaY = centerY - targetY;

    let endX;
    let endY;
    let side;

    const edgeInset = boxConfig.value.show
        ? Math.min(boxBorderRadius.value, rect.width / 2, rect.height / 2)
        : 0;

    const centeredOnTargetX = Math.abs(centerX - targetX) < 0.001;
    const centeredOnTargetY = Math.abs(centerY - targetY) < 0.001;

    if (Math.abs(deltaX) >= Math.abs(deltaY)) {
        if (deltaX >= 0) {
            // Label to the right of the target
            side = 'left';
            endX = rect.x;
        } else {
            // Label to the left of the target
            side = 'right';
            endX = rect.x + rect.width;
        }

        /*
         * When the label is vertically aligned with its target, attach to the
         * visual middle of the complete box. This includes top/bottom handle
         * height and asymmetric box padding. Otherwise retain the closest
         * valid projection toward the target.
         */
        endY = centeredOnTargetY
            ? centerY
            : clampNumber(
                  targetY,
                  rect.y + edgeInset,
                  rect.y + rect.height - edgeInset,
              );
    } else {
        if (deltaY >= 0) {
            // Label below the target
            side = 'top';
            endY = rect.y;
        } else {
            // Label above the target
            side = 'bottom';
            endY = rect.y + rect.height;
        }

        /*
         * When the label is horizontally aligned with its target, attach to
         * the visual middle of the complete box. layoutRect already contains
         * the extra width reserved by a left/right drag handle, so centerX is
         * the correct top/bottom link position.
         */
        endX = centeredOnTargetX
            ? centerX
            : clampNumber(
                  targetX,
                  rect.x + edgeInset,
                  rect.x + rect.width - edgeInset,
              );
    }

    return {
        d: `M ${targetX} ${targetY} L ${endX} ${endY}`,
        side,
        start: {
            x: targetX,
            y: targetY,
        },
        end: {
            x: endX,
            y: endY,
        },
    };
});

function getSvgClientPosition(clientX, clientY) {
    const svg = parentSvg.value;
    if (
        !svg?.createSVGPoint ||
        !Number.isFinite(clientX) ||
        !Number.isFinite(clientY)
    ) {
        return null;
    }
    const matrix = svg.getScreenCTM?.();
    if (!matrix) {
        return null;
    }
    const point = svg.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    try {
        const transformed = point.matrixTransform(matrix.inverse());
        if (
            !Number.isFinite(transformed.x) ||
            !Number.isFinite(transformed.y)
        ) {
            return null;
        }
        return {
            x: transformed.x,
            y: transformed.y,
        };
    } catch {
        return null;
    }
}

function getDragPayload(offset = currentOffset.value) {
    return {
        dataset: props.dataset,
        offset: {
            x: Number(offset?.x) || 0,
            y: Number(offset?.y) || 0,
        },
        rect: layoutRect.value
            ? {
                  ...layoutRect.value,
              }
            : null,
    };
}

function setDragPriority(label) {
    const svg = parentSvg.value;
    if (!svg || !label) {
        return;
    }
    if (!Number.isFinite(svg[NEXT_DRAG_PRIORITY_KEY])) {
        svg[NEXT_DRAG_PRIORITY_KEY] = 0;
    }
    svg[NEXT_DRAG_PRIORITY_KEY] += 1;
    label[DRAG_PRIORITY_KEY] = svg[NEXT_DRAG_PRIORITY_KEY];
}

function addMouseDragWindowListeners() {
    window.addEventListener('mousemove', handleMouseMove, true);
    window.addEventListener('mouseup', handleMouseUp, true);
}

function removeMouseDragWindowListeners() {
    window.removeEventListener('mousemove', handleMouseMove, true);
    window.removeEventListener('mouseup', handleMouseUp, true);
}

function addTouchDragWindowListeners() {
    window.addEventListener('touchmove', handleTouchMove, {
        capture: true,
        passive: false,
    });
    window.addEventListener('touchend', handleTouchEnd, true);
    window.addEventListener('touchcancel', handleTouchCancel, true);
}

function removeTouchDragWindowListeners() {
    window.removeEventListener('touchmove', handleTouchMove, true);
    window.removeEventListener('touchend', handleTouchEnd, true);
    window.removeEventListener('touchcancel', handleTouchCancel, true);
}

function removeDragWindowListeners() {
    removeMouseDragWindowListeners();
    removeTouchDragWindowListeners();
}

function beginDrag({ event, inputType, touchId = null, pointer }) {
    if (
        isDragging.value ||
        !dragEnabled.value ||
        !labelRef.value ||
        !parentSvg.value ||
        !pointer
    ) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    const label = labelRef.value;
    const startingOffset = {
        x: Number(currentOffset.value?.x) || 0,
        y: Number(currentOffset.value?.y) || 0,
    };

    dragState.inputType = inputType;
    dragState.touchId = touchId;
    dragState.startPointer = pointer;
    dragState.startOffset = startingOffset;
    dragState.lastRequestedOffset = startingOffset;

    isDragging.value = true;
    label[DRAGGING_KEY] = true;
    label[PERSISTED_OFFSET_KEY] = { ...startingOffset };
    label[DRAG_REQUESTED_OFFSET_KEY] = { ...startingOffset };

    /*
     * Track sibling labels displaced by this drag session. The map stores the
     * position each sibling had immediately before it was first moved.
     */
    parentSvg.value[DISPLACED_LABELS_KEY] = new Map();
    setDragPriority(label);
    if (inputType === 'mouse') {
        addMouseDragWindowListeners();
    } else {
        addTouchDragWindowListeners();
    }
    emit('dragStart', getDragPayload(startingOffset));
}

function startMouseDrag(event) {
    if (event.button !== 0) {
        return;
    }
    beginDrag({
        event,
        inputType: 'mouse',
        pointer: getSvgClientPosition(event.clientX, event.clientY),
    });
}

function startTouchDrag(event) {
    const touch = event.changedTouches?.[0] ?? event.touches?.[0];
    if (!touch) {
        return;
    }
    beginDrag({
        event,
        inputType: 'touch',
        touchId: touch.identifier,
        pointer: getSvgClientPosition(touch.clientX, touch.clientY),
    });
}

function ensureLiveRegion() {
    if (liveRegion || typeof document === 'undefined') {
        return liveRegion;
    }

    const region = document.createElement('div');
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.style.position = 'fixed';
    region.style.width = '1px';
    region.style.height = '1px';
    region.style.padding = '0';
    region.style.margin = '-1px';
    region.style.overflow = 'hidden';
    region.style.clip = 'rect(0, 0, 0, 0)';
    region.style.whiteSpace = 'nowrap';
    region.style.border = '0';
    document.body.append(region);
    liveRegion = region;

    return liveRegion;
}

function announceKeyboardPosition(position) {
    const region = ensureLiveRegion();
    if (!region) {
        return;
    }

    const xPosition = Number(position?.x) || 0;
    const yPosition = Number(position?.y) || 0;
    const format = (value) =>
        Number.isInteger(value) ? String(value) : value.toFixed(2);

    region.textContent = '';
    requestAnimationFrame(() => {
        if (liveRegion) {
            liveRegion.textContent = `${accessibleLabel.value} moved to x ${format(
                xPosition,
            )}, y ${format(yPosition)}.`;
        }
    });
}

function moveLabelByKeyboard(deltaX, deltaY) {
    const label = labelRef.value;
    const svg = parentSvg.value;

    if (isDragging.value || !dragEnabled.value || !label || !svg?.isConnected) {
        return;
    }

    const startingOffset = {
        x: Number(currentOffset.value?.x) || 0,
        y: Number(currentOffset.value?.y) || 0,
    };

    const requestedOffset = {
        x: startingOffset.x + deltaX,
        y: startingOffset.y + deltaY,
    };

    dragState.inputType = 'keyboard';
    dragState.touchId = null;
    dragState.startPointer = null;
    dragState.startOffset = startingOffset;
    dragState.lastRequestedOffset = requestedOffset;

    isDragging.value = true;
    label[DRAGGING_KEY] = true;
    label[PERSISTED_OFFSET_KEY] = { ...startingOffset };
    label[DRAG_REQUESTED_OFFSET_KEY] = { ...requestedOffset };
    svg[DISPLACED_LABELS_KEY] = new Map();
    setDragPriority(label);

    emit('dragStart', getDragPayload(startingOffset));
    emit('drag', getDragPayload(requestedOffset));

    /*
     * Resolve keyboard movement synchronously so each arrow press is a complete
     * non-dragging alternative with the same collision/bounds behavior as a
     * pointer drag.
     */
    layoutAllLabels(svg);
    finishDrag();
}

function handleDragHandleKeydown(event) {
    if (!dragEnabled.value) {
        return;
    }
    const keyDeltas = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
    };
    const direction = keyDeltas[event.key];
    if (!direction) {
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    const step = event.shiftKey ? KEYBOARD_MOVE_STEP_LARGE : KEYBOARD_MOVE_STEP;
    moveLabelByKeyboard(direction[0] * step, direction[1] * step);
}

function updateDrag(pointer, event = null) {
    if (
        !isDragging.value ||
        !dragState.startPointer ||
        !dragState.startOffset ||
        !labelRef.value ||
        !pointer
    ) {
        return;
    }
    if (event?.cancelable) {
        event.preventDefault();
    }
    const offset = {
        x: dragState.startOffset.x + (pointer.x - dragState.startPointer.x),
        y: dragState.startOffset.y + (pointer.y - dragState.startPointer.y),
    };
    dragState.lastRequestedOffset = offset;
    labelRef.value[DRAG_REQUESTED_OFFSET_KEY] = { ...offset };
    scheduleLayout(parentSvg.value);
    emit('drag', getDragPayload(offset));
}

function handleMouseMove(event) {
    if (!isDragging.value || dragState.inputType !== 'mouse') {
        return;
    }
    updateDrag(getSvgClientPosition(event.clientX, event.clientY), event);
}

function handleMouseUp(event) {
    if (!isDragging.value || dragState.inputType !== 'mouse') {
        return;
    }
    finishDrag(event);
}

function findActiveTouch(touchList) {
    if (!touchList || dragState.touchId === null) {
        return null;
    }
    for (const touch of touchList) {
        if (touch.identifier === dragState.touchId) {
            return touch;
        }
    }
    return null;
}

function handleTouchMove(event) {
    if (!isDragging.value || dragState.inputType !== 'touch') {
        return;
    }
    const touch = findActiveTouch(event.touches);
    if (!touch) {
        return;
    }
    updateDrag(getSvgClientPosition(touch.clientX, touch.clientY), event);
}

function handleTouchEnd(event) {
    if (!isDragging.value || dragState.inputType !== 'touch') {
        return;
    }
    const endedTouch = findActiveTouch(event.changedTouches);
    if (!endedTouch) {
        return;
    }
    finishDrag(event);
}

function handleTouchCancel(event) {
    if (!isDragging.value || dragState.inputType !== 'touch') {
        return;
    }
    const cancelledTouch = findActiveTouch(event.changedTouches);
    if (!cancelledTouch) {
        return;
    }
    /*
     * Safety cleanup for OS/browser-level gesture cancellation.
     * Normal touch dragging ends through touchend.
     */
    finishDrag(event);
}

function finishDrag(event = null) {
    if (!isDragging.value) {
        return;
    }
    if (event?.cancelable) {
        event.preventDefault();
    }
    const label = labelRef.value;
    const svg = parentSvg.value;
    const finishedInputType = dragState.inputType;

    /*
     * A mouse/touch move may already have scheduled a layout RAF. Cancel it
     * before resolving the release position synchronously, otherwise that RAF
     * can run after DRAGGING_KEY is cleared and move the label through the
     * normal collision solver on mouseup/touchend.
     */
    if (svg?.[RAF_KEY]) {
        cancelAnimationFrame(svg[RAF_KEY]);
        svg[RAF_KEY] = null;
    }

    /*
     * Resolve the latest requested drag position while the label is still in
     * active-drag mode. This is the exact position that must be persisted and
     * reported by dragEnd.
     */
    if (svg?.isConnected && label) {
        layoutAllLabels(svg);
    }

    const resolvedOffset = label
        ? (getPersistedOffset(label) ?? {
              x: Number(currentOffset.value?.x) || 0,
              y: Number(currentOffset.value?.y) || 0,
          })
        : {
              x: Number(currentOffset.value?.x) || 0,
              y: Number(currentOffset.value?.y) || 0,
          };

    const finalCoordinates = layoutRect.value
        ? {
              x: layoutRect.value.x,
              y: layoutRect.value.y,
          }
        : boxRect.value
          ? {
                x: boxRect.value.x + resolvedOffset.x,
                y: boxRect.value.y + resolvedOffset.y,
            }
          : {
                x: x.value + resolvedOffset.x,
                y: y.value + resolvedOffset.y,
            };

    /*
     * The final active-drag layout above has also resolved every sibling.
     * Capture their final dragEnd notifications before clearing drag state.
     */
    const displacedDragEnds = collectDisplacedDragEnds(svg, label);

    if (label) {
        /*
         * Keep the resolved offset as the persisted manual position. Only the
         * transient requested position is discarded.
         */
        label[PERSISTED_OFFSET_KEY] = {
            x: resolvedOffset.x,
            y: resolvedOffset.y,
        };
        label[DRAGGING_KEY] = false;
        delete label[DRAG_REQUESTED_OFFSET_KEY];
    }

    currentOffset.value = {
        x: resolvedOffset.x,
        y: resolvedOffset.y,
    };

    removeDragWindowListeners();

    isDragging.value = false;
    dragState.inputType = null;
    dragState.touchId = null;
    dragState.startPointer = null;
    dragState.startOffset = null;
    dragState.lastRequestedOffset = null;

    requestAnimationFrame(() => {
        if (finishedInputType !== 'keyboard') {
            moveToLastLayer();
        }
        emit('dragEnd', getPositionPayload(finalCoordinates));
        if (finishedInputType === 'keyboard') {
            announceKeyboardPosition(finalCoordinates);
        }
        for (const notification of displacedDragEnds) {
            notification.emitDragEnd(notification.position);
        }
    });
}

function getCurrentLabelPosition(offset = currentOffset.value) {
    if (layoutRect.value) {
        return {
            x: layoutRect.value.x,
            y: layoutRect.value.y,
        };
    }

    if (boxRect.value) {
        return {
            x: boxRect.value.x + (Number(offset?.x) || 0),
            y: boxRect.value.y + (Number(offset?.y) || 0),
        };
    }

    return {
        x: x.value + (Number(offset?.x) || 0),
        y: y.value + (Number(offset?.y) || 0),
    };
}

function getPositionPayload(position = getCurrentLabelPosition()) {
    return {
        ...props.dataset,
        position: {
            x: Number(position?.x) || 0,
            y: Number(position?.y) || 0,
        },
    };
}

function emitInteraction(eventName) {
    emit(eventName, getPositionPayload());
}

function handleMouseEnter() {
    moveToLastLayer();
    emitInteraction('mouseenter');
}

function handleMouseLeave() {
    emitInteraction('mouseleave');
}

function clearPointerGroupFocus() {
    if (inputModality.value !== 'pointer') {
        return;
    }

    const activeElement = document.activeElement;

    /*
     * Some browsers make clickable SVG <g> elements focusable as a default
     * pointer action even without tabindex. That focus happens after
     * pointerdown/mousedown, so clearing focus only during pointerdown is too
     * early. Blur only the visual wrapper/label groups here; do not blur real
     * interactive descendants supplied through slots.
     */
    if (
        activeElement === labelRef.value ||
        activeElement === wrapperRef.value
    ) {
        activeElement.blur?.();
    }
}

function handleClick() {
    moveToLastLayer();
    clearPointerGroupFocus();
    emitInteraction('click');
}

function handleGlobalKeydown() {
    inputModality.value = 'keyboard';
}

function handleGlobalPointerDown() {
    inputModality.value = 'pointer';
}

function handleWrapperPointerDown() {
    inputModality.value = 'pointer';

    /*
     * A keyboard-only action target can remain focused when the user switches
     * to the pointer because clicking the visual label itself is intentionally
     * non-focusable. Explicitly blur any focused target inside this label so a
     * stale keyboard focus indicator cannot remain visible after the click.
     */
    const activeElement = document.activeElement;
    const wrapper = wrapperRef.value;

    if (
        wrapper &&
        activeElement &&
        wrapper.contains(activeElement) &&
        typeof activeElement.blur === 'function'
    ) {
        activeElement.blur();
    }
}

function handleLabelKeydown(event) {
    if (!labelInteractive.value) {
        return;
    }
    if (event.key !== 'Enter' && event.key !== ' ') {
        return;
    }
    event.preventDefault();
    event.stopPropagation();
    /* Keep keyboard focus stable; pointer clicks still retain the z-order move. */
    emitInteraction('click');
}

function handleFocusIn(event) {
    const wrapper = wrapperRef.value;
    if (!wrapper || wrapper.contains(event.relatedTarget)) {
        return;
    }
    emitInteraction('focus');
}

function handleFocusOut(event) {
    const wrapper = wrapperRef.value;
    if (!wrapper || wrapper.contains(event.relatedTarget)) {
        return;
    }
    emitInteraction('blur');
}

function moveToLastLayer() {
    if (isDragging.value || !wrapperRef.value) {
        return;
    }
    const wrapper = wrapperRef.value;
    const layer = wrapper.parentElement;
    if (!layer || layer.lastElementChild === wrapper) {
        return;
    }
    layer.appendChild(wrapper);
}

function getSvgBounds(svg) {
    const viewBox = svg.viewBox?.baseVal;
    if (viewBox?.width > 0 && viewBox?.height > 0) {
        return {
            x: viewBox.x,
            y: viewBox.y,
            width: viewBox.width,
            height: viewBox.height,
        };
    }
    const rect = svg.getBoundingClientRect();
    return {
        x: 0,
        y: 0,
        width: svg.clientWidth || rect.width,
        height: svg.clientHeight || rect.height,
    };
}

function bboxToRect(bbox) {
    return {
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height,
    };
}

function expandRect(rect, { top = 0, right = 0, bottom = 0, left = 0 } = {}) {
    return {
        x: rect.x - left,
        y: rect.y - top,
        width: rect.width + left + right,
        height: rect.height + top + bottom,
    };
}

function translateRect(rect, offset) {
    return {
        x: rect.x + offset.x,
        y: rect.y + offset.y,
        width: rect.width,
        height: rect.height,
    };
}

function rectanglesOverlap(a, b, gap = 0) {
    return (
        a.x < b.x + b.width + gap &&
        a.x + a.width + gap > b.x &&
        a.y < b.y + b.height + gap &&
        a.y + a.height + gap > b.y
    );
}

function intersectionArea(a, b) {
    const width = Math.max(
        0,
        Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x),
    );
    const height = Math.max(
        0,
        Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y),
    );
    return width * height;
}

function isInsideBounds(rect, bounds, padding = 0) {
    return (
        rect.x >= bounds.x + padding &&
        rect.y >= bounds.y + padding &&
        rect.x + rect.width <= bounds.x + bounds.width - padding &&
        rect.y + rect.height <= bounds.y + bounds.height - padding
    );
}

function normalizeTextAlign(value) {
    return ['left', 'center', 'right'].includes(value) ? value : 'center';
}

function textAnchorFromAlign(align) {
    if (align === 'left') return 'start';
    if (align === 'right') return 'end';
    return 'middle';
}

function alignedTextX(align) {
    if (align === 'left') return textBlockLeftX.value;
    if (align === 'right') return textBlockRightX.value;
    return x.value;
}

function splitExplicitLines(value) {
    if (!value) return [];
    return String(value).split(/\r?\n/);
}

function estimateSvgTextWidth(value, sourceElement) {
    const text = String(value ?? '');
    if (!text) {
        return 0;
    }
    let fontSize = Number(sourceElement?.getAttribute?.('font-size'));
    if (!Number.isFinite(fontSize) || fontSize <= 0) {
        try {
            fontSize = Number.parseFloat(
                window.getComputedStyle(sourceElement).fontSize,
            );
        } catch {
            fontSize = 0;
        }
    }
    if (!Number.isFinite(fontSize) || fontSize <= 0) {
        fontSize = 12;
    }
    /*
     * Last resort fallback, to prevent a failed SVG measurement from
     * returning 0 and therefore incorrectly treating a very long line as
     * already fitting inside maxWidth.
     */
    return Array.from(text).reduce((width, character) => {
        if (/\s/u.test(character)) {
            return width + fontSize * 0.33;
        }

        if (/[ilI1.,'`:;|!]/u.test(character)) {
            return width + fontSize * 0.3;
        }

        if (/[MW@#%&]/u.test(character)) {
            return width + fontSize * 0.9;
        }

        const codePoint = character.codePointAt(0) ?? 0;
        const isWideCharacter =
            (codePoint >= 0x1100 && codePoint <= 0x11ff) ||
            (codePoint >= 0x2e80 && codePoint <= 0x9fff) ||
            (codePoint >= 0xac00 && codePoint <= 0xd7af) ||
            (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
            (codePoint >= 0x1f300 && codePoint <= 0x1faff);

        return width + fontSize * (isWideCharacter ? 1 : 0.56);
    }, 0);
}

function getSvgTextWidth(element, fallbackValue = '', sourceElement = null) {
    if (!element) {
        return estimateSvgTextWidth(fallbackValue, sourceElement);
    }
    try {
        const computedLength = element.getComputedTextLength?.();
        if (Number.isFinite(computedLength) && computedLength > 0) {
            return computedLength;
        }
    } catch {
        // Continue with another SVG-native measurement.
    }

    try {
        const bboxWidth = element.getBBox?.().width;

        if (Number.isFinite(bboxWidth) && bboxWidth > 0) {
            return bboxWidth;
        }
    } catch {
        // Continue with the screen-space fallback.
    }

    try {
        const clientWidth = element.getBoundingClientRect?.().width;
        const ctm = element.getScreenCTM?.();
        const scaleX = ctm ? Math.hypot(ctm.a, ctm.b) : 0;

        if (
            Number.isFinite(clientWidth) &&
            clientWidth > 0 &&
            Number.isFinite(scaleX) &&
            scaleX > 0
        ) {
            return clientWidth / scaleX;
        }
    } catch {
        // Fall through to the non-zero estimate.
    }

    return estimateSvgTextWidth(fallbackValue, sourceElement);
}

function createSvgTextMeasurer(sourceElement) {
    if (!sourceElement?.isConnected) {
        return null;
    }
    const parent = sourceElement.parentNode;
    if (!parent) {
        return null;
    }
    /*
     * Clone the real rendered <text> node so font-size, font-weight, class
     * selectors, inherited font-family and the surrounding SVG/viewBox
     * context are identical to the text we are actually wrapping.
     */
    const element = sourceElement.cloneNode(false);
    element.removeAttribute('id');
    element.setAttribute('opacity', '0');
    element.setAttribute('pointer-events', 'none');
    element.setAttribute('text-anchor', 'start');
    element.setAttribute('x', '0');
    element.setAttribute('y', '0');
    element.setAttribute('aria-hidden', 'true');
    parent.append(element);
    return {
        measure(value) {
            const measuredValue = String(value ?? '');
            if (!measuredValue) {
                return 0;
            }
            element.textContent = measuredValue;
            return getSvgTextWidth(element, measuredValue, sourceElement);
        },
        destroy() {
            element.remove();
        },
    };
}

function breakWordToWidth(word, width, measure) {
    if (!word) return [''];
    if (measure(word) <= width) {
        return [word];
    }
    const parts = [];
    let current = '';
    for (const character of Array.from(word)) {
        const candidate = current + character;
        if (current && measure(candidate) > width) {
            parts.push(current);
            current = character;
        } else {
            current = candidate;
        }
    }
    if (current) {
        parts.push(current);
    }
    return parts.length ? parts : [word];
}

function wrapExplicitLine(line, width, measure) {
    if (line === '') {
        return [''];
    }
    if (measure(line) <= width) {
        return [line];
    }
    const words = line.trim().split(/\s+/).filter(Boolean);
    if (!words.length) {
        return [''];
    }
    const lines = [];
    let current = '';
    for (const word of words) {
        const wordParts = breakWordToWidth(word, width, measure);
        for (const part of wordParts) {
            const candidate = current ? `${current} ${part}` : part;
            if (!current || measure(candidate) <= width) {
                current = candidate;
                continue;
            }
            lines.push(current);
            current = part;
        }
    }
    if (current) {
        lines.push(current);
    }
    return lines.length ? lines : [''];
}

function wrapText(value, width, sourceElement) {
    const explicitLines = splitExplicitLines(value);
    if (!explicitLines.length || !isValidNumber(width) || width <= 0) {
        return explicitLines;
    }
    const measurer = createSvgTextMeasurer(sourceElement);
    if (!measurer) {
        return explicitLines;
    }
    try {
        return explicitLines.flatMap((line) =>
            wrapExplicitLine(line, width, measurer.measure),
        );
    } finally {
        measurer.destroy();
    }
}

function measureMaxLineWidth(lines, sourceElement) {
    if (!lines.length) return 0;
    const measurer = createSvgTextMeasurer(sourceElement);
    if (!measurer) return 0;
    try {
        return lines.reduce(
            (maxWidth, line) => Math.max(maxWidth, measurer.measure(line)),
            0,
        );
    } finally {
        measurer.destroy();
    }
}

function measureRenderedMaxLineWidth(textElement) {
    if (!textElement) {
        return 0;
    }
    const tspans = Array.from(textElement.querySelectorAll('tspan'));
    if (!tspans.length) {
        return getSvgTextWidth(
            textElement,
            textElement.textContent ?? '',
            textElement,
        );
    }
    return tspans.reduce(
        (maxWidth, tspan) =>
            Math.max(
                maxWidth,
                getSvgTextWidth(tspan, tspan.textContent ?? '', textElement),
            ),
        0,
    );
}

function getCorrectedWrapWidth(currentWidth, actualWidth, limit) {
    if (
        !isValidNumber(currentWidth) ||
        !isValidNumber(actualWidth) ||
        !isValidNumber(limit) ||
        currentWidth <= 0 ||
        actualWidth <= limit
    ) {
        return currentWidth;
    }
    /*
     * If the temporary measurer under-estimated the rendered width, reduce
     * its wrapping budget proportionally, with a small safety margin.
     */
    const ratio = limit / actualWidth;
    return Math.max(1, currentWidth * ratio * 0.985);
}

function updateTextBlockWidth() {
    const renderedTitleWidth = measureRenderedMaxLineWidth(titleTextRef.value);
    const renderedContentWidth = measureRenderedMaxLineWidth(
        contentTextRef.value,
    );

    titleMeasuredWidth.value =
        renderedTitleWidth ||
        measureMaxLineWidth(titleLines.value, titleTextRef.value);

    contentMeasuredWidth.value =
        renderedContentWidth ||
        measureMaxLineWidth(contentLines.value, contentTextRef.value);

    textBlockWidth.value = Math.max(
        titleMeasuredWidth.value + markerReservedWidth.value,
        contentMeasuredWidth.value,
        0,
    );
}

async function updateWrappedLines() {
    await nextTick();
    const width = boxTextWidthLimit.value;
    if (!width) {
        titleLines.value = splitExplicitLines(FINAL_CONFIG.value.title.text);
        contentLines.value = splitExplicitLines(
            FINAL_CONFIG.value.content.text,
        );
        await nextTick();
        updateTextBlockWidth();
        await nextTick();
        scheduleLayout();
        return;
    }

    const titleLimit = titleTextWidthLimit.value ?? width;
    const contentLimit = width;

    let titleWrapWidth = titleLimit;
    let contentWrapWidth = contentLimit;
    /*
     * Normally one pass is enough. The additional passes protect maxWidth
     * against browser/font/SVG measurement discrepancies by checking the
     * widths of the ACTUAL rendered tspans and tightening the wrapping budget
     * only when necessary.
     */
    const MAX_WRAP_PASSES = 8;

    for (let pass = 0; pass < MAX_WRAP_PASSES; pass += 1) {
        titleLines.value = wrapText(
            FINAL_CONFIG.value.title.text,
            titleWrapWidth,
            titleTextRef.value,
        );

        contentLines.value = wrapText(
            FINAL_CONFIG.value.content.text,
            contentWrapWidth,
            contentTextRef.value,
        );

        await nextTick();

        const renderedTitleWidth = measureRenderedMaxLineWidth(
            titleTextRef.value,
        );

        const renderedContentWidth = measureRenderedMaxLineWidth(
            contentTextRef.value,
        );

        const titleFits =
            !FINAL_CONFIG.value.title.text ||
            renderedTitleWidth <= titleLimit + 0.25;

        const contentFits =
            !FINAL_CONFIG.value.content.text ||
            renderedContentWidth <= contentLimit + 0.25;

        if (titleFits && contentFits) {
            break;
        }

        if (!titleFits) {
            titleWrapWidth = getCorrectedWrapWidth(
                titleWrapWidth,
                renderedTitleWidth,
                titleLimit,
            );
        }

        if (!contentFits) {
            contentWrapWidth = getCorrectedWrapWidth(
                contentWrapWidth,
                renderedContentWidth,
                contentLimit,
            );
        }
    }

    updateTextBlockWidth();

    await nextTick();
    scheduleLayout();
}

function clampOffsetToBounds(baseRect, offset, bounds) {
    const minX = bounds.x + BOUNDARY_PADDING - baseRect.x;
    const maxX =
        bounds.x +
        bounds.width -
        BOUNDARY_PADDING -
        (baseRect.x + baseRect.width);

    const minY = bounds.y + BOUNDARY_PADDING - baseRect.y;
    const maxY =
        bounds.y +
        bounds.height -
        BOUNDARY_PADDING -
        (baseRect.y + baseRect.height);

    let offsetX;
    let offsetY;

    if (minX <= maxX) {
        offsetX = clampNumber(offset.x, minX, maxX);
    } else {
        offsetX =
            bounds.x + bounds.width / 2 - (baseRect.x + baseRect.width / 2);
    }
    if (minY <= maxY) {
        offsetY = clampNumber(offset.y, minY, maxY);
    } else {
        offsetY =
            bounds.y + bounds.height / 2 - (baseRect.y + baseRect.height / 2);
    }
    return {
        x: offsetX,
        y: offsetY,
    };
}

function createCandidates(baseRect, obstacles) {
    const candidates = [
        {
            x: 0,
            y: 0,
            direction: 'none',
        },
    ];
    const ownCenterX = baseRect.x + baseRect.width / 2;
    const ownCenterY = baseRect.y + baseRect.height / 2;
    for (const obstacle of obstacles) {
        const obstacleGap = isValidNumber(obstacle.gap)
            ? Math.max(0, Number(obstacle.gap))
            : COLLISION_GAP.value;
        const obstacleCenterX = obstacle.x + obstacle.width / 2;
        const obstacleCenterY = obstacle.y + obstacle.height / 2;
        const topY = obstacle.y - obstacleGap - (baseRect.y + baseRect.height);
        const bottomY = obstacle.y + obstacle.height + obstacleGap - baseRect.y;
        const leftX = obstacle.x - obstacleGap - (baseRect.x + baseRect.width);
        const rightX = obstacle.x + obstacle.width + obstacleGap - baseRect.x;

        candidates.push(
            {
                x: 0,
                y: topY,
                direction: 'top',
            },
            {
                x: 0,
                y: bottomY,
                direction: 'bottom',
            },
            {
                x: leftX,
                y: 0,
                direction: 'left',
            },
            {
                x: rightX,
                y: 0,
                direction: 'right',
            },
            {
                x: obstacleCenterX - ownCenterX,
                y: topY,
                direction: 'top',
            },
            {
                x: obstacleCenterX - ownCenterX,
                y: bottomY,
                direction: 'bottom',
            },
            {
                x: leftX,
                y: obstacleCenterY - ownCenterY,
                direction: 'left',
            },
            {
                x: rightX,
                y: obstacleCenterY - ownCenterY,
                direction: 'right',
            },
        );
    }

    const stepX = Math.max(baseRect.width * 0.5 + COLLISION_GAP.value, 12);
    const stepY = Math.max(baseRect.height * 0.5 + COLLISION_GAP.value, 12);

    for (let ring = 1; ring <= MAX_SEARCH_RINGS; ring += 1) {
        const offsetX = stepX * ring;
        const offsetY = stepY * ring;

        candidates.push(
            {
                x: 0,
                y: -offsetY,
                direction: 'top',
            },
            {
                x: -offsetX,
                y: -offsetY,
                direction: 'top',
            },
            {
                x: offsetX,
                y: -offsetY,
                direction: 'top',
            },

            {
                x: 0,
                y: offsetY,
                direction: 'bottom',
            },
            {
                x: -offsetX,
                y: offsetY,
                direction: 'bottom',
            },
            {
                x: offsetX,
                y: offsetY,
                direction: 'bottom',
            },

            {
                x: -offsetX,
                y: 0,
                direction: 'left',
            },
            {
                x: -offsetX,
                y: -offsetY,
                direction: 'left',
            },
            {
                x: -offsetX,
                y: offsetY,
                direction: 'left',
            },

            {
                x: offsetX,
                y: 0,
                direction: 'right',
            },
            {
                x: offsetX,
                y: -offsetY,
                direction: 'right',
            },
            {
                x: offsetX,
                y: offsetY,
                direction: 'right',
            },
        );
    }
    return candidates;
}

function deduplicateCandidates(candidates) {
    const seen = new Set();
    return candidates.filter((candidate) => {
        const key = [candidate.x.toFixed(3), candidate.y.toFixed(3)].join(':');
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

function scoreCandidate(candidate, preferredPosition, bounds) {
    if (candidate.preferred) {
        return -Number.MAX_SAFE_INTEGER;
    }
    const distance = Math.hypot(candidate.x, candidate.y);
    if (
        preferredPosition === 'auto' ||
        candidate.direction === 'none' ||
        candidate.direction === preferredPosition
    ) {
        return distance;
    }
    const preferencePenalty = Math.max(bounds.width, bounds.height) * 2;
    return distance + preferencePenalty;
}

function collidesWithHardObstacle(rect, hardObstacles) {
    return hardObstacles.some((obstacle) => {
        const gap = isValidNumber(obstacle.gap)
            ? Math.max(0, Number(obstacle.gap))
            : TARGET_GAP;
        return rectanglesOverlap(rect, obstacle, gap);
    });
}

function getObstacleExclusionRect(obstacle) {
    const gap = isValidNumber(obstacle?.gap)
        ? Math.max(0, Number(obstacle.gap))
        : TARGET_GAP;
    return {
        x: obstacle.x - gap,
        y: obstacle.y - gap,
        width: obstacle.width + gap * 2,
        height: obstacle.height + gap * 2,
    };
}

function resolveDraggedOffset({
    baseRect,
    requestedOffset,
    previousOffset = null,
    hardObstacles,
    bounds,
    overflow,
}) {
    let offset = {
        x: isValidNumber(requestedOffset?.x) ? Number(requestedOffset.x) : 0,
        y: isValidNumber(requestedOffset?.y) ? Number(requestedOffset.y) : 0,
    };
    /*
     * overflow=false remains a normal drag constraint. The target remains
     * the harder constraint, so if both are geometrically impossible at an
     * SVG edge, avoiding the target wins.
     */
    if (!overflow) {
        offset = clampOffsetToBounds(baseRect, offset, bounds);
    }
    for (const obstacle of hardObstacles) {
        const exclusion = getObstacleExclusionRect(obstacle);
        const rect = translateRect(baseRect, offset);
        if (!rectanglesOverlap(rect, exclusion)) {
            continue;
        }
        /*
         * Project the requested box to the closest side of the exclusion
         * rectangle instead of sending it through the normal candidate
         * search. This makes the label "slide" against the target boundary
         * while the mouse/touch continues moving.
         */
        const candidates = [
            {
                x: offset.x + exclusion.x - (rect.x + rect.width),
                y: offset.y,
            },
            {
                x: offset.x + exclusion.x + exclusion.width - rect.x,
                y: offset.y,
            },
            {
                x: offset.x,
                y: offset.y + exclusion.y - (rect.y + rect.height),
            },
            {
                x: offset.x,
                y: offset.y + exclusion.y + exclusion.height - rect.y,
            },
        ];

        const inBoundsCandidates = overflow
            ? candidates
            : candidates.filter((candidate) =>
                  isInsideBounds(
                      translateRect(baseRect, candidate),
                      bounds,
                      BOUNDARY_PADDING,
                  ),
              );

        const pool = inBoundsCandidates.length
            ? inBoundsCandidates
            : candidates;

        pool.sort((a, b) => {
            const distanceA = Math.hypot(a.x - offset.x, a.y - offset.y);
            const distanceB = Math.hypot(b.x - offset.x, b.y - offset.y);
            if (distanceA !== distanceB) {
                return distanceA - distanceB;
            }
            /*
             * When two sides are equally close, remain on the side the label
             * occupied on the previous layout pass. This avoids side-flipping
             * while the pointer crosses the target.
             */
            if (previousOffset) {
                const previousDistanceA = Math.hypot(
                    a.x - previousOffset.x,
                    a.y - previousOffset.y,
                );
                const previousDistanceB = Math.hypot(
                    b.x - previousOffset.x,
                    b.y - previousOffset.y,
                );

                return previousDistanceA - previousDistanceB;
            }

            return 0;
        });
        offset = pool[0] ?? offset;
    }
    return offset;
}

function findBestOffset({
    baseRect,
    occupiedRects,
    hardObstacles,
    bounds,
    position,
    overflow,
    preferredOffset = null,
    ignoreOccupied = false,
}) {
    const allObstacles = ignoreOccupied
        ? [...hardObstacles]
        : [...occupiedRects, ...hardObstacles];
    let candidates = createCandidates(baseRect, allObstacles);

    if (
        preferredOffset &&
        isValidNumber(preferredOffset.x) &&
        isValidNumber(preferredOffset.y)
    ) {
        candidates.unshift({
            x: Number(preferredOffset.x),
            y: Number(preferredOffset.y),
            direction: 'manual',
            preferred: true,
        });
    }
    if (!overflow) {
        candidates = candidates.map((candidate) => {
            const clamped = clampOffsetToBounds(baseRect, candidate, bounds);
            return {
                ...candidate,
                x: clamped.x,
                y: clamped.y,
            };
        });
    }
    candidates = deduplicateCandidates(candidates);
    candidates.sort(
        (a, b) =>
            scoreCandidate(a, position, bounds) -
            scoreCandidate(b, position, bounds),
    );
    function isValidCandidate(candidate) {
        const rect = translateRect(baseRect, candidate);

        if (!overflow && !isInsideBounds(rect, bounds, BOUNDARY_PADDING)) {
            return false;
        }

        if (collidesWithHardObstacle(rect, hardObstacles)) {
            return false;
        }

        if (
            !ignoreOccupied &&
            occupiedRects.some((occupied) =>
                rectanglesOverlap(rect, occupied, COLLISION_GAP.value),
            )
        ) {
            return false;
        }

        return true;
    }

    /*
     * First find a location which:
     * - does not overlap the target coordinates
     * - does not overlap another label
     * - stays within the SVG when overflow=false
     *
     * Once the normal solver has selected a valid side, try to center the
     * full expanded box exactly against its own target on the perpendicular
     * axis
     */
    for (const candidate of candidates) {
        if (!isValidCandidate(candidate)) {
            continue;
        }

        if (
            !candidate.preferred &&
            ['top', 'bottom', 'left', 'right'].includes(candidate.direction) &&
            hardObstacles.length
        ) {
            const target = hardObstacles[0];
            const targetCenterX = target.x + target.width / 2;
            const targetCenterY = target.y + target.height / 2;
            const baseCenterX = baseRect.x + baseRect.width / 2;
            const baseCenterY = baseRect.y + baseRect.height / 2;

            const centeredCandidate = {
                ...candidate,
            };

            if (
                candidate.direction === 'top' ||
                candidate.direction === 'bottom'
            ) {
                /*
                 * Exact condition after translation:
                 * finalRect.x + finalRect.width / 2 === targetCenterX
                 */
                centeredCandidate.x = targetCenterX - baseCenterX;
            } else {
                /*
                 * Exact condition after translation:
                 * finalRect.y + finalRect.height / 2 === targetCenterY
                 */
                centeredCandidate.y = targetCenterY - baseCenterY;
            }

            if (isValidCandidate(centeredCandidate)) {
                return centeredCandidate;
            }
        }

        return candidate;
    }

    /*
     * If labels are too dense, overlapping another label is preferable
     * to overlapping this label's target point
     */
    let bestCandidate = null;
    let bestOverlap = Infinity;
    let bestScore = Infinity;

    for (const candidate of candidates) {
        const rect = translateRect(baseRect, candidate);
        if (!overflow && !isInsideBounds(rect, bounds, BOUNDARY_PADDING)) {
            continue;
        }
        if (collidesWithHardObstacle(rect, hardObstacles)) {
            continue;
        }
        const overlap = ignoreOccupied
            ? 0
            : occupiedRects.reduce(
                  (total, occupied) => total + intersectionArea(rect, occupied),
                  0,
              );
        const score = scoreCandidate(candidate, position, bounds);
        if (
            overlap < bestOverlap ||
            (overlap === bestOverlap && score < bestScore)
        ) {
            bestOverlap = overlap;
            bestScore = score;
            bestCandidate = candidate;
        }
    }
    if (bestCandidate) {
        return bestCandidate;
    }
    /*
     * Geometrically pathological case:
     *
     * If the SVG is too small to contain the label without covering its
     * target, the target remains the hard constraint. Allow overflow as a
     * last resort rather than covering props.coordinates.
     */
    const emergencyCandidates = deduplicateCandidates(
        createCandidates(baseRect, hardObstacles),
    ).sort(
        (a, b) =>
            scoreCandidate(a, position, bounds) -
            scoreCandidate(b, position, bounds),
    );
    for (const candidate of emergencyCandidates) {
        const rect = translateRect(baseRect, candidate);
        if (!collidesWithHardObstacle(rect, hardObstacles)) {
            return candidate;
        }
    }
    return {
        x: 0,
        y: 0,
        direction: 'none',
    };
}

function getStoredOffset(label, key) {
    const offset = label?.[key];
    if (!offset || !isValidNumber(offset.x) || !isValidNumber(offset.y)) {
        return null;
    }
    return {
        x: Number(offset.x),
        y: Number(offset.y),
    };
}

function getPersistedOffset(label) {
    return getStoredOffset(label, PERSISTED_OFFSET_KEY);
}

function getRequestedDragOffset(label) {
    return getStoredOffset(label, DRAG_REQUESTED_OFFSET_KEY);
}

function getDatasetPosition(label) {
    const rawX = label?.dataset?.boxPositionX;
    const rawY = label?.dataset?.boxPositionY;
    if (
        rawX === '' ||
        rawY === '' ||
        !isValidNumber(rawX) ||
        !isValidNumber(rawY)
    ) {
        return null;
    }
    return {
        x: Number(rawX),
        y: Number(rawY),
    };
}

function getDragPriority(label) {
    return Number.isFinite(label?.[DRAG_PRIORITY_KEY])
        ? label[DRAG_PRIORITY_KEY]
        : -1;
}

function getLabels(svg) {
    const labels = [...svg.querySelectorAll('.vue-ui-label')].filter(
        (element) => element.ownerSVGElement === svg,
    );
    if (!Number.isFinite(svg[NEXT_ORDER_KEY])) {
        svg[NEXT_ORDER_KEY] = 0;
    }
    for (const label of labels) {
        if (!Number.isFinite(label[LAYOUT_ORDER_KEY])) {
            label[LAYOUT_ORDER_KEY] = svg[NEXT_ORDER_KEY];
            svg[NEXT_ORDER_KEY] += 1;
        }
    }
    return labels.sort((a, b) => a[LAYOUT_ORDER_KEY] - b[LAYOUT_ORDER_KEY]);
}

function getTargetObstacle(label) {
    const targetX = Number(label.dataset.targetX);
    const targetY = Number(label.dataset.targetY);
    if (!Number.isFinite(targetX) || !Number.isFinite(targetY)) {
        return null;
    }
    const configuredLength = isValidNumber(label.dataset.linkLength)
        ? Math.max(0, Number(label.dataset.linkLength))
        : TARGET_GAP;
    /*
     * A zero-size rectangle represents the target point. Its gap controls
     * the minimum distance from the target to the label edge, which is also
     * the minimum visible link length.
     */
    return {
        x: targetX,
        y: targetY,
        width: 0,
        height: 0,
        gap: configuredLength,
    };
}

function setElementLayoutRect(label, rect, baseRect = null, offset = null) {
    const setter = label?.[SET_LAYOUT_RECT_KEY];
    if (typeof setter === 'function') {
        setter({
            layoutRect: rect,
            boxRect: baseRect,
            offset,
        });
    }
}

function positionsDiffer(a, b, epsilon = 0.001) {
    if (!a || !b) {
        return false;
    }
    return (
        Math.abs(Number(a.x) - Number(b.x)) > epsilon ||
        Math.abs(Number(a.y) - Number(b.y)) > epsilon
    );
}

function trackDisplacedLabel(svg, label, previousRect, finalRect, offset) {
    if (
        !svg ||
        !label ||
        !previousRect ||
        !finalRect ||
        !positionsDiffer(previousRect, finalRect)
    ) {
        return;
    }
    let displacedLabels = svg[DISPLACED_LABELS_KEY];
    if (!(displacedLabels instanceof Map)) {
        displacedLabels = new Map();
        svg[DISPLACED_LABELS_KEY] = displacedLabels;
    }
    if (!displacedLabels.has(label)) {
        displacedLabels.set(label, {
            x: previousRect.x,
            y: previousRect.y,
        });
    }
    label[LAST_LAYOUT_OFFSET_KEY] = {
        x: Number(offset?.x) || 0,
        y: Number(offset?.y) || 0,
    };
}

function collectDisplacedDragEnds(svg, activeLabel) {
    const displacedLabels = svg?.[DISPLACED_LABELS_KEY];
    if (!(displacedLabels instanceof Map)) {
        return [];
    }
    const notifications = [];
    for (const [label, initialPosition] of displacedLabels.entries()) {
        if (!label?.isConnected || label === activeLabel) {
            continue;
        }
        const finalRect = label[LAST_LAYOUT_RECT_KEY];
        const finalOffset = label[LAST_LAYOUT_OFFSET_KEY];
        const emitDragEnd = label[EMIT_DRAG_END_KEY];
        if (
            !finalRect ||
            !positionsDiffer(initialPosition, finalRect) ||
            typeof emitDragEnd !== 'function'
        ) {
            continue;
        }
        /*
         * Keep the automatically displaced position stable even before the
         * parent feeds the emitted dataset.position back into this instance.
         */
        if (finalOffset) {
            label[PERSISTED_OFFSET_KEY] = {
                x: Number(finalOffset.x) || 0,
                y: Number(finalOffset.y) || 0,
            };
        }
        notifications.push({
            emitDragEnd,
            position: {
                x: finalRect.x,
                y: finalRect.y,
            },
        });
    }
    displacedLabels.clear();
    delete svg[DISPLACED_LABELS_KEY];
    return notifications;
}

function canKeepDragTimeOffset({
    baseRect,
    offset,
    occupiedRects,
    hardObstacles,
    bounds,
    overflow,
    ignoreOccupied = false,
}) {
    if (!offset) {
        return false;
    }

    const rect = translateRect(baseRect, offset);

    if (!overflow && !isInsideBounds(rect, bounds, BOUNDARY_PADDING)) {
        return false;
    }

    if (collidesWithHardObstacle(rect, hardObstacles)) {
        return false;
    }

    /*
     * During an active drag, do not move a sibling merely because it is
     * inside COLLISION_GAP of another label. Dynamic displacement should only
     * begin when the visible rectangles actually intersect.
     *
     * Once an actual collision occurs, findBestOffset() still uses
     * COLLISION_GAP when selecting the replacement position.
     */
    if (
        !ignoreOccupied &&
        occupiedRects.some((occupied) => rectanglesOverlap(rect, occupied, 0))
    ) {
        return false;
    }

    return true;
}

function layoutAllLabels(svg) {
    if (!svg?.isConnected) return;
    const labels = getLabels(svg);
    if (!labels.length) return;
    const bounds = getSvgBounds(svg);
    for (const label of labels) {
        label.setAttribute('transform', 'translate(0 0)');
    }
    const records = [];
    for (const label of labels) {
        const measureElement = label[MEASURE_ELEMENT_KEY] ?? label;
        let bbox;
        try {
            bbox = measureElement.getBBox();
        } catch {
            setElementLayoutRect(label, null, null, null);
            continue;
        }
        if (
            !Number.isFinite(bbox.x) ||
            !Number.isFinite(bbox.y) ||
            !Number.isFinite(bbox.width) ||
            !Number.isFinite(bbox.height) ||
            bbox.width <= 0 ||
            bbox.height <= 0
        ) {
            setElementLayoutRect(label, null, null, null);
            continue;
        }

        const contentRect = bboxToRect(bbox);
        const boxShow = label.dataset.boxShow === 'true';
        const padding = {
            top: isValidNumber(label.dataset.boxPaddingTop)
                ? Math.max(0, Number(label.dataset.boxPaddingTop))
                : 0,
            right: isValidNumber(label.dataset.boxPaddingRight)
                ? Math.max(0, Number(label.dataset.boxPaddingRight))
                : 0,
            bottom: isValidNumber(label.dataset.boxPaddingBottom)
                ? Math.max(0, Number(label.dataset.boxPaddingBottom))
                : 0,
            left: isValidNumber(label.dataset.boxPaddingLeft)
                ? Math.max(0, Number(label.dataset.boxPaddingLeft))
                : 0,
        };

        let baseRect = boxShow ? expandRect(contentRect, padding) : contentRect;

        const labelBoxMaxWidth =
            boxShow &&
            isValidNumber(label.dataset.boxMaxWidth) &&
            Number(label.dataset.boxMaxWidth) > 0
                ? Number(label.dataset.boxMaxWidth)
                : null;

        const labelDragEnabled = label.dataset.dragEnabled === 'true';
        const rawDragHandlePosition = label.dataset.dragHandlePosition;
        const labelDragHandlePosition = [
            'left',
            'right',
            'top',
            'bottom',
        ].includes(rawDragHandlePosition)
            ? rawDragHandlePosition
            : 'right';

        const labelDragHandleSize =
            boxShow &&
            labelDragEnabled &&
            isValidNumber(label.dataset.dragHandleSize)
                ? Math.max(0, Number(label.dataset.dragHandleSize))
                : 0;

        if (labelDragHandleSize > 0) {
            /*
             * The handle reserves layout space on its configured side.
             * This keeps the visible box, collision geometry, overflow checks,
             * and link attachment in sync with the handle.
             */
            if (labelDragHandlePosition === 'left') {
                baseRect = {
                    ...baseRect,
                    x: baseRect.x - labelDragHandleSize,
                    width: baseRect.width + labelDragHandleSize,
                };
            } else if (labelDragHandlePosition === 'right') {
                baseRect = {
                    ...baseRect,
                    width: baseRect.width + labelDragHandleSize,
                };
            } else if (labelDragHandlePosition === 'top') {
                baseRect = {
                    ...baseRect,
                    y: baseRect.y - labelDragHandleSize,
                    height: baseRect.height + labelDragHandleSize,
                };
            } else {
                baseRect = {
                    ...baseRect,
                    height: baseRect.height + labelDragHandleSize,
                };
            }
        }

        /*
         * maxWidth is an OUTER-box invariant, not merely a wrapping hint.
         * Wrapping should normally make this a no-op. If SVG text metrics ever
         * fail or a single glyph is wider than the available text budget, this
         * guard still prevents the published/rendered box geometry from
         * exceeding box.maxWidth.
         */
        if (labelBoxMaxWidth !== null && baseRect.width > labelBoxMaxWidth) {
            const centerX = baseRect.x + baseRect.width / 2;

            baseRect = {
                ...baseRect,
                x: centerX - labelBoxMaxWidth / 2,
                width: labelBoxMaxWidth,
            };
        }

        records.push({
            label,
            baseRect,
            boxShow,
            position: label.dataset.position || 'auto',
            overflow: label.dataset.overflow === 'true',
            overlap: label.dataset.overlap === 'true',
            dragHandlePosition: labelDragHandlePosition,
            dragHandleSize: labelDragHandleSize,
            targetObstacle: getTargetObstacle(label),
            persistedOffset: getPersistedOffset(label),
            datasetPosition: getDatasetPosition(label),
            requestedDragOffset: getRequestedDragOffset(label),
            dragging: label[DRAGGING_KEY] === true,
            dragPriority: getDragPriority(label),
        });
    }

    /*
     * The actively dragged label owns its requested position. Persisted labels
     * are then placed by most-recent drag priority, and untouched labels keep
     * their original stable layout order.
     */
    records.sort((a, b) => {
        if (a.dragging !== b.dragging) {
            return a.dragging ? -1 : 1;
        }
        const aPersisted = !!a.datasetPosition || !!a.persistedOffset;
        const bPersisted = !!b.datasetPosition || !!b.persistedOffset;
        if (aPersisted !== bPersisted) {
            return aPersisted ? -1 : 1;
        }
        if (aPersisted && bPersisted && a.dragPriority !== b.dragPriority) {
            return b.dragPriority - a.dragPriority;
        }
        return a.label[LAYOUT_ORDER_KEY] - b.label[LAYOUT_ORDER_KEY];
    });

    const hasActiveDrag = records.some((record) => record.dragging);
    const activeDragAllowsOverlap = records.some(
        (record) => record.dragging && record.overlap,
    );

    const occupiedRects = [];

    for (const record of records) {
        const hardObstacles = record.targetObstacle
            ? [record.targetObstacle]
            : [];
        let offset;
        if (record.dragging) {
            offset = resolveDraggedOffset({
                baseRect: record.baseRect,
                requestedOffset:
                    record.requestedDragOffset ?? record.persistedOffset,
                previousOffset: record.persistedOffset,
                hardObstacles,
                bounds,
                overflow: record.overflow,
            });
        } else if (
            hasActiveDrag &&
            (activeDragAllowsOverlap || record.overlap) &&
            record.label[LAST_LAYOUT_OFFSET_KEY]
        ) {
            /*
             * If the actively dragged label allows overlap, no sibling should
             * be dynamically repositioned because of that drag. Similarly, a
             * sibling that itself allows overlap should never be pushed away
             * by another label, and its exact pre-drag transform must be preserved
             */
            offset = {
                x: Number(record.label[LAST_LAYOUT_OFFSET_KEY].x) || 0,
                y: Number(record.label[LAST_LAYOUT_OFFSET_KEY].y) || 0,
                direction: 'overlap',
            };
        } else if (!hasActiveDrag && record.datasetPosition) {
            /*
             * dataset.position is the persisted OUTER BOX top-left in SVG
             * coordinates. baseRect is the untransformed outer box, so this
             * conversion reproduces the exact transform used at drag release.
             */
            offset = {
                x: record.datasetPosition.x - record.baseRect.x,
                y: record.datasetPosition.y - record.baseRect.y,
                direction: 'manual',
            };
        } else if (!hasActiveDrag && record.persistedOffset) {
            /*
             * If dataset.position is null, keep the existing mounted-instance
             * persistence behavior after a drag.
             */
            offset = {
                x: Number(record.persistedOffset.x) || 0,
                y: Number(record.persistedOffset.y) || 0,
                direction: 'manual',
            };
        } else {
            const currentOffset = record.label[LAST_LAYOUT_OFFSET_KEY];

            /*
             * During another label's active drag, preserve this sibling's
             * exact current transform whenever it is still valid.
             *
             * Previously every sibling was re-solved on every drag frame.
             * That allowed findBestOffset() to choose a different automatic
             * candidate even when the dragged label was nowhere near it.
             */
            if (
                hasActiveDrag &&
                currentOffset &&
                canKeepDragTimeOffset({
                    baseRect: record.baseRect,
                    offset: currentOffset,
                    occupiedRects,
                    hardObstacles,
                    bounds,
                    overflow: record.overflow,
                    ignoreOccupied: record.overlap,
                })
            ) {
                offset = {
                    x: Number(currentOffset.x) || 0,
                    y: Number(currentOffset.y) || 0,
                    direction: 'stable',
                };
            } else {
                /*
                 * Reposition only when the current transform is genuinely no
                 * longer valid (actual label intersection, target exclusion,
                 * or SVG bounds). The replacement position still honors the
                 * configured collisionGap.
                 */
                offset = findBestOffset({
                    baseRect: record.baseRect,
                    occupiedRects,
                    hardObstacles,
                    bounds,
                    position: record.position,
                    overflow: record.overflow,
                    preferredOffset:
                        record.persistedOffset ??
                        (record.datasetPosition
                            ? {
                                  x:
                                      record.datasetPosition.x -
                                      record.baseRect.x,
                                  y:
                                      record.datasetPosition.y -
                                      record.baseRect.y,
                              }
                            : (currentOffset ?? null)),
                    ignoreOccupied: record.overlap,
                });
            }
        }

        record.label.setAttribute(
            'transform',
            `translate(${offset.x} ${offset.y})`,
        );

        const finalRect = translateRect(record.baseRect, offset);
        const previousRect = record.label[LAST_LAYOUT_RECT_KEY];

        if (
            hasActiveDrag &&
            !activeDragAllowsOverlap &&
            !record.dragging &&
            !record.overlap
        ) {
            trackDisplacedLabel(
                svg,
                record.label,
                previousRect,
                finalRect,
                offset,
            );
        }

        /*
         * A dragged/persisted label keeps the final offset selected. If another dragged label pushes it away later, that
         * new resolved position becomes its new persisted preference.
         */
        if (
            record.datasetPosition ||
            record.persistedOffset ||
            record.dragging
        ) {
            record.label[PERSISTED_OFFSET_KEY] = {
                x: offset.x,
                y: offset.y,
            };
        }

        record.label[LAST_LAYOUT_RECT_KEY] = {
            x: finalRect.x,
            y: finalRect.y,
            width: finalRect.width,
            height: finalRect.height,
        };

        record.label[LAST_LAYOUT_OFFSET_KEY] = {
            x: Number(offset.x) || 0,
            y: Number(offset.y) || 0,
        };

        setElementLayoutRect(
            record.label,
            finalRect,
            record.boxShow ? record.baseRect : null,
            offset,
        );

        /*
         * Only labels that disallow overlap participate as label-to-label
         * obstacles. If either side allows overlap, the pair may intersect.
         */
        if (!record.overlap) {
            occupiedRects.push(finalRect);
        }
    }
}

function scheduleLayout(svg = parentSvg.value) {
    if (!svg?.isConnected) return;
    if (svg[RAF_KEY]) {
        return;
    }
    svg[RAF_KEY] = requestAnimationFrame(() => {
        svg[RAF_KEY] = null;
        layoutAllLabels(svg);
    });
}

function reorder() {
    const label = labelRef.value;
    const svg = parentSvg.value;

    ignoreDatasetPosition.value = true;
    currentOffset.value = { x: 0, y: 0 };

    if (!label) {
        return;
    }

    if (isDragging.value) {
        if (svg?.[RAF_KEY]) {
            cancelAnimationFrame(svg[RAF_KEY]);
            svg[RAF_KEY] = null;
        }

        removeDragWindowListeners();
        isDragging.value = false;
        dragState.inputType = null;
        dragState.touchId = null;
        dragState.startPointer = null;
        dragState.startOffset = null;
        dragState.lastRequestedOffset = null;
    }

    label[DRAGGING_KEY] = false;
    delete label[PERSISTED_OFFSET_KEY];
    delete label[DRAG_REQUESTED_OFFSET_KEY];
    delete label[LAST_LAYOUT_RECT_KEY];
    delete label[LAST_LAYOUT_OFFSET_KEY];
    delete label[DRAG_PRIORITY_KEY];

    label.dataset.boxPositionX = '';
    label.dataset.boxPositionY = '';
    label.setAttribute('transform', 'translate(0 0)');

    if (svg?.isConnected) {
        svg[DISPLACED_LABELS_KEY] = new Map();
        scheduleLayout(svg);
    }
}

defineExpose({ reorder });

watch(
    () => [props.dataset?.position?.x, props.dataset?.position?.y],
    (nextPosition, previousPosition) => {
        if (
            previousPosition &&
            (nextPosition[0] !== previousPosition[0] ||
                nextPosition[1] !== previousPosition[1])
        ) {
            ignoreDatasetPosition.value = false;
        }
    },
);

watch(
    () => [
        props.dataset?.x,
        props.dataset?.y,
        props.dataset?.position?.x,
        props.dataset?.position?.y,
    ],
    () => {
        if (!datasetPosition.value && labelRef.value && !isDragging.value) {
            const position = props.dataset?.position;

            if (
                position &&
                (position.x === null ||
                    position.x === undefined ||
                    position.y === null ||
                    position.y === undefined)
            ) {
                delete labelRef.value[PERSISTED_OFFSET_KEY];
                currentOffset.value = { x: 0, y: 0 };
            }
        }

        updateWrappedLines();
    },
    {
        flush: 'post',
    },
);

watch(
    () => props.config,
    () => {
        if (!dragEnabled.value && isDragging.value) {
            finishDrag();
        }

        updateWrappedLines();
    },
    {
        deep: true,
        flush: 'post',
    },
);

onMounted(async () => {
    await nextTick();

    window.addEventListener('keydown', handleGlobalKeydown, true);
    window.addEventListener('pointerdown', handleGlobalPointerDown, true);

    parentSvg.value = labelRef.value?.ownerSVGElement ?? null;
    const svg = parentSvg.value;
    const label = labelRef.value;
    const content = contentRef.value;
    if (!svg || !label || !content) {
        return;
    }
    /*
     * Measure only the label's actual content. The background box must not be
     * part of getBBox(), otherwise each layout pass would measure the previous
     * box and progressively expand it.
     */
    label[MEASURE_ELEMENT_KEY] = content;
    /*
     * layoutAllLabels() is shared across every VueUiLabel instance in the
     * SVG. This callback publishes this instance's base box rectangle and
     * final positioned rectangle back into Vue reactivity.
     */
    label[SET_LAYOUT_RECT_KEY] = ({
        layoutRect: nextLayoutRect,
        boxRect: nextBoxRect,
        offset: nextOffset,
    }) => {
        layoutRect.value = nextLayoutRect;
        boxRect.value = nextBoxRect;

        if (nextOffset) {
            currentOffset.value = {
                x: Number(nextOffset.x) || 0,
                y: Number(nextOffset.y) || 0,
            };
        }
    };

    label[EMIT_DRAG_END_KEY] = (position) => {
        emit('dragEnd', {
            ...props.dataset,
            position: {
                x: Number(position?.x) || 0,
                y: Number(position?.y) || 0,
            },
        });
    };

    mutationObserver = new MutationObserver((mutations) => {
        const hasRelevantMutation = mutations.some((mutation) => {
            if (
                mutation.type === 'attributes' &&
                mutation.target === label &&
                mutation.attributeName === 'transform'
            ) {
                return false;
            }
            /*
             * boxRect is written by the layout engine itself. Ignore those
             * reactive rect attribute updates to avoid a layout loop.
             */
            if (
                mutation.type === 'attributes' &&
                mutation.target === boxRef.value
            ) {
                return false;
            }

            return true;
        });

        if (hasRelevantMutation) {
            scheduleLayout(svg);
        }
    });

    mutationObserver.observe(label, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
    });

    if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(() => {
            scheduleLayout(svg);
        });

        resizeObserver.observe(svg);
    }

    document.fonts?.ready?.then(() => {
        updateWrappedLines();
    });

    updateWrappedLines();
});

onBeforeUnmount(() => {
    removeDragWindowListeners();
    window.removeEventListener('keydown', handleGlobalKeydown, true);
    window.removeEventListener('pointerdown', handleGlobalPointerDown, true);
    mutationObserver?.disconnect();
    resizeObserver?.disconnect();

    liveRegion?.remove();
    liveRegion = null;

    if (labelRef.value) {
        delete labelRef.value[SET_LAYOUT_RECT_KEY];
        delete labelRef.value[MEASURE_ELEMENT_KEY];
        delete labelRef.value[EMIT_DRAG_END_KEY];
        delete labelRef.value[LAST_LAYOUT_RECT_KEY];
        delete labelRef.value[LAST_LAYOUT_OFFSET_KEY];
        delete labelRef.value[PERSISTED_OFFSET_KEY];
        delete labelRef.value[DRAG_REQUESTED_OFFSET_KEY];
        delete labelRef.value[DRAGGING_KEY];
        delete labelRef.value[DRAG_PRIORITY_KEY];
    }

    isDragging.value = false;
    dragState.inputType = null;
    dragState.touchId = null;
    dragState.startPointer = null;
    dragState.startOffset = null;
    dragState.lastRequestedOffset = null;
    layoutRect.value = null;
    boxRect.value = null;
    currentOffset.value = { x: 0, y: 0 };

    const svg = parentSvg.value;

    if (svg) {
        const displacedLabels = svg[DISPLACED_LABELS_KEY];
        if (displacedLabels instanceof Map && labelRef.value) {
            displacedLabels.delete(labelRef.value);
        }
        requestAnimationFrame(() => {
            scheduleLayout(svg);
        });
    }
});
</script>

<template>
    <g
        ref="wrapperRef"
        class="vue-ui-label-wrapper"
        focusable="false"
        :class="{
            'vue-ui-label-wrapper--keyboard-focus':
                inputModality === 'keyboard',
        }"
        @pointerdown.capture="handleWrapperPointerDown"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @focusin="handleFocusIn"
        @focusout="handleFocusOut"
    >
        <path
            v-if="computedLink"
            class="vue-ui-label__link"
            :d="computedLink.d"
            fill="none"
            :stroke="linkConfig.stroke"
            :stroke-width="linkConfig.strokeWidth"
            :stroke-dasharray="linkConfig.strokeDasharray"
            stroke-linecap="round"
            pointer-events="none"
            aria-hidden="true"
            focusable="false"
        />

        <circle
            v-if="linkConfig.targetPlot.show"
            :cx="x"
            :cy="y"
            :r="linkConfig.targetPlot.radius"
            :fill="linkConfig.stroke"
            :stroke="linkConfig.targetPlot.stroke"
            :stroke-width="linkConfig.strokeWidth"
            paint-order="stroke fill"
        />

        <g
            ref="labelRef"
            class="vue-ui-label"
            focusable="false"
            :id="`label_${uid}`"
            :data-position="FINAL_CONFIG.position"
            :data-overflow="String(FINAL_CONFIG.overflow)"
            :data-overlap="String(overlap)"
            :data-target-x="validCoordinates ? x : ''"
            :data-target-y="validCoordinates ? y : ''"
            :data-box-position-x="
                effectiveDatasetPosition ? effectiveDatasetPosition.x : ''
            "
            :data-box-position-y="
                effectiveDatasetPosition ? effectiveDatasetPosition.y : ''
            "
            :data-link-length="linkConfig.show ? linkLength : TARGET_GAP"
            :data-box-show="String(boxConfig.show)"
            :data-box-max-width="
                boxMaxWidth !== null && boxMaxWidth > 0 ? boxMaxWidth : ''
            "
            :data-box-padding-top="boxPadding.top"
            :data-box-padding-right="boxPadding.right"
            :data-box-padding-bottom="boxPadding.bottom"
            :data-box-padding-left="boxPadding.left"
            :data-drag-enabled="String(dragEnabled)"
            :data-drag-handle-position="dragHandlePosition"
            :data-drag-handle-size="dragHandleSize"
            @click="handleClick"
        >
            <rect
                v-if="boxShape"
                ref="boxRef"
                class="vue-ui-label__box"
                :x="boxShape.x"
                :y="boxShape.y"
                :width="boxShape.width"
                :height="boxShape.height"
                :rx="boxShape.rx"
                :fill="boxConfig.backgroundColor"
                :stroke="boxConfig.borderColor"
                :stroke-width="boxBorderWidth"
                aria-hidden="true"
                focusable="false"
            />

            <rect
                v-if="labelActionShape"
                class="vue-ui-label__action-target"
                :x="labelActionShape.x"
                :y="labelActionShape.y"
                :width="labelActionShape.width"
                :height="labelActionShape.height"
                :rx="labelActionShape.rx"
                fill="transparent"
                pointer-events="none"
                role="button"
                tabindex="0"
                :aria-label="accessibleLabel"
                @keydown="handleLabelKeydown"
            />

            <slot name="before" v-bind="{ ...props, box: boxShape }" />
            <g ref="contentRef" class="vue-ui-label__body">
                <slot name="title" v-bind="{ ...props, box: boxShape }">
                    <Shape
                        v-if="
                            markerBeforeText && markerPlot && validCoordinates
                        "
                        class="vue-ui-label__marker"
                        :plot="markerPlot"
                        :radius="markerRadius"
                        :shape="markerConfig.shape"
                        :color="markerConfig.color"
                        pointer-events="none"
                        aria-hidden="true"
                        focusable="false"
                    />

                    <text
                        v-if="FINAL_CONFIG.title.text && validCoordinates"
                        ref="titleTextRef"
                        class="vue-ui-label__title"
                        :font-size="TITLE_FONT_SIZE"
                        :font-weight="
                            FINAL_CONFIG.title.bold ? 'bold' : 'normal'
                        "
                        :text-anchor="titleTextAnchor"
                        :fill="FINAL_CONFIG.title.color"
                    >
                        <tspan
                            v-for="(line, index) in titleLines"
                            :key="`title_${index}`"
                            :x="titleTextX"
                            :y="y + index * TITLE_LINE_HEIGHT"
                        >
                            {{ line }}
                        </tspan>
                    </text>

                    <Shape
                        v-if="
                            !markerBeforeText && markerPlot && validCoordinates
                        "
                        class="vue-ui-label__marker"
                        :plot="markerPlot"
                        :radius="markerRadius"
                        :shape="markerConfig.shape"
                        :color="markerConfig.color"
                        pointer-events="none"
                        aria-hidden="true"
                        focusable="false"
                    />
                </slot>

                <slot name="content" v-bind="{ ...props, box: boxShape }">
                    <text
                        v-if="FINAL_CONFIG.content.text && validCoordinates"
                        ref="contentTextRef"
                        class="vue-ui-label__content"
                        :font-size="CONTENT_FONT_SIZE"
                        :font-weight="
                            FINAL_CONFIG.content.bold ? 'bold' : 'normal'
                        "
                        :text-anchor="contentTextAnchor"
                        :fill="FINAL_CONFIG.content.color"
                    >
                        <tspan
                            v-for="(line, index) in contentLines"
                            :key="`content_${index}`"
                            :x="contentTextX"
                            :y="contentY + index * CONTENT_LINE_HEIGHT"
                        >
                            {{ line }}
                        </tspan>
                    </text>
                </slot>
            </g>
            <slot name="after" v-bind="{ ...props, box: boxShape }" />

            <g
                v-if="dragHandleShape"
                class="vue-ui-label__drag-handle"
                :style="{
                    cursor: isDragging ? 'grabbing' : 'grab',
                    touchAction: 'none',
                }"
                role="button"
                tabindex="0"
                :aria-label="dragHandleAriaLabel"
                :aria-describedby="dragInstructionsId"
                aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight"
                @keydown="handleDragHandleKeydown"
                @click.stop
                @mousedown.stop.prevent="startMouseDrag"
                @touchstart.stop.prevent="startTouchDrag"
            >
                <desc :id="dragInstructionsId">
                    {{ dragInstructions }}
                </desc>

                <rect
                    v-if="dragHitAreaShape"
                    :x="dragHitAreaShape.x"
                    :y="dragHitAreaShape.y"
                    :width="dragHitAreaShape.width"
                    :height="dragHitAreaShape.height"
                    fill="transparent"
                    pointer-events="all"
                    aria-hidden="true"
                    focusable="false"
                />

                <rect
                    v-if="dragHitAreaShape"
                    class="vue-ui-label__focus-ring"
                    :x="dragHitAreaShape.x"
                    :y="dragHitAreaShape.y"
                    :width="dragHitAreaShape.width"
                    :height="dragHitAreaShape.height"
                    :rx="
                        Math.min(
                            4,
                            dragHitAreaShape.width / 2,
                            dragHitAreaShape.height / 2,
                        )
                    "
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    pointer-events="none"
                    aria-hidden="true"
                    focusable="false"
                />

                <path
                    v-if="FINAL_CONFIG.drag.showSeparator"
                    :d="dragHandleShape.separatorPath"
                    :stroke="boxConfig.borderColor"
                    :stroke-width="Math.max(0.5, boxBorderWidth)"
                    pointer-events="none"
                    aria-hidden="true"
                    focusable="false"
                />

                <path
                    :d="dragHandleShape.gripPath"
                    :stroke="FINAL_CONFIG.drag.iconColor"
                    :stroke-width="dragIconDotSize"
                    stroke-linecap="round"
                    :opacity="FINAL_CONFIG.drag.iconOpacity"
                    pointer-events="none"
                    aria-hidden="true"
                    focusable="false"
                />
            </g>
        </g>
    </g>
</template>

<style scoped>
.vue-ui-label-wrapper:focus,
.vue-ui-label:focus {
    outline: none !important;
}

.vue-ui-label__action-target:focus,
.vue-ui-label__drag-handle:focus {
    outline: none;
}

.vue-ui-label-wrapper--keyboard-focus .vue-ui-label__action-target:focus {
    outline: 2px solid currentColor;
    outline-offset: 2px;
    stroke: currentColor;
    stroke-width: 2px;
}

.vue-ui-label__focus-ring {
    opacity: 0;
}

.vue-ui-label-wrapper--keyboard-focus
    .vue-ui-label__drag-handle:focus
    .vue-ui-label__focus-ring {
    opacity: 1;
}

@media (forced-colors: active) {
    .vue-ui-label-wrapper--keyboard-focus .vue-ui-label__action-target:focus {
        outline-color: Highlight;
        stroke: Highlight;
    }

    .vue-ui-label__focus-ring {
        stroke: Highlight;
    }
}
</style>
