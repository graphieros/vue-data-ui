import { XMLNS } from '../lib';

function inverse(m) {
    const determinant = m.a * m.d - m.b * m.c;
    if (!Number.isFinite(determinant) || determinant === 0) return null;
    return {
        a: m.d / determinant,
        b: -m.b / determinant,
        c: -m.c / determinant,
        d: m.a / determinant,
        e: (m.c * m.f - m.d * m.e) / determinant,
        f: (m.b * m.e - m.a * m.f) / determinant,
    };
}

function multiply(a, b) {
    return {
        a: a.a * b.a + a.c * b.b,
        b: a.b * b.a + a.d * b.b,
        c: a.a * b.c + a.c * b.d,
        d: a.b * b.c + a.d * b.d,
        e: a.a * b.e + a.c * b.f + a.e,
        f: a.b * b.e + a.d * b.f + a.f,
    };
}

function measure(text, rootInverse) {
    const screen = text.getScreenCTM?.();
    if (!screen) return null;
    const matrix = multiply(rootInverse, screen);
    const box = text.getBBox();
    const corners = [
        [box.x, box.y],
        [box.x + box.width, box.y],
        [box.x, box.y + box.height],
        [box.x + box.width, box.y + box.height],
    ];
    const xs = corners.map(([x, y]) => matrix.a * x + matrix.c * y + matrix.e);
    const ys = corners.map(([x, y]) => matrix.b * x + matrix.d * y + matrix.f);
    return {
        left: Math.min(...xs),
        top: Math.min(...ys),
        width: Math.max(...xs) - Math.min(...xs),
        height: Math.max(...ys) - Math.min(...ys),
        localWidth: box.width,
    };
}

/** Fit generated labels in root SVG units, including rotated text and parent transforms.
 * Reposition first; wrap oversized labels; reduce font size proportionally only as a last resort.
 * Never use textLength or lengthAdjust, which distort glyphs.
 */
export function fitAnnotationText(text, svg, plotBounds = null) {
    if (!text?.getBBox || !svg?.getScreenCTM) return;

    const viewBox = (svg.getAttribute('viewBox') || '')
        .trim()
        .split(/[\s,]+/)
        .map(Number);

    if (
        viewBox.length !== 4 ||
        !viewBox.every(Number.isFinite) ||
        viewBox[2] <= 0 ||
        viewBox[3] <= 0
    ) {
        return;
    }

    const rootMatrix = svg.getScreenCTM();
    const rootInverse = rootMatrix && inverse(rootMatrix);

    if (!rootInverse) return;

    if (!plotBounds) {
        const savedBounds = text.getAttribute('data-analysis-text-bounds');
        if (savedBounds) {
            try {
                plotBounds = JSON.parse(savedBounds);
            } catch {
                /* Older annotations may not have valid bounds. */
            }
        }
    }

    const plot =
        plotBounds &&
        [
            plotBounds.left,
            plotBounds.top,
            plotBounds.right,
            plotBounds.bottom,
        ].every(Number.isFinite)
            ? plotBounds
            : null;

    const left = Math.max(viewBox[0], plot?.left ?? viewBox[0]);
    const top = Math.max(viewBox[1], plot?.top ?? viewBox[1]);
    const right = Math.min(
        viewBox[0] + viewBox[2],
        plot?.right ?? viewBox[0] + viewBox[2],
    );
    const bottom = Math.min(
        viewBox[1] + viewBox[3],
        plot?.bottom ?? viewBox[1] + viewBox[3],
    );

    if (right <= left || bottom <= top) {
        return;
    }

    const padding = Math.min(4, (right - left) / 10, (bottom - top) / 10);
    const bounds = {
        left: left + padding,
        top: top + padding,
        width: right - left - padding * 2,
        height: bottom - top - padding * 2,
    };

    let box = measure(text, rootInverse);

    if (
        !box ||
        ![box.left, box.top, box.width, box.height].every(Number.isFinite)
    ) {
        return;
    }

    let fontSize = Number(text.getAttribute('font-size')) || 12;

    if (
        box.width > bounds.width &&
        typeof text.getComputedTextLength === 'function'
    ) {
        const content =
            Array.from(text.children)
                .map((child) => child.textContent)
                .join(' ') || text.textContent;

        const x = text.getAttribute('x') || '0';
        const line = document.createElementNS(XMLNS, 'tspan');
        line.setAttribute('x', x);
        text.replaceChildren(line);

        const targetWidth = Math.max(
            fontSize,
            ((box.localWidth * bounds.width) / box.width) * 0.9,
        );

        const lines = [];
        let current = '';

        // Character splitting also handles unbroken labels and long numeric values.
        for (const character of Array.from(content)) {
            line.textContent = current + character;
            if (current && text.getComputedTextLength() > targetWidth) {
                const space = current.lastIndexOf(' ');
                if (space > current.length / 2) {
                    lines.push(current.slice(0, space));
                    current = current.slice(space + 1) + character;
                } else {
                    lines.push(current);
                    current = character;
                }
            } else current += character;
        }

        if (current) {
            lines.push(current);
        }

        text.replaceChildren(
            ...lines.map((value, index) => {
                const span = document.createElementNS(XMLNS, 'tspan');
                span.setAttribute('x', x);
                span.setAttribute(
                    'dy',
                    index === 0 ? '0' : String(fontSize * 1.2),
                );
                span.textContent = value;
                return span;
            }),
        );
        box = measure(text, rootInverse);
    }

    // A very small viewBox or rotated multiline label may need a smaller font,
    // but its width/height proportions always remain unchanged.
    if (box.width > bounds.width || box.height > bounds.height) {
        fontSize *=
            Math.min(bounds.width / box.width, bounds.height / box.height) *
            0.98;
        text.setAttribute('font-size', String(fontSize));
        Array.from(text.children).forEach((span, index) =>
            span.setAttribute('dy', index === 0 ? '0' : String(fontSize * 1.2)),
        );
        box = measure(text, rootInverse);
    }

    const dx =
        box.left < bounds.left
            ? bounds.left - box.left
            : Math.min(0, bounds.left + bounds.width - box.left - box.width);

    const dy =
        box.top < bounds.top
            ? bounds.top - box.top
            : Math.min(0, bounds.top + bounds.height - box.top - box.height);

    if (Math.abs(dx) < 1e-7 && Math.abs(dy) < 1e-7) {
        return;
    }

    const parentScreen = text.parentNode?.getScreenCTM?.();
    const parentInverse =
        parentScreen && inverse(multiply(rootInverse, parentScreen));

    if (!parentInverse) return;

    const localX = parentInverse.a * dx + parentInverse.c * dy;
    const localY = parentInverse.b * dx + parentInverse.d * dy;

    text.setAttribute(
        'transform',
        `translate(${localX} ${localY}) ${text.getAttribute('transform') || ''}`.trim(),
    );
}
