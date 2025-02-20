import VueUiTiremarks from "./vue-ui-tiremarks.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { dataset, config } = components.find(c => c.name === 'VueUiTiremarks');

describe('<VueUiTiremarks />', () => {
    
    it('renders', () => {
        cy.mount(VueUiTiremarks, {
            props: {
                dataset,
                config
            }
        }).then(() => {
            
            testCommonFeatures({
                userOptions: true,
                title: true,
                subtitle: true
            });

            cy.log('ticks');
            cy.get('[data-cy="tick"]').should('exist').and('have.css', 'opacity', '1').and('have.length', 100);

            cy.log('data label');
            cy.get('[data-cy="data-label"]').should('exist').and('be.visible').and('contain', dataset.percentage).and('contain', '%');
        });
    });
});