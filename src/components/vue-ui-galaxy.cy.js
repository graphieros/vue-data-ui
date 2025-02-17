import VueUiGalaxy from "./vue-ui-galaxy.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { dataset, config } = components.find(c => c.name === 'VueUiGalaxy');

describe('<VueUiGalaxy />', () => {
    
    it('renders', () => {
        cy.mount(VueUiGalaxy, {
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
                    cy.get('[data-cy="tooltip-trap"]').first().trigger('mouseenter', { force: true })
                }
            });

            cy.log('datapoint borders');
            cy.get('[data-cy="datapoint-border"]').should('exist').and('be.visible').and('have.length', dataset.length);

            cy.log('datapoint paths');
            cy.get('[data-cy="datapoint-path"]').should('exist').and('be.visible').and('have.length', dataset.length);
        });
    });
});