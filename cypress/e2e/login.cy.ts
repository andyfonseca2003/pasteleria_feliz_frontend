describe('Login como Administrador', () => {
  it('C3 - Login exitoso con email, contraseña y reCAPTCHA manual', () => {
    const DELAYS = {
      TYPING: 150,
      AFTER_ACTION: 1000,
      RECAPTCHA_WAIT: 15000,  // 15 segundos para que el usuario haga clic en el reCAPTCHA
      PAGE_LOAD: 3000
    };

    cy.visit('https://pasteleria-feliz.web.app/login', {
      onBeforeLoad(win) {
        win.localStorage.clear(); // Limpia el almacenamiento local
      }
    });

    cy.get('#email')
      .should('be.visible')
      .type('anfoji2003@gmail.com', { delay: DELAYS.TYPING });

    cy.get('#password')
      .should('be.visible')
      .type('123456', { delay: DELAYS.TYPING });

    // Pausa o espera para permitir que el usuario haga clic manualmente en el reCAPTCHA
    cy.log('Esperando para resolver manualmente el reCAPTCHA...');
    cy.wait(DELAYS.RECAPTCHA_WAIT);  // Espera 15 segundos

    // Verifica que el botón esté habilitado y hacer clic
    cy.contains('button', 'Iniciar sesión')
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // Validar que haya sido redirigido al dashboard
    cy.url({ timeout: 10000 }).should('include', '/administrador');
  });
});