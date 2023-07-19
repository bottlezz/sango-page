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
  dbPathStr;
  isTable;
  cards = {};

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });

    this.style = document.createElement("style");
    this.style.append(commonCss);
    this.style.append(areaCss);

    this.warpper = document.createElement("div");
    this.warpper.classList.add("wrapper");
    this.warpper.setAttribute("part", "wrapper");

    this.cardArea = document.createElement("div");
    this.cardArea.classList.add("card-area");
    this.cardArea.setAttribute("part", "card-area");
    this.cardArea.setAttribute("name", "card-area");

    this.controlArea = document.createElement("div");
    this.controlArea.classList.add("control-area");
    this.controlArea.setAttribute("part", "control-area");
    const shuffleButton = document.createElement("button");
    shuffleButton.innerHTML = "洗";
    shuffleButton.addEventListener("click", () => {
      this.shuffle();
    });
    this.controlArea.appendChild(shuffleButton);
    this.recycleBtn = document.createElement("button");
    this.recycleBtn.innerHTML = "收";
    this.recycleBtn.addEventListener("click", () => {
      this.recycle();
    });
    this.controlArea.appendChild(this.recycleBtn);

    this.shadowRoot.append(this.style);
    this.warpper.append(this.cardArea);
    this.warpper.append(this.controlArea);
    this.shadowRoot.append(this.warpper);
  }

  getAreaName() {
    switch (this.areaType) {
      case "jiang-area":
        return "将";
      case "pai-area":
        return "牌";
      case "zhuang-area":
        return "装";
      case "hand-area":
        return "牌";
      case "other1-area":
        return "区1";
      case "other2-area":
        return "区2";
    }
  }

  init(deckRef, gameController) {
    this.deckRef = deckRef;
    this.dbPathStr = deckRef.toString();
    this.cardsRef = child(deckRef, "/cards");
    this.areaType = deckRef.key + "-area";
    this.gameController = gameController;
    this.isTable = this.gameController.isTableItem(this.deckRef);

    this.classList.add(this.areaType);
    if (this.isTableArea()) {
      this.classList.add("table-area");
    }

    onChildAdded(this.cardsRef, (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();
      const cardWc = document.createElement("sg-card");
      this.cards[key] = cardWc;
      cardWc.init(child(deckRef, "/cards/" + key), value, this.gameController);
      this.cardArea.prepend(cardWc);
    });

    onChildRemoved(this.cardsRef, (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();
      const cardWc = this.cards[key];
      this.cardArea.removeChild(cardWc);
    });

    this.addEventListener("drop", (e) => {
      e.preventDefault();
      console.log("areaDrop");
      const fromPath = e.dataTransfer.getData("text");
      this.gameController.moveCardFromPathToRef(
        fromPath,
        child(this.deckRef, "/cards")
      );
    });
    this.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
  }

  visibilityCheck() {
    if (!this.cardArea.hasChildNodes()) {
      this.warpper.classList.add("hide");
    } else {
      this.warpper.classList.remove("hide");
    }
  }

  isTableArea() {
    return this.deckRef.parent.key == "tableDecks";
  }

  shuffle() {
    this.gameController.shuffleDeck(this.deckRef);
  }

  recycle() {
    this.gameController.recycle(this.cardsRef);
  }
}

export { SgArea };
customElements.define("sg-area", SgArea);
