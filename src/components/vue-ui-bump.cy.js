import VueUiBump from "./vue-ui-bump.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { dataset, config } = components.find(c => c.name === 'VueUiBump');

describe('<VueUiBump />', () => {
    it('renders', () => {
        cy.mount(VueUiBump, {
            props: {
                dataset,
                config
            }
        }).then(() => {
            testCommonFeatures({
                userOptions: true,
                title: true,
                subtitle: true,
                slicer: false,
                dataTable: true,
                legend: false,
            });
        });
    });
});