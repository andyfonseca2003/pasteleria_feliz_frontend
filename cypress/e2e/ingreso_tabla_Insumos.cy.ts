describe('Acceso a tabla de insumos', () => {
  it('Debería mostrar la tabla correctamente', () => {
    const DELAYS = {
      TYPING: 150,
      AFTER_ACTION: 1000,
      RECAPTCHA_WAIT: 15000,  // 15 segundos para que el usuario haga clic en el reCAPTCHA
      PAGE_LOAD: 3000
    };
    // 1. Visitar la página de login
    cy.visit('https://pasteleria-feliz.web.app/login', {
      timeout: 30000,
      onBeforeLoad(win) {
        win.localStorage.clear();
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

    // Pequeña pausa para visualización
    cy.wait(500);

    // INTERCEPTAR ANTES DEL CLIC
    cy.intercept('GET', '**/api/insumos/**').as('getInsumos');

    // 6. Navegar a insumos con verificación visual
    cy.contains('.card-title', 'Gestionar suministros', { timeout: 5000 })
      .should('be.visible')
      .parents('.card')
      .find('button')
      .should('contain', 'Gestionar')
      .click({ force: true });
    // 7. Interceptar y esperar carga de proveedores
    cy.wait('@getInsumos').its('response.statusCode').should('eq', 200);

    // 8. Verificar carga de tabla
    cy.get('.card-header h6', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Insumos');

    // 9. Verificación progresiva de tabla
    cy.get('table', { timeout: 15000 })
      .should('exist')
      .and('be.visible');

    cy.get('input[placeholder*="Buscar por nombre"]', { timeout: 8000 })
      .should('be.visible');

    // 10. Verificar datos (con espera implícita)
    cy.get('table tbody tr', { timeout: 10000 })
      .should('have.length.greaterThan', 0)
      .first()
      .within(() => {
        cy.get('td').eq(1).should('not.be.empty');
      });
  });
});
