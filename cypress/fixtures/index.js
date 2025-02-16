export function testCommonFeatures({
    userOptions = false,
    title = false,
    subtitle = false,
    dataTable = false,
    tooltipCallback = false,
    legend = false,
    slicer = false
}) {

    if (userOptions) {
        cy.get('[data-cy="user-options"]').should('exist').and('be.visible')
    }

    if (title) {
        cy.get('.atom-title').should('exist').and('be.visible').and('contain', 'Title')
    }

    if (subtitle) {
        cy.get('.atom-subtitle').should('exist').and('be.visible').and('contain', 'Subtitle')
    }

    if (dataTable) {
        cy.log('Open table')
        cy.get('[data-cy="user-options-summary"]').click()
        cy.get('[data-cy="user-options-table"]').should('exist').and('be.visible').click()
        cy.get('.atom-data-table').should('exist').and('be.visible')

        cy.log('close table')
        cy.get('[data-cy="data-table-close"]').should('exist').and('be.visible').click();
        cy.get('.atom-data-table').should('not.be.visible')
    }

    if (tooltipCallback) {
        tooltipCallback();
        cy.get('body').find('.vue-data-ui-tooltip').should('exist')
    }

    if (legend) {
        cy.get('.vue-data-ui-legend').should('exist').and('be.visible');
    }

    if (slicer) {
        cy.get('[data-cy="slicer"]').should('exist').and('be.visible')
    }
}