import { ref } from "vue";

export function calcTooltipPosition({ tooltip, chart, clientPosition}) {
    const offsetX = ref(0);
    const offsetY = ref(48);
    if (tooltip && chart) {
        const { width, height } = tooltip.getBoundingClientRect();
        const { right, left, bottom } = chart.getBoundingClientRect();

        if (clientPosition.x + width / 2 > right) {
            offsetX.value = -width;
        } else if (clientPosition.x - width / 2 < left) {
            offsetX.value = 0;
        } else {
            offsetX.value = -width / 2;
        }

        if (clientPosition.y + height > bottom) {
            offsetY.value = -height - 48;
        }
    }
    return {
        top: clientPosition.y + offsetY.value,
        left: clientPosition.x + offsetX.value
    }
}