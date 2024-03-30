import { createApp } from 'vue';
import VueUiScreenshot from './vue-ui-screenshot.vue'

describe('<VueUiScreenshot />', () => {

  function redraw() {
    cy.mount(VueUiScreenshot).then((comp) => {
      const { wrapper } = comp;
      wrapper.componentVM.shoot();
    })
  }

  it('renders', () => {
    cy.document().then((doc) => {
      const div = doc.createElement('div');
      div.style.height="400px";
      div.style.width = "400px";
      div.style.background="rgba(0,0,0,0.3)";
      doc.body.appendChild(div)

      const app = createApp(VueUiScreenshot);

      app.mount(div);
      redraw();
      const text = doc.createElement('div');
      text.innerHTML = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque vel urna luctus, cursus sapien at, ultrices lectus. Nunc id maximus turpis. Nullam turpis ipsum, fermentum quis erat sed, consectetur ultrices nunc. Nunc sed nisl sit amet dui eleifend blandit vitae a purus. Praesent congue rutrum viverra. Donec sit amet est consectetur, condimentum ipsum nec, egestas magna. Etiam at mi a mauris laoreet consequat quis sit amet leo. Phasellus id consequat nunc. Phasellus odio sapien, mollis sit amet nisi at, euismod bibendum ipsum. Quisque viverra vel nisi at venenatis.

      Maecenas nulla massa, aliquet vitae posuere eu, pellentesque ac tortor. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nam eget quam porta, pretium odio vitae, egestas purus. In hac habitasse platea dictumst. Fusce dignissim urna a lacus sagittis, a ullamcorper dolor facilisis. Sed nec mattis eros. Nullam a euismod sapien. Donec viverra lacus porta dui euismod porttitor.
      
      Maecenas mollis dictum turpis. In porttitor magna in ante euismod, eu feugiat ex ullamcorper. Proin semper bibendum nisl, a sagittis dui pellentesque at. Maecenas vitae ligula cursus, fermentum sem id, finibus dolor. Etiam luctus augue nec pharetra elementum. Donec id odio ut risus fringilla hendrerit non sit amet tortor. Donec.`;
      div.appendChild(text);

      cy.get(`[data-cy="screenshot-info-text"]`).then(($info) => {
        cy.wrap($info).should('exist').contains('Resize or move and click to capture')
      })
      
      cy.get(`[data-cy="screenshot-overlay"]`).should('exist').trigger('mousedown').trigger('mousemove', {clientX: 100, clientY: 100})

      cy.get(`[data-cy="screenshot-handle-nw"]`).should('exist')
      cy.get(`[data-cy="screenshot-handle-ne"]`).should('exist')
      cy.get(`[data-cy="screenshot-handle-sw"]`).should('exist')
      cy.get(`[data-cy="screenshot-handle-se"]`).should('exist')

      // cy.get(`[data-cy="screenshot-save-button"]`).should('exist').contains('capture').click()
      // cy.readFile(`cypress\\Downloads\\screenshot.png`);
      // cy.get(`[data-cy="screenshot-overlay"]`).should('not.exist')
      // redraw();
      // cy.get(`[data-cy="screenshot-close-button"]`).should('exist').click();
      // cy.get(`[data-cy="screenshot-overlay"]`).should('not.exist')
      // redraw();
      // cy.clearDownloads();
  });

  })
})