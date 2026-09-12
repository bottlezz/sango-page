import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dealOpeningHands, recentEntries} from '../src/cardOrder.mjs';

const cards = (n, start = 0) => Object.fromEntries(Array.from({length:n}, (_,i) =>
  ['c'+i, {id:'card'+(start+i), order:i*1024, show:'1'}]));
const room = () => ({tableDecks:{pai:{cards:cards(30)}}, p1:{name:'玩家',hand:{cards:{}}}});

test('deals four per seat in pile order, hides cards and preserves remaining cards', () => {
  const before = room();
  const after = dealOpeningHands(before, 6);
  for (let i=1;i<=6;i++) {
    const hand = recentEntries(after['p'+i].hand.cards);
    assert.deepEqual(hand.map(c=>c.value.id), Array.from({length:4}, (_,j)=>'card'+(i*4-1-j)));
    assert.ok(hand.every(c=>c.value.show==='0'));
    assert.ok(hand.every(c=>c.value.order===undefined));
  }
  assert.equal(after.p1.name, '玩家');
  assert.equal(Object.keys(after.tableDecks.pai.cards).length, 6);
  assert.equal(Object.keys(before.tableDecks.pai.cards).length, 30);
  assert.throws(()=>dealOpeningHands(after,6), /手牌为空/);
});

test('rejects occupied hands and insufficient pile without changing the room', () => {
  const state = room();
  state.p6 = {hand:{cards:cards(1)}};
  assert.throws(()=>dealOpeningHands(state,6), /手牌为空/);
  delete state.p6;
  state.tableDecks.pai.cards = cards(23);
  const before = structuredClone(state);
  assert.throws(()=>dealOpeningHands(state,6), /不足/);
  assert.deepEqual(state, before);
});
