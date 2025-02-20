import VueUiWheel from "./vue-ui-wheel.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { dataset, config } = components.find(c => c.name === 'VueUiWheel');

describe('<VueUiWheel />', () => {

    it('renders', () => {
        cy.viewport(500, 560);
        cy.spy(window, 'requestAnimationFrame').as('rafSpy');

        cy.mount(VueUiWheel, {
            props: {
                dataset,
                config
            }
        }).then(() => {

            cy.log('Animating');
            cy.get('@rafSpy').should('have.been.called');
            
            testCommonFeatures({
                userOptions: true,
                title: true,
                subtitle: true
            });

            cy.log('ticks');
            cy.get('[data-cy="wheel-tick"]').should('exist').and('be.visible').and('have.length', 100);

            cy.log('inner circle');
            cy.get('[data-cy="inner-circle"]').should('exist').and('be.visible');

            cy.log('data label');
            cy.get('[data-cy="data-label"]').should('exist').and('be.visible').and('contain', dataset.percentage).and('contain', '%');
        });
    });
});