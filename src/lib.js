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

export const opacity = ["00","03","05","08","0A","0D","0F","12","14","17","1A","1C","1F","21","24","26","29","2B","2E","30","33","36","38","3B","3D","40","42","45","47","4A","4D","4F","52","54","57","59","5C","5E","61","63","66","69","6B","6E","70","73","75","78","7A","7D","80","82","85","87","8A","8C","8F","91","94","96","99","9C","9E","A1","A3","A6","A8","AB","AD","B0","B3","B5","B8","BA","BD","BF","C2","C4","C7","C9","CC","CF","D1","D4","D6","D9","DB","DE","E0","E3","E6","E8","EB","ED","F0","F2","F5","F7","FA","FC","FF"];

export function convertColorToHex(color) {
    const hexRegex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
    const rgbRegex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/i;
    const hslRegex = /^hsla?\((\d+),\s*([\d.]+)%,\s*([\d.]+)%(?:,\s*[\d.]+)?\)$/i;

    if([undefined, null, NaN].includes(color)) {
        return null;
    }

    if(color === 'transparent') {
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
    radius
}) {
    const centerX = plot.x;
    const centerY = plot.y;
    const innerCirclePoints = 5;
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
        if(color.charAt(0) !== "#"){
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
        if(config[key] === '') {
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

const lib = {
    addVector,
    checkNaN,
    convertColorToHex,
    createPolygonPath,
    createStar,
    degreesToRadians,
    giftWrap,
    isSafeValue,
    isValidUserValue,
    makeDonut,
    matrixTimes,
    opacity,
    palette,
    rotateMatrix,
    shiftHue,
    treeShake,
    adaptColorToBackground,
    convertConfigColors,
};
export default lib;