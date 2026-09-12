const assert=require('node:assert/strict'),path=require('node:path');
const pw=require(process.env.PLAYWRIGHT_PATH);
(async()=>{
 const browser=await pw.chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage();
 await page.setContent('<!doctype html><body></body>');
 await page.addScriptTag({path:path.join(__dirname,'.build/fixture.js')});
 await page.locator('sg-table sg-card').first().waitFor();
 const result=await page.evaluate(async()=>{
   const f=window.fixture,a=f.controller,b=new f.controller.constructor({},'6');
   const p2=f.table.playerDoms.find(player=>player.dataset.key==='p2');
   const pile=()=>[...f.table.paiArea.cardArea.children].filter(card=>card.isConnected);
   const zhuang=p2.zhuangArea.cardsRef,pan=p2.panArea.cardsRef;
   await a.moveOrderedCards([pile()[0].dataset.path],zhuang);
   const equipmentSources=['game/6/p1/hand/cards/c0','game/6/p3/hand/cards/c0'];
   f.resetMetrics();
   const equipment=await Promise.allSettled([
     a.moveOrderedCards([equipmentSources[0]],zhuang),
     b.moveOrderedCards([equipmentSources[1]],zhuang),
   ]);
   const equipmentMetrics=f.getMetrics();

   const judgmentSources=['game/6/p1/hand/cards/c1','game/6/p3/hand/cards/c1'];
   f.resetMetrics();
   const judgment=await Promise.allSettled([
     a.moveOrderedCards([judgmentSources[0]],pan,null,{[judgmentSources[0]]:'闪电'}),
     b.moveOrderedCards([judgmentSources[1]],pan,null,{[judgmentSources[1]]:'闪电'}),
   ]);
   const judgmentMetrics=f.getMetrics();
   return {
     equipmentStatuses:equipment.map(item=>item.status),
     equipmentCount:Object.keys(f.read('game/6/p2/zhuang/cards')).length,
     equipmentSources:equipmentSources.map(source=>f.read(source)),equipmentMetrics,
     judgmentStatuses:judgment.map(item=>item.status),
     judgment:Object.values(f.read('game/6/p2/pan/cards')||{}),
     judgmentSources:judgmentSources.map(source=>f.read(source)),judgmentMetrics,
   };
 });
 assert.deepEqual(result.equipmentStatuses,['fulfilled','fulfilled']);
 assert.equal(result.equipmentCount,5);
 assert.equal(result.equipmentSources.filter(Boolean).length,0);
 assert.deepEqual(result.equipmentMetrics.transactions,[]);
 assert.deepEqual(result.judgmentStatuses,['fulfilled','fulfilled']);
 assert.equal(result.judgment.length,2);assert.ok(result.judgment.every(card=>card.judgmentEffect==='闪电'));
 assert.equal(result.judgmentSources.filter(Boolean).length,0);
 assert.deepEqual(result.judgmentMetrics.transactions,[]);
 await browser.close();console.log('PASS: M03-M04 use optimistic validation without ordinary-area locks.');
})().catch(error=>{console.error(error);process.exit(1)});
