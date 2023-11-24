import { treeShake, convertConfigColors } from "./lib";

export function useNestedProp({ defaultConfig, userConfig }) {
    if(!Object.keys(userConfig || {}).length) {
        return defaultConfig;
    }
    const reconciled = treeShake({
        defaultConfig: defaultConfig,
        userConfig
    });
    return convertConfigColors(reconciled)
}