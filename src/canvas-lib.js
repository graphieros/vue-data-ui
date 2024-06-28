/**
 * Draw a circle on a canvas.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {Object} center - The center coordinates of the circle.
 * @param {number} center.x - The x-coordinate of the circle's center.
 * @param {number} center.y - The y-coordinate of the circle's center.
 * @param {number} radius - The radius of the circle.
 * @param {Object} [options] - Optional drawing options.
 * @param {string} [options.color] - Stroke color for the circle.
 * @param {number} [options.lineWidth] - Width of the circle's stroke.
 * @param {string} [options.lineCap] - Line cap style.
 * @param {string} [options.lineJoin] - Line join style.
 * @param {Array} [options.lineDash] - Line dash pattern.
 * @param {number} [options.lineDashoffset] - Line dash offset.
 * @param {string} [options.shadowColor] - Shadow color.
 * @param {number} [options.shadowBlur] - Shadow blur level.
 * @param {number} [options.shadowOffsetX] - Shadow offset x-coordinate.
 * @param {number} [options.shadowOffsetY] - Shadow offset y-coordinate.
 */
export function circle(ctx, center, radius, options = {}) {
    if (radius <= 0) return;
    ctx.save();

    const { 
        color = 'black', 
        lineWidth = 1, 
        lineCap = 'round', 
        lineJoin = 'round',
        lineDash = null,
        lineDashoffset = 0,
        shadowColor = null,
        shadowBlur = 0,
        shadowOffsetX = 0,
        shadowOffsetY = 0
    } = options;

    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = lineCap;
    ctx.lineJoin = lineJoin;

    if(lineDash) {
        ctx.setLineDash(lineDash);
        ctx.lineDashoffset = lineDashoffset;
    }

    if (shadowColor) {
        ctx.shadowColor = shadowColor;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;
    }

    if (shadowBlur) {
        ctx.shadowBlur = shadowBlur;
    }

    ctx.stroke();
    ctx.restore();
}

/**
 * Draw line(s) on a canvas.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {Array} coordinates - Array of coordinates for the polygon vertices.
 *                                Example: [{x: 10, y: 10}, {x: 100, y: 100}, {x: 150, y: 50}]
 * @param {Object} [options] - Optional drawing options.
 * @param {string} [options.color] - Stroke color for the circle.
 * @param {number} [options.lineWidth] - Width of the circle's stroke.
 * @param {string} [options.lineCap] - Line cap style.
 * @param {string} [options.lineJoin] - Line join style.
 * @param {Array} [options.lineDash] - Line dash pattern.
 * @param {number} [options.lineDashoffset] - Line dash offset.
 * @param {string} [options.shadowColor] - Shadow color.
 * @param {number} [options.shadowBlur] - Shadow blur level.
 * @param {number} [options.shadowOffsetX] - Shadow offset x-coordinate.
 * @param {number} [options.shadowOffsetY] - Shadow offset y-coordinate.
 */
export function line(ctx, coordinates, options = {}) {
    if (!coordinates.length) return;
    ctx.save();

    const { 
        color = 'black', 
        lineWidth = 1, 
        lineCap = 'round', 
        lineJoin = 'round',
        lineDash = null,
        lineDashoffset = 0,
        shadowColor = null,
        shadowBlur = 0,
        shadowOffsetX = 0,
        shadowOffsetY = 0
    } = options;

    ctx.beginPath();
    ctx.moveTo(coordinates[0].x, coordinates[0].y);

    for (let i = 1; i < coordinates.length; i += 1) {
        ctx.lineTo(coordinates[i].x, coordinates[i].y);
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = lineCap;
    ctx.lineJoin = lineJoin;

    if(lineDash) {
        ctx.setLineDash(lineDash)
        ctx.lineDashoffset = lineDashoffset;
    }

    if (shadowColor) {
        ctx.shadowColor = shadowColor;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;
    }

    if (shadowBlur) {
        ctx.shadowBlur = shadowBlur;
    }

    ctx.stroke();
    ctx.restore();
}

/**
 * Draw a polygon on a canvas.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {Array} coordinates - Array of coordinates for the polygon vertices.
 *                                Example: [{x: 10, y: 10}, {x: 100, y: 100}, {x: 150, y: 50}]
 * @param {Object} [options] - Optional drawing options.
 * @param {string} [options.strokeColor] - Stroke color for the polygon.
 * @param {number} [options.lineWidth] - Width of the polygon's stroke.
 * @param {string} [options.lineCap] - Line cap style.
 * @param {string} [options.lineJoin] - Line join style.
 * @param {Array} [options.lineDash] - Line dash pattern.
 * @param {number} [options.lineDashoffset] - Line dash offset.
 * @param {string} [options.fillColor] - Fill color for the polygon.
 * @param {Object} [options.gradient] - Gradient options for the fill.
 * @param {string} [options.gradient.type] - Type of gradient ('linear' or 'radial').
 * @param {Object} [options.gradient.start] - Start point for the gradient.
 * @param {number} [options.gradient.start.x] - Start x-coordinate.
 * @param {number} [options.gradient.start.y] - Start y-coordinate.
 * @param {Object} [options.gradient.end] - End point for the gradient.
 * @param {number} [options.gradient.end.x] - End x-coordinate.
 * @param {number} [options.gradient.end.y] - End y-coordinate.
 * @param {Array} [options.gradient.stops] - Array of gradient stops (color and offset).
 * @param {string} [options.shadowColor] - Shadow color.
 * @param {number} [options.shadowBlur] - Shadow blur level.
 * @param {number} [options.shadowOffsetX] - Shadow offset x-coordinate.
 * @param {number} [options.shadowOffsetY] - Shadow offset y-coordinate.
 */
export function polygon(ctx, coordinates, options = {}) {
    if (!coordinates.length) return;
    ctx.save();

    const {
        strokeColor = 'black',
        lineWidth = 1,
        lineCap = 'round',
        lineJoin = 'round',
        lineDash = null,
        lineDashoffset = 0,
        fillColor = null,
        gradient = null,
        shadowColor = null,
        shadowBlur = 0,
        shadowOffsetX = 0,
        shadowOffsetY = 0
    } = options;

    ctx.beginPath();
    ctx.moveTo(coordinates[0].x, coordinates[0].y);

    for (let i = 1; i < coordinates.length; i += 1) {
        ctx.lineTo(coordinates[i].x, coordinates[i].y);
    }
    ctx.closePath();

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = lineCap;
    ctx.lineJoin = lineJoin;

    if (lineDash) {
        ctx.setLineDash(lineDash);
        ctx.lineDashoffset = lineDashoffset;
    }

    if (shadowColor) {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;
    }

    if (gradient) {
        let grd;
        if (gradient.type === 'linear') {
            grd = ctx.createLinearGradient(
                gradient.start.x,
                gradient.start.y,
                gradient.end.x,
                gradient.end.y
            );
        } else if (gradient.type === 'radial') {
            grd = ctx.createRadialGradient(
                gradient.start.x,
                gradient.start.y,
                gradient.start.r || 0,
                gradient.end.x,
                gradient.end.y,
                gradient.end.r || 0
            );
        }

        if (grd && gradient.stops) {
            gradient.stops.forEach(stop => {
                grd.addColorStop(stop.offset, stop.color);
            });
            ctx.fillStyle = grd;
        }
    } else if (fillColor) {
        ctx.fillStyle = fillColor;
    }

    if (ctx.fillStyle) ctx.fill();
    if (strokeColor) ctx.stroke();

    ctx.restore();
}

/**
 * Draw a rect on a canvas.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {Array} coordinates - Array of coordinates for the polygon vertices.
 *                                Example: [{x: 10, y: 10}, {x: 100, y: 100}, {x: 150, y: 50}]
 * @param {Object} [options] - Optional drawing options.
 * @param {string} [options.strokeColor] - Stroke color for the polygon.
 * @param {number} [options.lineWidth] - Width of the polygon's stroke.
 * @param {string} [options.lineCap] - Line cap style.
 * @param {string} [options.lineJoin] - Line join style.
 * @param {Array} [options.lineDash] - Line dash pattern.
 * @param {number} [options.lineDashoffset] - Line dash offset.
 * @param {string} [options.fillColor] - Fill color for the polygon.
 * @param {Object} [options.gradient] - Gradient options for the fill.
 * @param {string} [options.gradient.type] - Type of gradient ('linear' or 'radial').
 * @param {Object} [options.gradient.start] - Start point for the gradient.
 * @param {number} [options.gradient.start.x] - Start x-coordinate.
 * @param {number} [options.gradient.start.y] - Start y-coordinate.
 * @param {Object} [options.gradient.end] - End point for the gradient.
 * @param {number} [options.gradient.end.x] - End x-coordinate.
 * @param {number} [options.gradient.end.y] - End y-coordinate.
 * @param {Array} [options.gradient.stops] - Array of gradient stops (color and offset).
 * @param {string} [options.shadowColor] - Shadow color.
 * @param {number} [options.shadowBlur] - Shadow blur level.
 * @param {number} [options.shadowOffsetX] - Shadow offset x-coordinate.
 * @param {number} [options.shadowOffsetY] - Shadow offset y-coordinate.
 */
export function rect(ctx, coordinates, options = {}) {
    if (!coordinates.length) return;
    ctx.save();

    const {
        strokeColor = 'black',
        lineWidth = 1,
        lineCap = 'round',
        lineJoin = 'round',
        lineDash = null,
        lineDashoffset = 0,
        fillColor = null,
        gradient = null,
        shadowColor = null,
        shadowBlur = 0,
        shadowOffsetX = 0,
        shadowOffsetY = 0
    } = options;

    ctx.beginPath();
    ctx.moveTo(coordinates[0].x, coordinates[0].y);

    for (let i = 1; i < coordinates.length; i += 1) {
        ctx.lineTo(coordinates[i].x, coordinates[i].y);
    }
    ctx.closePath();

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = lineCap;
    ctx.lineJoin = lineJoin;

    if (lineDash) {
        ctx.setLineDash(lineDash);
        ctx.lineDashoffset = lineDashoffset;
    }

    if (shadowColor) {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;
    }

    if (gradient) {
        let grd;
        if (gradient.type === 'linear') {
            grd = ctx.createLinearGradient(
                gradient.start.x,
                gradient.start.y,
                gradient.end.x,
                gradient.end.y
            );
        } else if (gradient.type === 'radial') {
            grd = ctx.createRadialGradient(
                gradient.start.x,
                gradient.start.y,
                gradient.start.r || 0,
                gradient.end.x,
                gradient.end.y,
                gradient.end.r || 0
            );
        }

        if (grd && gradient.stops) {
            gradient.stops.forEach(stop => {
                grd.addColorStop(stop.offset, stop.color);
            });
            ctx.fillStyle = grd;
        }
    } else if (fillColor) {
        ctx.fillStyle = fillColor;
    }

    if (ctx.fillStyle) ctx.fill();
    if (strokeColor) ctx.stroke();

    ctx.restore();
}

/**
 * Draw text on a canvas.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @param {string} text - The text string to draw.
 * @param {number} x - The x-coordinate to start drawing the text.
 * @param {number} y - The y-coordinate to start drawing the text.
 * @param {Object} [options] - Optional drawing options.
 * @param {string} [options.font] - Font style for the text. Default: '16px sans-serif'.
 * @param {string} [options.color] - Color for the text. Default: 'black'.
 * @param {string} [options.align] - Text alignment ('left', 'right', 'center', 'start', 'end'). Default: 'start'.
 * @param {string} [options.baseline] - Text baseline ('top', 'hanging', 'middle', 'alphabetic', 'ideographic', 'bottom'). Default: 'alphabetic'.
 * @param {number} [options.maxWidth] - Maximum width of the text. Default: undefined.
 * @param {number} [options.rotation] - Rotation angle (in degrees). Default: 0.
 * @param {string} [options.shadowColor] - Shadow color. Default: null.
 * @param {number} [options.shadowBlur] - Shadow blur level. Default: 0.
 * @param {number} [options.shadowOffsetX] - Shadow offset x-coordinate. Default: 0.
 * @param {number} [options.shadowOffsetY] - Shadow offset y-coordinate. Default: 0.
 * @param {string} [options.strokeColor] - Color for the text stroke. Default: null.
 * @param {number} [options.lineWidth] - Line width for the text stroke. Default: 1.
 */
export function text(ctx, text, x, y, options = {}) {
    ctx.save();

    const {
        font = '16px sans-serif',
        color = 'black',
        align = 'start',
        baseline = 'alphabetic',
        maxWidth = undefined,
        rotation = 0,
        shadowColor = null,
        shadowBlur = 0,
        shadowOffsetX = 0,
        shadowOffsetY = 0,
        strokeColor = null,
        lineWidth = 1
    } = options;

    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = baseline;

    if (shadowColor) {
        ctx.shadowColor = shadowColor;
        ctx.shadowBlur = shadowBlur;
        ctx.shadowOffsetX = shadowOffsetX;
        ctx.shadowOffsetY = shadowOffsetY;
    }

    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
    }

    if (rotation !== 0) {
        ctx.translate(x, y);
        ctx.rotate((Math.PI / 180) * rotation);
        ctx.translate(-x, -y);
    }

    ctx.fillText(text, x, y, maxWidth);

    if (strokeColor) {
        ctx.strokeText(text, x, y, maxWidth);
    }

    ctx.restore();
}

const lib = {
    circle,
    line,
    polygon,
    rect,
    text
}

export default lib