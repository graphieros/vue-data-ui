import { isRef, nextTick, onMounted, ref, unref, watch } from 'vue';

const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';
const DEFAULT_SANS_STACK = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif';
let CSS_CACHE = new WeakMap();

function CACHE_CSS(el) {
    let v = CSS_CACHE.get(el);
    if (!v) {
        v = getComputedStyle(el);
        CSS_CACHE.set(el, v);
    }
    return v;
}

function CLEAR_CSS_CACHE() {
    CSS_CACHE = new WeakMap();
}

function elNS(name) {
    return document.createElementNS(SVG_NS, name);
}

// Default to system fonts
function completeFontFamily(ff) {
    return `${ff}, ${DEFAULT_SANS_STACK}`;
}

export function useSvgExport({
    svg, // ref
    title, // computed
    legend, // computed
    legendItems, // computed
    backgroundColor, // computed
    stretchTitle = false, // bool (when rotateX is applied on the svg like in VueUiWheel, title transform style needs to be compensated)
    titleEmbedded = false // when title is already part of the svg (VueUiChestnut)
}) {

    const svgRef = isRef(svg) ? svg : ref(svg);
    const ready = ref(false);

    const PRESENTATION_PROPS = [
        'fill', 'fill-opacity', 'stroke', 'stroke-width', 'stroke-opacity', 'opacity', 'color',
        'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit', 'stroke-dasharray', 'stroke-dashoffset',
        'font-family', 'font-size', 'font-style', 'font-weight', 'font-variant', 'letter-spacing', 'word-spacing',
        'text-anchor', 'dominant-baseline',
        'shape-rendering', 'vector-effect', 'paint-order', 'mix-blend-mode', 'isolation',
        'filter', 'clip-path', 'mask',
        'transform', 'transform-origin', 'visibility', 'display',
    ];

    const ALWAYS_INLINE = new Set(['font-family']);

    async function waitForSvg({ timeoutMs = 4000, log = 'warn' } = {}) {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            console.warn('SVG export only works in the browser.');
            return null;
        }

        const deadline = performance.now() + timeoutMs;

        const getEl = () => {
            const el = unref(svgRef);
            return el && document.contains(el) ? el : null;
        };

        let el = getEl();
        if (el) {
            return el;
        }

        let stopped = false;
        const stop = (obs) => {
            if (!stopped && obs) {
                try {
                    obs.disconnect();
                } catch {
                    //
                }
            }
            stopped = true;
        };

        let observer;
        const seen = new Promise((resolve) => {
            try {
                observer = new MutationObserver(() => {
                    const found = getEl();
                    if (found) {
                        stop(observer);
                        resolve(found);
                    }
                });
                observer.observe(document.documentElement, { childList: true, subtree: true });
            } catch {
                resolve(null); // fallback to RAF loop only
            }
        });

        while (performance.now() < deadline) {
            const maybe = await Promise.race([
                seen,
                new Promise(r => requestAnimationFrame(r))
            ]);

            await nextTick();

            el = getEl() || maybe;
            if (el) {
                stop(observer);
                return el;
            }
        }

        stop(observer);
        console.warn('SVG element not found or not mounted (timed out).');
        return null;
    }

    onMounted(async () => {
        try {
            await waitForSvg();
            ready.value = true;
        } catch {
            ready.value = false;
        }
    });

    watch(svgRef, async () => {
        try {
            await waitForSvg();
            ready.value = true;
        } catch {
            ready.value = false;
        }
    });

    const defaultStyleCache = new Map();
    function getDefaultComputedForTag(tagName) {
        if (defaultStyleCache.has(tagName)) {
            return defaultStyleCache.get(tagName);
        }

        const tmpSvg = elNS('svg');
        tmpSvg.setAttribute('width', '0');
        tmpSvg.setAttribute('height', '0');
        tmpSvg.style.position = 'absolute';
        tmpSvg.style.left = '-99999px';
        tmpSvg.style.top = '-99999px';
        const el = elNS(tagName);
        tmpSvg.appendChild(el);
        document.body.appendChild(tmpSvg);
        const cs = window.getComputedStyle(el);
        const snap = {};

        for (const p of PRESENTATION_PROPS) {
            snap[p] = cs.getPropertyValue(p);
        }

        document.body.removeChild(tmpSvg);
        defaultStyleCache.set(tagName, snap);
        return snap;
    }

    function buildMinimalStyle(srcEl) {
        const cs = CACHE_CSS(srcEl);
        const defaults = getDefaultComputedForTag(srcEl.tagName.toLowerCase());
        const parts = [];
        for (const prop of PRESENTATION_PROPS) {
            let val = cs.getPropertyValue(prop) || '';
            const def = defaults[prop] || '';
            if (ALWAYS_INLINE.has(prop)) {
                if (prop === 'font-family' && val) {
                    val = completeFontFamily(val);
                }
                if (val) {
                    parts.push(`${prop}:${val};`);
                }
                continue;
            }
            if (val && val !== def) {
                parts.push(`${prop}:${val};`);
            }
        }
        return parts.join('');
    }

    function inlineComputedStyles(sourceSvg, cloneSvg) {
        if (sourceSvg.getAttribute('width')) {
            cloneSvg.setAttribute('width', sourceSvg.getAttribute('width'));
        }
        if (sourceSvg.getAttribute('height')) {
            cloneSvg.setAttribute('height', sourceSvg.getAttribute('height'));
        }
        if (sourceSvg.getAttribute('viewBox')) {
            cloneSvg.setAttribute('viewBox', sourceSvg.getAttribute('viewBox'));
        }
        const srcNodes = [sourceSvg, ...Array.from(sourceSvg.querySelectorAll('*'))];
        const dstNodes = [cloneSvg, ...Array.from(cloneSvg.querySelectorAll('*'))];
        for (let i = 0; i < srcNodes.length; i += 1) {
            const src = srcNodes[i]; const dst = dstNodes[i];
            const style = buildMinimalStyle(src);
            if (style) {
                dst.setAttribute('style', style);
            }
            ['fill', 'stroke', 'filter', 'clip-path', 'mask'].forEach(a => {
                const v = src.getAttribute(a);
                if (v) {
                    dst.setAttribute(a, v);
                }
            });
        }
    }

    function parseViewBox(svgEl) {
        const vb = svgEl.getAttribute('viewBox');
        if (!vb) {
            return null;
        }

        const [minX, minY, width, height] = vb.split(/\s+|,/).map(Number);
        if ([minX, minY, width, height].some(n => Number.isNaN(n))) {
            return null;
        }
        return { minX, minY, width, height };
    }

    function ensureXmlns(svgEl) {
        if (!svgEl.getAttribute('xmlns')) {
            svgEl.setAttribute('xmlns', SVG_NS);
        }
        if (!svgEl.getAttribute('xmlns:xlink')) {
            svgEl.setAttribute('xmlns:xlink', XLINK_NS);
        }
        if (!svgEl.getAttribute('xml:space')) {
            svgEl.setAttribute('xml:space', 'preserve');
        }
    }

    function mountOffscreen(svgEl) {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-99999px';
        container.style.top = '-99999px';
        container.style.width = '0'; container.style.height = '0';
        document.body.appendChild(container);
        container.appendChild(svgEl);
        return container;
    }
    function unmountOffscreen(container) {
        try {
            container.remove();
        } catch {
            //
        }
    }

    function drawTitle(cloneSvg, width, originX, originY, fontFamily) {
        if (!title.value || !title.value.text) {
            return 0;
        }
        const cfg = {
            text: title.value.text || '',
            color: title.value.color || '#111',
            fontSize: title.value.fontSize || 20,
            bold: !!title.value.bold,
            textAlign: (title.value?.textAlign || 'center').toLowerCase(),
            paddingLeft: title.value.paddingLeft ?? 0,
            paddingRight: title.value.paddingRight ?? 0,
            subtitle: title.value.subtitle || null,
        };

        const g = elNS('g');
        g.setAttribute('id', '__vdu_export_title'); cloneSvg.appendChild(g);

        const xLeft = originX + cfg.paddingLeft;
        const xRight = originX + width - (cfg.paddingRight || 0);
        const xCenter = originX + width / 2;

        let anchor = 'start'; let x = xLeft;
        if (cfg.textAlign === 'center') {
            anchor = 'middle';
            x = xCenter;
        } else if (cfg.textAlign === 'right') {
            anchor = 'end';
            x = xRight;
        }

        const y = originY;
        const gap = Math.round(cfg.fontSize * 0.4);

        const t = elNS('text');
        t.setAttribute('x', String(x));
        t.setAttribute('y', String(y + cfg.fontSize));
        t.setAttribute('text-anchor', anchor);
        t.setAttribute('dominant-baseline', 'ideographic');
        t.setAttribute('style', `font-family:${fontFamily}; font-size:${cfg.fontSize}px; font-weight:${cfg.bold ? '700' : '400'}; fill:${cfg.color}; ${!stretchTitle ? '' : 'transform: scale(0.65, 1); transform-origin: center;'}`);
        t.textContent = cfg.text;
        g.appendChild(t);

        let tall = cfg.fontSize;
        if (cfg.subtitle && cfg.subtitle.text) {
            const sCfg = {
                color: cfg.subtitle.color || '#666',
                text: cfg.subtitle.text,
                fontSize: cfg.subtitle.fontSize || Math.max(12, Math.round(cfg.fontSize * 0.8)),
                bold: !!cfg.subtitle.bold,
            };
            const s = elNS('text');
            s.setAttribute('x', String(x));
            s.setAttribute('y', String(y + cfg.fontSize + gap + sCfg.fontSize));
            s.setAttribute('text-anchor', anchor);
            s.setAttribute('dominant-baseline', 'ideographic');
            s.setAttribute('style', `font-family:${fontFamily}; font-size:${sCfg.fontSize}px; font-weight:${sCfg.bold ? '600' : '400'}; fill:${sCfg.color}; ${!stretchTitle ? '' : 'transform: scale(0.65, 1); transform-origin: center;'}`);
            s.textContent = sCfg.text; g.appendChild(s);
            tall += gap + sCfg.fontSize;
        }
        return tall + Math.round(cfg.fontSize * 0.4);
    }

    function drawLegend(cloneSvg, width, originX, yStart, fontFamily) {
        if (!legend.value || !legend.value.show || !Array.isArray(legendItems.value) || !legendItems.value.length) {
            return 0;
        }

        const cfg = {
            bold: !!legend.value.bold,
            backgroundColor: legend.value.backgroundColor || 'transparent',
            color: legend.value.color || '#111',
            fontSize: legend.value.fontSize || 14,
            paddingX: 14,
            paddingY: 10,
            itemGapX: 18,
            itemGapY: 12,
            markerSize: Math.max(8, Math.round((legend.value.fontSize || 14) * 0.9)),
            markerTextGap: 8,
            lineHeight: Math.round((legend.value.fontSize || 14) * 1.2),
            maxWidth: width,
        };

        const g = elNS('g');
        g.setAttribute('id', '__vdu_export_legend');
        g.setAttribute('transform', `translate(${originX}, ${yStart})`);
        cloneSvg.appendChild(g);

        const bg = elNS('rect');
        bg.setAttribute('rx', '6'); bg.setAttribute('ry', '6');
        bg.setAttribute('fill', cfg.backgroundColor);
        g.appendChild(bg);

        const itemsG = elNS('g');
        g.appendChild(itemsG);

        const ruler = elNS('text');
        ruler.setAttribute('x', '0'); ruler.setAttribute('y', '0');
        ruler.setAttribute('style', `font-family:${fontFamily}; font-size:${cfg.fontSize}px; font-weight:${cfg.bold ? '600' : '400'}; opacity:0;`);
        itemsG.appendChild(ruler);

        const measure = (text) => {
            ruler.textContent = text || '';
            return ruler.getComputedTextLength();
        };

        const innerMaxW = Math.max(1, cfg.maxWidth - cfg.paddingX * 2);

        function wrapLabel(label, maxW) {
            const words = String(label || '').split(/\s+/).filter(Boolean);
            const lines = [];

            if (!words.length) {
                return [''];
            }

            let line = words.shift();

            while (words.length) {
                const test = `${line} ${words[0]}`;
                if (measure(test) <= maxW) {
                    line = test;
                    words.shift();
                } else {
                    if (measure(line) > maxW && line.length > 1) {
                        let fit = '';
                        for (const ch of line) {
                            const t = fit + ch;
                            if (measure(t) <= maxW) {
                                fit = t;
                            } else break;
                        }
                        const rest = line.slice(fit.length);
                        lines.push(fit);
                        line = rest.length ? rest : words.shift() || '';
                    } else {
                        lines.push(line);
                        line = words.shift() || '';
                    }
                }
            }

            if (line) {
                lines.push(line);
            }

            const last = lines[lines.length - 1] || '';
            if (measure(last) > maxW && last.length > 1) {
                let fit = '';
                for (const ch of last) {
                    const t = fit + ch;
                    if (measure(t) <= maxW) {
                        fit = t;
                    } else break;
                }
                const rest = last.slice(fit.length);
                lines[lines.length - 1] = fit;
                if (rest) {
                    lines.push(rest);
                }
            }
            return lines;
        }

        const DEG = Math.PI / 180;
        function pathPolygon(cx, cy, sides, radius, rotationDeg = -90) {
            const rot = rotationDeg * DEG;
            let d = '';
            for (let i = 0; i < sides; i += 1) {
                const a = rot + (i * 2 * Math.PI) / sides;
                const x = cx + Math.cos(a) * radius;
                const y = cy + Math.sin(a) * radius;
                d += (i === 0 ? 'M' : 'L') + x + ',' + y;
            }
            return d + 'Z';
        }
        function pathStar(cx, cy, points = 5, outerR, innerR) {
            const rot = -90 * DEG;
            let d = '';
            for (let i = 0; i < points * 2; i += 1) {
                const r = i % 2 === 0 ? outerR : innerR;
                const a = rot + (i * Math.PI) / points;
                const x = cx + Math.cos(a) * r;
                const y = cy + Math.sin(a) * r;
                d += (i === 0 ? 'M' : 'L') + x + ',' + y;
            }
            return d + 'Z';
        }

        const items = legendItems.value.map(it => {
            const maxLabelW = Math.max(1, innerMaxW - (cfg.markerSize + cfg.markerTextGap));
            const lines = wrapLabel(it.name || '', maxLabelW);
            const maxLineW = Math.max(...lines.map(measure), 0);
            const itemW = cfg.markerSize + cfg.markerTextGap + maxLineW;
            const itemH = Math.max(cfg.markerSize, lines.length * cfg.lineHeight);
            return {
                ...it,
                lines,
                itemW,
                itemH
            };
        });

        const rows = [];
        let row = {
            items: [],
            width: 0,
            height: 0
        };

        for (const it of items) {
            const addW = (row.items.length ? cfg.itemGapX : 0) + it.itemW;
            if (row.items.length && row.width + addW > innerMaxW) {
                rows.push(row);
                row = {
                    items: [it],
                    width: it.itemW,
                    height: it.itemH
                };
            } else {
                row.items.push(it);
                row.width += addW;
                row.height = Math.max(row.height, it.itemH);
            }
        }
        if (row.items.length) {
            rows.push(row);
        }

        let cursorY = cfg.paddingY;
        for (const r of rows) {
            const startX = Math.max(cfg.paddingX, (cfg.maxWidth - r.width) / 2);
            let x = startX;

            for (let idx = 0; idx < r.items.length; idx += 1) {
                const it = r.items[idx];
                const markerCX = x + cfg.markerSize / 2;
                const markerCY = cursorY + r.height / 2.5;
                const radius = cfg.markerSize / 2;

                const shape = String(it.shape || 'rect').toLowerCase();
                if (shape === 'circle') {
                    const c = elNS('circle');
                    c.setAttribute('cx', String(markerCX));
                    c.setAttribute('cy', String(markerCY));
                    c.setAttribute('r', String(radius * 0.8));
                    c.setAttribute('fill', it.color || '#000');
                    itemsG.appendChild(c);
                } else if (shape === 'rect' || shape === 'square') {
                    const p = elNS('path');
                    p.setAttribute('d', pathPolygon(markerCX, markerCY, 4, radius, -45));
                    p.setAttribute('fill', it.color || '#000');
                    itemsG.appendChild(p);
                } else if (shape === 'diamond') {
                    const p = elNS('path');
                    p.setAttribute('d', pathPolygon(markerCX, markerCY, 4, radius, 45));
                    p.setAttribute('fill', it.color || '#000');
                    itemsG.appendChild(p);
                } else if (shape === 'triangle') {
                    const p = elNS('path');
                    p.setAttribute('d', pathPolygon(markerCX, markerCY, 3, radius, -90));
                    p.setAttribute('fill', it.color || '#000');
                    itemsG.appendChild(p);
                } else if (shape === 'pentagon') {
                    const p = elNS('path');
                    p.setAttribute('d', pathPolygon(markerCX, markerCY, 5, radius, -90));
                    p.setAttribute('fill', it.color || '#000');
                    itemsG.appendChild(p);
                } else if (shape === 'hexagon') {
                    const p = elNS('path');
                    p.setAttribute('d', pathPolygon(markerCX, markerCY, 6, radius, 0));
                    p.setAttribute('fill', it.color || '#000');
                    itemsG.appendChild(p);
                } else if (shape === 'star') {
                    const p = elNS('path');
                    const outer = radius;
                    const inner = radius * 0.5;
                    p.setAttribute('d', pathStar(markerCX, markerCY, 5, outer, inner));
                    p.setAttribute('fill', it.color || '#000');
                    itemsG.appendChild(p);
                } else {
                    const rect = elNS('rect');
                    rect.setAttribute('x', String(x));
                    rect.setAttribute('y', String(cursorY + (r.height - cfg.markerSize) / 2));
                    rect.setAttribute('width', String(cfg.markerSize));
                    rect.setAttribute('height', String(cfg.markerSize));
                    rect.setAttribute('fill', it.color || '#000');
                    itemsG.appendChild(rect);
                }

                const textX = x + cfg.markerSize + cfg.markerTextGap;
                const textY = cursorY + (r.height - (it.lines.length * cfg.lineHeight)) / 2 + cfg.fontSize;
                const text = elNS('text');
                text.setAttribute('x', String(textX));
                text.setAttribute('y', String(textY));
                text.setAttribute('style', `font-family:${fontFamily}; font-size:${cfg.fontSize}px; font-weight:${cfg.bold ? '600' : '400'}; fill:${cfg.color};`);
                text.setAttribute('dominant-baseline', 'ideographic');

                let first = true;
                for (const line of it.lines) {
                    const span = elNS('tspan');
                    if (!first) span.setAttribute('dy', String(cfg.lineHeight));
                    span.setAttribute('x', String(textX));
                    span.textContent = line;
                    text.appendChild(span);
                    first = false;
                }
                itemsG.appendChild(text);

                x += it.itemW + (idx < r.items.length - 1 ? cfg.itemGapX : 0);
            }
            cursorY += r.height + cfg.itemGapY;
        }
        if (rows.length) cursorY -= cfg.itemGapY;

        const totalH = cursorY + cfg.paddingY;
        bg.setAttribute('x', '0');
        bg.setAttribute('y', '0');
        bg.setAttribute('width', String(cfg.maxWidth));
        bg.setAttribute('height', String(totalH));

        ruler.remove();
        return totalH + Math.round(cfg.fontSize * 0.4);
    }

    function makeClone(svgEl) {
        const clone = svgEl.cloneNode(true);
        clone.querySelectorAll('script').forEach(n => n.remove());
        inlineComputedStyles(svgEl, clone);
        ensureXmlns(clone);
        return clone;
    }

    function wrapOriginalContent(cloneSvg) {
        const defs = Array.from(cloneSvg.childNodes).filter(n => n.nodeType === 1 && n.nodeName.toLowerCase() === 'defs');
        const others = Array.from(cloneSvg.childNodes).filter(n => !(n.nodeType === 1 && n.nodeName.toLowerCase() === 'defs'));
        const contentGroup = document.createElementNS(SVG_NS, 'g');
        contentGroup.setAttribute('id', '__vdu_export_content');
        for (const n of others) contentGroup.appendChild(n);
        for (const d of defs) cloneSvg.appendChild(d);
        cloneSvg.appendChild(contentGroup);
        return contentGroup;
    }

    function shiftContent(contentGroup, yShift) {
        if (yShift <= 0) return;
        contentGroup.setAttribute('transform', `translate(0, ${yShift})`);
    }

    function growCanvasHeight(cloneSvg, addY) {
        if (addY <= 0) return;
        const vb = parseViewBox(cloneSvg);
        const heightAttr = cloneSvg.getAttribute('height');
        if (vb) {
            cloneSvg.setAttribute('viewBox', `${vb.minX} ${vb.minY} ${vb.width} ${vb.height + addY}`);
            if (heightAttr) {
                cloneSvg.setAttribute('height', String(Number(heightAttr) + addY));
            }
        } else if (heightAttr) {
            cloneSvg.setAttribute('height', String(Number(heightAttr) + addY));
        } else {
            const bbox = cloneSvg.getBBox();
            cloneSvg.setAttribute('viewBox', `0 0 ${Math.max(1, bbox.width)} ${Math.max(1, bbox.height + addY)}`);
        }
    }

    function contentWidth(cloneSvg) {
        const vb = parseViewBox(cloneSvg);
        if (vb) {
            return vb.width;
        };
        const w = Number(cloneSvg.getAttribute('width'));
        if (!Number.isNaN(w) && w > 0) {
            return w;
        };
        return cloneSvg.getBBox().width || 0;
    }

    function contentHeight(cloneSvg) {
        const vb = parseViewBox(cloneSvg); if (vb) return vb.height;
        const h = Number(cloneSvg.getAttribute('height')); if (!Number.isNaN(h) && h > 0) return h;
        return cloneSvg.getBBox().height || 0;
    }

    async function decorate(cloneSvg) {
        const host = mountOffscreen(cloneSvg);
        CLEAR_CSS_CACHE();
        try {
            // Ensure fonts are ready before any measuring
            if (document.fonts?.ready) {
                try {
                    await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 4000))]);
                } catch {
                    //
                }
            }

            const contentGroup = wrapOriginalContent(cloneSvg);

            const vb = parseViewBox(cloneSvg);
            const originX = vb ? vb.minX : 0;
            const originY = vb ? vb.minY : 0;
            const width = Math.max(1, contentWidth(cloneSvg));
            const height = Math.max(1, contentHeight(cloneSvg));

            const baseFontFamily = completeFontFamily(CACHE_CSS(cloneSvg).getPropertyValue('font-family') || '');

            const titleH = titleEmbedded ? null : drawTitle(cloneSvg, width, originX, originY, baseFontFamily);
            let topExtra = titleH ?? 0;

            const legendPos = (legend && legend.value && legend.value.position) ? String(legend.value.position).toLowerCase() : 'top';
            if (legend && legend.value && legend.value.show && legendPos === 'top') {
                topExtra += drawLegend(cloneSvg, width, originX, originY + topExtra, baseFontFamily);
            }

            shiftContent(contentGroup, topExtra);

            let bottomExtra = 0;
            if (legend && legend.value && legend.value.show && legendPos === 'bottom') {
                bottomExtra += drawLegend(cloneSvg, width, originX, originY + topExtra + height, baseFontFamily);
            }

            growCanvasHeight(cloneSvg, topExtra + bottomExtra);
            cloneSvg.style.backgroundColor = backgroundColor.value ?? '#FFF';
            await processForeignObjects(cloneSvg, { mode: 'raster' });

            ensureExtraViewBoxY(cloneSvg, !!title.value.text ? -6 : -48);
        } finally {
            unmountOffscreen(host);
            CLEAR_CSS_CACHE();
        }
    }

    async function getSvg() {
        const svgEl = await waitForSvg();
        const clone = makeClone(svgEl);
        await decorate(clone);

        const xml = new XMLSerializer().serializeToString(clone);
        const full = `<?xml version="1.0" standalone="no"?>\n${xml}`;
        const blob = new Blob([full], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        return { blob, url };
    }

    async function exportSvg(customFileName) {
        const { url } = await getSvg();
        const name = customFileName || title.value?.text || 'chart';
        const a = document.createElement('a');
        a.href = url;
        a.download = name.endsWith('.svg') ? name : `${name}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    return { ready, getSvg, exportSvg };
}

function ensureExtraViewBoxY(svgEl, extraY = -50) {
    if (!extraY) return;

    const vbAttr = svgEl.getAttribute('viewBox');

    const bumpNumericHeightAttr = (deltaPx) => {
        if (!deltaPx) return;
        const hAttr = svgEl.getAttribute('height');
        if (!hAttr) return;
        const match = /^(\d+(\.\d+)?)(px)?$/.exec(hAttr.trim());
        if (!match) return;  // ignore %, em, etc.
        const current = parseFloat(match[1]) || 0;
        const next = Math.max(1, current + deltaPx);
        svgEl.setAttribute('height', String(next));
    };

    if (vbAttr) {
        const parts = vbAttr.trim().split(/\s+|,/).map(Number);
        if (parts.length !== 4 || parts.some(n => !Number.isFinite(n))) return;
        const [minX, minY, width, height] = parts;
        const newMinY = minY + extraY;
        const deltaH = -extraY;
        const newH = Math.max(1, height + deltaH);
        svgEl.setAttribute('viewBox', `${minX} ${newMinY} ${width} ${newH}`);
        bumpNumericHeightAttr(deltaH);
        return;
    }

    let w = Number(svgEl.getAttribute('width'));
    let h = Number(svgEl.getAttribute('height'));

    if (!(w > 0 && h > 0)) {
        const bb = svgEl.getBBox();
        w = Math.max(1, bb.width || 1);
        h = Math.max(1, bb.height || 1);
    }

    const minY = extraY;
    const deltaH = -extraY;
    const newH = Math.max(1, h + deltaH);

    svgEl.setAttribute('viewBox', `0 ${minY} ${w} ${newH}`);

    // If there was a numeric height attribute, bump it by deltaH to keep scale
    (function bumpIfNumeric() {
        const hAttr = svgEl.getAttribute('height');
        if (!hAttr) return;
        const m = /^(\d+(\.\d+)?)(px)?$/.exec(hAttr.trim());
        if (!m) return;
        const current = parseFloat(m[1]) || 0;
        const next = Math.max(1, current + deltaH);
        svgEl.setAttribute('height', String(next));
    })();
}


// ------------------------------------- foreignObject utils ---------------------------------------

async function processForeignObjects(svgRoot, { mode = 'raster' } = {}) {
    const list = Array.from(svgRoot.querySelectorAll('foreignObject'));
    if (!list.length) return { converted: 0, rasterized: 0, skipped: 0, errors: 0 };

    let converted = 0;
    let rasterized = 0;
    let skipped = 0;
    let errors = 0;

    const isAllowedTextTag = (t) => ['div', 'p', 'span', 'strong', 'em', 'b', 'i', 'br'].includes(t);
    const isTextOnlyForeignObject = (fo) => {
        try {
            const root = fo.firstElementChild;
            if (!root) return false;
            const stack = [root];
            while (stack.length) {
                const n = stack.pop();
                if (n.nodeType === 3) {
                    continue;
                }
                if (n.nodeType !== 1) {
                    return false;
                }
                const tag = (n.tagName || '').toLowerCase();
                if (!isAllowedTextTag(tag)) {
                    return false;
                }
                if (n.querySelector?.('img,svg,canvas,video,foreignObject')) {
                    return false;
                }
                for (const ch of Array.from(n.childNodes)) {
                    stack.push(ch);
                }
            }
            return true;
        } catch {
            return false;
        }
    };

    function makeSvgTextFromFO(fo) {
        try {
            const htmlRoot = fo.firstElementChild;
            if (!htmlRoot) return null;

            const safeNum = (n, d = 0) => (Number.isFinite(+n) ? +n : d);

            const xFO = safeNum(fo.getAttribute('x'), 0);
            const yFO = safeNum(fo.getAttribute('y'), 0);
            let wFO = safeNum(fo.getAttribute('width'), NaN);

            if (!Number.isFinite(wFO) || wFO <= 0) {
                const bb = fo.getBBox?.();
                wFO = Math.max(1, safeNum(bb?.width, 0));
            }

            const toLineHeightPx = (lhRaw, fs) => {
                if (!lhRaw) return Math.round(fs * 1.2);
                const v = lhRaw.trim().toLowerCase();
                if (v === 'normal') return Math.round(fs * 1.2);
                if (v.endsWith('px')) return parseFloat(v) || Math.round(fs * 1.2);
                if (v.endsWith('%')) return (parseFloat(v) / 100) * fs || Math.round(fs * 1.2);
                if (v.endsWith('em')) return (parseFloat(v) || 1) * fs;
                if (v.endsWith('rem')) {
                    const rootFS = parseFloat(getComputedStyle(document.documentElement).fontSize) || fs;
                    return (parseFloat(v) || 1) * rootFS;
                }
                const num = Number(v);
                return Number.isFinite(num) ? num * fs : Math.round(fs * 1.2);
            };

            const parsePaddingShorthand = (pad) => {
                const toPxNum = (s) => {
                    const v = (s || '').trim().toLowerCase();
                    if (v.endsWith('px')) return parseFloat(v) || 0;
                    if (v.endsWith('rem')) {
                        const rootFS = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
                        return (parseFloat(v) || 0) * rootFS;
                    }
                    if (v.endsWith('em')) {
                        const bodyFS = parseFloat(getComputedStyle(document.body).fontSize) || 16;
                        return (parseFloat(v) || 0) * bodyFS;
                    }
                    const n = Number(v);
                    return Number.isFinite(n) ? n : 0;
                };
                const parts = (pad || '').split(/\s+/).map(toPxNum).filter(Number.isFinite);
                if (!parts.length) return [0, 0, 0, 0];
                if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
                if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
                if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
                return [parts[0], parts[1], parts[2], parts[3]];
            };

            const readTextStyle = (el, parent) => {
                const cs = CACHE_CSS(el);
                let ff = cs.getPropertyValue('font-family') || parent?.ff || 'system-ui';
                ff = completeFontFamily(ff);

                let fs = parseFloat(cs.getPropertyValue('font-size'));
                if (!Number.isFinite(fs)) fs = parent?.fs || 14;

                const fw = cs.getPropertyValue('font-weight') || parent?.fw || '400';
                const fsty = cs.getPropertyValue('font-style') || parent?.fsty || 'normal';
                const fstc = cs.getPropertyValue('font-stretch') || parent?.fstc || 'normal';
                const lsp = cs.getPropertyValue('letter-spacing') || parent?.lsp || 'normal';
                const wsp = cs.getPropertyValue('word-spacing') || parent?.wsp || '0px';
                const kern = cs.getPropertyValue('font-kerning') || parent?.kern || 'auto';
                const liga = cs.getPropertyValue('font-variant-ligatures') || parent?.liga || 'normal';
                const ttfm = cs.getPropertyValue('text-transform') || parent?.ttfm || 'none';
                const fill = cs.getPropertyValue('color') || parent?.fill || '#000';

                const lhRaw = cs.getPropertyValue('line-height');
                const lh = (!lhRaw || lhRaw.trim().toLowerCase() === 'normal')
                    ? (parent?.lh ?? Math.round(fs * 1.2))
                    : toLineHeightPx(lhRaw, fs);

                const ta = (cs.getPropertyValue('text-align') || parent?.ta || 'start').trim().toLowerCase();

                // paddings
                let padT = parseFloat(cs.getPropertyValue('padding-top')) || 0;
                let padR = parseFloat(cs.getPropertyValue('padding-right')) || 0;
                let padB = parseFloat(cs.getPropertyValue('padding-bottom')) || 0;
                let padL = parseFloat(cs.getPropertyValue('padding-left')) || 0;
                const shorthand = cs.getPropertyValue('padding');
                if (shorthand && (padT === 0 && padR === 0 && padB === 0 && padL === 0)) {
                    const [t, r, b, l] = parsePaddingShorthand(shorthand);
                    padT = t; padR = r; padB = b; padL = l;
                }

                // borders / box-sizing
                const bL = parseFloat(cs.getPropertyValue('border-left-width')) || 0;
                const bR = parseFloat(cs.getPropertyValue('border-right-width')) || 0;
                const box = cs.getPropertyValue('box-sizing') || 'content-box';

                return { ff, fs, fw, fsty, fstc, lsp, wsp, kern, liga, ttfm, fill, lh, ta, padL, padR, padT, padB, bL, bR, box };
            };

            const isBlock = (t) => /^(div|p|section|article|ul|ol|li|h[1-6])$/.test(t);

            const PARA_BREAK = { __para__: true };
            const LINE_BREAK = { __br__: true };
            const runs = [];
            const rootStyle = readTextStyle(htmlRoot);

            const walk = (node, style, path) => {
                if (node.nodeType === 3) {
                    const raw = node.nodeValue || '';
                    const text = raw.replace(/\s+/g, ' ').trim();
                    if (text) runs.push({ text, style, path: path.slice() });
                    return;
                }
                if (node.nodeType !== 1) return;

                const tag = node.tagName.toLowerCase();
                if (tag === 'br') { runs.push({ ...LINE_BREAK, path: path.slice() }); return; }

                const nextStyle = readTextStyle(node, style);
                path.push(node);
                for (const ch of Array.from(node.childNodes)) walk(ch, nextStyle, path);
                path.pop();

                if (isBlock(tag)) runs.push({ ...PARA_BREAK, path: path.slice() });
            };

            walk(htmlRoot, rootStyle, [htmlRoot]);

            while (runs.length && (runs.at(-1).__para__ || runs.at(-1).__br__)) runs.pop();
            if (!runs.length) return null;

            const textRuns = runs.filter(r => !r.__para__ && !r.__br__);
            const lcaPath = (() => {
                if (!textRuns.length) return [htmlRoot];
                const paths = textRuns.map(r => r.path);
                const minLen = Math.min(...paths.map(p => p.length));
                let i = 0;
                while (i < minLen) { const n = paths[0][i]; if (paths.every(p => p[i] === n)) i += 1; else break; }
                return paths[0].slice(0, Math.max(1, i));
            })();

            const lcaEl = lcaPath[lcaPath.length - 1] || htmlRoot;
            const lcaStyle = readTextStyle(lcaEl);

            // accumulated padding
            let padLsum = 0, padRsum = 0, padTsum = 0;
            for (const el of lcaPath) {
                const st = readTextStyle(el);
                padLsum += st.padL;
                padRsum += st.padR;
                padTsum += st.padT;
            }

            const widths = [Math.max(1, wFO - padLsum - padRsum)];

            // For every ancestor in the LCA path, try to get the content width
            for (const el of lcaPath) {
                try {
                    const cs = CACHE_CSS(el);

                    // Preferred: clientWidth (padding included, border excluded)
                    if (el.clientWidth && el.clientWidth > 0) {
                        const pL = parseFloat(cs.paddingLeft) || 0;
                        const pR = parseFloat(cs.paddingRight) || 0;
                        const cw = Math.max(1, el.clientWidth - pL - pR);
                        widths.push(cw);
                    }

                    // Fallback: computed width
                    const wStr = cs.width;
                    const wNum = parseFloat(wStr);
                    if (Number.isFinite(wNum) && wNum > 0) {
                        const box = cs.boxSizing || cs.getPropertyValue('box-sizing') || 'content-box';
                        const pL = parseFloat(cs.paddingLeft) || 0;
                        const pR = parseFloat(cs.paddingRight) || 0;
                        const bL = parseFloat(cs.borderLeftWidth) || 0;
                        const bR = parseFloat(cs.borderRightWidth) || 0;
                        const cw = box === 'border-box'
                            ? Math.max(1, wNum - pL - pR - bL - bR)
                            : Math.max(1, wNum);
                        widths.push(cw);
                    }
                } catch {
                    //
                }
            }

            let contentW = Math.floor(Math.min(...widths.filter(Number.isFinite))) - 1;
            if (!(contentW > 0)) contentW = 1;

            let anchor = 'start';
            let baseX = xFO + padLsum;
            if (lcaStyle.ta === 'center') {
                anchor = 'middle';
                baseX = xFO + padLsum + contentW / 2;
            } else if (lcaStyle.ta === 'right' || lcaStyle.ta === 'end') {
                anchor = 'end';
                baseX = xFO + (wFO - padRsum);
            }

            const svgRoot = fo.ownerSVGElement || fo.closest('svg');

            const textEl = document.createElementNS(SVG_NS, 'text');
            textEl.setAttribute('x', String(baseX));
            textEl.setAttribute('y', String(yFO + padTsum)); // keep first line at the top of the content box
            textEl.setAttribute('text-anchor', anchor);
            textEl.setAttribute('dominant-baseline', 'text-before-edge');
            textEl.setAttribute('xml:space', 'preserve');

            const measurer = document.createElementNS(SVG_NS, 'text');
            measurer.setAttribute('x', '0');
            measurer.setAttribute('y', '0');
            measurer.setAttribute('opacity', '0');
            (svgRoot || fo).appendChild(measurer);

            const styleString = (st) =>
                `font-family:${st.ff}; font-size:${st.fs}px; font-weight:${st.fw}; font-style:${st.fsty}; font-stretch:${st.fstc}; ` +
                `letter-spacing:${st.lsp}; word-spacing:${st.wsp}; font-kerning:${st.kern}; font-variant-ligatures:${st.liga}; ` +
                `text-transform:${st.ttfm};`;

            const measure = (s, st) => {
                measurer.textContent = s || '';
                measurer.setAttribute('style', styleString(st));
                return measurer.getComputedTextLength();
            };
            const spaceWidth = (st) => measure(' ', st);

            const lines = [];
            let line = [];
            let lineW = 0;

            const pushLine = () => {
                if (line.length) lines.push({ segs: line.slice() });
                line = []; lineW = 0;
            };

            const pushSeg = (text, st, prependSpace) => {
                let w = measure(text, st);
                if (prependSpace) {
                    const sw = spaceWidth(st);
                    w += sw;
                    line.push({ text: ' ', ...st, w: sw, isSpace: true });
                }
                line.push({ text, ...st, w });
                lineW += w;
            };

            const fitCharwise = (token, st, maxW) => {
                let acc = '';
                for (const ch of token) {
                    const t = acc + ch;
                    if (measure(t, st) <= maxW) acc = t; else break;
                }
                return acc || token[0] || '';
            };

            for (const run of runs) {
                if (run.__para__ || run.__br__) { pushLine(); continue; }
                const st = run.style;

                const rawTokens = run.text.split(/(\s+)/).filter(t => t.length > 0);

                const flushWord = (word, needsLeadingSpace) => {
                    if (!word) return;

                    const maxW = Math.max(1, contentW);
                    const tokenW = measure(word, st) + (needsLeadingSpace ? spaceWidth(st) : 0);

                    if (line.length === 0) {
                        if (tokenW <= maxW) {
                            pushSeg(word, st, false);
                        } else {
                            let rest = word;
                            while (rest) {
                                const fit = fitCharwise(rest, st, maxW);
                                pushSeg(fit, st, false);
                                rest = rest.slice(fit.length);
                                if (rest) pushLine();
                            }
                        }
                    } else {
                        if (lineW + tokenW <= maxW) {
                            pushSeg(word, st, needsLeadingSpace);
                        } else {
                            pushLine();
                            if (measure(word, st) <= maxW) {
                                pushSeg(word, st, false);
                            } else {
                                let rest = word;
                                while (rest) {
                                    const fit = fitCharwise(rest, st, maxW);
                                    pushSeg(fit, st, false);
                                    rest = rest.slice(fit.length);
                                    if (rest) pushLine();
                                }
                            }
                        }
                    }
                };

                let sawSpace = false;
                for (const tok of rawTokens) {
                    if (/^\s+$/.test(tok)) { sawSpace = true; continue; }
                    flushWord(tok, sawSpace);
                    sawSpace = false;
                }
            }
            pushLine();

            for (let li = 0; li < lines.length; li += 1) {
                const segs = lines[li].segs;
                const fsAdvance = Math.max(...segs.map(s => s.fs || lcaStyle.fs), lcaStyle.fs);

                let firstSeg = true;
                for (const seg of segs) {
                    const tspan = document.createElementNS(SVG_NS, 'tspan');
                    if (firstSeg) {
                        tspan.setAttribute('x', String(baseX));
                        if (li > 0) tspan.setAttribute('dy', String(fsAdvance));
                        firstSeg = false;
                    }
                    tspan.setAttribute('style', `${styleString(seg)} fill:${seg.fill};`);
                    tspan.textContent = seg.text;
                    textEl.appendChild(tspan);
                }

                if (!segs.length && li > 0) {
                    const spacer = document.createElementNS(SVG_NS, 'tspan');
                    spacer.setAttribute('x', String(baseX));
                    spacer.setAttribute('dy', String(fsAdvance));
                    spacer.textContent = '';
                    textEl.appendChild(spacer);
                }
            }

            try { measurer.remove(); } catch { }
            return textEl;
        } catch {
            return null;
        }
    }


    // Text to svg
    for (const fo of list) {
        try {
            if (fo.hasAttribute('data-no-svg-export')) {
                fo.remove();
                skipped += 1;
                continue;
            }

            if (isTextOnlyForeignObject(fo)) {
                const svgText = makeSvgTextFromFO(fo);
                if (svgText) {
                    fo.parentNode.replaceChild(svgText, fo);
                    converted += 1;
                    continue;
                }
            }
            skipped += 1;
        } catch {
            errors += 1;
        }
    }

    // Other foreignObject contents
    if (mode === 'raster') {
        const remaining = Array.from(svgRoot.querySelectorAll('foreignObject'));
        for (const fo of remaining) {
            try {
                if (fo.hasAttribute('data-no-svg-export')) {
                    fo.remove();
                    skipped += 1;
                    continue;
                }

                await new Promise(r => requestAnimationFrame(r));
                const bb = fo.getBBox();
                const w = Math.max(1, Math.ceil(bb.width));
                const h = Math.max(1, Math.ceil(bb.height));

                if (!w || !h) {
                    skipped += 1;
                    continue;
                }

                const tempSvg = document.createElementNS(SVG_NS, 'svg');
                tempSvg.setAttribute('xmlns', SVG_NS);
                tempSvg.setAttribute('xmlns:xlink', XLINK_NS);
                tempSvg.setAttribute('width', String(w));
                tempSvg.setAttribute('height', String(h));
                tempSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);

                const foClone = fo.cloneNode(true);
                foClone.setAttribute('x', '0'); foClone.setAttribute('y', '0');
                foClone.setAttribute('width', String(w)); foClone.setAttribute('height', String(h));
                tempSvg.appendChild(foClone);

                const xml = new XMLSerializer().serializeToString(tempSvg);
                const svgUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);

                const canvas = document.createElement('canvas');
                const scale = 2;
                canvas.width = Math.max(1, Math.floor(w * scale));
                canvas.height = Math.max(1, Math.floor(h * scale));
                const ctx = canvas.getContext('2d');

                const img = new Image();
                img.decoding = 'sync';
                img.crossOrigin = 'anonymous';

                await new Promise((resolve, reject) => {
                    img.onload = resolve; img.onerror = reject; img.src = svgUrl;
                });

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const dataUrl = canvas.toDataURL('image/png');

                const image = document.createElementNS(SVG_NS, 'image');
                image.setAttributeNS(XLINK_NS, 'href', dataUrl);
                image.setAttribute('href', dataUrl);
                image.setAttribute('x', fo.getAttribute('x') || String(bb.x));
                image.setAttribute('y', fo.getAttribute('y') || String(bb.y));
                image.setAttribute('width', fo.getAttribute('width') || String(bb.width));
                image.setAttribute('height', fo.getAttribute('height') || String(bb.height));

                fo.parentNode.replaceChild(image, fo);
                rasterized += 1;
            } catch {
                errors += 1;
            }
        }
    }

    return { converted, rasterized, skipped, errors };
}
