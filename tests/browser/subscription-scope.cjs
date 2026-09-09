const assert=require('node:assert/strict'),path=require('node:path');
const pw=require(process.env.PLAYWRIGHT_PATH);
(async()=>{
 const browser=await pw.chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage();
 await page.setContent('<!doctype html><body></body>');
 await page.addScriptTag({path:path.join(__dirname,'.build/fixture.js')});
 await page.locator('sg-table sg-player').first().waitFor();
 const result=await page.evaluate(()=>window.fixture.getMetrics().subscriptions);
 const paths=result.map(item=>item.path);
 for(const seat of ['p2','p3','p4','p5','p6']) {
   assert.equal(paths.includes(`game/6/${seat}/jiang/cards`),false,`${seat} candidate generals should not subscribe`);
 }
 assert.equal(paths.includes('game/6/p1/jiang/cards'),true,'local candidate generals should subscribe');
 for(const seat of ['p1','p2','p3','p4','p5','p6']) {
   assert.equal(paths.includes(`game/6/${seat}/hand`),false,`${seat} hand parent listener is redundant`);
   assert.equal(paths.includes(`game/6/${seat}/other1`),false,`${seat} other1 parent listener is redundant`);
   assert.equal(paths.includes(`game/6/${seat}/other2`),false,`${seat} other2 parent listener is redundant`);
   assert.equal(paths.includes(`game/6/${seat}/areaCounts/hand`),seat==='p1'?false:true);
   assert.equal(paths.includes(`game/6/${seat}/hand/cards`),seat==='p1');
 }
 const demand=await page.evaluate(async()=>{
   const f=window.fixture,player=f.table.playerDoms.find(item=>item.dataset.key==='p2');
   player.openAreaPanel(player.handArea,'手牌');
   await new Promise(resolve=>setTimeout(resolve,0));
   const whileOpen=f.getMetrics().activePaths;
   player.shadowRoot.querySelector('.pai-info').hidePopover();
   await new Promise(resolve=>setTimeout(resolve,0));
   return {whileOpen,afterClose:f.getMetrics().activePaths};
 });
 assert.equal(demand.whileOpen['game/6/p2/hand/cards'],1);
 assert.equal(demand.afterClose['game/6/p2/hand/cards'],undefined);
 await browser.close();console.log('PASS: R02-R04 load opponent details on demand and remove redundant listeners.');
})().catch(error=>{console.error(error);process.exit(1)});
