export function mountPublicDesign(root, bridge) {
  root.classList.add('v3');
  const RECENT_DISCARD_LIMIT=6;
  const samples=[['♠','7','杀'],['♥','3','桃'],['♣','J','无懈可击'],['♦','9','闪'],['♠','2','八卦阵'],['♥','8','无中生有'],['♣','4','兵粮寸断'],['♦','A','决斗']];
  const make=i=>({id:i,suit:samples[i%8][0],rank:samples[i%8][1],name:samples[i%8][2]});
  let deck=Array.from({length:72},(_,i)=>make(i));
  let discard=Array.from({length:28},(_,i)=>({...make(i+72),source:'此前弃牌'}));
  let draft=null,busy=false;
  const localActor={id:'p1',name:'你'};
  root.innerHTML=`
    <div class="v3-shell">
      <section class="v3-deck">
        <div class="v3-topline"><strong>牌堆</strong><small>从牌顶取牌</small></div>
        <div class="v3-stock"><div class="v3-back" aria-hidden="true"></div><div class="v3-stock-info"><b class="v3-count" id="v3-count"></b><small>张剩余</small></div></div>
        <div class="v3-more"><button class="primary" data-act="draw">摸 1 张</button><button data-act="show">展示／判定</button><button data-act="sort">展开牌堆 <span aria-hidden="true">↗</span></button><button class="primary v3-shuffle" data-act="shuffle" hidden>洗牌</button></div>
      </section>
      <section class="v3-stage v3-discard-zone">
        <div class="v3-topline"><strong>弃牌区</strong><small>最近 ${RECENT_DISCARD_LIMIT} 张 · 最新 → 较早</small></div>
        <div class="v3-discard-body">
          <div class="v3-stage-viewport"><button class="v3-stage-scroll scroll-left" type="button" data-stage-scroll="-1" aria-label="向左查看最近弃牌" hidden>‹</button><div class="v3-faces" id="v3-stage"></div><button class="v3-stage-scroll scroll-right" type="button" data-stage-scroll="1" aria-label="向右查看最近弃牌" hidden>›</button></div>
          <aside class="v3-discard-summary" aria-label="弃牌堆摘要">
            <div class="v3-stock"><div class="stack" aria-hidden="true">弃</div><div class="v3-stock-info"><b class="v3-count" id="v3-discard-count"></b><small>张弃牌</small></div></div>
            <button data-act="discard">查看全部 <span aria-hidden="true">↗</span></button>
          </aside>
        </div>
      </section>
    </div>
    <div class="v3-footer">
      <div class="v3-status"><span role="status" id="v3-feedback">主区域显示弃牌堆最近加入的 ${RECENT_DISCARD_LIMIT} 张牌。</span></div>
      <div class="v3-sim"><small>新增弃牌演示</small><button data-act="other-play">玩家2打出</button><button data-act="other-discard">玩家2弃置</button></div>
    </div>`;
  const drawSplit=document.createElement('div');drawSplit.className='v3-draw-split';
  drawSplit.innerHTML=`<button class="primary" data-act="draw">摸 1 张</button><button class="primary v3-draw-toggle" type="button" aria-label="选择摸牌张数" aria-expanded="false" aria-controls="v3-draw-options">▾</button><div id="v3-draw-options" class="v3-draw-options" hidden>${[2,3,4].map(n=>`<button data-act="draw" data-draw-count="${n}">摸 ${n} 张</button>`).join('')}</div>`;
  root.querySelector('[data-act="draw"]').replaceWith(drawSplit);
  root.querySelector('[data-act="show"]').textContent='展示／判定';
  root.querySelector('.v3-deck .v3-topline small').textContent='从牌顶取牌';
  const drawToggle=drawSplit.querySelector('.v3-draw-toggle'),drawOptions=drawSplit.querySelector('.v3-draw-options');
  const stageFaces=root.querySelector('#v3-stage'),stageScrollButtons=[...root.querySelectorAll('[data-stage-scroll]')];
  const updateStageScroll=()=>{
    const max=stageFaces.scrollWidth-stageFaces.clientWidth;
    stageScrollButtons.forEach(button=>{
      const direction=Number(button.dataset.stageScroll);
      button.hidden=max<=1||(direction<0?stageFaces.scrollLeft<=1:stageFaces.scrollLeft>=max-1);
    });
  };
  stageScrollButtons.forEach(button=>button.addEventListener('click',()=>stageFaces.scrollBy({left:Number(button.dataset.stageScroll)*Math.max(120,stageFaces.clientWidth*.7),behavior:'smooth'})));
  stageFaces.addEventListener('scroll',updateStageScroll,{passive:true});
  new ResizeObserver(updateStageScroll).observe(stageFaces);
  const setDrawOpen=open=>{drawOptions.hidden=!open;drawToggle.setAttribute('aria-expanded',String(open))};
  document.addEventListener('click',event=>{if(!event.composedPath().includes(drawSplit))setDrawOpen(false)});
  drawSplit.addEventListener('keydown',event=>{if(event.key==='Escape'&&!drawOptions.hidden){event.preventDefault();setDrawOpen(false);drawToggle.focus()}});
  const splitStyle=document.createElement('style');
  splitStyle.textContent=`.v3 .v3-draw-split{display:inline-flex;position:relative;flex:none}.v3 .v3-draw-split>button:first-child{border-radius:6px 0 0 6px}.v3 .v3-draw-toggle{border-radius:0 6px 6px 0;border-left:1px solid #624b2355;padding-inline:8px}.v3 .v3-draw-options{position:absolute;left:0;top:calc(100% + 5px);z-index:20;min-width:112px;display:grid;gap:3px;padding:5px;border:1px solid #b79952;border-radius:7px;background:#10392f;box-shadow:0 8px 22px #0008}.v3 .v3-draw-options[hidden]{display:none}.v3 .v3-draw-options button{text-align:left;padding:8px 12px;white-space:nowrap}.v3 .v3-deck>.v3-more{clear:both}`;
  root.append(splitStyle);
  const dialog=document.createElement('dialog');dialog.className='v3 v3-dialog';dialog.setAttribute('aria-labelledby','v3-dialog-title');document.body.append(dialog);
  const face=c=>`<div class="v3-card ${'♥♦'.includes(c.suit)?'red':''} ${c.taken?'taken':''}"><b><span>${c.suit}</span><span>${c.rank}</span></b><strong>${c.name}</strong><small>${c.source||''}</small></div>`;
  const feedback=s=>root.querySelector('#v3-feedback').textContent=s;
  function render(){
    root.querySelector('#v3-count').textContent=deck.length;
    root.querySelector('#v3-discard-count').textContent=discard.length;
    const recent=discard.slice(-RECENT_DISCARD_LIMIT).reverse();
    stageFaces.innerHTML=recent.length?recent.map(c=>`<div>${face(c)}<div class="v3-face-actions"><button data-take="${c.id}">收入手牌</button></div></div>`).join(''):'<div class="v3-empty"><b>暂无弃牌</b><small>最新打出、弃置或展示／判定的牌在此显示</small></div>';
    root.querySelectorAll('[data-act="draw"],[data-act="show"],[data-act="sort"]').forEach(b=>b.disabled=busy||!deck.length);
    const deckEmpty=!deck.length,shuffleButton=root.querySelector('[data-act="shuffle"]');
    drawSplit.hidden=deckEmpty;
    root.querySelector('[data-act="show"]').hidden=deckEmpty;
    root.querySelector('[data-act="sort"]').hidden=deckEmpty;
    shuffleButton.hidden=!deckEmpty;
    shuffleButton.disabled=busy||!discard.length;
    drawOptions.querySelectorAll('button').forEach(b=>b.disabled=busy||deck.length<Number(b.dataset.drawCount));
    drawToggle.disabled=busy||deck.length<2;
    root.querySelectorAll('[data-take],[data-act^="other-"]').forEach(b=>b.disabled=busy);
    requestAnimationFrame(updateStageScroll);
  }
  function accept(incoming,action,who=localActor){
    if(!incoming.length)return;
    const existing=new Set(discard.map(c=>c.id));
    const fresh=incoming.filter(c=>!existing.has(c.id));if(!fresh.length)return;
    const source=action==='play'?'打出':action==='discard'?'弃置':'展示／判定';
    const additions=fresh.map(c=>({...c,source,taken:false}));
    discard.push(...additions);
    feedback(`${who.name}${source} ${fresh.length} 张，已进入弃牌堆。`);render();
  }
  async function run(action){
    if(busy)return;busy=true;render();
    try{await action()}catch(error){feedback(error.message||'操作失败，请重试')}finally{busy=false;render()}
  }
  function open(title,body,footer=''){dialog.innerHTML=`<header><h2 id="v3-dialog-title">${title}</h2><button data-close aria-label="关闭">关闭 ×</button></header>${body}${footer}`;if(!dialog.open)dialog.showModal()}
  function close(){draft=null;dialog.close()}
  const compactTile=(c,hidden=false)=>hidden?`<div class="v3-sort-tile v3-sort-tile-back"></div>`:`<div class="v3-sort-tile v3-sort-tile-face ${'♥♦'.includes(c.suit)?'red':''}"><b><span>${c.suit}</span><span>${c.rank}</span></b><strong>${c.name}</strong></div>`;
  function discardView(){open(`弃牌堆 · 全部 ${discard.length} 张`,`<p class="muted">最新进入的在前，已收取的牌不在这里。</p><div class="v3-sort v3-discard-grid">${discard.slice().reverse().map(c=>`<div class="v3-discard-card">${compactTile(c)}<button data-take="${c.id}">收入手牌</button></div>`).join('')||'<p class="muted">暂无弃牌</p>'}</div>`)}
  function sortView(){
    const tile=c=>compactTile(c,!draft.viewed.has(c.id));
    const lane=(key,title)=>`<section class="v3-sort-lane v3-sort-lane-${key}"><h3>${title}</h3>${draft[key].map((c,i)=>`<div class="v3-row ${key==='top'?'':'v3-row-passive'}">${tile(c,i)}${key==='top'?`<div class="v3-row-actions"><button data-lane="${key}" data-i="${i}" data-view-card ${draft.viewed.has(c.id)?'disabled':''}>观看</button><button data-lane="${key}" data-i="${i}" data-dir="-1" ${i===0?'disabled':''} aria-label="前移第${i+1}张">↑</button><button data-lane="${key}" data-i="${i}" data-dir="1" ${i===draft[key].length-1?'disabled':''} aria-label="后移第${i+1}张">↓</button><button data-lane="${key}" data-i="${i}" data-move>放牌底</button><button data-lane="${key}" data-i="${i}" data-draw>摸牌</button></div>`:''}</div>`).join('')||'<p class="muted">暂无卡牌</p>'}</section>`;
    open('展开牌堆 · 调整顺序',`<p><span class="privacy">仅你可见</span> 在牌顶列观看、排序或分配卡牌，所有改变在确认后一起生效。</p><div class="v3-sort three-lanes">${lane('top','牌顶列 · 从上到下')}${lane('bottom','牌底列 · 按加入顺序')}${lane('draw','确认摸牌列')}</div><p class="muted">牌底列和确认摸牌列为结果区。放错时可重置排列；已经看过的牌仍会保持正面显示。</p>`,'<footer><button data-reset>重置排列</button><span class="v3-footer-spacer"></span><button data-close>取消</button><button class="primary" data-commit>确认顺序并摸牌'+(draft.draw.length?`（${draft.draw.length}）`:'')+'</button></footer>');
  }
  async function take(id){
    const card=discard.find(c=>c.id===id);if(!card)return;
    await bridge.receive([card]);
    discard=discard.filter(c=>c.id!==id);
    feedback('已从弃牌堆收入手牌，最近弃牌显示已更新。');
    if(dialog.open&&!draft)discardView();
  }
  root.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b||b.disabled)return;
    if(b.dataset.stageScroll!==undefined)return;
    if(b===drawToggle){setDrawOpen(drawOptions.hidden);return}
    setDrawOpen(false);
    run(async()=>{
      if(b.dataset.take!==undefined){await take(Number(b.dataset.take));return}
      const action=b.dataset.act;
      if(action==='discard'){discardView();return}
      if(action==='sort'){draft={top:deck.slice(),bottom:[],draw:[],viewed:new Set(),initial:deck.slice()};sortView();return}
      if(action==='shuffle'){
        deck=discard.map(({source,taken,...card})=>card);
        for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]]}
        discard=[];feedback(`弃牌堆已洗牌，${deck.length} 张牌进入牌堆。`);return
      }
      if(action==='other-play'||action==='other-discard'){await bridge.simulateOther(action==='other-play'?'play':'discard');return}
      if(action!=='draw'&&action!=='show')return;
      const count=action==='draw'?Number(b.dataset.drawCount||1):1;
      if(deck.length<count)throw Error('牌堆剩余张数不足。');
      const incoming=deck.slice(0,count);
      if(action==='draw'){await bridge.receive(incoming);deck.splice(0,count);feedback(`已摸 ${count} 张，弃牌区保持不变。`)}
      else{deck.splice(0,1);accept(incoming,'show')}
    });
  });
  dialog.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b||busy)return;
    if(b.hasAttribute('data-close')){close();return}
    if(b.hasAttribute('data-reset')){draft.top=draft.initial.slice();draft.bottom=[];draft.draw=[];sortView();return}
    if(b.dataset.take!==undefined){run(()=>take(Number(b.dataset.take)));return}
    if(b.hasAttribute('data-commit')){const drawn=draft.draw.slice(),nextDeck=[...draft.top,...draft.bottom];run(async()=>{if(drawn.length)await bridge.receive(drawn);deck=nextDeck;close();feedback(drawn.length?`牌序已更新，${drawn.length} 张牌已加入你的手牌。`:'牌堆顺序已更新，弃牌区保持不变。')});return}
    if(b.dataset.lane){const list=draft[b.dataset.lane],i=Number(b.dataset.i);if(b.hasAttribute('data-view-card'))draft.viewed.add(list[i].id);else if(b.hasAttribute('data-draw'))draft.draw.push(...list.splice(i,1));else if(b.hasAttribute('data-return'))draft.top.push(...list.splice(i,1));else if(b.hasAttribute('data-move'))draft[b.dataset.lane==='top'?'bottom':'top'].push(...list.splice(i,1));else{const j=i+Number(b.dataset.dir);[list[i],list[j]]=[list[j],list[i]]}sortView()}
  });
  dialog.addEventListener('cancel',()=>{draft=null});render();
  return {accept};
}
