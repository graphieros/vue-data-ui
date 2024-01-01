<script setup>
import { ref } from "vue";
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
    }
});

const emit = defineEmits(['generatePdf', 'generateCsv', 'generateImage', 'toggleTable', 'toggleLabels', 'toggleSort']);

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

function toggleSort() {
    emit('toggleSort')
}

</script>

<template>
    <div v-click-outside="closeIfOpen" data-html2canvas-ignore class="vue-ui-user-options" :style="`width: 34px; height: 34px; position: absolute; top: 0; right:0; padding: 4px; background:transparent; `">
        <div tabindex="0" data-cy="user-options-summary" :style="`width:32px; position: absolute; top: 0; right:4px; padding: 0 0px; display: flex; align-items:center;justify-content:center;height: 36px; width: 32px; cursor:pointer; background:${backgroundColor};`" @click.stop="toggle" @keypress.enter="toggle">
            <BaseIcon  :name="isOpen ? 'close' : 'menu'" stroke="#CCCCCC" :stroke-width="2" />
        </div>
        <div data-cy="user-options-drawer" :data-open="isOpen" :class="{'vue-ui-user-options-drawer': true}" :style="`background:${backgroundColor}`">

            <button tabindex="0" v-if="hasPdf" data-cy="user-options-pdf" class="vue-ui-user-options-button" @click="generatePdf">
                <BaseIcon v-if="isPrinting" name="spin" isSpin />
                <BaseIcon v-else name="pdf" :stroke="color" />
            </button>
            
            <button tabindex="0" v-if="hasXls" data-cy="user-options-xls" class="vue-ui-user-options-button" @click="generateCsv">
                <BaseIcon name="excel" :stroke="color" />
            </button>

            <button tabindex="0" v-if="hasImg" data-cy="user-options-img" class="vue-ui-user-options-button" @click="generateImage">
                <BaseIcon v-if="isImaging" name="spin" isSpin />
                <BaseIcon v-else name="image" :stroke="color" />
            </button>

            <button tabindex="0" v-if="hasTable" data-cy="user-options-table" class="vue-ui-user-options-button" @click="toggleTable">
                <BaseIcon :name="isTableOpen ? 'tableClose' : 'tableOpen'" :stroke="color" />
            </button>

            <button tabindex="0" v-if="hasLabel" data-cy="user-options-label" class="vue-ui-user-options-button" @click="toggleLabels">
                <BaseIcon :name="isLabel ? 'labelClose' : 'labelOpen'" :stroke="color"/>
            </button>

            <button tabindex="0" v-if="hasSort" data-cy="user-options-sort" class="vue-ui-user-options-button" @click="toggleSort">
                <BaseIcon name="sort" :stroke="color"/>
            </button>

        </div>
    </div>
</template>

<style scoped>
.vue-ui-user-options {
    z-index: 1;
}
.vue-ui-user-options-drawer[data-open="false"] {
    display: none;
}

.vue-ui-user-options-drawer[data-open="true"] {
    position: absolute;
    right: 4px;
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
    padding: 0 3px;
    border-radius: 3px;
    height: 30px;
    border: 1px solid transparent;
    background: inherit;
    display: flex;
    align-items:center;
    justify-content: center;
    width: fit-content;
    cursor: pointer;
}
.vue-ui-user-options-button:hover {
    background: rgba(0,0,0,0.05) !important;
}
.vue-ui-user-options-button:focus-visible {
    outline: 1px solid #CCCCCC;
}
</style>