import VueUiFlow from "./vue-ui-flow.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { dataset, config } = components.find(c => c.name === 'VueUiFlow');

describe('<VueUiFlow />', () => {

    it('renders', () => {
        cy.mount(VueUiFlow, {
            props: {
                dataset,
                config
            }
        }).then(() => {

            testCommonFeatures({
                userOptions: true,
                title: true,
                subtitle: true,
                dataTable: true
            });

            cy.log('nodes');
            cy.get('[data-cy="node"]').should('exist').and('be.visible').and('have.length', 11);

            cy.log('links');
            cy.get('[data-cy="link"]').should('exist').and('be.visible').and('have.length', 13);

            cy.log('node names');
            cy.get('[data-cy="node-name"]').should('exist').and('have.length', 11);
            
            cy.log('node values');
            cy.get('[data-cy="node-value"]').should('exist').and('have.length', 11);
        });
    });
});