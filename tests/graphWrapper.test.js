import { createApp, h, nextTick } from 'vue';
import { expect, it } from 'vitest';
import VueDataUi from '../src/components/vue-data-ui.vue';
it('loads through the universal wrapper and forwards graph methods and events', async () => {
    const el = document.createElement('div');
    document.body.append(el);
    let api, selected;
    const app = createApp({
        render: () =>
            h(VueDataUi, {
                component: 'VueUiGraph',
                dataset: { nodes: [{ id: 'a' }], links: [] },
                config: {
                    animation: { enabled: false },
                    layout: { iterations: 0 },
                },
                onSelectNode: (n) => (selected = n),
                ref: (r) => (api = r),
            }),
    });
    app.mount(el);
    try {
        const data = await api.getData();
        expect(data.nodes[0].id).toBe('a');
        api.focusNode('a');
        await nextTick();
        expect(selected.id).toBe('a');
        const csv = [];
        api.generateCsv((content) => csv.push(content));
        expect(csv[0]).toContain('data:text/csv');
        expect(csv[0]).toContain('Nodes');
        api.fitToView();
        api.resetLayout();
        expect(el.querySelectorAll('.vue-ui-graph-node')).toHaveLength(1);
    } finally {
        app.unmount();
        el.remove();
    }
});
