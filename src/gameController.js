import {
  ref,
  child,
  get,
  push,
  update,
  set,
  increment,
  serverTimestamp,
  runTransaction,
} from "firebase/database";

import jiangKu from "./data/jiang.json";
import paiKu from "./data/pai.json";
import { orderedEntries, orderedMovePatch, dealOpeningHands } from "./cardOrder.mjs";
import { acquireLocks } from './databaseLocks.mjs';
import {ACTION_HINT_OPCODE, USE_CARD_NAMES, encodeActionHint} from './localActionLog.mjs';
class gameController {
  db;
  gameId;
  currentPlayer;
  userName;
  playerCount;
  rootComponent;
  selectedCards = [];
  selectionMenuSyncScheduled = false;
  constructor(db, gameId) {
    this.db = db;
    this.gameId = gameId;
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

  async revealGeneral(cardRef) {
    const base = ref(this.db).toString();
    const cardPath = cardRef.toString().replace(base, '');
    const match = cardPath.match(/^game\/([^/]+)\/(p\d+)\/(jiang1|jiang2)\/cards\/([^/]+)$/);
    if (!match || match[1] !== String(this.gameId)) return this.showCard(cardRef);
    const [, , playerKey, sourceArea, cardKey] = match;
    const playerPath = `game/${this.gameId}/${playerKey}`;
    const mainPath = `${playerPath}/jiang1/cards`;
    const vicePath = `${playerPath}/jiang2/cards`;
    const [mainSnapshot, viceSnapshot] = await Promise.all([
      get(ref(this.db, mainPath)),
      get(ref(this.db, vicePath)),
    ]);
    const mainCards = mainSnapshot.val() || {};
    const viceCards = viceSnapshot.val() || {};
    const sourceCards = sourceArea === 'jiang1' ? mainCards : viceCards;
    if (!sourceCards[cardKey]) throw Error('武将位置已改变，请重试');
    const hasRevealed = [...Object.values(mainCards), ...Object.values(viceCards)]
      .some(card => card?.show === '1');
    const patch = {};
    if (!hasRevealed && sourceArea === 'jiang2') {
      patch[mainPath] = {...viceCards, [cardKey]: {...viceCards[cardKey], show:'1'}};
      patch[vicePath] = mainCards;
    } else {
      patch[`${cardPath}/show`] = '1';
    }
    const generalName=jiangKu[sourceCards[cardKey].id]?.name||'未知武将';
    Object.assign(patch,this.actionHintPatch(ACTION_HINT_OPCODE.REVEAL_GENERAL,[generalName]));
    await update(ref(this.db), patch);
    return true;
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
    if(target?.[2]==='pan'&&paths.some(path=>!path.startsWith(`${targetPath}/`)))return ACTION_HINT_OPCODE.PLACE_JUDGMENT;
    if (/\/tableDecks\/discard\/cards$/.test(targetPath) && sources.length) {
      return sources.some(match=>match[1]!==this.currentPlayer) ? ACTION_HINT_OPCODE.DISCARD_OTHER : ACTION_HINT_OPCODE.DISCARD;
    }
    if(target?.[2]==='hand'&&target[1]===this.currentPlayer&&paths.some(path=>/\/tableDecks\/pai\/cards\//.test(path)))return ACTION_HINT_OPCODE.DRAW;
    if(target?.[2]==='hand'&&target[1]===this.currentPlayer&&paths.some(path=>/\/tableDecks\/discard\/cards\//.test(path)))return ACTION_HINT_OPCODE.TAKE_DISCARD;
    if (!sources.some(match=>match[1]!==this.currentPlayer) && !(target&&target[1]!==this.currentPlayer)) return null;
    if (target?.[2]==='hand' && target[1]!==this.currentPlayer && paths.some(path=>/\/tableDecks\/pai\/cards\//.test(path))) return ACTION_HINT_OPCODE.DRAW_FOR_OTHER;
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
    const deckPaths = [`${prefix}/tableDecks/pai/cards`];
    const handPaths = Array.from({length:Number(this.playerCount)}, (_,index)=>`${prefix}/p${index+1}/hand/cards`);
    const locks = await this.acquireGameLocks(deckPaths.map(path=>`area:${path}`));
    let released = false;
    try {
      const snapshots = await Promise.all([...deckPaths, ...handPaths].map(path=>get(ref(this.db,path))));
      const hands = snapshots.slice(deckPaths.length);
      if (hands.some(snapshot=>snapshot.exists() && Object.keys(snapshot.val() || {}).length)) {
        throw Error('只有所有玩家手牌为空时才能发牌');
      }
      const deck = orderedEntries(snapshots[0].val() || {}).map(card=>({...card,path:deckPaths[0]}));
      const needed = handPaths.length * 4;
      if (deck.length < needed) throw Error(`牌堆不足，需要 ${needed} 张牌`);
      const patch = locks.releasePatch();
      deck.slice(0,needed).forEach((item,index)=>{
        patch[`${item.path}/${item.key}`] = null;
        const handPath = handPaths[Math.floor(index/4)], card = {...item.value,show:'0'};
        delete card.order;delete card.panOrder;delete card.judgmentEffect;
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

  async moveOrderedCards(paths, targetRef, beforeKey = null, effects = {}, actionOpcode = null, actionArgs = null) {
    const base = ref(this.db).toString();
    const targetPath = targetRef.toString().replace(base, '');
    const prefix = `game/${this.gameId}/`;
    if (!targetPath.startsWith(prefix) || !targetPath.endsWith('/cards')) throw Error('无效的目标区域');
    const unique = [...new Set(paths)];
    if (!unique.length || unique.some(path => !path.startsWith(prefix) || !/\/cards\/[^/]+$/.test(path))) throw Error('无效的卡牌');
    const sourceAreas = [...new Set(unique.map(path=>path.slice(0,path.lastIndexOf('/'))))];
    const isPile = path => /\/tableDecks\/pai\/cards$/.test(path);
    const targetNeedsSnapshot = isPile(targetPath) || /\/(zhuang|pan)\/cards$/.test(targetPath);
    const lockAreas = [...sourceAreas, targetPath].filter(isPile);
    const locks = await this.acquireGameLocks(lockAreas.map(path=>`area:${path}`));
    let released = false;
    try {
      const [target, ...snapshots] = await Promise.all([
        targetNeedsSnapshot ? get(targetRef) : Promise.resolve({val:()=>({})}),
        ...unique.map(path => get(ref(this.db, path))),
      ]);
      if (snapshots.some(snapshot => !snapshot.exists())) throw Error('卡牌已移动，请重新选择');
      const sources = snapshots.map((snapshot, index) => ({path: unique[index], value: snapshot.val()}));
      const patch = orderedMovePatch(targetPath, target.val() || {}, sources, beforeKey,
        () => push(targetRef).key, effects, card => paiKu[card.id]?.name);
      if (/\/tableDecks\/discard\/cards$/.test(targetPath)) {
        Object.entries(patch).forEach(([path,value]) => {
          if (path.startsWith(`${targetPath}/`) && value && typeof value === 'object') {
            value.discardedAt = serverTimestamp();
          }
        });
      }
      const countInfo = path => {
        const match = path.match(/^game\/[^/]+\/(p\d+)\/(hand|other1|other2)\/cards$/);
        return match ? {areaPath:path,countPath:`game/${this.gameId}/${match[1]}/areaCounts/${match[2]}`} : null;
      };
      const countDeltas = new Map();
      const addCountDelta = (path, delta) => {
        const info = countInfo(path);
        if (info) countDeltas.set(info.countPath, (countDeltas.get(info.countPath) || 0) + delta);
      };
      const incomingCount = unique.filter(path => path.slice(0,path.lastIndexOf('/')) !== targetPath).length;
      if (incomingCount) addCountDelta(targetPath, incomingCount);
      sourceAreas.forEach(areaPath => {
        if (areaPath !== targetPath) {
          const movedCount = unique.filter(path => path.slice(0,path.lastIndexOf('/')) === areaPath).length;
          addCountDelta(areaPath, -movedCount);
        }
      });
      countDeltas.forEach((delta,path)=>{if(delta)patch[path]=increment(delta);});
      const hintOpcode=actionOpcode||this.moveActionOpcode(unique,targetPath);
      if(hintOpcode){
        const includesPublicFaces=[ACTION_HINT_OPCODE.PLAY,ACTION_HINT_OPCODE.DISCARD,ACTION_HINT_OPCODE.DISCARD_OTHER,ACTION_HINT_OPCODE.TAKE_DISCARD].includes(hintOpcode);
        const hintArgs=Array.isArray(actionArgs)?actionArgs:includesPublicFaces
          ? ['i',...sources.flatMap(source=>{
              const sourceArea=source.path.slice(prefix.length).replace(/\/cards\/[^/]+$/,'');
              return [sourceArea,source.value.id];
            })]
          : hintOpcode===ACTION_HINT_OPCODE.PLACE_JUDGMENT
            ? [targetPath.match(/\/(p\d+)\/pan\/cards$/)?.[1]||'p0','i',...sources.flatMap(source=>[source.value.id,effects[source.path]])]
            : [];
        Object.assign(patch,this.actionHintPatch(hintOpcode,hintArgs));
      }
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
    const playerPath=`game/${this.gameId}/${playerKey}`;
    const targetPaths=[`${playerPath}/jiang1/cards`,`${playerPath}/jiang2/cards`];
    const snapshots=await Promise.all(sources.map(path=>get(ref(this.db,path))));
    if(snapshots.some(snapshot=>!snapshot.exists()))throw Error('武将已移动，请重新选择');
    const patch={};
    snapshots.forEach((snapshot,index)=>{patch[sources[index]]=null;patch[`${targetPaths[index]}/${snapshot.key}`]=snapshot.val();});
    patch[`${playerPath}/jiangLocked`]=true;
    Object.assign(patch,this.actionHintPatch(ACTION_HINT_OPCODE.LOCK_GENERALS));
    await update(ref(this.db),patch);return true;
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
    const locks = await this.acquireGameLocks(/\/tableDecks\/pai\/cards$/.test(path) ? [`area:${path}`] : []);
    let released = false;
    try {
      const snapshot = await get(cardsRef);
      if (!snapshot.exists()) return;
      const cardsData = this.shuffleData(snapshot.val(), /\/tableDecks\/pai\/cards$/.test(path));
      const area=path.match(/\/(pai|discard|hand|zhuang|pan|other1|other2|jiang)\/cards$/)?.[1];
      const code={pai:'p',discard:'d',hand:'h',zhuang:'z',pan:'n',other1:'o',other2:'o',jiang:'j'}[area]||'o';
      await update(ref(this.db),{[path]:cardsData,...this.actionHintPatch(ACTION_HINT_OPCODE.SHUFFLE,[code]),...locks.releasePatch()});released=true;
    } finally {
      if (!released) await locks.release();
    }
  }

  shuffleData(cardsData, persistOrder = false) {
    const keys = Object.keys(cardsData);
    const len = keys.length;
    for (let i = 0; i < len; i++) {
      const from = Math.floor(Math.random() * len);
      const to = Math.floor(Math.random() * len);
      const fromVal = cardsData[keys[from]];
      cardsData[keys[from]] = cardsData[keys[to]];
      cardsData[keys[to]] = fromVal;
    }
    keys.forEach((key, index) => {
      if (persistOrder) cardsData[key].order = index * 1024;
      else delete cardsData[key].order;
    });
    return cardsData;
  }

  async resetPai() {
    const prefix=`game/${this.gameId}/tableDecks`, paths=['pai','discard'].map(area=>`${prefix}/${area}/cards`);
    const locks=await this.acquireGameLocks([`area:${paths[0]}`]);
    let released=false;
    try {
      const snapshots=await Promise.all(paths.map(path=>get(ref(this.db,path))));
      const merged={};
      snapshots.forEach(snapshot=>Object.entries(snapshot.val()||{}).forEach(([key,value])=>{
        const nextKey=merged[key] ? push(ref(this.db,paths[0])).key : key;
        const card={...value,show:'0'};delete card.judgmentEffect;delete card.panOrder;
        merged[nextKey]=card;
      }));
      this.shuffleData(merged, true);
      await update(ref(this.db),{
        [`${prefix}/pai/cards`]:merged,[`${prefix}/discard`]:null,
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
    // Replace the whole deck subtree so removed deck containers cannot survive
    // a table reset as orphaned data.
    updates[tableDeckPath] = {
      discard: {},
      jiang: {},
      pai: { cards: this.getShuffledPai() },
    };
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
    this.shuffleData(initPaiDeckCards, true);
    this.shuffleData(initPaiDeckCards, true);
    return initPaiDeckCards;
  }

  async dispatchJiang() {
    const jiangCards = this.getShuffledJiang();
    const updates = {};
    for (let i = 0; i < this.playerCount; i++) {
      const jiangs = jiangCards.splice(0, 7);
      const playerPath=`game/${this.gameId}/p${i + 1}`;
      updates[`${playerPath}/jiang/cards`] = jiangs;
      updates[`${playerPath}/jiang1`] = {};
      updates[`${playerPath}/jiang2`] = {};
      updates[`${playerPath}/jiangLocked`] = false;
    }
    await update(ref(this.db),{...updates,...this.actionHintPatch(ACTION_HINT_OPCODE.DEAL_GENERALS)});
    return true;
  }

  addSelectedCard(sgCard) {
    if (this.selectedCards.includes(sgCard)) return;
    this.selectedCards.push(sgCard);
    this.scheduleSelectionMenuSync();
  }

  removeSelectedCard(sgCard) {
    const index = this.selectedCards.indexOf(sgCard);
    if (index === -1) return;
    this.selectedCards.splice(index, 1);
    this.scheduleSelectionMenuSync();
  }

  scheduleSelectionMenuSync() {
    if (this.selectionMenuSyncScheduled) return;
    this.selectionMenuSyncScheduled = true;
    queueMicrotask(() => {
      this.selectionMenuSyncScheduled = false;
      if (this.selectedCards.length === 0) this.rootComponent.hideCardMenu();
      else this.rootComponent.showCardMenu();
    });
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

  async useSelectedCards(cardName, targetSeat = null, cards = [...this.selectedCards]) {
    if (!USE_CARD_NAMES.includes(cardName)) throw Error('无效的使用牌名');
    const targetSeats=targetSeat==null?[]:[...new Set(Array.isArray(targetSeat)?targetSeat:String(targetSeat).split(','))];
    if (targetSeats.some(seat=>!/^p\d+$/.test(seat))) throw Error('无效的目标玩家');
    if (['乐不思蜀','兵粮寸断','闪电'].includes(cardName)) throw Error('延迟锦囊需要放入目标玩家的判定区');
    const allowsTarget = ['杀','火杀','雷杀','桃','无懈可击','无中生有','决斗','过河拆桥','顺手牵羊','铁索连环','火攻','借刀杀人'].includes(cardName);
    const requiresTarget = allowsTarget && !['杀','火杀','雷杀'].includes(cardName);
    if (requiresTarget && !targetSeats.length) throw Error(`${cardName}需要选择目标`);
    if (!allowsTarget && targetSeats.length) throw Error(`${cardName}不需要选择目标`);
    const base = ref(this.db).toString(), prefix = `game/${this.gameId}/`;
    const paths = cards.map(card => card.cardRef.toString().replace(base, ''));
    if (!paths.length || paths.some(path => !path.includes(`/${this.currentPlayer}/`))) throw Error('只能使用自己区域的牌');
    const payload = cards.flatMap((card,index) => {
      const path = paths[index];
      const source = path.slice(prefix.length).replace(/\/cards\/[^/]+$/, '');
      return [source, card.cardData?.id];
    });
    if (payload.some(value => !value)) throw Error('无法读取所选牌');
    return this.moveSelectedCards(cards, `game/${this.gameId}/tableDecks/discard/cards`,
      ACTION_HINT_OPCODE.USE_CARD, [cardName, targetSeats.join(',') || '-', 'i', ...payload]);
  }

  async placeDelayedTrick(cardName, targetSeat, cards = [...this.selectedCards]) {
    if (!['乐不思蜀','兵粮寸断','闪电'].includes(cardName)) throw Error('无效的延迟锦囊');
    if (!/^p\d+$/.test(targetSeat || '')) throw Error(`${cardName}需要选择目标玩家`);
    if (cards.length !== 1) throw Error('延迟锦囊每次只能选择一张牌');
    const base=ref(this.db).toString();
    const paths=cards.map(card=>card.cardRef.toString().replace(base,''));
    if (paths.some(path=>!path.includes(`/${this.currentPlayer}/`))) throw Error('只能使用自己区域的牌');
    const effects=Object.fromEntries(paths.map(path=>[path,cardName]));
    return this.moveOrderedCards(paths,ref(this.db,`game/${this.gameId}/${targetSeat}/pan/cards`),null,effects,ACTION_HINT_OPCODE.PLACE_JUDGMENT);
  }

  async moveSelectedCards(cards, targetPath, actionOpcode = null, actionArgs = null) {
    if (this.selectionMoveBusy) return;
    const base = ref(this.db).toString();
    const paths = [...new Set(cards.map(card => card.cardRef.toString().replace(base, '')))]
      .filter(path => !path.startsWith(`${targetPath}/`));
    if (!paths.length) return;
    this.selectionMoveBusy = true;
    try {
      const ownOnly=paths.every(path=>path.includes(`/${this.currentPlayer}/`));
      return await this.moveOrderedCards(paths, ref(this.db, targetPath), null, {}, ownOnly?actionOpcode:null, ownOnly?actionArgs:null);
    } finally {
      this.selectionMoveBusy = false;
    }
  }

  async topDeckPaths(count = 1) {
    const prefix=`game/${this.gameId}/tableDecks`;
    const deckPath=`${prefix}/pai/cards`;
    const snapshot=await get(ref(this.db,deckPath));
    const cards=orderedEntries(snapshot.val()||{}).map(({key})=>`${deckPath}/${key}`);
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
    const prefix=`game/${this.gameId}`,deckPath=`${prefix}/tableDecks/pai/cards`;
    const handPath=`${prefix}/${this.currentPlayer}/hand/cards`;
    const locks=await this.acquireGameLocks([`area:${deckPath}`]);
    let released=false;
    try{
      const deckSnapshot=await get(ref(this.db,deckPath));
      const deckItems=orderedEntries(deckSnapshot.val()||{}).map(item=>({...item,path:deckPath}));
      const byPath=new Map(deckItems.map(item=>[`${deckPath}/${item.key}`,item.value]));
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
      place([...top,...bottom],deckPath);
      draw.forEach(sourcePath=>{
        const key=push(ref(this.db,handPath)).key,card={...byPath.get(sourcePath),show:'0'};delete card.order;delete card.panOrder;delete card.judgmentEffect;
        patch[`${handPath}/${key}`]=card;
      });
      if(draw.length)patch[`${prefix}/${this.currentPlayer}/areaCounts/hand`]=increment(draw.length);
      Object.assign(patch,this.actionHintPatch(ACTION_HINT_OPCODE.REARRANGE_DECK));
      await update(ref(this.db),patch);released=true;return true;
    }finally{if(!released)await locks.release();}
  }

  async showSelectedCards(cards = [...this.selectedCards]) {
    const uniqueCards = [...new Set(cards)];
    if (!uniqueCards.length) return;
    const showStates = new Set(uniqueCards.map(card => String(card.cardData?.show || '0') === '1'));
    if (showStates.size > 1) throw Error('请选择亮出状态相同的牌');
    const willReveal = !showStates.has(true);
    const base = ref(this.db).toString();
    const updates = {};
    const revealed = [];
    uniqueCards.forEach(card => {
      const path = card.cardRef.toString().replace(base, '');
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
