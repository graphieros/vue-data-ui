import VueUiMolecule from "./vue-ui-molecule.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { dataset, config } = components.find(c => c.name === 'VueUiMolecule');

describe('<VueUiMolecule />', () => {
    it('renders', () => {
        cy.viewport(500,550);
        cy.mount(VueUiMolecule, {
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
                    cy.get('[data-cy="recursive-circle"]').first().trigger('mouseover', { force: true });
                }
            });

            cy.get('[data-cy="recursive-circle"]').should('exist').and('be.visible').and('have.length', 76);
            cy.get('[data-cy="recursive-link-wrapper"]').should('exist').and('be.visible').and('have.length', 75);
            cy.get('[data-cy="recursive-link"]').should('exist').and('be.visible').and('have.length', 75);
            cy.get('[data-cy="recursive-label"]').should('exist').and('be.visible').and('have.length', 76);
            
            cy.log('toggle labels');
            cy.get('[data-cy="user-options-summary"]').click();
            cy.get('[data-cy="user-options-label"]').click();
            cy.get('[data-cy="recursive-label"]').should('not.exist')
            cy.get('[data-cy="user-options-label"]').click();
            cy.get('[data-cy="recursive-label"]').should('exist').and('be.visible').and('have.length', 76);
        });
    });
});