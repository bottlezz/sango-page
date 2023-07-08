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

import "./sgcard.js";
import { commonStyle } from "./constants.js";
const template = document.createElement("template");
template.innerHTML = `
${commonStyle}
<div name="widget" data-display="">
  <div name="card-area"> </div>
</div>
`;

class SgArea extends HTMLElement {
  deckRef;
  shadowRoot;
  gameController;
  cardArea;
  cards = {};
  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });
    let clone = template.content.cloneNode(true);

    this.shadowRoot.append(clone);
    this.cardArea = this.shadowRoot.querySelector("div[name='card-area']");
  }

  init(deckRef, gameController) {
    this.deckRef = deckRef;
    this.gameController = gameController;

    onChildAdded(child(deckRef, "/cards"), (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();
      console.log(`on child added: ${key}`);
      console.log(value);
      const cardWc = document.createElement("sg-card");
      this.cards[key] = cardWc;
      cardWc.init(child(deckRef, "/cards/" + key), value, this.gameController);
      this.cardArea.appendChild(cardWc);
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
}

customElements.define("sg-area", SgArea);
