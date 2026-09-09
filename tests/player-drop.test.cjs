const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../src/wc/sgPlayer.js'), 'utf8');
const methods = source.slice(source.indexOf('  openDropPicker(path,'), source.indexOf('export { SgPlayer };'));
const Player = new Function('ref', 'child', 'judgmentEffects', 'paiKu', `return class { ${methods}`)(
  () => ({ toString: () => 'https://db/' }),
  (parent, suffix) => ({ toString: () => `https://db/${parent}${suffix}` }),
  ['乐不思蜀','兵粮寸断','闪电'], {}
);
function setup(selected = []) {
  const player = new Player();
  const nodes = new Map();
  const moves = [];
  player.gameController = {
    db: {}, gameId: '6', selectedCards: selected.map(path => ({ cardRef: { toString: () => `https://db/${path}` } })),
    targetHasCapacity: async () => true,
    moveOrderedCards: async (paths, target) => { paths.forEach(path => moves.push([path, target.toString()])); return true; },
  };
  player.playerRef = { key: 'p2' };
  player.shadowRoot = { querySelector: () => ({ textContent: '目标玩家' }) };
  player.dropPicker = {
    open: false,
    querySelector(selector) { if (!nodes.has(selector)) nodes.set(selector, {}); return nodes.get(selector); },
    querySelectorAll: () => [],
    showModal() { this.open = true; }, close() { this.open = false; },
  };
  for (const [key, area] of Object.entries({ handArea: 'hand', zhuangArea: 'zhuang', panArea: 'pan', other1Area: 'other1', other2Area: 'other2' })) {
    player[key] = { deckRef: `game/6/p2/${area}`, cardArea: {children: []} };
  }
  return { player, moves };
}
const card = 'game/6/p1/hand/cards/c1';
test('dropping only opens the picker; no card moves before confirmation', () => {
  const { player, moves } = setup();
  player.openDropPicker(card);
  assert.equal(player.dropPicker.open, true);
  assert.deepEqual(moves, []);
  player.dropPicker.close();
  assert.deepEqual(moves, []);
});
test('all five destination choices move to the requested area', async () => {
  for (const key of ['handArea', 'zhuangArea', 'panArea', 'other1Area', 'other2Area']) {
    const { player, moves } = setup();
    player.openDropPicker(card);
    await player.confirmPlayerDrop(key, key === 'panArea' ? {[card]:'闪电'} : null);
    assert.deepEqual(moves, [[card, `https://db/${player[key].deckRef}/cards`]]);
    assert.equal(player.dropPicker.open, false);
  }
});
test('selection is captured on drop and keeps its order', async () => {
  const second = 'game/6/p1/hand/cards/c2';
  const { player, moves } = setup([card, second]);
  player.openDropPicker(card);
  player.gameController.selectedCards = [];
  await player.confirmPlayerDrop('panArea', {[card]:'闪电', [second]:'乐不思蜀'});
  assert.deepEqual(moves.map(move => move[0]), [card, second]);
});

test('judgment requires effect selection before moving any cards', async () => {
  const {player, moves} = setup();
  player.openDropPicker(card);
  await player.confirmPlayerDrop('panArea');
  assert.deepEqual(moves, []);
  assert.deepEqual(player.judgmentPaths, [card]);
  await player.confirmPlayerDrop('panArea', {[card]:'兵粮寸断'});
  assert.equal(moves.length, 1);
});
test('full equipment leaves cards untouched and picker open', async () => {
  const { player, moves } = setup();
  player.gameController.moveOrderedCards = async () => { throw Error('装备区最多放四张牌'); };
  player.openDropPicker(card);
  await player.confirmPlayerDrop('zhuangArea');
  assert.deepEqual(moves, []);
  assert.equal(player.dropPicker.open, true);
  assert.equal(player.dropBusy, false);
});
test('same-area drop is a no-op and external text is ignored', async () => {
  const { player, moves } = setup();
  player.openDropPicker('unrelated text');
  assert.equal(player.dropPicker.open, false);
  player.openDropPicker('game/6/p2/hand/cards/c1');
  await player.confirmPlayerDrop('handArea');
  assert.deepEqual(moves, []);
});
