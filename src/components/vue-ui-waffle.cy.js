import VueUiWaffle from './vue-ui-waffle.vue'


describe('<VueUiWaffle />', () => {
  beforeEach(function () {
    cy.fixture('waffle.json').as('fixture');
    cy.viewport(800, 950);
  });

  function updateConfigInFixture(modifiedConfig) {
    cy.get('@fixture').then((fixture) => {
      const updatedFixture = { ...fixture, config: modifiedConfig };
      cy.wrap(updatedFixture).as('fixture');
    });
  }

  it('renders with different config attributes', function () {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiWaffle, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      cy.get(`[data-cy="waffle-svg"]`)
        .should('exist');

      const sortedDataset = JSON.parse(JSON.stringify(fixture.dataset)).sort((a, b) => {
        const sumx = a.values.reduce((x, y) => x + y, 0);
        const sumy = b.values.reduce((x, y) => x + y, 0);
        return sumy - sumx
      });

      const grandTotal = fixture.dataset.map((d) => d.values.reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0);

      cy.get(`[data-cy="waffle-title"]`)
        .should('exist')
        .contains(fixture.config.style.chart.title.text);

      cy.get(`[data-cy="waffle-subtitle"]`)
        .should('exist')
        .contains(fixture.config.style.chart.title.subtitle.text);

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        const expectedValue = sortedDataset[i].values.reduce((a, b) => a + b, 0);
        const expectedPercentage = (expectedValue / grandTotal * 100).toFixed(fixture.config.style.chart.legend.roundingPercentage);

        cy.get(`[data-cy="waffle-legend-item-${i}"]`)
          .should('exist')
          .contains(`${sortedDataset[i].name} : ${expectedValue}(${expectedPercentage}%)`)
      }

      for (let i = 0; i < Math.pow(fixture.config.style.chart.layout.grid.size, 2); i += 1) {
        cy.get(`[data-cy="waffle-rect-underlayer-${i}"]`)
          .should('exist');
        cy.get(`[data-cy="waffle-rect-${i}"]`)
          .should('exist');
      }

      cy.get(`[data-cy="waffle-rect-0"]`)
        .trigger('mouseover');

      cy.get(`[data-cy="tooltip"]`).then(($tooltip) => {

        const expectedValue = sortedDataset[0].values.reduce((a, b) => a + b, 0);
        const expectedPercentage = (expectedValue / grandTotal * 100).toFixed(fixture.config.style.chart.legend.roundingPercentage);

        cy.wrap($tooltip)
          .should('exist')

        cy.get(`[data-cy="waffle-tooltip-name"]`)
          .should('exist')
          .contains(sortedDataset[0].name)

        cy.get(`[data-cy="waffle-tooltip-marker"]`).then(($marker) => {
          cy.wrap($marker)
            .should('exist')
            .invoke('attr', 'fill')
            .should('eq', sortedDataset[0].color)
        });

        cy.get(`[data-cy="waffle-tooltip-value"]`)
          .should('exist')
          .contains(expectedValue)

        cy.get(`[data-cy="waffle-tooltip-percentage"]`)
          .should('exist')
          .contains(`(${expectedPercentage}%)`)
      });

      cy.get(`[data-cy="waffle-rect-0"]`)
        .trigger('mouseleave');

      cy.get(`[data-cy="user-options-summary"]`)
        .click();

      cy.get(`[data-cy="waffle-checkbox-title"]`).then(($checkbox) => {
        cy.wrap($checkbox)
          .check();

        cy.get(`[data-cy="waffle-text-title"]`)
          .should('exist')
          .contains(fixture.config.style.chart.title.text);

        cy.get(`[data-cy="waffle-text-subtitle"]`)
          .should('exist')
          .contains(fixture.config.style.chart.title.subtitle.text);

        for (let i = 0; i < fixture.dataset.length; i += 1) {
          const expectedValue = sortedDataset[i].values.reduce((a, b) => a + b, 0);
          const expectedPercentage = (expectedValue / grandTotal * 100).toFixed(fixture.config.style.chart.legend.roundingPercentage);

          cy.get(`[data-cy="waffle-foreginObject-legend-item-${i}"]`)
            .should('exist')
            .contains(`${sortedDataset[i].name} : ${expectedValue}(${expectedPercentage}%)`)
        }

        cy.wrap($checkbox)
          .uncheck()
      });

      cy.get(`[data-cy="waffle-checkbox-table"]`).then(($checkbox) => {
        cy.wrap($checkbox)
          .check();

        cy.viewport(800, 1100);

        cy.get(`[data-cy="waffle-table-title"]`)
          .should('exist')
          .contains(`${fixture.config.style.chart.title.text} : ${fixture.config.style.chart.title.subtitle.text}`);

        for (let i = 0; i < fixture.dataset.length; i += 1) {
          const expectedValue = sortedDataset[i].values.reduce((a, b) => a + b, 0);
          const expectedPercentage = `${(expectedValue / grandTotal * 100).toFixed(fixture.config.style.chart.legend.roundingPercentage)}%`;

          cy.get(`[data-cy="waffle-table-tr-${i}"]`).then(($tr) => {
            cy.wrap($tr)
              .should('exist');

            cy.wrap($tr)
              .find('td')
              .should('have.length', 3)
              .each(($td, index) => {
                if (index === 0) {
                  cy.wrap($td)
                    .should('contain.text', `◼${sortedDataset[i].name}`)
                }
                if (index === 1) {
                  cy.wrap($td)
                    .should('contain.text', expectedValue)
                }
                if (index === 2) {
                  cy.wrap($td)
                    .should('contain.text', expectedPercentage)
                }
              });
          });
        }
      })

      cy.get(`[data-cy="user-options-pdf"]`).click();
      cy.wait(5000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.pdf`);
      cy.get(`[data-cy="user-options-xls"]`).click();
      cy.wait(3000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.xlsx`);
      cy.get(`[data-cy="user-options-img"]`).click();
      cy.wait(3000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.png`);
      cy.clearDownloads();
      cy.get(`[data-cy="user-options-summary"]`)
      .click();
    });
  });
})