import VueUi3dBar from "./vue-ui-3d-bar.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

describe('<VueUi3dBar />', () => {
    it('renders with simple dataset', () => {
        cy.viewport(260, 500)
        cy.mount(VueUi3dBar, {
            props: {
                dataset: components.find(c => c.name === 'VueUi3dBar').dataset
            }
        }).then(() => {
            testCommonFeatures({ userOptions: true })
            cy.log('Data label');
            cy.get('[data-cy="vue-ui-3d-bar-simple-datalabel"]').should('exist').and('contain', '100%')
        });
    });

    it('renders with breakdown dataset', () => {
        const dataset = components.find(c => c.name === 'VueUi3dBar').dataset2;
        cy.viewport(500, 500)
        cy.mount(VueUi3dBar, {
            props: {
                dataset
            }
        }).then(({ wrapper }) => {
            testCommonFeatures({ userOptions: true });

            cy.get('.vue-ui-3d-bar-stack').should('exist').and('have.length', 6)
            dataset.series.forEach((ds) => {
                cy.get(`[data-cy="bar-3d-value-${ds.value}"]`).should('exist').and('be.visible')
            })

            cy.log('Props reactivity')
            wrapper.setProps({
                dataset: {
                    series: [dataset.series[0], dataset.series[1]]
                }
            }).then(() => {
                cy.get('.vue-ui-3d-bar-stack').should('exist').and('have.length', 2)
            });
        });
    });

    it('emits', () => {
        const dataset = components.find(c => c.name === 'VueUi3dBar').dataset2;
        cy.mount(VueUi3dBar, {
            props: {
                dataset
            }
        }).then(({ wrapper }) => {
            cy.get('.vue-ui-3d-bar-stack').eq(0).find('path').eq(0).click().then(() => {
                cy.wrap(wrapper.vm.$nextTick()).then(() => {
                    expect(wrapper.emitted('selectDatapoint')).to.exist;
                    expect(wrapper.emitted('selectDatapoint').length).to.equal(2);
                });
            });
        });
    });
});