import {onValue, ref} from 'firebase/database';
import {orderedEntries} from '../cardOrder.mjs';
import {ACTION_HINT_OPCODE, decodeActionHint} from '../localActionLog.mjs';
import './sgCard.js';
import {captureCardPositions, animateCardInsertions} from './cardInsertionAnimation.js';

const RECENT_LIMIT=6;

export function installPublicTablePanel(table,host,cardMenu){
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
    ...orderedEntries(deckTop).map(item=>({...item,path:pathFor('pai',item.key)})),
    ...orderedEntries(deckBottom).map(item=>({...item,path:pathFor('paiBottom',item.key)})),
  ];
  function cardFor(path,value,className,show=true){
    const card=document.createElement('sg-card');card.className=className;
    card.init(ref(db,path),{...value,show:show?'1':'0'},controller,{subscribe:false});card.renderCard();
    return card;
  }
  function hintSource(hint){
    if(!hint)return '';
    if(hint.opcode===ACTION_HINT_OPCODE.PLAY)return '打出';
    if(hint.opcode===ACTION_HINT_OPCODE.DISCARD||hint.opcode===ACTION_HINT_OPCODE.DISCARD_OTHER)return '弃置';
    if(hint.opcode===ACTION_HINT_OPCODE.REVEAL_JUDGMENT)return '展示／判定';
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
    const previous=captureCardPositions(recentList.querySelectorAll('.recent-discard-card'),keyFor);
    const existing=new Map([...recentList.querySelectorAll('.recent-discard-card')].map(node=>[keyFor(node),node]));
    const entries=orderedEntries(discard).reverse();
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
    if(animate)animateCardInsertions(recentList.querySelectorAll('.recent-discard-card'),previous,keyFor);
    if(discardDialog.open)renderDiscardDialog(entries);
  }
  function renderDiscardDialog(entries=orderedEntries(discard).reverse()){
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
    onValue(ref(db,`${prefix}/tableDecks/pai/cards`),snapshot=>{deckTop=snapshot.val()||{};renderDeck();}),
    onValue(ref(db,`${prefix}/tableDecks/paiBottom/cards`),snapshot=>{deckBottom=snapshot.val()||{};renderDeck();}),
    onValue(ref(db,`${prefix}/runtime/a`),snapshot=>{const hint=decodeActionHint(snapshot.val());if(!hintInitialized){hintInitialized=true;lastHint=hint;lastHintNonce=hint?.nonce||null;}else lastHint=hint;classifyPending();}),
    onValue(ref(db,`${prefix}/tableDecks/discard/cards`),snapshot=>{
      const next=snapshot.val()||{},keys=new Set(Object.keys(next));
      const added=previousDiscardKeys!==null&&[...keys].some(key=>!previousDiscardKeys.has(key));
      if(previousDiscardKeys!==null)keys.forEach(key=>{if(!previousDiscardKeys.has(key))pendingDiscardKeys.add(key);});
      previousDiscardKeys=keys;discard=next;[...sourceByKey.keys()].forEach(key=>{if(!keys.has(key))sourceByKey.delete(key);});renderDiscard(added);classifyPending();
    }),
  ];
  renderDeck();renderDiscard();
  return()=>{subscriptions.forEach(unsubscribe=>unsubscribe());document.removeEventListener('click',closeDraw);table.removeEventListener('player-seat-changed',refreshPlayer);discardDialog.remove();sortDialog.remove();};
}
