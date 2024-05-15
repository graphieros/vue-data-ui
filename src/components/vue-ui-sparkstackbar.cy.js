import VueUiSparkStackbar from './vue-ui-sparkstackbar.vue'

describe('<VueUiSparkStackbar />', () => {

  beforeEach(function () {
    cy.fixture('sparkstackbar.json').as('fixture');
    cy.viewport(500, 100);
  });

  function updateConfigInFixture(modifiedConfig) {
    cy.get('@fixture').then((fixture) => {
      const updatedFixture = { ...fixture, config: modifiedConfig };
      cy.wrap(updatedFixture).as('fixture');
    });
  }

  it('renders', () => {
    cy.get('@fixture').then((fixture) => {
      cy.mount(VueUiSparkStackbar, {
        props: {
          dataset: fixture.dataset,
          config: fixture.config
        }
      });

      cy.get(`[data-cy="sparkstackbar-title"]`)
        .should('exist')
        .contains(fixture.config.style.title.text);

      cy.get(`[data-cy="sparkstackbar-subtitle"]`)
        .should('exist')
        .contains(fixture.config.style.title.subtitle.text);

      cy.get(`[data-cy="sparkstackbar-title-wrapper"]`)
        .should('exist')
        .should('have.css', 'text-align')
        .should('include', fixture.config.style.title.textAlign)

      let modifiedConfig = {
        ...fixture.config,
        style: {
          ...fixture.config.style,
          title: {
            ...fixture.config.style.title,
            textAlign: 'center'
          }
        }
      }

      updateConfigInFixture(modifiedConfig);

      cy.mount(VueUiSparkStackbar, {
        props: {
          dataset: fixture.dataset,
          config: modifiedConfig
        }
      });

      cy.get(`[data-cy="sparkstackbar-title-wrapper"]`)
        .should('have.css', 'text-align')
        .should('include', 'center')

      modifiedConfig = {
        ...fixture.config,
        style: {
          ...fixture.config.style,
          title: {
            ...fixture.config.style.title,
            textAlign: 'left'
          }
        }
      }

      updateConfigInFixture(modifiedConfig);

      cy.mount(VueUiSparkStackbar, {
        props: {
          dataset: fixture.dataset,
          config: modifiedConfig
        }
      });

      cy.get(`[data-cy="sparkstackbar-title-wrapper"]`)
        .should('have.css', 'text-align')
        .should('include', 'left');

      cy.get(`[data-cy="sparkstackbar-legend"]`)
        .should('exist')
        .should('have.css', 'justify-content')
        .should('include', 'flex-end');

      modifiedConfig = {
        ...fixture.config,
        style: {
          ...fixture.config.style,
          legend: {
            ...fixture.config.style.legend,
            textAlign: 'center'
          }
        }
      }

      updateConfigInFixture(modifiedConfig);

      cy.mount(VueUiSparkStackbar, {
        props: {
          dataset: fixture.dataset,
          config: modifiedConfig
        }
      });

      cy.get(`[data-cy="sparkstackbar-legend"]`)
        .should('have.css', 'justify-content')
        .should('include', 'center');

      modifiedConfig = {
        ...fixture.config,
        style: {
          ...fixture.config.style,
          legend: {
            ...fixture.config.style.legend,
            textAlign: 'left'
          }
        }
      }

      updateConfigInFixture(modifiedConfig);

      cy.mount(VueUiSparkStackbar, {
        props: {
          dataset: fixture.dataset,
          config: modifiedConfig
        }
      });

      cy.get(`[data-cy="sparkstackbar-legend"]`)
        .should('have.css', 'justify-content')
        .should('include', 'flex-start');
    });
  })
})