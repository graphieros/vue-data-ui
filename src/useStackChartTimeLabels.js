import { computed, ref, watchEffect } from 'vue';
import { buildDisplayedTimeLabels, getEffectiveTimeLabelModulo } from './lib';
import { useLocale } from './useLocale';
import { useTimeLabels } from './useTimeLabels';
import { useDateTime } from './useDateTime';

export function useStackChartTimeLabels({
    cfgTimeLabels,
    timeLabels,
    timeLabelsAreReady,
    allTimeLabels,
    slicer,
    maxSeries,
    cfgChart,
    cfgTooltip,
    getCategoryLabels,
}) {
    const categoryLabels = computed(() => getCategoryLabels?.());

    let timeLabelsRequestId = 0;
    watchEffect(() => {
        const requestId = ++timeLabelsRequestId;
        const categories = categoryLabels.value;
        if (categories) {
            timeLabels.value = categories
                .slice(slicer.value.start, slicer.value.end)
                .map((label, index) => ({
                    ...label,
                    absoluteIndex: slicer.value.start + index,
                }));
            timeLabelsAreReady.value = true;
            return;
        }

        (async () => {
            const labels = await useTimeLabels({
                values: cfgTimeLabels.value.values,
                maxDatapoints: maxSeries.value,
                formatter: cfgTimeLabels.value.datetimeFormatter,
                start: slicer.value.start,
                end: slicer.value.end,
            });

            if (requestId === timeLabelsRequestId) {
                timeLabels.value = labels;
                timeLabelsAreReady.value = true;
            }
        })();
    });

    let allTimeLabelsRequestId = 0;
    watchEffect(() => {
        const requestId = ++allTimeLabelsRequestId;
        const categories = categoryLabels.value;
        if (categories) {
            allTimeLabels.value = categories.map((label) => ({ ...label }));
            return;
        }

        (async () => {
            const labels = await useTimeLabels({
                values: cfgTimeLabels.value.values,
                maxDatapoints: maxSeries.value,
                formatter: cfgTimeLabels.value.datetimeFormatter,
                start: 0,
                end: maxSeries.value,
            });

            if (requestId === allTimeLabelsRequestId) {
                allTimeLabels.value = labels;
            }
        })();
    });

    const effectiveModulo = computed(() => {
        const configuredModulo = Math.max(
            1,
            Math.floor(Number(cfgTimeLabels.value.modulo) || 1),
        );

        const visibleTexts = (timeLabels.value || []).map(
            (label) => label?.text ?? '',
        );

        const allTexts = (allTimeLabels.value || []).map(
            (label) => label?.text ?? '',
        );

        const start = slicer.value.start ?? 0;

        const isZoomed = start > 0 || visibleTexts.length < allTexts.length;

        return getEffectiveTimeLabelModulo({
            configuredModulo,
            visibleTexts,
            allTexts,
            startAbs: start,
            isZoomed,
        });
    });
    function getDisplayedTimeLabels(selectedIndex) {
        if (getCategoryLabels) {
            const labels = categoryLabels.value;
            if (labels)
                return labels
                    .slice(
                        slicer.value.start ?? 0,
                        slicer.value.end ?? labels.length,
                    )
                    .map((label, index) => ({
                        ...label,
                        absoluteIndex: (slicer.value.start ?? 0) + index,
                    }));
        }
        const cfg = cfgTimeLabels.value;

        const vis = timeLabels.value || [];
        const all = allTimeLabels.value || [];
        const start = slicer.value.start ?? 0;
        const maxS = maxSeries.value;

        const visTexts = vis.map((label) => label?.text ?? '');
        const allTexts = all.map((label) => label?.text ?? '');

        const displayed = buildDisplayedTimeLabels(
            !!cfg.showOnlyFirstAndLast,
            !!cfg.showOnlyAtModulo,
            effectiveModulo.value,
            visTexts,
            allTexts,
            start,
            selectedIndex,
            maxS,
        );

        if (
            !cfg.showFirstAndLast ||
            cfg.showOnlyFirstAndLast ||
            !displayed.length
        ) {
            return displayed;
        }

        const lastIndex = displayed.length - 1;

        return displayed.map((label, i) => {
            if (i !== 0 && i !== lastIndex) {
                return label;
            }

            return {
                ...label,
                text: visTexts[i] ?? '',
            };
        });
    }
    const localeData = ref({
        months: [],
        shortMonths: [],
        days: [],
        shortDays: [],
    });

    let localeRequestId = 0;
    watchEffect(() => {
        const requestId = ++localeRequestId;
        const xl = cfgTimeLabels.value.datetimeFormatter;

        (async () => {
            const resolved = await useLocale(xl.locale).catch(() =>
                useLocale('en'),
            );
            if (requestId === localeRequestId) {
                localeData.value = resolved.data;
            }
        })();
    });

    const preciseTimeFormatter = computed(() => {
        const xl = cfgTimeLabels.value.datetimeFormatter;

        const dt = useDateTime({
            useUTC: xl.useUTC,
            locale: localeData.value,
            januaryAsYear: xl.januaryAsYear,
        });

        return (absIndex, fmt) => {
            if (getCategoryLabels) {
                const labels = categoryLabels.value;
                if (labels) return labels[absIndex]?.text ?? '';
            }
            const values = cfgTimeLabels.value.values;
            const ts = values?.[absIndex];
            if (ts == null) return '';
            return dt.formatDate(new Date(ts), fmt);
        };
    });
    const preciseAllTimeLabels = computed(() => {
        if (getCategoryLabels) {
            const labels = categoryLabels.value;
            if (labels) return labels.map((label) => ({ ...label }));
        }
        const values = cfgTimeLabels.value.values || [];
        return values.map((_, i) => ({
            text: preciseTimeFormatter.value(i, cfgChart.value.zoom.timeFormat),
            absoluteIndex: i,
        }));
    });
    const preciseAllTimeLabelsTooltip = computed(() => {
        if (getCategoryLabels) {
            const labels = categoryLabels.value;
            if (labels) return labels.map((label) => ({ ...label }));
        }
        const values = cfgTimeLabels.value.values || [];
        return values.map((_, i) => ({
            text: preciseTimeFormatter.value(i, cfgTooltip.value.timeFormat),
            absoluteIndex: i,
        }));
    });
    return {
        getDisplayedTimeLabels,
        preciseAllTimeLabels,
        preciseAllTimeLabelsTooltip,
        preciseTimeFormatter,
    };
}
