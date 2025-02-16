import VueUiAgePyramid from "./vue-ui-age-pyramid.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { dataset, config } = components.find(c => c.name === 'VueUiAgePyramid');

describe('<VueUiAgePyramid />', () => {
    it('renders', () => {
        cy.viewport(500, 540)
        cy.mount(VueUiAgePyramid, {
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
                    cy.get('[data-cy="tooltip-trap"]').eq(0).trigger('mouseover');
                }
            });

            cy.log('labels')
            cy.get('[data-cy="label-left"]').should('exist').and('be.visible').and('contain', 'female');
            cy.get('[data-cy="label-right"]').should('exist').and('be.visible').and('contain', 'male');
            cy.get('[data-cy="y-axis-label"]').as('y').should('exist').and('have.length', 2)
            cy.get('@y').first().contains('5')
            cy.get('@y').last().contains('0')

            cy.log('scale')
            cy.get('[data-cy="scale-line-left"]').should('exist')
            cy.get('[data-cy="scale-line-right"]').should('exist')
            cy.get('[data-cy="scale-tick-left"]').should('exist').and('have.length', 6)
            cy.get('[data-cy="scale-tick-right"]').should('exist').and('have.length', 6)
            cy.get('[data-cy="scale-tick-left-label"]').as('labelsLeft').should('exist').and('have.length', 6)
            cy.get('[data-cy="scale-tick-right-label"]').as('labelsRight').should('exist').and('have.length', 6)
            cy.get('@labelsLeft').first().should('contain', 400)
            cy.get('@labelsLeft').last().should('contain', 0)
            cy.get('@labelsRight').first().should('contain', 0)
            cy.get('@labelsRight').last().should('contain', 400)
        });
    });
});