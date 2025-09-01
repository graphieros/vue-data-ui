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

    function minOf(arr) {
        let m = arr[0];
        for (let i = 1; i < arr.length; i += 1) if (arr[i] < m) m = arr[i];
        return m;
    }
    function maxOf(arr) {
        let m = arr[0];
        for (let i = 1; i < arr.length; i += 1) if (arr[i] > m) m = arr[i];
        return m;
    }

    function getTransformedBBox(el) {
        const svg = el.ownerSVGElement;
        if (!svg) return { x: 0, y: 0, width: 0, height: 0 };

        const b = el.getBBox();
        const m = el.getCTM();

        const corners = [
            { x: b.x, y: b.y },
            { x: b.x + b.width, y: b.y },
            { x: b.x, y: b.y + b.height },
            { x: b.x + b.width, y: b.y + b.height }
        ].map((p) => {
            const pt = svg.createSVGPoint();
            pt.x = p.x;
            pt.y = p.y;
            const t = m ? pt.matrixTransform(m) : pt;
            return { x: t.x, y: t.y };
        });

        const xs = corners.map((p) => p.x);
        const ys = corners.map((p) => p.y);

        const minX = minOf(xs);
        const maxX = maxOf(xs);
        const minY = minOf(ys);
        const maxY = maxOf(ys);

        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }

    function fitsWithinBounds(el, bounds, padding = 1) {
        const { x, y, width, height } = getTransformedBBox(el);
        const leftOK = x >= bounds.x + padding;
        const rightOK = x + width <= bounds.x + bounds.width - padding;
        const topOK = y >= bounds.y + padding;
        const bottomOK = y + height <= bounds.y + bounds.height - padding;
        return leftOK && rightOK && topOK && bottomOK;
    }

    function shrinkToFit(el, bounds, startSize, minSize, attempts = 120, padding = 1) {
        let current = startSize;
        let tries = 0;
        while (tries < attempts) {
            el.setAttribute('font-size', current);
            if (fitsWithinBounds(el, bounds, padding)) break;
            if (current <= minSize) break;
            current -= 0.5;
            tries += 1;
        }
        return current < minSize ? minSize : current;
    }

    function autoSizeLabelsNow() {
        const container = svgRef.value;
        if (!container) return;

        const [x, y, w, h] = container.getAttribute("viewBox").split(" ").map(Number);
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
            .map((lt) => container.querySelectorAll(lt.selector).length)
            .reduce((a, b) => a + b, 0);

        if (totalMatches === 0) return;

        labelTypes.forEach(({ selector, baseSize, minSize, sizeRef }) => {
            container.querySelectorAll(selector).forEach((el) => {
                const initial = autoFontSize({
                    el,
                    bounds,
                    currentFontSize: baseSize,
                    minFontSize: minSize,
                    attempts: 200,
                    padding: 1
                });

                const final = shrinkToFit(el, bounds, initial, minSize, 120, 1);
                el.setAttribute('font-size', final);
                sizeRef.value = final;
            });
        });
    }

    function autoSizeLabels() {
        if (rafScheduled) cancelAnimationFrame(rafScheduled);
        rafScheduled = requestAnimationFrame(() => {
            rafScheduled = null;
            autoSizeLabelsNow();
        });
    }

    return { autoSizeLabels };
}
