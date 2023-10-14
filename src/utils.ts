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
        'draggable',
        'multiple'
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
        'd',
        'x1',
        'x2',
        'y1',
        'y2',
        'selected',
        'checked'
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
 * @param object
 * @returns Classes
 */
function retrieveClasses(element: Element, object: spargoElementObject): Classes {
    const classes = element.getAttribute('class');
    const classAttr = element.getAttribute('@class');
    let customClasses, check = null;

    const classesObject: { [key: string]: boolean } = {};

    if (classAttr) {
        [check, customClasses] = classAttr.split('=>');

        if (customClasses === undefined && check === undefined) {
            throw new Error('Truth check and classes must be provided when @class is set. Please remove if not needed.');
        } else if (check && customClasses === undefined) {
            throw new Error(`Classes must be provided after the => for truth check ${check}`);
        } else if (check === undefined) {
            throw new Error('A truth check must be provided before the => in @class');
        } else {
            const [ifTrueClasses, ifFalseClasses] = customClasses.split('||');

            if (valueTruthyInObject(check.trim(), object)) {
                customClasses = ifTrueClasses;
            } else {
                customClasses = ifFalseClasses;
            }
        }
    }

    if (classes || customClasses) {
        ((classes || '') + (customClasses ? ' ' + customClasses : '')).split(' ')
            .filter((classString: string) => classString.trim() !== '')
            .forEach((classString: string) => {
                classesObject[classString] = true;
            });
    }

    return classesObject;
}

export {valueTruthyInObject, generateProps, generateAttrs, retrieveClasses};
