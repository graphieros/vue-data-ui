import { useNestedProp } from './useNestedProp';
import { palette, themePalettes } from './lib';
import { useThemeCheck } from './useThemeCheck';

const { isThemeValid, warnInvalidTheme } = /* @__PURE__ */ useThemeCheck();

// Keep the two existing pipelines separate so charts only include the behavior they use.
/**
 * Resolves chart configuration with precedence defaults, theme, then user overrides.
 * An invalid theme keeps the merged defaults and user settings.
 *
 * @param {object} userConfig - Explicit chart overrides.
 * @param {object} defaultConfig - Complete component defaults.
 * @param {Record<string, object>} themes - Theme configurations keyed by name.
 * @returns {object} Resolved configuration.
 */
export function resolveChartConfig(userConfig, defaultConfig, themes) {
    const mergedConfig = useNestedProp({
        userConfig: userConfig,
        defaultConfig: defaultConfig,
    });

    const theme = mergedConfig.theme;
    if (!theme) return mergedConfig;

    if (!isThemeValid.value(mergedConfig)) {
        warnInvalidTheme(mergedConfig);
        return mergedConfig;
    }

    const fused = useNestedProp({
        userConfig: themes[theme] || userConfig,
        defaultConfig: mergedConfig,
    });

    const finalConfig = useNestedProp({
        userConfig: userConfig,
        defaultConfig: fused,
    });

    return finalConfig;
}

/**
 * Resolves configuration and supplies the selected theme palette when no custom
 * palette is configured. Explicit user settings take precedence over the theme.
 *
 * @param {object} userConfig - Explicit chart overrides.
 * @param {object} defaultConfig - Complete defaults including customPalette.
 * @param {Record<string, object>} themes - Theme configurations keyed by name.
 * @returns {object} Resolved configuration with its effective palette.
 */
export function resolveChartConfigWithPalette(
    userConfig,
    defaultConfig,
    themes,
) {
    const mergedConfig = useNestedProp({
        userConfig: userConfig,
        defaultConfig: defaultConfig,
    });

    const theme = mergedConfig.theme;
    if (!theme) return mergedConfig;

    if (!isThemeValid.value(mergedConfig)) {
        warnInvalidTheme(mergedConfig);
        return mergedConfig;
    }

    const fused = useNestedProp({
        userConfig: themes[theme] || userConfig,
        defaultConfig: mergedConfig,
    });

    const finalConfig = useNestedProp({
        userConfig: userConfig,
        defaultConfig: fused,
    });

    return {
        ...finalConfig,
        customPalette: finalConfig.customPalette.length
            ? finalConfig.customPalette
            : themePalettes[theme] || palette,
    };
}
