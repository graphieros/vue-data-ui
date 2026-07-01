<script setup>
import { isValidUserValue } from '../lib';
import Shape from './Shape.vue';

const props = defineProps({
    legendSet: {
        type: Array,
        default() {
            return [];
        },
    },
    config: {
        type: Object,
        default() {
            return {};
        },
    },
    id: {
        type: String,
        default: '',
    },
    clickable: {
        type: Boolean,
        default: true,
    },
    isCursorPointer: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['clickMarker', 'focusMarker']);

function handleClick(legend, i) {
    if (!props.clickable) return;
    emit('clickMarker', { legend, i });
}

function handleKeydown(event, legend, i) {
    if (!props.clickable) return;

    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleClick(legend, i);
    }
}

function handleFocus(event, legend, i) {
    event.preventDefault();
    emit('focusMarker', { legend, i });
}

function hasLegendGradient(legend) {
    return Array.isArray(legend.gradientColors) && legend.gradientColors.length;
}

function getLegendGradientId(legend, i) {
    const baseId = props.id || props.config.cy || 'legend';
    const colorsId = hasLegendGradient(legend)
        ? legend.gradientColors.join('_')
        : '';
    return `${baseId}_${legend.seriesIndex ?? i}_${i}_${colorsId}_gradient`
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 160);
}

function getLegendGradientOffset(colorIndex, colorsLength) {
    if (colorsLength === 1) return '0%';
    return `${(colorIndex / (colorsLength - 1)) * 100}%`;
}

function getLegendMarkerViewBox(legend) {
    if (hasLegendGradient(legend)) return '0 0 90 60';
    return legend.shape && legend.shape === 'star'
        ? '-10 -10 80 80'
        : '0 0 60 60';
}
</script>

<template>
    <div
        :id="id"
        :data-cy="config.cy"
        class="vue-data-ui-legend"
        :style="{
            background: config.backgroundColor,
            color: config.color,
            paddingBottom: (config.paddingBottom ?? 0) + 'px',
            paddingTop: (config.paddingTop ?? 12) + 'px',
            fontWeight: config.fontWeight,
            fontSize: `var(--legend-font-size, ${config.fontSize ?? 14}px)`,
        }"
    >
        <slot name="legendTitle" :titleSet="legendSet" />

        <!-- For BaseLegendToggle -->
        <slot name="legendToggle" />

        <div
            v-for="(legend, i) in legendSet"
            :key="`legend_${i}`"
            :class="{
                'vue-data-ui-legend-item': true,
                active: clickable && isCursorPointer,
            }"
            :role="clickable ? 'button' : undefined"
            :tabindex="clickable ? 0 : undefined"
            @keydown="handleKeydown($event, legend, i)"
            @focus="handleFocus($event, legend, i)"
        >
            <svg
                data-cy="legend-marker"
                v-if="legend.shape"
                @click="handleClick(legend, i)"
                height="1em"
                :width="hasLegendGradient(legend) ? '1.4em' : '1em'"
                :viewBox="getLegendMarkerViewBox(legend)"
                :style="`overflow: visible; opacity:${legend.opacity}`"
                aria-hidden="true"
            >
                <defs v-if="hasLegendGradient(legend)">
                    <linearGradient
                        :id="getLegendGradientId(legend, i)"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                    >
                        <stop
                            v-for="(color, colorIndex) in legend.gradientColors"
                            :key="`legend_gradient_${i}_${colorIndex}`"
                            :offset="
                                getLegendGradientOffset(
                                    colorIndex,
                                    legend.gradientColors.length,
                                )
                            "
                            :stop-color="color"
                        />
                    </linearGradient>
                </defs>
                <rect
                    v-if="hasLegendGradient(legend)"
                    x="3"
                    y="12"
                    width="84"
                    height="38"
                    rx="21"
                    stroke="none"
                    :fill="`url(#${getLegendGradientId(legend, i)})`"
                />
                <Shape
                    v-else
                    stroke="none"
                    :shape="legend.shape"
                    :radius="30"
                    :plot="{
                        x: 30,
                        y: legend.shape === 'triangle' ? 36 : 30,
                    }"
                    :fill="legend.color"
                />
                <slot
                    name="legend-pattern"
                    v-bind="{
                        legend,
                        index: isValidUserValue(legend.absoluteIndex)
                            ? legend.absoluteIndex
                            : i,
                    }"
                />
            </svg>
            <slot name="item" :legend="legend" :index="i" />
        </div>

        <slot name="after" />
    </div>
</template>

<style scoped>
.vue-data-ui-legend {
    user-select: none;
    height: fit-content;
    width: 100%;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    column-gap: 18px;
}

.vue-data-ui-legend-item {
    user-select: none;
    display: flex;
    align-items: center;
    gap: 6px;
    height: fit-content;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.active {
    cursor: pointer;
}

.vue-data-ui-legend-item:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
}
</style>
