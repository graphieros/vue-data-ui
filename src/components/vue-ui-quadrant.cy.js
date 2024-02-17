import VueUiQuadrant from './vue-ui-quadrant.vue'

describe('<VueUiQuadrant />', () => {

  beforeEach(function () {
    cy.fixture('quadrant.json').as('fixture');
    cy.viewport(500, 650);
  });

  it('renders', () => {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiQuadrant, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        },
      });

      [
        {
          selector: '[data-cy="quadrant-title"]',
          expected: fixture.config.style.chart.title.text
        },
        {
          selector: '[data-cy="quadrant-subtitle"]',
          expected: fixture.config.style.chart.title.subtitle.text
        },
      ].forEach(el => {
        cy.get(el.selector)
          .should('exist')
          .contains(el.expected)
      });

      cy.get(`[data-cy="user-options-summary"]`).click();
      cy.get(`[data-cy="user-options-table"]`).click();
      cy.get(`[data-cy="user-options-summary"]`).click();
      cy.viewport(500, 850);

      [
        {
          selector: `[data-cy="quadrant-label-tl"]`,
          expected: fixture.config.style.chart.layout.labels.quadrantLabels.tl.text
        },
        {
          selector: `[data-cy="quadrant-label-tr"]`,
          expected: fixture.config.style.chart.layout.labels.quadrantLabels.tr.text
        },
        {
          selector: `[data-cy="quadrant-label-br"]`,
          expected: fixture.config.style.chart.layout.labels.quadrantLabels.br.text
        },
        {
          selector: `[data-cy="quadrant-label-bl"]`,
          expected: fixture.config.style.chart.layout.labels.quadrantLabels.bl.text
        },
      ].forEach(label => {
        cy.get(label.selector)
          .should('exist')
          .contains(label.expected)
      });

      cy.get(`[data-cy="user-options-summary"]`).click();        
      cy.get(`[data-cy="user-options-pdf"]`).click({ force: true});
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.pdf`);
      cy.get(`[data-cy="user-options-xls"]`).click({ force: true});
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.csv`);
      cy.get(`[data-cy="user-options-img"]`).click({ force: true});
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.png`);
      cy.clearDownloads();

      cy.get(`[data-cy="user-options-summary"]`).click();
    });
  })
})