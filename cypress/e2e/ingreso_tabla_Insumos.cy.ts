describe('Acceso a tabla de insumos', () => {
  it('Debería mostrar la tabla correctamente', () => {
    // Configuración de tiempos
    const delays = {
      typing: 150,  // ms entre caracteres al escribir
      afterAction: 500,  // ms después de acciones importantes
      loading: 1000  // ms para carga de elementos
    };

    // 1. Interceptar login
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');

    // 2. Visitar página de login con limpieza de estado
    cy.visit('https://pasteleria-feliz.web.app/login', {
      onBeforeLoad(win) {
        win.localStorage.clear();
      },
      timeout: 30000
    });

    // 3. Login con delays
    cy.get('#email').type('anfoji2003@gmail.com', { delay: delays.typing });
    cy.wait(delays.afterAction);
    cy.get('#password').type('123456', { delay: delays.typing });
    cy.wait(delays.afterAction);
    cy.get('button[type="submit"]').click();

    // 4. Esperar login
    cy.wait('@loginRequest', { timeout: 10000 }).its('response.statusCode').should('eq', 200);
    cy.wait(delays.loading);

    // 5. Verificar dashboard
    cy.url({ timeout: 8000 }).should('include', '/administrador');
    cy.contains('h1', 'Administrador', { timeout: 5000 }).should('be.visible');
    cy.wait(delays.afterAction);

    // 6. Navegar a insumos con verificación visual
    cy.contains('.card-title', 'Gestionar suministros', { timeout: 5000 })
      .should('be.visible')
      .parents('.card')
      .find('button')
      .should('contain', 'Gestionar')
      .click({ force: true });

    cy.wait(delays.loading * 2); // Espera adicional para transición

    // 7. Verificar URL CORREGIDA (según lo que muestra realmente la app)
    cy.url({ timeout: 10000 }).should('include', '/listar-insumos'); // Cambiado a /listar-insumos

    // 8. Verificar carga de tabla
    cy.get('.card-header h6', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Insumos');

    cy.wait(delays.afterAction);

    // 9. Verificación progresiva de tabla
    cy.get('table', { timeout: 15000 })
      .should('exist')
      .and('be.visible');

    cy.wait(delays.loading);

    // 10. Verificar datos (con espera implícita)
    cy.get('table tbody tr', { timeout: 10000 })
      .should('have.length.greaterThan', 0)
      .first()
      .within(() => {
        cy.get('td').eq(1).should('not.be.empty');
      });
  });
});
