import VueUiWaffle from './vue-ui-waffle.vue';
import { components } from '../../cypress/fixtures/vdui-components';
import { testCommonFeatures } from '../../cypress/fixtures';

const { config, dataset } = components.find(c => c.name === 'VueUiWaffle');

describe('<VueUiWaffle />', () => {
	beforeEach(() => {
		cy.viewport(500, 600);
	});

	it('renders', () => {
		cy.mount(VueUiWaffle, {
			props: {
				dataset,
				// Disable responsive to avoid ResizeObserver loop error in Cypress runner
				config: { ...config, responsive: false }
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
			cy.get('[data-cy="datapoint-underlayer"]')
				.should('exist')
				.and('be.visible')
				.and('have.length', config.style.chart.layout.grid.size ** 2);

			cy.get('[data-cy="datapoint-rect"]')
				.should('exist')
				.and('be.visible')
				.and('have.length', config.style.chart.layout.grid.size ** 2);

			cy.get('[data-cy="datapoint-caption"]')
				.as('captions')
				.should('exist')
				.and('be.visible')
				.and('have.length', dataset.length);

			cy.get('@captions').each((caption, i) => {
				cy.wrap(caption)
					.should('contain', dataset[i].name)
					.and('contain', dataset[i].values.reduce((a, b) => a + b, 0));
			});
		});
	});

	it('emits', () => {
		cy.mount(VueUiWaffle, {
			props: {
				dataset,
				config: { ...config, responsive: false }
			}
		}).then(({ wrapper }) => {
			cy.spy(window, 'requestAnimationFrame').as('rafSpy');

			cy.log('@selectLegend');

			cy.get('[data-cy="legend-item"]')
				.first()
				.click({ force: true });

			cy.get('@rafSpy').should('have.been.called');

			cy.wrap(null, { timeout: 10000 }).should(() => {
				expect(wrapper.emitted('selectLegend')).to.exist;
			});
		});
	});
});
