declare module "vue-data-ui" {
    import { Ref, DefineComponent } from "vue";

    export type VueUiUnknownObj = {
        [key: string]: unknown;
    };

    export type AnyVueComponent = DefineComponent<any, any, any, any>;

    export type VueDataUiLoader =
        () => Promise<{ default: AnyVueComponent } | AnyVueComponent>;

    export type VueDataUiAnyDataset =
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
        | VueUiHorizontalBarDatasetItem[]
        | VueUiWaffleDatasetItem[]
        | VueUiWheelDataset
        | VueUiXyDatasetItem[]
        | VueUiTreemapDatasetItem[]
        | VueUiQuickChartDataset
        | number[]
        | Array<number | null>
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
        | VueUiCirclePackDatasetItem[]
        | VueUiWorldDataset
        | VueUiRidgelineDatasetItem[]
        | VueUiChordDataset
        | VueUiStacklineDatasetItem[]
        | VueUiDagDataset
        | VueUiGeoDatasetItem[]
        | VueUiBumpDatasetItem[];

    export type VueDataUiAnyConfig =
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
        | VueUiHorizontalBarConfig
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
        | VueUiCirclePackConfig
        | VueUiWorldConfig
        | VueUiRidgelineConfig
        | VueUiChordConfig
        | VueUiStacklineConfig
        | VueUiDagConfig
        | VueUiGeoConfig
        | VueUiBumpConfig;

    export type VueDataUiProps = {
        loader?: VueDataUiLoader | null;
        component?: string;
        dataset: VueDataUiAnyDataset;
        config?: VueDataUiAnyConfig;
    };

    export type VueDataUiExpose = {
        getData?: (...args: any[]) => Promise<any> | any;
        getImage?: (options?: { scale?: number }) => Promise<any>;
        generateCsv?: () => void;
        generateImage?: () => void;
        generateSvg(): () => void;
        generatePdf?: () => void;
        toggleAnnotator?: () => void;
        toggleFullscreen?: () => void;
        toggleLabels?: () => void;
        toggleStack?: () => void;
        toggleTable?: () => void;
        toggleTooltip?: () => void;
        autoSize?: () => void;
        getItemsPositions?: () => any;
        toggleReadonly?: () => void;
        shoot?: () => void;
        close?: () => void;
        restoreOrder?: () => void;
        recalculateHeight?: () => void;
        toggleLock?: () => void;
        toggleSort?: () => void;
        start?: () => void;
        pause?: () => void;
        reset?: () => void;
        restart?: () => void;
        lap?: () => void;
        pauseAnimation?: () => void;
        resumeAnimation?: () => void;
        toggleAnimation?: () => void;
        selectNode?: (...args: any[]) => void;
        selectGroup?: (...args: any[]) => void;
        selectRibbon?: (...args: any[]) => void;
        resetZoom?: () => void;
        zoomIn?: () => void;
        zoomOut?: () => void;
        switchDirection?: () => void;
        [key: string]: any;
    };

    /** Keep the named export exactly as before (now with loader/component props). */
    export const VueDataUi: DefineComponent<VueDataUiProps, VueDataUiExpose>;

    export type ChartEvent<T> = null | (({ datapoint, seriesIndex }: { datapoint: T, seriesIndex: number }) => void);

    export type VueUiFlowEvent = ChartEvent<VueUiFlowNode>;
    export type VueUi3dBarEvent = ChartEvent<VueUi3dBarDatapoint>;
    export type VueUiDonutEvent = ChartEvent<VueUiDonutDatapoint>;
    export type VueUiRadarEvent = ChartEvent<VueUiRadarDatapoint>;
    export type VueUiXyEvent = ChartEvent<VueUiXyDatapointItem[]>;
    export type VueUiRingsEvent = ChartEvent<VueUiRingsDatapoint>;
    export type VueUiOnionEvent = ChartEvent<VueUiOnionDatapoint>;
    export type VueUiWorldEvent = ChartEvent<VueUiWorldDatapoint>;
    export type VueUiGeoPointEvent = ChartEvent<VueUiGeoDatapoint>;
    export type VueUiGeoTerritoryEvent = ChartEvent<VueUiGeoTerritory>;
    export type VueUiGalaxyEvent = ChartEvent<VueUiGalaxyDatapoint>;
    export type VueUiWaffleEvent = ChartEvent<VueUiWaffleDatapoint>;
    export type VueUiScatterEvent = ChartEvent<VueUiScatterDatapoint>;
    export type VueUiTreemapEvent = ChartEvent<VueUiTreemapDatapoint>;
    export type VueUiDumbbellEvent = ChartEvent<VueUiDumbbellDatapoint>;
    export type VueUiMoleculeEvent = ChartEvent<VueUiMoleculeDatapoint>;
    export type VueUiQuadrantEvent = ChartEvent<VueUiQuadrantDatapoint>;
    export type VueUiSparkbarEvent = ChartEvent<VueUiSparkbarDatasetItem>;
    export type VueUiWordCloudEvent = ChartEvent<VueUiWordCloudDatapoint>;
    export type VueUiStripPlotEvent = ChartEvent<VueUiStripPlotDatapoint>;
    export type VueUiMoodRadarEvent = ChartEvent<VueUiMoodRadarDatapoint>;
    export type VueUiCirclePackEvent = ChartEvent<VueUiCirclePackDatapoint>;
    export type VueUiSparklineEvent = ChartEvent<VueUiSparklineDatasetItem>;
    export type VueUiAgePyramidEvent = ChartEvent<VueUiAgePyramidDatapoint>;
    export type VueUiStackbarEvent = ChartEvent<VueUiStackbarDatapointItem[]>;
    export type VueUiCandlestickEvent = ChartEvent<VueUiCandlestickDatapoint>;
    export type VueUiRidgelineEvent = ChartEvent<VueUiRidgelineDatapointEvent>;
    export type VueUiSparkStackbarEvent = ChartEvent<VueUiSparkStackbarDatapoint>;
    export type VueUiHistoryPlotEvent = ChartEvent<VueUiHistoryPlotDatapointEvent>;
    export type VueUiRelationCircleEvent = ChartEvent<VueUiRelationCircleDatapoint>;
    export type VueUiDonutEvolutionEvent = ChartEvent<VueUiDonutEvolutionDatapoint>;
    export type VueUiSparkHistogramEvent = ChartEvent<VueUiSparkHistogramDatasetItem>;
    export type VueUiChordEvent = ChartEvent<VueUiChordDatapointArc | VueUiChordDatapointRibbon>;
    export type VueUiParallelCoordinatePlotEvent = ChartEvent<VueUiParallelCoordinatePlotEventDatapoint>;
    export type VueUiBumpEvent = ChartEvent<VueUiBumpDatapoint>;

    export type VueUiConfigNumberString = `${number}`;

    export type VueUiBuiltInSkeletonConfig<C> = Omit<C, 'skeletonConfig' | 'skeletonDataset'>;
    export type VueUiBuiltInSkeletonDataset<D> = D | null;

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

    export type ChartLegendToggle = {
        show?: boolean;
        backgroundColor?: string;
        color?: string;
    }

    export type ChartBaseLegend = {
        color?: string;
        show?: boolean;
        fontSize?: number;
        bold?: boolean;
        selectAllToggle?: ChartLegendToggle;
    };

    export type ChartFrame = {
        show?: boolean;
        stroke?: string;
        strokeWidth?: number;
        strokeLinecap?: "round" | "butt" | "square";
        strokeLinejoin?: "arcs" | "bevel" | "miter" | "miter-clip" | "round";
        strokeDasharray?: number;
    }

    export type ChartZoomControls = {
        position?: 'top' | 'bottom';
        show?: boolean;
        backgroundColor?: string;
        buttonColor?: string;
        color?: string;
        fontSize?: number;
        border?: string;
        padding?: string;
        borderRadius?: string;
    }

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
            svg?: boolean;
            zoom?: boolean;
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
            svg?: string;
            zoom?: string;
        };
        callbacks?: {
            animation?: null | (() => void);
            annotator?: null | (() => void);
            csv?: null | ((csvStr?: string) => void);
            fullscreen?: null | (() => void);
            img?: null | (({ domElement, imageUri, base64 }: { domElement?: string; imageUri?: string; base64?: string } = {}) => void);
            labels?: null | (() => void);
            pdf?: null | (({ domElement, imageUri, base64 }: { domElement?: string; imageUri?: string; base64?: string } = {}) => void);
            sort?: null | (() => void);
            stack?: null | (() => void);
            table?: null | (() => void);
            tooltip?: null | (() => void);
            svg?: null | (({blob, url, text, dataUrl}: { blob: Blob; url: URL, text: string, dataUrl: string }) => void);
            zoom?: null | (() => void);
        };
        print?: {
            scale?: number;
            orientation?: 'auto' | 'l' | 'p';
            overflowTolerance?: number;
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
        smooth?: boolean;
        backdropFilter?: boolean;
        smoothForce?: number;
        smoothSnapThreshold?: number;
        teleportTo?: string;
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
        compact?: boolean;
        merged?: boolean;
        frameColor?: string;
        additionalHeight?: number;
        handleIconColor?: string | null;
        handleBorderWidth?: number;
        handleBorderColor?: string | null;
        handleFill?: string | null;
        handleWidth?: number;
        handleType?: '' | 'empty' | 'chevron' | 'grab' | 'arrow';
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
        focusOnDrag?: boolean;
        focusRangeRatio?: number;
        maxWidth?: number | null;
    };

    export type Theme =
        | ""
        | "zen"
        | "dark"
        | "hack"
        | "concrete"
        | "celebration"
        | "celebrationNight"
        | "minimal"
        | "minimalDark";
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

    export type Locale = string;

    export type AxisDateFormatter = {
        enable?: boolean;
        locale?: Locale;
        useUTC?: boolean;
        januaryAsYear?: boolean;
        options?: {
            year?: string;
            month?: string;
            day?: string;
            hour?: string;
            minute?: string;
            second?: string;
        }
    }

    export type MinimalCustomFormatParams<TDatapoint = any> = {
        absoluteIndex: number;
        seriesIndex: number;
        datapoint: TDatapoint;
    };

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

    export type GetImagePromise = Promise<{
        imageUri: string;
        base64: string;
        title: string;
        width: number;
        height: number;
        aspectRatio: number;
    }>

    export type VueUiTreemapDatasetItem = {
        [key: string]: any;
        name: string;
        value: number;
        children?: VueUiTreemapDatasetItem[];
        parentId?: string;
        color?: string;
    };

    export type VueUiTreemapConfig = {
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiTreemapConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiTreemapDatasetItem[]>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean;
        events?: {
            datapointEnter?: VueUiTreemapEvent; // v3
            datapointLeave?: VueUiTreemapEvent; // v3
            datapointClick?: VueUiTreemapEvent; // v3
        };
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
                        group?: {
                            stroke?: string;
                            strokeWidth?: number;
                            useSeriesBackgroundColor?: boolean;
                            backgroundLighterRatio?: number;
                            label?: {
                                adaptColorToBackground?: boolean;
                                color?: string;
                            };
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
                        name?: {
                            show?: boolean;
                            bold?: boolean;
                        };
                        value?: {
                            show?: boolean;
                            bold?: boolean;
                        }
                    };
                };
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    showValue?: boolean;
                    showPercentage?: boolean;
                    position?: 'bottom' | 'top';
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
            useDialog?: boolean;
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
        [key: string]: any;
        children?: VueUiTreemapDatapoint[];
        color: string;
        id: string;
        name: string;
        normalizedValue: number;
        parentName?: string;
        parentId?: string;
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

    export type VueUiTreemapExpose = {
        getData(): Promise<Array<VueUiTreemapDatapoint>>
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generateImage(): void
        generateSvg(): void
        generatePdf(): void
        toggleTable(): void
        toggleTooltip(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
        showSeries(name: string): void
        hideSeries(name: string): void
    }

    export const VueUiTreemap: DefineComponent<
        {
            config?: VueUiTreemapConfig;
            dataset: VueUiTreemapDatasetItem[];
        },
        VueUiTreemapExpose
    >;

    export type VueUiKpiConfig = {
        debug?: boolean;
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
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiGalaxyDatasetItem[]>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiGalaxyConfig>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean; // v3
        events?: { // v3
            datapointEnter?: VueUiGalaxyEvent; // v3
            datapointLeave?: VueUiGalaxyEvent; // v3
            datapointClick?: VueUiGalaxyEvent; // v3
        };
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
                            showValueFirst?: boolean;
                            usePercentageParens?: boolean;
                            useValueParens?: boolean;
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
                    showValue?: boolean;
                    showPercentage?: boolean;
                    position?: 'bottom' | 'top';
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
            useDialog?: boolean;
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
        absoluteIndex: number;
    };

    export type VueUiGalaxySeriesItem = VueUiGalaxyDatasetItem & {
        id: string;
        color: string;
        seriesIndex: number;
        value: number;
    };

    export type VueUiGalaxyExpose = {
        getData(): Promise<Array<{
            name: string,
            color: string,
            value: number
        }>>
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generateImage(): void
        generatePdf(): void
        generateSvg(): void
        toggleTable(): void
        toggleTooltip(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
        showSeries(name: string): void
        hideSeries(name: string): void
    }

    export const VueUiGalaxy: DefineComponent<
        {
            config?: VueUiGalaxyConfig;
            dataset: VueUiGalaxyDatasetItem[];
        },
        VueUiGalaxyExpose
    >;

    export type VueUiSparkgaugeDataset = {
        value: number;
        min: number;
        max: number;
        title?: string;
    };

    export type VueUiSparkgaugeConfig = {
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiSparkgaugeConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiSparkgaugeDataset>;
        debug?: boolean; // v3
        loading?: boolean; // v3
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
        color?: string;
    };

    export type VueUiMoleculeConfig = {
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiMoleculeDatasetNode[]>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiMoleculeConfig>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        events?: {
            datapointEnter?: VueUiMoleculeEvent; // v3
            datapointLeave?: VueUiMoleculeEvent; // v3
            datapointClick?: VueUiMoleculeEvent; // v3
        };
        theme?: Theme;
        customPalette?: string[];
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
                    show?: boolean;
                    speed?: number;
                };
            };
        };
        table?: {
            show?: boolean;
            useDialog?: boolean;
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

    export type VueUiMoleculeExpose = {
        getData(): Promise<Array<VueUiMoleculeDatapoint>>
        getImage(options?: { scale?: number }): GetImagePromise
        generatePdf(): void
        generateCsv(): void
        generateImage(): void
        generateSvg(): void
        toggleTable(): void
        toggleTooltip(): void
        toggleLabels(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
        toggleZoom(): void
    }

    export const VueUiMolecule: DefineComponent<
        {
            dataset: VueUiMoleculeDatasetNode[];
            config?: VueUiMoleculeConfig;
        },
        VueUiMoleculeExpose
    >;

    export type VueUiDigitsConfig = {
        backgroundColor?: string;
        height?: string;
        width?: string;
        digits?: {
            color?: string;
            skeletonColor?: string;
            thickness?: number;
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

    export type VueUi3dBarDatapoint = {
        breakdown: null | Array<{
            name: string;
            value: number;
        }>;
        color: string;
        fill: Object; // Feeling too lazy to drill that one
        id: string;
        name: string;
        proportion: number;
        seriesIndex: number;
        value: number;
    }

    export type VueUi3dBarConfig = {
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUi3dBarDataset>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUi3dBarConfig>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean; // v3
        events?: { // v3
            datapointEnter?: VueUi3dBarEvent; // v3
            datapointLeave?: VueUi3dBarEvent; // v3
            datapointClick?: VueUi3dBarEvent; // v3
        };
        useCssAnimation?: boolean; // v3
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
            useDialog?: boolean;
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

    export type VueUi3dBarExpose = {
        getImage(options?: { scale?: number }): GetImagePromise
        generatePdf(): void
        generateCsv(): void
        generateSvg(): void
        generateImage(): void
        toggleTable(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
    }

    export const VueUi3dBar: DefineComponent<
        {
            config?: VueUi3dBarConfig;
            dataset: VueUi3dBarDataset;
        },
        VueUi3dBarExpose
    >;

    export type VueUiMoodRadarDataset = {
        "1": number;
        "2": number;
        "3": number;
        "4": number;
        "5": number;
    };

    export type VueUiMoodRadarDatapoint = {
        index: number;
        key: "1" | "2" | "3" | "4" | "5";
        value: number;
        proportion: number;
        color: string;
    }

    export type VueUiMoodRadarConfig = {
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiMoodRadarConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiMoodRadarDataset>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean; // v3
        events?: {
            datapointEnter?: VueUiMoodRadarEvent; // v3
            datapointLeave?: VueUiMoodRadarEvent; // v3
            datapointClick?: VueUiMoodRadarEvent; // v3
        };
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
                        prefix?: string;
                        suffix?: string;
                    };
                };
                title?: ChartTitle;
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                    roundingPercentage?: number;
                    roundingValue?: number;
                    position?: 'bottom' | 'top';
                };
            };
        };
        table?: {
            show?: boolean;
            useDialog?: boolean;
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

    export type VueUiMoodRadarExpose = {
        getData(): Promise<Array<{
            color: string
            index: number
            key: string
            proportion: number
            value: number
        }>>
        getImage(options?: { scale?: number }): GetImagePromise
        generatePdf(): void
        generateCsv(): void
        generateImage(): void
        generateSvg(): void
        toggleTable(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
    }

    export const VueUiMoodRadar: DefineComponent<
        {
            dataset: VueUiMoodRadarDataset;
            config?: VueUiMoodRadarConfig;
        },
        VueUiMoodRadarExpose
    >;

    export type VueUiIconName =
        | "accessibility"
        | "addColumn"
        | "addRow"
        | "aToZ"
        | "accordion"
        | "annotator"
        | "annotatorDisabled"
        | "apiStream"
        | "arrowBottom"
        | "arrowLeft"
        | "arrowRight"
        | "arrowTop"
        | "battery"
        | "bell"
        | "bellOff"
        | "bellRing"
        | "binary"
        | "blur"
        | "boxes"
        | "branches"
        | "bringToBack"
        | "bringToFront"
        | "bucket"
        | "bucketEmpty"
        | "bucketFill"
        | "bucketRecycle"
        | "bug"
        | "building"
        | "calendar"
        | "carouselTable"
        | "chart3dBar"
        | "chartAgePyramid"
        | "chartBar"
        | "chartBullet"
        | "chartBump"
        | "chartCandlestick"
        | "chartChestnut"
        | "chartChord"
        | "chartCirclePack"
        | "chartCluster"
        | "chartDag"
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
        | "chartRidgeline"
        | "chartRings"
        | "chartScatter"
        | "chartSparkHistogram"
        | "chartSparkStackbar"
        | "chartSparkbar"
        | "chartSparkline"
        | "chartStackbar"
        | "chartStackline"
        | "chartStripPlot"
        | "chartTable"
        | "chartTableSparkline"
        | "chartThermometer"
        | "chartTiremarks"
        | "chartVerticalBar"
        | "chartWaffle"
        | "chartWheel"
        | "chartWordCloud"
        | "chartWordCloudZh"
        | "check"
        | "checkList"
        | "chip"
        | "chipAi"
        | "chipBinary"
        | "circle"
        | "circleCancel"
        | "circleCheck"
        | "circleExclamation"
        | "circleFill"
        | "circleQuestion"
        | "clip"
        | "clipBoard"
        | "clipboardBar"
        | "clipboardDonut"
        | "clipboardLine"
        | "clipboardVariable"
        | "close"
        | "cloud"
        | "cloudRain"
        | "colorPicker"
        | "computer"
        | "copy"
        | "copyLeft"
        | "croissant"
        | "csv"
        | "curlyBrackets"
        | "curlySpread"
        | "cursor"
        | "dashboard"
        | "database"
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
        | "direction"
        | "document"
        | "doubleCheck"
        | "doubleSpark"
        | "download"
        | "envelope"
        | "excel"
        | "exitFullscreen"
        | "export"
        | "externalLink"
        | "eye"
        | "file"
        | "fileCsv"
        | "filePdf"
        | "filePlus"
        | "filePng"
        | "fileSvg"
        | "fileSearch"
        | "focus"
        | "folder"
        | "folderFill"
        | "folderOpen"
        | "folderOpenFill"
        | "fork"
        | "frameLine"
        | "fullscreen"
        | "func"
        | "gisLayerQuery"
        | "gisLayerSearch"
        | "hexagon"
        | "hexagonFill"
        | "hierarchy"
        | "histogram"
        | "histogramDown"
        | "histogramUp"
        | "home"
        | "homeFilled"
        | "hourglass"
        | "htmlTag"
        | "icons"
        | "image"
        | "key"
        | "knobs"
        | "kpi"
        | "kpiBox"
        | "labelClose"
        | "labelOpen"
        | "lambda"
        | "lap"
        | "laptop"
        | "legend"
        | "lightBulbOff"
        | "lightBulbOn"
        | "lineUp"
        | "link"
        | "listType"
        | "lock"
        | "magnify"
        | "menu"
        | "microscope"
        | "minimap"
        | "minus"
        | "monitor"
        | "moodEmbarrassed"
        | "moodFlat"
        | "moodHappy"
        | "moodLaughing"
        | "moodNeutral"
        | "moodSad"
        | "moodSurprised"
        | "moodWink"
        | "move"
        | "mu"
        | "network"
        | "nineToZero"
        | "numbers"
        | "palette"
        | "pause"
        | "pdf"
        | "pentagon"
        | "pentagonFill"
        | "people"
        | "people"
        | "percentage"
        | "percentageDown"
        | "percentageUp"
        | "person"
        | "pi"
        | "pie"
        | "play"
        | "plotArrow"
        | "plotLine"
        | "plug"
        | "plus"
        | "pointer"
        | "printer"
        | "puzzle"
        | "puzzleFill"
        | "ratio"
        | "recycle"
        | "refresh"
        | "resize"
        | "resizeTLBR"
        | "resizeTRBL"
        | "resizeX"
        | "resizeY"
        | "restart"
        | "revert"
        | "robot"
        | "save"
        | "scada"
        | "screenshot"
        | "selectAndGroup"
        | "settings"
        | "shield"
        | "shieldExclam"
        | "sigma"
        | "skeleton"
        | "sliders"
        | "smiley"
        | "sort"
        | "spark"
        | "spin"
        | "spinner1"
        | "spinner2"
        | "spinner3"
        | "spinner4"
        | "sql"
        | "sqlQuery"
        | "sqlSearch"
        | "square"
        | "squareFill"
        | "stack"
        | "star"
        | "starFace"
        | "starFill"
        | "stop"
        | "sun"
        | "svg"
        | "tableClose"
        | "tableDialogClose"
        | "tableDialogOpen"
        | "tableOpen"
        | "tag"
        | "target"
        | "test"
        | "text"
        | "tooltip"
        | "tooltipDisabled"
        | "trash"
        | "trend"
        | "trendDown"
        | "trendUp"
        | "triangle"
        | "triangleExclamation"
        | "triangleFill"
        | "triangleInformation"
        | "twig"
        | "unlock"
        | "unplug"
        | "unstack"
        | "upload"
        | "vueDataUi"
        | "wifi"
        | "world"
        | "wrench"
        | "zToA"
        | "zeroToNine"
        | "zoomLock"
        | "zoomMinus"
        | "zoomPlus"
        | "zoomUnlock";

    export const VueUiIcon: DefineComponent<{
        name: VueUiIconName;
        stroke?: string;
        strokeWidth?: number;
        size?: number | string;
        isSpin?: boolean;
        spinDuration?: string;
    }>;

    export type VueUiDonutEvolutionDatapoint = {
        activeRadius: number;
        donut: VueUiDonutDatapoint[];
        donutFocus: VueUiDonutDatapoint[];
        donutHover: VueUiDonutDatapoint[];
        hoverRadius: number;
        index: number;
        percentages: number[0];
        radius: number;
        subtotal: number;
        values: Array<number | null>;
        x: number;
        y: number;
    }

    export type VueUiDonutEvolutionConfig = {
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiDonutEvolutionDatasetItem[]>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiDonutEvolutionConfig>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean; // v3
        events?: { // v3
            datapointEnter?: VueUiDonutEvolutionEvent; // v3
            datapointLeave?: VueUiDonutEvolutionEvent; // v3
            datapointClick?: VueUiDonutEvolutionEvent; // v3
        };
        theme?: Theme;
        customPalette?: string[];
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                zoom?: ChartZoom;
                donuts?: {
                    hover?: {
                        hideLabelsUnderValue?: number;
                    };
                    /** Deprecated since v2.12.4. Use style.chart.dialog */
                    zoom?: {
                        /** Deprecated since v2.12.4. Use style.chart.dialog */
                        hideLabelsUnderValue?: number;
                    }
                };
                dialog?: {
                    show?: boolean;
                    backgroundColor?: string;
                    color?: string;
                    header?: {
                        backgroundColor?: string;
                        color?: string;
                    };
                    donutChart?: VueUiDonutConfig;
                };
                layout?: {
                    height?: number;
                    width?: number;
                    padding?: ChartPadding;
                    grid?: {
                        show?: boolean;
                        stroke?: string;
                        strokeWidth?: number;
                        showVerticalLines?: boolean;
                        axis?: { // v3
                            yLabel?: string; // v3
                            yLabelOffsetX?: number; // v3
                            xLabel?: string; // v3
                            xLabelOffsetY?: number; // v3
                            fontSize?: number; // v3
                            color?: string; // v3
                        };
                        yAxis?: {
                            scaleMin?: number | null;
                            scaleMax?: number | null;
                            autoScale?: boolean;
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
                                values?: Array<number | string>;
                                datetimeFormatter?: AxisDateFormatter;
                                fontSize?: number;
                                showOnlyFirstAndLast?: boolean;
                                color?: string;
                                rotation?: number;
                                autoRotate?: { // v3
                                    enable?: boolean; // v3
                                    angle?: number; // v3
                                };
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
                    showValue?: boolean;
                    showPercentage?: boolean;
                    position?: 'bottom' | 'top';
                };
            };
        };
        table?: {
            show?: boolean;
            useDialog?: boolean;
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
        values: Array<number | null>;
        color?: string;
    };

    export type VueUiDonutEvolutionExpose = {
        getData(): Promise<Array<{
            color: string
            length: number
            name: string
            uid: string
            values: Array<number | null>
        }>>
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generateImage(): void
        generateSvg(): void
        generatePdf(): void
        toggleAnnotator(): void
        toggleTable(): void
        toggleFullscreen(): void
        showSeries(name: string): void
        hideSeries(name: string): void
    }

    export const VueUiDonutEvolution: DefineComponent<
        {
            config?: VueUiDonutEvolutionConfig;
            dataset: VueUiDonutEvolutionDatasetItem[];
        },
        VueUiDonutEvolutionExpose
    >;

    export type VueUiTiremarksConfig = {
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiTiremarksConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiTiremarksDataset>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean; // v3
        theme?: Theme;
        userOptions?: ChartUserOptions;
        style?: {
            fontFamily?: string;
            chart?: {
                width?: number; // v3
                height?: number; // v3
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

    export type VueUiTiremarksExpose = {
        getImage(options?: { scale?: number }): GetImagePromise
        generateImage(): void
        generatePdf(): void
        generateSvg(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
    }

    export const VueUiTiremarks: DefineComponent<
        {
            config?: VueUiTiremarksConfig;
            dataset: VueUiTiremarksDataset;
        },
        VueUiTiremarksExpose
    >;

    export type VueUiWheelConfig = {
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiWheelConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiWheelDataset>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean;
        theme?: Theme;
        layout?: 'classic' | '3d',
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
                        radiusRatio?: number;
                        tiltAngle3d?: number;
                        ticks?: {
                            type?: 'classic' | 'arc';
                            rounded?: boolean;
                            inactiveColor?: string;
                            activeColor?: string;
                            sizeRatio?: number;
                            quantity?: number;
                            strokeWidth?: number;
                            stroke?: string;
                            spacingRatio3d?: number;
                            shadeColorRatio3d?: number;
                            depth3d?: number;
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
                        radiusRatio?: number;
                    };
                    percentage?: {
                        show?: boolean;
                        fontSize?: number;
                        rounding?: number;
                        bold?: boolean;
                        formatter?: Formatter;
                        offsetX?: number;
                        offsetY?: number;
                        stroke?: string;
                        strokeWidth?: number;
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

    export type VueUiWheelExpose = {
        getImage(options?: { scale?: number }): GetImagePromise
        generateImage(): void
        generatePdf(): void
        generateSvg(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
    }

    export const VueUiWheel: DefineComponent<
        {
            dataset: VueUiWheelDataset;
            config?: VueUiWheelConfig;
        },
        VueUiWheelExpose
    >;

    export type VueUiRingsConfig = {
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiRingsConfig>;
        skeletonDatastet?: VueUiBuiltInSkeletonDataset<VueUiRingsDatasetItem[]>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean;
        events?: {
            datapointEnter?: VueUiRingsEvent; // v3
            datapointLeave?: VueUiRingsEvent; // v3
            datapointClick?: VueUiRingsEvent; // v3
        };
        theme?: Theme;
        customPalette?: string[];
        useCssAnimation?: boolean;
        useBlurOnHover?: boolean;
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                size?: number;
                layout?: {
                    labels?: {
                        dataLabels?: {
                            showValueFirst?: boolean;
                            usePercentageParens?: boolean;
                            useValueParens?: boolean;
                            prefix?: string;
                            suffix?: string;
                            formatter?: Formatter;
                            show?: boolean;
                            offsetX?: number;
                            fontSize?: number;
                            color?: number;
                            bold?: number;
                            showValue?: boolean;
                            showPercentage?: boolean;
                            roundingValue?: number;
                            roundingPercentage?: number;
                            markers?: {
                                position?: 'left' | 'right';
                                stroke?: string;
                                strokeWidth?: number;
                                radius?: number;
                            }
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
                    showValue?: boolean;
                    showPercentage?: boolean;
                    position?: 'bottom' | 'top';
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
            useDialog?: boolean;
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
        absoluteIndex: number;
    };

    export type VueUiRingsDatasetItem = {
        name: string;
        color?: string;
        values: number[];
    };

    export type VueUiRingsExpose = {
        getData(): Promise<Array<{
            name: string
            color: string
            value: number
            absoluteValues: number[]
            percentage: number
        }>>
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generateImage(): void
        generatePdf(): void
        generateSvg(): void
        toggleTable(): void
        toggleTooltip(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
        showSeries(name: string): void
        hideSeries(name: string): void
    }

    export const VueUiRings: DefineComponent<
        {
            config?: VueUiRingsConfig;
            dataset: VueUiRingsDatasetItem[];
        },
        VueUiRingsExpose
    >;

    export type VueUiSparkHistogramConfig = {
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiSparkHistogramConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiSparkHistogramDatasetItem[]>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean; // v3
        events?: {
            datapointEnter?: VueUiSparkHistogramEvent; // v3
            datapointLeave?: VueUiSparkHistogramEvent; // v3
            datapointClick?: VueUiSparkHistogramEvent; // v3
        };
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
                    show?: boolean;
                    fontSize?: number;
                    minFontSize?: number; // v3
                    color?: string;
                    bold?: boolean;
                    rounding?: number;
                    prefix?: string;
                    suffix?: string;
                    offsetY?: number;
                    formatter?: Formatter;
                };
                valueLabel?: {
                    show?: boolean;
                    fontSize?: number;
                    minFontSize?: number; // v3
                    color?: string;
                    bold?: boolean;
                    rounding?: number;
                };
                timeLabel?: {
                    show?: boolean;
                    fontSize?: number;
                    minFontSize?: number; // v3
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
        value?: number | null;
        valueLabel?: string;
        width?: number;
        x?: number;
        y?: number;
    };

    export const VueUiSparkHistogram: DefineComponent<{
        config?: VueUiSparkHistogramConfig;
        dataset: VueUiSparkHistogramDatasetItem[];
    }>;

    export type VueUiSparkStackbarDatapoint = {
        color: string;
        id: string;
        name: string;
        proportion: number;
        proportionLabel: string;
        seriesIndex: number;
        start: number;
        value: number;
        width: number;
    }

    export type VueUiSparkStackbarConfig = {
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiSparkStackbarConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiSparkStackbarDatasetItem[]>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        useCursorPointer?: boolean;
        events?: {
            datapointEnter?: VueUiSparkStackbarEvent; // v3
            datapointLeave?: VueUiSparkStackbarEvent; // v3
            datapointClick?: VueUiSparkStackbarEvent; // v3
        }
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
                selectAllToggle?: {
                    show?: boolean;
                    backgroundColor?: string;
                    color?: string;
                };
            };
            title?: {
                textAlign?: TextAlign;
                text?: string;
                color?: string;
                fontSize?: number;
                bold?: boolean;
                margin?: string;
                paddingLeft?: number;
                paddingRight?: number;
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
        value?: number | null;
        width?: number;
    };

    export type VueUiSparkStackbarExpose = {
        showSeries(name: string): void
        hideSeries(name: string): void
    }

    export const VueUiSparkStackbar: DefineComponent<
        {
            config?: VueUiSparkStackbarConfig;
            dataset: VueUiSparkStackbarDatasetItem[];
        },
        VueUiSparkStackbarExpose
    >;

    export type VueUiThermometerConfig = {
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiThermometerConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiThermometerDataset>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean; // v3
        theme?: Theme;
        customPalette?: string[];
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                height?: number;
                width?: number; // v3
                thermometer?: {
                    width?: number;
                };
                padding?: {
                    // v3 left and right are deprecated
                    top?: number;
                    bottom?: number;
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
                    show?: boolean; // v3
                    fontSize?: number;
                    minFontSize?: number;
                    rounding?: number;
                    bold?: boolean;
                    prefix?: string;
                    suffix?: string;
                    formatter?: Formatter;
                    color?: string;
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

    export type VueUiThermometerExpose = {
        getImage(options?: { scale?: number }): GetImagePromise
        generateImage(): void
        generatePdf(): void
        generateSvg(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
    }

    export const VueUiThermometer: DefineComponent<
        {
            config?: VueUiThermometerConfig;
            dataset: VueUiThermometerDataset;
        },
        VueUiThermometerExpose
    >;

    export type VueUiRelationCircleConfig = {
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiRelationCircleDatasetItem[]>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiRelationCircleConfig>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean;
        events?: { // v3
            datapointEnter?: VueUiRelationCircleEvent; // v3
            datapointLeave?: VueUiRelationCircleEvent; // v3
            datapointClick?: VueUiRelationCircleEvent; // v3
        };
        responsiveProportionalSizing?: boolean;
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
                minFontSize?: number; // v3
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

    export type VueUiRelationCircleDatapoint = {
        color: string;
        id: string;
        label: string;
        regAngle: number;
        relations: string[];
        totalWeight: number;
        weights: number[];
        x: number;
        y: number;
    }

    export type VueUiRelationCircleExpose = {
        getImage(options?: { scale?: number }): GetImagePromise
        generatePdf(): void
        generateImage(): void
        generateSvg(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
    }

    export const VueUiRelationCircle: DefineComponent<
        {
            config?: VueUiRelationCircleConfig;
            dataset: VueUiRelationCircleDatasetItem[];
        },
        VueUiRelationCircleExpose
    >;

    export type VueUiAnnotatorConfig = {
        alwaysVisible?: boolean;
        useCursorPointer?: boolean;
        style?: {
            backgroundColor?: string;
            color?: string;
            fontFamily?: string;
            showPrint?: boolean;
            showSave?: boolean;
            showTooltips?: boolean;
            showImage?: boolean;
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
            tooltipRedo?: string;
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
            tooltipImage?: string;
        };
    };

    export type VueUiAnnotatorDataset = VueUiUnknownObj;

    export const VueUiAnnotator: DefineComponent<{
        config?: VueUiAnnotatorConfig;
        dataset?: VueUiAnnotatorDataset;
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
            };
        };
        userOptions?: {
            show?: boolean;
            showOnChartHover?: boolean;
            keepStateOnChartLeave?: boolean;
            position?: 'right' | 'left';
            useCursorPointer?: boolean;
            buttons?: {
                pdf?: boolean;
                img?: boolean;
                annotator?: boolean;
            };
            callbacks?: {
                pdf?: null | (({ domElement, imageUri, base64 }: { domElement?: string; imageUri?: string; base64?: string } = {}) => void);
                img?: null | (({ domElement, imageUri, base64 }: { domElement?: string; imageUri?: string; base64?: string } = {}) => void);
                annotator?: null | (() => void);
            };
            buttonTitles?: {
                pdf?: string;
                img?: string;
                annotator?: string;
            };
            print?: {
                scale?: number;
                filename?: string;
            }
        }
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
        value: number | null;
        suffix?: string;
        prefix?: string;
        rounding?: number;
        color?: string;
        target?: number;
        formatter?: Formatter;
    };

    export type VueUiSparkbarConfig = {
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiSparkbarDatasetItem[]>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiSparkbarConfig>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        theme?: Theme;
        events?: { // v3
            datapointEnter?: VueUiSparkbarEvent; // v3
            datapointLeave?: VueUiSparkbarEvent; // v3
            datapointClick?: VueUiSparkbarEvent; // v3
        }
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

    export type VueUiAgePyramidDatasetRow = [
        year: string,
        rank: number,
        v1: number | null,
        v2: number | null
    ]

    export type VueUiAgePyramidDataset = VueUiAgePyramidDatasetRow[];

    export type VueUiAgePyramidConfig = {
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiAgePyramidDataset>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiAgePyramidConfig>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean;
        events?: { // v3
            datapointEnter?: VueUiAgePyramidEvent; // v3
            datapointLeave?: VueUiAgePyramidEvent; // v3
            datapointClick?: VueUiAgePyramidEvent; // v3
        };
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
                        rotation?: number;
                        autoRotate?: { // v3
                            enable?: boolean; // v3
                            angle?: number; // v3
                        }
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
            useDialog?: boolean;
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

    export type VueUiAgePyramidExpose = {
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generateImage(): void
        generatePdf(): void
        generateSvg(): void
        toggleTable(): void
        toggleAnnotator(): void
        toggleTooltip(): void
        toggleFullscreen(): void
    }

    export const VueUiAgePyramid: DefineComponent<
        {
            config?: VueUiAgePyramidConfig;
            dataset: VueUiAgePyramidDataset;
        },
        VueUiAgePyramidExpose
    >;

    export type OHLC = [
        timestamp: string | number,
        open: number,
        high: number,
        low: number,
        close: number,
        volume: number
    ]

    export type VueUiCandlestickConfig = {
        skeletonDataset?: VueUiBuiltInSkeletonDataset<OHLC[]>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiCandlestickConfig>;
        type?: 'ohlc' | 'candlesctick';
        debug?: boolean;
        loading?: boolean;
        responsive?: boolean;
        events?: { // v3
            datapointEnter?: VueUiCandlestickEvent; // v3
            datapointLeave?: VueUiCandlestickEvent; // v3
            datapointClick?: VueUiCandlestickEvent; // v3
        };
        responsiveProportionalSizing?: boolean;
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
                    verticalLines?: {
                        show?: boolean;
                        strokeDasharray?: number;
                        strokeWidth?: number;
                        stroke?: string;
                    };
                    horizontalLines?: {
                        show?: boolean;
                        strokeDasharray?: number;
                        strokeWidth?: number;
                        stroke?: string;
                    };
                    xAxis?: {
                        ticks?: {
                            show?: boolean;
                        };
                        dataLabels?: {
                            show?: boolean;
                            fontSize?: number;
                            color?: string;
                            offsetY?: number;
                            bold?: boolean;
                            rotation?: number;
                            autoRotate?: { // v3
                                enable?: boolean; // v3
                                angle?: number; // v3
                            };
                            datetimeFormatter?: AxisDateFormatter;
                            showOnlyFirstAndLast?: boolean;
                            showOnlyAtModulo?: boolean;
                            modulo?: number;
                        };
                    };
                    yAxis?: {
                        scale?: {
                            min?: number | null;
                            max?: number | null;
                        };
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
            zoom?: ChartZoom & {
                preview?: {
                    enable?: boolean;
                    fill?: string;
                    stroke?: string;
                    strokeWidth?: number;
                    strokeDasharray?: number;
                };
                useDefaultFormat?: boolean;
                timeFormat?: string;
                customFormat?:
                    | null
                    | ((params: MinimalCustomFormatParams<OHLC[]>) => string);
            };
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
                useDefaultTimeFormat?: boolean;
                timeFormat?: string;
                showChart?: boolean;
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
            useDialog?: boolean;
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

    export type VueUiCandlestickExpose = {
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generateImage(): void
        generatePdf(): void
        generateSvg(): void
        toggleTable(): void
        toggleAnnotator(): void
        toggleTooltip(): void
        toggleFullscreen(): void
    }

    export const VueUiCandlestick: DefineComponent<
        {
            config?: VueUiCandlestickConfig;
            dataset: OHLC[];
            selectedXIndex?: number | null;
        },
        VueUiCandlestickExpose
    >;

    export type VueUiScatterDatasetValueItem = {
        [key: string]: any;
        name: string;
        x: number;
        y: number;
        shape?: Shape;
        weight?: number;
    };

    export type VueUiScatterDatasetItem = {
        [key: string]: any;
        name: string;
        values: VueUiScatterDatasetValueItem[];
        color?: string;
        shape?: Shape;
    };

    export type VueUiScatterConfig = {
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiScatterConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiScatterDatasetItem[]>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean;
        events?: {
            datapointEnter?: VueUiScatterEvent; // v3
            datapointLeave?: VueUiScatterEvent; // v3
            datapointClick?: VueUiScatterEvent; // v3
        };
        theme?: Theme;
        customPalette?: string[];
        usePerformanceMode?: boolean;
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
                    highlighter?: {
                        show?: boolean;
                        opacity?: number;
                        color?: string;
                        stroke?: string;
                        strokeWidth?: number;
                        strokeDasharray?: number;
                        highlightBothAxes?: boolean;
                    }
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
                position?: 'bottom' | 'top';
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
            useDialog?: boolean;
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
        [key: string]: any;
        clusterName: string | undefined;
        color: string;
        deviation: number;
        id: string;
        shape: Shape | null;
        v: {
            [key: string]: any;
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

    export type VueUiScatterExpose = {
        getData(): Promise<Array<VueUiScatterSeries>>
        getImage(options?: { scale?: number }): GetImagePromise
        generatePdf(): void
        generateCsv(): void
        generateImage(): void
        generateSvg(): void
        toggleTable(): void
        toggleTooltip(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
        showSeries(name: string): void
        hideSeries(name: string): void
    }

    export const VueUiScatter: DefineComponent<
        {
            config?: VueUiScatterConfig;
            dataset: VueUiScatterDatasetItem[];
        },
        VueUiScatterExpose
    >;

    export type VueUiHeatmapConfig = {
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiHeatmapDatasetItem[]>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiHeatmapConfig>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean; // v3
        theme?: Theme;
        style?: {
            backgroundColor?: string;
            color?: string;
            fontFamily?: string;
            layout?: {
                height?: number;
                width?: number;
                padding?: ChartPadding;
                crosshairs?: {
                    show?: boolean;
                    stroke?: string;
                    strokeWidth?: number;
                    strokeDasharray?: number;
                };
                cells?: {
                    // height?: number; // v3 deprecated
                    columnTotal?: {
                        value?: {
                            show?: boolean;
                            rotation?: number;
                            autoRotate?: { // v3
                                enable?: boolean; // v3
                                angle?: number; // v3
                            };
                            offsetX?: number;
                            offsetY?: number;
                        };
                        color?: {
                            show?: boolean;
                        };
                    };
                    rowTotal?: {
                        value?: {
                            show?: boolean;
                        };
                        color?: {
                            show?: boolean;
                        };
                    };
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
                        datetimeFormatter?: AxisDateFormatter; // v3
                        showOnlyAtModulo?: number | null;
                        rotation?: number;
                        autoRotate?: { // v3
                            enable?: boolean; // v3
                            angle?: number; // v3
                        };
                        fontSize?: number;
                        color?: string;
                        bold?: boolean;
                        offsetX?: number;
                        offsetY?: number;
                    };
                    yAxis?: {
                        show?: boolean;
                        values?: Array<string | number>;
                        datetimeFormatter?: AxisDateFormatter; // v3
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
                width?: number;
                // position?: "right" | "bottom"; // v3 deprecated
                // scaleBorderRadius?: number; // v3 deprecated
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
            useDialog?: boolean;
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
        value: number | null;
        xAxisName: string | undefined;
        yAxisName: string | undefined;
    };

    export type VueUiHeatmapRow = {
        name: string;
        temperatures: VueUiHeatmapDatapoint[];
        values: Array<number | null>;
    };

    export type VueUiHeatmapDatasetItem = {
        name: string | number;
        values: Array<number | null>;
    };

    export type VueUiHeatmapExpose = {
        getData(): Promise<Array<{
            name: string
            temperatures: Array<{
                color: string
                id: string
                ratio: number
                side: 'up' | 'down'
                value: number
                xAxisName: number | string
                yAxisName: number | string
            }>
            values: Array<string | number>
        }>>
        getImage(options?: { scale?: number }): GetImagePromise
        generatePdf(): void
        generateCsv(): void
        generateImage(): void
        generateSvg(): void
        toggleTable(): void
        toggleTooltip(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
    }

    export const VueUiHeatmap: DefineComponent<
        {
            config?: VueUiHeatmapConfig;
            dataset: VueUiHeatmapDatasetItem[];
        },
        VueUiHeatmapExpose
    >;

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

    export type VueUiXyAnnotation = {
        show?: boolean;
        yAxis?: {
            yTop?: number | null;
            yBottom?: number | null;
            label?: {
                text?: string;
                textAnchor?: 'start' | 'end';
                position?: 'start' | 'end';
                offsetX?: number;
                offsetY?: number;
                padding?: ChartPadding;
                border?: {
                    stroke?: string;
                    strokeWidth?: number;
                    rx?: number;
                    ry?: number;
                };
                fontSize?: number;
                color?: string;
                backgroundColor?: string;
            };
            line?: {
                stroke?: string;
                strokeWidth?: number;
                strokeDasharray?: number;
            };
            area?: {
                fill?: string;
                opacity?: number; // 0 - 100
            }
        }
    }

    export type VueUiXyConfig = {
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiXyDatasetItem[]>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiXyConfig>;
        debug?: boolean; // v3
        responsive?: boolean; // v3
        loading?: boolean; // v3
        events?: { // v3
            datapointEnter?: VueUiXyEvent; // v3
            datapointLeave?: VueUiXyEvent; // v3
            datapointClick?: VueUiXyEvent; // v3
        };
        responsiveProportionalSizing?: boolean;
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
            zoom?: ChartZoom & {
                preview?: {
                    enable?: boolean;
                    fill?: string;
                    stroke?: string;
                    strokeWidth?: number;
                    strokeDasharray?: number;
                };
                useDefaultFormat?: boolean;
                timeFormat?: string;
                customFormat?:
                | null
                | ((params: MinimalCustomFormatParams<VueUiXyDatapointItem[]>) => string);
            };
            padding?: ChartPadding;
            annotations?: VueUiXyAnnotation[];
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
                useDefaultFormat?: boolean;
                timeFormat?: string;
                customFormat?:
                | null
                | ((params: MinimalCustomFormatParams<VueUiXyDatapointItem[]>) => string);
            };
            highlightArea?: VueUiXyHighlightArea | VueUiXyHighlightArea[];
            grid?: {
                stroke?: string;
                showHorizontalLines?: boolean;
                showVerticalLines?: boolean;
                position?: "middle" | "start";
                frame?: ChartFrame;
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
                        useNiceScale?: boolean;
                        stacked?: boolean;
                        gap?: number;
                        labelWidth?: number;
                        showBaseline?: boolean;
                        showCrosshairs?: boolean;
                        crosshairSize?: number;
                        formatter?: Formatter;
                        scaleMin?: number | null;
                        scaleMax?: number | null;
                        groupColor?: string | null;
                        scaleLabelOffsetX?: number;
                        scaleValueOffsetX?: number;
                        rounding?: number;
                        serieNameFormatter?: Formatter;
                    };
                    xAxis?: {
                        showBaseline?: boolean;
                        showCrosshairs?: boolean;
                        crosshairSize?: number;
                        crosshairsAlwaysAtZero?: boolean;
                    };
                    xAxisLabels?: {
                        color?: string;
                        show?: boolean;
                        values?: Array<number | string>;
                        fontSize?: number;
                        showOnlyFirstAndLast?: boolean;
                        yOffset?: number;
                        rotation?: number;
                        showOnlyAtModulo?: boolean;
                        modulo?: number;
                        datetimeFormatter?: AxisDateFormatter;
                        autoRotate?: { // v3
                            enable?: boolean; // v3
                            angle?: number; // v3
                        }
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
                position?: 'bottom' | 'top';
                selectAllToggle?: ChartLegendToggle;
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
                    > & { absoluteIndex?: number }
                ) => string);
                showTimeLabel?: boolean;
                useDefaultTimeFormat?: boolean;
                timeFormat?: string;
            };
            userOptions?: ChartUserOptions;
        };
        bar?: {
            showTransition?: boolean;
            transitionDurationMs?: number;
            borderRadius?: number;
            useGradient?: boolean;
            periodGap?: number;
            innerGap?: number;
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
            showTransition?: boolean;
            transitionDurationMs?: number;
            radius?: number;
            useGradient?: boolean;
            strokeWidth?: number;
            cutNullValues?: boolean;
            interLine?: {
                pairs?: [string, string][];
                colors?: [string | undefined, string | undefined][];
                fillOpacity?: number;
            };
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
            tag?: {
                followValue?: boolean;
                formatter?: Formatter;
                fontSize?: number;
            };
        };
        plot?: {
            showTransition?: boolean;
            transitionDurationMs?: number;
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
            tag?: {
                followValue?: boolean;
                formatter?: Formatter;
                fontSize?: number;
            };
        };
        table?: {
            useDialog?: boolean;
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
            useDefaultTimeFormat?: boolean;
            timeFormat?: string;
        };
        showTable?: boolean;
    };

    export type VueUiXyDatasetItem = {
        [key: string]: any; // which can be recovered through the #svg slot
        name: string;
        series: Array<number | null>;
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
        temperatureColors?: string[]; // for line series only
    };

    export type VueUiXyDatasetBarItem = {
        absoluteValues: Array<number | null>;
        color: string;
        id: string;
        name: string;
        plots: Array<{ x: number; y: number; value: number }>;
        series: Array<number | null>;
        type: "bar";
    };

    export type VueUiXyDatasetLineItem = {
        absoluteValues: Array<number | null>;
        area: string;
        color: string;
        curve: string;
        dataLabels: boolean;
        id: string;
        name: string;
        plots: Array<{ x: number; y: number; value: number }>;
        series: Array<number | null>;
        shape: Shape | null;
        type: "line";
        useArea: boolean;
        useProgression: boolean;
        smooth?: boolean;
        useTag?: boolean;
    };

    export type VueUiXyDatasetPlotItem = {
        absoluteValues: Array<number | null>;
        color: string;
        id: string;
        name: string;
        plots: Array<{ x: number; y: number; value: number }>;
        series: Array<number | null>;
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
        value: number | null;
    };

    export type VueUiXyExpose = {
        getData(): Promise<Array<{ values: Array<number | null>, color: string, name: string, type: string }>>
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generateImage(): void
        generatePdf(): void
        generateSvg(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
        toggleLabels(): void
        toggleStack(): void
        toggleTable(): void
        toggleTooltip(): void
        showSeries(name: string): void
        hideSeries(name: string): void
    }

    export const VueUiXy: DefineComponent<
        {
            config?: VueUiXyConfig;
            dataset: VueUiXyDatasetItem[];
            selectedXIndex?: number | null; // v3
        },
        VueUiXyExpose
    >;

    export type VueUiDonutConfig = {
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiDonutDatasetItem[]>;
        skeletonConffig?: VueUiBuiltInSkeletonConfig<VueUiDonutConfig>;
        debug?: boolean;
        type?: "classic" | "polar";
        loading?: boolean;
        pie?: boolean;
        autoSize?: boolean;
        responsive?: boolean;
        theme?: Theme;
        customPalette?: string[];
        useBlurOnHover?: boolean;
        useCssAnimation?: boolean;
        events?: {
            datapointEnter?: VueUiDonutEvent;
            datapointLeave?: VueUiDonutEvent;
            datapointClick?: VueUiDonutEvent;
        };
        serieToggleAnimation?: {
            show?: boolean;
            durationMs?: number;
        };
        startAnimation?: {
            show?: boolean;
            durationMs?: number;
            staggerMs?: number;
        };
        style?: {
            fontFamily?: string;
            chart?: {
                useGradient?: boolean;
                gradientIntensity?: number;
                backgroundColor?: string;
                color?: string;
                padding?: ChartPadding;
                width?: number;
                height?: number;
                layout?: {
                    curvedMarkers?: boolean;
                    labels?: {
                        dataLabels?: {
                            show?: boolean;
                            oneLine?: boolean;
                            useLabelSlots?: boolean;
                            hideUnderValue?: number;
                            smallArcClusterThreshold?: number;
                            smallArcClusterFontSize?: number;
                            prefix?: string;
                            suffix?: string;
                            showValueFirst?: boolean;
                            usePercentageParens?: boolean;
                            useValueParens?: boolean;
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
                            minFontSize?: number;
                            rounding?: number;
                            formatter?: Formatter;
                        };
                        name?: {
                            color?: string;
                            bold?: boolean;
                            fontSize?: number;
                            minFontSize?: number;
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
                        radiusRatio?: number;
                        borderWidth?: number;
                        strokeWidth?: number;
                        useShadow?: boolean;
                        shadowColor?: string;
                        emptyFill?: string;
                        selectedColor?: string;
                        borderColorAuto?: boolean;
                        borderColor?: string;
                    };
                };
                comments?: ChartComments;
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    showPercentage?: boolean;
                    showValue?: boolean;
                    position?: 'bottom' | 'top';
                    showValueFirst?: boolean;
                    usePercentageParens?: boolean;
                    useValueParens?: boolean;
                };
                title?: ChartTitle;
                tooltip?: ChartTooltip & {
                    showValue?: boolean;
                    showPercentage?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    showValueFirst?: boolean;
                    usePercentageParens?: boolean;
                    useValueParens?: boolean;
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
            useDialog?: boolean;
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

    export type VueUiDonutExpose = {
        getData(): Promise<Array<{ name: string, color: string, value: number | null }>>
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generateImage(): void
        generatePdf(): void
        generateSvg(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
        toggleLabels(): void
        toggleTable(): void
        toggleTooltip(): void
        autoSize(): void
        showSeries(name: string): void
        hideSeries(name: string): void
    }

    export const VueUiDonut: DefineComponent<
        {
            config?: VueUiDonutConfig;
            dataset: VueUiDonutDatasetItem[];
        },
        VueUiDonutExpose
    >;

    export type VueUiNestedDonutsDatasetItem = {
        name: string;
        series: VueUiDonutDatasetItem[];
    };

    export type VueUiNestedDonutsConfig = {
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiNestedDonutsConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiNestedDonutsDatasetItem[]>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean;
        theme?: Theme;
        customPalette?: string[];
        useCssAnimation?: boolean;
        events?: {
            datapointEnter?: VueUiDonutEvent;
            datapointLeave?: VueUiDonutEvent;
            datapointClick?: VueUiDonutEvent;
        };
        serieToggleAnimation?: {
            show?: boolean;
            durationMs?: number;
        };
        startAnimation?: {
            show?: boolean;
            durationMs?: number;
            staggerMs?: number;
        };
        useBlurOnHover?: boolean;
        userOptions?: ChartUserOptions;
        style?: {
            fontFamily?: string;
            chart?: {
                useGradient?: boolean;
                gradientIntensity?: number;
                backgroundColor?: string;
                color?: string;
                padding?: ChartPadding;
                width?: number;
                height?: number;
                layout?: {
                    labels?: {
                        dataLabels?: {
                            showValueFirst?: boolean;
                            usePercentageParens?: boolean;
                            useValueParens?: boolean;
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
                            curvedDonutName?: boolean;
                            donutNameAbbreviation?: boolean;
                            donutNameOffsetY?: number;
                            donutNameMaxAbbreviationSize?: number;
                            formatter?: Formatter;
                        };
                    };
                    donut?: {
                        radiusRatio?: number;
                        strokeWidth?: number;
                        borderWidth?: number;
                        spacingRatio?: number;
                        useShadow?: boolean;
                        shadowColor?: string;
                        emptyFill?: string;
                        selectedColor?: string;
                        borderColorAuto?: boolean;
                        borderColor?: string;
                    };
                };
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    showValue?: boolean;
                    showPercentage?: boolean;
                    position?: 'bottom' | 'bottom';
                    showValueFirst?: boolean;
                    usePercentageParens?: boolean;
                    useValueParens?: boolean;
                };
                title?: ChartTitle;
                tooltip?: ChartTooltip & {
                    showAllItemsAtIndex?: boolean;
                    showValue?: boolean;
                    showPercentage?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    showValueFirst?: boolean;
                    usePercentageParens?: boolean;
                    useValueParens?: boolean;
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
            useDialog?: boolean;
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

    export type VueUiNestedDonutsExpose = {
        getData(): Promise<Array<{
            datasetIndex: number
            id: string
            name: string
            series: Array<{
                absoluteValues: number[]
                arcOf: string
                arcOfId: string
                color: string
                datasetIndex: number
                id: string
                name: string
                seriesIndex: number
                value: 0
            }>
            total: number
        }>>
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generateImage(): void
        generatePdf(): void
        generateSvg(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
        toggleLabels(): void
        toggleTable(): void
        toggleTooltip(): void
        autoSize(): void
        showSeries(name: string): void
        hideSeries(name: string): void
    }

    export const VueUiNestedDonuts: DefineComponent<
        {
            config?: VueUiNestedDonutsConfig;
            dataset: VueUiNestedDonutsDatasetItem[];
        },
        VueUiNestedDonutsExpose
    >;

    export type VueUiWaffleConfig = {
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiWaffleConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiWaffleDatasetItem[]>;
        debug?: boolean;
        loading?: boolean;
        responsive?: boolean;
        events?: { // v3
            datapointEnter?: VueUiWaffleEvent; // v3
            datapointLeave?: VueUiWaffleEvent; // v3
            datapointClick?: VueUiWaffleEvent; // v3
        };
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
                            showValueFirst?: boolean;
                            usePercentageParens?: boolean;
                            useValueParens?: boolean;
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
                    showValueFirst?: boolean;
                    usePercentageParens?: boolean;
                    useValueParens?: boolean;
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
                    showValue?: boolean;
                    showPercentage?: boolean;
                    position?: 'bottom' | 'top';
                    showValueFirst?: boolean;
                    usePercentageParens?: boolean;
                    useValueParens?: boolean;
                };
            };
        };
        userOptions?: ChartUserOptions;
        table?: {
            show?: boolean;
            useDialog?: boolean;
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

    export type VueUiWaffleExpose = {
        getData(): Promise<Array<{
            name: string
            color: string,
            value: number
            proportion: number
        }>>
        getImage(options?: { scale?: number }): GetImagePromise
        generatePdf(): void
        generateCsv(): void
        generateImage(): void
        generateSvg(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
        toggleTable(): void
        toggleTooltip(): void
        showSeries(name: string): void
        hideSeries(name: string): void
    }

    export const VueUiWaffle: DefineComponent<
        {
            config?: VueUiWaffleConfig;
            dataset: VueUiWaffleDatasetItem[];
        },
        VueUiWaffleExpose
    >;

    export type VueUiRadarConfig = {
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiRadarConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiRadarDataset>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean;
        events?: {
            datapointEnter?: VueUiRadarEvent; // v3
            datapointLeave?: VueUiRadarEvent; // v3
            datapointClick?: VueUiRadarEvent; // v3
        }
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
                    position?: 'bottom' | 'top';
                };
            };
        };
        table?: {
            show?: boolean;
            useDialog?: boolean;
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
        formatter: Formatter
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

    export type VueUiRadarExpose = {
        getData(): Promise<{
            name: string
            color: string
            proportion: number
        }>
        getImage(options?: { scale?: number }): GetImagePromise
        generatePdf(): void
        generateCsv(): void
        generateImage(): void
        toggleTable(): void
        generateSvg(): void
        toggleAnnotator(): void
        toggleTooltip(): void
        toggleFullscreen(): void
        showSeries(name: string): void
        hideSeries(name: string): void
    }

    export const VueUiRadar: DefineComponent<
        {
            config?: VueUiRadarConfig;
            dataset: VueUiRadarDataset;
        },
        VueUiRadarExpose
    >;

    export type VueUiQuadrantDatasetSerieItem = {
        name: string;
        x: number;
        y: number;
    };

    export type VueUiQuadrantDatasetItem = {
        [key: string]: any;
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
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiQuadrantDatasetItem[]>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiQuadrantConfig>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean;
        events?: { // v3
            datapointEnter?: VueUiQuadrantEvent; // v3
            datapointLeave?: VueUiQuadrantEvent; // v3
            datapointClick?: VueUiQuadrantEvent; // v3
        };
        theme?: Theme;
        useCssAnimation?: boolean;
        zoomAnimationFrames?: number;
        customPalette?: string[];
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
                    position?: 'bottom' | 'top'
                };
            };
        };
        table?: {
            show?: boolean;
            useDialog?: boolean;
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

    export type VueUiQuadrantExpose = {
        getData(): Promise<Array<{
            color: string
            name: string
            shape: string
            series: Array<{
                name: string
                x: number
                y: number
                quadrantSide: string
                sideName: string
            }>
        }>>
        getImage(options?: { scale?: number }): GetImagePromise
        generatePdf(): void
        generateCsv(): void
        generateImage(): void
        generateSvg(): void
        toggleTable(): void
        toggleLabels(): void
        toggleTooltip(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
        showSeries(name: string): void
        hideSeries(name: string): void
    }

    export const VueUiQuadrant: DefineComponent<
        {
            dataset: VueUiQuadrantDatasetItem[];
            config?: VueUiQuadrantConfig;
        },
        VueUiQuadrantExpose
    >;

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
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiGaugeDataset>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiGaugeConfig>;
        debug?: boolean; // v3
        loading?: boolean; // v3
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
                        minFontSize?: number; // v3
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

    export type VueUiGaugeExpose = {
        getImage(options?: { scale?: number }): GetImagePromise
        generateImage(): void
        generatePdf(): void
        generateSvg(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
    }

    export const VueUiGauge: DefineComponent<
        {
            config?: VueUiGaugeConfig;
            dataset: VueUiGaugeDataset;
        },
        VueUiGaugeExpose
    >;

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
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiChestnutDatasetRoot[]>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiChestnutConfig>;
        debug?: boolean;
        loading?: boolean;
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
                        paddingLeft?: number;
                        paddingRight?: number;
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
            useDialog?: boolean;
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

    export type VueUiChestnutExpose = {
        getData(): Promise<Array<{
            branches: Array<VueUiChesnutDatasetBranch & Record<string, any>>
            color: string
            id: string
            name: string
            rootIndex: number
            total: number
            type: string
        }>>
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generateImage(): void
        generateSvg(): void
        generatePdf(): void
        toggleTable(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
    }

    export const VueUiChestnut: DefineComponent<
        {
            config?: VueUiChestnutConfig;
            dataset: VueUiChestnutDatasetRoot[];
        },
        VueUiChestnutExpose
    >;

    export type VueUiOnionDatasetItem = {
        name: string;
        percentage: number;
        value?: number;
        color?: string;
        prefix?: string;
        suffix?: string;
    };

    export type VueUiOnionConfig = {
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiOnionConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiOnionDatasetItem[]>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean;
        events?: {
            datapointEnter?: VueUiOnionEvent; // v3
            datapointLeave?: VueUiOnionEvent; // v3
            datapointClick?: VueUiOnionEvent; // v3
        };
        theme?: Theme;
        customPalette?: string[];
        useCssAnimation?: boolean;
        useStartAnimation?: boolean;
        useBlurOnHover?: boolean;
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
                        showValueFirst?: boolean;
                        usePercentageParens?: boolean;
                        useValueParens?: boolean;
                        show?: boolean;
                        fontSize?: number;
                        minFontSize?: number; // v3
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
                    position?: 'bottom' | 'top';
                    showValue?: boolean;
                    showPercentage?: boolean;
                    showValueFirst?: boolean;
                    usePercentageParens?: boolean;
                    useValueParens?: boolean;
                };
                tooltip?: ChartTooltip & {
                    showValue?: boolean;
                    showPercentage?: boolean;
                    roundingValue?: number;
                    roundingPercentage?: number;
                    showValueFirst?: boolean;
                    usePercentageParens?: boolean;
                    useValueParens?: boolean;
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
            useDialog?: boolean;
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

    export type VueUiOnionExpose = {
        getData(): Promise<Array<{
            absoluteIndex: number
            color: string
            id: string
            percentage: number
            radius: number
            targetPercentage: number
            value: number
        } & Record<string, any>>>
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generateImage(): void
        generatePdf(): void
        generateSvg(): void
        toggleAnnotator(): void
        toggleTooltip(): void
        toggleTable(): void
        toggleFullscreen(): void
        showSeries(name: string): void
        hideSeries(name: string): void
    }

    export const VueUiOnion: DefineComponent<
        {
            config?: VueUiOnionConfig;
            dataset: VueUiOnionDatasetItem[];
        },
        VueUiOnionExpose
    >;

    export type VueUiVerticalBarDatasetChild = {
        name: string;
        value: number | null;
    };

    export type VueUiHorizontalBarDatasetChild = VueUiVerticalBarDatasetChild; // v3 renaming

    export type VueUiVerticalBarDatasetItem = {
        [key: string]: any;
        name: string;
        value: number | null;
        color?: string;
        children?: VueUiVerticalBarDatasetChild[] | VueUiHorizontalBarDatasetChild[];
    };

    export type VueUiHorizontalBarDatasetItem = VueUiVerticalBarDatasetItem // v3 renaming

    export type VueUiVerticalBarEvent = null | (({ datapoint, seriesIndex }: { datapoint: VueUiVerticalBarDatapoint | VueUiHorizontalBarDatapoint; seriesIndex: number }) => void);

    export type VueUiHorizontalBarEvent = VueUiVerticalBarEvent; // v3 renaming

    export type VueUiVerticalBarConfig = {
        skeletonDataset?:VueUiBuiltInSkeletonDataset<VueUiVerticalBarDatasetItem[] | VueUiHorizontalBarDatasetItem[]>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiVerticalBarConfig | VueUiHorizontalBarConfig>;
        debug?: boolean;
        loading?: boolean;
        autoSize?: boolean; // Legacy - unused
        responsive?: boolean;
        theme?: Theme;
        customPalette?: string[];
        useCssAnimation?: boolean;
        events?: {
            datapointEnter?: VueUiVerticalBarEvent | VueUiHorizontalBarEvent;
            datapointLeave?: VueUiVerticalBarEvent | VueUiHorizontalBarEvent;
            datapointClick?: VueUiVerticalBarEvent | VueUiHorizontalBarEvent;
        };
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                width?: number;
                height?: number;
                layout?: {
                    bars?: {
                        sort?: "desc" | "asc" | "none";
                        useStroke?: boolean;
                        strokeWidth?: number;
                        height?: number; // Legacy - unused
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
                            paddingBottom?: number;
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
                        fullWidth?: boolean;
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
                            VueUiVerticalBarDatapoint | VueUiHorizontalBarDatapoint,
                            VueUiVerticalBarSerie[] | VueUiHorizontalBarSerie[],
                            VueUiVerticalBarConfig | VueUiHorizontalBarConfig
                        >
                    ) => string);
                };
            };
        };
        userOptions?: ChartUserOptions;
        table?: {
            show?: boolean;
            useDialog?: boolean;
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

    export type VueUiHorizontalBarConfig = VueUiVerticalBarConfig; // v3 renaming;

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

    export type VueUiHorizontalBarDatapoint = VueUiVerticalBarDatapoint; // v3 renaming

    export type VueUiVerticalBarSerie = {
        children: VueUiVerticalBarDatapoint[] | VueUiHorizontalBarDatapoint[];
        color: string;
        hasChildren: boolean;
        is: string;
        isChild: boolean;
        name: string;
        opacity: number;
        shape?: Shape;
        value: number;
    };

    export type VueUiHorizontalBarSerie = VueUiVerticalBarSerie; // v3 renaming

    export type VueUiVerticalBarExpose = {
        getData(): Promise<Array<VueUiVerticalBarDatasetItem & Record<string, any>>> | Promise<Array<VueUiHorizontalBarDatasetItem & Record<string, any>>>
        getImage(options?: { scale?: number }): GetImagePromise
        recalculateHeight(): void,
        generateCsv(): void
        generateImage(): void
        generateSvg(): void
        generatePdf(): void
        toggleTable(): void
        toggleSort(): void
        toggleAnnotator(): void
        toggleTooltip(): void
        toggleFullscreen(): void
        showSeries(name: string): void
        hideSeries(name: string): void
        autoSize(): void // Legacy - unused, just logs a warning
    }

    export type VueUiHorizontalBarExpose = VueUiVerticalBarExpose; // v3 renaming

    export const VueUiVerticalBar: DefineComponent<
        {
            config?: VueUiVerticalBarConfig;
            dataset: VueUiVerticalBarDatasetItem[];
        },
        VueUiVerticalBarExpose
    >;

    /**
     * Renamed from the v2 VueUiVerticalBar
     */
    export const VueUiHorizontalBar: DefineComponent<
        {
            config?: VueUiHorizontalBarConfig;
            dataset: VueUiHorizontalBarDatasetItem[];
        },
        VueUiHorizontalBarExpose
    >;

    export type VueUiSparklineDatasetItem = {
        period: string | number;
        value: number | null;
        absoluteValue?: number | null;
        id?: string;
        plotValue?: number;
        toMax?: number;
        width?: number;
        x?: number;
        y?: number;
    };

    export type VueUiSparklineConfig = {
        loading?: boolean; // v3
        debug?: boolean; // v3
        theme?: Theme;
        type?: "line" | "bar";
        responsive?: boolean;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiSparklineConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<number[]>;
        gradientPath?: {
            show?: boolean;
            segments?: number;
            colors?: {
                high?: string;
                low?: string;
            };
        };
        temperatureColors?: {
            show?: boolean;
            colors?: string[];
        };
        events?: { // v3
            datapointEnter?: VueUiSparklineEvent; // v3
            datapointLeave?: VueUiSparklineEvent; // v3
            datapointClick?: VueUiSparklineEvent; // v3
        };
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
                pulse?: {
                    show?: boolean;
                    loop?: boolean;
                    color?: string;
                    radius?: number
                    durationMs?: number;
                    easeing?: 'ease-in-out' | 'ease' | 'ease-in' | 'ease-out' | 'linear' | 'cubic-bezizer';
                    cubicBezier?: [number, number, number, number];
                    trail?: {
                        show?: boolean;
                        length?: number;
                        opacity?: number;
                    };
                };
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
            tooltip?: {
                show?: boolean;
                fontSize?: number;
                color?: string;
                backgroundColor?: string;
                offsetY?: number;
                borderWidth?: number;
                borderColor?: string;
                borderRadius?: number;
                backgroundOpacity?: number;
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
                datetimeFormatter?: AxisDateFormatter; // v3
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
        useCursorPointer?: boolean;
        style?: {
            title?: ChartTitle & { backgroundColor?: string };
            th?: ChartTableCell & {
                selected?: {
                    backgroundColor?: string;
                    color?: string;
                };
                buttons?: {
                    filter?: {
                        inactive?: {
                            backgroundColor?: string;
                            color?: string;
                        };
                        active?: {
                            backgroundColor?: string;
                            color?: string;    
                        };
                    };
                    cancel?: {
                        inactive?: {
                            backgroundColor?: string;
                            color?: string;
                        };
                        active?: {
                            backgroundColor?: string;
                            color?: string;    
                        };
                    };
                };
            };
            rows?: {
                outline?: string;
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
                show?: boolean;
                backgroundColor?: string;
                color?: string;
                buttons?: {
                    backgroundColor?: string;
                    color?: string;
                };
                filename?: string | number;
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
                        smooth?: boolean;
                        useArea?: boolean;
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
                    timeLabels?: {
                        showOnlyAtModulo?: boolean;
                        modulo?: number;
                    };
                    zoom?: {
                        show?: boolean;
                    };
                    datetimeFormatter?: AxisDateFormatter;
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
            filename?: string;
            xAxisLabels?: string;
        };
        useChart?: boolean;
    };

    export type VueUiTablePageChangeEvent = {
        totalPages: number;
        itemsPerPage: number;
        currentPage: number;
        currentPageData: Array<Array<string | number>>
    }

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
        useCursorPointer?: boolean;
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
                inactiveOpacity?: number;
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
                boxShadow?: string;
            };
        };
    };

    export const VueUiRating: DefineComponent<{
        config?: VueUiRatingConfig;
        dataset: VueUiRatingDataset;
    }>;

    export type VueUiSmileyConfig = {
        readonly?: boolean;
        useCursorPointer?: boolean;
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
                paddingLeft?: number;
                paddingRight?: number;
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
                boxShadow?: string;
            };
        };
    };

    export const VueUiSmiley: DefineComponent<{
        config?: VueUiSmileyConfig;
        dataset: VueUiRatingDataset;
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
        | "circlePack"
        | "ridgeline";
        style?: {
            backgroundColor?: string;
            color?: string;
            animated?: boolean;
            maxHeight?: number;
            ridgeline?: {
                color?: string;
            };
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
            sparkline?: {
                color?: string;
                strokeWidth?: number;
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
        values: Array<number | string | null>;
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
        useCursorPointer?: boolean;
        head?: {
            useArrowSlot?: boolean;
            backgroundColor?: string;
            color?: string;
            iconColor?: string;
            iconSize?: number;
            icon?: VueUiIconName;
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
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiQuickChartConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiQuickChartDataset>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        events?: {
            datapointEnter?: ChartEvent<object | object[]>;
            datapointLeave?: ChartEvent<object | object[]>;
            datapointClick?: ChartEvent<object | object[]>;
        };
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
        donutCurvedMarkers?: boolean; // v3
        donutHideLabelUnderPercentage?: number;
        donutLabelMarkerStrokeWidth?: number;
        donutRadiusRatio?: number;
        donutShowTotal?: boolean;
        donutStrokeWidth?: number;
        donutStroke?: string; // v3
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
        legendPosition?: 'bottom' | 'top';
        showLegendSelectAllToggle?: boolean;
        legendSelectAllToggleBackgroundColor?: string;
        legendSelectAllToggleColor?: string;
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
        tooltipTeleportTo?: string;
        tooltipBackgroundOpacity?: number;
        tooltipCustomFormat?: any;
        tooltipBorderRadius?: number;
        tooltipBorderColor?: string;
        tooltipBorderWidth?: number;
        tooltipFontSize?: number;
        tooltipPosition?: TooltipPosition;
        tooltipOffsetY?: number;
        tooltipSmooth?: boolean;
        tooltipSmoothForce?: number;
        tooltipSmoothSnapThreshold?: number;
        tooltipBackdropFilter?: boolean;
        useCustomLegend?: boolean;
        useCursorPointer?: boolean;
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
        datetimeFormatter?: AxisDateFormatter;
        xyPeriodLabelsRotation?: number;
        xyPeriodLabelsAutoRotate?: { // v3
            enable?: boolean; // v3
            angle?: number; // v3
        };
        xyPeriodsShowOnlyAtModulo?: boolean;
        xyPeriodsModulo?: number;
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
        zoomCompact?: boolean;
        zoomFocusOnDrag?: boolean;
        zoomFocusRangeRatio?: number;
        zoomMaxWidth?: number | null;
        userOptionsPosition?: "right" | "left";
        userOptionsButtons?: {
            tooltip?: boolean;
            pdf?: boolean;
            img?: boolean;
            fullscreen?: boolean;
            annotator?: boolean;
            svg?: boolean;
            altCopy?: boolean;
        };
        userOptionsButtonTitles?: {
            open?: string;
            close?: string;
            tooltip?: string;
            pdf?: string;
            img?: string;
            fullscreen?: string;
            annotator?: string;
            svg?: string;
            altCopy?: string;
        };
        userOptionsPrint?: {
            scale?: number;
            overflowTolerance?: number;
            orientation?: 'auto' | 'l' | 'p';
        };
        userOptionsCallbacks?: {
            tooltip?: null | (() => void);
            pdf?: null | ((chart?: HTMLElement) => void);
            img?: null | ((base64?: string) => void);
            fullscreen?: null | (() => void);
            annotator?: null | (() => void);
            svg?: null | (({blob, url, text, dataUrl}: { blob: Blob; url: URL, text: string, dataUrl: string }) => void);
        };
        showUserOptionsOnChartHover?: boolean;
        keepUserOptionsStateOnChartLeave?: boolean;
    };

    export type VueUiQuickChartDatasetObjectItem = {
        [key: string]: string | number | Array<number | null>;
    };

    export type VueUiQuickChartDataset =
        | Array<number | null>
        | VueUiQuickChartDatasetObjectItem
        | VueUiQuickChartDatasetObjectItem[];

    export type VueUiQuickChartExpose = {
        getImage(options?: { scale?: number }): GetImagePromise
        generateImage(): void
        generatePdf(): void
        generateSvg(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
        toggleTooltip(): void
    }

    export const VueUiQuickChart: DefineComponent<
        {
            config?: VueUiQuickChartConfig;
            dataset: VueUiQuickChartDataset;
        },
        VueUiQuickChartExpose
    >;

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
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiSparkTrendConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<Array<number | null>>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean; // v3
        theme?: Theme;
        downsample?: {
            threshold?: number;
        };
        style?: {
            backgroundColor?: string;
            fontFamily?: string;
            width?: number; // v3
            height?: number; // v3
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
        dataset: Array<number | null>;
        config?: VueUiSparkTrendConfig;
    }>;

    export type VueUiStripPlotConfig = {
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiStripPlotConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiStripPlotDataset[]>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean;
        events?: { // v3
            datapointEnter?: VueUiStripPlotEvent; // v3
            datapointLeave?: VueUiStripPlotEvent; // v3
            datapointClick?: VueUiStripPlotEvent; // v3
        };
        responsiveProportionalSizing?: boolean;
        theme?: Theme;
        customPalette?: string[];
        useCssAnimation?: boolean;
        userOptions?: ChartUserOptions;
        table?: {
            show?: boolean;
            useDialog?: boolean;
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
                width?: number; // v3
                // stripWidth?: number; // v3 deprecated
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
                        rotation?: number; // v3
                        autoRotate?: { // v3
                            enable?: boolean; // v3
                            angle?: number; // v3
                        }
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
        parentIndex: number;
        parentName: string;
        plotIndex: number;
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

    export type VueUiStripPlotExpose = {
        getData(): Promise<Array<{
            color: string
            id: string
            name: string
            plots: Array<{
                color: string
                id: string
                name: string
                parentId: string
                value: number
                x: number
            }>
        }>>
        getImage(options?: { scale?: number }): GetImagePromise
        generatePdf(): void
        generateCsv(): void
        generateImage(): void
        generateSvg(): void
        toggleTable(): void
        toggleTooltip(): void
        toggleLabels(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
    }

    export const VueUiStripPlot: DefineComponent<
        {
            config?: VueUiStripPlotConfig;
            dataset: VueUiStripPlotDataset[];
        },
        VueUiStripPlotExpose
    >;

    export type VueUiDumbbellConfigLabel = {
        color?: string;
        fontSize?: number;
        offsetY?: number;
        rounding?: number;
        show?: boolean;
    };

    export type VueUiDumbbellDatapoint = {
        centerX: number;
        end: number | null;
        endVal: number;
        endX: number;
        id: string;
        name: string;
        start: number | null;
        startX: number;
        y: number;
        evaluationColor: string;
        evaluationGrad: string;
        isPositive: boolean;
        isNegative: boolean;
        isNeutral: boolean;
    }

    export type VueUiDumbbellConfig = {
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiDumbbellDataset[]>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiDumbbellConfig>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean;
        events?: { // v3
            datapointEnter?: VueUiDumbbellEvent; // v3
            datapointLeave?: VueUiDumbbellEvent; // v3
            datapointClick?: VueUiDumbbellEvent; // v3
        };
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
                    evaluationColors?: { // v3
                        enable?: boolean; // v3
                        positive?: string; // v3
                        negative?: string; // v3
                        neutral?: string; // v3
                    };
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
                    scaleMin?: number | null; // v3
                    scaleMax?: number | null; // v3
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
                comparisonLines?: { // v3
                    show?: boolean; // v3
                    strokeWidth?: number; // v3
                    strokeDasharray?: number; // v3
                    showRect?: boolean; // v3
                    rectColor?: string; // v3
                    rectOpacity?: number; // v3
                    showLabel?: boolean; // v3
                    labelColor?: string; // v3
                    labelFontSize?: number; // v3
                }; // v3
                highlighter?: { // v3
                    color?: string; // v3
                    opacity?: number; // v3
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
                        formatter?: Formatter; // v3
                    };
                    axis?: { // v3
                        yLabel?: string; // v3
                        yLabelOffsetX?: number; // v3
                        xLabel?: string; // v3
                        xLabelOffsetY?: number; // v3
                        fontSize?: number; // v3
                        color?: string; // v3
                    };
                    xAxisLabels?: VueUiDumbbellConfigLabel & {
                        bold?: boolean;
                        rotation?: number; // v3
                        autoRotate?: { // v3
                            enable?: boolean; // v3
                            angle?: number; // v3
                        }
                    };
                    startLabels?: VueUiDumbbellConfigLabel & {
                        useStartColor?: boolean;
                        useEvaluationColor?: boolean; // v3
                    };
                    endLabels?: VueUiDumbbellConfigLabel & {
                        useEndColor?: boolean;
                        useEvaluationColor?: boolean;
                    };
                };
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                    labelStart?: string;
                    labelEnd?: string;
                    labelPositive?: string; // v3
                    labelNegative?: string; // v3
                    labelNeutral?: string; // v3
                    position?: 'bottom' | 'top';
                };
                title?: ChartTitle;
            };
        };
        table?: {
            show?: boolean;
            useDialog?: boolean;
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
        start: number | null;
        end: number | null;
    };

    export type VueUiDumbbellExpose = {
        getData(): Promise<Array<{
            end: number | null
            id: string
            name: string
            start: number | null
        }>>
        getImage(options?: { scale?: number }): GetImagePromise
        generatePdf(): void
        generateCsv(): void
        generateImage(): void
        generateSvg(): void
        toggleTable(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
    }

    export const VueUiDumbbell: DefineComponent<
        {
            config?: VueUiDumbbellConfig;
            dataset: VueUiDumbbellDataset[];
        },
        VueUiDumbbellExpose
    >;

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
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiWordCloudConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiWordCloudDatasetItem[] | string>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean;
        events?: { // v3
            datapointEnter?: VueUiWordCloudEvent; // v3
            datapointLeave?: VueUiWordCloudEvent; // v3
            datapointClick?: VueUiWordCloudEvent; // v3
        }
        theme?: string;
        customPalette?: string[];
        userOptions?: ChartUserOptions;
        useCssAnimation?: boolean;
        animationDelayMs?: number;
        strictPixelPadding?: boolean;
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                height?: number;
                width?: number;
                zoom?: Omit<ChartZoom, "fontSize" | "maxWidth">;
                controls?: ChartZoomControls;
                words?: {
                    maxFontSize?: number;
                    minFontSize?: number;
                    bold?: boolean;
                    proximity?: number;
                    packingWeight?: number;
                    color?: string;
                    usePalette?: boolean;
                    hoverOpacity?: number;
                    selectedStroke?: string;
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
            useDialog?: boolean;
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

    export type VueUiWordCloudExpose = {
        getData(): Promise<Array<{
            angle: number
            color: string
            fontSize: number
            height: number
            id: string
            maxX: number
            maxY: number
            minX: number
            minY: number
            name: string
            value: number
            width: number
            x: number
            y: number
        }>>
        getImage(options?: { scale?: number }): GetImagePromise
        generatePdf(): void
        generateCsv(): void
        generateImage(): void
        generateSvg(): void
        toggleTable(): void
        toggleTooltip(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
        toggleZoom(): void
    }

    export const VueUiWordCloud: DefineComponent<
        {
            config?: VueUiWordCloudConfig;
            dataset: VueUiWordCloudDatasetItem[] | string;
        },
        VueUiWordCloudExpose
    >;

    export type VueUiXyCanvasDatasetItem = {
        name: string;
        series: Array<number | null>;
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
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiXyCanvasConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiXyCanvasDatasetItem[]>;
        debug?: boolean;
        loading?: boolean;
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
                zoom?: ChartZoom & {
                    preview?: {
                        enable?: boolean;
                        fill?: string;
                        stroke?: string;
                        strokeWidth?: number;
                        strokeDasharray?: number;
                    };
                    useDefaultFormat?: boolean;
                    timeFormat?: string;
                    customFormat?:
                    | null
                    | ((params: MinimalCustomFormatParams<VueUiXyCanvasDatasetItem[]>) => string);
                };
                selector?: {
                    show?: boolean;
                    color?: string;
                    dashed?: boolean;
                    showHorizontalSelector?: boolean;
                };
                tooltip?: ChartTooltip & {
                    customFormat?:
                        | null
                        | ((
                            params: VueUiTooltipParams<
                            VueUiXyDatapointItem[],
                            VueUiXySeries,
                            VueUiXyConfig
                            > & { absoluteIndex?: number }
                        ) => string)
                    showTimeLabel?: boolean
                    useDefaultTimeFormat?: boolean
                    timeFormat?: string
                }
                legend?: {
                    backgroundColor?: string;
                    color?: string;
                    show?: boolean;
                    fontSize?: number;
                    bold?: boolean;
                    position?: 'bottom' | 'top';
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
                            bold?: boolean;
                        };
                        verticalLines?: {
                            show?: boolean;
                            color?: string;
                            hideUnderXLength?: number;
                            position?: "start" | "middle";
                        };
                        // LEGACY: time labels were placed wrongly under Y
                        // Type def is kept here for backwards compatibility
                        timeLabels?: {
                            show?: boolean;
                            fontSizeRatio?: number;
                            values?: Array<string | number>;
                            datetimeFormatter?: AxisDateFormatter;
                            rotation?: number;
                            offsetY?: number;
                            color?: string;
                            showOnlyAtModulo?: boolean;
                            modulo?: number;
                            showMarker?: boolean;
                            bold?: boolean;
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
                        timeLabels?: {
                            show?: boolean;
                            fontSizeRatio?: number;
                            values?: Array<string | number>;
                            datetimeFormatter?: AxisDateFormatter;
                            rotation?: number;
                            offsetY?: number;
                            color?: string;
                            showOnlyAtModulo?: boolean;
                            modulo?: number;
                            showMarker?: boolean;
                            bold?: boolean;
                        };
                    };
                    zeroLine?: {
                        show?: boolean;
                        color?: string;
                        dashed?: boolean;
                    };
                };
                line?: {
                    cutNullValues?: boolean;
                    plots?: {
                        show?: boolean;
                        radiusRatio?: number;
                    };
                };
                bar?: {
                    gradient?: {
                        show?: boolean;
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
                    bold?: boolean;
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
            useDialog?: boolean;
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

    export type VueUiXyCanvasExpose = {
        getData(): Promise<Array<VueUiXyCanvasDatasetItem & Record<string, any>>>
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generateImage(): void
        generatePdf(): void
        generateSvg(): void
        toggleTable(): void
        toggleAnnotator(): void
        toggleLabels(): void
        toggleStack(): void
        toggleTooltip(): void
        toggleFullscreen(): void
        showSeries(name: string): void
        hideSeries(name: string): void
    }

    export const VueUiXyCanvas: DefineComponent<
        {
            dataset: VueUiXyCanvasDatasetItem[];
            config?: VueUiXyCanvasConfig;
        },
        VueUiXyCanvasExpose
    >;

    export type VueUiFlowDatasetItem = [string, string, number | null];

    export type VueUiFlowNode = {
        color: string;
        from?: Array<{ source: string; value: number; color: string }>;
        to?: Array<{ source: string; value: number; color: string }>;
        inflow?: number;
        outflow?: number;
        percentOfTotal: number;
        name?: string;
    }

    export type VueUiFlowFormattedDataset = {
        links: Array<{
            id: string;
            path: string;
            source: string;
            sourceColor: string;
            target: string;
            targetColor: string;
            value: number;
        }>;
        nodes: Array<{
            absoluteY: number;
            color: string;
            height: number;
            i: number;
            name: string;
            value: number;
            x: number;
            y: number;
        }>
    }

    export type VueUiFlowConfig = {
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiFlowDatasetItem[]>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiFlowConfig>;
        debug?: boolean;
        loading?: boolean;
        responsive?: boolean;
        events?: {
            datapointEnter?: VueUiFlowEvent;
            datapointLeave?: VueUiFlowEvent;
            datapointClick?: VueUiFlowEvent;
        };
        theme?: Theme;
        customPalette?: string[];
        userOptions?: ChartUserOptions;
        nodeCategories?: Record<string, string>;
        nodeCategoryColors?: Record<string, string>;
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                width?: number; // v3
                height?: number; // v3
                color?: string;
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                    position?: 'bottom' | 'top';
                };
                tooltip?: ChartTooltip & {
                    showPercentage?: boolean;
                    roundingPercentage?: number;
                    translations?: {
                        from?: string;
                        to?: string;
                        percentOfTotal?: string;
                    };
                    customFormat?:
                    | null
                    | ((
                        params: VueUiTooltipParams<
                            VueUiFlowNode,
                            VueUiFlowFormattedDataset,
                            VueUiFlowConfig
                        >
                    ) => string);
                };
                padding?: {
                    top?: number;
                    left?: number;
                    right?: number;
                    bottom?: number;
                };
                title?: ChartTitle;
                nodes?: {
                    gap?: number;
                    // minHeight?: number; // v3 deprecated
                    width?: number;
                    labels?: {
                        show?: boolean;
                        showValue?: boolean;
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
                    borderRadius?: number;
                };
                links?: {
                    // width?: number; // v3 deprecated
                    opacity?: number;
                    stroke?: string;
                    strokeWidth?: number;
                    smooth?: boolean;
                };
            };
        };
        table?: {
            show?: boolean;
            useDialog?: boolean;
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

    export type VueUiFlowExpose = {
        getData(): Promise<{
            nodes: Array<{
                name: string,
                absoluteY: number
                color: string
                height: number
                i: number
                value: number
                x: number,
                y: number
            }>
            links: Array<{
                id: string
                path: string
                source: string
                sourceColor: string
                target: string
                targetColor: string
                value: number
            }>
        }>
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generatePdf(): void
        generateImage(): void
        generateSvg(): void
        toggleTable(): void
        toggleLabels(): void
        toggleTooltip(): void
        unselectNode(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
    }

    export const VueUiFlow: DefineComponent<
        {
            dataset: VueUiFlowDatasetItem[];
            config?: VueUiFlowConfig;
        },
        VueUiFlowExpose
    >;

    export type VueUiParallelCoordinatePlotDatasetSerieItem = {
        name: string;
        values: Array<number | null>;
    };

    export type VueUiParallelCoordinatePlotDatasetItem = {
        name: string;
        shape?: Shape;
        color?: string;
        series: VueUiParallelCoordinatePlotDatasetSerieItem[];
    };

    export type VueUiParallelCoordinatePlotConfig = {
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiParallelCoordinatePlotConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiParallelCoordinatePlotDatasetItem[]>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean;
        events?: { // v3
            datapointEnter?: VueUiParallelCoordinatePlotEvent; // v3
            datapointLeave?: VueUiParallelCoordinatePlotEvent; // v3
            datapointClick?: VueUiParallelCoordinatePlotEvent; // v3
        },
        responsiveProportionalSizing?: boolean;
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
                        axisNamesRotation?: number; // v3
                        axisNamesAutoRotate?: { // v3
                            enable?: boolean; // v3
                            angle?: number; // v3
                        };
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
                    position?: 'bottom' | 'top';
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
            useDialog?: boolean;
            responsiveBreakpoint?: number;
            columnNames?: {
                series?: string;
                item?: string;
            };
            th: ChartTableCell;
            td: ChartTableCell;
        };
    };

    export type VueUiParallelCoordinatePlotEventDatapoint = {
        color: string;
        datapoints: Array<{
            axisIndex: number;
            comment: string;
            datapointIndex: number;
            name: string;
            seriesIndex: number;
            seriesName: string;
            value: number;
            x: number;
            y: number;
        }>;
        id: string;
        name: string;
        pathLength: number;
        shape: Shape;
        smoothPath: string;
        straightPath: string;
        values: number[];
    }

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

    export type VueUiParallelCoordinatePlotExpose = {
        getData(): Promise<Array<VueUiParallelCoordinatePlotDatasetItem & Record<string, any>>>
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generatePdf(): void
        generateImage(): void
        generateSvg(): void
        toggleTable(): void
        toggleLabels(): void
        toggleSort(): void
        toggleTooltip(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
        showSeries(name: string): void
        hideSeries(name: string): void
    }

    export const VueUiParallelCoordinatePlot: DefineComponent<
        {
            config?: VueUiParallelCoordinatePlotConfig;
            dataset: VueUiParallelCoordinatePlotDatasetItem[];
        },
        VueUiParallelCoordinatePlotExpose
    >;

    export type VueUiTimerConfig = {
        type?: "stopwatch";
        responsive?: boolean;
        responsiveProportionalSizing?: boolean;
        useCursorPointer?: boolean;
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
            style?: {
                verticalAlign?: string;
            };
            tr?: {
                height?: number;
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
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiGizmoDataset>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiGizmoConfig>;
        debug?: boolean; // v3
        loading?: boolean; // v3
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
        [key: string]: any; // To be recovered through the #svg slot
        name: string;
        series: Array<number | null>;
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
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiStackbarConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiStackbarDatasetItem[]>;
        theme?: Theme;
        responsive?: boolean;
        customPalette?: string[];
        useCssAnimation?: boolean;
        events?: { // v3
            datapointEnter?: VueUiStackbarEvent; // v3
            datapointLeave?: VueUiStackbarEvent; // v3
            datapointClick?: VueUiStackbarEvent; // v3
        };
        orientation?: "vertical" | "horizontal";
        table?: {
            show?: boolean;
            useDialog?: boolean;
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
                    position?: 'bottom' | 'top';
                };
                zoom?: ChartZoom & {
                    preview?: {
                        enable?: boolean;
                        fill?: string;
                        stroke?: string;
                        strokeWidth?: number;
                        strokeDasharray?: number;
                    };
                    useDefaultFormat?: boolean;
                    timeFormat?: string;
                    customFormat?:
                        | null
                        | ((params: MinimalCustomFormatParams<Array<VueUiStackbarDatapointItem & { absoluteIndex: number }>>) => string);
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
                            VueUiStackbarDatapointItem[],
                            VueUiStackbarSeriesItem[],
                            VueUiStackbarConfig
                        >
                    ) => string);
                    showTimeLabel?: boolean;
                    useDefaultTimeFormat?: boolean;
                    timeFormat?: string;
                    showTotal?: boolean;
                    totalTranslation?: string;
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
                        offsetX?: number;
                        fontSize?: number;
                        bold?: boolean;
                        color?: string;
                    };
                    dataLabels?: {
                        show?: boolean;
                        hideEmptyValues?: boolean;
                        hideUnderValue?: number | null;
                        hideEmptyPercentages?: boolean;
                        hideUnderPercentage?: number | null;
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
                    frame?: ChartFrame;
                    scale?: {
                        ticks?: number;
                        scaleMin?: number | null;
                        scaleMax?: number | null;
                    };
                    x?: {
                        showAxis?: boolean;
                        showHorizontalLines?: boolean;
                        linesColor?: string;
                        linesThickness?: number;
                        linesStrokeDasharray?: number;
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
                            values?: Array<number | string>;
                            datetimeFormatter?: AxisDateFormatter;
                            offsetY?: number;
                            rotation?: number;
                            autoRotate?: { // v3
                                enable?: boolean; // v3
                                angle?: number; // v3
                            };
                            fontSize?: number;
                            color?: string;
                            bold?: boolean;
                            showOnlyFirstAndLast?: boolean;
                            showOnlyAtModulo?: boolean;
                            modulo?: number;
                        };
                    };
                    y?: {
                        showAxis?: boolean;
                        showVerticalLines?: boolean;
                        linesColor?: string;
                        linesThickness?: number;
                        linesStrokeDasharray?: number;
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
                            formatter?: Formatter;
                            show?: boolean;
                            color?: string;
                            fontSize?: number;
                            bold?: boolean;
                            rounding?: number;
                        };
                    };
                };
            };
        };
    };

    export type VueUiStackbarExpose = {
        getData(): Promise<Array<{
            absoluteIndex: number
            color: string
            height: number[],
            horizontal_width: number[],
            horizontal_x: number[],
            horizontal_y: number[],
            id: string
            name: string
            proportions: number[],
            series: number[],
            signedSeries: number[],
            x: number[],
            y: number[],
        }>>
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generateImage(): void
        generatePdf(): void
        generateSvg(): void
        toggleAnnotator(): void
        toggleTable(): void
        toggleLabels(): void
        toggleTooltip(): void
        toggleFullscreen(): void
        showSeries(name: string): void
        hideSeries(name: string): void
    }

    export const VueUiStackbar: DefineComponent<
        {
            config?: VueUiStackbarConfig;
            dataset: VueUiStackbarDatasetItem[];
            selectedXIndex?: number | null;
        },
        VueUiStackbarExpose
    >;

    export type VueUiStacklineDatapointItem = VueUiStackbarDatapointItem & {
        shape: Shape;
        standalone: boolean;
    };

    export type VueUiStacklineSeriesItem = VueUiStackbarSeriesItem & {
        shape: Shape;
        standalone: boolean;
    };

    export type VueUiStacklineDatasetItem = VueUiStackbarDatasetItem & {
        shape?: Shape;
        standalone?: boolean; // If true, series will not be part of stacked series
    }

    export type VueUiStacklineConfig = {
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiStacklineConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiStacklineDatasetItem[]>;
        loading?: boolean;
        debug?: boolean;
        theme?: Theme;
        responsive?: boolean;
        events?: {
            datapointEnter?: VueUiStacklineEvent;
            datapointLeave?: VueUiStacklineEvent;
            datapointClick?: VueUiStacklineEvent;
        };
        customPalette?: string[];
        useCssAnimation?: boolean;
        table?: {
            show?: boolean;
            useDialog?: boolean;
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
                    position?: 'top' | 'bottom';
                };
                zoom?: ChartZoom & {
                    preview?: {
                        enable?: boolean;
                        fill?: string;
                        stroke?: string;
                        strokeWidth?: number;
                        strokeDasharray?: number;
                    };
                    useDefaultFormat?: boolean;
                    timeFormat?: string;
                    customFormat?:
                        | null
                        | ((params: MinimalCustomFormatParams<Array<VueUiStacklineDatapointItem & { absoluteIndex: number }>>) => string);
                };
                highlighter?: {
                    color?: string;
                    opacity?: number;
                    useLine?: boolean;
                    lineDasharray?: number;
                    lineWidth?: number;
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
                            VueUiStacklineDatapointItem[],
                            VueUiStacklineSeriesItem[],
                            VueUiStacklineConfig
                        >
                    ) => string);
                    showTimeLabel?: boolean;
                    useDefaultTimeFormat?: boolean;
                    timeFormat?: string;
                    showTotal?: boolean;
                    totalTranslation?: string;
                };
                lines?: {
                    useArea?: boolean; // Only applied on stacked series (!standalone)
                    smooth?: boolean;
                    areaOpacity?: number;
                    distributed?: boolean;
                    showDistributedPercentage?: boolean;
                    strokeWidth?: number;
                    gradient?: {
                        show?: boolean;
                        intensity?: number;
                    };
                    dot?: {
                        hideAboveMaxSerieLength?: number;
                        useSerieColor?: boolean;
                        fill?: string;
                        strokeWidth?: number;
                        radius?: number;
                    };
                    totalValues?: {
                        show?: boolean;
                        offsetY?: number;
                        fontSize?: number;
                        bold?: boolean;
                        color?: string;
                    };
                    dataLabels?: {
                        hideAboveMaxSerieLength?: number;
                        offsetY?: number;
                        show?: boolean;
                        hideEmptyValues?: boolean;
                        hideUnderValue?: number | null;
                        hideEmptyPercentages?: boolean;
                        hideUnderPercentage?: number | null;
                        color?: string;
                        fontSize?: number;
                        bold?: boolean;
                        rounding?: number;
                        prefix?: string;
                        formatter?: Formatter;
                    }
                };
                grid?: {
                    frame?: ChartFrame;
                    scale?: {
                        ticks?: number;
                        scaleMin?: number | null;
                        scaleMax?: number | null;
                    };
                    x?: {
                        showAxis?: boolean;
                        showHorizontalLines?: boolean;
                        linesColor?: string;
                        linesThickness?: number;
                        linesStrokeDasharray?: number;
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
                            values?: Array<number | string>;
                            datetimeFormatter?: AxisDateFormatter;
                            offsetY?: number;
                            rotation?: number;
                            autoRotate?: {
                                enable?: boolean;
                                angle?: number;
                            };
                            fontSize?: number;
                            color?: string;
                            bold?: boolean;
                            showOnlyFirstAndLast?: boolean;
                            showOnlyAtModulo?: boolean;
                            modulo?: number;
                        };
                    };
                    y?: {
                        showAxis?: boolean;
                        showVerticalLines?: boolean;
                        linesColor?: string;
                        linesThickness?: number;
                        linesStrokeDasharray?: number;
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
                            formatter?: Formatter;
                            show?: boolean;
                            color?: string;
                            fontSize?: number;
                            bold?: boolean;
                            rounding?: number;
                        };
                    };
                };
            }
        }
    }

    export type VueUiStacklineExpose = {
        getData(): Promise<Array<{
            absoluteIndex: number
            color: string
            height: number[],
            horizontal_width: number[],
            horizontal_x: number[],
            horizontal_y: number[],
            id: string
            name: string
            proportions: number[],
            series: number[],
            signedSeries: number[],
            x: number[],
            y: number[],
            standalone?: boolean
        }>>
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generateImage(): void
        generateSvg(): void
        generatePdf(): void
        toggleAnnotator(): void
        toggleTable(): void
        toggleLabels(): void
        toggleTooltip(): void
        toggleFullscreen(): void
    }

    export const VueUiStackline: DefineComponent<
        {
            config?: VueUiStacklineConfig;
            dataset: VueUiStacklineDatasetItem[];
            selectedXIndex?: number | null;
        },
        VueUiStacklineExpose
    >;

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
        skeletonDataset?: VueUiBuiltInSkeletonConfig<VueUiBulletDataset>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiBulletConfig>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean; // v3
        theme?: Theme;
        userOptions?: ChartUserOptions;
        style?: {
            fontFamily?: string;
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
                    show?: boolean;
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
                    position?: 'bottom' | 'top';
                };
            };
        }
    };

    export type VueUiBulletExpose = {
        getData(): Promise<{
            chunks: Array<Record<string, any>>
            scale: Record<string, any>
            target: {
                x: number
            }
            ticks: Array<{
                value: number
                x: number
                y: number
            }>
            value: {
                width: number
            }
        }>
        getImage(options?: { scale?: number }): GetImagePromise
        generateImage(): void
        generatePdf(): void
        generateSvg(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
    }

    export const VueUiBullet: DefineComponent<
        {
            config?: VueUiBulletConfig;
            dataset: VueUiBulletDataset;
        },
        VueUiBulletExpose
    >;

    export type VueUiFunnelDatasetItem = {
        name: string;
        value: number;
    };

    export type VueUiFunnelConfig = {
        theme?: Theme;
        responsive?: boolean;
        responsiveProportionalSizing?: boolean;
        useCssAnimation?: boolean;
        table?: {
            show?: boolean;
            useDialog?: boolean;
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

    export type VueUiFunnelExpose = {
        getData(): Promise<Array<{
            color: string
            name: string
            value: string
        }>>
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generateImage(): void
        generateSvg(): void
        generatePdf(): void
        toggleAnnotator(): void
        toggleTable(): void
        toggleFullscreen(): void
    }

    export const VueUiFunnel: DefineComponent<
        {
            dataset: VueUiFunnelDatasetItem[];
            config?: VueUiFunnelConfig;
        },
        VueUiFunnelExpose
    >;

    export type VueUiHistoryPlotDatasetItem = {
        name: string;
        values: Array<{ x: number; y: number; label?: string }>;
        color?: string;
    };

    export type VueUiHistoryPlotConfig = {
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiHistoryPlotDatasetItem[]>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiHistoryPlotConfig>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean;
        events?: { // v3
            datapointEnter?: VueUiHistoryPlotEvent; // v3
            datapointLeave?: VueUiHistoryPlotEvent; // v3
            datapointClick?: VueUiHistoryPlotEvent; // v3
        }
        responsiveProportionalSizing?: boolean;
        theme?: Theme;
        customPalette?: string[];
        useCssAnimation?: boolean;
        userOptions?: ChartUserOptions;
        table?: {
            show?: boolean;
            useDialog?: boolean;
            responsiveBreakpoint?: number;
            th?: ChartTableCell;
            td?: ChartTableCell & {
                roundingValue?: number;
            };
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
                            autoRotate?: { // v3
                                enable?: boolean; // v3
                                angle?: number; // v3
                            };
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
                    position?: 'bottom' | 'top';
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

    export type VueUiHistoryPlotDatapointEvent = VueUiHistoryPlotDatapoint & {
        plotIndex: number;
        seriesIndex: number;
    }

    export type VueUiHistoryPlotDatpointSeries = VueUiHistoryPlotDatasetItem & {
        seriesIndex: number;
    };

    export type VueUiHistoryPlotExpose = {
        getData(): Promise<Array<{
            color: string
            name: string
            path: string
            plots: Array<{
                color: string
                id: string
                label: string
                seriesName: string
                valueX: number
                valueY: number
                x: number
                y: number
            }>
            seriesIndex: number
            values: Array<{
                x: number
                y: number
                label: string
            }>
        }>>
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generateImage(): void
        generatePdf(): void
        generateSvg(): void
        toggleAnnotator(): void
        toggleTooltip(): void
        toggleTable(): void
        toggleFullscreen(): void
        showSeries(name: string): void
        hideSeries(name: string): void
    }

    export const VueUiHistoryPlot: DefineComponent<
        {
            config?: VueUiHistoryPlotConfig;
            dataset: VueUiHistoryPlotDatasetItem[];
        },
        VueUiHistoryPlotExpose
    >;

    export type VueUiCirclePackDatasetItem = {
        name: string;
        value: number;
        color?: string;
    };

    export type VueUiCirclePackDatapoint = {
        name: string;
        value: number;
        r: number;
        id: string;
        color: string;
        x: number;
        y: number;
    }

    export type VueUiCirclePackConfig = {
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiCirclePackDatasetItem[]>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiCirclePackConfig>;
        debug?: boolean; // v3
        responsive?: boolean;
        loading?: boolean; // v3
        events?: { // v3
            datapointEnter?: VueUiCirclePackEvent; // v3
            datapointLeave?: VueUiCirclePackEvent; // v3
            datapointClick?: VueUiCirclePackEvent; // v3
        };
        theme?: Theme;
        customPalette?: string[];
        userOptions?: ChartUserOptions;
        table?: {
            show?: boolean;
            useDialog?: boolean;
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
                width?: number;
                height?: number;
                backgroundColor?: string;
                color?: string;
                title?: ChartTitle;
                circles?: {
                    stroke?: string;
                    strokeWidth?: number;
                    selectedShadowColor?: string;
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
                };
                tooltip?: ChartTooltip & {
                    customFormat?:
                    | null
                    | ((
                        params: VueUiTooltipParams<
                            VueUiCirclePackDatapoint,
                            VueUiCirclePackDatapoint[],
                            VueUiCirclePackConfig
                        >
                    ) => string);
                }
            };
        };
    };

    export type VueUiCirclePackExpose = {
        getData(): Promise<Array<VueUiCirclePackDatapoint>>
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generateImage(): void
        generateSvg(): void
        generatePdf(): void
        toggleTable(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
    }

    export const VueUiCirclePack: DefineComponent<
        {
            config?: VueUiCirclePackConfig;
            dataset: VueUiCirclePackDatasetItem[];
        },
        VueUiCirclePackExpose
    >;

    export type VueUiWorldDatapoint = {
        category: string | null;
        code: string;
        color: string;
        geo: {
            geometry: {
                coordinates: Array<Array<Array<Array<number>>>>;
                type: string;
            };
            properties: {
                admin: string;
                iso_a3: string;
                name: string;
            };
            type: string;
        },
        geometry: {
            coordinates: Array<Array<Array<number>>>;
            type: string;
        };
        isActive: boolean;
        name: string;
        path: string;
        uid: string;
        value: number | null;
    }

    export type VueUiWorldConfig = {
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiWorldConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiWorldDataset>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        events?: {
            datapointEnter?: VueUiWorldEvent; // v3
            datapointLeave?: VueUiWorldEvent; // v3
            datapointClick?: VueUiWorldEvent; // v3
        };
        userOptions?: ChartUserOptions;
        customPalette?: string[];
        projection?: 'aitoff' | 'azimuthalEquidistant' | 'bonne' | 'equirectangular' | 'gallPeters' | 'globe' | 'hammer' | 'mercator' | 'mollweide' | 'robinson' | 'sinusoidal' | 'vanDerGrinten' | 'winkelTripel',
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string?;
                padding?: ChartPadding;
                dataLabels?: {
                    prefix?: string;
                    suffix?: string;
                    rounding?: number;
                    formatter: Formatter;
                };
                dimensions?: {
                    height?: number | null;
                    width?: number | null;
                };
                globe?: {
                    center?: {
                        x?: number;
                        y?: number;
                    };
                    waterColor?: string;
                };
                territory?: {
                    stroke?: string;
                    emptyColor?: string;
                    strokeWidth?: number;
                    strokeWidthSelected?: number;
                    colors?: {
                        min?: string;
                        max?: string | null;
                    },
                    showTaiwanAsPartOfChina?: boolean;
                };
                tooltip?: ChartTooltip & {
                    showMinimap?: boolean;
                    customFormat?:
                    | null
                    | ((
                        params: VueUiTooltipParams<any>
                    ) => string);
                };
                title?: ChartTitle;
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                    position?: 'bottom' | 'top';
                };
            }
        };
        table?: {
            show?: boolean;
            useDialog?: boolean;
            responsiveBreakpoint?: number;
            th?: ChartTableCell;
            td?: ChartTableCell & {
                roundingValue?: number;
            };
            columnNames?: {
                series?: string;
                datapoint?: string;
                category?: string;
            };
        };
    }

    export type VueUiWorldDataset = {
        [key: string]: {
            value: number;
            category?: string;
            color?: string
        }
    }

    export type VueUiWorldExpose = {
        getData(): Promise<Array<Record<string, any>>>
        getImage(options?: { scale?: number }): GetImagePromise
        generatePdf(): void
        generateCsv(): void
        generateSvg(): void
        generateImage(): void
        toggleTable(): void
        toggleTooltip(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
    }

    export const VueUiWorld: DefineComponent<
        {
            config?: VueUiWorldConfig;
            dataset?: VueUiWorldDataset
        },
        VueUiWorldExpose
    >

    export type VueUiRidgelineDatapoint = {
        name: string;
        values: Array<number | null>;
        color?: string;
    }

    export type VueUiRidgelineDatasetItem = {
        name: string;
        datapoints: VueUiRidgelineDatapoint[]
    }

    export type VueUiRidgelineDatapointEventUnit = {
        color: string;
        name: string;
        values: Array<number | null>;
        id: string;
    };

    export type VueUiRidgelineDatapointEventEntry = {
        dp: VueUiRidgelineDatapointEventUnit;
        selected: number;
    };

    export type VueUiRidgelineDatapointEvent = VueUiRidgelineDatapointEventEntry[][];

    export type VueUiRidgelineConfig = {
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiRidgelineConfig>;
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiRidgelineDatasetItem[]>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean;
        events?: { // v3
            datapointEnter?: VueUiRidgelineEvent; // v3
            datapointLeave?: VueUiRidgelineEvent; // v3
            datapointClick?: VueUiRidgelineEvent; // v3
        };
        theme?: Theme;
        customPalette?: string[];
        userOptions?: ChartUserOptions;
        useCssAnimation?: boolean;
        table?: {
            show?: boolean;
            useDialog?: boolean;
            responsiveBreakpoint?: number;
            th?: ChartTableCell;
            td?: ChartTableCell & {
                roundingValue?: number;
            };
            columnNames?: {
                series?: string;
            };
        };
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                padding?: ChartPadding;
                title?: ChartTitle;
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                };
                dialog?: {
                    show?: boolean;
                    backgroundColor?: string;
                    color?: string;
                    header?: {
                        backgroundColor?: string;
                        color?: string;
                    };
                    xyChart?: VueUiXyConfig;
                };
                areas?: {
                    height?: number;
                    rowHeight?: number;
                    strokeWidth?: number;
                    useCommonColor?: boolean;
                    useGradient?: boolean;
                    stroke?: {
                        useSerieColor?: boolean;
                        color?: string;
                    };
                    smooth?: boolean;
                    opacity?: number;
                    maxPoint?: {
                        show?: boolean;
                        adaptStrokeToBackground?: boolean;
                        stroke?: string;
                        strokeWidth?: number;
                        strokeDasharray?: number;
                    };
                };
                selector?: {
                    show?: boolean;
                    stroke?: string;
                    strokeWidth?: number;
                    strokeDasharray?: number;
                    labels?: {
                        fontSize?: number;
                        formatter?: Formatter;
                        rounding?: number;
                        color?: string;
                    };
                    dot?: {
                        radius?: number;
                        useDatapointColor?: boolean;
                        fill?: string;
                        stroke?: string;
                        strokeWidth?: number;
                    };
                };
                zeroLine?: {
                    show?: boolean;
                    strokeWidth?: number;
                    strokeDasharray?: number;
                    useSerieColor?: boolean;
                    stroke?: string;
                };
                xAxis?: {
                    labels?: {
                        prefix?: string;
                        suffix?: string;
                        rotation?: number;
                        autoRotate?: { // v3
                            enable?: boolean; // v3
                            angle?: number; // v3
                        };
                        values?: Array<number | string>;
                        datetimeFormatter?: AxisDateFormatter;
                        color?: string;
                        fontSize?: number;
                        bold?: boolean;
                        showOnlyAtModulo?: boolean;
                        modulo?: number;
                        showOnlyFirstAndLast?: boolean;
                        offsetY?: number;
                    };
                };
                yAxis?: {
                    labels?: {
                        fontSize?: number;
                        bold?: boolean;
                        color?: string;
                        offsetX?: number;
                    };
                };
            };
        };
    };

    export type VueUiRidgelineExpose = {
        getData(): Promise<Array<{
            datapoints: Array<{
                color: string
                id: string
                name: string
                pathLength: number
                plots: Array<{
                    isMaxPoint: boolean
                    value: number
                    x: number
                    y: number
                    zero: number
                }>
                smoothPath: string
                smoothPathRidge: string
                straightPath: string
                straightPathRidge: string
                uid: string
                values: Array<number | null>
                zeroPath: string
            }>
            label: {
                x: number
                y: number
            }
            labelLen: number
            name: string
            uid: string
        }>>
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generateImage(): void
        generateSvg(): void
        generatePdf(): void
        toggleAnnotator(): void
        toggleTable(): void
        toggleFullscreen(): void
        showSeries(name: string): void
        hideSeries(name: string): void
    }

    export const VueUiRidgeline: DefineComponent<
        {
            config?: VueUiRidgelineConfig;
            dataset: VueUiRidgelineDatasetItem[]
        },
        VueUiRidgelineExpose
    >

    export type VueUiChordDataset = {
        matrix: Array<Array<number | null>>;
        labels?: string[];
        colors?: string[];
    }

    export type VueUiChordDatapointArc = {
        color: string;
        endAngle: number;
        id: string;
        index: number;
        name: string;
        pattern: string;
        proportion: number;
        startAngle: number;
    }

    export type VueUiChordNode = {
        endAngle: number;
        groupColor: string;
        groupId: string;
        groupName: string;
        index: number;
        midAngle: number;
        midBaseX: number;
        midBaseY: number;
        pattern: string;
        startAngle: number;
        subIndex: number;
        value: number;
    }

    export type VueUiChordDatapointRibbon = {
        color: string;
        id: string;
        source: VueUiChordNode;
        target: VueUiChordNode;
    }

    export type VueUiChordConfig = {
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiChordDataset>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiChordConfig>;
        debug?: boolean; // v3
        loading?: boolean; // v3
        responsive?: boolean;
        events?: {
            datapointEnter?: VueUiChordEvent; // v3
            datapointLeave?: VueUiChordEvent; // v3
            datapointClick?: VueUiChordEvent; // v3
        };
        theme?: Theme;
        customPalette?: string[];
        enableRotation?: boolean;
        initialRotation?: nulber;
        useCssAnimation?: boolean;
        userOptions?: ChartUserOptions;
        table?: {
            show?: boolean;
            useDialog?: boolean;
            responsiveBreakpoint?: number;
            th?: ChartTableCell;
            td?: ChartTableCell;
        };
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                legend?: ChartBaseLegend & {
                    backgroundColor?: string;
                    position?: 'bottom' | 'top';
                };
                title?: ChartTitle;
                arcs?: {
                    innerRadiusRatio?: number;
                    outerRadiusRatio?: number;
                    padAngle?: number;
                    stroke?: string;
                    strokeWidth?: number;
                    labels?: {
                        show?: boolean;
                        fontSize?: number;
                        bold?: boolean;
                        curved?: boolean;
                        adaptColorToBackground?: boolean;
                        color?: string;
                        offset?: number;
                        showPercentage?: boolean;
                        roundingPercentage?: number;
                    };
                };
                ribbons?: {
                    stroke?: string;
                    strokeWidth?: number;
                    underlayerOpacity?: number;
                    labels?: {
                        show?: boolean;
                        formatter?: Formatter;
                        prefix?: string;
                        suffix?: string;
                        rounding?: number;
                        fontSize?: number;
                        bold?: boolean;
                        useSerieColor?: boolean;
                        color?: string;
                        offset?: number;
                        minSeparationDeg?: number;
                        connector?: {
                            stroke?: string;
                            strokeWidth?: number;
                        };
                        marker?: {
                            show?: boolean;
                            radius?: number;
                            stroke?: string;
                            strokeWidth?: number;
                        };
                    };
                };
            };
        };
    };

    export type VueUiChordExpose = {
        getData(): Promise<{
            chords: Array<{
                id: string
                source: Record<string, any>
                target: Record<string, any>
            }>
            groups: Array<{
                color: string
                index: number
                name: string
                proportion: number
            } & Record<string, any>>
        }>
        getImage(options?: { scale?: number }): GetImagePromise
        generatePdf(): void
        generateSvg(): void
        generateCsv(): void
        generateImage(): void
        toggleTable(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
    }

    export const VueUiChord: DefineComponent<
        {
            config?: VueUiChordConfig;
            dataset: VueUiChordDataset
        },
        VueUiChordExpose
    >

    export type VueUiDagNode = {
        [key: string]: any;
        id: string;
        label: string;
        backgroundColor?: string;
        color?: string;
    }

    export type VueUiDagEdge = {
        from: string;
        to: string;
        color?: string;
        animated?: boolean;
        dasharray?: `${VueUiConfigNumberString} ${VueUiConfigNumberString}`;
        animationDurationMs?: number;
        animationDirection?: 1 | -1;
    }

    export type VueUiDagDataset = {
        nodes: VueUiDagNode[];
        edges: VueUiDagEdge[];
    }

    export type VueUiDagConfig = {
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiDagDataset>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiDagConfig>;
        loading?: boolean;
        debug?: boolean;
        theme?: Theme;
        responsive?: boolean;
        userOptions?: ChartUserOptions;
        style?: {
            fontFamily?: string;
            chart?: {
                width?: number | null;
                height?: number | null;
                backgroundColor?: string;
                color?: string;
                backgroundPattern?: {
                    show?: boolean;
                    spacingRatio?: number;
                    dotRadiusRatio?: number;
                    dotColor?: string;
                    opacity?: number;
                };
                layout?: {
                    rankDirection?: 'TB' | 'RL' | 'BT' | 'LR';
                    rankSeparation?: number;
                    nodeSeparation?: number;
                    edgeSeparation?: number;
                    nodeWidth?: number;
                    nodeHeight?: number;
                    curvedEdges?: boolean;
                    padding?: number;
                    arrowShape?: 'undirected' | 'normal' | 'vee';
                    align?: 'UL' | 'UR' | 'DL' | 'DR' | undefined;
                    arrowSize?: number;
                };
                nodes?: {
                    stroke?: string;
                    strokeWidth?: number;
                    borderRadius?: number;
                    backgroundColor?: string;
                    labels?: {
                        color?: string;
                        fontSize?: number;
                        bold?: boolean;
                    };
                    tooltip?: {
                        showOnClick?: boolean;
                        backgroundColor?: string;
                        color?: string;
                        maxWidth?: string;
                    };
                    selected?: {
                        stroke?: string | null;
                        strokeWidth?: number | null;
                        backgroundColor?: string | null;
                        labelColor?: string | null;
                        downstreamEdges?: {
                            stroke?: string | null;
                            animated?: boolean | null;
                        };
                        upstreamEdges?: {
                            stroke?: string | null;
                            animated?: string | null;
                        }
                    }
                };
                edges?: {
                    stroke?: string;
                    strokeWidth?: number;
                    animations?: {
                        dasharray?: `${VueUiConfigNumberString} ${VueUiConfigNumberString}`;
                        animationDurationMs?: number;
                    }
                };
                midpoints?: {
                    show?: boolean;
                    radius?: number;
                    stroke?: string;
                    fill?: string;
                    strokeWidth?: number;
                    tooltip?: {
                        maxWidth?: string;
                        backgroundColor?: string;
                        color?: string;
                    };
                    selectedEdge?: {
                        stroke?: string | null;
                        animated?: boolean | null;
                    };
                };
                controls?: ChartZoomControls;
                zoom?: {
                    active?: boolean;
                };
                title?: ChartTitle;
            }
        }
    }

    export type VueUiDagExpose = {
        getData(): Promise<{
            arrowShape: 'undirected' | 'normal' | 'vee',
            arrowSize: number,
            edges: Array<{
                [key: string]: any;
                from: string;
                to: string;
                id: string;
            }>,
            nodes: Array<{
                [key: string]: any;
                id: string;
            }>,
            viewBox: string
        }>
        getImage(options?: { scale?: number }): GetImagePromise
        generatePdf(): void
        generateSvg(): void
        generateImage(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
        zoomIn(): void
        zoomOut(): void
        resetZoom(): void
        switchDirection(): void
    }

    export const VueUiDag: DefineComponent<
        {
            config?: VueUiDagConfig;
            dataset: VueUiDagDataset
        },
        VueUiDagExpose
    >


    export type GeoJsonPosition = [longitude: number, latitude: number] | [number, number, number];

    export type GeoJsonPoint = {
        type: "Point";
        coordinates: GeoJsonPosition;
    };

    export type GeoJsonMultiPoint = {
        type: "MultiPoint";
        coordinates: GeoJsonPosition[];
    };

    export type GeoJsonLineString = {
        type: "LineString";
        coordinates: GeoJsonPosition[];
    };

    export type GeoJsonMultiLineString = {
        type: "MultiLineString";
        coordinates: GeoJsonPosition[][];
    };

    export type GeoJsonPolygon = {
        type: "Polygon";
        coordinates: GeoJsonPosition[][];
    };

    export type GeoJsonMultiPolygon = {
        type: "MultiPolygon";
        coordinates: GeoJsonPosition[][][];
    };

    export type GeoJsonGeometryCollection = {
        type: "GeometryCollection";
        geometries: GeoJsonGeometry[];
    };

    export type GeoJsonGeometry =
        | GeoJsonPoint
        | GeoJsonMultiPoint
        | GeoJsonLineString
        | GeoJsonMultiLineString
        | GeoJsonPolygon
        | GeoJsonMultiPolygon
        | GeoJsonGeometryCollection;

    export type GeoJsonFeature<Properties extends Record<string, unknown> = Record<string, unknown>> = {
        type: "Feature";
        geometry: GeoJsonGeometry | null;
        properties?: Properties | null;
        id?: string | number;
    };

    export type VueUiGeoTerritory<Properties extends Record<string, unknown> = Record<string, unknown>> = {
        uid: string;
        path: string;
        name: string;
        properties: Properties;
        geometry: GeoJsonGeometry;
        feature: GeoJsonFeature;
    }

    export type GeoJsonFeatureCollection<
        Properties extends Record<string, unknown> = Record<string, unknown>
    > = {
        type: "FeatureCollection";
        features: Array<GeoJsonFeature<Properties>>;
    };

    export type VueUiGeoMapGeoJson =
        | GeoJsonFeatureCollection
        | GeoJsonFeature
        | GeoJsonGeometryCollection
        | GeoJsonGeometry
        | Array<GeoJsonFeature>;

    export type VueUiGeoDatasetItem = {
        [key: string]: any;
        name: string;
        coordinates: [longitude: number, latitude: number];
        description?: string;
        color?: string;
        radius?: number;
    }

    export type VueUiGeoDatapoint = {
        color: string;
        coordinates: [x: number, y: number];
        description: string;
        fill: string;
        hoverRadiusRatio: number;
        index: number;
        name: string;
        radius: number;
        original: VueUiGeoDatasetItem;
        uid: string;
        x: number;
        y: number;
    }

    export type VueUiGeoConfig = {
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiGeoDatasetItem[]>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiGeoConfig>;
        loading?: boolean;
        debug?: boolean;
        responsive?: boolean;
        theme?: Theme;
        projection?: 'aitoff' | 'azimuthalEquidistant' | 'bonne' | 'equirectangular' | 'gallPeters' | 'globe' | 'hammer' | 'mercator' | 'mollweide' | 'robinson' | 'sinusoidal' | 'vanDerGrinten' | 'winkelTripel';
        userOptions?: ChartUserOptions;
        map?: {
            geoJson?: VueUiGeoMapGeoJson;
            center?: [x: number, y: number];
            fitPadding?: number;
        };
        events?: {
            datapointClick?: VueUiGeoPointEvent;
            datapointEnter?: VueUiGeoPointEvent;
            datapointLeave?: VueUiGeoPointEvent;
            territoryEnter?: VueUiGeoTerritoryEvent;
            territoryLeave?: VueUiGeoTerritoryEvent;
            territoryClick?: VueUiGeoTerritoryEvent;
        };
        style: {
            fontFamily?: string;
            chart?: {
                dimensions?: {
                    width?: number | null;
                    height?: number | null;
                };
                backgroundColor?: string;
                color?: string;
                territory?: {
                    fill?: string;
                    stroke?: string;
                    strokeWidth?: number;
                    hover?: {
                        enabledWhenEmpty?: boolean;
                        fill?: string;
                        stroke?: string;
                        strokeWidth?: number;
                    };
                };
                points?: {
                    radius?: number;
                    stroke?: string;
                    strokeWidth?: number;
                    fill?: number;
                    hoverRadiusRatio?: number;
                    labels?: {
                        show?: boolean;
                        fontSizeRatio?: number;
                        color?: string;
                        offsetY?: number;
                    };
                };
                controls?: ChartZoomControls;
                title?: ChartTitle;
                tooltip?: ChartTooltip;
                zoom?: {
                    active?: boolean;
                };
            };
        };
    };

    export type FocusLocationOptions = {
        animated?: boolean;
    };

    export type VueUiGeoExpose = {
        getImage(options?: { scale?: number }): GetImagePromise
        generatePdf(): void
        generateImage(): void
        generateSvg(): void
        toggleAnnotator(): void
        toggleFullscreen(): void
        zoomIn(): void
        zoomOut(): void
        resetZoom(): void
        focusLocation(
            coordinates: [longitude: number, latitude: number],
            options?: FocusLocationOptions
        ): Promise<void>;
    }

    export const VueUiGeo: DefineComponent<
        {
            config?: VueUiGeoConfig,
            dataset?: VueUiGeoDatasetItem[]
        },
        VueUiGeoExpose
    >

    export type VueUiBumpDatasetItem = {
        [key: string]: any;
        name: string;
        values: Array<number | null>;
        color?: string;
    }

    export type VueUiBumpDatapoint = {
        [key: string]: any;
        color: string;
        displayValue: string;
        id: string;
        labelColor: string;
        name: string;
        pointIndex: string;
        rank: number;
        value: number;
        x: number;
        y: number;
    }

    export type VueUiBumpConfig = {
        skeletonDataset?: VueUiBuiltInSkeletonDataset<VueUiBumpDatasetItem[]>;
        skeletonConfig?: VueUiBuiltInSkeletonConfig<VueUiBumpConfig>;
        loading?: boolean;
        debug?: boolean;
        responsive?: boolean;
        theme?: Theme;
        customPalette?: string[];
        useCssAnimation?: boolean;
        events?: {
            datapointEnter?: VueUiBumpEvent;
            datapointLeave?: VueUiBumpEvent;
            datapointClick?: VueUiBumpEvent;
        };
        userOptions?: ChartUserOptions;
        table?: {
            show?: boolean;
            useDialog?: boolean;
            responsiveBreakpoint?: number;
            columnNames?: {
                series?: string;
                period?: string;
                values?: string;
                ranking?: string;
            };
            th: ChartTableCell;
            td: ChartTableCell & {
                roundingValue?: number;
            };
        };
        style?: {
            fontFamily?: string;
            chart?: {
                backgroundColor?: string;
                color?: string;
                width?: number;
                height?: number;
                layout?: {
                    timeLabels?: {
                        show?: boolean;
                        values?: Array<string | number>;
                        datetimeFormatter?: AxisDateFormatter;
                        offsetY?: number;
                        rotation?: number;
                        autoRotate?: {
                            enable?: boolean;
                            angle?: number;
                        };
                        fontSize?: number;
                        color?: string;
                        bold?: boolean;
                        showOnlyFirstAndLast?: boolean;
                        showOnlyAtModulo?: boolean;
                        modulo?: number;
                    };
                    lines?: {
                        smooth?: boolean;
                        strokeWidth?: number;
                        coatingColor?: string;
                    };
                    plots?: {
                        stroke?: string;
                        strokeWidth?: number;
                        radius?: number;
                        labels?: {
                            color?: 'auto' | string;
                            show?: boolean;
                            bold?: boolean;
                            displayedValue?: 'value' | 'rank';
                            fontSize?: number;
                            prefix?: string;
                            suffix?: string;
                            rounding?: number;
                            formatter?: Formatter;
                        };
                    };
                    nameLabels?: {
                        fontSize?: number;
                        color?: string;
                        useSerieColor?: boolean;
                        bold?: boolean;
                        offsetX?: number;
                        leftLabels?: {
                            show?: boolean;
                        };
                        rightLabels?: {
                            show?: boolean;
                        };
                    };
                };
                title?: ChartTitle;
                padding?: ChartPadding;
            }
        }
    }

    export type VueUiBumpExpose = {
        getData(): Promise<Array<{
            [key: string]: any;
            absoluteIndex: number;
            color: string;
            coordinates: Array<{
                color: string;
                displayValue: string;
                id: string;
                labelColor: string;
                name: string;
                rank: number;
                value: number | null;
                x: number;
                y: number;
            }>;
            id: string;
            name: string;
            path: string;
            positions: Array<number | null>;
            values: Array<number | null>;
        }>>
        getImage(options?: { scale?: number }): GetImagePromise
        generateCsv(): void
        generateSvg(): void
        generateImage(): void
        generatePdf(): void
        toggleAnnotator(): void
        toggleTable(): void
        toggleFullscreen(): void
    }

    export const VueUiBump: DefineComponent<
        {
            config?: VueUiBumpConfig;
            dataset: VueUiBumpDatasetItem[];
        }, 
        VueUiBumpExpose
    >;

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
        | VueUiHorizontalBarConfig
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
        | VueUiCirclePackConfig
        | VueUiWorldConfig
        | VueUiRidgelineConfig
        | VueUiChordConfig
        | VueUiStacklineConfig
        | VueUiDagConfig
        | VueUiGeoConfig
        | VueUiBumpConfig;

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
        | "vue_ui_horizontal_bar"
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
        | "vue_ui_circle_pack"
        | "vue_ui_world"
        | "vue_ui_ridgeline"
        | "vue_ui_chord"
        | "vue_ui_stackline"
        | "vue_ui_dag"
        | "vue_ui_geo"
        | "vue_ui_bump";

    export type VueDataUiWordCloudTransformCallback =
        | ((word: string) => string)
        | null;

    export type Point = {
        [key: string]: any
        x: number
        y: number
    }

    /** 
     * Configuration options for cumulative functions 
    */
    export type CumulativeConfig = {
        /** 
         * If `true`, invalid inputs are kept (and echoed) in the output. 
         * Defaults to `true`. 
         */
        keepInvalid?: boolean;
        /** 
         * If `true`, invalid inputs are treated as zero when computing the statistic. 
         * Defaults to `false`. 
         */
        convertInvalidToZero?: boolean;
    }

    /**
     * Vue Data UI utility
     * ---
     * Compute the cumulative median of a sequence, optionally echoing or zero-filling invalid inputs.
     * ---
    * @example
    * ```js
    * // Simple usage
    * const arr = [1, 2, 3, 4, 5];
    * const medians = getCumulativeMedian({ values: arr });
    *
    * // Ignore invalid values entirely
    * const arrWithInvalid = [1, null, 2, Infinity, undefined];
    * const mediansNoInvalid = getCumulativeMedian({
    *   values: arrWithInvalid,
    *   config: { keepInvalid: false }
    * });
    *
    * // Convert invalid values to zero
    * const mediansZeroed = getCumulativeMedian({
    *   values: arrWithInvalid,
    *   config: { convertInvalidToZero: true }
    * });
    * ```
    * 
    * @param {Object} params
    * @param {Array<number|*>} params.values
    *   The input sequence. Can include numbers or any “invalid” placeholders.
    * @param {CumulativeConfig} [params.config]
    *   Configuration flags to control handling of invalid inputs.
    * @returns {Array<number|*>}
    *   An array where each slot is either the cumulative median up to that point,
    *   or the original invalid value if `keepInvalid` is `true`.
    */
    export function getCumulativeMedian<T = unknown>(params: {
        values: Array<number | T>;
        config?: CumulativeConfig;
    }): Array<number | T>;

    /**
     * Vue Data UI utility
     * ---
     * Compute the cumulative median of a sequence, optionally echoing or zero-filling invalid inputs.
     * ---
     * @example
     * ```js
     * // Simple usage
     * const arr = [1, 2, 3, 4, 5];
     * const medians = getCumulativeMedian({ values: arr });
     *
     * // Ignore invalid values entirely
     * const arrWithInvalid = [1, null, 2, Infinity, undefined];
     * const mediansNoInvalid = getCumulativeMedian({
     *   values: arrWithInvalid,
     *   config: { keepInvalid: false }
     * });
     *
     * // Convert invalid values to zero
     * const mediansZeroed = getCumulativeMedian({
     *   values: arrWithInvalid,
     *   config: { convertInvalidToZero: true }
     * });
     * ```
     *
     * @param {Object} params
     * @param {Array<number|*>} params.values
     *   The input sequence. Can include numbers or any “invalid” placeholders.
     * @param {CumulativeConfig} [params.config]
     *   Configuration flags to control handling of invalid inputs.
     * @returns {Array<number|*>}
     *   An array where each slot is either the cumulative median up to that point,
     *   or the original invalid value if `keepInvalid` is `true`.
     */
    export function getCumulativeAverage<T = unknown>(params: {
        values: Array<number | T>;
        config?: CumulativeConfig;
    }): Array<number | T>;

    /**
     * Recursively makes all properties in T optional.
     * - Leaves functions as-is
     * - Handles arrays by making their item type DeepPartial
     */
    export type DeepPartial<T> =
        T extends Function
        ? T
        : T extends Array<infer U>
        ? Array<DeepPartial<U>>
        : T extends object
        ? { [K in keyof T]?: DeepPartial<T[K]> }
        : T;

    /**
     * Vue Data UI utility
     * ---
     * Merge a partial config with a full default config
     * ---
     * @example
     * const defaultConfig = getVueDataUiConfig('vue_ui_xy');
     * const merged = mergeConfigs({
     *      defaultConfig,
     *      userConfig: {
     *          chart: {
     *              backgroundColor: '#FF0000'
     *          }
     *      }
     * })
     */
    export function mergeConfigs<T extends Record<string, any>>({
        defaultConfig,
        userConfig,
    }: {
        defaultConfig: T;
        userConfig: DeepPartial<T>;
    }
    ): T;

    /**
     * Vue Data UI utility
     * ---
     * Generate a straight line path to include in the d attribute of a svg path element 
     * ___
     * @example
     * const path = createStraightPath([{x: 1, y: 1}, { x: 2, y: 1.2}])
     *
     * @param points - An array of point objects
     */
    export const createStraightPath: (points: Point[]) => string

    /**
     * Vue Data UI utility
     * ---
     * Generate a spline path to include in the d attribute of a svg path element 
     * ___
     * @example
     * const path = createSmoothPath([{x: 1, y: 1}, { x: 2, y: 1.2}, { x: 3, y: 0.2 }])
     *
     * @param points - An array of point objects
     */
    export const createSmoothPath: (points: Point[]) => string


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

    export type VueDataUiGetConfigOptions = {
        colorBackground?: string;
        colorTextPrimary?: string;
        colorTextSecondary?: string;
        colorGrid?: string;
        colorBorder?: string;
    };

    /**
     * Vue Data UI utility
     * ---
     * Get the default config for a given component
     * ___
     * @typeParam T - The config type for the component
     * @param key - Component key in snake_case (e.g. `"vue_ui_xy"`).
     * @param options - Optional general color settings
     * @returns The default configuration of type `T`.
     * @example
     * ```ts
     * const defaultConfig = getVueDataUiConfig<VueUiXyConfig>("vue_ui_xy");
     * ```
     */
    export const getVueDataUiConfig: <T>(key: VueDataUiConfigKey, options?: VueDataUiGetConfigOptions) => T;

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

    export type FormatSmallValueArgs = {
        value: number;
        maxDecimals?: number;
        fallbackFormatter?: (value: number) => string;
        removeTrailingZero?: boolean
    }

    /**
     * Vue Data UI utility
     * ---
     * Formats numeric values with a controlled number of decimal places,
     * applying maxDecimals for all values when no fallbackFormatter is given,
     * or calling the fallbackFormatter for values ≥ 1 if provided.
     * ___
     * @example
     * // Zero value
     * formatSmallValue({ value: 0 }); // "0"
     *
     * // Values < 1 use minimal decimals
     * formatSmallValue({ value: 0.9 }); // "0.9"
     * formatSmallValue({ value: 0.0042 }); // "0.0042"
     * formatSmallValue({ value: 0.00420001 }); // "0.0042"
     *
     * // Retain trailing zeros
     * formatSmallValue({ value: 0.9, removeTrailingZero: false }); // "0.90"
     *
     * // Values ≥ 1 without fallback apply maxDecimals
     * formatSmallValue({ value: 1.61803, maxDecimals: 3 }); // "1.618"
     *
     * // Values ≥ 1 with fallbackFormatter
     * formatSmallValue({ value: 2.5, fallbackFormatter: v => v.toFixed(1) }); // "2.5"
     *
     * // Negative values
     * formatSmallValue({ value: -0.056 }); // "-0.056"
     * 
     * @param {FormatSmallValueArgs} options - Configuration object for formatting.
     * @param {number} options.value                 - The numeric value to format.
     * @param {number} [options.maxDecimals=4]       - Maximum decimal places to use.
     * @param {(value: number) => string} [options.fallbackFormatter] - Formatter for values ≥ 1.
     * @param {boolean} [options.removeTrailingZero=true] - Whether to strip unnecessary trailing zeros.
     * @returns {string} The formatted number as a string.
     */
    export const formatSmallValue: ({
        value,
        maxDecimals,
        fallbackFormatter,
        removeTrailingZero
    }: FormatSmallValueArgs) => string

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

    /**
     * Vue Data UI composable
     * ---
     * Flattens a reactive config object into computed refs for every leaf property.
     * 
     * @template T extends object
     * @param configRef  A Vue `Ref` holding your object.
     * @param options    Optional settings: `delimiter` (default `"."`) and `skipArrays` (default `true`).
     * @returns         An object with flatten config as refs
     * 
     * ___
     * @example
     * 
     * ```js
     *   import { useObjectBindings } from "vue-data-ui";
     *
     *   const config = ref({
     *     customPalette: ["#CCCCCC", "#1A1A1A"],
     *     style: {
     *       chart: {
     *         backgroundColor: "#FFFFFF",
     *         color: "#1A1A1A",
     *       },
     *     },
     *   });
     * 
     *   const bindings = useObjectBindings(config);
     * ```
     * 
     * Then in your template:
     * ```html
     *   <template>
     *     <div>
     *       <input type="color" v-model="bindings['style.chart.backgroundColor']" />
     *     </div>
     *   </template>
     * ```
     */
    export function useObjectBindings(
        configRef: Ref<Record<string, any>>,
        options?: {
            delimiter?: string
            skipArrays?: boolean
        }
    ): Record<string, Ref<any>>;
}
