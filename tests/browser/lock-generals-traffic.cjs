const assert=require('node:assert/strict'),path=require('node:path');
const pw=require(process.env.PLAYWRIGHT_PATH);
(async()=>{
 const browser=await pw.chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage();
 await page.setContent('<!doctype html><body></body>');await page.addScriptTag({path:path.join(__dirname,'.build/fixture.js')});
 await page.locator('sg-table sg-player').first().waitFor();
 const result=await page.evaluate(async()=>{const f=window.fixture,c=f.controller;await c.dispatchJiang();const keys=Object.keys(f.read('game/6/p1/jiang/cards')).slice(0,2);const cardRefs=keys.map(key=>({toString:()=>`https://test.local/game/6/p1/jiang/cards/${key}`}));f.resetMetrics();const locked=await c.lockSelectedGenerals(cardRefs,'p1');return {locked,metrics:f.getMetrics(),candidate:f.read('game/6/p1/jiang/cards'),main:f.read('game/6/p1/jiang1/cards'),deputy:f.read('game/6/p1/jiang2/cards'),flag:f.read('game/6/p1/jiangLocked')};});
 assert.equal(result.locked,true);assert.equal(Object.values(result.candidate).filter(Boolean).length,5);assert.equal(Object.keys(result.main).length,1);assert.equal(Object.keys(result.deputy).length,1);assert.equal(result.flag,true);
 assert.equal(result.metrics.gets.length,2);assert.ok(result.metrics.gets.every(item=>/game\/6\/p1\/jiang\/cards\//.test(item.path)));
 assert.ok(result.metrics.transactions.every(item=>item.path.startsWith('game/6/operationLocks/')));assert.equal(result.metrics.updates.length,1);assert.equal(result.metrics.updates[0].paths.includes('game/6'),false);
 await browser.close();console.log('PASS: B05 locks two selected generals with two reads and one narrow update.');
})().catch(error=>{console.error(error);process.exit(1)});
