import VueUiCandlestick from './vue-ui-candlestick.vue';
import { components } from '../../cypress/fixtures/vdui-components';
import { testCommonFeatures } from '../../cypress/fixtures';

const { dataset, config } = components.find(c => c.name === 'VueUiCandlestick');

describe('<VueUiCandlestick />', () => {

  it('renders', () => {
    cy.mount(VueUiCandlestick, {
      props: {
        dataset,
        config
      }
    }).then(() => {
      testCommonFeatures({
        userOptions: true,
        title: true,
        subtitle: true,
        slicer: true,
        dataTable: true,
        tooltipCallback: () => {
          cy.get('[data-cy="tooltip-trap"]').first().trigger('mouseover');
        }
      });

      cy.log('Grid axes');
      cy.get('[data-cy="candlestick-grid-y-axis"]').should('exist').and('be.visible');
      cy.get('[data-cy="candlestick-grid-x-axis"]').should('exist').and('be.visible');

      cy.log('Y scale ticks');
      cy.get('[data-cy="y-scale-tick"]').should('exist').and('have.length', 9);
      
      cy.log('Y scale labels');
      cy.get('[data-cy="y-scale-label"]').as('scaleLabels').should('exist').and('have.length', 9);
      cy.get('@scaleLabels').first().contains('0');
      cy.get('@scaleLabels').last().contains('160');

      cy.log('X axis labels');
      cy.get('[data-cy="x-label"]').as('xLabels').should('exist').and('be.visible').and('have.length', 5);
      cy.get('@xLabels').first().contains(dataset[0][0]);
      cy.get('@xLabels').last().contains(dataset.at(-1)[0]);
    });
  });
});