import VueUiRadar from './vue-ui-radar.vue';
import { components } from '../../cypress/fixtures/vdui-components';
import { testCommonFeatures } from '../../cypress/fixtures';

const { config, dataset } = components.find(c => c.name === 'VueUiRadar');

describe('<VueUiRadar />', () => {

	it('renders', () => {
		cy.mount(VueUiRadar, {
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
					cy.get('[data-cy="label-apex"]').first().trigger('mouseenter', { force: true });
				}
			});

			cy.log('radial lines');
			cy.get('[data-cy="radial-line"]').should('exist').and('have.css', 'opacity', '1').and('have.length', dataset.series.length);
			
			cy.log('grid');
			cy.get('[data-cy="polygon-inner"]').should('exist').and('have.css', 'opacity', '1').and('have.length', config.style.chart.layout.grid.graduations);
			cy.get('[data-cy="polygon-outer"]').should('exist').and('have.css', 'opacity', '1');

			cy.log('apex labels');
			cy.get('[data-cy="label-apex"]').as('apexLabels').should('exist').and('be.visible').and('have.length', dataset.series.length);
			cy.get('@apexLabels').each((label, i) => {
				cy.wrap(label).contains(dataset.series[i].name);
			});

			cy.log('datapoints');
			cy.get('[data-cy="polygon-datapoint-wrapper"]').should('exist').and('be.visible').and('have.length', dataset.categories.length);
			cy.get('[data-cy="polygon-datapoint"]').should('exist').and('be.visible').and('have.length', dataset.categories.length);
			cy.get('[data-cy="datapoint-circle"]').should('exist').and('be.visible').and('have.length', dataset.categories.length * dataset.series.length);
		});
	});

	it('emits', () => {
		cy.mount(VueUiRadar, {
			props: {
				dataset,
				config
			}
		}).then(({ wrapper }) => {
			cy.log('@selectLegend');
			cy.get('[data-cy="legend-item"]').first().click().then(() => {
				expect(wrapper.emitted('selectLegend')).to.exist;
			});
		});
	});
});