import {
  ref,
  child,
  get,
  push,
  update,
  set,
  runTransaction,
} from "firebase/database";

import jiangKu from "./data/jiang.json";
import paiKu from "./data/pai.json";
import { orderedEntries, orderedMovePatch, dealOpeningHands } from "./cardOrder.mjs";
import { acquireLocks } from './databaseLocks.mjs';
import {ACTION_HINT_OPCODE, encodeActionHint} from './localActionLog.mjs';
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

  writePatch(patch) {
    return update(ref(this.db), patch);
  }

  setValue(target, value) {
    return this.setScalarValue(target, value);
  }

  getDiscardDeckPath() {
    return `game/${this.gameId}/tableDecks/discard`;
  }

  showCard(cardRef) {
    return this.setScalarValue(child(cardRef, "/show"), "1");
  }

  resetCard(cardRef) {
    return this.setScalarValue(child(cardRef, "/show"), "0");
  }

  setScalarValue(target, value) {
    return set(target, value);
  }

  togglePlayerStatus(playerRef, index) {
    if (index !== 0 && index !== 1) throw Error('无效的玩家状态');
    return runTransaction(child(playerRef, '/debuff'), current => {
      const chars = String(current || '00').padEnd(2, '0').slice(0, 2).split('');
      chars[index] = chars[index] === '1' ? '0' : '1';
      return chars.join('');
    }, {applyLocally: false});
  }

  async recycle(cardsRef) {
    const snapshot = await get(cardsRef);
    if (!snapshot.exists()) return;
    const source = cardsRef.toString().replace(ref(this.db).toString(), '');
    return this.moveOrderedCards(Object.keys(snapshot.val()).map(key=>`${source}/${key}`), ref(this.db, `game/${this.gameId}/tableDecks/pai/cards`));
  }

  acquireGameLocks(resources) {
    const lockRootPath = `game/${this.gameId}/operationLocks`;
    return acquireLocks(resources, {
      lockRootPath, ttlMs: 15000,
      newToken: () => push(ref(this.db, lockRootPath)).key,
      makeRef: path => ref(this.db, path),
      runTransaction,
      updateRoot: patch => update(ref(this.db), patch),
    });
  }

  // This value coordinates local best-effort logs; it is not replayable history.
  // Always spread it into the same root update as its state patch so subscribers
  // cannot associate a new state with an old action hint.
  actionHintPatch(opcode, args = []) {
    return {[`game/${this.gameId}/runtime/a`]:encodeActionHint(opcode,this.currentPlayer,args)};
  }

  moveActionOpcode(paths, targetPath) {
    if (!this.currentPlayer) return null;
    const playerArea = path => path.match(/^game\/[^/]+\/(p\d+)\/([^/]+)\/cards(?:\/[^/]+)?$/);
    const sources = paths.map(playerArea).filter(Boolean), target = playerArea(targetPath);
    if (/\/tableDecks\/discard\/cards$/.test(targetPath) && sources.length) {
      return sources.some(match=>match[1]!==this.currentPlayer) ? ACTION_HINT_OPCODE.DISCARD_OTHER : ACTION_HINT_OPCODE.DISCARD;
    }
    if(target?.[2]==='hand'&&target[1]===this.currentPlayer&&paths.some(path=>/\/tableDecks\/(pai|paiBottom)\/cards\//.test(path)))return ACTION_HINT_OPCODE.DRAW;
    if(target?.[2]==='hand'&&target[1]===this.currentPlayer&&paths.some(path=>/\/tableDecks\/discard\/cards\//.test(path)))return ACTION_HINT_OPCODE.TAKE_DISCARD;
    if (!sources.some(match=>match[1]!==this.currentPlayer) && !(target&&target[1]!==this.currentPlayer)) return null;
    if (target?.[2]==='hand' && target[1]!==this.currentPlayer && paths.some(path=>/\/tableDecks\/(pai|paiBottom)\/cards\//.test(path))) return ACTION_HINT_OPCODE.DRAW_FOR_OTHER;
    if (target && sources.some(match=>match[1]!==target[1])) return ACTION_HINT_OPCODE.TRANSFER_CARD;
    return ACTION_HINT_OPCODE.MOVE_OTHER;
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
    const prefix = `game/${this.gameId}`;
    const deckPaths = [`${prefix}/tableDecks/pai/cards`, `${prefix}/tableDecks/paiBottom/cards`];
    const handPaths = Array.from({length:Number(this.playerCount)}, (_,index)=>`${prefix}/p${index+1}/hand/cards`);
    const locks = await this.acquireGameLocks([...deckPaths, ...handPaths].map(path=>`area:${path}`));
    let released = false;
    try {
      const snapshots = await Promise.all([...deckPaths, ...handPaths].map(path=>get(ref(this.db,path))));
      const hands = snapshots.slice(deckPaths.length);
      if (hands.some(snapshot=>snapshot.exists() && Object.keys(snapshot.val() || {}).length)) {
        throw Error('只有所有玩家手牌为空时才能发牌');
      }
      const deck = deckPaths.flatMap((path,index)=>orderedEntries(snapshots[index].val() || {}).map(card=>({...card,path})));
      const needed = handPaths.length * 4;
      if (deck.length < needed) throw Error(`牌堆不足，需要 ${needed} 张牌`);
      const patch = locks.releasePatch();
      deck.slice(0,needed).forEach((item,index)=>{
        patch[`${item.path}/${item.key}`] = null;
        const handPath = handPaths[Math.floor(index/4)], card = {...item.value,show:'0',order:(index%4)*1024};
        delete card.panOrder;delete card.judgmentEffect;
        patch[`${handPath}/${push(ref(this.db,handPath)).key}`] = card;
      });
      handPaths.forEach(path => {
        patch[path.replace(/\/hand\/cards$/, '/areaCounts/hand')] = 4;
      });
      Object.assign(patch,this.actionHintPatch(ACTION_HINT_OPCODE.DEAL_CARDS));
      await update(ref(this.db),patch);released=true;return true;
    } finally {
      if (!released) await locks.release();
    }
  }

  async moveOrderedCards(paths, targetRef, beforeKey = null, effects = {}, actionOpcode = null) {
    const base = ref(this.db).toString();
    const targetPath = targetRef.toString().replace(base, '');
    const prefix = `game/${this.gameId}/`;
    if (!targetPath.startsWith(prefix) || !targetPath.endsWith('/cards')) throw Error('无效的目标区域');
    const unique = [...new Set(paths)];
    if (!unique.length || unique.some(path => !path.startsWith(prefix) || !/\/cards\/[^/]+$/.test(path))) throw Error('无效的卡牌');
    const sourceAreas = unique.map(path=>path.slice(0,path.lastIndexOf('/')));
    const locks = await this.acquireGameLocks([
      `area:${targetPath}`,...sourceAreas.map(path=>`area:${path}`),...unique.map(path=>`card:${path}`)
    ]);
    let released = false;
    try {
      const [target, ...snapshots] = await Promise.all([get(targetRef), ...unique.map(path => get(ref(this.db, path)))]);
      if (snapshots.some(snapshot => !snapshot.exists())) throw Error('卡牌已移动，请重新选择');
      const sources = snapshots.map((snapshot, index) => ({path: unique[index], value: snapshot.val()}));
      const patch = orderedMovePatch(targetPath, target.val() || {}, sources, beforeKey,
        () => push(targetRef).key, effects, card => paiKu[card.id]?.name);
      const countInfo = path => {
        const match = path.match(/^game\/[^/]+\/(p\d+)\/(hand|other1|other2)\/cards$/);
        return match ? {areaPath:path,countPath:`game/${this.gameId}/${match[1]}/areaCounts/${match[2]}`} : null;
      };
      const targetCount = countInfo(targetPath);
      const incomingCount = unique.filter(path => path.slice(0,path.lastIndexOf('/')) !== targetPath).length;
      if (targetCount && incomingCount) {
        patch[targetCount.countPath] = Object.keys(target.val() || {}).length + incomingCount;
      }
      const movedBySource = new Map();
      sourceAreas.forEach(areaPath => {
        if (areaPath !== targetPath && countInfo(areaPath)) movedBySource.set(areaPath,(movedBySource.get(areaPath)||0)+1);
      });
      for (const [areaPath,movedCount] of movedBySource) {
        const info=countInfo(areaPath),countSnapshot=await get(ref(this.db,info.countPath));
        let currentCount=Number(countSnapshot.val());
        if (!countSnapshot.exists()) {
          const areaSnapshot=await get(ref(this.db,areaPath));
          currentCount=Object.keys(areaSnapshot.val()||{}).length;
        }
        patch[info.countPath]=Math.max(0,currentCount-movedCount);
      }
      const hintOpcode=actionOpcode||this.moveActionOpcode(unique,targetPath);
      if(hintOpcode)Object.assign(patch,this.actionHintPatch(hintOpcode));
      Object.assign(patch, locks.releasePatch());
      await update(ref(this.db), patch);
      released = true;
      return true;
    } finally {
      if (!released) await locks.release();
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

  async lockSelectedGenerals(cardRefs, playerKey) {
    if (!/^p\d+$/.test(playerKey) || cardRefs.length !== 2) return false;
    const base=ref(this.db).toString(),sources=cardRefs.map(cardRef=>cardRef.toString().replace(base,''));
    const playerPath=`game/${this.gameId}/${playerKey}`,sourceAreas=sources.map(path=>path.slice(0,path.lastIndexOf('/')));
    const targetPaths=[`${playerPath}/jiang1/cards`,`${playerPath}/jiang2/cards`];
    const locks=await this.acquireGameLocks([
      ...sourceAreas.map(path=>`area:${path}`),...targetPaths.map(path=>`area:${path}`),...sources.map(path=>`card:${path}`)
    ]);
    let released=false;
    try {
      const snapshots=await Promise.all(sources.map(path=>get(ref(this.db,path))));
      if(snapshots.some(snapshot=>!snapshot.exists()))throw Error('武将已移动，请重新选择');
      const patch=locks.releasePatch();
      snapshots.forEach((snapshot,index)=>{patch[sources[index]]=null;patch[`${targetPaths[index]}/${snapshot.key}`]=snapshot.val();});
      patch[`${playerPath}/jiangLocked`]=true;
      await update(ref(this.db),patch);released=true;return true;
    } finally {if(!released)await locks.release();}
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
    const updates = {};
    for (let i = 0; i < this.playerCount; i++) {
      const len = roles.length;
      const idx = Math.floor(Math.random() * len);
      const role = roles[idx];
      roles.splice(idx, 1);
      updates[`game/${this.gameId}/p${i + 1}/role`] = role;
    }
    return update(ref(this.db), {...updates,...this.actionHintPatch(ACTION_HINT_OPCODE.ASSIGN_ROLES)});
  }

  isTableItem(dbRef) {
    const pathStr = dbRef.toString();
    return pathStr.includes("/tableDecks/");
  }

  async shuffleDeck(deckRef) {
    const cardsRef = child(deckRef, "/cards");
    const path = cardsRef.toString().replace(ref(this.db).toString(), '');
    const locks = await this.acquireGameLocks([`area:${path}`]);
    let released = false;
    try {
      const snapshot = await get(cardsRef);
      if (!snapshot.exists()) return;
      const cardsData = this.shuffleData(snapshot.val());
      const area=path.match(/\/(pai|paiBottom|discard|hand|zhuang|pan|other1|other2|jiang)\/cards$/)?.[1];
      const code={pai:'p',paiBottom:'b',discard:'d',hand:'h',zhuang:'z',pan:'n',other1:'o',other2:'o',jiang:'j'}[area]||'o';
      await update(ref(this.db),{[path]:cardsData,...this.actionHintPatch(ACTION_HINT_OPCODE.SHUFFLE,[code]),...locks.releasePatch()});released=true;
    } finally {
      if (!released) await locks.release();
    }
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
    const prefix=`game/${this.gameId}/tableDecks`, paths=['pai','paiBottom','discard'].map(area=>`${prefix}/${area}/cards`);
    const locks=await this.acquireGameLocks(paths.map(path=>`area:${path}`));
    let released=false;
    try {
      const snapshots=await Promise.all(paths.map(path=>get(ref(this.db,path))));
      const merged={};
      snapshots.forEach(snapshot=>Object.entries(snapshot.val()||{}).forEach(([key,value])=>{
        const nextKey=merged[key] ? push(ref(this.db,paths[0])).key : key;
        const card={...value,show:'0'};delete card.judgmentEffect;delete card.panOrder;
        merged[nextKey]=card;
      }));
      this.shuffleData(merged);
      await update(ref(this.db),{
        [`${prefix}/pai/cards`]:merged,[`${prefix}/paiBottom`]:null,[`${prefix}/discard`]:null,
        ...this.actionHintPatch(ACTION_HINT_OPCODE.RESET_DECK),...locks.releasePatch()
      });
      released=true;return true;
    } finally {
      if(!released)await locks.release();
    }
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
      updates[`${playerPath}/areaCounts/hand`] = 0;
      updates[`${playerPath}/areaCounts/other1`] = 0;
      updates[`${playerPath}/areaCounts/other2`] = 0;
    }

    const tableDeckPath = `game/${this.gameId}/tableDecks`;
    updates[`${tableDeckPath}/discard`] = {};
    updates[`${tableDeckPath}/paiBottom`] = {};
    updates[`${tableDeckPath}/jiang`] = {};
    updates[`${tableDeckPath}/pai`] = { cards: this.getShuffledPai() };
    return update(ref(this.db),{...updates,...this.actionHintPatch(ACTION_HINT_OPCODE.RESET_TABLE)});
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

  async dispatchJiang() {
    const jiangCards = this.getShuffledJiang();
    const updates = {};
    const areas = [];
    for (let i = 0; i < this.playerCount; i++) {
      const jiangs = jiangCards.splice(0, 7);
      const playerPath=`game/${this.gameId}/p${i + 1}`;
      updates[`${playerPath}/jiang/cards`] = jiangs;
      updates[`${playerPath}/jiang1`] = {};
      updates[`${playerPath}/jiang2`] = {};
      updates[`${playerPath}/jiangLocked`] = false;
      areas.push(`${playerPath}/jiang/cards`,`${playerPath}/jiang1/cards`,`${playerPath}/jiang2/cards`);
    }
    const locks=await this.acquireGameLocks(areas.map(path=>`area:${path}`));
    let released=false;
    try {await update(ref(this.db),{...updates,...this.actionHintPatch(ACTION_HINT_OPCODE.DEAL_GENERALS),...locks.releasePatch()});released=true;return true;}
    finally {if(!released)await locks.release();}
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
    return this.moveSelectedCards(cards, `game/${this.gameId}/tableDecks/discard/cards`, ACTION_HINT_OPCODE.DISCARD);
  }

  async playSelectedCards(cards = [...this.selectedCards]) {
    return this.moveSelectedCards(cards, `game/${this.gameId}/tableDecks/discard/cards`, ACTION_HINT_OPCODE.PLAY);
  }

  async moveSelectedCards(cards, targetPath, actionOpcode = null) {
    if (this.selectionMoveBusy) return;
    const base = ref(this.db).toString();
    const paths = [...new Set(cards.map(card => card.cardRef.toString().replace(base, '')))]
      .filter(path => !path.startsWith(`${targetPath}/`));
    if (!paths.length) return;
    this.selectionMoveBusy = true;
    try {
      const ownOnly=paths.every(path=>path.includes(`/${this.currentPlayer}/`));
      return await this.moveOrderedCards(paths, ref(this.db, targetPath), null, {}, ownOnly?actionOpcode:null);
    } finally {
      this.selectionMoveBusy = false;
    }
  }

  async topDeckPaths(count = 1) {
    const prefix=`game/${this.gameId}/tableDecks`;
    const areas=['pai','paiBottom'];
    const snapshots=await Promise.all(areas.map(area=>get(ref(this.db,`${prefix}/${area}/cards`))));
    const cards=areas.flatMap((area,index)=>orderedEntries(snapshots[index].val()||{}).map(({key})=>`${prefix}/${area}/cards/${key}`));
    if(cards.length<count)throw Error(`牌堆不足，需要 ${count} 张牌`);
    return cards.slice(0,count);
  }

  async drawTopCards(count = 1) {
    if(!this.currentPlayer)throw Error('请先入座');
    const paths=await this.topDeckPaths(count);
    return this.moveOrderedCards(paths,ref(this.db,`game/${this.gameId}/${this.currentPlayer}/hand/cards`),null,{},ACTION_HINT_OPCODE.DRAW);
  }

  async revealTopCard() {
    const paths=await this.topDeckPaths(1);
    return this.moveOrderedCards(paths,ref(this.db,`game/${this.gameId}/tableDecks/discard/cards`),null,{},ACTION_HINT_OPCODE.REVEAL_JUDGMENT);
  }

  async takeDiscardCards(paths) {
    if(!this.currentPlayer)throw Error('请先入座');
    return this.moveOrderedCards(paths,ref(this.db,`game/${this.gameId}/${this.currentPlayer}/hand/cards`),null,{},ACTION_HINT_OPCODE.TAKE_DISCARD);
  }

  async rearrangeDeck({top=[],bottom=[],draw=[]}) {
    if(!this.currentPlayer)throw Error('请先入座');
    const prefix=`game/${this.gameId}`,topPath=`${prefix}/tableDecks/pai/cards`,bottomPath=`${prefix}/tableDecks/paiBottom/cards`;
    const handPath=`${prefix}/${this.currentPlayer}/hand/cards`,areaPaths=[topPath,bottomPath,handPath];
    const locks=await this.acquireGameLocks(areaPaths.map(path=>`area:${path}`));
    let released=false;
    try{
      const [topSnapshot,bottomSnapshot,handSnapshot]=await Promise.all(areaPaths.map(path=>get(ref(this.db,path))));
      const deckItems=[...orderedEntries(topSnapshot.val()||{}).map(item=>({...item,path:topPath})),...orderedEntries(bottomSnapshot.val()||{}).map(item=>({...item,path:bottomPath}))];
      const byPath=new Map(deckItems.map(item=>[`${item.path}/${item.key}`,item.value]));
      const requested=[...top,...bottom,...draw];
      if(requested.length!==byPath.size||new Set(requested).size!==requested.length||requested.some(path=>!byPath.has(path)))throw Error('牌堆已变化，请重新展开');
      const patch=locks.releasePatch();
      requested.forEach(path=>{patch[path]=null;});
      const place=(paths,targetPath)=>paths.forEach((sourcePath,index)=>{
        const sameArea=sourcePath.slice(0,sourcePath.lastIndexOf('/'))===targetPath;
        const key=sameArea?sourcePath.split('/').pop():push(ref(this.db,targetPath)).key;
        const card={...byPath.get(sourcePath),show:'0',order:index*1024};delete card.panOrder;delete card.judgmentEffect;
        patch[`${targetPath}/${key}`]=card;
      });
      place(top,topPath);place(bottom,bottomPath);
      const existingHand=orderedEntries(handSnapshot.val()||{});
      existingHand.forEach((item,index)=>{patch[`${handPath}/${item.key}/order`]=(index+draw.length)*1024;});
      let handOrder=-1024;
      draw.forEach(sourcePath=>{
        const key=push(ref(this.db,handPath)).key,card={...byPath.get(sourcePath),show:'0',order:handOrder+=1024};delete card.panOrder;delete card.judgmentEffect;
        patch[`${handPath}/${key}`]=card;
      });
      patch[`${prefix}/${this.currentPlayer}/areaCounts/hand`]=Object.keys(handSnapshot.val()||{}).length+draw.length;
      Object.assign(patch,this.actionHintPatch(ACTION_HINT_OPCODE.REARRANGE_DECK));
      await update(ref(this.db),patch);released=true;return true;
    }finally{if(!released)await locks.release();}
  }

  async showSelectedCards(cards = [...this.selectedCards]) {
    const uniqueCards = [...new Set(cards)];
    if (!uniqueCards.length) return;
    const base = ref(this.db).toString();
    const updates = {};
    const revealed = [];
    uniqueCards.forEach(card => {
      const path = card.cardRef.toString().replace(base, '');
      const willReveal = card.cardData.show !== '1';
      updates[`${path}/show`] = willReveal ? '1' : '0';
      if (willReveal) {
        const data = paiKu[card.cardData.id];
        const target = path
          .replace(`game/${this.gameId}/`, '')
          .replace(/\/cards\/[^/]+$/, '');
        if (data?.suit && data?.rank && data?.name) {
          revealed.push(target, data.suit, data.rank, data.name);
        }
      }
    });
    if (revealed.length) Object.assign(updates, this.actionHintPatch(ACTION_HINT_OPCODE.REVEAL_CARDS, revealed));
    await update(ref(this.db), updates);
    uniqueCards.forEach(card => card.unselectCard());
  }

  async recordViewedCardPaths(paths) {
    if (!this.currentPlayer) throw Error('请先入座');
    const prefix = `game/${this.gameId}/`;
    const targets = [...new Set(paths)]
      .filter(path => path.startsWith(prefix) && /\/cards\/[^/]+$/.test(path))
      .map(path => path.slice(prefix.length).replace(/\/cards\/[^/]+$/, ''));
    if (!targets.length) throw Error('没有可观看的牌');
    return update(ref(this.db), this.actionHintPatch(ACTION_HINT_OPCODE.VIEW_CARDS, targets));
  }

  recordViewedCards(cards = [...this.selectedCards]) {
    const base = ref(this.db).toString();
    const paths = [...new Set(cards.map(card => card.cardRef?.toString().replace(base, '')).filter(Boolean))];
    return this.recordViewedCardPaths(paths);
  }

  async dropSeletedCards(targetCardsRef) {
    const base = ref(this.db).toString();
    const targetPath = targetCardsRef.toString().replace(base, '');
    const paths = [...new Set(this.selectedCards
      .map(card => card.cardRef.toString().replace(base, '')))]
      .filter(path => !path.startsWith(`${targetPath}/`));
    if (!paths.length) return;
    return this.moveOrderedCards(paths, targetCardsRef);
  }
}

export { gameController };
