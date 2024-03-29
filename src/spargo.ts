import {
    attributesModule,
    classModule,
    eventListenersModule,
    h,
    init,
    propsModule,
    styleModule,
    toVNode,
} from "snabbdom";
import {spargoElement, spargoElementObject} from "./types";
import {retrieveClasses} from "./utils";
import {Vdom} from "./vdom";

const patch = init([
    classModule,
    propsModule,
    styleModule,
    attributesModule,
    eventListenersModule,
]);

export class Spargo {
    elements: spargoElement[] = [];
    vdom: Vdom = new Vdom([], patch);

    constructor() {
        window.addEventListener("DOMContentLoaded", () => {
            this.vdom = new Vdom(this.elements, patch);

            this.initialize();
        });
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
         * window[element.getAttribute('ignite')])() - typescript
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

        const pureElement = element.cloneNode(true) as Element;

        // ? Manipulates element for the this.generateVNodes method call below
        this.vdom.iterateOverLoops(element, object);

        const node = h(
            id,
            {class: retrieveClasses(element, object)},
            this.vdom.generateVNodes(element.childNodes, object)
        );

        patch(toVNode(element), node);

        const objectProxy = new Proxy(object, {
            set: (object, key, value, proxy) => {
                if (typeof key === 'string') {
                    object[key] = value;
                }

                // ? Trigger a change to the dom for the given element
                this.vdom.updateByElement(proxy)

                return true;
            }
        });

        this.elements.push({id, vNode: node, object: objectProxy, element: pureElement});

        if (typeof objectProxy.ignited === 'function') {
            objectProxy.ignited();
        }
    }
}