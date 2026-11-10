import { mount } from '@vue/test-utils';
import { afterEach, expect, test } from 'vitest';
import Chart from '../src/components/vue-ui-digits.vue';
import Digit from '../src/atoms/Digit.vue';
const wrappers = [];
afterEach(() => {
    wrappers.splice(0).forEach((w) => w.unmount());
});
function chart(dataset, config = {}) {
    const w = mount(Chart, { props: { dataset, config } });
    wrappers.push(w);
    return w;
}
function text(w) {
    return w
        .findAllComponents(Digit)
        .map((d) => d.props('quanta'))
        .join('');
}
test.each([
    [0, '0'],
    [-123.45, '-123.45'],
    [1e-7, '0.0000001'],
    [-1.23e-7, '-0.000000123'],
    [1e21, '1000000000000000000000'],
    [-1.23e21, '-1230000000000000000000'],
    [Number.MAX_VALUE, '17976931348623157' + '0'.repeat(292)],
    [Number.MIN_VALUE, '0.' + '0'.repeat(323) + '5'],
    [NaN, '0'],
    [Infinity, '0'],
    [-Infinity, '0'],
])(
    'renders %s safely and uses the same accessible value',
    (value, expected) => {
        const w = chart(value);
        expect(text(w)).toBe(expected);
        expect(w.find('.sr-only').text()).toBe(expected);
        expect(w.find('svg').attributes('aria-describedby')).toBe(
            w.find('.sr-only').attributes('id'),
        );
        expect(w.html()).not.toMatch(/NaN|Infinity|undefined/);
    },
);
test('live updates preserve decimal spacing and update styling', async () => {
    const w = chart(12.3);
    expect(w.findAllComponents(Digit).map((d) => d.props('x'))).toEqual([
        10, 54, 98, 100,
    ]);
    expect(w.find('svg').attributes('viewBox')).toBe('0 0 136 80');
    await w.setProps({
        dataset: -0.2,
        config: {
            height: '90px',
            width: '250px',
            backgroundColor: '#123456',
            digits: {
                color: '#ff0000',
                skeletonColor: '#00ff00',
                thickness: 2,
            },
        },
    });
    expect(text(w)).toBe('-0.2');
    expect(w.find('svg').element.style.height).toBe('90px');
    expect(w.find('svg').element.style.width).toBe('250px');
    expect(w.find('[data-cy="digit-g"]').attributes('fill')).toBe('#ff0000ff');
    await w.setProps({ config: { height: '', width: '' }, dataset: 1e-7 });
    expect(w.find('svg').element.style.height).toBe('');
    expect(w.find('svg').element.style.width).toBe('');
    expect(text(w)).toBe('0.0000001');
});
test('unknown atom characters safely render inactive segments', async () => {
    const w = mount(Digit, { props: { quanta: 'e' } });
    wrappers.push(w);
    expect(w.findAll('path')).toHaveLength(7);
    expect(
        w.findAll('path').every((p) => p.attributes('fill') === '#e1e5e8'),
    ).toBe(true);
    await w.setProps({ quanta: 'toString' });
    expect(w.findAll('path')).toHaveLength(7);
});

test('segment geometry responds to position and thickness changes without changing segment identity', async () => {
    const w = mount(Digit, {
        props: { quanta: '8', x: 10, y: 20, thickness: 1 },
    });
    wrappers.push(w);
    const paths = w.findAll('path').map((p) => p.element);
    expect(w.find('[data-cy="digit-a"]').attributes('d')).toBe(
        'M 10 20 L 12 18 L 34 18 L 36 20 L 34 22 L 12 22 Z',
    );
    await w.setProps({ x: 20, y: 30, thickness: 2, quanta: '1' });
    expect(w.findAll('path').map((p) => p.element)).toEqual(paths);
    expect(w.find('[data-cy="digit-a"]').attributes('d')).toBe(
        'M 20 30 L 24 26 L 42 26 L 46 30 L 42 34 L 24 34 Z',
    );
    expect(
        w
            .findAll('path')
            .filter((p) => p.attributes('fill') === '#000000')
            .map((p) => p.attributes('data-cy')),
    ).toEqual(['digit-b', 'digit-c']);
});
