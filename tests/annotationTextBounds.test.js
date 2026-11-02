import { describe, it, expect } from 'vitest';
import { fitAnnotationText } from '../src/utils/annotationTextBounds';

const identity = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
function product(a, b) {
    return {
        a: a.a * b.a + a.c * b.b,
        b: a.b * b.a + a.d * b.b,
        c: a.a * b.c + a.c * b.d,
        d: a.b * b.c + a.d * b.d,
        e: a.a * b.e + a.c * b.f + a.e,
        f: a.b * b.e + a.d * b.f + a.f,
    };
}
function transform(text) {
    let matrix = identity;
    for (const [, kind, values] of (
        text.getAttribute('transform') || ''
    ).matchAll(/(translate|rotate)\(([^)]+)\)/g)) {
        const [a, b = 0, c = 0] = values.split(/[ ,]+/).map(Number);
        if (kind === 'translate')
            matrix = product(matrix, { ...identity, e: a, f: b });
        else {
            const angle = (a * Math.PI) / 180,
                cosine = Math.cos(angle),
                sine = Math.sin(angle);
            matrix = product(matrix, {
                a: cosine,
                b: sine,
                c: -sine,
                d: cosine,
                e: b - b * cosine + c * sine,
                f: c - b * sine - c * cosine,
            });
        }
    }
    return matrix;
}
function fixture({
    viewBox = '0 0 200 100',
    x = 180,
    y = 95,
    label = 'A readable annotation',
    rotation = 0,
    parent = identity,
} = {}) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', viewBox);
    svg.getScreenCTM = () => identity;
    const group = document.createElementNS(svg.namespaceURI, 'g');
    group.getScreenCTM = () => parent;
    const text = document.createElementNS(svg.namespaceURI, 'text');
    text.setAttribute('x', x);
    text.setAttribute('y', y);
    text.setAttribute('font-size', 12);
    if (rotation)
        text.setAttribute('transform', `rotate(${rotation} ${x} ${y})`);
    const span = document.createElementNS(svg.namespaceURI, 'tspan');
    span.textContent = label;
    text.appendChild(span);
    group.appendChild(text);
    svg.appendChild(group);
    text.getComputedTextLength = () =>
        Math.max(
            0,
            ...Array.from(text.children).map(
                (child) => child.textContent.length,
            ),
        ) *
        Number(text.getAttribute('font-size')) *
        0.6;
    text.getBBox = () => ({
        x,
        y: y - Number(text.getAttribute('font-size')),
        width: text.getComputedTextLength(),
        height:
            Number(text.getAttribute('font-size')) *
            (1 + 1.2 * (text.children.length - 1)),
    });
    text.getScreenCTM = () => product(parent, transform(text));
    return { svg, text };
}
function expectInside(svg, text) {
    const [x, y, width, height] = svg
        .getAttribute('viewBox')
        .split(' ')
        .map(Number);
    const box = text.getBBox(),
        matrix = text.getScreenCTM();
    for (const [px, py] of [
        [box.x, box.y],
        [box.x + box.width, box.y],
        [box.x, box.y + box.height],
        [box.x + box.width, box.y + box.height],
    ]) {
        const rx = matrix.a * px + matrix.c * py + matrix.e,
            ry = matrix.b * px + matrix.d * py + matrix.f;
        expect(rx).toBeGreaterThanOrEqual(x - 1e-6);
        expect(rx).toBeLessThanOrEqual(x + width + 1e-6);
        expect(ry).toBeGreaterThanOrEqual(y - 1e-6);
        expect(ry).toBeLessThanOrEqual(y + height + 1e-6);
    }
    expect(text.hasAttribute('textLength')).toBe(false);
    expect(text.hasAttribute('lengthAdjust')).toBe(false);
}

describe('generated annotation text boundaries', () => {
    it.each([
        [180, 95],
        [-30, 0],
        [190, 5],
    ])('repositions edge labels without changing font size (%s,%s)', (x, y) => {
        const { svg, text } = fixture({ x, y });
        fitAnnotationText(text, svg);
        expectInside(svg, text);
        expect(text.getAttribute('font-size')).toBe('12');
    });
    it('wraps long labels including unbroken tokens without distorting glyphs', () => {
        const { svg, text } = fixture({
            label: 'AnExtremelyLongUnbrokenSeriesName'.repeat(4),
        });
        fitAnnotationText(text, svg);
        expectInside(svg, text);
        expect(text.children.length).toBeGreaterThan(1);
    });
    it('handles rotated labels and nonzero viewBox origins', () => {
        const { svg, text } = fixture({
            viewBox: '100 100 200 100',
            x: 290,
            y: 195,
            rotation: 55,
            label: 'Rotated long annotation '.repeat(3),
        });
        fitAnnotationText(text, svg);
        expectInside(svg, text);
    });
    it('accounts for ancestor transforms and refits after the viewBox changes', () => {
        const { svg, text } = fixture({
            parent: { a: 2, b: 0, c: 0, d: 2, e: 20, f: 10 },
        });
        fitAnnotationText(text, svg);
        expectInside(svg, text);
        svg.setAttribute('viewBox', '0 0 100 60');
        fitAnnotationText(text, svg);
        expectInside(svg, text);
    });
});

it.each([-75, 75])(
    'keeps steep change labels within the plot as well as the SVG (%s degrees)',
    (rotation) => {
        const { svg, text } = fixture({
            viewBox: '0 0 400 300',
            x: 45,
            y: 95,
            rotation,
            label: 'SERIE: first-to-last change 1,037,008',
        });
        const plot = { left: 40, top: 70, right: 360, bottom: 260 };
        text.setAttribute('data-analysis-text-bounds', JSON.stringify(plot));
        fitAnnotationText(text, svg);
        expectInside(svg, text);
        // Verify the tighter plot rectangle using the same rendered text geometry.
        svg.setAttribute('viewBox', '40 70 320 190');
        expectInside(svg, text);
        // A second fit must not move an already constrained rotated label.
        const fittedTransform = text.getAttribute('transform');
        fitAnnotationText(text, svg);
        expectInside(svg, text);
        expect(text.getAttribute('transform')).toBe(fittedTransform);
    },
);

it('uses updated plot bounds after resizing rather than the saved initial bounds', () => {
    const { svg, text } = fixture({
        viewBox: '0 0 400 300',
        x: 350,
        y: 260,
        rotation: -65,
    });
    text.setAttribute(
        'data-analysis-text-bounds',
        JSON.stringify({ left: 0, top: 0, right: 400, bottom: 300 }),
    );
    fitAnnotationText(text, svg, {
        left: 60,
        top: 80,
        right: 220,
        bottom: 240,
    });
    svg.setAttribute('viewBox', '60 80 160 160');
    expectInside(svg, text);
});
