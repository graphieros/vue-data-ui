import VueUiGeo from './vue-ui-geo.vue';
import { components } from '../../cypress/fixtures/vdui-components';
import { testCommonFeatures } from '../../cypress/fixtures';

const { config, dataset } = components.find(c => c.name === 'VueUiGeo');

describe('<VueUiGeo />', () => {

    function commonTest() {
        testCommonFeatures({
            userOptions: true,
            title: true,
            subtitle: true,
            legend: false,
            dataTable: false,
            tooltipCallback: () => {
                cy.get('[data-cy="tooltip-trap-territory"]').first().trigger('mouseenter', { force: true });
            } 
        });
    }

    it('renders', () => {
        cy.mount(VueUiGeo, {
            props: {
                dataset,
                config
            },
        }).then(({ wrapper }) => {
            commonTest();
        });
    });
});