// @vitest-environment node
import { readFileSync, readdirSync } from 'node:fs';
import { expect, test } from 'vitest';
import { ref, shallowRef } from 'vue';
import { useConfig } from '../src/useConfig';
import { convertConfigColors, convertColorToHex } from '../src/lib';
import { useNestedProp } from '../src/useNestedProp';

function checkColors(before, after, path = []) {
    if (
        typeof before === 'string' &&
        (before.startsWith('#') || before === 'transparent')
    ) {
        const hex = convertColorToHex(before);
        expect(
            hex,
            `Invalid color at ${path.join('.')}: ${before}`,
        ).not.toBeNull();
        expect(after, path.join('.')).toBe(hex);
    } else if (before && typeof before === 'object') {
        for (const key of Object.keys(before))
            checkColors(before[key], after[key], [...path, key]);
    }
}

test('normalizes every explicit color in the library default configurations', () => {
    const before = useConfig();
    const after = useConfig();
    convertConfigColors(after);
    checkColors(before, after);
});

const themeDirectory = new URL('../src/themes/', import.meta.url);
test.each(readdirSync(themeDirectory).filter((file) => file.endsWith('.json')))(
    'normalizes all explicit colors in %s',
    (file) => {
        const before = JSON.parse(
            readFileSync(new URL(file, themeDirectory), 'utf8'),
        );
        const after = structuredClone(before);
        convertConfigColors(after);
        checkColors(before, after);
    },
);

test('normalizes chart-specific color maps, nullable fields and nested palette arrays', () => {
    const config = {
        startColor: 'red',
        endColor: 'blue',
        strokeHovered: 'red',
        handleIconColor: 'red',
        selectedStroke: 'red',
        medianCircleFill: 'red',
        gradient: { underlayer: 'red' },
        evaluationColors: {
            enable: true,
            positive: 'red',
            negative: 'blue',
            neutral: '#abc',
        },
        heatmapColors: { min: 'red', max: 'blue' },
        selectedColor: { adapt: false, fallback: 'red' },
        colors: {
            activeReadonly: ['red'],
            high: 'red',
            low: 'blue',
            total: 'red',
            subtotal: 'blue',
        },
        customPalette: [['red', 'blue']],
        annotatorPalette: ['red'],
    };
    convertConfigColors(config);
    for (const key of [
        'startColor',
        'strokeHovered',
        'handleIconColor',
        'selectedStroke',
        'medianCircleFill',
    ]) {
        expect(config[key]).toBe('#FF0000ff');
    }
    expect(config.endColor).toBe('#0000FFff');
    expect(config.gradient.underlayer).toBe('#FF0000ff');
    expect(config.evaluationColors).toEqual({
        enable: true,
        positive: '#FF0000ff',
        negative: '#0000FFff',
        neutral: '#aabbccff',
    });
    expect(config.heatmapColors).toEqual({
        min: '#FF0000ff',
        max: '#0000FFff',
    });
    expect(config.selectedColor).toEqual({
        adapt: false,
        fallback: '#FF0000ff',
    });
    expect(config.colors).toEqual({
        activeReadonly: ['#FF0000ff'],
        high: '#FF0000ff',
        low: '#0000FFff',
        total: '#FF0000ff',
        subtotal: '#0000FFff',
    });
    expect(config.customPalette).toEqual([['#FF0000ff', '#0000FFff']]);
    expect(config.annotatorPalette).toEqual(['#FF0000ff']);
});

test('preserves numeric-looking and color-looking text refs', () => {
    for (const value of ['2024', 'Bad', 'red']) {
        const label = ref(value);
        const config = { label, title: { text: value }, value: 2024 };
        convertConfigColors(config);
        expect(config.label).toBe(label);
        expect(config.title.text).toBe(value);
        expect(config.value).toBe(2024);
    }
});

test.each(['transparent', 'TRANSPARENT', ' transparent '])(
    'supports %s directly, in configs, refs and palettes',
    (value) => {
        expect(convertColorToHex(value)).toBe('#FFFFFF00');
        const config = {
            color: value,
            style: { backgroundColor: value, fill: ref(value), stroke: value },
            customPalette: [value],
            title: { text: value },
            translations: { color: value },
        };
        convertConfigColors(config);
        expect(config.color).toBe('#FFFFFF00');
        expect(config.style).toEqual({
            backgroundColor: '#FFFFFF00',
            fill: '#FFFFFF00',
            stroke: '#FFFFFF00',
        });
        expect(config.customPalette).toEqual(['#FFFFFF00']);
        expect(config.title.text).toBe(value);
        expect(config.translations.color).toBe(value);
        expect(
            useNestedProp({
                defaultConfig: { color: '#000000' },
                userConfig: { color: value },
            }).color,
        ).toBe('#FFFFFF00');
    },
);

test('distinguishes dynamic node category labels from category colors, regardless of entry names', () => {
    const names = [
        'color',
        'fill',
        'stroke',
        'backgroundColor',
        'translations',
        'columnNames',
        'buttonTitles',
        'nodeCategories',
        '2024',
    ];
    const nodeCategories = Object.fromEntries(
        names.map((name) => [name, '2024']),
    );
    const nodeCategoryColors = Object.fromEntries(
        names.map((name) => [name, 'transparent']),
    );
    const config = { nodeCategories, nodeCategoryColors };
    convertConfigColors(config);
    expect(config.nodeCategories).toEqual(
        Object.fromEntries(names.map((name) => [name, '2024'])),
    );
    expect(config.nodeCategoryColors).toEqual(
        Object.fromEntries(names.map((name) => [name, '#FFFFFF00'])),
    );
});

test('normalizes colors in shallow-ref maps without replacing their refs', () => {
    const colors = shallowRef({ positive: 'transparent', negative: 'red' });
    const config = { evaluationColors: colors };
    convertConfigColors(config);
    expect(config.evaluationColors).toBe(colors);
    expect(colors.value).toEqual({
        positive: '#FFFFFF00',
        negative: '#FF0000ff',
    });
});

test('normalizes supplied values for nullable colors and useConfig color options', () => {
    const keys = [
        'handleIconColor',
        'handleBorderColor',
        'handleFill',
        'groupColor',
        'rowColor',
        'stroke',
        'fill',
        'backgroundColor',
        'labelColor',
        'color',
        'colorBackground',
        'colorTextPrimary',
        'colorTextSecondary',
        'colorGrid',
        'colorBorder',
    ];
    const defaults = Object.fromEntries(keys.map((key) => [key, null]));
    const userConfig = Object.fromEntries(
        keys.map((key) => [key, 'transparent']),
    );
    expect(useNestedProp({ defaultConfig: defaults, userConfig })).toEqual(
        Object.fromEntries(keys.map((key) => [key, '#FFFFFF00'])),
    );
    expect(convertConfigColors({ ...defaults })).toEqual(defaults);
});

test.each([
    '',
    'auto',
    'none',
    'inherit',
    'currentColor',
    'var(--my-color)',
    'url(#gradient)',
])('preserves unsupported/special color values: %s', (color) => {
    const config = { color };
    convertConfigColors(config);
    expect(config.color).toBe(color);
});

// Use existing literal values as an independent inventory of color fields, then
// replace EVERY string with a color-looking year. This catches false positives
// in text/enums as well as missed colors, rather than testing hex defaults only.
function checkStringFields(config) {
    const colorPaths = new Set();
    const paths = [];
    function replace(value, path = []) {
        if (typeof value === 'string') {
            paths.push(path);
            if (
                (value && convertColorToHex(value)) ||
                (value === 'auto' && path.at(-1) === 'color')
            ) {
                colorPaths.add(JSON.stringify(path));
            }
            return '2024';
        }
        if (Array.isArray(value))
            return value.map((child, i) =>
                replace(child, [...path, String(i)]),
            );
        if (value && typeof value === 'object')
            return Object.fromEntries(
                Object.entries(value).map(([key, child]) => [
                    key,
                    replace(child, [...path, key]),
                ]),
            );
        return value;
    }
    const probe = replace(config);
    convertConfigColors(probe);
    for (const path of paths) {
        const result = path.reduce((value, key) => value[key], probe);
        expect(result, path.join('.')).toBe(
            colorPaths.has(JSON.stringify(path)) ? '#22002244' : '2024',
        );
    }
    expect(paths.length).toBeGreaterThan(0);
}

test('distinguishes every default string field from a color field', () => {
    checkStringFields(useConfig());
});

test.each(readdirSync(themeDirectory).filter((file) => file.endsWith('.json')))(
    'distinguishes text and color fields throughout %s',
    (file) =>
        checkStringFields(
            JSON.parse(readFileSync(new URL(file, themeDirectory), 'utf8')),
        ),
);
