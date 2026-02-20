export function useConfig(options = {}) {
    const COLOR_BLACK = '#2D353C'
    const COLOR_GREY = '#A1A1A1'
    const COLOR_GREY_LIGHT = '#e1e5e8'
    const COLOR_GREY_MID = '#CCCCCC'
    const COLOR_GREY_DARK = '#4A4A4A'
    const COLOR_WHITE = '#FFFFFF'
    const COLOR_WHITE_ALMOST = '#fafafa'
    const COLOR_BLUE = '#1f77b4'
    const COLOR_RED = '#d62728'
    const COLOR_GREEN = '#2ca02c'
    const COLOR_VUE = '#42d392'
    const COLOR_YELLOW = '#FFD055'

    const COLOR_BACKGROUND = options.colorBackground ?? COLOR_WHITE;
    const COLOR_TEXT_PRIMARY = options.colorTextPrimary ?? COLOR_BLACK;
    const COLOR_TEXT_SECONDARY = options.colorTextSecondary ?? COLOR_GREY;
    const COLOR_GRID = options.colorGrid ?? COLOR_GREY_LIGHT;
    const COLOR_BORDER = options.colorBorder ?? COLOR_GREY_LIGHT;

    const FONT = {
        _6: 6,
        _8: 8,
        _10: 10,
        _12: 12,
        _14: 14,
        _16: 16,
        _18: 18,
        _20: 20,
        _24: 24,
        _32: 32,
        _48: 48
    }

    const MIN_FONT_SIZE = FONT._6;

    const SHAPE = {
        LINE: 'line',
        SQUARE: 'square',
        ROUND: 'round',
        CIRCLE: 'circle',
        CURVED: 'curved',
        BAR: 'bar',
        STAR: 'star'
    }

    const POSITION = {
        LEFT: 'left',
        CENTER: 'center',
        RIGHT: 'right',
        BOTTOM: 'bottom',
        TOP: 'top'
    }

    const SORT = {
        ASC: 'asc',
        DESC: 'desc',
        NONE: 'none'
    }

    const LTTB = {
        threshold: 1095, // v2 = 500
    }

    const LABEL_VP_ORDER = {
        showValueFirst: true,
        usePercentageParens: true,
        useValueParens: false,
    }

    const TITLE = {
        text: "",
        color: COLOR_TEXT_PRIMARY,
        fontSize: FONT._20,
        bold: true,
        textAlign: POSITION.CENTER,
        paddingLeft: 0,
        paddingRight: 0,
        subtitle: {
            color: COLOR_TEXT_SECONDARY,
            text: "",
            fontSize: FONT._16,
            bold: false
        }
    }

    const LEGEND = {
        show: true,
        bold: false,
        backgroundColor: COLOR_BACKGROUND,
        color: COLOR_TEXT_PRIMARY,
        fontSize: FONT._14,
        selectAllToggle: {
            show: false,
            backgroundColor: COLOR_BORDER,
            color: COLOR_TEXT_PRIMARY
        }
    }

    const TOOLTIP = {
        show: true,
        color: COLOR_TEXT_PRIMARY,
        backgroundColor: COLOR_BACKGROUND,
        fontSize: FONT._14,
        customFormat: null,
        borderRadius: 4,
        borderColor: COLOR_BORDER,
        borderWidth: 1,
        backgroundOpacity: 100,
        position: POSITION.CENTER,
        offsetY: 24,
        smooth: true, // v3
        backdropFilter: true, // v3
        smoothForce: 0.18,
        smoothSnapThreshold: 0.25,
        teleportTo: 'body' // or any other css selector (used in the `to` attr of the Teleport component)
    }

    const AXIS_DATE_FORMATTER = {
        enable: false,
        locale: 'en',
        useUTC: false,
        januaryAsYear: false,
        options: {
            year: 'yyyy',
            month: `MMM 'yy`,
            day: 'dd MMM',
            hour: 'HH:mm',
            minute: 'HH:mm:ss',
            second: 'HH:mm:ss'
        }
    }

    const USER_OPTIONS = ({
        tooltip = false,
        pdf = false,
        csv = false,
        img = false,
        table = false,
        labels = false,
        fullscreen = false,
        sort = false,
        stack = false,
        animation = false,
        annotator = false,
        svg = false,
        zoom = false,
        altCopy = false
    }) => {

        const buttonTitles = {
            open: 'Open options',
            close: 'Close options',
            tooltip: 'Toggle tooltip',
            pdf: 'Download PDF',
            csv: 'Download CSV',
            img: 'Download PNG',
            table: 'Toggle table',
            labels: 'Toggle labels',
            fullscreen: 'Toggle fullscreen',
            sort: "Toggle sort",
            stack: "Toggle stack mode",
            animation: "Toggle animation",
            annotator: "Toggle annotator",
            svg: "Download SVG",
            zoom: "Toggle zoom lock",
            altCopy: "Copy alt text"
        }

        if (!tooltip) delete buttonTitles.tooltip
        if (!pdf) delete buttonTitles.pdf
        if (!csv) delete buttonTitles.csv
        if (!img) delete buttonTitles.img
        if (!table) delete buttonTitles.table
        if (!labels) delete buttonTitles.labels
        if (!fullscreen) delete buttonTitles.fullscreen
        if (!sort) delete buttonTitles.sort
        if (!stack) delete buttonTitles.stack
        if (!animation) delete buttonTitles.animation
        if (!annotator) delete buttonTitles.annotator
        if (!svg) delete buttonTitles.svg
        if (!zoom) delete buttonTitles.zoom

        return {
            show: true,
            showOnChartHover: false,
            keepStateOnChartLeave: true,
            position: 'right',
            buttons: {
                tooltip,
                pdf,
                csv,
                img,
                table,
                labels,
                fullscreen,
                sort,
                stack,
                animation,
                annotator,
                svg,
                zoom,
                altCopy
            },
            callbacks: {
                animation: null,
                annotator: null,
                csv: null,
                fullscreen: null,
                img: null,
                labels: null,
                pdf: null,
                sort: null,
                stack: null,
                table: null,
                tooltip: null,
                svg: null,
                zoom: null,
                altCopy: null,
            },
            buttonTitles,
            print: {
                scale: 2,
                orientation: 'auto', // 'auto' | 'l' | 'p'
                overflowTolerance: 0.2,
            },
            useCursorPointer: false
        }
    }

    /**
     * @param {Number[]} p - [T,R,B,L]
     */
    const PADDING = p => {
        return {
            top: p[0],
            right: p[1],
            bottom: p[2],
            left: p[3]
        }
    }

    const TABLE_TH = {
        backgroundColor: COLOR_BACKGROUND,
        color: COLOR_TEXT_PRIMARY,
        outline: 'none'
    }

    const TABLE_TD = {
        backgroundColor: COLOR_BACKGROUND,
        color: COLOR_TEXT_PRIMARY,
        outline: 'none',
    }

    const TABLE = {
        show: false,
        responsiveBreakpoint: 400
    }

    const ZOOM = {
        show: true,
        color: COLOR_GREY_MID,
        highlightColor: COLOR_GREY_DARK,
        fontSize: FONT._14,
        useResetSlot: false,
        startIndex: null,
        endIndex: null,
        enableRangeHandles: true,
        enableSelectionDrag: true,
        focusOnDrag: false,
        focusRangeRatio: 0.2,
        maxWidth: null,
    }

    const MINIMAP_BASE = {
        show: false,
        selectedColor: COLOR_BLUE,
        selectedColorOpacity: 0.2,
        indicatorColor: COLOR_BLACK,
        verticalHandles: false,
        compact: true,
        frameColor: COLOR_GREY,
        additionalHeight: 0,
        handleIconColor: null,
        handleBorderWidth: 1,
        handleBorderColor: null,
        handleFill: null,
        handleWidth: 20,
        handleType: 'grab', // 'empty' | 'chevron' | 'grab' | 'arrow'
    }

    const MINIMAP = {
        ...MINIMAP_BASE,
        smooth: false,
        lineColor: COLOR_BLACK,
        selectionRadius: 2,
        merged: false,
    }

    const vue_ui_stackline = {
        skeletonDataset: null,
        skeletonConfig: null,
        loading: false,
        debug: false,
        theme: '',
        responsive: false,
        events: {
            datapointEnter: null,
            datapointLeave: null,
            datapointClick: null,
        },
        customPalette: [],
        useCssAnimation: false,
        table: {
            ...TABLE,
            useDialog: false,
            columnNames: {
                period: 'Period',
                total: 'Total'
            },
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0
            },
        },
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            labels: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                height: 500,
                width: 800,
                padding: PADDING([12, 12, 12, 12]),
                title: TITLE,
                legend: {
                    ...LEGEND,
                    position: 'bottom'
                },
                zoom: {
                    ...ZOOM,
                    minimap: MINIMAP_BASE,
                    preview: {
                        enable: true,
                        fill: '#CCCCCC50',
                        stroke: '#6A6A6A',
                        strokeWidth: 2,
                        strokeDasharray: 0,
                    },
                    useDefaultFormat: true,
                    timeFormat: 'yyyy-MM-dd HH:mm:ss', // When datetimeFormatter is enabled and useDefaultFormat is false
                    customFormat: null // overrides all if callback => string
                },
                highlighter: {
                    color: COLOR_TEXT_PRIMARY,
                    opacity: 5,
                    useLine: false,
                    lineDasharray: 2,
                    lineWidth: 1
                },
                tooltip: {
                    ...TOOLTIP,
                    showValue: true,
                    showPercentage: true,
                    roundingValue: 0,
                    roundingPercentage: 0,
                    showTimeLabel: true,
                    showTotal: false,
                    totalTranslation: 'Total',
                    useDefaultTimeFormat: true,
                    timeFormat: 'yyyy-MM-dd HH:mm:ss' // When datetimeFormatter is enabled and useDefaultFormat is false
                },
                grid: {
                    scale: {
                        ticks: 10,
                        scaleMin: null, // Force min scale (defaults to dataset's min)
                        scaleMax: null, // Force max scale (defaults to dataset's max)
                    },
                    frame: {
                        show: false,
                        stroke: COLOR_GRID,
                        strokeWidth: 2,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        strokeDasharray: 0
                    },
                    x: {
                        showAxis: true,
                        showHorizontalLines: false,
                        axisColor: COLOR_GRID,
                        linesColor: COLOR_GRID,
                        linesThickness: 1,
                        linesStrokeDasharray: 0,
                        axisThickness: 2,
                        axisName: {
                            show: true,
                            text: '',
                            fontSize: FONT._14,
                            color: COLOR_TEXT_PRIMARY,
                            bold: false,
                            offsetY: 0,
                        },
                        timeLabels: {
                            show: true,
                            values: [],
                            datetimeFormatter: AXIS_DATE_FORMATTER,
                            offsetY: 0,
                            rotation: 0,
                            autoRotate: {
                                enable: true,
                                angle: -30
                            },
                            fontSize: FONT._14,
                            color: COLOR_TEXT_PRIMARY,
                            bold: false,
                            showOnlyFirstAndLast: false,
                            showOnlyAtModulo: false,
                            modulo: 12
                        }
                    },
                    y: {
                        showAxis: true,
                        showVerticalLines: false,
                        linesColor: COLOR_GRID,
                        linesThickness: 1,
                        linesStrokeDasharray: 0,
                        axisColor: COLOR_GRID,
                        axisThickness: 2,
                        axisName: {
                            show: true,
                            text: '',
                            fontSize: FONT._14,
                            color: COLOR_TEXT_PRIMARY,
                            bold: false,
                            offsetX: 0,
                        },
                        axisLabels: {
                            formatter: null,
                            show: true,
                            color: COLOR_TEXT_PRIMARY,
                            fontSize: FONT._14,
                            bold: false,
                            rounding: 0
                        }
                    },
                },
                lines: {
                    useArea: true,
                    smooth: false,
                    areaOpacity: 0.5,
                    distributed: false,
                    showDistributedPercentage: true,
                    strokeWidth: 1,
                    gradient: {
                        show: true,
                        intensity: 40
                    },
                    dot: {
                        hideAboveMaxSerieLength: 62,
                        useSerieColor: true,
                        fill: COLOR_WHITE,
                        strokeWidth: 0.5,
                        radius: 4,
                    },
                    totalValues: {
                        show: true,
                        offsetY: 0,
                        fontSize: FONT._16,
                        bold: true,
                        color: COLOR_TEXT_PRIMARY
                    },
                    dataLabels: {
                        hideAboveMaxSerieLength: 62,
                        offsetY: 0,
                        show: true,
                        hideEmptyValues: true,
                        hideUnderValue: null,
                        hideEmptyPercentages: true,
                        hideUnderPercentage: null,
                        color: COLOR_TEXT_PRIMARY,
                        fontSize: FONT._14,
                        bold: false,
                        rounding: 0,
                        prefix: '',
                        suffix: '',
                        formatter: null
                    }
                },
            }
        }
    }

    const vue_ui_stackbar = {
        skeletonDataset: null,
        skeletonConfig: null,
        loading: false, // v3
        debug: false, // v3
        theme: '',
        responsive: false,
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        customPalette: [],
        useCssAnimation: false, // v3 (v2 = true)
        orientation: 'vertical', // or 'horizontal'
        table: {
            ...TABLE,
            useDialog: false,
            columnNames: {
                period: 'Period',
                total: 'Total'
            },
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0
            },
        },
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            labels: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                height: 500,
                width: 800,
                padding: PADDING([12, 12, 12, 12]),
                title: TITLE,
                legend: {
                    ...LEGEND,
                    position: 'bottom'
                },
                zoom: {
                    ...ZOOM,
                    minimap: MINIMAP_BASE,
                    preview: {
                        enable: true,
                        fill: '#CCCCCC50',
                        stroke: '#6A6A6A',
                        strokeWidth: 2,
                        strokeDasharray: 0,
                    },
                    useDefaultFormat: true,
                    timeFormat: 'yyyy-MM-dd HH:mm:ss', // When datetimeFormatter is enabled and useDefaultFormat is false
                    customFormat: null // overrides all if callback => string
                },
                tooltip: {
                    ...TOOLTIP,
                    showValue: true,
                    showPercentage: true,
                    roundingValue: 0,
                    roundingPercentage: 0,
                    showTimeLabel: true,
                    showTotal: false,
                    totalTranslation: 'Total',
                    useDefaultTimeFormat: true,
                    timeFormat: 'yyyy-MM-dd HH:mm:ss' // When datetimeFormatter is enabled and useDefaultFormat is false
                },
                highlighter: {
                    color: COLOR_TEXT_PRIMARY,
                    opacity: 5
                },
                bars: {
                    gapRatio: 0.5,
                    distributed: false,
                    showDistributedPercentage: true,
                    borderRadius: 0,
                    strokeWidth: 1,
                    gradient: {
                        show: true,
                        intensity: 20
                    },
                    totalValues: {
                        show: true,
                        offsetY: 0,
                        offsetX: 0,
                        fontSize: FONT._16,
                        bold: false,
                        color: COLOR_TEXT_PRIMARY
                    },
                    dataLabels: {
                        show: true,
                        hideEmptyValues: false,
                        hideUnderValue: null,
                        hideEmptyPercentages: false,
                        hideUnderPercentage: null,
                        adaptColorToBackground: true,
                        color: COLOR_TEXT_PRIMARY,
                        fontSize: FONT._14,
                        bold: false,
                        rounding: 0,
                        prefix: '',
                        suffix: '',
                        formatter: null
                    }
                },
                grid: {
                    scale: {
                        ticks: 10,
                        scaleMin: null, // Force min scale (defaults to dataset's min)
                        scaleMax: null, // Force max scale (defaults to dataset's max)
                    },
                    frame: {
                        show: false,
                        stroke: COLOR_GRID,
                        strokeWidth: 2,
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        strokeDasharray: 0
                    },
                    x: {
                        showAxis: true,
                        showHorizontalLines: false,
                        axisColor: COLOR_GRID,
                        linesColor: COLOR_GRID,
                        linesThickness: 1,
                        linesStrokeDasharray: 0,
                        axisThickness: 2,
                        axisName: {
                            show: true,
                            text: '',
                            fontSize: FONT._14,
                            color: COLOR_TEXT_PRIMARY,
                            bold: false,
                            offsetY: 0,
                        },
                        timeLabels: {
                            show: true,
                            values: [],
                            datetimeFormatter: AXIS_DATE_FORMATTER,
                            offsetY: 0,
                            rotation: 0,
                            autoRotate: { // v3
                                enable: true, // v3
                                angle: -30 // v3
                            },
                            fontSize: FONT._14,
                            color: COLOR_TEXT_PRIMARY,
                            bold: false,
                            showOnlyFirstAndLast: false,
                            showOnlyAtModulo: false,
                            modulo: 12
                        }
                    },
                    y: {
                        showAxis: true,
                        showVerticalLines: false,
                        linesColor: COLOR_GRID,
                        linesThickness: 1,
                        linesStrokeDasharray: 0,
                        axisColor: COLOR_GRID,
                        axisThickness: 2,
                        axisName: {
                            show: true,
                            text: '',
                            fontSize: FONT._14,
                            color: COLOR_TEXT_PRIMARY,
                            bold: false,
                            offsetX: 0,
                        },
                        axisLabels: {
                            formatter: null,
                            show: true,
                            color: COLOR_TEXT_PRIMARY,
                            fontSize: FONT._14,
                            bold: false,
                            rounding: 0
                        }
                    },
                }
            }
        }
    }

    // NOTE: Any update to this config will be reflected in VueUiRidgeline, which uses VueUiXy in its dialog.
    const vue_ui_xy = {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false, // v3
        theme: '',
        responsive: false,
        loading: false, // v3
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null // v3
        },
        responsiveProportionalSizing: true,
        customPalette: [],
        useCssAnimation: false, // v3 (v2 = true)
        downsample: LTTB,
        chart: {
            fontFamily: 'inherit',
            backgroundColor: COLOR_BACKGROUND,
            color: COLOR_TEXT_PRIMARY,
            height: 600,
            width: 1000,
            // Annotations are hidden in stack mode
            annotations: [
                {
                    show: false,
                    yAxis: {
                        yTop: null,
                        yBottom: null,
                        label: {
                            text: '',
                            textAnchor: 'start', // or middle or end
                            position: 'start', // or end
                            offsetX: 0,
                            offsetY: 0,
                            padding: PADDING([12, 12, 12, 12]),
                            border: {
                                stroke: COLOR_WHITE,
                                strokeWidth: 1,
                                rx: 0,
                                ry: 0,
                            },
                            fontSize: 14,
                            color: COLOR_TEXT_PRIMARY,
                            backgroundColor: COLOR_GRID
                        },
                        line: {
                            stroke: COLOR_BLACK,
                            strokeWidth: 1,
                            strokeDasharray: 0,
                        },
                        area: {
                            fill: COLOR_GRID,
                            opacity: 30
                        }
                    }
                }
            ],
            zoom: {
                ...ZOOM,
                minimap: MINIMAP,
                preview: { // v3
                    enable: true,
                    fill: '#CCCCCC50',
                    stroke: '#6A6A6A',
                    strokeWidth: 2,
                    strokeDasharray: 0,
                },
                useDefaultFormat: true,
                timeFormat: 'yyyy-MM-dd HH:mm:ss', // When datetimeFormatter is enabled
                customFormat: null // overrides all if callback => string
            },
            padding: PADDING([12, 12, 6, 6]),
            highlighter: {
                color: COLOR_TEXT_PRIMARY,
                opacity: 5,
                useLine: false,
                lineDasharray: 2,
                lineWidth: 1
            },
            // Highlight area was initially a single object of type VueUiXyHighlightArea.
            // It now also works with a type VueUiXyHighlightArea[]
            highlightArea: {
                show: false,
                from: 0,
                to: 0,
                color: COLOR_BLACK,
                opacity: 20,
                caption: {
                    text: '',
                    fontSize: FONT._10,
                    color: COLOR_TEXT_PRIMARY,
                    bold: false,
                    offsetY: 0,
                    width: 'auto',
                    padding: 3,
                    textAlign: POSITION.CENTER
                }
            },
            timeTag: {
                show: false,
                backgroundColor: COLOR_GRID,
                color: COLOR_TEXT_PRIMARY,
                fontSize: FONT._12,
                circleMarker: {
                    radius: 3,
                    color: COLOR_TEXT_PRIMARY
                },
                useDefaultFormat: true,
                timeFormat: 'yyyy-MM-dd HH:mm:ss', // When datetimeFormatter is enabled
                customFormat: null // overrides all if callback => string
            },
            grid: {
                stroke: COLOR_GRID,
                showVerticalLines: false,
                showHorizontalLines: false,
                position: 'middle', // or 'start'
                frame: {
                    show: false,
                    stroke: COLOR_GRID,
                    strokeWidth: 2,
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    strokeDasharray: 0
                },
                labels: {
                    show: true,
                    color: COLOR_TEXT_PRIMARY,
                    fontSize: FONT._16,
                    axis: {
                        yLabel: '',
                        yLabelOffsetX: 0,
                        xLabel: '',
                        xLabelOffsetY: 0,
                        fontSize: FONT._14
                    },
                    zeroLine: {
                        show: true
                    },
                    xAxis: {
                        showBaseline: false,
                        showCrosshairs: true,
                        crosshairsAlwaysAtZero: false,
                        crosshairSize: 6,
                    },
                    yAxis: {
                        position: 'left',
                        showBaseline: true,
                        showCrosshairs: true,
                        crosshairSize: 6,
                        commonScaleSteps: 10,
                        useIndividualScale: false,
                        useNiceScale: false,
                        stacked: false,
                        gap: 12,
                        labelWidth: 64,
                        formatter: null,
                        scaleMin: null, // Overrides auto scaling
                        scaleMax: null, // idem
                        groupColor: null, // force yAxis labels color
                        scaleLabelOffsetX: 0,
                        scaleValueOffsetX: 0,
                        rounding: 1,
                        serieNameFormatter: null // v3, for individual scale & stacked modes
                    },
                    xAxisLabels: {
                        color: COLOR_TEXT_PRIMARY,
                        show: true,
                        values: [],
                        datetimeFormatter: AXIS_DATE_FORMATTER,
                        fontSize: FONT._14,
                        showOnlyFirstAndLast: false,
                        showOnlyAtModulo: false,
                        modulo: 12,
                        yOffset: 24,
                        rotation: 0,
                        autoRotate: { // v3
                            enable: true, // v3
                            angle: -30, // v3
                        }
                    }
                }
            },
            comments: {
                show: true,
                showInTooltip: true,
                width: 200,
                offsetX: 0,
                offsetY: 0,
            },
            labels: {
                fontSize: FONT._10,
                prefix: '',
                suffix: ''
            },
            legend: {
                color: COLOR_TEXT_PRIMARY,
                show: true,
                fontSize: FONT._14,
                position: 'bottom', // bottom | top
                selectAllToggle: {
                    show: false,
                    backgroundColor: COLOR_BORDER,
                    color: COLOR_TEXT_PRIMARY
                }
            },
            title: {
                ...TITLE,
                show: true,
            },
            tooltip: {
                ...TOOLTIP,
                showTimeLabel: true,
                showValue: true,
                showPercentage: true,
                roundingValue: 0,
                roundingPercentage: 0,
                useDefaultTimeFormat: true,
                timeFormat: 'yyyy-MM-dd HH:mm:ss', // When datetimeFormatter is used
            },
            userOptions: USER_OPTIONS({
                tooltip: true,
                pdf: true,
                csv: true,
                img: true,
                table: true,
                labels: true,
                fullscreen: true,
                stack: true,
                annotator: true,
                svg: true,
            })
        },
        bar: {
            showTransition: true,
            transitionDurationMs: 300,
            borderRadius: 2,
            useGradient: true,
            periodGap: 0.1,
            innerGap: 0,
            border: {
                useSerieColor: false,
                strokeWidth: 0,
                stroke: COLOR_WHITE
            },
            labels: {
                show: false,
                offsetY: -6,
                rounding: 0,
                color: COLOR_TEXT_PRIMARY,
                formatter: null
            },
            serieName: {
                show: false,
                offsetY: -6,
                useAbbreviation: true,
                abbreviationSize: 3,
                useSerieColor: true,
                color: COLOR_TEXT_PRIMARY,
                bold: false
            }
        },
        line: {
            showTransition: true,
            transitionDurationMs: 300,
            radius: 3,
            useGradient: true,
            strokeWidth: 3,
            cutNullValues: false,
            interLine: {
                pairs: [],
                colors: [],
                fillOpacity: 0.25,
            },
            dot: {
                hideAboveMaxSerieLength: 62,
                useSerieColor: true,
                fill: COLOR_WHITE,
                strokeWidth: 0.5
            },
            labels: {
                show: false,
                offsetY: -6,
                rounding: 0,
                color: COLOR_TEXT_PRIMARY,
                formatter: null
            },
            area: {
                useGradient: true,
                opacity: 30
            },
            tag: {
                followValue: true,
                formatter: null,
                fontSize: FONT._14
            }
        },
        plot: {
            showTransition: true,
            transitionDurationMs: 300,
            radius: 3,
            useGradient: true,
            dot: {
                useSerieColor: true,
                fill: COLOR_WHITE,
                strokeWidth: 0.5
            },
            labels: {
                show: false,
                offsetY: -6,
                rounding: 0,
                color: COLOR_TEXT_PRIMARY,
                formatter: null
            },
            tag: {
                followValue: true,
                formatter: null,
                fontSize: FONT._14
            }
        },
        table: {
            useDialog: false,
            responsiveBreakpoint: 400,
            rounding: 0,
            sparkline: true,
            showSum: true,
            columnNames: {
                period: 'Period',
                total: 'Total'
            },
            th: TABLE_TH,
            td: TABLE_TD,
            useDefaultTimeFormat: true,
            timeFormat: 'yyyy-MM-dd HH:mm:ss'
        },
        showTable: false
    }

    const vue_ui_donut = {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false, // v3
        type: 'classic',
        loading: false, // v3
        pie: false, // v3
        autoSize: true, // false = v2
        responsive: false,
        theme: '',
        customPalette: [],
        useCssAnimation: false, // v3 (v2 = true)
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null // v3
        },
        serieToggleAnimation: {
            show: true,
            durationMs: 500,
        },
        startAnimation: {
            show: false, // v3 (v2 = true)
            durationMs: 1000,
            staggerMs: 50
        },
        useBlurOnHover: true,
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            labels: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        translations: {
            total: 'Total',
            average: 'Average'
        },
        table: {
            ...TABLE,
            useDialog: false,
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0,
                roundingPercentage: 0,
            },
            columnNames: {
                series: 'Series',
                value: 'Value',
                percentage: 'Percentage'
            }
        },
        style: {
            fontFamily: 'inherit',
            chart: {
                useGradient: true,
                gradientIntensity: 40,
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                padding: PADDING([0,0,0,0]),
                width: 512,
                height: 360,
                layout: {
                    curvedMarkers: false,
                    labels: {
                        dataLabels: {
                            ...LABEL_VP_ORDER,
                            show: true,
                            useLabelSlots: false,
                            hideUnderValue: 3,
                            smallArcClusterThreshold: 8, // percentage under which dataLabels are clusted on a side
                            smallArcClusterFontSize: FONT._12,
                            oneLine: false,
                            prefix: '',
                            suffix: '',
                        },
                        value: {
                            rounding: 0,
                            show: true,
                            formatter: null
                        },
                        percentage: {
                            color: COLOR_TEXT_PRIMARY,
                            bold: true,
                            fontSize: FONT._18,
                            minFontSize: MIN_FONT_SIZE, // v3
                            rounding: 0,
                            formatter: null
                        },
                        name: {
                            color: COLOR_TEXT_PRIMARY,
                            bold: false,
                            fontSize: FONT._14,
                            minFontSize: MIN_FONT_SIZE, // v3
                        },
                        hollow: {
                            show: true,
                            total: {
                                show: true,
                                bold: false,
                                fontSize: FONT._18,
                                color: COLOR_TEXT_PRIMARY,
                                text: 'Total',
                                offsetY: 0,
                                value: {
                                    color: COLOR_TEXT_PRIMARY,
                                    fontSize: FONT._18,
                                    bold: true,
                                    suffix: '',
                                    prefix: '',
                                    offsetY: 0,
                                    rounding: 0,
                                    formatter: null
                                }
                            },
                            average: {
                                show: true,
                                bold: false,
                                fontSize: FONT._18,
                                color: COLOR_TEXT_SECONDARY,
                                text: 'Average',
                                offsetY: 0,
                                value: {
                                    color: COLOR_TEXT_PRIMARY,
                                    fontSize: FONT._18,
                                    bold: true,
                                    suffix: '',
                                    prefix: '',
                                    offsetY: 0,
                                    rounding: 0,
                                    formatter: null
                                }
                            }
                        }
                    },
                    donut: {
                        radiusRatio: 0.3, // v3 (clamped between 0.1 and 0.5)
                        strokeWidth: 64, // v3 (v2 = 55)
                        borderWidth: 1,
                        useShadow: false,
                        shadowColor: COLOR_BLACK,
                        emptyFill: COLOR_GRID,
                        selectedColor: '#0000001A',
                        borderColorAuto: true,
                        borderColor: COLOR_BORDER
                    }
                },
                comments: {
                    show: true,
                    showInTooltip: true,
                    width: 100,
                    offsetY: 0,
                    offsetX: 0
                },
                legend: {
                    ...LEGEND,
                    ...LABEL_VP_ORDER,
                    roundingValue: 0,
                    roundingPercentage: 0,
                    showPercentage: true,
                    showValue: true,
                    position: 'bottom'
                },
                tooltip: {
                    ...TOOLTIP,
                    ...LABEL_VP_ORDER,
                    showValue: true,
                    showPercentage: true,
                    roundingValue: 0,
                    roundingPercentage: 0,
                },
                title: TITLE,
            }
        }
    }

    const vue_ui_treemap = {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        customPalette: [],
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                height: 500,
                width: 800,
                padding: PADDING([0, 0, 0, 0]),
                layout: {
                    sorted: true,
                    rects: {
                        stroke: COLOR_GRID,
                        strokeWidth: 1,
                        borderRadius: 0,
                        colorRatio: 0.3,
                        gradient: {
                            show: true,
                            intensity: 30
                        },
                        group: {
                            stroke: COLOR_GRID,
                            strokeWidth: 1,
                            useSeriesBackgroundColor: false,
                            backgroundLighterRatio: 0.4,
                            label: {
                                adaptColorToBackground: false,
                                color: COLOR_TEXT_PRIMARY
                            }
                        },
                        selected: {
                            stroke: COLOR_GRID,
                            strokeWidth: 1,
                            unselectedOpacity: 0.6
                        },
                    },
                    labels: {
                        showDefaultLabels: true,
                        fontSize: FONT._24,
                        minFontSize: FONT._10,
                        hideUnderProportion: 0.03,
                        prefix: 'Value: ',
                        suffix: '',
                        rounding: 0,
                        formatter: null,
                        name: { 
                            show: true,
                            bold: true 
                        },
                        value: { 
                            show: true,
                            bold: false 
                        }
                    }
                },
                legend: {
                    ...LEGEND,
                    roundingValue: 0,
                    roundingPercentage: 0,
                    showValue: true,
                    showPercentage: true,
                    position: 'bottom'
                },
                title: TITLE,
                tooltip: {
                    ...TOOLTIP,
                    roundingValue: 1
                }
            }
        },
        table: {
            ...TABLE,
            useDialog: false,
            columnNames: {
                series: 'Series',
                value: 'Value',
                percentage: 'Percentage'
            },
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0,
                roundingPercentage: 0
            }
        }
    }

    const vue_ui_waffle = {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        customPalette: [],
        useBlurOnHover: true,
        useCustomCells: false,
        useAnimation: true,
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                layout: {
                    labels: {
                        dataLabels: {
                            ...LABEL_VP_ORDER,
                            prefix: '',
                            suffix: '',
                            formatter: null
                        },
                        captions: {
                            show: false,
                            showSerieName: false,
                            serieNameAbbreviation: true,
                            serieNameMaxAbbreviationSize: 3,
                            fontSize: FONT._12,
                            showValue: true,
                            showPercentage: true,
                            roundingValue: 0,
                            roundingPercentage: 0,
                            offsetX: 0,
                            offsetY: 0
                        }
                    },
                    grid: {
                        size: 10,
                        spaceBetween: 2,
                        vertical: false
                    },
                    rect: {
                        rounded: true,
                        rounding: 2,
                        stroke: COLOR_BLACK,
                        strokeWidth: 1,
                        useGradient: true,
                        gradientIntensity: 40
                    }
                },
                title: TITLE,
                tooltip: {
                    ...TOOLTIP,
                    ...LABEL_VP_ORDER,
                    showValue: true,
                    showPercentage: true,
                    roundingValue: 0,
                    roundingPercentage: 0,
                },
                legend: {
                    ...LEGEND,
                    ...LABEL_VP_ORDER,
                    roundingValue: 0,
                    roundingPercentage: 0,
                    showValue: true,
                    showPercentage: true,
                    position: 'bottom'
                }
            }
        },
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        table: {
            ...TABLE,
            useDialog: false,
            columnNames: {
                series: 'Series',
                value: 'Value',
                percentage: 'Percentage'
            },
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0,
                roundingPercentage: 0
            }
        }
    }

    const vue_ui_radar = {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        customPalette: [],
        useCssAnimation: false, // v2 = true
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                layout: {
                    plots: {
                        show: true,
                        radius: 2
                    },
                    outerPolygon: {
                        stroke: COLOR_GREY_MID,
                        strokeWidth: 1
                    },
                    dataPolygon: {
                        strokeWidth: 1,
                        transparent: false,
                        opacity: 20,
                        useGradient: true
                    },
                    grid: {
                        show: true,
                        stroke: COLOR_GRID,
                        strokeWidth: 0.5,
                        graduations: 5
                    },
                    labels: {
                        dataLabels: {
                            show: true,
                            fontSize: FONT._12,
                            color: COLOR_TEXT_PRIMARY
                        }
                    }
                },
                title: TITLE,
                tooltip: {
                    ...TOOLTIP,
                    showValue: true,
                    showPercentage: true,
                    roundingValue: 0,
                    roundingPercentage: 0,
                    animation: {
                        show: true,
                        animationFrames: 60
                    }
                },
                legend: {
                    ...LEGEND,
                    roundingPercentage: 0,
                    position: 'bottom'
                }
            }
        },
        table: {
            ...TABLE,
            useDialog: false,
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0,
                roundingPercentage: 0
            }
        },
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        translations: {
            target: 'Target',
            value: 'Value',
            datapoint: 'Datapoint'
        }
    }

    const vue_ui_quadrant = {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        customPalette: [],
        useCssAnimation: false, // v2 = true
        zoomAnimationFrames: 20,
        downsample: LTTB,
        style: {
            fontFamily: 'inherit',
            chart: {
                height: 512,
                width: 512,
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                layout: {
                    labels: {
                        quadrantLabels: {
                            show: true,
                            tl: {
                                text: '',
                                color: COLOR_TEXT_PRIMARY,
                                fontSize: FONT._16,
                                bold: true
                            },
                            tr: {
                                text: '',
                                color: COLOR_TEXT_PRIMARY,
                                fontSize: FONT._16,
                                bold: true
                            },
                            br: {
                                text: '',
                                color: COLOR_TEXT_PRIMARY,
                                fontSize: FONT._16,
                                bold: true
                            },
                            bl: {
                                text: '',
                                color: COLOR_TEXT_PRIMARY,
                                fontSize: FONT._16,
                                bold: true
                            }
                        },
                        plotLabels: {
                            showAsTag: false,
                            show: true,
                            fontSize: FONT._10,
                            color: COLOR_TEXT_PRIMARY,
                            offsetY: 8,
                            rounding: 0,
                            x: {
                                formatter: null
                            },
                            y: {
                                formatter: null
                            }
                        },
                        axisLabels: {
                            show: true,
                            fontSize: FONT._14,
                            color: {
                                positive: COLOR_TEXT_PRIMARY,
                                negative: COLOR_TEXT_PRIMARY
                            }
                        }
                    },
                    grid: {
                        stroke: COLOR_GRID,
                        strokeWidth: 1.5,
                        showArrows: true,
                        graduations: {
                            stroke: COLOR_GRID,
                            strokeWidth: 0.5,
                            show: true,
                            steps: 5,
                            fill: true,
                            color: COLOR_GRID,
                            roundingForce: 10
                        },
                        xAxis: {
                            min: -100,
                            max: 100,
                            auto: true,
                            name: ''
                        },
                        yAxis: {
                            min: -100,
                            max: 100,
                            auto: true,
                            name: ''
                        }
                    },
                    plots: {
                        radius: 6,
                        outline: true,
                        outlineColor: COLOR_WHITE,
                        outlineWidth: 1
                    },
                    areas: {
                        show: true,
                        opacity: 40,
                        useGradient: true
                    }
                },
                title: TITLE,
                tooltip: {
                    ...TOOLTIP,
                    roundingValue: 0,
                    showShape: true,
                },
                legend: {
                    ...LEGEND,
                    position: 'bottom'
                }
            }
        },
        table: {
            ...TABLE,
            useDialog: false,
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0
            }
        },
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            labels: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        translations: {
            category: 'Category',
            item: 'Item',
            side: 'Side'
        }
    }

    const vue_ui_gauge = {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        theme: '',
        customPalette: [],
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                animation: {
                    use: true,
                    speed: 1,
                    acceleration: 1
                },
                layout: {
                    radiusRatio: 1,
                    track: {
                        size: 1,
                        useGradient: true,
                        gradientIntensity: 20
                    },
                    markers: {
                        show: true,
                        color: COLOR_TEXT_PRIMARY,
                        bold: true,
                        fontSizeRatio: 1,
                        offsetY: 0,
                        roundingValue: 0,
                        formatter: null,
                        prefix: '',
                        suffix: '',
                    },
                    segmentSeparators: {
                        show: false,
                        offsetOut: 0,
                        offsetIn: 0,
                        stroke: COLOR_BLACK,
                        strokeWidth: 2
                    },
                    segmentNames: {
                        show: true,
                        curved: true,
                        offsetRatio: 1.1,
                        fontSize: FONT._16,
                        minFontSize: MIN_FONT_SIZE, // v3
                        useSerieColor: true,
                        color: COLOR_TEXT_PRIMARY,
                        bold: false,
                    },
                    indicatorArc: {
                        show: false,
                        radius: 123,
                        fill: COLOR_GRID,
                    },
                    pointer: {
                        show: true,
                        type: 'pointy',
                        size: 1,
                        stroke: COLOR_WHITE,
                        strokeWidth: 12,
                        useRatingColor: true,
                        color: COLOR_GREY_MID,
                        circle: {
                            radius: 10,
                            stroke: COLOR_BLACK,
                            strokeWidth: 2,
                            color: COLOR_WHITE
                        }
                    }
                },
                legend: {
                    show: true,
                    fontSize: FONT._48,
                    prefix: '',
                    suffix: '',
                    roundingValue: 1,
                    showPlusSymbol: true,
                    useRatingColor: true,
                    color: COLOR_TEXT_PRIMARY,
                    formatter: null
                },
                title: TITLE
            }
        },
        userOptions: USER_OPTIONS({
            pdf: true,
            img: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        translations: {
            base: 'Base'
        }
    }

    const vue_ui_wheel = {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        theme: '',
        layout: 'classic', // or '3d'
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                animation: {
                    use: true,
                    speed: 0.5,
                    acceleration: 1
                },
                layout: {
                    wheel: {
                        radiusRatio: 1,
                        tiltAngle3d: 50,
                        ticks: {
                            type: 'classic', // or 'arc'
                            rounded: true,
                            inactiveColor: COLOR_GRID,
                            activeColor: COLOR_BLUE,
                            sizeRatio: 0.9,
                            quantity: 100, // min: 12, max: 200
                            strokeWidth: 5,
                            stroke: 'transparent',
                            spacingRatio3d: 1,
                            shadeColorRatio3d: 0.15,
                            depth3d: 0,
                            gradient: {
                                show: true,
                                shiftHueIntensity: 100
                            }
                        }
                    },
                    innerCircle: {
                        show: true,
                        stroke: COLOR_GRID,
                        strokeWidth: 1,
                        radiusRatio: 1,
                    },
                    percentage: {
                        show: true,
                        fontSize: FONT._48,
                        rounding: 1,
                        bold: true,
                        formatter: null,
                        offsetX: 0,
                        offsetY: 0,
                        stroke: 'transparent',
                        strokeWidth: 0,
                    }
                },
                title: TITLE
            }
        },
        userOptions: USER_OPTIONS({
            pdf: true,
            img: true,
            fullscreen: true,
            annotator: true,
            svg: true
        })
    }

    const vue_ui_tiremarks = {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false, // v3
        theme: '',
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                width: 312, // v3
                height: 56, // v3
                animation: {
                    use: true,
                    speed: 0.5,
                    acceleration: 1
                },
                layout: {
                    display: 'horizontal',
                    crescendo: false,
                    curved: false,
                    curveAngleX: 10,
                    curveAngleY: 10,
                    activeColor: COLOR_BLUE,
                    inactiveColor: COLOR_GRID,
                    ticks: {
                        gradient: {
                            show: true,
                            shiftHueIntensity: 100
                        }
                    }
                },
                percentage: {
                    show: true,
                    useGradientColor: true,
                    color: COLOR_BLUE,
                    fontSize: FONT._16,
                    bold: true,
                    rounding: 1,
                    verticalPosition: POSITION.BOTTOM,
                    horizontalPosition: POSITION.LEFT,
                    formatter: null
                },
                title: TITLE
            }
        },
        userOptions: USER_OPTIONS({
            pdf: true,
            img: true,
            fullscreen: true,
            annotator: true,
            svg: true
        })
    }

    const vue_ui_chestnut = {
        debug: false, // v3
        loading: false, // v3
        theme: '',
        customPalette: [],
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                layout: {
                    grandTotal: {
                        show: true,
                        fontSize: FONT._20,
                        bold: true,
                        prefix: '',
                        suffix: '',
                        roundingValue: 0,
                        color: COLOR_TEXT_PRIMARY,
                        text: 'Grand total',
                        offsetY: 0,
                        formatter: null,
                    },
                    roots: {
                        stroke: COLOR_WHITE,
                        strokeWidth: 5,
                        useGradient: true,
                        gradientIntensity: 20,
                        underlayerColor: COLOR_WHITE,
                        labels: {
                            show: true,
                            fontSize: FONT._16,
                            adaptColorToBackground: true,
                            color: COLOR_WHITE,
                            bold: true,
                            roundingValue: 0,
                            prefix: '',
                            suffix: '',
                            formatter: null,
                            name: {
                                color: COLOR_TEXT_PRIMARY,
                                fontSize: FONT._16,
                                bold: true
                            }
                        }
                    },
                    verticalSeparator: {
                        stroke: COLOR_WHITE,
                        strokeWidth: 5
                    },
                    links: {
                        opacity: 10
                    },
                    branches: {
                        stroke: COLOR_WHITE,
                        strokeWidth: 0,
                        borderRadius: 6,
                        useGradient: true,
                        gradientIntensity: 20,
                        underlayerColor: COLOR_WHITE,
                        widthRatio: 1.5,
                        labels: {
                            show: true,
                            fontSize: FONT._14,
                            color: COLOR_TEXT_PRIMARY,
                            bold: true,
                            dataLabels: {
                                show: true,
                                hideUnderValue: 5,
                                fontSize: FONT._14,
                                roundingValue: 0,
                                roundingPercentage: 0,
                                prefix: '',
                                suffix: '',
                                formatter: null
                            }
                        }
                    },
                    nuts: {
                        offsetX: 20,
                        useGradient: true,
                        gradientIntensity: 30,
                        selected: {
                            useMotion: true,
                            useGradient: true,
                            gradientIntensity: 40,
                            roundingValue: 0,
                            roundingPercentage: 0,
                            labels: {
                                dataLabels: {
                                    hideUnderValue: 5,
                                    color: COLOR_TEXT_PRIMARY,
                                    fontSize: FONT._12,
                                    bold: true,
                                    prefix: '',
                                    suffix: '',
                                    formatter: null
                                },
                                core: {
                                    total: {
                                        color: COLOR_TEXT_PRIMARY,
                                        fontSize: FONT._24,
                                        bold: false
                                    },
                                    value: {
                                        color: COLOR_TEXT_PRIMARY,
                                        fontSize: FONT._24,
                                        bold: true,
                                        prefix: '',
                                        suffix: ''
                                    }
                                }
                            }
                        }
                    },
                    legend: {
                        fontSize: FONT._16,
                        color: COLOR_TEXT_PRIMARY,
                        roundingValue: 0,
                        roundingPercentage: 0,
                        prefix: '',
                        suffix: ''
                    },
                    title: {
                        ...TITLE,
                        offsetY: 0,
                        subtitle: {
                            ...TITLE.subtitle,
                            offsetY: 0
                        }
                    }
                }
            }
        },
        table: {
            ...TABLE,
            useDialog: false,
            th: {
                ...TABLE_TH,
                translations: {
                    rootName: "root name",
                    rootValue: "root value",
                    rootToTotal: "%/total",
                    branchName: "branch name",
                    branchValue: "branch value",
                    branchToRoot: "%/root",
                    branchToTotal: "%/total",
                    nutName: "nut name",
                    nutValue: "nut value",
                    nutToBranch: "%/branch",
                    nutToRoot: "%/root",
                    nutToTotal: "%/total"
                }
            },
            td: {
                ...TABLE_TD,
                roundingValue: 0,
                roundingPercentage: 0
            }
        },
        userOptions: USER_OPTIONS({
            pdf: true,
            csv: true,
            img: true,
            table: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        translations: {
            total: 'Total',
            proportionToTree: 'of grand total',
            of: 'of'
        }
    }

    const vue_ui_onion = {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        customPalette: [],
        useCssAnimation: false, // v2 = true
        useStartAnimation: true,
        useBlurOnHover: true,
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                useGradient: true,
                gradientIntensity: 20,
                layout: {
                    maxThickness: 64,
                    gutter: {
                        color: COLOR_GRID,
                        width: 0.62
                    },
                    track: {
                        width: 0.62
                    },
                    labels: {
                        ...LABEL_VP_ORDER,
                        show: true,
                        fontSize: FONT._14,
                        minFontSize: MIN_FONT_SIZE, // v3
                        color: COLOR_TEXT_PRIMARY,
                        roundingValue: 0,
                        roundingPercentage: 0,
                        bold: true,
                        offsetX: 0,
                        offsetY: 0,
                        value: {
                            show: true,
                            formatter: null
                        },
                        percentage: {
                            show: true
                        }
                    }
                },
                title: TITLE,
                legend: {
                    ...LEGEND,
                    ...LABEL_VP_ORDER,
                    roundingValue: 0,
                    roundingPercentage: 0,
                    showValue: true,
                    showPercentage: true,
                    position: 'bottom'
                },
                tooltip: {
                    ...TOOLTIP,
                    ...LABEL_VP_ORDER,
                    showValue: true,
                    showPercentage: true,
                    roundingValue: 0,
                    roundingPercentage: 0
                }
            }
        },
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        table: {
            ...TABLE,
            useDialog: false,
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0,
                roundingPercentage: 0
            },
            translations: {
                value: 'Value',
                percentage: 'Percentage',
                serie: 'Serie'
            }
        }
    }

    const vue_ui_vertical_bar = { // v3 renamed to _horizontal_ (yet still works)
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false, // v3
        loading: false, // v3
        autoSize: true, // Legacy - removed
        responsive: false,
        theme: '',
        customPalette: [],
        useCssAnimation: false, // v3 (v2 = true)
        events: {
            datapointEnter: null,
            datapointLeave: null,
            datapointClick: null
        },
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                width: 512,
                height: 316,
                layout: {
                    bars: {
                        sort: SORT.DESC,
                        useStroke: false,
                        strokeWidth: 2,
                        height: 32, // legacy - unused now
                        gap: 6,
                        borderRadius: 4,
                        offsetX: 12,
                        paddingRight: 0,
                        useGradient: true,
                        gradientIntensity: 20,
                        fillOpacity: 90,
                        underlayerColor: COLOR_WHITE,
                        dataLabels: {
                            color: COLOR_TEXT_PRIMARY,
                            bold: true,
                            fontSize: FONT._14, // v3 increased
                            value: {
                                show: true,
                                roundingValue: 0,
                                prefix: '',
                                suffix: '',
                                formatter: null
                            },
                            percentage: {
                                show: true,
                                roundingPercentage: 0
                            },
                            offsetX: 0
                        },
                        nameLabels: {
                            show: true,
                            color: COLOR_TEXT_PRIMARY,
                            bold: false,
                            fontSize: FONT._14, // v3 increased
                            offsetX: 0
                        },
                        parentLabels: {
                            show: true,
                            color: COLOR_TEXT_PRIMARY,
                            bold: false,
                            fontSize: FONT._14, // v3 increased
                            offsetX: 0,
                            paddingBottom: 0,
                        }
                    },
                    highlighter: {
                        color: COLOR_BLACK,
                        opacity: 5
                    },
                    separators: {
                        show: false,
                        color: COLOR_GRID,
                        strokeWidth: 1,
                        fullWidth: true,
                    }
                },
                title: TITLE,
                legend: {
                    ...LEGEND,
                    position: POSITION.TOP,
                    roundingValue: 0,
                    roundingPercentage: 0,
                    prefix: '',
                    suffix: ''
                },
                tooltip: {
                    ...TOOLTIP,
                    showValue: true,
                    showPercentage: true,
                    roundingValue: 0,
                    roundingPercentage: 0,
                    prefix: '',
                    suffix: ''
                }
            }
        },
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            sort: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        table: {
            ...TABLE,
            useDialog: false,
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0,
                roundingPercentage: 0,
                prefix: '',
                suffix: ''
            }
        },
        translations: {
            parentName: "Serie",
            childName: "Child",
            value: "value",
            percentageToTotal: "%/total",
            percentageToSerie: "%/serie"
        }
    }

    const vue_ui_horizontal_bar = vue_ui_vertical_bar;

    const vue_ui_heatmap = {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false, // v3
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null // v3
        },
        theme: '',
        style: {
            fontFamily: 'inherit',
            backgroundColor: COLOR_BACKGROUND,
            color: COLOR_TEXT_PRIMARY,
            layout: {
                height: 300, // v3
                width: 1000, // v3
                padding: PADDING([0, 0, 0, 0]),
                crosshairs: {
                    show: false,
                    stroke: COLOR_BLACK,
                    strokeWidth: 1,
                    strokeDasharray: 0,
                },
                cells: {
                    // height: 36, // v3 deprecated
                    rowTotal: {
                        value: {
                            show: false,
                        },
                        color: {
                            show: false
                        }
                    },
                    columnTotal: {
                        value: {
                            show: false,
                            rotation: 0,
                            autoRotate: { // v3
                                enable: true, // v3
                                angle: -30, // v3
                            },
                            offsetX: 0,
                            offsetY: 0
                        },
                        color: {
                            show: false
                        },
                    },
                    value: {
                        show: false,
                        fontSize: FONT._18,
                        bold: false,
                        roundingValue: 0,
                        color: COLOR_TEXT_PRIMARY,
                        formatter: null
                    },
                    colors: {
                        hot: COLOR_RED,
                        cold: COLOR_BLUE,
                        underlayer: COLOR_WHITE
                    },
                    spacing: 2,
                    selected: {
                        border: 4,
                        color: COLOR_BLACK
                    }
                },
                dataLabels: {
                    prefix: '',
                    suffix: '',
                    xAxis: {
                        show: true,
                        values: [],
                        datetimeFormatter: AXIS_DATE_FORMATTER,
                        showOnlyAtModulo: null,
                        rotation: 0,
                        autoRotate: { // v3
                            enable: true, // v3
                            angle: -30, // v3
                        },
                        fontSize: FONT._10,
                        color: COLOR_TEXT_PRIMARY,
                        bold: false,
                        offsetX: 0,
                        offsetY: 0
                    },
                    yAxis: {
                        show: true,
                        values: [],
                        datetimeFormatter: AXIS_DATE_FORMATTER,
                        fontSize: FONT._10,
                        color: COLOR_TEXT_PRIMARY,
                        bold: false,
                        offsetX: 0,
                        offsetY: 0
                    }
                }
            },
            title: TITLE,
            legend: {
                ...LEGEND,
                fontSize: FONT._12,
                roundingValue: 0,
                width: 24,
                // position: POSITION.RIGHT, // v3 deprecated
                // scaleBorderRadius: 18 // v3 deprecated
            },
            tooltip: {
                ...TOOLTIP,
                roundingValue: 0
            }
        },
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        table: {
            ...TABLE,
            useDialog: false,
            colNames: {
                xAxis: 'X'
            },
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0
            }
        }
    }

    const vue_ui_scatter = {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        events: {
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        customPalette: [],
        useCssAnimation: false, // v2 = true
        downsample: LTTB,
        usePerformanceMode: false,
        style: {
            fontFamily: 'inherit',
            backgroundColor: COLOR_BACKGROUND,
            color: COLOR_TEXT_PRIMARY,
            layout: {
                height: 316,
                width: 512,
                padding: PADDING([0, 0, 0, 0]), // v3 modification
                axis: {
                    show: true,
                    stroke: COLOR_GRID,
                    strokeWidth: 1
                },
                marginalBars: {
                    show: false,
                    size: 40,
                    tranches: 20,
                    opacity: 0.6,
                    fill: COLOR_BLACK,
                    strokeWidth: 1,
                    offset: 20,
                    borderRadius: 2,
                    useGradient: true,
                    showLines: false,
                    linesStrokeWidth: 1,
                    highlighter: {
                        show: true,
                        opacity: 0.1,
                        color: COLOR_BLACK,
                        stroke: COLOR_BLACK,
                        strokeWidth: 0.5,
                        strokeDasharray: 2,
                        highlightBothAxes: false,
                    }
                },
                plots: {
                    radius: 2,
                    stroke: COLOR_WHITE,
                    strokeWidth: 0.3,
                    opacity: 0.6,
                    significance: {
                        show: true,
                        useDistanceOpacity: false,
                        deviationThreshold: 10,
                        opacity: 0.3
                    },
                    deviation: {
                        translation: 'deviation',
                        roundingValue: 1
                    },
                    giftWrap: {
                        show: false,
                        strokeWidth: 1,
                        strokeDasharray: 0,
                        fillOpacity: 0.2
                    },
                    selectors: {
                        show: true,
                        stroke: COLOR_BLACK,
                        strokeWidth: 0.7,
                        strokeDasharray: 0,
                        labels: {
                            fontSize: FONT._12,
                            color: COLOR_TEXT_PRIMARY,
                            rounding: 2,
                            bold: false,
                            showName: true,
                            prefix: '',
                            suffix: '',
                            x: {
                                formatter: null
                            },
                            y: {
                                formatter: null
                            }
                        },
                        markers: {
                            radius: 1.5,
                            stroke: COLOR_WHITE,
                            strokeWidth: 0.5,
                            fill: COLOR_BLACK
                        }
                    }
                },
                correlation: {
                    show: true,
                    strokeDasharray: 2,
                    strokeWidth: 1,
                    label: {
                        show: true,
                        fontSize: FONT._12,
                        color: COLOR_TEXT_PRIMARY,
                        bold: true,
                        roundingValue: 2,
                        useSerieColor: true
                    }
                },
                dataLabels: {
                    xAxis: {
                        name: '',
                        show: true,
                        fontSize: FONT._10,
                        color: COLOR_TEXT_PRIMARY,
                        bold: false,
                        offsetX: 0,
                        offsetY: 0,
                        roundingValue: 0
                    },
                    yAxis: {
                        name: '',
                        show: true,
                        fontSize: FONT._10,
                        color: COLOR_TEXT_PRIMARY,
                        bold: false,
                        offsetX: 0,
                        offsetY: 0,
                        roundingValue: 0
                    }
                }
            },
            title: TITLE,
            legend: {
                ...LEGEND,
                roundingValue: 0,
                position: 'bottom'
            },
            tooltip: {
                ...TOOLTIP,
                roundingValue: 2,
                showShape: true,
                prefix: '',
                suffix: ''
            }
        },
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        table: {
            ...TABLE,
            useDialog: false,
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 2,
                roundingAverage: 1
            },
            translations: {
                correlationCoefficient: "Correlation Coef.",
                nbrPlots: "Nbr plots",
                average: "Average",
                series: "Series"
            }
        }
    }

    const vue_ui_candlestick = {
        skeletonDataset: null,
        skeletonConfig: null,
        type: 'candlestick', // or 'ohlc'
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        responsiveProportionalSizing: true,
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        useCssAnimation: false, // v3 (v2 = true)
        style: {
            fontFamily: 'inherit',
            backgroundColor: COLOR_BACKGROUND,
            color: COLOR_TEXT_PRIMARY,
            height: 316,
            width: 512,
            layout: {
                padding: PADDING([0, 0, 0, 0]),
                selector: {
                    color: COLOR_GRID,
                    opacity: 10
                },
                grid: {
                    show: true,
                    stroke: COLOR_GRID,
                    strokeWidth: 0.5,
                    verticalLines: {
                        show: false,
                        strokeDasharray: 0,
                        strokeWidth: 0.5,
                        stroke: COLOR_GRID 
                    },
                    horizontalLines: {
                        show: false,
                        strokeDasharray: 0,
                        strokeWidth: 0.5,
                        stroke: COLOR_GRID
                    },
                    xAxis: {
                        ticks: {
                            show: true,
                        },
                        dataLabels: {
                            show: true,
                            fontSize: FONT._10,
                            color: COLOR_TEXT_PRIMARY,
                            offsetY: 0,
                            bold: false,
                            rotation: 0,
                            autoRotate: { // v3
                                enable: true, // v3
                                angle: -30 // v3
                            },
                            datetimeFormatter: AXIS_DATE_FORMATTER,
                            showOnlyFirstAndLast: false,
                            showOnlyAtModulo: false,
                            modulo: 12
                        },
                    },
                    yAxis: {
                        scale: {
                            min: null,
                            max: null,
                        },
                        dataLabels: {
                            show: true,
                            fontSize: FONT._12,
                            color: COLOR_TEXT_PRIMARY,
                            roundingValue: 0,
                            offsetX: 0,
                            bold: false,
                            steps: 10,
                            prefix: '',
                            suffix: '',
                        }
                    }
                },
                wick: {
                    stroke: COLOR_BLACK,
                    strokeWidth: 0.5,
                    extremity: {
                        shape: SHAPE.LINE,
                        size: 'auto',
                        color: COLOR_BLACK
                    }
                },
                candle: {
                    borderRadius: 1,
                    stroke: COLOR_BLACK,
                    strokeWidth: 0.5,
                    colors: {
                        bearish: COLOR_RED,
                        bullish: COLOR_GREEN
                    },
                    gradient: {
                        show: true,
                        underlayer: COLOR_WHITE
                    },
                    widthRatio: 0.5
                }
            },
            zoom: {
                ...ZOOM,
                minimap: MINIMAP_BASE,
                preview: {
                    enable: true,
                    fill: '#CCCCCC50',
                    stroke: '#6A6A6A',
                    strokeWidth: 2,
                    strokeDasharray: 0,
                },
                useDefaultFormat: true,
                timeFormat: 'yyyy-MM-dd HH:mm:ss', // When datetimeFormatter is enabled and useDefaultFormat is false
                customFormat: null // overrides all if callback => string
            },
            title: TITLE,
            tooltip: {
                ...TOOLTIP,
                roundingValue: 0,
                prefix: '',
                suffix: '',
                showChart: true,
                useDefaultTimeFormat: true,
                timeFormat: 'yyyy-MM-dd HH:mm:ss' // When datetimeFormatter is enabled and useDefaultFormat is false
            }
        },
        translations: {
            period: "Period",
            open: "Open",
            high: "High",
            low: "Low",
            last: "Close",
            volume: "Volume"
        },
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        table: {
            ...TABLE,
            th: TABLE_TH,
            useDialog: false,
            td: {
                ...TABLE_TD,
                roundingValue: 2,
                prefix: '',
                suffix: ''
            }
        }
    }

    const vue_ui_sparkline = {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false, // v3
        loading: false, // v3
        theme: '',
        responsive: false,
        type: SHAPE.LINE,
        downsample: LTTB,
        gradientPath: {
            show: false,
            segments: 256,
            colors: {
                high: '#34eb96',
                low: '#eb4034',
            }
        },
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null // v3
        },
        style: {
            chartWidth: 290,
            animation: {
                show: true,
                animationFrames: 360
            },
            padding: PADDING([12, 12, 3, 0]),
            fontFamily: 'inherit',
            backgroundColor: COLOR_BACKGROUND,
            scaleMin: null,
            scaleMax: null,
            line: {
                color: COLOR_BLUE,
                strokeWidth: 3,
                smooth: false,
                pulse: {
                    show: false,
                    loop: true,
                    color: COLOR_WHITE,
                    durationMs: 4000,
                    easing: 'ease-in-out',
                    radius: 2,
                    cubicBezier: [0.45, 0.45, 0.55, 0.55],
                    trail: {
                        show: false,
                        length: 6,
                        opacity: 0.75,
                    }
                },
            },
            bar: {
                borderRadius: 3,
                color: COLOR_BLUE
            },
            zeroLine: {
                color: COLOR_BLACK,
                strokeWidth: 1
            },
            plot: {
                show: true,
                radius: 4,
                stroke: COLOR_WHITE,
                strokeWidth: 1
            },
            verticalIndicator: {
                show: true,
                strokeWidth: 1.5,
                color: COLOR_BLUE,
                strokeDasharray: 3
            },
            dataLabel: {
                show: true,
                position: POSITION.LEFT,
                offsetX: 0,
                offsetY: 0,
                fontSize: FONT._20,
                bold: true,
                color: COLOR_TEXT_PRIMARY,
                roundingValue: 0,
                valueType: 'latest',
                prefix: '',
                suffix: '',
                formatter: null,
                datetimeFormatter: AXIS_DATE_FORMATTER // v3
            },
            title: {
                show: true,
                textAlign: POSITION.LEFT,
                color: COLOR_TEXT_PRIMARY,
                fontSize: FONT._16,
                bold: true,
                text: ''
            },
            tooltip: {
                show: false,
                fontSize: FONT._14,
                color: COLOR_TEXT_PRIMARY,
                backgroundColor: COLOR_BACKGROUND,
                offsetY: 0,
                borderWidth: 0,
                borderColor: COLOR_BORDER,
                borderRadius: 2,
                backgroundOpacity: 100
            },
            area: {
                show: true,
                useGradient: true,
                opacity: 30,
                color: COLOR_BLUE
            }
        }
    }

    const vue_ui_sparkbar = {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false, // v3
        loading: false, // v3
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        customPalette: [],
        style: {
            fontFamily: 'inherit',
            backgroundColor: COLOR_BACKGROUND,
            animation: {
                show: true,
                animationFrames: 60
            },
            layout: {
                independant: true,
                percentage: true,
                target: 0,
                showTargetValue: false,
                targetValueText: ''
            },
            gutter: {
                backgroundColor: COLOR_GRID,
                opacity: 100
            },
            bar: {
                gradient: {
                    show: true,
                    intensity: 40,
                    underlayerColor: COLOR_WHITE
                }
            },
            labels: {
                fontSize: FONT._16,
                name: {
                    position: 'top-left',
                    width: '100%',
                    color: COLOR_TEXT_PRIMARY,
                    bold: false
                },
                value: {
                    show: true,
                    bold: true
                }
            },
            title: {
                text: '',
                color: COLOR_TEXT_PRIMARY,
                fontSize: FONT._16,
                bold: true,
                textAlign: POSITION.LEFT,
                margin: '0 0 6px 0',
                subtitle: { 
                    color: COLOR_TEXT_SECONDARY,
                    text: '', 
                    fontSize: FONT._12, 
                    bold: false 
                },
            },
            gap: 4
        }
    }

    const vue_ui_sparkstackbar = {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false, // v3
        loading: false, // v3
        useCursorPointer: false,
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        customPalette: [],
        style: {
            fontFamily: 'inherit',
            backgroundColor: COLOR_BACKGROUND,
            animation: {
                show: true,
                animationFrames: 60
            },
            bar: {
                gradient: {
                    show: true,
                    intensity: 40,
                    underlayerColor: COLOR_WHITE
                }
            },
            legend: {
                show: true,
                textAlign: POSITION.LEFT,
                fontSize: FONT._12,
                margin: '6px 0 0 0',
                name: {
                    color: COLOR_TEXT_PRIMARY,
                    bold: false
                },
                value: {
                    show: true,
                    bold: false,
                    color: COLOR_TEXT_PRIMARY,
                    prefix: '',
                    suffix: '',
                    rounding: 0,
                    formatter: null
                },
                percentage: {
                    show: true,
                    bold: true,
                    color: COLOR_TEXT_PRIMARY,
                    rounding: 1
                },
                selectAllToggle: {
                    show: false,
                    backgroundColor: COLOR_BORDER,
                    color: COLOR_TEXT_PRIMARY
                }
            },
            title: {
                ...TITLE,
                textAlign: POSITION.LEFT,
                margin: '0 0 6px 0'
            },
            tooltip: {
                ...TOOLTIP
            }
        }
    }

    const vue_ui_sparkhistogram = {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false, // v3
        events: {
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        style: {
            fontFamily: 'inherit',
            backgroundColor: COLOR_BACKGROUND,
            animation: {
                show: true,
                speedMs: 500
            },
            layout: {
                height: 96,
                width: 640,
                padding: PADDING([24, 0, 36, 0])
            },
            bars: {
                shape: SHAPE.SQUARE,
                strokeWidth: 0,
                colors: {
                    positive: COLOR_BLUE,
                    negative: COLOR_RED,
                    gradient: {
                        show: true
                    }
                },
                borderRadius: 24,
                gap: 12
            },
            labels: {
                value: {
                    show: true,
                    fontSize: FONT._14,
                    minFontSize: MIN_FONT_SIZE, // v3
                    color: COLOR_TEXT_PRIMARY,
                    bold: true,
                    rounding: 1,
                    prefix: '',
                    suffix: '',
                    offsetY: 0,
                    formatter: null,
                },
                valueLabel: {
                    show: true,
                    fontSize: FONT._14,
                    minFontSize: MIN_FONT_SIZE, // v3
                    color: COLOR_TEXT_PRIMARY,
                    bold: false,
                    rounding: 0,
                },
                timeLabel: {
                    show: true,
                    fontSize: FONT._12,
                    minFontSize: MIN_FONT_SIZE, // v3
                    color: COLOR_TEXT_PRIMARY,
                    bold: false,
                }
            },
            selector: {
                stroke: COLOR_BLUE,
                fill: '#2D353C10',
                strokeWidth: 2,
                strokeDasharray: 0,
                borderRadius: 2
            },
            title: {
                text: '',
                color: COLOR_TEXT_PRIMARY,
                fontSize: FONT._16,
                bold: true,
                textAlign: POSITION.LEFT,
                subtitle: { 
                    color: COLOR_TEXT_SECONDARY,
                    text: '', 
                    fontSize: FONT._12, 
                    bold: false 
                },
                margin: '0 0 6px 0',
            }
        }
    }

    const vue_ui_sparkgauge = {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false, // v3
        loading: false, // v3
        theme: '',
        style: {
            fontFamily: 'inherit',
            background: COLOR_WHITE,
            height: 84,
            basePosition: 72,
            animation: {
                show: true,
                speedMs: 150
            },
            title: {
                show: true,
                fontSize: FONT._12,
                position: POSITION.TOP,
                textAlign: POSITION.CENTER,
                bold: false,
                color: COLOR_TEXT_PRIMARY
            },
            dataLabel: {
                fontSize: FONT._20,
                autoColor: true,
                color: COLOR_TEXT_PRIMARY,
                offsetY: 0,
                bold: true,
                rounding: 0,
                prefix: '',
                suffix: '',
                formatter: null
            },
            colors: {
                min: COLOR_RED,
                max: COLOR_GREEN,
                showGradient: true
            },
            track: {
                autoColor: true,
                color: COLOR_BLUE,
                strokeLinecap: SHAPE.ROUND
            },
            gutter: {
                color: COLOR_GRID,
                strokeLinecap: SHAPE.ROUND
            }
        }
    }

    const vue_ui_spark_trend = {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false, // v3
        theme: '',
        downsample: LTTB,
        style: {
            fontFamily: 'inherit',
            backgroundColor: COLOR_BACKGROUND,
            height: 80,
            width: 300,
            animation: {
                show: true,
                animationFrames: 20
            },
            line: {
                stroke: COLOR_BLACK,
                strokeWidth: 2,
                strokeLinecap: SHAPE.ROUND,
                strokeLinejoin: SHAPE.ROUND,
                smooth: true,
                useColorTrend: true
            },
            area: {
                show: true,
                useGradient: true,
                opacity: 20
            },
            dataLabel: {
                show: true,
                useColorTrend: true,
                color: COLOR_TEXT_PRIMARY,
                fontSize: FONT._14,
                bold: false,
                prefix: '',
                suffix: '',
                rounding: 0,
                formatter: null
            },
            trendLabel: {
                trendType: 'global',
                useColorTrend: true,
                color: COLOR_TEXT_PRIMARY,
                fontSize: FONT._14,
                bold: true,
                rounding: 0
            },
            arrow: {
                colors: {
                    positive: COLOR_GREEN,
                    neutral: COLOR_GREY,
                    negative: COLOR_RED
                }
            },
            padding: PADDING([12, 12, 12, 82])
        }
    }

    const vue_ui_quick_chart = {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false, // v3
        loading: false, // v3
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        responsive: false,
        theme: '',
        axisLabelsFontSize: FONT._12,
        backgroundColor: COLOR_BACKGROUND,
        barGap: 12,
        barAnimated: true,
        barStrokeWidth: 1,
        blurOnHover: true,
        chartIsBarUnderDatasetLength: 6,
        color: COLOR_TEXT_PRIMARY,
        customPalette: [],
        dataLabelFontSize: FONT._14,
        dataLabelRoundingPercentage: 1,
        dataLabelRoundingValue: 0,
        donutHideLabelUnderPercentage: 3,
        donutCurvedMarkers: true, // v3
        donutLabelMarkerStrokeWidth: 1,
        donutRadiusRatio: 0.4,
        donutShowTotal: true,
        donutStrokeWidth: 2,
        donutStroke: COLOR_BACKGROUND,
        donutThicknessRatio: 0.18,
        donutTotalLabelFontSize: FONT._24,
        donutTotalLabelOffsetY: 0,
        donutTotalLabelText: 'Total',
        donutUseShadow: false,
        donutShadowColor: COLOR_BLACK,
        fontFamily: 'inherit',
        formatter: null,
        height: 338,
        legendFontSize: FONT._12,
        legendIcon: 'circleFill',
        legendIconSize: FONT._12,
        legendPosition: 'bottom',
        showLegendSelectAllToggle: false,
        legendSelectAllToggleBackgroundColor: COLOR_BORDER,
        legendSelectAllToggleColor: COLOR_TEXT_PRIMARY,
        lineAnimated: true,
        lineSmooth: true,
        lineStrokeWidth: 2,
        paletteStartIndex: 0,
        showDataLabels: true,
        showLegend: true,
        showTooltip: true,
        showUserOptions: true,
        userOptionsPosition: 'right',
        showUserOptionsOnChartHover: false,
        keepUserOptionsStateOnChartLeave: true,
        useCursorPointer: false,
        userOptionsButtons: {
            tooltip: true,
            pdf: true,
            img: true,
            fullscreen: true,
            annotator: true,
            svg: true,
            altCopy: false,
        },
        userOptionsButtonTitles: {
            open: 'Open options',
            close: 'Close options',
            tooltip: 'Toggle tooltip',
            pdf: 'Download PDF',
            img: 'Download PNG',
            fullscreen: 'Toggle fullscreen',
            annotator: 'Toggle annotator',
            svg: 'Download SVG',
            altCopy: 'Copy alt text'
        },
        userOptionsPrint: {
            overflowTolerance: 0.2,
            orientation: 'auto',
            scale: 2,
        },
        userOptionsCallbacks: {
            tooltip: null,
            pdf: null,
            img: null,
            fullscreen: null,
            annotator: null,
            svg: null
        },
        title: '',
        titleBold: true,
        titleFontSize: FONT._16,
        titleTextAlign: 'center',
        tooltipTeleportTo: 'body',
        tooltipCustomFormat: null,
        tooltipBackgroundOpacity: 100,
        tooltipBorderRadius: 4,
        tooltipBorderColor: COLOR_GREY_LIGHT,
        tooltipBorderWidth: 1,
        tooltipFontSize: FONT._14,
        tooltipPosition: POSITION.CENTER,
        tooltipOffsetY: 24,
        tooltipSmooth: true,
        tooltipSmoothForce: 0.18,
        tooltipSmoothSnapThreshold: 0.25,
        tooltipBackdropFilter: true,
        useCustomLegend: false,
        valuePrefix: '',
        valueSuffix: '',
        width: 512,
        xAxisLabel: '',
        xyAxisStroke: COLOR_GRID,
        xyAxisStrokeWidth: 1,
        xyGridStroke: COLOR_GRID,
        xyGridStrokeWidth: 0.5,
        xyHighlighterColor: COLOR_BLACK,
        xyHighlighterOpacity: 0.05,
        xyLabelsXFontSize: FONT._10,
        xyLabelsYFontSize: FONT._12,
        xyPaddingBottom: 12,
        xyPaddingLeft: 12,
        xyPaddingRight: 12,
        xyPaddingTop: 12,
        xyPeriodLabelsRotation: 0,
        xyPeriodLabelsAutoRotate: { // v3
            enable: true, // v3
            angle: -30, // v3
        },
        xyPeriods: [],
        datetimeFormatter: AXIS_DATE_FORMATTER,
        xyPeriodsShowOnlyAtModulo: false,
        xyPeriodsModulo: 12,
        xyScaleSegments: 15,
        xyShowAxis: true,
        xyShowGrid: true,
        xyShowScale: true,
        yAxisLabel: '',
        zoomXy: true,
        zoomColor: COLOR_GREY_MID,
        zoomHighlightColor: COLOR_GREY_DARK,
        zoomFontSize: FONT._14,
        zoomUseResetSlot: false,
        zoomMinimap: MINIMAP,
        zoomStartIndex: null,
        zoomEndIndex: null,
        zoomEnableRangeHandles: true,
        zoomEnableSelectionDrag: true,
        zoomFocusOnDrag: false,
        zoomFocusRangeRatio: 0.2,
        zoomMaxWidth: null
    }

    const vue_ui_age_pyramid = {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null // v3
        },
        theme: '',
        style: {
            fontFamily: 'inherit',
            backgroundColor: COLOR_BACKGROUND,
            color: COLOR_TEXT_PRIMARY,
            height: 500,
            width: 500,
            layout: {
                padding: PADDING([12, 12, 36, 12]),
                grid: {
                    show: true,
                    stroke: COLOR_GRID,
                    strokeWidth: 1
                },
                dataLabels: {
                    sideTitles: {
                        show: true,
                        fontSize: FONT._18,
                        color: COLOR_TEXT_PRIMARY,
                        useSideColor: true,
                        bold: false,
                        offsetY: 0
                    },
                    xAxis: {
                        show: true,
                        fontSize: FONT._12,
                        color: COLOR_TEXT_PRIMARY,
                        bold: false,
                        scale: 1000,
                        translation: 'in thousands',
                        formatter: null,
                        rotation: 0, // v3
                        autoRotate: { // v3
                            enable: true, // v3
                            angle: -30 // v3
                        }
                    },
                    yAxis: {
                        show: true,
                        display: 'age',
                        fontSize: FONT._12,
                        color: COLOR_TEXT_PRIMARY,
                        bold: false,
                        showEvery: 5,
                        formatter: null
                    }
                },
                centerSlit: {
                    width: 20
                },
                bars: {
                    gap: 2,
                    borderRadius: 2,
                    left: {
                        color: COLOR_RED
                    },
                    right: {
                        color: COLOR_BLUE
                    },
                    gradient: {
                        show: true,
                        underlayer: COLOR_WHITE,
                        intensity: 60,
                        shiftHue: 0.05
                    }
                }
            },
            highlighter: {
                color: COLOR_BLACK,
                opacity: 5
            },
            title: TITLE,
            tooltip: {
                ...TOOLTIP,
                roundingValue: 0
            }
        },
        translations: {
            age: 'age',
            male: 'male',
            female: 'female',
            total: 'total',
            year: 'year'
        },
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        table: {
            ...TABLE,
            useDialog: false,
            th: TABLE_TH,
            td: TABLE_TD
        }
    }

    const vue_ui_relation_circle = {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        responsiveProportionalSizing: true,
        theme: '',
        customPalette: [],
        style: {
            fontFamily: 'inherit',
            backgroundColor: COLOR_BACKGROUND,
            color: COLOR_TEXT_PRIMARY,
            size: 400,
            limit: 50,
            animation: {
                show: true,
                speedMs: 300
            },
            labels: {
                color: COLOR_TEXT_PRIMARY,
                fontSize: FONT._14,
                minFontSize: MIN_FONT_SIZE, // v3
            },
            weightLabels: {
                size: 8,
                show: true,
                formatter: null,
                prefix: '',
                suffix: '',
                rounding: 0
            },
            links: {
                curved: false,
                maxWidth: 3
            },
            circle: {
                radiusProportion: 0.2,
                stroke: COLOR_GREY_MID,
                strokeWidth: 1,
                offsetY: 0
            },
            plot: {
                radius: 3,
                useSerieColor: true,
                color: COLOR_BLACK
            },
            title: TITLE
        },
        userOptions: USER_OPTIONS({
            pdf: true,
            img: true,
            fullscreen: true,
            annotator: true,
            svg: true
        })
    }

    const vue_ui_thermometer = {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false, // v3
        theme: '',
        customPalette: [],
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                height: 360,
                width: 256, // v3
                thermometer: {
                    width: 48
                },
                padding: {
                    // v3 left and right are deprecated
                    top: 12,
                    bottom: 12,
                },
                graduations: {
                    show: true,
                    sides: 'both',
                    height: 2,
                    stroke: COLOR_GRID,
                    strokeWidth: 1,
                    showIntermediate: true,
                    gradient: {
                        show: true,
                        intensity: 20
                    }
                },
                animation: {
                    use: true,
                    speedMs: 1000
                },
                label: {
                    show: true, // v3
                    fontSize: FONT._20,
                    minFontSize: MIN_FONT_SIZE, // v3
                    rounding: 1,
                    bold: true,
                    color: COLOR_TEXT_PRIMARY,
                    prefix: '',
                    suffix: '',
                    formatter: null
                }
            },
            title: TITLE,
        },
        userOptions: USER_OPTIONS({
            pdf: true,
            img: true,
            fullscreen: true,
            annotator: true,
            svg: true
        })
    }

    const vue_ui_rings = {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        events: {
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        customPalette: [],
        useCssAnimation: false, // v2 = true
        useBlurOnHover: true,
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                size: 360,
                layout: {
                    labels: {
                        dataLabels: {
                            ...LABEL_VP_ORDER,
                            prefix: '',
                            suffix: '',
                            formatter: null,
                            show: false,
                            offsetX: 0,
                            fontSize: 10,
                            color: COLOR_TEXT_PRIMARY,
                            bold: false,
                            roundingValue: 0,
                            roundingPercentage: 0,
                            showValue: true,
                            showPercentage: true,
                            // Markers are applied when labels are enabled
                            markers: {
                                stroke: '#8A8A8A',
                                strokeWidth: 1,
                                radius: 3,
                                position: 'right'
                            }
                        }
                    },
                    rings: {
                        strokeWidth: 2,
                        stroke: COLOR_GRID,
                        gradient: {
                            show: true,
                            intensity: 40,
                            underlayerColor: COLOR_WHITE
                        },
                        useShadow: true
                    }
                },
                legend: {
                    ...LEGEND,
                    roundingValue: 0,
                    roundingPercentage: 0,
                    showValue: true,
                    showPercentage: true,
                    position: 'bottom'
                },
                title: TITLE,
                tooltip: {
                    ...TOOLTIP,
                    showValue: true,
                    showPercentage: true,
                    roundingValue: 0,
                    roundingPercentage: 0
                }
            }
        },
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            fullscreen: true,
            annotator: true,
            svg: true,
            labels: true,
        }),
        table: {
            ...TABLE,
            useDialog: false,
            columnNames: {
                series: 'Series',
                value: 'Value',
                percentage: 'Percentage'
            },
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0,
                roundingPercentage: 0
            }
        }
    }

    const vue_ui_donut_evolution = {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false, // v3
        theme: '',
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        customPalette: [],
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                zoom: ZOOM,
                donuts: {
                    hover: {
                        hideLabelsUnderValue: 5,
                    },
                },
                dialog: {
                    show: true,
                    backgroundColor: COLOR_BACKGROUND,
                    color: COLOR_TEXT_PRIMARY,
                    header: {
                        backgroundColor: COLOR_BACKGROUND,
                        color: COLOR_TEXT_PRIMARY
                    },
                    donutChart: {
                        ...vue_ui_donut,
                        responsive: true,
                        userOptions: {
                            ...vue_ui_donut.userOptions,
                            buttons: {
                                ...vue_ui_donut.userOptions.buttons,
                                pdf: false,
                            }
                        },
                        style: {
                            ...vue_ui_donut.style,
                            chart: {
                                ...vue_ui_donut.style.chart,
                                layout: {
                                    ...vue_ui_donut.style.chart.layout,
                                    donut: {
                                        ...vue_ui_donut.style.chart.layout.donut,
                                        strokeWidth: 64,
                                    },
                                    labels: {
                                        ...vue_ui_donut.style.chart.layout.labels,
                                        percentage: {
                                            ...vue_ui_donut.style.chart.layout.labels.percentage,
                                            fontSize: 16
                                        },
                                        name: {
                                            ...vue_ui_donut.style.chart.layout.labels.name,
                                            fontSize: 12
                                        },
                                        hollow: {
                                            ...vue_ui_donut.style.chart.layout.labels.hollow,
                                            average: {
                                                ...vue_ui_donut.style.chart.layout.labels.hollow.average,
                                                show: false,
                                            },
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                layout: {
                    height: 316,
                    width: 512,
                    padding: PADDING([5, 10, 5, 10]),
                    grid: {
                        show: true,
                        stroke: COLOR_GRID,
                        strokeWidth: 0.7,
                        showVerticalLines: true,
                        axis: {
                            yLabel: '',
                            yLabelOffsetX: 0,
                            xLabel: '',
                            xLabelOffsetY: 0,
                            fontSize: FONT._14,
                            color: COLOR_TEXT_PRIMARY,
                        },
                        yAxis: {
                            scaleMin: null,
                            scaleMax: null,
                            autoScale: false,
                            dataLabels: {
                                show: true,
                                fontSize: FONT._10,
                                color: COLOR_TEXT_PRIMARY,
                                roundingValue: 0,
                                offsetX: 0,
                                bold: false,
                                steps: 10
                            }
                        },
                        xAxis: {
                            dataLabels: {
                                show: true,
                                values: [],
                                datetimeFormatter: AXIS_DATE_FORMATTER,
                                fontSize: FONT._10,
                                showOnlyFirstAndLast: false,
                                color: COLOR_TEXT_PRIMARY,
                                rotation: 0,
                                autoRotate: { // v3
                                    enable: true, // v3
                                    angle: -30, // v3
                                },
                                offsetY: 0
                            }
                        }
                    },
                    line: {
                        show: true,
                        stroke: COLOR_GREY_MID,
                        strokeWidth: 4
                    },
                    highlighter: {
                        color: COLOR_BLACK,
                        opacity: 5
                    },
                    dataLabels: {
                        show: true,
                        fontSize: FONT._10,
                        color: COLOR_TEXT_PRIMARY,
                        bold: false,
                        rounding: 0,
                        prefix: '',
                        suffix: '',
                        offsetY: 0,
                        formatter: null
                    }
                },
                title: TITLE,
                legend: {
                    ...LEGEND,
                    roundingValue: 0,
                    roundingPercentage: 0,
                    showValue: true,
                    showPercentage: true,
                    position: 'bottom'
                }
            }
        },
        userOptions: USER_OPTIONS({
            pdf: true,
            csv: true,
            img: true,
            table: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        table: {
            ...TABLE,
            useDialog: false,
            columnNames: {
                period: 'Period',
                total: 'Total'
            },
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0,
                roundingPercentage: 0
            }
        }
    }

    const vue_ui_mood_radar = {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false, // v3
        events: {
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                layout: {
                    grid: {
                        show: true,
                        stroke: COLOR_GRID,
                        strokeWidth: 0.5,
                    },
                    outerPolygon: {
                        stroke: COLOR_GRID,
                        strokeWidth: 1
                    },
                    dataPolygon: {
                        color: COLOR_BLUE,
                        opacity: 60,
                        gradient: {
                            show: true,
                            intensity: 1
                        },
                        stroke: COLOR_BLUE,
                        strokeWidth: 0
                    },
                    smileys: {
                        strokeWidth: 1,
                        colors: {
                            '1': '#e20001',
                            '2': '#ff9f03',
                            '3': '#ffd004',
                            '4': '#9ac900',
                            '5': '#059f00'
                        }
                    },
                    dataLabel: {
                        color: COLOR_TEXT_PRIMARY,
                        roundingValue: 0,
                        roundingPercentage: 0,
                        bold: true,
                        prefix: '',
                        suffix: '',
                        formatter: null
                    }
                },
                title: TITLE,
                legend: {
                    ...LEGEND,
                    roundingValue: 0,
                    roundingPercentage: 0,
                    position: 'bottom'
                }
            }
        },
        userOptions: USER_OPTIONS({
            pdf: true,
            csv: true,
            img: true,
            table: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        table: {
            ...TABLE,
            useDialog: false,
            columnNames: {
                series: 'Series',
                value: 'Value',
                percentage: 'Percentage'
            },
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0,
                roundingPercentage: 0
            }
        }
    }

    const vue_ui_molecule = {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false, // v3
        loading: false, // v3
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        customPalette: [],
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                nodes: {
                    stroke: COLOR_WHITE,
                    strokeHovered: COLOR_BLACK
                },
                links: {
                    stroke: COLOR_GREY_MID
                },
                title: TITLE,
                tooltip: TOOLTIP,
                zoom: {
                    show: true,
                    speed: 1
                }
            }
        },
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            labels: true,
            fullscreen: true,
            annotator: true,
            svg: true,
            zoom: true
        }),
        table: {
            ...TABLE,
            useDialog: false,
            th: TABLE_TH,
            td: TABLE_TD,
            translations: {
                nodeName: 'Node name',
                details: 'Details',
                ancestor: 'Parent node'
            }
        }
    }

    const vue_ui_nested_donuts = {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        theme: '',
        customPalette: [],
        useCssAnimation: false, // v3 (v2 = true)
        useBlurOnHover: true,
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null // v3
        },
        serieToggleAnimation: {
            show: true,
            durationMs: 500,
        },
        startAnimation: {
            show: false, // v3 (v2 = false)
            durationMs: 1000,
            staggerMs: 50
        },
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            labels: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                useGradient: true,
                gradientIntensity: 40,
                padding: PADDING([0,0,0,0]),
                width: 512,
                height: 512,
                layout: {
                    labels: {
                        dataLabels: {
                            ...LABEL_VP_ORDER,
                            show: true,
                            prefix: '',
                            suffix: '',
                            hideUnderValue: 3,
                            fontSize: FONT._14,
                            offsetX: 4,
                            offsetY: 12,
                            useSerieColor: false,
                            color: COLOR_TEXT_PRIMARY,
                            showValue: true,
                            showPercentage: true,
                            boldValue: false,
                            boldPercentage: true,
                            roundingValue: 0,
                            roundingPercentage: 0,
                            showDonutName: true,
                            boldDonutName: true,
                            curvedDonutName: true, // v3
                            donutNameAbbreviation: false, // v2 = true
                            donutNameMaxAbbreviationSize: 3,
                            donutNameOffsetY: 0,
                            formatter: null
                        }
                    },
                    donut: {
                        strokeWidth: 200,
                        borderWidth: 2,
                        spacingRatio: 0.5,
                        useShadow: false,
                        shadowColor: COLOR_BLACK,
                        emptyFill: COLOR_GRID,
                        selectedColor: '#0000001A',
                        borderColorAuto: true,
                        borderColor: COLOR_BORDER
                    }
                },
                legend: {
                    ...LEGEND,
                    ...LABEL_VP_ORDER,
                    roundingValue: 0,
                    roundingPercentage: 0,
                    showValue: true,
                    showPercentage: true,
                    position: 'bottom'
                },
                title: TITLE,
                tooltip: {
                    ...TOOLTIP,
                    ...LABEL_VP_ORDER,
                    showAllItemsAtIndex: true,
                    showValue: true,
                    showPercentage: true,
                    roundingValue: 0,
                    roundingPercentage: 0
                }
            }
        },
        table: {
            ...TABLE,
            useDialog: false,
            columnNames: {
                series: 'Series',
                value: 'Value',
                percentage: 'Percentage'
            },
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0,
                roundingPercentage: 0
            }
        }
    }

    const vue_ui_galaxy = {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false, // v3
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        customPalette: [],
        useCssAnimation: false, // v2 = true
        useBlurOnHover: true,
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                layout: {
                    arcs: {
                        strokeWidth: 24,
                        borderWidth: 12,
                        offsetX: 0,
                        offsetY: 0,
                        hoverEffect: {
                            show: true,
                            multiplicator: 1.1
                        },
                        gradient: {
                            show: true,
                            intensity: 30,
                            color: COLOR_WHITE
                        }
                    },
                    labels: {
                        dataLabels: {
                            ...LABEL_VP_ORDER,
                            prefix: '',
                            suffix: '',
                            formatter: null
                        }
                    }
                },
                legend: {
                    ...LEGEND,
                    roundingValue: 0,
                    roundingPercentage: 0,
                    showValue: true,
                    showPercentage: true,
                    position: 'bottom'
                },
                title: TITLE,
                tooltip: {
                    ...TOOLTIP,
                    showValue: true,
                    showPercentage: true,
                    roundingValue: 0,
                    roundingPercentage: 0
                }
            }
        },
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        table: {
            ...TABLE,
            useDialog: false,
            columnNames: {
                series: 'Series',
                value: 'Value',
                percentage: 'Percentage'
            },
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0,
                roundingPercentage: 0
            }
        }
    }

    const vue_ui_strip_plot = {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        responsiveProportionalSizing: true,
        theme: '',
        customPalette: [],
        useCssAnimation: true,
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            labels: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                height: 600,
                width: 600, // v3
                // stripWidth: 120, v3 deprecated
                padding: PADDING([12, 12, 12, 12]), // v3 modified
                grid: {
                    show: true,
                    stroke: COLOR_GREY_MID,
                    strokeWidth: 1,
                    scaleSteps: 10,
                    horizontalGrid: {
                        show: true,
                        stroke: COLOR_GREY_MID,
                        strokeWidth: 0.5,
                        strokeDasharray: 4
                    },
                    verticalGrid: {
                        show: true,
                        stroke: COLOR_GREY_MID,
                        strokeWidth: 0.5,
                        strokeDasharray: 4
                    }
                },
                plots: {
                    opacity: 0.5,
                    radius: 20,
                    stroke: COLOR_WHITE,
                    strokeWidth: 1,
                    shape: SHAPE.CIRCLE,
                    gradient: {
                        show: true,
                        intensity: 40
                    }
                },
                labels: {
                    prefix: '',
                    suffix: '',
                    formatter: null,
                    bestPlotLabel: {
                        show: true,
                        showValue: true,
                        fontSize: FONT._14,
                        color: COLOR_TEXT_PRIMARY,
                        rounding: 0,
                        offsetY: 0
                    },
                    axis: {
                        xLabel: '',
                        xLabelOffsetY: 0,
                        yLabel: '',
                        yLabelOffsetX: 0,
                        fontSize: FONT._14,
                        color: COLOR_TEXT_PRIMARY
                    },
                    xAxisLabels: {
                        show: true,
                        color: COLOR_TEXT_PRIMARY,
                        fontSize: FONT._14,
                        offsetY: 0,
                        rotation: 0, // v3,
                        autoRotate: { // v3
                            enable: true, // v3
                            angle: -30, // v3
                        }
                    },
                    yAxisLabels: {
                        show: true,
                        color: COLOR_TEXT_PRIMARY,
                        fontSize: FONT._14,
                        rounding: 0,
                        offsetX: 0
                    }
                },
                title: TITLE,
                tooltip: {
                    ...TOOLTIP,
                    roundingValue: 0
                }
            }
        },
        table: {
            ...TABLE,
            useDialog: false,
            columnNames: {
                series: 'Series',
                value: 'Value'
            },
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0
            }
        }
    }

    const vue_ui_dumbbell = {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        useAnimation: false, // v2 = true
        animationSpeed: 2,
        userOptions: USER_OPTIONS({
            pdf: true,
            csv: true,
            img: true,
            table: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                width: 600,
                rowHeight: 48, // v3 modified
                padding: PADDING([12, 24, 12, 12]), // v3 modified
                plots: {
                    startColor: COLOR_RED,
                    endColor: COLOR_BLUE,
                    evaluationColors: { // v3
                        enable: false, // v3
                        positive: '#2ca02c', // v3
                        negative: '#d62728', // v3
                        neutral: '#c7c7c7', // v3
                    },
                    radius: 6,
                    stroke: COLOR_WHITE,
                    strokeWidth: 1,
                    link: {
                        strokeWidth: 2,
                        type: SHAPE.CURVED
                    },
                    gradient: {
                        show: true,
                        intensity: 40
                    }
                },
                grid: {
                    strokeWidth: 1,
                    scaleSteps: 10,
                    scaleMin: null, // v3
                    scaleMax: null, // V3
                    horizontalGrid: {
                        show: true,
                        stroke: COLOR_GREY_MID,
                        strokeWidth: 0.5,
                        strokeDasharray: 0
                    },
                    verticalGrid: {
                        show: true,
                        stroke: COLOR_GREY_MID,
                        strokeWidth: 0.5,
                        strokeDasharray: 0
                    }
                },
                comparisonLines: { // v3
                    show: true,// v3
                    strokeWidth: 1, // v3
                    strokeDasharray: 4, // v3
                    showRect: true, // v3
                    rectColor: COLOR_BLACK, // v3
                    rectOpacity: 5, // v3
                    showLabel: true, // v3
                    labelColor: COLOR_BLACK, // v3
                    labelFontSize: FONT._12, // v3
                },
                highlighter: { // v3
                    color: COLOR_BLACK, // v3
                    opacity: 5, // v3
                },
                labels: {
                    prefix: '',
                    suffix: '',
                    formatter: null,
                    axis: { // v3
                        yLabel: '', // v3
                        yLabelOffsetX: 0, // v3
                        xLabel: '', // v3
                        xLabelOffsetY: 0, // v3
                        fontSize: FONT._14, // v3
                        color: COLOR_TEXT_PRIMARY, // v3
                    },
                    yAxisLabels: {
                        show: true,
                        fontSize: FONT._14,
                        color: COLOR_TEXT_PRIMARY,
                        offsetX: 0,
                        bold: true,
                        showProgression: true,
                        rounding: 1,
                        formatter: null // v3
                    },
                    xAxisLabels: {
                        show: true,
                        fontSize: FONT._14,
                        color: COLOR_TEXT_PRIMARY,
                        offsetY: 0,
                        bold: false,
                        rounding: 0,
                        rotation: 0, // v3
                        autoRotate: { // v3
                            enable: true, // v3
                            angle: -30, // v3
                        }
                    },
                    startLabels: {
                        show: true,
                        fontSize: FONT._10,
                        color: COLOR_TEXT_PRIMARY,
                        offsetY: 0,
                        rounding: 0,
                        useStartColor: true,
                        useEvaluationColor: true, // v3
                    },
                    endLabels: {
                        show: true,
                        fontSize: FONT._10,
                        color: COLOR_TEXT_PRIMARY,
                        offsetY: 0,
                        rounding: 0,
                        useEndColor: true,
                        useEvaluationColor: true, // v3
                    }
                },
                legend: {
                    ...LEGEND,
                    labelStart: 'start',
                    labelEnd: 'end',
                    labelPositive: 'positive', // v3
                    labelNegative: 'negative', // v3
                    labelNeutral: 'neutral', // v3
                    position: 'bottom'
                },
                title: TITLE
            }
        },
        table: {
            ...TABLE,
            useDialog: false,
            columnNames: {
                series: 'Series',
                start: 'Start value',
                end: 'End value',
                progression: 'Progression'
            },
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0,
                roundingPercentage: 0
            }
        }
    }

    const vue_ui_3d_bar = {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false, // v3
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        customPalette: [],
        useCssAnimation: false, // v3
        style: {
            fontFamily: 'inherit',
            shape: SHAPE.BAR,
            chart: {
                animation: {
                    use: true,
                    speed: 1,
                    acceleration: 1,
                },
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                bar: {
                    color: COLOR_BLUE,
                    stroke: COLOR_BLUE,
                    strokeWidth: 0.7,
                    shadeColor: COLOR_BLACK
                },
                box: {
                    stroke: COLOR_GREY_MID,
                    strokeWidth: 0.7,
                    strokeDasharray: 2,
                    dimensions: {
                        width: 128,
                        height: 256,
                        top: 27,
                        bottom: 9,
                        left: 24,
                        right: 24,
                        perspective: 18
                    }
                },
                title: TITLE,
                legend: {
                    showDefault: true,
                    fontSize: FONT._10,
                    color: COLOR_TEXT_PRIMARY,
                    bold: false,
                    roundingValue: 0,
                    roundingPercentage: 0,
                    prefix: '',
                    suffix: '',
                    hideUnderPercentage: 3
                },
                dataLabel: {
                    show: true,
                    bold: true,
                    color: COLOR_BLUE,
                    fontSize: FONT._12,
                    rounding: 1,
                    formatter: null
                }
            }
        },
        userOptions: USER_OPTIONS({
            pdf: true,
            csv: true,
            img: true,
            table: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        table: {
            ...TABLE,
            useDialog: false,
            columnNames: {
                series: 'Series',
                value: 'Value',
                percentage: 'Percentage'
            },
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0,
                roundingPercentage: 0
            }
        }
    }

    const vue_ui_table_sparkline = {
        theme: '',
        customPalette: [],
        responsiveBreakpoint: 500,
        showAverage: true,
        showMedian: true,
        showTotal: true,
        roundingAverage: 0,
        roundingMedian: 0,
        roundingValues: 0,
        roundingTotal: 0,
        prefix: '',
        suffix: '',
        formatter: null,
        showSparklines: true,
        fontFamily: 'inherit',
        colNames: [],
        sortedDataColumnIndices: [],
        sortedSeriesName: false,
        sortedSum: false,
        sortedAverage: false,
        sortedMedian: false,
        resetSortOnClickOutside: false,
        sparkline: {
            useGradient: true,
            showArea: true,
            strokeWidth: 3,
            type: SHAPE.LINE,
            smooth: true,
            dimensions: {
                width: 150,
                heightRatio: 1
            },
            animation: {
                show: true,
                animationFrames: 360
            }
        },
        translations: {
            serie: 'Serie',
            total: 'Total',
            average: 'Average',
            median: 'Median',
            chart: 'Evolution'
        },
        title: {
            text: '',
            color: COLOR_TEXT_PRIMARY,
            fontSize: FONT._20,
            bold: true,
            textAlign: 'center',
            backgroundColor: COLOR_BACKGROUND,
            subtitle: { 
                color: COLOR_TEXT_SECONDARY,
                text: '', 
                fontSize: FONT._16, 
                bold: false 
            },
        },
        thead: {
            backgroundColor: COLOR_BACKGROUND,
            color: COLOR_TEXT_PRIMARY,
            fontSize: FONT._14,
            outline: "none",
            textAlign: POSITION.LEFT,
            bold: false
        },
        tbody: {
            showColorMarker: true,
            backgroundColor: COLOR_BACKGROUND,
            color: COLOR_TEXT_PRIMARY,
            fontSize: FONT._14,
            outline: "none",
            textAlign: POSITION.LEFT,
            bold: false,
            selectedColor: {
                useSerieColor: true,
                fallback: COLOR_GRID,
            }
        },
        userOptions: USER_OPTIONS({
            pdf: true,
            csv: true,
            img: true,
            fullscreen: true
        })
    }

    const vue_ui_table_heatmap = {
        theme: '',
        style: {
            fontFamily: 'inherit',
            backgroundColor: COLOR_BACKGROUND,
            color: COLOR_TEXT_PRIMARY,
            shapeSize: FONT._14,
            heatmapColors: {
                useIndividualScale: false,
                min: COLOR_WHITE,
                max: COLOR_BLUE
            }
        },
        table: {
            responsiveBreakpoint: 400,
            borderWidth: 1,
            showSum: false,
            showAverage: false,
            showMedian: false,
            head: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                values: []
            }
        },
        userOptions: USER_OPTIONS({
            pdf: true,
            csv: true,
            img: true,
            fullscreen: true
        })
    }

    const vue_ui_word_cloud = {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        customPalette: [],
        useCssAnimation: false, // v2 = true
        animationDelayMs: 20,
        strictPixelPadding: true, // If true, strict per-pixel padding is used (dilateWordMask); if false, just rectangular bounding box (or pad).
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            fullscreen: true,
            annotator: true,
            svg: true,
            zoom: true
        }),
        nodeCategories: {},
        nodeCategoryColors: {},
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                height: 512,
                width: 512,
                zoom: {
                    show: true,
                },
                controls: {
                    position: 'bottom',
                    show: true,
                    backgroundColor: COLOR_GRID,
                    buttonColor: COLOR_GRID,
                    color: COLOR_TEXT_PRIMARY,
                    fontSize: 14,
                    border: `1px solid ${COLOR_BORDER}`,
                    padding: `0.5rem`,
                    borderRadius: `0.25rem`
                },
                words: {
                    maxFontSize: 100,
                    minFontSize: FONT._10,
                    bold: false,
                    proximity: 10,
                    packingWeight: 1,
                    color: COLOR_TEXT_PRIMARY,
                    usePalette: true,
                    hoverOpacity: 0.5,
                    selectedStroke: 'transparent'
                },
                title: TITLE,
                tooltip: {
                    ...TOOLTIP,
                    roundingValue: 0,
                },
            }
        },
        table: {
            ...TABLE,
            useDialog: false,
            columnNames: {
                series: 'Word',
                value: 'Value'
            },
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0,
                prefix: '',
                suffix: ''
            }
        }
    }

    const vue_ui_xy_canvas = {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false,
        loading: false,
        responsive: false,
        theme: '',
        customPalette: [],
        downsample: {
            threshold: 10000
        },
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            labels: true,
            fullscreen: true,
            stack: true,
            annotator: true
        }),
        style: {
            fontFamily: 'Arial', // A defined font must be provided as 'inherit' fails with canvas
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                aspectRatio: '12 / 9',
                stacked: false,
                stackGap: 20,
                scale: {
                    ticks: 10,
                    min: null,
                    max: null,
                },
                zoom: {
                    ...ZOOM,
                    minimap: MINIMAP,
                    preview: { // v3
                        enable: false,
                        fill: '#CCCCCC50',
                        stroke: '#6A6A6A',
                        strokeWidth: 2,
                        strokeDasharray: 0,
                    },
                    useDefaultFormat: true,
                    timeFormat: 'yyyy-MM-dd HH:mm:ss', // When datetimeFormatter is enabled
                    customFormat: null // overrides all if callback => string
                },
                selector: {
                    show: true,
                    color: COLOR_BLACK,
                    dashed: true,
                    showHorizontalSelector: false,
                },
                tooltip: {
                    ...TOOLTIP,
                    showTimeLabel: true,
                    useDefaultTimeFormat: true,
                    timeFormat: 'yyyy-MM-dd HH:mm:ss' // When datetimeFormatter is enabled and useDefaultFormat is false
                },
                legend: {
                    ...LEGEND,
                    position: 'bottom',
                },
                title: TITLE,
                grid: {
                    y: {
                        showAxis: true,
                        axisColor: COLOR_BLACK,
                        axisThickness: 2,
                        axisName: '',
                        axisLabels: {
                            show: true,
                            fontSizeRatio: 1,
                            color: COLOR_TEXT_PRIMARY,
                            offsetX: 0,
                            rounding: 1,
                            prefix: '',
                            suffix: '',
                            bold: false,
                        },
                        verticalLines: {
                            show: true,
                            color: COLOR_GREY_MID,
                            hideUnderXLength: 20,
                            position: 'middle' // 'start'
                        },
                    },
                    x: {
                        showAxis: true,
                        axisColor: COLOR_BLACK,
                        axisThickness: 2,
                        axisName: '',
                        horizontalLines: {
                            show: true,
                            color: COLOR_GREY_MID,
                            alternate: true,
                            opacity: 20
                        },
                        timeLabels: {
                            show: true,
                            showMarker: true,
                            fontSizeRatio: 0.8,
                            values: [],
                            datetimeFormatter: AXIS_DATE_FORMATTER,
                            rotation: 0,
                            offsetY: 30,
                            color: COLOR_TEXT_PRIMARY,
                            modulo: 12,
                            bold: false,
                        }
                    },
                    zeroLine: {
                        show: true,
                        color: COLOR_BLACK,
                        dashed: true
                    }
                },
                line: {
                    cutNullValues: true,
                    plots: {
                        show: true,
                        radiusRatio: 1
                    }
                },
                bar: {
                    gradient: {
                        show: true
                    }
                },
                area: {
                    opacity: 60
                },
                dataLabels: {
                    show: true,
                    fontSizeRatio: 1,
                    useSerieColor: true,
                    color: COLOR_TEXT_PRIMARY,
                    offsetY: -12,
                    formatter: null,
                    bold: true
                },
                paddingProportions: {
                    top: 0.1,
                    right: 0.05,
                    bottom: 0.1,
                    left: 0.1,
                }
            }
        },
        table: {
            ...TABLE,
            useDialog: false,
            rounding: 1,
            columnNames: {
                period: 'Period',
                total: 'Total'
            },
            th: TABLE_TH,
            td: TABLE_TD
        }
    }

    const vue_ui_flow = {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false, // v3
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        customPalette: [],
        userOptions: USER_OPTIONS({
            pdf: true,
            csv: true,
            img: true,
            table: true,
            fullscreen: true,
            annotator: true,
            tooltip: true,
            svg: true
        }),
        nodeCategories: {},
        nodeCategoryColors: {},
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                width: 1000, // v3
                height: 600, // v3
                color: COLOR_TEXT_PRIMARY,
                padding: PADDING([12, 12, 12, 12]), // v3 update
                title: TITLE,
                tooltip: {
                    ...TOOLTIP,
                    showPercentage: true,
                    roundingPercentage: 0,
                    translations: {
                        from: 'From:',
                        to: 'To:',
                        percentOfTotal: 'Percent of total:'
                    }
                },
                legend: {
                    ...LEGEND,
                    position: 'bottom'
                },
                nodes: {
                    gap: 10,
                    // minHeight: 20, // v3 deprecated
                    width: 40,
                    labels: {
                        show: true, // v3
                        showValue: true,
                        fontSize: FONT._14,
                        abbreviation: {
                            use: true,
                            length: 3
                        },
                        prefix: '',
                        suffix: '',
                        rounding: 0,
                        formatter: null
                    },
                    stroke: COLOR_WHITE,
                    strokeWidth: 1,
                    borderRadius: 0,
                },
                links: {
                    // width: 200, // v3 deprecated
                    opacity: 0.8,
                    stroke: COLOR_WHITE,
                    strokeWidth: 1,
                    smooth: true
                }
            }
        },
        table: {
            ...TABLE,
            useDialog: false,
            columnNames: {
                source: 'Source',
                target: 'Target',
                value: 'Value'
            },
            th: TABLE_TH,
            td: TABLE_TD
        }
    }

    const vue_ui_parallel_coordinate_plot = {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        responsiveProportionalSizing: true,
        theme: '',
        useCssAnimation: false, // v3
        customPalette: [],
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            labels: true,
            fullscreen: true,
            annotator: true,
            svg: true
        }),
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                height: 600,
                width: 1000,
                padding: PADDING([0, 0, 0, 0]),
                comments: {
                    show: true,
                    showInTooltip: true,
                    width: 200,
                    offsetX: 0,
                    offsetY: 0
                },
                lines: {
                    smooth: true,
                    strokeWidth: 2,
                    opacity: 0.8
                },
                plots: {
                    show: true,
                    radius: 6,
                    opacity: 0.8
                },
                yAxis: {
                    scaleTicks: 10,
                    stroke: COLOR_BLACK,
                    strokeWidth: 1,
                    labels: {
                        showAxisNames: true,
                        axisNames: [],
                        axisNamesRotation: 0, // v3
                        axisNamesAutoRotate: { // v3
                            enable: true, // v3
                            angle: -30 // v3
                        },
                        axisNamesColor: COLOR_TEXT_PRIMARY,
                        axisNamesFontSize: FONT._16,
                        axisNamesBold: true,
                        roundings: [],
                        prefixes: [],
                        suffixes: [],
                        formatters: [],
                        ticks: {
                            show: true,
                            fontSize: FONT._14,
                            color: COLOR_TEXT_PRIMARY,
                            bold: false,
                            offsetX: 0,
                            offsetY: 0
                        },
                        datapoints: {
                            show: true,
                            fontSize: FONT._14,
                            useSerieColor: true,
                            color: COLOR_TEXT_PRIMARY,
                            offsetX: 0,
                            offsetY: 0,
                            bold: true
                        }
                    }
                },
                title: TITLE,
                legend: {
                    ...LEGEND,
                    position: 'bottom'
                },
                tooltip: TOOLTIP
            }
        },
        table: {
            ...TABLE,
            useDialog: false,
            columnNames: {
                series: 'Series',
                item: 'Item'
            },
            th: TABLE_TH,
            td: TABLE_TD
        }
    }

    const vue_ui_timer = {
        type: 'stopwatch',
        responsive: false,
        responsiveProportionalSizing: true,
        useCursorPointer: false,
        style: {
            fontFamily: 'inherit',
            backgroundColor: COLOR_BACKGROUND,
            height: 300,
            width: 300,
            title: TITLE
        },
        stopwatch: {
            showHours: false,
            showHundredth: true,
            cycleSeconds: 5,
            track: {
                radiusRatio: 1,
                stroke: COLOR_GRID,
                fill: COLOR_WHITE,
                strokeWidth: 2
            },
            tracker: {
                radiusRatio: 1,
                stroke: COLOR_WHITE,
                strokeWidth: 1,
                fill: COLOR_BLACK,
                gradient: {
                    show: true,
                    color: COLOR_WHITE
                },
                aura: {
                    show: true,
                    radiusRatio: 1,
                    fill: COLOR_BLACK,
                    stroke: COLOR_WHITE,
                    strokeWidth: 0
                }
            },
            cycleTrack: {
                show: true,
                stroke: COLOR_BLACK,
                strokeWidth: 3
            },
            label: {
                fontSize: FONT._24,
                color: COLOR_TEXT_PRIMARY,
                bold: false
            },
            legend: {
                backgroundColor: COLOR_BACKGROUND,
                buttons: {
                    start: true,
                    pause: true,
                    reset: true,
                    restart: true,
                    lap: true,
                    iconColor: COLOR_BLACK
                },
                buttonTitles: {
                    start: 'Start',
                    pause: 'Pause',
                    resume: 'Resume',
                    reset: 'Reset',
                    restart: 'Restart',
                    lap: 'Lap'
                }
            }
        }
    }

    // non chart components
    const vue_ui_cursor = {
        bubbleEffect: true,
        bubbleEffectColor: COLOR_WHITE,
        bubbleEffectOpacity: 0.1,
        centerCircleColor: COLOR_WHITE,
        centerCircleDasharray: 0,
        centerCircleOpacity: 0,
        centerCircleRadius: 50,
        centerCircleStroke: COLOR_GREY_MID,
        centerCircleStrokeWidth: 0.5,
        coordinatesColor: COLOR_GREY_MID,
        coordinatesFontSize: FONT._10,
        coordinatesOffset: 0,
        crosshairDasharray: 0,
        crosshairStroke: COLOR_GREY_MID,
        crosshairStrokeWidth: 0.5,
        intersectCirclesFill: COLOR_GREY_MID,
        intersectCirclesRadius: 2,
        isLoading: false,
        parentId: '',
        showCenterCircle: true,
        showCoordinates: true,
        showCrosshair: true,
        showIntersectCircles: true,
        useWaveOnClick: true
    }

    const vue_ui_accordion = {
        open: false,
        maxHeight: 2000,
        useCursorPointer: false,
        head: {
            useArrowSlot: false,
            backgroundColor: COLOR_BACKGROUND,
            color: COLOR_TEXT_PRIMARY,
            iconColor: COLOR_BLUE,
            iconSize: 20,
            icon: 'arrowRight',
            padding: '12px 6px'
        },
        body: {
            backgroundColor: COLOR_BACKGROUND,
            color: COLOR_TEXT_PRIMARY
        }
    }

    const vue_ui_kpi = {
        debug: false, // v3
        animationFrames: 60,
        animationValueStart: 0,
        backgroundColor: COLOR_BACKGROUND,
        fontFamily: 'inherit',
        layoutClass: '',
        layoutCss: '',
        prefix: '',
        suffix: '',
        title: '',
        titleBold: true,
        titleColor: COLOR_TEXT_PRIMARY,
        titleClass: '',
        titleCss: '',
        titleFontSize: FONT._16,
        useAnimation: true,
        valueBold: true,
        valueColor: COLOR_BLUE,
        valueClass: '',
        valueCss: '',
        valueFontSize: FONT._32,
        valueRounding: 0,
        formatter: null,
        analogDigits: {
            show: false,
            height: 40,
            color: COLOR_TEXT_PRIMARY,
            skeletonColor: COLOR_GRID
        }
    }

    const vue_ui_mini_loader = {
        type: 'onion',
        onion: {
            gutterColor: COLOR_GREY_MID,
            gutterOpacity: 0.3,
            gutterBlur: 0,
            trackHueRotate: 20,
            trackBlur: 1,
            trackColor: COLOR_VUE
        },
        line: {
            gutterColor: COLOR_GREY_MID,
            gutterOpacity: 0.3,
            gutterBlur: 0,
            trackHueRotate: 20,
            trackBlur: 1,
            trackColor: COLOR_VUE
        },
        bar: {
            gutterColor: COLOR_GREY_MID,
            gutterOpacity: 0.3,
            gutterBlur: 0,
            trackHueRotate: 20,
            trackBlur: 1,
            trackColor: COLOR_VUE
        }
    }

    const vue_ui_smiley = {
        readonly: false,
        useCursorPointer: false,
        style: {
            fontFamily: 'inherit',
            itemSize: 32,
            backgroundColor: COLOR_BACKGROUND,
            colors: {
                activeReadonly: [
                    '#e20001',
                    '#ff9f03',
                    '#ffd004',
                    '#61c900',
                    '#059f00'
                ],
                active: [
                    '#e20001',
                    '#ff9f03',
                    '#ffd004',
                    '#61c900',
                    '#059f00'
                ],
                inactive: [
                    COLOR_GRID,
                    COLOR_GRID,
                    COLOR_GRID,
                    COLOR_GRID,
                    COLOR_GRID
                ]
            },
            icons: {
                filled: false,
                useGradient: true
            },
            title: {
                ...TITLE,
                textAlign: POSITION.CENTER,
                offsetY: 6,
                subtitle: {
                    ...TITLE.subtitle,
                    offsetY: 12
                }
            },
            rating: {
                show: true,
                fontSize: FONT._24,
                bold: true,
                roundingValue: 1,
                position: POSITION.BOTTOM,
                offsetX: 0,
                offsetY: 0,
                formatter: null
            },
            tooltip: {
                show: true,
                fontSize: FONT._14,
                offsetY: 0,
                color: COLOR_TEXT_PRIMARY,
                bold: true,
                backgroundColor: COLOR_BACKGROUND,
                borderColor: COLOR_BORDER,
                borderRadius: 4,
                boxShadow: '0 6px 12px -6px rgba(0,0,0,0.2)',
                roundingValue: 0,
                formatter: null
            }
        }
    }

    const vue_ui_rating = {
        type: SHAPE.STAR,
        readonly: false,
        from: 1,
        to: 5,
        useCursorPointer: false,
        style: {
            fontFamily: 'inherit',
            animated: true,
            itemSize: 32,
            backgroundColor: COLOR_BACKGROUND,
            star: {
                activeColor: COLOR_YELLOW,
                borderColor: COLOR_YELLOW,
                borderWidth: 3,
                apexes: 5,
                inactiveColor: COLOR_GRID,
                useGradient: true
            },
            image: {
                src: '',
                inactiveOpacity: 0.3,
                alt: 'rating image'
            },
            title: {
                textAlign: POSITION.CENTER,
                fontSize: FONT._20,
                color: COLOR_TEXT_PRIMARY,
                bold: true,
                text: '',
                offsetY: 6,
                subtitle: {
                    fontSize: FONT._14,
                    color: COLOR_GREY_MID,
                    bold: false,
                    text: '',
                    offsetY: 12
                }
            },
            rating: {
                show: true,
                fontSize: FONT._24,
                bold: true,
                roundingValue: 1,
                position: POSITION.BOTTOM,
                offsetY: 0,
                offsetX: 0,
                formatter: null
            },
            tooltip: {
                show: true,
                fontSize: FONT._14,
                offsetY: 0,
                color: COLOR_TEXT_PRIMARY,
                bold: true,
                backgroundColor: COLOR_BACKGROUND,
                borderColor: COLOR_BORDER,
                borderRadius: 4,
                boxShadow: '0 6px 12px -6px rgba(0,0,0,0.2)',
                roundingValue: 0,
                formatter: null
            }
        }
    }

    const vue_ui_annotator = {
        alwaysVisible: false,
        useCursorPointer: false,
        style: {
            backgroundColor: COLOR_BACKGROUND,
            color: COLOR_TEXT_PRIMARY,
            fontFamily: 'inherit',
            showPrint: false,
            showSave: true,
            showImage: true,
            showTooltips: true,
            buttons: {
                borderRadius: 6,
                controls: {
                    backgroundColor: COLOR_BACKGROUND,
                    color: COLOR_TEXT_PRIMARY,
                    border: '1px solid #262626',
                    selected: {
                        backgroundColor: COLOR_BLACK,
                        color: COLOR_WHITE_ALMOST,
                        border: `1px solid ${COLOR_BORDER}`
                    }
                },
                shapes: {
                    backgroundColor: COLOR_BACKGROUND,
                    color: COLOR_TEXT_PRIMARY,
                    border: '1px solid #262626',
                    selected: {
                        backgroundColor: COLOR_TEXT_PRIMARY,
                        color: COLOR_BACKGROUND,
                        border: `1px solid ${COLOR_BORDER}`
                    }
                }
            },
            tooltips: {
                backgroundColor: COLOR_WHITE_ALMOST,
                color: COLOR_TEXT_PRIMARY,
                border: `1px solid ${COLOR_BORDER}`,
                borderRadius: 6,
                boxShadow: '0 6px 12px -6px rgba(0,0,0,0.2)'
            }
        },
        translations: {
            colorAlpha: 'Color alpha',
            dashedLines: 'Dashed lines',
            filled: 'Filled',
            fontSize: 'Font size',
            thickness: 'Thickness',
            title: 'Annotations',
            tooltipGroup: 'Select & group',
            tooltipDelete: 'Delete',
            tooltipMove: 'Move',
            tooltipResize: 'Resize',
            tooltipBringToFront: 'Bring to front',
            tooltipBringToBack: 'Bring to back',
            tooltipDuplicate: 'Duplicate',
            tooltipUndo: 'Undo last shape',
            tooltipRedo: 'Redo last shape',
            tooltipPdf: 'Save pdf',
            tooltipSave: 'Save annotations',
            tooltipShapeCircle: 'Draw circle',
            tooltipShapeRect: 'Draw rect',
            tooltipShapeArrow: 'Draw arrow',
            tooltipShapeFreehand: 'Freehand line',
            tooltipShapeText: 'Text mode',
            tooltipShapeTextLeft: 'Align left',
            tooltipShapeTextCenter: 'Align center',
            tooltipShapeTextRight: 'Align right',
            tooltipShapeTextBullet: 'Bullet points',
            tooltipShapeTextBold: 'Bold',
            tooltipShapeTextItalic: 'Italic',
            tooltipShapeTextUnderline: 'Underlined',
            tooltipShapeColor: 'Color',
            tooltipImage: 'Download PNG'
        }
    }

    const vue_ui_dashboard = {
        locked: false,
        style: {
            board: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                aspectRatio: '1/1.4141',
                border: 'none'
            },
            item: {
                backgroundColor: COLOR_BACKGROUND,
                borderColor: COLOR_BORDER
            },
            resizeHandles: {
                backgroundColor: COLOR_TEXT_PRIMARY,
            },
        },
        userOptions: {
            show: true,
            useCursorPointer: false,
            showOnChartHover: false,
            keepStateOnChartLeave: true,
            position: 'right',
            buttons: {
                pdf: true,
                img: true,
                annotator: true,
                altCopy: false
            },
            callbacks: {
                pdf: null,
                img: null,
                annotator: null,
                altCopy: null
            },
            buttonTitles: {
                pdf: 'Download PDF',
                img: 'Download PNG',
                annotator: 'Toggle annotator',
                altCopy: 'Copy alt text'
            },
            print: {
                scale: 2,
                filename: '',
            }
        },
    }

    const vue_ui_skeleton = {
        type: SHAPE.LINE,
        style: {
            backgroundColor: COLOR_BACKGROUND,
            color: COLOR_TEXT_PRIMARY,
            maxHeight: 500,
            animated: true,
            chord: {
                color: COLOR_GRID
            },
            ridgeline: {
                color: COLOR_GRID
            },
            circlePack: {
                color: COLOR_GRID
            },
            historyPlot: {
                color: COLOR_GRID
            },
            bullet: {
                color: COLOR_GRID
            },
            flow: {
                color: COLOR_GRID
            },
            parallelCoordinatePlot: {
                color: COLOR_GRID
            },
            treemap: {
                color: COLOR_GRID
            },
            dumbbell: {
                color: COLOR_GRID
            },
            stripPlot: {
                color: COLOR_GRID
            },
            galaxy: {
                color: COLOR_GRID
            },
            bar3d: {
                color: COLOR_GRID
            },
            sparkHistogram: {
                color: COLOR_GRID
            },
            sparkStackbar: {
                color: COLOR_GRID
            },
            sparkbar: {
                color: COLOR_GRID
            },
            thermometer: {
                color: COLOR_GRID
            },
            relationCircle: {
                color: COLOR_GRID
            },
            molecule: {
                color: COLOR_GRID
            },
            tiremarks: {
                color: COLOR_GRID
            },
            chestnut: {
                color: COLOR_GRID
            },
            sparkline: {
                color: COLOR_GRID,
                strokeWidth: 0.7
            },
            donutEvolution: {
                axis: {
                    show: true,
                    color: COLOR_GRID,
                    strokeWidth: 0.5
                },
                donuts: {
                    strokeWidth: 0.5,
                    color: COLOR_GRID
                }
            },
            line: {
                axis: {
                    show: true,
                    color: COLOR_GRID,
                    strokeWidth: 0.5
                },
                path: {
                    color: COLOR_GRID,
                    strokeWidth: 1,
                    showPlots: true
                }
            },
            bar: {
                axis: {
                    show: true,
                    color: COLOR_GRID,
                    strokeWidth: 0.5
                },
                borderRadius: 0.5,
                color: COLOR_GRID,
                barWidth: 9
            },
            donut: {
                color: COLOR_GRID,
                strokeWidth: 64
            },
            onion: {
                color: COLOR_GRID
            },
            gauge: {
                color: COLOR_GRID
            },
            quadrant: {
                grid: {
                    color: COLOR_GRID,
                    strokeWidth: 0.5
                },
                plots: {
                    radius: 1.5,
                    color: COLOR_GRID
                }
            },
            radar: {
                grid: {
                    color: COLOR_GRID,
                    strokeWidth: 0.5
                },
                shapes: {
                    color: COLOR_GRID
                }
            },
            waffle: {
                color: COLOR_GRID
            },
            table: {
                th: {
                    color: COLOR_GRID
                },
                td: {
                    color: COLOR_GRID,
                    strokeWidth: 0.5
                }
            },
            rating: {
                useSmiley: false,
                color: COLOR_GRID,
                filled: true,
                strokeWidth: 1,
                maxWidth: 200
            },
            verticalBar: {
                axis: {
                    show: true,
                    color: COLOR_GRID,
                    strokeWidth: 0.5
                },
                borderRadius: 0.5,
                color: COLOR_GRID
            },
            heatmap: {
                cellsX: 26,
                cellsY: 7,
                color: COLOR_GRID
            },
            candlesticks: {
                axis: {
                    show: true,
                    color: COLOR_GRID,
                    strokeWidth: 0.5
                },
                candle: {
                    color: COLOR_GRID,
                    strokeWidth: 1
                }
            },
            pyramid: {
                color: COLOR_GRID
            },
            wheel: {
                color: COLOR_GRID
            },
            rings: {
                color: COLOR_GRID
            }
        }
    }

    const vue_ui_table = {
        fontFamily: "inherit",
        maxHeight: 500,
        rowsPerPage: 25,
        useCursorPointer: false,
        style: {
            title: {
                ...TITLE,
                backgroundColor: COLOR_BACKGROUND,
            },
            th: {
                backgroundColor: COLOR_GRID,
                color: COLOR_TEXT_PRIMARY,
                outline: `1px solid ${COLOR_WHITE}`,
                selected: {
                    backgroundColor: COLOR_BLUE,
                    color: COLOR_WHITE
                },
                buttons: {
                    filter: {
                        inactive: {
                            backgroundColor: COLOR_GRID,
                            color: COLOR_TEXT_PRIMARY
                        },
                        active: {
                            backgroundColor: COLOR_BLUE,
                            color: COLOR_WHITE
                        }
                    },
                    cancel: {
                        inactive: {
                            backgroundColor: COLOR_GRID,
                            color: COLOR_BLACK
                        },
                        active: {
                            backgroundColor: '#F17171',
                            color: COLOR_WHITE
                        }
                    }
                }
            },
            rows: {
                outline: `1px solid ${COLOR_BACKGROUND}`,
                even: {
                    backgroundColor: '#f3f5f7',
                    color: COLOR_TEXT_PRIMARY,
                    selectedCell: {
                        backgroundColor: '#1f77b45b',
                        color: COLOR_TEXT_PRIMARY
                    },
                    selectedNeighbors: {
                        backgroundColor: '#63dd821e',
                        color: COLOR_TEXT_PRIMARY
                    }
                },
                odd: {
                    backgroundColor: COLOR_BACKGROUND,
                    color: COLOR_TEXT_PRIMARY,
                    selectedCell: {
                        backgroundColor: '#1f77b45b',
                        color: COLOR_TEXT_PRIMARY
                    },
                    selectedNeighbors: {
                        backgroundColor: '#63dd821e',
                        color: COLOR_TEXT_PRIMARY
                    }
                }
            },
            inputs: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                border: `1px solid ${COLOR_BORDER}`,
                accentColor: COLOR_BLUE
            },
            dropdowns: {
                backgroundColor: COLOR_GRID,
                color: COLOR_TEXT_PRIMARY,
                icons: {
                    selected: {
                        color: COLOR_GREEN,
                        unicode: '✔'
                    },
                    unselected: {
                        color: COLOR_RED,
                        unicode: '✖'
                    }
                }
            },
            infoBar: {
                backgroundColor: COLOR_GRID,
                color: COLOR_TEXT_PRIMARY
            },
            pagination: {
                buttons: {
                    backgroundColor: COLOR_GRID,
                    color: COLOR_TEXT_PRIMARY,
                    opacityDisabled: 0.5
                },
                navigationIndicator: {
                    backgroundColor: COLOR_BLUE
                }
            },
            exportMenu: {
                show: true,
                backgroundColor: COLOR_GRID,
                color: COLOR_TEXT_PRIMARY,
                buttons: {
                    backgroundColor: COLOR_WHITE_ALMOST,
                    color: COLOR_TEXT_PRIMARY
                },
                filename: ''
            },
            closeButtons: {
                backgroundColor: 'transparent',
                color: COLOR_TEXT_PRIMARY,
                borderRadius: '50%'
            },
            chart: {
                modal: {
                    backgroundColor: COLOR_GRID,
                    color: COLOR_TEXT_PRIMARY,
                    buttons: {
                        selected: {
                            backgroundColor: COLOR_BLUE,
                            color: COLOR_WHITE
                        },
                        unselected: {
                            backgroundColor: COLOR_BACKGROUND,
                            color: COLOR_TEXT_PRIMARY
                        }
                    }
                },
                layout: {
                    backgroundColor: COLOR_BACKGROUND,
                    axis: {
                        stroke: '#ccd1d4',
                        strokeWidth: 2
                    },
                    bar: {
                        fill: COLOR_BLUE,
                        stroke: COLOR_WHITE
                    },
                    line: {
                        smooth: true,
                        useArea: false,
                        stroke: COLOR_BLUE,
                        strokeWidth: 4,
                        plot: {
                            fill: COLOR_BLUE,
                            stroke: COLOR_WHITE, // DEPRECATED
                            strokeWidth: 1,
                            radius: {
                                selected: 6,
                                unselected: 4
                            }
                        },
                        selector: { // DEPRECATED
                            stroke: '#ccc', // DEPRECATED
                            strokeWidth: 1, // DEPRECATED
                            strokeDasharray: 5 // DEPRECATED
                        }
                    },
                    labels: {
                        color: COLOR_TEXT_PRIMARY
                    },
                    progression: {
                        stroke: COLOR_BLACK,
                        strokeWidth: 2,
                        strokeDasharray: 4,
                        arrowSize: 7
                    },
                    timeLabels: {
                        showOnlyAtModulo: true,
                        modulo: 12,
                    },
                    datetimeFormatter: {
                        ...AXIS_DATE_FORMATTER,
                        enable: true
                    },
                    zoom: {
                        show: true,
                    }
                }
            }
        },
        translations: {
            average: 'Average',
            by: 'by',
            chooseCategoryColumn: 'Choose category column',
            exportAllButton: 'CSV all',
            exportAllLabel: 'Export all rows of your current filtered dataset',
            exportPageButton: 'CSV page',
            exportPageLabel: 'Export rows of the current page',
            from: 'From',
            inputPlaceholder: 'Search...',
            makeDonut: 'Generate',
            nb: 'Nb',
            page: 'Page',
            paginatorLabel: 'Rows per page',
            sizeWarning: 'Displaying too many rows at a time can lead to slower performance',
            sum: 'Sum',
            to: 'To',
            total: 'Total',
            totalRows: 'Total rows',
            filename: 'File name',
            xAxisLabels: 'X axis labels'
        },
        useChart: true
    }
    const vue_ui_digits = {
        height: '100%',
        width: null,
        backgroundColor: COLOR_BACKGROUND,
        digits: {
            color: COLOR_TEXT_PRIMARY,
            skeletonColor: COLOR_GRID,
            thickness: 1,
        }
    }

    const vue_ui_carousel_table = {
        responsiveBreakpoint: 400,
        userOptions: USER_OPTIONS({
            tooltip: false,
            pdf: true,
            csv: true,
            img: true,
            table: false,
            labels: false,
            fullscreen: true,
            stack: false,
            animation: true
        }),
        animation: {
            type: 'scroll', // 'scroll' | 'marquee'
            use: true,
            speedMs: 1000,
            pauseOnHover: true,
        },
        style: {
            backgroundColor: COLOR_BACKGROUND,
            color: COLOR_TEXT_PRIMARY,
            fontFamily: 'inherit',
        },
        border: {
            size: 0,
            color: COLOR_BLACK
        },
        caption: {
            text: '',
            padding: PADDING([12, 12, 12, 12]),
            style: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                fontSize: `${FONT._16}px`,
                fontWeight: 'bold',
                textAlign: 'left'
            }
        },
        scrollbar: {
            showOnlyOnHover: false,
            hide: false,
        },
        thead: {
            style: {
                verticalAlign: 'middle',
            },
            tr: {
                height: 32,
                border: {
                    size: 0,
                    color: COLOR_BLACK
                },
                style: {
                    backgroundColor: COLOR_BACKGROUND,
                    color: COLOR_TEXT_PRIMARY,
                    boxShadow: `0px 6px 12px -6px ${COLOR_BLACK}50`
                },
                th: {
                    border: {
                        size: 0,
                        color: COLOR_BLACK
                    },
                    padding: PADDING([0, 12, 0, 0]),
                    style: {
                        borderSpacing: 0,
                        border: 'none',
                        textAlign: 'right',
                        fontVariantNumeric: 'tabular-nums',
                    }
                }
            },
        },
        tbody: {
            backgroundColor: COLOR_BACKGROUND,
            tr: {
                visible: 5,
                height: 32,
                border: {
                    size: 0,
                    color: COLOR_BLACK,
                },
                style: {
                    backgroundColor: COLOR_BACKGROUND,
                    color: COLOR_TEXT_PRIMARY
                },
                td: {
                    alternateColor: true,
                    alternateOpacity: 0.5,
                    border: {
                        size: 0,
                        color: COLOR_BLACK,
                    },
                    padding: PADDING([0, 12, 0, 0]),
                    style: {
                        fontVariantNumeric: 'tabular-nums',
                        textAlign: 'right',
                        backgroundColor: COLOR_GRID
                    }
                }
            }
        }
    }

    const vue_ui_gizmo = {
        skeletonConfig: null,
        skeletonDataset: null,
        debug: false, // v3
        loading: false, // v3
        type: 'battery', // battery | gauge
        size: 64,
        stroke: COLOR_GREY_MID,
        color: COLOR_BLUE,
        useGradient: true,
        gradientColor: '#9db5ed',
        showPercentage: true,
        textColor: COLOR_BLACK,
        fontFamily: 'inherit',
        formatter: null
    }

    const vue_ui_bullet = {
        debug: false, // v3
        loading: false, // v3
        responsive: false, // v3
        theme: '',
        userOptions: USER_OPTIONS({
            tooltip: false,
            pdf: true,
            csv: false,
            img: true,
            table: false,
            labels: false,
            fullscreen: true,
            stack: false,
            annotator: true,
            svg: true
        }),
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                height: 96,
                width: 600,
                padding: PADDING([24, 24, 24, 12]),
                animation: {
                    show: true,
                    animationFrames: 60,
                },
                segments: {
                    baseColor: '#9A9A9A', // default if dataset.segments colors are not provided
                    dataLabels: {
                        show: true,
                        color: COLOR_TEXT_PRIMARY,
                        fontSize: FONT._10,
                        formatter: null,
                        bold: false,
                        prefix: '',
                        suffix: '', 
                        rounding: 0,
                        offsetY: 0,
                    },
                    ticks: {
                        show: true,
                        divisions: 10,
                        stroke: '#8A8A8A',
                    }
                },
                target: {
                    show: true, // v3
                    onTop: true,
                    color: COLOR_TEXT_PRIMARY,
                    rounded: true,
                    heightRatio: 0.8,
                    stroke: COLOR_WHITE,
                    strokeWidth: 1,
                    width: 6,
                },
                valueBar: {
                    color: '#3A3A3A',
                    heightRatio: 0.33,
                    stroke: COLOR_WHITE,
                    strokeWidth: 1,
                    label: {
                        show: true,
                        color: COLOR_TEXT_PRIMARY,
                        fontSize: FONT._14,
                        bold: true,
                        offsetY: 0
                    }
                },
                title: {
                    ...TITLE,
                    textAlign: POSITION.LEFT,
                    paddingLeft: 12
                },
                legend: {
                    ...LEGEND,
                    roundingValue: 0,
                    position: 'bottom'
                },
            }
        }
    }

    const vue_ui_funnel = {
        theme: '',
        responsive: false,
        responsiveProportionalSizing: true,
        useCssAnimation: true,
        table: {
            ...TABLE,
            useDialog: false,
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0,
                roundingPercentage: 0,
            },
            columnNames: {
                series: 'Step',
                value: 'Value',
                percentage: 'Percentage'
            }
        },
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            labels: false,
            fullscreen: true,
            stack: false,
            annotator: true,
            svg: true
        }),
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                width: 600,
                height: 500,
                title: TITLE,
                padding: PADDING([12, 128, 24, 24]),
                barCircleSpacingRatio: 0.05,
                circles: {
                    stroke: COLOR_WHITE,
                    strokeWidth: 1,
                    dataLabels: {
                        formatter: null,
                        fontSize: FONT._16,
                        offsetY: 0,
                        adaptColorToBackground: true,
                        color: COLOR_TEXT_PRIMARY,
                        rounding: 1,
                        bold: true,
                    }
                },
                circleLinks: {
                    show: true,
                    color: COLOR_GRID,
                    widthRatio: 1,
                },
                area: {
                    show: true,
                    color: COLOR_GRID,
                },
                bars: {
                    stroke: COLOR_WHITE,
                    defaultColor: COLOR_BLUE,
                    strokeWidth: 1,
                    gapRatio: 0.2,
                    borderRadius: 3,
                    dataLabels: {
                        name: {
                            fontSize: FONT._16,
                            color: COLOR_TEXT_PRIMARY,
                            bold: true,
                            offsetX: 0,
                            offsetY: 0
                        },
                        value: {
                            formatter: null,
                            fontSize: FONT._16,
                            rounding: 0,
                            bold: false,
                            color: COLOR_TEXT_PRIMARY,
                            prefix: '',
                            suffix: '',
                            offsetX: 0,
                            offsetY: 0
                        }
                    }
                },
            }
        }
    }

    const vue_ui_history_plot = {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        responsiveProportionalSizing: true,
        theme: '',
        customPalette: [],
        useCssAnimation: false, // v2 = true
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            labels: false,
            fullscreen: true,
            stack: false,
            annotator: true,
            svg: true
        }),
        table: {
            ...TABLE,
            useDialog: false,
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0,
            },
            columnNames: {
                series: 'Series',
                datapoint:  'Datapoint',
                x: 'x',
                y: 'y'
            }
        },
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                height: 500,
                width: 600,
                padding: PADDING([12, 12, 12, 12]),
                grid: {
                    xAxis: {
                        show: true,
                        stroke: COLOR_GRID,
                        strokeWidth: 1,
                    },
                    horizontalLines: {
                        show: true,
                        stroke: COLOR_GRID,
                        strokeWidth: 0.6
                    },
                    yAxis: {
                        show: true,
                        stroke: COLOR_GRID,
                        strokeWidth: 1,
                    },
                    verticalLines: {
                        show: true,
                        stroke: COLOR_GRID,
                        strokeWidth: 0.6
                    },
                },
                axes: {
                    x: {
                        scaleMin: null,
                        scaleMax: null,
                        ticks: 10,
                        labels: {
                            show: true,
                            fontSize: FONT._16,
                            color: COLOR_TEXT_PRIMARY,
                            bold: false,
                            rounding: 1,
                            offsetY: 0,
                            rotation: 0,
                            autoRotate: { // v3
                                enable: true, // v3
                                angle: -30, // v3
                            },
                            formatter: null,
                            prefix: '',
                            suffix: ''
                        },
                        name: {
                            text: '',
                            fontSize: FONT._16,
                            offsetX: 0,
                            offsetY: 0,
                            bold: false,
                            color: COLOR_TEXT_PRIMARY
                        }
                    },
                    y: {
                        scaleMin: null,
                        scaleMax: null,
                        ticks: 10,
                        labels: {
                            show: true,
                            fontSize: FONT._16,
                            color: COLOR_TEXT_PRIMARY,
                            bold: false,
                            rounding: 1,
                            offsetX: 0,
                            formatter: null,
                            prefix: '',
                            suffix: ''
                        },
                        name: {
                            text: '',
                            fontSize: FONT._16,
                            offsetX: 0,
                            offsetY: 0,
                            bold: false,
                            color: COLOR_TEXT_PRIMARY
                        }
                    }
                },
                plots: {
                    radius: 16,
                    stroke: COLOR_WHITE,
                    strokeWidth: 1,
                    gradient: {
                        show: true,
                        intensity: 40
                    },
                    indexLabels: {
                        show: true,
                        startAtZero: false,
                        adaptColorToBackground: true,
                        color: COLOR_TEXT_PRIMARY,
                        fontSize: FONT._16,
                        bold: false,
                        offsetY: 0,
                        offsetX: 0
                    },
                    labels: {
                        show: true,
                        fontSize: FONT._10,
                        color: COLOR_TEXT_PRIMARY,
                        bold: false,
                        offsetY: 0,
                        offsetX: 0,
                    }
                },
                paths: {
                    show: true,
                    strokeWidth: 1.6,
                    useSerieColor: true,
                    stroke: COLOR_BLACK
                },
                legend: {
                    ...LEGEND,
                    position: 'bottom'
                },
                title: TITLE,
                tooltip: TOOLTIP

            }
        }
    }

    const vue_ui_circle_pack = {
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        customPalette: [],
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            labels: false,
            fullscreen: true,
            stack: false,
            annotator: true,
            svg: true
        }),
        table: {
            ...TABLE,
            useDialog: false,
            th: TABLE_TH,
            td: TABLE_TD,
            columnNames: {
                datapoint: 'Datapoint',
                value: 'Value'
            }
        },
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                title: TITLE,
                width: 512,
                height: 316,
                circles: {
                    stroke: COLOR_WHITE,
                    strokeWidth: 1,
                    selectedShadowColor: COLOR_BLACK,
                    gradient: {
                        show: true,
                        intensity: 40
                    },
                    labels: {
                        name: {
                            fontSizeRatio: 1,
                            show: true,
                            bold: false,
                            offsetY: 0,
                            color: 'auto'
                        },
                        value: {
                            fontSizeRatio: 1,
                            show: true,
                            color: 'auto',
                            rounding: 0,
                            prefix: '',
                            suffix: '',
                            formatter: null,
                            bold: false,
                            offsetY: 0
                        },
                    },
                },
                tooltip: TOOLTIP,
            }
        }
    }

    const vue_ui_world = {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false, // v3
        loading: false, // v3
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            labels: false,
            fullscreen: true,
            stack: false,
            annotator: true,
            svg: true
        }),
        customPalette: [],
        projection: 'globe',
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                padding: PADDING([12,12,12,12]),
                dataLabels: {
                    prefix: '',
                    suffix: '',
                    rounding: 0,
                    formatter: null
                },
                dimensions: {
                    height: null,
                    width: null
                },
                // Specific config for the globe projection
                globe: {
                    // Center on China: x:98, y:34
                    // Center on USA: x:-101, y:42
                    // Center on Australia: x:133, y:-26.5
                    // Center on Europe: x:13, y:44
                    // etc
                    center: {
                        x: 0,
                        y: 0
                    },
                    waterColor: COLOR_BLUE,
                },
                territory: {
                    stroke: '#666666',
                    emptyColor: '#E0E0E0',
                    strokeWidth: 0.5,
                    strokeWidthSelected: 2,
                    colors: {
                        min: '#E0E0E0',
                        max: null, // defaults to palette[0] if kept null
                    },
                    showTaiwanAsPartOfChina: false,
                },
                tooltip: {
                    ...TOOLTIP,
                    showMinimap: true
                },
                title: TITLE,
                legend: {
                    ...LEGEND,
                    position: 'bottom'
                }
            }
        },
        table: {
            ...TABLE,
            useDialog: false,
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0,
            },
            columnNames: {
                series: 'Country',
                value: 'Value',
                category: 'Category'
            }
        },
    }

    const vue_ui_ridgeline = {
        skeletonDataset: null,
        skeletonConfig: null,
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        events: { // v3
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        customPalette: [],
        useCssAnimation: false, // v2 = true
        userOptions: USER_OPTIONS({
            tooltip: false,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            labels: false,
            fullscreen: true,
            stack: false,
            annotator: true,
            svg: true
        }),
        table: {
            ...TABLE,
            useDialog: false,
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0
            },
            columnNames: {
                series: 'Series',
            }
        },
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                padding: PADDING([12, 0, 0, 12]),
                title: TITLE,
                legend: LEGEND,
                dialog: {
                    show: true,
                    backgroundColor: COLOR_BACKGROUND,
                    color: COLOR_TEXT_PRIMARY,
                    header: {
                        backgroundColor: COLOR_GRID,
                        color: COLOR_TEXT_PRIMARY
                    },
                    xyChart: {
                        ...vue_ui_xy,
                        responsive: true,
                        line: {
                            ...vue_ui_xy.line,
                            showTransition: false,
                            labels: {
                                ...vue_ui_xy.line.labels,
                                show: true
                            }
                        },
                        chart: {
                            ...vue_ui_xy.chart,
                            tooltip: {
                                ...vue_ui_xy.chart.tooltip,
                                showPercentage: false
                            },
                            userOptions: {
                                ...vue_ui_xy.chart.userOptions,
                                buttons: {
                                    ...vue_ui_xy.chart.userOptions.buttons,
                                    pdf: false,
                                    fullscreen: false,
                                }
                            },
                            zoom: {
                                ...vue_ui_xy.chart.zoom,
                                minimap: {
                                    ...vue_ui_xy.chart.zoom.minimap,
                                    show: true,
                                }
                            }
                        }
                    }
                },
                areas: {
                    height: 60, // height > rowHeight results in the classic ridgeline look
                    rowHeight: 30,
                    strokeWidth: 1,
                    stroke: {
                        useSerieColor: false,
                        color: COLOR_WHITE,
                    },
                    smooth: true, // Also applied in dialog chart
                    opacity: 0.9,
                    useCommonColor: false,
                    useGradient: true,
                    maxPoint: {
                        show: true,
                        adaptStrokeToBackground: true,
                        stroke: COLOR_BLACK,
                        strokeWidth: 1,
                        strokeDasharray: 4,
                    },
                },
                selector: {
                    show: true,
                    stroke: COLOR_GREY_MID,
                    strokeWidth: 1,
                    strokeDasharray: 2,
                    labels: {
                        fontSize: 12,
                        formatter: null,
                        rounding: 0,
                        color: COLOR_TEXT_PRIMARY,
                    },
                    dot: {
                        radius: 4,
                        useDatapointColor: true,
                        fill: COLOR_GREY_MID,
                        stroke: COLOR_WHITE,
                        strokeWidth: 0.5
                    },
                },
                zeroLine: {
                    show: true,
                    strokeWidth: 1,
                    strokeDasharray: 0,
                    useSerieColor: false,
                    stroke: COLOR_GREY_MID
                },
                xAxis: {
                    labels: {
                        prefix: '',
                        suffix: '',
                        rotation: 0,
                        autoRotate: { // v3
                            enable: true, // v3
                            angle: -30 // v3
                        },
                        values: [],
                        datetimeFormatter: AXIS_DATE_FORMATTER,
                        color: COLOR_TEXT_PRIMARY,
                        fontSize: 14,
                        bold: false,
                        showOnlyAtModulo: false,
                        modulo: 12,
                        showOnlyFirstAndLast: false,
                        offsetY: 0,
                    }
                },
                yAxis: {
                    labels: {
                        fontSize: 16,
                        bold: false,
                        color: COLOR_TEXT_PRIMARY,
                        offsetX: 0
                    }
                }
            }
        }
    }

    const vue_ui_chord = {
        debug: false, // v3
        loading: false, // v3
        responsive: false,
        events: {
            datapointEnter: null, // v3
            datapointLeave: null, // v3
            datapointClick: null, // v3
        },
        theme: '',
        customPalette: [],
        enableRotation: true,
        initialRotation: 0,
        useCssAnimation: false, // v2 = true
        userOptions: USER_OPTIONS({
            tooltip: false,
            pdf: true,
            csv: true,
            img: true,
            table: true,
            labels: false,
            fullscreen: true,
            stack: false,
            annotator: true,
            svg: true
        }),
        table: {
            ...TABLE,
            useDialog: false,
            th: TABLE_TH,
            td: TABLE_TD,
        },
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                legend: {
                    ...LEGEND,
                    position: 'bottom'
                },
                title: TITLE,
                arcs: {
                    innerRadiusRatio: 1,
                    outerRadiusRatio: 1,
                    padAngle: 5,
                    stroke: COLOR_WHITE,
                    strokeWidth: 1,
                    labels: {
                        show: true,
                        fontSize: 14,
                        bold: false,
                        curved: false,
                        adaptColorToBackground: true, // Applied if curved
                        color: COLOR_TEXT_PRIMARY, // If curved, applied if !adaptColorToBackground
                        offset: 0,
                        showPercentage: true,
                        roundingPercentage: 0,
                    }
                },
                ribbons: {
                    stroke: COLOR_WHITE,
                    strokeWidth: 1,
                    underlayerOpacity: 1,
                    labels: {
                        show: true,
                        formatter: null,
                        prefix: '',
                        suffix: '',
                        rounding: 0,
                        fontSize: 14,
                        bold: false,
                        useSerieColor: false,
                        color: COLOR_TEXT_PRIMARY,
                        offset: 0,
                        minSeparationDeg: 3,
                        connector: {
                            stroke: COLOR_BLACK,
                            strokeWidth: 1
                        },
                        marker: {
                            show: true,
                            radius: 3,
                            stroke: COLOR_WHITE,
                            strokeWidth: 1
                        }
                    }
                },
            }
        }
    }

    const vue_ui_dag = {
        skeletonConfig: null,
        skeletonDataset: null,
        loading: false,
        debug: false,
        responsive: false,
        theme: '',
        userOptions: USER_OPTIONS({
            tooltip: false,
            pdf: true,
            csv: false,
            img: true,
            fullscreen: true,
            annotator: true,
            svg: true,
            zoom: true
        }),
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                width: null,
                height: null,
                backgroundPattern: {
                    show: false,
                    spacingRatio: 3,
                    dotRadiusRatio: 5,
                    dotColor: COLOR_GRID,
                    opacity: 1,
                },
                layout: {
                    rankDirection: 'TB',
                    rankSeparation: 60,
                    nodeSeparation: 50,
                    edgeSeparation: 30,
                    nodeWidth: 100,
                    nodeHeight: 40,
                    curvedEdges: true,
                    padding: 48,
                    arrowShape: 'vee',
                    arrowSize: 8,
                    align: undefined
                },
                nodes: {
                    stroke: COLOR_GREY_MID,
                    strokeWidth: 1,
                    borderRadius: 3,
                    backgroundColor: COLOR_BACKGROUND,
                    labels: {
                        color: COLOR_TEXT_PRIMARY,
                        fontSize: FONT._12,
                        bold: false
                    },
                    tooltip: {
                        showOnClick: false,
                        backgroundColor: COLOR_GRID,
                        color: COLOR_TEXT_PRIMARY,
                        maxWidth: '300px'
                    },
                    selected: {
                        stroke: null,
                        strokeWidth: null,
                        backgroundColor: null,
                        labelColor: null,
                        downstreamEdges: {
                            stroke: null,
                            animated: null,
                        },
                        upstreamEdges: {
                            stroke: null,
                            animated: null,
                        }
                    }
                },
                edges: {
                    stroke: COLOR_GREY_MID,
                    strokeWidth: 1,
                    animations: {
                        dasharray: '2 6',
                        animationDurationMs: 1000
                    }
                },
                midpoints: {
                    show: false,
                    radius: 4,
                    stroke: COLOR_GREY_MID,
                    fill: COLOR_WHITE,
                    strokeWidth: 1,
                    tooltip: {
                        maxWidth: '300px',
                        backgroundColor: COLOR_GRID,
                        color: COLOR_TEXT_PRIMARY,
                    },
                    selectedEdge: {
                        stroke: null,
                        animated: null
                    }
                },
                controls: {
                    position: 'bottom',
                    show: true,
                    backgroundColor: COLOR_GRID,
                    buttonColor: COLOR_GRID,
                    color: COLOR_TEXT_PRIMARY,
                    fontSize: 14,
                    border: `1px solid ${COLOR_BORDER}`,
                    padding: `0.5rem`,
                    borderRadius: `0.25rem`
                },
                zoom: {
                    active: true,
                },
                title: TITLE
            }
        }
    }

    const vue_ui_geo = {
        skeletonDataset: null,
        skeletonConfig: null,
        loading: false,
        debug: false,
        responsive: false,
        projection: 'equirectangular',
        theme: '',
        userOptions: USER_OPTIONS({
            tooltip: true,
            pdf: true,
            csv: false,
            img: true,
            svg: true,
            table: false,
            labels: false,
            fullscreen: true,
            annotator: true,
            zoom: true,
        }),
        map: {
            geoJson: null,
            center: [0, 0],
            fitPadding: 0,
        },
        events: {
            datapointEnter: null,
            datapointLeave: null,
            datapointClick: null,
            territoryEnter: null,
            territoryLeave: null,
            territoryClick: null,
        },
        style: {
            fontFamily: 'inherit',
            chart: {
                dimensions: {
                    width: null,
                    height: null
                },
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                territory: {
                    fill: '#F2F3F5',
                    stroke: '#D0D4D8',
                    strokeWidth: 1,
                    hover: {
                        enabledWhenEmpty: false,
                        fill: COLOR_GRID,
                        stroke: COLOR_GREY_MID,
                        strokeWidth: 1.5
                    }
                },
                points: {
                    radius: 1,
                    stroke: COLOR_WHITE,
                    strokeWidth: 1,
                    fill: COLOR_GREY_DARK,
                    hoverRadiusRatio: 1.2,
                    labels: {
                        show: true,
                        fontSizeRatio: 1,
                        color: COLOR_TEXT_PRIMARY,
                        offsetY: 0,
                    }
                },
                controls: {
                    position: 'bottom',
                    show: true,
                    backgroundColor: COLOR_GRID,
                    buttonColor: COLOR_GRID,
                    color: COLOR_TEXT_PRIMARY,
                    fontSize: 14,
                    border: `1px solid ${COLOR_BORDER}`,
                    padding: `0.5rem`,
                    borderRadius: `0.25rem`
                },
                title: TITLE,
                tooltip: TOOLTIP,
                zoom: {
                    active: true,
                }
            }
        },
    }

    const vue_ui_bump = {
        skeletonConfig: null,
        skeletonDataset: null,
        loading: false,
        debug: false,
        responsive: false,
        theme: '',
        customPalette: [],
        useCssAnimation: false,
        events: {
            datapointEnter: null,
            datapointLeave: null,
            datapointClick: null,
        },
        userOptions: USER_OPTIONS({
            tooltip: false,
            pdf: true,
            csv: true,
            img: true,
            svg: true,
            table: true,
            labels: false,
            fullscreen: true,
            sort: false,
            stack: false,
            animation: false,
            annotator: true,
            zoom: false,
        }),
        table: {
            ...TABLE,
            useDialog: false,
            columnNames: {
                series: 'Series',
                period: 'Period',
                values: 'Values',
                ranking: 'Ranking'
            },
            th: TABLE_TH,
            td: {
                ...TABLE_TD,
                roundingValue: 0
            },
        },
        style: {
            fontFamily: 'inherit',
            chart: {
                backgroundColor: COLOR_BACKGROUND,
                color: COLOR_TEXT_PRIMARY,
                height: 500,
                width: 800,
                layout: {
                    timeLabels: {
                        show: true,
                        values: [],
                        datetimeFormatter: AXIS_DATE_FORMATTER,
                        offsetY: 0,
                        rotation: 0,
                        autoRotate: {
                            enable: true,
                            angle: -30
                        },
                        fontSize: FONT._14,
                        color: COLOR_TEXT_PRIMARY,
                        bold: false,
                        showOnlyFirstAndLast: false,
                        showOnlyAtModulo: false,
                        modulo: 12
                    },
                    lines: {
                        smooth: true,
                        strokeWidth: 4,
                        coatingColor: COLOR_WHITE
                    },
                    plots: {
                        stroke: COLOR_WHITE,
                        strokeWidth: 1,
                        radius: 12,
                        labels: {
                            color: 'auto',
                            show: true,
                            bold: true,
                            displayedValue: 'value', // 'rank' | 'value'
                            fontSize: FONT._12,
                            prefix: '',
                            suffix: '',
                            rounding: 0,
                            formatter: null
                        }
                    },
                    nameLabels: {
                        fontSize: FONT._14,
                        color: COLOR_TEXT_PRIMARY,
                        useSerieColor: false,
                        bold: false,
                        offsetX: 0,
                        leftLabels: {
                            show: true,
                        },
                        rightLabels: {
                            show: true
                        }
                    }
                },
                padding: PADDING([12, 12, 12, 12]),
                title: TITLE,
            }
        }
    }

    return {
        vue_ui_xy,
        vue_ui_donut,
        vue_ui_treemap,
        vue_ui_waffle,
        vue_ui_radar,
        vue_ui_quadrant,
        vue_ui_gauge,
        vue_ui_wheel,
        vue_ui_tiremarks,
        vue_ui_chestnut,
        vue_ui_onion,
        vue_ui_vertical_bar, // deprecate in v4
        vue_ui_horizontal_bar, // v3
        vue_ui_heatmap,
        vue_ui_scatter,
        vue_ui_candlestick,
        vue_ui_sparkline,
        vue_ui_sparkbar,
        vue_ui_sparkstackbar,
        vue_ui_sparkhistogram,
        vue_ui_sparkgauge,
        vue_ui_spark_trend,
        vue_ui_quick_chart,
        vue_ui_age_pyramid,
        vue_ui_relation_circle,
        vue_ui_thermometer,
        vue_ui_rings,
        vue_ui_donut_evolution,
        vue_ui_mood_radar,
        vue_ui_molecule,
        vue_ui_nested_donuts,
        vue_ui_galaxy,
        vue_ui_strip_plot,
        vue_ui_dumbbell,
        vue_ui_3d_bar,
        vue_ui_table_sparkline,
        vue_ui_table_heatmap,
        vue_ui_word_cloud,
        vue_ui_xy_canvas,
        vue_ui_flow,
        vue_ui_parallel_coordinate_plot,
        vue_ui_timer,
        vue_ui_carousel_table,
        vue_ui_gizmo,
        vue_ui_stackbar,
        vue_ui_bullet,
        vue_ui_funnel,
        vue_ui_history_plot,
        vue_ui_world,
        vue_ui_ridgeline,
        vue_ui_chord,
        vue_ui_stackline,
        vue_ui_dag,
        vue_ui_geo,
        vue_ui_bump,
        // non chart components
        vue_ui_cursor,
        vue_ui_accordion,
        vue_ui_kpi,
        vue_ui_mini_loader,
        vue_ui_smiley,
        vue_ui_rating,
        vue_ui_annotator,
        vue_ui_dashboard,
        vue_ui_skeleton,
        vue_ui_table,
        vue_ui_digits,
        vue_ui_circle_pack
    }
}