import { computed, toValue } from 'vue';
import { useMouseInElement } from './useMouseInElement';

/**
 * Chooses the side opposite the pointer to keep a chart tooltip visible.
 * Call during setup. Outside the chart, the preference resets to center.
 *
 * @param {import('vue-data-ui').TooltipPositionTarget} chartRef - Chart element, component, ref, or getter.
 * @returns {import('vue').ComputedRef<'left' | 'right' | 'center'>} Reactive placement preference.
 */
export function useTooltipPosition(chartRef) {
    const target = computed(() => {
        const value = toValue(chartRef);
        if (!value) return null;
        if (value instanceof HTMLElement) return value;
        return value.$el || null;
    });

    const { elementX, elementWidth, isOutside } = useMouseInElement(target);

    return computed(() => {
        if (isOutside.value || elementWidth.value === 0) return 'center';
        return elementX.value > elementWidth.value / 2 ? 'left' : 'right';
    });
}
