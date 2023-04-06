/* eslint-disable no-undef */
describe('Test @for', () => {
    beforeEach(() => {
        cy.visit(__dirname + '/spec.html')
    });

    it('should have one America and one Jon Doe on the page, then should have Portugal after clicking the button', () => {
        cy.get('.mt-8').contains('America');
        cy.get('.mt-8').contains('Jon Doe');
        cy.get('button[id=addPortugal]').click();
        cy.get('.mt-8').contains('Portugal');
    });

    it('should have one Jeremy, one jbla, and one else on the page', () => {
        cy.get('p[id="Jeremy"]').should('have.length', 1);
        cy.get('p[id="jbla"]').should('have.length', 1);
        cy.get('p[id="else"]').should('have.length', 1);
    });
})