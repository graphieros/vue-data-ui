import VueUiXyCanvas from "./vue-ui-xy-canvas.vue";
import { components } from "../../cypress/fixtures/vdui-components";
import { testCommonFeatures } from "../../cypress/fixtures";

const { dataset, config } = components.find(c => c.name === 'VueUiXyCanvas');

describe('<VueUiXyCanvas />', () => {

    it('renders', () => {
        cy.viewport(500, 560);
        cy.mount(VueUiXyCanvas, {
            props: {
                dataset,
                config
            }
        }).then(() => {
            
            testCommonFeatures({
                userOptions: true,
                title: true,
                subtitle: true,
                legend: true,
                dataTable: true,
                slicer: true,
                tooltipCallback: () => {
                    cy.get('[data-cy="canvas"]').trigger('mousemove')
                }
            });

            cy.get('[data-cy="canvas"]').then(canvas => {
                const c = canvas[0];
                const ctx = c.getContext('2d');
                const pixelData = ctx.getImageData(10, 10, 1, 1).data;
                expect(pixelData[3]).to.be.greaterThan(0);
            });
        });
    });
});