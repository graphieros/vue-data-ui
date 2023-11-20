import VueUiOnion from './vue-ui-onion.vue'

describe('<VueUiOnion />', () => {
  beforeEach(function () {
    cy.fixture('onion.json').as('fixture');
    cy.viewport(400, 550);
  });

  function updateConfigInFixture(modifiedConfig) {
    cy.get('@fixture').then((fixture) => {
      const updatedFixture = { ...fixture, config: modifiedConfig };
      cy.wrap(updatedFixture).as('fixture');
    });
  }

  it('renders with different config attributes', function () {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiOnion, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      cy.get(`[data-cy="onion-div-title"]`)
        .should('exist')
        .contains(fixture.config.style.chart.title.text);

      cy.get(`[data-cy="onion-div-subtitle"]`)
        .should('exist')
        .contains(fixture.config.style.chart.title.subtitle.text);

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="onion-div-legend-item-${i}"]`).then(($legend) => {
          cy.wrap($legend)
            .should('exist')
            .find('circle')
            .invoke('attr', 'fill')
            .should('eq', fixture.dataset[i].color)
          cy.wrap($legend)
            .contains(`${fixture.dataset[i].name} : ${fixture.dataset[i].percentage}%`)
        })
      }

      
      cy.get(`[data-cy="onion-summary"]`).click();
      cy.get(`[data-cy="onion-checkbox-title"]`)
      .check();
      cy.get(`[data-cy="onion-summary"]`).click();

      cy.get(`[data-cy="onion-text-title"]`)
        .should('exist')
        .contains(fixture.config.style.chart.title.text);

      cy.get(`[data-cy="onion-text-subtitle"]`)
        .should('exist')
        .contains(fixture.config.style.chart.title.subtitle.text);

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="onion-foreignObject-legend-item-${i}"]`).then(($legend) => {
          cy.wrap($legend)
            .should('exist')
            .find('circle')
            .invoke('attr', 'fill')
            .should('eq', fixture.dataset[i].color);
          cy.wrap($legend)
            .contains(`${fixture.dataset[i].name} : ${fixture.dataset[i].percentage}%`)
          
        })
      }

      cy.get(`[data-cy="onion-summary"]`).click();
      cy.get(`[data-cy="onion-checkbox-title"]`)
      .uncheck();
      cy.get(`[data-cy="onion-checkbox-table"]`).check();
      cy.viewport(400, 680);

      cy.get(`[data-cy="onion-summary"]`).click();

      cy.get(`[data-cy="onion-table-title"]`)
        .should('exist')
        .contains(`${fixture.config.style.chart.title.text} : ${fixture.config.style.chart.title.subtitle.text}`)

      for (let i = 0; i < Object.keys(fixture.config.table.translations).length; i += 1) {
        cy.get(`[data-cy="onion-table-head-col-title-${i}"]`)
          .should('exist')
          .contains(Object.values(fixture.config.table.translations)[i]);
      }

      for (let i = 0; i < fixture.dataset.length; i += 1) {
        cy.get(`[data-cy="onion-table-tr-${i}"]`).then(($tr) => {
          cy.wrap($tr)
            .should('exist')
            .find('td')
            .should('have.length', Object.keys(fixture.config.table.translations).length)
            .each(($td, index) => {
              if (index === 0) {
                cy.wrap($td)
                  .contains(`⬤ ${fixture.dataset[i].name}`)
              }
              if (index === 1) {
                const expectedPercentage = fixture.dataset[i].percentage.toFixed(fixture.config.table.td.roundingPercentage);

                console.log({expectedPercentage})

                cy.wrap($td)
                  .should('contain.text', `${expectedPercentage}%`)
              }
              if (index === 2) {
                cy.wrap($td)
                  .contains(`${fixture.dataset[i].prefix}${fixture.dataset[i].value.toFixed(fixture.config.table.td.roundingValue)}${fixture.dataset[i].suffix}`)
              }
            })
        })
      }

      cy.get(`[data-cy="onion-div-legend-item-0"]`).click();
      cy.get('.vue-ui-onion-path')
        .should('have.length', (fixture.dataset.length - 1) * 2)
      cy.get(`[data-cy="onion-div-legend-item-0"]`).click();
      cy.get('.vue-ui-onion-path')
        .should('have.length', fixture.dataset.length * 2)


      cy.get(`[data-cy="onion-summary"]`).click();

      cy.get(`[data-cy="onion-pdf"]`).click();
      cy.wait(3000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.pdf`);
      cy.get(`[data-cy="onion-xls"]`).click();
      cy.wait(3000);
      cy.readFile(`cypress\\Downloads\\${fixture.config.style.chart.title.text}.xlsx`);
      cy.clearDownloads();
    });
  });
})