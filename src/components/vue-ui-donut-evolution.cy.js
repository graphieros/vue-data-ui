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

  function updateConfig(modifiedConfig) {
    cy.get('@fixture').then((fixture) => {
      const updatedFixture = { ...fixture, config: modifiedConfig };
      cy.wrap(updatedFixture).as('fixture');
      cy.mount(VueUiDonutEvolution, {
        props: {
          dataset: fixture.dataset,
          config: modifiedConfig
        }
      });
    });
  }

  it('renders donuts', () => {
    for(let i = 0; i < 12; i += 1) {
      cy.get(`[data-cy="donut-wrapper-${i}"]`).then(($wrapper) => {
        cy.wrap($wrapper).should('exist')
      })
      
      cy.get(`[data-cy="trap-${i}"]`).then(($trap) => {
        cy.wrap($trap).trigger('mouseenter', { force: true })
        cy.wait(150)
        cy.wrap($trap).trigger('mouseleave')
        cy.wrap($trap).click();
        cy.wait(150)
        cy.get(`[data-cy="quit-dialog"]`).click()
      })
    }
  })

  it('opens user options and shows table', () => {
    cy.get(`[data-cy="user-options-summary"]`).click()
    cy.get(`[data-cy="user-options-table"]`).click()
    cy.viewport(400,670);
    cy.get(`[data-cy="vue-data-ui-table-data"]`).should('exist')
  })

  it('downloads pdf, img, xlsx', () => {
    cy.get('@fixture').then((fixture) => {
      cy.get(`[data-cy="user-options-summary"]`).click()
      cy.get(`[data-cy="user-options-pdf"]`).click({ force: true});
      cy.wait(3000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.pdf`);
      cy.get(`[data-cy="user-options-xls"]`).click({ force: true});
      cy.wait(3000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.csv`);
      cy.get(`[data-cy="user-options-img"]`).click( { force: true});
      cy.wait(3000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.png`);
      cy.clearDownloads();
      cy.get(`[data-cy="user-options-summary"]`).click()
    })
  })
})