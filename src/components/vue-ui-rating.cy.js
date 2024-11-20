import VueUiRating from './vue-ui-rating.vue'

describe('<VueUiRating />', () => {
  beforeEach(function () {
    cy.fixture('rating.json').as('fixture');
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
      cy.mount(VueUiRating, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      function calculateAverageRating(source) {
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
        return Math.min(fixture.config.to, Math.max(fixture.config.from, averageRating));
      }

      const staticRating = calculateAverageRating(fixture.dataset.rating).toFixed(fixture.config.style.rating.roundingValue)

      cy.get(`[data-cy="rating-title"]`)
        .should('exist')
        .contains('Title');

      cy.get(`[data-cy="rating-subtitle"]`)
        .should('exist')
        .contains('Subtitle');

      cy.get(`[data-cy="rating-position-bottom"]`)
        .should('exist')
        .contains(staticRating)

      let modifiedConfig = {
        ...fixture.config,
        style: {
          ...fixture.config.style,
          rating: {
            ...fixture.config.style.rating,
            position: 'top'
          }
        }
      }

      updateConfigInFixture(modifiedConfig);

      cy.mount(VueUiRating, {
        props: {
          dataset: fixture.dataset,
          config: modifiedConfig
        }
      });

      cy.get(`[data-cy="rating-position-top"]`)
        .should('exist')
        .contains(staticRating);

      cy.wait(100).then(() => {
        modifiedConfig.style.rating.position = "left";

        updateConfigInFixture(modifiedConfig);

        cy.mount(VueUiRating, {
          props: {
            dataset: fixture.dataset,
            config: modifiedConfig
          }
        });

        cy.get(`[data-cy="rating-position-left"]`)
          .should('exist')
          .contains(staticRating);
      });

      cy.wait(100).then(() => {

        modifiedConfig.style.rating.position = "right";


        updateConfigInFixture(modifiedConfig);

        cy.mount(VueUiRating, {
          props: {
            dataset: fixture.dataset,
            config: modifiedConfig
          }
        });

        cy.get(`[data-cy="rating-position-right"]`)
          .should('exist')
          .contains(staticRating);
      });

      cy.wait(100).then(() => {
        modifiedConfig.style.rating.position = "bottom";
        updateConfigInFixture(modifiedConfig);

        cy.mount(VueUiRating, {
          props: {
            dataset: fixture.dataset,
            config: modifiedConfig
          }
        });
      });

      const items = fixture.config.to - fixture.config.from + 1;

      for (let i = 0; i < items; i += 1) {
        cy.get(`[data-cy="rating-shape-${i}"]`)
          .should('exist')

        cy.get(`[data-cy="rating-active-trap-${i}"]`)
          .should('exist')
          .click();

        cy.get(`[data-cy="rating-position-bottom"]`)
          .contains(`${i + 1}.0`)
      }

      cy.wait(100).then(() => {
        modifiedConfig.type = "image";
        updateConfigInFixture(modifiedConfig);

        cy.mount(VueUiRating, {
          props: {
            dataset: fixture.dataset,
            config: modifiedConfig
          }
        });

        for (let i = 0; i < items; i += 1) {
          cy.get(`[data-cy="rating-image-${i}"]`).then(($img) => {
            cy.wrap($img)
              .should('exist')

            cy.wrap($img)
              .invoke('attr', 'src')
              .should('eq', fixture.config.style.image.src)

          })
        }

      });

      cy.wait(100).then(() => {
        modifiedConfig.readonly = true;
        updateConfigInFixture(modifiedConfig);

        cy.mount(VueUiRating, {
          props: {
            dataset: fixture.dataset,
            config: modifiedConfig
          }
        });

        for (let i = 0; i < items; i += 1) {
          cy.get(`[data-cy="rating-readonly-trap-${i}"]`)
            .trigger('mouseenter')

          cy.get(`[data-cy="rating-tooltip-${i}"]`)
            .should('exist')
            .contains(`${Object.keys(fixture.dataset.rating)[i]}:${fixture.dataset.rating[`${i + 1}`]}`)
        }
      });
    });
  });
})