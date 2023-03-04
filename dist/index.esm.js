// src/spargo.ts
import {nanoid} from "nanoid";
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
    const id = nanoid();
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
export {
  Spargo
};
