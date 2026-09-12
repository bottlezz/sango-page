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

const TARGETED_USE_CARDS = new Set(['杀','决斗','过河拆桥','顺手牵羊']);
const INSPECT_HAND_AFTER_USE = new Set(['过河拆桥','顺手牵羊']);

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
    const currentPlayer=this.gameController.currentPlayer;
    const players=[...this.playerDoms].sort((left,right)=>{
      const leftIsSelf=left.dataset.key===currentPlayer;
      const rightIsSelf=right.dataset.key===currentPlayer;
      if(leftIsSelf!==rightIsSelf)return leftIsSelf?-1:1;
      return Number(left.dataset.key.slice(1))-Number(right.dataset.key.slice(1));
    });
    players.forEach(player=>{
      const playerKey=player.dataset.key;
      const isSelf=playerKey===currentPlayer;
      const button=document.createElement('button');button.type='button';button.dataset.player=playerKey;
      const name=player.shadowRoot.querySelector('.player-name')?.textContent?.trim();
      const playerName=document.createElement('b');playerName.textContent=name&&name!=='empty'?name:playerKey;
      const playerMeta=document.createElement('small');playerMeta.textContent=`${playerKey}${isSelf?' · 自己':''}`;
      button.append(playerName,playerMeta);
      options.append(button);
    });
    this.movePlayerPicker.showModal();
  }

  ensureUseCardPicker() {
    if (this.useCardPicker) return;
    this.useCardPicker=document.createElement('dialog');
    this.useCardPicker.className='use-card-picker';
    this.useCardPicker.innerHTML='<header><button type="button" data-use-back hidden>← 返回</button><h3>使用什么牌？</h3><button type="button" data-use-close aria-label="关闭">关闭 ×</button></header><p class="use-summary"></p><div class="use-card-options"></div>';
    this.useCardPicker.querySelector('[data-use-close]').addEventListener('click',()=>this.useCardPicker.close());
    this.useCardPicker.querySelector('[data-use-back]').addEventListener('click',()=>this.renderUseCardChoices());
    this.useCardPicker.querySelector('.use-card-options').addEventListener('click',event=>{
      const cardButton=event.target.closest('[data-use-card]');
      if(cardButton){
        const cardName=cardButton.dataset.useCard;
        if(TARGETED_USE_CARDS.has(cardName))this.renderUseTargets(cardName);
        else this.commitUseCard(cardName);
        return;
      }
      const targetButton=event.target.closest('[data-use-target]');
      if(targetButton)this.commitUseCard(this.pendingUseCardName,targetButton.dataset.useTarget);
    });
    this.useCardPicker.addEventListener('close',()=>{this.pendingUseCards=null;this.pendingUseCardName=null;});
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

  renderUseCardChoices() {
    const picker=this.useCardPicker,options=picker.querySelector('.use-card-options');
    picker.querySelector('h3').textContent='使用什么牌？';
    picker.querySelector('[data-use-back]').hidden=true;
    picker.querySelector('.use-summary').textContent=`以选中的 ${this.pendingUseCards?.length||0} 张牌使用为：`;
    options.replaceChildren(...USE_CARD_NAMES.map(name=>{
      const button=document.createElement('button');button.type='button';button.dataset.useCard=name;button.textContent=name;return button;
    }));
  }

  renderUseTargets(cardName) {
    this.pendingUseCardName=cardName;
    const picker=this.useCardPicker,options=picker.querySelector('.use-card-options');
    picker.querySelector('h3').textContent=`${cardName} · 选择目标`;
    picker.querySelector('[data-use-back]').hidden=false;
    picker.querySelector('.use-summary').textContent='请选择一位目标玩家。';
    const current=this.gameController.currentPlayer;
    const players=this.playerDoms.filter(player=>player.dataset.key!==current&&player.shadowRoot.querySelector('.player-name')?.textContent?.trim()!=='empty');
    options.replaceChildren(...players.map(player=>{
      const key=player.dataset.key,name=player.shadowRoot.querySelector('.player-name')?.textContent?.trim()||key;
      const button=document.createElement('button');button.type='button';button.dataset.useTarget=key;
      const playerName=document.createElement('b');playerName.textContent=name;
      const playerMeta=document.createElement('small');playerMeta.textContent=key;
      button.append(playerName,playerMeta);return button;
    }));
  }

  async commitUseCard(cardName,targetSeat=null) {
    const cards=this.pendingUseCards;
    if(!cards?.length||this.useCardBusy)return;
    this.useCardBusy=true;
    this.useCardPicker.querySelectorAll('button').forEach(button=>button.disabled=true);
    const inspectTargetHand=targetSeat&&INSPECT_HAND_AFTER_USE.has(cardName);
    if(inspectTargetHand){
      const player=this.playerDoms.find(item=>item.dataset.key===targetSeat);
      this.useCardPicker.close();
      player?.openAreaPanel(player.handArea,'手牌');
    }
    try{
      await this.gameController.useSelectedCards(cardName,targetSeat,cards);
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
    const playButton = document.createElement("button");
    playButton.dataset.selectionAction = "play";
    playButton.innerHTML = "打出";
    playButton.addEventListener("click", () => {
      this.gameController.playSelectedCards().catch(error => window.alert(error.message || '移动失败，请重试')); 
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
    useButton.addEventListener('click',()=>this.openUseCardPicker());

    cardMenu.appendChild(playButton);
    cardMenu.appendChild(drawButton);
    cardMenu.appendChild(showButton);
    cardMenu.appendChild(moveButton);
    cardMenu.appendChild(useButton);
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
        button.hidden = (isDiscardSelection && !['take', 'cancel'].includes(action))
          || (action === 'use' && !isOwnSelection)
          || (action === 'take' && hasOnlyOwnHandSelection);
      });
      const showButton = this.cardMenu.querySelector('[data-selection-action="show"]');
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
