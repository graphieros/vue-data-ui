import VueUiChestnut from './vue-ui-chestnut.vue'

describe('<VueUiChestnut />', () => {
  beforeEach(function () {
    cy.fixture('chestnut.json').as('fixture');
    cy.viewport(1000, 750);
  });

  it('renders', () => {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiChestnut, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        },
      });

      const rootTotals = fixture.dataset.map((d) => {
        return d.branches.map((b) => b.value).reduce((a, b) => a + b, 0)
      }).sort((a, b) => b - a);

      const branchesTotals = fixture.dataset.flatMap((d) => {
        return d.branches.map((b) => b.value)
      }).sort((a, b) => b - a);

      cy.get(`[data-cy="chestnut-title"]`)
        .should('exist')
        .contains(fixture.config.style.chart.layout.title.text);

      cy.get(`[data-cy="chestnut-subtitle"]`)
        .should('exist')
        .contains(fixture.config.style.chart.layout.title.subtitle.text);

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="chestnut-root-${i}"]`)
          .should('exist')
          .wait(50)
          .click({ force: true })

        cy.get(`[data-cy="chestnut-root-label-${i}"]`)
          .should('exist')
          .contains(rootTotals[i])
      }

      for (let i = 0; i < branchesTotals.length; i += 1) {
        cy.get(`[data-cy="chestnut-branch-${i}"]`).then(($branch) => {
          cy.wrap($branch)
            .should('exist')
            .wait(50)
            .click({ force: true });

          if (i === branchesTotals.length - 1) {
            cy.wrap($branch)
              .wait(50)
              .click({ force: true })
          }
        });

        cy.get(`[data-cy="chestnut-nut-${i}"]`)
          .should('exist');

        cy.get(`[data-cy="chestnut-trap-${i}"]`).then(($trap) => {
          cy.wrap($trap)
            .wait(50)
            .click({ force: true });

            if(i === branchesTotals.length - 1) {
              cy.get(`[data-cy="chestnut-legend"]`).click()
            }
        })
      }

      cy.get(`[data-cy="user-options-summary"]`).click();

      cy.get(`[data-cy="chestnut-checkbox-table"]`).check();
      cy.viewport(1000, 1600);

      cy.get(`[data-cy="chestnut-table"]`)
        .should('exist');

      cy.get(`[data-cy="user-options-pdf"]`).click();
      cy.wait(3000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.layout.title.text}.pdf`);
      cy.get(`[data-cy="user-options-xls"]`).click();
      cy.wait(3000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.layout.title.text}.xlsx`);
      cy.clearDownloads();

      cy.get(`[data-cy="user-options-summary"]`).click();
    });
  });
});