import {
    applyDataLabel,
    dataLabel,
    createCsvContent,
    downloadCsv,
} from './lib';

export function useStackChartFormatters({
    dataLabels,
    cfgChart,
    tableCsv,
    fallbackTitle,
}) {
    function valueLabel(val, datapoint, index, dpIndex, signed) {
        const appliedValue = signed === -1 ? (val >= 0 ? -val : val) : val;
        return applyDataLabel(
            dataLabels.value.formatter,
            appliedValue,
            dataLabel({
                p: dataLabels.value.prefix,
                v: appliedValue,
                s: dataLabels.value.suffix,
                r: dataLabels.value.rounding,
            }),
            { datapoint, seriesIndex: index, datapointIndex: dpIndex },
        );
    }

    function percentageLabel(val, datapoint, index, dpIndex) {
        return applyDataLabel(
            dataLabels.value.formatter,
            val,
            dataLabel({
                v: isNaN(val) ? 0 : val,
                s: '%',
                r: dataLabels.value.rounding,
            }),
            { datapoint, seriesIndex: index, datapointIndex: dpIndex },
        );
    }

    function generateCsv(callback = null) {
        const title = [
            [cfgChart.value.title.text],
            [cfgChart.value.title.subtitle.text],
            [''],
        ];
        const head = ['', ...tableCsv.value.head.map((h) => h.label)];
        const body = tableCsv.value.body;
        const table = title.concat([head]).concat(body);
        const csvContent = createCsvContent(table);

        if (!callback) {
            downloadCsv({
                csvContent,
                title: cfgChart.value.title.text || fallbackTitle,
            });
        } else {
            callback(csvContent);
        }
    }
    return {
        valueLabel,
        percentageLabel,
        generateCsv,
    };
}
