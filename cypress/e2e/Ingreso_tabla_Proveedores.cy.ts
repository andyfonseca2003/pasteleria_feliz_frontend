describe('Acceso a Tabla de Proveedores', () => {
  it('Debería navegar correctamente a la tabla de proveedores', () => {
    // 1. Interceptar las llamadas API importantes
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');
    cy.intercept('GET', '**/api/suppliers/**').as('getSuppliers');

    // 2. Login
    cy.visit('https://pasteleria-feliz.web.app/login');
    cy.get('#email').type('anfoji2003@gmail.com');
    cy.get('#password').type('123456');
    cy.get('button[type="submit"]').click();

    // 3. Esperar a que el login se complete
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);

    // 4. Verificar redirección al dashboard
    cy.url().should('include', '/administrador');
    cy.contains('h1', 'Administrador').should('be.visible');

    // 5. Navegar a proveedores - Versión más robusta
    cy.contains('.card-title', 'Gestionar Proveedores')
      .should('be.visible')
      .parents('.card')
      .find('button')
      .should('contain', 'Gestionar')
      .click();

    // 6. Esperar a que cargue la tabla
    cy.wait('@getSuppliers').its('response.statusCode').should('eq', 200);
    cy.url().should('include', '/listar-suppliers');

    // 7. Verificaciones de la tabla - Selectores actualizados
    cy.get('.card-header h6.text-white', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Proveedores');

    cy.get('input[placeholder*="Buscar por nombre"]', { timeout: 8000 })
      .should('be.visible');

    // 8. Verificar que la tabla tiene datos
    cy.get('table tbody tr', { timeout: 10000 })
      .should('have.length.greaterThan', 0);
  });
});
