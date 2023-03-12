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
    element: Element,
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

        this.elements.push({ id, vNode: node, object, element });

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
        const ifData = {
            ifIsFalse: false,
            elseIfIsFalse: false,
        };

        return Array.from(children).map((child: ChildNode) => {
            const nodeData: VNodeData = {};

            switch (child.nodeType) {
                case 1: { // Element
                    const childElement = child as Element;

                    if (this.shouldNotIncludeCheck(childElement, ifData, object)) {
                        return '';
                    }

                    nodeData.class = this.retrieveClasses(childElement);

                    switch (childElement.nodeName) {
                        case 'INPUT': {
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

                            return this.generateVNode(child, childElement, object, nodeData);
                        }

                        case 'BUTTON': {
                            const click = childElement.getAttribute('@click');

                            if (click) {
                                const method = object[click];

                                if (typeof method !== 'function') {
                                    const methodWithParens = object[click.slice(0, -2)];

                                    if (typeof methodWithParens !== 'function') {
                                        throw new Error(`${click} was not found as a method`);
                                    }
                                }

                                const runFunction = (e: Event) => {
                                    let index = null;

                                    if (e.target) {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const target = (e.target as any);

                                        index = this.elements.findIndex(element => element.id === this.findSpargoParentNodeLocalName(target.parentNode));

                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        (this.elements[index] as any).object[method ? click : click.slice(0, -2)]();
                                    }

                                    // if the @if is falsy, the element is never transfered to the vdom, so the node must be patched via the original element
                                    this.updateStateByElement(e, index);
                                };

                                nodeData.on = { click: runFunction };
                            }

                            return this.generateVNode(child, childElement, object, nodeData);
                        }

                        default: {
                            return this.generateVNode(child, childElement, object, nodeData);
                        }
                    }
                }
                case 3: // Text
                    return child.textContent || '';

                default:
                    return h(child.nodeName, nodeData, child.childNodes.length > 0 ? this.generateVNodes(child.childNodes, object) : []);
            }
        });
    }

    /**
     * @description Checks if the provided element should not be included in the dom
     * @param childElement 
     * @param ifData 
     * @param object 
     * @returns boolean
     */
    private shouldNotIncludeCheck(childElement: Element, ifData: { ifIsFalse: boolean, elseIfIsFalse: boolean }, object: spargoElementObject): boolean {
        const ifCheck = childElement.getAttribute('@if');

        if (ifCheck && !this.valueTruthyInObject(ifCheck, object)) {
            ifData.ifIsFalse = true;

            return true;
        }

        const elseIfCheck = childElement.getAttribute('@elseif');
        const elseCheck = childElement.getAttribute('@else') !== null;

        if (!elseIfCheck && !elseCheck) {
            ifData.ifIsFalse = false;
            ifData.elseIfIsFalse = false;
        }

        if (!ifData.ifIsFalse && elseIfCheck) {
            return true;
        }

        if (elseIfCheck && !this.valueTruthyInObject(elseIfCheck, object)) {
            ifData.elseIfIsFalse = true;

            return true;
        }

        if ((!ifData.ifIsFalse || !ifData.elseIfIsFalse) && elseCheck) {
            return true;
        } else if (elseCheck) {
            ifData.ifIsFalse = false;
            ifData.elseIfIsFalse = false;
        }

        return false;
    }

    /**
     * @description Check for the truthiness of the provided value within the object.
     * @param value 
     * @param object 
     * @returns  boolean
     * @throws If the provided value is not found within the object
     */
    private valueTruthyInObject(value: string, object: spargoElementObject): boolean {
        if (object[value] !== undefined && typeof object[value] === 'function' && object[value]()) {
            return true;
        }

        // Check if provided value is a piece of state. If yes, check the piece of state.
        if (
            ((value.substring(0, 1) === '!' && object[value.slice(1)] !== undefined) && !object[value.slice(1)]) ||
            ((value.substring(0, 1) !== '!' && object[value] !== undefined) && object[value])
        ) {
            return true;
        } else if (
            (value.substring(0, 1) === '!' && object[value.slice(1)] === undefined) ||
            (value.substring(0, 1) !== '!' && object[value] === undefined)
        ) {
            throw new Error(`${value} not found in state`);
        }

        return false;
    }

    /**
     * @description Generate a snabbdom vnode
     * @param child
     * @param childElement
     * @param object
     * @param nodeData
     * @returns VNode
     */
    private generateVNode(child: ChildNode, childElement: Element, object: spargoElementObject, nodeData: VNodeData): VNode {
        const textNode = this.textNode(childElement, object, nodeData);

        if (textNode) {
            return textNode;
        }

        const nodeWithTextContent = this.nodeWithTextContent(childElement, nodeData);

        if (nodeWithTextContent) {
            return nodeWithTextContent;
        }

        return h(child.nodeName, nodeData, child.childNodes.length > 0 ? this.generateVNodes(child.childNodes, object) : []);
    }

    /**
     * @description Will generate a node with text content
     * @param childElement
     * @param nodeData
     * @returns VNode | undefined
     */
    private nodeWithTextContent(childElement: Element, nodeData: VNodeData): VNode | undefined {
        if (childElement.textContent?.trim() !== '' && childElement.children.length === 0) {
            nodeData.props = this.generateProps({}, childElement);

            return h(childElement.nodeName, nodeData, childElement.textContent);
        }
    }

    /**
     * @description Will generate a text node if applicable
     * @param childElement
     * @param object
     * @param nodeData
     * @returns VNode | undefined
     */
    private textNode(childElement: Element, object: spargoElementObject, nodeData: VNodeData): VNode | undefined {
        const textAttribute = childElement.getAttribute('@text');

        if (textAttribute) {
            if (!object[textAttribute]) {
                throw new Error(`${textAttribute} does not exist in the object.`);
            }

            nodeData.props = this.generateProps({ text: textAttribute }, childElement);

            return h(childElement.nodeName, nodeData, object[textAttribute]);
        }
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
     * @description Update the JavaScript state from an event and patch the view accordingly via the element
     * @param e
     * @param index
     * @returns void
     */
    private updateStateByElement(e: Event, index?: number | null): void {
        if (e.target) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const target = (e.target as any);

            if (!index) {
                index = this.elements.findIndex(element => element.id === this.findSpargoParentNodeLocalName(target.parentNode));
            }

            if (index < 0) {
                throw new Error(`Element with id of ${target.parentNode.localName} not found in memory`);
            }

            const spargoElement = this.elements[index];

            const updatedNodeChildren: (string | VNode)[] = this.generateVNodes(spargoElement.element.childNodes, spargoElement.object);

            if (updatedNodeChildren.length > 0 && spargoElement.vNode.sel && spargoElement.vNode.data) {
                const updatedNode = h(spargoElement.vNode.sel, spargoElement.vNode.data, updatedNodeChildren);

                patch(spargoElement.vNode, updatedNode);

                spargoElement.vNode = updatedNode;
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