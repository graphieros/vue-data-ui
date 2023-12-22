import Tooltip from './Tooltip.vue'

describe('<Tooltip />', () => {

  beforeEach(() => {
    cy.mount(Tooltip, {
      props: {
        content: `<div data-cy="tooltip-content">Content</div>`,
        show: true,
      },
      slots: {
        default: {
          render: () => 'Default slot'
        },
        ['content-after']: {
          render: () => 'Slot after'
        }
      }
    })
  })

  it('renders all contents', () => {
    cy.contains('Default slot')
    cy.contains('Content')
    cy.contains('Slot after')
  })

  it('follows the mouse', () => {
    cy.get('body').trigger('mousemove', { clientX: 200, clientY: 200, force: true})
    cy.get('[data-cy="tooltip"]').should('have.css', 'top', '248px')
    cy.get('[data-cy="tooltip"]').should('have.css', 'left', '200px')
  })
})