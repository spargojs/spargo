declare module 'spargojs/index' {
  export {};
  //# sourceMappingURL=index.d.ts.map
}
declare module 'spargojs/index.d.ts' {
  {"version":3,"file":"index.d.ts","sourceRoot":"","sources":["../../../home/justin/Projects/spargo/src/index.ts"],"names":[],"mappings":""}
}
declare module 'spargojs/spargo' {
  type spargoElement = {
      id: string;
      domElement: Element;
      object: Object;
  };
  export class Spargo {
      elements: spargoElement[];
      constructor();
      /**
       * @returns void
       */
      initialize(): void;
      /**
       * We will hide all the elements until they are fully initialized
       *
       * @param elements
       * @returns void
       */
      hideAll(elements: NodeListOf<Element>): void;
      /**
       * We will show all the elements when they are fully initialized
       *
       * @param elements
       */
      showAll(elements: Element[]): void;
      /**
       * We will create a new element after we find it
       *
       * @param element
       * @returns void
       */
      createElement(element: Element): void;
      /**
       * Attach a listener to all the appropriate child nodes
       *
       * @param element
       * @param id
       * @returns void
       */
      attachListeners(element: Element, id: string): void;
      /**
       * We have to update the state for the given element whenever an appropriate event occurs
       *
       * @param id
       * @param index
       * @param sync
       * @param value
       * @returns void
       */
      updateObject(id: string, index: number, sync: string, value: string): void;
      /**
       * Update all the synced text on the screen
       *
       * @returns void
       */
      updateAllText(): void;
      /**
       * We will update the synced text of the given elements id
       *
       * @param id
       * @returns void
       */
      updateTextById(id: string): void;
      /**
       * We will update the synced text of the given element
       *
       * @param element
       * @returns void
       */
      updateElementText(element: spargoElement): void;
  }
  export {};
  //# sourceMappingURL=spargo.d.ts.map
}
declare module 'spargojs/spargo.d.ts' {
  {"version":3,"file":"spargo.d.ts","sourceRoot":"","sources":["../../../home/justin/Projects/spargo/src/spargo.ts"],"names":[],"mappings":"AAAA,KAAK,aAAa,GAAG;IACjB,EAAE,EAAE,MAAM,CAAC;IACX,UAAU,EAAE,OAAO,CAAC;IACpB,MAAM,EAAE,MAAM,CAAA;CACjB,CAAA;AAED,qBAAa,MAAM;IACf,QAAQ,EAAE,aAAa,EAAE,CAAM;;IAY/B;;OAEG;IACH,UAAU,IAAI,IAAI;IAalB;;;;;OAKG;IACH,OAAO,CAAC,QAAQ,EAAE,UAAU,CAAC,OAAO,CAAC,GAAG,IAAI;IAM5C;;;;OAIG;IACH,OAAO,CAAC,QAAQ,EAAE,OAAO,EAAE,GAAG,IAAI;IAMlC;;;;;OAKG;IACH,aAAa,CAAC,OAAO,EAAE,OAAO,GAAG,IAAI;IAgCrC;;;;;;OAMG;IACH,eAAe,CAAC,OAAO,EAAE,OAAO,EAAE,EAAE,EAAE,MAAM,GAAG,IAAI;IA2BnD;;;;;;;;OAQG;IACH,YAAY,CAAC,EAAE,EAAE,MAAM,EAAE,KAAK,EAAE,MAAM,EAAE,IAAI,EAAE,MAAM,EAAE,KAAK,EAAE,MAAM,GAAG,IAAI;IAY1E;;;;OAIG;IACH,aAAa,IAAI,IAAI;IAMrB;;;;;OAKG;IACH,cAAc,CAAC,EAAE,EAAE,MAAM,GAAG,IAAI;IAQhC;;;;;OAKG;IACH,iBAAiB,CAAC,OAAO,EAAE,aAAa,GAAG,IAAI;CAsBlD"}
}
declare module 'spargojs' {
  import main = require('spargojs/src/index');
  export = main;
}