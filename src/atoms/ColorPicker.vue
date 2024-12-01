<script setup>
import { ref, computed, watch } from "vue";
import BaseIcon from "./BaseIcon.vue";
import { adaptColorToBackground } from "../lib";
import vClickOutside from '../directives/vClickOutside';


const props = defineProps({
    value: {
        type: String,
        default: "#ffffff", 
    },
    size: {
        type: String,
        default: "50px", 
    },
    backgroundColor: {
        type: String,
        default: '#FFFFFF'
    },
    buttonBorderColor: {
        type: String,
        default: '#FFFFFF'    
    }
});

const emit = defineEmits(["update:value"]);

const colorPickerStyle = computed(() => ({
    backgroundColor: props.value,
    width: '100%',
    height: '100%',
    cursor: "pointer",
}));

const colorInput = ref(null);

const isOpen = ref(false);

const triggerColorPicker = () => {
    colorInput.value?.click();
};

function setColor(color) {
    emit("update:value", color);
    isOpen.value = false;
}

function close() {
    isOpen.value = false;
}

function closeIfOpen() {
    if(isOpen.value) {
        close();
    }
}

const updateColor = (event) => {
    const newColor = event.target.value;
    emit("update:value", newColor);
};

const iconColor = computed(() => {
    return adaptColorToBackground(props.value);
})

watch(
    () => props.value,
    (newVal) => {
        colorInput.value.value = newVal;
    }
);

const palette = ref([
    '#000000',
    '#FFFFFF',
    '#FF5733',
    '#33FF57',
    '#3357FF',
    '#FFC300',
    '#800080',
    '#FF1493',
    '#00CED1',
]);
</script>

<template>
    <div v-click-outside="closeIfOpen" style="height: 100%; width: 100%; position: relative">
        <div @click="isOpen = !isOpen" :style="colorPickerStyle">
            <div class="icon">
                <BaseIcon name="palette" :stroke="iconColor" :size="22"/>
            </div>
        </div>
    
        <div class="vue-ui-color-picker" v-if="isOpen" :style="{
            backgroundColor: backgroundColor
        }">
            <div v-for="c in palette" class="vue-ui-color-picker-option"  :style="{ 
                    backgroundColor: c,
                    outline: `1px solid ${buttonBorderColor}`, 
                }" @click="() => setColor(c)"/>
            <div class="vue-ui-color-picker-option" @click="triggerColorPicker" :style="{
                backgroundColor: value,
                outline: `1px solid ${buttonBorderColor}`, 
            }">
                <div style="position: absolute; top: 50%; left:50%; transform: translate(-50%, -46%)">
                    <BaseIcon name="colorPicker" :stroke="iconColor" :size="22"/>
                </div>
                <input ref="colorInput" type="color" :value="value" class="hidden-input" @input="updateColor" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.hidden-input {
    max-height: 0px;
    max-width: 0px;
    visibility: hidden;
}

.color-picker-wrapper {
    cursor: pointer;
    display: inline-block;
    position: relative;
}

.icon {
    align-items:center;
    display: flex;
    height: 100%;
    justify-content: center;
    left:0;
    position: absolute;
    top: 0;
    width: 100%;
}
.vue-ui-color-picker {
    border-radius: 0px;
    box-shadow: 0 6px 12px rgba(0,0,0,0.3);
    display: grid;
    gap: 6px;
    grid-template-columns: 32px 32px;
    left: calc(100% + 30px);
    padding: 6px;
    position: absolute;
    top: -48px;
    z-index: 1;
}

.vue-ui-color-picker-option {
    align-items:center;
    border-radius: 0px;
    display: flex;
    height: 32px;
    justify-content: center;
    position: relative;
    width: 32px;
}

.vue-ui-color-picker-option:hover {
    box-shadow: 2px 2px 6px rgba(0,0,0,0.3);
    transition: all 0.2s ease-in-out;
}
</style>
