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
        }
        if (slicer) {
            heightSlicer = slicer.getBoundingClientRect().height;
        }
        if (legend) {
            heightLegend = legend.getBoundingClientRect().height;
        }
        if (source) {
            heightSource = source.getBoundingClientRect().height;
        }
        if (noTitle) {
            heightNoTitle = noTitle.getBoundingClientRect().height;
        }
        if (padding) {
            heightPadding = padding.top + padding.bottom;
            widthPadding = padding.right + padding.left;
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
        heightNoTitle
    }
}