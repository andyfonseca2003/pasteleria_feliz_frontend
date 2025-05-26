describe('Acceso a Tabla de Proveedores', () => {
  it('Debería navegar correctamente a la tabla de proveedores', () => {
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
    cy.intercept('GET', '**/api/suppliers/**').as('getSuppliers');

    // 6. Navegar a proveedores
    cy.contains('.card-title', 'Gestionar Proveedores')
      .should('be.visible')
      .parents('.card')
      .find('button')
      .should('contain', 'Gestionar')
      .click();

    // 7. Interceptar y esperar carga de proveedores
    cy.wait('@getSuppliers').its('response.statusCode').should('eq', 200);


    // 8. Verificaciones de la tabla
    cy.get('.card-header h6.text-white', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Proveedores');

    cy.get('input[placeholder*="Buscar por nombre"]', { timeout: 8000 })
      .should('be.visible');

    // 9. Verificar datos en tabla
    cy.get('table tbody tr', { timeout: 10000 })
      .should('have.length.greaterThan', 0);
  });
});
