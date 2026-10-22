/**
 * Measures available chart space inside its parent after subtracting surrounding UI.
 * This is a synchronous measurement; callers decide when to remeasure.
 * @param {object} options - Mounted chart elements and optional padding.
 * @param {Element | null} options.chart - Chart whose parent supplies the available size.
 * @param {Element | null} [options.title=null] - Title occupying vertical space.
 * @param {Element | null} [options.slicer=null] - Slicer occupying vertical space.
 * @param {Element | null} [options.legend=null] - Legend occupying vertical space.
 * @param {Element | null} [options.source=null] - Source label occupying vertical space.
 * @param {Element | null} [options.noTitle=null] - Alternate title occupying vertical space.
 * @param {{top: number, bottom: number, left: number, right: number} | null} [options.padding=null] - Padding in CSS pixels.
 * @returns {object} Available width/height and measured surrounding element heights.
 */
export function useResponsive({
    chart,
    title = null,
    slicer = null,
    legend = null,
    source = null,
    noTitle = null,
    padding = null,
}) {
    let height = 0;
    let width = 0;
    let heightTitle = 0;
    let heightSlicer = 0;
    let heightLegend = 0;
    let heightSource = 0;
    let heightNoTitle = 0;
    let heightPadding = 0;
    let widthPadding = 0;

    if (!!chart) {
        const parent = chart.parentNode;
        const { height: parentHeight, width: parentWidth } =
            parent.getBoundingClientRect();

        if (title) {
            heightTitle = title.getBoundingClientRect().height;
        } else {
            heightTitle = 0;
        }
        if (slicer) {
            heightSlicer = slicer.getBoundingClientRect().height;
        } else {
            heightSlicer = 0;
        }
        if (legend) {
            heightLegend = legend.getBoundingClientRect().height;
        } else {
            heightLegend = 0;
        }
        if (source) {
            heightSource = source.getBoundingClientRect().height;
        } else {
            heightSource = 0;
        }
        if (noTitle) {
            heightNoTitle = noTitle.getBoundingClientRect().height;
        } else {
            heightNoTitle = 0;
        }
        if (padding) {
            heightPadding = padding.top + padding.bottom;
            widthPadding = padding.right + padding.left;
        } else {
            heightPadding = 0;
            widthPadding = 0;
        }

        height =
            parentHeight -
            heightTitle -
            heightSlicer -
            heightLegend -
            heightSource -
            heightNoTitle -
            heightPadding;

        width = parentWidth - widthPadding;
    }

    return {
        width,
        height,
        heightTitle,
        heightNoTitle,
        heightSource,
        heightNoTitle,
        heightLegend,
    };
}
