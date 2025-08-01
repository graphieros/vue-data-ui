import { useDateTime } from "./useDateTime";
import locales from "./locales/locales.json";

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
    const raw = values;
    const out = [];

    if (!xl.enable) {
        for (let i = sliceStart; i < sliceEnd; i += 1) {
            out.push({ text: raw[i] ?? String(i), absoluteIndex: i });
        }
        return out;
    }

    const windowValues = raw.slice(sliceStart, sliceEnd);

    const dt = useDateTime({
        useUTC: xl.useUTC,
        min: windowValues[0],
        max: windowValues[windowValues.length - 1],
        locale: locales[xl.locale],
        januaryAsYear: xl.januaryAsYear,
    });

    const ws = new Date(windowValues[0]);
    const we = new Date(windowValues[windowValues.length - 1]);
    const getMonthFn = xl.useUTC ? "getUTCMonth" : "getMonth";
    const getYearFn = xl.useUTC ? "getUTCFullYear" : "getFullYear";
    const monthsDiff =
        (we[getYearFn]() - ws[getYearFn]()) * 12 +
        (we[getMonthFn]() - ws[getMonthFn]());

    const u = dt.getTimeUnitsfromTimestamp(
        windowValues[0],
        windowValues[windowValues.length - 1]
    );

    let xUnit = "second";
    if (u.minMinute !== u.maxMinute) xUnit = "minute";
    else if (u.minHour !== u.maxHour) xUnit = "hour";
    else if (u.minDate !== u.maxDate) xUnit = "day";
    else if (monthsDiff >= 1) xUnit = "month";

    const fmt = xl.options[xUnit];
    const yearFmt = xl.options.year;
    const monthFmt = xl.options.month;
    const dayFmt = xl.options.day;

    windowValues.forEach((ts, idx) => {
        const d = new Date(ts);
        const hours = xl.useUTC ? d.getUTCHours() : d.getHours();
        const minutes = xl.useUTC ? d.getUTCMinutes() : d.getMinutes();

        let text;
        if (idx === 0) {
            if (xUnit === "month" && (hours === 0 && minutes === 0) && ((xl.useUTC ? d.getUTCDate() : d.getDate()) === 1)) {
                text = dt.formatDate(d, monthFmt);
            } else if (hours === 0 && minutes === 0) {
                text = dt.formatDate(d, dayFmt);
            } else {
                text = dt.formatDate(d, fmt);
            }
        } else {
            const prev = new Date(windowValues[idx - 1]);
            const prevY = xl.useUTC ? prev.getUTCFullYear() : prev.getFullYear();
            const prevM = xl.useUTC ? prev.getUTCMonth() : prev.getMonth();
            const prevD = xl.useUTC ? prev.getUTCDate() : prev.getDate();
            const currY = xl.useUTC ? d.getUTCFullYear() : d.getFullYear();
            const currM = xl.useUTC ? d.getUTCMonth() : d.getMonth();
            const currD = xl.useUTC ? d.getUTCDate() : d.getDate();

            if (currY !== prevY) {
                text = dt.formatDate(d, yearFmt);
            } else if (currM !== prevM) {
                text = xUnit === "month"
                    ? dt.formatDate(d, monthFmt)
                    : dt.formatDate(d, dayFmt);
            } else if (currD !== prevD) {
                text = dt.formatDate(d, dayFmt);
            } else if (hours === 0 && minutes === 0) {
                text = dt.formatDate(d, dayFmt);
            } else if (xl.januaryAsYear && xUnit === "month" && currM === 0) {
                text = dt.formatDate(d, yearFmt);
            } else {
                text = dt.formatDate(d, fmt);
            }
        }

        out.push({ text, absoluteIndex: sliceStart + idx });
    });

    return out;
}