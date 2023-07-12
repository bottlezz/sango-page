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

import paiKu from "../data/pai.json" assert { type: "json" };
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
      <p>[牌]</p>
    </div>
  </div>
  <div name="card-controls" class="card-controls">
  
    <button name="discard-btn"> 弃 </button>
    <button name="draw-btn"> 摸 </button>
  </div>
</div>
`;

class SgCard extends HTMLElement {
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

  discardPai() {
    this.gameController.moveCardToTableDeck(this.cardRef, "discard");
  }

  drawPai() {
    // move pai to hand
    if (this.gameController.currentPlayer) {
      this.gameController.moveCardToPlayerArea(
        this.cardRef,
        this.gameController.currentPlayer,
        "hand"
      );
    }
  }

  init(cardRef, cardData, gameController) {
    this.cardRef = cardRef;
    this.cardData = cardData;
    this.gameController = gameController;

    // pai, not jiang
    if (cardData.id[0] == "p") {
      const paiKuData = paiKu[this.cardData.id];
      const paiName = paiKuData.name;
      const paiDesc = paiKuData.desc;
      this.cardDescWidget.innerHTML = `<p>${paiName}</p><p> ${paiDesc}</p>`;
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
      this.discardPai();
    });
    drawButton.addEventListener("click", () => {
      console.log("drawing!");

      this.drawPai();
    });
  }

  disconnectedCallback() {}
}

customElements.define("sg-card", SgCard);
