describe('Login fallido como Administrador por contraseña incorrecta', () => {
  it('C4 - Login fallido con contraseña incorrecta y reCAPTCHA manual', () => {
    const DELAYS = {
      TYPING: 150,
      AFTER_ACTION: 1000,
      RECAPTCHA_WAIT: 15000,  // Tiempo para resolver manualmente el reCAPTCHA
    };

    cy.visit('https://pasteleria-feliz.web.app/login', {
      onBeforeLoad(win) {
        win.localStorage.clear(); // Limpia almacenamiento local
      }
    });

    cy.get('#email')
      .should('be.visible')
      .type('anfoji2003@gmail.com', { delay: DELAYS.TYPING });

    cy.get('#password')
      .should('be.visible')
      .type('contraseña_incorrecta', { delay: DELAYS.TYPING });

    cy.log('Esperando para resolver manualmente el reCAPTCHA...');
    cy.wait(DELAYS.RECAPTCHA_WAIT);  // Espera a que el usuario lo resuelva

    cy.contains('button', 'Iniciar sesión')
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // Esperar respuesta y verificar mensaje de error
    cy.wait(DELAYS.AFTER_ACTION);

    // Verifica que se muestra una alerta de error (ajusta el selector según tu implementación)
    cy.contains(/correo o contraseña.*incorrecto/i)
      .should('be.visible');

    // También puedes verificar que no redirige al dashboard
    cy.url().should('not.include', '/administrador');
  });
});
