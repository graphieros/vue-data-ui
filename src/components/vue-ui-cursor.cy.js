import VueUiCursor from "./vue-ui-cursor.vue";

describe('<VueUiCursor />', () => {

    beforeEach(() => {
        cy.get('[data-cy-root]').then($root => {
            const div = document.createElement('div');
            div.id = 'container';
            div.style.position="relative";
            div.style.height = '400px';
            div.style.width = '400px';
            div.style.background = '#1A1A1A';
            div.innerText = 'HW!';
            $root.append(div);
        });
    });
    
    it('renders', () => {
        cy.viewport(500,500);
        cy.mount(VueUiCursor, {
            props: {
                parentId: 'container'
            }
        }).then(() => {
            cy.get('[data-cy="vue-ui-cursor"]').should('exist');

            cy.get('#container').trigger('mousemove', { clientX: 250, clientY: 250 });
            cy.get('[data-cy="center-circle"]').should('exist').and('have.css', 'opacity', '1');
            cy.get('[data-cy="bubble"]').should('exist').and('have.css', 'opacity', '1');

            cy.get('#container').click();
            cy.get('[data-cy="wave"]').should('exist').and('have.css', 'opacity');

            cy.log('crosshair');
            cy.get('[data-cy="crosshair-x-left"]').should('exist').and('have.css', 'opacity', '1');
            cy.get('[data-cy="crosshair-x-right"]').should('exist').and('have.css', 'opacity', '1');
            cy.get('[data-cy="crosshair-y-top"]').should('exist').and('have.css', 'opacity', '1');
            cy.get('[data-cy="crosshair-y-bottom"]').should('exist').and('have.css', 'opacity', '1');

            cy.log('intersect circles');
            cy.get('[data-cy="intersect-circle-left"]').should('exist').and('have.css', 'opacity', '1');
            cy.get('[data-cy="intersect-circle-top"]').should('exist').and('have.css', 'opacity', '1');
            cy.get('[data-cy="intersect-circle-right"]').should('exist').and('have.css', 'opacity', '1');
            cy.get('[data-cy="intersect-circle-bottom"]').should('exist').and('have.css', 'opacity', '1');

            cy.log('coordinates');
            cy.get('[data-cy="coordinates-x"]').should('exist').and('contain', '158');
            cy.get('[data-cy="coordinates-y"]').should('exist').and('contain', '158');
        });
    });
});