import VueUiSparkline from './vue-ui-sparkline.vue'

describe('<VueUiSparkline />', () => {

  beforeEach(function () {
    cy.fixture('sparkline.json').as('fixture');
    cy.viewport(1200, 280);
  });

  function updateConfigInFixture(modifiedConfig) {
    cy.get('@fixture').then((fixture) => {
      const updatedFixture = { ...fixture, config: modifiedConfig };
      cy.wrap(updatedFixture).as('fixture');
    });
  }

  it('renders with different config attributes', function () {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiSparkline, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      cy.get('[data-cy="sparkline-svg"]').should('exist');
      cy.get('[data-cy="sparkline-angle-area"]').should('exist');
      cy.get('[data-cy="sparkline-smooth-area"]').should('not.exist');

      for(let i = 0; i < 16; i += 1) {
        cy.get(`[data-cy="sparkline-segment-${i}"]`).should('exist');
      }

      let modifiedConfig = {
        ...fixture.config,
        style: {
          ...fixture.config.style,
          line: {
            ...fixture.config.style.line,
            smooth: true
          }
        }

      }

      updateConfigInFixture(modifiedConfig);

      cy.mount(VueUiSparkline, {
        props: {
          dataset: fixture.dataset,
          config: modifiedConfig
        }
      });

      cy.get('[data-cy="sparkline-angle-area"]').should('not.exist');
      cy.get('[data-cy="sparkline-smooth-area"]').should('exist');
      cy.get('[data-cy="sparkline-smooth-path"]').should('exist');
      cy.get('[data-cy="sparkline-zero-axis"]').should('exist');

      cy.mount(VueUiSparkline, {
        props: {
          dataset: fixture.datasetPositive,
          config: modifiedConfig
        }
      });

      cy.get('[data-cy="sparkline-zero-axis"]').should('not.exist');

      cy.mount(VueUiSparkline, {
        props: {
          dataset: fixture.dataset,
          config: modifiedConfig
        }
      });

      for (let i = 0; i < 17; i += 1) {
        cy.get(`[data-cy="sparkline-mouse-trap-${i}"]`)
          .should('exist')
          .trigger("mouseenter")

        cy.get('[data-cy="sparkline-datalabel"]')
          .should('exist')
          .contains(`${fixture.dataset[i].value}`);

        cy.get('[data-cy="sparkline-period-label"]')
          .should('exist')
          .contains(`${fixture.dataset[i].period}`);

        cy.get(`[data-cy="sparkline-vertical-indicator-${i}"]`)
          .should('exist');

        cy.get(`[data-cy="sparkline-plot-${i}"]`)
          .should('exist');

        cy.get(`[data-cy="sparkline-mouse-trap-${i}"]`)
          .trigger("mouseleave");

        cy.get('[data-cy="sparkline-period-label"]')
          .should('exist')
          .contains('Title');
      }

      cy.get('[data-cy="sparkline-period-label"]')
      .should('exist')
      .contains('Title');

    });
  });
});