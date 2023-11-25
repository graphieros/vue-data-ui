import VueUiSkeleton from './vue-ui-skeleton.vue'

describe('<VueUiSkeleton />', () => {

  function updateConfigInFixture(modifiedConfig) {
    cy.get('@fixture').then((fixture) => {
      const updatedFixture = { ...fixture, config: modifiedConfig };
      cy.wrap(updatedFixture).as('fixture');
    });
  }

  beforeEach(function () {
    cy.fixture('skeleton.json').as('fixture');
    cy.viewport(500, 360);
  });

  it('renders', () => {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiSkeleton, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      [
        {
          type: 'pyramid',
          height: 400
        },
        {
          type: 'sparkline',
          height: 120
        },
        {
          type: 'candlesticks',
          height: 330
        },
        {
          type: 'heatmap',
          height: 150
        },
        {
          type: 'chestnut',
          height: 320
        },
        {
          type: 'line',
          height: 360
        },
        {
          type: 'bar',
          height: 360
        },
        {
          type: 'donut',
          height: 500
        },
        {
          type: 'onion',
          height: 500
        },
        {
          type: 'gauge',
          height: 500
        },
        {
          type: 'quadrant',
          height: 500
        },
        {
          type: 'radar',
          height: 500
        },
        {
          type: 'waffle',
          height: 500
        },
        {
          type: 'table',
          height: 360
        },
        {
          type: 'rating',
          height: 80
        },
        {
          type: 'verticalBar',
          height: 500
        },
      ].forEach(t => {
        cy.wait(300);

        let modifiedConfig = {
          ...fixture.config,
          type: t.type
        }
  
        updateConfigInFixture(modifiedConfig);
  
        cy.mount(VueUiSkeleton, {
          props: {
            dataset: fixture.dataset,
            config: modifiedConfig
          }
        });
        
        cy.viewport(500, t.height);

        cy.get(`[data-cy="skeleton-${t.type}"]`)
          .should('exist');

      });
    });
  })
})