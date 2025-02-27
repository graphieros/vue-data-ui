import VueUiHistoryPlot from "./vue-ui-history-plot.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { dataset, config } = components.find(c => c.name === 'VueUiHistoryPlot');

describe('<VueUiHistoryPlot />', () => {

    it('renders', () => {
        cy.mount(VueUiHistoryPlot, {
            props: {
                config,
                dataset
            }
        }).then(() => {
            
            testCommonFeatures({
                userOptions: true,
                title: true,
                subtitle: true,
                legend: true,
                dataTable: true,
                tooltipCallback: () => {
                    cy.get('[data-cy="tooltip-trap"]').first().trigger('mouseenter');
                }
            });

            cy.log('grid');
            cy.get('[data-cy="x-axis"]').should('exist').and('have.css', 'opacity', '1');
            cy.get('[data-cy="y-axis"]').should('exist').and('have.css', 'opacity', '1');
            cy.get('[data-cy="grid-line-vertical"]').should('exist').and('have.css', 'opacity', '1').and('have.length', 8);
            cy.get('[data-cy="grid-line-horizontal"]').should('exist').and('have.css', 'opacity', '1').and('have.length', 9);

            cy.log('y axis labels');
            cy.get('[data-cy="y-axis-label"]').as('yLabels').should('exist').and('be.visible').and('have.length', 9);
            cy.get('@yLabels').first().contains('0');
            cy.get('@yLabels').last().contains('4');

            cy.log('x axis-labels');
            cy.get('[data-cy="x-axis-label"]').as('xLabels').should('exist').and('be.visible').and('have.length', 8);
            cy.get('@xLabels').first().contains('0');
            cy.get('@xLabels').last().contains('70');

            cy.log('axis names');
            cy.get('[data-cy="axis-name-y"]').should('exist').and('be.visible').contains(config.style.chart.axes.y.name.text);
            cy.get('[data-cy="axis-name-x"]').should('exist').and('be.visible').contains(config.style.chart.axes.x.name.text);

            cy.log('datapoints');
            cy.get('[data-cy="datapoint-path-wrapper"]').should('exist').and('be.visible').and('have.length', dataset.length);
            cy.get('[data-cy="datapoint-path"]').should('exist').and('be.visible').and('have.length', dataset.length);
            cy.get('[data-cy="datapoint-plot-underlayer"]').should('exist').and('be.visible').and('have.length', dataset.map(d => d.values.length).reduce((a, b) => a + b, 0));
            cy.get('[data-cy="datapoint-plot"]').should('exist').and('be.visible').and('have.length', dataset.map(d => d.values.length).reduce((a, b) => a + b, 0));
            cy.get('[data-cy="datapoint-label"]').should('exist').and('be.visible').and('have.length', dataset.map(d => d.values.length).reduce((a, b) => a + b, 0));
            cy.get('[data-cy="datapoint-index-label"]').should('exist').and('be.visible').and('have.length', dataset.map(d => d.values.length).reduce((a, b) => a + b, 0));
        });
    });

    it('emits', () => {
        cy.mount(VueUiHistoryPlot, {
            props: {
                config,
                dataset
            }
        }).then(({ wrapper }) => {
            cy.log('@selectLegend');
            cy.get('[data-cy="legend-item-0"]').click({ force: true }).then(() => {
                expect(wrapper.emitted('selectLegend')).to.exist;
            })

            cy.log('@selectDatapoint');
            cy.get('[data-cy="tooltip-trap"]').first().click({ force: true }).then(() => {
                expect(wrapper.emitted('selectDatapoint')).to.exist;
                expect(wrapper.emitted('selectDatapoint')[0][0]).to.have.keys(
                    'color',
                    'id',
                    'label',
                    'seriesName',
                    'valueX',
                    'valueY',
                    'x',
                    'y'
                );
            });
        });
    });
});