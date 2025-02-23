import VueUiWaffle from './vue-ui-waffle.vue';
import { components } from '../../cypress/fixtures/vdui-components';
import { testCommonFeatures } from '../../cypress/fixtures';

const { config, dataset } = components.find(c => c.name === 'VueUiWaffle');

describe('<VueUiWaffle />', () => {
	it('renders', () => {
		cy.viewport(500,600);
		cy.mount(VueUiWaffle, {
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
				tooltipCallback: () => {
					cy.get('[data-cy="tooltip-trap"]').first().trigger('mouseover', { force: true });
				}
			});

			cy.log('datapoints');
			cy.get('[data-cy="datapoint-underlayer"]').should('exist').and('be.visible').and('have.length', config.style.chart.layout.grid.size ** 2);
			cy.get('[data-cy="datapoint-rect"]').should('exist').and('be.visible').and('have.length', config.style.chart.layout.grid.size ** 2);
			cy.get('[data-cy="datapoint-caption"]').as('captions').should('exist').and('be.visible').and('have.length', dataset.length);
			cy.get('@captions').each((caption, i) => {
				cy.wrap(caption)
					.should('contain', dataset[i].name)
					.and('contain', dataset[i].values.reduce((a, b) => a + b, 0))
			});
		});
	});
});