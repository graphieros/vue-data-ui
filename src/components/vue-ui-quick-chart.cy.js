import VueUiQuickChart from "./vue-ui-quick-chart.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { config, dataset } = components.find(c => c.name === 'VueUiQuickChart');

describe('VueUiQuickChart', () => {

    function testTitle() {
        cy.log('title');
        cy.get('.vue-ui-quick-chart-title').should('exist').and('be.visible').and('contain', 'Title');
    }
    
    it('renders a bar chart from an array of numbers', () => {
        const periods = ['A', 'B', 'C', 'D', 'E'];

        cy.mount(VueUiQuickChart, {
            props: {
                dataset,
                config: {
                    ...config,
                    xyPeriods: periods
                }
            }
        }).then(() => {
            
            testCommonFeatures({
                userOptions: true,
                slicer: true,
                tooltipCallback: () => {
                    cy.get('.vue-ui-quick-chart').trigger('mouseenter', { force: true });
                    cy.get('[data-cy="tooltip-trap-bar"]').first().trigger('mouseenter', { force: true })
                }
            });

            testTitle();

            cy.log('grid');
            cy.get('[data-cy="grid-horizontal-line-bar"]').should('exist').and('have.css', 'opacity', '1').and('have.length', 12);
            cy.get('[data-cy="grid-vertical-line-bar"]').should('exist').and('have.css', 'opacity', '1').and('have.length', dataset.length + 1);
            cy.get('[data-cy="bar-y-axis"]').should('exist').and('have.css', 'opacity', '1');
            cy.get('[data-cy="bar-zero-axis"]').should('exist').and('have.css', 'opacity', '1');

            cy.log('scale');
            cy.get('[data-cy="scale-bar-tick"]').should('exist').and('have.css', 'opacity', '1').and('have.length', 12);
            cy.get('[data-cy="scale-bar-label"]').should('exist').and('be.visible').and('have.length', 12);

            cy.log('x axis ticks & labels');
            cy.get('[data-cy="period-tick"]').should('exist').and('have.css', 'opacity', '1').and('have.length', dataset.length);
            cy.get('[data-cy="period-label"]').as('xLabels').should('exist').and('be.visible').and('have.length', dataset.length);
            cy.get('@xLabels').first().contains(periods[0]);
            cy.get('@xLabels').last().contains(periods.at(-1)); 

            cy.log('datapoints');
            cy.get('[data-cy="datapoint-bar"]').should('exist').and('be.visible').and('have.length', dataset.length);

            cy.log('datapoint labels');
            cy.get('[data-cy="datapoint-label"]').should('exist').and('be.visible').and('have.length', dataset.length);
        });
    });

    it('emits from a bar chart from an array of numbers', () => {
        const periods = ['A', 'B', 'C', 'D', 'E'];

        cy.mount(VueUiQuickChart, {
            props: {
                dataset,
                config: {
                    ...config,
                    xyPeriods: periods
                }
            }
        }).then(({ wrapper }) => {
            cy.log('@selectDatapoint');
            cy.get('.vue-ui-quick-chart').trigger('mouseenter', { force: true });
            cy.get('[data-cy="tooltip-trap-bar"]').first().click({ force: true }).then(() => {
                expect(wrapper.emitted('selectDatapoint')).to.exist;
                expect(wrapper.emitted('selectDatapoint')[0][0][0]).to.have.keys(
                    'absoluteIndices',
                    'absoluteIndex',
                    'color',
                    'id',
                    'name',
                    'value',
                    'values'
                )
            });

            cy.log('@selectLegend');
            cy.get('.vue-ui-quick-chart-legend-item').first().click({ force: true }).then(() => {
                expect(wrapper.emitted('selectLegend')).to.exist;
                expect(wrapper.emitted('selectLegend')[0][0]).to.have.keys(
                    'absoluteIndices',
                    'color',
                    'coordinates',
                    'id',
                    'name',
                    'values'
                );
            });
        });
    });

    it('renders a line chart from an array of numbers', () => {
        const ds = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
        const periods = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

        cy.mount(VueUiQuickChart,
            {
                props: {
                    dataset: ds,
                    config: {
                        ...config,
                        xyPeriods: periods
                    }
                }
            }
        ).then(() => {
            
            testCommonFeatures({
                userOptions: true,
                slicer: true,
                tooltipCallback: () => {
                    cy.get('.vue-ui-quick-chart').trigger('mouseenter', { force: true });
                    cy.get('[data-cy="tooltip-trap-line"]').first().trigger('mouseenter', { force: true })
                }
            });

            testTitle();

            cy.log('grid');
            cy.get('[data-cy="grid-horizontal-line-line"]').should('exist').and('have.css', 'opacity', '1').and('have.length', 10);
            cy.get('[data-cy="grid-vertical-line-line"]').should('exist').and('have.css', 'opacity', '1').and('have.length', ds.length + 1);
            cy.get('[data-cy="line-y-axis"]').should('exist').and('have.css', 'opacity', '1');
            cy.get('[data-cy="line-zero-axis"]').should('exist').and('have.css', 'opacity', '1');

            cy.log('scale');
            cy.get('[data-cy="scale-line-tick"]').should('exist').and('have.css', 'opacity', '1').and('have.length', 10);
            cy.get('[data-cy="scale-line-label"]').should('exist').and('be.visible').and('have.length', 10);

            cy.log('x axis ticks & labels');
            cy.get('[data-cy="period-tick"]').should('exist').and('have.css', 'opacity', '1').and('have.length', ds.length);
            cy.get('[data-cy="period-label"]').as('xLabels').should('exist').and('be.visible').and('have.length', ds.length);
            cy.get('@xLabels').first().contains(periods[0]);
            cy.get('@xLabels').last().contains(periods.at(-1)); 

            cy.log('datapoints');
            cy.get('[data-cy="datapoint-line-wrapper"]').should('exist').and('be.visible');
            cy.get('[data-cy="datapoint-line"]').should('exist').and('be.visible');
            cy.get('[data-cy="datapoint-plot"]').should('exist').and('be.visible').and('have.length', ds.length);

            cy.log('datapoint labels');
            cy.get('[data-cy="datapoint-label"]').should('exist').and('be.visible').and('have.length', ds.length);
        });
    });

    it('emits from a line chart from an array of numbers', () => {
        const ds = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
        const periods = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

        cy.mount(VueUiQuickChart,
            {
                props: {
                    dataset: ds,
                    config: {
                        ...config,
                        xyPeriods: periods
                    }
                }
            }
        ).then(({ wrapper }) => {
            cy.log('@selectDatapoint');
            cy.get('.vue-ui-quick-chart').trigger('mouseenter', { force: true });
            cy.get('[data-cy="tooltip-trap-line"]').first().click({ force: true }).then(() => {
                expect(wrapper.emitted('selectDatapoint')).to.exist;
                expect(wrapper.emitted('selectDatapoint')[0][0][0]).to.have.keys(
                    'absoluteIndices',
                    'absoluteIndex',
                    'color',
                    'id',
                    'name',
                    'value',
                    'values'
                )
            });

            cy.log('@selectLegend');
            cy.get('.vue-ui-quick-chart-legend-item').first().click({ force: true }).then(() => {
                expect(wrapper.emitted('selectLegend')).to.exist;
                expect(wrapper.emitted('selectLegend')[0][0]).to.have.keys(
                    'absoluteIndices',
                    'color',
                    'coordinates',
                    'id',
                    'linePath',
                    'name',
                    'values'
                );
            });
        });
    });

    it('renders a bar chart with an array of objects', () => {
        const periods = ['A', 'B', 'C'];
        const ds = [
            {
                name: 'S1',
                values: [1, 2, 3]
            },
            {
                name: 'S2',
                values: [2, 3, 4]
            }
        ];

        cy.mount(VueUiQuickChart, {
            props: {
                dataset: ds,
                config: {
                    ...config,
                    xyPeriods: periods
                }
            }
        }).then(() => {

            testCommonFeatures({
                userOptions: true,
                slicer: true,
                tooltipCallback: () => {
                    cy.get('.vue-ui-quick-chart').trigger('mouseenter', { force: true });
                    cy.get('[data-cy="tooltip-trap-bar"]').first().trigger('mouseenter', { force: true })
                }
            });

            testTitle();

            cy.log('grid');
            cy.get('[data-cy="grid-horizontal-line-bar"]').should('exist').and('have.css', 'opacity', '1').and('have.length', 9);
            cy.get('[data-cy="grid-vertical-line-bar"]').should('exist').and('have.css', 'opacity', '1').and('have.length', ds[0].values.length + 1);
            cy.get('[data-cy="bar-y-axis"]').should('exist').and('have.css', 'opacity', '1');
            cy.get('[data-cy="bar-zero-axis"]').should('exist').and('have.css', 'opacity', '1');

            cy.log('scale');
            cy.get('[data-cy="scale-bar-tick"]').should('exist').and('have.css', 'opacity', '1').and('have.length', 9);
            cy.get('[data-cy="scale-bar-label"]').should('exist').and('be.visible').and('have.length', 9);

            cy.log('x axis ticks & labels');
            cy.get('[data-cy="period-tick"]').should('exist').and('have.css', 'opacity', '1').and('have.length', ds[0].values.length);
            cy.get('[data-cy="period-label"]').as('xLabels').should('exist').and('be.visible').and('have.length', ds[0].values.length);
            cy.get('@xLabels').first().contains(periods[0]);
            cy.get('@xLabels').last().contains(periods.at(-1)); 

            cy.log('datapoints');
            cy.get('[data-cy="datapoint-bar"]').should('exist').and('be.visible').and('have.length', ds[0].values.length * ds.length);

            cy.log('datapoint labels');
            cy.get('[data-cy="datapoint-label"]').should('exist').and('be.visible').and('have.length', ds[0].values.length * ds.length);
        });
    });

    it('emits from a bar chart from an array of objects', () => {
        const periods = ['A', 'B', 'C'];
        const ds = [
            {
                name: 'S1',
                values: [1, 2, 3]
            },
            {
                name: 'S2',
                values: [2, 3, 4]
            }
        ];

        cy.mount(VueUiQuickChart, {
            props: {
                dataset: ds,
                config: {
                    ...config,
                    xyPeriods: periods
                }
            }
        }).then(({ wrapper }) => {
            cy.log('@selectDatapoint');
            cy.get('.vue-ui-quick-chart').trigger('mouseenter', { force: true });
            cy.get('[data-cy="tooltip-trap-bar"]').first().click({ force: true }).then(() => {
                expect(wrapper.emitted('selectDatapoint')).to.exist;
                expect(wrapper.emitted('selectDatapoint')[0][0][0]).to.have.keys(
                    'NAME',
                    'VALUES',
                    'absoluteIndices',
                    'absoluteIndex',
                    'color',
                    'id',
                    'name',
                    'value',
                    'values'
                )
            });

            cy.log('@selectLegend');
            cy.get('.vue-ui-quick-chart-legend-item').first().click({ force: true }).then(() => {
                expect(wrapper.emitted('selectLegend')).to.exist;
                expect(wrapper.emitted('selectLegend')[0][0]).to.have.keys(
                    'NAME',
                    'VALUES',
                    'absoluteIndices',
                    'color',
                    'coordinates',
                    'id',
                    'name',
                    'values'
                );
            });
        });
    });

    it('renders a line chart with an array of objects', () => {
        const periods = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        const ds = [
            {
                name: 'S1',
                values: [1, 2, 3, 5, 8, 13, 21, 34, 55, 88]
            },
            {
                name: 'S2',
                values: [2, 3, 5, 8, 13, 21, 34, 55, 88, 133]
            }
        ];

        cy.mount(VueUiQuickChart, {
            props: {
                dataset: ds,
                config: {
                    ...config,
                    xyPeriods: periods
                }
            }
        }).then(() => {

            testCommonFeatures({
                userOptions: true,
                slicer: true,
                tooltipCallback: () => {
                    cy.get('.vue-ui-quick-chart').trigger('mouseenter', { force: true });
                    cy.get('[data-cy="tooltip-trap-line"]').first().trigger('mouseenter', { force: true })
                }
            });

            testTitle();

            cy.log('grid');
            cy.get('[data-cy="grid-horizontal-line-line"]').should('exist').and('have.css', 'opacity', '1').and('have.length', 15);
            cy.get('[data-cy="grid-vertical-line-line"]').should('exist').and('have.css', 'opacity', '1').and('have.length', ds[0].values.length + 1);
            cy.get('[data-cy="line-y-axis"]').should('exist').and('have.css', 'opacity', '1');
            cy.get('[data-cy="line-zero-axis"]').should('exist').and('have.css', 'opacity', '1');

            cy.log('scale');
            cy.get('[data-cy="scale-line-tick"]').should('exist').and('have.css', 'opacity', '1').and('have.length', 15);
            cy.get('[data-cy="scale-line-label"]').should('exist').and('be.visible').and('have.length', 15);

            cy.log('x axis ticks & labels');
            cy.get('[data-cy="period-tick"]').should('exist').and('have.css', 'opacity', '1').and('have.length', ds[0].values.length);
            cy.get('[data-cy="period-label"]').as('xLabels').should('exist').and('be.visible').and('have.length', ds[0].values.length);
            cy.get('@xLabels').first().contains(periods[0]);
            cy.get('@xLabels').last().contains(periods.at(-1)); 

            cy.log('datapoints');
            cy.get('[data-cy="datapoint-line-wrapper"]').should('exist').and('be.visible');
            cy.get('[data-cy="datapoint-line"]').should('exist').and('be.visible');
            cy.get('[data-cy="datapoint-plot"]').should('exist').and('be.visible').and('have.length', ds[0].values.length * 2);

            cy.log('datapoint labels');
            cy.get('[data-cy="datapoint-label"]').should('exist').and('be.visible').and('have.length', ds[0].values.length * 2);
        });
    });

    it('emits from a line chart from an array of objects', () => {
        const periods = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
        const ds = [
            {
                name: 'S1',
                values: [1, 2, 3, 5, 8, 13, 21, 34, 55, 88]
            },
            {
                name: 'S2',
                values: [2, 3, 5, 8, 13, 21, 34, 55, 88, 133]
            }
        ];

        cy.mount(VueUiQuickChart, {
            props: {
                dataset: ds,
                config: {
                    ...config,
                    xyPeriods: periods
                }
            }
        }).then(({ wrapper }) => {
            cy.log('@selectDatapoint');
            cy.get('.vue-ui-quick-chart').trigger('mouseenter', { force: true });
            cy.get('[data-cy="tooltip-trap-line"]').first().click({ force: true }).then(() => {
                expect(wrapper.emitted('selectDatapoint')).to.exist;
                expect(wrapper.emitted('selectDatapoint')[0][0][0]).to.have.keys(
                    'NAME',
                    'VALUES',
                    'absoluteIndices',
                    'absoluteIndex',
                    'color',
                    'id',
                    'name',
                    'value',
                    'values'
                )
            });

            cy.log('@selectLegend');
            cy.get('.vue-ui-quick-chart-legend-item').first().click({ force: true }).then(() => {
                expect(wrapper.emitted('selectLegend')).to.exist;
                expect(wrapper.emitted('selectLegend')[0][0]).to.have.keys(
                    'NAME',
                    'VALUES',
                    'absoluteIndices',
                    'color',
                    'coordinates',
                    'id',
                    'linePath',
                    'name',
                    'values'
                );
            });
        });
    });

    it('renders a donut from an array of objects', () => {
        const ds = [
            {
                name: 'S1',
                value: 1
            },
            {
                name: 'S2',
                value: 2,
            },
            {
                name: 'S3',
                value: 3
            }
        ];

        cy.mount(VueUiQuickChart, {
            props: {
                dataset: ds,
                config
            }
        }).then(() => {

            testCommonFeatures({
                userOptions: true,
                tooltipCallback: () => {
                    cy.get('.vue-ui-quick-chart').trigger('mouseenter', { force: true });
                    cy.get('[data-cy="tooltip-trap-donut"]').first().trigger('mouseenter', { force: true });
                }
            });

            testTitle();

            cy.log('datapoint donut arcs');
            cy.get('[data-cy="datapoint-donut-markers"]').should('exist').and('be.visible').and('have.length', ds.length);
            cy.get('[data-cy="datapoint-donut-arc"]').should('exist').and('be.visible').and('have.length', ds.length);
            cy.get('[data-cy="tooltip-trap-donut"]').should('exist').and('be.visible').and('have.length', ds.length);
            cy.get('[data-cy="datapoint-donut-marker-circle"]').should('exist').and('be.visible').and('have.length', ds.length);
            cy.get('[data-cy="datapoint-donut-label-value"]').as('values').should('exist').and('be.visible').and('have.length', ds.length);
            cy.get('@values').each((value, _i) => {
                cy.wrap(value).contains('%');
            });
            cy.get('[data-cy="datapoint-donut-label-name"]').as('names').should('exist').and('be.visible').and('have.length', ds.length);
            cy.get('@names').each((name, i) => {
                cy.wrap(name).contains(ds[i].name);
            });

            cy.log('donut hollow');
            cy.get('[data-cy="donut-hollow-total-label"]').should('exist').and('be.visible').contains('Total');
            cy.get('[data-cy="donut-hollow-total-value"]').should('exist').and('be.visible').contains(ds.map(d => d.value).reduce((a, b) => a + b, 0));
        });
    });

    it('emits from a donut chart from an array of objects', () => {
        const ds = [
            {
                name: 'S1',
                value: 1
            },
            {
                name: 'S2',
                value: 2,
            },
            {
                name: 'S3',
                value: 3
            }
        ];

        cy.mount(VueUiQuickChart, {
            props: {
                dataset: ds,
                config
            }
        }).then(({ wrapper }) => {
            cy.log('@selectDatapoint');
            cy.get('.vue-ui-quick-chart').trigger('mouseenter', { force: true });
            cy.get('[data-cy="tooltip-trap-donut"]').first().click({ force: true }).then(() => {
                expect(wrapper.emitted('selectDatapoint')).to.exist;
                expect(wrapper.emitted('selectDatapoint')[0][0]).to.have.keys(
                    'NAME',
                    'VALUE',
                    'arcSlice',
                    'center',
                    'color',
                    'cx',
                    'cy',
                    'endX',
                    'endY',
                    'firstSeparator',
                    'id',
                    'immutableValue',
                    'name',
                    'path',
                    'proportion',
                    'ratio',
                    'separator',
                    'startX',
                    'startY',
                    'value'
                )
            });

            cy.log('@selectLegend');
            cy.get('.vue-ui-quick-chart-legend-item').first().click({ force: true }).then(() => {
                expect(wrapper.emitted('selectLegend')).to.exist;
                expect(wrapper.emitted('selectLegend')[0][0]).to.have.keys(
                    'NAME',
                    'VALUE',
                    'absoluteValue',
                    'color',
                    'id',
                    'immutableValue',
                    'name',
                    'proportion',
                    'value'
                );
            });
        });
    });
});