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

/**
 * Lazily imports a theme configuration and caches successful loads.
 *
 * @param {string} type - Theme file name without the .json extension.
 * @returns {Promise<object | null>} Cached or loaded theme; null for empty or failed requests.
 */
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

/**
 * Reads an already loaded theme without initiating an import.
 * @param {string} type - Theme file name without the .json extension.
 * @returns {object | null} Cached theme, or null until it has been loaded.
 */
export function getThemeConfigSync(type) {
    if (!type) return null;
    return _cache.get(type) ?? null;
}

/**
 * Loads a theme into the cache before a chart needs it.
 * @param {string} type - Theme file name without the .json extension.
 * @returns {Promise<object | null>} Loaded configuration, or null on failure.
 */
export async function preloadTheme(type) {
    return await getThemeConfig(type);
}
/**
 * Loads several themes concurrently, preserving the requested order.
 * @param {string[]} [types=[]] - Theme file names without extensions.
 * @returns {Promise<Array<object | null>>} One result per requested theme.
 */
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
