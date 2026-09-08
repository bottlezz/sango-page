export function orderedEntries(cards = {}, judgment = false) {
  return Object.entries(cards).reverse().map(([key, value], index) => ({key, value, index}))
    .sort((a, b) => (a.value.order ?? (judgment ? a.value.panOrder : undefined) ?? a.index * 1024)
      - (b.value.order ?? (judgment ? b.value.panOrder : undefined) ?? b.index * 1024));
}

// Build a complete deal so the transaction cannot leave a partially dealt table.
export function dealOpeningHands(room, playerCount) {
  if (!room || !Number.isInteger(playerCount) || playerCount < 1) throw Error('房间尚未准备好');
  const seats = Array.from({length: playerCount}, (_, i) => `p${i + 1}`);
  if (seats.some(seat => Object.keys(room[seat]?.hand?.cards || {}).length)) {
    throw Error('只有所有玩家手牌为空时才能发牌');
  }
  const deck = ['pai', 'paiBottom'].flatMap(area =>
    orderedEntries(room.tableDecks?.[area]?.cards || {}).map(card => ({...card, area})));
  if (deck.length < playerCount * 4) throw Error(`牌堆不足，需要 ${playerCount * 4} 张牌`);
  const next = structuredClone(room);
  seats.forEach((seat, seatIndex) => {
    next[seat] ??= {};
    next[seat].hand ??= {};
    next[seat].hand.cards = {};
    deck.slice(seatIndex * 4, seatIndex * 4 + 4).forEach(({key, value, area}, index) => {
      const card = {...value, show: '0', order: index * 1024};
      delete card.panOrder;
      delete card.judgmentEffect;
      next[seat].hand.cards[`deal${index}`] = card;
      delete next.tableDecks[area].cards[key];
    });
  });
  return next;
}

// Produce one atomic multi-path update, including both removal and insertion.
export const judgmentEffects = ['乐不思蜀', '兵粮寸断', '闪电'];

export function orderedMovePatch(targetPath, targetCards, sources, beforeKey, newKey, effects = {}, legacyEffect = () => null) {
  const sourcePaths = new Set(sources.map(source => source.path));
  const remaining = orderedEntries(targetCards, targetPath.includes('/pan/'))
    .filter(item => !sourcePaths.has(`${targetPath}/${item.key}`));
  const incoming = sources.map(source => ({
    key: source.path.slice(0, source.path.lastIndexOf('/')) === targetPath ? source.path.split('/').pop() : newKey(),
    value: {...source.value}, source,
  }));
  const judgment = targetPath.includes('/pan/');
  if (judgment) {
    const used = new Set(remaining.map(item => item.value.judgmentEffect || legacyEffect(item.value)).filter(Boolean));
    for (const item of incoming) {
      const sameArea = item.source.path.startsWith(`${targetPath}/`);
      const effect = sameArea ? item.value.judgmentEffect || legacyEffect(item.value) : effects[item.source.path];
      if (!judgmentEffects.includes(effect)) throw Error('请选择判定效果：乐不思蜀、兵粮寸断或闪电');
      if (used.has(effect)) throw Error(`判定区已有${effect}，每种效果只能放一张牌`);
      used.add(effect);
      item.value.judgmentEffect = effect;
    }
    if (remaining.length + incoming.length > 3) throw Error('判定区最多放三张牌');
  }
  if (targetPath.includes('/zhuang/') && remaining.length + incoming.length > 4) throw Error('装备区最多放四张牌');
  const index = beforeKey == null ? remaining.length : remaining.findIndex(item => item.key === beforeKey);
  if (index < 0) throw Error('目标牌已移动，请重新拖放');
  remaining.splice(index, 0, ...incoming);
  const patch = {};
  remaining.forEach((item, index) => {
    const path = `${targetPath}/${item.key}`, order = index * 1024;
    if (item.source && item.source.path !== path) {
      patch[item.source.path] = null;
      item.value.show = '0';
      delete item.value.panOrder;
      if (!judgment) delete item.value.judgmentEffect;
      if (targetPath.includes('/pan/')) item.value.panOrder = Date.now() + index;
      patch[path] = {...item.value, order};
    } else patch[`${path}/order`] = order;
  });
  return patch;
}
