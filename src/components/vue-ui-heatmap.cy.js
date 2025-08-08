import VueUiHeatmap from './vue-ui-heatmap.vue';
import { components } from '../../cypress/fixtures/vdui-components';
import { testCommonFeatures } from '../../cypress/fixtures';

const { dataset, config } = components.find(c => c.name === 'VueUiHeatmap');

describe('<VueUiHeatmap />', () => {

	function commonTest() {
		testCommonFeatures({
			userOptions: true,
			title: true,
			subtitle: true,
			dataTable: true,
			tooltipCallback: () => {
				cy.get('[data-cy="tooltip-trap"]').first().trigger('mouseover', { force: true });
				cy.get('[data-cy="cell-selected"]').should('exist').and('be.visible');
			}
		});

		cy.log('cells');
		cy.get('[data-cy="cell-underlayer"]').should('exist').and('be.visible').and('have.length', 91);
		cy.get('[data-cy="cell"]').should('exist').and('be.visible').and('have.length', 91);
		cy.get('[data-cy="cell-label"]').should('exist').and('be.visible').and('have.length', 91);
		cy.get('[data-cy="tooltip-trap"]').should('exist').and('be.visible').and('have.length', 91);
		
		cy.log('y axis labels');
		cy.get('[data-cy="axis-y-label"]').as('yLabels').should('exist').and('be.visible').and('have.length', dataset.length);
		cy.get('@yLabels').each((label, i) => {
			cy.wrap(label).contains(dataset[i].name);
		});

		cy.log('x axis labels');
		cy.get('[data-cy="axis-x-label"]').as('xLabels').should('exist').and('be.visible').and('have.length', 13);
		cy.get('@xLabels').each((label, i) => {
			cy.wrap(label).contains(config.style.layout.dataLabels.xAxis.values[i]);
		});

		cy.log('legend');
		cy.get('[data-cy="legend-label-max"]').should('exist').and('be.visible').and('contain', 30);
		cy.get('[data-cy="legend-label-min"]').should('exist').and('be.visible').and('contain', 0);
		cy.get('[data-cy="legend-gauge"]').should('exist').and('be.visible');
		cy.get('[data-cy="gauge-indicator"]').should('exist').and('be.visible');
	}

	it('renders with legend', () => {
		cy.mount(VueUiHeatmap, {
			props: {
				config,
				dataset
			}
		}).then(commonTest);
	});
});