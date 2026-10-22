import Subject from '../../src/atoms/vue-ui-pattern.vue';
import { expect, waitFor } from 'storybook/test';
import { catalogArgs } from '../support/catalog.js';
import { components } from '../fixtures/components.js';
const base = { name: 'grid', id: 'catalog-pattern' };
export default {
    title: 'Utilities/VueUiPattern',
    component: Subject,
    tags: ['autodocs'],
    args: catalogArgs(base),
    argTypes: { dataset: { control: 'object' }, config: { control: 'object' } },
    render: (args) => ({
        components: { Subject },
        setup: () => ({ args }),
        template:
            '<div data-catalog style="width:100%;min-height:120px"><svg viewBox="0 0 240 140" style="width:100%;max-width:600px"><defs><Subject v-bind="args" /></defs><rect width="240" height="140" fill="url(#catalog-pattern)" /></svg></div>',
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
            '<div data-catalog style="width:100%;max-width:440px;resize:horizontal;overflow:auto;min-height:200px"><svg viewBox="0 0 240 140" style="width:100%;max-width:600px"><defs><Subject v-bind="args" /></defs><rect width="240" height="140" fill="url(#catalog-pattern)" /></svg></div>',
    }),
};
