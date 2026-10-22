import { ref } from 'vue';

/**
 * Positions a tooltip relative to pointer coordinates, shifting it at chart edges.
 * @param {object} options - Measured elements and pointer position.
 * @param {HTMLElement | null} options.tooltip - Tooltip element to measure.
 * @param {Element | null} options.chart - Chart bounding the placement.
 * @param {{x: number, y: number}} options.clientPosition - Viewport pointer coordinates.
 * @param {'center' | 'left' | 'right'} [options.positionPreference='center'] - Preferred horizontal placement.
 * @param {number} [options.defaultOffsetY=24] - Vertical gap in CSS pixels.
 * @param {number} [options.defaultOffsetX=0] - Horizontal gap in CSS pixels.
 * @param {boolean} [options.blockShiftY=false] - Prevent flipping above the pointer.
 * @returns {{top: number, left: number}} Viewport coordinates in CSS pixels.
 */
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
