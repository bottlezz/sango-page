const assert=require('node:assert/strict'),path=require('node:path');
const pw=require(process.env.PLAYWRIGHT_PATH);
(async()=>{
 const browser=await pw.chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage();
 await page.setContent('<!doctype html><body></body>');
 await page.addScriptTag({path:path.join(__dirname,'.build/fixture.js')});
 await page.locator('sg-table sg-card').first().waitFor();
 const result=await page.evaluate(async()=>{
   const f=window.fixture,before=f.getMetrics().activeSubscriptions;
   f.table.remove();
   await new Promise(resolve=>setTimeout(resolve,0));
   const afterMetrics=f.getMetrics();
   return {before,after:afterMetrics.activeSubscriptions,activePaths:afterMetrics.activePaths};
 });
 assert.ok(result.before>0);
 assert.equal(result.after,0,`remaining: ${JSON.stringify(result.activePaths)}`);
 await browser.close();console.log('PASS: R05 table removal releases every Firebase subscription.');
})().catch(error=>{console.error(error);process.exit(1)});
