const assert=require('node:assert/strict'),path=require('node:path');
const pw=require(process.env.PLAYWRIGHT_PATH);
(async()=>{
 const browser=await pw.chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage();
 await page.setContent('<!doctype html><body></body>');await page.addScriptTag({path:path.join(__dirname,'.build/fixture.js')});
 await page.locator('sg-table sg-player').first().waitFor();
 const result=await page.evaluate(async()=>{const f=window.fixture,c=f.controller,before={name:f.read('game/6/p1/name'),hp:f.read('game/6/p1/hp'),role:f.read('game/6/p1/role')};f.resetMetrics();await c.resetTable();return {before,after:{name:f.read('game/6/p1/name'),hp:f.read('game/6/p1/hp'),role:f.read('game/6/p1/role')},metrics:f.getMetrics(),p1:f.read('game/6/p1'),decks:f.read('game/6/tableDecks')};});
 assert.deepEqual(result.after,result.before);assert.equal(Object.keys(result.p1.hand.cards).length,0);assert.equal(Object.keys(result.p1.zhuang.cards).length,0);assert.equal(Object.keys(result.p1.pan.cards).length,0);
 assert.deepEqual(result.p1.areaCounts,{hand:0,other1:0,other2:0});
 assert.ok(Object.keys(result.decks.pai.cards).length>0);assert.equal(Object.keys(result.decks.discard||{}).length,0);
 assert.deepEqual(result.metrics.gets,[]);assert.deepEqual(result.metrics.transactions,[]);assert.equal(result.metrics.updates.length,1);assert.equal(result.metrics.updates[0].paths.includes('game/6'),false);
 await browser.close();console.log('PASS: B06 resets only game-state paths and preserves player profile fields.');
})().catch(error=>{console.error(error);process.exit(1)});
