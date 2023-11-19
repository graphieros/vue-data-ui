import VueUiSparkbar from './vue-ui-sparkbar.vue'

describe('<VueUiSparkbar />', () => {
  beforeEach(function () {
    cy.fixture('sparkbar.json').as('fixture');
    cy.viewport(1200, 610);
  });

  it('renders with different config attributes', function () {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiSparkbar, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      for(let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="sparkbar-svg-${i}"]`).should('exist');
        cy.get(`[data-cy="sparkbar-name-${i}"]`)
          .should('exist')
          .contains(fixture.dataset[i].name)

        cy.get(`[data-cy="sparkbar-value-${i}"]`)
          .should('exist')
          .contains(`${fixture.dataset[i].prefix}${Number(fixture.dataset[i].value.toFixed(fixture.dataset[i].rounding)).toLocaleString()}${fixture.dataset[i].suffix}`)
      }
    });
  });
})