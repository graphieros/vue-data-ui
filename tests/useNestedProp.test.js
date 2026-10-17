import { expect, test, describe } from 'vitest';
import { useNestedProp } from '../src/useNestedProp';
import { useConfig } from '../src/useConfig';
import { resolveChartConfig } from '../src/resolveChartConfig';
import themes from '../src/themes/vue_ui_dumbbell.json';

describe('useNestedProp', () => {
    test.each(['2024', 'Bad', 'red', '#abc', 'rgb(255, 0, 0)'])(
        'preserves Dumbbell legend translations containing %s',
        (text) => {
            const defaults = useConfig().vue_ui_dumbbell;
            const labels = Object.fromEntries(
                [
                    'labelStart',
                    'labelEnd',
                    'labelPositive',
                    'labelNegative',
                    'labelNeutral',
                ].map((key) => [key, text]),
            );
            for (const theme of ['', 'hack']) {
                const config = resolveChartConfig(
                    {
                        theme,
                        style: {
                            chart: {
                                legend: labels,
                                plots: { startColor: 'red', endColor: 'blue' },
                            },
                        },
                    },
                    defaults,
                    themes,
                );
                expect(config.style.chart.legend).toMatchObject(labels);
                expect(config.style.chart.plots.startColor).toBe('#FF0000ff');
                expect(config.style.chart.plots.endColor).toBe('#0000FFff');
            }
        },
    );

    test('preserves translations, titles, table headers and IDs while normalizing nested color options', () => {
        const defaultConfig = {
            title: { text: 'Title', color: '#000000' },
            translations: { color: 'Color', fill: 'Fill', year: 'Year' },
            table: { columnNames: { color: 'Color' }, head: { values: [] } },
            id: '',
            customPalette: [],
        };
        const userConfig = {
            title: { text: '2024', color: 'red' },
            translations: { color: 'red', fill: 'Bad', year: '2024' },
            table: {
                columnNames: { color: 'blue' },
                head: { values: ['2024', 'Bad', 'red'] },
            },
            id: 'face',
            customPalette: ['red', '2024'],
        };
        const result = useNestedProp({ defaultConfig, userConfig });
        expect(result).toEqual({
            ...userConfig,
            title: { text: '2024', color: '#FF0000ff' },
            customPalette: ['#FF0000ff', '#22002244'],
        });
        expect(userConfig.title.color).toBe('red');
    });

    test('returns reconcilied config object with converted colors', () => {
        const defaultConfig = {
            attr1: {
                color: '#FFFFFF',
                value: 12,
                someDefaultObject: {
                    defaultAttr: 'default',
                },
            },
            attr2: {
                color: '#000000',
            },
        };

        const userConfig = {
            attr1: {
                color: 'rgb(0,0,0)',
                value: 1,
            },
            attr2: {
                color: 'red',
            },
        };

        expect(useNestedProp({ defaultConfig, userConfig })).toStrictEqual({
            attr1: {
                color: '#000000ff',
                value: 1,
                someDefaultObject: {
                    defaultAttr: 'default',
                },
            },
            attr2: {
                color: '#FF0000ff',
            },
        });
    });
});
