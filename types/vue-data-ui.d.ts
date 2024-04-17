declare module 'vue-data-ui' {
    import { DefineComponent } from "vue";

    export type VueUiUnknownObj = {
        [key: string]: unknown;
    }

    export const VueDataUi: DefineComponent<{
        dataset?: VueUi3dBarDataset | VueUiAgePyramidDataset | VueUiAnnotatorDataset | Array<Array<string | number>> | VueUiChestnutDatasetRoot[] | VueUiDashboardElement[] | number | VueUiDonutEvolutionDatasetItem[] | VueUiDonutDatasetItem[] | VueUiGaugeDataset | VueUiHeatmapDatasetItem[] | VueUiMoleculeDatasetNode[] | VueUiMoodRadarDataset | VueUiNestedDonutsDatasetItem[] | VueUiOnionDatasetItem[] | VueUiQuadrantDatasetItem[] | VueUiRadarDataset | VueUiRatingDataset | VueUiRelationCircleDatasetItem[] | VueUiRingsDatasetItem[] | VueUiScatterDatasetItem[] | VueUiSparkbarDatasetItem[] | VueUiSparkgaugeDataset | VueUiSparkHistogramDatasetItem[] | VueUiSparklineDatasetItem[] | VueUiSparkStackBarDatasetItem[] | VueUiTableSparklineDatasetItem[] | VueUiTableDataset | VueUiThermometerDataset | VueUiTiremarksDataset | VueUiVerticalBarDatasetItem[] | VueUiWaffleDatasetItem[] | VueUiWheelDataset | VueUiXyDatasetItem[],
        config?: VueUi3dBarConfig | VueUiAgePyramidConfig | VueUiAnnotatorConfig | VueUiCandlestickConfig | VueUiChestnutConfig | VueUiDashboardConfig | VueUiDigitsConfig | VueUiDonutEvolutionConfig | VueUiDonutConfig | VueUiGaugeConfig | VueUiHeatmapConfig | VueUiMiniLoaderConfig | VueUiMoleculeConfig | VueUiMoodRadarConfig | VueUiNestedDonutsConfig | VueUiOnionConfig | VueUiQuadrantConfig | VueUiRadarConfig | VueUiRatingConfig | VueUiRelationCircleConfig | VueUiRingsConfig | VueUiScatterConfig | VueUiScreenshotConfig | VueUiSkeletonConfig | VueUiSmileyConfig | VueUiSparkbarConfig | VueUiSparkgaugeConfig | VueUiSparkHistogramConfig | VueUiSparklineConfig | VueUiSparkStackBarConfig | VueUiTableSparklineConfig | VueUiTableConfig | VueUiThermometerConfig | VueUiTiremarksConfig | VueUiVerticalBarConfig | VueUiWaffleConfig | VueUiWheelConfig | VueUiXyConfig | VueUiKpiConfig;
    }>

    export type VueUiTooltipParams<TDatapoint, TSeries, TConfig, TBar = any, TLine = any, TPlot = any> = {
        seriesIndex?: number;
        series?: TSeries;
        datapoint?: TDatapoint;
        config?: TConfig;
        bars?: TBar;
        lines?: TLine;
        plots?: TPlot;
    }

    export type VueUiTreemapDatasetItem = {
        name: string;
        value: number;
        children?: VueUiTreemapDatasetItem[];
        color?: string;
    };

    export type VueUiTreemapConfig = {
        userOptions?: {
            show?: boolean;
        };
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                height?: number;
                width?: number;
                padding?: {
                    top?: number;
                    left?: number;
                    bottom?: number;
                    right?: number;
                };
                layout?: {
                    sorted?: boolean;
                    rects?: {
                        stroke?: string;
                        strokeWidth?: number;
                        borderRadius?: number;
                        colorRatio?: number;
                        gradient?: {
                            show?: boolean;
                            intensity?: number;
                        };
                        selected?: {
                            stroke?: string;
                            strokeWidth?: number;
                            unselectedOpacity?: number;
                        };
                    };
                    labels?: {
                        showDefaultLabels?: boolean;
                        fontSize?: number;
                        minFontSize?: number;
                        hideUnderProportion?: number;
                        prefix?: string;
                        suffix?: string;
                        rounding?: number;
                    };
                };
                legend?: {
                    backgroundColor?: string;
                    color?: string;
                    show?: boolean;
                    fontSize?: number;
                    bold?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                };
                title?: {
                    text?: string;
                    color?: string;
                    fontSize?: number;
                    bold?: boolean;
                    subtitle?: {
                        color?: string;
                        text?: string;
                        fontSize?: number;
                        bold?: boolean;
                    };
                };
                tooltip?: {
                    show?: boolean;
                    color?: string;
                    backgroundColor?: string;
                    fontSize?: number;
                    roundingValue?: number;
                    customFormat?: (params: VueUiTooltipParams<VueUiTreemapDatapoint, VueUiTreemapSeriesItem[], VueUiTreemapConfig>) => string;
                };
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            columnNames?: {
                series?: string;
                value?: string;
                percentage?: string;
            };
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
            td?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
                roundingValue?: number;
                roundingPercentage?: number;
            };
        };
    };

    export type VueUiTreemapDatapoint = {
        children?: VueUiTreemapDatapoint[];
        color: string;
        id: string;
        name: string;
        normalizedValue: number;
        parentName?: string;
        proportion: number;
        value: number;
        x0: number;
        x1: number;
        y0: number;
        y1: number;
    };

    export type VueUiTreemapSeriesItem = {
        children?: VueUiTreemapSeriesItem[];
        color?: string;
        id?: string;
        name?: string;
        value?: string;
    }

    export const VueUiTreemap: DefineComponent<{
        config?: VueUiTreemapConfig,
        dataset: VueUiTreemapDatasetItem[]
    }>;

    export type VueUiKpiConfig = {
        animationFrames?: number;
        animationValueStart?: number;
        backgroundColor?: string;
        fontFamily?: string;
        layoutClass?: string;
        layoutCss?: string;
        prefix?: string;
        suffix?: string;
        title?: string;
        titleBold?: boolean;
        titleColor?: string;
        titleClass?: string;
        titleCss?: string;
        titleFontSize?: number;
        useAnimation?: boolean;
        valueBold?: boolean;
        valueColor?: string;
        valueClass?: string;
        valueCss?: string;
        valueFontSize?: number;
        valueRounding?: number;
    }

    export const VueUiKpi: DefineComponent<{
        dataset: number,
        config?: VueUiKpiConfig
    }>;

    export type VueUiGalaxyDatasetItem = VueUiDonutDatasetItem;

    export type VueUiGalaxyConfig = {
        useCssAnimation?: boolean;
        useBlurOnHover?: boolean;
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                layout?: {
                    arcs?: {
                        strokeWidth?: number;
                        borderWidth?: number;
                        offsetX?: number;
                        offsetY?: number;
                        hoverEffect?: {
                            show?: boolean;
                            multiplicator?: number;
                        };
                        gradient?: {
                            show?: boolean;
                            intensity?: number;
                            color?: string;
                        };
                    };
                    labels?: {
                        dataLabels?: {
                            prefix?: string;
                            suffix?: string;
                        };
                    };
                };
                legend?: {
                    backgroundColor?: string;
                    color?: string;
                    show?: boolean;
                    fontSize?: number;
                    bold?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                };
                title?: {
                    text?: string;
                    color?: string;
                    fontSize?: number;
                    bold?: boolean;
                    subtitle?: {
                        color?: string;
                        text?: string;
                        fontSize?: number;
                        bold?: boolean;
                    };
                };
                tooltip?: {
                    show?: boolean;
                    color?: string;
                    backgroundColor?: string;
                    fontSize?: number;
                    showValue?: boolean;
                    showPercentage: true,
                    roundingValue?: number;
                    roundingPercentage?: number;
                    customFormat?: (params: VueUiTooltipParams<VueUiGalaxyDatapoint, VueUiGalaxySeriesItem[], VueUiGalaxyConfig>) => string;
                };
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            columnNames?: {
                series?: string;
                value?: string;
                percentage?: string;
            };
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
            td?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
                roundingValue?: number;
                roundingPercentage?: number;
            };
        };
        userOptions?: {
            show?: boolean;
        };
    };

    export type VueUiGalaxyDatapoint = VueUiGalaxyDatasetItem & {
        color: string;
        id: string;
        path: string;
        points: number;
        proportion: number;
        seriesIndex: number;
        value: number;
    }

    export type VueUiGalaxySeriesItem = VueUiGalaxyDatasetItem & {
        id: string;
        color: string;
        seriesIndex: number;
        value: number;
    }

    export const VueUiGalaxy: DefineComponent<{
        config?: VueUiGalaxyConfig,
        dataset: VueUiGalaxyDatasetItem[]
    }>;

    export type VueUiSparkgaugeDataset = {
        value: number;
        min: number;
        max: number;
        title?: string;
    }

    export type VueUiSparkgaugeConfig = {
        style?: {
            fontFamily?: string;
            background?: string;
            height?: number;
            basePosition?: number;
            animation?: {
                show?: boolean;
                speedMs?: number;
            };
            title?: {
                show?: boolean;
                fontSize?: number;
                position?: "top" | "bottom",
                textAlign?: "center" | "left" | "right",
                bold?: boolean;
                color?: string;
            };
            dataLabel?: {
                fontSize?: number;
                autoColor?: boolean;
                color?: string;
                offsetY?: number;
                bold?: boolean;
                rounding?: number;
                prefix?: string;
                suffix?: string;
            };
            colors?: {
                min?: string;
                max?: string;
                showGradient?: boolean;
            };
            track?: {
                autoColor?: boolean;
                color?: string;
                strokeLinecap?: "round" | "square" | "butt";
            };
            gutter?: {
                color?: string;
                strokeLinecap?: "round" | "square" | "butt"
            };
        };
    };

    export const VueUiSparkgauge: DefineComponent<{
        dataset: VueUiSparkgaugeDataset,
        config?: VueUiSparkgaugeConfig
    }>

    export type VueUiMiniLoaderConfig = {
        type?: "line" | "bar" | "onion";
        onion?: {
            gutterColor?: string;
            gutterOpacity?: number;
            gutterBlur?: number;
            trackHueRotate?: number;
            trackBlur?: number;
            trackColor?: string;
        };
        line?: {
            gutterColor?: string;
            gutterOpacity?: number;
            gutterBlur?: number;
            trackHueRotate?: number;
            trackBlur?: number;
            trackColor?: string;
        };
        bar?: {
            gutterColor?: string;
            gutterOpacity?: number;
            gutterBlur?: number;
            trackHueRotate?: number;
            trackBlur?: number;
            trackColor?: string;
        }
    }

    export const VueUiMiniLoader: DefineComponent<{
        config?: VueUiMiniLoaderConfig
    }>

    export const Arrow: DefineComponent<{
        markerEnd?: boolean,
        markerSize?: number,
        markerStart?: boolean,
        stroke?: string,
        strokeDasharray?: number,
        strokeLinecap?: "round" | "butt" | "square",
        strokeWidth?: number,
        x1: number,
        x2: number,
        y1: number,
        y2: number
    }>

    export type VueUiTableSparklineDatasetItem = {
        name: string;
        values: number[];
        color?: string;
    }

    export type VueUiTableSparklineConfig = {
        responsiveBreakpoint?: number;
        showAverage?: boolean;
        showMedian?: boolean;
        showTotal?: boolean;
        roundingAverage?: number;
        roundingMedian?: number;
        roundingValues?: number;
        roundingTotal?: number;
        showSparklines?: boolean;
        fontFamily?: string;
        colNames?: string[];
        sparkline?: {
            useGradient?: boolean;
            showArea?: boolean;
            strokeWidth?: number;
            type?: "line" | "bar",
            smooth?: boolean;
            animation?: {
                show?: boolean;
                animationFrames?: number;
            };
        };
        translations?: {
            serie?: string;
            total?: string;
            average?: string;
            median?: string;
            chart?: string;
        };
        title?: {
            backgroundColor?: string;
            text?: string;
            fontSize?: number;
            color?: string;
            bold?: boolean;
            textAlign?: "left" | "center" | "right";
            subtitle?: {
                text?: string;
                color?: string;
                fontSize?: number;
                bold?: boolean;
            };
        };
        thead?: {
            backgroundColor?: string;
            color?: string;
            fontSize?: number;
            outline?: string;
            textAlign?: "left" | "center" | "right";
            bold?: boolean;
        },
        tbody?: {
            backgroundColor?: string;
            color?: string;
            fontSize?: number;
            outline?: string;
            textAlign?: "left" | "center" | "right";
            bold?: boolean;
        };
        userOptions?: {
            show?: boolean;
        }
    };

    export const VueUiTableSparkline: DefineComponent<{
        dataset: VueUiTableSparklineDatasetItem[],
        config: VueUiTableSparklineConfig
    }>

    export type VueUiMoleculeDatasetNode = {
        name: string;
        details?: string;
        nodes?: VueUiMoleculeDatasetNode[];
    };

    export type VueUiMoleculeConfig = {
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                nodes?: {
                    stroke?: string;
                    strokeHovered?: string;
                };
                links?: {
                    stroke?: string;
                };
                title?: {
                    text?: string;
                    color?: string;
                    fontSize?: number;
                    bold?: boolean;
                    subtitle?: {
                        color?: string;
                        text?: string;
                        fontSize?: number;
                        bold?: boolean;
                    };
                };
                tooltip?: {
                    show?: boolean;
                    color?: string;
                    backgroundColor?: string;
                    fontSize?: number;
                    customFormat?: (params: VueUiTooltipParams<VueUiMoleculeDatapoint, VueUiMoleculeDatapoint[], VueUiMoleculeConfig>) => string;
                };
                zoom?: {
                    speed?: number;
                };
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
            td?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
            translations?: {
                nodeName?: string;
                details?: string;
                parentNode?: string;
            };
        };
        userOptions?: {
            show?: boolean;
        };
    };

    export type VueUiMoleculeDatapoint = {
        circleRadius: number;
        color: string;
        name: string;
        details?: string;
        nodes?: VueUiMoleculeDatapoint;
        parentNode?: VueUiMoleculeDatapoint;
        polygonPath: {
            coordinates: Array<{
                x: number;
                y: number;
            }>
        },
        uid: string;
    }

    export const VueUiMolecule: DefineComponent<{
        dataset: VueUiMoleculeDatasetNode[],
        config?: VueUiMoleculeConfig
    }>

    export type VueUiDigitsConfig = {
        backgroundColor?: string;
        height?: string;
        width?: string;
        digits?: {
            color?: string;
            skeletonColor?: string;
        }
    }

    export const VueUiDigits: DefineComponent<{
        dataset: number,
        config?: VueUiDigitsConfig
    }>;

    export type VueUi3dBarDataset = {
        percentage?: number;
        series?: Array<{
            name: string;
            value: number;
            color?: string;
        }>
    };

    export type VueUi3dBarConfig = {
        style?: {
            fontFamily?: string;
            shape?: "bar" | "tube";
            chart?: {
                animation?: {
                    use?: boolean;
                    speed?: number;
                    acceleration?: number;
                };
                backgroundColor?: string;
                color?: string;
                bar?: {
                    color?: string;
                    stroke?: string;
                    strokeWidth?: number;
                    shadeColor?: string;
                };
                box?: {
                    stroke?: string;
                    strokeWidth?: number;
                    strokeDasharray?: number; 2,
                    dimensions?: {
                        width?: number;
                        height?: number;
                        top?: number;
                        bottom?: number;
                        left?: number;
                        right?: number;
                        perspective?: number;
                    };
                };
                title?: {
                    text?: string;
                    color?: string;
                    fontSize?: number;
                    bold?: boolean;
                    subtitle?: {
                        color?: string;
                        text?: string;
                        fontSize?: number;
                        bold?: boolean;
                    };
                };
                legend?: {
                    backgroundColor?: string;
                    color?: string;
                    show?: boolean;
                    fontSize?: number;
                    bold?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    prefix?: string;
                    suffix?: string;
                    hideUnderPercentage?: number;
                };
                dataLabel?: {
                    show?: boolean;
                    bold?: boolean;
                    color?: string;
                    fontSize?: number;
                    rounding?: number;
                };
            };
        };
        userOptions?: {
            show?: boolean;
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            columnNames?: {
                series?: string;
                value?: string;
                percentage?: string;
            },
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
            td?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
                roundingValue?: number;
                roundingPercentage?: number;
            };
        };
    };

    export const VueUi3dBar: DefineComponent<{
        config?: VueUi3dBarConfig,
        dataset: VueUi3dBarDataset
    }>;

    export type VueUiMoodRadarDataset = {
        "1": number;
        "2": number;
        "3": number;
        "4": number;
        "5": number;
    }

    export type VueUiMoodRadarConfig = {
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                layout?: {
                    grid?: {
                        show?: boolean;
                        stroke?: string;
                        strokeWidth?: number;
                    };
                    outerPolygon?: {
                        stroke?: string;
                        strokeWidth?: number;
                    };
                    dataPolygon?: {
                        color?: string;
                        opacity?: number;
                        gradient?: {
                            show?: boolean;
                            intensity?: number;
                        };
                        stroke?: string;
                        strokeWidth?: number;
                    };
                    smileys?: {
                        strokeWidth?: number;
                        colors?: {
                            "1": string;
                            "2": string;
                            "3": string;
                            "4": string;
                            "5": string;
                        };
                    };
                    dataLabel?: {
                        color?: string;
                        roundingPercentage?: number;
                        roundingValue?: number;
                        bold?: boolean;
                    };
                };
                title?: {
                    text?: string;
                    color?: string;
                    fontSize?: number;
                    bold?: boolean;
                    subtitle?: {
                        color?: string;
                        text?: string;
                        fontSize?: number;
                        bold?: boolean;
                    };
                };
                legend?: {
                    color?: string;
                    backgroundColor?: string;
                    bold?: boolean;
                    show?: boolean;
                    fontSize?: number;
                    roundingPercentage?: number;
                    roundingValue?: number;
                };
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            columnNames?: {
                series?: string;
                value?: string;
                percentage?: string;
            };
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
            td?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
                roundingValue?: number;
                roundingPercentage?: number;
            };
        };
        userOptions?: {
            show?: boolean;
        };
    };

    export const VueUiMoodRadar: DefineComponent<{
        dataset: VueUiMoodRadarDataset,
        config?: VueUiMoodRadarConfig
    }>;

    export type VueUiIconName = "annotator" | "chart3bar" | "chartAgePyramid" | "chartBar" | "chartCandlestick" | "chartChestnut" | "chartDonut" | "chartDonutEvolution" | "chartGauge" | "chartHeatmap" | "chartLine" | "chartMoodbar" | "chartOnion" | "chartQuadrant" | "chartRadar" | "chartRelationCircle" | "chartRings" | "chartScatter" | "chartSparkHistogram" | "chartSparkStackbar" | "chartTable" | "chartThermometer" | "chartTiremarks" | "chartVerticalBar" | "chartWaffle" | "chartWheel" | "close" | "dashboard" | "digit0" | "digit1" | "digit2" | "digit3" | "digit4" | "digit5" | "digit6" | "digit7" | "digit8" | "digit9" | "excel" | "image" | "labelClose" | "labelOpen" | "menu" | "moodFlat" | "moodHappy" | "moodNeutral" | "moodSad" | "pdf" | "screenshot" | "skeleton" | "smiley" | "sort" | "spin" | "star" | "tableClose" | "tableOpen" | "chartNestedDonuts" | "chartSparkbar" | "refresh" | "circleQuestion" | "circleExclamation" | "circleCheck" | "circleCancel" | "moodLaughing" | "moodWink" | "moodEmbarrassed" | "moodSurprised" | "exitFullscreen" | "fullscreen" | "arrowRight" | "arrowTop" | "arrowBottom" | "arromwLeft" | "chartCluster" | "chartSparkline" | "legend" | "csv" | "chartGalaxy" | "kpi" | "kpiBox" | "tooltip" | "vueDataUi" | "ratio" | "func" | "settings" | "trendUp" | "trendDown" | "clipBoard" | "zoomPlus" | "zoomMinus" | "clipboardLine" | "clipboardDonut" | "clipboardBar" | "clipboardVariable" | "triangle" | "triangleFill" | "square" | "squareFill" | "diamond" | "diamondFill" | "pentagon" | "pentagonFill" | "hexagon" | "hexagonFill" | "circle" | "circleFill" | "starFill" | "numbers" | "sigma" | "mu" | "lambda" | "people" | "copy";

    export const VueUiIcon: DefineComponent<{
        name: VueUiIconName,
        stroke?: string,
        strokeWidth?: number,
        size?: number,
        isSpin?: boolean
    }>;

    export type VueUiDonutEvolutionConfig = {
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                layout?: {
                    height?: number;
                    width?: number;
                    padding?: {
                        top?: number;
                        left?: number;
                        right?: number;
                        bottom?: number;
                    };
                    grid?: {
                        show?: boolean;
                        stroke?: string;
                        strokeWidth?: number;
                        showVerticalLines?: boolean;
                        yAxis?: {
                            dataLabels?: {
                                show?: boolean;
                                fontSize?: number;
                                color?: string;
                                roundingValue?: number;
                                offsetX?: number;
                                bold?: boolean;
                                steps?: number;
                            };
                        };
                        xAxis?: {
                            dataLabels?: {
                                show?: boolean;
                                values?: string[];
                                fontSize?: number;
                                showOnlyFirstAndLast?: boolean;
                                color?: string;
                            };
                        };
                    };
                    line?: {
                        show?: boolean;
                        stroke?: string;
                        strokeWidth?: number;
                    };
                    highlighter?: {
                        color?: string;
                        opacity?: number;
                    };
                    dataLabels?: {
                        show?: boolean;
                        fontSize?: number;
                        color?: string;
                        bold?: boolean;
                        rounding?: number;
                        prefix?: string;
                        suffix?: string;
                        offsetY?: number;
                    };
                };
                title?: {
                    text?: string;
                    color?: string;
                    fontSize?: number;
                    bold?: boolean;
                    subtitle?: {
                        color?: string;
                        text?: string;
                        fontSize?: number;
                        bold?: boolean;
                    };
                };
                legend?: {
                    color?: string;
                    backgroundColor?: string;
                    bold?: boolean;
                    show?: boolean;
                    fontSize?: number;
                    roundingPercentage?: number;
                    roundingValue?: number;
                };
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            columnNames?: {
                period?: string;
                total?: string;
            };
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
            td?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
                roundingValue?: number;
                roundingPercentage?: number;
            };
        };
        userOptions?: {
            show?: boolean;
        }
    }

    export type VueUiDonutEvolutionDatasetItem = {
        name: string;
        values: number[];
        color?: string;
    }

    export const VueUiDonutEvolution: DefineComponent<{
        config?: VueUiDonutEvolutionConfig,
        dataset: VueUiDonutEvolutionDatasetItem[]
    }>;

    export type VueUiTiremarksConfig = {
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                animation?: {
                    use?: boolean;
                    speed?: number;
                    acceleration?: number;
                };
                layout?: {
                    display?: "horizontal" | "vertical";
                    crescendo?: boolean;
                    curved?: boolean;
                    curveAngleX?: number;
                    curveAngleY?: number;
                    activeColor?: string;
                    inactiveColor?: string;
                    ticks?: {
                        gradient?: {
                            show?: boolean;
                            shiftHueIntensity?: number;
                        };
                    };
                };
                percentage?: {
                    show?: boolean;
                    useGradientColor?: boolean;
                    color?: string;
                    fontSize?: number;
                    bold?: boolean;
                    rounding?: 1;
                    verticalPosition?: "bottom" | "top";
                    horizontalPosition?: "left" | "right";
                };
                title?: {
                    text?: string;
                    color?: string;
                    fontSize?: number;
                    bold?: boolean;
                    subtitle?: {
                        color?: string;
                        text?: string;
                        fontSize?: number;
                        bold?: boolean;
                    };
                };
            };
        };
    };

    export type VueUiTiremarksDataset = {
        percentage: number;
    }

    export const VueUiTiremarks: DefineComponent<{
        config?: VueUiTiremarksConfig,
        dataset: VueUiTiremarksDataset
    }>;

    export type VueUiWheelConfig = {
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                animation?: {
                    use?: boolean;
                    speed?: number;
                    acceleration?: number;
                };
                layout?: {
                    wheel?: {
                        ticks?: {
                            rounded?: boolean;
                            inactiveColor?: string;
                            activeColor?: string;
                            gradient?: {
                                show?: boolean;
                                shiftHueIntensity?: number;
                            };
                        };
                    };
                    innerCircle?: {
                        show?: boolean;
                        stroke?: string;
                        strokeWidth?: number;
                    };
                    percentage?: {
                        show?: boolean;
                        fontSize?: number;
                        rounding?: number;
                        bold?: boolean;
                    };
                };
                title?: {
                    text?: string;
                    color?: string;
                    fontSize?: number;
                    bold?: boolean;
                    subtitle?: {
                        color?: string;
                        text?: string;
                        fontSize?: number;
                        bold?: boolean;
                    };
                };
            };
        };
        userOptions?: {
            show?: boolean;
            title?: string;
        };
    };

    export type VueUiWheelDataset = {
        percentage: number;
    }

    export const VueUiWheel: DefineComponent<{
        dataset: VueUiWheelDataset,
        config?: VueUiWheelConfig
    }>;

    export type VueUiRingsConfig = {
        useCssAnimation?: boolean;
        useBlurOnHover?: boolean;
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                layout?: {
                    labels?: {
                        dataLabels?: {
                            prefix?: string;
                            suffix?: string;
                        };
                    };
                    rings?: {
                        strokeWidth?: number;
                        stroke?: string;
                        gradient?: {
                            show?: boolean;
                            intensity?: number;
                            underlayerColor?: string;
                        };
                        useShadow?: boolean;
                    };
                };
                legend?: {
                    backgroundColor?: string;
                    color?: string;
                    show?: boolean;
                    fontSize?: number;
                    bold?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                };
                title?: {
                    text?: string;
                    color?: string;
                    fontSize?: number;
                    bold?: boolean;
                    subtitle?: {
                        color?: string;
                        text?: string;
                        fontSize?: number;
                        bold?: boolean;
                    };
                };
                tooltip?: {
                    show?: boolean;
                    color?: string;
                    backgroundColor?: string;
                    fontSize?: number;
                    showValue?: boolean;
                    showPercentage?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    customFormat?: (params: VueUiTooltipParams<VueUiRingsDatapoint, VueUiRingsDatapoint[], VueUiRingsConfig>) => string;
                };
            };
        };
        userOptions?: {
            show?: boolean;
            title?: string;
            labels?: {
                showTable?: string;
            };
        };
        table?: {
            show?: string;
            responsiveBreakpoint?: number;
            columnNames?: {
                series?: string;
                value?: string;
                percentage?: string;
            }
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
            td?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
                roundingValue?: number;
                roundingPercentage?: number;
            };
        };
    };

    export type VueUiRingsDatapoint = {
        color: string;
        name: string;
        percentage: number;
        proportion: number;
        strokeWidth: number;
        uid: string;
        value: number;
    };

    export type VueUiRingsDatasetItem = {
        name: string;
        color?: string;
        values: number[];
    }

    export const VueUiRings: DefineComponent<{
        config?: VueUiRingsConfig,
        dataset: VueUiRingsDatasetItem[]
    }>

    export type VueUiSparkHistogramConfig = {
        style?: {
            backgroundColor?: string;
            fontFamily?: string;
            animation?: {
                show?: boolean;
                speedMs?: number;
            };
            layout?: {
                height?: number;
                width?: number;
                padding?: {
                    top?: number;
                    right?: number;
                    left?: number;
                    bottom?: number;
                };
            };
            bars?: {
                shape?: "circle" | "triangle" | "square" | "diamond" | "pentagon" | "hexagon" | "star";
                strokeWidth?: number;
                colors?: {
                    positive?: number;
                    negative?: number;
                    gradient?: {
                        show?: boolean;
                    };
                };
                borderRadius?: number;
                gap?: number;
            };
            labels?: {
                value?: {
                    fontSize?: number;
                    color?: string;
                    bold?: boolean;
                    rounding?: number;
                    prefix?: string;
                    suffix?: string;
                    offsetY?: number;
                };
                valueLabel?: {
                    fontSize?: number;
                    color?: string;
                    bold?: boolean;
                    rounding?: number;
                };
                timeLabel?: {
                    fontSize?: number;
                    color?: string;
                    bold?: boolean;
                };
            };
            selector?: {
                stroke?: string;
                strokeDasharray?: number;
                strokeWidth?: number;
                borderRadius?: number;
            };
            title?: {
                textAlign?: "left" | "right" | "center";
                text?: string;
                color?: string;
                fontSize?: number;
                bold?: boolean;
                margin?: string;
                subtitle?: {
                    color?: string;
                    text?: string;
                    fontSize?: number;
                    bold?: boolean;
                };
            };
        };
    };

    export type VueUiSparkHistogramDatasetItem = {
        intensity?: number & { 0: 0; 1: 1 };
        gradient?: string;
        height?: number;
        proportion?: number;
        stroke?: string;
        textAnchor?: number;
        timeLabel?: string;
        trapX?: number;
        unitWidth?: number;
        value?: number;
        valueLabel?: string;
        width?: number;
        x?: number;
        y?: number;
    }

    export const VueUiSparkHistogram: DefineComponent<{
        config?: VueUiSparkHistogramConfig,
        dataset: VueUiSparkHistogramDatasetItem[]
    }>;

    export type VueUiSparkStackBarConfig = {
        style?: {
            backgroundColor?: string;
            fontFamily?: string;
            animation?: {
                show?: boolean;
                animationFrames?: number;
            };
            bar?: {
                gradient?: {
                    show?: boolean;
                    intensity?: number;
                    underlayerColor?: string;
                };
            };
            legend?: {
                textAlign?: "left" | "right" | "center";
                show?: boolean;
                margin?: string;
                fontSize?: number;
                name?: {
                    color?: string;
                    bold?: boolean;
                };
                value?: {
                    show?: boolean;
                    color?: string;
                    bold?: boolean;
                    prefix?: string;
                    suffix?: string;
                    rounding?: number;
                };
                percentage?: {
                    show?: boolean;
                    color?: string;
                    bold?: boolean;
                    rounding?: number;
                };
            };
            title?: {
                textAlign?: "left" | "center" | "right";
                text?: string;
                color?: string;
                fontSize?: number;
                bold?: boolean;
                margin?: string;
                subtitle?: {
                    color?: string;
                    text?: string;
                    fontSize?: number;
                    bold?: boolean;
                };
            };
        };
    };

    export type VueUiSparkStackBarDatasetItem = {
        name: string;
        color?: string;
        proportion?: number;
        proportionLabel?: string;
        start?: number;
        value?: number;
        width?: number;
    }

    export const VueUiSparkstackbar: DefineComponent<{
        config?: VueUiSparkStackBarConfig,
        dataset: VueUiSparkStackBarDatasetItem[]
    }>;

    export type VueUiThermometerConfig = {
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                height?: number;
                thermometer?: {
                    width?: number;
                };
                padding?: {
                    top?: number;
                    bottom?: number;
                    left?: number;
                    right?: number;
                };
                graduations?: {
                    show?: boolean;
                    sides?: "left" | "right" | "both" | "none";
                    height?: number;
                    stroke?: string;
                    strokeWidth?: number;
                    showIntermediate?: boolean;
                    gradient?: {
                        show?: boolean;
                        intensity?: number;
                    };
                };
                animation?: {
                    use?: boolean;
                    speedMs?: number;
                };
                label?: {
                    fontSize?: number;
                    rounding?: number;
                    bold?: boolean;
                    prefix?: string;
                    suffix?: string;
                };
            };
            title?: {
                useDiv?: boolean;
                text?: string;
                color?: string;
                fontSize?: number;
                bold?: boolean;
                subtitle?: {
                    color?: string;
                    text?: string;
                    fontSize?: number;
                    bold?: boolean;
                };
            };
        };
        userOptions?: {
            show?: boolean;
            title?: string;
            labels?: {
                useDiv?: string;
            };
        };
    };

    export type VueUiThermometerDataset = {
        value: number;
        from: number;
        to: number;
        steps?: number;
        colors?: {
            from?: string;
            to?: string;
        }
    }

    export const VueUiThermometer: DefineComponent<{
        config?: VueUiThermometerConfig,
        dataset: VueUiThermometerDataset
    }>;

    export type VueUiRelationCircleConfig = {
        style?: {
            color?: string;
            backgroundColor?: string;
            fontFamily?: string;
            size?: number;
            limit?: number;
            animation?: {
                show?: boolean;
                speedMs?: number;
            };
            labels?: {
                color?: string;
                fontSize?: number;
            };
            links?: {
                curved?: boolean;
                maxWidth?: number;
            };
            circle?: {
                radiusProportion?: number;
                stroke?: string;
                strokeWidth?: number;
                offsetY?: number;
            };
            plot?: {
                radius?: number;
                color?: string;
            };
            title?: {
                useDiv?: boolean;
                text?: string;
                color?: string;
                fontSize?: number;
                bold?: boolean;
                subtitle?: {
                    color?: string;
                    text?: string;
                    fontSize?: number;
                    bold?: boolean;
                };
            };
        };
        userOptions?: {
            show?: boolean;
            title?: string;
        }
    };

    export type VueUiRelationCircleDatasetItem = {
        id: string | number;
        label: string;
        relations: Array<string | number>;
        weights?: number[];
        color?: string;
    }

    export const VueUiRelationCircle: DefineComponent<{
        config?: VueUiRelationCircleConfig,
        dataset: VueUiRelationCircleDatasetItem[]
    }>;

    export type VueUiAnnotatorConfig = {
        style?: {
            backgroundColor?: string;
            color?: string;
            fixedTools?: boolean;
            fontFamily?: string;
            hideWhenFolded?: boolean;
            showPrint?: boolean;
            showSave?: boolean;
            showTooltips?: boolean;
            buttons?: {
                borderRadius?: number;
                controls?: {
                    backgroundColor?: string;
                    color?: string;
                    border?: string;
                    selected?: {
                        backgroundColor?: string;
                        color?: string;
                        border?: string;
                    };
                };
                shapes?: {
                    backgroundColor?: string;
                    color?: string;
                    border?: string;
                    selected?: {
                        backgroundColor?: string;
                        color?: string;
                        border?: string;
                    };
                };
            };
            tooltips?: {
                backgroundColor?: string;
                color?: string;
                border?: string;
                borderRadius?: number;
                boxShadow?: string;
            };
        };
        translations?: {
            colorAlpha?: string;
            dashedLines?: string;
            filled?: string;
            fontSize?: string;
            thickness?: string;
            title?: string;
            tooltipGroup?: string;
            tooltipDelete?: string;
            tooltipMove?: string;
            tooltipResize?: string;
            tooltipBringToFront?: string;
            tooltipBringToBack?: string;
            tooltipDuplicate?: string;
            tooltipUndo?: string;
            tooltipPdf?: string;
            tooltipSave?: string;
            tooltipShapeCircle?: string;
            tooltipShapeRect?: string;
            tooltipShapeArrow?: string;
            tooltipShapeFreehand?: string;
            tooltipShapeText?: string;
            tooltipShapeTextLeft?: string;
            tooltipShapeTextCenter?: string;
            tooltipShapeTextRight?: string;
            tooltipShapeTextBullet?: string;
            tooltipShapeTextBold?: string;
            tooltipShapeTextItalic?: string;
            tooltipShapeTextUnderline?: string;
            tooltipShapeColor?: string;
        }
    }

    export type VueUiAnnotatorDataset = VueUiUnknownObj;

    export const VueUiAnnotator: DefineComponent<{
        config?: VueUiAnnotatorConfig,
        dataset: VueUiAnnotatorDataset
    }>

    export type VueUiDashboardConfig = {
        style?: {
            board?: {
                backgroundColor?: string;
                color?: string;
                aspectRatio?: string;
                border?: string;
            };
            item?: {
                backgroundColor?: string;
                borderColor?: string;
            };
            resizeHandles?: {
                backgroundColor?: string;
                border?: string;
            };
        };
        allowPrint?: boolean;
    }

    export type VueUiDashboardElement = {
        id: number | string;
        width: number;
        height: number;
        left: number;
        top: number;
        component: string;
        props: {
            config?: VueUiUnknownObj;
            dataset: VueUiUnknownObj;
        }
    }

    export const VueUiDashboard: DefineComponent<{
        config?: VueUiDashboardConfig,
        dataset: VueUiDashboardElement[]
    }>;

    export type VueUiSparkbarDatasetItem = {
        name: string;
        value: number;
        suffix?: string;
        prefix?: string;
        rounding?: string;
        color?: string;
    }

    export type VueUiSparkbarConfig = {
        style?: {
            backgroundColor?: string;
            fontFamily?: string;
            animation?: {
                show?: boolean;
                animationFrames?: number;
            };
            layout?: {
                independant?: boolean;
                percentage?: boolean;
                target?: number;
            };
            gutter?: {
                backgroundColor?: string;
                opacity?: number;
            };
            bar?: {
                gradient?: {
                    show?: boolean;
                    intensity?: number;
                    underlayerColor?: string;
                };
            };
            labels?: {
                fontSize?: number;
                name?: {
                    position?: "top" | "left" | "right";
                    width?: string;
                    color?: string;
                    bold?: boolean;
                };
                value?: {
                    show?: boolean;
                    bold?: boolean;
                }
            },
            gap?: number;
        }
    };

    export const VueUiSparkbar: DefineComponent<{
        config?: VueUiSparkbarConfig,
        dataset: VueUiSparkbarDatasetItem[]
    }>;

    export type VueUiAgePyramidDataset = Array<Array<string | number>>;

    export type VueUiAgePyramidConfig = {
        style?: {
            backgroundColor?: string;
            color?: string;
            fontFamily?: string;
            height?: number;
            width?: number;
            layout?: {
                useDiv?: boolean;
                padding?: {
                    top?: number;
                    right?: number;
                    bottom?: number;
                    left?: number;
                };
                grid?: {
                    show?: boolean;
                    stroke?: string;
                    strokeWidth?: number;
                };
                dataLabels?: {
                    sideTitles?: {
                        show?: boolean;
                        fontSize?: number;
                        color?: string;
                        useSideColor?: boolean;
                        bold?: boolean;
                        offsetY?: number;
                    };
                    xAxis?: {
                        show?: boolean;
                        fontSize?: number;
                        color?: string;
                        bold?: boolean;
                        scale?: number;
                        translation?: string;
                    };
                    yAxis?: {
                        show?: boolean;
                        display?: string;
                        fontSize?: number;
                        color?: string;
                        bold?: boolean;
                        showEvery?: number;
                    };
                };
                centerSlit?: {
                    width?: number;
                };
                bars?: {
                    gap?: number;
                    borderRadius?: number;
                    left?: {
                        color?: string;
                    };
                    right?: {
                        color?: string;
                    };
                    gradient?: {
                        show?: boolean;
                        underlayer?: string;
                        intensity?: number;
                        shiftHue?: number;
                    };
                };
            };
            highlighter?: {
                color?: string;
                opacity?: number;
            };
            title?: {
                text?: string;
                color?: string;
                fontSize?: number;
                bold?: boolean;
                subtitle?: {
                    color?: string;
                    text?: string;
                    fontSize?: number;
                    bold?: boolean;
                };
            };
            tooltip?: {
                show?: boolean;
                backgroundColor?: string;
                color?: string;
                fontSize?: number;
                roundingValue?: number;
                customFormat?: (params: VueUiTooltipParams<VueUiAgePyramidDatapoint, VueUiAgePyramidSeries[], VueUiAgePyramidConfig>) => string;
            };
        };
        translations?: {
            age?: string;
            male?: string;
            female?: string;
            total?: string;
            year?: string;
        };
        userOptions?: {
            show?: boolean;
            title?: string;
            labels?: {
                useDiv?: string;
                showTable?: string;
            };
        };
        table?: {
            show?: boolean;
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
            td?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
        };
    };

    export type VueUiAgePyramidDatapoint = {
        index: number;
        left: number;
        right: number;
        segment: string;
    };

    export type VueUiAgePyramidSideData = {
        color: string;
        height: number;
        proportionToMax: number;
        value: number;
        width: number;
        y: number;
        x: number;
    };

    export type VueUiAgePyramidSeries = {
        age: number;
        left: VueUiAgePyramidSideData;
        right: VueUiAgePyramidSideData;
        segment: string;
    };

    export const VueUiAgePyramid: DefineComponent<{
        config?: VueUiAgePyramidConfig,
        dataset: VueUiAgePyramidDataset
    }>;

    export type VueUiCandlestickConfig = {
        useCssAnimation?: boolean;
        style?: {
            backgroundColor?: string;
            color?: string;
            fontFamily?: string;
            height?: number;
            width?: number;
            layout?: {
                useDiv?: boolean;
                padding?: {
                    top?: number;
                    right?: number;
                    bottom?: number;
                    left?: number;
                };
                selector?: {
                    color?: string;
                    opacity?: number;
                };
                grid?: {
                    show?: boolean;
                    stroke?: string;
                    strokeWidth?: number;
                    xAxis?: {
                        dataLabels?: {
                            show?: boolean;
                            fontSize?: number;
                            color?: string;
                            offsetY?: number;
                            bold?: boolean;
                        };
                    };
                    yAxis?: {
                        dataLabels?: {
                            show?: boolean;
                            fontSize?: number;
                            color?: string;
                            roundingValue?: number;
                            offsetX?: number;
                            bold?: boolean;
                            steps?: number;
                            prefix?: string;
                            suffix?: string;
                        };
                    };
                };
                wick?: {
                    stroke?: string;
                    strokeWidth?: number;
                    extremity?: {
                        shape?: string;
                        size?: string | number;
                        color?: string;
                    };
                };
                candle?: {
                    borderRadius?: number;
                    stroke?: string;
                    strokeWidth?: number;
                    colors?: {
                        bearish?: string;
                        bullish?: string;
                    };
                    gradient?: {
                        show?: boolean;
                        intensity?: number;
                        underlayer?: string;
                    };
                    widthRatio?: number;
                };
            };
            zoom?: {
                show?: boolean;
                color?: string;
            };
            title?: {
                text?: string;
                color?: string;
                fontSize?: number;
                bold?: boolean;
                subtitle?: {
                    color?: string;
                    text?: string;
                    fontSize?: number;
                    bold?: boolean;
                };
            };
            tooltip?: {
                show?: boolean;
                backgroundColor?: string;
                color?: string;
                fontSize?: number;
                roundingValue?: number;
                prefix?: string;
                suffix?: string;
                customFormat?: (params: VueUiTooltipParams<VueUiCandlestickDatapoint, VueUiCandlestickDatapoint[], VueUiCandlestickConfig>) => string;
            };
        };
        translations?: {
            period?: string;
            open?: string;
            high?: string;
            low?: string;
            last?: string;
            volume?: string;
        };
        userOptions?: {
            show?: boolean;
            title?: string;
            labels?: {
                useDiv?: string;
                showTable?: string;
                showPlotLabels?: string;
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
            td?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
                roundingValue?: number;
                prefix?: string;
                suffix?: string;
            };
        };
    };

    export type VueUiCandlestickDatapoint = {
        high: { x: number; y: number; value: number };
        isBullish: boolean;
        last: { x: number; y: number; value: number };
        low: { x: number; y: number; value: number };
        open: { x: number; y: number; value: number };
        period: string | undefined;
        volume: number;
    };

    export const VueUiCandlestick: DefineComponent<{
        config?: VueUiCandlestickConfig,
        dataset: Array<Array<string | number>>
    }>;

    export type VueUiScatterDatasetValueItem = {
        name: string;
        x: number;
        y: number;
        shape?: "circle" | "triangle" | "square" | "diamond" | "pentagon" | "hexagon" | "star";
        weight?: number;
    }

    export type VueUiScatterDatasetItem = {
        name: string;
        values: VueUiScatterDatasetValueItem[];
        color: string;
    }

    export type VueUiScatterConfig = {
        useCssAnimation?: boolean;
        style?: {
            backgroundColor?: string;
            color?: string;
            fontFamily?: string;
            layout?: {
                useDiv?: boolean;
                height?: number;
                width?: number;
                padding?: {
                    top?: number;
                    right?: number;
                    bottom?: number;
                    left?: number;
                };
                axis?: {
                    show?: boolean;
                    stroke?: string;
                    strokeWidth?: number;
                };
                plots?: {
                    radius?: number;
                    stroke?: string;
                    strokeWidth?: number;
                    opacity?: number;
                    significance?: {
                        show?: boolean;
                        deviationThreshold?: number;
                        opacity?: number;
                    };
                    deviation?: {
                        translation?: string;
                        roundingValue?: number;
                    };
                    giftWrap?: {
                        show?: boolean;
                        strokeWidth?: number;
                        strokeDasharray?: number;
                        fillOpacity?: number;
                    };
                };
                correlation?: {
                    show?: boolean;
                    strokeDasharray?: number;
                    strokeWidth?: number;
                    label?: {
                        show?: boolean;
                        fontSize?: number;
                        color?: string;
                        bold?: boolean;
                        roundingValue?: number;
                        useSerieColor?: number;
                    };
                };
                dataLabels?: {
                    xAxis?: {
                        name?: string;
                        show?: boolean;
                        fontSize?: number;
                        color?: string;
                        bold?: boolean;
                        offsetX?: number;
                        offsetY?: number;
                        roundingValue?: number;
                    };
                    yAxis?: {
                        name?: string;
                        show?: boolean;
                        fontSize?: number;
                        color?: string;
                        bold?: boolean;
                        offsetY?: number;
                        offsetX?: number;
                        roundingValue?: number;
                    };
                };
            };
            title?: {
                text?: string;
                color?: string;
                fontSize?: number;
                bold?: boolean;
                subtitle?: {
                    color?: string;
                    text?: string;
                    fontSize?: number;
                    bold?: boolean;
                };
            };
            legend?: {
                show?: boolean;
                backgroundColor?: string;
                color?: string;
                fontSize?: string;
                bold?: boolean;
                roundingValue?: number;
            };
            tooltip?: {
                show?: boolean;
                backgroundColor?: string;
                color?: string;
                fontSize?: number;
                roundingValue?: number;
                showShape?: boolean;
                customFormat?: (params: VueUiTooltipParams<VueUiScatterDatapoint, VueUiScatterSeries[], VueUiScatterConfig>) => string
            };
        };
        userOptions?: {
            show?: boolean;
            title?: string;
            labels?: {
                useDiv?: string;
                showTable?: string;
                showPlotLabels?: string;
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
            td?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
                roundingValue?: number;
                roundingAverage?: number;
            };
            translations?: {
                correlationCoefficient?: string;
                nbrPlots?: string;
                average?: string;
                series?: string;
            };
        };
    };

    export type VueUiScatterDatapoint = {
        clusterName: string | undefined;
        color: string;
        deviation: number;
        id: string;
        shape: "circle" | "triangle" | "square" | "diamond" | "pentagon" | "hexagon" | "star" | null;
        v: {
            x: number;
            y: number;
            name: string;
            weight?: number;
        }
        x: number;
        y: number;
    };

    export type VueUiScatterSeries = {
        color: string;
        correlation: {
            x1: number;
            x2: number;
            y1: number;
            y2: number;
            coefficient: number;
        };
        id: string;
        label: { x: number; y: number; };
        name: string;
        opacity: number;
        plots: VueUiScatterDatapoint[];
        shape: "circle" | "triangle" | "square" | "diamond" | "pentagon" | "hexagon" | "star" | null;
        values: Array<{ x: number; y: number; name: string; }>
    };

    export const VueUiScatter: DefineComponent<{
        config?: VueUiScatterConfig,
        dataset: VueUiScatterDatasetItem[]
    }>;

    export type VueUiHeatmapConfig = {
        style?: {
            backgroundColor?: string;
            color?: string;
            fontFamily?: string;
            layout?: {
                useDiv?: boolean;
                padding?: {
                    top?: number;
                    right?: number;
                    bottom?: number;
                    left?: number;
                };
                cells?: {
                    height?: number;
                    value?: {
                        show?: boolean;
                        fontSize?: number;
                        bold?: boolean;
                        roundingValue?: number;
                        color?: string;
                    };
                    colors?: {
                        hot?: string;
                        cold?: string;
                        underlayer?: string;
                    };
                    spacing?: number;
                    selected?: {
                        border?: number;
                        color?: string;
                    };
                };
                dataLabels?: {
                    prefix?: string;
                    suffix?: string;
                    xAxis?: {
                        show?: boolean;
                        values?: Array<string | number>;
                        fontSize?: number;
                        color?: string;
                        bold?: boolean;
                        offsetX?: number;
                        offsetY?: number;
                    };
                    yAxis?: {
                        show?: boolean;
                        values?: Array<string | number>
                        fontSize?: number;
                        color?: string;
                        bold?: boolean;
                        offsetY?: number;
                        offsetX?: number;
                    };
                };
            };
            title?: {
                text?: string;
                color?: string;
                fontSize?: number;
                bold?: boolean;
                subtitle?: {
                    color?: string;
                    text?: string;
                    fontSize?: number;
                    bold?: boolean;
                };
            };
            legend?: {
                show?: boolean;
                backgroundColor?: string;
                color?: string;
                fontSize?: number;
                bold?: boolean;
                roundingValue?: number;
                position?: "right" | "bottom";
                scaleBorderRadius?: number;
            };
            tooltip?: {
                show?: boolean;
                backgroundColor?: string;
                color?: string;
                fontSize?: number;
                roundingValue?: number;
                customFormat?: (params: VueUiTooltipParams<VueUiHeatmapDatapoint, VueUiHeatmapRow[], VueUiHeatmapConfig>) => string;
            };
        };
        userOptions?: {
            show?: boolean;
            title?: string;
            labels?: {
                useDiv?: string;
                showTable?: string;
                showPlotLabels?: string;
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            colNames?: {
                xAxis?: string;
            };
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
            td?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
                roundingValue?: number;
            };
        };
    };

    export type VueUiHeatmapDatapoint = {
        color: string;
        id: string;
        ratio: number;
        side: "up" | "down";
        value: number;
        xAxisName: string | undefined;
        yAxisName: string | undefined;
    };

    export type VueUiHeatmapRow = {
        name: string;
        temperatures: VueUiHeatmapDatapoint[];
        values: number[];
    }

    export type VueUiHeatmapDatasetItem = {
        name: string;
        values: number[];
    }

    export const VueUiHeatmap: DefineComponent<{
        config?: VueUiHeatmapConfig,
        dataset: VueUiHeatmapDatasetItem[]
    }>;

    export type VueUiXyConfig = {
        useCanvas?: boolean;
        useCssAnimation?: boolean;
        chart?: {
            fontFamily?: string;
            backgroundColor?: string;
            color?: string;
            height?: number;
            width?: number;
            zoom?: {
                show?: boolean;
                color?: string;
            };
            padding?: {
                top?: number;
                right?: number;
                bottom?: number;
                left?: number;
            };
            highlighter?: {
                color?: string;
                opacity?: number;
            };
            highlightArea?: {
                show?: boolean;
                from?: number;
                to?: number;
                color?: string;
                opacity?: number;
                caption?: {
                    text?: string;
                    fontSize?: number;
                    color?: number;
                    bold?: boolean;
                    offsetY?: boolean;
                    width?: "auto" | number;
                    textAlign?: "left" | "center" | "right";
                };
            };
            grid?: {
                stroke?: string;
                showVerticalLines?: boolean;
                labels?: {
                    color?: string;
                    show?: boolean;
                    fontSize?: number;
                    axis?: {
                        yLabel?: string;
                        xLabel?: string;
                        fontSize?: number;
                    };
                    xAxisLabels?: {
                        color?: string;
                        show?: boolean;
                        values?: string[];
                        fontSize?: number;
                        showOnlyFirstAndLast?: boolean;
                        yOffset?: number;
                    };
                };
            };
            labels?: {
                fontSize?: number;
                prefix?: string;
                suffix?: string;
            };
            legend?: {
                color?: string;
                show?: boolean;
                useDiv?: boolean;
                fontSize?: number;
            };
            title?: {
                show?: boolean;
                useDiv?: boolean;
                color?: string;
                text?: string;
                fontSize?: number;
                bold?: boolean;
                offsetX?: number;
                offsetY?: number;
                subtitle?: {
                    fontSize?: number;
                    color?: string;
                    text?: string;
                };
            };
            tooltip?: {
                color?: string;
                backgroundColor?: string;
                show?: boolean;
                showValue?: boolean;
                showPercentage?: boolean;
                roundingValue?: number;
                roundingPercentage?: number;
                customFormat?: (params: VueUiTooltipParams<VueUiXyDatapointItem[], VueUiXySeries, VueUiXyConfig, VueUiXyDatasetBarItem[], VueUiXyDatasetLineItem[], VueUiXyDatasetPlotItem[]>) => string;
            };
            userOptions?: {
                show?: boolean;
                title?: string;
                labels?: {
                    dataLabels?: string;
                    titleInside?: string;
                    legendInside?: string;
                    showTable?: string;
                };
            };
        };
        bar?: {
            borderRadius?: number;
            useGradient?: boolean;
            labels?: {
                show?: boolean;
                offsetY?: number;
                rounding?: number;
                color?: string;
            };
            serieName?: {
                abbreviationSize?: boolean;
                bold?: boolean;
                color?: string;
                offsetY?: boolean;
                show?: boolean;
                useAbbreviation?: boolean;
                useSerieColor?: boolean;
            };
        };
        line?: {
            radius?: number;
            useGradient?: boolean;
            strokeWidth?: number;
            labels?: {
                show?: boolean;
                offsetY?: number;
                rounding?: number;
                color?: string;
            };
            area?: {
                useGradient?: boolean;
                opacity?: number;
            }
        };
        plot?: {
            radius?: number;
            useGradient?: boolean;
            labels?: {
                show?: boolean;
                offsetY?: number;
                rounding?: number;
                color?: string;
            };
        };
        table?: {
            rounding?: number;
            responsiveBreakpoint?: number;
            sparkline?: boolean;
            columnNames?: {
                period?: string;
                total?: string;
            };
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
            td?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
        };
        showTable?: boolean;
    };

    export type VueUiXyDatasetItem = {
        name: string;
        series: number[];
        type: "bar" | "line" | "plot";
        color?: string;
        dashed?: boolean;
        useTag?: "start" | "end";
        useArea?: boolean;
        dataLabels?: boolean;
        useProgression?: boolean;
    };

    export type VueUiXyDatasetBarItem = {
        absoluteValues: number[];
        color: string;
        id: string;
        name: string;
        plots: Array<{ x: number; y: number; value: number }>;
        series: number[];
        type: "bar";
    }

    export type VueUiXyDatasetLineItem = {
        absoluteValues: number[];
        area: string;
        color: string;
        curve: string;
        dataLabels: boolean;
        id: string;
        name: string;
        plots: Array<{ x: number; y: number; value: number }>;
        series: number[];
        shape: "circle" | "triangle" | "square" | "diamond" | "pentagon" | "hexagon" | "star" | null;
        type: "line";
        useArea: boolean;
        useProgression: boolean;
        smooth?: boolean;
        useTag?: boolean;
    }

    export type VueUiXyDatasetPlotItem = {
        absoluteValues: number[];
        color: string;
        id: string;
        name: string;
        plots: Array<{ x: number; y: number; value: number }>;
        series: number[];
        shape: "circle" | "triangle" | "square" | "diamond" | "pentagon" | "hexagon" | "star" | null;
        type: "plot";
        useTag?: boolean;
        useProgression?: boolean;
    }

    export type VueUiXySeries = Array<VueUiXyDatasetBarItem | VueUiXyDatasetLineItem | VueUiXyDatasetPlotItem>;

    export type VueUiXyDatapointItem = {
        color: string;
        name: string;
        shape: "circle" | "triangle" | "square" | "diamond" | "pentagon" | "hexagon" | "star" | null;
        type: "bar" | "line" | "plot";
        value: number;
    }

    export const VueUiXy: DefineComponent<{
        config?: VueUiXyConfig,
        dataset: VueUiXyDatasetItem[]
    }>

    export type VueUiDonutConfig = {
        useCssAnimation?: boolean;
        useBlurOnHover?: boolean;
        style?: {
            fontFamily?: string;
            chart?: {
                useGradient?: boolean;
                gradientIntensity?: number;
                backgroundColor?: string;
                color?: string;
                layout?: {
                    useDiv?: boolean;
                    labels?: {
                        dataLabels?: {
                            show?: boolean;
                            hideUnderValue?: number;
                            prefix?: string;
                            suffix?: string;
                        };
                        value?: {
                            rounding?: number;
                            show?: boolean;
                        };
                        percentage?: {
                            color?: string;
                            bold?: boolean;
                            fontSize?: number;
                        };
                        name?: {
                            color?: string;
                            bold?: boolean;
                            fontSize?: number;
                        };
                        hollow?: {
                            total?: {
                                show?: boolean;
                                bold?: boolean;
                                fontSize?: number;
                                color?: string;
                                text?: string;
                                offsetY?: number;
                                value?: {
                                    color?: string;
                                    fontSize?: number;
                                    bold?: boolean;
                                    suffix?: string;
                                    prefix?: string;
                                    offsetY?: number;
                                    rounding?: number;
                                };
                            };
                            average?: {
                                show?: boolean;
                                bold?: boolean;
                                fontSize?: number;
                                color?: string;
                                text?: string;
                                offsetY?: number;
                                value?: {
                                    color?: string;
                                    fontSize?: number;
                                    bold?: boolean;
                                    suffix?: string;
                                    prefix?: string;
                                    offsetY?: number;
                                    rounding?: number;
                                };
                            };
                        };
                    };
                    donut?: {
                        borderWidth?: number;
                        strokeWidth?: number;
                    };
                };
                legend?: {
                    backgroundColor?: string;
                    color?: string;
                    show?: boolean;
                    fontSize?: number;
                    bold?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                };
                title?: {
                    text?: string;
                    color?: string;
                    fontSize?: number;
                    bold?: boolean;
                    subtitle?: {
                        color?: string;
                        text?: string;
                        fontSize?: number;
                        bold?: boolean;
                    };
                };
                tooltip?: {
                    show?: boolean;
                    color?: string;
                    backgroundColor?: string;
                    fontSize?: number;
                    showValue?: boolean;
                    showPercentage?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    customFormat?: (params: VueUiTooltipParams<VueUiDonutDatapoint, VueUiDonutSeriesItem[], VueUiDonutConfig>) => string;
                };
            };
        };
        userOptions?: {
            show?: boolean;
            title?: string;
            labels?: {
                dataLabels?: string;
                useDiv?: string;
                showTable?: string;
            };
        };
        translations?: {
            total?: string;
            average?: string;
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            columnNames?: {
                series?: string;
                value?: string;
                percentage?: string;
            },
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
            td?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
                roundingValue?: number;
                roundingPercentage?: number;
            };
        };
    };

    export type VueUiDonutDatasetItem = {
        name: string;
        color?: string;
        values: number[];
    };

    export type VueUiDonutDatapoint = {
        absoluteValues: number[];
        arcSlice: string;
        center: { startX: number; startY: number; endX: number; endY: number; path: string };
        color: string;
        cx: number;
        cy: number;
        endX: number;
        endY: number;
        name: string;
        path: string;
        proportion: number;
        ratio: number;
        seriesIndex: number;
        startX: number;
        startY: number;
        value: number;
    };

    export type VueUiDonutSeriesItem = VueUiDonutDatasetItem & {
        absoluteValues: number[];
    }

    export const VueUiDonut: DefineComponent<{
        config?: VueUiDonutConfig,
        dataset: VueUiDonutDatasetItem[]
    }>;

    export type VueUiNestedDonutsDatasetItem = {
        name: string;
        series: VueUiDonutDatasetItem[]
    }

    export type VueUiNestedDonutsConfig = {
        useCssAnimation?: boolean;
        useBlurOnHover?: boolean;
        userOptions?: {
            show?: boolean;
        };
        style?: {
            fontFamily?: string;
            chart?: {
                useGradient?: boolean;
                gradientIntensity?: number;
                backgroundColor?: string;
                color?: string;
                layout?: {
                    labels?: {
                        dataLabels?: {
                            boldPercentage?: boolean;
                            boldValue?: boolean;
                            color?: string;
                            fontSize?: number;
                            hideUnderValue?: number;
                            offsetX?: number;
                            offsetY?: number;
                            prefix?: string;
                            roundingPercentage?: number;
                            roundingValue?: number;
                            show?: boolean;
                            showPercentage?: boolean;
                            showValue?: boolean;
                            suffix?: string;
                            useSerieColor?: boolean;
                            showDonutName?: boolean;
                            boldDonutName?: boolean;
                            donutNameAbbreviation?: boolean;
                            donutNameOffsetY?: number;
                            donutNameMaxAbbreviationSize?: number;
                        };
                    };
                    donut?: {
                        strokeWidth?: number;
                        borderWidth?: number;
                        spacingRatio?: number;
                    };
                };
                legend?: {
                    backgroundColor?: string;
                    color?: string;
                    show?: boolean;
                    fontSize?: number;
                    bold?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                };
                title?: {
                    text?: string;
                    color?: string;
                    fontSize?: number;
                    bold?: boolean;
                    subtitle?: {
                        color?: string;
                        text?: string;
                        fontSize?: number;
                        bold?: boolean;
                    };
                };
                tooltip?: {
                    show?: boolean;
                    showAllItemsAtIndex?: boolean;
                    color?: string;
                    backgroundColor?: string;
                    fontSize?: number;
                    showValue?: boolean;
                    showPercentage?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    customFormat?: (params: VueUiTooltipParams<VueUiNestedDonutsDatapoint, VueUiNestedDonutsSeriesItem[], VueUiNestedDonutsConfig>) => string;
                };
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            columnNames?: {
                series?: string;
                value?: string;
                percentage?: string;
            };
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
            td?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
                roundingValue?: number;
                roundingPercentage?: number;
            };
        };
    };

    export type VueUiNestedDonutsSeriesItem = {
        datasetIndex: number;
        id: string;
        name: string;
        total: number;
        donut: VueUiNestedDonutsDatapoint[];
        series: Array<{
            absoluteValues: number[];
            arcOf: string;
            arcOfId: string;
            color: string;
            datasetIndex: number;
            id: string;
            name: string;
            proportion: number;
            seriesIndex: number;
            value: number;
        }>
    };

    export type VueUiNestedDonutsDatapoint = {
        absoluteValues: number[];
        arcOf: string;
        arcOfId: string;
        arcSlice: string;
        center: { startX: number; startY: number; path: string; endX: number; endY: number };
        color: string;
        cx: number;
        cy: number;
        datasetIndex: number;
        endX: number;
        endY: number;
        id: string;
        name: string;
        path: string;
        proportion: number;
        ratio: number;
        seriesIndex: number;
        startX: number;
        startY: number;
        value: number;
    };

    export const VueUiNestedDonuts: DefineComponent<{
        config?: VueUiNestedDonutsConfig,
        dataset: VueUiNestedDonutsDatasetItem[]
    }>;

    export type VueUiWaffleConfig = {
        useBlurOnHover?: boolean;
        useCustomCells?: boolean;
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                layout?: {
                    labels?: {
                        dataLabels?: {
                            prefix?: string;
                            suffix?: string;
                        };
                        captions?: {
                            show?: boolean;
                            showSerieName?: boolean;
                            serieNameAbbreviation?: boolean;
                            serieNameMaxAbbreviationSize?: number;
                            fontSize?: number;
                            showValue?: boolean;
                            showPercentage?: boolean;
                            roundingValue?: number;
                            roundingPercentage?: number;
                            offsetX?: number;
                            offsetY?: number;
                        };
                    };
                    grid?: {
                        size?: number;
                        spaceBetween?: number;
                        vertical?: boolean;
                    };
                    rect?: {
                        rounded?: boolean;
                        rounding?: number;
                        stroke?: string;
                        strokeWidth?: number;
                        useGradient?: boolean;
                        gradientIntensity?: number;
                    };
                    useDiv?: boolean;
                };
                title?: {
                    text?: string;
                    color?: string;
                    fontSize?: number;
                    bold?: boolean;
                    subtitle?: {
                        color?: string;
                        text?: string;
                        fontSize?: number;
                        bold?: boolean;
                    };
                };
                tooltip?: {
                    show?: boolean;
                    backgroundColor?: string;
                    color?: string;
                    fontSize?: number;
                    showValue?: boolean;
                    showPercentage?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    customFormat?: (params: VueUiTooltipParams<VueUiWaffleDatapoint, VueUiWaffleSerieItem[], VueUiWaffleConfig>) => string;
                };
                legend?: {
                    show?: boolean;
                    bold?: boolean;
                    backgroundColor?: string;
                    color?: string;
                    fontSize?: number;
                    roundingValue?: number;
                    roundingPercentage?: number;
                };
            };
        };
        userOptions?: {
            show?: boolean;
            title?: string;
            labels?: {
                useDiv?: string;
                showTable?: string;
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            columnNames?: {
                series?: string;
                value?: string;
                percentage?: string;
            };
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
            td?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
                roundingValue?: number;
                roundingPercentage?: number;
            };
        };
    };

    export type VueUiWaffleDatapoint = {
        absoluteIndex: number;
        absoluteValues: number[];
        color: string;
        name: string;
        proportion: number;
        rects: number[];
        serieIndex: number;
        start: number;
        uid: string;
        value: number;
    }

    export type VueUiWaffleSerieItem = {
        absoluteIndex: number;
        color: string;
        name: string;
        shape: "circle" | "triangle" | "rect" | "diamond" | "pentagon" | "hexagon" | "star" | null;
        uid: string;
        values: number[]
    }

    export type VueUiWaffleDatasetItem = {
        name: string;
        color?: string;
        values: number[];
    }

    export const VueUiWaffle: DefineComponent<{
        config?: VueUiWaffleConfig,
        dataset: VueUiWaffleDatasetItem[]
    }>;

    export type VueUiRadarConfig = {
        useCssAnimation?: boolean;
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                layout?: {
                    useDiv?: boolean;
                    plots?: {
                        show?: boolean;
                        radius?: number;
                    };
                    outerPolygon?: {
                        stroke?: string;
                        strokeWidth?: number;
                    };
                    dataPolygon?: {
                        strokeWidth?: number;
                        transparent?: boolean;
                        opacity?: number;
                        useGradient?: boolean;
                    };
                    grid?: {
                        show?: boolean;
                        stroke?: string;
                        strokeWidth?: number;
                        graduations?: number;
                    };
                    labels?: {
                        dataLabels?: {
                            show?: boolean;
                            fontSize?: number;
                            color?: string;
                        };
                    };
                };
                title?: {
                    text?: string;
                    color?: string;
                    fontSize?: number;
                    bold?: boolean;
                    subtitle?: {
                        color?: string;
                        text?: string;
                        fontSize?: number;
                        bold?: boolean;
                    };
                };
                tooltip?: {
                    show?: boolean;
                    backgroundColor?: string;
                    color?: string;
                    fontSize?: number;
                    showValue?: boolean;
                    showPercentage?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    animation?: {
                        show?: boolean;
                        animationFrames?: number;
                    };
                    customFormat?: (params: VueUiTooltipParams<VueUiRadarDatapoint, VueUiRadarSeries, VueUiRadarConfig>) => string;
                };
                legend?: {
                    show?: boolean;
                    bold?: boolean;
                    backgroundColor?: string;
                    color?: string;
                    fontSize?: number;
                    roundingPercentage?: number;
                };
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
            td?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
                roundingValue?: number;
                roundingPercentage?: number;
            };
        };
        userOptions?: {
            show?: boolean;
            title?: string;
            labels?: {
                useDiv?: string;
                showTable?: string;
            };
        };
        translations?: {
            target?: string;
            value?: string;
            datapoint?: string;
        };
    };

    export type VueUiRadarDatapoint = {
        color: string;
        name: string;
        plots: Array<{ x: number; y: number }>;
        serieId: string;
        target: number;
        values: number[];
        x: number;
        y: number;
    }

    export type VueUiRadarCategory = {
        categoryId: string;
        color: string;
        name: string;
        prefix?: string;
        suffix?: string;
    }

    export type VueUiRadarDatapointItem = {
        color: string;
        name: string;
        serieId: string;
        target?: number;
        values: number[]
    }

    export type VueUiRadarSeries = {
        categories: VueUiRadarCategory[];
        datapoints: VueUiRadarDatapointItem[];
        radar: VueUiRadarDatapoint[]
    }

    export type VueUiRadarDatasetCategoryItem = {
        name: string;
        color?: string;
        prefix?: string;
        suffix?: string;
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
        config?: VueUiRadarConfig,
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
        useCssAnimation?: boolean;
        style?: {
            fontFamily?: string;
            chart?: {
                height?: number;
                width?: number;
                backgroundColor?: string;
                color?: string;
                layout?: {
                    useDiv?: boolean;
                    labels?: {
                        quadrantLabels?: {
                            show?: boolean;
                            tl?: {
                                text?: string;
                                color?: string;
                                fontSize?: number;
                                bold?: boolean;
                            };
                            tr?: {
                                text?: string;
                                color?: string;
                                fontSize?: number;
                                bold?: boolean;
                            };
                            br?: {
                                text?: string;
                                color?: string;
                                fontSize?: number;
                                bold?: boolean;
                            };
                            bl?: {
                                text?: string;
                                color?: string;
                                fontSize?: number;
                                bold?: boolean;
                            };
                        };
                        plotLabels?: {
                            showAsTag?: boolean;
                            show?: boolean;
                            fontSize?: number;
                            color?: string;
                            offsetY?: number;
                        };
                        axisLabels?: {
                            show?: boolean;
                            fontSize?: number;
                            color?: {
                                positive?: string;
                                negative?: string;
                            };
                        };
                    };
                    grid?: {
                        stroke?: string;
                        strokeWidth?: number;
                        showArrows?: boolean;
                        graduations?: {
                            stroke?: string;
                            strokeWidth?: number;
                            show?: boolean;
                            steps?: number;
                            fill?: boolean;
                            color?: string;
                            roundingForce?: number;
                        };
                        xAxis?: {
                            min?: number;
                            max?: number;
                            auto?: boolean;
                            name?: string;
                        };
                        yAxis?: {
                            min?: number;
                            max?: number;
                            auto?: boolean;
                            name?: string;
                        };
                    };
                    plots?: {
                        radius?: number;
                        outline?: boolean;
                        outlineColor?: string;
                        outlineWidth?: number;
                    };
                    areas?: {
                        show?: boolean;
                        opacity?: number;
                        useGradient?: boolean;
                    };
                };
                title?: {
                    text?: string;
                    color?: string;
                    fontSize?: number;
                    bold?: boolean;
                    subtitle?: {
                        color?: string;
                        text?: string;
                        fontSize?: number;
                        bold?: boolean;
                    };
                };
                tooltip?: {
                    show?: boolean;
                    backgroundColor?: string;
                    color?: string;
                    fontSize?: number;
                    roundingValue?: number;
                    customFormat?: (params: VueUiTooltipParams<VueUiQuadrantDatapoint, VueUiQuadrantSerie[], VueUiQuadrantConfig>) => string;
                    showShape?: boolean;
                };
                legend?: {
                    show?: boolean;
                    bold?: boolean;
                    backgroundColor?: string;
                    color?: string;
                    fontSize?: number;
                };
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
            td?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
                roundingValue?: number;
            };
        };
        userOptions?: {
            show?: boolean;
            title?: string;
            labels?: {
                useDiv?: string;
                showTable?: string;
                showPlotLabels?: string;
            };
        };
        translations?: {
            category?: string;
            item?: string;
            side?: string;
        };
    };

    export type VueUiQuadrantDatapoint = {
        categoryName: string;
        color: string;
        name: string;
        quadrantSide: string;
        shape: "circle" | "triangle" | "square" | "diamond" | "pentagon" | "hexagon" | "star" | null;
        uid: string;
        x: number;
        xValue: number;
        y: number;
        yValue: number;
    };

    export type VueUiQuadrantSerie = {
        color: string;
        id: string;
        name: string;
        series: VueUiQuadrantDatapoint[];
        shape: "circle" | "triangle" | "square" | "diamond" | "pentagon" | "hexagon" | "star" | null;
    };

    export const VueUiQuadrant: DefineComponent<{
        dataset: VueUiQuadrantDatasetItem[],
        config?: VueUiQuadrantConfig
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
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                animation?: {
                    use?: boolean;
                    speed?: number;
                    acceleration?: number;
                };
                layout?: {
                    useDiv?: boolean;
                    track?: {
                        size?: number;
                        useGradient?: boolean;
                        gradientIntensity?: number;
                    };
                    markers?: {
                        size?: number;
                        color?: string;
                        strokeWidth?: number;
                        stroke?: string;
                        backgroundColor?: string;
                        bold?: boolean;
                        fontSizeRatio?: number;
                        offsetY?: number;
                        roundingValue?: number;
                    };
                    pointer?: {
                        size?: number;
                        stroke?: string;
                        strokeWidth?: number;
                        useRatingColor?: boolean;
                        color?: string;
                        circle?: {
                            radius?: number;
                            stroke?: string;
                            strokeWidth?: number;
                            color?: string;
                        };
                    };
                };
                legend?: {
                    fontSize?: number;
                    prefix?: string;
                    suffix?: string;
                    roundingValue?: number;
                    showPlusSymbol?: boolean;
                    useRatingColor?: boolean;
                    color?: string;
                };
                title?: {
                    text?: string;
                    color?: string;
                    fontSize?: number;
                    bold?: boolean;
                    subtitle?: {
                        color?: string;
                        text?: string;
                        fontSize?: number;
                        bold?: boolean;
                    };
                };
            };
        };
        userOptions?: {
            show?: boolean;
            title?: string;
            labels?: {
                useDiv?: string;
                showTable?: string;
            };
        };
        translations?: {
            base?: string;
        };
    };

    export const VueUiGauge: DefineComponent<{
        config?: VueUiGaugeConfig,
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
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                layout?: {
                    grandTotal?: {
                        show?: boolean;
                        fontSize?: number;
                        bold?: boolean;
                        suffix?: string;
                        prefix?: string;
                        roundingValue?: number;
                        color?: string;
                        text?: string;
                        offsetY?: number;
                    };
                    roots?: {
                        stroke?: string;
                        strokeWidth?: number;
                        useGradient?: boolean;
                        gradientIntensity?: number;
                        underlayerColor?: string;
                        labels?: {
                            show?: boolean;
                            fontSize?: number;
                            adaptColorToBackground?: boolean;
                            color?: string;
                            bold?: boolean;
                            roundingValue?: number;
                            prefix?: string;
                            suffix?: string;
                            name?: {
                                color?: string;
                                fontSize?: number;
                                bold?: boolean;
                            };
                        };
                    };
                    verticalSeparator?: {
                        stroke?: string;
                        strokeWidth?: number;
                    };
                    links?: {
                        opacity?: number;
                    };
                    branches?: {
                        stroke?: string;
                        strokeWidth?: number;
                        borderRadius?: number;
                        useGradient?: boolean;
                        gradientIntensity?: number;
                        underlayerColor?: string;
                        widthRatio?: number;
                        labels?: {
                            show?: boolean;
                            fontSize?: number;
                            color?: string;
                            bold?: boolean;
                            dataLabels?: {
                                show?: boolean;
                                hideUnderValue?: number;
                                fontSize?: number;
                                roundingValue?: number;
                                roundingPercentage?: number;
                                prefix?: string;
                                suffix?: string;
                            };
                        };
                    };
                    nuts?: {
                        offsetX?: number;
                        useGradient?: boolean;
                        gradientIntensity?: number;
                        selected?: {
                            useMotion?: boolean;
                            useGradient?: boolean;
                            gradientIntensity?: number;
                            roundingValue?: number;
                            roundingPercentage?: number;
                            labels?: {
                                dataLabels?: {
                                    hideUnderValue?: number;
                                    color?: string;
                                    fontSize?: number;
                                    bold?: boolean;
                                    prefix?: string;
                                    suffix?: string;
                                };
                                core?: {
                                    total?: {
                                        color?: string;
                                        fontSize?: number;
                                        bold?: boolean;
                                    };
                                    value?: {
                                        color?: string;
                                        fontSize?: number;
                                        bold?: boolean;
                                        prefix?: string;
                                        suffix?: string;
                                    };
                                };
                            };
                        };
                    };
                    legend?: {
                        fontSize?: number;
                        color?: string;
                        roundingValue?: number;
                        roundingPercentage?: number;
                        prefix?: string;
                        suffix?: string;
                    };
                    title?: {
                        color?: string;
                        fontSize?: number;
                        text?: string;
                        bold?: boolean;
                        offsetY?: number;
                        subtitle?: {
                            text?: string;
                            color?: string;
                            bold?: boolean;
                            fontSize?: number;
                            offsetY?: number;
                        };
                    };
                };
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
                translations?: {
                    rootName?: string;
                    rootValue?: string;
                    rootToTotal?: string;
                    branchName?: string;
                    branchValue?: string;
                    branchToRoot?: string;
                    branchToTotal?: string;
                    nutName?: string;
                    nutValue?: string;
                    nutToBranch?: string;
                    nutToRoot?: string;
                    nutToTotal?: string;
                };
            };
            td?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
                roundingValue?: number;
                roundingPercentage?: number;
            };
        };
        userOptions?: {
            show?: boolean;
            title?: string;
            labels?: {
                showTable?: string;
            };
        };
        translations?: {
            total?: string;
            proportionToTree?: string;
            of?: string;
        }
    };

    export const VueUiChestnut: DefineComponent<{
        config?: VueUiChestnutConfig,
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
        useCssAnimation?: boolean;
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                useGradient?: boolean;
                gradientIntensity?: number;
                layout?: {
                    useDiv?: boolean;
                    gutter?: {
                        color?: string;
                        width?: number;
                    };
                    track?: {
                        width?: number;
                    };
                    labels?: {
                        show?: boolean;
                        fontSize?: number;
                        color?: string;
                        roundingValue?: number;
                        roundingPercentage?: number;
                        bold?: boolean;
                        offsetY?: number;
                        offsetX?: number;
                        value?: {
                            show?: boolean;
                        };
                        percentage?: {
                            show?: boolean;
                        };
                    };
                };
                title?: {
                    text?: string;
                    color?: string;
                    fontSize?: number;
                    bold?: boolean;
                    subtitle?: {
                        color?: string;
                        text?: string;
                        fontSize?: number;
                        bold?: boolean;
                    };
                };
                legend?: {
                    show?: boolean;
                    bold?: boolean;
                    backgroundColor?: string;
                    color?: string;
                    fontSize?: number;
                    roundingValue?: number;
                    roundingPercentage?: number;
                };
                tooltip?: {
                    show?: boolean;
                    color?: string;
                    backgroundColor?: string;
                    fontSize?: number;
                    showValue?: boolean;
                    showPercentage?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    customFormat?: (params: VueUiTooltipParams<VueUiOnionDatapoint, VueUiOnionSeriesItem[], VueUiOnionConfig>) => string;
                };
            };
        };
        userOptions?: {
            show?: boolean;
            title?: string;
            labels?: {
                useDiv?: string;
                showTable?: string;
            };
        };
        table?: {
            show?: boolean;
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
            td?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
                roundingValue?: number;
                roundingPercentage?: number;
            },
            translations?: {
                value?: string;
                percentage?: string;
                serie?: string;
            };
        };
    };

    export type VueUiOnionDatapoint = {
        absoluteIndex: number;
        color: string;
        id: string;
        labelY: number;
        name: string;
        opacity: number;
        path: {
            active: string;
            bgDashArray: string;
            bgDashOffset: number;
            dashArray: string;
            dashOffset: number;
            fullOffset: number;
        };
        percentage: number;
        prefix: string;
        radius: number;
        shape: "circle" | "triangle" | "square" | "diamond" | "pentagon" | "hexagon" | "star" | null;
        suffix: string;
        value: number;
    }

    export type VueUiOnionSeriesItem = {
        absoluteIndex: number;
        color: string;
        id: string;
        name: string;
        opacity: number;
        percentage: number;
        prefix: string;
        shape: "circle" | "triangle" | "square" | "diamond" | "pentagon" | "hexagon" | "star" | null;
        suffix: string;
        value: number;
    }


    export const VueUiOnion: DefineComponent<{
        config?: VueUiOnionConfig,
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
        useCssAnimation?: boolean;
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                layout?: {
                    useDiv?: boolean;
                    bars?: {
                        sort?: "desc" | "asc";
                        useStroke?: boolean;
                        strokeWidth?: number;
                        height?: number;
                        gap?: number;
                        borderRadius?: number;
                        offsetX?: number;
                        paddingRight?: number;
                        useGradient?: boolean;
                        gradientIntensity?: number;
                        fillOpacity?: number;
                        underlayerColor?: string;
                        dataLabels?: {
                            color?: string;
                            bold?: boolean;
                            fontSize?: number;
                            value?: {
                                show?: boolean;
                                roundingValue?: number;
                                prefix?: string;
                                suffix?: string;
                            };
                            percentage?: {
                                show?: boolean;
                                roundingPercentage?: number;
                            };
                            offsetX?: number;
                        };
                        nameLabels?: {
                            show?: boolean;
                            color?: string;
                            bold?: boolean;
                            fontSize?: number;
                            offsetX?: number;
                        };
                        parentLabels?: {
                            show?: boolean;
                            color?: string;
                            bold?: boolean;
                            fontSize?: number;
                            offsetX?: number;
                        };
                    };
                    highlighter?: {
                        color?: string;
                        opacity?: number;
                    };
                    separators?: {
                        show?: boolean;
                        color?: string;
                        strokeWidth?: number;
                    };
                };
                title?: {
                    text?: string;
                    color?: string;
                    fontSize?: number;
                    bold?: boolean;
                    subtitle?: {
                        color?: string;
                        text?: string;
                        fontSize?: number;
                        bold?: boolean;
                    };
                };
                legend?: {
                    position?: "top" | "bottom";
                    show?: boolean;
                    fontSize?: number;
                    color?: string;
                    backgroundColor?: string;
                    bold?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    prefix?: string;
                    suffix?: string;
                };
                tooltip?: {
                    show?: boolean;
                    backgroundColor?: string;
                    color?: string;
                    fontSize?: number;
                    showValue?: boolean;
                    showPercentage?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    prefix?: string;
                    suffix?: string;
                    customFormat?: (params: VueUiTooltipParams<VueUiVerticalBarDatapoint, VueUiVerticalBarSerie[], VueUiVerticalBarConfig>) => string;
                };
            };
        };
        userOptions?: {
            show?: boolean;
            title?: string;
            labels?: {
                useDiv?: string;
                showTable?: string;
                sort?: string;
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
            };
            td?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
                roundingValue?: number;
                roundingPercentage?: number;
                prefix?: string;
                suffix?: string;
            };
        };
        translations?: {
            parentName?: string;
            childName?: string;
            value?: string;
            percentageToTotal?: string;
            percentageToSerie?: string;
        };
    };

    export type VueUiVerticalBarDatapoint = {
        children?: Array<any>;
        childIndex?: number;
        hasChildren?: boolean;
        color: string;
        id: string;
        isChild: boolean;
        isFirstChild: boolean;
        isLastChild: boolean;
        name: string;
        parentId?: string;
        parentName?: string;
        parentValue?: number;
        value: number;
    };

    export type VueUiVerticalBarSerie = {
        children: VueUiVerticalBarDatapoint[];
        color: string;
        hasChildren: boolean;
        is: string;
        isChild: boolean;
        name: string;
        opacity: number;
        shape: "circle" | "triangle" | "square" | "diamond" | "pentagon" | "hexagon" | "star" | null;
        value: number;
    };

    export const VueUiVerticalBar: DefineComponent<{
        config?: VueUiVerticalBarConfig,
        dataset: VueUiVerticalBarDatasetItem[]
    }>;

    export type VueUiSparklineDatasetItem = {
        period: string;
        value: number;
        absoluteValue?: number;
        id?: string;
        plotValue?: number;
        toMax?: number;
        width?: number;
        x?: number;
        y?: number;
    };

    export type VueUiSparklineConfig = {
        type?: "line" | "bar";
        style?: {
            backgroundColor?: string;
            fontFamily?: string;
            chartWidth?: number;
            animation?: {
                show?: boolean;
                animationFrames?: number;
            };
            sparkline?: {
                color?: string;
                strokeWidth?: number;
            };
            line?: {
                color?: string;
                strokeWidth?: number;
                smooth?: boolean;
            };
            bar?: {
                borderRadius?: number;
                color?: string;
            };
            zeroLine?: {
                color?: string;
                strokeWidth?: number;
            };
            plot?: {
                show?: boolean;
                radius?: number;
                stroke?: string;
                strokeWidth?: number;
            };
            verticalIndicator?: {
                show?: boolean;
                strokeWidth?: number;
                color?: string;
                strokeDasharray?: number;
            };
            dataLabel?: {
                show?: boolean;
                position?: "left" | "right";
                offsetX?: number;
                offsetY?: number;
                fontSize?: number;
                bold?: boolean;
                color?: string;
                roundingValue?: number;
                valueType?: "latest" | "sum" | "average";
                prefix?: string;
                suffix?: string;
            };
            title?: {
                show?: boolean;
                textAlign?: "left" | "center" | "right";
                color?: string;
                fontSize?: number;
                bold?: boolean;
                text?: string;
            };
            area?: {
                show?: boolean;
                useGradient?: boolean;
                opacity?: number;
                color?: string;
            };
        };
    };

    export const VueUiSparkline: DefineComponent<{
        config?: VueUiSparklineConfig,
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
        fontFamily?: string;
        maxHeight?: number;
        rowsPerPage?: number;
        style?: {
            th?: {
                backgroundColor?: string;
                color?: string;
                outline?: string;
                selected?: {
                    backgroundColor?: string;
                    color?: string;
                };
            };
            rows?: {
                even?: {
                    backgroundColor?: string;
                    color?: string;
                    selectedCell?: {
                        backgroundColor?: string;
                        color?: string;
                    };
                    selectedNeighbors?: {
                        backgroundColor?: string;
                        color?: string;
                    };
                };
                odd?: {
                    backgroundColor?: string;
                    color?: string;
                    selectedCell?: {
                        backgroundColor?: string;
                        color?: string;
                    };
                    selectedNeighbors?: {
                        backgroundColor?: string;
                        color?: string;
                    };
                };
            };
            inputs?: {
                backgroundColor?: string;
                color?: string;
                border?: string;
                accentColor?: string;
            },
            dropdowns?: {
                backgroundColor?: string;
                color?: string;
                icons?: {
                    selected?: {
                        color?: string;
                        unicode?: string;
                    };
                    unselected?: {
                        color?: string;
                        unicode?: string;
                    };
                };
            };
            infoBar?: {
                backgroundColor?: string;
                color?: string;
            };
            pagination?: {
                buttons?: {
                    backgroundColor?: string;
                    color?: string;
                    opacityDisabled?: string;
                };
                navigationIndicator?: {
                    backgroundColor?: string;
                };
            };
            exportMenu?: {
                backgroundColor?: string;
                color?: string;
                buttons?: {
                    backgroundColor?: string;
                    color?: string;
                };
            };
            closeButtons?: {
                backgroundColor?: string;
                color?: string;
                borderRadius?: string;
            };
            chart?: {
                modal?: {
                    backgroundColor?: string;
                    color?: string;
                    buttons?: {
                        selected?: {
                            backgroundColor?: string;
                            color?: string;
                        };
                        unselected?: {
                            backgroundColor?: string;
                            color?: string;
                        };
                    };
                };
                layout?: {
                    backgroundColor?: string;
                    axis?: {
                        stroke?: string;
                        strokeWidth?: number;
                    };
                    bar?: {
                        fill?: string;
                        stroke?: string;
                    },
                    line?: {
                        stroke?: string;
                        strokeWidth?: number;
                        plot?: {
                            fill?: string;
                            stroke?: string;
                            strokeWidth?: number;
                            radius?: {
                                selected?: number;
                                unselected?: number;
                            };
                        };
                        selector?: {
                            stroke?: string;
                            strokeWidth?: number;
                            strokeDasharray?: number;
                        };
                    };
                    labels?: {
                        color?: string;
                    };
                    progression?: {
                        stroke?: string;
                        strokeWidth?: number;
                        strokeDasharray?: number;
                        arrowSize?: number;
                    };
                };
            };
        };
        translations?: {
            average?: string;
            by?: string;
            chooseCategoryColumn?: string;
            exportAllButton?: string;
            exportAllLabel?: string;
            exportPageButton?: string;
            exportPageLabel?: string;
            from?: string;
            inputPlaceholder?: string;
            makeDonut?: string;
            nb?: string;
            page?: string;
            paginatorLabel?: string;
            sizeWarning?: string;
            sum?: string;
            to?: string;
            total?: string;
            totalRows?: string;
        };
        useChart?: boolean;
    };

    export const VueUiTable: DefineComponent<{
        config?: VueUiTableConfig,
        dataset: VueUiTableDataset
    }>;

    export type VueUiRatingDatasetDetailed = {
        [key: string]: number;
    };

    export type VueUiRatingDataset = {
        rating: number | VueUiRatingDatasetDetailed;
    };

    export type VueUiRatingConfig = {
        type?: "star" | "image";
        readonly?: boolean;
        from?: number;
        to?: number;
        style?: {
            fontFamily?: string;
            animated?: boolean;
            itemSize?: number;
            backgroundColor?: string;
            star?: {
                activeColor?: string;
                borderColor?: string;
                borderWidth?: number;
                apexes?: number;
                inactiveColor?: string;
                useGradient?: boolean;
            };
            image?: {
                src?: string;
                inactiveOpacity?: string;
                alt?: string;
            };
            title?: {
                textAlign?: string;
                fontSize?: number;
                color?: string;
                bold?: boolean;
                text?: string;
                offsetY?: number;
                subtitle?: {
                    fontSize?: number;
                    color?: string;
                    bold?: boolean;
                    text?: string;
                    offsetY?: number;
                };
            };
            rating?: {
                show?: boolean;
                fontSize?: number;
                bold?: boolean;
                roundingValue?: number;
                position?: "bottom" | "top" | "left" | "right",
                offsetY?: number;
                offsetX?: number;
            };
            tooltip?: {
                show?: boolean;
                fontSize?: number;
                offsetY?: number;
                color?: string;
                bold?: boolean;
                backgroundColor?: string;
                borderColor?: string;
                borderRadius?: number;
                boxShadow?: string;
            };
        };
    };

    export const VueUiRating: DefineComponent<{
        config?: VueUiRatingConfig,
        dataset: VueUiRatingDataset
    }>;

    export type VueUiSmileyConfig = {
        readonly?: boolean;
        style?: {
            fontFamily?: string;
            itemSize?: number;
            backgroundColor?: string;
            colors?: {
                activeReadonly?: [string, string, string, string, string];
                active?: [string, string, string, string, string];
                inactive?: [string, string, string, string, string];
            };
            icons?: {
                filled?: boolean;
                useGradient?: boolean;
            };
            title?: {
                textAlign?: string;
                fontSize?: number;
                color?: string;
                bold?: boolean;
                text?: string;
                offsetY?: number;
                subtitle?: {
                    fontSize?: number;
                    color?: string;
                    bold?: boolean;
                    text?: string;
                    offsetY?: number;
                };
            };
            rating?: {
                show?: boolean;
                fontSize?: number;
                bold?: boolean;
                roundingValue?: number;
                position?: string;
                offsetY?: number;
                offsetX?: number;
            };
            tooltip?: {
                show?: boolean;
                fontSize?: number;
                offsetY?: number;
                color?: string;
                bold?: boolean;
                backgroundColor?: string;
                borderColor?: string;
                borderRadius?: number;
                boxShadow?: string;
            };
        };
    };

    export const VueUiSmiley: DefineComponent<{
        config?: VueUiSmileyConfig,
        dataset: VueUiRatingDataset
    }>;

    export type VueUiScreenshotConfig = {
        mode?: "download" | "post";
        quality?: number;
        style?: {
            info?: {
                background?: string;
                bold?: boolean;
                border?: string;
                borderRadius?: number;
                boxShadow?: string;
                color?: string;
                fontFamily?: string;
                fontSize?: number;
                minWidth?: number;
                padding?: number;
                top?: number;
            };
            captureButton?: {
                background?: string;
                bold?: boolean;
                border?: string;
                borderRadius?: number;
                boxShadow?: string;
                color?: string;
                fontFamily?: string;
                fontSize?: number;
                minHeight?: number;
                padding?: string;
            };
            cancelButton?: {
                background?: string;
                border?: string;
                borderRadius?: number;
                color?: string;
                right?: number;
                size?: number;
                top?: number;
            };
            captureArea?: {
                background?: string;
                border?: string;
                initialHeight?: number;
                initialWidth?: number;
            };
            handles?: {
                background?: string;
                border?: string;
                borderRadius?: number;
                size?: number;
            };
        };
        translations?: {
            captureButton?: string;
            info?: string;
        };
    };

    export const VueUiScreenshot: DefineComponent<{
        config?: VueUiScreenshotConfig
    }>;

    export type VueUiSkeletonConfig = {
        type?: "bar" | "chestnut" | "donut" | "gauge" | "line" | "onion" | "quadrant" | "radar" | "rating" | "table" | "verticalBar" | "waffle" | "heatmap" | "candlestick" | "pyramid" | "wheel" | "rings" | "donutEvolution" | "tiremarks" | "molecule" | "relationCircle" | "thermometer" | "sparkbar" | "sparkStackbar" | "sparkHistogram" | "bar3d" | "galaxy" | "treemap";
        style?: {
            backgroundColor?: string;
            color?: string;
            animated?: boolean;
            treemap?: {
                color?: string;
            };
            galaxy?: {
                color?: string;
            };
            bar3d?: {
                color?: string;
            };
            sparkHistogram?: {
                color?: string;
            };
            sparkStackbar?: {
                color?: string;
            };
            sparkbar?: {
                color?: string;
            };
            thermometer?: {
                color?: string;
            };
            relationCircle?: {
                color?: string;
            };
            molecule?: {
                color?: string;
            };
            tiremarks?: {
                color?: string;
            };
            line?: {
                axis?: {
                    show?: boolean;
                    color?: string;
                    strokeWidth?: number;
                };
                path?: {
                    color?: string;
                    strokeWidth?: number;
                    showPlots?: boolean;
                };
            };
            donutEvolution?: {
                axis?: {
                    show?: boolean;
                    color?: string;
                    strokeWidth?: number;
                };
                donuts?: {
                    strokeWidth?: number;
                    color?: string;
                };
            };
            bar?: {
                axis?: {
                    show?: boolean;
                    color?: string;
                    strokeWidth?: number;
                };
                borderRadius?: number;
                color?: string;
                barWidth?: number;
            };
            chestnut?: {
                color?: string;
            };
            donut?: {
                color?: string;
                strokeWidth?: number;
            };
            onion?: {
                color?: string;
            };
            gauge?: {
                color?: string;
            };
            quadrant?: {
                grid?: {
                    color?: string;
                    strokeWidth?: number;
                };
                plots?: {
                    radius?: number;
                    color?: string;
                };
            };
            radar?: {
                grid?: {
                    color?: string;
                    strokeWidth?: number;
                };
                shapes?: {
                    color?: string;
                };
            };
            waffle?: {
                color?: string;
            };
            table?: {
                th?: {
                    color?: string;
                };
                td?: {
                    color?: string;
                    strokeWidth?: number;
                };
            };
            rating?: {
                useSmiley?: boolean;
                color?: string;
                filled?: boolean;
                strokeWidth?: number;
                maxWidth?: number;
            };
            verticalBar?: {
                axis?: {
                    show?: boolean;
                    color?: string;
                    strokeWidth?: number;
                },
                borderRadius?: number;
                color?: string;
            };
            heatmap?: {
                cellsX?: number;
                cellsY?: number;
                color?: string;
            };
            candlesticks?: {
                axis?: {
                    show?: boolean;
                    color?: string;
                    strokeWidth?: number;
                };
                candle?: {
                    color?: string;
                    strokeWidth?: number;
                };
            };
            pyramid?: {
                color?: string;
            };
            wheel?: {
                color?: string;
            };
            rings?: {
                color?: string;
            }
        };
    };

    export const VueUiSkeleton: DefineComponent<{
        config?: VueUiSkeletonConfig
    }>;

    export type VueDataUiConfig = VueUi3dBarConfig | VueUiAgePyramidConfig | VueUiAnnotatorConfig | VueUiCandlestickConfig | VueUiChestnutConfig | VueUiDashboardConfig | VueUiDigitsConfig | VueUiDonutConfig | VueUiDonutEvolutionConfig | VueUiGaugeConfig | VueUiHeatmapConfig | VueUiMiniLoaderConfig | VueUiMoleculeConfig | VueUiMoodRadarConfig | VueUiOnionConfig | VueUiQuadrantConfig | VueUiRadarConfig | VueUiRatingConfig | VueUiRelationCircleConfig | VueUiRingsConfig | VueUiScatterConfig | VueUiScreenshotConfig | VueUiSkeletonConfig | VueUiSmileyConfig | VueUiSparkHistogramConfig | VueUiSparkStackBarConfig | VueUiSparkbarConfig | VueUiSparklineConfig | VueUiTableConfig | VueUiTableSparklineConfig | VueUiThermometerConfig | VueUiTiremarksConfig | VueUiVerticalBarConfig | VueUiWaffleConfig | VueUiWheelConfig | VueUiXyConfig | VueUiNestedDonutsConfig | VueUiGalaxyConfig | VueUiKpiConfig | VueUiTreemapConfig;

    export type VueDataUiConfigKey = "vue_ui_3d_bar" | "vue_ui_age_pyramid" | "vue_ui_annotator" | "vue_ui_candlestick" | "vue_ui_chestnut" | "vue_ui_dashboard" | "vue_ui_digits" | "vue_ui_donut" | "vue_ui_donut_evolution" | "vue_ui_gauge" | "vue_ui_heatmap" | "vue_ui_mini_loader" | "vue_ui_molecule" | "vue_ui_mood_radar" | "vue_ui_onion" | "vue_ui_quadrant" | "vue_ui_radar" | "vue_ui_rating" | "vue_ui_relation_circle" | "vue_ui_rings" | "vue_ui_scatter" | "vue_ui_screenshot" | "vue_ui_skeleton" | "vue_ui_smiley" | "vue_ui_sparkhistogram" | "vue_ui_sparkstackbar" | "vue_ui_sparkbar" | "vue_ui_sparkline" | "vue_ui_table" | "vue_ui_table_sparkline" | "vue_ui_thermometer" | "vue_ui_tiremarks" | "vue_ui_vertical_bar" | "vue_ui_waffle" | "vue_ui_wheel" | "vue_ui_xy" | "vue_ui_nested_donuts" | "vue_ui_galaxy" | "vue_ui_kpi" | "vue_ui_treemap";

    export const getVueDataUiConfig: () => VueDataUiConfig;
}
