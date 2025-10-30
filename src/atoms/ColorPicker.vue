<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount, watchEffect } from "vue";
import BaseIcon from "./BaseIcon.vue";
import { adaptColorToBackground } from "../lib";
import vClickOutside from "../directives/vClickOutside";

const props = defineProps({
    value: { 
        type: String, 
        default: "#ffffff" 
    },
    size: { 
        type: String, 
        default: "50px" 
    },
    backgroundColor: { 
        type: String, 
        default: "#FFFFFF" 
    },
    buttonBorderColor: { 
        type: String, 
        default: "#FFFFFF" 
    },
    teleported: { 
        type: Boolean, 
        default: false
    },
});

const emit = defineEmits(["update:value"]);

const wrapperRef = ref(null);
const buttonRef = ref(null);
const colorInput = ref(null);

const isOpen = ref(false);
const isUsingNative = ref(false); // lock while native dialog is open
const pos = ref({ top: 0, left: 0 });

const colorPickerStyle = computed(() => ({
    backgroundColor: props.value,
    width: "100%",
    height: "100%",
    cursor: "pointer",
}));

const iconColor = computed(() => adaptColorToBackground(props.value));

function setColor(color) {
    emit("update:value", color);
    isOpen.value = false;
}

function updateColor(e) {
    emit("update:value", e.target.value);
}

function triggerColorPicker(e) {
    e?.stopPropagation?.();
    isUsingNative.value = true;
    colorInput.value?.click();
}

function close() {
    isOpen.value = false;
}

function closeIfOpen() {
    if (!isUsingNative.value && isOpen.value) close();
}

async function togglePicker() {
    isOpen.value = !isOpen.value;
    if (isOpen.value && props.teleported) {
        await nextTick();
        positionPanel();
    }
}

function positionPanel() {
    if (!buttonRef.value) return;
    const r = buttonRef.value.getBoundingClientRect();
    pos.value = { top: r.top + 36, left: r.right - 48 };
}

function onScrollOrResize() {
    if (isOpen.value && props.teleported) positionPanel();
}

function releaseNativeLock() {
    // Delay a tick to avoid racing with outside-click handler
    setTimeout(() => (isUsingNative.value = false), 0);
}

watchEffect((onCleanup) => {
    const el = colorInput.value;
    if (!el) return;
    const onBlur = () => releaseNativeLock();
    const onChange = () => releaseNativeLock();
    const onInput = () => { }; // keep open; value handled in @input on template
    el.addEventListener("blur", onBlur);
    el.addEventListener("change", onChange);
    el.addEventListener("input", onInput);
    onCleanup(() => {
        el.removeEventListener("blur", onBlur);
        el.removeEventListener("change", onChange);
        el.removeEventListener("input", onInput);
    });
});

function onWindowFocus() {
    releaseNativeLock();
}
function onVisibilityChange() {
    if (document.visibilityState === "visible") releaseNativeLock();
}

onMounted(() => {
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });
    window.addEventListener("focus", onWindowFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);
});
onBeforeUnmount(() => {
    window.removeEventListener("scroll", onScrollOrResize);
    window.removeEventListener("resize", onScrollOrResize);
    window.removeEventListener("focus", onWindowFocus);
    document.removeEventListener("visibilitychange", onVisibilityChange);
});

watch(
    () => props.value,
    (newVal) => {
        if (colorInput.value) colorInput.value.value = newVal;
    }
);

const palette = ref([
    "#000000",
    "#FFFFFF",
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#FFC300",
    "#800080",
    "#FF1493",
    "#00CED1",
]);
</script>

<template>
    <div 
        ref="wrapperRef" 
        data-cy="color-picker" 
        v-click-outside="closeIfOpen" 
        @keydown.esc="closeIfOpen"
        style="height: 100%; 
        width: 100%; 
        position: relative"
    >
        <button 
            ref="buttonRef" 
            class="icon" 
            data-cy="color-picker-icon" 
            @click="togglePicker" 
            :style="colorPickerStyle"
            type="button"
        >
            <slot name="annotator-action-color" v-bind="{ color: iconColor }">
                <BaseIcon name="palette" :stroke="iconColor" :size="22" />
            </slot>
        </button>

        <div 
            v-if="isOpen && !teleported" 
            tabindex="0" 
            class="vue-ui-color-picker"
            :style="{ 
                backgroundColor: backgroundColor,
                position: 'absolute',
                left: `calc(100% + 30px)`,
                top: '50%',
                transform: 'translateY(-18%)'
            }" 
            @mousedown.stop 
            @click.stop 
            @touchstart.stop
        >
            <button 
                v-for="c in palette" 
                :key="c" 
                data-cy="color-picker-option" 
                class="vue-ui-color-picker-option"
                type="button" 
                :style="{ backgroundColor: c, outline: `1px solid ${buttonBorderColor}` }"
                @click="() => setColor(c)" 
            />
            <button 
                class="vue-ui-color-picker-option" 
                type="button"
                :style="{ backgroundColor: value, outline: `1px solid ${buttonBorderColor}` }"
                @click.stop="triggerColorPicker" 
                @mousedown.stop 
                @touchstart.stop
            >
                <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-46%)">
                    <BaseIcon name="colorPicker" :stroke="iconColor" :size="22" />
                </div>
                <input 
                    ref="colorInput" 
                    type="color" 
                    :value="value" 
                    class="hidden-input" 
                    @input="updateColor" 
                />
            </button>
        </div>

        <teleport 
            to="body" 
            v-if="isOpen && teleported"
        >
            <div 
                tabindex="0" 
                class="vue-ui-color-picker" 
                :style="{
                    backgroundColor: backgroundColor,
                    position: 'fixed',
                    top: pos.top + 'px',
                    left: pos.left + 'px',
                    zIndex: 2147483647
                }" 
                @mousedown.stop 
                @click.stop @touchstart.stop
            >
                <button 
                    v-for="c in palette" 
                    :key="c" 
                    data-cy="color-picker-option" 
                    class="vue-ui-color-picker-option"
                    type="button" 
                    :style="{ backgroundColor: c, outline: `1px solid ${buttonBorderColor}` }"
                    @click="() => setColor(c)" 
                />
                <button 
                    class="vue-ui-color-picker-option" 
                    type="button"
                    :style="{ backgroundColor: value, outline: `1px solid ${buttonBorderColor}` }"
                    @click.stop="triggerColorPicker" 
                    @mousedown.stop 
                    @touchstart.stop
                >
                    <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-46%)">
                        <BaseIcon name="colorPicker" :stroke="iconColor" :size="22" />
                    </div>
                    <input 
                        ref="colorInput" 
                        type="color" 
                        :value="value" 
                        class="hidden-input" 
                        @input="updateColor" 
                    />
                </button>
            </div>
        </teleport>
    </div>
</template>

<style scoped>
.hidden-input {
    max-height: 0px;
    max-width: 0px;
    visibility: hidden;
}

.icon {
    align-items: center;
    display: flex;
    height: 100%;
    justify-content: center;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
    padding: 2px;
    border: none;
}

.vue-ui-color-picker {
    border-radius: 0px;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
    display: grid;
    gap: 6px;
    grid-template-columns: 32px 32px;
    padding: 6px;
}

.vue-ui-color-picker-option {
    cursor: pointer;
    align-items: center;
    border-radius: 0px;
    display: flex;
    height: 32px;
    justify-content: center;
    position: relative;
    width: 32px;
    border: none;
}

.vue-ui-color-picker-option:hover,
.vue-ui-color-picker-option:focus {
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease-in-out;
}
</style>
