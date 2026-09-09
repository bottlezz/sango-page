import {test} from 'node:test';
import assert from 'node:assert/strict';
import {acquireLocks} from '../src/databaseLocks.mjs';

function setup() {
  const values=new Map(),transactions=[],updates=[];
  const context={lockRootPath:'game/6/operationLocks',ttlMs:15000,newToken:()=> 'token',makeRef:path=>({path}),
    async runTransaction(target,fn){transactions.push(target.path);const next=fn(values.get(target.path));if(next===undefined)return {committed:false,snapshot:{val:()=>values.get(target.path)}};values.set(target.path,next);return {committed:true,snapshot:{val:()=>next}};},
    async updateRoot(patch){updates.push(patch);for(const [path,value] of Object.entries(patch))value===null?values.delete(path):values.set(path,value);}};
  return {context,values,transactions,updates};
}
test('locks resources in stable order and releases only acquired paths',async()=>{
 const {context,values,transactions}=setup(),locks=await acquireLocks(['card:b','area:a','card:b'],context);
 assert.equal(transactions.length,2);
 assert.equal(transactions[0].endsWith(btoa('area:a').replaceAll('=','')),true);
 assert.equal(transactions[1].endsWith(btoa('card:b').replaceAll('=','')),true);
 assert.equal(Object.keys(locks.releasePatch()).length,2);await locks.release();assert.equal(values.size,0);
});
test('contention rejects and cleans earlier locks',async()=>{
 const {context,values,updates}=setup();
 const occupiedPath=`${context.lockRootPath}/${btoa('card:b').replaceAll('+','-').replaceAll('/','_').replaceAll('=','')}`;
 values.set(occupiedPath,{token:'other',expiresAt:Date.now()+10000});
 await assert.rejects(acquireLocks(['area:a','card:b'],context),/其他玩家/);
 assert.ok(updates.length);assert.equal([...values.values()].some(value=>value.token==='token'),false);
});
