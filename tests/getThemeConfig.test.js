import { describe, test, expect, vi, beforeEach } from 'vitest';
import { preloadTheme, getThemeConfigSync, __testing } from '../src/getThemeConfig';

describe('getThemeConfig', () => {
    let calls;
    let loader;

    beforeEach(() => {
        __testing.clearCache();
        calls = 0;

        // Fake loader so tests don't touch the real filesystem
        loader = vi.fn(async (type) => {
            calls += 1;
            if (type === 'vue_ui_chord') {
                return { debug: true };
            }
            const err = new Error('ENOENT');
            err.code = 'ENOENT';
            throw err;
        });

        __testing.setLoader(loader);
    });

    test('returns theme object when JSON file exists (after preload)', async () => {
        await preloadTheme('vue_ui_chord');                 // loads once
        const theme = getThemeConfigSync('vue_ui_chord');   // sync read
        expect(theme).toEqual({ debug: true });
        expect(calls).toBe(1);
    });

    test('returns null when theme file does not exist', async () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        const res = await preloadTheme('non_existing_theme');
        expect(res).toBeNull();
        expect(warnSpy).toHaveBeenCalled();
        expect(calls).toBe(1);
        const theme = getThemeConfigSync('non_existing_theme');
        expect(theme).toBeNull();
        warnSpy.mockRestore();
    });

    test('uses cached theme on second call (module loaded once)', async () => {
        await preloadTheme('vue_ui_chord');                   // first (and only) load
        const first = getThemeConfigSync('vue_ui_chord');    // from cache
        const second = getThemeConfigSync('vue_ui_chord');    // from cache
        expect(second).toBe(first);                           // same ref
        expect(calls).toBe(1);                                // loader once
        expect(__testing.cacheSize()).toBe(1);
    });

    test('returns null when called with undefined or empty type', () => {
        const a = getThemeConfigSync();
        const b = getThemeConfigSync('');
        expect(a).toBeNull();
        expect(b).toBeNull();
        expect(calls).toBe(0);
    });
});
