/* eslint-disable no-undef */
describe('Test @sync', () => {
    beforeEach(() => {
        cy.visit(__dirname + '/spec.html')
    });

    it('mesage synced input should have hello world as the value', () => {
        cy.get('input[id=message]').should('have.value', 'hello world')
    });

    it('latin synced input should have dum spiro spero as the value', () => {
        cy.get('input[id=latin]').should('have.value', 'dum spiro spero')
    });
})