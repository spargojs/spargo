type spargoElement = {
    id: string,
    domElement: Element,
    object: Object
}

export class Spargo {
    elements: spargoElement[] = [];

    constructor() {
        this.initialize();

        this.updateAllText();

        this.showAll(this.elements.map((element) => element.domElement));

        // TODO: Create listener for popstate to re-initialize and update synced text
    }

    /**
     * @returns void
     */
    initialize(): void {
        /**
         * We will grab all the elements that are to be reactive
         */
        const elements = document.querySelectorAll('[ignite]');

        this.hideAll(elements);

        elements.forEach((element) => {
            this.createElement(element);
        });
    }

    /**
     * We will hide all the elements until they are fully initialized
     * 
     * @param elements 
     * @returns void
     */
    hideAll(elements: NodeListOf<Element>): void {
        elements.forEach((element) => {
            element.setAttribute('hidden', 'true');
        });
    }

    /**
     * We will show all the elements when they are fully initialized
     * 
     * @param elements 
     */
    showAll(elements: Element[]): void {
        elements.forEach((element) => {
            element.removeAttribute('hidden');
        });
    }

    /**
     * We will create a new element after we find it
     * 
     * @param element 
     * @returns void
     */
    createElement(element: Element): void {
        /**
         * If the element already exists, ignore.
         */
        if (element.getAttribute('spargo-id')) {
            return;
        }

        const id = crypto.randomUUID();

        element.setAttribute('spargo-id', id); // attach a unique id to the element

        /**
         * element.getAttribute('ignite') - implicitly any
         * window[element.getAttribute('ignite')])() - typscript
         * isn't aware this is a method
         * 
         * We will grab the javascript object that is associated with the element
         */
        // @ts-ignore:next-line
        const object: any = (window[element.getAttribute('ignite')])();

        if (!object) {
            throw new Error(`${element.getAttribute('ignite')} does not exist as a method on the page.`);
        }

        // push into this.elements
        this.elements.push({ id, domElement: element, object });

        // attach listeners to the appropriate element children
        this.attachListeners(element, id);

        // run the elements ignited method
        object.ignited();
    }

    /**
     * Attach a listener to all the appropriate child nodes
     * 
     * @param element 
     * @param id 
     * @returns void
     */
    attachListeners(element: Element, id: string): void {
        const index = this.elements.findIndex(element => element.id === id);

        Array.from(element.children).forEach((childNode: Element) => {
            const sync = childNode.getAttribute('@sync');

            if (childNode.nodeName === 'INPUT' && sync) {
                /**
                 * Set the value of the input to the piece of state
                 */
                const value = (this.elements[index] as any).object[sync];

                if (!value) {
                    throw new Error(`${sync} does not exist.`);
                }

                childNode.setAttribute('value', value);

                /**
                 * Attach an input listener
                 */
                childNode.addEventListener('input', (event: any) => {
                    /**
                     * On input, update the state
                     */
                    this.updateObject(id, index, sync, event.target?.value);
                });
            }

            // TODO: Must continue beyond just an input - i.e. select
        });
    }

    /**
     * We have to update the state for the given element whenever an appropriate event occurs
     * 
     * @param id 
     * @param index 
     * @param sync 
     * @param value 
     * @returns void
     */
    updateObject(id: string, index: number, sync: string, value: string): void {
        if (!(this.elements[index] as any).object[sync]) {
            throw new Error(`${sync} does not exist in the object.`);
        }

        /**
         * Update the state to the given value
         */
        (this.elements[index] as any).object[sync] = value;

        /**
         * Now that the state has been updated, we must update the synced text accordingly
         */
        this.updateTextById(id);
    }

    /**
     * Update all the synced text on the screen
     * 
     * @returns void
     */
    updateAllText(): void {
        this.elements.forEach((element) => {
            this.updateElementText(element);
        });
    }

    /**
     * We will update the synced text of the given elements id
     * 
     * @param id 
     * @returns void
     */
    updateTextById(id: string): void {
        const index = this.elements.findIndex(element => element.id === id);

        const element = this.elements[index];

        this.updateElementText(element);
    }

    /**
     * We will update the synced text of the given element
     * 
     * @param element 
     * @returns void
     */
    updateElementText(element: spargoElement): void {
        element.domElement.childNodes.forEach((childNode) => {
            /**
             * Typescript does not believe that attributes exists on type ChildNode
             */
            const attributes = (childNode as any).attributes;

            if (attributes) {
                /**
                 * any is needed since it is used above
                 */
                let containsSync: any = Array.from(attributes).find((attribute: any) => attribute.name === '@text');

                if (containsSync) {
                    if (!(element as any).object[containsSync.textContent as any]) {
                        throw new Error(`${containsSync.textContent} does not exist in the object.`);
                    }

                    /**
                     * Typescript does not believe that textContent exists on containsSync, when it does
                     */
                    childNode.textContent = (element as any).object[containsSync.textContent as any];
                }
            }
        });
    }
}