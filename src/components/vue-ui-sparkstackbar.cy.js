import VueUiSparkStackbar from './vue-ui-sparkstackbar.vue';
import { components } from '../../cypress/fixtures/vdui-components';
import { testCommonFeatures } from '../../cypress/fixtures';

const { config, dataset } = components.find(c => c.name === 'VueUiSparkStackbar');

describe('<VueUiSparkStackbar />', () => {
	it('renders', () => {
		cy.mount(VueUiSparkStackbar, {
			props: {
				dataset,
				config
			}
		}).then(() => {
			testCommonFeatures({
				title: true,
				subtitle: true,
				tooltipCallback: () => {
					cy.get('[data-cy="tooltip-trap"]').first().trigger('mouseenter', { force: true });
				}
			});

			cy.log('datapoints');
			cy.get('[data-cy="datapoint-underlayer"]').should('exist').and('be.visible').and('have.length', dataset.length);
			cy.get('[data-cy="datapoint"]').should('exist').and('be.visible').and('have.length', dataset.length);

			cy.log('legend');
			cy.get('[data-cy="sparkstackbar-legend"]').should('exist').and('be.visible');
			cy.get('[data-cy="legend-item"]').as('legendItems').should('exist').and('be.visible').and('have.length', dataset.length);
			cy.get('@legendItems').first().click();
			cy.get('[data-cy="datapoint-underlayer"]').should('exist').and('be.visible').and('have.length', dataset.length - 1);
			cy.get('[data-cy="datapoint"]').should('exist').and('be.visible').and('have.length', dataset.length - 1);
			cy.get('@legendItems').first().click();
			cy.get('[data-cy="datapoint-underlayer"]').should('exist').and('be.visible').and('have.length', dataset.length);
			cy.get('[data-cy="datapoint"]').should('exist').and('be.visible').and('have.length', dataset.length);
		});
	});

	it.only('emits', () => {
		cy.spy(window, 'requestAnimationFrame').as('rafSpy');

		cy.mount(VueUiSparkStackbar, {
			props: {
				dataset,
				config
			}
		}).then(({ wrapper }) => {
			cy.log('@selectDatapoint');
			cy.get('@rafSpy').should('have.been.called').then(() => {
				cy.get('[data-cy="tooltip-trap"]').first().click().then(() => {
					expect(wrapper.emitted('selectDatapoint')[0][0]).to.have.keys('datapoint', 'index');
					expect(wrapper.emitted('selectDatapoint')[0][0].index).to.equal(0);
					expect(wrapper.emitted('selectDatapoint')[0][0].datapoint).to.have.keys('color', 'name', 'proportion', 'proportionLabel', 'start', 'value', 'width', 'seriesIndex');
					expect(wrapper.emitted('selectDatapoint')[0][0].datapoint.color).to.equal('#1f77b4ff');
					expect(wrapper.emitted('selectDatapoint')[0][0].datapoint.name).to.equal(dataset[0].name);
				});
			});
		});
	});
});