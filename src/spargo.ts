import {
    init,
    classModule,
    propsModule,
    styleModule, // TODO: Must implement
    eventListenersModule,
    h,
    toVNode,
} from "snabbdom";
import { spargoElement, spargoElementObject } from "./types";
import { retrieveClasses } from "./utils";
import { Vdom } from "./vdom";

const patch = init([
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
]);

export class Spargo {
    elements: spargoElement[] = [];
    vdom: Vdom;

    constructor() {
        this.vdom = new Vdom(this.elements, patch);

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
     * @throws Error if the provided element does not have an associated method
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

        if (typeof object.spark === 'function') {
            object.spark();
        }

        if (!object) {
            throw new Error(`${element.getAttribute('ignite')} does not exist as a method on the page.`);
        }

        const id = `spargo-${crypto.randomUUID()}`;

        const pureElement = element.cloneNode(true) as Element;

        this.vdom.iterateOverLoops(element, object); // ? Manipulates element for the this.generateVNodes method call below

        const node = h(id, { class: retrieveClasses(element) }, this.vdom.generateVNodes(element.childNodes, object));

        patch(toVNode(element), node);

        this.elements.push({ id, vNode: node, object, element: pureElement });

        if (typeof object.ignited === 'function') {
            object.ignited();
        }
    }
}