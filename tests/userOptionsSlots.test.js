import { describe, expect, test } from 'vitest';
import {
    getUserOptionSlots,
    getUserOptionSlotProps,
} from '../src/userOptionsSlots';

describe('user option slot selection', () => {
    test('only forwards provided slots from the chart-specific list, in order', () => {
        const slots = {
            menuIcon: () => [],
            optionPdf: () => [],
            skeleton: () => [],
        };
        expect(
            getUserOptionSlots(slots, 'optionPdf menuIcon optionSvg'),
        ).toEqual(['optionPdf', 'menuIcon']);
        expect(Object.keys(slots)).toEqual([
            'menuIcon',
            'optionPdf',
            'skeleton',
        ]);
    });

    test('reflects added, removed, and replaced slots on each render', () => {
        const slots = {};
        const names = 'menuIcon optionPdf';
        expect(getUserOptionSlots(slots, names)).toEqual([]);
        slots.menuIcon = () => [];
        expect(getUserOptionSlots(slots, names)).toEqual(['menuIcon']);
        slots.optionPdf = () => [];
        delete slots.menuIcon;
        expect(getUserOptionSlots(slots, names)).toEqual(['optionPdf']);
    });

    test('returns independent lists without retaining a chart slot object', () => {
        const names = 'menuIcon optionPdf';
        const result = getUserOptionSlots({ menuIcon: () => [] }, names);
        result.length = 0;
        expect(getUserOptionSlots({ optionPdf: () => [] }, names)).toEqual([
            'optionPdf',
        ]);
        expect(getUserOptionSlots({ menuIcon: () => [] }, names)).toEqual([
            'menuIcon',
        ]);
    });

    test('keeps provided-but-empty slot functions present', () => {
        expect(
            getUserOptionSlots({ optionPdf: () => [] }, 'optionPdf'),
        ).toEqual(['optionPdf']);
    });
});

describe('user option scoped props', () => {
    test('preserves values and function identities while excluding extra props', () => {
        const toggleFullscreen = () => {};
        const props = {
            toggleFullscreen,
            isFullscreen: false,
            unrelated: true,
        };
        expect(getUserOptionSlotProps('optionFullscreen', props)).toEqual({
            toggleFullscreen,
            isFullscreen: false,
        });
        expect(props.unrelated).toBe(true);
    });

    test.each([
        ['menuIcon', ['isOpen', 'color']],
        ['optionAnnotator', ['toggleAnnotator', 'isAnnotator']],
        ['optionAnimation', ['toggleAnimation', 'isAnimated']],
        ['optionZoom', ['toggleZoom', 'isZoomLocked']],
    ])('preserves the original %s prop names', (name, keys) => {
        const props = Object.fromEntries(keys.map((key) => [key, key]));
        expect(getUserOptionSlotProps(name, { ...props, extra: true })).toEqual(
            props,
        );
    });

    test('keeps the existing alt-copy slot prop contract', () => {
        const copyAlt = () => {};
        expect(getUserOptionSlotProps('optionAltCopy', { copyAlt })).toEqual({
            altCopy: undefined,
        });
    });

    test.each([
        'optionPdf',
        'optionCsv',
        'optionStack',
        'custom-menu-before',
        'custom-menu-after',
    ])('%s forwards no scoped props', (name) => {
        expect(getUserOptionSlotProps(name, { extra: true })).toEqual({});
    });
});
