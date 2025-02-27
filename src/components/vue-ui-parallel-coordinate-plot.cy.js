import VueUiParallelCoordinatePlot from "./vue-ui-parallel-coordinate-plot.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { dataset, config } = components.find(c => c.name === 'VueUiParallelCoordinatePlot');

describe('<VueUiParallelCoordinatePlot />', () => {

    it('renders', () => {
        cy.mount(VueUiParallelCoordinatePlot, {
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
                legend: true,
                tooltipCallback: () => {
                    cy.get('[data-cy="tooltip-trap"]').first().trigger('mouseenter', { force: true })
                }
            });

            cy.log('axes');
            cy.get('[data-cy="pcp-axis"]').should('exist').and('have.css', 'opacity', '1').and('have.length', Math.max(...dataset.flatMap(d => d.series.map(s => s.values.length))));
            cy.get('[data-cy="pcp-axis-label"]').as('axisLabels').should('exist').and('be.visible').and('have.length', Math.max(...dataset.flatMap(d => d.series.map(s => s.values.length))));
            cy.get('@axisLabels').each((label, i) => {
                cy.wrap(label).contains(`Y-${i+1}`)
            });

            cy.log('scales');
            cy.get('[data-cy="scale-tick"]').should('exist').and('have.css', 'opacity', '1').and('have.length', 37);
            cy.get('[data-cy="scale-label"]').should('exist').and('be.visible').and('have.length', 37);

            cy.log('plots');
            cy.get('[data-cy="atom-shape"]').should('exist').and('be.visible').and('have.length', dataset.flatMap(d => d.series.map(s => s.values.length)).reduce((a, b) => a + b, 0) + 2 /* legend shapes */);

            cy.log('plot labels');
            cy.get('[data-cy="plot-label"]').should('exist').and('be.visible').and('have.length', dataset.flatMap(d => d.series.map(s => s.values.length)).reduce((a, b) => a + b, 0));

            cy.log('datapoint lines');
            cy.get('[data-cy="datapoint-line"]').should('exist').and('be.visible').and('have.length', dataset.flatMap(d => d.series).length);
        });
    });

    it('emits', () => {
        cy.mount(VueUiParallelCoordinatePlot, {
            props: {
                dataset,
                config
            }
        }).then(({ wrapper }) => {
            cy.log('@selectLegend');
            cy.get('[data-cy="legend-item"]').first().click({ force: true }).then(() => {
                expect(wrapper.emitted('selectLegend')).to.exist;
            });

            cy.log('@selectDatapoint');
            cy.get('.legend-shape-circle').first().click({ force: true }).then(() => {
                expect(wrapper.emitted('selectDatapoint')).to.exist;
                expect(wrapper.emitted('selectDatapoint')[0][0]).to.have.keys(
                    'axisIndex',
                    'comment',
                    'datapointIndex',
                    'name',
                    'seriesIndex',
                    'seriesName',
                    'value',
                    'x',
                    'y'
                );
                expect(wrapper.emitted('selectDatapoint')[0][0].axisIndex).to.equal(0);
                expect(wrapper.emitted('selectDatapoint')[0][0].seriesIndex).to.equal(0);
            });
        });
    });
});