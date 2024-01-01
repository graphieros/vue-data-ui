import VueUiRings from './vue-ui-rings.vue'

describe('<VueUiRings />', () => {

  beforeEach(function() {
    cy.fixture('rings.json').as('fixture');
    cy.viewport(600, 800);
  });

  it('renders', () => {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiRings, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      cy.get(`[data-cy="rings-svg"]`).should('exist')

      for(let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="ring-${i}"]`).should('exist')
        cy.wait(200)
        cy.get(`[data-cy="mouse-trap-${i}"]`).trigger('mouseenter', { force: true })
      }

      cy.get(`[data-cy="tooltip"]`).then(($tooltip) => {
        cy.wrap($tooltip).should('exist')
        cy.wrap($tooltip).contains('serie 3')
        cy.wrap($tooltip).contains('30')
        cy.wrap($tooltip).contains('(7%)')
      })

      cy.get(`[data-cy="mouse-trap-3"]`).trigger('mouseleave', { force: true})

      cy.get(`[data-cy="user-options-summary"]`).should('exist').click()

      cy.get(`[data-cy="user-options-pdf"]`).click({ force: true});
      cy.wait(5000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.pdf`);
      cy.get(`[data-cy="user-options-xls"]`).click({ force: true});
      cy.wait(3000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.csv`);
      cy.get(`[data-cy="user-options-img"]`).click({ force: true});
      cy.wait(3000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.png`);
      cy.clearDownloads();
    })
  })
})