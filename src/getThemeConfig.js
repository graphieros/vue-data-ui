let themeLoaders;

// Configuration-only imports can discard the registry until a theme is requested.
function getThemeLoaders() {
    if (!themeLoaders) {
        const loaders = import.meta.glob('./themes/*.json', {
            import: 'default',
        });
        themeLoaders = Object.fromEntries(
            Object.entries(loaders).map(([path, load]) => {
                const m = path.match(/\/themes\/(.+)\.json$/);
                const type = m ? m[1] : path;
                return [type, load];
            }),
        );
    }
    return themeLoaders;
}

const _cache = new Map();

let _loader = async (type) => {
    const load = getThemeLoaders()[type];
    if (!load) {
        const err = new Error('ENOENT');
        err.code = 'ENOENT';
        throw err;
    }
    return await load();
};

async function getThemeConfig(type) {
    if (!type) return null;
    if (_cache.has(type)) return _cache.get(type);
    try {
        const theme = await _loader(type);
        _cache.set(type, theme);
        return theme;
    } catch (e) {
        console.warn(`[getThemeConfig] Missing theme file: ${type}.json`, e);
        return null;
    }
}

export default getThemeConfig;
export { getThemeConfig };

export function getThemeConfigSync(type) {
    if (!type) return null;
    return _cache.get(type) ?? null;
}

export async function preloadTheme(type) {
    return await getThemeConfig(type);
}
export async function preloadThemes(types = []) {
    return Promise.all(types.map(getThemeConfig));
}

export const __testing = {
    clearCache: () => _cache.clear(),
    cacheSize: () => _cache.size,
    setLoader: (fn) => {
        _loader = fn;
    },
};
