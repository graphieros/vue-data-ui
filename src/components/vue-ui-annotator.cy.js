import VueUiAnnotator from './vue-ui-annotator.vue';

describe('<VueUiAnnotator />', () => {
  beforeEach(function () {
    cy.viewport(1000, 1100);
  });


  it('renders with different config attributes', function () {
    cy.mount(VueUiAnnotator, {
      slots: {
        default: `<div style="margin: 0 auto;width:900px;height:900px;border:1px solid blue"></div>`
      }
    });

    cy.get(`[data-cy="accordion-summary"]`).click();

    cy.get(`[data-cy="annotator-button-circle"]`).click();

    function undo(times = 1) {
      for (let i = 0; i < times; i += 1) {
        cy.get(`[data-cy="annotator-button-undo"]`).click();
      }
    }

    cy.get('#annotatorSvg').then(($svg) => {
      cy.wrap($svg)
        .trigger('pointermove', { clientX: 500, clientY: 500 })
        .trigger('pointerdown')
        .trigger('pointermove', { clientX: 600, clientY: 600 })
        .wait(200)
        .trigger('pointerup', { force: true })
        .find('circle')
        .should('have.length', 2);

      cy.get(`[data-cy="annotator-button-rect"]`).click();

      cy.wrap($svg)
        .trigger('pointermove', { clientX: 450, clientY: 450 })
        .trigger('pointerdown')
        .trigger('pointermove', { clientX: 550, clientY: 550 })
        .wait(200)
        .trigger('pointerup', { force: true })
        .find('rect')
        .should('have.length', 5);

      cy.get(`[data-cy="annotator-button-arrow"]`).click();

      cy.wrap($svg)
        .trigger('pointermove', { clientX: 400, clientY: 700 })
        .trigger('pointerdown')
        .trigger('pointermove', { clientX: 600, clientY: 700 })
        .wait(200)
        .trigger('pointerup', { force: true })
        .find('path')
        .should('have.length', 1)

      undo();

      cy.get(`[data-cy="annotator-button-freehand"]`).click();
      cy.wrap($svg)
        .trigger('pointermove', { clientX: 400, clientY: 700 })
        .trigger('pointerdown')
        .trigger('pointermove', { clientX: 420, clientY: 680 })
        .wait(10)
        .trigger('pointermove', { clientX: 440, clientY: 720 })
        .trigger('pointermove', { clientX: 460, clientY: 680 })
        .trigger('pointermove', { clientX: 480, clientY: 720 })
        .trigger('pointermove', { clientX: 500, clientY: 680 })
        .trigger('pointermove', { clientX: 520, clientY: 720 })
        .trigger('pointermove', { clientX: 540, clientY: 680 })
        .trigger('pointermove', { clientX: 560, clientY: 720 })
        .trigger('pointermove', { clientX: 580, clientY: 680 })
        .trigger('pointermove', { clientX: 600, clientY: 720 })
        .trigger('pointermove', { clientX: 620, clientY: 680 })
        .trigger('pointerup', { force: true })
        .find('path')
        .should('have.length', 1);

      undo(2);
      cy.get(`[data-cy="annotator-button-move"]`).click();

      cy.wrap($svg)
        .trigger('pointermove', { clientX: 500, clientY: 500 })
        .trigger('pointerdown')
        .trigger('pointermove', { clientX: 600, clientY: 600 })
        .wait(200)
        .trigger('pointerup', { force: true })
        .find('circle')
        .should('have.length', 2);

      undo();

      cy.get(`[data-cy="annotator-button-text"]`).click();

      cy.wrap($svg)
        .trigger('pointermove', { clientX: 400, clientY: 700 })
        .click()
        .type('HELLO WORLD')
        .find('text')
        .should('exist')
        .contains('HELLO WORLD')
      undo();
    })
  })
})