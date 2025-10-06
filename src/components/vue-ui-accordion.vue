<script setup>
import { ref, computed, watch, onMounted } from "vue";
import BaseIcon from "../atoms/BaseIcon.vue";
import { useNestedProp } from "../useNestedProp";
import { createUid } from "../lib";
import { useConfig } from "../useConfig";

const { vue_ui_accordion: DEFAULT_CONFIG } = useConfig();

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
    hideDetails: {
        type: Boolean,
        default: false,
    }
});

const emit = defineEmits(['toggle'])

const FINAL_CONFIG = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: DEFAULT_CONFIG
    });
});

const isOpen = ref(FINAL_CONFIG.value.open);

const uid = ref(createUid())
const details = ref(null);
const init = ref(0)

onMounted(() => {
    details.value.open = FINAL_CONFIG.value.open;
})

watch(() => FINAL_CONFIG.value.open, (val) => {
    details.value.open = val;
})

function toggleDetails() {
    if(init.value > 0 || !FINAL_CONFIG.value.open) {
        isOpen.value = !isOpen.value;
    }
    init.value += 1;
    emit('toggle');
}

const maxHeight = computed(() => {
    return `${FINAL_CONFIG.value.maxHeight}px`
})

</script>

<template>
    <div class="vue-data-ui-component">
        <details :id="`details_${uid}`" ref="details" @toggle="toggleDetails" data-cy="accordion-summary">
            <summary :class="{ 'vue-ui-accordion-headless': hideDetails }">
                <div class="vue-ui-accordion-head" :style="`background:${FINAL_CONFIG.head.backgroundColor};padding:${FINAL_CONFIG.head.padding}; ${hideDetails ? 'height: 0px !important; padding: 0 !important;' : ''}`">
                    <div class="vue-ui-accordion-arrow" v-if="!hideDetails">
                        <slot name="arrow" v-if="FINAL_CONFIG.head.useArrowSlot" v-bind="{ backgroundColor: FINAL_CONFIG.head.backgroundColor, color: FINAL_CONFIG.head.color, iconColor: FINAL_CONFIG.head.iconColor, isOpen }" />
                        <BaseIcon :name="FINAL_CONFIG.head.icon" v-else :stroke="FINAL_CONFIG.head.iconColor" :size="FINAL_CONFIG.head.iconSize" />
                    </div>
                    <slot name="title" v-bind="{ color: FINAL_CONFIG.head.color, isOpen }"/>
                </div>
            </summary>
        </details>
        <div class="vue-ui-accordion-content" :style="`background:${FINAL_CONFIG.body.backgroundColor};color:${FINAL_CONFIG.body.color}`">
            <slot name="content" v-bind="{ backgroundColor: FINAL_CONFIG.body.backgroundColor, color: FINAL_CONFIG.body.color, isOpen }"/>
        </div>
    </div>
</template>

<style scoped>
summary {
    user-select: none;
    cursor: pointer;
}

details {
    overflow: hidden;
}

details>summary {
    list-style: none;
}

.vue-ui-accordion-head {
    display: flex;
    flex-direction: row;
    gap: 6px;
}

.vue-ui-accordion-arrow {
    display: flex;
    place-items: center;
    justify-content: center;
    width: fit-content;
    transform: rotate(0deg);
    transition: transform 0.3s ease-in-out;
    transform-origin: center;
}

details[open]>summary .vue-ui-accordion-arrow {
    transform: rotate(90deg);
}

details summary::-webkit-details-marker {
    display: none;
}

div.vue-ui-accordion-content {
    opacity: 0;
    box-sizing: border-box;
    max-height: 0;
    overflow: hidden;
    transition: max-height 400ms ease-out, opacity 400ms ease-out;
    pointer-events: none;
}

details[open]+div.vue-ui-accordion-content {
    max-height: v-bind(maxHeight);
    transition: max-height 1s ease-out, opacity 1s ease-out;
    opacity: 1;
    pointer-events: auto;
}

details[open] span::before {
    rotate: 90deg;
    transition: rotate 200ms ease-out;
}
</style>