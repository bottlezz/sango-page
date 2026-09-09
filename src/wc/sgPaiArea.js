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
import paiAreaCss from "./css/sgPaiArea.css";

class SgPaiArea extends SgArea {
  bottomSubs = [];
  constructor() {
    super();

    this.style.append(paiAreaCss);
  }
  init(deckRef, gameController) {
    super.init(deckRef, gameController);

    const paiBottomCardsPath = this.gameController.paiBottomCardsPath;
    const paiBottomCardsRef = ref(this.gameController.db, paiBottomCardsPath);
    this.bottomSubs.push(onChildAdded(paiBottomCardsRef, (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();
      const cardWc = document.createElement("sg-card");
      cardWc.className = this.areaType + "-card";
      this.bottomCards ??= {};
      this.bottomCards[key] = cardWc;
      cardWc.style.order = 1000000 + Object.keys(this.bottomCards).length;
      cardWc.init(
        ref(this.gameController.db, `${paiBottomCardsPath}/${key}`),
        value,
        this.gameController,
        {subscribe:false}
      );
      cardWc.renderCard();
      cardWc.setAttribute("exportparts", "card-widget");
      this.cardArea.appendChild(cardWc);
      this.dispatchEvent(new CustomEvent('cards-updated', {bubbles:true, composed:true}));
    }));

    this.bottomSubs.push(onChildRemoved(paiBottomCardsRef, (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();
      const cardWc = this.bottomCards?.[key];
      cardWc?.remove();
      if (this.bottomCards) delete this.bottomCards[key];
      this.dispatchEvent(new CustomEvent('cards-updated', {bubbles:true, composed:true}));
    }));
    this.bottomSubs.push(onChildChanged(paiBottomCardsRef, (snapshot) => {
      const cardWc = this.bottomCards?.[snapshot.key];
      if (cardWc) {
        cardWc.cardData = snapshot.val();
        cardWc.renderCard();
      }
    }));

  }

  disconnectedCallback() {
    super.disconnectedCallback();
    queueMicrotask(() => {
      if (!this.isConnected) this.bottomSubs.splice(0).forEach(unsubscribe => unsubscribe());
    });
  }
}

export { SgPaiArea };
customElements.define("sg-paiarea", SgPaiArea);
