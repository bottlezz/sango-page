import {test} from 'node:test';
import assert from 'node:assert/strict';
import {describeChanges,appendActionLog,applyRoomPatch} from '../src/actionLog.mjs';
const before = {p1:{hp:'4/5',debuff:'00',hand:{cards:{a:{id:'secret-card',show:'0'}}}},tableDecks:{discard:{cards:{}}}};
test('moves record both areas without revealing identity; no-op is silent',()=>{
 const after=applyRoomPatch(before,{'game/6/p1/hand/cards/a':null,'game/6/tableDecks/discard/cards/b':{id:'secret-card',show:'0'}},'game/6/');
 assert.deepEqual(describeChanges(before,after),['p1 手牌移出 1 张','公共区移入 1 张']);
 assert.deepEqual(describeChanges(before,structuredClone(before)),[]);
 assert.equal(JSON.stringify(appendActionLog(before,after,'key','p1',1).actionLogs).includes('secret-card'),false);
});
test('HP, max HP, statuses and revealed cards include their actual changes',()=>{
 const after=structuredClone(before);after.p1.hp='3/4';after.p1.debuff='11';after.p1.hand.cards.a.show='1';
 const changes=describeChanges(before,after);
 for(const text of ['p1 体力：4/5 → 3/4','p1 翻面：开启','p1 连环：开启','p1 手牌亮出 1 张']) assert.ok(changes.includes(text));
});
test('judgment reorder persists visible effect sequence',()=>{
 const old={p1:{pan:{cards:{a:{id:'x',judgmentEffect:'闪电',order:0},b:{id:'y',judgmentEffect:'乐不思蜀',order:1}}}}};
 const next=structuredClone(old);next.p1.pan.cards.a.order=2;
 assert.deepEqual(describeChanges(old,next),['p1 判定区调整牌序（乐不思蜀 → 闪电）']);
});
test('logs retain 500 entries and preserve existing records through room reset',()=>{
 const old=structuredClone(before);old.actionLogs=Object.fromEntries(Array.from({length:500},(_,i)=>[String(i).padStart(5,'0'),{actor:'p1'}]));
 const next=structuredClone(old);next.p1.hp='3/5';
 const result=appendActionLog(old,next,'99999','p2',2);
 assert.equal(Object.keys(result.actionLogs).length,500);assert.equal(result.actionLogs['00000'],undefined);assert.ok(result.actionLogs['99999']);
});
