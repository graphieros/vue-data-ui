<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from "vue";
import vClickOutside from "../directives/vClickOutside";
import BaseIcon from "./BaseIcon.vue";
import img from "../img";
import vPopoverClickOutside from "../directives/vPopoverClickOutside";

const props = defineProps({
    hasPdf: {
        type: Boolean,
        default: true,
    },
    hasXls: {
        type: Boolean,
        default: true,
    },
    hasImg: {
        type: Boolean,
        default: false,
    },
    hasSvg: {
        type: Boolean,
        default: false,
    },
    hasLabel: {
        type: Boolean,
        default: false,
    },
    isLabelActive: {
        type: Boolean,
        default: false,
    },
    hasTable: {
        type: Boolean,
        default: false,
    },
    hasSort: {
        type: Boolean,
        default: false,
    },
    hasStack: {
        type: Boolean,
        default: false,
    },
    hasTooltip: {
        type: Boolean,
        default: false,
    },
    color: {
        type: String,
    },
    backgroundColor: {
        type: String,
    },
    isPrinting: {
        type: Boolean,
        default: false,
    },
    isImaging: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
    },
    uid: {
        type: String,
    },
    hasFullscreen: {
        type: Boolean,
        default: false,
    },
    chartElement: {
        type: HTMLElement,
        default: null,
    },
    isFullscreen: {
        type: Boolean,
        default: false,
    },
    isStacked: {
        type: Boolean,
        default: false,
    },
    isTooltip: {
        type: Boolean,
        default: false,
    },
    hasAnimation: {
        type: Boolean,
        default: false,
    },
    isAnimation: {
        type: Boolean,
        default: false,
    },
    titles: {
        type: Object,
        default() {
            return {};
        },
    },
    showTooltips: {
        type: Boolean,
        default: true,
    },
    zIndex: {
        type: Number,
        default: 1,
    },
    noOffset: {
        type: Boolean,
        default: true,
    },
    position: {
        type: String,
        default: 'right',
    },
    offsetX: {
        type: Number,
        default: 0,
    },
    hasAnnotator: {
        type: Boolean,
        default: false,
    },
    isAnnotation: {
        type: Boolean,
        default: false,
    },
    callbacks: {
        type: Object,
        default() {
            return {};
        },
    },
    printScale: {
        type: Number,
        default: 2,
    },
    tableDialog: {
        type: Boolean,
        default: false,
    },
    hasZoom: {
        type: Boolean,
        default: false,
    },
    isZoom: {
        type: Boolean,
        default: false,
    },
    isCursorPointer: {
        type: Boolean,
        default: false
    },
    hasAltCopy: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits([
    'generatePdf',
    'generateCsv',
    'generateImage',
    'toggleTable',
    'toggleLabels',
    'toggleSort',
    'toggleFullscreen',
    'toggleStack',
    'toggleTooltip',
    'toggleAnimation',
    'toggleAnnotator',
    'generateSvg',
    'toggleZoom',
    'copyAlt'
]);

const rootRef = ref(null);
const triggerRef = ref(null);
const drawerRef = ref(null);
const isOpen = ref(false);

const supportsPopover = computed(() => {
    return typeof window !== 'undefined' && typeof HTMLElement !== 'undefined' && 'popover' in HTMLElement.prototype;
});

async function generatePdf() {
    if (props.callbacks.pdf) {
        const { imageUri, base64 } = await img({
            domElement: props.chartElement,
            base64: true,
            img: true,
            scale: props.printScale,
        });
        props.callbacks.pdf({ domElement: props.chartElement, base64, imageUri });
    } else {
        emit('generatePdf');
    }
}

function generateCsv() {
    emit('generateCsv', props.callbacks.csv);
}

async function generateImage() {
    if (props.callbacks.img) {
        emit("generateImage", { stage: "start" });

        try {
            const { imageUri, base64 } = await img({
                domElement: props.chartElement,
                base64: true,
                img: true,
                scale: props.printScale,
            });

            await Promise.resolve(
                props.callbacks.img({ domElement: props.chartElement, imageUri, base64 })
            );
        } finally {
            emit("generateImage", { stage: "end" });
        }
    } else {
        emit("generateImage");
    }
}

function generateSvg() {
    emit('generateSvg', { isCb: !!props.callbacks.svg });
}

const isTableOpen = ref(false);
function toggleTable() {
    if (props.callbacks.table) {
        props.callbacks.table();
    } else {
        isTableOpen.value = !isTableOpen.value;
        emit('toggleTable');
    }
}

function setTableIconState(state) {
    isTableOpen.value = state;
}

defineExpose({
    setTableIconState,
});

const isLabel = ref(props.isLabelActive);
function toggleLabels() {
    if (props.callbacks.labels) {
        props.callbacks.labels();
    } else {
        isLabel.value = !isLabel.value;
        emit('toggleLabels');
    }
}

const isAnimated = ref(props.isAnimation);
function toggleAnimation() {
    if (props.callbacks.animation) {
        props.callbacks.animation();
    } else {
        isAnimated.value = !isAnimated.value;
        emit('toggleAnimation');
    }
}

const isZoomActive = ref(props.isZoom);
function toggleZoom() {
    if (props.callbacks.zoom) {
        props.callbacks.zoom();
    } else {
        isZoomActive.value = !isZoomActive.value;
        emit('toggleZoom');
    }
}

const isAnnotator = computed({
    get: () => props.isAnnotation,
    set: (bool) => bool,
});
function toggleAnnotator() {
    if (props.callbacks.annotator) {
        props.callbacks.annotator();
    } else {
        isAnnotator.value = !isAnnotator.value;
        emit('toggleAnnotator');
    }
}

function toggleSort() {
    if (props.callbacks.sort) {
        props.callbacks.sort();
    } else {
        emit('toggleSort');
    }
}

function copyAlt() {
    emit('copyAlt')
}

const isItStacked = ref(props.isStacked);
function toggleStack() {
    if (props.callbacks.stack) {
        props.callbacks.stack();
    } else {
        isItStacked.value = !isItStacked.value;
        emit('toggleStack');
    }
}

const isItTooltip = ref(props.isTooltip);
function toggleTooltip() {
    if (props.callbacks.tooltip) {
        props.callbacks.tooltip();
    } else {
        isItTooltip.value = !isItTooltip.value;
        emit('toggleTooltip');
    }
}

const _isFullscreen = computed({
    get: () => props.isFullscreen,
    set: (val) => emit('toggleFullscreen', val),
});

function toggleFullscreen() {
    if (!props.chartElement) return;

    const next = !props.isFullscreen;
    _isFullscreen.value = next;

    if (next) {
        props.chartElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function fullscreenchanged() {
    const flag = !!document.fullscreenElement;
    emit('toggleFullscreen', flag);
}

onMounted(() => {
    document.addEventListener('fullscreenchange', fullscreenchanged);
});

onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', fullscreenchanged);
});

const isDesktop = ref(window.innerWidth > 600);

const isInfo = ref({
    tooltip: false,
    pdf: false,
    csv: false,
    img: false,
    table: false,
    labels: false,
    sort: false,
    stack: false,
    fullscreen: false,
    animation: false,
    annotator: false,
    svg: false,
    zoom: false,
    altCopy: false
});

const preventClose = ref(true);

function toggleNonPopover() {
    isDesktop.value = window.innerWidth > 600;
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
        preventClose.value = false;
    }
}

function closeNonPopover() {
    if (props.isPrinting || props.isImaging) return;
    isOpen.value = false;
}

function closeIfOpen() {
    if (isOpen.value) {
        closeNonPopover();
    }
}

const ignoreOutsideUntil = ref(0);

function markIgnoreOutsideForNextTick() {
    ignoreOutsideUntil.value = performance.now() + 50;
}

function close() {
    if (props.isPrinting || props.isImaging) return;

    if (supportsPopover.value) {
        closePopover();
    }

    isOpen.value = false;
}

function closeFromOutside() {
    if (performance.now() < ignoreOutsideUntil.value) return;
    close();
}

function toggleFromPointer() {
    isDesktop.value = window.innerWidth > 600;

    if (!supportsPopover.value) {
        if (!isOpen.value) {
            markIgnoreOutsideForNextTick();
        }
        isOpen.value = !isOpen.value;
        return;
    }

    const el = drawerRef.value;
    const openNow = !!(el && el.matches && el.matches(':popover-open'));

    if (openNow || isOpen.value) {
        isOpen.value = false;
        closePopover();
        return;
    }

    markIgnoreOutsideForNextTick();
    isOpen.value = true;
}

function toggle() {
    toggleFromPointer();
}

function applyPopoverFixedFromNumbers(el, top, left, width) {
    const dpr = window.devicePixelRatio || 1;
    const snap = (n) => Math.round(n * dpr) / dpr;

    el.style.position = 'fixed';
    el.style.top = `${snap(top)}px`;
    el.style.left = `${snap(left)}px`;
    el.style.right = 'auto';
    el.style.width = `${snap(width)}px`;
}

function applyAbsoluteDrawerStylesForMeasure(el) {
    el.style.width = '';
    el.style.left = '';
    el.style.right = '';
    el.style.top = '';

    el.style.position = 'absolute';
    el.style.top = '36px';

    if (props.position === 'right') {
        const usedRight = props.offsetX ? props.offsetX : props.noOffset ? 0 : 4;
        el.style.right = `${usedRight}px`;
        el.style.left = 'auto';
    } else {
        const usedLeft = props.noOffset ? 0 : 4;
        el.style.left = `${usedLeft}px`;
        el.style.right = 'auto';
    }

    el.style.display = 'flex';
    el.style.visibility = 'hidden';
    el.style.pointerEvents = 'none';
}

function repositionOpenedPopover() {
    if (!supportsPopover.value) return;
    if (!isOpen.value) return;
    if (!rootRef.value || !drawerRef.value) return;

    const rootRect = rootRef.value.getBoundingClientRect();
    const drawerRect = drawerRef.value.getBoundingClientRect();

    const top = rootRect.top + 36;

    if (props.position === 'right') {
        const usedRight = props.offsetX ? props.offsetX : props.noOffset ? 0 : 4;
        const left = rootRect.right - usedRight - drawerRect.width;
        applyPopoverFixedFromNumbers(drawerRef.value, top, left, drawerRect.width);
    } else {
        const usedLeft = props.noOffset ? 0 : 4;
        const left = rootRect.left + usedLeft;
        applyPopoverFixedFromNumbers(drawerRef.value, top, left, drawerRect.width);
    }
}

let repositionRaf = 0;
function scheduleReposition() {
    cancelAnimationFrame(repositionRaf);
    repositionRaf = requestAnimationFrame(() => {
        repositionOpenedPopover();
    });
}

function onViewportChange() {
    if (!supportsPopover.value) return;
    if (!isOpen.value) return;
    scheduleReposition();
}

function applyPopoverFixedFromRect(el, rect) {
    const dpr = window.devicePixelRatio || 1;
    const snap = (n) => Math.round(n * dpr) / dpr;

    el.style.position = 'fixed';
    el.style.top = `${snap(rect.top)}px`;
    el.style.left = `${snap(rect.left)}px`;
    el.style.right = 'auto';
    el.style.width = `${snap(rect.width)}px`;
}

async function openPopover(repositionOnly = false) {
    if (!supportsPopover.value) return;
    const el = drawerRef.value;
    if (!el) return;

    const prevStyle = el.getAttribute('style') || "";
    const prevDataOpen = el.getAttribute('data-open');

    el.setAttribute('popover', 'manual');

    try {
        el.setAttribute('data-open', 'true');
        applyAbsoluteDrawerStylesForMeasure(el);

        await nextTick();

        const rect = el.getBoundingClientRect();

        el.setAttribute('style', prevStyle);
        if (prevDataOpen === null) el.removeAttribute('data-open');
        else el.setAttribute('data-open', prevDataOpen);

        applyPopoverFixedFromRect(el, rect);

        if (!repositionOnly) {
            if (typeof el.showPopover === 'function') {
                el.showPopover();
            } else {
                el.style.display = 'flex';
            }
        }
    } catch (error) {
        if (!repositionOnly) {
            try {
                if (typeof el.showPopover === 'function') el.showPopover();
                else el.style.display = 'flex';
            } catch (errorIgnored) {
                // whatever
            }
        }
    }
}

function closePopover() {
    if (!supportsPopover.value) return;
    const el = drawerRef.value;
    if (!el) return;

    el.setAttribute('popover', 'manual');

    try {
        if (typeof el.hidePopover === 'function') {
            el.hidePopover();
        } else {
            el.style.display = 'none';
        }
    } catch (error) {
        el.style.display = 'none';
    }

    el.style.position = '';
    el.style.top = '';
    el.style.left = '';
    el.style.right = '';
    el.style.width = '';
    el.style.inset = '';
}

function syncFromPopoverToggle() {
    if (!supportsPopover.value) return;
    const el = drawerRef.value;
    if (!el) return;

    if (!isOpen.value) return;

    isOpen.value =
        typeof el.matches === 'function'
            ? (() => {
                try {
                    return el.matches(':popover-open');
                } catch {
                    return false;
                }
            })()
            : false;
}

function onGlobalPointerDown(event) {
    if (!supportsPopover.value) return;
    if (!isOpen.value) return;

    if (performance.now() < ignoreOutsideUntil.value) return;

    const path = event.composedPath ? event.composedPath() : [];

    const clickedTrigger = triggerRef.value ? path.includes(triggerRef.value) : false;
    const clickedDrawer = drawerRef.value ? path.includes(drawerRef.value) : false;

    if (!clickedTrigger && !clickedDrawer) {
        close();
    }
}

watch(
    () => props.isFullscreen,
    async () => {
        if (!supportsPopover.value) return;
        await nextTick();
        if (isOpen.value) {
            openPopover();
        }
    }
);

watch(
    () => isOpen.value,
    async (open) => {
        if (!supportsPopover.value) return;
        await nextTick();

        if (open) {
            await openPopover(false);
            repositionOpenedPopover();
        } else {
            closePopover();
        }
    }
);

onMounted(() => {
    window.addEventListener('pointerdown', onGlobalPointerDown, true);

    window.addEventListener('resize', onViewportChange, { passive: true });
    window.addEventListener('scroll', onViewportChange, { passive: true, capture: true });

    if (drawerRef.value) {
        drawerRef.value.addEventListener('toggle', syncFromPopoverToggle);
    }
});

onBeforeUnmount(() => {
    window.removeEventListener('pointerdown', onGlobalPointerDown, true);

    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);

    if (drawerRef.value) {
        drawerRef.value.removeEventListener('toggle', syncFromPopoverToggle);
    }
});
</script>

<template>
    <!-- Popover supported -->
    <div
        v-if="supportsPopover"
        ref="rootRef"
        v-popover-click-outside="supportsPopover ? null : {
            targets: [rootRef, drawerRef, triggerRef],
            handler: closeFromOutside
        }"
        data-cy="user-options"
        data-dom-to-png-ignore
        class="vue-ui-user-options"
        :style="`z-index: ${zIndex}; height: 34px; position: ${isFullscreen ? 'fixed' : 'absolute'}; top: 0; ${
            position === 'right' ? `right:${isFullscreen ? '12px': '0'}` : `left:${isFullscreen ? '12px' : '0'}`
        }; padding: 4px; background:transparent;`"
    >
        <div
            ref="triggerRef"
            tabindex="0"
            role="button"
            :title="isOpen ? titles.close || '' : titles.open || ''"
            data-cy="user-options-summary"
            :style="`width:32px; position: absolute; top: 0;${
                position === 'right'
                    ? `right: ${offsetX ? offsetX : noOffset ? 0 : 4}px`
                    : `left: ${noOffset ? 0 : 4}px`
            }; padding: 0 0px; display: flex; align-items:center;justify-content:center;height: 36px;  cursor:${isCursorPointer ? 'pointer' : 'default'}; background:transparent`"
            @pointerdown.stop.prevent="toggleFromPointer"
            @keydown.enter.stop.prevent="toggle"
        >
            <slot name="menuIcon" v-bind="{ isOpen, color }">
                <BaseIcon :name="isOpen ? 'close' : 'menu'" :stroke="color" :stroke-width="2" />
            </slot>
        </div>

        <div
            ref="drawerRef"
            :popover="supportsPopover ? 'manual' : null"
            :data-open="supportsPopover ? null : isOpen"
            data-cy="user-options-drawer"
            :class="{ 'vue-ui-user-options-drawer': true }"
            :style="supportsPopover
                ? { background: backgroundColor }
                : `background:${backgroundColor}; ${
                    position === 'right'
                        ? `right: ${offsetX ? offsetX : noOffset ? 0 : 4}px`
                        : `left: ${noOffset ? 0 : 4}px`
                }`"
        >
            <!-- Action buttons are duplicated in both branches, but we can live with that -->
            <!-- PDF -->
            <button 
                tabindex="0" 
                v-if="hasPdf" 
                data-cy="user-options-pdf" 
                class="vue-ui-user-options-button" 
                @click="generatePdf" 
                @mouseenter="isInfo.pdf = true" 
                @mouseout="isInfo.pdf = false"
                :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
            >
                <template v-if="$slots.optionPdf">
                    <slot name="optionPdf" />
                </template>
                <template v-else>
                    <BaseIcon v-if="isPrinting" name="hourglass" isSpin :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else name="filePdf" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.pdf" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.pdf,
                    'button-info-left-visible': position === 'left' && isInfo.pdf,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.pdf }}
                </div>
            </button>

            <!-- CSV -->
            <button 
                tabindex="0" 
                v-if="hasXls" 
                data-cy="user-options-xls" 
                class="vue-ui-user-options-button" 
                @click="generateCsv" 
                @mouseenter="isInfo.csv = true" 
                @mouseout="isInfo.csv = false"
                :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
            >
                <template v-if="$slots.optionCsv">
                    <slot name="optionCsv" />
                </template>
                <template v-else>
                    <BaseIcon name="fileCsv" :stroke="color" style="pointer-events: none" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.csv" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.csv,
                    'button-info-left-visible': position === 'left' && isInfo.csv,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.csv }}
                </div>
            </button>

            <!-- PNG -->
            <button 
                tabindex="0" 
                v-if="hasImg" 
                data-cy="user-options-img" 
                class="vue-ui-user-options-button" 
                @click="generateImage" 
                @mouseenter="isInfo.img = true" 
                @mouseout="isInfo.img = false"
                :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
            >
                <template v-if="$slots.optionImg">
                    <slot name="optionImg" />
                </template>
                <template v-else>
                    <BaseIcon v-if="isImaging" name="hourglass" isSpin :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else name="filePng" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.img" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.img,
                    'button-info-left-visible': position === 'left' && isInfo.img,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.img }}
                </div>
            </button>

            <!-- SVG -->
            <button 
                tabindex="0" 
                v-if="hasSvg" 
                data-cy="user-options-svg" 
                class="vue-ui-user-options-button" 
                @click="generateSvg" 
                @mouseenter="isInfo.svg = true" 
                @mouseout="isInfo.svg = false"
                :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
            >
                <template v-if="$slots.optionSvg">
                    <slot name="optionSvg" />
                </template>
                <template v-else>
                    <BaseIcon name="fileSvg" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.svg" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.svg,
                    'button-info-left-visible': position === 'left' && isInfo.svg,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.svg }}
                </div>
            </button>

            <!-- TOOLTIP -->
            <button 
                tabindex="0" 
                v-if="hasTooltip" 
                data-cy="user-options-tooltip" 
                class="vue-ui-user-options-button" 
                @click="toggleTooltip" 
                @mouseenter="isInfo.tooltip = true" 
                @mouseout="isInfo.tooltip = false"
                :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
            >
                <template v-if="$slots.optionTooltip">
                    <slot name="optionTooltip" />
                </template>
                <template v-else>
                    <BaseIcon v-if="isItTooltip" name="tooltip" :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else name="tooltipDisabled" :stroke="color" style="pointer-events: none" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.tooltip" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-left-visible': position === 'left' && isInfo.tooltip,
                    'button-info-right-visible': position === 'right' && isInfo.tooltip,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.tooltip }}
                </div>
            </button>

            <!-- TABLE -->
            <button 
                tabindex="0" 
                v-if="hasTable" 
                data-cy="user-options-table" 
                class="vue-ui-user-options-button" 
                @click="toggleTable" 
                @mouseenter="isInfo.table = true" 
                @mouseout="isInfo.table = false"
                :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
            >
                <template v-if="$slots.optionTable">
                    <slot name="optionTable" />
                </template>
                <template v-else>
                    <BaseIcon v-if="tableDialog" :name="isTableOpen ? 'tableDialogClose' : 'tableDialogOpen'" :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else :name="isTableOpen ? 'tableClose' : 'tableOpen'" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.table" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.table,
                    'button-info-left-visible': position === 'left' && isInfo.table,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.table }}
                </div>
            </button>

            <!-- LABELS -->
            <button 
                tabindex="0" 
                v-if="hasLabel" 
                data-cy="user-options-label" 
                class="vue-ui-user-options-button" 
                @click="toggleLabels" 
                @mouseenter="isInfo.labels = true" 
                @mouseout="isInfo.labels = false"
                :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
            >
                <template v-if="$slots.optionLabels">
                    <slot name="optionLabels" />
                </template>
                <template v-else>
                    <BaseIcon :name="isLabel ? 'labelClose' : 'labelOpen'" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.labels" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.labels,
                    'button-info-left-visible': position === 'left' && isInfo.labels,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.labels }}
                </div>
            </button>

            <!-- SORT -->
            <button 
                tabindex="0" 
                v-if="hasSort" 
                data-cy="user-options-sort" 
                class="vue-ui-user-options-button" 
                @click="toggleSort" 
                @mouseenter="isInfo.sort = true" 
                @mouseout="isInfo.sort = false"
                :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
            >
                <template v-if="$slots.optionSort">
                    <slot name="optionSort" />
                </template>
                <template v-else>
                    <BaseIcon name="sort" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.sort" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.sort,
                    'button-info-left-visible': position === 'left' && isInfo.sort,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.sort }}
                </div>
            </button>

            <!-- STACK -->
            <button 
                tabindex="0" 
                v-if="hasStack" 
                data-cy="user-options-stack" 
                class="vue-ui-user-options-button" 
                @click="toggleStack" 
                @mouseenter="isInfo.stack = true" 
                @mouseout="isInfo.stack = false"
                :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
            >
                <template v-if="$slots.optionStack">
                    <slot name="optionStack" v-bind="{ isStack: isItStacked }" />
                </template>
                <template v-else>
                    <BaseIcon v-if="isItStacked" name="unstack" :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else name="stack" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.stack" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.stack,
                    'button-info-left-visible': position === 'left' && isInfo.stack,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.stack }}
                </div>
            </button>

            <!-- FULLSCREEN -->
            <button 
                tabindex="0" 
                v-if="hasFullscreen" 
                data-cy="user-options-fullscreen" 
                class="vue-ui-user-options-button" 
                @mouseenter="isInfo.fullscreen = true" 
                @mouseout="isInfo.fullscreen = false" 
                @click="toggleFullscreen(isFullscreen ? 'out' : 'in')"
                :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
            >
                <template v-if="$slots.optionFullscreen">
                    <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }" />
                </template>
                <template v-else>
                    <BaseIcon v-if="isFullscreen" name="exitFullscreen" :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else name="fullscreen" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.fullscreen" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.fullscreen,
                    'button-info-left-visible': position === 'left' && isInfo.fullscreen,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.fullscreen }}
                </div>
            </button>

            <!-- ZOOM -->
            <button 
                tabindex="0" 
                v-if="hasZoom" 
                data-cy="user-options-fullscreen" 
                class="vue-ui-user-options-button" 
                @mouseenter="isInfo.zoom = true" 
                @mouseout="isInfo.zoom = false" 
                @click="toggleZoom()"
                :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
            >
                <template v-if="$slots.optionZoom">
                    <slot name="optionZoom" v-bind="{ toggleZoom, isZoomLocked: !isZoom }" />
                </template>
                <template v-else>
                    <BaseIcon v-if="isZoom" name="zoomUnlock" :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else name="zoomLock" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.zoom" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.zoom,
                    'button-info-left-visible': position === 'left' && isInfo.zoom,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.zoom }}
                </div>
            </button>

            <!-- ANIMATION -->
            <button 
                tabindex="0" 
                v-if="hasAnimation" 
                data-cy="user-options-anim" 
                class="vue-ui-user-options-button" 
                @mouseenter="isInfo.animation = true" 
                @mouseout="isInfo.animation = false" 
                @click="toggleAnimation"
                :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
            >
                <template v-if="$slots.optionAnimation">
                    <slot name="optionAnimation" v-bind="{ toggleAnimation, isAnimated }" />
                </template>
                <template v-else>
                    <BaseIcon v-if="isAnimated" name="play" :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else name="pause" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.fullscreen" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.animation,
                    'button-info-left-visible': position === 'left' && isInfo.animation,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.animation }}
                </div>
            </button>

            <!-- ANNOTATOR -->
            <button 
                tabindex="0" 
                v-if="hasAnnotator" 
                data-cy="user-options-annotator" 
                class="vue-ui-user-options-button" 
                @mouseenter="isInfo.annotator = true" 
                @mouseout="isInfo.annotator = false" 
                @click="toggleAnnotator"
                :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
            >
                <template v-if="$slots.optionAnnotator">
                    <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
                </template>
                <template v-else>
                    <BaseIcon v-if="isAnnotator" name="annotatorDisabled" :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else name="annotator" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.annotator" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.annotator,
                    'button-info-left-visible': position === 'left' && isInfo.annotator,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.annotator }}
                </div>
            </button>

            <!-- ALT COPY -->
            <button
                tabindex="0"
                v-if="hasAltCopy"
                data-cy="user-options-alt-copy"
                class="vue-ui-user-options-button"
                @mouseenter="isInfo.altCopy = true"
                @mouseout="isInfo.altCopy = false"
                @click="copyAlt"
                :style="{ cursor: isCursorPointer ? 'pointer' : 'default' }"
            >
                <template v-if="$slots.optionAltCopy">
                    <slot name="optionAltCopy" v-bind="{ copyAlt }"/>
                </template>
                <template v-else>
                    <BaseIcon name="accessibility" :stroke="color" style="pointer-events: none;"/>
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.altCopy" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.altCopy,
                    'button-info-left-visible': position === 'left' && isInfo.altCopy,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.altCopy }}
                </div>
            </button>
        </div>
    </div>

    <!-- Popover not supported -->
    <div
        v-else
        ref="rootRef"
        data-cy="user-options"
        v-click-outside="closeIfOpen"
        data-dom-to-png-ignore
        class="vue-ui-user-options"
        :style="`z-index: ${zIndex}; height: 34px; position: ${isFullscreen ? 'fixed' : 'absolute'}; top: 0; ${position === 'right' ? `right:${isFullscreen ? '12px': '0'}` : `left:${isFullscreen ? '12px' : '0'}`}; padding: 4px; background:transparent;`"
    >
        <div
            ref="triggerRef"
            tabindex="0"
            :title="isOpen ? titles.close || '' : titles.open || ''"
            data-cy="user-options-summary"
            :style="`width:32px; position: absolute; top: 0;${position === 'right' ? `right: ${offsetX ? offsetX : noOffset ? 0 : 4}px` : `left: ${noOffset ? 0 : 4}px`}; padding: 0 0px; display: flex; align-items:center;justify-content:center;height: 36px;  cursor:pointer; background:transparent`"
            @click.stop="toggleNonPopover"
            @keypress.enter="toggleNonPopover"
        >
            <slot name="menuIcon" v-bind="{ isOpen, color }">
                <BaseIcon :name="isOpen ? 'close' : 'menu'" :stroke="color" :stroke-width="2" />
            </slot>
        </div>

        <div
            ref="drawerRef"
            :data-open="isOpen"
            data-cy="user-options-drawer"
            :class="{ 'vue-ui-user-options-drawer': true }"
            :style="`background:${backgroundColor}; ${position === 'right' ? `right: ${offsetX ? offsetX : noOffset ? 0 : 4}px` : `left: ${noOffset ? 0 : 4}px`}`"
        >
            <!-- Action buttons are duplicated in both branches, but we can live with that -->
            <button tabindex="0" v-if="hasPdf" data-cy="user-options-pdf" class="vue-ui-user-options-button" @click="generatePdf" @mouseenter="isInfo.pdf = true" @mouseout="isInfo.pdf = false">
                <template v-if="$slots.optionPdf">
                    <slot name="optionPdf" />
                </template>
                <template v-else>
                    <BaseIcon v-if="isPrinting" name="hourglass" isSpin :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else name="filePdf" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.pdf" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.pdf,
                    'button-info-left-visible': position === 'left' && isInfo.pdf,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.pdf }}
                </div>
            </button>

            <button tabindex="0" v-if="hasXls" data-cy="user-options-xls" class="vue-ui-user-options-button" @click="generateCsv" @mouseenter="isInfo.csv = true" @mouseout="isInfo.csv = false">
                <template v-if="$slots.optionCsv">
                    <slot name="optionCsv" />
                </template>
                <template v-else>
                    <BaseIcon name="fileCsv" :stroke="color" style="pointer-events: none" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.csv" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.csv,
                    'button-info-left-visible': position === 'left' && isInfo.csv,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.csv }}
                </div>
            </button>

            <button tabindex="0" v-if="hasImg" data-cy="user-options-img" class="vue-ui-user-options-button" @click="generateImage" @mouseenter="isInfo.img = true" @mouseout="isInfo.img = false">
                <template v-if="$slots.optionImg">
                    <slot name="optionImg" />
                </template>
                <template v-else>
                    <BaseIcon v-if="isImaging" name="hourglass" isSpin :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else name="filePng" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.img" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.img,
                    'button-info-left-visible': position === 'left' && isInfo.img,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.img }}
                </div>
            </button>

            <button tabindex="0" v-if="hasSvg" data-cy="user-options-svg" class="vue-ui-user-options-button" @click="generateSvg" @mouseenter="isInfo.svg = true" @mouseout="isInfo.svg = false">
                <template v-if="$slots.optionSvg">
                    <slot name="optionSvg" />
                </template>
                <template v-else>
                    <BaseIcon name="fileSvg" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.svg" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.svg,
                    'button-info-left-visible': position === 'left' && isInfo.svg,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.svg }}
                </div>
            </button>

            <button tabindex="0" v-if="hasTooltip" data-cy="user-options-tooltip" class="vue-ui-user-options-button" @click="toggleTooltip" @mouseenter="isInfo.tooltip = true" @mouseout="isInfo.tooltip = false">
                <template v-if="$slots.optionTooltip">
                    <slot name="optionTooltip" />
                </template>
                <template v-else>
                    <BaseIcon v-if="isItTooltip" name="tooltip" :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else name="tooltipDisabled" :stroke="color" style="pointer-events: none" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.tooltip" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-left-visible': position === 'left' && isInfo.tooltip,
                    'button-info-right-visible': position === 'right' && isInfo.tooltip,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.tooltip }}
                </div>
            </button>

            <button tabindex="0" v-if="hasTable" data-cy="user-options-table" class="vue-ui-user-options-button" @click="toggleTable" @mouseenter="isInfo.table = true" @mouseout="isInfo.table = false">
                <template v-if="$slots.optionTable">
                    <slot name="optionTable" />
                </template>
                <template v-else>
                    <BaseIcon v-if="tableDialog" :name="isTableOpen ? 'tableDialogClose' : 'tableDialogOpen'" :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else :name="isTableOpen ? 'tableClose' : 'tableOpen'" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.table" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.table,
                    'button-info-left-visible': position === 'left' && isInfo.table,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.table }}
                </div>
            </button>

            <button tabindex="0" v-if="hasLabel" data-cy="user-options-label" class="vue-ui-user-options-button" @click="toggleLabels" @mouseenter="isInfo.labels = true" @mouseout="isInfo.labels = false">
                <template v-if="$slots.optionLabels">
                    <slot name="optionLabels" />
                </template>
                <template v-else>
                    <BaseIcon :name="isLabel ? 'labelClose' : 'labelOpen'" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.labels" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.labels,
                    'button-info-left-visible': position === 'left' && isInfo.labels,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.labels }}
                </div>
            </button>

            <button tabindex="0" v-if="hasSort" data-cy="user-options-sort" class="vue-ui-user-options-button" @click="toggleSort" @mouseenter="isInfo.sort = true" @mouseout="isInfo.sort = false">
                <template v-if="$slots.optionSort">
                    <slot name="optionSort" />
                </template>
                <template v-else>
                    <BaseIcon name="sort" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.sort" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.sort,
                    'button-info-left-visible': position === 'left' && isInfo.sort,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.sort }}
                </div>
            </button>

            <button tabindex="0" v-if="hasStack" data-cy="user-options-stack" class="vue-ui-user-options-button" @click="toggleStack" @mouseenter="isInfo.stack = true" @mouseout="isInfo.stack = false">
                <template v-if="$slots.optionStack">
                    <slot name="optionStack" v-bind="{ isStack: isItStacked }" />
                </template>
                <template v-else>
                    <BaseIcon v-if="isItStacked" name="unstack" :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else name="stack" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.stack" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.stack,
                    'button-info-left-visible': position === 'left' && isInfo.stack,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.stack }}
                </div>
            </button>

            <button tabindex="0" v-if="hasFullscreen" data-cy="user-options-fullscreen" class="vue-ui-user-options-button" @mouseenter="isInfo.fullscreen = true" @mouseout="isInfo.fullscreen = false" @click="toggleFullscreen(isFullscreen ? 'out' : 'in')">
                <template v-if="$slots.optionFullscreen">
                    <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }" />
                </template>
                <template v-else>
                    <BaseIcon v-if="isFullscreen" name="exitFullscreen" :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else name="fullscreen" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.fullscreen" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.fullscreen,
                    'button-info-left-visible': position === 'left' && isInfo.fullscreen,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.fullscreen }}
                </div>
            </button>

            <button tabindex="0" v-if="hasZoom" data-cy="user-options-fullscreen" class="vue-ui-user-options-button" @mouseenter="isInfo.zoom = true" @mouseout="isInfo.zoom = false" @click="toggleZoom()">
                <template v-if="$slots.optionZoom">
                    <slot name="optionZoom" v-bind="{ toggleZoom, isZoomLocked: !isZoom }" />
                </template>
                <template v-else>
                    <BaseIcon v-if="isZoom" name="zoomUnlock" :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else name="zoomLock" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.zoom" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.zoom,
                    'button-info-left-visible': position === 'left' && isInfo.zoom,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.zoom }}
                </div>
            </button>

            <button tabindex="0" v-if="hasAnimation" data-cy="user-options-anim" class="vue-ui-user-options-button" @mouseenter="isInfo.animation = true" @mouseout="isInfo.animation = false" @click="toggleAnimation">
                <template v-if="$slots.optionAnimation">
                    <slot name="optionAnimation" v-bind="{ toggleAnimation, isAnimated }" />
                </template>
                <template v-else>
                    <BaseIcon v-if="isAnimated" name="play" :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else name="pause" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.fullscreen" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.animation,
                    'button-info-left-visible': position === 'left' && isInfo.animation,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.animation }}
                </div>
            </button>

            <button tabindex="0" v-if="hasAnnotator" data-cy="user-options-annotator" class="vue-ui-user-options-button" @mouseenter="isInfo.annotator = true" @mouseout="isInfo.annotator = false" @click="toggleAnnotator">
                <template v-if="$slots.optionAnnotator">
                    <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }" />
                </template>
                <template v-else>
                    <BaseIcon v-if="isAnnotator" name="annotatorDisabled" :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else name="annotator" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.annotator" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.annotator,
                    'button-info-left-visible': position === 'left' && isInfo.annotator,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.annotator }}
                </div>
            </button>

            <button tabindex="0" v-if="hasAltCopy" data-cy="user-options-alt-copy" class="vue-ui-user-options-button" @mouseenter="isInfo.altCopy = true" @mouseout="isInfo.altCopy = false" @click="toggleAnnotator">
                <template v-if="$slots.optionAltCopy">
                    <slot name="optionAltCopy" v-bind="{ copyAlt }" />
                </template>
                <template v-else>
                    <BaseIcon name="accessibility" :stroke="color" style="pointer-events:none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.altCopy" :class="{
                    'button-info-left': position === 'left',
                    'button-info-right': position === 'right',
                    'button-info-right-visible': position === 'right' && isInfo.altCopy,
                    'button-info-left-visible': position === 'left' && isInfo.altCopy,
                }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.altCopy }}
                </div>
            </button>
        </div>
    </div>
</template>

<style scoped>
.vue-ui-user-options-drawer[data-open="false"] {
    display: none;
}

.vue-ui-user-options-drawer[data-open="true"] {
    position: absolute;
    top: 36px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    animation: show-user-options 125ms ease-in forwards;
    transform-origin: top;
    border-radius: 0 0 3px 3px;
    box-shadow: 0 6px 12px -6px rgba(0, 0, 0, 0.3);
    overflow: visible;
}

@supports selector(:popover-open) {
    .vue-ui-user-options-drawer[popover] {
        display: none;
        margin: 0;
        border: 0;
        padding: 0;
        inset: auto;
        overflow: visible;
        max-height: none;
    }

    .vue-ui-user-options-drawer[popover]:popover-open {
        display: flex;
        flex-direction: column;
        gap: 4px;
        animation: show-user-options 125ms ease-in forwards;
        transform-origin: top;
        border-radius: 0 0 3px 3px;
        box-shadow: 0 6px 12px -6px rgba(0, 0, 0, 0.3);
        overflow: visible;
    }
}

@keyframes show-user-options {
    from {
        opacity: 0;
        transform: translateY(-6px) scale(1, 0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1, 1);
    }
}

.vue-ui-user-options-button {
    all: unset;
    padding: 3px;
    border-radius: 3px;
    height: auto;
    border: 1px solid transparent;
    background: inherit;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    position: relative;
    overflow: visible;
}

.vue-ui-user-options-button:hover {
    background: rgba(0, 0, 0, 0.05) !important;
}

.vue-ui-user-options-button:focus-visible {
    outline: 1px solid #cccccc;
}

.button-info-right,
.button-info-left {
    position: absolute;
    top: 50%;
    padding: 4px 12px;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-50%);
    z-index: 2147483000;
}

.button-info-right {
    right: 100%;
    border-radius: 4px 0 0 4px;
}

.button-info-right-visible {
    animation: showInfoRight 0.2s ease-in forwards;
    opacity: 1;
}

.button-info-left {
    left: 100%;
    border-radius: 0px 4px 4px 0;
}

.button-info-left-visible {
    animation: showInfoLeft 0.2s ease-in forwards;
    opacity: 1;
}

@keyframes showInfoRight {
    from {
        opacity: 0;
        transform: translateY(-50%) scale(0.9, 1);
    }
    to {
        opacity: 1;
        transform: translateY(-50%) scale(1, 1);
    }
}

@keyframes showInfoLeft {
    from {
        opacity: 0;
        transform: translateY(-50%) scale(0.9, 1);
    }
    to {
        opacity: 1;
        transform: translateY(-50%) scale(1, 1);
    }
}

.vue-ui-user-options,
.vue-ui-user-options-drawer {
    min-width: 36px;
}
</style>
