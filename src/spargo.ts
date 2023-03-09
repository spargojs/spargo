import {
    init,
    classModule,
    propsModule,
    styleModule, // TODO: Must implement
    eventListenersModule,
    h,
    VNode,
    VNodeData,
    toVNode,
    Classes,
} from "snabbdom";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type spargoElementObject = { [key: string]: any, ignited?: ignited };

type spargoElement = {
    id: string,
    vNode: VNode,
    object: spargoElementObject
}

const patch = init([
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
]);

type ignited = () => void;

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
         * Grab all the elements that are to be reactive
         */
        const elements = document.querySelectorAll('[ignite]');

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const object: spargoElementObject = ((window as any)[element.getAttribute('ignite') as string])();

        if (!object) {
            throw new Error(`${element.getAttribute('ignite')} does not exist as a method on the page.`);
        }

        const id = `spargo-${crypto.randomUUID()}`;

        const node = h(id, { class: this.retrieveClasses(element) }, this.generateVNodes(element.childNodes, object));

        patch(toVNode(element), node);

        this.elements.push({ id, vNode: node, object });

        if (typeof object.ignited === 'function') {
            object.ignited();
        }
    }

    /**
     * @description Generate snabbdom VNode's from an Element's children
     * @param children 
     * @param object 
     * @returns (string | VNode)[]
     */
    private generateVNodes(children: NodeListOf<ChildNode>, object: spargoElementObject): (string | VNode)[] {
        return Array.from(children).map((child: ChildNode) => {
            const nodeData: VNodeData = {};

            if (child.nodeType === 1) { // Element
                const childElement = child as Element;

                nodeData.class = this.retrieveClasses(childElement);

                if (childElement.nodeName === 'INPUT') {
                    const sync = childElement.getAttribute('@sync');

                    if (!sync) {
                        throw new Error(`It is expected that all input's are synced to a piece of data.`)
                    }

                    const value = object[sync];

                    if (!value) {
                        throw new Error(`${sync} does not exist.`);
                    }

                    const updateState = (e: Event) => { this.updateState(e) };

                    nodeData.props = this.generateProps({ value, sync }, childElement);
                    nodeData.on = { input: updateState };
                } else {
                    const textAttribute = childElement.getAttribute('@text');

                    if (textAttribute) {
                        if (!object[textAttribute]) {
                            throw new Error(`${textAttribute} does not exist in the object.`);
                        }

                        nodeData.props = this.generateProps({ text: textAttribute }, childElement);

                        return h(childElement.nodeName, nodeData, object[textAttribute]);
                    }

                    if (childElement.textContent?.trim() !== '' && childElement.children.length === 0) {
                        return h(childElement.nodeName, nodeData, childElement.textContent);
                    }
                }
            } else if (child.nodeType === 3) { // Text
                return child.textContent || '';
            }

            return h(child.nodeName, nodeData, child.childNodes.length > 0 ? this.generateVNodes(child.childNodes, object) : []);
        });
    }

    /**
     * @description Retrieves the props of the element in the format that snabbdom expects
     * @param object 
     * @param element 
     * @returns object
     */
    private generateProps(object: object, element: Element): object {
        const attributes = [
            'id',
            'name',
            'style',
            'placeholder',
            'ref',
            'href',
            'src',
            'target',
            'aria-label',
            'disabled',
            'hidden',
            'selected',
            'for',
            'type'
        ];

        const expandedObject: { [key: string]: string } = {};

        attributes.forEach((attr: string) => {
            const elementAttr = element.getAttribute(attr);

            if (elementAttr) {
                expandedObject[attr] = elementAttr;
            }
        });

        return { ...expandedObject, ...object };
    }

    /**
     * @description Retrieves the classes of the element in the format that snabbdom expects
     * @param element 
     * @returns Classes
     */
    private retrieveClasses(element: Element): Classes {
        const classes = element.getAttribute('class');

        const classesObject: { [key: string]: boolean } = {};

        if (classes) {
            classes.split(' ').forEach((classString: string) => {
                classesObject[classString] = true;
            });
        }

        return classesObject;
    }

    /**
     * @description Update the JavaScript state from an event and patch the view accordingly
     * @param e
     * @returns void
     */
    private updateState(e: Event): void {
        if (e.target) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const target = e.target as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const object = element.object as any;

        return nodes?.map((childNode: string | VNode) => {
            if (typeof childNode !== 'string' && childNode.children && childNode.children.length > 0) {
                return h(childNode.sel || '', childNode.data || null, this.retrieveNodeChildren(childNode.children, element, e));
            } else if (typeof childNode !== 'string' && childNode.data && childNode.data.props && childNode.data.props['sync']) {
                // update sync value in object
                object[childNode.data.props['sync']] = target.value;
            } else if (typeof childNode !== 'string' && childNode.data && childNode.data.props && childNode.data.props['text']) {
                // update text
                if (childNode.data.props['text'] === target.sync) {
                    return h(childNode.sel || '', childNode.data, object[childNode.data.props['text']]);
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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