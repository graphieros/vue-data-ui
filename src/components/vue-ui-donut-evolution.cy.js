import VueUiDonutEvolution from './vue-ui-donut-evolution.vue'
import { components } from '../../cypress/fixtures/vdui-components';
import { testCommonFeatures } from '../../cypress/fixtures';

const { dataset, config } = components.find(c => c.name === 'VueUiDonutEvolution');

describe('<VueUiDonutEvolution />', () => {

  it('renders', () => {
    cy.viewport(800,800);
    cy.mount(VueUiDonutEvolution, {
      props: {
        dataset,
        config
      }
    }).then(({ wrapper }) => {

      testCommonFeatures({
        userOptions: true,
        title: true,
        subtitle: true,
        dataTable: true,
        slicer: true
      });

      cy.log('grid');
      cy.get('[data-cy="axis-y"]').should('exist').and('have.css', 'opacity', '1');
      cy.get('[data-cy="axis-x"]').should('exist').and('have.css', 'opacity', '1');
      cy.get('[data-cy="vertical-separator"]').should('exist').and('have.css', 'opacity', '1').and('have.length', Math.max(...dataset.map(d => d.values.length)));

      cy.log('y axis labels');
      cy.get('[data-cy="axis-y-tick"]').should('exist').and('have.css', 'opacity', '1').and('have.length', 7);
      cy.get('[data-cy="axis-y-label"]').as('yLabels').should('exist').and('be.visible').and('have.length', 7);
      cy.get('@yLabels').first().contains(0);
      cy.get('@yLabels').last().contains(300);

      cy.log('x axis labels');
      cy.get('[data-cy="axis-x-label"]').as('xLabels').should('exist').and('be.visible').and('have.length', config.style.chart.layout.grid.xAxis.dataLabels.values.length);
      cy.get('@xLabels').first().contains(config.style.chart.layout.grid.xAxis.dataLabels.values[0]);
      cy.get('@xLabels').last().contains(config.style.chart.layout.grid.xAxis.dataLabels.values.at(-1));
  
      cy.log('shows zoomed donut on trap click');
      cy.get('[data-cy-trap]').eq(0).click();
      cy.get('[data-cy-zoom]').should('be.visible');
      cy.get('[data-cy-zoom-donut]').should('be.visible');
      cy.get('[data-cy-close]').should('be.visible').click({ force: true});
      cy.get('[data-cy-zoom]').should('not.exist');
  
      cy.log('segregates series when selecting legend items');
      cy.get('[data-cy="legend-item"]').eq(0).click().then(() => {
        cy.get(`[data-cy="arc_0"]`).should('have.length', 3);
        expect(wrapper.emitted('selectLegend')).to.exist;
        cy.get('[data-cy="legend-item"]').eq(0).click();
        cy.get(`[data-cy="arc_0"]`).should('have.length', 4);
      })
    
      cy.log('shows donut hovered state');
      cy.get('[data-cy-trap]').eq(0).trigger('mouseenter');
      cy.get('[data-cy="donut_hover_0"]').should('have.length', 3);
      cy.get('[data-cy-trap]').eq(0).trigger('mouseleave');
      cy.get('[data-cy="donut_hover_0"]').should('not.exist');
    });
  });
});