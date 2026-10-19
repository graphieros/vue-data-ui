// A settled network of three small communities, with a few bridges between them.
export const graphSkeletonDataset = {
    nodes: [
        ['center', 0, 0, 18],
        ['west', -110, -65, 15],
        ['east', 115, -45, 16],
        ['south', 20, 115, 14],
        ['w1', -190, -90, 7],
        ['w2', -145, -155, 9],
        ['w3', -65, -140, 6],
        ['w4', -195, -5, 8],
        ['w5', -115, 25, 6],
        ['e1', 70, -135, 8],
        ['e2', 160, -130, 6],
        ['e3', 205, -55, 9],
        ['e4', 175, 35, 7],
        ['e5', 85, 40, 6],
        ['s1', -65, 95, 8],
        ['s2', -50, 185, 6],
        ['s3', 40, 205, 9],
        ['s4', 115, 150, 7],
        ['s5', 100, 90, 6],
    ].map(([id, x, y, radius]) => ({
        id: `skeleton-${id}`, x, y, radius, fixed: true,
    })),
    links: [
        ['center', 'west'], ['center', 'east'], ['center', 'south'],
        ['west', 'w1'], ['west', 'w2'], ['west', 'w3'],
        ['west', 'w4'], ['west', 'w5'],
        ['w1', 'w2'], ['w2', 'w3'], ['w4', 'w5'],
        ['east', 'e1'], ['east', 'e2'], ['east', 'e3'],
        ['east', 'e4'], ['east', 'e5'],
        ['e1', 'e2'], ['e2', 'e3'], ['e4', 'e5'],
        ['south', 's1'], ['south', 's2'], ['south', 's3'],
        ['south', 's4'], ['south', 's5'],
        ['s1', 's2'], ['s2', 's3'], ['s4', 's5'],
        ['w3', 'e1'], ['w5', 's1'], ['e5', 's5'],
    ].map(([source, target]) => ({
        source: `skeleton-${source}`, target: `skeleton-${target}`,
    })),
};

export const graphSkeletonConfig = {
    animation: { enabled: false },
    layout: { iterations: 0 },
    viewport: { initialFit: true },
    userOptions: { show: false },
    table: { show: false },
    tooltip: { show: false },
    events: { datapointEnter: null, datapointLeave: null, datapointClick: null },
    interaction: { zoom: { enabled: false }, pan: { enabled: false }, drag: { enabled: false } },
    style: {
        chart: {
            backgroundColor: '#99999930',
            controls: { show: false },
            nodes: {
                colorByGroup: false, color: '#BABABA', stroke: '#CCCCCC',
                sizeByValue: false, sizeByDegree: false, radius: 10,
                gradient: false, glow: { show: false }, labels: { show: false },
            },
            links: { color: '#CCCCCC', glow: false, arrows: { show: false }, pulses: { show: false, showOnHover: false } },
        },
    },
};
