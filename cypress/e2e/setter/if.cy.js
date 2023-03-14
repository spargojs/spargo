/* eslint-disable no-undef */
describe('Test setter', () => {
    beforeEach(() => {
        cy.visit(__dirname + '/spec.html')
    });

    it('should display "hello world" as text and 11 as number', () => {
        cy.get('input[id=setter]').type('hello world');
        cy.get('span[id=setterValue]').should('have.text', 'hello world')
        cy.get('span[id=setterCount]').should('have.text', '11')
    });
})