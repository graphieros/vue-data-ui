import { expect, test, describe, vi } from 'vitest';
import getVueDataUiConfig from '../src/getVueDataUiConfig';
import { useConfig } from '../src/useConfig';
import { graphDefaults } from '../src/graph/config';

describe('getVueDataUiConfig', () => {
    test('returns independent graph configs without structuredClone support', () => {
        vi.stubGlobal('structuredClone', undefined);
        try {
            const first = getVueDataUiConfig('vue_ui_graph');
            const second = getVueDataUiConfig('vue_ui_graph');
            first.style.chart.nodes.radius = 999;
            expect(second.style.chart.nodes.radius).toBe(
                graphDefaults.style.chart.nodes.radius,
            );
            expect(first.style.chart.controls).not.toBe(
                second.style.chart.controls,
            );
        } finally {
            vi.unstubAllGlobals();
        }
    });
    test.each(Object.keys(useConfig()))(
        '%s returns independent nested objects and arrays on every call',
        (name) => {
            const first = getVueDataUiConfig(name);
            const second = getVueDataUiConfig(name);
            expect(second).toStrictEqual(first);
            function assertIndependent(a, b) {
                if (!a || typeof a !== 'object') return;
                expect(a).not.toBe(b);
                for (const key of Object.keys(a))
                    assertIndependent(a[key], b[key]);
            }
            assertIndependent(first, second);
        },
    );

    test('graph mutations leave other configs, future calls and chart defaults untouched', () => {
        const baseline = structuredClone(graphDefaults);
        const first = getVueDataUiConfig('vue_ui_graph');
        const second = getVueDataUiConfig('vue_ui_graph');
        const expected = structuredClone(second);
        first.style.chart.nodes.radius = 999;
        first.style.chart.nodes.hover.stroke = '#123456';
        first.style.chart.controls.show = false;
        first.style.chart.links.pulses.show = true;
        first.customPalette.push('#123456');
        first.a11y.translations.keyboardNavigation = 'changed';
        expect(second).toStrictEqual(expected);
        expect(getVueDataUiConfig('vue_ui_graph')).toStrictEqual(expected);
        expect(useConfig().vue_ui_graph).toStrictEqual(expected);
        expect(graphDefaults).toStrictEqual(baseline);
    });

    const components = [
        'heatmap',
        '3d_bar',
        'accordion',
        'age_pyramid',
        'annotator',
        'candlestick',
        'chestnut',
        'cursor',
        'dashboard',
        'digits',
        'donut',
        'donut_evolution',
        'dumbbell',
        'galaxy',
        'gauge',
        'kpi',
        'mini_loader',
        'molecule',
        'mood_radar',
        'nested_donuts',
        'onion',
        'quadrant',
        'quick_chart',
        'radar',
        'rating',
        'relation_circle',
        'rings',
        'scatter',
        'skeleton',
        'smiley',
        'spark_trend',
        'sparkbar',
        'sparkgauge',
        'sparkhistogram',
        'sparkline',
        'sparkstackbar',
        'strip_plot',
        'table',
        'table_heatmap',
        'table_sparkline',
        'thermometer',
        'tiremarks',
        'vertical_bar',
        'waffle',
        'wheel',
        'xy',
    ];

    components.forEach((component) => {
        test(`returns vue_ui_${component} config`, () => {
            const expectedConfig = useConfig()[`vue_ui_${component}`];
            expect(
                getVueDataUiConfig(`vue_ui_${component}`),
            ).not.toBeUndefined();
            expect(getVueDataUiConfig(`vue_ui_${component}`)).toStrictEqual(
                expectedConfig,
            );
        });
    });
});
