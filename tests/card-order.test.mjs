import {test} from 'node:test';
import assert from 'node:assert/strict';
import {orderedEntries, orderedMovePatch} from '../src/cardOrder.mjs';
const path='game/6/tableDecks/pai/cards';
const cards={a:{id:'p1',order:0,show:'0'},b:{id:'p2',order:1024,show:'0'},c:{id:'p3',order:2048,show:'0'}};
test('judgment effects are independent, unique, ordered and cleared on exit', () => {
 const target='game/6/p2/pan/cards', source=path+'/a';
 const existing={lightning:{id:'p9',judgmentEffect:'闪电',order:0}};
 const sources=[{path:source,value:cards.a}];
 assert.throws(()=>orderedMovePatch(target,existing,sources,null,()=> 'new'), /请选择/);
 assert.throws(()=>orderedMovePatch(target,existing,sources,null,()=> 'new',{[source]:'闪电'}), /已有/);
 const patch=orderedMovePatch(target,existing,sources,null,()=> 'new',{[source]:'乐不思蜀'});
 const added=patch[target+'/new'];
 assert.equal(added.id,'p1');assert.equal(added.judgmentEffect,'乐不思蜀');assert.equal(added.order,1024);
 const reordered=orderedMovePatch(target,{...existing,new:added},[{path:target+'/new',value:added}],'lightning',()=>assert.fail());
 assert.equal(reordered[target+'/new/order'],0);
 const exit=orderedMovePatch(path,{},[{path:target+'/new',value:added}],null,()=> 'exit');
 assert.equal(exit[path+'/exit'].judgmentEffect,undefined);
 assert.equal(exit[path+'/exit'].panOrder,undefined);
 assert.throws(()=>orderedMovePatch(target,{},[...sources,{path:path+'/b',value:cards.b}],null,()=> 'new',{[source]:'闪电',[path+'/b']:'闪电'}), /已有/);
});
test('same-area reorder updates only order fields, preserving faces and IDs',()=>{
 const patch=orderedMovePatch(path,cards,[{path:path+'/c',value:cards.c}],'a',()=>assert.fail());
 assert.deepEqual(patch,{[path+'/c/order']:0,[path+'/a/order']:1024,[path+'/b/order']:2048});
});
test('cross-area insertion is atomic and uses a fresh key for collisions',()=>{
 const source='game/6/p1/hand/cards/a';
 const patch=orderedMovePatch(path,cards,[{path:source,value:{id:'p8',show:'1'}}],'b',()=> 'new');
 assert.equal(patch[source],null);assert.deepEqual(patch[path+'/new'],{id:'p8',show:'0',order:1024});
 assert.equal(patch[path+'/b/order'],2048);assert.equal(patch[path+'/a/order'],0);
});
test('multi-selection preserves incoming order',()=>{
 const patch=orderedMovePatch(path,cards,[{path:path+'/c',value:cards.c},{path:path+'/a',value:cards.a}],'b',()=>assert.fail());
 assert.equal(patch[path+'/c/order'],0);assert.equal(patch[path+'/a/order'],1024);assert.equal(patch[path+'/b/order'],2048);
});
test('missing insertion target and equipment overflow reject without a patch',()=>{
 assert.throws(()=>orderedMovePatch(path,cards,[],'gone',()=> 'new'));
 assert.throws(()=>orderedMovePatch('game/6/p1/zhuang/cards',cards,[{path:'game/6/p2/hand/cards/x',value:{}},{path:'game/6/p2/hand/cards/y',value:{}}],null,()=> 'new'));
});
test('legacy entries are deterministic and persisted order restores after reload',()=>{
 assert.deepEqual(orderedEntries({a:{},b:{}}).map(x=>x.key),['b','a']);
 assert.deepEqual(orderedEntries({a:{order:2048},b:{order:0}}).map(x=>x.key),['b','a']);
});
test('entering discard clears reveal state; reordering in draw pile preserves it',()=>{
 const value={id:'p8',show:'1'};
 const patch=orderedMovePatch('game/6/tableDecks/discard/cards',{},[{path:path+'/a',value}],null,()=> 'new');
 assert.equal(patch['game/6/tableDecks/discard/cards/new'].show,'0');
 const reorder=orderedMovePatch(path,{a:{...value,order:0}},[{path:path+'/a',value}],null,()=>assert.fail());
 assert.deepEqual(reorder,{[path+'/a/order']:0});
});
