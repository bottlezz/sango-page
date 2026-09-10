import {orderedEntries} from './cardOrder.mjs';

const labels = {hand:'手牌',zhuang:'装备区',pan:'判定区',other1:'区1',other2:'区2',jiang:'选将区',jiang1:'主将',jiang2:'副将',pai:'牌堆',paiBottom:'牌堆底部',discard:'公共区'};
function areas(room) {
  const result = {};
  for (const [owner, data] of Object.entries(room || {})) {
    if (owner !== 'tableDecks' && !/^p\d+$/.test(owner)) continue;
    for (const [area, value] of Object.entries(data || {})) {
      if (labels[area]) result[`${owner}/${area}`] = value?.cards || {};
    }
  }
  return result;
}
function playerLabel(room, owner) {
  const name = room?.[owner]?.name;
  return name && name !== 'empty' ? name : owner;
}
function areaLabel(room, path) {
  const [owner, area] = path.split('/');
  if (owner === 'tableDecks') return area === 'discard' ? '公共区域' : labels[area];
  return `${playerLabel(room, owner)} 的${labels[area]}`;
}
function changesBetween(old, next) {
  return {
    removed: Object.keys(old).filter(key => !next[key] || next[key].id !== old[key].id),
    added: Object.keys(next).filter(key => !old[key] || next[key].id !== old[key].id),
  };
}
function describeMoves(before, after, oldAreas, newAreas) {
  const removals = new Map(), additions = new Map(), moved = new Map(), groups = new Map();
  const add = (index, id, value) => index.set(id, [...(index.get(id) || []), value]);
  const isGeneralArea = path => /^p\d+\/(jiang|jiang1|jiang2)$/.test(path);
  for (const path of new Set([...Object.keys(oldAreas), ...Object.keys(newAreas)])) {
    const old = oldAreas[path] || {}, next = newAreas[path] || {}, {removed, added} = changesBetween(old, next);
    removed.forEach(key => add(removals, old[key].id, {path, key}));
    added.forEach(key => add(additions, next[key].id, {path, key}));
  }
  for (const [id, sources] of removals) {
    const targets = additions.get(id) || [];
    for (let index = 0; index < Math.min(sources.length, targets.length); index++) {
      const source = sources[index], target = targets[index];
      if (source.path === target.path) continue;
      moved.set(source.path, new Set([...(moved.get(source.path) || []), source.key]));
      moved.set(target.path, new Set([...(moved.get(target.path) || []), target.key]));
      const groupKey = `${source.path}|${target.path}`;
      groups.set(groupKey, (groups.get(groupKey) || 0) + 1);
    }
  }
  const moves = [...groups].map(([paths, count]) => {
    const [source, target] = paths.split('|');
    if (isGeneralArea(source) && isGeneralArea(target)) return null;
    return `从 ${areaLabel(after, source)} 移除 ${count} 张牌，置入 ${areaLabel(after, target)}`;
  }).filter(Boolean);
  return {moves, moved};
}
function detectDraw(before, after) {
  const oldAreas = areas(before), newAreas = areas(after), changed = [];
  for (const path of new Set([...Object.keys(oldAreas), ...Object.keys(newAreas)])) {
    const old = oldAreas[path] || {}, next = newAreas[path] || {}, delta = changesBetween(old, next);
    if (delta.removed.length || delta.added.length) changed.push({path, old, next, ...delta});
  }
  if (changed.length !== 2) return null;
  const source = changed.find(item => /^tableDecks\/(pai|paiBottom)$/.test(item.path));
  const target = changed.find(item => /^p\d+\/hand$/.test(item.path));
  if (!source || !target || source.added.length || target.removed.length || source.removed.length !== target.added.length) return null;
  const removedIds = source.removed.map(key => source.old[key].id).sort();
  const addedIds = target.added.map(key => target.next[key].id).sort();
  if (removedIds.some((id, index) => id !== addedIds[index])) return null;
  return {seat: target.path.split('/')[0], count: addedIds.length};
}

// Public records never contain card IDs, suits, ranks, or hidden general names.
export function describeChanges(before, after) {
  const changes = [], oldAreas = areas(before), newAreas = areas(after);
  const {moves, moved} = describeMoves(before, after, oldAreas, newAreas);
  changes.push(...moves);
  for (const path of new Set([...Object.keys(oldAreas), ...Object.keys(newAreas)])) {
    const old = oldAreas[path] || {}, next = newAreas[path] || {}, label = areaLabel(after, path);
    const {removed, added} = changesBetween(old, next);
    const movedKeys = moved.get(path) || new Set();
    const remainingRemoved = removed.filter(key => !movedKeys.has(key));
    const remainingAdded = added.filter(key => !movedKeys.has(key));
    if (remainingRemoved.length) changes.push(`${label}移出 ${remainingRemoved.length} 张牌`);
    if (remainingAdded.length) {
      const effects = remainingAdded.map(key=>next[key].judgmentEffect).filter(Boolean);
      changes.push(`${label}移入 ${remainingAdded.length} 张牌${effects.length ? `（${effects.join('、')}）` : ''}`);
    }
    const stable = Object.keys(next).filter(key=>old[key]?.id === next[key].id);
    const shown = stable.filter(key=>String(old[key].show || '0') !== String(next[key].show || '0'));
    for (const state of ['0','1']) {
      const count = shown.filter(key=>String(next[key].show || '0') === state).length;
      if (count) changes.push(`${label}${state === '1' ? '亮出' : '暗置'} ${count} 张`);
    }
    for (const key of stable) {
      if (old[key].judgmentEffect !== next[key].judgmentEffect) changes.push(`${label}判定效果：${old[key].judgmentEffect || '无'} → ${next[key].judgmentEffect || '无'}`);
    }
    if (!removed.length && !added.length && JSON.stringify(orderedEntries(old).map(x=>x.key)) !== JSON.stringify(orderedEntries(next).map(x=>x.key))) {
      changes.push(`${label}调整牌序${path.endsWith('/pan') ? `（${orderedEntries(next).map(x=>x.value.judgmentEffect || '判定牌').join(' → ')}）` : ''}`);
    }
  }
  for (const seat of new Set([...Object.keys(before || {}), ...Object.keys(after || {})])) {
    if (!/^p\d+$/.test(seat)) continue;
    const old = before?.[seat] || {}, next = after?.[seat] || {};
    const player = playerLabel(after, seat);
    if (old.hp !== next.hp) changes.push(`${player} 的体力：${old.hp || '未设置'} → ${next.hp || '未设置'}`);
    for (const [index, label] of ['翻面','连环'].entries()) {
      const was = old.debuff?.[index] === '1', now = next.debuff?.[index] === '1';
      if (was !== now) changes.push(`${player} ${label}${now ? '开启' : '解除'}`);
    }
    if (old.role !== next.role) changes.push(`${player} 的身份已更新`);
    if (Boolean(old.jiangLocked) !== Boolean(next.jiangLocked)) changes.push(`${player}${next.jiangLocked ? '确认选将' : '解除选将锁定'}`);
  }
  return changes;
}

export function appendActionLog(before, after, key, actor, timestamp, action = '') {
  const draw = detectDraw(before, after);
  const drawText = count => {
    const player = playerLabel(after, draw.seat);
    return `${player === actor ? '' : `让 ${player} `}摸了${count}张牌`;
  };
  const changes = draw ? [drawText(draw.count)] : describeChanges(before, after);
  if (!changes.length) return after;
  const logs = {...before?.actionLogs};
  const latestKey = Object.keys(logs).sort().at(-1);
  const latest = latestKey ? logs[latestKey] : null;
  if (draw && latest?.aggregate?.type === 'draw' && latest.actor === actor && latest.aggregate.seat === draw.seat) {
    const count = Number(latest.aggregate.count || 0) + draw.count;
    logs[latestKey] = {...latest, timestamp, changes: [drawText(count)], aggregate: {type: 'draw', seat: draw.seat, count}};
  } else {
    logs[key] = {actor, timestamp, action, changes, ...(draw ? {aggregate: {type: 'draw', seat: draw.seat, count: draw.count}} : {})};
  }
  after.actionLogs = logs;
  // Keep room transactions bounded; retain the latest 500 committed operations.
  const keys = Object.keys(after.actionLogs).sort();
  for (const expired of keys.slice(0, Math.max(0, keys.length - 500))) delete after.actionLogs[expired];
  return after;
}

export function applyRoomPatch(room, patch, prefix) {
  const next = structuredClone(room || {});
  for (const [path, value] of Object.entries(patch)) {
    if (!path.startsWith(prefix)) throw Error('只能修改当前房间');
    const keys = path.slice(prefix.length).split('/');
    if (keys[0] === 'actionLogs') throw Error('日志由操作自动生成');
    let parent = next;
    for (const key of keys.slice(0,-1)) parent = parent[key] ??= {};
    if (value === null) delete parent[keys.at(-1)];
    else parent[keys.at(-1)] = structuredClone(value);
  }
  return next;
}
