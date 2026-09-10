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
import { SgArea } from "./sgArea.js";
import "./sgJiang.js";

class SgJiangArea extends SgArea {
  selectedGenerals = [];
  selectionLocked = false;
  childSubs = [];
  constructor() {
    super();
  }

  init(deckRef, gameController) {
    this.deckRef = deckRef;
    this.cardsRef = child(deckRef, "/cards");
    this.areaType = deckRef.key + "-area";
    this.classList.add(this.areaType);
    this.gameController = gameController;
    if (this.isTableArea()) {
      this.classList.add("table-area");
    }

    if (!this.isTableArea()) {
      this.controlArea.classList.add("hide");
    } else {
      this.recycleBtn.classList.add("hide");
    }

    this.childSubs.push(onChildAdded(child(deckRef, "/cards"), (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();
      const cardWc = document.createElement("sg-jiang");
      if (this.isTableArea()) {
        cardWc.dataset.cardType = "table";
      }
      if (this.classList.contains("current-player")) {
        cardWc.classList.add("current-player");
      }
      if (this.areaType == "jiang-area" && !this.isTableArea()) {
        cardWc.classList.add("selection-card");
        cardWc.addEventListener("select-general", () => {
          this.selectGeneral(cardWc);
        });
      }
      this.cards[key] = cardWc;
      cardWc.init(child(deckRef, "/cards/" + key), value, this.gameController, {subscribe:false});
      cardWc.renderCard();
      cardWc.setGeneralLocked(this.selectionLocked);
      this.cardArea.prepend(cardWc);
      this.updateSelectionAvailability();

      this.lockJiangArea();
    }));
    this.childSubs.push(onChildRemoved(child(deckRef, "/cards"), (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();
      // console.log(`on child removed: ${key}`);
      // console.log(value);
      const cardWc = this.cards[key];
      const selectedIndex = this.selectedGenerals.indexOf(cardWc);
      if (selectedIndex >= 0) {
        this.selectedGenerals.splice(selectedIndex, 1);
        this.dispatchSelectionChange();
      }
      this.cardArea.removeChild(cardWc);
      delete this.cards[key];
      this.lockJiangArea();
    }));
    this.childSubs.push(onChildChanged(child(deckRef, "/cards"), (snapshot) => {
      const cardWc = this.cards[snapshot.key];
      if (cardWc) {
        cardWc.cardData = snapshot.val();
        cardWc.renderCard();
      }
    }));

  }

  lockJiangArea() {
    if (this.cardArea.childElementCount <= 2) {
      if (!this.classList.contains("locked")) {
        this.classList.add("locked");
      }
    } else {
      this.classList.remove("locked");
    }
  }

  selectGeneral(cardWc) {
    if (this.selectionLocked) return;
    const index = this.selectedGenerals.indexOf(cardWc);
    if (index >= 0) {
      this.selectedGenerals.splice(index, 1);
      cardWc.setSelectedForLockIn(false);
    } else if (this.selectedGenerals.length < 2) {
      this.selectedGenerals.push(cardWc);
    }
    this.selectedGenerals.forEach((card, selectedIndex) =>
      card.setSelectedForLockIn(true, selectedIndex === 0 ? "主将" : "副将")
    );
    this.dispatchSelectionChange();
  }

  dispatchSelectionChange() {
    this.updateSelectionAvailability();
    this.dispatchEvent(
      new CustomEvent("general-selection-change", {
        bubbles: true,
        composed: true,
        detail: {
          count: this.selectedGenerals.length,
          locked: this.selectionLocked,
        },
      })
    );
  }

  updateSelectionAvailability() {
    const selectionFull = this.selectedGenerals.length === 2;
    Object.values(this.cards).forEach((card) => {
      card.classList.toggle(
        "selection-unavailable",
        selectionFull && !this.selectedGenerals.includes(card)
      );
    });
  }

  connectedCallback() {
    this.overflowObserver?.observe(this.cardArea);
  }

  disconnectedCallback() {
    this.overflowObserver?.disconnect();
    queueMicrotask(() => {
      if (!this.isConnected) this.childSubs.splice(0).forEach(unsubscribe => unsubscribe());
    });
  }

  async lockInSelected() {
    const playerKey = this.gameController.currentPlayer;
    if (!playerKey || this.selectionLocked || this.selectedGenerals.length != 2) {
      return false;
    }

    return this.gameController.lockSelectedGenerals(this.selectedGenerals.map(card=>card.cardRef),playerKey);
  }

  setLocked(locked) {
    this.selectionLocked = locked;
    if (!locked) {
      this.selectedGenerals.forEach((card) => card.setSelectedForLockIn(false));
      this.selectedGenerals = [];
    }
    Object.values(this.cards).forEach((card) => card.setGeneralLocked(locked));
    this.classList.toggle("selection-locked", locked);
    this.dispatchSelectionChange();
  }
}

customElements.define("sg-jiangarea", SgJiangArea);
