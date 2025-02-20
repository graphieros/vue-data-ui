import VueUiTableSparkline from "./vue-ui-table-sparkline.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { dataset, config } = components.find(c => c.name === 'VueUiTableSparkline');

describe('<VueUiTableSparkline />', () => {

    it('renders', () => {
        cy.mount(VueUiTableSparkline, {
            props: {
                dataset,
                config
            }
        }).then(() => {
            
            testCommonFeatures({
                userOptions: true,
                title: true,
                subtitle: true
            });

            cy.get('[data-cy="th"]').should('exist').and('be.visible').and('have.length', 17);
            cy.get('[data-cy="tr"]').should('exist').and('have.length', dataset.length);
            cy.get('.vue-ui-sparkline').should('exist').and('be.visible').and('have.length', dataset.length);
        });
    });
});