import VueUiBullet from "./vue-ui-bullet.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { dataset, config } = components.find(c => c.name === 'VueUiBullet');

describe('<VueUiBullet />', () => {
    it('renders', () => {
        cy.mount(VueUiBullet, {
            props: {
                dataset,
                config
            }
        }).then(() => {
            testCommonFeatures({
                userOptions: true,
                title: true,
                subtitle: true,
                legend: true
            });

            cy.log('Legend items');
            cy.get('.vue-data-ui-legend-item').as('legend').should('have.length', 3);
            cy.get('@legend').each((item, i) => {
                cy.wrap(item).as('item');
                cy.get('@item').contains(dataset.segments[i].name);
                cy.get('@item').contains(dataset.segments[i].from);
                cy.get('@item').contains(dataset.segments[i].to);
            });

            cy.log('Bullet segments');
            cy.get('[data-cy="vue-ui-bullet-segment"]').should('exist').and('be.visible').and('have.length', 3);

            cy.log('Bullet target');
            cy.get('[data-cy="vue-ui-bullet-target-top"]').should('exist').and('be.visible');

            cy.log('Value label');
            cy.get('[data-cy="vue-ui-bullet-value-label"]').should('exist').and('be.visible').and('contain', dataset.value);

            cy.log('Value bar');
            cy.get('[data-cy="vue-ui-bullet-value-bar"]').should('exist').and('be.visible');

            cy.log('Ticks');
            cy.get('[data-cy="vue-ui-bullet-tick-label"]').as('tickLabels').should('exist').and('be.visible').and('have.length', 11);
            cy.get('@tickLabels').first().contains(dataset.segments[0].from);
            cy.get('@tickLabels').last().contains(dataset.segments.at(-1).to);
            cy.get('[data-cy="vue-ui-bullet-tick-marker"]').should('exist').and('have.length', 11);
        });
    });
});