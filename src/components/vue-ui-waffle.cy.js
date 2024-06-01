import VueUiWaffle from './vue-ui-waffle.vue'


describe('<VueUiWaffle />', () => {
  beforeEach(function () {
    const stub = cy.stub()
    Cypress.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('ResizeObserver')) {
          stub()
          return false
      }
    })
    cy.fixture('waffle.json').as('fixture');
    cy.viewport(800, 950);
  });

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

      for (let i = 0; i < Math.pow(fixture.config.style.chart.layout.grid.size, 2); i += 1) {
        cy.get(`[data-cy="waffle-rect-underlayer-${i}"]`)
          .should('exist');
        cy.get(`[data-cy="waffle-rect-${i}"]`)
          .should('exist');
      }

      cy.get(`[data-cy="waffle-rect-0"]`)
        .trigger('mouseover');

      cy.get(`[data-cy="waffle-rect-0"]`)
        .trigger('mouseleave');

      cy.get(`[data-cy="user-options-summary"]`)
        .click();


      cy.get(`[data-cy="user-options-table"]`).then(($checkbox) => {
        cy.wrap($checkbox)
          .click();

        cy.viewport(800, 1100);

        cy.get(`[data-cy="vue-data-ui-table-data"]`)
          .should('exist')
          .contains(`${fixture.config.style.chart.title.text} : ${fixture.config.style.chart.title.subtitle.text}`);
      })

      // cy.get(`[data-cy="user-options-pdf"]`).click({ force: true});
      // cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.pdf`);
      // cy.get(`[data-cy="user-options-xls"]`).click({ force: true});
      // cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.csv`);
      // cy.get(`[data-cy="user-options-img"]`).click({ force: true});
      // cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.png`);
      // cy.clearDownloads();
      cy.get(`[data-cy="user-options-summary"]`)
      .click();
    });
  });
})