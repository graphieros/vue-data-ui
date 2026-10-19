// Deterministic demonstration data, including disconnected communities and bridges.
export function communityGraph(count = 80, communities = 5) {
    const nodes = Array.from({ length: count }, (_, i) => ({
        id: i,
        label: `Member ${i + 1}`,
        group: i % communities,
        value: 1 + ((i * 17) % 25),
    }));
    const links = [];
    for (let i = 0; i < count; i++) {
        if (i + communities < count)
            links.push({
                source: i,
                target: i + communities,
                value: 1 + (i % 5),
            });
        if (i + communities * 2 < count)
            links.push({ source: i, target: i + communities * 2 });
        if (i + communities * 3 < count)
            links.push({ source: i, target: i + communities * 3 });
        if (i % 13 === 0 && i + 1 < count)
            links.push({ source: i, target: i + 1, directed: true });
    }
    return { nodes, links };
}
// Hub communities with long-range ties produce a dense network rather than parallel chains.
export function denseNetwork(count = 1000, communities = 8) {
    const nodes = Array.from({ length: count }, (_, id) => ({
        id,
        label: `Member ${id + 1}`,
        group: id % communities,
    }));
    const links = [],
        seen = new Set();
    let seed = 42;
    function random(limit) {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return Math.floor((seed / 4294967296) * limit);
    }
    function connect(source, target) {
        if (source === target || target >= count) return;
        const key = `${Math.min(source, target)}:${Math.max(source, target)}`;
        if (seen.has(key)) return;
        seen.add(key);
        links.push({ source, target });
    }
    for (let id = 0; id < count; id++) {
        const group = id % communities;
        const members = Math.ceil((count - group) / communities);
        connect(id, group); // Primary community hub.
        connect(id, group + (1 + random(2)) * communities);
        for (let j = 0; j < 3; j++)
            connect(id, group + random(members) * communities);
        if (id % 3 === 0) connect(id, random(count));
    }
    return { nodes, links };
}
export const socialGraph = {
    nodes: [
        'Alice',
        'Bob',
        'Charlie',
        'Diana',
        'Elliot',
        'Fatima',
        'Grace',
        'Hugo',
    ].map((label, i) => ({ id: i, label, group: i % 3, value: 4 + i })),
    links: [
        [0, 1],
        [0, 2],
        [1, 2],
        [1, 3],
        [2, 4],
        [3, 5],
        [4, 5],
        [5, 6],
        [5, 7],
        [6, 7],
    ].map(([source, target]) => ({ source, target })),
};
const names = [
    'Valjean',
    'Javert',
    'Fantine',
    'Cosette',
    'Marius',
    'Éponine',
    'Gavroche',
    'Enjolras',
    'Thénardier',
    'Bishop Myriel',
];
export const characterGraph = communityGraph(70, 6);
characterGraph.nodes.forEach((n, i) => {
    n.label = i < names.length ? names[i] : `Citizen ${i - names.length + 1}`;
});
const denseExample = denseNetwork();
// Primary hubs in three communities demonstrate individual color overrides.
for (const [id, color] of [
    [0, '#FFEA00'],
    [2, '#FF4081'],
    [5, '#76FF03'],
]) {
    denseExample.nodes[id].color = color;
}

export const graphExamples = [
    {
        name: 'Social network',
        dataset: socialGraph,
        config: {
            style: {
                chart: {
                    title: {
                        text: 'People & connections',
                        subtitle: { text: 'An interactive social network' },
                    },
                },
            },
        },
    },
    {
        name: 'Nodes without values',
        dataset: {
            nodes: socialGraph.nodes.map(({ id, label, group }) => ({
                id,
                label,
                group,
            })),
            links: socialGraph.links.map((link) => ({ ...link })),
        },
        config: {
            style: {
                chart: {
                    title: {
                        text: 'Nodes without values',
                        subtitle: {
                            text: 'Default node sizing when values are omitted',
                        },
                    },
                },
            },
        },
    },
    {
        name: 'Character relationships',
        dataset: characterGraph,
        config: {
            layout: { clusterStrength: 0.02 },
            style: { chart: { nodes: { labels: { maxCount: 80 } } } },
        },
    },
    {
        name: 'Communities',
        dataset: communityGraph(120),
        config: { layout: { clusterStrength: 0.04 } },
    },
    {
        name: 'Dense network',
        dataset: denseExample,
        config: {
            theme: 'dark',
            customPalette: [
                '#42A5F5',
                '#42D392',
                '#FFB74D',
                '#AB80FF',
                '#FF708D',
                '#42C8D8',
                '#FF8A65',
                '#7986CB',
            ],
            layout: {
                chargeStrength: -35,
                linkDistance: 30,
                linkStrength: 0.05,
                centerStrength: 0.025,
                clusterStrength: 0.015,
                collisionPadding: 1,
                friction: 0.75,
                iterations: 350,
            },
            interaction: { zoom: { min: 0.02 } },
            style: {
                chart: {
                    nodes: {
                        sizeByValue: false,
                        sizeByDegree: true,
                        minRadius: 2.5,
                        maxRadius: 18,
                        strokeWidth: 0.5,
                        labels: { hoverOnly: true },
                    },
                    links: { color: '#729DAD', opacity: 0.45, width: 0.9 },
                },
            },
        },
    },
];
