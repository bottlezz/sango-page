export function mountPublicDesign(root, bridge) {
  root.classList.add('v3');
  const samples=[['♠','7','杀'],['♥','3','桃'],['♣','J','无懈可击'],['♦','9','闪'],['♠','2','八卦阵'],['♥','8','无中生有'],['♣','4','兵粮寸断'],['♦','A','决斗']];
  const make=i=>({id:i,suit:samples[i%8][0],rank:samples[i%8][1],name:samples[i%8][2]});
  let deck=Array.from({length:72},(_,i)=>make(i));
  let discard=Array.from({length:28},(_,i)=>({...make(i+72),source:'此前弃牌'}));
  let batch=[],actor=null,draft=null,busy=false;
  const localActor={id:'p1',name:'你'};
  root.innerHTML=`<div class="v3-shell"><section class="v3-deck"><div class="v3-topline"><strong>牌堆</strong><small>每次操作牌顶 1 张</small></div><div class="v3-back">三国</div><div><b class="v3-count" id="v3-count"></b><small> 张剩余</small></div><div class="v3-more"><button class="primary" data-act="draw">摸 1 张</button><button data-act="show">展示／判定 1 张</button><button data-act="sort">展开牌堆 ↗</button></div></section><section class="v3-stage"><div class="v3-topline"><strong>结算面板</strong><small id="v3-batch">所有人可见</small><button data-act="clear">清算</button></div><div class="v3-faces" id="v3-stage"></div></section><section class="v3-discard"><div class="stack">弃</div><strong>弃牌堆 <span id="v3-discard-count"></span></strong><small>包含本批结算牌</small><button data-act="discard">查看全部 ↗</button></section></div><div class="v3-status"><span role="status" id="v3-feedback">结算牌已计入弃牌堆；清算只清空面板。</span></div><div class="v3-sim"><small>换批演示</small><button data-act="other-play">玩家2打出</button><button data-act="other-discard">玩家2弃置</button></div>`;
  const dialog=document.createElement('dialog');dialog.className='v3 v3-dialog';dialog.setAttribute('aria-labelledby','v3-dialog-title');document.body.append(dialog);
  const face=c=>`<div class="v3-card ${'♥♦'.includes(c.suit)?'red':''} ${c.taken?'taken':''}"><b>${c.suit} ${c.rank}</b><strong>${c.name}</strong><small>${c.source||''}</small></div>`;
  const feedback=s=>root.querySelector('#v3-feedback').textContent=s;
  function render(){
    root.querySelector('#v3-count').textContent=deck.length;
    root.querySelector('#v3-discard-count').textContent=discard.length;
    root.querySelector('#v3-batch').textContent=actor?`${actor.name} · 本批结算`:'所有人可见';
    root.querySelector('#v3-stage').innerHTML=batch.length?batch.map(c=>`<div>${face(c)}<div class="v3-face-actions">${c.taken?'<small>已收入你的手牌</small>':`<button data-take="${c.id}">收入手牌</button>`}</div></div>`).join(''):'<div class="v3-empty"><b>暂无结算牌</b><small>打出、弃置或展示牌堆顶牌后在此显示</small></div>';
    root.querySelector('[data-act="clear"]').disabled=busy||!batch.length;
    root.querySelectorAll('[data-act="draw"],[data-act="show"],[data-act="sort"]').forEach(b=>b.disabled=busy||!deck.length);
    root.querySelectorAll('[data-take],[data-act^="other-"]').forEach(b=>b.disabled=busy);
  }
  function accept(incoming,action,who=localActor){
    if(!incoming.length)return;
    const existing=new Set(discard.map(c=>c.id));
    const fresh=incoming.filter(c=>!existing.has(c.id));if(!fresh.length)return;
    if(actor?.id!==who.id)batch=[];
    actor={...who};
    const source=action==='play'?'打出':action==='discard'?'弃置':'展示／判定';
    const additions=fresh.map(c=>({...c,source,taken:false}));
    discard.push(...additions);batch.push(...additions);
    feedback(`${who.name}${source} ${fresh.length} 张，已进入弃牌堆。`);render();
  }
  async function run(action){
    if(busy)return;busy=true;render();
    try{await action()}catch(error){feedback(error.message||'操作失败，请重试')}finally{busy=false;render()}
  }
  function open(title,body,footer=''){dialog.innerHTML=`<header><h2 id="v3-dialog-title">${title}</h2><button data-close aria-label="关闭">关闭 ×</button></header>${body}${footer}`;if(!dialog.open)dialog.showModal()}
  function close(){draft=null;dialog.close()}
  function discardView(){open(`弃牌堆 · 全部 ${discard.length} 张`,`<p class="muted">包含当前结算面板中的牌。最新进入的在前，已收取的牌不在这里。</p><div class="v3-grid">${discard.slice().reverse().map(c=>`<div class="v3-record">${face(c)}<button data-take="${c.id}">收入手牌</button></div>`).join('')||'<p>暂无弃牌</p>'}</div>`)}
  function sortView(){
    const lane=(key,title)=>`<section><h3>${title}</h3>${draft[key].map((c,i)=>`<div class="v3-row"><span>${i+1}. ${draft.viewed.has(c.id)?`${c.suit}${c.rank} ${c.name}`:'牌背'}</span><button data-lane="${key}" data-i="${i}" data-view-card ${draft.viewed.has(c.id)?'disabled':''}>${draft.viewed.has(c.id)?'已观看':'观看'}</button><button data-lane="${key}" data-i="${i}" data-dir="-1" ${i===0?'disabled':''} aria-label="前移第${i+1}张">↑</button><button data-lane="${key}" data-i="${i}" data-dir="1" ${i===draft[key].length-1?'disabled':''} aria-label="后移第${i+1}张">↓</button>${key!=='draw'?`<button data-lane="${key}" data-i="${i}" data-move>${key==='top'?'放牌底':'放牌顶'}</button><button data-lane="${key}" data-i="${i}" data-draw>摸牌</button>`:`<button data-lane="${key}" data-i="${i}" data-return>放回牌顶</button>`}</div>`).join('')||'<p class="muted">暂无卡牌</p>'}</section>`;
    open('展开牌堆 · 调整顺序',`<p><span class="privacy">仅你可见</span> 点击任意牌旁的“观看”逐张翻看。所有移动在确认后一起生效。</p><div class="v3-sort three-lanes">${lane('top','牌顶列 · 从上到下')}${lane('bottom','牌底列 · 追加在牌顶列后')}${lane('draw','确认后摸牌 · 从上到下')}</div><p class="muted">确认后摸牌列进入你的手牌；剩余顺序为牌顶列 → 牌底列。取消不会摸牌或改变牌序，但已经看过的牌无法撤回玩家记忆。</p>`,'<footer><button data-close>取消</button><button class="primary" data-commit>确认顺序并摸牌'+(draft.draw.length?`（${draft.draw.length}）`:'')+'</button></footer>');
  }
  async function take(id){
    const card=discard.find(c=>c.id===id);if(!card)return;
    await bridge.receive([card]);
    discard=discard.filter(c=>c.id!==id);card.taken=true;
    feedback('已从弃牌堆收入手牌，本批结算保持不变。');
    if(dialog.open&&!draft)discardView();
  }
  root.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b)return;
    run(async()=>{
      if(b.dataset.take!==undefined){await take(Number(b.dataset.take));return}
      const action=b.dataset.act;
      if(action==='clear'){batch=[];actor=null;feedback('已清算面板，弃牌堆内容保持不变。');return}
      if(action==='discard'){discardView();return}
      if(action==='sort'){draft={top:deck.slice(),bottom:[],draw:[],viewed:new Set()};sortView();return}
      if(action==='other-play'||action==='other-discard'){await bridge.simulateOther(action==='other-play'?'play':'discard');return}
      if(action!=='draw'&&action!=='show')return;
      const incoming=deck.slice(0,1);
      if(action==='draw'){await bridge.receive(incoming);deck.splice(0,1);feedback('已摸 1 张，结算面板保持不变。')}
      else{deck.splice(0,1);accept(incoming,'show')}
    });
  });
  dialog.addEventListener('click',event=>{
    const b=event.target.closest('button');if(!b||busy)return;
    if(b.hasAttribute('data-close')){close();return}
    if(b.dataset.take!==undefined){run(()=>take(Number(b.dataset.take)));return}
    if(b.hasAttribute('data-commit')){const drawn=draft.draw.slice(),nextDeck=[...draft.top,...draft.bottom];run(async()=>{if(drawn.length)await bridge.receive(drawn);deck=nextDeck;close();feedback(drawn.length?`牌序已更新，${drawn.length} 张牌已加入你的手牌。`:'牌堆顺序已更新，结算面板保持不变。')});return}
    if(b.dataset.lane){const list=draft[b.dataset.lane],i=Number(b.dataset.i);if(b.hasAttribute('data-view-card'))draft.viewed.add(list[i].id);else if(b.hasAttribute('data-draw'))draft.draw.push(...list.splice(i,1));else if(b.hasAttribute('data-return'))draft.top.push(...list.splice(i,1));else if(b.hasAttribute('data-move'))draft[b.dataset.lane==='top'?'bottom':'top'].push(...list.splice(i,1));else{const j=i+Number(b.dataset.dir);[list[i],list[j]]=[list[j],list[i]]}sortView()}
  });
  dialog.addEventListener('cancel',()=>{draft=null});render();
  return {accept};
}
