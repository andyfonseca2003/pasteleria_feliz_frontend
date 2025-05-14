describe('Acceso rápido a tabla de insumos', () => {
  it('Debería mostrar la tabla correctamente', () => {
    // 1. Login directo
    cy.visit('https://pasteleria-feliz.web.app/login');
    cy.get('#email').type('anfoji2003@gmail.com');
    cy.get('#password').type('123456');
    cy.get('button[type="submit"]').click();

    // 2. Navegación a insumos con selector robusto
    cy.contains('.card-title', 'Gestionar suministros')
      .parents('.card')
      .find('button')
      .click();

    // 3. Verificación mínima de la tabla
    cy.get('table', { timeout: 5000 }).should('exist');
  });
});
