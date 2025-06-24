<script setup>
import { ref, reactive, computed, onUnmounted, nextTick } from "vue";
import BaseIcon from "./BaseIcon.vue";
import { XMLNS } from "../lib";

const props = defineProps({
    backgroundColor: { type: String },
    color: { type: String },
    headerBg: { type: String },
    headerColor: { type: String }
});

const emit = defineEmits(["close"]);

const isOpen = ref(false);
const hasBeenOpened = ref(false);

const modal = reactive({
    left: window.innerWidth / 2 - 200,
    top: window.innerHeight / 2 - 120,
    width: 400,
    height: 400,
    dragging: false,
    resizing: false,
    dragOffsetX: 0,
    dragOffsetY: 0,
    pointerStartX: 0,
    pointerStartY: 0,
    resizeStartW: 0,
    resizeStartH: 0,
});

function open() {
    isOpen.value = true;
    nextTick(() => {
        if (!hasBeenOpened.value) {
            modal.left = Math.max(0, window.innerWidth / 2 - modal.width / 2);
            modal.top = Math.max(0, window.innerHeight / 2 - modal.height / 2);
            hasBeenOpened.value = true;
        }
    });
}
function close() {
    isOpen.value = false;
    emit("close");
}

defineExpose({ open, close });

const modalStyle = computed(() => ({
    position: "fixed",
    left: `${modal.left}px`,
    top: `${modal.top}px`,
    width: `${modal.width}px`,
    height: `${modal.height}px`,
    padding: 0,
    border: "none",
    background: props.backgroundColor,
    boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
    zIndex: 9999,
    overflow: "visible",
    borderRadius: "2px"
}));

function getPointer(e) {
    if (e.touches && e.touches.length) {
        return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    return { x: e.clientX, y: e.clientY };
}

function initDrag(e) {
    e.preventDefault?.();
    modal.dragging = true;
    const pointer = getPointer(e);
    modal.dragOffsetX = pointer.x - modal.left;
    modal.dragOffsetY = pointer.y - modal.top;
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchmove", drag, { passive: false });
    document.addEventListener("touchend", endDrag);
}

function drag(e) {
    if (!modal.dragging) return;
    e.preventDefault?.();
    const pointer = getPointer(e);
    let newLeft = pointer.x - modal.dragOffsetX;
    let newTop = pointer.y - modal.dragOffsetY;
    newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - modal.width));
    newTop = Math.max(0, Math.min(newTop, window.innerHeight - modal.height));
    modal.left = newLeft;
    modal.top = newTop;
}

function endDrag() {
    modal.dragging = false;
    document.removeEventListener("mousemove", drag);
    document.removeEventListener("mouseup", endDrag);
    document.removeEventListener("touchmove", drag);
    document.removeEventListener("touchend", endDrag);
}

function initResize(e) {
    e.preventDefault?.();
    modal.resizing = true;
    const pointer = getPointer(e);
    modal.pointerStartX = pointer.x;
    modal.pointerStartY = pointer.y;
    modal.resizeStartW = modal.width;
    modal.resizeStartH = modal.height;
    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", endResize);
    document.addEventListener("touchmove", resize, { passive: false });
    document.addEventListener("touchend", endResize);
}

function resize(e) {
    if (!modal.resizing) return;
    e.preventDefault?.();
    const pointer = getPointer(e);
    let dx = pointer.x - modal.pointerStartX;
    let dy = pointer.y - modal.pointerStartY;
    modal.width = Math.max(240, modal.resizeStartW + dx);
    modal.height = Math.max(400, modal.resizeStartH + dy);
}

function endResize() {
    modal.resizing = false;
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", endResize);
    document.removeEventListener("touchmove", resize);
    document.removeEventListener("touchend", endResize);
}

function initResizeLeft(e) {
    e.preventDefault?.();
    modal.resizing = true;
    const pointer = getPointer(e);
    modal.pointerStartX = pointer.x;
    modal.pointerStartY = pointer.y;
    modal.resizeStartW = modal.width;
    modal.resizeStartH = modal.height;
    modal.resizeStartLeft = modal.left;
    modal.resizeStartTop = modal.top;
    document.addEventListener("mousemove", resizeLeft);
    document.addEventListener("mouseup", endResizeLeft);
    document.addEventListener("touchmove", resizeLeft, { passive: false });
    document.addEventListener("touchend", endResizeLeft);
}

function resizeLeft(e) {
    if (!modal.resizing) return;
    e.preventDefault?.();
    const pointer = getPointer(e);
    let dx = pointer.x - modal.pointerStartX;
    let newLeft = Math.min(
        Math.max(0, modal.resizeStartLeft + dx),
        modal.resizeStartLeft + modal.resizeStartW - 240 // min width
    );
    let newWidth = modal.resizeStartW - (newLeft - modal.resizeStartLeft);
    let dy = pointer.y - modal.pointerStartY;
    let newHeight = Math.max(400, modal.resizeStartH + dy);
    modal.left = newLeft;
    modal.width = newWidth;
    modal.height = newHeight;
}

function endResizeLeft() {
    modal.resizing = false;
    document.removeEventListener("mousemove", resizeLeft);
    document.removeEventListener("mouseup", endResizeLeft);
    document.removeEventListener("touchmove", resizeLeft);
    document.removeEventListener("touchend", endResizeLeft);
}

onUnmounted(() => {
    endDrag();
    endResize();
    endResizeLeft();
});
</script>

<template>
    <Teleport to="body">
        <div v-if="isOpen" data-cy="draggable-dialog" class="modal vue-ui-draggable-dialog" :style="modalStyle" @click.stop>
            <div class="modal-header" :style="{
                backgroundColor: headerBg,
                color: headerColor
            }">
                <span class="drag-handle" @mousedown.stop.prevent="initDrag" @touchstart.stop.prevent="initDrag">
                    <svg
                        :xmlns="XMLNS"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <path d="M5 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                        <path d="M5 15m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                        <path d="M12 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                        <path d="M12 15m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                        <path d="M19 9m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                        <path d="M19 15m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                    </svg>


                </span>
                <span class="modal-title">
                    <slot name="title"/>
                </span>
                <button data-cy="draggable-dialog-close" class="close" @click="close">
                    <BaseIcon name="close" :stroke="headerColor"/>
                </button>
            </div>
            <div class="modal-body">
                <slot />
            </div>
            <div class="resize-handle" @mousedown.stop.prevent="initResize" @touchstart.stop.prevent="initResize" />
            <div
                class="resize-handle resize-handle-left"
                @mousedown.stop.prevent="initResizeLeft"
                @touchstart.stop.prevent="initResizeLeft"
            />
        </div>
    </Teleport>
</template>

<style scoped>
.modal-header {
    display: flex;
    align-items: center;
    user-select: none;
    padding: 0.5em 0 0.5em 0.5em;
    border-radius: 2px 2px 0 0;
    position: relative;
}

.drag-handle {
    display: flex;
    align-items: center;
    cursor: grab;
    margin-right: 0.5em;
    padding: 0.2em;
}

.drag-handle:active {
    cursor: grabbing;
}

.modal-title {
    flex: 1;
    font-weight: bold;
}

.close {
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items:center;
    justify-content: center;
}

.modal-body {
    width: 100%;
    height: 80%;
    transition: all 0.2s ease-in-out;
}

.resize-handle {
    width: 20px;
    height: 20px;
    position: absolute;
    right: 0;
    bottom: 0;
    cursor: nwse-resize;
    z-index: 1;
    background: transparent;
}

.resize-handle:after {
    content: '';
    display: block;
    width: 14px;
    height: 14px;
    border-right: 2px solid v-bind(color);
    border-bottom: 2px solid v-bind(color);
    position: absolute;
    right: 3px;
    bottom: 3px;
    border-radius: 2px;
}

.resize-handle-left {
    left: 0;
    cursor: nesw-resize;
}
.resize-handle-left:after {
    content: '';
    display: block;
    width: 14px;
    height: 14px;
    border-right: 0px solid transparent;
    border-left: 2px solid v-bind(color);
    border-bottom: 2px solid v-bind(color);
    position: absolute;
    left: 3px;
    bottom: 3px;
    border-radius: 2px;
}
</style>
