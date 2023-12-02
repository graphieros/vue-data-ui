import VueUiXy from './vue-ui-xy.vue'

describe('<VueUiXy />', () => {

  beforeEach(function() {
    cy.fixture('xy.json').as('fixture');
    cy.viewport(1200, 850);
  });

  function updateConfigInFixture(modifiedConfig) {
    cy.get('@fixture').then((fixture) => {
      const updatedFixture = { ...fixture, config: modifiedConfig };
      cy.wrap(updatedFixture).as('fixture');
    });
  }

  it('renders with different config attributes', function() {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiXy, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      cy.get('[data-cy="xy-svg"]').should('exist');
      cy.get('[data-cy="xy-grid-line-x"]').should('exist');
      cy.get('[data-cy="xy-grid-line-y"]').should('exist');

      let modifiedConfig = {
        ...fixture.config,
        chart: {
          ...fixture.config.chart,
          grid: {
            ...fixture.config.chart.grid,
            showVerticalLines: true
          }
        }
      }

      updateConfigInFixture(modifiedConfig);

      cy.mount(VueUiXy, {
        props: {
          dataset: fixture.dataset,
          config: modifiedConfig
        }
      });

      cy.get('[data-cy="xy-grid-vertical-lines"]').should('exist');

      for(let i = 0; i < 22; i += 1) {
        cy.get(`[data-cy="xy-grid-vertical-line-${i}"]`).should('exist');
      }

      for(let i = 0; i < 2; i += 1) {
        cy.get(`[data-cy="xy-def-bar-${i}"]`).should('exist');
        cy.get(`[data-cy="xy-def-line-${i}"]`).should('exist');
    
        for(let k = 0; k < 21; k += 1) {
          cy.get(`[data-cy="xy-bar-${i}-${k}"]`).should('exist')
        }
      }

      cy.get(`[data-cy="xy-def-plot-0"]`).should('exist');
      
      cy.get(`[data-cy="xy-bar-progression-1"]`).should('exist');
      cy.get(`[data-cy="xy-bar-progression-label-1"]`).should('contain', '-91.67%');

      cy.get(`[data-cy="xy-plot-progression-0"]`).should('exist');
      cy.get(`[data-cy="xy-plot-progression-label-0"]`).should('contain', '100.00%');

      for(let i = 0; i < 10; i += 1) {
        cy.get(`[data-cy="xy-plot-0-${i}"]`).should('exist');
      }

      cy.get(`[data-cy="xy-line-area-0"]`).should('exist');
      cy.get(`[data-cy="xy-line-area-path-0"]`).should('exist');

      for(let i = 0; i < 20; i += 1) {
        cy.get(`[data-cy="xy-line-segment-1-${i}"]`).should("exist");
      }

      for(let i = 0; i < 2; i += 1) {
        for(let j = 0; j < 20; j += 1) {
          cy.get(`[data-cy="xy-line-plot-${i}-${j}"]`).should("exist");
        }
      }

      cy.get(`[data-cy="xy-line-progression-0"]`).should("exist");
      cy.get(`[data-cy="xy-line-progression-label-0"]`).should("exist");
      cy.get(`[data-cy="xy-line-progression-label-0"]`).should("contain", "38.46%");

      for(let i = 0; i < 21; i += 1) {
        cy.get(`[data-cy="xy-bar-label-x-0-${i}"]`).should('exist');
      }

      for(let i = 0; i < 10; i += 1) {
        cy.get(`[data-cy="xy-plot-label-x-0-${i}"]`).should('exist');
      }

      cy.get(`[data-cy="xy-plot-tag-start-0"]`).should('exist');

      for(let i = 0; i < 2; i += 1) {
        cy.get(`[data-cy="xy-line-tag-end-${i}"]`).should('exist')
      }

      for(let i = 0; i < 11; i += 1) {
        cy.get(`[data-cy="xy-label-y-${i}"]`).should('exist');
      }

      cy.get('[data-cy="xy-axis-xLabel"]').should('exist');
      cy.get('[data-cy="xy-axis-yLabel"]').should('exist');

      cy.get('[data-cy="xy-div-title"]')
        .should('exist')
        .contains('Title');
      cy.get('[data-cy="xy-div-subtitle"]')
        .should('exist')
        .contains('Subtitle');

      cy.get('[data-cy="xy-div-legend"]').should('exist');

      for (let i = 0; i < 4; i += 1) {
        cy.get(`[data-cy="xy-div-legend-item-${i}"]`).should('exist');
      }

        modifiedConfig = {
          ...fixture.config,
          chart: {
            ...fixture.config.chart,
            title: {
              ...fixture.config.chart.title,
              useDiv: false,
            },
            legend: {
              ...fixture.config.legend,
              useDiv: false
            }
          }
        }
  
        updateConfigInFixture(modifiedConfig);
  
        cy.mount(VueUiXy, {
          props: {
            dataset: fixture.dataset,
            config: modifiedConfig
          }
        });

      cy.get('[data-cy="xy-foreignObject-title"]')
        .should('exist')
        .contains('Title');
      cy.get('[data-cy="xy-foreignObject-subtitle"]')
        .should('exist')
        .contains('Subtitle');

      cy.get('[data-cy="xy-foreignObject-legend"]').should('exist');

      for (let i = 0; i < 4; i += 1) {
        cy.get(`[data-cy="xy-foreignObject-legend-item-${i}"]`).should('exist');
      }

      for(let i = 0; i < 21; i += 1) {
        cy.get(`[data-cy="xy-time-label-${i}"]`)
          .should('exist')
          .contains(String(i))
      }

      cy.get(`[data-cy="xy-tooltip-trap-0"]`).trigger("mouseenter");
      cy.get(`[data-cy="xy-tooltip"]`).should('exist');
      cy.get(`[data-cy="xy-tooltip-trap-0"]`).trigger("mouseleave");
      cy.get(`[data-cy="xy-tooltip"]`).should('not.exist');
      cy.get(`[data-cy="xy-tooltip-trap-6"]`).trigger("mouseenter");
      cy.get(`[data-cy="xy-tooltip"]`).should('exist');
      cy.get(`[data-cy="xy-tooltip-trap-6"]`).trigger("mouseleave");

      cy.get(`[data-cy="user-options-summary"]`).click({force:true});

      cy.get(`[data-cy="user-options-pdf"]`).click();
      cy.wait(5000);
      cy.readFile('cypress\\Downloads\\Title.pdf');

      cy.get(`[data-cy="user-options-xls"]`).click();
      cy.wait(3000);
      cy.readFile('cypress\\Downloads\\Title.xlsx');

      cy.clearDownloads();

    });
  });
});
