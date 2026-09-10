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
  <div class="card-widget" part="card-widget">
    <div class="card-front" part="card-front">
      <div class="card-suit"><span class="suit-mark" aria-hidden="true"></span><span name="pai-rank"></span><span class="pai-desc"></span></div>
      <div class ="info-line"><span class="pai-name"></span></div>
    </div>
    <div class="card-back" part="card-back"></div>
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
    this.cardFront = this.shadowRoot.querySelector("div[name='card-front']");
    this.cardControlWidget = this.shadowRoot.querySelector(
      `div[name="card-controls"]`
    );
  }

  discardPai() {
    return this.gameController.moveCardToTableDeck(this.cardRef, "discard");
  }

  drawPai() {
    // move pai to hand
    if (this.gameController.currentPlayer) {
      return this.gameController.moveCardToPlayerArea(
        this.cardRef,
        this.gameController.currentPlayer,
        "hand"
      );
    }
  }

  showPai() {
    console.log("showPai");
    return this.gameController.showSelectedCards([this]);
  }

  init(cardRef, cardData, gameController, options = {}) {
    this.cardRef = cardRef;
    this.cardData = cardData;
    this.gameController = gameController;

    if (options.subscribe !== false) {
      this.unSub = onValue(this.cardRef, (snapshot) => {
        if (snapshot.exists()) {
          this.cardData = snapshot.val();
          this.renderCard();
        }
      });
    }

    const cardPathUrl = this.cardRef.toString();
    const dbPathUrl = ref(this.gameController.db).toString();
    const cardPath = cardPathUrl.replace(dbPathUrl, "");
    this.dataset.path = cardPath;
    this.setAttribute("draggable", "false");
    this.addEventListener("dragstart", (e) => {
      // Pointer drag is implemented by cardDrag.js; never fall back to native text/card dragging.
      e.preventDefault();
    });
    // this.addEventListener("touchstart", (e) => {
    //   console.log("touch");
    // });
    this.addEventListener("touchmove", (e) => {
      console.log("touchmoveCard");
    });
    this.initControls();
  }

  renderCard() {
    const itemData = paiKu[this.cardData.id];
    const itemSuit = itemData.suit;
    const itemRank = itemData.rank;
    const itemDesc = itemData.desc;
    const itemName = itemData.name;
    this.classList.toggle("has-desc", Boolean(itemDesc));
    const judgmentEffects = {
      "乐不思蜀": "乐",
      "兵粮寸断": "兵",
      "闪电": "电",
    };
    const effect = this.cardData.judgmentEffect || itemName;
    this.dataset.effect = judgmentEffects[effect] || '?';
    if (this.dataset.path?.includes('/pan/cards/')) this.title = `${effect} · 原牌：${itemName}`;

    const rankSpan = this.shadowRoot.querySelector(`span[name="pai-rank"]`);
    const descSpan = this.shadowRoot.querySelector(".pai-desc");
    const nameSpan = this.shadowRoot.querySelector(".pai-name");
    const suitColumn = this.shadowRoot.querySelector(".card-suit");

    rankSpan.textContent = itemRank;
    suitColumn.className = `card-suit ${itemSuit}`;
    nameSpan.innerHTML = itemName;
    if (itemDesc) {
      descSpan.innerHTML = itemDesc;
    } else {
      descSpan.innerHTML = "<wbr>";
    }

    if (this.cardData.show == "1") {
      this.shadowRoot.querySelector(".card-block").classList.add("show-front");
    } else if (this.cardData.show == "0") {
      this.shadowRoot
        .querySelector(".card-block")
        .classList.remove("show-front");
    }
  }

  selectCard() {
    const cardBlock = this.shadowRoot.querySelector(".card-block");
    this.gameController.addSelectedCard(this);
    if (!cardBlock.classList.contains("selected")) {
      cardBlock.classList.add("selected");
    }
  }
  unselectCard() {
    const cardBlock = this.shadowRoot.querySelector(".card-block");
    cardBlock.classList.remove("selected");
    this.gameController.removeSelectedCard(this);
  }

  initControls() {
    const cardBlock = this.shadowRoot.querySelector(".card-block");

    cardBlock.addEventListener("click", (e) => {
      // const rect = e.target.getBoundingClientRect();
      // const x = e.clientX - rect.left; //x position within the element.
      // const y = e.clientY - rect.top; //y position within the element.
      if (cardBlock.classList.contains("selected")) {
        this.unselectCard();
        // if (y < rect.height / 2) {
        //   console.log("click top");
        // } else {
        //   console.log("click bot");
        // }
      } else {
        this.selectCard();
      }
      // console.log("Left? : " + x + " ; Top? : " + y + ".");
    });
  }

  disconnectedCallback() {
    queueMicrotask(() => {
      if (this.isConnected) return;
      this.gameController.removeSelectedCard(this);
      this.unSub?.();
      this.unSub = null;
    });
  }

  getPlayerAreaLi(playerKey) {
    const zhuang = document.createElement("li");
    zhuang.innerHTML = "装";
    zhuang.dataset.path =
      this.gameController.getPlayerPath(playerKey) + "/zhuang";
    zhuang.addEventListener("click", () => {
      this.gameController.moveCardToPlayerArea(
        this.cardRef,
        playerKey,
        "zhuang"
      );
    });

    const pan = document.createElement("li");
    pan.innerHTML = "判";
    pan.dataset.path = this.gameController.getPlayerPath(playerKey) + "/pan";
    pan.addEventListener("click", () => {
      this.gameController.moveCardToPlayerArea(this.cardRef, playerKey, "pan");
    });

    const other1 = document.createElement("li");
    other1.innerHTML = "区1";
    other1.dataset.path =
      this.gameController.getPlayerPath(playerKey) + "/other1";
    other1.addEventListener("click", () => {
      this.gameController.moveCardToPlayerArea(
        this.cardRef,
        playerKey,
        "other1"
      );
    });

    const other2 = document.createElement("li");
    other2.innerHTML = "区2";
    other2.dataset.path =
      this.gameController.getPlayerPath(playerKey) + "/other2";
    other2.addEventListener("click", () => {
      this.gameController.moveCardToPlayerArea(
        this.cardRef,
        playerKey,
        "other2"
      );
    });
    return [zhuang, pan, other1, other2];
  }
}

customElements.define("sg-card", SgCard);
