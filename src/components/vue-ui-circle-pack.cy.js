import vueUiCirclePack from "./vue-ui-circle-pack.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";
import VueUiCirclePack from "./vue-ui-circle-pack.vue";

const { dataset, config } = components.find(c => c.name === 'VueUiCirclePack');

describe('<VueUiCirclePack />', () => {

    it('renders', () => {
        cy.mount(VueUiCirclePack, {
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
            });

            cy.log('datapoints');
            cy.get('[data-cy="datapoint-circle"]').should('exist').and('be.visible').and('have.length', dataset.length);

            cy.log('name labels');
            cy.get('[data-cy="label-name"]').as('nameLabels').should('exist').and('be.visible').and('have.length', dataset.length);
            cy.get('@nameLabels').each((label, _i) => {
                cy.wrap(label).as('label');
                cy.get('@label').contains('d_');
            });
            
            cy.log('value labels');
            cy.get('[data-cy="label-value"]').as('nameLabels').should('exist').and('be.visible').and('have.length', dataset.length);
            cy.get('@nameLabels').each((label, _i) => {
                cy.wrap(label).as('label');
                cy.get('@label').invoke('text').then(text => {
                    const num = parseInt(text.trim(), 10);
                    expect(num).to.be.a('number');
                });
            });

            cy.log('zoom');
            cy.get('[data-cy="datapoint-circle"]').first().trigger('mouseenter', { force: true });
            cy.get('[data-cy="datapoint-zoom"]').as('zoom').should('exist').and('be.visible');
            cy.get('[data-cy="datapoint-zoom-label-name"]').as('zoomName').should('exist').and('be.visible').and('contain', 'd_');
            cy.get('[data-cy="datapoint-zoom-label-value"]').as('zoomValue').should('exist').and('be.visible').invoke('text').then(text => {
                const num = parseInt(text.trim(), 10);
                expect(num).to.be.a('number');
            });

            cy.log('close zoom');
            cy.get('[data-cy="datapoint-circle"]').first().trigger('mouseout');
            cy.get('@zoom').should('not.exist');
            cy.get('@zoomName').should('not.exist');
            cy.get('@zoomValue').should('not.exist');
        });
    });
});