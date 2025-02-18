import VueUiMoodRadar from "./vue-ui-mood-radar.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";
import { useConfig } from "../useConfig";

const { dataset } = components.find(c => c.name === 'VueUiMoodRadar');
const { vue_ui_mood_radar: config } = useConfig();

describe('<VueUiMoodRadar />', () => {

    it('renders', () => {
        cy.viewport(500, 600);
        cy.mount(VueUiMoodRadar, {
            props: {
                dataset,
                config: {
                    ...config,
                    style: {
                        ...config.style,
                        chart: {
                            ...config.style.chart,
                            title: {
                                text: 'Title',
                                subtitle: { text: 'Subtitle' }
                            }
                        }
                    }
                }
            }
        }).then(() => {
            
            testCommonFeatures({
                userOptions: true,
                title: true,
                subtitle: true,
                legend: true
            });

            cy.log('grid');
            cy.get('[data-cy="grid-radial"]').should('exist').and('have.css', 'opacity', '1').and('have.length', 5)
            cy.get('[data-cy="grid-polygon"]').should('exist').and('have.css', 'opacity', '1');

            cy.log('icons');
            for(let i = 1; i <= 5; i += 1 ) {
                cy.get(`[data-cy="icon-${i}"]`).should('exist').and('be.visible').invoke('attr', 'stroke').should('eq', config.style.chart.layout.smileys.colors[i]);
            }

            cy.log('traps');
            for(let i = 1; i <= 5; i += 1 ) {
                cy.get(`[data-cy="trap-${i}"]`).invoke('attr', 'fill').should('eq', 'transparent');
                cy.get(`[data-cy="trap-${i}"]`).should('exist').and('be.visible').trigger('mouseenter');
                cy.get(`[data-cy="trap-${i}"]`).invoke('attr', 'fill').should('eq', `${config.style.chart.layout.smileys.colors[i]}33`);
                cy.log('selection');
                cy.get('[data-cy="datapoint-selection-line"]').should('exist').and('be.visible');
                cy.get('[data-cy="datapoint-selection-circle"]').should('exist').and('be.visible').and('have.length', 10);
                cy.get('[data-cy="label-value"]').should('exist').and('be.visible').contains(dataset[i]);
                cy.get('[data-cy="label-percentage"]').should('exist').and('be.visible').contains('%');
            }
        });
    });
});