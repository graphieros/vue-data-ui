import errors from "./errors.json";

export function makeDonut(item, cx, cy, rx, ry, piProportion = 1.99999, piMult = 2, arcAmpl = 1.45, degrees = 360, rotation = 105.25, size = 0) {
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
        const ratio = proportion * (Math.PI * piProportion); // (Math.PI * 2) fails to display a donut with only one value > 0 as it goes full circle again
        // midProportion & midRatio are used to find the midpoint of the arc to display markers
        const midProportion = series[i].value / 2 / sum;
        const midRatio = midProportion * (Math.PI * piMult);
        const { startX, startY, endX, endY, path } = createArc(
            [cx, cy],
            [rx, ry],
            [acc, ratio],
            rotation,
            degrees,
            piMult
        );

        const inner = createArc(
            [cx, cy],
            [rx - size, ry - size],
            [acc, ratio],
            rotation,
            degrees,
            piMult,
            true
        );

        ratios.push({
            arcSlice: `${path} L ${inner.startX} ${inner.startY} ${inner.path} L ${startX} ${startY}`,
            cx: checkNaN(cx),
            cy: checkNaN(cy),
            ...series[i],
            proportion: checkNaN(proportion),
            ratio: checkNaN(ratio),
            path: path.replaceAll('NaN', '0'),
            startX: checkNaN(startX),
            startY: checkNaN(startY),
            endX: checkNaN(endX),
            endY: checkNaN(endY),
            center: createArc(
                [cx, cy],
                [rx * arcAmpl, ry * arcAmpl],
                [acc, midRatio],
                rotation,
                degrees,
                piMult
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

export function createArc([cx, cy], [rx, ry], [position, ratio], phi, degrees = 360, piMult = 2, reverse = false) {
    ratio = ratio % (piMult * Math.PI);
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
    const fS = ratio > 0 ? reverse ? 0 : 1 : reverse ? 1 : 0;
    return {
        startX: reverse ? checkNaN(eX) : checkNaN(sX),
        startY: reverse ? checkNaN(eY) : checkNaN(sY),
        endX: reverse ? checkNaN(sX) : checkNaN(eX),
        endY: reverse ? checkNaN(sY) : checkNaN(eY),
        path: `M${reverse ? checkNaN(eX) : checkNaN(sX)} ${reverse ? checkNaN(eY) : checkNaN(sY)} A ${[
            checkNaN(rx),
            checkNaN(ry),
            checkNaN((phi / (piMult * Math.PI)) * degrees),
            checkNaN(fA),
            checkNaN(fS),
            reverse ? checkNaN(sX) : checkNaN(eX),
            reverse ? checkNaN(sY) : checkNaN(eY),
        ].join(" ")}`,
    };
}

export function treeShake({ defaultConfig, userConfig }) {
    const finalConfig = { ...defaultConfig };

    Object.keys(finalConfig).forEach(key => {
        if (Object.hasOwn(userConfig, key)) {
            const currentVal = userConfig[key]
            if (['boolean', 'function'].includes(typeof currentVal)) {
                finalConfig[key] = currentVal;
            } else if (["string", "number"].includes(typeof currentVal)) {
                if (isValidUserValue(currentVal)) {
                    finalConfig[key] = currentVal;
                }
            } else if (Array.isArray(finalConfig[key])) {
                if (checkArray({ userConfig, key })) {
                    finalConfig[key] = currentVal;
                }
            } else if (checkObj({ userConfig, key })) {
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
    return Object.hasOwn(userConfig, key) && Array.isArray(userConfig[key]) && userConfig[key].length >= 0;
}

export function checkObj({ userConfig, key }) {
    return Object.hasOwn(userConfig, key) && !Array.isArray(userConfig[key]) && typeof userConfig[key] === "object";
}

export function isValidUserValue(val) {
    return ![null, undefined, NaN, Infinity, -Infinity].includes(val);
}

export function isSafeValue(val) {
    return ![undefined, NaN, Infinity, -Infinity].includes(val)
}

export function checkNaN(val, fallback = 0) {
    if (isNaN(val)) {
        return fallback
    } else {
        return val
    }
}

export const palette = [
    "#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c",
    "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5",
    "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f",
    "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5",
    "#393b79", "#5254a3", "#6b6ecf", "#9c9ede", "#637939",
    "#8ca252", "#b5cf6b", "#cedb9c", "#8c6d31", "#bd9e39",
    "#e7ba52", "#e7cb94", "#843c39", "#ad494a", "#d6616b",
    "#e7969c", "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"
];

export function getPalette(palette = 'default') {
    switch (palette) {
        case 'hack':
            return themePalettes.hack;

        case 'zen':
            return themePalettes.zen;

        case 'concrete':
            return themePalettes.concrete;

        default:
            return themePalettes.default;
    }
}

export const themePalettes = {
    default: palette,
    concrete: [
        "#4A6A75",
        "#6C94A0",
        "#7DA9B5",
        "#8EBFCA",
        "#9FD4E0",
        "#B0E9F5",
        "#C1FFFF",
        "#5C6B5B",
        "#6D7D6D",
        "#7E8F7E",
        "#8FA290",
        "#A1B5A3",
        "#B2C7B5",
        "#C3DAC8",
        "#D4ECDA",
        "#E6FFF0",
        "#8A9CA5",
        "#9AA7B0",
        "#ABB1BC",
        "#BBCBC7",
        "#CCD6D3",
        "#DEE1DE",
        "#EFECEC",
        "#404C4D",
        "#50605F",
        "#617472",
        "#718885",
        "#829C98",
        "#92B0AB",
        "#A3C4BE",
        "#B3D8D2",
        "#C4EDE5",
        "#D4F1E8",
        "#404C5A",
        "#50606C",
        "#61747E",
        "#718890",
        "#829CA2",
        "#92B0B5"
    ],
    hack: [
        "#004C00",
        "#006600",
        "#008000",
        "#009900",
        "#00B300",
        "#00CC00",
        "#00E600",
        "#00FF00",
        "#33FF33",
        "#33E633",
        "#33CC33",
        "#33B333",
        "#339933",
        "#338033",
        "#336633",
        "#334C33",
        "#333333",
        "#00AF19",
        "#19E619",
        "#19CC19",
        "#19B319",
        "#199919",
        "#198019",
        "#196619",
        "#194C19",
        "#193319",
        "#191919",
        "#66FF66",
        "#66E666",
        "#66CC66",
        "#66B366",
        "#669966",
        "#668066",
        "#666666",
        "#4CFF4C",
        "#4CE64C",
        "#4CCC4C",
        "#4CB34C"
    ],
    zen: [
        "#B9B99D",
        "#E0CFC3",
        "#DFCA99",
        "#DCB482",
        "#C09E85",
        "#8F837A",
        "#858480",
        "#B0B9A8",
        "#606C5A",
        "#5E5E5E",
        "#4F5B75",
        "#647393",
        "#818EA9",
        "#9FA9BE",
        "#BBC4D3",
        "#DCDFE7",
        "#928A98",
        "#8A9892",
        "#B1A7AD",
        "#C5B8A7",
        "#EBD6CC",
        "#D7E0D2",
        "#E0D2D7",
        "#E0DBD2",
        "#D2E0DB",
        "#DBD2E0",
        "#C1B7A5",
        "#A5AFC1",
        "#E0DBD2",
        "#D2D7E0",
        "#F7EDE2",
        "#97ACB7",
        "#C4CBBC",
        "#C3C5C5",
        "#A0AC94"
    ]
};

export const opacity = ["00", "03", "05", "08", "0A", "0D", "0F", "12", "14", "17", "1A", "1C", "1F", "21", "24", "26", "29", "2B", "2E", "30", "33", "36", "38", "3B", "3D", "40", "42", "45", "47", "4A", "4D", "4F", "52", "54", "57", "59", "5C", "5E", "61", "63", "66", "69", "6B", "6E", "70", "73", "75", "78", "7A", "7D", "80", "82", "85", "87", "8A", "8C", "8F", "91", "94", "96", "99", "9C", "9E", "A1", "A3", "A6", "A8", "AB", "AD", "B0", "B3", "B5", "B8", "BA", "BD", "BF", "C2", "C4", "C7", "C9", "CC", "CF", "D1", "D4", "D6", "D9", "DB", "DE", "E0", "E3", "E6", "E8", "EB", "ED", "F0", "F2", "F5", "F7", "FA", "FC", "FF"];

export function convertColorToHex(color) {
    const hexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    const rgbRegex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/i;
    const hslRegex = /^hsla?\((\d+),\s*([\d.]+)%,\s*([\d.]+)%(?:,\s*[\d.]+)?\)$/i;

    if ([undefined, null, NaN].includes(color)) {
        return null;
    }
    color = convertNameColorToHex(color)

    if (color === 'transparent') {
        return "#FFFFFF00";
    }

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

export function shiftHue(hexColor, shiftAmount) {

    const hexToRgb = (hex) => ({
        r: parseInt(hex.substring(1, 3), 16),
        g: parseInt(hex.substring(3, 5), 16),
        b: parseInt(hex.substring(5, 7), 16),
    });

    const rgbToHsl = ({ r, g, b }) => {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h, s, l };
    };

    const hslToRgb = ({ h, s, l }) => {
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
        };
    };

    const rgbColor = hexToRgb(hexColor || "#000000");
    const hslColor = rgbToHsl(rgbColor);
    hslColor.h += shiftAmount;
    hslColor.h = (hslColor.h + 1) % 1;

    const shiftedRgbColor = hslToRgb(hslColor);
    const shiftedHexColor = `#${(shiftedRgbColor.r << 16 | shiftedRgbColor.g << 8 | shiftedRgbColor.b).toString(16).padStart(6, '0')}`;

    return shiftedHexColor;
}

export function calcPolygonPoints({
    centerX,
    centerY,
    outerPoints,
    radius,
    rotation
}) {
    const angle = Math.PI / outerPoints;
    const angleOffsetToCenter = rotation;
    let points = "";
    const coordinates = [];
    for (let i = 0; i < outerPoints * 2; i += 1) {
        let currX = centerX + Math.cos(i * angle + angleOffsetToCenter) * radius;
        let currY = centerY + Math.sin(i * angle + angleOffsetToCenter) * radius;
        points += `${currX},${currY} `;
        coordinates.push({ x: currX, y: currY });
    }
    return {
        path: `M${points}Z`,
        coordinates
    };
}

export function createPolygonPath({
    plot,
    radius,
    sides,
    rotation = 0
}) {
    const centerX = plot.x;
    const centerY = plot.y;
    const outerPoints = sides / 2;
    return calcPolygonPoints({
        centerX,
        centerY,
        outerPoints,
        radius: radius + 1,
        rotation
    });
}

export function calcStarPoints({
    centerX,
    centerY,
    innerCirclePoints,
    innerRadius,
    outerRadius
}) {
    const angle = Math.PI / innerCirclePoints;
    const angleOffsetToCenterStar = 60;
    const totalPoints = innerCirclePoints * 2;
    let points = "";
    for (let i = 0; i < totalPoints; i += 1) {
        let isEvenIndex = i % 2 == 0;
        let r = isEvenIndex ? outerRadius : innerRadius;
        let currX = centerX + Math.cos(i * angle + angleOffsetToCenterStar) * r;
        let currY = centerY + Math.sin(i * angle + angleOffsetToCenterStar) * r;
        points += `${currX},${currY} `;
    }
    return points;
}

export function createStar({
    plot,
    radius,
    apexes = 5
}) {
    const centerX = plot.x;
    const centerY = plot.y;
    const innerCirclePoints = apexes;
    const innerRadius = (radius * 3.5) / innerCirclePoints;
    const innerOuterRadiusRatio = 2;
    const outerRadius = innerRadius * innerOuterRadiusRatio;
    return calcStarPoints({
        centerX,
        centerY,
        innerCirclePoints,
        innerRadius,
        outerRadius
    })
}

export function giftWrap({ series }) {
    series = series.sort((a, b) => a.x - b.x);
    function polarAngle(a, b, c) {
        const x = (a.x - b.x) * (c.x - b.x) + (a.y - b.y) * (c.y - b.y);
        const y = (a.x - b.x) * (c.y - b.y) - (c.x - b.x) * (a.y - b.y);
        return Math.atan2(y, x);
    }
    const perimeter = [];
    let currentPoint;
    currentPoint = series[0];
    for (const p of series) {
        if (p.x < currentPoint.x) {
            currentPoint = p;
        }
    }
    perimeter[0] = currentPoint;
    let endpoint, secondlast;
    let minAngle, newEnd;
    endpoint = perimeter[0];
    secondlast = { x: endpoint.x, y: endpoint.y + 1 };
    do {
        minAngle = Math.PI;
        for (const p of series) {
            currentPoint = polarAngle(secondlast, endpoint, p);
            if (currentPoint <= minAngle) {
                newEnd = p;
                minAngle = currentPoint;
            }
        }
        if (newEnd !== perimeter[0]) {
            perimeter.push(newEnd);
            secondlast = endpoint;
            endpoint = newEnd;
        }
    } while (newEnd !== perimeter[0]);
    let result;
    perimeter.forEach((res) => {
        if (res && res.x && res.y) {
            result += `${Math.round(res.x)},${Math.round(res.y)} `;
        }
    });
    result = result.replaceAll("undefined", "");
    return result;
}

export function degreesToRadians(degrees) {
    return (degrees * Math.PI) / 180;
}

export function adaptColorToBackground(bgColor) {
    if (bgColor) {
        let color = bgColor;
        if (color.charAt(0) !== "#") {
            color = this.rgbToHex(bgColor);
        }
        color = color.substring(1, 7);
        let r = parseInt(color.substring(0, 2), 16);
        let g = parseInt(color.substring(2, 4), 16);
        let b = parseInt(color.substring(4, 6), 16);
        let uiColors = [r / 255, g / 255, b / 255];
        let c = uiColors.map((col) => {
            if (col <= 0.03928) {
                return col / 12.92;
            }
            return Math.pow((col + 0.055) / 1.055, 2.4);
        });
        let L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
        return L > 0.3 ? "#000000" : "#FFFFFF";
    }
    return "#000000";
}

export function convertConfigColors(config) {
    for (const key in config) {
        if (typeof config[key] === 'object' && !Array.isArray(config[key]) && config[key] !== null) {
            convertConfigColors(config[key]);
        } else if (key === 'color' || key === 'backgroundColor' || key === 'stroke') {
            if (config[key] === '') {
                config[key] = '#000000';
            } else if (config[key] === 'transparent') {
                config[key] = '#FFFFFF00'
            } else {
                config[key] = convertColorToHex(config[key]);
            }
        }
    }
    return config;
}

export function calcLinearProgression(plots) {
    let x1, y1, x2, y2;
    const len = plots.length;

    if (!plots || plots.length === 0) {
        return {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            slope: 0,
            trend: 0
        }
    }

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    for (const { x, y } of plots) {
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
    }
    const slope = (len * sumXY - sumX * sumY) / (len * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / len;
    x1 = plots[0].x;
    x2 = plots[len - 1].x;
    y1 = slope * x1 + intercept;
    y2 = slope * x2 + intercept;

    const trend = calcPercentageTrend(plots.map(p => p.value));

    return { x1, y1, x2, y2, slope, trend };
}

export function calcPercentageTrend(arr) {
    const initialNumber = arr[0];
    const lastNumber = arr[arr.length - 1];
    const overallChange = lastNumber - initialNumber;

    let totalMagnitude = 0;

    for (let i = 1; i < arr.length; i++) {
        const difference = Math.abs(arr[i] - arr[i - 1]);
        totalMagnitude += difference;
    }

    const percentageTrend = (overallChange / totalMagnitude);
    return isNaN(percentageTrend) ? 0 : percentageTrend;
}

export function calcMedian(arr) {
    const mid = Math.floor(arr.length / 2);
    const nums = [...arr].sort((a, b) => a - b);
    return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

export function createStraightPath(points) {
    let arr = [];
    for (let i = 0; i < points.length; i += 1) {
        arr.push(`${checkNaN(points[i].x)},${checkNaN(points[i].y)} `)
    }
    return arr.join(' ').trim()
}

export function createSmoothPath(points, smoothing = 0.2) {
    function line(pointA, pointB) {
        const lengthX = pointB.x - pointA.x;
        const lengthY = pointB.y - pointA.y;
        return {
            length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
            angle: Math.atan2(lengthY, lengthX)
        };
    }
    function controlPoint(current, previous, next, reverse) {
        const p = previous || current;
        const n = next || current;
        const o = line(p, n);

        const angle = o.angle + (reverse ? Math.PI : 0);
        const length = o.length * smoothing;

        const x = current.x + Math.cos(angle) * length;
        const y = current.y + Math.sin(angle) * length;
        return { x, y };
    }
    function bezierCommand(point, i, a) {
        const cps = controlPoint(a[i - 1], a[i - 2], point);
        const cpe = controlPoint(point, a[i - 1], a[i + 1], true);
        return `C ${checkNaN(cps.x)},${checkNaN(cps.y)} ${checkNaN(cpe.x)},${checkNaN(cpe.y)} ${checkNaN(point.x)},${checkNaN(point.y)}`;
    }
    const d = points.filter(p => !!p).reduce((acc, point, i, a) => i === 0
        ? `${checkNaN(point.x)},${checkNaN(point.y)} `
        : `${acc} ${bezierCommand(point, i, a)} `
        , '');

    return d;
}

export function createUid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
        .replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
}

export function calcMarkerOffsetX(arc, isTitle = false, offset = 16, useCss = false) {
    let x = 0;
    let offsetX = isTitle ? offset : 0;
    let anchor = useCss ? 'center' : "middle";
    if (arc.center.endX > arc.cx) {
        x = arc.center.endX + offset + offsetX;
        anchor = useCss ? 'left' : "start";
    } else if (arc.center.endX < arc.cx) {
        x = arc.center.endX - offset - offsetX;
        anchor = useCss ? 'right' : "end";
    } else {
        x = arc.centerX + offsetX;
        anchor = useCss ? 'center' : "middle";
    }
    return { x, anchor }
}

export function calcMarkerOffsetY(arc, yOffsetTop = 16, yOffsetBottom = 16) {
    if (arc.center.endY > arc.cy) {
        return arc.center.endY + yOffsetBottom;
    } else if (arc.center.endY < arc.cy) {
        return arc.center.endY - yOffsetTop;
    } else {
        return arc.center.endY;
    }
}

export function offsetFromCenterPoint({
    initX,
    initY,
    offset,
    centerX,
    centerY
}) {
    const angle = Math.atan2(initY - centerY, initX - centerX);
    return {
        x: initX + offset * Math.cos(angle),
        y: initY + offset * Math.sin(angle)
    }
}

export function findArcMidpoint(pathElement) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", 'path')
    el.setAttribute('d', pathElement)

    const length = el.getTotalLength();
    let start = 0;
    let end = length;
    let midpointParameter = length / 2;

    const epsilon = 0.01;
    while (end - start > epsilon) {
        const mid = (start + end) / 2;
        const midPoint = el.getPointAtLength(mid);
        const midLength = midPoint.x;

        if (Math.abs(midLength - midpointParameter) < epsilon) {
            midpointParameter = mid;
            break;
        } else if (midLength < midpointParameter) {
            start = mid;
        } else {
            end = mid;
        }
    }
    const { x, y } = el.getPointAtLength(midpointParameter);
    return { x, y };
}

export function calcNutArrowPath(arc, center = false, yOffsetTop = 16, yOffsetBottom = 16, toCenter = false, hideStart = false, arcSize = 0, flatLen = 12) {
    const { x, y } = findArcMidpoint(arc.path)

    const { x: endX, y: endY } = offsetFromCenterPoint({
        initX: x,
        initY: y,
        offset: arcSize,
        centerX: center ? center.x : 0,
        centerY: center ? center.y : 0
    })

    const start = `${calcMarkerOffsetX(arc).x},${calcMarkerOffsetY(arc, yOffsetTop, yOffsetBottom) - 4} `;
    const end = ` ${center ? center.x : endX},${center ? center.y : endY}`;
    let mid = "";
    if (x > arc.cx) {
        mid = `${calcMarkerOffsetX(arc).x - flatLen},${calcMarkerOffsetY(arc, yOffsetTop, yOffsetBottom) - 4}`;
    } else if (x < arc.cx) {
        mid = `${calcMarkerOffsetX(arc).x + flatLen},${calcMarkerOffsetY(arc, yOffsetTop, yOffsetBottom) - 4}`;
    } else {
        mid = `${calcMarkerOffsetX(arc).x + flatLen},${calcMarkerOffsetY(arc, yOffsetTop, yOffsetBottom) - 4}`;
    }
    return `M${hideStart ? '' : start}${mid}${end}${toCenter ? `,${toCenter.x} ${toCenter.y}` : ''}`;
}

export function closestDecimal(num) {
    if (num === 0) return 0;
    const orderOfMagnitude = Math.floor(Math.log10(Math.abs(num)));
    const powerOf10 = 10 ** orderOfMagnitude;
    let roundedValue;
    if (num < 0) {
        roundedValue = Math.round(num / powerOf10) * powerOf10;
    } else {
        roundedValue = Math.round(num / powerOf10) * powerOf10;
    }
    return roundedValue;
}

export function canShowValue(num) {
    return ![null, undefined, NaN].includes(num);
}

export function sumByAttribute(arr, attr) {
    return [...arr].map(a => a[attr]).reduce((a, b) => a + b, 0)
}

export function makePath(plots, closed = true, bare = false) {
    if (!plots.length) return "M0,0";
    let path = "";
    plots.forEach(plot => {
        if (!plot) return '';
        path += `${plot.x},${plot.y} `;
    })
    if (bare) {
        return path.trim();
    } else {
        return `M${path}${closed ? 'Z' : ''}`;
    }
}

export function downloadCsv({ csvContent, title = "vue-data-ui" }) {
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(encodedUri);
}

/**
 * 
 * @param {string[][]} rows
 * @returns 
 */
export function createCsvContent(rows) {
    return `data:text/csv;charset=utf-8,${rows.map(r => r.join(',')).join('\n')}`;
}

export function lightenHexColor(hexColor, percentLighter) {
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(hexColor)) {
        console.warn('lightenHexColor : Invalid hex color format');
        return "#000000"
    }

    let color = hexColor.replace('#', '');
    if (color.length === 3) {
        color = color.split('').map(c => c + c).join('');
    }

    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    const newR = Math.min(255, r + (255 - r) * percentLighter);
    const newG = Math.min(255, g + (255 - g) * percentLighter);
    const newB = Math.min(255, b + (255 - b) * percentLighter);

    const lighterHex = `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;

    return lighterHex;
}

export function darkenHexColor(hexColor, percentDarker) {
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(hexColor)) {
        console.warn('darkenHexColor: Invalid hex color format');
        return "#000000";
    }

    let color = hexColor.replace('#', '');
    if (color.length === 3) {
        color = color.split('').map(c => c + c).join('');
    }

    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    const newR = Math.max(0, r - r * percentDarker);
    const newG = Math.max(0, g - g * percentDarker);
    const newB = Math.max(0, b - b * percentDarker);

    const darkerHex = `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;

    return darkerHex;
}


export function niceNum(range, round) {
    const exponent = Math.floor(Math.log10(range));
    const fraction = range / Math.pow(10, exponent);
    let niceFraction;

    if (round) {
        if (fraction < 1.5) {
            niceFraction = 1;
        } else if (fraction < 3) {
            niceFraction = 2;
        } else if (fraction < 7) {
            niceFraction = 5;
        } else {
            niceFraction = 10;
        }
    } else {
        if (fraction <= 1) {
            niceFraction = 1;
        } else if (fraction <= 2) {
            niceFraction = 2;
        } else if (fraction <= 5) {
            niceFraction = 5;
        } else {
            niceFraction = 10;
        }
    }

    return niceFraction * Math.pow(10, exponent);
}

export function calculateNiceScale(minValue, maxValue, maxTicks, rough = false) {
    const range = rough ? (maxValue - minValue) : niceNum(maxValue - minValue, false);
    const tickSpacing = rough ? (range / (maxTicks - 1)) : niceNum(range / (maxTicks - 1), true);
    const niceMin = Math.floor(minValue / tickSpacing) * tickSpacing;
    const niceMax = Math.ceil(maxValue / tickSpacing) * tickSpacing;

    const ticks = [];
    for (let tick = niceMin; tick <= niceMax; tick += tickSpacing) {
        ticks.push(tick);
    }

    return {
        min: niceMin,
        max: niceMax,
        tickSize: tickSpacing,
        ticks
    };
}

export function calculateNiceScaleWithExactExtremes(minValue, maxValue, maxTicks, rough = false) {
    const range = rough ? (maxValue - minValue) : niceNum(maxValue - minValue, false);
    const tickSpacing = rough ? (range / (maxTicks - 1)) : niceNum(range / (maxTicks - 1), true);
    const niceMin = Math.floor(minValue / tickSpacing) * tickSpacing;
    const niceMax = Math.ceil(maxValue / tickSpacing) * tickSpacing;
    let ticks = [];
    let tick = niceMin;

    while (tick <= niceMax) {
        if (tick >= minValue && tick <= maxValue) {
            ticks.push(tick);
        }
        tick += tickSpacing;
    }

    if (ticks[0] !== minValue) ticks[0] = minValue;
    if (ticks[ticks.length - 1] !== maxValue) ticks[ticks.length - 1] = maxValue;

    return {
        min: minValue,
        max: maxValue,
        tickSize: tickSpacing,
        ticks
    };
}
export function interpolateColorHex(minColor, maxColor, minValue, maxValue, value) {
    const hexToRgb = (hex) => ({
        r: parseInt(hex.substring(1, 3), 16),
        g: parseInt(hex.substring(3, 5), 16),
        b: parseInt(hex.substring(5, 7), 16),
    });

    const rgbToHex = ({ r, g, b }) => {
        return `#${decimalToHex(r)}${decimalToHex(g)}${decimalToHex(b)}`;
    };

    const rgbToHsl = ({ r, g, b }) => {
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return { h, s, l };
    };

    const hslToRgb = ({ h, s, l }) => {
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255),
        };
    };

    const minRgbColor = hexToRgb(minColor);
    const maxRgbColor = hexToRgb(maxColor);

    value = Math.min(Math.max(value, minValue), maxValue);

    const normalizedValue = (value - minValue) / (maxValue - minValue);

    const interpolatedRgbColor = {
        r: Math.round(minRgbColor.r + (maxRgbColor.r - minRgbColor.r) * normalizedValue),
        g: Math.round(minRgbColor.g + (maxRgbColor.g - minRgbColor.g) * normalizedValue),
        b: Math.round(minRgbColor.b + (maxRgbColor.b - minRgbColor.b) * normalizedValue),
    };

    const interpolatedHslColor = rgbToHsl(interpolatedRgbColor);
    const finalRgbColor = hslToRgb(interpolatedHslColor);
    const finalHexColor = rgbToHex(finalRgbColor);

    return finalHexColor;
}

/**
 * @typedef DataLabel
 * @type {object}
 * @property {string=} p - prefix
 * @property {(number|string)} v - value
 * @property {string=} s - suffix
 * @property {number=} r - rounding
 * @property {boolean=} space  - space between elements
 * @property {boolean=} isAnimating
 * @property {RegExp=} regex - replacements when isAnimating is true
 * @property {string=} replacement - the replacement for regex result when isAnimating is true
 * @property {locale=} locale - the region code
 * @type {DataLabel}
 */
export function dataLabel({ p = '', v, s = '', r = 0, space = false, isAnimating = false, regex = /[^%]/g, replacement = '-', locale = null }) {
    const num = locale ?
        Number(Number(v).toFixed(r)).toLocaleString(locale) :
        Number(Number(v).toFixed(r)).toLocaleString();
    const numStr = num === Infinity ? '∞' : num === -Infinity ? '-∞' : num;
    const result = `${p ?? ''}${space ? ' ' : ''}${[undefined, null].includes(v) ? '-' : numStr}${space ? ' ' : ''}${s ?? ''}`
    return isAnimating ? result.replace(regex, replacement) : result
}

/**
 * @typedef Abbreviation
 * @type {object}
 * @property {(number|string)} source - The string to abbreviate
 * @property {number=} length - The size of the abbreviation
 * @type {Abbreviation}
 */
export function abbreviate({ source, length = 3 }) {
    if (!source && source !== 0) {
        return ''
    }
    source = String(source);
    const sourceSplit = source.length > 1 ? source.split(' ') : [source];
    if (sourceSplit.length === 1 && sourceSplit[0].length === 1) {
        return String(source).toUpperCase()
    }
    if (sourceSplit.length === 1) {
        return source.slice(0, length).toUpperCase()
    } else {
        const result = [];
        sourceSplit.forEach((chunk, i) => {
            if (i < length) {
                result.push(chunk.slice(0, 1))
            }
        })
        return result.join().replaceAll(',', '').toUpperCase();
    }
}

export function isFunction(func) {
    return !!func && typeof func === 'function';
}

export function functionReturnsString(func) {
    return typeof func.apply(null, arguments) === 'string';
}

export function objectIsEmpty(obj) {
    if (Array.isArray(obj)) {
        return obj.length === 0
    }
    return Object.keys(obj).length === 0
}

export function error({ componentName, type, property = '', index = '', key = '', warn = true }) {
    const message = `\n> ${errors[type].replace('#COMP#', componentName).replace('#ATTR#', property).replace('#INDX#', index).replace('#KEY#', key)}\n`;
    if (warn) {
        console.warn(message)
    } else {
        throw new Error(message)
    }
}

export function generateSpiralCoordinates({ points, a, b, angleStep, startX, startY }) {
    const coordinates = [];

    for (let i = 0; i < points; i++) {
        const theta = angleStep * i;
        const r = a + b * theta;
        const x = r * Math.cos(theta) + startX;
        const y = r * Math.sin(theta) + startY;
        coordinates.push({ x, y });
    }

    return coordinates;
}

export function createSpiralPath({ points, a, b, angleStep, startX, startY }) {
    const coordinates = generateSpiralCoordinates({ points, a: a || 6, b: b || 6, angleStep: angleStep || 0.07, startX, startY });
    let path = `M${coordinates[0].x} ${coordinates[0].y}`;

    for (let i = 1; i < coordinates.length - 2; i += 2) {
        const p0 = coordinates[i - 1];
        const p1 = coordinates[i];
        const p2 = coordinates[i + 1];
        const p3 = coordinates[i + 2];

        const xc1 = (p0.x + p1.x) / 2;
        const yc1 = (p0.y + p1.y) / 2;
        const xc2 = (p1.x + p2.x) / 2;
        const yc2 = (p1.y + p2.y) / 2;
        const xc3 = (p2.x + p3.x) / 2;
        const yc3 = (p2.y + p3.y) / 2;

        path += ` C${xc1} ${yc1}, ${xc2} ${yc2}, ${xc3} ${yc3}`;
    }
    return path;
}

export function calculateDistance(point1, point2) {
    return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
}

export function areCirclesOverlapping(circle1, circle2, threshold) {
    const distance = Math.sqrt((circle2.x - circle1.x) ** 2 + (circle2.y - circle1.y) ** 2);
    return distance < threshold;
}

export function calculateAverageDistance(points) {
    if (points.length < 2) return 0;

    let totalDistance = 0;
    let count = 0;

    for (let i = 0; i < points.length; i += 1) {
        for (let j = i + 1; j < points.length; j += 1) {
            totalDistance += calculateDistance(points[i], points[j]);
            count += 1;
        }
    }
    return totalDistance / count;
}

export function mergePointsByProximity(points, threshold = 0.15) {
    const clusters = [];
    const visited = new Array(points.length).fill(false);

    points.forEach((point, index) => {
        if (!visited[index]) {
            const cluster = [];
            const stack = [point];
            visited[index] = true;

            while (stack.length > 0) {
                const currentPoint = stack.pop();
                cluster.push(currentPoint);
                points.forEach((otherPoint, otherIndex) => {
                    if (!visited[otherIndex] && areCirclesOverlapping(currentPoint, otherPoint, threshold)) {
                        stack.push(otherPoint);
                        visited[otherIndex] = true;
                    }
                });
            }

            clusters.push(cluster);
        }
    });

    const result = clusters.map(cluster => {
        const averageX = cluster.reduce((acc, p) => acc + p.x, 0) / cluster.length;
        const averageY = cluster.reduce((acc, p) => acc + p.y, 0) / cluster.length;
        return { x: averageX, y: averageY };
    });

    return result
}

export function getMissingDatasetAttributes({ datasetObject, requiredAttributes }) {
    let errors = [];
    requiredAttributes.forEach(attribute => {
        if (!Object.hasOwn(datasetObject, attribute)) {
            errors.push(attribute);
        }
    });
    return errors;
}

export function convertNameColorToHex(colorName) {
    const colorMap = {
        ALICEBLUE: "#F0F8FF",
        ANTIQUEWHITE: "#FAEBD7",
        AQUA: "#00FFFF",
        AQUAMARINE: "#7FFFD4",
        AZURE: "#F0FFFF",
        BEIGE: "#F5F5DC",
        BISQUE: "#FFE4C4",
        BLACK: "#000000",
        BLANCHEDALMOND: "#FFEBCD",
        BLUE: "#0000FF",
        BLUEVIOLET: "#8A2BE2",
        BROWN: "#A52A2A",
        BURLYWOOD: "#DEB887",
        CADETBLUE: "#5F9EA0",
        CHARTREUSE: "#7FFF00",
        CHOCOLATE: "#D2691E",
        CORAL: "#FF7F50",
        CORNFLOWERBLUE: "#6495ED",
        CORNSILK: "#FFF8DC",
        CRIMSON: "#DC143C",
        CYAN: "#00FFFF",
        DARKBLUE: "#00008B",
        DARKCYAN: "#008B8B",
        DARKGOLDENROD: "#B8860B",
        DARKGREY: "#A9A9A9",
        DARKGREEN: "#006400",
        DARKKHAKI: "#BDB76B",
        DARKMAGENTA: "#8B008B",
        DARKOLIVEGREEN: "#556B2F",
        DARKORANGE: "#FF8C00",
        DARKORCHID: "#9932CC",
        DARKRED: "#8B0000",
        DARKSALMON: "#E9967A",
        DARKSEAGREEN: "#8FBC8F",
        DARKSLATEBLUE: "#483D8B",
        DARKSLATEGREY: "#2F4F4F",
        DARKTURQUOISE: "#00CED1",
        DARKVIOLET: "#9400D3",
        DEEPPINK: "#FF1493",
        DEEPSKYBLUE: "#00BFFF",
        DIMGRAY: "#696969",
        DODGERBLUE: "#1E90FF",
        FIREBRICK: "#B22222",
        FLORALWHITE: "#FFFAF0",
        FORESTGREEN: "#228B22",
        FUCHSIA: "#FF00FF",
        GAINSBORO: "#DCDCDC",
        GHOSTWHITE: "#F8F8FF",
        GOLD: "#FFD700",
        GOLDENROD: "#DAA520",
        GREY: "#808080",
        GREEN: "#008000",
        GREENYELLOW: "#ADFF2F",
        HONEYDEW: "#F0FFF0",
        HOTPINK: "#FF69B4",
        INDIANRED: "#CD5C5C",
        INDIGO: "#4B0082",
        IVORY: "#FFFFF0",
        KHAKI: "#F0E68C",
        LAVENDER: "#E6E6FA",
        LAVENDERBLUSH: "#FFF0F5",
        LAWNGREEN: "#7CFC00",
        LEMONCHIFFON: "#FFFACD",
        LIGHTBLUE: "#ADD8E6",
        LIGHTCORAL: "#F08080",
        LIGHTCYAN: "#E0FFFF",
        LIGHTGOLDENRODYELLOW: "#FAFAD2",
        LIGHTGREY: "#D3D3D3",
        LIGHTGREEN: "#90EE90",
        LIGHTPINK: "#FFB6C1",
        LIGHTSALMON: "#FFA07A",
        LIGHTSEAGREEN: "#20B2AA",
        LIGHTSKYBLUE: "#87CEFA",
        LIGHTSLATEGREY: "#778899",
        LIGHTSTEELBLUE: "#B0C4DE",
        LIGHTYELLOW: "#FFFFE0",
        LIME: "#00FF00",
        LIMEGREEN: "#32CD32",
        LINEN: "#FAF0E6",
        MAGENTA: "#FF00FF",
        MAROON: "#800000",
        MEDIUMAQUAMARINE: "#66CDAA",
        MEDIUMBLUE: "#0000CD",
        MEDIUMORCHID: "#BA55D3",
        MEDIUMPURPLE: "#9370D8",
        MEDIUMSEAGREEN: "#3CB371",
        MEDIUMSLATEBLUE: "#7B68EE",
        MEDIUMSPRINGGREEN: "#00FA9A",
        MEDIUMTURQUOISE: "#48D1CC",
        MEDIUMVIOLETRED: "#C71585",
        MIDNIGHTBLUE: "#191970",
        MINTCREAM: "#F5FFFA",
        MISTYROSE: "#FFE4E1",
        MOCCASIN: "#FFE4B5",
        NAVAJOWHITE: "#FFDEAD",
        NAVY: "#000080",
        OLDLACE: "#FDF5E6",
        OLIVE: "#808000",
        OLIVEDRAB: "#6B8E23",
        ORANGE: "#FFA500",
        ORANGERED: "#FF4500",
        ORCHID: "#DA70D6",
        PALEGOLDENROD: "#EEE8AA",
        PALEGREEN: "#98FB98",
        PALETURQUOISE: "#AFEEEE",
        PALEVIOLETRED: "#D87093",
        PAPAYAWHIP: "#FFEFD5",
        PEACHPUFF: "#FFDAB9",
        PERU: "#CD853F",
        PINK: "#FFC0CB",
        PLUM: "#DDA0DD",
        POWDERBLUE: "#B0E0E6",
        PURPLE: "#800080",
        RED: "#FF0000",
        ROSYBROWN: "#BC8F8F",
        ROYALBLUE: "#4169E1",
        SADDLEBROWN: "#8B4513",
        SALMON: "#FA8072",
        SANDYBROWN: "#F4A460",
        SEAGREEN: "#2E8B57",
        SEASHELL: "#FFF5EE",
        SIENNA: "#A0522D",
        SILVER: "#C0C0C0",
        SKYBLUE: "#87CEEB",
        SLATEBLUE: "#6A5ACD",
        SLATEGREY: "#708090",
        SNOW: "#FFFAFA",
        SPRINGGREEN: "#00FF7F",
        STEELBLUE: "#4682B4",
        TAN: "#D2B48C",
        TEAL: "#008080",
        THISTLE: "#D8BFD8",
        TOMATO: "#FF6347",
        TURQUOISE: "#40E0D0",
        VIOLET: "#EE82EE",
        WHEAT: "#F5DEB3",
        WHITE: "#FFFFFF",
        WHITESMOKE: "#F5F5F5",
        YELLOW: "#FFFF00",
        YELLOWGREEN: "#9ACD32",
    };
    return colorMap[colorName.toUpperCase()] || colorName;
}

export const XMLNS = "http://www.w3.org/2000/svg";

export function calcTrend(numbers) {
    if (numbers.length < 2) {
        return 0;
    }

    let totalPercentageChange = 0;
    let pairsCount = 0;

    for (let i = 1; i < numbers.length; i++) {
        const initial = numbers[i - 1];
        const final = numbers[i];

        if ([null, undefined, 0, Infinity, -Infinity].includes(initial)) {
            continue;
        }

        const percentageChange = ((final - initial) / Math.abs(initial)) * 100;
        totalPercentageChange += percentageChange;
        pairsCount++;
    }

    if (pairsCount === 0) {
        return 0;
    }

    const averagePercentageChange = totalPercentageChange / pairsCount;

    return averagePercentageChange;
}

export function createTSpans({
    content,
    fontSize,
    fill,
    maxWords,
    x,
    y
}) {
    function chunk(text, len) {
        const words = text.split(" ");
        const chunks = [];

        for (let i = 0; i < words.length; i += len) {
            chunks.push(words.slice(i, i + len).join(" "));
        }

        return chunks;
    }
    let tspans = "";
    const chunks = chunk(content, maxWords);

    chunks.forEach((c, i) => {
        const tspan = `<tspan x="${x}" y="${y + (i * fontSize)}" fill="${fill}">${c}</tspan>`;
        tspans += tspan
    });

    return tspans;
}

export function convertCustomPalette(colors) {
    if (!colors.length) {
        return []
    }
    return colors.map(c => convertColorToHex(c))
}

/**
 * Creates a dataset suitable for a word cloud from a plain text input.
 * This function processes the text by removing punctuation, splitting into words,
 * and counting the occurrences of each word. It also allows for a callback function
 * to modify each word before it's included in the final dataset.
 * 
 * @param {string} text - The plain text input to process. The function will remove 
 *                        punctuation, handle CJK characters appropriately, and count 
 *                        word frequencies.
 * 
 * @param {function(string): string} [callback=null] - An optional callback function
 *                                                     to transform each word. The function 
 *                                                     takes a word as input and returns 
 *                                                     a transformed word. If provided,
 *                                                     the callback should return a string.
 * 
 * @returns {Array<Object>} A dataset for a word cloud, where each object contains:
 *  - `name` (string): The word or its transformed version (if a callback is provided).
 *  - `value` (number): The frequency of the word in the input text.
 * 
 * @example
 * // Basic usage without a callback
 * const text = "Hello world! Hello everyone.";
 * const dataset = createWordCloudDatasetFromPlainText(text);
 * console.log(dataset);
 * // Output: [ { name: 'Hello', value: 2 }, { name: 'world', value: 1 }, { name: 'everyone', value: 1 } ]
 * 
 * @example
 * // Using a callback to convert words to uppercase
 * const text = "Hello world! Hello everyone.";
 * const dataset = createWordCloudDatasetFromPlainText(text, word => word.toUpperCase());
 * console.log(dataset);
 * // Output: [ { name: 'HELLO', value: 2 }, { name: 'WORLD', value: 1 }, { name: 'EVERYONE', value: 1 } ]
 * 
 * @example
 * // Handling CJK text
 * const text = "你好，世界！你好，大家！";
 * const dataset = createWordCloudDatasetFromPlainText(text);
 * console.log(dataset);
 * // Output: [ { name: '你', value: 2 }, { name: '好', value: 2 }, { name: '世', value: 1 }, { name: '界', value: 1 }, { name: '大', value: 1 }, { name: '家', value: 1 } ]
 * 
 */
export function createWordCloudDatasetFromPlainText(text, callback = null) {
    const textWithoutPunctuation = text.replace(/[\p{P}\p{S}]+/gu, ' ').trim();

    const isCJK = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Tibetan}\p{Script=Myanmar}\p{Script=Devanagari}]/u.test(text);

    const words = isCJK
        ? [...textWithoutPunctuation]
        : textWithoutPunctuation.split(/\s+/);

    const filteredWords = words.filter(word => word.trim().length > 0);

    const wordCountMap = filteredWords.reduce((map, word) => {
        if (map[word]) {
            map[word] += 1;
        } else {
            map[word] = 1;
        }
        return map;
    }, {});

    return Object.keys(wordCountMap).map(word => {
        let w = word;

        if (typeof callback === 'function' && typeof callback(word) === 'string') {
            w = callback(word)
        }

        return {
            name: w,
            value: wordCountMap[word],
        }
    });
}

export function assignStackRatios(arr) {
    let providedRatioSum = arr.reduce((sum, item) => sum + (item.stackRatio || 0), 0);
    let itemsWithoutRatio = arr.filter(item => item.stackRatio === undefined).length;
    let remainingRatio = 1 - providedRatioSum;
    let defaultRatio = itemsWithoutRatio > 0 ? remainingRatio / itemsWithoutRatio : 0;

    let output = arr.map(item => ({
        ...item,
        stackRatio: item.stackRatio !== undefined ? item.stackRatio : defaultRatio
    }));

    let cumulatedRatio = 0;
    output = output.map(item => {
        cumulatedRatio += item.stackRatio;
        return {
            ...item,
            cumulatedStackRatio: cumulatedRatio
        };
    });
    return output;
}

export function getPathLengthFromCoordinates(d) {
    function distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function bezierLength(p0, p1, p2, p3) {
        const steps = 100;
        let length = 0;
        let prevX = p0.x;
        let prevY = p0.y;

        for (let i = 1; i <= steps; i += 1) {
            const t = i / steps;
            const oneMinusT = 1 - t;
            const oneMinusTSquared = oneMinusT * oneMinusT;
            const tSquared = t * t;

            const x = oneMinusTSquared * oneMinusT * p0.x +
                3 * oneMinusTSquared * t * p1.x +
                3 * oneMinusT * tSquared * p2.x +
                tSquared * t * p3.x;
            const y = oneMinusTSquared * oneMinusT * p0.y +
                3 * oneMinusTSquared * t * p1.y +
                3 * oneMinusT * tSquared * p2.y +
                tSquared * t * p3.y;
            length += distance(prevX, prevY, x, y);
            prevX = x;
            prevY = y;
        }

        return length;
    }

    const commands = d.match(/[a-zA-Z][^a-zA-Z]*/g);
    let currentX = 0, currentY = 0;
    let startX = 0, startY = 0;
    let totalLength = 0;

    commands.forEach(command => {
        const type = command[0];
        const values = command.slice(1).trim().split(/[\s,]+/).map(Number);
        let i = 0;

        switch (type) {
            case 'M':
                currentX = values[i++];
                currentY = values[i++];
                startX = currentX;
                startY = currentY;
                while (i < values.length) {
                    totalLength += distance(currentX, currentY, values[i], values[i + 1]);
                    currentX = values[i++];
                    currentY = values[i++];
                }
                break;

            case 'L':
                while (i < values.length) {
                    totalLength += distance(currentX, currentY, values[i], values[i + 1]);
                    currentX = values[i++];
                    currentY = values[i++];
                }
                break;

            case 'H':
                while (i < values.length) {
                    totalLength += distance(currentX, currentY, values[i], currentY);
                    currentX = values[i++];
                }
                break;

            case 'V':
                while (i < values.length) {
                    totalLength += distance(currentX, currentY, currentX, values[i]);
                    currentY = values[i++];
                }
                break;

            case 'C':
                while (i < values.length) {
                    totalLength += bezierLength(
                        { x: currentX, y: currentY },
                        { x: values[i], y: values[i + 1] },
                        { x: values[i + 2], y: values[i + 3] },
                        { x: values[i + 4], y: values[i + 5] }
                    );
                    currentX = values[i + 4];
                    currentY = values[i + 5];
                    i += 6;
                }
                break;

            case 'Z':
                totalLength += distance(currentX, currentY, startX, startY);
                currentX = startX;
                currentY = startY;
                break;
        }
    });

    return totalLength;
}

export function translateSize({
    relator,
    adjuster,
    source,
    threshold = 0,
    fallback,
    max = 24
}) {
    const computedVal = relator / (adjuster / source);

    if (computedVal > max) {
        return max
    }

    return computedVal < threshold
        ? fallback
        : computedVal;
}

export function sumSeries(source) {
    return source.reduce((acc, obj) => {
        obj.series.forEach((num, i) => {
            if (![undefined, null, Infinity, -Infinity].includes(num) && !isNaN(num)) {
                acc[i] = (acc[i] || 0) + num;
            }
        });
        return acc;
    }, []);
}

export function checkFormatter(func, { value, config }) {
    let isValid = false;
    let formattedValue = value;

    if (typeof func === 'function') {
        try {
            // Ensure that the function is called with an object containing `value` and `config`
            formattedValue = func({ value, config });

            if (['number', 'string'].includes(typeof formattedValue)) {
                isValid = true;
            } else {
                formattedValue = value;
            }
        } catch (err) {
            console.warn('Formatter could not be applied:', err);
            isValid = false;
        }
    }

    return {
        isValid,
        value: formattedValue
    };
}

export function applyDataLabel(func, data, fallbackValue, config) {
    const { isValid, value } = checkFormatter(func, { value: data, config });
    return isValid ? value : fallbackValue;
}

export function hasDeepProperty(obj, path) {
    return path.split('.').every(key => {
        if (obj !== null && typeof obj === 'object' && key in obj) {
            obj = obj[key];
            return true;
        }
        return false;
    });
}

export function sanitizeArray(arr, keys = []) {

    function sanitizeValue(value) {
        if([NaN, undefined, Infinity, -Infinity, null].includes(value)) {
            console.warn(`A non processable value was detected : ${value}`)
        }
        return (typeof value === 'number' && isFinite(value)) ? value : 0;
    }

    function sanitize(data) {
        if (Array.isArray(data)) { 
            return data.map(item => sanitize(item));
        } else if (typeof data === 'object' && data !== null) {

            let sanitizedObject = { ...data };
            keys.forEach(key => {
                if (sanitizedObject.hasOwnProperty(key) && ![
                    'NAME', 
                    'name', 
                    'TITLE', 
                    'title', 
                    'DESCRIPTION', 
                    'description', 
                    'LABEL', 
                    'label', 
                    'TIME', 
                    'time',
                    'PERIOD',
                    'period',
                    'MONTH',
                    'month',
                    'YEAR',
                    'year',
                    'MONTHS',
                    'months',
                    'YEARS',
                    'years',
                    'DAY',
                    'day',
                    'DAYS',
                    'days',
                    'HOUR',
                    'hour',
                    'HOURS',
                    'hours'
                ].includes(key) && Array.isArray(sanitizedObject[key])) {
                    sanitizedObject[key] = sanitize(sanitizedObject[key]);
                }
            });
            return Object.fromEntries(
                Object.entries(sanitizedObject).map(([k, v]) => [k, sanitize(v)])
            );
        } else {
            return sanitizeValue(data);
        }
    }

    return sanitize(arr);
}

const lib = {
    XMLNS,
    abbreviate,
    adaptColorToBackground,
    addVector,
    applyDataLabel,
    assignStackRatios,
    calcLinearProgression,
    calcMarkerOffsetX,
    calcMarkerOffsetY,
    calcMedian,
    calcNutArrowPath,
    calcTrend,
    calculateNiceScale,
    calculateNiceScaleWithExactExtremes,
    canShowValue,
    checkArray,
    checkFormatter,
    checkNaN,
    checkObj,
    closestDecimal,
    convertColorToHex,
    convertConfigColors,
    convertCustomPalette,
    createCsvContent,
    createPolygonPath,
    createSmoothPath,
    createSpiralPath,
    createStar,
    createStraightPath,
    createTSpans,
    createUid,
    createWordCloudDatasetFromPlainText,
    darkenHexColor,
    dataLabel,
    degreesToRadians,
    downloadCsv,
    error,
    functionReturnsString,
    generateSpiralCoordinates,
    getMissingDatasetAttributes,
    getPalette,
    giftWrap,
    hasDeepProperty,
    interpolateColorHex,
    isFunction,
    isSafeValue,
    isValidUserValue,
    lightenHexColor,
    makeDonut,
    makePath,
    matrixTimes,
    mergePointsByProximity,
    objectIsEmpty,
    opacity,
    palette,
    rotateMatrix,
    sanitizeArray,
    shiftHue,
    sumByAttribute,
    sumSeries,
    themePalettes,
    translateSize,
    treeShake,
};
export default lib;