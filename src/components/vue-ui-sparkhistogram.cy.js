import VueUiSparkhistogram from './vue-ui-sparkhistogram.vue'

describe('<VueUiSparkhistogram />', () => {
  beforeEach(function () {
    cy.fixture('sparkhistogram.json').as('fixture');
    cy.viewport(1200, 220);
  });

  it('renders with different config attributes', function () {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiSparkhistogram, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      cy.get('[data-cy="sparkhistogram-svg"]').should('exist');

      for (let i = 0; i < 12; i += 1) {
        cy.get(`[data-cy="sparkhistogram-rect-${i}"]`).should('exist');

        cy.get(`[data-cy="sparkhistogram-value-label-${i}"]`)
          .should('exist')
          .contains(`${fixture.config.style.labels.value.prefix}${Number(fixture.dataset[i].value.toFixed(fixture.config.style.labels.value.rounding)).toLocaleString()}${fixture.config.style.labels.value.suffix}`);

        cy.get(`[data-cy="sparkhistogram-label-${i}"]`)
          .should('exist')
          .contains(fixture.dataset[i].valueLabel);

        cy.get(`[data-cy="sparkhistogram-time-label-${i}"]`)
          .should('exist')
          .contains(fixture.dataset[i].timeLabel)
      }
    });
  });
})