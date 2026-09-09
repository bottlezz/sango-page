const assert=require('node:assert/strict'),path=require('node:path');
const pw=require(process.env.PLAYWRIGHT_PATH);
(async()=>{
 const browser=await pw.chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage();
 await page.setContent('<!doctype html><body></body>');await page.addScriptTag({path:path.join(__dirname,'.build/fixture.js')});
 await page.locator('sg-table sg-player').first().waitFor();
 const result=await page.evaluate(async()=>{const f=window.fixture;f.resetMetrics();await f.controller.assignRoles();return {metrics:f.getMetrics(),roles:Array.from({length:6},(_,i)=>f.read(`game/6/p${i+1}/role`))};});
 assert.deepEqual([...result.roles].sort(),['主','内','反','反','忠','忠'].sort());
 assert.equal(result.metrics.updates.length,1);assert.equal(result.metrics.updates[0].paths.length,6);
 assert.deepEqual(result.metrics.transactions,[]);assert.deepEqual(result.metrics.gets,[]);
 await browser.close();console.log('PASS: B01 assigns all roles in one narrow update.');
})().catch(error=>{console.error(error);process.exit(1)});
