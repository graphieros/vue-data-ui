import VueUiCandlestick from './vue-ui-candlestick.vue'

describe('<VueUiCandlestick />', () => {

  beforeEach(function () {
    cy.fixture('candlestick.json').as('fixture');
    cy.viewport(1000, 750);
  });

  it('renders', () => {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiCandlestick, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        },
      });

      cy.get(`[data-cy="candlestick-div-title"]`)
        .should('exist')
        .contains(fixture.config.style.title.text);

      cy.get(`[data-cy="candlestick-div-subtitle"]`)
        .should('exist')
        .contains(fixture.config.style.title.subtitle.text);

      cy.get(`[data-cy="user-options-summary"]`).click();

      cy.get(`[data-cy="user-options-table"]`).click();
      cy.viewport(1000, 1150);

      [
        `[data-cy="candlestick-grid-x-axis"]`,
        `[data-cy="candlestick-grid-y-axis"]`
      ].forEach(el => {
        cy.get(el).then(($axis) => {
          cy.wrap($axis)
            .should('exist')
            .invoke('attr', 'stroke')
            .should('eq', fixture.config.style.layout.grid.stroke)

          cy.wrap($axis)
            .invoke('attr', 'stroke-width')
            .should('eq', String(fixture.config.style.layout.grid.strokeWidth))
        })
      });

      const expectedTimeLabels = fixture.dataset.map((d) => d[0]);

      // for (let i = 0; i < fixture.dataset.length; i += 1) {
      for (let i = 0; i < 2; i += 1) {
        cy.get(`[data-cy="candlestick-time-label-${i}"]`)
          .should('exist')
          .contains(expectedTimeLabels[i])

        cy.get(`[data-cy="candlestick-wick-vertical-${i}"]`).then(($wick) => {
          cy.wrap($wick)
            .should('exist')
            .invoke('attr', 'stroke')
            .should('eq', fixture.config.style.layout.wick.stroke)

          cy.wrap($wick)
            .invoke('attr', 'stroke-width')
            .should('eq', String(fixture.config.style.layout.wick.strokeWidth));
        });

        [
          `[data-cy="candlestick-wick-high-${i}"]`,
          `[data-cy="candlestick-wick-low-${i}"]`,
        ].forEach(el => {
          cy.get(el).then(($wick) => {
            cy.wrap($wick)
              .should('exist')
              .invoke('attr', 'stroke')
              .should('eq', fixture.config.style.layout.wick.extremity.color);

            cy.wrap($wick)
              .invoke('attr', 'stroke-width')
              .should('eq', String(fixture.config.style.layout.wick.strokeWidth))
          });

          cy.get(`[data-cy="candlestick-rect-underlayer-${i}"]`).then(($rect) => {
            cy.wrap($rect)
              .should('exist')
              .invoke('attr', 'fill')
              .should('eq', fixture.config.style.layout.candle.gradient.underlayer);

            cy.wrap($rect)
              .invoke('attr', 'rx')
              .should('eq', String(fixture.config.style.layout.candle.borderRadius));

            cy.wrap($rect)
              .invoke('attr', 'stroke')
              .should('eq', 'none');
          });

          cy.get(`[data-cy="candlestick-rect-${i}"]`).then(($rect) => {
            cy.wrap($rect)
              .should('exist')
              .invoke('attr', 'rx')
              .should('eq', String(fixture.config.style.layout.candle.borderRadius));

            cy.wrap($rect)
              .invoke('attr', 'stroke')
              .should('eq', fixture.config.style.layout.candle.stroke);
            
            cy.wrap($rect)
              .invoke('attr', 'stroke-width')
              .should('eq', String(fixture.config.style.layout.candle.strokeWidth));

            ['stroke-linecap', 'stroke-linejoin'].forEach((prop) => {
              cy.wrap($rect)
                .invoke('attr', prop)
                .should('eq', 'round')
            })
          });

          cy.get(`[data-cy="candlestick-trap-${i}"]`)
            .should('exist');
        });

        cy.get(`[data-cy="candlestick-trap-0"]`)
          .trigger('mouseover');

        cy.get(`[data-cy="tooltip"]`).then(($tooltip) => {
          [ 
            fixture.config.translations.volume,
            fixture.config.translations.open,
            fixture.config.translations.high,
            fixture.config.translations.low,
            fixture.config.translations.last,
            fixture.dataset[0][1],
            fixture.dataset[0][2],
            fixture.dataset[0][3],
            fixture.dataset[0][4]
          ].forEach((label) => {
            cy.wrap($tooltip)
              .contains(label)
          });

          cy.get(`[data-cy="candlestick-tooltip-period"]`)
            .should('exist')
            .contains(expectedTimeLabels[0]);
        });
      }

      cy.get(`[data-cy="candlestick-trap-0"]`)
          .trigger('mouseleave');

      // cy.get(`[data-cy="user-options-pdf"]`).click({ force: true });
      // cy.readFile(`cypress\\Downloads\\${fixture.config.style.title.text}.pdf`);
      // cy.get(`[data-cy="user-options-xls"]`).click( { force: true });
      // cy.readFile(`cypress\\Downloads\\${fixture.config.style.title.text}.csv`);
      // cy.get(`[data-cy="user-options-img"]`).click( { force: true });
      // cy.readFile(`cypress\\Downloads\\${fixture.config.style.title.text}.png`);
      // cy.clearDownloads();

    });
  });
});