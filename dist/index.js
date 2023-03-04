(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
  var __exportStar = (target, module, desc) => {
    __markAsModule(target);
    if (module && typeof module === "object" || typeof module === "function") {
      for (let key of __getOwnPropNames(module))
        if (!__hasOwnProp.call(target, key) && key !== "default")
          __defProp(target, key, {get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable});
    }
    return target;
  };
  var __toModule = (module) => {
    if (module && module.__esModule)
      return module;
    return __exportStar(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", {value: module, enumerable: true}), module);
  };

  // src/spargo.ts
  var import_nanoid = __toModule(require("nanoid"));
  var Spargo = class {
    constructor() {
      this.elements = [];
      this.initialize();
      this.updateAllText();
      this.showAll(this.elements.map((element) => element.domElement));
    }
    initialize() {
      const elements = document.querySelectorAll("[ignite]");
      elements.forEach((element) => {
        this.createElement(element);
      });
      this.hideAll(elements);
    }
    hideAll(elements) {
      elements.forEach((element) => {
        element.setAttribute("hidden", "true");
      });
    }
    showAll(elements) {
      elements.forEach((element) => {
        element.removeAttribute("hidden");
      });
    }
    createElement(element) {
      if (element.getAttribute("spargo-id")) {
        return;
      }
      const id = import_nanoid.nanoid();
      element.setAttribute("spargo-id", id);
      const object = window[element.getAttribute("ignite")]();
      this.elements.push({id, domElement: element, object});
      this.attachListeners(element, id);
      object.ignited();
    }
    attachListeners(element, id) {
      const index = this.elements.findIndex((element2) => element2.id === id);
      Array.from(element.children).forEach((childNode) => {
        const sync = childNode.getAttribute("@sync");
        if (childNode.nodeName === "INPUT" && sync) {
          childNode.setAttribute("value", this.elements[index].object[sync]);
          childNode.addEventListener("input", (event) => {
            this.updateObject(id, index, sync, event.target?.value);
          });
        }
      });
    }
    updateObject(id, index, sync, value) {
      this.elements[index].object[sync] = value;
      this.updateTextById(id);
    }
    updateAllText() {
      this.elements.forEach((element) => {
        this.updateElementText(element);
      });
    }
    updateTextById(id) {
      const index = this.elements.findIndex((element2) => element2.id === id);
      const element = this.elements[index];
      this.updateElementText(element);
    }
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
