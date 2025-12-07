import VueUiDag from "./vue-ui-dag.vue";
import { components } from '../../cypress/fixtures/vdui-components';
import { testCommonFeatures } from '../../cypress/fixtures';
import { h } from "vue";

const { config, dataset } = components.find(c => c.name === 'VueUiDag');

describe('<VueUiDag />', () => {
    it('renders', () => {
        cy.mount(VueUiDag, {
            props: {
                dataset,
                config
            }
        }).then(() => {
            testCommonFeatures({
                userOptions: true,
                title: true,
                subtitle: true,
                legend: false,
                dataTable: false,
            });

            cy.get('[data-cy-node]').first().click({ force: true});
            cy.get('[data-cy-tooltip-node]').should('be.visible').and('contain', 'AAA')

            cy.get('[data-cy-midpoint]').first().trigger('mouseenter')
            cy.get('[data-cy-tooltip-midpoint]').should('exist').and('contain', 'AAA → BBB')

            cy.get('[data-cy-zoom-in]').click()
            cy.wait(300)
            cy.get('[data-cy-zoom-reset]').should('contain', '150%')
            cy.get('[data-cy-zoom-out]').click()
            cy.wait(300)
            cy.get('[data-cy-zoom-reset]').should('contain', '100%')
            cy.get('[data-cy-zoom-out]').click()
            cy.wait(300)
            cy.get('[data-cy-zoom-reset]').should('contain', '67%').click()
            cy.wait(300)
            cy.get('[data-cy-zoom-reset]').should('contain', '100%')
        })
    })
})