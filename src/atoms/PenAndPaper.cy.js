import PenAndPaper from "./PenAndPaper.vue";

describe('Pen and Paper Component', () => {
    beforeEach(() => {
        const parent = document.createElement('div');
        cy.get('body').invoke('css', 'overflow', 'hidden');
        parent.style.height = '500px'
        parent.style.width = '500px'
        parent.style.position = 'fixed'
        document.body.appendChild(parent);

        cy.mount(PenAndPaper, {
            props: {
                active: true,
                backgroundColor: '#FFFFFF',
                color: '#2D353C',
                parent: parent
            },
        });
    });
    

    it('renders correctly when active', () => {
        cy.get('.vue-ui-pen-and-paper-actions').should('be.visible');
    });

    it('draws lines', () => {
        cy.get('[data-cy="pen-and-paper"]').as('svg')
            .trigger('mousedown', { clientX: 100, clientY: 100, force: true })
            .trigger('mousemove', { clientX: 200, clientY: 200, force: true })
            .trigger('mouseup', { force: true });    

        cy.get('.vue-ui-pen-and-paper-path').should('exist').and('be.visible');
        cy.log('Change thickness')

        cy.get('[data-cy="pen-and-paper-thickness"]').invoke('val', 12).trigger('input')

        cy.get('[data-cy="pen-and-paper"]').as('svg')
        .trigger('mousedown', { clientX: 200, clientY: 100, force: true })
        .trigger('mousemove', { clientX: 300, clientY: 200, force: true })
        .trigger('mouseup', { force: true });  

        cy.get('.vue-ui-pen-and-paper-path').should('have.length', 2)
        cy.get('.vue-ui-pen-and-paper-path').eq(0).should('have.attr', 'stroke-width', 1)
        cy.get('.vue-ui-pen-and-paper-path').eq(1).should('have.attr', 'stroke-width', 12)

        cy.log('Undo once')
        cy.get('[data-cy="pen-and-paper-undo"]').click()
        cy.get('.vue-ui-pen-and-paper-path').should('have.length', 1)
        cy.get('.vue-ui-pen-and-paper-path').eq(0).should('have.attr', 'stroke-width', 1)

        cy.log('redo')
        cy.get('[data-cy="pen-and-paper-redo"]').click()
        cy.get('.vue-ui-pen-and-paper-path').should('have.length', 2)
        cy.get('.vue-ui-pen-and-paper-path').eq(0).should('have.attr', 'stroke-width', 1)
        cy.get('.vue-ui-pen-and-paper-path').eq(1).should('have.attr', 'stroke-width', 12)

        cy.log('reset')
        cy.get('[data-cy="pen-and-paper-reset"]').click()
        cy.get('.vue-ui-pen-and-paper-path').should('not.exist')

        cy.log('Change color')
        cy.get('[data-cy="pen-and-paper-color-picker"]').click()
        cy.get('[data-cy="color-picker"]').should('exist').and('be.visible')
        cy.get('[data-cy="color-picker-option"]').eq(2).click()

        cy.get('[data-cy="color-picker-icon"]').invoke('css', 'background-color').should('equal', 'rgb(255, 87, 51)')
        cy.get('[data-cy="pen-and-paper"]').as('svg')
        .trigger('mousedown', { clientX: 200, clientY: 100, force: true })
        .trigger('mousemove', { clientX: 300, clientY: 200, force: true })
        .trigger('mouseup', { force: true });  
        cy.get('.vue-ui-pen-and-paper-path').eq(0).should('be.visible').invoke('css', 'stroke').should('equal', 'rgb(255, 87, 51)')
    });
});
