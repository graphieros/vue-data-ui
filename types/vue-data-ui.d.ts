declare module "vue-data-ui" {
    import { DefineComponent } from "vue";

    export type VueUiUnknownObj = {
        [key: string]: unknown;
    };

    export const VueDataUi: DefineComponent<{
        dataset?:
        | VueUi3dBarDataset
        | VueUiAgePyramidDataset
        | VueUiAnnotatorDataset
        | Array<Array<string | number>>
        | VueUiChestnutDatasetRoot[]
        | VueUiDashboardElement[]
        | number
        | string
        | VueUiDonutEvolutionDatasetItem[]
        | VueUiDonutDatasetItem[]
        | VueUiGaugeDataset
        | VueUiHeatmapDatasetItem[]
        | VueUiMoleculeDatasetNode[]
        | VueUiMoodRadarDataset
        | VueUiNestedDonutsDatasetItem[]
        | VueUiOnionDatasetItem[]
        | VueUiQuadrantDatasetItem[]
        | VueUiRadarDataset
        | VueUiRatingDataset
        | VueUiRelationCircleDatasetItem[]
        | VueUiRingsDatasetItem[]
        | VueUiScatterDatasetItem[]
        | VueUiSparkbarDatasetItem[]
        | VueUiSparkgaugeDataset
        | VueUiSparkHistogramDatasetItem[]
        | VueUiSparklineDatasetItem[]
        | VueUiSparkStackbarDatasetItem[]
        | VueUiTableSparklineDatasetItem[]
        | VueUiTableDataset
        | VueUiThermometerDataset
        | VueUiTiremarksDataset
        | VueUiVerticalBarDatasetItem[]
        | VueUiWaffleDatasetItem[]
        | VueUiWheelDataset
        | VueUiXyDatasetItem[]
        | VueUiTreemapDatasetItem[]
        | VueUiQuickChartDataset
        | number[]
        | VueUiStripPlotDataset[]
        | VueUiWordCloudDatasetItem[]
        | VueUiXyCanvasDatasetItem[]
        | VueUiFlowDatasetItem[]
        | VueUiParallelCoordinatePlotDatasetItem[]
        | VueUiCarouselTableDataset
        | VueUiGizmoDataset
        | VueUiStackbarDatasetItem[]
        | VueUiBulletDataset
        | VueUiFunnelDatasetItem[]
        | VueUiHistoryPlotDatasetItem[]
        | VueUiCirclePackDatasetItem[];
        config?:
        | VueUi3dBarConfig
        | VueUiAgePyramidConfig
        | VueUiAnnotatorConfig
        | VueUiCandlestickConfig
        | VueUiChestnutConfig
        | VueUiDashboardConfig
        | VueUiDigitsConfig
        | VueUiDonutEvolutionConfig
        | VueUiDonutConfig
        | VueUiGaugeConfig
        | VueUiHeatmapConfig
        | VueUiMiniLoaderConfig
        | VueUiMoleculeConfig
        | VueUiMoodRadarConfig
        | VueUiNestedDonutsConfig
        | VueUiOnionConfig
        | VueUiQuadrantConfig
        | VueUiRadarConfig
        | VueUiRatingConfig
        | VueUiRelationCircleConfig
        | VueUiRingsConfig
        | VueUiScatterConfig
        | VueUiScreenshotConfig
        | VueUiSkeletonConfig
        | VueUiSmileyConfig
        | VueUiSparkbarConfig
        | VueUiSparkgaugeConfig
        | VueUiSparkHistogramConfig
        | VueUiSparklineConfig
        | VueUiSparkStackbarConfig
        | VueUiTableSparklineConfig
        | VueUiTableConfig
        | VueUiThermometerConfig
        | VueUiTiremarksConfig
        | VueUiVerticalBarConfig
        | VueUiWaffleConfig
        | VueUiWheelConfig
        | VueUiXyConfig
        | VueUiKpiConfig
        | VueUiTreemapConfig
        | VueUiQuickChartConfig
        | VueUiCursorConfig
        | VueUiSparkTrendConfig
        | VueUiStripPlotConfig
        | VueUiDumbbellConfig
        | VueUiWordCloudConfig
        | VueUiXyCanvasConfig
        | VueUiFlowConfig
        | VueUiParallelCoordinatePlotConfig
        | VueUiTimerConfig
        | VueUiCarouselTableConfig
        | VueUiGizmoConfig
        | VueUiStackbarConfig
        | VueUiBulletConfig
        | VueUiFunnelConfig
        | VueUiHistoryPlotConfig
        | VueUiCirclePackConfig;
    }>;

    export type VueUiPatternName =
        | "bubbles"
        | "flooring"
        | "grid"
        | "hexagon-diamond"
        | "hexagon-flooring"
        | "hexagon-grid"
        | "maze"
        | "redrum"
        | "scales"
        | "squares"
        | "wave"
        | "zig-zag";

    export const VueUiPattern: DefineComponent<{
        name: VueUiPatternName;
        id: string;
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
        scale?: number;
    }>;

    export type ChartTitle = {
        text?: string;
        color?: string;
        fontSize?: number;
        bold?: boolean;
        textAlign?: TextAlign;
        paddingLeft?: number;
        paddingRight?: number;
        subtitle?: {
            color?: string;
            text?: string;
            fontSize?: number;
            bold?: boolean;
        };
    };

    export type ChartComments = {
        show?: boolean;
        showInTooltip?: boolean;
        width?: number;
        offsetY?: number;
        offsetX?: number;
    };

    export type ChartPadding = {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
    };

    export type ChartBaseLegend = {
        color?: string;
        show?: boolean;
        fontSize?: number;
        bold?: boolean;
    };

    export type ChartUserOptions = {
        show?: boolean;
        showOnChartHover?: boolean;
        keepStateOnChartLeave?: boolean;
        position?: "left" | "right";
        buttons?: {
            animation?: boolean;
            annotator?: boolean;
            csv?: boolean;
            fullscreen?: boolean;
            img?: boolean;
            labels?: boolean;
            pdf?: boolean;
            sort?: boolean;
            stack?: boolean;
            table?: boolean;
            tooltip?: boolean;
        };
        buttonTitles?: {
            animation?: string;
            annotator?: string;
            close?: string;
            csv?: string;
            fullscreen?: string;
            img?: string;
            labels?: string;
            open?: string;
            pdf?: string;
            sort?: string;
            stack?: string;
            table?: string;
            tooltip?: string;
        };
    };

    export type ChartTableCell = {
        backgroundColor?: string;
        color?: string;
        outline?: string;
    };

    export type ChartTooltip = {
        show?: boolean;
        color?: string;
        backgroundColor?: string;
        fontSize?: number;
        borderRadius?: number;
        borderColor?: string;
        borderWidth?: number;
        backgroundOpacity?: number;
        position?: TooltipPosition;
        offsetY?: number;
    };

    export type ZoomMinimap = {
        show?: boolean;
        smooth?: boolean;
        selectedColor?: string;
        selectedColorOpacity?: number;
        lineColor?: string;
        selectionRadius?: number;
        indicatorColor?: string;
        verticalHandles?: boolean;
    };

    export type ChartZoom = {
        show?: boolean;
        color?: string;
        highlightColor?: string;
        fontSize?: number;
        useResetSlot?: boolean;
        minimap?: ZoomMinimap;
        startIndex?: number | null;
        endIndex?: number | null;
        enableRangeHandles?: boolean;
        enableSelectionDrag?: boolean;
    };

    export type Theme =
        | ""
        | "zen"
        | "hack"
        | "concrete"
        | "celebration"
        | "celebrationNight";
    export type TextAlign = "left" | "center" | "right";
    export type TooltipPosition = TextAlign;
    export type FontVariantNumeric =
        | "normal"
        | "slashed-zero"
        | "tabular-nums"
        | "oldstyle-nums";
    export type Shape =
        | "circle"
        | "triangle"
        | "square"
        | "diamond"
        | "pentagon"
        | "hexagon"
        | "star";

    export type FormatterParams = {
        value: number;
        config?: any;
    };
    export type Formatter = null | ((params: FormatterParams) => string | number);

    export type VueUiTooltipParams<
        TDatapoint,
        TSeries,
        TConfig,
        TBar = any,
        TLine = any,
        TPlot = any
    > = {
        seriesIndex?: number;
        plotIndex?: number;
        series?: TSeries;
        datapoint?: TDatapoint;
        config?: TConfig;
        bars?: TBar;
        lines?: TLine;
        plots?: TPlot;
    };

    export type VueUiTreemapDatasetItem = {
        name: string;
        value: number;
        children?: VueUiTreemapDatasetItem[];
        parentId?: string;
        color?: string;
    };

    export type VueUiTreemapConfig = {
        responsive?: boolean;
        theme?: Theme;
        customPalette?: string[];
        userOptions?: ChartUserOptions;
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                height?: number;
                width?: number;
                padding?: ChartPadding;
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
                        formatter?: Formatter;
                    };
                };
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                    roundingValue?: number;
                    roundingPercentage?: number;
                };
                title?: ChartTitle;
                tooltip?: ChartTooltip & {
                    roundingValue?: number;
                    customFormat?:
                    | null
                    | ((
                        params: VueUiTooltipParams<
                            VueUiTreemapDatapoint,
                            VueUiTreemapSeriesItem[],
                            VueUiTreemapConfig
                        >
                    ) => string);
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
            th?: ChartTableCell;
            td?: ChartTableCell & {
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
    };

    export const VueUiTreemap: DefineComponent<{
        config?: VueUiTreemapConfig;
        dataset: VueUiTreemapDatasetItem[];
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
        formatter?: Formatter;
        analogDigits?: {
            show?: boolean;
            height?: number;
            color?: string;
            skeletonColor?: string;
        };
    };

    export const VueUiKpi: DefineComponent<{
        dataset: number;
        config?: VueUiKpiConfig;
    }>;

    export type VueUiGalaxyDatasetItem = VueUiDonutDatasetItem;

    export type VueUiGalaxyConfig = {
        theme?: Theme;
        customPalette?: string[];
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
                            formatter?: Formatter;
                        };
                    };
                };
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                    roundingValue?: number;
                    roundingPercentage?: number;
                };
                title?: ChartTitle;
                tooltip?: ChartTooltip & {
                    showValue?: boolean;
                    showPercentage: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    customFormat?:
                    | null
                    | ((
                        params: VueUiTooltipParams<
                            VueUiGalaxyDatapoint,
                            VueUiGalaxySeriesItem[],
                            VueUiGalaxyConfig
                        >
                    ) => string);
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
            th?: ChartTableCell;
            td?: ChartTableCell & {
                roundingValue?: number;
                roundingPercentage?: number;
            };
        };
        userOptions?: ChartUserOptions;
    };

    export type VueUiGalaxyDatapoint = VueUiGalaxyDatasetItem & {
        color: string;
        id: string;
        path: string;
        points: number;
        proportion: number;
        seriesIndex: number;
        value: number;
    };

    export type VueUiGalaxySeriesItem = VueUiGalaxyDatasetItem & {
        id: string;
        color: string;
        seriesIndex: number;
        value: number;
    };

    export const VueUiGalaxy: DefineComponent<{
        config?: VueUiGalaxyConfig;
        dataset: VueUiGalaxyDatasetItem[];
    }>;

    export type VueUiSparkgaugeDataset = {
        value: number;
        min: number;
        max: number;
        title?: string;
    };

    export type VueUiSparkgaugeConfig = {
        theme?: Theme;
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
                position?: "top" | "bottom";
                textAlign?: TextAlign;
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
                formatter?: Formatter;
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
                strokeLinecap?: "round" | "square" | "butt";
            };
        };
    };

    export const VueUiSparkgauge: DefineComponent<{
        dataset: VueUiSparkgaugeDataset;
        config?: VueUiSparkgaugeConfig;
    }>;

    export type VueUiMiniLoaderConfigType = {
        gutterColor?: string;
        gutterOpacity?: number;
        gutterBlur?: number;
        trackHueRotate?: number;
        trackBlur?: number;
        trackColor?: string;
    };

    export type VueUiMiniLoaderConfig = {
        type?: "line" | "bar" | "onion";
        onion?: VueUiMiniLoaderConfigType;
        line?: VueUiMiniLoaderConfigType;
        bar?: VueUiMiniLoaderConfigType;
    };

    export const VueUiMiniLoader: DefineComponent<{
        config?: VueUiMiniLoaderConfig;
    }>;

    export const Arrow: DefineComponent<{
        markerEnd?: boolean;
        markerSize?: number;
        markerStart?: boolean;
        stroke?: string;
        strokeDasharray?: number;
        strokeLinecap?: "round" | "butt" | "square";
        strokeWidth?: number;
        x1: number;
        x2: number;
        y1: number;
        y2: number;
    }>;

    export type VueUiTableSparklineDatasetItem = {
        name: string;
        values: number[];
        color?: string;
    };

    export type VueUiTableSparklineConfig = {
        theme?: Theme;
        customPalette?: string[];
        responsiveBreakpoint?: number;
        showAverage?: boolean;
        showMedian?: boolean;
        showTotal?: boolean;
        roundingAverage?: number;
        roundingMedian?: number;
        roundingValues?: number;
        roundingTotal?: number;
        prefix?: string;
        suffix?: string;
        showSparklines?: boolean;
        fontFamily?: string;
        colNames?: string[];
        sortedDataColumnIndices?: number[];
        sortedSeriesName?: boolean;
        sortedSum?: boolean;
        sortedAverage?: boolean;
        sortedMedian?: boolean;
        resetSortOnClickOutside?: boolean;
        formatter?: Formatter;
        sparkline?: {
            useGradient?: boolean;
            showArea?: boolean;
            strokeWidth?: number;
            type?: "line" | "bar";
            smooth?: boolean;
            dimensions?: {
                width?: number;
                heightRatio?: number;
            };
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
            textAlign?: TextAlign;
            subtitle?: {
                text?: string;
                color?: string;
                fontSize?: number;
                bold?: boolean;
            };
        };
        thead?: ChartTableCell & {
            fontSize?: number;
            textAlign?: TextAlign;
            bold?: boolean;
        };
        tbody?: ChartTableCell & {
            fontSize?: number;
            textAlign?: TextAlign;
            bold?: boolean;
            showColorMarker?: boolean;
            selectedColor?: {
                useSerieColor?: boolean;
                fallback?: string;
            };
        };
        userOptions?: ChartUserOptions;
    };

    export const VueUiTableSparkline: DefineComponent<{
        dataset: VueUiTableSparklineDatasetItem[];
        config: VueUiTableSparklineConfig;
    }>;

    export type VueUiMoleculeDatasetNode = {
        name: string;
        details?: string;
        nodes?: VueUiMoleculeDatasetNode[];
    };

    export type VueUiMoleculeConfig = {
        theme?: Theme;
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
                title?: ChartTitle;
                tooltip?: ChartTooltip & {
                    customFormat?:
                    | null
                    | ((
                        params: VueUiTooltipParams<
                            VueUiMoleculeDatapoint,
                            VueUiMoleculeDatapoint[],
                            VueUiMoleculeConfig
                        >
                    ) => string);
                };
                zoom?: {
                    speed?: number;
                };
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            th?: ChartTableCell;
            td?: ChartTableCell;
            translations?: {
                nodeName?: string;
                details?: string;
                ancestor?: string;
            };
        };
        userOptions?: ChartUserOptions;
    };

    export type VueUiMoleculeDatapoint = {
        circleRadius: number;
        color: string;
        name: string;
        details?: string;
        nodes?: VueUiMoleculeDatapoint;
        ancestor?: VueUiMoleculeDatapoint;
        polygonPath: {
            coordinates: Array<{
                x: number;
                y: number;
            }>;
        };
        uid: string;
    };

    export const VueUiMolecule: DefineComponent<{
        dataset: VueUiMoleculeDatasetNode[];
        config?: VueUiMoleculeConfig;
    }>;

    export type VueUiDigitsConfig = {
        backgroundColor?: string;
        height?: string;
        width?: string;
        digits?: {
            color?: string;
            skeletonColor?: string;
        };
    };

    export const VueUiDigits: DefineComponent<{
        dataset: number;
        config?: VueUiDigitsConfig;
    }>;

    export type VueUi3dBarDatasetBreakdown = {
        name: string;
        value: number;
    };

    export type VueUi3dBarDataset = {
        percentage?: number;
        series?: Array<{
            name: string;
            value: number;
            color?: string;
            breakdown?: VueUi3dBarDatasetBreakdown[];
        }>;
    };

    export type VueUi3dBarConfig = {
        theme?: Theme;
        customPalette?: string[];
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
                    strokeDasharray?: number;
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
                title?: ChartTitle;
                legend?: {
                    showDefault?: boolean;
                    fontSize?: number;
                    color?: string;
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
                    formatter?: Formatter;
                };
            };
        };
        userOptions?: ChartUserOptions;
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            columnNames?: {
                series?: string;
                value?: string;
                percentage?: string;
            };
            th?: ChartTableCell;
            td?: ChartTableCell & {
                roundingValue?: number;
                roundingPercentage?: number;
            };
        };
    };

    export const VueUi3dBar: DefineComponent<{
        config?: VueUi3dBarConfig;
        dataset: VueUi3dBarDataset;
    }>;

    export type VueUiMoodRadarDataset = {
        "1": number;
        "2": number;
        "3": number;
        "4": number;
        "5": number;
    };

    export type VueUiMoodRadarConfig = {
        theme?: Theme;
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
                        formatter?: Formatter;
                    };
                };
                title?: ChartTitle;
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
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
            th?: ChartTableCell;
            td?: ChartTableCell & {
                roundingValue?: number;
                roundingPercentage?: number;
            };
        };
        userOptions?: ChartUserOptions;
    };

    export const VueUiMoodRadar: DefineComponent<{
        dataset: VueUiMoodRadarDataset;
        config?: VueUiMoodRadarConfig;
    }>;

    export type VueUiIconName =
        | "accordion"
        | "annotator"
        | "annotatorDisabled"
        | "arrowBottom"
        | "arrowLeft"
        | "arrowRight"
        | "arrowTop"
        | "battery"
        | "boxes"
        | "carouselTable"
        | "chart3dBar"
        | "chartAgePyramid"
        | "chartBar"
        | "chartBullet"
        | "chartCandlestick"
        | "chartChestnut"
        | "chartCirclePack"
        | "chartCluster"
        | "chartDonut"
        | "chartDonutEvolution"
        | "chartDumbbell"
        | "chartFlow"
        | "chartFunnel"
        | "chartGalaxy"
        | "chartGauge"
        | "chartHeatmap"
        | "chartHistoryPlot"
        | "chartLine"
        | "chartMoodRadar"
        | "chartNestedDonuts"
        | "chartOnion"
        | "chartParallelCoordinatePlot"
        | "chartQuadrant"
        | "chartRadar"
        | "chartRelationCircle"
        | "chartRings"
        | "chartScatter"
        | "chartSparkHistogram"
        | "chartSparkStackbar"
        | "chartSparkbar"
        | "chartSparkline"
        | "chartStackbar"
        | "chartStripPlot"
        | "chartTable"
        | "chartTableSparkline"
        | "chartThermometer"
        | "chartTiremarks"
        | "chartVerticalBar"
        | "chartWaffle"
        | "chartWheel"
        | "chartWordCloud"
        | "circle"
        | "circleCancel"
        | "circleCheck"
        | "circleExclamation"
        | "circleFill"
        | "circleQuestion"
        | "clipBoard"
        | "clipboardBar"
        | "clipboardDonut"
        | "clipboardLine"
        | "clipboardVariable"
        | "close"
        | "colorPicker"
        | "copy"
        | "copyLeft"
        | "csv"
        | "cursor"
        | "dashboard"
        | "diamond"
        | "diamondFill"
        | "digit0"
        | "digit1"
        | "digit2"
        | "digit3"
        | "digit4"
        | "digit5"
        | "digit6"
        | "digit7"
        | "digit8"
        | "digit9"
        | "excel"
        | "exitFullscreen"
        | "fullscreen"
        | "func"
        | "hexagon"
        | "hexagonFill"
        | "image"
        | "kpi"
        | "kpiBox"
        | "labelClose"
        | "labelOpen"
        | "lambda"
        | "lap"
        | "legend"
        | "menu"
        | "moodEmbarrassed"
        | "moodFlat"
        | "moodHappy"
        | "moodLaughing"
        | "moodNeutral"
        | "moodSad"
        | "moodSurprised"
        | "moodWink"
        | "mu"
        | "numbers"
        | "palette"
        | "pause"
        | "pdf"
        | "pentagon"
        | "pentagonFill"
        | "people"
        | "play"
        | "ratio"
        | "refresh"
        | "restart"
        | "screenshot"
        | "settings"
        | "sigma"
        | "skeleton"
        | "smiley"
        | "sort"
        | "spin"
        | "square"
        | "squareFill"
        | "stack"
        | "star"
        | "starFace"
        | "starFill"
        | "stop"
        | "tableClose"
        | "tableOpen"
        | "tooltip"
        | "tooltipDisabled"
        | "trash"
        | "trend"
        | "trendDown"
        | "trendUp"
        | "triangle"
        | "triangleFill"
        | "unstack"
        | "vueDataUi"
        | "zoomMinus"
        | "zoomPlus";

    export const VueUiIcon: DefineComponent<{
        name: VueUiIconName;
        stroke?: string;
        strokeWidth?: number;
        size?: number;
        isSpin?: boolean;
    }>;

    export type VueUiDonutEvolutionConfig = {
        theme?: Theme;
        customPalette?: string[];
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                zoom?: ChartZoom;
                layout?: {
                    height?: number;
                    width?: number;
                    padding?: ChartPadding;
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
                                rotation?: number;
                                offsetY?: number;
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
                        formatter?: Formatter;
                    };
                };
                title?: ChartTitle;
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
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
            th?: ChartTableCell;
            td?: ChartTableCell & {
                roundingValue?: number;
                roundingPercentage?: number;
            };
        };
        userOptions?: ChartUserOptions;
    };

    export type VueUiDonutEvolutionDatasetItem = {
        name: string;
        values: number[];
        color?: string;
    };

    export const VueUiDonutEvolution: DefineComponent<{
        config?: VueUiDonutEvolutionConfig;
        dataset: VueUiDonutEvolutionDatasetItem[];
    }>;

    export type VueUiTiremarksConfig = {
        theme?: Theme;
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
                    rounding?: number;
                    verticalPosition?: "bottom" | "top";
                    horizontalPosition?: "left" | "right";
                    formatter?: Formatter;
                };
                title?: ChartTitle;
            };
        };
    };

    export type VueUiTiremarksDataset = {
        percentage: number;
    };

    export const VueUiTiremarks: DefineComponent<{
        config?: VueUiTiremarksConfig;
        dataset: VueUiTiremarksDataset;
    }>;

    export type VueUiWheelConfig = {
        responsive?: boolean;
        theme?: Theme;
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
                            sizeRatio?: number;
                            quantity?: number;
                            strokeWidth?: number;
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
                        formatter?: Formatter;
                    };
                };
                title?: ChartTitle;
            };
        };
        userOptions?: ChartUserOptions;
    };

    export type VueUiWheelDataset = {
        percentage: number;
    };

    export const VueUiWheel: DefineComponent<{
        dataset: VueUiWheelDataset;
        config?: VueUiWheelConfig;
    }>;

    export type VueUiRingsConfig = {
        responsive?: boolean;
        theme?: Theme;
        customPalette?: string[];
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
                            formatter?: Formatter;
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
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                    roundingValue?: number;
                    roundingPercentage?: number;
                };
                title?: ChartTitle;
                tooltip?: ChartTooltip & {
                    showValue?: boolean;
                    showPercentage?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    customFormat?:
                    | null
                    | ((
                        params: VueUiTooltipParams<
                            VueUiRingsDatapoint,
                            VueUiRingsDatapoint[],
                            VueUiRingsConfig
                        >
                    ) => string);
                };
            };
        };
        userOptions?: ChartUserOptions;
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            columnNames?: {
                series?: string;
                value?: string;
                percentage?: string;
            };
            th?: ChartTableCell;
            td?: ChartTableCell & {
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
    };

    export const VueUiRings: DefineComponent<{
        config?: VueUiRingsConfig;
        dataset: VueUiRingsDatasetItem[];
    }>;

    export type VueUiSparkHistogramConfig = {
        theme?: Theme;
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
                padding?: ChartPadding;
            };
            bars?: {
                shape?:
                | "circle"
                | "triangle"
                | "square"
                | "diamond"
                | "pentagon"
                | "hexagon"
                | "star";
                strokeWidth?: number;
                colors?: {
                    positive?: string;
                    negative?: string;
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
                    formatter?: Formatter;
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
                textAlign?: TextAlign;
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
        intensity?: number;
        color?: string;
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
    };

    export const VueUiSparkHistogram: DefineComponent<{
        config?: VueUiSparkHistogramConfig;
        dataset: VueUiSparkHistogramDatasetItem[];
    }>;

    export type VueUiSparkStackbarConfig = {
        theme?: Theme;
        customPalette?: string[];
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
                textAlign?: TextAlign;
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
                    formatter?: Formatter;
                };
                percentage?: {
                    show?: boolean;
                    color?: string;
                    bold?: boolean;
                    rounding?: number;
                };
            };
            title?: {
                textAlign?: TextAlign;
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
            tooltip?: ChartTooltip & {
                customFormat?:
                | null
                | ((
                    params: VueUiTooltipParams<
                        VueUiSparkStackbarDatasetItem,
                        VueUiSparkStackbarDatasetItem[],
                        VueUiSparkStackbarConfig
                    >
                ) => string);
            };
        };
    };

    export type VueUiSparkStackbarDatasetItem = {
        name: string;
        color?: string;
        proportion?: number;
        proportionLabel?: string;
        start?: number;
        value?: number;
        width?: number;
    };

    export const VueUiSparkStackbar: DefineComponent<{
        config?: VueUiSparkStackbarConfig;
        dataset: VueUiSparkStackbarDatasetItem[];
    }>;

    export type VueUiThermometerConfig = {
        theme?: Theme;
        customPalette?: string[];
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                height?: number;
                thermometer?: {
                    width?: number;
                };
                padding?: ChartPadding;
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
                    formatter?: Formatter;
                };
            };
            title?: ChartTitle;
        };
        userOptions?: ChartUserOptions;
    };

    export type VueUiThermometerDataset = {
        value: number;
        from: number;
        to: number;
        steps?: number;
        colors?: {
            from?: string;
            to?: string;
        };
    };

    export const VueUiThermometer: DefineComponent<{
        config?: VueUiThermometerConfig;
        dataset: VueUiThermometerDataset;
    }>;

    export type VueUiRelationCircleConfig = {
        responsive?: boolean;
        theme?: Theme;
        customPalette?: string[];
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
            weightLabels?: {
                size?: number;
                show?: boolean;
                formatter?: Formatter;
                prefix?: string;
                suffix?: string;
                rounding?: number;
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
                useSerieColor?: boolean;
                color?: string;
            };
            title?: ChartTitle;
        };
        userOptions?: ChartUserOptions;
    };

    export type VueUiRelationCircleDatasetItem = {
        id: string | number;
        label: string;
        relations: Array<string | number>;
        weights?: number[];
        color?: string;
    };

    export const VueUiRelationCircle: DefineComponent<{
        config?: VueUiRelationCircleConfig;
        dataset: VueUiRelationCircleDatasetItem[];
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
        };
    };

    export type VueUiAnnotatorDataset = VueUiUnknownObj;

    export const VueUiAnnotator: DefineComponent<{
        config?: VueUiAnnotatorConfig;
        dataset: VueUiAnnotatorDataset;
    }>;

    export type VueUiDashboardConfig = {
        locked?: boolean;
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
    };

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
        };
    };

    export const VueUiDashboard: DefineComponent<{
        config?: VueUiDashboardConfig;
        dataset: VueUiDashboardElement[];
    }>;

    export type VueUiSparkbarDatasetItem = {
        name: string;
        value: number;
        suffix?: string;
        prefix?: string;
        rounding?: number;
        color?: string;
        target?: number;
        formatter?: Formatter;
    };

    export type VueUiSparkbarConfig = {
        theme?: Theme;
        customPalette?: string[];
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
                showTargetValue?: boolean;
                targetValueText?: string;
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
                    position?:
                    | "left"
                    | "top"
                    | "top-left"
                    | "top-center"
                    | "top-right"
                    | "right"; // "top" legacy converts to "top-left"
                    width?: string;
                    color?: string;
                    bold?: boolean;
                };
                value?: {
                    show?: boolean;
                    bold?: boolean;
                };
            };
            title?: {
                backgroundColor?: string;
                bold?: boolean;
                color?: string;
                fontSize?: number;
                margin?: string;
                text?: string;
                textAlign?: TextAlign;
                subtitle?: {
                    bold?: boolean;
                    color?: string;
                    fontSize?: number;
                    text?: string;
                };
            };
            gap?: number;
        };
    };

    export const VueUiSparkbar: DefineComponent<{
        config?: VueUiSparkbarConfig;
        dataset: VueUiSparkbarDatasetItem[];
    }>;

    export type VueUiAgePyramidDataset = Array<Array<string | number>>;

    export type VueUiAgePyramidConfig = {
        responsive?: boolean;
        theme?: Theme;
        style?: {
            backgroundColor?: string;
            color?: string;
            fontFamily?: string;
            height?: number;
            width?: number;
            layout?: {
                padding?: ChartPadding;
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
                        formatter?: Formatter;
                    };
                    yAxis?: {
                        show?: boolean;
                        display?: string;
                        fontSize?: number;
                        color?: string;
                        bold?: boolean;
                        showEvery?: number;
                        formatter?: Formatter;
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
            title?: ChartTitle;
            tooltip?: ChartTooltip & {
                roundingValue?: number;
                customFormat?:
                | null
                | ((
                    params: VueUiTooltipParams<
                        VueUiAgePyramidDatapoint,
                        VueUiAgePyramidSeries[],
                        VueUiAgePyramidConfig
                    >
                ) => string);
            };
        };
        translations?: {
            age?: string;
            male?: string;
            female?: string;
            total?: string;
            year?: string;
        };
        userOptions?: ChartUserOptions;
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            th?: ChartTableCell;
            td?: ChartTableCell;
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
        config?: VueUiAgePyramidConfig;
        dataset: VueUiAgePyramidDataset;
    }>;

    export type VueUiCandlestickConfig = {
        responsive?: boolean;
        theme?: Theme;
        useCssAnimation?: boolean;
        style?: {
            backgroundColor?: string;
            color?: string;
            fontFamily?: string;
            height?: number;
            width?: number;
            layout?: {
                padding?: ChartPadding;
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
                            rotation?: number;
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
                        underlayer?: string;
                    };
                    widthRatio?: number;
                };
            };
            zoom?: ChartZoom;
            title?: ChartTitle;
            tooltip?: ChartTooltip & {
                roundingValue?: number;
                prefix?: string;
                suffix?: string;
                customFormat?:
                | null
                | ((
                    params: VueUiTooltipParams<
                        VueUiCandlestickDatapoint,
                        VueUiCandlestickDatapoint[],
                        VueUiCandlestickConfig
                    >
                ) => string);
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
        userOptions?: ChartUserOptions;
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            th?: ChartTableCell;
            td?: ChartTableCell & {
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
        config?: VueUiCandlestickConfig;
        dataset: Array<Array<string | number>>;
    }>;

    export type VueUiScatterDatasetValueItem = {
        name: string;
        x: number;
        y: number;
        shape?: Shape;
        weight?: number;
    };

    export type VueUiScatterDatasetItem = {
        name: string;
        values: VueUiScatterDatasetValueItem[];
        color: string;
        shape?: Shape;
    };

    export type VueUiScatterConfig = {
        responsive?: boolean;
        theme?: Theme;
        customPalette?: string[];
        useCssAnimation?: boolean;
        downsample?: {
            threshold?: number;
        };
        style?: {
            backgroundColor?: string;
            color?: string;
            fontFamily?: string;
            layout?: {
                height?: number;
                width?: number;
                padding?: ChartPadding;
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
                        useDistanceOpacity?: boolean;
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
                    selectors?: {
                        show?: boolean;
                        stroke?: string;
                        strokeWidth?: number;
                        strokeDasharray?: number;
                        labels?: {
                            fontSize?: number;
                            color?: string;
                            rounding?: number;
                            bold?: boolean;
                            showName?: boolean;
                            prefix?: string;
                            suffix?: string;
                            x?: {
                                formatter?: Formatter;
                            };
                            y?: {
                                formatter?: Formatter;
                            };
                        };
                        markers?: {
                            radius?: number;
                            stroke?: string;
                            strokeWidth?: number;
                            fill?: string;
                        };
                    };
                };
                marginalBars?: {
                    show?: boolean;
                    size?: number;
                    tranches?: number;
                    opacity?: number;
                    fill?: string;
                    strokeWidth?: number;
                    offset?: number;
                    borderRadius?: number;
                    useGradient?: boolean;
                    showLines?: boolean;
                    linesStrokeWidth?: number;
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
                        useSerieColor?: boolean;
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
            title?: ChartTitle;
            legend?: ChartBaseLegend & {
                backgroundColor?: string;
                roundingValue?: number;
            };
            tooltip?: ChartTooltip & {
                roundingValue?: number;
                showShape?: boolean;
                prefix?: string;
                suffix?: string;
                customFormat?:
                | null
                | ((
                    params: VueUiTooltipParams<
                        VueUiScatterDatapoint,
                        VueUiScatterSeries[],
                        VueUiScatterConfig
                    >
                ) => string);
            };
        };
        userOptions?: ChartUserOptions;
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            th?: ChartTableCell;
            td?: ChartTableCell & {
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
        shape: Shape | null;
        v: {
            x: number;
            y: number;
            name: string;
            weight?: number;
        };
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
        label: { x: number; y: number };
        name: string;
        opacity: number;
        plots: VueUiScatterDatapoint[];
        shape: Shape | null;
        values: Array<{ x: number; y: number; name: string }>;
    };

    export const VueUiScatter: DefineComponent<{
        config?: VueUiScatterConfig;
        dataset: VueUiScatterDatasetItem[];
    }>;

    export type VueUiHeatmapConfig = {
        theme?: Theme;
        style?: {
            backgroundColor?: string;
            color?: string;
            fontFamily?: string;
            layout?: {
                padding?: ChartPadding;
                cells?: {
                    height?: number;
                    value?: {
                        show?: boolean;
                        fontSize?: number;
                        bold?: boolean;
                        roundingValue?: number;
                        color?: string;
                        formatter?: Formatter;
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
                        showOnlyAtModulo?: number | null;
                        rotation?: number;
                        fontSize?: number;
                        color?: string;
                        bold?: boolean;
                        offsetX?: number;
                        offsetY?: number;
                    };
                    yAxis?: {
                        show?: boolean;
                        values?: Array<string | number>;
                        fontSize?: number;
                        color?: string;
                        bold?: boolean;
                        offsetY?: number;
                        offsetX?: number;
                    };
                };
            };
            title?: ChartTitle;
            legend?: ChartBaseLegend & {
                backgroundColor?: string;
                roundingValue?: number;
                position?: "right" | "bottom";
                scaleBorderRadius?: number;
            };
            tooltip?: ChartTooltip & {
                roundingValue?: number;
                customFormat?:
                | null
                | ((
                    params: VueUiTooltipParams<
                        VueUiHeatmapDatapoint,
                        VueUiHeatmapRow[],
                        VueUiHeatmapConfig
                    >
                ) => string);
            };
        };
        userOptions?: ChartUserOptions;
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            colNames?: {
                xAxis?: string;
            };
            th?: ChartTableCell;
            td?: ChartTableCell & {
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
    };

    export type VueUiHeatmapDatasetItem = {
        name: string;
        values: number[];
    };

    export const VueUiHeatmap: DefineComponent<{
        config?: VueUiHeatmapConfig;
        dataset: VueUiHeatmapDatasetItem[];
    }>;

    export type VueUiXyHighlightArea = {
        show?: boolean;
        from?: number;
        to?: number;
        color?: string;
        opacity?: number;
        caption?: {
            text?: string;
            fontSize?: number;
            color?: string;
            bold?: boolean;
            offsetY?: number;
            width?: "auto" | number;
            padding?: number;
            textAlign?: TextAlign;
        };
    };

    export type VueUiXyConfig = {
        responsive?: boolean;
        theme?: Theme;
        customPalette?: string[];
        useCssAnimation?: boolean;
        downsample?: {
            threshold?: number;
        };
        chart?: {
            fontFamily?: string;
            backgroundColor?: string;
            color?: string;
            height?: number;
            width?: number;
            zoom?: ChartZoom;
            padding?: ChartPadding;
            highlighter?: {
                color?: string;
                opacity?: number;
                useLine?: boolean;
                lineDasharray?: number;
                lineWidth?: number;
            };
            timeTag?: {
                show?: boolean;
                backgroundColor?: string;
                color?: string;
                fontSize?: number;
                circleMarker?: {
                    radius?: number;
                    color?: string;
                };
            };
            highlightArea?: VueUiXyHighlightArea | VueUiXyHighlightArea[];
            grid?: {
                stroke?: string;
                showHorizontalLines?: boolean;
                showVerticalLines?: boolean;
                position?: "middle" | "start";
                frame?: {
                    show?: boolean;
                    stroke?: string;
                    strokeWidth?: number;
                    strokeLinecap?: "round" | "butt" | "square";
                    strokeLinejoin?: "arcs" | "bevel" | "miter" | "miter-clip" | "round";
                    strokeDasharray?: number;
                };
                labels?: {
                    color?: string;
                    show?: boolean;
                    fontSize?: number;
                    axis?: {
                        yLabel?: string;
                        yLabelOffsetX?: number;
                        xLabel?: string;
                        xLabelOffsetY?: number;
                        fontSize?: number;
                    };
                    zeroLine?: {
                        show?: boolean;
                    };
                    yAxis?: {
                        commonScaleSteps?: number;
                        useIndividualScale?: boolean;
                        stacked?: boolean;
                        gap?: number;
                        labelWidth?: number;
                        showBaseline?: boolean;
                        formatter?: Formatter;
                        scaleMin?: number | null;
                        scaleMax?: number | null;
                    };
                    xAxis?: {
                        showBaseline?: boolean;
                    };
                    xAxisLabels?: {
                        color?: string;
                        show?: boolean;
                        values?: string[];
                        fontSize?: number;
                        showOnlyFirstAndLast?: boolean;
                        yOffset?: number;
                        rotation?: number;
                        showOnlyAtModulo?: boolean;
                        modulo?: number;
                    };
                };
            };
            comments?: ChartComments;
            labels?: {
                fontSize?: number;
                prefix?: string;
                suffix?: string;
            };
            legend?: {
                color?: string;
                show?: boolean;
                fontSize?: number;
            };
            title?: {
                show?: boolean;
                color?: string;
                text?: string;
                fontSize?: number;
                bold?: boolean;
                paddingLeft?: number;
                paddingRight?: number;
                textAlign?: TextAlign;
                subtitle?: {
                    fontSize?: number;
                    color?: string;
                    text?: string;
                    bold?: boolean;
                };
            };
            tooltip?: ChartTooltip & {
                showValue?: boolean;
                showPercentage?: boolean;
                roundingValue?: number;
                roundingPercentage?: number;
                customFormat?:
                | null
                | ((
                    params: VueUiTooltipParams<
                        VueUiXyDatapointItem[],
                        VueUiXySeries,
                        VueUiXyConfig,
                        VueUiXyDatasetBarItem[],
                        VueUiXyDatasetLineItem[],
                        VueUiXyDatasetPlotItem[]
                    >
                ) => string);
                showTimeLabel?: boolean;
            };
            userOptions?: ChartUserOptions;
        };
        bar?: {
            borderRadius?: number;
            useGradient?: boolean;
            periodGap?: number;
            border?: {
                useSerieColor?: boolean;
                strokeWidth?: number;
                stroke?: string;
            };
            labels?: {
                show?: boolean;
                offsetY?: number;
                rounding?: number;
                color?: string;
                formatter?: Formatter;
            };
            serieName?: {
                abbreviationSize?: number;
                bold?: boolean;
                color?: string;
                offsetY?: number;
                show?: boolean;
                useAbbreviation?: boolean;
                useSerieColor?: boolean;
            };
        };
        line?: {
            radius?: number;
            useGradient?: boolean;
            strokeWidth?: number;
            dot?: {
                hideAboveMaxSerieLength?: number;
                useSerieColor?: boolean;
                fill?: string;
                strokeWidth?: number;
            };
            labels?: {
                show?: boolean;
                offsetY?: number;
                rounding?: number;
                color?: string;
                formatter?: Formatter;
            };
            area?: {
                useGradient?: boolean;
                opacity?: number;
            };
        };
        plot?: {
            radius?: number;
            useGradient?: boolean;
            dot?: {
                useSerieColor?: boolean;
                fill?: string;
                strokeWidth?: number;
            };
            labels?: {
                show?: boolean;
                offsetY?: number;
                rounding?: number;
                color?: string;
                formatter?: Formatter;
            };
        };
        table?: {
            rounding?: number;
            responsiveBreakpoint?: number;
            sparkline?: boolean;
            showSum?: boolean;
            columnNames?: {
                period?: string;
                total?: string;
            };
            th?: ChartTableCell;
            td?: ChartTableCell;
        };
        showTable?: boolean;
    };

    export type VueUiXyDatasetItem = {
        name: string;
        series: number[];
        type: "bar" | "line" | "plot";
        color?: string;
        dashed?: boolean;
        useTag?: "start" | "end" | "none";
        showSerieName?: "start" | "end";
        useArea?: boolean;
        dataLabels?: boolean;
        useProgression?: boolean;
        scaleSteps?: number;
        scaleLabel?: string;
        scaleMax?: number;
        scaleMin?: number;
        autoScaling?: boolean;
        stackRatio?: number;
        comments?: string[];
        shape?: Shape;
        smooth?: boolean;
        prefix?: string;
        suffix?: string;
    };

    export type VueUiXyDatasetBarItem = {
        absoluteValues: number[];
        color: string;
        id: string;
        name: string;
        plots: Array<{ x: number; y: number; value: number }>;
        series: number[];
        type: "bar";
    };

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
        shape: Shape | null;
        type: "line";
        useArea: boolean;
        useProgression: boolean;
        smooth?: boolean;
        useTag?: boolean;
    };

    export type VueUiXyDatasetPlotItem = {
        absoluteValues: number[];
        color: string;
        id: string;
        name: string;
        plots: Array<{ x: number; y: number; value: number }>;
        series: number[];
        shape: Shape | null;
        type: "plot";
        useTag?: boolean;
        useProgression?: boolean;
    };

    export type VueUiXySeries = Array<
        VueUiXyDatasetBarItem | VueUiXyDatasetLineItem | VueUiXyDatasetPlotItem
    >;

    export type VueUiXyDatapointItem = {
        color: string;
        name: string;
        shape: Shape | null;
        type: "bar" | "line" | "plot";
        value: number;
    };

    export const VueUiXy: DefineComponent<{
        config?: VueUiXyConfig;
        dataset: VueUiXyDatasetItem[];
    }>;

    export type VueUiDonutConfig = {
        type?: "classic" | "polar";
        responsive?: boolean;
        theme?: Theme;
        customPalette?: string[];
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
                    labels?: {
                        dataLabels?: {
                            show?: boolean;
                            useLabelSlots?: boolean;
                            hideUnderValue?: number;
                            prefix?: string;
                            suffix?: string;
                        };
                        value?: {
                            rounding?: number;
                            show?: boolean;
                            formatter?: Formatter;
                        };
                        percentage?: {
                            color?: string;
                            bold?: boolean;
                            fontSize?: number;
                            rounding?: number;
                            formatter?: Formatter;
                        };
                        name?: {
                            color?: string;
                            bold?: boolean;
                            fontSize?: number;
                        };
                        hollow?: {
                            show?: boolean;
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
                                    formatter?: Formatter;
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
                                    formatter?: Formatter;
                                };
                            };
                        };
                    };
                    donut?: {
                        borderWidth?: number;
                        strokeWidth?: number;
                        useShadow?: boolean;
                        shadowColor?: string;
                    };
                };
                comments?: ChartComments;
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                    roundingValue?: number;
                    roundingPercentage?: number;
                };
                title?: ChartTitle;
                tooltip?: ChartTooltip & {
                    showValue?: boolean;
                    showPercentage?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    customFormat?:
                    | null
                    | ((
                        params: VueUiTooltipParams<
                            VueUiDonutDatapoint,
                            VueUiDonutSeriesItem[],
                            VueUiDonutConfig
                        >
                    ) => string);
                };
            };
        };
        userOptions?: ChartUserOptions;
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
            };
            th?: ChartTableCell;
            td?: ChartTableCell & {
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
        center: {
            startX: number;
            startY: number;
            endX: number;
            endY: number;
            path: string;
        };
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
    };

    export const VueUiDonut: DefineComponent<{
        config?: VueUiDonutConfig;
        dataset: VueUiDonutDatasetItem[];
    }>;

    export type VueUiNestedDonutsDatasetItem = {
        name: string;
        series: VueUiDonutDatasetItem[];
    };

    export type VueUiNestedDonutsConfig = {
        responsive?: boolean;
        theme?: Theme;
        customPalette?: string[];
        useCssAnimation?: boolean;
        useBlurOnHover?: boolean;
        userOptions?: ChartUserOptions;
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
                            formatter?: Formatter;
                        };
                    };
                    donut?: {
                        strokeWidth?: number;
                        borderWidth?: number;
                        spacingRatio?: number;
                        useShadow?: boolean;
                        shadowColor?: string;
                    };
                };
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                    roundingValue?: number;
                    roundingPercentage?: number;
                };
                title?: ChartTitle;
                tooltip?: ChartTooltip & {
                    showAllItemsAtIndex?: boolean;
                    showValue?: boolean;
                    showPercentage?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    customFormat?:
                    | null
                    | ((
                        params: VueUiTooltipParams<
                            VueUiNestedDonutsDatapoint,
                            VueUiNestedDonutsSeriesItem[],
                            VueUiNestedDonutsConfig
                        >
                    ) => string);
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
            th?: ChartTableCell;
            td?: ChartTableCell & {
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
        }>;
    };

    export type VueUiNestedDonutsDatapoint = {
        absoluteValues: number[];
        arcOf: string;
        arcOfId: string;
        arcSlice: string;
        center: {
            startX: number;
            startY: number;
            path: string;
            endX: number;
            endY: number;
        };
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
        config?: VueUiNestedDonutsConfig;
        dataset: VueUiNestedDonutsDatasetItem[];
    }>;

    export type VueUiWaffleConfig = {
        responsive?: boolean;
        theme?: Theme;
        customPalette?: string[];
        useBlurOnHover?: boolean;
        useCustomCells?: boolean;
        useAnimation?: boolean;
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
                            formatter?: Formatter;
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
                };
                title?: ChartTitle;
                tooltip?: ChartTooltip & {
                    showValue?: boolean;
                    showPercentage?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    customFormat?:
                    | null
                    | ((
                        params: VueUiTooltipParams<
                            VueUiWaffleDatapoint,
                            VueUiWaffleSerieItem[],
                            VueUiWaffleConfig
                        >
                    ) => string);
                };
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                    roundingValue?: number;
                    roundingPercentage?: number;
                };
            };
        };
        userOptions?: ChartUserOptions;
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            columnNames?: {
                series?: string;
                value?: string;
                percentage?: string;
            };
            th?: ChartTableCell;
            td?: ChartTableCell & {
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
    };

    export type VueUiWaffleSerieItem = {
        absoluteIndex: number;
        color: string;
        name: string;
        shape: Shape | null;
        uid: string;
        values: number[];
    };

    export type VueUiWaffleDatasetItem = {
        name: string;
        color?: string;
        values: number[];
    };

    export const VueUiWaffle: DefineComponent<{
        config?: VueUiWaffleConfig;
        dataset: VueUiWaffleDatasetItem[];
    }>;

    export type VueUiRadarConfig = {
        responsive?: boolean;
        theme?: Theme;
        customPalette?: string[];
        useCssAnimation?: boolean;
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                layout?: {
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
                title?: ChartTitle;
                tooltip?: ChartTooltip & {
                    showValue?: boolean;
                    showPercentage?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    animation?: {
                        show?: boolean;
                        animationFrames?: number;
                    };
                    customFormat?:
                    | null
                    | ((
                        params: VueUiTooltipParams<
                            VueUiRadarDatapoint,
                            VueUiRadarSeries,
                            VueUiRadarConfig
                        >
                    ) => string);
                };
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                    roundingPercentage?: number;
                };
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            th?: ChartTableCell;
            td?: ChartTableCell & {
                roundingValue?: number;
                roundingPercentage?: number;
            };
        };
        userOptions?: ChartUserOptions;
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
    };

    export type VueUiRadarCategory = {
        categoryId: string;
        color: string;
        name: string;
        prefix?: string;
        suffix?: string;
    };

    export type VueUiRadarDatapointItem = {
        color: string;
        name: string;
        serieId: string;
        target?: number;
        values: number[];
    };

    export type VueUiRadarSeries = {
        categories: VueUiRadarCategory[];
        datapoints: VueUiRadarDatapointItem[];
        radar: VueUiRadarDatapoint[];
    };

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
        formatter?: Formatter;
    };

    export type VueUiRadarDataset = {
        categories: VueUiRadarDatasetCategoryItem[];
        series: VueUiRadarDatasetSerieItem[];
    };

    export const VueUiRadar: DefineComponent<{
        config?: VueUiRadarConfig;
        dataset: VueUiRadarDataset;
    }>;

    export type VueUiQuadrantDatasetSerieItem = {
        name: string;
        x: number;
        y: number;
    };

    export type VueUiQuadrantDatasetItem = {
        name: string;
        shape?: Shape;
        color?: string;
        series: VueUiQuadrantDatasetSerieItem[];
    };

    export type VueUiQuadrantSideConfig = {
        text?: string;
        color?: string;
        fontSize?: number;
        bold?: boolean;
    };

    export type VueUiQuadrantConfig = {
        responsive?: boolean;
        theme?: Theme;
        useCssAnimation?: boolean;
        zoomAnimationFrames?: number;
        downsample?: {
            threshold?: number;
        };
        style?: {
            fontFamily?: string;
            chart?: {
                height?: number;
                width?: number;
                backgroundColor?: string;
                color?: string;
                layout?: {
                    labels?: {
                        quadrantLabels?: {
                            show?: boolean;
                            tl?: VueUiQuadrantSideConfig;
                            tr?: VueUiQuadrantSideConfig;
                            br?: VueUiQuadrantSideConfig;
                            bl?: VueUiQuadrantSideConfig;
                        };
                        plotLabels?: {
                            showAsTag?: boolean;
                            show?: boolean;
                            fontSize?: number;
                            color?: string;
                            offsetY?: number;
                            rounding?: number;
                            x?: {
                                formatter?: Formatter;
                            };
                            y?: {
                                formatter?: Formatter;
                            };
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
                title?: ChartTitle;
                tooltip?: ChartTooltip & {
                    roundingValue?: number;
                    customFormat?:
                    | null
                    | ((
                        params: VueUiTooltipParams<
                            VueUiQuadrantDatapoint,
                            VueUiQuadrantSerie[],
                            VueUiQuadrantConfig
                        >
                    ) => string);
                    showShape?: boolean;
                };
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                };
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            th?: ChartTableCell;
            td?: ChartTableCell & {
                roundingValue?: number;
            };
        };
        userOptions?: ChartUserOptions;
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
        shape: Shape;
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
        shape: Shape;
    };

    export const VueUiQuadrant: DefineComponent<{
        dataset: VueUiQuadrantDatasetItem[];
        config?: VueUiQuadrantConfig;
    }>;

    export type VueUiGaugeDatasetSerieItem = {
        from: number;
        to: number;
        color?: string;
        name?: string;
        nameOffsetRatio?: number;
    };

    export type VueUiGaugeDataset = {
        base?: number;
        value: number;
        series: VueUiGaugeDatasetSerieItem[];
        id?: string | number;
    };

    export type VueUiGaugeConfig = {
        responsive?: boolean;
        theme?: Theme;
        customPalette?: string[];
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
                    radiusRatio?: number;
                    track?: {
                        size?: number;
                        useGradient?: boolean;
                        gradientIntensity?: number;
                    };
                    markers?: {
                        show?: boolean;
                        color?: string;
                        bold?: boolean;
                        fontSizeRatio?: number;
                        offsetY?: number;
                        roundingValue?: number;
                        formatter?: Formatter;
                        prefix?: string;
                        suffix?: string;
                    };
                    segmentSeparators?: {
                        show?: boolean;
                        offsetOut?: number;
                        offsetIn?: number;
                        stroke?: string;
                        strokeWidth?: number;
                    };
                    segmentNames?: {
                        show?: boolean;
                        curved?: boolean;
                        offsetRatio?: number;
                        fontSize?: number;
                        useSerieColor?: boolean;
                        color?: string;
                        bold?: boolean;
                    };
                    indicatorArc?: {
                        fill?: string;
                        radius?: number;
                        show?: boolean;
                    };
                    pointer?: {
                        show?: boolean;
                        type?: "rounded" | "pointy";
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
                    show?: boolean;
                    fontSize?: number;
                    prefix?: string;
                    suffix?: string;
                    roundingValue?: number;
                    showPlusSymbol?: boolean;
                    useRatingColor?: boolean;
                    color?: string;
                    formatter?: Formatter;
                };
                title?: ChartTitle;
            };
        };
        userOptions?: ChartUserOptions;
        translations?: {
            base?: string;
        };
    };

    export const VueUiGauge: DefineComponent<{
        config?: VueUiGaugeConfig;
        dataset: VueUiGaugeDataset;
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
        theme?: Theme;
        customPalette?: string[];
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
                        formatter?: Formatter;
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
                            formatter?: Formatter;
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
                                formatter?: Formatter;
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
                                    formatter?: Formatter;
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
                        textAlign?: TextAlign;
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
            th?: ChartTableCell & {
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
            td?: ChartTableCell & {
                roundingValue?: number;
                roundingPercentage?: number;
            };
        };
        userOptions?: ChartUserOptions;
        translations?: {
            total?: string;
            proportionToTree?: string;
            of?: string;
        };
    };

    export const VueUiChestnut: DefineComponent<{
        config?: VueUiChestnutConfig;
        dataset: VueUiChestnutDatasetRoot[];
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
        responsive?: boolean;
        theme?: Theme;
        customPalette?: string[];
        useCssAnimation?: boolean;
        useStartAnimation?: boolean;
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                useGradient?: boolean;
                gradientIntensity?: number;
                layout?: {
                    maxThickness?: number;
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
                            formatter?: Formatter;
                        };
                        percentage?: {
                            show?: boolean;
                        };
                    };
                };
                title?: ChartTitle;
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                    roundingValue?: number;
                    roundingPercentage?: number;
                };
                tooltip?: ChartTooltip & {
                    showValue?: boolean;
                    showPercentage?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    customFormat?:
                    | null
                    | ((
                        params: VueUiTooltipParams<
                            VueUiOnionDatapoint,
                            VueUiOnionSeriesItem[],
                            VueUiOnionConfig
                        >
                    ) => string);
                };
            };
        };
        userOptions?: ChartUserOptions;
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            th?: ChartTableCell;
            td?: ChartTableCell & {
                roundingValue?: number;
                roundingPercentage?: number;
            };
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
        shape: Shape;
        suffix: string;
        value: number;
    };

    export type VueUiOnionSeriesItem = {
        absoluteIndex: number;
        color: string;
        id: string;
        name: string;
        opacity: number;
        percentage: number;
        prefix: string;
        shape?: Shape;
        suffix: string;
        value: number;
    };

    export const VueUiOnion: DefineComponent<{
        config?: VueUiOnionConfig;
        dataset: VueUiOnionDatasetItem[];
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
        responsive?: boolean;
        theme?: Theme;
        customPalette?: string[];
        useCssAnimation?: boolean;
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                layout?: {
                    bars?: {
                        sort?: "desc" | "asc" | "none";
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
                                formatter?: Formatter;
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
                title?: ChartTitle;
                legend?: ChartBaseLegend & {
                    position?: "top" | "bottom";
                    backgroundColor?: string;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    prefix?: string;
                    suffix?: string;
                };
                tooltip?: ChartTooltip & {
                    showValue?: boolean;
                    showPercentage?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    prefix?: string;
                    suffix?: string;
                    customFormat?:
                    | null
                    | ((
                        params: VueUiTooltipParams<
                            VueUiVerticalBarDatapoint,
                            VueUiVerticalBarSerie[],
                            VueUiVerticalBarConfig
                        >
                    ) => string);
                };
            };
        };
        userOptions?: ChartUserOptions;
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            th?: ChartTableCell;
            td?: ChartTableCell & {
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
        shape?: Shape;
        value: number;
    };

    export const VueUiVerticalBar: DefineComponent<{
        config?: VueUiVerticalBarConfig;
        dataset: VueUiVerticalBarDatasetItem[];
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
        theme?: Theme;
        type?: "line" | "bar";
        responsive?: boolean;
        downsample?: {
            threshold?: number;
        };
        style?: {
            backgroundColor?: string;
            fontFamily?: string;
            chartWidth?: number;
            scaleMin?: number | null;
            scaleMax?: number | null;
            padding?: ChartPadding;
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
                formatter?: Formatter;
            };
            title?: {
                show?: boolean;
                textAlign?: TextAlign;
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
        config?: VueUiSparklineConfig;
        dataset: VueUiSparklineDatasetItem[];
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
    };

    export type VueUiTableDataset = {
        header: VueUiTableDatasetHeaderItem[];
        body: VueUiTableDatasetBodyItem[];
    };

    export type VueUiTableConfig = {
        fontFamily?: string;
        maxHeight?: number;
        rowsPerPage?: number;
        style?: {
            th?: ChartTableCell & {
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
            };
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
                    };
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
        config?: VueUiTableConfig;
        dataset: VueUiTableDataset;
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
                textAlign?: TextAlign;
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
                position?: "bottom" | "top" | "left" | "right";
                offsetY?: number;
                offsetX?: number;
                formatter?: Formatter;
            };
            tooltip?: ChartTooltip & {
                offsetY?: number;
                bold?: boolean;
                roundingValue?: number;
                formatter?: Formatter;
            };
        };
    };

    export const VueUiRating: DefineComponent<{
        config?: VueUiRatingConfig;
        dataset: VueUiRatingDataset;
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
                textAlign?: TextAlign;
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
                formatter?: Formatter;
            };
            tooltip?: ChartTooltip & {
                offsetY?: number;
                bold?: boolean;
                roundingValue?: number;
                formatter?: Formatter;
            };
        };
    };

    export const VueUiSmiley: DefineComponent<{
        config?: VueUiSmileyConfig;
        dataset: VueUiRatingDataset;
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
        config?: VueUiScreenshotConfig;
    }>;

    export type VueUiSkeletonConfig = {
        type?:
        | "bar"
        | "chestnut"
        | "donut"
        | "gauge"
        | "line"
        | "onion"
        | "quadrant"
        | "radar"
        | "rating"
        | "table"
        | "verticalBar"
        | "waffle"
        | "heatmap"
        | "candlestick"
        | "pyramid"
        | "wheel"
        | "rings"
        | "donutEvolution"
        | "tiremarks"
        | "molecule"
        | "relationCircle"
        | "thermometer"
        | "sparkbar"
        | "sparkStackbar"
        | "sparkHistogram"
        | "bar3d"
        | "galaxy"
        | "treemap"
        | "stripPlot"
        | "dumbbell"
        | "parallelCoordinatePlot"
        | "flow"
        | "bullet"
        | "historyPlot"
        | "circlePack";
        style?: {
            backgroundColor?: string;
            color?: string;
            animated?: boolean;
            circlePack?: {
                color?: string;
            };
            historyPlot?: {
                color?: string;
            };
            bullet?: {
                color?: string;
            };
            flow?: {
                color?: string;
            };
            parallelCoordinatePlot?: {
                color?: string;
            };
            treemap?: {
                color?: string;
            };
            dumbbell?: {
                color?: string;
            };
            stripPlot?: {
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
                };
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
            };
        };
    };

    export const VueUiSkeleton: DefineComponent<{
        config?: VueUiSkeletonConfig;
    }>;

    export type VueUiTableHeatmapDatasetItem = {
        name: string;
        values: Array<number | string>;
        color?: string;
        shape?:
        | "circle"
        | "triangle"
        | "square"
        | "diamond"
        | "pentagon"
        | "hexagon"
        | "star";
    };

    export type VueUiTableHeatmapConfig = {
        theme?: Theme;
        style?: {
            backgroundColor?: string;
            color?: string;
            fontFamily?: string;
            shapeSize?: number;
            heatmapColors?: {
                useIndividualScale?: boolean;
                min?: string;
                max?: string;
            };
        };
        table?: {
            responsiveBreakpoint?: number;
            borderWidth?: number;
            showSum?: boolean;
            showAverage?: boolean;
            showMedian?: boolean;
            head?: {
                backgroundColor?: string;
                color?: string;
                values?: string[];
            };
        };
        userOptions?: ChartUserOptions;
    };

    export const VueUiTableHeatmap: DefineComponent<{
        config?: VueUiTableHeatmapConfig;
        dataset: VueUiTableHeatmapDatasetItem[];
    }>;

    export type VueUiAccordionConfig = {
        open?: boolean;
        maxHeight: number;
        head?: {
            useArrowSlot?: boolean;
            backgroundColor?: string;
            color?: string;
            iconColor?: string;
            padding?: string;
        };
        body?: {
            backgroundColor?: string;
            color?: string;
        };
    };

    export const VueUiAccordion: DefineComponent<{
        config?: VueUiAccordionConfig;
    }>;

    export type VueUiQuickChartConfig = {
        responsive?: boolean;
        theme?: Theme;
        axisLabelsFontSize?: number;
        backgroundColor?: string;
        barAnimated?: boolean;
        barGap?: number;
        barStrokeWidth?: number;
        blurOnHover?: boolean;
        chartIsBarUnderDatasetLength?: number;
        color?: string;
        customPalette?: string[];
        dataLabelFontSize?: number;
        dataLabelRoundingPercentage?: number;
        dataLabelRoundingValue?: number;
        donutHideLabelUnderPercentage?: number;
        donutLabelMarkerStrokeWidth?: number;
        donutRadiusRatio?: number;
        donutShowTotal?: boolean;
        donutStrokeWidth?: number;
        donutThicknessRatio?: number;
        donutTotalLabelFontSize?: number;
        donutTotalLabelOffsetY?: number;
        donutTotalLabelText?: string;
        donutUseShadow?: boolean;
        donutShadowColor?: string;
        fontFamily?: string;
        formatter?: Formatter;
        height?: number | null;
        legendFontSize?: number;
        legendIcon?: VueUiIconName;
        legendIconSize?: number;
        lineAnimated?: boolean;
        lineSmooth?: boolean;
        lineStrokeWidth?: number;
        paletteStartIndex?: number;
        showDataLabels?: boolean;
        showLegend?: boolean;
        showTooltip?: boolean;
        showUserOptions?: boolean;
        title?: string;
        titleBold?: boolean;
        titleFontSize?: number;
        titleTextAlign?: TextAlign;
        tooltipBackgroundOpacity?: number;
        tooltipCustomFormat?: any;
        tooltipBorderRadius?: number;
        tooltipBorderColor?: string;
        tooltipBorderWidth?: number;
        tooltipFontSize?: number;
        tooltipPosition?: TooltipPosition;
        tooltipOffsetY?: number;
        useCustomLegend?: boolean;
        valuePrefix?: string;
        valueSuffix?: string;
        width?: number | null;
        xAxisLabel?: string;
        xyAxisStroke?: string;
        xyAxisStrokeWidth?: number;
        xyGridStroke?: string;
        xyGridStrokeWidth?: number;
        xyHighlighterColor?: string;
        xyHighlighterOpacity?: number;
        xyLabelsXFontSize?: number;
        xyLabelsYFontSize?: number;
        xyPaddingBottom?: number;
        xyPaddingLeft?: number;
        xyPaddingRight?: number;
        xyPaddingTop?: number;
        xyPeriods?: Array<number | string>;
        xyPeriodLabelsRotation?: number;
        xyScaleSegments?: number;
        xyShowAxis?: boolean;
        xyShowGrid?: boolean;
        xyShowScale?: boolean;
        yAxisLabel?: string;
        zoomXy?: boolean;
        zoomColor?: string;
        zoomHighlightColor?: string;
        zoomFontSize?: number;
        zoomUseResetSlot?: boolean;
        zoomMinimap?: ZoomMinimap;
        zoomStartIndex?: number | null;
        zoomEndIndex?: number | null;
        zoomEnableRangeHandles?: boolean;
        zoomEnableSelectionDrag?: boolean;
        userOptionsPosition?: "right" | "left";
        userOptionsButtons?: {
            tooltip?: boolean;
            pdf?: boolean;
            img?: boolean;
            fullscreen?: boolean;
        };
        userOptionsButtonTitles?: {
            open?: string;
            close?: string;
            tooltip?: string;
            pdf?: string;
            img?: string;
            fullscreen?: string;
        };
        showUserOptionsOnChartHover?: boolean;
        keepUserOptionsStateOnChartLeave?: boolean;
    };

    export type VueUiQuickChartDatasetObjectItem = {
        [key: string]: string | number | number[];
    };

    export type VueUiQuickChartDataset =
        | number[]
        | VueUiQuickChartDatasetObjectItem
        | VueUiQuickChartDatasetObjectItem[];

    export const VueUiQuickChart: DefineComponent<{
        config?: VueUiQuickChartConfig;
        dataset: VueUiQuickChartDataset;
    }>;

    export type VueUiCursorConfig = {
        bubbleEffect?: boolean;
        bubbleEffectColor?: string;
        bubbleEffectOpacity?: number;
        centerCircleColor?: string;
        centerCircleDasharray?: number;
        centerCircleOpacity?: number;
        centerCircleRadius?: number;
        centerCircleStroke?: string;
        centerCircleStrokeWidth?: number;
        coordinatesColor?: string;
        coordinatesFontSize?: number;
        coordinatesOffset?: number;
        crosshairDasharray?: number;
        crosshairStroke?: string;
        crosshairStrokeWidth?: number;
        intersectCirclesFill?: string;
        intersectCirclesRadius?: number;
        isLoading?: boolean;
        parentId?: string;
        showCenterCircle?: boolean;
        showCoordinates?: boolean;
        showCrosshair?: boolean;
        showIntersectCircles?: boolean;
        useWaveOnClick?: boolean;
    };

    export const VueUiCursor: DefineComponent<{
        config?: VueUiCursorConfig;
    }>;

    export type VueUiSparkTrendConfig = {
        theme?: Theme;
        downsample?: {
            threshold?: number;
        };
        style?: {
            backgroundColor?: string;
            fontFamily?: string;
            animation?: {
                show?: boolean;
                animationFrames?: number;
            };
            line?: {
                stroke?: string;
                strokeWidth?: number;
                strokeLinecap?: "round" | "butt" | "square";
                strokeLinejoin?: "arcs" | "bevel" | "miter" | "miter-clip" | "round";
                smooth?: boolean;
                useColorTrend?: boolean;
            };
            area?: {
                show?: boolean;
                useGradient?: boolean;
                opacity?: number;
            };
            dataLabel?: {
                show?: boolean;
                useColorTrend?: boolean;
                color?: string;
                fontSize?: number;
                bold?: boolean;
                prefix?: string;
                suffix?: string;
                rounding?: number;
                formatter?: Formatter;
            };
            trendLabel?: {
                trendType?: "global" | "n-1" | "lastToFirst";
                useColorTrend?: boolean;
                color?: string;
                fontSize?: number;
                bold?: boolean;
                rounding?: number;
            };
            arrow?: {
                colors?: {
                    positive?: string;
                    neutral?: string;
                    negative?: string;
                };
            };
            padding?: ChartPadding;
        };
    };

    export const VueUiSparkTrend: DefineComponent<{
        dataset: number[];
        config?: VueUiSparkTrendConfig;
    }>;

    export type VueUiStripPlotConfig = {
        responsive?: boolean;
        theme?: Theme;
        customPalette?: string[];
        useCssAnimation?: boolean;
        userOptions?: ChartUserOptions;
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            columnNames?: {
                series?: string;
                value?: string;
            };
            th?: ChartTableCell;
            td?: ChartTableCell & {
                roundingValue?: number;
            };
        };
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                height?: number;
                stripWidth?: number;
                padding?: ChartPadding;
                grid?: {
                    show?: boolean;
                    stroke?: string;
                    strokeWidth?: number;
                    scaleSteps?: number;
                    horizontalGrid?: {
                        show?: boolean;
                        stroke?: string;
                        strokeWidth?: number;
                        strokeDasharray?: number;
                    };
                    verticalGrid?: {
                        show?: boolean;
                        stroke?: string;
                        strokeWidth?: number;
                        strokeDasharray?: number;
                    };
                };
                plots?: {
                    opacity?: number;
                    radius?: number;
                    stroke?: string;
                    strokeWidth?: number;
                    shape?: Shape;
                    gradient?: {
                        show?: boolean;
                        intensity?: number;
                    };
                };
                labels?: {
                    prefix?: string;
                    suffix?: string;
                    formatter?: Formatter;
                    bestPlotLabel?: {
                        show?: boolean;
                        showValue?: boolean;
                        fontSize?: number;
                        color?: string;
                        rounding?: number;
                        offsetY?: number;
                    };
                    axis?: {
                        xLabel?: string;
                        xLabelOffsetY?: number;
                        yLabel?: string;
                        yLabelOffsetX?: number;
                        fontSize?: number;
                        color?: string;
                    };
                    xAxisLabels?: {
                        show?: boolean;
                        color?: string;
                        fontSize?: number;
                        offsetY?: number;
                    };
                    yAxisLabels?: {
                        show?: boolean;
                        color?: string;
                        fontSize?: number;
                        rounding?: number;
                        offsetX?: number;
                    };
                };
                title?: ChartTitle;
                tooltip?: ChartTooltip & {
                    roundingValue?: number;
                    customFormat?:
                    | null
                    | ((
                        params: VueUiTooltipParams<
                            VueUiStripPlotDatapoint,
                            VueUiStripPlotSeriesItem[],
                            VueUiStripPlotConfig
                        >
                    ) => string);
                };
            };
        };
    };

    export type VueUiStripPlotDatapoint = {
        color: string;
        id: string;
        name: string;
        parentId: string;
        value: number;
        x: number;
        y: number;
    };

    export type VueUiStripPlotSeriesItem = Array<{
        color: string;
        id: string;
        name: string;
        plots: Array<Partial<VueUiStripPlotDatapoint>>;
    }>;

    export type VueUiStripPlotDatasetItem = {
        name: string;
        value: number;
    };

    export type VueUiStripPlotDataset = {
        name: string;
        plots: VueUiStripPlotDatasetItem[];
    };

    export const VueUiStripPlot: DefineComponent<{
        config?: VueUiStripPlotConfig;
        dataset: VueUiStripPlotDataset[];
    }>;

    export type VueUiDumbbellConfigLabel = {
        color?: string;
        fontSize?: number;
        offsetY?: number;
        rounding?: number;
        show?: boolean;
    };

    export type VueUiDumbbellConfig = {
        reponsive?: boolean;
        theme?: Theme;
        useAnimation?: boolean;
        animationSpeed?: number;
        userOptions?: ChartUserOptions;
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                width?: number;
                rowHeight?: number;
                padding?: ChartPadding;
                plots?: {
                    startColor?: string;
                    endColor?: string;
                    radius?: number;
                    stroke?: string;
                    strokeWidth?: number;
                    link?: {
                        strokeWidth?: number;
                        type?: "curved" | "line";
                    };
                    gradient?: {
                        show?: boolean;
                        intensity?: number;
                    };
                };
                grid?: {
                    strokeWidth?: number;
                    scaleSteps?: number;
                    horizontalGrid?: {
                        show?: boolean;
                        stroke?: string;
                        strokeWidth?: number;
                        strokeDasharray?: number;
                    };
                    verticalGrid?: {
                        show?: boolean;
                        stroke?: string;
                        strokeWidth?: number;
                        strokeDasharray?: number;
                    };
                };
                labels?: {
                    prefix?: string;
                    suffix?: string;
                    formatter?: Formatter;
                    yAxisLabels?: {
                        bold?: boolean;
                        color?: string;
                        fontSize?: number;
                        offsetX?: number;
                        rounding?: number;
                        show?: boolean;
                        showProgression?: boolean;
                    };
                    xAxisLabels?: VueUiDumbbellConfigLabel & {
                        bold?: boolean;
                    };
                    startLabels?: VueUiDumbbellConfigLabel & {
                        useStartColor?: boolean;
                    };
                    endLabels?: VueUiDumbbellConfigLabel & {
                        useEndColor?: boolean;
                    };
                };
                legend?: ChartBaseLegend & {
                    labelStart?: string;
                    labelEnd?: string;
                    backgroundColor?: string;
                };
                title?: ChartTitle;
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            columnNames?: {
                series?: string;
                start?: string;
                end?: string;
                progression?: string;
            };
            th?: ChartTableCell;
            td?: ChartTableCell & {
                roundingValue?: number;
                roundingPercentage?: number;
            };
        };
    };

    export type VueUiDumbbellDataset = {
        name: string;
        start: number;
        end: number;
    };

    export const VueUiDumbbell: DefineComponent<{
        config?: VueUiDumbbellConfig;
        dataset: VueUiDumbbellDataset[];
    }>;

    export type VueUiWordCloudDatasetItem = {
        name: string;
        value: number;
    };

    export type VueUiWordCloudDatapoint = {
        color: string;
        fontSize: number;
        height: number;
        id: string;
        name: string;
        value: number;
        width: number;
        x: number;
        y: number;
    };

    export type VueUiWordCloudConfig = {
        responsive?: boolean;
        theme?: string;
        customPalette?: string[];
        userOptions?: ChartUserOptions;
        useCssAnimation?: boolean;
        animationDelayMs?: number;
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                height?: number;
                width?: number;
                zoom?: Omit<ChartZoom, "fontSize">;
                words?: {
                    maxFontSize?: number;
                    minFontSize?: number;
                    bold?: boolean;
                    proximity?: number;
                    packingWeight?: number;
                    color?: string;
                    usePalette?: boolean;
                };
                title?: ChartTitle;
                tooltip?: ChartTooltip & {
                    roundingValue?: number;
                    customFormat?:
                    | null
                    | ((
                        params: VueUiTooltipParams<
                            VueUiWordCloudDatapoint,
                            any,
                            VueUiDonutConfig
                        >
                    ) => string);
                };
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            columnNames?: {
                series?: string;
                value?: string;
            };
            th?: ChartTableCell;
            td?: ChartTableCell & {
                roundingValue?: number;
                prefix?: string;
                suffix?: string;
            };
        };
    };

    export const VueUiWordCloud: DefineComponent<{
        config?: VueUiWordCloudConfig;
        dataset: VueUiWordCloudDatasetItem[] | string;
    }>;

    export type VueUiXyCanvasDatasetItem = {
        name: string;
        series: number[];
        color?: string;
        type?: "line" | "plot" | "bar";
        useArea?: boolean;
        dataLabels?: boolean;
        scaleSteps?: number;
        prefix?: string;
        suffix?: string;
        rounding?: number;
        autoScaling?: boolean;
        scaleMin?: number | null;
        scaleMax?: number | null;
        showYMarker?: boolean;
    };

    export type VueUiXyCanvasConfig = {
        downsample?: {
            threshold?: number;
        };
        responsive?: boolean;
        theme?: Theme;
        customPalette?: string[];
        userOptions?: ChartUserOptions;
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                aspectRatio?: string;
                stacked?: boolean;
                stackGap?: number;
                scale?: {
                    ticks?: number;
                    min?: number | null;
                    max?: number | null;
                };
                zoom?: ChartZoom;
                selector?: {
                    show?: boolean;
                    color?: string;
                    dashed?: boolean;
                    showHorizontalSelector?: boolean;
                };
                tooltip?: {
                    show?: boolean;
                    color?: string;
                    backgroundColor?: string;
                    fontSize?: number;
                    customFormat?:
                    | null
                    | ((
                        params: VueUiTooltipParams<
                            VueUiXyDatapointItem[],
                            VueUiXySeries,
                            VueUiXyConfig
                        >
                    ) => string);
                    borderRadius?: number;
                    borderColor?: string;
                    borderWidth?: number;
                };
                legend?: {
                    backgroundColor?: string;
                    color?: string;
                    show?: boolean;
                    fontSize?: number;
                    bold?: boolean;
                };
                title?: ChartTitle;
                grid?: {
                    y?: {
                        showAxis?: boolean;
                        axisColor?: string;
                        axisThickness?: number;
                        axisName?: string;
                        axisLabels?: {
                            show?: boolean;
                            fontSizeRatio?: number;
                            color?: string;
                            offsetX?: number;
                            rounding?: number;
                            prefix?: string;
                            suffix?: string;
                        };
                        verticalLines?: {
                            show?: boolean;
                            color?: string;
                            hideUnderXLength?: number;
                            position?: "start" | "middle";
                        };
                        timeLabels?: { // Oversight! TODO: in v3 move to x (breaking change)
                            show?: boolean;
                            fontSizeRatio?: number;
                            values?: Array<string | number>;
                            rotation?: number;
                            offsetY?: number;
                            color?: string;
                            showOnlyAtModulo?: boolean;
                            modulo?: number;
                            showMarker?: boolean;
                        };
                    };
                    x?: {
                        showAxis?: boolean;
                        axisColor?: string;
                        axisThickness?: number;
                        axisName?: string;
                        horizontalLines?: {
                            show?: boolean;
                            color?: string;
                            alternate?: boolean;
                            opacity?: number;
                        };
                    };
                    zeroLine?: {
                        show?: boolean;
                        color?: string;
                        dashed?: boolean;
                    };
                };
                line?: {
                    plots?: {
                        show?: boolean;
                        radiusRatio?: number;
                    };
                };
                area?: {
                    opacity?: number;
                };
                dataLabels?: {
                    show?: boolean;
                    fontSizeRatio?: number;
                    useSerieColor?: boolean;
                    color?: string;
                    offsetY?: number;
                    formatter?: Formatter;
                };
                paddingProportions?: {
                    top?: number;
                    left?: number;
                    right?: number;
                    bottom?: number;
                };
            };
        };
        table?: {
            show?: boolean;
            rounding?: number;
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
            };
        };
    };

    export const VueUiXyCanvas: DefineComponent<{
        dataset: VueUiXyCanvasDatasetItem[];
        config?: VueUiXyCanvasConfig;
    }>;

    export type VueUiFlowDatasetItem = [string, string, number];

    export type VueUiFlowConfig = {
        theme?: Theme;
        customPalette?: string[];
        userOptions?: ChartUserOptions;
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                padding?: {
                    top?: number;
                    left?: number;
                    right?: number;
                    bottom?: number;
                };
                title?: ChartTitle;
                nodes?: {
                    gap?: number;
                    minHeight?: number;
                    width?: number;
                    labels?: {
                        fontSize?: number;
                        abbreviation?: {
                            use?: boolean;
                            length?: number;
                        };
                        prefix?: string;
                        suffix?: string;
                        rounding?: number;
                        formatter?: Formatter;
                    };
                    stroke?: string;
                    strokeWidth?: number;
                };
                links?: {
                    width?: number;
                    opacity?: number;
                    stroke?: string;
                    strokeWidth?: number;
                };
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            columnNames?: {
                source?: string;
                target?: string;
                value?: string;
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
    };

    export const VueUiFlow: DefineComponent<{
        dataset: VueUiFlowDatasetItem[];
        config?: VueUiFlowConfig;
    }>;

    export type VueUiParallelCoordinatePlotDatasetSerieItem = {
        name: string;
        values: number[];
    };

    export type VueUiParallelCoordinatePlotDatasetItem = {
        name: string;
        shape?: Shape;
        color?: string;
        series: VueUiParallelCoordinatePlotDatasetSerieItem[];
    };

    export type VueUiParallelCoordinatePlotConfig = {
        responsive?: boolean;
        theme?: Theme;
        useCssAnimation?: boolean;
        customPalette?: string[];
        userOptions?: ChartUserOptions;
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
                    right?: number;
                    bottom?: number;
                };
                comments?: ChartComments;
                lines?: {
                    smooth?: boolean;
                    strokeWidth?: number;
                    opacity?: number;
                };
                plots?: {
                    show?: boolean;
                    radius?: number;
                    opacity?: number;
                };
                yAxis?: {
                    scaleTicks?: number;
                    stroke?: string;
                    strokeWidth?: number;
                    labels?: {
                        showAxisNames?: boolean;
                        axisNames?: string[];
                        axisNamesColor?: string;
                        axisNamesFontSize?: number;
                        axisNamesBold?: boolean;
                        roundings?: number[];
                        prefixes?: string[];
                        suffixes?: string[];
                        formatters?: Formatter[];
                        ticks?: {
                            show?: boolean;
                            fontSize?: number;
                            color?: string;
                            bold?: boolean;
                            offsetX?: number;
                            offsetY?: number;
                        };
                        datapoints?: {
                            show?: boolean;
                            fontSize?: number;
                            useSerieColor?: boolean;
                            color?: string;
                            offsetX?: number;
                            offsetY?: number;
                            bold?: boolean;
                        };
                    };
                };
                title?: ChartTitle;
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                };
                tooltip?: ChartTooltip & {
                    customFormat?:
                    | null
                    | ((
                        params: VueUiTooltipParams<
                            VueUiParallelCoordinatePlotDatapointSelection,
                            VueUiParallelCoordinatePlotDatasetItem[],
                            VueUiParallelCoordinatePlotScaleSelection[],
                            VueUiParallelCoordinatePlotConfig
                        >
                    ) => string);
                };
            };
        };
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            columnNames?: {
                series?: string;
                item?: string;
            };
            th: ChartTableCell;
            td: ChartTableCell;
        };
    };

    export type VueUiParallelCoordinatePlotDatapointSelection = {
        id: string;
        name: string;
        smmothPath: string;
        straightPath: string;
        values: number[];
        datapoints: Array<{
            value: number;
            x: number;
            y: number;
        }>;
    };

    export type VueUiParallelCoordinatePlotScaleSelection = {
        name: string;
        scale: Array<{
            min: number;
            max: number;
            name: string;
        }>;
        ticks: Array<{
            x: number;
            y: number;
            value: number;
        }>;
    };

    export const VueUiParallelCoordinatePlot: DefineComponent<{
        config?: VueUiParallelCoordinatePlotConfig;
        dataset: VueUiParallelCoordinatePlotDatasetItem[];
    }>;

    export type VueUiTimerConfig = {
        type?: "stopwatch";
        responsive?: boolean;
        style?: {
            backgroundColor?: string;
            fontFamily?: string;
            height?: number;
            width?: number;
            title: ChartTitle;
        };
        stopwatch?: {
            showHours?: boolean;
            showHundredth?: boolean;
            cycleSeconds?: number;
            track?: {
                radiusRatio?: number;
                stroke?: string;
                fill?: string;
                strokeWidth?: number;
            };
            tracker?: {
                radiusRatio?: number;
                stroke?: string;
                strokeWidth?: number;
                fill?: string;
                gradient?: {
                    show?: boolean;
                    color?: string;
                };
                aura?: {
                    show?: boolean;
                    radiusRatio?: number;
                    fill?: string;
                    stroke?: string;
                    strokeWidth?: number;
                };
            };
            cycleTrack?: {
                show?: boolean;
                stroke?: string;
                strokeWidth?: number;
            };
            label?: {
                fontSize?: number;
                color?: string;
                bold?: boolean;
            };
            legend?: {
                backgroundColor?: string;
                buttons?: {
                    start?: boolean;
                    pause?: boolean;
                    reset?: boolean;
                    restart?: boolean;
                    lap?: boolean;
                    iconColor?: string;
                };
                buttonTitles?: {
                    start?: string;
                    pause?: string;
                    resume?: string;
                    reset?: string;
                    restart?: string;
                    lap?: string;
                };
            };
        };
    };

    export const VueUiTimer: DefineComponent<{
        config?: VueUiTimerConfig;
    }>;

    export type VueUiCarouselTableDataset = {
        head: string[];
        body: Array<Array<string | number>>;
    };

    export type TableBorder = {
        size?: number;
        color?: string;
    };

    export type VueUiCarouselTableConfig = {
        responsiveBreakpoint?: number;
        animation?: {
            type?: "scroll" | "marquee";
            use?: boolean;
            speedMs?: number;
            pauseOnHover?: boolean;
        };
        border?: TableBorder;
        style?: {
            backgroundColor?: string;
            color?: string;
            fontFamily?: string;
        };
        caption?: {
            text?: string;
            padding?: ChartPadding;
            style?: {
                backgroundColor?: string;
                color?: string;
                fontSize?: string;
                fontWeight?: string;
                textAlign?: TextAlign;
            };
        };
        scrollbar?: {
            showOnlyOnHover?: boolean;
            hide?: boolean;
        };
        thead?: {
            tr?: {
                style?: {
                    backgroundColor?: string;
                    color?: string;
                    boxShadow?: string;
                };
                border?: TableBorder;
                th?: {
                    border?: TableBorder;
                    style?: {
                        border?: string;
                        borderSpacing?: number;
                        textAlign?: TextAlign;
                        fontVariantNumeric: FontVariantNumeric;
                    };
                    padding?: ChartPadding;
                };
            };
        };
        tbody?: {
            backgroundColor?: string;
            tr?: {
                visible?: number;
                height?: number;
                style?: {
                    backgroundColor: string;
                    color?: string;
                };
                border?: TableBorder;
                td?: {
                    alternateColor?: boolean;
                    alternateOpacity?: number;
                    style?: {
                        fontVariantNumeric?: FontVariantNumeric;
                        textAlign?: TextAlign;
                        backgroundColor?: string;
                    };
                    border?: TableBorder;
                    padding?: ChartPadding;
                };
            };
        };
        userOptions?: ChartUserOptions;
    };

    export const VueUiCarouselTable: DefineComponent<{
        config?: VueUiCarouselTableConfig;
        dataset: VueUiCarouselTableDataset;
    }>;

    export type VueUiGizmoConfig = {
        type?: "battery" | "gauge";
        size?: number;
        stroke?: string;
        color?: string;
        useGradient?: boolean;
        gradientColor?: string;
        showPercentage?: boolean;
        textColor?: string;
        fontFamily?: string;
        formatter?: Formatter;
    };

    export type VueUiGizmoDataset = number;

    export const VueUiGizmo: DefineComponent<{
        dataset: VueUiGizmoDataset;
        config?: VueUiGizmoConfig;
    }>;

    export type VueUiStackbarDatasetItem = {
        name: string;
        series: number[];
        color?: string;
    };

    export type VueUiStackbarDatapointItem = {
        name: string;
        value: number;
        proportion: number;
        color: string;
        id: string;
    };

    export type VueUiStackbarSeriesItem = VueUiStackbarDatasetItem & {
        id: string;
        color: string;
        absoluteIndex: number;
        proportions: number[];
        series: number[];
        x: number[];
        y: number[];
        height: number[];
    };

    export type VueUiStackbarConfig = {
        theme?: Theme;
        responsive?: boolean;
        customPalette?: string[];
        useCssAnimation?: boolean;
        orientation?: "vertical" | "horizontal";
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            columnNames?: {
                period?: string;
                total?: string;
            };
            th: ChartTableCell;
            td: ChartTableCell & {
                roundingValue?: number;
            };
        };
        userOptions?: ChartUserOptions;
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                height?: number;
                width?: number;
                padding?: ChartPadding;
                title?: ChartTitle;
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                };
                zoom?: ChartZoom;
                tooltip?: ChartTooltip & {
                    showValue?: boolean;
                    showPercentage?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    customFormat?:
                    | null
                    | ((
                        params: VueUiTooltipParams<
                            VueUiStackbarDatapointItem[],
                            VueUiStackbarSeriesItem[],
                            VueUiStackbarConfig
                        >
                    ) => string);
                    showTimeLabel?: boolean;
                };
                highlighter?: {
                    color?: string;
                    opacity?: number;
                };
                bars?: {
                    gapRatio?: number;
                    distributed?: boolean;
                    showDistributedPercentage?: boolean;
                    borderRadius?: number;
                    strokeWidth?: number;
                    gradient?: {
                        show?: boolean;
                        intensity?: number;
                    };
                    totalValues?: {
                        show?: boolean;
                        offsetY?: number;
                        fontSize?: number;
                        bold?: boolean;
                        color?: string;
                    };
                    dataLabels?: {
                        show?: boolean;
                        hideEmptyValues?: boolean;
                        hideEmptyPercentages?: boolean;
                        adaptColorToBackground?: boolean;
                        color?: string;
                        fontSize?: number;
                        bold?: boolean;
                        rounding?: number;
                        prefix?: string;
                        suffix?: string;
                        formatter?: Formatter;
                    };
                };
                grid?: {
                    scale?: {
                        ticks?: number;
                        scaleMin?: number | null;
                        scaleMax?: number | null;
                    };
                    x?: {
                        showAxis?: boolean;
                        showHorizontalLines?: boolean;
                        axisColor?: string;
                        axisThickness?: number;
                        axisName?: {
                            show?: boolean;
                            text?: string;
                            fontSize?: number;
                            color?: string;
                            bold?: boolean;
                            offsetY?: number;
                        };
                        timeLabels?: {
                            show?: boolean;
                            values?: string[];
                            offsetY?: number;
                            rotation?: number;
                            fontSize?: number;
                            color?: string;
                            bold?: boolean;
                        };
                    };
                    y?: {
                        showAxis?: boolean;
                        showVerticalLines?: boolean;
                        axisColor?: string;
                        axisThickness?: number;
                        axisName?: {
                            show?: boolean;
                            text?: string;
                            fontSize?: number;
                            color?: string;
                            bold?: boolean;
                            offsetX?: number;
                        };
                        axisLabels?: {
                            show?: boolean;
                            color?: string;
                            fontSize?: number;
                            bold?: boolean;
                        };
                    };
                };
            };
        };
    };

    export const VueUiStackbar: DefineComponent<{
        config?: VueUiStackbarConfig;
        dataset: VueUiStackbarDatasetItem[];
    }>;

    export type VueUiBulletSegment = {
        name: string;
        from: number;
        to: number;
        color?: string;
    };

    export type VueUiBulletDataset = {
        value: number;
        target: number;
        segments: VueUiBulletSegment[];
    };

    export type VueUiBulletConfig = {
        theme?: Theme;
        userOptions?: ChartUserOptions;
        chart?: {
            backgroundColor?: string;
            color?: string;
            height?: number;
            width?: number;
            padding?: ChartPadding;
            animation?: {
                show?: boolean;
                animationFrames?: number;
            };
            segments?: {
                baseColor?: string;
                dataLabels?: {
                    show?: boolean;
                    color?: string;
                    fontSize?: number;
                    formatter?: Formatter;
                    bold?: boolean;
                    prefix?: string;
                    suffix?: string;
                    rounding?: number;
                    offsetY?: number;
                };
                ticks?: {
                    show?: boolean;
                    divisions?: number;
                    stroke?: string;
                };
            };
            target?: {
                onTop?: boolean;
                color?: string;
                rounded?: boolean;
                heightRatio?: number;
                stroke?: string;
                strokeWidth?: number;
                width?: number;
            };
            valueBar?: {
                color?: string;
                heightRatio?: number;
                stroke?: string;
                strokeWidth?: number;
                label?: {
                    show?: boolean;
                    color?: string;
                    fontSize?: number;
                    bold?: boolean;
                    offsetY?: number;
                };
            };
            title?: ChartTitle;
            legend?: ChartBaseLegend & {
                roundingValue?: number;
            };
        };
    };

    export const VueUiBullet: DefineComponent<{
        config?: VueUiBulletConfig;
        dataset: VueUiBulletDataset;
    }>;

    export type VueUiFunnelDatasetItem = {
        name: string;
        value: number;
    };

    export type VueUiFunnelConfig = {
        theme?: Theme;
        responsive?: boolean;
        useCssAnimation?: boolean;
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            th?: ChartTableCell;
            td?: ChartTableCell & {
                roundingValue?: number;
                roundingPercentage?: number;
            };
            columnNames?: {
                series?: string;
                value?: string;
                percentage?: string;
            };
        };
        userOptions?: ChartUserOptions;
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                width?: number;
                height?: number;
                title?: ChartTitle;
                padding?: ChartPadding;
                barCircleSpacingRatio?: number;
                circles?: {
                    stroke?: string;
                    strokeWidth?: number;
                    dataLabels?: {
                        formatter?: Formatter;
                        fontSize?: number;
                        offsetY?: number;
                        adaptColorToBackground?: boolean;
                        color?: string;
                        rounding?: number;
                        bold?: boolean;
                    };
                };
                circleLinks?: {
                    show?: boolean;
                    color?: string;
                    widthRatio?: number;
                };
                area?: {
                    show?: boolean;
                    color?: string;
                };
                bars?: {
                    stroke?: string;
                    defaultColor?: string;
                    strokeWidth?: number;
                    gapRatio?: number;
                    borderRadius?: number;
                    dataLabels?: {
                        name?: {
                            fontSize?: number;
                            color?: string;
                            bold?: boolean;
                            offsetX?: number;
                            offsetY?: number;
                        };
                        value?: {
                            formatter?: Formatter;
                            fontSize?: number;
                            rounding?: number;
                            bold?: boolean;
                            color?: string;
                            prefix?: string;
                            suffix?: string;
                            offsetX?: number;
                            offsetY?: number;
                        };
                    };
                };
            };
        };
    };

    export const VueUiFunnel: DefineComponent<{
        dataset: VueUiFunnelDatasetItem[];
        config?: VueUiFunnelConfig;
    }>;

    export type VueUiHistoryPlotDatasetItem = {
        name: string;
        values: Array<{ x: number; y: number; label?: string }>;
        color?: string;
    };

    export type VueUiHistoryPlotConfig = {
        responsive?: boolean;
        theme?: Theme;
        customPalette?: string[];
        useCssAnimation?: boolean;
        userOptions?: ChartUserOptions;
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            th?: ChartTableCell;
            td?: ChartTableCell;
            columnNames?: {
                series?: string;
                datapoint?: string;
                x?: string;
                y?: string;
            };
        };
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                height?: number;
                width?: number;
                padding?: ChartPadding;
                grid?: {
                    xAxis?: {
                        show?: boolean;
                        stroke?: string;
                        strokeWidth?: number;
                    };
                    horizontalLines?: {
                        show?: boolean;
                        stroke?: string;
                        strokeWidth?: number;
                    };
                    yAxis?: {
                        show?: boolean;
                        stroke?: string;
                        strokeWidth?: number;
                    };
                    verticalLines?: {
                        show?: boolean;
                        stroke?: string;
                        strokeWidth?: number;
                    };
                };
                axes?: {
                    x?: {
                        scaleMin?: number | null;
                        scaleMax?: number | null;
                        ticks?: number;
                        labels?: {
                            show?: boolean;
                            fontSize?: number;
                            color?: string;
                            bold?: boolean;
                            rounding?: number;
                            offsetY?: number;
                            rotation?: number;
                            formatter?: Formatter;
                            prefix?: string;
                            suffix?: string;
                        };
                        name?: {
                            text?: string;
                            fontSize?: number;
                            offsetX?: number;
                            offsetY?: number;
                            bold?: boolean;
                            color?: string;
                        };
                    };
                    y?: {
                        scaleMin?: number | null;
                        scaleMax?: number | null;
                        ticks?: number;
                        labels?: {
                            show?: boolean;
                            fontSize?: number;
                            color?: string;
                            bold?: boolean;
                            rounding?: number;
                            offsetX?: number;
                            formatter?: Formatter;
                            prefix?: string;
                            suffix?: string;
                        };
                        name?: {
                            text?: string;
                            fontSize?: number;
                            offsetX?: number;
                            offsetY?: number;
                            bold?: boolean;
                            color?: string;
                        };
                    };
                };
                plots?: {
                    radius?: number;
                    stroke?: string;
                    strokeWidth?: number;
                    gradient?: {
                        show?: boolean;
                        intensity?: number;
                    };
                    indexLabels?: {
                        show?: boolean;
                        startAtZero?: boolean;
                        adaptColorToBackground?: boolean;
                        color?: string;
                        fontSize?: number;
                        bold?: boolean;
                        offsetY?: number;
                        offsetX?: number;
                    };
                    labels?: {
                        show?: boolean;
                        fontSize?: number;
                        color?: string;
                        bold?: boolean;
                        offsetY?: number;
                        offsetX?: number;
                    };
                };
                paths?: {
                    show?: boolean;
                    strokeWidth?: number;
                    useSerieColor?: boolean;
                    stroke?: string;
                };
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                };
                title?: ChartTitle;
                tooltip?: ChartTooltip & {
                    customFormat?:
                    | null
                    | ((
                        params: VueUiTooltipParams<
                            VueUiHistoryPlotDatapoint,
                            VueUiHistoryPlotDatpointSeries[],
                            VueUiHistoryPlotConfig
                        >
                    ) => string);
                };
            };
        };
    };

    export type VueUiHistoryPlotDatapoint = {
        color: string;
        id: string;
        label: string;
        seriesName: string;
        valueX: number;
        valueY: number;
        x: number;
        y: number;
    };

    export type VueUiHistoryPlotDatpointSeries = VueUiHistoryPlotDatasetItem & {
        seriesIndex: number;
    };

    export const VueUiHistoryPlot: DefineComponent<{
        config?: VueUiHistoryPlotConfig;
        dataset: VueUiHistoryPlotDatasetItem[];
    }>;

    export type VueUiCirclePackDatasetItem = {
        name: string;
        value: number;
        color?: string;
    };

    export type VueUiCirclePackConfig = {
        theme?: Theme;
        customPalette?: string[];
        userOptions?: ChartUserOptions;
        table?: {
            show?: boolean;
            responsiveBreakpoint?: number;
            th?: ChartTableCell;
            td?: ChartTableCell;
            columnNames?: {
                datapoint?: string;
                value?: string;
            };
        };
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                title?: ChartTitle;
                circles?: {
                    stroke?: string;
                    strokeWidth?: number;
                    gradient?: {
                        show?: boolean;
                        intensity?: number;
                    };
                    labels?: {
                        name?: {
                            show?: boolean;
                            bold?: boolean;
                            offsetY?: number;
                            color?: string;
                            fontSizeRatio?: number;
                        };
                        value?: {
                            show?: boolean;
                            color?: string;
                            rounding?: number;
                            prefix?: string;
                            suffix?: string;
                            formatter?: Formatter;
                            bold?: boolean;
                            offsetY?: number;
                            fontSizeRatio?: number;
                        };
                    };
                    zoom?: {
                        show?: boolean;
                        shadowForce?: number;
                        opacity?: number;
                        animationFrameMs?: number;
                        zoomRatio?: number;
                        label?: {
                            name?: {
                                fontSize?: number;
                                bold?: boolean;
                                offsetY?: number;
                                color?: string;
                            };
                            value?: {
                                fontSize?: number;
                                bold?: boolean;
                                offsetY?: number;
                                rounding?: number;
                                prefix?: string;
                                suffix?: string;
                                formatter?: Formatter;
                                color?: string;
                            };
                        };
                    };
                };
            };
        };
    };

    export const VueUiCirclePack: DefineComponent<{
        config?: VueUiCirclePackConfig;
        dataset: VueUiCirclePackDatasetItem[];
    }>;

    export type VueDataUiConfig =
        | VueUi3dBarConfig
        | VueUiAgePyramidConfig
        | VueUiAnnotatorConfig
        | VueUiCandlestickConfig
        | VueUiChestnutConfig
        | VueUiDashboardConfig
        | VueUiDigitsConfig
        | VueUiDonutConfig
        | VueUiDonutEvolutionConfig
        | VueUiGaugeConfig
        | VueUiHeatmapConfig
        | VueUiMiniLoaderConfig
        | VueUiMoleculeConfig
        | VueUiMoodRadarConfig
        | VueUiOnionConfig
        | VueUiQuadrantConfig
        | VueUiRadarConfig
        | VueUiRatingConfig
        | VueUiRelationCircleConfig
        | VueUiRingsConfig
        | VueUiScatterConfig
        | VueUiScreenshotConfig
        | VueUiSkeletonConfig
        | VueUiSmileyConfig
        | VueUiSparkHistogramConfig
        | VueUiSparkStackbarConfig
        | VueUiSparkbarConfig
        | VueUiSparklineConfig
        | VueUiTableConfig
        | VueUiTableSparklineConfig
        | VueUiThermometerConfig
        | VueUiTiremarksConfig
        | VueUiVerticalBarConfig
        | VueUiWaffleConfig
        | VueUiWheelConfig
        | VueUiXyConfig
        | VueUiNestedDonutsConfig
        | VueUiGalaxyConfig
        | VueUiKpiConfig
        | VueUiTreemapConfig
        | VueUiTableHeatmapConfig
        | VueUiAccordionConfig
        | VueUiQuickChartConfig
        | VueUiCursorConfig
        | VueUiSparkTrendConfig
        | VueUiStripPlotConfig
        | VueUiDumbbellConfig
        | VueUiWordCloudConfig
        | VueUiXyCanvasConfig
        | VueUiFlowConfig
        | VueUiParallelCoordinatePlotConfig
        | VueUiTimerConfig
        | VueUiCarouselTableConfig
        | VueUiGizmoConfig
        | VueUiStackbarConfig
        | VueUiBulletConfig
        | VueUiFunnelConfig
        | VueUiHistoryPlotConfig
        | VueUiCirclePackConfig;

    export type VueDataUiConfigKey =
        | "vue_ui_3d_bar"
        | "vue_ui_age_pyramid"
        | "vue_ui_annotator"
        | "vue_ui_candlestick"
        | "vue_ui_chestnut"
        | "vue_ui_dashboard"
        | "vue_ui_digits"
        | "vue_ui_donut"
        | "vue_ui_donut_evolution"
        | "vue_ui_gauge"
        | "vue_ui_heatmap"
        | "vue_ui_mini_loader"
        | "vue_ui_molecule"
        | "vue_ui_mood_radar"
        | "vue_ui_onion"
        | "vue_ui_quadrant"
        | "vue_ui_radar"
        | "vue_ui_rating"
        | "vue_ui_relation_circle"
        | "vue_ui_rings"
        | "vue_ui_scatter"
        | "vue_ui_screenshot"
        | "vue_ui_skeleton"
        | "vue_ui_smiley"
        | "vue_ui_sparkhistogram"
        | "vue_ui_sparkstackbar"
        | "vue_ui_sparkbar"
        | "vue_ui_sparkline"
        | "vue_ui_table"
        | "vue_ui_table_sparkline"
        | "vue_ui_thermometer"
        | "vue_ui_tiremarks"
        | "vue_ui_vertical_bar"
        | "vue_ui_waffle"
        | "vue_ui_wheel"
        | "vue_ui_xy"
        | "vue_ui_nested_donuts"
        | "vue_ui_galaxy"
        | "vue_ui_kpi"
        | "vue_ui_treemap"
        | "vue_ui_table_heatmap"
        | "vue_ui_accordion"
        | "vue_ui_quick_chart"
        | "vue_ui_cursor"
        | "vue_ui_spark_trend"
        | "vue_ui_strip_plot"
        | "vue_ui_dumbbell"
        | "vue_ui_word_cloud"
        | "vue_ui_xy_canvas"
        | "vue_ui_flow"
        | "vue_ui_parallel_coordinate_plot"
        | "vue_ui_timer"
        | "vue_ui_carousel_table"
        | "vue_ui_gizmo"
        | "vue_ui_stackbar"
        | "vue_ui_bullet"
        | "vue_ui_funnel"
        | "vue_ui_history_plot"
        | "vue_ui_circle_pack";

    export type VueDataUiWordCloudTransformCallback =
        | ((word: string) => string)
        | null;

    /**
     * Vue Data UI utility
     * ---
     * Create a dataset for VueUiWordCloud from a string
     * ___
     * @example
     * const dataset = createWordCloudDatasetFromPlainText('Lorem Ipsum Dolor', (w) => w.toUpperCase())
     *
     * @param text - The text from which the dataset will be generated
     * @param callback - Optional transform callback to format each word of the dataset
     */
    export const createWordCloudDatasetFromPlainText: (
        text: string,
        callback?: VueDataUiWordCloudTransformCallback
    ) => VueUiWordCloudDatasetItem[];

    export type VueDataUiAbbreviatePayload = {
        source: string;
        length?: number;
    };

    /**
     * Vue Data UI utility
     * ---
     * Abbreviate a string to a given length
     * ___
     * @example
     * const label = abbreviate({
     *  source: 'Lorem Ipsum Dolor',
     *  length: 3
     * })
     *
     * @param source - The string to abbreviate
     * @param length - The number of letters to return (defaults to 3)
     */
    export const abbreviate: (payload: VueDataUiAbbreviatePayload) => string;

    /**
     * Vue Data UI utility
     * ---
     * Get the color palette for a given theme
     * ___
     * @example
     * const palette = getPalette("hack");
     *
     * @param theme - The theme for which the palette is requested (e.g., "hack" | "zen", | "concrete")
     */
    export const getPalette: (theme: Theme) => string[];

    /**
     * Vue Data UI utility
     * ---
     * Get the default config for a given component
     * ___
     * @example
     * const defaultConfig = getVueDataUiConfig("vue_ui_xy");
     *
     * @param key - The key of the component in snake case (e.g., "vue_ui_xy")
     */
    export const getVueDataUiConfig: (key: VueDataUiConfigKey) => VueDataUiConfig;

    /**
     * Vue Data UI utility
     * ---
     * Lightens a color by a specified strength.
     * ___
     * @example
     * const color = lightenColor("#FF0000", 0.25);
     * const color = lightenColor("#FF000080", 0.25);
     * const color = lightenColor("rgb(255,0,0)", 0.25);
     * const color = lightenColor("rgb(255,0,0,0.5)", 0.25);
     * const color = lightenColor("red", 0.25);
     *
     * @param color - The input color. Can be hexadecimal (e.g., "#FF0000", or "#FF000080" with alpha channel), RGB or RGBA, or a named color.
     * @param strength - The strength to lighten the color, typically a value between 0 and 1.
     * @returns The lightened color in hexadecimal format.
     */
    export const lightenColor: (color: string, strength: number) => string;

    /**
     * Vue Data UI utility
     * ---
     * Darkens a color by a specified strength.
     * ___
     * @example
     * const color = darkenColor("#FF0000", 0.25);
     * const color = darkenColor("#FF000080", 0.25);
     * const color = darkenColor("rgb(255,0,0)", 0.25);
     * const color = darkenColor("rgb(255,0,0,0.5)", 0.25);
     * const color = darkenColor("red", 0.25);
     *
     * @param color - The input color. Can be hexadecimal (e.g., "#FF0000", or "#FF000080" with alpha channel), or RGB or RGBA.
     * @param strength - The strength to darken the color, typically a value between 0 and 1.
     * @returns The darkened color in hexadecimal format.
     */
    export const darkenColor: (color: string, strength: number) => string;

    /**
     * Vue Data UI utility
     * ---
     * Shifts hue for a given color, by a given strength.
     * ___
     * @example
     * const color = shiftColorHue("#FF0000", 0.25);
     * const color = shiftColorHue("#FF000080", 0.25);
     * const color = shiftColorHue("rgb(255,0,0)", 0.25);
     * const color = shiftColorHue("rgb(255,0,0,0.5)", 0.25);
     * const color = shiftColorHue("red", 0.25);
     *
     * @param color - The input color. Can be hexadecimal (e.g., "#FF0000", or "#FF000080" with alpha channel), or RGB or RGBA.
     * @param strength - The strength to darken the color, typically a value between 0 and 1.
     * @returns The shifted color in hexadecimal format.
     */
    export const shiftColorHue: (color: string, strength: number) => string;

    export type CreateTSpansArgs = {
        content: string;
        fontSize: number;
        fill: string;
        maxWords: number;
        x: number;
        y: number;
    }

    /**
     * Vue Data UI utility
     * ---
     * Creates TSpan elements from a string to break text into multiple lines.
     * The output should be placed with `v-html` inside an SVG `<text>` element.
     * ___
     * @example
     * const textContent = createTSpans({
     *   content: "This is an example of multiline text",
     *   fontSize: 16,
     *   fill: "#1A1A1A",
     *   maxWords: 3, // Will create lines of 3 words max
     *   x: 10,
     *   y: 20
     * });
     * 
     * // Usage: <text :x="10" :y="20" fill="#1A1A1A" :font-size="16" v-html="textContent"/>
     * 
     * @param {Object} args - The arguments object.
     * @param {string} args.content - The text content to be split into lines.
     * @param {number} args.fontSize - The font size used to determine line spacing.
     * @param {string} args.fill - The fill color for the text.
     * @param {number} args.maxWords - Maximum number of words per line.
     * @param {number} args.x - The x-coordinate for each `tspan` element.
     * @param {number} args.y - The starting y-coordinate for the first `tspan`.
     * 
     * @returns {string} A string containing the HTML content to be placed with `v-html` inside an SVG `<text>` element.
    */
    export const createTSpans: ({
        content,
        fontSize,
        fill,
        maxWords,
        x,
        y
    }: CreateTSpansArgs) => string;
}
