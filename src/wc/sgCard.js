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
      <div class ="info-line"><span class="pai-name"></span></div>
      <div class ="info-line"><span class="pai-desc"></span></div>
    </div>
    <div class="card-back">
      <p>[牌]</p>
    </div>
  </div>
  <div name="card-controls" class="card-controls">
    <ul>
      <li name="discard-btn"> 甩 </li>
      <li name="draw-btn"> 摸 </li>
      <li name="show-btn"> 亮 </li>
      <li name="move-btn" class="expand"> 置</li>
    </ul>
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

  showPai() {
    if (this.cardData.show != "1") {
      this.gameController.showCard(this.cardRef);
    } else {
      this.gameController.resetCard(this.cardRef);
    }
  }

  init(cardRef, cardData, gameController) {
    this.cardRef = cardRef;
    this.cardData = cardData;
    this.gameController = gameController;

    this.unSub = onValue(this.cardRef, (snapshot) => {
      if (snapshot.exists()) {
        this.cardData = snapshot.val();
        this.renderCard();
      }
    });

    this.initControls();
  }

  renderCard() {
    const itemData = paiKu[this.cardData.id];
    const itemSuit = itemData.suit;
    const itemRank = itemData.rank;
    const itemDesc = itemData.desc;
    const itemName = itemData.name;

    const rankSpan = this.shadowRoot.querySelector(`span[name="pai-rank"]`);
    const descSpan = this.shadowRoot.querySelector(".pai-desc");
    const nameSpan = this.shadowRoot.querySelector(".pai-name");

    rankSpan.innerHTML = itemRank;

    rankSpan.className = itemSuit;
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

  initControls() {
    const discardButton = this.shadowRoot.querySelector(
      `li[name="discard-btn"]`
    );
    const drawButton = this.shadowRoot.querySelector(`li[name="draw-btn"]`);
    const showButton = this.shadowRoot.querySelector(`li[name="show-btn"]`);

    discardButton.addEventListener("click", () => {
      console.log("discarding!");
      this.discardPai();
    });
    drawButton.addEventListener("click", () => {
      console.log("drawing!");
      this.drawPai();
    });

    showButton.addEventListener("click", () => {
      console.log("showing!");
      this.showPai();
    });

    const moveButton = this.shadowRoot.querySelector(`li[name="move-btn"]`);
    const selfAreaHolder = document.createElement("ul");
    const selfAreas = this.getPlayerAreaLi(this.gameController.currentPlayer);
    selfAreas.forEach((liDom) => {
      selfAreaHolder.appendChild(liDom);
    });

    moveButton.append(selfAreaHolder);

    const otherPlayersButton = document.createElement("li");
    otherPlayersButton.innerHTML = "他";
    otherPlayersButton.classList.add("expand");
    otherPlayersButton.classList.add("other-target");

    selfAreaHolder.prepend(otherPlayersButton);

    const otherPlayerList = document.createElement("ul");
    otherPlayersButton.append(otherPlayerList);

    for (let i = 0; i < this.gameController.playerCount; i++) {
      const playerKey = `p${i + 1}`;
      if (playerKey == this.gameController.currentPlayer) {
        continue;
      }
      const playerAreaHolder = document.createElement("ul");
      const playerAreas = this.getPlayerAreaLi(playerKey);
      playerAreas.forEach((liDom) => {
        playerAreaHolder.appendChild(liDom);
      });

      const otherTargetButton = document.createElement("li");

      otherTargetButton.innerHTML = playerKey;
      otherTargetButton.classList.add("expand");
      otherTargetButton.append(playerAreaHolder);
      otherPlayerList.appendChild(otherTargetButton);
    }
  }

  disconnectedCallback() {
    this.unSub();
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
