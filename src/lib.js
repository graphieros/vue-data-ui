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
        )

        ratios.push({
            arcSlice: `${path} L ${inner.startX} ${inner.startY} ${inner.path} L ${startX} ${startY}`,
            cx,
            cy,
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
        startX: reverse ? eX : sX,
        startY: reverse ? eY : sY,
        endX: reverse ? sX : eX,
        endY: reverse ? sY : eY,
        path: `M${reverse ? eX : sX} ${reverse ? eY : sY} A ${[
            rx,
            ry,
            (phi / (piMult * Math.PI)) * degrees,
            fA,
            fS,
            reverse ? sX : eX,
            reverse ? sY : eY,
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

export const opacity = ["00", "03", "05", "08", "0A", "0D", "0F", "12", "14", "17", "1A", "1C", "1F", "21", "24", "26", "29", "2B", "2E", "30", "33", "36", "38", "3B", "3D", "40", "42", "45", "47", "4A", "4D", "4F", "52", "54", "57", "59", "5C", "5E", "61", "63", "66", "69", "6B", "6E", "70", "73", "75", "78", "7A", "7D", "80", "82", "85", "87", "8A", "8C", "8F", "91", "94", "96", "99", "9C", "9E", "A1", "A3", "A6", "A8", "AB", "AD", "B0", "B3", "B5", "B8", "BA", "BD", "BF", "C2", "C4", "C7", "C9", "CC", "CF", "D1", "D4", "D6", "D9", "DB", "DE", "E0", "E3", "E6", "E8", "EB", "ED", "F0", "F2", "F5", "F7", "FA", "FC", "FF"];

export function convertColorToHex(color) {
    const hexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    const rgbRegex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/i;
    const hslRegex = /^hsla?\((\d+),\s*([\d.]+)%,\s*([\d.]+)%(?:,\s*[\d.]+)?\)$/i;

    if ([undefined, null, NaN].includes(color)) {
        return null;
    }

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

    const rgbColor = hexToRgb(hexColor);
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

export function createSmoothPath(points) {
    const smoothing = 0.2;
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
        return `C ${cps.x},${cps.y} ${cpe.x},${cpe.y} ${point.x},${point.y}`;
    }
    const d = points.reduce((acc, point, i, a) => i === 0
        ? `${point.x},${point.y} `
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

export function calcMarkerOffsetX(arc, isTitle = false, offset = 16) {
    let x = 0;
    let offsetX = isTitle ? offset : 0;
    let anchor = "middle";
    if (arc.center.endX > arc.cx) {
        x = arc.center.endX + offset + offsetX;
        anchor = "start";
    } else if (arc.center.endX < arc.cx) {
        x = arc.center.endX - offset - offsetX;
        anchor = "end";
    } else {
        x = arc.centerX + offsetX;
        anchor = "middle";
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

export function makePath(plots, closed = true) {
    let path = "";
    plots.forEach(plot => {
        path += `${plot.x},${plot.y} `
    })
    return `M${path}${closed ? 'Z' : ''}`;
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

export function calculateNiceScale(minValue, maxValue, maxTicks) {
    const range = niceNum(maxValue - minValue, false);
    const tickSpacing = niceNum(range / (maxTicks - 1), true);
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
 * @type {DataLabel}
 */
export function dataLabel({ p = '', v, s = '', r = 0, space = false }) {
    return `${p ?? ''}${space ? ' ' : ''}${[undefined, null].includes(v) ? '-' : Number(Number(v).toFixed(r).toLocaleString())}${space ? ' ' : ''}${s ?? ''}`
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
        const r = a + b * theta; // i * 0.007 for gradual slope increase, should be a var
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

const lib = {
    abbreviate,
    adaptColorToBackground,
    addVector,
    calcLinearProgression,
    calcMarkerOffsetX,
    calcMarkerOffsetY,
    calcMedian,
    calcNutArrowPath,
    canShowValue,
    checkArray,
    checkNaN,
    checkObj,
    closestDecimal,
    convertColorToHex,
    convertConfigColors,
    createCsvContent,
    createPolygonPath,
    createSmoothPath,
    createSpiralPath,
    createStar,
    createUid,
    darkenHexColor,
    dataLabel,
    degreesToRadians,
    degreesToRadians,
    downloadCsv,
    error,
    generateSpiralCoordinates,
    giftWrap,
    interpolateColorHex,
    isFunction,
    isSafeValue,
    isValidUserValue,
    functionReturnsString,
    lightenHexColor,
    makeDonut,
    makePath,
    matrixTimes,
    mergePointsByProximity,
    objectIsEmpty,
    opacity,
    palette,
    rotateMatrix,
    shiftHue,
    sumByAttribute,
    treeShake,
};
export default lib;