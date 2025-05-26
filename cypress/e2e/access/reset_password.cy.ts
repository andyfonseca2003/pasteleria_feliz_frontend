describe('Cambio de clave', () => {
  it('Debería mostrar la alerta del correo', () => {
    const DELAYS = {
      TYPING: 150,
      RECAPTCHA_WAIT: 15000,
      PAGE_LOAD: 3000
    };
    cy.visit('https://pasteleria-feliz.web.app/login', {
      onBeforeLoad(win) {
        win.localStorage.clear(); // Limpia el almacenamiento local
      }
    });

    cy.get('.card-link').click();

    cy.get('#email')
      .should('be.visible')
      .type('anfoji2003@gmail.com', { delay: DELAYS.TYPING });

    cy.contains('button', 'Recuperar contraseña')
      .should('be.visible')
      .and('not.be.disabled')
      .click();

      cy.get(':nth-child(2) > .btn').should('be.visible');


  });

})