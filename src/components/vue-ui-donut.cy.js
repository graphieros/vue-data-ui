import VueUiDonut from './vue-ui-donut.vue';

describe('<VueUiDonut />', () => {
  beforeEach(function () {
    const stub = cy.stub()
    Cypress.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('ResizeObserver')) {
          stub()
          return false
      }
    })
    cy.fixture('donut.json').as('fixture');

  });

  function updateConfigInFixture(modifiedConfig) {
    cy.get('@fixture').then((fixture) => {
      const updatedFixture = { ...fixture, config: modifiedConfig };
      cy.wrap(updatedFixture).as('fixture');
    });
  }

  it('highlights a series on hover and displays tooltip', () => {
    cy.viewport(1000, 850);
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiDonut, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      cy.get('[data-cy="donut-trap-0"]').trigger('mouseenter')
      cy.get('[data-cy="tooltip"]').should('exist').contains(fixture.dataset[0].name)
    })
  })

  it('segregates series on legend click', () => {
    cy.viewport(1000, 850);
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiDonut, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      cy.get('[data-cy="legend-item-0"]').click()
      cy.get('[data-cy-donut-trap]').should('have.length', fixture.dataset.length - 1)
      cy.get('[data-cy="legend-item-0"]').click()
      cy.get('[data-cy-donut-trap]').should('have.length', fixture.dataset.length)
    })
  })

  it('renders with different config attributes', function () {
    cy.viewport(1000, 1100);
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiDonut, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      cy.get('[data-cy="donut-svg"]').should('exist');

      cy.get('[data-cy="donut-div-title"]')
        .should('exist')
        .contains(fixture.config.style.chart.title.text);

      cy.get('[data-cy="donut-div-subtitle"]')
        .should('exist')
        .contains(fixture.config.style.chart.title.subtitle.text);

      cy.get('[data-cy="donut-div-legend"]').should('exist');


      const grandTotal = fixture.dataset.map((d) => d.values.reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0);

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        const thisValue = fixture.dataset[i].values.reduce((a, b) => a + b, 0);
        cy.contains(fixture.dataset[i].name);
        cy.contains(Number(thisValue.toFixed(fixture.config.style.chart.legend.roundingValue)).toLocaleString());
        cy.contains(`(${(thisValue / grandTotal * 100).toFixed(fixture.config.style.chart.legend.roundingPercentage)}%)`)
      }

      let modifiedConfig = {
        ...fixture.config,
        style: {
          ...fixture.config.style,
          chart: {
            ...fixture.config.style.chart,
            layout: {
              ...fixture.config.style.chart.layout,
            }
          }
        }
      }

      updateConfigInFixture(modifiedConfig);

      cy.mount(VueUiDonut, {
        props: {
          dataset: fixture.dataset,
          config: modifiedConfig
        }
      });

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="donut-arc-${i}"]`)
          .should('exist')
          .then(($element) => {
            const expectedColor = fixture.config.style.chart.backgroundColor;
            const expectedStrokeWidth = fixture.config.style.chart.layout.donut.strokeWidth;

            cy.wrap($element)
              .invoke('attr', 'stroke')
              .should('eq', expectedColor);

            cy.wrap($element)
              .invoke('attr', 'stroke-width')
              .should('eq', "1")
          })
      }

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        const thisValue = fixture.dataset[i].values.reduce((a, b) => a + b, 0);
        const thisPercentage = `${(thisValue / grandTotal * 100).toFixed(fixture.config.style.chart.legend.roundingPercentage)}%`;

        cy.get(`[data-cy="donut-datalabel-value-${i}"]`)
          .should('exist')
          .contains(thisPercentage);

        cy.get(`[data-cy="donut-datalabel-name-${i}"]`)
          .should('exist')
          .contains(fixture.dataset[i].name)
      }

      cy.get(`[data-cy="user-options-summary"]`)
        .should('exist')
        .click();

      cy.get(`[data-cy="user-options-table"]`).click()


      cy.get(`[data-cy="user-options-label"]`).then(($checkbox) => {
        cy.wrap($checkbox)
          .click();

        for (let i = 0; i < fixture.dataset.length; i += 1) {
          cy.get(`[data-cy="donut-datalabel-value-${i}"]`)
            .should('not.exist');
          cy.get(`[data-cy="donut-datalabel-name-${i}"]`)
            .should('not.exist');
        }

        cy.wrap($checkbox)
          .click();

        for (let i = 0; i < fixture.dataset.length; i += 1) {
          cy.get(`[data-cy="donut-datalabel-value-${i}"]`)
            .should('exist');
          cy.get(`[data-cy="donut-datalabel-name-${i}"]`)
            .should('exist');
        }
      });

      // cy.get(`[data-cy="user-options-pdf"]`).click({ force: true});
      // cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.pdf`);
      // cy.get(`[data-cy="user-options-xls"]`).click({ force: true});
      // cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.csv`);
      // cy.get(`[data-cy="user-options-img"]`).click({ force: true});
      // cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.png`);
      // cy.clearDownloads();
    });
  });
})