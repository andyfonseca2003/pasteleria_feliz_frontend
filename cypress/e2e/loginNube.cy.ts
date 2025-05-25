describe('Login como Administrador', () => {
  it('Debería redirigir al dashboard de administrador', () => {
    // 1. Visitar la página de login
    cy.visit('https://pasteleria-feliz.web.app', {
      timeout: 30000,
      onBeforeLoad(win) {
        win.localStorage.clear();
      }
    });

    // 2. Verificar página de login
    cy.contains('h5', 'Iniciar sesión en Pasteleria Feliz').should('exist');

    // 3. Llenar credenciales
    cy.get('#email').type('anfoji2003@gmail.com', { delay: 150 });
    cy.get('#password').type('123456', { delay: 150 });
    cy.get('form').should('have.class', 'ng-valid');

    // 4. Interceptar API login
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');

    // 5. Enviar formulario
    cy.get('button[type="submit"]').click();

    // 6. Esperar respuesta
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);

    // 7. Verificar dashboard admin
    cy.url().should('include', '/administrador');
    cy.contains('h1', 'Administrador').should('be.visible');

    // Verificación robusta de tarjetas
    /*cy.get('.card').should('have.length.at.least', 4);
    cy.contains('h5.card-title', 'Gestionar Proveedores').should('be.visible');
    cy.contains('h5.card-title', 'Gestionar suministros').should('be.visible');
    cy.contains('h5.card-title', 'Gestionar de usuarios').should('be.visible');
    cy.contains('h5.card-title', 'Reportes').should('be.visible');

    // 8. Verificar rol
    cy.window().its('localStorage').invoke('getItem', 'userRole')
      .should('eq', 'admin');*/
  });
});
