describe('Test @text', () => {
    beforeEach(() => {
        cy.visit(__dirname + '/spec.html')
    });

    it('span text synced with message should have "this is so cool" as the value', () => {
        cy.get('input[id=message]').clear().type('this is so cool');

        cy.get('span[id=message]').should('have.text', 'this is so cool');

        cy.contains('Testing');
    });

    it('span text synced with latin should have "Pellentesque ligula posuere imperdiet" as the value', () => {
        cy.get('input[id=latin]').clear().type('Pellentesque ligula posuere imperdiet');

        cy.get('span[id=latin]').should('have.text', 'Pellentesque ligula posuere imperdiet');
    });
})