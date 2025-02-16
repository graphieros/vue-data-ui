import VueUiCarouselTable from "./vue-ui-carousel-table.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { dataset, config } = components.find(c => c.name === 'VueUiCarouselTable');

describe('<VueUiCarouselTable />', () => {
    it('renders', () => {
        cy.spy(window, 'requestAnimationFrame').as('rafSpy');
        cy.mount(VueUiCarouselTable, {
            props: {
                dataset,
                config
            }
        }).then(() => {
            cy.log('Animating');
            cy.get('@rafSpy').should('have.been.called');

            testCommonFeatures({
                userOptions: true,
            });

            cy.log('Caption');
            cy.get('[data-cy="caption"]').should('exist').and('be.visible').and('contain', config.caption.text);

            cy.log('Th');
            cy.get('th').should('have.length', 7);
            cy.get('th').each((th, i) => {
                cy.wrap(th).as('th')
                cy.get('@th').contains(dataset.head[i]);
            });

            cy.log('Pause');
            cy.get('[data-cy="user-options-summary"]').click();
            cy.get('[data-cy="user-options-anim"]').click();
            cy.wait(100);
            cy.get('@rafSpy').then(rafSpy => {
                const callCountBefore = rafSpy.callCount;
                cy.wait(100);
                cy.get('@rafSpy').should(spy => {
                    expect(spy.callCount).to.eq(callCountBefore);
                });
            });
            
            cy.log('restart');
            cy.get('[data-cy="user-options-anim"]').click();
            cy.wait(100);
            cy.get('@rafSpy').should(spy => {
                expect(spy).to.have.been.calledWith(Cypress.sinon.match.func);
            });
        })
    })
})