/* eslint-disable no-undef */
describe('Test @class', () => {
    beforeEach(() => {
        cy.visit(__dirname + '/spec.html')
    });

    it('Should have Jon Doe as large text and John Foo as small text', () => {
        cy.get('.text-3xl').contains('Jon Doe');
        cy.get('.text-sm').contains('John Foo');
    });
})