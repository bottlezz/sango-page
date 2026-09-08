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
function areaLabel(path) {
  const [owner, area] = path.split('/');
  return `${owner === 'tableDecks' ? '' : owner + ' '}${labels[area]}`;
}

// Public records never contain card IDs, suits, ranks, or hidden general names.
export function describeChanges(before, after) {
  const changes = [], oldAreas = areas(before), newAreas = areas(after);
  for (const path of new Set([...Object.keys(oldAreas), ...Object.keys(newAreas)])) {
    const old = oldAreas[path] || {}, next = newAreas[path] || {}, label = areaLabel(path);
    const removed = Object.keys(old).filter(key => !next[key] || next[key].id !== old[key].id);
    const added = Object.keys(next).filter(key => !old[key] || next[key].id !== old[key].id);
    if (removed.length) changes.push(`${label}移出 ${removed.length} 张`);
    if (added.length) {
      const effects = added.map(key=>next[key].judgmentEffect).filter(Boolean);
      changes.push(`${label}移入 ${added.length} 张${effects.length ? `（${effects.join('、')}）` : ''}`);
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
    if (old.hp !== next.hp) changes.push(`${seat} 体力：${old.hp || '未设置'} → ${next.hp || '未设置'}`);
    for (const [index, label] of ['翻面','连环'].entries()) {
      const was = old.debuff?.[index] === '1', now = next.debuff?.[index] === '1';
      if (was !== now) changes.push(`${seat} ${label}：${now ? '开启' : '解除'}`);
    }
    if (old.role !== next.role) changes.push(`${seat} 身份已更新`);
    if (Boolean(old.jiangLocked) !== Boolean(next.jiangLocked)) changes.push(`${seat} ${next.jiangLocked ? '确认选将' : '解除选将锁定'}`);
  }
  return changes;
}

export function appendActionLog(before, after, key, actor, timestamp, action = '') {
  const changes = describeChanges(before, after);
  if (!changes.length) return after;
  after.actionLogs = {...before?.actionLogs, [key]: {actor, timestamp, action, changes}};
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
