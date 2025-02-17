import VueUiMiniLoader from "./vue-ui-mini-loader.vue";

describe('<VueUiMiniLoader />', () => {
    it('renders default onion variant', () => {
        cy.mount(VueUiMiniLoader, {}).then(() => {
            cy.get('[data-cy="variant-onion"]').should('exist').and('be.visible');
            cy.get('[data-cy="variant-onion-gutter"]').should('exist').and('be.visible').and('have.length', 3);
            cy.get('[data-cy="variant-onion-track"]').should('exist').and('be.visible').and('have.length', 3);
            cy.get('.onion-animated').should('exist').and('be.visible').and('have.length', 3);
        });
    });

    it('renders line variant', () => {
        cy.mount(VueUiMiniLoader, {
            props: {
                config: { type: 'line' }
            }
        }).then(() => {
            cy.get('[data-cy="variant-line"]').should('exist').and('be.visible');
            cy.get('[data-cy="variant-line-gutter"]').should('exist').and('be.visible').and('have.length', 1);
            cy.get('[data-cy="variant-line-track"]').should('exist').and('be.visible').and('have.length', 1);
            cy.get('.line-animated').should('exist').and('be.visible').and('have.length', 1);
        });
    });

    it('renders bar variant', () => {
        cy.mount(VueUiMiniLoader, {
            props: {
                config: { type: 'bar' }
            }
        }).then(() => {
            cy.get('[data-cy="variant-bar"]').should('exist').and('be.visible');
            cy.get('[data-cy="variant-bar-gutter"]').should('exist').and('be.visible').and('have.length', 1);
            cy.get('[data-cy="variant-bar-track"]').should('exist').and('be.visible').and('have.length', 1);
            cy.get('.bar-animated').should('exist').and('be.visible').and('have.length', 1);
        });
    });
});