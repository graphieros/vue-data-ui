import VueUiNestedDonuts from './vue-ui-nested-donuts.vue';
import { components } from '../../cypress/fixtures/vdui-components';
import { testCommonFeatures } from '../../cypress/fixtures';
import { abbreviate } from '../lib';

const { dataset, config } = components.find(
    (c) => c.name === 'VueUiNestedDonuts',
);

describe('<VueUiNestedDonuts />', () => {
    it('renders', () => {
        cy.viewport(500, 650);
        cy.mount(VueUiNestedDonuts, {
            props: {
                dataset,
                config,
            },
        }).then(() => {
            testCommonFeatures({
                userOptions: true,
                title: true,
                subtitle: true,
                dataTable: true,
                legend: true,
                tooltipCallback: () => {
                    cy.get('[data-cy="tooltip-trap"]')
                        .first()
                        .trigger('mouseenter', { force: true });
                },
            });

            cy.log('arcs');
            cy.get('[data-cy="datapoint-arc"]')
                .should('exist')
                .and('be.visible')
                .and(
                    'have.length',
                    dataset
                        .map((d) => d.series.length)
                        .reduce((a, b) => a + b, 0),
                );

            cy.log('gradients');
            cy.get('[data-cy="donut-gradient"]')
                .should('exist')
                .and('be.visible')
                .and('have.length', dataset.length);

            cy.log('abbreviated names');
            cy.get('[data-cy="datapoint-name"]')
                .should('exist')
                .and('be.visible')
                .each((label, i) => {
                    cy.wrap(label).contains(dataset[i].name);
                });

            cy.log('data labels');
            cy.get('[data-cy="datapoint-percentage"]')
                .should('exist')
                .and('be.visible')
                .and('contain', '%')
                .and(
                    'have.length',
                    dataset
                        .map((d) => d.series.length)
                        .reduce((a, b) => a + b, 0),
                );
            cy.get('[data-cy="datapoint-value"]')
                .should('exist')
                .and('be.visible')
                .and(
                    'have.length',
                    dataset
                        .map((d) => d.series.length)
                        .reduce((a, b) => a + b, 0),
                );
        });
    });

    it('emits', () => {
        const onSelectLegend = cy.spy().as('onSelectLegend');
        const onSelectDatapoint = cy.spy().as('onSelectDatapoint');

        cy.mount(VueUiNestedDonuts, {
            props: {
                dataset,
                config,
                onSelectLegend,
                onSelectDatapoint,
            },
        }).then(() => {
            cy.log('@selectLegend');
            cy.get('[data-cy="legend-item"]').first().click({ force: true });
            cy.get('@onSelectLegend').should('have.been.called');
            cy.log('@selectDatapoint');
            cy.get('[data-cy="tooltip-trap"]').first().click({ force: true });

            cy.get('@onSelectDatapoint').should((spy) => {
                expect(spy).to.have.been.called;
                const payload = spy.firstCall.args[0];
                expect(payload).to.have.keys('datapoint', 'index');
                expect(payload.index).to.equal(0);
                expect(payload.datapoint).to.include.keys(
                    'absoluteValues',
                    'arcOf',
                    'arcOfId',
                    'arcSlice',
                    'center',
                    'color',
                    'cx',
                    'cy',
                    'datasetIndex',
                    'endX',
                    'endY',
                    'firstSeparator',
                    'id',
                    'name',
                    'path',
                    'proportion',
                    'ratio',
                    'separator',
                    'seriesIndex',
                    'startX',
                    'startY',
                    'value',
                );

                expect(payload.datapoint.datasetIndex).to.equal(0);
                expect(payload.datapoint.seriesIndex).to.equal(1);
            });
        });
    });
});
