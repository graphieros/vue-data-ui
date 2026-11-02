<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import BaseDraggableDialog from './BaseDraggableDialog.vue';
import ColorPicker from './ColorPicker.vue';
import {
    xyAnalysisOptionKeys,
    defaultXyAnalysisOptions,
    resolveXyAnalysisOptions,
} from '../utils/xyAnalysisInsights';

const props = defineProps({
    messages: { type: Object, required: true },
    selected: { type: Object, default: defaultXyAnalysisOptions },
    series: { type: Array, default: () => [] },
    selectedSeries: { type: Array, default: null },
    appearance: {
        type: Object,
        default: () => ({ color: '#2D353C', fontSize: 16, strokeWidth: 2 }),
    },
    palette: Array,
    isFullscreen: Boolean,
    fullscreenParent: Object,
    fontFamily: String,
    isCursorPointer: Boolean,
    color: String,
    backgroundColor: String,
});

const emit = defineEmits(['apply', 'cancel', 'preview']);
const panel = ref(null);
const draft = ref({ ...props.selected });
const draftAppearance = ref({ ...props.appearance });

const availableOptions = computed(() =>
    xyAnalysisOptionKeys.filter(
        (key) => props.messages.options?.[key] !== false,
    ),
);

const draftSeries = ref(
    props.selectedSeries
        ? [...props.selectedSeries]
        : props.series.map((series) => series.id),
);

function selection() {
    return {
        options: resolveXyAnalysisOptions(draft.value, props.messages.options),
        seriesIds: [...draftSeries.value],
        appearance: { ...draftAppearance.value },
    };
}

watch(
    [draft, draftSeries, draftAppearance],
    () => {
        if (!resolved) emit('preview', selection());
    },
    { deep: true },
);

let resolved = false;
function cancel() {
    if (resolved) return;
    resolved = true;
    emit('cancel');
}

function apply() {
    if (resolved) return;
    resolved = true;
    emit('apply', selection());
}

onMounted(() => {
    panel.value.open();
    // Reopening after zoom must preview the remembered selection without
    // requiring a checkbox change to trigger the draft watcher.
    emit('preview', selection());
});
</script>

<template>
    <BaseDraggableDialog
        ref="panel"
        :backgroundColor="backgroundColor"
        :color="color"
        :headerBg="backgroundColor"
        :headerColor="color"
        :forcedWidth="440"
        :forcedHeight="560"
        :isFullscreen="isFullscreen"
        :fullscreenParent="fullscreenParent"
        :isCursorPointer="isCursorPointer"
        withPadding
        @close="cancel"
    >
        <template #title>{{ messages.optionsTitle }}</template>
        <template #content>
            <div
                class="vue-ui-xy-analysis-options"
                :style="{
                    color,
                    fontFamily,
                    cursor: isCursorPointer ? 'pointer' : 'default',
                }"
                data-dom-to-png-ignore
            >
                <!-- APPEARANCE KNOBS -->
                <fieldset class="vue-ui-xy-analysis-appearance">
                    <legend>{{ messages.appearanceTitle }}</legend>
                    <div class="vue-ui-xy-analysis-color">
                        <span>{{ messages.colorLabel }}</span>
                        <div class="vue-ui-xy-analysis-color-control">
                            <ColorPicker
                                v-model:value="draftAppearance.color"
                                :backgroundColor="backgroundColor"
                                :buttonBorderColor="color"
                                :palette="palette"
                                :isCursorPointer="isCursorPointer"
                                teleported
                            />
                        </div>
                    </div>
                    <label>
                        <span
                            >{{ messages.fontSizeLabel }}:
                            {{ draftAppearance.fontSize }}</span
                        >
                        <input
                            data-cy="analysis-font-size"
                            type="range"
                            min="6"
                            max="24"
                            step="1"
                            v-model.number="draftAppearance.fontSize"
                            :style="{ accentColor: color }"
                        />
                    </label>
                    <label>
                        <span
                            >{{ messages.strokeWidthLabel }}:
                            {{ draftAppearance.strokeWidth }}</span
                        >
                        <input
                            data-cy="analysis-stroke-width"
                            type="range"
                            min="0.5"
                            max="12"
                            step="0.1"
                            v-model.number="draftAppearance.strokeWidth"
                            :style="{ accentColor: color }"
                        />
                    </label>
                </fieldset>

                <!-- SERIES SELECTION -->
                <fieldset
                    v-if="series.length > 1"
                    class="vue-ui-xy-analysis-series"
                >
                    <legend>{{ messages.seriesTitle }}</legend>
                    <label v-for="seriesItem in series" :key="seriesItem.id">
                        <input
                            type="checkbox"
                            v-model="draftSeries"
                            :value="seriesItem.id"
                            :data-series-id="seriesItem.id"
                        />
                        <span>{{ seriesItem.name || messages.series }}</span>
                    </label>
                </fieldset>

                <!-- ANALYSIS OPTIONS -->
                <fieldset>
                    <legend>{{ messages.optionsTitle }}</legend>
                    <label v-for="key in availableOptions" :key="key">
                        <input
                            type="checkbox"
                            v-model="draft[key]"
                            :disabled="
                                key === 'threshold' &&
                                !messages.thresholds?.some(Number.isFinite)
                            "
                        />
                        <span>{{ messages.optionLabels[key] }}</span>
                    </label>
                </fieldset>
                <p
                    v-if="
                        availableOptions.includes('threshold') &&
                        !messages.thresholds?.some(Number.isFinite)
                    "
                    class="vue-ui-xy-analysis-options-notice"
                >
                    {{ messages.thresholdUnavailable }}
                </p>
            </div>
        </template>

        <!-- ACTION BUTTONS -->
        <template #footer>
            <div
                class="vue-ui-xy-analysis-footer"
                :style="{
                    color,
                    fontFamily,
                    cursor: isCursorPointer ? 'pointer' : 'default',
                }"
            >
                <div class="vue-ui-xy-analysis-options-actions">
                    <button
                        type="button"
                        data-cy="analysis-apply"
                        @click="apply"
                    >
                        {{ messages.apply }}
                    </button>
                    <button
                        type="button"
                        data-cy="analysis-cancel"
                        @click="cancel"
                    >
                        {{ messages.cancel }}
                    </button>
                </div>
            </div>
        </template>
    </BaseDraggableDialog>
</template>

<style scoped>
.vue-ui-xy-analysis-options {
    padding-top: 12px;
    box-sizing: border-box;
}

.vue-ui-xy-analysis-appearance {
    margin-top: 16px;
    margin-bottom: 12px;
}

.vue-ui-xy-analysis-color-control {
    flex: 0 0 32px;
    width: 32px;
    height: 32px;
    position: relative;
}

.vue-ui-xy-analysis-color {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
}

.vue-ui-xy-analysis-appearance label {
    justify-content: space-between;
}

fieldset {
    border: none;
    margin: 0;
    padding: 0;
}

.vue-ui-xy-analysis-series {
    margin-bottom: 12px;
}

legend {
    font-weight: bold;
    margin-bottom: 8px;
}

label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: inherit;
}

.vue-ui-xy-analysis-options-notice {
    font-size: 0.85em;
    max-width: 280px;
}

.vue-ui-xy-analysis-options-actions {
    display: flex;
    gap: 8px;
}

input {
    cursor: inherit;
}

button {
    color: inherit;
    background: transparent;
    border: 1px solid currentColor;
    border-radius: 3px;
    padding: 3px 12px;
    font: inherit;
    cursor: inherit;
}
</style>
