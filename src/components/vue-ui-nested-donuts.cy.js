import VueUiNestedDonuts from "./vue-ui-nested-donuts.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";
import { abbreviate } from "../lib";

const { dataset, config } = components.find(c => c.name === 'VueUiNestedDonuts');

describe('<VueUiNestedDonuts />', () => {

    it('renders', () => {
        cy.viewport(500, 650)
        cy.mount(VueUiNestedDonuts, {
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
                    cy.get('[data-cy="tooltip-trap"]').first().trigger('mouseenter', { force: true });
                }
            });

            cy.log('arcs');
            cy.get('[data-cy="datapoint-arc"]').should('exist').and('be.visible').and('have.length', dataset.map(d => d.series.length).reduce((a, b) => a + b, 0));

            cy.log('gradients');
            cy.get('[data-cy="donut-gradient"]').should('exist').and('be.visible').and('have.length', dataset.length);

            cy.log('abbreviated names');
            cy.get('[data-cy="datapoint-name"]').should('exist').and('be.visible').each((label, i) => {
                cy.wrap(label).contains(abbreviate({
                    source: dataset[i].name,
                }));
            });

            cy.log('data labels');
            cy.get('[data-cy="datapoint-percentage"]').should('exist').and('be.visible').and('contain', '%').and('have.length', dataset.map(d => d.series.length).reduce((a, b) => a + b, 0));
            cy.get('[data-cy="datapoint-value"]').should('exist').and('be.visible').and('have.length', dataset.map(d => d.series.length).reduce((a, b) => a + b, 0));
        });
    });
    
    it('emits', () => {
        cy.mount(VueUiNestedDonuts, {
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
            cy.get('[data-cy="tooltip-trap"]').first().click({ force: true }).then(() => {
                expect(wrapper.emitted('selectDatapoint')).to.exist;
                expect(wrapper.emitted('selectDatapoint')[0][0]).to.have.keys('datapoint', 'index');
                expect(wrapper.emitted('selectDatapoint')[0][0].index).to.equal(0);
                expect(wrapper.emitted('selectDatapoint')[0][0].datapoint).to.have.keys(
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
                    'value'
                );
                expect(wrapper.emitted('selectDatapoint')[0][0].datapoint.datasetIndex).to.equal(0);
                expect(wrapper.emitted('selectDatapoint')[0][0].datapoint.seriesIndex).to.equal(0);
            })
        });
    });
});