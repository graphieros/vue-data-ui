<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import vClickOutside from '../directives/vClickOutside';
import BaseIcon from "./BaseIcon.vue";

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
        default: false
    }
});

const emit = defineEmits(['generatePdf', 'generateCsv', 'generateImage', 'toggleTable', 'toggleLabels', 'toggleSort', 'toggleFullscreen', 'toggleStack', 'toggleTooltip', 'toggleAnimation']);

function generatePdf() {
    emit('generatePdf');
}

function generateCsv() {
    emit('generateCsv');
}

function generateImage() {
    emit('generateImage');
}

const isTableOpen = ref(false);
function toggleTable() {
    isTableOpen.value = !isTableOpen.value;
    emit('toggleTable');
}

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
    isLabel.value = !isLabel.value;
    emit('toggleLabels')
}

const isAnimated = ref(props.isAnimation);

function toggleAnimation() {
    isAnimated.value = !isAnimated.value;
    emit('toggleAnimation');
}

function toggleSort() {
    emit('toggleSort')
}

const isItStacked = ref(props.isStacked);

function toggleStack() {
    isItStacked.value = !isItStacked.value;
    emit('toggleStack')
}

const isItTooltip = ref(props.isTooltip);

function toggleTooltip() {
    isItTooltip.value = !isItTooltip.value;
    emit('toggleTooltip');
}

const isFullscreen = ref(false);

function toggleFullscreen(state) {
    if(!props.chartElement) return;
    if(state === "in") {
        isFullscreen.value = true;
        props.chartElement.requestFullscreen();
        emit('toggleFullscreen', true)
    }else {
        isFullscreen.value = false;
        document && document.exitFullscreen();
        emit('toggleFullscreen', false)
    }
}

function fullscreenchanged(_event) {
  if (document.fullscreenElement) {
    isFullscreen.value = true;
  } else {
    isFullscreen.value = false;
  }
}

onMounted(() => {
    document.addEventListener('fullscreenchange', fullscreenchanged)
})

onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', fullscreenchanged)
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
})

</script>

<template>
    <div v-click-outside="closeIfOpen" data-html2canvas-ignore class="vue-ui-user-options" :style="`z-index: ${zIndex}; height: 34px; position: ${isFullscreen ? 'fixed' : 'absolute'}; top: 0; right:${isFullscreen ? '12px': '0'}; padding: 4px; background:transparent;`">
        <div tabindex="0" :title="isOpen ? titles.close || '' : titles.open || ''" data-cy="user-options-summary" :style="`width:32px; position: absolute; top: 0; right: ${noOffset ? 0 : 4}px; padding: 0 0px; display: flex; align-items:center;justify-content:center;height: 36px;  cursor:pointer; background:${backgroundColor}`" @click.stop="toggle" @keypress.enter="toggle">
            <BaseIcon  :name="isOpen ? 'close' : 'menu'" stroke="#CCCCCC" :stroke-width="2" />
        </div>
        <div data-cy="user-options-drawer" :data-open="isOpen" :class="{'vue-ui-user-options-drawer': true}" :style="`background:${backgroundColor}; right:${noOffset ? 0 : 4}px`">

            <button tabindex="0" v-if="hasTooltip" data-cy="user-options-tooltip" class="vue-ui-user-options-button" @click="toggleTooltip" @mouseenter="isInfo.tooltip = true" @mouseout="isInfo.tooltip = false">
                <template v-if="$slots.optionTooltip">
                    <slot name="optionTooltip"/>
                </template>
                <template v-else>
                    <BaseIcon v-if="isItTooltip" name="tooltip" :stroke="color" style="pointer-events: none;"/>
                    <BaseIcon v-else name="tooltipDisabled" :stroke="color" style="pointer-events: none"/>
                </template>
                <div v-if="isDesktop && titles.tooltip && !$slots.optionTooltip" :class="{'button-info' : true, 'button-info-visible': isInfo.tooltip }" :style="{ background: backgroundColor, color: color }">
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
                <div v-if="isDesktop && titles.pdf && !$slots.optionPdf" :class="{'button-info' : true, 'button-info-visible': isInfo.pdf }" :style="{ background: backgroundColor, color: color }">
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
                <div v-if="isDesktop && titles.csv && !$slots.optionCsv" :class="{'button-info' : true, 'button-info-visible': isInfo.csv }" :style="{ background: backgroundColor, color: color }">
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
                <div v-if="isDesktop && titles.img && !$slots.optionImg" :class="{'button-info' : true, 'button-info-visible': isInfo.img }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.img }}
                </div>
            </button>

            <button tabindex="0" v-if="hasTable" data-cy="user-options-table" class="vue-ui-user-options-button" @click="toggleTable" @mouseenter="isInfo.table = true" @mouseout="isInfo.table = false">
                <template v-if="$slots.optionTable">
                    <slot name="optionTable"/>
                </template>
                <template v-else>
                    <BaseIcon :name="isTableOpen ? 'tableClose' : 'tableOpen'" :stroke="color" style="pointer-events: none;" />
                </template>
                <div v-if="isDesktop && titles.table && !$slots.optionTable" :class="{'button-info' : true, 'button-info-visible': isInfo.table }" :style="{ background: backgroundColor, color: color }">
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
                <div v-if="isDesktop && titles.labels && !$slots.optionLabels" :class="{'button-info' : true, 'button-info-visible': isInfo.labels }" :style="{ background: backgroundColor, color: color }">
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
                <div v-if="isDesktop && titles.sort && !$slots.optionSort" :class="{'button-info' : true, 'button-info-visible': isInfo.sort }" :style="{ background: backgroundColor, color: color }">
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
                <div v-if="isDesktop && titles.stack && !$slots.optionStack" :class="{'button-info' : true, 'button-info-visible': isInfo.stack }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.stack }}
                </div>
            </button>

            <button tabindex="0" v-if="hasFullscreen" data-cy="user-options-sort" class="vue-ui-user-options-button" @mouseenter="isInfo.fullscreen = true" @mouseout="isInfo.fullscreen = false" @click="toggleFullscreen(isFullscreen ? 'out' : 'in')">
                <template v-if="$slots.optionFullscreen">
                    <slot name="optionFullscreen" v-bind="{ toggleFullscreen, isFullscreen }"/>
                </template>
                <template v-else>
                    <BaseIcon v-if="isFullscreen" name="exitFullscreen" :stroke="color" style="pointer-events: none;"/>
                    <BaseIcon v-if="!isFullscreen" name="fullscreen" :stroke="color" style="pointer-events: none;"/>
                </template>
                <div v-if="isDesktop && titles.fullscreen && !$slots.optionFullscreen" :class="{'button-info' : true, 'button-info-visible': isInfo.fullscreen }" :style="{ background: backgroundColor, color: color }">
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
                <div v-if="isDesktop && titles.fullscreen && !$slots.optionAnimation" :class="{'button-info' : true, 'button-info-visible': isInfo.animation }" :style="{ background: backgroundColor, color: color }">
                    {{ titles.animation }}
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
    animation: show-user-options 125ms ease-in  forwards;
    transform-origin: top;
    opacity:0;
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
.button-info {
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    padding: 4px 12px;
    pointer-events: none;
    opacity: 0;
    border-radius: 4px 0 0 4px;
}
.button-info-visible {
    animation: showInfo 0.2s ease-in forwards;
}

@keyframes showInfo {
    from {
        opacity: 0;
        transform: translateY(-50%) scale(0.9, 1);
    }
    to {
        opacity: 1;
        transform: translateY(-50%) scale(1, 1);
    }
}
</style>