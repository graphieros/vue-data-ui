import Title from './Title.vue'

describe('<Title />', () => {
  it('renders content with default styles', () => {
    cy.viewport(100, 60)
    cy.mount(Title, {
      props: {
        config: {
          title: {
            cy: 'title',
            text: 'Title',
            color: '#FF0000'
          },
          subtitle: {
            cy: 'subtitle',
            text: 'Subtitle',
            color: '#CCCCCC',
          }
        }
      }
    })
    cy.get('[data-cy="title"]').then(($title) => {
      cy.wrap($title).should('exist').and('be.visible')
      cy.wrap($title).should('have.css', 'font-weight', '700')
      cy.wrap($title).should('have.css', 'color', 'rgb(255, 0, 0)')
      cy.wrap($title).should('have.css', 'font-size', '20px')
      cy.contains('Title')
    })

    cy.get('[data-cy="subtitle"]').then(($subtitle) => {
      cy.wrap($subtitle).should('exist').and('be.visible')
      cy.wrap($subtitle).should('have.css', 'font-weight', '400')
      cy.wrap($subtitle).should('have.css', 'color', 'rgb(204, 204, 204)')
      cy.wrap($subtitle).should('have.css', 'font-size', '14px')
      cy.contains('Subtitle')
    })
  })

  it('renders content with custom styles', () => {
    cy.viewport(100, 70)
    cy.mount(Title, {
      props: {
        config: {
          title: {
            cy: 'title',
            text: 'Title',
            color: '#FF0000',
            bold: false,
            fontSize: 24
          },
          subtitle: {
            cy: 'subtitle',
            text: 'Subtitle',
            color: '#CCCCCC',
            bold: true,
            fontSize: 16
          }
        }
      }
    })
    cy.get('[data-cy="title"]').then(($title) => {
      cy.wrap($title).should('exist').and('be.visible')
      cy.wrap($title).should('have.css', 'font-weight', '400')
      cy.wrap($title).should('have.css', 'color', 'rgb(255, 0, 0)')
      cy.wrap($title).should('have.css', 'font-size', '24px')
      cy.contains('Title')
    })

    cy.get('[data-cy="subtitle"]').then(($subtitle) => {
      cy.wrap($subtitle).should('exist').and('be.visible')
      cy.wrap($subtitle).should('have.css', 'font-weight', '700')
      cy.wrap($subtitle).should('have.css', 'color', 'rgb(204, 204, 204)')
      cy.wrap($subtitle).should('have.css', 'font-size', '16px')
      cy.contains('Subtitle')
    })
  })
})