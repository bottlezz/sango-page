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
</style>
<span class="hp-bar">
  <span>[心]</span>
  <span>[心]</span>
  <span>[ ]</span>
  <span>[ ]</span>
</span>
<span class="max-hp-control">( <button class="reduce-max-btn">-</button> / <button class="add-max-btn">+</button> )</span>
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
  }

  init(hpRef, gameController) {
    this.gameController = gameController;
    this.hpRef = hpRef;
    // allow update max HP
    this.shadowRoot
      .querySelector(".reduce-max-btn")
      .addEventListener("click", () => {
        this.reduceMax();
      });
    this.shadowRoot
      .querySelector(".add-max-btn")
      .addEventListener("click", () => {
        this.addMax();
      });

    // add HP change listener.
    onValue(hpRef, (snapshot) => {
      if (snapshot.exists()) {
        const hpVal = snapshot.val();
        const splits = hpVal.split("/");
        this.cur = splits[0];
        this.max = splits[1];
        this.renderHp();
      }
    });
  }

  renderHp() {
    const hpBarSpan = this.shadowRoot.querySelector(".hp-bar");
    hpBarSpan.innerHTML = "";
    console.log(`hp: ${this.cur}/${this.max}`);
    for (let i = 1; i <= this.max; i++) {
      const xinSpan = document.createElement("span");
      xinSpan.dataset.hpVal = i;
      if (i <= this.cur) {
        xinSpan.innerHTML = "[心]";
      } else {
        xinSpan.innerHTML = "[  ]";
      }
      xinSpan.addEventListener("click", () => {
        if (this.cur >= i) {
          this.updateCurHp(i - 1);
        } else {
          this.updateCurHp(i);
        }
      });
      hpBarSpan.appendChild(xinSpan);
    }
  }

  updateCurHp(i) {
    if (i < 0) {
      i = 0;
    }
    set(this.hpRef, `${i}/${this.max}`);
  }
  addMax() {
    set(this.hpRef, `${this.cur}/${Number(this.max) + 1}`);
  }
  reduceMax() {
    if (this.max > 0) {
      const newMax = this.max - 1;
      if (this.cur > newMax) {
        this.cur = newMax;
      }
      set(this.hpRef, `${this.cur}/${newMax}`);
    }
  }
}

customElements.define("sg-hpbar", sgHpBar);
