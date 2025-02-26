import VueUiStripPlot from "./vue-ui-strip-plot.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { dataset, config } = components.find(c => c.name === 'VueUiStripPlot');

describe('<VueUiStripPlot />', () => {

    it('renders', () => {
        cy.viewport(300, 610)
        cy.mount(VueUiStripPlot, {
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
                tooltipCallback: () => {
                    cy.get('[data-cy="atom-shape"]').first().trigger('mouseenter', { force: true })
                }
            });

            cy.log('grid');
            cy.get('[data-cy="grid-horizontal"]').should('exist').and('have.css', 'opacity', '1').and('have.length', 6);
            cy.get('[data-cy="grid-vertical"]').should('exist').and('have.css', 'opacity', '1').and('have.length', dataset.length);

            cy.log('axes');
            cy.get('[data-cy="axis-y"]').should('exist').and('have.css', 'opacity', '1');
            cy.get('[data-cy="axis-x"]').should('exist').and('have.css', 'opacity', '1');

            cy.log('y axis labels');
            cy.get('[data-cy="axis-y-label"]').as('yLabels').should('exist').and('be.visible').and('have.length', 6);
            cy.get('@yLabels').first().contains(0);
            cy.get('@yLabels').last().contains(25);

            cy.log('x axis labels');
            cy.get('[data-cy="axis-x-label"]').as('xLabels').should('exist').and('be.visible').and('have.length', dataset.length);
            cy.get('@xLabels').each((label, i) => {
                cy.wrap(label).contains(dataset[i].name);
            });

            cy.log('axis names');
            cy.get('[data-cy="axis-y-name"]').should('exist').and('be.visible').and('contain', config.style.chart.labels.axis.yLabel);
            cy.get('[data-cy="axis-x-name"]').should('exist').and('be.visible').and('contain', config.style.chart.labels.axis.xLabel);

            cy.log('datapoint selection');
            cy.get('[data-cy="atom-shape"]').eq(2).trigger('mouseenter', { force: true });
            cy.get('[data-cy="selection-line"]').should('exist').and('have.css', 'opacity', '1');
            cy.get('[data-cy="selection-marker-circle-left"]').should('exist').and('be.visible');
            cy.get('[data-cy="selection-marker-circle-right"]').should('exist').and('be.visible');

            cy.log('datapoints');
            cy.get('[data-cy="atom-shape"]').should('exist').and('be.visible').and('have.length', dataset.map(d => d.plots.length).reduce((a, b) => a + b, 0) * 2);
            cy.get('[data-cy="best-plot-label"]').as('bestPlotLabels').should('exist').and('have.length', dataset.length);
            cy.get('@bestPlotLabels').each((label, i) => {
                cy.wrap(label).contains(dataset[i].plots.reduce((max, o) => (o.value > max.value ? o : max), dataset[i].plots[0]).name);
                cy.wrap(label).contains(dataset[i].plots.reduce((max, o) => (o.value > max.value ? o : max), dataset[i].plots[0]).value.toFixed(0));
            });
        });
    });

    it('emits', () => {
        cy.mount(VueUiStripPlot, {
            props: {
                dataset,
                config
            }
        }).then(({ wrapper }) => {
            cy.log('@selectDatapoint');
            cy.get('circle').eq(8).click({ force: true }).then(() => {
                expect(wrapper.emitted('selectDatapoint')).to.exist
                expect(wrapper.emitted('selectDatapoint')[0][0]).to.have.keys(
                    'color',
                    'id',
                    'name',
                    'parentId',
                    'value',
                    'x',
                    'y'
                );
            });
        });
    });
});