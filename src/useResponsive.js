export function useResponsive({
    chart,
    title = null,
    slicer = null,
    legend = null,
}) {
    let height = 0;
    let width = 0;

    if (!!chart) {
        const parent = chart.parentNode;
        const { height:parentHeight, width: parentWidth } = parent.getBoundingClientRect();
    
        let heightTitle = 0;
        let heightSlicer = 0;
        let heightLegend = 0;
    
        if (title) {
            heightTitle = title.getBoundingClientRect().height;
        }
        if (slicer) {
            heightSlicer = slicer.getBoundingClientRect().height;
        }
        if (legend) {
            heightLegend = legend.getBoundingClientRect().height;
        }
    
        height = parentHeight - heightTitle - heightSlicer - heightLegend;
        width = parentWidth;
    }

    return {
        width,
        height
    }
}