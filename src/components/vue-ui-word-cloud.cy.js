import VueUiWordCloud from "./vue-ui-word-cloud.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { dataset, config } = components.find(c => c.name === 'VueUiWordCloud');

describe('<VueUiWordCloud />', () => {

    it('renders', () => {
        cy.viewport(500, 570);
        cy.mount(VueUiWordCloud, {
            props: {
                dataset,
                config
            }
        }).then(() => {
            
            testCommonFeatures({
                userOptions: true,
                title: true,
                subtitle: true,
                dataTable: true,
                tooltipCallback: () => {
                    cy.get('[data-cy="datapoint-word"]').first().trigger('mouseover', { force: true })
                }
            });

            cy.get('[data-cy="datapoint-word"]').should('exist').and('be.visible').and('have.length', 5);
        });
    });
});