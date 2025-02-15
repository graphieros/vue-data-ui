import UserOptions from './UserOptions.vue'

describe('<UserOptions />', () => {

  function mount() {
    cy.mount(UserOptions, {
      props: {
        hasTooltip: true,
        hasImg: true,
        hasTable: true,
        hasSort: true,
        hasLabel: true,
        hasStack: true,
        hasSort: true,
        hasFullscreen: true,
        hasAnimation: true,
        hasAnnotator: true
      }
    });
  }

  function open() {
    cy.get(`[data-cy="user-options-summary"]`).click()
    cy.get(`[data-cy="user-options-drawer"]`).should('exist').and('be.visible')
  }
  
  it('opens and closes on menu click', () => {
    mount();
    open();
    cy.get(`[data-cy="user-options-summary"]`).click();
    cy.wait(200 );
    cy.get(`[data-cy="user-options-drawer"]`).should('not.be.visible');
  })

  it('closes the drawer on click outside', () => {
    mount();
    open();
    cy.get('body').click(0,0, { force: true});
    cy.wait(200);
    cy.get(`[data-cy="user-options-drawer"]`).should('not.be.visible');
  })

  it('contains all necessary icons', () => {
    mount();
    open();
    [
      'user-options-tooltip',
      'user-options-pdf',
      'user-options-xls',
      'user-options-img',
      'user-options-table',
      'user-options-label',
      'user-options-sort',
      'user-options-stack',
      'user-options-sort',
      'user-options-fullscreen',
      'user-options-anim',
      'user-options-annotator'
    ].forEach(btn => {
      cy.get(`[data-cy="${btn}"]`).should('exist').and('be.visible');
    })
  })

  it('emits', () => {
    cy.mount(UserOptions, {
      props: {
        hasTooltip: true,
        hasImg: true,
        hasTable: true,
        hasSort: true,
        hasLabel: true,
        hasStack: true,
        hasSort: true,
        hasAnimation: true,
        hasAnnotator: true,
        hasFullscreen: true,
        chartElement: {
          requestFullscreen: () => {},
          exitFullscreen: () => {}
        }
      }
    }).then(({ wrapper }) => {
      open();

      cy.get('[data-cy="user-options-tooltip"]').click().then(() => {
        expect(wrapper.emitted('toggleTooltip')).to.exist
      })
      cy.get('[data-cy="user-options-pdf"]').click().then(() => {
        expect(wrapper.emitted('generatePdf')).to.exist
      })
      cy.get('[data-cy="user-options-xls"]').click().then(() => {
        expect(wrapper.emitted('generateCsv')).to.exist
      })
      cy.get('[data-cy="user-options-img"]').click().then(() => {
        expect(wrapper.emitted('generateImage')).to.exist
      })
      cy.get('[data-cy="user-options-table"]').click().then(() => {
        expect(wrapper.emitted('toggleTable')).to.exist
      })
      cy.get('[data-cy="user-options-label"]').click().then(() => {
        expect(wrapper.emitted('toggleLabels')).to.exist
      })
      cy.get('[data-cy="user-options-sort"]').click().then(() => {
        expect(wrapper.emitted('toggleSort')).to.exist
      })
      cy.get('[data-cy="user-options-stack"]').click().then(() => {
        expect(wrapper.emitted('toggleStack')).to.exist
      })
      cy.get('[data-cy="user-options-fullscreen"]').click().then(() => {
        expect(wrapper.emitted('toggleFullscreen')).to.exist
        expect(wrapper.emitted('toggleFullscreen')[0]).to.deep.equal([true])
      })
      cy.get('[data-cy="user-options-anim"]').click().then(() => {
        expect(wrapper.emitted('toggleAnimation')).to.exist
      })
      cy.get('[data-cy="user-options-annotator"]').click().then(() => {
        expect(wrapper.emitted('toggleAnnotator')).to.exist
      })
    })
  })

  it('displays labels in tooltips', () => {
    cy.viewport(601,500)
    cy.mount(UserOptions, {
      props: {
        hasTooltip: true,
        hasImg: true,
        hasTable: true,
        hasSort: true,
        hasLabel: true,
        hasStack: true,
        hasSort: true,
        hasAnimation: true,
        hasAnnotator: true,
        hasFullscreen: true,
        titles: {
          open: 'open',
          close: 'close',
          tooltip: 'tooltip',
          pdf: 'pdf',
          csv: 'csv',
          img: 'img',
          table: 'table',
          labels: 'labels',
          sort: 'sort',
          stack: 'stack',
          fullscreen: 'fullscreen',
          animation: 'animation',
          annotator: 'annotator'
        }
      }
    }).then(() => {
      open()
      cy.get('[data-cy="user-options-tooltip"]').trigger('mouseenter').then(() => {
        cy.get('[data-cy="uo-tooltip"]').should('be.visible').and('contain', 'tooltip')
        cy.get('[data-cy="user-options-tooltip"]').trigger('mouseout')
      })
      cy.get('[data-cy="user-options-pdf"]').trigger('mouseenter').then(() => {
        cy.get('[data-cy="uo-tooltip"]').should('be.visible').and('contain', 'pdf')
        cy.get('[data-cy="user-options-pdf"]').trigger('mouseout')
      })
      cy.get('[data-cy="user-options-xls"]').trigger('mouseenter').then(() => {
        cy.get('[data-cy="uo-tooltip"]').should('be.visible').and('contain', 'csv')
        cy.get('[data-cy="user-options-xls"]').trigger('mouseout')
      })
      cy.get('[data-cy="user-options-img"]').trigger('mouseenter').then(() => {
        cy.get('[data-cy="uo-tooltip"]').should('be.visible').and('contain', 'img')
        cy.get('[data-cy="user-options-img"]').trigger('mouseout')
      })
      cy.get('[data-cy="user-options-table"]').trigger('mouseenter').then(() => {
        cy.get('[data-cy="uo-tooltip"]').should('be.visible').and('contain', 'table')
        cy.get('[data-cy="user-options-table"]').trigger('mouseout')
      })
      cy.get('[data-cy="user-options-label"]').trigger('mouseenter').then(() => {
        cy.get('[data-cy="uo-tooltip"]').should('be.visible').and('contain', 'labels')
        cy.get('[data-cy="user-options-label"]').trigger('mouseout')
      })
      cy.get('[data-cy="user-options-sort"]').trigger('mouseenter').then(() => {
        cy.get('[data-cy="uo-tooltip"]').should('be.visible').and('contain', 'sort')
        cy.get('[data-cy="user-options-sort"]').trigger('mouseout')
      })
      cy.get('[data-cy="user-options-stack"]').trigger('mouseenter').then(() => {
        cy.get('[data-cy="uo-tooltip"]').should('be.visible').and('contain', 'stack')
        cy.get('[data-cy="user-options-stack"]').trigger('mouseout')
      })
      cy.get('[data-cy="user-options-fullscreen"]').trigger('mouseenter').then(() => {
        cy.get('[data-cy="uo-tooltip"]').should('be.visible').and('contain', 'fullscreen')
        cy.get('[data-cy="user-options-fullscreen"]').trigger('mouseout')
      })
      cy.get('[data-cy="user-options-anim"]').trigger('mouseenter').then(() => {
        cy.get('[data-cy="uo-tooltip"]').should('be.visible').and('contain', 'animation')
        cy.get('[data-cy="user-options-anim"]').trigger('mouseout')
      })
      cy.get('[data-cy="user-options-annotator"]').trigger('mouseenter').then(() => {
        cy.get('[data-cy="uo-tooltip"]').should('be.visible').and('contain', 'annotator')
        cy.get('[data-cy="user-options-annotator"]').trigger('mouseout')
      })
    })
  })
})