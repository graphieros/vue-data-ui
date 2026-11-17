import { vi } from 'vitest';

// Synthetic glyphs exercise layout bookkeeping in jsdom. Browser stories use
// real fonts to validate rasterization, rotations, bounds, and SVG overlaps.
export function createMockContext2D() {
    let transform = { x: 0, y: 0, angle: 0 };
    const stack = [];
    let glyphs = [];
    const ctx = {
        reset() {
            transform = { x: 0, y: 0, angle: 0 };
            glyphs = [];
            stack.length = 0;
        },
        font: '',
        fonts: [],
        direction: 'ltr',
        textAlign: '',
        textBaseline: '',
        fillStyle: '',
        save: vi.fn(() => stack.push({ ...transform, font: ctx.font })),
        restore: vi.fn(() => {
            const saved = stack.pop();
            if (saved) {
                ctx.font = saved.font;
                transform = saved;
            }
        }),
        translate: vi.fn((x, y) => {
            transform.x += x;
            transform.y += y;
        }),
        rotate: vi.fn((angle) => {
            transform.angle += angle;
        }),
        clearRect: vi.fn(() => {
            glyphs = [];
        }),
        strokeText: vi.fn(),
        measureText: vi.fn((text) => {
            ctx.fonts.push(ctx.font);
            return { width: text.length * 10 };
        }),
        fillText: vi.fn((text, x, y) => {
            const size = Number(ctx.font.match(/([\d.]+)px/)?.[1]) || 20;
            const localX = x + text.length * 5;
            const localY = y - size * 0.35;
            glyphs.push([
                Math.round(
                    transform.x +
                        localX * Math.cos(transform.angle) -
                        localY * Math.sin(transform.angle),
                ),
                Math.round(
                    transform.y +
                        localX * Math.sin(transform.angle) +
                        localY * Math.cos(transform.angle),
                ),
            ]);
        }),
        getImageData: vi.fn((_x, _y, width, height) => {
            const data = new Uint8ClampedArray(width * height * 4);
            for (const [cx, cy] of glyphs)
                for (let y = cy - 2; y <= cy + 2; y += 1)
                    for (let x = cx - 2; x <= cx + 2; x += 1) {
                        if (x >= 0 && y >= 0 && x < width && y < height) {
                            data[(y * width + x) * 4] = 255;
                            data[(y * width + x) * 4 + 3] = 255;
                        }
                    }
            return { data };
        }),
    };
    return ctx;
}

export function createMockCanvas(ctx = createMockContext2D()) {
    let width = 0,
        height = 0;
    return {
        get width() {
            return width;
        },
        set width(value) {
            width = value;
            ctx.reset();
        },
        get height() {
            return height;
        },
        set height(value) {
            height = value;
            ctx.reset();
        },
        getContext: () => ctx,
    };
}
