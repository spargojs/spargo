/* eslint-disable no-undef */
describe('Test getter', () => {
    beforeEach(() => {
        cy.visit(__dirname + '/spec.html')
    });

    it('should display "Will add on to latin: dum spiro spero" as the text', () => {
        cy.get('input[id=latin]').type('dum spiro spero');
        cy.get('span[id=getter]').should('have.text', 'Will add on to latin: dum spiro spero')
    });
})