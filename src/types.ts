import { VNode } from "snabbdom";

type ignited = () => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type spargoElementObject = { [key: string]: any, ignited?: ignited };

type spargoElement = {
    id: string,
    element: Element,
    vNode: VNode,
    object: spargoElementObject
}

export { ignited, spargoElementObject, spargoElement };