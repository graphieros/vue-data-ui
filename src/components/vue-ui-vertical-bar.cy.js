import VueUiVerticalBar from './vue-ui-vertical-bar.vue'

describe('<VueUiVerticalBar />', () => {

  beforeEach(function () {
    cy.fixture('vertical-bar.json').as('fixture');
    cy.viewport(1000, 800);
  });

  it('segregates series when selecting legend items', () => {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiVerticalBar, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      cy.get('[data-cy-legend-item]').eq(0).click()
      cy.get('[data-cy-trap]').should('have.length', 7)
      cy.get('[data-cy-legend-item]').eq(0).click()
      cy.get('[data-cy-trap]').should('have.length', 8)
    });
  })

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

      cy.get(`[data-cy="user-options-summary"]`).click();

      cy.get(`[data-cy="user-options-table"]`).click({ force: true});
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
        
      cy.get(`[data-cy="tooltip"]`)
      .should('exist');
      
      cy.get(`[data-cy="vertical-bar-trap-0"]`)
      .trigger('mouseleave');

      cy.get(`[data-cy="tooltip"]`)
      .should('not.exist');

        cy.get(`[data-cy="user-options-summary"]`).click({ force: true });

        // cy.get(`[data-cy="user-options-pdf"]`).click({ force: true });
        // cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.pdf`);
        // cy.get(`[data-cy="user-options-xls"]`).click({ force: true });
        // cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.csv`);
        // cy.get(`[data-cy="user-options-img"]`).click({ force: true });
        // cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.png`);
        // cy.clearDownloads();
        cy.get(`[data-cy="user-options-summary"]`).click({ force: true });

      });
  });
});