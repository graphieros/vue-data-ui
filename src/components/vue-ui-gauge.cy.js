import VueUiGauge from './vue-ui-gauge.vue';
import { components } from '../../cypress/fixtures/vdui-components';
import { testCommonFeatures } from '../../cypress/fixtures';

const { dataset, config } = components.find(c => c.name === 'VueUiGauge');

describe('<VueUiGauge />', () => {

	it('renders', () => {
		cy.mount(VueUiGauge, {
			props: {
				dataset,
				config
			}
		}).then(() => {
			testCommonFeatures({
				userOptions: true,
				title: true,
				subtitle: true
			});

			cy.log('gauge arcs');
			cy.get('[data-cy="gauge-arc"]').should('exist').and('be.visible').and('have.length', dataset.series.length);
			
			cy.log('indicator');
			cy.get('[data-cy="arc-indicator"]').should('exist').and('be.visible');

			cy.log('arc labels');
			cy.get('[data-cy="arc-label"]').as('arcLabels').should('exist').and('be.visible').and('have.length', dataset.series.length);
			cy.get('@arcLabels').each((label, i) => {
				cy.wrap(label).contains(dataset.series[i].name);
			});

			cy.log('segment separators');
			cy.get('[data-cy="segment-separator-first-wrapper"]').should('exist').and('be.visible');
			cy.get('[data-cy="segment-separator-first"]').should('exist').and('be.visible');
			cy.get('[data-cy="segment-separator-wrapper"]').should('exist').and('be.visible').and('have.length', dataset.series.length);
			cy.get('[data-cy="segment-separator"]').should('exist').and('be.visible').and('have.length', dataset.series.length);

			cy.log('arc value labels');
			cy.get('[data-cy="arc-label-value"]').as('valueLabels').should('exist').and('be.visible').and('have.length', dataset.series.length);
			cy.get('@valueLabels').first().contains(dataset.series[0].from);
			cy.get('@valueLabels').last().contains(dataset.series.at(-1).from);
			cy.get('[data-cy="arc-label-value-last"]').should('exist').and('be.visible').and('contain', dataset.series.at(-1).to);

			cy.log('pointer');
			cy.get('[data-cy="gauge-pointer"]').should('exist').and('be.visible');
			cy.get('[data-cy="gauge-pointer-circle"]').should('exist').and('be.visible');

			cy.log('score');
			cy.get('[data-cy="gauge-score"]').should('exist').and('be.visible').and('contain', dataset.value);
		});
	});
});