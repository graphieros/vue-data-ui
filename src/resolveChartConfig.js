import { useNestedProp } from './useNestedProp';
import { palette, themePalettes } from './lib';
import { useThemeCheck } from './useThemeCheck';

const { isThemeValid, warnInvalidTheme } = /* @__PURE__ */ useThemeCheck();

// Keep the two existing pipelines separate so charts only include the behavior they use.
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
