import VueUiXy from './vue-ui-xy.vue'

describe('<VueUiXy />', () => {

  beforeEach(function() {
    cy.fixture('xy.json').as('fixture');
    cy.viewport(600, 600);
  });

  function updateConfigInFixture(modifiedConfig) {
    cy.get('@fixture').then((fixture) => {
      const updatedFixture = { ...fixture, config: modifiedConfig };
      cy.wrap(updatedFixture).as('fixture');
    });
  }

  function data(data) {
    return cy.get(`[data-cy="${data}"]`)
  }

  function testUserOptions() {
    data('user-options').should('exist').and('be.visible');
  }
  function testSlicer() {
    data('slicer').should('exist').and('be.visible');
  }
  function testLegend(content='') {
    data('xy-div-legend').as('legend').should('exist').and('be.visible');
    if (content) {
      cy.get('@legend').contains(content);
    }
  }
  function testAxes() {
    data('xy-grid-line-y').should('exist').and('be.visible');
    data('xy-grid-line-x').should('exist').and('be.visible');
  }
  function testTooltipTraps(n) {
    for (let i = 0; i < n; i += 1) {
      data(`xy-tooltip-trap-${i}`).should('exist').and('be.visible');
    }
  }

  it('renders a line chart with default config', () => {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiXy, {
        props: {
          dataset: fixture.dataset_single_line
        }
      });

      testUserOptions();
      testSlicer();
      testLegend(fixture.dataset_single_line[0].name);
      testAxes();
      testTooltipTraps(fixture.dataset_single_line[0].series.length)

      cy.log('--- Y AXIS TICKS ---');
      const yLabels = [0, 10, 20, 30, 40, 55];
      for (let i = 0; i < yLabels.length; i += 1) {
        data(`xy-label-y-${i}`).should('exist').and('be.visible').contains(yLabels[i]);
        data(`xy-label-y-tick-${i}`).should('exist').and('be.visible');
        data(`xy-plot-0-${i}`).should('exist').and('be.visible');
      }

      cy.log('--- LINE ---');
      data(`xy-line-path-0`).should('exist')

      cy.log('--- SMOOTH LINE ---');
      const modifiedDataset = [
        {
          ...fixture.dataset_single_line[0],
          smooth: true
        }
      ];
      cy.mount(VueUiXy, {
        props: {
          dataset: modifiedDataset
        }
      });
      data('xy-line-area-path-0').should('exist').and('be.visible');

      cy.log('--- TOOLTIP ---')
      data('xy-tooltip-trap-0').trigger("mouseenter");
      data('tooltip').should('exist');
      data('highlighter-0').should('exist').and('have.attr', 'fill', '#2D353C0D');
    });
  });

  it('renders a bar chart with default config', () => {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiXy, {
        props: {
          dataset: fixture.dataset_single_bar
        }
      });

      testUserOptions();
      testSlicer();
      testLegend(fixture.dataset_single_bar[0].name);
      testAxes();
      testTooltipTraps(fixture.dataset_single_bar[0].series.length)

      cy.log('--- Y AXIS TICKS ---');
      const yLabels = [0, 10, 20, 30, 40, 55];
      for (let i = 0; i < yLabels.length; i += 1) {
        data(`xy-label-y-${i}`).should('exist').and('be.visible').contains(yLabels[i]);
        data(`xy-label-y-tick-${i}`).should('exist').and('be.visible');
      }

      cy.log('--- BARS ---');
      for(let i = 0; i < fixture.dataset_single_line[0].series.length - 1; i += 1) {
        data(`xy-bar-0-${i}`).should('exist');
      }

      cy.log('--- TOOLTIP ---')
      data('xy-tooltip-trap-0').trigger("mouseenter");
      data('tooltip').should('exist');
      data('highlighter-0').should('exist').and('have.attr', 'fill', '#2D353C0D');
    });
  });

  it('renders a plot chart with default config', () => {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiXy, {
        props: {
          dataset: fixture.dataset_single_plot
        }
      });

      testUserOptions();
      testSlicer();
      testLegend(fixture.dataset_single_plot[0].name);
      testAxes();
      testTooltipTraps(fixture.dataset_single_plot[0].series.length)

      cy.log('--- Y AXIS TICKS ---');
      const yLabels = [0, 10, 20, 30, 40, 55];
      for (let i = 0; i < yLabels.length; i += 1) {
        data(`xy-label-y-${i}`).should('exist').and('be.visible').contains(yLabels[i]);
        data(`xy-label-y-tick-${i}`).should('exist').and('be.visible');
      }

      cy.log('--- PLOTS ---');
      for(let i = 0; i < fixture.dataset_single_line[0].series.length - 1; i += 1) {
        data(`xy-plot-0-${i}`).should('exist');
      }

      cy.log('--- TOOLTIP ---')
      data('xy-tooltip-trap-0').trigger("mouseenter");
      data('tooltip').should('exist');
      data('highlighter-0').should('exist').and('have.attr', 'fill', '#2D353C0D');
    });
  });
});
