/* eslint-disable no-undef */
describe('Test mask', () => {
    beforeEach(() => {
        cy.visit(__dirname + '/spec.html')
    });

    it('should mask the value of the input to a US phone number format', () => {
        cy.get('input[id=mask]').type('9999999999');
        cy.get('input[id=mask]').should('have.value', '(999) 999 - 9999');
    });

    it('should mask the value of the input to a US currency format', () => {
        cy.get('input[id=mask-currency]').type('345085');
        cy.get('input[id=mask-currency]').should('have.value', '$3,450.85');
    });

    it('should mask the value of the input to a GBP currency format', () => {
        cy.get('input[id=mask-currency-gbp]').type('345085');
        cy.get('input[id=mask-currency-gbp]').should('have.value', '£3,450.85');
    });

    it('should mask the value of the input to a US date format', () => {
        cy.get('input[id=mask-date]').type('03052025');
        cy.get('input[id=mask-date]').should('have.value', '03/05/2025');
    });
})