import { describe, expect, test, vi } from "vitest";
import { useTimeLabels } from "../src/useTimeLabels";

// Stub out useDateTime so formatDate just returns the format string
vi.mock("../src/useDateTime", () => ({
    useDateTime: () => ({
        formatDate: (_d, fmt) => fmt,
    }),
}));

// If useLocale does any async work in the real code, mock it to avoid network/fs
vi.mock("../src/useLocale", () => ({
    useLocale: async () => ({ data: {} }),
}));

const baseFormatter = {
    enable: true,
    useUTC: false,
    locale: "en",
    januaryAsYear: false,
    options: {
        year: "yyyy",
        month: "MMM",
        day: "dd/MM",
        hour: "HH:mm",
        minute: "mm",
        second: "ss",
    },
};

const makeDate = (iso) => new Date(iso).getTime();

describe("useTimeLabels composable", () => {
    test("returns raw values when formatting disabled", async () => {
        const result = await useTimeLabels({
            values: [10, 20, 30, 40],
            maxDatapoints: 4,
            formatter: { ...baseFormatter, enable: false },
            start: 1,
            end: 3,
        });

        expect(result).toEqual([
            { text: "20", absoluteIndex: 1 },
            { text: "30", absoluteIndex: 2 },
        ]);
    });

    test("second interval uses second format", async () => {
        const vals = [makeDate("2025-08-01T00:00:00Z"), makeDate("2025-08-01T00:00:00Z") + 500];

        const res = await useTimeLabels({
            values: vals,
            maxDatapoints: vals.length,
            formatter: baseFormatter,
            start: 0,
            end: 2,
        });

        expect(res.every((r) => r.text === "ss")).toBe(true);
    });

    test("minute interval falls back to second format (per current logic)", async () => {
        const vals = [makeDate("2025-08-01T00:00:00Z"), makeDate("2025-08-01T00:01:00Z")];

        const res = await useTimeLabels({
            values: vals,
            maxDatapoints: vals.length,
            formatter: baseFormatter,
            start: 0,
            end: 2,
        });

        expect(res.every((r) => r.text === "ss")).toBe(true);
    });

    test("hour interval falls back to minute format (per current logic)", async () => {
        const vals = [makeDate("2025-08-01T00:00:00Z"), makeDate("2025-08-01T02:00:00Z")];

        const res = await useTimeLabels({
            values: vals,
            maxDatapoints: vals.length,
            formatter: baseFormatter,
            start: 0,
            end: 2,
        });

        expect(res.every((r) => r.text === "mm")).toBe(true);
    });

    test("day interval falls back to hour format (per current logic)", async () => {
        const vals = [makeDate("2025-08-01T00:00:00Z"), makeDate("2025-08-03T00:00:00Z")];

        const res = await useTimeLabels({
            values: vals,
            maxDatapoints: vals.length,
            formatter: baseFormatter,
            start: 0,
            end: 2,
        });

        expect(res.every((r) => r.text === "HH:mm")).toBe(true);
    });

    test("month interval uses month format", async () => {
        const vals = [makeDate("2025-06-15T12:00:00Z"), makeDate("2025-08-15T12:00:00Z")];

        const res = await useTimeLabels({
            values: vals,
            maxDatapoints: vals.length,
            formatter: baseFormatter,
            start: 0,
            end: 2,
        });

        expect(res.every((r) => r.text === "MMM")).toBe(true);
    });

    test("year interval picks year format", async () => {
        const vals = [makeDate("2020-07-01T00:00:00Z"), makeDate("2025-07-01T00:00:00Z")];

        const res = await useTimeLabels({
            values: vals,
            maxDatapoints: vals.length,
            formatter: baseFormatter,
            start: 0,
            end: 2,
        });

        expect(res.every((r) => r.text === "yyyy")).toBe(true);
    });

    test("januaryAsYear renders year for January label", async () => {
        const vals = [makeDate("2025-01-01T00:00:00Z"), makeDate("2025-02-01T00:00:00Z")];

        const fmt = { ...baseFormatter, januaryAsYear: true };

        const res = await useTimeLabels({
            values: vals,
            maxDatapoints: vals.length,
            formatter: fmt,
            start: 0,
            end: 2,
        });

        expect(res[0].text).toBe("yyyy");
        expect(res[1].text).toBe("MMM");
    });

    test("midnight labels currently show time format (no override)", async () => {
        const vals = [makeDate("2025-08-01T00:00:00Z"), makeDate("2025-08-01T05:30:00Z")];

        const res = await useTimeLabels({
            values: vals,
            maxDatapoints: vals.length,
            formatter: baseFormatter,
            start: 0,
            end: 2,
        });

        expect(res[0].text).toBe("HH:mm");
        expect(res[1].text).toBe("HH:mm");
    });
});
