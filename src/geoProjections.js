/**
 * Vue Data UI - Map Utility - geoProjections.js
 * 
 * This module provides a collection of map projection functions and utility helpers for converting geographic
 * coordinates (longitude and latitude) into 2D (x, y) points for SVG or canvas-based world maps and globe visualizations.
 * 
 * - Each projection function receives: [longitude, latitude], target width/height, and optional center coordinates.
 * - Returns [x, y] canvas/SVG coordinates suitable for the given projection and display area.
 * - Includes a getProjectedBounds function for determining the bounding box of a set of geographic features
 *   when projected to a particular projection, which helps set up the SVG viewBox for map rendering.
 * 
 * Supported projections:
 * - Mercator, Equirectangular, Robinson, Mollweide, Winkel Tripel, Aitoff, Hammer, Bonne, Sinusoidal,
 *   Gall-Peters, van der Grinten, Globe (orthographic-style), Azimuthal Equidistant.
 * 
 * Utility:
 * - geoToPath: Converts a GeoJSON geometry object to an SVG path string using a selected projection.
 * - getProjectedBounds: Calculates the overall 2D bounds of a set of GeoJSON features after projection.
 * 
 * Example usage:
 *     import geo from './geoProjections';
 *     const [x, y] = geo.projections.mercator([lon, lat], width, height, [centerLon, centerLat]);
 *     const bounds = geo.getProjectedBounds(geo.projections.mercator, features, width, height, [0, 0]);
 */
const projections = {
    mercator([lon, lat], width, height, center) {
        const maxLat = 85.05113;
        const displayMinLat = -72; // To crop Antarctica
        const displayMaxLat = maxLat;
        lat = Math.max(Math.min(lat, maxLat), -maxLat);
        const [lon0, _lat0] = center;
        const λ = ((lon - lon0) * Math.PI) / 180;
        const x = (width / (2 * Math.PI)) * (λ + Math.PI);
        const mercatorY = lat => Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2));
        const yMin = mercatorY(displayMaxLat);
        const yMax = mercatorY(displayMinLat);
        const yMerc = mercatorY(lat);
        const y = ((yMerc - yMin) / (yMax - yMin)) * height;
        return [x, y];
    },
    equirectangular([lon, lat], width, height, center) {
        const latMin = -80; // To crop Antarctica
        const latMax = 90;
        const [lon0, lat0] = center;
        lat = Math.max(Math.min(lat, latMax), latMin);
        const x = ((lon - lon0 + 180) / 360) * width;
        const y = ((latMax - (lat - lat0)) / (latMax - latMin)) * height;
        return [x, y];
    },
    robinson([lon, lat], width, height, center) {
        const robinsonTable = [
            [1.0000, 0.0000], [0.9986, 0.0620], [0.9954, 0.1240], [0.9900, 0.1860],
            [0.9822, 0.2480], [0.9730, 0.3100], [0.9600, 0.3720], [0.9427, 0.4340],
            [0.9216, 0.4958], [0.8962, 0.5571], [0.8679, 0.6176], [0.8350, 0.6769],
            [0.7986, 0.7346], [0.7597, 0.7903], [0.7186, 0.8435], [0.6732, 0.8936],
            [0.6213, 0.9394], [0.5722, 0.9761], [0.5322, 1.0000]
        ];
        const [lon0, _lat0] = center;
        lon = lon - lon0;
        lat = Math.max(-89.9999, Math.min(89.9999, lat));
        const absLat = Math.abs(lat);
        const index = Math.floor(absLat / 5);
        const frac = (absLat % 5) / 5;
        const [A0, B0] = robinsonTable[index];
        const [A1, B1] = robinsonTable[Math.min(index + 1, robinsonTable.length - 1)];
        const xCoef = A0 + (A1 - A0) * frac;
        const yCoef = B0 + (B1 - B0) * frac;
        const λ = (lon * Math.PI) / 180;
        const x = width / 2 + (width / 2) * xCoef * λ / (Math.PI); // normalize so world fits width
        const y = height / 2 - Math.sign(lat) * (height / 2) * yCoef / 1.0;  // scale Y so full world fits height
        if (!Number.isFinite(x) || !Number.isFinite(y)) return [-9999, -9999];
        return [x, y];
    },
    mollweide([lon, lat], width, height, center) {
        lat = Math.max(Math.min(lat, 89.9999), -89.9999);
        const [lon0] = center;
        const λ = ((lon - lon0) * Math.PI) / 180;
        const φ = lat * Math.PI / 180;
        let theta = φ;
        const epsilon = 1e-10;
        let delta = 1;
        let i = 0;
        while (Math.abs(delta) > epsilon && i < 10) {
            delta = -(2 * theta + Math.sin(2 * theta) - Math.PI * Math.sin(φ)) / (2 + 2 * Math.cos(2 * theta));
            theta += delta;
            i++;
        }
        if (!isFinite(theta)) theta = φ > 0 ? Math.PI / 2 : -Math.PI / 2;
        const R = width / (2 * Math.SQRT2);
        const xRaw = R * (2 * Math.SQRT2 / Math.PI) * λ * Math.cos(theta);
        const x = ((xRaw + 2 * R) / (4.6 * R)) * width;
        const yRaw = -R * Math.SQRT2 * Math.sin(theta);
        const yMin = -R * Math.SQRT2; // bottom
        const yMax = R * Math.SQRT2;  // top
        const y = ((yRaw - yMin) / (yMax - yMin)) * height;

        return [
            isFinite(x) ? x : 0,
            isFinite(y) ? y : 0
        ];
    },
    winkelTripel([lon, lat], width, height, center) {
        const [lon0, _lat0] = center;
        const λ = ((lon - lon0) * Math.PI) / 180;
        const φ = (lat * Math.PI) / 180;
        const x1 = λ * Math.cos(Math.PI / 6);
        const y1 = φ;
        const alpha = Math.acos(Math.cos(φ) * Math.cos(λ / 2));
        const x2 = 2 * Math.cos(φ) * Math.sin(λ / 2) / (Math.sin(alpha) / alpha || 1);
        const y2 = Math.sin(φ) / (Math.sin(alpha) / alpha || 1);
        const x = width / 2 + width / (2 * Math.PI) * (x1 + x2) / 2;
        const y = height / 2 - height / (2 * Math.PI) * (y1 + y2) / 2;
        return [x, y];
    },
    aitoff([lon, lat], width, height, center) {
        if (!Math.sinc) {
            Math.sinc = function(x) {
                return x === 0 ? 1 : Math.sin(Math.PI * x) / (Math.PI * x);
            };
        }
        const [lon0, _lat0] = center;
        const λ = ((lon - lon0) * Math.PI) / 180;
        const φ = (lat * Math.PI) / 180;
        const alpha = Math.acos(Math.cos(φ) * Math.cos(λ / 2));
        let x = 0, y = 0;
        if (alpha !== 0) {
            x = 2 * Math.cos(φ) * Math.sin(λ / 2) / Math.sinc(alpha / Math.PI);
            y = Math.sin(φ) / Math.sinc(alpha / Math.PI);
        }
        x = width / 2 + x * (width / (2 * 2));
        y = height / 2 - y * (height / (2 * 1));
        return [x, y];
    },
    hammer([lon, lat], width, height, center) {
        const [lon0, _lat0] = center;
        const λ = ((lon - lon0) * Math.PI) / 180;
        const φ = (lat * Math.PI) / 180;
        const denom = Math.sqrt(1 + Math.cos(φ) * Math.cos(λ / 2));
        const x = width / 2 + width / 2 * (2 * Math.SQRT2 * Math.cos(φ) * Math.sin(λ / 2) / denom) / 2.8284271247461903;
        const y = height / 2 - height / 2 * (Math.SQRT2 * Math.sin(φ) / denom) / 1.4142135623730951;
        return [x, y];
    },
    bonne([lon, lat], width, height, center = [0,0]) {
        const φ = 45 * Math.PI / 180;
        const [lon0, _lat0] = center;
        const λ = (lon - lon0) * Math.PI / 180;
        const clampLat = Math.max(Math.min(lat, 89.9), -89.9);
        const φClamped = clampLat * Math.PI / 180;
        const cotφ = 1 / Math.tan(φ);
        const rho = cotφ + φ - φClamped;
        const E = rho === 0 ? 0 : (λ * Math.cos(φClamped)) / rho;
        const scale = Math.min(width, height) / 2.6;
        const x = width / 2 + scale * rho * Math.sin(E);
        const y = height / 2 - scale * (cotφ - rho * Math.cos(E));
        return [x, y];
    },
    sinusoidal([lon, lat], width, height, center) {
        const [lon0, _lat0] = center;
        const λ = ((lon - lon0) * Math.PI) / 180;
        const φ = (lat * Math.PI) / 180;
        const x = width / 2 + (width / (2 * Math.PI)) * λ * Math.cos(φ);
        const y = height / 2 - (height / Math.PI) * φ;
        return [x, y];
    },
    gallPeters([lon, lat], width, height, center) {
        const [lon0, _lat0] = center;
        // Clamp latitude
        lat = Math.max(Math.min(lat, 89.9999), -89.9999);
        const x = ((lon - lon0 + 180) / 360) * width;
        const y = height / 2 - (height / Math.PI) * Math.sin((lat * Math.PI) / 180);
        return [x, y];
    },
    vanDerGrinten([lon, lat], width, height, center = [0, 0]) {
        const pi = Math.PI, halfPi = Math.PI / 2, epsilon = 1e-6;
        let λ = ((lon - (center[0] || 0)) * pi) / 180;
        let φ = ((lat - (center[1] || 0)) * pi) / 180;

        let absλ = Math.abs(λ), absφ = Math.abs(φ);
        let x, y;

        if (absφ < epsilon) {
            x = λ;
            y = 0;
        } else if (absλ < epsilon || Math.abs(absφ - halfPi) < epsilon) {
            x = 0;
            y = Math.sign(φ) * pi * Math.tan(Math.asin(absφ / halfPi) / 2);
        } else {
            let sinTheta = absφ / halfPi;
            let theta = Math.asin(sinTheta);
            let cosTheta = Math.cos(theta);
            let A = 0.5 * (Math.abs(pi / λ - λ / pi));
            let A2 = A * A;
            let G = cosTheta / (sinTheta + cosTheta - 1);
            let P = G * (2 / sinTheta - 1);
            let P2 = P * P, P2_A2 = P2 + A2, G_P2 = G - P2, Q = A2 + G;
            x = Math.sign(λ) * pi * (A * G_P2 + Math.sqrt(Math.max(0, A2 * G_P2 * G_P2 - P2_A2 * (G * G - P2)))) / P2_A2;
            y = Math.sign(φ) * pi * (P * Q - A * Math.sqrt(Math.max(0, (A2 + 1) * P2_A2 - Q * Q))) / P2_A2;
        }
        const scale = (width/2) / pi * 0.98;
        const cx = width / 2, cy = height / 2;
        return [cx + x * scale, cy - y * scale];
    },
    globe([lon, lat], width, height, center) {
        const [lon0, lat0] = center;
        const λ = ((lon - lon0) * Math.PI) / 180;
        const φ = (lat * Math.PI) / 180;
        const φ0 = (lat0 * Math.PI) / 180;
        const R = Math.min(width, height) / 2 * 0.95;
        const cx = width / 2;
        const cy = height / 2;
        const x = R * Math.cos(φ) * Math.sin(λ) + cx;
        const y = -R * (Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(λ)) + cy;

        if (Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(λ) < 0) {
            return [NaN, NaN];
        }

        return [x, y];
    },
    azimuthalEquidistant([lon, lat], width, height, center = [0, 0]) {
        const toRad = d => d * Math.PI / 180;
        const [lon0, lat0] = center;
        const λ = toRad(lon - lon0);
        const φ = toRad(lat);
        const φ0 = toRad(lat0);
        const cos_c = Math.sin(φ0) * Math.sin(φ) + Math.cos(φ0) * Math.cos(φ) * Math.cos(λ);
        const c = Math.acos(Math.max(-1, Math.min(1, cos_c)));
        let k = c === 0 ? 1 : c / Math.sin(c);
        const xProj = k * Math.cos(φ) * Math.sin(λ);
        const yProj = k * (Math.cos(φ0) * Math.sin(φ) - Math.sin(φ0) * Math.cos(φ) * Math.cos(λ));
        const scale = (Math.min(width, height) / 2) / Math.PI;
        const cx = width / 2, cy = height / 2;
        return [
            cx + xProj * scale,
            cy - yProj * scale
        ];
    },
};

function geoToPath(geometry) {
    const drawPoly = coords =>
        coords.map(
            ring => {
                const pts = ring.map(([lon, lat]) => project([lon, lat]));
                const validPts = pts.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
                if (validPts.length < 3) return '';
                return 'M' + validPts.map(([x, y]) => `${x},${y}`).join('L') + 'Z';
            }
        ).filter(Boolean).join(' ');
    if (geometry.type === 'Polygon') return drawPoly(geometry.coordinates);
    if (geometry.type === 'MultiPolygon')
        return geometry.coordinates.map(drawPoly).join(' ');
    return '';
}

function getProjectedBounds(projection, features, width, height, center = [0,0]) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const feature of features) {
        const geom = feature.geometry;
        const coordsArr = geom.type === 'Polygon'
            ? [geom.coordinates]
            : (geom.type === 'MultiPolygon' ? geom.coordinates : []);
        for (const coords of coordsArr) {
            for (const ring of coords) {
                for (const [lon, lat] of ring) {
                    const [x, y] = projection([lon, lat], width, height, center);
                    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }
    }
    return {
        minX: Math.floor(minX) - 10,
        minY: Math.floor(minY) - 10,
        width: Math.ceil(maxX - minX) + 20,
        height: Math.ceil(maxY - minY) + 20
    }
}


const geo = {
    projections,
    getProjectedBounds,
}

export default geo