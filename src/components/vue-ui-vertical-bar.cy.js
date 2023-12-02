import VueUiVerticalBar from './vue-ui-vertical-bar.vue'

describe('<VueUiVerticalBar />', () => {

  beforeEach(function () {
    cy.fixture('vertical-bar.json').as('fixture');
    cy.viewport(1000, 800);
  });

  it('renders', () => {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiVerticalBar, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      cy.get(`[data-cy="vertical-bar-div-title"]`)
        .should('exist')
        .contains(fixture.config.style.chart.title.text);

      cy.get(`[data-cy="vertical-bar-div-subtitle"]`)
        .should('exist')
        .contains(fixture.config.style.chart.title.subtitle.text);

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="vertical-bar-div-legend-item-${i}"]`).then(($legend) => {
          cy.wrap($legend)
            .should('exist')
            .click()
        })
      }

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="vertical-bar-div-legend-item-${i}"]`).then(($legend) => {
          cy.wrap($legend)
            .click()
        })
      }

      cy.get(`[data-cy="user-options-summary"]`).click();

      cy.get(`[data-cy="vertical-bar-checkbox-title"]`).check();

      cy.get(`[data-cy="vertical-bar-text-title"]`)
        .should('exist')
        .contains(fixture.config.style.chart.title.text);

      cy.get(`[data-cy="vertical-bar-text-subtitle"]`)
        .should('exist')
        .contains(fixture.config.style.chart.title.subtitle.text);

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="vertical-bar-foreignObject-legend-item-${i}"]`).then(($legend) => {
          cy.wrap($legend)
            .should('exist')
            .click()
        })
      }

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="vertical-bar-foreignObject-legend-item-${i}"]`).then(($legend) => {
          cy.wrap($legend)
            .click()
        })
      }

      cy.get(`[data-cy="vertical-bar-checkbox-title"]`).uncheck({force: true});
      cy.get(`[data-cy="vertical-bar-checkbox-table"]`).check({ force: true});
      cy.viewport(1000, 1050);

      const bars = fixture.dataset.map(d => {
        if(d.children) {
          return d.children.length;
        }
        return 1;
      }).reduce((a,b) => a +b, 0);

      for (let i = 0; i < bars; i += 1) {
        cy.get(`[data-cy="vertical-bar-rect-underlayer-${i}"]`)
          .should('exist')
          .invoke('attr', 'fill')
          .should('eq', fixture.config.style.chart.layout.bars.underlayerColor);
        cy.get(`[data-cy="vertical-bar-datalabel-${i}"]`)
          .should('exist');
      }

      cy.get(`[data-cy="vertical-bar-trap-0"]`)
        .trigger('mouseenter');
        
      cy.get(`[data-cy="vertical-bar-tooltip"]`)
      .should('exist');
      
      cy.get(`[data-cy="vertical-bar-trap-0"]`)
      .trigger('mouseleave');

      cy.get(`[data-cy="vertical-bar-tooltip"]`)
      .should('not.exist');

      cy.get(`[data-cy="vertical-bar-thead"]`)
        .should('exist')
        .contains(`${fixture.config.style.chart.title.text} : ${fixture.config.style.chart.title.subtitle.text}`);

      cy.get(`[data-cy="vertical-bar-thead-tr"]`)
        .should('exist')
        .find('th')
        .should('have.length', 7)
        .each(($th, index) => {
          if(index === 0) {
            cy.wrap($th)
              .should('contain.text', fixture.config.translations.parentName)
          }
          if ([1,4].includes(index)) {
            cy.wrap($th)
              .should('contain.text', fixture.config.translations.value)
          }
          if ([2,6].includes(index)) {
            cy.wrap($th)
              .should('contain.text', fixture.config.translations.percentageToTotal)
          }
          if (index === 3) {
            cy.wrap($th)
              .should('contain.text', fixture.config.translations.childName)
          }
          if(index === 5) {
            cy.wrap($th)
              .should('contain.text', fixture.config.translations.percentageToSerie)
          }
        });

        cy.get(`[data-cy="user-options-summary"]`).click();

        cy.get(`[data-cy="user-options-pdf"]`).click();
        cy.wait(3000);
        cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.pdf`);
        cy.get(`[data-cy="user-options-xls"]`).click();
        cy.wait(3000);
        cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.xlsx`);
        cy.clearDownloads();
        cy.get(`[data-cy="user-options-summary"]`).click();

      });
  });
});