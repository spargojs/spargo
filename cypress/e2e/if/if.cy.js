/* eslint-disable no-undef */
describe('Test @if, @elseif, @else', () => {
    beforeEach(() => {
        cy.visit(__dirname + '/spec.html')
    });

    it('should show "Showing the if" as the text', () => {
        cy.get('div[id=show]').should('have.text', 'Showing the if')
    });

    it('should show "Showing the else if" as the text', () => {
        cy.get('button[id=showElseIfButton]').click()
        cy.get('div[id=showElseIf]').should('have.text', 'Showing the else if')
    });

    it('should show "Finally, show the else" as the text', () => {
        cy.get('button[id=showElseButton]').click()
        cy.get('div[id=else]').should('have.text', 'Finally, show the else')
    });
})