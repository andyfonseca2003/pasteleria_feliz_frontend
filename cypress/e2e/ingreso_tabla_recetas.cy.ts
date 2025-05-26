describe('Acceso a tabla de recetas', () => {
  it('Debería mostrar la tabla correctamente', () => {
    const DELAYS = {
      TYPING: 150,
      RECAPTCHA_WAIT: 15000
    };

    // 1. Ir al login
    cy.visit('https://pasteleria-feliz.web.app/login', {
      timeout: 30000,
      onBeforeLoad(win) {
        win.localStorage.clear();
      }
    });

    // 2. Credenciales
    cy.get('#email')
      .should('be.visible')
      .type('anfoji2003@gmail.com', { delay: DELAYS.TYPING });

    cy.get('#password')
      .should('be.visible')
      .type('123456', { delay: DELAYS.TYPING });

    // 3. Esperar reCAPTCHA manual
    cy.log('Esperando para resolver manualmente el reCAPTCHA...');
    cy.wait(DELAYS.RECAPTCHA_WAIT);

    // 4. Iniciar sesión
    cy.contains('button', 'Iniciar sesión')
      .should('be.visible')
      .and('not.be.disabled')
      .click();

    // 5. Esperar redirección al dashboard
    cy.url({ timeout: 10000 }).should('include', '/administrador');

    // 6. Interceptar petición de recetas
    cy.intercept('GET', '**/api/recipes/**').as('getRecetas');

    // 7. Hacer clic en "Gestionar recetas"
    cy.contains('.card-title', 'Gestionar recetas', { timeout: 5000 })
      .should('be.visible')
      .parents('.card')
      .find('button')
      .should('contain', 'Gestionar')
      .click({ force: true });

    // 8. Esperar la respuesta del servidor
    cy.wait('@getRecetas').its('response.statusCode').should('eq', 200);

    // 9. Verificar que se cargó la tabla
    cy.get('.card-header h6', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Recetas');

    cy.get('input[placeholder*="Buscar por nombre"]', { timeout: 8000 })
      .should('be.visible');

    cy.get('table', { timeout: 10000 })
      .should('exist')
      .and('be.visible');

    // 10. Validar contenido de la tabla
    cy.get('table tbody tr', { timeout: 10000 })
      .should('have.length.greaterThan', 0)
      .first()
      .within(() => {
        cy.get('td').eq(1).should('not.be.empty');  // Ajusta el índice si es necesario
      });
  });
});
