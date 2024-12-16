import { convertColorToHex, darkenHexColor, lightenHexColor, shiftHue } from "./lib";

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

const exposedLib = {
    lightenColor,
    darkenColor,
    shiftColorHue
}

export default exposedLib;