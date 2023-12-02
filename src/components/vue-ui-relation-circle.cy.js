import VueUiRelationCircle from './vue-ui-relation-circle.vue'

describe('<VueUiRelationCircle />', () => {

  beforeEach(function () {
    cy.fixture('relation-circle.json').as('fixture');
    cy.viewport(500, 500);
  });

  it('renders', () => {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiRelationCircle, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        },
      });

      [
        {
          selector: `[data-cy="relation-div-title"]`,
          expected: fixture.config.style.title.text
        },
        {
          selector: `[data-cy="relation-div-subtitle"]`,
          expected: fixture.config.style.title.subtitle.text
        },
      ].forEach(el => {
        cy.get(el.selector)
          .should('exist')
          .contains(el.expected)
      });

      cy.get(`[data-cy="relation-circle"]`).then(($circle) => {
        cy.wrap($circle)
          .should('exist');

        [
          {
            attr: 'r',
            expected: String(fixture.config.style.size * fixture.config.style.circle.radiusProportion)
          },
          {
            attr: 'cx',
            expected: String(fixture.config.style.size / 2)
          },
          {
            attr: 'cy',
            expected: String(fixture.config.style.size / 2 + fixture.config.style.circle.offsetY)
          },
          {
            attr: 'stroke',
            expected: fixture.config.style.circle.stroke
          },
          {
            attr: 'stroke-width',
            expected: String(fixture.config.style.circle.strokeWidth)
          },
        ].forEach(el => {
          cy.wrap($circle)
            .invoke('attr', el.attr)
            .should('eq', el.expected)
        });
      });

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="relation-text-${i}"]`).then(($text) => {
          cy.wrap($text)
            .should('exist')
            .contains(fixture.dataset[i].label)
            .wait(100)
            .click();

          if (i === fixture.dataset.length - 1) {
            cy.wrap($text)
              .wait(100)
              .click();
          }
        });
      }

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="relation-plot-${i}"]`).then(($plot) => {
          cy.wrap($plot)
            .should('exist')
            .invoke('attr', 'fill')
            .should('eq', fixture.config.style.plot.color)
        });
      }

      cy.get(`[data-cy="user-options-summary"]`).click();
      cy.get(`[data-cy="user-options-pdf"]`).click();
      cy.wait(3000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.title.text}.pdf`);

      cy.get(`[data-cy="user-options-summary"]`).click();
      cy.clearDownloads();

    });
  })
})