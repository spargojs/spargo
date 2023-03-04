var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};
var __exportStar = (target, module2, desc) => {
  __markAsModule(target);
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  if (module2 && module2.__esModule)
    return module2;
  return __exportStar(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", {value: module2, enumerable: true}), module2);
};

// src/index.ts
__export(exports, {
  Spargo: () => Spargo
});

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
          var _a;
          this.updateObject(id, index, sync, (_a = event.target) == null ? void 0 : _a.value);
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
