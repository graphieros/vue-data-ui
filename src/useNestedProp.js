import { treeShake, convertConfigColors } from './lib';

/**
 * Merges supported user options and normalizes configuration colors.
 * With no overrides, returns defaultConfig itself rather than a copy.
 * @param {object} options - Configuration layers.
 * @param {object} options.defaultConfig - Default values and supported keys.
 * @param {object} options.userConfig - User overrides.
 * @returns {object} Effective configuration.
 */
export function useNestedProp({ defaultConfig, userConfig }) {
    if (!Object.keys(userConfig || {}).length) {
        return defaultConfig;
    }
    const reconciled = treeShake({
        defaultConfig: defaultConfig,
        userConfig,
    });
    return convertConfigColors(reconciled);
}
