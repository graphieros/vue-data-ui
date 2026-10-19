// Chart-specific defaults; useConfig adds the shared title, options menu and table defaults.
export const graphDefaults = {
    responsive: false,
    theme: '',
    a11y: {
        translations: {
            keyboardNavigation:
                'Use arrow keys to navigate nodes, Home or End to jump, Enter or Space to select, and Escape to clear selection.',
        },
    },
    loading: false,
    skeletonDataset: null,
    skeletonConfig: null,
    debug: false,
    devHints: { enable: false },
    customPalette: [],
    events: {
        datapointEnter: null,
        datapointLeave: null,
        datapointClick: null,
    },
    style: {
        chart: {
            width: 600,
            height: 600,
            padding: 36,
            backgroundColor: '#FFFFFF',
            color: '#2D353C',
            fontFamily: 'inherit',
            title: { text: '' },
            controls: {
                position: 'bottom',
                show: true,
                backgroundColor: '#e1e5e8',
                buttonColor: '#e1e5e8',
                color: '#2D353C',
                fontSize: 14,
                border: '1px solid #e1e5e8',
                padding: '0.5rem',
                borderRadius: '0.25rem',
            },
            nodes: {
                radius: 7,
                minRadius: 4,
                maxRadius: 24,
                sizeByValue: true,
                sizeByDegree: false,
                colorByGroup: true,
                color: '#42A5F5',
                opacity: 1,
                strokeWidth: 1,
                stroke: '#FFFFFF',
                gradient: true,
                gradientColor: '#FFFFFF',
                glow: { show: false, blur: 6, opacity: 0.6 },
                hover: { stroke: '#2D353C', strokeWidth: 3 },
                selected: { stroke: '#FFB74D', strokeWidth: 3 },
                labels: {
                    show: true,
                    strokeWidth: 3,
                    fontSize: 11,
                    color: '#2D353C',
                    position: 'bottom',
                    offsetY: 0,
                    hoverOnly: false,
                    selectedOnly: false,
                    maxCount: 150,
                    minZoom: 0,
                    maxLength: 40,
                },
            },
            links: {
                color: '#A1A1A1',
                opacity: 0.5,
                width: 1,
                widthByValue: false,
                maxWidth: 6,
                arrows: { show: false, showOnHover: true },
                pulses: {
                    show: false,
                    showOnHover: false,
                    reverse: false,
                    colorBySource: true,
                    color: '#FFB74D',
                    radius: 2,
                    opacity: 1,
                    duration: 1500,
                },
                glow: false,
            },
        },
    },
    layout: {
        chargeStrength: -120, // Node repulsion; more negative spreads nodes further.
        linkDistance: 80, // Target distance between connected node centers.
        linkStrength: 0.08, // How strongly links pull toward their target distance.
        centerStrength: 0.015, // Pull toward the graph center.
        collisionPadding: 3, // Minimum extra gap between node boundaries.
        friction: 0.85, // Velocity retained each step; lower values slow nodes faster.
        clusterStrength: 0, // Pull toward each group's center; 0 disables clustering.
        iterations: 300, // Maximum simulation steps before settling.
        strength: 1, // Multiplier for repulsion and link forces.
        theta: 0.8, // Repulsion approximation; higher is faster, lower is more accurate.
    },
    interaction: {
        zoom: { enabled: true, min: 0.2, max: 5, fitOnDoubleClick: true },
        pan: { enabled: true },
        drag: { enabled: true, pinOnRelease: false },
        highlight: {
            enabled: true,
            neighbors: true,
            keepSelection: true,
            dimOpacity: 0.12,
        },
    },
    tooltip: {
        show: true,
        backgroundColor: '#FFFFFF',
        color: '#2D353C',
        borderColor: '#CCCCCC',
        fontSize: 13,
        showMetadata: false,
        customFormat: null,
    },
    animation: { enabled: true, duration: 300 },
    userOptions: { show: true, useCursorPointer: true },
    viewport: { initialFit: true, fitOnResize: false, fitOnUpdate: false },
    performance: {
        effectThreshold: 300,
        stepsPerFrame: 1,
        nodeBatchThreshold: 300,
    },
};
