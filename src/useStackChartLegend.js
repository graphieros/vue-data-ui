import { computed } from 'vue';

export function useStackChartLegend({
    unmutableDataset,
    formattedDataset,
    segregated,
    cfgChart,
    debug,
    emit,
    chartName,
    componentName,
    legendShape,
}) {
    function toggleLegend() {
        if (segregated.value.length) {
            segregated.value = [];
        } else {
            legendSet.value.forEach((l) => {
                segregated.value.push(l.id);
            });
        }
        emit('selectLegend', formattedDataset.value);
    }

    function segregate(item) {
        if (segregated.value.includes(item.id)) {
            segregated.value = segregated.value.filter((el) => el !== item.id);
        } else {
            if (segregated.value.length === unmutableDataset.value.length - 1)
                return;
            segregated.value.push(item.id);
        }
        emit('selectLegend', formattedDataset.value);
    }

    function validSeriesToToggle(name) {
        if (!unmutableDataset.value.length) {
            if (debug.value) {
                console.warn(`${componentName} - There are no series to show.`);
            }
            return null;
        }
        const dp = unmutableDataset.value.find((d) => d.name === name);
        if (!dp) {
            if (debug.value) {
                console.warn(
                    `${componentName} - Series name not found "${name}"`,
                );
            }
            return null;
        }
        return dp;
    }

    function showSeries(name) {
        const dp = validSeriesToToggle(name);
        if (dp === null) return;
        if (segregated.value.includes(dp.id)) {
            segregate({ id: dp.id });
        }
    }

    function hideSeries(name) {
        const dp = validSeriesToToggle(name);
        if (dp === null) return;
        if (!segregated.value.includes(dp.id)) {
            segregate({ id: dp.id });
        }
    }

    const legendSet = computed(() => {
        return unmutableDataset.value.map((ds) => {
            return {
                ...ds,
                ...(legendShape ? { shape: legendShape } : {}),
                opacity: segregated.value.includes(ds.id) ? 0.5 : 1,
                segregate: () => segregate(ds),
                isSegregated: segregated.value.includes(ds.id),
            };
        });
    });

    const legendConfig = computed(() => {
        return {
            cy: `${chartName}-legend`,
            backgroundColor: cfgChart.value.legend.backgroundColor,
            color: cfgChart.value.legend.color,
            fontSize: cfgChart.value.legend.fontSize,
            paddingBottom: 12,
            fontWeight: cfgChart.value.legend.bold ? 'bold' : '',
        };
    });
    return {
        toggleLegend,
        showSeries,
        hideSeries,
        legendSet,
        legendConfig,
    };
}
