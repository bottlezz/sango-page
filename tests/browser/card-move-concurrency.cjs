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
   const equipmentSources=pile().slice(0,2).map(card=>card.dataset.path);
   f.resetMetrics();
   const equipment=await Promise.allSettled([
     a.moveOrderedCards([equipmentSources[0]],zhuang),
     b.moveOrderedCards([equipmentSources[1]],zhuang),
   ]);
   const equipmentMetrics=f.getMetrics();
   const equipmentFailed=equipment.findIndex(item=>item.status==='rejected');
   let equipmentRetry='';
   try {await a.moveOrderedCards([equipmentSources[equipmentFailed]],zhuang);} catch(error) {equipmentRetry=error.message;}

   const judgmentSources=pile().filter(card=>!equipmentSources.includes(card.dataset.path)).slice(0,2).map(card=>card.dataset.path);
   f.resetMetrics();
   const judgment=await Promise.allSettled([
     a.moveOrderedCards([judgmentSources[0]],pan,null,{[judgmentSources[0]]:'闪电'}),
     b.moveOrderedCards([judgmentSources[1]],pan,null,{[judgmentSources[1]]:'闪电'}),
   ]);
   const judgmentMetrics=f.getMetrics();
   const judgmentFailed=judgment.findIndex(item=>item.status==='rejected');
   let judgmentRetry='';
   try {await a.moveOrderedCards([judgmentSources[judgmentFailed]],pan,null,{[judgmentSources[judgmentFailed]]:'闪电'});} catch(error) {judgmentRetry=error.message;}
   return {
     equipmentStatuses:equipment.map(item=>item.status),equipmentRetry,
     equipmentCount:Object.keys(f.read('game/6/p2/zhuang/cards')).length,
     equipmentSources:equipmentSources.map(source=>f.read(source)),equipmentMetrics,
     judgmentStatuses:judgment.map(item=>item.status),judgmentRetry,
     judgment:Object.values(f.read('game/6/p2/pan/cards')||{}),
     judgmentSources:judgmentSources.map(source=>f.read(source)),judgmentMetrics,
   };
 });
 assert.deepEqual(result.equipmentStatuses.sort(),['fulfilled','rejected']);
 assert.equal(result.equipmentCount,4);assert.match(result.equipmentRetry,/装备区最多放四张牌/);
 assert.equal(result.equipmentSources.filter(Boolean).length,1);
 assert.ok(result.equipmentMetrics.transactions.every(item=>item.path.startsWith('game/6/operationLocks/')));
 assert.deepEqual(result.judgmentStatuses.sort(),['fulfilled','rejected']);
 assert.equal(result.judgment.length,1);assert.equal(result.judgment[0].judgmentEffect,'闪电');
 assert.match(result.judgmentRetry,/已有闪电/);assert.equal(result.judgmentSources.filter(Boolean).length,1);
 assert.ok(result.judgmentMetrics.transactions.every(item=>item.path.startsWith('game/6/operationLocks/')));
 await browser.close();console.log('PASS: M03-M04 preserve equipment and judgment concurrency constraints.');
})().catch(error=>{console.error(error);process.exit(1)});
