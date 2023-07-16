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
import cardCss from "./css/sgCard.css";
import commonCss from "./css/common.css";
import jiangCss from "./css/sgJiang.css";

const template = document.createElement("template");
const css = `
${commonCss}
${cardCss} 
${jiangCss}
`;
template.innerHTML = `
<style>
${css}
</style>
<div name="widget" class="card-block">
  <div class="card-widget">
    <div class="card-front">
      <div class="jiang-desc">
      <div class="info-line">
        <span class="jiang-name"></span>
        <span class="jiang-gender"></span>
      </div>
      <div class="info-line">
        <span class="jiang-force"></span>
        <span class="jiang-hp"></span>
      </div>
      </div>
      <div class="skill-hint">
        <div><span class="skill-label">-- 武将技 --</span></div>
        <div class="jiang-skill"></div>
      </div>
    
    </div>
    <div class="card-back">
      <p>[将]</p>
    </div>
  </div>
  <div name="card-controls" class="card-controls">
  
    <button name="discard-btn"> 弃 </button>
    <button name="draw-btn"> 摸 </button>
    <button name="show-btn"> 亮 </button>
  </div>
</div>
`;
class SgJiang extends HTMLElement {
  cardRef;
  cardData;
  shadowRoot;
  gameController;
  unSub;
  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });
    let clone = template.content.cloneNode(true);

    this.shadowRoot.append(clone);
    this.cardDescWidget = this.shadowRoot.querySelector(
      "div[name='jiang-desc']"
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

  showJiang() {
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
    const jiang = jiangKu[this.cardData.id];
    const genderSpan = this.shadowRoot.querySelector(".jiang-gender");
    const nameSpan = this.shadowRoot.querySelector(".jiang-name");
    const hpSpan = this.shadowRoot.querySelector(".jiang-hp");
    const forceSpan = this.shadowRoot.querySelector(".jiang-force");

    nameSpan.innerHTML = jiang.name;
    hpSpan.innerHTML = jiang.health + "HP";
    forceSpan.innerHTML = jiang.force;
    if (jiang.gender == "M") {
      genderSpan.innerHTML = "&#9794;";
    } else {
      genderSpan.innerHTML = "&#9792;";
    }
    const skill = jiang.skill.replaceAll("/", "<br><br>");
    this.shadowRoot.querySelector(".jiang-skill").innerHTML = skill;

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
      `button[name="discard-btn"]`
    );
    const drawButton = this.shadowRoot.querySelector(`button[name="draw-btn"]`);
    const showButton = this.shadowRoot.querySelector(`button[name="show-btn"]`);

    discardButton.addEventListener("click", () => {
      console.log("discarding!");
      this.discardJiang();
    });
    drawButton.addEventListener("click", () => {
      console.log("drawing!");
      this.drawJiang();
    });

    showButton.addEventListener("click", () => {
      console.log("showing!");
      this.showJiang();
    });
  }

  disconnectedCallback() {
    this.unSub();
  }
}

customElements.define("sg-jiang", SgJiang);
