export function useResponsive({
    chart,
    title = null,
    slicer = null,
    legend = null,
    source = null,
    noTitle = null,
}) {
    let height = 0;
    let width = 0;
    let heightTitle = 0;
    let heightSlicer = 0;
    let heightLegend = 0;
    let heightSource = 0;
    let heightNoTitle = 0;

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
            heightNoTitle = noTitle.getBoundingClientRect().height
        }
    
        height = parentHeight 
            - heightTitle 
            - heightSlicer
            - heightLegend 
            - heightSource
            - heightNoTitle;
            
        width = parentWidth;
    }

    return {
        width,
        height,
        heightTitle,
        heightNoTitle
    }
}