import VueUiFunnel from "./vue-ui-funnel.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { dataset, config } = components.find(c => c.name === 'VueUiFunnel');

describe('<VueUiFunnel />', () => {

    it('renders', () => {
        cy.mount(VueUiFunnel, {
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

            cy.log('circle links');
            cy.get('[data-cy="circle-links"]').should('exist').and('have.css', 'opacity', '1');

            cy.log('datapoints');
            cy.get('[data-cy="datapoint-circle"]').should('exist').and('be.visible').and('have.length', dataset.length);
            cy.get('[data-cy="datapoint-label"]').should('exist').and('be.visible').and('have.length', dataset.length).contains('%');

            cy.log('funnel area');
            cy.get('[data-cy="funnel-area"]').should('exist').and('be.visible');

            cy.log('datapoint bars');
            cy.get('[data-cy="datapoint-bar"]').should('exist').and('be.visible').and('have.length', dataset.length);

            cy.log('bar names');
            cy.get('[data-cy="bar-name"]').as('names').should('exist').and('be.visible').and('have.length', dataset.length);
            cy.get('@names').each((name, i) => {
                cy.wrap(name).as('name');
                cy.get('@name').contains(dataset[i].name);
            });
            
            cy.log('bar values');
            cy.get('[data-cy="bar-value"]').as('values').should('exist').and('be.visible').and('have.length', dataset.length);
        });
    });
});