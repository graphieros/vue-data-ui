import { describe, expect, test, vi, afterEach } from 'vitest';
import {
    createSeedNumber,
    createSeededSvgPattern,
    createPatternDef,
} from '../src/patternUtils';

describe('createSeedNumber', () => {
    test('returns a deterministic unsigned 32 bit integer for the same input', () => {
        const firstResult = createSeedNumber('Series A');
        const secondResult = createSeedNumber('Series A');

        expect(firstResult).toBe(secondResult);
        expect(Number.isInteger(firstResult)).toBe(true);
        expect(firstResult).toBeGreaterThanOrEqual(0);
        expect(firstResult).toBeLessThanOrEqual(4294967295);
    });

    test('returns different hashes for different inputs', () => {
        const firstResult = createSeedNumber('Series A');
        const secondResult = createSeedNumber('Series B');

        expect(firstResult).not.toBe(secondResult);
    });

    test('normalizes nullish values to an empty string', () => {
        expect(createSeedNumber(undefined)).toBe(createSeedNumber(''));
        expect(createSeedNumber(null)).toBe(createSeedNumber(''));
    });

    test('normalizes non string values with String()', () => {
        expect(createSeedNumber(123)).toBe(createSeedNumber('123'));
        expect(createSeedNumber(true)).toBe(createSeedNumber('true'));
    });
});

describe('createSeededSvgPattern', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('returns a deterministic pattern for the same seed and options', () => {
        const firstPattern = createSeededSvgPattern('Series A', {
            foregroundColor: '#222222',
            backgroundColor: '#ffffff',
            minimumSize: 8,
            maximumSize: 20,
        });

        const secondPattern = createSeededSvgPattern('Series A', {
            foregroundColor: '#222222',
            backgroundColor: '#ffffff',
            minimumSize: 8,
            maximumSize: 20,
        });

        expect(firstPattern).toEqual(secondPattern);
    });

    test('returns different markup when disambiguator changes', () => {
        const firstPattern = createSeededSvgPattern('Series A', {
            disambiguator: '0',
        });

        const secondPattern = createSeededSvgPattern('Series A', {
            disambiguator: '1',
        });

        expect(firstPattern.contentMarkup).not.toBe(
            secondPattern.contentMarkup,
        );
    });

    test('returns an object with the expected shape', () => {
        const pattern = createSeededSvgPattern('Series A');

        expect(pattern).toEqual({
            width: expect.any(Number),
            height: expect.any(Number),
            rotation: expect.any(Number),
            patternType: expect.any(String),
            contentMarkup: expect.any(String),
        });
    });

    test('returns width and height within the provided range using 2 point increments', () => {
        const pattern = createSeededSvgPattern('Series A', {
            minimumSize: 10,
            maximumSize: 18,
        });

        expect([10, 12, 14, 16, 18]).toContain(pattern.width);
        expect(pattern.height).toBe(pattern.width);
    });

    test('returns the current top level pattern type', () => {
        const pattern = createSeededSvgPattern('Series A');

        expect(pattern.patternType).toBe('prettyUniquePattern');
    });

    test('returns a supported rotation value', () => {
        const pattern = createSeededSvgPattern('Series A');

        expect([0, 15, 30, 45, 60, 90]).toContain(pattern.rotation);
    });

    test('escapes background and foreground colors in generated markup', () => {
        const pattern = createSeededSvgPattern('Series A', {
            foregroundColor: '"<unsafe>&',
            backgroundColor: '"<unsafe>&',
        });

        expect(pattern.contentMarkup).toContain('&quot;&lt;unsafe&gt;&amp;');
        expect(pattern.contentMarkup).not.toContain('"<unsafe>&');
    });

    test('includes a background rect when backgroundColor is not transparent', () => {
        const pattern = createSeededSvgPattern('Series A', {
            backgroundColor: '#ff0000',
        });

        expect(pattern.contentMarkup.startsWith('<rect')).toBe(true);
        expect(pattern.contentMarkup).toContain('fill="#ff0000"');
    });

    test('does not include a background rect when backgroundColor is transparent', () => {
        const pattern = createSeededSvgPattern('Series A', {
            backgroundColor: 'transparent',
        });

        expect(pattern.contentMarkup.startsWith('<rect')).toBe(false);
    });

    test('falls back safely when minimumSize is invalid', () => {
        const pattern = createSeededSvgPattern('Series A', {
            minimumSize: -10,
            maximumSize: 20,
        });

        expect(pattern.width).toBeGreaterThanOrEqual(8);
        expect(pattern.height).toBe(pattern.width);
    });

    test('falls back safely when maximumSize is invalid', () => {
        const pattern = createSeededSvgPattern('Series A', {
            minimumSize: 8,
            maximumSize: Number.NaN,
        });

        expect(pattern.width).toBeGreaterThanOrEqual(8);
        expect(pattern.height).toBe(pattern.width);
    });

    test('swaps minimumSize and maximumSize when minimumSize is greater than maximumSize', () => {
        const pattern = createSeededSvgPattern('Series A', {
            minimumSize: 20,
            maximumSize: 8,
        });

        expect(pattern.width).toBeGreaterThanOrEqual(8);
        expect(pattern.width).toBeLessThanOrEqual(20);
        expect(pattern.height).toBe(pattern.width);
    });

    test('does not throw when seed is nullish', () => {
        expect(() => createSeededSvgPattern(undefined)).not.toThrow();
        expect(() => createSeededSvgPattern(null)).not.toThrow();
    });

    test('does not throw when options is omitted', () => {
        expect(() => createSeededSvgPattern('Series A')).not.toThrow();
    });

    test('returns a safe fallback object if String conversion of seed throws', () => {
        const consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});
        const invalidSeed = {
            toString() {
                throw new Error('broken toString');
            },
        };

        const pattern = createSeededSvgPattern(invalidSeed);

        expect(pattern).toEqual({
            width: 8,
            height: 8,
            rotation: 0,
            patternType: 'prettyUniquePattern',
            contentMarkup: '',
        });

        expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test('returns a non empty contentMarkup for normal usage', () => {
        const pattern = createSeededSvgPattern('Series A');

        expect(pattern.contentMarkup.length).toBeGreaterThan(0);
    });

    test('returns deterministic visible markup families for repeated calls', () => {
        const firstPattern = createSeededSvgPattern('Series A', {
            foregroundColor: '#111111',
            backgroundColor: '#ffffff',
            minimumSize: 8,
            maximumSize: 20,
            disambiguator: 'same',
        });

        const secondPattern = createSeededSvgPattern('Series A', {
            foregroundColor: '#111111',
            backgroundColor: '#ffffff',
            minimumSize: 8,
            maximumSize: 20,
            disambiguator: 'same',
        });

        expect(firstPattern.contentMarkup).toBe(secondPattern.contentMarkup);
    });
});

describe('createPatternDef', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('returns deterministic pattern slot markup for the same input', () => {
        const firstMarkup = createPatternDef({
            id: 'pattern-a',
            seed: 'Series A',
            color: '#ff0000',
            foregroundColor: '#111111',
            backgroundColor: '#ffffff',
            minSize: 8,
            maxSize: 20,
        });

        const secondMarkup = createPatternDef({
            id: 'pattern-a',
            seed: 'Series A',
            color: '#ff0000',
            foregroundColor: '#111111',
            backgroundColor: '#ffffff',
            minSize: 8,
            maxSize: 20,
        });

        expect(firstMarkup).toBe(secondMarkup);
    });

    test('returns SVG pattern markup', () => {
        const markup = createPatternDef({
            id: 'pattern-a',
            seed: 'Series A',
        });

        expect(markup.startsWith('<defs><pattern')).toBe(true);
        expect(markup.endsWith('</pattern></defs>')).toBe(true);
        expect(markup).toContain('patternUnits="userSpaceOnUse"');
        expect(markup).toContain('patternTransform="rotate(');
    });

    test('escapes the pattern id', () => {
        const markup = createPatternDef({
            id: '"<unsafe>&',
            seed: 'Series A',
        });

        expect(markup).toContain('id="&quot;&lt;unsafe&gt;&amp;"');
        expect(markup).not.toContain('id=""<unsafe>&"');
    });

    test('returns safe fallback markup if pattern creation flow throws', () => {
        const consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});
        const invalidSeed = {
            toString() {
                throw new Error('broken seed');
            },
        };

        const markup = createPatternDef({
            id: 'pattern-a',
            seed: invalidSeed,
        });

        expect(markup).toBe(
            '<defs><pattern id="pattern-a" patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(0)"></pattern></defs>',
        );
        expect(consoleErrorSpy).toHaveBeenCalled();
    });

    test('includes generated pattern width and height attributes', () => {
        const markup = createPatternDef({
            id: 'pattern-a',
            seed: 'Series A',
            minSize: 8,
            maxSize: 8,
        });

        expect(markup).toContain('width="8"');
        expect(markup).toContain('height="8"');
    });
});
