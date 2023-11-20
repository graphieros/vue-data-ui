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



      cy.get(`[data-cy="gauge-text-title"]`)
        .should('exist')
        .contains(`${fixture.config.style.chart.title.text}`);

      cy.get(`[data-cy="gauge-text-subtitle"]`)
        .should('exist')
        .contains(`${fixture.config.style.chart.title.subtitle.text}`);

      cy.get(`[data-cy="gauge-text-base"]`)
        .should('exist')
        .contains(`${fixture.config.translations.base} : ${fixture.dataset.base}`);

      cy.get(`[data-cy="gauge-summary"]`).click();
      cy.get(`[data-cy="gauge-checkbox-title"]`).uncheck();
      cy.get(`[data-cy="gauge-summary"]`).click();


      cy.get(`[data-cy="gauge-div-title"]`)
        .should('exist')
        .contains(`${fixture.config.style.chart.title.text}`);

      cy.get(`[data-cy="gauge-div-subtitle"]`)
        .should('exist')
        .contains(`${fixture.config.style.chart.title.subtitle.text}`);

      cy.get(`[data-cy="gauge-div-base"]`)
        .should('exist')
        .contains(`${fixture.config.translations.base} : ${fixture.dataset.base}`);

      for (let i = 0; i < fixture.dataset.series.length; i += 1) {
        cy.get(`[data-cy="gauge-arc-${i}"]`).then(($arc) => {
          cy.wrap($arc)
          .should('exist');

          cy.wrap($arc)
          .invoke('attr', 'stroke')
            .should('eq', fixture.dataset.series[i].color)
        });

        cy.get(`[data-cy="gauge-step-marker-${i}"]`).should('exist');
        cy.get(`[data-cy="gauge-step-marker-label-${i}"]`)
          .should('exist')
          .contains(`${fixture.dataset.series[i].from.toFixed(fixture.config.style.chart.layout.markers.roundingValue)}`)
      }

      cy.get(`[data-cy="gauge-step-marker-last"]`).should('exist');
      cy.get(`[data-cy="gauge-step-marker-label-last"]`)
        .should('exist')
        .contains(`${fixture.dataset.series.at(-1).to.toFixed(fixture.config.style.chart.layout.markers.roundingValue)}`);


      cy.get(`[data-cy="gauge-pointer-border"]`).then(($pointer) => {
        cy.wrap($pointer)
          .should('exist')
          .invoke('attr', 'stroke')
          .should('eq', fixture.config.style.chart.layout.pointer.stroke);

        cy.wrap($pointer)
          .invoke('attr', 'stroke-width')
          .should('eq', String(fixture.config.style.chart.layout.pointer.strokeWidth))
      });

      function getColor(number) {
        for (let i = 0; i < fixture.dataset.series.length; i += 1) {
            if (number >= fixture.dataset.series[i].from && number < fixture.dataset.series[i].to) {
                return fixture.dataset.series[i].color;
            }
        }
        return null;
    }

      cy.wait(500);
      cy.get(`[data-cy="gauge-pointer"]`).then(($pointer) => {
        cy.wrap($pointer)
          .should('exist')
          .invoke('attr', 'stroke')
          .should('eq', getColor(fixture.dataset.value))
      });

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

      cy.get(`[data-cy="gauge-summary"]`).click();

      cy.get(`[data-cy="gauge-pdf"]`).click();
      cy.wait(2000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.pdf`);

      cy.clearDownloads();
    });
  });
})