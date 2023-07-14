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
import cardCss from "./css/sgCard.css";
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
      <div style="font-size: 1.5em;"><span name="pai-rank"></span></div>
      <div class =".info-line"><span class="pai-desc"></span></div>
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
    this.cardFront = this.shadowRoot.querySelector(
      "div[name='card-front']"
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

    onValue(this.cardRef, (snapshot) => {
      if (snapshot.exists()) {
        this.cardData = snapshot.val();
        this.refreshCard();
      }
    });

    this.initControls();
  }

  refreshCard() {
    const itemData = paiKu[this.cardData.id];
    const itemSuit= itemData.suit;
    const itemRank = itemData.rank;
    const itemDesc = itemData.desc;

    const rankSpan = this.shadowRoot.querySelector(`span[name="pai-rank"]`);
    const descSpan = this.shadowRoot.querySelector(".pai-desc");

    rankSpan.innerHTML = itemRank;
    descSpan.innerHTML = itemDesc;
    rankSpan.className = itemSuit;


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
