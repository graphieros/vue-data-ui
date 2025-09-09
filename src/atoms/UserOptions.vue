<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from "vue";
import vClickOutside from '../directives/vClickOutside';
import BaseIcon from "./BaseIcon.vue";
import img from "../img";

const props = defineProps({
    hasPdf: {
        type: Boolean,
        default: true
    },
    hasXls: {
        type: Boolean,
        default: true,
    },
    hasImg: {
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
        default: false
    },
    chartElement: {
        type: HTMLElement,
        default: null
    },
    isFullscreen: {
        type: Boolean,
        default: false,
    },
    isStacked:  {
        type: Boolean,
        default: false
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
            return {}
        }
    },
    showTooltips: {
        type: Boolean,
        default: true
    },
    zIndex: {
        type: Number,
        default: 1
    },
    noOffset: {
        type: Boolean,
        default: true
    },
    position: {
        type: String,
        default: 'right'
    },
    offsetX: {
        type: Number,
        default: 0
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
            return {}
        }
    },
    printScale: {
        type: Number,
        default: 2
    },
    tableDialog: {
        type: Boolean,
        default: false,
    }
});

const emit = defineEmits(['generatePdf', 'generateCsv', 'generateImage', 'toggleTable', 'toggleLabels', 'toggleSort', 'toggleFullscreen', 'toggleStack', 'toggleTooltip', 'toggleAnimation', 'toggleAnnotator']);

async function generatePdf() {
    if (props.callbacks.pdf) {
        const { imageUri, base64} = await img({ domElement: props.chartElement, base64: true, img: true, scale: props.printScale })
        props.callbacks.pdf({ domElement: props.chartElement, base64, imageUri});
    } else {
        emit('generatePdf');
    }
}

function generateCsv() {
    emit('generateCsv', props.callbacks.csv);
}

async function generateImage() {
    if (props.callbacks.img) {
        const { imageUri, base64 } = await img({ domElement: props.chartElement, base64: true, img: true, scale: props.printScale })
        props.callbacks.img({ domElement: props.chartElement, imageUri, base64 });
    } else {
        emit('generateImage');
    }
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
    setTableIconState
})

const isOpen = ref(false);
const preventClose = ref(true);

function toggle() {
    isDesktop.value = window.innerWidth > 600;
    isOpen.value = !isOpen.value;
    if(isOpen.value) {
        preventClose.value = false;
    }
}

function close() {
    if(props.isPrinting || props.isImaging) return;
    isOpen.value = false;
}

function closeIfOpen() {
    if(isOpen.value) {
        close();
    }
}

const isLabel = ref(props.isLabelActive);

function toggleLabels() {
    if (props.callbacks.labels) {
        props.callbacks.labels();
    } else {
        isLabel.value = !isLabel.value;
        emit('toggleLabels')
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

const isAnnotator = computed({
    get:() => {
        return props.isAnnotation;
    },
    set: (bool) => {
        return bool
    }
})
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
    set: (val) => emit('toggleFullscreen', val)
});

function toggleFullscreen() {
    if (!props.chartElement) return;

    const next = !props.isFullscreen;
    _isFullscreen.value = next;

    if (next) {
        props.chartElement.requestFullscreen()
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
})

onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', fullscreenchanged);
})

const isDesktop = ref(window.innerWidth > 600)

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
})

</script>

<template>
    <div
        data-cy="user-options"
        v-click-outside="closeIfOpen" 
        data-dom-to-png-ignore 
        class="vue-ui-user-options" 
        :style="`z-index: ${zIndex}; height: 34px; position: ${isFullscreen ? 'fixed' : 'absolute'}; top: 0; ${position === 'right' ? `right:${isFullscreen ? '12px': '0'}` : `left:${isFullscreen ? '12px' : '0'}`}; padding: 4px; background:transparent;`">

        <div tabindex="0" :title="isOpen ? titles.close || '' : titles.open || ''" data-cy="user-options-summary" :style="`width:32px; position: absolute; top: 0;${position === 'right' ? `right: ${offsetX ? offsetX : noOffset ? 0 : 4}px` : `left: ${noOffset ? 0 : 4}px`}; padding: 0 0px; display: flex; align-items:center;justify-content:center;height: 36px;  cursor:pointer; background:transparent`" @click.stop="toggle" @keypress.enter="toggle">
            <slot name="menuIcon" v-bind="{ isOpen, color }">
                <BaseIcon :name="isOpen ? 'close' : 'menu'" :stroke="color" :stroke-width="2" />
            </slot>
        </div>
        <div :data-open="isOpen" data-cy="user-options-drawer" :class="{'vue-ui-user-options-drawer': true}" :style="`background:${backgroundColor}; ${position === 'right' ? `right: ${offsetX ? offsetX : noOffset ? 0 : 4}px` : `left: ${noOffset ? 0 : 4}px`}`">

            <button tabindex="0" v-if="hasTooltip" data-cy="user-options-tooltip" class="vue-ui-user-options-button" @click="toggleTooltip" @mouseenter="isInfo.tooltip = true" @mouseout="isInfo.tooltip = false">
                <template v-if="$slots.optionTooltip">
                    <slot name="optionTooltip"/>
                </template>
                <template v-else>
                    <BaseIcon v-if="isItTooltip" name="tooltip" :stroke="color" style="pointer-events: none;"/>
                    <BaseIcon v-else name="tooltipDisabled" :stroke="color" style="pointer-events: none"/>
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.tooltip && !$slots.optionTooltip" :class="{'button-info-left': position === 'left', 'button-info-right' : position === 'right', 'button-info-left-visible': position === 'left' && isInfo.tooltip, 'button-info-right-visible': position === 'right' && isInfo.tooltip }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.tooltip }}
                </div>
            </button>

            <button tabindex="0" v-if="hasPdf" data-cy="user-options-pdf" class="vue-ui-user-options-button" @click="generatePdf" @mouseenter="isInfo.pdf = true" @mouseout="isInfo.pdf = false">
                <template v-if="$slots.optionPdf">
                    <slot name="optionPdf"/>
                </template>
                <template v-else>
                    <BaseIcon v-if="isPrinting" name="spin" isSpin :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else name="pdf" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.pdf && !$slots.optionPdf" :class="{'button-info-left': position === 'left', 'button-info-right' : position === 'right', 'button-info-right-visible': position === 'right' && isInfo.pdf, 'button-info-left-visible': position === 'left' && isInfo.pdf }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.pdf }}
                </div>
            </button>
            
            <button tabindex="0" v-if="hasXls" data-cy="user-options-xls" class="vue-ui-user-options-button" @click="generateCsv" @mouseenter="isInfo.csv = true" @mouseout="isInfo.csv = false">
                <template v-if="$slots.optionCsv">
                    <slot name="optionCsv"/>
                </template>
                <template v-else>
                    <BaseIcon name="excel" :stroke="color" style="pointer-events: none"/>
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.csv && !$slots.optionCsv" :class="{'button-info-left': position === 'left', 'button-info-right' : position === 'right', 'button-info-right-visible': position === 'right' && isInfo.csv, 'button-info-left-visible': position === 'left' && isInfo.csv }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.csv }}
                </div>
            </button>

            <button tabindex="0" v-if="hasImg" data-cy="user-options-img" class="vue-ui-user-options-button" @click="generateImage" @mouseenter="isInfo.img = true" @mouseout="isInfo.img = false">
                <template v-if="$slots.optionImg">
                    <slot name="optionImg"/>
                </template>
                <template v-else>
                    <BaseIcon v-if="isImaging" name="spin" isSpin :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else name="image" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.img && !$slots.optionImg" :class="{'button-info-left': position === 'left', 'button-info-right' : position === 'right', 'button-info-right-visible': position === 'right' && isInfo.img, 'button-info-left-visible': position === 'left' && isInfo.img }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.img }}
                </div>
            </button>

            <button tabindex="0" v-if="hasTable" data-cy="user-options-table" class="vue-ui-user-options-button" @click="toggleTable" @mouseenter="isInfo.table = true" @mouseout="isInfo.table = false">
                <template v-if="$slots.optionTable">
                    <slot name="optionTable"/>
                </template>
                <template v-else>
                    <BaseIcon v-if="tableDialog" :name="isTableOpen ? 'tableDialogClose' : 'tableDialogOpen'" :stroke="color" style="pointer-events: none;" />
                    <BaseIcon v-else :name="isTableOpen ? 'tableClose' : 'tableOpen'" :stroke="color" style="pointer-events: none;" />
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.table && !$slots.optionTable" :class="{'button-info-left': position === 'left', 'button-info-right' : position === 'right', 'button-info-right-visible': position === 'right' && isInfo.table, 'button-info-left-visible': position === 'left' && isInfo.table }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.table }}
                </div>
            </button>

            <button tabindex="0" v-if="hasLabel" data-cy="user-options-label" class="vue-ui-user-options-button" @click="toggleLabels" @mouseenter="isInfo.labels = true" @mouseout="isInfo.labels = false">
                <template v-if="$slots.optionLabels">
                    <slot name="optionLabels"/>
                </template>
                <template v-else>
                    <BaseIcon :name="isLabel ? 'labelClose' : 'labelOpen'" :stroke="color" style="pointer-events: none;"/>
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.labels && !$slots.optionLabels" :class="{'button-info-left': position === 'left', 'button-info-right' : position === 'right', 'button-info-right-visible': position === 'right' && isInfo.labels, 'button-info-left-visible': position === 'left' && isInfo.labels }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.labels }}
                </div>
            </button>

            <button tabindex="0" v-if="hasSort" data-cy="user-options-sort" class="vue-ui-user-options-button" @click="toggleSort" @mouseenter="isInfo.sort = true" @mouseout="isInfo.sort = false">
                <template v-if="$slots.optionSort">
                    <slot name="optionSort"/>
                </template>
                <template v-else>
                    <BaseIcon name="sort" :stroke="color" style="pointer-events: none;"/>
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.sort && !$slots.optionSort" :class="{'button-info-left': position === 'left', 'button-info-right' : position === 'right', 'button-info-right-visible': position === 'right' && isInfo.sort, 'button-info-left-visible': position === 'left' && isInfo.sort }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.sort }}
                </div>
            </button>

            <button tabindex="0" v-if="hasStack" data-cy="user-options-stack" class="vue-ui-user-options-button" @click="toggleStack" @mouseenter="isInfo.stack = true" @mouseout="isInfo.stack = false">
                <template v-if="$slots.optionStack">
                    <slot name="optionStack"/>
                </template>
                <template v-else>
                    <BaseIcon v-if="isItStacked" name="unstack" :stroke="color" style="pointer-events: none;"/>
                    <BaseIcon v-else name="stack" :stroke="color" style="pointer-events: none;"/>
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.stack && !$slots.optionStack" :class="{'button-info-left': position === 'left', 'button-info-right' : position === 'right', 'button-info-right-visible': position === 'right' && isInfo.stack, 'button-info-left-visible': position === 'left' && isInfo.stack }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.stack }}
                </div>
            </button>

            <button tabindex="0" v-if="hasFullscreen" data-cy="user-options-fullscreen" class="vue-ui-user-options-button" @mouseenter="isInfo.fullscreen = true" @mouseout="isInfo.fullscreen = false" @click="toggleFullscreen(isFullscreen ? 'out' : 'in')">
                <template v-if="$slots.optionFullscreen">
                    <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
                </template>
                <template v-else>
                    <BaseIcon v-if="isFullscreen" name="exitFullscreen" :stroke="color" style="pointer-events: none;"/>
                    <BaseIcon v-if="!isFullscreen" name="fullscreen" :stroke="color" style="pointer-events: none;"/>
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.fullscreen && !$slots.optionFullscreen" :class="{'button-info-left': position === 'left', 'button-info-right' : position === 'right', 'button-info-right-visible': position === 'right' && isInfo.fullscreen, 'button-info-left-visible': position === 'left' && isInfo.fullscreen }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.fullscreen }}
                </div>
            </button>

            <button tabindex="0" v-if="hasAnimation" data-cy="user-options-anim" class="vue-ui-user-options-button" @mouseenter="isInfo.animation = true" @mouseout="isInfo.animation = false" @click="toggleAnimation">
                <template v-if="$slots.optionAnimation">
                    <slot name="optionAnimation" v-bind="{ toggleAnimation, isAnimated }"/>
                </template>
                <template v-else>
                    <BaseIcon v-if="isAnimated" name="play" :stroke="color" style="pointer-events: none;"/>
                    <BaseIcon v-if="!isAnimated" name="pause" :stroke="color" style="pointer-events: none;"/>
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.fullscreen && !$slots.optionAnimation" :class="{'button-info-left': position === 'left', 'button-info-right' : position === 'right', 'button-info-right-visible': position === 'right' && isInfo.animation, 'button-info-left-visible': position === 'left' && isInfo.animation }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.animation }}
                </div>
            </button>

            <button tabindex="0" v-if="hasAnnotator" data-cy="user-options-annotator" class="vue-ui-user-options-button" @mouseenter="isInfo.annotator = true" @mouseout="isInfo.annotator = false" @click="toggleAnnotator">
                <template v-if="$slots.optionAnnotator">
                    <slot name="optionAnnotator" v-bind="{ toggleAnnotator, isAnnotator }"/>
                </template>
                <template v-else>
                    <BaseIcon v-if="isAnnotator" name="annotatorDisabled" :stroke="color" style="pointer-events: none;"/>
                    <BaseIcon v-if="!isAnnotator" name="annotator" :stroke="color" style="pointer-events: none;"/>
                </template>
                <div data-cy="uo-tooltip" dir="auto" v-if="isDesktop && titles.annotator && !$slots.optionAnnotator" :class="{'button-info-left': position === 'left', 'button-info-right' : position === 'right', 'button-info-right-visible': position === 'right' && isInfo.annotator, 'button-info-left-visible': position === 'left' && isInfo.annotator }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.annotator }}
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
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.3);
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

.vue-ui-user-options-closing {
    animation: close-user-options 125ms ease-out;
    transform-origin: top;
    opacity:1;
}

@keyframes close-user-options {
    from {
        opacity: 1;
        transform: translateY(0) scale(1, 1);
    }
    to {
        opacity: 0;
        transform: translateY(-6px) scale(1, 0.95);
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
    align-items:center;
    justify-content: center;
    /* width: fit-content; */
    white-space: nowrap;
    cursor: pointer;
    position: relative;
}
.vue-ui-user-options-button:hover {
    background: rgba(0,0,0,0.05) !important;
}
.vue-ui-user-options-button:focus-visible {
    outline: 1px solid #CCCCCC;
}

.button-info-right,
.button-info-left {
    position: absolute;
    top: 50%;
    padding: 4px 12px;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-50%);
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