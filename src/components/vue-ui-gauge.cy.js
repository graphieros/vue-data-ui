import VueUiGauge from './vue-ui-gauge.vue'


describe('<VueUiGauge />', () => {
  beforeEach(function () {
    cy.fixture('gauge.json').as('fixture');
    cy.viewport(400, 420);
  });

  function updateConfigInFixture(modifiedConfig) {
    cy.get('@fixture').then((fixture) => {
      const updatedFixture = { ...fixture, config: modifiedConfig };
      cy.wrap(updatedFixture).as('fixture');
    });
  }

  it('renders with different config attributes', function () {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiGauge, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      for (let i = 0; i < fixture.dataset.series.length; i += 1) {
        cy.get(`[data-cy="gauge-step-marker-label-${i}"]`)
          .should('exist')
          .contains(`${fixture.dataset.series[i].from.toFixed(fixture.config.style.chart.layout.markers.roundingValue)}`)
      }

      cy.get(`[data-cy="gauge-step-marker-label-last"]`)
        .should('exist')
        .contains(`${fixture.dataset.series.at(-1).to.toFixed(fixture.config.style.chart.layout.markers.roundingValue)}`);


      cy.get(`[data-cy="gauge-pointer-circle"]`).then(($circle) => {
        cy.wrap($circle)
          .should('exist')
          .invoke('attr', 'fill')
          .should('eq', fixture.config.style.chart.layout.pointer.circle.color);

        cy.wrap($circle)
          .invoke('attr',  'r')
          .should('eq', String(fixture.config.style.chart.layout.pointer.circle.radius));

        cy.wrap($circle)
          .invoke('attr',  'stroke-width')
          .should('eq', String(fixture.config.style.chart.layout.pointer.circle.strokeWidth));

        cy.wrap($circle)
          .invoke('attr',  'stroke')
          .should('eq', fixture.config.style.chart.layout.pointer.circle.stroke);
      })

      cy.get(`[data-cy="user-options-summary"]`).click();
    });
  });
})