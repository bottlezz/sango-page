import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ACTION_HINT_OPCODE,createCardTransfers,createLocalLogEntry,decodeActionHint,encodeActionHint} from '../src/localActionLog.mjs';

test('compact hints are versioned and decodable',()=>{
 const encoded=encodeActionHint(ACTION_HINT_OPCODE.DISCARD_OTHER,'p1',[],'aZ8Q');
 assert.equal(encoded,'1|d|1|aZ8Q');
 assert.deepEqual(decodeActionHint(encoded),{opcode:'d',actorSeat:'p1',args:[],nonce:'aZ8Q'});
 assert.equal(decodeActionHint('2|d|1|aZ8Q'),null);
});
test('HP changes use state only and do not reuse an old hint',()=>{
 const hint=encodeActionHint(ACTION_HINT_OPCODE.RESET_TABLE,'p1',[],'W2cN');
 const before={runtime:{a:hint},p3:{hp:'4/5'}},after={runtime:{a:hint},p3:{hp:'3/5'}};
 assert.deepEqual(createLocalLogEntry(before,after,10),{actor:null,timestamp:10,changes:['p3 的体力：4/5 → 3/5']});
});
test('cross-player discard combines actor hint with private-safe diff',()=>{
 const card={id:'secret-card',show:'0'},before={p1:{name:'甲'},p3:{name:'乙',hand:{cards:{a:card}}},tableDecks:{discard:{cards:{}}}};
 const after=structuredClone(before);after.p3.hand.cards={};after.tableDecks.discard.cards.b=card;
 after.runtime={a:encodeActionHint(ACTION_HINT_OPCODE.DISCARD_OTHER,'p1',[],'K4pB')};
 const entry=createLocalLogEntry(before,after,20);
 assert.deepEqual(entry,{actor:'甲',actorSeat:'p1',timestamp:20,changes:['弃置了 乙 的 1 张牌']});
 assert.equal(JSON.stringify(entry).includes('secret-card'),false);
});
test('a transfer into the acting player is logged as taking a card from its owner',()=>{
 const card={id:'secret-card',show:'0'},before={p1:{name:'甲',hand:{cards:{}}},p2:{name:'乙',hand:{cards:{a:card}}}};
 const after=structuredClone(before);after.p2.hand.cards={};after.p1.hand.cards.b=card;
 after.runtime={a:encodeActionHint(ACTION_HINT_OPCODE.TRANSFER_CARD,'p1',[],'T4kQ')};
 assert.deepEqual(createLocalLogEntry(before,after,25),{
  actor:'甲',actorSeat:'p1',timestamp:25,changes:['获取了 乙 的 1 张牌'],
 });
 assert.deepEqual(createLocalLogEntry(before,after,26,{
  'secret-card':{suit:'club',rank:'K',name:'借刀杀人'},
 },'p2'),{
  actor:'甲',actorSeat:'p1',timestamp:26,
  changes:['获取了 乙 的 1 张牌','你失去了 ♣ K 借刀杀人'],
 });
});
test('use-card hint records its declared card name and target',()=>{
 const card={id:'p1',show:'0'},before={p1:{name:'甲',hand:{cards:{a:card}}},p2:{name:'乙'},tableDecks:{discard:{cards:{}}}};
 const after=structuredClone(before);after.p1.hand.cards={};after.tableDecks.discard.cards.b=card;
 after.runtime={a:encodeActionHint(ACTION_HINT_OPCODE.USE_CARD,'p1',['杀','p2','i','p1/hand','p1'],'U8eC')};
 assert.deepEqual(createLocalLogEntry(before,after,30,{p1:{name:'杀'}}),{
 actor:'甲',actorSeat:'p1',timestamp:30,changes:['对 乙 使用了 杀'],
 });
 const transfers=createCardTransfers(before,after,{p1:{suit:'club',rank:'K',name:'借刀杀人'}});
 assert.equal(transfers.length,1);
 assert.deepEqual({label:transfers[0].label,useCardName:transfers[0].useCardName,useTargetSeat:transfers[0].useTargetSeat,usePrimary:transfers[0].usePrimary},{label:'使用',useCardName:'杀',useTargetSeat:'p2',usePrimary:true});
 assert.deepEqual(transfers[0].useCards,[{source:'p1/hand',id:'p1',suit:'club',rank:'K',name:'借刀杀人'}]);
});
test('flash and untargeted kill are logged as played cards',()=>{
 const before={p1:{name:'甲'}},after=structuredClone(before);
 after.runtime={a:encodeActionHint(ACTION_HINT_OPCODE.USE_CARD,'p1',['闪','-','i'],'F2aS')};
 assert.deepEqual(createLocalLogEntry(before,after,40),{
  actor:'甲',actorSeat:'p1',timestamp:40,changes:['打出了 闪'],
 });
 after.runtime={a:encodeActionHint(ACTION_HINT_OPCODE.USE_CARD,'p1',['杀','-','i'],'K3aS')};
 assert.deepEqual(createLocalLogEntry(before,after,41),{
  actor:'甲',actorSeat:'p1',timestamp:41,changes:['打出了 杀'],
 });
 after.runtime={a:encodeActionHint(ACTION_HINT_OPCODE.USE_CARD,'p1',['酒','-','i'],'W4nT')};
 assert.deepEqual(createLocalLogEntry(before,after,42),{
  actor:'甲',actorSeat:'p1',timestamp:42,changes:['使用了 酒'],
 });
});
