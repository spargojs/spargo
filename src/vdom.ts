import {h, VNode, VNodeData} from "snabbdom";
import masks from "./masks";
import {spargoElement, spargoElementObject} from "./types";
import {generateAttrs, generateProps, retrieveClasses, valueTruthyInObject} from "./utils";

export class Vdom {
    elements: spargoElement[] = [];
    patch: (oldVnode: Element | VNode | DocumentFragment, vnode: VNode) => VNode;

    constructor(
        elements: spargoElement[],
        patch: (oldVnode: Element | VNode | DocumentFragment, vnode: VNode) => VNode) {
        this.elements = elements;
        this.patch = patch;
    }

    /**
     * @description Generate snabbdom VNode's from an Element's children
     * @param children
     * @param object
     * @returns (string | VNode)[]
     * @throws If an input is not synced to a piece of state
     * @throws If a synced value does not exist
     * @throws If a mask does not exist
     */
    public generateVNodes(children: NodeListOf<ChildNode>, object: spargoElementObject): (string | VNode)[] {
        const ifData = {
            ifIsFalse: false,
            elseIfIsFalse: false,
            elseIfPresent: false,
        };

        return Array.from(children).map((child: ChildNode) => {
            const nodeData: VNodeData = {};

            switch (child.nodeType) {
                case 1: { // Element
                    return this.generateVNodeForElement(child, ifData, object, nodeData);
                }
                case 3: // Text
                    return child.textContent || '';

                default:
                    return h(
                        child.nodeName,
                        nodeData,
                        child.childNodes.length > 0 ? this.generateVNodes(child.childNodes, object) : []
                    );
            }
        });
    }

    /**
     * @description Prepares the given element to pass through the generateVNodes method
     * @param element
     * @param object
     * @returns void
     * @throws If the provided piece of state to iterate over does not exist
     */
    public iterateOverLoops(element: Element, object: spargoElementObject): void {
        Array.from(element.children).forEach((child: Element) => {
            const forCheck = child.getAttribute('@for');

            if (forCheck) {
                const [name, objectKey] = forCheck.split('in');

                if (object[objectKey.trim()] === undefined) {
                    throw new Error(`${objectKey.trim()} does not exist in the object.`)
                }

                this.loopNodeCreations(child, object, objectKey, name);

                child.parentElement?.removeAttribute('@for');

                child.remove();
            }

            if (child.children.length > 0) {
                this.iterateOverLoops(child, object)
            }
        });
    }

    /**
     * @description Update the JavaScript state from an update to state and patch the view accordingly via the element
     * @returns void
     * @throws If the associated element is not found in memory
     * @param spargoElementObject
     */
    public updateByElement(spargoElementObject: spargoElementObject): void {
        const spargoElement = this.elements.find((element) => {
            return element.object === spargoElementObject;
        });

        if (!spargoElement) {
            throw new Error('Value updated in state, but the associated object could not be found in memory.');
        }

        const pureElement = spargoElement.element.cloneNode(true) as Element;

        this.iterateOverLoops(spargoElement.element, spargoElement.object);

        const updatedNodeChildren: (string | VNode)[] = this.generateVNodes(
            spargoElement.element.childNodes,
            spargoElement.object
        );

        // ? this.iterateOverLoops updates spargoElement.element and must be reset back
        spargoElement.element = pureElement;

        if (updatedNodeChildren.length > 0 && spargoElement.vNode.sel && spargoElement.vNode.data) {
            spargoElement.vNode.data = generateProps({}, spargoElement.element);

            const updatedNode = h(spargoElement.vNode.sel, spargoElement.vNode.data, updatedNodeChildren);

            this.patch(spargoElement.vNode, updatedNode);

            spargoElement.vNode = updatedNode;
        }

    }

    private loopNodeCreations(child: Element, object: spargoElementObject, objectKey: string, name: string) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        object[objectKey.trim()].forEach((value: string | { [key: string]: any }) => {
            const newNode = child.cloneNode(true);

            newNode.childNodes.forEach((node) => {
                if (node.nodeType === 1 && (node as Element).hasAttribute('@text')) { // Element
                    const text = (node as Element).getAttribute('@text');

                    if (text) {
                        if (name.trim() === '_') { // ? This means that the values will be dot notated
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (node as any).innerText = (value as { [key: string]: any })[text];
                        } else { // ? The values should just be the name
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (node as any).innerText = value;
                        }

                        (node as Element).removeAttribute('@text');
                    }
                }
            });

            child.before(newNode);
        });
    }

    /*
    * @description Generate a Vnode for an element
    * @param child
    * @param ifData
    * @param object
    * @param nodeData
    * @returns VNode | string
    */
    private generateVNodeForElement(
        child: ChildNode,
        ifData: { ifIsFalse: boolean, elseIfIsFalse: boolean, elseIfPresent: boolean },
        object: spargoElementObject,
        nodeData: VNodeData
    ): VNode | string {
        const childElement = child as Element;

        if (this.shouldNotIncludeCheck(childElement, ifData, object)) {
            return '';
        }

        nodeData.props = generateProps({}, childElement);

        nodeData.attrs = generateAttrs({}, childElement);

        nodeData.class = retrieveClasses(childElement);

        switch (childElement.nodeName) {
            case 'INPUT': {
                const props = this.generateInputProps(childElement, object);

                const updateState = (e: Event) => {
                    this.updateState(e)
                };

                nodeData.props = generateProps({...props, ...nodeData.props}, childElement);
                nodeData.on = {input: updateState};

                return this.generateVNode(child, childElement, object, nodeData);
            }

            case 'BUTTON': {
                this.attachListenersToButton(childElement, object, nodeData);

                return this.generateVNode(child, childElement, object, nodeData);
            }

            default: {
                return this.generateVNode(child, childElement, object, nodeData);
            }
        }
    }

    /*
   * @description Attach listeners to a button
   * @param childElement
   * @param object
   * @param nodeData - possibly mutated
   * @returns void
   */
    private attachListenersToButton(childElement: Element, object: spargoElementObject, nodeData: VNodeData): void {
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

                    index = this.elements.findIndex(element =>
                        element.id === this.findSpargoParentNodeLocalName(target.parentNode));

                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (this.elements[index] as any).object[method ? click : click.slice(0, -2)]();
                }
            };

            nodeData.on = {click: runFunction};
        }
    }

    /*
    * @description Generate custom props for an input
    * @param childElement
    * @param object
    * @returns {
        value: string | null,
        sync: string | null,
        mask: string | null
    }
    */
    private generateInputProps(childElement: Element, object: spargoElementObject): {
        value: string | null,
        sync: string | null,
        mask: string | null
    } {
        const sync = childElement.getAttribute('@sync');

        if (!sync) {
            throw new Error(`It is expected that all input's are synced to a piece of data.`)
        }

        const value = object[sync];

        if (value === undefined && !Object.getOwnPropertyDescriptor(object, sync)?.set) {
            throw new Error(`${sync} does not exist.`);
        }

        const mask = childElement.getAttribute('@mask');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (mask && (masks as any)[mask] === undefined) {
            throw new Error(`The @mask ${mask} does not exist.`);
        }

        return {value, sync, mask};
    }

    /**
     * @description Checks if the provided element should not be included in the dom
     * @param childElement
     * @param ifData
     * @param object
     * @returns boolean
     */
    private shouldNotIncludeCheck(
        childElement: Element,
        ifData: { ifIsFalse: boolean, elseIfIsFalse: boolean, elseIfPresent: boolean },
        object: spargoElementObject
    ): boolean {
        const ifCheck = childElement.getAttribute('@if');

        if (ifCheck && !valueTruthyInObject(ifCheck, object)) {
            ifData.ifIsFalse = true;

            return true;
        }

        const elseIfCheck = childElement.getAttribute('@elseif');
        const elseCheck = childElement.getAttribute('@else') !== null;

        if (elseIfCheck) {
            ifData.elseIfPresent = true;
        }

        if (!elseIfCheck && !elseCheck) {
            ifData.ifIsFalse = false;
            ifData.elseIfIsFalse = false;
            ifData.elseIfPresent = false;
        }

        if (!ifData.ifIsFalse && elseIfCheck) {
            return true;
        }

        if (elseIfCheck && !valueTruthyInObject(elseIfCheck, object)) {
            ifData.elseIfIsFalse = true;

            return true;
        }

        if ((!ifData.ifIsFalse || (ifData.elseIfPresent && !ifData.elseIfIsFalse)) && elseCheck) {
            return true;
        } else if (elseCheck) {
            ifData.ifIsFalse = false;
            ifData.elseIfIsFalse = false;
            ifData.elseIfPresent = false;
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
    private generateVNode(
        child: ChildNode,
        childElement: Element,
        object: spargoElementObject,
        nodeData: VNodeData
    ): VNode {
        const textNode = this.textNode(childElement, object, nodeData);

        if (textNode) {
            return textNode;
        }

        const nodeWithTextContent = this.nodeWithTextContent(childElement, nodeData);

        if (nodeWithTextContent) {
            return nodeWithTextContent;
        }

        return h(
            child.nodeName,
            nodeData,
            child.childNodes.length > 0 ? this.generateVNodes(child.childNodes, object) : []
        );
    }

    /**
     * @description Will generate a node with text content
     * @param childElement
     * @param nodeData
     * @returns VNode | undefined
     */
    private nodeWithTextContent(childElement: Element, nodeData: VNodeData): VNode | undefined {
        if (childElement.textContent?.trim() !== '' && childElement.children.length === 0) {
            nodeData.props = generateProps({...nodeData.props}, childElement);

            return h(childElement.nodeName, nodeData, childElement.textContent);
        }
    }

    /**
     * @description Will generate a text node if applicable
     * @param childElement
     * @param object
     * @param nodeData
     * @returns VNode | undefined
     * @throws If the associated text value (if it is set) does not exist in the object
     */
    private textNode(childElement: Element, object: spargoElementObject, nodeData: VNodeData): VNode | undefined {
        const textAttribute = childElement.getAttribute('@text');

        if (textAttribute) {
            if (object[textAttribute] === undefined) {
                throw new Error(`${textAttribute} does not exist in the object.`);
            }

            nodeData.props = generateProps({text: textAttribute, ...nodeData.props}, childElement);

            return h(childElement.nodeName, nodeData, object[textAttribute]);
        }
    }

    /**
     * @description Update the JavaScript state from an event and patch the view accordingly
     * @param e
     * @returns void
     * @throws If the associated element is not found in memory
     */
    private updateState(e: Event): void {
        if (e.target) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const target = (e.target as any);

            const index = this.elements.findIndex(
                element => element.id === this.findSpargoParentNodeLocalName(target.parentNode)
            );

            if (index < 0) {
                throw new Error(`Element with id of ${target.parentNode.localName} not found in memory`);
            }

            const element = this.elements[index];

            this.retrieveNodeChildren(element.vNode.children, element, e);
        }
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

    /**
     * @description Generate new snabbdom nodes with updated values and update any necessary JavaScript state
     * @param nodes
     * @param element
     * @param e
     * @returns void
     */
    private retrieveNodeChildren(nodes: (string | VNode)[] | undefined, element: spargoElement, e: Event): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const target = e.target as any;

        const object = element.object;

        nodes?.map((childNode: string | VNode) => {
            if (typeof childNode !== 'string' && childNode.children && childNode.children.length > 0) {
                this.retrieveNodeChildren(childNode.children, element, e);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } else if (typeof childNode !== 'string' && childNode.data && childNode.data.props && childNode.data.props['sync'] && childNode.data.props['sync'] === target.sync) {
                // update sync value in object
                if (childNode.data.props['mask']) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    object[childNode.data.props['sync']] = (masks as any)[childNode.data.props['mask']](target.value);
                    target.value = object[childNode.data.props['sync']]; // Update the value of the target (input) to the masked value
                } else {
                    object[childNode.data.props['sync']] = target.value;
                }
            }
        });
    }
}