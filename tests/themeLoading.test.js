// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs';
import { expect, test, vi } from 'vitest';
import getThemeConfig, {
    getThemeConfigSync,
    preloadTheme,
} from '../src/getThemeConfig';

const directory = new URL('../src/themes/', import.meta.url);
const files = readdirSync(directory).filter((name) => name.endsWith('.json'));

test.each(files)('the real lazy registry loads and caches %s', async (file) => {
    const type = file.slice(0, -5);
    const original = JSON.parse(readFileSync(new URL(file, directory), 'utf8'));
    const theme = await getThemeConfig(type);
    expect(theme).toEqual(original);
    expect(await getThemeConfig(type)).toBe(theme);
    expect(await preloadTheme(type)).toBe(theme);
    expect(getThemeConfigSync(type)).toBe(theme);
});

test('retains missing-theme warnings and null results', async () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
        expect(await getThemeConfig('not-a-theme')).toBeNull();
        expect(warning).toHaveBeenCalledWith(
            '[getThemeConfig] Missing theme file: not-a-theme.json',
            expect.objectContaining({ code: 'ENOENT' }),
        );
        expect(getThemeConfigSync('not-a-theme')).toBeNull();
        expect(await getThemeConfig()).toBeNull();
    } finally {
        warning.mockRestore();
    }
});
