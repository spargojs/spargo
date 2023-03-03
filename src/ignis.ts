import { nanoid } from 'nanoid';

type ignisNode = {
    id: string,
    element: Element,
    childNodes: { type: string, textContent: string|null }[],
    object: Object,
    render: { original: string }
}

export class Ignis {
    nodes: ignisNode[] = [];

    constructor() {
        this.initialize();

        this.updateAllValues();

        // Create listener for popstate to re-initialize
    }

    initialize() {
        const nodes = document.querySelectorAll('[ignite]');

        // triage this.nodes against const nodes above???

        // this.nodes = this.nodes.filter((node) => Array.from(nodes).some((_node) => node?.element == _node));

        nodes.forEach((node) => {
            this.createNode(node);
        });
    }

    createNode(node: Element) {
        // if already exists, ignore
        if (node.getAttribute('ignis-id')) {
            return;
        }

        // if doesn't exist:

        // attach unique id
        const id = nanoid();

        node.setAttribute('ignis-id', id);

        // grab associated object
        /**
         * node.getAttribute('ignite') - implicitly any
         * window[node.getAttribute('ignite')])() - typscript
         * isn't aware this is a method
         */
        // @ts-ignore:next-line
        const object: any = (window[node.getAttribute('ignite')])();

        // push into this.nodes
        this.nodes.push({ id, element: node, childNodes: Array.from(node.childNodes).map((childNode) => { return { type: childNode.nodeName, textContent: childNode.textContent } }), object, render: { original: node.innerHTML } });

        // attach listeners
        this.attachListeners(node, id);

        // run ignited method
        object.ignited();
    }

    attachListeners(node: Element, id: string) {
        const index = this.nodes.findIndex(node => node.id === id);

        Array.from(node.children).forEach((childNode: Element) => {
            const sync = childNode.getAttribute('@sync');

            if (childNode.nodeName === 'INPUT' && sync) {
                childNode.setAttribute('value', (this.nodes[index] as any).object[sync]);

                childNode.addEventListener('input', (event: any) => {
                    this.updateObject(id, index, sync, event.target?.value);
                });
            }
        });
    }

    updateObject(id: string, index: number, sync: string, value: string) {
        (this.nodes[index] as any).object[sync] = value;

        this.updateValues(id);
    }

    updateAllValues() {
        this.nodes.forEach((node) => {
            this.updateNodeValue(node);
        });
    }

    updateValues(id: string) {
        const index = this.nodes.findIndex(node => node.id === id);

        const node = this.nodes[index];

        this.updateNodeValue(node);
    }

    updateNodeValue(node: ignisNode) {
        const childrenToUpdate = Array.from(node.element.childNodes);

        node.childNodes.forEach((childNode: { type: string, textContent: string|null }, index: number) => {
            if (childNode.type === '#text') {
                const valuesToReplace = childNode.textContent?.match(/\{{([^{}]+)\}}/mg);

                valuesToReplace?.forEach((value: any) => {
                    childrenToUpdate[index].textContent = childNode.textContent?.replaceAll(value, (node as any).object[value.replace(/[{}\s]/mg, '') as any]) as any;
                });
            }
        });
    }
}