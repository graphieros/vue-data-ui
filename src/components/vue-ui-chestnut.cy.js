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
  
            if(i === branchesTotals.length - 1) {
              cy.get(`[data-cy="chestnut-legend"]`).click({ force: true })
            }
        });

        cy.get(`[data-cy="user-options-summary"]`).click();
        cy.get(`[data-cy="user-options-table"]`).click();
        cy.get(`[data-cy="chestnut-table"]`).should('exist').and('be.visible')
      }
    });
  });
});