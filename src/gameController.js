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

import jiangKu from "./data/jiang.json";
import paiKu from "./data/pai.json";
class gameController {
  db;
  gameId;
  currentPlayer;
  userName;
  playerCount;
  rootComponent;
  paiBottomCardsPath;
  selectedCards = [];
  constructor(db, gameId) {
    this.db = db;
    this.gameId = gameId;
    this.paiBottomCardsPath = `game/${this.gameId}/tableDecks/paiBottom/cards`;
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

  moveCardFromPathToRef(fromPath, targetRef, resetShow = true) {
    const cardRef = ref(db, fromPath);
    get(cardRef).then((snapshot) => {
      if (snapshot.exists()) {
        // get value
        const value = snapshot.val();
        if (value && value.show && resetShow) {
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

  moveCardRefToTargetRef(cardRef, targetRef) {
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
      const cardsData = this.shuffleData(snapshot.val());
      set(cardsRef, cardsData);
    });
  }

  shuffleData(cardsData) {
    const keys = Object.keys(cardsData);
    const len = keys.length;
    for (let i = 0; i < len; i++) {
      const from = Math.floor(Math.random() * len);
      const to = Math.floor(Math.random() * len);
      const fromVal = cardsData[keys[from]];
      cardsData[keys[from]] = cardsData[keys[to]];
      cardsData[keys[to]] = fromVal;
    }
    return cardsData;
  }

  resetPai() {
    const discardCardsRef = ref(
      db,
      `game/${this.gameId}/tableDecks/discard/cards`
    );
    const paiCardsRef = ref(db, `game/${this.gameId}/tableDecks/pai/cards`);
    const paiBottomCardsRef = ref(db, this.paiBottomCardsPath);
    get(discardCardsRef).then((snapshot) => {
      let discardCardsData = {};
      if (snapshot.exists()) {
        discardCardsData = snapshot.val();
      }

      get(paiBottomCardsRef).then((paiBottomSnap) => {
        let paiBottomCardsData = {};
        if (paiBottomSnap.exists()) {
          paiBottomCardsData = paiBottomSnap.val();
        }
        get(paiCardsRef).then((paiSnap) => {
          let paiCardsData = {};
          if (paiSnap.exists()) {
            paiCardsData = paiSnap.val();
          }
          const newCardsData = {
            ...discardCardsData,
            ...paiCardsData,
            ...paiBottomCardsData,
          };
          this.shuffleData(newCardsData);

          set(paiCardsRef, newCardsData);
        });
        remove(paiBottomCardsRef);
      });
      remove(discardCardsRef);
    });
  }

  resetTable() {
    const updates = {};

    // reset players
    for (let i = 0; i < this.playerCount; i++) {
      const playerPath = `game/${this.gameId}/p${i + 1}`;
      updates[`${playerPath}/jiang/cards`] = {};
      updates[`${playerPath}/hand/cards`] = {};
      updates[`${playerPath}/pan/cards`] = {};
      updates[`${playerPath}/zhuang/cards`] = {};
      updates[`${playerPath}/other1/cards`] = {};
      updates[`${playerPath}/other2/cards`] = {};
    }

    const tableDeckPath = `game/${this.gameId}/tableDecks`;
    updates[`${tableDeckPath}/discard`] = {};
    updates[`${tableDeckPath}/paiBottom`] = {};
    updates[`${tableDeckPath}/jiang`] = {};
    updates[`${tableDeckPath}/pai`] = { cards: this.getShuffledPai() };
    const dbRef = ref(this.db);
    update(dbRef, updates);
  }

  getShuffledJiang() {
    const orgJiangDeckCards = Object.keys(jiangKu).map((key) => {
      if (!jiangKu[key].disable) {
        return { id: key, show: "0" };
      } else {
        return null;
      }
    });
    const initJiangDeckCards = orgJiangDeckCards.filter((j) => j != null);
    this.shuffleData(initJiangDeckCards);
    this.shuffleData(initJiangDeckCards);
    return initJiangDeckCards;
  }

  getShuffledPai() {
    const initPaiDeckCards = Object.keys(paiKu).map((key) => {
      return { id: key, show: "0" };
    });
    this.shuffleData(initPaiDeckCards);
    this.shuffleData(initPaiDeckCards);
    return initPaiDeckCards;
  }

  dispatchJiang() {
    const jiangCards = this.getShuffledJiang();
    const updates = {};

    for (let i = 0; i < 6; i++) {
      const jiangs = jiangCards.splice(i * 7, 7);
      updates[`game/${this.gameId}/p${i + 1}/jiang/cards`] = jiangs;
    }

    updates[`game/${this.gameId}/tableDecks/jiang`] = {};
    console.log(updates);

    const dbRef = ref(this.db);
    update(dbRef, updates);
  }

  addSelectedCard(sgCard) {
    this.selectedCards.push(sgCard);
    console.log("selcted count : " + this.selectedCards.length);
    this.rootComponent.showCardMenu();
  }

  removeSelectedCard(sgCard) {
    const index = this.selectedCards.indexOf(sgCard);
    if (index !== -1) {
      this.selectedCards.splice(index, 1);
    }
    console.log("selcted count : " + this.selectedCards.length);
    if (this.selectedCards.length == 0) {
      this.rootComponent.hideCardMenu();
    }
  }

  drawSelectedCards() {
    this.selectedCards.forEach((wc) => {
      wc.drawPai();
    });
  }

  discardSelectedCards() {
    this.selectedCards.forEach((wc) => {
      wc.discardPai();
    });
  }

  showSelectedCards() {
    for (let i = this.selectedCards.length - 1; i >= 0; i--) {
      const wc = this.selectedCards[i];
      wc.showPai();
      wc.unselectCard();
    }
  }

  dropSeletedCards(targetCardsRef) {
    this.selectedCards;
    this.selectedCards.forEach((wc) => {
      this.moveCardRefToTargetRef(wc.cardRef, targetCardsRef);
    });
  }
}

export { gameController };
