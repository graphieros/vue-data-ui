<script setup>
import { ref, computed, watch, onMounted } from "vue";
import BaseIcon from "../atoms/BaseIcon.vue";
import { useNestedProp } from "../useNestedProp";
import mainConfig from "../default_configs.json";
import { createUid } from "../lib";

const props = defineProps({
    config: {
        type: Object,
        default() {
            return {}
        }
    },
});

const defaultConfig = ref(mainConfig.vue_ui_accordion);

const accordionConfig = computed(() => {
    return useNestedProp({
        userConfig: props.config,
        defaultConfig: defaultConfig.value
    });
});

const isOpen = ref(props.config.open);
const uid = ref(createUid())
const details = ref(null);
const init = ref(0)

onMounted(() => {
    details.value.open = accordionConfig.value.open;
})

function toggleDetails() {
    if(init.value > 0 || !accordionConfig.value.open) {
        isOpen.value = !isOpen.value;
    }
    init.value += 1;
}

const maxHeight = computed(() => {
    return `${accordionConfig.value.maxHeight}px`
})

</script>

<template>
    <div>
        <details :id="`details_${uid}`" ref="details" @toggle="toggleDetails">
            <summary>
                <div class="vue-ui-accordion-head" :style="`background:${accordionConfig.head.backgroundColor};padding:${accordionConfig.head.padding};`">
                    <div class="vue-ui-accordion-arrow">
                        <slot name="arrow" v-if="accordionConfig.head.useArrowSlot" v-bind="{ backgroundColor: accordionConfig.head.backgroundColor, color: accordionConfig.head.color, iconColor: accordionConfig.head.iconColor, isOpen }" />
                        <BaseIcon name="arrowRight" v-else :stroke="accordionConfig.head.iconColor" />
                    </div>
                    <slot name="title" v-bind="{ color: accordionConfig.head.color, isOpen }"/>
                </div>
            </summary>
        </details>
        <div class="vue-ui-accordion-content" :style="`background:${accordionConfig.body.backgroundColor};color:${accordionConfig.body.color}`">
            <slot name="content" v-bind="{ backgroundColor: accordionConfig.body.backgroundColor, color: accordionConfig.body.color, isOpen }"/>
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
}

details[open]+div.vue-ui-accordion-content {
    max-height: v-bind(maxHeight);
    transition: max-height 1s ease-out, opacity 1s ease-out;
    opacity: 1;
}

details[open] span::before {
    rotate: 90deg;
    transition: rotate 200ms ease-out;
}
</style>