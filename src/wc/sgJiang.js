import {
  child,
  getDatabase,
  get,
  update,
  set,
  ref,
  remove,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
} from "firebase/database";

import jiangKu from "../data/jiang.json" assert { type: "json" };
import cardCss from "./css/SgCard.css";
import commonCss from "./css/common.css";
const template = document.createElement("template");
const css = `
${commonCss}
${cardCss} 
`;
template.innerHTML = `
<style>
${css}
</style>
<div name="widget" class="card-block">
  <div class="card-widget">
    <div class="card-front">
      <div name="card-desc"></div>
    </div>
    <div class="card-back">
      <p>[将]</p>
    </div>
  </div>
  <div name="card-controls" class="card-controls">
  
    <button name="discard-btn"> 弃 </button>
    <button name="draw-btn"> 摸 </button>
  </div>
</div>
`;
class SgJiang extends HTMLElement {
  cardRef;
  cardData;
  shadowRoot;
  gameController;
  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });
    let clone = template.content.cloneNode(true);

    this.shadowRoot.append(clone);
    this.cardDescWidget = this.shadowRoot.querySelector(
      "div[name='card-desc']"
    );
    this.cardControlWidget = this.shadowRoot.querySelector(
      `div[name="card-controls"]`
    );
  }

  discardJiang() {
    this.gameController.moveCardToTableDeck(this.cardRef, "jiang");
  }

  drawJiang() {
    // move pai to hand
    if (this.gameController.currentPlayer) {
      this.gameController.moveCardToPlayerArea(
        this.cardRef,
        this.gameController.currentPlayer,
        "jiang"
      );
    }
  }

  init(cardRef, cardData, gameController) {
    this.cardRef = cardRef;
    this.cardData = cardData;
    this.gameController = gameController;

    //  jiang
    if (cardData.id[0] == "j") {
      const itemData = jiangKu[this.cardData.id];
      const itemName = itemData.name;
      const itemDesc = itemData.desc;
      this.cardDescWidget.innerHTML = `<p>${itemName} ++++ ${itemDesc}</p>`;
    }

    this.initControls();
  }

  initControls() {
    const discardButton = this.shadowRoot.querySelector(
      `button[name="discard-btn"]`
    );
    const drawButton = this.shadowRoot.querySelector(`button[name="draw-btn"]`);

    discardButton.addEventListener("click", () => {
      console.log("discarding!");
      this.discardJiang();
    });
    drawButton.addEventListener("click", () => {
      console.log("drawing!");

      this.drawJiang();
    });
  }

  disconnectedCallback() {}
}

customElements.define("sg-jiang", SgJiang);
