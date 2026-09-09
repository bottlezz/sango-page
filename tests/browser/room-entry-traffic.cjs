const assert=require('node:assert/strict'),path=require('node:path');
const pw=require(process.env.PLAYWRIGHT_PATH);
(async()=>{
 const browser=await pw.chromium.launch({headless:true,channel:'msedge'}),page=await browser.newPage();
 await page.setContent('<!doctype html><body></body>');
 await page.addScriptTag({path:path.join(__dirname,'.build/fixture.js')});
 const result=await page.evaluate(async()=>{
   const f=window.fixture,menu=new f.SgGameMenu({});menu.gameId='6';
   f.resetMetrics();
   const known=await menu.lookupRoom('player4');
   const knownTraffic=f.getMetrics();
   f.resetMetrics();
   const newPlayer=await menu.lookupRoom('new-player');
   return {known,newPlayer,knownTraffic,newTraffic:f.getMetrics()};
 });
 assert.deepEqual(result.known,{playerCount:6,reconnectSeat:'p4'});
 assert.deepEqual(result.newPlayer,{playerCount:6,reconnectSeat:null});
 const expected=['game/6/pCount',...Array.from({length:6},(_,i)=>`game/6/p${i+1}/name`)].sort();
 assert.deepEqual(result.knownTraffic.gets.map(item=>item.path).sort(),expected);
 assert.deepEqual(result.newTraffic.gets.map(item=>item.path).sort(),expected);
 assert.equal(result.knownTraffic.gets.some(item=>item.path==='game/6'),false);
 assert.equal(result.knownTraffic.transactions.length,0);
 await browser.close();console.log('PASS: R01 room entry reads only player count and seat names.');
})().catch(error=>{console.error(error);process.exit(1)});
