import { expect, it } from 'vitest';
import { advancePulse, batchPulses } from '../src/graph/pulses';

const edge = (length) => ({
    length,
    points: [
        { x: 0, y: 0 },
        { x: length, y: 0 },
    ],
});

it('batches thousands of pulses by color and splits only unrelated highlight opacity', () => {
    const items = Array.from({ length: 5000 }, (_, index) => ({
        link: {
            source: { id: index, color: index % 2 ? 'red' : 'blue' },
            target: { id: index + 1 },
        },
        color: 'gray',
    }));
    const settings = { color: 'gold', colorBySource: false, opacity: 0.8 };
    const batches = batchPulses(items, settings);
    expect(batches).toHaveLength(1);
    expect(batches[0].items).toHaveLength(5000);
    expect(
        batchPulses(items, { ...settings, colorBySource: true }),
    ).toHaveLength(2);
    const highlighted = batchPulses(items, settings, 0, 0.15);
    expect(highlighted).toHaveLength(2);
    expect(highlighted[0].opacity).toBeCloseTo(0.8);
    expect(highlighted[0].items).toHaveLength(1);
    expect(highlighted[1].opacity).toBeCloseTo(0.12);
});

it('travels at equal speed on different edge lengths', () => {
    expect(advancePulse(edge(100), 0.5, 100, 1000).x).toBeCloseTo(60);
    expect(advancePulse(edge(400), 0.5, 100, 1000).x).toBeCloseTo(210);
});

it('preserves progress when moving edges change length without retiming elapsed history', () => {
    const first = advancePulse(edge(100), 0.5, 100, 1000);
    const second = advancePulse(edge(200), first.progress, 100, 1000);
    expect(second.x - first.progress * 200).toBeCloseTo(10);
    expect(second.progress).toBeCloseTo(0.65);
});

it('moves at constant speed across segments and wraps at the end', () => {
    const curve = {
        length: 200,
        points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
        ],
    };
    expect(advancePulse(curve, 0.5, 100, 1000)).toEqual({
        progress: expect.closeTo(0.55),
        x: 100,
        y: expect.closeTo(10),
    });
    expect(advancePulse(edge(100), 0.95, 100, 1000).x).toBeCloseTo(5);
});

it('reverses direction without changing position or speed', () => {
    const forward = advancePulse(edge(100), 0.5, 100, 1000);
    expect(
        advancePulse(edge(100), forward.progress, 0, 1000, true).x,
    ).toBeCloseTo(forward.x);
    expect(
        advancePulse(edge(100), forward.progress, 100, 1000, true).x,
    ).toBeCloseTo(50);
    expect(advancePulse(edge(100), 0.05, 100, 1000, true).x).toBeCloseTo(95);
});
