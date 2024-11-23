<script setup>
import { ref, watch, onMounted, onBeforeUnmount, computed, nextTick } from "vue";
import { XMLNS } from "../lib";
import BaseIcon from "./BaseIcon.vue";
import { lightenHexColor } from "../lib";
import ColorPicker from "./ColorPicker.vue";

const props = defineProps({
    parent: {
        type: HTMLElement
    },
    backgroundColor: {
        type: String,
        default: '#FFFFFF'
    },
    color: {
        type: String,
        default: '#2D353C'
    },
    active: {
        type: Boolean,
        default: false,
    }
});

const emit = defineEmits(['close']);

const stack = ref([]);
const redoStack = ref([]);

const viewBox = ref("0 0 0 0");

const currentColor = ref(props.color)

const buttonBorderColor = computed(() => {
    return lightenHexColor(props.color, 0.6);
});

function setViewBox({ width, height }) {
    viewBox.value = `0 0 ${width} ${height}`;
}

const resizeObserver = ref(null);

onMounted(() => {
    nextTick(() => {
        if (props.parent) {
            resizeObserver.value = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const { width, height } = entry.contentRect;
                    setViewBox({ width, height });
                }
            });
            resizeObserver.value.observe(props.parent);

            const { width, height } = props.parent.getBoundingClientRect();
            setViewBox({ width, height });
        }
    })
});

onBeforeUnmount(() => {
    if (resizeObserver.value) resizeObserver.value.disconnect();
});

watch(
    () => props.parent,
    (v) => {
        if (!v) return;
        const { width, height } = props.parent.getBoundingClientRect();
        setViewBox({ width, height });
    },
    { immediate: true }
);

const isDrawing = ref(false);
const currentPath = ref("");
const svgElement = ref(null);

function startDrawing(event) {
    if (!svgElement.value) return;
    isDrawing.value = true;
    const { x, y } = getRelativePosition(event);
    currentPath.value = `M ${x} ${y}`;
}

function draw(event) {
    if (!isDrawing.value || !svgElement.value) return;

    const { x, y } = getRelativePosition(event);
    currentPath.value += ` ${x} ${y}`;
}

function stopDrawing() {
    if (isDrawing.value) {
        stack.value.push(currentPath.value);
        redoStack.value = [];
        currentPath.value = "";
    }
    isDrawing.value = false;
}

function getRelativePosition(event) {
    if (!svgElement.value) return { x: 0, y: 0 };

    const svgRect = svgElement.value.getBoundingClientRect();
    let clientX, clientY;

    if (event.touches && event.touches.length) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    return {
        x: clientX - svgRect.left,
        y: clientY - svgRect.top,
    };
}

const showRedoButton = ref(false);

function deleteLastDraw() {
    if (stack.value.length > 0) {
        const lastPath = stack.value.pop();
        redoStack.value.push(lastPath);
    }
}

function redoLastDraw() {
    if (redoStack.value.length > 0) {
        const lastUndonePath = redoStack.value.pop();
        stack.value.push(lastUndonePath); 
    }
}

function reset() {
    stack.value = [];
    redoStack.value = [];
}
</script>

<template>
    <div
        v-if="active"
        data-html2canvas-ignore
        :class="{
            'vue-ui-pen-and-paper-actions': true,
            'visible': active
        }"
    >
        <button 
            class="vue-ui-pen-and-paper-action"
            :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`
            }"
            @click="emit('close')"
        >
            <BaseIcon name="close" :stroke="color"/>
        </button>
        <button
        :class="{
            'vue-ui-pen-and-paper-action': true, 
        }"
            style="padding: 0 !important"
            >
            <ColorPicker v-model:value="currentColor" />

        </button>
        <button
            :class="{
                'vue-ui-pen-and-paper-action': true, 
                'vue-ui-pen-and-paper-action-disabled': !stack.length
            }"
            :disabled="!stack.length"
            :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`
            }"
            @click="deleteLastDraw"
        >
            <BaseIcon name="restart" :stroke="color"/>
        </button>
        <button
            :class="{
                'vue-ui-pen-and-paper-action': true, 
                'vue-ui-pen-and-paper-action-disabled': !redoStack.length
            }"
            :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`
            }"
            @click="redoLastDraw"
        >
            <BaseIcon name="restart" :stroke="color" style="transform: scaleX(-1)"/>
        </button>
        <button
            :class="{
                'vue-ui-pen-and-paper-action': true, 
                'vue-ui-pen-and-paper-action-disabled': !stack.length
            }"
            class="vue-ui-pen-and-paper-action"
            :style="{
                backgroundColor: backgroundColor,
                border: `1px solid ${buttonBorderColor}`
            }"
            @click="reset"
        >
            <BaseIcon name="trash" :stroke="color"/>
        </button>
    </div>
    <svg
        ref="svgElement"
        :xmlns="XMLNS"
        :viewBox="viewBox"
        :class="{
            'vue-ui-pen-and-paper': true,
            inactive: !active,
        }"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart.prevent="startDrawing"
        @touchmove.prevent="draw"
        @touchend="stopDrawing"
    >
        <path class="vue-ui-pen-and-paper-path" v-for="path in stack" :key="path" :d="path" :stroke="currentColor" fill="none" />
        <path class="vue-ui-pen-and-paper-path vue-ui-pen-and-paper-path-drawing" v-if="isDrawing" :d="currentPath" :stroke="currentColor" fill="none" />
    </svg>
</template>

<style scoped>
.vue-ui-pen-and-paper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    cursor: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAABg2lDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TpSIVh2YQcchQnSyIijhKFYtgobQVWnUwufQLmjQkKS6OgmvBwY/FqoOLs64OroIg+AHi6OSk6CIl/i8ptIjx4Lgf7+497t4BQrPKNKtnAtB020wn4lIuvyqFXhGGiAhCiMnMMpKZxSx8x9c9Any9i/Es/3N/jgG1YDEgIBHPMcO0iTeIZzZtg/M+scjKskp8Tjxu0gWJH7muePzGueSywDNFM5ueJxaJpVIXK13MyqZGPE0cVTWd8oWcxyrnLc5atc7a9+QvDBf0lQzXaY4ggSUkkYIEBXVUUIWNGK06KRbStB/38Q+7/hS5FHJVwMixgBo0yK4f/A9+d2sVpya9pHAc6H1xnI9RILQLtBqO833sOK0TIPgMXOkdf60JzH6S3uho0SNgcBu4uO5oyh5wuQMMPRmyKbtSkKZQLALvZ/RNeSByC/Sveb2193H6AGSpq+Ub4OAQGCtR9rrPu/u6e/v3TLu/H5C7crM1WjgWAAAABmJLR0QAqwB5AHWF+8OUAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAB3RJTUUH5gwUExIUagzGcQAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAAABfSURBVBjTldAxDoNQDIPhL0+q1L33P1AvAhN7xfK6WAgoLfSfrNiykpQtE+7RLzx2vgF9D3o8lWDmn1QVVMP0LZQGmNtqp1/cmou0XHdG/+sYeGZwFBqPCub8rkcvvAGvsi1VYarR8wAAAABJRU5ErkJggg==') 5 5, auto;
    z-index: 0;
}
.inactive {
    pointer-events: none;
}
.vue-ui-pen-and-paper-actions {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
.vue-ui-pen-and-paper-action {
    display: flex;
    align-items:center;
    justify-content:center;
    height: 32px;
    width: 32px;
    padding: 2px;
    transition: all 0.2s ease-in-out;
    cursor: pointer;
}
.vue-ui-pen-and-paper-action:hover {
    box-shadow: 2px 2px 6px rgba(0,0,0,0.3);
}
.vue-ui-pen-and-paper-action-disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.vue-ui-pen-and-paper-path {
    stroke-linecap: round;
}
.vue-ui-pen-and-paper-path-drawing {
    stroke-width: 2;
}
</style>
