import VueUiOnion from './vue-ui-onion.vue'

describe('<VueUiOnion />', () => {
  beforeEach(function () {
    cy.fixture('onion.json').as('fixture');
    cy.viewport(400, 550);
  });

  function updateConfigInFixture(modifiedConfig) {
    cy.get('@fixture').then((fixture) => {
      const updatedFixture = { ...fixture, config: modifiedConfig };
      cy.wrap(updatedFixture).as('fixture');
    });
  }

  it('segregates series when selecting legend items', () => {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiOnion, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      cy.get('[data-cy-legend-item]').eq(0).click()
      cy.get('[data-cy-trap]').should('have.length', 3)
      cy.get('[data-cy-legend-item]').eq(0).click()
      cy.get('[data-cy-trap]').should('have.length', 4)
    });
  })

  it('renders with different config attributes', function () {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiOnion, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      cy.get(`[data-cy="onion-div-title"]`)
        .should('exist')
        .contains(fixture.config.style.chart.title.text);

      cy.get(`[data-cy="onion-div-subtitle"]`)
        .should('exist')
        .contains(fixture.config.style.chart.title.subtitle.text);
    

      cy.get(`[data-cy="user-options-summary"]`).click();
      cy.get(`[data-cy="user-options-table"]`).click();
      cy.viewport(400, 680);

      cy.get(`[data-cy="user-options-summary"]`).click();

      cy.get(`[data-cy="user-options-pdf"]`).click({ force: true});
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.pdf`);
      cy.get(`[data-cy="user-options-xls"]`).click({ force: true});
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.csv`);
      cy.get(`[data-cy="user-options-img"]`).click({ force: true});
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.png`);
      cy.clearDownloads();
    });
  });
})