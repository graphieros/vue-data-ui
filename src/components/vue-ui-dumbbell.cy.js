import VueUiDumbbell from "./vue-ui-dumbbell.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { dataset, config } = components.find(c => c.name === 'VueUiDumbbell');

describe('<VueUiDumbbell />', () => {
    it('renders', () => {
        cy.spy(window, 'requestAnimationFrame').as('rafSpy');

        cy.mount(VueUiDumbbell, {
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
                subtitle: true,
                table: true,
            });

            cy.log('grid');
            cy.get('[data-cy="grid-line-y"]').should('exist').and('have.length', 9).and('have.css', 'opacity', '1');
            cy.get('[data-cy="grid-line-x"]').should('exist').and('have.length', 6).and('have.css', 'opacity', '1');
            cy.get('[data-cy="grid-base-x"]').should('exist').and('have.css', 'opacity', '1');

            cy.log('y labels');
            cy.get('[data-cy="label-y-name"]').as('yLabelNames').should('exist').and('be.visible');
            cy.get('@yLabelNames').each((label, i) => {
                cy.wrap(label).as('label');
                cy.get('@label').contains(dataset[i].name);
            });
            cy.get('[data-cy="label-y-value"]').should('exist').and('be.visible').and('contain', '%');

            cy.log('x labels');
            cy.get('[data-cy="label-x"]').as('xLabels').should('exist').and('be.visible').and('have.length', 9);

            cy.log('links');
            cy.get('[data-cy="link-curved"]').should('exist').and('be.visible').and('have.length', dataset.length);

            cy.log('datapoints');
            cy.get('[data-cy="datapoint-start"]').should('exist').and('be.visible').and('have.length', dataset.length);
            cy.get('[data-cy="datapoint-end"]').should('exist').and('be.visible').and('have.length', dataset.length);
            cy.get('[data-cy="datapoint-label-start"]').should('exist').and('be.visible').and('have.length', dataset.length);
            cy.get('[data-cy="datapoint-label-start"]').should('exist').and('be.visible').and('have.length', dataset.length);
            cy.get('[data-cy="datapoint-label-end"]').should('exist').and('be.visible').and('have.length', dataset.length);
            cy.get('[data-cy="datapoint-label-end"]').should('exist').and('be.visible').and('have.length', dataset.length);
        });
    });
});