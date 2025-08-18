import { nextTick } from "vue";

export function useFitSvgText({
    svgRef,
    unitWidth,
    fontSize = 12,
    step = 0.5,
    maxIterations = 60,
    hideUnderMin = true
}) {
    const originals = new WeakMap();

    const parsePx = (v) => {
        if (typeof v === "number") return v;
        if (!v) return NaN;
        const n = parseFloat(String(v).replace("px", ""));
        return Number.isFinite(n) ? n : NaN;
    };

    const getFontSize = (el) => {
        const attr = parsePx(el.getAttribute("font-size"));
        if (Number.isFinite(attr)) return attr;
        const cs = window.getComputedStyle(el);
        return parsePx(cs.fontSize) || fontSize;
    };

    const setFontSize = (el, sizePx) => {
        el.setAttribute("font-size", String(sizePx));
    };

    const resetFontSize = (el) => {
        if (originals.has(el)) {
            setFontSize(el, originals.get(el));
        } else {
            const base = getFontSize(el);
            originals.set(el, base);
            setFontSize(el, base);
        }
    };

    const measureWidth = (el) => {
        try {
            const box = el.getBBox();
            return box.width || 0;
        } catch {
            return 0;
        }
    };

    const fitText = async (selector, minFontSize = 6) => {
        await nextTick();
        const svg = svgRef?.value;
        if (!svg) return;
    
        const nodes = svg.querySelectorAll(selector);
        if (!nodes.length) return;
    
        const targetWidth = Math.max(0, unitWidth.value);
        if (targetWidth <= 0) return;
    
        const results = [];
        nodes.forEach((el) => {
            const prevDisplay = el.style.display;
            const prevOpacity = el.style.opacity;
            el.style.display = "";
            el.style.opacity = "0";
    
            resetFontSize(el);
    
            let width = measureWidth(el);
            let baseSize = getFontSize(el);
            let size = baseSize;
            let iter = 0;
    
            if (width <= targetWidth) {
                results.push({ el, finalSize: baseSize, fits: true });
            } else {
                while (width > targetWidth && size > minFontSize && iter < maxIterations) {
                    size = Math.max(minFontSize, size - step);
                    setFontSize(el, size);
                    width = measureWidth(el);
                    iter += 1;
                }
                const fits = width <= targetWidth && size > minFontSize;
                results.push({ el, finalSize: size, fits });
    
                setFontSize(el, baseSize);
            }
            el.style.display = prevDisplay;
            el.style.opacity = prevOpacity;
        });
    
        const shouldHideAll = hideUnderMin && results.some(r => !r.fits);

        results.forEach(({ el, finalSize, fits }) => {
            if (shouldHideAll) {
                el.style.display = "none";
            } else {
                el.style.display = "";
                setFontSize(el, finalSize);
            }
        });
    };
    
    return {
        fitText
    };
}
