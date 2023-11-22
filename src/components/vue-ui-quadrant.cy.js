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

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="quadrant-div-legend-item-${i}"]`)
          .should('exist')
          .contains(fixture.dataset[i].name)
      }
      
      cy.get(`[data-cy="quadrant-summary"]`).click();
      cy.get(`[data-cy="quadrant-checkbox-title"]`).check();
      
      [
        {
          selector: '[data-cy="quadrant-text-title"]',
          expected: fixture.config.style.chart.title.text
        },
        {
          selector: '[data-cy="quadrant-text-subtitle"]',
          expected: fixture.config.style.chart.title.subtitle.text
        },
      ].forEach(el => {
        cy.get(el.selector)
        .should('exist')
        .contains(el.expected)
      });

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="quadrant-foreignObject-legend-item-${i}"]`)
          .should('exist')
          .contains(fixture.dataset[i].name)
      }

      cy.get(`[data-cy="quadrant-checkbox-title"]`).uncheck();
      cy.get(`[data-cy="quadrant-checkbox-table"]`).check();
      cy.get(`[data-cy="quadrant-summary"]`).click();
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

      cy.get(`[data-cy="quadrant-thead"]`)
        .should('exist')
        .contains(`${fixture.config.style.chart.title.text} : ${fixture.config.style.chart.title.subtitle.text}`);


      cy.get(`[data-cy="quadrant-summary"]`).click();        
      cy.get(`[data-cy="quadrant-pdf"]`).click();
      cy.wait(3000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.pdf`);
      cy.get(`[data-cy="quadrant-xls"]`).click();
      cy.wait(3000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.xlsx`);
      cy.clearDownloads();

      cy.get(`[data-cy="quadrant-summary"]`).click();
    });
  })
})