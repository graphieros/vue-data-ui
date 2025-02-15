import VueDataUi from './vue-data-ui.vue';
import { components } from '../../cypress/fixtures/vdui-components';

describe('VueDataUi', () => {

    it('handles invalid component gracefully', () => {
        cy.mount(VueDataUi, { props: { component: 'InvalidComponent' } });
        cy.contains('The provided component InvalidComponent does not exist.')
    });

    components.forEach(({ name: component, dataset, wrapperClass, config={} }) => {
        it(`renders ${component} inside VueDataUi`, () => {
            cy.mount(VueDataUi, {
                props: { component, dataset, config },
            }).then(() => {
                cy.get(wrapperClass).should('be.visible');
            });
        });
    });

    // TODO: test emits for each component
});
