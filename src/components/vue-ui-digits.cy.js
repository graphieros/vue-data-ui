import VueUiDigits from "./vue-ui-digits.vue";
import { components } from "../../cypress/fixtures/vdui-components";

const { config } = components.find(c => c.name === 'VueUiDigits');

describe('<VueUiDigits />', () => {

    it('renders all digits and decimal', () => {
        cy.mount(VueUiDigits, {
            props: {
                dataset: 123456789.01,
                config
            }
        }).then(() => {
            cy.get('[data-cy="digit"]').should('exist').and('be.visible').and('have.length', 11);
            cy.get('[data-cy="digit-decimal"]').should('exist').and('be.visible');
        })
    });

    it('renders 0', () => {
        cy.viewport(300,500)
        cy.mount(VueUiDigits, {
            props: {
                dataset: 0,
                config
            }
        }).then(() => {
            cy.get('[data-cy="digit"]').should('exist').and('be.visible');
            cy.get('[data-cy="digit-decimal"]').should('not.exist');
            cy.get('[data-cy="digit-a"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-b"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-c"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-d"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-e"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-f"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-g"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
        });
    });

    it('renders 1', () => {
        cy.viewport(300,500)
        cy.mount(VueUiDigits, {
            props: {
                dataset: 1,
                config
            }
        }).then(() => {
            cy.get('[data-cy="digit"]').should('exist').and('be.visible');
            cy.get('[data-cy="digit-decimal"]').should('not.exist');
            cy.get('[data-cy="digit-a"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
            cy.get('[data-cy="digit-b"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-c"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-d"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
            cy.get('[data-cy="digit-e"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
            cy.get('[data-cy="digit-f"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
            cy.get('[data-cy="digit-g"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
        });
    });

    it('renders 2', () => {
        cy.viewport(300,500)
        cy.mount(VueUiDigits, {
            props: {
                dataset: 2,
                config
            }
        }).then(() => {
            cy.get('[data-cy="digit"]').should('exist').and('be.visible');
            cy.get('[data-cy="digit-decimal"]').should('not.exist');
            cy.get('[data-cy="digit-a"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-b"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-c"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
            cy.get('[data-cy="digit-d"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-e"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-f"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
            cy.get('[data-cy="digit-g"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
        });
    });

    it('renders 3', () => {
        cy.viewport(300,500)
        cy.mount(VueUiDigits, {
            props: {
                dataset: 3,
                config
            }
        }).then(() => {
            cy.get('[data-cy="digit"]').should('exist').and('be.visible');
            cy.get('[data-cy="digit-decimal"]').should('not.exist');
            cy.get('[data-cy="digit-a"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-b"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-c"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-d"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-e"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
            cy.get('[data-cy="digit-f"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
            cy.get('[data-cy="digit-g"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
        });
    });

    it('renders 4', () => {
        cy.viewport(300,500)
        cy.mount(VueUiDigits, {
            props: {
                dataset: 4,
                config
            }
        }).then(() => {
            cy.get('[data-cy="digit"]').should('exist').and('be.visible');
            cy.get('[data-cy="digit-decimal"]').should('not.exist');
            cy.get('[data-cy="digit-a"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
            cy.get('[data-cy="digit-b"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-c"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-d"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
            cy.get('[data-cy="digit-e"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
            cy.get('[data-cy="digit-f"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-g"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
        });
    });

    it('renders 5', () => {
        cy.viewport(300,500)
        cy.mount(VueUiDigits, {
            props: {
                dataset: 5,
                config
            }
        }).then(() => {
            cy.get('[data-cy="digit"]').should('exist').and('be.visible');
            cy.get('[data-cy="digit-decimal"]').should('not.exist');
            cy.get('[data-cy="digit-a"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-b"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
            cy.get('[data-cy="digit-c"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-d"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-e"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
            cy.get('[data-cy="digit-f"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-g"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
        });
    });

    it('renders 6', () => {
        cy.viewport(300,500)
        cy.mount(VueUiDigits, {
            props: {
                dataset: 6,
                config
            }
        }).then(() => {
            cy.get('[data-cy="digit"]').should('exist').and('be.visible');
            cy.get('[data-cy="digit-decimal"]').should('not.exist');
            cy.get('[data-cy="digit-a"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-b"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
            cy.get('[data-cy="digit-c"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-d"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-e"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-f"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-g"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
        });
    });

    it('renders 7', () => {
        cy.viewport(300,500)
        cy.mount(VueUiDigits, {
            props: {
                dataset: 7,
                config
            }
        }).then(() => {
            cy.get('[data-cy="digit"]').should('exist').and('be.visible');
            cy.get('[data-cy="digit-decimal"]').should('not.exist');
            cy.get('[data-cy="digit-a"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-b"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-c"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-d"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
            cy.get('[data-cy="digit-e"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
            cy.get('[data-cy="digit-f"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
            cy.get('[data-cy="digit-g"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
        });
    });

    it('renders 8', () => {
        cy.viewport(300,500)
        cy.mount(VueUiDigits, {
            props: {
                dataset: 8,
                config
            }
        }).then(() => {
            cy.get('[data-cy="digit"]').should('exist').and('be.visible');
            cy.get('[data-cy="digit-decimal"]').should('not.exist');
            cy.get('[data-cy="digit-a"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-b"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-c"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-d"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-e"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-f"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-g"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
        });
    });

    it('renders 9', () => {
        cy.viewport(300,500)
        cy.mount(VueUiDigits, {
            props: {
                dataset: 9,
                config
            }
        }).then(() => {
            cy.get('[data-cy="digit"]').should('exist').and('be.visible');
            cy.get('[data-cy="digit-decimal"]').should('not.exist');
            cy.get('[data-cy="digit-a"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-b"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-c"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-d"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-e"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#CCCCCC');
            cy.get('[data-cy="digit-f"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
            cy.get('[data-cy="digit-g"]').should('exist').and('be.visible').invoke('attr', 'fill').should('eq', '#000000ff');
        });
    });
})