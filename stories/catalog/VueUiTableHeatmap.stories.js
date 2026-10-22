import Subject from '../../src/components/vue-ui-table-heatmap.vue';
import { expect, waitFor } from 'storybook/test';
import { catalogArgs } from '../support/catalog.js';
import { components } from '../fixtures/components.js';
const base = {
    dataset: [
        { name: 'Alpha', values: [1, 2, 3] },
        { name: 'Beta', values: [3, 2, 1] },
    ],
};
export default {
    title: 'Tables/VueUiTableHeatmap',
    component: Subject,
    tags: ['autodocs'],
    args: catalogArgs(base),
    argTypes: { dataset: { control: 'object' }, config: { control: 'object' } },
    render: (args) => ({
        components: { Subject },
        setup: () => ({ args }),
        template:
            '<div data-catalog style="width:100%;min-height:120px"><Subject v-bind="args" /></div>',
    }),
    play: async ({ canvasElement }) => {
        await waitFor(() =>
            expect(
                canvasElement.querySelector('[data-catalog]').childElementCount,
            ).toBeGreaterThan(0),
        );
    },
};
export const Default = {};
export const Responsive = {
    args: { config: { ...base.config, responsive: true } },
    render: (args) => ({
        components: { Subject },
        setup: () => ({ args }),
        template:
            '<div data-catalog style="width:100%;max-width:440px;resize:horizontal;overflow:auto;min-height:200px"><Subject v-bind="args" /></div>',
    }),
};
export const Empty = { args: { dataset: [] } };
export const UndefinedDataset = { args: { dataset: undefined } };
export const Loading = { args: { config: { ...base.config, loading: true } } };
