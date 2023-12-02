<script setup>
import { ref } from "vue";
import vClickOutside from '../directives/vClickOutside';

const props = defineProps({
    hasPdf: {
        type: Boolean,
        default: true
    },
    hasXls: {
        type: Boolean,
        default: true,
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
    title: {
        type: String,
    },
    uid: {
        type: String,
    }
});

const emit = defineEmits(['generatePdf', 'generateXls']);

function generatePdf() {
    emit('generatePdf');
}

function generateXls() {
    emit('generateXls');
}

const details = ref(null);

function close() {
    if(details.value) {
        details.value.removeAttribute('open')
    }
}

</script>

<template>
    <details ref="details" v-click-outside="close" :id="`details_${uid}`" class="vue-ui-user-options" :style="`background:${backgroundColor};color:${color}`" data-html2canvas-ignore>
        <summary class="vue-ui-user-options-summary" data-cy="user-options-summary" :style="`background:${backgroundColor};color:${color}`">
            {{ title }}
        </summary>
        <slot name="checkboxes"></slot>

        <button v-if="hasPdf" data-cy="user-options-pdf" class="vue-data-ui-button" @click="generatePdf" :disabled="isPrinting" :style="`margin-top: 12px; background:${backgroundColor};color:${color}`">
            <svg class="vue-data-ui-print-icon" xmlns="http://www.w3.org/2000/svg" v-if="isPrinting" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" :stroke="color" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M18 16v.01" />
                <path d="M6 16v.01" />
                <path d="M12 5v.01" />
                <path d="M12 12v.01" />
                <path d="M12 1a4 4 0 0 1 2.001 7.464l.001 .072a3.998 3.998 0 0 1 1.987 3.758l.22 .128a3.978 3.978 0 0 1 1.591 -.417l.2 -.005a4 4 0 1 1 -3.994 3.77l-.28 -.16c-.522 .25 -1.108 .39 -1.726 .39c-.619 0 -1.205 -.14 -1.728 -.391l-.279 .16l.007 .231a4 4 0 1 1 -2.212 -3.579l.222 -.129a3.998 3.998 0 0 1 1.988 -3.756l.002 -.071a4 4 0 0 1 -1.995 -3.265l-.005 -.2a4 4 0 0 1 4 -4z" />
            </svg>
            <span v-else>PDF</span>
        </button>
        <button v-if="hasXls" data-cy="user-options-xls" class="vue-data-ui-button" @click="generateXls" :style="`background:${backgroundColor};color:${color}`">
            XLSX
        </button>
    </details>
</template>

<style scoped>
.vue-ui-user-options {
    border-radius: 4px;
    padding: 6px 12px;
    position: absolute;
    right:0;
    top:0;
    user-select:none;
    max-width: 300px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}
.vue-ui-user-options[open] {
    border: 1px solid #e1e5e8;
    box-shadow: 0 6px 12px -6px rgba(0,0,0,0.2);
}
.vue-ui-user-options summary {
    text-align: right;
    direction: rtl;
}
.vue-data-ui-button {
    margin: 6px 0;
    border-radius: 3px;
    height: 30px;
    border: 1px solid #b9bfc4;
    background: inherit;
    display: flex;
    align-items:center;
    justify-content: center;
    width: 100%;
    cursor: pointer;
}
.vue-data-ui-button:hover {
    background: rgba(0,0,0,0.05) !important;
}
.vue-data-ui-print-icon {
    animation: smartspin 0.5s infinite linear;
}
@keyframes smartspin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>

<style>
.vue-ui-options-item {
    width: 100%;
    display: flex;
    flex-direction: row;
    gap: 5px;
    align-items:center;
    justify-content:flex-start;
}
</style>