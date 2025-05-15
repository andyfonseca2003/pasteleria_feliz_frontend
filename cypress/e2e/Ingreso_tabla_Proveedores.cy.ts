describe('Acceso a Tabla de Proveedores', () => {
  it('Debería navegar correctamente a la tabla de proveedores', () => {
    // 1. Visitar la página de login
    cy.visit('https://pasteleria-feliz.web.app/login', {
      timeout: 30000,
      onBeforeLoad(win) {
        win.localStorage.clear();
      }
    });

    // 2. Llenar credenciales con delay
    cy.get('#email').type('anfoji2003@gmail.com', { delay: 150 });
    cy.get('#password').type('123456', { delay: 150 });

    // 3. Interceptar API login
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');

    // 4. Enviar formulario
    cy.get('button[type="submit"]').click();

    // 5. Esperar respuesta login
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);
    cy.url().should('include', '/administrador');

    // Pequeña pausa para visualización
    cy.wait(500);

    // 6. Navegar a proveedores
    cy.contains('.card-title', 'Gestionar Proveedores')
      .should('be.visible')
      .parents('.card')
      .find('button')
      .should('contain', 'Gestionar')
      .click();

    // 7. Interceptar y esperar carga de proveedores
    cy.intercept('GET', '**/api/suppliers/**').as('getSuppliers');
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
