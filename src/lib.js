export function makeDonut(item, cx, cy, rx, ry) {
    let { series } = item;
            if (!series || item.base === 0)
                return {
                    ...series,
                    proportion: 0,
                    ratio: 0,
                    path: "",
                    startX: 0,
                    startY: 0,
                    endX: 0,
                    center: {},
                };
                const sum = [...series]
                .map((serie) => serie.value)
                .reduce((a, b) => a + b, 0);
                
                const ratios = [];
                let acc = 0;
                for (let i = 0; i < series.length; i += 1) {
                let proportion = series[i].value / sum;
                const ratio = proportion * (Math.PI * 1.9999); // (Math.PI * 2) fails to display a donut with only one value > 0 as it goes full circle again
                // midProportion & midRatio are used to find the midpoint of the arc to display markers
                const midProportion = series[i].value / 2 / sum;
                const midRatio = midProportion * (Math.PI * 2);
                const { startX, startY, endX, endY, path } = createArc(
                    [cx, cy],
                    [rx, ry],
                    [acc, ratio],
                    110
                );
                ratios.push({
                    ...series[i],
                    proportion,
                    ratio: ratio,
                    path,
                    startX,
                    startY,
                    endX,
                    endY,
                    center: createArc(
                    [cx, cy],
                    [rx * 1.45, ry * 1.45],
                    [acc, midRatio],
                    110
                    ), // center of the arc, to display the marker. rx & ry are larger to be displayed with a slight offset
                });
                acc += ratio;
                }
            return ratios;
}

export function addVector([a1, a2], [b1, b2]) {
    return [a1 + b1, a2 + b2];
}

export function matrixTimes([[a, b], [c, d]], [x, y]) {
    return [a * x + b * y, c * x + d * y];
}

export function rotateMatrix(x) {
    return [
    [Math.cos(x), -Math.sin(x)],
    [Math.sin(x), Math.cos(x)],
    ];
}

export function createArc([cx, cy], [rx, ry], [position, ratio], phi) {
    ratio = ratio % (2 * Math.PI);
    const rotMatrix = rotateMatrix(phi);
    const [sX, sY] = addVector(
    matrixTimes(rotMatrix, [
        rx * Math.cos(position),
        ry * Math.sin(position),
    ]),
    [cx, cy]
    );
    const [eX, eY] = addVector(
    matrixTimes(rotMatrix, [
        rx * Math.cos(position + ratio),
        ry * Math.sin(position + ratio),
    ]),
    [cx, cy]
    );
    const fA = ratio > Math.PI ? 1 : 0;
    const fS = ratio > 0 ? 1 : 0;
    return {
        startX: sX,
        startY: sY,
        endX: eX,
        endY: eY,
        path: `M${sX} ${sY} A ${[
            rx,
            ry,
            (phi / (2 * Math.PI)) * 360,
            fA,
            fS,
            eX,
            eY,
        ].join(" ")}`,
    };
}

export function treeShake({ defaultConfig, userConfig }) {
    const finalConfig = {...defaultConfig};

    Object.keys(finalConfig).forEach(key => {
        if(Object.hasOwn(userConfig, key)) {
            const currentVal = userConfig[key]
            if(typeof currentVal === 'boolean'){
                finalConfig[key] = currentVal;
            } else if(["string", "number"].includes(typeof currentVal)) {
                if(isValidUserValue(currentVal)) {
                    finalConfig[key] = currentVal;
                }
            } else if(Array.isArray(finalConfig[key])) {
                if(checkArray({ userConfig, key})) {
                    finalConfig[key] = currentVal;
                }
            } else if(checkObj({ userConfig, key})){
                finalConfig[key] = treeShake({
                    defaultConfig: finalConfig[key],
                    userConfig: currentVal
                });
            }
        }
    });
    return finalConfig;
}

export function checkArray({ userConfig, key }) {
    return Object.hasOwn(userConfig, key) && Array.isArray(userConfig[key]) && userConfig[key].length;
}

export function checkObj({ userConfig, key}) {
    return  Object.hasOwn(userConfig, key) && !Array.isArray(userConfig[key]) && typeof userConfig[key] === "object";
}

export function isValidUserValue(val) {
    return ![null, undefined, NaN, Infinity, -Infinity].includes(val);
}

export function isSafeValue(val) {
    return ![undefined, NaN, Infinity, -Infinity].includes(val)
}

export function checkNaN(val, fallback = 0) {
    if(isNaN(val)) {
        return fallback
    }else {
        return val
    }
}

export const palette = [
    '#3366cc',
    '#dc3912',
    '#ff9900',
    '#109618',
    '#990099',
    '#0099c6',
    '#dd4477',
    '#66aa00',
    '#b82e2e',
    '#316395',
    '#994499',
    '#22aa99',
    '#aaaa11',
    '#6633cc',
    '#e67300',
    '#8b0707',
    '#651067',
    '#329262',
    '#5574a6',
    '#3b3eac',
    '#b77322',
    '#16d620',
    '#b91383',
    '#f4359e',
    '#9c5935',
    '#a9c413',
    '#2a778d',
    '#668d1c',
    '#bea413',
    '#0c5922',
    '#743411',
];

export function convertColorToHex(color) {
    const hexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    const rgbRegex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/i;
    const hslRegex = /^hsla?\((\d+),\s*([\d.]+)%,\s*([\d.]+)%(?:,\s*[\d.]+)?\)$/i;

    let match;

    if ((match = color.match(hexRegex))) {
        const [, r, g, b] = match;
        return `#${r}${g}${b}`;
    } else if ((match = color.match(rgbRegex))) {
        const [, r, g, b] = match;
        return `#${decimalToHex(r)}${decimalToHex(g)}${decimalToHex(b)}`;
    } else if ((match = color.match(hslRegex))) {
        const [, h, s, l] = match;
        const rgb = hslToRgb(Number(h), Number(s), Number(l));
        return `#${decimalToHex(rgb[0])}${decimalToHex(rgb[1])}${decimalToHex(rgb[2])}`;
    }

    return null;
}

export function decimalToHex(decimal) {
    const hex = Number(decimal).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

export function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hueToRgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hueToRgb(p, q, h + 1 / 3);
        g = hueToRgb(p, q, h);
        b = hueToRgb(p, q, h - 1 / 3);
    }

    return [
        Math.round(r * 255),
        Math.round(g * 255),
        Math.round(b * 255),
    ];
}

const lib = {
    makeDonut,
    treeShake,
    isValidUserValue,
    isSafeValue,
    checkNaN,
    palette,
    convertColorToHex
};
export default lib;