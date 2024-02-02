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

      cy.get(`[data-cy="user-options-summary"]`).click();
      cy.get(`[data-cy="user-options-table"]`).click();
      cy.get(`[data-cy="user-options-summary"]`).click();

      cy.viewport(1200, 750);

      cy.get(`[data-cy="heatmap-trap-0-0"]`).then(($trap) => {
        cy.wrap($trap)
          .trigger('mouseover');

        cy.get(`[data-cy="tooltip"]`)
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

      cy.get(`[data-cy="user-options-summary"]`).click();

      cy.get(`[data-cy="user-options-pdf"]`).click({ force: true});
      cy.wait(10000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.title.text}.pdf`);
      cy.get(`[data-cy="user-options-xls"]`).click({ force: true});
      cy.wait(3000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.title.text}.csv`);
      cy.get(`[data-cy="user-options-img"]`).click({ force: true});
      cy.wait(10000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.title.text}.png`);
      cy.clearDownloads();

      cy.get(`[data-cy="user-options-summary"]`).click();
    });
  });
})