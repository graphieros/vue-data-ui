declare module 'vue-data-ui' {
    import { DefineComponent } from "vue";

    export type VueUiUnknownObj = {
        [key: string]: unknown;
    }

    export type VueUiDashboardConfig = {
        style: {
            board: {
                backgroundColor: string;
                color: string;
                aspectRatio: string;
                border: string;
            };
            item: {
                backgroundColor: string;
                borderColor: string;
            };
            resizeHandles: {
                backgroundColor: string;
                border: string;
            };
        };
        allowPrint: boolean;
    }

    export type VueUiDashboardElement = {
        id: number | string;
        width: number;
        height: number;
        left: number;
        top: number;
        component: string;
        props: {
            config: VueUiUnknownObj;
            dataset: VueUiUnknownObj;
        }
    }

    export const VueUiDashboard: DefineComponent<{
        config: VueUiDashboardConfig;
        elements: VueUiDashboardElement[];
    }>;

    export type VueUiSparkbarDatasetItem = {
        name: string;
        value: number;
        suffix: string;
        rounding: string;
        color?: string;
    }

    export type VueUiSparkbarConfig = {
        style: {
            backgroundColor: string;
            fontFamily: string;
            layout: {
                independant: boolean;
                percentage: boolean;
                target: number;
            };
            gutter: {
                backgroundColor: string;
            };
            bar: {
                gradient: {
                    show: boolean;
                    intensity: number;
                    underlayerColor: string;
                };
            };
            labels: {
                fontSize: number;
                name: {
                    position: "top" | "left" | "right";
                    width: string;
                    color: string;
                    bold: boolean;
                };
                value: {
                    show: boolean;
                    bold: boolean;
                }
            },
            gap: number;
        }
    };

    export const VueUiSparkbar: DefineComponent<{
        config: VueUiSparkbarConfig;
        dataset: VueUiSparkbarDatasetItem[];
    }>;

    export type VueUiAgePyramidDataset = Array<Array<string | number>>;

    export type VueUiAgePyramidConfig = {
        style: {
            backgroundColor: string;
            color: string;
            fontFamily: string;
            height: number;
            width: number;
            layout: {
                useDiv: boolean;
                padding: {
                    top: number;
                    right: number;
                    bottom: number;
                    left: number;
                };
                grid: {
                    show: boolean;
                    stroke: string;
                    strokeWidth: number;
                };
                dataLabels: {
                    sideTitles: {
                        show: boolean;
                        fontSize: number;
                        color: string;
                        useSideColor: boolean;
                        bold: boolean;
                    };
                    xAxis: {
                        show: boolean;
                        fontSize: number;
                        color: string;
                        bold: boolean;
                        scale: number;
                        translation: string;
                    };
                    yAxis: {
                        show: boolean;
                        display: string;
                        fontSize: number;
                        color: string;
                        bold: boolean;
                        showEvery: number;
                    };
                };
                centerSlit: {
                    width: number;
                };
                bars: {
                    gap: number;
                    borderRadius: number;
                    left: {
                        color: string;
                    };
                    right: {
                        color: string;
                    };
                    gradient: {
                        show: boolean;
                        underlayer: string;
                        intensity: number;
                        shiftHue: number;
                    };
                };
            };
            highlighter: {
                color: string;
                opacity: number;
            };
            title: {
                text: string;
                color: string;
                fontSize: number;
                bold: boolean;
                subtitle: {
                    color: string;
                    text: string;
                    fontSize: number;
                    bold: boolean;
                };
            };
            tooltip: {
                show: boolean;
                backgroundColor: string;
                color: string;
                fontSize: number;
                roundingValue: number;
            };
        };
        translations: {
            age: string;
            male: string;
            female: string;
            total: string;
            year: string;
        };
        userOptions: {
            show: boolean;
            title: string;
            labels: {
                useDiv: string;
                showTable: string;
            };
        };
        table: {
            show: boolean;
            th: {
                backgroundColor: string;
                color: string;
                outline: string;
            };
            td: {
                backgroundColor: string;
                color: string;
                outline: string;
            };
        };
    };

    export const VueUiAgePyramid: DefineComponent<{
        config: VueUiAgePyramidConfig,
        dataset: VueUiAgePyramidDataset
    }>;

    export type VueUiCandlestickConfig = {
        style: {
            backgroundColor: string;
            color: string;
            fontFamily: string;
            height: number;
            width: number;
            layout: {
                useDiv: boolean;
                padding: {
                    top: number;
                    right: number;
                    bottom: number;
                    left: number;
                };
                selector: {
                    color: string;
                    opacity: number;
                };
                grid: {
                    show: boolean;
                    stroke: string;
                    strokeWidth: number;
                    xAxis: {
                        dataLabels: {
                            show: boolean;
                            fontSize: number;
                            color: string;
                            offsetY: number;
                            bold: boolean;
                        };
                    };
                    yAxis: {
                        dataLabels: {
                            show: boolean;
                            fontSize: number;
                            color: string;
                            roundingValue: number;
                            offsetX: number;
                            bold: boolean;
                            steps: number;
                            prefix: string;
                            suffix: string;
                        };
                    };
                };
                wick: {
                    stroke: string;
                    strokeWidth: number;
                    extremity: {
                        shape: string;
                        size: string | number;
                        color: string;
                    };
                };
                candle: {
                    borderRadius: number;
                    stroke: string;
                    strokeWidth: number;
                    colors: {
                        bearish: string;
                        bullish: string;
                    };
                    gradient: {
                        show: boolean;
                        intensity: number;
                        underlayer: string;
                    };
                    widthRatio: number;
                };
            };
            zoom: {
                show: boolean;
                color: string;
            };
            title: {
                text: string;
                color: string;
                fontSize: number;
                bold: boolean;
                subtitle: {
                    color: string;
                    text: string;
                    fontSize: number;
                    bold: boolean;
                };
            };
            tooltip: {
                show: boolean;
                backgroundColor: string;
                color: string;
                fontSize: number;
                roundingValue: number;
                prefix: string;
                suffix: string;
            };
        };
        translations: {
            period: string;
            open: string;
            high: string;
            low: string;
            last: string;
            volume: string;
        };
        userOptions: {
            show: boolean;
            title: string;
            labels: {
                useDiv: string;
                showTable: string;
                showPlotLabels: string;
            };
        };
        table: {
            show: boolean;
            th: {
                backgroundColor: string;
                color: string;
                outline: string;
            };
            td: {
                backgroundColor: string;
                color: string;
                outline: string;
                roundingValue: number;
                prefix: string;
                suffix: string;
            };
        };
    };

    export const VueUiCandlestick: DefineComponent<{
        config: VueUiCandlestickConfig,
        dataset: Array<Array<string | number>>
    }>;

    export type VueUiScatterDatasetValueItem = {
        name: string;
        x: number;
        y: number;
    }

    export type VueUiScatterDatasetItem = {
        name: string;
        values: VueUiScatterDatasetValueItem[];
        color: string;
    }

    export type VueUiScatterConfig = {
        style: {
            backgroundColor: string;
            color: string;
            fontFamily: string;
            layout: {
                useDiv: boolean;
                height: number;
                width: number;
                padding: {
                    top: number;
                    right: number;
                    bottom: number;
                    left: number;
                };
                axis: {
                    show: boolean;
                    stroke: string;
                    strokeWidth: number;
                };
                plots: {
                    radius: number;
                    stroke: string;
                    strokeWidth: number;
                    opacity: number;
                    significance: {
                        show: boolean;
                        deviationThreshold: number;
                        opacity: number;
                    };
                    deviation: {
                        translation: string;
                        roundingValue: number;
                    };
                };
                correlation: {
                    show: boolean;
                    strokeDasharray: number;
                    strokeWidth: number;
                    label: {
                        show: boolean;
                        fontSize: number;
                        color: string;
                        bold: boolean;
                        roundingValue: number;
                        useSerieColor: number;
                    };
                };
                dataLabels: {
                    xAxis: {
                        name: string;
                        show: boolean;
                        fontSize: number;
                        color: string;
                        bold: boolean;
                        offsetX: number;
                        offsetY: number;
                        roundingValue: number;
                    };
                    yAxis: {
                        name: string;
                        show: boolean;
                        fontSize: number;
                        color: string;
                        bold: boolean;
                        offsetY: number;
                        offsetX: number;
                        roundingValue: number;
                    };
                };
            };
            title: {
                text: string;
                color: string;
                fontSize: number;
                bold: boolean;
                subtitle: {
                    color: string;
                    text: string;
                    fontSize: number;
                    bold: boolean;
                };
            };
            legend: {
                show: boolean;
                backgroundColor: string;
                color: string;
                fontSize: string;
                bold: boolean;
                roundingValue: number;
            };
            tooltip: {
                show: boolean;
                backgroundColor: string;
                color: string;
                fontSize: number;
                roundingValue: number;
            };
        };
        userOptions: {
            show: boolean;
            title: string;
            labels: {
                useDiv: string;
                showTable: string;
                showPlotLabels: string;
            };
        };
        table: {
            show: boolean;
            th: {
                backgroundColor: string;
                color: string;
                outline: string;
            };
            td: {
                backgroundColor: string;
                color: string;
                outline: string;
                roundingValue: number;
                roundingAverage: number;
            };
            translations: {
                correlationCoefficient: string;
                nbrPlots: string;
                average: string;
            };
        };
    };

    export const VueUiScatter: DefineComponent<{
        config: VueUiScatterConfig,
        dataset: VueUiScatterDatasetItem[]
    }>;

    export type VueUiHeatmapConfig = {
        style: {
            backgroundColor: string;
            color: string;
            fontFamily: string;
            layout: {
                useDiv: boolean;
                padding: {
                    top: number;
                    right: number;
                    bottom: number;
                    left: number;
                };
                cells: {
                    height: number;
                    value: {
                        show: boolean;
                        fontSize: number;
                        bold: boolean;
                        roundingValue: number;
                        color: string;
                    };
                    colors: {
                        hot: string;
                        cold: string;
                        underlayer: string;
                    };
                    spacing: number;
                    selected: {
                        border: number;
                        color: string;
                    };
                };
                dataLabels: {
                    xAxis: {
                        show: boolean;
                        values: Array<string | number>;
                        fontSize: number;
                        color: string;
                        bold: boolean;
                        offsetX: number;
                        offsetY: number;
                    };
                    yAxis: {
                        show: boolean;
                        values: Array<string | number>
                        fontSize: number;
                        color: string;
                        bold: boolean;
                        offsetY: number;
                        offsetX: number;
                    };
                };
            };
            title: {
                text: string;
                color: string;
                fontSize: number;
                bold: boolean;
                subtitle: {
                    color: string;
                    text: string;
                    fontSize: number;
                    bold: boolean;
                };
            };
            legend: {
                show: boolean;
                backgroundColor: string;
                color: string;
                fontSize: number;
                bold: boolean;
                roundingValue: number;
            };
            tooltip: {
                show: boolean;
                backgroundColor: string;
                color: string;
                fontSize: number;
                roundingValue: number;
            };
        };
        userOptions: {
            show: boolean;
            title: string;
            labels: {
                useDiv: string;
                showTable: string;
                showPlotLabels: string;
            };
        };
        table: {
            show: boolean;
            th: {
                backgroundColor: string;
                color: string;
                outline: string;
            };
            td: {
                backgroundColor: string;
                color: string;
                outline: string;
                roundingValue: number;
            };
        };
    };

    export type VueUiHeatmapDatasetItem = {
        name: string;
        values: number[];
    }

    export const VueUiHeatmap: DefineComponent<{
        config: VueUiHeatmapConfig,
        dataset: VueUiHeatmapDatasetItem[]
    }>;

    export type VueUiXyConfig = {
        chart: {
            fontFamily: string;
            backgroundColor: string;
            color: string;
            height: number;
            width: number;
            zoom: {
                show: boolean;
                color: string;
            };
            padding: {
                top: number;
                right: number;
                bottom: number;
                left: number;
            };
            highlighter: {
                color: string;
                opacity: number;
            };
            grid: {
                stroke: string;
                showVerticalLines: boolean;
                labels: {
                    color: string;
                    show: boolean;
                    fontSize: number;
                    axis: {
                        yLabel: string;
                        xLabel: string;
                        fontSize: number;
                    };
                    xAxisLabels: {
                        color: string;
                        show: boolean;
                        values: string[];
                        fontSize: number;
                        showOnlyFirstAndLast: boolean;
                    };
                };
            };
            labels: {
                fontSize: number;
            };
            legend: {
                color: string;
                show: boolean;
                useDiv: boolean;
                fontSize: number;
            };
            title: {
                show: boolean;
                useDiv: boolean;
                color: string;
                text: string;
                fontSize: number;
                bold: boolean;
                offsetX: number;
                offsetY: number;
                subtitle: {
                    fontSize: number;
                    color: string;
                    text: string;
                };
            };
            tooltip: {
                color: string;
                backgroundColor: string;
                show: boolean;
                showValue: boolean;
                showPercentage: boolean;
                roundingValue: number;
                roundingPercentage: number;
            };
            userOptions: {
                show: boolean;
                title: string;
                labels: {
                    dataLabels: string;
                    titleInside: string;
                    legendInside: string;
                    showTable: string;
                };
            };
        };
        bar: {
            useGradient: boolean;
            labels: {
                show: boolean;
                offsetY: number;
                rounding: number;
                color: string;
            };
        };
        line: {
            radius: number;
            useGradient: boolean;
            strokeWidth: number;
            labels: {
                show: boolean;
                offsetY: number;
                rounding: number;
                color: string;
            };
        };
        plot: {
            radius: number;
            useGradient: boolean;
            labels: {
                show: boolean;
                offsetY: number;
                rounding: number;
                color: string;
            };
        };
        table: {
            rounding: number;
            th: {
                backgroundColor: string;
                color: string;
                outline: string;
            };
            td: {
                backgroundColor: string;
                color: string;
                outline: string;
            };
        };
        showTable: boolean;
    };

    export type VueUiXyDatasetItem = {
        name: string;
        series: number[];
        type: "bar" | "line" | "plot";
        color?: string;
        dashed?: boolean;
        useTag?: boolean;
        dataLabels?: boolean;
        useProgression?: boolean;
    };

    export const VueUiXy: DefineComponent<{
        config: VueUiXyConfig;
        dataset: VueUiXyDatasetItem[];
    }>

    export type VueUiDonutConfig = {
        style: {
            fontFamily: string;
            chart: {
                useGradient: boolean;
                gradientIntensity: number;
                backgroundColor: string;
                color: string;
                layout: {
                    useDiv: boolean;
                    labels: {
                        dataLabels: {
                            show: boolean;
                            hideUnderValue: number;
                        };
                        percentage: {
                            color: string;
                            bold: boolean;
                            fontSize: number;
                        };
                        name: {
                            color: string;
                            bold: boolean;
                            fontSize: number;
                        };
                        hollow: {
                            total: {
                                show: boolean;
                                bold: boolean;
                                fontSize: number;
                                color: string;
                                text: string;
                                offsetY: number;
                                value: {
                                    color: string;
                                    fontSize: number;
                                    bold: boolean;
                                    suffix: string;
                                    prefix: string;
                                    offsetY: number;
                                    rounding: number;
                                };
                            };
                            average: {
                                show: boolean;
                                bold: boolean;
                                fontSize: number;
                                color: string;
                                text: string;
                                offsetY: number;
                                value: {
                                    color: string;
                                    fontSize: number;
                                    bold: boolean;
                                    suffix: string;
                                    prefix: string;
                                    offsetY: number;
                                    rounding: number;
                                };
                            };
                        };
                    };
                    donut: {
                        strokeWidth: number;
                    };
                };
                legend: {
                    backgroundColor: string;
                    color: string;
                    show: boolean;
                    fontSize: number;
                    bold: boolean;
                    roundingValue: number;
                    roundingPercentage: number;
                };
                title: {
                    text: string;
                    color: string;
                    fontSize: number;
                    bold: boolean;
                    subtitle: {
                        color: string;
                        text: string;
                        fontSize: number;
                        bold: boolean;
                    };
                };
                tooltip: {
                    show: boolean;
                    color: string;
                    backgroundColor: string;
                    fontSize: number;
                    showValue: boolean;
                    showPercentage: boolean;
                    roundingValue: number;
                    roundingPercentage: number;
                };
            };
        };
        userOptions: {
            show: boolean;
            title: string;
            labels: {
                dataLabels: string;
                useDiv: string;
                showTable: string;
            };
        };
        translations: {
            total: string;
            average: string;
        };
        table: {
            show: boolean;
            th: {
                backgroundColor: string;
                color: string;
                outline: string;
            };
            td: {
                backgroundColor: string;
                color: string;
                outline: string;
                roundingValue: number;
                roundingPercentage: number;
            };
        };
    };

    export type VueUiDonutDatasetItem = {
        name: string;
        color?: string;
        values: number[];
    };

    export const VueUiDonut: DefineComponent<{
        config: VueUiDonutConfig,
        dataset: VueUiDonutDatasetItem[]
    }>;

    export type VueUiWaffleConfig = {
        style: {
            fontFamily: string;
            chart: {
                backgroundColor: string;
                color: string;
                layout: {
                    grid: {
                        size: number;
                        spaceBetween: number;
                        vertical: boolean;
                    };
                    rect: {
                        rounded: boolean;
                        rounding: number;
                        stroke: string;
                        strokeWidth: number;
                        useGradient: boolean;
                        gradientIntensity: 40;
                    };
                    useDiv: boolean;
                };
                title: {
                    text: string;
                    color: string;
                    fontSize: number;
                    bold: boolean;
                    subtitle: {
                        color: string;
                        text: string;
                        fontSize: number;
                        bold: boolean;
                    };
                };
                tooltip: {
                    show: boolean;
                    backgroundColor: string;
                    color: string;
                    fontSize: number;
                    showValue: boolean;
                    showPercentage: boolean;
                    roundingValue: number;
                    roundingPercentage: number;
                };
                legend: {
                    show: boolean;
                    bold: boolean;
                    backgroundColor: string;
                    color: string;
                    fontSize: number;
                    roundingValue: number;
                    roundingPercentage: number;
                };
            };
        };
        userOptions: {
            show: boolean;
            title: string;
            labels: {
                useDiv: string;
                showTable: string;
            };
        };
        table: {
            show: boolean;
            th: {
                backgroundColor: string;
                color: string;
                outline: string;
            };
            td: {
                backgroundColor: string;
                color: string;
                outline: string;
                roundingValue: number;
                roundingPercentage: number;
            };
        };
    };

    export type VueUiWaffleDatasetItem = {
        name: string;
        color?: string;
        values: number[];
    }

    export const VueUiWaffle: DefineComponent<{
        config: VueUiWaffleConfig,
        dataset: VueUiWaffleDatasetItem[]
    }>;

    export type VueUiRadarConfig = {
        style: {
            fontFamily: string;
            chart: {
                backgroundColor: string;
                color: string;
                layout: {
                    useDiv: boolean;
                    plots: {
                        show: boolean;
                        radius: number;
                    };
                    outerPolygon: {
                        stroke: string;
                        strokeWidth: number;
                    };
                    dataPolygon: {
                        strokeWidth: number;
                        transparent: boolean;
                        opacity: number;
                        useGradient: boolean;
                    };
                    grid: {
                        show: boolean;
                        stroke: string;
                        strokeWidth: number;
                        graduations: number;
                    };
                    labels: {
                        dataLabels: {
                            show: boolean;
                            fontSize: number;
                            color: string;
                        };
                    };
                };
                title: {
                    text: string;
                    color: string;
                    fontSize: number;
                    bold: boolean;
                    subtitle: {
                        color: string;
                        text: string;
                        fontSize: number;
                        bold: boolean;
                    };
                };
                tooltip: {
                    show: boolean;
                    backgroundColor: string;
                    color: string;
                    fontSize: number;
                    showValue: boolean;
                    showPercentage: boolean;
                    roundingValue: number;
                    roundingPercentage: number;
                };
                legend: {
                    show: boolean;
                    bold: boolean;
                    backgroundColor: string;
                    color: string;
                    fontSize: number;
                    roundingPercentage: number;
                };
            };
        };
        table: {
            show: boolean;
            th: {
                backgroundColor: string;
                color: string;
                outline: string;
            };
            td: {
                backgroundColor: string;
                color: string;
                outline: string;
                roundingValue: number;
                roundingPercentage: number;
            };
        };
        userOptions: {
            show: boolean;
            title: string;
            labels: {
                useDiv: string;
                showTable: string;
            };
        };
        translations: {
            target: string;
        };
    };

    export type VueUiRadarDatasetCategoryItem = {
        name: string;
        color?: string;
    };

    export type VueUiRadarDatasetSerieItem = {
        name: string;
        values: number[];
        color?: string;
        target?: number;
    };

    export type VueUiRadarDataset = {
        categories: VueUiRadarDatasetCategoryItem[];
        series: VueUiRadarDatasetSerieItem[];
    };

    export const VueUiRadar: DefineComponent<{
        config: VueUiRadarConfig,
        dataset: VueUiRadarDataset
    }>;

    export type VueUiQuadrantDatasetSerieItem = {
        name: string;
        x: number;
        y: number;
    };

    export type VueUiQuadrantDatasetItem = {
        name: string;
        shape: "circle" | "triangle" | "square" | "diamond" | "pentagon" | "hexagon" | "star";
        color?: string;
        series: VueUiQuadrantDatasetSerieItem[];
    };

    export type VueUiQuadrantConfig = {
        style: {
            fontFamily: string;
            chart: {
                height: number;
                width: number;
                backgroundColor: string;
                color: string;
                layout: {
                    useDiv: boolean;
                    labels: {
                        quadrantLabels: {
                            show: boolean;
                            tl: {
                                text: string;
                                color: string;
                                fontSize: number;
                                bold: boolean;
                            };
                            tr: {
                                text: string;
                                color: string;
                                fontSize: number;
                                bold: boolean;
                            };
                            br: {
                                text: string;
                                color: string;
                                fontSize: number;
                                bold: boolean;
                            };
                            bl: {
                                text: string;
                                color: string;
                                fontSize: number;
                                bold: boolean;
                            };
                        };
                        plotLabels: {
                            show: boolean;
                            fontSize: number;
                            color: string;
                            offsetY: number;
                        };
                        axisLabels: {
                            show: boolean;
                            fontSize: number;
                            color: {
                                positive: string;
                                negative: string;
                            };
                        };
                    };
                    grid: {
                        stroke: string;
                        strokeWidth: number;
                        showArrows: boolean;
                        graduations: {
                            stroke: string;
                            strokeWidth: number;
                            show: boolean;
                            steps: number;
                            fill: boolean;
                            color: string;
                            roundingForce: number;
                        };
                        xAxis: {
                            min: number;
                            max: number;
                            auto: boolean;
                            name: string;
                        };
                        yAxis: {
                            min: number;
                            max: number;
                            auto: boolean;
                            name: string;
                        };
                    };
                    plots: {
                        radius: number;
                        outline: boolean;
                        outlineColor: string;
                        outlineWidth: number;
                    };
                    areas: {
                        show: boolean;
                        opacity: number;
                        useGradient: boolean;
                    };
                };
                title: {
                    text: string;
                    color: string;
                    fontSize: number;
                    bold: boolean;
                    subtitle: {
                        color: string;
                        text: string;
                        fontSize: number;
                        bold: boolean;
                    };
                };
                tooltip: {
                    show: boolean;
                    backgroundColor: string;
                    color: string;
                    fontSize: number;
                    roundingValue: number;
                };
                legend: {
                    show: boolean;
                    bold: boolean;
                    backgroundColor: string;
                    color: string;
                    fontSize: number;
                };
            };
        };
        table: {
            show: boolean;
            th: {
                backgroundColor: string;
                color: string;
                outline: string;
            };
            td: {
                backgroundColor: string;
                color: string;
                outline: string;
                roundingValue: number;
            };
        };
        userOptions: {
            show: boolean;
            title: string;
            labels: {
                useDiv: string;
                showTable: string;
                showPlotLabels: string;
            };
        };
        translations: {
            category: string;
            item: string;
            side: string;
        };
    };

    export const VueUiQuadrant: DefineComponent<{
        dataset: VueUiQuadrantDatasetItem[],
        config: VueUiQuadrantConfig
    }>;

    export type VueUiGaugeDatasetSerieItem = {
        from: number;
        to: number;
        color?: string;
    };

    export type VueUiGaugeDataset = {
        base?: number;
        value: number;
        series: VueUiGaugeDatasetSerieItem[];
    }

    export type VueUiGaugeConfig = {
        style: {
            fontFamily: string;
            chart: {
                backgroundColor: string;
                color: string;
                animation: {
                    use: boolean;
                    speed: number;
                    acceleration: number;
                };
                layout: {
                    useDiv: boolean;
                    track: {
                        size: number;
                        useGradient: boolean;
                        gradientIntensity: number;
                    };
                    markers: {
                        size: number;
                        color: string;
                        strokeWidth: number;
                        stroke: string;
                        backgroundColor: string;
                        bold: boolean;
                        fontSizeRatio: number;
                        offsetY: number;
                        roundingValue: number;
                    };
                    pointer: {
                        size: number;
                        stroke: string;
                        strokeWidth: number;
                        useRatingColor: boolean;
                        color: string;
                        circle: {
                            radius: number;
                            stroke: string;
                            strokeWidth: number;
                            color: string;
                        };
                    };
                };
                legend: {
                    fontSize: number;
                    prefix: string;
                    suffix: string;
                    roundingValue: number;
                    showPlusSymbol: boolean;
                    useRatingColor: boolean;
                    color: string;
                };
                title: {
                    text: string;
                    color: string;
                    fontSize: number;
                    bold: boolean;
                    subtitle: {
                        color: string;
                        text: string;
                        fontSize: number;
                        bold: boolean;
                    };
                };
            };
        };
        userOptions: {
            show: boolean;
            title: string;
            labels: {
                useDiv: string;
                showTable: string;
            };
        };
        translations: {
            base: string;
        };
    };

    export const VueUiGauge: DefineComponent<{
        config: VueUiGaugeConfig,
        dataset: VueUiGaugeDataset
    }>;

    export type VueUiChestnutDatasetBranchBreakdown = {
        name: string;
        value: number;
        color?: string;
    };

    export type VueUiChestnutDatasetBranch = {
        name: string;
        value: number;
        breakdown: VueUiChestnutDatasetBranchBreakdown[];
    };

    export type VueUiChestnutDatasetRoot = {
        name: string;
        color?: string;
        branches: VueUiChestnutDatasetBranch[];
    };

    export type VueUiChestnutConfig = {
        style: {
            fontFamily: string;
            chart: {
                backgroundColor: string;
                color: string;
                layout: {
                    grandTotal: {
                        show: boolean;
                        fontSize: number;
                        bold: boolean;
                        suffix: string;
                        prefix: string;
                        roundingValue: number;
                        color: string;
                        text: string;
                        offsetY: number;
                    };
                    roots: {
                        stroke: string;
                        strokeWidth: number;
                        useGradient: boolean;
                        gradientIntensity: number;
                        underlayerColor: string;
                        labels: {
                            show: boolean;
                            fontSize: number;
                            adaptColorToBackground: boolean;
                            color: string;
                            bold: boolean;
                            roundingValue: number;
                            prefix: string;
                            suffix: string;
                            name: {
                                color: string;
                                fontSize: number;
                                bold: boolean;
                            };
                        };
                    };
                    verticalSeparator: {
                        stroke: string;
                        strokeWidth: number;
                    };
                    links: {
                        opacity: number;
                    };
                    branches: {
                        stroke: string;
                        strokeWidth: number;
                        borderRadius: number;
                        useGradient: boolean;
                        gradientIntensity: number;
                        underlayerColor: string;
                        widthRatio: number;
                        labels: {
                            show: boolean;
                            fontSize: number;
                            color: string;
                            bold: boolean;
                            dataLabels: {
                                show: boolean;
                                hideUnderValue: number;
                                fontSize: number;
                                roundingValue: number;
                                roundingPercentage: number;
                                prefix: string;
                                suffix: string;
                            };
                        };
                    };
                    nuts: {
                        offsetX: number;
                        useGradient: boolean;
                        gradientIntensity: number;
                        selected: {
                            useMotion: boolean;
                            useGradient: boolean;
                            gradientIntensity: number;
                            roundingValue: number;
                            roundingPercentage: number;
                            labels: {
                                dataLabels: {
                                    hideUnderValue: number;
                                    color: string;
                                    fontSize: number;
                                    bold: boolean;
                                    prefix: string;
                                    suffix: string;
                                };
                                core: {
                                    total: {
                                        color: string;
                                        fontSize: number;
                                        bold: boolean;
                                    };
                                    value: {
                                        color: string;
                                        fontSize: number;
                                        bold: boolean;
                                        prefix: string;
                                        suffix: string;
                                    };
                                };
                            };
                        };
                    };
                    legend: {
                        fontSize: number;
                        color: string;
                        roundingValue: number;
                        roundingPercentage: number;
                        prefix: string;
                        suffix: string;
                    };
                    title: {
                        color: string;
                        fontSize: number;
                        text: string;
                        bold: boolean;
                        offsetY: number;
                        subtitle: {
                            text: string;
                            color: string;
                            bold: boolean;
                            fontSize: number;
                            offsetY: number;
                        };
                    };
                };
            };
        };
        table: {
            show: boolean;
            th: {
                backgroundColor: string;
                color: string;
                outline: string;
                translations: {
                    rootName: string;
                    rootValue: string;
                    rootToTotal: string;
                    branchName: string;
                    branchValue: string;
                    branchToRoot: string;
                    branchToTotal: string;
                    nutName: string;
                    nutValue: string;
                    nutToBranch: string;
                    nutToRoot: string;
                    nutToTotal: string;
                };
            };
            td: {
                backgroundColor: string;
                color: string;
                outline: string;
                roundingValue: number;
                roundingPercentage: number;
            };
        };
        userOptions: {
            show: boolean;
            title: string;
            labels: {
                showTable: string;
            };
        };
        translations: {
            total: string;
            proportionToTree: string;
            of: string;
        }
    };

    export const VueUiChestnut: DefineComponent<{
        config: VueUiChestnutConfig,
        dataset: VueUiChestnutDatasetRoot[]
    }>;

    export type VueUiOnionDatasetItem = {
        name: string;
        percentage: number;
        value?: number;
        color?: string;
        prefix?: string;
        suffix?: string;
    };

    export type VueUiOnionConfig = {
        style: {
            fontFamily: string;
            chart: {
                backgroundColor: string;
                color: string;
                useGradient: boolean;
                gradientIntensity: number;
                layout: {
                    useDiv: boolean;
                    gutter: {
                        color: string;
                        width: number;
                    };
                    track: {
                        width: number;
                    };
                    labels: {
                        show: boolean;
                        fontSize: number;
                        color: string;
                        roundingValue: number;
                        roundingPercentage: number;
                        bold: boolean;
                        offsetY: number;
                        offsetX: number;
                        value: {
                            show: boolean;
                        };
                        percentage: {
                            show: boolean;
                        };
                    };
                };
                title: {
                    text: string;
                    color: string;
                    fontSize: number;
                    bold: boolean;
                    subtitle: {
                        color: string;
                        text: string;
                        fontSize: number;
                        bold: boolean;
                    };
                };
                legend: {
                    show: boolean;
                    bold: boolean;
                    backgroundColor: string;
                    color: string;
                    fontSize: number;
                    roundingValue: number;
                    roundingPercentage: number;
                };
            };
        };
        userOptions: {
            show: boolean;
            title: string;
            labels: {
                useDiv: string;
                showTable: string;
            };
        };
        table: {
            show: boolean;
            th: {
                backgroundColor: string;
                color: string;
                outline: string;
            };
            td: {
                backgroundColor: string;
                color: string;
                outline: string;
                roundingValue: number;
                roundingPercentage: number;
            },
            translations: {
                value: string;
                percentage: string;
                serie: string;
            };
        };
    };

    export const VueUiOnion: DefineComponent<{
        config: VueUiOnionConfig,
        dataset: VueUiOnionDatasetItem[]
    }>;

    export type VueUiVerticalBarDatasetChild = {
        name: string;
        value: string;
    };

    export type VueUiVerticalBarDatasetItem = {
        name: string;
        value: number;
        color?: string;
        children?: VueUiVerticalBarDatasetChild[];
    };

    export type VueUiVerticalBarConfig = {
        style: {
            fontFamily: string;
            chart: {
                backgroundColor: string;
                color: string;
                layout: {
                    useDiv: boolean;
                    bars: {
                        sort: "desc" | "asc";
                        useStroke: boolean;
                        strokeWidth: number;
                        height: number;
                        gap: number;
                        borderRadius: number;
                        offsetX: number;
                        paddingRight: number;
                        useGradient: boolean;
                        gradientIntensity: number;
                        fillOpacity: number;
                        underlayerColor: string;
                        dataLabels: {
                            color: string;
                            bold: boolean;
                            fontSize: number;
                            value: {
                                show: boolean;
                                roundingValue: number;
                                prefix: string;
                                suffix: string;
                            };
                            percentage: {
                                show: boolean;
                                roundingPercentage: number;
                            };
                            offsetX: 0;
                        };
                        nameLabels: {
                            show: boolean;
                            color: string;
                            bold: boolean;
                            fontSize: number;
                            offsetX: number;
                        };
                        parentLabels: {
                            show: boolean;
                            color: string;
                            bold: boolean;
                            fontSize: number;
                            offsetX: number;
                        };
                    };
                    highlighter: {
                        color: string;
                        opacity: number;
                    };
                    separators: {
                        show: boolean;
                        color: string;
                        strokeWidth: number;
                    };
                };
                title: {
                    text: string;
                    color: string;
                    fontSize: number;
                    bold: boolean;
                    subtitle: {
                        color: string;
                        text: string;
                        fontSize: number;
                        bold: boolean;
                    };
                };
                legend: {
                    position: "top" | "bottom";
                    show: boolean;
                    fontSize: number;
                    color: string;
                    backgroundColor: string;
                    bold: boolean;
                    roundingValue: number;
                    roundingPercentage: number;
                    prefix: string;
                    suffix: string;
                };
                tooltip: {
                    show: boolean;
                    backgroundColor: string;
                    color: string;
                    fontSize: number;
                    showValue: boolean;
                    showPercentage: boolean;
                    roundingValue: number;
                    roundingPercentage: number;
                    prefix: string;
                    suffix: string;
                };
            };
        };
        userOptions: {
            show: boolean;
            title: string;
            labels: {
                useDiv: string;
                showTable: string;
                sort: string;
            };
        };
        table: {
            show: boolean;
            th: {
                backgroundColor: string;
                color: string;
                outline: string;
            };
            td: {
                backgroundColor: string;
                color: string;
                outline: string;
                roundingValue: number;
                roundingPercentage: number;
                prefix: string;
                suffix: string;
            };
        };
        translations: {
            parentName: string;
            childName: string;
            value: string;
            percentageToTotal: string;
            percentageToSerie: string;
        };
    };

    export const VueUiVerticalBar: DefineComponent<{
        config: VueUiVerticalBarConfig,
        dataset: VueUiVerticalBarDatasetItem[]
    }>;

    export type VueUiSparklineDatasetItem = {
        period: string;
        value: number;
    };

    export type VueUiSparklineConfig = {
        style: {
            backgroundColor: string;
            fontFamily: string;
            sparkline: {
                color: string;
                strokeWidth: number;
            };
            line: {
                color: string;
                strokeWidth: number;
            };
            zeroLine: {
                color: string;
                strokeWidth: number;
            };
            plot: {
                show: boolean;
                radius: number;
                stroke: string;
                strokeWidth: number;
            };
            verticalIndicator: {
                show: boolean;
                strokeWidth: number;
            };
            dataLabel: {
                position: "left" | "right";
                fontSize: number;
                bold: boolean;
                color: string;
                roundingValue: number;
                valueType: "latest" | "sum" | "average";
            };
            title: {
                show: boolean;
                textAlign: "left" | "center" | "right";
                color: string;
                fontSize: number;
                bold: boolean;
                text: string;
            };
            area: {
                show: boolean;
                useGradient: boolean;
                opacity: number;
                color: string;
            };
        };
    };

    export const VueUiSparkline: DefineComponent<{
        config: VueUiSparklineConfig,
        dataset: VueUiSparklineDatasetItem[]
    }>;

    export type VueUiTableDatasetHeaderItem = {
        name: string;
        type: "text" | "date" | "numeric";
        average?: boolean;
        decimals?: number;
        sum?: boolean;
        isSort?: boolean;
        isSearch?: boolean;
        isMultiselect?: boolean;
        isPercentage?: boolean;
        percentageTo?: string;
        prefix?: string;
        suffix?: string;
        rangeFilter?: boolean;
    };

    export type VueUiTableDatasetBodyItem = {
        td: (number | string)[];
    }

    export type VueUiTableDataset = {
        header: VueUiTableDatasetHeaderItem[];
        body: VueUiTableDatasetBodyItem[];
    };

    export type VueUiTableConfig = {
        fontFamily: string;
        maxHeight: number;
        rowsPerPage: number;
        style: {
            th: {
                backgroundColor: string;
                color: string;
                outline: string;
                selected: {
                    backgroundColor: string;
                    color: string;
                };
            };
            rows: {
                even: {
                    backgroundColor: string;
                    color: string;
                    selectedCell: {
                        backgroundColor: string;
                        color: string;
                    };
                    selectedNeighbors: {
                        backgroundColor: string;
                        color: string;
                    };
                };
                odd: {
                    backgroundColor: string;
                    color: string;
                    selectedCell: {
                        backgroundColor: string;
                        color: string;
                    };
                    selectedNeighbors: {
                        backgroundColor: string;
                        color: string;
                    };
                };
            };
            inputs: {
                backgroundColor: string;
                color: string;
                border: string;
                accentColor: string;
            },
            dropdowns: {
                backgroundColor: string;
                color: string;
                icons: {
                    selected: {
                        color: string;
                        unicode: string;
                    };
                    unselected: {
                        color: string;
                        unicode: string;
                    };
                };
            };
            infoBar: {
                backgroundColor: string;
                color: string;
            };
            pagination: {
                buttons: {
                    backgroundColor: string;
                    color: string;
                    opacityDisabled: string;
                };
                navigationIndicator: {
                    backgroundColor: string;
                };
            };
            exportMenu: {
                backgroundColor: string;
                color: string;
                buttons: {
                    backgroundColor: string;
                    color: string;
                };
            };
            closeButtons: {
                backgroundColor: string;
                color: string;
                borderRadius: string;
            };
            chart: {
                modal: {
                    backgroundColor: string;
                    color: string;
                    buttons: {
                        selected: {
                            backgroundColor: string;
                            color: string;
                        };
                        unselected: {
                            backgroundColor: string;
                            color: string;
                        };
                    };
                };
                layout: {
                    backgroundColor: string;
                    axis: {
                        stroke: string;
                        strokeWidth: number;
                    };
                    bar: {
                        fill: string;
                        stroke: string;
                    },
                    line: {
                        stroke: string;
                        strokeWidth: number;
                        plot: {
                            fill: string;
                            stroke: string;
                            strokeWidth: number;
                            radius: {
                                selected: number;
                                unselected: number;
                            };
                        };
                        selector: {
                            stroke: string;
                            strokeWidth: number;
                            strokeDasharray: number;
                        };
                    };
                    labels: {
                        color: string;
                    };
                    progression: {
                        stroke: string;
                        strokeWidth: number;
                        strokeDasharray: number;
                        arrowSize: number;
                    };
                };
            };
        };
        translations: {
            average: string;
            by: string;
            chooseCategoryColumn: string;
            exportAllButton: string;
            exportAllLabel: string;
            exportPageButton: string;
            exportPageLabel: string;
            from: string;
            inputPlaceholder: string;
            makeDonut: string;
            nb: string;
            page: string;
            paginatorLabel: string;
            sizeWarning: string;
            sum: string;
            to: string;
            total: string;
            totalRows: string;
        };
        useChart: boolean;
    };

    export const VueUiTable: DefineComponent<{
        config: VueUiTableConfig,
        dataset: VueUiTableDataset
    }>;

    export type VueUiRatingDatasetDetailed = {
        [key: string]: number;
    };

    export type VueUiRatingDataset = {
        rating: number | VueUiRatingDatasetDetailed;
    };

    export type VueUiRatingConfig = {
        type: "star" | "image";
        readonly: boolean;
        from: number;
        to: number;
        style: {
            fontFamily: string;
            animated: boolean;
            itemSize: number;
            backgroundColor: string;
            star: {
                activeColor: string;
                borderColor: string;
                borderWidth: number;
                apexes: number;
                inactiveColor: string;
                useGradient: boolean;
            };
            image: {
                src: string;
                inactiveOpacity: string;
                alt: string;
            };
            title: {
                textAlign: string;
                fontSize: number;
                color: string;
                bold: boolean;
                text: string;
                offsetY: number;
                subtitle: {
                    fontSize: number;
                    color: string;
                    bold: boolean;
                    text: string;
                    offsetY: number;
                };
            };
            rating: {
                show: boolean;
                fontSize: number;
                bold: boolean;
                roundingValue: number;
                position: "bottom" | "top" | "left" | "right",
                offsetY: number;
                offsetX: number;
            };
            tooltip: {
                show: boolean;
                fontSize: number;
                offsetY: number;
                color: string;
                bold: boolean;
                backgroundColor: string;
                borderColor: string;
                borderRadius: number;
                boxShadow: string;
            };
        };
    };

    export const VueUiRating: DefineComponent<{
        config: VueUiRatingConfig,
        dataset: VueUiRatingDataset
    }>;

    export type VueUiScreenshotConfig = {
        mode: "download" | "post";
        quality: number;
        style: {
            info: {
                background: string;
                bold: boolean;
                border: string;
                borderRadius: number;
                boxShadow: string;
                color: string;
                fontFamily: string;
                fontSize: number;
                minWidth: number;
                padding: number;
                top: number;
            };
            captureButton: {
                background: string;
                bold: boolean;
                border: string;
                borderRadius: number;
                boxShadow: string;
                color: string;
                fontFamily: string;
                fontSize: number;
                minHeight: number;
                padding: string;
            };
            cancelButton: {
                background: string;
                border: string;
                borderRadius: number;
                color: string;
                right: number;
                size: number;
                top: number;
            };
            captureArea: {
                background: string;
                border: string;
                initialHeight: number;
                initialWidth: number;
            };
            handles: {
                background: string;
                border: string;
                borderRadius: number;
                size: number;
            };
        };
        translations: {
            captureButton: string;
            info: string;
        };
    };

    export const VueUiScreenshot: DefineComponent<{
        config: VueUiScreenshotConfig
    }>;

    export type VueUiSkeletonConfig = {
        type: "bar" | "chestnut" | "donut" | "gauge" | "line" | "onion" | "quadrant" | "radar" | "rating" | "table" | "verticalBar" | "waffle" | "heatmap" | "candlestick" | "pyramid";
        style: {
            backgroundColor: string;
            color: string;
            animated: boolean;
            line: {
                axis: {
                    show: boolean;
                    color: string;
                    strokeWidth: number;
                };
                path: {
                    color: string;
                    strokeWidth: number;
                    showPlots: boolean;
                };
            };
            bar: {
                axis: {
                    show: boolean;
                    color: string;
                    strokeWidth: number;
                };
                borderRadius: number;
                color: string;
                barWidth: number;
            };
            chestnut: {
                color: string;
            };
            donut: {
                color: string;
                strokeWidth: number;
            };
            onion: {
                color: string;
            };
            gauge: {
                color: string;
            };
            quadrant: {
                grid: {
                    color: string;
                    strokeWidth: number;
                };
                plots: {
                    radius: number;
                    color: string;
                };
            };
            radar: {
                grid: {
                    color: string;
                    strokeWidth: number;
                };
                shapes: {
                    color: string;
                };
            };
            waffle: {
                color: string;
            };
            table: {
                th: {
                    color: string;
                };
                td: {
                    color: string;
                    strokeWidth: number;
                };
            };
            rating: {
                color: string;
                filled: boolean;
                strokeWidth: number;
                maxWidth: number;
            };
            verticalBar: {
                axis: {
                    show: boolean;
                    color: string;
                    strokeWidth: number;
                },
                borderRadius: number;
                color: string;
            };
            heatmap: {
                cellsX: number;
                cellsY: number;
                color: string;
            };
            candlesticks: {
                axis: {
                    show: boolean;
                    color: string;
                    strokeWidth: number;
                };
                candle: {
                    color: string;
                    strokeWidth: number;
                };
            };
        };
    };

    export const VueUiSkeleton: DefineComponent<{
        config: VueUiSkeletonConfig
    }>;
}