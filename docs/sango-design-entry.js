import {seed, read, ref, update} from './sango-design-memory.cjs';
import {gameController} from '../src/gameController.js';
import {SgTable} from '../src/wc/sgTable.js';
import cards from '../src/data/pai.json';
import publicCss from './sango-public-v3.css';
import publicPolishCss from './sango-public-polish.css';
import {mountPublicDesign} from './sango-public-v3.js';

document.querySelector('.design-heading p').textContent='打出／弃置计入本批结算，亮牌留在原区 · 本地演示，刷新重置';
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
const table=new SgTable({},controller);document.getElementById('design-game').append(table);
const styles=document.createElement('style');styles.textContent=publicCss+`
.table-public{display:none}.public-tools{display:none}
.design-public{position:absolute;left:20px;top:287px;width:1020px;z-index:4}
.design-public .v3-shell{min-height:220px;padding:12px 16px}.design-public .v3-card{height:87px}
.design-public .v3-topline{margin-bottom:7px}.design-public .v3-face-actions{flex-direction:row}
.v3-sim{display:flex;align-items:center;gap:8px}.v3-sim button{font-size:12px;padding:3px 8px}.v3-card.taken{opacity:.4}
.v3-sort.three-lanes{grid-template-columns:repeat(3,minmax(0,1fr))}
.card-menu{position:fixed;top:auto;bottom:14px;left:50%;right:auto;transform:translateX(-50%);height:auto;min-height:40px;width:max-content;max-width:95vw;z-index:10020;border-radius:8px;padding:6px 10px;gap:8px}
.card-menu button{font-size:13px;padding:5px 12px}.selection-label{font-size:13px}
@media(max-width:900px){.design-public{position:relative;inset:auto;grid-area:2/1;width:100%}.design-public .v3-shell{grid-template-columns:170px minmax(0,1fr) 130px;gap:10px}}
`;
styles.textContent+=publicPolishCss;
table.shadowRoot.append(styles);
if(document.body.dataset.compact==='true'){
  styles.textContent+=`.table-container{width:1100px;height:650px;min-height:650px;margin:0 auto;transform:none}.opponent-rail,.table-topbar,.action-log{display:none}.design-public{left:20px;top:40px;width:1060px}:host(.player-seated) .slot0{left:20px;top:375px;width:924px;height:230px}`;
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
  const selected=[...controller.selectedCards].filter(card=>/\/p1\/(hand|other1|other2)\/cards\//.test(card.dataset.path));
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
const actions=[['收入手牌',()=>controller.drawSelectedCards()],['弃置',()=>sendSelected('discard')],['打出',()=>sendSelected('play')],['亮牌',()=>sendSelected('reveal')],['取消选择',()=>[...controller.selectedCards].forEach(card=>card.unselectCard())]];
buttons.forEach((old,i)=>{const button=old.cloneNode(false);button.textContent=actions[i][0];button.onclick=()=>Promise.resolve(actions[i][1]()).catch(error=>window.alert(error.message));old.replaceWith(button)});
const originalShow=table.showCardMenu.bind(table);table.showCardMenu=()=>{
  originalShow();
  table.cardMenu.querySelector('button').disabled=controller.selectedCards.every(card=>card.dataset.path.includes('/p1/hand/'));
};
// Public design uses explicit actions for card transfers; the live area sorting still works.
controller.discardSelectedCards=()=>sendSelected('discard');
