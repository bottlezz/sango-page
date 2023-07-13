import {
  getDatabase,
  ref,
  child,
  get,
  push,
  update,
  remove,
  set,
  onValue,
} from "firebase/database";

class gameController {
  db;
  gameId;
  currentPlayer;
  userName;
  rootComponent;
  constructor(db, gameId, rootComponent) {
    this.db = db;
    this.gameId = gameId;
    this.rootComponent = rootComponent;
  }

  moveItem(fromPath, toPath) {
    // delete from game/1/p1/shoupai/cards/key
    // add to game/1/p2/shoupai/cards with "/newKey" and value
    console.log(`move item from: ${fromPath} to: ${toPath}`);
    let dbRef = ref(this.db);
    get(child(dbRef, fromPath)).then((snapshot) => {
      if (snapshot.exists()) {
        const value = snapshot.val();
        // console.log("mpove value :");
        // console.log(value);
        const newKey = snapshot.key;
        // console.log(newKey);
        const updates = {};
        updates[fromPath] = null;
        updates[toPath + "/" + newKey] = value;
        update(dbRef, updates);
      }
    });
  }

  lockPlayerSelection() {
    this.rootComponent.lockPlayerSelection();
  }

  getDiscardDeckPath() {
    return `game/${this.gameId}/tableDecks/discard`;
  }

  showCard(cardRef) {
    set(child(cardRef, "/show"), "1");
  }

  resetCard(cardRef) {
    set(child(cardRef, "/show"), "0");
  }

  moveCardToTableDeck(cardRef, deck) {
    get(cardRef).then((snapshot) => {
      if (snapshot.exists()) {
        // get value
        const value = snapshot.val();
        // remove from db
        remove(cardRef);
        // add to discard pile
        const targetPath = `game/${this.gameId}/tableDecks/${deck}`;
        this.addItem(targetPath + "/cards", snapshot.key, value);
      }
    });
  }

  moveCardToPlayerArea(cardRef, player, area) {
    get(cardRef).then((snapshot) => {
      if (snapshot.exists()) {
        // get value
        const value = snapshot.val();
        // remove from db
        remove(cardRef);
        // move to target area
        const targetPath = `game/${this.gameId}/${player}/${area}/cards`;
        this.addItem(targetPath, snapshot.key, value);
      }
    });
  }

  addItem(toPath, key, value) {
    console.log(`Add item to: ${toPath}`);
    let dbRef = ref(this.db);
    const updates = {};
    updates[toPath + "/" + key] = value;
    update(dbRef, updates);
  }
}

export { gameController };
