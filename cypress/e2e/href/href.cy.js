/* eslint-disable no-undef */
describe('Test @href', () => {
    beforeEach(() => {
        cy.visit(__dirname + '/spec.html')
    });

    it('should have https://spargojs.dev as href.', () => {
        cy.get('a[id=href]')
            .should('have.attr', 'href')
            .and('match', /https:\/\/spargojs.dev/);
    });
})