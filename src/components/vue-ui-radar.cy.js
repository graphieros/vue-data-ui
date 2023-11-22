import VueUiRadar from './vue-ui-radar.vue'

describe('<VueUiRadar />', () => {

  beforeEach(function () {
    cy.fixture('radar.json').as('fixture');
    cy.viewport(500, 500);
  });

  it('renders', () => {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiRadar, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        },
      }).then((COMPONENT) => {
        [
          {
            selector: `[data-cy="radar-div-title"]`,
            expected: fixture.config.style.chart.title.text
          },
          {
            selector: `[data-cy="radar-div-subtitle"]`,
            expected: fixture.config.style.chart.title.subtitle.text
          },
        ].forEach(el => {
          cy.get(el.selector)
            .should('exist')
            .contains(el.expected)
        });

        for (let i = 0; i < fixture.dataset.categories.length; i += 1) {
          cy.get(`[data-cy="radar-div-legend-item-${i}"]`)
            .should('exist')
            .contains(fixture.dataset.categories[i].name)
        }

        cy.get(`[data-cy="radar-summary"]`).click();
        cy.get(`[data-cy="radar-checkbox-title"]`).check();
        cy.get(`[data-cy="radar-checkbox-table"]`).check();
        cy.viewport(500, 670);
        cy.get(`[data-cy="radar-summary"]`).click();

        [
          {
            selector: `[data-cy="radar-text-title"]`,
            expected: fixture.config.style.chart.title.text
          },
          {
            selector: `[data-cy="radar-text-subtitle"]`,
            expected: fixture.config.style.chart.title.subtitle.text
          },
        ].forEach(el => {
          cy.get(el.selector)
            .should('exist')
            .contains(el.expected)
        });

        for (let i = 0; i < fixture.dataset.categories.length; i += 1) {
          cy.get(`[data-cy="radar-foreignObject-legend-item-${i}"]`)
            .should('exist')
            .contains(fixture.dataset.categories[i].name)
        }

        for (let i = 0; i < fixture.dataset.series.length; i += 1) {
          cy.get(`[data-cy="radar-apex-label-${i}"]`).then(($label) => {
            cy.wrap($label)
              .should('exist')
              .contains(fixture.dataset.series[i].name);

            cy.wrap($label)
              .trigger('mouseenter')
              .wait(100);

            cy.get(`[data-cy="radar-tooltip"]`).then(($tooltip) => {
              cy.wrap($tooltip)
                .should('exist')
                .contains(fixture.dataset.series[i].name)

              fixture.dataset.categories.map(c => c.name).forEach(name => {
                cy.wrap($tooltip)
                  .contains(name)
              });
            });
            if (i === fixture.dataset.series.length - 1) {
              cy.wrap($label)
                .trigger('mouseleave')
            }
          });
        }

        cy.get(`[data-cy="radar-thead"]`)
          .should('exist')
          .contains(`${fixture.config.style.chart.title.text} : ${fixture.config.style.chart.title.subtitle.text}`);


        cy.get(`[data-cy="radar-summary"]`).click();
        cy.get(`[data-cy="radar-pdf"]`).click();
        cy.wait(3000);
        cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.pdf`);
        cy.get(`[data-cy="radar-xls"]`).click();
        cy.wait(3000);
        cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.xlsx`);

        cy.get(`[data-cy="radar-summary"]`).click();
        
        const { component, wrapper } = COMPONENT;
        cy.wait(3000);
        wrapper.componentVM.generatePdf();
        cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.pdf`);
        cy.wait(3000);
        wrapper.componentVM.generateXls();
        cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.xlsx`);
        cy.clearDownloads();

      })
    });
  })
})