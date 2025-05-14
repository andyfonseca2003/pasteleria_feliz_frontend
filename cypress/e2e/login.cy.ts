describe('Login como Administrador', () => {
  it('Debería redirigir al dashboard de administrador', () => {
    // 1. Visitar la página de login con configuración reforzada
    cy.visit('http://localhost:4200/login', {
      timeout: 30000,
      onBeforeLoad(win) {
        win.localStorage.clear();
      }
    });

    // 2. Verificación de que estamos en la página correcta
    cy.contains('h5', 'Iniciar sesión en Pasteleria Feliz').should('exist');

    // 3. Llenado de credenciales con selectores robustos
    cy.get('#email')
      .should('be.visible')
      .type('carolina@gmail.com', { delay: 150 });

    cy.get('#password')
      .should('be.visible')
      .type('123456', { delay: 150 });

    // Verificar que el formulario es válido
    cy.get('form').should('have.class', 'ng-valid');

    // 4. Interceptar la llamada API de login
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');

    // 5. Click en el botón con verificación de estado
    cy.get('button[type="submit"]')
      .should('not.be.disabled')
      .click();

    // 6. Esperar y validar la respuesta del servidor
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);

    // 7. Verificaciones específicas para ADMIN
    cy.url().should('include', '/administrador');

    // Validar elementos exclusivos del dashboard de admin
    cy.contains('Administrador').should('be.visible');
    cy.get('.admin-menu').within(() => {
      cy.contains('Gestionar Proveedores').should('exist');
      cy.contains('Gestionar Usuarios').should('exist');
      cy.contains('Reportes').should('exist');
    });

    // 8. Verificar que el usuario actual es admin
    cy.window().its('localStorage').invoke('getItem', 'userRole')
      .should('eq', 'admin');
  });
});
