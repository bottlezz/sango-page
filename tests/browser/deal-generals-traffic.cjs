const assert=require('node:assert/strict'),path=require('node:path');
const pw=require(process.env.PLAYWRIGHT_PATH);
(async()=>{
 const browser=await pw.chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage();
 await page.setContent('<!doctype html><body></body>');await page.addScriptTag({path:path.join(__dirname,'.build/fixture.js')});
 await page.locator('sg-table sg-player').first().waitFor();
 const result=await page.evaluate(async()=>{const f=window.fixture;f.resetMetrics();await f.controller.dispatchJiang();return {metrics:f.getMetrics(),players:Array.from({length:6},(_,i)=>({jiang:f.read(`game/6/p${i+1}/jiang/cards`),jiang1:f.read(`game/6/p${i+1}/jiang1`),jiang2:f.read(`game/6/p${i+1}/jiang2`),locked:f.read(`game/6/p${i+1}/jiangLocked`)}))};});
 assert.ok(result.players.every(player=>Object.keys(player.jiang).length===7&&player.locked===false));
 assert.ok(result.players.every(player=>Object.keys(player.jiang1||{}).length===0&&Object.keys(player.jiang2||{}).length===0));
 assert.deepEqual(result.metrics.gets,[]);assert.ok(result.metrics.transactions.every(item=>item.path.startsWith('game/6/operationLocks/')));
 assert.equal(result.metrics.updates.length,1);assert.equal(result.metrics.updates[0].paths.includes('game/6'),false);
 assert.ok(result.metrics.updates[0].paths.filter(path=>/\/p\d+\/(jiang\/cards|jiang1|jiang2|jiangLocked)$/.test(path)).length===24);
 await browser.close();console.log('PASS: B04 deals generals in one narrow update.');
})().catch(error=>{console.error(error);process.exit(1)});
