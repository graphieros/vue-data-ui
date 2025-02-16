export function testCommonFeatures({
    userOptions=false,
}) {

    if (userOptions) {
        cy.get('[data-cy="user-options"]').should('exist').and('be.visible')
    }
}