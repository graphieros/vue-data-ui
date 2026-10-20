import {
    VueUiGraph,
    type VueUiGraphDataset,
    type VueUiGraphConfig,
    type VueUiGraphExpose,
} from 'vue-data-ui';
const dataset: VueUiGraphDataset = {
    nodes: [{ id: 1, metadata: { a: true } }],
    links: [{ source: 1, target: 1, directed: true }],
};
const config: VueUiGraphConfig = {
    events: {
        datapointEnter: ({ datapoint, seriesIndex }) => {
            const id: string | number = datapoint.id;
            const index: number = seriesIndex;
        },
        datapointLeave: null,
        datapointClick: ({ datapoint }) => {
            const label: string | undefined = datapoint.label;
        },
    },
    theme: 'hack',
    devHints: { enable: false },
    skeletonDataset: { nodes: [{ id: 'placeholder' }], links: [] },
    skeletonConfig: { tooltip: { show: false } },
    interaction: { zoom: { fitOnDoubleClick: false } },
    performance: { nodeBatchThreshold: 0 },
    style: {
        chart: {
            links: { arrows: { showOnHover: true } },
            controls: { position: 'bottom', fontSize: 14 },
            nodes: {
                stroke: '#FFFFFF',
                hover: { stroke: '#2D353C', strokeWidth: 3 },
                selected: { stroke: '#FFB74D', strokeWidth: 3 },
                glow: { show: true },
                gradientColor: '#FFCC88',
                labels: { maxCount: 50 },
            },
        },
    },
    table: {
        useDialog: true,
        columnNames: { nodes: 'People', links: 'Relationships' },
    },
    userOptions: {
        buttons: {
            csv: true,
            img: true,
            svg: true,
            table: true,
            annotator: true,
        },
        annotatorPalette: ['#FF0000', '#00FF00'],
        callbacks: {
            csv: (content) => {
                const csv: string = content ?? '';
                void csv;
            },
        },
    },
    tooltip: {
        borderWidth: 2,
        borderRadius: 8,
        teleportTo: 'body',
        smooth: true,
        customFormat: (scope) => String(scope.datapoint.metadata),
    },
};
declare const graph: InstanceType<typeof VueUiGraph>;
const api: VueUiGraphExpose = graph;
api.focusNode(dataset.nodes[0].id);
api.fitToView();
api.getImage({ scale: 2 });
api.generateCsv((content) => {
    const csv: string = content ?? '';
    void csv;
});
api.generateSvg();
api.toggleTable();
api.toggleZoom();
api.toggleTooltip();
api.toggleAnnotator();
// @ts-expect-error IDs cannot be objects
const bad: VueUiGraphDataset = { nodes: [{ id: {} }], links: [] };
const badConfig: VueUiGraphConfig = {
    // @ts-expect-error glow is an object
    style: { chart: { nodes: { glow: true } } },
};
void [config, bad, badConfig];
