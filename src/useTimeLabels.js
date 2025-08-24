import { useDateTime } from "./useDateTime";
import locales from "./locales/locales.json";

const SECONDS_IN_DAY = 24 * 60 * 60;

/**
 * @param {Array<string|number>} values
 * @param {number} maxDatapoints
 * @param {{ enable:boolean, useUTC:boolean, locale:string, januaryAsYear:boolean, options:Record<string,string> }} formatter
 * @param {number} start  // start index (provided by Slicer)
 * @param {number} end    // end index (provided by Slicer)
 */
export function useTimeLabels({
    values,
    maxDatapoints,
    formatter: xl,
    start: sliceStart,
    end: sliceEnd
}) {
    const out = [];
    if (!xl.enable || values.length === 0) {
        for (let i = sliceStart; i < sliceEnd; i++) {
            out.push({ text: String(values[i] ?? i), absoluteIndex: i });
        }
        return out;
    }

    const window = values.slice(sliceStart, sliceEnd);
    if (window.length === 0) return [];
    const minX = window[0], maxX = window[window.length - 1];
    const dt = useDateTime({
        useUTC: xl.useUTC,
        min: minX,
        max: maxX,
        locale: locales[xl.locale],
        januaryAsYear: xl.januaryAsYear,
    });

    const rangeMS = maxX - minX;
    const daysDiff = rangeMS / (1000 * SECONDS_IN_DAY);
    const hoursDiff = daysDiff * 24;
    const minutesDiff = hoursDiff * 60;
    const secondsDiff = minutesDiff * 60;

    let tickInterval;
    switch (true) {
        case (daysDiff / 365) > 5:
            tickInterval = 'years';
            break;
        case daysDiff > 800:
            tickInterval = 'half_year';
            break;
        case daysDiff > 180:
            tickInterval = 'months';
            break;
        case daysDiff > 90:
            tickInterval = 'months_fortnight';
            break;
        case daysDiff > 60:
            tickInterval = 'months_days';
            break;
        case daysDiff > 30:
            tickInterval = 'week_days';
            break;
        case daysDiff > 2:
            tickInterval = 'days';
            break;
        case hoursDiff > 2.4:
            tickInterval = 'hours';
            break;
        case minutesDiff > 15:
            tickInterval = 'minutes_fives';
            break;
        case minutesDiff > 5:
            tickInterval = 'minutes';
            break;
        case minutesDiff > 1:
            tickInterval = 'seconds_tens';
            break;
        case secondsDiff > 20:
            tickInterval = 'seconds_fives';
            break;
        default:
            tickInterval = 'seconds';
            break;
    }

    let xUnit;
    if (tickInterval === 'years') xUnit = 'year';
    else if (['half_year', 'months', 'months_fortnight', 'months_days', 'week_days'].includes(tickInterval)) xUnit = 'month';
    else if (tickInterval === 'days') xUnit = 'day';
    else if (tickInterval === 'hours') xUnit = 'hour';
    else if (['minutes_fives', 'minutes'].includes(tickInterval)) xUnit = 'minute';
    else xUnit = 'second';

    const fmt = xl.options[xUnit] ?? xl.options.hour;
    const yearFmt = xl.options.year;
    const monthFmt = xl.options.month;
    const dayFmt = xl.options.day;

    window.forEach((ts, idx) => {
        const d = new Date(ts);
        let text;
        switch (xUnit) {
            case 'year':
                text = dt.formatDate(d, yearFmt);
                break;
            case 'month': {
                const m = xl.useUTC ? d.getUTCMonth() : d.getMonth();
                text = (xl.januaryAsYear && m === 0) ? dt.formatDate(d, yearFmt) : dt.formatDate(d, monthFmt);
                break;
            }
            case 'day':
                text = dt.formatDate(d, dayFmt);
                break;
            default: {
                // For hour/minute/second: show day label if exact midnight
                const H = xl.useUTC ? d.getUTCHours() : d.getHours();
                const M = xl.useUTC ? d.getUTCMinutes() : d.getMinutes();
                if (H === 0 && M === 0) {
                    text = dt.formatDate(d, dayFmt);
                } else {
                    text = dt.formatDate(d, fmt);
                }
            }
        }
        out.push({ text, absoluteIndex: sliceStart + idx });
    });

    return out;
}
