export function useResponsive({
    chart,
    title = null,
    slicer = null,
    legend = null,
    source = null,
    noTitle = null,
    padding = null
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
        const { height:parentHeight, width: parentWidth } = parent.getBoundingClientRect();
    
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
    
        height = parentHeight 
            - heightTitle 
            - heightSlicer
            - heightLegend 
            - heightSource
            - heightNoTitle
            - heightPadding;
            
        width = parentWidth
            - widthPadding;
    }

    return {
        width,
        height,
        heightTitle,
        heightNoTitle,
        heightSource,
        heightNoTitle,
        heightLegend
    }
}