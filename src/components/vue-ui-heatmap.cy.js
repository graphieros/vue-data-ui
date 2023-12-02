import VueUiHeatmap from './vue-ui-heatmap.vue'


describe('<VueUiHeatmap />', () => {
  beforeEach(function () {
    cy.fixture('heatmap.json').as('fixture');
    cy.viewport(1200, 350);
  });

  function updateConfigInFixture(modifiedConfig) {
    cy.get('@fixture').then((fixture) => {
      const updatedFixture = { ...fixture, config: modifiedConfig };
      cy.wrap(updatedFixture).as('fixture');
    });
  }

  it('renders with different config attributes', function () {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiHeatmap, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      const values = fixture.dataset.flatMap((d) => d.values);
      const minRoundedValue = Math.round(Math.min(...values));
      const maxRoundedValue = Math.round(Math.max(...values));
      const yLabels = fixture.dataset.map((d) => d.name);

      cy.get(`[data-cy="heatmap-div-title"]`)
        .should('exist')
        .contains(fixture.config.style.title.text);

      cy.get(`[data-cy="heatmap-div-subtitle"]`)
        .should('exist')
        .contains(fixture.config.style.title.subtitle.text);

      cy.get(`[data-cy="heatmap-legend-min"]`)
        .should('exist')
        .contains(minRoundedValue);

      cy.get(`[data-cy="heatmap-legend-max"]`)
        .should('exist')
        .contains(maxRoundedValue);

      cy.get(`[data-cy="user-options-summary"]`).click();
      cy.get(`[data-cy="heatmap-checkbox-title"]`).check();
      cy.get(`[data-cy="user-options-summary"]`).click();

      cy.get(`[data-cy="heatmap-text-title"]`)
        .should('exist')
        .contains(fixture.config.style.title.text);

      cy.get(`[data-cy="heatmap-text-subtitle"]`)
        .should('exist')
        .contains(fixture.config.style.title.subtitle.text);

      cy.get(`[data-cy="heatmap-legend-foreignObject-min"]`)
        .should('exist')
        .contains(minRoundedValue);

      cy.get(`[data-cy="heatmap-legend-foreignObject-max"]`)
        .should('exist')
        .contains(maxRoundedValue);

      cy.get(`[data-cy="user-options-summary"]`).click();
      cy.get(`[data-cy="heatmap-checkbox-title"]`).uncheck();
      cy.get(`[data-cy="heatmap-checkbox-table"]`).check();
      cy.get(`[data-cy="user-options-summary"]`).click();

      cy.viewport(1200, 750);

      cy.get(`[data-cy="heatmap-trap-0-0"]`).then(($trap) => {
        cy.wrap($trap)
          .trigger('mouseover');

        cy.get(`[data-cy="heatmap-tooltip"]`)
          .should('exist');

        cy.get(`[data-cy="heatmap-tootlip-name"]`)
          .should('exist')
          .contains(`${yLabels[0]} 0`);

        cy.get(`[data-cy="heatmap-tooltip-value"]`)
          .should('exist')
          .contains(`${Number(fixture.dataset[0].values[0].toFixed(fixture.config.style.tooltip.roundingValue)).toLocaleString()}`);

        cy.wrap($trap)
          .trigger('mouseout');
      });

      cy.get(`[data-cy="heatmap-table-title"]`)
        .should('exist')
        .contains(`${fixture.config.style.title.text} : ${fixture.config.style.title.subtitle.text}`)

      for (let i = 0; i < yLabels.length; i += 1) {
        cy.get(`[data-cy="heatmap-table-col-name-${i}"]`)
          .should('exist')
          .contains(yLabels[i])
      }

      for (let i = 0; i < 5; i += 1) {
        cy.get(`[data-cy="heatmap-table-row-${i}"]`).then(($tr) => {
          cy.wrap($tr)
            .should('exist')
            .find('td')
            .should('have.length', yLabels.length + 1)
            .each(($td, index) => {
              if (index === 0) {
                cy.wrap($td)
                  .contains(fixture.config.style.layout.dataLabels.xAxis.values[i])
              } else {
                cy.wrap($td)
                  .contains(`${Number(fixture.dataset[index - 1].values[i].toFixed(fixture.config.table.td.roundingValue)).toLocaleString()}`)
              }
            })
        })
      }

      cy.get(`[data-cy="user-options-summary"]`).click();

      cy.get(`[data-cy="user-options-pdf"]`).click();
      cy.wait(3000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.title.text}.pdf`);
      cy.get(`[data-cy="user-options-xls"]`).click();
      cy.wait(3000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.title.text}.xlsx`);
      cy.clearDownloads();

      cy.get(`[data-cy="user-options-summary"]`).click();
    });
  });
})