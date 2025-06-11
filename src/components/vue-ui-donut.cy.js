import VueUiDonut from './vue-ui-donut.vue';
import { components } from '../../cypress/fixtures/vdui-components';
import { testCommonFeatures } from '../../cypress/fixtures';
import { h } from "vue";

const { config, dataset } = components.find(c => c.name === 'VueUiDonut');

describe('<VueUiDonut />', () => {

	const total = dataset.flatMap(d => d.values).reduce((a, b) => a + b, 0);
	const average = total / dataset.length;

	function commonTest() {
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
		testPlotComments();
	}

	function testDataLabels(variation) {
		cy.log(`data labels ${variation}`);
		cy.get(`[data-cy="${variation}-label-marker"]`).should('exist').and('be.visible').and('have.length', dataset.length);
		cy.get(`[data-cy="${variation}-label-value"]`).as('values').should('exist').and('be.visible').and('have.length', dataset.length);
		cy.get('@values').each((val, i) => {
			cy.wrap(val).should('contain', dataset[i].values.reduce((a, b) => a + b, 0)).and('contain', '%');
		});
		cy.get(`[data-cy="${variation}-label-name"]`).as('names').should('exist').and('be.visible').and('have.length', dataset.length);
		cy.get('@names').each((name, i) => {
			cy.wrap(name).contains(dataset[i].name);
		});
	}

	function testPlotComments() {
		cy.get('[data-cy="slot-plot-comment"]').as('comments').should('exist').and('be.visible').and('have.length', dataset.length);
		cy.get('@comments').each((comment, i) => {
			cy.wrap(comment).contains(dataset[i].comment);
		})
	}

	function testEmits(wrapper) {
		cy.log('@selectLegend');
		cy.get('[data-cy="legend-item"]').first().click({ force: true }).then(() => {
			expect(wrapper.emitted('selectLegend')).to.exist;
		});

		cy.log('selectDatapoint');
		cy.get('[data-cy="tooltip-trap"]').first().click({ force: true }).then(() => {
			expect(wrapper.emitted('selectDatapoint')[0][0]).to.have.keys('datapoint', 'index');
			expect(wrapper.emitted('selectDatapoint')[0][0].index).to.equal(0);
			expect(wrapper.emitted('selectDatapoint')[0][0].datapoint).to.have.keys(
				'absoluteValues',
				'arcSlice',
				'center',
				'color',
				'comment',
				'cx',
				'cy',
				'endX',
				'endY',
				'firstSeparator',
				'name',
				'path',
				'pattern',
				'patternIndex',
				'proportion',
				'ratio',
				'separator',
				'seriesIndex',
				'startX',
				'startY',
				'value'
			);
		});
	}

	it('renders donut default variation', () => {
		cy.mount(VueUiDonut, {
			props: {
				dataset,
				config
			},
			slots: {
				['plot-comment']: ({ plot }) => h('div', {
					'data-cy': 'slot-plot-comment'
				}, plot.comment)
			}
		}).then(({ wrapper }) => {
			commonTest();
			
			cy.get('[data-cy="donut-arc"]').should('exist').and('be.visible').and('have.length', dataset.length);
			cy.get('[data-cy="donut-shadow"]').should('exist').and('be.visible');

			cy.log('hollow');
			cy.get('[data-cy="hollow-total-name"]').should('exist').and('be.visible').contains('Total');
			cy.get('[data-cy="hollow-total-value"]').should('exist').and('be.visible').contains(total.toFixed(0));
			cy.get('[data-cy="hollow-average-name"]').should('exist').and('be.visible').contains('Average');
			cy.get('[data-cy="hollow-average-value"]').should('exist').and('be.visible').contains(average.toFixed(0));

			testDataLabels('donut');
			testEmits(wrapper);
		});
	});

	it('renders polar variation', () => {
		cy.mount(VueUiDonut, {
			props: {
				dataset,
				config: {
					...config,
					type: 'polar'
				}
			},
			slots: {
				['plot-comment']: ({ plot }) => h('div', {
					'data-cy': 'slot-plot-comment'
				}, plot.comment)
			}
		}).then(({ wrapper }) => {
			commonTest();

			cy.get('[data-cy="polar-datapoint"]').should('exist').and('be.visible').and('have.length', dataset.length);
			cy.get('[data-cy="polar-shadow"]').should('exist').and('be.visible').and('have.length', dataset.length);

			testDataLabels('polar');
			testEmits(wrapper);
		});
	});
});