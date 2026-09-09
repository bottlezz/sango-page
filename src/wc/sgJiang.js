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
import commonCss from "./css/common.css";
import jiangCss from "./css/sgJiang.css";

const template = document.createElement("template");
const css = `
${commonCss}
${jiangCss}
`;
template.innerHTML = `
<style>
${css}
</style>
<div class="card-block">
  <div class="card-front">
    <div class="jiang-desc">
      <img class="general-art" alt="" />
      <span class="faction-badge"></span>
      <div class="info-line">
        <span class="jiang-name"></span>
        <span class="jiang-gender"></span>
      </div>
    </div>
  </div>
  <div class="card-back">
    <p>将</p>
  </div>
  <button class="show-ctrl" name="show-btn" type="button" title="亮将">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.7"/></svg>
    <span class="sr-only">亮将</span>
  </button>
  <button class="select-ctrl" name="select-btn" type="button">选择</button>
  <button class="detail-ctrl" name="detail-btn" type="button" aria-label="查看武将技能">查看技能</button>
</div>
<dialog class="general-detail" aria-label="武将详情">
  <article>
    <header>
      <div class="detail-title">
        <span class="detail-force"></span>
        <h3 class="detail-name"></h3>
        <span class="detail-gender"></span>
      </div>
      <button class="detail-close" type="button" aria-label="关闭武将详情">×</button>
    </header>
    <div class="detail-body">
      <img class="detail-art" alt="" />
      <div class="detail-content">
        <dl>
          <div><dt>势力</dt><dd class="detail-force-text"></dd></div>
          <div><dt>体力</dt><dd class="detail-hp"></dd></div>
          <div><dt>性别</dt><dd class="detail-gender-text"></dd></div>
        </dl>
        <section class="detail-skills">
          <h4>技能</h4>
          <div class="detail-skill-list"></div>
        </section>
      </div>
    </div>
  </article>
</dialog>
`;
class SgJiang extends HTMLElement {
  cardRef;
  cardData;
  shadowRoot;
  gameController;
  unSub;
  generalLocked = false;
  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });
    let clone = template.content.cloneNode(true);

    this.shadowRoot.append(clone);
    this.cardDescWidget = this.shadowRoot.querySelector(
      "div[name='jiang-desc']"
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

    const cardPathUrl = this.cardRef.toString();
    const dbPathUrl = ref(this.gameController.db).toString();
    const cardPath = cardPathUrl.replace(dbPathUrl, "");
    this.dataset.path = cardPath;
    this.setAttribute("draggable", "true");
    this.addEventListener("dragstart", (e) => {
      console.log("draggggggg");
      e.dataTransfer.setData("text", cardPath);
    });

    this.initControls();
  }

  renderCard() {
    const jiang = jiangKu[this.cardData.id];
    const genderSpan = this.shadowRoot.querySelector(".jiang-gender");
    const nameSpan = this.shadowRoot.querySelector(".jiang-name");
    const frontDiv = this.shadowRoot.querySelector(".card-front");
    const generalArt = this.shadowRoot.querySelector(".general-art");
    generalArt.src = new URL(`imgs/${this.cardData.id}.jpg`, document.baseURI).href;
    generalArt.alt = jiang.name;
    const factionBadge = this.shadowRoot.querySelector(".faction-badge");
    factionBadge.textContent = jiang.force;
    factionBadge.setAttribute("aria-label", `${jiang.force}阵营`);

    nameSpan.innerHTML = jiang.name;
    const isMale = jiang.gender == "M";
    const genderSymbol = isMale ? "♂" : "♀";
    const genderText = isMale ? "男" : "女";
    genderSpan.textContent = genderSymbol;

    switch (jiang.force) {
      case "魏":
        frontDiv.className = "card-front wei";
        break;
      case "蜀":
        frontDiv.className = "card-front shu";
        break;
      case "吴":
        frontDiv.className = "card-front wu";
        break;
      default:
        frontDiv.className = "card-front qun";
        break;
    }

    const detailDialog = this.shadowRoot.querySelector(".general-detail");
    detailDialog.className = `general-detail ${frontDiv.classList[1] || "qun"}`;
    this.shadowRoot.querySelector(".detail-force").textContent = jiang.force;
    this.shadowRoot.querySelector(".detail-force-text").textContent = jiang.force;
    this.shadowRoot.querySelector(".detail-name").textContent = jiang.name;
    this.shadowRoot.querySelector(".detail-gender").textContent = genderSymbol;
    this.shadowRoot.querySelector(".detail-gender-text").textContent =
      `${genderText} ${genderSymbol}`;
    this.shadowRoot.querySelector(".detail-hp").textContent = `${jiang.health} 点`;
    const detailArt = this.shadowRoot.querySelector(".detail-art");
    detailArt.src = generalArt.src;
    detailArt.alt = jiang.name;

    const skillList = this.shadowRoot.querySelector(".detail-skill-list");
    skillList.innerHTML = "";
    (jiang.skill || "暂无技能说明").split("/").forEach((skill) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = skill.trim();
      skillList.appendChild(paragraph);
    });

    frontDiv.tabIndex = 0;
    frontDiv.setAttribute("role", "button");
    frontDiv.setAttribute("aria-label", `查看${jiang.name}的武将详情`);

    if (this.cardData.show == "1") {
      this.shadowRoot.querySelector(".card-block").classList.add("show-front");
    } else if (this.cardData.show == "0") {
      this.shadowRoot
        .querySelector(".card-block")
        .classList.remove("show-front");
    }
    const showButton = this.shadowRoot.querySelector(
      `button[name="show-btn"]`
    );
    const revealed = this.cardData.show == "1";
    showButton.classList.toggle("revealed", revealed);
    showButton.title = revealed ? "暗置" : "亮将";
    showButton.querySelector(".sr-only").textContent = revealed ? "暗置" : "亮将";
    showButton.setAttribute(
      "aria-label",
      revealed ? "将此武将暗置" : "亮将给其他玩家查看"
    );
  }

  initControls() {
    const cardFront = this.shadowRoot.querySelector(".card-front");
    cardFront.addEventListener("click", () => {
      if (this.classList.contains("selection-card")) {
        this.dispatchEvent(new CustomEvent("select-general", { bubbles: true, composed: true }));
      } else this.openDetails();
    });
    cardFront.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (this.classList.contains("selection-card")) {
          this.dispatchEvent(new CustomEvent("select-general", { bubbles: true, composed: true }));
        } else this.openDetails();
      }
    });
    this.shadowRoot
      .querySelector(".detail-close")
      .addEventListener("click", () => this.closeDetails());
    this.shadowRoot
      .querySelector(".general-detail")
      .addEventListener("click", (event) => {
        if (event.target === event.currentTarget) this.closeDetails();
      });
    const showButton = this.shadowRoot.querySelector(`button[name="show-btn"]`);
    showButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.showJiang();
    });
    this.shadowRoot
      .querySelector(`button[name="select-btn"]`)
      .addEventListener("click", (event) => {
        event.stopPropagation();
        this.dispatchEvent(
          new CustomEvent("select-general", { bubbles: true, composed: true })
        );
      });
    this.shadowRoot
      .querySelector(`button[name="detail-btn"]`)
      .addEventListener("click", (event) => {
        event.stopPropagation();
        this.openDetails();
      });
  }

  openDetails() {
    const dialog = this.shadowRoot.querySelector(".general-detail");
    if (!dialog.open) dialog.showModal();
  }

  closeDetails() {
    const dialog = this.shadowRoot.querySelector(".general-detail");
    if (dialog.open) dialog.close();
  }

  setSelectedForLockIn(selected, position = "") {
    const block = this.shadowRoot.querySelector(".card-block");
    block.classList.toggle("selected-general", selected);
    block.dataset.selectionLabel = selected ? position : "";
    this.shadowRoot.querySelector(`button[name="select-btn"]`).textContent =
      selected ? "取消" : "选择";
  }

  setGeneralLocked(locked) {
    this.generalLocked = locked;
    this.setAttribute(
      "draggable",
      locked || this.classList.contains("selection-card") ? "false" : "true"
    );
    const selectButton = this.shadowRoot.querySelector(
      `button[name="select-btn"]`
    );
    selectButton.disabled = locked;
    if (locked) selectButton.textContent = "已锁定";
  }

  disconnectedCallback() {
    this.unSub();
  }
}

customElements.define("sg-jiang", SgJiang);
