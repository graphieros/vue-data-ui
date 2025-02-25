import VueUiRings from './vue-ui-rings.vue';
import { components } from '../../cypress/fixtures/vdui-components';
import { testCommonFeatures } from '../../cypress/fixtures';

const { config, dataset } = components.find(c => c.name === 'VueUiRings');

describe('<VueUiRings />', () => {
	it('renders', () => {
		cy.viewport(500, 600);
		cy.mount(VueUiRings, {
			props: {
				config,
				dataset
			}
		}).then(() => {
			testCommonFeatures({
				userOptions: true,
				title: true,
				subtitle: true,
				legend: true,
				dataTable: true,
				tooltipCallback: () => {
					cy.get('[data-cy="tooltip-trap"]').first().trigger('mouseenter', { force: true });
				}
			});

			cy.log('datapoints');
			cy.get('[data-cy="ring-underlayer"]').should('exist').and('be.visible').and('have.length', dataset.length);
			cy.get('[data-cy="ring"]').should('exist').and('be.visible').and('have.length', dataset.length);
		});
	});

	it('emits', () => {
		cy.mount(VueUiRings, {
			props: {
				dataset,
				config
			}
		}).then(({ wrapper }) => {
			cy.log('@selectLegend');
			cy.get('[data-cy="legend-item"]').first().click().then(() => {
				expect(wrapper.emitted('selectLegend')).to.exist
			});
		});
	});
});