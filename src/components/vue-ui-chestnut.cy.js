import VueUiChestnut from './vue-ui-chestnut.vue';
import { components } from '../../cypress/fixtures/vdui-components';
import { testCommonFeatures } from '../../cypress/fixtures';

const { dataset, config } = components.find(c => c.name === 'VueUiChestnut');

const rootTotals = dataset.map((d) => {
	return d.branches.map((b) => b.value).reduce((a, b) => a + b, 0)
}).sort((a, b) => b - a);

const branchesTotals = dataset.flatMap((d) => {
	return d.branches.map((b) => b.value)
}).sort((a, b) => b - a);

describe('<VueUiChestnut />', () => {
	beforeEach(function () {
		cy.viewport(1000, 750);
	});

	it('renders', () => {
		cy.mount(VueUiChestnut, {
			props: {
				dataset,
				config
			},
		}).then(() => {

			testCommonFeatures({
				userOptions: true,
			});

			cy.get(`[data-cy="chestnut-title"]`)
				.should('exist')
				.contains(config.style.chart.layout.title.text);

			cy.get(`[data-cy="chestnut-subtitle"]`)
				.should('exist')
				.contains(config.style.chart.layout.title.subtitle.text);

			for (let i = 0; i < dataset.length; i += 1) {
				cy.get(`[data-cy="chestnut-root-${i}"]`)
					.should('exist')
					.wait(50)
					.click({ force: true })

				cy.get(`[data-cy="chestnut-root-label-${i}"]`)
					.should('exist')
					.contains(rootTotals[i])
			}

			for (let i = 0; i < branchesTotals.length; i += 1) {
				cy.get(`[data-cy="chestnut-branch-${i}"]`).then(($branch) => {
					cy.wrap($branch)
						.should('exist')
						.wait(50)
						.click({ force: true });

					if (i === branchesTotals.length - 1) {
						cy.wrap($branch)
							.wait(50)
							.click({ force: true })
					}
				});

				cy.get(`[data-cy="chestnut-nut-${i}"]`)
					.should('exist');

				cy.get(`[data-cy="chestnut-trap-${i}"]`).then(($trap) => {
					cy.wrap($trap)
						.wait(50)
						.click({ force: true });

					if (i === branchesTotals.length - 1) {
						cy.get(`[data-cy="chestnut-legend"]`).click({ force: true })
					}
				});

				cy.get(`[data-cy="user-options-summary"]`).click();
				cy.get(`[data-cy="user-options-table"]`).click();
				cy.get(`[data-cy="chestnut-table"]`).should('exist').and('be.visible')
			}
		});
	});

	it('emits', () => {
		cy.mount(VueUiChestnut, {
			props: {
				dataset,
				config
			},
		}).then(({ wrapper }) => {
			cy.log('@selectRoot');
			cy.get('[data-cy="chestnut-root-0"]').click({ force: true }).then(() => {
				expect(wrapper.emitted('selectRoot')).to.exist;
				expect(wrapper.emitted('selectRoot')[0][0]).to.have.keys(
					'branches',
					'color',
					'id',
					'name',
					'r',
					'rootIndex',
					'total',
					'type',
					'x',
					'y'
				);
				expect(wrapper.emitted('selectRoot')[0][0].rootIndex).to.equal(0);
				expect(wrapper.emitted('selectRoot')[0][0].type).to.equal('root');
			});

			cy.log('@selectBranch');
			cy.get('[data-cy="chestnut-branch"]').first().click({ force: true }).then(() => {
				expect(wrapper.emitted('selectBranch')).to.exist;
				expect(wrapper.emitted('selectBranch')[0][0]).to.have.keys(
					'breakdown',
					'color',
					'id',
					'name',
					'proportionToRoot',
					'rootIndex',
					'rootName',
					'type',
					'value',
					'x1',
					'x2',
					'y1',
					'y2'
				);
				expect(wrapper.emitted('selectBranch')[0][0].rootIndex).to.equal(0);
				expect(wrapper.emitted('selectBranch')[0][0].type).to.equal('branch');
			});

			cy.log('@selectNut');
			cy.get('[data-cy="chestnut-trap-0"]').click({ force: true }).then(() => {
				expect(wrapper.emitted('selectNut')).to.exist;
				expect(wrapper.emitted('selectNut')[0][0]).to.have.length(3)
				expect(wrapper.emitted('selectNut')[0][0][0]).to.have.keys(
					'branchName',
					'branchTotal',
					'color',
					'id',
					'name',
					'proportionToBranch',
					'proportionToRoot',
					'proportionToTree',
					'rootIndex',
					'rootName',
					'table',
					'type',
					'value'
				);
				expect(wrapper.emitted('selectNut')[0][0][0].type).to.equal('nut');
				expect(wrapper.emitted('selectNut')[0][0][0].rootIndex).to.equal(0);
			});
		});
	});
});