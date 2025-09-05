import VueUiScatter from './vue-ui-scatter.vue';
import { components } from '../../cypress/fixtures/vdui-components';
import { testCommonFeatures } from '../../cypress/fixtures';

const { config, dataset } = components.find(c => c.name === 'VueUiScatter');

describe('<VueUiScatter />', () => {
	it('renders', () => {
		cy.mount(VueUiScatter, {
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
					cy.get('[data-cy="atom-shape"]').first().trigger('mouseover', { force: true });
				}
			});

			cy.log('marginal bars');
			cy.get('[data-cy="marginal-bar-x"]').should('exist').and('be.visible').and('have.length', 20);
			cy.get('[data-cy="marginal-bar-y"]').should('exist').and('be.visible').and('have.length', 19);
			cy.get('[data-cy="marginal-line-x-wrapper"]').should('exist').and('be.visible');
			cy.get('[data-cy="marginal-line-x"]').should('exist').and('be.visible');
			cy.get('[data-cy="marginal-line-y-wrapper"]').should('exist').and('be.visible');
			cy.get('[data-cy="marginal-line-y"]').should('exist').and('be.visible');

			cy.log('selection');
			cy.get('[data-cy="atom-shape"]').first().trigger('mouseover', { force: true });
			cy.get('[data-cy="selector-line-x"]').should('exist').and('have.css', 'opacity', '1');
			cy.get('[data-cy="selector-line-y"]').should('exist').and('have.css', 'opacity', '1');
			cy.get('[data-cy="selector-label-x"]').should('exist').and('be.visible').and('contain', dataset[0].values[0].x);
			cy.get('[data-cy="selector-label-y"]').should('exist').and('be.visible').and('contain', dataset[0].values[0].y);
			cy.get('[data-cy="selector-circle-marker"]').should('exist').and('be.visible').and('have.length', 2);
			cy.get('[data-cy="selector-datapoint-name"]').should('exist').and('be.visible').and('contain', dataset[0].values[0].name);

			cy.log('axis labels');
			cy.get('[data-cy="scatter-x-label-name"]').should('exist').and('be.visible').and('contain', config.style.layout.dataLabels.xAxis.name);
			cy.get('[data-cy="scatter-x-min-axis-label"]').should('exist').and('be.visible').and('contain', Math.min(...dataset.flatMap(ds => ds.values.map(d => d.x))));
			cy.get('[data-cy="scatter-x-max-axis-label"]').should('exist').and('be.visible').and('contain', Math.max(...dataset.flatMap(ds => ds.values.map(d => d.x))));
			cy.get('[data-cy="scatter-y-label-name"]').should('exist').and('be.visible').and('contain', config.style.layout.dataLabels.yAxis.name);
			cy.get('[data-cy="scatter-y-min-axis-label"]').should('exist').and('be.visible').and('contain', Math.min(...dataset.flatMap(ds => ds.values.map(d => d.y))));
			cy.get('[data-cy="scatter-y-max-axis-label"]').should('exist').and('be.visible').and('contain', Math.max(...dataset.flatMap(ds => ds.values.map(d => d.y))));

			cy.log('correlation');
			cy.get('[data-cy="correlation-line"]').should('exist').and('have.css', 'opacity', '1').and('have.length', dataset.length);
			cy.get('[data-cy="correlation-label"]').should('exist').and('be.visible').and('have.length', dataset.length).and('contain', 1);
		});
	});

	it('uses performance mode', () => {
		cy.mount(VueUiScatter, {
			props: {
				dataset,
				config: {
					...config,
					usePerformanceMode: true
				}
			}
		}).then(() => {
			cy.get('[data-cy="performance-path"]')
				.should('exist')
				.and('be.visible')
				.and('have.length', 2);

			testCommonFeatures({
				userOptions: true,
				title: true,
				subtitle: true,
				dataTable: true,
				legend: true,
				tooltipCallback: () => {
					cy.get('[data-cy="performance-trap"]')
						.trigger('mousemove', { force: true, x: 38, y: 9 });
				}
			});
			cy.get('[data-cy="performance-selected-plot"]')
				.should('exist')
				.and('be.visible');
		})
	})
});