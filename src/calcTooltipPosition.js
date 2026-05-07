import { ref } from 'vue';

export function calcTooltipPosition({
    tooltip,
    chart,
    clientPosition,
    positionPreference = 'center',
    defaultOffsetY = 24,
    defaultOffsetX = 0,
    blockShiftY = false,
}) {
    const offsetX = ref(defaultOffsetX);
    const offsetY = ref(defaultOffsetY);

    if (tooltip && chart) {
        const { width, height } = tooltip.getBoundingClientRect();
        const { right, left, bottom } = chart.getBoundingClientRect();

        if (positionPreference === 'center') {
            if (clientPosition.x + width / 2 > right) {
                offsetX.value = -width + (right - clientPosition.x);
            } else if (clientPosition.x - width / 2 < left) {
                offsetX.value = -width + (width - (clientPosition.x - left));
            } else {
                offsetX.value = -width / 2;
            }
        }

        if (positionPreference === 'right') {
            if (clientPosition.x + width + defaultOffsetX > right) {
                offsetX.value = -width + (right - clientPosition.x);
            } else {
                offsetX.value = defaultOffsetX;
            }
        }

        if (positionPreference === 'left') {
            if (clientPosition.x - width - defaultOffsetX < left) {
                offsetX.value = left - clientPosition.x;
            } else {
                offsetX.value = -width - defaultOffsetX;
            }
        }

        if (clientPosition.y + height > bottom && !blockShiftY) {
            offsetY.value = -height - defaultOffsetY;
        }
    }

    return {
        top: clientPosition.y + offsetY.value,
        left: clientPosition.x + offsetX.value,
    };
}
