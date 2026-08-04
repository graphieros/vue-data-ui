<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import BaseIcon from './BaseIcon.vue';

defineOptions({
    name: 'HillActions',
});

const props = defineProps({
    isEditing: {
        type: Boolean,
        default: false,
    },
    isEditable: {
        type: Boolean,
        default: true,
    },
    isFullscreen: {
        type: Boolean,
        default: false,
    },
    position: {
        type: String,
        default: 'left',
        validator: (value) => ['left', 'right'].includes(value),
    },
    color: {
        type: String,
        default: '#2D353C',
    },
    backgroundColor: {
        type: String,
        default: '#FFFFFF',
    },
    translations: {
        type: Object,
        default() {
            return {
                edit: 'Edit',
                cancel: 'Cancel',
                save: 'Save',
            };
        },
    },
    showTooltips: {
        type: Boolean,
        default: true,
    },
    isCursorPointer: {
        type: Boolean,
        default: false,
    },
    zIndex: {
        type: Number,
        default: 1,
    },
});

const emit = defineEmits(['update', 'cancel', 'save']);

const isDesktop = ref(true);
const activeTooltip = ref(null);

const rootStyle = computed(() => ({
    zIndex: props.zIndex,
    position: props.isFullscreen ? 'fixed' : 'absolute',
    top: '0',
    left:
        props.position === 'left'
            ? props.isFullscreen
                ? '12px'
                : '0'
            : 'auto',
    right:
        props.position === 'right'
            ? props.isFullscreen
                ? '12px'
                : '0'
            : 'auto',
    height: '36px',
    padding: '4px',
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    overflow: 'visible',
}));

const buttonStyle = computed(() => ({
    cursor: props.isCursorPointer ? 'pointer' : 'default',
    background: props.backgroundColor,
    color: props.color,
}));

function updateDesktopState() {
    if (typeof window === 'undefined') {
        isDesktop.value = true;
        return;
    }

    isDesktop.value = window.innerWidth > 600;
}

function showTooltip(action) {
    updateDesktopState();
    activeTooltip.value = action;
}

function hideTooltip(action) {
    if (activeTooltip.value === action) {
        activeTooltip.value = null;
    }
}

function tooltipClass(action) {
    return {
        'button-info-left': props.position === 'left',
        'button-info-right': props.position === 'right',
        'button-info-left-visible':
            props.position === 'left' && activeTooltip.value === action,
        'button-info-right-visible':
            props.position === 'right' && activeTooltip.value === action,
    };
}

function showActionTooltip(action) {
    if (!props.showTooltips) {
        return;
    }

    showTooltip(action);
}

function emitAction(action) {
    hideTooltip(action);
    emit(action);
}

onMounted(() => {
    updateDesktopState();
    window.addEventListener('resize', updateDesktopState, {
        passive: true,
    });
});

onBeforeUnmount(() => {
    window.removeEventListener('resize', updateDesktopState);
});
</script>

<template>
    <div
        v-if="isEditable"
        class="vue-ui-hill-actions"
        :style="rootStyle"
        data-dom-to-png-ignore
    >
        <button
            v-if="!isEditing"
            type="button"
            class="vue-ui-hill-actions__button"
            :style="buttonStyle"
            :aria-label="translations.edit"
            @mouseenter="showActionTooltip('update')"
            @mouseout="hideTooltip('update')"
            @focus="showActionTooltip('update')"
            @blur="hideTooltip('update')"
            @click="emitAction('update')"
        >
            <slot name="hill-edit">
                <BaseIcon
                    name="move"
                    :stroke="color"
                    style="pointer-events: none"
                />
            </slot>

            <div
                v-if="showTooltips && isDesktop && translations.edit"
                data-cy="hill-actions-tooltip"
                dir="auto"
                :class="tooltipClass('update')"
                :style="{
                    background: backgroundColor,
                    color,
                }"
            >
                {{ translations.edit }}
            </div>
        </button>

        <template v-else>
            <button
                type="button"
                class="vue-ui-hill-actions__button"
                :style="buttonStyle"
                :aria-label="translations.cancel"
                @mouseenter="showActionTooltip('cancel')"
                @mouseout="hideTooltip('cancel')"
                @focus="showActionTooltip('cancel')"
                @blur="hideTooltip('cancel')"
                @click="emitAction('cancel')"
            >
                <slot name="hill-cancel">
                    <BaseIcon
                        name="circleCancel"
                        :stroke="color"
                        style="pointer-events: none"
                    />
                </slot>

                <div
                    v-if="showTooltips && isDesktop && translations.cancel"
                    data-cy="hill-actions-tooltip"
                    dir="auto"
                    :class="tooltipClass('cancel')"
                    :style="{
                        background: backgroundColor,
                        color,
                    }"
                >
                    {{ translations.cancel }}
                </div>
            </button>

            <button
                type="button"
                class="vue-ui-hill-actions__button"
                :style="buttonStyle"
                :aria-label="translations.save"
                @mouseenter="showActionTooltip('save')"
                @mouseout="hideTooltip('save')"
                @focus="showActionTooltip('save')"
                @blur="hideTooltip('save')"
                @click="emitAction('save')"
            >
                <slot name="hill-save">
                    <BaseIcon
                        name="save"
                        :stroke="color"
                        style="pointer-events: none"
                    />
                </slot>

                <div
                    v-if="showTooltips && isDesktop && translations.save"
                    data-cy="hill-actions-tooltip"
                    dir="auto"
                    :class="tooltipClass('save')"
                    :style="{
                        background: backgroundColor,
                        color,
                    }"
                >
                    {{ translations.save }}
                </div>
            </button>
        </template>
    </div>
</template>

<style scoped>
.vue-ui-hill-actions {
    min-width: 36px;
    display: flex;
    flex-direction: column;
}

.vue-ui-hill-actions__button {
    all: unset;
    box-sizing: border-box;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    height: auto;
    padding: 3px;
    overflow: visible;
    white-space: nowrap;
    border: 1px solid transparent;
    border-radius: 3px;
    background: inherit;
    overflow: visible;
}

.vue-ui-hill-actions__button:hover {
    background: rgba(0, 0, 0, 0.05) !important;
}

.vue-ui-hill-actions__button:focus-visible {
    outline: 1px solid #cccccc;
}

.button-info-right,
.button-info-left {
    position: absolute;
    top: 50%;
    z-index: 2147483000;
    padding: 4px 12px;
    pointer-events: none;
    opacity: 0;
    transform: translateY(-50%);
}

.button-info-right {
    right: 100%;
    border-radius: 4px 0 0 4px;
}

.button-info-left {
    left: 100%;
    border-radius: 0 4px 4px 0;
}

.button-info-right-visible {
    opacity: 1;
    animation: showHillActionInfoRight 0.2s ease-in forwards;
}

.button-info-left-visible {
    opacity: 1;
    animation: showHillActionInfoLeft 0.2s ease-in forwards;
}

@keyframes showHillActionInfoRight {
    from {
        opacity: 0;
        transform: translateY(-50%) scale(0.9, 1);
    }

    to {
        opacity: 1;
        transform: translateY(-50%) scale(1, 1);
    }
}

@keyframes showHillActionInfoLeft {
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
