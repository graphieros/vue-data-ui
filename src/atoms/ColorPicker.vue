<script setup>
import { ref, computed, watch } from "vue";
import BaseIcon from "./BaseIcon.vue";
import { adaptColorToBackground } from "../lib";

const props = defineProps({
    value: {
        type: String,
        default: "#ffffff", 
    },
    size: {
        type: String,
        default: "50px", 
    },
});

const emit = defineEmits(["update:value"]);

const colorPickerStyle = computed(() => ({
    backgroundColor: props.value,
    width: '100%',
    height: '100%',
    cursor: "pointer",
}));

const colorInput = ref(null);

const triggerColorPicker = () => {
    colorInput.value?.click();
};

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
</script>

<template>
    <div :style="colorPickerStyle" class="color-picker-wrapper" @click="triggerColorPicker">
        <input ref="colorInput" type="color" :value="value" class="hidden-input" @input="updateColor" />
        <div class="icon">
            <BaseIcon name="palette" :stroke="iconColor" :size="22"/>
        </div>
    </div>
</template>

<style scoped>
.hidden-input {
    visibility: hidden
}

.color-picker-wrapper {
    display: inline-block;
    position: relative;
    cursor: pointer;
}

.icon {
    position: absolute;
    top: 0;
    left:0;
    height: 100%;
    width: 100%;
    display: flex;
    align-items:center;
    justify-content: center;
}
</style>
