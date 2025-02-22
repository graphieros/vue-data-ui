import VueUiSparkhistogram from './vue-ui-sparkhistogram.vue';
import { components } from '../../cypress/fixtures/vdui-components';
import { dataLabel } from '../lib';

const { config, dataset } = components.find(c => c.name === 'VueUiSparkHistogram');

describe('<VueUiSparkHistogram />', () => {
	it('renders', () => {
		cy.mount(VueUiSparkhistogram, {
			props: {
				dataset,
				config
			}
		}).then(() => {
			cy.log('title');
			cy.get('[data-cy="title"]').should('exist').and('be.visible').and('contain', config.style.title.text);
			cy.get('[data-cy="subtitle"]').should('exist').and('be.visible').and('contain', config.style.title.subtitle.text);

			cy.log('selection');
			cy.get('[data-cy="tooltip-trap"]').first().trigger('mouseover', { force: true });
			cy.get('[data-cy="title-selection"]')
				.should('exist')
				.and('be.visible')
				.and('contain', dataset[0].timeLabel)
				.and('contain', dataLabel({ v: dataset[0].value }));
			cy.get('[data-cy="title-selection-value-label"]').should('exist').and('be.visible').and('contain', dataset[0].valueLabel);

			cy.log('datapoints');
			cy.get('[data-cy="datapoint-rect"]').should('exist').and('be.visible').and('have.length', dataset.length);
			cy.get('[data-cy="datapoint-label-value"]').as('valueLabels').should('exist').and('be.visible').and('have.length', dataset.length);
			cy.get('@valueLabels').each((label, i) => {
				cy.wrap(label).contains(dataLabel({ v: dataset[i].value, r: config.style.labels.value.rounding }));
			});
			cy.get('[data-cy="datapoint-label-valueLabel"]').as('valueLabels2').should('exist').and('be.visible').and('have.length', dataset.length);
			cy.get('@valueLabels2').each((label, i) => {
				cy.wrap(label).contains(dataset[i].valueLabel);
			});
			cy.get('[data-cy="datapoint-label-time"]').as('timeLabels').should('exist').and('be.visible').and('have.length', dataset.length);
			cy.get('@timeLabels').each((label, i) => {
				cy.wrap(label).contains(dataset[i].timeLabel);
			});
		});
	});
});