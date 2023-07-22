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
import { SgArea } from "./sgArea.js";
import paiAreaCss from "./css/SgPaiArea.css";

class SgPaiArea extends SgArea {
  constructor() {
    super();

    this.paiBoard = document.createElement("div");
    this.paiBoard.classList.add("pai-board");
    this.infoPane = document.createElement("div");

    this.paiTop = document.createElement("div");
    this.paiTop.innerHTML = "牌堆顶";
    this.paiTop.classList.add("pai-top");
    this.paiBottom = document.createElement("div");
    this.paiBottom.innerHTML = "牌堆底";

    this.paiBottom.classList.add("pai-bottom");

    this.paiBoard.appendChild(this.paiTop);
    this.paiBoard.appendChild(this.infoPane);
    this.paiBoard.appendChild(this.paiBottom);

    this.shadowRoot.appendChild(this.paiBoard);
    this.style.append(paiAreaCss);
  }
  init(deckRef, gameController) {
    super.init(deckRef, gameController);

    const paiBottomCardsPath = this.gameController.paiBottomCardsPath;
    const paiBottomCardsRef = ref(this.gameController.db, paiBottomCardsPath);
    onChildAdded(paiBottomCardsRef, (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();
      const cardWc = document.createElement("sg-card");
      this.cards[key] = cardWc;
      cardWc.init(
        ref(this.gameController.db, `${paiBottomCardsPath}/${key}`),
        value,
        this.gameController
      );
      this.cardArea.appendChild(cardWc);
    });

    onChildRemoved(paiBottomCardsRef, (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();
      const cardWc = this.cards[key];
      this.cardArea.removeChild(cardWc);
    });

    this.paiTop.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const fromPath = e.dataTransfer.getData("text");
      this.gameController.moveCardFromPathToRef(
        fromPath,
        child(this.deckRef, "/cards"),
        false
      );
    });

    this.paiBottom.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const fromPath = e.dataTransfer.getData("text");
      this.gameController.moveCardFromPathToRef(fromPath, paiBottomCardsRef);
    });
  }
}

export { SgPaiArea };
customElements.define("sg-paiarea", SgPaiArea);
