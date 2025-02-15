import { defineComponent, ref } from "vue";
import BaseDirectionPad from "./BaseDirectionPad.vue";

describe('<BaseDirectionPad />', () => {
    it('renders correctly with default props', () => {
        cy.mount(defineComponent({
            components: { BaseDirectionPad },
            template: '<BaseDirectionPad />',
        }));
        cy.get('button').should('have.length', 5);
        cy.get('button').first().should('have.css', 'position', 'absolute');
        cy.get('button').first().should('have.css', 'left', '0px');
        cy.get('[data-cy="base-icon"]').each(icon => {
            cy.wrap(icon).as('icon')
            cy.get('@icon').find('path').eq(0).should($path => {
                const stroke = $path.attr('stroke');
                const fill = $path.attr('fill');
                if (stroke !== 'none') {
                    expect(stroke).to.eq('#1A1A1A');
                } else if (fill) {
                    expect(fill).to.eq('#1A1A1A');
                }
            });
        });
        
    });

    it('emits', () => {
        const moveLeft = cy.stub();
        const moveTop = cy.stub();
        const moveRight = cy.stub();
        const moveBottom = cy.stub();
        const reset = cy.stub();

        cy.mount(defineComponent({
            components: { BaseDirectionPad },
            setup() {
                return { moveLeft, moveTop, moveRight, moveBottom, reset };
            },
            template: `
                <BaseDirectionPad 
                    @moveLeft="moveLeft"
                    @moveTop="moveTop"
                    @moveRight="moveRight"
                    @moveBottom="moveBottom"
                    @reset="reset"
                />
            `
        }));
        cy.get('[data-cy="direction-pad-left"]').click(); 
        cy.wrap(moveLeft).should('have.been.calledOnce');
        cy.get('[data-cy="direction-pad-top"]').click(); 
        cy.wrap(moveTop).should('have.been.calledOnce');
        cy.get('[data-cy="direction-pad-right"]').click(); 
        cy.wrap(moveRight).should('have.been.calledOnce');
        cy.get('[data-cy="direction-pad-bottom"]').click(); 
        cy.wrap(moveBottom).should('have.been.calledOnce');
        cy.get('[data-cy="direction-pad-reset"]').click(); 
        cy.wrap(reset).should('have.been.calledOnce');
    });

    it('handles color prop', () => {
        cy.mount(defineComponent({
            components: { BaseDirectionPad },
            setup() {
                const color = ref('#FF0000');
                return { color };
            },
            template: `
                <BaseDirectionPad :color="color" />
            `
        }));

        cy.get('[data-cy="base-icon"]').each(icon => {
            cy.wrap(icon).as('icon')
            cy.get('@icon').find('path').eq(0).should($path => {
                const stroke = $path.attr('stroke');
                const fill = $path.attr('fill');
                if (stroke !== 'none') {
                    expect(stroke).to.eq('#FF0000');
                } else if (fill) {
                    expect(fill).to.eq('#FF0000');
                }
            });
        });
    });
});
