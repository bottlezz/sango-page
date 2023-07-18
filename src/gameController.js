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
        if (value.show) {
          value.show = "0";
        }
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

  moveCardFromPathToRef(fromPath, targetRef) {
    const cardRef = ref(db, fromPath);
    get(cardRef).then((snapshot) => {
      if (snapshot.exists()) {
        // get value
        const value = snapshot.val();
        if (value && value.show) {
          value.show = "0";
        }
        // move to target area
        const targetPath = targetRef
          .toString()
          .replace(ref(this.db).toString(), "");
        if (fromPath.includes(targetPath)) {
          return;
        }
        // remove from db
        remove(cardRef);
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

  getPlayerPath(playerKey) {
    return `game/${this.gameId}/${playerKey}`;
  }

  assignRoles() {
    let roles;
    if (this.playerCount == 6) {
      roles = ["忠", "忠", "反", "反", "内", "主"];
    } else {
      roles = ["忠", "忠", "忠", "反", "反", "反", "内", "主"];
    }
    for (let i = 0; i < this.playerCount; i++) {
      const len = roles.length;
      const idx = Math.floor(Math.random() * len);
      const role = roles[idx];
      roles.splice(idx, 1);
      const dbPath = `game/${this.gameId}/p${i + 1}/role`;
      set(ref(this.db, dbPath), role);
    }
  }

  isTableItem(dbRef) {
    const pathStr = dbRef.toString();
    return pathStr.includes("/tableDecks/");
  }

  shuffleDeck(deckRef) {
    const cardsRef = child(deckRef, "/cards");
    get(cardsRef).then((snapshot) => {
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
      set(cardsRef, cardsData);
    });
  }
}

export { gameController };
