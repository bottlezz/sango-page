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
  runTransaction,
  serverTimestamp,
} from "firebase/database";

import jiangKu from "./data/jiang.json";
import paiKu from "./data/pai.json";
import { orderedMovePatch, dealOpeningHands } from "./cardOrder.mjs";
import {appendActionLog, applyRoomPatch} from "./actionLog.mjs";
import { runLoadedTransaction } from "./roomTransaction.mjs";
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

  async commitRoom(transform, action = '') {
    const roomRef = ref(this.db, `game/${this.gameId}`);
    const key = push(child(roomRef, 'actionLogs')).key;
    const actor = `${this.currentPlayer || '未入座'}${this.userName ? ' ' + this.userName : ''}`;
    return runLoadedTransaction(roomRef, room => {
      const next = transform(room);
      return next === undefined ? undefined : appendActionLog(room, next, key, actor, serverTimestamp(), action);
    }, {onValue, runTransaction});
  }

  writePatch(patch, action = '') {
    return this.commitRoom(room => applyRoomPatch(room, patch, `game/${this.gameId}/`), action);
  }

  setValue(target, value) {
    return this.writePatch({[target.toString().replace(ref(this.db).toString(), '')]: value});
  }

  getDiscardDeckPath() {
    return `game/${this.gameId}/tableDecks/discard`;
  }

  showCard(cardRef) {
    return this.setValue(child(cardRef, "/show"), "1");
  }

  resetCard(cardRef) {
    return this.setValue(child(cardRef, "/show"), "0");
  }

  async recycle(cardsRef) {
    const snapshot = await get(cardsRef);
    if (!snapshot.exists()) return;
    const source = cardsRef.toString().replace(ref(this.db).toString(), '');
    return this.moveOrderedCards(Object.keys(snapshot.val()).map(key=>`${source}/${key}`), ref(this.db, `game/${this.gameId}/tableDecks/pai/cards`));
  }

  moveCardToTableDeck(cardRef, deck) {
    return this.moveOrderedCards([cardRef.toString().replace(ref(this.db).toString(), '')], ref(this.db, `game/${this.gameId}/tableDecks/${deck}/cards`));
  }

  async moveCardToPlayerArea(cardRef, player, area) {
    if (area === 'pan') {
      const playerDom = this.rootComponent.playerDoms.find(item => item.dataset.key === player);
      const path = cardRef.toString().replace(ref(this.db).toString(), '');
      playerDom.openDropPicker(path, [path]);
      await playerDom.confirmPlayerDrop('panArea');
      return;
    }
    const targetPath = `game/${this.gameId}/${player}/${area}/cards`;
    const targetRef = ref(this.db, targetPath);
    return this.moveOrderedCards([cardRef.toString().replace(ref(this.db).toString(), '')], targetRef);
  }

  async dealCards() {
    const roomRef = ref(this.db, `game/${this.gameId}`);
    let reason = '发牌未完成，请重试';
    const result = await this.commitRoom(room => {
      try {
        return dealOpeningHands(room, Number(this.playerCount));
      } catch (error) {
        reason = error.message;
        return undefined;
      }
    });
    if (!result.committed) throw Error(reason);
  }

  async moveOrderedCards(paths, targetRef, beforeKey = null, effects = {}) {
    const base = ref(this.db).toString();
    const targetPath = targetRef.toString().replace(base, '');
    const prefix = `game/${this.gameId}/`;
    if (!targetPath.startsWith(prefix) || !targetPath.endsWith('/cards')) throw Error('无效的目标区域');
    const unique = [...new Set(paths)];
    if (!unique.length || unique.some(path => !path.startsWith(prefix) || !/\/cards\/[^/]+$/.test(path))) throw Error('无效的卡牌');
    {
      let reason = '卡牌移动失败';
      const result = await this.commitRoom(room => {
        try {
          const read = path => path.slice(prefix.length).split('/').reduce((value, key) => value?.[key], room);
          const sources = unique.map(path => ({path, value: read(path)}));
          if (sources.some(source => !source.value)) throw Error('卡牌已移动，请重新选择');
          const patch = orderedMovePatch(targetPath, read(targetPath) || {}, sources, beforeKey,
            () => push(targetRef).key, effects, card => paiKu[card.id]?.name);
          const next = structuredClone(room);
          for (const [path, value] of Object.entries(patch)) {
            const keys = path.slice(prefix.length).split('/');
            let parent = next;
            for (const key of keys.slice(0, -1)) parent = parent[key] ??= {};
            if (value === null) delete parent[keys.at(-1)];
            else parent[keys.at(-1)] = value;
          }
          return next;
        } catch (error) { reason = error.message; return undefined; }
      });
      if (!result.committed) throw Error(reason);
      return true;
    }
  }

  async moveCardFromPathToRef(fromPath, targetRef) {
    const seat = targetRef.toString().match(/\/(p\d+)\/pan\/cards$/)?.[1];
    if (seat) return this.moveCardToPlayerArea(ref(this.db, fromPath), seat, 'pan');
    return this.moveOrderedCards([fromPath], targetRef);
  }
  async moveCardRefToTargetRef(cardRef, targetRef) {
    return this.moveCardFromPathToRef(cardRef.toString().replace(ref(this.db).toString(), ''), targetRef);
  }

  async targetHasCapacity(targetRef, incomingCount = 1) {
    const targetPath = targetRef.toString();
    if (!targetPath.includes("/zhuang/cards")) return true;
    const snapshot = await get(targetRef);
    const currentCount = snapshot.exists()
      ? Object.keys(snapshot.val()).length
      : 0;
    return currentCount + incomingCount <= 4;
  }

  addItem(toPath, key, value) {
    console.log(`Add item to: ${toPath}`);
    const dbRef = ref(this.db);
    const updates = {};
    updates[toPath + "/" + key] = value;
    return this.writePatch(updates);
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
      this.setValue(ref(this.db, dbPath), role);
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
      this.setValue(cardsRef, cardsData);
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
    keys.forEach((key, index) => { cardsData[key].order = index * 1024; });
    return cardsData;
  }

  async resetPai() {
    return this.commitRoom(room => {
      const next = structuredClone(room);
      const decks = next.tableDecks ??= {};
      const cards = ['pai','paiBottom','discard'].flatMap(area => Object.values(decks[area]?.cards || {}));
      cards.forEach(card => {card.show = '0'; delete card.judgmentEffect; delete card.panOrder;});
      decks.pai = {cards: this.shuffleData(cards)};
      decks.paiBottom = {};
      decks.discard = {};
      return next;
    }, '洗牌');
  }

  resetTable() {
    const updates = {};

    // reset players
    for (let i = 0; i < this.playerCount; i++) {
      const playerPath = `game/${this.gameId}/p${i + 1}`;
      updates[`${playerPath}/jiang/cards`] = {};
      updates[`${playerPath}/jiang1`] = {};
      updates[`${playerPath}/jiang2`] = {};
      updates[`${playerPath}/jiangLocked`] = false;
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
    return this.writePatch(updates);
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
      const jiangs = jiangCards.splice(0, 7);
      updates[`game/${this.gameId}/p${i + 1}/jiang/cards`] = jiangs;
      updates[`game/${this.gameId}/p${i + 1}/jiang1`] = {};
      updates[`game/${this.gameId}/p${i + 1}/jiang2`] = {};
      updates[`game/${this.gameId}/p${i + 1}/jiangLocked`] = false;
    }
    console.log(updates);

    const dbRef = ref(this.db);
    return this.writePatch(updates);
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
    } else {
      this.rootComponent.showCardMenu();
    }
  }

  async drawSelectedCards(cards = [...this.selectedCards]) {
    if (!this.currentPlayer) return;
    return this.moveSelectedCards(cards, `game/${this.gameId}/${this.currentPlayer}/hand/cards`);
  }

  async discardSelectedCards(cards = [...this.selectedCards]) {
    return this.moveSelectedCards(cards, `game/${this.gameId}/tableDecks/discard/cards`);
  }

  async moveSelectedCards(cards, targetPath) {
    if (this.selectionMoveBusy) return;
    const base = ref(this.db).toString();
    const paths = [...new Set(cards.map(card => card.cardRef.toString().replace(base, '')))]
      .filter(path => !path.startsWith(`${targetPath}/`));
    if (!paths.length) return;
    this.selectionMoveBusy = true;
    try {
      return await this.moveOrderedCards(paths, ref(this.db, targetPath));
    } finally {
      this.selectionMoveBusy = false;
    }
  }

  showSelectedCards() {
    for (let i = this.selectedCards.length - 1; i >= 0; i--) {
      const wc = this.selectedCards[i];
      wc.showPai();
      wc.unselectCard();
    }
  }

  async dropSeletedCards(targetCardsRef) {
    let cardsToMove = [...this.selectedCards];
    if (targetCardsRef.toString().includes("/zhuang/cards")) {
      const snapshot = await get(targetCardsRef);
      const currentCount = snapshot.exists()
        ? Object.keys(snapshot.val()).length
        : 0;
      cardsToMove = cardsToMove.slice(0, Math.max(0, 4 - currentCount));
    }
    for (const wc of cardsToMove) {
      await this.moveCardRefToTargetRef(wc.cardRef, targetCardsRef);
    }
  }
}

export { gameController };
