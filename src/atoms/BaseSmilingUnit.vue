<script setup>
import { shiftHue, XMLNS } from "../lib";

const props = defineProps({
    config: { type: Object },
    unit: { type: Number },
    currentRating: { type: Number },
    getActiveColor: { type: Function },
    calcShapeFill: { type: Function },
    isReadonly: { type: Boolean },
    hasBreakdown: { type: Boolean },
    hoveredValue: { type: Number }
});

const emit = defineEmits(['rate', 'mouseenter', 'mouseleave',])

</script>

<template>
    <div 
        :data-cy="`smiley-item-${unit - 1}`" 
        tabindex="0" 
        :class="{ 'vue-ui-smiley-rated' : !config.readonly && currentRating === unit }"
        :style="{
            cursor: config.readonly ? 'default' : 'pointer',
            height: config.style.itemSize + 'px',
            aspectRatio: '1/1',
            position: 'relative'
        }"
        @mouseenter="emit('mouseenter')" 
        @mouseleave="emit('mouseleave')" 
        @click="emit('rate', unit)" 
        @keyup.enter="emit('rate', unit)"
    >
        <template v-if="config.style.tooltip.show && hasBreakdown && isReadonly">
            <div 
                :data-cy="`smiley-tooltip-${unit - 1}`" 
                class="vue-ui-rating-tooltip" 
                :style="{
                    border: `1px solid ${config.style.tooltip.borderColor}`,
                    position: 'absolute',
                    top: `${config.style.tooltip.offsetY - 48}px`,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'fit-content',
                    textAlign: 'center',
                    background: config.style.tooltip.backgroundColor,
                    display: hoveredValue === unit - 1 ? 'block' : 'none',
                    padding: '2px 12px',
                    borderRadius: config.style.tooltip.borderRadius + 'px',
                    boxShadow: config.style.tooltip.boxShadow
                }"
            >
                <div :style="{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '6px',
                        position: 'relative',
                        textAlign: 'center',
                        color: config.style.tooltip.color
                    }"
                >
                    <span :style="`font-size:${config.style.tooltip.fontSize}px`">{{ unit }}:</span>
                    <span :style="`font-weight:${config.style.tooltip.bold ? 'bold' : 'normal'};font-size:${config.style.tooltip.fontSize}px`">
                        <slot name="rating"></slot>
                    </span>

                    <div :style="`font-family:Arial !important;position:absolute;top:calc(100% - 4px);left:50%;transform:translateX(-50%);color:${config.style.tooltip.borderColor}`">
                        ▼
                    </div>
                </div>
            </div>
        </template>

        <svg :xmlns="XMLNS" v-if="config.style.icons.filled" style="transition: all 0.1s ease-in-out;position:absolute;top:0;left:0" height="100%" viewBox="0 0 24 24" stroke-width="1.5" :stroke="getActiveColor(unit - 1)" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <defs>
                <radialGradient :id="`vueUiSmiley${unit - 1}`">
                    <stop offset="0%" :stop-color="shiftHue(config.style.colors.active[unit - 1], 0.05)"/>
                    <stop offset="100%" :stop-color="config.style.colors.active[unit - 1]"/>
                </radialGradient>
            </defs>
            <slot name="path-icon-filled"></slot>
        </svg>

        <svg v-else style="position:absolute;top:0;left:0;transition: all 0.1s ease-in-out;" height="100%" viewBox="0 0 24 24" stroke-width="1.5" :stroke="getActiveColor(unit - 1)" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <slot name="path-icon"></slot>
        </svg>

        <!-- RATING -->
        <svg :xmlns="XMLNS" v-if="config.style.icons.filled && isReadonly" style="transition: all 0.1s ease-in-out;position:absolute;top:0;left:0" height="100%" :viewBox="`0 0 ${calcShapeFill(unit - 1)} 24`" stroke-width="1.5" :stroke="config.style.colors.activeReadonly[unit - 1]" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <defs>
                <radialGradient :id="`vueUiSmiley${unit - 1}`">
                    <stop offset="0%" :stop-color="shiftHue(config.style.colors.activeReadonly[unit - 1], 0.05)"/>
                    <stop offset="100%" :stop-color="config.style.colors.activeReadonly[unit - 1]"/>
                </radialGradient>
            </defs>
            <slot name="path-icon-filled-readonly"></slot>
        </svg>

        <svg v-if="!config.style.icons.filled && isReadonly" style="position:absolute;top:0;left:0;transition: all 0.1s ease-in-out;" height="100%" :viewBox="`0 0 ${calcShapeFill(unit - 1)} 24`" stroke-width="1.5" :stroke="config.style.colors.activeReadonly[unit - 1]" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <slot name="path-icon-readonly"></slot>
        </svg>
    </div>
</template>

<style scoped>
.vue-ui-smiley-rated {
    animation: vue-ui-smile 0.3s ease-in-out;
    transform-origin: center;
}

@keyframes vue-ui-smile {
    0% {
        transform: scale(0.9, 0.9);
    }
    50% {
        transform: scale(1.2,1.2);
    }
    75% {
        transform: scale(0.95, 0.95);
    }
    90% {
        transform: scale(1.1,1.1);
    }
    100% {
        transform: scale(1, 1);
    }
}
</style>