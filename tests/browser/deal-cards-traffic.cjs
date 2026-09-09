const assert=require('node:assert/strict'),path=require('node:path');
const pw=require(process.env.PLAYWRIGHT_PATH);
(async()=>{
 const browser=await pw.chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage();
 await page.setContent('<!doctype html><body></body>');await page.addScriptTag({path:path.join(__dirname,'.build/fixture.js')});
 await page.locator('sg-table sg-player').first().waitFor();
 const result=await page.evaluate(async()=>{
   const f=window.fixture,c=f.controller;
   for(let i=1;i<=6;i++)await c.setScalarValue(f.table.playerDoms[i-1].handArea.cardsRef,{});
   f.resetMetrics();await c.dealCards();
   const metrics=f.getMetrics(),hands=Array.from({length:6},(_,i)=>Object.values(f.read(`game/6/p${i+1}/hand/cards`)).sort((a,b)=>a.order-b.order).map(card=>card.id));
   const beforeSecond=Object.keys(f.read('game/6/tableDecks/pai/cards')).length;
   let occupiedError='';try{await c.dealCards();}catch(error){occupiedError=error.message;}
   return {metrics,hands,pile:beforeSecond,occupiedError,counts:Array.from({length:6},(_,i)=>f.read(`game/6/p${i+1}/areaCounts/hand`))};
 });
 assert.deepEqual(result.hands.flat(),Array.from({length:24},(_,i)=>`p${i%20+1}`));
 assert.ok(result.hands.every(hand=>hand.length===4));assert.equal(result.pile,76);assert.match(result.occupiedError,/手牌为空/);
 assert.deepEqual(result.counts,[4,4,4,4,4,4]);
 assert.ok(result.metrics.transactions.length>=8);assert.ok(result.metrics.transactions.every(item=>item.path.startsWith('game/6/operationLocks/')));
 assert.deepEqual(result.metrics.gets.map(item=>item.path).sort(),[
   'game/6/tableDecks/pai/cards','game/6/tableDecks/paiBottom/cards',...Array.from({length:6},(_,i)=>`game/6/p${i+1}/hand/cards`)
 ].sort());
 assert.equal(result.metrics.updates.length,1);assert.equal(result.metrics.updates[0].paths.includes('game/6'),false);
 await browser.close();console.log('PASS: B02 deals four cards with narrow reads, one update and area locks.');
})().catch(error=>{console.error(error);process.exit(1)});
