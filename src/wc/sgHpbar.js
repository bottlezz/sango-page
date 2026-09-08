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

import commonCss from "./css/common.css";
import hpbarCss from "./css/sgHpbar.css";
const template = document.createElement("template");
template.innerHTML = `
<style>
${hpbarCss}
${commonCss}
</style>
<dialog class="max-hp-picker" aria-label="选择体力上限">
  <div class="picker-heading">
    <strong>选择体力上限</strong>
    <button class="picker-close" title="关闭" aria-label="关闭">×</button>
  </div>
  <div class="picker-grid"></div>
</dialog>
<button class="cur-hp-btn reduce-hp-btn" title="失去一点体力" aria-label="失去一点体力">−</button>
<span class="hp-bar">
  <span>[心]</span>
  <span>[心]</span>
  <span>[ ]</span>
  <span>[ ]</span>
</span>
<span class="numeric-hp" aria-live="polite">HP 0/0</span>
<button class="cur-hp-btn add-hp-btn" title="回复一点体力" aria-label="回复一点体力">＋</button>

`;

class sgHpBar extends HTMLElement {
  shadowRoot;
  gameController;
  hpRef;
  cur;
  max;
  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });
    let clone = template.content.cloneNode(true);
    this.shadowRoot.append(clone);

    const pickerGrid = this.shadowRoot.querySelector(".picker-grid");
    for (let hp = 1; hp <= 15; hp++) {
      const option = document.createElement("button");
      option.className = "max-hp-option";
      option.type = "button";
      option.textContent = hp;
      option.dataset.maxHp = hp;
      option.addEventListener("click", () => {
        this.setMax(hp);
        this.closeMaxPicker();
      });
      pickerGrid.appendChild(option);
    }
  }

  init(hpRef, gameController) {
    this.gameController = gameController;
    this.hpRef = hpRef;
    this.shadowRoot
      .querySelector(".picker-close")
      .addEventListener("click", () => {
        this.closeMaxPicker();
      });
    this.shadowRoot
      .querySelector(".reduce-hp-btn")
      .addEventListener("click", () => {
        this.updateCurHp(Number(this.cur) - 1);
      });
    this.shadowRoot
      .querySelector(".add-hp-btn")
      .addEventListener("click", () => {
        this.updateCurHp(Math.min(Number(this.max), Number(this.cur) + 1));
      });

    // add HP change listener.
    onValue(hpRef, (snapshot) => {
      if (snapshot.exists()) {
        const hpVal = snapshot.val();
        const splits = hpVal.split("/");
        this.cur = Number(splits[0]);
        this.max = Number(splits[1]);
        this.renderHp();
      }
    });
  }

  renderHp() {
    const hpBarSpan = this.shadowRoot.querySelector(".hp-bar");

    this.shadowRoot.querySelectorAll(".max-hp-option").forEach((option) => {
      const selected = Number(option.dataset.maxHp) === this.max;
      option.classList.toggle("selected", selected);
      option.setAttribute("aria-current", selected ? "true" : "false");
    });
    this.shadowRoot.querySelector(
      ".numeric-hp"
    ).textContent = `HP ${this.cur}/${this.max}`;
    hpBarSpan.classList.add("compact");
    hpBarSpan.setAttribute("aria-label", `当前体力 ${this.cur}，上限 ${this.max}`);
    hpBarSpan.innerHTML = "";

    const heart = document.createElement("span");
    heart.className = "large-heart";
    heart.textContent = "♥";
    const count = document.createElement("span");
    count.className = "heart-count";
    count.textContent = `${this.cur} / ${this.max}`;
    hpBarSpan.append(heart, count);
  }

  updateCurHp(i) {
    if (i < 0) {
      i = 0;
    }
    this.gameController.setValue(this.hpRef, `${i}/${this.max}`);
  }

  openMaxPicker() {
    const picker = this.shadowRoot.querySelector(".max-hp-picker");
    if (!this.classList.contains("current-player") || picker.open) return;
    picker.showModal();
    const selected = picker.querySelector(`[data-max-hp="${this.max}"]`);
    selected?.focus();
  }

  closeMaxPicker() {
    const picker = this.shadowRoot.querySelector(".max-hp-picker");
    if (picker.open) picker.close();
  }

  setMax(value) {
    const newMax = Math.max(1, Math.min(15, Number(value)));
    const newCur = Math.min(this.cur, newMax);
    this.gameController.setValue(this.hpRef, `${newCur}/${newMax}`);
  }
}

customElements.define("sg-hpbar", sgHpBar);
