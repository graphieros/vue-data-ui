import { autoFontSize } from "./lib";

export function useAutoSizeLabelsInsideViewbox({
    svgRef,
    fontSize,
    minFontSize,
    sizeRef,
    labelClass,
    labelTypes = []
}) {
    let rafScheduled = null;

    function autoSizeLabels() {
        rafScheduled = false;
        const container = svgRef.value;

        if (!container) return

        const [x, y, w, h] = container
            .getAttribute('viewBox')
            .split(' ')
            .map(Number)
        const bounds = { x, y, width: w, height: h };

        if (!labelTypes.length) {
            labelTypes = [
                {
                    selector: labelClass,
                    baseSize: fontSize,
                    minSize: minFontSize,
                    sizeRef
                }
            ];
        }

        const totalMatches = labelTypes
            .map(lt => container.querySelectorAll(lt.selector).length)
            .reduce((a, b) => a + b, 0);

        if (totalMatches === 0) return;

        labelTypes.forEach(({ selector, baseSize, minSize, sizeRef }) => {
            container
                .querySelectorAll(selector)
                .forEach(el => {
                    const final = autoFontSize({
                        el,
                        bounds,
                        currentFontSize: baseSize,
                        minFontSize: minSize,
                        attempts: 200,
                        padding: 1
                    });
                    sizeRef.value = final;
                });
            });
    }

    return {
        autoSizeLabels
    }
}