import VueUiSmiley from './vue-ui-smiley.vue'

describe('<VueUiSmiley />', () => {
  beforeEach(function () {
    cy.fixture('smiley.json').as('fixture');
    cy.viewport(800, 160);
  });

  function updateConfigInFixture(modifiedConfig) {
    cy.get('@fixture').then((fixture) => {
      const updatedFixture = { ...fixture, config: modifiedConfig };
      cy.wrap(updatedFixture).as('fixture');
    });
  }

  it('renders with different config attributes', function () {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiSmiley, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      function calculateAverageRating(source) {
        if (source === null) return null;
        let totalSum = 0;
        let totalCount = 0;

        for (const key in source) {
          const ratingValue = parseInt(key);
          const ratingCount = source[key];

          totalSum += ratingValue * ratingCount;
          totalCount += ratingCount;
        }

        if (totalCount === 0) {
          return 0;
        }

        const averageRating = totalSum / totalCount;
        return averageRating;
      }

      const staticRating = Math.round(calculateAverageRating(fixture.dataset.rating))

      cy.get(`[data-cy="smiley-title"]`)
        .should('exist')
        .contains('Title');

      cy.get(`[data-cy="smiley-subtitle"]`)
        .should('exist')
        .contains('Subtitle');

      cy.get(`[data-cy="smiley-position-bottom"]`)
        .should('exist')
        .contains(staticRating);

      for (let i = 0; i < 5; i += 1) {
        cy.get(`[data-cy="smiley-item-${i}"]`)
          .should('exist')
          .click();

        cy.get(`[data-cy="smiley-position-bottom"]`)
          .contains(`${i + 1}`)
      }

      let modifiedConfig = {
        ...fixture.config,
        readonly: true
      }

      updateConfigInFixture(modifiedConfig);

      cy.mount(VueUiSmiley, {
        props: {
          dataset: fixture.dataset,
          config: modifiedConfig
        }
      });

      for (let i = 0; i < 5; i += 1) {
        cy.get(`[data-cy="smiley-item-${i}"]`)
          .trigger('mouseenter')

        cy.get(`[data-cy="smiley-tooltip-${i}"]`)
          .should('exist')
          .contains(`${Object.keys(fixture.dataset.rating)[i]}: ${fixture.dataset.rating[i + 1]}`)
      }
    });
  });
})