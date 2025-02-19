import VueUiOnion from "./vue-ui-onion.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { dataset, config } = components.find(c => c.name === 'VueUiOnion');

describe('<VueUiOnion />', () => {
    
    it('renders', () => {
        cy.viewport(500, 580);
        cy.mount(VueUiOnion, {
            props: {
                dataset,
                config
            }
        }).then(() => {
            
            testCommonFeatures({
                userOptions: true,
                title: true,
                subtitle: true,
                legend: true,
                dataTable: true,
                tooltipCallback: () => {
                    cy.get('[data-cy="tooltip-trap"]').first().trigger('mouseenter', { force: true });
                }
            });

            cy.log('gutters');
            cy.get('[data-cy="onion-gutter"]').should('exist').and('be.visible').and('have.length', dataset.length);
            
            cy.log('tracks');
            cy.get('[data-cy="onion-track"]').should('exist').and('be.visible').and('have.length', dataset.length);

            cy.log('gradients');
            cy.get('[data-cy="onion-gradient"]').should('exist').and('be.visible').and('have.length', dataset.length);
            
            cy.log('data labels');
            cy.get('[data-cy="onion-label"]').as('labels').should('exist').and('be.visible').and('have.length', dataset.length);
            cy.get('@labels').each((label,i) => {
                cy.wrap(label).as('label');
                cy.get('@label')
                    .should('contain', dataset[i].name)
                    .and('contain', dataset[i].percentage)
                    .and('contain', '%')
            });
        });
    });
});