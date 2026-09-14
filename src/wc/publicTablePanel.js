import {onValue, ref} from 'firebase/database';
import {orderedEntries, recentEntries} from '../cardOrder.mjs';
import {ACTION_HINT_OPCODE, decodeActionHint} from '../localActionLog.mjs';
import paiKu from '../data/pai.json' assert {type:'json'};
import './sgCard.js';
import {captureCardPositions, animateCardLayoutChanges} from './cardInsertionAnimation.js';

const RECENT_LIMIT=8;

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
      <header><strong>结算区</strong><small>本回合新增 · 最新 → 较早</small></header>
      <div class="public-discard-body"><div class="recent-discard-list"></div><aside class="discard-summary"><div class="discard-summary-main"><div class="discard-icon" aria-hidden="true">弃</div><div><b class="discard-count">0</b><small>张弃牌</small></div></div><button class="text-action" data-public-action="all-discard">查看全部 ↗</button></aside></div>
    </section>`;
  host.append(cardMenu);
  const discardDialog=document.createElement('dialog');discardDialog.className='public-dialog discard-dialog';
  discardDialog.innerHTML='<header><h2>弃牌堆</h2><button data-dialog-close>关闭 ×</button></header><p>最新进入的牌排在前面。</p><div class="discard-grid"></div>';
  const sortDialog=document.createElement('dialog');sortDialog.className='public-dialog deck-sort-dialog';
  host.append(discardDialog,sortDialog);
  const recentList=host.querySelector('.recent-discard-list'),drawSplit=host.querySelector('.public-draw-split');
  const drawToggle=host.querySelector('.draw-toggle'),drawOptions=host.querySelector('.draw-options');
  let deckTop={},discard={},draft=null,busy=false,lastHint=null,lastHintNonce=null,hintInitialized=false,previousDiscardKeys=null,settlementCollection=Promise.resolve();
  const settlementKeys=new Set(),mobileQuery=window.matchMedia('(max-width:620px)');
  const sourceByKey=new Map(),pendingDiscardKeys=new Set();

  const pathFor=(area,key)=>`${prefix}/tableDecks/${area}/cards/${key}`;
  const deckEntries=()=>orderedEntries(deckTop).map(item=>({...item,path:pathFor('pai',item.key)}));
  function cardFor(path,value,className,show=true){
    const card=document.createElement('sg-card');card.className=className;
    card.init(ref(db,path),{...value,show:show?'1':'0'},controller,{subscribe:false});card.renderCard();
    return card;
  }
  function hintSource(hint,cardValue){
    if(!hint)return '';
    if(hint.opcode===ACTION_HINT_OPCODE.PLAY)return '';
    if(hint.opcode===ACTION_HINT_OPCODE.DISCARD||hint.opcode===ACTION_HINT_OPCODE.DISCARD_OTHER)return '弃置';
    if(hint.opcode===ACTION_HINT_OPCODE.USE_CARD){
      const [useCardName,,format,...payload]=hint.args;
      if(!['i','c'].includes(format)||!cardValue?.id)return '';
      const usedIds=new Set();
      for(let index=1;index<payload.length;index+=2)usedIds.add(payload[index]);
      return format==='c'&&usedIds.has(cardValue.id)?`→ ${useCardName}`:'';
    }
    if(hint.opcode===ACTION_HINT_OPCODE.REVEAL_JUDGMENT)return '展示／判定';
    return '';
  }
  function classifyPending(){
    if(!pendingDiscardKeys.size||!lastHint||lastHint.nonce===lastHintNonce)return;
    pendingDiscardKeys.forEach(key=>{
      const source=hintSource(lastHint,discard[key]);
      if(source)sourceByKey.set(key,source);else sourceByKey.delete(key);
    });
    pendingDiscardKeys.clear();lastHintNonce=lastHint.nonce;renderDiscard();
  }
  function renderDiscard(animate=false,newFrom='left'){
    const keyFor=node=>node.dataset.cardKey;
    const previous=captureCardPositions(recentList.querySelectorAll('.recent-discard-card'),keyFor);
    const existing=new Map([...recentList.querySelectorAll('.recent-discard-card')].map(node=>[keyFor(node),node]));
    const entries=recentEntries(discard);
    const displayedEntries=mobileQuery.matches
      ? entries
      : entries.filter(item=>settlementKeys.has(item.key));
    const header=host.querySelector('.public-discard-panel>header');
    header.querySelector('strong').textContent=mobileQuery.matches?'弃牌区':'结算区';
    header.querySelector('small').textContent=mobileQuery.matches
      ? `最近 ${RECENT_LIMIT} 张 · 最新 → 较早`
      : '本回合新增 · 最新 → 较早';
    recentList.querySelector('.public-empty')?.remove();
    const visible=new Set(displayedEntries.slice(0,RECENT_LIMIT).map(item=>item.key));
    existing.forEach((node,key)=>{if(!visible.has(key))node.remove();});
    displayedEntries.slice(0,RECENT_LIMIT).forEach(({key,value},index)=>{
      if(existing.has(key)){
        const item=existing.get(key);item.querySelector('button').disabled=busy||!controller.currentPlayer;
        const action=sourceByKey.get(key);
        let badge=item.querySelector('.discard-action-indicator');
        if(action){if(!badge){badge=document.createElement('small');badge.className='discard-action-indicator';item.append(badge);}badge.textContent=action;}else badge?.remove();
        item.style.order=index;return;
      }
      const item=document.createElement('div');item.className='recent-discard-card';
      item.dataset.cardKey=key;
      item.style.order=index;
      item.append(cardFor(pathFor('discard',key),value,'discard-area-card recent-public-card'));
      const take=document.createElement('button');take.className='text-action';take.textContent='收入手牌';take.dataset.takeDiscard=pathFor('discard',key);take.disabled=busy||!controller.currentPlayer;
      const action=sourceByKey.get(key);
      if(action){const source=document.createElement('small');source.className='discard-action-indicator';source.textContent=action;item.append(source);}
      item.append(take);recentList.append(item);
    });
    if(!displayedEntries.length){const empty=document.createElement('div');empty.className='public-empty';empty.innerHTML=mobileQuery.matches
      ? '<b>暂无弃牌</b><small>打出、弃置或展示／判定的牌会显示在这里</small>'
      : '<b>结算区为空</b><small>本回合新增的结算牌会显示在这里</small>';recentList.append(empty);}
    host.querySelector('.discard-count').textContent=entries.length;
    if(animate)animateCardLayoutChanges(recentList.querySelectorAll('.recent-discard-card'),previous,keyFor,{newFrom});
    if(discardDialog.open)renderDiscardDialog(entries);
  }
  function renderDiscardDialog(entries=recentEntries(discard)){
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
  async function collectSettlement(){
    const keysToClear=[...settlementKeys];
    if(!keysToClear.length)return;
    if(mobileQuery.matches||window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      keysToClear.forEach(key=>settlementKeys.delete(key));renderDiscard();return;
    }
    const target=host.querySelector('.discard-icon')?.getBoundingClientRect();
    if(!target?.width||!target?.height){keysToClear.forEach(key=>settlementKeys.delete(key));renderDiscard();return;}
    const flights=[];
    recentList.querySelectorAll('.recent-discard-card').forEach((item,index)=>{
      const key=item.dataset.cardKey,value=discard[key];
      if(!keysToClear.includes(key)||!value)return;
      const source=item.querySelector('sg-card')?.getBoundingClientRect();
      if(!source?.width||!source?.height)return;
      const card=cardFor(pathFor('discard',key),value,'discard-area-card recent-public-card settlement-collect-card');
      card.style.left=`${source.left}px`;card.style.top=`${source.top}px`;card.style.width=`${source.width}px`;card.style.height=`${source.height}px`;
      table.shadowRoot.append(card);item.style.visibility='hidden';
      const dx=target.left+target.width/2-(source.left+source.width/2),dy=target.top+target.height/2-(source.top+source.height/2);
      const animation=card.animate([
        {transform:'translate(0,0) scale(1)',opacity:1},
        {transform:`translate(${dx*.16}px,${dy*.08-10}px) scale(1.03)`,opacity:1,offset:.22},
        {transform:`translate(${dx}px,${dy}px) scale(.42)`,opacity:.15},
      ],{duration:560,delay:index*32,easing:'cubic-bezier(.35,.05,.5,1)',fill:'forwards'});
      flights.push(animation.finished.catch(()=>{}).then(()=>card.remove()));
    });
    await Promise.all(flights);
    recentList.querySelectorAll('.recent-discard-card').forEach(item=>item.style.visibility='');
    keysToClear.forEach(key=>settlementKeys.delete(key));renderDiscard();
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
  table.publicPanelApi={
    draw:count=>run(()=>controller.drawTopCards(count)),
    reveal:()=>run(()=>controller.revealTopCard()),
    shuffle:()=>run(()=>controller.resetPai()),
    openDeck:openSort,
    openDiscard:()=>{renderDiscardDialog();discardDialog.showModal();},
    endTurn:()=>controller.endTurn(),
  };
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
    const lanes=document.createElement('div');lanes.className='deck-sort-lanes';lanes.append(sortLane('top','牌顶 · 当前顺序'),sortLane('bottom','牌底'),sortLane('draw','摸牌'));
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
    if(action==='draw'){setDrawOpen(false);return run(()=>controller.drawTopCards(Number(button.dataset.count)));}
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
    if(action==='view'){
      draft.viewed.add(item.path);
      controller.recordViewedCardPaths([item.path]).catch(error=>window.alert(error.message||'观看记录失败，请重试'));
    }
    else if(action==='up')[draft.top[index-1],draft.top[index]]=[draft.top[index],draft.top[index-1]];
    else if(action==='down')[draft.top[index+1],draft.top[index]]=[draft.top[index],draft.top[index+1]];
    else if(action==='bottom')draft.bottom.push(...draft.top.splice(index,1));
    else if(action==='draw')draft.draw.push(...draft.top.splice(index,1));
    renderSort();
  });
  sortDialog.addEventListener('cancel',()=>{draft=null;});
  const closeDraw=event=>{if(!event.composedPath().includes(drawSplit))setDrawOpen(false);};document.addEventListener('click',closeDraw);
  const handleLayoutChange=()=>renderDiscard();mobileQuery.addEventListener('change',handleLayoutChange);
  const handleTurnEnd=()=>{settlementCollection=settlementCollection.then(()=>collectSettlement());};table.addEventListener('turn-ended',handleTurnEnd);
  const refreshPlayer=()=>{renderDeck();renderDiscard();};table.addEventListener('player-seat-changed',refreshPlayer);
  const subscriptions=[
    onValue(ref(db,`${prefix}/tableDecks/pai/cards`),snapshot=>{deckTop=snapshot.val()||{};renderDeck();}),
    onValue(ref(db,`${prefix}/runtime/a`),snapshot=>{const hint=decodeActionHint(snapshot.val());if(!hintInitialized){hintInitialized=true;lastHint=hint;lastHintNonce=hint?.nonce||null;}else lastHint=hint;classifyPending();}),
    onValue(ref(db,`${prefix}/tableDecks/discard/cards`),snapshot=>{
      const next=snapshot.val()||{},keys=new Set(Object.keys(next)),priorKeys=previousDiscardKeys;
      const changed=previousDiscardKeys!==null&&(keys.size!==previousDiscardKeys.size||[...keys].some(key=>!previousDiscardKeys.has(key)));
      if(previousDiscardKeys!==null)keys.forEach(key=>{if(!previousDiscardKeys.has(key)){pendingDiscardKeys.add(key);settlementKeys.add(key);}});
      [...settlementKeys].forEach(key=>{if(!keys.has(key))settlementKeys.delete(key);});
      previousDiscardKeys=keys;discard=next;[...sourceByKey.keys()].forEach(key=>{if(!keys.has(key))sourceByKey.delete(key);});
      renderDiscard(changed,node=>priorKeys?.has(node.dataset.cardKey)?'right':'left');classifyPending();
    }),
  ];
  renderDeck();renderDiscard();
  return()=>{subscriptions.forEach(unsubscribe=>unsubscribe());document.removeEventListener('click',closeDraw);mobileQuery.removeEventListener('change',handleLayoutChange);table.removeEventListener('turn-ended',handleTurnEnd);table.removeEventListener('player-seat-changed',refreshPlayer);discardDialog.remove();sortDialog.remove();table.publicPanelApi=null;};
}
