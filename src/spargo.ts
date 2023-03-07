import {
    init,
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
    h,
    VNode,
    VNodeData,
    toVNode,
} from "snabbdom";

type spargoElement = {
    id: string,
    vNode: VNode,
    object: Object
}

const patch = init([
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
]);

export class Spargo {
    elements: spargoElement[] = [];

    constructor() {
        this.initialize();

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

        // this.hideAll(elements);

        elements.forEach((element) => {
            this.createElement(element);
        });
    }

    /**
     * @description Create a new element
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

        const id = `spargo-${crypto.randomUUID()}`;

        const node = h(id, {}, this.generateVNodes(element.children, object));

        patch(toVNode(element), node);

        // push into this.elements
        this.elements.push({ id, vNode: node, object });

        // run the elements ignited method
        object.ignited();
    }

    /**
     * @description Generate snabbdom VNode's from an Element's children
     * @param children 
     * @param object 
     * @returns VNode[]
     */
    private generateVNodes(children: HTMLCollection, object: any): VNode[] {
        return Array.from(children).map((child: Element) => {
            const nodeData: VNodeData = {};

            if (child.nodeName === 'INPUT') {
                const sync = child.getAttribute('@sync');

                if (!sync) {
                    throw new Error(`It is expected that all input's are synced to a piece of data.`)
                }

                /**
                 * Set the value of the input to the piece of state
                 */
                const value = object[sync];

                if (!value) {
                    throw new Error(`${sync} does not exist.`);
                }

                const updateState = (e: Event) => { this.updateState(e) };

                nodeData.props = { value, sync }
                nodeData.on = { input: updateState };
            } else {
                const textAttribute = child.getAttribute('@text');

                if (textAttribute) {
                    if (!object[textAttribute]) {
                        throw new Error(`${textAttribute} does not exist in the object.`);
                    }

                    nodeData.props = { text: textAttribute };

                    return h(child.nodeName, nodeData, object[textAttribute]);
                }
            }

            return h(child.nodeName, nodeData, child.children.length > 0 ? this.generateVNodes(child.children, object) : []);
        });
    }

    /**
     * @description Update the JavaScript state from an event and patch the view accordingly
     * @param e
     * @returns void
     */
    private updateState(e: Event): void {
        if (e.target) {
            const target = (e.target as any);

            const index = this.elements.findIndex(element => element.id === this.findSpargoParentNodeLocalName(target.parentNode));

            if (index < 0) {
                throw new Error(`Element with id of ${target.parentNode.localName} not found in memory`);
            }

            const element = this.elements[index];

            const updatedNodeChildren: (string | VNode)[] = this.retrieveNodeChildren(element.vNode.children, element, e);

            if (updatedNodeChildren.length > 0 && element.vNode.sel && element.vNode.data) {
                const updatedNode = h(element.vNode.sel, element.vNode.data, updatedNodeChildren);

                patch(element.vNode, updatedNode);

                element.vNode = updatedNode;
            }
        }
    }

    /**
     * @description Generate new snabbdom nodes with updated values and update any necessary JavaScript state
     * @param nodes 
     * @param element 
     * @param e 
     * @returns (string | VNode)[]
     */
    private retrieveNodeChildren(nodes: (string | VNode)[] | undefined, element: spargoElement, e: Event): (string | VNode)[] {
        return nodes?.map((childNode: string | VNode) => {
            if (typeof childNode !== 'string' && childNode.children && childNode.children.length > 0) {
                return h(childNode.sel || '', childNode.data || null, this.retrieveNodeChildren(childNode.children, element, e));
            } else if (typeof childNode !== 'string' && childNode.data && childNode.data.props && childNode.data.props['sync']) {
                // update sync value in object
                (element.object as any)[childNode.data.props['sync']] = (e.target as any).value;
            } else if (typeof childNode !== 'string' && childNode.data && childNode.data.props && childNode.data.props['text']) {
                // update text
                if (childNode.data.props['text'] === (e.target as any).sync) {
                    return h(childNode.sel || '', childNode.data, (element.object as any)[childNode.data.props['text']]);
                }
            }

            return childNode;
        }) ?? [];
    }

    /**
     * @description Hunt down the snabbdom .sel for the given element
     * @param element 
     * @returns string
     */
    private findSpargoParentNodeLocalName(element: any): string {
        if (element.localName.includes('spargo-')) {
            return element.localName;
        } else if (element.parentNode && element.parentNode.localName.includes('spargo-')) {
            return element.parentNode.localName;
        } else {
            return this.findSpargoParentNodeLocalName(element.parentNode);
        }
    }
}