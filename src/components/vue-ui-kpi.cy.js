import VueUiKpi from "./vue-ui-kpi.vue";

describe('<VueUiKpi />', () => {
    beforeEach(() => {
        cy.spy(window, 'requestAnimationFrame').as('rafSpy');
    });

    it('renders with slots', () => {
        cy.mount(VueUiKpi, {
            props: {
                dataset: 100
            },
            slots: {
                title: () => "TITLE SLOT",
                value: () => "VALUE SLOT",
                ['comment-before']: () => "COMMENT BEFORE SLOT",
                ['comment-after']: () => "COMMENT AFTER SLOT"
            }
        }).then(() => {
            cy.log('Animating');
            cy.get('@rafSpy').should('have.been.called');

            cy.get('.vue-ui-kpi')
                .as('container')
                .should('contain', 'TITLE SLOT')
                .and('contain', 'VALUE SLOT')
                .and('contain', 'COMMENT BEFORE SLOT')
                .and('contain', 'COMMENT AFTER SLOT');

            cy.get('@container').should('contain', 0);
            cy.get('@container').should('contain', 100);
        });
    });

    it('renders with digits', () => {
        cy.mount(VueUiKpi, {
            props: {
                dataset: 100,
                config: {
                    analogDigits: { show: true }
                }
            }
        }).then(() => {
            cy.log('Animating');
            cy.get('@rafSpy').should('have.been.called');
            cy.get('.vue-ui-digits').should('exist').and('be.visible');
        });
    });
});