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
        const thisValue = sortedDataset[i].values.reduce((a, b) => a + b, 0);
        cy.contains(sortedDataset[i].name);
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
    });
  });
})