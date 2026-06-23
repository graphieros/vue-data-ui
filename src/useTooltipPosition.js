import { computed, toValue } from 'vue';
import { useMouseInElement } from './useMouseInElement';

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
