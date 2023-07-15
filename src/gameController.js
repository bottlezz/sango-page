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
  playerCount;
  rootComponent;
  constructor(db, gameId) {
    this.db = db;
    this.gameId = gameId;
  }

  moveItem(fromPath, toPath) {
    // delete from game/1/p1/shoupai/cards/key
    // add to game/1/p2/shoupai/cards with "/newKey" and value
    console.log(`move item from: ${fromPath} to: ${toPath}`);
    let dbRef = ref(this.db);
    get(child(dbRef, fromPath)).then((snapshot) => {
      if (snapshot.exists()) {
        const value = snapshot.val();
        const newKey = snapshot.key;
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

  recycle(cardsRef) {
    const paiCardsPath = `game/${this.gameId}/tableDecks/pai/cards`;
    get(cardsRef).then((snapshot) => {
      if (!snapshot.exists()) return;
      const cardsData = snapshot.val();

      const updates = {};
      const keys = Object.keys(cardsData);
      keys.forEach((key) => {
        updates[paiCardsPath + "/" + key] = cardsData[key];
      });
      const dbRef = ref(this.db);
      update(dbRef, updates);
      set(cardsRef, {});
    });
  }

  moveCardToTableDeck(cardRef, deck) {
    get(cardRef).then((snapshot) => {
      if (snapshot.exists()) {
        // get value
        const value = snapshot.val();
        // remove from db
        remove(cardRef);
        // add to discard pile
        const targetPath = `game/${this.gameId}/tableDecks/${deck}/cards`;
        this.addItem(targetPath, snapshot.key, value);
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
    const dbRef = ref(this.db);
    const updates = {};
    updates[toPath + "/" + key] = value;
    update(dbRef, updates);
  }
}

export { gameController };
