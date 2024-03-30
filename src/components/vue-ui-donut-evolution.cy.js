import VueUiDonutEvolution from './vue-ui-donut-evolution.vue'



describe('<VueUiDonutEvolution />', () => {
  beforeEach(function () {
    const stub = cy.stub()
    Cypress.on('uncaught:exception', (err, runnable) => {
      if (err.message.includes('ResizeObserver')) {
          stub()
          return false
      }
    })
    cy.fixture('donut-evolution.json').as('fixture');
    cy.viewport(400, 400);
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiDonutEvolution, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      })
    })
  });

  it('shows zoomed donut on trap click', () => {
    cy.get('[data-cy-trap]').eq(0).click()
    cy.get('[data-cy-zoom]').should('be.visible')
    cy.get('[data-cy-zoom-donut]').should('be.visible')
    cy.get('[data-cy-close]').should('be.visible').click({ force: true})
    cy.get('[data-cy-zoom]').should('not.exist')
  })

  it('segregates series when selecting legend items', () => {
    cy.get('[data-cy-legend-item]').eq(0).click()
    cy.get(`[data-cy="arc_0"]`).should('have.length', 3)
    cy.get('[data-cy-legend-item]').eq(0).click()
    cy.get(`[data-cy="arc_0"]`).should('have.length', 4)
  })

  it('shows donut hovered state', () => {
    cy.get('[data-cy-trap]').eq(0).trigger('mouseenter')
    cy.get('[data-cy="donut_hover_0"]').should('have.length', 4)
    cy.get('[data-cy-trap]').eq(0).trigger('mouseleave')
    cy.get('[data-cy="donut_hover_0"]').should('not.exist')
  })

  it('opens user options and shows table', () => {
    cy.get(`[data-cy="user-options-summary"]`).click()
    cy.get(`[data-cy="user-options-table"]`).click()
    cy.viewport(400,670);
    cy.get(`[data-cy="vue-data-ui-table-data"]`).should('exist')
  })

  // it('downloads pdf, img, xlsx', () => {
  //   cy.get('@fixture').then((fixture) => {
  //     cy.get(`[data-cy="user-options-summary"]`).click()
  //     cy.get(`[data-cy="user-options-pdf"]`).click({ force: true});
  //     cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.pdf`);
  //     cy.get(`[data-cy="user-options-xls"]`).click({ force: true});
  //     cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.csv`);
  //     cy.get(`[data-cy="user-options-img"]`).click( { force: true});
  //     cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.png`);
  //     cy.clearDownloads();
  //     cy.get(`[data-cy="user-options-summary"]`).click()
  //   })
  // })
})