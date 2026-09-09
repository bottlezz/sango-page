const assert=require('node:assert/strict'),path=require('node:path');
const pw=require(process.env.PLAYWRIGHT_PATH);
(async()=>{
 const browser=await pw.chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage();
 await page.setContent('<!doctype html><body></body>');
 await page.addScriptTag({path:path.join(__dirname,'.build/fixture.js')});
 await page.locator('sg-table sg-card').first().waitFor();
 const result=await page.evaluate(async()=>{
   const f=window.fixture,c=f.controller,p=f.table.playerDoms.find(player=>player.dataset.key==='p1');
   await c.setValue(p.hpWc.hpRef,'3/5');
   await c.setValue({toString:()=>`${p.playerRef.toString()}/debuff`},'11');
   const cards=[...f.table.paiArea.cardArea.children].slice(0,2);
   await c.showCard(cards[0].cardRef);
   await c.resetCard(cards[0].cardRef);
   await c.showCard(cards[1].cardRef);
   return {
     hp:f.read('game/6/p1/hp'),debuff:f.read('game/6/p1/debuff'),
     show0:f.read(`${cards[0].dataset.path}/show`),show1:f.read(`${cards[1].dataset.path}/show`)
   };
 });
 assert.deepEqual(result,{hp:'3/5',debuff:'11',show0:'0',show1:'1'});
 await browser.close();console.log('PASS: baseline HP, status and visibility results.');
})().catch(error=>{console.error(error);process.exit(1)});
