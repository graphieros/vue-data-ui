import {
    expect,
    test,
    describe,
} from "vitest";

import {
    lightenColor,
    darkenColor,
    shiftColorHue
} from '../src/exposedLib';

describe('lightenColor', () => {
    test('returns a lightened hex color by a given strength from a rgb source', () => {
        const color = 'rgb(255,0,0)';
        expect(lightenColor(color, 0.1)).toBe('#ff1a1aff')
        expect(lightenColor(color, 0.2)).toBe('#ff3333ff')
        expect(lightenColor(color, 0.3)).toBe('#ff4d4dff')
        expect(lightenColor(color, 0.4)).toBe('#ff6666ff')
        expect(lightenColor(color, 0.5)).toBe('#ff8080ff')
        expect(lightenColor(color, 0.6)).toBe('#ff9999ff')
        expect(lightenColor(color, 0.7)).toBe('#ffb3b3ff')
        expect(lightenColor(color, 0.8)).toBe('#ffccccff')
        expect(lightenColor(color, 0.9)).toBe('#ffe6e6ff')
        expect(lightenColor(color, 1)).toBe('#ffffffff')
    });

    test('returns a lightened hex color by a given strength from a rgba source', () => {
        const color = 'rgb(255,0,0,0.5)';
        expect(lightenColor(color, 0.1)).toBe('#ff1a1a80')
        expect(lightenColor(color, 0.2)).toBe('#ff333380')
        expect(lightenColor(color, 0.3)).toBe('#ff4d4d80')
        expect(lightenColor(color, 0.4)).toBe('#ff666680')
        expect(lightenColor(color, 0.5)).toBe('#ff808080')
        expect(lightenColor(color, 0.6)).toBe('#ff999980')
        expect(lightenColor(color, 0.7)).toBe('#ffb3b380')
        expect(lightenColor(color, 0.8)).toBe('#ffcccc80')
        expect(lightenColor(color, 0.9)).toBe('#ffe6e680')
        expect(lightenColor(color, 1)).toBe('#ffffff80')
    });

    test('returns a lightened hex color by a given strength from a hex source', () => {
        const color = '#FF0000';
        expect(lightenColor(color, 0.1)).toBe('#ff1a1aff')
        expect(lightenColor(color, 0.2)).toBe('#ff3333ff')
        expect(lightenColor(color, 0.3)).toBe('#ff4d4dff')
        expect(lightenColor(color, 0.4)).toBe('#ff6666ff')
        expect(lightenColor(color, 0.5)).toBe('#ff8080ff')
        expect(lightenColor(color, 0.6)).toBe('#ff9999ff')
        expect(lightenColor(color, 0.7)).toBe('#ffb3b3ff')
        expect(lightenColor(color, 0.8)).toBe('#ffccccff')
        expect(lightenColor(color, 0.9)).toBe('#ffe6e6ff')
        expect(lightenColor(color, 1)).toBe('#ffffffff')
    });

    test('returns a lightened hex color by a given strength from a hex source with alpha channel', () => {
        const color = '#FF000080';
        expect(lightenColor(color, 0.1)).toBe('#ff1a1a80')
        expect(lightenColor(color, 0.2)).toBe('#ff333380')
        expect(lightenColor(color, 0.3)).toBe('#ff4d4d80')
        expect(lightenColor(color, 0.4)).toBe('#ff666680')
        expect(lightenColor(color, 0.5)).toBe('#ff808080')
        expect(lightenColor(color, 0.6)).toBe('#ff999980')
        expect(lightenColor(color, 0.7)).toBe('#ffb3b380')
        expect(lightenColor(color, 0.8)).toBe('#ffcccc80')
        expect(lightenColor(color, 0.9)).toBe('#ffe6e680')
        expect(lightenColor(color, 1)).toBe('#ffffff80')
    });
})

describe('darkenColor', () => {
    test('returns a darkened hex color by a given strength from a rgb source', () => {
        const color = 'rgb(255,0,0)';
        expect(darkenColor(color, 0.1)).toBe('#e60000ff')
        expect(darkenColor(color, 0.2)).toBe('#cc0000ff')
        expect(darkenColor(color, 0.3)).toBe('#b30000ff')
        expect(darkenColor(color, 0.4)).toBe('#990000ff')
        expect(darkenColor(color, 0.5)).toBe('#800000ff')
        expect(darkenColor(color, 0.6)).toBe('#660000ff')
        expect(darkenColor(color, 0.7)).toBe('#4d0000ff')
        expect(darkenColor(color, 0.8)).toBe('#330000ff')
        expect(darkenColor(color, 0.9)).toBe('#1a0000ff')
        expect(darkenColor(color, 1)).toBe('#000000ff')
    });

    test('returns a darkened hex color by a given strength from a rgba source', () => {
        const color = 'rgb(255,0,0,0.5)';
        expect(darkenColor(color, 0.1)).toBe('#e6000080')
        expect(darkenColor(color, 0.2)).toBe('#cc000080')
        expect(darkenColor(color, 0.3)).toBe('#b3000080')
        expect(darkenColor(color, 0.4)).toBe('#99000080')
        expect(darkenColor(color, 0.5)).toBe('#80000080')
        expect(darkenColor(color, 0.6)).toBe('#66000080')
        expect(darkenColor(color, 0.7)).toBe('#4d000080')
        expect(darkenColor(color, 0.8)).toBe('#33000080')
        expect(darkenColor(color, 0.9)).toBe('#1a000080')
        expect(darkenColor(color, 1)).toBe('#00000080')
    });

    test('returns a darkened hex color by a given strength from a hex source', () => {
        const color = '#FF0000';
        expect(darkenColor(color, 0.1)).toBe('#e60000ff')
        expect(darkenColor(color, 0.2)).toBe('#cc0000ff')
        expect(darkenColor(color, 0.3)).toBe('#b30000ff')
        expect(darkenColor(color, 0.4)).toBe('#990000ff')
        expect(darkenColor(color, 0.5)).toBe('#800000ff')
        expect(darkenColor(color, 0.6)).toBe('#660000ff')
        expect(darkenColor(color, 0.7)).toBe('#4d0000ff')
        expect(darkenColor(color, 0.8)).toBe('#330000ff')
        expect(darkenColor(color, 0.9)).toBe('#1a0000ff')
        expect(darkenColor(color, 1)).toBe('#000000ff')
    });

    test('returns a darkened hex color by a given strength from a hex source with alpha channel', () => {
        const color = '#FF000080';
        expect(darkenColor(color, 0.1)).toBe('#e6000080')
        expect(darkenColor(color, 0.2)).toBe('#cc000080')
        expect(darkenColor(color, 0.3)).toBe('#b3000080')
        expect(darkenColor(color, 0.4)).toBe('#99000080')
        expect(darkenColor(color, 0.5)).toBe('#80000080')
        expect(darkenColor(color, 0.6)).toBe('#66000080')
        expect(darkenColor(color, 0.7)).toBe('#4d000080')
        expect(darkenColor(color, 0.8)).toBe('#33000080')
        expect(darkenColor(color, 0.9)).toBe('#1a000080')
        expect(darkenColor(color, 1)).toBe('#00000080')
    });
});

describe('shiftColorHue', () => {
    test('Shifts a color from a rgb source', () => {
        const color = 'rgb(255,0,0)';
        expect(shiftColorHue(color, 0.05)).toBe('#ff4d00ff')
        expect(shiftColorHue(color, 0.1)).toBe('#ff9900ff')
        expect(shiftColorHue(color, 0.15)).toBe('#ffe500ff')
        expect(shiftColorHue(color, 0.2)).toBe('#ccff00ff')
        expect(shiftColorHue(color, 0.3)).toBe('#33ff00ff')
        expect(shiftColorHue(color, 0.4)).toBe('#00ff66ff')
        expect(shiftColorHue(color, 0.5)).toBe('#00ffffff')
        expect(shiftColorHue(color, 0.6)).toBe('#0066ffff')
        expect(shiftColorHue(color, 0.7)).toBe('#3300ffff')
        expect(shiftColorHue(color, 0.8)).toBe('#cc00ffff')
        expect(shiftColorHue(color, 0.9)).toBe('#ff0099ff')
        expect(shiftColorHue(color, 1)).toBe('#ff0000ff')
    })

    test('Shifts a color from a rgba source', () => {
        const color = 'rgb(255,0,0,0.5)';
        expect(shiftColorHue(color, 0.05)).toBe('#ff4d0080')
        expect(shiftColorHue(color, 0.1)).toBe('#ff990080')
        expect(shiftColorHue(color, 0.15)).toBe('#ffe50080')
        expect(shiftColorHue(color, 0.2)).toBe('#ccff0080')
        expect(shiftColorHue(color, 0.3)).toBe('#33ff0080')
        expect(shiftColorHue(color, 0.4)).toBe('#00ff6680')
        expect(shiftColorHue(color, 0.5)).toBe('#00ffff80')
        expect(shiftColorHue(color, 0.6)).toBe('#0066ff80')
        expect(shiftColorHue(color, 0.7)).toBe('#3300ff80')
        expect(shiftColorHue(color, 0.8)).toBe('#cc00ff80')
        expect(shiftColorHue(color, 0.9)).toBe('#ff009980')
        expect(shiftColorHue(color, 1)).toBe('#ff000080')
    })

    test('Shifts a color from a hex source', () => {
        const color = '#FF0000';
        expect(shiftColorHue(color, 0.05)).toBe('#ff4d00ff')
        expect(shiftColorHue(color, 0.1)).toBe('#ff9900ff')
        expect(shiftColorHue(color, 0.15)).toBe('#ffe500ff')
        expect(shiftColorHue(color, 0.2)).toBe('#ccff00ff')
        expect(shiftColorHue(color, 0.3)).toBe('#33ff00ff')
        expect(shiftColorHue(color, 0.4)).toBe('#00ff66ff')
        expect(shiftColorHue(color, 0.5)).toBe('#00ffffff')
        expect(shiftColorHue(color, 0.6)).toBe('#0066ffff')
        expect(shiftColorHue(color, 0.7)).toBe('#3300ffff')
        expect(shiftColorHue(color, 0.8)).toBe('#cc00ffff')
        expect(shiftColorHue(color, 0.9)).toBe('#ff0099ff')
        expect(shiftColorHue(color, 1)).toBe('#ff0000ff')
    })

    test('Shifts a color from a hex source with alpha channel', () => {
        const color = '#FF000080';
        expect(shiftColorHue(color, 0.05)).toBe('#ff4d0080')
        expect(shiftColorHue(color, 0.1)).toBe('#ff990080')
        expect(shiftColorHue(color, 0.15)).toBe('#ffe50080')
        expect(shiftColorHue(color, 0.2)).toBe('#ccff0080')
        expect(shiftColorHue(color, 0.3)).toBe('#33ff0080')
        expect(shiftColorHue(color, 0.4)).toBe('#00ff6680')
        expect(shiftColorHue(color, 0.5)).toBe('#00ffff80')
        expect(shiftColorHue(color, 0.6)).toBe('#0066ff80')
        expect(shiftColorHue(color, 0.7)).toBe('#3300ff80')
        expect(shiftColorHue(color, 0.8)).toBe('#cc00ff80')
        expect(shiftColorHue(color, 0.9)).toBe('#ff009980')
        expect(shiftColorHue(color, 1)).toBe('#ff000080')
    })
})