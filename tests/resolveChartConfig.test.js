import { describe, expect, test, vi } from 'vitest';
import {
    resolveChartConfig,
    resolveChartConfigWithPalette,
} from '../src/resolveChartConfig';
import { themePalettes } from '../src/lib';

function defaults() {
    return {
        theme: '',
        debug: false,
        customPalette: [],
        value: 1,
        nested: { label: 'Default label', enabled: true },
    };
}

describe.each([
    ['without palette selection', resolveChartConfig],
    ['with palette selection', resolveChartConfigWithPalette],
])('chart config resolution %s', (_name, resolve) => {
    test('returns the original defaults for empty or missing user config', () => {
        const config = defaults();
        expect(resolve({}, config, {})).toBe(config);
        expect(resolve(undefined, config, {})).toBe(config);
    });

    test('preserves user values, callbacks, nulls, and color normalization', () => {
        const formatter = (value) => String(value);
        const result = resolve(
            {
                value: 0,
                nested: { enabled: false },
                color: 'red',
                formatter,
                extra: null,
            },
            defaults(),
            {},
        );
        expect(result).toEqual({
            ...defaults(),
            value: 0,
            nested: { label: 'Default label', enabled: false },
            color: '#FF0000ff',
            formatter,
            extra: null,
        });
    });

    test('applies defaults, then theme values, then explicit user overrides', () => {
        const result = resolve(
            { theme: 'dark', nested: { label: 'User label' } },
            defaults(),
            {
                dark: {
                    value: 2,
                    nested: { label: 'Theme label', enabled: false },
                },
            },
        );
        expect(result.value).toBe(2);
        expect(result.nested).toEqual({ label: 'User label', enabled: false });
    });

    test('accepts a recognized theme with no chart-specific theme entry', () => {
        const result = resolve({ theme: 'dark', value: 3 }, defaults(), {});
        expect(result.value).toBe(3);
        expect(result.nested).toEqual(defaults().nested);
    });

    test('leaves invalid themes unthemed and only warns when debug is enabled', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            const themes = { invalid: { value: 99 } };
            const result = resolve({ theme: 'invalid' }, defaults(), themes);
            expect(result.value).toBe(1);
            expect(result.customPalette).toEqual([]);
            expect(warn).not.toHaveBeenCalled();
            resolve({ theme: 'invalid', debug: true }, defaults(), themes);
            expect(warn).toHaveBeenCalledTimes(1);
        } finally {
            warn.mockRestore();
        }
    });

    test('resolves each invocation from the current user config', () => {
        const userConfig = { theme: 'dark', value: 2 };
        const config = defaults();
        expect(resolve(userConfig, config, {}).value).toBe(2);
        userConfig.value = 3;
        expect(resolve(userConfig, config, {}).value).toBe(3);
    });
});

describe('palette selection differences', () => {
    test('the plain resolver keeps an empty custom palette with a valid theme', () => {
        const result = resolveChartConfig({ theme: 'dark' }, defaults(), {});
        expect(result.customPalette).toEqual([]);
    });

    test('the palette resolver uses the shared theme palette when none is supplied', () => {
        const result = resolveChartConfigWithPalette(
            { theme: 'minimal' },
            defaults(),
            {},
        );
        expect(result.customPalette).toBe(themePalettes.minimal);
    });

    test('keeps a nonempty palette supplied by the theme', () => {
        const result = resolveChartConfigWithPalette(
            { theme: 'dark' },
            defaults(),
            { dark: { customPalette: ['red'] } },
        );
        expect(result.customPalette).toEqual(['#FF0000ff']);
    });

    test('explicit user palettes override theme palettes', () => {
        const result = resolveChartConfigWithPalette(
            { theme: 'dark', customPalette: ['blue'] },
            defaults(),
            { dark: { customPalette: ['red'] } },
        );
        expect(result.customPalette).toEqual(['#0000FFff']);
    });
});
