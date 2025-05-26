describe('Acceso a tabla de usuarios', () => {
  it('Debería mostrar la tabla de usuarios correctamente', () => {
    const DELAYS = {
      TYPING: 150,
      RECAPTCHA_WAIT: 15000,
      PAGE_LOAD: 3000
    };

    // 1. Visitar login
    cy.visit('https://pasteleria-feliz.web.app/login', {
      timeout: 30000,
      onBeforeLoad(win) {
        win.localStorage.clear();
      }
    });

    // 2. Llenar credenciales
    cy.get('#email')
      .should('be.visible')
      .type('carolina@gmail.com', { delay: DELAYS.TYPING });

    cy.get('#password')
      .should('be.visible')
      .type('123456', { delay: DELAYS.TYPING });

    // 3. Esperar interacción manual con reCAPTCHA
    cy.log('Esperando que el usuario resuelva el reCAPTCHA...');
    cy.wait(DELAYS.RECAPTCHA_WAIT);

    // 4. Click en iniciar sesión
    cy.contains('button', 'Iniciar sesión')
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // 5. Validar redirección a dashboard de administrador
    cy.url({ timeout: 10000 }).should('include', '/administrador');

    cy.wait(500);

    // 6. Interceptar la carga de usuarios antes del clic
    cy.intercept('GET', '**/api/users/**').as('getUsuarios');

    // 7. Click en Gestionar Usuarios
    cy.contains('.card-title', 'Gestionar usuarios', { timeout: 5000 })
      .should('be.visible')
      .parents('.card')
      .find('button')
      .should('contain', 'Gestionar')
      .click({ force: true });

    // 8. Esperar respuesta de la API
    cy.wait('@getUsuarios').its('response.statusCode').should('eq', 200);

    // 9. Verificar encabezado y contenido
    cy.get('.card-header h6', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Usuarios');

    // 10. Verificar tabla y datos
    cy.get('table', { timeout: 15000 })
      .should('exist')
      .and('be.visible');

    cy.get('input[placeholder*="Buscar por nombre"]', { timeout: 8000 })
      .should('be.visible');

    cy.get('table tbody tr', { timeout: 10000 })
      .should('have.length.greaterThan', 0)
      .first()
      .within(() => {
        cy.get('td').eq(1).should('not.be.empty'); // Asegura que al menos hay un nombre
      });
  });
});
