import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ACTION_HINT_OPCODE,createLocalLogEntry,decodeActionHint,encodeActionHint} from '../src/localActionLog.mjs';

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
 assert.deepEqual(entry,{actor:'甲',timestamp:20,changes:['弃置了 乙 的 1 张牌']});
 assert.equal(JSON.stringify(entry).includes('secret-card'),false);
});
