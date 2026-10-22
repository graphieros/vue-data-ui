import Subject from '../../src/components/vue-ui-accordion.vue';
import { expect, waitFor } from 'storybook/test';
import { catalogArgs } from '../support/catalog.js';
import { components } from '../fixtures/components.js';
const base = { config: { title: 'Details' } };
export default {
    title: 'Layout and Dashboard/VueUiAccordion',
    component: Subject,
    tags: ['autodocs'],
    args: catalogArgs(base),
    argTypes: { dataset: { control: 'object' }, config: { control: 'object' } },
    render: (args) => ({
        components: { Subject },
        setup: () => ({ args }),
        template:
            '<div data-catalog style="width:100%;min-height:120px"><Subject v-bind="args"><template #title>Details</template><div>Custom accordion content</div></Subject></div>',
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
export const Customized = {
    args: { config: { ...base.config, theme: 'celebration' } },
};
export const Dark = {
    globals: { backgrounds: { value: 'dark' } },
    args: { config: { ...base.config, theme: 'hack' } },
};
export const Responsive = {
    args: { config: { ...base.config, responsive: true } },
    render: (args) => ({
        components: { Subject },
        setup: () => ({ args }),
        template:
            '<div data-catalog style="width:100%;max-width:440px;resize:horizontal;overflow:auto;min-height:200px"><Subject v-bind="args"><template #title>Details</template><div>Custom accordion content</div></Subject></div>',
    }),
};
