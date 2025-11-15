import VueUiHorizontalBar from './vue-ui-horizontal-bar.vue';
import { components } from '../../cypress/fixtures/vdui-components';
import { testCommonFeatures } from '../../cypress/fixtures';

const { config, dataset } = components.find(c => c.name === 'VueUiHorizontalBar');

describe('<VueUiHorizontalBar />', () => {
	it('renders', () => {
		cy.mount(VueUiHorizontalBar, {
			props: {
				dataset,
				config
			}
		}).then(() => {
			
			testCommonFeatures({
				userOptions: true,
				title: true,
				subtitle: true,
				dataTable: true,
				legend: true,
				tooltipCallback: () => {
					cy.get('[data-cy="tooltip-trap"]').first().trigger('mouseenter', { force: true })
				}
			});

			cy.log('datapoints');
			cy.get('[data-cy="datapoint-underlayer"]').should('exist').and('be.visible').and('have.length', 8);
			cy.get('[data-cy="datapoint-bar"]').should('exist').and('be.visible').and('have.length', 8);
			cy.get('[data-cy="datapoint-label"]').should('exist').and('be.visible').and('have.length', 8);
			cy.get('[data-cy="datapoint-name"]').should('exist').and('be.visible').and('have.length', 8);
			cy.get('[data-cy="datapoint-parent-name"]').should('exist').and('be.visible').and('have.length', dataset.filter(d => !!d.children).length);
			cy.get('[data-cy="datapoint-parent-value"]').should('exist').and('be.visible').and('have.length', dataset.filter(d => !!d.children).length);
		});
	});
	
	it('emits', () => {
		cy.mount(VueUiHorizontalBar, {
			props: {
				dataset,
				config
			}
		}).then(({ wrapper }) => {
			cy.get('[data-cy="legend-item"]').first().click({ force: true }).then(() => {
				expect(wrapper.emitted('selectLegend')).to.exist;
			});
		});
	});
});