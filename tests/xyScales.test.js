import { expect, test } from 'vitest';
import {
    createLogScale,
    createNonlinearScale,
    createScaleProjector,
    createSymlogScale,
    nonlinearRatio,
    transformY,
} from '../src/xyScales';

test.each([
    ['linear', -100, 100, [-100, 0, 100]],
    ['log', 1, 100, [1, 10, 100]],
    ['symlog', -100, 100, [-100, 0, 100]],
])(
    'prepared %s projections preserve domain endpoints and midpoint',
    (mode, min, max, values) => {
        const project = createScaleProjector(min, max, { mode });
        expect(values.map(project)).toEqual([0, 0.5, 1]);
        expect(project(null)).toBeNaN();
        expect(project(Infinity)).toBeNaN();
        expect(project(NaN)).toBeNaN();
    },
);

test('prepared symlog projections capture the constant independently of later options changes', () => {
    const options = { mode: 'symlog', constant: 1 };
    const initial = createScaleProjector(-100, 100, options);
    const initialValue = initial(10);
    options.constant = 10;
    const updated = createScaleProjector(-100, 100, options);
    expect(initial(10)).toBe(initialValue);
    expect(updated(10)).not.toBe(initialValue);
    expect(updated(10)).toBe(nonlinearRatio(10, -100, 100, 'symlog', 10));
});

test('nonlinear builders explicitly dispatch valid modes and preserve their distinct domains', () => {
    const values = [-100, 0, 10, 100];
    expect(createNonlinearScale(values)).toEqual(createLogScale(values));
    expect(createNonlinearScale(values, { mode: 'symlog' })).toEqual(
        createSymlogScale(values),
    );
    expect(createNonlinearScale(values).min).toBe(10);
    expect(createNonlinearScale(values, { mode: 'symlog' }).min).toBe(-100);
    expect(transformY(-10)).toBe(-10);
    expect(() => createNonlinearScale(values, { mode: 'linear' })).toThrow(
        RangeError,
    );
});

test('unsupported scale modes fail consistently instead of silently selecting different modes', () => {
    expect(() => transformY(10, 'unknown')).toThrow(RangeError);
    expect(() => createScaleProjector(1, 100, { mode: 'unknown' })).toThrow(
        RangeError,
    );
    expect(() => nonlinearRatio(10, 1, 100, 'unknown')).toThrow(RangeError);
    expect(() => createNonlinearScale([1, 100], { mode: 'unknown' })).toThrow(
        RangeError,
    );
});
