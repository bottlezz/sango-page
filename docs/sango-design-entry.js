import {seed, read, ref, update} from './sango-design-memory.cjs';
import {gameController} from '../src/gameController.js';
import {SgTable} from '../src/wc/sgTable.js';
import cards from '../src/data/pai.json';
import publicCss from './sango-public-v3.css';
import publicPolishCss from './sango-public-polish.css';
import {mountPublicDesign} from './sango-public-v3.js';

document.querySelector('.design-heading p').textContent='选择任意区域的牌，中央选牌栏显示来源与操作 · 本地演示，刷新重置';
// Dialogs live outside component shadow roots and need the same public-area styles.
const dialogStyles=document.createElement('style');
dialogStyles.textContent=publicCss+`
.v3-dialog .v3-sort section{max-height:42vh;overflow:auto}
.v3-dialog .v3-sort h3{position:sticky;top:-12px;background:#0b3027;padding:8px 0;z-index:1}
.v3-dialog .v3-sort .v3-row{flex-wrap:nowrap}
.v3-dialog .v3-sort .v3-row span{min-width:0;overflow-wrap:anywhere}
.v3-dialog .v3-sort .v3-row button{flex-shrink:0}
.v3-dialog .v3-sort.three-lanes{grid-template-columns:repeat(3,minmax(250px,1fr));overflow-x:auto}
.v3-dialog .v3-record button{font-size:12px;padding:4px}
`;
dialogStyles.textContent+=publicPolishCss;
document.head.append(dialogStyles);

// Reuse production components against an isolated, in-memory room.
const make=(n,offset=0)=>Object.fromEntries(Array.from({length:n},(_,i)=>['c'+i,{id:'p'+((i+offset)%80+1),show:'0',order:i}]));
const room={tableDecks:{pai:{cards:{}},discard:{cards:{}}}};
for(let i=1;i<=6;i++)room['p'+i]={name:i===1?'你 · 本地预览':'玩家 '+i,hp:'12/15',role:'忠',debuff:'00',hand:{cards:make(i===1?24:5)},other1:{cards:make(i===1?12:0,20)},other2:{cards:make(i===1?8:0,40)},pan:{cards:{}},zhuang:{cards:make(2,1)},jiang:{cards:{}},jiang1:{cards:{general:{id:'j'+i,show:'1',order:0}}},jiang2:{cards:{general:{id:'j'+(i+100),show:'0',order:0}}}};
seed({game:{6:room}});
const controller=new gameController({},'6');controller.playerCount=6;controller.currentPlayer='p1';controller.userName='你 · 本地预览';
controller.writePatch=patch=>update(ref({}),patch);
const table=new SgTable({},controller);document.getElementById('design-game').append(table);
const styles=document.createElement('style');styles.textContent=publicCss+`
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
styles.textContent+=publicPolishCss;
table.shadowRoot.append(styles);
if(document.body.dataset.compact==='true'){
  styles.textContent+=`.table-container{width:1100px;height:710px;min-height:710px;margin:0 auto;transform:none}.opponent-rail,.table-topbar,.action-log{display:none}.design-public{left:20px;top:40px;width:1060px}.card-menu,.card-menu.hide{top:325px;width:1060px}:host(.player-seated) .slot0{left:20px;top:400px;width:924px;height:230px}`;
}
const publicRoot=document.createElement('section');publicRoot.className='design-public';
table.shadowRoot.querySelector('.table-container').append(publicRoot,table.cardMenu);
const symbols={spade:'♠',heart:'♥',club:'♣',diamond:'♦'};let serial=1000;
const publicDesign=mountPublicDesign(publicRoot,{
  async simulateOther(action){
    if(sending)return;
    const entry=Object.entries(read('game/6/p2/hand/cards')||{}).sort((a,b)=>a[1].order-b[1].order)[0];
    if(!entry)throw Error('玩家2的演示手牌已用完，可刷新页面重置。');
    const [key,value]=entry,data=cards[value.id];
    await controller.writePatch({['game/6/p2/hand/cards/'+key]:null},`玩家2${action==='play'?'打出':'弃置'}`);
    publicDesign.accept([{id:++serial,dbId:value.id,suit:symbols[data.suit],rank:data.rank,name:data.name}],action,{id:'p2',name:'玩家2'});
  },
  receive(incoming){
    const existing=read('game/6/p1/hand/cards')||{};
    let order=Math.max(-1,...Object.values(existing).map(c=>c.order||0));
    const patch={};
    for(const card of incoming){
      const id=card.dbId||Object.keys(cards).find(id=>cards[id].name===card.name&&symbols[cards[id].suit]===card.suit&&String(cards[id].rank)===String(card.rank))||Object.keys(cards).find(id=>cards[id].name===card.name);
      if(!id)throw Error('找不到演示卡牌：'+card.name);
      patch['game/6/p1/hand/cards/received'+(++serial)]={id,show:'0',order:++order};
    }
    // The memory adapter applies this patch synchronously before notifying components.
    return update(ref({}),patch);
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
  const publicCards=selected.map(card=>{const data=cards[card.cardData.id];return {id:++serial,dbId:card.cardData.id,suit:symbols[data.suit],rank:data.rank,name:data.name}});
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
