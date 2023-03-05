"use strict";
(() => {
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });

  // src/spargo.ts
  var import_nanoid = __require("nanoid");
  var Spargo = class {
    constructor() {
      this.elements = [];
      this.initialize();
      this.updateAllText();
      this.showAll(this.elements.map((element) => element.domElement));
    }
    /**
     * @returns void
     */
    initialize() {
      const elements = document.querySelectorAll("[ignite]");
      elements.forEach((element) => {
        this.createElement(element);
      });
      this.hideAll(elements);
    }
    /**
     * We will hide all the elements until they are fully initialized
     * 
     * @param elements 
     * @returns void
     */
    hideAll(elements) {
      elements.forEach((element) => {
        element.setAttribute("hidden", "true");
      });
    }
    /**
     * We will show all the elements when they are fully initialized
     * 
     * @param elements 
     */
    showAll(elements) {
      elements.forEach((element) => {
        element.removeAttribute("hidden");
      });
    }
    /**
     * We will create a new element after we find it
     * 
     * @param element 
     * @returns void
     */
    createElement(element) {
      if (element.getAttribute("spargo-id")) {
        return;
      }
      const id = (0, import_nanoid.nanoid)();
      element.setAttribute("spargo-id", id);
      const object = window[element.getAttribute("ignite")]();
      this.elements.push({ id, domElement: element, object });
      this.attachListeners(element, id);
      object.ignited();
    }
    /**
     * Attach a listener to all the appropriate child nodes
     * 
     * @param element 
     * @param id 
     * @returns void
     */
    attachListeners(element, id) {
      const index = this.elements.findIndex((element2) => element2.id === id);
      Array.from(element.children).forEach((childNode) => {
        const sync = childNode.getAttribute("@sync");
        if (childNode.nodeName === "INPUT" && sync) {
          childNode.setAttribute("value", this.elements[index].object[sync]);
          childNode.addEventListener("input", (event) => {
            var _a;
            this.updateObject(id, index, sync, (_a = event.target) == null ? void 0 : _a.value);
          });
        }
      });
    }
    /**
     * We have to update the state for the given element whenever an appropriate event occurs
     * 
     * @param id 
     * @param index 
     * @param sync 
     * @param value 
     * @returns void
     */
    updateObject(id, index, sync, value) {
      this.elements[index].object[sync] = value;
      this.updateTextById(id);
    }
    /**
     * Update all the synced text on the screen
     * 
     * @returns void
     */
    updateAllText() {
      this.elements.forEach((element) => {
        this.updateElementText(element);
      });
    }
    /**
     * We will update the synced text of the given elements id
     * 
     * @param id 
     * @returns void
     */
    updateTextById(id) {
      const index = this.elements.findIndex((element2) => element2.id === id);
      const element = this.elements[index];
      this.updateElementText(element);
    }
    /**
     * We will update the synced text of the given element
     * 
     * @param element 
     * @returns void
     */
    updateElementText(element) {
      element.domElement.childNodes.forEach((childNode) => {
        const attributes = childNode.attributes;
        if (attributes) {
          let containsSync = Array.from(attributes).find((attribute) => attribute.name === "@text");
          if (containsSync) {
            childNode.textContent = element.object[containsSync.textContent];
          }
        }
      });
    }
  };
})();
