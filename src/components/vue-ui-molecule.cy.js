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
                    cy.get('[data-cy="recursive-circle"]').first().trigger('mouseover');
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

            cy.log('zoom');
            cy.get('[data-cy="recursive-circle"]').eq(2).click();
            cy.get('[data-cy="cluster-svg"]').invoke('attr', 'viewBox').should('eq', '329.302356570748 158.64462809917356 82.71074380165288 82.71074380165288');

            cy.log('direction pad');
            cy.log('move left');
            cy.get('[data-cy="direction-pad-left"]').then(btn => {
                for(let i  = 0; i < 10; i += 1) {
                    cy.wait(10)
                    cy.wrap(btn).click()
                }
            });
            cy.get('[data-cy="cluster-svg"]').invoke('attr', 'viewBox').should('eq', '279.7155797112438 158.64462809917356 82.71074380165288 82.71074380165288');

            cy.log('move top');
            cy.get('[data-cy="direction-pad-top"]').then(btn => {
                for(let i  = 0; i < 10; i += 1) {
                    cy.wait(10)
                    cy.wrap(btn).click()
                }
            });
            cy.get('[data-cy="cluster-svg"]').invoke('attr', 'viewBox').should('eq', '279.7155797112438 109.05785123966936 82.71074380165288 82.71074380165288');

            cy.log('move right');
            cy.get('[data-cy="direction-pad-right"]').then(btn => {
                for(let i  = 0; i < 10; i += 1) {
                    cy.wait(10)
                    cy.wrap(btn).click()
                }
            });
            cy.get('[data-cy="cluster-svg"]').invoke('attr', 'viewBox').should('eq', '329.302356570748 109.05785123966936 82.71074380165288 82.71074380165288');

            cy.log('move down');
            cy.get('[data-cy="direction-pad-bottom"]').then(btn => {
                for(let i  = 0; i < 10; i += 1) {
                    cy.wait(10)
                    cy.wrap(btn).click()
                }
            });
            cy.get('[data-cy="cluster-svg"]').invoke('attr', 'viewBox').should('eq', '329.302356570748 158.64462809917356 82.71074380165288 82.71074380165288');

            cy.log('reset zoom');
            cy.get('[data-cy="direction-pad-reset"]').click();
            cy.get('[data-cy="cluster-svg"]').invoke('attr', 'viewBox').should('eq', '-0.15999999999996817 -0.1599999999999966 400.32 400.32');
        });
    });
});