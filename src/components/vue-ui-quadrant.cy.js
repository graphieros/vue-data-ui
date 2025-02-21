import VueUiQuadrant from './vue-ui-quadrant.vue';
import { components } from '../../cypress/fixtures/vdui-components';
import { testCommonFeatures } from '../../cypress/fixtures';

const { config, dataset } = components.find(c => c.name === 'VueUiQuadrant');

describe('<VueUiQuadrant />', () => {

	it('renders', () => {
		cy.viewport(500, 600);
		cy.mount(VueUiQuadrant, {
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
					cy.get('[data-cy="atom-shape"]').first().trigger('mouseenter', { force: true })
				}
			});

			cy.log('quadrant labels');
			[
				{
					selector: `[data-cy="quadrant-label-tl"]`,
					expected: config.style.chart.layout.labels.quadrantLabels.tl.text
				},
				{
					selector: `[data-cy="quadrant-label-tr"]`,
					expected: config.style.chart.layout.labels.quadrantLabels.tr.text
				},
				{
					selector: `[data-cy="quadrant-label-br"]`,
					expected: config.style.chart.layout.labels.quadrantLabels.br.text
				},
				{
					selector: `[data-cy="quadrant-label-bl"]`,
					expected: config.style.chart.layout.labels.quadrantLabels.bl.text
				},
			].forEach(label => {
				cy.get(label.selector)
					.should('exist')
					.contains(label.expected)
			});

			cy.log('side zooms');
			cy.get('[data-cy="side-trap-tl"]').click({ force: true });
			cy.get('[data-cy="quadrant-svg"]').invoke('attr', 'viewBox').should('eq', '0 0 304.00000000000045 304.00000000000045');
		
			cy.get('[data-cy="side-trap-tr"]').click({ force: true });
			cy.get('[data-cy="quadrant-svg"]').invoke('attr', 'viewBox').should('eq', '208.00000000000006 0 304.00000000000045 304.00000000000045');
			
			cy.get('[data-cy="side-trap-br"]').click({ force: true });
			cy.get('[data-cy="quadrant-svg"]').invoke('attr', 'viewBox').should('eq', '208.00000000000006 208.00000000000006 304.00000000000045 304.00000000000045');
			
			cy.get('[data-cy="side-trap-bl"]').click({ force: true });
			cy.get('[data-cy="quadrant-svg"]').invoke('attr', 'viewBox').should('eq', '-4.263256414560601e-14 208.00000000000006 304.00000000000045 304.00000000000045');

			cy.log('minimap');
			cy.get('[data-cy="minimap-tl"]').click();
			cy.get('[data-cy="quadrant-svg"]').invoke('attr', 'viewBox').should('eq', '-1.4988357199199224e-29 -4.263256414560601e-14 304.00000000000045 304.00000000000045');
			cy.get('[data-cy="minimap-tr"]').click();
			cy.get('[data-cy="quadrant-svg"]').invoke('attr', 'viewBox').should('eq', '208.00000000000006 -1.4988357199199224e-29 304.00000000000045 304.00000000000045');
			cy.get('[data-cy="minimap-br"]').click();
			cy.get('[data-cy="quadrant-svg"]').invoke('attr', 'viewBox').should('eq', '208.00000000000006 208.00000000000006 304.00000000000045 304.00000000000045');
			cy.get('[data-cy="minimap-bl"]').click();
			cy.get('[data-cy="quadrant-svg"]').invoke('attr', 'viewBox').should('eq', '-4.263256414560601e-14 208.00000000000006 304.00000000000045 304.00000000000045');
			cy.get('[data-cy="minimap-bl"]').click();
			cy.get('[data-cy="quadrant-svg"]').invoke('attr', 'viewBox').should('eq', '-1.4988357199199224e-29 -4.263256414560601e-14 512 512');

			cy.log('grid rect');
			cy.get('[data-cy="grid-rect"]').should('exist').and('be.visible').and('have.length', config.style.chart.layout.grid.graduations.steps);

			cy.log('axes');
			cy.get('[data-cy="axis-y"]').should('exist').and('have.css', 'opacity', '1');
			cy.get('[data-cy="axis-x"]').should('exist').and('have.css', 'opacity', '1');
			cy.get('[data-cy="axis-arrow"]').should('exist').and('be.visible').and('have.length', 4);
			cy.get('[data-cy="axis-x-name"]').should('exist').and('be.visible').and('contain', config.style.chart.layout.grid.xAxis.name);
			cy.get('[data-cy="axis-y-name"]').should('exist').and('be.visible').and('contain', config.style.chart.layout.grid.yAxis.name);
			cy.get('[data-cy="label-y-min"]').should('exist').and('be.visible').and('contain', '-8');
			cy.get('[data-cy="label-y-max"]').should('exist').and('be.visible').and('contain', '9');
			cy.get('[data-cy="label-x-min"]').should('exist').and('be.visible').and('contain', '-9');
			cy.get('[data-cy="label-x-max"]').should('exist').and('be.visible').and('contain', '8');

			cy.log('datapoints');
			cy.get('[data-cy="gift-wrap"]').should('exist').and('be.visible');
			cy.get('[data-cy="plot-label"]').should('exist').and('be.visible').and('have.length', dataset[0].series.length);
		});	
	});
});

