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
  constructor() {
    super();
  }

  init(deckRef, gameController) {
    this.deckRef = deckRef;
    this.areaType = deckRef.key + "-area";
    this.gameController = gameController;

    this.widget.classList.add(this.areaType);

    onChildAdded(child(deckRef, "/cards"), (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();
      console.log(`on child added: ${key}`);
      console.log(value);
      const cardWc = document.createElement("sg-jiang");
      this.cards[key] = cardWc;
      cardWc.init(child(deckRef, "/cards/" + key), value, this.gameController);
      this.cardArea.prepend(cardWc);
    });
    onChildChanged(child(deckRef, "/cards"), (snapshot) => {
      console.log(`on child changed: ${snapshot.key}`);
      console.log(snapshot.val());
    });
    onChildRemoved(child(deckRef, "/cards"), (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();
      console.log(`on child removed: ${key}`);
      console.log(value);
      const cardWc = this.cards[key];
      this.cardArea.removeChild(cardWc);
    });
  }
}

customElements.define("sg-jiangarea", SgJiangArea);