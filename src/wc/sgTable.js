//This file will be the web component
//It only needs to run, not be imported by main.js

import { ref } from "firebase/database";
import { gameController } from "../gameController.js";
import commonCss from "./css/common.css";
import tableCss from "./css/sgTable.css";
import mobileBoardCss from "./css/mobileBoard.css";
import { SgPlayer } from "./sgPlayer.js";
import "./sgJiangArea.js";
import { installCardDrag } from "../cardDrag.js";
import { installActionLog } from './actionLogPanel.js';
import { installPublicTablePanel } from './publicTablePanel.js';
import { installCardTransferAnimation } from './cardTransferAnimation.js';
import { installMobileBoardLayout } from './mobileBoardLayout.js';
import { USE_CARD_NAMES } from '../localActionLog.mjs';
import paiKu from '../data/pai.json' assert { type: 'json' };

const TARGETED_USE_CARDS = new Set(['杀','火杀','雷杀','桃','无懈可击','无中生有','决斗','过河拆桥','顺手牵羊','铁索连环','火攻','借刀杀人']);
const SELF_ONLY_TARGET_USE_CARDS = new Set(['无中生有']);
const DELAYED_USE_CARDS = new Set(['乐不思蜀','兵粮寸断','闪电']);
const USE_CARD_GROUPS = [
  {title:'基本牌',cards:['杀','火杀','闪','酒','桃']},
  {title:'指向锦囊',cards:['顺手牵羊','过河拆桥','决斗','铁索连环','火中生有','火攻','借刀杀人','无中生有','无懈可击']},
  {title:'群体锦囊',cards:['五谷丰登','桃园结义','南蛮入侵','万箭齐发']},
  {title:'延迟锦囊',cards:['乐不思蜀','兵粮寸断','闪电']},
];

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
    style.append(commonCss);
    style.append(tableCss);
    style.append(mobileBoardCss);
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
    this.disposeDrag = installCardDrag(this);
    this.disposeTransferAnimation = installCardTransferAnimation(this);
    this.disposeLog = installActionLog(this);
    this.disposeMobileLayout = installMobileBoardLayout(this);
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
    queueMicrotask(() => { if (!this.isConnected) {this.disposeMobileLayout?.();this.disposeDrag?.();this.disposeTransferAnimation?.();this.disposeLog?.();this.disposePublicPanel?.();} });
  }

  getCurrentPlayerDom() {
    const playerKey = this.gameController.currentPlayer;
    return this.playerDoms.find((player) => player.dataset.key === playerKey);
  }

  ensurePlayerTargetPicker() {
    if(this.playerTargetBar)return;
    const scrim=document.createElement('div');scrim.className='player-target-scrim';scrim.hidden=true;
    const bar=document.createElement('div');bar.className='player-target-bar';bar.hidden=true;
    bar.innerHTML='<div><strong></strong><span></span></div><button type="button" data-target-none hidden></button><button type="button" data-target-cancel>取消</button><button type="button" class="primary" data-target-commit disabled>确认</button>';
    bar.querySelector('[data-target-cancel]').addEventListener('click',()=>this.endPlayerTargetSelection());
    bar.querySelector('[data-target-none]').addEventListener('click',()=>{
      const state=this.playerTargetState;if(!state?.allowNoTarget)return;
      state.noTarget=!state.noTarget;state.selected.clear();this.syncPlayerTargetPicker();
    });
    bar.querySelector('[data-target-commit]').addEventListener('click',()=>this.commitPlayerTargetSelection());
    this.shadowRoot.addEventListener('click',event=>{
      const state=this.playerTargetState;if(!state)return;
      const path=event.composedPath();
      if(path.includes(bar))return;
      const player=path.find(node=>node?.tagName==='SG-PLAYER');
      event.preventDefault();event.stopImmediatePropagation();
      if(!player||!state.eligible.has(player.dataset.key))return;
      state.noTarget=false;
      if(state.single)state.selected=new Set([player.dataset.key]);
      else if(state.selected.has(player.dataset.key))state.selected.delete(player.dataset.key);
      else state.selected.add(player.dataset.key);
      this.syncPlayerTargetPicker();
    },true);
    this.shadowRoot.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&this.playerTargetState){event.preventDefault();this.endPlayerTargetSelection();}
    });
    this.playerTargetScrim=scrim;this.playerTargetBar=bar;this.shadowRoot.append(scrim,bar);
  }

  beginPlayerTargetSelection(state) {
    this.ensurePlayerTargetPicker();
    this.playerTargetState={...state,eligible:new Set(state.eligible.map(player=>player.dataset.key)),selected:new Set(state.selected||[]),noTarget:false};
    this.classList.add('player-target-mode');this.playerTargetScrim.hidden=false;this.playerTargetBar.hidden=false;
    this.syncPlayerTargetPicker();
  }

  syncPlayerTargetPicker() {
    const state=this.playerTargetState;if(!state)return;
    this.playerDoms.forEach(player=>{
      const eligible=state.eligible.has(player.dataset.key),selected=state.selected.has(player.dataset.key);
      player.classList.toggle('player-target-option',eligible);
      player.classList.toggle('player-target-selected',selected);
    });
    const none=this.playerTargetBar.querySelector('[data-target-none]');
    none.hidden=!state.allowNoTarget;none.textContent=state.noTarget?'✓ 无目标':state.noTargetLabel||'无目标';none.classList.toggle('is-selected',state.noTarget);
    this.playerTargetBar.querySelector('strong').textContent=state.title;
    const summary=state.noTarget?'已选择无目标':state.selected.size?`已选择 ${state.selected.size} 位玩家`:state.summary;
    this.playerTargetBar.querySelector('span').textContent=summary;
    const confirm=this.playerTargetBar.querySelector('[data-target-commit]');confirm.textContent=state.confirmLabel||'确认';
    confirm.disabled=!state.valid||(!state.noTarget&&!state.selected.size);
  }

  endPlayerTargetSelection({preserveUse=false}={}) {
    const state=this.playerTargetState;if(!state)return null;
    this.playerTargetState=null;this.classList.remove('player-target-mode');
    this.playerTargetScrim.hidden=true;this.playerTargetBar.hidden=true;
    this.playerDoms.forEach(player=>player.classList.remove('player-target-option','player-target-selected'));
    if(state.mode==='use'&&!preserveUse){this.pendingUseCards=null;this.pendingUseCardName=null;this.pendingUseTargets=new Set();this.pendingUseNoTarget=false;}
    return state;
  }

  commitPlayerTargetSelection() {
    const state=this.playerTargetState;if(!state||!state.valid||(!state.noTarget&&!state.selected.size))return;
    if(state.mode==='move'){
      const targetKey=[...state.selected][0],player=this.playerDoms.find(item=>item.dataset.key===targetKey);
      const pending=state.pending;this.endPlayerTargetSelection();
      if(!player||!pending)return;
      queueMicrotask(()=>player.openDropPicker(pending.paths[0],pending.paths,ok=>{
        if(ok)pending.cards.forEach(card=>{if(card.isConnected&&this.gameController.selectedCards.includes(card))card.unselectCard();});
      }));
      return;
    }
    const cardName=state.cardName;
    const target=state.noTarget?null:state.single?[...state.selected][0]:[...state.selected];
    this.endPlayerTargetSelection({preserveUse:true});
    this.commitUseCard(cardName,target);
  }

  openMovePlayerPicker() {
    const cards=[...this.gameController.selectedCards].filter(card=>card.isConnected);
    if(!cards.length)return;
    const paths=[...new Set(cards.map(card=>card.dataset.path).filter(Boolean))];
    if(!paths.length)return;
    const players=this.playerDoms.filter(player=>player.shadowRoot.querySelector('.player-name')?.textContent?.trim()!=='empty');
    this.beginPlayerTargetSelection({mode:'move',eligible:players,single:true,valid:true,title:'移动到哪位玩家？',summary:`已选择 ${paths.length} 张牌，请点击目标玩家。`,confirmLabel:'选择区域',pending:{cards,paths}});
  }

  ensureUseCardPicker() {
    if (this.useCardPicker) return;
    this.useCardPicker=document.createElement('dialog');
    this.useCardPicker.className='use-card-picker';
    this.useCardPicker.innerHTML='<header><h3>使用什么牌？</h3><button type="button" data-use-close aria-label="关闭">关闭 ×</button></header><p class="use-summary"></p><div class="use-card-options"></div>';
    this.useCardPicker.querySelector('[data-use-close]').addEventListener('click',()=>this.useCardPicker.close());
    this.useCardPicker.querySelector('.use-card-options').addEventListener('click',event=>{
      const cardButton=event.target.closest('[data-use-card]');
      if(cardButton){
        const cardName=cardButton.dataset.useCard;
        if(TARGETED_USE_CARDS.has(cardName)||DELAYED_USE_CARDS.has(cardName))this.renderUseTargets(cardName);
        else this.commitUseCard(cardName);
        return;
      }
    });
    this.useCardPicker.addEventListener('close',()=>{
      if(this.playerTargetState?.mode==='use')return;
      this.pendingUseCards=null;this.pendingUseCardName=null;this.pendingUseTargets=new Set();this.pendingUseNoTarget=false;
    });
    this.shadowRoot.append(this.useCardPicker);
  }

  openUseCardPicker() {
    const current=this.gameController.currentPlayer;
    const cards=[...this.gameController.selectedCards].filter(card=>card.isConnected);
    if(!current||!cards.length||!cards.every(card=>card.dataset.path?.includes(`/${current}/`)))return;
    this.ensureUseCardPicker();
    this.pendingUseCards=cards;
    this.renderUseCardChoices();
    this.useCardPicker.showModal();
  }

  openUseSelectedPhysicalCard() {
    const current=this.gameController.currentPlayer;
    const cards=[...this.gameController.selectedCards].filter(card=>card.isConnected);
    if(!current||!cards.length||!cards.every(card=>card.dataset.path?.includes(`/${current}/`)))return;
    const names=[...new Set(cards.map(card=>paiKu[card.cardData?.id]?.name).filter(Boolean))];
    if(names.length!==1){window.alert('直接使用时请只选择同名的牌；需要改变牌名请使用“转化”。');return;}
    const cardName=names[0];
    if(!USE_CARD_NAMES.includes(cardName)){window.alert(`${cardName}暂不支持直接使用，可通过“转化”选择牌名。`);return;}
    this.ensureUseCardPicker();
    this.pendingUseCards=cards;
    if(TARGETED_USE_CARDS.has(cardName)||DELAYED_USE_CARDS.has(cardName)){
      this.renderUseTargets(cardName);
    }else this.commitUseCard(cardName);
  }

  renderUseCardChoices() {
    const picker=this.useCardPicker,options=picker.querySelector('.use-card-options');
    picker.querySelector('h3').textContent='使用什么牌？';
    picker.querySelector('.use-summary').textContent=`以选中的 ${this.pendingUseCards?.length||0} 张牌使用为：`;
    options.replaceChildren(...USE_CARD_GROUPS.map(group=>{
      const section=document.createElement('section');section.className='use-card-group';
      const heading=document.createElement('h4');heading.textContent=group.title;section.append(heading);
      group.cards.filter(name=>USE_CARD_NAMES.includes(name)).forEach(name=>{
        const button=document.createElement('button');button.type='button';button.dataset.useCard=name;button.textContent=name;section.append(button);
      });
      return section;
    }));
  }

  renderUseTargets(cardName) {
    this.pendingUseCardName=cardName;
    const isDelayed=DELAYED_USE_CARDS.has(cardName);
    const current=this.gameController.currentPlayer;
    const validDelayedSelection=!isDelayed||this.pendingUseCards?.length===1;
    const players=this.playerDoms
      .filter(player=>(SELF_ONLY_TARGET_USE_CARDS.has(cardName)?player.dataset.key===current:(isDelayed||['桃','无懈可击'].includes(cardName)||player.dataset.key!==current))&&player.shadowRoot.querySelector('.player-name')?.textContent?.trim()!=='empty');
    const summary=!validDelayedSelection?'延迟锦囊每次只能选择一张牌。'
      :cardName==='闪电'?'已默认选择自己，可点击其他玩家改选。'
      :cardName.endsWith('杀')?'点击玩家卡选择目标，或选择无目标响应。'
      :'点击玩家卡选择目标。';
    this.beginPlayerTargetSelection({
      mode:'use',cardName,eligible:validDelayedSelection?players:[],selected:cardName==='闪电'&&current?[current]:[],
      single:isDelayed,valid:validDelayedSelection,allowNoTarget:cardName.endsWith('杀'),
      noTargetLabel:'无目标 · 响应决斗、南蛮、激将等',title:`${cardName} · 选择目标`,summary,confirmLabel:'确认使用',
    });
    if(this.useCardPicker.open)this.useCardPicker.close();
  }

  async commitUseCard(cardName,targetSeat=null) {
    const cards=this.pendingUseCards;
    if(!cards?.length||this.useCardBusy)return;
    this.useCardBusy=true;
    this.useCardPicker.querySelectorAll('button').forEach(button=>button.disabled=true);
    try{
      if(DELAYED_USE_CARDS.has(cardName))await this.gameController.placeDelayedTrick(cardName,targetSeat,cards);
      else await this.gameController.useSelectedCards(cardName,targetSeat,cards);
      if(this.useCardPicker.open)this.useCardPicker.close();
      cards.forEach(card=>{if(this.gameController.selectedCards.includes(card))card.unselectCard();});
    }catch(error){window.alert(error.message||'使用失败，请重试');}
    finally{this.useCardBusy=false;this.useCardPicker?.querySelectorAll('button').forEach(button=>button.disabled=false);}
  }

  getCardMenu() {
    const cardMenu = document.createElement("div");
    cardMenu.className = "card-menu hide";
    cardMenu.setAttribute("aria-label", "已选卡牌操作");
    const selectionLabel = document.createElement("span");
    selectionLabel.className = "selection-label";
    cardMenu.append(selectionLabel);

    const drawButton = document.createElement("button");
    drawButton.dataset.selectionAction = "take";
    drawButton.innerHTML = "收入手牌";
    drawButton.addEventListener("click", () => {
      this.gameController.drawSelectedCards().catch(error => window.alert(error.message || '移动失败，请重试')); 
    });
    const discardButton = document.createElement("button");
    discardButton.dataset.selectionAction = "discard";
    discardButton.innerHTML = "弃置";
    discardButton.addEventListener("click", () => {
      this.gameController.discardSelectedCards().catch(error => window.alert(error.message || '移动失败，请重试')); 
    });
    const showButton = document.createElement("button");
    showButton.dataset.selectionAction = "show";
    showButton.innerHTML = "亮牌";
    showButton.addEventListener("click", () => {
      this.gameController.showSelectedCards().catch(error => window.alert(error.message || '更新失败，请重试'));
    });
    const cancelButton = document.createElement("button");
    cancelButton.dataset.selectionAction = "cancel";
    cancelButton.textContent = "取消选择";
    cancelButton.addEventListener("click", () => {
      [...this.gameController.selectedCards].forEach(card => card.unselectCard());
    });
    const moveButton=document.createElement('button');
    moveButton.dataset.selectionAction='move';
    moveButton.textContent='移动';
    moveButton.addEventListener('click',()=>this.openMovePlayerPicker());
    const useButton=document.createElement('button');
    useButton.dataset.selectionAction='use';
    useButton.textContent='使用';
    useButton.addEventListener('click',()=>this.openUseSelectedPhysicalCard());
    const convertButton=document.createElement('button');
    convertButton.dataset.selectionAction='convert';
    convertButton.textContent='转化';
    convertButton.addEventListener('click',()=>this.openUseCardPicker());
    const equipButton=document.createElement('button');
    equipButton.dataset.selectionAction='equip';
    equipButton.textContent='装备';
    equipButton.addEventListener('click',()=>{
      const current=this.gameController.currentPlayer;
      const cards=[...this.gameController.selectedCards].filter(card=>card.isConnected);
      if(!current||cards.length!==1||paiKu[cards[0].cardData?.id]?.category!=='equipment')return;
      this.gameController.moveSelectedCards(cards,`game/${this.gameController.gameId}/${current}/zhuang/cards`)
        .catch(error=>window.alert(error.message||'装备失败，请重试'));
    });

    cardMenu.appendChild(useButton);
    cardMenu.appendChild(convertButton);
    cardMenu.appendChild(equipButton);
    cardMenu.appendChild(drawButton);
    cardMenu.appendChild(showButton);
    cardMenu.appendChild(moveButton);
    cardMenu.appendChild(discardButton);
    cardMenu.appendChild(cancelButton);
    // cardMenu.appendChild(peakButton);
    return cardMenu;
  }

  initGame() {
    const container = this.shadowRoot.querySelector(".table-container");
    const tableDeckWidget = document.createElement("div");
    tableDeckWidget.classList.add("table-public");
    this.tableDeckWidget = tableDeckWidget;


    const cardMenu = this.getCardMenu();
    this.cardMenu = cardMenu;


    container.appendChild(tableDeckWidget);
    const opponentRail = document.createElement("div");
    opponentRail.className = "opponent-rail";
    opponentRail.setAttribute("aria-label", "其他玩家，按座次排列");
    container.appendChild(opponentRail);
    this.opponentRail = opponentRail;
    for (let i = 0; i < this.playerCount; i++) {
      const sgPlayer = new SgPlayer();
      sgPlayer.dataset.key = `p${i + 1}`;
      opponentRail.appendChild(sgPlayer);
      this.playerDoms.push(sgPlayer);
    }
    // because bad design, current play assign function has side effects on other player widget.
    // so I have to use another loop to run init() after all sg-player is added to sg-table.
    for (let i = 0; i < this.playerCount; i++) {
      const sgPlayer = this.playerDoms[i];
      sgPlayer.init(
        ref(this.db, `game/${this.gameController.gameId}/p${i + 1}`),
        this.gameController
      );
    }

    this.disposePublicPanel=installPublicTablePanel(this,tableDeckWidget,this.cardMenu);
  }

  lockPlayerSelection() {
    this.dataset.owner = gameController.userName;
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
    this.syncSelectionMenus();
  }

  showCardMenu() {
    this.syncSelectionMenus();
  }

  syncSelectionMenus() {
    const selected = [...this.gameController.selectedCards].filter(card => card.isConnected);
    const currentPlayer = this.gameController.currentPlayer;
    const isOwnSelection = Boolean(currentPlayer) && selected.length > 0
      && selected.every(card => card.dataset.path?.includes(`/${currentPlayer}/`));
    const isDiscardSelection = selected.length > 0
      && selected.every(card => card.dataset.path?.includes('/tableDecks/discard/cards/'));
    const hasOnlyOwnHandSelection = Boolean(currentPlayer) && selected.length > 0 && selected.every(card =>
      card.dataset.path?.includes(`/${currentPlayer}/hand/cards/`));
    const canEquip = Boolean(currentPlayer) && selected.length === 1
      && paiKu[selected[0].cardData?.id]?.category === 'equipment'
      && !selected[0].dataset.path?.includes(`/${currentPlayer}/zhuang/cards/`);
    const remoteAreaPanelOpen = this.playerDoms.some(player =>
      !player.classList.contains('current-player')
      && player.shadowRoot?.querySelector('.pai-info:popover-open'));
    const showMainMenu = (isOwnSelection || isDiscardSelection) && !remoteAreaPanelOpen;

    this.classList.toggle('has-card-selection', selected.length > 0);

    this.cardMenu.classList.toggle("hide", !showMainMenu);
    if (showMainMenu) {
      const source = isDiscardSelection ? "弃牌堆" : "自己的牌";
      this.cardMenu.querySelector(".selection-label").textContent = `${source} · ${selected.length} 张`;
      this.cardMenu.querySelectorAll('[data-selection-action]').forEach(button => {
        const action = button.dataset.selectionAction;
        button.hidden = (isDiscardSelection && !['take', 'equip', 'cancel'].includes(action))
          || (['use','convert'].includes(action) && !isOwnSelection)
          || (action === 'equip' && !canEquip)
          || (action === 'take' && hasOnlyOwnHandSelection);
      });
      const showButton = this.cardMenu.querySelector('[data-selection-action="show"]');
      const useButton = this.cardMenu.querySelector('[data-selection-action="use"]');
      if(useButton&&!useButton.hidden){
        useButton.disabled=selected.length!==1;
        useButton.title=selected.length!==1?'“使用”每次只能操作一张实体牌；多牌转化请使用“转化”':'';
      }
      if (showButton && !showButton.hidden) {
        const showStates = new Set(selected.map(card => String(card.cardData?.show || '0') === '1'));
        const mixed = showStates.size > 1;
        showButton.textContent = showStates.has(true) && !mixed ? '暗置' : '亮牌';
        showButton.disabled = mixed;
        showButton.title = mixed ? '请选择亮出状态相同的牌' : '';
      }
    }

    this.playerDoms.forEach(player => player.updateAreaActions?.());
  }
}

export { SgTable };
customElements.define("sg-table", SgTable);
