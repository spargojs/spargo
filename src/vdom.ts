import { h, VNode, VNodeData } from "snabbdom";
import morphs from "./morphs";
import { spargoElement, spargoElementObject } from "./types";
import { generateProps, retrieveClasses, valueTruthyInObject } from "./utils";

export class Vdom {
    elements: spargoElement[] = [];
    patch: (oldVnode: Element | VNode | DocumentFragment, vnode: VNode) => VNode;

    constructor(elements: spargoElement[], patch: (oldVnode: Element | VNode | DocumentFragment, vnode: VNode) => VNode) {
        this.elements = elements;
        this.patch = patch;
    }

    /**
     * @description Generate snabbdom VNode's from an Element's children
     * @param children 
     * @param object 
     * @returns (string | VNode)[]
     * @throws If an input is not synced to a piece of state, or if the synced value does not exist, or if the morph does not exist
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
                    const childElement = child as Element;

                    if (this.shouldNotIncludeCheck(childElement, ifData, object)) {
                        return '';
                    }

                    nodeData.class = retrieveClasses(childElement);

                    switch (childElement.nodeName) {
                        case 'INPUT': {
                            const sync = childElement.getAttribute('@sync');

                            if (!sync) {
                                throw new Error(`It is expected that all input's are synced to a piece of data.`)
                            }

                            const value = object[sync];

                            if (value === undefined && !Object.getOwnPropertyDescriptor(object, sync)?.set) {
                                throw new Error(`${sync} does not exist.`);
                            }

                            const morph = childElement.getAttribute('@morph');

                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            if (morph && (morphs as any)[morph] === undefined) {
                                throw new Error(`The @morph ${morph} does not exist.`);
                            } else if (morph) {
                                if (object.morphs === undefined) {
                                    object.morphs = {};
                                }

                                object.morphs[sync] = morph;
                            }

                            const updateState = (e: Event) => { this.updateState(e) };

                            nodeData.props = generateProps({ value, sync, morph }, childElement);
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

                child.parentElement?.removeAttribute('@for');

                child.remove();
            }

            if (child.children.length > 0) {
                this.iterateOverLoops(child, object)
            }
        });
    }

    /**
    * @description Update the JavaScript state from an event and patch the view accordingly via the element
    * @param e
    * @param index
    * @returns void
    * @throws If the associated element is not found in memory
    */
    public updateStateByElement(e: Event, index?: number | null): void {
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

            const pureElement = spargoElement.element.cloneNode(true) as Element;

            this.iterateOverLoops(spargoElement.element, spargoElement.object);

            const updatedNodeChildren: (string | VNode)[] = this.generateVNodes(spargoElement.element.childNodes, spargoElement.object);

            spargoElement.element = pureElement; // ? this.iterateOverLoops updates spargoElement.element and must be reset back

            if (updatedNodeChildren.length > 0 && spargoElement.vNode.sel && spargoElement.vNode.data) {
                const updatedNode = h(spargoElement.vNode.sel, spargoElement.vNode.data, updatedNodeChildren);

                this.patch(spargoElement.vNode, updatedNode);

                spargoElement.vNode = updatedNode;
            }
        }
    }

    /**
     * @description Checks if the provided element should not be included in the dom
     * @param childElement 
     * @param ifData 
     * @param object 
     * @returns boolean
     */
    private shouldNotIncludeCheck(childElement: Element, ifData: { ifIsFalse: boolean, elseIfIsFalse: boolean, elseIfPresent: boolean }, object: spargoElementObject): boolean {
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
            nodeData.props = generateProps({}, childElement);

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

            nodeData.props = generateProps({ text: textAttribute }, childElement);

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

            const index = this.elements.findIndex(element => element.id === this.findSpargoParentNodeLocalName(target.parentNode));

            if (index < 0) {
                throw new Error(`Element with id of ${target.parentNode.localName} not found in memory`);
            }

            const element = this.elements[index];

            const updatedNodeChildren: (string | VNode)[] = this.retrieveNodeChildren(element.vNode.children, element, e);

            if (updatedNodeChildren.length > 0 && element.vNode.sel && element.vNode.data) {
                const updatedNode = h(element.vNode.sel, element.vNode.data, updatedNodeChildren);

                this.patch(element.vNode, updatedNode);

                element.vNode = updatedNode;
            }
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
     * @returns (string | VNode)[]
     */
    private retrieveNodeChildren(nodes: (string | VNode)[] | undefined, element: spargoElement, e: Event): (string | VNode)[] {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const target = e.target as any;

        const object = element.object as spargoElementObject;

        return nodes?.map((childNode: string | VNode) => {
            if (typeof childNode !== 'string' && childNode.children && childNode.children.length > 0) {
                return h(childNode.sel || '', childNode.data || null, this.retrieveNodeChildren(childNode.children, element, e));
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } else if (typeof childNode !== 'string' && childNode.data && childNode.data.props && childNode.data.props['sync'] && childNode.data.props['sync'] === target.sync) {
                // update sync value in object
                if (childNode.data.props['morph']) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    object[childNode.data.props['sync']] = (morphs as any)[childNode.data.props['morph']](target.value);
                    target.value = object[childNode.data.props['sync']]; // Update the value of the target (input) to the morphed value
                } else {
                    object[childNode.data.props['sync']] = target.value;
                }
            } else if (typeof childNode !== 'string' && childNode.data && childNode.data.props && childNode.data.props['text']) {
                // update text if it matches the sync value, or if it is a getter - always update it, or if is present in the updatedBySetters array
                if (
                    childNode.data.props['text'] === target.sync ||
                    Object.getOwnPropertyDescriptor(object, childNode.data.props['text'])?.get ||
                    (object.updatedBySetters !== undefined && object.updatedBySetters.includes(childNode.data.props['text']))
                ) {
                    return h(childNode.sel || '', childNode.data, object[childNode.data.props['text']]);
                }
            }

            return childNode;
        }) ?? [];
    }
}