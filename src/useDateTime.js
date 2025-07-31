/**
 * Datetime utilities inspired by ApexCharts DateTime class.
 */
export function useDateTime({
    useUTC = false,
    min = undefined,
    max = undefined,
    locale = {
        months: [],
        shortMonths: [],
        days: [],
        shortDays: []
    },
    januaryAsYear = false,
}) {
    const non31DayMonths = [2, 4, 6, 9, 11];
    const daysCntOfYear = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

    function monthMod(month) {
        return month % 12;
    }

    // VALIDATION & PARSING

    function isValidDate(date) {
        if (typeof date === 'number') return true;
        return !isNaN(parseDate(date));
    }

    function getTimeStamp(dateStr) {
        const parsed = Date.parse(dateStr);
        if (isNaN(parsed)) {
            return dateStr;
        }
        if (!useUTC) {
            return parsed;
        }
        const stripped = String(dateStr).replace(/([+-]\d{2}:\d{2}|Z)$/, '');
        return Date.parse(stripped + 'Z');
    }

    function getDate(timestamp) {
        return new Date(timestamp);
    }

    function parseDate(dateStr) {
        const parsed = Date.parse(dateStr);
        if (!isNaN(parsed)) {
            return getTimeStamp(dateStr);
        }
        const fallback = Date.parse(
            dateStr.replace(/-/g, '/').replace(/[a-z]+/gi, ' ')
        );
        return getTimeStamp(fallback);
    }

    function parseDateWithTimezone(dateStr) {
        return Date.parse(dateStr.replace(/-/g, '/').replace(/[a-z]+/gi, ' '));
    }

    // FORMATTING

    function formatDate(date, format) {
        const utc = useUTC;

        // Escape any backslash prefixed token sequence
        const tokenNames = [
            'yyyy', 'yy', 'y',
            'MMMM', 'MMM', 'MM', 'M',
            'dddd', 'ddd', 'dd', 'd',
            'HH', 'H', 'hh', 'h',
            'mm', 'm', 'ss', 's',
            'fff', 'ff', 'f',
            'TT', 'T', 'tt', 't',
            'K'
        ];
        const escRe = new RegExp(
            `\\\\(${tokenNames.join('|')})`,
            'g'
        );
        const literals = [];
        format = format.replace(escRe, (_, tok) => {
            literals.push(tok);
            return `{{${literals.length - 1}}}`;
        });

        // Placeholders to avoid regex collision
        const MMMM = ['\x00', ...locale.months];
        const MMM = ['\x01', ...locale.shortMonths];
        const dddd = ['\x02', ...locale.days];
        const ddd = ['\x03', ...locale.shortDays];

        function pad(i, len = 2) {
            let s = String(i);
            while (s.length < len) s = '0' + s;
            return s;
        }

        // Year
        const y = utc ? date.getUTCFullYear() : date.getFullYear();
        format = format
            .replace(/(^|[^\\])yyyy+/g, `$1${y}`)
            .replace(/(^|[^\\])yy/g, `$1${String(y).substr(2, 2)}`)
            .replace(/(^|[^\\])y/g, `$1${y}`);

        // Month
        const M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;

        // If januaryAsYear, show the year instead of "January"/"Jan"
        if (januaryAsYear && M === 1) {
            MMMM[1] = String(y);
            MMM[1]  = String(y);
        }

        format = format
            .replace(/(^|[^\\])MMMM+/g, `$1${MMMM[0]}`)
            .replace(/(^|[^\\])MMM/g, `$1${MMM[0]}`)
            .replace(/(^|[^\\])MM/g, `$1${pad(M)}`)
            .replace(/(^|[^\\])M/g, `$1${M}`);

        // Date
        const d = utc ? date.getUTCDate() : date.getDate();
        format = format
            .replace(/(^|[^\\])dddd+/g, `$1${dddd[0]}`)
            .replace(/(^|[^\\])ddd/g, `$1${ddd[0]}`)
            .replace(/(^|[^\\])dd/g, `$1${pad(d)}`)
            .replace(/(^|[^\\])d/g, `$1${d}`);

        // 24h Hour
        const H = utc ? date.getUTCHours() : date.getHours();
        format = format
            .replace(/(^|[^\\])HH+/g, `$1${pad(H)}`)
            .replace(/(^|[^\\])H/g, `$1${H}`);

        // 12h Hour
        const h = H > 12 ? H - 12 : H === 0 ? 12 : H;
        format = format
            .replace(/(^|[^\\])hh+/g, `$1${pad(h)}`)
            .replace(/(^|[^\\])h/g, `$1${h}`);

        // Minute
        const m = utc ? date.getUTCMinutes() : date.getMinutes();
        format = format
            .replace(/(^|[^\\])mm+/g, `$1${pad(m)}`)
            .replace(/(^|[^\\])m/g, `$1${m}`);

        // Second
        const s = utc ? date.getUTCSeconds() : date.getSeconds();
        format = format
            .replace(/(^|[^\\])ss+/g, `$1${pad(s)}`)
            .replace(/(^|[^\\])s/g, `$1${s}`);

        // Fractional
        let f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
        format = format.replace(/(^|[^\\])fff+/g, `$1${pad(f, 3)}`);
        f = Math.round(f / 10);
        format = format.replace(/(^|[^\\])ff/g, `$1${pad(f)}`);
        f = Math.round(f / 10);
        format = format.replace(/(^|[^\\])f/g, `$1${f}`);

        // AM/PM
        const T = H < 12 ? 'AM' : 'PM';
        format = format
            .replace(/(^|[^\\])TT+/g, `$1${T}`)
            .replace(/(^|[^\\])T/g, `$1${T.charAt(0)}`)
            .replace(/(^|[^\\])tt+/g, `$1${T.toLowerCase()}`)
            .replace(/(^|[^\\])t/g, `$1${T.toLowerCase().charAt(0)}`);

        // Timezone offset
        let tz = -date.getTimezoneOffset();
        let K = utc || !tz ? 'Z' : tz > 0 ? '+' : '-';
        if (!utc) {
            tz = Math.abs(tz);
            const tzH = Math.floor(tz / 60), tzM = tz % 60;
            K += pad(tzH) + ':' + pad(tzM);
        }
        format = format.replace(/(^|[^\\])K/g, `$1${K}`);

        // Day / Month names
        const dayIdx = (utc ? date.getUTCDay() : date.getDay()) + 1;
        format = format
            .replace(new RegExp(dddd[0], 'g'), dddd[dayIdx])
            .replace(new RegExp(ddd[0], 'g'), ddd[dayIdx])
            .replace(new RegExp(MMMM[0], 'g'), MMMM[M])
            .replace(new RegExp(MMM[0], 'g'), MMM[M]);

        // RESTORE ESCAPED LITERALS
        format = format.replace(/{{(\d+)}}/g, (_, idx) => literals[+idx]);
        return format;
    }

    // TIME UNIT EXTRACTION
    function getTimeUnitsfromTimestamp(minX, maxX) {
        if (min !== undefined) minX = min;
        if (max !== undefined) maxX = max;

        const tsMin = getDate(minX);
        const tsMax = getDate(maxX);
        const minP = formatDate(tsMin, 'yyyy MM dd HH mm ss fff').split(' ');
        const maxP = formatDate(tsMax, 'yyyy MM dd HH mm ss fff').split(' ');

        return {
            minMillisecond: parseInt(minP[6], 10),
            maxMillisecond: parseInt(maxP[6], 10),
            minSecond: parseInt(minP[5], 10),
            maxSecond: parseInt(maxP[5], 10),
            minMinute: parseInt(minP[4], 10),
            maxMinute: parseInt(maxP[4], 10),
            minHour: parseInt(minP[3], 10),
            maxHour: parseInt(maxP[3], 10),
            minDate: parseInt(minP[2], 10),
            maxDate: parseInt(maxP[2], 10),
            minMonth: parseInt(minP[1], 10) - 1,
            maxMonth: parseInt(maxP[1], 10) - 1,
            minYear: parseInt(minP[0], 10),
            maxYear: parseInt(maxP[0], 10)
        };
    }

    // YEAR / MONTH CALCULATIONS

    function isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    function calculateLastDaysOfMonth(month, year, subtract) {
        return determineDaysOfMonths(month, year) - subtract;
    }

    function determineDaysOfYear(year) {
        return isLeapYear(year) ? 366 : 365;
    }

    function determineRemainingDaysOfYear(year, month, date) {
        let d = daysCntOfYear[month] + date;
        if (month > 1 && isLeapYear(year)) d += 1;
        return d;
    }

    function determineDaysOfMonths(month, year) {
        month = monthMod(month);
        if (non31DayMonths.includes(month)) {
            return month === 2
                ? (isLeapYear(year) ? 29 : 28)
                : 30;
        }
        return 31;
    }

    return {
        isValidDate,
        getTimeStamp,
        getDate,
        parseDate,
        parseDateWithTimezone,
        formatDate,
        getTimeUnitsfromTimestamp,
        isLeapYear,
        calculateLastDaysOfMonth,
        determineDaysOfYear,
        determineRemainingDaysOfYear,
        determineDaysOfMonths
    };
}
