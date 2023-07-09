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

import paiKu from "./data/pai.json" assert { type: "json" };
import jiangKu from "./data/jiang.json" assert { type: "json" };
import { commonStyle } from "./constants.js";
const template = document.createElement("template");
template.innerHTML = `
  ${commonStyle}
  <div name="widget" data-display="">
    <div name="card-desc" class="card-front"></div>
    <div name="card-back" class="card-back"><p>[牌]</p></div>
    <div name="card-controls">
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
    this.gameController.moveToDiscardPile(this.cardRef);
  }

  drawPai() {
    // move pai to hand
    if (this.gameController.currentPlayer) {
      this.gameController.moveToPlayerArea(
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
      this.cardDescWidget.innerHTML = `<p>${paiName} ++++ ${paiDesc}</p>`;
    }

    if (cardData.id[0] == "j") {
      jiangKu;
      const jiangKuData = jiangKu[this.cardData.id];
      const paiName = jiangKuData.name;
      const paiDesc = jiangKuData.desc;
      this.cardDescWidget.innerHTML = `<p>${paiName} ++++ ${paiDesc}</p>`;
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
