import {test} from 'node:test';
import assert from 'node:assert/strict';
import {runLoadedTransaction} from '../src/roomTransaction.mjs';

test('cold room waits for complete data and retains subscription through retries', async () => {
  let cached = null, listening = false, receive;
  const room = {p1:{hand:{cards:{a:{id:'p1'}}}}};
  const api = {
    onValue(ref, callback) { listening = true; receive = () => {cached = room; callback({val:()=>room});}; return () => {listening=false; cached=null;}; },
    async runTransaction(ref, update) {
      assert.equal(listening,true);
      assert.ok(cached);
      assert.equal(update(cached),cached);
      // Retry against a newer server state; never reuse the initial snapshot.
      cached = {p1:{hand:{cards:{}}}};
      assert.equal(update(cached),undefined);
      return {committed:false};
    }
  };
  const seen=[];
  const pending=runLoadedTransaction({}, room=>{
    seen.push(room);
    return room.p1.hand.cards.a ? room : undefined;
  },api);
  assert.equal(seen.length,0);
  receive();
  assert.deepEqual(await pending,{committed:false});
  assert.equal(seen.length,2);
  assert.equal(listening,false);
});

test('subscription is released on permission and transaction failures', async () => {
  for (const failRead of [true,false]) {
    let released=false;
    const api={
      onValue(ref, resolve, reject) {queueMicrotask(()=>failRead?reject(Error('denied')):resolve({}));return()=>{released=true;};},
      async runTransaction(){throw Error('write failed');}
    };
    await assert.rejects(runLoadedTransaction({},()=>{},api),failRead?/denied/:/write failed/);
    assert.equal(released,true);
  }
});
