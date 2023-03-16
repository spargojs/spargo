/* eslint-disable no-undef */
describe('Test for', () => {
    beforeEach(() => {
        cy.visit(__dirname + '/spec.html')
    });

    it('should have one America and one Jon Doe on the page, then should have Portugal after clicking the button', () => {
        cy.get('.mt-8').contains('America');
        cy.get('.mt-8').contains('Jon Doe');
        cy.get('button[id=addPortugal]').click();
        cy.get('.mt-8').contains('Portugal');
    });
})