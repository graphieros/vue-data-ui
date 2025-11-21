import VueUiTreemap from "./vue-ui-treemap.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { dataset, config } = components.find(c => c.name === 'VueUiTreemap');

describe('<VueUiTreemap />', () => {

    it('renders', () => {
        cy.mount(VueUiTreemap, {
            props: {
                dataset,
                config
            }
        }).then(() => {
            
            testCommonFeatures({
                userOptions: true,
                title: true,
                subtitle: true,
                legend: true,
                dataTable: true,
                tooltipCallback: () => {
                    cy.get('[data-cy="datapoint-rect"]').first().trigger('mouseenter', { force: true })
                }
            });

            cy.log('datapoint rects');
            cy.get('[data-cy="datapoint-rect"]').should('exist').and('be.visible').and('have.length', 16);

            cy.log('datapoint foreignObject');
            cy.get('.vue-ui-treemap-cell-foreignObject').should('exist').and('be.visible').and('have.length', 16);

            cy.log('zoom');
            cy.get('[data-cy="datapoint-rect"]').first().click();
            cy.get('[data-cy="datapoint-rect"]').should('exist').and('be.visible').and('have.length', 3);
            cy.get('[data-cy="datapoint-rect"]').first().click();
            cy.get('[data-cy="datapoint-rect"]').should('exist').and('be.visible').and('have.length', 16);
        });
    });

    it('renders breadcrumbs', () => {
        cy.mount(VueUiTreemap, {
            props: {
                dataset,
                config
            }
        }).then(() => {
            cy.get('.vue-ui-treemap-breadcrumbs').should('not.exist')
            cy.get('.vue-ui-treemap-rect').eq(12).click({ force: true })
            cy.get('.vue-ui-treemap-breadcrumbs').should('exist').and('be.visible')
            cy.get('.vue-ui-treemap-crumb').first().click()
            cy.get('.vue-ui-treemap-breadcrumbs').should('not.exist')
        })
    })

    it('emits', () => {
        cy.mount(VueUiTreemap, {
            props: {
                dataset,
                config
            }
        }).then(({ wrapper }) => {
            cy.log('@selectLegend');
            cy.get('[data-cy="legend-item-0"]').click().then(() => {
                expect(wrapper.emitted('selectLegend')).to.exist
            });

            cy.log('@selectDatapoint');
            cy.get('[data-cy="datapoint-rect"]').first().click({ force: true }).then(() => {
                expect(wrapper.emitted('selectDatapoint')).to.exist
                expect(wrapper.emitted('selectDatapoint')[0][0]).to.have.keys(
                    'children',
                    'color',
                    'id',
                    'name',
                    'rootId',
                    'normalizedValue',
                    'parentId',
                    'parentName',
                    'proportion',
                    'value',
                    'x0',
                    'x1',
                    'y0',
                    'y1'
                );
            });
        });
    });
});