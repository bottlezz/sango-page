import {
  child,
  getDatabase,
  get,
  update,
  set,
  ref,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
} from "firebase/database";

import "./sgCard.js";
import commonCss from "./css/common.css";
// const template = document.createElement("template");
// template.innerHTML = `
// <style>
// ${commonCss}
// </style>
// <div name="widget" class="widget">
//   <div name="card-area"> </div>
// </div>
// `;

class SgArea extends HTMLElement {
  deckRef;
  shadowRoot;
  gameController;
  style;
  areaType;
  cardArea;
  widget;
  cards = {};

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });

    this.style = document.createElement("style");
    this.style.appendChild(document.createTextNode(commonCss));

    this.widget = document.createElement("div");
    this.widget.setAttribute("name", "widget");

    this.cardArea = document.createElement("div");
    this.cardArea.classList.add("widget");
    this.cardArea.setAttribute("name", "card-area");

    this.widget.append(this.cardArea);

    this.shadowRoot.append(this.style);
    this.shadowRoot.append(this.widget);
  }

  init(deckRef, gameController) {
    this.deckRef = deckRef;
    this.areaType = deckRef.key + "-area";
    this.gameController = gameController;

    this.widget.classList.add(this.areaType);

    onChildAdded(child(deckRef, "/cards"), (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();
      console.log(`on child added: ${key}`);
      console.log(value);
      const cardWc = document.createElement("sg-card");
      this.cards[key] = cardWc;
      cardWc.init(child(deckRef, "/cards/" + key), value, this.gameController);
      this.cardArea.prepend(cardWc);
    });
    onChildChanged(child(deckRef, "/cards"), (snapshot) => {
      console.log(`on child changed: ${snapshot.key}`);
      console.log(snapshot.val());
    });
    onChildRemoved(child(deckRef, "/cards"), (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();
      console.log(`on child removed: ${key}`);
      console.log(value);
      const cardWc = this.cards[key];
      this.cardArea.removeChild(cardWc);
    });
  }

  shuffle() {}
}

export { SgArea };
customElements.define("sg-area", SgArea);
