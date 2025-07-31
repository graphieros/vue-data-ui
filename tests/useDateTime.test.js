import { test, describe, expect } from 'vitest'
import { useDateTime } from '../src/useDateTime'

const locale = {
    months: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ],
    shortMonths: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ],
    days: [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday'
    ],
    shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
}

describe('useDateTime composable', () => {
    const dtLocal = useDateTime({ useUTC: false, min: undefined, max: undefined, locale })
    const dtUTC = useDateTime({ useUTC: true, min: undefined, max: undefined, locale })

    test('isValidDate returns true for ISO date string and false for number or invalid', () => {
        expect(dtLocal.isValidDate('2021-08-15')).toBe(true)
        expect(dtLocal.isValidDate(1628985600000)).toBe(true)
        expect(dtLocal.isValidDate('not-a-date')).toBe(false)
    })

    test('parseDate returns correct timestamp for known date', () => {
        const ts = dtLocal.parseDate('2020-02-29T12:34:56Z')
        expect(typeof ts).toBe('number')
        expect(new Date(ts).toISOString()).toBe('2020-02-29T12:34:56.000Z')
    })

    test('getTimeStamp respects useUTC flag', () => {
        const input = '2020-01-01T00:00:00+02:00'
        const localTs = dtLocal.getTimeStamp(input)
        const utcTs = dtUTC.getTimeStamp(input)
        expect(localTs).toBe(Date.parse(input))
        expect(utcTs).toBe(Date.UTC(2020, 0, 1, 0, 0, 0))
    })

    test('getDate returns Date object with correct mode', () => {
        const timestamp = Date.UTC(2021, 5, 10, 8, 30, 0)
        const localDate = dtLocal.getDate(timestamp)
        const utcDate = dtUTC.getDate(timestamp)
        expect(localDate instanceof Date).toBe(true)
        expect(utcDate.toUTCString()).toBe(new Date(timestamp).toUTCString())
    })

    test('formatDate produces correct patterns in UTC mode', () => {
        const date = new Date(Date.UTC(2022, 0, 2, 3, 4, 5, 6))

        // Standard tokens
        expect(dtUTC.formatDate(date, 'yyyy-MM-dd HH:mm:ss fff')).toBe('2022-01-02 03:04:05 006')
        expect(dtUTC.formatDate(date, 'ddd, MMM dd, yyyy')).toBe('Sun, Jan 02, 2022')

        // Year variants
        expect(dtUTC.formatDate(date, 'y')).toBe('2022')
        expect(dtUTC.formatDate(date, 'yy')).toBe('22')
        expect(dtUTC.formatDate(date, 'yyyy')).toBe('2022')

        // Month variants
        expect(dtUTC.formatDate(date, 'M')).toBe('1')
        expect(dtUTC.formatDate(date, 'MM')).toBe('01')
        expect(dtUTC.formatDate(date, 'MMM')).toBe('Jan')
        expect(dtUTC.formatDate(date, 'MMMM')).toBe('January')

        // Day variants
        expect(dtUTC.formatDate(date, 'd')).toBe('2')
        expect(dtUTC.formatDate(date, 'dd')).toBe('02')
        expect(dtUTC.formatDate(date, 'ddd')).toBe('Sun')
        expect(dtUTC.formatDate(date, 'dddd')).toBe('Sunday')

        // Hour variants
        expect(dtUTC.formatDate(date, 'H')).toBe('3')
        expect(dtUTC.formatDate(date, 'HH')).toBe('03')
        expect(dtUTC.formatDate(date, 'h')).toBe('3')
        expect(dtUTC.formatDate(date, 'hh')).toBe('03')

        // Minute and second variants
        expect(dtUTC.formatDate(date, 'm')).toBe('4')
        expect(dtUTC.formatDate(date, 'mm')).toBe('04')
        expect(dtUTC.formatDate(date, 's')).toBe('5')
        expect(dtUTC.formatDate(date, 'ss')).toBe('05')

        // Fractional seconds
        expect(dtUTC.formatDate(date, 'f')).toBe('0')
        expect(dtUTC.formatDate(date, 'ff')).toBe('01')
        expect(dtUTC.formatDate(date, 'fff')).toBe('006')

        // AM/PM designators
        expect(dtUTC.formatDate(date, 'TT')).toBe('AM')
        expect(dtUTC.formatDate(date, 'T')).toBe('A')
        expect(dtUTC.formatDate(date, 'tt')).toBe('am')
        expect(dtUTC.formatDate(date, 't')).toBe('a')

        // Timezone offset
        expect(dtUTC.formatDate(date, 'K')).toBe('Z')

        // Composite format (literal "T" must be escaped as \T)
        expect(
            dtUTC.formatDate(date, 'yyyy-MM-dd\\THH:mm:ss.fffK')
        ).toBe('2022-01-02T03:04:05.006Z')

        // Escaping literals
        expect(dtUTC.formatDate(date, '\\yyyy-MM')).toBe('yyyy-01')
    })

    test('getTimeUnitsfromTimestamp extracts correct parts', () => {
        const minTs = Date.UTC(2026, 3, 5, 6, 7, 8, 900)
        const maxTs = Date.UTC(2026, 3, 6, 7, 8, 9, 123)
        const parts = dtUTC.getTimeUnitsfromTimestamp(minTs, maxTs)
        expect(parts.minYear).toBe(2026)
        expect(parts.minMonth).toBe(3)
        expect(parts.minDate).toBe(5)
        expect(parts.minHour).toBe(6)
        expect(parts.minMinute).toBe(7)
        expect(parts.minSecond).toBe(8)
        expect(parts.minMillisecond).toBe(900)
        expect(parts.maxYear).toBe(2026)
        expect(parts.maxMonth).toBe(3)
        expect(parts.maxDate).toBe(6)
        expect(parts.maxHour).toBe(7)
        expect(parts.maxMinute).toBe(8)
        expect(parts.maxSecond).toBe(9)
        expect(parts.maxMillisecond).toBe(123)
    })

    test('isLeapYear correctly identifies leap years', () => {
        expect(dtLocal.isLeapYear(2000)).toBe(true)
        expect(dtLocal.isLeapYear(1900)).toBe(false)
        expect(dtLocal.isLeapYear(2024)).toBe(true)
        expect(dtLocal.isLeapYear(2023)).toBe(false)
    })

    test('calculateLastDaysOfMonth subtracts correctly', () => {
        expect(dtLocal.calculateLastDaysOfMonth(2, 2020, 1)).toBe(28)
        expect(dtLocal.calculateLastDaysOfMonth(4, 2021, 5)).toBe(25)
    })

    test('determineDaysOfYear returns correct total days', () => {
        expect(dtLocal.determineDaysOfYear(2020)).toBe(366)
        expect(dtLocal.determineDaysOfYear(2021)).toBe(365)
    })

    test('determineRemainingDaysOfYear counts correctly', () => {
        expect(dtLocal.determineRemainingDaysOfYear(2021, 0, 1)).toBe(1)
        expect(dtLocal.determineRemainingDaysOfYear(2020, 2, 1)).toBe(61)
    })

    test('determineDaysOfMonths returns correct days per month', () => {
        expect(dtLocal.determineDaysOfMonths(1, 2021)).toBe(31)
        expect(dtLocal.determineDaysOfMonths(2, 2021)).toBe(28)
        expect(dtLocal.determineDaysOfMonths(2, 2020)).toBe(29)
        expect(dtLocal.determineDaysOfMonths(4, 2021)).toBe(30)
        expect(dtLocal.determineDaysOfMonths(13, 2021)).toBe(31)
    })

    test('januaryAsYear option replaces January month names with the year and leaves other months intact', () => {
        const year = 2025
        const dtJanAsYear = useDateTime({
            useUTC: true,
            locale,
            januaryAsYear: true
        })
        
        // January should be replaced by the year
        const janDate = new Date(Date.UTC(year, 0, 15, 12, 0, 0))
        expect(dtJanAsYear.formatDate(janDate, 'MMMM')).toBe(String(year))
        expect(dtJanAsYear.formatDate(janDate, 'MMM')).toBe(String(year))
        
        // All other months (February through December) should remain the same
        for (let monthIndex = 1; monthIndex < 12; monthIndex += 1) {
            const date = new Date(Date.UTC(year, monthIndex, 15, 12, 0, 0))
            const fullName = locale.months[monthIndex]
            const shortName = locale.shortMonths[monthIndex]
        
            expect(dtJanAsYear.formatDate(date, 'MMMM')).toBe(fullName)
            expect(dtJanAsYear.formatDate(date, 'MMM')).toBe(shortName)
        }
        
        // And default behavior (januaryAsYear = false) still shows "January"/"Jan"
        const dtDefault = useDateTime({ useUTC: true, locale })
        expect(dtDefault.formatDate(janDate, 'MMMM')).toBe('January')
        expect(dtDefault.formatDate(janDate, 'MMM')).toBe('Jan')
    })
})
