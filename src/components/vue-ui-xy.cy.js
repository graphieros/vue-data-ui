import VueUiXy from './vue-ui-xy.vue';
import { components } from '../../cypress/fixtures/vdui-components';
import { testCommonFeatures } from '../../cypress/fixtures';

const { config, dataset } = components.find(c => c.name === 'VueUiXy');

describe('<VueUiXy />', () => {
	it('renders default', () => {
		cy.mount(VueUiXy, {
			props: {
				dataset,
				config
			}
		}).then(() => {
			testCommonFeatures({
				userOptions: true,
				title: true,
				subtitle: true,
				slicer: true,
				tooltipCallback: () => {
					cy.get('[data-cy="tooltip-trap"]').first().trigger('mouseenter', { force: true });
					cy.get('[data-cy="highlighter"]').should('exist').and('be.visible');
				}
			});

			cy.log('grid');
			cy.get('[data-cy="xy-grid-line-x"]').should('exist').and('have.css', 'opacity', '1');
			cy.get('[data-cy="xy-grid-line-y"]').should('exist').and('have.css', 'opacity', '1');
			cy.get('[data-cy="xy-grid-horizontal-line"]').should('exist').and('have.css', 'opacity', '1').and('have.length', 7);
			cy.get('[data-cy="xy-grid-vertical-line"]').should('exist').and('have.css', 'opacity', '1').and('have.length', 21);

			cy.log('frame');
			cy.get('[data-cy="frame"]').should('exist').and('be.visible');

			cy.log('y labels');
			cy.get('[data-cy="axis-y-tick"]').should('exist').and('have.css', 'opacity', '1').and('have.length', 7);
			cy.get('[data-cy="axis-y-label"]').as('yLabels').should('exist').and('be.visible');
			cy.get('@yLabels').first().contains(-19);
			cy.get('@yLabels').last().contains(19);

			cy.log('highlight areas');
			cy.get('[data-cy="highlight-area"]').should('exist').and('be.visible');
			cy.get('[data-cy="highlight-area-caption"]').should('exist').and('be.visible').and('contain', config.chart.highlightArea.caption.text);

			cy.log('bars');
			cy.get('[data-cy="datapoint-bar"]').should('exist').and('be.visible').and('have.length', dataset[1].series.length);
			cy.get('[data-cy="datapoint-bar-label"]').should('exist').and('be.visible').and('have.length', dataset[1].series.length);
			
			cy.log('plots');
			cy.get('[data-cy="datapoint-plot"]').should('exist').and('be.visible').and('have.length', dataset[2].series.length);
			cy.get('[data-cy="datapoint-plot-label"]').should('exist').and('be.visible').and('have.length', dataset[2].series.length);

			cy.log('lines');
			cy.get('[data-cy="datapoint-line-coating-straight"]').should('exist').and('be.visible').and('have.length', 1);
			cy.get('[data-cy="datapoint-line-area-straight"]').should('exist').and('be.visible').and('have.length', 1);
			cy.get('[data-cy="datapoint-line-straight"]').should('exist').and('be.visible').and('have.length', 1);
			cy.get('[data-cy="datapoint-line-plot"]').should('exist').and('be.visible').and('have.length', dataset[0].series.length);
			cy.get('[data-cy="datapoint-line-label"]').should('exist').and('be.visible').and('have.length', dataset[0].series.length);
		});
	});
});