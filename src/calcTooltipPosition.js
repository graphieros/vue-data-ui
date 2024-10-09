import { ref } from "vue";

export function calcTooltipPosition({ tooltip, chart, clientPosition, positionPreference = 'center', defaultOffsetY = 24}) {
    const offsetX = ref(0);
    const offsetY = ref(defaultOffsetY);
    if (tooltip && chart) {
        const { width, height } = tooltip.getBoundingClientRect();
        const { right, left, bottom } = chart.getBoundingClientRect();

        if (positionPreference === 'center') {
            if (clientPosition.x + width / 2 > right) {
                offsetX.value = -width + (right - clientPosition.x)
            } else if (clientPosition.x - width / 2 < left) {
                offsetX.value = -width + (width - (clientPosition.x - left))
            } else {
                offsetX.value = -width / 2;
            }
        }

        if (positionPreference === 'right') {
            if (clientPosition.x + width > right) {
                offsetX.value = -width + (right - clientPosition.x)
            } else {
                offsetX.value = 0;
            }
        }

        if (positionPreference === 'left') {
            if (clientPosition.x < left + width) {
                offsetX.value = -width + (width - (clientPosition.x - left))
            } else {
                offsetX.value = -width;
            }
        }

        if (clientPosition.y + height > bottom) {
            offsetY.value = -height - defaultOffsetY;
        }
    }
    return {
        top: clientPosition.y + offsetY.value,
        left: clientPosition.x + offsetX.value
    }
}