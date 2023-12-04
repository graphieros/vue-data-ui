import VueUiScatter from './vue-ui-scatter.vue'

describe('<VueUiScatter />', () => {

  beforeEach(function () {
    cy.fixture('scatter.json').as('fixture');
    cy.viewport(1000, 850);
  });

  it('renders', () => {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiScatter, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      cy.get(`[data-cy="scatter-div-title"]`)
        .should('exist')
        .contains(fixture.config.style.title.text);

      cy.get(`[data-cy="scatter-div-subtitle"]`)
        .should('exist')
        .contains(fixture.config.style.title.subtitle.text);

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="scatter-div-legend-item-${i}"]`).then(($legend) => {
          cy.wrap($legend)
            .should('exist')
            .contains(fixture.dataset[i].name)
          
          cy.wrap($legend)
            .find('circle')
            .invoke('attr', 'fill')
            .should('eq', fixture.dataset[i].color)
        })
      }

      cy.get(`[data-cy="user-options-summary"]`).click();
      cy.get(`[data-cy="scatter-checkbox-title"]`).check();

      cy.get(`[data-cy="scatter-text-title"]`)
        .should('exist')
        .contains(fixture.config.style.title.text);

      cy.get(`[data-cy="scatter-text-subtitle"]`)
        .should('exist')
        .contains(fixture.config.style.title.subtitle.text);

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="scatter-foreignObject-legend-item-${i}"]`).then(($legend) => {
          cy.wrap($legend)
            .should('exist')
            .contains(fixture.dataset[i].name);

          cy.wrap($legend)
            .find('circle')
            .invoke('attr', 'fill')
            .should('eq', fixture.dataset[i].color)
        });
      }

      cy.get(`[data-cy="scatter-checkbox-title"]`).uncheck();
      cy.get(`[data-cy="scatter-checkbox-table"]`).check();
      cy.get(`[data-cy="user-options-summary"]`).click();

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        for (let j = 0; j < fixture.dataset[i].values.length; j += 1) {
          cy.get(`[data-cy="scatter-plot-${i}-${j}"]`).then(($plot) => {
            cy.wrap($plot)
              .should('exist')
              .invoke('attr', 'stroke')
              .should('eq', fixture.config.style.layout.plots.stroke);

            cy.wrap($plot)
              .invoke('attr', 'stroke-width')
              .should('eq', String(fixture.config.style.layout.plots.strokeWidth));
          })
        }
      }

      [
        `[data-cy="scatter-x-axis"]`,
        `[data-cy="scatter-y-axis"]`,
      ].forEach(axis => {
        cy.get(axis).then(($axis) => {
          cy.wrap($axis)
            .should('exist')
            .invoke('attr', 'stroke')
            .should('eq', fixture.config.style.layout.axis.stroke);

          cy.wrap($axis)
            .invoke('attr', 'stroke-width')
            .should('eq', String(fixture.config.style.layout.axis.strokeWidth))
        })
      });

      [
        `[data-cy="scatter-x-min-axis-label"]`,
        `[data-cy="scatter-x-max-axis-label"]`,
        `[data-cy="scatter-x-label-name"]`
      ].forEach(label => {
        cy.get(label).then(($label) => {
          cy.wrap($label)
            .should('exist')
            .invoke('attr', 'font-size')
            .should('eq', String(fixture.config.style.layout.dataLabels.xAxis.fontSize));

          cy.wrap($label)
            .invoke('attr', 'fill')
            .should('eq', fixture.config.style.layout.dataLabels.xAxis.color)
        })
      });

      [
        `[data-cy="scatter-y-min-axis-label"]`,
        `[data-cy="scatter-y-max-axis-label"]`,
        `[data-cy="scatter-y-label-name"]`
      ].forEach(label => {
        cy.get(label).then(($label) => {
          cy.wrap($label)
            .should('exist')
            .invoke('attr', 'font-size')
            .should('eq', String(fixture.config.style.layout.dataLabels.yAxis.fontSize));

          cy.wrap($label)
            .invoke('attr', 'fill')
            .should('eq', fixture.config.style.layout.dataLabels.yAxis.color)
        })
      });

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="scatter-correlation-line-${i}"]`).then(($line) => {
          cy.wrap($line)
            .should('exist')
            .invoke('attr', 'stroke-dasharray')
            .should('eq', String(fixture.config.style.layout.correlation.strokeDasharray));

          cy.wrap($line)
            .invoke('attr', 'stroke')
            .should('eq', fixture.dataset[i].color);

          cy.wrap($line)
            .invoke('attr', 'stroke-width')
            .should('eq', String(fixture.config.style.layout.correlation.strokeWidth))
        });

        cy.get(`[data-cy="scatter-correlation-label-${i}"]`).then(($label) => {
          cy.wrap($label)
            .should('exist')
            .invoke('attr', 'font-size')
            .should('eq', String(fixture.config.style.layout.correlation.label.fontSize));
        })
      }

      cy.get(`[data-cy="scatter-plot-0-0"]`)
        .trigger('mouseover');

      cy.get(`[data-cy="tooltip"]`).then(($tooltip) => {
        cy.wrap($tooltip)
          .should('exist')
          .contains(fixture.dataset[0].name)
        cy.wrap($tooltip)
          .contains(fixture.dataset[0].values[0].name)
      }) 

      cy.get(`[data-cy="scatter-plot-0-0"]`)
        .trigger('mouseleave');

      cy.get(`[data-cy="scatter-thead"]`)
        .should('exist')
        .contains(`${fixture.config.style.title.text} : ${fixture.config.style.title.subtitle.text}`);

      cy.get(`[data-cy="scatter-thead-col"]`)
        .should('exist')
        .find('th')
        .should('have.length', 5)
        .each(($th, index) => {
          if(index === 1) {
            cy.wrap($th)
              .should('contain.text', fixture.config.table.translations.correlationCoefficient)
          }
          if(index === 2) {
            cy.wrap($th)
              .should('contain.text', fixture.config.table.translations.nbrPlots)
          }
          if(index === 3) {
            cy.wrap($th)
              .should('contain.text', `${fixture.config.style.layout.dataLabels.xAxis.name} ${fixture.config.table.translations.average}`)
          }
          if(index === 4) {
            cy.wrap($th)
              .should('contain.text', `${fixture.config.style.layout.dataLabels.yAxis.name} ${fixture.config.table.translations.average}`)
          }
        });

      cy.get(`[data-cy="scatter-table-tr-0"]`)
        .should('exist')
        .find('td')
        .should('have.length', 5)
        .each(($td, index) => {
          if(index === 0) {
            cy.wrap($td)
              .find('circle')
              .invoke('attr', 'fill')
              .should('eq', fixture.dataset[0].color);
            cy.wrap($td)
              .should('contain.text',  fixture.dataset[0].name);
          }
          if(index === 2) {
            cy.wrap($td)
              .contains(String(fixture.dataset[0].values.length))
          }

          const xAverage = fixture.dataset[0].values.map(v => v.x).reduce((a, b) => a + b) / fixture.dataset[0].values.length;

          const yAverage = fixture.dataset[0].values.map(v => v.y).reduce((a, b) => a + b) / fixture.dataset[0].values.length;

          if(index === 3) {
            cy.wrap($td)
              .should('contain.text', `${Number(xAverage.toFixed(fixture.config.table.td.roundingAverage)).toLocaleString()}`)
          }

          if(index === 4) {
            cy.wrap($td)
              .should('contain.text', `${Number(yAverage.toFixed(fixture.config.table.td.roundingAverage)).toLocaleString()}`)
          }
        });

        cy.get(`[data-cy="user-options-summary"]`).click();

        cy.get(`[data-cy="user-options-pdf"]`).click();
        cy.wait(3000);
        cy.readFile(`cypress\\Downloads\\${fixture.config.style.title.text}.pdf`);
        cy.get(`[data-cy="user-options-xls"]`).click();
        cy.wait(3000);
        cy.readFile(`cypress\\Downloads\\${fixture.config.style.title.text}.xlsx`);
        cy.get(`[data-cy="user-options-img"]`).click();
        cy.wait(3000);
        cy.readFile(`cypress\\Downloads\\${fixture.config.style.title.text}.png`);
        cy.clearDownloads();

        cy.get(`[data-cy="user-options-summary"]`).click();

    });
  })
})