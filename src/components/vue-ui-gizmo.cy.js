import VueUiGizmo from "./vue-ui-gizmo.vue";

describe('<VueUiGizmo />', () => {
    it('renders as a battery', () => {
        cy.viewport(410,170)
        cy.mount(VueUiGizmo, {
            props: {
                dataset: 50,
                config: {
                    size: 400
                }
            }
        }).then(() => {
            cy.get('[data-cy="battery-shape"]').should('exist').and('be.visible');
            cy.get('[data-cy="battery-cap"]').should('exist').and('have.css', 'opacity', '0.5');
            cy.get('[data-cy="battery-level"]').should('exist').and('be.visible');
            cy.get('[data-cy="battery-label"]').should('exist').and('be.visible').and('contain', '50%');
        });
    });

    it('renders as a gauge', () => {
        cy.mount(VueUiGizmo, {
            props: {
                dataset: 50,
                config: {
                    type: 'gauge',
                    size: 400
                }
            }
        }).then(() => {
            cy.get('[data-cy="gauge-gutter"]').should('exist').and('be.visible');
            cy.get('[data-cy="gauge-track"]').should('exist').and('be.visible');
            cy.get('[data-cy="gauge-gradient"]').should('exist').and('be.visible');
            cy.get('[data-cy="gauge-label"]').should('exist').and('be.visible').and('contain', '50%');

        });
    });
});