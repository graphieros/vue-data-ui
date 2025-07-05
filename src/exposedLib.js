import { convertColorToHex, darkenHexColor, lightenHexColor, shiftHue, treeShake } from "./lib";

export function lightenColor(color, strength) {
    const hexColor = convertColorToHex(color);
    return lightenHexColor(hexColor, strength);
}

export function darkenColor(color, strength) {
    const hexColor = convertColorToHex(color);
    return darkenHexColor(hexColor, strength);
}

export function shiftColorHue(color, strength) {
    const hexColor = convertColorToHex(color);
    return shiftHue(hexColor, strength);
}

export function mergeConfigs({ defaultConfig, userConfig }) {
    return treeShake({ defaultConfig, userConfig })
}

const exposedLib = {
    lightenColor,
    darkenColor,
    shiftColorHue,
    mergeConfigs
}

export default exposedLib;