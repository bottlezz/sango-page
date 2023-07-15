import {
  child,
  getDatabase,
  get,
  update,
  set,
  ref,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
} from "firebase/database";

import "./sgCard.js";
import commonCss from "./css/common.css";
import areaCss from "./css/sgArea.css";

class SgArea extends HTMLElement {
  deckRef;
  shadowRoot;
  gameController;
  style;
  areaType;
  cardArea;
  cardsRef;
  cards = {};

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });

    this.style = document.createElement("style");
    this.style.append(commonCss);
    this.style.append(areaCss);

    const warpper = document.createElement("div");
    warpper.classList.add("wrapper");
    this.cardArea = document.createElement("div");
    this.cardArea.classList.add("widget");
    this.cardArea.setAttribute("part", "card-area");
    this.cardArea.setAttribute("name", "card-area");

    this.controlArea = document.createElement("div");
    this.controlArea.classList.add("control-area");
    const shuffleButton = document.createElement("button");
    shuffleButton.innerHTML = "洗";
    shuffleButton.addEventListener("click", () => {
      this.shuffle();
    });
    this.controlArea.appendChild(shuffleButton);
    const recycleBtn = document.createElement("button");
    recycleBtn.innerHTML = "收";
    recycleBtn.addEventListener("click", () => {
      this.recycle();
    });
    this.controlArea.appendChild(recycleBtn);

    this.shadowRoot.append(this.style);
    warpper.append(this.cardArea);
    warpper.append(this.controlArea);
    this.shadowRoot.append(warpper);
  }

  init(deckRef, gameController) {
    this.deckRef = deckRef;
    this.cardsRef = child(deckRef, "/cards");
    this.areaType = deckRef.key + "-area";
    this.gameController = gameController;

    this.classList.add(this.areaType);

    onChildAdded(this.cardsRef, (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();
      const cardWc = document.createElement("sg-card");
      this.cards[key] = cardWc;
      cardWc.init(child(deckRef, "/cards/" + key), value, this.gameController);
      this.cardArea.prepend(cardWc);
    });
    // onChildChanged(this.cardsRef, (snapshot) => {
    //   // console.log(`on child changed: ${snapshot.key}`);
    //   // console.log(snapshot.val());
    // });
    onChildRemoved(this.cardsRef, (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();
      const cardWc = this.cards[key];
      this.cardArea.removeChild(cardWc);
    });
  }

  shuffle() {
    get(this.cardsRef).then((snapshot) => {
      if (!snapshot.exists()) return;
      const cardsData = snapshot.val();
      const keys = Object.keys(cardsData);
      const len = keys.length;
      for (let i = 0; i < len; i++) {
        const from = Math.floor(Math.random() * len);
        const to = Math.floor(Math.random() * len);
        const fromVal = cardsData[keys[from]];
        cardsData[keys[from]] = cardsData[keys[to]];
        cardsData[keys[to]] = fromVal;
      }
      console.log(cardsData);
      set(this.cardsRef, cardsData);
    });
  }
  recycle() {
    this.gameController.recycle(this.cardsRef);
  }
}

export { SgArea };
customElements.define("sg-area", SgArea);
