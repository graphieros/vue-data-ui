import VueUiThermometer from './vue-ui-thermometer.vue'

describe('<VueUiThermometer />', () => {

  beforeEach(function () {
    cy.fixture('thermometer.json').as('fixture');
    cy.viewport(360, 800);
  });

  it('renders', () => {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiThermometer, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      cy.get(`[data-cy="thermometer-div-title"]`)
        .should('exist')
        .contains(fixture.config.style.title.text);

      cy.get(`[data-cy="thermometer-div-subtitle"]`)
        .should('exist')
        .contains(fixture.config.style.title.subtitle.text);

      cy.get(`[data-cy="user-options-summary"]`).click();

      cy.get(`[data-cy="thermometer-checkbox-title"]`).check();

      cy.get(`[data-cy="thermometer-text-title"]`)
        .should('exist')
        .contains(fixture.config.style.title.text);

      cy.get(`[data-cy="thermometer-text-subtitle"]`)
        .should('exist')
        .contains(fixture.config.style.title.subtitle.text);
       
      cy.get(`[data-cy="thermometer-checkbox-title"]`).uncheck();

      cy.get(`[data-cy="thermometer-datalabel"]`).then(($label) => {
        cy.wrap($label)
          .should('exist')
          .contains(Number(fixture.dataset.value.toFixed(fixture.config.style.chart.label.rounding)).toLocaleString());

        cy.wrap($label)
          .invoke('attr', 'fill')
          .should('eq', fixture.config.style.chart.label.color);

        cy.wrap($label)
          .invoke('attr', 'font-size')
          .should('eq', String(fixture.config.style.chart.label.fontSize));

        cy.wrap($label)
          .invoke('attr', 'font-weight')
          .should('eq', fixture.config.style.chart.label.bold ? 'bold' : 'normal');
      });

      cy.get(`[data-cy="user-options-pdf"]`).click();
      cy.wait(3000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.title.text}.pdf`);
      cy.get(`[data-cy="user-options-img"]`).click();
      cy.wait(3000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.title.text}.png`);
      cy.clearDownloads();

      cy.get(`[data-cy="user-options-summary"]`).click();

    });
  });
});