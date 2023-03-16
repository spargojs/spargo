/* eslint-disable no-undef */
describe('Test morph', () => {
    beforeEach(() => {
        cy.visit(__dirname + '/spec.html')
    });

    it('should morph the value of the input to a phone number', () => {
        cy.get('input[id=morph]').type('9999999999');
        cy.get('input[id=morph]').should('have.value', '(999) 999 - 9999');
    });
})