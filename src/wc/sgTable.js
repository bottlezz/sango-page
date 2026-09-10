//This file will be the web component
//It only needs to run, not be imported by main.js

import { ref } from "firebase/database";
import { gameController } from "../gameController.js";
import commonCss from "./css/common.css";
import tableCss from "./css/sgTable.css";
import { SgPlayer } from "./sgPlayer.js";
import "./sgJiangArea.js";
import { installCardDrag } from "../cardDrag.js";
import { installActionLog } from './actionLogPanel.js';
import { installPublicTablePanel } from './publicTablePanel.js';
import { installCardTransferAnimation } from './cardTransferAnimation.js';

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
    showButton.innerHTML = "亮牌 / 暗置";
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
    const remoteAreaPanelOpen = this.playerDoms.some(player =>
      !player.classList.contains('current-player')
      && player.shadowRoot?.querySelector('.pai-info:popover-open'));
    const showMainMenu = (isOwnSelection || isDiscardSelection) && !remoteAreaPanelOpen;

    this.cardMenu.classList.toggle("hide", !showMainMenu);
    if (showMainMenu) {
      const source = isDiscardSelection ? "弃牌堆" : "自己的牌";
      this.cardMenu.querySelector(".selection-label").textContent = `${source} · ${selected.length} 张`;
      this.cardMenu.querySelectorAll('[data-selection-action]').forEach(button => {
        const action = button.dataset.selectionAction;
        button.hidden = isDiscardSelection && !['take', 'cancel'].includes(action);
      });
    }

    this.playerDoms.forEach(player => player.updateAreaActions?.());
  }
}

export { SgTable };
customElements.define("sg-table", SgTable);
