import { useDateTime } from "./useDateTime";
import locales from "./locales/locales.json";

/**
 * @param {Array<string|number>} values
 * @param {number} maxDatapoints
 * @param {{ enable:boolean, useUTC:boolean, locale:string, januaryAsYear:boolean, options:Record<string,string> }} formatter
 * @param {number} start
 * @param {number} end
 */
export function useTimeLabels({
    values,
    maxDatapoints,
    formatter,
    start,
    end
}) {
    const raw = values;
    const xl = formatter;
    const max = maxDatapoints;
    const out = [];

    if (!xl.enable) {
        for (let i = 0; i < max; i += 1) {
            out.push({
                text: raw[i] ?? String(i),
                absoluteIndex: i,
            });
        }
    } else {
        const dt = useDateTime({
            useUTC: xl.useUTC,
            min: raw[0] ?? "0",
            max: raw[max - 1] ?? String(max - 1),
            locale: locales[xl.locale],
            januaryAsYear: xl.januaryAsYear,
        });

        const start = new Date(raw[0]);
        const end = new Date(raw[max - 1]);
        const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

        let xUnit = "second";
        const u = dt.getTimeUnitsfromTimestamp(raw[0], raw[max - 1]);

        if (monthsDiff >= 1) xUnit = "month";
        else if (u.minDate !== u.maxDate) xUnit = "day";
        else if (u.minHour !== u.maxHour) xUnit = "hour";
        else if (u.minMinute !== u.maxMinute) xUnit = "minute";

        const fmt = xl.options[xUnit];
        const yearFmt = xl.options.year;

        for (let i = 0; i < max; i += 1) {
            const d = new Date(raw[i]);
            const m = xl.useUTC ? d.getUTCMonth() : d.getMonth();

            let text;
            if (xl.januaryAsYear && xUnit === "month" && m === 0) {
                text = dt.formatDate(d, yearFmt);
            } else {
                text = dt.formatDate(d, fmt);
            }

            out.push({ text, absoluteIndex: i });
        }
    }

    return out.slice(start, end);
}
