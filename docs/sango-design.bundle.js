/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./docs/sango-public-v3.js":
/*!*********************************!*\
  !*** ./docs/sango-public-v3.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mountPublicDesign: () => (/* binding */ mountPublicDesign)
/* harmony export */ });
function mountPublicDesign(root, bridge) {
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


/***/ }),

/***/ "./docs/sango-public-polish.css":
/*!**************************************!*\
  !*** ./docs/sango-public-polish.css ***!
  \**************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/noSourceMaps.js */ "./node_modules/css-loader/dist/runtime/noSourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/* Shared spacing and action hierarchy for the public-table design preview. */
.design-public.v3 { --control-height: 36px; }
.design-public.v3 .v3-shell {
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 18px;
  height: 236px;
  min-height: 236px;
  padding: 16px 20px;
  border-color: #d7be7830;
  background: linear-gradient(115deg, #103a30, #0a2d25 72%);
  box-shadow: 0 12px 30px #0002;
}
.design-public.v3 button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: var(--control-height);
  padding: 0 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1;
  white-space: nowrap;
  transition: background .12s, border-color .12s;
}
.design-public.v3 button.primary { background: #e2b84b; border-color: #e2b84b; }
.design-public.v3 button.primary:hover:not(:disabled) { background: #edc65f; border-color: #edc65f; }
.design-public.v3 .v3-topline {
  display: flex;
  align-items: center;
  height: 28px;
  gap: 10px;
  margin: 0;
}
.design-public.v3 .v3-topline strong { font-size: 14px; letter-spacing: .03em; white-space: nowrap; }
.design-public.v3 .v3-topline small { font-size: 12px; color: #91aea0; }
.design-public.v3 .v3-deck {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 28px 70px minmax(0, 1fr);
  gap: 7px;
  padding-right: 18px;
  border-right: 1px solid #d7be781c;
}
.design-public.v3 .v3-deck > .v3-stock { align-self: center; justify-content: center; gap: 16px; }
.design-public.v3 .v3-deck .v3-stock-info { align-items: flex-start; gap: 5px; }
.design-public.v3 .v3-deck .v3-stock-info small { font-size: 11px; }
.design-public.v3 .v3-stock { display: flex; align-items: center; gap: 16px; min-width: 0; }
.design-public.v3 .v3-stock-info { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.design-public.v3 .v3-stock-info small { font-size: 12px; white-space: nowrap; }
.design-public.v3 .v3-count { color: #efdcb0; font: 32px/1 Georgia, serif; }
.design-public.v3 .v3-back,
.design-public.v3 .v3-discard-summary .stack { float: none; flex: 0 0 44px; width: 44px; height: 58px; margin: 0; border-radius: 5px; }
.design-public.v3 .v3-back { background: repeating-linear-gradient(45deg,#70342e,#70342e 4px,#803b33 4px,#803b33 8px); }
.design-public.v3 .v3-more { display: grid; grid-template-columns: 1.08fr 1fr; grid-template-rows: 30px 22px; gap: 5px 7px; align-content: end; min-width: 0; }
.design-public.v3 .v3-more > button { width: 100%; height: 30px; padding-inline: 6px; font-size: 11px; }
.design-public.v3 .v3-more > [data-act="sort"] { grid-column: 1 / -1; height: 22px; justify-content: center; padding: 0; border: 0; border-radius: 4px; background: transparent; color: #9fb6aa; font-size: 11px; font-weight: 500; }
.design-public.v3 .v3-more > [data-act="sort"]:hover:not(:disabled) { color: #f0cc73; border: 0; background: #ffffff08; }
.design-public.v3 .v3-more > .v3-shuffle { grid-column: 1 / -1; width: 100%; height: 30px; }
.design-public.v3 .v3-more > [hidden] { display: none !important; }
.design-public.v3 .v3-draw-split { display: grid; grid-template-columns: minmax(0, 1fr) 25px; height: 30px; min-width: 0; }
.design-public.v3 .v3-draw-split > button { height: 30px; }
.design-public.v3 .v3-draw-split > button:first-child { padding-inline: 6px; }
.design-public.v3 .v3-draw-split > .v3-draw-toggle { width: 25px; padding: 0; border-left-color: #72542055; border-radius: 0 6px 6px 0; font-size: 11px; }
.design-public.v3 .v3-draw-options { min-width: 100%; gap: 3px; padding: 5px; border-radius: 8px; }
.design-public.v3 .v3-draw-options button { width: 100%; justify-content: flex-start; border-color: transparent; background: transparent; }
.design-public.v3 .v3-draw-options button:hover:not(:disabled) { background: #e2b84b18; }
.design-public.v3 .v3-stage { display: grid; grid-template-rows: 28px minmax(0, 1fr); gap: 12px; min-width: 0; min-height: 0; }
.design-public.v3 .v3-stage .v3-topline { justify-content: flex-start; }
.design-public.v3 .v3-discard-body { display: grid; grid-template-columns: minmax(0,1fr) 154px; gap: 14px; min-width: 0; min-height: 0; }
.design-public.v3 .v3-stage-viewport { position: relative; min-width: 0; min-height: 0; overflow: hidden; }
.design-public.v3 .v3-faces { align-items: center; gap: 6px; width: 100%; height: 100%; min-height: 0; padding: 5px 4px 8px; box-sizing: border-box; overflow-x: auto; overflow-y: hidden; scrollbar-width: none; }
.design-public.v3 .v3-faces::-webkit-scrollbar { display: none; }
.design-public.v3 .v3-faces > div { position: relative; flex-shrink: 0; margin-left: 0; }
.design-public.v3 .v3-faces > div:first-child { margin-left: 0; }
.design-public.v3 .v3-faces > .v3-empty { flex: 1; min-height: 140px; border: 1px dashed #d7be7817; border-radius: 8px; background: #ffffff02; }
.design-public.v3 .v3-stage-scroll { position: absolute; top: 50%; z-index: 10; width: 26px; height: 38px; padding: 0; transform: translateY(-50%); border-color: #d7be7850; border-radius: 7px; background: #10392ff0; box-shadow: 0 3px 10px #0007; font: 22px/1 Georgia,serif; }
.design-public.v3 .v3-stage-scroll.scroll-left { left: 3px; }
.design-public.v3 .v3-stage-scroll.scroll-right { right: 3px; }
.design-public.v3 .v3-stage-scroll[hidden] { display: none; }
.design-public.v3 .v3-empty b { font-size: 16px; color: #9bb7a8; }
.design-public.v3 .v3-empty small { font-size: 12px; color: #728f81; }
.design-public.v3 .v3-card { display: grid; grid-template-columns: 24px minmax(0,1fr); grid-template-rows: minmax(0,1fr) 16px; align-items: center; justify-items: center; width: 84px; height: 98px; padding: 6px 5px 4px; }
.design-public.v3 .v3-card > b { align-self: start; justify-self: start; display: flex; flex-direction: column; align-items: center; gap: 1px; font: 800 18px/1 Georgia,serif; }
.design-public.v3 .v3-card > strong { display: block; max-height: 68px; margin: 0; overflow: hidden; writing-mode: vertical-rl; text-orientation: upright; font-size: 14px; line-height: 1; letter-spacing: 1px; white-space: nowrap; }
.design-public.v3 .v3-card > small { grid-column: 1 / -1; align-self: end; width: 100%; padding-top: 3px; overflow: hidden; border-top: 1px solid #765f3826; color: #76623e; font-size: 9px; line-height: 1; text-align: center; white-space: nowrap; text-overflow: ellipsis; }
.design-public.v3 .v3-face-actions { display: flex; justify-content: center; width: 84px; margin-top: 2px; }
.design-public.v3 .v3-face-actions button { width: 62px; height: 22px; padding: 0; border: 0; border-radius: 4px; background: transparent; color: #9fb6aa; font-size: 11px; font-weight: 500; }
.design-public.v3 .v3-face-actions button:hover:not(:disabled) { color: #f0cc73; border: 0; background: #ffffff08; }
.design-public.v3 .v3-face-actions small { display: grid; place-items: center; width: 62px; height: 22px; color: #738f82; font-size: 10px; }
.design-public.v3 .v3-discard-summary { display: grid; grid-template-rows: minmax(0,1fr) 22px; gap: 8px; min-width: 0; padding-left: 14px; border-left: 1px solid #d7be781c; }
.design-public.v3 .v3-discard-summary .v3-stock { align-self: start; justify-content: center; gap: 12px; padding-top: 6px; }
.design-public.v3 .v3-discard-summary .stack { display: grid; place-items: center; border: 1px solid #a88c54; background: #254739; box-shadow: 3px 3px #173d2f,4px 4px #8c794d; color: #d8c69a; font-size: 13px; }
.design-public.v3 .v3-discard-summary .v3-stock-info { align-items: flex-start; }
.design-public.v3 .v3-discard-summary .v3-stock-info small { font-size: 10px; }
.design-public.v3 .v3-discard-summary > button { width: 100%; height: 22px; justify-content: center; padding: 0; border: 0; border-radius: 4px; background: transparent; color: #9fb6aa; font-size: 11px; font-weight: 500; }
.design-public.v3 .v3-discard-summary > button:hover:not(:disabled) { color: #f0cc73; border: 0; background: #ffffff08; }
.design-public.v3 .v3-footer { display: flex; align-items: center; justify-content: space-between; gap: 14px; min-height: 34px; padding: 4px 2px; }
.design-public.v3 .v3-status { min-width: 0; padding: 0; font-size: 12px; }
.design-public.v3 .v3-status span { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: #8eaa9a; }
.design-public.v3 .v3-sim { flex: none; gap: 6px; }
.design-public.v3 .v3-sim small { margin-right: 3px; font-size: 11px; color: #718e80; }
.design-public.v3 .v3-sim button { height: 24px; padding-inline: 8px; font-size: 11px; color: #9db4a5; border-color: transparent; background: transparent; }
.design-public.v3 .v3-sim button:hover { background: #ffffff0a; border-color: #d7be782b; }
/* Expanded deck: actions stay in one compact row; result lanes remain quiet. */
.v3-dialog:has(.three-lanes) { width: min(1060px, 94vw); }
.v3-dialog .v3-sort.three-lanes { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; overflow-x: visible; }
.v3-dialog .v3-sort .v3-row { display: flex; align-items: center; flex-wrap: nowrap; gap: 8px; min-height: 58px; padding: 4px 0; }
.v3-dialog .v3-sort .v3-sort-tile { position: relative; display: grid; flex: 0 0 41px; width: 41px; height: 50px; padding: 3px 2px; overflow: hidden; border: 1px solid #bda05f; border-radius: 4px; box-shadow: 0 2px 6px #0005; }
.v3-dialog .v3-sort .v3-sort-tile-face { grid-template-columns: 12px minmax(0,1fr); align-items: center; justify-items: center; color: #302417; background: linear-gradient(135deg,#fff4d7,#d6bb83); }
.v3-dialog .v3-sort .v3-sort-tile-face.red { color: #a3332d; }
.v3-dialog .v3-sort .v3-sort-tile-face b { align-self: start; display: flex; flex-direction: column; align-items: center; gap: 1px; font: 800 11px/1 Georgia,serif; }
.v3-dialog .v3-sort .v3-sort-tile-face strong { display: block; max-height: 100%; overflow: hidden; writing-mode: vertical-rl; text-orientation: upright; font-size: 10px; line-height: 1; letter-spacing: .2px; white-space: nowrap; }
.v3-dialog .v3-sort .v3-sort-tile-back { place-items: center; background: repeating-linear-gradient(45deg,#70342e,#70342e 4px,#803b33 4px,#803b33 8px); color: #edce91; font: 12px serif; }
.v3-dialog .v3-sort .v3-row-actions { display: flex; align-items: center; flex: 1 1 auto; gap: 4px; min-width: 0; }
.v3-dialog .v3-sort .v3-row-actions button { display: inline-flex; align-items: center; justify-content: center; flex: 0 1 auto; min-width: 30px; height: 26px; padding: 0 6px; font-size: 10px; white-space: nowrap; }
.v3-dialog .v3-sort .v3-row-passive { justify-content: flex-start; }
.v3-dialog .v3-sort.v3-discard-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(66px,1fr)); gap: 12px 8px; max-height: 55vh; padding: 12px; overflow-y: auto; border: 1px solid #ffffff18; border-radius: 8px; background: #0002; }
.v3-dialog .v3-discard-card { display: grid; justify-items: center; gap: 5px; min-width: 0; }
.v3-dialog .v3-discard-card button { width: 62px; height: 22px; padding: 0; border: 0; border-radius: 4px; background: transparent; color: #9fb6aa; font-size: 11px; font-weight: 500; white-space: nowrap; }
.v3-dialog .v3-discard-card button:hover:not(:disabled) { color: #f0cc73; border: 0; background: #ffffff08; }
.v3-dialog footer .v3-footer-spacer { flex: 1; }
.v3-dialog footer button { min-width: 80px; height: 36px; padding: 0 16px; font-size: 13px; }
@media(max-width:700px) {
  .design-public.v3 .v3-shell { grid-template-columns: 1fr; height: auto; }
  .design-public.v3 .v3-deck { border: 0; padding: 0; grid-template-columns: 1fr; grid-template-rows: 28px 70px minmax(64px,auto); }
  .design-public.v3 .v3-stage { min-height: 210px; }
  .design-public.v3 .v3-discard-body { grid-template-columns: minmax(0,1fr) 126px; }
  .design-public.v3 .v3-discard-summary { padding-left: 10px; }
  .design-public.v3 .v3-footer { flex-wrap: wrap; }
  .v3-dialog .v3-sort.three-lanes { grid-template-columns: 1fr; }
}
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./docs/sango-public-v3.css":
/*!**********************************!*\
  !*** ./docs/sango-public-v3.css ***!
  \**********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/noSourceMaps.js */ "./node_modules/css-loader/dist/runtime/noSourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `.public-demo{margin:0;padding:36px;background:radial-gradient(ellipse at top,#185745,#061c18);min-height:100vh;box-sizing:border-box;color:#f4ead2;font:14px "Microsoft YaHei",sans-serif}.demo-heading{max-width:1100px;margin:0 auto 26px}.demo-heading h1{font-size:24px;color:#efd18b}.demo-heading p{color:#a2bcb0}.demo-heading a{color:#efd18b}.public-demo #public-v3{max-width:1100px;margin:auto;min-height:310px}.v3{color:#f4ead2;font:14px "Microsoft YaHei",sans-serif;box-sizing:border-box}.v3 *{box-sizing:border-box}.v3 button,.v3 input{font:inherit}.v3 button{cursor:pointer;border:1px solid #d9be7645;border-radius:6px;background:#ffffff09;color:#f4ead2;padding:7px 10px}.v3 button:hover{background:#ffffff18;border-color:#d9be76}.v3 button:focus-visible,.v3 input:focus-visible{outline:2px solid #f3cf72;outline-offset:3px}.v3 button:disabled{opacity:.4;cursor:default}.v3 .primary{background:#e2b84b;color:#291f13;font-weight:700}.v3-shell{display:grid;grid-template-columns:200px minmax(0,1fr) 146px;gap:22px;min-height:240px;padding:18px;background:linear-gradient(110deg,#0a3029,#0b362b80);border-radius:12px;border:1px solid #d9be7626}.v3-deck{border-right:1px solid #ffffff12;padding-right:18px}.v3-topline{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:12px}.v3 small,.v3 .muted{color:#9fb6aa;font-size:12px}.v3-back{float:left;display:grid;place-items:center;width:45px;height:60px;margin:0 12px 12px 0;border:1px solid #c49f61;border-radius:5px;background:repeating-linear-gradient(45deg,#70342e,#70342e 4px,#803b33 4px,#803b33 8px);color:#edce91;font-family:serif;box-shadow:3px 3px #102820,4px 4px #bd9558}.v3-count{font:26px Georgia,serif}.v3-controls{display:flex;align-items:center;gap:6px;clear:both;margin:8px 0}.v3 input{width:54px;padding:6px;color:#f4ead2;background:#061e19;border:1px solid #d9be7650;border-radius:5px}.v3-more{display:flex;flex-wrap:wrap;gap:5px}.v3-more button{font-size:12px;padding:5px 8px}.v3-stage{min-width:0}.v3-faces{display:flex;gap:9px;overflow:auto;padding:4px 1px 8px}.v3-empty{display:grid;place-content:center;min-height:120px;text-align:center;color:#718f82;line-height:2}.v3-empty b{font-weight:400;font-size:18px;color:#abc3b6}.v3-card{position:relative;flex:none;width:78px;height:103px;padding:7px;color:#302417;background:linear-gradient(135deg,#fff4d7,#d6bb83);border:1px solid #c6a461;border-radius:6px;box-shadow:0 4px 10px #0003}.v3-card.red{color:#a3332d}.v3-card b{display:block;font:700 20px Georgia,serif}.v3-card strong{display:block;margin-top:13px;text-align:center;font-size:14px}.v3-card small{color:#76623e;font-size:11px}.v3-face-actions{display:flex;gap:3px;margin-top:7px;flex-direction:column}.v3-face-actions button{padding:4px;font-size:12px}.v3-discard{border-left:1px solid #ffffff12;padding-left:18px;display:flex;flex-direction:column;justify-content:center;gap:9px}.v3-discard .stack{position:relative;width:53px;height:64px;border:1px solid #a88c54;border-radius:5px;background:#254739;box-shadow:3px 3px #173d2f,4px 4px #8c794d;display:grid;place-items:center;color:#d8c69a;margin-bottom:8px}.v3-status{display:flex;align-items:center;gap:15px;padding:9px 3px;font-size:12px}.v3-status span{flex:1;color:#bdcbbd}.v3-status button{font-size:12px;padding:4px 8px}.v3-dialog{width:min(820px,94vw);max-height:85vh;overflow:auto;border:1px solid #b79952;border-radius:13px;background:#0c3027;color:#f4ead2;padding:24px;box-shadow:0 25px 100px #0009}.v3-dialog::backdrop{background:#001510b8}.v3-dialog header{display:flex;justify-content:space-between;align-items:center;gap:15px}.v3-dialog h2{font-size:20px;color:#efd18b;margin:0}.v3-dialog p{line-height:1.7}.v3-dialog footer{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}.v3-grid{display:flex;flex-wrap:wrap;gap:14px;padding:15px 0}.v3-record{display:flex;flex-direction:column;gap:5px;max-width:90px}.v3-sort{display:grid;grid-template-columns:1fr 1fr;gap:18px}.v3-sort section{min-height:180px;padding:12px;background:#0002;border:1px solid #ffffff18;border-radius:8px}.v3-sort h3{font-size:14px;margin:0 0 12px;color:#e6ce8c}.v3-row{display:flex;align-items:center;gap:6px;padding:9px 0;border-bottom:1px solid #ffffff12;flex-wrap:wrap}.v3-row span{flex:1;min-width:120px}.v3-row button{padding:4px 7px;font-size:12px}.v3-dialog .privacy{display:inline-block;color:#c1b2e8;background:#8871b222;padding:4px 8px;border-radius:4px;font-size:12px}.board #public-v3{position:absolute;left:20px;top:287px;width:1020px;z-index:9}.board #public-v3 .v3-shell{min-height:220px;padding:12px 16px}.board #public-v3 .v3-face-actions{flex-direction:row}.board #public-v3 .v3-card{height:87px}.board #public-v3 .v3-topline{margin-bottom:7px}@media(max-width:700px){.public-demo{padding:18px}.v3-shell{grid-template-columns:1fr;gap:16px}.v3-deck{border:0;padding:0}.v3-discard{border:0;border-top:1px solid #ffffff12;padding:16px 0 0;flex-direction:row;align-items:center}.v3-sort{grid-template-columns:1fr}.v3-status{flex-wrap:wrap}}
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./src/wc/css/common.css":
/*!*******************************!*\
  !*** ./src/wc/css/common.css ***!
  \*******************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/noSourceMaps.js */ "./node_modules/css-loader/dist/runtime/noSourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `div[data-display="hide"], .hide { display: none !important; }
:host, *, *::before, *::after { box-sizing: border-box; }
span {
  cursor: default;
  -webkit-user-select: none;
  user-select: none;
}
button, input { font: inherit; }
div.widget { margin: 0; }
div.widget:empty { border: 0; padding: 0; margin: 0; }
::-webkit-scrollbar { width: 0; height: 0; background: transparent; }
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./src/wc/css/sgArea.css":
/*!*******************************!*\
  !*** ./src/wc/css/sgArea.css ***!
  \*******************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/noSourceMaps.js */ "./node_modules/css-loader/dist/runtime/noSourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/getUrl.js */ "./node_modules/css-loader/dist/runtime/getUrl.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2__);
// Imports



var ___CSS_LOADER_URL_IMPORT_0___ = new URL(/* asset import */ __webpack_require__(/*! data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27 preserveAspectRatio=%27none%27%3E%3Crect x=%272%27 y=%272%27 width=%2796%27 height=%2796%27 rx=%278%27 fill=%27none%27 stroke=%27%239fb6aa%27 stroke-opacity=%27.32%27 stroke-width=%272%27 stroke-dasharray=%277 6%27/%3E%3C/svg%3E */ "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27 preserveAspectRatio=%27none%27%3E%3Crect x=%272%27 y=%272%27 width=%2796%27 height=%2796%27 rx=%278%27 fill=%27none%27 stroke=%27%239fb6aa%27 stroke-opacity=%27.32%27 stroke-width=%272%27 stroke-dasharray=%277 6%27/%3E%3C/svg%3E"), __webpack_require__.b);
var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
var ___CSS_LOADER_URL_REPLACEMENT_0___ = _node_modules_css_loader_dist_runtime_getUrl_js__WEBPACK_IMPORTED_MODULE_2___default()(___CSS_LOADER_URL_IMPORT_0___);
// Module
___CSS_LOADER_EXPORT___.push([module.id, `.control-area { display: none; padding: 0.1rem; }
.expanded-heading { display: none; }
:host(.overflow-controls) .wrapper { position: relative; overflow: hidden; }
:host(.overflow-controls) .card-area { width: 100%; min-width: 0; height: 100%; scrollbar-width: none; }
:host(.overflow-controls) .card-area::-webkit-scrollbar { display: none; }
:host(.overflow-controls) .wrapper .card-area { scroll-snap-type: none; }
:host(.overflow-controls) .card-area > sg-card { flex: 0 0 41px; width: 41px; min-width: 41px; }
.expand-area, .area-scroll, .expanded-heading button { border: 1px solid #e8cf8b44; border-radius: 5px; color: #f0cc73; background: #10392ff2; cursor: pointer; }
.expand-area { position: absolute; left: 0; top: 0; bottom: 0; z-index: 4; width: 3.1rem; padding: 3px; border: 0; border-radius: 0; font-size: .65rem; }
.expand-area { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5px; }
.area-label { font-weight: 800; }.expand-label { color: #9fb6aa; font-size: .6rem; }
.area-scroll { position: absolute; top: 50%; transform: translateY(-50%); z-index: 5; width: 23px; height: 32px; padding: 0; font: 22px/1 Georgia, serif; box-shadow: 0 2px 8px #0006; }
.scroll-left { left: 3.15rem; }.scroll-right { right: 3px; }
.area-scroll[hidden] { display: none; }.area-scroll:disabled { opacity: .35; cursor: default; }
.expand-area:focus-visible, .area-scroll:focus-visible, .expanded-heading button:focus-visible { outline: 2px solid #e2b84b; outline-offset: -2px; }
:host(.overflow-controls) .wrapper:popover-open { position: fixed; inset: 0; margin: auto; width: min(760px, calc(100vw - 32px)); height: max-content; max-height: 85vh; padding: 16px; border: 1px solid #c7a75a; border-radius: 12px; color: #f4ead2; background: #0b3027; box-shadow: 0 16px 64px #0009; }
.wrapper:popover-open .expanded-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 12px; }
.expanded-heading button { padding: 6px 14px; }
.wrapper:popover-open .expand-area, .wrapper:popover-open .area-scroll { display: none; }
:host(.overflow-controls) .wrapper:popover-open .card-area { display: grid; grid-template-columns: repeat(auto-fill, 52px); grid-auto-rows: 78px; gap: 12px 8px; align-content: start; height: auto; min-height: 90px; max-height: calc(85vh - 90px); padding: 8px 4px; overflow: auto; scrollbar-width: thin; }
:host(.overflow-controls) .wrapper:popover-open .card-area > sg-card { width: 52px; min-width: 52px; height: 78px; margin: 0; }
:host(.drag-target) { outline: 2px solid #e2b84b; outline-offset: -2px; background: #194f3c; }
:host(.table-area.jiang-area) { opacity: 0.96; }
.wrapper {
  width: 100%;
  height: 100%;
  min-height: 1rem;
  overflow: auto;
  border: 1px dashed rgba(232, 207, 139, 0.28);
  border-radius: 0.45rem;
}
.card-area {
  display: flex;
  align-items: flex-end;
  gap: 0.3rem;
  min-width: 100%;
  min-height: 100%;
  padding: 0.35rem;
  overflow: auto;
  border: 0;
}
:host(.hand-area) .card-area {
  align-items: stretch;
  gap: 0.25rem;
  padding: 0.2rem 0.25rem 0.2rem 0.45rem;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x proximity;
}
:host(.other1-area) .card-area,
:host(.other2-area) .card-area {
  display: flex;
  align-items: stretch;
  gap: 0.22rem;
  padding: 0.2rem 0.25rem 0.2rem 0.45rem;
  overflow-x: auto;
  overflow-y: hidden;
}
:host(.other1-area) .card-area > sg-card,
:host(.other2-area) .card-area > sg-card {
  width: 100%;
  min-width: 0;
}
:host(.zhuang-area) .card-area,
:host(.pan-area) .card-area {
  flex-wrap: nowrap;
  align-items: flex-start;
  min-height: 2rem;
  padding: 0.2rem;
}
:host(.zhuang-area) .wrapper { border: 0; overflow: hidden; }
:host(.zhuang-area) .card-area {
  display: grid;
  height: 100%;
  min-height: 0;
  padding: 0;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: minmax(0, 1fr);
  align-items: stretch;
  gap: 0.18rem;
  overflow: hidden;
  background-image: url(${___CSS_LOADER_URL_REPLACEMENT_0___});
  background-size: 25% 100%;
  background-repeat: repeat-x;
}
:host(.pan-area) { flex: 1 1 auto; min-width: 0; }
:host(.pan-area) .wrapper { height: auto; overflow: visible; }
:host(.pan-area) .card-area {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.38rem;
  padding: 0;
  height: auto;
  overflow: visible;
}
:host(.jiang-block) .wrapper { border: 0; border-radius: 0; overflow: hidden; }
:host(.jiang-block) .card-area {
  gap: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
:host(.jiang-block) .card-area:empty {
  display: grid;
  place-items: center;
  box-sizing: border-box;
  border: 1px dashed rgba(232, 207, 139, 0.48);
  border-radius: 0.42rem;
  color: rgba(244, 234, 210, 0.64);
  background: repeating-linear-gradient(135deg, rgba(232, 207, 139, 0.05) 0 0.35rem, transparent 0.35rem 0.7rem);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}
:host(.jiang1-area.jiang-block) .card-area:empty::after { content: "主将"; }
:host(.jiang2-area.jiang-block) .card-area:empty::after { content: "副将"; }
:host(.jiang-block) .card-area > sg-jiang {
  display: block;
  flex: 0 0 100%;
  width: 100%;
  height: 100% !important;
}
:host(.current-player) .card-area:hover { box-shadow: none; }
:host(.general-selection) .wrapper,
:host(.general-selection) .card-area {
  width: 100%;
  height: 100%;
}
:host(.general-selection) .card-area {
  align-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
}
:host(.general-selection) .card-area > sg-jiang {
  width: 100%;
  height: 11.85rem;
}
:host(.discard-area) .card-area {
  align-items: center;
  gap: 0;
  padding-inline: 1rem;
}
:host(.discard-area) .card-area > sg-card + sg-card {
  margin-left: -1rem;
}
:host(.table-area.pai-area) .wrapper, :host(.table-area.discard-area) .wrapper { border: 0; overflow: hidden; height: 100%; }
:host(.table-area.pai-area) .card-area, :host(.table-area.discard-area) .card-area { display: grid; grid-template-columns: repeat(auto-fill, 41px); grid-auto-rows: 54px; gap: 9px 4px; align-content: start; align-items: start; justify-content: start; height: 100%; min-height: 0; padding: 10px 7px 8px; overflow: auto; scrollbar-width: thin; scrollbar-color: #557a64 #07261e; }
:host(.table-area.discard-area) .card-area > sg-card + sg-card { margin-left: 0; }
@media (max-width: 620px) {
  .card-area { padding: 0.22rem; }
  :host(.hand-area) .card-area { padding-inline: 0.35rem; }
  :host(.other1-area) .card-area,
  :host(.other2-area) .card-area { padding-inline: 0.35rem; }
  :host(.general-selection) .card-area > sg-jiang {
    flex-basis: auto;
    width: 100%;
    height: 11.3rem;
  }
}
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./src/wc/css/sgCard.css":
/*!*******************************!*\
  !*** ./src/wc/css/sgCard.css ***!
  \*******************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/noSourceMaps.js */ "./node_modules/css-loader/dist/runtime/noSourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `:host {
  position: relative;
  display: inline-block;
  flex: 0 0 auto;
  -webkit-user-select: none;
  user-select: none;
  -webkit-user-drag: none;
  touch-action: none;
  transition: translate .14s ease-out;
}
:host(.insert-left) { translate: -6px 0; }
:host(.drag-source) { opacity: .22; }
.card-block {
  position: relative;
  display: inline-block;
  width: auto;
  border-radius: 0.45rem;
  transition: transform 0.14s, filter 0.14s;
}
.card-widget {
  display: inline-block;
  width: 2rem;
  height: 6.4rem;
  overflow: hidden;
  border: 1px solid #8c713b;
  border-radius: 0.45rem;
  color: #261d13;
  background: linear-gradient(145deg, #fff8e5, #d7bf88);
  box-shadow: 0 0.25rem 0.6rem rgba(0, 0, 0, 0.3);
  -webkit-user-select: none;
  user-select: none;
}
.card-front {
  display: none;
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0.24rem;
  background: linear-gradient(145deg, #fff8e5, #dfc891);
}
.card-back {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: #f5d88a;
  background: repeating-linear-gradient(45deg, #743029, #743029 6px, #934138 6px, #934138 12px);
  font: 800 0.9rem Georgia, serif;
}
.card-back p { margin: 0; }
.card-suit { font: 800 0.75rem Georgia, serif; }
.info-line {
  overflow: hidden;
  font-size: 0.72rem;
  white-space: nowrap;
}
.pai-name {
  display: block;
  margin-top: 0.35rem;
  writing-mode: vertical-rl;
  font-weight: 800;
}
.pai-desc { display: none; }
:host(.has-desc) .desc-line {
  position: absolute;
  bottom: 0.2rem;
  left: 0.24rem;
  display: block;
  width: auto;
  min-width: 0;
  max-height: none;
  overflow: visible;
  font: 800 0.75rem/1 Georgia, "STKaiti", serif;
}
:host(.has-desc) .pai-desc {
  display: block;
  color: #8d342b;
  font: inherit;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.65);
}
.card-block.selected {
  z-index: 40;
  transform: translateY(-0.45rem);
  filter: drop-shadow(0 0 0.25rem #e2b84b);
}
.card-block.selected .card-widget { border: 2px solid #e2b84b; }
/* Equipment uses the same lift animation as other selected cards. */
:host(.zhuang-area-card) .card-block { cursor: pointer; }
:host(.zhuang-area-card) .card-block.selected .card-widget { border: 2px solid #e2b84b; box-shadow: inset 0 0 0 1px #735415; }
.card-block.show-front .card-widget {
  border-color: #5c8cad;
  background: #eef8f4;
}
.card-block.show-front .card-front { background: #eef8f4; }
span.club::before { content: "♣"; }
span.heart::before { content: "♥"; color: #bd342d; }
span.diamond::before { content: "♦"; color: #bd342d; }
span.spade::before { content: "♠"; }
:host(.current-player) .card-back,
:host(.discard-area-card) .card-back,
:host(.pan-area-card) .card-back,
.card-block.show-front .card-back { display: none; }
:host(.current-player) .card-front,
:host(.discard-area-card) .card-front,
:host(.pan-area-card) .card-front,
.card-block.show-front .card-front { display: block; }
:host(.current-player) .card-widget,
:host(.discard-area-card) .card-widget {
  width: 4.5rem;
  height: 6.6rem;
}
:host(.current-player) .pai-name,
:host(.discard-area-card) .pai-name {
  margin-top: 1.25rem;
  text-align: center;
  writing-mode: horizontal-tb;
  font-size: 0.95rem;
}
:host(.zhuang-area-card) .card-widget {
  display: block;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 1.65rem;
}
:host(.zhuang-area-card) {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 0;
}
:host(.zhuang-area-card) .card-block { display: block; width: 100%; height: 100%; }
:host(.zhuang-area-card) .card-back { display: none; }
:host(.zhuang-area-card) .card-front {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.08rem;
  width: 100%;
  padding: 0.16rem 0.08rem;
}
:host(.zhuang-area-card) .card-suit {
  flex: 0 0 auto;
  white-space: nowrap;
}
:host(.zhuang-area-card) .card-suit::after { content: ""; }
:host(.zhuang-area-card) .pai-name {
  display: block;
  width: 100%;
  min-width: 0;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  writing-mode: horizontal-tb;
  font-size: 0.56rem;
  font-weight: 800;
  letter-spacing: -0.03rem;
  white-space: nowrap;
  text-align: center;
}
:host(.pan-area-card) .card-block {
  width: 100%;
  overflow: hidden;
}
:host(.pan-area-card) { display: block; width: 100%; min-width: 0; }
:host(.pan-area-card) .card-widget {
  display: block;
  width: 100%;
  height: 2.4rem;
}
:host(.pan-area-card) .pai-name {
  display: inline;
  margin: 0 0 0 0.15rem;
  writing-mode: horizontal-tb;
}
:host(.current-player.other1-area-card),
:host(.current-player.other2-area-card) {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 0;
}
:host(.current-player.other1-area-card) .card-block,
:host(.current-player.other2-area-card) .card-block,
:host(.current-player.other1-area-card) .card-widget,
:host(.current-player.other2-area-card) .card-widget {
  display: block;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 2.2rem;
}
:host(.current-player.other1-area-card) .card-front,
:host(.current-player.other2-area-card) .card-front {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0.18rem;
}
:host(.current-player.other1-area-card) .pai-name,
:host(.current-player.other2-area-card) .pai-name {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  writing-mode: horizontal-tb;
  font-size: 0.62rem;
  white-space: nowrap;
}

/* V4 narrow text cards used by equipment, local hand/custom areas, and judgment. */
:host(.zhuang-area-card),
:host(.current-player.hand-area-card),
:host(.current-player.other1-area-card),
:host(.current-player.other2-area-card) {
  display: block;
  flex: 0 0 2.56rem;
  width: 2.56rem;
  min-width: 2.56rem;
  height: 100%;
  min-height: 0;
  scroll-snap-align: start;
}
:host(.zhuang-area-card) .card-block,
:host(.zhuang-area-card) .card-widget,
:host(.current-player.hand-area-card) .card-block,
:host(.current-player.hand-area-card) .card-widget,
:host(.current-player.other1-area-card) .card-block,
:host(.current-player.other1-area-card) .card-widget,
:host(.current-player.other2-area-card) .card-block,
:host(.current-player.other2-area-card) .card-widget {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
}
:host(.zhuang-area-card) .card-front,
:host(.current-player.hand-area-card) .card-front,
:host(.current-player.other1-area-card) .card-front,
:host(.current-player.other2-area-card) .card-front {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 0.82rem minmax(0, 1fr);
  align-items: center;
  justify-items: center;
  width: 100%;
  height: 100%;
  padding: 0.2rem 0.12rem;
}
:host(.zhuang-area-card) .card-suit,
:host(.current-player.hand-area-card) .card-suit,
:host(.current-player.other1-area-card) .card-suit,
:host(.current-player.other2-area-card) .card-suit {
  align-self: start;
  justify-self: start;
  font: 800 0.68rem/1 Georgia, serif;
}
:host(.zhuang-area-card) .card-suit > span,
:host(.current-player.hand-area-card) .card-suit > span,
:host(.current-player.other1-area-card) .card-suit > span,
:host(.current-player.other2-area-card) .card-suit > span {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.08rem;
}
:host(.zhuang-area-card) .info-line,
:host(.current-player.hand-area-card) .info-line,
:host(.current-player.other1-area-card) .info-line,
:host(.current-player.other2-area-card) .info-line {
  min-width: 0;
  max-height: 100%;
  overflow: hidden;
}
:host(.zhuang-area-card) .pai-name,
:host(.current-player.hand-area-card) .pai-name,
:host(.current-player.other1-area-card) .pai-name,
:host(.current-player.other2-area-card) .pai-name {
  display: block;
  width: auto;
  max-height: 100%;
  margin: 0;
  overflow: hidden;
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-size: 0.62rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.03rem;
  white-space: nowrap;
  text-align: left;
}
:host(.zhuang-area-card.has-desc) .desc-line,
:host(.current-player.hand-area-card.has-desc) .desc-line,
:host(.current-player.other1-area-card.has-desc) .desc-line,
:host(.current-player.other2-area-card.has-desc) .desc-line,
:host(.pan-area-card.has-desc) .desc-line {
  position: absolute;
  bottom: 0.12rem;
  left: 0.14rem;
  display: block;
  width: auto;
  min-width: 0;
  max-height: none;
  overflow: visible;
}
:host(.zhuang-area-card.has-desc) .desc-line,
:host(.current-player.hand-area-card.has-desc) .desc-line,
:host(.current-player.other1-area-card.has-desc) .desc-line,
:host(.current-player.other2-area-card.has-desc) .desc-line,
:host(.pan-area-card.has-desc) .desc-line {
  font: 900 0.68rem/1 Georgia, "STKaiti", serif;
}

:host(.pan-area-card) {
  position: relative;
  display: block;
  flex: 0 0 3.2rem;
  width: 2.65rem;
  height: 3.2rem;
  min-width: 0;
  overflow: visible;
}
:host(.pan-area-card)::after {
  content: attr(data-effect);
  position: absolute;
  bottom: -0.2rem;
  left: -0.2rem;
  z-index: 4;
  display: grid;
  place-items: center;
  width: 1.35rem;
  height: 1.35rem;
  border: 1px solid #d76859;
  border-radius: 0.38rem;
  color: #fff4c7;
  background: #8d342b;
  box-shadow: 0 0.15rem 0.3rem rgba(0, 0, 0, 0.35);
  font: 900 0.72rem/1 Georgia, "STKaiti", serif;
}
:host(.pan-area-card) .card-block,
:host(.pan-area-card) .card-widget { display: block; width: 100%; height: 100%; overflow: hidden; }
:host(.pan-area-card) .card-front {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 0.82rem minmax(0, 1fr);
  align-items: center;
  justify-items: center;
  width: 100%;
  height: 100%;
  padding: 0.2rem 0.12rem;
}
:host(.pan-area-card) .card-suit { align-self: start; justify-self: start; font: 800 0.68rem/1 Georgia, serif; }
:host(.pan-area-card) .card-suit > span { display: flex; flex-direction: column; align-items: center; gap: 0.08rem; }
:host(.pan-area-card) .info-line { min-width: 0; max-height: 100%; overflow: hidden; }
:host(.pan-area-card) .pai-name { display: block; width: auto; max-height: 100%; margin: 0; overflow: hidden; writing-mode: vertical-rl; text-orientation: upright; font-size: 0.62rem; font-weight: 800; line-height: 1; letter-spacing: 0.03rem; white-space: nowrap; }
@media (max-width: 620px) {
  :host(.current-player) .card-widget,
  :host(.discard-area-card) .card-widget {
    width: 3.8rem;
    height: 5.6rem;
  }
  :host(.current-player) .pai-name,
  :host(.discard-area-card) .pai-name {
    margin-top: 0.85rem;
    font-size: 0.82rem;
  }
  :host(.current-player.zhuang-area-card) .card-widget {
    width: 100%;
    height: 100%;
    min-height: 1.55rem;
  }
  :host(.current-player.zhuang-area-card) .pai-name {
    margin: 0;
    font-size: 0.66rem;
  }
}

/* Compact public cards; draw-pile faces follow their reveal state. */
:host(.discard-area-card), :host(.pai-area-card) { display:block; width:41px; min-width:41px; height:54px; min-height:0; }
:host(.discard-area-card) .card-block, :host(.pai-area-card) .card-block,
:host(.discard-area-card) .card-widget, :host(.pai-area-card) .card-widget { display:block; width:100%; height:100%; min-height:0; }
:host(.discard-area-card) .card-front, :host(.pai-area-card) .card-front { display:grid; grid-template-columns:12px minmax(0,1fr); align-items:center; justify-items:center; width:100%; height:100%; padding:3px 2px; }
:host(.discard-area-card) .card-suit, :host(.pai-area-card) .card-suit { align-self:start; justify-self:start; font:800 11px/1 Georgia,serif; }
:host(.discard-area-card) .card-suit > span, :host(.pai-area-card) .card-suit > span { display:flex; flex-direction:column; align-items:center; gap:1px; }
:host(.discard-area-card) .pai-name, :host(.pai-area-card) .pai-name { display:block; margin:0; writing-mode:vertical-rl; text-orientation:upright; white-space:nowrap; font:800 10px/1 'Microsoft YaHei',sans-serif; letter-spacing:.2px; }
:host(.discard-area-card.has-desc) .desc-line, :host(.pai-area-card.has-desc) .desc-line { bottom:3px; left:2px; font:800 11px/1 Georgia,serif; }
:host(.pai-area-card) .card-front { display:none; }
:host(.pai-area-card) .card-back { display:grid; }
:host(.pai-area-card) .card-block.show-front .card-front { display:grid; }
:host(.pai-area-card) .card-block.show-front .card-back { display:none; }

/* Ordinary game cards keep one tile size; containers only control layout and scrolling. */
:host(:not(.zhuang-area-card)) .card-widget {
  width: 41px;
  height: 54px;
}
:host(.hand-area-card),
:host(.other1-area-card),
:host(.other2-area-card),
:host(.current-player.other1-area-card),
:host(.current-player.other2-area-card),
:host(.pan-area-card) {
  display: block;
  flex: 0 0 41px;
  width: 41px;
  min-width: 41px;
  height: 54px;
  min-height: 54px;
}
:host(.hand-area-card) .card-block,
:host(.hand-area-card) .card-widget,
:host(.other1-area-card) .card-block,
:host(.other1-area-card) .card-widget,
:host(.other2-area-card) .card-block,
:host(.other2-area-card) .card-widget,
:host(.pan-area-card) .card-block,
:host(.pan-area-card) .card-widget {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
}
:host(.hand-area-card) .card-front,
:host(.other1-area-card) .card-front,
:host(.other2-area-card) .card-front,
:host(.pan-area-card) .card-front {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 0.82rem minmax(0, 1fr);
  align-items: center;
  justify-items: center;
  width: 100%;
  height: 100%;
  padding: 0.2rem 0.12rem;
}
:host(.hand-area-card) .card-suit,
:host(.other1-area-card) .card-suit,
:host(.other2-area-card) .card-suit,
:host(.pan-area-card) .card-suit {
  align-self: start;
  justify-self: start;
  font: 800 0.68rem/1 Georgia, serif;
}
:host(.hand-area-card) .card-suit > span,
:host(.other1-area-card) .card-suit > span,
:host(.other2-area-card) .card-suit > span,
:host(.pan-area-card) .card-suit > span {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.08rem;
}
:host(.hand-area-card) .info-line,
:host(.other1-area-card) .info-line,
:host(.other2-area-card) .info-line,
:host(.pan-area-card) .info-line {
  min-width: 0;
  max-height: 100%;
  overflow: hidden;
}
:host(.hand-area-card) .pai-name,
:host(.other1-area-card) .pai-name,
:host(.other2-area-card) .pai-name,
:host(.pan-area-card) .pai-name {
  display: block;
  width: auto;
  max-height: 100%;
  margin: 0;
  overflow: hidden;
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-size: 0.62rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.03rem;
  white-space: nowrap;
  text-align: left;
}
:host(.hand-area-card.has-desc) .desc-line,
:host(.other1-area-card.has-desc) .desc-line,
:host(.other2-area-card.has-desc) .desc-line,
:host(.pan-area-card.has-desc) .desc-line {
  bottom: 0.12rem;
  left: 0.14rem;
  font: 900 0.68rem/1 Georgia, "STKaiti", serif;
}

/* Opponents' private areas stay face-down unless the card has been revealed. */
:host(.hand-area-card:not(.current-player)) .card-front,
:host(.other1-area-card:not(.current-player)) .card-front,
:host(.other2-area-card:not(.current-player)) .card-front {
  display: none;
}
:host(.hand-area-card:not(.current-player)) .card-back,
:host(.other1-area-card:not(.current-player)) .card-back,
:host(.other2-area-card:not(.current-player)) .card-back {
  display: grid;
}
:host(.hand-area-card:not(.current-player)) .card-block.show-front .card-front,
:host(.other1-area-card:not(.current-player)) .card-block.show-front .card-front,
:host(.other2-area-card:not(.current-player)) .card-block.show-front .card-front {
  display: grid;
}
:host(.hand-area-card:not(.current-player)) .card-block.show-front .card-back,
:host(.other1-area-card:not(.current-player)) .card-block.show-front .card-back,
:host(.other2-area-card:not(.current-player)) .card-block.show-front .card-back {
  display: none;
}

/* Keep discarded cards visually consistent with every other face-up card. */
:host(.discard-area-card) .card-front {
  color: #261d13;
  background: linear-gradient(145deg, #fff8e5, #dfc891);
}
:host(.discard-area-card) .card-block.show-front .card-widget {
  border-color: #8c713b;
  background: linear-gradient(145deg, #fff8e5, #d7bf88);
}
:host(.discard-area-card) .card-block.show-front .card-front {
  background: linear-gradient(145deg, #fff8e5, #dfc891);
}
:host(.discard-area-card) .card-suit .heart,
:host(.discard-area-card) .card-suit .diamond {
  color: #b3342a;
}
:host(.discard-area-card) .card-suit .spade,
:host(.discard-area-card) .card-suit .club {
  color: #172820;
}

/* Large public discard card: same two-column language as local narrow cards. */
:host(.recent-public-card) { display:block; flex:0 0 5.25rem; width:5.25rem; height:6.125rem; }
:host(.recent-public-card) .card-block,
:host(.recent-public-card) .card-widget { display:block; width:100%; height:100%; }
:host(.recent-public-card) .card-front {
  box-sizing:border-box; display:grid; grid-template-columns:1.5rem minmax(0,1fr);
  align-items:center; justify-items:center; width:100%; height:100%; padding:.38rem .3rem;
}
:host(.recent-public-card) .card-suit { align-self:start; justify-self:start; font:800 1.1rem/1 Georgia,serif; }
:host(.recent-public-card) .card-suit > span { display:flex; flex-direction:column; align-items:center; gap:.08rem; }
:host(.recent-public-card) .info-line { min-width:0; max-height:100%; overflow:hidden; }
:host(.recent-public-card) .pai-name {
  display:block; width:auto; max-height:100%; margin:0; overflow:hidden;
  writing-mode:vertical-rl; text-orientation:upright; font-size:.86rem; font-weight:800;
  line-height:1; letter-spacing:.06rem; white-space:nowrap;
}
:host(.recent-public-card.has-desc) .desc-line { display:none; }
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./src/wc/css/sgHpbar.css":
/*!********************************!*\
  !*** ./src/wc/css/sgHpbar.css ***!
  \********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/noSourceMaps.js */ "./node_modules/css-loader/dist/runtime/noSourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `:host {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 0;
  position: relative;
}

.cur-hp-btn {
  display: none;
}

:host(.current-player) .cur-hp-btn {
  display: none;
  place-items: center;
}

:host(.current-player) {
  display: flex;
  grid-template-columns: auto 1.5rem;
  grid-template-rows: repeat(2, 1rem);
  column-gap: 0.28rem;
  row-gap: 0.12rem;
}

:host(.current-player) .hp-bar,
:host(.current-player) .numeric-hp {
  grid-column: 1;
  grid-row: 1 / 3;
  align-self: center;
}

:host(.current-player) .add-hp-btn { grid-column: 2; grid-row: 1; }
:host(.current-player) .reduce-hp-btn { grid-column: 2; grid-row: 2; }

button {
  min-height: 1.75rem;
  border: 1px solid rgba(232, 207, 139, 0.32);
  border-radius: 999px;
  color: #f4ead2;
  background: rgba(255, 255, 255, 0.07);
  cursor: pointer;
}

.max-hp-picker {
  box-sizing: border-box;
  width: min(18rem, calc(100vw - 2rem));
  padding: 0.65rem;
  border: 1px solid rgba(232, 207, 139, 0.4);
  border-radius: 0.7rem;
  color: #f4ead2;
  background: rgba(26, 22, 19, 0.98);
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.48);
}

.max-hp-picker:not([open]) {
  display: none;
}

.max-hp-picker::backdrop {
  background: rgba(0, 12, 10, 0.62);
  backdrop-filter: blur(2px);
}

.picker-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #f4ead2;
  font-size: 0.78rem;
}

.picker-close {
  width: 1.65rem;
  min-height: 1.65rem;
  padding: 0;
  font-size: 1rem;
}

.picker-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.3rem;
}

.max-hp-option {
  min-height: 1.8rem;
  padding: 0;
  border-radius: 0.35rem;
  font-weight: 700;
}

.max-hp-option:hover,
.max-hp-option:focus-visible,
.max-hp-option.selected {
  border-color: #e7c878;
  color: #211a12;
  background: #e7c878;
  outline: none;
}

.cur-hp-btn {
  width: 1.5rem;
  min-height: 1rem;
  height: 1rem;
  padding: 0;
  border-radius: 0.28rem;
  font-size: 0.8rem;
  line-height: 1;
  font-weight: 800;
}

.hp-bar {
  display: inline-flex;
  white-space: nowrap;
}

.hp-bar span {
  display: inline-block;
  color: #ef6259;
  font-family: "Material Icons";
  font-size: 1.2rem;
  cursor: default;
}

.hp-bar.compact {
  align-items: center;
  gap: 0.25rem;
  min-width: 3rem;
}

.hp-bar.compact .large-heart {
  font-family: inherit;
  font-size: 1.125rem;
  line-height: 1;
  filter: drop-shadow(0 0.12rem 0.12rem rgba(0, 0, 0, 0.35));
}

.hp-bar.compact .heart-count {
  color: #ff6961;
  font-family: inherit;
  font-size: 0.6875rem;
  font-weight: 900;
  line-height: 1;
}

:host(.current-player) .hp-bar span {
  cursor: pointer;
}

.numeric-hp {
  display: none;
  color: #f3d28c;
  font-size: 0.85rem;
  font-weight: 800;
  white-space: nowrap;
}

@media (max-width: 620px) {
  .hp-bar {
    display: none;
  }

  .numeric-hp {
    display: inline;
  }

  :host(.current-player) .hp-bar {
    display: inline-flex;
  }

  :host(.current-player) .numeric-hp {
    display: none;
  }

}

/* Keep the same numeric presentation at every HP value and viewport size. */
.hp-bar, :host(.current-player) .hp-bar { display: inline-flex; align-items: center; }
.numeric-hp, :host(.current-player) .numeric-hp { display: none; }
@media (max-width: 900px) {
  :host(.current-player) .cur-hp-btn { display: inline-grid; }
}
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./src/wc/css/sgJiang.css":
/*!********************************!*\
  !*** ./src/wc/css/sgJiang.css ***!
  \********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/noSourceMaps.js */ "./node_modules/css-loader/dist/runtime/noSourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `:host {
  display: inline-block;
  width: 8rem;
  height: 10rem;
  min-width: 0;
  overflow: hidden;
  border-radius: 0.45rem;
  background: #132a25;
}
.card-block {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.card-back {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  color: #352716;
  background: radial-gradient(circle at 45% 32%, rgba(255,246,211,.42), transparent 23%), linear-gradient(145deg, #ead09b, #b98b4f);
  font: 900 1.7rem Georgia, "STKaiti", serif;
}
.card-back p { margin: 0; }
.card-front {
  --kingdom-color: rgba(255, 255, 255, 0.75);
  box-sizing: border-box;
  display: none;
  position: relative;
  width: 100%;
  height: 100%;
  padding: 0;
  overflow: hidden;
  border: 0;
  background: transparent;
  border-radius: 0.42rem;
  box-shadow: none;
  cursor: pointer;
}
:host(.current-player) .card-back, .card-block.show-front .card-back { display: none; }
:host(.current-player) .card-front, .card-block.show-front .card-front { display: block; }
.card-front.shu { --kingdom-color: #e44f43; }
.card-front.wu { --kingdom-color: #2fbd68; }
.card-front.wei { --kingdom-color: #4a86e8; }
.card-front.qun { --kingdom-color: #b7ada0; }
.card-front.wei { --badge-color: #316da7; }
.card-front.shu { --badge-color: #ac3933; }
.card-front.wu { --badge-color: #267c4b; }
.card-front.qun { --badge-color: #68616f; }
.faction-badge { position: absolute; top: 0.375rem; left: 0.375rem; z-index: 2; display: none; place-items: center; width: 1.4375rem; height: 1.6875rem; border-radius: 3px 3px 7px 3px; color: #fff9ed; background: var(--badge-color); font: 800 0.9375rem Georgia, "STKaiti", serif; box-shadow: 0 2px 5px #0007; text-shadow: 0 1px 2px #0008; }
.faction-badge { display: grid; }
.card-front:focus-visible { outline: 3px solid #f0cc73; outline-offset: -4px; }
.jiang-desc {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
  background-size: cover;
  background-position: center 18%;
  background-repeat: no-repeat;
  background-color: #eee5cf;
}
.general-art {
  display: block;
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 18%;
}
.info-line {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.28rem;
  padding: 0.65rem 0.25rem 0.28rem;
  background: linear-gradient(transparent, rgba(5, 13, 11, 0.9) 58%);
  font-size: 0.76rem;
}
.info-line span {
  display: inline-block;
  padding: 0;
  color: #fff5dc;
  background: transparent;
  text-shadow: 0 1px 2px #000, 0 0 4px #000;
}
.jiang-name { font-family: Georgia, "STKaiti", serif; font-weight: 800; }
.jiang-gender { font-size: 0.9em; font-weight: 900; }
.show-ctrl, .select-ctrl, .detail-ctrl {
  position: absolute;
  z-index: 5;
  padding: 0.15rem 0.28rem;
  border-radius: 0.25rem;
  color: #20160a;
  background: rgba(255, 241, 202, 0.82);
  font-size: 0.68rem;
}
.show-ctrl, .select-ctrl, .detail-ctrl {
  display: none;
  border: 1px solid rgba(65, 43, 12, 0.35);
  font-weight: 800;
  cursor: pointer;
}
.show-ctrl { top: 0.2rem; right: 0.2rem; }
.show-ctrl {
  width: 1.55rem;
  height: 1.55rem;
  padding: 0;
  border: 0;
  border-radius: 0;
  color: #fff5dc;
  background: transparent;
  filter: drop-shadow(0 1px 2px #000) drop-shadow(0 0 3px rgba(0,0,0,.8));
  transition: transform .14s, color .14s, filter .14s;
}
.show-ctrl svg { width: 1.05rem; height: 1.05rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.show-ctrl:hover { transform: scale(1.14); color: #fff; }
.show-ctrl.revealed { color: #f0cc73; filter: drop-shadow(0 1px 2px #000) drop-shadow(0 0 4px rgba(240,204,115,.78)); }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
.select-ctrl {
  right: 0.25rem;
  bottom: 0.25rem;
  padding: 0.28rem 0.48rem;
  color: #241800;
  background: #e2b84b;
}
.detail-ctrl {
  bottom: 0.25rem;
  left: 0.25rem;
  padding: 0.28rem 0.48rem;
  border: 1px solid rgba(255, 239, 196, 0.55);
  color: #fff5dc;
  background: rgba(5, 24, 20, 0.78);
}
:host(.current-player:not(.selection-card)) .show-ctrl { display: block; }
:host(.selection-card) .select-ctrl { display: none; }
:host(.selection-card) {
  height: 11.85rem;
  overflow: visible;
  border-radius: 0;
  background: transparent;
}
:host(.selection-card) .card-block {
  height: 10rem;
  overflow: visible;
}
:host(.selection-card) .detail-ctrl {
  position: static;
  display: block;
  width: max-content;
  margin: 0.38rem auto 0;
  padding: 0.15rem 0.55rem;
  border: 0;
  border-radius: 0.25rem;
  color: #aebeb6;
  background: transparent;
  font-size: 0.72rem;
  font-weight: 500;
}
:host(.selection-card) .detail-ctrl:hover { color: #f0cc73; }
:host(.selection-card) .card-front { display: block; }
:host(.selection-card) .card-back { display: none; }
:host(.selection-card) { cursor: pointer; }
:host(.selection-card) .card-front {
  transition: filter 0.18s ease, opacity 0.18s ease;
}
:host(.selection-card.selection-unavailable) { cursor: default; }
:host(.selection-card.selection-unavailable) .card-front {
  filter: grayscale(1) brightness(0.62);
  opacity: 0.52;
}
:host(.selection-card.selection-unavailable) .detail-ctrl { opacity: 0.72; }
.card-block.selected-general {
  box-shadow: inset 0 0 0 3px #e2b84b, 0 0 1rem rgba(226, 184, 75, 0.42);
}
.card-block.selected-general::after {
  content: attr(data-selection-label);
  position: absolute;
  top: 0.25rem;
  left: 50%;
  z-index: 6;
  transform: translateX(-50%);
  padding: 0.16rem 0.38rem;
  border-radius: 999px;
  color: #241800;
  background: #e2b84b;
  font-size: 0.62rem;
  font-weight: 800;
}
:host(.selection-card) .select-ctrl:disabled {
  color: #a9a18d;
  background: rgba(27, 25, 20, 0.78);
  cursor: default;
}
.general-detail {
  --kingdom-color: #b7ada0;
  box-sizing: border-box;
  width: min(44rem, calc(100vw - 3rem));
  max-height: min(38rem, calc(100vh - 3rem));
  padding: 0;
  overflow: hidden;
  border: 2px solid var(--kingdom-color);
  border-radius: 0.85rem;
  color: #f4ead2;
  background: #09251f;
  box-shadow: 0 1.5rem 5rem rgba(0,0,0,.7), 0 0 1.5rem color-mix(in srgb, var(--kingdom-color) 34%, transparent);
}
.general-detail.wei { --kingdom-color: #4a86e8; }
.general-detail.shu { --kingdom-color: #e44f43; }
.general-detail.wu { --kingdom-color: #2fbd68; }
.general-detail.qun { --kingdom-color: #b7ada0; }
.general-detail::backdrop { background: rgba(0, 12, 10, 0.74); backdrop-filter: blur(3px); }
.general-detail:not([open]) { display: none; }
.general-detail article { display: grid; grid-template-rows: auto minmax(0, 1fr); max-height: inherit; }
.general-detail header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0.85rem;
  border-bottom: 1px solid color-mix(in srgb, var(--kingdom-color) 55%, transparent);
  background: color-mix(in srgb, var(--kingdom-color) 14%, #09251f);
}
.detail-title { display: flex; align-items: baseline; gap: 0.55rem; }
.detail-title h3 { margin: 0; color: #fff5dc; font: 800 1.35rem Georgia, "STKaiti", serif; }
.detail-force {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  color: #fff;
  background: var(--kingdom-color);
  font-weight: 900;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--kingdom-color) 35%, transparent);
}
.detail-gender { color: #d8cda8; font-weight: 900; }
.detail-close {
  width: 2.2rem;
  height: 2.2rem;
  border: 1px solid rgba(232,207,139,.3);
  border-radius: 50%;
  color: #f4ead2;
  background: rgba(255,255,255,.07);
  font-size: 1.25rem;
  cursor: pointer;
}
.detail-body { display: grid; grid-template-columns: 14rem minmax(0, 1fr); min-height: 0; }
.detail-art { width: 100%; height: 100%; min-height: 25rem; object-fit: cover; object-position: center 18%; border-right: 2px solid var(--kingdom-color); }
.detail-content { min-width: 0; overflow: auto; padding: 1rem 1.15rem 1.25rem; }
.detail-content dl { display: flex; gap: 0.55rem; margin: 0 0 1rem; }
.detail-content dl > div {
  display: flex;
  gap: 0.35rem;
  padding: 0.35rem 0.55rem;
  border: 1px solid rgba(232,207,139,.2);
  border-radius: 0.4rem;
  background: rgba(255,255,255,.04);
  font-size: 0.76rem;
}
.detail-content dt { color: #aebeb6; }
.detail-content dd { margin: 0; color: #fff0c9; font-weight: 800; }
.detail-skills h4 { margin: 0 0 0.6rem; color: var(--kingdom-color); font-size: 0.9rem; }
.detail-skill-list { display: grid; gap: 0.65rem; }
.detail-skill-list p {
  margin: 0;
  padding: 0.7rem 0.8rem;
  border-left: 3px solid var(--kingdom-color);
  border-radius: 0.3rem;
  color: #e9e0ca;
  background: rgba(255,255,255,.045);
  font-size: 0.84rem;
  line-height: 1.6;
}
@media (max-width: 620px) {
  .info-line { padding: 0.1rem; font-size: 0.56rem; }
  .show-ctrl { width: 1.35rem; height: 1.35rem; padding: 0; }
  .select-ctrl { font-size: 0.55rem; padding: 0.18rem 0.28rem; }
  :host(.selection-card) { height: 11.3rem; }
  :host(.selection-card) .card-block { height: 9.5rem; }
  :host(.selection-card) .detail-ctrl { margin-top: 0.28rem; font-size: 0.62rem; }
  .general-detail { width: calc(100vw - 1rem); max-height: calc(100vh - 1rem); }
  .detail-body { grid-template-columns: 8rem minmax(0, 1fr); }
  .detail-art { min-height: 18rem; }
  .detail-content dl { flex-wrap: wrap; }
}
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./src/wc/css/sgPlayer.css":
/*!*********************************!*\
  !*** ./src/wc/css/sgPlayer.css ***!
  \*********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/noSourceMaps.js */ "./node_modules/css-loader/dist/runtime/noSourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `:host {
  display: block; width: auto; height: auto; min-width: 0; min-height: 0; overflow: visible;
  border: 2px solid rgba(226, 184, 75, 0.7); border-radius: 0.8rem; color: #f4ead2;
  background: linear-gradient(145deg, rgba(18, 63, 53, 0.98), rgba(7, 31, 26, 0.98));
  box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, 0.35), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}
:host(.current-player) { border-color: #e2b84b; box-shadow: 0 0 0 2px rgba(226, 184, 75, 0.15), 0 0.55rem 1.2rem rgba(0, 0, 0, 0.28); }
:host(.drag-target) { border-color: #ffe59a; box-shadow: 0 0 0 3px #e2b84b88, 0 0 22px #e2b84b66; background: #194f3c; }
.widget { position: relative; box-sizing: border-box; width: 100%; height: 100%; padding: 0.55rem; }
div[name="player-game-area"], .open-info { position: relative; width: 100%; height: 100%; min-width: 0; }
.open-info { overflow: visible; }
.general-slots { position: absolute; inset: 0 auto 0 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.35rem; width: 11rem; height: calc(100% - 3.15rem - 6px); overflow: hidden; border-radius: 0.5rem; }
.jiang-block { width: 100%; height: 100%; min-width: 0; overflow: hidden; border: 0; }

.player-info { position: absolute; top: 0; right: 0; left: 11.75rem; display: flex; align-items: center; gap: 0.3rem; height: 1.45rem; min-width: 0; padding-right: 2.65rem; overflow: hidden; border-bottom: 1px solid rgba(255, 255, 255, 0.08); font-size: 0.7rem; white-space: nowrap; }
.player-key { display: none; }
.player-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; font-weight: 800; }
.player-role, .player-role-marker { position: absolute; top: 0.08rem; right: 0; display: grid; place-items: center; max-width: 2.2rem; height: 1.25rem; overflow: hidden; padding: 0 0.42rem; border: 1px solid rgba(201, 210, 205, 0.35); border-radius: 999px; color: #c9d2cd; background: rgba(255, 255, 255, 0.04); white-space: nowrap; }
.player-role { display: none; }
.player-info { gap: 0; padding-right: 1.65rem; overflow: visible; border-bottom: 0; }
.player-info::after { content: ""; position: absolute; right: 0; bottom: -0.5rem; left: -0.3rem; height: 1px; background: linear-gradient(90deg, transparent, rgba(232,207,139,.34) 8%, rgba(232,207,139,.34) 92%, transparent); }
.player-role, .player-role-marker { width: 1.5rem; max-width: 1.5rem; height: 1.4rem; padding: 0; border-radius: 50%; font-size: 0.82rem; line-height: 1; font-weight: 800; }
:host(.current-player) .player-info::after { display: none; }
.player-role-marker { display: none; }
.player-role.role-lord, .player-role.role-renegade, :host(.current-player) .player-role { display: grid; }
.player-role.role-lord { color: #ffd7d0; border-color: #d96158; background: rgba(151, 43, 37, 0.58); }
.player-role.role-renegade { color: #d8e8ff; border-color: #5b8fdb; background: rgba(37, 79, 146, 0.62); }
.player-role.role-loyal { color: #ffe6a8; border-color: #d8ae4e; background: rgba(112, 78, 21, 0.62); }
.player-role.role-rebel { color: #cdf2d8; border-color: #57ad75; background: rgba(26, 88, 59, 0.65); }
.hp-holder { position: absolute; top: 2rem; right: 0; left: 11.75rem; display: flex; align-items: center; height: 1.5rem; min-width: 0; }

.decks { position: absolute; inset: 0; display: grid; grid-template-columns: 11rem minmax(0, 1fr); grid-template-rows: 4.35rem repeat(3, minmax(0, 1fr)); gap: 0.3rem 0.45rem; min-width: 0; min-height: 0; pointer-events: none; }
.decks > * { pointer-events: auto; }
.decks .zhuang-area { grid-column: 1; grid-row: 1 / 5; align-self: end; width: 11rem; height: 3.15rem; min-width: 0; overflow: visible; z-index: 3; }
.hand-count { grid-column: 2; grid-row: 2; }
.area1-count { grid-column: 2; grid-row: 3; }
.area2-count { grid-column: 2; grid-row: 4; }
.hand-count, .area1-count, .area2-count { display: grid; place-items: center; min-width: 0; border: 1px solid rgba(232, 207, 139, 0.22); border-radius: 0.38rem; color: #f4ead2; background: rgba(255, 255, 255, 0.04); cursor: pointer; }
.hand-count > span, .area1-count > span, .area2-count > span { display: grid; grid-template-columns: 1fr 1.4rem; align-items: center; width: 100%; padding: 0 0.35rem; font-size: 0.68rem; font-weight: 800; }
.hand-count > span::before { content: "手牌"; }
.area1-count > span::before { content: "区1"; }
.area2-count > span::before { content: "区2"; }
.jiang-pick { display: none; }
.pai-info { display: none; }

div[name="addtional-area"] { display: contents; }
.debuff-area { position: absolute; top: 0.5rem; left: calc(100% + 0.45rem); z-index: 12; display: flex; flex-direction: column; gap: 0.25rem; width: 2.65rem; }
.debuff { display: none; place-items: center; width: 2.65rem; height: 1.2rem; border: 1px solid #68b88f; border-radius: 0.3rem; color: #eafff2; background: linear-gradient(145deg, #34765d, #174b3b); box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35); font-size: 0.62rem; font-weight: 800; pointer-events: none; }
.debuff.on { display: grid; }
.debuff-0 { color: #f5eaff; border-color: #ae86d2; background: linear-gradient(145deg, #79529a, #4b3066); }
.judgment-area { position: absolute; top: 3.5rem; left: calc(100% + 0.45rem); z-index: 10; display: none; width: 2.65rem; }
.judgment-area:has(.pan-area.has-cards) { display: block; }
.judgment-area::before { content: ""; position: absolute; top: 0; bottom: 0; left: -0.3rem; width: 1px; background: linear-gradient(transparent, rgba(232, 207, 139, 0.38) 8%, rgba(232, 207, 139, 0.38) 92%, transparent); }
.judgment-area .pan-area { display: block; width: 100%; height: auto; min-width: 0; overflow: visible; background: transparent; }
.judgment-area .pan-area::part(wrapper) { height: auto; overflow: visible; border: 0; background: transparent; }
.judgment-area .pan-area::part(card-area) { display: flex; flex-direction: column; align-items: stretch; gap: 0.38rem; width: 100%; height: auto; min-height: 0; padding: 0; overflow: visible; }

.player-toolbar { display: none; }
.drop-picker { width: min(22rem, calc(100vw - 2rem)); padding: 1.1rem; border: 1px solid #c7a75a; border-radius: 0.8rem; color: #f4ead2; background: #0b3027; box-shadow: 0 1rem 3rem #0008; }
.drop-picker:not([open]) { display: none; }
.drop-picker::backdrop { background: #001b16aa; }
.drop-picker h3 { margin: 0 0 0.5rem; color: #f0cc73; }
.drop-summary { margin: 0 0 1rem; overflow-wrap: anywhere; font-size: 0.85rem; line-height: 1.5; }
.drop-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; }
.drop-options[hidden], .judgment-options[hidden] { display: none; }
.judgment-options { margin-top: 0.8rem; padding-top: 0.65rem; border-top: 1px solid #e8cf8b33; }
.judgment-label { margin: 0 0 0.5rem; color: #e8cf8b; }
.judgment-summary { margin: 0 0 0.5rem; color: #aec3b9; font-size: 0.8rem; }
.judgment-summary:empty { display: none; }
.drop-picker button { min-height: 2.6rem; padding: 0.4rem; border: 1px solid #e8cf8b55; border-radius: 0.45rem; color: #f4ead2; background: #ffffff0c; cursor: pointer; }
.drop-picker button:hover, .drop-picker button:focus-visible { outline: 2px solid #e2b84b; outline-offset: 1px; background: #e2b84b25; }
.drop-picker button:disabled { opacity: 0.5; cursor: wait; }
.drop-cancel { width: 100%; margin-top: 0.65rem; }
.drop-error { margin: 0.65rem 0 0; color: #ffb0aa; font-size: 0.8rem; }
.drop-error:empty { display: none; }
div[name="drag-on-view"] { display: none; }
div[name="drag-on-view"].drag-over { position: absolute; inset: 10%; z-index: 50; display: grid; grid-template-rows: repeat(5, 1fr); gap: 0.25rem; padding: 0.5rem; border: 2px solid #e2b84b; border-radius: 0.65rem; background: rgba(8, 43, 36, 0.94); }
div[name="drag-on-view"].drag-over div { display: grid; place-items: center; border: 1px dashed rgba(255, 232, 167, 0.72); border-radius: 0.35rem; }

:host(.current-player) .player-info { left: 11.45rem; height: 1.85rem; padding: 0 9.75rem 0 0.5rem; }
:host(.current-player) .hp-holder { top: 0.2rem; right: 2.9rem; left: auto; z-index: 4; width: 6.4rem; height: 1.45rem; }
:host(.current-player) .decks { display: none; }
:host(.current-player) .general-slots { width: 11rem; }
:host(.current-player) div[name="player-game-area"] > .zhuang-area { position: absolute; bottom: 0; left: 0; width: 11rem; height: 3.15rem; min-width: 0; overflow: visible; z-index: 3; border-radius: 0.35rem; }
:host(.current-player) .pai-info { position: absolute; top: 3.35rem; right: 0; bottom: 0; left: 11.45rem; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-template-rows: 4.75rem minmax(0, 1fr); gap: 0.32rem; min-width: 0; min-height: 0; overflow: hidden; }
:host(.current-player) .hand-area { position: relative; grid-column: 1 / 3; grid-row: 1; min-width: 0; min-height: 0; border: 1px solid rgba(232, 207, 139, 0.2); border-radius: 0.45rem; background: rgba(3, 27, 22, 0.5); }
:host(.current-player) .other1-area, :host(.current-player) .other2-area { position: relative; min-width: 0; min-height: 0; border: 1px solid rgba(232, 207, 139, 0.2); border-radius: 0.45rem; background: rgba(3, 27, 22, 0.5); }
:host(.current-player) .other1-area { grid-column: 1; grid-row: 2; }
:host(.current-player) .other2-area { grid-column: 2; grid-row: 2; }
:host(.current-player) .hand-area::before, :host(.current-player) .other1-area::before, :host(.current-player) .other2-area::before { position: absolute; top: 50%; left: 0.4rem; z-index: 2; transform: translateY(-50%); color: #d9c991; font-size: 0.65rem; font-weight: 800; pointer-events: none; }
:host(.current-player) .hand-area::before { content: "手牌 " attr(data-count); }
:host(.current-player) .other1-area::before { content: "区1 " attr(data-count); }
:host(.current-player) .other2-area::before { content: "区2 " attr(data-count); }
:host(.current-player) .hand-area::part(wrapper), :host(.current-player) .other1-area::part(wrapper), :host(.current-player) .other2-area::part(wrapper) { border: 0; }
:host(.current-player) .hand-area::part(card-area), :host(.current-player) .other1-area::part(card-area), :host(.current-player) .other2-area::part(card-area) { height: 100%; padding: 0.75rem 0.3rem 0.3rem 3.45rem; overflow-x: auto; overflow-y: hidden; }
.area-panel-heading, .area-panel-actions { display: none; }
:host(.current-player) .overflow-controls::before { display: none; }
.pai-info:popover-open { position: fixed; inset: 0; margin: auto; display: flex; flex-direction: column; gap: 0.75rem; width: min(38rem, calc(100vw - 2rem)); height: max-content; max-height: calc(100vh - 2rem); padding: 1rem; overflow: auto; border: 1px solid #c7a75a; border-radius: 0.8rem; color: #f4ead2; background: #0b3027; box-shadow: 0 1rem 4rem #0009; }
.pai-info:popover-open .area-panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.pai-info:popover-open .area-panel-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.pai-info:popover-open button { min-height: 2rem; padding: 0.3rem 0.65rem; border: 1px solid #e8cf8b55; border-radius: 0.4rem; color: #f4ead2; background: #ffffff0c; cursor: pointer; }
.pai-info:popover-open > sg-area { display: block; flex: none; width: 100%; height: 8rem; }
.pai-info:popover-open > sg-area::part(card-area) { height: 100%; padding: 0.85rem 0.4rem 0.4rem; align-items: stretch; }
.pai-info:popover-open > sg-area:not(.has-cards)::after { content: "暂无卡牌"; position: absolute; inset: 0; display: grid; place-items: center; color: #aebeb6; pointer-events: none; }
.pai-info:popover-open > sg-area { position: relative; }
:host(.current-player) .player-toolbar { position: absolute; top: 0.55rem; bottom: 0.55rem; left: -4.6rem; z-index: 15; display: flex; flex-direction: column; gap: 0.25rem; width: 4rem; padding: 0.38rem; border: 1px solid rgba(232, 207, 139, 0.27); border-radius: 0.7rem; background: linear-gradient(180deg, rgba(12, 50, 42, 0.98), rgba(5, 28, 24, 0.98)); box-shadow: 0 0.9rem 2rem rgba(0, 0, 0, 0.3); }
.player-toolbar button { display: grid; place-items: center; width: 100%; height: 1.75rem; padding: 0; border: 1px solid rgba(232, 207, 139, 0.32); border-radius: 0.42rem; color: #e8eee9; background: rgba(255, 255, 255, 0.065); font-size: 0.68rem; font-weight: 800; cursor: pointer; }
.player-toolbar button:hover, .player-toolbar button.active { color: #192019; border-color: #e2b84b; background: #e2b84b; }
.player-toolbar .tool-separator { width: 100%; height: 1px; margin: 0.06rem 0; background: linear-gradient(90deg, transparent, rgba(232, 207, 139, 0.55), transparent); }
.hp-controls { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; }
.hp-controls svg { display: block; width: 14px; height: 14px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; }
.player-toolbar button:focus-visible { outline: 2px solid #e2b84b; outline-offset: 2px; }
@media (min-width: 901px) {
  :host(.current-player) .widget { padding-right: 7.05rem; }
  :host(.current-player) .player-info { padding-right: 2.75rem; }
  :host(.current-player) .hp-holder { top: .2rem; right: -6.5rem; width: 5.25rem; justify-content: center; }
  :host(.current-player) .player-toolbar { left: auto; right: .55rem; width: 6.06rem; padding: 2.2rem 0 0 .75rem; gap: .375rem; border: 0; border-left: 1px solid #e8cf8b38; border-radius: 0; background: transparent; box-shadow: none; }
  :host(.current-player) .player-toolbar button { flex-shrink: 0; border-color: #e8cf8b2e; background: #ffffff06; }
  :host(.current-player) .player-toolbar button:hover { background: #ffffff14; color: #f4ead2; }
  :host(.current-player) .player-toolbar [data-debuff="0"].active { color: #f5eaff; border-color: #ae86d2; background: #654483; }
  :host(.current-player) .player-toolbar [data-debuff="1"].active { color: #eafff2; border-color: #68b88f; background: #276148; }
}
:host(.current-player) .hand-count, :host(.current-player) .area1-count, :host(.current-player) .area2-count { display: none; }

:host(:has(.general-selection-dialog:not(.hide))) { z-index: 201 !important; }
.general-selection-dialog { position: fixed; inset: 50% auto auto 50%; transform: translate(-50%, -50%); box-sizing: border-box; width: min(63rem, calc(100vw - 2rem)); max-height: calc(100dvh - 2rem); overflow: auto; z-index: 200; display: grid; grid-template-rows: auto auto auto; min-width: 0; min-height: 0; padding: 0.85rem; border: 1px solid rgba(226, 184, 75, 0.65); border-radius: 0.85rem; background: rgba(5, 29, 25, 0.98); box-shadow: 0 1.2rem 4rem rgba(0, 0, 0, 0.6); }
.general-selection-dialog > header { display: flex; align-items: center; gap: 0.7rem; padding: 0.15rem 0.15rem 0.65rem; }
.general-selection-dialog > header strong { color: #f0cc73; font: 800 1rem Georgia, "STKaiti", serif; }
.general-selection-dialog > header span { min-width: 0; color: #aebeb6; font-size: 0.72rem; }
.general-selection-dialog > header button { margin-left: 0; min-height: 2.2rem; padding: 0.35rem 0.7rem; border: 1px solid rgba(232, 207, 139, 0.3); border-radius: 0.45rem; color: #f4ead2; background: rgba(255, 255, 255, 0.07); cursor: pointer; }
.general-selection-dialog > header button { margin-left: auto; }
.general-selection-dialog > footer { display: flex; align-items: center; gap: 0.7rem; margin-top: 0.6rem; padding: 0.75rem 0.15rem 0.15rem; border-top: 1px solid rgba(232,207,139,.18); }
.selection-status { flex: 1; color: #d8e0db; font-size: 0.78rem; }
.general-selection-dialog .selection-lock { min-height: 2.2rem; padding: 0.35rem 0.7rem; color: #241800; border: 1px solid #e2b84b; border-radius: 0.45rem; background: linear-gradient(#edc55f, #c88a2d); font-weight: 800; cursor: pointer; }
.general-selection-dialog .selection-lock:disabled { color: #8f8a79; border-color: rgba(232, 207, 139, 0.16); background: rgba(255, 255, 255, 0.05); cursor: default; }
.general-selection-dialog.selection-locked > header strong::after { content: " · 已锁定"; color: #aebeb6; font: 500 0.68rem Inter, "Microsoft YaHei", sans-serif; }
.general-selection { display: block; min-width: 0; min-height: 0; overflow: hidden; border-radius: 0.55rem; background: rgba(2, 19, 16, 0.72); }
.general-selection::part(wrapper) { border: 0; }
.general-selection::part(card-area) { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); align-content: start; gap: 0.55rem; height: auto; padding: 0.65rem; overflow: auto; }

@media (max-width: 900px) {
  :host(.current-player) .player-toolbar { display: none; }
  :host(.current-player) .player-info { left: 0; }
  :host(.current-player) .general-slots { width: 11rem; }
  :host(.current-player) .pai-info { left: 11.45rem; }
}
@media (max-width: 620px) {
  .widget { padding: 0.4rem; }
  :host(.current-player) .general-slots { width: 9.5rem; }
  :host(.current-player) div[name="player-game-area"] > .zhuang-area { width: 9.5rem; }
  :host(.current-player) .player-info { left: 9.85rem; }
  :host(.current-player) .pai-info { left: 9.85rem; grid-template-rows: 4.4rem minmax(0, 1fr); }
  .general-selection-dialog { width: calc(100vw - 0.8rem); padding: 0.45rem; }
  .general-selection-dialog > header span { display: none; }
  .general-selection::part(card-area) { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.4rem; padding: 0.45rem; }
}

@media (min-width:621px) and (max-width:950px) { .general-selection-dialog { width: min(39rem, calc(100vw - 2rem)); } .general-selection::part(card-area) { grid-template-columns: repeat(4,minmax(0,1fr)); } }
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./src/wc/css/sgTable.css":
/*!********************************!*\
  !*** ./src/wc/css/sgTable.css ***!
  \********************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/noSourceMaps.js */ "./node_modules/css-loader/dist/runtime/noSourceMaps.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../../node_modules/css-loader/dist/runtime/api.js */ "./node_modules/css-loader/dist/runtime/api.js");
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `:host {
  --table: #0c4a3d; --table-dark: #082b25; --panel: rgba(12, 43, 37, 0.96);
  --line: rgba(232, 207, 139, 0.24); --gold: #e2b84b; --text: #f4ead2; --muted: #aebeb6;
  display: block; min-height: 100vh; overflow: auto; color: var(--text);
  background: radial-gradient(circle at 50% 42%, rgba(54, 124, 95, 0.45), transparent 45%), linear-gradient(145deg, #103f35, #061c18);
  font-family: Inter, "Microsoft YaHei", sans-serif;
}
.card-transfer-layer{position:fixed;inset:0;z-index:220;overflow:hidden;pointer-events:none}.card-transfer-group,.card-transfer-group>svg{position:absolute;inset:0;width:100%;height:100%}.card-transfer-group>svg path{fill:none;stroke:#e7c67b;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}.card-transfer-card{position:absolute;top:0;left:0;display:grid;place-items:center;width:2rem;height:2.75rem;border:1px solid #e6cd87;border-radius:.25rem;color:#f1d796;background:repeating-linear-gradient(45deg,#315247 0 3px,#254137 3px 6px);box-shadow:0 .3rem .75rem #0008;font:700 .88rem Georgia,serif;will-change:transform,opacity}.card-transfer-label{position:absolute;transform:translate(-50%,-50%);color:#ffdf99;font-size:.7rem;white-space:nowrap;text-shadow:0 1px .4rem #071c13}
@media(prefers-reduced-motion:reduce){.card-transfer-card{display:none}}
.topbar { position: sticky; top: 0; left: 0; z-index: 30; display: flex; align-items: center; gap: 14px; height: 54px; padding: 0 18px; border-bottom: 1px solid var(--line); background: rgba(5,18,16,.94); backdrop-filter: blur(12px); white-space: nowrap; }
.seal { display: grid; place-items: center; flex: none; width: 32px; height: 32px; background: #8f302a; border: 1px solid #d76859; font: 700 18px Georgia, serif; }
.brand { font: 700 16px Georgia, "STKaiti", serif; letter-spacing: .12em; }
.room, .seat-label { color: var(--muted); font-size: 12px; }
.seat-label { color: #f0cc73; }
.mode { margin-left: auto; display: flex; align-items: center; gap: 8px; color: #d8e0db; font-size: 12px; }
.live-dot { width: 7px; height: 7px; border-radius: 50%; background: #71c18f; box-shadow: 0 0 0 4px rgba(113,193,143,.12); }
.top-btn { border: 1px solid var(--line); border-radius: 8px; padding: 7px 10px; color: var(--text); background: rgba(255,255,255,.06); cursor: pointer; }
.table-help { width: min(28rem, calc(100vw - 2rem)); padding: 1.2rem; border: 1px solid #c7a75a; border-radius: .8rem; color: #f4ead2; background: #0b3027; line-height: 1.6; }
.table-help:not([open]) { display: none; }
.table-help::backdrop { background: #001b16aa; }
.move-player-picker{width:min(28rem,calc(100vw - 1.5rem));padding:1.1rem;border:1px solid #c7a75a;border-radius:.8rem;color:var(--text);background:#0b3027;box-shadow:0 1rem 3rem #0008}.move-player-picker:not([open]){display:none}.move-player-picker::backdrop{background:#001b16bb}.move-player-picker>header{display:flex;align-items:center;justify-content:space-between;gap:1rem}.move-player-picker h3{margin:0;color:#f0cc73}.move-player-picker>header button{border:0;color:#aebeb6;background:transparent;cursor:pointer}.move-summary{color:#aebeb6;font-size:.75rem}.move-player-options{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.55rem}.move-player-options button{display:flex;align-items:center;justify-content:space-between;min-height:3rem;padding:.55rem .75rem;border:1px solid var(--line);border-radius:.5rem;color:var(--text);background:#ffffff0b;cursor:pointer}.move-player-options button:hover,.move-player-options button:focus-visible{outline:2px solid var(--gold);outline-offset:1px;background:#e2b84b20}.move-player-options small{color:#9fb6aa}
@media (max-width: 700px) { .topbar { gap: 8px; padding: 0 10px; flex-wrap: wrap; height: auto; min-height: 54px; padding-block: 6px; } .brand { font-size: 13px; } .mode { display: none; } .topbar .top-btn { margin-left: auto; } }
@media (max-width: 440px) { .move-player-options{grid-template-columns:1fr} }
.table-container {
  position: relative; box-sizing: border-box; width: 90rem; height: 51.56rem; min-height: 51.56rem;
  margin: 12px auto 0; overflow: hidden; border: 1px solid rgba(226, 184, 75, 0.28); border-radius: 0.9rem;
  background: linear-gradient(145deg, rgba(18, 67, 56, 0.42), rgba(5, 28, 24, 0.7)); box-shadow: inset 0 0 5rem rgba(0, 0, 0, 0.25);
}
.table-container::before { content: "SANGO"; position: absolute; inset: 42% 0 auto; color: rgba(240, 204, 115, 0.045); font: 900 5.25rem Georgia, serif; letter-spacing: 0.2em; text-align: center; pointer-events: none; }
sg-player { min-width: 0; min-height: 0; }

/* Keep all seats reachable before the local player has selected one. */
.opponent-rail { position: absolute; top: 1.25rem; right: 1.25rem; left: 1.25rem; z-index: 2; display: flex; gap: 0.75rem; min-width: 0; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: thin; }
.opponent-rail sg-player { flex: 0 0 17.94rem; width: 17.94rem; height: 14.38rem; scroll-snap-align: start; }

/* Plan D: local, four opponents across the top, then one on the right. */
:host(.player-seated) .opponent-rail { display: contents; }
:host(.player-seated) sg-player { position: absolute; z-index: 2; width: 17.94rem; height: 14.38rem; }
:host(.player-seated) sg-player.general-selection-open { z-index: 201; }
:host(.player-seated) .slot0 { top: 35.625rem; left: 1.25rem; width: 57.75rem; height: 14.38rem; }
:host(.player-seated) .slot1 { top: 1.25rem; left: 1.25rem; }
:host(.player-seated) .slot2 { top: 1.25rem; left: 23.4375rem; }
:host(.player-seated) .slot3 { top: 1.25rem; left: 45.625rem; }
:host(.player-seated) .slot4 { top: 1.25rem; left: 67.75rem; }
:host(.player-seated) .slot5 { top: 17.94rem; left: 67.75rem; }

.table-public {
  position: absolute; top: 17.9375rem; left: 1.25rem; z-index: 1; display: grid;
  grid-template-columns: 13.75rem minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); gap: 0.9rem;
  width: 63.75rem; height: 15.625rem; min-width: 0; min-height: 0; padding: 0.55rem;
  border: 1px solid var(--line); border-radius: 0.8rem; background: rgba(4, 29, 24, 0.7);
  box-shadow: inset 0 0 3rem rgba(0, 0, 0, 0.16), 0 0.55rem 1.4rem rgba(0, 0, 0, 0.22);
}
.table-public:has(.draw-options:not([hidden])) { z-index: 20; }
.public-deck-panel,.public-discard-panel{display:grid;grid-template-rows:1.75rem minmax(0,1fr);min-width:0;min-height:0}
.public-deck-panel{grid-template-rows:1.75rem 4.4rem minmax(0,1fr);gap:.4rem;padding-right:.9rem;border-right:1px solid rgba(232,207,139,.14)}
.public-deck-panel>header,.public-discard-panel>header{display:flex;align-items:center;gap:.6rem;min-width:0;color:#d8cda8}
.public-deck-panel>header strong,.public-discard-panel>header strong{font-size:.84rem}.public-deck-panel>header small,.public-discard-panel>header small{color:#91aea0;font-size:.7rem}
.public-deck-summary{display:flex;align-items:center;justify-content:center;gap:1rem}.public-deck-summary>div:last-child,.discard-summary-main>div:last-child{display:flex;flex-direction:column;gap:.2rem}.public-deck-summary small,.discard-summary small{color:#9fb6aa;font-size:.65rem}
.public-card-back,.discard-icon{display:grid;place-items:center;width:2.75rem;height:3.63rem;border:1px solid #b89857;border-radius:.32rem;box-shadow:3px 3px #102820,4px 4px #8c794d}.public-card-back{background:repeating-linear-gradient(45deg,#70342e,#70342e 4px,#803b33 4px,#803b33 8px)}.discard-icon{color:#d8c69a;background:#254739;font:700 .78rem Georgia,serif}
.public-deck-count,.discard-count{color:#efdcb0;font:2rem/1 Georgia,serif}
.public-deck-actions{display:grid;grid-template-columns:1.08fr 1fr;grid-template-rows:1.88rem 1.38rem;gap:.3rem .42rem;align-content:end;min-width:0}
.public-deck-actions button,.recent-discard-card button,.discard-grid-item button,.public-dialog button{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;height:1.88rem;padding:0 .45rem;border:1px solid var(--line);border-radius:.38rem;color:var(--text);background:#ffffff0b;font:inherit;font-size:.68rem;cursor:pointer;white-space:nowrap}
.public-deck-actions button:disabled,.recent-discard-card button:disabled,.discard-grid-item button:disabled,.public-dialog button:disabled{opacity:.4;cursor:default}
.public-deck-actions button.primary,.public-dialog button.primary{border-color:#e2b84b;background:#e2b84b;color:#291f13;font-weight:800}
.public-draw-split{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 1.6rem;min-width:0}.public-draw-split>button:first-child{border-radius:.38rem 0 0 .38rem}.public-draw-split>.draw-toggle{width:1.6rem;padding:0;border-left-color:#72542055;border-radius:0 .38rem .38rem 0}
.draw-options{position:absolute;top:calc(100% + .3rem);left:0;z-index:120;display:grid;width:100%;gap:.15rem;padding:.3rem;border:1px solid #b79952;border-radius:.45rem;background:#10392f;box-shadow:0 .5rem 1.4rem #0008}.draw-options[hidden]{display:none}.draw-options button{justify-content:flex-start;width:100%;border-color:transparent;background:transparent}
.public-deck-actions>.text-action,.discard-summary>.text-action{height:1.38rem;padding:0;border:0;border-radius:.38rem;background:transparent;color:#9fb6aa;font-size:.68rem;font-weight:500}.public-deck-actions>.text-action{grid-column:1/-1}.public-deck-actions>.text-action:hover:not(:disabled),.discard-summary>.text-action:hover:not(:disabled){color:#f0cc73;background:#ffffff08}.public-deck-actions>.shuffle-empty{grid-column:1/-1;width:100%}.public-deck-actions>[hidden],.public-draw-split[hidden]{display:none!important}
.public-discard-body{display:grid;grid-template-columns:minmax(0,1fr) 9.6rem;gap:.85rem;min-width:0;min-height:0}.recent-discard-list{display:flex;align-items:center;min-width:0;min-height:0;padding:.25rem 1.6rem .4rem .15rem;overflow-x:auto;overflow-y:hidden;scrollbar-width:none}.recent-discard-list::-webkit-scrollbar{display:none}
.recent-discard-card{position:relative;display:grid;grid-template-rows:6.125rem 1.35rem;justify-items:center;flex:0 0 5.25rem;width:5.25rem}.recent-discard-card+ .recent-discard-card{margin-left:-1.25rem}.discard-action-indicator{position:absolute;z-index:2;top:5.72rem;left:50%;max-width:4.6rem;padding:.1rem .4rem;overflow:hidden;transform:translateX(-50%);border:1px solid #b89857;border-radius:.22rem;color:#76623e;background:linear-gradient(145deg,#f4dfab,#cfaf68);box-shadow:0 .12rem .25rem #061c1855;font-size:.56rem;line-height:1;white-space:nowrap;text-overflow:ellipsis;pointer-events:none}
.recent-discard-list{gap:.4rem;padding:.25rem .25rem .4rem;box-sizing:border-box}
.recent-discard-card+ .recent-discard-card{margin-left:0}
.text-action,.recent-discard-card>.text-action,.discard-grid-item>.text-action{height:1.35rem;padding:0;border:0;background:transparent;color:#9fb6aa}.recent-discard-card>.text-action:hover:not(:disabled),.discard-grid-item>.text-action:hover:not(:disabled){color:#f0cc73;background:#ffffff08}
.discard-summary{display:grid;grid-template-rows:minmax(0,1fr) 1.38rem;gap:.45rem;padding-left:.85rem;border-left:1px solid rgba(232,207,139,.14)}.discard-summary-main{display:flex;align-items:flex-start;justify-content:center;gap:.75rem;padding-top:.385rem}.discard-summary>.text-action{width:100%}
.public-empty{display:grid;place-content:center;flex:1;min-height:7rem;color:#718f82;text-align:center;line-height:1.8}.public-empty b{font-weight:500}.public-empty small{font-size:.68rem}
.public-dialog{width:min(66rem,94vw);max-height:85vh;padding:1.3rem;border:1px solid #b79952;border-radius:.8rem;color:var(--text);background:#0c3027;box-shadow:0 1.5rem 6rem #0009}.public-dialog::backdrop{background:#001510b8}.public-dialog>header{display:flex;align-items:center;justify-content:space-between;gap:1rem}.public-dialog h2{margin:0;color:#efd18b;font-size:1.2rem}.public-dialog>p{color:#9fb6aa;font-size:.75rem}.discard-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(4.15rem,1fr));gap:.75rem .5rem;max-height:60vh;padding:.75rem;overflow-y:auto;border:1px solid #ffffff18;border-radius:.5rem;background:#0002}.discard-grid-item{display:grid;justify-items:center;gap:.3rem}.discard-grid-item>.text-action{width:3.9rem}
.deck-sort-lanes{display:grid;grid-template-columns:repeat(3,minmax(15.5rem,1fr));gap:.75rem;overflow-x:auto}.sort-lane{max-height:43vh;min-height:11rem;padding:.75rem;overflow-y:auto;border:1px solid #ffffff18;border-radius:.5rem;background:#0002}.sort-lane h3{position:sticky;top:-.75rem;z-index:1;margin:0 0 .5rem;padding:.45rem 0;color:#e6ce8c;background:#0b3027;font-size:.78rem}.sort-row{display:flex;align-items:center;gap:.5rem;min-height:3.65rem;padding:.25rem 0;border-bottom:1px solid #ffffff10}.sort-public-tile{flex:0 0 2.56rem;width:2.56rem;height:3.15rem;pointer-events:none}.sort-row-actions{display:flex;align-items:center;gap:.2rem;min-width:0}.sort-row-actions button{min-width:1.85rem;height:1.6rem;padding:0 .3rem;font-size:.62rem}.public-dialog .privacy{display:inline-block;padding:.2rem .45rem;border-radius:.25rem;color:#c1b2e8;background:#8871b222}.public-dialog .muted{color:#9fb6aa;font-size:.72rem}.public-dialog>footer{display:flex;align-items:center;gap:.55rem;margin-top:1rem}.public-dialog>footer>span{flex:1}
.round-menu, .card-menu { display: flex; flex-direction: column; gap: 0.38rem; min-width: 0; padding: 0.4rem; border: 1px solid var(--line); border-radius: 0.65rem; background: rgba(4, 26, 22, 0.74); }
.public-tools { position: relative; flex: none; }
.public-tools summary { padding: 7px 12px; border: 1px solid var(--line); border-radius: 8px; background: #ffffff0f; font-size: 12px; cursor: pointer; }
.public-tools[open] summary { border-color: var(--gold); color: var(--gold); }
.public-tools .round-menu { position: absolute; top: calc(100% + 8px); right: 0; width: 150px; background: #0b3027; box-shadow: 0 10px 24px #0007; }
  .public-tools .round-menu button { min-height: 34px; justify-items: start; padding-inline: 12px; }
.public-tools .round-menu .clear-table { color: #edaaa2; border-color: #d05d4e6b; }
.card-menu { position: absolute; top: 0; right: 0; left: 0; height: 1.8rem; flex-direction: row; align-items: center; flex-wrap: nowrap; gap: 0.25rem; padding: 2px 5px; overflow-x: auto; overflow-y: hidden; z-index: 3; border-color: rgba(226, 184, 75, 0.65); border-radius: 0.55rem 0.55rem 0 0; background: #103a2f; box-shadow: 0 2px 5px #0004; }
.selection-label { flex: none; margin-right: auto; color: #f0cc73; font-size: 0.72rem; white-space: nowrap; }
.card-menu button { min-width: 2.2rem; }
.round-menu button, .round-menu span, .card-menu button { box-sizing: border-box; display: grid; place-items: center; min-height: 1.6rem; padding: 0.2rem; border: 1px solid var(--line); border-radius: 0.45rem; color: var(--text); background: rgba(255, 255, 255, 0.06); font-size: 0.68rem; cursor: pointer; }
.round-menu button:hover, .round-menu span:hover, .card-menu button:hover { border-color: var(--gold); background: rgba(226, 184, 75, 0.16); }
.round-menu span { margin-top: auto; color: #edaaa2; border-color: rgba(208, 93, 78, 0.42); }
.card-menu.hide { display: none; }
.card-menu button { flex: none; min-height: 1.3rem; height: 1.3rem; padding: 0 0.35rem; white-space: nowrap; }

@media (max-width: 900px) {
  :host { min-height: 100%; }
  .table-container { display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: 14.5rem auto auto; gap: 0.5rem; width: 100%; height: auto; min-height: 100vh; padding: 0.5rem; overflow: visible; }
  .table-container::before { display: none; }
  .opponent-rail, :host(.player-seated) .opponent-rail { position: static; grid-area: 1 / 1; display: flex; gap: 0.5rem; overflow-x: auto; scroll-snap-type: x mandatory; }
  .opponent-rail sg-player, :host(.player-seated) .opponent-rail sg-player { position: relative; inset: auto; flex: 0 0 17.94rem; width: 17.94rem; height: 14.38rem; scroll-snap-align: center; }
  .table-public { position: static; grid-area: 2 / 1; width: 100%; height: auto; min-height: 19rem; }
  :host(.player-seated) .slot0 { position: relative; inset: auto; grid-area: 3 / 1; width: 100%; height: 20rem; }
}
@media (max-width: 620px) {
  .table-container { grid-template-rows: 14.5rem auto auto; gap: 0.4rem; padding: 0.4rem; }
  .table-public { grid-template-columns: minmax(0, 1fr); grid-template-rows: 13rem auto; min-height: 22rem; }
  .table-public{grid-template-columns:1fr;grid-template-rows:auto auto}.public-deck-panel{grid-row:1;padding:0 0 .7rem;border:0;border-bottom:1px solid rgba(232,207,139,.14)}.public-discard-panel{grid-row:2;min-height:12rem}.public-discard-body{grid-template-columns:minmax(0,1fr) 7.8rem}.deck-sort-lanes{grid-template-columns:repeat(3,minmax(15.5rem,1fr))}
  :host(.player-seated) .slot0 { position: sticky; bottom: 0; min-height: 24rem; z-index: 10; }
}

    .action-log{position:absolute;left:1084px;top:554px;width:17.94rem;height:246px;z-index:2;display:flex;flex-direction:column;overflow:hidden;border:1px solid rgba(232,207,139,.32);border-radius:12px;background:linear-gradient(145deg,#10392f,#071f1a);box-shadow:0 12px 30px #0005}
    .log-header{display:flex;align-items:center;gap:7px;min-height:38px;padding:0 10px;border-bottom:1px solid var(--line)}.log-header strong{font-size:13px;color:#efd18b}.log-header small{color:var(--muted);font-size:10px}.log-header button{margin-left:auto;width:26px;height:24px;border:1px solid var(--line);border-radius:5px;background:#ffffff08;color:var(--text);cursor:pointer}.log-list{flex:1;min-height:0;overflow-y:auto;list-style:none;margin:0;padding:4px 10px;scrollbar-width:thin;scrollbar-color:#587568 transparent}.log-entry{display:grid;grid-template-columns:43px 1fr;gap:6px;padding:7px 0;border-bottom:1px solid #ffffff0b;font-size:11px;line-height:1.5}.log-entry time{color:#8fa99d;font:10px/1.65 Consolas,monospace}.log-entry b{color:#edd69b;font-weight:700}.log-entry p{margin:0;color:#d7e3db;overflow-wrap:anywhere}.log-entry .log-state{color:#c3a0e5}.log-footer{display:flex;align-items:center;gap:6px;padding:6px 9px;border-top:1px solid var(--line)}.log-footer span{margin-left:auto;color:var(--muted);font-size:10px}.action-log.collapsed{height:38px;top:762px}.action-log.collapsed .log-list,.action-log.collapsed .log-footer{display:none}
@media(max-width:900px){.action-log,.action-log.collapsed{position:relative;inset:auto;grid-area:4 / 1;width:100%;height:246px}.action-log.collapsed{height:38px}}
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/api.js":
/*!*****************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/api.js ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/getUrl.js":
/*!********************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/getUrl.js ***!
  \********************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (url, options) {
  if (!options) {
    options = {};
  }
  if (!url) {
    return url;
  }
  url = String(url.__esModule ? url.default : url);

  // If url is already wrapped in quotes, remove them
  if (/^['"].*['"]$/.test(url)) {
    url = url.slice(1, -1);
  }
  if (options.hash) {
    url += options.hash;
  }

  // Should url be wrapped?
  // See https://drafts.csswg.org/css-values-3/#urls
  if (/["'() \t\n]|(%20)/.test(url) || options.needQuotes) {
    return "\"".concat(url.replace(/"/g, '\\"').replace(/\n/g, "\\n"), "\"");
  }
  return url;
};

/***/ }),

/***/ "./node_modules/css-loader/dist/runtime/noSourceMaps.js":
/*!**************************************************************!*\
  !*** ./node_modules/css-loader/dist/runtime/noSourceMaps.js ***!
  \**************************************************************/
/***/ ((module) => {

"use strict";


module.exports = function (i) {
  return i[1];
};

/***/ }),

/***/ "./src/cardDrag.js":
/*!*************************!*\
  !*** ./src/cardDrag.js ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   installCardDrag: () => (/* binding */ installCardDrag)
/* harmony export */ });
// One pointer-driven drag session per table. Card geometry is read once per
// session, and invalidated only by layout/data changes, not every pointer event.
function installCardDrag(table) {
  const controller = table.gameController;
  let drag, frame = 0, suppressUntil = 0, highlighted, shifted;
  const abort = new AbortController(), options = {signal: abort.signal};
  const marker = document.createElement('div');
  marker.style.cssText = 'position:fixed;pointer-events:none;z-index:10001;width:3px;background:#ffe59a;border-radius:3px;box-shadow:0 0 6px #e2b84b;display:none';
  document.body.append(marker);
  const status = document.createElement('div');
  status.setAttribute('role', 'status');
  status.style.cssText = 'position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:10002;padding:8px 16px;border-radius:8px;background:#103a2f;color:#f4ead2;display:none';
  document.body.append(status);
  let statusTimer;
  function announce(text) { status.textContent = text; status.style.display = 'block'; clearTimeout(statusTimer); statusTimer = setTimeout(() => status.style.display = 'none', 4000); }
  function areaOf(card) { return card.getRootNode().host; }
  function orderedCards(area) { return [...area.cardArea.children].filter(card => card.cardRef).sort((a,b) => Number(a.style.order)-Number(b.style.order)); }
  function allowsReorder(area) { return !['zhuang-area', 'pan-area'].includes(area?.areaType); }
  function hit(x,y) {
    let element = document.elementFromPoint(x,y);
    while (element?.shadowRoot) { const inner = element.shadowRoot.elementFromPoint(x,y); if (!inner || inner === element) break; element = inner; }
    let area, player;
    while (element) {
      if (element.cardArea && element.cardsRef) area ||= element;
      if (element.localName === 'sg-player') player = element;
      element = element.parentElement || element.getRootNode().host;
    }
    if (player) {
      // Local area boxes are explicit drop targets; opponents still use the picker.
      if (area && drag.cards.every(card => areaOf(card) === area)) {
        return allowsReorder(area) ? {area} : {blocked:true};
      }
      if (player.dataset.key === controller.currentPlayer
        && [player.handArea, player.zhuangArea, player.other1Area, player.other2Area].includes(area)) return {area};
      return {player};
    }
    return area?.isTable ? {area} : {};
  }
  function setHighlight(element) {
    if (element === highlighted) return;
    highlighted?.classList.remove('drag-target'); element?.classList.add('drag-target'); highlighted = element;
  }
  function setShift(card) {
    if (card === shifted) return;
    shifted?.classList.remove('insert-left'); card?.classList.add('insert-left'); shifted = card;
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(tick); }
  function measure(area) {
    const view = area.cardArea, r = view.getBoundingClientRect(), moving = new Set(drag.cards);
    return {view, left:r.left+scrollX, top:r.top+scrollY, width:r.width, height:r.height,
      maxX:view.scrollWidth-view.clientWidth, maxY:view.scrollHeight-view.clientHeight,
      cards:orderedCards(area).filter(card => !moving.has(card)).map(card => {
        const rect = card.getBoundingClientRect(), dx = parseFloat(getComputedStyle(card).translate)||0;
        return {card,left:rect.left-r.left+view.scrollLeft-dx,top:rect.top-r.top+view.scrollTop,width:rect.width,height:rect.height};
      })};
  }
  function start() {
    const d = drag, r = d.card.getBoundingClientRect();
    d.active = true; d.origin = r; d.dx=d.startX-r.left; d.dy=d.startY-r.top;
    const selected = controller.selectedCards.includes(d.card) ? [...controller.selectedCards] : [d.card];
    d.cards = selected.sort((a,b) => areaOf(a)===areaOf(b)?Number(a.style.order)-Number(b.style.order):0);
    d.paths = d.cards.map(card => card.dataset.path); d.cache = new Map();
    d.ghost = document.createElement('div');
    d.ghost.style.cssText = `position:fixed;left:0;top:0;margin:0;padding:0;border:0;overflow:visible;background:transparent;pointer-events:none;z-index:10000;width:${r.width}px;height:${r.height}px;filter:drop-shadow(0 10px 9px #0008)`;
    const face = document.createElement('div'); face.className=d.card.className;
    face.style.cssText=`display:block;width:${r.width}px;height:${r.height}px;transform:rotate(-5deg) scale(1.1);pointer-events:none`;
    face.attachShadow({mode:'open'}).innerHTML=d.card.shadowRoot.innerHTML;
    face.shadowRoot.querySelector('.card-block').classList.remove('selected');
    d.ghost.append(face);
    if (d.cards.length>1) {
      face.style.boxShadow='4px 4px 0 #ae8b50,8px 8px 0 #856735';
      const badge=document.createElement('span');badge.textContent=d.cards.length;
      badge.style.cssText='position:absolute;right:-15px;top:-12px;border-radius:12px;background:#e2b84b;color:#241800;padding:3px 7px;font:bold 12px sans-serif';d.ghost.append(badge);
    }
    document.body.append(d.ghost);
    // Top-layer ghost remains visible over an open opponent-area popover.
    d.ghost.setAttribute('popover','manual');d.ghost.showPopover();
    d.cards.forEach(card=>card.classList.add('drag-source'));
    const popover=d.card.getRootNode().host?.getRootNode().querySelector?.('.pai-info:popover-open');
    popover?.hidePopover();
  }
  function tick() {
    frame=0; const d=drag;if(!d?.active||d.waiting)return;
    if(d.invalid){d.cache.clear();d.invalid=false;}
    const target=hit(d.x,d.y);d.target=target;setHighlight(target.player||target.area);let autoScroll=false;
    if(target.area && !allowsReorder(target.area)){
      // Equipment and judgment use fixed append order, so there is no insertion marker.
      d.beforeKey=null;setShift(null);marker.style.display='none';
    }else if(target.area){
      const area=target.area;if(!d.cache.has(area))d.cache.set(area,measure(area));
      const e=d.cache.get(area),v=e.view,left=e.left-scrollX,top=e.top-scrollY;
      const horizontal=!area.isTable && area.areaType!=='pan-area';
      const p=horizontal?d.x:d.y,lo=horizontal?left:top,hi=lo+(horizontal?e.width:e.height);
      const speed=d.released?0:p<lo+24?-Math.min(8,(lo+24-p)/3):p>hi-24?Math.min(8,(p-hi+24)/3):0;
      const old=horizontal?v.scrollLeft:v.scrollTop,next=Math.max(0,Math.min(horizontal?e.maxX:e.maxY,old+speed));
      if(next!==old){if(horizontal)v.scrollLeft=next;else v.scrollTop=next;autoScroll=true;}
      const x=d.x-left+v.scrollLeft,y=d.y-top+v.scrollTop;
      const i=e.cards.findIndex(r=>y<r.top||(y<=r.top+r.height&&x<r.left+r.width/2));
      const before=i<0?null:e.cards[i],prev=i<0?e.cards.at(-1):e.cards[i-1],r=before||prev;
      d.beforeKey=before?.card.cardRef.parent.toString()===area.cardsRef.toString() ? before.card.cardRef.key : null;
      setShift(prev&&r&&Math.abs(prev.top-r.top)<8?prev.card:null);
      const mx=r?left+r.left-v.scrollLeft+(before?-3:r.width+1):left+7;
      const mt=Math.max(top+2,r?top+r.top-v.scrollTop:top+10),mb=Math.min(top+e.height-2,r?top+r.top+r.height-v.scrollTop:mt+54);
      const key=[mx,mt,mb].join(',');if(key!==d.marker){d.marker=key;marker.style.left=mx+'px';marker.style.top=mt+'px';marker.style.height=Math.max(0,mb-mt)+'px';}
      marker.style.display=mb>mt&&mx>=left&&mx<=left+e.width?'block':'none';
    }else{setShift(null);marker.style.display='none';}
    d.ghost.style.transform=`translate3d(${d.x-d.dx}px,${d.y-d.dy}px,0)`;
    if(d.released){drop();return;}if(autoScroll)schedule();
  }
  async function drop() {
    const d=drag;d.waiting=true;marker.style.display='none';setShift(null);
    if(d.target.blocked){finish(false);return;}
    if(d.target.player){
      const player=d.target.player;
      player.openDropPicker(d.paths[0],d.paths,ok=>finish(ok));
      if(!player.dropPicker.open)finish(false);
      return;
    }
    if(!d.target.area){finish(false);return;}
    try {await controller.moveOrderedCards(d.paths,d.target.area.cardsRef,d.beforeKey);await finish(true);}
    catch(error){announce(error.message || '移动失败，请重试');await finish(false);}
  }
  async function finish(ok=false) {
    const d=drag;if(!d)return;drag=null;cancelAnimationFrame(frame);frame=0;setHighlight(null);setShift(null);marker.style.display='none';
    if(!d.active)return;
    if(ok){d.cards.forEach(card=>{if(card.isConnected)card.unselectCard();});}
    const end=ok?{opacity:0}:{transform:`translate3d(${d.origin.left}px,${d.origin.top}px,0)`};
    try {await d.ghost.animate([{transform:d.ghost.style.transform,opacity:1},end],{duration:ok?140:220,easing:'ease-out',fill:'forwards'}).finished;}finally{d.cards.forEach(card=>card.classList.remove('drag-source'));d.ghost.remove();}
  }
  table.addEventListener('pointerdown',e=>{
    const card=e.composedPath().find(node=>node.localName==='sg-card');
    if(!card||e.button!==0||drag)return;
    drag={card,id:e.pointerId,startX:e.clientX,startY:e.clientY};
  },options);
  document.addEventListener('pointermove',e=>{
    if(!drag||drag.waiting||e.pointerId!==drag.id)return;
    if(!drag.active&&Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>6){
      window.getSelection?.().removeAllRanges();
      start();
    }
    if(drag.active){e.preventDefault();drag.x=e.clientX;drag.y=e.clientY;schedule();}
  },{...options,passive:false});
  document.addEventListener('pointerup',e=>{if(!drag||drag.waiting||e.pointerId!==drag.id)return;if(!drag.active){drag=null;return;}suppressUntil=Date.now()+400;drag.x=e.clientX;drag.y=e.clientY;drag.released=true;schedule();},options);
  table.addEventListener('click',e=>{if(Date.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},{...options,capture:true});
  document.addEventListener('pointercancel',()=>{if(!drag?.waiting)finish(false);},options);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&drag&&!drag.waiting){e.preventDefault();finish(false);}},{...options,capture:true});
  window.addEventListener('blur',()=>{if(!drag?.waiting)finish(false);},options);
  window.addEventListener('resize',()=>{if(drag){drag.invalid=true;schedule();}},options);
  document.addEventListener('scroll',()=>{if(drag?.active&&!drag.waiting)schedule();},{...options,capture:true,passive:true});
  table.addEventListener('cards-updated',()=>{if(drag){drag.invalid=true;schedule();}},options);
  return ()=>{abort.abort();finish(false);marker.remove();status.remove();clearTimeout(statusTimer);};
}


/***/ }),

/***/ "./src/gameController.js":
/*!*******************************!*\
  !*** ./src/gameController.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   gameController: () => (/* binding */ gameController)
/* harmony export */ });
/* harmony import */ var firebase_database__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! firebase/database */ "./docs/sango-design-memory.cjs");
/* harmony import */ var _data_jiang_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./data/jiang.json */ "./src/data/jiang.json");
/* harmony import */ var _data_pai_json__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./data/pai.json */ "./src/data/pai.json");
/* harmony import */ var _cardOrder_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./cardOrder.mjs */ "./src/cardOrder.mjs");
/* harmony import */ var _databaseLocks_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./databaseLocks.mjs */ "./src/databaseLocks.mjs");
/* harmony import */ var _localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./localActionLog.mjs */ "./src/localActionLog.mjs");







class gameController {
  db;
  gameId;
  currentPlayer;
  userName;
  playerCount;
  rootComponent;
  paiBottomCardsPath;
  selectedCards = [];
  constructor(db, gameId) {
    this.db = db;
    this.gameId = gameId;
    this.paiBottomCardsPath = `game/${this.gameId}/tableDecks/paiBottom/cards`;
  }

  lockPlayerSelection() {
    this.rootComponent.lockPlayerSelection();
  }

  writePatch(patch) {
    return (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.update)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db), patch);
  }

  setValue(target, value) {
    return this.setScalarValue(target, value);
  }

  getDiscardDeckPath() {
    return `game/${this.gameId}/tableDecks/discard`;
  }

  showCard(cardRef) {
    return this.setScalarValue((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(cardRef, "/show"), "1");
  }

  resetCard(cardRef) {
    return this.setScalarValue((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(cardRef, "/show"), "0");
  }

  setScalarValue(target, value) {
    return (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.set)(target, value);
  }

  togglePlayerStatus(playerRef, index) {
    if (index !== 0 && index !== 1) throw Error('无效的玩家状态');
    return (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.runTransaction)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(playerRef, '/debuff'), current => {
      const chars = String(current || '00').padEnd(2, '0').slice(0, 2).split('');
      chars[index] = chars[index] === '1' ? '0' : '1';
      return chars.join('');
    }, {applyLocally: false});
  }

  async recycle(cardsRef) {
    const snapshot = await (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.get)(cardsRef);
    if (!snapshot.exists()) return;
    const source = cardsRef.toString().replace((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db).toString(), '');
    return this.moveOrderedCards(Object.keys(snapshot.val()).map(key=>`${source}/${key}`), (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db, `game/${this.gameId}/tableDecks/pai/cards`));
  }

  acquireGameLocks(resources) {
    const lockRootPath = `game/${this.gameId}/operationLocks`;
    return (0,_databaseLocks_mjs__WEBPACK_IMPORTED_MODULE_4__.acquireLocks)(resources, {
      lockRootPath, ttlMs: 15000,
      newToken: () => (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.push)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db, lockRootPath)).key,
      makeRef: path => (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db, path),
      runTransaction: firebase_database__WEBPACK_IMPORTED_MODULE_0__.runTransaction,
      updateRoot: patch => (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.update)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db), patch),
    });
  }

  // This value coordinates local best-effort logs; it is not replayable history.
  // Always spread it into the same root update as its state patch so subscribers
  // cannot associate a new state with an old action hint.
  actionHintPatch(opcode, args = []) {
    return {[`game/${this.gameId}/runtime/a`]:(0,_localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__.encodeActionHint)(opcode,this.currentPlayer,args)};
  }

  moveActionOpcode(paths, targetPath) {
    if (!this.currentPlayer) return null;
    const playerArea = path => path.match(/^game\/[^/]+\/(p\d+)\/([^/]+)\/cards(?:\/[^/]+)?$/);
    const sources = paths.map(playerArea).filter(Boolean), target = playerArea(targetPath);
    if (/\/tableDecks\/discard\/cards$/.test(targetPath) && sources.length) {
      return sources.some(match=>match[1]!==this.currentPlayer) ? _localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__.ACTION_HINT_OPCODE.DISCARD_OTHER : _localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__.ACTION_HINT_OPCODE.DISCARD;
    }
    if(target?.[2]==='hand'&&target[1]===this.currentPlayer&&paths.some(path=>/\/tableDecks\/(pai|paiBottom)\/cards\//.test(path)))return _localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__.ACTION_HINT_OPCODE.DRAW;
    if(target?.[2]==='hand'&&target[1]===this.currentPlayer&&paths.some(path=>/\/tableDecks\/discard\/cards\//.test(path)))return _localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__.ACTION_HINT_OPCODE.TAKE_DISCARD;
    if (!sources.some(match=>match[1]!==this.currentPlayer) && !(target&&target[1]!==this.currentPlayer)) return null;
    if (target?.[2]==='hand' && target[1]!==this.currentPlayer && paths.some(path=>/\/tableDecks\/(pai|paiBottom)\/cards\//.test(path))) return _localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__.ACTION_HINT_OPCODE.DRAW_FOR_OTHER;
    if (target && sources.some(match=>match[1]!==target[1])) return _localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__.ACTION_HINT_OPCODE.TRANSFER_CARD;
    return _localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__.ACTION_HINT_OPCODE.MOVE_OTHER;
  }

  moveCardToTableDeck(cardRef, deck) {
    return this.moveOrderedCards([cardRef.toString().replace((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db).toString(), '')], (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db, `game/${this.gameId}/tableDecks/${deck}/cards`));
  }

  async moveCardToPlayerArea(cardRef, player, area) {
    if (area === 'pan') {
      const playerDom = this.rootComponent.playerDoms.find(item => item.dataset.key === player);
      const path = cardRef.toString().replace((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db).toString(), '');
      playerDom.openDropPicker(path, [path]);
      await playerDom.confirmPlayerDrop('panArea');
      return;
    }
    const targetPath = `game/${this.gameId}/${player}/${area}/cards`;
    const targetRef = (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db, targetPath);
    return this.moveOrderedCards([cardRef.toString().replace((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db).toString(), '')], targetRef);
  }

  async dealCards() {
    const prefix = `game/${this.gameId}`;
    const deckPaths = [`${prefix}/tableDecks/pai/cards`, `${prefix}/tableDecks/paiBottom/cards`];
    const handPaths = Array.from({length:Number(this.playerCount)}, (_,index)=>`${prefix}/p${index+1}/hand/cards`);
    const locks = await this.acquireGameLocks([...deckPaths, ...handPaths].map(path=>`area:${path}`));
    let released = false;
    try {
      const snapshots = await Promise.all([...deckPaths, ...handPaths].map(path=>(0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.get)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db,path))));
      const hands = snapshots.slice(deckPaths.length);
      if (hands.some(snapshot=>snapshot.exists() && Object.keys(snapshot.val() || {}).length)) {
        throw Error('只有所有玩家手牌为空时才能发牌');
      }
      const deck = deckPaths.flatMap((path,index)=>(0,_cardOrder_mjs__WEBPACK_IMPORTED_MODULE_3__.orderedEntries)(snapshots[index].val() || {}).map(card=>({...card,path})));
      const needed = handPaths.length * 4;
      if (deck.length < needed) throw Error(`牌堆不足，需要 ${needed} 张牌`);
      const patch = locks.releasePatch();
      deck.slice(0,needed).forEach((item,index)=>{
        patch[`${item.path}/${item.key}`] = null;
        const handPath = handPaths[Math.floor(index/4)], card = {...item.value,show:'0',order:(index%4)*1024};
        delete card.panOrder;delete card.judgmentEffect;
        patch[`${handPath}/${(0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.push)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db,handPath)).key}`] = card;
      });
      handPaths.forEach(path => {
        patch[path.replace(/\/hand\/cards$/, '/areaCounts/hand')] = 4;
      });
      Object.assign(patch,this.actionHintPatch(_localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__.ACTION_HINT_OPCODE.DEAL_CARDS));
      await (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.update)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db),patch);released=true;return true;
    } finally {
      if (!released) await locks.release();
    }
  }

  async moveOrderedCards(paths, targetRef, beforeKey = null, effects = {}, actionOpcode = null) {
    const base = (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db).toString();
    const targetPath = targetRef.toString().replace(base, '');
    const prefix = `game/${this.gameId}/`;
    if (!targetPath.startsWith(prefix) || !targetPath.endsWith('/cards')) throw Error('无效的目标区域');
    const unique = [...new Set(paths)];
    if (!unique.length || unique.some(path => !path.startsWith(prefix) || !/\/cards\/[^/]+$/.test(path))) throw Error('无效的卡牌');
    const sourceAreas = unique.map(path=>path.slice(0,path.lastIndexOf('/')));
    const locks = await this.acquireGameLocks([
      `area:${targetPath}`,...sourceAreas.map(path=>`area:${path}`),...unique.map(path=>`card:${path}`)
    ]);
    let released = false;
    try {
      const [target, ...snapshots] = await Promise.all([(0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.get)(targetRef), ...unique.map(path => (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.get)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db, path)))]);
      if (snapshots.some(snapshot => !snapshot.exists())) throw Error('卡牌已移动，请重新选择');
      const sources = snapshots.map((snapshot, index) => ({path: unique[index], value: snapshot.val()}));
      const patch = (0,_cardOrder_mjs__WEBPACK_IMPORTED_MODULE_3__.orderedMovePatch)(targetPath, target.val() || {}, sources, beforeKey,
        () => (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.push)(targetRef).key, effects, card => _data_pai_json__WEBPACK_IMPORTED_MODULE_2__[card.id]?.name);
      const countInfo = path => {
        const match = path.match(/^game\/[^/]+\/(p\d+)\/(hand|other1|other2)\/cards$/);
        return match ? {areaPath:path,countPath:`game/${this.gameId}/${match[1]}/areaCounts/${match[2]}`} : null;
      };
      const targetCount = countInfo(targetPath);
      const incomingCount = unique.filter(path => path.slice(0,path.lastIndexOf('/')) !== targetPath).length;
      if (targetCount && incomingCount) {
        patch[targetCount.countPath] = Object.keys(target.val() || {}).length + incomingCount;
      }
      const movedBySource = new Map();
      sourceAreas.forEach(areaPath => {
        if (areaPath !== targetPath && countInfo(areaPath)) movedBySource.set(areaPath,(movedBySource.get(areaPath)||0)+1);
      });
      for (const [areaPath,movedCount] of movedBySource) {
        const info=countInfo(areaPath),countSnapshot=await (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.get)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db,info.countPath));
        let currentCount=Number(countSnapshot.val());
        if (!countSnapshot.exists()) {
          const areaSnapshot=await (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.get)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db,areaPath));
          currentCount=Object.keys(areaSnapshot.val()||{}).length;
        }
        patch[info.countPath]=Math.max(0,currentCount-movedCount);
      }
      const hintOpcode=actionOpcode||this.moveActionOpcode(unique,targetPath);
      if(hintOpcode)Object.assign(patch,this.actionHintPatch(hintOpcode));
      Object.assign(patch, locks.releasePatch());
      await (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.update)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db), patch);
      released = true;
      return true;
    } finally {
      if (!released) await locks.release();
    }
  }

  async moveCardFromPathToRef(fromPath, targetRef) {
    const seat = targetRef.toString().match(/\/(p\d+)\/pan\/cards$/)?.[1];
    if (seat) return this.moveCardToPlayerArea((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db, fromPath), seat, 'pan');
    return this.moveOrderedCards([fromPath], targetRef);
  }
  async moveCardRefToTargetRef(cardRef, targetRef) {
    return this.moveCardFromPathToRef(cardRef.toString().replace((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db).toString(), ''), targetRef);
  }

  async lockSelectedGenerals(cardRefs, playerKey) {
    if (!/^p\d+$/.test(playerKey) || cardRefs.length !== 2) return false;
    const base=(0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db).toString(),sources=cardRefs.map(cardRef=>cardRef.toString().replace(base,''));
    const playerPath=`game/${this.gameId}/${playerKey}`,sourceAreas=sources.map(path=>path.slice(0,path.lastIndexOf('/')));
    const targetPaths=[`${playerPath}/jiang1/cards`,`${playerPath}/jiang2/cards`];
    const locks=await this.acquireGameLocks([
      ...sourceAreas.map(path=>`area:${path}`),...targetPaths.map(path=>`area:${path}`),...sources.map(path=>`card:${path}`)
    ]);
    let released=false;
    try {
      const snapshots=await Promise.all(sources.map(path=>(0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.get)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db,path))));
      if(snapshots.some(snapshot=>!snapshot.exists()))throw Error('武将已移动，请重新选择');
      const patch=locks.releasePatch();
      snapshots.forEach((snapshot,index)=>{patch[sources[index]]=null;patch[`${targetPaths[index]}/${snapshot.key}`]=snapshot.val();});
      patch[`${playerPath}/jiangLocked`]=true;
      await (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.update)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db),patch);released=true;return true;
    } finally {if(!released)await locks.release();}
  }

  getPlayerPath(playerKey) {
    return `game/${this.gameId}/${playerKey}`;
  }

  assignRoles() {
    let roles;
    if (this.playerCount == 6) {
      roles = ["忠", "忠", "反", "反", "内", "主"];
    } else {
      roles = ["忠", "忠", "忠", "反", "反", "反", "内", "主"];
    }
    const updates = {};
    for (let i = 0; i < this.playerCount; i++) {
      const len = roles.length;
      const idx = Math.floor(Math.random() * len);
      const role = roles[idx];
      roles.splice(idx, 1);
      updates[`game/${this.gameId}/p${i + 1}/role`] = role;
    }
    return (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.update)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db), {...updates,...this.actionHintPatch(_localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__.ACTION_HINT_OPCODE.ASSIGN_ROLES)});
  }

  isTableItem(dbRef) {
    const pathStr = dbRef.toString();
    return pathStr.includes("/tableDecks/");
  }

  async shuffleDeck(deckRef) {
    const cardsRef = (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(deckRef, "/cards");
    const path = cardsRef.toString().replace((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db).toString(), '');
    const locks = await this.acquireGameLocks([`area:${path}`]);
    let released = false;
    try {
      const snapshot = await (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.get)(cardsRef);
      if (!snapshot.exists()) return;
      const cardsData = this.shuffleData(snapshot.val());
      const area=path.match(/\/(pai|paiBottom|discard|hand|zhuang|pan|other1|other2|jiang)\/cards$/)?.[1];
      const code={pai:'p',paiBottom:'b',discard:'d',hand:'h',zhuang:'z',pan:'n',other1:'o',other2:'o',jiang:'j'}[area]||'o';
      await (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.update)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db),{[path]:cardsData,...this.actionHintPatch(_localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__.ACTION_HINT_OPCODE.SHUFFLE,[code]),...locks.releasePatch()});released=true;
    } finally {
      if (!released) await locks.release();
    }
  }

  shuffleData(cardsData) {
    const keys = Object.keys(cardsData);
    const len = keys.length;
    for (let i = 0; i < len; i++) {
      const from = Math.floor(Math.random() * len);
      const to = Math.floor(Math.random() * len);
      const fromVal = cardsData[keys[from]];
      cardsData[keys[from]] = cardsData[keys[to]];
      cardsData[keys[to]] = fromVal;
    }
    keys.forEach((key, index) => { cardsData[key].order = index * 1024; });
    return cardsData;
  }

  async resetPai() {
    const prefix=`game/${this.gameId}/tableDecks`, paths=['pai','paiBottom','discard'].map(area=>`${prefix}/${area}/cards`);
    const locks=await this.acquireGameLocks(paths.map(path=>`area:${path}`));
    let released=false;
    try {
      const snapshots=await Promise.all(paths.map(path=>(0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.get)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db,path))));
      const merged={};
      snapshots.forEach(snapshot=>Object.entries(snapshot.val()||{}).forEach(([key,value])=>{
        const nextKey=merged[key] ? (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.push)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db,paths[0])).key : key;
        const card={...value,show:'0'};delete card.judgmentEffect;delete card.panOrder;
        merged[nextKey]=card;
      }));
      this.shuffleData(merged);
      await (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.update)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db),{
        [`${prefix}/pai/cards`]:merged,[`${prefix}/paiBottom`]:null,[`${prefix}/discard`]:null,
        ...this.actionHintPatch(_localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__.ACTION_HINT_OPCODE.RESET_DECK),...locks.releasePatch()
      });
      released=true;return true;
    } finally {
      if(!released)await locks.release();
    }
  }

  resetTable() {
    const updates = {};

    // reset players
    for (let i = 0; i < this.playerCount; i++) {
      const playerPath = `game/${this.gameId}/p${i + 1}`;
      updates[`${playerPath}/jiang/cards`] = {};
      updates[`${playerPath}/jiang1`] = {};
      updates[`${playerPath}/jiang2`] = {};
      updates[`${playerPath}/jiangLocked`] = false;
      updates[`${playerPath}/hand/cards`] = {};
      updates[`${playerPath}/pan/cards`] = {};
      updates[`${playerPath}/zhuang/cards`] = {};
      updates[`${playerPath}/other1/cards`] = {};
      updates[`${playerPath}/other2/cards`] = {};
      updates[`${playerPath}/areaCounts/hand`] = 0;
      updates[`${playerPath}/areaCounts/other1`] = 0;
      updates[`${playerPath}/areaCounts/other2`] = 0;
    }

    const tableDeckPath = `game/${this.gameId}/tableDecks`;
    updates[`${tableDeckPath}/discard`] = {};
    updates[`${tableDeckPath}/paiBottom`] = {};
    updates[`${tableDeckPath}/jiang`] = {};
    updates[`${tableDeckPath}/pai`] = { cards: this.getShuffledPai() };
    return (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.update)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db),{...updates,...this.actionHintPatch(_localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__.ACTION_HINT_OPCODE.RESET_TABLE)});
  }

  getShuffledJiang() {
    const orgJiangDeckCards = Object.keys(_data_jiang_json__WEBPACK_IMPORTED_MODULE_1__).map((key) => {
      if (!_data_jiang_json__WEBPACK_IMPORTED_MODULE_1__[key].disable) {
        return { id: key, show: "0" };
      } else {
        return null;
      }
    });
    const initJiangDeckCards = orgJiangDeckCards.filter((j) => j != null);
    this.shuffleData(initJiangDeckCards);
    this.shuffleData(initJiangDeckCards);
    return initJiangDeckCards;
  }

  getShuffledPai() {
    const initPaiDeckCards = Object.keys(_data_pai_json__WEBPACK_IMPORTED_MODULE_2__).map((key) => {
      return { id: key, show: "0" };
    });
    this.shuffleData(initPaiDeckCards);
    this.shuffleData(initPaiDeckCards);
    return initPaiDeckCards;
  }

  async dispatchJiang() {
    const jiangCards = this.getShuffledJiang();
    const updates = {};
    const areas = [];
    for (let i = 0; i < this.playerCount; i++) {
      const jiangs = jiangCards.splice(0, 7);
      const playerPath=`game/${this.gameId}/p${i + 1}`;
      updates[`${playerPath}/jiang/cards`] = jiangs;
      updates[`${playerPath}/jiang1`] = {};
      updates[`${playerPath}/jiang2`] = {};
      updates[`${playerPath}/jiangLocked`] = false;
      areas.push(`${playerPath}/jiang/cards`,`${playerPath}/jiang1/cards`,`${playerPath}/jiang2/cards`);
    }
    const locks=await this.acquireGameLocks(areas.map(path=>`area:${path}`));
    let released=false;
    try {await (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.update)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db),{...updates,...this.actionHintPatch(_localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__.ACTION_HINT_OPCODE.DEAL_GENERALS),...locks.releasePatch()});released=true;return true;}
    finally {if(!released)await locks.release();}
  }

  addSelectedCard(sgCard) {
    this.selectedCards.push(sgCard);
    console.log("selcted count : " + this.selectedCards.length);
    this.rootComponent.showCardMenu();
  }

  removeSelectedCard(sgCard) {
    const index = this.selectedCards.indexOf(sgCard);
    if (index !== -1) {
      this.selectedCards.splice(index, 1);
    }
    console.log("selcted count : " + this.selectedCards.length);
    if (this.selectedCards.length == 0) {
      this.rootComponent.hideCardMenu();
    } else {
      this.rootComponent.showCardMenu();
    }
  }

  async drawSelectedCards(cards = [...this.selectedCards]) {
    if (!this.currentPlayer) return;
    return this.moveSelectedCards(cards, `game/${this.gameId}/${this.currentPlayer}/hand/cards`);
  }

  async discardSelectedCards(cards = [...this.selectedCards]) {
    return this.moveSelectedCards(cards, `game/${this.gameId}/tableDecks/discard/cards`, _localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__.ACTION_HINT_OPCODE.DISCARD);
  }

  async playSelectedCards(cards = [...this.selectedCards]) {
    return this.moveSelectedCards(cards, `game/${this.gameId}/tableDecks/discard/cards`, _localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__.ACTION_HINT_OPCODE.PLAY);
  }

  async moveSelectedCards(cards, targetPath, actionOpcode = null) {
    if (this.selectionMoveBusy) return;
    const base = (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db).toString();
    const paths = [...new Set(cards.map(card => card.cardRef.toString().replace(base, '')))]
      .filter(path => !path.startsWith(`${targetPath}/`));
    if (!paths.length) return;
    this.selectionMoveBusy = true;
    try {
      const ownOnly=paths.every(path=>path.includes(`/${this.currentPlayer}/`));
      return await this.moveOrderedCards(paths, (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db, targetPath), null, {}, ownOnly?actionOpcode:null);
    } finally {
      this.selectionMoveBusy = false;
    }
  }

  async topDeckPaths(count = 1) {
    const prefix=`game/${this.gameId}/tableDecks`;
    const areas=['pai','paiBottom'];
    const snapshots=await Promise.all(areas.map(area=>(0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.get)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db,`${prefix}/${area}/cards`))));
    const cards=areas.flatMap((area,index)=>(0,_cardOrder_mjs__WEBPACK_IMPORTED_MODULE_3__.orderedEntries)(snapshots[index].val()||{}).map(({key})=>`${prefix}/${area}/cards/${key}`));
    if(cards.length<count)throw Error(`牌堆不足，需要 ${count} 张牌`);
    return cards.slice(0,count);
  }

  async drawTopCards(count = 1) {
    if(!this.currentPlayer)throw Error('请先入座');
    const paths=await this.topDeckPaths(count);
    return this.moveOrderedCards(paths,(0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db,`game/${this.gameId}/${this.currentPlayer}/hand/cards`),null,{},_localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__.ACTION_HINT_OPCODE.DRAW);
  }

  async revealTopCard() {
    const paths=await this.topDeckPaths(1);
    return this.moveOrderedCards(paths,(0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db,`game/${this.gameId}/tableDecks/discard/cards`),null,{},_localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__.ACTION_HINT_OPCODE.REVEAL_JUDGMENT);
  }

  async takeDiscardCards(paths) {
    if(!this.currentPlayer)throw Error('请先入座');
    return this.moveOrderedCards(paths,(0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db,`game/${this.gameId}/${this.currentPlayer}/hand/cards`),null,{},_localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__.ACTION_HINT_OPCODE.TAKE_DISCARD);
  }

  async rearrangeDeck({top=[],bottom=[],draw=[]}) {
    if(!this.currentPlayer)throw Error('请先入座');
    const prefix=`game/${this.gameId}`,topPath=`${prefix}/tableDecks/pai/cards`,bottomPath=`${prefix}/tableDecks/paiBottom/cards`;
    const handPath=`${prefix}/${this.currentPlayer}/hand/cards`,areaPaths=[topPath,bottomPath,handPath];
    const locks=await this.acquireGameLocks(areaPaths.map(path=>`area:${path}`));
    let released=false;
    try{
      const [topSnapshot,bottomSnapshot,handSnapshot]=await Promise.all(areaPaths.map(path=>(0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.get)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db,path))));
      const deckItems=[...(0,_cardOrder_mjs__WEBPACK_IMPORTED_MODULE_3__.orderedEntries)(topSnapshot.val()||{}).map(item=>({...item,path:topPath})),...(0,_cardOrder_mjs__WEBPACK_IMPORTED_MODULE_3__.orderedEntries)(bottomSnapshot.val()||{}).map(item=>({...item,path:bottomPath}))];
      const byPath=new Map(deckItems.map(item=>[`${item.path}/${item.key}`,item.value]));
      const requested=[...top,...bottom,...draw];
      if(requested.length!==byPath.size||new Set(requested).size!==requested.length||requested.some(path=>!byPath.has(path)))throw Error('牌堆已变化，请重新展开');
      const patch=locks.releasePatch();
      requested.forEach(path=>{patch[path]=null;});
      const place=(paths,targetPath)=>paths.forEach((sourcePath,index)=>{
        const sameArea=sourcePath.slice(0,sourcePath.lastIndexOf('/'))===targetPath;
        const key=sameArea?sourcePath.split('/').pop():(0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.push)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db,targetPath)).key;
        const card={...byPath.get(sourcePath),show:'0',order:index*1024};delete card.panOrder;delete card.judgmentEffect;
        patch[`${targetPath}/${key}`]=card;
      });
      place(top,topPath);place(bottom,bottomPath);
      const existingHand=(0,_cardOrder_mjs__WEBPACK_IMPORTED_MODULE_3__.orderedEntries)(handSnapshot.val()||{});
      existingHand.forEach((item,index)=>{patch[`${handPath}/${item.key}/order`]=(index+draw.length)*1024;});
      let handOrder=-1024;
      draw.forEach(sourcePath=>{
        const key=(0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.push)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db,handPath)).key,card={...byPath.get(sourcePath),show:'0',order:handOrder+=1024};delete card.panOrder;delete card.judgmentEffect;
        patch[`${handPath}/${key}`]=card;
      });
      patch[`${prefix}/${this.currentPlayer}/areaCounts/hand`]=Object.keys(handSnapshot.val()||{}).length+draw.length;
      Object.assign(patch,this.actionHintPatch(_localActionLog_mjs__WEBPACK_IMPORTED_MODULE_5__.ACTION_HINT_OPCODE.REARRANGE_DECK));
      await (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.update)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db),patch);released=true;return true;
    }finally{if(!released)await locks.release();}
  }

  async showSelectedCards(cards = [...this.selectedCards]) {
    const uniqueCards = [...new Set(cards)];
    if (!uniqueCards.length) return;
    const base = (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db).toString();
    const updates = {};
    uniqueCards.forEach(card => {
      const path = card.cardRef.toString().replace(base, '');
      updates[`${path}/show`] = card.cardData.show === '1' ? '0' : '1';
    });
    await (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.update)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db), updates);
    uniqueCards.forEach(card => card.unselectCard());
  }

  async dropSeletedCards(targetCardsRef) {
    const base = (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db).toString();
    const targetPath = targetCardsRef.toString().replace(base, '');
    const paths = [...new Set(this.selectedCards
      .map(card => card.cardRef.toString().replace(base, '')))]
      .filter(path => !path.startsWith(`${targetPath}/`));
    if (!paths.length) return;
    return this.moveOrderedCards(paths, targetCardsRef);
  }
}




/***/ }),

/***/ "./src/wc/actionLogPanel.js":
/*!**********************************!*\
  !*** ./src/wc/actionLogPanel.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   installActionLog: () => (/* binding */ installActionLog)
/* harmony export */ });
/* harmony import */ var firebase_database__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! firebase/database */ "./docs/sango-design-memory.cjs");
/* harmony import */ var _localActionLog_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../localActionLog.mjs */ "./src/localActionLog.mjs");



const LOCAL_LOG_LIMIT = 500;

function installActionLog(table) {
  const panel = document.createElement('section');
  panel.className = 'action-log';
  panel.setAttribute('aria-label', '行动日志');
  panel.innerHTML = `<header class="log-header"><strong>行动日志</strong><small>仅本地</small><button type="button" aria-label="折叠行动日志" aria-expanded="true">−</button></header>
    <ol class="log-list" role="log" aria-live="polite" aria-relevant="additions" aria-label="玩家行动记录"></ol>
    <footer class="log-footer"><span>暂无本地记录</span></footer>`;
  table.shadowRoot.querySelector('.table-container').append(panel);
  const list = panel.querySelector('.log-list'), count = panel.querySelector('.log-footer span');
  panel.querySelector('button').addEventListener('click', event => {
    const collapsed = panel.classList.toggle('collapsed');
    event.currentTarget.textContent = collapsed ? '+' : '−';
    event.currentTarget.setAttribute('aria-expanded', String(!collapsed));
    event.currentTarget.setAttribute('aria-label', collapsed ? '展开行动日志' : '折叠行动日志');
  });
  const controller = table.gameController;
  let previousRoom = null;
  const unsubscribe = (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.onValue)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(controller.db, `game/${controller.gameId}`), snapshot => {
    const room=snapshot.val()||{};
    // First snapshot is baseline only: never replay state or a hint that existed
    // before this client entered the room.
    if(previousRoom===null){previousRoom=room;return;}
    const transfers=(0,_localActionLog_mjs__WEBPACK_IMPORTED_MODULE_1__.createCardTransfers)(previousRoom,room);
    const entry=(0,_localActionLog_mjs__WEBPACK_IMPORTED_MODULE_1__.createLocalLogEntry)(previousRoom,room);previousRoom=room;
    if(transfers.length)table.dispatchEvent(new CustomEvent('card-transfers',{detail:{transfers}}));
    if(!entry)return;
    const atBottom = list.scrollHeight - list.scrollTop - list.clientHeight < 30;
    const row=document.createElement('li');row.className='log-entry';
    row.append(document.createElement('time'),document.createElement('p'));
    const time=row.querySelector('time'),date=new Date(entry.timestamp);
    time.textContent=date.toLocaleTimeString('zh-CN',{hour12:false,hour:'2-digit',minute:'2-digit'});
    time.title=date.toLocaleString('zh-CN');time.dateTime=date.toISOString();
    const text=row.querySelector('p'),message=`${entry.changes.join('；')}。`;
    if(entry.actor){const actor=document.createElement('b');actor.textContent=`${entry.actor} `;text.replaceChildren(actor,document.createTextNode(message));}
    else text.textContent=message;
    list.append(row);
    while(list.children.length>LOCAL_LOG_LIMIT)list.firstElementChild.remove();
    count.textContent=`本地记录 · ${list.children.length} 条`;
    if (atBottom) list.scrollTop = list.scrollHeight;
  }, () => { count.textContent = '本地日志监听失败，请刷新重试'; });
  return () => {unsubscribe();panel.remove();};
}


/***/ }),

/***/ "./src/wc/cardInsertionAnimation.js":
/*!******************************************!*\
  !*** ./src/wc/cardInsertionAnimation.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   animateCardInsertions: () => (/* binding */ animateCardInsertions),
/* harmony export */   captureCardPositions: () => (/* binding */ captureCardPositions)
/* harmony export */ });
// Capture visual positions before rendering; only additions trigger this effect.
function captureCardPositions(nodes, keyFor) {
  return new Map([...nodes].map(node => [keyFor(node), node.getBoundingClientRect()]));
}

function animateCardInsertions(nodes, previous, keyFor) {
  const cards=[...nodes];
  if(!cards.some(node=>!previous.has(keyFor(node)))||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  cards.forEach(node=>{
    const rect=node.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    const old=previous.get(keyFor(node));
    node.getAnimations().forEach(animation=>animation.cancel());
    if(old){
      const x=old.left-rect.left,y=old.top-rect.top;
      if(Math.abs(x)+Math.abs(y)<1)return;
      node.animate([{transform:`translate(${x}px,${y}px)`},{transform:'translate(0,0)'}],{duration:360,easing:'cubic-bezier(.2,.7,.3,1)'});
    }else{
      node.animate([{transform:'translateX(-48px)',opacity:0},{transform:'translateX(0)',opacity:1}],{duration:360,delay:100,fill:'backwards',easing:'cubic-bezier(.2,.7,.3,1)'});
    }
  });
}


/***/ }),

/***/ "./src/wc/cardTransferAnimation.js":
/*!*****************************************!*\
  !*** ./src/wc/cardTransferAnimation.js ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   installCardTransferAnimation: () => (/* binding */ installCardTransferAnimation)
/* harmony export */ });
const MOVE_DURATION=700;
const TRAIL_HOLD=500;
const TRAIL_FADE=150;

function center(rect){return{x:rect.left+rect.width/2,y:rect.top+rect.height/2};}
function edge(rect,toward){
  const origin=center(rect),dx=toward.x-origin.x,dy=toward.y-origin.y;
  const scale=Math.min((rect.width/2)/Math.max(Math.abs(dx),.001),(rect.height/2)/Math.max(Math.abs(dy),.001));
  return{x:origin.x+dx*scale,y:origin.y+dy*scale};
}

function installCardTransferAnimation(table){
  const layer=document.createElement('div');layer.className='card-transfer-layer';layer.setAttribute('aria-hidden','true');
  table.shadowRoot.append(layer);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');

  function areaHost(path){
    const [owner,area]=String(path||'').split('/');
    if(owner==='tableDecks')return table.shadowRoot.querySelector(area==='discard'?'.public-discard-panel':'.public-deck-panel');
    if(/^p\d+$/.test(owner))return table.shadowRoot.querySelector(`sg-player[data-key="${owner}"]`);
    return null;
  }

  function play({source,target,count,label}){
    const from=areaHost(source),to=areaHost(target);
    if(!from||!to||from===to||!from.isConnected||!to.isConnected)return;
    const fromRect=from.getBoundingClientRect(),toRect=to.getBoundingClientRect();
    if(!fromRect.width||!fromRect.height||!toRect.width||!toRect.height)return;
    const start=edge(fromRect,center(toRect)),end=edge(toRect,center(fromRect));
    const dx=end.x-start.x,dy=end.y-start.y,length=Math.hypot(dx,dy)||1,ux=dx/length,uy=dy/length;
    const group=document.createElement('div');group.className='card-transfer-group';layer.append(group);
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox',`0 0 ${window.innerWidth} ${window.innerHeight}`);
    svg.innerHTML=`<path d="M ${start.x} ${start.y} L ${end.x} ${end.y} M ${end.x-ux*10-uy*5} ${end.y-uy*10+ux*5} L ${end.x} ${end.y} L ${end.x-ux*10+uy*5} ${end.y-uy*10-ux*5}"/>`;
    group.append(svg);
    const duration=reduced.matches?140:MOVE_DURATION,trailDuration=duration+44+TRAIL_HOLD+TRAIL_FADE;
    const trailHold=(trailDuration-TRAIL_FADE)/trailDuration;
    svg.animate([{opacity:0},{opacity:.72,offset:100/trailDuration},{opacity:.72,offset:trailHold},{opacity:0}],{duration:trailDuration,fill:'forwards'});
    const caption=document.createElement('span');caption.className='card-transfer-label';caption.textContent=`${label} · ${count} 张`;
    caption.style.left=`${(start.x+end.x)/2+14}px`;caption.style.top=`${(start.y+end.y)/2-25}px`;group.append(caption);
    caption.animate([{opacity:0},{opacity:1,offset:100/trailDuration},{opacity:1,offset:trailHold},{opacity:0}],{duration:trailDuration,fill:'forwards'});
    if(!reduced.matches)for(let index=0;index<Math.min(count,3);index++){
      const card=document.createElement('div');card.className='card-transfer-card';group.append(card);
      const position=(x,y,scale,rotation)=>`translate(${x-16+index*4}px,${y-22-index*3}px) scale(${scale}) rotate(${rotation}deg)`;
      card.animate([
        {transform:position(start.x,start.y,.85,-6),opacity:0},
        {transform:position(start.x+dx*.08,start.y+dy*.08,1,-3),opacity:1,offset:.12},
        {transform:position(end.x,end.y,.9,0),opacity:1,offset:.88},
        {transform:position(end.x,end.y,.7,0),opacity:0},
      ],{duration,delay:index*22,easing:'cubic-bezier(.2,.65,.3,1)',fill:'forwards'});
    }
    window.setTimeout(()=>to.animate([
      {filter:'brightness(1)'},{filter:'brightness(1.24)',offset:.3},{filter:'brightness(1)'},
    ],{duration:220}),Math.max(0,duration-80));
    window.setTimeout(()=>group.remove(),trailDuration+20);
  }

  const onTransfers=event=>requestAnimationFrame(()=>event.detail?.transfers?.forEach(play));
  table.addEventListener('card-transfers',onTransfers);
  return()=>{table.removeEventListener('card-transfers',onTransfers);layer.remove();};
}


/***/ }),

/***/ "./src/wc/publicTablePanel.js":
/*!************************************!*\
  !*** ./src/wc/publicTablePanel.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   installPublicTablePanel: () => (/* binding */ installPublicTablePanel)
/* harmony export */ });
/* harmony import */ var firebase_database__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! firebase/database */ "./docs/sango-design-memory.cjs");
/* harmony import */ var _cardOrder_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cardOrder.mjs */ "./src/cardOrder.mjs");
/* harmony import */ var _localActionLog_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../localActionLog.mjs */ "./src/localActionLog.mjs");
/* harmony import */ var _sgCard_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./sgCard.js */ "./src/wc/sgCard.js");
/* harmony import */ var _cardInsertionAnimation_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./cardInsertionAnimation.js */ "./src/wc/cardInsertionAnimation.js");






const RECENT_LIMIT=6;

function installPublicTablePanel(table,host,cardMenu){
  const controller=table.gameController,db=controller.db,prefix=`game/${controller.gameId}`;
  host.innerHTML=`<section class="public-deck-panel">
      <header><strong>牌堆</strong><small>从牌顶取牌</small></header>
      <div class="public-deck-summary"><div class="public-card-back" aria-hidden="true"></div><div><b class="public-deck-count">0</b><small>张剩余</small></div></div>
      <div class="public-deck-actions">
        <div class="public-draw-split"><button class="primary" data-public-action="draw" data-count="1">摸 1 张</button><button class="primary draw-toggle" aria-label="选择摸牌张数" aria-expanded="false">▾</button><div class="draw-options" hidden>${[2,3,4].map(count=>`<button data-public-action="draw" data-count="${count}">摸 ${count} 张</button>`).join('')}</div></div>
        <button data-public-action="reveal">展示／判定</button>
        <button class="text-action expand-deck" data-public-action="expand">展开牌堆 ↗</button>
        <button class="primary shuffle-empty" data-public-action="shuffle" hidden>洗牌</button>
      </div>
    </section>
    <section class="public-discard-panel">
      <header><strong>弃牌区</strong><small>最近 ${RECENT_LIMIT} 张 · 最新 → 较早</small></header>
      <div class="public-discard-body"><div class="recent-discard-list"></div><aside class="discard-summary"><div class="discard-summary-main"><div class="discard-icon" aria-hidden="true">弃</div><div><b class="discard-count">0</b><small>张弃牌</small></div></div><button class="text-action" data-public-action="all-discard">查看全部 ↗</button></aside></div>
    </section>`;
  host.append(cardMenu);
  const discardDialog=document.createElement('dialog');discardDialog.className='public-dialog discard-dialog';
  discardDialog.innerHTML='<header><h2>弃牌堆</h2><button data-dialog-close>关闭 ×</button></header><p>最新进入的牌排在前面。</p><div class="discard-grid"></div>';
  const sortDialog=document.createElement('dialog');sortDialog.className='public-dialog deck-sort-dialog';
  host.append(discardDialog,sortDialog);
  const recentList=host.querySelector('.recent-discard-list'),drawSplit=host.querySelector('.public-draw-split');
  const drawToggle=host.querySelector('.draw-toggle'),drawOptions=host.querySelector('.draw-options');
  let deckTop={},deckBottom={},discard={},draft=null,busy=false,lastHint=null,lastHintNonce=null,hintInitialized=false,previousDiscardKeys=null;
  const sourceByKey=new Map(),pendingDiscardKeys=new Set();

  const pathFor=(area,key)=>`${prefix}/tableDecks/${area}/cards/${key}`;
  const deckEntries=()=>[
    ...(0,_cardOrder_mjs__WEBPACK_IMPORTED_MODULE_1__.orderedEntries)(deckTop).map(item=>({...item,path:pathFor('pai',item.key)})),
    ...(0,_cardOrder_mjs__WEBPACK_IMPORTED_MODULE_1__.orderedEntries)(deckBottom).map(item=>({...item,path:pathFor('paiBottom',item.key)})),
  ];
  function cardFor(path,value,className,show=true){
    const card=document.createElement('sg-card');card.className=className;
    card.init((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(db,path),{...value,show:show?'1':'0'},controller,{subscribe:false});card.renderCard();
    return card;
  }
  function hintSource(hint){
    if(!hint)return '';
    if(hint.opcode===_localActionLog_mjs__WEBPACK_IMPORTED_MODULE_2__.ACTION_HINT_OPCODE.PLAY)return '打出';
    if(hint.opcode===_localActionLog_mjs__WEBPACK_IMPORTED_MODULE_2__.ACTION_HINT_OPCODE.DISCARD||hint.opcode===_localActionLog_mjs__WEBPACK_IMPORTED_MODULE_2__.ACTION_HINT_OPCODE.DISCARD_OTHER)return '弃置';
    if(hint.opcode===_localActionLog_mjs__WEBPACK_IMPORTED_MODULE_2__.ACTION_HINT_OPCODE.REVEAL_JUDGMENT)return '展示／判定';
    return '';
  }
  function classifyPending(){
    if(!pendingDiscardKeys.size||!lastHint||lastHint.nonce===lastHintNonce)return;
    const source=hintSource(lastHint);
    pendingDiscardKeys.forEach(key=>{if(source)sourceByKey.set(key,source);});
    pendingDiscardKeys.clear();lastHintNonce=lastHint.nonce;renderDiscard();
  }
  function renderDiscard(animate=false){
    const keyFor=node=>node.dataset.cardKey;
    const previous=(0,_cardInsertionAnimation_js__WEBPACK_IMPORTED_MODULE_4__.captureCardPositions)(recentList.querySelectorAll('.recent-discard-card'),keyFor);
    const existing=new Map([...recentList.querySelectorAll('.recent-discard-card')].map(node=>[keyFor(node),node]));
    const entries=(0,_cardOrder_mjs__WEBPACK_IMPORTED_MODULE_1__.orderedEntries)(discard).reverse();
    recentList.querySelector('.public-empty')?.remove();
    const visible=new Set(entries.slice(0,RECENT_LIMIT).map(item=>item.key));
    existing.forEach((node,key)=>{if(!visible.has(key))node.remove();});
    entries.slice(0,RECENT_LIMIT).forEach(({key,value})=>{
      if(existing.has(key)){
        const item=existing.get(key);item.querySelector('button').disabled=busy||!controller.currentPlayer;
        const action=sourceByKey.get(key);
        if(action&&!item.querySelector('.discard-action-indicator')){const badge=document.createElement('small');badge.className='discard-action-indicator';badge.textContent=action;item.append(badge);}
        item.style.order=entries.findIndex(entry=>entry.key===key);return;
      }
      const item=document.createElement('div');item.className='recent-discard-card';
      item.dataset.cardKey=key;
      item.style.order=entries.findIndex(entry=>entry.key===key);
      item.append(cardFor(pathFor('discard',key),value,'discard-area-card recent-public-card'));
      const take=document.createElement('button');take.className='text-action';take.textContent='收入手牌';take.dataset.takeDiscard=pathFor('discard',key);take.disabled=busy||!controller.currentPlayer;
      const action=sourceByKey.get(key);
      if(action){const source=document.createElement('small');source.className='discard-action-indicator';source.textContent=action;item.append(source);}
      item.append(take);recentList.append(item);
    });
    if(!entries.length){const empty=document.createElement('div');empty.className='public-empty';empty.innerHTML='<b>暂无弃牌</b><small>打出、弃置或展示／判定的牌会显示在这里</small>';recentList.append(empty);}
    host.querySelector('.discard-count').textContent=entries.length;
    if(animate)(0,_cardInsertionAnimation_js__WEBPACK_IMPORTED_MODULE_4__.animateCardInsertions)(recentList.querySelectorAll('.recent-discard-card'),previous,keyFor);
    if(discardDialog.open)renderDiscardDialog(entries);
  }
  function renderDiscardDialog(entries=(0,_cardOrder_mjs__WEBPACK_IMPORTED_MODULE_1__.orderedEntries)(discard).reverse()){
    const grid=discardDialog.querySelector('.discard-grid');grid.replaceChildren();
    entries.forEach(({key,value})=>{
      const item=document.createElement('div');item.className='discard-grid-item';
      item.append(cardFor(pathFor('discard',key),value,'discard-area-card discard-public-tile'));
      const take=document.createElement('button');take.className='text-action';take.textContent='收入手牌';take.dataset.takeDiscard=pathFor('discard',key);take.disabled=busy||!controller.currentPlayer;
      item.append(take);grid.append(item);
    });
    if(!entries.length)grid.innerHTML='<p>暂无弃牌</p>';
    discardDialog.querySelector('h2').textContent=`弃牌堆 · 全部 ${entries.length} 张`;
  }
  function renderDeck(){
    const count=deckEntries().length,empty=count===0;
    host.querySelector('.public-deck-count').textContent=count;
    drawSplit.hidden=empty;host.querySelector('[data-public-action="reveal"]').hidden=empty;host.querySelector('[data-public-action="expand"]').hidden=empty;
    const shuffle=host.querySelector('[data-public-action="shuffle"]');shuffle.hidden=!empty;shuffle.disabled=busy||!Object.keys(discard).length;
    host.querySelectorAll('[data-public-action="draw"]').forEach(button=>button.disabled=busy||!controller.currentPlayer||count<Number(button.dataset.count));
    drawToggle.disabled=busy||!controller.currentPlayer||count<2;
    host.querySelector('[data-public-action="reveal"]').disabled=busy||!controller.currentPlayer||!count;
    host.querySelector('[data-public-action="expand"]').disabled=busy||!controller.currentPlayer||!count;
  }
  function setDrawOpen(open){drawOptions.hidden=!open;drawToggle.setAttribute('aria-expanded',String(open));}
  async function run(action){if(busy)return;busy=true;renderDeck();renderDiscard();try{await action();}catch(error){window.alert(error.message||'操作失败，请重试');}finally{busy=false;renderDeck();renderDiscard();}}

  function openSort(){
    const cards=deckEntries();draft={initial:cards.slice(),top:cards.slice(),bottom:[],draw:[],viewed:new Set()};renderSort();sortDialog.showModal();
  }
  function sortLane(key,title){
    const section=document.createElement('section');section.className=`sort-lane sort-${key}`;section.innerHTML=`<h3>${title}</h3>`;
    if(!draft[key].length)section.insertAdjacentHTML('beforeend','<p class="muted">暂无卡牌</p>');
    draft[key].forEach((item,index)=>{
      const row=document.createElement('div');row.className='sort-row';
      row.append(cardFor(item.path,item.value,'pai-area-card sort-public-tile',draft.viewed.has(item.path)));
      if(key==='top'){
        const actions=document.createElement('div');actions.className='sort-row-actions';
        const specs=[['观看','view'],['↑','up'],['↓','down'],['放牌底','bottom'],['摸牌','draw']];
        specs.forEach(([label,action])=>{const button=document.createElement('button');button.textContent=label;button.dataset.sortAction=action;button.dataset.index=index;button.disabled=action==='view'?draft.viewed.has(item.path):action==='up'?index===0:action==='down'?index===draft.top.length-1:false;actions.append(button);});
        row.append(actions);
      }
      section.append(row);
    });
    return section;
  }
  function renderSort(){
    sortDialog.replaceChildren();
    const header=document.createElement('header');header.innerHTML='<h2>展开牌堆 · 调整顺序</h2><button data-dialog-close>关闭 ×</button>';
    const intro=document.createElement('p');intro.innerHTML='<span class="privacy">仅你可见</span> 在牌顶列观看、排序或分配卡牌，确认后一次生效。';
    const lanes=document.createElement('div');lanes.className='deck-sort-lanes';lanes.append(sortLane('top','牌顶列 · 从上到下'),sortLane('bottom','牌底列'),sortLane('draw','确认摸牌列'));
    const note=document.createElement('p');note.className='muted';note.textContent='牌底列和确认摸牌列为结果区；放错时可重置排列。';
    const footer=document.createElement('footer');footer.innerHTML=`<button data-sort-reset>重置排列</button><span></span><button data-dialog-close>取消</button><button class="primary" data-sort-commit>确认顺序并摸牌${draft.draw.length?`（${draft.draw.length}）`:''}</button>`;
    sortDialog.append(header,intro,lanes,note,footer);
  }

  host.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||button.disabled)return;
    if(button===drawToggle){setDrawOpen(drawOptions.hidden);return;}
    if(!button.closest('.draw-options'))setDrawOpen(false);
    if(button.dataset.takeDiscard)return run(()=>controller.takeDiscardCards([button.dataset.takeDiscard]));
    const action=button.dataset.publicAction;
    if(action==='draw')return run(()=>controller.drawTopCards(Number(button.dataset.count)));
    if(action==='reveal')return run(()=>controller.revealTopCard());
    if(action==='shuffle')return run(()=>controller.resetPai());
    if(action==='expand')return openSort();
    if(action==='all-discard'){renderDiscardDialog();discardDialog.showModal();}
  });
  discardDialog.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;if(button.hasAttribute('data-dialog-close'))discardDialog.close();else if(button.dataset.takeDiscard)run(()=>controller.takeDiscardCards([button.dataset.takeDiscard]));});
  sortDialog.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button||button.disabled)return;
    if(button.hasAttribute('data-dialog-close')){sortDialog.close();draft=null;return;}
    if(button.hasAttribute('data-sort-reset')){draft.top=draft.initial.slice();draft.bottom=[];draft.draw=[];renderSort();return;}
    if(button.hasAttribute('data-sort-commit')){const payload={top:draft.top.map(x=>x.path),bottom:draft.bottom.map(x=>x.path),draw:draft.draw.map(x=>x.path)};return run(async()=>{await controller.rearrangeDeck(payload);sortDialog.close();draft=null;});}
    const index=Number(button.dataset.index),action=button.dataset.sortAction,item=draft.top[index];if(!item)return;
    if(action==='view')draft.viewed.add(item.path);
    else if(action==='up')[draft.top[index-1],draft.top[index]]=[draft.top[index],draft.top[index-1]];
    else if(action==='down')[draft.top[index+1],draft.top[index]]=[draft.top[index],draft.top[index+1]];
    else if(action==='bottom')draft.bottom.push(...draft.top.splice(index,1));
    else if(action==='draw')draft.draw.push(...draft.top.splice(index,1));
    renderSort();
  });
  sortDialog.addEventListener('cancel',()=>{draft=null;});
  const closeDraw=event=>{if(!event.composedPath().includes(drawSplit))setDrawOpen(false);};document.addEventListener('click',closeDraw);
  const refreshPlayer=()=>{renderDeck();renderDiscard();};table.addEventListener('player-seat-changed',refreshPlayer);
  const subscriptions=[
    (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.onValue)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(db,`${prefix}/tableDecks/pai/cards`),snapshot=>{deckTop=snapshot.val()||{};renderDeck();}),
    (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.onValue)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(db,`${prefix}/tableDecks/paiBottom/cards`),snapshot=>{deckBottom=snapshot.val()||{};renderDeck();}),
    (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.onValue)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(db,`${prefix}/runtime/a`),snapshot=>{const hint=(0,_localActionLog_mjs__WEBPACK_IMPORTED_MODULE_2__.decodeActionHint)(snapshot.val());if(!hintInitialized){hintInitialized=true;lastHint=hint;lastHintNonce=hint?.nonce||null;}else lastHint=hint;classifyPending();}),
    (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.onValue)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(db,`${prefix}/tableDecks/discard/cards`),snapshot=>{
      const next=snapshot.val()||{},keys=new Set(Object.keys(next));
      const added=previousDiscardKeys!==null&&[...keys].some(key=>!previousDiscardKeys.has(key));
      if(previousDiscardKeys!==null)keys.forEach(key=>{if(!previousDiscardKeys.has(key))pendingDiscardKeys.add(key);});
      previousDiscardKeys=keys;discard=next;[...sourceByKey.keys()].forEach(key=>{if(!keys.has(key))sourceByKey.delete(key);});renderDiscard(added);classifyPending();
    }),
  ];
  renderDeck();renderDiscard();
  return()=>{subscriptions.forEach(unsubscribe=>unsubscribe());document.removeEventListener('click',closeDraw);table.removeEventListener('player-seat-changed',refreshPlayer);discardDialog.remove();sortDialog.remove();};
}


/***/ }),

/***/ "./src/wc/sgArea.js":
/*!**************************!*\
  !*** ./src/wc/sgArea.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SgArea: () => (/* binding */ SgArea)
/* harmony export */ });
/* harmony import */ var firebase_database__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! firebase/database */ "./docs/sango-design-memory.cjs");
/* harmony import */ var _sgCard_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./sgCard.js */ "./src/wc/sgCard.js");
/* harmony import */ var _css_common_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./css/common.css */ "./src/wc/css/common.css");
/* harmony import */ var _css_sgArea_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./css/sgArea.css */ "./src/wc/css/sgArea.css");
/* harmony import */ var _cardOrder_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../cardOrder.mjs */ "./src/cardOrder.mjs");
/* harmony import */ var _cardInsertionAnimation_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./cardInsertionAnimation.js */ "./src/wc/cardInsertionAnimation.js");








class SgArea extends HTMLElement {
  deckRef;
  shadowRoot;
  gameController;
  style;
  areaType;
  cardArea;
  cardsRef;
  dbPathStr;
  isTable;
  cards = {};

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });

    this.style = document.createElement("style");
    this.style.append(_css_common_css__WEBPACK_IMPORTED_MODULE_2__["default"]);
    this.style.append(_css_sgArea_css__WEBPACK_IMPORTED_MODULE_3__["default"]);

    this.warpper = document.createElement("div");
    this.warpper.classList.add("wrapper");
    this.warpper.setAttribute("part", "wrapper");

    this.cardArea = document.createElement("div");
    this.cardArea.classList.add("card-area");
    this.cardArea.setAttribute("part", "card-area");
    this.cardArea.setAttribute("name", "card-area");

    this.controlArea = document.createElement("div");
    this.controlArea.classList.add("control-area");
    this.controlArea.setAttribute("part", "control-area");
    const shuffleButton = document.createElement("button");
    shuffleButton.innerHTML = "洗";
    shuffleButton.addEventListener("click", () => {
      this.shuffle();
    });
    this.controlArea.appendChild(shuffleButton);
    this.recycleBtn = document.createElement("button");
    this.recycleBtn.innerHTML = "收";
    this.recycleBtn.addEventListener("click", () => {
      this.recycle();
    });
    this.controlArea.appendChild(this.recycleBtn);

    this.shadowRoot.append(this.style);
    this.warpper.append(this.cardArea);
    this.warpper.append(this.controlArea);
    this.shadowRoot.append(this.warpper);
  }

  getAreaName() {
    switch (this.areaType) {
      case "jiang-area":
        return "将";
      case "pai-area":
        return "牌";
      case "zhuang-area":
        return "装";
      case "hand-area":
        return "牌";
      case "other1-area":
        return "区1";
      case "other2-area":
        return "区2";
    }
  }

  enableOverflowControls() {
    if (this.expandButton) return;
    this.classList.add('overflow-controls');
    this.expandButton = document.createElement('button');
    this.expandButton.className = 'expand-area';
    this.expandButton.type = 'button';
    this.expandButton.innerHTML = '<span class="area-label"></span><span class="expand-label">展开 ↗</span>';
    this.expandButton.setAttribute('aria-expanded', 'false');
    this.expandButton.addEventListener('click', () => this.expandAll());
    this.scrollButtons = [-1, 1].map(direction => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'area-scroll ' + (direction < 0 ? 'scroll-left' : 'scroll-right');
      button.textContent = direction < 0 ? '‹' : '›';
      button.setAttribute('aria-label', direction < 0 ? '向左滚动' : '向右滚动');
      button.hidden = true;
      button.addEventListener('click', () => this.cardArea.scrollBy({left: direction * Math.max(100, this.cardArea.clientWidth * .7), behavior: 'smooth'}));
      return button;
    });
    this.expandedHeading = document.createElement('header');
    this.expandedHeading.className = 'expanded-heading';
    this.expandedHeading.innerHTML = '<strong></strong><button type="button">收起</button>';
    this.expandedHeading.querySelector('button').onclick = () => this.warpper.hidePopover();
    this.warpper.prepend(this.expandedHeading);
    this.warpper.append(this.expandButton, ...this.scrollButtons);
    this.updateOverflow = () => {
      const name = this.areaType === 'hand-area' ? '手牌' : this.getAreaName();
      this.expandButton.querySelector('.area-label').textContent = name;
      this.expandButton.setAttribute('aria-label', `展开全部${name}`);
      this.expandedHeading.querySelector('strong').textContent = `${name} · 全部卡牌`;
      const max = this.cardArea.scrollWidth - this.cardArea.clientWidth;
      this.scrollButtons.forEach((button, i) => {
        const atEdge = i === 0 ? this.cardArea.scrollLeft <= 1 : this.cardArea.scrollLeft >= max - 1;
        button.hidden = this.expanded || max <= 1 || this.cardArea.clientWidth === 0 || atEdge;
      });
    };
    this.cardArea.addEventListener('scroll', this.updateOverflow, {passive: true});
    this.cardArea.addEventListener('wheel', event => {
      if (this.expanded || event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      const before = this.cardArea.scrollLeft;
      this.cardArea.scrollLeft += event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? this.cardArea.clientWidth : 1);
      if (before !== this.cardArea.scrollLeft) event.preventDefault();
    }, {passive: false});
    this.addEventListener('cards-updated', () => requestAnimationFrame(this.updateOverflow));
    this.warpper.addEventListener('toggle', event => {
      if (event.newState !== 'closed' || !this.expanded) return;
      this.expanded = false;
      this.warpper.removeAttribute('popover');
      this.warpper.setAttribute('part', 'wrapper');
      this.cardArea.setAttribute('part', 'card-area');
      this.expandButton.setAttribute('aria-expanded', 'false');
      this.cardArea.scrollTop = 0;
      requestAnimationFrame(() => {
        this.cardArea.scrollLeft = this.savedScrollLeft;
        this.updateOverflow();
      });
      this.expandButton.focus({preventScroll: true});
    });
    this.overflowObserver = new ResizeObserver(this.updateOverflow);
    this.overflowObserver.observe(this.cardArea);
    this.updateOverflow();
  }

  expandAll() {
    if (this.expanded) return;
    this.savedScrollLeft = this.cardArea.scrollLeft;
    this.expanded = true;
    // Keep the live card nodes in place, preserving selection, subscriptions and drag targets.
    this.warpper.setAttribute('part', 'expanded-wrapper');
    this.cardArea.setAttribute('part', 'expanded-card-area');
    this.warpper.setAttribute('popover', 'auto');
    this.warpper.showPopover();
    this.cardArea.scrollTop = this.cardArea.scrollLeft = 0;
    this.expandButton.setAttribute('aria-expanded', 'true');
    this.updateOverflow();
    this.expandedHeading.querySelector('button').focus();
  }

  connectedCallback() {
    this.overflowObserver?.observe(this.cardArea);
  }

  disconnectedCallback() {
    this.overflowObserver?.disconnect();
    queueMicrotask(() => {
      if (!this.isConnected) {
        this.unSub?.();
        this.unSub = null;
      }
    });
  }

  init(deckRef, gameController, options = {}) {
    this.deckRef = deckRef;
    this.dbPathStr = deckRef.toString();
    this.cardsRef = (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(deckRef, "/cards");
    this.areaType = deckRef.key + "-area";
    this.gameController = gameController;
    this.isTable = this.gameController.isTableItem(this.deckRef);
    this.cardCount = 0;

    this.classList.add(this.areaType);
    if (this.isTableArea()) {
      this.classList.add("table-area");
    }

    this.subscribeCards = () => {
      if (this.unSub) return;
      let initialized=false;
      this.unSub = (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.onValue)(this.cardsRef, snapshot => {
      const animate=initialized&&this.classList.contains('current-player')&&['hand-area','other1-area','other2-area'].includes(this.areaType);
      const keyFor=card=>card.cardRef.key;
      const previous=animate?(0,_cardInsertionAnimation_js__WEBPACK_IMPORTED_MODULE_5__.captureCardPositions)(Object.values(this.cards),keyFor):null;
      const entries = (0,_cardOrder_mjs__WEBPACK_IMPORTED_MODULE_4__.orderedEntries)(snapshot.val() || {}, this.areaType === 'pan-area');
      const keys = new Set(entries.map(item => item.key));
      Object.entries(this.cards).forEach(([key, card]) => {
        if (!keys.has(key)) { card.remove(); delete this.cards[key]; }
      });
      entries.forEach(({key, value}, index) => {
        let card = this.cards[key];
        if (!card) {
          card = document.createElement('sg-card');
          card.className = this.areaType + '-card';
          if (this.classList.contains('current-player')) card.classList.add('current-player');
          card.init((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(this.cardsRef, key), value, this.gameController, {subscribe:false});
          this.cards[key] = card;
          this.cardArea.append(card);
        }
        card.cardData = value;
        card.renderCard();
        card.style.order = index;
      });
      this.cardCount = entries.length;
      initialized=true;
      if(previous)(0,_cardInsertionAnimation_js__WEBPACK_IMPORTED_MODULE_5__.animateCardInsertions)(Object.values(this.cards),previous,keyFor);
      this.classList.toggle('has-cards', this.cardCount > 0);
      this.dispatchEvent(new CustomEvent('cards-updated', {bubbles: true, composed: true}));
      });
    };
    if (options.subscribe !== false) this.subscribeCards();
    this.addEventListener("drop", (e) => {
      e.preventDefault();
      console.log("areaDrop");
      const fromPath = e.dataTransfer.getData("text");

      if (fromPath.includes("/jiang")) {
        return;
      }
      // is in selected wc
      let isSelected = false;
      for (let i = 0; i < this.gameController.selectedCards.length; i++) {
        const wc = this.gameController.selectedCards[i];
        if (wc.cardRef.toString().includes(fromPath)) {
          isSelected = true;
          break;
        }
      }

      if (!isSelected) {
        this.gameController.moveCardFromPathToRef(
          fromPath,
          (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(this.deckRef, "/cards")
        );
      } else {
        this.gameController.dropSeletedCards((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(this.deckRef, "/cards"));
      }
    });
    this.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
  }

  stopCardsSubscription() {
    this.unSub?.();
    this.unSub = null;
    Object.values(this.cards).forEach(card => card.remove());
    this.cards = {};
  }

  visibilityCheck() {
    if (!this.cardArea.hasChildNodes()) {
      this.warpper.classList.add("hide");
    } else {
      this.warpper.classList.remove("hide");
    }
  }

  isTableArea() {
    return this.deckRef.parent.key == "tableDecks";
  }

  shuffle() {
    this.gameController.shuffleDeck(this.deckRef);
  }

  recycle() {
    this.gameController.recycle(this.cardsRef);
  }
}


customElements.define("sg-area", SgArea);


/***/ }),

/***/ "./src/wc/sgCard.js":
/*!**************************!*\
  !*** ./src/wc/sgCard.js ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var firebase_database__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! firebase/database */ "./docs/sango-design-memory.cjs");
/* harmony import */ var _data_pai_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../data/pai.json */ "./src/data/pai.json");
/* harmony import */ var _css_sgCard_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./css/sgCard.css */ "./src/wc/css/sgCard.css");
/* harmony import */ var _css_common_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./css/common.css */ "./src/wc/css/common.css");





const template = document.createElement("template");
const css = `
${_css_common_css__WEBPACK_IMPORTED_MODULE_3__["default"]}
${_css_sgCard_css__WEBPACK_IMPORTED_MODULE_2__["default"]} 
`;
template.innerHTML = `
<style>
${css}
</style>
<div name="widget" class="card-block">
  <div class="card-widget" part="card-widget">
    <div class="card-front" part="card-front">
      <div class="card-suit"><span name="pai-rank"></span></div>
      <div class ="info-line"><span class="pai-name"></span></div>
      <div class="info-line desc-line"><span class="pai-desc"></span></div>
    </div>
    <div class="card-back" part="card-back"></div>
  </div>
</div>
`;

class SgCard extends HTMLElement {
  cardRef;
  cardData;
  shadowRoot;
  gameController;
  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });
    let clone = template.content.cloneNode(true);

    this.shadowRoot.append(clone);
    this.cardFront = this.shadowRoot.querySelector("div[name='card-front']");
    this.cardControlWidget = this.shadowRoot.querySelector(
      `div[name="card-controls"]`
    );
  }

  discardPai() {
    return this.gameController.moveCardToTableDeck(this.cardRef, "discard");
  }

  drawPai() {
    // move pai to hand
    if (this.gameController.currentPlayer) {
      return this.gameController.moveCardToPlayerArea(
        this.cardRef,
        this.gameController.currentPlayer,
        "hand"
      );
    }
  }

  showPai() {
    console.log("showPai");
    if (this.cardData.show != "1") {
      this.gameController.showCard(this.cardRef);
    } else {
      this.gameController.resetCard(this.cardRef);
    }
  }

  init(cardRef, cardData, gameController, options = {}) {
    this.cardRef = cardRef;
    this.cardData = cardData;
    this.gameController = gameController;

    if (options.subscribe !== false) {
      this.unSub = (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.onValue)(this.cardRef, (snapshot) => {
        if (snapshot.exists()) {
          this.cardData = snapshot.val();
          this.renderCard();
        }
      });
    }

    const cardPathUrl = this.cardRef.toString();
    const dbPathUrl = (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.gameController.db).toString();
    const cardPath = cardPathUrl.replace(dbPathUrl, "");
    this.dataset.path = cardPath;
    this.setAttribute("draggable", "false");
    this.addEventListener("dragstart", (e) => {
      // Pointer drag is implemented by cardDrag.js; never fall back to native text/card dragging.
      e.preventDefault();
    });
    // this.addEventListener("touchstart", (e) => {
    //   console.log("touch");
    // });
    this.addEventListener("touchmove", (e) => {
      console.log("touchmoveCard");
    });
    this.initControls();
  }

  renderCard() {
    const itemData = _data_pai_json__WEBPACK_IMPORTED_MODULE_1__[this.cardData.id];
    const itemSuit = itemData.suit;
    const itemRank = itemData.rank;
    const itemDesc = itemData.desc;
    const itemName = itemData.name;
    this.classList.toggle("has-desc", Boolean(itemDesc));
    const judgmentEffects = {
      "乐不思蜀": "乐",
      "兵粮寸断": "兵",
      "闪电": "电",
    };
    const effect = this.cardData.judgmentEffect || itemName;
    this.dataset.effect = judgmentEffects[effect] || '?';
    if (this.dataset.path?.includes('/pan/cards/')) this.title = `${effect} · 原牌：${itemName}`;

    const rankSpan = this.shadowRoot.querySelector(`span[name="pai-rank"]`);
    const descSpan = this.shadowRoot.querySelector(".pai-desc");
    const nameSpan = this.shadowRoot.querySelector(".pai-name");

    rankSpan.innerHTML = itemRank;

    rankSpan.className = itemSuit;
    nameSpan.innerHTML = itemName;
    if (itemDesc) {
      descSpan.innerHTML = itemDesc;
    } else {
      descSpan.innerHTML = "<wbr>";
    }

    if (this.cardData.show == "1") {
      this.shadowRoot.querySelector(".card-block").classList.add("show-front");
    } else if (this.cardData.show == "0") {
      this.shadowRoot
        .querySelector(".card-block")
        .classList.remove("show-front");
    }
  }

  selectCard() {
    const cardBlock = this.shadowRoot.querySelector(".card-block");
    this.gameController.addSelectedCard(this);
    if (!cardBlock.classList.contains("selected")) {
      cardBlock.classList.add("selected");
    }
  }
  unselectCard() {
    const cardBlock = this.shadowRoot.querySelector(".card-block");
    cardBlock.classList.remove("selected");
    this.gameController.removeSelectedCard(this);
  }

  initControls() {
    const cardBlock = this.shadowRoot.querySelector(".card-block");

    cardBlock.addEventListener("click", (e) => {
      // const rect = e.target.getBoundingClientRect();
      // const x = e.clientX - rect.left; //x position within the element.
      // const y = e.clientY - rect.top; //y position within the element.
      if (cardBlock.classList.contains("selected")) {
        this.unselectCard();
        // if (y < rect.height / 2) {
        //   console.log("click top");
        // } else {
        //   console.log("click bot");
        // }
      } else {
        this.selectCard();
      }
      // console.log("Left? : " + x + " ; Top? : " + y + ".");
    });
  }

  disconnectedCallback() {
    queueMicrotask(() => {
      if (this.isConnected) return;
      this.gameController.removeSelectedCard(this);
      this.unSub?.();
      this.unSub = null;
    });
  }

  getPlayerAreaLi(playerKey) {
    const zhuang = document.createElement("li");
    zhuang.innerHTML = "装";
    zhuang.dataset.path =
      this.gameController.getPlayerPath(playerKey) + "/zhuang";
    zhuang.addEventListener("click", () => {
      this.gameController.moveCardToPlayerArea(
        this.cardRef,
        playerKey,
        "zhuang"
      );
    });

    const pan = document.createElement("li");
    pan.innerHTML = "判";
    pan.dataset.path = this.gameController.getPlayerPath(playerKey) + "/pan";
    pan.addEventListener("click", () => {
      this.gameController.moveCardToPlayerArea(this.cardRef, playerKey, "pan");
    });

    const other1 = document.createElement("li");
    other1.innerHTML = "区1";
    other1.dataset.path =
      this.gameController.getPlayerPath(playerKey) + "/other1";
    other1.addEventListener("click", () => {
      this.gameController.moveCardToPlayerArea(
        this.cardRef,
        playerKey,
        "other1"
      );
    });

    const other2 = document.createElement("li");
    other2.innerHTML = "区2";
    other2.dataset.path =
      this.gameController.getPlayerPath(playerKey) + "/other2";
    other2.addEventListener("click", () => {
      this.gameController.moveCardToPlayerArea(
        this.cardRef,
        playerKey,
        "other2"
      );
    });
    return [zhuang, pan, other1, other2];
  }
}

customElements.define("sg-card", SgCard);


/***/ }),

/***/ "./src/wc/sgHpbar.js":
/*!***************************!*\
  !*** ./src/wc/sgHpbar.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var firebase_database__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! firebase/database */ "./docs/sango-design-memory.cjs");
/* harmony import */ var _css_common_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./css/common.css */ "./src/wc/css/common.css");
/* harmony import */ var _css_sgHpbar_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./css/sgHpbar.css */ "./src/wc/css/sgHpbar.css");




const template = document.createElement("template");
template.innerHTML = `
<style>
${_css_sgHpbar_css__WEBPACK_IMPORTED_MODULE_2__["default"]}
${_css_common_css__WEBPACK_IMPORTED_MODULE_1__["default"]}
</style>
<dialog class="max-hp-picker" aria-label="选择体力上限">
  <div class="picker-heading">
    <strong>选择体力上限</strong>
    <button class="picker-close" title="关闭" aria-label="关闭">×</button>
  </div>
  <div class="picker-grid"></div>
</dialog>
<button class="cur-hp-btn reduce-hp-btn" title="失去一点体力" aria-label="失去一点体力">−</button>
<span class="hp-bar">
  <span>[心]</span>
  <span>[心]</span>
  <span>[ ]</span>
  <span>[ ]</span>
</span>
<span class="numeric-hp" aria-live="polite">HP 0/0</span>
<button class="cur-hp-btn add-hp-btn" title="回复一点体力" aria-label="回复一点体力">＋</button>

`;

class sgHpBar extends HTMLElement {
  shadowRoot;
  gameController;
  hpRef;
  cur;
  max;
  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });
    let clone = template.content.cloneNode(true);
    this.shadowRoot.append(clone);

    const pickerGrid = this.shadowRoot.querySelector(".picker-grid");
    for (let hp = 1; hp <= 15; hp++) {
      const option = document.createElement("button");
      option.className = "max-hp-option";
      option.type = "button";
      option.textContent = hp;
      option.dataset.maxHp = hp;
      option.addEventListener("click", () => {
        this.setMax(hp);
        this.closeMaxPicker();
      });
      pickerGrid.appendChild(option);
    }
  }

  init(hpRef, gameController) {
    this.gameController = gameController;
    this.hpRef = hpRef;
    this.shadowRoot
      .querySelector(".picker-close")
      .addEventListener("click", () => {
        this.closeMaxPicker();
      });
    this.shadowRoot
      .querySelector(".reduce-hp-btn")
      .addEventListener("click", () => {
        this.updateCurHp(Number(this.cur) - 1);
      });
    this.shadowRoot
      .querySelector(".add-hp-btn")
      .addEventListener("click", () => {
        this.updateCurHp(Math.min(Number(this.max), Number(this.cur) + 1));
      });

    // add HP change listener.
    this.unSub = (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.onValue)(hpRef, (snapshot) => {
      if (snapshot.exists()) {
        const hpVal = snapshot.val();
        const splits = hpVal.split("/");
        this.cur = Number(splits[0]);
        this.max = Number(splits[1]);
        this.renderHp();
      }
    });
  }

  disconnectedCallback() {
    queueMicrotask(() => {
      if (!this.isConnected) {
        this.unSub?.();
        this.unSub = null;
      }
    });
  }

  renderHp() {
    const hpBarSpan = this.shadowRoot.querySelector(".hp-bar");

    this.shadowRoot.querySelectorAll(".max-hp-option").forEach((option) => {
      const selected = Number(option.dataset.maxHp) === this.max;
      option.classList.toggle("selected", selected);
      option.setAttribute("aria-current", selected ? "true" : "false");
    });
    this.shadowRoot.querySelector(
      ".numeric-hp"
    ).textContent = `HP ${this.cur}/${this.max}`;
    hpBarSpan.classList.add("compact");
    hpBarSpan.setAttribute("aria-label", `当前体力 ${this.cur}，上限 ${this.max}`);
    hpBarSpan.innerHTML = "";

    const heart = document.createElement("span");
    heart.className = "large-heart";
    heart.textContent = "♥";
    const count = document.createElement("span");
    count.className = "heart-count";
    count.textContent = `${this.cur} / ${this.max}`;
    hpBarSpan.append(heart, count);
  }

  updateCurHp(i) {
    if (i < 0) {
      i = 0;
    }
    return this.gameController.setScalarValue(this.hpRef, `${i}/${this.max}`);
  }

  openMaxPicker() {
    const picker = this.shadowRoot.querySelector(".max-hp-picker");
    if (!this.classList.contains("current-player") || picker.open) return;
    picker.showModal();
    const selected = picker.querySelector(`[data-max-hp="${this.max}"]`);
    selected?.focus();
  }

  closeMaxPicker() {
    const picker = this.shadowRoot.querySelector(".max-hp-picker");
    if (picker.open) picker.close();
  }

  setMax(value) {
    const newMax = Math.max(1, Math.min(15, Number(value)));
    const newCur = Math.min(this.cur, newMax);
    return this.gameController.setScalarValue(this.hpRef, `${newCur}/${newMax}`);
  }
}

customElements.define("sg-hpbar", sgHpBar);


/***/ }),

/***/ "./src/wc/sgJiang.js":
/*!***************************!*\
  !*** ./src/wc/sgJiang.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var firebase_database__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! firebase/database */ "./docs/sango-design-memory.cjs");
/* harmony import */ var _data_jiang_json__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../data/jiang.json */ "./src/data/jiang.json");
/* harmony import */ var _css_common_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./css/common.css */ "./src/wc/css/common.css");
/* harmony import */ var _css_sgJiang_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./css/sgJiang.css */ "./src/wc/css/sgJiang.css");






const template = document.createElement("template");
const css = `
${_css_common_css__WEBPACK_IMPORTED_MODULE_2__["default"]}
${_css_sgJiang_css__WEBPACK_IMPORTED_MODULE_3__["default"]}
`;
template.innerHTML = `
<style>
${css}
</style>
<div class="card-block">
  <div class="card-front">
    <div class="jiang-desc">
      <img class="general-art" alt="" />
      <span class="faction-badge"></span>
      <div class="info-line">
        <span class="jiang-name"></span>
        <span class="jiang-gender"></span>
      </div>
    </div>
  </div>
  <div class="card-back">
    <p>将</p>
  </div>
  <button class="show-ctrl" name="show-btn" type="button" title="亮将">
    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.7"/></svg>
    <span class="sr-only">亮将</span>
  </button>
  <button class="select-ctrl" name="select-btn" type="button">选择</button>
  <button class="detail-ctrl" name="detail-btn" type="button" aria-label="查看武将技能">查看技能</button>
</div>
<dialog class="general-detail" aria-label="武将详情">
  <article>
    <header>
      <div class="detail-title">
        <span class="detail-force"></span>
        <h3 class="detail-name"></h3>
        <span class="detail-gender"></span>
      </div>
      <button class="detail-close" type="button" aria-label="关闭武将详情">×</button>
    </header>
    <div class="detail-body">
      <img class="detail-art" alt="" />
      <div class="detail-content">
        <dl>
          <div><dt>势力</dt><dd class="detail-force-text"></dd></div>
          <div><dt>体力</dt><dd class="detail-hp"></dd></div>
          <div><dt>性别</dt><dd class="detail-gender-text"></dd></div>
        </dl>
        <section class="detail-skills">
          <h4>技能</h4>
          <div class="detail-skill-list"></div>
        </section>
      </div>
    </div>
  </article>
</dialog>
`;
class SgJiang extends HTMLElement {
  cardRef;
  cardData;
  shadowRoot;
  gameController;
  unSub;
  generalLocked = false;
  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: "open" });
    let clone = template.content.cloneNode(true);

    this.shadowRoot.append(clone);
    this.cardDescWidget = this.shadowRoot.querySelector(
      "div[name='jiang-desc']"
    );
  }

  discardJiang() {
    this.gameController.moveCardToTableDeck(this.cardRef, "jiang");
  }

  drawJiang() {
    // move pai to hand
    if (this.gameController.currentPlayer) {
      this.gameController.moveCardToPlayerArea(
        this.cardRef,
        this.gameController.currentPlayer,
        "jiang"
      );
    }
  }

  showJiang() {
    if (this.cardData.show != "1") {
      this.gameController.showCard(this.cardRef);
    } else {
      this.gameController.resetCard(this.cardRef);
    }
  }

  init(cardRef, cardData, gameController, options = {}) {
    this.cardRef = cardRef;
    this.cardData = cardData;
    this.gameController = gameController;

    if (options.subscribe !== false) {
      this.unSub = (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.onValue)(this.cardRef, (snapshot) => {
        if (snapshot.exists()) {
          this.cardData = snapshot.val();
          this.renderCard();
        }
      });
    }

    const cardPathUrl = this.cardRef.toString();
    const dbPathUrl = (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.gameController.db).toString();
    const cardPath = cardPathUrl.replace(dbPathUrl, "");
    this.dataset.path = cardPath;
    this.setAttribute("draggable", "false");

    this.initControls();
  }

  renderCard() {
    const jiang = _data_jiang_json__WEBPACK_IMPORTED_MODULE_1__[this.cardData.id];
    const genderSpan = this.shadowRoot.querySelector(".jiang-gender");
    const nameSpan = this.shadowRoot.querySelector(".jiang-name");
    const frontDiv = this.shadowRoot.querySelector(".card-front");
    const generalArt = this.shadowRoot.querySelector(".general-art");
    generalArt.src = new URL(`imgs/${this.cardData.id}.jpg`, document.baseURI).href;
    generalArt.alt = jiang.name;
    const factionBadge = this.shadowRoot.querySelector(".faction-badge");
    factionBadge.textContent = jiang.force;
    factionBadge.setAttribute("aria-label", `${jiang.force}阵营`);

    nameSpan.innerHTML = jiang.name;
    const isMale = jiang.gender == "M";
    const genderSymbol = isMale ? "♂" : "♀";
    const genderText = isMale ? "男" : "女";
    genderSpan.textContent = genderSymbol;

    switch (jiang.force) {
      case "魏":
        frontDiv.className = "card-front wei";
        break;
      case "蜀":
        frontDiv.className = "card-front shu";
        break;
      case "吴":
        frontDiv.className = "card-front wu";
        break;
      default:
        frontDiv.className = "card-front qun";
        break;
    }

    const detailDialog = this.shadowRoot.querySelector(".general-detail");
    detailDialog.className = `general-detail ${frontDiv.classList[1] || "qun"}`;
    this.shadowRoot.querySelector(".detail-force").textContent = jiang.force;
    this.shadowRoot.querySelector(".detail-force-text").textContent = jiang.force;
    this.shadowRoot.querySelector(".detail-name").textContent = jiang.name;
    this.shadowRoot.querySelector(".detail-gender").textContent = genderSymbol;
    this.shadowRoot.querySelector(".detail-gender-text").textContent =
      `${genderText} ${genderSymbol}`;
    this.shadowRoot.querySelector(".detail-hp").textContent = `${jiang.health} 点`;
    const detailArt = this.shadowRoot.querySelector(".detail-art");
    detailArt.src = generalArt.src;
    detailArt.alt = jiang.name;

    const skillList = this.shadowRoot.querySelector(".detail-skill-list");
    skillList.innerHTML = "";
    (jiang.skill || "暂无技能说明").split("/").forEach((skill) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = skill.trim();
      skillList.appendChild(paragraph);
    });

    frontDiv.tabIndex = 0;
    frontDiv.setAttribute("role", "button");
    frontDiv.setAttribute("aria-label", `查看${jiang.name}的武将详情`);

    if (this.cardData.show == "1") {
      this.shadowRoot.querySelector(".card-block").classList.add("show-front");
    } else if (this.cardData.show == "0") {
      this.shadowRoot
        .querySelector(".card-block")
        .classList.remove("show-front");
    }
    const showButton = this.shadowRoot.querySelector(
      `button[name="show-btn"]`
    );
    const revealed = this.cardData.show == "1";
    showButton.classList.toggle("revealed", revealed);
    showButton.title = revealed ? "暗置" : "亮将";
    showButton.querySelector(".sr-only").textContent = revealed ? "暗置" : "亮将";
    showButton.setAttribute(
      "aria-label",
      revealed ? "将此武将暗置" : "亮将给其他玩家查看"
    );
  }

  initControls() {
    const cardFront = this.shadowRoot.querySelector(".card-front");
    cardFront.addEventListener("click", () => {
      if (this.classList.contains("selection-card")) {
        this.dispatchEvent(new CustomEvent("select-general", { bubbles: true, composed: true }));
      } else this.openDetails();
    });
    cardFront.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (this.classList.contains("selection-card")) {
          this.dispatchEvent(new CustomEvent("select-general", { bubbles: true, composed: true }));
        } else this.openDetails();
      }
    });
    this.shadowRoot
      .querySelector(".detail-close")
      .addEventListener("click", () => this.closeDetails());
    this.shadowRoot
      .querySelector(".general-detail")
      .addEventListener("click", (event) => {
        if (event.target === event.currentTarget) this.closeDetails();
      });
    const showButton = this.shadowRoot.querySelector(`button[name="show-btn"]`);
    showButton.addEventListener("click", (event) => {
      event.stopPropagation();
      this.showJiang();
    });
    this.shadowRoot
      .querySelector(`button[name="select-btn"]`)
      .addEventListener("click", (event) => {
        event.stopPropagation();
        this.dispatchEvent(
          new CustomEvent("select-general", { bubbles: true, composed: true })
        );
      });
    this.shadowRoot
      .querySelector(`button[name="detail-btn"]`)
      .addEventListener("click", (event) => {
        event.stopPropagation();
        this.openDetails();
      });
  }

  openDetails() {
    const dialog = this.shadowRoot.querySelector(".general-detail");
    if (!dialog.open) dialog.showModal();
  }

  closeDetails() {
    const dialog = this.shadowRoot.querySelector(".general-detail");
    if (dialog.open) dialog.close();
  }

  setSelectedForLockIn(selected, position = "") {
    const block = this.shadowRoot.querySelector(".card-block");
    block.classList.toggle("selected-general", selected);
    block.dataset.selectionLabel = selected ? position : "";
    this.shadowRoot.querySelector(`button[name="select-btn"]`).textContent =
      selected ? "取消" : "选择";
  }

  setGeneralLocked(locked) {
    this.generalLocked = locked;
    this.setAttribute(
      "draggable",
      locked || this.classList.contains("selection-card") ? "false" : "true"
    );
    const selectButton = this.shadowRoot.querySelector(
      `button[name="select-btn"]`
    );
    selectButton.disabled = locked;
    if (locked) selectButton.textContent = "已锁定";
  }

  disconnectedCallback() {
    queueMicrotask(() => {
      if (!this.isConnected) {
        this.unSub?.();
        this.unSub = null;
      }
    });
  }
}

customElements.define("sg-jiang", SgJiang);


/***/ }),

/***/ "./src/wc/sgJiangArea.js":
/*!*******************************!*\
  !*** ./src/wc/sgJiangArea.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var firebase_database__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! firebase/database */ "./docs/sango-design-memory.cjs");
/* harmony import */ var _sgArea_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./sgArea.js */ "./src/wc/sgArea.js");
/* harmony import */ var _sgJiang_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./sgJiang.js */ "./src/wc/sgJiang.js");




class SgJiangArea extends _sgArea_js__WEBPACK_IMPORTED_MODULE_1__.SgArea {
  selectedGenerals = [];
  selectionLocked = false;
  childSubs = [];
  constructor() {
    super();
  }

  init(deckRef, gameController) {
    this.deckRef = deckRef;
    this.cardsRef = (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(deckRef, "/cards");
    this.areaType = deckRef.key + "-area";
    this.classList.add(this.areaType);
    this.gameController = gameController;
    if (this.isTableArea()) {
      this.classList.add("table-area");
    }

    if (!this.isTableArea()) {
      this.controlArea.classList.add("hide");
    } else {
      this.recycleBtn.classList.add("hide");
    }

    this.childSubs.push((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.onChildAdded)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(deckRef, "/cards"), (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();
      const cardWc = document.createElement("sg-jiang");
      if (this.isTableArea()) {
        cardWc.dataset.cardType = "table";
      }
      if (this.classList.contains("current-player")) {
        cardWc.classList.add("current-player");
      }
      if (this.areaType == "jiang-area" && !this.isTableArea()) {
        cardWc.classList.add("selection-card");
        cardWc.addEventListener("select-general", () => {
          this.selectGeneral(cardWc);
        });
      }
      this.cards[key] = cardWc;
      cardWc.init((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(deckRef, "/cards/" + key), value, this.gameController, {subscribe:false});
      cardWc.renderCard();
      cardWc.setGeneralLocked(this.selectionLocked);
      this.cardArea.prepend(cardWc);
      this.updateSelectionAvailability();

      this.lockJiangArea();
    }));
    this.childSubs.push((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.onChildRemoved)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(deckRef, "/cards"), (snapshot) => {
      const key = snapshot.key;
      const value = snapshot.val();
      // console.log(`on child removed: ${key}`);
      // console.log(value);
      const cardWc = this.cards[key];
      const selectedIndex = this.selectedGenerals.indexOf(cardWc);
      if (selectedIndex >= 0) {
        this.selectedGenerals.splice(selectedIndex, 1);
        this.dispatchSelectionChange();
      }
      this.cardArea.removeChild(cardWc);
      delete this.cards[key];
      this.lockJiangArea();
    }));
    this.childSubs.push((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.onChildChanged)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(deckRef, "/cards"), (snapshot) => {
      const cardWc = this.cards[snapshot.key];
      if (cardWc) {
        cardWc.cardData = snapshot.val();
        cardWc.renderCard();
      }
    }));

  }

  lockJiangArea() {
    if (this.cardArea.childElementCount <= 2) {
      if (!this.classList.contains("locked")) {
        this.classList.add("locked");
      }
    } else {
      this.classList.remove("locked");
    }
  }

  selectGeneral(cardWc) {
    if (this.selectionLocked) return;
    const index = this.selectedGenerals.indexOf(cardWc);
    if (index >= 0) {
      this.selectedGenerals.splice(index, 1);
      cardWc.setSelectedForLockIn(false);
    } else if (this.selectedGenerals.length < 2) {
      this.selectedGenerals.push(cardWc);
    }
    this.selectedGenerals.forEach((card, selectedIndex) =>
      card.setSelectedForLockIn(true, selectedIndex === 0 ? "主将" : "副将")
    );
    this.dispatchSelectionChange();
  }

  dispatchSelectionChange() {
    this.updateSelectionAvailability();
    this.dispatchEvent(
      new CustomEvent("general-selection-change", {
        bubbles: true,
        composed: true,
        detail: {
          count: this.selectedGenerals.length,
          locked: this.selectionLocked,
        },
      })
    );
  }

  updateSelectionAvailability() {
    const selectionFull = this.selectedGenerals.length === 2;
    Object.values(this.cards).forEach((card) => {
      card.classList.toggle(
        "selection-unavailable",
        selectionFull && !this.selectedGenerals.includes(card)
      );
    });
  }

  connectedCallback() {
    this.overflowObserver?.observe(this.cardArea);
  }

  disconnectedCallback() {
    this.overflowObserver?.disconnect();
    queueMicrotask(() => {
      if (!this.isConnected) this.childSubs.splice(0).forEach(unsubscribe => unsubscribe());
    });
  }

  async lockInSelected() {
    const playerKey = this.gameController.currentPlayer;
    if (!playerKey || this.selectionLocked || this.selectedGenerals.length != 2) {
      return false;
    }

    return this.gameController.lockSelectedGenerals(this.selectedGenerals.map(card=>card.cardRef),playerKey);
  }

  setLocked(locked) {
    this.selectionLocked = locked;
    if (!locked) {
      this.selectedGenerals.forEach((card) => card.setSelectedForLockIn(false));
      this.selectedGenerals = [];
    }
    Object.values(this.cards).forEach((card) => card.setGeneralLocked(locked));
    this.classList.toggle("selection-locked", locked);
    this.dispatchSelectionChange();
  }
}

customElements.define("sg-jiangarea", SgJiangArea);


/***/ }),

/***/ "./src/wc/sgPlayer.js":
/*!****************************!*\
  !*** ./src/wc/sgPlayer.js ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SgPlayer: () => (/* binding */ SgPlayer)
/* harmony export */ });
/* harmony import */ var firebase_database__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! firebase/database */ "./docs/sango-design-memory.cjs");
/* harmony import */ var _sgHpbar_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./sgHpbar.js */ "./src/wc/sgHpbar.js");
/* harmony import */ var _css_common_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./css/common.css */ "./src/wc/css/common.css");
/* harmony import */ var _css_sgPlayer_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./css/sgPlayer.css */ "./src/wc/css/sgPlayer.css");
/* harmony import */ var _data_pai_json__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../data/pai.json */ "./src/data/pai.json");
/* harmony import */ var _cardOrder_mjs__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../cardOrder.mjs */ "./src/cardOrder.mjs");








const template = document.createElement("template");
template.innerHTML = `
<style>
${_css_common_css__WEBPACK_IMPORTED_MODULE_2__["default"]}
${_css_sgPlayer_css__WEBPACK_IMPORTED_MODULE_3__["default"]}
</style>
<div name="widget" class="widget">
  <div name="player-game-area">
    <div class="open-info">
      <div class="player-info">
        <span class="player-key"> </span>
        <span class="player-name"></span>
        <span class="player-role">-</span><span class="player-role-marker">匿</span>
      </div> 
      <div class="hp-holder"><span class="hp"></span></div>
      <div name="deck-area" class="decks">
        <div class="hand-count"><span>2</span></div>
        <div class="area1-count"><span>2</span></div>
        <div class="area2-count"><span>2</span></div>
        <div class="jiang-pick"><span class="material-symbols-outlined">
        武将
        </span></div>
      </div>
    </div>
    <div class="pai-info">
    
    </div>
  </div>
  <div name="addtional-area">
    <div class="debuff-area">
      <span class="debuff debuff-0">翻面</span>
      <span class="debuff debuff-1">连环</span>
    </div>
  </div>
  <div class="player-toolbar" aria-label="本地玩家工具栏">
    <div class="hp-controls" aria-label="调整体力">
      <button type="button" data-action="hp-minus" aria-label="扣血" title="扣血"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10"/></svg></button>
      <button type="button" data-action="hp-plus" aria-label="加血" title="加血"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M8 3v10"/></svg></button>
    </div>
    <button type="button" data-debuff="0">翻面</button>
    <button type="button" data-debuff="1">连环</button>
    <button type="button" data-action="select-general">选将</button>
    <button type="button" data-action="hp-limit">血量上限</button>
  </div>
  <div name="drag-on-view">
    <div class="hand-drop">手牌</div>
    <div class="area1-drop">1区</div>
    <div class="area2-drop">2区</div>
    <div class="zhuang-drop">装备</div>
    <div class="pan-drop">判定</div>
  </div>
  <div name="click-on-view">
  </div> 
</div>
`;

class SgPlayer extends HTMLElement {
  playerRef;
  gameController;
  shadowRoot;
  debuff = "00";
  subs = [];
  constructor() {
    super();

    this.shadowRoot = this.attachShadow({ mode: "open" });
    let clone = template.content.cloneNode(true);

    this.shadowRoot.append(clone);
    this.widget = this.shadowRoot.querySelector("div[name='widget']");
    this.playerGameArea = this.shadowRoot.querySelector(
      `div[name="player-game-area"]`
    );
    const playerDeckAreaWdight = this.shadowRoot.querySelector(
      `div[name="deck-area"]`
    );

    this.addtionalArea = this.shadowRoot.querySelector(
      `div[name="addtional-area"]`
    );

    this.dragOnView = this.shadowRoot.querySelector(`div[name="drag-on-view"]`);
    this.clickOnView = this.shadowRoot.querySelector(
      `div[name="click-on-view"]`
    );

    const paiInfo = this.shadowRoot.querySelector(`.pai-info`);
    const openInfo = this.shadowRoot.querySelector(`.open-info`);
    const generalSlots = document.createElement("div");
    generalSlots.className = "general-slots";
    generalSlots.setAttribute("aria-label", "主将与副将");
    this.handArea = document.createElement("sg-area");

    this.handArea.classList.add("hide");

    this.jiangArea = document.createElement("sg-jiangarea");
    this.jiangArea.classList.add("general-selection");
    this.jiangArea.setAttribute("aria-label", "武将候选");
    this.generalSelectionDialog = document.createElement("div");
    this.generalSelectionDialog.className = "general-selection-dialog hide";
    const selectionHeader = document.createElement("header");
    selectionHeader.innerHTML =
      "<strong>选择武将</strong><span>七选二 · 双将3v3</span>";
    const selectionClose = document.createElement("button");
    selectionClose.type = "button";
    selectionClose.textContent = "关闭";
    selectionClose.addEventListener("click", () => {
      this.generalSelectionDialog.classList.add("hide");
      this.classList.remove("general-selection-open");
    });
    this.selectionLockButton = document.createElement("button");
    this.selectionLockButton.type = "button";
    this.selectionLockButton.className = "selection-lock";
    this.selectionLockButton.textContent = "锁定武将 0/2";
    this.selectionLockButton.disabled = true;
    this.selectionLockButton.addEventListener("click", async () => {
      this.selectionLockButton.disabled = true;
      const locked = await this.jiangArea.lockInSelected();
      if (locked) {
        this.generalSelectionDialog.classList.add("hide");
        this.classList.remove("general-selection-open");
      } else {
        this.selectionLockButton.disabled = false;
      }
    });
    this.jiangArea.addEventListener("general-selection-change", (event) => {
      const { count, locked } = event.detail;
      const generals = this.jiangArea.selectedGenerals.map(card =>
        card.shadowRoot.querySelector(".jiang-name")?.textContent || "未选择"
      );
      this.selectionStatus.textContent = `主将：${generals[0] || "未选择"}　/　副将：${generals[1] || "未选择"}`;
      this.selectionLockButton.textContent = locked
        ? "武将已锁定"
        : `锁定武将 ${count}/2`;
      this.selectionLockButton.disabled = locked || count != 2;
      this.generalSelectionDialog.classList.toggle("selection-locked", locked);
    });
    selectionHeader.append(selectionClose);
    const selectionFooter = document.createElement("footer");
    this.selectionStatus = document.createElement("span");
    this.selectionStatus.className = "selection-status";
    this.selectionStatus.textContent = "主将：未选择　/　副将：未选择";
    selectionFooter.append(this.selectionStatus, this.selectionLockButton);
    this.generalSelectionDialog.append(selectionHeader, this.jiangArea, selectionFooter);

    this.jiang1Area = document.createElement("sg-jiangarea");
    this.jiang1Area.classList.add("jiang-block");

    this.jiang2Area = document.createElement("sg-jiangarea");
    this.jiang2Area.classList.add("jiang-block");

    this.zhuangArea = document.createElement("sg-area");
    this.zhuangArea.setAttribute("aria-label", "装备区，最多四张");

    this.panArea = document.createElement("sg-area");
    this.judgmentArea = document.createElement("div");
    this.judgmentArea.className = "judgment-area";
    this.judgmentArea.setAttribute("aria-label", "判定区：乐不思蜀、兵粮寸断、闪电");
    this.judgmentArea.append(this.panArea);

    this.other1Area = document.createElement("sg-area");
    this.other2Area = document.createElement("sg-area");
    this.other1Area.setAttribute("aria-label", "区域一");
    this.other2Area.setAttribute("aria-label", "区域二");
    this.handArea.setAttribute("aria-label", "手牌区");
    this.other1Area.classList.add("hide");
    this.other2Area.classList.add("hide");

    playerDeckAreaWdight.append(this.zhuangArea);
    this.addtionalArea.append(this.judgmentArea);

    paiInfo.append(this.handArea);
    paiInfo.append(this.other1Area);
    paiInfo.append(this.other2Area);
    const areaHeading = document.createElement("header");
    areaHeading.className = "area-panel-heading";
    areaHeading.innerHTML = '<strong></strong><button type="button">关闭</button>';
    areaHeading.querySelector("button").addEventListener("click", () => paiInfo.hidePopover());
    paiInfo.prepend(areaHeading);
    const areaActions = document.createElement("footer");
    areaActions.className = "area-panel-actions";
    for (const [label, action] of [["拿取所选", "drawPai"], ["弃置所选", "discardPai"], ["亮出/暗置", "showPai"], ["取消选择", "unselectCard"]]) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", async () => {
        const cards = Object.values(this.inspectedArea?.cards || {});
        const selected = cards.filter(card => this.gameController.selectedCards.includes(card));
        try {
          if (action === 'drawPai') await this.gameController.drawSelectedCards(selected);
          else if (action === 'discardPai') await this.gameController.discardSelectedCards(selected);
          else selected.forEach(card => card[action]());
        } catch (error) { window.alert(error.message || '移动失败，请重试'); }
      });
      areaActions.append(button);
    }
    paiInfo.append(areaActions);
    paiInfo.addEventListener("dragstart", () => {
      if (paiInfo.matches(":popover-open")) paiInfo.hidePopover();
    });
    paiInfo.addEventListener('toggle', event => {
      if (event.newState === 'closed' && this.inspectedArea && !this.classList.contains('current-player')) {
        this.inspectedArea.stopCardsSubscription();
        this.inspectedArea = null;
      }
    });
    generalSlots.append(this.jiang1Area);
    generalSlots.append(this.jiang2Area);
    openInfo.append(generalSlots);

    this.widget.append(this.generalSelectionDialog);
    this.dropPicker = document.createElement("dialog");
    this.dropPicker.className = "drop-picker";
    this.dropPicker.setAttribute("aria-label", "选择卡牌放入区域");
    this.dropPicker.innerHTML = `<h3>选择放入区域</h3><p class="drop-summary"></p>
      <div class="drop-options">
        <button type="button" data-area="handArea">手牌</button>
        <button type="button" data-area="zhuangArea">装备</button>
        <button type="button" data-area="other1Area">区1</button>
        <button type="button" data-area="other2Area">区2</button>
      </div><div class="judgment-options">
        <p class="judgment-label">判定区：</p>
        <p class="judgment-summary"></p>
        <div class="drop-options">
          <button type="button" data-effect="乐不思蜀">乐不思蜀</button>
          <button type="button" data-effect="兵粮寸断">兵粮寸断</button>
          <button type="button" data-effect="闪电">闪电</button>
        </div>
      </div><p class="drop-error" role="status"></p>
      <button type="button" class="drop-cancel">取消</button>`;
    this.shadowRoot.append(this.dropPicker);
    this.dropPicker.querySelector(".drop-cancel").addEventListener("click", () => this.dropPicker.close());
    this.dropPicker.addEventListener("close", () => { this.pendingDrop = null; const done = this.dropComplete; this.dropComplete = null; done?.(Boolean(this.dropCommitted)); });
    this.dropPicker.addEventListener("cancel", (event) => {
      if (this.dropBusy) event.preventDefault();
    });
    this.dropPicker.querySelectorAll("[data-area]").forEach(button => {
      button.addEventListener("click", () => this.confirmPlayerDrop(button.dataset.area));
    });
    this.dropPicker.querySelectorAll('[data-effect]').forEach(button => {
      button.addEventListener('click', () => {
        const path = this.judgmentPaths[Object.keys(this.pendingEffects).length];
        this.pendingEffects[path] = button.dataset.effect;
        if (Object.keys(this.pendingEffects).length === this.judgmentPaths.length) {
          this.confirmPlayerDrop('panArea', this.pendingEffects);
        } else this.renderJudgmentChoices();
      });
    });
    // Capture before nested area handlers can move a card immediately.
    this.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    });
    this.addEventListener("drop", (event) => {
      const path = event.dataTransfer.getData("text");
      if (path.includes("/jiang")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      this.openDropPicker(path);
    }, true);

    this.shadowRoot
      .querySelector('[data-action="select-general"]')
      .addEventListener("click", () => this.openGeneralSelection());
    this.shadowRoot
      .querySelector('[data-action="hp-limit"]')
      .addEventListener("click", () => this.openMaxHpPicker());
    this.shadowRoot
      .querySelector('[data-action="hp-plus"]')
      .addEventListener("click", () => {
        if (!this.classList.contains("current-player") || !this.hpWc) return;
        this.hpWc.updateCurHp(Math.min(Number(this.hpWc.max), Number(this.hpWc.cur) + 1));
      });
    this.shadowRoot
      .querySelector('[data-action="hp-minus"]')
      .addEventListener("click", () => {
        if (!this.classList.contains("current-player") || !this.hpWc) return;
        this.hpWc.updateCurHp(Number(this.hpWc.cur) - 1);
      });

    // this.addEventListener("pointerenter", (e) => {
    //   console.log("touchoverpalyer");
    // });
  }

  assginAsCurrentPlayer() {
    this.gameController.currentPlayer = this.playerRef.key;
    this.classList.add("current-player");

    this.widget.classList.add("current-player");
    this.handArea.classList.add("current-player");
    this.other1Area.classList.add("current-player");
    this.other2Area.classList.add("current-player");
    this.zhuangArea.classList.add("current-player");
    this.jiangArea.classList.add("current-player");
    this.jiang1Area.classList.add("current-player");
    this.jiang2Area.classList.add("current-player");
    this.hpWc.classList.add("current-player");

    // General cards may have rendered before the player claimed their seat.
    // Propagate the local visibility state to those existing cards as well.
    [this.jiangArea, this.jiang1Area, this.jiang2Area].forEach((area) => {
      area.shadowRoot
        .querySelectorAll("sg-jiang")
        .forEach((card) => card.classList.add("current-player"));
    });
    [this.handArea, this.other1Area, this.other2Area, this.zhuangArea].forEach(
      (area) => {
        area.shadowRoot
          .querySelectorAll("sg-card")
          .forEach((card) => card.classList.add("current-player"));
      }
    );

    this.handArea.classList.remove("hide");
    this.other1Area.classList.remove("hide");
    this.other2Area.classList.remove("hide");

    [this.handArea, this.other1Area, this.other2Area].forEach(area => area.enableOverflowControls());

    this.gameController.lockPlayerSelection();
    this.playerGameArea.appendChild(this.zhuangArea);
    this.widget.appendChild(this.playerGameArea);
  }

  renderJiang() {}

  openGeneralSelection() {
    if (!this.classList.contains("current-player")) return;
    this.generalSelectionDialog.classList.remove("hide");
    this.classList.add("general-selection-open");
  }

  openMaxHpPicker() {
    if (!this.classList.contains("current-player")) return;
    this.hpWc.openMaxPicker();
  }

  init(playerRef, gameController) {
    this.playerRef = playerRef;
    this.gameController = gameController;
    this.widget.classList.remove("hide");

    const hpSpan = this.shadowRoot.querySelector(".hp");
    const hpWc = document.createElement("sg-hpbar");
    this.hpWc = hpWc;
    hpSpan.append(hpWc);
    hpWc.init((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(playerRef, "/hp"), gameController);

    const playerKeySpan = this.shadowRoot.querySelector(".player-key");
    const playerRoleSpan = this.shadowRoot.querySelector(".player-role");
    const playerNameItem = this.shadowRoot.querySelector(".player-name");
    playerKeySpan.innerHTML = this.playerRef.key;
    const subscribe = (target, callback) => this.subs.push((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.onValue)(target, callback));

    subscribe((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(playerRef, "/name"), (snapshot) => {
      if (snapshot.exists()) {
        const playerName = snapshot.val();
        playerNameItem.textContent = playerName;
        playerNameItem.title = playerName;
        if (this.gameController.userName == playerName) {
          this.assginAsCurrentPlayer();
        }
      }
    });

    subscribe((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(playerRef, "/role"), (snapshot) => {
      if (snapshot.exists()) {
        const playerRole = snapshot.val();
        const roleClass={主:'role-lord',内:'role-renegade',忠:'role-loyal',反:'role-rebel'}[playerRole] || '';
        playerRoleSpan.classList.remove('role-lord','role-renegade','role-loyal','role-rebel');
        if(roleClass)playerRoleSpan.classList.add(roleClass);
        playerRoleSpan.textContent = playerRole;
      }
    });

    String.prototype.replaceAt = function (index, replacement) {
      return (
        this.substring(0, index) +
        replacement +
        this.substring(index + replacement.length)
      );
    };

    subscribe((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(playerRef, "/debuff"), (snapshot) => {
      if (snapshot.exists()) {
        const debuff = snapshot.val();
        for (let i = 0; i < debuff.length; i++) {
          const debufSpan = this.shadowRoot.querySelector(`.debuff-${i}`);
          if (debuff[i] == "0") {
            debufSpan.classList.remove("on");
            this.debuff = this.debuff.replaceAt(i, "0");
          } else {
            if (!debufSpan.classList.contains("on")) {
              debufSpan.classList.add("on");
            }
            this.debuff = this.debuff.replaceAt(i, "1");
          }
          this.shadowRoot
            .querySelector(`[data-debuff="${i}"]`)
            .classList.toggle("active", debuff[i] != "0");
        }
        console.log(this.debuff);
      }
    });

    for (let i = 0; i < 2; i++) {
      this.shadowRoot
        .querySelector(`[data-debuff="${i}"]`)
        .addEventListener("click", () => {
          if (!this.classList.contains("current-player")) return;
          this.gameController.togglePlayerStatus(playerRef, i);
        });
    }

    this.shadowRoot
      .querySelector(".hand-count")
      .addEventListener("click", () => {
        this.openAreaPanel(this.handArea, "手牌");
      });
    this.shadowRoot
      .querySelector(".area1-count")
      .addEventListener("click", () => {
        this.openAreaPanel(this.other1Area, "区1");
      });
    this.shadowRoot
      .querySelector(".area2-count")
      .addEventListener("click", () => {
        this.openAreaPanel(this.other2Area, "区2");
      });

    // <div class="hand-count"><span>2</span></div>
    // <div class="area1-count"><span>2<span></div>
    // <div class="area2-count"><span>2<span></div>
    this.handCountSpan = this.shadowRoot.querySelector(`.hand-count > span`);
    this.area1CountSpan = this.shadowRoot.querySelector(`.area1-count > span`);
    this.area2CountSpan = this.shadowRoot.querySelector(`.area2-count > span`);

    const isLocalPlayer = playerRef.key === this.gameController.currentPlayer;
    const bindAreaCount = (area, span) => area.addEventListener('cards-updated', () => {
      const count = area.cardCount || 0;
      span.textContent = count;
      area.dataset.count = count;
    });
    if (isLocalPlayer) {
      bindAreaCount(this.handArea, this.handCountSpan);
      bindAreaCount(this.other1Area, this.area1CountSpan);
      bindAreaCount(this.other2Area, this.area2CountSpan);
    } else {
      [['hand',this.handArea,this.handCountSpan],['other1',this.other1Area,this.area1CountSpan],['other2',this.other2Area,this.area2CountSpan]]
        .forEach(([name,area,span]) => {
          const countRef = (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(playerRef, `/areaCounts/${name}`);
          subscribe(countRef, async snapshot => {
          let count = Number(snapshot.val() || 0);
          if (!snapshot.exists()) {
            const legacySnapshot = await (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.get)((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(playerRef, `/${name}/cards`));
            count = Object.keys(legacySnapshot.val() || {}).length;
            await (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.set)(countRef, count);
          }
          span.textContent = count;
          area.dataset.count = count;
          });
        });
    }

    this.handArea.init((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(playerRef, `/hand`), this.gameController, {subscribe:isLocalPlayer});
    if (isLocalPlayer) {
      this.jiangArea.init((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(playerRef, `/jiang`), this.gameController);
    }
    this.jiang1Area.init((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(playerRef, `/jiang1`), this.gameController);
    this.zhuangArea.init((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(playerRef, `/zhuang`), this.gameController);
    this.panArea.init((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(playerRef, `/pan`), this.gameController);
    this.other1Area.init((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(playerRef, `/other1`), this.gameController, {subscribe:isLocalPlayer});
    this.other2Area.init((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(playerRef, `/other2`), this.gameController, {subscribe:isLocalPlayer});
    this.jiang2Area.init((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(playerRef, `/jiang2`), this.gameController);

    subscribe((0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(playerRef, `/jiangLocked`), (snapshot) => {
      const locked = snapshot.exists() && snapshot.val() === true;
      this.jiangArea.setLocked(locked);
      this.jiang1Area.setLocked(locked);
      this.jiang2Area.setLocked(locked);
    });
  }

  disconnectedCallback() {
    queueMicrotask(() => {
      if (!this.isConnected) this.subs.splice(0).forEach(unsubscribe => unsubscribe());
    });
  }

  openAreaPanel(area, label) {
    if (this.classList.contains("current-player")) return;
    area.subscribeCards();
    this.inspectedArea = area;
    const panel = this.shadowRoot.querySelector(".pai-info");
    panel.setAttribute("popover", "auto");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", `${label}区域操作`);
    const name = this.shadowRoot.querySelector(".player-name").textContent || this.playerRef.key;
    panel.querySelector("strong").textContent = `${name} · ${label}`;
    [this.handArea, this.other1Area, this.other2Area].forEach(item => item.classList.toggle("hide", item !== area));
    panel.showPopover();
  }

  openDropPicker(path, paths = null, done = null) {
    const prefix = `game/${this.gameController.gameId}/`;
    if (!path.startsWith(prefix) || !/\/cards\/[^/]+$/.test(path) || this.dropPicker.open) return;
    const baseUrl = (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.gameController.db).toString();
    const selectedPaths = this.gameController.selectedCards.map(card =>
      card.cardRef.toString().replace(baseUrl, "")
    );
    this.pendingDrop = [...new Set(paths || (selectedPaths.includes(path) ? selectedPaths : [path]))];
    this.dropComplete = done; this.dropCommitted = false;
    const name = this.shadowRoot.querySelector(".player-name").textContent || this.playerRef.key;
    this.dropPicker.querySelector(".drop-summary").textContent = `将 ${this.pendingDrop.length} 张牌放入 ${name} 的哪个区域？`;
    this.dropPicker.querySelector(".drop-error").textContent = "";
    const judgmentPath = (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(this.panArea.deckRef, '/cards').toString().replace(baseUrl, '');
    this.judgmentPaths = this.pendingDrop.filter(path => !path.startsWith(`${judgmentPath}/`));
    this.pendingEffects = {};
    this.dropPicker.querySelectorAll("button").forEach(button => { button.disabled = false; });
    this.renderJudgmentChoices();
    this.dropPicker.showModal();
  }

  renderJudgmentChoices() {
    const index = Object.keys(this.pendingEffects).length;
    this.dropPicker.querySelector('.judgment-summary').textContent = this.judgmentPaths.length > 1
      ? `第 ${index + 1} / ${this.judgmentPaths.length} 张牌（按拖入顺序选择）` : '';
    const occupied = [...this.panArea.cardArea.children].map(card => card.cardData?.judgmentEffect || _data_pai_json__WEBPACK_IMPORTED_MODULE_4__[card.cardData?.id]?.name);
    this.dropPicker.querySelectorAll('[data-effect]').forEach(button => {
      button.disabled = !this.judgmentPaths.length || occupied.length + this.judgmentPaths.length > _cardOrder_mjs__WEBPACK_IMPORTED_MODULE_5__.judgmentEffects.length
        || occupied.includes(button.dataset.effect) || Object.values(this.pendingEffects).includes(button.dataset.effect);
    });
  }

  async confirmPlayerDrop(areaName, effects = null) {
    if (!this.pendingDrop || this.dropBusy) return;
    const target = (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.child)(this[areaName].deckRef, "/cards");
    const baseUrl = (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.gameController.db).toString();
    const targetPath = target.toString().replace(baseUrl, "");
    const paths = this.pendingDrop.filter(path => !path.startsWith(`${targetPath}/`));
    if (areaName === 'panArea' && paths.length && !effects) {
      const count = this.panArea.cardArea.children.length;
      if (count + paths.length > _cardOrder_mjs__WEBPACK_IMPORTED_MODULE_5__.judgmentEffects.length) {
        this.dropPicker.querySelector('.drop-error').textContent = '判定区每种效果最多一张，总共最多三张，请减少选牌。';
        return;
      }
      this.judgmentPaths = paths;
      this.pendingEffects = {};
      this.renderJudgmentChoices();
      return;
    }
    this.dropBusy = true;
    this.dropPicker.querySelectorAll("button").forEach(button => { button.disabled = true; });
    try {
      if (paths.length) await this.gameController.moveOrderedCards(paths, target, null, effects || {});
      this.dropCommitted = true;
      this.dropPicker.close();
    } catch (error) {
      console.error("Unable to move dropped cards", error);
      this.dropPicker.querySelector(".drop-error").textContent = error.message || "移动失败，请重试或取消。";
      this.pendingEffects = {};
    } finally {
      this.dropBusy = false;
      this.dropPicker.querySelectorAll("button").forEach(button => { button.disabled = false; });
      if (this.dropPicker.open) this.renderJudgmentChoices();
    }
  }

}


customElements.define("sg-player", SgPlayer);


/***/ }),

/***/ "./src/wc/sgTable.js":
/*!***************************!*\
  !*** ./src/wc/sgTable.js ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SgTable: () => (/* binding */ SgTable)
/* harmony export */ });
/* harmony import */ var firebase_database__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! firebase/database */ "./docs/sango-design-memory.cjs");
/* harmony import */ var _gameController_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../gameController.js */ "./src/gameController.js");
/* harmony import */ var _css_common_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./css/common.css */ "./src/wc/css/common.css");
/* harmony import */ var _css_sgTable_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./css/sgTable.css */ "./src/wc/css/sgTable.css");
/* harmony import */ var _sgPlayer_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./sgPlayer.js */ "./src/wc/sgPlayer.js");
/* harmony import */ var _sgJiangArea_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./sgJiangArea.js */ "./src/wc/sgJiangArea.js");
/* harmony import */ var _cardDrag_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../cardDrag.js */ "./src/cardDrag.js");
/* harmony import */ var _actionLogPanel_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./actionLogPanel.js */ "./src/wc/actionLogPanel.js");
/* harmony import */ var _publicTablePanel_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./publicTablePanel.js */ "./src/wc/publicTablePanel.js");
/* harmony import */ var _cardTransferAnimation_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./cardTransferAnimation.js */ "./src/wc/cardTransferAnimation.js");
//This file will be the web component
//It only needs to run, not be imported by main.js












class SgTable extends HTMLElement {
  db;
  widget;
  gameController;
  shadowRoot;
  tableRef;
  playerCount = 6;
  playerDoms = [];
  constructor(db, gameController) {
    super();
    this.db = db;
    this.gameController = gameController;
    this.gameController.rootComponent = this;
    this.playerCount = this.gameController.playerCount;

    this.shadowRoot = this.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.append(_css_common_css__WEBPACK_IMPORTED_MODULE_2__["default"]);
    style.append(_css_sgTable_css__WEBPACK_IMPORTED_MODULE_3__["default"]);
    const container = document.createElement("div");
    container.className = "table-container";

    this.shadowRoot.appendChild(style);
    const topbar = document.createElement("header");
    topbar.className = "topbar";
    topbar.innerHTML = `<span class="seal">杀</span><span class="brand">SANGO · 双将3v3</span>
      <span class="room"></span><span class="seat-label" aria-live="polite">座次：未入座</span>
      <span class="mode"><i class="live-dot" aria-hidden="true"></i><span>手动桌面 · 技能与结算由玩家执行</span></span>
      <button type="button" class="top-btn">操作说明</button>`;
    topbar.querySelector(".room").textContent = `房间 ${String(this.gameController.gameId).padStart(3, "0")}`;
    const help = document.createElement("dialog");
    help.className = "table-help";
    help.setAttribute("aria-label", "操作说明");
    help.innerHTML = `<h3>操作说明</h3><p>点击卡牌可选中或取消选择，支持多选。</p>
      <p>选中后可点击“移动”，依次选择目标玩家和区域；也可直接拖到玩家卡片。</p>
      <p>通过侧栏调整血量、翻面和连环。技能与结算由玩家执行。</p>
      <form method="dialog"><button class="top-btn">关闭</button></form>`;
    topbar.querySelector("button").addEventListener("click", () => help.showModal());
    const publicTools = document.createElement("details");
    publicTools.className = "public-tools";
    const toolsToggle = document.createElement("summary");
    toolsToggle.textContent = "公共工具";
    const toolsMenu = this.getRoundMenu();
    toolsMenu.setAttribute("aria-label", "公共工具");
    publicTools.append(toolsToggle, toolsMenu);
    topbar.append(publicTools);
    toolsMenu.addEventListener("click", event => {
      if (event.target.closest("button")) publicTools.open = false;
    });
    this.shadowRoot.addEventListener("click", event => {
      if (!event.composedPath().includes(publicTools)) publicTools.open = false;
    });
    publicTools.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        publicTools.open = false;
        toolsToggle.focus();
      }
    });
    this.shadowRoot.append(topbar, help);
    this.shadowRoot.appendChild(container);

    this.initGame();
    this.disposeDrag = (0,_cardDrag_js__WEBPACK_IMPORTED_MODULE_6__.installCardDrag)(this);
    this.disposeTransferAnimation = (0,_cardTransferAnimation_js__WEBPACK_IMPORTED_MODULE_9__.installCardTransferAnimation)(this);
    this.disposeLog = (0,_actionLogPanel_js__WEBPACK_IMPORTED_MODULE_7__.installActionLog)(this);
  }

  getRoundMenu() {
    const roundMenu = document.createElement("div");
    roundMenu.className = "round-menu";
    const rollRolesBtn = document.createElement("button");
    rollRolesBtn.innerHTML = "身份";
    rollRolesBtn.addEventListener("click", () => {
      this.gameController.assignRoles();
    });
    roundMenu.appendChild(rollRolesBtn);

    const jiangShuffleBtn = document.createElement("button");
    jiangShuffleBtn.innerHTML = "发将";
    jiangShuffleBtn.addEventListener("click", () => {
      this.gameController.dispatchJiang();
    });
    roundMenu.appendChild(jiangShuffleBtn);

    const dealBtn = document.createElement("button");
    dealBtn.textContent = "发牌";
    dealBtn.title = "所有玩家手牌为空时，按座次从牌堆给每人发四张牌";
    dealBtn.addEventListener("click", async () => {
      dealBtn.disabled = true;
      try {
        await this.gameController.dealCards();
      } catch (error) {
        window.alert(error.message);
      } finally {
        dealBtn.disabled = false;
      }
    });
    roundMenu.appendChild(dealBtn);

    const paiShuffleBtn = document.createElement("button");
    paiShuffleBtn.innerHTML = "洗牌";
    paiShuffleBtn.addEventListener("click", () => {
      this.gameController.resetPai();
    });
    roundMenu.appendChild(paiShuffleBtn);

    const startRoundBtn = document.createElement("button");
    startRoundBtn.innerHTML = "清台";
    startRoundBtn.className = "clear-table";
    startRoundBtn.addEventListener("click", () => {
      this.gameController.resetTable();
    });
    roundMenu.appendChild(startRoundBtn);

    return roundMenu;
  }

  disconnectedCallback() {
    queueMicrotask(() => { if (!this.isConnected) {this.disposeDrag?.();this.disposeTransferAnimation?.();this.disposeLog?.();this.disposePublicPanel?.();} });
  }

  getCurrentPlayerDom() {
    const playerKey = this.gameController.currentPlayer;
    return this.playerDoms.find((player) => player.dataset.key === playerKey);
  }

  openMovePlayerPicker() {
    const cards=[...this.gameController.selectedCards];
    if(!cards.length)return;
    const paths=[...new Set(cards.map(card=>card.dataset.path).filter(Boolean))];
    if(!paths.length)return;
    if(!this.movePlayerPicker){
      this.movePlayerPicker=document.createElement('dialog');
      this.movePlayerPicker.className='move-player-picker';
      this.movePlayerPicker.innerHTML='<header><h3>移动到哪位玩家？</h3><button type="button" data-move-close aria-label="关闭">关闭 ×</button></header><p class="move-summary"></p><div class="move-player-options"></div>';
      this.movePlayerPicker.querySelector('[data-move-close]').addEventListener('click',()=>this.movePlayerPicker.close());
      this.movePlayerPicker.querySelector('.move-player-options').addEventListener('click',event=>{
        const button=event.target.closest('[data-player]');if(!button)return;
        const player=this.playerDoms.find(item=>item.dataset.key===button.dataset.player);
        const pending=this.pendingMenuMove;this.movePlayerPicker.close();
        if(!player||!pending)return;
        queueMicrotask(()=>player.openDropPicker(pending.paths[0],pending.paths,ok=>{
          if(ok)pending.cards.forEach(card=>{if(card.isConnected&&this.gameController.selectedCards.includes(card))card.unselectCard();});
        }));
      });
      this.movePlayerPicker.addEventListener('close',()=>{this.pendingMenuMove=null;});
      this.shadowRoot.append(this.movePlayerPicker);
    }
    this.pendingMenuMove={cards,paths};
    this.movePlayerPicker.querySelector('.move-summary').textContent=`已选择 ${paths.length} 张牌，请选择唯一的目标玩家。`;
    const options=this.movePlayerPicker.querySelector('.move-player-options');options.replaceChildren();
    this.playerDoms.forEach(player=>{
      const button=document.createElement('button');button.type='button';button.dataset.player=player.dataset.key;
      const name=player.shadowRoot.querySelector('.player-name')?.textContent?.trim();
      button.innerHTML=`<b>${name&&name!=='empty'?name:player.dataset.key}</b><small>${player.dataset.key===this.gameController.currentPlayer?'自己':'玩家'}</small>`;
      options.append(button);
    });
    this.movePlayerPicker.showModal();
  }

  getCardMenu() {
    const cardMenu = document.createElement("div");
    cardMenu.className = "card-menu hide";
    cardMenu.setAttribute("aria-label", "已选卡牌操作");
    const selectionLabel = document.createElement("span");
    selectionLabel.className = "selection-label";
    cardMenu.append(selectionLabel);

    const drawButton = document.createElement("button");
    drawButton.innerHTML = "摸";
    drawButton.addEventListener("click", () => {
      this.gameController.drawSelectedCards().catch(error => window.alert(error.message || '移动失败，请重试')); 
    });
    const discardButton = document.createElement("button");
    discardButton.innerHTML = "弃";
    discardButton.addEventListener("click", () => {
      this.gameController.discardSelectedCards().catch(error => window.alert(error.message || '移动失败，请重试')); 
    });
    const playButton = document.createElement("button");
    playButton.innerHTML = "出";
    playButton.addEventListener("click", () => {
      this.gameController.playSelectedCards().catch(error => window.alert(error.message || '移动失败，请重试')); 
    });
    const showButton = document.createElement("button");
    showButton.innerHTML = "亮";
    showButton.addEventListener("click", () => {
      this.gameController.showSelectedCards().catch(error => window.alert(error.message || '更新失败，请重试'));
    });

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "取消选择";
    cancelButton.addEventListener("click", () => {
      [...this.gameController.selectedCards].forEach(card => card.unselectCard());
    });
    const moveButton=document.createElement('button');
    moveButton.textContent='移动';
    moveButton.addEventListener('click',()=>this.openMovePlayerPicker());

    cardMenu.appendChild(drawButton);
    cardMenu.appendChild(discardButton);

    cardMenu.appendChild(playButton);
    cardMenu.appendChild(showButton);
    cardMenu.appendChild(moveButton);
    cardMenu.appendChild(cancelButton);
    // cardMenu.appendChild(peakButton);
    return cardMenu;
  }

  initGame() {
    const container = this.shadowRoot.querySelector(".table-container");
    const tableDeckWidget = document.createElement("div");
    tableDeckWidget.classList.add("table-public");


    const cardMenu = this.getCardMenu();
    this.cardMenu = cardMenu;


    container.appendChild(tableDeckWidget);
    const opponentRail = document.createElement("div");
    opponentRail.className = "opponent-rail";
    opponentRail.setAttribute("aria-label", "其他玩家，按座次排列");
    container.appendChild(opponentRail);
    this.opponentRail = opponentRail;
    for (let i = 0; i < this.playerCount; i++) {
      const sgPlayer = new _sgPlayer_js__WEBPACK_IMPORTED_MODULE_4__.SgPlayer();
      sgPlayer.dataset.key = `p${i + 1}`;
      opponentRail.appendChild(sgPlayer);
      this.playerDoms.push(sgPlayer);
    }
    // because bad design, current play assign function has side effects on other player widget.
    // so I have to use another loop to run init() after all sg-player is added to sg-table.
    for (let i = 0; i < this.playerCount; i++) {
      const sgPlayer = this.playerDoms[i];
      sgPlayer.init(
        (0,firebase_database__WEBPACK_IMPORTED_MODULE_0__.ref)(this.db, `game/${this.gameController.gameId}/p${i + 1}`),
        this.gameController
      );
    }

    this.disposePublicPanel=(0,_publicTablePanel_js__WEBPACK_IMPORTED_MODULE_8__.installPublicTablePanel)(this,tableDeckWidget,this.cardMenu);
  }

  lockPlayerSelection() {
    this.dataset.owner = _gameController_js__WEBPACK_IMPORTED_MODULE_1__.gameController.userName;
    this.classList.add("player-seated");
    // assign slot
    const mainPlayer = this.gameController.currentPlayer; //p1
    this.shadowRoot.querySelector(".seat-label").textContent = `座次：${mainPlayer}`;
    const curPlayerNum = Number(mainPlayer[1]);
    this.playerDoms.forEach((player) => {
      for (let slot = 0; slot < this.playerCount; slot++) {
        player.classList.remove(`slot${slot}`);
      }
    });

    // Slots follow the table perimeter clockwise from the local player:
    // local -> four seats across the top from left to right -> right side.
    for (let offset = 0; offset < this.playerCount; offset++) {
      const seatNumber = ((curPlayerNum - 1 + offset) % this.playerCount) + 1;
      const playerDom = this.shadowRoot.querySelector(
        `sg-player[data-key="p${seatNumber}"]`
      );
      playerDom.classList.add(`slot${offset}`);
    }
    const currentPlayerDom = this.shadowRoot.querySelector(
      `sg-player[data-key="${mainPlayer}"]`
    );
    this.shadowRoot.querySelector(".table-container").appendChild(currentPlayerDom);
    this.dispatchEvent(new CustomEvent('player-seat-changed'));
  }

  hideCardMenu() {
    if (!this.classList.contains("hide")) {
      this.cardMenu.classList.add("hide");
    }
  }

  showCardMenu() {
    this.cardMenu.querySelector(".selection-label").textContent = `已选 ${this.gameController.selectedCards.length} 张`;
    this.cardMenu.classList.remove("hide");
  }
}


customElements.define("sg-table", SgTable);


/***/ }),

/***/ "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27 preserveAspectRatio=%27none%27%3E%3Crect x=%272%27 y=%272%27 width=%2796%27 height=%2796%27 rx=%278%27 fill=%27none%27 stroke=%27%239fb6aa%27 stroke-opacity=%27.32%27 stroke-width=%272%27 stroke-dasharray=%277 6%27/%3E%3C/svg%3E":
/*!***************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27 preserveAspectRatio=%27none%27%3E%3Crect x=%272%27 y=%272%27 width=%2796%27 height=%2796%27 rx=%278%27 fill=%27none%27 stroke=%27%239fb6aa%27 stroke-opacity=%27.32%27 stroke-width=%272%27 stroke-dasharray=%277 6%27/%3E%3C/svg%3E ***!
  \***************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27 preserveAspectRatio=%27none%27%3E%3Crect x=%272%27 y=%272%27 width=%2796%27 height=%2796%27 rx=%278%27 fill=%27none%27 stroke=%27%239fb6aa%27 stroke-opacity=%27.32%27 stroke-width=%272%27 stroke-dasharray=%277 6%27/%3E%3C/svg%3E";

/***/ }),

/***/ "./docs/sango-design-memory.cjs":
/*!**************************************!*\
  !*** ./docs/sango-design-memory.cjs ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {

// Local-only fixture. This module replaces Firebase in the browser test bundle.
let data={},listeners=[],sequence=0;
const parts=p=>p.split('/').filter(Boolean);
function read(p){return parts(p).reduce((v,k)=>v?.[k],data)??null}
function reference(path=''){path=parts(path).join('/');return {path,key:parts(path).at(-1)||null,get parent(){return reference(parts(path).slice(0,-1).join('/'))},toString(){return 'https://test.local/'+path}}}
function snapshot(p){const value=read(p);return {key:parts(p).at(-1),exists:()=>value!==null,val:()=>structuredClone(value)}}
function write(p,value){const keys=parts(p);let v=data;for(const k of keys.slice(0,-1))v=v[k]??={};if(value===null)delete v[keys.at(-1)];else v[keys.at(-1)]=structuredClone(value)}
exports.seed=value=>{data=value};exports.read=read;
exports.ref=(_db,p='')=>reference(p);exports.child=(r,p)=>reference(r.path+'/'+p);
exports.get=async r=>snapshot(r.path);exports.getDatabase=()=>({});
exports.runTransaction=async(r,fn)=>{const value=fn(structuredClone(read(r.path)));if(value===undefined)return {committed:false};await exports.set(r,value);return {committed:true,snapshot:snapshot(r.path)}};
exports.onValue=(r,fn)=>{const listener=()=>fn(snapshot(r.path));listeners.push(listener);queueMicrotask(listener);return()=>listeners=listeners.filter(x=>x!==listener)};
exports.onChildAdded=(r,fn)=>{queueMicrotask(()=>Object.keys(read(r.path)||{}).forEach(k=>fn(snapshot(r.path+'/'+k))));return()=>{}};
exports.onChildRemoved=exports.onChildChanged=()=>()=>{};
exports.update=async(r,patch)=>{for(const [p,v]of Object.entries(patch))write(r.path+'/'+p,v);queueMicrotask(()=>[...listeners].forEach(fn=>fn()))};
exports.set=(r,v)=>exports.update(reference(),{[r.path]:v});exports.remove=r=>exports.set(r,null);exports.push=r=>reference(r.path+'/new'+(++sequence));

exports.serverTimestamp=()=>Date.now();


/***/ }),

/***/ "./src/actionLog.mjs":
/*!***************************!*\
  !*** ./src/actionLog.mjs ***!
  \***************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   appendActionLog: () => (/* binding */ appendActionLog),
/* harmony export */   applyRoomPatch: () => (/* binding */ applyRoomPatch),
/* harmony export */   describeChanges: () => (/* binding */ describeChanges)
/* harmony export */ });
/* harmony import */ var _cardOrder_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./cardOrder.mjs */ "./src/cardOrder.mjs");


const labels = {hand:'手牌',zhuang:'装备区',pan:'判定区',other1:'区1',other2:'区2',jiang:'选将区',jiang1:'主将',jiang2:'副将',pai:'牌堆',paiBottom:'牌堆底部',discard:'公共区'};
function areas(room) {
  const result = {};
  for (const [owner, data] of Object.entries(room || {})) {
    if (owner !== 'tableDecks' && !/^p\d+$/.test(owner)) continue;
    for (const [area, value] of Object.entries(data || {})) {
      if (labels[area]) result[`${owner}/${area}`] = value?.cards || {};
    }
  }
  return result;
}
function playerLabel(room, owner) {
  const name = room?.[owner]?.name;
  return name && name !== 'empty' ? name : owner;
}
function areaLabel(room, path) {
  const [owner, area] = path.split('/');
  if (owner === 'tableDecks') return area === 'discard' ? '公共区域' : labels[area];
  return `${playerLabel(room, owner)} 的${labels[area]}`;
}
function changesBetween(old, next) {
  return {
    removed: Object.keys(old).filter(key => !next[key] || next[key].id !== old[key].id),
    added: Object.keys(next).filter(key => !old[key] || next[key].id !== old[key].id),
  };
}
function describeMoves(before, after, oldAreas, newAreas) {
  const removals = new Map(), additions = new Map(), moved = new Map(), groups = new Map();
  const add = (index, id, value) => index.set(id, [...(index.get(id) || []), value]);
  for (const path of new Set([...Object.keys(oldAreas), ...Object.keys(newAreas)])) {
    const old = oldAreas[path] || {}, next = newAreas[path] || {}, {removed, added} = changesBetween(old, next);
    removed.forEach(key => add(removals, old[key].id, {path, key}));
    added.forEach(key => add(additions, next[key].id, {path, key}));
  }
  for (const [id, sources] of removals) {
    const targets = additions.get(id) || [];
    for (let index = 0; index < Math.min(sources.length, targets.length); index++) {
      const source = sources[index], target = targets[index];
      if (source.path === target.path) continue;
      moved.set(source.path, new Set([...(moved.get(source.path) || []), source.key]));
      moved.set(target.path, new Set([...(moved.get(target.path) || []), target.key]));
      const groupKey = `${source.path}|${target.path}`;
      groups.set(groupKey, (groups.get(groupKey) || 0) + 1);
    }
  }
  const moves = [...groups].map(([paths, count]) => {
    const [source, target] = paths.split('|');
    return `从 ${areaLabel(after, source)} 移除 ${count} 张牌，置入 ${areaLabel(after, target)}`;
  });
  return {moves, moved};
}
function detectDraw(before, after) {
  const oldAreas = areas(before), newAreas = areas(after), changed = [];
  for (const path of new Set([...Object.keys(oldAreas), ...Object.keys(newAreas)])) {
    const old = oldAreas[path] || {}, next = newAreas[path] || {}, delta = changesBetween(old, next);
    if (delta.removed.length || delta.added.length) changed.push({path, old, next, ...delta});
  }
  if (changed.length !== 2) return null;
  const source = changed.find(item => /^tableDecks\/(pai|paiBottom)$/.test(item.path));
  const target = changed.find(item => /^p\d+\/hand$/.test(item.path));
  if (!source || !target || source.added.length || target.removed.length || source.removed.length !== target.added.length) return null;
  const removedIds = source.removed.map(key => source.old[key].id).sort();
  const addedIds = target.added.map(key => target.next[key].id).sort();
  if (removedIds.some((id, index) => id !== addedIds[index])) return null;
  return {seat: target.path.split('/')[0], count: addedIds.length};
}

// Public records never contain card IDs, suits, ranks, or hidden general names.
function describeChanges(before, after) {
  const changes = [], oldAreas = areas(before), newAreas = areas(after);
  const {moves, moved} = describeMoves(before, after, oldAreas, newAreas);
  changes.push(...moves);
  for (const path of new Set([...Object.keys(oldAreas), ...Object.keys(newAreas)])) {
    const old = oldAreas[path] || {}, next = newAreas[path] || {}, label = areaLabel(after, path);
    const {removed, added} = changesBetween(old, next);
    const movedKeys = moved.get(path) || new Set();
    const remainingRemoved = removed.filter(key => !movedKeys.has(key));
    const remainingAdded = added.filter(key => !movedKeys.has(key));
    if (remainingRemoved.length) changes.push(`${label}移出 ${remainingRemoved.length} 张牌`);
    if (remainingAdded.length) {
      const effects = remainingAdded.map(key=>next[key].judgmentEffect).filter(Boolean);
      changes.push(`${label}移入 ${remainingAdded.length} 张牌${effects.length ? `（${effects.join('、')}）` : ''}`);
    }
    const stable = Object.keys(next).filter(key=>old[key]?.id === next[key].id);
    const shown = stable.filter(key=>String(old[key].show || '0') !== String(next[key].show || '0'));
    for (const state of ['0','1']) {
      const count = shown.filter(key=>String(next[key].show || '0') === state).length;
      if (count) changes.push(`${label}${state === '1' ? '亮出' : '暗置'} ${count} 张`);
    }
    for (const key of stable) {
      if (old[key].judgmentEffect !== next[key].judgmentEffect) changes.push(`${label}判定效果：${old[key].judgmentEffect || '无'} → ${next[key].judgmentEffect || '无'}`);
    }
    if (!removed.length && !added.length && JSON.stringify((0,_cardOrder_mjs__WEBPACK_IMPORTED_MODULE_0__.orderedEntries)(old).map(x=>x.key)) !== JSON.stringify((0,_cardOrder_mjs__WEBPACK_IMPORTED_MODULE_0__.orderedEntries)(next).map(x=>x.key))) {
      changes.push(`${label}调整牌序${path.endsWith('/pan') ? `（${(0,_cardOrder_mjs__WEBPACK_IMPORTED_MODULE_0__.orderedEntries)(next).map(x=>x.value.judgmentEffect || '判定牌').join(' → ')}）` : ''}`);
    }
  }
  for (const seat of new Set([...Object.keys(before || {}), ...Object.keys(after || {})])) {
    if (!/^p\d+$/.test(seat)) continue;
    const old = before?.[seat] || {}, next = after?.[seat] || {};
    const player = playerLabel(after, seat);
    if (old.hp !== next.hp) changes.push(`${player} 的体力：${old.hp || '未设置'} → ${next.hp || '未设置'}`);
    for (const [index, label] of ['翻面','连环'].entries()) {
      const was = old.debuff?.[index] === '1', now = next.debuff?.[index] === '1';
      if (was !== now) changes.push(`${player} ${label}${now ? '开启' : '解除'}`);
    }
    if (old.role !== next.role) changes.push(`${player} 的身份已更新`);
    if (Boolean(old.jiangLocked) !== Boolean(next.jiangLocked)) changes.push(`${player}${next.jiangLocked ? '确认选将' : '解除选将锁定'}`);
  }
  return changes;
}

function appendActionLog(before, after, key, actor, timestamp, action = '') {
  const draw = detectDraw(before, after);
  const drawText = count => {
    const player = playerLabel(after, draw.seat);
    return `${player === actor ? '' : `让 ${player} `}摸了${count}张牌`;
  };
  const changes = draw ? [drawText(draw.count)] : describeChanges(before, after);
  if (!changes.length) return after;
  const logs = {...before?.actionLogs};
  const latestKey = Object.keys(logs).sort().at(-1);
  const latest = latestKey ? logs[latestKey] : null;
  if (draw && latest?.aggregate?.type === 'draw' && latest.actor === actor && latest.aggregate.seat === draw.seat) {
    const count = Number(latest.aggregate.count || 0) + draw.count;
    logs[latestKey] = {...latest, timestamp, changes: [drawText(count)], aggregate: {type: 'draw', seat: draw.seat, count}};
  } else {
    logs[key] = {actor, timestamp, action, changes, ...(draw ? {aggregate: {type: 'draw', seat: draw.seat, count: draw.count}} : {})};
  }
  after.actionLogs = logs;
  // Keep room transactions bounded; retain the latest 500 committed operations.
  const keys = Object.keys(after.actionLogs).sort();
  for (const expired of keys.slice(0, Math.max(0, keys.length - 500))) delete after.actionLogs[expired];
  return after;
}

function applyRoomPatch(room, patch, prefix) {
  const next = structuredClone(room || {});
  for (const [path, value] of Object.entries(patch)) {
    if (!path.startsWith(prefix)) throw Error('只能修改当前房间');
    const keys = path.slice(prefix.length).split('/');
    if (keys[0] === 'actionLogs') throw Error('日志由操作自动生成');
    let parent = next;
    for (const key of keys.slice(0,-1)) parent = parent[key] ??= {};
    if (value === null) delete parent[keys.at(-1)];
    else parent[keys.at(-1)] = structuredClone(value);
  }
  return next;
}


/***/ }),

/***/ "./src/cardOrder.mjs":
/*!***************************!*\
  !*** ./src/cardOrder.mjs ***!
  \***************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   dealOpeningHands: () => (/* binding */ dealOpeningHands),
/* harmony export */   judgmentEffects: () => (/* binding */ judgmentEffects),
/* harmony export */   orderedEntries: () => (/* binding */ orderedEntries),
/* harmony export */   orderedMovePatch: () => (/* binding */ orderedMovePatch)
/* harmony export */ });
function orderedEntries(cards = {}, judgment = false) {
  return Object.entries(cards).reverse().map(([key, value], index) => ({key, value, index}))
    .sort((a, b) => (a.value.order ?? (judgment ? a.value.panOrder : undefined) ?? a.index * 1024)
      - (b.value.order ?? (judgment ? b.value.panOrder : undefined) ?? b.index * 1024));
}

// Build a complete deal so the transaction cannot leave a partially dealt table.
function dealOpeningHands(room, playerCount) {
  if (!room || !Number.isInteger(playerCount) || playerCount < 1) throw Error('房间尚未准备好');
  const seats = Array.from({length: playerCount}, (_, i) => `p${i + 1}`);
  if (seats.some(seat => Object.keys(room[seat]?.hand?.cards || {}).length)) {
    throw Error('只有所有玩家手牌为空时才能发牌');
  }
  const deck = ['pai', 'paiBottom'].flatMap(area =>
    orderedEntries(room.tableDecks?.[area]?.cards || {}).map(card => ({...card, area})));
  if (deck.length < playerCount * 4) throw Error(`牌堆不足，需要 ${playerCount * 4} 张牌`);
  const next = structuredClone(room);
  seats.forEach((seat, seatIndex) => {
    next[seat] ??= {};
    next[seat].hand ??= {};
    next[seat].hand.cards = {};
    deck.slice(seatIndex * 4, seatIndex * 4 + 4).forEach(({key, value, area}, index) => {
      const card = {...value, show: '0', order: index * 1024};
      delete card.panOrder;
      delete card.judgmentEffect;
      next[seat].hand.cards[`deal${index}`] = card;
      delete next.tableDecks[area].cards[key];
    });
  });
  return next;
}

// Produce one atomic multi-path update, including both removal and insertion.
const judgmentEffects = ['乐不思蜀', '兵粮寸断', '闪电'];

function orderedMovePatch(targetPath, targetCards, sources, beforeKey, newKey, effects = {}, legacyEffect = () => null) {
  const sourcePaths = new Set(sources.map(source => source.path));
  const remaining = orderedEntries(targetCards, targetPath.includes('/pan/'))
    .filter(item => !sourcePaths.has(`${targetPath}/${item.key}`));
  const incoming = sources.map(source => ({
    key: source.path.slice(0, source.path.lastIndexOf('/')) === targetPath ? source.path.split('/').pop() : newKey(),
    value: {...source.value}, source,
  }));
  const judgment = targetPath.includes('/pan/');
  if (judgment) {
    const used = new Set(remaining.map(item => item.value.judgmentEffect || legacyEffect(item.value)).filter(Boolean));
    for (const item of incoming) {
      const sameArea = item.source.path.startsWith(`${targetPath}/`);
      const effect = sameArea ? item.value.judgmentEffect || legacyEffect(item.value) : effects[item.source.path];
      if (!judgmentEffects.includes(effect)) throw Error('请选择判定效果：乐不思蜀、兵粮寸断或闪电');
      if (used.has(effect)) throw Error(`判定区已有${effect}，每种效果只能放一张牌`);
      used.add(effect);
      item.value.judgmentEffect = effect;
    }
    if (remaining.length + incoming.length > 3) throw Error('判定区最多放三张牌');
  }
  if (targetPath.includes('/zhuang/') && remaining.length + incoming.length > 4) throw Error('装备区最多放四张牌');
  const prepend=beforeKey==null&&/\/(hand|other1|other2)\/cards$/.test(targetPath)&&sources.every(source=>!source.path.startsWith(`${targetPath}/`));
  const index = beforeKey == null ? (prepend?0:remaining.length) : remaining.findIndex(item => item.key === beforeKey);
  if (index < 0) throw Error('目标牌已移动，请重新拖放');
  remaining.splice(index, 0, ...incoming);
  const patch = {};
  remaining.forEach((item, index) => {
    const path = `${targetPath}/${item.key}`, order = index * 1024;
    if (item.source && item.source.path !== path) {
      patch[item.source.path] = null;
      item.value.show = '0';
      delete item.value.panOrder;
      if (!judgment) delete item.value.judgmentEffect;
      if (targetPath.includes('/pan/')) item.value.panOrder = Date.now() + index;
      patch[path] = {...item.value, order};
    } else if (item.value.order !== order) patch[`${path}/order`] = order;
  });
  return patch;
}


/***/ }),

/***/ "./src/databaseLocks.mjs":
/*!*******************************!*\
  !*** ./src/databaseLocks.mjs ***!
  \*******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   acquireLocks: () => (/* binding */ acquireLocks)
/* harmony export */ });
function lockKey(resource) {
  return btoa(resource).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

async function acquireLocks(resources, context) {
  const unique = [...new Set(resources)].sort();
  const token = context.newToken();
  const acquired = [];
  const expiresAt = Date.now() + context.ttlMs;
  try {
    for (const resource of unique) {
      const lockPath = `${context.lockRootPath}/${lockKey(resource)}`;
      const lockRef = context.makeRef(lockPath);
      const result = await context.runTransaction(lockRef, current => {
        if (current?.expiresAt > Date.now() && current.token !== token) return undefined;
        return {token, expiresAt};
      }, {applyLocally: false});
      if (!result.committed || result.snapshot.val()?.token !== token) throw Error('该区域正在被其他玩家操作，请重试');
      acquired.push(lockPath);
    }
    return {
      token,
      releasePatch: () => Object.fromEntries(acquired.map(path => [path, null])),
      release: () => acquired.length ? context.updateRoot(Object.fromEntries(acquired.map(path => [path, null]))) : Promise.resolve(),
    };
  } catch (error) {
    if (acquired.length) await context.updateRoot(Object.fromEntries(acquired.map(path => [path, null])));
    throw error;
  }
}


/***/ }),

/***/ "./src/localActionLog.mjs":
/*!********************************!*\
  !*** ./src/localActionLog.mjs ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ACTION_HINT_OPCODE: () => (/* binding */ ACTION_HINT_OPCODE),
/* harmony export */   createActionNonce: () => (/* binding */ createActionNonce),
/* harmony export */   createCardTransfers: () => (/* binding */ createCardTransfers),
/* harmony export */   createLocalLogEntry: () => (/* binding */ createLocalLogEntry),
/* harmony export */   decodeActionHint: () => (/* binding */ decodeActionHint),
/* harmony export */   encodeActionHint: () => (/* binding */ encodeActionHint)
/* harmony export */ });
/* harmony import */ var _actionLog_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./actionLog.mjs */ "./src/actionLog.mjs");


// Stable protocol codes must never be reassigned to a different meaning.
// They are enums rather than hashes so decoding is collision-free and debuggable.
const ACTION_HINT_OPCODE = Object.freeze({
  DISCARD_OTHER:'d', DRAW_FOR_OTHER:'m', TRANSFER_CARD:'t', MOVE_OTHER:'o',
  DEAL_CARDS:'c', DEAL_GENERALS:'j', ASSIGN_ROLES:'i', SHUFFLE:'s',
  RESET_DECK:'r', RESET_TABLE:'x',
  PLAY:'p', DISCARD:'e', DRAW:'w', REVEAL_JUDGMENT:'v',
  TAKE_DISCARD:'k', REARRANGE_DECK:'u',
});

const VALID_OPCODES = new Set(Object.values(ACTION_HINT_OPCODE));
const NONCE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const AREA_NAMES = {hand:'手牌',zhuang:'装备区',pan:'判定区',other1:'区1',other2:'区2',jiang:'选将区',jiang1:'主将',jiang2:'副将',pai:'牌堆',paiBottom:'牌堆底部',discard:'公共区'};

function createActionNonce() {
  const bytes = new Uint8Array(4);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let i=0;i<bytes.length;i++) bytes[i]=Math.floor(Math.random()*256);
  return [...bytes].map(value=>NONCE_CHARS[value&63]).join('');
}

// Protocol v1 is "version|opcode|actor|...args|nonce". Target, count and card
// details are intentionally omitted when the atomic state diff can infer them.
// The nonce makes consecutive identical actions observable; it is not a history ID.
function encodeActionHint(opcode, actorSeat, args=[], nonce=createActionNonce()) {
  if (!VALID_OPCODES.has(opcode)) throw Error('未知的日志操作码');
  const match=String(actorSeat||'').match(/^p(\d+)$/);
  const fields=['1',opcode,match?Number(match[1]).toString(36):'0',...args.map(String),nonce];
  if(fields.some(value=>!value||value.includes('|')))throw Error('无效的日志提示参数');
  return fields.join('|');
}

// Unknown protocol data safely falls back to an ordinary state-diff log.
function decodeActionHint(value) {
  if(typeof value!=='string')return null;
  const fields=value.split('|'),actor=Number.parseInt(fields[2],36),nonce=fields.at(-1);
  if(fields.length<4||fields[0]!=='1'||!VALID_OPCODES.has(fields[1])||!Number.isInteger(actor)||actor<0||!/^[A-Za-z0-9_-]{4}$/.test(nonce))return null;
  return {opcode:fields[1],actorSeat:actor?`p${actor}`:null,args:fields.slice(3,-1),nonce};
}

function playerName(room,seat){const name=room?.[seat]?.name;return name&&name!=='empty'?name:seat;}
function areaName(room,path){const [owner,area]=path.split('/');return owner==='tableDecks'?(AREA_NAMES[area]||area):`${playerName(room,owner)} 的${AREA_NAMES[area]||area}`;}
function areas(room){
  const result={};
  for(const [owner,data] of Object.entries(room||{})){
    if(owner!=='tableDecks'&&!/^p\d+$/.test(owner))continue;
    for(const [area,value] of Object.entries(data||{}))if(AREA_NAMES[area])result[`${owner}/${area}`]=value?.cards||{};
  }
  return result;
}
function moves(before,after){
  const oldAreas=areas(before),newAreas=areas(after),removed=new Map(),added=new Map(),groups=new Map();
  const add=(map,id,item)=>map.set(id,[...(map.get(id)||[]),item]);
  for(const path of new Set([...Object.keys(oldAreas),...Object.keys(newAreas)])){
    const old=oldAreas[path]||{},next=newAreas[path]||{};
    Object.keys(old).filter(key=>!next[key]||next[key].id!==old[key].id).forEach(key=>add(removed,old[key].id,{path,key}));
    Object.keys(next).filter(key=>!old[key]||old[key].id!==next[key].id).forEach(key=>add(added,next[key].id,{path,key}));
  }
  for(const [id,sources] of removed){
    const targets=added.get(id)||[];
    for(let i=0;i<Math.min(sources.length,targets.length);i++){
      if(sources[i].path===targets[i].path)continue;
      const key=`${sources[i].path}|${targets[i].path}`;
      const group=groups.get(key)||{source:sources[i].path,target:targets[i].path,count:0};group.count++;groups.set(key,group);
    }
  }
  return [...groups.values()];
}

function transferLabel(hint, source, target) {
  const opcode=hint?.opcode;
  if(opcode===ACTION_HINT_OPCODE.PLAY)return '打出';
  if(opcode===ACTION_HINT_OPCODE.DISCARD||opcode===ACTION_HINT_OPCODE.DISCARD_OTHER)return '弃置';
  if(opcode===ACTION_HINT_OPCODE.REVEAL_JUDGMENT)return '展示／判定';
  if(opcode===ACTION_HINT_OPCODE.TAKE_DISCARD)return '收入手牌';
  if(opcode===ACTION_HINT_OPCODE.DRAW||opcode===ACTION_HINT_OPCODE.DRAW_FOR_OTHER)return '摸牌';
  if(opcode===ACTION_HINT_OPCODE.TRANSFER_CARD)return '交牌';
  if(/^tableDecks\/(pai|paiBottom)$/.test(source)&&/^p\d+\//.test(target))return '摸牌';
  if(/^tableDecks\/(pai|paiBottom)$/.test(source)&&target==='tableDecks/discard')return '展示／判定';
  if(source==='tableDecks/discard'&&/^p\d+\//.test(target))return '收入手牌';
  if(/^p\d+\//.test(source)&&target==='tableDecks/discard')return '移入弃牌堆';
  if(/^p\d+\//.test(source)&&/^p\d+\//.test(target))return '交牌';
  return '移动';
}

// The local UI can animate real card movement from the same room snapshots used
// by the action log. No persisted animation queue or additional listener is needed.
function createCardTransfers(before,after) {
  const hint=before?.runtime?.a!==after?.runtime?.a?decodeActionHint(after?.runtime?.a):null;
  return moves(before,after).map(move=>({...move,label:transferLabel(hint,move.source,move.target)}));
}

function hintedChanges(hint,before,after){
  const moved=moves(before,after);
  switch(hint.opcode){
    case ACTION_HINT_OPCODE.DISCARD_OTHER:return moved.filter(x=>/^p\d+\//.test(x.source)&&x.target==='tableDecks/discard').map(x=>`弃置了 ${playerName(after,x.source.split('/')[0])} 的 ${x.count} 张牌`);
    case ACTION_HINT_OPCODE.DRAW_FOR_OTHER:return moved.filter(x=>/^tableDecks\/(pai|paiBottom)$/.test(x.source)&&/^p\d+\/hand$/.test(x.target)).map(x=>`让 ${playerName(after,x.target.split('/')[0])} 摸了 ${x.count} 张牌`);
    case ACTION_HINT_OPCODE.TRANSFER_CARD:return moved.filter(x=>/^p\d+\//.test(x.source)&&/^p\d+\//.test(x.target)).map(x=>`将 ${x.count} 张牌交给 ${playerName(after,x.target.split('/')[0])}`);
    case ACTION_HINT_OPCODE.MOVE_OTHER:return moved.map(x=>`将 ${x.count} 张牌从 ${areaName(after,x.source)} 移到 ${areaName(after,x.target)}`);
    case ACTION_HINT_OPCODE.DEAL_CARDS:return ['为所有玩家发牌'];
    case ACTION_HINT_OPCODE.DEAL_GENERALS:return ['为所有玩家发将'];
    case ACTION_HINT_OPCODE.ASSIGN_ROLES:return ['重新分配了身份'];
    case ACTION_HINT_OPCODE.SHUFFLE:{const names={p:'牌堆',b:'牌堆底部',d:'公共区',h:'手牌',z:'装备区',n:'判定区',o:'卡牌区',j:'选将区'};return [`洗混了${names[hint.args[0]]||'卡牌'}`];}
    case ACTION_HINT_OPCODE.RESET_DECK:return ['重置并洗混了牌堆'];
    case ACTION_HINT_OPCODE.RESET_TABLE:return ['清空了桌面'];
    case ACTION_HINT_OPCODE.PLAY:return moved.filter(x=>x.target==='tableDecks/discard').map(x=>`打出了 ${x.count} 张牌`);
    case ACTION_HINT_OPCODE.DISCARD:return moved.filter(x=>x.target==='tableDecks/discard').map(x=>`弃置了 ${x.count} 张牌`);
    case ACTION_HINT_OPCODE.DRAW:return moved.filter(x=>/^tableDecks\/(pai|paiBottom)$/.test(x.source)&&/^p\d+\/hand$/.test(x.target)).map(x=>`摸了 ${x.count} 张牌`);
    case ACTION_HINT_OPCODE.REVEAL_JUDGMENT:return moved.filter(x=>/^tableDecks\/(pai|paiBottom)$/.test(x.source)&&x.target==='tableDecks/discard').map(x=>`展示／判定了牌堆顶 ${x.count} 张牌`);
    case ACTION_HINT_OPCODE.TAKE_DISCARD:return moved.filter(x=>x.source==='tableDecks/discard'&&/^p\d+\/hand$/.test(x.target)).map(x=>`从弃牌堆收入了 ${x.count} 张牌`);
    case ACTION_HINT_OPCODE.REARRANGE_DECK:return ['调整了牌堆顺序'];
    default:return [];
  }
}

function createLocalLogEntry(before,after,timestamp=Date.now()){
  const hint=before?.runtime?.a!==after?.runtime?.a?decodeActionHint(after?.runtime?.a):null;
  if(hint){const changes=hintedChanges(hint,before,after);if(changes.length)return {actor:hint.actorSeat?playerName(after,hint.actorSeat):'玩家',timestamp,changes};}
  const changes=(0,_actionLog_mjs__WEBPACK_IMPORTED_MODULE_0__.describeChanges)(before,after);
  return changes.length?{actor:null,timestamp,changes}:null;
}


/***/ }),

/***/ "./src/data/jiang.json":
/*!*****************************!*\
  !*** ./src/data/jiang.json ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"j1":{"name":"刘备","force":"蜀","gender":"M","health":"4","skill":"仁德: 出牌阶段, 你可以将任意张手牌交给其他角色, 然后你本阶段以此法给出第二张牌时, 你回复1点体力。/激将：主公技，其他蜀势力角色可以在你需要时代替你使用或打出【杀】（视为由你使用或打出）。"},"j2":{"name":"界刘备","force":"蜀","gender":"M","health":"4","skill":"仁德: 出牌阶段，每名角色限一次，你可以交给一名其他角色任意张手牌。当你本阶段以此法给出第二张牌时，你可以视为使用一张基本牌（使用【杀】有次数限制）。/激将：主公技，其他蜀势力角色可以在你需要时代替你使用或打出【杀】（视为由你使用或打出）；每回合限一次，其他蜀势力角色于其回合外使用，打出或替你使用或打出【杀】时，其可以令你摸一张牌。"},"j3":{"name":"界曹操","force":"魏","gender":"M","health":"4","skill":"奸雄: 当你受到伤害后，你可以摸一张牌，并获得造成此伤害的牌。/护驾：主公技，其他魏势力角色可以在你需要时代替你使用或打出【闪】（然后视为由你使用或打出）。每回合限一次，当其他魏势力角色于其回合外使用或打出【闪】时，其可以令你摸一张牌。"},"j4":{"name":"界孙权","force":"吴","gender":"M","health":"4","skill":"制衡: 出牌阶段限一次，你可以弃置任意张牌，然后摸等量张牌，若你以此法弃置了所有手牌，你额外摸一张牌。/救援：主公技，其他吴势力角色于其回合内回复体力时，若其体力值大于等于你，则其可以改为令你回复一点体力，然后其摸一张牌。"},"j5":{"name":"界刘禅","force":"蜀","gender":"M","health":"3","skill":"享乐: 锁定技, 当你成为一名角色使用【杀】的目标后, 其选择一项: 1.弃置一张基本牌; 2.令此【杀】对你无效。/放权: 你可以跳过出牌阶段, 然后弃牌阶段开始时, 你可以弃置一张手牌并令一名其他角色执行一个额外的回合。/若愚：主公技，觉醒技，准备阶段，若你时全程体力值最小的角色，你增加1点体力上限，回复至3点体力,然后获得【激将】【思蜀】。/思蜀：出牌阶段开始时，你可以指定一名角色，令其本局【乐不思蜀】判定效果反转。"},"j6":{"name":"曹丕","force":"魏","gender":"M","health":"3","skill":"行殇: 当其他角色死亡时，你可以获得其所有牌。/放逐: 当你受到伤害后, 你可以令一名其他角色翻面, 并令其摸X张牌(X为你已损失体力值)。/颂威：主公技，当其他魏势力角色的黑色判定牌生效后，其可以令你摸一张牌。"},"j7":{"name":"黄盖","skill":"苦肉：出牌阶段，你可以失去一点体力，然后摸两张牌。","force":"吴","gender":"M","health":"4"},"j8":{"name":"界黄忠","skill":"烈弓：你【杀】的攻击范围为此【杀】点数。当你使用【杀】指定目标后，你可以执行以下效果： 1.若其手牌数不大于你，其不能抵消此【杀】； 2. 若其体力值不小于你，此【杀】伤害值+1。","force":"蜀","gender":"M","health":"4"},"j9":{"name":"曹仁","skill":"据守：结束阶段，你可以翻面并摸四张牌，然后弃置一张手牌，若为装备牌，你改为使用之。/解围：你可以将装备区里的牌当【无懈可击】使用。当你从背面翻至正面时，你可以弃置一张牌，然后移动场上一张牌。","force":"魏","gender":"M","health":"4"},"j10":{"name":"界张昭张纮","skill":"直谏：出牌阶段，你可以将一张装备牌置于一名其他角色的装备区（替换原装备），然后摸一张牌。/固政：每阶段限一次，当其他角色的至少两张牌因弃置置入弃牌堆后，你可以令其获得其中一张牌，然后你可以获得剩余牌。","force":"吴","gender":"M","health":"3"},"j11":{"name":"刘协","skill":"天命：当你成为【杀】的目标后，你可以：弃置两张牌（不足则全弃），摸两张牌。若全场体力值唯一最大的角色不为你，其可以如此做。/密诏：出牌阶段限一次，你可以交给一名其他角色所有手牌，然后令其与另一名其他角色拼点：拼点赢的角色视为对没赢的角色使用一张【杀】。","force":"群","gender":"M","health":"3"},"j12":{"name":"袁术","skill":"庸肆：锁定技，摸牌阶段，你多模X张牌；弃牌阶段开始时，你弃置X张牌。（X为全场势力数）/伪帝：锁定技，你视为拥有主公的主公技。","force":"群","gender":"M","health":"4"},"j13":{"name":"SP孙尚香","skill":"良助：当一名角色于其出牌阶段内回复体力后，你可以选择一项：1.摸一张牌；2.令其摸两张牌。/返乡：觉醒技，准备阶段，若场上有你发动过【良助】令其摸牌且已受伤的角色，你增加1点体力上限并回复1点体力，失去【良助】并获得【枭姬】。","force":"蜀","gender":"F","health":"3"},"j14":{"name":"SP马超","skill":"追击：锁定技，你计算与体力值不大于你的角色的距离视为1。当你使用【杀】指定距离为1的角色为目标后，其弃置一张牌或重铸其装备区里的所有牌。/誓仇：你使用的【杀】可以多指定X+1个目标（X为你已损失体力值）。","force":"群","gender":"M","health":"4"},"j15":{"name":"SP赵云","skill":"龙胆：你可以将一张【杀】当【闪】，【闪】当【杀】使用或打出。/冲阵：当你发动【龙胆】时，你可以获得对方的一张手牌。","force":"群","gender":"M","health":"3"},"j16":{"name":"SP貂蝉","skill":"离魂：出牌阶段限一次，你可以弃置一张牌，翻面并获得一名男性角色的所有手牌。出牌阶段结束时，你交给其与其体力值等量的牌。/闭月：结束阶段，若你没有手牌，你可以摸两张牌，否则你可以摸一张牌。","force":"群","gender":"F","health":"3"},"j17":{"name":"SP贾诩","skill":"缜略：锁定技，你的普通锦囊牌不能被抵消；你不能成为延时锦囊牌的目标。/间书：限定技，出牌阶段，你可以交给一名其他角色一张黑色手牌，并选择另一名角色，然后令两者拼点：赢的角色弃置两张牌，没赢的角色失去1点体力。/拥嫡：限定技，回合开始时，你可以令一名其他男性角色增加1点体力上限，然后令其武将牌上的主公技生效。","force":"魏","gender":"M","health":"3","disable":"true"},"j18":{"name":"SP蔡文姬","skill":"陈情：每轮限一次，当一名角色进入濒死状态时，你可以令一名其他角色摸四张牌，然后弃置四张牌，若弃置牌包含四种花色，其视为对处于濒死状态的角色使用一张【桃】。/默识：结束阶段，你可以将一张手牌当你出牌阶段内使用过的第一张基本牌或普通锦囊牌使用，然后你可以将一张手牌当你出牌阶段使用过的第二张基本牌或普通锦囊牌使用。","force":"魏","gender":"F","health":"3"},"j19":{"name":"陈琳","skill":"笔伐：结束阶段，你可以将一张手牌暗置于一名其他角色的武将牌上，其下回合开始时观看之并选择一项：1.交给你一张类型相同的手牌并获得此牌；2.移去此牌并失去1点体力。/颂词：每名角色限一次，出牌阶段，你可以选择一项：1.令一名手牌数小于体力值的角色摸两张牌；2.令一名手牌数大于体力值的角色弃置两张牌。","force":"魏","gender":"M","health":"3","disable":"true"},"j20":{"name":"关银屏","skill":"雪恨：出牌阶段限一次，你可以弃置一张红色牌并横置至多X名角色（X为你已损失体力值且至少为1），然后对其中一名角色造成1点火焰伤害。/虎啸：锁定技，当你对一名角色造成火焰伤害后，其摸一张牌，你本回合对其使用牌无次数限制。/武继：觉醒技，结束阶段，若你本回合造成了至少3点伤害，你增加1点体力上限并回复1点体力，失去【虎啸】，然后从场上，牌堆或弃牌堆中获得【青龙偃月刀】。","force":"蜀","gender":"F","health":"3"},"j21":{"name":"夏侯霸","skill":"豹变：锁定技，若你的体力值：不大于3，你视为拥有【挑衅】；不大于2，你视为拥有【咆哮】；为1，你视为拥有【神速】。","force":"蜀","gender":"M","health":"4","disable":"true"},"j22":{"name":"大乔小乔","skill":"星舞：弃牌阶段开始时，你可以将一张牌置于你的武将牌上，然后你可以移去三张【星舞】牌或翻面并弃置两张手牌，弃置一名其他角色装备区里的所有牌，若其为男性\\\\女性，你对其造成2点\\\\1点伤害。/落雁：锁定技，若你有【星舞】牌，你视为拥有【天香】和【流离】。","force":"吴","gender":"F","health":"3"},"j23":{"name":"诸葛恪","skill":"傲才：当你在回合外需要使用或打出基本牌时，你可以观看牌堆顶两张牌，然后可以使用或打出其中的基本牌。/黩武：出牌阶段，你可以选择你攻击范围内的一名其他角色并弃置X张牌（X为其体力值），然后对其造成1点伤害。若其因此进入濒死状态，你失去1点体力且本回合本技能失效。","force":"吴","gender":"M","health":"3","disable":"true"},"j24":{"name":"曹昂","skill":"慷忾：当一名角色成为【杀】的目标后，若你与其距离1以内，你可以摸一张牌，然后展示并交给其一张牌，若为装备牌且其不是你，其可以使用之。","force":"魏","gender":"M","health":"4"},"j25":{"name":"诸葛瑾","skill":"缓释：当一名角色的判定牌生效前，你可以令其观看你的手牌并选择你的一张牌，然后你用此牌代替判定牌。/弘援：每阶段限一次，当你一次获得至少两张牌后，你可以交给至多两名其他角色各一张牌。/明哲：锁定技，当你于出牌阶段外失去红色牌后，你展示之并摸一张牌。","force":"吴","gender":"M","health":"3"},"j26":{"name":"张星彩","skill":"甚贤：每回合限一次，当其他角色在你的回合外因弃置而失去基本牌后，你可以摸一张牌。/枪舞：出牌阶段限一次，你可以判定，然后你本回合使用点数小于X的【杀】无距离限制，点数大于X的【杀】无次数限制（X为判定牌点数）。","force":"蜀","gender":"F","health":"3"},"j27":{"name":"丁奉","skill":"短兵：你使用【杀】可以多指定一名距离为1的角色为目标。你对距离为1的角色使用【杀】需两张【闪】才能抵消。/奋迅：出牌阶段限一次，你可以选择一名其他角色，然后你本回合计算于其的距离视为1，若如此做，若你直到结束阶段未对其造成过伤害，结束阶段，你弃置一张牌。","force":"吴","gender":"M","health":"4"},"j28":{"name":"潘凤","skill":"狂斧：出牌阶段限一次，你可以弃置一名角色装备区里的一张牌，视为使用一张无距离限制的【杀】。若此装备牌：不属于你且未造成伤害，你弃置两张手牌；属于你且造成了伤害，你摸两张牌。","force":"群","gender":"M","health":"4"},"j29":{"name":"马良","skill":"自书：锁定技，其他角色的回合结束后，你将此回合获得的手牌置入弃牌堆。当你于回合内不因本技能获得手牌后，你摸一张牌。/应援：当你于回合内使用牌后，你可以令一名其他角色获得牌堆中一张类型相同的牌。每回合每种类型限一次。","force":"蜀","gender":"M","health":"3","disable":"true"},"j30":{"name":"诸葛诞","skill":"功獒：锁定技，当其他角色死亡后，你增加1点体力上限并回复1点体力。/举义：觉醒技，准备阶段，若你的体力上限大于存活角色数，你摸与你的体力上限等量张牌，并获得【崩坏】和【威重】。/威重：锁定技，当你的体力上限变化时，你摸一张牌，若你的手牌数全场最少，改为摸两张牌。","force":"魏","gender":"M","health":"4"},"j31":{"name":"程昱","skill":"设伏：结束阶段，你可以记录一个非装备牌牌名并将一张手牌暗置于你的武将牌上，称为【伏兵】。当其他角色于你回合外使用以此法记录的手牌时，你可以移去一张【伏兵】令此牌无效。/贲育：当一名角色对你造成伤害后，你可以选择一项：1.将手牌摸至X张（至多摸至五张）；2.弃置至少X+1张手牌对其造成1点伤害。（X为其手牌数）","force":"魏","gender":"M","health":"3","disable":"true"},"j32":{"name":"何太后","skill":"鸩毒：每名角色出牌阶段开始时，你可以弃置一张手牌，然后其视为使用一张【酒】，若其不是你，你对其造成1点伤害。/戚乱：每回合结束后，你可以摸与本回合死亡角色数等量张牌，每有一名角色被你杀死，你额外摸两张牌。","force":"群","gender":"F","health":"3"},"j33":{"name":"孙鲁育","skill":"魅步：其他角色出牌阶段开始时，若你在其攻击范围内，你可以弃置一张牌，令其本回合视为拥有【止息】。若你弃置的牌不是【杀】或黑色锦囊牌，本回合其与你的距离视为1。/止息：锁定技，出牌阶段，若你本阶段使用过锦囊牌或者X张牌（X为你的体力值），你不能使用牌。/穆穆：出牌阶段开始时，你可以选择一项：1.弃置一名其他角色装备区里的一张牌；2/获得一名角色装备区里的一张防具牌，若如此做，你本回合不能使用或者打出【杀】。","force":"吴","gender":"F","health":"3","disable":"true"},"j34":{"name":"文聘","skill":"镇卫：当其他角色成为【杀】或黑色锦囊牌的唯一目标时，若其体力值小于你且使用者不为你，你可以弃置一张牌并选择一项：1.摸一张牌，然后代替其成为此牌目标；2.令此牌无效并移出游戏直到回合结束。","force":"魏","gender":"M","health":"4"},"j35":{"name":"孙皓","skill":"残蚀：摸牌阶段，你可以多摸X张牌（X为已受伤的角色数），然后当你本回合使用【杀】或普通锦囊牌时，弃置一张牌。/仇海：锁定技，当你受到伤害时，若你没有手牌，此伤害+1。/归命：主公技，锁定技，其他吴势力角色于你的回合内视为已受伤。","force":"吴","gender":"M","health":"5"},"j36":{"name":"SP姜维","skill":"困奋：锁定技，结束阶段，你失去1点体力，然后摸两张牌。/逢亮：觉醒技：当你进入濒死状态时，你减少1点体力上限并回复至2点体力，获得【挑衅】并修改【困奋】为可以失去1点体力。","force":"魏","gender":"M","health":"4"},"j37":{"name":"兀突骨","skill":"燃殇：锁定技，当你受到1点火焰伤害后，你获得1枚【燃】标记。结束阶段，你失去X点体力（X为【燃】的数量）。/悍勇：当你使用【南蛮入侵】或【万箭齐发】时，若你的体力值小于当前轮数，你可以令此牌伤害+1。","force":"群","gender":"M","health":"15"},"j38":{"name":"曹植","skill":"落英：当其他角色的梅花牌因弃置或判定而置入弃牌堆后，你可以获得其中任意张牌。/酒诗：你可以将武将牌翻至背面，视为使用一张【酒】。当你受到伤害时，若你的武将牌背面朝上，你可以于受到此伤害后翻至正面。","force":"魏","gender":"M","health":"3","disable":"true"},"j39":{"name":"高顺","skill":"陷阵：出牌阶段限一次，你可以拼点：若你赢，你本回合对被拼点者使用牌无距离和次数限制且无视其防具，你使用仅指定唯一目标的【杀】或普通锦囊牌可以多指定其为目标；若你没赢，你本回合不能使用【杀】且你的【杀】不计入手牌上限。/禁酒：锁定技，你的【酒】视为【杀】。","force":"群","gender":"M","health":"4"},"j40":{"name":"陈宫","skill":"明策：出牌阶段限一次，你可以交给一名其他角色一张【杀】或装备牌，然后其选择一项：1.视为对其攻击范围内你选择的另一名角色使用一张【杀】；2.摸一张牌。/智迟：锁定技，当你于回合外受到伤害后，本回合【杀】和普通锦囊牌对你无效。","force":"群","gender":"M","health":"3","disable":"true"},"j41":{"name":"杨修","skill":"啖酪：当你成为锦囊牌的目标后，若你不是此牌的唯一目标，你可以摸一张牌，然后此牌对你无效。/鸡肋：当你受到伤害后，你可以声明一种牌的类型，伤害来源本回合不能使用，打出或弃置你声明的此类手牌。","force":"魏","gender":"M","health":"3"},"j42":{"name":"SP曹仁","skill":"伪溃：出牌阶段限一次，你可以失去1点体力并观看一名有手牌的其他角色的手牌，若其中没有【闪】，你弃置其中一张牌，否则你视为对其使用一张【杀】，且你本回合计算与其的距离视为1。/励战：结束阶段，你可以令任意名已受伤角色摸一张牌。","force":"魏","gender":"M","health":"4"},"j43":{"name":"曹洪","skill":"援护：结束阶段，你可以将一张装备牌置入一名角色的装备区，若为：武器牌，你弃置其距离为1的一名角色区域里的一张牌；防具牌，其摸一张牌；坐骑牌，其回复1点体力。","force":"魏","gender":"M","health":"4"},"j44":{"name":"张宝","skill":"咒缚：出牌阶段限一次，你可以将一张牌置于一名其他角色的武将牌上，成为【咒】。当有【咒】的角色判定时，将【咒】作为判定牌。每回合结束时，你令本回合失去过【咒】的角色各失去1点体力。/影兵：锁定技，有【咒】的角色使用与【咒】颜色相同的牌时，你摸一张牌；若这是你第二次因此【咒】摸牌，你获得此【咒】。","force":"群","gender":"M","health":"3"},"j45":{"name":"乐进","skill":"骁果：其他角色的结束阶段，你可以弃置一张基本牌，令其选择一项：1.弃置一张装备牌，你摸一张牌；2.你对其造成1点伤害。","force":"魏","gender":"M","health":"4"},"j46":{"name":"凌统","skill":"旋风：当你于弃牌阶段弃置过至少两张牌，或失去装备区里的牌后，你可以弃置至多两名其他角色共计至多两张牌。","force":"吴","gender":"M","health":"4","disable":"true"},"j47":{"name":"马谡","skill":"散谣：出牌阶段各限一次，你可以弃置一张牌对一名体力值\\\\手牌数最大的角色造成1点伤害。/制蛮：当你对其他角色造成伤害时，你可以防止此伤害，然后获得其区域里的一张牌。","force":"蜀","gender":"M","health":"3"},"j48":{"name":"吴国太","skill":"甘露：出牌阶段限一次，你可以交换两名角色装备区里的牌（两者装备区里牌数之差不大于你已损失体力值，且牌数之和不小于1）。/补益：当一名角色进入濒死状态时，你可以展示其一张手牌，若为非基本牌，其弃置之并回复1点体力。","force":"吴","gender":"F","health":"3","disable":"true"},"j49":{"name":"徐盛","skill":"破军：当你于出牌阶段使用【杀】指定目标后，你可以将其至多X张牌移出游戏直到回合结束（X为其体力值）。","force":"吴","gender":"M","health":"4","disable":"true"},"j50":{"name":"张春华","skill":"绝情：锁定技，你即将造成的伤害视为失去体力。/伤逝：当你的手牌数小于X后，你可以将手牌摸至X张。（X为你已损失的体力值）。","force":"魏","gender":"F","health":"3","disable":"true"},"j51":{"name":"曹彰","skill":"将驰：摸牌阶段结束时，你可以选择一项：1.摸一张牌，本回合不能使用或打出【杀】且【杀】不计入手牌上限；2.弃置一张牌，本回合使用【杀】的限制次数+1且无距离限制。","force":"魏","gender":"M","health":"4"},"j52":{"name":"荀攸","skill":"奇策：出牌阶段限一次，你可以将所有手牌当任意普通锦囊牌使用。/智愚：当你受到伤害后，你可以摸一张牌，然后展示所有手牌，若颜色均相同，伤害来源弃置一张手牌。","force":"魏","gender":"M","health":"3","disable":"true"},"j53":{"name":"廖化","skill":"当先：锁定技，回合开始时，你执行一个额外的出牌阶段。/伏枥：限定技，当你处于濒死状态时，你可以回复至X点体力（X为全场势力数）并翻面。","force":"蜀","gender":"M","health":"4","disable":"true"},"j54":{"name":"马岱","skill":"马术：锁定技，你计算于其他角色的距离-1。/潜袭：准备阶段，你可以摸一张牌并弃置一张牌，然后令距离为1的一名角色本回合不能使用或打出与你弃置牌颜色相同的手牌。","force":"蜀","gender":"M","health":"4","disable":"true"},"j55":{"name":"步练师","skill":"安恤：出牌阶段限一次，你可以令一名其他角色展示并获得另一名手牌数大于其的其他角色一张手牌，若不为黑桃，你摸一张牌。/追忆：当你死亡时，你可以令一名其他角色（杀死你的角色除外）摸三张牌并回复1点体力。","force":"吴","gender":"F","health":"3","disable":"true"},"j56":{"name":"程普","skill":"疠火：你使用的普通【杀】可以视为火【杀】，若此牌造成伤害，你失去1点体力。你使用的火【杀】可以多指定一个目标。/醇醪：结束阶段，若你没有【醇】，你可以将任意张【杀】置于你的武将牌上，成为【醇】。当一名角色处于濒死状态时，你可以移去一张【醇】，然后其视为使用一张【酒】。","force":"吴","gender":"M","health":"4","disable":"true"},"j57":{"name":"韩当","skill":"弓骑：出牌阶段限一次，你可以弃置一张牌令你本回合攻击范围无限，若弃置牌为装备牌，你可以弃置一名角色一张牌。/解烦：限定技，出牌阶段，你可以选择一名角色，令所有攻击范围内包含其的角色各选择一项：1.弃置一张武器牌；2.令其摸一张牌。","force":"吴","gender":"M","health":"4","disable":"true"},"j58":{"name":"刘表","skill":"自守：摸牌阶段，你可以多模X张牌（X为全场势力数），然后防止你本回合对其他角色造成的伤害。/宗室：锁定技，你的手牌上限+X（X为全场势力数）。","force":"群","gender":"M","health":"3","disable":"true"},"j59":{"name":"钟会","skill":"权计：当你受到1点伤害后，你可以摸一张牌，然后将一张手牌置于你的武将牌上，成为【权】。你的手牌上限+X（X为【权】的数量）。/自立：觉醒技，准备阶段，若你【权】的数量不小于3，你回复1点体力或摸两张牌，然后减少1点体力上限，获得【排异】。/排异：出牌阶段限一次，你可以移去一张【权】令一名角色摸两张牌，若其手牌数大于你，你对其造成1点伤害。","force":"魏","gender":"M","health":"4","disable":"true"},"j60":{"name":"曹冲","skill":"称象：当你受到伤害后，你可以亮出牌堆顶四张牌，获得其中任意张点数和不大于13的牌。/仁心：当体力值为1的其他角色受到伤害时，你可以弃置一张装备牌并翻面，然后防止此伤害。","force":"魏","gender":"M","health":"3","disable":"true"},"j61":{"name":"郭淮","skill":"精策：结束阶段，若你于此回合内使用过的牌数量大于等于你的体力值，则你可以执行一个额外的摸牌或出牌阶段。若这些牌的花色数也大于等于你的体力值，则两项都选。","force":"魏","gender":"M","health":"4"},"j62":{"name":"满宠","skill":"峻刑：出牌阶段限一次，你可以弃置任意张手牌并令一名其他角色选择一项：1.弃置一张与你弃置牌类型皆不同的手牌；2.翻面，然后摸与你弃置牌数等量张牌。/御策：当你受到伤害后，你可以展示一张手牌令伤害来源选择一项：1.弃置一张与你展示牌类型不同的手牌；2.你回复1点体力。","force":"魏","gender":"M","health":"3","disable":"true"},"j63":{"name":"关平","skill":"龙吟：当一名角色于其出牌阶段内使用【杀】时，你可以弃置一张牌，令此【杀】不计入此阶段使用次数，若此【杀】为红色，你摸一张牌。","force":"蜀","gender":"M","health":"4","disable":"true"},"j64":{"name":"简雍","skill":"巧说：出牌阶段开始时，你可以拼点：若你赢，你本回合使用的下一张牌可以多指定或少指定一个目标（至少指定一个目标）；若你没赢，你本回合不能使用锦囊牌。/纵适：当你拼点赢时，你可以获得点数较小的拼点牌；当你拼点没赢时，你可以获得你的拼点牌。","force":"蜀","gender":"M","health":"3","disable":"true"},"j65":{"name":"刘封","skill":"陷嗣：准本阶段，你可以将至多两名角色的各一张牌置于你的武将牌上，成为【逆】。其他角色可以移去两张【逆】视为对你使用一张【杀】。","force":"蜀","gender":"M","health":"4","disable":"true"},"j66":{"name":"虞翻","skill":"纵玄：当你的牌因弃置而进入弃牌堆后，你可以将其中任意张牌置于牌堆顶。/直言：结束阶段，你可以令一名角色摸一张牌并展示之，若为装备牌，其使用之并回复1点体力。","force":"吴","gender":"M","health":"3","disable":"true"},"j67":{"name":"朱然","skill":"胆守：出牌阶段，你可以弃置X张牌并选择你攻击范围内的一名其他角色（X为你本阶段发动本技能的次数），若X为：1，你弃置其一张牌；2，其交给你一张牌；3，你对其造成1点伤害；不小于4，你与其各摸两张牌。","force":"吴","gender":"M","health":"4","disable":"true"},"j68":{"name":"伏皇后","skill":"惴恐：其他角色的回合开始时，若你已受伤，你可以与其拼点：若你赢，其本回合不能对除其以外的角色使用牌；若你没赢，其本回合与你的距离视为1。/求援：当你成为【杀】的目标时，你可以令另一名其他角色选择一项：1.交给你一张【闪】；2.成为此【杀】的额外目标。","force":"群","gender":"F","health":"3"},"j69":{"name":"李儒","skill":"绝策：结束阶段，你可以对一名没有手牌的其他角色造成1点伤害。/灭计：出牌阶段限一次，你可以将一张黑色锦囊牌置于牌堆顶并令一名有手牌的其他角色选择一项：1.弃置一张锦囊牌；2.依次弃置两张非锦囊牌。/焚城：限定技，出牌阶段，你可以令所有其他角色依次选择一项：1.弃置任意张牌（须比上家弃置的牌多）；2.受到你造成的2点火焰伤害。","force":"群","gender":"M","health":"3","disable":"true"},"j70":{"name":"法正","skill":"恩怨：当你获得一名其他角色至少两张牌后，你可以令其摸一张牌。当你受到1点伤害后，你可以令伤害来源选择一项：1.交给你一张手牌；2.失去1点体力。/眩惑：摸牌阶段，你可以改为令一名其他角色摸两张牌，令其选择一项：1.对其攻击范围内你指定的另一名角色使用一张【杀】；2.你获得其两张牌。","force":"蜀","gender":"M","health":"3","disable":"true"},"j71":{"name":"徐庶","skill":"无言：锁定技，防止你使用和受到的锦囊牌造成的伤害。/举荐：结束阶段，你可以弃置一张非基本牌并令一名其他角色选择一项：1.摸两张牌；2.回复1点体力；3.复原其武将牌。","force":"蜀","gender":"M","health":"3"},"j72":{"name":"王异","skill":"贞烈：当你成为【杀】或普通锦囊牌的目标后，你可以失去1点体力令此牌对你无效，然后你弃置使用者一张牌。/秘计：结束阶段，你可以摸X张牌（X为你已损失体力值），然后你可以交给其他角色X张手牌。","force":"魏","gender":"F","health":"3","disable":"true"},"j73":{"name":"关兴张苞","skill":"父魂：你可以将两张手牌当【杀】使用或打出。当你于出牌阶段以此法造成伤害后，你本回合获得【武圣】【咆哮】。","force":"蜀","gender":"M","health":"4","disable":"true"},"j74":{"name":"周泰","skill":"不屈：锁定技，当你处于濒死状态时，你将牌堆顶的一张牌置于你的武将牌上，成为【创】，若此牌点数于其他【创】均不同，你回复至1点体力，否则移去此牌。若你的武将牌上有【创】，你的手牌上限为【创】的数量。/奋激：当一名角色的手牌被弃置或获得后，你可以失去1点体力令其摸两张牌。","force":"吴","gender":"M","health":"4"},"j75":{"name":"界关羽","skill":"武圣：你可以将一张红色牌当【杀】使用或打出。你使用的方块【杀】无距离限制。/义绝：出牌阶段限一次，你可以弃置一张牌，然后令一名其他角色展示一张手牌。若此牌为：黑色，其本回合非锁定技失效且不能使用或打出手牌，你本回合对其使用的红桃【杀】伤害+1；红色，你获得之，然后你可以令其回复1点体力。","force":"蜀","gender":"M","health":"4"},"j76":{"name":"界张飞","skill":"咆哮：锁定技，你使用【杀】无次数限制。当你使用的【杀】被抵消后，你本回合下一次【杀】造成的伤害+1。/替身：限定技，准备阶段，你可以回复所有体力，然后摸X张牌（X为你回复的体力值）。","force":"蜀","gender":"M","health":"4"},"j77":{"name":"界赵云","skill":"龙胆：你可以将一张【杀】当【闪】，【闪】当【杀】，【酒】当【桃】，【桃】当【酒】使用或打出。/涯角：当你于回合外使用或打出手牌时，你可以展示牌堆顶一张牌，若这两张牌类型：相同，你可以令一名角色获得展示牌；不同，你可以弃置攻击范围内包含你的一名角色区域里的一张牌。","force":"蜀","gender":"M","health":"4"},"j78":{"name":"界马超","skill":"马术：锁定技，你计算于其他角色的距离-1。/铁骑：当你使用【杀】指定目标后，你可以令其本回合非锁定技失效，然后你判定，除非其弃置一张与判定结果花色相同的牌，否则其不能抵消此【杀】。","force":"蜀","gender":"M","health":"4"},"j79":{"name":"界徐庶","skill":"诛害：其他角色的结束阶段，若其本回合造成过伤害，则你可以将一张手牌当【杀】或【过河拆桥】对其使用。/潜心：觉醒技，当你造成伤害后，若你已受伤，你减少1点体力上限并获得【荐言】。/荐言：出牌阶段限一次，你可以声明一种牌的类型或颜色，然后将牌堆顶第一张符合你声明的牌交给一名男性角色。","force":"蜀","gender":"M","health":"4"},"j80":{"name":"界甘宁","skill":"奇袭：你可以将一张黑色牌当【过河拆桥】使用。/奋威：限定技，当一张锦囊牌指定多个目标后，你可以令此牌对任意个目标无效。","force":"吴","gender":"M","health":"4"},"j81":{"name":"界吕蒙","skill":"克己：若你未于本回合出牌阶段使用或打出过【杀】，你可以跳过弃牌阶段。/勤学：觉醒技，准备阶段或结束阶段，若你的手牌数比体力值多2或更多，你减少1点体力上限，回复1点体力或摸两张牌，然后获得【攻心】。/攻心：出牌阶段限一次，你可以观看一名其他角色的手牌，然后你可以展示其中一张红桃牌并选择一项：1.弃置此牌；2.将此牌置于牌堆顶。/博图：每轮限X次（X为存活角色数且至多为3），回合结束后，若本回合置入弃牌堆的牌包含四种花色，你可以执行一个额外回合。","force":"吴","gender":"M","health":"4"},"j82":{"name":"界黄盖","skill":"苦肉：出牌阶段限一次，你可以弃置一张牌，然后失去1点体力。/诈降：锁定技，当你失去1点体力后，你摸三张牌，若在你的出牌阶段，你本阶段使用红色【杀】无距离限制且不能被【闪】响应，且你使用【杀】的限制次数+1。","force":"吴","gender":"M","health":"4"},"j83":{"name":"界周瑜","skill":"英姿：锁定技，你多模一张牌。你的手牌上限为你的体力上限。/反间：出牌阶段限一次，你可以展示并交给一名其他角色一张手牌，其选择一项：1.展示所有手牌，弃置与此牌相同花色的牌；2.失去1点体力。","force":"吴","gender":"M","health":"3"},"j84":{"name":"界大乔","skill":"国色：出牌阶段限一次，你可以选择一项，然后摸一张牌：1.将一张方块牌当【乐不思蜀】使用；2.弃置一张方块牌和场上一张【乐不思蜀】。/流离：当你成为【杀】的目标时，你可以弃置一张牌并将此【杀】转移给你攻击范围内的一名其他角色。","force":"吴","gender":"F","health":"3"},"j85":{"name":"界陆逊","skill":"谦逊：当一张延时锦囊或其他角色使用的普通锦囊牌对你生效时，若你为唯一目标，你可以将所有手牌移出游戏直到回合结束。/连营：当你失去所有手牌后，你可以令至多X名角色各摸一张牌（X为你失去的手牌数）。","force":"吴","gender":"M","health":"3"},"j86":{"name":"界司马懿","skill":"反馈：当你受到1点伤害后，你可以获得伤害来源一张牌。/鬼才：当一张判定牌生效前，你可以用一张牌代替之。","force":"魏","gender":"M","health":"3"},"j87":{"name":"界夏侯惇","skill":"刚烈：当一名角色对你造成1点伤害后，你可以判定，若结果为：红色，你对其造成1点伤害；黑色，你弃置其一张牌。/清俭：每回合限一次，当你在摸牌阶段外获得牌后，你可以展示并交给一名其他角色任意张牌，令当前回合角色本回合手牌上限+X（X为你给出牌的类型数）。","force":"魏","gender":"M","health":"4"},"j88":{"name":"界张辽","skill":"突袭：摸牌阶段，你可以少摸任意张牌并获得等量其他角色的各一张手牌。","force":"魏","gender":"M","health":"4"},"j89":{"name":"界许褚","skill":"裸衣：摸牌阶段开始前，你可以亮出牌堆顶的三张牌，然后你可以跳过摸牌阶段并获得其中所有基本牌，武器牌和【决斗】，且直到你的下回合开始，你为伤害来源的【杀】和【决斗】对目标角色造成的伤害+1。","force":"魏","gender":"M","health":"4"},"j90":{"name":"界郭嘉","skill":"天妒：当你的判定牌生效后，你可以i获得此牌。/遗计：当你受到1点伤害后，你可以摸两张牌，然后你可以交给至多两名其他角色至多两张手牌。","force":"魏","gender":"M","health":"3"},"j91":{"name":"界李典","skill":"恂恂：摸牌阶段开始时，你可以观看牌堆顶的四张牌，然后将其中两张牌置于牌堆顶，将其余牌置于牌堆底。/忘隙：当你对其他角色造成1点伤害后，或受到其他角色的1点伤害后，你可以摸两张牌并交给该角色其中一张牌。","force":"魏","gender":"M","health":"3"},"j92":{"name":"界华佗","skill":"急救：在你的回合外，你可以将一张红色牌当【桃】使用。/除疠：出牌阶段限一次，你可以选择任意名势力各不相同的其他角色，弃置你和这些角色各一张牌，然后被弃置黑桃牌的角色各摸一张牌。","force":"群","gender":"M","health":"3"},"j93":{"name":"界吕布","skill":"无双：锁定技，你使用的【杀】需两张【闪】才能抵消；与你【决斗】的角色每次需打出两张【杀】。/利驭：当你使用【杀】对其他角色造成伤害后，你可以获得其区域里的一张牌，若获得的牌：不为装备牌，其摸一张牌；为装备牌，你视为对由其指定的另一名角色使用一张【决斗】。","force":"群","gender":"M","health":"5"},"j94":{"name":"界公孙瓒","skill":"趫猛：当你使用【杀】对一名角色造成伤害后，你可以弃置其区域里的一张牌。若此牌为坐骑牌，你获得之。/义从：锁定技，你计算与其他角色的距离-1；若你的体力值不大于2，其他角色计算与你的距离+1。","force":"群","gender":"M","health":"4"},"j95":{"name":"曹真","skill":"司敌：其他角色出牌阶段开始时，你可以弃置一张与你装备区里任意牌颜色相同的非基本牌，令其本阶段不能使用和打出与此牌颜色相同的牌，然后此阶段结束时，若其本阶段未使用过【杀】，你视为对其使用一张【杀】。","force":"魏","gender":"M","health":"4","disable":"true"},"j96":{"name":"韩浩史涣","skill":"慎断：当你的一张黑色基本牌被弃置后，你可以将此牌当无距离限制的【兵粮寸断】使用。/勇略：其他角色判定阶段开始时，若其在你的攻击范围内，你可以弃置其判定区里的一张牌视为对其使用一张【杀】，若此【杀】未造成伤害，你摸一张牌。","force":"魏","gender":"M","health":"4","disable":"true"},"j97":{"name":"陈群","skill":"品第：出牌阶段，每名角色限一次，你可以弃置一张本阶段未以此法弃置过的类型的牌，令一名其他角色摸X张牌或弃置X张牌（X为本回合本技能发动次数），若其已受伤，你横置。/法恩：当一名角色翻至正面或横置后，你可以令其摸一张牌。","force":"魏","gender":"M","health":"3","disable":"true"},"j98":{"name":"吴懿","skill":"奔袭：锁定技，当你于回合内使用牌时，你本回合计算与其他角色的距离-1.当你于回合内使用仅指定单一目标的【杀】或普通锦囊牌时，若你与所有其他角色的距离均为1，你依次选择至多两项，令此牌：1.目标数+1；2.无视防具；3.不能被抵消；4.造成伤害后，你摸一张牌。","force":"蜀","gender":"M","health":"4"},"j99":{"name":"周仓","skill":"忠勇：当你使用【杀】后，你可以将此【杀】或目标角色响应的【闪】交给一名其他角色，若此牌为红色，其可以对你攻击范围内一名角色使用一张【杀】。","force":"蜀","gender":"M","health":"4","disable":"true"},"j100":{"name":"张松","skill":"强识：出牌阶段开始时，你可以展示一名其他角色一张手牌，然后当你本阶段使用与展示牌类型相同的牌时，你可以摸一张牌。/献图：其他角色出牌阶段开始时，你可以摸两张牌，然后交给其两张牌，此阶段结束时，若其此阶段未杀死过角色，你失去1点体力。","force":"蜀","gender":"M","health":"3","disable":"true"},"j101":{"name":"孙鲁班","skill":"僭毁：出牌阶段限一次，当你使用【杀】或黑色普通锦囊牌指定唯一目标时，你可以令另一名能成为此牌目标的角色选择一项：1.交给你一张牌并代替你成为此牌的使用者；2.成为此牌的额外目标。/骄矜:当男性角色对你造成伤害时，你可以弃置一张装备牌，然后此伤害-1。","force":"吴","gender":"F","health":"3","disable":"true"},"j102":{"name":"朱桓","skill":"奋励：若你的手牌数为全场最多，你可以跳过摸牌阶段；若你的体力值为全场最多，你可以跳过出牌阶段；若你的装备区里有牌且数量为全场最多，你可以跳过弃牌阶段。/平寇：回合结束后，你可以对至多X名其他角色各造成1点伤害（X为你本回合跳过的阶段数）。","force":"吴","gender":"M","health":"4","disable":"true"},"j103":{"name":"顾雍","skill":"慎行：出牌阶段，你可以弃置两张牌，然后摸一张牌。/秉壹：每阶段限一次，当你的牌因弃置置入弃牌堆后，你可以展示所有手牌：若颜色均相同，你可以与至多X名其他角色各摸一张牌（X为你的手牌数）。","force":"吴","gender":"M","health":"3"},"j104":{"name":"沮授","skill":"渐营：当你于出牌阶段使用牌时，若此牌的点数或花色与你本阶段使用的上一张牌相同，你可以摸一张牌。/矢北：锁定技，当你每回合首次受到伤害后，你回复1点体力，然后当你本回合受到伤害后，你失去1点体力。","force":"群","gender":"M","health":"3","disable":"true"},"j105":{"name":"蔡夫人","skill":"窃听：其他角色的回合结束后，若其本回合未对其他角色使用过牌，你可以选择一项：1，将其装备区里的一张牌置入你的装备区；2.摸一张牌。/献州：限定技，出牌阶段，你可以将你装备区里的所有牌交给一名其他角色，然后其选择一项：1.令你回复X点体力；2.对其攻击范围内至多X名角色各造成1点伤害。（X为你给出的牌数）","force":"群","gender":"F","health":"3","disable":"true"},"j106":{"name":"曹睿","skill":"恢拓：当你受到伤害后，你可以令一名角色判定，若结果为：红色，其回复1点体力；黑色，其摸与此伤害值等量张牌。/明鉴：出牌记得限一次，你可以交给一名其他角色所有手牌，然后其下回合手牌上限+1且使用【杀】的限制次数+1。/兴衰：主公技，限定技，当你进入濒死状态时，你可以令其他魏势力角色依次选择是否令你回复1点体力。选择是的角色在此次濒死结算结束后受到1点伤害。","force":"魏","gender":"M","health":"3"},"j107":{"name":"曹休","skill":"千驹：锁定技，你计算与其他角色的距离-X（X为你已损失体力值）。/倾袭：当你使用【杀】对目标角色造成伤害时，若你的装备区里有武器牌，你可以令其选择一项：1.弃置与此牌攻击范围等量张数的手牌，然后弃置此牌。2.令此【杀】伤害+1。","force":"魏","gender":"M","health":"4","disable":"true"},"j108":{"name":"钟繇","skill":"活墨：你可以将一张黑色非基本牌置于牌堆顶，视为使用一张与你本回合使用过的牌牌名不同的基本牌。/佐定：当其他角色在其出牌阶段使用黑桃牌指定目标后,若本阶段没有角色受到过伤害，你可以令其中一个目标摸一张牌。","force":"魏","gender":"M","health":"3"},"j109":{"name":"刘谌","skill":"战绝：你可以将所有手牌当【决斗】使用，然后你与因此受伤的角色各摸一张牌，若你本阶段以此法摸过至少两张牌，本技能失效。/勤王：主公技，你可以弃置一张牌发动【激将】，响应此【激将】使用或打出【杀】的角色各摸一张牌。","force":"蜀","gender":"M","health":"4","disable":"true"},"j110":{"name":"夏侯氏","skill":"樵拾：其他角色的结束阶段，若你与其手牌数相等，你可以与其各摸一张牌。/燕语：出牌阶段，你可以重铸【杀】。出牌阶段结束时，若你于本阶段重铸过至少两张【杀】，你可以令一名男性角色摸两张牌。","force":"蜀","gender":"F","health":"3","disable":"true"},"j111":{"name":"孙休","skill":"宴诛：出牌阶段限一次，你可以令一名其他角色选择一项：1.你获得其装备区里的所有牌，你修改【宴诛】和【兴学】；2.弃置一张牌且下一次受到的伤害+1直到其下个回合开始。/兴学：结束阶段，你可以令至多X名角色依次摸一张牌，然后其中手牌数大于体力值的角色依次将一张牌置于牌堆顶（X为你的体力值）。/兴学改：X为你的体力上限。/诏缚：主公技，锁定技，你距离为1的角色视为在其他吴势力角色的攻击范围内。","force":"吴","gender":"M","health":"3"},"j112":{"name":"朱治","skill":"安国：出牌阶段限一次，你可以选择一名其他角色，若其：手牌数全场最少，其摸一张牌；体力值全场最低，其回复1点体力；装备区里牌数全场最少，其随机使用一张装备牌。然后你执行其未满足但你满足条件的效果。","force":"吴","gender":"M","health":"4","disable":"true"},"j113":{"name":"全琮","skill":"邀名：每回合限一次，当你造成或受到伤害后，你可以选择一项：1.弃置手牌数大于你的一名角色一张手牌；2.令手牌数小于你的一名角色摸一张牌。","force":"吴","gender":"M","health":"4","disable":"true"},"j114":{"name":"公孙渊","skill":"怀异：出牌阶段限一次，你可以展示所有手牌，弃置其中一种颜色的牌，然后获得至多X名角色的各一张牌（X为弃置的手牌数）。若你以此法获得了至少两张牌，你失去1点体力。","force":"群","gender":"M","health":"4","disable":"true"},"j115":{"name":"郭图逢纪","skill":"急攻：出牌阶段开始时，你可以摸两张牌，然后本回合手牌上限等于你本阶段造成的伤害值。/饰非：当你需要使用或打出【闪】时，你可以令当前回合角色摸一张牌，若其不是手牌数全场唯一最多的角色，你弃置最多的角色一张牌，视为你使用或打出一张【闪】。","force":"群","gender":"M","health":"3","disable":"true"},"j116":{"name":"张鲁","skill":"义舍：结束阶段，若你没有【米】，你可以摸两张牌，然后将两张牌置于你的武将牌上，成为【米】。当你失去最后一张【米】时，你回复1点体力。/布施：当你受到1点伤害后，你可以获得一张【米】。当你对其他角色造成1点伤害后，其可以获得一张【米】。/米道：当一张判定牌生效前，你可以用一张【米】代替之。","force":"群","gender":"M","health":"3"},"j117":{"name":"王荣","skill":"丰姿：出牌阶段限一次，当你使用基本牌或普通锦囊牌时，你可以弃置一张类型相同的手牌令此牌的效果结算两次。/吉占：摸牌阶段，你可以改为展示牌堆顶的一张牌，猜测牌堆顶下一张牌点数大于或小于此牌，然后展示之，若猜对你接续猜测，最后你获得以此法展示的牌。/赋颂：当你死亡时，你可以令一名体力上限大于你的角色选择获得【丰姿】或【吉占】。","force":"群","gender":"F","health":"3"},"j118":{"name":"士燮","skill":"避乱：结束阶段，若有其他角色计算与你的距离为1，你可以弃置一张牌，令其他角色计算与你的距离+X（X为全场势力数）。/礼下：锁定技，其他角色的结束阶段，若你不在其攻击范围内，你选择一至两项：1.摸一张牌；2.令其摸两张牌；3.令其回复1点体力。每选择一项，你令其他角色计算与你的距离-1。","force":"群","gender":"M","health":"3"},"j119":{"name":"马云禄","skill":"马术：锁定技，你计算与其他角色的距离-1。/凤魄：当你在回合内首次使用【杀】或【决斗】指定一个目标后，你可以选择一项：1.摸X张牌；2.令此牌伤害+X。（X为目标角色方块手牌数）","force":"蜀","gender":"F","health":"4"},"j120":{"name":"严白虎","skill":"雉盗：锁定技，每回合限一次，当你于出牌阶段对其他角色造成伤害后，你获得其每个区域各一张牌，然后你本回合使用牌不能指定其他角色为目标。/寄篱：锁定技，当与你的距离为1的其他角色成为红色基本牌或红色普通锦囊牌的目标时，若你不是此牌的使用者或目标，你成为此牌的额外目标（无距离限制）。","force":"群","gender":"M","health":"4"},"j121":{"name":"关索","skill":"征南：当其他角色死亡后，你可以摸三张牌，然后获得【武圣】【当先】【制蛮】中的一个。/撷芳：锁定技，你计算与其他角色的距离-X（X为全场女性角色数）。","force":"蜀","gender":"M","health":"4"},"j122":{"name":"王朗","skill":"鼓舌：出牌阶段限一次，你可以与至多三名角色同时拼点，没赢的角色弃置一张牌或令你摸一张牌。若你没赢，你获得1枚【饶舌】标记，若标记数为7，你死亡。/激词：当你亮出拼点牌后，若点数不大于X，你可以令之点数+X，并令【鼓舌】视为未发动（X为你的【饶舌】标记数）。","force":"魏","gender":"M","health":"3"},"j123":{"name":"鲍三娘","skill":"武娘：出牌阶段限一次，当你使用仅指定单一目标的【杀】后，你可以令其选择是否对你使用一张【杀】，然后你摸一张牌并令你本回合使用【杀】的限制次数+1。/许身：限定技，当你进入濒死状态时，你可以回复至1点体力并获得【镇南】，然后若关索不在场，你可以令一名男性角色选择是否用关索代替其武将牌。/镇南：【南蛮入侵】对你无效。出牌阶段限一次，你可以将至多X张手牌当目标数为转化所用牌数的【南蛮入侵】使用（X为其他角色数，目标由你指定）。","force":"蜀","gender":"F","health":"4"},"j124":{"name":"邓芝","skill":"修好：每回合限一次，当你对其他角色造成伤害，或其他角色对你造成伤害时，你可以防止此伤害，令伤害来源摸两张牌。/素俭：锁定技，弃牌阶段，你改为以下一项：1.将所有非本回合获得的手牌分配给其他角色；2.弃置非本回合获得的手牌，并弃置一名其他角色至多等量张牌。","force":"蜀","gender":"M","health":"3"},"j125":{"name":"曹婴","skill":"凌人：出牌阶段限一次，当你使用【杀】或伤害锦囊牌时，你可以猜测其中一个目标的手牌中是否有基本牌，锦囊牌或装备牌，若至少猜对：1项，此牌对其伤害+1；2项，你摸两张牌；3项，你获得【奸雄】【行殇】直到你下回合开始。/伏间：锁定技，结束阶段，你随机观看一名其他角色的X张手牌（X为全场手牌数最少的角色的手牌数）。","force":"魏","gender":"F","health":"4"},"j126":{"name":"董昭","skill":"先略：主公的回合开始时，你可以记录一张普通锦囊牌。每回合限一次，当其他角色使用记录牌后，你摸两张牌并将之分配给任意角色，然后重新记录一张普通锦囊牌。/造王：限定技，出牌阶段，你可以令一名角色增加1点体力上限，回复1点体力并摸三张牌，若其为：忠臣，当主公死亡时与主公交换身份牌；反贼，当其被主公或忠臣杀死时，主公方获胜。","force":"魏","gender":"M","health":"3"},"j127":{"name":"吾彦","skill":"澜疆：结束阶段，你可以令所有手牌数不小于你的角色依次选择是否令你摸一张牌。选择完成后，你可以对手牌数等于你的其中一名角色造成1点伤害，然后令手牌数小于你的其中一名角色摸一张牌。","force":"吴","gender":"M","health":"4"},"j128":{"name":"SP张郃","skill":"周旋：弃牌阶段开始时，你可以将任意张手牌暗置于你的武将牌上，成为【旋】（至多五张），直到你下个出牌阶段结束。当你使用牌时，你移去一张【旋】并摸一张牌，若你的手牌不是唯一最多则额外摸X张牌（X为【旋】的数量）。","force":"群","gender":"M","health":"4"},"j129":{"name":"司马朗","skill":"郡兵：每名角色的结束阶段，若其手牌数不大于1，其可以摸一张牌并交给你所有手牌，然后你交给其等量张牌。/去疾：出牌阶段限一次，你可以弃置X张牌令至多X名角色各回复1点体力（X为你已损失体力值），若弃置牌中有黑色牌，你失去1点体力。","force":"魏","gender":"M","health":"3"},"j130":{"name":"SP黄月英","skill":"机巧：出牌阶段开始时，你可以弃置任意张装备牌，然后亮出牌堆顶两倍数量的牌，获得其中所有非装备牌。/锁定技，若你的装备区里没有：武器牌，你本回合使用【杀】的限制次数+1；防具牌，你视为装备着【八卦阵】；坐骑牌，你的手牌上限+1；宝物牌，你视为拥有【奇才】。/奇才：锁定技，你使用锦囊牌无距离限制。当其他角色弃置你装备区里的防具或宝物牌时，你防止之。","force":"群","gender":"F","health":"3","disable":"true"},"j131":{"name":"王基","skill":"奇制：当你于回合内使用非装备牌指定目标后，你可以弃置另一名角色一张牌，然后令其摸一张牌。/进趋：结束阶段，你可以摸两张牌，然后将手牌弃至X张（X为你本回合发动【奇制】的次数）。","force":"魏","gender":"M","health":"3"},"j132":{"name":"步骘","skill":"弘德：当你一次获得至少两张手牌或失去至少两张牌后，你可以令一名其他角色摸一张牌。/定判：出牌阶段限X次（X为存活反贼数），你可以令一名装备区里有牌的角色摸一张牌并选择一项：1.你弃置其装备区里一张牌；2.其获得其装备区里的所有牌并受到1点伤害。","force":"吴","gender":"M","health":"3"},"j133":{"name":"李通","skill":"推锋：当你受到1点伤害后，你可以将一张牌置于你的武将牌上，成为【锋】。准备阶段，你移去所有【锋】，摸两倍数量的牌，你本回合使用【杀】的限制次数+X（X为你本回合移去【锋】的数量）。","force":"魏","gender":"M","health":"4"},"j134":{"name":"糜竺","skill":"资援：出牌阶段限一次，你可以交给一名其他角色任意张点数和魏13的手牌，然后令其回复1点体力。/巨贾：锁定技，你的初始手牌和手牌上限+X（X为你的体力上限）。","force":"蜀","gender":"M","health":"3"},"j135":{"name":"董白","skill":"连诛：出牌阶段限一次，你可以展示并交给一名其他角色一张牌，若此牌为黑色，其选择一项：1.你摸两张牌；2.弃置两张牌。/黠慧：锁定技，你的黑色牌不计入手牌上限。当其他角色获得你的黑色牌时，其不能使用，打出，弃置这些牌直到其体力值减少。","force":"群","gender":"F","health":"3","disable":"true"},"j136":{"name":"贺齐","skill":"绮胄：锁定技，若你装备区里牌的花色数不小于以下值，你视为拥有：1，【短兵】；2，【英姿】；3，【奋威】，4，【澜疆】。/闪袭：出牌阶段限一次，你可以展示你与一名攻击范围内不包含你的角色共计至多x张手牌（x为你的空装备栏数），然后弃置其中的【闪】，若如此做，你获得其一张未以此法展示的牌。","force":"吴","gender":"M","health":"4"},"j137":{"name":"董允","skill":"秉正：出牌阶段结束时，你可以令手牌数不等于体力值的一名角色弃置一张手牌或摸一张牌。然后者其手牌数等于体力值，你摸一张牌，且可以交给其一张牌。/舍宴：当你成为一张普通锦囊牌的目标时，你可以令此牌增加一个目标或对一个目标无效（有效目标数至少为1）。","force":"蜀","gender":"M","health":"3"},"j138":{"name":"马忠","skill":"抚蛮：出牌阶段，每名角色限一次，你可以交给一名其他角色一张手牌令之视为【杀】。当其使用此【杀】后，你摸一张牌，若造成伤害，你改为摸两张牌。","force":"蜀","gender":"M","health":"4"},"j139":{"name":"阚泽","skill":"下书：出牌阶段开始时，你可以交给一名其他角色所有手牌，然后其展示任意张手牌，你选择获得其：1.以此法展示的牌，2.未以此法展示的手牌。/宽释：结束阶段，你可以选择一名角色，当其于你下回合开始前受到大于1点的伤害时，你防止之并跳过下回合摸牌阶段","force":"吴","gender":"M","health":"3","disable":"true"},"j140":{"name":"诸葛果","skill":"祈禳：当你使用装备牌时，你可以获得牌堆中一张锦囊牌，若此牌为：普通锦囊牌，你使用此牌指定唯一目标时可以多指定一个目标；延时锦囊牌，你下回合【羽化】观看的牌数+1（至多为5）。/羽化：锁定技，弃牌阶段，你的锦囊牌和装备牌不计入手牌上限。准备阶段和结束阶段，你观看牌堆顶的一张牌并将其置于牌堆顶或牌堆底","force":"蜀","gender":"F","health":"3","disable":"true"},"j141":{"name":"麹义","skill":"伏骑：锁定技,与你距离为1的其他角色不能使用或打出牌响应 你使用的牌。/骄恣：锁定技,若你的手牌数为全场唯一最多,你造成或受到的 伤害值+1。","force":"群","gender":"M","health":"4"},"j142":{"name":"陈到","skill":"往烈：你出牌阶段使用的首张牌无距离限制。当你于出牌阶段使 用基本牌或普通锦囊牌时,你可以令此牌不能被响应,然后你本阶段不能再使用牌。","force":"蜀","gender":"M","health":"4","disable":"true"},"j143":{"name":"诸葛瞻","skill":"罪论:结束阶段,你可以观看牌堆顶三张牌,然后获得其中X张 牌,将剩余牌以任意顺序置于牌堆顶(X为你满足的项数:1.本回合造成过伤害;2.本回合未弃置过牌;3.手牌数 全场最少)。若均不满足,你与一名其他角色失去1点体力。/父荫:锁定技,当你每回合首次成为其他角色【杀】或【决斗】 的目标后,若其手牌数不小于你,此牌对你无效。","force":"蜀","gender":"M","health":"3"},"j144":{"name":"周妃","skill":"良姻：当每回合首次有牌移出\\\\移入游戏后,你可以与一名其他角色各摸\\\\弃置一张牌,然后你可以令其中一名手牌数为X的角色回复1点体力(X为「声」牌数)。/箜声：准备阶段,你可以将任意张牌置于你的武将牌上。结束阶段,你获得「声」牌中的非装备牌,然后令一名角色使用剩余「箜声」牌并失去1点体力。","force":"吴","gender":"F","health":"3"},"j145":{"name":"毌丘俭","skill":"征荣：当你使用【杀】或伤害锦囊牌时,你可以选择其中一个手牌数不小于你的目标角色,将其一张牌置于你的武将牌上,称为「荣」。/鸿举：觉醒技,准备阶段,若「荣」的数量不小于3,你用任意手牌替換等量的「荣」,减少1点体力上限并获得【清侧】。/清侧：出牌阶段，你可以获得一张【荣】并弃置一张手牌，然后弃置场上一张牌。","force":"魏","gender":"M","health":"4"},"j146":{"name":"陆抗","skill":"谦节：锁定技,当你被横置时,你防止之。你不能成为延时锦囊牌和其他角色拼点的目标。/决堰：出牌阶段限一次,你可以废除一个装备栏并于本回合获得对应效果:武器栏,使用【杀】的限制次数+3;防具栏,摸三张牌且手牌上限+3;坐骑栏,使用牌无距离限制;宝物栏,获得【集智】。/破势：觉醒技,准备阶段,若你的装备栏均被废除或体力值为1,你减少1点体力上限,将手牌摸至体力上限,失去【决堰】并获得【怀柔】。/怀柔：出牌阶段,你可以重铸装备牌。","force":"吴","gender":"M","health":"4"},"j147":{"name":"张绣","skill":"雄乱：限定技,出牌阶段,你可以废除你的判定区和装备区,然后指定一名其他角色,直到回合结束,你对其使用牌无距离和次数限制,其不能使用和打出手牌. /从谏：当你成为锦囊牌的目标时,若此牌的目标数大于1,你可以交给其中一名目标角色一张牌,然后摸一张牌,若你给出的牌是装备牌,改为摸两张牌。","force":"群","gender":"M","health":"4"},"j148":{"name":"司马徽","skill":"荐杰：首回合开始时,你依次令两名其他角色获得「龙印」「凤印」标记。出牌阶段限一次(你的第一回合外),或当有「龙印」或「凤印」的角色死亡时,你可以转移「龙印」「凤印」。(「龙印」视为拥有【火计】:「凤印」视为拥有【连环】；皆有时,弃置「龙印」「凤印」发动【业炎】)。/称好：当一名角色受到属性伤害后,若其处于横置状态且是此伤害传导的起点,你可以观看牌堆顶X+1张牌并分配给任意角色(X为全场横置角色数)。/隐士：锁定技,当你受到属性伤害或錦囊牌造成的伤害时,若你没有「龙印」「凤印」且装备区里没有防具牌,你防止此伤害。","force":"群","gender":"M","health":"3"},"j149":{"name":"李傕","skill":"狼袭：准备阶段,你可以对一名体力值不大于你的其他角色造成0~2点随机伤害。/亦算：出牌阶段限一次,当你使用的锦囊牌置入弃牌堆时,你可以减少1点体力上限获得之。","force":"群","gender":"M","health":"6"},"j150":{"name":"郭汜","skill":"贪狈：出牌阶段限一次,你可以令一名其他角色选择一项:1.你随机获得其区域里一张牌,本回合不能对其使用牌;2.你本回合对其使用牌无距离和次数限制。/伺盗：出牌阶段限一次,当你对一名其他角色连续使用两张牌后你可以将一张手牌当【顺手牵羊】对其使用(须合法)。","force":"群","gender":"M","health":"4"},"j151":{"name":"张济","skill":"掠命：出牌阶段限一次,你选择一名装备区里牌数少于你的其他角色,令其选择一个点数,然后你判定,若其选择的点数与判定牌点数:相同,你对其造成2点伤害;不同,你随机获得其区域里的一张牌。/屯军：限定技,出牌阶段,你可以选择一名角色,令其随机使用牌堆中的X张不同类型的装备牌(X为你发动【掠命】的次数)。","force":"群","gender":"M","health":"4","disable":"true"},"j152":{"name":"黄权","skill":"点虎：锁定技,游戏开始时,你指定一名其他角色,在本局中,当你对其造成伤害或其回复体力后,你摸一张牌。/谏计：出牌阶段限一次,你可以令一名其他角色摸一张牌,然后其可以使用此牌。","force":"蜀","gender":"M","health":"3"},"j153":{"name":"苏飞","skill":"联翩：每回合限三次,当你于出牌阶段使用牌连续指定同一名角色为目标时,你可以摸一张牌,然后你可以将此牌交给该角色。","force":"吴","gender":"M","health":"4"},"j154":{"name":"唐咨","skill":"兴棹：锁定技,若全场已受伤角色数不小于:1,你视为拥有【恂恂】;2,当你使用装备牌时,你摸一张牌;3,你跳过弃牌阶段。","force":"魏","gender":"M","health":"4","disable":"true"},"j155":{"name":"嵇康","skill":"清弦：当你受到伤害\\\\回复体力后,若没有角色处于濒死状态,你可以令伤害来源\\\\一名其他角色执行一项:1.失去1点体力,随机使用一张装备牌;2.回复1点体力,弃置一张装备牌。若其使用或弃置的牌为梅花牌,你摸一张牌。/绝响：当你死亡时,你可以令一名角色随机获得以下一个技能:【和弦】【柔弦】【烈弦】【激弦】。然后直到其下回合开始,其不能成为其他角色使用梅花牌的目标。/和弦：当你回复体力后,若没有角色处于濒死状态,你可以令一名其他角色回复1点体力,弃置一张装备牌。/柔弦：当你受到伤害后,若没有角色处于濒死状态,你可以令伤害来源回复1点体力,弃置一张装备牌。/激弦：当你受到伤害后,若没有角色处于濒死状态,你可以令伤害来源失去1点体力,随机使用一张装备牌。/烈弦：当你回复体力后,若没有角色处于濒死状态,你可以令一名其他角色失去1点体力,随机使用一张装备牌。","force":"魏","gender":"M","health":"3","disable":"true"},"j156":{"name":"张琪瑛","skill":"法箓：锁定技,当你的牌因弃置置入弃牌堆后,你根据花色获得1枚对应标记:黑桃「紫微」;梅花「后土」;红桃「玉清」;方块「勾陈」(每种至多1枚)。游戏开始时,你获得以上四种标记。/真仪：你可以在以下时机移除相应标记并触发效果:「紫微」当一张判定牌生效前,你将判定结果改为黑桃5或红桃5;「后土」当你处于濒死状态时,你将一张手牌当【桃】使用；「玉清」当你造成伤害时,你判定,若为黑色则此伤害+1；「勾陈」当你受到属性伤害后,你获得牌堆中三种类型的牌各一张。/点化：准备阶段或结束阶段,你可以观看牌堆顶的X张牌(X为你【法箓】的标记数),然后将这些牌以任意顺序置于牌堆。","force":"群","gender":"F","health":"3"},"j157":{"name":"王平","skill":"飞军：出牌阶段限一次,你可以弃置一张牌,然后选择一项:1.令一名手牌数大于你的角色交给你一张牌;2.令一名装备区里牌数大于你的角色弃置一张装备区里的牌。/兵略：锁定技,当你首次对一名角色发动【飞军】时,你摸两张牌。","force":"蜀","gender":"M","health":"4"},"j158":{"name":"SP庞统","skill":"过论：出牌阶段限一次,你可以展示一名其他角色一张手牌,然后你可以选择你的一张牌,你与其交换这两张牌,交换前的牌点数小的角色摸一张牌。/送丧：限定技,当其他角色死亡时,若你已受伤,你可以回复1点体力;若你未受伤,你可以增加1点体力上限。若如此做,你获得【展骥】。/展骥：锁定技,当你于出牌阶段内非因本技能而摸牌后,你摸一张牌。","force":"吴","gender":"M","health":"3"},"j159":{"name":"王粲","skill":"散文：每回合限一次,当你获得牌后,若你有与这些牌同名的手牌,你可以展示之弃置获得的同名牌,然后摸弃牌数两倍的牌。/登楼：限定技,结束阶段,若你没有手牌,你可以观看牌堆顶的四张牌,然后获得其中的非基本牌,并使用其中的基本牌(不能使用则弃置)。/七哀：限定技,当你进入濒死状态时,你可以令每名其他角色各交给你一张牌。","force":"群","gender":"M","health":"3"},"j160":{"name":"许靖","skill":"誉虚：当你于出牌阶段使用牌后,你可以摸一张牌,若如此做,当你本阶段使用下一张牌后,你不能以此法摸牌且须弃置一张牌。/实荐：当其他角色于其回合内使用第二张牌后,你可以弃置一张牌,令其于本回合获得【誉虚】。","force":"蜀","gender":"M","health":"3"},"j161":{"name":"樊稠","skill":"兴乱：出牌阶段限一次,当你使用牌后,你可以选择一项:1.获得场上一张点数为6的牌;2.从牌堆中两张点数为6的牌中选择一张获得(没有则摸一张牌);3.令一名其他角色弃置一张点数为6的牌或交给你一张牌。","force":"群","gender":"M","health":"4","disable":"true"},"j162":{"name":"严颜","skill":"拒战：转换技,阳:当你成为其他角色使用【杀】的目标后,你可以与其各摸一张牌,然后其本回合不能再对你使用牌。阴:当你使用【杀】指定一名角色为目标后,你可以获 得其一张牌,然后你本回合不能再对其使用牌。","force":"蜀","gender":"M","health":"4","disable":"true"},"j163":{"name":"吕虔","skill":"威虏：锁定技,当其他角色对你造成伤害后,其在你下回合出牌阶段开始时失去至1点体力,然后此阶段结束时其回复以此法失去的体力。/贈刀：限定技,出牌阶段,你可以将装备区里任意张牌置于一名其他角色的武将牌上。当其造成伤害时,其移除一张「赠刀」牌令此伤害+1。","force":"魏","gender":"M","health":"4"},"j164":{"name":"沙摩柯","skill":"蒺藜：当你每回合使用或打出第X张牌时,你可以摸X张牌。(X为你的攻击范围)","force":"蜀","gender":"M","health":"4"},"j165":{"name":"孙邵","skill":"弼政：摸牌阶段结束时,你可以令一名其他角色摸两张牌,然后你与其之中手牌数大于体力上限的角色弃置两张牌。/佚典：当你使用基本牌或普通锦囊牌指定目标时,若此牌在弃牌堆中没有同名牌,你可以为此牌多指定一个目标(无距离限制)。","force":"吴","gender":"M","health":"3"},"j166":{"name":"曹纯","skill":"缮甲：出牌阶段开始时,你可以摸三张牌,然后弃置3-X张牌(X为你本局失去过的装备牌数),若你未弃置基本牌和锦囊牌,你可以视为使用一张无距离限制的【杀】。","force":"魏","gender":"M","health":"4"},"j167":{"name":"袁谭袁尚","skill":"内伐：出牌阶段开始时,你可以摸两张牌或获得场上一张牌,然后弃置一张牌。若弃置的牌是基本牌,你本回合不能使用锦囊牌和装备牌且【杀】的使用次数+X且目标+1;若弃置的牌不是基本牌,你本回合不能使用基本牌,使用普通囊牌的目标+1或1,前两次使用装备牌时摸X张牌。(X为手牌中因本技能不能使用的牌且至多为5)。","force":"群","gender":"M","health":"4","disable":"true"},"j168":{"name":"陆绩","skill":"怀橘：锁定技,游戏开始时,你获得3枚「橘」标记。当有「橘」的角色受到伤害时,防止此伤害并移除1枚「橘」,有「橘」的角色摸牌阶段多摸一张牌。/遗礼：出牌阶段开始时,你可以失去1点体力或移除1枚「橘」, 然后令一名其他角色获得1枚「橘」。/整论：若你没有「橘」,你可以跳过摸牌阶段并获得1枚「橘」。","force":"吴","gender":"M","health":"3"},"j169":{"name":"卢植","skill":"明任：游戏开始时,你摸两张牌,然后将你的一张手牌置于你的武将牌上,称为「任」。结束阶段,你可以用手牌替換「任」。/贞良：转换技,阳:出牌阶段限一次,你可以选择攻击范围内的一名其他角色,然后弃置一张与「任」颜色相同的牌对其造成1点伤害。阴:当你于回合外使用或打出的牌置入弃牌堆时,若此牌与「任」颜色相同,你可以令一名角色摸一张牌。","force":"群","gender":"M","health":"3","disable":"true"},"j170":{"name":"许攸","skill":"成略：转换技,出牌阶段限一次,阳:你可以摸一张牌并弃置两张手牌;阴:你可以摸两张牌并弃置一张手牌。然后你本阶段使用与弃置牌花色相同的牌无距离和次数限制。/恃才：当你每回合首次使用一种类型的牌后,你可以將之置于牌堆顶,然后摸一张牌。/寸目：锁定技,当你摸牌时,你改为从牌堆底摸牌。","force":"群","gender":"M","health":"3","disable":"true"},"j171":{"name":"徐荣","skill":"凶镬：游戏开始时,你获得3枚「暴戾」标记。出牌阶段,你可以交给一名其他角色1枚「暴戾」标记,你对其造成的伤害+1,且其出牌阶段开始时移除「暴戾」标记并随机执行一项:1.受到1点火焰伤害且本回合不能使用【杀】指定你为目标:2.失去1点体力且本回合手牌上限-1;3.你随机获得其一张手牌和一张装备区里的牌。/杀绝：锁定技,当其他角色进入濒死状态时,若其需要超过一张【桃】或【酒】救回,你获得1枚「暴戾」标记,然后获得造成伤害使其进入此濒死状态的牌。","force":"群","gender":"M","health":"4","disable":"true"},"j172":{"name":"辛毗","skill":"持节：每回合限一次,当你受到其他角色的伤害后,你可以令伤害牌无效;当其他角色对你使用牌后,若此牌未造成伤害,你可以获得之。/引裾：限定技,出牌阶段,你可以指定一名其他角色,你本回合防止对其造成的伤害并改为令其回复等量体力,且当你本回合使用牌指定其为目标后,你与其各摸一张牌。","force":"魏","gender":"M","health":"3"},"j173":{"name":"花鬘","skill":"蛮裔：锁定技,【南蛮入侵】对你无效。/蛮嗣：出牌阶段限一次,你可以将所有手牌当【南蛮入侵】使用。当一名角色受到【南蛮入侵】的伤害后,你摸一张牌。/薮影：每回合限一次,当你对其他角色\\\\其他角色对你使用牌指定唯一目标后,若此牌不是你本回合对其\\\\其对你使用的第一张牌,你可以弃置一张牌获得此牌\\\\令此牌对你无效。/战缘：觉醒技,准备阶段,若你因【蛮嗣】累计获得的牌数大于7,你增加1点体力上限并回复1点体力,且可以选择一名男性角色,你与其获得技能【系力】,然后你失去【蛮嗣】。/系力：每回合限一次,当其他拥有本技能的角色在其回合内对没有本技能的角色造成伤害时,你可以弃置一张牌令此伤害+1,然后你与其各摸两张牌。","force":"蜀","gender":"F","health":"3"},"j174":{"name":"丁原","skill":"慈孝：准备阶段,若没有角色有「义子」标记,你可以令一名其他角色获得1枚「义子」标记,否则你可以弃置一张牌移动「义子」标记。有「义子」标记的角色视为拥有【叛弑】。/叛弑：锁定技,准备阶段,你交给有【慈孝】的角色一张手牌。你于出牌阶段使用的【杀】对其造成的伤害+1且使用【杀】对其造成伤害后结束出牌阶段。/先率：锁定技,当一名角色造成伤害后,若此伤害是本轮首次造成伤害,你摸一张牌,若其为你,你对受到伤害的角色造成1点伤害。","force":"群","gender":"M","health":"4"},"j175":{"name":"蒯良蒯越","skill":"荐降：当你成为其他角色使用牌的目标后,你可以令手牌数最少的一名角色摸一张牌。/审时：转换技,阳:出牌阶段限一次,你可以交给手牌数最多的其他角色一张牌,并对其造成1点伤害。若其因此死亡,你可以令一名角色将手牌摸至四张。阴:当其他角色对你造成伤害后,你可以观看其手牌,并交给其一张牌。当前回合结束阶段,若其未失去此牌,你将手牌摸至四张。","force":"魏","gender":"M","health":"3","disable":"true"},"j176":{"name":"孙亮","skill":"溃诛：弃牌阶段结束时,你可以选择一项:1.令至多X名角色各摸一张牌;2.对任意名体力值之和为X的角色各造成1点伤害。(X为你本阶段弃置的牌数)。/掣政：锁定技,你防止于你的出牌阶段对攻击范围内不包含你的角色造成的伤害。出牌阶段结束时,若你本阶段使用的牌数小于这些角色数,你弃置其中一名角色一张牌。/立军：主公技,其他吴势力角色出牌阶段限一次,当其使用【杀】后,其可以令你获得之,然后你可以令其摸一张牌且此回合使用【杀】的限制次数+1。","force":"吴","gender":"M","health":"3"},"j177":{"name":"吕旷吕翔","skill":"齐攻：当你使用的仅指定单一目标的【杀】被【闪】抵消后,你可以令一名角色对此目标再使用一张无距离限制的【杀】，此【杀】不可被响应。/列侯：出牌阶段限一次,你可以令你攻击范围内一名有手牌的角色交给你一张手牌,若如此做,你将一张手牌交给你攻击范围内的另一名其他角色。","force":"群","gender":"M","health":"4"},"j178":{"name":"郝昭","skill":"镇骨：结束阶段,你可以选择一名其他角色,本回合结束时和其下回合结束时,其将手牌调整至与你手牌数相同(至多摸至五张)。","force":"魏","gender":"M","health":"4"},"j179":{"name":"孙乾","skill":"谦雅：当你成为锦囊牌的目标后,你可以交给一名其他角色任意张手牌。/说盟：出牌阶段结束时,你可以拼点:若你赢,你视为使用【无中生有】;若你没赢,被拼点者视为对你使用【过河拆桥】。","force":"蜀","gender":"M","health":"3"},"j180":{"name":"刘琦","skill":"问计：出牌阶段开始时,你可以令一名其他角色交给你一张牌,然后你本回合使用的与此牌同名的牌不能被其他角色响应。/屯江：结束阶段,若你未跳过本回合的出牌阶段且于此阶段未使用牌指定过其他角色为目标,你可以摸与全场势力数等量张牌。","force":"群","gender":"M","health":"3"},"j181":{"name":"吴苋","skill":"福绵：准备阶段,你可以选择一项:1.摸牌阶段,你多摸1张牌;2.本回合限一次,你使用红色基本牌和红色普通锦囊牌可以多指定1个目标(无距离限制)。下次选择另一项时数值+1并复原本技能。/怠宴：结束阶段,你可以令一名其他角色摸一张牌,然后若你上回合对其发动过本技能,其失去1点体力。","force":"蜀","gender":"F","health":"3"},"j182":{"name":"孙资刘放","skill":"瑰藻：若你于弃牌阶段弃置过至少两张牌且这些牌花色均不相同,你可以回复1点体力或摸一张牌。/讥谀：出牌阶段,每名角色限一次,若你有可以使用的手牌,你可以令一名角色弃置一张手牌,然后你本回合不能使用与之相同花色的牌,若此牌为黑桃,其失去1点体力,你翻面。","force":"魏","gender":"M","health":"3"},"j183":{"name":"辛宪英","skill":"忠鉴：出牌阶段限一次,你可以展示一张手牌,然后展示一名其他角色与其体力值等量张手牌,若其展示牌包含:与你展示牌颜色相同的牌,你摸一张牌或弃置一名其他角色一张牌；与你展示牌点数相同的牌,本回合本技能改为限两次；若皆不包含,你的手牌上限-1。/才识：摸牌阶段开始时,你可以选择一项:1.手牌上限+1;2.回复1点体力,本回合不能对自己使用牌。","force":"魏","gender":"F","health":"3"},"j184":{"name":"岑昏","skill":"极奢：出牌阶段,若你的手牌上限大于0,你可以摸一张牌,令你本回合手牌上限-1。结束阶段,若你没有手牌,你可以横置至多X名角色(X为你的体力值)。/链祸：锁定技,当你受到火焰伤害时,若你的武将牌处于横置状态且是传导伤害的起点,此伤害+1。","force":"吴","gender":"M","health":"3"},"j185":{"name":"张让","skill":"滔乱：你可以将一张牌当任意基本牌或普通锦囊牌使用(每种牌名限一次),然后令一名其他角色选择一项:1.交给你一张与「滔乱」牌类型不同的牌;2.你失去1点体力,本回 合本技能失效。","force":"群","gender":"M","health":"3"},"j186":{"name":"郭皇后","skill":"矫诏：出牌阶段限一次,你可以展示一张手牌,然后令你距离最近的角色声明一种基本牌,你本回合可以将展示牌当声明的牌使用(不能对自己使用)。/殚心：当你受到伤害后,你可以摸一张牌或修改【矫诏】。/矫诏修改一：出牌阶段限一次,你可以展示一张手牌,然后令你距离最近的角色声明一种基本牌或普通锦囊牌,你本回合可以将展示牌当声明的牌使用(不能对自己使用)。/矫诏修改二：出牌阶段限一次,你可以将一张手牌当任意基本牌或普通锦囊牌使用(不能对自己使用,使用【杀】计入次数)。","force":"魏","gender":"F","health":"3","disable":"true"},"j187":{"name":"曹嵩","skill":"礼赂：摸牌阶段,你可以改为将手牌摸至体力上限(至多摸至五张),然后交给一名其他角色至少一张手牌,若你首次以此法交出牌或交出的牌数大于上次以此法交出的牌数,你增加1点体力上限并回复1点体力。/翊正：结束阶段,你可以选择一名其他角色,然后直到你的下回合开始,当其造成伤害或回复体力时,若其体力上限小于你,你减少1点体力上限,然后此伤害值或回复值+1。","force":"魏","gender":"M","health":"4"},"j188":{"name":"戏志才","skill":"天妒：当你的判定牌生效后,你可以获得此牌。/先辅：锁定技,游戏开始时,你选择一名其他角色,在本局中:当其受到伤害后,你受到等量伤害;当其回复体力后,你回复等量体力。/筹策：当你受到1点伤害后,你可以判定,若结果为:红色,你令一名角色摸一张牌,若其为【先辅】目标,改为摸两张牌:黑色,你弃置一名角色区域里的一张牌。","force":"魏","gender":"M","health":"3"},"j189":{"name":"李严","skill":"督粮：出牌阶段限一次,你可以获得一名其他角色一张手牌并选择一项:1.令其观看牌堆顶的两张牌,获得其中的基本牌;2.令其下回合摸牌阶段多摸一张牌。/腹鱗：锁定技,弃牌阶段,你于本回合获得的牌不计入手牌上限。","force":"蜀","gender":"M","health":"3","disable":"true"},"j190":{"name":"刘虞","skill":"止戈：出牌阶段限一次,若你的手牌数大于体力值,你可以令攻击范围内包含你的一名角色选择一项:1.使用一张【杀】;2.交给你一张装备区里的牌。/宗祚：锁定技,游戏开始时,你增加X点体力上限和体力值(X为全场势力数)。当某势力最后一名角色死亡后,你减少1点体力上限。","force":"群","gender":"M","health":"2"},"j191":{"name":"孙登","skill":"匡弼：出牌阶段限一次,你可以令一名其他角色將至多三张牌置于你的武将牌上,若如此做,你的下个回合开始时获得所有「匡弼」牌,然后其摸等量张牌。","force":"吴","gender":"M","health":"4","disable":"true"},"j192":{"name":"卞夫人","skill":"挽危：每回合限一次,当你的牌被其他角色弃置或获得后,你可以从牌堆获得一张同名牌(无同名牌则改为摸一张牌)。/约俭：每回合限两次,当其他角色对你使用的牌置入弃牌堆时,你可以展示所有手牌,若花色与此牌均不同,你获得此牌。","force":"魏","gender":"F","health":"3"},"j193":{"name":"黄皓","skill":"寝情：结束阶段,你可以选择任意名攻击范围内包含主公的角色,依次弃置其一张牌,然后令其各摸一张牌,若如此做,你摸X张牌(X为其中手牌比主公多的角色数)。/贿生：当其他角色对你造成伤害时,你可以令其观看你任意张牌并令其选择一项:1.获得其中一张,防止此伤害,然后你本局不能对其发动本技能;2.弃置等量张牌。","force":"蜀","gender":"M","health":"3","disable":"true"},"j194":{"name":"徐氏","skill":"问卦：每名角色出牌阶段限一次,其可以选择一张牌,将之交给你,然后你可以将此牌置于牌堆顶或牌堆底,你与其各从另一端摸一张牌。/伏诛：每名男性角色的结束阶段,若牌堆剩余牌数不大于你体力值的十倍,你可以依次对其使用牌堆中所有【杀】(不能超过游戏人数),然后洗牌。","force":"吴","gender":"F","health":"3"},"j195":{"name":"曹节","skill":"守玺：当你成为【杀】的目标后,你可以声明一种非装备牌的牌名(每种牌名限一次),令使用者选择一项:1.弃置一张你声明的牌,并获得你一张牌;2.令此【杀】无效。/惠民：结束阶段,你可以摸X张牌(X为手牌数小于体力值的角色数),然后展示等量手牌,从你选择的一名角色开始依次获得其中一张。","force":"群","gender":"F","health":"3","disable":"true"},"j196":{"name":"秦宓","skill":"谏征：当其他角色使用【杀】指定其他角色为目标时,若你在使用者的攻击范围内,你可以将一张手牌置于牌堆顶,取消所有目标,然后若此【杀】不为黑色,你成为目标。/专对：当你使用【杀】指定目标后,你可以与其拼点,若你赢,其不能响应此【杀】;当你成为【杀】的目标后,你可以与使用者拼点,若你赢,此【杀】对你无效。/天辩：当你拼点时,你可以用牌堆顶的牌拼点。你的红桃拼点牌的点数视为K。","force":"蜀","gender":"M","health":"3"},"j197":{"name":"鲁芝","skill":"清忠：出牌阶段开始时,你可以摸两张牌,若如此做,本阶段结束时,你与手牌数最少的角色交换手牌。/卫境：每轮限一次,你可以视为使用一张【杀】或【闪】。","force":"魏","gender":"M","health":"3"},"j198":{"name":"蔡邕","skill":"辟撰：当你使用黑桃牌或成为其他角色黑桃牌的目标后,你可以将牌堆顶的一张牌置于你的武将牌上,称为「书」(至多四张)。你的手牌上限+X(X为你「书」的数量)。/通博：摸牌阶段结束后,你可以用任意张牌替换等量张「书」,然后若你的「书」包含四种花色,你将所有「书」交给任意名其他角色。","force":"群","gender":"M","health":"3"},"j199":{"name":"界徐晃","skill":"断粮：你可以将一张黑色基本牌或黑色装备牌当【兵粮寸断】使用。若你本回合未造成过伤害,你使用【兵粮寸断】无距离限制。/截辎：当一名角色跳过摸牌阶段后,你可以选择一名角色,若其手牌数全场最少且没有「辎」,其获得「辎」标记,否则其摸一张牌。有「辎」的角色于其摸牌阶段结束时移除「辎」,然后执行一个额外的摸牌阶段。","force":"魏","gender":"M","health":"4"},"j200":{"name":"清河公主","skill":"谮构：当你攻击范围内一名角色使用【闪】时,你可以弃置一张非基本牌或失去1点体力令此【闪】无效,然后你获得此【闪】。/长姬：每名角色的结束阶段,若你于此回合:造成过伤害,你可以令其摸两张牌;受到过伤害,你可以令其弃置两张牌。","force":"魏","gender":"F","health":"3"},"j201":{"name":"杨婉","skill":"诱言：出牌和弃牌阶段各限一次,当你的牌因弃置置入弃牌堆后你可以从牌堆中获得与弃置牌花色不同的牌各一张。/追还：结束阶段,你可以秘密选择一名角色,直到其下个准备阶段,此期间内对其造成过伤害的角色:若体力值大于其,受到其造成的2点伤害;若体力值不大于其,随机弃置两张手牌。","force":"蜀","gender":"F","health":"3","disable":"true"},"j202":{"name":"滕芳兰","skill":"落宠：准备阶段或当你每回合首次受到伤害后,你可以选择一项令一名角色:1.回复1点体力;2.失去1点体力;3.弃置两张牌;4.摸两张牌。每轮每项每名角色限一次。/哀尘：锁定技,当你进入濒死状态时,若【落宠】选项数大于1你移除其中一项。","force":"吴","gender":"F","health":"3"},"j203":{"name":"卫兹","skill":"援资：每轮限一次,其他角色的准备阶段,你可以交给其所有手牌。若如此做,当其本回合造成伤害后,若其手牌数不小于你,你可以摸两张牌。/烈节：当你受到伤害后,你可以弃置至多三张牌并摸等量张牌,然后你可以弃置伤害来源至多X张牌(X为你以此法弃置的红色牌数)。","force":"群","gender":"M","health":"3"},"j204":{"name":"芮姬","skill":"巧力：出牌阶段各限一次,1.你可以将一张武器牌当【决斗】使用,此牌对目标角色造成伤害后,你摸与之攻击范围等量张牌,然后可以分配其中任意张牌;2.你可以将一张非武器装备牌当【决斗】使用且不能被响应,然后于结束阶段随机获得一张装备牌。/清靚：每回合限一次,当你成为其他角色使用的【杀】或伤害锦囊牌的唯一目标时,你可以展示所有手牌并选择一项:1.你与其各摸一张牌;2.弃置一种花色的所有手牌,取消此目标。","force":"吴","gender":"F","health":"3","disable":"true"},"j205":{"name":"伊籍","skill":"机捷：出牌阶段限一次,你可以观看牌堆底的一张牌,然后交给任意角色。/急援：当一名角色进入濒死状态或你交给一名其他角色牌时,你可以令其摸一张牌。","force":"蜀","gender":"M","health":"3"},"j206":{"name":"唐姬","skill":"抗歌：你的第一个回合开始时,选择一名其他角色。在本局中:当其于其回合外获得手牌时,你摸等量张牌(每回合至多三张);当其进入濒死状态时,你可以令其回复至1点体力(每轮限一次);当其死亡时,你弃置所有牌并失去1 点体力。/节烈：当除【抗歌】角色外的其他角色对你造成伤害时,你可以防止之并选择一种花色,然后你失去X点体力(X为此伤害值),令【抗歌】角色从弃牌堆中随机获得X张此花色的牌。","force":"群","gender":"F","health":"3"},"j207":{"name":"界蔡文姬","skill":"悲歌：当一名角色受到【杀】的伤害后,若你有牌,你可以令其判定,然后你可以弃置一张牌,根据判定结果执行:红桃其回复1点体力;方块,其摸两张牌;梅花,伤害来源弃置两张牌:黑桃,伤害来源翻面。若判定牌与你弃置的 牌:花色相同,你获得判定牌;点数相同,你获得你弃置的牌。/断肠：锁定技,当你死亡时,杀死你的角色失去所有技能。","force":"群","gender":"F","health":"3"},"j208":{"name":"SP孟获","skill":"蛮王：出牌阶段,你可以弃置任意张牌依次执行前等量项:1.获得【叛侵】:2.摸一张牌;3.回复1点体力:4.摸两张牌并失去【叛侵】。/叛侵出牌和弃牌阶段结束时,你可以将弃牌堆中你本阶段弃置的牌当【南蛮入侵】使用,若此牌目标数不小于这些牌的数量,你执行并移除【蛮王】的最后一项。","force":"群","gender":"M","health":"4","disable":"true"},"j209":{"name":"刘宏","skill":"鬻爵：出牌阶段限一次,你可以废除一个装备栏,然后令一名有手牌的其他角色交给你一张手牌,其直到你的下回合开始获得【执笏】。/【】执笏：锁定技,每回合限两次,当你对其他角色造成伤害后,你摸两张牌。/图兴：锁定技,当你废除一个装备栏时,你增加1点体力上限并回复1点体力。当你的所有装备栏首次被废除后,你减少4点体力上限,并令你本局造成的伤害+1。","force":"群","gender":"M","health":"4"},"j210":{"name":"郭槐","skill":"哲妇：当你于回合外使用或打出牌后,你可以令一名有手牌的其他角色选择弃置一张同名牌或受到1点伤害。/遺毒：当你使用【杀】或伤害锦囊牌后,你可以展示一名未受到此牌伤害的目标角色至多三张手牌,若颜色皆相同,你弃置这些牌。","force":"魏","gender":"F","health":"3"},"j211":{"name":"赵俨","skill":"同协：出牌阶段开始时,你可以令你与至多两名其他角色直到你的下回合开始称为“同协”角色,然后令其中手牌唯一最少的角色摸一张牌。当同协角色使用仅指定单一目标的【杀】结算后,其他同协角色可以依次对目标使用一张无距离限制的【杀】。当同协角色受到伤害时,本回合未失去过体力的其他同协角色可以防止此伤害并失去1点体力。","force":"魏","gender":"M","health":"4"},"j212":{"name":"邓忠","skill":"勘破：当你使用【杀】对目标角色造成伤害后,你可以观看其手牌并获得其中一张与此【杀】花色相同的牌。每回合限一次,你可以将一张手牌当【杀】使用。/更战：其他角色出牌阶段限一次,当一张【杀】因弃置入弃牌堆后,你可以获得之。其他角色的结束阶段,若其本回合未使用过【杀】,你下个出牌阶段使用【杀】的限制次数+1。","force":"魏","gender":"M","health":"4"},"j213":{"name":"霍峻","skill":"穷守：锁定技,游戏开始时,你废除所有装备栏并摸四张牌。你的手牌上限+4。/奋锐：结束阶段,你可以:弃置一张牌并复原一个装备栏,随机使用一张对应装备牌,然后你可以对一名装备区里牌数小于你的角色造成X点伤害(X为你与其装备区里牌数之差)若如此做,你不能再以此法造成伤害。","force":"蜀","gender":"M","health":"4","disable":"true"},"j214":{"name":"梁兴","skill":"掳掠：出牌阶段开始时,你可以令一名手牌数小于你且不为0的角色选择一项:1.交给你所有手牌,然后你翻面;2.翻面然后视为对你使用一张【杀】。/追袭：锁定技,你对翻面状态与你不同的角色造成的伤害+1;翻面状态与你不同的角色对你造成的伤害+1。","force":"群","gender":"M","health":"4"},"j215":{"name":"界荀彧","skill":"驱虎：出牌阶段限一次,你可以与体力值大于你的一名角色拼点:若你赢,其对其攻击范围内另一名由你选择的角色造成1点伤害;若你没赢,其对你造成1点伤害。/节命：当你受到1点伤害后或死亡时,你可以令一名角色摸X张牌然后将手牌弃至X张(X为其体力上限且至多为5)。","force":"魏","gender":"M","health":"3"},"j216":{"name":"夏侯玄","skill":"宦浮：当你使用【杀】指定目标或成为【杀】的目标后,你可以弃置任意张牌(至多为你的体力上限),若此【杀】对目标角色造成的伤害值为弃牌数,你摸弃牌数两倍的牌。/清议：出牌阶段限一次,你可以与至多两名其他有牌的角色同时弃置一张牌,若类型相同,你可以重复此流程。结束阶段你可以获得其中颜色不同的牌各一张。/迮阅：限定技,准备阶段,你可以令一名你上个回合结束后(首轮为游戏开始后)对你造成伤害的其他角色失去武将牌上一个技能(锁定技、觉醒技、限定技除外)。每轮开始 时,其视为对你使用X张【杀】(X为其已失去此技能的轮数),若此【杀】造成伤害,其获得以此法失去的技能。","force":"魏","gender":"M","health":"3"},"j217":{"name":"马日磾","skill":"秉节：出牌阶段开始时,你可以减少1点体力上限,然后当你本回合使用【杀】或普通锦囊牌指定目标后,除你以外的每名目标角色各弃置一张牌。若弃置的牌与你使用的牌颜色相同，其无法响应此牌。/正订：锁定技,当你于回合外使用或打出牌响应其他角色的牌时,若两者颜色相同,你增加1点体力上限并回复一点体力。","force":"群","gender":"M","health":"6"},"j218":{"name":"阎柔","skill":"仇讨：当你使用【杀】指定目标后或成为【杀】的目标后,你可以弃置使用者一张牌令此【杀】不能被抵消,若你是使用者,此【杀】无次数限制。/襄戍：限定技,结束阶段,你可以令一名已受伤角色回复X点体力并摸X张牌(X为你本回合造成的伤害值且至多为5)。","force":"魏","gender":"M","health":"4"},"j219":{"name":"界典韦","skill":"强袭：出牌阶段限两次,你可以受到1点伤害或弃置一张武器牌，对一名本回合内未以此法指定过的其他角色造成1点伤害。/狞恶：锁定技,当一名角色每回合第二次受到伤害后,若其为你或伤害来源为你,你摸一张牌并弃置其场上一张牌。","force":"魏","gender":"M","health":"4"},"j220":{"name":"朱儶","skill":"摧破：锁定技,当你每回合使用第X张牌时(X为此牌牌名字数)若为【杀】或伤害锦囊牌,此牌伤害+1,否则你摸一张牌。","force":"群","gender":"M","health":"4"},"j221":{"name":"董荼那","skill":"鹣蛮：锁定技,每回合结束时,若本回合前两张基本牌的使用者:均为你,你视为使用其中一张牌;仅其中之一为你,你弃置另一名使用者一张牌。","force":"群","gender":"M","health":"4"},"j222":{"name":"傅肜","skill":"效死：出牌阶段限一次,你可以与一名有手牌的其他角色各弃置一张基本牌(若其不能弃置则你摸一张牌),然后你可以使用其中任意张牌(无距离和次数限制)。","force":"蜀","gender":"M","health":"4"},"j223":{"name":"卢氏","skill":"驻颜：结束阶段,你可以将一名角色的体力值或手牌数(每名角色每项限一次)调整至与其上个准备阶段时(若无则改为游戏开始时)相同(至多摸至5张)。/雷劫：准备阶段,你可以令一名角色判定,若结果为黑桃2-9,其受到2点雷电伤害,否则其摸两张牌。","force":"群","gender":"F","health":"3"},"j224":{"name":"王允","skill":"连计：出牌阶段限一次,你可以弃置一张手牌令一名其他角色随机使用牌堆中一张武器牌,然后其选择一项:1.对你指定的一名角色使用【杀】:2.你将其装备区的武器交给一名角色。/谋逞：觉醒技,准备阶段,若你本局【连计】中使用的【杀】造成过伤害,你失去【连计】并获得【矜功】。/矜功：出牌阶段限一次,你可以将一张【杀】或装备牌当三张随机锦囊牌中的一张使用。","force":"群","gender":"M","health":"4","disable":"true"},"j225":{"name":"界诸葛亮","skill":"观星：准备阶段,你可以观看牌堆顶的五张牌(存活角色数小于4时改为三张),然后将之以任意顺序置于牌堆顶或牌堆底。若皆置于牌堆底,结束阶段你可以再次发动本技能。/空城：锁定技,若你没有手牌,你不能成为【杀】或【决斗】的目标。","force":"蜀","gender":"M","health":"3"},"j226":{"name":"界黄月英","skill":"集智：当你使用非转化锦囊牌时,你可以摸一张牌,若此牌是基本牌,你可以弃置此牌令你本回合手牌上限+1。/奇才：锁定技,你使用锦囊牌无距离限制。当其他角色弃置你装备区里的防具或宝物牌时,你防止之。","force":"蜀","gender":"F","health":"3"},"j227":{"name":"界孙尚香","skill":"结姻：出牌阶段限一次,你可以选择一名男性角色,弃置一张手牌或将一张装备牌置入其装备区,然后你与其中体力值较大的角色摸一张牌,体力值较小的角色回复1点体力。/枭姬：当你失去装备区里的一张牌后,你可以摸两张牌。","force":"吴","gender":"F","health":"3"},"j228":{"name":"界甄姬","skill":"洛神：准备阶段,你可以判定,若结果为黑色,你获得此牌,然后你可以重复此流程。以此法获得的牌本回合不计入手牌上限。/倾国：你可以将一张黑色手牌当【闪】使用或打出。","force":"魏","gender":"F","health":"3"},"j229":{"name":"界貂蝉","skill":"离间：出牌阶段限一次,你可以弃置一张牌令一名男性角色视为对另一名男性角色使用一张不能被抵消的【决斗】。/闭月：结束阶段,若你没有手牌,你可以摸两张牌,否则你可以摸一张牌。","force":"群","gender":"F","health":"3"},"j230":{"name":"界华雄","skill":"耀武：锁定技,当你受到伤害时,若造成伤害的牌:为红色,伤害来源摸一张牌;不为红色,你摸一张牌。/势斩：出牌阶段限两次,你可以令一名其他角色视为对你使用一张【决斗】。","force":"群","gender":"M","health":"6"},"j231":{"name":"界张角","skill":"雷击：当你使用或打出【闪】或使用【闪电】时,你可以判定。当你判定后,若结果为:黑桃,你可以对一名角色造成2点雷电伤害;梅花,你回复1点体力并可以对一名角色造成1点雷电伤害。/鬼道：当一张判定牌生效前,你可以用一张黑色牌替换之,若此黑色牌为黑桃2-9,你摸一张牌。/黄天：主公技,其他群势力角色的出牌阶段限一次,其可以交给你一张【闪】或黑桃手牌。","force":"群","gender":"M","health":"3"},"j232":{"name":"界于吉","skill":"蛊惑：每回合限一次,你可以扣置一张手牌当任意基本牌或普通锦囊牌使用或打出。其他角色可以同时质疑并翻开此牌:若为假,此牌作废,质疑者摸一张牌;若为真,质疑者获得【缠怨】,然后弃置一张牌或失去1点体力。/缠怨：锁定技,你不能质疑「蛊惑」牌。若你的体力值不大于1,你的其他技能失效。","force":"群","gender":"M","health":"3"},"j233":{"name":"界袁绍","skill":"乱击：你可以将两张花色相同的手牌当【万箭齐发】使用。你使用【万箭齐发】可以少选一个目标。/血裔：主公技,游戏开始时,你获得X枚「裔」标记(X为群势力角色数的两倍)。出牌阶段开始时,你可以移除1枚「裔」并摸一张牌。你每有1枚「裔」,手牌上限+1。","force":"群","gender":"M","health":"4"},"j234":{"name":"界孙策","skill":"激昂：当你使用【决斗】或红色【杀】指定目标后,或成为【决斗】或红色【杀】的目标后,你可以摸一张牌。每回合首次【决斗】或红色【杀】因弃置进入弃牌堆后,你可以失去1点体力获得之。/魂姿：觉醒技,准备阶段,若你的体力值为1,你减少1点体力上限并获得【英姿】【英魂】,本回合结束阶段,你摸两张牌或回复1点体力。/制霸：主公技,出牌阶段限一次,你可以与一名其他吴势力角色拼点;其他吴势力角色出牌阶段限一次,其可以与你拼点(你可以拒绝):若其没赢,你可以获得两张拼点牌。","force":"吴","gender":"M","health":"4"},"j235":{"name":"界夏侯渊","skill":"神速：你可以:1.跳过判定阶段和摸牌阶段:2.跳过出牌阶段并弃置一张装备牌;3.跳过弃牌阶段并翻面。当你执行以上一项后,你视为使用一张无距离限制的【杀】。/设变：当你翻面时,你可以移动场上一张装备牌。","force":"魏","gender":"M","health":"4"},"j236":{"name":"界卧龙诸葛","skill":"八阵：锁定技,若你的装备区里没有防具牌,你视为装备若【八卦阵】。/火计：你可以将一张红色牌当【火攻】使用。你的【火攻】改为令目标展示随机手牌,你弃与展示牌颜色相同的牌以造成伤害。/看破：你可以将一张黑色牌当【无懈可击】使用。你的【无懈可击】不能被响应。/藏拙：锁定技,弃牌阶段开始时,若你本回合未使用过锦囊牌,你的锦囊牌不计入手牌上限","force":"蜀","gender":"M","health":"3"},"j237":{"name":"界庞统","skill":"连环：你可以将一张梅花牌当【铁索连环】使用或重铸。你使用【铁索连环】可以多指定一个目标。/涅槃：限定技,当你处于濒死状态时,你可以:弃置所有牌,复原你的武将牌,摸三张牌,回复至3点体力,然后获得【八阵】【火计】【看破】中的一个。","force":"蜀","gender":"M","health":"3"},"j238":{"name":"界魏延","skill":"狂骨：当你对距离1以内的一名角色造成1点伤害后,你可以回复1点体力或摸一张牌。/奇谋：限定技,出牌阶段,你可以失去任意点体力并摸X张牌(X为你以此法失去的体力值),然后你本回合计算与其他角色的距离-X且使用【杀】的限制次数+X。","force":"蜀","gender":"M","health":"4"},"j239":{"name":"界小乔","skill":"天香：当你受到伤害时,你可以弃置一张红桃牌防止之并选择一项,令一名其他角色:1.受到伤害来源的1点伤害并摸X张牌(X为其已损失体力值且至多为5);2.失去1点体力并获得你弃置的牌。/红颜：锁定技,你的黑桃牌和黑桃判定牌视为红桃牌。若你的装备区里有红桃牌,你的手牌上限等于体力上限。/飘零：结束阶段,你可以判定,若结果为红桃,你将判定牌置于牌堆顶或交给一名角色,若该角色是你,你弃置一张牌。","force":"吴","gender":"F","health":"3"},"j240":{"name":"界孙坚","skill":"英魂：准备阶段,若你已受伤,你可以选择一名其他角色并选择一项:1.令其摸X张牌,然后弃置一张牌:2.令其摸一张牌,然后弃置X张牌。(X为你已损失体力值)/武烈：限定技,结束阶段,你可以失去任意点体力,令X名其他角色获得「烈」标记(X为以此法失去的体力值)。当有 「烈」的角色受到伤害时,其移除「烈」并防止此伤害。","force":"吴","gender":"M","health":"5"},"j241":{"name":"审配","skill":"刚直：锁定技,其他角色对你造成的伤害,和你对其他角色造成的伤害均视为失去体力。/备战：回合结束后,你可以令一名角色将手牌摸至X张(X为其体力上限且至多为5)。其下回合开始时,若其手牌数全场最多,其此回合使用牌不能指定其他角色为目标。","force":"群","gender":"M","health":"3"},"j242":{"name":"荀谌","skill":"锋略：出牌阶段开始时,你可以拼点:若你赢,被拼点者将其每个区域各一张牌交给你;若你没赢,你交给被拼点者一张牌。拼点结算后你可以令其获得你的拼点牌。/谋识：出牌阶段限一次,你可以交给一名角色一张手牌,然后当其于其下回合出牌阶段对一名角色首次造成伤害后,你摸一张牌。","force":"群","gender":"M","health":"3"},"j243":{"name":"高览","skill":"袭营：出牌阶段开始时,你可以弃置手中一张非基本牌,令所有其他角色选择一项:1.弃置一张牌;2.本回合不能使用或打出牌。若如此做,结束阶段,若你于本回合出牌阶段造成过伤害,你获得牌堆中一张【杀】或伤害锦囊牌。","force":"群","gender":"M","health":"4"},"j244":{"name":"界庞德","skill":"马术：锁定技,你计算与其他角色的距离-1。/鞬出：当你使用【杀】指定目标后,你可以弃置其一张牌,若弃置的牌是:基本牌,其获得此【杀】;非基本牌,其不能抵消此【杀】,你本回合使用【杀】的限制次数+1。","force":"群","gender":"M","health":"4"},"j245":{"name":"界太史慈","skill":"天义：出牌阶段限一次,你可以拼点:若你赢,你本回合使用【杀】的限制次数+1、无距离限制且可以多指定一个目标:若你没赢,你本回合不能使用【杀】。/酣战：当你拼点前,你可以令对方用随机手牌拼点。当你拼点后你可以获得拼点牌中点数最大的【杀】。","force":"吴","gender":"M","health":"4"},"j246":{"name":"张陵","skill":"虎骑：锁定技,你计算与其他角色的距离-1。当你于回合外受到伤害后,你判定,若结果为红色,你视为对伤害来源使用一张【杀】。/授符：出牌阶段限一次,你可以摸一张牌,然后将一张手牌置于一名没有「箓」的其他角色的武将牌上,称为「箓」,其 不能使用和打出与「箓」类型相同的牌。当其受到伤害或于弃牌阶段弃置至少两张与[箓」类型相同的牌后,将「箓」置入弃牌堆。","force":"群","gender":"M","health":"3"},"j247":{"name":"吕凯","skill":"图南：出牌阶段限一次,你可以令一名其他角色观看牌堆顶的一张牌,然后令其选择一项:1.使用此牌(无距离限制)2.将此牌当普通【杀】使用。/闭境：结束阶段,你可以将一张手牌标记为「闭境」。若你于回合外失去「闭境」牌,当前回合角色弃牌阶段开始时,其须弃置两张牌。准备阶段,你弃置手中的「闭境」牌。","force":"蜀","gender":"M","health":"3"},"j248":{"name":"张昌蒲","skill":"严教：出牌阶段限一次,你可以令一名其他角色亮出牌堆顶4张牌并将之分成点数之和相等的两组,你与其各获得其中一组,若剩余牌数大于1,你本回合手牌上限-1。/省身：当你受到伤害后,你可以摸随机1~2张牌且令下次【严教】亮出的牌数+X(X为你已损失体力值,至多亮出十张)","force":"魏","gender":"F","health":"3"},"j249":{"name":"蒋干","skill":"伪诚：当其他角色获得你的手牌后,若你的手牌数小于体力值,你可以摸一张牌。/盗书：出牌阶段限一次,你可以选择一种花色并获得一名角色一张手牌,若此牌花色与你选择的花色:相同,你对其造成1点伤害且本技能视为未发动;不同,你交给其一张与此牌花色不同的手牌(若没有,你展示所有手牌)。","force":"魏","gender":"M","health":"3"},"j250":{"name":"周鲂","skill":"诱敌：结束阶段,你可以令一名其他角色弃置你一张手牌,若不为:【杀】,你获得其一张牌;黑色牌,你摸一张牌。/断发：出牌阶段,你可以弃置任意张黑色牌,然后摸等量张牌。你本阶段以此法弃置的总牌数不能大于你的体力上限。","force":"吴","gender":"M","health":"3"},"j251":{"name":"曹爽","skill":"托孤：当一名角色死亡时,你可以令其选择其武将牌上的一个技能(限定技、觉醒技、主公技和包含隐匿的技能除外),你失去上次以此法获得的技能,然后获得此技能。/擅专：当你对一名其他角色造成伤害后,若其判定区没有牌,你可以将其一张牌置于其判定区,若此牌不是延时锦囊牌,则红色牌视为【乐不思蜀】,黑色牌视为【兵粮寸断】。结束阶段,若你本回合未造成伤害,你可以摸一张牌。","force":"魏","gender":"M","health":"4"},"j252":{"name":"界董卓","skill":"酒池：你可以将一张黑桃手牌当【酒】使用。你使用【酒】无次数限制。当你使用【酒】【杀】造成伤害后,本回合【崩坏】失效。/肉林：锁定技,你对女性角色使用的【杀】和女性角色对你使用的【杀】均需使用两张【闪】才能抵消。/崩坏：锁定技,结束阶段,若你不是体力值最小的角色,你失去1点体力或减少1点体力上限。/暴虐：主公技,当其他群势力角色造成1点伤害后,你可以判定,若结果为黑桃,你回复1点体力并获得此判定牌。","force":"群","gender":"M","health":"8"},"j253":{"name":"界邓艾","skill":"屯田：当你于回合外失去牌后,或你于回合内置【杀】后,你可以判定,若结果不为红桃,将判定牌置于你的武将牌上称为「田」。你计算与其他角色的距离-X(X为「田」的数量)/凿险：觉醒技,准备阶段,若「田」的数量不小于3,你减少1点体力上限,然后获得【急袭】,你于本回合结束后执行一个额外回合。/急袭：你可以将一张「田」当【顺手牵羊】使用。","force":"魏","gender":"M","health":"4"},"j254":{"name":"潘濬","skill":"观微：每回合限一次,每名角色出牌阶段结束时,若其本回合使用过至少两张牌且这些牌花色均相同,你可以弃置一张牌令其摸两张牌并执行一个额外的出牌阶段。/公清：锁定技,当你受到伤害时,若伤害来源攻击范围:小于3你只受到1点伤害;大于3,此伤害+1。","force":"吴","gender":"M","health":"3"},"j255":{"name":"严畯","skill":"观潮：出牌阶段开始时,你可以选择一项:1.严格递增;2.严格递减。当你本回合使用牌时,若你本阶段使用过的所有牌的点数满足此项,你摸一张牌。/逊贤：每回合限一次,当你于回合外使用或打出的牌置入弃牌堆时,你可以将之交给一名手牌比你多的角色。","force":"吴","gender":"M","health":"3"},"j256":{"name":"卧龙凤雏","skill":"游龙：转换技,每轮各限一次,你可以废除你装备区里的一个装备栏,视为使用一张未以此法使用过的：阳：普通锦囊牌；阴:基本牌。/鸾凤：限定技,当一名角色进入濒死状态时,若其体力上限不小于你,你可以令其回复至3点体力,复原其装备栏,令其将手牌摸至6-X张(X为以此法复原的装备栏数)。若其是你,你复原【游龙】使用过的牌名。","force":"蜀","gender":"M","health":"4","disable":"true"},"j257":{"name":"曹性","skill":"流矢：出牌阶段,你可以将一张红桃牌置于牌堆顶,视为对一名角色使用一张无距离和次数限制的【杀】,若此【杀】造成伤害,其手牌上限-1。/斩腕：锁定技,当受到【流】效果影响的角色于弃牌阶段弃牌后,你摸等量张牌并移除其【流矢】效果。","force":"群","gender":"M","health":"4"},"j258":{"name":"黄祖","skill":"挽弓：锁定技,若你使用的上一张牌是基本牌,你使用【杀】无距离和次数限制且造成的伤害+1。","force":"群","gender":"M","health":"4"},"j259":{"name":"潘淑","skill":"威仪：每名角色限一次,当一名角色受到伤害后,若其体力值:1.不小于你,你可以令其失去1点体力;2.不大于你,你可以令其回复1点体力。/锦织：当你需要使用或打出基本牌时,你可以:弃置X张颜色相同的牌(X为你本轮发动本技能的次数),然后摸一张牌视为你使用或打出此基本牌。","force":"吴","gender":"F","health":"3"},"j260":{"name":"界祝融","skill":"巨象：锁定技,【南蛮入侵】对你无效。当其他角色使用的【南蛮入侵】结算结束后,你获得之。/烈刃：当你使用【杀】对目标角色造成伤害后,你可以与其拼点若你赢,你获得其一张牌。/长标：出牌阶段限一次,你可以将任意张手牌当无距离限制的【杀】使用(计入使用次数),若此【杀】对目标角色造成伤害,本阶段结束时,你摸等量张牌。","force":"蜀","gender":"F","health":"4"},"j261":{"name":"界姜维","skill":"挑衅：出牌阶段限一次,你可以选择一名攻击范围内包含你的角色,然后除非其对你使用一张【杀】且此【杀】对你造成伤害,否则你弃置其一张牌,然后本阶段本技能限两次。/志继：觉醒技,准备阶段或结束阶段,若你没有手牌,你回复1点体力或摸两张牌,然后减少1点体力上限,获得【观星】。","force":"蜀","gender":"M","health":"4"},"j262":{"name":"黄承彦","skill":"观虚：出牌阶段限一次,你可以观看一名其他角色的手牌,并可以将其中一张手牌与牌堆顶五张牌中的一张交换,若如此做,你弃置其手牌中三张花色相同的牌。/雅士：当你受到伤害后,你可以选择一项:1.令伤害来源的非锁定技失效直到其下个回合开始;2.对一名其他角色执行【观虚】的效果。","force":"群","gender":"M","health":"3"},"j263":{"name":"高干","skill":"拒关：出牌阶段限一次,你可将一张手牌当【杀】或【决斗】使用。若受到此牌伤害的角色未在你的下回合开始前对你造成过伤害,你的下个摸牌阶段摸牌数+2。","force":"群","gender":"M","health":"4"},"j264":{"name":"界贾诩","skill":"完杀：锁定技,在你的回合内:只有你和处于濒死状态的角色才能使用【桃】;任意角色的濒死结算中,除你和濒死角色外的其他角色的非锁定技失效。/乱武：限定技,出牌阶段,你可以令所有其他角色依次选择一项:1.对其距离最小的另一名角色使用一张【杀】;2.失去1点体力。所有角色结算完毕后,你可以视为使用一张无距离限制的【杀】。/帷幕：锁定技,你不能成为黑色锦囊牌的目标。你防止回合内受到的伤害并摸所防止伤害值两倍数量的牌。","force":"群","gender":"M","health":"3"},"j265":{"name":"界鲁肃","skill":"好施：摸牌阶段,你可以多摸两张牌,然后若你的手牌数大于5你将一半的手牌(向下取整)交给手牌最少的一名其他角色,然后直到你的下回合开始,当你成为【杀】或普通锦囊牌的目标后,其可以交给你一张手牌。/缔盟：出牌阶段限一次,你可以令两名其他角色交换手牌(两者手牌数之差不大于你的牌数量),若如此做,出牌阶段结束时,你弃置X张牌(X为这两名角色手牌数之差)。","force":"吴","gender":"M","health":"3"},"j266":{"name":"界张郃","skill":"巧变：游戏开始时,你获得2枚「变」标记。你可以弃置一张牌或移除1枚「变」,跳过你的一个阶段(准备阶段和结束阶段除外):若跳过摸牌阶段,你可以获得至多两名角色各一张手牌;若跳过出牌阶段,你可以移动场上的一张牌。结束阶段,若你的手牌数与之前你每回合结束阶段的手牌数均不相等,你获得1枚「变」。","force":"魏","gender":"M","health":"4"},"j267":{"name":"刘辩","skill":"诗怨：每回合每项限一次,当你成为其他角色使用牌的目标后:1.若其体力值比你多,你摸三张牌;2.若其体力值与你相同,你摸两张牌;3.若其体力值比你少,你摸一张牌。/毒逝：锁定技,当你处于濒死状态时,其他角色不能对你使用【桃】。当你死亡时,你令一名其他角色获得【毒逝】。/余威：主公技,锁定技,其他群雄角色的回合内,你的【诗怨】改为每回合每项限两次。","force":"群","gender":"M","health":"3"},"j268":{"name":"杨仪","skill":"狷狭：结束阶段,你可以视为对一名其他角色依次使用至多两张不同的仅指定单一目标且目标不为自己的普通锦囊牌,然后其下个结束阶段可以视为对你使用等量张【杀】。/定措：每回合限一次,当你造成或受到伤害后,你可以摸两张牌,若这两张牌颜色不同,你弃置一张手牌。","force":"蜀","gender":"M","health":"3"},"j269":{"name":"朱灵","skill":"急陷：摸牌阶段结束时,你可以视为对满足以下任一条件的目标使用一张【杀】并摸X张牌(X为满足的条件数):装备区有防具,技能数比你多,未受伤;若此【杀】没有对其造成伤害,你失去1点体力。","force":"魏","gender":"M","health":"4"},"j270":{"name":"王双","skill":"追猎：锁定技,你使用【杀】无距离限制。当你使用【杀】指定攻击范围外的角色为目标后,此【杀】无次数限制且你判定,若为武器牌或坐骑牌,此【杀】伤害值等于其体力值，否则你失去1点体力。","force":"魏","gender":"M","health":"7"},"j271":{"name":"界孟获","skill":"祸首：锁定技,【南蛮入侵】对你无效。当其他角色使用【南蛮入侵】指定目标后,你代替其成为此牌的伤害来源。/再起：结束阶段,你可以令至多X名角色各选择一项(X为本回合置入弃牌堆的红色牌数量):1.摸一张牌;2.令你回复1点体力。","force":"蜀","gender":"M","health":"4"},"j272":{"name":"田豫","skill":"扫狄：当你使用【杀】或普通锦囊牌仅指定一名其他角色为目标时,你可以令你与其之间的角色均成为此牌的目标。/追讨：准备阶段,你可以令你与一名未以此法减少距离的其他角色的距离-1。当你对其造成伤害后,失去你以此法对其减 少的距离。","force":"魏","gender":"M","health":"4"},"j273":{"name":"范疆张达","skill":"怨仇：锁定技,你使用的黑色【杀】无视目标角色防具,其他角色对你使用的黑色【杀】无视你的防具。/决生：限定技,你可以视为使用一张伤害为X的【决斗】(X为目标角色本局使用【杀】的数量且至少为1),然后其获得本技能直到其下回合结束。","force":"吴","gender":"M","health":"4"},"j274":{"name":"陈登","skill":"丰积：摸牌阶段开始时,你可以令你本回合以下至多两项数值-1: 1.摸牌阶段摸牌数;2.出牌阶段使用【杀】的限制次数。你每选择一项,令一名其他角色下回合的对应项数值+2选择完成后,你令你本回合未选择选项的数值+1。","force":"群","gender":"M","health":"4"},"j275":{"name":"阿会喃","skill":"蟨蛮：锁定技,每回合结束时,若本回合前两张基本牌的使用者:均不为你,你视为使用本回合第三张使用的基本牌;仅其中之一为你,你摸一张牌。","force":"群","gender":"M","health":"4"},"j276":{"name":"谯周","skill":"知命：准备阶段与弃牌阶段结束时,你摸一张牌,然后你可以将一张牌置于牌堆顶。/星卜：结束阶段,你可以亮出牌堆顶三张牌,然后你可以根据其中红色牌数令一名其他角色于其下回合获得以下效果:3,摸牌阶段额外摸两张牌、出牌阶段使用【杀】的限制次数+1;2,出牌阶段使用【杀】的限制次数-1、跳过弃牌阶段;不大于1,准备阶段弃置一张手牌。","force":"蜀","gender":"M","health":"3"},"j277":{"name":"张翼","skill":"殿军：锁定技,回合结束时,你受到1点伤害并执行一个额外的出牌阶段。/亢锐：当一名角色于其回合内首次受到伤害后,你可以摸一张牌并选择一项:1.令其回复1点体力;2.令其此回合下次造 成的伤害+1。然后当其此回合造成伤害时,其此回合手牌上限改为0。","force":"蜀","gender":"M","health":"4"},"j278":{"name":"阎圃","skill":"缓图：每轮限一次,你攻击范围内其他角色的摸牌阶段开始前,你可以交给其一张牌令其跳过摸牌阶段,若如此做,本回合结束阶段你选择一项:1.令其回复1点体力并摸两张牌;2.你摸三张牌并交给其两张手牌。/避祸：限定技,当一名角色脱离濒死状态后,你可以令其摸三张牌,本轮其他角色计算与其的距离时+X(X为存活角色数)。","force":"群","gender":"M","health":"3"},"j279":{"name":"罗宪","skill":"带砺：每回合结束时，若你有偶数张展示过的手牌，你可以翻面，摸三张牌并展示之。","force":"蜀","gender":"M","health":"4"},"j280":{"name":"界颜良文丑","skill":"双雄：摸牌阶段结束时,你可以弃置一张牌,然后你本回合可以将一张与之颜色不同的牌当【决斗】使用。结束阶段,你获得本回合对你造成伤害的牌。","force":"群","gender":"M","health":"4"},"j281":{"name":"杜夫人","skill":"异色：当其他角色获得你的牌后,若包含:红色牌,你可以令其回复1点体力;黑色牌,其下次受到【杀】的伤害+1。/顺世：准备阶段或当你于回合外受到伤害后,你可以交给除伤害来源之外的一名其他角色一张牌,令你下个摸牌阶段摸牌数、下个出牌阶段使用【杀】的限制次数、下个弃牌阶段的手牌上限+1。","force":"魏","gender":"F","health":"3"},"j282":{"name":"李肃","skill":"巧言：锁定技,在你的回合外,当其他角色对你造成伤害时,若你:没有「珠」,你防止此伤害并摸一张牌,然后将一张牌置于你的武将牌上,称为「珠」;有「珠」,其获得「珠」。/献珠：锁定技,出牌阶段开始时,你令一名角色获得「珠」,若其非你,其视为对你攻击范围内你指定的一名角色使用一张【杀】。","force":"群","gender":"M","health":"3"},"j283":{"name":"黄忠","skill":"烈弓：当你于出牌阶段使用【杀】指定目标后,若其手牌数不小于你的体力值或不大于你的攻击范围,你可以令其不能抵消此【杀】。","force":"蜀","gender":"M","health":"4","disable":"true"},"j284":{"name":"灵雎","skill":"竭緣：当你对其他角色造成伤害时,若其体力值不小于你,你可以弃置一张黑色手牌令此伤害+1;当其他角色对你造成伤害时,若其体力值不小于你,你可以弃置一张红色手牌令此伤害-1。/焚心：锁定技,若场上有已阵亡的:忠臣,【竭缘】减少伤害无体力值限制;反贼,【竭缘】增加伤害无体力值限制;内奸,【竭缘】弃置牌无颜色限制且可以弃置装备区里的牌","force":"群","gender":"F","health":"3","disable":"true"},"j285":{"name":"祖茂","skill":"引兵：结束阶段,你可以将任意张非基本牌置于你的武将牌上。当你受到【杀】或【决斗】造成的伤害后,你移去一张[引兵」牌。/绝地：锁定技,准备阶段,你选择一项:1.移去所有「引兵」牌将手牌摸至体力上限;2.令一名体力值不大于你的其他角色获得所有「引兵」牌,然后回复1点体力并摸等量张牌。","force":"吴","gender":"M","health":"4"},"j286":{"name":"潘璋马忠","skill":"夺刀：当其他角色使用【杀】对你造成伤害后,你可以弃置一张牌获得其装备区里的武器牌。/暗箭：锁定技,当你使用【杀】对目标角色造成伤害时,若你不在其攻击范围内,此伤害+1。","force":"吴","gender":"M","health":"4","disable":"true"},"j287":{"name":"神关羽","skill":"武神：锁定技,你的红桃手牌视为【杀】。你的红桃【杀】无距离和次数限制且不能被抵消。/武魂：锁定技,当你受到1点伤害后,你令伤害来源获得1枚「梦魇」标记。当你死亡时,你令「梦魇」数最多的一名其他角色判定,若结果不为【桃】或【桃园结义】,你令其死亡。","force":"神","gender":"M","health":"5","disable":"true"},"j288":{"name":"神吕蒙","skill":"涉猎：摸牌阶段,你可以改为亮出牌堆顶的五张牌,然后获得每种花色的牌各一张。/攻心：出牌阶段限一次,你可以观看一名其他角色的手牌,然后你可以展示其中一张红桃牌并选择一项:1.弃置此牌;2.将此牌置于牌堆顶。","force":"神","gender":"M","health":"3","disable":"true"},"j289":{"name":"神诸葛亮","skill":"七星：游戏开始时,你将牌堆顶的七张牌暗置于你的武将牌上,称为「星」,然后你可以用任意张手牌替换等量「星」。摸牌阶段结束时,你可以用任意张手牌替换等量「星」。/狂风：结束阶段,你可以移去一张「星」并选择一名角色,然后直到你的下回合开始,当其受到火焰伤害时,此伤害+1。/大雾结束阶段,你可以移去任意张「星」并选择等量角色,然后直到你的下回合开始,当其受到非雷电伤害时,防止此伤害。","force":"神","gender":"M","health":"3","disable":"true"},"j290":{"name":"神曹操","skill":"归心：当你受到1点伤害后,你可以随机获得每名其他角色区域里的一张牌,然后翻面。/飞影：锁定技,其他角色计算与你的距离+1。","force":"神","gender":"M","health":"3","disable":"true"},"j291":{"name":"神吕布","skill":"狂暴：锁定技,游戏开始时,你获得2枚「暴怒」标记。当你造成或受到1点伤害后,你获得1枚「暴怒」标记。/无谋：锁定技,当你使用普通锦囊牌时,你移除1枚「暴怒」标记或失去1点体力。/无前：出牌阶段,你可以移除2枚「暴怒」标记并选择一名其他角色,然后你本回合获得【无双】且其防具失效。/神愤：出牌阶段限一次,你可以移除6枚「暴怒」标记,对所有其他角色各造成1点伤害,令这些角色先各弃置装备区里的所有牌,再弃置四张手牌,然后你翻面。","force":"神","gender":"M","health":"5","disable":"true"},"j292":{"name":"神赵云","skill":"绝境：锁定技,你的手牌上限+2。当你进入或脱离濒死状态时,你摸一张牌。/龙魂：你可以将至多两张花色相同的牌按以下规则使用或打出:红桃当【桃】；方块当火【杀】;梅花当【闪】；黑桃当【无懈可击】。若你以此法转化使用了两张:红色牌,此牌回复值或伤害值+1;黑色牌,你弃置当前回合角色一张牌。","force":"神","gender":"M","health":"2","disable":"true"},"j293":{"name":"神司马懿","skill":"忍戒：锁定技,当你受到1点伤害或于弃牌阶段弃置一张手牌后,你获得1枚「忍」标记。/拜印：觉醒技,准备阶段,若你「忍」的数量不小于4,你减少1点体力上限并获得【极略】。/极略：你可以移除1枚「忍」发动以下一个技能:【鬼才】【放逐】【集智】【制衡】【完杀】。","force":"神","gender":"M","health":"4","disable":"true"},"j294":{"name":"神刘备","skill":"龙怒：转换技,锁定技,出牌阶段开始时,阳:你失去1点体力并摸一张牌,然后本阶段你的红色手牌均视为火【杀】且无距离限制;阴:你减少1点体力上限并摸一张牌,然后本阶段你的锦囊牌均视为雷【杀】且无次数限制。/结营：锁定技,你始终处于横置状态。所有已横置角色的手牌上限+2。结束阶段,你横置一名其他角色。","force":"神","gender":"M","health":"6","disable":"true"},"j295":{"name":"神陆逊","skill":"军略：锁定技,当你受到或造成1点伤害后,你获得1枚「军略」标记。/摧克：出牌阶段开始时,若「军略」数:为奇数,你可以对一名角色造成1点伤害;为偶数,你可以弃置一名角色区域里一张牌并横置之。然后若大于7,你可以移除所有「军略 并对所有其他角色造成1点伤害。/绽火：限定技,出牌阶段,你可以移除所有「军略」,令至多等量的已横置角色弃置所有装备区里的牌,然后对其中一名角色造成1点火焰伤害。","force":"神","gender":"M","health":"4","disable":"true"},"j296":{"name":"神甘宁","skill":"魄袭：出牌阶段限一次,你可以观看一名其他角色的手牌,并可以弃置你与其手里共计四张不同花色的牌,若如此做,你根据弃置牌中你的牌的数量执行效果:0张,减少1点体力上限;1张,结束出牌阶段且本回合手牌上限-1;3张,回复1点体力:4张,摸四张牌。/劫营：回合开始时,若场上没有「营]标记,你获得「营」。结束阶段,你可以将「营」置于一名角色的武将牌上。有「营」的角色摸牌阶段多摸一张牌、出牌阶段使用【杀】的限制次数+1、手牌上限+1。有「营」的其他角色回合结束后,你获得其所有手牌和「营」。","force":"神","gender":"M","health":"6","disable":"true"},"j297":{"name":"神张辽","skill":"夺锐：当你于出牌阶段对其他角色造成伤害后,若其技能未因本技能失效,你可以令其武将牌上的一个技能于下回合结束前失效,然后结束出牌阶段。/止啼：锁定技,你攻击范围内已受伤角色的手牌上限-1。若已受伤角色数不小于:1, 你的手牌上限+1;3,你摸牌阶段摸牌数+1;5,结束阶段,你废除一名其他角色随机一个装备栏","force":"神","gender":"M","health":"4","disable":"true"},"j298":{"name":"神孙权","skill":"驭衡：锁定技,回合开始时,你弃置任意张花色不同的牌,随机获得等量吴势力武将的技能。回合结束时,你失去以此法获得的技能,摸等量张牌。/帝力：觉醒技,当你的技能数超过体力上限后,你减少1点体力上限,失去任意个其他技能并获得【圣质】【权道】【持纲】中的前等量个。/圣质：锁定技,当你发动非锁定技后,你本回合使用的下一张牌无距离和次数限制。/权道：锁定技,当你使用【杀】或普通锦囊牌时,你将手牌中两者数量弃至相同并摸一张牌。/持纲：转换技,锁定技,阳:你的判定阶段改为摸牌阶段;阴:你的判定阶段改为出牌阶段。","force":"神","gender":"M","health":"4","disable":"true"},"j299":{"name":"神张角","skill":"异兆：锁定技,当你使用或打出牌时,你获得此牌点数的「黃」标记,若「黄」的十位数变化,你获得牌堆中一张与变化后十位数点数相同的牌。/肆军：准备阶段,若「黄」标记数大于牌堆牌数,你可以移除所有「黃」并获得牌堆中若干张点数和为36的牌。/天劫：牌堆洗过牌的回合结束时,你可以对至多三名其他角色各造成X点雷电伤害(X为其手牌中【闪】的数量且至少为1)。","force":"神","gender":"M","health":"3","disable":"true"},"j300":{"name":"张嶷","skill":"怃戎：出牌阶段限一次,你可以和一名其他角色同时展示一张手牌:若你的展示牌为【杀】且其展示牌不为【闪】,你弃置此【杀】并对其造成1点伤害;若你的展示牌不为【杀】且其展示牌为【闪】,你弃置此牌并获得其一张牌。/矢志：锁定技,若你的体力值为1,你的【闪】视为【杀】。","force":"蜀","gender":"M","health":"4"},"j301":{"name":"蹋顿","skill":"乱战：当你造成或受到伤害后,你获得1枚「乱战」标记。当你使用【杀】或黑色普通锦囊牌指定目标后,若目标角色数小于X,你移除一半「乱战」标记(向上取整)。你使用【杀】或黑色普通锦囊牌可以多指定X个目标。(X为「乱战」标记数)","force":"群","gender":"M","health":"4","disable":"true"},"j302":{"name":"左棼","skill":"诏颂：其他角色摸牌阶段结束时,若其没有本技能的标记,你可以令其正面朝上交给你一张手牌,其根据此牌类型获得对应标记:锦囊牌「诔」;装备牌「賦」;基本牌「颂」。其他角色可以在其以下时机移除其相应标记并触发效果:「诔」进入濒死时,回复至1点体力并摸一张牌:「賦」 出牌阶段开始时,弃置一名角色区域里至多两张牌;「颂」使用【杀】指定唯一目标时，多指定至多两个目标。/离思：当你于回合外使用牌置入弃牌堆时,你可以令一名手牌数不大于你的其他角色获得之。","force":"晋","gender":"F","health":"3","disable":"true"},"j303":{"name":"宣公主","skill":"高陵：隐匿。当你于其他角色回合登场时,你可以令一名角色回复1点体力。/齐眉：准备阶段,你可以选择一名其他角色,然后直到你的下回合开始,你获得以下效果(每回合每项限一次):1.当你或其手牌数变化后,若与对方手牌数相等,对方摸一张牌;2.当你或其体力值变化后,若与对方体力值相等,对方摸一张牌。/追姬：出牌阶段开始时,你可以选择一项:1.回复1点体力,然后本阶段结束时弃置两张牌;2.摸两张牌,然后本阶段结束时失去1点体力。","force":"晋","gender":"F","health":"3","disable":"true"},"j304":{"name":"赵襄","skill":"芳魂：当你使用【杀】造成伤害或受到【杀】的伤害后,你获得与伤害值等量枚「梅影」标记。你可以移除1枚「梅影」发动【龙胆】并摸一张牌。/扶汉：限定技,准备阶段,你可以移除所有「梅影」,从五张蜀势力武将牌中选择一张替换你的武将牌,并将体力上限调整为本局累计移除的「梅影」数(至少为2,至多为8),然后回复1点体力。","force":"蜀","gender":"F","health":"4","disable":"true"},"j305":{"name":"界左慈","skill":"化身：游戏开始时,你随机获得三张武将牌作为「化身」牌,然后展示其中一张,获得此「化身」牌上的一个技能,且性别和势力视为与之相同。回合开始时和回合结束后,你可以选择一项:1.替换展示的「化身」牌及因此获得的技能；2. 移去至多两张「化身」牌并获得等量新的「化身」牌。/新生：当你受到1点伤害后,你可以获得一张新的「化身」牌。","force":"群","gender":"M","health":"3","disable":"true"},"j306":{"name":"界SP贾诩","skill":"缜略：锁定技，你的普通锦囊牌不能被抵消；你不能成为延时锦囊牌的目标。/间书：限定技，出牌阶段，你可以交给一名其他角色一张黑色手牌，并选择另一名角色，然后令两者拼点：赢的角色随机弃置一张牌，没赢的角色失去1点体力。若有角色因此死亡，此技能视为未发动过。/拥嫡：限定技，出牌阶段，你可选择一名男性角色，若其体力值或体力上限是全场最少的，则回复1点体力或加1点体力上限；若其手牌数是全场最少的，则摸体力上限张牌（最多摸五张）。","force":"魏","gender":"M","health":"3"},"j307":{"name":"界陈琳","skill":"笔伐：结束阶段，你可以将一张手牌暗置于一名其他角色的武将牌上，其下回合开始时观看之并选择一项：1.交给你一张类型相同的手牌并获得此牌；2.移去此牌并失去1点体力。/颂词：每名角色限一次，出牌阶段，你可以选择一项：1.令一名手牌数小于体力值的角色摸两张牌；2.令一名手牌数大于体力值的角色弃置两张牌。弃牌阶段结束时，若你对所有存活角色均发动过颂词，则你摸一张牌。","force":"魏","gender":"M","health":"3"},"j308":{"name":"界夏侯霸","skill":"豹变：锁定技，当你受到伤害后，你依次获得以下技能：【挑衅】，【咆哮】，【神速】。","force":"蜀","gender":"M","health":"4"},"j309":{"name":"界诸葛恪","skill":"傲才：当你在回合外需要使用或打出基本牌时，你可以观看牌堆顶两张牌（无手牌则观看四张），然后可以使用或打出其中的基本牌。/黩武：出牌阶段，你可以选择你攻击范围内的一名其他角色并弃置X张牌（X为其体力值），然后对其造成1点伤害。若其因此进入濒死状态并且被救回，则你失去1点体力且本回合本技能失效。","force":"吴","gender":"M","health":"3"},"j310":{"name":"界孙鲁育","skill":"魅步：其他角色出牌阶段开始时，若你在其攻击范围内，你可以弃置一张牌，令其本回合视为拥有【止息】。若其本回合因止息弃置的牌与你本次的弃牌花色相同，你获得之。/止息：锁定技，出牌阶段，你使用【杀】或锦囊牌时须弃置一张手牌。/穆穆：出牌阶段开始时，你可以选择一项：1.弃置一名其他角色装备区里的一张牌，然后你本回合可使用【杀】的次数+1；2获得一名角色装备区里的一张牌，然后你本回合可以使用【杀】的次数-1。","force":"吴","gender":"F","health":"3"},"j311":{"name":"界曹植","skill":"落英：当其他角色的梅花牌因弃置或判定而置入弃牌堆后，你可以获得其中任意张牌。/酒诗：每当你需要使用【酒】时，若你的武将牌正面朝上，你可以将你的武将牌翻面，视为使用一张【酒】；若你因受到伤害而扣减体力前你的武将牌背面朝上，当此伤害结算结束后，你可以将你背面朝上的武将牌翻面。你每次使用【酒】后，你使用【杀】次数+1直到你的回合结束。","force":"魏","gender":"M","health":"3"},"j312":{"name":"界陈宫","skill":"明策：出牌阶段限一次，你可以交给一名其他角色一张【杀】或装备牌，然后其选择一项：1.视为对其攻击范围内你选择的另一名角色使用一张【杀】，若此杀造成伤害，执行选项2；2.你与其各摸一张牌。/智迟：锁定技，当你于回合外受到伤害后，本回合【杀】和普通锦囊牌对你无效。","force":"群","gender":"M","health":"3"},"j313":{"name":"界凌统","skill":"旋风：当你于弃牌阶段弃置过至少两张牌，或当你失去装备区里的牌后，你可以弃置至多两名其他角色共计至多两张牌。然后若此时是你的回合内，你对其中一名角色造成1点伤害。/勇进：限定技，出牌阶段，你可以移动场上的至多三张装备牌。","force":"吴","gender":"M","health":"4"},"j314":{"name":"界吴国太","skill":"甘露：出牌阶段限一次，你可以选择两名角色，交换他们装备区里的牌。如果他们装备区里的牌数之差大于你已损失体力值，你弃置两张手牌。/补益：当一名角色进入濒死状态时，你可以展示其一张手牌，若为非基本牌，其弃置之并回复1点体力。若其因此弃置了最后一张手牌，则摸一张牌","force":"吴","gender":"F","health":"3"},"j315":{"name":"界徐盛","skill":"破军：当你于出牌阶段使用【杀】指定目标后，你可以将其至多X张牌（X为其体力值）移出游戏直到回合结束：若其中有装备牌，弃置其中一张；若其中有锦囊牌，你摸一张牌。","force":"吴","gender":"M","health":"4"},"j316":{"name":"界张春华","skill":"绝情：当你造成伤害时，你可以失去等量的体力。若如此做，此伤害值翻倍。伤害结算完毕后，绝情改为锁定技，你即将造成的伤害视为失去体力。/伤逝：当你的手牌数小于你已损失的体力值时，你可以将手牌补至等同于你已损失的体力值。","force":"魏","gender":"F","health":"3"},"j317":{"name":"界荀攸","skill":"奇策：出牌阶段限一次，你可以将所有手牌当任意普通锦囊牌使用。/智愚：当你受到伤害后，你可以摸一张牌，然后展示所有手牌且伤害来源弃置一张手牌，若颜色均相同，你获得弃置的牌且下回合奇策发动次数+1。","force":"魏","gender":"M","health":"3"},"j318":{"name":"界廖化","skill":"当先：锁定技，回合开始时，你执行一个额外的出牌阶段，此阶段开始时你失去1点体力并从弃牌堆获得一张【杀】。/伏枥：限定技，当你处于濒死状态时，你可以将体力回复至X点且手牌摸至X张（X为全场势力数），然后当先中失去体力的效果改为可选。若X大于等于3，你翻面。","force":"蜀","gender":"M","health":"4"},"j319":{"name":"界马岱","skill":"马术：锁定技，你计算于其他角色的距离-1。/潜袭：准备阶段，你可以摸一张牌并弃置一张牌，然后令距离为1的一名角色本回合不能使用或打出与你弃置牌颜色相同的手牌且你无视其装备区里颜色相同的防具。该角色本回合回复体力时，你摸两张牌。","force":"蜀","gender":"M","health":"4"},"j320":{"name":"界步练师","skill":"安恤：出牌阶段限一次，你可以令一名其他角色展示并获得另一名手牌数大于其的其他角色一张手牌，若不为黑桃，你摸一张牌；若他们的手牌数因此相同，则你回复1点体力。/追忆：当你死亡时，你可以令一名其他角色（杀死你的角色除外）摸X张牌（X为存活角色数），并回复1点体力。","force":"吴","gender":"F","health":"3"},"j321":{"name":"界程普","skill":"疠火：你使用的普通【杀】可以视为火【杀】，若此牌造成伤害，你失去1点体力。你使用的火【杀】可以多指定一个目标。你每回合使用的第一张牌如果是【杀】，则此【杀】结算完毕后可置于你的武将牌上。/醇醪：结束阶段，若你没有【醇】，你可以将任意张【杀】置于你的武将牌上，成为【醇】。当一名角色处于濒死状态时，你可以移去一张【醇】，然后其视为使用一张【酒】。若移去的【醇】为【火杀】，则你回复1点体力；若移去的【醇】为【雷杀】，你摸两张牌。","force":"吴","gender":"M","health":"4"},"j322":{"name":"界韩当","skill":"弓骑：出牌阶段限一次，你可以弃置一张牌令你本回合攻击范围无限，且与弃置的牌花色相同的【杀】无次数限制。若弃置牌为装备牌，你可以弃置一名其他角色的一张牌。/解烦：限定技，出牌阶段，你可以选择一名角色，令所有攻击范围内包含其的角色各选择一项：1.弃置一张武器牌；2.令其摸一张牌。若此时是第一轮游戏，则回合结束时此限定技视为未发动过。","force":"吴","gender":"M","health":"4"},"j323":{"name":"界刘表","skill":"自守：摸牌阶段，你可以多模X张牌（X为全场势力数），然后防止你本回合对其他角色造成的伤害。结束阶段，若你本回合没有使用牌指定其他角色为目标，你可以弃置任意张花色不同的手牌，然后摸等量的牌。/宗室：锁定技，你的手牌上限+X（X为全场势力数）。你的回合外，若你的手牌数大于等于手牌上限，延时类锦囊牌或无颜色的牌对你无效。","force":"群","gender":"M","health":"3"},"j324":{"name":"界钟会","skill":"权计：当你的牌被其他角色获得后或当你受到1点伤害后，你可以摸一张牌，然后将一张手牌置于你的武将牌上，成为【权】。你的手牌上限+X（X为【权】的数量）。/自立：觉醒技，准备阶段，若你【权】的数量不小于3，你回复1点体力并摸两张牌，然后减少1点体力上限，获得【排异】。/排异：出牌阶段每项限一次，你可以移去一张【权】，然后选择一项：1.令一名角色摸X张牌；2.对X名角色各造成1点伤害（X为【权】数且至少为1）。","force":"魏","gender":"M","health":"4"},"j325":{"name":"界曹冲","skill":"称象：当你受到伤害后，你可以亮出牌堆顶四张牌，获得其中任意张点数和不大于13的牌。若获得的牌点数为13，则你复原武将牌。/仁心：当体力值为1的其他角色受到伤害时，你可以弃置一张装备牌并翻面，然后防止此伤害。","force":"魏","gender":"M","health":"3"},"j327":{"name":"界关平","skill":"竭忠：限定技，出牌阶段开始时，你可以将手牌摸至体力上限。/龙吟：当一名角色于其出牌阶段内使用【杀】时，你可以弃置一张牌，令此【杀】不计入此阶段使用次数，若此【杀】为红色，你摸一张牌。若你弃置的牌与【杀】点数相同，竭忠视为未发动过。","force":"蜀","gender":"M","health":"4"},"j328":{"name":"界简雍","skill":"巧说：出牌阶段，你可以拼点：若你赢，你本回合使用的下一张牌可以多指定或少指定一个目标；若你没赢，你结束出牌阶段且本回合锦囊牌不计入手牌上限。/纵适：当你拼点赢时，你可以获得点数较小的拼点牌；当你拼点没赢时，你可以获得你的拼点牌。","force":"蜀","gender":"M","health":"3"},"j329":{"name":"界刘封","skill":"陷嗣：准本阶段，你可以将至多两名角色的各一张牌置于你的武将牌上，成为【逆】。其他角色可以移去两张【逆】视为对你使用一张【杀】。若【逆】数超过你的体力值，你可以移去一张【逆】视为使用一张【杀】。","force":"蜀","gender":"M","health":"4"},"j330":{"name":"界虞翻","skill":"纵玄：当你的牌因弃置而进入弃牌堆后，若其中有锦囊牌，你可以令一名其他角色获得其中一张，然后你可以将其中任意张牌置于牌堆顶。/直言：结束阶段，你可以令一名角色摸一张牌并展示之，若此牌为基本牌，你摸一张牌。若为装备牌，其使用之并回复1点体力。","force":"吴","gender":"M","health":"3"},"j331":{"name":"界朱然","skill":"胆守：每个回合限一次，当你成为基本牌或锦囊牌的目标后，你可以摸X张牌（X为你本回合成为牌的目标次数）；当前回合角色的结束阶段，若你本回合没有以此法摸牌，你可以弃置与其手牌数相同的牌数对其造成1点伤害。","force":"吴","gender":"M","health":"4"},"j332":{"name":"界李儒","skill":"绝策：结束阶段，你可以对一名没有手牌的其他角色造成1点伤害。/灭计：出牌阶段限一次，你可以将一张武器牌或黑色锦囊牌置于牌堆顶并令一名有手牌的其他角色选择一项：1.弃置一张锦囊牌；2.依次弃置两张非锦囊牌。/焚城：限定技，出牌阶段，你可以选择一名角色，从该角色起，所有其他角色依次选择一项：1.弃置任意张牌（须比上家弃置的牌多）；2.受到你造成的2点火焰伤害。","force":"群","gender":"M","health":"3"},"j333":{"name":"界法正","skill":"恩怨：当你获得一名其他角色至少两张牌后，你可以令其摸一张牌。当你受到1点伤害后，除非伤害来源交给你一张手牌，否则其失去1点体力。若其交给你的牌不是红桃，你摸一张牌。/眩惑：摸牌阶段结束时，你可以交给一名其他角色摸两张手牌，然后该角色选择一项：1.视为对你选择的另一名其他角色使用任意一种【杀】或【决斗】；2.或交给你所有手牌。","force":"蜀","gender":"M","health":"3"},"j334":{"name":"界王异","skill":"贞烈：当你成为【杀】或普通锦囊牌的目标后，你可以失去1点体力令此牌对你无效，然后你弃置使用者一张牌。/秘计：结束阶段，你可以摸X张牌（X为你已损失体力值），然后你可以交给其他角色X张手牌。","force":"魏","gender":"F","health":"4"},"j335":{"name":"界关兴张苞","skill":"父魂：你可以将两张手牌当【杀】使用或打出。当你于出牌阶段以此法造成伤害后，你本回合获得【武圣】【咆哮】。/同心：锁定技，你的攻击范围始终+2。","force":"蜀","gender":"M","health":"4"},"j336":{"name":"界曹真","skill":"司敌：结束阶段，你可以将一张非基本牌置于武将牌上，称为【司】。其他角色的出牌阶段开始时，你可以移去一张【司】，然后该角色于此阶段内不能使用和打出与此【司】颜色相同的牌。此阶段结束时，若其本阶段未使用过【杀】，你视为对其使用一张【杀】；若其没有使用锦囊牌，你摸两张牌。","force":"魏","gender":"M","health":"4"},"j337":{"name":"界韩浩史涣","skill":"慎断：当你的一张黑色基本牌或黑色装备牌因弃置而置入弃牌堆后，你可以将此牌当无距离限制的【兵粮寸断】使用。/勇略：其他角色判定阶段开始时，你可以弃置其判定区里的一张牌。然后若该角色在你的攻击范围内，你摸一张牌。若其在你攻击范围外，视为你对其使用一张【杀】。","force":"魏","gender":"M","health":"4"},"j338":{"name":"界陈群","skill":"品第：出牌阶段，每名角色限一次，你可以弃置一张本阶段未以此法弃置过的类型的牌，令一名其他角色摸X张牌或弃置X张牌（X为本回合本技能发动次数），若其已受伤，你须横置或重置自身。/法恩：当一名角色翻至正面或横置后，你可以令其摸一张牌。","force":"魏","gender":"M","health":"3"},"j339":{"name":"界周仓","skill":"忠勇：当你使用【杀】后，你可以将此【杀】以及目标角色响应的【闪】交给一名其他角色，若其获得的牌中有红色，则其可以对你攻击范围内一名角色使用一张【杀】。若其获得的牌中有黑色，其摸一张牌。","force":"蜀","gender":"M","health":"4"},"j340":{"name":"界张松","skill":"强识：出牌阶段开始时，你可以展示一名其他角色一张手牌，然后当你本阶段使用与展示牌类型相同的牌时，你可以摸一张牌。/献图：其他角色出牌阶段开始时，你可以摸两张牌，然后交给其两张牌，此阶段结束时，若其此阶段内没有造成过伤害，你失去1点体力。","force":"蜀","gender":"M","health":"3"},"j341":{"name":"界孙鲁班","skill":"僭毁：当你使用【杀】或普通锦囊牌指定唯一目标时，你可以令另一名其他角色选择一项：1.交给你一张牌并代替你成为此牌的使用者；2.也成为此牌的目标（然后此技能本回合失效）。/骄矜:当你成为其他角色使用【杀】或普通锦囊牌的目标后，你可以弃置一张装备牌，然后此牌对你无效并获得此牌。（若使用者为女性角色，此技能本回合失效）","force":"吴","gender":"F","health":"3"},"j342":{"name":"界朱桓","skill":"奋励：若你的手牌数为全场最多，你可以跳过摸牌阶段；若你的体力值为全场最多，你可以跳过出牌阶段；若你的装备区里有牌且数量为全场最多，你可以跳过弃牌阶段。/平寇：回合结束后，你可以对至多X名其他角色各造成1点伤害（X为你本回合跳过的阶段数）。若你跳过的阶段数大于你选择的角色数，则其中一名角色随机弃置装备区里的一张牌。","force":"吴","gender":"M","health":"4"},"j343":{"name":"界沮授","skill":"渐营：当你于使用牌时，若此牌的点数或花色与你本阶段使用的上一张牌相同，你可以摸一张牌。/矢北：锁定技，当你每回合首次受到伤害后，你回复1点体力，你每回合第二次受到伤害后，你失去1点体力。","force":"群","gender":"M","health":"3"},"j344":{"name":"界蔡夫人","skill":"窃听：其他角色的回合结束时，若其本回合没有造成过伤害，则你可以将其装备区里的一张牌置入你的装备区；若其没有对其他角色使用过牌，你摸一张牌。/献州：限定技，出牌阶段，你可以将你装备区里的所有牌交给一名其他角色，然后你回复X点体力，且对其攻击范围内至多X名角色各造成1点伤害。（X为你给出的牌数）","force":"群","gender":"F","health":"3"},"j345":{"name":"界曹休","skill":"千驹：锁定技，你计算与其他角色的距离-X（X为你已损失体力值）。/倾袭：当你使用【杀】或【决斗】指定目标后，你可以令其选择一项：1.弃置等同你攻击范围内的人数张手牌（最多为二，若你装备区有武器牌，则改为最多为四），然后弃置你的武器牌。2.令此牌对其伤害+1且进行一次判定，若结果为红色，此牌不能被该角色响应。","force":"魏","gender":"M","health":"4"},"j346":{"name":"界刘谌","skill":"战绝：出牌阶段，你可以将所有手牌当【决斗】使用，然后你与因此受伤的角色各摸一张牌，若你本阶段以此法摸过至少三张牌，本回合战绝失效。/勤王：主公技，出牌阶段限一次，你可令所有其他蜀国角色依次选择是否交给你一张【杀】，然后你可令选择是的角色摸一张牌。以此法获得的【杀】本回合不计算在战绝使用的牌中。","force":"蜀","gender":"M","health":"4"},"j347":{"name":"界夏侯氏","skill":"樵拾：其他角色的结束阶段，若你与其手牌数相等，你可以与其各摸一张牌，若这两张牌花色相同，你可以重复此流程。/燕语：出牌阶段，你可以重铸【杀】。出牌阶段结束时，你可以令一名男性角色摸X牌（X为你于此阶段重铸杀的数量且至多为3）。","force":"蜀","gender":"F","health":"3"},"j349":{"name":"界全琮","skill":"邀名：每回合每个选项限一次，当你造成或受到伤害后，你可以选择一项：1.弃置手牌数大于你的一名角色一张手牌；2.令手牌数小于你的一名角色摸一张牌；3.令手牌数与你相同的一名角色弃置至多两张牌然后摸等量的牌。","force":"吴","gender":"M","health":"4"},"j350":{"name":"界公孙渊","skill":"怀异：出牌阶段限一次，你可以展示所有手牌。若只有一种颜色，你摸一张牌，然后此技能本阶段改为出牌阶段限两次；若有两种颜色，你弃置其中一种颜色的牌，然后获得至多X名角色的各一张牌（X为弃置的手牌数）。若你以此法获得了至少两张牌，你失去1点体力。","force":"群","gender":"M","health":"4"},"j351":{"name":"界郭图逢纪","skill":"急攻：出牌阶段开始时，你可以摸至多三张牌，然后本回合手牌上限等于你本阶段造成的伤害值，若此伤害值大于等于你摸的牌数，你回复1点体力。/饰非：当你需要使用或打出【闪】时，你可以令当前回合角色摸一张牌，若其不是手牌数全场唯一最多的角色，你弃置最多的角色一张牌，视为你使用或打出一张【闪】。","force":"群","gender":"M","health":"3"},"j352":{"name":"界董白","skill":"连诛：出牌阶段限一次，你可以展示并交给一名其他角色一张牌，若此牌为红色，你摸一张牌；若此牌为黑色，其选择一项：1.你摸两张牌；2.弃置两张牌。/黠慧：锁定技，你的黑色牌不计入手牌上限。当其他角色获得你的黑色牌时，其不能使用，打出，弃置这些牌直到其体力值减少；其他角色的回合结束时，若其本回合失去过黠慧牌，且手牌中没有黠慧牌，其失去1点体力。","force":"群","gender":"F","health":"3"},"j353":{"name":"界阚泽","skill":"下书：出牌阶段开始时，你可以交给一名其他角色所有手牌，然后其展示任意张手牌，你选择获得其：1.以此法展示的牌，2.未以此法展示的手牌。/宽释：结束阶段，你可以选择一名角色，直到你的下回合开始，该角色于同一回合内受到第2点伤害后，其回复1点体力。（每回合限一次）","force":"吴","gender":"M","health":"3"},"j354":{"name":"界陈到","skill":"往烈：你出牌阶段使用的首两张牌无距离限制。当你于出牌阶段使用一张牌时,你可以令此牌不能被响应,然后你本阶段不能再对其他角色使用牌。","force":"蜀","gender":"M","health":"4"},"j355":{"name":"界唐咨","skill":"兴棹：锁定技,若场上受伤角色为:1个或以上,你视为拥有【恂恂】;2个或以上,你使用装备牌时摸一张牌;3个或以上,你跳过判定和弃牌阶段；0个，4个或以上，你造成的伤害+1。","force":"魏","gender":"M","health":"4"},"j356":{"name":"界郭皇后","skill":"矫诏：出牌阶段限一次,你可以展示一张手牌,然后令你距离最近的角色声明一种基本牌或普通锦囊牌,你本回合可以将展示牌当声明的牌使用(不能对自己使用)。/殚心：当你受到伤害后,你可以摸一张牌，然后修改【矫诏】。/矫诏修改一：出牌阶段限一次,你可以展示一张手牌并声明一种基本牌或普通锦囊牌,你本回合可以将展示牌当声明的牌使用(不能对自己使用)。/矫诏修改二：出牌阶段限,你可以将一张手牌当任意基本牌或普通锦囊牌使用(每个类型牌限一次)。","force":"魏","gender":"F","health":"3"},"j357":{"name":"界李严","skill":"督粮：出牌阶段限一次,你可以获得一名其他角色一张牌，然后选择一项:1.你观看牌堆顶的两张牌,然后选择其中的1-2张基本牌令其获得之;2.令其下回合摸牌阶段多摸一张牌。/腹鱗：锁定技,弃牌阶段,你于本回合获得的牌不计入手牌上限。","force":"蜀","gender":"M","health":"3"},"j358":{"name":"界孙登","skill":"匡弼：出牌阶段开始时,你可以令一名其他角色將至多三张牌置于你的武将牌上直到回合结束。若如此做,你此阶段使用一张牌时，若你有匡弼牌：此牌与匡弼牌花色相同，移去一张同花色的匡弼牌，然后你与该角色各摸一张牌；若花色不同，则随机移除一张匡弼牌且你摸一张牌。","force":"吴","gender":"M","health":"4"},"j359":{"name":"界黄皓","skill":"寝情：结束阶段,你可以选择任意名攻击范围内包含主公的角色,依次弃置其一张牌,然后令其各摸一张牌,若如此做,你摸X张牌(X为其中手牌比主公多的角色数)。/贿生：当其他角色对你造成伤害时,你可以令其观看你任意张牌并令其选择一项:1.获得其中一张,防止此伤害,然后你本局不能对其发动本技能;2.弃置等量张牌。/存畏：锁定技，当你成为锦囊牌的目标后，若你不是此牌唯一目标，你弃置一张牌。若你时此牌唯一目标，你摸一张牌。","force":"蜀","gender":"M","health":"3"},"j360":{"name":"界潘璋马忠","skill":"夺刀：当你成为【杀】的目标后，你可以弃置一张牌，然后获得使用者装备区里的武器牌。/暗箭：锁定技,当你使用【杀】指定目标后，若你不在其攻击范围内，则此【杀】无视该角色防具且对其伤害+1。若该角色因此进入濒死状态，其不能使用【桃】。","force":"吴","gender":"M","health":"4"},"j361":{"name":"界于禁","skill":"镇军：准备阶段或结束阶段，你可以弃置一名角色X张牌（X为其手牌数减体力值且最少为1），若其中没有装备牌，你选择一项：1.你弃一张牌；2.该角色摸等量的牌。","force":"魏","gender":"M","health":"4"},"j362":{"name":"邢道荣","skill":"虚揭：出牌阶段开始时，你可以减1点体力上限，然后你弃置距离1以内的每名角色各一张牌或这些角色各摸一张牌。出牌阶段结束后，若你体力上限不为全场最高，你加1点体力上限，然后选择回复1点体力或摸两张牌。","force":"群","gender":"M","health":"6"},"j326":{"name":"夏侯杰","skill":"裂胆：锁定技，其他角色的准备阶段，你与其依次比较双方的手牌数，体力值与装备区牌数，你每有一项大于该角色则摸一张牌。若均大于该角色，你加1点体力上限（最多为8）；若均小于等于，你失去1点体力并获得一枚【裂】标记。准备阶段，若【裂】大于等于5，你死亡。/壮胆：锁定技，其他角色的回合结束时，若你的手牌数是全场唯一最多的，裂胆失效直到你的回合结束。","force":"魏","gender":"M","health":"5"},"j348":{"name":"董成","skill":"血诏：出牌阶段限一次，你可以弃置一张手牌并选择至多X名其他角色（X为你的体力上限），选中的角色依次选择是否交给你一张牌。若选择是，该角色摸一张牌且你本回合可多使用一张【杀】；若选择否，该角色本回合无法响应你使用的牌。","force":"群","gender":"M","health":"4"},"j363":{"name":"曹金玉","skill":"隅泣：当有角色受到伤害后，若你与其距离0或者更少，你可以观看牌堆顶的三张牌，将其中至多一张交给受伤角色，至多一张自己获得，剩余的牌放回牌堆顶。（每回合限触发2次）。/善身：当有角色死亡时，你可令【隅泣】中的一个数字+2（单项不能超过5）。然后若你没有对死亡角色造成过伤害，你回复1点体力。/娴静：准备阶段，你可令【隅泣】中的一个数字+1（单项不能超过5）。若你满体力值，则再令【隅泣】中的一个数字+1。/【隅泣】可增加的数字为：距离，观看数量，交给受伤角色牌的数量，自己获得牌的数量。","force":"魏","gender":"F","health":"3"},"j364":{"name":"伏完","skill":"谋溃：当你使用【杀】指定目标后，你可以选择任意项：1.摸一张牌；2：弃置其中一个目标角色一张牌。若你两项都选，则此【杀】无效或被抵消后该角色弃置你一张牌。","force":"群","gender":"M","health":"4"},"j365":{"name":"韩遂","skill":"逆乱：出牌阶段，你可以将一张黑色牌当【杀】使用，若此【杀】没有造成伤害则不计入使用次数。/违忤：出牌阶段限一次，你可以将一张红色牌当一张无距离限制的【顺手牵羊】使用。","force":"群","gender":"M","health":"4"}}');

/***/ }),

/***/ "./src/data/pai.json":
/*!***************************!*\
  !*** ./src/data/pai.json ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = JSON.parse('{"p1":{"suit":"diamond","rank":"A","name":"决斗"},"p2":{"suit":"diamond","rank":"A","name":"诸葛连弩"},"p3":{"suit":"diamond","rank":"A","name":"朱雀羽扇","desc":"4"},"p4":{"suit":"diamond","rank":"2","name":"闪"},"p5":{"suit":"diamond","rank":"2","name":"闪"},"p6":{"suit":"diamond","rank":"2","name":"桃"},"p7":{"suit":"diamond","rank":"3","name":"闪"},"p8":{"suit":"diamond","rank":"3","name":"桃"},"p9":{"suit":"diamond","rank":"3","name":"顺手牵羊"},"p10":{"suit":"diamond","rank":"4","name":"火杀"},"p11":{"suit":"diamond","rank":"4","name":"闪"},"p12":{"suit":"diamond","rank":"4","name":"顺手牵羊"},"p13":{"suit":"diamond","rank":"5","name":"火杀"},"p14":{"suit":"diamond","rank":"5","name":"闪"},"p15":{"suit":"diamond","rank":"5","name":"贯石斧","desc":"3"},"p16":{"suit":"diamond","rank":"6","name":"杀"},"p17":{"suit":"diamond","rank":"6","name":"闪"},"p18":{"suit":"diamond","rank":"6","name":"闪"},"p19":{"suit":"diamond","rank":"7","name":"杀"},"p20":{"suit":"diamond","rank":"7","name":"闪"},"p21":{"suit":"diamond","rank":"7","name":"闪"},"p22":{"suit":"diamond","rank":"8","name":"杀"},"p23":{"suit":"diamond","rank":"8","name":"闪"},"p24":{"suit":"diamond","rank":"8","name":"闪"},"p25":{"suit":"diamond","rank":"9","name":"杀"},"p26":{"suit":"diamond","rank":"9","name":"闪"},"p27":{"suit":"diamond","rank":"9","name":"酒"},"p28":{"suit":"diamond","rank":"10","name":"杀"},"p29":{"suit":"diamond","rank":"10","name":"闪"},"p30":{"suit":"diamond","rank":"10","name":"闪"},"p31":{"suit":"diamond","rank":"J","name":"闪"},"p32":{"suit":"diamond","rank":"J","name":"闪"},"p33":{"suit":"diamond","rank":"J","name":"闪"},"p34":{"suit":"diamond","rank":"Q","name":"桃"},"p35":{"suit":"diamond","rank":"Q","name":"火攻"},"p36":{"suit":"diamond","rank":"Q","name":"方天画戟","desc":"4"},"p37":{"suit":"diamond","rank":"Q","name":"无懈可击"},"p38":{"suit":"diamond","rank":"K","name":"杀"},"p39":{"suit":"diamond","rank":"K","name":"紫骍","desc":"-"},"p40":{"suit":"diamond","rank":"K","name":"骅骝","desc":"+"},"p41":{"suit":"club","rank":"A","name":"决斗"},"p42":{"suit":"club","rank":"A","name":"诸葛连弩"},"p43":{"suit":"club","rank":"A","name":"白银狮子"},"p44":{"suit":"club","rank":"2","name":"杀"},"p45":{"suit":"club","rank":"2","name":"八卦阵"},"p46":{"suit":"club","rank":"2","name":"藤甲"},"p47":{"suit":"club","rank":"2","name":"仁王盾"},"p48":{"suit":"club","rank":"3","name":"杀"},"p49":{"suit":"club","rank":"3","name":"酒"},"p50":{"suit":"club","rank":"3","name":"过河拆桥"},"p51":{"suit":"club","rank":"4","name":"杀"},"p52":{"suit":"club","rank":"4","name":"过河拆桥"},"p53":{"suit":"club","rank":"4","name":"兵粮寸断"},"p54":{"suit":"club","rank":"5","name":"杀"},"p55":{"suit":"club","rank":"5","name":"雷杀"},"p56":{"suit":"club","rank":"5","name":"的卢","desc":"+"},"p57":{"suit":"club","rank":"6","name":"杀"},"p58":{"suit":"club","rank":"6","name":"雷杀"},"p59":{"suit":"club","rank":"6","name":"乐不思蜀"},"p60":{"suit":"club","rank":"7","name":"杀"},"p61":{"suit":"club","rank":"7","name":"雷杀"},"p62":{"suit":"club","rank":"7","name":"南蛮入侵"},"p63":{"suit":"club","rank":"8","name":"杀"},"p64":{"suit":"club","rank":"8","name":"杀"},"p65":{"suit":"club","rank":"8","name":"雷杀"},"p66":{"suit":"club","rank":"9","name":"杀"},"p67":{"suit":"club","rank":"9","name":"杀"},"p68":{"suit":"club","rank":"9","name":"酒"},"p69":{"suit":"club","rank":"10","name":"杀"},"p70":{"suit":"club","rank":"10","name":"杀"},"p71":{"suit":"club","rank":"10","name":"铁索连环"},"p72":{"suit":"club","rank":"J","name":"杀"},"p73":{"suit":"club","rank":"J","name":"杀"},"p74":{"suit":"club","rank":"J","name":"铁索连环"},"p75":{"suit":"club","rank":"Q","name":"借刀杀人"},"p76":{"suit":"club","rank":"Q","name":"无懈可击"},"p77":{"suit":"club","rank":"Q","name":"铁索连环"},"p78":{"suit":"club","rank":"K","name":"借刀杀人"},"p79":{"suit":"club","rank":"K","name":"无懈可击"},"p80":{"suit":"club","rank":"K","name":"铁索连环"},"p81":{"suit":"heart","rank":"A","name":"万箭齐发"},"p82":{"suit":"heart","rank":"A","name":"桃园结义"},"p83":{"suit":"heart","rank":"A","name":"无懈可击"},"p84":{"suit":"heart","rank":"2","name":"闪"},"p85":{"suit":"heart","rank":"2","name":"闪"},"p86":{"suit":"heart","rank":"2","name":"火攻"},"p87":{"suit":"heart","rank":"3","name":"桃"},"p88":{"suit":"heart","rank":"3","name":"五谷丰登"},"p89":{"suit":"heart","rank":"3","name":"火杀"},"p90":{"suit":"heart","rank":"4","name":"火杀"},"p91":{"suit":"heart","rank":"4","name":"桃"},"p92":{"suit":"heart","rank":"4","name":"五谷丰登"},"p93":{"suit":"heart","rank":"5","name":"桃"},"p94":{"suit":"heart","rank":"5","name":"麒麟弓","desc":"5"},"p95":{"suit":"heart","rank":"5","name":"赤兔","desc":"-"},"p96":{"suit":"heart","rank":"6","name":"桃"},"p97":{"suit":"heart","rank":"6","name":"桃"},"p98":{"suit":"heart","rank":"6","name":"乐不思蜀"},"p99":{"suit":"heart","rank":"7","name":"火杀"},"p100":{"suit":"heart","rank":"7","name":"桃"},"p101":{"suit":"heart","rank":"7","name":"无中生有"},"p102":{"suit":"heart","rank":"8","name":"闪"},"p103":{"suit":"heart","rank":"8","name":"桃"},"p104":{"suit":"heart","rank":"8","name":"无中生有"},"p105":{"suit":"heart","rank":"9","name":"闪"},"p106":{"suit":"heart","rank":"9","name":"桃"},"p107":{"suit":"heart","rank":"9","name":"无中生有"},"p108":{"suit":"heart","rank":"10","name":"杀"},"p109":{"suit":"heart","rank":"10","name":"杀"},"p110":{"suit":"heart","rank":"10","name":"火杀"},"p111":{"suit":"heart","rank":"J","name":"杀"},"p112":{"suit":"heart","rank":"J","name":"闪"},"p113":{"suit":"heart","rank":"J","name":"无中生有"},"p114":{"suit":"heart","rank":"Q","name":"闪"},"p115":{"suit":"heart","rank":"Q","name":"桃"},"p116":{"suit":"heart","rank":"Q","name":"过河拆桥"},"p117":{"suit":"heart","rank":"Q","name":"闪电"},"p118":{"suit":"heart","rank":"K","name":"闪"},"p119":{"suit":"heart","rank":"K","name":"爪黄飞电","desc":"+"},"p120":{"suit":"heart","rank":"K","name":"无懈可击"},"p121":{"suit":"spade","rank":"A","name":"决斗"},"p122":{"suit":"spade","rank":"A","name":"闪电"},"p123":{"suit":"spade","rank":"A","name":"古锭刀","desc":"2"},"p124":{"suit":"spade","rank":"2","name":"雌雄双股","desc":"2"},"p125":{"suit":"spade","rank":"2","name":"八卦阵"},"p126":{"suit":"spade","rank":"2","name":"藤甲"},"p127":{"suit":"spade","rank":"2","name":"寒冰剑","desc":"2"},"p128":{"suit":"spade","rank":"3","name":"酒"},"p129":{"suit":"spade","rank":"3","name":"过河拆桥"},"p130":{"suit":"spade","rank":"3","name":"顺手牵羊"},"p131":{"suit":"spade","rank":"4","name":"雷杀"},"p132":{"suit":"spade","rank":"4","name":"过河拆桥"},"p133":{"suit":"spade","rank":"4","name":"顺手牵羊"},"p134":{"suit":"spade","rank":"5","name":"雷杀"},"p135":{"suit":"spade","rank":"5","name":"青龙偃月","desc":"3"},"p136":{"suit":"spade","rank":"5","name":"绝影","desc":"+"},"p137":{"suit":"spade","rank":"6","name":"雷杀"},"p138":{"suit":"spade","rank":"6","name":"乐不思蜀"},"p139":{"suit":"spade","rank":"6","name":"青釭剑","desc":"2"},"p140":{"suit":"spade","rank":"7","name":"杀"},"p141":{"suit":"spade","rank":"7","name":"雷杀"},"p142":{"suit":"spade","rank":"7","name":"南蛮入侵"},"p143":{"suit":"spade","rank":"8","name":"杀"},"p144":{"suit":"spade","rank":"8","name":"杀"},"p145":{"suit":"spade","rank":"8","name":"雷杀"},"p146":{"suit":"spade","rank":"9","name":"杀"},"p147":{"suit":"spade","rank":"9","name":"杀"},"p148":{"suit":"spade","rank":"9","name":"酒"},"p149":{"suit":"spade","rank":"10","name":"杀"},"p150":{"suit":"spade","rank":"10","name":"杀"},"p151":{"suit":"spade","rank":"10","name":"兵粮寸断"},"p152":{"suit":"spade","rank":"J","name":"顺手牵羊"},"p153":{"suit":"spade","rank":"J","name":"无懈可击"},"p154":{"suit":"spade","rank":"J","name":"铁索连环"},"p155":{"suit":"spade","rank":"Q","name":"过河拆桥"},"p156":{"suit":"spade","rank":"Q","name":"铁索连环"},"p157":{"suit":"spade","rank":"Q","name":"丈八蛇矛","desc":"3"},"p158":{"suit":"spade","rank":"K","name":"无懈可击"},"p159":{"suit":"spade","rank":"K","name":"南蛮入侵"},"p160":{"suit":"spade","rank":"K","name":"大宛","desc":"-"}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!************************************!*\
  !*** ./docs/sango-design-entry.js ***!
  \************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _sango_design_memory_cjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./sango-design-memory.cjs */ "./docs/sango-design-memory.cjs");
/* harmony import */ var _src_gameController_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../src/gameController.js */ "./src/gameController.js");
/* harmony import */ var _src_wc_sgTable_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../src/wc/sgTable.js */ "./src/wc/sgTable.js");
/* harmony import */ var _src_data_pai_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../src/data/pai.json */ "./src/data/pai.json");
/* harmony import */ var _sango_public_v3_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./sango-public-v3.css */ "./docs/sango-public-v3.css");
/* harmony import */ var _sango_public_polish_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./sango-public-polish.css */ "./docs/sango-public-polish.css");
/* harmony import */ var _sango_public_v3_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./sango-public-v3.js */ "./docs/sango-public-v3.js");








document.querySelector('.design-heading p').textContent='选择任意区域的牌，中央选牌栏显示来源与操作 · 本地演示，刷新重置';
// Dialogs live outside component shadow roots and need the same public-area styles.
const dialogStyles=document.createElement('style');
dialogStyles.textContent=_sango_public_v3_css__WEBPACK_IMPORTED_MODULE_4__["default"]+`
.v3-dialog .v3-sort section{max-height:42vh;overflow:auto}
.v3-dialog .v3-sort h3{position:sticky;top:-12px;background:#0b3027;padding:8px 0;z-index:1}
.v3-dialog .v3-sort .v3-row{flex-wrap:nowrap}
.v3-dialog .v3-sort .v3-row span{min-width:0;overflow-wrap:anywhere}
.v3-dialog .v3-sort .v3-row button{flex-shrink:0}
.v3-dialog .v3-sort.three-lanes{grid-template-columns:repeat(3,minmax(250px,1fr));overflow-x:auto}
.v3-dialog .v3-record button{font-size:12px;padding:4px}
`;
dialogStyles.textContent+=_sango_public_polish_css__WEBPACK_IMPORTED_MODULE_5__["default"];
document.head.append(dialogStyles);

// Reuse production components against an isolated, in-memory room.
const make=(n,offset=0)=>Object.fromEntries(Array.from({length:n},(_,i)=>['c'+i,{id:'p'+((i+offset)%80+1),show:'0',order:i}]));
const room={tableDecks:{pai:{cards:{}},discard:{cards:{}}}};
for(let i=1;i<=6;i++)room['p'+i]={name:i===1?'你 · 本地预览':'玩家 '+i,hp:'12/15',role:'忠',debuff:'00',hand:{cards:make(i===1?24:5)},other1:{cards:make(i===1?12:0,20)},other2:{cards:make(i===1?8:0,40)},pan:{cards:{}},zhuang:{cards:make(2,1)},jiang:{cards:{}},jiang1:{cards:{general:{id:'j'+i,show:'1',order:0}}},jiang2:{cards:{general:{id:'j'+(i+100),show:'0',order:0}}}};
(0,_sango_design_memory_cjs__WEBPACK_IMPORTED_MODULE_0__.seed)({game:{6:room}});
const controller=new _src_gameController_js__WEBPACK_IMPORTED_MODULE_1__.gameController({},'6');controller.playerCount=6;controller.currentPlayer='p1';controller.userName='你 · 本地预览';
controller.writePatch=patch=>(0,_sango_design_memory_cjs__WEBPACK_IMPORTED_MODULE_0__.update)((0,_sango_design_memory_cjs__WEBPACK_IMPORTED_MODULE_0__.ref)({}),patch);
const table=new _src_wc_sgTable_js__WEBPACK_IMPORTED_MODULE_2__.SgTable({},controller);document.getElementById('design-game').append(table);
const styles=document.createElement('style');styles.textContent=_sango_public_v3_css__WEBPACK_IMPORTED_MODULE_4__["default"]+`
.table-public{display:none}.public-tools{display:none}
.design-public{position:absolute;left:20px;top:287px;width:1020px;z-index:4}
.design-public .v3-shell{min-height:220px;padding:12px 16px}.design-public .v3-card{height:87px}
.design-public .v3-topline{margin-bottom:7px}.design-public .v3-face-actions{flex-direction:row}
.v3-sim{display:flex;align-items:center;gap:8px}.v3-sim button{font-size:12px;padding:3px 8px}.v3-card.taken{opacity:.4}
.v3-sort.three-lanes{grid-template-columns:repeat(3,minmax(0,1fr))}
.card-menu,.card-menu.hide{position:absolute;top:565px;bottom:auto;left:20px;right:auto;transform:none;display:flex!important;height:48px;width:1020px;max-width:none;z-index:8;border-radius:8px;padding:6px 12px;gap:8px;box-sizing:border-box;background:#10392f;border-color:#e2b84b66;box-shadow:0 5px 16px #0003}
.card-menu.hide{background:#092c25;border-color:#ffffff19}.card-menu.hide button{display:none}.card-menu button{font-size:13px;padding:5px 12px;height:32px}.selection-label{font-size:13px;color:#dcca95}.card-menu.hide .selection-label{color:#8da99b;font-weight:400}
:host(.player-seated) .slot0{top:635px}.table-container{height:900px;min-height:900px}
.design-source-active{outline:1px solid #e2b84b88;outline-offset:3px}.v3-card.demo-selected{outline:2px solid #e2b84b;transform:translateY(-5px)}.v3-card{cursor:pointer}
@media(max-width:900px){.design-public{position:relative;inset:auto;grid-area:2/1;width:100%}.design-public .v3-shell{grid-template-columns:170px minmax(0,1fr) 130px;gap:10px}}
`;
styles.textContent+=_sango_public_polish_css__WEBPACK_IMPORTED_MODULE_5__["default"];
table.shadowRoot.append(styles);
if(document.body.dataset.compact==='true'){
  styles.textContent+=`.table-container{width:1100px;height:710px;min-height:710px;margin:0 auto;transform:none}.opponent-rail,.table-topbar,.action-log{display:none}.design-public{left:20px;top:40px;width:1060px}.card-menu,.card-menu.hide{top:325px;width:1060px}:host(.player-seated) .slot0{left:20px;top:400px;width:924px;height:230px}`;
}
const publicRoot=document.createElement('section');publicRoot.className='design-public';
table.shadowRoot.querySelector('.table-container').append(publicRoot,table.cardMenu);
const symbols={spade:'♠',heart:'♥',club:'♣',diamond:'♦'};let serial=1000;
const publicDesign=(0,_sango_public_v3_js__WEBPACK_IMPORTED_MODULE_6__.mountPublicDesign)(publicRoot,{
  async simulateOther(action){
    if(sending)return;
    const entry=Object.entries((0,_sango_design_memory_cjs__WEBPACK_IMPORTED_MODULE_0__.read)('game/6/p2/hand/cards')||{}).sort((a,b)=>a[1].order-b[1].order)[0];
    if(!entry)throw Error('玩家2的演示手牌已用完，可刷新页面重置。');
    const [key,value]=entry,data=_src_data_pai_json__WEBPACK_IMPORTED_MODULE_3__[value.id];
    await controller.writePatch({['game/6/p2/hand/cards/'+key]:null},`玩家2${action==='play'?'打出':'弃置'}`);
    publicDesign.accept([{id:++serial,dbId:value.id,suit:symbols[data.suit],rank:data.rank,name:data.name}],action,{id:'p2',name:'玩家2'});
  },
  receive(incoming){
    const existing=(0,_sango_design_memory_cjs__WEBPACK_IMPORTED_MODULE_0__.read)('game/6/p1/hand/cards')||{};
    let order=Math.max(-1,...Object.values(existing).map(c=>c.order||0));
    const patch={};
    for(const card of incoming){
      const id=card.dbId||Object.keys(_src_data_pai_json__WEBPACK_IMPORTED_MODULE_3__).find(id=>_src_data_pai_json__WEBPACK_IMPORTED_MODULE_3__[id].name===card.name&&symbols[_src_data_pai_json__WEBPACK_IMPORTED_MODULE_3__[id].suit]===card.suit&&String(_src_data_pai_json__WEBPACK_IMPORTED_MODULE_3__[id].rank)===String(card.rank))||Object.keys(_src_data_pai_json__WEBPACK_IMPORTED_MODULE_3__).find(id=>_src_data_pai_json__WEBPACK_IMPORTED_MODULE_3__[id].name===card.name);
      if(!id)throw Error('找不到演示卡牌：'+card.name);
      patch['game/6/p1/hand/cards/received'+(++serial)]={id,show:'0',order:++order};
    }
    // The memory adapter applies this patch synchronously before notifying components.
    return (0,_sango_design_memory_cjs__WEBPACK_IMPORTED_MODULE_0__.update)((0,_sango_design_memory_cjs__WEBPACK_IMPORTED_MODULE_0__.ref)({}),patch);
  }
});
let sending=false;
async function sendSelected(action){
  if(sending)return;
  const selected=[...controller.selectedCards].filter(card=>/\/p\d+\/(hand|other1|other2|zhuang|pan)\/cards\//.test(card.dataset.path));
  if(!selected.length)return;
  sending=true;
  try {
  if(action==='reveal'){
    await controller.writePatch(Object.fromEntries(selected.map(card=>[card.dataset.path+'/show','1'])),'亮出所选牌');
    selected.forEach(card=>card.unselectCard());
    publicRoot.querySelector('#v3-feedback').textContent='已亮牌，牌仍在玩家原区域；结算面板保持不变。';
    return;
  }
  const publicCards=selected.map(card=>{const data=_src_data_pai_json__WEBPACK_IMPORTED_MODULE_3__[card.cardData.id];return {id:++serial,dbId:card.cardData.id,suit:symbols[data.suit],rank:data.rank,name:data.name}});
  const patch=Object.fromEntries(selected.map(card=>[card.dataset.path,null]));
  await controller.writePatch(patch,action==='discard'?'弃置所选牌':'打出所选牌');
  publicDesign.accept(publicCards,action);
  } finally { sending=false; }
}
// Keep the real selection menu and selection lifecycle, adapting destinations for this design.
const buttons=[...table.cardMenu.querySelectorAll('button')];
const actions=[['收入手牌',()=>controller.drawSelectedCards()],['弃置',()=>sendSelected('discard')],['打出',()=>sendSelected('play')],['亮牌',()=>sendSelected('reveal')],['移动',()=>table.openMovePlayerPicker()],['取消选择',()=>[...controller.selectedCards].forEach(card=>card.unselectCard())]];
buttons.forEach((old,i)=>{const button=old.cloneNode(false);button.textContent=actions[i][0];button.onclick=()=>Promise.resolve(actions[i][1]()).catch(error=>window.alert(error.message));old.replaceWith(button)});
const originalShow=table.showCardMenu.bind(table);table.showCardMenu=()=>{
  originalShow();
  table.cardMenu.querySelector('button').disabled=controller.selectedCards.every(card=>card.dataset.path.includes('/p1/hand/'));
};
// Public design uses explicit actions for card transfers; the live area sorting still works.
controller.discardSelectedCards=()=>sendSelected('discard');

// Desktop preview: one stable, neutral selection bar for every source.
const discardSelection=new Set();
const labels={hand:'手牌',other1:'区1',other2:'区2',zhuang:'装备',pan:'判定区'};
const idleText='选择卡牌进行操作 · 支持自己、其他玩家和弃牌区';
const resetSources=()=>{
  table.shadowRoot.querySelectorAll('.design-source-active').forEach(node=>node.classList.remove('design-source-active'));
  table.playerDoms.forEach(player=>player.shadowRoot.querySelectorAll('.design-source-active').forEach(node=>node.classList.remove('design-source-active')));
};
const updateBar=()=>{
  resetSources();
  const selected=controller.selectedCards, sources=new Map();
  if(selected.some(card=>!card.dataset.path.includes('/p1/'))){table.cardMenu.classList.add('hide');return;}
  selected.forEach(card=>{
    const [,seat,area]=card.dataset.path.match(/\/((?:p\d+))\/([^/]+)\/cards\//)||[];
    if(!seat)return;
    sources.set(`${seat}/${area}`,`${seat==='p1'?'自己':'玩家 '+seat.slice(1)} · ${labels[area]||area}`);
    card.getRootNode().host.classList.add('design-source-active');
  });
  const label=table.cardMenu.querySelector('.selection-label');
  if(!selected.length){table.cardMenu.classList.add('hide');label.textContent=idleText;label.title='';return;}
  table.cardMenu.classList.remove('hide');
  label.textContent=`${sources.size===1?[...sources.values()][0]:`来自 ${sources.size} 个区域`} · 已选 ${selected.length} 张`;
  label.title=[...sources.values()].join('\n');
};
const show=table.showCardMenu.bind(table);
table.showCardMenu=()=>{discardSelection.clear();publicRoot.querySelectorAll('.demo-selected').forEach(node=>node.classList.remove('demo-selected'));show();table.cardMenu.querySelectorAll('button').forEach(button=>button.hidden=false);updateBar();};
table.hideCardMenu=updateBar;
publicRoot.addEventListener('click',event=>{
  const face=event.target.closest('.v3-card');if(!face)return;
  const take=face.parentElement.querySelector('[data-take]');if(!take)return;
  [...controller.selectedCards].forEach(card=>card.unselectCard());resetSources();
  const id=take.dataset.take;
  if(discardSelection.has(id))discardSelection.delete(id);else discardSelection.add(id);
  publicRoot.querySelectorAll('.v3-card').forEach(node=>node.classList.toggle('demo-selected',discardSelection.has(node.parentElement.querySelector('[data-take]')?.dataset.take)));
  table.cardMenu.classList.toggle('hide',!discardSelection.size);
  publicRoot.classList.toggle('design-source-active',!!discardSelection.size);
  table.cardMenu.querySelector('.selection-label').textContent=discardSelection.size?`弃牌区 · 已选 ${discardSelection.size} 张`:idleText;
  table.cardMenu.querySelectorAll('button').forEach((button,index)=>{button.hidden=index!==0&&index!==5;button.disabled=false;});
});
table.cardMenu.addEventListener('click',async event=>{
  if(!discardSelection.size)return;
  const button=event.target.closest('button');if(!button)return;
  event.stopImmediatePropagation();
  if(button.textContent==='收入手牌'){
    for(const id of [...discardSelection]){
      publicRoot.querySelector(`[data-take="${id}"]`)?.click();
      await new Promise(resolve=>setTimeout(resolve,0));
    }
  }
  discardSelection.clear();publicRoot.querySelectorAll('.demo-selected').forEach(node=>node.classList.remove('demo-selected'));updateBar();
},true);
updateBar();

// Floating desktop actions occupy the existing gap, without an idle placeholder.
styles.textContent+=`
.card-menu{position:absolute;top:553px;left:530px;right:auto;bottom:auto;transform:translateX(-50%);width:max-content;max-width:1010px;height:52px;min-height:52px;display:flex!important;gap:6px;padding:7px 10px 7px 18px;border:1px solid #c7ab6666;border-radius:16px;background:linear-gradient(115deg,#194638f5,#092c25fa);box-shadow:0 10px 28px #0006,inset 0 1px #fff1;backdrop-filter:blur(14px);z-index:25;overflow:visible}
.card-menu.hide{display:none!important}.card-menu .selection-label{margin-right:10px;padding-right:16px;border-right:1px solid #dec38133;color:#e6d5a8;font-size:12px;white-space:nowrap}.card-menu .selection-label::before{content:'✓';display:inline-grid;place-items:center;width:22px;height:22px;margin-right:9px;border-radius:50%;color:#eed799;background:#d9bf6720}
.card-menu button{min-width:62px;height:34px;padding:0 12px;border:1px solid #ffffff12;border-radius:9px;background:#ffffff08;color:#e1e8df;font-size:12px;white-space:nowrap}.card-menu button:hover:not(:disabled){background:#ffffff18;border-color:#cfb36b88}.card-menu button:first-of-type{color:#243629;background:#dfc582;border-color:#dfc582}.card-menu button:last-child{min-width:38px;padding:0 9px;color:#9fb6aa;border-color:transparent;background:transparent}.card-menu button[hidden]{display:none!important}
:host(.player-seated) .slot0{top:615px}.table-container{height:870px;min-height:870px}
.preview-area-dialog{width:min(600px,90vw);padding:22px;border:1px solid #b99e61;border-radius:16px;background:#0c3027;color:#f4ead2;box-shadow:0 24px 70px #0008}.preview-area-dialog::backdrop{background:#001b16aa}.preview-area-dialog header{display:flex;align-items:center;justify-content:space-between;gap:20px}.preview-area-dialog h3{margin:0;color:#ebd39a}.preview-area-dialog p{color:#9fb6aa;font-size:12px}.preview-area-dialog footer{display:flex;gap:8px;margin-top:18px}.preview-area-dialog button{min-height:36px;padding:6px 13px;border:1px solid #d4bc6955;border-radius:8px;background:#ffffff08;color:#e8dfc5;cursor:pointer}.preview-area-dialog sg-area{display:block;height:100px;margin-top:20px}.preview-area-dialog sg-area::part(card-area){display:flex;align-items:center;gap:10px;padding:12px;overflow:auto}.preview-area-dialog sg-area::part(wrapper){height:100%;border:1px solid #ffffff16;border-radius:8px}
`;
if(document.body.dataset.compact==='true')styles.textContent+=`.card-menu{top:325px;left:550px;width:max-content;max-width:1050px}:host(.player-seated) .slot0{top:400px}.table-container{height:710px;min-height:710px}`;

styles.textContent+=`
.preview-area-dialog footer{padding:10px;margin-top:16px;border:1px solid #c7ab6633;border-radius:13px;background:linear-gradient(115deg,#194638cc,#092c25ee);gap:6px}
.preview-area-dialog footer button{min-width:62px;min-height:34px;height:34px;padding:0 12px;border:1px solid #ffffff12;border-radius:9px;background:#ffffff08;color:#e1e8df;font:12px 'Microsoft YaHei',sans-serif}
.preview-area-dialog footer button:first-child{color:#243629;background:#dfc582;border-color:#dfc582}
.preview-area-dialog footer button:last-child{margin-left:auto;color:#9fb6aa;border-color:transparent;background:transparent}
.preview-area-dialog footer button:hover:not(:disabled){background:#ffffff18;border-color:#cfb36b88}
.preview-area-dialog footer button:first-child:hover:not(:disabled){background:#ecd594;border-color:#ecd594}
.preview-area-dialog footer button:focus-visible{outline:2px solid #e2b84b;outline-offset:2px}
`;
const remoteToolbarStyles=document.createElement('style');
remoteToolbarStyles.textContent=`
.pai-info:popover-open .area-panel-actions{padding:10px;border:1px solid #c7ab6633;border-radius:13px;background:linear-gradient(115deg,#194638cc,#092c25ee);gap:6px}
.pai-info:popover-open .area-panel-actions button{min-width:62px;min-height:34px;height:34px;padding:0 12px;border:1px solid #ffffff12;border-radius:9px;background:#ffffff08;color:#e1e8df;font:12px 'Microsoft YaHei',sans-serif}
.pai-info:popover-open .area-panel-actions button:first-child{color:#243629;background:#dfc582;border-color:#dfc582}
.pai-info:popover-open .area-panel-actions button:last-child{margin-left:auto;color:#9fb6aa;border-color:transparent;background:transparent}
.pai-info:popover-open .area-panel-actions button:hover:not(:disabled){background:#ffffff18;border-color:#cfb36b88}
.pai-info:popover-open .area-panel-actions button:first-child:hover:not(:disabled){background:#ecd594;border-color:#ecd594}
.pai-info:popover-open .area-panel-actions button:focus-visible{outline:2px solid #e2b84b;outline-offset:2px}
`;
table.playerDoms.forEach(player=>player.shadowRoot.append(remoteToolbarStyles.cloneNode(true)));

styles.textContent+=`
.preview-area-dialog{position:fixed;padding-bottom:82px}
.preview-area-dialog footer{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);width:max-content;max-width:calc(100% - 32px);box-sizing:border-box;flex-wrap:wrap;justify-content:center;margin:0;box-shadow:0 8px 24px #0006;backdrop-filter:blur(14px)}
.preview-area-dialog footer[hidden]{display:none}
`;
table.playerDoms.forEach(player=>{
  const style=document.createElement('style');
  style.textContent=`
  .pai-info:popover-open{padding-bottom:82px}
  .pai-info:popover-open .area-panel-actions{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);width:max-content;max-width:calc(100% - 32px);box-sizing:border-box;justify-content:center;margin:0;box-shadow:0 8px 24px #0006;backdrop-filter:blur(14px)}
  .pai-info:popover-open .area-panel-actions[hidden]{display:none}
  `;
  player.shadowRoot.append(style);
});
const refreshPopupActions=()=>{
  table.playerDoms.forEach(player=>{
    const footer=player.shadowRoot.querySelector('.area-panel-actions');
    if(footer)footer.hidden=!Object.values(player.inspectedArea?.cards||{}).some(card=>controller.selectedCards.includes(card));
  });
  table.shadowRoot.querySelectorAll('.preview-area-dialog').forEach(dialog=>{
    const area=dialog.querySelector('sg-area');
    dialog.querySelector('footer').hidden=!controller.selectedCards.some(card=>card.getRootNode().host===area);
  });
};
const previousShowMenu=table.showCardMenu.bind(table),previousHideMenu=table.hideCardMenu.bind(table);
table.showCardMenu=()=>{previousShowMenu();refreshPopupActions();};
table.hideCardMenu=()=>{previousHideMenu();refreshPopupActions();};
refreshPopupActions();

function inspectPublicPlayerArea(player,area){
  [...controller.selectedCards].forEach(card=>card.unselectCard());
  discardSelection.clear();publicRoot.querySelectorAll('.demo-selected').forEach(node=>node.classList.remove('demo-selected'));updateBar();
  const dialog=document.createElement('dialog');dialog.className='preview-area-dialog';
  const title=area===player.zhuangArea?'装备区':'判定区';
  dialog.innerHTML=`<header><h3>玩家 ${player.dataset.key.slice(1)} · ${title}</h3><button data-close>关闭 ×</button></header><p>选择卡牌后，在此面板内操作。</p><footer></footer>`;
  const view=document.createElement('sg-area');
  dialog.insertBefore(view,dialog.querySelector('footer'));
  table.shadowRoot.append(dialog);
  view.init(area.deckRef,controller);
  const selection=()=>controller.selectedCards.filter(card=>card.getRootNode().host===view);
  for(const [label,action] of [['收入手牌',()=>controller.drawSelectedCards(selection())],['弃置',()=>sendSelected('discard')],['亮牌／暗置',()=>controller.showSelectedCards(selection())],['取消选择',()=>selection().forEach(card=>card.unselectCard())]]){
    const button=document.createElement('button');button.textContent=label;
    button.onclick=()=>Promise.resolve(action()).catch(error=>window.alert(error.message));dialog.querySelector('footer').append(button);
  }
  dialog.querySelector('[data-close]').onclick=()=>dialog.close();
  dialog.addEventListener('close',()=>{selection().forEach(card=>card.unselectCard());dialog.remove();});
  refreshPopupActions();
  dialog.showModal();
}
// Capture before the existing table drag handler. Remote equipment and judgment
// cards are inspected as a region, just like remote hand and private areas.
table.addEventListener('pointerdown',event=>{
  const player=event.composedPath().find(node=>node.localName==='sg-player');
  const area=event.composedPath().find(node=>node===player?.zhuangArea||node===player?.panArea);
  if(player?.dataset.key!=='p1'&&area)event.stopImmediatePropagation();
},true);
table.addEventListener('click',event=>{
  const player=event.composedPath().find(node=>node.localName==='sg-player');
  const area=event.composedPath().find(node=>node===player?.zhuangArea||node===player?.panArea);
  if(player?.dataset.key!=='p1'&&area){event.stopImmediatePropagation();inspectPublicPlayerArea(player,area);}
},true);

})();

/******/ })()
;