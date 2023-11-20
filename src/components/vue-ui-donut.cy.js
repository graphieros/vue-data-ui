import VueUiDonut from './vue-ui-donut.vue';

describe('<VueUiDonut />', () => {
  beforeEach(function () {
    cy.fixture('donut.json').as('fixture');
    cy.viewport(1000, 1100);
  });

  function updateConfigInFixture(modifiedConfig) {
    cy.get('@fixture').then((fixture) => {
      const updatedFixture = { ...fixture, config: modifiedConfig };
      cy.wrap(updatedFixture).as('fixture');
    });
  }

  it('renders with different config attributes', function () {
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

      const sortedDataset = JSON.parse(JSON.stringify(fixture.dataset)).sort((a, b) => {
        const sumx = a.values.reduce((x, y) => x + y, 0);
        const sumy = b.values.reduce((x, y) => x + y, 0);
        return sumy - sumx
      });

      const grandTotal = fixture.dataset.map((d) => d.values.reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0);

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="donut-div-legend-marker-${i}"]`)
          .should('exist')
          .invoke('attr', 'fill')
          .should('eq', sortedDataset[i].color);

        cy.get(`[data-cy="donut-div-legend-name-${i}"]`)
          .should('exist')
          .contains(sortedDataset[i].name);

        const thisValue = sortedDataset[i].values.reduce((a, b) => a + b, 0);

        cy.get(`[data-cy="donut-div-legend-value-${i}"]`)
          .should('exist')
          .contains(Number(thisValue.toFixed(fixture.config.style.chart.legend.roundingValue)).toLocaleString());

        const thisPercentage = `(${(thisValue / grandTotal * 100).toFixed(fixture.config.style.chart.legend.roundingPercentage)}%)`;

        cy.get(`[data-cy="donut-div-legend-percentage-${i}"]`)
          .should('exist')
          .contains(thisPercentage);
      }

      let modifiedConfig = {
        ...fixture.config,
        style: {
          ...fixture.config.style,
          chart: {
            ...fixture.config.style.chart,
            layout: {
              ...fixture.config.style.chart.layout,
              useDiv: true
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


      cy.get('[data-cy="donut-text-title"]')
        .should('exist')
        .contains(fixture.config.style.chart.title.text);

      cy.get('[data-cy="donut-text-subtitle"]')
        .should('exist')
        .contains(fixture.config.style.chart.title.subtitle.text);

      cy.get('[data-cy="donut-foreignObject-legend"]').should('exist');

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="donut-foreignObject-legend-marker-${i}"]`)
          .should('exist')
          .invoke('attr', 'fill')
          .should('eq', sortedDataset[i].color);

        cy.get(`[data-cy="donut-foreignObject-legend-name-${i}"]`)
          .should('exist')
          .contains(sortedDataset[i].name);

        const thisValue = sortedDataset[i].values.reduce((a, b) => a + b, 0);

        cy.get(`[data-cy="donut-foreignObject-legend-value-${i}"]`)
          .should('exist')
          .contains(Number(thisValue.toFixed(fixture.config.style.chart.legend.roundingValue)).toLocaleString());

        const thisPercentage = `(${(thisValue / grandTotal * 100).toFixed(fixture.config.style.chart.legend.roundingPercentage)}%)`;

        cy.get(`[data-cy="donut-foreignObject-legend-percentage-${i}"]`)
          .should('exist')
          .contains(thisPercentage);
      }

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="donut-arc-${i}"]`)
          .should('exist')
          .then(($element) => {
            const expectedColor = `${sortedDataset[i].color}CC`;
            const expectedStrokeWidth = fixture.config.style.chart.layout.donut.strokeWidth;

            cy.wrap($element)
              .invoke('attr', 'stroke')
              .should('eq', expectedColor);

            cy.wrap($element)
              .invoke('attr', 'stroke-width')
              .should('eq', String(expectedStrokeWidth))
          })
      }

      cy.get(`[data-cy="donut-gradient-hollow"]`).should('exist');

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="donut-trap-${i}"]`)
          .should('exist')
          .then(($element) => {
            const expectedStrokeWidth = fixture.config.style.chart.layout.donut.strokeWidth;

            cy.wrap($element)
              .invoke('attr', 'stroke-width')
              .should('eq', String(expectedStrokeWidth))
          })
      }

      cy.get(`[data-cy="donut-trap-0"]`)
        .then(($element) => {

          cy.wrap($element)
            .trigger('mouseenter', { force: true })

          cy.get(`[data-cy="donut-tooltip"]`).should('exist');
          cy.get(`[data-cy="donut-tooltip-name"]`)
            .should('exist')
            .contains(sortedDataset[0].name);

          cy.get(`[data-cy="donut-tooltip-marker"]`)
            .should('exist')
            .invoke('attr', 'fill')
            .should('eq', sortedDataset[0].color);

          const expectedTooltipValue = sortedDataset[0].values.reduce((a, b) => a + b, 0).toFixed(fixture.config.style.chart.tooltip.roundingValue);

          cy.get(`[data-cy="donut-tooltip-value"]`)
            .should('exist')
            .contains(expectedTooltipValue);

          cy.wrap($element)
            .invoke('attr', 'stroke')
            .should('eq', 'rgba(0,0,0,0.1)');

          cy.wrap($element)
            .click({ force: true });

          cy.get('.vue-ui-donut-arc-path').should(($arcs) => {
            expect($arcs).to.have.length(3)
          })

          cy.get(`[data-cy="donut-foreignObject-legend-item-0"]`)
            .click();

          cy.get('.vue-ui-donut-arc-path').should(($arcs) => {
            expect($arcs).to.have.length(4)
          })
        });

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        const thisValue = sortedDataset[i].values.reduce((a, b) => a + b, 0);
        const thisPercentage = `${(thisValue / grandTotal * 100).toFixed(fixture.config.style.chart.legend.roundingPercentage)}%`;

        cy.get(`[data-cy="donut-datalabel-value-${i}"]`)
          .should('exist')
          .contains(thisPercentage);

        cy.get(`[data-cy="donut-datalabel-name-${i}"]`)
          .should('exist')
          .contains(sortedDataset[i].name)
      }

      cy.get(`[data-cy="donut-summary"]`)
        .should('exist')
        .click();

      cy.get(`[data-cy="donut-checkbox-title"]`).then(($checkbox) => {
        cy.wrap($checkbox)
          .uncheck();

        cy.get('[data-cy="donut-div-title"]')
          .should('exist')
          .contains(fixture.config.style.chart.title.text);

        cy.get('[data-cy="donut-div-subtitle"]')
          .should('exist')
          .contains(fixture.config.style.chart.title.subtitle.text);

        cy.wrap($checkbox)
          .check();

        cy.get('[data-cy="donut-text-title"]')
          .should('exist')
          .contains(fixture.config.style.chart.title.text);

        cy.get('[data-cy="donut-text-subtitle"]')
          .should('exist')
          .contains(fixture.config.style.chart.title.subtitle.text);
      });

      cy.get(`[data-cy="donut-checkbox-datalabels"]`).then(($checkbox) => {
        cy.wrap($checkbox)
          .uncheck();

        for (let i = 0; i < fixture.dataset.length; i += 1) {
          cy.get(`[data-cy="donut-datalabel-value-${i}"]`)
            .should('not.exist');
          cy.get(`[data-cy="donut-datalabel-name-${i}"]`)
            .should('not.exist');
        }

        cy.wrap($checkbox)
          .check();

        for (let i = 0; i < fixture.dataset.length; i += 1) {
          cy.get(`[data-cy="donut-datalabel-value-${i}"]`)
            .should('exist');
          cy.get(`[data-cy="donut-datalabel-name-${i}"]`)
            .should('exist');
        }
      });


      cy.get(`[data-cy="donut-checkbox-table"]`).then(($checkbox) => {
        cy.get(`[data-cy="donut-table"]`).should('not.exist');

        cy.wrap($checkbox)
          .check();

        cy.viewport(1000, 1200);
        cy.get(`[data-cy="donut-table"]`).should('exist');
        cy.get(`[data-cy="donut-table-title"]`)
          .should('exist')
          .contains(`${fixture.config.style.chart.title.text} : ${fixture.config.style.chart.title.subtitle.text}`);

        for (let i = 0; i < fixture.dataset.length; i += 1) {
          const expectedValue = sortedDataset[i].values.reduce((a, b) => a + b, 0);
          const expectedPercentage = `${(expectedValue / grandTotal * 100).toFixed(fixture.config.style.chart.legend.roundingPercentage)}%`;

          cy.get(`[data-cy="donut-table-tr-${i}"]`).then(($tr) => {
            cy.wrap($tr)
              .should('exist');

            cy.wrap($tr)
              .find('td')
              .should('have.length', 3)
              .each(($td, index) => {
                if (index === 0) {
                  cy.wrap($td)
                    .should('contain.text', `●${sortedDataset[i].name}`)
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
      });

      cy.get(`[data-cy="donut-pdf"]`).click();
      cy.wait(5000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.pdf`);
      cy.get(`[data-cy="donut-xls"]`).click();
      cy.wait(3000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.xlsx`);
      cy.clearDownloads();
    });
  });
})