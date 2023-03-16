import { Classes } from "snabbdom";
import { spargoElementObject } from "./types";

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
function generateProps(object: object, element: Element): object {
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
function retrieveClasses(element: Element): Classes {
    const classes = element.getAttribute('class');

    const classesObject: { [key: string]: boolean } = {};

    if (classes) {
        classes.split(' ').forEach((classString: string) => {
            classesObject[classString] = true;
        });
    }

    return classesObject;
}

export { valueTruthyInObject, generateProps, retrieveClasses };