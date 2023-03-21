import {Attrs, Classes, Props} from "snabbdom";
import {spargoElementObject} from "./types";

/**
 * @description Check for the truthiness of the provided value within the object.
 * @param value
 * @param object
 * @returns  boolean
 * @throws If the provided value is not found within the object
 */
function valueTruthyInObject(value: string, object: spargoElementObject): boolean {
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
 * @description Retrieves the props of the element in the format that snabbdom expects
 * @param object
 * @param element
 * @returns object
 */
function generateProps(object: object, element: Element): Props {
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
        'type',
        'max',
        'min',
        'accept',
        'accept-charset',
        'accesskey',
        'action',
        'align',
        'allow',
        'alt',
        'async',
        'autocapitalize',
        'autocomplete',
        'autofocus',
        'autoplay',
        'bgcolor',
        'buffered',
        'capture',
        'charset',
        'checked',
        'cite',
        'code',
        'codebase',
        'color',
        'cols',
        'colspan',
        'content',
        'contenteditable',
        'disabled',
        'draggable'
    ];

    const expandedObject: Props = {};

    attributes.forEach((attr: string) => {
        const elementAttr = element.getAttribute(attr);

        if (elementAttr !== null) {
            expandedObject[attr] = elementAttr || true;
        }
    });

    return {...expandedObject, ...object};
}

/**
 * @description Retrieves the attrs of the element in the format that snabbdom expects
 * @param object
 * @param element
 * @returns object
 */
function generateAttrs(object: object, element: Element): Attrs {
    const attributes = [
        'xmlns',
        'fill',
        'viewBox',
        'stroke-width',
        'stroke',
        'stroke-linecap',
        'stroke-linejoin',
        'd'
    ];

    const expandedObject: Attrs = {};

    attributes.forEach((attr: string) => {
        const elementAttr = element.getAttribute(attr);

        if (elementAttr !== null) {
            if (Number.parseFloat(elementAttr)) {
                expandedObject[attr] = Number.parseFloat(elementAttr);
            } else if (Number.parseInt(elementAttr)) {
                expandedObject[attr] = Number.parseInt(elementAttr);
            } else {
                expandedObject[attr] = elementAttr || true;
            }
        }
    });

    return {...expandedObject, ...object};
}

/**
 * @description Retrieves the classes of the element in the format that snabbdom expects
 * @param element
 * @returns Classes
 */
function retrieveClasses(element: Element): Classes {
    const classes = element.getAttribute('class');

    const classesObject: { [key: string]: boolean } = {};

    if (classes) {
        classes.split(' ')
            .filter((classString: string) => classString.trim() !== '')
            .forEach((classString: string) => {
                classesObject[classString] = true;
            });
    }

    return classesObject;
}

export {valueTruthyInObject, generateProps, generateAttrs, retrieveClasses};