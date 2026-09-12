const assert=require('node:assert/strict'),path=require('node:path');
const pw=require(process.env.PLAYWRIGHT_PATH);
(async()=>{
 const browser=await pw.chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage();
 await page.setContent('<!doctype html><body></body>');await page.addScriptTag({path:path.join(__dirname,'.build/fixture.js')});
 await page.locator('sg-table sg-card').first().waitFor();
 const result=await page.evaluate(async()=>{const f=window.fixture;f.resetMetrics();await f.controller.resetPai();return {metrics:f.getMetrics(),pai:f.read('game/6/tableDecks/pai/cards'),discard:f.read('game/6/tableDecks/discard')};});
 assert.equal(Object.keys(result.pai).length,200);assert.equal(result.discard,null);
 assert.ok(Object.values(result.pai).every(card=>card.show==='0'&&card.judgmentEffect===undefined&&card.panOrder===undefined));
 assert.deepEqual(result.metrics.gets.map(item=>item.path).sort(),['game/6/tableDecks/pai/cards','game/6/tableDecks/discard/cards'].sort());
 assert.equal(result.metrics.transactions.length,1);assert.ok(result.metrics.transactions.every(item=>item.path.startsWith('game/6/operationLocks/')));
 assert.equal(result.metrics.updates.length,1);assert.equal(result.metrics.updates[0].paths.includes('game/6'),false);
 await browser.close();console.log('PASS: B03 shuffles only related deck nodes without losing key collisions.');
})().catch(error=>{console.error(error);process.exit(1)});
