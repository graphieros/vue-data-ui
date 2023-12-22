import UserOptions from './UserOptions.vue'

describe('<UserOptions />', () => {

  beforeEach(function () {
    cy.viewport(40, 250);
    cy.mount(UserOptions, {
      props: {
        hasImg: true,
        hasTable: true,
        hasSort: true,
        hasLabel: true
      }
    });
    cy.get(`[data-cy="user-options-summary"]`).click()
    cy.get(`[data-cy="user-options-drawer"]`).should('exist').and('be.visible')
  })
  
  it('opens and closes on menu click', () => {
    cy.get(`[data-cy="user-options-summary"]`).click()
    cy.wait(200 )
    cy.get(`[data-cy="user-options-drawer"]`).should('not.be.visible')
  })

  it('closes the drawer on click outside', () => {
    cy.get('body').click(0,0, { force: true})
    cy.wait(200 )
    cy.get(`[data-cy="user-options-drawer"]`).should('not.be.visible')
  })

  it('contains all necessary icons', () => {
    [
      'user-options-pdf',
      'user-options-xls',
      'user-options-img',
      'user-options-table',
      'user-options-label',
      'user-options-sort'
    ].forEach(btn => {
      cy.get(`[data-cy="${btn}"]`).should('exist').and('be.visible')
    })
  })
})