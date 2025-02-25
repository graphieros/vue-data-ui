import VueUiSparkline from './vue-ui-sparkline.vue';
import { components } from '../../cypress/fixtures/vdui-components';

const { config, dataset } = components.find(c => c.name === 'VueUiSparkline');

function commonTest(line=true) {
	cy.log('title');
	cy.get('[data-cy="title"]').should('exist').and('be.visible').and('contain', config.style.title.text);
	
	cy.log('data label');
	cy.get('[data-cy="sparkline-datalabel"]').should('exist').and('be.visible').and('contain', dataset.at(-1).value);

	cy.log('selection');
	cy.get('[data-cy="tooltip-trap"]').first().trigger('mouseenter', { force: true });
	cy.get('[data-cy="selection-indicator"]').should('exist').and('have.css', 'opacity', '1');
	cy.get('[data-cy="sparkline-datalabel"]').should('exist').and('be.visible').and('contain', dataset[0].value);
	cy.get('[data-cy="title"]').contains(dataset[0].period);
	if (line) {
		cy.get('[data-cy="selection-plot"]').should('exist').and('be.visible');
	}
}

describe('<VueUiSparkline />', () => {
	it('renders (line)', () => {
		cy.mount(VueUiSparkline, {
			props: {
				dataset,
				config
			}
		}).then(() => {
			commonTest();

			cy.log('area');
			cy.get('[data-cy="sparkline-angle-area"]').should('exist').and('be.visible');

			cy.log('line');
			cy.get('[data-cy="sparkline-straight-line"]').should('exist').and('be.visible');

		});
	});

	it('renders (spline)', () => {
		cy.mount(VueUiSparkline, {
			props: {
				dataset,
				config: {
					...config,
					style: {
						...config.style,
						line: { smooth: true }
					}
				}
			}
		}).then(() => {
			commonTest();

			cy.log('area');
			cy.get('[data-cy="sparkline-smooth-area"]').should('exist').and('be.visible');

			cy.log('line');
			cy.get('[data-cy="sparkline-smooth-path"]').should('exist').and('be.visible');
		});
	});

	it('renders (bars)', () => {
		cy.mount(VueUiSparkline, {
			props: {
				dataset,
				config: {
					...config,
					type: 'bar'
				}
			}
		}).then(() => {
			commonTest(false);
			cy.get('[data-cy="datapoint-bar"]').should('exist').and('be.visible').and('have.length', dataset.length);
		});
	});

	it('emits', () => {
		cy.mount(VueUiSparkline, {
			props: {
				dataset,
				config
			}
		}).then(({ wrapper }) => {
			cy.log('@hoverIndex');
			cy.get('[data-cy="tooltip-trap"]').first().trigger('mouseenter', { force: true }).then(() => {
				expect(wrapper.emitted('hoverIndex')[0][0]).to.have.keys('index');
				expect(wrapper.emitted('hoverIndex')[0][0].index).to.equal(0);
			}).then(() => {
				cy.get('[data-cy="tooltip-trap"]').first().trigger('mouseleave', { force: true}).then(() => {
					expect(wrapper.emitted('hoverIndex')[1][0]).to.have.keys('index');
					expect(wrapper.emitted('hoverIndex')[1][0].index).to.equal(undefined)
				});
			});

			cy.log('@selectDatapoint');
			cy.get('[data-cy="tooltip-trap"]').first().click({ force: true }).then(() => {
				expect(wrapper.emitted('selectDatapoint')[0][0]).to.have.keys('datapoint', 'index')
				expect(wrapper.emitted('selectDatapoint')[0][0].index).to.equal(0);
				expect(wrapper.emitted('selectDatapoint')[0][0].datapoint).to.have.keys(
					'absoluteValue',
					'color',
					'id',
					'period',
					'plotValue',
					'toMax',
					'width',
					'x',
					'y'
				);
			});
		});
	});
});