import VueUiSparkbar from './vue-ui-sparkbar.vue';
import { components } from '../../cypress/fixtures/vdui-components';
import { dataLabel } from '../lib';

const { config, dataset } = components.find(c => c.name === 'VueUiSparkbar');

describe('<VueUiSparkbar />', () => {
	it('renders', () => {
		cy.mount(VueUiSparkbar, {
			props: {
				dataset,
				config
			}
		}).then(() => {

			for (let i = 0; i < dataset.length; i += 1) {
				cy.get(`[data-cy="sparkbar-svg-${i}"]`).should('exist');
				cy.get(`[data-cy="sparkbar-name-${i}"]`)
					.should('exist')
					.contains(dataset[i].name);

				cy.get(`[data-cy="sparkbar-value-${i}"]`)
					.should('exist')
					.contains(dataLabel({
						p: dataset[i].prefix,
						v: dataset[i].value,
						s: dataset[i].suffix,
						r: dataset[i].rounding
					}));

				if (config.style.layout.showTargetValue) {
					const targetValueText = config.style.layout.targetValueText;
					const target = config.style.layout.target ?? dataset[i].target ?? 0;

					const formattedValue = dataLabel({
						p: dataset[i].prefix || '',
						v: target,
						s: dataset[i].suffix || '',
						r: dataset[i].rounding || 0
					});

					const expectedText = `${targetValueText} ${formattedValue}`.trim();

					cy.get(`[data-cy="sparkbar-target-value-${i}"]`)
						.should('exist')
						.invoke('text')
						.then((text) => {
							expect(text.trim()).to.eq(expectedText);
						});
				}
			}
		})
	});

	it('renders with custom title and subtitle using slots', () => {
		const customTitle = 'Custom Title';
		const customSubtitle = 'Custom Subtitle';

		cy.mount(VueUiSparkbar, {
			props: {
				dataset,
				config
			},
			slots: {
				title: `<div>
					<div data-cy="custom-title">${customTitle}</div>
					<div data-cy="custom-subtitle">${customSubtitle}</div>
				</div>`
			}
		}).then(() => {
			cy.get('[data-cy="custom-title"]').should('exist').contains(customTitle);
			cy.get('[data-cy="custom-subtitle"]').should('exist').contains(customSubtitle);
			cy.get('[data-cy="sparkbar-title-wrapper"]').should('not.exist');
		});
	});

	it('renders with default title when no slot is provided',  () => {
		cy.mount(VueUiSparkbar, {
			props: {
				dataset,
				config
			}
		}).then(() => {
			cy.get('[data-cy="sparkbar-title-wrapper"]').should('exist');
			cy.get('[data-cy="sparkbar-title"]').should('exist').contains(config.style.title.text);
			cy.get('[data-cy="sparkbar-subtitle"]').should('exist').contains(config.style.title.subtitle.text);
		});
	});
});