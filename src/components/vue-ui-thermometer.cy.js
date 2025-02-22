import VueUiThermometer from './vue-ui-thermometer.vue';
import { components } from '../../cypress/fixtures/vdui-components';
import { testCommonFeatures } from '../../cypress/fixtures';

const { config, dataset } = components.find(c => c.name === 'VueUiThermometer');

describe('<VueUiThermometer />', () => {
	it('renders', () => {
		cy.mount(VueUiThermometer, {
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

			cy.log('pill');
			cy.get('[data-cy="pill-underlayer"]').should('exist').and('be.visible');
			cy.get('[data-cy="pill-graduation-rect"]').should('exist').and('be.visible').and('have.length', dataset.steps);
			cy.get('[data-cy="graduation-left"]').should('exist').and('have.css', 'opacity', '1').and('have.length', dataset.steps);
			cy.get('[data-cy="graduation-right"]').should('exist').and('have.css', 'opacity', '1').and('have.length', dataset.steps);
			cy.get('[data-cy="graduation-left-intermediary"]').should('exist').and('have.css', 'opacity', '1').and('have.length', dataset.steps * 3);
			cy.get('[data-cy="graduation-right-intermediary"]').should('exist').and('have.css', 'opacity', '1').and('have.length', dataset.steps * 3);

			cy.log('temperature');
			cy.get('[data-cy="temperature-rect"]').should('exist').and('be.visible');
			cy.get('[data-cy="temperature-label"]').should('exist').and('be.visible').and('contain', dataset.value);
		});
	});
});