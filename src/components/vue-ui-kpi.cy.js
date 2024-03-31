import VueUiKpi from "./vue-ui-kpi.vue";

describe('<VueUiKpi />', () => {
    it('renders', () => {
        cy.mount(VueUiKpi, {
            props: {
                dataset: 1000
            },
            slots: {
                title: () => "TITLE SLOT",
                value: () => "VALUE SLOT",
                ['comment-before']: () => "COMMENT BEFORE SLOT",
                ['comment-after']: () => "COMMENT AFTER SLOT"
            }
        })

        cy.get('.vue-ui-kpi')
            .as('container')
            .should('contain', 'TITLE SLOT')
            .and('contain', 'VALUE SLOT')
            .and('contain', 'COMMENT BEFORE SLOT')
            .and('contain', 'COMMENT AFTER SLOT')

        cy.get('@container').should('contain', 0)
        cy.wait(1000)
        cy.get('@container').should('contain', 1000)
    })
})