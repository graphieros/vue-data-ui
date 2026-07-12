import {
    calcAverage,
    calcMedian,
    convertColorToHex,
    darkenHexColor,
    lightenHexColor,
    shiftHue,
    treeShake,
} from './lib';

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
    return treeShake({ defaultConfig, userConfig });
}

export function average(arr) {
    return calcAverage(arr);
}

export function median(arr) {
    return calcMedian(arr);
}

const exposedLib = {
    average,
    darkenColor,
    lightenColor,
    median,
    mergeConfigs,
    shiftColorHue,
};

export default exposedLib;
